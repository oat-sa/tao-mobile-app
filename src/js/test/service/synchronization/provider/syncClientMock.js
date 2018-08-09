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

    function mockFactory(){
        return {
            getEntityIds : function getEntityIds(){
                return Promise.resolve(mockFactory.entityIds);
            },
            getEntitiesContent : function getEntitiesContent() {
                return Promise.resolve(mockFactory.entitiesContent);
            },
            downloadDeliveryAssembly : function downloadDeliveryAssembly(){
                return Promise.resolve(true);
            }
        };
    }

    //the expectation are attached to the function
    mockFactory.entityIds = {};
    mockFactory.entitiesContent = {};

    return mockFactory;
});
