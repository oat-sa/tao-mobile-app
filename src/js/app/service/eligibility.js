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
 * Service that manages eligibilies.
 * an eligilibitly contains the link between a delivey,
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/storeService',
], function(_, storeServiceFactory){
    'use strict';

    var eligibilityStoreName = 'eligibility';

    /**
     * Definition of a minimal eligibility as seen by the service
     * @typedef {Object} eligibility
     * @param {String} id - the eligibility unique identifier
     * @param {String} delivery - the eligible delivery
     * @param {String[]} testTakers - the eligible test takers
     */

    /**
     * Validates a eligibility object
     * @param {eligibility} eligibility
     * @returns {Boolean} true if valid
     * @throws {TypeError} when the eligibility doesn't match the expectations
     */
    var validateEligibility = function validateEligibility(eligibility){
        if(!_.isPlainObject(eligibility)){
            throw new TypeError('Missing or invalid eligibility');
        }
        if(_.isEmpty(eligibility.id)){
            throw new TypeError('An eligibility needs to have a property id');
        }
        if(_.isEmpty(eligibility.delivery)){
            throw new TypeError('An eligibility needs to have a property delivery');
        }
        //if(!_.isArray(eligibility.testTakers)){
            //throw new TypeError('An eligibility needs to have a property testTakers');
        //}
        return true;
    };

    /**
     * @typedef {Object} eligibilityService
     */
    return storeServiceFactory('eligibility', 'eligibility', validateEligibility);
});

