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
 * Test the result sync provider
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/synchronization/synchronizer',
    'app/service/synchronization/provider/result',
    'app/service/result',
    'app/service/deliveryExecution',
    'app/service/synchronization/client'
], function(synchronizerFactory, resultSyncProvider, resultServiceMock, deliveyExecutionServiceMock, syncClientMock) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof resultSyncProvider, 'object', 'The module exposes a plain object');
    });

    QUnit.test('syncProvider', function(assert) {
        assert.equal(typeof resultSyncProvider.name, 'string', 'The provider exposes a name');
        assert.equal(resultSyncProvider.direction, 'send', 'The result provider is a send provider');
        assert.equal(typeof resultSyncProvider.init, 'function', 'The provider exposes an init method');
        assert.equal(typeof resultSyncProvider.getLocalResources, 'function', 'The provider exposes a getLocalResources method');
        assert.equal(typeof resultSyncProvider.sendResource, 'function', 'The provider exposes an sendResource method');
        assert.equal(typeof resultSyncProvider.removeResource, 'function', 'The provider exposes a removeResource method');
    });


    QUnit.module('Behavior', {
        setup : function setup(){
            synchronizerFactory.registerProvider('results', resultSyncProvider);
        },
        teardown: function teardown() {
            synchronizerFactory.clearProviders();
            resultServiceMock.results = {};
            deliveyExecutionServiceMock.executions = {};
        }
    });

    QUnit.cases([{
        title : 'One delivery execution 2 results',
        executions : {
            'de1': {
                id: 'de1',
                synchronized : false,
                delivery : 'd1',
                testTaker : 't1',
                label : 'Test 1',
                state: 'finished'
            },
        },
        results : {
            'r1': {
                id: 'r1',
                type: 'outcome',
                data : {
                    identifier : 'SCORE',
                    cardinality : 'single',
                    baseType : 'float',
                    value : 1
                }
            },
            'r2': {
                id: 'r2',
                type: 'response',
                data : {
                    identifier : 'RESPONSE',
                    cardinality : 'single',
                    baseType : 'identifier',
                    value : 'choice_1'
                }
            },
        },
        remove : 1,
        send : 1
    }, {
        title : 'filter sync executions',
        executions : {
            'de1': {
                id: 'de1',
                synchronized : true,
                delivery : 'd1',
                testTaker : 't1',
                label : 'Test 1',
                state: 'finished'
            },
            'de2': {
                id: 'de2',
                synchronized : false,
                delivery : 'd2',
                testTaker : 't2',
                label : 'Test 2',
                state: 'finished'
            },
        },
        results : {
            'r1': {
                id: 'r1',
                type: 'outcome',
                data : {
                    identifier : 'SCORE',
                    cardinality : 'single',
                    baseType : 'float',
                    value : 1
                }
            },
            'r2': {
                id: 'r2',
                type: 'response',
                data : {
                    identifier : 'RESPONSE',
                    cardinality : 'single',
                    baseType : 'identifier',
                    value : 'choice_1'
                }
            },
        },
        remove : 1,
        send : 1
    }]).asyncTest('Synchronize', function(data, assert) {

        var resultSynchronizer = synchronizerFactory('results', {});

        QUnit.expect(2);

        resultServiceMock.results = data.results;
        deliveyExecutionServiceMock.executions = data.executions;

        resultSynchronizer
            .start()
            .then(function(results){

                assert.equal(results.send.length, data.send, 'The correct number of delivery execution is sent');
                assert.equal(results.remove.length, data.remove, 'The correct number of delivery execution is removed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
