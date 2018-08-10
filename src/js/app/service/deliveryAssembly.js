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
 * Service that let's you save and read delivery assemblies.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'app/core/filesystem'
], function(_, filesystem){
    'use strict';

    var assemblyFileSystem;
    var getFileSystem = function getFileSystem(){
        if(!assemblyFileSystem){
            assemblyFileSystem = filesystem('assembly', true);
        }
        return assemblyFileSystem;
    };


    var getAssemblyDirectory = function getAssemblyDirectory(assemblyPath){
        return getFileSystem()
            .getRootDirectory()
            .then(function(rootDir){
                return getFileSystem().getDirectory(rootDir, assemblyPath);
            });
    }


/*
    var emptyRootDir = function emptyRootDir() {
        return getRootDir().then(function(rootDir){
            return new Promise(function(resolve, reject){
                rootDir.removeRecursively(function() {
                    resolve(true);
                }, reject);
            });
        });
    };

    var getAssemblyDir = function getAssemblyDir(deliveryId){
        return getRootDir().then(function(rootDir){
            return new Promise(function(resolve, reject){
                rootDir.getDirectory(encodeURIComponent(deliveryId), { create : true, exclusive : false  }, function (dirEntry) {
                    resolve(dirEntry);
                }, reject);
            });
        });
    };

    var getEmptyAssemblyDir = function getEmptyAssemblyDir(deliveryId){
        return getRootDir().then(function(rootDir){
            return new Promise(function(resolve, reject){
                rootDir.getDirectory(encodeURIComponent(deliveryId), { create : true, exclusive : false  }, function (dirEntry) {
                    dirEntry.removeRecursively(function() {
                        resolve(true);
                    }, reject);
                }, reject);
            });
        });
    };

    var createDir = function writeFile(dirEntry, dirName) {
        return new Promise(function(resolve, reject){
            dirEntry.getDirectory(dirName, { create : true }, resolve, reject);
        });
    };

    var writeFile = function writeFile(dirEntry, fileName, dataObj) {
        return new Promise(function(resolve, reject){
            dirEntry.getFile(fileName, { create : true }, function(fileEntry){
                fileEntry.createWriter(function (fileWriter) {
                    fileWriter.onwriteend = function() {
                        resolve(fileEntry);
                    };

                    fileWriter.onerror = reject;

                    fileWriter.write(dataObj);
                });
            }, reject);
        });
    };

    var unzipAssembly = function unzipAssembly(zipData, dirEntry){
        return new JsZip()
            .loadAsync(zipData, { createFolders : true })
            .then(function(zip){
                var queue = promiseQueue();
                _.forEach(zip.files, function(file, path){
                    if(file.dir){
                        queue.serie(createDir(dirEntry, path));
                    } else {
                        queue.serie(
                            file.async('blob').then(function(data){
                                return writeFile(dirEntry, path, data);
                            })
                        );
                    }
                });
                return queue.getValues();
            });
    };

*/

    /**
     * @typedef {Object} deliveryAssemblyService
     */
    return {

        /**
         * Install an assembly into the filesystem from a zip blob.
         *
         * @param {String} deliveryId - the delivery identifier
         * @param {Blob} zipData - the zip file that contains the assmebly
         * @returns {Promise<delivery>} resolves with the delivery or null if not found
         */
        save : function save(deliveryId, assemblyPath, zipData){
            if(_.isEmpty(deliveryId) || _.isEmpty(assemblyPath) ){
                return Promise.resolve(null);
            }

            return getAssemblyDirectory(assemblyPath)
                .then(function(assemblyDir){
                    return getFileSystem().emptyDirectory(assemblyDir);
                })
                .then(function(assemblyDir){
                    return getAssemblyDirectory(assemblyPath);
                })
                .then(function(assemblyDir){
                    console.log('--------- ' + deliveryId + ' : ' + assemblyPath + ' ------------');
                    console.log(deliveryId, 'toURL', assemblyDir.toURL());
                    console.log(deliveryId, 'toInternalURL', assemblyDir.toInternalURL());
                    console.log(deliveryId, 'toNativeURL', assemblyDir.toNativeURL());
                    return getFileSystem().unzipTo(zipData, assemblyDir);
                });
        },

        getAssemblyDirBaseUrl : function getAssemblyDirBaseUrl(deliveryId, assemblyPath){
            return getAssemblyDirectory(assemblyPath)
                .then(function(assemblyDir){
                    return assemblyDir.toURL();
                });
        },

        remove : function remove(deliveryId, assemblyPath){
            if(_.isEmpty(assemblyPath)){
                return Promise.resolve(null);
            }
            return getAssemblyDirectory(assemblyPath)
                .then(function(assemblyDir){
                    return getFileSystem().emptyDirectory(assemblyDir);
                })
                .then(function(){
                    return true;
                });
        },

        removeAll : function removeAll(){
            return getFileSystem()
                .getRootDirectory()
                .then(function(rootDir){
                    return getFileSystem().emptyDirectory(rootDir);
                });
        }
    };
});

