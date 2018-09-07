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
 * Test the eligibility data mapper
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/dataMapper/eligibility'], function(eligibilityDataMapper){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(2);

        assert.equal(typeof eligibilityDataMapper, 'function', 'The module exposes an function');
        assert.equal(typeof eligibilityDataMapper.mapping, 'object', 'The function exposes the mapping through a property');
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
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                    'http://a.org/tao.rdf#i15313991749494119',
                    'http://a.org/tao.rdf#i1531144394427468'
                ],
            }
        },
        output : null
    }, {
        title : 'id only input',
        input : {
            id: 'i1531144478419294',
            checksum: '10bd6a8dbd546f13d8c74dfff9dea3501234'
        },
        output : {
            id: 'i1531144478419294',
            checksum: '10bd6a8dbd546f13d8c74dfff9dea3501234'
        }
    }, {
        title : 'uri only input',
        input : {
            uri: 'http://a.org/tao.rdf#i1531144478419294',
            checksum : '1234'
        },
        output : {
            id: 'http://a.org/tao.rdf#i1531144478419294',
            checksum : '1234'
        }
    }, {
        title : 'minimum input',
        input : {
            id: 'http://a.org/tao.rdf#i1531144478419294',
            checksum: '10bd6a8dbd546f13d8c74dfff9dea350',
            properties: {
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://a.org/tao.rdf#i1531144442626270',
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                    'http://a.org/tao.rdf#i15313991749494119',
                    'http://a.org/tao.rdf#i1531144394427468'
                ]
            }
        },
        output : {
            id:       'http://a.org/tao.rdf#i1531144478419294',
            checksum: '10bd6a8dbd546f13d8c74dfff9dea350',
            delivery: 'http://a.org/tao.rdf#i1531144442626270',
            testTakers: [
                'http://a.org/tao.rdf#i15313991749494119',
                'http://a.org/tao.rdf#i1531144394427468'
            ]
        }
    }, {
        title : 'full input',
        input : {
            id: 'http://a.org/tao.rdf#i15313993705227171',
            checksum: '49db2de97a7187747131ef7b64e460c9',
            properties: {
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#ByPassProctor': 'http://www.tao.lu/Ontologies/generis.rdf#True',
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery': 'http://a.org/tao.rdf#i15313993456192149',
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestCenter': 'http://a.org/tao.rdf#i153114431595465',
                'http://www.tao.lu/Ontologies/TAO.rdf#UpdatedAt': '1525944401.2057',
                'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt': '1525274752.9149',
                'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker': [
                    'http://a.org/tao.rdf#i1531144394427468',
                    'http://a.org/tao.rdf#i15313991749494119',
                    'http://a.org/tao.rdf#i15313991973207120'
                ],
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAOProctor.rdf#DeliveryEligibility'
            }
        },
        output : {
            id:       'http://a.org/tao.rdf#i15313993705227171',
            checksum: '49db2de97a7187747131ef7b64e460c9',
            delivery: 'http://a.org/tao.rdf#i15313993456192149',
            testTakers: [
                'http://a.org/tao.rdf#i1531144394427468',
                'http://a.org/tao.rdf#i15313991749494119',
                'http://a.org/tao.rdf#i15313991973207120'
            ],
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }

    }]).test('Eligibility mapping ', function(data, assert) {

        var output = eligibilityDataMapper(data.input);
        assert.deepEqual(output, data.output);
    });
});
