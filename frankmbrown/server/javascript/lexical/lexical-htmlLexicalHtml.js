"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$generateNodesFromDOM = exports.$generateHtmlFromNodes = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexical_selectionLexicalSelection_js_1 = require("./lexical-selectionLexicalSelection.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexicalLexical_js_1 = require("./lexicalLexical.js");
/** @module @lexical/html */
/**
 * How you parse your html string to get a document is left up to you. In the browser you can use the native
 * DOMParser API to generate a document (see clipboard.ts), but to use in a headless environment you can use JSDom
 * or an equivilant library and pass in the document here.
 */
function $generateNodesFromDOM(editor, dom) {
    const elements = dom.body ? dom.body.childNodes : [];
    let lexicalNodes = [];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!IGNORE_TAGS.has(element.nodeName)) {
            const lexicalNode = $createNodesFromDOM(element, editor);
            if (lexicalNode !== null) {
                lexicalNodes = lexicalNodes.concat(lexicalNode);
            }
        }
    }
    return lexicalNodes;
}
exports.$generateNodesFromDOM = $generateNodesFromDOM;
function $generateHtmlFromNodes(editor, selection) {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        throw new Error('To use $generateHtmlFromNodes in headless mode please initialize a headless browser implementation such as JSDom before calling this function.');
    }
    const container = document.createElement('div');
    const root = (0, lexicalLexical_js_1.$getRoot)();
    const topLevelChildren = root.getChildren();
    for (let i = 0; i < topLevelChildren.length; i++) {
        const topLevelNode = topLevelChildren[i];
        $appendNodesToHTML(editor, topLevelNode, container, selection);
    }
    return container.innerHTML;
}
exports.$generateHtmlFromNodes = $generateHtmlFromNodes;
function $appendNodesToHTML(editor, currentNode, parentElement, selection = null) {
    let shouldInclude = selection != null ? currentNode.isSelected(selection) : true;
    const shouldExclude = (0, lexicalLexical_js_1.$isElementNode)(currentNode) && currentNode.excludeFromCopy('html');
    let target = currentNode;
    if (selection !== null) {
        let clone = (0, lexical_selectionLexicalSelection_js_1.$cloneWithProperties)(currentNode);
        clone = (0, lexicalLexical_js_1.$isTextNode)(clone) && selection != null ? (0, lexical_selectionLexicalSelection_js_1.$sliceSelectedTextNodeContent)(selection, clone) : clone;
        target = clone;
    }
    const children = (0, lexicalLexical_js_1.$isElementNode)(target) ? target.getChildren() : [];
    const registeredNode = editor._nodes.get(target.getType());
    let exportOutput;
    // Use HTMLConfig overrides, if available.
    if (registeredNode && registeredNode.exportDOM !== undefined) {
        exportOutput = registeredNode.exportDOM(editor, target);
    }
    else {
        exportOutput = target.exportDOM(editor);
    }
    const { element, after } = exportOutput;
    if (!element) {
        return false;
    }
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < children.length; i++) {
        const childNode = children[i];
        const shouldIncludeChild = $appendNodesToHTML(editor, childNode, fragment, selection);
        if (!shouldInclude && (0, lexicalLexical_js_1.$isElementNode)(currentNode) && shouldIncludeChild && currentNode.extractWithChild(childNode, selection, 'html')) {
            shouldInclude = true;
        }
    }
    if (shouldInclude && !shouldExclude) {
        if ((0, lexical_utilsLexicalUtils_js_1.isHTMLElement)(element)) {
            element.append(fragment);
        }
        parentElement.append(element);
        if (after) {
            const newElement = after.call(target, element);
            if (newElement)
                element.replaceWith(newElement);
        }
    }
    else {
        parentElement.append(fragment);
    }
    return shouldInclude;
}
function getConversionFunction(domNode, editor) {
    const { nodeName } = domNode;
    const cachedConversions = editor._htmlConversions.get(nodeName.toLowerCase());
    let currentConversion = null;
    if (cachedConversions !== undefined) {
        for (const cachedConversion of cachedConversions) {
            const domConversion = cachedConversion(domNode);
            if (domConversion !== null && (currentConversion === null || currentConversion.priority < domConversion.priority)) {
                currentConversion = domConversion;
            }
        }
    }
    return currentConversion !== null ? currentConversion.conversion : null;
}
const IGNORE_TAGS = new Set(['STYLE', 'SCRIPT']);
function $createNodesFromDOM(node, editor, forChildMap = new Map(), parentLexicalNode) {
    let lexicalNodes = [];
    if (IGNORE_TAGS.has(node.nodeName)) {
        return lexicalNodes;
    }
    let currentLexicalNode = null;
    const transformFunction = getConversionFunction(node, editor);
    const transformOutput = transformFunction ? transformFunction(node) : null;
    let postTransform = null;
    if (transformOutput !== null) {
        postTransform = transformOutput.after;
        const transformNodes = transformOutput.node;
        currentLexicalNode = Array.isArray(transformNodes) ? transformNodes[transformNodes.length - 1] : transformNodes;
        if (currentLexicalNode !== null) {
            for (const [, forChildFunction] of forChildMap) {
                currentLexicalNode = forChildFunction(currentLexicalNode, parentLexicalNode);
                if (!currentLexicalNode) {
                    break;
                }
            }
            if (currentLexicalNode) {
                lexicalNodes.push(...(Array.isArray(transformNodes) ? transformNodes : [currentLexicalNode]));
            }
        }
        if (transformOutput.forChild != null) {
            forChildMap.set(node.nodeName, transformOutput.forChild);
        }
    }
    // If the DOM node doesn't have a transformer, we don't know what
    // to do with it but we still need to process any childNodes.
    const children = node.childNodes;
    let childLexicalNodes = [];
    for (let i = 0; i < children.length; i++) {
        childLexicalNodes.push(...$createNodesFromDOM(children[i], editor, new Map(forChildMap), currentLexicalNode));
    }
    if (postTransform != null) {
        childLexicalNodes = postTransform(childLexicalNodes);
    }
    if (currentLexicalNode == null) {
        // If it hasn't been converted to a LexicalNode, we hoist its children
        // up to the same level as it.
        lexicalNodes = lexicalNodes.concat(childLexicalNodes);
    }
    else {
        if ((0, lexicalLexical_js_1.$isElementNode)(currentLexicalNode)) {
            // If the current node is a ElementNode after conversion,
            // we can append all the children to it.
            currentLexicalNode.append(...childLexicalNodes);
        }
    }
    return lexicalNodes;
}
