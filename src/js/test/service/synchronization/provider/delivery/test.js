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
 * Test the delivery sync provider
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/synchronization/synchronizer',
    'app/service/synchronization/provider/delivery',
    'app/service/delivery',
    'app/service/synchronization/client'
], function(synchronizerFactory, deliverySyncProvider, deliveryServiceMock, syncClientMock) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof deliverySyncProvider, 'object', 'The module exposes a plain object');
    });

    QUnit.test('syncProvider', function(assert) {
        assert.equal(typeof deliverySyncProvider.name, 'string', 'The provider exposes a name');
        assert.equal(deliverySyncProvider.direction, 'fetch', 'The provider is a fetch provider');
        assert.equal(typeof deliverySyncProvider.init, 'function', 'The provider exposes an init method');
        assert.equal(typeof deliverySyncProvider.getRemoteResourceIds, 'function', 'The provider exposes an getRemoteResourceIds method');
        assert.equal(typeof deliverySyncProvider.getRemoteResources, 'function', 'The provider exposes a getRemoteResources method');
        assert.equal(typeof deliverySyncProvider.getLocalResources, 'function', 'The provider exposes a getLocalResources method');
        assert.equal(typeof deliverySyncProvider.addResource, 'function', 'The provider exposes an addResource method');
        assert.equal(typeof deliverySyncProvider.updateResource, 'function', 'The provider exposes an updateResource method');
        assert.equal(typeof deliverySyncProvider.removeResource, 'function', 'The provider exposes a removeResource method');
    });


    QUnit.module('Behavior', {
        setup : function setup(){
            synchronizerFactory.registerProvider('delivery', deliverySyncProvider);
        },
        teardown: function teardown() {
            synchronizerFactory.clearProviders();
            deliveryServiceMock.deliveries = {};
            syncClientMock.entityIds = {};
            syncClientMock.entitiesContent = {};
        }
    });

    QUnit.cases([{
        title : 'Add 2 new deliveries',
        local : [],
        entityIds : {
            'http://foo.org/tao.rdf#i1531144442626270': {
                'id': 'http://foo.org/tao.rdf#i1531144442626270',
                'checksum': '6c024dfe9d5e6276cf636356ec533412'
            },
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id': 'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43a'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i1531144442626270': {
                'id': 'http://foo.org/tao.rdf#i1531144442626270',
                'checksum': '6c024dfe9d5e6276cf636356ec533412',
                'properties': {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                    'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery of QTI Example Test'
                }
            },
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id': 'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43a',
                'properties': {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                    'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery of Test 5'
                }
            },
        },
        add : 2,
        remove : 0,
        update : 0
    }, {
        title : 'Update one delivery',
        local : [{
            id:            'http://foo.org/tao.rdf#i1531144442626270',
            checksum:      '6c024dfe9d5e6276cf636356ec533412',
            label:         'Delivery of QTI Example Test',
        }, {
            id:            'http://foo.org/tao.rdf#i15313993456192149',
            checksum:      'f17139e9de85f77c80caa14f3983b43a',
            label:         'Delivery of Test 5',
        }],
        entityIds : {
            'http://foo.org/tao.rdf#i1531144442626270': {
                'id':       'http://foo.org/tao.rdf#i1531144442626270',
                'checksum': '6c024dfe9d5e6276cf636356ec533412'
            },
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id':       'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i1531144442626270': {
                'id': 'http://foo.org/tao.rdf#i1531144442626270',
                'checksum': '6c024dfe9d5e6276cf636356ec533412',
                'properties': {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                    'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery of QTI Example Test'
                }
            },
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id': 'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b',
                'properties': {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                    'http://www.w3.org/2000/01/rdf-schema#label': 'Test 5 published'
                }
            }
        },
        add : 0,
        remove : 0,
        update : 1
    }, {
        title : 'Remove one user',
        local : [{
            id:            'http://foo.org/tao.rdf#i1531144442626270',
            checksum:      '6c024dfe9d5e6276cf636356ec533412',
            label:         'Delivery of QTI Example Test'
        }, {
            id:            'http://foo.org/tao.rdf#i15313993456192149',
            checksum:      'f17139e9de85f77c80caa14f3983b43b',
            label:         'Test 5 published'
        }],
        entityIds : {
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id':       'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b'
            }
        },
        entitiesContent : {
            'http://foo.org/tao.rdf#i15313993456192149': {
                'id': 'http://foo.org/tao.rdf#i15313993456192149',
                'checksum': 'f17139e9de85f77c80caa14f3983b43b',
                'properties': {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                    'http://www.w3.org/2000/01/rdf-schema#label': 'Test 5 published'
                }
            }
        },
        add : 0,
        remove : 1,
        update : 0
    }]).asyncTest('Synchronize', function(data, assert) {

        var synchronizer = synchronizerFactory('delivery', {});

        QUnit.expect(3);

        deliveryServiceMock.deliveries = data.local;
        syncClientMock.entityIds       = data.entityIds;
        syncClientMock.entitiesContent = data.entitiesContent;

        synchronizer
            .start()
            .then(function(results){

                assert.equal(results.add.length, data.add, 'The correct number of deliveries is added');
                assert.equal(results.update.length, data.update, 'The correct number of deliveries is udpated');
                assert.equal(results.remove.length, data.remove, 'The correct number of deliveries is removed');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
