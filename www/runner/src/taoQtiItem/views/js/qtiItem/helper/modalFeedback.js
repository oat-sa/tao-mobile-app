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
 * Copyright (c) 2016  (original work) Open Assessment Technologies SA;
 *
 * @author Alexander Zagovorichev <zagovorichev@1pt.com>
 */

define([
    'jquery',
    'lodash',
    'taoQtiItem/qtiItem/helper/pci',
    'taoQtiItem/qtiItem/helper/container'
], function($, _, pci, containerHelper) {
    'use strict';

    /**
     * Provide the feedbackMessage signature to check if the feedback contents should be considered equals
     *
     * @param {type} feedback
     * @returns {String}
     */
    var getFeedbackMessageSignature = function getFeedbackMessageSignature(feedback) {
        return ('' + feedback.body() + feedback.attr('title')).toLowerCase().trim().replace(/x-tao-[a-zA-Z0-9\-._\s]*/g, '');
    };

    /**
     * Extract the display information for an interaction-related feedback
     *
     * @private
     * @param {Object} interaction - a qti interaction object
     * @returns {Object} Object containing useful display information
     */
    var extractDisplayInfo = function extractDisplayInfo(interaction) {

        var $interactionContainer = interaction.getContainer();
        var responseIdentifier = interaction.attr('responseIdentifier');
        var messageGroupId, $displayContainer;

        if (interaction.is('inlineInteraction')) {
            $displayContainer = $interactionContainer.closest('[class*=" col-"], [class^="col-"]');
            messageGroupId = $displayContainer.attr('data-messageGroupId');
            if (!messageGroupId) {
                //generate a messageFromId
                messageGroupId = _.uniqueId('inline_message_group_');
                $displayContainer.attr('data-messageGroupId', messageGroupId);
            }
        } else {
            messageGroupId = responseIdentifier;
            $displayContainer = $interactionContainer;
        }

        return {
            responseIdentifier: responseIdentifier,
            interactionContainer: $interactionContainer,
            displayContainer: $displayContainer,
            messageGroupId: messageGroupId,
            order: -1
        };
    };

    /**
     * Get interaction display information sorted in the order of appearance within the item
     *
     * @param {Object} item
     * @returns {Array}
     */
    var getInteractionsDisplayInfo = function getInteractionsDisplayInfo(item) {

        var interactionsDisplayInfo = [];
        var $itemContainer = item.getContainer();
        var interactionOrder = 0;

        //extract all interaction related information needed to display their
        _.forEach(item.getComposingElements(), function (element) {
            if (element.is('interaction')) {
                interactionsDisplayInfo.push(extractDisplayInfo(element));
            }
        });

        //sort interactionsDisplayInfo on the item level
        $itemContainer.find('.qti-interaction').each(function () {
            var self = this;
            _.forEach(interactionsDisplayInfo, function (_interactionInfo) {
                if (_interactionInfo.interactionContainer[0] === self) {
                    _interactionInfo.order = interactionOrder;
                    return false;
                }
            });
            interactionOrder++;
        });
        interactionsDisplayInfo = _.sortBy(interactionsDisplayInfo, 'order');

        return interactionsDisplayInfo;
    };

    /**
     * Returns feedbacks according to the given itemSession variables
     *
     * @param {Object} item - the standard tao qti item object
     * @param {Object} itemSession - session information containing the list of feedbacks to display
     * @returns {Array} renderingFeedbacks - feedbacks to be displayed
     */
    var getFeedbacks = function getFeedbacks(item, itemSession) {

        var messages = {};
        var $itemContainer = item.getContainer();
        var $itemBody = $('.qti-itemBody', $itemContainer);
        var interactionsDisplayInfo = getInteractionsDisplayInfo(item);
        var renderingQueue = [];

        _.forEach(item.modalFeedbacks, function (feedback) {

            var feedbackIds, message, $container, comparedOutcome, _currentMessageGroupId, interactionInfo;
            var outcomeIdentifier = feedback.attr('outcomeIdentifier');
            var order = -1;

            //verify if the feedback should be displayed
            if (itemSession[outcomeIdentifier]) {

                //is the feedback in the list of feedbacks to be displayed ?
                feedbackIds = pci.getRawValues(itemSession[outcomeIdentifier]);
                if (!_.contains(feedbackIds, feedback.id())) {
                    return true;//continue with next feedback
                }

                //which group of feedbacks (interaction related) the feedback belongs to ?
                message = getFeedbackMessageSignature(feedback);
                comparedOutcome = containerHelper.getEncodedData(feedback, 'relatedOutcome');
                interactionInfo = _.find(interactionsDisplayInfo, {responseIdentifier: comparedOutcome});
                if (comparedOutcome && interactionInfo) {
                    $container = interactionInfo.displayContainer;
                    _currentMessageGroupId = interactionInfo.messageGroupId;
                    order = interactionInfo.order;
                } else {
                    $container = $itemBody;
                    _currentMessageGroupId = '__item__';
                }
                //is this message already displayed ?
                if (!messages[_currentMessageGroupId]) {
                    messages[_currentMessageGroupId] = [];
                }

                if (_.contains(messages[_currentMessageGroupId], message)) {
                    return true; //continue
                } else {
                    messages[_currentMessageGroupId].push(message);
                }

                //ok, display feedback
                renderingQueue.push({
                    feedback: feedback,
                    $container: $container,
                    order: order
                });
            }
        });

        renderingQueue = _.sortBy(renderingQueue, 'order');

        return renderingQueue;
    };

    /**
     * Provide helper function for collecting feedbacks
     */
    return {
        getFeedbacks : getFeedbacks
    };

});
