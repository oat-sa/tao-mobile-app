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
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'app/service/request'
], function($, _, __, module, requestFactory){
    'use strict';

    /**
     * Some default error messages
     */
    var errorMessages = {
        unauthorized:  __('Unable to request a synchronization token with the provided handshake, please contact your administrator.'),
        noContent   :  __('Unable to retrieve your synchronization token, please retry later or contact your administrator')
    };


    return function tokenService(config) {

        var token = null;

        var serviceConfig = _.defaults( config || {}, module.config());

        var request = requestFactory(serviceConfig.api, errorMessages);

        if( _.isEmpty(serviceConfig.key) || _.isEmpty(serviceConfig.secret)) {
            throw new TypeError('Handshake key and secret are mandatory to request an synchronization token');
        }

        return  {

            isExpired : function isExpired(){
                if( token !== null && token.expires > 0 && token.expires < (new Date().getUTCDate() / 1000) ) {
                    return false;
                }
                return true;
            },

            getToken : function getToken() {
                if(token === null){
                    return this.requestToken(serviceConfig.key, serviceConfig.secret)
                        .then(function(result){
                            if(result && !_.isEmpty(result.access_token) && result.expires > 0){
                                token = result;
                                return token;
                            }
                        });
                }
                return Promise.resolve(token);
            },

            requestToken : function requestToken(key, secret) {
                return request({
                    data : {
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


