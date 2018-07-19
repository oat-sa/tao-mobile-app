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
    'lodash',
    'i18n',
    'module'
], function(_, __, module){
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
         * @param {Object} [config.queryString] - parameters to add to the query
         * @param {Object} [config.body] - request data
         * @returns {Function} the function to perform the request
         */
        return function request(requestConfig){

            var xhr = new XMLHttpRequest();
            var body;
            var url;

            requestConfig = _.defaults(requestConfig || {}, config, {
                method : 'GET',
                responseType: 'json',
                path   : ''
            });
            requestConfig.headers = _.defaults(requestConfig.headers || {}, config.headers, {
                'Content-Type' : 'application/json',
                'Accept':        'application/json'
            });


            if(!_.isString(requestConfig.endpoint) || _.isEmpty(requestConfig.endpoint)){
                throw new Error(errorMessages.misconfiguredEndpoint);
            }

            //build the URL
            url = requestConfig.endpoint + requestConfig.path;

            //append query string
            if(requestConfig.queryString){
                if(url.indexOf('?') < 0){
                    url += '?';
                }
                url = _.reduce(requestConfig.queryString, function(acc, value, key){
                    if(!/&$/g.test(acc)){
                        acc += '&';
                    }
                    acc += key + '=' + encodeURIComponent(value);
                    return acc;
                }, url);
            }

            //encode the body
            if(requestConfig.body) {
                if(requestConfig.headers['Content-Type'] === 'application/json' && _.isPlainObject(requestConfig.body)){
                    body = JSON.stringify(requestConfig.body);
                } else {
                    body = requestConfig.body;
                }
            }

            return new Promise(function(resolve) {

                xhr.open(requestConfig.method.toUpperCase(), url);

                if(requestConfig.responseType){
                    xhr.responseType = requestConfig.responseType;
                } else {
                    xhr.responseType = 'text';
                }

                _.forEach(requestConfig.headers, function(value, header){
                    xhr.setRequestHeader(header, value);
                });

                xhr.addEventListener('error', function(){
                    return resolve({
                        success : false,
                        errorCode : xhr.status,
                        errorMessage : errorMessages.unavaibleEndpoint
                    });
                });
                xhr.addEventListener('load', function(){
                    var errorMessage;

                    if(xhr.status === 200 || xhr.status === 302){
                        return resolve({
                            success : true,
                            data: xhr.response
                        });
                    }
                    if(xhr.status  === 0 && xhr.readyState === 4){
                        errorMessage = errorMessages.unavaibleEndpoint;
                    }
                    if(xhr.status  === 401 || xhr.status === 403){
                        errorMessage = errorMessages.unauthorized;
                    }
                    else if(xhr.status === 201) {
                        errorMessage = errorMessages.noContent;
                    }
                    else {
                        errorMessage = errorMessages.serverError + ' (' + xhr.status + ' ' + xhr.statusText + ')';
                    }

                    return resolve({
                        success : false,
                        errorCode : xhr.status,
                        errorMessage : errorMessage
                    });
                });

                xhr.send(body);
            });
        };
    };
});


