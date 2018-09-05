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
 * App main controller,
 * set up the router and the navigation,
 * dispatch the 1st route, based on the session.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'app/controller/pageController',
    'app/service/session'
],  function($, _, pageController, sessionService){
    'use strict';

    /**
     * The App controller,
     * bootstrap the app (session, routing and controller)
     */
    return pageController({

        /**
         * Application main entrypoint,
         * starts the routing
         */
        start: function start(){
            var self          = this;
            var router        = this.getRouter();
            var pageContainer = this.getContainer();

            //page transition when the router dipatch
            this.getRouter( )
                .on('dispatching', function(route, taoRoute, params){
                    pageContainer.classList.add('page-change');

                    //prepare the page params early
                    pageContainer.innerHTML = '';
                    pageContainer.dataset.page = route;
                    pageContainer.dataset.params = JSON.stringify(params || {});
                })
                .on('dispatched', function(){
                    pageContainer.classList.remove('page-change');
                });

            //dispatch a route if an element has the correct data-attr
            $(pageContainer).on('click', '[data-route]', function(e){
                var route = $(this).data('route');
                if(route){
                    e.preventDefault();

                    router.dispatch(route);
                }
            });

            //the default route is based on the current session content, if any
            sessionService.getEntryPoint()
                .then(function(entryPoint){
                    if(entryPoint){
                        return router.dispatch(entryPoint);
                    }
                    throw new Error('No entrypoint defined');
                })
                .catch(function(err){
                    self.handleError(err);
                });
        }
    });
});
