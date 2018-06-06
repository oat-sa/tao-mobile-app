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
    'app/service/request',
    'app/service/dataMapper/user'
], function($, _, __, requestFactory, userDataMapper){
    'use strict';

    /**
     * The dedicated error messages
     */
    var errorMessages = {
        missingCredentials:    __('Missing username or password, please fill them and try again.'),
        unauthorized:          __('Invalid credentials, please try again.'),
        misconfiguredEndpoint: __('The authentication server is not configured, please contact your administrator.')
    };

    /**
     * Authentication adapter for the sync manager
     */
    return {

        name : 'syncManager',

        /**
         * Try to authenticate from the given credentials
         * @param {Object} config - the authentication configuration
         * @param {Object} config.api - contains the API details
         * @param {Object} credentials - the authentication credentials
         * @param {String} credentials.username - the login/username of the sync manager
         * @param {String} credentials.password - the password of the sync manager
         * @returns {Promise<Object>} resolves with the user data
         */
        authenticate : function authenticate(config, credentials){
            var request = requestFactory(config.api, errorMessages);

            if(!credentials || _.isEmpty(credentials.username) || _.isEmpty(credentials.password)){
                return Promise.resolve({
                    success: false,
                    message: errorMessages.unauthorized
                });
            }
            return request({
                data : JSON.stringify({
                    login:    credentials.username,
                    password: credentials.password
                })
            })
            .then(function(response){
                var user;
                if(response && response.success){
                    //extract the user and the oauth info from the response
                    user = userDataMapper(response.data.syncUser);
                    if(user){
                        user.oauthInfo = response.data.oauthInfo;
                        response.data.user = user;
                    }
                }
                return response;
            });
        }
    };
});
