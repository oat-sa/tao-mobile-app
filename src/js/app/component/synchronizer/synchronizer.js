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
 * This component let's you handle the synchronization of
 * multiple resources (the targets).
 *
 * The implementation MUST control the targets through the provided API.
 *
 * @example
 * synchonizerFactory(container)
 *    //listen for start from the button
 *    .on('start', target){
 *       var self = this;
 *       //run the sync
 *       callTheLongSyncForThisTarget(target).then(function(){
 *           //call stop explicitly
 *           self.stop(target);
 *       });
 *
 *    })
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'tpl!app/component/synchronizer/tpl/container',
    'tpl!app/component/synchronizer/tpl/target',
    'css!app/component/synchronizer/css/synchronizer.css'
], function(_, __, component, containerTpl, targetTpl){
    'use strict';

    /**
     * The component base config
     */
    var defaultConfig = {
        startMessage : __('Start synchronization'),
        stopMessage : __('Stop synchronization'),

        //the default targets
        targets : [{
            state : 'ready',
            type   : 'test-taker',
            name   : __('Test Taker')
        }, {
            state : 'disabled',
            type   : 'delivery',
            name   : __('Delivery')
        }],

        //contains the list of available state,
        //and the default message for each of them
        targetStates : {
            disabled : {
                message : __('Target not yet available.')
            },
            ready : {
                message : __('Ready')
            },
            running : {
                message : __('Synchronization in progress, please wait.')
            },
            success : {
                message : __('Synchronization done successfully.')
            },
            error : {
                message : __('An error occurred, please retry later..')
            },
        }
    };

    /**
     * Ensure the given target has the required format
     * @param {Object} target - the target to validate
     * @param {String} target.name - the name to display
     * @param {String} target.type - the resource type
     * @param {String} target.state - the current state
     * @returns {Boolean} true  if valid
     * @throws {TypeError} if any of the property is missing
     */
    var isTargetValid = function isTargetValid(target){
        if(_.isPlainObject(target) && _.isString(target.state) && _.isString(target.type)  && _.isString(target.name)){
            return true;
        }
        throw new TypeError('Incomplete or invalid sync target');
    };

    /**
     * The component factory
     *
     * @param {HTMLElement|jQuery} container - where to append the component
     * @param {Object} [config]
     * @param {String} [config.startMessage] - the message to display to start the sync
     * @param {String} [config.stopMessage] - the message to display to stop the sync
     * @param {Object[]} [config.targets] - define the sync targets
     * @param {Object} [config.states] - the targets possible states and their default message
     * @returns {synchronizerComponent} the component instance
     */
    return function synchronizerFactory(container, config) {

        /**
         * @typedef {Object} synchronizerComponent
         */
        var synchronizer = component({

            /**
             * Exposes the targets
             *
             * @returns {Objet[]} the targets
             */
            getTargets : function getTargets(){
                return this.targets;
            },

            /**
             * Start all the targets, in parallel
             *
             * @returns {synchronizerComponent} chains
             */
            startAll : function startAll(){
                var self = this;
                if(this.is('rendered') && !this.is('started')){

                    this.setState('started', true);
                    this.controls.syncer.textContent = this.config.stopMessage;

                    //call sync for each target
                    _.forEach(this.targets, function(target){
                        self.start(target.type);
                    });
                }
                return this;
            },

            /**
             * Stop all the targets
             * @returns {synchronizerComponent} chains
             */
            stopAll : function stopAll(){
                var self = this;
                if(this.is('rendered') && this.is('started')){

                    this.setState('started', false);
                    this.controls.syncer.textContent = this.config.startMessage;

                    //call sync for each target
                    _.forEach(this.targets, function(target){
                        if(target.state !== 'disabled'){
                            self.setTargetState(target.type, 'ready');
                        }
                    });
                }
                return this;
            },

            /**
             * Start the sync for a given target
             * @param {String} targetType - the target to synchronize
             * @returns {synchronizerComponent} chains
             * @throws {TypeError} if the target is not valid
             * @fires synchronizerComponent#start
             */
            start : function start(targetType){
                var target = _.find(this.targets, { type : targetType });
                if(isTargetValid(target) && target.state !== 'disabled'){

                    this.setTargetState(target.type, 'running');

                    /**
                     * @event synchronizerComponent#start
                     * @param {Object} target - the started target
                     */
                    this.trigger('start', target.type);
                }
                return this;
            },

            /**
             * Stop the sync for a given target
             * @param {String} targetType - the target to synchronize
             * @param {String} [state = 'ready'] - the new target state, becomes ready again by default
             * @param {String} [message] - a custom message
             * @returns {synchronizerComponent} chains
             * @throws {TypeError} if the target is not valid
             * @fires synchronizerComponent#stop
             */
            stop : function stop(targetType, state, message){
                var target = _.find(this.targets, { type : targetType });
                if(isTargetValid(target) && target.state !== 'disabled'){

                    this.setTargetState(target.type, state || 'ready', message);

                    /**
                     * @event synchronizerComponent#stop
                     * @param {Object} target - the stopped target
                     */
                    this.trigger('stop', target.type);
                }
                return this;
            },

            /**
             * Stop a target in 'success' state
             * Alias to stop(target, 'success');
             *
             * @param {String} targetType - the target to synchronize
             * @param {String} [message] - a custom message
             * @returns {synchronizerComponent} chains
             * @throws {TypeError} if the target is not valid
             * @fires synchronizerComponent#stop
             */
            succeed : function succeed(targetType, message){
                return this.stop(targetType, 'success', message);
            },

            /**
             * Stop a target in 'error' state
             * Alias to stop(target, 'error');
             *
             * @param {String} targetType - the target to synchronize
             * @param {Error} [err] - the error causing the failure
             * @returns {synchronizerComponent} chains
             * @throws {TypeError} if the target is not valid
             * @fires synchronizerComponent#stop
             */
            fail : function fail(targetType, err){
                var message;
                if(err && err instanceof Error){
                    message = err.message;
                }
                return this.stop(targetType, 'error', message);
            },

            /**
             * Define the new state for a given target
             * @param {String} targetType - to select the target to update
             * @param {String} state  - the new state
             * @param {String} [message] - set a custom message
             * @returns {Object} the updated target object
             * @throws {TypeError} if the target is not valid or if the state is unknown
             * @fires synchronizerComponent#stop
             */
            setTargetState : function setTargetState(targetType, state, message){
                var targetContainer;
                var targetResult;
                var availableStates;
                var target = _.find(this.targets, { type : targetType });
                if (this.is('rendered') && isTargetValid(target) &&
                    this.controls.targets[target.type] && target.state !== state){

                    targetContainer = this.controls.targets[target.type].container;
                    targetResult    = this.controls.targets[target.type].results;

                    availableStates =  _.keys(this.config.targetStates);

                    if(!_.contains(availableStates, state)){
                        throw new TypeError('Trying to change a sync target state to a non defined state : ' + state);
                    }

                    target.state = state;

                    _.forEach(availableStates, function(aState){
                        targetContainer.classList.remove(aState);
                    });
                    targetContainer.classList.add(state);

                    targetResult.textContent = message || this.config.targetStates[state].message;
                }
                return target;
            }

        }, defaultConfig);

        synchronizer
            .setTemplate(containerTpl)
            .on('init', function(){
                var self = this;

                //config to data
                this.targets = _.cloneDeep(this.config.targets);

                //render each sync target
                this.config.targetContent = _.reduce(this.targets, function(acc, target){
                    var currentState = target.state || 'disabled';
                    acc += targetTpl(_.merge({
                        message : self.config.targetStates[currentState].message
                    }, target));
                    return acc;
                }, '');

                if(container){
                    _.defer(function(){
                        self.render(container);
                    });
                }
            })
            .on('render', function(){
                var self    = this;
                var element = this.getElement()[0];

                //keep a ref to the DOM elements
                this.controls = {

                    // each sync target
                    targets : _.reduce(this.targets, function(acc, target){
                        var targetContainer =  element.querySelector('.sync-target[data-type="' + target.type + '"]');
                        acc[target.type] = {
                            container : targetContainer,
                            results   : targetContainer.querySelector('.sync-result')
                        };
                        return acc;
                    }, {}),

                    //the button
                    syncer: element.querySelector('.syncer'),
                };

                /**
                 * The syncer button start/stop all targets
                 */
                this.controls.syncer.addEventListener('click', function(e){
                    e.preventDefault();

                    if(self.is('started')){
                        self.stopAll();
                    } else {
                        self.startAll();
                    }
                });
            })
            .on('stop', function(){
                var allStopped;

                //if the component is in "started" state but all
                //targets get stopped, we toggle the state and the button
                if(this.is('started')){
                    allStopped = _.all(this.targets, function(target){
                        return target.state !== 'running';
                    });
                    if(allStopped){
                        this.setState('started', false);
                        this.controls.syncer.textContent = this.config.startMessage;
                    }
                }
            });

        _.defer(function(){
            synchronizer.init(config);
        });

        return synchronizer;
    };
});
