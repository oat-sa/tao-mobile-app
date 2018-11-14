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
 *
 * This component represents the app header
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'tpl!app/component/header/tpl/header',
    'css!app/component/header/css/header.css'
], function(_, __, component, headerTpl){
    'use strict';

    var defaultConfig = {
        title : '',
        actions : [{
            title : __('Logout'),
            route : 'main/logout',
            icon  : 'logout'
        }]
    };

    /**
     * The component factory
     *
     * @param {HTMLElement|jQuery} container - where to append the component
     * @param {Object} [config]
     * @returns {headerComponent} the component instance
     */
    return function headerComponentFactory(container, config) {

        /**
         * @typedef {Object} headerComponent
         */
        var headerComponent = component({

        }, defaultConfig);

        headerComponent
            .setTemplate(headerTpl)
            .on('init', function(){
                var self = this;
                if(container){
                    setTimeout(function(){
                        self.render(container);
                    }, 0);
                }
            });

        setTimeout(function(){
            headerComponent.init(config);
        }, 0);

        return  headerComponent;
    };
});
