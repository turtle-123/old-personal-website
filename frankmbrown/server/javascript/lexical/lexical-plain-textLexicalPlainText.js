"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlainText = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexical_clipboardLexicalClipboard_js_1 = require("./lexical-clipboardLexicalClipboard.js");
const lexical_selectionLexicalSelection_js_1 = require("./lexical-selectionLexicalSelection.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexicalLexical_js_1 = require("./lexicalLexical.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CAN_USE_DOM = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const documentMode = CAN_USE_DOM && 'documentMode' in document ? document.documentMode : null;
CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
CAN_USE_DOM && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);
const CAN_USE_BEFORE_INPUT = CAN_USE_DOM && 'InputEvent' in window && !documentMode ? 'getTargetRanges' in new window.InputEvent('input') : false;
const IS_SAFARI = CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
const IS_IOS = CAN_USE_DOM && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
CAN_USE_DOM && /Android/.test(navigator.userAgent);
// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
const IS_CHROME = CAN_USE_DOM && /^(?=.*Chrome).*/i.test(navigator.userAgent);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;
const IS_APPLE_WEBKIT = CAN_USE_DOM && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && !IS_CHROME;
/** @module @lexical/plain-text */
function onCopyForPlainText(event, editor) {
    editor.update(() => {
        if (event !== null) {
            const clipboardData = event instanceof KeyboardEvent ? null : event.clipboardData;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (selection !== null && clipboardData != null) {
                event.preventDefault();
                const htmlString = (0, lexical_clipboardLexicalClipboard_js_1.$getHtmlContent)(editor);
                if (htmlString !== null) {
                    clipboardData.setData('text/html', htmlString);
                }
                clipboardData.setData('text/plain', selection.getTextContent());
            }
        }
    });
}
function onPasteForPlainText(event, editor) {
    event.preventDefault();
    editor.update(() => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        const { clipboardData } = event;
        if (clipboardData != null && (0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            (0, lexical_clipboardLexicalClipboard_js_1.$insertDataTransferForPlainText)(clipboardData, selection);
        }
    }, {
        tag: 'paste'
    });
}
function onCutForPlainText(event, editor) {
    onCopyForPlainText(event, editor);
    editor.update(() => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            selection.removeText();
        }
    });
}
function registerPlainText(editor) {
    const removeListener = (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.DELETE_CHARACTER_COMMAND, isBackward => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.deleteCharacter(isBackward);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DELETE_WORD_COMMAND, isBackward => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.deleteWord(isBackward);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DELETE_LINE_COMMAND, isBackward => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.deleteLine(isBackward);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CONTROLLED_TEXT_INSERTION_COMMAND, eventOrText => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        if (typeof eventOrText === 'string') {
            selection.insertText(eventOrText);
        }
        else {
            const dataTransfer = eventOrText.dataTransfer;
            if (dataTransfer != null) {
                (0, lexical_clipboardLexicalClipboard_js_1.$insertDataTransferForPlainText)(dataTransfer, selection);
            }
            else {
                const data = eventOrText.data;
                if (data) {
                    selection.insertText(data);
                }
            }
        }
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.REMOVE_TEXT_COMMAND, () => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.removeText();
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.INSERT_LINE_BREAK_COMMAND, selectStart => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.insertLineBreak(selectStart);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.INSERT_PARAGRAPH_COMMAND, () => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        selection.insertLineBreak();
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_LEFT_COMMAND, payload => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        const event = payload;
        const isHoldingShift = event.shiftKey;
        if ((0, lexical_selectionLexicalSelection_js_1.$shouldOverrideDefaultCharacterSelection)(selection, true)) {
            event.preventDefault();
            (0, lexical_selectionLexicalSelection_js_1.$moveCharacter)(selection, isHoldingShift, true);
            return true;
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_RIGHT_COMMAND, payload => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        const event = payload;
        const isHoldingShift = event.shiftKey;
        if ((0, lexical_selectionLexicalSelection_js_1.$shouldOverrideDefaultCharacterSelection)(selection, false)) {
            event.preventDefault();
            (0, lexical_selectionLexicalSelection_js_1.$moveCharacter)(selection, isHoldingShift, false);
            return true;
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_BACKSPACE_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(lexicalLexical_js_1.DELETE_CHARACTER_COMMAND, true);
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_DELETE_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(lexicalLexical_js_1.DELETE_CHARACTER_COMMAND, false);
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ENTER_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        if (event !== null) {
            // If we have beforeinput, then we can avoid blocking
            // the default behavior. This ensures that the iOS can
            // intercept that we're actually inserting a paragraph,
            // and autocomplete, autocapitalize etc work as intended.
            // This can also cause a strange performance issue in
            // Safari, where there is a noticeable pause due to
            // preventing the key down of enter.
            if ((IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) && CAN_USE_BEFORE_INPUT) {
                return false;
            }
            event.preventDefault();
        }
        return editor.dispatchCommand(lexicalLexical_js_1.INSERT_LINE_BREAK_COMMAND, false);
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.SELECT_ALL_COMMAND, () => {
        (0, lexicalLexical_js_1.$selectAll)();
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.COPY_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        onCopyForPlainText(event, editor);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CUT_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        onCutForPlainText(event, editor);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.PASTE_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        onPasteForPlainText(event, editor);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DROP_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DRAGSTART_COMMAND, event => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            return false;
        }
        // TODO: Make drag and drop work at some point.
        event.preventDefault();
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    return removeListener;
}
exports.registerPlainText = registerPlainText;
