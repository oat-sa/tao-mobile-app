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
 * Map a delivery from TAO to a tiny delivery in the app (we keep only the minimum info)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_) {
    'use strict';

    /**
     * Maps the RDF(s) properties to the delivery object properties
     */
    var mapping = {
        label:     'http://www.w3.org/2000/01/rdf-schema#label',
        updatedAt: 'http://www.tao.lu/Ontologies/TAO.rdf#UpdatedAt',
        createdAt: 'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt'
    };

    /**
     * The mapper takes an delivery from the TAO Sync service and map it to a delivery object
     * @param {Object} inputDelivery
     * @param {String} inputDelivery.id - delivery unique id
     * @param {Object} inputDelivery.properties - contains the properties to map
     * @returns {Object} the output delivery
     */
    var mapper = function mapper(inputDelivery) {
        var outputDelivery = null;
        if (_.isPlainObject(inputDelivery) && (inputDelivery.id || inputDelivery.uri) ) {
            outputDelivery = {
                id: inputDelivery.id || inputDelivery.uri,
                checksum : inputDelivery.checksum
            };
            if (_.isPlainObject(inputDelivery.properties)) {
                outputDelivery = _.reduce(mapping, function(acc, propName, key) {
                    if (!_.isUndefined(inputDelivery.properties[propName])) {
                        outputDelivery[key] = inputDelivery.properties[propName];
                    }
                    return acc;
                }, outputDelivery);

                if(_.isString(outputDelivery.createdAt)){
                    outputDelivery.createdAt = parseFloat(outputDelivery.createdAt);
                }
                if(_.isString(outputDelivery.updatedAt)){
                    outputDelivery.updatedAt = parseFloat(outputDelivery.updatedAt);
                }
            }
        }
        return outputDelivery;
    };

    /**
     * Exposes the mapping
     * @property {Object} mapping - the property mapping
     */
    mapper.mapping = mapping;

    return mapper;
});
