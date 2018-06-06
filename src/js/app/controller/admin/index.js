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
 * to test the admin page access.
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'app/controller/pageController',
    'app/service/session',
    'app/service/synchronization/testTaker',
    'tpl!app/controller/admin/layout'
], function(pageController, sessionService, testTakerSyncService, layoutTpl){
    'use strict';

    return pageController({
        start: function start(){
            var self = this;

            sessionService
                .getCurrent()
                .then(function(session){
                    self.getContainer().innerHTML = layoutTpl(session.user);

                    document.querySelector('.syncer').addEventListener('click', function(e){
                        e.preventDefault();
                        testTakerSyncService({
                            key : session.user.oauthInfo.key,
                            secret : session.user.oauthInfo.secret
                        })
                        .then(function(results){
                            document.querySelector('.sync-results').innerHTML = JSON.stringify(results, null, ' ');
                        })
                        .catch(function(err){
                            self.handleError(err);
                        });
                    });
                })
                .catch(function(err){
                    self.handleError(err);
                });
        }
    });
});
