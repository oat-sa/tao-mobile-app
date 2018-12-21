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
 * Synchronization Provider for eligibilities
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/eligibility',
    'app/service/dataMapper/eligibility',
    'app/service/synchronization/client'
], function(_, eligibilityService, eligibilityDataMapper, syncClientFactory){
    'use strict';

    var resourceType = 'eligibility';

    /**
     * Implements the syncProviderApi to sync eligibilities
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
         * Call the client to get the list of remote eligibilities,
         * This list contains only ids and checksums
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResourceIds : function getRemoteResourceIds(){
            return this.client.getEntityIds(resourceType);
        },

        /**
         * Call the client to retrieve remote resources from their id
         * @param {String[]} ids - the ids of the eligibility to retrieve
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getRemoteResources : function getRemoteResources(ids){
            return this.client.getEntitiesContent(resourceType, ids);
        },

        /**
         * Get all local eligibilities
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){
            return eligibilityService.getAll().then( function(results){
                var eligibilities;

                //an object with ids as key is required to compute sync operations
                if(_.isArray(results)){
                    eligibilities = _.reduce(results, function(acc, eligibility){
                        if(eligibility && eligibility.id){
                            acc[eligibility.id] = eligibility;
                        }
                        return acc;
                    }, {});
                } else {
                    eligibilities = results;
                }
                return eligibilities;
            });
        },

        /**
         * Add a eligibility
         * @param {String} id - the identifier of the eligibility to add
         * @param {Object} resource - the eligibility data
         * @returns {Promise<Boolean>} true id added
         */
        addResource : function addResource(id, resource){
            return eligibilityService.set(eligibilityDataMapper(resource));
        },

        /**
         * Update a eligibility
         * @param {String} id - the identifier of the eligibility to add
         * @param {Object} resource - the new eligibility data
         * @returns {Promise<Boolean>} true id updated
         */
        updateResource : function updateResource(id, resource){
            return eligibilityService.update(id, eligibilityDataMapper(resource));
        },

        /**
         * Remove a eligibility
         * @param {String} id - the identifier of the eligibility to delete
         * @returns {Promise<Boolean>} true id removed
         */
        removeResource : function removeResource(id){
            return eligibilityService.remove(id);
        }
    };
});

