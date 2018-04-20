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
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'module',
    'core/store'
], function($, module, store){
    'use strict';

    var config = module.config();

    return {

        getCurrentSession : function getCurrentSession(){
            return false;
        },

        login : function login(username, password){
            return new Promise(function(resolve, reject) {

                if(!config.endpoint){
                    return reject(new Error('No endpoint configured'));
                }

                $.ajax({
                    url: config.endpoint + '/tao/Main/login',
                    method: 'POST',
                    crossDomain: true,
                    headers:{
                        "Content-Type":'application/x-www-form-urlencoded'
                    },
                    cache:false,
                    data : {
                        login : username,
                        password : password,
                        'loginForm_sent' : 1
                    }
                })
                .done(function(response, status, xhr){
                    if (xhr.status === 200 || xhr.status === 302){
                        return resolve(true);
                    }
                    return resolve(false);
                })
                .fail(function(xhr){
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
            });
        },

        logout : function logout(){

        }

    };
});
