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
    'core/promise',
    'core/logger',
    'app/service/deliveryAssembly',
    'app/runner/resultCollector',
    'taoTests/runner/testStore',
    'taoQtiTest/runner/navigator/navigator',
    'taoQtiTest/runner/helpers/map',
    'taoQtiTest/runner/provider/dataUpdater',
    'taoQtiTest/runner/proxy/cache/itemStore'
], function(
    _,
    Promise,
    loggerFactory,
    deliveryAssemblyService,
    resultCollectorFactory,
    testStore,
    testNavigatorFactory,
    mapHelper,
    dataUpdater,
    itemStoreFactory
) {
    'use strict';

    var logger = loggerFactory('runner/local/proxy');

    var proxy = {

        /**
         * Install behavior on the proxy
         */
        install: function install(config) {
            var self = this;

            /**
             * Load the content of the given delivery URL
             * @param {String} url - the path to the file within the assembly
             * @returns {Promise<Object>} resolve with the parsed content of the JSON file
             */
            this.getJsonFile = function getJsonFile(url) {
                return deliveryAssemblyService
                    .readAssemblyFile(config.testDefinition, config.testCompilation, url, false)
                    .then(function(content) {
                        try{
                            return JSON.parse(content);
                        } catch(err){
                            logger.error('Unable to parse content of ' + url + ' : ' + err.message);
                        }
                        return null;
                    });
            };

            /**
             * Get the baseUrl from the assembly root
             * @returns {Promise<String>} resolves with the baseUrl
             */
            this.getBaseUrl = function getBaseUrl() {
                return deliveryAssemblyService.getAssemblyDirBaseUrl(config.testDefinition, config.testCompilation);
            };


            this.getTestURI = function getTestURI(){
                return self.getJsonFile('test-metadata.json')
                    .then(function(fileContent){
                        return fileContent && fileContent['@id'];
                    });
            };

            this.getItemUri = function getItemUri(itemIdentifier){
                return self.getJsonFile('items/' + itemIdentifier + '/metadataElements.json')
                    .then(function(fileContent){
                        return fileContent && fileContent['@uri'];
                    });
            };

            this.getItemContent = function getItemContent(itemIdentifier){
                return self.getJsonFile('items/' + itemIdentifier + '/item.json')
                    .then(function(itemContent){
                        if (itemContent && itemContent.type && itemContent.type === 'qti') {
                            return itemContent;
                        }
                        return null;
                    });
            };

            this.getItemVariableElements = function getItemVariableElements(itemIdentifier){
                return self.getJsonFile('items/' + itemIdentifier + '/variableElements.json');
            };

            /**
             * Load the test state from the local store or the test file
             * @returns {Promis<Object>} resolves with the test state
             */
            this.getTestState = function getTestState() {
                if (!this.testStateStore) {
                    throw new Error('The test state store is not yet available');
                }

                //check in the local store first
                return this.testStateStore
                    .getItem('current')
                    .then(function(testState) {
                        if (!testState) {
                            //load the initial state from the data file,
                            //yes testData is not very well named
                            return self.getJsonFile('testData.json');
                        }
                        return testState;
                    });
            };

            /**
             * Take the current test state from the data holder and save it into the store
             * @returns {Promis<Boolean>}
             */
            this.saveCurrentTestState = function saveCurrentTestState() {
                return this.testStateStore
                    .setItem('current', {
                        testData: this.getDataHolder().get('testData'),
                        testContext: this.getDataHolder().get('testContext'),
                        testMap: this.getDataHolder().get('testMap')
                    });
            };
        },

        /**
         * Loads the initial state of the test
         * @param {Object} config - the test configuration
         * @param {Object} [params] - the test configuration
         * @returns {Promise<Object>} the triple <testData,testContext,testMap>
         */
        init: function init(config) {
            var self = this;

            this.executionId = config.serviceCallId;

            //initialize the stores and get the base url
            return Promise
                .all([
                    testStore(this.executionId).getStore('testState'),
                    testStore(this.executionId).getStore('itemState'),
                    this.getTestURI(),
                    this.getBaseUrl()
                ])
                .then(function(results) {
                    self.testStateStore = results[0];
                    self.itemStateStore = results[1];
                    self.testUri = results[2];
                    self.baseUrl = results[3];

                    return self.getTestState();
                })
                .then(function(testState) {
                    var itemStoreSize = 100;
                    if (testState && testState.testMap && testState.testMap.stats) {
                        itemStoreSize = testState.testMap.stats.total;
                    }

                    logger.info('Set up item cache store for ' + itemStoreSize + ' items');

                    self.itemStore = itemStoreFactory({
                        maxSize: itemStoreSize,
                        preload: false,
                        testId: self.executionId
                    });

                    return testState;
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
            return this
                .getTestState()
                .then(function(testState) {
                    return testState && testState.testData;
                });
        },

        /**
         * Load the test context
         * @returns {Promise<Object>} the testContext
         */
        getTestContext: function getTestContext() {
            return this
                .getTestState()
                .then(function(testState) {
                    return testState && testState.testContext;
                });
        },

        /**
         * Load the test map
         * @returns {Promise<Object>} the testMap
         */
        getTestMap: function getTestMap() {
            return this
                .getTestState()
                .then(function(testState) {
                    return testState && testState.testMap;
                });
        },

        /**
         * Sends collected variables
         * TODO implement me please
         */
        sendVariables: function sendVariables(variables) {
            logger.info('Collected variables : ' + JSON.stringify(variables));
            logger.warn('SENDING TEST VARIABLES IS NOT YET SUPPORTED');
        },

        /**
         * Perform an action at the level of test.
         * Supported actions :
         *  - flagItem
         * TODO implement the others
         * @param {String} action - the action
         * @param {Object} params - action parameters
         * @returns {Promise}
         */
        callTestAction: function callTestAction(action, params) {
            var self = this;

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

                    return self.saveCurrentTestState();
                }
            };

            if (typeof actions[action] === 'function') {
                return actions[action](params);
            } else {
                logger.warn('Test action action  ' + action + ' is not yet supported');
            }
        },

        /**
         * Get the item data
         * @param {String} itemIdentifier - item unique ID
         * @param {Object} [params] - additionnal parameters
         * @returns {Promise<Object>} resolves with the item data
         */
        getItem: function getItem(itemIdentifier) {

            var self = this;
            if (!this.itemStore || !this.itemStateStore) {
                return Promise.reject(new Error('Please initiaze the proxy first'));
            }

            return this.itemStateStore
                .getItem(itemIdentifier)
                .then(function(itemState) {

                    //load it from the item store
                    if (self.itemStore.has(itemIdentifier)) {
                        return self.itemStore
                            .get(itemIdentifier)
                            .then(function(item) {
                                //update the state
                                item.itemState = itemState;
                                return item;
                            });
                    }

                    //otherwise load it from the json file
                    return self.getItemContent(itemIdentifier).then(function(itemContent) {
                        var item = {};
                        if (itemContent) {
                            item = {
                                itemState:      itemState,
                                itemIdentifier: itemIdentifier,
                                itemData:       itemContent,
                                baseUrl:        self.baseUrl + '/items/' + itemIdentifier + '/',
                            };
                            if (self.itemStore) {
                                return self.itemStore
                                    .set(itemIdentifier, item)
                                    .then(function(){
                                        return item;
                                    });
                            }
                            return item;
                        }
                        return null;
                    });
                });
        },

        /**
         * Submit item response and
         * @param {String} itemIdentifier - item unique ID
         * @param {Object} state - the item state
         * @param {Object} response - the item response
         * @param {Object} [params] - additionnal parameters
         * @returns {Promise}
         */
        submitItem: function submitItem(itemIdentifier, state, response, params) {
            //update the item response and the item state
            if (this.itemStateStore && params.itemState) {
                return this.itemStateStore.setItem(itemIdentifier, params.itemState);
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

            var testState = {
                success: true
            };

            var testData = this.getDataHolder().get('testData');
            var testContext = this.getDataHolder().get('testContext');
            var testMap = this.getDataHolder().get('testMap');



            if (!this.testStateStore || !this.itemStateStore) {
                return Promise.reject(new Error('Please initiaze the proxy first'));
            }

            //update the item state
            if (params.itemState) {
                logger.info('Item state for ' + itemIdentifier + ' : ' + JSON.stringify(params.itemState));
                updatePromises.push(
                    this.itemStateStore.setItem(itemIdentifier, params.itemState)
                );
            }
            if (params.itemResponse) {
                logger.info('Item response for ' + itemIdentifier + ' : ' + JSON.stringify(params.itemResponse));

                updatePromises.push(
                    Promise.all([
                        self.itemStore.get(itemIdentifier),
                        self.getItemUri(itemIdentifier),
                        self.getItemVariableElements(itemIdentifier)
                    ]).then(function(results) {

                        var resultCollector;
                        var item = results[0];
                        var itemDataVariable = results[2];
                        item.metadata = {
                            uri : results[1]
                        };
                        item.stats = mapHelper.getItem(testMap, itemIdentifier);
                        _.forEach(item.itemData.data.responses, function(response, index){
                            if(itemDataVariable[index]){
                                item.itemData.data.responses[index] = _.defaults(itemDataVariable[index], response);
                            }
                        });
                        if(!item.itemData.data.responseProcessing){
                            _.forEach(itemDataVariable, function(content, key){
                                if(_.isString(content.processingType)){
                                    item.itemData.data.responseProcessing = _.merge({
                                        serial : key,
                                        qtiClass:'responseProcessing',
                                        attributes : {}
                                    }, content);
                                    return false;
                                }
                            });
                        }

                        console.log('MERGED ITEM ', item);

                        resultCollector = resultCollectorFactory(self.testUri, self.executionId, item);
                        return Promise.all([
                            resultCollector.addDuration(params.itemDuration),
                            resultCollector.addAttempts(testContext.attempts),
                            resultCollector.addCompletion(),
                            resultCollector.addOutcomes(params.itemResponse)
                        ]);
                    })
                );
            }

            //Ugly way to close the context...
            //when the end of the test is reached
            //or a section/test timeout
            if (
                (testContext.isLast && action === 'move' && params.scope === 'item' && params.direction === 'next') ||
                (action === 'timeout' && params.scope !== 'item')) {

                testState.testContext = {
                    state: testData.states.closed
                };
                //updatePromises.push(self.testStateStore.clear());
                //updatePromises.push(self.resultStore.clear());

            } else if (params.direction && params.scope) {

                testNavigator = testNavigatorFactory(testData, testContext, testMap);
                newTestContext = testNavigator.navigate(
                    params.direction,
                    params.scope,
                    params.ref
                );
                testState.testContext = newTestContext;

                this.getDataHolder().set('testContext', newTestContext);

                updatePromises.push(self.saveCurrentTestState());
            }

            return Promise
                .all(updatePromises)
                .then(function() {
                    return testState;
                });
        },

        telemetry: function telemetry() {
            return null;
        },

        loadCommunicator: function loadCommunicator() {
            return null;
        }
    };

    return proxy;
});
