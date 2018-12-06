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
 * Service that manages entities against a local storage.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/logger',
    'core/store',
], function(_, loggerFactory, store){
    'use strict';

    /**
     * Create a store service instance
     * @param {String} entityName - the name of the entity
     * @param {String} storeName - the name of the store "table"
     * @param {entityValidator} [validator] - a validator function
     * @returns {storeService}
     * @throws {TypeError} when the required parameters are missing
     */
    return function storeServiceFactory(entityName, storeName, validator){

        var logger = loggerFactory('app/service/storeService');

        if(_.isEmpty(entityName)){
            throw new TypeError('An entity name is expected');
        }
        if(_.isEmpty(storeName)){
            throw new TypeError('A store name is required to setup a store service');
        }

        if(!_.isFunction(validator)){

            /**
             * Default entiy validator
             * @callback entityValidator
             * @param {Object} entity
             * @param {String} entity.id
             * @param {String} entity.label
             * @returns {Boolean} true if valid
             * @throws {TypeError} when the entity doesn't match the expectations
             */
            validator = function entityValidator(entity){
                if(!_.isPlainObject(entity)){
                    throw new TypeError('Missing or invalid ' + entityName);
                }
                if(_.isEmpty(entity.id)){
                    throw new TypeError('A ' + entityName + '  needs to have a property id');
                }
                if(_.isEmpty(entity.label)){
                    throw new TypeError('A ' + entityName + ' needs to have a property label');
                }
                return true;
            };
        }

        /**
         * @typedef {Object} storeService
         */
        return {

            /**
             * Get an entity from it's identifier / URI.
             *
             * @param {String} id - the entity identifier
             * @returns {Promise<Object>} resolves with the entity or null if not found
             */
            getById : function getById(id){
                if(_.isEmpty(id)){
                    return Promise.resolve(null);
                }
                return store(storeName).then(function(entityStore){
                    return entityStore.getItem(id);
                });
            },

            /**
             * Get all entities
             * @returns {Promise<Object[]>} resolves with the entity collection
             */
            getAll : function getAll(){
                return store(storeName).then(function(entityStore){
                    return entityStore.getItems();
                });
            },

            /**
             * Set an entity (add or replace), if one exists already, it will be replaced !
             *
             * @param {Object} entity - a valid entity instance
             * @returns {Promise<Boolean>} resolves with true if set
             * @throws {TypeError} when trying to set an invalid entity
             */
            set : function set(entity){

                if(_.isFunction(validator)){
                    validator(entity);
                }

                logger.debug('Trying to set the ' + entityName + ' : ' + entity.id);

                return store(storeName).then(function(entityStore){
                    return entityStore.setItem(entity.id, entity);
                })
                .then(function(inserted){
                    if(inserted){
                        logger.debug( entityName + ' : ' + entity.id + ' set');
                    } else {
                        logger.debug( entityName + ' : ' + entity.id + ' NOT set');
                    }
                    return inserted;
                });
            },

            /**
             * Update by merge an existing entity.
             *
             * If an entry was already there, we will merge them,
             * using the existing values as default.
             *
             * The merge is only done at the 1st level.
             *
             * @param {String} id - the entity identifier
             * @param {Object} properties - the properties to set
             * @returns {Promise<Boolean>} resolves with true if updated
             */
            update : function update(id, properties){
                var self = this;

                if(!_.isPlainObject(properties) || _.isEmpty(id) ){
                    return Promise.resolve(false);
                }

                logger.debug('Trying to update the ' + entityName + ' : ' + id);

                return this.getById(id).then(function(entity){
                    return self.set(_.defaults(properties, entity || {}));
                })
                .then(function(updated){
                    if(updated){
                        logger.debug( entityName + ' : ' + id + ' updated');
                    } else {
                        logger.debug( entityName + ' : ' + id + ' NOT updated');
                    }
                    return updated;
                });
            },

            /**
             * Remove an entity
             *
             * @param {String} id - the entity identifier
             * @returns {Promise<Boolean>} resolves with true if removed
             */
            remove : function remove(id){
                if(_.isEmpty(id)){
                    return Promise.resolve(false);
                }

                logger.debug('Trying to remove ' + entityName + ' : ' + id);

                return this.getById(id).then(function(entity){
                    if(entity && entity.id){
                        return store(storeName).then(function(entityStore){
                            return entityStore.removeItem(entity.id);
                        });
                    }
                    return false;
                })
                .then(function(removed){
                    if(removed){
                        logger.debug( entityName + ' : ' + id + ' removed');
                    } else {
                        logger.debug( entityName + ' : ' + id + ' NOT removed');
                    }
                    return removed;
                });
            },

            /**
             * Remove all entities
             *
             * @returns {Promise<Boolean>}
             */
            removeAll : function removeAll(){

                logger.warn('Remove all ' + entityName + ' triggered');

                return store(storeName).then(function(entityStore){
                    return entityStore.clear();
                });
            }
        };
    };
});

