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
        { title : 'getById' },
        { title : 'getByUserName' },
        { title : 'getAll' },
        { title : 'getAllByRole' },
        { title : 'set' },
        { title : 'update' },
        { title : 'remove' },
        { title : 'removeAll' },
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
            role : 'testTaker',
            createdAt: Date.now(),
            extra    : {
                foo : 'bar'
            }
        };

        QUnit.expect(13);

        userService
            .getById('123456')
            .then(function(user){
                assert.equal(user, null, 'This user does not exists yet');

                return userService.set(sampleUser);
            })
            .then(function(result){
                assert.ok(result, 'The user has been inserted');

                return userService.getById('123456');
            })
            .then(function(user){
                assert.deepEqual(user, sampleUser, 'This inserted user can be retrieved');

                return userService.getByUserName('johnfoo');
            })
            .then(function(user){
                assert.deepEqual(user, sampleUser, 'This inserted user can be retrieved');

                return userService.update('123456', {
                    username : 'johnfoo',
                    newField : 'noz'
                });
            })
            .then(function(result){
                assert.ok(result, 'The user has been udpated');

                return userService.getById('123456');
            })
            .then(function(user){
                assert.notDeepEqual(user, sampleUser, 'The user has changed');
                assert.equal(user.id, sampleUser.id, 'The user id remains the same');
                assert.equal(user.username, sampleUser.username, 'The username remains the same');
                assert.equal(user.newField, 'noz', 'The new field has been added');
                assert.deepEqual(user.extra, sampleUser.extra, 'The previous fields remains by default');

                return userService.remove('123456');
            })
            .then(function(result){
                assert.ok(result, 'The user has been removed');

                return userService.getById('123456');
            })
            .then(function(user){
                assert.equal(user, null, 'This user does not exists anymore');

                return userService.getByUserName('johnfoo');
            })
            .then(function(user){
                assert.equal(user, null, 'This user does not exists anymore');

                QUnit.start();
            })
            .catch(function(err){
                assert.ok(false, err.message);
                QUnit.start();
            });
    });

    QUnit.asyncTest('Insert, get and remove multiple users', function(assert) {

        var sampleUsers = [{
            id : 't1',
            username : 'ut1',
            password : 'ut1',
            role : 'testTaker',
            createdAt: Date.now(),
        }, {
            id : 't2',
            username : 'ut2',
            password : 'ut2',
            role : 'testTaker',
            createdAt: Date.now(),
        }, {
            id : 't3',
            username : 'ut3',
            password : 'ut3',
            role : 'testTaker',
            createdAt: Date.now(),
        }, {
            id : 't4',
            username : 'ut4',
            password : 'ut4',
            role : 'testTaker',
            createdAt: Date.now(),
        }, {
            id : 't5',
            username : 'ut5',
            password : 'ut5',
            role : 'testTaker',
            createdAt: Date.now(),
        }, {
            id : 'sm1',
            username : 'usm1',
            password : 'usm1',
            role : 'syncManager',
            createdAt: Date.now(),
        }, {
            id : 'sm2',
            username : 'sm2',
            password : 'sm2',
            role : 'syncManager',
            createdAt: Date.now(),
        }];

        QUnit.expect(8);

        Promise.all([
            userService.set(sampleUsers[0]),
            userService.set(sampleUsers[1]),
            userService.set(sampleUsers[2]),
            userService.set(sampleUsers[3]),
            userService.set(sampleUsers[4]),
            userService.set(sampleUsers[5]),
            userService.set(sampleUsers[6])
        ]).then(function(results){
            assert.deepEqual(results, [true, true, true, true, true, true, true], 'All users have been inserted');

            return userService.getAll();
        }).then(function(users){
            assert.deepEqual(users, {
                t1 : sampleUsers[0],
                t2 : sampleUsers[1],
                t3 : sampleUsers[2],
                t4 : sampleUsers[3],
                t5 : sampleUsers[4],
                sm1 : sampleUsers[5],
                sm2 : sampleUsers[6],
            }, 'The inserted users can be retrieved');

            return userService.getAllByRole('testTaker');
        }).then(function(testTakers){
            assert.equal(testTakers.length, 5, 'The number of test takers is correct');
            assert.equal(testTakers[2].role, 'testTaker', 'The user role is correct');

            return userService.getAllByRole('syncManager');
        }).then(function(syncManagers){
            assert.equal(syncManagers.length, 2, 'The number of sync manager is correct');
            assert.equal(syncManagers[1].role, 'syncManager', 'The user role is correct');

            return userService.removeAll();
        }).then(function(results){
            assert.ok(results, 'The users have been removed');

            return userService.getAll();
        }).then(function(users){
            assert.deepEqual(users, {}, 'All users have been removed');

            QUnit.start();
        })
        .catch(function(err){
            assert.ok(false, err.message);
            QUnit.start();
        });
    });
});
