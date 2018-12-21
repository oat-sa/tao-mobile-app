
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
 * Format the content of result variables the TAO way.
 * This format has been reversed engineered so it can be incomplete
 * or even not that accurate, but no documentation no knowledgeable people
 * are able to give some clue on where this come from...
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash'
], function(
    _
) {
    'use strict';

    /**
     * Per cardinality type formatters
     */
    var cardinalityFormatters = {

        /**
         * Single cardinality formatter
         * @param {String} inputValue
         * @returns {String} formatted value
         */
        single : function single(inputValue){
            return inputValue;
        },

        /**
         * Multiple cardinality formatter
         * @param {String[]} inputValue
         * @returns {String} formatted value
         */
        multiple : function multiple(inputValue){
            if(!_.isArray(inputValue)){
                inputValue = [inputValue];
            }
            return '[' + inputValue.join('; ') + ']';
        },

        /**
         * Ordered cardinality formatter
         * @param {String[]} inputValue
         * @returns {String} formatted value
         */
        ordered : function ordered(inputValue){
            if(!_.isArray(inputValue)){
                inputValue = [inputValue];
            }
            return '<' + inputValue.join('; ') + '>';
        },

        /**
         * Record cardinality formatter
         * @param {Object} inputValue
         * @returns {String} formatted value
         */
        record : function record(inputValue){
            return JSON.stringify(inputValue);
        },
    };


    /**
     * Per base type formatters
     */
    var baseTypeFormatters = {

        /**
         * Identifier type formatter
         * @param {String} value
         * @returns {String} formatted value
         */
        identifier : function identifier(value){
            if(!_.isEmpty(value) && !_.isNull(value)){
                return "'" + value + "'";
            }
            return value;
        },

        /**
         * Boolean type formatter
         * @param {Boolean} value
         * @returns {String} formatted value
         */
        boolean : function boolean(value){
            return JSON.stringify(!!value);
        },

        /**
         * Pair type formatter
         * @param {String[]} value - a 2 strings array
         * @returns {String} formatted value
         */
        pair : function pair(value){
            if(_.isArray(value) && value.length === 2){
                return value.join(' ').trim();
            }
            return value;
        },

        /**
         * DirectedPair type formatter
         * @param {String[]} value - a 2 strings array
         * @returns {String} formatted value
         */
        directedPair : function directedPair(value){
            return this.pair(value);
        },

        /**
         * Point type formatter
         * @param {Number[]} value - a 2 number array
         * @returns {String} formatted value
         */
        point : function point(value){
            return this.pair(value);
        }
    };

    /**
     * Format the given variable
     * @param {String} cardinality - the variable cardinality (from QTI)
     * @param {String} baseType - the variable baseType (from QTI)
     * @param {*} value - the variable value
     * @returns {String} the textual representation of the variable
     * @throws {TypeError} with unknown cardinality
     */
    return function formatValue(cardinality, baseType, value){
        var cardinalityFormatter;
        var baseTypeFormatter = function baseTypeFormatter(inputValue){
            if(_.isNull(inputValue)){
                return null;
            }
            return inputValue + '';
        };

        if(_.isFunction(baseTypeFormatters[baseType])){
            baseTypeFormatter = baseTypeFormatters[baseType].bind(baseTypeFormatters);
        }
        if(_.isFunction(cardinalityFormatters[cardinality])){
            cardinalityFormatter = cardinalityFormatters[cardinality];
        } else {
            throw new TypeError('Unknow variable cardinality ' + cardinality);
        }
        if(cardinality === 'multiple' || cardinality === 'ordered'){
            return cardinalityFormatter(_.map(value, baseTypeFormatter, baseTypeFormatters));
        }
        return cardinalityFormatter(baseTypeFormatter(value));
    };
});
