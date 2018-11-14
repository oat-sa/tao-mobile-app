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
 * Test the session service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/core/router'], function(router){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        assert.equal(typeof router, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        assert.equal(typeof router[data.title], 'function', 'The router exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'dispatch' },
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof router[data.title], 'function', 'The router exposes the method "' + data.title);
    });


    QUnit.module('Behavior', {
        setup: function setup(){
            router.off('dispatching dispatched');
        }
    });

    QUnit.asyncTest('Dispatch a route', function(assert) {
        var p;
        var dispatched = false;
        QUnit.expect(6);

        router
            .on('dispatching', function(route, taoRoute){
                assert.equal(route, 'test/index', 'The dispatching route is correct');
                assert.equal(taoRoute, 'app/test/index', 'The internale routes are mapped to the fake app extension');
                assert.equal(dispatched, false, 'Dispatching preceeds dispatched');
            })
            .on('dispatched', function(route, taoRoute){
                dispatched = true;
                assert.equal(route, 'test/index', 'The dispatching route is correct');
                assert.equal(taoRoute, 'app/test/index', 'The internale routes are mapped to the fake app extension');

                QUnit.start();
            });

        p = router.dispatch('test/index');
        assert.ok(p instanceof Promise, 'dispatch returns a promise');

        p.catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Dispatch a route with parameters', function(assert) {
        var parameters = {
            test : true,
            foo  : ['bar', 'baz']
        };
        QUnit.expect(6);

        router
            .on('dispatching', function(route, taoRoute, params){
                assert.equal(route, 'test/index', 'The dispatching route is correct');
                assert.equal(taoRoute, 'app/test/index', 'The internale routes are mapped to the fake app extension');
                assert.deepEqual(params, parameters, 'The given parameters are sent through the events');
            })
            .on('dispatched', function(route, taoRoute, params){
                assert.equal(route, 'test/index', 'The dispatching route is correct');
                assert.equal(taoRoute, 'app/test/index', 'The internale routes are mapped to the fake app extension');
                assert.deepEqual(params, parameters, 'The given parameters are sent through the events');

                QUnit.start();
            });

        router
            .dispatch('test/index', parameters)
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('Fail dispatching', function(assert) {
        QUnit.expect(5);

        router
            .on('dispatching', function(route, taoRoute){
                assert.equal(route, 'test/timeout', 'The dispatching events is triggered anyway');
                assert.equal(taoRoute, 'app/test/timeout', 'The extension replacement took place');
            })
            .on('dispatched', function(){
                assert.ok(false, 'The route should not dispatch');
            });

        setTimeout(function(){
            assert.ok(true, 'The failure should occur after the defined timeout of 500ms (test value)');
        }, 475);

        router
            .dispatch('test/timeout')
            .then(function(){
                assert.ok(false, 'The route should not dispatch');
                QUnit.start();
            })
            .catch(function(err){
                assert.ok(true, 'The route cannot dispatch it does not exists');
                assert.equal(err.message, 'Timeout : unable to dispatch the route test/timeout', 'The rejection error is correct');
                QUnit.start();
            });
    });

});
