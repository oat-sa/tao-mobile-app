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
define(['app/service/session'], function(sessionService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof sessionService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'create' },
        { title : 'getCurrent' },
        { title : 'check' },
        { title : 'alive' },
        { title : 'clear' },
        { title : 'getEntryPoint' },
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof sessionService[data.title], 'function', 'The loginComponentFactory exposes the component method "' + data.title);
    });


    QUnit.module('Behavior');

    QUnit.asyncTest('Create a new session', function(assert) {
        var testStartTime = Date.now();

        QUnit.expect(13);

        assert.throws(function(){
            sessionService.create();
        }, TypeError, 'a user object is expected');

        assert.throws(function(){
            sessionService.create({ foo : 'bar'});
        }, TypeError, 'a  valid user object is expected');

        assert.throws(function(){
            sessionService.create({ id : '1234'});
        }, TypeError, 'a  valid user object is expected');

        sessionService.create({
            id : '1234',
            username : 'john',
            password : 'foobidoo',
            role : 'sync-manager'
        })
        .then(function(session){
            var assertTime = Date.now();

            assert.equal(typeof session, 'object', 'The created session is an object');
            assert.equal(typeof session.user, 'object', 'The created session contains the user');
            assert.equal(session.user.id, '1234', 'The created session contains the user id');
            assert.equal(session.user.username, 'john', 'The created session contains the username');
            assert.equal(session.user.role, 'sync-manager', 'The created session contains the user role');
            assert.equal(typeof session.user.password, 'undefined', 'The created session does not contain the user password');
            assert.equal(typeof session.createdAt, 'number', 'The created session contains the user role');
            assert.ok(session.createdAt > 0, 'The session creation time is positive');
            assert.ok(session.createdAt >= testStartTime && session.createdAt <= assertTime, 'The session creation time reflects the function call time');
            assert.equal(typeof session.updatedAt, 'undefined', 'The created session does not contains the update time');

            return sessionService.clear();
        })
        .then(function(){
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Current session CRUD', function(assert) {
        QUnit.expect(7);

        sessionService.getCurrent()
        .then(function(session){
            assert.equal(session, null, 'There is no current session');

            return sessionService.create({
                id : 'abcdef',
                username : 'john',
                role : 'sync-manager'
            });
        })
        .then(function(session){
            assert.equal(typeof session, 'object', 'The created session is an object');
            assert.equal(session.user.id, 'abcdef', 'The user id matches');

            return sessionService.getCurrent();
        })
        .then(function(session){
            assert.equal(typeof session, 'object', 'The created session is an object');
            assert.equal(session.user.id, 'abcdef', 'The user id matches');

            return sessionService.clear();
        })
        .then(function(result){
            assert.ok(result, 'The sessions have been cleared');

            return sessionService.getCurrent();
        })
        .then(function(session){
            assert.equal(session, null, 'There is no current session');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Keep alive', function(assert) {
        QUnit.expect(8);

        sessionService.create({
            id : '96169',
            username : 'john',
            role : 'sync-manager'
        })
        .then(function(session){

            assert.equal(typeof session.createdAt, 'number', 'The created session contains the user role');
            assert.ok(session.createdAt > 0, 'The session creation time is positive');
            assert.equal(typeof session.updatedAt, 'undefined', 'The created session does not contains the update time');

            return sessionService.alive();
        })
        .then(function(result){
            assert.ok(result, 'The session has been updated');

            return sessionService.getCurrent();
        })
        .then(function(session){
            var assertTime = Date.now();

            assert.equal(typeof session.createdAt, 'number', 'The created session contains the user role');
            assert.ok(session.createdAt > 0, 'The session creation time is positive');
            assert.equal(typeof session.updatedAt, 'number', 'The created session contains now the update time');
            assert.ok(session.updatedAt > session.createdAt && session.updatedAt <= assertTime, 'The session update time reflects the function call time');

            return sessionService.clear();
        })
        .then(function(){

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Check validity', function(assert) {
        QUnit.expect(5);

        sessionService.create({
            id : '87678',
            username : 'john',
            role : 'sync-manager'
        })
        .then(function(session){

            assert.equal(typeof session.createdAt, 'number', 'The created session contains the user role');
            assert.ok(session.createdAt > 0, 'The session creation time is positive');
            assert.equal(typeof session.updatedAt, 'undefined', 'The created session does not contains the update time');

            return sessionService.check();
        })
        .then(function(result){
            assert.ok(result, 'The session must be valid');

            return new Promise(function(resolve){
                setTimeout(function(){
                    resolve();
                }, 6000);
            });
        })
        .then(function(){
            return sessionService.check();
        })
        .then(function(result){
            assert.ok( ! result, 'The session should have been invalidated');

            return sessionService.clear();
        })
        .then(function(){
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Check kept alive validity', function(assert) {
        QUnit.expect(5);

        sessionService.create({
            id : '87678',
            username : 'john',
            role : 'sync-manager'
        })
        .then(function(session){

            assert.equal(typeof session.createdAt, 'number', 'The created session contains the user role');
            assert.ok(session.createdAt > 0, 'The session creation time is positive');
            assert.equal(typeof session.updatedAt, 'undefined', 'The created session does not contains the update time');

            return sessionService.check();
        })
        .then(function(result){
            assert.ok(result, 'The session must be valid');

            return new Promise(function(resolve){
                setTimeout(function(){
                    resolve();
                }, 6000);
                setTimeout(function(){
                    sessionService.alive();
                }, 2000);
            });
        })
        .then(function(){
            return sessionService.check();
        })
        .then(function(result){
            assert.ok(result, 'The session is still valid');

            return sessionService.clear();
        })
        .then(function(){
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });

    QUnit.asyncTest('Get entry point', function(assert) {
        QUnit.expect(3);

        sessionService.clear().then(function(){
            return sessionService.getEntryPoint();
        })
        .then(function(entryPoint){
            assert.equal(entryPoint, 'main-entry-point', 'Without a session the all entryPoint is selected');
            return sessionService.create({
                id : '87678',
                username : 'john',
                role : 'foo'
            });
        })
        .then(function(session){
            assert.equal(session.user.role, 'foo', 'The session has been created with the correct role');
            return sessionService.getEntryPoint();
        })
        .then(function(entryPoint){
            assert.equal(entryPoint, 'foo-entry-point', 'The role based entryPoint is selected');
            return sessionService.clear();
        })
        .then(function(){
            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
