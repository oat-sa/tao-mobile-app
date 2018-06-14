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
 * Synchronize test takers.
 *
 * TODO this could be generalized for any resource type
 * TODO report progress, through events
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promiseQueue',
    'core/logger',
    'app/service/user',
    'app/service/dataMapper/user',
    'app/service/synchronization/client'
], function(_, loggerFactory, promiseQueueFactory, userService, userDataMapper, syncClientFactory){
    'use strict';

    var logger  = loggerFactory('app/service/synchronization/testTaker');

    var resourceType = 'test-taker';

    /**
     * we will load resouces by batch of 10
     */
    var chunkSize    = 10;


    /**
     * From a unique array of ids we create multiples array
     * of the chunk size
     * @param {String[]} ids - the list of all ids
     * @returns {Array[]} ids spread over small array of the chunkSize
     */
    var getIdsChunks = function getIdsChunks(ids){
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
     * Perform the synchronization
     * @param {Object} config
     * @param {String} config.key - the OAuth key linked to the syncManager profile
     * @param {String} config.secret - the OAuth secret  linked to the syncManager profile
     * @returns {Promise<Object>} - resolves with the sync stats
     */
    return function synchronize(config){

        var client = syncClientFactory(config);

        var promiseQueue  = promiseQueueFactory();


        logger.info('Start fetching remote ids and retrieving users from the local db');

        // 1st step check the list of what to be synchronized
        // and load all users from DB to compare
        return Promise.all([
            client.getEntityIds(resourceType),
            userService.getAllByRole('testTaker')
        ]).then(function(results){

            //will contain the list of remote testTakers' id
            var entityIds;

            //will contain the list of local users
            var users;

            var syncActions = {
                add : [],
                update : [],
                remove : []
            };

            if(results && results.length === 2){

                entityIds = results[0];

                //re-index users by id
                if(_.isArray(results[1])){
                    users = _.reduce(results[1], function(acc, user){
                        if(user && user.id){
                            acc[user.id] = user;
                        }
                        return acc;
                    }, {});
                } else {
                    users = results[1];
                }

                logger.info(_.size(entityIds) +  ' remote test takers found');
                logger.info(_.size(users) +  ' local test takers found');

                //check if testTakers needs to be updated, added or removed
                _.forEach(entityIds, function(entity, id){
                    if(users[id]){
                        if(users[id].checksum && !_.isEmpty(users[id].checksum) && users[id].checksum !== entity.checksum){
                            if(syncActions.update.indexOf(id) < 0){
                                syncActions.update.push(id);
                            }
                        }
                        //all users not in the entity list will be removed,
                        users[id].sync = true;
                    } else {
                        if(syncActions.add.indexOf(id) < 0){
                            syncActions.add.push(id);
                        }
                    }
                });

                syncActions.remove = _(users).reject({ sync : true }).pluck('id').value();

                //force memory free
                users = null;

                //we have the list of who to add to remove or update
                return syncActions;
            }
        })
        .then(function(syncActions){

            if(syncActions){

                //1 remove
                logger.info(syncActions.remove.length + ' test takers to remove');

                _.forEach(syncActions.remove, function(id){
                    promiseQueue.serie(function removeUser() {
                        logger.debug('removing test taker ' + id);
                        return userService.remove(id);
                    });
                });

                //2 update
                logger.info(syncActions.update.length + ' test takers to update');

                _.forEach(getIdsChunks(syncActions.update), function(ids){
                    promiseQueue.serie(function updateUsers(){

                        logger.debug('fetch user content for ' +  ids.join(','));
                        return client.getEntitiesContent(resourceType, ids)
                            .then(function(entities){
                                var updateQueue = promiseQueueFactory();
                                _.forEach(entities, function(entity){
                                    updateQueue.serie(function updateUser(){
                                        logger.debug('updating user', entity.id);
                                        return userService.update(userDataMapper(entity));
                                    });
                                });
                                return updateQueue;
                            });
                    });
                });

                //3 add
                logger.info(syncActions.add.length + ' test takers to add');

                _.forEach(getIdsChunks(syncActions.add), function(ids){
                    promiseQueue.serie(function addUsers(){

                        logger.debug('fetch user content for ' +  ids.join(','));
                        return client.getEntitiesContent(resourceType, ids)
                            .then(function(entities){
                                var addQueue = promiseQueueFactory();
                                _.forEach(entities, function(entity){
                                    addQueue.serie(function addUser(){

                                        logger.debug('adding user', entity.id);
                                        return userService.set(userDataMapper(entity));
                                    });
                                });
                                return addQueue;
                            });
                    });
                });

                return syncActions;
            }
        });
    };
});

