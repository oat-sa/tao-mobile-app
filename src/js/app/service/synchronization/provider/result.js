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
    'app/service/synchronization/client',
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
         * Get all executions in finished state and not synchrnoized
         * @returns {Promise<Object>} resolves with the collection, indexed by id
         */
        getLocalResources : function getLocalResources(){

            return deliveryExecutionService
                .getAllByState(deliveryExecutionService.states.finished)
                .then(function(executions){
                    return _.reject(executions, 'synchronized');
                });
        },

        /**
         * Add a delivery
         * @param {String} id - the identifier of the result to send
         * @param {Object} resource - the delivery data
         * @returns {Promise<Boolean>} true id added
         */
        sendResource : function sendResource(id, resource){
            return resultService.getAllByDeliveryExecution(id)
                .then(function(results){

                    var content = {};

                    console.log('RESULTS for ' + id);
                    console.log(results);
                    console.log('>>>>>>>>>>');

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
                    return this.client.sendResults({
                        results : content
                    });
                });
        },


        /**
         * Remove a delivery
         * @param {String} id - the identifier of the delivery to delete
         * @returns {Promise<Boolean>} true id removed
         */
        removeResource : function removeResource(id){
            console.log('CALL REMOVE FOR RESULT FROM DELIVERY EXEC ', id);
            return Promise.resolve(true);
        }
    };
});

