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
 * Test the eligibility service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/eligibility'], function(eligibilityService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof eligibilityService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'getById' },
        { title : 'getAll' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' },
        { title : 'removeAll' },
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof eligibilityService[data.title], 'function', 'The service exposes the component method "' + data.title);
    });


    QUnit.module('Behavior');


    QUnit.test('set invalid eligibility', function(assert) {

        QUnit.expect(5);

        assert.throws(function(){
            eligibilityService.set();
        }, TypeError, 'an eligibility object is expected');

        assert.throws(function(){
            eligibilityService.set({});
        }, TypeError, 'a valid eligibility object is expected');

        assert.throws(function(){
            eligibilityService.set({ id : '1234'});
        }, TypeError, 'a valid eligibility object is expected');

        assert.throws(function(){
            eligibilityService.set({ delivery : 'd1'});
        }, TypeError, 'a valid eligibility object is expected');

        assert.throws(function(){
            eligibilityService.set({
                delivery : 'd1',
                testTakers : new Date()
            });
        }, TypeError, 'a valid eligibility object is expected');
    });

    QUnit.asyncTest('Get/Set/Update/Remove an eligibility', function(assert) {

        var sampleEligibility = {
            id : '123456',
            delivery : 'd1',
            testTakers : [ 't1', 't2' ],
            extra    : {
                foo : 'bar'
            }
        };

        QUnit.expect(12);

        eligibilityService
            .getById('123456')
            .then(function(eligibility){
                assert.equal(eligibility, null, 'This eligibility does not exists yet');

                return eligibilityService.set(sampleEligibility);
            })
            .then(function(result){
                assert.ok(result, 'The eligibility has been inserted');

                return eligibilityService.getById('123456');
            })
            .then(function(eligibility){
                assert.deepEqual(eligibility, sampleEligibility, 'This inserted eligibility can be retrieved');

                return eligibilityService.update('123456', {
                    testTakers : [ 't1', 't3' ],
                    newField : 'noz'
                });
            })
            .then(function(result){
                assert.ok(result, 'The eligibility has been udpated');

                return eligibilityService.getById('123456');
            })
            .then(function(eligibility){
                assert.notDeepEqual(eligibility, sampleEligibility, 'The eligibility has changed');
                assert.equal(eligibility.id, sampleEligibility.id, 'The eligibility id remains the same');
                assert.equal(eligibility.delivery, sampleEligibility.delivery, 'The delivery remains the same');
                assert.deepEqual(eligibility.testTakers, [ 't1', 't3' ], 'The test taker list has been updated');
                assert.equal(eligibility.newField, 'noz', 'The new field has been added');
                assert.deepEqual(eligibility.extra, sampleEligibility.extra, 'The previous fields remains by default');

                return eligibilityService.remove('123456');
            })
            .then(function(result){
                assert.ok(result, 'The eligibility has been removed');

                return eligibilityService.getById('123456');
            })
            .then(function(eligibility){
                assert.equal(eligibility, null, 'This eligibility does not exists anymore');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('Insert, get and remove multiple eligibilities', function(assert) {

        var sampleEligibilitys = [{
            id : 'e1',
            delivery : 'd1',
            testTakers : [ 't1', 't2' ],
            createdAt: Date.now(),
        }, {
            id : 'e2',
            delivery : 'd2',
            testTakers : [ 't1', 't2' ],
            createdAt: Date.now(),
        }, {
            id : 'e3',
            delivery : 'd3',
            testTakers : [ 't3', 't4', 't5' ],
            createdAt: Date.now(),
        }, {
            id : 'e4',
            delivery : 'd4',
            testTakers : [ 't3', 't4', 't5' ],
            createdAt: Date.now(),
        }];

        QUnit.expect(4);

        Promise.all([
            eligibilityService.set(sampleEligibilitys[0]),
            eligibilityService.set(sampleEligibilitys[1]),
            eligibilityService.set(sampleEligibilitys[2]),
            eligibilityService.set(sampleEligibilitys[3])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true], 'All eligibilities have been inserted');

            return eligibilityService.getAll();
        }).then(function(eligibilitys){
            assert.deepEqual(eligibilitys, {
                e1 : sampleEligibilitys[0],
                e2 : sampleEligibilitys[1],
                e3 : sampleEligibilitys[2],
                e4 : sampleEligibilitys[3]
            }, 'The inserted eligibilities can be retrieved');

            return eligibilityService.removeAll();
        }).then(function(results){
            assert.ok(results, 'The eligibilities have been removed');

            return eligibilityService.getAll();
        }).then(function(eligibilitys){
            assert.deepEqual(eligibilitys, {}, 'All eligibilities have been removed');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
