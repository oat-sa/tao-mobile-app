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
 * This component represents the app login form
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'ui/loadingButton/loadingButton',
    'tpl!app/component/login/tpl/login',
    'css!app/component/login/css/login.css'
], function(_, __, component, loadingButtonFactory, loginTpl){
    'use strict';

    /**
     * The component factory
     *
     * @param {HTMLElement|jQuery} container - where to append the component
     * @param {Object} [config]
     * @returns {loginComponent} the component instance
     */
    return function loginComponentFactory(container, config) {

        /**
         * @typedef {Object} loginComponent
         */
        var loginComponent = component({

            /**
             * Submit the values
             * @returns {formComponent} chains
             * @fires formComponent#submit
             */
            submit : function submit(){
                if(this.is('rendered') && !this.is('loading') && this.validate()){
                    /**
                     * Submit the values
                     * @param {Object} values - the form values
                     * @param {String} values.username
                     * @param {String} values.password
                     */
                    this.trigger('submit', this.getRawValues());
                }
                return this;
            },

            /**
             * Check whether the component is in a valid state.
             * For now it check only if the fields are not empty,
             * but that can be improved using special rules.
             * @returns {Boolean} true if the fields are valid
             */
            validate : function validate(){
                if(this.is('rendered')){
                    if(!_.isEmpty(this.controls.username.value) &&
                        ! _.isEmpty(this.controls.password.value)) {
                        this.setState('valid', true);
                        return true;
                    }
                }
                this.setState('valid', false);
                return false;
            },

            /**
             * Get the values
             * @returns {Object} the raw values
             */
            getRawValues : function getRawValues(){
                var values = { };
                if(this.is('rendered') && this.is('valid')){
                    values.username = this.controls.username.value.trim();
                    values.password = this.controls.password.value.trim();
                }
                return values;
            },

            /**
             * Get the values as a FormData, useful to send over xhr
             * @returns {FormData} the values
             */
            getFormValues : function getFormValues(){
                if(this.is('rendered') && this.is('valid')){
                    return new FormData(this.controls.form);
                }
                return null;
            },

            /**
             * Reset the form the values
             * @returns {formComponent} chains
             * @fires formComponent#reset
             */
            reset : function reset(){
                if(this.is('rendered')){
                    this.controls.username.value = '';
                    this.controls.password.value = '';
                    this.button.terminate().reset();

                    this.setState('valid', false)
                        .setState('loading', false);

                    /**
                     * @event formComponent#reset
                     */
                    this.trigger('reset');
                }
                return this;
            }
        }, {});

        loginComponent
            .setTemplate(loginTpl)
            .on('init', function(){

                if(container){
                    this.render(container);
                }
            })
            .on('render', function(){
                var self    = this;

                var element = this.getElement()[0];

                this.controls = {
                    username:    element.querySelector('[name=username]'),
                    password: element.querySelector('[name=password]'),
                    form:     element.querySelector('form')
                };

                //use a loading button component for it's loading effect
                this.button = loadingButtonFactory({
                    type : 'info',
                    icon : '',
                    label : __('Login'),
                    terminatedLabel : '',
                    renderTo : element.querySelector('.actions')
                });

                this.controls.username.addEventListener('change',  this.validate.bind(this));
                this.controls.password.addEventListener('change', this.validate.bind(this));

                this.controls.form.addEventListener('submit', function(e){
                    e.preventDefault();
                    self.submit();
                    return false;
                });
                this.button.getElement()
                    .off('click')
                    .on('click', function(e){
                        e.preventDefault();
                        self.submit();
                    });

            })
            .on('loading', function(){
                this.button.start();
                this.setState('loading', true);
            })
            .on('loaded', function(){
                this.button.terminate().reset();
                this.setState('loading', false);
            });

        setTimeout(function(){
            loginComponent.init(config);
        }, 1);

        return  loginComponent;
    };
});
