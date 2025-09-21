"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDetailsElementNotEdiable = exports.registerDetailsElementEditable = exports.DetailsNode = exports.AccordionContentNode = exports.$isDetailsNode = exports.$isAccordionContentNode = exports.$createDetailsNode = exports.$createAccordionContentNode = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
function convertAccordionContentElement(domNode) {
    const node = $createAccordionContentNode();
    return {
        node
    };
}
const CURRENT_VERSION$1 = 1;
class AccordionContentNode extends lexicalLexical_js_1.ElementNode {
    constructor() {
        super(...arguments);
        this.__version = CURRENT_VERSION$1;
    }
    static getType() {
        return 'accordion-content';
    }
    static clone(node) {
        return new AccordionContentNode(node.__key);
    }
    createDOM(config) {
        const dom = document.createElement('div');
        dom.classList.add('accordion-content');
        dom.setAttribute("data-v", String(CURRENT_VERSION$1));
        if (this.getFirstElement())
            dom.classList.add('first-rte-element');
        if (this.getLastElement())
            dom.classList.add('last-rte-element');
        return dom;
    }
    updateDOM(prevNode, dom) {
        return false;
    }
    static importDOM() {
        return {
            div: domNode => {
                if (!domNode.hasAttribute('data-frank-accordion-content')) {
                    return null;
                }
                return {
                    conversion: convertAccordionContentElement,
                    priority: 4
                };
            }
        };
    }
    exportDOM() {
        const element = document.createElement('div');
        element.setAttribute('data-frank-accordion-content', 'true');
        element.setAttribute("data-v", String(CURRENT_VERSION$1));
        return {
            element
        };
    }
    static importJSON(serializedNode) {
        return $createAccordionContentNode();
    }
    isShadowRoot() {
        return true;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'accordion-content',
            version: CURRENT_VERSION$1
        };
    }
    canBeEmpty() {
        return false;
    }
}
exports.AccordionContentNode = AccordionContentNode;
function $createAccordionContentNode() {
    return new AccordionContentNode();
}
exports.$createAccordionContentNode = $createAccordionContentNode;
function $isAccordionContentNode(node) {
    return node instanceof AccordionContentNode;
}
exports.$isAccordionContentNode = $isAccordionContentNode;
const CURRENT_VERSION = 1;
const summarySVG = `<svg contenteditable="false" class="details" focusable="false" inert viewBox="0 0 24 24"><path contenteditable="false" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>`;
function getHandleSummaryClick(key) {
    const func = function (e) {
        const editor = this.closest('div.lexical-wrapper');
        const detailsParent = this.parentElement;
        if (editor && detailsParent && detailsParent.nodeName === "DETAILS") {
            const isOpen = detailsParent.hasAttribute('open');
            const id = editor.id;
            const editorInstances = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
            const editorInstance = editorInstances[id];
            if (editorInstance && editorInstance.isEditable()) {
                editorInstance.update(() => {
                    const detailsNode = (0, lexicalLexical_js_1.$getNodeByKey)(key);
                    if ($isDetailsNode(detailsNode)) {
                        detailsNode.setOpen(!!!isOpen);
                    }
                });
            }
        }
    };
    return func;
}
class DetailsNode extends lexicalLexical_js_1.ElementNode {
    constructor({ flat, summary }, key) {
        super(key);
        this.__open = false;
        this.__version = CURRENT_VERSION;
        this.__summary = summary;
        this.__flat = flat;
    }
    static getType() {
        return 'details';
    }
    static clone(node) {
        return new DetailsNode({
            summary: node.getSummary(),
            flat: node.getFlat()
        }, node.__key);
    }
    createDOM(_config, _editor) {
        const details = document.createElement('details');
        details.setAttribute('data-node-key', this.getKey());
        details.classList.add('rte');
        if (this.getFlat())
            details.classList.add('flat');
        const span = document.createElement('span');
        span.innerText = this.getSummary();
        span.classList.add('h6', 'bold');
        span.setAttribute('contenteditable', 'false');
        const summaryEl = document.createElement('summary');
        summaryEl.setAttribute('contenteditable', 'false');
        summaryEl.setAttribute('data-rte', '');
        summaryEl.append(span);
        summaryEl.insertAdjacentHTML("beforeend", summarySVG);
        details.append(summaryEl);
        summaryEl.addEventListener('click', getHandleSummaryClick(this.__key), true);
        if (this.__open) {
            details.setAttribute('open', '');
        }
        details.setAttribute('data-v', String(CURRENT_VERSION));
        if (this.getFirstElement())
            details.classList.add('first-rte-element');
        if (this.getLastElement())
            details.classList.add('last-rte-element');
        return details;
    }
    updateDOM(_prevNode, _dom, _config) {
        if (_prevNode.__flat !== this.getFlat() || _prevNode.__summary !== this.getSummary() || _prevNode.__open !== this.getOpen())
            return true;
        else
            return false;
    }
    exportDOM() {
        const element = document.createElement('details');
        element.setAttribute('data-details-summary', this.getSummary());
        element.setAttribute('data-flat', String(this.getFlat()));
        element.setAttribute('data-v', String(CURRENT_VERSION));
        if (this.getFirstElement() && !!!lexical_sharedLexicalShared_js_1.IS_REAL_BROWSER)
            element.classList.add('first-rte-element');
        if (this.getLastElement() && !!!lexical_sharedLexicalShared_js_1.IS_REAL_BROWSER)
            element.classList.add('last-rte-element');
        return {
            element
        };
    }
    static importDOM() {
        return {
            details: domNode => {
                return {
                    conversion: convertDetailsElement,
                    priority: 1
                };
            }
        };
    }
    static importJSON(serializedJSON) {
        const { flat, summary } = serializedJSON;
        const node = $createDetailsNode({
            summary,
            flat
        });
        node.setFirstElement(serializedJSON === null || serializedJSON === void 0 ? void 0 : serializedJSON.first_element);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            summary: this.getSummary(),
            flat: this.getFlat(),
            type: 'details',
            version: CURRENT_VERSION
        };
    }
    getSummary() {
        const self = this.getLatest();
        return self.__summary;
    }
    setSummary(s) {
        const self = this.getWritable();
        self.__summary = s.slice(0, 50);
        return self;
    }
    getFlat() {
        const self = this.getLatest();
        return self.__flat;
    }
    setFlat(b) {
        const self = this.getWritable();
        self.__flat = b;
        return self;
    }
    append(...nodesToAppend) {
        if (this.getChildrenSize() === 0 && $isAccordionContentNode(nodesToAppend[0])) {
            return super.append(nodesToAppend[0].append(...nodesToAppend.slice(1)));
        }
        else if (this.getChildrenSize() === 1) {
            return super.append(...nodesToAppend.filter(node => !!!$isDetailsNode(node) && !!!$isAccordionContentNode(node)));
        }
        else {
            const accordionContentNode = $createAccordionContentNode();
            const children = this.getChildren();
            accordionContentNode.append(...children.filter(node => !!!$isDetailsNode(node) && !!!$isAccordionContentNode(node)));
            super.clear();
            return super.append(accordionContentNode);
        }
    }
    canIndent() {
        return false;
    }
    isShadowRoot() {
        return true;
    }
    select(_anchorOffset, _focusOffset) {
        if (_anchorOffset === 0 && _focusOffset === 0 || !!!_anchorOffset && !!!_focusOffset) {
            const children = this.getChildren();
            const accordionContent = children.filter(node => $isAccordionContentNode(node));
            if (accordionContent.length === 1) {
                return accordionContent[0].select(_anchorOffset, _focusOffset);
            }
            else {
                return super.select(_anchorOffset, _focusOffset);
            }
        }
        else {
            return super.select(_anchorOffset, _focusOffset);
        }
    }
    setOpen(b) {
        const self = this.getWritable();
        self.__open = b;
        return self;
    }
    getOpen() {
        return this.getLatest().__open;
    }
}
exports.DetailsNode = DetailsNode;
function convertDetailsElement(domNode) {
    const summary = String(domNode.getAttribute('data-details-summary'));
    const flat = Boolean(domNode.getAttribute('data-flat') === "true");
    const first_element = domNode.classList.contains('first-rte-element');
    const last_element = domNode.classList.contains('last-rte-element');
    const node = $createDetailsNode({
        summary,
        flat
    });
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
        node
    };
}
function $createDetailsNode({ summary, flat }) {
    return new DetailsNode({
        flat,
        summary
    });
}
exports.$createDetailsNode = $createDetailsNode;
function $isDetailsNode(node) {
    return node instanceof DetailsNode;
}
exports.$isDetailsNode = $isDetailsNode;
const INSERT_DETAILS_COMMAND = (0, lexicalLexical_js_1.createCommand)('INSERT_DETAILS_COMMAND');
var DETAILS_SELECTION_NODE_AFTER = null;
function getDetailsForm() {
    const detailsForm = document.getElementById('lexical-insert-details-form');
    const dialog = document.getElementById('details-content-lexical');
    if (detailsForm && dialog) {
        const summary = detailsForm.querySelector('input[id="lexical-details-summary-title"]');
        const flat = detailsForm.querySelector('input[id="lexical-insert-details-flat"]');
        const outputSpan = dialog.querySelector('span[data-output]');
        const outputDetails = dialog.querySelector('details[data-output]');
        return {
            form: detailsForm,
            dialog,
            summary: summary ? summary.value : null,
            flat: Boolean((flat === null || flat === void 0 ? void 0 : flat.checked) === true),
            outputSpan,
            outputDetails,
            summaryEl: summary
        };
    }
    else
        return null;
}
function handleDetailsFormChange(e) {
    e.stopPropagation();
    const form = getDetailsForm();
    if (form) {
        if (form.summary && form.outputSpan)
            form.outputSpan.innerText = form.summary;
        if (form.outputDetails) {
            form.outputDetails.classList.add('rte');
            if (form.flat)
                form.outputDetails.classList.add('flat');
            else
                form.outputDetails.classList.remove('flat');
        }
    }
}
function handleDetailsFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const form = getDetailsForm();
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (form && form.summary && editor) {
        editor.dispatchCommand(INSERT_DETAILS_COMMAND, {
            summary: form.summary,
            flat: form.flat
        });
        (0, lexical_sharedLexicalShared_js_1.closeDialog)(form.dialog);
    }
}
function setDetailsForm() {
    const detailsForm = getDetailsForm();
    if (detailsForm && detailsForm) {
        detailsForm.form.addEventListener('change', handleDetailsFormChange);
        if (detailsForm.summaryEl)
            detailsForm.summaryEl.addEventListener('input', handleDetailsFormChange);
        detailsForm.form.addEventListener('submit', handleDetailsFormSubmit);
    }
}
function getOnOpenDetailsDialog(e) {
    if (e.detail.el.id === "details-content-lexical") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.getEditorState().read(() => {
                var _a, _b;
                const node = (_b = (_a = (0, lexicalLexical_js_1.$getSelection)()) === null || _a === void 0 ? void 0 : _a.getNodes()) === null || _b === void 0 ? void 0 : _b[0];
                if (node) {
                    DETAILS_SELECTION_NODE_AFTER = node.getKey();
                }
            });
        }
        setDetailsForm();
        const dialog = document.getElementById('details-content-lexical');
        if (dialog)
            document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
                detail: {
                    dialog: dialog
                }
            }));
    }
}
function registerDetailsElementEditable(editor) {
    if (editor.hasNodes([DetailsNode, AccordionContentNode])) {
        document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenDetailsDialog);
        return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(INSERT_DETAILS_COMMAND, payload => {
            if (DETAILS_SELECTION_NODE_AFTER) {
                const anchorNode = (0, lexicalLexical_js_1.$getNodeByKey)(DETAILS_SELECTION_NODE_AFTER);
                if (!!!anchorNode) {
                    const root = (0, lexicalLexical_js_1.$getRoot)();
                    root.append($createDetailsNode({
                        ...payload
                    }).append($createAccordionContentNode().append((0, lexicalLexical_js_1.$createParagraphNode)())));
                }
                else {
                    const nearestNodeBelowRoot = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchorNode, node => (0, lexicalLexical_js_1.$isElementNode)(node) && (0, lexicalLexical_js_1.$isRootNode)(node.getParent()));
                    if (nearestNodeBelowRoot) {
                        const detailsNode = $createDetailsNode({
                            ...payload
                        }).append($createAccordionContentNode().append((0, lexicalLexical_js_1.$createParagraphNode)()));
                        nearestNodeBelowRoot.insertAfter(detailsNode);
                    }
                }
            }
            else {
                const root = (0, lexicalLexical_js_1.$getRoot)();
                root.append($createDetailsNode({
                    ...payload
                }).append($createAccordionContentNode().append((0, lexicalLexical_js_1.$createParagraphNode)())));
            }
            DETAILS_SELECTION_NODE_AFTER = null;
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_UP_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed() && editor.isEditable()) {
                const anchor = selection.anchor.getNode();
                const paragraphNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchor, node => (0, lexicalLexical_js_1.$isParagraphNode)(node) && $isAccordionContentNode(node.getParent()));
                if (paragraphNode) {
                    const accordionContent = paragraphNode.getParent();
                    const firstChild = accordionContent.getFirstChild();
                    const details = accordionContent.getParent();
                    if (firstChild && firstChild.is(paragraphNode) && selection.is(paragraphNode.selectStart()) && $isDetailsNode(details) && details.getPreviousSibling() === null) {
                        const p = (0, lexicalLexical_js_1.$createParagraphNode)();
                        details.insertBefore(p);
                        p.selectEnd();
                        return true;
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), editor.registerCommand(lexicalLexical_js_1.INSERT_PARAGRAPH_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed() && editor.isEditable()) {
                const anchor = selection.anchor.getNode();
                const paragraphNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchor, node => (0, lexicalLexical_js_1.$isParagraphNode)(node) && $isAccordionContentNode(node.getParent()));
                if (paragraphNode) {
                    const accordionContent = paragraphNode.getParent();
                    const details = accordionContent.getParent();
                    const lastChild = accordionContent.getLastChild();
                    const previousChild = lastChild === null || lastChild === void 0 ? void 0 : lastChild.getPreviousSibling();
                    if (accordionContent.getChildrenSize() >= 3 && (0, lexicalLexical_js_1.$isParagraphNode)(lastChild) && (0, lexicalLexical_js_1.$isParagraphNode)(previousChild) && lastChild.isEmpty() && previousChild.isEmpty() && $isDetailsNode(details)) {
                        lastChild.remove();
                        previousChild.remove();
                        const p = (0, lexicalLexical_js_1.$createParagraphNode)();
                        details.insertAfter(p);
                        p.selectEnd();
                        return true;
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), editor.registerCommand(lexicalLexical_js_1.KEY_ENTER_COMMAND, e => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
                const nodes = selection.getNodes();
                if (nodes.length) {
                    const node = nodes[0];
                    if (node) {
                        const para = node.getParent();
                        if ((0, lexicalLexical_js_1.$isParagraphNode)(para)) {
                            const textContent = para.getTextContent();
                            if (/^\^.*\^([flat])?$/.test(textContent)) {
                                var title = textContent;
                                const flat = title.endsWith('[flat]');
                                if (flat) {
                                    title = title.slice(1, title.length - 7);
                                }
                                else {
                                    title = title.slice(1, title.length - 1);
                                }
                                para.remove();
                                editor.dispatchCommand(INSERT_DETAILS_COMMAND, {
                                    summary: title,
                                    flat
                                });
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_HIGH), registerDetailsElementNotEdiable(editor));
    }
    else {
        console.error("Editor does not have DetailsNode or AccordionContentNode registered.");
    }
    return () => {
        return;
    };
}
exports.registerDetailsElementEditable = registerDetailsElementEditable;
function registerDetailsElementNotEdiable(editor) {
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_DOWN_COMMAND, () => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed() && editor.isEditable()) {
            const anchor = selection.anchor.getNode();
            const paragraphNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(anchor, node => (0, lexicalLexical_js_1.$isParagraphNode)(node) && $isAccordionContentNode(node.getParent()));
            if (paragraphNode) {
                const accordionContent = paragraphNode.getParent();
                const lastChild = accordionContent.getLastChild();
                const details = accordionContent.getParent();
                if (lastChild && lastChild.is(paragraphNode) && selection.is(paragraphNode.selectEnd()) && $isDetailsNode(details) && details.getNextSibling() === null) {
                    const p = (0, lexicalLexical_js_1.$createParagraphNode)();
                    details.insertAfter(p);
                    p.selectEnd();
                    return true;
                }
            }
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL));
}
exports.registerDetailsElementNotEdiable = registerDetailsElementNotEdiable;
