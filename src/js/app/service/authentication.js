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
 * Service that manages the authentication,
 * mostly delegates to adapters.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'module',
    'app/service/authentication/syncManagerAdapter',
    'app/service/authentication/localAdapter',
], function(_, module, syncManagerAdapter, localAdapter){
    'use strict';

    var authenticationService;

    var config = module.config();

    /**
     * Check whether the given authentication adapter is valid
     * @param {Object} adapter - the adapter to verify
     * @returns {Boolean} true if valid
     */
    var validateAdapter = function validateAdapter(adapter){
        return _.isPlainObject(adapter) &&  _.isFunction(adapter.authenticate) && !_.isEmpty(adapter.name);
    };

    /**
     * Registers a list of adapters
     * @param {Object[]} adapters - the adapters to register
     */
    var registerAdapters = function registerAdapters(adapters){
        _.forEach(adapters, function(adapter){
            if(validateAdapter(adapter)){
                authenticationService.adapters[adapter.name] = adapter;
            }
        });
    };

    authenticationService = {

        /**
         * Exposes the adapters
         */
        adapters : {},

        /**
         * Authenticate a user
         * @param {Object} adapter - the authentication adapter used for this authentication
         * @returns {Promise<Object>} should resolve with the status and the user if logged in
         */
        authenticate : function authenticate(adapter, values){
            var adapterConfig;
            if(!validateAdapter(adapter)){
                throw new TypeError('The authentication adatper  must be defined');
            }
            if(!_.isPlainObject(values)){
                throw new TypeError('No values given for the authentication');
            }

            adapterConfig = config[adapter.name];

            return adapter.authenticate(adapterConfig, values);
        }
    };

    registerAdapters([
        localAdapter,
        syncManagerAdapter
    ]);

    return authenticationService;
});
