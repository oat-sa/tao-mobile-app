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
 * Test the synchronizer component
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/component/synchronizer/synchronizer'], function(synchronizerComponentFactory) {
    'use strict';

    var mockTargets = [{
        state: 'ready',
        type: 'test-taker',
        name: 'Test Taker'
    }, {
        state: 'ready',
        type: 'group',
        name: 'Group'
    }, {
        state: 'disabled',
        type: 'delivery',
        name: 'Delivery'
    }];


    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof synchronizerComponentFactory, 'function', "The module exposes a function");
        assert.equal(typeof synchronizerComponentFactory(), 'object', "The factory produces an object");
        assert.notStrictEqual(synchronizerComponentFactory(), synchronizerComponentFactory(), "The factory provides a different object on each call");
    });

    QUnit.cases([{
        title: 'init'
    }, {
        title: 'destroy'
    }, {
        title: 'render'
    }, {
        title: 'show'
    }, {
        title: 'hide'
    }, {
        title: 'enable'
    }, {
        title: 'disable'
    }, {
        title: 'is'
    }, {
        title: 'setState'
    }, {
        title: 'getContainer'
    }, {
        title: 'getElement'
    }, {
        title: 'getTemplate'
    }, {
        title: 'setTemplate'
    }, ]).test('Component API ', function(data, assert) {
        var instance = synchronizerComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The synchronizerComponentFactory exposes the component method "' + data.title);
    });

    QUnit.cases([{
        title: 'on'
    }, {
        title: 'off'
    }, {
        title: 'trigger'
    }, {
        title: 'before'
    }, {
        title: 'after'
    }, ]).test('Eventifier API ', function(data, assert) {
        var instance = synchronizerComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The synchronizerComponentFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([{
        title: 'start'
    }, {
        title: 'stop'
    }, {
        title: 'startAll'
    }, {
        title: 'stopAll'
    }, {
        title: 'setTargetState'
    }, {
        title: 'getTargets'
    }, ]).test('Instance API ', function(data, assert) {
        var instance = synchronizerComponentFactory();
        assert.equal(typeof instance[data.title], 'function', 'The synchronizerComponentFactory exposes the method "' + data.title + '"');
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(2);

        synchronizerComponentFactory(container)
            .on('init', function() {
                assert.ok(!this.is('rendered'), 'The component is not rendered');
            })
            .on('render', function() {
                assert.ok(this.is('rendered'), 'The component is now rendered');

                this.destroy();
            })
            .on('destroy', function() {
                QUnit.start();
            });
    });

    QUnit.asyncTest('Rendering', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(10);

        assert.equal(container.querySelector('.synchronizer'), null, 'The component does not exists yet');

        synchronizerComponentFactory(container, { targets: mockTargets })
            .on('render', function() {
                var element = this.getElement()[0];
                assert.deepEqual(container.querySelector('.synchronizer'), element, 'The component exists');

                assert.ok(element.querySelector('.syncer') instanceof HTMLButtonElement, 'The syncer button has been created');
                assert.equal(element.querySelectorAll('.sync-target').length, 3, 'The 3 targets have been created');

                assert.equal(element.querySelector('[data-type="test-taker"] h1').textContent, 'Test Taker', 'The target title has been set');
                assert.ok(element.querySelector('[data-type="test-taker"]').classList.contains('ready'), 'The target starts ready');

                assert.equal(element.querySelector('[data-type="group"] h1').textContent, 'Group', 'The target title has been set');
                assert.ok(element.querySelector('[data-type="group"]').classList.contains('ready'), 'The target starts ready');

                assert.equal(element.querySelector('[data-type="delivery"] h1').textContent, 'Delivery', 'The target title has been set');
                assert.ok(element.querySelector('[data-type="delivery"]').classList.contains('disabled'), 'The target starts disabled');

                QUnit.start();
            });
    });

    QUnit.asyncTest('start/stop all', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(15);

        assert.equal(container.querySelector('.synchronizer'), null, 'The component does not exists yet');

        synchronizerComponentFactory(container, { targets: mockTargets})
            .on('render', function() {
                var element = this.getElement()[0];
                var syncer = element.querySelector('.syncer');
                var target1Elt = element.querySelector('[data-type="test-taker"]');
                var target2Elt = element.querySelector('[data-type="group"]');
                var target3Elt = element.querySelector('[data-type="delivery"]');

                assert.ok(!this.is('started'), 'The component has not yet started');

                assert.ok(target1Elt.classList.contains('ready'), 'The target starts ready');
                assert.ok(target2Elt.classList.contains('ready'), 'The target starts ready');
                assert.ok(target3Elt.classList.contains('disabled'), 'The target starts disabled');

                //start all
                syncer.click();

                assert.ok(this.is('started'), 'The component is now is stated state');

                assert.ok(!target1Elt.classList.contains('ready'), 'The target left the ready state');
                assert.ok(target1Elt.classList.contains('running'), 'The target is now running');

                assert.ok(!target2Elt.classList.contains('ready'), 'The target left the ready state');
                assert.ok(target2Elt.classList.contains('running'), 'The target is now running');

                assert.ok(target3Elt.classList.contains('disabled'), 'The target remains disabled');

                //stop all
                syncer.click();

                assert.ok(!this.is('started'), 'The component is now stopped');

                assert.ok(target1Elt.classList.contains('ready'), 'The target is ready again');
                assert.ok(target2Elt.classList.contains('ready'), 'The target is ready again');
                assert.ok(target3Elt.classList.contains('disabled'), 'The target starts disabled');

                QUnit.start();
            });
    });

    QUnit.asyncTest('start one and success', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(9);

        assert.equal(container.querySelector('.synchronizer'), null, 'The component does not exists yet');

        synchronizerComponentFactory(container, { targets: mockTargets })
            .on('render', function() {
                var element = this.getElement()[0];

                var targetElt = element.querySelector('[data-type="test-taker"]');
                assert.ok(targetElt.classList.contains('ready'), 'The target starts ready');

                this.on('start', function(targetType) {

                    assert.equal(targetType, 'test-taker', 'The test taker target get started');

                    assert.ok(!targetElt.classList.contains('ready'), 'The target is not ready anymore');
                    assert.ok(targetElt.classList.contains('running'), 'The target is running');

                    this.succeed('test-taker');
                })
                .on('stop', function(targetType) {

                    assert.deepEqual(targetType, 'test-taker', 'The test taker target is now stopped');
                    assert.ok(!targetElt.classList.contains('ready'), 'The target is not ready anymore');
                    assert.ok(!targetElt.classList.contains('running'), 'The target is not running anymore');

                    assert.ok(targetElt.classList.contains('success'), 'The target is in success state');

                    QUnit.start();
                });

                this.start('test-taker');
            });
    });

    QUnit.asyncTest('start one and failure', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(13);

        assert.equal(container.querySelector('.synchronizer'), null, 'The component does not exists yet');

        synchronizerComponentFactory(container, { targets: mockTargets })
            .on('render', function() {
                var element = this.getElement()[0];
                var target1Elt = element.querySelector('[data-type="test-taker"]');
                var target2Elt = element.querySelector('[data-type="group"]');

                assert.ok(target1Elt.classList.contains('ready'), 'The target starts ready');
                assert.ok(target2Elt.classList.contains('ready'), 'The target starts ready');

                this.on('start', function(targetType) {

                    assert.equal(targetType, 'group', 'The group target get started');

                    assert.ok(!target2Elt.classList.contains('ready'), 'The target is not ready anymore');
                    assert.ok(target2Elt.classList.contains('running'), 'The target is running');

                    assert.ok(target1Elt.classList.contains('ready'), 'The other target remain ready');

                    this.fail('group', new Error('deadlocksync'));
                })
                .on('stop', function(targetType) {

                    assert.deepEqual(targetType, 'group', 'The group target is now stopped');
                    assert.ok(!target2Elt.classList.contains('ready'), 'The target is not ready anymore');
                    assert.ok(!target2Elt.classList.contains('running'), 'The target is not running anymore');

                    assert.ok(target2Elt.classList.contains('error'), 'The target is in error state');
                    assert.equal(target2Elt.querySelector('.sync-result').textContent, 'deadlocksync', 'The error message is updated');

                    assert.ok(target1Elt.classList.contains('ready'), 'The other target remain ready');

                    QUnit.start();
                });

                this.start('group');
            });
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('Display', function(assert) {
        var container = document.getElementById('visual-container');

        QUnit.expect(1);

        assert.equal(container.querySelector('.synchronizer'), null, 'The component does not exists yet');

        synchronizerComponentFactory(container, { targets: mockTargets })
            .on('render', function() {
                QUnit.start();
            });
    });
});
