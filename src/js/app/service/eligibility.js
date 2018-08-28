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
 * Service that manages eligibilies.
 * an eligilibitly contains the link between a delivey,
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store',
], function(_, store){
    'use strict';

    var eligibilityStoreName = 'eligibility';

    /**
     * Definition of a minimal eligibility as seen by the service
     * @typedef {Object} eligibility
     * @param {String} id - the eligibility unique identifier
     * @param {String} delivery - the eligible delivery
     * @param {String[]} testTakers - the eligible test takers
     */

    /**
     * Validates a eligibility object
     * @param {eligibility} eligibility
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the eligibility doesn't match the expectations
     */
    var validateEligibility = function validateEligibility(eligibility){
        if(!_.isPlainObject(eligibility)){
            throw new TypeError('Missing or invalid eligibility');
        }
        if(_.isEmpty(eligibility.id)){
            throw new TypeError('An eligibility needs to have a property id');
        }
        if(_.isEmpty(eligibility.delivery)){
            throw new TypeError('An eligibility needs to have a property delivery');
        }
        if(!_.isArray(eligibility.testTakers)){
            throw new TypeError('An eligibility needs to have a property testTakers');
        }
        return true;
    };

    /**
     * @typedef {Object} eligibilityService
     */
    return {

        /**
         * Get a eligibility from it's identifier / URI.
         *
         * @param {String} id - the eligibility identifier
         * @returns {Promise<eligibility>} resolves with the eligibility or null if not found
         */
        getById : function getById(id){
            if(_.isEmpty(id)){
                return Promise.resolve(null);
            }
            return store(eligibilityStoreName).then(function(eligibilityStore){
                return eligibilityStore.getItem(id);
            });
        },

        /**
         * Get all eligibilitys
         * @returns {Promise<Object[]>} resolves with the eligibility collection
         */
        getAll : function getAll(){
            return store(eligibilityStoreName).then(function(eligibilityStore){
                return eligibilityStore.getItems();
            });
        },

        /**
         * Set an eligibility (add or replace), if one exists already, it will be replaced !
         *
         * @param {eligibility} eligibility - a valid eligibility instance
         * @returns {Promise<Boolean>} resolves with true if set
         * @throws {TypeError} when trying to set an invalid eligibility
         */
        set : function set(eligibility){

            validateEligibility(eligibility);

            return store(eligibilityStoreName).then(function(eligibilityStore){
                return eligibilityStore.setItem(eligibility.id, eligibility);
            });
        },

        /**
         * Update by merge an existing eligibility.
         *
         * If an entry was already there, we will merge them,
         * using the existing values as default.
         *
         * The merge is only done at the 1st level.
         *
         * @param {String} id - the eligibility identifier
         * @param {Object|eligibility} properties - the properties to set to the eligibility
         * @returns {Promise<Boolean>} resolves with true if updated
         */
        update : function update(id, properties){
            var self = this;

            if(!_.isPlainObject(properties) || _.isEmpty(id) ){
                return Promise.resolve(false);
            }

            return this.getById(id).then(function(existingEligibility){
                return self.set(_.defaults(properties, existingEligibility || {}));
            });
        },

        /**
         * Remove an eligibility
         *
         * @param {String} id - the eligibility identifier
         * @returns {Promise<Boolean>} resolves with true if removed
         */
        remove : function remove(id){
            if(_.isEmpty(id)){
                return Promise.resolve(false);
            }
            return this.getById(id).then(function(eligibility){
                if(eligibility && eligibility.id){
                    return store(eligibilityStoreName).then(function(eligibilityStore){
                        return eligibilityStore.removeItem(id);
                    });
                }
                return false;
            });
        },

        /**
         * Remove all eligibilities
         *
         * @returns {Promise<Boolean>}
         */
        removeAll : function removeAll(){
            return store(eligibilityStoreName).then(function(eligibilityStore){
                return eligibilityStore.clear();
            });
        }
    };
});

