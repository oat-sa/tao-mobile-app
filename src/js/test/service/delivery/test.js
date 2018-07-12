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
 * Test the delivery service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/delivery'], function(deliveryService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof deliveryService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'getById' },
        { title : 'getAll' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' },
        { title : 'removeAll' },
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof deliveryService[data.title], 'function', 'The service exposes the component method "' + data.title);
    });


    QUnit.module('Behavior');


    QUnit.test('set invalid delivery', function(assert) {

        QUnit.expect(3);

        assert.throws(function(){
            deliveryService.set();
        }, TypeError, 'an delivery object is expected');

        assert.throws(function(){
            deliveryService.set({});
        }, TypeError, 'a valid delivery object is expected');

        assert.throws(function(){
            deliveryService.set({ id : '1234'});
        }, TypeError, 'a valid delivery object is expected');
    });

    QUnit.asyncTest('Get/Set/Update/Remove an delivery', function(assert) {

        var sampledelivery = {
            id : '123456',
            label : 'Delivery 1',
            extra    : {
                foo : 'bar'
            }
        };

        QUnit.expect(11);

        deliveryService
            .getById('123456')
            .then(function(delivery){
                assert.equal(delivery, null, 'This delivery does not exists yet');

                return deliveryService.set(sampledelivery);
            })
            .then(function(result){
                assert.ok(result, 'The delivery has been inserted');

                return deliveryService.getById('123456');
            })
            .then(function(delivery){
                assert.deepEqual(delivery, sampledelivery, 'This inserted delivery can be retrieved');

                return deliveryService.update({
                    id : '123456',
                    label : 'Delivery 2',
                    newField : 'noz'
                });
            })
            .then(function(result){
                assert.ok(result, 'The delivery has been udpated');

                return deliveryService.getById('123456');
            })
            .then(function(delivery){
                assert.notDeepEqual(delivery, sampledelivery, 'The delivery has changed');
                assert.equal(delivery.id, sampledelivery.id, 'The delivery id remains the same');
                assert.deepEqual(delivery.label, 'Delivery 2', 'The label has been updated');
                assert.equal(delivery.newField, 'noz', 'The new field has been added');
                assert.deepEqual(delivery.extra, sampledelivery.extra, 'The previous fields remains by default');

                return deliveryService.remove('123456');
            })
            .then(function(result){
                assert.ok(result, 'The delivery has been removed');

                return deliveryService.getById('123456');
            })
            .then(function(delivery){
                assert.equal(delivery, null, 'This delivery does not exists anymore');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('Insert, get and remove multiple deliveries', function(assert) {

        var sampleDelivery = [{
            id : 'd1',
            label : 'Delivery 1',
            createdAt: Date.now(),
        }, {
            id : 'd2',
            label : 'Delivery 2',
            createdAt: Date.now(),
        }, {
            id : 'd3',
            label : 'Delivery 3',
            createdAt: Date.now(),
        }, {
            id : 'd4',
            label : 'Delivery 4',
            createdAt: Date.now(),
        }, {
            id : 'd5',
            label : 'Delivery 5',
            createdAt: Date.now(),
        }];

        QUnit.expect(4);

        Promise.all([
            deliveryService.set(sampleDelivery[0]),
            deliveryService.set(sampleDelivery[1]),
            deliveryService.set(sampleDelivery[2]),
            deliveryService.set(sampleDelivery[3]),
            deliveryService.set(sampleDelivery[4])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true, true], 'All deliveries have been inserted');
            return deliveryService.getAll();
        }).then(function(deliverys){
            assert.deepEqual(deliverys, {
                d1 : sampleDelivery[0],
                d2 : sampleDelivery[1],
                d3 : sampleDelivery[2],
                d4 : sampleDelivery[3],
                d5 : sampleDelivery[4]
            }, 'The inserted deliveries can be retrieved');

            return deliveryService.removeAll();
        }).then(function(results){
            assert.ok(results, 'The deliveries have been removed');

            return deliveryService.getAll();
        }).then(function(deliverys){
            assert.deepEqual(deliverys, {}, 'All deliveries have been removed');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
