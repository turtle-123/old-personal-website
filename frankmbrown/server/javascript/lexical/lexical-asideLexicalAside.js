"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAsideEditable = exports.INSERT_ASIDE_COMMAND = exports.AsideNode = exports.$isAsideNode = exports.$createAsideNode = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
const CURRENT_VERSION = 1;
class AsideNode extends lexicalLexical_js_1.ElementNode {
    constructor(side, key) {
        super(key);
        this.__side = side;
        this.__version = CURRENT_VERSION;
    }
    static getType() {
        return 'aside';
    }
    static clone(node) {
        return new AsideNode(node.__side, node.__key);
    }
    createDOM(_config, _editor) {
        const aside = document.createElement('aside');
        aside.classList.add(this.getSide(), 'rte');
        aside.setAttribute('data-v', String(CURRENT_VERSION));
        return aside;
    }
    updateDOM() {
        return false;
    }
    static importDOM() {
        return {
            aside: node => ({
                conversion: convertAsideElement,
                priority: 1
            })
        };
    }
    exportDOM(editor) {
        const { element } = super.exportDOM(editor); // See LexicalNode.ts -> should call this element createDOM method
        if (element && (0, lexicalLexical_js_1.isHTMLElement)(element)) {
            if (this.isEmpty())
                element.append(document.createElement('br'));
            element.setAttribute('data-v', String(CURRENT_VERSION));
        }
        return {
            element
        };
    }
    static importJSON(serializedNode) {
        const node = $createAsideNode(serializedNode.side);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            side: this.getSide(),
            type: 'aside',
            version: CURRENT_VERSION
        };
    }
    insertNewAfter(_, restoreSelection) {
        const newElement = (0, lexicalLexical_js_1.$createParagraphNode)();
        const direction = this.getDirection();
        newElement.setDirection(direction);
        this.insertAfter(newElement, restoreSelection);
        return newElement;
    }
    collapseAtStart() {
        this.replace((0, lexicalLexical_js_1.$createParagraphNode)());
        return true;
    }
    getSide() {
        const self = this.getLatest();
        return self.__side;
    }
    setIndent(_) {
        return this.getWritable();
    }
    setFormat(_) {
        return this.getWritable();
    }
    isShadowRoot() {
        return true;
    }
    canReplaceWith(replacement) {
        return (0, lexicalLexical_js_1.$isParagraphNode)(replacement);
    }
}
exports.AsideNode = AsideNode;
function convertAsideElement(el) {
    const left = el.classList.contains('left');
    const side = left ? 'left' : 'right';
    const node = $createAsideNode(side);
    return {
        node
    };
}
function $createAsideNode(side) {
    return (0, lexicalLexical_js_1.$applyNodeReplacement)(new AsideNode(side));
}
exports.$createAsideNode = $createAsideNode;
function $isAsideNode(node) {
    return node instanceof AsideNode;
}
exports.$isAsideNode = $isAsideNode;
const INSERT_ASIDE_COMMAND = (0, lexicalLexical_js_1.createCommand)('INSERT_ASIDE_ELEMENT');
exports.INSERT_ASIDE_COMMAND = INSERT_ASIDE_COMMAND;
function getInsertAside(editor) {
    const insertAside = function () {
        const payload = this.getAttribute('data-payload');
        if (payload === "left") {
            editor.dispatchCommand(INSERT_ASIDE_COMMAND, {
                side: "left"
            });
        }
        else if (payload === "right") {
            editor.dispatchCommand(INSERT_ASIDE_COMMAND, {
                side: "right"
            });
        }
    };
    return insertAside;
}
function registerAsideListeners(editor) {
    var _a;
    const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    if (wrapper) {
        const insertAsideButtons = Array.from(document.querySelectorAll('button[data-dispatch="INSERT_ASIDE_COMMAND"]'));
        insertAsideButtons.forEach(button => {
            const dataMouseDown = button.getAttribute('data-mouse-down');
            if (dataMouseDown !== null) {
                if (!!!(0, lexical_sharedLexicalShared_js_1.isTouchDevice)())
                    button.addEventListener('mousedown', getInsertAside(editor));
                else
                    button.addEventListener('touchstart', getInsertAside(editor));
            }
            else {
                button.addEventListener('click', getInsertAside(editor));
            }
        });
    }
}
function registerAsideEditable(editor) {
    if (editor.hasNode(AsideNode)) {
        registerAsideListeners(editor);
        return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(
        // Insert Aside Element
        editor.registerCommand(INSERT_ASIDE_COMMAND, payload => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            const paragraphNode = (0, lexicalLexical_js_1.$createParagraphNode)();
            paragraphNode.setBlockStyle({
                ...lexicalLexical_js_1.BLOCK_STYLE_DEFAULT,
                margin: '0px'
            });
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                const anchorNode = selection.anchor.getNode();
                const nearestParagraphNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchorNode, node => (0, lexicalLexical_js_1.$isParagraphNode)(node) && (0, lexicalLexical_js_1.$isRootNode)(node.getParent()));
                if ((0, lexicalLexical_js_1.$isParagraphNode)(nearestParagraphNode)) {
                    nearestParagraphNode.insertBefore($createAsideNode(payload.side).append(paragraphNode));
                }
                else {
                    const rootNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchorNode, node => (0, lexicalLexical_js_1.$isRootNode)(node) || node.isShadowRoot && node.isShadowRoot());
                    if (rootNode) {
                        rootNode.append(paragraphNode);
                        paragraphNode.insertBefore($createAsideNode(payload.side).append((0, lexicalLexical_js_1.$createParagraphNode)()));
                    }
                }
            }
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), 
        // When the user tries to escape aside by pressing ENTER, let them
        editor.registerCommand(lexicalLexical_js_1.INSERT_PARAGRAPH_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed() && editor.isEditable()) {
                const anchor = selection.anchor.getNode();
                const paragraphNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchor, node => (0, lexicalLexical_js_1.$isParagraphNode)(node) && $isAsideNode(node.getParent()));
                if (paragraphNode) {
                    const asideNode = paragraphNode.getParent();
                    const lastChild = asideNode.getLastChild();
                    const previousChild = lastChild === null || lastChild === void 0 ? void 0 : lastChild.getPreviousSibling();
                    if (asideNode.getChildrenSize() >= 3 && (0, lexicalLexical_js_1.$isParagraphNode)(lastChild) && (0, lexicalLexical_js_1.$isParagraphNode)(previousChild) && lastChild.isEmpty() && previousChild.isEmpty()) {
                        lastChild.remove();
                        previousChild.remove();
                        const p = (0, lexicalLexical_js_1.$createParagraphNode)();
                        asideNode.insertAfter(p);
                        p.selectEnd();
                        return true;
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), editor.registerCommand(lexicalLexical_js_1.KEY_ENTER_COMMAND, e => {
            if (e && e.shiftKey) {
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
                    const nodes = selection.getNodes();
                    if (nodes.length) {
                        const node = nodes[0];
                        if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
                            const para = node.getParent();
                            if ((0, lexicalLexical_js_1.$isParagraphNode)(para)) {
                                const textContent = node.getTextContent();
                                const offset = selection.getCharacterOffsets();
                                const endCharacter = offset[0];
                                const startCharacter = endCharacter - 3;
                                const asideText = textContent.slice(startCharacter, endCharacter);
                                if (asideText === "-->") {
                                    node.setTextContent(textContent.slice(0, startCharacter));
                                    const asideNode = $createAsideNode("right");
                                    asideNode.append((0, lexicalLexical_js_1.$createParagraphNode)());
                                    para.insertBefore(asideNode);
                                    return true;
                                }
                                else if (asideText === "<--") {
                                    node.setTextContent(textContent.slice(0, startCharacter));
                                    const asideNode = $createAsideNode("left");
                                    asideNode.append((0, lexicalLexical_js_1.$createParagraphNode)());
                                    para.insertBefore(asideNode);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_HIGH), editor.registerCommand(lexical_sharedLexicalShared_js_1.REGISTER_TOOLBAR_LISTENERS, () => {
            registerAsideListeners(editor);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    }
    else {
        console.error('Editor does not have AsideNode registered.');
    }
    return () => {
        return;
    };
}
exports.registerAsideEditable = registerAsideEditable;
