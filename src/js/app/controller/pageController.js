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
 * The page controller augments controllers i
 * with shared methods and resources :
 *  - the main container
 *  - a logger
 *  - a central error handler
 *  - the router
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/logger',
    'ui/feedback',
    'app/core/router'
], function(_, loggerFactory, feedback, router){
    'use strict';

    var container;

    var logger = loggerFactory('app/controller');

    /**
     * Augments the given controller
     * @param {Object} controller - the controller to augment
     * @returns {Object} the controller, now a pageController
     * @throws {TypeError} if the parameter isn't a valid controller
     */
    return function pageController(controller) {

        if(!controller || ! _.isFunction(controller.start)){
            throw new TypeError('Invalid controller given');
        }

        return _.assign(controller, {

            /**
             * Get the main container
             * @returns {HTMLElement} the container
             */
            getContainer : function getContainer(){
                if(!container){
                    container = document.getElementById('page');
                }
                return container;
            },

            /**
             * Central method handler
             * @param {Error} err
             */
            handleError : function handleError(err){
                logger.error(err);
                feedback().error(err);
            },

            /**
             * Get the logger dedicated to controllers
             * @param {String} [name] - give a name, you'll get a sub logger
             * @returns {Object} the logger
             */
            getLogger : function getLogger(name){
                if(!_.isEmpty(name)) {
                    return logger.child({ context : name });
                }
                return logger;
            },

            /**
             * Gives access to the page router
             * @returns {Object} the router
             */
            getRouter : function getRouter(){
                return router;
            },

            /**
             * Get page parameters if attached to the container's data-params
             * @returns {Object} the parameters
             */
            getParams : function getParams(){
                try {
                    return JSON.parse(container.dataset.params);
                } catch(err){
                    logger.error(err);
                }
                return {};
            }
        });
    };
});
