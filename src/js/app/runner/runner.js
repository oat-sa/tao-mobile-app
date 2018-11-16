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
 * Test runner component
 *
 * Configure and load a test runner in a container.
 *
 * This is a rough test runner, pre-configured and it doesn't
 * support any dynamic configuration :
 * - Plugins, providers and runtime are all already bundled.
 * - The providers are defined manually.
 * - The plugin list comes from a JSON file.
 * - The theme is set here in the dependency.
 * - The proxy reads the data from the filesystem and save state to the store.
 * - Only offline features are supported
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'core/logger',
    'taoTests/runner/runnerComponent',
    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',
    'app/runner/proxy',
    'json!app/runner/plugins.json',
    'css!taoQtiTestCss/new-test-runner',
    'css!taoQtiItemCss/qti-runner.css',
    'css!app/runner/css/theme.css'
], function(loggerFactory, runnerComponentFactory, runnerFactory, qtiRunnerProvider, proxyFactory, appProxyProvider, plugins){
    'use strict';

    var logger = loggerFactory('runner');

    /**
     * Configure and instantiate the test runner
     * @param {HTMLElement} container - where to append the runner
     * @param {String} deliveryId
     * @param {String} assemblyPath
     */
    return function appRunnerFactory(container, deliveryId, assemblyPath, deliveryExecutionId){

        var testConfig = {
            testDefinition: deliveryId,
            testCompilation: assemblyPath,
            serviceCallId: deliveryExecutionId,
            deliveryServerConfig: [],
            bootstrap: {
                timeout: 0,
                communication: {
                    enabled: false
                }
            },
            provider: 'qti',
            providers: {},
            proxyProvider : 'appProxy',
            plugins : plugins
        };

        logger.debug('Launch test with ' +  deliveryId + ' ( ' + assemblyPath + '), execution :' + deliveryExecutionId);

        runnerFactory.registerProvider('qti', qtiRunnerProvider);
        proxyFactory.registerProvider('appProxy', appProxyProvider);

        return new Promise(function(resolve, reject){
            runnerComponentFactory(container, testConfig)
                .on('render', function() {
                    this.setState('fullpage', true);
                    this.setState('no-controls', true);
                })
                .on('ready', function(runner) {
                    resolve(runner);
                })
                .on('error', function(err){
                    logger.error('Test runner error : ' + err.message);
                    reject(err);
                });
        });
    };
});
