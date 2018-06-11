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
    'app/service/user'
], function(_, __, userService){
    'use strict';

    var subtle = window.crypto.subtle || window.crypto.webkitSublte;

    /**
     * The dedicated error messages
     */
    var errorMessages = {
        missingCredentials:    __('Missing username or password, please fill them and try again.'),
        unauthorized:          __('Invalid credentials, please try again.')
    };

    function hex(buffer) {
        var hexCodes = [];
        var view = new DataView(buffer);
        for (var i = 0; i < view.byteLength; i += 4) {
            // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
            var value = view.getUint32(i)
            // toString(16) will give the hex representation of the number without padding
            var stringValue = value.toString(16)
            // We use concatenation and slice for padding
            var padding = '00000000'
            var paddedValue = (padding + stringValue).slice(-padding.length)
            hexCodes.push(paddedValue);
        }

        // Join all the hex strings into one
        return hexCodes.join("");
    }

    return {

        name : 'local',

        authenticate : function authenticate(config, credentials){
            var status = {
                success: false,
                message: errorMessages.unauthorized
            };
            var verifyPassword = function verifyPassword(password, hash){
                var hashAlgorithm = config.hash.algorithm || 'sha-256';
                var salt = hash.substring(0, config.hash.salt);
                var hashed = hash.substring(config.hash.salt);
                console.log('password', password);
                console.log('hash', hash);
                console.log('salt', salt);
                console.log('hashed', hashed);
                return subtle
                    .digest(hashAlgorithm.toUpperCase(), new TextEncoder('utf-8').encode(salt + password))
                    .then(function(buffer){
                        console.log( hex(buffer) + ' === ' + hashed);
                        return hex(buffer) === hashed;
                    });
            };

            if(!credentials || _.isEmpty(credentials.username) || _.isEmpty(credentials.password)){
                return Promise.resolve(status);
            }

            return userService.getByUsername(credentials.username).then(function(user){
                if(user && user.id && user.username === credentials.username && user.password){
                    return verifyPassword(credentials.password, user.password)
                        .then(function(passwordMatching){
                            if(passwordMatching){
                                status = {
                                    success: true,
                                    data : {
                                        user: user
                                    }
                                };
                            }
                            return status;
                        });
                }
                return status;
            });
        }
    };
});
