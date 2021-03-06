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
 * Test the delivery execution service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/deliveryExecution',
    'core/store'
], function(deliveryExecutionService, store){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof deliveryExecutionService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'create' },
        { title : 'pause' },
        { title : 'finish' },
        { title : 'getAllByState' },
        { title : 'getAllToSync' }
    ]).test('Service API ', function(data, assert) {
        assert.equal(typeof deliveryExecutionService[data.title], 'function', 'The service exposes the method "' + data.title);
    });

    QUnit.cases([
        { title : 'getById' },
        { title : 'getAll' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' },
        { title : 'removeAll' },
    ]).test('storeService API ', function(data, assert) {
        assert.equal(typeof deliveryExecutionService[data.title], 'function', 'The service exposes the method "' + data.title);
    });


    QUnit.module('Behavior', {
        teardown : function teardown(){
            QUnit.stop();
            store
                .removeAll()
                .then(function(){
                    QUnit.start();
                });
        }
    });

    QUnit.asyncTest('set invalid delivery execution', function(assert) {

        QUnit.expect(5);

        assert.throws(function(){
            deliveryExecutionService.set();
        }, TypeError, 'an delivery execution object is expected');

        assert.throws(function(){
            deliveryExecutionService.set({});
        }, TypeError, 'a valid object is expected');

        assert.throws(function(){
            deliveryExecutionService.set({
                id : '1234',
                delivery : 'd1',
                testTaker: 'tt1',
            });
        }, TypeError, 'a valid object is expected');

        assert.throws(function(){
            deliveryExecutionService.set({
                id : '1234',
                delivery : 'd1',
                testTaker: 'tt1',
                state : 'badstate'
            });
        }, TypeError, 'a valid state is expected');

        deliveryExecutionService
            .set({
                id:          'de1',
                delivery:  'd1',
                testTaker: 'tt1',
                state:       deliveryExecutionService.states.active,
                startTime:   Date.now()
            })
            .then(function(set){
                assert.ok(set, 'With valid values the entity is set');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('deliveyExecution lifecycle', function(assert) {

        QUnit.expect(16);

        deliveryExecutionService
            .create('delivery1', 'testTaker1', 'My delivery')
            .then(function(deliveryExecution){

                assert.equal(typeof deliveryExecution, 'object', 'A new execution is created');
                assert.equal(typeof deliveryExecution.id, 'string', 'The created execution contains an id');
                assert.equal(deliveryExecution.delivery, 'delivery1', 'The created execution contains the delivery id');
                assert.equal(deliveryExecution.testTaker, 'testTaker1', 'The created execution contains the test taker id');
                assert.equal(deliveryExecution.label, 'My delivery', 'The created execution contains the given label');
                assert.equal(deliveryExecution.state, deliveryExecutionService.states.active, 'The created execution is in active state');
                assert.ok(deliveryExecution.startTime > 0, 'The created execution has a start time');
                assert.ok(deliveryExecution.startTime <= Date.now(), 'The created execution has a start time at the creation time');

                return deliveryExecutionService.finish(deliveryExecution.id)
                    .then(function(updated){
                        assert.ok(updated, 'The delivery execution has been finished');

                        return deliveryExecutionService.getById(deliveryExecution.id);
                    });
            })
            .then(function(deliveryExecution){

                assert.equal(deliveryExecution.delivery, 'delivery1', 'The execution contains the delivery id');
                assert.equal(deliveryExecution.testTaker, 'testTaker1', 'The execution contains the test taker id');
                assert.equal(deliveryExecution.state, deliveryExecutionService.states.finished, 'The created execution is in finished state');
                assert.ok(deliveryExecution.startTime > 0, 'The execution has a start time');
                assert.ok(deliveryExecution.finishTime > 0, 'The execution has a finish time');
                assert.ok(deliveryExecution.finishTime <= Date.now(), 'The execution has a finish time');
                assert.ok(deliveryExecution.finishTime > deliveryExecution.startTime, 'The execution has a finish time greater than the start time');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('get all by state', function(assert) {

        var sampleExecutions = [{
            id:        'de1',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.active,
            startTime:   Date.now()
        }, {
            id:        'de2',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.abandoned,
            startTime:   Date.now()
        }, {
            id:        'de3',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.finished,
            startTime:   Date.now()
        }, {
            id:        'de4',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.finished,
            startTime:   Date.now()
        }];


        QUnit.expect(3);

        Promise.all([
            deliveryExecutionService.set(sampleExecutions[0]),
            deliveryExecutionService.set(sampleExecutions[1]),
            deliveryExecutionService.set(sampleExecutions[2]),
            deliveryExecutionService.set(sampleExecutions[3])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true], 'The executions have been inserted');

            return deliveryExecutionService.getAllByState(deliveryExecutionService.states.finished);
        }).then(function(deliveryExecutions){
            assert.deepEqual(deliveryExecutions, [
                sampleExecutions[2],
                sampleExecutions[3]
            ], 'The retrieved executions are correct');

            return deliveryExecutionService.getAllByState(deliveryExecutionService.states.active);
        }).then(function(deliveryExecutions){
            assert.deepEqual(deliveryExecutions, [
                sampleExecutions[0]
            ], 'The retrieved executions are correct');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('get all to sync', function(assert) {

        var sampleExecutions = [{
            id:        'de1',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.active,
            startTime:   Date.now()
        }, {
            id:        'de2',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.finished,
            startTime:   Date.now()
        }, {
            id:        'de3',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.finished,
            synchronized : true,
            startTime:   Date.now()
        }, {
            id:        'de4',
            delivery:  'd1',
            testTaker: 'tt1',
            state:       deliveryExecutionService.states.finished,
            synchronized : false,
            startTime:   Date.now()
        }];


        QUnit.expect(2);

        Promise.all([
            deliveryExecutionService.set(sampleExecutions[0]),
            deliveryExecutionService.set(sampleExecutions[1]),
            deliveryExecutionService.set(sampleExecutions[2]),
            deliveryExecutionService.set(sampleExecutions[3])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true], 'The executions have been inserted');

            return deliveryExecutionService.getAllToSync();
        }).then(function(deliveryExecutions){
            assert.deepEqual(deliveryExecutions, [
                sampleExecutions[1],
                sampleExecutions[3]
            ], 'The retrieved executions are correct');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
