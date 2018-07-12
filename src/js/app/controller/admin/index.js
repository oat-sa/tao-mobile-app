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
    'i18n',
    'ui/feedback',
    'app/controller/pageController',
    'app/service/session',
    'app/component/synchronizer/synchronizer',
    'app/component/wipeout/wipeout',
    'app/service/synchronization/synchronizer',
    'app/service/synchronization/provider/testTaker',
    'app/service/user',
    'tpl!app/controller/admin/layout'
], function(
    __,
    feedback,
    pageController,
    sessionService,
    syncComponentFactory,
    wipeoutFactory,
    syncServiceFactory,
    testTakerSyncProvider,
    userService,
    layoutTpl
){
    'use strict';

    syncServiceFactory.registerProvider(testTakerSyncProvider.name, testTakerSyncProvider);

    return pageController({
        start: function start(){
            var self = this;
            var logger = this.getLogger();
            sessionService.getCurrent().then(function(session){
                var syncComponent;
                var wipeout;

                var oauthConfig = {
                    key : session.user.oauthInfo.key,
                    secret : session.user.oauthInfo.secret
                };

                //TODO handle the layout globally
                self.getContainer().innerHTML = layoutTpl(session.user);

                syncComponent = syncComponentFactory(self.getContainer().querySelector('.sync-container'))
                    .on('start', function(targetType){

                        syncServiceFactory(targetType, oauthConfig)
                            .start()
                            .then(function(results){
                                var message = [];

                                if(results){
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
                    });

                wipeout = wipeoutFactory(self.getContainer().querySelector('.danger-zone'), {
                    confirmMessage : __('This action will remove all data, including your user profile. Once done, you will have to login again. Please confirm the wipeout.')
                }).on('wipeout', function(){

                    logger.info('User ' + session.user.login + ' ask to wipeout the app data');

                    userService
                        .removeAll()
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
