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
    'app/service/session',
    'app/service/login',
], function(__, feedback, loginComponentFactory, pageController, sessionService, loginService) {
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

                //the login service takes care if the multi stage auth
                loginService(data.username, data.password)
                    .then(function(session){
                        loginComponent.trigger('loaded');
                        if(session && session.user){

                            //logged in => redirect to the role entryPoint
                            return sessionService.getEntryPoint()
                                .then(function(entryPoint){
                                    return self.getRouter().dispatch(entryPoint);
                                });
                        }
                        loginComponent.loginError();
                    })
                    .catch( function(err){
                        loginComponent.reset();
                        self.handleError(err);
                    });
            });
        }
    });
});
