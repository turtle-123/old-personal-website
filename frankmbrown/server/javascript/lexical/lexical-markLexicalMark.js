"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMarkNodes = exports.MarkNode = exports.$wrapSelectionInMarkNode = exports.$unwrapMarkNode = exports.$isMarkNode = exports.$handleMarkNodes = exports.$getMarkIDs = exports.$createMarkNode = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CURRENT_VERSION = 1;
/** @noInheritDoc */
class MarkNode extends lexicalLexical_js_1.ElementNode {
    static getType() {
        return 'mark';
    }
    static clone(node) {
        return new MarkNode(Array.from(node.__ids), node.__key, node.__markClass);
    }
    static importDOM() {
        return null;
    }
    static importJSON(serializedNode) {
        const node = $createMarkNode(serializedNode.ids, serializedNode.markClass);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            ids: this.getIDs(),
            type: 'mark',
            version: CURRENT_VERSION,
            markClass: this.getMarkClass()
        };
    }
    constructor(ids, key, markClass) {
        super(key);
        /** @internal */
        this.__markClass = 'normal';
        this.__version = CURRENT_VERSION;
        this.__markClass = markClass ? markClass : 'normal';
        this.__ids = ids || [];
    }
    createDOM(config) {
        const element = document.createElement('mark');
        (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, config.theme.mark);
        if (this.__ids.length > 1) {
            (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, config.theme.markOverlap);
        }
        (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, this.__markClass);
        element.setAttribute("data-v", String(CURRENT_VERSION));
        if (this.getFirstElement())
            element.classList.add('first-rte-element');
        if (this.getLastElement())
            element.classList.add('last-rte-element');
        return element;
    }
    updateDOM(prevNode, element, config) {
        const prevIDs = prevNode.__ids;
        const nextIDs = this.__ids;
        const prevIDsCount = prevIDs.length;
        const nextIDsCount = nextIDs.length;
        const overlapTheme = config.theme.markOverlap;
        if (prevIDsCount !== nextIDsCount) {
            if (prevIDsCount === 1) {
                if (nextIDsCount === 2) {
                    (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, overlapTheme);
                }
            }
            else if (nextIDsCount === 1) {
                (0, lexical_utilsLexicalUtils_js_1.removeClassNamesFromElement)(element, overlapTheme);
            }
        }
        return false;
    }
    hasID(id) {
        const ids = this.getIDs();
        for (let i = 0; i < ids.length; i++) {
            if (id === ids[i]) {
                return true;
            }
        }
        return false;
    }
    getIDs() {
        const self = this.getLatest();
        return $isMarkNode(self) ? self.__ids : [];
    }
    addID(id) {
        const self = this.getWritable();
        if ($isMarkNode(self)) {
            const ids = self.__ids;
            self.__ids = ids;
            for (let i = 0; i < ids.length; i++) {
                // If we already have it, don't add again
                if (id === ids[i])
                    return;
            }
            ids.push(id);
        }
    }
    deleteID(id) {
        const self = this.getWritable();
        if ($isMarkNode(self)) {
            const ids = self.__ids;
            self.__ids = ids;
            for (let i = 0; i < ids.length; i++) {
                if (id === ids[i]) {
                    ids.splice(i, 1);
                    return;
                }
            }
        }
    }
    insertNewAfter(selection, restoreSelection = true) {
        const element = this.getParentOrThrow().insertNewAfter(selection, restoreSelection);
        if ((0, lexicalLexical_js_1.$isElementNode)(element)) {
            const markNode = $createMarkNode(this.__ids, this.__markClass);
            element.append(markNode);
            return markNode;
        }
        return null;
    }
    canInsertTextBefore() {
        return false;
    }
    canInsertTextAfter() {
        return false;
    }
    canBeEmpty() {
        return false;
    }
    isInline() {
        return true;
    }
    extractWithChild(child, selection, destination) {
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection) || destination === 'html') {
            return false;
        }
        const anchor = selection.anchor;
        const focus = selection.focus;
        const anchorNode = anchor.getNode();
        const focusNode = focus.getNode();
        const isBackward = selection.isBackward();
        const selectionLength = isBackward ? anchor.offset - focus.offset : focus.offset - anchor.offset;
        return this.isParentOf(anchorNode) && this.isParentOf(focusNode) && this.getTextContent().length === selectionLength;
    }
    excludeFromCopy(destination) {
        return destination !== 'clone';
    }
    getMarkClass() {
        const self = this.getLatest();
        return self.__markClass;
    }
    setMarkClass(input) {
        const self = this.getWritable();
        self.__markClass = input;
        return this;
    }
}
exports.MarkNode = MarkNode;
function $createMarkNode(ids, nodeClass) {
    return (0, lexicalLexical_js_1.$applyNodeReplacement)(new MarkNode(ids, undefined, nodeClass ? nodeClass : 'normal'));
}
exports.$createMarkNode = $createMarkNode;
function $isMarkNode(node) {
    return node instanceof MarkNode;
}
exports.$isMarkNode = $isMarkNode;
/** @module @lexical/mark */
const getMarkId = () => 'mark_'.concat(Math.random().toString().slice(2));
/**
 * I think this function removes the mark node from the dom while keeping the inner content in tact
 * @param node {MarkNode}
 */
function $unwrapMarkNode(node) {
    const children = node.getChildren();
    let target = null;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (target === null) {
            node.insertBefore(child);
        }
        else {
            target.insertAfter(child);
        }
        target = child;
    }
    node.remove();
}
exports.$unwrapMarkNode = $unwrapMarkNode;
function $wrapSelectionInMarkNode(selection, isBackward, id, markClass, createNode) {
    const nodes = selection.getNodes();
    const anchorOffset = selection.anchor.offset;
    const focusOffset = selection.focus.offset;
    const nodesLength = nodes.length;
    const startOffset = isBackward ? focusOffset : anchorOffset;
    const endOffset = isBackward ? anchorOffset : focusOffset;
    let currentNodeParent;
    let lastCreatedMarkNode;
    // We only want wrap adjacent text nodes, line break nodes
    // and inline element nodes. For decorator nodes and block
    // element nodes, we step out of their boundary and start
    // again after, if there are more nodes.
    for (let i = 0; i < nodesLength; i++) {
        const node = nodes[i];
        if ((0, lexicalLexical_js_1.$isElementNode)(lastCreatedMarkNode) && lastCreatedMarkNode.isParentOf(node)) {
            // If the current node is a child of the last created mark node, there is nothing to do here
            continue;
        }
        const isFirstNode = i === 0;
        const isLastNode = i === nodesLength - 1;
        let targetNode = null;
        if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
            // Case 1: The node is a text node and we can split it
            const textContentSize = node.getTextContentSize();
            const startTextOffset = isFirstNode ? startOffset : 0;
            const endTextOffset = isLastNode ? endOffset : textContentSize;
            if (startTextOffset === 0 && endTextOffset === 0) {
                continue;
            }
            const splitNodes = node.splitText(startTextOffset, endTextOffset);
            targetNode = splitNodes.length > 1 && (splitNodes.length === 3 || isFirstNode && !isLastNode || endTextOffset === textContentSize) ? splitNodes[1] : splitNodes[0];
        }
        else if ($isMarkNode(node)) {
            // Case 2: the node is a mark node and we can ignore it as a target,
            // moving on to its children. Note that when we make a mark inside
            // another mark, it may utlimately be unnested by a call to
            // `registerNestedElementResolver<MarkNode>` somewhere else in the
            // codebase.
            continue;
        }
        else if ((0, lexicalLexical_js_1.$isElementNode)(node) && node.isInline()) {
            // Case 3: inline element nodes can be added in their entirety to the new
            // mark
            targetNode = node;
        }
        if (targetNode !== null) {
            // Now that we have a target node for wrapping with a mark, we can run
            // through special cases.
            if (targetNode && targetNode.is(currentNodeParent)) {
                // The current node is a child of the target node to be wrapped, there
                // is nothing to do here.
                continue;
            }
            const parentNode = targetNode.getParent();
            if (parentNode == null || !parentNode.is(currentNodeParent)) {
                // If the parent node is not the current node's parent node, we can
                // clear the last created mark node.
                lastCreatedMarkNode = undefined;
            }
            currentNodeParent = parentNode;
            if (lastCreatedMarkNode === undefined) {
                // If we don't have a created mark node, we can make one
                const createMarkNode = createNode || $createMarkNode;
                lastCreatedMarkNode = createMarkNode([id], markClass);
                targetNode.insertBefore(lastCreatedMarkNode);
            }
            // Add the target node to be wrapped in the latest created mark node
            lastCreatedMarkNode.append(targetNode);
        }
        else {
            // If we don't have a target node to wrap we can clear our state and
            // continue on with the next node
            currentNodeParent = undefined;
            lastCreatedMarkNode = undefined;
        }
    }
    // Make selection collapsed at the end
    if ((0, lexicalLexical_js_1.$isElementNode)(lastCreatedMarkNode)) {
        // eslint-disable-next-line no-unused-expressions
        isBackward ? lastCreatedMarkNode.selectStart() : lastCreatedMarkNode.selectEnd();
    }
}
exports.$wrapSelectionInMarkNode = $wrapSelectionInMarkNode;
function $getMarkIDs(node, offset) {
    let currentNode = node;
    while (currentNode !== null) {
        if ($isMarkNode(currentNode)) {
            return currentNode.getIDs();
        }
        else if ((0, lexicalLexical_js_1.$isTextNode)(currentNode) && offset === currentNode.getTextContentSize()) {
            const nextSibling = currentNode.getNextSibling();
            if ($isMarkNode(nextSibling)) {
                return nextSibling.getIDs();
            }
        }
        currentNode = currentNode.getParent();
    }
    return null;
}
exports.$getMarkIDs = $getMarkIDs;
function $removeMarkNodesInSelection(selection) {
    const nodes = selection.getNodes();
    for (let node of nodes) {
        var MARK_NODE;
        if ($isMarkNode(node)) {
            MARK_NODE = node;
        }
        else if ($isMarkNode(node.getParent())) {
            MARK_NODE = node.getParent();
        }
        if (MARK_NODE)
            $unwrapMarkNode(MARK_NODE);
        const descendants = (0, lexical_utilsLexicalUtils_js_1.$dfs)(node);
        for (let descendant of descendants) {
            if ($isMarkNode(descendant.node)) {
                $unwrapMarkNode(descendant.node.getWritable());
            }
        }
    }
}
/**
 * Function to call when the fieldset for selecting the mark node type / removing mark node changes
 * @param param0
 * @returns
 */
function $handleMarkNodes({ selection, type }) {
    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
        const IS_COLLAPSED = selection.isCollapsed();
        if (IS_COLLAPSED) {
            const nodes = selection.getNodes();
            if (nodes.length) {
                const markNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(nodes[0], node => $isMarkNode(node));
                if (markNode) {
                    $unwrapMarkNode(markNode);
                }
            }
        }
        else {
            if (type === 'none') {
                $removeMarkNodesInSelection(selection);
            }
            else {
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    $wrapSelectionInMarkNode(selection, selection.isBackward(), getMarkId(), type);
                }
            }
        }
    }
}
exports.$handleMarkNodes = $handleMarkNodes;
const ALLOWED_MARKS = new Set(['none', 'normal', 'primary', 'secondary', 'error', 'info', 'success', 'warning']);
function getHandleInsertMarkNode(editor) {
    /**
     *
     * @param {Event} e Change Event that is intercepted by the fieldset
     * @this {HTMLFieldsetElement}
     */
    const handleInsertMarkNode = function (e) {
        var _a;
        const val = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.value;
        if (ALLOWED_MARKS.has(val)) {
            editor.update(() => {
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    $handleMarkNodes({
                        selection,
                        type: val
                    });
                }
            });
        }
    };
    return handleInsertMarkNode;
}
/**
 * Registering nested element resolver for mark nodes so they are not nested within each other
 * as see [here](https://github.com/facebook/lexical/blob/dcff8ae5afb7c0c2f4c157d209f3a1f2f108fe73/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx#L827C7-L837C18)
 *
 * @param editor
 */
function registerMarkNodes(editor) {
    var _a;
    if (editor.hasNode(MarkNode)) {
        const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
        if (wrapper) {
            // Handle with registerMarkNodes
            const highlight_input = wrapper.querySelector('fieldset[data-lexical-highlight]');
            if (highlight_input)
                highlight_input.addEventListener('change', getHandleInsertMarkNode(editor));
        }
        return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)((0, lexical_utilsLexicalUtils_js_1.registerNestedElementResolver)(editor, MarkNode, from => $createMarkNode(from.getIDs()), (from, to) => {
            const ids = from.getIDs();
            ids.forEach(id => {
                to.addID(id);
            });
        }));
    }
    else {
        console.error("Editor does not have MarkNode registered.");
    }
    return () => {
        return;
    };
}
exports.registerMarkNodes = registerMarkNodes;
