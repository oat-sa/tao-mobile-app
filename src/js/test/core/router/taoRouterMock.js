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
 * Mock the tao router
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function(){
    'use strict';

    return {
        dispatch : function dispatch(route){
            return new Promise(function(resolve, reject){
                if(route === 'app/test/index'){
                    return setTimeout(resolve, 10);
                }
                if(route === 'app/test/timeout'){
                    return setTimeout(resolve, 1000);
                }
                return setTimeout(reject, 10);
            });
        }
    };
});

