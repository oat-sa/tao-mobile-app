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
 * Test the deliveryLauncher component
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/component/deliveryLauncher/launcher'], function(deliveryLauncherFactory) {
    'use strict';

    var deliveries = [{
        assemblyPath: "wN07JCauWnNcq8Tf",
        id : "http://a.org/tao.rdf#0222",
        label : "Delivery of QTI Example Test"
    }, {
        assemblyPath: "pBX90HtKQhH1oVeb",
        id : "http://a.org/tao.rdf#8971",
        label : "Delivery of Math Test"
    }, {
        assemblyPath: "4jJKgdjhkdMLf84",
        id : "http://a.org/tao.rdf#5365",
        label : "Delivery of Sciences Grade 8"
    }];

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(3);

        assert.equal(typeof deliveryLauncherFactory, 'function', "The module exposes a function");
        assert.equal(typeof deliveryLauncherFactory(), 'object', "The factory produces an object");
        assert.notStrictEqual(deliveryLauncherFactory(), deliveryLauncherFactory(), "The factory provides a different object on each call");
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
        var instance = deliveryLauncherFactory();
        assert.equal(typeof instance[data.title], 'function', 'The deliveryLauncherFactory exposes the component method "' + data.title);
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
        var instance = deliveryLauncherFactory();
        assert.equal(typeof instance[data.title], 'function', 'The deliveryLauncherFactory exposes the eventifier method "' + data.title);
    });

    QUnit.cases([{
        title: 'getDeliveries'
    }, {
        title: 'launch'
    }, ]).test('Instance API ', function(data, assert) {
        var instance = deliveryLauncherFactory();
        assert.equal(typeof instance[data.title], 'function', 'The deliveryLauncherFactory exposes the method "' + data.title + '"');
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Lifecycle', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(2);

        deliveryLauncherFactory(container)
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

        QUnit.expect(8);

        assert.equal(container.querySelector('.delivery-launcher'), null, 'The component does not exists yet');

        deliveryLauncherFactory(container, {
            deliveries : deliveries,
            title: 'available tests'
        })
            .on('render', function() {
                var element = this.getElement()[0];
                assert.deepEqual(container.querySelector('.delivery-launcher'), element, 'The component exists');

                assert.equal(element.querySelector('h2').textContent.trim(), 'available tests', 'The title is set');
                assert.equal(element.querySelectorAll('article').length, deliveries.length, 'The correct number of deliveries is inserted');

                assert.equal(element.querySelector('article > a').dataset.id, deliveries[0].id, 'The delivery id is set');

                assert.equal(element.querySelector('a[data-id="http://a.org/tao.rdf#0222"] .label').textContent.trim(), deliveries[0].label, 'The delivery lable is set');
                assert.equal(element.querySelector('a[data-id="http://a.org/tao.rdf#8971"] .label').textContent.trim(), deliveries[1].label, 'The delivery lable is set');
                assert.equal(element.querySelector('a[data-id="http://a.org/tao.rdf#5365"] .label').textContent.trim(), deliveries[2].label, 'The delivery lable is set');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Empty list', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(5);

        assert.equal(container.querySelector('.delivery-launcher'), null, 'The component does not exists yet');

        deliveryLauncherFactory(container, {
            title: 'available tests',
            emptyText : 'nothing'
        })
            .on('render', function() {
                var element = this.getElement()[0];
                assert.deepEqual(container.querySelector('.delivery-launcher'), element, 'The component exists');

                assert.equal(element.querySelector('h2').textContent.trim(), 'available tests', 'The title is set');
                assert.equal(element.querySelectorAll('article').length, 0, 'No deliveries are rendered');
                assert.equal(element.querySelector('p').textContent.trim(), 'nothing', 'The empty text is added');

                QUnit.start();
            });
    });

    QUnit.asyncTest('Launch', function(assert) {
        var container = document.getElementById('qunit-fixture');

        QUnit.expect(4);

        assert.equal(container.querySelector('.delivery-launcher'), null, 'The component does not exists yet');

        deliveryLauncherFactory(container, {
            deliveries : deliveries,
            title: 'available tests',
            emptyText : 'nothing'
        })
            .on('render', function() {
                var element = this.getElement()[0];
                var deliveryElt = element.querySelector('a[data-id="http://a.org/tao.rdf#5365"]');
                assert.ok(deliveryElt instanceof HTMLElement, 'The delivery element exists');

                deliveryElt.click();
            })
            .on('launch', function(id, delivery){

                assert.equal(id, 'http://a.org/tao.rdf#5365', 'The launched delivery matches');
                assert.deepEqual(delivery, deliveries[2], 'The launched delivery matches');

                QUnit.start();
            });
    });

    QUnit.module('Visual test');

    QUnit.asyncTest('Display', function(assert) {
        var container = document.getElementById('visual-container');

        QUnit.expect(1);

        assert.equal(container.querySelector('.deliveries'), null, 'The component does not exists yet');

        deliveryLauncherFactory(container, { deliveries : deliveries })
            .on('render', function() {
                QUnit.start();
            });
    });
});
