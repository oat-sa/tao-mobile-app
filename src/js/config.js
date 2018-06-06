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
 * Configuration file used for :
 *  - AMD/requirejs context (dev, build and test)
 *  - app configuration
 *
 */
(function() {
    'use strict';

    require.config({

        baseUrl: '.',
        catchError: true,
        waitSeconds: 30,
        urlArgs: 'buster=3.3.0-sprint72',

        //need to map all TAO paths to their location in the symlink folder
        paths : {
            'text':        '../taodist/tao/views/js/lib/text/text',
            'json':        '../taodist/tao/views/js/lib/text/json',
            'css':         '../taodist/tao/views/js/lib/require-css/css',
            'css-builder': '../taodist/tao/views/js/lib/require-css/css-builder',
            'normalize':   '../taodist/tao/views/js/lib/require-css/normalize',
            'tpl':         '../taodist/tao/views/js/tpl',
            'lib':         '../taodist/tao/views/js/lib',
            'ui':          '../taodist/tao/views/js/ui',
            'lodash':      '../taodist/tao/views/js/lib/lodash.min',
            'moment':      '../taodist/tao/views/js/lib/moment-with-locales.min',
            'handlebars':  '../taodist/tao/views/js/lib/handlebars',
            'jquery':      '../taodist/tao/views/js/lib/jquery-1.8.0.min',
            'async':       '../taodist/tao/views/js/lib/async',
            'i18n':        '../taodist/tao/views/js/i18n',
            'router':      '../taodist/tao/views/js/router',
            'urlParser':   '../taodist/tao/views/js/urlParser',
            'util':        '../taodist/tao/views/js/util',
            'layout':      '../taodist/tao/views/js/layout',
            'context':     '../taodist/tao/views/js/context',
            'i18ntr':      '../taodist/tao/views/locales/en-US',
            'core':        '../taodist/tao/views/js/core',
            'tao':         '../taodist/tao/views/js',
            'taoCss':      '../taodist/tao/views/css',
        },

        config: {
            context: {
                'root_url': '/',
                'base_url': '/',
                'taobase_www': '/',
                'base_www': '/',
                'base_lang': 'en',
                'locale': 'en_US',
                'timeout': 30,
                'extension': '',
                'module': '',
                'action': '',
                'bundle': true
            },
            text: {
                useXhr: function() {
                    return true;
                },
            },

            //dynamic lib config
            'util/locale': {
                'decimalSeparator': '.',
                'thousandsSeparator': '',
                'dateTimeFormat': 'DD/MM/YYYY HH:mm:ss'
            },
            'core/logger': {
                'level': 'debug',
                'loggers': {
                    'core/logger/console': {
                        'level': 'debug'
                    }
                }
            },
            'app/service/request' : {
                endpoint : 'http://192.168.1.36',
                timeout  : 30 * 1000
            },
            'app/service/authentication' : {
                syncManager : {
                    api : {
                        method :'POST',
                        path : '/taoSync/HandShake/index'
                    }
                }
            },
            'app/service/synchronization/token' : {
                api : {
                    method : 'GET',
                    path : '/taoOauth/TokenApi/requestToken'
                }
            },
            'app/service/synchronization/client' : {
                api : {
                    entity : {
                        method: 'GET',
                        path : '/taoSync/SynchronisationApi/fetchEntityChecksums',
                    },
                    details : {
                        method: 'POST',
                        path : '/taoSync/SynchronisationApi/fetchEntityDetails'
                    }
                }
            }
        },
        shim: {
            'moment': {
                exports: 'moment'
            },
            '/socket.io/socket.io': {
                exports: 'io'
            }
        }
    });
}());
