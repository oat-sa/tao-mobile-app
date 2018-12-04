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
    'app/core/timestamp',
    'app/service/deliveryExecution',
    'app/service/result',
    'app/service/synchronization/client'
], function(_, timestampHelper,  deliveryExecutionService, resultService, syncClientFactory){
    'use strict';

    //yes the API define the type in plural for results
    var resourceType = 'results';

    /**
     * Implements the syncProviderApi to sync deliveries
     */
    return {

        /**
         * the provider name
         */
        name : resourceType,

        /**
         * Sync direction
         */
        direction : 'send',

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
         * Get all executions in finished state and not synchronized
         * We will then send results for this delivery execution.
         *
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){
            return deliveryExecutionService.getAllToSync();
        },

        /**
         * Send delivery execution's results
         *
         * @param {String} id - the identifier of the delivery execution
         * @param {Object} resource - the execution resource
         * @returns {Promise<Boolean>} true id sent
         */
        sendResource : function sendResource(id, resource){
            var self = this;
            return resultService.getAllByDeliveryExecution(id)
                .then(function(results){

                    var content = {};

                    content[id] =  {
                        deliveryId : resource.delivery,
                        deliveryExecutionId : id,
                        details : {
                            identifier:   id,
                            label:        resource.label,
                            'test-taker': resource.testTaker,
                            state:        resource.state,
                            starttime:    timestampHelper.toMicrotime(resource.startTime),
                            finishtime:   timestampHelper.toMicrotime(resource.finishTime)
                        },
                        variables : results
                    };

                    return content;
                })
                .then(function(content){
                    return self.client.sendResults({
                        results : content
                    });
                })
                .then(function(response){
                    return response && response.success && response.data[id] && response.data[id].success;
                });
        },


        /**
         * Removes the delivery execution's results
         * @param {String} id - the identifier of the delivery execution
         * @returns {Promise<Boolean>} true if the results are removed
         */
        removeResource : function removeResource(id){
            return deliveryExecutionService.getById(id)
                .then(function(execution){
                    execution.synchronized = true;
                    return deliveryExecutionService.set(execution);
                })
                .then(function(){
                    return resultService.getAllByDeliveryExecution(id);
                })
                .then(function(results){
                    return Promise.all(_.map(results, function(result){
                        return resultService.remove(result.id);
                    }));
                })
                .then(function(removed){
                    return _.all(removed);
                });
        }
    };
});

