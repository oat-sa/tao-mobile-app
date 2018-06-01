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
 * Test the user service
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['app/service/user'], function(userService){
    'use strict';

    QUnit.module('API');

    QUnit.test('module', function(assert) {
        QUnit.expect(1);

        assert.equal(typeof userService, 'object', "The module exposes an object");
    });

    QUnit.cases([
        { title : 'get' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' }
    ]).test('Component API ', function(data, assert) {
        assert.equal(typeof userService[data.title], 'function', 'The service exposes the component method "' + data.title);
    });


    QUnit.module('Behavior');


    QUnit.test('set invalid user', function(assert) {

        QUnit.expect(4);

        assert.throws(function(){
            userService.set();
        }, TypeError, 'a user object is expected');

        assert.throws(function(){
            userService.set({});
        }, TypeError, 'a  valid user object is expected');

        assert.throws(function(){
            userService.set({ id : '1234'});
        }, TypeError, 'a  valid user object is expected');

        assert.throws(function(){
            userService.set({ username : 'jjfox'});
        }, TypeError, 'a  valid user object is expected');
    });

    QUnit.asyncTest('Get/Set/Update/Remove a user', function(assert) {

        var sampleUser = {
            id : '123456',
            username : 'johnfoo',
            password : 'ah2g3f',
            createdAt: Date.now(),
            extra    : {
                foo : 'bar'
            }
        };

        QUnit.expect(11);

        userService
            .get('johnfoo')
            .then(function(user){
                assert.equal(user, null, 'This user does not exists yet');

                return userService.set(sampleUser);
            })
            .then(function(result){
                assert.ok(result, 'The user has been inserted');

                return userService.get('johnfoo');
            })
            .then(function(user){
                assert.deepEqual(user, sampleUser, 'This inserted user can be retrieved');

                return userService.update({
                    id : '123456',
                    username : 'johnfoo',
                    password : 'ah2g3f',
                    newField : 'noz'
                });
            })
            .then(function(result){
                assert.ok(result, 'The user has been udpated');

                return userService.get('johnfoo');
            })
            .then(function(user){
                assert.notDeepEqual(user, sampleUser, 'The user has changed');
                assert.equal(user.id, sampleUser.id, 'The user id remains the same');
                assert.equal(user.username, sampleUser.username, 'The username remains the same');
                assert.equal(user.newField, 'noz', 'The new field has been added');
                assert.deepEqual(user.extra, sampleUser.extra, 'The previous fields remains by default');

                return userService.remove('johnfoo');
            })
            .then(function(result){
                assert.ok(result, 'The user has been removed');

                return userService.get('johnfoo');
            })
            .then(function(user){
                assert.equal(user, null, 'This user does not exists yet');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });
});
