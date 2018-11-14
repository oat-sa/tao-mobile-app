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
 * Implements the multi stages login :
 *  - try to login against the local db
 *  - try to login against the remote server
 *
 * If the login succeed a new session is created.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/logger',
    'app/service/authentication',
    'app/service/session',
    'app/service/user',
], function(loggerFactory, authenticationService, sessionService, userService) {
    'use strict';

    var logger = loggerFactory('app/service/login');

    /**
     * Multi Stage login
     *
     * @param {String} username
     * @param {String} password
     * @returns {Promise<Object|Boolean>} resolves with false in case of failure or the session
     */
    return function login(username, password) {

        var credentials = {
            username : username,
            password : password
        };

        //1 local
        return authenticationService
            .authenticate(authenticationService.adapters.local, credentials)
            .then(function(result){

                if(result && result.success && result.data && result.data.user){

                    logger.debug('User ' + username + ' logged in from local adapter');
                    return result.data.user;
                }
                logger.debug('User ' + username + ' not identified from local adapter');
            })
            .then(function(user){
                if(!user){
                    //2 remote
                    return authenticationService
                        .authenticate(authenticationService.adapters.syncManager, credentials)
                        .then(function(result){
                            if(result && result.success && result.data && result.data.user){

                                logger.debug('User ' + username + ' logged in from syncManager adapter');
                                return userService.set(result.data.user).then(function(saved){
                                    if(saved){
                                        return result.data.user;
                                    }
                                });
                            }
                            logger.debug('User ' + username + ' not identified from syncManager adapter');

                            //we handle only some of the errors to the user, the others are considered
                            if(result && result.success === false && (result.errorCode === 0 || result.errorCode > 403)){
                                throw new Error(result.errorMessage);
                            }
                        });
                }
                return user;
            })
            .then(function(user){
                if(!user){
                    return false;
                }

                //create the current session
                return sessionService.create(user);
            });
    };
});
