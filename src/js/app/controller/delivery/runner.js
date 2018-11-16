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
 * Start a test
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/controller/pageController',
    'app/service/session',
    'app/service/deliveryExecution',
    'app/runner/runner',
], function(pageController, sessionService, deliveryExecutionService, appRunnerFactory){
    'use strict';

    /**
     * The runner controller
     */
    return pageController({
        start: function start(){
            var self = this;

            var params = this.getParams();

            var handleError = function handleError(err){

                self.handleError(err);
                setTimeout(function(){
                    self.getRouter().dispatch('delivery/index');
                }, 4000);
            };

            sessionService
                .getCurrent()
                .then(function(session){
                    if(!session || !session.user || session.user.role !== 'testTaker'){
                        throw new Error('Attempt to start a delivery with a user role of ' + session.user.role);
                    }
                    if(!params || !params.deliveryId || !params.assemblyPath){
                        throw new Error('Missing delivery parameters');
                    }

                    return deliveryExecutionService.create(params.deliveryId, session.user.id);
                })
                .then(function(deliveryExecution){

                    return appRunnerFactory(
                            self.getContainer(),
                            params.deliveryId,
                            params.assemblyPath,
                            deliveryExecution.id
                        )
                        .then(function(runner){
                            runner.on('destroy', function(){
                                deliveryExecutionService
                                    .finish(deliveryExecution.id)
                                    .then(function(){
                                        self.getRouter().dispatch('delivery/index');
                                    })
                                    .catch(handleError);
                            });
                        });
                })
                .catch(handleError);
        }
    });
});
