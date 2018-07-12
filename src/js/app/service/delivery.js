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
 * Service that manages deliveries.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/store',
], function(_, store){
    'use strict';

    var deliveryStoreName = 'delivery';

    /**
     * Definition of a minimal delivery as seen by the service
     * @typedef {Object} delivery
     * @param {String} id - the delivery unique identifier
     * @param {String} label - the delivery label
     */

    /**
     * Validates a delivery object
     * @param {delivery} delivery
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the delivery doesn't match the expectations
     */
    var validateDelivery = function validateDelivery(delivery){
        if(!_.isPlainObject(delivery)){
            throw new TypeError('Missing or invalid delivery');
        }
        if(_.isEmpty(delivery.id)){
            throw new TypeError('An delivery needs to have a property id');
        }
        if(_.isEmpty(delivery.label)){
            throw new TypeError('A delivery needs to have a property label');
        }
        return true;
    };

    /**
     * @typedef {Object} deliveryService
     */
    return {

        /**
         * Get a delivery from it's identifier / URI.
         *
         * @param {String} id - the delivery identifier
         * @returns {Promise<delivery>} resolves with the delivery or null if not found
         */
        getById : function getById(id){
            if(_.isEmpty(id)){
                return Promise.resolve(null);
            }
            return store(deliveryStoreName).then(function(deliveryStore){
                return deliveryStore.getItem(id);
            });
        },

        /**
         * Get all deliveries
         * @returns {Promise<Object[]>} resolves with the delivery collection
         */
        getAll : function getAll(){
            return store(deliveryStoreName).then(function(deliveryStore){
                return deliveryStore.getItems();
            });
        },

        /**
         * Set an delivery, if one exists already, it will be replaced !
         * @param {delivery} delivery
         * @returns {Promise<Boolean>} resolves with true if set
         */
        set : function set(delivery){

            validateDelivery(delivery);

            return store(deliveryStoreName).then(function(deliveryStore){
                return deliveryStore.setItem(delivery.id, delivery);
            });
        },

        /**
         * Update an delivery,
         * if an entry was already there, we will merge them,
         * using the existing values as default.
         *
         * @param {delivery} delivery - the delivery to update
         * @returns {Promise<Boolean>} resolves with true if updated
         */
        update : function update(delivery){
            var self = this;

            if(!_.isPlainObject(delivery) || !delivery.id){
                return Promise.resolve(false);
            }

            return this.getById(delivery.id).then(function(existingEligibility){
                return self.set(_.defaults(delivery, existingEligibility || {}));
            });
        },

        /**
         * Remove an delivery
         *
         * @param {String} id - the delivery identifier
         * @returns {Promise<Boolean>} resolves with true if removed
         */
        remove : function remove(id){
            if(_.isEmpty(id)){
                return Promise.resolve(false);
            }
            return this.getById(id).then(function(delivery){
                if(delivery && delivery.id){
                    return store(deliveryStoreName).then(function(deliveryStore){
                        return deliveryStore.removeItem(id);
                    });
                }
                return false;
            });
        },

        /**
         * Remove all deliveries
         *
         * @returns {Promise<Boolean>}
         */
        removeAll : function removeAll(){
            return store(deliveryStoreName).then(function(deliveryStore){
                return deliveryStore.clear();
            });
        }
    };
});

