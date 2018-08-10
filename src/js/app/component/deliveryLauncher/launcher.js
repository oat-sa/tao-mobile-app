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
 * Component that let's you select a delivery to launch it.
 *
 * @example
 * deliveryLauncherFactory(container, {
 *      deliveries : [{
 *         id: 'delivery-1',
 *         label: 'Delivery of Test 1'
 *      }, {
 *         id: 'delivery-2',
 *         label: 'Delivery of Test 2'
 *      })
 * })
 * .on('launch', function(id, delivery){
 *     //proceed with the launch
 * });
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'tpl!app/component/deliveryLauncher/tpl/container',
    'css!app/component/deliveryLauncher/css/launcher.css'
], function(_, __, component, containerTpl){
    'use strict';

    /**
     * The component base config
     */
    var defaultConfig = {
        title : __('Available tests'),
        emptyText : __('No test available'),
        deliveries: []
    };


    /**
     * The component factory
     *
     * @param {HTMLElement} container - where to append the component
     * @param {Object} [config]
     * @param {String} [config.title] - the list title
     * @param {String} [config.emptyText] - the text to display when the delivery list is empty
     * @param {Object[]} [config.deliveries] - the list of available deliveries
     * @param {String} [config.deliveries.id] - each delivery needs to have a unique id
     * @param {String} [config.deliveries.label] - each delivery should have a label to display
     *
     * @returns {deliveryLauncher} the component instance
     */
    return function deliveryLauncherFactory(container, config) {

        /**
         * @typedef {Object} deliveryLauncher
         */
        var deliveryLauncher = component({

            /**
             * Get the delivery list
             * @returns {Object[]} the deliveries
             */
            getDeliveries : function getDeliveries(){
                return this.config.deliveries;
            },

            /**
             * Launch a delivery.
             * Selects the delivery data and trigger an event.
             *
             * @param {String} id - the id of the delivery to launch
             * @returns {Boolean} true if the delivery is launched
             * @fires deliveryLauncher#launch
             */
            launch : function launch(id){
                var delivery;
                if(_.isString(id) && !_.isEmpty(id)){

                    delivery = _.find(this.config.deliveries, { id : id });
                    if(delivery){

                        /**
                         * @event deliveryLauncher#launch
                         * @param {String} id - the delivery id
                         * @param {Object} delivery - the complete delivery object
                         */
                        this.trigger('launch', id, delivery);
                        return true;
                    }
                }
                return false;
            }

        }, defaultConfig);

        deliveryLauncher
            .setTemplate(containerTpl)
            .on('init', function(){
                var self = this;

                if(container){
                    self.render(container);
                }
            })
            .on('render', function(){
                var self    = this;
                var element = this.getElement()[0];

                var launchHandler = function launchHandler(e){
                    e.preventDefault();
                    self.disable();
                    if(!self.launch(e.currentTarget.dataset.id)){
                        self.enable();
                    }
                };

                //keep a ref to the DOM elements
                this.controls = {
                    deliveries : element.querySelectorAll('article > a')
                };

                _.forEach(this.controls.deliveries, function(deliveryElt){
                    deliveryElt.addEventListener('click', launchHandler);
                });
            });

        _.defer(function(){
            deliveryLauncher.init(config);
        });

        return deliveryLauncher;
    };
});
