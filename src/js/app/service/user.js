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
 * The full users are stored in the "user" store, indexed by id.
 *
 * We store also the user's authentication data, in the "userAuth" store, indexed by username.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store',
], function(_, store){
    'use strict';

    var userStoreName = 'user';
    var userAuthStoreName = 'userAuth';

    /**
     * Definition of a minimal user as seen by the service
     * @typedef {Object} user
     * @param {String} id - the user unique identifier
     * @param {String} username - the user name/login, should be unique too
     * @param {String} password - hashed version
     * @param {String} role - the user role
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
        if(_.isEmpty(user.role)){
            throw new TypeError('A user needs to have a property role');
        }
        return true;
    };

    /**
     * @typedef {Object} userService
     */
    return {

        /**
         * Get a user from it's identifier / URI.
         *
         * @param {String} id - the user identifier
         * @returns {Promise<user>} resolves with the user or null if not found
         */
        getById : function getById(id){
            if(_.isEmpty(id)){
                return Promise.resolve(null);
            }
            return store(userStoreName).then(function(userStore){
                return userStore.getItem(id);
            });
        },

        /**
         * Get a user from it's username / login.
         *
         * @param {String} id - the user identifier
         * @returns {Promise<user>} resolves with the user or null if not found
         */
        getByUserName : function getByUserName(username){
            var self = this;
            if(_.isEmpty(username)){
                return Promise.resolve(null);
            }
            return store(userAuthStoreName)
                .then(function(userAuthStore){
                    return userAuthStore.getItem(username);
                })
                .then(function(userAuth){
                    if(userAuth && userAuth.id){
                        return self.getById(userAuth.id);
                    }
                    return null;
                });
        },

        /**
         * Get all users
         * @returns {Promise<Object[]>} resolves with the user collection
         */
        getAll : function getAll(){
            return store(userStoreName).then(function(userStore){
                return userStore.getItems();
            });
        },

        /**
         * Get all users of the given role
         *
         * @param {String} role - the role to filter users.
         *
         * @returns {Promise<Object[]>} resolves with the user collection
         */
        getAllByRole : function getAllByRole(role){
            return store(userStoreName).then(function(userStore){
                return userStore.getItems();
            }).then(function(users){
                return _.filter(users, { role : role });
            });
        },

        /**
         * Set a user (add or replace), if one exists already, it will be replaced !
         *
         * @param {user} user - a valid user
         * @returns {Promise<Boolean>} resolves with true if set
         * @throws {TypeError} when trying to set an invalid user
         */
        set : function set(user){

            validateUser(user);

            return store(userStoreName)
                .then(function(userStore){
                    return userStore.setItem(user.id, user);
                })
                .then(function(result){
                    if(result){
                        return store(userAuthStoreName);
                    }
                    return false;
                })
                .then(function(userAuthStore){
                    if(userAuthStore){
                        return userAuthStore.setItem(user.username, {
                            role: user.role,
                            password : user.password,
                            id : user.id
                        });
                    }
                    return false;
                });
        },

        /**
         * Update by merge a user.
         *
         * If an entry was already there, we will merge them,
         * using the existing values as default.
         *
         * The merge is only done at the 1st level.
         *
         * @param {String} id - the user identifier
         * @param {Object|user} properties - the properties to set to the user
         * @returns {Promise<Boolean>} resolves with true if updated
         */
        update : function update(id, properties){
            var self = this;

            if(!_.isPlainObject(properties) || _.isEmpty(id) ){
                return Promise.resolve(false);
            }

            return this.getById(id)
                .then(function(existingUser){
                    return self.set(_.defaults(properties, existingUser || {}));
                });
        },

        /**
         * Remove a user
         *
         * @param {String} id - the user identifier
         * @returns {Promise<Boolean>} resolves with true if removed
         */
        remove : function remove(id){
            if(_.isEmpty(id)){
                return Promise.resolve(false);
            }
            return this.getById(id)
                .then(function(user){
                    if(user && user.id && user.username){
                        return store(userStoreName)
                            .then(function(userStore){
                                return userStore.removeItem(id);
                            })
                            .then(function(result){
                                if(result){
                                    return store(userAuthStoreName);
                                }
                                return false;
                            })
                            .then(function(userAuthStore){
                                if(userAuthStore){
                                    return userAuthStore.removeItem(user.username);
                                }
                                return false;
                            });
                    }
                    return false;
                });
        },

        /**
         * Remove all users
         * @returns {Promise<Boolean>}
         */
        removeAll : function removeAll(){
            return store(userStoreName)
                .then(function(userStore){
                    return userStore.clear();
                })
                .then(function(result){
                    if(result){
                        return store(userAuthStoreName);
                    }
                    return false;
                })
                .then(function(userAuthStore){
                    if(userAuthStore){
                        return userAuthStore.clear();
                    }
                    return false;
                });
        }
    };
});

