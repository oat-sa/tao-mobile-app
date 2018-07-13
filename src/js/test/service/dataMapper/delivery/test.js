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
 * Test the delivery data mapper
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/dataMapper/delivery'], function(deliveryDataMapper){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(2);

        assert.equal(typeof deliveryDataMapper, 'function', 'The module exposes an function');
        assert.equal(typeof deliveryDataMapper.mapping, 'object', 'The function exposes the mapping through a property');
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
                'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery 1',
            }
        },
        output : null
    }, {
        title : 'id only input',
        input : {
            id: '1234',
            checksum: 'a1b2c34'
        },
        output : {
            id: '1234',
            checksum: 'a1b2c34'
        }
    }, {
        title : 'uri only input',
        input : {
            uri: 'http://a.org/tao.rdf#i1525274752697464',
            checksum : 'a1b2c34'
        },
        output : {
            id: 'http://a.org/tao.rdf#i1525274752697464',
            checksum : 'a1b2c34'
        }
    }, {
        title : 'minimum input',
        input : {
            'id': 'http://a.org/tao.rdf#i1531144442765069',
            'checksum': '6c024dfe9d5e6276cf636356ec533412',
            'properties': {
                'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery of QTI Example Test'
            }
        },
        output : {
            id:       'http://a.org/tao.rdf#i1531144442765069',
            checksum: '6c024dfe9d5e6276cf636356ec533412',
            label:    'Delivery of QTI Example Test',
        }
    }, {
        title : 'full input',
        input : {
            'id': 'http://a.org/tao.rdf#i1531144442765068',
            'checksum': '6c024dfe9d5e6276cf636356ec533418',
            'properties': {
                'http://www.tao.lu/Ontologies/TAODelivery.rdf#DeliveryCompileTask': 'http://a.org/tao.rdf#i1531144442765068',
                'http://www.tao.lu/Ontologies/TAODelivery.rdf#DeliveryResultServer': 'http://www.tao.lu/Ontologies/taoOutcomeRds.rdf#RdsResultStorage',
                'http://www.tao.lu/Ontologies/TAODelivery.rdf#DeliveryTestRunnerFeatures': '',
                'http://www.tao.lu/Ontologies/TAODelivery.rdf#ProctorAccessible': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#ComplyDisabled',
                'http://www.taotesting.com/ontologies/synchro.rdf#OriginTestPackage': 'file://synchronisation/i1531144442626278%2Fexport.zip',
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.tao.lu/Ontologies/TAODelivery.rdf#AssembledDelivery',
                'http://www.tao.lu/Ontologies/TAO.rdf#UpdatedAt': '1525944401.2057',
                'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt': '1525274752.9149',
                'http://www.w3.org/2000/01/rdf-schema#label': 'Delivery of Advanced Test'
            }
        },
        output : {
            id:       'http://a.org/tao.rdf#i1531144442765068',
            checksum: '6c024dfe9d5e6276cf636356ec533418',
            label:    'Delivery of Advanced Test',
            updatedAt:     1525944401.2057,
            createdAt:     1525274752.9149,
        }

    }]).test('Delivery mapping ', function(data, assert) {

        var output = deliveryDataMapper(data.input);
        assert.deepEqual(output, data.output);
    });
});
