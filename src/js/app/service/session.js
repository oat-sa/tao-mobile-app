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
 * Service that manages user' sessions.
 *
 * Only one session can be used at a time,
 * the service provides also a TTL/keep-alive mecanism.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'module',
    'core/store',
], function(_, __, module, store){
    'use strict';

    var storeName = 'session';
    var currentSessionKey = 'current';

    var config = _.defaults(module.config(), {
        //Time To Live, used in case of inactivity
        ttl : 5 * 60 * 1000,

        //role : controller
        //to get the entrypoint for each role
        entryPoints : {
            all:         'main/login',
            syncManager: 'admin/index',
            testTaker:   'delivery/index'
        }
    });

    /**
     * @typedef {Object} sessionService
     */
    return {

        /**
         * Get the current session if any
         *
         * @returns {Promise<Object>} resolves with the session
         */
        getCurrent : function getCurrent(){
            return store(storeName).then(function(sessionStore){
                return sessionStore.getItem(currentSessionKey);
            });
        },

        /**
         * Creates a new session
         * @param {Object} user - the user linked to the session
         * @param {String} user.id
         * @param {String} user.username
         * @param {String} user.role
         * @returns {Promise<Object>} resolves with the session
         */
        create : function create(user){
            if(!_.isPlainObject(user) || _.isEmpty(user.id) || _.isEmpty(user.username) || _.isEmpty(user.role)){
                throw new TypeError(__('Incomplete user, missing id and/or username, or role'));
            }
            return store(storeName)
                .then(function(sessionStore){
                    return sessionStore
                        .clear()    //only one session at one time
                        .then( function(){

                            //just in case we don't save the password
                            var sessionUser = _.omit(user, 'password');

                            return sessionStore.setItem(currentSessionKey, {
                                user: sessionUser,
                                createdAt : Date.now()
                            });
                        })
                        .then( function(result){
                            if(result){
                                return sessionStore.getItem(currentSessionKey);
                            }
                            return null;
                        });
                });
        },

        /**
         * Comfirm the session is still alive : push the TTL.
         * @returns {Promise<Boolean>}
         */
        alive : function alive(){
            return store(storeName)
                .then(function(sessionStore){
                    return sessionStore
                        .getItem(currentSessionKey)
                        .then( function(session){
                            if(session){
                                session.updatedAt = Date.now();
                                return sessionStore.setItem(currentSessionKey, session);
                            } else {
                                return false;
                            }
                        });
                });
        },

        /**
         * Check whether the session is still valid
         * @returns {Promise<Boolean>}
         */
        check : function check(){
            var now = Date.now();
            return store(storeName)
                .then(function(sessionStore){
                    return sessionStore
                        .getItem(currentSessionKey)
                        .then( function(session){
                            var sessionCheckPoint;
                            if(session){
                                sessionCheckPoint  = session.updatedAt || session.createdAt;
                                if(sessionCheckPoint > 0 && sessionCheckPoint + config.ttl > now){
                                    return true;
                                }
                            }
                            return false;
                        });
                });

        },

        /**
         * Clear the session
         * @returns {Promise<Boolean>}
         */
        clear : function clear(){
            return store(storeName).then(function(sessionStore){
                return sessionStore.clear();
            });
        },

        /**
         * Get the entrypoint based on the current session
         * TODO move to a dedicated service if becomes more complex
         * otherwise, the session service can take care of it
         *
         * @returns {Promise<String>} resolves with the controller path to dipatch
         */
        getEntryPoint : function getEntryPoint(){
            return this.getCurrent().then(function(session){
                var entryPoint = config.entryPoints.all;
                if(session && session.user && session.user.role && config.entryPoints[session.user.role]){
                    entryPoint = config.entryPoints[session.user.role];
                }
                return entryPoint;
            });
        }
    };
});

