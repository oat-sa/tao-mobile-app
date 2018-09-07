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
 * Mock  of app/service/synchronization/client
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function(){
    'use strict';

    return function requestMockFactory(){

        return function requestMock(config){
            if(config && config.queryString &&
                config.queryString.client_id === 'foo' &&
                config.queryString.client_secret === 'bar') {

                return Promise.resolve({
                    success: true,
                    data : {
                        access_token: 'xeeXO0tqLFca097e1d6f2f0987d45b8ba13994692248bcba31f4edf2233483e4a84818ee45',
                        expires: Date.now() + (1000 * 60 * 60)
                    }
                });
            }
            return Promise.resolve({
                success: false,
                errorCode: 403,
                errorMessage: 'unauthorized'
            });
        };
    };
});
