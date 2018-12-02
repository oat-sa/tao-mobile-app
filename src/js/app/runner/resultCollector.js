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
 * Collects results during a test.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'moment',
    'core/promise',
    'app/service/result',
    'taoQtiItem/scoring/qtiScorer'
], function(
    _,
    moment,
    Promise,
    resultService,
    scorer
) {
    'use strict';

    /**
     * Createst a result collector
     * @param {String} testId - the identifier of the test (the URI)
     * @param {String} deliveryExecutionId - the delivery execution identifier (the URI)
     * @param {Object} item - all data related to the current item
     * @param {String} item.itemIdentifier - the item identifier within the test
     * @param {Object} item.stats - all item statisitics from the testMap (occurences, viewed, etc.)
     * @param {Object} item.itemData - items data from the itemRunner
     * @param {Object} item.metadata - contains all items metadata, including it's URI
     */
    var resultCollectorFactory = function resultCollectorFactory(testId, deliveryExecutionId, item){

        if(_.isEmpty(testId)){
            throw new TypeError('A valid test id is required to collect results');
        }
        if(_.isEmpty(deliveryExecutionId)){
            throw new TypeError('A valid delivery execution id is required to collect results');
        }
        if( !_.isPlainObject(item) || _.isEmpty(item.itemIdentifier) ||
            !_.isPlainObject(item.itemData) || !_.isPlainObject(item.metadata) ||
            !_.isPlainObject(item.stats) ){

            throw new TypeError('The given item to the result collector is incomplete');
        }

        return {

            /**
             * Get the configured deliveryExecutionId
             * @returns {String} deliveryExecutionId
             */
            getDeliveryExecutionId : function getDeliveryExecutionId(){
                return deliveryExecutionId;
            },

            /**
             * Get an item identifier composed by the deliveryExecution,
             * the item identifier and the number of occurrences
             * @returns {String} the callIdItem
             */
            getCallItemId : function getCallItemId(){
                return deliveryExecutionId + '.' + item.itemIdentifier + '.' + item.stats.occurrence;
            },

            /**
             * Get the item id
             * @returns {String} the URI of the current item
             */
            getItemId : function getItemId(){
                return item && item.metadata && item.metadata.uri;
            },

            /**
             * Get the test id
             * @returns {String} the URI of the current test
             */
            getTestId : function getTestId(){
                return testId;
            },

            /**
             * Add to the results store the outcomes results (score, maxscore, responses)
             * from the test taker responses
             * @param {Object} responses - PCI formatted responses
             * @returns {Promise} resolves once the result variables are created
             */
            addOutcomes : function addOutcomes(responses){
                var self = this;

                var supportedOutcomes = ['SCORE', 'MAXSCORE'];

                return new Promise(function(resolve, reject){
                    scorer('qti')
                        .on('error', reject)
                        .on('outcome', function(outcomes, state){
                            var responsesDeclarations = _.pluck(item.itemData.data.responses, 'identifier');
                            Promise.all( _.map(state, function(variable, identifier){
                                if(_.contains(supportedOutcomes, identifier)){
                                    return resultService.createFromOutcome(
                                        self.getDeliveryExecutionId(),
                                        self.getTestId(),
                                        self.getItemId(),
                                        self.getCallItemId(),
                                        identifier,
                                        variable.value
                                    );
                                }
                                if(_.contains(responsesDeclarations, identifier)){
                                    return resultService.createFromResponse(
                                        self.getDeliveryExecutionId(),
                                        self.getTestId(),
                                        self.getItemId(),
                                        self.getCallItemId(),
                                        {
                                            identifier: identifier,
                                            baseType  : variable.baseType,
                                            cardinality : variable.cardinality,
                                            value  :  variable.value
                                        }
                                    );
                                }
                            }))
                            .then(resolve)
                            .catch(reject);
                        })
                        .process(responses, item.itemData.data);
                });
            },

            /**
             * Add to the results store the item duration
             * @param {Number} duration - in seconds
             * @returns {Promise} resolves once the result variables are created
             */
            addDuration: function addDuration(duration){
                if(_.isNumber(duration) && duration > 0){
                    return resultService.createFromDuration(
                        this.getDeliveryExecutionId(),
                        this.getTestId(),
                        this.getItemId(),
                        this.getCallItemId(),
                        moment.duration(duration, 'seconds').toISOString()
                    );
                }
            },

            /**
             * Add to the results store a variable stating the item is completed
             * @returns {Promise} resolves once the result variables are created
             */
            addCompletion: function addCompletion(){
                return resultService.createFromCompletion(
                    this.getDeliveryExecutionId(),
                    this.getTestId(),
                    this.getItemId(),
                    this.getCallItemId(),
                    'completed'
                );
            },

            /**
             * Add to the results store the number of attempts for this item
             * @param {Number} attemps - the number of attempts
             * @returns {Promise} resolves once the result variables are created
             */
            addAttempts: function addAttempts(attempts){
                return resultService.createFromAttempt(
                    this.getDeliveryExecutionId(),
                    this.getTestId(),
                    this.getItemId(),
                    this.getCallItemId(),
                    attempts || 1
                );
            }
        };
    };
    return resultCollectorFactory;
});
