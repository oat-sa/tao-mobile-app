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
    'app/component/login/login',
    'app/controller/pageController',
    'app/service/authentication',
    'app/service/session',
    'app/service/user',
], function(__, feedback, loginComponentFactory, pageController, authenticationService, sessionService, userService) {
    'use strict';

    return pageController({

        /**
         * Controller entrypoint
         */
        start: function start(){
            var self = this;

            //instantiate the component
            var loginComponent = loginComponentFactory(this.getContainer());

            loginComponent.on('submit', function(data){
                loginComponent.trigger('loading');

                //call the authentication service,
                //uses the remote SyncManager endpoints only, for now
                //
                //TODO implement fallback to local db for already saved user and test taker
                //
                authenticationService
                    .authenticate(authenticationService.adapters.syncManager, data)
                    .then(function(result){
                        loginComponent.trigger('loaded');

                        if(result && result.success && result.data && result.data.user){
                            return result.data.user;
                        }
                        return false;
                    })
                    .then(function(user){
                        if(!user){
                            loginComponent.loginError();
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
                        if(results && results.length === 2 && results[0]){
                            return self.getRouter().dispatch('admin/index');
                        }
                    })
                    .catch( function(err){
                        loginComponent.reset();
                        self.handleError(err);
                    });
            });
        }
    });
});
