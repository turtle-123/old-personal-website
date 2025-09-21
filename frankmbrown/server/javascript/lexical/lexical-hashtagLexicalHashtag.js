"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagNode = exports.$isHashtagNode = exports.$createHashtagNode = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexicalLexical_js_1 = require("./lexicalLexical.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CURRENT_VERSION = 1;
/** @noInheritDoc */
class HashtagNode extends lexicalLexical_js_1.TextNode {
    static getType() {
        return 'hashtag';
    }
    static clone(node) {
        return new HashtagNode(node.__text, node.__key);
    }
    constructor(text, key) {
        super(text, key);
        this.__version = CURRENT_VERSION;
    }
    createDOM(config) {
        const element = super.createDOM(config);
        (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, config.theme.hashtag);
        element.setAttribute("data-v", String(CURRENT_VERSION));
        if (this.getFirstElement())
            element.classList.add('first-rte-element');
        if (this.getLastElement())
            element.classList.add('last-rte-element');
        return element;
    }
    static importJSON(serializedNode) {
        const node = $createHashtagNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'hashtag',
            version: CURRENT_VERSION
        };
    }
    canInsertTextBefore() {
        return false;
    }
    isTextEntity() {
        return true;
    }
}
exports.HashtagNode = HashtagNode;
/**
 * Generates a HashtagNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the HashtagNode.
 * @returns - The HashtagNode with the embedded text.
 */
function $createHashtagNode(text = '') {
    return (0, lexicalLexical_js_1.$applyNodeReplacement)(new HashtagNode(text));
}
exports.$createHashtagNode = $createHashtagNode;
/**
 * Determines if node is a HashtagNode.
 * @param node - The node to be checked.
 * @returns true if node is a HashtagNode, false otherwise.
 */
function $isHashtagNode(node) {
    return node instanceof HashtagNode;
}
exports.$isHashtagNode = $isHashtagNode;
