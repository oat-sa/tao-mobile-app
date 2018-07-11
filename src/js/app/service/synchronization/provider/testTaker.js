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
    'app/service/user',
    'app/service/dataMapper/user',
    'app/service/synchronization/client'
], function(_, userService, userDataMapper, syncClientFactory){
    'use strict';

    var resourceType = 'test-taker';

    return {
        name : resourceType,
        init : function init(config){
            this.client = syncClientFactory(config);
        },
        getRemoteResourceIds : function getRemoteResourceIds(){
            return this.client.getEntityIds(resourceType);
        },
        getRemoteResources : function getRemoteResources(ids){
            return this.client.getEntitiesContent(resourceType, ids);
        },
        getLocalResources : function getLocalResources(){
            return userService
                .getAllByRole('testTaker')
                .then( function(results){
                    var users;

                    //an objet with ids as keys is required for sync operations
                    if(_.isArray(results)){
                        users = _.reduce(results, function(acc, user){
                            if(user && user.id){
                                acc[user.id] = user;
                            }
                            return acc;
                        }, {});
                    } else {
                        users = results;
                    }
                    return users;
                });
        },
        addResource : function addResource(id, user){
            return userService.set(userDataMapper(user));
        },
        updateResource : function updateResource(id, user){
            return userService.update(userDataMapper(user));
        },
        removeResource : function removeResource(id){
            return userService.remove(id);
        }
    };
});

