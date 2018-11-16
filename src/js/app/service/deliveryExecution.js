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
 * Service that manages delivery executions.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/storeService',
    'app/core/uri'
], function(_, storeServiceFactory, uri){
    'use strict';

    var states = {
        active:    'active',
        finished:  'finished',
        paused:    'paused',
        abandoned: 'abandoned'
    };

    /**
     * Definition of a minimal delivery execution as seen by the service
     * @typedef {Object} deliveryExecution
     * @param {String} id - the execution unique identifier
     * @param {String} deliveryId - the id of the linked delivery
     * @param {String} testTakerId - the id of the linked test taker
     * @param {String} state - one of the valid state
     * @param {Number?} startTime - the microsecond timestamp the execution get started
     * @param {Number?} finishTime - the microsecond timestamp the execution finished
     */

    /**
     * Validates a delivery execution object
     * @param {deliveryExecution} deliveryExecution
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the delivery execution doesn't match the expectations
     */
    var validateDeliveryExecution = function validateDeliveryExecution(deliveryExecution){
        if(!_.isPlainObject(deliveryExecution)){
            throw new TypeError('Missing or invalid delivery execution');
        }
        if(_.isEmpty(deliveryExecution.id)){
            throw new TypeError('A delivery execution needs to have a property id');
        }
        if(_.isEmpty(deliveryExecution.delivery)){
            throw new TypeError('A delivery execution needs to have a property delivery');
        }
        if(_.isEmpty(deliveryExecution.testTaker)){
            throw new TypeError('A delivery execution needs to have a property testTaker');
        }
        if(!states[deliveryExecution.state]){
            throw new TypeError('A delivery execution needs to have a valid property state');
        }
        return true;
    };

    var storeService = storeServiceFactory('delivery execution', 'deliveyExecution', validateDeliveryExecution);

    /**
     * @typedef {Object} deliveryExecutionService
     */
    return _.assign(storeService, {

        /**
         * Expose the available states
         * @property {Object}
         */
        states : states,

        /**
         * Create a new delivery execution for a delivery and a test taker.
         * The execution starts now, in active state.
         * @param {String} deliveryId - the id of the linked delivery
         * @param {String} testTakerId - the id of the linked test taker
         *
         * @returns {Promise<deliveryExecution>} resolves with the new delivery execution
         */
        create : function create(deliveryId, testTakerId){
            var deliveyExecution = {
                id:         uri.create(),
                delivery:   deliveryId,
                testTaker:  testTakerId,
                state:      states.active,
                startTime:  Date.now(),
                finishTIme: null
            };

            return this.set(deliveyExecution).then(function(inserted){
                if(inserted){
                    return deliveyExecution;
                }
                return false;
            });
        },

        /**
         * Pause a delivery execution
         * @param {String} deliveyExecutionId - the id of the delivery execution
         *
         * @returns {Promise<Boolean>} resolves with true if the execution get updated
         */
        pause : function pause(deliveyExecutionId){
            return this.update(deliveyExecutionId, {
                state: states.paused
            });
        },

        /**
         * Finish a delivery execution
         *
         * @param {String} deliveyExecutionId - the id of the delivery execution
         *
         * @returns {Promise<Boolean>} resolves with true if the execution get updated
         */
        finish : function finish(deliveyExecutionId){
            return this.update(deliveyExecutionId, {
                state:      states.finished,
                finishTime: Date.now()
            });
        },

        /**
         * Get all delivery executions matching the given state
         * @param {String} state
         * @returns {Promise<Object[]>} resolves with the list of executions
         */
        getAllByState : function getAllByState(state){
           return this.getAll().then(function(executions){
                return _.filter(executions, { state : state} );
           });
        }
    });
});

