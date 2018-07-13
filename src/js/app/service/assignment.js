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
 * Service that manages users.
 *
 * The full users are stored in the "user" store, indexed by id.
 *
 * We store also the user's authentication data, in the "userAuth" store, indexed by username.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/service/user',
    'app/service/eligibility',
    'app/service/delivery',
], function(_, userService, eligibilityService, deliveryService){
    'use strict';

    /**
     * @typedef {Object} assignmentService
     */
    return {

        /**
         * Get the list of deliveries a test taker is assigned to
         *
         * @param {String} testTakerId - the test taker identifier
         * @returns {Promise<delivery[]>} resolves with list of deliveries
         */
        getTestTakerDeliveries : function getTestTakerDeliveries(testTakerId){
            if(_.isEmpty(testTakerId)){
                return Promise.resolve(null);
            }

            return userService.getById(testTakerId)
                .then(function(testTaker){
                    return testTaker && testTaker.assignment;
                })
                .then(function(assignment){
                    return Promise.all(
                        _.map( assignment , function(eligibilityId) {
                            return eligibilityService.getById(eligibilityId);
                        })
                    );
                })
                .then(function(eligibilities){
                    return Promise.all(
                        _(eligibilities)
                            .uniq('delivery')
                            .filter(function(eligibility){
                                //check the test taker is also set in the eligibility
                                return eligibility.testTakers &&
                                    _.contains(eligibility.testTakers, testTakerId) &&
                                    eligibility.delivery;
                            })
                            .map(function(eligibility) {
                                return deliveryService.getById(eligibility.delivery);
                            })
                            .value()
                    );
                })
                .then(function(results){
                    return _.compact(results);
                });
        }
    };
});

