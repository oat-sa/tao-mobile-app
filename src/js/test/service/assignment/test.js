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
 * Test the assignment service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/assignment',
    'app/service/user',
    'app/service/delivery',
    'app/service/eligibility'
], function(assignmentService, userService, deliveryService, eligibilityService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof assignmentService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'getTestTakerDeliveries' },
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof assignmentService[data.title], 'function', 'The service exposes the component method "' + data.title);
    });


    QUnit.module('Behavior', {
        setup: function setup(){
            this.originalUserServiceGetById        = userService.getById;
            this.originalEligibilityServiceGetById = eligibilityService.getById;
            this.originalDeliveryServiceGetById    = deliveryService.getById;
        },
        teardown : function teardown(){
            userService.getById        = this.originalUserServiceGetById;
            eligibilityService.getById = this.originalEligibilityServiceGetById;
            deliveryService.getById    = this.originalDeliveryServiceGetById;
        }
    });


    QUnit.cases([{
        title : 'consistant data',
        id : 'tt1',
        testTaker : {
            assignment : ['e1', 'e2']
        },
        eligibilities: {
            e1 : {
                delivery : 'd1',
                testTakers : ['tt1', 'tt2']
            },
            e2 : {
                delivery : 'd2',
                testTakers : ['tt1', 'tt3']
            }
        },
        deliveries : {
            d1  : {
                id : 'd1',
                label : 'Delivery 1',
            },
            d2  : {
                id : 'd2',
                label : 'Delivery 2',
            }
        },
        expected :  [{
            id : 'd1',
            label : 'Delivery 1',
        },{
            id : 'd2',
            label : 'Delivery 2',
        }]
    }, {
        title : 'd2 not eligibile anymore',
        id : 'tt1',
        testTaker : {
            assignment : ['e1', 'e2']
        },
        eligibilities: {
            e1 : {
                delivery : 'd1',
                testTakers : ['tt1', 'tt2']
            },
            e2 : {
                delivery : 'd2',
                testTakers : []
            }
        },
        deliveries : {
            d1  : {
                id : 'd1',
                label : 'Delivery 1',
            },
            d2  : {
                id : 'd2',
                label : 'Delivery 2',
            }
        },
        expected :  [{
            id : 'd1',
            label : 'Delivery 1',
        }]
    }, {
        title : 'delivery not found',
        id : 'tt1',
        testTaker : {
            assignment : ['e1', 'e2']
        },
        eligibilities: {
            e1 : {
                delivery : 'd1',
                testTakers : ['tt1', 'tt2']
            },
            e2 : {
                delivery : 'd2',
                testTakers : ['tt1', 'tt3']
            }
        },
        deliveries : {
            d2  : {
                id : 'd2',
                label : 'Delivery 2',
            }
        },
        expected :  [{
            id : 'd2',
            label : 'Delivery 2',
        }]
    }, {
        title : 'duplicated eligibilities',
        id : 'tt1',
        testTaker : {
            assignment : ['e1', 'e2', 'e3']
        },
        eligibilities: {
            e1 : {
                delivery : 'd1',
                testTakers : ['tt1', 'tt2']
            },
            e2 : {
                delivery : 'd1',
                testTakers : ['tt1', 'tt3']
            },
            e3 : {
                delivery : 'd2',
                testTakers : ['tt1', 'tt2']
            }
        },
        deliveries : {
            d1  : {
                id : 'd1',
                label : 'Delivery 1',
            },
            d2  : {
                id : 'd2',
                label : 'Delivery 2',
            }
        },
        expected :  [{
            id : 'd1',
            label : 'Delivery 1',
        },{
            id : 'd2',
            label : 'Delivery 2',
        }]
    }, {
        title : 'no assignment',
        id : 'tt1',
        testTaker : {
            assignment : []
        },
        eligibilities: {},
        deliveries : {},
        expected :  []
    }]).asyncTest('get test taker deliveries ', function(data, assert) {

        QUnit.expect(1);

        userService.getById = function(){
            return Promise.resolve(data.testTaker);
        };
        eligibilityService.getById = function(id){
            return Promise.resolve(data.eligibilities[id]);
        };
        deliveryService.getById = function(id){
            return Promise.resolve(data.deliveries[id]);
        };

        assignmentService
            .getTestTakerDeliveries(data.id)
            .then( function(deliveries) {
                assert.deepEqual(deliveries, data.expected, 'The expected deliveries have been retrieved');
                QUnit.start();
            })
            .catch( function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
