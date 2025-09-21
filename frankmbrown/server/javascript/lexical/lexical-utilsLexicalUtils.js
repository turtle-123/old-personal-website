"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentNodesForToolbarUpdate = exports.removeClassNamesFromElement = exports.registerNestedElementResolver = exports.positionNodeOnRange = exports.objectKlassEquals = exports.mergeRegister = exports.mediaFileReader = exports.markSelection = exports.isMimeType = exports.getElementNodesInSelection = exports.getBlockNodesInSelection = exports.addClassNamesToElement = exports.$wrapNodeInElement = exports.$restoreEditorState = exports.$insertNodeToNearestRoot = exports.$insertFirst = exports.$getNearestNodeOfType = exports.$getNearestBlockElementAncestorOrThrow = exports.$findMatchingParent = exports.$filter = exports.$dfs = exports.isHTMLElement = exports.isHTMLAnchorElement = exports.$splitNode = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexical_selectionLexicalSelection_js_1 = require("./lexical-selectionLexicalSelection.js");
const lexicalLexical_js_1 = require("./lexicalLexical.js");
var lexicalLexical_js_2 = require("./lexicalLexical.js");
Object.defineProperty(exports, "$splitNode", { enumerable: true, get: function () { return lexicalLexical_js_2.$splitNode; } });
Object.defineProperty(exports, "isHTMLAnchorElement", { enumerable: true, get: function () { return lexicalLexical_js_2.isHTMLAnchorElement; } });
Object.defineProperty(exports, "isHTMLElement", { enumerable: true, get: function () { return lexicalLexical_js_2.isHTMLElement; } });
const lexical_decoratorsLexicalDecorators_js_1 = require("./lexical-decoratorsLexicalDecorators.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
/**
 * Returns a function that will execute all functions passed when called. It is generally used
 * to register multiple lexical listeners and then tear them down with a single function call, such
 * as React's useEffect hook.
 * @example
 * ```ts
 * useEffect(() => {
 *   return mergeRegister(
 *     editor.registerCommand(...registerCommand1 logic),
 *     editor.registerCommand(...registerCommand2 logic),
 *     editor.registerCommand(...registerCommand3 logic)
 *   )
 * }, [editor])
 * ```
 * In this case, useEffect is returning the function returned by mergeRegister as a cleanup
 * function to be executed after either the useEffect runs again (due to one of its dependencies
 * updating) or the component it resides in unmounts.
 * Note the functions don't neccesarily need to be in an array as all arguements
 * are considered to be the func argument and spread from there.
 * @param func - An array of functions meant to be executed by the returned function.
 * @returns the function which executes all the passed register command functions.
 */
function mergeRegister(...func) {
    return () => {
        func.forEach(f => f());
    };
}
exports.mergeRegister = mergeRegister;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function px(value) {
    return `${value}px`;
}
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const mutationObserverConfig = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true
};
function positionNodeOnRange(editor, range, onReposition) {
    let rootDOMNode = null;
    let parentDOMNode = null;
    let observer = null;
    let lastNodes = [];
    const wrapperNode = document.createElement('div');
    function position() {
        if (!(rootDOMNode !== null)) {
            throw Error(`Unexpected null rootDOMNode`);
        }
        if (!(parentDOMNode !== null)) {
            throw Error(`Unexpected null parentDOMNode`);
        }
        const { left: rootLeft, top: rootTop } = rootDOMNode.getBoundingClientRect();
        const parentDOMNode_ = parentDOMNode;
        const rects = (0, lexical_selectionLexicalSelection_js_1.createRectsFromDOMRange)(editor, range);
        if (!wrapperNode.isConnected) {
            parentDOMNode_.append(wrapperNode);
        }
        let hasRepositioned = false;
        for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            // Try to reuse the previously created Node when possible, no need to
            // remove/create on the most common case reposition case
            const rectNode = lastNodes[i] || document.createElement('div');
            const rectNodeStyle = rectNode.style;
            if (rectNodeStyle.position !== 'absolute') {
                rectNodeStyle.position = 'absolute';
                hasRepositioned = true;
            }
            const left = px(rect.left - rootLeft);
            if (rectNodeStyle.left !== left) {
                rectNodeStyle.left = left;
                hasRepositioned = true;
            }
            const top = px(rect.top - rootTop);
            if (rectNodeStyle.top !== top) {
                rectNode.style.top = top;
                hasRepositioned = true;
            }
            const width = px(rect.width);
            if (rectNodeStyle.width !== width) {
                rectNode.style.width = width;
                hasRepositioned = true;
            }
            const height = px(rect.height);
            if (rectNodeStyle.height !== height) {
                rectNode.style.height = height;
                hasRepositioned = true;
            }
            if (rectNode.parentNode !== wrapperNode) {
                wrapperNode.append(rectNode);
                hasRepositioned = true;
            }
            lastNodes[i] = rectNode;
        }
        while (lastNodes.length > rects.length) {
            lastNodes.pop();
        }
        if (hasRepositioned) {
            onReposition(lastNodes);
        }
    }
    function stop() {
        parentDOMNode = null;
        rootDOMNode = null;
        if (observer !== null) {
            observer.disconnect();
        }
        observer = null;
        wrapperNode.remove();
        for (const node of lastNodes) {
            node.remove();
        }
        lastNodes = [];
    }
    function restart() {
        const currentRootDOMNode = editor.getRootElement();
        if (currentRootDOMNode === null) {
            return stop();
        }
        const currentParentDOMNode = currentRootDOMNode.parentElement;
        if (!(currentParentDOMNode instanceof HTMLElement)) {
            return stop();
        }
        stop();
        rootDOMNode = currentRootDOMNode;
        parentDOMNode = currentParentDOMNode;
        observer = new MutationObserver(mutations => {
            const nextRootDOMNode = editor.getRootElement();
            const nextParentDOMNode = nextRootDOMNode && nextRootDOMNode.parentElement;
            if (nextRootDOMNode !== rootDOMNode || nextParentDOMNode !== parentDOMNode) {
                return restart();
            }
            for (const mutation of mutations) {
                if (!wrapperNode.contains(mutation.target)) {
                    // TODO throttle
                    return position();
                }
            }
        });
        observer.observe(currentParentDOMNode, mutationObserverConfig);
        position();
    }
    const removeRootListener = editor.registerRootListener(restart);
    return () => {
        removeRootListener();
        stop();
    };
}
exports.positionNodeOnRange = positionNodeOnRange;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function markSelection(editor, onReposition) {
    let previousAnchorNode = null;
    let previousAnchorOffset = null;
    let previousFocusNode = null;
    let previousFocusOffset = null;
    let removeRangeListener = () => { };
    function compute(editorState) {
        editorState.read(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                // TODO
                previousAnchorNode = null;
                previousAnchorOffset = null;
                previousFocusNode = null;
                previousFocusOffset = null;
                removeRangeListener();
                removeRangeListener = () => { };
                return;
            }
            const { anchor, focus } = selection;
            const currentAnchorNode = anchor.getNode();
            const currentAnchorNodeKey = currentAnchorNode.getKey();
            const currentAnchorOffset = anchor.offset;
            const currentFocusNode = focus.getNode();
            const currentFocusNodeKey = currentFocusNode.getKey();
            const currentFocusOffset = focus.offset;
            const currentAnchorNodeDOM = editor.getElementByKey(currentAnchorNodeKey);
            const currentFocusNodeDOM = editor.getElementByKey(currentFocusNodeKey);
            const differentAnchorDOM = previousAnchorNode === null || currentAnchorNodeDOM === null || currentAnchorOffset !== previousAnchorOffset || currentAnchorNodeKey !== previousAnchorNode.getKey() || currentAnchorNode !== previousAnchorNode && (!(previousAnchorNode instanceof lexicalLexical_js_1.TextNode) || currentAnchorNode.updateDOM(previousAnchorNode, currentAnchorNodeDOM, editor._config));
            const differentFocusDOM = previousFocusNode === null || currentFocusNodeDOM === null || currentFocusOffset !== previousFocusOffset || currentFocusNodeKey !== previousFocusNode.getKey() || currentFocusNode !== previousFocusNode && (!(previousFocusNode instanceof lexicalLexical_js_1.TextNode) || currentFocusNode.updateDOM(previousFocusNode, currentFocusNodeDOM, editor._config));
            if (differentAnchorDOM || differentFocusDOM) {
                const anchorHTMLElement = editor.getElementByKey(anchor.getNode().getKey());
                const focusHTMLElement = editor.getElementByKey(focus.getNode().getKey());
                // TODO handle selection beyond the common TextNode
                if (anchorHTMLElement !== null && focusHTMLElement !== null && anchorHTMLElement.tagName === 'SPAN' && focusHTMLElement.tagName === 'SPAN') {
                    const range = document.createRange();
                    let firstHTMLElement;
                    let firstOffset;
                    let lastHTMLElement;
                    let lastOffset;
                    if (focus.isBefore(anchor)) {
                        firstHTMLElement = focusHTMLElement;
                        firstOffset = focus.offset;
                        lastHTMLElement = anchorHTMLElement;
                        lastOffset = anchor.offset;
                    }
                    else {
                        firstHTMLElement = anchorHTMLElement;
                        firstOffset = anchor.offset;
                        lastHTMLElement = focusHTMLElement;
                        lastOffset = focus.offset;
                    }
                    const firstTextNode = firstHTMLElement.firstChild;
                    if (!(firstTextNode !== null)) {
                        throw Error(`Expected text node to be first child of span`);
                    }
                    const lastTextNode = lastHTMLElement.firstChild;
                    if (!(lastTextNode !== null)) {
                        throw Error(`Expected text node to be first child of span`);
                    }
                    range.setStart(firstTextNode, firstOffset);
                    range.setEnd(lastTextNode, lastOffset);
                    removeRangeListener();
                    removeRangeListener = positionNodeOnRange(editor, range, domNodes => {
                        for (const domNode of domNodes) {
                            const domNodeStyle = domNode.style;
                            if (domNodeStyle.background !== 'Highlight') {
                                domNodeStyle.background = 'Highlight';
                            }
                            if (domNodeStyle.color !== 'HighlightText') {
                                domNodeStyle.color = 'HighlightText';
                            }
                            if (domNodeStyle.zIndex !== '-1') {
                                domNodeStyle.zIndex = '-1';
                            }
                            if (domNodeStyle.pointerEvents !== 'none') {
                                domNodeStyle.pointerEvents = 'none';
                            }
                            if (domNodeStyle.marginTop !== px(-1.5)) {
                                domNodeStyle.marginTop = px(-1.5);
                            }
                            if (domNodeStyle.paddingTop !== px(4)) {
                                domNodeStyle.paddingTop = px(4);
                            }
                            if (domNodeStyle.paddingBottom !== px(0)) {
                                domNodeStyle.paddingBottom = px(0);
                            }
                        }
                        if (onReposition !== undefined) {
                            onReposition(domNodes);
                        }
                    });
                }
            }
            previousAnchorNode = currentAnchorNode;
            previousAnchorOffset = currentAnchorOffset;
            previousFocusNode = currentFocusNode;
            previousFocusOffset = currentFocusOffset;
        });
    }
    compute(editor.getEditorState());
    return mergeRegister(editor.registerUpdateListener(({ editorState }) => compute(editorState)), removeRangeListener, () => {
        removeRangeListener();
    });
}
exports.markSelection = markSelection;
/** @module @lexical/utils */
/**
 * Takes an HTML element and adds the classNames passed within an array,
 * ignoring any non-string types. A space can be used to add multiple classes
 * eg. addClassNamesToElement(element, ['element-inner active', true, null])
 * will add both 'element-inner' and 'active' as classes to that element.
 * @param element - The element in which the classes are added
 * @param classNames - An array defining the class names to add to the element
 */
function addClassNamesToElement(element, ...classNames) {
    classNames.forEach(className => {
        if (typeof className === 'string') {
            const classesToAdd = className.split(' ').filter(n => n !== '');
            element.classList.add(...classesToAdd);
        }
    });
}
exports.addClassNamesToElement = addClassNamesToElement;
/**
 * Takes an HTML element and removes the classNames passed within an array,
 * ignoring any non-string types. A space can be used to remove multiple classes
 * eg. removeClassNamesFromElement(element, ['active small', true, null])
 * will remove both the 'active' and 'small' classes from that element.
 * @param element - The element in which the classes are removed
 * @param classNames - An array defining the class names to remove from the element
 */
function removeClassNamesFromElement(element, ...classNames) {
    classNames.forEach(className => {
        if (typeof className === 'string') {
            element.classList.remove(...className.split(' '));
        }
    });
}
exports.removeClassNamesFromElement = removeClassNamesFromElement;
/**
 * Returns true if the file type matches the types passed within the acceptableMimeTypes array, false otherwise.
 * The types passed must be strings and are CASE-SENSITIVE.
 * eg. if file is of type 'text' and acceptableMimeTypes = ['TEXT', 'IMAGE'] the function will return false.
 * @param file - The file you want to type check.
 * @param acceptableMimeTypes - An array of strings of types which the file is checked against.
 * @returns true if the file is an acceptable mime type, false otherwise.
 */
function isMimeType(file, acceptableMimeTypes) {
    for (const acceptableType of acceptableMimeTypes) {
        if (file.type.startsWith(acceptableType)) {
            return true;
        }
    }
    return false;
}
exports.isMimeType = isMimeType;
/**
 * Lexical File Reader with:
 *  1. MIME type support
 *  2. batched results (HistoryPlugin compatibility)
 *  3. Order aware (respects the order when multiple Files are passed)
 *
 * const filesResult = await mediaFileReader(files, ['image/']);
 * filesResult.forEach(file => editor.dispatchCommand('INSERT_IMAGE', {
 *   src: file.result,
 * }));
 */
function mediaFileReader(files, acceptableMimeTypes) {
    const filesIterator = files[Symbol.iterator]();
    return new Promise((resolve, reject) => {
        const processed = [];
        const handleNextFile = () => {
            const { done, value: file } = filesIterator.next();
            if (done) {
                return resolve(processed);
            }
            const fileReader = new FileReader();
            fileReader.addEventListener('error', reject);
            fileReader.addEventListener('load', () => {
                const result = fileReader.result;
                if (typeof result === 'string') {
                    processed.push({
                        file,
                        result
                    });
                }
                handleNextFile();
            });
            if (isMimeType(file, acceptableMimeTypes)) {
                fileReader.readAsDataURL(file);
            }
            else {
                handleNextFile();
            }
        };
        handleNextFile();
    });
}
exports.mediaFileReader = mediaFileReader;
/**
 * "Depth-First Search" starts at the root/top node of a tree and goes as far as it can down a branch end
 * before backtracking and finding a new path. Consider solving a maze by hugging either wall, moving down a
 * branch until you hit a dead-end (leaf) and backtracking to find the nearest branching path and repeat.
 * It will then return all the nodes found in the search in an array of objects.
 * @param startingNode - The node to start the search, if ommitted, it will start at the root node.
 * @param endingNode - The node to end the search, if ommitted, it will find all descendants of the startingNode.
 * @returns An array of objects of all the nodes found by the search, including their depth into the tree.
 * {depth: number, node: LexicalNode} It will always return at least 1 node (the ending node) so long as it exists
 */
function $dfs(startingNode, endingNode) {
    const nodes = [];
    const start = (startingNode || (0, lexicalLexical_js_1.$getRoot)()).getLatest();
    const end = endingNode || ((0, lexicalLexical_js_1.$isElementNode)(start) ? start.getLastDescendant() : start);
    let node = start;
    let depth = $getDepth(node);
    while (node !== null && !node.is(end)) {
        nodes.push({
            depth,
            node
        });
        if ((0, lexicalLexical_js_1.$isElementNode)(node) && node.getChildrenSize() > 0) {
            node = node.getFirstChild();
            depth++;
        }
        else {
            // Find immediate sibling or nearest parent sibling
            let sibling = null;
            while (sibling === null && node !== null) {
                sibling = node.getNextSibling();
                if (sibling === null) {
                    node = node.getParent();
                    depth--;
                }
                else {
                    node = sibling;
                }
            }
        }
    }
    if (node !== null && node.is(end)) {
        nodes.push({
            depth,
            node
        });
    }
    return nodes;
}
exports.$dfs = $dfs;
function $getDepth(node) {
    let innerNode = node;
    let depth = 0;
    while ((innerNode = innerNode.getParent()) !== null) {
        depth++;
    }
    return depth;
}
/**
 * Takes a node and traverses up its ancestors (toward the root node)
 * in order to find a specific type of node.
 * @param node - the node to begin searching.
 * @param klass - an instance of the type of node to look for.
 * @returns the node of type klass that was passed, or null if none exist.
 */
function $getNearestNodeOfType(node, klass) {
    let parent = node;
    while (parent != null) {
        if (parent instanceof klass) {
            return parent;
        }
        parent = parent.getParent();
    }
    return null;
}
exports.$getNearestNodeOfType = $getNearestNodeOfType;
/**
 * Returns the element node of the nearest ancestor, otherwise throws an error.
 * @param startNode - The starting node of the search
 * @returns The ancestor node found
 */
function $getNearestBlockElementAncestorOrThrow(startNode) {
    const blockNode = $findMatchingParent(startNode, node => (0, lexicalLexical_js_1.$isElementNode)(node) && !node.isInline());
    if (!(0, lexicalLexical_js_1.$isElementNode)(blockNode)) {
        {
            throw Error(`Expected node ${startNode.__key} to have closest block element node.`);
        }
    }
    return blockNode;
}
exports.$getNearestBlockElementAncestorOrThrow = $getNearestBlockElementAncestorOrThrow;
/**
 * Starts with a node and moves up the tree (toward the root node) to find a matching node based on
 * the search parameters of the findFn. (Consider JavaScripts' .find() function where a testing function must be
 * passed as an argument. eg. if( (node) => node.__type === 'div') ) return true; otherwise return false
 * @param startingNode - The node where the search starts.
 * @param findFn - A testing function that returns true if the current node satisfies the testing parameters.
 * @returns A parent node that matches the findFn parameters, or null if one wasn't found.
 */
function $findMatchingParent(startingNode, findFn) {
    let curr = startingNode;
    while (curr !== (0, lexicalLexical_js_1.$getRoot)() && curr != null) {
        if (findFn(curr)) {
            return curr;
        }
        curr = curr.getParent();
    }
    return null;
}
exports.$findMatchingParent = $findMatchingParent;
/**
 * Attempts to resolve nested element nodes of the same type into a single node of that type.
 * It is generally used for marks/commenting
 * @param editor - The lexical editor
 * @param targetNode - The target for the nested element to be extracted from.
 * @param cloneNode - See {@link $createMarkNode}
 * @param handleOverlap - Handles any overlap between the node to extract and the targetNode
 * @returns The lexical editor
 */
function registerNestedElementResolver(editor, targetNode, cloneNode, handleOverlap) {
    const $isTargetNode = node => {
        return node instanceof targetNode;
    };
    const $findMatch = node => {
        // First validate we don't have any children that are of the target,
        // as we need to handle them first.
        const children = node.getChildren();
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if ($isTargetNode(child)) {
                return null;
            }
        }
        let parentNode = node;
        let childNode = node;
        while (parentNode !== null) {
            childNode = parentNode;
            parentNode = parentNode.getParent();
            if ($isTargetNode(parentNode)) {
                return {
                    child: childNode,
                    parent: parentNode
                };
            }
        }
        return null;
    };
    const elementNodeTransform = node => {
        const match = $findMatch(node);
        if (match !== null) {
            const { child, parent } = match;
            // Simple path, we can move child out and siblings into a new parent.
            if (child.is(node)) {
                handleOverlap(parent, node);
                const nextSiblings = child.getNextSiblings();
                const nextSiblingsLength = nextSiblings.length;
                parent.insertAfter(child);
                if (nextSiblingsLength !== 0) {
                    const newParent = cloneNode(parent);
                    child.insertAfter(newParent);
                    for (let i = 0; i < nextSiblingsLength; i++) {
                        newParent.append(nextSiblings[i]);
                    }
                }
                if (!parent.canBeEmpty() && parent.getChildrenSize() === 0) {
                    parent.remove();
                }
            }
        }
    };
    return editor.registerNodeTransform(targetNode, elementNodeTransform);
}
exports.registerNestedElementResolver = registerNestedElementResolver;
/**
 * Clones the editor and marks it as dirty to be reconciled. If there was a selection,
 * it would be set back to its previous state, or null otherwise.
 * @param editor - The lexical editor
 * @param editorState - The editor's state
 */
function $restoreEditorState(editor, editorState) {
    const FULL_RECONCILE = 2;
    const nodeMap = new Map();
    const activeEditorState = editor._pendingEditorState;
    for (const [key, node] of editorState._nodeMap) {
        const clone = (0, lexical_selectionLexicalSelection_js_1.$cloneWithProperties)(node);
        if ((0, lexicalLexical_js_1.$isTextNode)(clone)) {
            clone.__text = node.__text;
        }
        nodeMap.set(key, clone);
    }
    if (activeEditorState) {
        activeEditorState._nodeMap = nodeMap;
    }
    editor._dirtyType = FULL_RECONCILE;
    const selection = editorState._selection;
    (0, lexicalLexical_js_1.$setSelection)(selection === null ? null : selection.clone());
}
exports.$restoreEditorState = $restoreEditorState;
/**
 * If the selected insertion area is the root/shadow root node (see {@link lexical!$isRootOrShadowRoot}),
 * the node will be appended there, otherwise, it will be inserted before the insertion area.
 * If there is no selection where the node is to be inserted, it will be appended after any current nodes
 * within the tree, as a child of the root node. A paragraph node will then be added after the inserted node and selected.
 * @param node - The node to be inserted
 * @returns The node after its insertion
 */
function $insertNodeToNearestRoot(node) {
    const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
        const { focus } = selection;
        const focusNode = focus.getNode();
        const focusOffset = focus.offset;
        if ((0, lexicalLexical_js_1.$isRootOrShadowRoot)(focusNode)) {
            const focusChild = focusNode.getChildAtIndex(focusOffset);
            if (focusChild == null) {
                focusNode.append(node);
            }
            else {
                focusChild.insertBefore(node);
            }
            node.selectNext();
        }
        else {
            let splitNode;
            let splitOffset;
            if ((0, lexicalLexical_js_1.$isTextNode)(focusNode)) {
                splitNode = focusNode.getParentOrThrow();
                splitOffset = focusNode.getIndexWithinParent();
                if (focusOffset > 0) {
                    splitOffset += 1;
                    focusNode.splitText(focusOffset);
                }
            }
            else {
                splitNode = focusNode;
                splitOffset = focusOffset;
            }
            const [, rightTree] = (0, lexicalLexical_js_1.$splitNode)(splitNode, splitOffset);
            rightTree.insertBefore(node);
            rightTree.selectStart();
        }
    }
    else {
        if ((0, lexicalLexical_js_1.$isNodeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) {
            const nodes = selection.getNodes();
            nodes[nodes.length - 1].getTopLevelElementOrThrow().insertAfter(node);
        }
        else {
            const root = (0, lexicalLexical_js_1.$getRoot)();
            root.append(node);
        }
        const paragraphNode = (0, lexicalLexical_js_1.$createParagraphNode)();
        node.insertAfter(paragraphNode);
        paragraphNode.select();
    }
    return node.getLatest();
}
exports.$insertNodeToNearestRoot = $insertNodeToNearestRoot;
/**
 * Wraps the node into another node created from a createElementNode function, eg. $createParagraphNode
 * @param node - Node to be wrapped.
 * @param createElementNode - Creates a new lexical element to wrap the to-be-wrapped node and returns it.
 * @returns A new lexical element with the previous node appended within (as a child, including its children).
 */
function $wrapNodeInElement(node, createElementNode) {
    const elementNode = createElementNode();
    node.replace(elementNode);
    elementNode.append(node);
    return elementNode;
}
exports.$wrapNodeInElement = $wrapNodeInElement;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * @param object = The instance of the type
 * @param objectClass = The class of the type
 * @returns Whether the object is has the same Klass of the objectClass, ignoring the difference across window (e.g. different iframs)
 */
function objectKlassEquals(object, objectClass) {
    return object !== null ? Object.getPrototypeOf(object).constructor.name === objectClass.name : false;
}
exports.objectKlassEquals = objectKlassEquals;
/**
 * Filter the nodes
 * @param nodes Array of nodes that needs to be filtered
 * @param filterFn A filter function that returns node if the current node satisfies the condition otherwise null
 * @returns Array of filtered nodes
 */
function $filter(nodes, filterFn) {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = filterFn(nodes[i]);
        if (node !== null) {
            result.push(node);
        }
    }
    return result;
}
exports.$filter = $filter;
/**
 * Appends the node before the first child of the parent node
 * @param parent A parent node
 * @param node Node that needs to be appended
 */
function $insertFirst(parent, node) {
    const firstChild = parent.getFirstChild();
    if (firstChild !== null) {
        firstChild.insertBefore(node);
    }
    else {
        parent.append(node);
    }
}
exports.$insertFirst = $insertFirst;
/**
 *
 * @param {RangeSelection} selection
 *
 */
function getBlockNodesInSelection(selection) {
    const elementNodes = getElementNodesInSelection(selection);
    const ret = new Set();
    for (let elementNode of elementNodes) {
        if (elementNode.isInline())
            ret.add(elementNode);
    }
    return ret;
}
exports.getBlockNodesInSelection = getBlockNodesInSelection;
/**
 * Get all of the element nodes in a range selection
 * @param {RangeSelection} selection
 * @returns {Set<ElementNode>}
 */
function getElementNodesInSelection(selection) {
    const nodesInSelection = selection.getNodes();
    if (nodesInSelection.length === 0) {
        return new Set([selection.anchor.getNode().getParentOrThrow(), selection.focus.getNode().getParentOrThrow()]);
    }
    return new Set(nodesInSelection.map(n => (0, lexicalLexical_js_1.$isElementNode)(n) ? n : n.getParentOrThrow()));
}
exports.getElementNodesInSelection = getElementNodesInSelection;
const isTableCellNode = node => Boolean(node.getType() === "tablecell");
const isListItemNode = node => Boolean(node.getType() === "listitem");
const isListNode = node => Boolean(node.getType() === "list");
/**
 * Segment the different types of nodes in the selection
 * for the updating of the toolbar
 * Get all the
 * - element nodes
 * - block nodes
 * - text nodes
 */
function segmentNodesForToolbarUpdate(selection) {
    const nodes = selection.getNodes();
    const closestRoot = $findMatchingParent(nodes[0], n => Boolean(n instanceof lexicalLexical_js_1.RootNode || n.isShadowRoot && n.isShadowRoot()));
    const ret = {
        blockNodes: new Set(),
        elementNodes: new Set(),
        textNodes: new Set(),
        types: new Set(),
        decoratorNodes: new Set(),
        activeCell: undefined,
        root: closestRoot
    };
    const SEEN_NODES = new Set();
    const findActiveCell = node => {
        const temp = $findMatchingParent(node, node => isTableCellNode(node));
        if (temp && isTableCellNode(temp))
            ret.activeCell = temp;
        else
            return;
    };
    const handleElementNode = node => {
        ret.types.add(node.getType());
        SEEN_NODES.add(node.getKey());
        ret.elementNodes.add(node);
        if (!!!node.isInline())
            ret.blockNodes.add(node);
        else {
            const nearestBlockNode = $findMatchingParent(node, n => (0, lexicalLexical_js_1.$isElementNode)(n) && !!!n.isInline());
            if (nearestBlockNode && !!!SEEN_NODES.has(nearestBlockNode.getKey()))
                handleElementNode(nearestBlockNode);
        }
        if (isListItemNode(node)) {
            const parent = node.getParent();
            if (parent && isListNode(parent) && !!!SEEN_NODES.has(parent.getKey())) {
                SEEN_NODES.add(parent.getKey());
                ret.types.add(parent.getType());
                ret.elementNodes.add(parent);
                ret.blockNodes.add(parent);
            }
        }
        if (!!!ret.activeCell)
            findActiveCell(node);
    };
    const handleDecoratorNode = node => {
        ret.decoratorNodes.add(node);
    };
    for (let i = 0; i < nodes.length; i++) {
        const NODE_KEY = nodes[i].getKey();
        if (SEEN_NODES.has(NODE_KEY))
            continue;
        ret.types.add(nodes[i].getType());
        SEEN_NODES.add(NODE_KEY);
        if (nodes[i] instanceof lexicalLexical_js_1.TextNode) {
            if ((0, lexicalLexical_js_1.$isTextNode)(nodes[i]))
                ret.textNodes.add(nodes[i]);
            nodes[i].getParentOrThrow();
            const nearestElementNode = $findMatchingParent(nodes[i], n => n instanceof lexicalLexical_js_1.ElementNode);
            if (nearestElementNode)
                handleElementNode(nearestElementNode);
        }
        else if (nodes[i] instanceof lexicalLexical_js_1.ElementNode)
            handleElementNode(nodes[i]);
        else if (nodes[i] instanceof lexical_decoratorsLexicalDecorators_js_1.DecoratorBlockNode)
            handleDecoratorNode(nodes[i]);
        else if ((0, lexicalLexical_js_1.$isLineBreakNode)(nodes[i])) {
            const parent = nodes[i].getParentOrThrow();
            if (parent instanceof lexicalLexical_js_1.ElementNode)
                handleElementNode(parent);
        }
    }
    return ret;
}
exports.segmentNodesForToolbarUpdate = segmentNodesForToolbarUpdate;
