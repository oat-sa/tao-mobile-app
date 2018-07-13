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
    'app/service/synchronization/testTaker',
    'app/service/user',
    'app/service/synchronization/client'
], function(testTakerSyncService, userServiceMock, syncClientMock) {
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof testTakerSyncService, 'function', 'The module exposes a unique function');
    });


    QUnit.module('Behavior', {
        teardown: function teardown() {
            userServiceMock.users = {};
            syncClientMock.entityIds = {};
            syncClientMock.entitiesContent = {};
        }
    });

    QUnit.cases([{
        title : 'Add 3 new users',
        local : [],
        entityIds : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id:       'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
            },
            'http://bertaodev2/tao.rdf#i1528210157329685': {
                id:       'http://bertaodev2/tao.rdf#i1528210157329685',
                checksum: 'e4c52b04f64abd523481e20f2177f25e',
            },
            'http://bertaodev2/tao.rdf#i1528210157216886': {
                id:       'http://bertaodev2/tao.rdf#i1528210157216886',
                checksum: '418dbfe074338cbddb361aa28a758096',
            }
        },
        entitiesContent : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id: 'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'hartvictor',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'victor',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'hart',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'victor.hart72@example.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
                }
            },
            'http://bertaodev2/tao.rdf#i1528210157329685': {
                id: 'http://bertaodev2/tao.rdf#i1528210157329685',
                checksum: 'e4c52b04f64abd523481e20f2177f25e',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'joedire',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'joe',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'dire',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'jdire@example.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
                }
            },
            'http://bertaodev2/tao.rdf#i1528210157216886': {
                id: 'http://bertaodev2/tao.rdf#i1528210157216886',
                checksum: '418dbfe074338cbddb361aa28a758096',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'alexanderchole',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'jRQI1uVdDX57cfb055470fc1dcb8f41432af2e808b4d58d5e7415eaece9d21900361e282ed',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'Chloe',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'Alexander',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'alexc@example.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole',
                }
            }
        },
        add : 3,
        remove : 0,
        update : 0
    }, {
        title : 'Update a user, one remains unchanged',
        local : [{
            id:            'http://bertaodev2/tao.rdf#i1528210156143784',
            checksum:      '8faa9c360d96f666d5a2fdd2af77c2dd',
            username:      'hartvictor',
            password:      'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
            firstname:     'victor',
            lastname:      'hart',
            email:         'victor.hart72@example.com',
            originalRoles: ['http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'],
            role:          'testTaker',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }, {
            id:            'http://bertaodev2/tao.rdf#i1528210157329685',
            checksum:      'e4c52b04f64abd523481e20f2177f25e',
            username:      'joedire',
            password:      '',
            firstname:     'joe',
            lastname:      'dire',
            email:         'jdire@example.com',
            originalRoles: ['http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'],
            role:          'testTaker',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }],
        entityIds : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id:       'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
            },
            'http://bertaodev2/tao.rdf#i1528210157329685': {
                id:       'http://bertaodev2/tao.rdf#i1528210157329685',
                checksum: 'f4c52b04f64abd523481e20f2177f25f',
            }
        },
        entitiesContent : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id: 'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'hartvictor',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'victor',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'hart',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'victor.hart72@example.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
                }
            },
            'http://bertaodev2/tao.rdf#i1528210157329685': {
                id: 'http://bertaodev2/tao.rdf#i1528210157329685',
                checksum: 'f4c52b04f64abd523481e20f2177f25f',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'joedire',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'jRQI1uVdDX57cfb055470fc1dcb8f41432af2e808b4d58d5e7415eaece9d21900361e282ed',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'joe',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'dire',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': '5D1R3@protonmail.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
                }
            }
        },
        add : 0,
        remove : 0,
        update : 1
    }, {
        title : 'Remove 2 users, one remains',
        local : [{
            id:            'http://bertaodev2/tao.rdf#i1528210156143784',
            checksum:      '8faa9c360d96f666d5a2fdd2af77c2dd',
            username:      'hartvictor',
            password:      'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
            firstname:     'victor',
            lastname:      'hart',
            email:         'victor.hart72@example.com',
            originalRoles: ['http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'],
            role:          'testTaker',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }, {
            id:            'http://bertaodev2/tao.rdf#i1528210157329685',
            checksum:      'e4c52b04f64abd523481e20f2177f25e',
            username:      'joedire',
            password:      '',
            firstname:     'joe',
            lastname:      'dire',
            email:         'jdire@example.com',
            originalRoles: ['http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'],
            role:          'testTaker',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }, {
            id:            'http://bertaodev2/tao.rdf#i1528210157329686',
            checksum:      'e4c52b04f64abd523481e20f2177f25e',
            username:      'alexanderchole',
            password:      'jRQI1uVdDX57cfb055470fc1dcb8f41432af2e808b4d58d5e7415eaece9d21900361e282ed',
            firstname:     'Chloe',
            lastname:      'Alexander',
            email:         'alexc@example.com',
            originalRoles: ['http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'],
            role:          'testTaker',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }],
        entityIds : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id: 'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
            }
        },
        entitiesContent : {
            'http://bertaodev2/tao.rdf#i1528210156143784': {
                id: 'http://bertaodev2/tao.rdf#i1528210156143784',
                checksum: '8faa9c360d96f666d5a2fdd2af77c2dd',
                properties: {
                    'http://www.tao.lu/Ontologies/generis.rdf#login': 'hartvictor',
                    'http://www.tao.lu/Ontologies/generis.rdf#password': 'mwBQtYDC7E90f72d643e7c15db6ba7562007192ee0cef2b71ef235e1878f5bedebefb75318',
                    'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'victor',
                    'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'hart',
                    'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'victor.hart72@example.com',
                    'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
                }
            }
        },
        add : 0,
        remove : 2,
        update : 0
    }]).asyncTest('Synchronize', function(data, assert) {

        QUnit.expect(3);

        userServiceMock.users          = data.local;
        syncClientMock.entityIds       = data.entityIds;
        syncClientMock.entitiesContent = data.entitiesContent;

        testTakerSyncService({})
            .then(function(results){

                assert.equal(results.add.length, data.add, 'The correct number of test taker is added');
                assert.equal(results.update.length, data.update, 'The correct number of test taker is udpated');
                assert.equal(results.remove.length, data.remove, 'The correct number of test taker is removed');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
