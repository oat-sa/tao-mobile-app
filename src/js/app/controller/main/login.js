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
 * The login controller manages the authentication
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'i18n',
    'ui/feedback',
    'tao/controller/app',
    'app/component/login/login',
    'app/service/authentication',
    'app/service/session',
    'app/service/user',
], function(__, feedback, appController, loginComponentFactory, authenticationService, sessionService, userService) {
    'use strict';

    return {

        /**
         * Controller entrypoint
         */
        start: function start(){

            //instantiate the component
            loginComponentFactory(document.getElementById('page'))
                .on('submit', function(data){
                    var self  = this;
                    this.trigger('loading');

                    //call the authentication service,
                    //uses the remote SyncManager endpoints only, for now
                    //
                    //TODO implement fallback to local db for already saved user and test taker
                    //
                    authenticationService
                        .authenticate(authenticationService.adapters.syncManager, data)
                        .then(function(result){
                            self.trigger('loaded');

                            if(result && result.success && result.data && result.data.user){
                                return result.data.user;
                            }
                            return false;
                        })
                        .then(function(user){
                            if(!user){
                                self.reset();
                                feedback().error(__('Invalid login or password. Please try again.'));
                                return;
                            }

                            //create the current session
                            //and save the user in database
                            return Promise.all([
                                sessionService.create(user),
                                userService.set(user)
                            ]);
                        })
                        .then(function(results){
                            //we check if at least the session is created
                            if(results.length === 2 && results[0]){
                                return appController.getRouter().dispatch('app/admin/index');
                            }
                        })
                        .catch( function(err){
                            self.trigger('loaded');
                            self.reset();
                            appController.onError(err);
                        });
                });
        }
    };
});
