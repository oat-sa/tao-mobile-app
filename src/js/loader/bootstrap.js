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
 * Copyright (c) 2016-2018 (original work) Open Assessment Technologies SA ;
 */

/**
 * Adaptation of tao-core's bootstrap
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
(function(){
    'use strict';

    var started           = false;
    var controllerOptions = {};
    var loaderScript      = document.getElementById('amd-loader');
    var controllerPath    = loaderScript.getAttribute('data-controller');
    var params            = loaderScript.getAttribute('data-params');
    try{
        controllerOptions = JSON.parse(params);
    } catch(err){
        controllerOptions = {};
    }

    requirejs([controllerPath], function(controller) {
        var startController = function startController(){
            if(!started){
                started = true;
                controller.start(controllerOptions);
            }
        };
        document.addEventListener('readystatechange', startController, false);
        document.addEventListener('deviceready', startController, false);
        if (document.readyState === 'complete') {
            startController();
        }
    });
})();
