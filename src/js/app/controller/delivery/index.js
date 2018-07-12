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
 * This controller is a placeholder
 * to test the delivery page access.
 *
 * TODO implement me
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/controller/pageController',
    'app/service/session',
    'tpl!app/controller/delivery/layout'
], function(pageController, sessionService, layoutTpl){
    'use strict';

    return pageController({
        start: function start(){
            var self = this;

            sessionService
                .getCurrent()
                .then(function(session){
                    self.getContainer().innerHTML = layoutTpl(session.user);
                })
                .catch(function(err){
                    self.handleError(err);
                });
        }
    });
});
