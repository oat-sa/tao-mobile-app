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
 * Let's synchronize resources to a remote endpoint.
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

    var logger  = loggerFactory('app/service/synchronization/sendSynchronizer');

    var defaultConfig = {
    };

    /**
     * Synchronization provider, per resource type
     * @typedef {Object} syncProvider
     * @property {String} name - the resource type / provider name
     * @property {Function} init
     * @property {Function} getLocalResources
     * @property {Function} sendResource
     * @property {Function} removeResource
     */

    //Lists the methods of a syncProvider
    var syncProviderApi = [
        'init',
        'getLocalResources',
        'sendResource',
        'removeResource'
    ];


    /**
     * Check if the given parameter is a syncProvider
     * @param {syncProvider} provider
     * @returns {Boolean} true
     * @throws {TypeError} if not valid
     */
    var validateSyncProvider = function validateSyncProvider(provider){
        var isValid = _.isPlainObject(provider) && _.all(syncProviderApi, function(method){
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
     * @returns {synchronizer} the configured synchronizer
     * @throws {TypeError} if the provider isn't registered or values are missing in the config
     */
    var synchronizerFactory = function synchronizerFactory(resourceType, config) {

        var synchronizer;

        var provider = synchronizerFactory.getProvider(resourceType);

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

                var totalOperations = 0;
                var progress        = 0;

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

                /**
                 * Internal artifact to interrupt the promise chain
                 * number of operations to perform
                 * @param {*} results - to chain the promise results
                 * @returns {*} the results parameter or reject the promise
                 */
                var stopIfCanceled = function stopIfCanceled(results){
                    if(self.getState('canceled')){
                        return Promise.reject({ cancel : true });
                    }
                    return results;
                };

                //prevent running the sync multiple times
                if(this.getState('running')){
                    return Promise.reject(new Error('The synchronization is already running'));
                }
                this.setState('running', true);

                this.trigger('progress', 0);

                // 1st step check the list of what to be synchronized
                // and load all resources from DB to compare
                return provider.getLocalResources.call(this),
                    .then( stopIfCanceled )
                    .then(function(resources) {

                        //2 operation per resource : send and remove
                        totalOperations = resources.length;

                        updateProgress(0);
                    })
                    .then( stopIfCanceled )
                    .then(function(){
                        var counter = 0;
                        //send
                        return Promise.all(
                            _.map(resources, function(id){
                                return provider.sendResource.call(self, id)
                                    .then( stopIfCanceled )
                                    .then(function(success){
                                        if(success){
                                            counter++;
                                            return provider.removeResource.call(self, id);
                                        }
                                    })
                                    .then(function(){
                                        updateProgress(counter)
                                    });
                            })
                        );
                    })
                    .then(function(){

                        self.trigger('progress', progress );

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

        }));

        provider.init.call(synchronizer, config);

        return synchronizer;
    };

    //bind the provider registration capabilities
    return providerRegistry(synchronizerFactory, validateSyncProvider);
});

