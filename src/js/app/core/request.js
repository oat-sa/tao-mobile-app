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
            var queryString;

            requestConfig = _.defaults(requestConfig || {}, config, {
                method : 'GET',
                responseType: 'json',
                path   : ''
            });
            requestConfig.headers = _.defaults(requestConfig.headers || {}, config.headers, {
                'Content-Type' : 'application/json',
                'Accept':        'application/json'
            });

            //check if the endpoint is configured
            if(!_.isString(requestConfig.endpoint) || _.isEmpty(requestConfig.endpoint)){
                throw new Error(errorMessages.misconfiguredEndpoint);
            }

            //build the URL
            url = requestConfig.endpoint + requestConfig.path;

            //serialize and append query string
            if(requestConfig.queryString){
                queryString = _.reduce(requestConfig.queryString, function(acc, value, key){
                    if(_.isPlainObject(value)){
                        _.forEach(value, function(subValue, subKey){
                            acc.push(key + '[' + subKey + ']=' + encodeURIComponent(subValue));
                        });
                    } else {
                        acc.push(key + '=' + encodeURIComponent(value));
                    }
                    return acc;
                }, []);

                if(url.indexOf('?') < 0){
                    url += '?';
                }
                url += queryString.join('&');
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

                /**
                 * Format the error response
                 * @param {Number} code - the error code
                 * @param {String} message - the error message
                 * @returns {Promise<Object>} the response
                 */
                var resolveError = function resolveError(code, message){
                    return resolve({
                        success : false,
                        errorCode : code,
                        errorMessage : message
                    });
                };

                //formulate the request

                xhr.open(requestConfig.method.toUpperCase(), url);

                if(config.timeout && config.timeout > 0){
                    xhr.timeout = config.timeout;
                }

                if(requestConfig.responseType){
                    xhr.responseType = requestConfig.responseType;
                } else {
                    xhr.responseType = 'text';
                }

                _.forEach(requestConfig.headers, function(value, header){
                    xhr.setRequestHeader(header, value);
                });

                //we consider the service unavailable in case or network errors...
                xhr.addEventListener('error', function(){
                    return resolveError(0, errorMessages.unavaibleEndpoint);
                });

                //... Or in case of timeout, if any
                xhr.addEventListener('timeout', function(){
                    return resolveError(0, errorMessages.unavaibleEndpoint);
                });

                xhr.addEventListener('load', function(){

                    if(xhr.status === 200 || xhr.status === 302){
                        return resolve({
                            success : true,
                            data: xhr.response
                        });
                    }

                    if( xhr.status  === 0 && xhr.readyState === 4){
                        return resolveError(0, errorMessages.unavaibleEndpoint);
                    }

                    //In Cordova apps (device) you'll have a 401 on the preflight request when
                    //the server is not reachable. The CORS policy denies is request because the
                    //preflight did not succeed, so it sends you a 401 instead of 0. :/
                    if(xhr.status === 401){
                        if(requestConfig.method.toLowerCase() !== 'head'){ //prevent too much recursion

                            //so we head to the server to verify if we are really unauthorized
                            //or if the service is not available
                            return request({
                                endpoint : requestConfig.endpoint,
                                path     : '/',
                                method   : 'head'
                            })
                            .then(function(response){

                                //the server is reachable, it's a regular 401
                                if(response.success === true){
                                    return resolveError(401, errorMessages.unauthorized);
                                } else {
                                    return resolveError(0, errorMessages.unavaibleEndpoint);
                                }
                            })
                            .catch(function(err){
                                return resolveError(500, errorMessages.serverError + ':' + err.message);
                            });
                        }
                        return resolveError(401, errorMessages.unauthorized);
                    }
                    if(xhr.status === 403){
                        return resolveError(403, errorMessages.unauthorized);
                    }
                    if(xhr.status === 201) {
                        return resolveError(201, errorMessages.noContent);
                    }

                    return resolveError(xhr.status, errorMessages.serverError + ' (' + xhr.status + ' ' + xhr.statusText + ')');
                });

                xhr.send(body);
            });
        };
    };
});


