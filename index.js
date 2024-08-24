import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings, renderExtensionTemplate } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getContext } from "../../../extensions.js";
import { power_user } from '../../../power-user.js';


const MODULE_NAME = 'SillyTavern-CacheChunker';

const settings = {
    enabled: true,
    chunkSize: 10,
    maxMessageHistoryContext: 2000,
};

/**
 * Removes messages from the chat array in chunks of N messages until the max context length is reached, improving
 * cache utilization.
 * @param {object[]} chat Array of chat messages
 */
function trimContext(chat) {
    if (!settings.enabled) {
        return;
    }

    console.debug('Trimming context, message count before:', chat.length);
    const cutPoint = getCuttingPoint(chat, settings.maxMessageHistoryContext, settings.chunkSize);
    console.debug('Cut messages up to:', cutPoint);
    chat.splice(0, cutPoint);
    console.debug('Trimming context; message count / context length are now: ' + chat.length + " / " + getTokenCount(renderChat(chat)));
}

function renderChat(chat) {
    return chat.map((message) => {
        const messagePrefix = message.is_user ? power_user.instruct.input_sequence : power_user.instruct.output_sequence ?? '';
        const messagePostfix = message.is_user ? power_user.instruct.input_suffix : power_user.instruct.output_suffix ?? '';
        const formattedMessage = messagePrefix + message.name + ": " + message.mes + messagePostfix;
        return formattedMessage;
    }).join("");
}

/**
 * Get the index up to which messages in the chat array have to be cut
 * @param {object[]} chat Array of chat messages
 * @param {number} maxTokens Maximum number of tokens to allow in the chat array
 * @param {number} chunkSize Number of messages to remove at a time
 * @returns {number} Index of the point for the chunking process
 */
function getCuttingPoint(chat, maxTokens, chunkSize) {
    const totalTokens = getTokenCount(renderChat(chat));

    const contextPercentageToKeep = (maxTokens / totalTokens);
    if (contextPercentageToKeep > 1) {
        return 0;
    }

    const indicesToKeep = Math.floor(chat.length * contextPercentageToKeep);
    const indexToDeleteUpTo = chat.length - indicesToKeep;

    const chunkedIndexToDeleteUpTo = indexToDeleteUpTo - (indexToDeleteUpTo % chunkSize) + chunkSize;
    console.debug("Cache circa filled: " + indexToDeleteUpTo % chunkSize + ' out of ' + chunkSize)
    return chunkedIndexToDeleteUpTo + 1;
}

window['CacheChunker_trimContext'] = trimContext;

jQuery(async () => {
    if (!extension_settings.cache_chunker) {
        extension_settings.cache_chunker = settings;
    }

    Object.assign(settings, extension_settings.cache_chunker);

    $('#extensions_settings2').append(renderExtensionTemplate('third-party/' + MODULE_NAME, 'settings'));

    $('#cache_chunker_enabled').prop('checked', settings.enabled).on('input', () => {
        settings.enabled = !!$('#cache_chunker_enabled').prop('checked');
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });

    $('#cache_chunker_chunk_size').val(settings.chunkSize).on('change', () => {
        settings.chunkSize = Number($('#cache_chunker_chunk_size').val());
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });

    $('#cache_chunker_max_message_history_context').val(settings.maxMessageHistoryContext).on('change', () => {
        settings.maxMessageHistoryContext = Number($('#cache_chunker_max_message_history_context').val());
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });
});
