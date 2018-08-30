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
 * Test the testTaker sync service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/synchronization/synchronizer',
], function(synchronizerFactory) {
    'use strict';

    var dummyProvider = {
        name : 'dummy',
        init : function(){},
        getRemoteResourceIds : function(){},
        getRemoteResources : function(){},
        getLocalResources : function(){},
        addResource : function(){},
        updateResource : function(){},
        removeResource : function(){}
    };

    QUnit.module('API', {
        teardown: function teardown(){
            synchronizerFactory.clearProviders();
        }
    });

    QUnit.test('module', function(assert) {
        assert.equal(typeof synchronizerFactory, 'function', "The module exposes a function");
    });


    QUnit.test('provider factory', function(assert) {
        QUnit.expect(5);

        assert.equal(typeof synchronizerFactory.registerProvider, 'function', 'The factory let\'s you register a provider');

        assert.throws(function(){
            synchronizerFactory();
        }, Error, 'With no provider registered nor required the factory throws and error');

        assert.throws(function(){
            synchronizerFactory('dummy');
        }, Error, 'The given provider is not registered');

        synchronizerFactory.registerProvider('dummy', dummyProvider);

        assert.equal(typeof synchronizerFactory('dummy'), 'object', "The factory produces an object");
        assert.notStrictEqual(synchronizerFactory('dummy'), synchronizerFactory('dummy'), "The factory provides a different object on each call");
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        var synchronizer;
        synchronizerFactory.registerProvider('dummy', dummyProvider);
        synchronizer = synchronizerFactory('dummy');
        assert.equal(typeof synchronizer[data.title], 'function', 'The synchronizerFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'getState' },
        { title : 'setState' },
    ]).test('State API ', function(data, assert) {
        var synchronizer;
        synchronizerFactory.registerProvider('dummy', dummyProvider);
        synchronizer = synchronizerFactory('dummy');
        assert.equal(typeof synchronizer[data.title], 'function', 'The synchronizerFactory exposes the statifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'start' },
        { title : 'stop' },
        { title : 'computeNeededOperations' },
        { title : 'getLogger' },
        { title : 'getConfig' },
    ]).test('Facade API ', function(data, assert) {
        var synchronizer;
        synchronizerFactory.registerProvider('dummy', dummyProvider);
        synchronizer = synchronizerFactory('dummy');
        assert.equal(typeof synchronizer[data.title], 'function', 'The synchronizerFactory exposes the facade method "' + data.title);
    });


    QUnit.module('Behavior', {
        teardown: function teardown() {
            synchronizerFactory.clearProviders();
        }
    });

    QUnit.cases([{
        title : 'add all',
        local : {},
        remote : {
            a1 : { id : 'a1', checksum : 'a' },
            a2 : { id : 'a2', checksum : 'a' },
            a3 : { id : 'a3', checksum : 'a' },
        },
        results : {
            add : ['a1', 'a2', 'a3'],
            update: [],
            remove : []
        }
    }, {
        title : 'remove all',
        local : {
            r1 : { id : 'r1', checksum : 'a' },
            r2 : { id : 'r2', checksum : 'a' },
            r3 : { id : 'r3', checksum : 'a' },
        },
        remote : {
        },
        results : {
            add : [],
            update: [],
            remove : ['r1', 'r2', 'r3']
        }
    }, {
        title : 'mixed',
        local : {
            m1 : { id : 'm1', checksum : 'a' },
            m2 : { id : 'm2', checksum : 'a' },
            m3 : { id : 'm3', checksum : 'a' },
        },
        remote : {
            m1 : { id : 'm1', checksum : 'b' },
            m2 : { id : 'm2', checksum : 'a' },
            m4 : { id : 'm4', checksum : 'a' }
        },
        results : {
            add : ['m4'],
            update: ['m1'],
            remove : ['m3']
        }
    }]).test('completedOperations ', function(data, assert) {

        var syncOperations;

        synchronizerFactory.registerProvider('dummy', dummyProvider);

        syncOperations = synchronizerFactory('dummy').computeNeededOperations(data.local, data.remote);

        assert.deepEqual(syncOperations, data.results, 'The operations are computed based on the resources');
    });

    QUnit.asyncTest('start then stop lifecycle', function(assert){

        var synchronizer;

        QUnit.expect(8);

        synchronizerFactory.registerProvider('wait', {
            name : 'wait',
            init : function(){},
            getRemoteResourceIds : function(){
                return new Promise(function(resolve){
                    setTimeout(resolve, 40);
                });
            },
            getLocalResources : function(){
                return new Promise(function(resolve){
                    setTimeout(resolve, 30);
                });
            },
            getRemoteResources : function(){},
            addResource : function(){},
            updateResource : function(){},
            removeResource : function(){}
        });

        synchronizer =  synchronizerFactory('wait');

        assert.ok(!synchronizer.getState('running'), 'the sync is not yet started');
        assert.ok(!synchronizer.getState('canceled'), 'the sync is not canceled');

        synchronizer
            .start()
            .then(function(){
                assert.ok(false, 'The promise should reject');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(err.cancel, 'The chain has been canceled');
                assert.ok(!synchronizer.getState('running'), 'the sync states are reset');
                assert.ok(!synchronizer.getState('canceled'), 'the sync states are reset');
                QUnit.start();
            });

        setTimeout(function(){
            assert.ok(synchronizer.getState('running'), 'the sync is ongoing');
            assert.ok(!synchronizer.getState('canceled'), 'the sync is not canceled');

            synchronizer.stop();
            assert.ok(synchronizer.getState('canceled'), 'the sync is now canceled');
        }, 20);
    });

    QUnit.asyncTest('synchronize', function(assert){

        var mockConfig  = {
            foo : true,
            chunkSize : 5
        };

        QUnit.expect(12);

        synchronizerFactory.registerProvider('mock', {
            name : 'mock',
            init : function(config){
                assert.deepEqual(config, mockConfig, 'The provider is initialzed with the config');
            },
            getLocalResources : function(){
                assert.ok(true, 'getLocalResources called');
                return Promise.resolve({
                    n1 : { id : 'n1', checksum : 'a' },
                    n2 : { id : 'n2', checksum : 'a' },
                    n3 : { id : 'n3', checksum : 'a' }
                });
            },
            getRemoteResourceIds : function(){
                assert.ok(true, 'getRemoteResourceIds called');
                return Promise.resolve({
                    n1 : { id : 'n1', checksum : 'b' },
                    n2 : { id : 'n2', checksum : 'a' },
                    n4 : { id : 'n4', checksum : 'a' }
                });
            },
            getRemoteResources : function(ids){
                var id = ids[0];
                var resources = {
                    n1 : { id : 'n1', checksum : 'b', value : 'foo1' },
                    n2 : { id : 'n2', checksum : 'a', value : 'foo2' },
                    n4 : { id : 'n4', checksum : 'a', value : 'foo4' }
                };
                var results = {};
                results[id] = resources[id];
                return Promise.resolve(results);
            },
            addResource : function(id, resource){
                assert.equal(id, 'n4', 'The correct resource will be added');
                assert.equal(resource.id, 'n4', 'The correct resource is set');
                assert.equal(resource.value, 'foo4', 'The full resource ist set');
                return Promise.resolve(true);
            },
            updateResource : function(id, resource){
                assert.equal(id, 'n1', 'The correct resource will be udpated');
                assert.equal(resource.id, 'n1', 'The correct resource is set');
                assert.equal(resource.checksum, 'b', 'The correct version is set');
                assert.equal(resource.value, 'foo1', 'The full resource ist set');
                return Promise.resolve(true);
            },
            removeResource : function(id){
                assert.equal(id, 'n3', 'The correct resource will be removed');
                return Promise.resolve(true);
            }
        });

        synchronizerFactory('mock', mockConfig)
            .start()
            .then(function(operations){
                assert.deepEqual(operations, {
                    add: ['n4'],
                    update: ['n1'],
                    remove : ['n3']
                }, 'The expected operations have been executed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('fail in retrieval', function(assert){

        var synchronizer;

        var mockConfig  = {
            foo : true,
            chunkSize : 5
        };

        QUnit.expect(8);

        synchronizerFactory.registerProvider('fail-retrieve', {
            name : 'fail-retrieve',
            init : function(config){
                assert.deepEqual(config, mockConfig, 'The provider is initialzed with the config');
            },
            getLocalResources : function(){
                assert.ok(true, 'getLocalResources called');
                return Promise.resolve({});
            },
            getRemoteResourceIds : function(){
                assert.ok(true, 'getRemoteResourceIds called');
                return Promise.resolve({
                    n1 : { id : 'n1', checksum : 'a' },
                    n2 : { id : 'n2', checksum : 'a' },
                });
            },
            getRemoteResources : function(){
                return new Promise(function(resolve, reject) {
                    setTimeout(function(){
                        assert.ok(synchronizer.getState('running'), 'the sync is running');
                        reject(new Error('Unable to contact the server'));
                    }, 50);
                });
            },
            addResource : function(){},
            updateResource : function(){},
            removeResource : function(){}
        });

        synchronizer = synchronizerFactory('fail-retrieve', mockConfig);
        assert.ok(!synchronizer.getState('running'), 'the sync is not yet running');

        synchronizer
            .start()
            .then(function(){
                assert.ok(false, 'the sync should fail');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(err instanceof Error, 'The promise rejects with an error');
                assert.equal(err.message, 'Unable to contact the server', 'The error is expected');
                assert.ok(!synchronizer.getState('running'), 'the sync states are reset');
                QUnit.start();
            });
    });
});
