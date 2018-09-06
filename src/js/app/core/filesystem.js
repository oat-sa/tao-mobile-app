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
 * Manages local file system
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promiseQueue',
    'core/logger',
    'app/lib/jszip'
], function(_, promiseQueue, loggerFactory, JsZip){
    'use strict';

    //default to 5MB for temp fs
    var tempFileSystemSize = 1024 * 1024 * 5;

    var logger = loggerFactory('filesystem');


    /**
     * Access to a file system
     * @param {String} rootName - each file system need to be in it's own directory by convention
     * @param {Boolean} persistent - persistent or temporary
     * @returns {Promise<fileSystemService>} a promise that resolves with the filesystem service
     */
    return function fileSystem(rootName, persistent) {

        var rootDirectoryEntry;
        var fileSystemType = persistent ? window.LocalFileSystem.PERSISTENT : window.LocalFileSystem.TEMPORARY;
        //persitent fs needs to be 0/unlimited
        var fileSystemSize = persistent ? 0 : tempFileSystemSize;

        /**
         * @typedef {Object} fileSystemService
         */
        var fileSystemService = {

            /**
             * Get the file system root directory
             * @returns {DiretoryEntry} the root directory
             */
            getRootDirectory : function getRootDirectory(){
                return rootDirectoryEntry;
            },

            /**
             * Get a directory from it's parent. The directory will be created if it does not exist.
             *
             * @param {DirectoryEntry} parentDirEntry - the parent node
             * @param {String} name - the directory name
             * @returns {Promise<DiretoryEntry>} the root directory
             */
            getDirectory : function getDirectory(parentDirEntry, name){
                if(!parentDirEntry || _.isEmpty(name)){
                    return Promise.reject(new Error('Invalid browsing options'));
                }
                return new Promise(function(resolve, reject){
                    parentDirEntry.getDirectory(name, {
                        create : true,
                        exclusive : false
                    },
                    resolve,
                    function(err){
                        logger.error('Unable to open the directory ' + name + ' : ' + err.message);
                        reject(err);
                    });
                });
            },


            /**
             * Create a directory
             *
             * @param {DirectoryEntry} parentDirEntry - the parent node
             * @param {String} name - the directory name
             * @returns {Promise<DiretoryEntry>} the root directory
             */
            createDirectory : function createDirectory(parentDirEntry, name){
                if(!parentDirEntry || _.isEmpty(name)){
                    return Promise.reject(new Error('Invalid browsing options'));
                }
                return new Promise(function(resolve, reject){
                    parentDirEntry.getDirectory(name, { create : true  }, resolve, reject);
                });
            },

            /**
             * Empty a directory (ie. rm -rf)
             *
             * @param {DirectoryEntry} dirEntry - the directory to empty
             * @returns {Promise<Boolean>} true if empty
             */
            emptyDirectory : function emptyDirectory(dirEntry){
                if(!dirEntry){
                    return Promise.reject(new Error('Invalid browsing options'));
                }
                return new Promise(function(resolve, reject){
                    dirEntry.removeRecursively(function(){

                        logger.debug(dirEntry.toURL() + ' has been emptied');

                        resolve(true);
                    }, reject);
                });
            },

            /**
             * Get a file from a directory
             *
             * @param {String} path - the file path
             * @param {DirectoryEntry} [parentDirEntry = root] - the parent node, root by default
             * @param {Boolean} [create] - if we should create the file if it doesn't exist
             * @returns {Promise<FileEntry>} the file
             */
            getFile : function getFile(path, parentDirEntry, create){
                if(parentDirEntry){
                    return new Promise(function(resolve, reject){
                        parentDirEntry.getFile(path, { create : !!create, exclusive : false }, resolve, reject);
                    });
                }
                return this.getFile(path, rootDirectoryEntry, create);
            },

            /**
             * Read a file from the file system
             * @param {FileEntry} fileEntry - the file to read
             * @param {Boolean} [binary = false] - is the file a binary
             * @returns {Promise<String|ArrayBuffer>} the file content
             */
            readFile : function readFile(fileEntry, binary){
                return new Promise(function(resolve, reject){
                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onerror = function(err){
                            logger.error('Error reading file ' + fileEntry.toURL() + ' : ' + err.message);
                            reject(err);
                        };
                        reader.onloadend = function() {
                            resolve(this.result);
                        };

                        if(binary){
                            reader.readAsArrayBuffer(file);
                        } else {
                            reader.readAsText(file);
                        }

                    }, reject);
                });
            },

            /**
             * Reads a JSON file
             * @param {FileEntry} fileEntry - the file to read
             * @returns {Promise<Object>} the evaluated JSON content
             */
            readJsonFile : function readJsonFile(fileEntry){
                return this.readFile(fileEntry, false)
                    .then(function(data){
                        return JSON.parse(data);
                    });
            },

            /**
             * Write content to a file
             * @param {FileEntry} fileEntry - the file to write
             * @param {Blob|String} content - the content to write
             * @returns {Promise<FileEntry>} the written file
             */
            writeFile: function writeFile(fileEntry, content) {
                return new Promise(function(resolve, reject){
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function() {
                            resolve(fileEntry);
                        };

                        fileWriter.onerror = function(err){
                            logger.error('Error writting file ' + fileEntry.toURL() + ' : ' + err.message);
                            reject(err);
                        };

                        if(content instanceof Blob){
                            fileWriter.write(content);
                        } else {
                            fileWriter.write(new Blob([content], { type : 'text/plain' }));
                        }
                    }, reject);
                });
            },

            /**
             * Write JavaScript data into a JSON file
             * @param {FileEntry} fileEntry - the file to write
             * @param {Object} data - the content to write
             * @returns {Promise<FileEntry>} the written file
             */
            writeJsonFile: function writeJsonFile(fileEntry, data) {
                return this.writeFile(fileEntry, JSON.stringify(data));
            },

            /**
             * Unzip into the filesystem
             * @param {Blob} zipData - the raw zip data
             * @param {DirectoryEntry} dirEntry - where to unzip
             * @return {Promise} resolves when done
             */
            unzipTo : function unzipTo(zipData, dirEntry){
                var self = this;
                var destination;

                if(!zipData || !zipData instanceof Blob){
                    return Promise.reject(new TypeError('Incorrect zip data'));
                }
                if(!dirEntry){
                    return Promise.reject(new TypeError('Missing directory target'));
                }
                destination = dirEntry.toURL();
                logger.debug('Start unzip a blob to ' + destination );

                return new JsZip()
                    .loadAsync(zipData, { createFolders : true })
                    .then(function(zip){
                        var queue = promiseQueue();
                        _.forEach(zip.files, function(file, path){

                            logger.debug('Unzip file ' + path );

                            if(file.dir){
                                queue.serie(function(){
                                    return self.createDirectory(dirEntry, path);
                                })
                                .then(function(){

                                    logger.debug('directory ' + path + ' created into ' + destination );

                                    return path;
                                });
                            } else {
                                queue.serie(function(){
                                    return file.async('blob').then(function(data){
                                        return self.getFile(path, dirEntry , true).then(function(fileEntry){
                                            return self.writeFile(fileEntry, data);
                                        });
                                    });
                                }).then(function(){

                                    logger.debug('file ' + path + ' written to ' + destination );

                                    return path;
                                });
                            }
                        });
                        return Promise.all(queue.getValues());
                    });
            }
        };

        return new Promise(function(resolve, reject){
            window.requestFileSystem(fileSystemType, fileSystemSize, function(fs) {

                logger.debug('Request file system on ' + rootName);

                fs.root.getDirectory(rootName, {
                    create: true,
                    exclusive : false
                }, function(rootEntry){

                    logger.debug('File system root directory resolved to ' + rootEntry.toURL());
                    rootDirectoryEntry = rootEntry;
                    resolve(fileSystemService);
                });
            }, function(err){

                logger.error('Unable to open the file system on ' + rootName + ' : ' + err.message);
                reject(err);
            });
        });
    };
});

