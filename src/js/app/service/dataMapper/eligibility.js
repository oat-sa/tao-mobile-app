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
 * Map an eligibility from TAO to a tiny eligibility in the app (we keep only the minimum info)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_) {
    'use strict';

    /**
     * Maps the RDF(s) properties to the eligibility object properties
     */
    var mapping = {
        delivery:    'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileDelivery',
        testTakers:  'http://www.tao.lu/Ontologies/TAOProctor.rdf#EligibileTestTaker',
        updatedAt:   'http:\/\/www.tao.lu\/Ontologies\/TAO.rdf#UpdatedAt',
        createdAt:   'http:\/\/www.taotesting.com\/Ontologies\/TAO.rdf#CreatedAt'
    };

    /**
     * The mapper takes an eligibility from the TAO Sync service and map it to a eligibility object
     * @param {Object} inputEligibility
     * @param {String} inputEligibility.id - eligibility unique id
     * @param {Object} inputEligibility.properties - contains the properties to map
     * @returns {Object} the output eligibility
     */
    var mapper = function mapper(inputEligibility) {
        var outputEligibility = null;
        if (_.isPlainObject(inputEligibility) && (inputEligibility.id || inputEligibility.uri) ) {
            outputEligibility = {
                id: inputEligibility.id || inputEligibility.uri,
                checksum : inputEligibility.checksum
            };
            if (_.isPlainObject(inputEligibility.properties)) {
                outputEligibility = _.reduce(mapping, function(acc, propName, key) {
                    if (!_.isUndefined(inputEligibility.properties[propName])) {
                        outputEligibility[key] = inputEligibility.properties[propName];
                    }
                    return acc;
                }, outputEligibility);

                if(_.isString(outputEligibility.testTakers)){
                    outputEligibility.testTakers = [outputEligibility.testTakers];
                }
                if(_.isString(outputEligibility.createdAt)){
                    outputEligibility.createdAt = parseFloat(outputEligibility.createdAt);
                }
                if(_.isString(outputEligibility.updatedAt)){
                    outputEligibility.updatedAt = parseFloat(outputEligibility.updatedAt);
                }
            }
        }
        return outputEligibility;
    };

    /**
     * Exposes the mapping
     * @property {Object} mapping - the property mapping
     */
    mapper.mapping = mapping;

    return mapper;
});
