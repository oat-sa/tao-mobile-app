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
 * Test the timestamp helper
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/core/timestamp'], function(timestampHelper){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof timestampHelper, 'object', "The module exposes an object");
    });

    QUnit.module('Behavior');

    QUnit.test('toMicrotime', function(assert) {

        assert.throws(function(){
            timestampHelper.toMicrotime('abcd');
        }, TypeError, 'Bad parameter');

        assert.throws(function(){
            timestampHelper.toMicrotime(1543);
        }, TypeError, 'Bad parameter');

        assert.throws(function(){
            timestampHelper.toMicrotime(1543439965);
        }, TypeError, 'Timestamp should be in milliseconds');

        assert.equal(timestampHelper.toMicrotime(1543439655727), '0.72700000 1543439655', 'The produced microTime is correct');
        assert.equal(timestampHelper.toMicrotime('1543439751691'), '0.69100000 1543439751', 'The produced microTime is correct');
    });

});
