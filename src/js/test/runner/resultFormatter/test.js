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
 * Test the result formatter
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/runner/resultFormatter'
], function(resultFormatter){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof resultFormatter, 'function', "The module exposes a function");
    });


    QUnit.module('Format');

    QUnit.cases([{
        title : 'single identifier',
        cardinality : 'single',
        baseType : 'identifier',
        value : 'choice_2',
        formatted : "'choice_2'",
    }, {
        title : 'single NULL identifier',
        cardinality : 'single',
        baseType : 'identifier',
        value : null,
        formatted : null
    }, {
        title : 'single string',
        cardinality : 'single',
        baseType : 'string',
        value : 'foo',
        formatted : 'foo'
    }, {
        title : 'single NULL string',
        cardinality : 'single',
        baseType : 'string',
        value : null,
        formatted : null
    }, {
        title : 'single integer',
        cardinality : 'single',
        baseType : 'integer',
        value : 123,
        formatted : '123'
    }, {
        title : 'single float',
        cardinality : 'single',
        baseType : 'float',
        value : 3.51624,
        formatted : '3.51624'
    }, {
        title : 'single point',
        cardinality : 'single',
        baseType : 'point',
        value : [254, 427],
        formatted : '254 427'
    }, {
        title : 'single pair',
        cardinality : 'single',
        baseType : 'pair',
        value : ['choice_1', 'gap_1'],
        formatted : 'choice_1 gap_1'
    }, {
        title : 'single directedPair',
        cardinality : 'single',
        baseType : 'directedPair',
        value : ['choice_1', 'gapimg_1'],
        formatted : 'choice_1 gapimg_1'
    }, {
        title : 'multiple identifiers',
        cardinality : 'multiple',
        baseType : 'identifier',
        value : ['choice_1', 'choice_3', 'choice_8'],
        formatted : "['choice_1'; 'choice_3'; 'choice_8']"
    }, {
        title : 'ordered identifiers',
        cardinality : 'ordered',
        baseType : 'identifier',
        value : ['choice_1', 'choice_3', 'choice_8'],
        formatted : "<'choice_1'; 'choice_3'; 'choice_8'>"
    }, {
        title : 'multiple directedPair',
        cardinality : 'multiple',
        baseType : 'directedPair',
        value : [['choice_1', 'gap_1'], ['choice_3', 'gap_4'], ['choice_8', 'gap_12']],
        formatted : "[choice_1 gap_1; choice_3 gap_4; choice_8 gap_12]"
    }, {
        title : 'ordered pair',
        cardinality : 'ordered',
        baseType : 'pair',
        value : [['choice_1', 'gap_1'], ['choice_3', 'gap_4'], ['choice_8', 'gap_12']],
        formatted : "<choice_1 gap_1; choice_3 gap_4; choice_8 gap_12>"
    }]).test('of type ', function(data, assert) {

        QUnit.expect(1);

        assert.deepEqual(resultFormatter(data.cardinality, data.baseType, data.value), data.formatted, 'The result matches');
    });
});
