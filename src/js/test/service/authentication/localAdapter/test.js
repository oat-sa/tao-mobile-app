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
 * Test the authentication localAdapter
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/authentication/localAdapter',
    'app/service/user'
], function(localAuthAdapter, userServiceMock){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof localAuthAdapter, 'object', "The module exposes an object");
    });

    QUnit.test('Component API ', function(assert) {
        assert.equal(typeof localAuthAdapter.authenticate, 'function', 'The adapter exposes the authenticate method');
        assert.equal(typeof localAuthAdapter.name, 'string', 'The adapter provides a name');
    });

    QUnit.module('Behavior', {
        setup: function setup(){
            userServiceMock.users = {
                psmith : {
                    id       : 1,
                    username : 'psmith',
                    password : 'yriVLUE7Eif021a516ad6407aa2d4d43cac43b5547a4fb5b0bb16be20cde42fe6d23063761'
                },
                alexanderchloe : {
                    id       : 2,
                    username : 'AlexanderChloe',
                    password : 'XhzhrBVQ6Aafc0b75f51ad3e3ec5ff4b9a838f8449b428976ece12fc7ca625b30c5994ea10'
                }
            };
        },
        teardown : function teardown(){
            userServiceMock.users = {};
        }
    });

    QUnit.cases([{
        title: 'empty credentials',
        username: '',
        password : '',
        success : false
    }, {
        title: 'null credentials',
        username: null,
        password : null,
        success : false
    }, {
        title: 'valid username valid password',
        username: 'psmith',
        password : 'Paulsmith123%%',
        success : true
    }, {
        title: 'valid username with different case and valid password',
        username: 'pSmItH',
        password : 'Paulsmith123%%',
        success : true
    }, {
        title: 'valid username wrong password',
        username: 'psmith',
        password : '123',
        success : false
    }, {
        title: 'valid username valid password but wrong case',
        username: 'psmith',
        password : 'PAULsmith123%%',
        success : false
    }, {
        title: 'another valid username and password',
        username: 'alexanderchloe',
        password : 'Foobar123%%',
        success : true
    }, {
        title: 'invalid username',
        username: 'lexanderchloe',
        password : 'Foobar123%%',
        success : false
    }]).asyncTest('authenticate', function(data, assert) {

        QUnit.expect(1);

        localAuthAdapter.authenticate({}, {
            username : data.username,
            password : data.password
        })
        .then( function(result) {

            assert.equal(result.success, data.success, 'The authentication result matches');
            QUnit.start();
        })
        .catch( function(err) {

            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
