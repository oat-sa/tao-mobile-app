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
 * Synchronization Provider for deliveries
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/delivery',
    'app/service/dataMapper/delivery',
    'app/service/synchronization/client'
], function(_, deliveryService, deliveryDataMapper, syncClientFactory){
    'use strict';

    var resourceType = 'delivery';

    /**
     * Implements the syncProviderApi to sync deliveries
     */
    return {

        /**
         * the provider name
         */
        name : resourceType,

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
         * Call the client to get the list of remote deliveries,
         * This list contains only ids and checksums
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResourceIds : function getRemoteResourceIds(){
            return this.client.getEntityIds(resourceType);
        },

        /**
         * Call the client to retrieve remote resources from their id
         * @param {String[]} ids - the ids of the delivery to retrieve
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResources : function getRemoteResources(ids){
            return this.client.getEntitiesContent(resourceType, ids);
        },

        /**
         * Get all local deliveries
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){
            return deliveryService.getAll().then( function(results){
                var deliveries;

                //an object with ids as key is required to compute sync operations
                if(_.isArray(results)){
                    deliveries = _.reduce(results, function(acc, user){
                        if(user && user.id){
                            acc[user.id] = user;
                        }
                        return acc;
                    }, {});
                } else {
                    deliveries = results;
                }
                return deliveries;
            });
        },

        /**
         * Add a delivery
         * @param {String} id - the identifier of the delivery to add
         * @param {Object} resource - the delivery data
         * @returns {Promise<Boolean>} true id added
         */
        addResource : function addResource(id, resource){
            return deliveryService.set(deliveryDataMapper(resource));
        },

        /**
         * Update a delivery
         * @param {String} id - the identifier of the delivery to update
         * @param {Object} resource - the new delivery data
         * @returns {Promise<Boolean>} true id updated
         */
        updateResource : function updateResource(id, resource){
            return deliveryService.update(deliveryDataMapper(resource));
        },

        /**
         * Remove a delivery
         * @param {String} id - the identifier of the delivery to delete
         * @returns {Promise<Boolean>} true id removed
         */
        removeResource : function removeResource(id){
            return deliveryService.remove(id);
        }
    };
});

