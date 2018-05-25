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
 * Test the login component
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/component/login/login'], function(loginComponentFactory){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof loginComponentFactory, 'function', "The module exposes a function");
        assert.equal(typeof loginComponentFactory(), 'object', "The factory produces an object");
        assert.notStrictEqual(loginComponentFactory(), loginComponentFactory(), "The factory provides a different object on each call");
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
        var instance = loginComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The loginComponentFactory exposes the component method "' + data.title);
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        var instance = loginComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The loginComponentFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'submit' },
        { title : 'canSubmit' },
        { title : 'getRawValues' },
        { title : 'getFormValues' },
        { title : 'reset' },
        { title : 'loginError' },
    ]).test('Instance API ', function(data, assert) {
        var instance = loginComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The loginComponentFactory exposes the method "' + data.title + '"');
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(2);

        loginComponentFactory(container)
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

    QUnit.asyncTest('Rendering', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(8);

        assert.equal(container.querySelector('.login'), null, 'The component does not exists yet');

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];
                assert.deepEqual(container.querySelector('.login'), element, 'The component exists');

                assert.ok(element.querySelectorAll('form').length, 1, 'The <form> tag is added');
                assert.ok(element.querySelectorAll('form input').length, 2, 'The form contains 2 inputs');
                assert.ok(element.querySelectorAll('input[type="text"][name="username"]').length, 1, 'The username field is added');
                assert.ok(element.querySelectorAll('input[type="password"][name="password"]').length, 1, 'The password field is added');
                assert.ok(element.querySelectorAll('.actions button').length, 1, 'The login button is added');
                assert.ok(element.querySelectorAll('form input[type="submit"]').length, 1, 'The form has a submit input to trigger virtual keyboard submit');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Can Submit', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(8);

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.equal( this.canSubmit(), false, 'The component is not submitable, the fields are empty');
                assert.equal( this.is('submitable'), false, 'The component is not in the "submitable" state');

                assert.ok(usernameField instanceof HTMLInputElement);
                assert.ok(passwordField instanceof HTMLInputElement);

                usernameField.value = 'negan';

                assert.equal( this.canSubmit(), false, 'The component is not submitable, one field is empty');
                assert.equal( this.is('submitable'), false, 'The component is not in the "submitable" state');

                passwordField.value = 'Lucile123!!';

                assert.equal( this.canSubmit(), true, 'The component is now submitable');
                assert.equal( this.is('submitable'), true, 'The component is now in the "submitable" state');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Submit invalid form', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(3);

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];

                assert.equal( this.canSubmit(), false, 'The component is not submitable, one field is empty');
                assert.equal( this.is('submitable'), false, 'The component is not in the "submitable" state');

                //try to submit
                element.querySelector('.actions button').click();
                this.submit();

                setTimeout(function(){
                    assert.ok(true, 'The form is not submitted');
                    QUnit.start();
                }, 250);

            })
            .on('submit', function(){
                assert.ok(false, 'The form should not submit');
                QUnit.start();
            });
    });

    QUnit.asyncTest('Submit', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(8);

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.ok(usernameField instanceof HTMLInputElement);
                assert.ok(passwordField instanceof HTMLInputElement);

                assert.deepEqual(this.getRawValues(), {});

                usernameField.value = 'negan';
                passwordField.value = 'Lucile123!!';

                element.querySelector('.actions button').click();

            })
            .on('submit', function(values){
                var formData = this.getFormValues();
                var expected = {
                    username : 'negan',
                    password : 'Lucile123!!'
                };
                assert.deepEqual(values, expected);
                assert.deepEqual(this.getRawValues(), expected);

                assert.ok(formData instanceof FormData);
                assert.equal(formData.get('username'), expected.username);
                assert.equal(formData.get('password'), expected.password);

                QUnit.start();
            });
    });

    QUnit.asyncTest('Reset', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(7);

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.ok(usernameField instanceof HTMLInputElement);
                assert.ok(passwordField instanceof HTMLInputElement);

                usernameField.value = 'negan';
                passwordField.value = 'Lucile123!!';

                assert.equal( this.canSubmit(), true, 'The component is now submitale');
                assert.equal( this.is('submitable'), true, 'The component is now in the "submitable" state');

                this.reset();
            })
            .on('reset', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.equal(usernameField.value, '', 'The username field is empty');
                assert.equal(passwordField.value, '', 'The password field is empty');

                assert.equal( this.is('submitable'), false, 'The component is not in the "submitable" state anymore');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Login Error', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(12);

        loginComponentFactory(container, {})
            .on('render', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.ok(usernameField instanceof HTMLInputElement);
                assert.ok(passwordField instanceof HTMLInputElement);

                usernameField.value = 'negan';
                passwordField.value = 'Lucile123!!';

                assert.equal( this.canSubmit(), true, 'The component is now submitale');
                assert.equal( this.is('submitable'), true, 'The component is now in the "submitable" state');
                assert.equal( this.is('error'), false, 'The component is not in "error" state');

                this.loginError('invalid field');
            })
            .on('loginerror', function(){
                var element = this.getElement()[0];
                var usernameField = element.querySelector('input[name="username"]');
                var passwordField = element.querySelector('input[name="password"]');

                assert.equal(usernameField.value, 'negan', 'The username field value is kept');
                assert.equal(passwordField.value, 'Lucile123!!', 'The password field value is kept');
                assert.equal(element.querySelector('.txt-error').textContent, 'invalid field', 'The field errors have been updated');

                assert.equal( this.is('error'), true, 'The component is now in "error" state');
                assert.equal( this.is('submitable'), false, 'The component is not in the "submitable" state anymore');

                //focus one field to change the state
                usernameField.focus();

                setTimeout( () => {
                    assert.equal( this.is('error'), false, 'The component is not in "error" state');
                    assert.equal( this.is('submitable'), true, 'The component is "submitable"');

                    QUnit.start();
                }, 10);
            });
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('Rendering', function(assert) {
        var container = document.getElementById('visual-container');

        QUnit.expect(1);

        assert.equal(container.querySelector('.login'), null, 'The component does not exists yet');

        loginComponentFactory(container, { baseUrl : '../../www/'})
            .on('render', function(){
                QUnit.start();
            });
    });
});
