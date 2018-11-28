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
 * Experimental app proxy, it reads the data from the filesystem and save state to the store.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'moment',
    'core/promise',
    'core/logger',
    'app/service/result',
    'taoQtiItem/scoring/qtiScorer'
], function(
    _,
    moment,
    Promise,
    loggerFactory,
    resultService,
    scorer
) {
    'use strict';

    var logger = loggerFactory('runner/local/proxy');

    var resultCollectorFactory = function resultCollectorFactory(testId, deliveryExecutionId, item){

        console.log('ITEM', item);

        return {

            getDeliveryExecutionId : function getDeliveryExecutionId(){
                return deliveryExecutionId;
            },

            getCallItemId : function getCallItemId(){
                return deliveryExecutionId + '.' + item.itemIdentifier + '.' + item.stats.occurrence;
            },

            getItemId : function getItemId(){
                return item && item.metadata && item.metadata.uri;
            },

            getTestId : function getTestId(){
                return testId;
            },

            addOutcomes : function addOutcomes(responses){
                var self = this;

                var supportedOutcomes = ['SCORE', 'MAXSCORE'];

                return new Promise(function(resolve, reject){
                    scorer('qti')
                        .on('error', reject)
                        .on('outcome', function(outcomes, state){
                            var responsesDeclarations = _.pluck(item.itemData.data.responses, 'identifier');

                            console.log('DECLARATIOn', responsesDeclarations);
                            console.log('OUTCOMES', outcomes);
                            console.log('STATE', state);
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

            addCompletion: function addCompletion(){
                return resultService.createFromCompletion(
                    this.getDeliveryExecutionId(),
                    this.getTestId(),
                    this.getItemId(),
                    this.getCallItemId(),
                    'completed'
                );
            },

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
