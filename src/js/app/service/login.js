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
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/service/authentication',
    'app/service/session',
    'app/service/user',
], function(authenticationService, sessionService, userService) {
    'use strict';


    return function login(username, password) {

        var credentials = {
            username : username,
            password : password
        };

        //1 local
        return authenticationService
            .authenticate(authenticationService.adapters.local, credentials)
            .then(function(result){
                console.log('LOCAL RESULT', result);
                if(result && result.success && result.data && result.data.user){
                    return result.data.user;
                }
            })
            .then(function(user){
                if(!user){
                    //2 remote
                    return authenticationService
                        .authenticate(authenticationService.adapters.syncManager, credentials)
                        .then(function(result){
                            console.log('SYNC MANAGER RESULT', result);

                            if(result && result.success && result.data && result.data.user){
                                return userService.set(result.data.user).then(function(saved){
                                    if(saved){
                                        return result.data.user;
                                    }
                                });
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
