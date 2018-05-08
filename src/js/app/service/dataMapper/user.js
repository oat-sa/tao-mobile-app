define([
    'lodash'
], function(_) {
    'use strict';

    var mapping = {
        username:      'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#login',
        password:      'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#password',
        firstname:     'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#userFirstName',
        lastName:      'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#userLastName',
        email:         'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#userMail',
        originalRoles: 'http:\/\/www.tao.lu\/Ontologies\/generis.rdf#userRoles',
        updatedAt:     'http:\/\/www.tao.lu\/Ontologies\/TAO.rdf#UpdatedAt',
        createdAt:     'http:\/\/www.taotesting.com\/Ontologies\/TAO.rdf#CreatedAt'
    };

    var interestingRoles = {
        syncManager : 'http://www.tao.lu/Ontologies/generis.rdf#taoSyncManager'
    };

    var mapper = function mapper(inputUser) {
        var outputUser = null;
        if (_.isPlainObject(inputUser)) {
            outputUser = {
                id: inputUser.id
            };
            if (_.isPlainObject(inputUser.properties)) {
                outputUser = _.reduce(mapping, function(acc, propName, key) {
                    if (!_.isUndefined(inputUser.properties[propName])) {
                        outputUser[key] = inputUser.properties[propName];
                        return acc;
                    }
                }, outputUser);
                if(_.isString(outputUser.originalRoles)){
                    outputUser.originalRoles = [outputUser.originalRoles];
                }

                if(outputUser.originalRoles && outputUser.originalRoles.length){
                    _.forEach(interestingRoles, function(uri, role){
                        if(_.contains(outputUser.originalRoles, uri)){
                            outputUser.role = role;
                            return false;
                        }
                    });
                }
            }
        }
        return outputUser;
    };

    //expose the mapping
    mapper.mapping = mapping;

    return mapper;
});
