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
 * Application router.
 * Let's you dispatch routes (only)
 * to prevent any URL navigation.
 *
 * The router handles by default the routes from the app
 * but also supports any route from TAO
 * (as soon as the controller is part of the bundle)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'module',
    'core/eventifier',
    'core/logger',
    'core/promiseQueue',
    'router',
], function(_, module, eventifier, loggerFactory, promiseQueue, router){
    'use strict';


    /**
     * Consider the app as an extension,
     * all internal routes are prefixed
     */
    var appExtension = 'app';

    /**
     * Dispatch only one route at a time
     */
    var queue = promiseQueue();

    /**
     * Customizable config
     */
    var config = _.defaults(module.config() || {}, {
        timeout : 5 * 1000
    });

    var logger = loggerFactory('app/service/router');

    /**
     * The router is an eventier
     */
    return eventifier({

        /**
         * Dispatch the given route
         * @param {String} route - an internal route (main/login will dispatch the matching route in app/controller/routes.js)
         * @param {Object} [params] - extra parameters to send to the dispatched controller
         * @returns {Promise}
         * @fires router#dispatching when the dispatch starts
         * @fires router#dispatched when the dispatch is done
         */
        dispatch : function disptach(route, params){
            var self = this;
            var taoRoute = route;

            if(route.split('/').length <= 2){
                taoRoute = appExtension + '/' + route;
            }
            return queue.serie(function taoDispatch(){

                logger.debug('Dispatching route ' + route + '(' + taoRoute + ')');

                /**
                 * @event router#dispatching
                 * @param {String} route - the given route
                 * @param {String} taoRoute - the full route sent to the tao router
                 * @param {Object} [params] - the dispatch parameters
                 */
                self.trigger('dispatching', route, taoRoute, params);

                //we dispatch the route, in the queue, with a timeout
                return Promise.race([
                    new Promise( function(resolve){

                        router.dispatch(taoRoute, function dispatched(){

                            logger.debug('Route ' + route + '(' + taoRoute + ') dispatched');

                            /**
                             * @event router#dispatched
                             * @param {String} route - the given route
                             * @param {String} taoRoute - the full route sent to the tao router
                             * @param {Object} [params] - the dispatch parameters
                             */
                            self.trigger('dispatched', route, taoRoute, params);

                            return resolve();
                        });
                    }),
                    new Promise( function( resolve, reject){
                        setTimeout(function(){
                            return reject(new Error('Timeout : unable to dispatch the route ' + route));
                        }, config.timeout);
                    })
                ]);
            });
        }
    });
});

