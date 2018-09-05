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
 * This controller is a placeholder
 * to test the delivery page access.
 *
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/controller/pageController',
    'app/service/session',
    'app/service/assignment',
    'app/component/deliveryLauncher/launcher',
    'tpl!app/controller/delivery/layout'
], function(pageController, sessionService, assignmentService, deliveryLauncherFactory, layoutTpl){
    'use strict';

    return pageController({
        start: function start(){
            var self = this;
            var logger = this.getLogger();

            /**
             * Launch the delivery
             * @param {String} deliveryId
             * @param {String} assemblyPath
             */
            var launchDelivery = function launchDelivery(deliveryId, assemblyPath){
                self.getRouter().dispatch('delivery/runner', {
                    deliveryId : deliveryId,
                    assemblyPath : assemblyPath
                });
            };

            sessionService
                .getCurrent()
                .then(function(session){

                    //TODO handle the layout globally
                    self.getContainer().innerHTML = layoutTpl(session.user);

                    return assignmentService
                        .getTestTakerDeliveries(session.user.id)
                        .then( function(deliveries) {

                            var container =  self.getContainer().querySelector('.tests');

                            deliveryLauncherFactory(container, { deliveries: deliveries })
                                .on('launch', function(id, delivery){

                                    logger.info('User ' + session.user.login + ' launches delivery ' + id);
                                    launchDelivery(id, delivery.assemblyPath);
                                })
                                .on('error', function(err){
                                    self.handleError(err);
                                });
                        });
                })
                .catch(function(err){
                    self.handleError(err);
                });
        }
    });
});
