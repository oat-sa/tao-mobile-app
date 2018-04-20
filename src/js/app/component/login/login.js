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

    return function loginComponentFactory(container, config) {
        var loginComponent = component({

                submit : function submit(){
                    if(this.is('rendered') && !this.is('loading') && this.validate()){
                        this.trigger('submit', this.getRawValues(), this.getFormValues());
                    }
                    return this;
                },
                validate : function validate(){
                    if(this.is('rendered')){
                        if(!_.isEmpty(this.controls.login.value) &&
                          ! _.isEmpty(this.controls.password.value)) {
                            this.setState('valid', true);
                            return true;
                        }
                    }
                    this.setState('valid', false);
                    return false;
                },

                getRawValues : function getRawValues(){
                    var values = { };
                    if(this.is('rendered') && this.is('valid')){
                        values.login = this.controls.login.value.trim();
                        values.password = this.controls.password.value.trim();
                    }
                    return values;
                },

                getFormValues : function getFormValues(){
                    if(this.is('rendered') && this.is('valid')){
                        return new FormData(this.controls.form);
                    }
                    return null;

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
                    login:    element.querySelector('[name=username]'),
                    password: element.querySelector('[name=password]'),
                    form:     element.querySelector('form')
                };

                this.button = loadingButtonFactory({
                    type : 'info',
                    icon : '',
                    label : __('Login'),
                    terminatedLabel : '',
                    renderTo : element.querySelector('.actions')
                });

                this.controls.login.addEventListener('change',  this.validate.bind(this));
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
