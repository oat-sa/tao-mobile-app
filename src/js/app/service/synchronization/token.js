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
 * Request and keep OAuth token to authenticate against the sync server.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'app/core/request'
], function($, _, __, module, requestFactory){
    'use strict';

    // Since only the last requested token is
    // valid, we keep the promises so if
    // they are being asked multiple time while
    // retrieving we wait for the promise to resolve
    //
    var tokenPromises = {};

    /**
     * Some default error messages
     */
    var errorMessages = {
        unauthorized:  __('Unable to request a synchronization token with the provided handshake, please contact your administrator.'),
        noContent   :  __('Unable to retrieve your synchronization token, please retry later or contact your administrator')
    };

    /**
     * Creates a configured token service
     * @param {Object} config
     * @param {String} config.key - the OAuth key linked to the syncManager profile
     * @param {String} config.secret - the OAuth secret  linked to the syncManager profile
     * @param {Object} config.api - contains the REST API info for the request module
     * @returns {tokenService} the client
     * @throws {TypeError} if something is missing in the config
     */
    return function tokenServiceFactory(config) {

        var token;

        var serviceConfig = _.defaults( config || {}, module.config());

        var request = requestFactory(serviceConfig.api, errorMessages);

        if( _.isEmpty(serviceConfig.key) || _.isEmpty(serviceConfig.secret)) {
            throw new TypeError('Handshake key and secret are mandatory to request an synchronization token');
        }

        /**
         * @typedef {Object} tokenService
         */
        return  {

            /**
             * Check whether the token is expired.
             * We assume the token expiration date is in UTC
             * @returns {Boolean} true if expired
             */
            isExpired : function isExpired(){
                if( token !== null && token.expires > 0 && token.expires < (new Date().getUTCDate() / 1000) ) {
                    return false;
                }
                return true;
            },

            /**
             * Get the current token or request a new one
             * @returns {Promise<Object>} resolves with the Token
             */
            getToken : function getToken() {
                if(token){
                    return Promise.resolve(token);
                }
                if(typeof tokenPromises[serviceConfig.key] === 'undefined'){
                    tokenPromises[serviceConfig.key] = this.requestToken(serviceConfig.key, serviceConfig.secret)
                        .then(function(result){
                            if(result && !_.isEmpty(result.access_token) && result.expires > 0){
                                token = result;
                                return token;
                            }
                        });
                }
                return tokenPromises[serviceConfig.key];
            },

            /**
             * Request a new token.
             * @param {String} [key] - set the key, use the configured one otherwise
             * @param {String} [secret - set the secret, use the configured one otherwise
             * @returns {Promise<Object>} resolves with the Token
             */
            requestToken : function requestToken(key, secret) {
                return request({
                    queryString : {
                        client_id : key || serviceConfig.key,
                        client_secret : secret || serviceConfig.secret
                    }
                })
                .then(function(response){
                    if(response && response.success === true) {
                        return response.data;
                    }

                    throw new Error(response.errorMessage || errorMessages.noContent);
                });
            }
        };
    };

});


