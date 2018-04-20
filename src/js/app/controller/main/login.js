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
    'app/service/authentication'
], function(__, feedback, appController, loginComponentFactory, authenticationService){
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

                    //call the authentication service
                    authenticationService
                        .login(data.username, data.password)
                        .then(function(result){
                            self.trigger('loaded');
                            if(result && result.success && result.user && result.user.id){

                                return authenticationService
                                    .createSession(result.user)
                                    .then( function(){
                                        appController.getRouter().dispatch('app/admin/index');
                                    });

                            }
                            self.reset();
                            feedback().error(__('Invalid login or password. Please try again.'));
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
