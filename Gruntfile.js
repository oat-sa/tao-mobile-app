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
 * Grunt configuration
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
module.exports = function(grunt) {
    'use strict';

    const target  = 'www/dist/';
    const taodist = 'src/taodist/';

    const plugins = require('./src/js/app/runner/plugins.json');

    const extensionHelper = require('./src/taodist/tao/views/build/tasks/helpers/extensions.js')(grunt, taodist);

    var itemRuntime = extensionHelper.getExtensionSources('taoQtiItem', ['views/js/qtiItem/core/**/*.js', 'views/js/qtiCommonRenderer/renderers/**/*.js',  'views/js/qtiCommonRenderer/helpers/**/*.js'], true);
    var testRuntime = extensionHelper.getExtensionSources('taoQtiTest', ['views/js/runner/**/*.js'], true);

    //the list of file (entry points) to include in the app bundle
    const includeInBundle = [
        'lib/require',
        'config',
        'app/controller/routes',
        'app/controller/admin/index',
        'app/controller/main/login',
        'app/controller/main/logout',
        'app/controller/delivery/index',
        'app/controller/delivery/runner',
        'core/logger/console',
        'loader/bootstrap'
    ]
    .concat(Object.keys(plugins))
    .concat(itemRuntime)
    .concat(testRuntime);

    grunt.config.init({

        //clean up the target folder
        clean : {
            options : {
                force : true
            },
            build : [target]
        },

        //compile main scss and component scss
        sass : {
            options : {
                includePaths : [ 'src/scss/', `${taodist}tao/views/scss/` ],
                outputStyle : 'compressed',
                sourceMap : true
            },
            app : {
                files : [
                    {
                        src : 'src/scss/app.scss',
                        dest : `${target}css/app.css`
                    }, {
                        expand: true,
                        src: 'src/js/app/**/scss/*.scss',
                        rename : function(dest, src){
                            return src.replace(/scss/g, 'css');
                        }
                    },

                ]
            }
        },

        //the app contains only bundles files
        requirejs : {
            options : {
                preserveLicenseComments: false,
                optimizeAllPluginResources: true,
                findNestedDependencies : true,
                skipDirOptimize: true,
                optimizeCss : 'none',
                buildCss : false,
                inlineText: true,
                skipPragmas : true,
                generateSourceMaps : true,
                removeCombined : true,
                baseUrl : 'src/js',
                force : true,
                mainConfigFile : 'src/js/config.js',
            },

            // bundle for dev without opitmization, for performances
            dev: {
                options : {
                    optimize : 'none',
                    name: 'app',
                    out : `${target}js/app.min.js`,
                    include: includeInBundle,
                    excludeShallow: ['ckeditor']
                }
            },

            //build  bundle with optimization
            build: {
                options : {
                    optimize: 'uglify2',
                    uglify2: {
                        mangle : false,
                        output: {
                            'max_line_len': 666
                        }
                    },
                    name: 'app',
                    out : `${target}js/app.min.js`,
                    include: includeInBundle,
                    excludeShallow: ['ckeditor']
                }
            }
        },

        watch: {
            sass : {
                files : ['src/scss/**/*.scss', 'src/js/app/**/*.scss'],
                tasks : ['sass:app'],
                options : {
                    debounceDelay : 1000
                }
            },
            "requirejs" : {
                files : ['src/js/**/*.js', 'src/js/**/*.tpl', 'src/js/app/component/**/*.css'],
                tasks : ['requirejs:dev'],
                options : {
                    debounceDelay : 1000
                }
            }
        },

        //some resources are not compiled so we copy them from TAO to the target
        copy : {
            build : {
                files : [
                    {expand: true, cwd: `${taodist}tao/views/css`, src: ['font/tao/**', 'font/source-sans-pro/**' ], dest: `${target}css/` },
                ]
            }
        }
    });

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
};
