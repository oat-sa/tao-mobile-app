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
 * Authentication provider against the local storage.
 * To be implemented.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'app/core/digest',
    'app/service/user'
], function(_, __, digest, userService){
    'use strict';

    /**
     * The dedicated error messages
     */
    var errorMessages = {
        missingCredentials:    __('Missing username or password, please fill them and try again.'),
        unauthorized:          __('Invalid credentials, please try again.')
    };

    /**
     * Authentication adapter for the local database
     */
    return {

        name : 'local',

        /**
         * Try to authenticate from the given credentials
         * @param {Object} config - the authentication configuration
         * @param {Object} [config.hash] - the password hash configuration
         * @param {String} [config.hash.algorithm = 'SHA-256'] - the password hash algo
         * @param {Number} [config.hash.salt = 10] - the salt length
         * @param {Object} credentials - the authentication credentials
         * @param {String} credentials.username - the login/username of the sync manager
         * @param {String} credentials.password - the password of the sync manager
         * @returns {Promise<Object>} resolves with the user data
         */
        authenticate : function authenticate(config, credentials){

            var failStatus = {
                success: false,
                message: errorMessages.unauthorized
            };

            var hashConfig = _.defaults(config.hash || {}, {
                salt : 10,
                algorithm : 'SHA-256'
            });

            /**
             * Verify the password against the store hash
             * @param {String} password - the password in clear
             * @param {String} hash - the stored value
             * @returns {Promise<Boolean>} true if the password are exactly matching
             */
            var verifyPassword = function verifyPassword(password, hash){
                var salt   = hash.substring(0, hashConfig.salt);
                var hashed = hash.substring(hashConfig.salt);
                return digest(salt + password, hashConfig.algorithm)
                    .then(function(generatedHash){
                        return generatedHash.length > 0 && generatedHash === hashed;
                    });
            };

            if(!credentials || _.isEmpty(credentials.username) || _.isEmpty(credentials.password)){
                return Promise.resolve(failStatus);
            }

            return userService.getByUserName(credentials.username).then(function(user){
                if(user && user.id && user.username === credentials.username && user.password){

                    return verifyPassword(credentials.password, user.password)
                        .then(function(isPasswordMatching){
                            if(isPasswordMatching){
                                return {
                                    success: true,
                                    data : {
                                        user: user
                                    }
                                };
                            }
                            return failStatus;
                        });

                }
                return failStatus;
            });
        }
    };
});
