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
 * takes care of the application front routing
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'tao/controller/app',
    'app/service/session'
],  function(appController, sessionService){
    'use strict';

    var logger = appController.getLogger();

    /**
     * Role based entrypoints
     */
    var entryPoints = {
        all:         'app/main/login',
        syncManager: 'app/admin/index',
        testTaker:   'app/delivery/index'
    };

    return {

        /**
         * Application main entrypoint,
         * starts the routing
         */
        start: function start(){

            var pageContainer = document.getElementById('page');

            appController
                .getRouter()
                .on('dispatching', function(route){
                    pageContainer.classList.add('page-change');

                    logger.debug('Dispatching route ' + route);
                })
                .on('dispatched', function(route){
                    pageContainer.classList.remove('page-change');

                    pageContainer.innerHTML = '';
                    pageContainer.dataset.page = route;

                    logger.debug('Dispatched route ' + route);
                });

            //the default route is based on the current session, if any
            sessionService
                .getCurrent()
                .then(function(session){
                    var entryPoint = entryPoints.all;
                    if(session && session.user && session.user.role && entryPoints[session.user.role]){
                        entryPoint = entryPoints[session.user.role];
                    }

                    appController.start({
                        forwardTo : entryPoint
                    });
                })
                .catch(function(err){
                    appController.onError(err);
                });
        }
    };
});
