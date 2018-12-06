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
 * Synchronization Provider for test takers
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

    /**
     * Implements the syncProviderApi to sync test takers
     */
    return {

        /**
         * the provider name
         */
        name : resourceType,

        /**
         * Sync direction
         */
        direction : 'fetch',

        /**
         * Provider initialization
         * @param {Object} config
         * @param {String} config.key - the OAuth key linked to the syncManager profile
         * @param {String} config.secret - the OAuth secret  linked to the syncManager profile
         * @throws {TypeError} if the OAuth info are missing
         */
        init : function init(config){
            this.client = syncClientFactory(config);
        },

        /**
         * Call the client to get the list of remote test takers,
         * This list contains only ids and checksums
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResourceIds : function getRemoteResourceIds(){
            return this.client.getEntityIds(resourceType);
        },

        /**
         * Call the client to retrieve remote resources from their id
         * @param {String[]} ids - the ids of the test taker to retrieve
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResources : function getRemoteResources(ids){
            return this.client.getEntitiesContent(resourceType, ids);
        },

        /**
         * Get all local test takers
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){
            return userService
                .getAllByRole('testTaker')
                .then( function(results){
                    var users;

                    //an object with ids as key is required to compute sync operations
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

        /**
         * Add a test taker
         * @param {String} id - the identifier of the test taker to add
         * @param {Object} resource - the test taker data
         * @returns {Promise<Boolean>} true id added
         */
        addResource : function addResource(id, resource){
            return userService.set(userDataMapper(resource));
        },

        /**
         * Update a test taker
         * @param {String} id - the identifier of the test taker to add
         * @param {Object} resource - the new test taker data
         * @returns {Promise<Boolean>} true id updated
         */
        updateResource : function updateResource(id, resource){
            return userService.update(id, userDataMapper(resource));
        },

        /**
         * Remove a test taker
         * @param {String} id - the identifier of the test taker to delete
         * @returns {Promise<Boolean>} true id removed
         */
        removeResource : function removeResource(id){
            return userService.remove(id);
        }
    };
});

