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
 * Test the user data mapper
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/dataMapper/user'], function(userDataMapper){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(2);

        assert.equal(typeof userDataMapper, 'function', 'The module exposes an function');
        assert.equal(typeof userDataMapper.mapping, 'object', 'The function exposes the mapping through a property');
    });


    QUnit.module('Behavior');

    QUnit.cases([{
        title : 'null input',
        input : null,
        output : null
    }, {
        title : 'empty input',
        input : {},
        output : null
    }, {
        title : 'without an id input',
        input : {
            properties : {
                'http://www.tao.lu/Ontologies/generis.rdf#login': 'psmith',
            }
        },
        output : null
    }, {
        title : 'id only input',
        input : {
            id: '1234',
            checksum: '1234'
        },
        output : {
            id: '1234',
            checksum: '1234'
        }
    }, {
        title : 'uri only input',
        input : {
            uri: 'http://a.org/tao.rdf#i1525274752697464',
            checksum : '1234'
        },
        output : {
            id: 'http://a.org/tao.rdf#i1525274752697464',
            checksum : '1234'
        }
    }, {
        title : 'full input',
        input : {
            'id': 'http://a.org/tao.rdf#i1525274752697464',
            'checksum': 'f4c19fff572ac1981ce560c29e5e8564',
            'properties': {
                'http://www.tao.lu/Ontologies/generis.rdf#login': 'psmith',
                'http://www.tao.lu/Ontologies/generis.rdf#password': 'TSzCwsPz7358eee9cd2780ac9e8912a7cb08e4da246697eb5dfd5d181c050e63366a25cab1',
                'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'Paul',
                'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'Smith',
                'http://www.tao.lu/Ontologies/generis.rdf#userMail': 'psmith@noone.net',
                'http://www.tao.lu/Ontologies/generis.rdf#userRoles': 'http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager',
                'http://www.tao.lu/Ontologies/generis.rdf#userUILg': 'http://www.tao.lu/Ontologies/TAO.rdf#Langen-US',
                'http://www.tao.lu/Ontologies/TAO.rdf#FirstTimeInTao': 'http://www.tao.lu/Ontologies/generis.rdf#False',
                'http://www.tao.lu/Ontologies/TAO.rdf#LastExtensionUsed': 'tao/Main/index?structure=synchronization&ext=taoSync',
                'http://www.tao.lu/Ontologies/TAOTestCenter#UserAssignment': [
                    'http://a.org/tao.rdf#i1531144478419294',
                    'http://a.org/tao.rdf#i15313993705227171'
                ],
                'http://www.tao.lu/Ontologies/TAO.rdf#UpdatedAt': '1525944401.2057',
                'http://www.tao.lu/Ontologies/taoSync.rdf#ConsumerUser': 'http://a.org/tao.rdf#i15259444011408235',
                'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt': '1525274752.9149',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAO.rdf#User',
                'http://www.w3.org/2000/01/rdf-schema#label': 'User 2'
            }
        },
        output : {
            id:            'http://a.org/tao.rdf#i1525274752697464',
            checksum:      'f4c19fff572ac1981ce560c29e5e8564',
            username:      'psmith',
            password:      'TSzCwsPz7358eee9cd2780ac9e8912a7cb08e4da246697eb5dfd5d181c050e63366a25cab1',
            firstname:     'Paul',
            lastname:      'Smith',
            email:         'psmith@noone.net',
            originalRoles: ['http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager'],
            role:          'syncManager',
            assignment:    ['http://a.org/tao.rdf#i1531144478419294', 'http://a.org/tao.rdf#i15313993705227171'],
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }
    }, {
        title : 'incomplete input and mulitple roles',
        input : {
            'id': 'http://a.org/tao.rdf#i1525274752697464',
            'checksum': 'a1b2c3d4',
            'properties': {
                'http://www.tao.lu/Ontologies/generis.rdf#login': 'psmith',
                'http://www.tao.lu/Ontologies/generis.rdf#password': 'TSzCwsPz7358eee9cd2780ac9e8912a7cb08e4da246697eb5dfd5d181c050e63366a25cab1',
                'http://www.tao.lu/Ontologies/generis.rdf#userFirstName': 'Paul',
                'http://www.tao.lu/Ontologies/generis.rdf#userLastName': 'Smith',
                'http://www.tao.lu/Ontologies/generis.rdf#userRoles': [
                    'http://www.tao.lu/Ontologies/generis.rdf#taoSystemAdmin',
                    'http://www.tao.lu/Ontologies/generis.rdf#taoBackOfficeRole',
                    'http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager',
                ],
                'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt': '1525274752.9149',
            }
        },
        output : {
            id:            'http://a.org/tao.rdf#i1525274752697464',
            checksum:      'a1b2c3d4',
            username:      'psmith',
            password:      'TSzCwsPz7358eee9cd2780ac9e8912a7cb08e4da246697eb5dfd5d181c050e63366a25cab1',
            firstname:     'Paul',
            lastname:      'Smith',
            originalRoles: [
                'http://www.tao.lu/Ontologies/generis.rdf#taoSystemAdmin',
                'http://www.tao.lu/Ontologies/generis.rdf#taoBackOfficeRole',
                'http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager',
            ],
            role:          'syncManager',
            createdAt:     1525274752.9149,
        }
    }]).test('User mapping ', function(data, assert) {

        var output = userDataMapper(data.input);
        assert.deepEqual(output, data.output);
    });
});
