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
    'app/controller/pageController',
    'app/service/session',
    'app/component/synchronizer/synchronizer',
    'app/service/synchronization/testTaker',
    'tpl!app/controller/admin/layout'
], function(__, pageController, sessionService, synchronizerFactory, testTakerSyncService, layoutTpl){
    'use strict';

    return pageController({
        start: function start(){
            var self = this;
            sessionService.getCurrent().then(function(session){
                var synchronizer;
                var syncContainer;

                //TODO handle the layout globally
                self.getContainer().innerHTML = layoutTpl(session.user);

                syncContainer = self.getContainer().querySelector('.content-container');

                synchronizer = synchronizerFactory(syncContainer)
                    .on('start', function(targetType){

                        //TODO implement other targets than test taker
                        if(targetType === 'test-taker'){

                            testTakerSyncService({
                                key : session.user.oauthInfo.key,
                                secret : session.user.oauthInfo.secret
                            })
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
                                synchronizer.succeed(targetType, message.join(', '));
                            })
                            .catch(function(err){
                                synchronizer.fail(targetType, err);
                                self.handleError(err);
                            });
                        }
                    });
            })
            .catch(function(err){
                self.handleError(err);
            });
        }
    });
});
