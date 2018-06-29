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
 * This component creates a danger button to wipeout the data app
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'ui/dialog/confirm',
    'tpl!app/component/wipeout/tpl/wipeout',
    'css!app/component/wipeout/css/wipeout.css'
], function(_, __, component, confirmDialog, wipeoutTpl){
    'use strict';

    var defaultConfig = {
        description : __('Remove all device data'),
        buttonLabel : __('Wipe out'),
        confirmMessage : __('This action will remove all data. Are your sure ?')
    };

    /**
     * The component factory
     *
     * @param {HTMLElement|jQuery} container - where to append the component
     * @param {Object} [config]
     * @returns {wipeoutComponent} the component instance
     */
    return function wipeoutComponentFactory(container, config) {

        /**
         * @typedef {Object} wipeoutComponent
         */
        var wipeoutComponent = component({

            /**
             * Submit the values
             * @returns {formComponent} chains
             * @fires wipeoutComponent#wipeout
             * @fires wipeoutComponent#cancel
             */
            apply : function apply(){
                var self = this;
                if(this.is('rendered') && !this.is('waiting')){

                    this.setState('waiting', true);

                    confirmDialog(this.config.confirmMessage, function accept(){

                        /**
                         * The wipeout has bee confirmed
                         * @event wipeoutComponent#wipeout
                         */
                        self.trigger('wipeout');

                        //please note we don't reset automatically
                        //and let it to the implementor in case
                        //of long running operation

                    }, function cancel(){
                        /**
                         * The wipeout has bee canceled
                         * @event wipeoutComponent#cancel
                         */
                        self.trigger('cancel');

                        self.reset();
                    });
                }
                return this;
            },

            /**
             * Reset the component
             * @returns {formComponent} chains
             * @fires wipeoutComponent#reset
             */
            reset : function reset(){
                if(this.is('rendered') && this.is('waiting')){

                    this.setState('waiting', false);

                    /**
                     * @event wipeoutComponent#reset
                     */
                    this.trigger('reset');
                }
                return this;
            }


        }, defaultConfig);

        wipeoutComponent
            .setTemplate(wipeoutTpl)
            .on('init', function(){
                var self = this;
                if(container){
                    setTimeout(function(){
                        self.render(container);
                    }, 0);
                }
            })
            .on('render', function(){
                var self    = this;

                var element = this.getElement()[0];
                this.controls = {
                    button : element.querySelector('button')
                };

                this.controls.button.addEventListener('click', function(e){
                    e.preventDefault();
                    self.apply();
                });
            });

        setTimeout(function(){
            wipeoutComponent.init(config);
        }, 0);

        return  wipeoutComponent;
    };
});