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
 * Manage URIs
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['lib/uuid'], function(uuid) {
    'use strict';

    return {

        /**
         * Creates a brand new, unique and device related URI
         * @param {String} [ontology = 'taoApp.rdf'
         * @returns {String} the URI
         */
        create : function create(ontology){

            var deviceId = window.device.uuid || 'dev';

            ontology = ontology ||'taoApp.rdf';


            return 'http://app.taocloud.org/' +  deviceId + '/' + ontology + '#i' + uuid();
        }
    };
});
