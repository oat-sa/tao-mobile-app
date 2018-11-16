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
 * Test the URI service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/core/uri'], function(uri){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof uri, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'create' },
    ]).test('Service API ', function(data, assert) {
        assert.equal(typeof uri[data.title], 'function', 'The service exposes the method "' + data.title);
    });

    QUnit.module('Behavior');

    QUnit.test('createUri', function(assert) {

        var uri1 = uri.create();
        var uri2 = uri.create();

        assert.equal(typeof uri1, 'string', 'The produced URI is a string');
        assert.notEqual(uri1, uri2, 'Produced uri are different');
        assert.ok(/^http:\/\/app.taocloud.org\/unit-test-device\/taoApp\.rdf#i/.test(uri1), 'The URI matches the pattern');
        assert.ok(/^http:\/\/app.taocloud.org\/unit-test-device\/taoApp\.rdf#i/.test(uri2), 'The URI matches the pattern');

    });

});
