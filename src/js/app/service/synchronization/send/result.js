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
 * Synchronization Provider for results
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/deliveryExecution',
    'app/service/synchronization/client',
], function(_, deliveryExecutionService, syncClientFactory){
    'use strict';

    var resourceType = 'result';

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
         * Get all local deliveries
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){
            return deliveryExecutionService.getAllByState(deliveryExecutionService.states.finished)
                .then( function(executions){
                    console.log("FOUND EXECUTIONS", executions);
                });
        },

        /**
         * Add a delivery
         * @param {String} id - the identifier of the result to send
         * @param {Object} resource - the delivery data
         * @returns {Promise<Boolean>} true id added
         */
        sendResource : function sendResource(id){

            return Promise.resolve(true);
        },


        /**
         * Remove a delivery
         * @param {String} id - the identifier of the delivery to delete
         * @returns {Promise<Boolean>} true id removed
         */
        removeResource : function removeResource(id){

            return Promise.resolve(true);
        }
    };
});

