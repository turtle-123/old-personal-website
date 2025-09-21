"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRichTextNotEditable = exports.registerRichTextEditable = exports.insertPlaceholder = exports.eventFiles = exports.QuoteNode = exports.INSERT_QUOTE_COMMAND = exports.HeadingNode = exports.HANDLE_EMPTY_COMMAND = exports.DRAG_DROP_PASTE = exports.CREATE_HEADING_COMMAND = exports.COPY_EDITOR_COMMAND = exports.$isQuoteNode = exports.$isHeadingNode = exports.$createQuoteNode = exports.$createHeadingNode = void 0;
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
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
const dom_1 = require("@floating-ui/dom");
const lexical_decoratorsLexicalDecorators_js_1 = require("./lexical-decoratorsLexicalDecorators.js");
const lexical_htmlLexicalHtml_js_1 = require("./lexical-htmlLexicalHtml.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function caretFromPoint(x, y) {
    if (typeof document.caretRangeFromPoint !== 'undefined') {
        const range = document.caretRangeFromPoint(x, y);
        if (range === null) {
            return null;
        }
        return {
            node: range.startContainer,
            offset: range.startOffset
        };
        // @ts-ignore
    }
    else if (document.caretPositionFromPoint !== 'undefined') {
        // @ts-ignore FF - no types
        const range = document.caretPositionFromPoint(x, y);
        if (range === null) {
            return null;
        }
        return {
            node: range.offsetNode,
            offset: range.offset
        };
    }
    else {
        // Gracefully handle IE
        return null;
    }
}
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
/** @module @lexical/rich-text */
const autoUpdateObject = {};
var TEXT_CONTENT_TO_INSERT = undefined;
const PASTE_CONTEXT_MENU_ID = "paste-html-action-menu";
var CLOSE_PASTE_MENU_BLUR_TIMEOUT = null;
const QUOTE_NODE_VERSION = 1;
const HEADING_NODE_VERSION = 1;
const DRAG_DROP_PASTE = (0, lexicalLexical_js_1.createCommand)('DRAG_DROP_PASTE_FILE');
exports.DRAG_DROP_PASTE = DRAG_DROP_PASTE;
/** @noInheritDoc */
class QuoteNode extends lexicalLexical_js_1.ElementNode {
    static getType() {
        return 'quote';
    }
    static clone(node) {
        return new QuoteNode(node.__key);
    }
    constructor(key) {
        super(key);
        this.__version = QUOTE_NODE_VERSION;
    }
    // View
    createDOM(config) {
        const element = document.createElement('blockquote');
        (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, config.theme.quote);
        if (this.getFirstElement())
            element.classList.add('first-rte-element');
        if (this.getLastElement())
            element.classList.add('last-rte-element');
        return element;
    }
    updateDOM(prevNode, dom) {
        return false;
    }
    static importDOM() {
        return {
            blockquote: node => ({
                conversion: convertBlockquoteElement,
                priority: 0
            })
        };
    }
    exportDOM(editor) {
        const { element } = super.exportDOM(editor);
        if (element && (0, lexical_utilsLexicalUtils_js_1.isHTMLElement)(element)) {
            if (this.isEmpty())
                element.append(document.createElement('br'));
            const formatType = this.getFormatType();
            element.style.textAlign = formatType;
            const direction = this.getDirection();
            if (direction) {
                element.dir = direction;
            }
            element.setAttribute('data-e-indent', this.getIndent().toString());
            element.setAttribute('data-v', String(QUOTE_NODE_VERSION));
            if (this.getFirstElement() && !!!lexical_sharedLexicalShared_js_1.IS_REAL_BROWSER)
                element.classList.add('first-rte-element');
            if (this.getLastElement() && !!!lexical_sharedLexicalShared_js_1.IS_REAL_BROWSER)
                element.classList.add('last-rte-element');
        }
        return {
            element
        };
    }
    static importJSON(serializedNode) {
        const node = $createQuoteNode();
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        if (serializedNode === null || serializedNode === void 0 ? void 0 : serializedNode.first_element)
            node.setFirstElement(serializedNode === null || serializedNode === void 0 ? void 0 : serializedNode.first_element);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'quote',
            version: QUOTE_NODE_VERSION,
            first_element: this.getFirstElement()
        };
    }
    // Mutation
    insertNewAfter(_, restoreSelection) {
        const newBlock = (0, lexicalLexical_js_1.$createParagraphNode)();
        const direction = this.getDirection();
        newBlock.setDirection(direction);
        this.insertAfter(newBlock, restoreSelection);
        return newBlock;
    }
    collapseAtStart() {
        const paragraph = (0, lexicalLexical_js_1.$createParagraphNode)();
        const children = this.getChildren();
        children.forEach(child => paragraph.append(child));
        this.replace(paragraph);
        return true;
    }
}
exports.QuoteNode = QuoteNode;
function $createQuoteNode() {
    return (0, lexicalLexical_js_1.$applyNodeReplacement)(new QuoteNode());
}
exports.$createQuoteNode = $createQuoteNode;
function $isQuoteNode(node) {
    return node instanceof QuoteNode;
}
exports.$isQuoteNode = $isQuoteNode;
/** @noInheritDoc */
class HeadingNode extends lexicalLexical_js_1.ElementNodeWithBlockStyle {
    static getType() {
        return 'heading';
    }
    static clone(node) {
        const newNode = new HeadingNode(node.__tag, node.__sectionHeader, node.__key, node.getBlockStyle());
        return newNode;
    }
    constructor(tag, sectionHeader, key, styleObj) {
        super(key);
        /** @internal */
        this.__version = HEADING_NODE_VERSION;
        this.__sectionHeader = false;
        this.__tag = tag;
        if (sectionHeader !== undefined) {
            this.__sectionHeader = sectionHeader;
        }
        if (styleObj) {
            this.__blockStyle = styleObj;
        }
    }
    getTag() {
        return this.__tag;
    }
    // View
    createDOM(config) {
        const tag = this.__tag;
        const element = document.createElement(tag);
        const theme = config.theme;
        const classNames = theme.heading;
        if (classNames !== undefined) {
            const className = classNames[tag];
            (0, lexical_utilsLexicalUtils_js_1.addClassNamesToElement)(element, className);
        }
        if (this.__sectionHeader) {
            element.classList.add('rte-section-header');
        }
        const cssText = (0, lexicalLexical_js_1.getCssTextForElementNodeWithBlockStyle)(this, "heading");
        element.style.cssText = cssText;
        element.setAttribute("data-v", String(HEADING_NODE_VERSION));
        if (this.getFirstElement())
            element.classList.add('first-rte-element');
        if (this.getLastElement())
            element.classList.add('last-rte-element');
        return element;
    }
    updateDOM(prevNode, dom) {
        const cssText = (0, lexicalLexical_js_1.getCssTextForElementNodeWithBlockStyle)(this.getLatest(), "heading");
        dom.style.cssText = cssText;
        return false;
    }
    static importDOM() {
        return {
            h1: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            h2: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            h3: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            h4: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            h5: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            h6: node => ({
                conversion: convertHeadingElement,
                priority: 0
            }),
            p: node => {
                // domNode is a <p> since we matched it by nodeName
                const paragraph = node;
                const firstChild = paragraph.firstChild;
                if (firstChild !== null && isGoogleDocsTitle(firstChild)) {
                    return {
                        conversion: () => ({
                            node: null
                        }),
                        priority: 3
                    };
                }
                return null;
            },
            span: node => {
                if (isGoogleDocsTitle(node)) {
                    return {
                        conversion: domNode => {
                            return {
                                node: $createHeadingNode('h1')
                            };
                        },
                        priority: 3
                    };
                }
                return null;
            }
        };
    }
    exportDOM(editor) {
        const { element } = super.exportDOM(editor);
        if (element && (0, lexical_utilsLexicalUtils_js_1.isHTMLElement)(element)) {
            if (this.isEmpty())
                element.append(document.createElement('br'));
            const cssText = (0, lexicalLexical_js_1.getCssTextForElementNodeWithBlockStyle)(this, "heading");
            element.style.cssText = cssText;
            const direction = this.getDirection();
            if (direction) {
                element.dir = direction;
            }
            if (this.__sectionHeader) {
                element.classList.add('rte-section-header');
            }
            element.setAttribute('data-v', String(HEADING_NODE_VERSION));
        }
        return {
            element
        };
    }
    static importJSON(serializedNode) {
        const node = $createHeadingNode(serializedNode.tag);
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        node.setBlockStyle(structuredClone(serializedNode.blockStyle));
        node.setSectionHeader(serializedNode.sectionHeader);
        node.setFirstElement(serializedNode === null || serializedNode === void 0 ? void 0 : serializedNode.first_element);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            tag: this.getTag(),
            type: 'heading',
            version: HEADING_NODE_VERSION,
            sectionHeader: this.__sectionHeader
        };
    }
    // Mutation
    insertNewAfter(selection, restoreSelection = true) {
        const anchorOffet = selection ? selection.anchor.offset : 0;
        const newElement = anchorOffet === this.getTextContentSize() || !selection ? (0, lexicalLexical_js_1.$createParagraphNode)() : $createHeadingNode(this.getTag());
        const direction = this.getDirection();
        newElement.setDirection(direction);
        this.insertAfter(newElement, restoreSelection);
        if (anchorOffet === 0 && !this.isEmpty() && selection) {
            const paragraph = (0, lexicalLexical_js_1.$createParagraphNode)();
            paragraph.select();
            this.replace(paragraph, true);
        }
        return newElement;
    }
    collapseAtStart() {
        const newElement = !this.isEmpty() ? $createHeadingNode(this.getTag()) : (0, lexicalLexical_js_1.$createParagraphNode)();
        const children = this.getChildren();
        children.forEach(child => newElement.append(child));
        this.replace(newElement);
        return true;
    }
    extractWithChild() {
        return true;
    }
    setIndent(indentLevel) {
        const self = this.getWritable();
        self.__indent = Math.min(indentLevel, lexicalLexical_js_1.MAX_INDENT_PARAGRAPH_LEVEL);
        return this;
    }
    getSectionHeader() {
        return this.getLatest().__sectionHeader;
    }
    setSectionHeader(b) {
        const self = this.getWritable();
        self.__sectionHeader = b;
        return self;
    }
}
exports.HeadingNode = HeadingNode;
function isGoogleDocsTitle(domNode) {
    if (domNode.nodeName.toLowerCase() === 'span') {
        return domNode.style.fontSize === '26pt';
    }
    return false;
}
function convertHeadingElement(element) {
    const nodeName = element.nodeName.toLowerCase();
    let node = null;
    if (nodeName === 'h1' || nodeName === 'h2' || nodeName === 'h3' || nodeName === 'h4' || nodeName === 'h5' || nodeName === 'h6') {
        node = $createHeadingNode(nodeName);
        if (element.style !== null) {
            const obj = (0, lexicalLexical_js_1.extractStylesFromCssText)(element.style.cssText, nodeName);
            node.setFormat(obj.textAlign);
            // Set Indent
            const indentStr = element.getAttribute('data-e-indent');
            if (indentStr) {
                const indentNum = parseInt(indentStr);
                if (!!!isNaN(indentNum) && isFinite(indentNum)) {
                    node.setIndent(Math.max(0, Math.min(indentNum, lexicalLexical_js_1.MAX_INDENT_PARAGRAPH_LEVEL)));
                }
                else {
                    node.setIndent(0);
                }
            }
            else {
                node.setIndent(0);
            }
            const dir = element.getAttribute('dir');
            if (dir === "ltr" || dir === "rtl")
                node.setDirection(dir);
            else
                node.setDirection("ltr");
            node.setBlockStyle(obj);
        }
        if (element.classList.contains('rte-section-header')) {
            node.setSectionHeader(true);
        }
        if (element.classList.contains('first-rte-element')) {
            node.setFirstElement(true);
        }
        if (element.classList.contains('last-rte-element')) {
            node.setLastElement(true);
        }
    }
    return {
        node
    };
}
function convertBlockquoteElement(element) {
    const node = $createQuoteNode();
    if (element.style !== null) {
        node.setFormat(element.style.textAlign);
    }
    if (element.classList.contains('first-rte-element'))
        node.setFirstElement(true);
    if (element.classList.contains('last-rte-element'))
        node.setLastElement(true);
    return {
        node
    };
}
function $createHeadingNode(headingTag) {
    return (0, lexicalLexical_js_1.$applyNodeReplacement)(new HeadingNode(headingTag));
}
exports.$createHeadingNode = $createHeadingNode;
function $isHeadingNode(node) {
    return node instanceof HeadingNode;
}
exports.$isHeadingNode = $isHeadingNode;
function onPasteForRichText(event, editor) {
    event.preventDefault();
    editor.update(() => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        const clipboardData = event instanceof InputEvent || event instanceof KeyboardEvent ? null : event.clipboardData;
        if (clipboardData != null && ((0, lexicalLexical_js_1.$isRangeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection))) {
            (0, lexical_clipboardLexicalClipboard_js_1.$insertDataTransferForRichText)(clipboardData, selection, editor);
        }
    }, {
        tag: 'paste'
    });
}
async function onCutForRichText(event, editor) {
    await (0, lexical_clipboardLexicalClipboard_js_1.copyToClipboard)(editor, (0, lexical_utilsLexicalUtils_js_1.objectKlassEquals)(event, ClipboardEvent) ? event : null);
    editor.update(() => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            selection.removeText();
        }
        else if ((0, lexicalLexical_js_1.$isNodeSelection)(selection)) {
            selection.getNodes().forEach(node => node.remove());
        }
    });
}
// Clipboard may contain files that we aren't allowed to read. While the event is arguably useless,
// in certain occasions, we want to know whether it was a file transfer, as opposed to text. We
// control this with the first boolean flag.
function eventFiles(event) {
    let dataTransfer = null;
    if (event instanceof DragEvent) {
        dataTransfer = event.dataTransfer;
    }
    else if (event instanceof InputEvent) {
        dataTransfer = event.dataTransfer;
    }
    else if (event instanceof ClipboardEvent) {
        dataTransfer = event.clipboardData;
    }
    if (dataTransfer === null) {
        return [false, [], false];
    }
    const types = dataTransfer.types;
    const hasFiles = types.includes('Files');
    const hasContent = types.includes('text/html') || types.includes('text/plain');
    return [hasFiles, Array.from(dataTransfer.files), hasContent];
}
exports.eventFiles = eventFiles;
function handleIndentAndOutdent(indentOrOutdent) {
    const selection = (0, lexicalLexical_js_1.$getSelection)();
    if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
        return false;
    }
    const alreadyHandled = new Set();
    const nodes = selection.getNodes();
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const key = node.getKey();
        if (alreadyHandled.has(key)) {
            continue;
        }
        const parentBlock = (0, lexical_utilsLexicalUtils_js_1.$getNearestBlockElementAncestorOrThrow)(node);
        const parentKey = parentBlock.getKey();
        if (parentBlock.canIndent() && !alreadyHandled.has(parentKey)) {
            alreadyHandled.add(parentKey);
            indentOrOutdent(parentBlock);
        }
    }
    return alreadyHandled.size > 0;
}
function $isTargetWithinDecorator(target) {
    const node = (0, lexicalLexical_js_1.$getNearestNodeFromDOMNode)(target);
    return (0, lexicalLexical_js_1.$isDecoratorNode)(node);
}
function $isSelectionAtEndOfRoot(selection) {
    const focus = selection.focus;
    return focus.key === 'root' && focus.offset === (0, lexicalLexical_js_1.$getRoot)().getChildrenSize();
}
const HANDLE_EMPTY_COMMAND = (0, lexicalLexical_js_1.createCommand)('HANDLE_EMPTY_COMMAND');
exports.HANDLE_EMPTY_COMMAND = HANDLE_EMPTY_COMMAND;
const INSERT_QUOTE_COMMAND = (0, lexicalLexical_js_1.createCommand)('INSERT_QUOTE_COMMAND');
exports.INSERT_QUOTE_COMMAND = INSERT_QUOTE_COMMAND;
const CREATE_HEADING_COMMAND = (0, lexicalLexical_js_1.createCommand)('CREATE_HEADING_COMMAND');
exports.CREATE_HEADING_COMMAND = CREATE_HEADING_COMMAND;
function getDispatchQuote(editor) {
    const dispatchQuote = function () {
        editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined);
    };
    return dispatchQuote;
}
const ALLOWED_HEADERS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p']);
function getDispatchHeading(editor) {
    const dispatchHeadingCommand = function () {
        const payload = this.getAttribute('data-payload');
        if (ALLOWED_HEADERS.has(payload))
            editor.dispatchCommand(CREATE_HEADING_COMMAND, payload);
    };
    return dispatchHeadingCommand;
}
function setDispatchButtons(wrapper, editor) {
    const dispatchHeadingButtons = Array.from(wrapper.querySelectorAll('button[data-dispatch="CREATE_HEADING_COMMAND"]'));
    const dispatchQuoteButton = wrapper.querySelector('button[data-dispatch="INSERT_QUOTE_COMMAND"]');
    if (editor.hasNode(HeadingNode)) {
        dispatchHeadingButtons.forEach(button => {
            const dataMouseDown = button.getAttribute('data-mouse-down');
            if (dataMouseDown !== null) {
                button.addEventListener('mousedown', getDispatchHeading(editor));
                button.addEventListener('touchstart', getDispatchHeading(editor));
            }
            else {
                button.addEventListener('click', getDispatchHeading(editor));
            }
        });
    }
    if (editor.hasNode(QuoteNode)) {
        if (dispatchQuoteButton) {
            const dataMouseDown = dispatchQuoteButton.getAttribute('data-mouse-down');
            if (dataMouseDown !== null) {
                dispatchQuoteButton.addEventListener('mousedown', getDispatchQuote(editor));
                dispatchQuoteButton.addEventListener('touchstart', getDispatchQuote(editor));
            }
            else {
                dispatchQuoteButton.addEventListener('click', getDispatchQuote(editor));
            }
            editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined);
        }
    }
}
function insertPlaceholder(editor) {
    editor.update(() => {
        const rootElement = editor.getRootElement();
        const root = (0, lexicalLexical_js_1.$getRoot)();
        if (root.isEmpty()) {
            const paragraph = (0, lexicalLexical_js_1.$createParagraphNode)();
            if (rootElement && rootElement.hasAttribute('data-placeholder')) {
                const textNode = (0, lexicalLexical_js_1.$createTextNode)(rootElement.getAttribute('data-placeholder'));
                paragraph.append(textNode);
            }
            else {
                const textNode = (0, lexicalLexical_js_1.$createTextNode)('Insert Content Here...');
                paragraph.append(textNode);
            }
            root.append(paragraph);
        }
    });
}
exports.insertPlaceholder = insertPlaceholder;
function closePasteOptionsMenu() {
    const menu = document.getElementById(PASTE_CONTEXT_MENU_ID);
    if (menu) {
        if (autoUpdateObject[PASTE_CONTEXT_MENU_ID]) {
            try {
                autoUpdateObject[PASTE_CONTEXT_MENU_ID]();
                delete autoUpdateObject[PASTE_CONTEXT_MENU_ID];
            }
            catch (error) { }
            menu.style.display = "none";
            menu.style.opacity = "0";
        }
    }
}
function openPasteOptionsMenu(PORTAL_EL, editor) {
    const menu = document.getElementById(PASTE_CONTEXT_MENU_ID);
    if (menu) {
        menu.style.display = 'flex';
        const updatePopover = function () {
            const selection = document.getSelection();
            const root = editor.getRootElement();
            if (selection && root && selection.rangeCount > 0) {
                const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                if (PORTAL_EL && rect) {
                    const ancestor = selection.getRangeAt(0).commonAncestorContainer;
                    if (rect.left === 0 && rect.right === 0 && ancestor instanceof HTMLElement) {
                        const rectNew = ancestor.getBoundingClientRect();
                        rect.left = rectNew.left;
                        rect.right = rectNew.right;
                        rect.top += rectNew.top;
                    }
                    if (rect.top === 0 && rect.left === 0)
                        closePasteOptionsMenu();
                    this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                    this.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                }
            }
            else
                closePasteOptionsMenu();
            const options = {
                placement: "bottom-end",
                middleware: [(0, dom_1.offset)(6), (0, dom_1.shift)(), (0, dom_1.flip)()]
            };
            (0, dom_1.computePosition)(this, menu, options).then(({ x, y }) => {
                const assignObj = {
                    left: `${x}px`,
                    top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
                    opacity: "1"
                };
                Object.assign(menu.style, assignObj);
            });
        }.bind(PORTAL_EL);
        updatePopover();
        const cleanup = (0, dom_1.autoUpdate)(PORTAL_EL, menu, updatePopover);
        if (autoUpdateObject[PASTE_CONTEXT_MENU_ID])
            delete autoUpdateObject[PASTE_CONTEXT_MENU_ID];
        autoUpdateObject[PASTE_CONTEXT_MENU_ID] = cleanup;
    }
    else {
        closePasteOptionsMenu();
    }
}
function handlePasteText() {
    closePasteOptionsMenu();
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        editor.update(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (((0, lexicalLexical_js_1.$isRangeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) && TEXT_CONTENT_TO_INSERT) {
                try {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
                    const text = dom.body.innerText.trim();
                    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                        const parts = text.split(/(\r?\n|\t)/);
                        if (parts[parts.length - 1] === '') {
                            parts.pop();
                        }
                        for (let i = 0; i < parts.length; i++) {
                            const part = parts[i];
                            if (part === '\n' || part === '\r\n') {
                                selection.insertParagraph();
                            }
                            else if (part === '\t') {
                                selection.insertNodes([(0, lexicalLexical_js_1.$createTabNode)()]);
                            }
                            else {
                                selection.insertText(part);
                            }
                        }
                    }
                    else {
                        selection.insertRawText(text);
                    }
                }
                catch (_unused) {
                    // Fail silently.
                }
            }
        });
    }
}
function sanitizePastedHTML(dom, noStyle = false) {
    if (noStyle) {
        Array.from(dom.querySelectorAll('*')).forEach(node => {
            if (node instanceof HTMLElement) {
                node.style.cssText = "";
            }
        });
    }
    dom.querySelectorAll('table table').forEach(el => {
        el.remove();
    });
    dom.querySelectorAll('table').forEach(el => {
        const div = document.createElement('div');
        div.className = "table-wrapper";
        div.insertAdjacentHTML("afterbegin", el.outerHTML);
        el.replaceWith(div);
    });
    dom.querySelectorAll('td, th').forEach(el => {
        const childNodes = Array.from(el.childNodes);
        const children = Array.from(el.children);
        // If the table cell element starts with a text node that has text, assume that the HTML elements inside 
        // the table cell element are inline nodes, and wrap everything in a cell paragraph
        if (childNodes[0].textContent && childNodes[0].textContent.trim().length >= 1 || children.length === 0) {
            const p = document.createElement('p');
            p.className = "lex-grid-p";
            p.innerHTML = el.innerHTML;
            el.innerHTML = '';
            el.append(p);
            el.style.width = String(Math.min(7 * el.innerText.length, 265)).concat('px');
        }
        else {
            for (let child of children) {
                if (child.tagName === "P") {
                    child.className = "lex-grid-p";
                    el.style.width = String(Math.min(7 * el.innerText.length, 265)).concat('px');
                }
                else {
                    const p = document.createElement('p');
                    child.insertBefore(p, child);
                    p.appendChild(child);
                    el.style.width = String(Math.min(7 * el.innerText.length, 265)).concat('px');
                }
            }
        }
    });
}
function handlePasteHTMLNoStyle() {
    closePasteOptionsMenu();
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        editor.update(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (((0, lexicalLexical_js_1.$isRangeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) && TEXT_CONTENT_TO_INSERT) {
                try {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
                    sanitizePastedHTML(dom, true);
                    const nodes = (0, lexical_htmlLexicalHtml_js_1.$generateNodesFromDOM)(editor, dom);
                    return (0, lexical_clipboardLexicalClipboard_js_1.$insertGeneratedNodes)(editor, nodes, selection);
                }
                catch (_unused2) {
                    // Fail silently.
                }
            }
        });
    }
}
function handlePasteHTMLWithStyle() {
    closePasteOptionsMenu();
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        editor.update(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (((0, lexicalLexical_js_1.$isRangeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) && TEXT_CONTENT_TO_INSERT) {
                try {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
                    sanitizePastedHTML(dom, false);
                    const nodes = (0, lexical_htmlLexicalHtml_js_1.$generateNodesFromDOM)(editor, dom);
                    return (0, lexical_clipboardLexicalClipboard_js_1.$insertGeneratedNodes)(editor, nodes, selection);
                }
                catch (_unused3) {
                    // Fail silently.
                }
            }
        });
    }
}
function handlePasteAsHtmlNode() {
    closePasteOptionsMenu();
    if (TEXT_CONTENT_TO_INSERT) {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            Promise.resolve().then(() => __importStar(require(/* webpackChunkName: "personal-website-shared" */ '../personal-website-shared'))).then(res => {
                const newHTML = res.validateUgcCode(TEXT_CONTENT_TO_INSERT);
                editor.dispatchCommand(lexical_decoratorsLexicalDecorators_js_1.INSERT_HTML_COMMAND, newHTML);
            }).catch(e => {
                console.error(e);
            });
        }
    }
}
const COPY_EDITOR_COMMAND = (0, lexicalLexical_js_1.createCommand)('COPY_EDITOR_COMMAND');
exports.COPY_EDITOR_COMMAND = COPY_EDITOR_COMMAND;
function onCopyEditorContents(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor)
        editor.dispatchCommand(COPY_EDITOR_COMMAND, null);
}
function registerRichTextListeners(editor) {
    var _a;
    const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    if (wrapper) {
        setDispatchButtons(wrapper, editor);
        const copyEditorButton = wrapper.querySelector('button[data-copy-editor]');
        if (copyEditorButton)
            copyEditorButton.addEventListener('click', onCopyEditorContents);
    }
}
/**
 * Register Rich Text Should be called on basically all editors
 * This function checks for whether or not HeadingNode and QuoteNodes are registered on the editor before implementing related functionality
 * @param editor
 * @returns
 */
function registerRichTextEditable(editor) {
    registerRichTextListeners(editor);
    const pasteContextMenu = document.getElementById(PASTE_CONTEXT_MENU_ID);
    if (pasteContextMenu) {
        const pasteText = pasteContextMenu.querySelector('button[data-type="text"]');
        if (pasteText)
            pasteText.addEventListener('click', handlePasteText);
        const pasteHtmlNoStyle = pasteContextMenu.querySelector('button[data-type="html-no-style"]');
        if (pasteHtmlNoStyle)
            pasteHtmlNoStyle.addEventListener('click', handlePasteHTMLNoStyle);
        const pasteHtmlWithStyle = pasteContextMenu.querySelector('button[data-type="html-style"]');
        if (pasteHtmlWithStyle)
            pasteHtmlWithStyle.addEventListener('click', handlePasteHTMLWithStyle);
        const pasteAsHtmlNode = pasteContextMenu.querySelector('button[data-type="html-node"]');
        if (pasteAsHtmlNode)
            pasteAsHtmlNode.addEventListener('click', handlePasteAsHtmlNode);
    }
    const arr = [editor.registerCommand(lexicalLexical_js_1.CLICK_COMMAND, payload => {
            if (payload) {
                const root = (0, lexicalLexical_js_1.$getRoot)();
                if (root) {
                    const nodes = root.getChildren();
                    if ((0, lexicalLexical_js_1.$isDecoratorNode)(nodes[nodes.length - 1])) {
                        const lastNode = nodes[nodes.length - 1];
                        const nodeKey = lastNode.getKey();
                        const element = editor.getElementByKey(nodeKey);
                        if (element && payload.clientY > element.getBoundingClientRect().bottom + window.scrollY) {
                            root.append((0, lexicalLexical_js_1.$createParagraphNode)());
                            return true;
                        }
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), editor.registerCommand(lexicalLexical_js_1.DELETE_CHARACTER_COMMAND, isBackward => {
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
            if (typeof eventOrText === 'string') {
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    selection.insertText(eventOrText);
                }
                else if ((0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection))
                    ;
            }
            else {
                if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection) && !(0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) {
                    return false;
                }
                const dataTransfer = eventOrText.dataTransfer;
                if (dataTransfer != null) {
                    (0, lexical_clipboardLexicalClipboard_js_1.$insertDataTransferForRichText)(dataTransfer, selection, editor);
                }
                else if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    const data = eventOrText.data;
                    if (data) {
                        selection.insertText(data);
                    }
                    return true;
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
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, format => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            selection.formatText(format);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, format => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection) && !(0, lexicalLexical_js_1.$isNodeSelection)(selection)) {
                return false;
            }
            const nodes = selection.getNodes();
            for (const node of nodes) {
                const element = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, parentNode => (0, lexicalLexical_js_1.$isElementNode)(parentNode) && !parentNode.isInline());
                if (element !== null) {
                    element.setFormat(format);
                }
            }
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
            const node = selection.insertParagraph();
            if (node)
                node.setFormat('left');
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.INSERT_TAB_COMMAND, () => {
            (0, lexicalLexical_js_1.$insertNodes)([(0, lexicalLexical_js_1.$createTabNode)()]);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.INDENT_CONTENT_COMMAND, () => {
            return handleIndentAndOutdent(block => {
                const indent = block.getIndent();
                block.setIndent(indent + 1);
            });
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.OUTDENT_CONTENT_COMMAND, () => {
            return handleIndentAndOutdent(block => {
                const indent = block.getIndent();
                if (indent > 0) {
                    block.setIndent(indent - 1);
                }
            });
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_BACKSPACE_COMMAND, event => {
            if ($isTargetWithinDecorator(event.target)) {
                return false;
            }
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            event.preventDefault();
            const { anchor } = selection;
            const anchorNode = anchor.getNode();
            if (selection.isCollapsed() && anchor.offset === 0 && !(0, lexicalLexical_js_1.$isRootNode)(anchorNode)) {
                const element = (0, lexical_utilsLexicalUtils_js_1.$getNearestBlockElementAncestorOrThrow)(anchorNode);
                if (element.getIndent() > 0) {
                    return editor.dispatchCommand(lexicalLexical_js_1.OUTDENT_CONTENT_COMMAND, undefined);
                }
            }
            return editor.dispatchCommand(lexicalLexical_js_1.DELETE_CHARACTER_COMMAND, true);
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_DELETE_COMMAND, event => {
            if ($isTargetWithinDecorator(event.target)) {
                return false;
            }
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
                if (event.shiftKey) {
                    return editor.dispatchCommand(lexicalLexical_js_1.INSERT_LINE_BREAK_COMMAND, false);
                }
            }
            return editor.dispatchCommand(lexicalLexical_js_1.INSERT_PARAGRAPH_COMMAND, undefined);
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ESCAPE_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            editor.blur();
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DROP_COMMAND, event => {
            const [, files] = eventFiles(event);
            if (files.length > 0) {
                const x = event.clientX;
                const y = event.clientY;
                const eventRange = caretFromPoint(x, y);
                if (eventRange !== null) {
                    const { offset: domOffset, node: domNode } = eventRange;
                    const node = (0, lexicalLexical_js_1.$getNearestNodeFromDOMNode)(domNode);
                    if (node !== null) {
                        const selection = (0, lexicalLexical_js_1.$createRangeSelection)();
                        if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
                            selection.anchor.set(node.getKey(), domOffset, 'text');
                            selection.focus.set(node.getKey(), domOffset, 'text');
                        }
                        else {
                            const parentKey = node.getParentOrThrow().getKey();
                            const offset = node.getIndexWithinParent() + 1;
                            selection.anchor.set(parentKey, offset, 'element');
                            selection.focus.set(parentKey, offset, 'element');
                        }
                        const normalizedSelection = (0, lexicalLexical_js_1.$normalizeSelection__EXPERIMENTAL)(selection);
                        (0, lexicalLexical_js_1.$setSelection)(normalizedSelection);
                    }
                    editor.dispatchCommand(DRAG_DROP_PASTE, files);
                }
                event.preventDefault();
                return true;
            }
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DRAGSTART_COMMAND, event => {
            const [isFileTransfer] = eventFiles(event);
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (isFileTransfer && !(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.DRAGOVER_COMMAND, event => {
            const [isFileTransfer] = eventFiles(event);
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (isFileTransfer && !(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            const x = event.clientX;
            const y = event.clientY;
            const eventRange = caretFromPoint(x, y);
            if (eventRange !== null) {
                const node = (0, lexicalLexical_js_1.$getNearestNodeFromDOMNode)(eventRange.node);
                if ((0, lexicalLexical_js_1.$isDecoratorNode)(node)) {
                    // Show browser caret as the user is dragging the media across the screen. Won't work
                    // for DecoratorNode nor it's relevant.
                    event.preventDefault();
                }
            }
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.SELECT_ALL_COMMAND, () => {
            (0, lexicalLexical_js_1.$selectAll)();
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CUT_COMMAND, event => {
            onCutForRichText(event, editor);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.PASTE_COMMAND, event => {
            const [, files, hasTextContent] = eventFiles(event);
            if (files.length > 0 && !hasTextContent) {
                editor.dispatchCommand(DRAG_DROP_PASTE, files);
                return true;
            }
            // if inputs then paste within the input ignore creating a new node on paste event
            if ((0, lexicalLexical_js_1.isSelectionCapturedInDecoratorInput)(event.target)) {
                return false;
            }
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) || (0, lexicalLexical_js_1.DEPRECATED_$isGridSelection)(selection)) {
                onPasteForRichText(event, editor);
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CLEAR_EDITOR_COMMAND, () => {
            const root = (0, lexicalLexical_js_1.$getRoot)();
            root.clear();
            root.append((0, lexicalLexical_js_1.$createParagraphNode)().append((0, lexicalLexical_js_1.$createTextNode)()));
            root.selectEnd();
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.FOCUS_COMMAND, () => {
            const root = (0, lexicalLexical_js_1.$getRoot)();
            const IS_EMPTY = root.isEmpty();
            if (IS_EMPTY) {
                const p = (0, lexicalLexical_js_1.$createParagraphNode)();
                const text = (0, lexicalLexical_js_1.$createTextNode)();
                p.append(text);
                root.append(p);
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), registerRichTextNotEditable(editor), editor.registerCommand(lexical_sharedLexicalShared_js_1.LAUNCH_TEXT_INSERTION_COMMAND, ({ rect, html }) => {
            TEXT_CONTENT_TO_INSERT = html;
            const PORTAL_EL = document.getElementById('text-table-selection-ref');
            if (PORTAL_EL) {
                PORTAL_EL.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                PORTAL_EL.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                openPasteOptionsMenu(PORTAL_EL, editor);
            }
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_NORMAL), editor.registerCommand(lexicalLexical_js_1.FOCUS_COMMAND, () => {
            if (CLOSE_PASTE_MENU_BLUR_TIMEOUT)
                clearTimeout(CLOSE_PASTE_MENU_BLUR_TIMEOUT);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.BLUR_COMMAND, () => {
            CLOSE_PASTE_MENU_BLUR_TIMEOUT = setTimeout(() => {
                closePasteOptionsMenu();
                CLOSE_PASTE_MENU_BLUR_TIMEOUT = null;
            }, 500);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
            closePasteOptionsMenu();
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.REGISTER_TOOLBAR_LISTENERS, () => {
            registerRichTextListeners(editor);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    if (editor.hasNode(HeadingNode)) {
        arr.push(editor.registerCommand(CREATE_HEADING_COMMAND, payload => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                if (payload === "p") {
                    (0, lexical_selectionLexicalSelection_js_1.$setBlocksType)(selection, () => (0, lexicalLexical_js_1.$createParagraphNode)());
                    return true;
                }
                else {
                    (0, lexical_selectionLexicalSelection_js_1.$setBlocksType)(selection, () => $createHeadingNode(payload));
                    return true;
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    }
    if (editor.hasNode(QuoteNode)) {
        arr.push(editor.registerCommand(INSERT_QUOTE_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                (0, lexical_selectionLexicalSelection_js_1.$setBlocksType)(selection, () => $createQuoteNode());
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    }
    if (editor._rootElement && !!!editor._rootElement.hasAttribute('data-no-color')) {
        arr.push(editor.registerCommand(lexicalLexical_js_1.KEY_ENTER_COMMAND, () => {
            var _a;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
                const nodes = selection.getNodes();
                if (nodes.length) {
                    const node = nodes[0];
                    if ((0, lexicalLexical_js_1.$isTextNode)(node) && ((0, lexicalLexical_js_1.$isParagraphNode)(node.getParent()) || ((_a = node.getParent()) === null || _a === void 0 ? void 0 : _a.getType()) === "heading")) {
                        const para = node.getParent();
                        const textContent = para.getTextContent();
                        if (/css\[.*\]/.test(textContent)) {
                            const cssStr = textContent.slice(4, textContent.length - 1);
                            if (para.getType() === "paragraph") {
                                const blockStyle = (0, lexicalLexical_js_1.extractStylesFromCssText)(cssStr, 'p');
                                para.setBlockStyle(blockStyle);
                                return true;
                            }
                            else if (para.getType() === "heading") {
                                const tag = para.getTag();
                                const blockStyle = (0, lexicalLexical_js_1.extractStylesFromCssText)(cssStr, tag);
                                para.setBlockStyle(blockStyle);
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_HIGH));
    }
    arr.push(editor.registerCommand(COPY_EDITOR_COMMAND, () => {
        var _a;
        const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
        editor.update(() => {
            (0, lexicalLexical_js_1.$selectAll)();
            const lexicalString = (0, lexical_clipboardLexicalClipboard_js_1.$getLexicalContent)(editor);
            const htmlString = (0, lexical_clipboardLexicalClipboard_js_1.$getHtmlContent)(editor);
            if (htmlString && ClipboardItem.supports('text/html')) {
                const clipboardItem = new ClipboardItem({
                    'text/html': htmlString
                });
                navigator.clipboard.write([clipboardItem]);
            }
            if (lexicalString && ClipboardItem.supports('application/json')) {
                const clipboardItem = new ClipboardItem({
                    'application/json': JSON.parse(lexicalString)
                });
                navigator.clipboard.write([clipboardItem]);
            }
            if (wrapper && ClipboardItem.supports('text/plain')) {
                navigator.clipboard.writeText(wrapper.innerText);
            }
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                detail: {
                    severity: "success",
                    message: 'Successfully copied editor state to clipboard!'
                }
            }));
        });
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerRichTextEditable = registerRichTextEditable;
function registerRichTextNotEditable(editor) {
    const arr = [editor.registerCommand(lexicalLexical_js_1.CLICK_COMMAND, payload => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isNodeSelection)(selection)) {
                selection.clear();
                return true;
            }
            return false;
        }, 0), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_UP_COMMAND, event => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isNodeSelection)(selection) && !$isTargetWithinDecorator(event.target)) {
                // If selection is on a node, let's try and move selection
                // back to being a range selection.
                const nodes = selection.getNodes();
                if (nodes.length > 0) {
                    nodes[0].selectPrevious();
                    return true;
                }
            }
            else if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                const possibleNode = (0, lexicalLexical_js_1.$getAdjacentNode)(selection.focus, true);
                if (!event.shiftKey && (0, lexicalLexical_js_1.$isDecoratorNode)(possibleNode) && !possibleNode.isIsolated() && !possibleNode.isInline()) {
                    possibleNode.selectPrevious();
                    event.preventDefault();
                    return true;
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_DOWN_COMMAND, event => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isNodeSelection)(selection)) {
                // If selection is on a node, let's try and move selection
                // back to being a range selection.
                const nodes = selection.getNodes();
                if (nodes.length > 0) {
                    nodes[0].selectNext(0, 0);
                    return true;
                }
            }
            else if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                if ($isSelectionAtEndOfRoot(selection)) {
                    event.preventDefault();
                    return true;
                }
                const possibleNode = (0, lexicalLexical_js_1.$getAdjacentNode)(selection.focus, false);
                if (!event.shiftKey && (0, lexicalLexical_js_1.$isDecoratorNode)(possibleNode) && !possibleNode.isIsolated() && !possibleNode.isInline()) {
                    possibleNode.selectNext();
                    event.preventDefault();
                    return true;
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_LEFT_COMMAND, event => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isNodeSelection)(selection)) {
                // If selection is on a node, let's try and move selection
                // back to being a range selection.
                const nodes = selection.getNodes();
                if (nodes.length > 0) {
                    event.preventDefault();
                    nodes[0].selectPrevious();
                    return true;
                }
            }
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            if ((0, lexical_selectionLexicalSelection_js_1.$shouldOverrideDefaultCharacterSelection)(selection, true)) {
                const isHoldingShift = event.shiftKey;
                event.preventDefault();
                (0, lexical_selectionLexicalSelection_js_1.$moveCharacter)(selection, isHoldingShift, true);
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_RIGHT_COMMAND, event => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isNodeSelection)(selection) && !$isTargetWithinDecorator(event.target)) {
                // If selection is on a node, let's try and move selection
                // back to being a range selection.
                const nodes = selection.getNodes();
                if (nodes.length > 0) {
                    event.preventDefault();
                    nodes[0].selectNext(0, 0);
                    return true;
                }
            }
            if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                return false;
            }
            const isHoldingShift = event.shiftKey;
            if ((0, lexical_selectionLexicalSelection_js_1.$shouldOverrideDefaultCharacterSelection)(selection, false)) {
                event.preventDefault();
                (0, lexical_selectionLexicalSelection_js_1.$moveCharacter)(selection, isHoldingShift, false);
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.COPY_COMMAND, event => {
            (0, lexical_clipboardLexicalClipboard_js_1.copyToClipboard)(editor, (0, lexical_utilsLexicalUtils_js_1.objectKlassEquals)(event, ClipboardEvent) ? event : null);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerRichTextNotEditable = registerRichTextNotEditable;
