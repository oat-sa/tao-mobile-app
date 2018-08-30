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
 * Test the eligibility sync provider
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/synchronization/synchronizer',
    'app/service/synchronization/provider/eligibility',
    'app/service/eligibility',
    'app/service/synchronization/client'
], function(synchronizerFactory, eligibilitySyncProvider, eligibilityServiceMock, syncClientMock) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof eligibilitySyncProvider, 'object', 'The module exposes a plain object');
    });

    QUnit.test('syncProvider', function(assert) {
        assert.equal(typeof eligibilitySyncProvider.name, 'string', 'The provider exposes a name');
        assert.equal(typeof eligibilitySyncProvider.init, 'function', 'The provider exposes an init method');
        assert.equal(typeof eligibilitySyncProvider.getRemoteResourceIds, 'function', 'The provider exposes an getRemoteResourceIds method');
        assert.equal(typeof eligibilitySyncProvider.getRemoteResources, 'function', 'The provider exposes a getRemoteResources method');
        assert.equal(typeof eligibilitySyncProvider.getLocalResources, 'function', 'The provider exposes a getLocalResources method');
        assert.equal(typeof eligibilitySyncProvider.addResource, 'function', 'The provider exposes an addResource method');
        assert.equal(typeof eligibilitySyncProvider.updateResource, 'function', 'The provider exposes an updateResource method');
        assert.equal(typeof eligibilitySyncProvider.removeResource, 'function', 'The provider exposes a removeResource method');
    });


    QUnit.module('Behavior', {
        setup : function setup(){
            synchronizerFactory.registerProvider('eligibility', eligibilitySyncProvider);
        },
        teardown: function teardown() {
            synchronizerFactory.clearProviders();

            eligibilityServiceMock.eligibilities = {};
            syncClientMock.entityIds = {};
            syncClientMock.entitiesContent = {};
        }
    });

    QUnit.cases([{
        title : 'Add 3 new eligibilities',
        local : [],
        entityIds : {
            'http://foo.org/tao.rdf#i15318306494300209': {
                'id': 'http://foo.org/tao.rdf#i15318306494300209',
                'checksum': '8381b13cf3bef6311e93d40fc3f5ead7'
            },
            'http://foo.org/tao.rdf#i15318306494697210': {
                'id': 'http://foo.org/tao.rdf#i15318306494697210',
                'checksum': '9cadd0e0490eaa6cfa5a2fb03d31ea09'
            },
            'http://foo.org/tao.rdf#i15318306498935208': {
                'id': 'http://foo.org/tao.rdf#i15318306498935208',
                'checksum': 'e2b52d0c325106bed5c6d0dc93c27630'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i15318306494300209': {
                'id': 'http://foo.org/tao.rdf#i15318306494300209',
                'checksum': '8381b13cf3bef6311e93d40fc3f5ead7',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i15318306325465192',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i1531144394427468',
                        'http://foo.org/tao.rdf#i15313991749494119',
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i15318305578092172'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            },
            'http://foo.org/tao.rdf#i15318306494697210': {
                'id': 'http://foo.org/tao.rdf#i15318306494697210',
                'checksum': '9cadd0e0490eaa6cfa5a2fb03d31ea09',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i15313993456192149',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i15313991749494119',
                        'http://foo.org/tao.rdf#i1531144394427468'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            },
            'http://foo.org/tao.rdf#i15318306498935208': {
                'id': 'http://foo.org/tao.rdf#i15318306498935208',
                'checksum': 'e2b52d0c325106bed5c6d0dc93c27630',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i1531144442626270',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i1531144394427468'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            }
        },
        add : 3,
        remove : 0,
        update : 0
    }, {
        title : 'Update one eligibility',
        local : [{
            id: 'http://foo.org/tao.rdf#i15318306494300209',
            checksum: '8381b13cf3bef6311e93d40fc3f5ead7',
            delivery : 'http://foo.org/tao.rdf#i15318306325465192',
            testTakers : [
                'http://foo.org/tao.rdf#i1531144394427468',
                'http://foo.org/tao.rdf#i15313991749494119',
                'http://foo.org/tao.rdf#i15313991973207120',
                'http://foo.org/tao.rdf#i15318305578092172'
            ]
        }, {
            id: 'http://foo.org/tao.rdf#i15318306494697210',
            checksum: '9cadd0e0490eaa6cfa5a2fb03d31ea09',
            delivery : 'http://foo.org/tao.rdf#i15313993456192149',
            testTakers: [
                'http://foo.org/tao.rdf#i15313991973207120',
                'http://foo.org/tao.rdf#i15313991749494119',
                'http://foo.org/tao.rdf#i1531144394427468'
            ]
        }],
        entityIds : {
            'http://foo.org/tao.rdf#i15318306494300209': {
                'id':       'http://foo.org/tao.rdf#i15318306494300209',
                'checksum': '8381b13cf3bef6311e93d40fc3f5ead8'
            },
            'http://foo.org/tao.rdf#i15318306494697210': {
                'id':       'http://foo.org/tao.rdf#i15318306494697210',
                'checksum': '9cadd0e0490eaa6cfa5a2fb03d31ea09'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i15318306494300209': {
                'id': 'http://foo.org/tao.rdf#i15318306494300209',
                'checksum': '8381b13cf3bef6311e93d40fc3f5ead8',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i15318306325465192',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i15313991749494119',
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i15318305578092172'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            },
            'http://foo.org/tao.rdf#i15318306494697210': {
                'id': 'http://foo.org/tao.rdf#i15318306494697210',
                'checksum': '9cadd0e0490eaa6cfa5a2fb03d31ea09',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i15313993456192149',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i15313991749494119',
                        'http://foo.org/tao.rdf#i1531144394427468'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            }
        },
        add : 0,
        remove : 0,
        update : 1
    }, {
        title : 'Remove 2 eligibilities',
        local : [{
            id: 'http://foo.org/tao.rdf#i15318306494300209',
            checksum: '8381b13cf3bef6311e93d40fc3f5ead7',
            delivery : 'http://foo.org/tao.rdf#i15318306325465192',
            testTakers : [
                'http://foo.org/tao.rdf#i1531144394427468',
                'http://foo.org/tao.rdf#i15313991749494119',
                'http://foo.org/tao.rdf#i15313991973207120',
                'http://foo.org/tao.rdf#i15318305578092172'
            ]
        }, {
            id: 'http://foo.org/tao.rdf#i15318306494697210',
            checksum: '9cadd0e0490eaa6cfa5a2fb03d31ea09',
            delivery : 'http://foo.org/tao.rdf#i15313993456192149',
            testTakers: [
                'http://foo.org/tao.rdf#i15313991973207120',
                'http://foo.org/tao.rdf#i15313991749494119',
                'http://foo.org/tao.rdf#i1531144394427468'
            ]
        }, {
            id: 'http://foo.org/tao.rdf#i15313993456192149',
            checksum: 'f17139e9de85f77c80caa14f3983b43b',
            delivery : 'http://foo.org/tao.rdf#i1531144442626270',
            testTakers: [
                'http://foo.org/tao.rdf#i15313991973207120',
                'http://foo.org/tao.rdf#i1531144394427468'
            ]
        }],
        entityIds : {
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id':       'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i15318306494300209': {
                'id': 'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b',
                'properties': {
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://foo.org/tao.rdf#i1531144442626270',
                    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                        'http://foo.org/tao.rdf#i15313991973207120',
                        'http://foo.org/tao.rdf#i1531144394427468'
                    ],
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
                }
            }
        },
        add : 0,
        remove : 2,
        update : 0
    }]).asyncTest('Synchronize', function(data, assert) {

        var synchronizer = synchronizerFactory('eligibility', {});

        QUnit.expect(3);

        eligibilityServiceMock.eligibilities = data.local;
        syncClientMock.entityIds       = data.entityIds;
        syncClientMock.entitiesContent = data.entitiesContent;

        synchronizer
            .start()
            .then(function(results){

                assert.equal(results.add.length, data.add, 'The correct number of eligibilities is added');
                assert.equal(results.update.length, data.update, 'The correct number of eligibilities is udpated');
                assert.equal(results.remove.length, data.remove, 'The correct number of eligibilities is removed');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
