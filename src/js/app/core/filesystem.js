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
    'app/lib/jszip'
], function(_, promiseQueue, JsZip){
    'use strict';

    /**
     * Access to a file system
     * @param {String} rootName - each file system need to be in it's own directory by convention
     * @param {Boolean} persistent - persistent or temporary
     * @returns {Object} the file system
     */
    return function fileSystem(rootName, persistent) {

        var rootDir;
        var fileSystemType = persistent ? window.LocalFileSystem.PERSISTENT : window.LocalFileSystem.TEMPORARY;

        /**
         * @typedef
         */
        return {

            /**
             * Get the file system root directory
             * @returns {Promise<DiretoryEntry>} the root directory
             */
            getRootDirectory : function getRootDirectory(){
                if(rootDir){
                    return Promise.resolve(rootDir);
                }
                return new Promise(function(resolve, reject) {
                    window.requestFileSystem(fileSystemType, 0, function(fs) {
                        fs.root.getDirectory(rootName, { create: true, exclusive : false  }, resolve);
                    }, reject);
                });
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
                    parentDirEntry.getDirectory(name, { create : true, exclusive : false }, resolve, reject);
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
                var self = this;
                if(parentDirEntry){
                    return new Promise(function(resolve, reject){
                        parentDirEntry.getFile(path, { create : !!create, exclusive : false }, resolve, reject);
                    });
                }
                return this.getRootDirectory().then(function(rootDirectory){
                    if(rootDirectory){
                        return self.getFile(path, rootDirectory, create);
                    }
                });
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

                        reader.onerror = reject;
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

                        fileWriter.onerror = reject;

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
                return new JsZip()
                    .loadAsync(zipData, { createFolders : true })
                    .then(function(zip){
                        var queue = promiseQueue();
                        _.forEach(zip.files, function(file, path){
                            if(file.dir){
                                queue.serie(self.createDirectory(dirEntry, path));
                            } else {
                                queue.serie(
                                    file.async('blob').then(function(data){
                                        return self.getFile(path, dirEntry , true)
                                            .then(function(fileEntry){
                                                return self.writeFile(fileEntry, data);
                                            });
                                    })
                                );
                            }
                        });
                        return Promise.all(queue.getValues());
                    });
            }
        };
    };

});

