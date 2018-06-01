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
 * Authentication adapter against the sync manager endpoint.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'app/service/dataMapper/user'
], function($, _, __, userDataMapper){
    'use strict';

    /**
     * Some default error messages
     */
    var errorMessages = {
        missingCredentials: __('Missing username or password, please fill them and try again.'),
        invalidCredentials: __('Invalid credentials, please try again.'),
        missingEndpoint:    __('The authentication server is not configured, please contact your administrator.'),
        unavaibleEndpoint:  __('Unable to reach the server, please check your network.'),
        serverError:        __('An unexpected error occur while trying to login, please contact your administrator.')
    };

    return {

        name : 'syncManager',

        authenticate : function authenticate(config, values){
            return new Promise(function(resolve, reject){
                if(!config.endpoint || _.isEmpty(config.endpoint)){
                    return reject(new Error(errorMessages.missingEndpoint));
                }
                if(_.isEmpty(values.username) || _.isEmpty(values.password)){
                    return resolve({
                        success: false,
                        message :  errorMessages.missingCredentials
                    });
                }

                $.ajax({
                    url: config.endpoint,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    data : JSON.stringify({
                        login : values.username,
                        password : values.password
                    })
                })
                .done(function(response, status, xhr){
                    var user;
                    if (xhr.status === 200 || xhr.status === 302){

                        //extract the user and the oauth info from the response
                        user = userDataMapper(response.syncUser);
                        if(user){
                            user.oauthInfo = response.oauthInfo;

                            return resolve({
                                success : true,
                                data    : {
                                    user : user
                                }
                            });
                        }
                    }
                    return resolve({
                        success : false,
                        message : errorMessages.invalidCredentials
                    });
                })
                .fail(function(xhr){
                    if(xhr.status === 401 || xhr.status === 403){
                        return resolve({
                            success : false,
                            message : errorMessages.invalidCredentials
                        });
                    }
                    if(xhr.status === 0){
                        return reject(new Error(errorMessages.unavaibleEndpoint));
                    }
                    return reject(new Error(errorMessages.serverError + ' (' + xhr.status + ' : ' + xhr.statusText + ')' ));
                });
            });
        }
    };
});
