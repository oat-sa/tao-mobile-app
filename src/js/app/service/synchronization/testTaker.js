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
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promiseQueue',
    'app/service/user',
    'app/service/dataMapper/user',
    'app/service/synchronization/client'
], function(_, promiseQueueFactory, userService, userDataMapper, syncClientFactory){
    'use strict';

    var resourceType = 'test-taker';
    var chunkSize    = 10;

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

    return function synchronize(config){

        var promiseQueue  = promiseQueueFactory();
        var client = syncClientFactory(config);

        // 1st step check the list of what to be synchronized
        return Promise.all([
            client.getEntityIds(resourceType),
            userService.getAllByRole('testTaker')
        ]).then(function(results){
            var entityIds;
            var users;
            var syncActions = {
                add : [],
                update : [],
                remove : []
            };
            if(results && results.length === 2){

                entityIds = results[0];

                //index users by id
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

                return syncActions;
            }
        })
        .then(function(syncActions){
            //1 remove
            if(syncActions){
                console.log('Sync actions', syncActions);
                _.forEach(syncActions.remove, function(id){
                    promiseQueue.serie(function removeUser() {
                        console.log('remove user', id);
                        return userService.remove(id);
                    });
                });

                _.forEach(getIdsChunks(syncActions.add), function(ids){
                    promiseQueue.serie(function addUsers(){
                        console.log('fetch user content for ', ids);
                        return client.getEntitiesContent(resourceType, ids)
                            .then(function(entities){
                                console.log('received content for ', ids, entities);
                                var addQueue = promiseQueueFactory();
                                _.forEach(entities, function(entity){
                                    addQueue.serie(function addUser(){
                                        console.log('update user', entity, userDataMapper(entity));
                                        return userService.update(userDataMapper(entity));
                                    });
                                });
                                return addQueue;
                            });
                    });
                });
                _.forEach(getIdsChunks(syncActions.add), function(ids){
                    promiseQueue.serie(function addUsers(){
                        console.log('fetch user content for ', ids);
                        return client.getEntitiesContent(resourceType, ids)
                            .then(function(entities){
                                console.log('received content for ', ids, entities);
                                var addQueue = promiseQueueFactory();
                                _.forEach(entities, function(entity){
                                    addQueue.serie(function addUser(){
                                        console.log('add user', entity, userDataMapper(entity));
                                        return userService.set(userDataMapper(entity));
                                    });
                                });
                                return addQueue;
                            });
                    });
                });

                return promiseQueue;
            }
        })
        .then(function(results){
            console.log('SYNC RESULTS', results);
        });
    };
});

