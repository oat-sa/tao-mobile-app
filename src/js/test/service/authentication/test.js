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
 * Test the authentication service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/authentication'], function(authenticationService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof authenticationService, 'object', "The module exposes an object");
    });

    QUnit.test('Component API ', function(assert) {
        assert.equal(typeof authenticationService.authenticate, 'function', 'The service exposes the authenticate method');
        assert.equal(typeof authenticationService.adapters, 'object', 'The service exposes the list of adapters');
    });


    QUnit.module('Behavior');

    QUnit.test('Validate adapter and credentials', function(assert) {
        var credentials = {
            username : 'foo',
            password : 'bar'
        };
        var adapter = {
            name : 'mock',
            authenticate : function(){
                return true;
            }
        };

        QUnit.expect(5);

        assert.throws(function(){
            authenticationService.authenticate(null, credentials);
        }, TypeError, 'a valid adapter is expected');

        assert.throws(function(){
            authenticationService.authenticate({}, credentials);
        }, TypeError, 'a valid adapter is expected');

        assert.throws(function(){
            authenticationService.authenticate({
                name: 'mock'
            }, credentials);
        }, TypeError, 'a valid adapter, with a name and authenticate method is expected');

        assert.throws(function(){
            authenticationService.authenticate({
                authenticate : function(){
                    return true;
                }
            }, credentials);
        }, TypeError, 'a valid adapter, with a name and authenticate method is expected');

        assert.throws(function(){
            authenticationService.authenticate(adapter, null);
        }, TypeError, 'a valid credentials are required');

        //do not throw
        authenticationService.authenticate(adapter, credentials);
    });

    QUnit.test('Authenticate', function(assert) {
        var credentials = {
            username : 'foo',
            password : 'bar'
        };

        var adapter = {
            name : 'mock',
            authenticate : function(config, test){
                return test.username === credentials.username &&
                    test.password === credentials.password;
            }
        };
        QUnit.expect(2);

        //do not throw
        assert.ok(authenticationService.authenticate(adapter, credentials));
        assert.ok( ! authenticationService.authenticate(adapter, { username : 'foo', password : 'foo'}));
    });

    QUnit.test('Adapter config', function(assert) {
        var credentials = {
            username : 'foo',
            password : 'bar'
        };

        QUnit.expect(6);

        authenticationService.authenticate({
            name : 'mock',
            authenticate : function(config, test){
                assert.equal(typeof config, 'undefined', 'There is no config defined for the mock adapter');
                assert.deepEqual(test, credentials, 'The credentials are macthing');
                return true;
            }
        }, credentials);

        authenticationService.authenticate({
            name : 'mock1',
            authenticate : function(config, test){
                assert.ok(config.foo, 'The mock1 adapter has a defined configuration');
                assert.deepEqual(test, credentials, 'The credentials are macthing');
                return true;
            }
        }, credentials);

        authenticationService.authenticate({
            name : 'mock2',
            authenticate : function(config, test){
                assert.ok(config.foo === false, 'The mock2 adapter has a defined configuration');
                assert.deepEqual(test, credentials, 'The credentials are macthing');
                return true;
            }
        }, credentials);

    });

});
