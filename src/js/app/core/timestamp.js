
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
 * Timestamp helper
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([], function() {
    'use strict';

    return {

        /**
         * Converts a timestamp in milliseconds to a microtime epoch (timestamp in second prefixed with microseconds)
         * from "1543438896772" to "0.77200000 1543438896"
         * @param {Number|String} [timestampMs = now] - a timestamp in milliseconds or get the current is not set
         * @returns {String} the micro time
         * @throws {TypeError} if the timestamp is incorrect
         */
        toMicrotime : function toMicrotime(timestampMs){

            var timestampSec;
            if(!timestampMs){
                timestampMs = Date.now();
            }
            if(!/^[0-9]{13}$/.test(timestampMs + '') || parseInt(timestampMs) <= 0) {
                throw new TypeError('A millisecond unix timestamp is expected');
            }
            timestampSec = timestampMs / 1000;

            return  ((timestampSec % 1).toFixed(3)) + '00000 ' + parseInt(timestampSec, 10);
        }
    };
});
