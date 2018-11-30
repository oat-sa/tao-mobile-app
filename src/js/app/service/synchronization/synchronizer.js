/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA
 *
 */

/**
 * Let's synchronize resources from a remote endpoint.
 * This module provides the synchronization facade,
 * for each resource type, a provider that implements the syncProviderApi needs to be registered.
 *
 * @example
 *
 * synchronizerFactory.registerProvider('foo', {
 *   name : 'foo',
 *   init : function(){ ... },
 *   getRemoteResourceIds : function(){ ... },
 *   ...
 *  });
 *
 *  synchronizerFactory('foo')
 *    .on('progress', ...)
 *    .start()
 *    .then( function (stats) { ... } )
 *    .catch( function (err) { ...  } );
 *
 */
define([
    'lodash',
    'core/eventifier',
    'core/statifier',
    'core/providerRegistry',
    'core/logger'
], function(
    _,
    eventifier,
    statifier,
    providerRegistry,
    loggerFactory
){
    'use strict';

    var logger  = loggerFactory('app/service/synchronization/fetchSynchronizer');

    var directions    = {
        send : 'send',
        fetch: 'fetch'
    };

    var defaultConfig = {

        /**
         * When loading resource content, we ask to
         * load for batches of this size
         */
        chunkSize : 10
    };

    /**
     * Synchronization provider, per resource type
     * @typedef {Object} syncProvider
     * @property {String} name - the resource type / provider name
     * @property {Function} init
     * @property {Function} getRemoteResourceIds
     * @property {Function} getRemoteResources
     * @property {Function} getLocalResources
     * @property {Function} addResource
     * @property {Function} updateResource
     * @property {Function} removeResource
     */

    //Lists the methods of a syncProvider
    var syncProviderApi = {
        fetch : [
            'init',
            'getRemoteResourceIds',
            'getRemoteResources',
            'getLocalResources',
            'addResource',
            'updateResource',
            'removeResource'
        ],
        send : [
            'init',
            'getLocalResources',
            'sendResource',
            'removeResource'
        ]
    };

    /**
     * From a unique array of ids we create multiples array
     * of the chunk size
     * @param {String[]} ids - the list of all ids
     * @param {Number} chunkSize - the size of the chunks
     * @returns {Array[]} ids spread over small array of the chunkSize
     */
    var getIdsChunks = function getIdsChunks(ids, chunkSize){
        return _.reduce(ids, function(acc, id, index){
            var chunkIndex = Math.floor( index / chunkSize);
            if(!acc[chunkIndex]){
                acc[chunkIndex] = [];
            }
            acc[chunkIndex].push(id);
            return acc;
        }, []);
    };

    /**
     * Check if the given parameter is a syncProvider
     * @param {syncProvider} provider
     * @returns {Boolean} true
     * @throws {TypeError} if not valid
     */
    var validateSyncProvider = function validateSyncProvider(provider){
        var isValid = _.isPlainObject(provider)  &&
                      _.isString(provider.name) &&
                      _.isString(directions[provider.direction]) &&
                      _.isArray(syncProviderApi[provider.direction]) &&
                      _.all(syncProviderApi[provider.direction], function(method){
                          return _.isFunction(provider[method]);
                      });

        if(!isValid){
            throw new TypeError('Please register a syncProvider that complies with the API');
        }
        return true;
    };

    /**
     * Get a synchronizer for the given type of resource
     *
     * @param {String} resourceType - the type of resource, it should match the provider name
     * @param {Object} config
     * @param {String} config.key - the OAuth key linked to the syncManager profile
     * @param {String} config.secret - the OAuth secret  linked to the syncManager profile
     * @param {String} [config.direction = fetch] - the sync direction
     * @param {Number} [config.chunkSize] - to change the size of the content load batches
     * @returns {synchronizer} the configured synchronizer
     * @throws {TypeError} if the provider isn't registered or values are missing in the config
     */
    var synchronizerFactory = function synchronizerFactory(resourceType, config) {

        var synchronizer;

        var provider = synchronizerFactory.getProvider(resourceType);

        var stopIfCanceled = function stopIfCanceled(results){
            if(synchronizer.getState('canceled')){
                return Promise.reject({ cancel : true });
            }
            return results;
        };

        if(!provider){
            throw new TypeError('No registered provider for resources of type ' + resourceType);
        }

        config = _.defaults(config || {}, defaultConfig);

        /**
         * @typedef {Object} synchronizer
         */
        synchronizer = statifier(eventifier({

            /**
             * Exposes the logger, mostly for the providers
             * @returns {logger}
             */
            getLogger : function getLogger(){
                return logger;
            },

            /**
             * Exposes the config, mostly for the providers
             * @returns {Object} the current config
             */
            getConfig : function getConfig(){
                return config;
            },

            /**
             * Start the synchronization
             * @returns {Promise<syncOperations>}
             * @fires synchronizer#progress
             */
            start : function start(){
                var self  = this;

                //prevent running the sync multiple times
                if(this.getState('running')){
                    return Promise.reject(new Error('The synchronization is already running'));
                }
                this.setState('running', true);

                this.trigger('progress', 0);

                //call this.fetch or this.send
                return this[provider.direction]()
                    .then(function(syncOperations){

                        self.setState('running', false)
                            .setState('canceled', false);

                        return syncOperations;
                    })
                    .catch(function(err){
                        self.setState('running', false)
                            .setState('canceled', false);
                        throw err;
                    });
            },

            /**
             * Graceful attempt to stop the current sync.
             * The stop will try to cancel the sync.
             */
            stop : function stop(){
                if(this.getState('running')){
                    this.setState('canceled', true);
                }
                return this;
            },

            /**
             * Fetch sync
             *
             * @returns {Promise<Object>} resolves once the sync is done with the stats
             * @trigger synchronizer#progress
             */
            fetch : function fetch(){
                var self = this;
                var totalOperations = 2;
                var progress = 0;
                var syncOperations = {
                    add    : [],
                    update : [],
                    remove : []
                };

                /**
                 * Internal artifact to update the current progress based on the
                 * number of operations to perform
                 * @param {Number} [completeOperations = 1] - how much new operations get completed
                 */
                var updateProgress = function updateProgress(completedOperations){
                    completedOperations = completedOperations || 1;
                    if(totalOperations > 0){
                        progress += (completedOperations / totalOperations) * 100;
                    }
                    self.trigger('progress', progress);
                };

                // 1st step check the list of what to be synchronized
                // and load all resources from DB to compare
                return Promise
                    .all([
                        provider.getLocalResources.call(this),
                        provider.getRemoteResourceIds.call(this),
                    ])
                    .then( stopIfCanceled )
                    .then(function(results) {

                        if(!results || results.length !== 2){
                            throw new Error('Unable to compute operation from receieved data');
                        }

                        syncOperations =  self.computeNeededOperations(results[0], results[1]);

                        //based on the computed operations we update the total for our progress
                        totalOperations = _.reduce(syncOperations, function(acc, list){
                            acc += list.length;
                            return acc;
                        }, totalOperations);

                        //we consider the 2 provider calls above as 2 operations
                        updateProgress(2, totalOperations);

                        logger.info('[sync ' + provider.direction + '] ' + resourceType + ' : '  +
                            _.map(syncOperations, function(list, key){
                                return key + ' ' + list.length;
                            }).join(',')
                        );
                    })
                    .then( stopIfCanceled )
                    .then(function(){
                        //Remove
                        return Promise.all(
                            _.map(syncOperations.remove, function(id){
                                return provider.removeResource.call(self, id);
                            })
                        );
                    })
                    .then( function(){
                        updateProgress(syncOperations.remove.length);
                    })
                    .then( stopIfCanceled )
                    .then(function(){
                        //Update
                        return Promise.all(
                            _.map(getIdsChunks(syncOperations.update, config.chunkSize), function(ids){
                                return provider.getRemoteResources.call(self, ids)
                                    .then(function(entities){

                                        //then update the batch
                                        return Promise.all(
                                            _.map(entities, function(entity){
                                                return provider.updateResource.call(self, entity.id, entity);
                                            })
                                        );
                                    })
                                    .then(function(){
                                        updateProgress(ids.length);
                                    });
                            })
                        );
                    })
                    .then( stopIfCanceled )
                    .then(function(){

                        //Add
                        return Promise.all(
                            //load resources by batch
                            _.map(getIdsChunks(syncOperations.add, config.chunkSize), function(ids){
                                return provider.getRemoteResources.call(self, ids)
                                    .then(function(entities){

                                        //then add the batch
                                        return Promise.all(
                                            _.map(entities, function(entity){
                                                return provider.addResource.call(self, entity.id, entity);
                                            })
                                        );
                                    })
                                    .then(function(){
                                        updateProgress(ids.length);
                                    });
                            })
                        );
                    })
                    .then(function(){
                        return syncOperations;
                    });
            },

            /**
             * Send sync
             *
             * @returns {Promise<Object>} resolves once the sync is done with the stats
             * @trigger synchronizer#progress
             */
            send : function send(){
                var self  = this;
                var syncOperations = {
                    send : [],
                    remove : []
                };
                return provider.getLocalResources.call(this)
                    .then( stopIfCanceled )
                    .then(function(resources) {
                        self.trigger('progress', 0);
                        return resources;
                    })
                    .then(function(resources){

                        logger.info('[sync ' + provider.direction + '] ' + resourceType + ' : '  + resources.length);
                        //send
                        return Promise.all(_.map(resources, function(resource, index){
                            var id = resource.id;
                            return provider.sendResource.call(self, id, resource)
                                .then( stopIfCanceled )
                                .then(function(success){
                                    if(success){
                                        syncOperations.send.push(id);
                                        return provider.removeResource.call(self, id);
                                    }
                                    return false;
                                })
                                .then(function(success){
                                    if(success){
                                        syncOperations.remove.push(id);
                                    }
                                    self.trigger('progress', (index / resources.length) * 100);
                                });
                        }));
                    })
                    .then(function(){
                        return syncOperations;
                    });
            },

            /**
             * Based on 2 collections of resources,
             * compute the operations needed locally to be up to date.
             *
             * @param {Object[]} localResources - the collection of local resources, indexed by ids
             * @param {Object[]} remoteResources - the collection of remote resources, indexed by ids
             * @returns {syncOperations} contains the ids of the resources, indexed by operation
             */
            computeNeededOperations : function computeNeededOperations(localResources, remoteResources) {
                /**
                 * @typedef {Object} syncOperations
                 * @property {String[]} add - the list of ids to add
                 * @property {String[]} update - the list of ids to update
                 * @property {String[]} remove - the list of ids to remove
                 */
                var syncOperations = {
                    add : [],
                    update : [],
                    remove : []
                };
                if(_.isPlainObject(localResources) && _.isPlainObject(remoteResources)) {

                    _.forEach(remoteResources, function(remoteResource, id){

                        if(localResources[id]){
                            if( localResources[id].checksum &&
                                !_.isEmpty(localResources[id].checksum) &&
                                localResources[id].checksum !== remoteResource.checksum &&
                                syncOperations.update.indexOf(id) < 0 ){

                                //if the resource exists locally but the checksums are
                                //different, we index it in the resource to update
                                syncOperations.update.push(id);
                            }

                            //flag local resources (even if not updated)
                            //so all without the sync flag will be removed
                            localResources[id].sync = true;

                        } else if(syncOperations.add.indexOf(id) < 0){

                            //if the resource doesn't exists locally and isn't already in the
                            //sync list, we add it to the resources to create.
                            syncOperations.add.push(id);
                        }
                    });

                    //based on the sync flag we index resources that will be removed
                    syncOperations.remove = _(localResources).reject({ sync : true }).pluck('id').value();
                }
                return syncOperations;
            }
        }));

        provider.init.call(synchronizer, config);

        return synchronizer;
    };

    //bind the provider registration capabilities
    return providerRegistry(synchronizerFactory, validateSyncProvider);
});

