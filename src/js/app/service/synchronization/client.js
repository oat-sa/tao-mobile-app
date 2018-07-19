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
 * Data synchronization client.
 *
 * The client shouldn't be used directly in controllers, but
 * should be used for a given synchronization type (see {@link app/service/synchronization/testTaker}).
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'module',
    'app/core/request',
    'app/service/synchronization/token'
], function($, _, __, module, requestFactory, tokenServiceFactory){
    'use strict';

    /**
     * The list of resource types we can synchronize
     */
    var supportedTypes = [
        'test-taker',
        'delivery',
        'eligibility'
    ];

    /**
     * Some default error messages
     */
    var errorMessages = {
        unavaibleEndpoint:  __('Unable to reach the server, please check your network.'),
        invalidCredentials: __('You are not authorized to synchronize the requested data, please contact your administrator.'),
        serverError:        __('An unexpected error occur while trying to synchronize, please contact your administrator.')
    };

    /**
     * Creates a new client
     * @param {Object} config
     * @param {String} config.key - the OAuth key linked to the syncManager profile
     * @param {String} config.secret - the OAuth secret  linked to the syncManager profile
     * @param {String} [config.orgId] - if the synchronization is scoped by an organisation id
     * @param {Object} config.api - contains the REST API info for the request module
     * @param {Object} config.api.entity - contains the REST API info for the getEntityIds call
     * @param {Object} config.api.details - contains the REST API info for the getEntitiesContent call
     * @param {Object} config.api.assembly - contains the REST API info for the downloadDeliveryAssembly call
     * @param {String} config.assemblyRoot - the root path where the assemblies are extracted
     * @returns {synchronizationClient} the client
     */
    return function synchronizationClientFactory(config) {

        var clientConfig = _.defaults( config || {}, module.config());

        //configured request object for the 2 types of calls
        var request = requestFactory({}, errorMessages);

        //we need a valid token for each sync
        var tokenService = tokenServiceFactory({
            key : config.key,
            secret : config.secret
        });

        /**
         * Ensure the requested resource type is supported
         * @param {String} type - the resource type
         * @returns {Boolean} true
         * @throws {TypeError} if not supported
         */
        var validateType = function validateType(type){
            if(!_.isString(type) || !_.contains(supportedTypes, type)){
                throw new TypeError('Unsupported resource type for synchronization : ' + type);
            }
            return true;
        };

        var getAccessToken = function getAccessToken(force){
            if(force){
                return tokenService.requestToken();
            }
            return tokenService.getToken();
        };

        var authHeaders = function authHeaders(token, headers) {
            headers = headers || {};
            headers['Authorization'] = 'Bearer ' + token;
            return headers;
        };

        /**
         * @typedef {Object} synchronizationClient
         */
        return  {

            /**
             * Get the ids and checksums (only) of the entities on the server
             * @param {String} type - the resource type
             * @param {String} [nextCallUrl] - the sync server makes paging by sending you the next URL to call until (weird)
             * @param {Boolean} [retrying = false] - retry with a new token (only once)
             * @returns {Promise<Object>} resolves with the ids
             */
            getEntityIds : function getEntityIds(type, nextCallUrl, retrying){
                var self = this;
                var entityIds = {};

                validateType(type);

                return getAccessToken(retrying === true)
                    .then(function(token) {
                        return request(_.defaults({
                            path : nextCallUrl || clientConfig.api.entity.path,
                            headers: authHeaders(token.access_token, clientConfig.api.entity.headers),
                            queryString : {
                                type : type,
                            }
                        }, clientConfig.api.entity));
                    })
                    .then(function(result){
                        if(result){
                            if(result.success === true && result.data && result.data.entities){

                                entityIds = _.merge(entityIds, result.data.entities);

                                if(result.data.nextCallUrl && result.data.nextCallUrl !== nextCallUrl){
                                    return self.getEntityIds(type, result.data.nextCallUrl, false);
                                }
                                return entityIds;
                            }
                            else if(retrying === false && result.status === 403 || result.status === 401){
                                return self.getEntityIds(type, nextCallUrl, true);
                            }
                        }
                    });
            },

            /**
             * Get the content of a batch of entities
             * @param {String} type - the resource type
             * @param {String[]} entityIds - the ids of the entities to get the content
             * @param {Boolean} [retrying = false] - retry with a new token (only once)
             * @returns {Promise<Object>} resolves with the entities
             */
            getEntitiesContent : function getEntitiesContent(type, entityIds, retrying){

                validateType(type);

                if(!_.isArray(entityIds) || !entityIds.length){
                    return Promise.resolve([]);
                }

                return getAccessToken(retrying === true)
                    .then(function(token) {
                        return request(_.defaults({
                            headers: authHeaders(token.access_token, clientConfig.api.details.headers),
                            body : {
                                type : type,
                                entityIds : entityIds
                            }
                        }, clientConfig.api.details));
                    })
                    .then(function(result){
                        if(result){
                            if(result.success === true && result.data){
                                return result.data;
                            }
                            else if(retrying === false && result.status === 403 || result.status === 401){
                                return self.getEntitiesContent(type, entityIds, true);
                            }
                        }
                    });
            },

            downloadDeliveryAssembly : function downloadDeliveryAssembly(deliveryId, retrying){

                if(_.isEmpty(deliveryId)){
                    return Promise.resolve(false);
                }

                return getAccessToken(retrying === true)
                    .then(function(token) {

                        return request(_.defaults({
                            headers: authHeaders(token.access_token, clientConfig.api.assembly.headers),
                            queryString : {
                                deliveryIdentifier : deliveryId
                            }
                        }, clientConfig.api.assembly));
                    })
                    .then(function(result){
                        if(result){
                            if(result.success === true && result.data){
                                return result.data;
                            }
                            else if(retrying === false && result.status === 403 || result.status === 401){
                                return self.getEntitiesContent(deliveryId, true);
                            }
                        }
                    });
            }
        };
    };
});
