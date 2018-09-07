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
 * Map a user from TAO to a a tiny user from the app (we keep only the minimum info)
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(_) {
    'use strict';

    /**
     * Maps the RDF(s) properties to the user object properties
     */
    var mapping = {
        username:      'http://www.tao.lu/Ontologies/generis.rdf#login',
        password:      'http://www.tao.lu/Ontologies/generis.rdf#password',
        firstname:     'http://www.tao.lu/Ontologies/generis.rdf#userFirstName',
        lastname:      'http://www.tao.lu/Ontologies/generis.rdf#userLastName',
        email:         'http://www.tao.lu/Ontologies/generis.rdf#userMail',
        originalRoles: 'http://www.tao.lu/Ontologies/generis.rdf#userRoles',
        updatedAt:     'http://www.tao.lu/Ontologies/TAO.rdf#UpdatedAt',
        createdAt:     'http://www.taotesting.com/Ontologies/TAO.rdf#CreatedAt',
        assignment:    'http://www.tao.lu/Ontologies/TAOTestCenter#UserAssignment',
        organisationId:'http://www.taotesting.com/ontologies/synchro.rdf#organisationId'
    };

    /**
     * Map TAO roles to app roles
     */
    var interestingRoles = {
        syncManager : 'http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager',
        testTaker   : 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole'
    };

    /**
     * The mapper takes a user from the TAO Sync service and map it to a user object
     * @param {Object} inputUser
     * @param {String} inputUser.id - user unique id
     * @param {Object} inputUser.properties - contains the properties to map
     * @returns {Object} the output user
     */
    var mapper = function mapper(inputUser) {
        var outputUser = null;
        if (_.isPlainObject(inputUser) && (inputUser.id || inputUser.uri) ) {
            outputUser = {
                id: inputUser.id || inputUser.uri,
                checksum : inputUser.checksum
            };
            if (_.isPlainObject(inputUser.properties)) {
                outputUser = _.reduce(mapping, function(acc, propName, key) {
                    if (!_.isUndefined(inputUser.properties[propName])) {
                        outputUser[key] = inputUser.properties[propName];
                    }
                    return acc;
                }, outputUser);

                if(_.isString(outputUser.originalRoles)){
                    outputUser.originalRoles = [outputUser.originalRoles];
                }

                if(outputUser.originalRoles && outputUser.originalRoles.length){
                    _.forEach(interestingRoles, function(uri, role){
                        if(_.contains(outputUser.originalRoles, uri)){
                            outputUser.role = role;
                            return false;
                        }
                    });
                }
                if(_.isString(outputUser.createdAt)){
                    outputUser.createdAt = parseFloat(outputUser.createdAt);
                }
                if(_.isString(outputUser.updatedAt)){
                    outputUser.updatedAt = parseFloat(outputUser.updatedAt);
                }
            }
        }
        return outputUser;
    };

    /**
     * Exposes the mapping
     * @property {Object} mapping - the property mapping
     */
    mapper.mapping = mapping;

    return mapper;
});
