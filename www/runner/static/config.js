(function(){
    'use strict';

    /**
     * Load a GET parameter on the current window
     * @param {String} key - the parameter name
     * @returns {String} the parameter value
     */
    var getParam = function getParam(key){
        var params = window.location.search
            .replace(/^\?/, '')
            .split('&')
            .reduce( function(acc, tok) {
                var tokens = tok.split('=').map(decodeURIComponent);
                if(tokens.length === 2){
                    acc[tokens[0]] = tokens[1];
                }
                return acc;
            }, {});
        return params && params[key];
    };

    //Set language (en) and territory (US)
    var lang = 'en';
    var territory = 'US';
    var locale = lang + '-' + territory;

    // The domain (https://mydomain.com) and the base directory (/path/to/)
    // are guessed by their context.
    // In some situations, they need to be provided manually. In that situation,
    // just comment the block below and define the two variables :
    // var domain = 'https://mydomain.com';
    // var baseDir = '/path/to/';
    //
    var domain = window.location.origin + '';
    var baseDir =  '/runner/src';


    //Exit URL, this is the location the test will redirect to
    //once finished or timed out.
    //The default value restart the test
    var exitUrl =  '../index.html';

    //Identify the test among others
    var deliveryId = getParam('deliveryId');
    var assemblyPath = getParam('assemblyPath');

    require.config({

        baseUrl: 'src/tao/views/js',
        catchError: true,
        waitSeconds: 30,
        urlArgs: 'buster=3.3.0-sprint80',

        config: {
            context: {
                'dataBaseUrl' : 'filesystem:' + domain + '/persistent/assembly/',
                'deliveryId' : deliveryId,
                'assemblyPath' : assemblyPath,
                'root_url': domain + baseDir,
                'base_url': baseDir,
                'taobase_www': '/',
                'base_www': '/',
                'base_lang': lang,
                'locale': locale,
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
            'ui/themes': {
                items: {
                    'base': domain + baseDir + '/taoQtiItem/views/css/qti-runner.css',
                    'available': [{
                        'id': 'tao',
                        'name': 'TAO',
                        'path': domain + baseDir + '/taoQtiItem/views/css/themes/default.css'
                    }],
                    'default': 'tao'
                }
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
            'taoQtiItem/qtiRunner/core/QtiRunner': {
                'inlineModalFeedback': false
            },
            'taoQtiItem/qtiCommonRenderer/renderers/config': {
                'associateDragAndDrop': true,
                'gapMatchDragAndDrop': true,
                'graphicGapMatchDragAndDrop': true,
                'orderDragAndDrop': true
            },
            'taoQtiItem/portableElementRegistry/ciRegistry': {
                'providers': [{
                    'name': 'pciRegistry',
                    'module': 'qtiItemPci/pciProvider'
                }]
            },
            'taoQtiTest/runner/proxy/loader': {
                'providerName': 'localProxy',
                'module': '../../../../static/taoQtiTest/views/js/runner/proxy/local/proxy'
            }
        },
        paths: {
            //require-js plugins
            'text': 'lib/text/text',
            'json': 'lib/text/json',
            'css': 'lib/require-css/css',
            'tpl': 'tpl',
            //jquery and plugins
            'jquery': 'lib/jquery-1.8.0.min',
            //'jqueryui': 'lib/jquery-ui-1.8.23.custom.min',
            'select2': 'lib/select2/select2.min',
            'jquery.autocomplete': 'lib/jquery.autocomplete/jquery.autocomplete',
            //'jwysiwyg': 'lib/jwysiwyg/jquery.wysiwyg',
            //'jquery.tree': 'lib/jsTree/jquery.tree',
            'jquery.timePicker': 'lib/jquery.timePicker',
            'jquery.cookie': 'lib/jquery.cookie',
            'nouislider': 'lib/sliders/jquery.nouislider',
            //'jquery.fileDownload': 'lib/jquery.fileDownload',
            'qtip': 'lib/jquery.qtip/jquery.qtip',
            //polyfills
            'polyfill': 'lib/polyfill',
            //libs
            'lodash': 'lib/lodash.min',
            'async': 'lib/async',
            'moment': 'lib/moment-with-locales.min',
            'handlebars': 'lib/handlebars',
            'class': 'lib/class',
            'raphael': 'lib/raphael/raphael',
            'scale.raphael': 'lib/raphael/scale.raphael',
            //'spin': 'lib/spin.min',
            'pdfjs-dist/build/pdf': 'lib/pdfjs/build/pdf',
            'pdfjs-dist/build/pdf.worker': 'lib/pdfjs/build/pdf.worker',
            'mathJax': [
                '../../../taoQtiItem/views/js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML-full',
                '../../../taoQtiItem/views/js/MathJaxFallback'
            ],
            'ckeditor': 'lib/ckeditor/ckeditor',
            'interact': 'lib/interact',
            //'d3': 'lib/d3js/d3.min',
            //'c3': 'lib/c3js/c3.min',
            //locale loader
            'i18ntr': '../locales/' + locale,
            //extension aliases, and controller loading in prod mode
            'tao': '.',
            'taoCss': '../css',
            'taoItems': '../../../taoItems/views/js',
            'taoItemsCss': '../../../taoItems/views/css',
            'taoTests': '../../../taoTests/views/js',
            'taoTestsCss': '../../../taoTests/views/css',
            'qtiCustomInteractionContext': '../../../taoQtiItem/views/js/runtime/qtiCustomInteractionContext',
            'qtiInfoControlContext': '../../../taoQtiItem/views/js/runtime/qtiInfoControlContext',
            'taoQtiItem': '../../../taoQtiItem/views/js',
            'taoQtiItemCss': '../../../taoQtiItem/views/css',
            'taoQtiTest': '../../../taoQtiTest/views/js',
            'taoQtiTestCss': '../../../taoQtiTest/views/css',
            'qtiItemPci': '../../../qtiItemPci/views/js',
            'qtiItemPciCss': '../../../qtiItemPci/views/css',
            'qtiItemPci/pciProvider': '../../../../static/qtiItemPci/views/js/pciProvider'
        },
        shim: {
            'moment': {
                exports: 'moment'
            },
            'ckeditor': {
                exports: 'CKEDITOR'
            },
            'ckeditor-jquery': ['ckeditor'],
            'class': {
                exports: 'Class'
            },
            //'c3': {
                //deps: ['css!lib/c3js/c3.css']
            //},
            'mathJax': {
                exports: 'MathJax',
                init: function() {
                    if (window.MathJax) {
                        window.MathJax.Hub.Config({
                            showMathMenu: false,
                            showMathMenuMSIE: false
                        });
                        window.MathJax.Hub.Startup.onload();
                        return window.MathJax;
                    }
                }
            }
        }
    });

    //The test configuration, especially the plugins
    var testConfig = {
        exitUrl: exitUrl,
        testDefinition: deliveryId,
        testCompilation: assemblyPath,
        serviceCallId: deliveryId,
        deliveryServerConfig: [],
        bootstrap: {
            timeout: 0,
            communication: {
                enabled: false
            }
        },
        providers: {
            'taoQtiTest/runner/provider/qti': {
                id: 'qti',
                module: 'taoQtiTest/runner/provider/qti',
                bundle: 'taoQtiTest/loader/qtiTestRunner.min',
                position: null,
                name: 'QTI runner',
                description: 'QTI implementation of the test runner',
                category: 'runner',
                active: true,
                tags: ['core', 'qti', 'runner']
            }
        },
        plugins: {
            'taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock': {
                id: 'rubricBlock',
                module: 'taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Rubric Block',
                description: 'Display test rubric blocks',
                category: 'content',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/content/overlay/overlay': {
                id: 'overlay',
                module: 'taoQtiTest/runner/plugins/content/overlay/overlay',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Overlay',
                description: 'Add an overlay over items when disabled',
                category: 'content',
                active: true,
                tags: ['core', 'technical', 'required']
            },
            'taoQtiTest/runner/plugins/content/dialog/dialog': {
                id: 'dialog',
                module: 'taoQtiTest/runner/plugins/content/dialog/dialog',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Dialog',
                description: 'Display popups that require user interactions',
                category: 'content',
                active: true,
                tags: ['core', 'technical', 'required']
            },
            'taoQtiTest/runner/plugins/content/feedback/feedback': {
                id: 'feedback',
                module: 'taoQtiTest/runner/plugins/content/feedback/feedback',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Feedback',
                description: 'Display notifications into feedback popups',
                category: 'content',
                active: true,
                tags: ['core', 'technical', 'required']
            },
            'taoQtiTest/runner/plugins/content/dialog/exitMessages': {
                id: 'exitMessages',
                module: 'taoQtiTest/runner/plugins/content/dialog/exitMessages',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Exit Messages',
                description: 'Display messages when a test taker leaves the test',
                category: 'content',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/content/loading/loading': {
                id: 'loading',
                module: 'taoQtiTest/runner/plugins/content/loading/loading',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Loading bar',
                description: 'Show a loading bar when the test is loading',
                category: 'content',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/controls/title/title': {
                id: 'title',
                module: 'taoQtiTest/runner/plugins/controls/title/title',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Title indicator',
                description: 'Display the title of current test element',
                category: 'controls',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback': {
                id: 'modalFeedback',
                module: 'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'QTI modal feedbacks',
                description: 'Display Qti modalFeedback element',
                category: 'content',
                active: true,
                tags: ['core', 'qti', 'required']
            },
            'taoQtiTest/runner/plugins/content/accessibility/keyNavigation': {
                id: 'keyNavigation',
                module: 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Using key to navigate test runner',
                description: 'Provide a way to navigate within the test runner with the keyboard',
                category: 'content',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/content/responsiveness/collapser': {
                id: 'collapser',
                module: 'taoQtiTest/runner/plugins/content/responsiveness/collapser',
                bundle: null,
                position: null,
                name: 'Collapser',
                description: 'Reduce the size of the tools when the available space is not enough',
                category: 'content',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/controls/timer/plugin': {
                id: 'timer',
                module: 'taoQtiTest/runner/plugins/controls/timer/plugin',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Timer indicator',
                description: 'Add countdown when remaining time',
                category: 'controls',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/controls/progressbar/progressbar': {
                id: 'progressbar',
                module: 'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Progress indicator',
                description: 'Display the current progression within the test',
                category: 'controls',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/controls/duration/duration': {
                id: 'duration',
                module: 'taoQtiTest/runner/plugins/controls/duration/duration',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Duration record',
                description: 'Record accurately time spent by the test taker',
                category: 'controls',
                active: true,
                tags: ['core', 'technical', 'required']
            },
            'taoQtiTest/runner/plugins/controls/connectivity/connectivity': {
                id: 'connectivity',
                module: 'taoQtiTest/runner/plugins/controls/connectivity/connectivity',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Connectivity check',
                description: 'Pause the test when the network loose the connection',
                category: 'controls',
                active: true,
                tags: ['core', 'technical']
            },
            'taoQtiTest/runner/plugins/controls/testState/testState': {
                id: 'testState',
                module: 'taoQtiTest/runner/plugins/controls/testState/testState',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Test state',
                description: 'Manage test state',
                category: 'controls',
                active: true,
                tags: ['core', 'technical', 'required']
            },
            'taoQtiTest/runner/plugins/navigation/review/review': {
                id: 'review',
                module: 'taoQtiTest/runner/plugins/navigation/review/review',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Navigation and review panel',
                description: 'Enable a panel to handle navigation and item reviews',
                category: 'navigation',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/navigation/previous': {
                id: 'previous',
                module: 'taoQtiTest/runner/plugins/navigation/previous',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Previous button',
                description: 'Enable to move backward',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti', 'required']
            },
            'taoQtiTest/runner/plugins/navigation/next': {
                id: 'next',
                module: 'taoQtiTest/runner/plugins/navigation/next',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Next button',
                description: 'Enable to move forward',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti', 'required']
            },
            'taoQtiTest/runner/plugins/navigation/nextSection': {
                id: 'nextSection',
                module: 'taoQtiTest/runner/plugins/navigation/nextSection',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Next section button',
                description: 'Enable to move to the next available section',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/navigation/skip': {
                id: 'skip',
                module: 'taoQtiTest/runner/plugins/navigation/skip',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Skip button',
                description: 'Skip the current item',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/navigation/allowSkipping': {
                id: 'allowSkipping',
                module: 'taoQtiTest/runner/plugins/navigation/allowSkipping',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Allow Skipping',
                description: 'Prevent submission of default/null responses',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/navigation/validateResponses': {
                id: 'validateResponses',
                module: 'taoQtiTest/runner/plugins/navigation/validateResponses',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Validate Responses',
                description: 'Prevent submission of invalid responses',
                category: 'navigation',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/tools/comment/comment': {
                id: 'comment',
                module: 'taoQtiTest/runner/plugins/tools/comment/comment',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Comment tool',
                description: 'Allow test taker to comment an item',
                category: 'tools',
                active: true,
                tags: ['core', 'qti']
            },
            'taoQtiTest/runner/plugins/tools/calculator': {
                id: 'calculator',
                module: 'taoQtiTest/runner/plugins/tools/calculator',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Caculator tool',
                description: 'Gives the student access to a basic calculator',
                category: 'tools',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/tools/zoom': {
                id: 'zoom',
                module: 'taoQtiTest/runner/plugins/tools/zoom',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Zoom',
                description: 'Zoom in and out the item content',
                category: 'tools',
                active: true,
                tags: ['core']
            },
            'taoQtiTest/runner/plugins/tools/highlighter/plugin': {
                id: 'highlighter',
                module: 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Text Highlighter',
                description: 'Allows the test taker to highlight text',
                category: 'tools',
                active: true,
                tags: []
            },
            'taoQtiTest/runner/plugins/tools/magnifier/magnifier': {
                id: 'magnifier',
                module: 'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Magnifier',
                description: 'Gives student access to a magnification tool',
                category: 'tools',
                active: true,
                tags: []
            },
            'taoQtiTest/runner/plugins/tools/lineReader/plugin': {
                id: 'lineReader',
                module: 'taoQtiTest/runner/plugins/tools/lineReader/plugin',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Line Reader',
                description: 'Display a customisable mask with a customisable hole in it!',
                category: 'tools',
                active: true,
                tags: []
            },
            'taoQtiTest/runner/plugins/tools/answerMasking/plugin': {
                id: 'answerMasking',
                module: 'taoQtiTest/runner/plugins/tools/answerMasking/plugin',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Answer Masking',
                description: 'Hide all answers of a choice interaction and allow revealing them',
                category: 'tools',
                active: true,
                tags: []
            },
            'taoQtiTest/runner/plugins/tools/answerElimination/eliminator': {
                id: 'eliminator',
                module: 'taoQtiTest/runner/plugins/tools/answerElimination/eliminator',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Eliminate choices',
                description: 'Allows student to eliminate choices',
                category: 'tools',
                active: true,
                tags: []
            },
            'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking': {
                id: 'area-masking',
                module: 'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking',
                bundle: 'taoQtiTest/loader/testPlugins.min',
                position: null,
                name: 'Area Masking',
                description: 'Mask areas of the item',
                category: 'tools',
                active: true,
                tags: []
            }
        }
    };



    //add the test config 'in-place' within the `data-params` attribute
    if(document && document.getElementById('amd-loader')){
        document.getElementById('amd-loader').setAttribute('data-params', JSON.stringify(testConfig));
    }

}());
