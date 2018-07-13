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
 * Test the token service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/synchronization/token',
], function(tokenServiceFactory) {
    'use strict';

    var dummyConfig = {
        key: 'none',
        secret: 'none'
    };

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);
        assert.equal(typeof tokenServiceFactory, 'function', 'The module exposes a unique function');
    });

    QUnit.test('factory', function(assert) {
        QUnit.expect(5);

        assert.throws(function() {
            tokenServiceFactory();
        }, TypeError, 'The factory requires a valid configuration');

        assert.throws(function() {
            tokenServiceFactory({
                key: 'foo'
            });
        }, TypeError, 'The factory requires a complete configuration');

        assert.throws(function() {
            tokenServiceFactory({
                secret: 'bar'
            });
        }, TypeError, 'The factory requires a complete configuration');

        assert.equal(typeof tokenServiceFactory(dummyConfig), 'object', 'The factory produces an object');

        assert.notDeepEqual(tokenServiceFactory(dummyConfig), tokenServiceFactory(dummyConfig), 'The factory creates a new object');
    });

    QUnit.cases([{
        title: 'isExpired'
    }, {
        title: 'getToken'
    }, {
        title: 'requestToken'
    }, ]).test('token service API ', function(data, assert) {
        assert.equal(typeof tokenServiceFactory(dummyConfig)[data.title], 'function', 'The service exposes the method "' + data.title);
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('request token wrong keys', function(assert) {

        QUnit.expect(2);

        tokenServiceFactory(dummyConfig)
            .requestToken()
            .then(function() {
                assert.ok(false, 'With wrong keys the method should not resolve');
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(err instanceof Error, 'Bad request params, we got an error');
                assert.equal(err.message, 'unauthorized', 'The error message is correct');
                QUnit.start();
            });
    });

    QUnit.asyncTest('request a token', function(assert) {

        QUnit.expect(3);

        tokenServiceFactory({
            key: 'foo',
            secret: 'bar'
        })
        .requestToken()
        .then(function(token) {
            assert.equal(typeof token, 'object', 'The token is a plain object');
            assert.equal(token.access_token, 'xeeXO0tqLFca097e1d6f2f0987d45b8ba13994692248bcba31f4edf2233483e4a84818ee45', 'The token is correct');
            assert.ok(token.expires > 0, 'An expiration date is provided');

            QUnit.start();
        })
        .catch(function(err) {
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('get the current token', function(assert) {
        var tokenService;

        QUnit.expect(4);

        tokenService = tokenServiceFactory({
            key: 'foo',
            secret: 'bar'
        });

        tokenService
            .getToken()
            .then(function(token) {
                assert.equal(typeof token, 'object', 'The token is a plain object');
                assert.equal(token.access_token, 'xeeXO0tqLFca097e1d6f2f0987d45b8ba13994692248bcba31f4edf2233483e4a84818ee45', 'The token is correct');
                assert.ok(token.expires > 0, 'An expiration date is provided');

                return tokenService
                    .getToken()
                    .then(function(newToken) {
                        assert.deepEqual(newToken, token, 'The method does not request a new token');
                    });
            })
            .then(function() {
                QUnit.start();
            })
            .catch(function(err) {
                assert.ok(false, err.message);
                QUnit.start();
            });

    });
});
