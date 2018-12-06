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
 * Mock  of app/service/deliveryExection
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function(){
    'use strict';

    return {
        executions : {},
        states : {
            finished : 'finished'
        },
        getAllToSync: function getAllToSync(){
            var key;
            var executions = {};
            for(key in this.executions){
                if(!this.executions[key].synchronized){
                    executions[key] = this.executions[key];
                }
            }
            return Promise.resolve(executions);
        },
        getById: function getAllById(id){
            return Promise.resolve(this.executions[id]);
        },
        getAll: function getAll(){
            return Promise.resolve(this.executions);
        },
        set : function set(){
            return Promise.resolve(true);
        },
        update : function update(){
            return Promise.resolve(true);
        },
        remove : function remove(){
            return Promise.resolve(true);
        }
    };
});
