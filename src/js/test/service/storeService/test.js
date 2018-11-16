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
 * Test the store service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/storeService'], function(storeServiceFactory){
    'use strict';

    var entityName = 'foo';
    var storeName  = 'bar';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof storeServiceFactory, 'function', 'The module exposes a function');
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(4);

        assert.throws(function(){
            storeServiceFactory();
        }, TypeError, 'An entityName must be defined');

        assert.throws(function(){
            storeServiceFactory(entityName);
        }, TypeError, 'An storeName must be defined');

        assert.equal(typeof storeServiceFactory(entityName, storeName), 'object', 'The factory creates an object');
        assert.notDeepEqual(storeServiceFactory(entityName, storeName), storeServiceFactory(entityName, storeName), 'The factory creates new instances');
    });

    QUnit.cases([
        { title : 'getById' },
        { title : 'getAll' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' },
        { title : 'removeAll' },
    ]).test('API ', function(data, assert) {
        var storeService = storeServiceFactory(entityName, storeName);
        assert.equal(typeof storeService[data.title], 'function', 'The service exposes the method ' + data.title);
    });


    QUnit.module('Behavior');


    QUnit.asyncTest('set and validate an entity, default validator', function(assert) {
        var storeService = storeServiceFactory(entityName, storeName);

        QUnit.expect(5);

        assert.throws(function(){
            storeService.set();
        }, TypeError, 'an object is expected');

        assert.throws(function(){
            storeService.set({});
        }, TypeError, 'a valid object is expected');

        assert.throws(function(){
            storeService.set({ id : '1234'});
        }, TypeError, 'a valid object is expected');

        assert.throws(function(){
            storeService.set({ label : 'Foo number 1'});
        }, TypeError, 'a valid object is expected');

        storeService.set({
            id:   '1234',
            label: 'Foo number 1'
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

    QUnit.asyncTest('set and validate an entity, custom validator', function(assert) {
        var storeService = storeServiceFactory(entityName, storeName, function(entity){
            if(!entity || typeof entity.id !== 'string' || typeof entity.fooId !== 'string'){
                throw new TypeError('invalid entity');
            }
            return true;
        });

        QUnit.expect(3);

        assert.throws(function(){
            storeService.set();
        }, TypeError, 'an object is expected');

        assert.throws(function(){
            storeService.set({ id : '321', label : 'super foo'});
        }, TypeError, 'a valid object is expected');


        storeService.set({
            id:   '321',
            fooId: 'Foo321'
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

    QUnit.asyncTest('Get/Set/Update/Remove an entity', function(assert) {

        var sample = {
            id : '123456',
            label : 'Entity 1',
            extra    : {
                foo : 'bar'
            }
        };

        var storeService =  storeServiceFactory(entityName, storeName + '01');

        QUnit.expect(11);

        storeService
            .getById('123456')
            .then(function(entity){
                assert.equal(entity, null, 'This entity does not exists yet');

                return storeService.set(sample);
            })
            .then(function(result){
                assert.ok(result, 'The entity has been inserted');

                return storeService.getById('123456');
            })
            .then(function(entity){
                assert.deepEqual(entity, sample, 'This inserted entity can be retrieved');

                return storeService.update('123456', {
                    label : 'Entity 2',
                    newField : 'noz'
                });
            })
            .then(function(result){
                assert.ok(result, 'The entity has been udpated');

                return storeService.getById('123456');
            })
            .then(function(entity){
                assert.notDeepEqual(entity, sample, 'The entity has changed');
                assert.equal(entity.id, sample.id, 'The entity id remains the same');
                assert.deepEqual(entity.label, 'Entity 2', 'The label has been updated');
                assert.equal(entity.newField, 'noz', 'The new field has been added');
                assert.deepEqual(entity.extra, sample.extra, 'The previous fields remains by default');

                return storeService.remove('123456');
            })
            .then(function(result){
                assert.ok(result, 'The entity has been removed');

                return storeService.getById('123456');
            })
            .then(function(entity){
                assert.equal(entity, null, 'This entity does not exists anymore');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('Insert, get and remove multiple deliveries', function(assert) {

        var sample = [{
            id : 'd1',
            label : 'Entity 1',
            createdAt: Date.now(),
        }, {
            id : 'd2',
            label : 'Entity 2',
            createdAt: Date.now(),
        }, {
            id : 'd3',
            label : 'Entity 3',
            createdAt: Date.now(),
        }, {
            id : 'd4',
            label : 'Entity 4',
            createdAt: Date.now(),
        }, {
            id : 'd5',
            label : 'Entity 5',
            createdAt: Date.now(),
        }];

        var storeService =  storeServiceFactory(entityName, storeName + '02');

        QUnit.expect(4);

        Promise.all([
            storeService.set(sample[0]),
            storeService.set(sample[1]),
            storeService.set(sample[2]),
            storeService.set(sample[3]),
            storeService.set(sample[4])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true, true], 'All deliveries have been inserted');
            return storeService.getAll();
        }).then(function(entities){
            assert.deepEqual(entities, {
                d1 : sample[0],
                d2 : sample[1],
                d3 : sample[2],
                d4 : sample[3],
                d5 : sample[4]
            }, 'The inserted deliveries can be retrieved');

            return storeService.removeAll();
        }).then(function(results){
            assert.ok(results, 'The deliveries have been removed');

            return storeService.getAll();
        }).then(function(entities){
            assert.deepEqual(entities, {}, 'All deliveries have been removed');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
