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
 * Authentication adapter against the sync manager endpoint.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n'
], function($, _, __){
    'use strict';

    return {

        name : 'syncManager',

        authenticate : function authenticate(config, values){
            return new Promise(function(resolve, reject){
                if(!config.endpoint){
                    return reject(new Error('The endpoint is not configured correctly'));
                }
                if(_.isEmpty(values.username) || _.isEmpty(values.password)){
                    return resolve({
                        success: false,
                        message :  __('Missing username or password')
                    });
                }

                $.ajax({
                    url: config.endpoint,
                    type: 'POST',
                    dataType: 'json',
                    contentType: 'application/json',
                    username: values.username,
                    password : values.password,
                    data : JSON.stringify({
                        login : values.username
                    })
                })
                .done(function(response, status, xhr){
                    if (xhr.status === 200 || xhr.status === 302){
                        return resolve({
                            success : true,
                            data    : {
                                user : {
                                    id : response.syncUser.id,
                                    username : response.syncUser.properties['http://www.tao.lu/Ontologies/generis.rdf#login'],
                                    role : response.syncUser.properties['http://www.tao.lu/Ontologies/generis.rdf#userRoles']
                                }
                            }
                        });
                    }
                    return resolve({
                        success : false,
                        message : 'Invalid credentials, please try again'
                    });
                })
                .fail(function(xhr){
                    if(xhr.status === 401 || xhr.status === 403){
                        return resolve({
                            success : false,
                            message : 'Invalid credentials, please try again'
                        });
                    }
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
            });
        }
    };
});
