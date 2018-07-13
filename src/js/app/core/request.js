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
 * Provides pre-configured request to endpoint service
 *
 * This allows you to configure the request either from
 * the factory or from the request function itself.
 *
 * The request expects a JSON response and is aware
 * of HTTP response codes.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module'
], function($, _, __, module){
    'use strict';

    /**
     * Creates a pre-configured request function
     * @param {Object} config - the request configuration
     * @param {String} [config.endpoint] - the base URL of the endpoint to contact
     * @param {String} [config.path] - the path of the URL (will be concatenated to the endpoint)
     * @param {String} [config.method] - the HTTP method
     * @param {Object} [config.headers] - additional headers
     * @param {Object} [config.data] - request data (queryString for GET, JSON body for POST)
     * @param {Object} [errorMessages] - let's you change the default error messages
     * @returns {Function} the function to perform the request
     */
    return function requestFactory(config, errorMessages) {

        config = _.defaults(config || {}, module.config());

        errorMessages = _.defaults(errorMessages || {}, {
            misconfiguredEndpoint:  __('The server URL is not configured correctly, please contact your administrator.'),
            unavaibleEndpoint:  __('Unable to reach the server, please check your network.'),
            noContent :         __('No content found, please retry later'),
            unauthorized:       __('You are not authorized to perform this action, please contact your administrator.'),
            serverError:        __('An unexpected error occur while contactng the server, please contact your administrator.')
        });


        /**
         * Performs the request
         * @param {Object} config - the request configuration
         * @param {String} [config.endpoint] - the base URL of the endpoint to contact
         * @param {String} [config.path] - the path of the URL (will be concatenated to the endpoint)
         * @param {String} [config.method] - the HTTP method
         * @param {Object} [config.headers] - additional headers
         * @param {Object} [config.data] - request data (queryString for GET, JSON body for POST)
         * @returns {Function} the function to perform the request
         */
        return function request(requestConfig){
            requestConfig = _.defaults(requestConfig || {}, config, {
                method : 'GET',
                path   : '',
                headers: {}
            });

            if(!_.isString(requestConfig.endpoint) || _.isEmpty(requestConfig.endpoint)){
                throw new Error(errorMessages.misconfiguredEndpoint);
            }

            return new Promise(function(resolve, reject){
                var method = requestConfig.method.toUpperCase();
                $.ajax({
                    url: requestConfig.endpoint + requestConfig.path,
                    type: method,
                    dataType: 'json',
                    contentType: 'application/json',
                    headers : requestConfig.headers,
                    data : requestConfig.data
                })
                .done(function(response, status, xhr){
                    if ( (xhr.status === 200 || xhr.status === 302) && response){
                        return resolve({
                            success : true,
                            data    : response
                        });
                    }
                    return resolve({
                        success : false,
                        errorCode : xhr.status,
                        errorMessage : errorMessages.noContent
                    });
                })
                .fail(function(xhr){
                    if(xhr.status === 401 || xhr.status === 403){
                        return resolve({
                            success : false,
                            errorCode : xhr.status,
                            errorMessage : errorMessages.unauthorized
                        });
                    }
                    if(xhr.status === 0){
                        return reject(new Error(errorMessages.unavaibleEndpoint));
                    }
                    return reject(new Error(errorMessages.serverError + ' (' + xhr.status + ' : ' + xhr.statusText + ')' ));
                });
            });
        };
    };
});


