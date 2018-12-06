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
 * Service that manages results.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/storeService',
    'app/core/timestamp',
    'lib/uuid'
], function(_, storeServiceFactory, timestampHelper, uuid){
    'use strict';

    var types = {
        outcome  : 'taoResultServer_models_classes_OutcomeVariable',
        response : 'taoResultServer_models_classes_ResponseVariable',
        trace    : 'taoResultServer_models_classes_TraceVariable'
    };

    /**
     * A result instance
     * @typedef {Object} result
     * @param {String} id - unique result identifier
     * @param {String} deliveryExecutionId - the identifier of the execution
     * @param {String} type - the variable type
     * @param {String} testId - the URI/idenfier of the test
     * @param {String} [callTestId = null] - the identifier of the test call id
     * @param {String} itemId - the URI/idenfier of the item
     * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
     * @param {Object} data - the result variable data
     * @param {String} data.identifer - the identifier of the variable
     * @param {String} data.cardinality - the variable cardinality (QTI)
     * @param {String} data.baseType - the variable baseType (QTI)
     * @param {Object|Array|String|Number} data.value - the variable value
     * @param {Number} data.epoch - the microsecond timestamp the response has been submitted
     */

    /**
     * Validates a delivery execution object
     * @param {deliveryExecution} deliveryExecution
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the delivery execution doesn't match the expectations
     */
    var validateResult = function validateResult(result){
        if(!_.isPlainObject(result)){
            throw new TypeError('Missing or invalid delivery execution');
        }
        if(_.isEmpty(result.id)){
            throw new TypeError('A result needs to have a property id');
        }
        if(_.isEmpty(result.deliveryExecutionId)){
            throw new TypeError('A result needs to have a property deliveryExecutionId');
        }
        if(_.isEmpty(result.callIdItem)){
            throw new TypeError('A result needs to have a property deliveyExecutionId');
        }
        if(!_.contains(types, result.type)) {
            throw new TypeError('A result needs to have a valid property type');
        }
        if(!result.callIdItem && !result.callTestId) {
            throw new TypeError('A result needs to have at least one of the callIdItem or callTestId property');
        }
        if(!_.isPlainObject(result.data)){
            throw new TypeError('A result needs to have a valid data property');
        }
        if(_.isEmpty(result.data.identifier) || _.isEmpty(result.data.cardinality) || _.isEmpty(result.data.baseType)){
            throw new TypeError('A result needs to have a valid variable with an identifier, a cardinalty and a baseType');
        }
        if(!/^\d+.\d{4,8} \d{10}$/.test(result.data.epoch)){
            throw new TypeError('A result needs to have a valid epoch using the microtime format');
        }
        return true;
    };

    var storeService = storeServiceFactory('result', 'result', validateResult);


    /**
     * @typedef {Object} resultService
     */
    return _.assign(storeService, {

        /**
         * Create a result from a variable
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} type - the variable type
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {Object} data - the result variable data
         * @param {String} data.identifer - the identifier of the variable
         * @param {String} data.cardinality - the variable cardinality (QTI)
         * @param {String} data.baseType - the variable baseType (QTI)
         * @param {Object|Array|String|Number} data.value - the variable value
         * @returns {Promise<result>} resolves with the created result
         */
        create : function create(deliveryExecutionId, type, testId, itemId, callIdItem, variable){
            var result;
            var resultData;

            //minimal checks
            if(!_.isString(deliveryExecutionId) ||
               !_.isString(callIdItem) ||
               !_.isString(itemId) ||
               !_.isString(testId) ||
               !_.contains(types, type) ||
               !_.isPlainObject(variable) ||
               !_.isString(variable.identifier) ||
               !_.isString(variable.baseType) ||
               !_.isString(variable.cardinality) ) {

                return Promise.reject(
                    new TypeError('Invalid parameters to create a result variable')
                );
            }

            resultData = {
                identifier:  variable.identifier,
                cardinality: variable.cardinality,
                baseType:    variable.baseType,
                epoch:       timestampHelper.toMicrotime()
            };
            if(type === types.response){
                resultData.correctResponse  = null;
                resultData.candidateResponse = window.btoa(variable.value);
            }
            if(type === types.outcome){
                resultData.normalMaximum = null;
                resultData.normalMinimum = null;
                resultData.value         = window.btoa(variable.value);
            }
            result = {
                id:                  uuid(),
                deliveryExecutionId: deliveryExecutionId,
                type:                type,
                callIdItem:          callIdItem,
                callTestId:          null,
                item:                itemId,
                test:                testId,
                data:                resultData
            };
            return this.set(result).then(function(created){
                if(created){
                    return result;
                }
                return null;
            });
        },

        /**
         * Create a result from a response
         *
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {Object} response - the response variabel
         * @param {String} response.identifer - the identifier of the variable
         * @param {String} response.cardinality - the variable cardinality (QTI)
         * @param {String} response.baseType - the variable baseType (QTI)
         * @param {Object|Array|String|Number} response.value - the variable value
         * @returns {Promise<result>} resolves with the created result
         */
        createFromResponse : function createFromResponse(deliveryExecutionId, testId, itemId, callIdItem, response){
            return this.create(
                deliveryExecutionId,
                types.response,
                testId,
                itemId,
                callIdItem,
                response
            );
        },

        /**
         * Create a result from an outcome
         * Only single float outcomes are supported for now.
         *
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {String} identifer - the identifier of the variable
         * @param {Number} value - the variable value
         * @returns {Promise<result>} resolves with the created result
         */
        createFromOutcome : function createFromOutcome(deliveryExecutionId, testId, itemId, callIdItem, identifier, value){
            return this.create(
                deliveryExecutionId,
                types.outcome,
                testId,
                itemId,
                callIdItem,
                {
                    identifier:  identifier,
                    cardinality: 'single',
                    baseType:    'float',
                    value:       value
                }
            );
        },

        /**
         * Create a result from a duration
         * Only single float outcomes are supported for now.
         *
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {String} duration - the duration formatted  in ISO-8601
         * @returns {Promise<result>} resolves with the created result
         */
        createFromDuration : function createFromDuration(deliveryExecutionId, testId, itemId, callIdItem, duration){
            return this.create(
                deliveryExecutionId,
                types.response,
                testId,
                itemId,
                callIdItem,
                {
                    identifier:  'duration',
                    cardinality: 'single',
                    baseType:    'identifier',
                    value:       duration
                }
            );
        },

        /**
         * Create a result from a number of attempt
         *
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {Number} attempt - the number of attempts
         * @returns {Promise<result>} resolves with the created result
         */
        createFromAttempt : function createFromAttempt(deliveryExecutionId, testId, itemId, callIdItem, attempt){
            return this.create(
                deliveryExecutionId,
                types.response,
                testId,
                itemId,
                callIdItem,
                {
                    identifier:  'numAttempts',
                    cardinality: 'single',
                    baseType:    'identifier',
                    value:       parseInt(attempt || 0, 10)
                }
            );
        },

        /**
         * Create a result from a completion status
         *
         * @param {String} deliveryExecutionId - the identifier of the execution
         * @param {String} testId - the URI/idenfier of the test
         * @param {String} itemId - the URI/idenfier of the item
         * @param {String} callIdItem - the identifier of the item calls id (execution.item-id.occurence)
         * @param {String} completion - the status
         * @returns {Promise<result>} resolves with the created result
         */
        createFromCompletion : function createFromCompletion(deliveryExecutionId, testId, itemId, callIdItem, completion){
            return this.create(
                deliveryExecutionId,
                types.outcome,
                testId,
                itemId,
                callIdItem,
                {
                    identifier:  'completionStatus',
                    cardinality: 'single',
                    baseType:    'identifier',
                    value:       completion
                }
            );
        },

        /**
         * Get a all the results that belong to a delivery execution
         * @param {String} deliveryExecutionId - the delivery execution id
         * @returns {Promise<Object[]>} resolves with the collection of results
         */
        getAllByDeliveryExecution : function getAllByDeliveryExecution(deliveryExecutionId){
            return this.getAll().then(function(results){
                return _.filter(results, { deliveryExecutionId : deliveryExecutionId });
            });
        }
    });
});
