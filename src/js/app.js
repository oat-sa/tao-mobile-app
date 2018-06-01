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
    'app/controller/pageController',
    'app/service/session'
],  function($, pageController, sessionService){
    'use strict';

    /**
     * Role based entrypoints
     */
    var entryPoints = {
        all:         'main/login',
        syncManager: 'admin/index'
    };

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
            this.getRouter()
                .on('dispatching', function(){
                    pageContainer.classList.add('page-change');
                })
                .on('dispatched', function(route){
                    pageContainer.classList.remove('page-change');

                    pageContainer.innerHTML = '';
                    pageContainer.dataset.page = route;
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
            sessionService
                .getCurrent()
                .then(function(session){
                    var entryPoint = entryPoints.all;
                    if(session && session.user && session.user.role && entryPoints[session.user.role]){
                        entryPoint = entryPoints[session.user.role];
                    }

                    router.dispatch(entryPoint);
                })
                .catch(function(err){
                    self.handleError(err);
                });
        }
    });
});
