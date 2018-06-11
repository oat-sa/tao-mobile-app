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
    'urlParser',
    'app/core/request',
    'app/service/synchronization/token'
], function($, _, __, module, UrlParser, requestFactory, tokenServiceFactory){
    'use strict';

    var supportedTypes = [
        'test-taker'
    ];

    /**
     * Some default error messages
     */
    var errorMessages = {
        unavaibleEndpoint:  __('Unable to reach the server, please check your network.'),
        invalidCredentials: __('Unable to request a synchronization token with the provided handshake, please contact your administrator.'),
        serverError:        __('An unexpected error occur while trying to request a synchronization token, please contact your administrator.')
    };


    return function synchronizationClient(config) {


        var clientConfig = _.defaults( config || {}, module.config());

        var request = requestFactory({}, errorMessages);

        var tokenService = tokenServiceFactory({
            key : config.key,
            secret : config.secret
        });

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

        return  {

            getEntityIds : function getEntityIds(type, nextCallUrl, retrying){
                var self = this;
                var entityIds = {};

                validateType(type);

                return getAccessToken(retrying === true)
                    .then(function(token) {
                        return request(_.defaults({
                            path : nextCallUrl || clientConfig.api.entity.path,
                            headers: {
                                'Authorization' : 'Bearer ' + token.access_token
                            },
                            data : {
                                type : type
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

            getEntitiesContent : function getEntitiesContent(type, entityIds, retrying){

                validateType(type);

                if(!_.isArray(entityIds) || !entityIds.length){
                    return Promise.resolve([]);
                }

                return getAccessToken(retrying === true)
                    .then(function(token) {
                        return request(_.defaults({
                            headers: {
                                'Authorization' : 'Bearer ' + token.access_token
                            },
                            data : JSON.stringify({
                                type : type,
                                entityIds : entityIds
                            })
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
            }
        };
    };
});
