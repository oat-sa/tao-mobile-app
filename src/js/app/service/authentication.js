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
 * Service that manages the authentication
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'core/store'
], function($, _, __, module, store){
    'use strict';

    var config = module.config();

    return {

        /**
         * Get the current session if any
         * @returns {Promise<Object>} resolves with the session
         */
        getCurrentSession : function getCurrentSession(){
            return store('session').then(function(sessionStore){
                return sessionStore.getItem('current');
            });
        },

        /**
         * Creates a new session
         * @param {Object} user - the user linked to the session
         * @param {String} user.id
         * @param {String} user.username
         * @returns {Promise<Object>} resolves with the session
         */
        createSession : function createSession(user){
            if(!_.isPlainObject(user) || _.isEmpty(user.id) || _.isEmpty(user.username)){
                throw new TypeError(__('Incomplete user, missing id and/or username'));
            }
            return store('session')
                .then(function(sessionStore){
                    return sessionStore
                        .clear()    //only one session at one time
                        .then( function(){
                            return sessionStore.setItem('current', {
                                user: user,
                                createdAt : Date.now()
                            });
                        })
                        .then( function(result){
                            if(result){
                                return sessionStore.getItem('current');
                            }
                            return null;
                        });
                });
        },

        /**
         * Login a user
         * @param {String} username
         * @param {String} password
         * @returns {Promise<Object>} should resolve with the status and the user if logged in
         */
        login : function login(username, password){
            return new Promise(function(resolve, reject) {

                if(!config.endpoint){
                    return reject(new Error('No endpoint configured'));
                }

                /*
                 Mock
                return resolve({
                    success : true,
                    user : {
                        id : username,
                        username : username,
                        role : 'sync-manager'
                    }
                });
                */
                //the remote login is supposed to
                //get a handshake on tao sync, using a basic auth
                $.ajax({
                    url: config.endpoint,
                    method: 'POST',
                    dataType: 'json',
                    crossDomain: true,
                    username: username,
                    password : password,
                    cache:false,
                    data : {
                        login : username
                    }
                })
                .done(function(response, status, xhr){
                    if (xhr.status === 200 || xhr.status === 302){
                        return resolve(true);
                    }
                    return resolve(false);
                })
                .fail(function(xhr){
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
            });
        },

        /**
         * logout the user, remove it's session
         * @returns {Promise}
         */
        logout : function logout(){
            return store('session').then(function(sessionStore){
                return sessionStore.removeItem('current');
            });

        }
    };
});
