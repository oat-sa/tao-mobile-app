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
 * Service that manages users.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store',
], function(_, store){
    'use strict';

    var storeName = 'user';

    /**
     * Definition of a minimal user as seen by the service
     * @typedef {Object} user
     * @param {String} id - the user unique identifier
     * @param {String} username - the user name/login, should be unique too
     * @param {String} password - hashed version
     */

    /**
     * Validates a user object
     * @param {user} user
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the user doesn't match the expectations
     */
    var validateUser = function validateUser(user){
        if(!_.isPlainObject(user)){
            throw new TypeError('Missing or invalid user');
        }
        if(_.isEmpty(user.id)){
            throw new TypeError('A user needs to have a property id');
        }
        if(_.isEmpty(user.username)){
            throw new TypeError('A user needs to have a property username');
        }
        if(_.isEmpty(user.password)){
            throw new TypeError('A user needs to have a property password');
        }
        return true;
    };

    /**
     * @typedef {Object} userService
     */
    return {

        /**
         * Get a user from it's username/login
         *
         * @param {String} username
         * @returns {Promise<user>} resolves with the user or null if not found
         */
        get : function get(username){
            if(_.isEmpty(username)){
                return Promise.resolve(null);
            }
            return store(storeName).then(function(userStore){
                return userStore.getItem(username);
            });
        },

        /**
         * Set a user, if one exists already, it will be replaced !
         * @param {user} user
         * @returns {Promise<Boolean>} resolves with true if set
         */
        set : function set(user){

            validateUser(user);

            return store(storeName).then(function(userStore){
                return userStore.setItem(user.username, user);
            });
        },

        /**
         * Update a user,
         * if an entry was already there, we will merge them,
         * using the existing values as default.
         *
         * @param {user} user - the user to update
         * @returns {Promise<Boolean>} resolves with true if updated
         */
        update : function update(user){

            validateUser(user);

            return store(storeName).then(function(userStore){
                return userStore.getItem(user.username).then(function(existingUser){
                    return userStore.setItem(user.username, _.defaults(user, existingUser || {}));
                });
            });
        },

        /**
         * Remove a user
         *
         * @param {String} username
         * @returns {Promise<Boolean>} resolves with true if removed
         */
        remove : function remove(username){
            if(_.isEmpty(username)){
                return Promise.resolve(false);
            }
            return store(storeName).then(function(userStore){
                return userStore.removeItem(username);
            });
        }
    };
});

