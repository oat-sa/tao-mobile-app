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
 * Test the wipeout component
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/component/wipeout/wipeout'], function(wipeoutComponentFactory){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof wipeoutComponentFactory, 'function', "The module exposes a function");
        assert.equal(typeof wipeoutComponentFactory(), 'object', "The factory produces an object");
        assert.notStrictEqual(wipeoutComponentFactory(), wipeoutComponentFactory(), "The factory provides a different object on each call");
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
        var instance = wipeoutComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The wipeoutComponentFactory exposes the component method "' + data.title);
    });

    QUnit.cases([
        { title : 'on' },
        { title : 'off' },
        { title : 'trigger' },
        { title : 'before' },
        { title : 'after' },
    ]).test('Eventifier API ', function(data, assert) {
        var instance = wipeoutComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The wipeoutComponentFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([
        { title : 'apply' },
        { title : 'reset' },
    ]).test('Instance API ', function(data, assert) {
        var instance = wipeoutComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The wipeoutComponentFactory exposes the method "' + data.title + '"');
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(2);

        wipeoutComponentFactory(container)
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

        QUnit.expect(6);

        assert.equal(container.querySelector('.wipeout'), null, 'The component does not exists yet');

        wipeoutComponentFactory(container, {
            buttonLabel : 'remove all',
            description : 'remove all'
        })
            .on('render', function(){
                var element = this.getElement()[0];
                assert.deepEqual(container.querySelector('.wipeout'), element, 'The component exists');

                assert.ok(element.querySelectorAll('button').length, 1, 'The <button> tag is added');
                assert.ok(element.querySelector('button').textContent.trim(), 'remove all', 'The button label is set according to the config');
                assert.ok(element.querySelectorAll('.desc').length, 1, 'The description field is added');
                assert.ok(element.querySelector('.desc').textContent.trim(), 'remove all', 'The description is set according to the config');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Apply wipeout', function(assert) {
        var container = document.getElementById('qunit-fixture');
        var wipeout;

        QUnit.expect(7);

        wipeout = wipeoutComponentFactory(container)
            .on('render', function(){
                var element = this.getElement()[0];
                var button = element.querySelector('button');
                var modal = document.querySelector('.modal');

                assert.ok(button instanceof HTMLElement, 'The button exists');
                assert.equal(modal, null, 'There is no modal');

                assert.equal(this.is('waiting'), false, 'The component is not in waiting state');

                setTimeout(function(){
                    modal = document.querySelector('.modal');
                    assert.ok(modal instanceof HTMLElement, 'The modal has been created');
                    assert.ok(wipeout.is('waiting'), 'The component is now in waiting state');

                    modal.querySelector('.ok').click();
                }, 100);

                button.click();
            })
            .on('wipeout', function(){
                assert.ok(true, 'Wipeout called');
                assert.ok(this.is('waiting'), 'The component remains in waiting state!');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Dynamic confirm message', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(5);

        wipeoutComponentFactory(container, {
            confirmMessage: function (){
                return new Promise(function(resolve){
                    setTimeout(resolve('dynamic message'), 50);
                });
            }
        })
        .on('render', function(){
            var element = this.getElement()[0];
            var button = element.querySelector('button');
            var modal = document.querySelector('.modal');

            assert.ok(button instanceof HTMLElement, 'The button exists');
            assert.equal(modal, null, 'There is no modal');

            setTimeout(function(){
                modal = document.querySelector('.modal');
                assert.ok(modal instanceof HTMLElement, 'The modal has been created');
                assert.equal(modal.querySelector('.message').textContent.trim(), 'dynamic message', 'The correct message has been retrieved');

                modal.querySelector('.ok').click();
            }, 100);

            button.click();
        })
        .on('wipeout', function(){
            assert.ok(true, 'Wipeout called');
            QUnit.start();
        });
    });

    QUnit.asyncTest('Cancel wipeout', function(assert) {
        var container = document.getElementById('qunit-fixture');
        var wipeout;
        QUnit.expect(7);

        wipeout = wipeoutComponentFactory(container)
            .on('render', function(){
                var element = this.getElement()[0];
                var button = element.querySelector('button');
                var modal = document.querySelector('.modal');

                assert.ok(button instanceof HTMLElement, 'The button exists');
                assert.equal(modal, null, 'There is no modal');

                assert.equal(this.is('waiting'), false, 'The component is not in waiting state');

                setTimeout(function(){
                    modal = document.querySelector('.modal');
                    assert.ok(modal instanceof HTMLElement, 'The modal has been created');
                    assert.ok(wipeout.is('waiting'), 'The component is now in waiting state');

                    modal.querySelector('.cancel').click();
                }, 100);

                button.click();
            })
            .on('cancel', function(){
                assert.ok(true, 'Cancel called');
                assert.ok( ! this.is('waiting'), 'The component is not in waiting state anymore');

                QUnit.start();
            })
            .on('wipeout', function(){
                assert.ok(false, 'Wipeout should not be triggered');

                QUnit.start();
            });
    });


    QUnit.module('Visual test');

    QUnit.asyncTest('Rendering', function(assert) {
        var container = document.getElementById('visual-container');

        QUnit.expect(1);

        assert.equal(container.querySelector('.wipeout'), null, 'The component does not exists yet');

        wipeoutComponentFactory(container)
            .on('render', function(){
                QUnit.start();
            });
    });
});
