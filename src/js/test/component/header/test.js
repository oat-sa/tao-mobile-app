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
 * Test the header component
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/component/header/header'], function(headerComponentFactory){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof headerComponentFactory, 'function', "The module exposes a function");
        assert.equal(typeof headerComponentFactory(), 'object', "The factory produces an object");
        assert.notStrictEqual(headerComponentFactory(), headerComponentFactory(), "The factory provides a different object on each call");
    });

    QUnit.cases([
        { title : 'init' },
        { title : 'destroy' },
        { title : 'render' },
        { title : 'show' },
        { title : 'hide' },
        { title : 'enable' },
        { title : 'disable' },
        { title : 'is' },
        { title : 'setState' },
        { title : 'getContainer' },
        { title : 'getElement' },
        { title : 'getTemplate' },
        { title : 'setTemplate' },
    ]).test('Component API ', function(data, assert) {
        var instance = headerComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The headerComponentFactory exposes the component method "' + data.title);
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        var instance = headerComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The headerComponentFactory exposes the eventifier method "' + data.title);
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(2);

        headerComponentFactory(container)
            .on('init', function(){
                assert.ok( !this.is('rendered'), 'The component is not rendered');
            })
            .on('render', function(){
                assert.ok(this.is('rendered'), 'The component is now rendered');

                this.destroy();
            })
            .on('destroy', function(){
                QUnit.start();
            });
    });

    QUnit.asyncTest('Rendering with fisrt and lastname', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(8);

        assert.equal(container.querySelector('header'), null, 'The component does not exists yet');

        headerComponentFactory(container, {
            title : 'Foo',
            user : {
                firstname : 'John',
                lastname  : 'Doe'
            }
        })
        .on('render', function(){
            var element = this.getElement()[0];
            assert.deepEqual(container.querySelector('header'), element, 'The component exists');

            assert.ok(element.querySelectorAll('h1').length, 1, 'The <title> tag is added');
            assert.equal(element.querySelector('h1').textContent.trim(), 'Foo', 'The title is correct');
            assert.ok(element.querySelectorAll('.profile').length, 1, 'The profile element is added');
            assert.equal(element.querySelector('.profile').textContent.trim(), 'John Doe',  'The profile contains the user first and lastname');
            assert.ok(element.querySelectorAll('nav > a').length, 1, 'The header contains one action');
            assert.equal(element.querySelector('nav > a').dataset.route, 'main/logout', 'The default action route is correct');

            QUnit.start();
        });
    });

    QUnit.asyncTest('Rendering with login', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(4);

        assert.equal(container.querySelector('header'), null, 'The component does not exists yet');

        headerComponentFactory(container, {
            title : 'Foo',
            user : {
                login : 'jdoe'
            }
        })
        .on('render', function(){
            var element = this.getElement()[0];
            assert.deepEqual(container.querySelector('header'), element, 'The component exists');

            assert.ok(element.querySelectorAll('.profile').length, 1, 'The profile element is added');
            assert.equal(element.querySelector('.profile').textContent.trim(), 'jdoe',  'The profile contains the user login');

            QUnit.start();
        });
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('Rendering', function(assert) {
        var container = document.getElementById('visual-container');

        QUnit.expect(1);

        assert.equal(container.querySelector('.header'), null, 'The component does not exists yet');

        headerComponentFactory(container, { baseUrl : '../../www/'})
            .on('render', function(){
                QUnit.start();
            });
    });
});
