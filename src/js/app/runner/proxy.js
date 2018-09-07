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
    'jquery',
    'lodash',
    'i18n',
    'context',
    'core/promise',
    'core/store',
    'core/logger',
    'app/service/deliveryAssembly',
    'taoQtiTest/runner/navigator/navigator',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/helpers/navigation',
    'taoQtiTest/runner/provider/dataUpdater',
    'taoQtiTest/runner/proxy/cache/itemStore'
], function($, _, __, context, Promise, store, loggerFactory, deliveryAssemblyService, testNavigatorFactory, mapHelper, navigationHelper, dataUpdater, itemStoreFactory) {
    'use strict';

    var logger = loggerFactory('runner/local/proxy');

    var proxy = {

        /**
         * Install behavior on the proxy
         */
        install: function install(config) {

            /**
             * Load the content of the given delivery URL
             * @param {String} url - the path to the file within the assembly
             * @returns {Promise<Object>} resolve with the parsed content of the JSON file
             */
            this.getJsonFile = function getJsonFile(url) {
                return deliveryAssemblyService.readAssemblyFile( config.testDefinition, config.testCompilation, url, false)
                    .then(function(content){
                        return JSON.parse(content);
                    });
            };

            /**
             * Get the baseUrl from the assembly root
             * @returns {Promise<String>} resolves with the baseUrl
             */
            this.getBaseUrl = function getBaseUrl(){
                return deliveryAssemblyService.getAssemblyDirBaseUrl(config.testDefinition, config.testCompilation);
            };
        },

        /**
         * Loads the initial state of the test
         * @param {Object} config - the test configuration
         * @param {Object} [params] - the test configuration
         * @returns {Promise<Object>} the triple <testData,testContext,testMap>
         */
        init: function init(config, params) {
            var self = this;
            var testIdentifier = config.serviceCallId;

            //initialize the stores
            return Promise.all([
                store('results-' + testIdentifier),
                store('test-data-' + testIdentifier)
            ])
            .then(function(results) {
                self.resultStore = results[0];
                self.testDataStore = results[1];

                return self.testDataStore.getItem('testData');
            })
            .then(function(testData) {
                if (testData) {
                    return testData;
                }

                return self.getJsonFile('testData.json');
            })
            .then(function(testData) {
                var itemNumber = 100;
                if (testData && testData.testMap && testData.testMap.stats) {
                    itemNumber = testData.testMap.stats.total;
                }

                logger.info('Set up item store for ' + itemNumber + ' items');

                self.itemStore = itemStoreFactory({
                    maxSize: itemNumber,
                    preload: false,
                    testId: testIdentifier
                });

                return testData;
            });
        },

        /**
         * Destroy the proxy itself
         * @returns {Promise}
         */
        destroy: function destroy() {
            if (this.itemStore) {
                return this.itemStore.clear();
            }
        },

        /**
         * Load the test data
         * @returns {Promise<Object>} the testData
         */
        getTestData: function getTestData() {
            var self = this;
            return this.testDataStore.getItem('testData')
                .then(function(testData) {
                    if (!testData) {
                        return self.getJsonFile('testData.json');
                    }
                    return testData;
                })
                .then(function(testData) {
                    return testData && testData.testData;
                });
        },

        /**
         * Load the test context
         * @returns {Promise<Object>} the testContext
         */
        getTestContext: function getTestContext() {
            var self = this;
            return this.testDataStore.getItem('testData')
                .then(function(testData) {
                    if (!testData) {
                        return self.getJsonFile('testData.json');
                    }
                    return testData;
                })
                .then(function(testData) {
                    return testData && testData.testContext;
                });
        },

        /**
         * Load the test map
         * @returns {Promise<Object>} the testMap
         */
        getTestMap: function getTestMap() {
            var self = this;
            return this.testDataStore.getItem('testData')
                .then(function(testData) {
                    if (!testData) {
                        return self.getJsonFile('testData.json');
                    }
                    return testData;
                })
                .then(function(testData) {
                    return testData && testData.testMap;
                });
        },

        sendVariables: function sendVariables(variables) {
            logger.info('Collected variables : ' + JSON.stringify(variables));
        },

        callTestAction: function callTestAction(action, params) {
            var self = this;
            var saveTestData = function saveTestData() {
                return self.testDataStore.setItem('testData', {
                    testData: self.getDataHolder().get('testData'),
                    testContext: self.getDataHolder().get('testContext'),
                    testMap: self.getDataHolder().get('testMap')
                });
            };
            var actions = {
                flagItem: function flagItem(actionParams) {
                    var testContext = self.getDataHolder().get('testContext');
                    var testMap = self.getDataHolder().get('testMap');
                    if (testContext.itemPosition === actionParams.position) {
                        testContext.itemFlagged = !!actionParams.flag;
                    }
                    mapHelper.getItemAt(testMap, actionParams.position).flagged = !!actionParams.flag;

                    self.getDataHolder().set('testContext', testContext);
                    self.getDataHolder().set('testMap', testMap);

                    return saveTestData();
                }
            };

            if (_.isFunction(actions[action])) {
                return actions[action](params);
            } else {
                logger.warn('Test action action  ' + action + ' is not yet supported');
            }
        },

        /**
         * Get the item data
         * @param {String} itemIdentifier - item unique ID$
         * @param {Object} [params] - additionnal parameters
         * @returns {Promise<Object>} resolves with the item data
         */
        getItem: function getItem(itemIdentifier, params) {
            var self = this;
            if (!this.itemStore || !this.resultStore) {
                return Promise.reject(new Error('Please initiaze the proxy first'));
            }

            return this.resultStore.getItem(itemIdentifier)
                .then(function(storedResults) {
                    return storedResults && storedResults.itemState;
                })
                .then(function(itemState) {

                    //load it from the item store
                    if (self.itemStore.has(itemIdentifier)) {
                        return self.itemStore.get(itemIdentifier).then(function(item) {
                            item.itemState = itemState;
                            return item;
                        });
                    }

                    //load get the json file
                    return self.getJsonFile('items/' + itemIdentifier + '/item.json').then(function(data) {
                        var item;
                        if (data && !data.itemData && data.type && data.type === 'qti') {
                            item = {
                                itemState: itemState,
                                itemIdentifier: itemIdentifier,
                                itemData: data,
                                baseUrl:  '/items/' + itemIdentifier + '/'
                            };
                            if (self.itemStore) {
                                self.itemStore.set(itemIdentifier, item);
                            }

                            return item;
                        }
                        return data;
                    })
                    .then(function(itemData){
                        return self.getBaseUrl().then(function(baseUrl){
                            itemData.baseUrl = baseUrl + itemData.baseUrl;
                            return itemData;
                        });
                    });
                });
        },

        /**
         * Submit item response and
         * @param {String} itemIdentifier - item unique ID$
         * @param {Object} state - the item state
         * @param {Object} response - the item response
         * @param {Object} [params] - additionnal parameters
         * @returns {Promise}
         */
        submitItem: function submitItem(itemIdentifier, state, response, params) {
            //update the item response and the item state
            if (this.resultStore && (params.itemResponse || params.itemState)) {
                return this.resultStore.setItem(itemIdentifier, _.pick(params, ['itemResponse', 'itemState']));
            }
        },

        /**
         * Call actions on the item context (move, jump)
         * @param {String} itemIdentifier - item unique ID
         * @param {String} action - the action to perform from the item
         * @param {Object} [params] - additionnal parameters
         * @returns {Promise<Object>} the triple <testData,testContext,testMap>
         */
        callItemAction: function callItemAction(itemIdentifier, action, params) {
            var self = this;
            var testNavigator;
            var newTestContext;
            var updatePromises = [];

            var result = {
                success: true
            };

            var testData = this.getDataHolder().get('testData');
            var testContext = this.getDataHolder().get('testContext');
            var testMap = this.getDataHolder().get('testMap');

            if (!this.testDataStore || !this.resultStore) {
                return Promise.reject(new Error('Please initiaze the proxy first'));
            }

            //update the item response and the item state
            if (params.itemResponse || params.itemState) {
                logger.info('Item reponse for ' + itemIdentifier + ' : ' + JSON.stringify(params.itemResponse));
                updatePromises.push(
                    this.resultStore.setItem(itemIdentifier, _.pick(params, ['itemResponse', 'itemState']))
                );
            }

            //Ugly way to close the context...
            //when the end of the test is reached
            //or a section/test timeout
            if (
                (testContext.isLast && action === 'move' && params.scope === 'item' && params.direction === 'next') ||
                (action === 'timeout' && params.scope !== 'item')) {

                result.testContext = {
                    state: testData.states.closed
                };
                updatePromises.push(self.testDataStore.clear());
                updatePromises.push(self.resultStore.clear());

            } else if (params.direction && params.scope) {

                testNavigator = testNavigatorFactory(testData, testContext, testMap);
                newTestContext = testNavigator.navigate(
                    params.direction,
                    params.scope,
                    params.ref
                );
                result.testContext = newTestContext;

                updatePromises.push(
                    self.testDataStore.setItem('testData', {
                        testData: testData,
                        testContext: newTestContext,
                        testMap: testMap
                    })
                );
            }

            return Promise.all(updatePromises).then(function() {
                return result;
            });
        },

        telemetry: function telemetry(itemIdentifier, signal, params) {},

        loadCommunicator: function loadCommunicator() {
            return null;
        }
    };

    return proxy;
});
