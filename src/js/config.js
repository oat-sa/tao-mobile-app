(function() {
    'use strict';

    require.config({

        baseUrl: '.',
        catchError: true,
        waitSeconds: 30,
        urlArgs: 'buster=3.3.0-sprint72',

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
