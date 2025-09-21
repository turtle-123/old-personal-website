"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHistoryCustomEditable = exports.registerHistory = exports.createEmptyHistoryState = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
const lexical_toolbarLexicalToolbar_js_1 = require("./lexical-toolbarLexicalToolbar.js");
/**
 * The number of ms to set the history state for [lexical/history](https://github.com/facebook/lexical/blob/main/packages/lexical-history/src/index.ts#L389)
 * Set to 1000 [because it was in the React plugin](https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/shared/useHistory.ts#L18)
 */
const HISTORY_DELAY = 1000;
function registerHistoryCustomEditable(editor) {
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.CAN_REDO_COMMAND, bool => {
        const CONTENT_EDITABLE = editor.getRootElement();
        if (!!!CONTENT_EDITABLE)
            return false;
        const wrapper = CONTENT_EDITABLE.closest('div.lexical-wrapper');
        if (!!!wrapper)
            return false;
        const button = (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'REDO_COMMAND', undefined);
        if (button) {
            if (bool)
                (0, lexical_sharedLexicalShared_js_1.removeDisabledButton)(button);
            else
                (0, lexical_sharedLexicalShared_js_1.disableButton)(button);
        }
        editor.dispatchCommand(lexical_toolbarLexicalToolbar_js_1.UPDATE_TOOLBAR_COMMAND, undefined);
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexicalLexical_js_1.CAN_UNDO_COMMAND, bool => {
        const CONTENT_EDITABLE = editor.getRootElement();
        if (!!!CONTENT_EDITABLE)
            return false;
        const wrapper = CONTENT_EDITABLE.closest('div.lexical-wrapper');
        if (!!!wrapper)
            return false;
        const button = (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'UNDO_COMMAND', undefined);
        if (button) {
            if (bool)
                (0, lexical_sharedLexicalShared_js_1.removeDisabledButton)(button);
            else
                (0, lexical_sharedLexicalShared_js_1.disableButton)(button);
        }
        editor.dispatchCommand(lexical_toolbarLexicalToolbar_js_1.UPDATE_TOOLBAR_COMMAND, undefined);
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_LOW), registerHistory(editor, createEmptyHistoryState(), HISTORY_DELAY));
}
exports.registerHistoryCustomEditable = registerHistoryCustomEditable;
/** @module @lexical/history */
const HISTORY_MERGE = 0;
const HISTORY_PUSH = 1;
const DISCARD_HISTORY_CANDIDATE = 2;
const OTHER = 0;
const COMPOSING_CHARACTER = 1;
const INSERT_CHARACTER_AFTER_SELECTION = 2;
const DELETE_CHARACTER_BEFORE_SELECTION = 3;
const DELETE_CHARACTER_AFTER_SELECTION = 4;
function getDirtyNodes(editorState, dirtyLeaves, dirtyElements) {
    const nodeMap = editorState._nodeMap;
    const nodes = [];
    for (const dirtyLeafKey of dirtyLeaves) {
        const dirtyLeaf = nodeMap.get(dirtyLeafKey);
        if (dirtyLeaf !== undefined) {
            nodes.push(dirtyLeaf);
        }
    }
    for (const [dirtyElementKey, intentionallyMarkedAsDirty] of dirtyElements) {
        if (!intentionallyMarkedAsDirty) {
            continue;
        }
        const dirtyElement = nodeMap.get(dirtyElementKey);
        if (dirtyElement !== undefined && !(0, lexicalLexical_js_1.$isRootNode)(dirtyElement)) {
            nodes.push(dirtyElement);
        }
    }
    return nodes;
}
function getChangeType(prevEditorState, nextEditorState, dirtyLeavesSet, dirtyElementsSet, isComposing) {
    if (prevEditorState === null || dirtyLeavesSet.size === 0 && dirtyElementsSet.size === 0 && !isComposing) {
        return OTHER;
    }
    const nextSelection = nextEditorState._selection;
    const prevSelection = prevEditorState._selection;
    if (isComposing) {
        return COMPOSING_CHARACTER;
    }
    if (!(0, lexicalLexical_js_1.$isRangeSelection)(nextSelection) || !(0, lexicalLexical_js_1.$isRangeSelection)(prevSelection) || !prevSelection.isCollapsed() || !nextSelection.isCollapsed()) {
        return OTHER;
    }
    const dirtyNodes = getDirtyNodes(nextEditorState, dirtyLeavesSet, dirtyElementsSet);
    if (dirtyNodes.length === 0) {
        return OTHER;
    }
    // Catching the case when inserting new text node into an element (e.g. first char in paragraph/list),
    // or after existing node.
    if (dirtyNodes.length > 1) {
        const nextNodeMap = nextEditorState._nodeMap;
        const nextAnchorNode = nextNodeMap.get(nextSelection.anchor.key);
        const prevAnchorNode = nextNodeMap.get(prevSelection.anchor.key);
        if (nextAnchorNode && prevAnchorNode && !prevEditorState._nodeMap.has(nextAnchorNode.__key) && (0, lexicalLexical_js_1.$isTextNode)(nextAnchorNode) && nextAnchorNode.__text.length === 1 && nextSelection.anchor.offset === 1) {
            return INSERT_CHARACTER_AFTER_SELECTION;
        }
        return OTHER;
    }
    const nextDirtyNode = dirtyNodes[0];
    const prevDirtyNode = prevEditorState._nodeMap.get(nextDirtyNode.__key);
    if (!(0, lexicalLexical_js_1.$isTextNode)(prevDirtyNode) || !(0, lexicalLexical_js_1.$isTextNode)(nextDirtyNode) || prevDirtyNode.__mode !== nextDirtyNode.__mode) {
        return OTHER;
    }
    const prevText = prevDirtyNode.__text;
    const nextText = nextDirtyNode.__text;
    if (prevText === nextText) {
        return OTHER;
    }
    const nextAnchor = nextSelection.anchor;
    const prevAnchor = prevSelection.anchor;
    if (nextAnchor.key !== prevAnchor.key || nextAnchor.type !== 'text') {
        return OTHER;
    }
    const nextAnchorOffset = nextAnchor.offset;
    const prevAnchorOffset = prevAnchor.offset;
    const textDiff = nextText.length - prevText.length;
    if (textDiff === 1 && prevAnchorOffset === nextAnchorOffset - 1) {
        return INSERT_CHARACTER_AFTER_SELECTION;
    }
    if (textDiff === -1 && prevAnchorOffset === nextAnchorOffset + 1) {
        return DELETE_CHARACTER_BEFORE_SELECTION;
    }
    if (textDiff === -1 && prevAnchorOffset === nextAnchorOffset) {
        return DELETE_CHARACTER_AFTER_SELECTION;
    }
    return OTHER;
}
function isTextNodeUnchanged(key, prevEditorState, nextEditorState) {
    const prevNode = prevEditorState._nodeMap.get(key);
    const nextNode = nextEditorState._nodeMap.get(key);
    const prevSelection = prevEditorState._selection;
    const nextSelection = nextEditorState._selection;
    let isDeletingLine = false;
    if ((0, lexicalLexical_js_1.$isRangeSelection)(prevSelection) && (0, lexicalLexical_js_1.$isRangeSelection)(nextSelection)) {
        isDeletingLine = prevSelection.anchor.type === 'element' && prevSelection.focus.type === 'element' && nextSelection.anchor.type === 'text' && nextSelection.focus.type === 'text';
    }
    if (!isDeletingLine && (0, lexicalLexical_js_1.$isTextNode)(prevNode) && (0, lexicalLexical_js_1.$isTextNode)(nextNode)) {
        return prevNode.__type === nextNode.__type && prevNode.__text === nextNode.__text && prevNode.__mode === nextNode.__mode && prevNode.__detail === nextNode.__detail && prevNode.__style === nextNode.__style && prevNode.__format === nextNode.__format && prevNode.__parent === nextNode.__parent;
    }
    return false;
}
function createMergeActionGetter(editor, delay) {
    let prevChangeTime = Date.now();
    let prevChangeType = OTHER;
    return (prevEditorState, nextEditorState, currentHistoryEntry, dirtyLeaves, dirtyElements, tags) => {
        const changeTime = Date.now();
        // If applying changes from history stack there's no need
        // to run history logic again, as history entries already calculated
        if (tags.has('historic')) {
            prevChangeType = OTHER;
            prevChangeTime = changeTime;
            return DISCARD_HISTORY_CANDIDATE;
        }
        const changeType = getChangeType(prevEditorState, nextEditorState, dirtyLeaves, dirtyElements, editor.isComposing());
        const mergeAction = (() => {
            const isSameEditor = currentHistoryEntry === null || currentHistoryEntry.editor === editor;
            const shouldPushHistory = tags.has('history-push');
            const shouldMergeHistory = !shouldPushHistory && isSameEditor && tags.has('history-merge');
            if (shouldMergeHistory) {
                return HISTORY_MERGE;
            }
            if (prevEditorState === null) {
                return HISTORY_PUSH;
            }
            const selection = nextEditorState._selection;
            const hasDirtyNodes = dirtyLeaves.size > 0 || dirtyElements.size > 0;
            if (!hasDirtyNodes) {
                if (selection !== null) {
                    return HISTORY_MERGE;
                }
                return DISCARD_HISTORY_CANDIDATE;
            }
            if (shouldPushHistory === false && changeType !== OTHER && changeType === prevChangeType && changeTime < prevChangeTime + delay && isSameEditor) {
                return HISTORY_MERGE;
            }
            // A single node might have been marked as dirty, but not have changed
            // due to some node transform reverting the change.
            if (dirtyLeaves.size === 1) {
                const dirtyLeafKey = Array.from(dirtyLeaves)[0];
                if (isTextNodeUnchanged(dirtyLeafKey, prevEditorState, nextEditorState)) {
                    return HISTORY_MERGE;
                }
            }
            return HISTORY_PUSH;
        })();
        prevChangeTime = changeTime;
        prevChangeType = changeType;
        return mergeAction;
    };
}
function redo(editor, historyState) {
    const redoStack = historyState.redoStack;
    const undoStack = historyState.undoStack;
    if (redoStack.length !== 0) {
        const current = historyState.current;
        if (current !== null) {
            undoStack.push(current);
            editor.dispatchCommand(lexicalLexical_js_1.CAN_UNDO_COMMAND, true);
        }
        const historyStateEntry = redoStack.pop();
        if (redoStack.length === 0) {
            editor.dispatchCommand(lexicalLexical_js_1.CAN_REDO_COMMAND, false);
        }
        historyState.current = historyStateEntry || null;
        if (historyStateEntry) {
            historyStateEntry.editor.setEditorState(historyStateEntry.editorState, {
                tag: 'historic'
            });
        }
    }
}
function undo(editor, historyState) {
    const redoStack = historyState.redoStack;
    const undoStack = historyState.undoStack;
    const undoStackLength = undoStack.length;
    if (undoStackLength !== 0) {
        const current = historyState.current;
        const historyStateEntry = undoStack.pop();
        if (current !== null) {
            redoStack.push(current);
            editor.dispatchCommand(lexicalLexical_js_1.CAN_REDO_COMMAND, true);
        }
        if (undoStack.length === 0) {
            editor.dispatchCommand(lexicalLexical_js_1.CAN_UNDO_COMMAND, false);
        }
        historyState.current = historyStateEntry || null;
        if (historyStateEntry) {
            historyStateEntry.editor.setEditorState(historyStateEntry.editorState, {
                tag: 'historic'
            });
        }
    }
}
function clearHistory(historyState) {
    historyState.undoStack = [];
    historyState.redoStack = [];
    historyState.current = null;
}
/**
 * Registers necessary listeners to manage undo/redo history stack and related editor commands.
 * It returns `unregister` callback that cleans up all listeners and should be called on editor unmount.
 * @param editor - The lexical editor.
 * @param historyState - The history state, containing the current state and the undo/redo stack.
 * @param delay - The time (in milliseconds) the editor should delay generating a new history stack,
 * instead of merging the current changes with the current stack.
 * @returns The listeners cleanup callback function.
 */
function registerHistory(editor, historyState, delay) {
    const getMergeAction = createMergeActionGetter(editor, delay);
    const applyChange = ({ editorState, prevEditorState, dirtyLeaves, dirtyElements, tags }) => {
        const current = historyState.current;
        const redoStack = historyState.redoStack;
        const undoStack = historyState.undoStack;
        const currentEditorState = current === null ? null : current.editorState;
        if (current !== null && editorState === currentEditorState) {
            return;
        }
        const mergeAction = getMergeAction(prevEditorState, editorState, current, dirtyLeaves, dirtyElements, tags);
        if (mergeAction === HISTORY_PUSH) {
            if (redoStack.length !== 0) {
                historyState.redoStack = [];
                editor.dispatchCommand(lexicalLexical_js_1.CAN_REDO_COMMAND, false);
            }
            if (current !== null) {
                undoStack.push({
                    ...current
                });
                editor.dispatchCommand(lexicalLexical_js_1.CAN_UNDO_COMMAND, true);
            }
        }
        else if (mergeAction === DISCARD_HISTORY_CANDIDATE) {
            return;
        }
        // Else we merge
        historyState.current = {
            editor,
            editorState
        };
    };
    const unregisterCommandListener = (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.UNDO_COMMAND, () => {
        undo(editor, historyState);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.REDO_COMMAND, () => {
        redo(editor, historyState);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CLEAR_EDITOR_COMMAND, payload => {
        if (payload === true)
            clearHistory(historyState);
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CLEAR_HISTORY_COMMAND, () => {
        clearHistory(historyState);
        editor.dispatchCommand(lexicalLexical_js_1.CAN_REDO_COMMAND, false);
        editor.dispatchCommand(lexicalLexical_js_1.CAN_UNDO_COMMAND, false);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerUpdateListener(applyChange));
    const unregisterUpdateListener = editor.registerUpdateListener(applyChange);
    return () => {
        unregisterCommandListener();
        unregisterUpdateListener();
    };
}
exports.registerHistory = registerHistory;
/**
 * Creates an empty history state.
 * @returns - The empty history state, as an object.
 */
function createEmptyHistoryState() {
    return {
        current: null,
        redoStack: [],
        undoStack: []
    };
}
exports.createEmptyHistoryState = createEmptyHistoryState;
