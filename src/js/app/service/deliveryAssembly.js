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

    /**
     * Helper function that gives you or load the assembly filesystem instance
     * @returns {Object} the configured file system
     */
    var getFileSystem = function getFileSystem(){
        return filesystem('assembly', true);
    };

    /**
     * Get the DirectoryEntry for a given assembly
     * @param {String} assemblyPath - the path to the assembly
     * @returns {Promise<DirectoryEntry>} the DirectoryEntry of the assembly
     */
    var getAssemblyDirectory = function getAssemblyDirectory(assemblyFileSystem, assemblyPath){
        return assemblyFileSystem.getDirectory(assemblyFileSystem.getRootDirectory(), assemblyPath);
    };

    /**
     * @typedef {Object} deliveryAssemblyService
     */
    return {

        /**
         * Install an assembly into the file system from a zip blob.
         *
         * @param {String} deliveryId - the delivery identifier
         * @param {Blob} zipData - the zip file that contains the assembly
         * @returns {Promise<delivery>} resolves with the delivery or null if not found
         */
        save : function save(deliveryId, assemblyPath, zipData){
            if(_.isEmpty(deliveryId) || _.isEmpty(assemblyPath) ){
                return Promise.resolve(null);
            }

            return getFileSystem().then(function(assemblyFileSystem){

                return getAssemblyDirectory(assemblyFileSystem, assemblyPath)
                    .then(function(assemblyDir){
                        return assemblyFileSystem.emptyDirectory(assemblyDir);
                    })
                    .then(function(){
                        //this is required to re-create it
                        return getAssemblyDirectory(assemblyFileSystem, assemblyPath);
                    })
                    .then(function(assemblyDir){
                        return assemblyFileSystem.unzipTo(zipData, assemblyDir);
                    });
            });
        },

        /**
         * Read a file relatively from an assembly
         * @param {String} deliveryId - the identifier of the delivery
         * @param {String} assemblyPath - the path to the assembly
         * @param {String} path - the file path within the assembly
         * @param {Boolean} [binary=false]
         * @returns {Promise<String|ArrayBuffer>} resolves with the file content
         */
        readAssemblyFile : function readAssemblyFile(deliveryId, assemblyPath, path, binary){
            if(_.isEmpty(deliveryId) || _.isEmpty(assemblyPath) || _.isEmpty(path)){
                return Promise.resolve(null);
            }

            return getFileSystem().then(function(assemblyFileSystem){

                return getAssemblyDirectory(assemblyFileSystem, assemblyPath)
                    .then(function(assemblyDir){
                        return assemblyFileSystem.getFile(path, assemblyDir, false);
                    })
                    .then(function(fileEntry){
                        return assemblyFileSystem.readFile(fileEntry, binary);
                    });
            });
        },

        /**
         * Get the base URL of an assembly, this base URL can be used in the DOM to load the data
         * @param {String} deliveryId - the identifier of the delivery
         * @param {String} assemblyPath - the path to the assembly
         * @returns {Promise<String>} the base URL (should start with the filesystem:// protocol)
         */
        getAssemblyDirBaseUrl : function getAssemblyDirBaseUrl(deliveryId, assemblyPath){
            return getFileSystem().then(function(assemblyFileSystem){
                return getAssemblyDirectory(assemblyFileSystem, assemblyPath);
            })
            .then(function(assemblyDir){
                return assemblyDir.toURL();
            });
        },

        /**
         * Remove an assembly from the file system
         * @param {String} deliveryId - the identifier of the delivery
         * @param {String} assemblyPath - the path to the assembly
         * @returns {Promise<Boolean>} true if removed
         */
        remove : function remove(deliveryId, assemblyPath){
            if(_.isEmpty(assemblyPath)){
                return Promise.resolve(null);
            }
            return getFileSystem().then(function(assemblyFileSystem){

                return getAssemblyDirectory(assemblyFileSystem, assemblyPath)
                    .then(function(assemblyDir){
                        return assemblyFileSystem.emptyDirectory(assemblyDir);
                    })
                    .then(function(){
                        return true;
                    });
            });
        },

        /**
         * Remove everything from the assembly file system
         * @returns {Promise}
         */
        removeAll : function removeAll(){
            return getFileSystem().then(function(assemblyFileSystem){
                return assemblyFileSystem.emptyDirectory(assemblyFileSystem.getRootDirectory());
            });
        }
    };
});

