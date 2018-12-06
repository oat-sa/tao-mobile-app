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
 * Admin controller, let's you synchronize data.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/feedback',
    'core/store',
    'app/controller/pageController',
    'app/service/session',
    'app/component/synchronizer/synchronizer',
    'app/component/wipeout/wipeout',
    'app/component/header/header',
    'app/service/synchronization/loader',
    'app/service/deliveryExecution',
    'app/service/deliveryAssembly'
], function(
    _,
    __,
    feedback,
    store,
    pageController,
    sessionService,
    syncComponentFactory,
    wipeoutFactory,
    headerComponentFactory,
    synchronizerFactory,
    deliveryExecutionService,
    deliveryAssemblyService
){
    'use strict';

    var targets = [{
        type : 'test-taker',
        name : __('Test takers'),
        state: 'ready',
        direction : 'fetch'
    }, {
        type : 'delivery',
        name : __('Deliveries'),
        state: 'ready',
        direction : 'fetch'
    }, {
        type : 'eligibility',
        name : __('Eligibilities'),
        state: 'ready',
        direction : 'fetch'
    }, {
        type : 'results',
        name : __('Results'),
        state: 'ready',
        direction: 'send'
    }];

    /**
     * Get the wipeout message based on the number of results left to synchronize
     * @returns {Promise<String>} resolves with the message
     */
    var getWipeoutMessage = function getWipeoutMessage(){
        return deliveryExecutionService.getAllToSync()
            .then(function(remainingExecutions){
                var message = '';
                if(remainingExecutions.length > 0) {
                    message = __('%d result set left on the device. You need to cancel this action and synchronize the device, otherwise results will be lost. Proceed with the wipeout anyway ?', remainingExecutions.length );
                } else {

                    message =  __('This action will remove all data stored on the device. Once done, you will have to login again. Please confirm the wipeout.');

                }

                return message;
            });
    };

    return pageController({
        start: function start(){
            var self = this;
            var logger = this.getLogger();

            sessionService.getCurrent().then(function(session){
                var syncComponent;
                var wipeout;
                var synchronizers;

                var syncConfig = {
                    key :    session.user.oauthInfo.key,
                    secret : session.user.oauthInfo.secret
                };

                if(session.user.organisationId){
                    syncConfig.organisationId = session.user.organisationId;
                }

                synchronizers = _.reduce(targets, function(acc, target){
                    acc[target.type] = synchronizerFactory(target.type, syncConfig);
                    return acc;
                }, {});


                //TODO handle the layout globally
                headerComponentFactory(self.getContainer(), {
                    title : __('Admin'),
                    user  : session.user
                })
                .on('error', function(err){
                    self.handleError(err);
                });

                //instantiate the sync component
                syncComponent = syncComponentFactory(
                    self.getContainer(),
                    { targets : targets }
                )
                .on('start', function(targetType){
                    if(synchronizers[targetType]) {

                        logger.info('User ' + session.user.username + ' starts to sync ' + targetType);

                        synchronizers[targetType]
                            .start()
                            .then(function(results){
                                var message = [];

                                if(results){
                                    if (results.send && results.send.length){
                                        message.push( __('%d sent', results.send.length));
                                    }
                                    if (results.remove && results.remove.length){
                                        message.push( __('%d removed', results.remove.length));
                                    }
                                    if (results.update && results.update.length){
                                        message.push( __('%d updated', results.update.length));
                                    }
                                    if (results.add && results.add.length){
                                        message.push(__('%d added', results.add.length));
                                    }
                                    if(message.length === 0){
                                        message.push( __('Already up to date'));
                                    }
                                }
                                syncComponent.succeed(targetType, message.join(', '));
                            })
                            .catch(function(err){
                                syncComponent.fail(targetType, err);
                                self.handleError(err);
                            });
                    }
                })
                .on('stop', function(targetType){
                    if(synchronizers[targetType]) {

                        logger.info('User ' + session.user.username + ' stops to sync ' + targetType);

                        synchronizers[targetType].stop();
                    }
                });


                wipeout = wipeoutFactory(self.getContainer(), {
                    confirmMessage : getWipeoutMessage
                }).on('wipeout', function(){
                    logger.info('User ' + session.user.login + ' ask to wipeout the app data');

                    Promise.all([
                        store.removeAll(),
                        deliveryAssemblyService.removeAll()
                    ])
                    .then(function(){

                        logger.info('Data wipeout');

                        //inform the user and log out
                        feedback().success(__('The application data has been removed'));
                        setTimeout(function(){
                            self.getRouter().dispatch('main/logout');
                        }, 3000);
                    })
                    .catch(function(err){
                        wipeout.reset();
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
