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
    'i18n',
    'app/controller/pageController',
    'app/service/session',
    'app/service/assignment',
    'app/component/deliveryLauncher/launcher',
    'app/component/header/header',
], function(__, pageController, sessionService, assignmentService, deliveryLauncherFactory, headerComponentFactory){
    'use strict';

    return pageController({
        start: function start(){
            var self = this;
            var logger = this.getLogger();

            /**
             * Launch the delivery
             * @param {Object} delivery
             */
            var launchDelivery = function launchDelivery(delivery){
                self.getRouter().dispatch('delivery/runner', {
                    delivery : delivery
                });
            };

            sessionService
                .getCurrent()
                .then(function(session){

                    headerComponentFactory(self.getContainer(), {
                        title : __('My tests'),
                        user  : session.user
                    })
                    .on('error', function(err){
                        self.handleError(err);
                    });

                    return assignmentService
                        .getTestTakerDeliveries(session.user.id)
                        .then( function(deliveries) {

                            deliveryLauncherFactory(self.getContainer(), { deliveries: deliveries })
                                .on('launch', function(id, delivery){

                                    logger.info('User ' + session.user.id + ' launches delivery ' + id);
                                    launchDelivery(delivery);
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
