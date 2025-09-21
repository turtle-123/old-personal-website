"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommentNotEditable = exports.registerCommentEditable = exports.registerCommentArticleNotEditable = exports.registerBlockStyleCustomization = exports.registerAutocompleteEditable = exports.registerAnnotationNotEditable = exports.registerAnnotationEditable = exports.registerAIWritingHelperEditable = exports.openAIWriterMenu = exports.onShareArticle = exports.onCommentArticle = exports.onAskAiSelection = exports.onAnnotateArticle = exports.onAfterReloadHistoryDialogOpen = exports.makeTransparentCallback = exports.handleHeadingKeyUp = exports.getPortalEl = exports.getOnDocumentClickArticle = exports.fontWeightChangeCallback = exports.fontSizeChangeCallback = exports.fontFamilyChangeCallback = exports.convertAnnotationNodeElement = exports.closeFloatingContextMenu = exports.closeFloatingArticleMenu = exports.closeAIWriterMenu = exports.clearTextFormattingCallback = exports.backgroundColorChangeCallback = exports.appendRichTextEditorToOutput = exports.UPDATE_TOOLBAR_COMMAND = exports.SCROLL_TO_NODE = exports.RECEIVE_COMMENT_ARTICLE_COMMAND = exports.RECEIVE_ANNOTATE_ARTICLE_COMMAND = exports.MaxHeightButtonNode = exports.LAUNCH_TABLE_MENU = exports.LAUNCH_SELECTION_MENU = exports.LAUNCH_ARTICLE_SELECTION_MENU = exports.FONT_WEIGHT_CHANGE = exports.FONT_SIZE_TO_CSS = exports.FONT_SIZE_CHANGE = exports.FONT_FAMILY_CHANGE = exports.COPY_LINK_SELECTION = exports.AutocompleteNode = exports.AnnotationNode = exports.ASK_AI_COMMAND = exports.ALLOWED_FONT_WEIGHTS = exports.ALLOWED_FONT_SIZES = exports.ADD_COMMENT_ARTICLE_COMMAND = exports.ADD_ANNOTATE_ARTICLE_COMMAND = exports.$isAnnotationNode = exports.$createAnnotationNode = void 0;
exports.textColorChangeCallback = exports.setShareArticleSelection = exports.registerToolbarEditable = exports.registerSaveAndReloadHistoryEditable = exports.registerPollQuestionToolbar = exports.registerNoToolbar = exports.registerMaxHeightNode = exports.registerLoadUnloadToolbarEditable = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexical_selectionLexicalSelection_js_1 = require("./lexical-selectionLexicalSelection.js");
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
const dom_1 = require("@floating-ui/dom");
const lexical_fileLexicalFile_js_1 = require("./lexical-fileLexicalFile.js");
const lexical_rich_textLexicalRichText_js_1 = require("./lexical-rich-textLexicalRichText.js");
const lexical_clipboardLexicalClipboard_js_1 = require("./lexical-clipboardLexicalClipboard.js");
const lexical_decoratorsLexicalDecorators_js_1 = require("./lexical-decoratorsLexicalDecorators.js");
const lexical_tableLexicalTable_js_1 = require("./lexical-tableLexicalTable.js");
const lexical_mathLexicalMath_js_1 = require("./lexical-mathLexicalMath.js");
const lexical_linkLexicalLink_js_1 = require("./lexical-linkLexicalLink.js");
const lexical_htmlLexicalHtml_js_1 = require("./lexical-htmlLexicalHtml.js");
/**
 * The id of the example element
 */
const BLOCK_STYLE_FORM_EXAMPLE_ID = "block-style-form-example";
var SELECTION = {};
const isListNode = node => Boolean(node.getType() === "list");
const isHeadingNode$1 = node => Boolean(node.getType() === "heading");
const blockStyleInputs = [{
        "id": "lex-block-background-color",
        "key": "backgroundColor"
    }, {
        "id": "lex-block-background-color-transparent",
        "key": "backgroundColorTransparent"
    }, {
        "id": "lex-block-text-color",
        "key": "textColor"
    }, {
        "id": "lex-block-text-color-inherit",
        "key": "textColorInherit"
    }, {
        "id": "lex-block-margin",
        "key": "margin"
    }, {
        "id": "lex-block-padding",
        "key": "padding"
    }, {
        "id": "lex-block-margin-top",
        "key": "marginTop"
    }, {
        "id": "lex-block-padding-top",
        "key": "paddingTop"
    }, {
        "id": "lex-block-margin-right",
        "key": "marginRight"
    }, {
        "id": "lex-block-padding-right",
        "key": "paddingRight"
    }, {
        "id": "lex-block-margin-bottom",
        "key": "marginBottom"
    }, {
        "id": "lex-block-padding-bottom",
        "key": "paddingBottom"
    }, {
        "id": "lex-block-margin-left",
        "key": "marginLeft"
    }, {
        "id": "lex-block-padding-left",
        "key": "paddingLeft"
    }, {
        "id": "lex-block-border-color",
        "key": "borderColor"
    }, {
        "id": "lex-block-border-color-transparent",
        "key": "borderColorTransparent"
    }, {
        "id": "border-style-value",
        "key": "borderStyle"
    }, {
        "id": "lex-block-border-width",
        "key": "borderWidth"
    }, {
        "id": "lex-block-border-radius",
        "key": "borderRadius"
    }, {
        "id": "lex-block-border-top-color",
        "key": "borderTopColor"
    }, {
        "id": "lex-block-border-top-color-transparent",
        "key": "borderTopColorTransparent"
    }, {
        "id": "border-top-style-value",
        "key": "borderTopStyle"
    }, {
        "id": "lex-block-border-top-width",
        "key": "borderTopWidth"
    }, {
        "id": "lex-block-border-top-radius",
        "key": "borderTopRadius"
    }, {
        "id": "lex-block-border-right-color",
        "key": "borderRightColor"
    }, {
        "id": "lex-block-border-right-color-transparent",
        "key": "borderRightColorTransparent"
    }, {
        "id": "border-right-style-value",
        "key": "borderRightStyle"
    }, {
        "id": "lex-block-border-right-width",
        "key": "borderRightWidth"
    }, {
        "id": "lex-block-border-right-radius",
        "key": "borderRightRadius"
    }, {
        "id": "lex-block-border-bottom-color",
        "key": "borderBottomColor"
    }, {
        "id": "lex-block-border-bottom-color-transparent",
        "key": "borderBottomColorTransparent"
    }, {
        "id": "border-bottom-style-value",
        "key": "borderBottomStyle"
    }, {
        "id": "lex-block-border-bottom-width",
        "key": "borderBottomWidth"
    }, {
        "id": "lex-block-border-bottom-radius",
        "key": "borderBottomRadius"
    }, {
        "id": "lex-block-border-left-color",
        "key": "borderLeftColor"
    }, {
        "id": "lex-block-border-left-color-transparent",
        "key": "borderLeftColorTransparent"
    }, {
        "id": "border-left-style-value",
        "key": "borderLeftStyle"
    }, {
        "id": "lex-block-border-left-width",
        "key": "borderLeftWidth"
    }, {
        "id": "lex-block-border-left-radius",
        "key": "borderLeftRadius"
    }, {
        "id": "lex-block-box-shadow-color",
        "key": "boxShadowColor"
    }, {
        "id": "lex-block-box-shadow-color-transparent",
        "key": "boxShadowColorTransparent"
    }, {
        "id": "lex-block-box-shadow-inset",
        "key": "boxShadowInset"
    }, {
        "id": "lex-block-box-shadow-offset-x",
        "key": "boxShadowOffsetX"
    }, {
        "id": "lex-block-box-shadow-offset-y",
        "key": "boxShadowOffsetY"
    }, {
        "id": "lex-block-box-shadow-blur-radius",
        "key": "boxShadowBlurRadius"
    }, {
        "id": "lex-block-box-shadow-spread-radius",
        "key": "boxShadowSpreadRadius"
    }];
function getDefaultBlockStyleObject(DEFAULT_TEXT_COLOR, DEFAULT_BACKGROUND) {
    return {
        "backgroundColor": DEFAULT_BACKGROUND,
        "backgroundColorTransparent": true,
        "textColor": DEFAULT_TEXT_COLOR,
        "textColorInherit": true,
        "margin": 0,
        "padding": 0,
        "marginTop": 0,
        "paddingTop": 0,
        "marginRight": 0,
        "paddingRight": 0,
        "marginBottom": 6,
        "paddingBottom": 0,
        "marginLeft": 0,
        "paddingLeft": 0,
        "borderColor": DEFAULT_TEXT_COLOR,
        "borderColorTransparent": true,
        "borderStyle": "none",
        "borderWidth": 0,
        "borderRadius": 0,
        "borderTopColor": DEFAULT_TEXT_COLOR,
        "borderTopColorTransparent": true,
        "borderTopStyle": "none",
        "borderTopWidth": 0,
        "borderTopRadius": 0,
        "borderRightColor": DEFAULT_TEXT_COLOR,
        "borderRightColorTransparent": true,
        "borderRightStyle": "none",
        "borderRightWidth": 0,
        "borderRightRadius": 0,
        "borderBottomColor": DEFAULT_TEXT_COLOR,
        "borderBottomColorTransparent": true,
        "borderBottomStyle": "none",
        "borderBottomWidth": 0,
        "borderBottomRadius": 0,
        "borderLeftColor": DEFAULT_TEXT_COLOR,
        "borderLeftColorTransparent": true,
        "borderLeftStyle": "none",
        "borderLeftWidth": 0,
        "borderLeftRadius": 0,
        "boxShadowColor": DEFAULT_TEXT_COLOR,
        "boxShadowColorTransparent": true,
        "boxShadowInset": false,
        "boxShadowOffsetX": 0,
        "boxShadowOffsetY": 0,
        "boxShadowBlurRadius": 0,
        "boxShadowSpreadRadius": 0
    };
}
const pxStr = (num, def) => typeof num === "number" ? num.toString().concat('px') : def;
const ALLOWED_BORDER_STYLES = new Set(["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "none", "hidden"]);
const checkBorderType = s => ALLOWED_BORDER_STYLES.has(s) ? s : 'none';
/**
 * You're going to need to getFormat and indent for a block node
 * and set the textAlign and paddingInlineStart properties before
 */
function getBlockStyleForm() {
    const DEFAULT_TEXT_COLOR = (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)();
    const DEFAULT_BACKGROUND = (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)();
    const obj = getDefaultBlockStyleObject(DEFAULT_TEXT_COLOR, DEFAULT_BACKGROUND);
    blockStyleInputs.forEach(obj2 => {
        const a = document.getElementById(obj2.id);
        if (a) {
            const type = a.getAttribute('type');
            switch (type) {
                case 'number':
                    /* @ts-ignore */
                    if (obj[obj2.key] !== undefined)
                        obj[obj2.key] = Number(parseInt(a.value));
                    return;
                case 'checkbox':
                    /* @ts-ignore */
                    if (obj[obj2.key] !== undefined)
                        obj[obj2.key] = Boolean(a.checked);
                    return;
                default:
                    /* @ts-ignore */
                    if (obj[obj2.key] !== undefined)
                        obj[obj2.key] = a.value;
                    return;
            }
        }
    });
    var cssStr = "";
    const backgroundColor = obj['backgroundColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['backgroundColor']) ? obj['backgroundColor'] : 'transparent';
    cssStr += 'background-color:'.concat(backgroundColor).concat(';');
    const textColor = obj['textColorInherit'] ? 'inherit' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['textColor']) ? obj['textColor'] : 'inherit';
    cssStr += 'color:'.concat(textColor).concat(';');
    const margin = [pxStr(obj['marginTop'], '0px'), pxStr(obj['marginRight'], '0px'), pxStr(obj['marginBottom'], '6px'), pxStr(obj['marginLeft'], '0px')];
    cssStr += 'margin:'.concat(margin.join(' ')).concat(';');
    const padding = [pxStr(obj['paddingTop'], '0px'), pxStr(obj['paddingRight'], '0px'), pxStr(obj['paddingBottom'], '0px'), pxStr(obj['paddingLeft'], '0px')];
    cssStr += 'padding:'.concat(padding.join(' ')).concat(';');
    const borderRadius = [pxStr(obj['borderTopRadius'], '0px'), pxStr(obj['borderRightRadius'], '0px'), pxStr(obj['borderBottomRadius'], '0px'), pxStr(obj['borderLeftRadius'], '0px')];
    cssStr += 'border-radius:'.concat(borderRadius.join(' ')).concat(';');
    const borderTopColor = obj['borderTopColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['borderTopColor']) ? obj['borderTopColor'] : 'transparent';
    const borderRightColor = obj['borderRightColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['borderRightColor']) ? obj['borderRightColor'] : 'transparent';
    const borderBottomColor = obj['borderBottomColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['borderBottomColor']) ? obj['borderBottomColor'] : 'transparent';
    const borderLeftColor = obj['borderLeftColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['borderLeftColor']) ? obj['borderLeftColor'] : 'transparent';
    const borderColor = [borderTopColor, borderRightColor, borderBottomColor, borderLeftColor];
    cssStr += 'border-color:'.concat(borderColor.join(' ')).concat(';');
    const borderWidth = [pxStr(obj['borderTopWidth'], '0px'), pxStr(obj['borderRightWidth'], '0px'), pxStr(obj['borderBottomWidth'], '0px'), pxStr(obj['borderLeftWidth'], '0px')];
    cssStr += 'border-width: '.concat(borderWidth.join(' ')).concat(';');
    const borderType = [checkBorderType(obj['borderTopStyle']), checkBorderType(obj['borderRightStyle']), checkBorderType(obj['borderBottomStyle']), checkBorderType(obj['borderLeftStyle'])];
    cssStr += 'border-style:'.concat(borderType.join(' ')).concat(';');
    const boxShadowOffsetX = pxStr(obj['boxShadowOffsetX'], '0px');
    const boxShadowOffsetY = pxStr(obj['boxShadowOffsetY'], '0px');
    const boxShadowBlurRadius = pxStr(obj['boxShadowBlurRadius'], '0px');
    const boxShadowSpreadRadius = pxStr(obj['boxShadowSpreadRadius'], '0px');
    const boxShadowInset = obj['boxShadowInset'];
    const boxShadowColor = obj['boxShadowColorTransparent'] ? 'transparent' : lexicalLexical_js_1.VALID_HEX_REGEX.test(obj['boxShadowColor']) ? obj['boxShadowColor'] : 'transparent';
    cssStr += 'box-shadow:'.concat(boxShadowInset ? 'inset ' : '').concat(boxShadowOffsetX).concat(' ').concat(boxShadowOffsetY).concat(' ').concat(boxShadowBlurRadius).concat(' ').concat(boxShadowSpreadRadius).concat(' ').concat(boxShadowColor).concat(';');
    return {
        cssStr,
        obj: {
            backgroundColor,
            textColor,
            margin,
            padding,
            borderRadius,
            borderColor,
            borderWidth,
            borderType,
            boxShadowOffsetX,
            boxShadowOffsetY,
            boxShadowBlurRadius,
            boxShadowSpreadRadius,
            boxShadowInset,
            boxShadowColor
        }
    };
}
/**
 * When an input changes on the block style form dialog, change the example element to show this change to the user
 * @param {Event} e Change Event
 */
function handleBlockStyleFormChange(_) {
    const blockStyleForm = getBlockStyleForm();
    const example = document.getElementById(BLOCK_STYLE_FORM_EXAMPLE_ID);
    if (example)
        example.style.cssText = blockStyleForm.cssStr;
}
/**
 * Call whenever an input that affects other inputs on the block style form changes
 */
function handleBlockStyleGeneralInputChange(e) {
    var _a, _b, _c;
    if (e.target) {
        const sides = ['top', 'right', 'bottom', 'left'];
        const id = e.target.id;
        if (id === 'lex-block-border-color') {
            const value = (_a = document.getElementById(id)) === null || _a === void 0 ? void 0 : _a.value;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-border-'.concat(side).concat('-color'));
                if (el)
                    (0, lexical_sharedLexicalShared_js_1.setColorInput)(el, value);
            });
        }
        else if (id === "lex-block-border-color-transparent") {
            const checked = (_b = document.getElementById(id)) === null || _b === void 0 ? void 0 : _b.checked;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-border-'.concat(side).concat('-color-transparent'));
                if (el)
                    el.checked = checked;
            });
        }
        else if (id === "border-style-value") {
            const input = document.getElementById(id);
            const value = input === null || input === void 0 ? void 0 : input.value;
            /* @ts-ignore */
            const text = Array.from((_c = input === null || input === void 0 ? void 0 : input.parentElement) === null || _c === void 0 ? void 0 : _c.querySelectorAll('button[role="option"]')).filter(a => a.getAttribute('data-val') === value).map(el => el.innerText);
            sides.forEach(side => {
                const el = document.getElementById('border-'.concat(side).concat('-style-value'));
                if (el) {
                    (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, value, text.length ? text[0] : value);
                }
            });
        }
        else if (id === "lex-block-border-width") {
            /* @ts-ignore */
            const value = document.getElementById(id).value;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-border-'.concat(side).concat('-width'));
                /* @ts-ignore */
                if (el)
                    el.value = value;
            });
        }
        else if (id === "lex-block-border-radius") {
            /* @ts-ignore */
            const value = document.getElementById(id).value;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-border-'.concat(side).concat('-radius'));
                /* @ts-ignore */
                if (el)
                    el.value = value;
            });
        }
        else if (id === "lex-block-margin") {
            /* @ts-ignore */
            const value = document.getElementById(id).value;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-margin-'.concat(side));
                /* @ts-ignore */
                if (el)
                    el.value = value;
            });
        }
        else if (id === "lex-block-padding") {
            /* @ts-ignore */
            const value = document.getElementById(id).value;
            sides.forEach(side => {
                const el = document.getElementById('lex-block-padding-'.concat(side));
                /* @ts-ignore */
                if (el)
                    el.value = value;
            });
        }
    }
}
/**
 * @this {HTMLFormElement} HTML Form element
 * @param {e} Event Form Submit Event
 */
function handleBlockStyleFormSubmit(e) {
    e.preventDefault();
    const dialog = this.closest('div.dialog-wrapper');
    const blockStyleForm = getBlockStyleForm();
    if (dialog) {
        (0, lexical_sharedLexicalShared_js_1.closeDialog)(dialog);
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.update(() => {
                const firstSelection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
                var selection;
                if (!!!firstSelection)
                    selection = SELECTION[editor._config.namespace];
                else
                    selection = firstSelection;
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    const nodes = selection.getNodes();
                    const blockNodes = [];
                    for (let node of nodes) {
                        const tempNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, n => Boolean((0, lexicalLexical_js_1.$isParagraphNode)(n) || isListNode(n) || isHeadingNode$1(n)));
                        if (tempNode)
                            blockNodes.push(tempNode);
                    }
                    blockNodes.forEach(node => {
                        if ((0, lexicalLexical_js_1.$isParagraphNode)(node) || isListNode(node) || isHeadingNode$1(node)) {
                            if ((0, lexicalLexical_js_1.$isParagraphNode)(node) || isHeadingNode$1(node)) {
                                node.setBlockStyle(blockStyleForm.obj);
                            }
                            else if (isListNode(node)) {
                                var topLevelList = node;
                                var isNested = true;
                                while (isNested) {
                                    const startingElement = topLevelList.getParent();
                                    if (!!!startingElement) {
                                        isNested = false;
                                        continue;
                                    }
                                    const tempListNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(startingElement, n => isListNode(n));
                                    if (tempListNode)
                                        topLevelList = tempListNode;
                                    else
                                        isNested = false;
                                }
                                topLevelList.setBlockStyle(blockStyleForm.obj);
                            }
                        }
                    });
                }
            });
        }
    }
}
function setSelectButton(b, innerText, val) {
    const span = b.querySelector('span');
    if (span)
        span.innerText = innerText;
    const dropdown = b.nextElementSibling;
    if (dropdown && dropdown.classList.contains('select-menu')) {
        const input = dropdown.querySelector('input[type="text"]');
        if (input) {
            input.value = val;
            input.dispatchEvent(new Event('change'));
        }
        const selectButtons = Array.from(dropdown.querySelectorAll('button.select-option'));
        selectButtons.forEach(b => {
            if (b.getAttribute('data-val') === val)
                b.setAttribute('aria-selected', 'true');
            else
                b.setAttribute('aria-selected', 'false');
        });
    }
}
function handleResetBlockStyleForm(e) {
    const borderStyleButtons = ["border-style-select-button"].concat(['top', 'right', 'bottom', 'left'].map(s => `border-${s}-style-select-button`)).map(s => document.getElementById(s)).filter(b => b !== null);
    borderStyleButtons.forEach(b => setSelectButton(b, "None", "none"));
}
const isButton = el => Boolean(el.nodeName === "BUTTON");
const isInput = el => Boolean(el.nodeName === "INPUT");
function randomBorderStyle() {
    const arr = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "none", "hidden"];
    const randVal = arr[Math.floor(Math.random() * arr.length)];
    return {
        val: randVal,
        str: randVal[0].toUpperCase().concat(randVal.slice(1))
    };
}
function randomizeBlockStyleForm() {
    Array.from(blockStyleInputs).forEach(obj => {
        const el = document.getElementById(obj.id);
        if (el && isInput(el)) {
            const type = el.getAttribute('type');
            if (type === 'checkbox') {
                el.checked = false;
                el.dispatchEvent(new Event('change'));
            }
            else if (type === 'number') {
                const minStr = el.getAttribute('min');
                const maxStr = el.getAttribute('max');
                if (minStr && maxStr) {
                    const min = parseInt(minStr);
                    const max = parseInt(maxStr);
                    const newVal = Math.floor(min + Math.random() * (max - min));
                    el.value = String(newVal);
                    el.dispatchEvent(new Event('change'));
                }
            }
            else if (type === 'text') {
                if (el.hasAttribute('hidden')) {
                    const dropdown = el.closest('div.select-menu');
                    if (dropdown) {
                        const button = dropdown.previousElementSibling;
                        if (button && isButton(button)) {
                            const border = randomBorderStyle();
                            setSelectButton(button, border.str, border.val);
                            el.dispatchEvent(new Event('change'));
                        }
                    }
                }
            }
            else if (type === 'color') {
                const randomColor = '#'.concat(Math.floor(Math.random() * 16777215).toString(16));
                el.value = randomColor;
                el.dispatchEvent(new Event('change'));
            }
        }
    });
}
function $isParagraphListHeadingNode(a) {
    return Boolean((a === null || a === void 0 ? void 0 : a.__type) === "paragraph" || (a === null || a === void 0 ? void 0 : a.__type) === "list" || (a === null || a === void 0 ? void 0 : a.__type) === "heading");
}
const DEFAULT_BLOCK_STYLES = {
    textAlign: 'left',
    backgroundColor: 'transparent',
    textColor: 'inherit',
    //'inherit' or color
    margin: ['6px', '0px', '6px', '0px'],
    padding: '0px',
    borderRadius: '0px',
    borderColor: 'transparent',
    borderWidth: '0px',
    borderType: 'none',
    boxShadowOffsetX: '0px',
    boxShadowOffsetY: '0px',
    boxShadowBlurRadius: '0px',
    boxShadowSpreadRadius: '0px',
    boxShadowInset: false,
    boxShadowColor: 'transparent'
};
function resolveArray(arr1, arr2, defaultArr, colorArr) {
    var arr1ToUse = ['', '', '', ''];
    var arr2ToUse = ['', '', '', ''];
    var defaultArrToUse = ['', '', '', ''];
    const ret = ['', '', '', ''];
    if (typeof arr1 === 'string')
        arr1ToUse = [arr1, arr1, arr1, arr1];
    else if (arr1.length === 2)
        arr1ToUse = [arr1[0], arr1[1], arr1[0], arr1[1]];
    else if (arr1.length === 4)
        arr1ToUse = arr1;
    if (typeof arr2 === 'string')
        arr2ToUse = [arr2, arr2, arr2, arr2];
    else if (arr2.length === 2)
        arr2ToUse = [arr2[0], arr2[1], arr2[0], arr2[1]];
    else if (arr2.length === 4)
        arr2ToUse = arr2;
    if (typeof defaultArr === 'string')
        defaultArrToUse = [defaultArr, defaultArr, defaultArr, defaultArr];
    else if (defaultArr.length === 2)
        defaultArrToUse = [defaultArr[0], defaultArr[1], defaultArr[0], defaultArr[1]];
    else if (defaultArr.length === 4)
        defaultArrToUse = defaultArr;
    if (arr1ToUse[0] !== arr2ToUse[0]) {
        if (colorArr) {
            return defaultArr;
        }
        ret[0] = defaultArrToUse[0];
    }
    else
        ret[0] = arr1ToUse[0];
    if (arr1ToUse[1] !== arr2ToUse[1]) {
        if (colorArr) {
            return defaultArr;
        }
        ret[1] = defaultArrToUse[1];
    }
    else
        ret[1] = arr1ToUse[1];
    if (arr1ToUse[2] !== arr2ToUse[2]) {
        if (colorArr) {
            return defaultArr;
        }
        ret[2] = defaultArrToUse[2];
    }
    else
        ret[2] = arr1ToUse[2];
    if (arr1ToUse[3] !== arr2ToUse[3]) {
        if (colorArr) {
            return defaultArr;
        }
        ret[3] = defaultArrToUse[3];
    }
    else
        ret[3] = arr1ToUse[3];
    return ret;
}
function resolveColor(color1, color2, defaultColor) {
    if (color1 !== color2)
        return defaultColor;
    else
        return color1;
}
function resolveValue(v1, v2, def) {
    if (v1 !== v2)
        return def;
    else
        return v1;
}
function allArrayElementsEqual(inp) {
    var val = inp[0];
    for (let el of inp) {
        if (el !== val)
            return false;
    }
    return true;
}
/**
 * Set the values of the edit style of block nodes fialog form.
 *
 * @param editor
 */
function getSetBlockStyleFormInputs(editor) {
    editor.update(() => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (selection && (0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            const nodes = selection.getNodes();
            const keys = new Set();
            const blockStylesToUse = [];
            for (let node of nodes) {
                if (!!!keys.has(node.__key)) {
                    keys.add(node.__key);
                    if ((0, lexicalLexical_js_1.$isBlockElementNode)(node)) {
                        if ($isParagraphListHeadingNode(node)) {
                            const blockStyles = node.getBlockStyle();
                            blockStylesToUse.push(structuredClone(blockStyles));
                        }
                    }
                    else {
                        const blockNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, n => (0, lexicalLexical_js_1.$isBlockElementNode)(n));
                        if (blockNode) {
                            keys.add(blockNode.__key);
                            if ($isParagraphListHeadingNode(blockNode)) {
                                const blockStyles = blockNode.getBlockStyle();
                                blockStylesToUse.push(structuredClone(blockStyles));
                            }
                        }
                    }
                }
            }
            const currentStyles = DEFAULT_BLOCK_STYLES;
            const blockStyleKeys = Object.keys(DEFAULT_BLOCK_STYLES);
            for (let j = 0; j < blockStylesToUse.length; j++) {
                for (let i = 0; i < blockStyleKeys.length; i++) {
                    switch (blockStyleKeys[i]) {
                        case 'backgroundColor':
                            {
                                if (j === 0)
                                    currentStyles['backgroundColor'] = resolveColor(blockStylesToUse[j]['backgroundColor'], blockStylesToUse[j]['backgroundColor'], DEFAULT_BLOCK_STYLES.backgroundColor);
                                else
                                    currentStyles['backgroundColor'] = resolveColor(blockStylesToUse[j]['backgroundColor'], currentStyles['backgroundColor'], DEFAULT_BLOCK_STYLES.backgroundColor);
                                break;
                            }
                        case 'borderColor':
                            {
                                if (j === 0)
                                    currentStyles['borderColor'] = resolveArray(blockStylesToUse[j]['borderColor'], blockStylesToUse[j]['borderColor'], DEFAULT_BLOCK_STYLES.borderColor, true);
                                else
                                    currentStyles['borderColor'] = resolveArray(blockStylesToUse[j]['borderColor'], currentStyles['borderColor'], DEFAULT_BLOCK_STYLES.borderColor, true);
                                break;
                            }
                        case 'borderRadius':
                            {
                                if (j === 0)
                                    currentStyles['borderRadius'] = resolveArray(blockStylesToUse[j]['borderRadius'], blockStylesToUse[j]['borderRadius'], DEFAULT_BLOCK_STYLES.borderRadius, false);
                                else
                                    currentStyles['borderRadius'] = resolveArray(blockStylesToUse[j]['borderRadius'], currentStyles['borderRadius'], DEFAULT_BLOCK_STYLES.borderRadius, false);
                                break;
                            }
                        case 'borderType':
                            {
                                if (j === 0)
                                    currentStyles['borderType'] = resolveArray(blockStylesToUse[j]['borderType'], blockStylesToUse[j]['borderType'], DEFAULT_BLOCK_STYLES.borderType, false);
                                else
                                    currentStyles['borderType'] = resolveArray(blockStylesToUse[j]['borderType'], currentStyles['borderType'], DEFAULT_BLOCK_STYLES.borderType, false);
                                break;
                            }
                        case 'borderWidth':
                            {
                                if (j === 0)
                                    currentStyles['borderWidth'] = resolveArray(blockStylesToUse[j]['borderWidth'], blockStylesToUse[j]['borderWidth'], DEFAULT_BLOCK_STYLES.borderWidth, false);
                                else
                                    currentStyles['borderWidth'] = resolveArray(blockStylesToUse[j]['borderWidth'], currentStyles['borderWidth'], DEFAULT_BLOCK_STYLES.borderWidth, false);
                                break;
                            }
                        case 'boxShadowBlurRadius':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowBlurRadius'] = resolveValue(blockStylesToUse[j]['boxShadowBlurRadius'], blockStylesToUse[j]['boxShadowBlurRadius'], DEFAULT_BLOCK_STYLES.boxShadowBlurRadius);
                                else
                                    currentStyles['boxShadowBlurRadius'] = resolveValue(blockStylesToUse[j]['boxShadowBlurRadius'], currentStyles['boxShadowBlurRadius'], DEFAULT_BLOCK_STYLES.boxShadowBlurRadius);
                                break;
                            }
                        case 'boxShadowColor':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowColor'] = resolveColor(blockStylesToUse[j]['boxShadowColor'], blockStylesToUse[j]['boxShadowColor'], DEFAULT_BLOCK_STYLES.boxShadowColor);
                                else
                                    currentStyles['boxShadowColor'] = resolveColor(blockStylesToUse[j]['boxShadowColor'], currentStyles['boxShadowColor'], DEFAULT_BLOCK_STYLES.boxShadowColor);
                                break;
                            }
                        case 'boxShadowInset':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowInset'] = resolveValue(blockStylesToUse[j]['boxShadowInset'], blockStylesToUse[j]['boxShadowInset'], DEFAULT_BLOCK_STYLES.boxShadowInset);
                                else
                                    currentStyles['boxShadowInset'] = resolveValue(blockStylesToUse[j]['boxShadowInset'], currentStyles['boxShadowInset'], DEFAULT_BLOCK_STYLES.boxShadowInset);
                                break;
                            }
                        case 'boxShadowOffsetX':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowOffsetX'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetX'], blockStylesToUse[j]['boxShadowOffsetX'], DEFAULT_BLOCK_STYLES.boxShadowOffsetX);
                                else
                                    currentStyles['boxShadowOffsetX'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetX'], currentStyles['boxShadowOffsetX'], DEFAULT_BLOCK_STYLES.boxShadowOffsetX);
                                break;
                            }
                        case 'boxShadowOffsetY':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowOffsetY'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetY'], blockStylesToUse[j]['boxShadowOffsetY'], DEFAULT_BLOCK_STYLES.boxShadowOffsetY);
                                else
                                    currentStyles['boxShadowOffsetY'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetY'], currentStyles['boxShadowOffsetY'], DEFAULT_BLOCK_STYLES.boxShadowOffsetY);
                                break;
                            }
                        case 'boxShadowSpreadRadius':
                            {
                                if (j === 0)
                                    currentStyles['boxShadowSpreadRadius'] = resolveValue(blockStylesToUse[j]['boxShadowSpreadRadius'], blockStylesToUse[j]['boxShadowSpreadRadius'], DEFAULT_BLOCK_STYLES.boxShadowSpreadRadius);
                                else
                                    currentStyles['boxShadowSpreadRadius'] = resolveValue(blockStylesToUse[j]['boxShadowSpreadRadius'], currentStyles['boxShadowSpreadRadius'], DEFAULT_BLOCK_STYLES.boxShadowSpreadRadius);
                                break;
                            }
                        case 'margin':
                            {
                                if (j === 0)
                                    currentStyles['margin'] = resolveArray(blockStylesToUse[j]['margin'], blockStylesToUse[j]['margin'], DEFAULT_BLOCK_STYLES.margin, false);
                                else
                                    currentStyles['margin'] = resolveArray(blockStylesToUse[j]['margin'], currentStyles['margin'], DEFAULT_BLOCK_STYLES.margin, false);
                                break;
                            }
                        case 'padding':
                            {
                                if (j === 0)
                                    currentStyles['padding'] = resolveArray(blockStylesToUse[j]['padding'], blockStylesToUse[j]['padding'], DEFAULT_BLOCK_STYLES.padding, false);
                                else
                                    currentStyles['padding'] = resolveArray(blockStylesToUse[j]['padding'], currentStyles['padding'], DEFAULT_BLOCK_STYLES.padding, false);
                                break;
                            }
                        case 'textAlign':
                            {
                                if (j === 0)
                                    currentStyles['textAlign'] = resolveValue(blockStylesToUse[j]['textAlign'], blockStylesToUse[j]['textAlign'], DEFAULT_BLOCK_STYLES.textAlign);
                                else
                                    currentStyles['textAlign'] = resolveValue(currentStyles['textAlign'], blockStylesToUse[j]['textAlign'], DEFAULT_BLOCK_STYLES.textAlign);
                                break;
                            }
                        case 'textColor':
                            {
                                if (j === 0)
                                    currentStyles['textColor'] = resolveColor(blockStylesToUse[j]['textColor'], blockStylesToUse[j]['textColor'], DEFAULT_BLOCK_STYLES.textColor);
                                else
                                    currentStyles['textColor'] = resolveColor(blockStylesToUse[j]['textColor'], currentStyles['textColor'], DEFAULT_BLOCK_STYLES.textColor);
                                break;
                            }
                    }
                }
            }
            blockStyleInputs.forEach(obj => {
                if (obj.id === 'lex-block-background-color') {
                    const el = document.getElementById('lex-block-background-color');
                    if (el) {
                        el.value = currentStyles['backgroundColor'] === "transparent" ? (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)() : currentStyles['backgroundColor'];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-background-color-transparent') {
                    const el = document.getElementById('lex-block-background-color-transparent');
                    if (el) {
                        el.checked = currentStyles['backgroundColor'] === "transparent";
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-text-color') {
                    const el = document.getElementById('lex-block-text-color');
                    if (el) {
                        el.value = currentStyles['textColor'] === "inherit" ? (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)() : currentStyles['textColor'];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-text-color-inherit') {
                    const el = document.getElementById('lex-block-text-color-inherit');
                    if (el) {
                        el.checked = currentStyles['textColor'] === "inherit";
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-margin') {
                    const el = document.getElementById('lex-block-margin');
                    if (el) {
                        if (typeof currentStyles['margin'] === 'string')
                            el.value = parseInt(currentStyles['margin']).toString();
                        else if (allArrayElementsEqual(currentStyles['margin']))
                            el.value = parseInt(currentStyles['margin'][0]).toString();
                        else
                            el.value = parseInt('0').toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-padding') {
                    const el = document.getElementById('lex-block-padding');
                    if (el) {
                        if (typeof currentStyles['padding'] === 'string')
                            el.value = parseInt(currentStyles['padding']).toString();
                        else if (allArrayElementsEqual(currentStyles['padding']))
                            el.value = parseInt(currentStyles['padding'][0]).toString();
                        else
                            el.value = parseInt('0').toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-margin-top') {
                    const el = document.getElementById('lex-block-margin-top');
                    if (el) {
                        el.value = parseInt(currentStyles['margin'][0]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-padding-top') {
                    const el = document.getElementById('lex-block-padding-top');
                    if (el) {
                        el.value = parseInt(currentStyles['padding'][0]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-margin-right') {
                    const el = document.getElementById('lex-block-margin-right');
                    if (el) {
                        el.value = parseInt(currentStyles['margin'][1]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-padding-right') {
                    const el = document.getElementById('lex-block-padding-right');
                    if (el) {
                        el.value = parseInt(currentStyles['padding'][1]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-margin-bottom') {
                    const el = document.getElementById('lex-block-margin-bottom');
                    if (el) {
                        el.value = parseInt(currentStyles['margin'][2]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-padding-bottom') {
                    const el = document.getElementById('lex-block-padding-bottom');
                    if (el) {
                        el.value = parseInt(currentStyles['padding'][2]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-margin-left') {
                    const el = document.getElementById('lex-block-margin-left');
                    if (el) {
                        el.value = parseInt(currentStyles['margin'][3]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-padding-left') {
                    const el = document.getElementById('lex-block-padding-left');
                    if (el) {
                        el.value = parseInt(currentStyles['padding'][3]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-color') {
                    const el = document.getElementById('lex-block-border-color');
                    if (el) {
                        if (typeof currentStyles['borderColor'] === 'string')
                            el.value = currentStyles['borderColor'];
                        else if (allArrayElementsEqual(currentStyles['borderColor']))
                            el.value = currentStyles['borderColor'][0];
                        else
                            el.value = (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-color-transparent') {
                    const el = document.getElementById('lex-block-border-color-transparent');
                    if (el) {
                        if (typeof currentStyles['borderColor'] === 'string')
                            el.checked = Boolean(currentStyles['borderColor'] === 'transparent');
                        else if (currentStyles['borderColor'][0] === 'transparent' && allArrayElementsEqual(currentStyles['borderColor']))
                            el.checked = true;
                        else
                            el.checked = false;
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'border-style-value') {
                    const el = document.getElementById('border-style-value');
                    if (el) {
                        if (typeof currentStyles['borderType'] === 'string')
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'], currentStyles['borderType']);
                        else if (allArrayElementsEqual(currentStyles['borderType']))
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][0], currentStyles['borderType'][0]);
                        else
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, 'none', 'None');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-width') {
                    const el = document.getElementById('lex-block-border-width');
                    if (el) {
                        if (typeof currentStyles['borderWidth'] === 'string')
                            el.value = parseInt(currentStyles['borderWidth']).toString();
                        else if (allArrayElementsEqual(currentStyles['borderWidth']))
                            el.value = parseInt(currentStyles['borderWidth'][0]).toString();
                        else
                            el.value = parseInt('0').toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-radius') {
                    const el = document.getElementById('lex-block-border-radius');
                    if (el) {
                        if (typeof currentStyles['borderRadius'] === 'string')
                            el.value = parseInt(currentStyles['borderRadius']).toString();
                        else if (allArrayElementsEqual(currentStyles['borderRadius']))
                            el.value = parseInt(currentStyles['borderRadius'][0]).toString();
                        else
                            el.value = parseInt('0').toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                // Border Top
                else if (obj.id === 'lex-block-border-top-color') {
                    const el = document.getElementById('lex-block-border-top-color');
                    if (el) {
                        el.value = Boolean(currentStyles['borderColor'][0] === 'transparent') ? (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)() : currentStyles['borderColor'][0];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-top-color-transparent') {
                    const el = document.getElementById('lex-block-border-top-color-transparent');
                    if (el) {
                        el.checked = Boolean(currentStyles['borderColor'][0] === 'transparent');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'border-top-style-value') {
                    const el = document.getElementById('border-top-style-value');
                    if (el) {
                        if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 4) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][0], currentStyles['borderType'][0]);
                        }
                        else if (typeof currentStyles['borderType'] === "string") {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'], currentStyles['borderType']);
                        }
                        else {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, 'none', 'None');
                        }
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-top-width') {
                    const el = document.getElementById('lex-block-border-top-width');
                    if (el) {
                        el.value = parseInt(currentStyles['borderWidth'][0]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-top-radius') {
                    const el = document.getElementById('lex-block-border-top-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['borderRadius'][0]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                // Border Right
                else if (obj.id === 'lex-block-border-right-color') {
                    const el = document.getElementById('lex-block-border-right-color');
                    if (el) {
                        el.value = Boolean(currentStyles['borderColor'][1] === 'transparent') ? (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)() : currentStyles['borderColor'][1];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-right-color-transparent') {
                    const el = document.getElementById('lex-block-border-right-color-transparent');
                    if (el) {
                        el.checked = Boolean(currentStyles['borderColor'][1] === 'transparent');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'border-right-style-value') {
                    const el = document.getElementById('border-right-style-value');
                    if (el) {
                        if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 4) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][1], currentStyles['borderType'][1]);
                        }
                        else if (typeof currentStyles['borderType'] === "string") {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'], currentStyles['borderType']);
                        }
                        else {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, 'none', 'None');
                        }
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-right-width') {
                    const el = document.getElementById('lex-block-border-right-width');
                    if (el) {
                        el.value = parseInt(currentStyles['borderWidth'][1]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-right-radius') {
                    const el = document.getElementById('lex-block-border-right-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['borderRadius'][1]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                // Border Bottom
                else if (obj.id === 'lex-block-border-bottom-color') {
                    const el = document.getElementById('lex-block-border-bottom-color');
                    if (el) {
                        el.value = Boolean(currentStyles['borderColor'][2] === 'transparent') ? (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)() : currentStyles['borderColor'][2];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-bottom-color-transparent') {
                    const el = document.getElementById('lex-block-border-bottom-color-transparent');
                    if (el) {
                        el.checked = Boolean(currentStyles['borderColor'][2] === 'transparent');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'border-bottom-style-value') {
                    const el = document.getElementById('border-bottom-style-value');
                    if (el) {
                        if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 4) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][2], currentStyles['borderType'][2]);
                        }
                        else if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 2) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][0], currentStyles['borderType'][0]);
                        }
                        else if (typeof currentStyles['borderType'] === "string") {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'], currentStyles['borderType']);
                        }
                        else {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, 'none', 'None');
                        }
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-bottom-width') {
                    const el = document.getElementById('lex-block-border-bottom-width');
                    if (el) {
                        el.value = parseInt(currentStyles['borderWidth'][2]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-bottom-radius') {
                    const el = document.getElementById('lex-block-border-bottom-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['borderRadius'][2]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                // Border Left
                else if (obj.id === 'lex-block-border-left-color') {
                    const el = document.getElementById('lex-block-border-left-color');
                    if (el) {
                        el.value = Boolean(currentStyles['borderColor'][3] === 'transparent') ? (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)() : currentStyles['borderColor'][3];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-left-color-transparent') {
                    const el = document.getElementById('lex-block-border-left-color-transparent');
                    if (el) {
                        el.checked = Boolean(currentStyles['borderColor'][3] === 'transparent');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'border-left-style-value') {
                    const el = document.getElementById('border-left-style-value');
                    if (el) {
                        if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 4) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][3], currentStyles['borderType'][3]);
                        }
                        else if (Array.isArray(currentStyles['borderType']) && currentStyles['borderType'].length === 2) {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'][1], currentStyles['borderType'][1]);
                        }
                        else if (typeof currentStyles['borderType'] === "string") {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, currentStyles['borderType'], currentStyles['borderType']);
                        }
                        else {
                            (0, lexical_sharedLexicalShared_js_1.setSelectInput)(el, 'none', 'None');
                        }
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-left-width') {
                    const el = document.getElementById('lex-block-border-left-width');
                    if (el) {
                        el.value = parseInt(currentStyles['borderWidth'][3]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-border-left-radius') {
                    const el = document.getElementById('lex-block-border-left-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['borderRadius'][3]).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-color') {
                    const el = document.getElementById('lex-block-box-shadow-color');
                    if (el) {
                        el.value = currentStyles['boxShadowColor'] === 'transparent' ? (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)() : currentStyles['boxShadowColor'];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-color-transparent') {
                    const el = document.getElementById('lex-block-box-shadow-color-transparent');
                    if (el) {
                        el.checked = Boolean(currentStyles['boxShadowColor'] === 'transparent');
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-inset') {
                    const el = document.getElementById('lex-block-box-shadow-inset');
                    if (el) {
                        el.checked = currentStyles['boxShadowInset'];
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-offset-x') {
                    const el = document.getElementById('lex-block-box-shadow-offset-x');
                    if (el) {
                        el.value = parseInt(currentStyles['boxShadowOffsetX']).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-offset-y') {
                    const el = document.getElementById('lex-block-box-shadow-offset-y');
                    if (el) {
                        el.value = parseInt(currentStyles['boxShadowOffsetY']).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-blur-radius') {
                    const el = document.getElementById('lex-block-box-shadow-blur-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['boxShadowBlurRadius']).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
                else if (obj.id === 'lex-block-box-shadow-spread-radius') {
                    const el = document.getElementById('lex-block-box-shadow-spread-radius');
                    if (el) {
                        el.value = parseInt(currentStyles['boxShadowSpreadRadius']).toString();
                        el.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    });
}
function getOnOpenBlockStyleDialog(e) {
    if (e.detail.el.id === "lexical-block-edit-dialog") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        const dialog = document.getElementById('lexical-block-edit-dialog');
        if (dialog && editor) {
            // Dialog Forms
            const ids = ['lex-block-border-color', "lex-block-border-color-transparent", "border-style-value", "lex-block-border-width", "lex-block-border-radius", "lex-block-margin", "lex-block-padding"];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.addEventListener('input', handleBlockStyleGeneralInputChange);
                    el.addEventListener('change', handleBlockStyleGeneralInputChange);
                }
            });
            const blockStyleForm = document.querySelector('form[id="lexical-block-style-form"]');
            if (blockStyleForm) {
                blockStyleForm.addEventListener('submit', handleBlockStyleFormSubmit);
                blockStyleForm.addEventListener('change', handleBlockStyleFormChange);
                blockStyleForm.addEventListener('input', handleBlockStyleFormChange);
                blockStyleForm.addEventListener('reset', handleResetBlockStyleForm);
            }
            const randomizeBlockStyleFormBtn = document.getElementById('randomize-block-style-btn');
            if (randomizeBlockStyleFormBtn) {
                randomizeBlockStyleFormBtn.addEventListener('click', randomizeBlockStyleForm);
            }
            getSetBlockStyleFormInputs(editor);
        }
        document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
            detail: {
                dialog: dialog
            }
        }));
    }
}
function registerBlockStyleCustomization(editor) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenBlockStyleDialog);
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection))
            SELECTION[editor._config.namespace] = selection;
        else
            SELECTION[editor._config.namespace] = undefined;
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), function () {
        if (SELECTION[editor._config.namespace])
            delete SELECTION[editor._config.namespace];
    });
}
exports.registerBlockStyleCustomization = registerBlockStyleCustomization;
/**
 * Regex Expression to test hex colors - includes the hashtag
 */
const VALID_HEX_REGEX = /^#[0-9a-fA-F]{6}$/i;
/**
 * Test whether two objects are equal. Objects should have a depth of 1
 * @param {Object} obj1
 * @param {Object} obj2
 */
const objectsEqual = (obj1, obj2) => {
    try {
        const keys = Object.keys(obj1);
        for (let key of keys) {
            if (typeof obj1[key] === 'object' || typeof obj2[key] === 'object')
                throw new Error('Object values should not be objects.');
            else if (obj1[key] !== obj2[key])
                return false;
            else
                continue;
        }
        return Boolean(keys.length === Object.keys(obj2).length);
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
const isListItemNode = node => Boolean(node.getType() === "listitem");
const isHeadingNode = node => Boolean(node.getType() === "heading");
const isCodeNode = node => Boolean(node.getType() === "code");
const isMarkNode = node => Boolean(node.getType() === "mark");
/*------------------------------------------------------------ Update Toolbar -------------------------------------------------------- */
function disableAndSelect2(button, disable, select) {
    if (disable)
        button.setAttribute('disabled', '');
    else
        button.removeAttribute('disabled');
    if (select)
        button.setAttribute('aria-selected', 'true');
    else
        button.setAttribute('aria-selected', 'false');
}
/**
 *
 * @param {LexicalEditor} editor
 * @returns
 */
function $updateToolbar(editor) {
    /**
     * @type {any} Could be null | RangeSelection | NodeSelection | GridSelection;
     * See class EditorState and [The Docs](https://lexical.dev/docs/concepts/selection)
     */
    const selection = (0, lexicalLexical_js_1.$getSelection)();
    const RANGE_SELECTION = (0, lexicalLexical_js_1.$isRangeSelection)(selection);
    if (RANGE_SELECTION) {
        const IS_COLLAPSED = selection.isCollapsed();
        const SEGMENTED_NODES = (0, lexical_utilsLexicalUtils_js_1.segmentNodesForToolbarUpdate)(selection);
        /**
         * @type {undefined|null|'left'|'center'|'right'|'justify'}
         * undefined = align has not been set
         * null = all element nodes in the selection do not have the same alignment
         * string = all element nodes in the selection have the same alignment
         */
        var align = undefined;
        var CODING_LANGUAGE = undefined;
        /**
         * @typedef {true|false|null} PossibleTextFormatType
         * true = all text nodes in the selection have the format for this key -> un-disable & select
         * false = all text nodes in the selection do not have this format -> un-disable & unselect
         * null = You can not set the format here -> disable
         *
         * @typedef {'bold'|'italic'|'strikethrough'|'underline'|'superscript'|'subscript'|'code'} TextFormatObjectKey
         *
         * @type {{[key: TextFormatObjectKey]: PossibleTextFormatType}} TextFormat
         */
        const textFormat = {
            'bold': undefined,
            'italic': undefined,
            'strikethrough': undefined,
            'underline': undefined,
            'superscript': undefined,
            'subscript': undefined,
            'code': undefined,
            'kbd': undefined,
            'quote': undefined
        };
        const HAS_PARAGRAPH = SEGMENTED_NODES.types.has('paragraph');
        const HAS_MARK_NODE = SEGMENTED_NODES.types.has('mark');
        const HAS_HEADING_NODE = SEGMENTED_NODES.types.has('heading');
        const HAS_LIST_ITEM_NODE = SEGMENTED_NODES.types.has('listitem');
        const HAS_LIST_NODE = SEGMENTED_NODES.types.has('list');
        const HAS_TEXT_NODE = SEGMENTED_NODES.types.has('text');
        const HAS_LINK_NODE = SEGMENTED_NODES.types.has('link');
        const HAS_MATH = SEGMENTED_NODES.types.has('math');
        const HAS_YOUTUBE_NODE = SEGMENTED_NODES.types.has('youtube');
        const HAS_NEWS_NODE = SEGMENTED_NODES.types.has('news');
        const HAS_QUOTE_NODE = SEGMENTED_NODES.types.has('quote');
        SEGMENTED_NODES.types.has('cell-paragraph');
        SEGMENTED_NODES.types.has('tablecell');
        SEGMENTED_NODES.types.has('tablerow');
        const HAS_TABLE = SEGMENTED_NODES.types.has('table');
        const HAS_TAB_NODE = SEGMENTED_NODES.types.has('tab');
        const HAS_CODE_BLOCK = SEGMENTED_NODES.types.has('code');
        const HAS_CODE_HIGHLIGHT = SEGMENTED_NODES.types.has('code-highlight');
        const HAS_LINEBREAK = SEGMENTED_NODES.types.has('linebreak');
        const HAS_IMAGE = SEGMENTED_NODES.types.has('image');
        const HAS_AUDIO = SEGMENTED_NODES.types.has('audio-node');
        const HAS_VIDEO = SEGMENTED_NODES.types.has('video-node');
        const HAS_HORIZONTAL_RULE = SEGMENTED_NODES.types.has("horizontal-rule");
        const HAS_DETAILS = Boolean(SEGMENTED_NODES.root && SEGMENTED_NODES.root.getType() === 'accordion-content');
        const HAS_ASIDE = Boolean(SEGMENTED_NODES.root && SEGMENTED_NODES.root.getType() === 'aside');
        const HAS_SECTION_HEADING = Boolean(SEGMENTED_NODES.types.has('section-heading'));
        const HAS_ABBR_NODE = Boolean(SEGMENTED_NODES.types.has('abbreviation'));
        const INSIDE_COLUMN_NODE = Boolean(SEGMENTED_NODES.root && (SEGMENTED_NODES.root.getType() === "layout-container" || SEGMENTED_NODES.root.getType() === "layout-item"));
        const LINE_BREAK_CODE = Boolean(SEGMENTED_NODES.types.size === 1 && SEGMENTED_NODES.types.has('linebreak') && SEGMENTED_NODES.blockNodes.size === 1 && Array.from(SEGMENTED_NODES.blockNodes)[0].getType() === "code");
        const HAS_CODE_NODE = Boolean(LINE_BREAK_CODE || HAS_CODE_BLOCK || HAS_CODE_HIGHLIGHT);
        const INSIDE_CODE_NODE = Boolean(SEGMENTED_NODES.types.size === 2 && HAS_CODE_NODE && SEGMENTED_NODES.blockNodes.size === 1 || LINE_BREAK_CODE || SEGMENTED_NODES.types.size === 1 && IS_COLLAPSED && HAS_CODE_NODE && SEGMENTED_NODES.blockNodes.size === 1 || SEGMENTED_NODES.types.size === 3 && HAS_CODE_NODE && HAS_CODE_HIGHLIGHT && HAS_LINEBREAK && SEGMENTED_NODES.blockNodes.size === 1 || SEGMENTED_NODES.types.size === 4 && HAS_CODE_NODE && HAS_CODE_HIGHLIGHT && HAS_LINEBREAK && HAS_TAB_NODE && SEGMENTED_NODES.blockNodes.size === 1);
        (0, lexical_sharedLexicalShared_js_1.getDefaultFontFamily)();
        const defaultBackgroundColor = (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)();
        const defaultTextColor = (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)();
        /**
         *
         * @type {string|''|'undefined'}
         */
        const fontFamily = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'font-family', 'undefined');
        var fontWeight = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'font-weight', 'undefined');
        var fontSize = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'font-size', 'undefined');
        const lineHeight = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'line-height', 'undefined');
        const letterSpacing = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'letter-spacing', 'undefined');
        const backgroundColorTemp = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'background-color', 'undefined');
        const textColorTemp = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'color', 'undefined');
        const UNEQUAL_FONT_SIZE = Boolean(fontSize === undefined);
        if (fontSize === undefined)
            fontSize = '1rem';
        /**
         * @type {string}
         */
        var backgroundColor;
        /**
         * @type {string}
         */
        var textColor;
        if (!!!VALID_HEX_REGEX.test(backgroundColorTemp))
            backgroundColor = defaultBackgroundColor;
        else
            backgroundColor = backgroundColorTemp;
        if (!!!VALID_HEX_REGEX.test(textColorTemp))
            textColor = defaultTextColor;
        else
            textColor = textColorTemp;
        /**
         * Undefined = maxIndent/minIndent has not been set
         * True = all Paragraph Nodes have max or min Indent
         * False = some paragraph nodes do not have max or min indent
         * @type {undefined|true|false}
         * @type {undefined|true|false}
         */
        var maxIndent = undefined;
        var minIndent = undefined;
        for (let node of SEGMENTED_NODES.elementNodes) {
            if (isListItemNode(node)) {
                if (node.getIndent() === 0) {
                    minIndent = true;
                    maxIndent = false;
                }
                else if (node.getIndent() === 4) {
                    minIndent = false;
                    maxIndent = true;
                }
            }
            if (minIndent === false && maxIndent === false)
                break;
        }
        for (let node of SEGMENTED_NODES.blockNodes) {
            if (align !== null) {
                /**
                 * Really shouldn't ever be end and start though
                 * @type {'center'|'end'|'justify'|'left'|'right'|'start'|undefined}
                 */
                const alignment = node.getFormatType();
                if (align === undefined && alignment && alignment !== 'start' && alignment !== 'end')
                    align = alignment;
                else if (align === undefined)
                    align = null;
                else if (align !== undefined && alignment !== align)
                    align = null;
            }
            if (((0, lexicalLexical_js_1.$isParagraphNode)(node) || isHeadingNode(node)) && (minIndent !== false || maxIndent !== false)) {
                if (node.getIndent() === lexicalLexical_js_1.MAX_INDENT_PARAGRAPH_LEVEL && maxIndent !== false) {
                    maxIndent = true;
                    minIndent = false;
                }
                else if (node.getIndent() === 0 && minIndent !== false) {
                    minIndent = true;
                    maxIndent = false;
                }
                else if (node.getIndent() !== 0 && node.getIndent() !== lexicalLexical_js_1.MAX_INDENT_PARAGRAPH_LEVEL) {
                    minIndent = false;
                    maxIndent = false;
                }
            }
            if (minIndent === false && maxIndent === false)
                break;
        }
        for (let node of SEGMENTED_NODES.textNodes) {
            Object.keys(textFormat).forEach(key => {
                const hasFormat = node.hasFormat(key);
                /* @ts-ignore */
                textFormat[key] = Boolean((textFormat[key] === true || textFormat[key] === undefined) && hasFormat);
            });
            if (node.hasFormat('superscript') && node.hasFormat('subscript')) {
                const tag = (0, lexicalLexical_js_1.getElementOuterTag)(node, node.getFormat());
                if (tag === 'sup') {
                    node.toggleFormat('subscript');
                    textFormat['subscript'] = false;
                }
                else if (tag === 'sub') {
                    node.toggleFormat('superscript');
                    textFormat['superscript'] = false;
                }
            }
        }
        const contentEditable = editor.getRootElement();
        if (!!!contentEditable)
            return;
        const wrapper = contentEditable.closest('div.lexical-wrapper');
        if (wrapper) {
            /**
             * @type {HTMLButtonElement|null}
             */
            const { fontButton, headingButton, backgroundColorButton, backgroundColorInput, backgroundColorTransparent, textColorButton, textColorInput, textColorTransparent, markButton, fontWeightButton, blockStyleButton, fontSizeButton, clearContentButton, indentContentButton, outdentContentButton, leftAlignButton, centerAlignButton, rightAlignButton, justifyAlignButton, boldButton, italicButton, strikethroughButton, underlineButton, kbdButton, inlineQuoteButtonToolbar, clearFormattingButton, subscriptButton, superscriptButton, imageButton, audioButton, videoButton, linkButton, removeLinkButton, embedMediaButton, quoteButton, listButton, orderedListButton, unorderedListButton, checkListButton, asideButton, leftAside, rightAside, detailsButton, codeButton, codeBlockButton, inlineCodeButton, mathButton, tableButton, chartButton, horizontalRuleButton, downloadLexicalStateButton, uploadLexicalStateButton, sectionHeadingButton, paragraphButton, htmlButton, gifButton, speechToTextButton, undoButton, redoButton, embedNews, embedYoutube, embedX, embedTikTok, embedInstagram, embedReddit, blockQuoteButton, inlineQuoteButton, viewButton, copyContentButton, abbreviationButton, removeAbbreviationButton, columnLayoutButton } = (0, lexical_sharedLexicalShared_js_1.getEditorButtons)(wrapper);
            /* Hide / Unhide Coding Language Select */
            const code_language_wrapper = wrapper.querySelector('div[data-lex-code-language-wrapper]');
            if (INSIDE_CODE_NODE && code_language_wrapper) {
                code_language_wrapper.removeAttribute('hidden');
                const input = code_language_wrapper.querySelector('input[type="text"]');
                const codeNode = Array.from(SEGMENTED_NODES.blockNodes).filter(node => isCodeNode(node))[0];
                if (codeNode && input) {
                    CODING_LANGUAGE = codeNode.getLanguage() || 'Auto';
                    (0, lexical_sharedLexicalShared_js_1.setSelectInput)(input, CODING_LANGUAGE, CODING_LANGUAGE);
                }
            }
            else if (code_language_wrapper)
                code_language_wrapper.setAttribute('hidden', '');
            const DISABLE_SECTION_HEADING = !!!Boolean(SEGMENTED_NODES.blockNodes.size === 1 && SEGMENTED_NODES.types.has('heading'));
            const DISABLE_FORMATTING = INSIDE_CODE_NODE;
            const editorIsEmpty = (0, lexicalLexical_js_1.$getRoot)().isEmpty();
            if (clearContentButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(clearContentButton, Boolean(editorIsEmpty), false);
            if (indentContentButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(indentContentButton, Boolean(maxIndent === true || INSIDE_CODE_NODE), false);
            if (outdentContentButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(outdentContentButton, Boolean(minIndent === true || INSIDE_CODE_NODE), false);
            if (leftAlignButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(leftAlignButton, false, Boolean(align === "left"));
            if (centerAlignButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(centerAlignButton, false, Boolean(align === "center"));
            if (rightAlignButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(rightAlignButton, false, Boolean(align === "right"));
            if (justifyAlignButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(justifyAlignButton, false, Boolean(align === "justify"));
            if (boldButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(boldButton, DISABLE_FORMATTING, Boolean(textFormat.bold === true));
            if (italicButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(italicButton, DISABLE_FORMATTING, Boolean(textFormat.italic === true));
            if (strikethroughButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(strikethroughButton, DISABLE_FORMATTING, Boolean(textFormat.strikethrough === true));
            if (underlineButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(underlineButton, DISABLE_FORMATTING, Boolean(textFormat.underline === true));
            if (kbdButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(kbdButton, DISABLE_FORMATTING, Boolean(textFormat.kbd) === true);
            if (inlineQuoteButtonToolbar)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(inlineQuoteButtonToolbar, DISABLE_FORMATTING, Boolean(textFormat.quote) === true);
            if (clearFormattingButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(clearFormattingButton, DISABLE_FORMATTING, false);
            if (subscriptButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(subscriptButton, DISABLE_FORMATTING, Boolean(textFormat.subscript === true));
            if (superscriptButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(superscriptButton, DISABLE_FORMATTING, Boolean(textFormat.superscript === true));
            if (sectionHeadingButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(sectionHeadingButton, DISABLE_SECTION_HEADING, HAS_SECTION_HEADING);
            if (imageButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(imageButton, INSIDE_CODE_NODE, HAS_IMAGE);
            if (audioButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(audioButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, HAS_AUDIO);
            if (videoButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(videoButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, HAS_VIDEO);
            if (linkButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(linkButton, Boolean(IS_COLLAPSED || HAS_MARK_NODE || INSIDE_CODE_NODE), Boolean(HAS_LINK_NODE));
            if (HAS_LINK_NODE && removeLinkButton)
                removeLinkButton.removeAttribute('hidden');
            else if (removeLinkButton)
                removeLinkButton.setAttribute('hidden', '');
            if (embedMediaButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedMediaButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, Boolean(HAS_YOUTUBE_NODE || HAS_NEWS_NODE));
            if (HAS_ABBR_NODE && removeAbbreviationButton)
                removeAbbreviationButton.removeAttribute('hidden');
            else if (removeAbbreviationButton)
                removeAbbreviationButton.setAttribute('hidden', '');
            if (abbreviationButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(abbreviationButton, Boolean(IS_COLLAPSED || HAS_MARK_NODE || INSIDE_CODE_NODE), Boolean(HAS_ABBR_NODE));
            if (quoteButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(quoteButton, INSIDE_CODE_NODE, HAS_QUOTE_NODE);
            if (listButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(listButton, INSIDE_CODE_NODE, HAS_LIST_NODE || HAS_LIST_ITEM_NODE);
            if (HAS_LIST_NODE) {
                const listTypes = new Set(Array.from(SEGMENTED_NODES.blockNodes).filter(node => node.getType() === "list").map(node => node.__listType));
                if (orderedListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(orderedListButton, false, listTypes.has('number'));
                if (unorderedListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(unorderedListButton, false, listTypes.has('bullet'));
                if (checkListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(checkListButton, false, listTypes.has('check'));
            }
            else {
                if (orderedListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(orderedListButton, false, false);
                if (unorderedListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(unorderedListButton, false, false);
                if (checkListButton)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(checkListButton, false, false);
            }
            if (asideButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(asideButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, HAS_ASIDE);
            if (HAS_ASIDE) {
                const asideTypes = new Set(Array.from(SEGMENTED_NODES.blockNodes).filter(node => node.getType() === "aside").map(node => node.__side));
                if (leftAside)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(leftAside, asideTypes.has('left'), false);
                if (rightAside)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(rightAside, asideTypes.has('right'), false);
            }
            else {
                if (leftAside)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(leftAside, false, false);
                if (rightAside)
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(rightAside, false, false);
            }
            if (detailsButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(detailsButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, HAS_DETAILS);
            if (codeButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(codeButton, false, HAS_CODE_NODE);
            if (inlineCodeButton)
                disableAndSelect2(inlineCodeButton, HAS_CODE_NODE, Boolean(textFormat.code));
            if (codeBlockButton)
                disableAndSelect2(codeBlockButton, false, false);
            if (mathButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(mathButton, INSIDE_CODE_NODE, HAS_MATH);
            if (tableButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(tableButton, INSIDE_CODE_NODE || INSIDE_COLUMN_NODE, Boolean(SEGMENTED_NODES.activeCell));
            if (chartButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(chartButton, true, false);
            if (horizontalRuleButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(horizontalRuleButton, INSIDE_CODE_NODE, Boolean(HAS_HORIZONTAL_RULE));
            if (uploadLexicalStateButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(uploadLexicalStateButton, false, false);
            if (downloadLexicalStateButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(downloadLexicalStateButton, false, false);
            if (fontButton) {
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(fontButton, INSIDE_CODE_NODE, false);
                /**
                 * You don't want to use `ALLOWED_FONTS` here because the fontFamily is returned from
                 * `$getSelectionStyleValueForProperty` without quotation marks
                 */
                const VALID_FONT_FAMILY = Boolean(fontFamily !== '' && fontFamily !== 'undefined');
                (0, lexical_sharedLexicalShared_js_1.setSelectButtonText)(fontButton, VALID_FONT_FAMILY ? fontFamily : 'Font');
                (0, lexical_sharedLexicalShared_js_1.setSelectOptionsStyle)(fontButton, VALID_FONT_FAMILY ? fontFamily.concat(';') : 'Inherit');
            }
            if (fontSizeButton) {
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(fontSizeButton, Boolean(INSIDE_CODE_NODE || HAS_MARK_NODE), false);
                var fontSizeCurrent = undefined;
                for (let key of Array.from(ALLOWED_FONT_SIZES)) {
                    /* @ts-ignore */
                    const VALID_FONT_SIZE = objectsEqual(FONT_SIZE_TO_CSS[key], {
                        'font-size': fontSize,
                        'letter-spacing': letterSpacing,
                        'line-height': lineHeight
                    });
                    if (VALID_FONT_SIZE) {
                        fontSizeCurrent = key;
                        break;
                    }
                }
                const text = fontSizeCurrent !== undefined ? fontSizeCurrent : 'Size';
                (0, lexical_sharedLexicalShared_js_1.setSelectButtonText)(fontSizeButton, text);
                (0, lexical_sharedLexicalShared_js_1.setSelectOptionsStyle)(fontSizeButton, text !== "Size" ? text : "Inherit");
            }
            if (fontWeightButton) {
                const VALID_FONT_WEIGHT = ALLOWED_FONT_WEIGHTS.has(fontWeight);
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(fontWeightButton, Boolean(textFormat.bold === true || INSIDE_CODE_NODE), false);
                (0, lexical_sharedLexicalShared_js_1.setSelectButtonText)(fontWeightButton, VALID_FONT_WEIGHT ? fontWeight : 'Weight');
                (0, lexical_sharedLexicalShared_js_1.setSelectOptionsStyle)(fontWeightButton, VALID_FONT_WEIGHT ? fontWeight : 'Inherit');
            }
            if (textColorInput)
                (0, lexical_sharedLexicalShared_js_1.setColorInput)(textColorInput, textColor);
            if (textColorTransparent) {
                if (textColorTemp === "undefined")
                    textColorTransparent.checked = true;
                else
                    textColorTransparent.checked = false;
            }
            if (backgroundColorInput)
                (0, lexical_sharedLexicalShared_js_1.setColorInput)(backgroundColorInput, backgroundColor);
            if (backgroundColorTransparent) {
                if (backgroundColorTemp === "undefined")
                    backgroundColorTransparent.checked = true;
                else
                    backgroundColorTransparent.checked = false;
            }
            var CHECK_MARK_NODES = true;
            var MARK_NODE_TYPE = undefined;
            var CHECK_HEADING_NODES = true;
            var HEADING_NODE_TYPE = undefined;
            const fieldset = wrapper.querySelector('fieldset[data-lexical-highlight]');
            const headingButtons = Array.from(wrapper.querySelectorAll('button[data-dispatch="CREATE_HEADING_COMMAND"]'));
            if (HAS_MARK_NODE || HAS_HEADING_NODE || HAS_PARAGRAPH) {
                for (let node of SEGMENTED_NODES.elementNodes) {
                    if (CHECK_MARK_NODES) {
                        if (!!!isMarkNode(node)) {
                            MARK_NODE_TYPE = 'none';
                            CHECK_MARK_NODES = false;
                        }
                        else {
                            const NEW_MARK_NODE_TYPE = node.getMarkClass();
                            if (MARK_NODE_TYPE !== undefined && NEW_MARK_NODE_TYPE !== MARK_NODE_TYPE) {
                                MARK_NODE_TYPE = 'none';
                                CHECK_MARK_NODES = false;
                            }
                            else if (MARK_NODE_TYPE === undefined) {
                                MARK_NODE_TYPE = NEW_MARK_NODE_TYPE;
                            }
                        }
                    }
                    if (CHECK_HEADING_NODES) {
                        if (!!!isHeadingNode(node) && !!!(0, lexicalLexical_js_1.$isParagraphNode)(node)) {
                            HEADING_NODE_TYPE = undefined;
                            CHECK_HEADING_NODES = false;
                        }
                        else {
                            const NEW_HEADING_TYPE = isHeadingNode(node) ? node.getTag() : 'p';
                            if (HEADING_NODE_TYPE !== undefined && NEW_HEADING_TYPE !== HEADING_NODE_TYPE) {
                                HEADING_NODE_TYPE = undefined;
                                CHECK_HEADING_NODES = false;
                            }
                            else if (HEADING_NODE_TYPE === undefined) {
                                HEADING_NODE_TYPE = NEW_HEADING_TYPE;
                            }
                        }
                    }
                    if (!!!CHECK_MARK_NODES && !!!CHECK_HEADING_NODES)
                        break;
                }
                if (fieldset)
                    (0, lexical_sharedLexicalShared_js_1.setMarkRadioGroupChecked)(fieldset, MARK_NODE_TYPE);
                (0, lexical_sharedLexicalShared_js_1.setHeadingNodeButtons)(headingButtons, HEADING_NODE_TYPE);
            }
            else {
                if (fieldset)
                    (0, lexical_sharedLexicalShared_js_1.setMarkRadioGroupChecked)(fieldset, 'none');
                (0, lexical_sharedLexicalShared_js_1.setHeadingNodeButtons)(headingButtons, undefined);
            }
            /**
             * Don't disable mark if the selection is not collapsed or if the selection is collapsed and the cursor
             * is inside a mark node
             */
            const DO_NOT_DISABLE_MARK = Boolean(!!!IS_COLLAPSED && !!!INSIDE_CODE_NODE && !!!UNEQUAL_FONT_SIZE || IS_COLLAPSED && HAS_MARK_NODE && HAS_TEXT_NODE && SEGMENTED_NODES.types.size === 2);
            if (headingButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(headingButton, Boolean(HAS_LIST_ITEM_NODE || INSIDE_CODE_NODE), false);
            if (markButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(markButton, Boolean(!!!DO_NOT_DISABLE_MARK), false);
            if (textColorButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(textColorButton, Boolean(INSIDE_CODE_NODE), false);
            if (backgroundColorButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(backgroundColorButton, Boolean(INSIDE_CODE_NODE), false);
            if (blockStyleButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(blockStyleButton, !!!Boolean(HAS_PARAGRAPH || HAS_LIST_NODE || HAS_LIST_ITEM_NODE || HAS_HEADING_NODE), false);
            if (paragraphButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(paragraphButton, false, false);
            if (htmlButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(htmlButton, Boolean(INSIDE_CODE_NODE), false);
            if (gifButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(gifButton, Boolean(INSIDE_CODE_NODE), false);
            if (speechToTextButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(speechToTextButton, Boolean(INSIDE_CODE_NODE), false);
            if (undoButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(undoButton, false, false);
            if (redoButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(redoButton, false, false);
            if (embedNews)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedNews, Boolean(INSIDE_CODE_NODE), false);
            if (embedYoutube)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedYoutube, Boolean(INSIDE_CODE_NODE), false);
            if (embedX)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedX, Boolean(INSIDE_CODE_NODE), false);
            if (embedTikTok)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedTikTok, Boolean(INSIDE_CODE_NODE), false);
            if (embedInstagram)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedInstagram, Boolean(INSIDE_CODE_NODE), false);
            if (embedReddit)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(embedReddit, Boolean(INSIDE_CODE_NODE), false);
            if (blockQuoteButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(blockQuoteButton, Boolean(INSIDE_CODE_NODE), false);
            if (inlineQuoteButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(inlineQuoteButton, Boolean(INSIDE_CODE_NODE), false);
            if (viewButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(viewButton, Boolean(INSIDE_CODE_NODE), false);
            if (columnLayoutButton)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(columnLayoutButton, Boolean(INSIDE_CODE_NODE || HAS_TABLE), false);
        }
        return {
            text: textFormat,
            code: {
                language: CODING_LANGUAGE,
                insideCode: INSIDE_CODE_NODE
            },
            link: {
                link: HAS_LINK_NODE
            },
            style: {
                background: {
                    disable: Boolean(INSIDE_CODE_NODE),
                    transparent: backgroundColorTemp === "undefined",
                    color: backgroundColor
                },
                text: {
                    disable: Boolean(INSIDE_CODE_NODE),
                    transparent: textColorTemp === "undefined",
                    color: textColor
                }
            },
            abbr: {
                abbr: HAS_ABBR_NODE
            }
        };
    }
    return undefined;
}
function $updateFloatingMenu(obj, editor) {
    if (obj) {
        const menu = document.getElementById('text-selection-menu-toolbar-rte');
        if (menu) {
            const bold = menu.querySelector('button[data-payload="bold"]');
            const italic = menu.querySelector('button[data-payload="italic"]');
            const strikethrough = menu.querySelector('button[data-payload="strikethrough"]');
            const underline = menu.querySelector('button[data-payload="underline"]');
            const subscript = menu.querySelector('button[data-payload="subscript"]');
            const superscript = menu.querySelector('button[data-payload="superscript"]');
            const link = menu.querySelector('button[data-menu-insert-link]');
            const code = menu.querySelector('button[data-payload="code"]');
            const kbd = menu.querySelector('button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="kbd"]');
            const quote = menu.querySelector('button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="quote"]');
            const clearFormatting = menu.querySelector('button[data-dispatch="CLEAR_TEXT_FORMATTING"]');
            const hasNoFormatting = Boolean(Object.values(obj.text).filter(bool => Boolean(bool)).length === 0);
            const backgroundColorButtton = menu.querySelector('#floating-bg-color-button');
            const backgroundColorInput = menu.querySelector('#floating-bg-color-bg-color');
            const backgroundColorTransparent = menu.querySelector('#floating-bg-color-transparent');
            const textColorButtton = menu.querySelector('#floating-text-color-button');
            const textColorInput = menu.querySelector('#floating-text-color-color');
            const textColorTransparent = menu.querySelector('#floating-text-color-transparent');
            const abbr = menu.querySelector('button[data-menu-abbr-button]');
            if (bold)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(bold, false, Boolean(obj.text.bold));
            if (italic)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(italic, false, Boolean(obj.text.italic));
            if (strikethrough)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(strikethrough, false, Boolean(obj.text.strikethrough));
            if (underline)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(underline, false, Boolean(obj.text.underline));
            if (link)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(link, false, Boolean(obj.link.link));
            if (subscript)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(subscript, false, Boolean(obj.text.subscript));
            if (superscript)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(superscript, false, Boolean(obj.text.superscript));
            if (code)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(code, false, Boolean(obj.text.code));
            if (kbd)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(kbd, false, Boolean(obj.text.kbd));
            if (quote)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(quote, false, Boolean(obj.text.quote));
            if (clearFormatting)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(clearFormatting, hasNoFormatting, false);
            if (abbr)
                (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(abbr, false, Boolean(obj.abbr.abbr));
            if (backgroundColorButtton) {
                if (!!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(backgroundColorButtton, obj.style.background.disable, false);
                else
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(backgroundColorButtton, true, false);
            }
            if (backgroundColorInput) {
                if (!!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    (0, lexical_sharedLexicalShared_js_1.setColorInput)(backgroundColorInput, obj.style.background.color);
                else
                    (0, lexical_sharedLexicalShared_js_1.setColorInput)(backgroundColorInput, (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)());
            }
            if (backgroundColorTransparent) {
                if (obj.style.background.transparent || (0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    backgroundColorTransparent.checked = true;
                else
                    backgroundColorTransparent.checked = false;
            }
            if (textColorButtton) {
                if (!!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(textColorButtton, obj.style.text.disable, false);
                else
                    (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(textColorButtton, true, false);
            }
            if (textColorInput) {
                if (!!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    (0, lexical_sharedLexicalShared_js_1.setColorInput)(textColorInput, obj.style.text.color);
                else
                    (0, lexical_sharedLexicalShared_js_1.setColorInput)(textColorInput, (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)());
            }
            if (textColorTransparent) {
                if (obj.style.text.transparent || (0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
                    textColorTransparent.checked = true;
                else
                    textColorTransparent.checked = false;
            }
        }
    }
}
const EditorsToSpeechRecognition = {};
const getReportContainer = () => document.getElementById('report-container');
const setReportContainerText = t => {
    const reportContainer = getReportContainer();
    if (reportContainer)
        reportContainer.innerText = t;
    if (reportContainer)
        reportContainer.removeAttribute('hidden');
    setTimeout(() => {
        const reportContainer = getReportContainer();
        if (reportContainer)
            reportContainer.setAttribute('hidden', '');
    }, 1000);
};
const VOICE_COMMANDS = {
    '\n': ({ selection }) => {
        selection.insertParagraph();
    },
    redo: ({ editor }) => {
        editor.dispatchCommand(lexicalLexical_js_1.REDO_COMMAND, undefined);
    },
    undo: ({ editor }) => {
        editor.dispatchCommand(lexicalLexical_js_1.UNDO_COMMAND, undefined);
    }
};
function handleStartStopSpeechRecognition(_e) {
    const wrapper = this.closest('div.lexical-wrapper');
    const playing = this.classList.contains('playing');
    if (wrapper && wrapper.id && EditorsToSpeechRecognition[wrapper.id]) {
        const speechRecognition = EditorsToSpeechRecognition[wrapper.id];
        if (playing) {
            this.classList.remove('playing');
            speechRecognition.stop();
        }
        else {
            this.classList.add('playing');
            speechRecognition.start();
        }
    }
}
function getOnSpeechRecognitionResult(wrapper_id) {
    const func = function (event) {
        const resultItem = event.results.item(event.resultIndex);
        const { transcript } = resultItem.item(0);
        setReportContainerText(transcript);
        if (!resultItem.isFinal) {
            return;
        }
        const editors = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
        const editor = editors[wrapper_id];
        if (editor) {
            editor.update(() => {
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];
                    if (command) {
                        command({
                            editor,
                            selection
                        });
                    }
                    else if (transcript.match(/\s*\n\s*/)) {
                        selection.insertParagraph();
                    }
                    else {
                        selection.insertText(transcript);
                    }
                }
            });
        }
    };
    return func;
}
function registerSpeechToText(editor) {
    var _a, _b;
    const SUPPORT_SPEECH_RECOGNITION = Boolean(typeof (globalThis === null || globalThis === void 0 ? void 0 : globalThis.window) !== undefined && ('SpeechRecognition' in (globalThis === null || globalThis === void 0 ? void 0 : globalThis.window) || 'webkitSpeechRecognition' in (globalThis === null || globalThis === void 0 ? void 0 : globalThis.window)) && !!!(0, lexical_sharedLexicalShared_js_1.isMobileDevice)(window.navigator.userAgent));
    if (SUPPORT_SPEECH_RECOGNITION) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const wrapper_id = editor._config.namespace;
        const wrapper = document.getElementById(wrapper_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
        if (wrapper) {
            const speechToTextButton = wrapper.querySelector('button[data-lexical-speech-to-text]');
            if (!!!SpeechRecognition && speechToTextButton)
                speechToTextButton.setAttribute('disabled', '');
            else if (speechToTextButton)
                speechToTextButton.addEventListener('click', handleStartStopSpeechRecognition);
        }
        if (SpeechRecognition) {
            EditorsToSpeechRecognition[wrapper_id] = new SpeechRecognition();
            EditorsToSpeechRecognition[wrapper_id].continuous = true;
            EditorsToSpeechRecognition[wrapper_id].interimResults = true;
            EditorsToSpeechRecognition[wrapper_id].addEventListener('result', getOnSpeechRecognitionResult(wrapper_id));
        }
        return () => {
            if (EditorsToSpeechRecognition[wrapper_id]) {
                EditorsToSpeechRecognition[wrapper_id].stop();
                delete EditorsToSpeechRecognition[wrapper_id];
            }
        };
    }
    else {
        const wrapper_id = editor._config.namespace;
        const wrapper = document.getElementById(wrapper_id) || ((_b = editor._rootElement) === null || _b === void 0 ? void 0 : _b.closest('div.lexical-wrapper'));
        if (wrapper) {
            const speechToTextButton = wrapper.querySelector('button[data-lexical-speech-to-text]');
            if (speechToTextButton)
                speechToTextButton.setAttribute('hidden', '');
        }
        return () => { };
    }
}
const ANNOTATION_NODE_VERSION = 1;
/** @noInheritDoc */
class AnnotationNode extends lexicalLexical_js_1.ElementNode {
    // the id (minus id_) that the lexical editor that you want to add an annotation to has
    static getType() {
        return 'annotation';
    }
    static clone(node) {
        const start = node.__start;
        const end = node.__end;
        const content = node.__content;
        const reference_id = node.__reference_id;
        var optional = undefined;
        if (node.__text_color && node.__background_color) {
            optional = {
                text_color: node.__text_color,
                background_color: node.__background_color
            };
        }
        return new AnnotationNode({
            start,
            end,
            content,
            reference_id
        }, optional, node.__key);
    }
    constructor(state, optional, key) {
        super(key);
        this.__version = ANNOTATION_NODE_VERSION;
        this.__start = state.start;
        this.__end = state.end;
        this.__content = state.content;
        this.__reference_id = state.reference_id;
        if (optional) {
            this.__text_color = optional.text_color;
            this.__background_color = optional.background_color;
        }
    }
    getStart() {
        const self = this.getLatest();
        return self.__start;
    }
    setStart(n) {
        const self = this.getWritable();
        self.__start = n;
        return self;
    }
    getEnd() {
        const self = this.getLatest();
        return self.__end;
    }
    setEnd(n) {
        const self = this.getWritable();
        self.__end = n;
        return self;
    }
    getContent() {
        const self = this.getLatest();
        return self.__content;
    }
    setContent(s) {
        const self = this.getWritable();
        self.__content = s;
        return self;
    }
    getReferenceId() {
        const self = this.getLatest();
        return self.__reference_id;
    }
    setReferenceId(s) {
        const self = this.getWritable();
        self.__reference_id = s;
        return self;
    }
    getTextColor() {
        const self = this.getLatest();
        return self.__text_color;
    }
    setTextColor(s) {
        const self = this.getWritable();
        self.__text_color = s;
        return self;
    }
    getBackgroundColor() {
        const self = this.getLatest();
        return self.__background_color;
    }
    setBackgroundColor(s) {
        const self = this.getWritable();
        self.__background_color = s;
        return self;
    }
    createDOM(config) {
        const span = document.createElement('span');
        span.setAttribute('hidden', '');
        span.setAttribute('data-annotation-node', '');
        span.setAttribute('data-start', String(this.getStart()));
        span.setAttribute('data-end', String(this.getEnd()));
        span.setAttribute('data-content', String(this.getContent()));
        span.setAttribute('data-reference-id', this.getReferenceId());
        const [text_color, background_color] = [this.getTextColor(), this.getBackgroundColor()];
        if (text_color && background_color) {
            span.setAttribute('data-text-color', text_color);
            span.setAttribute('data-background-color', background_color);
        }
        if (this.getFirstElement())
            span.classList.add('first-rte-element');
        if (this.getLastElement())
            span.classList.add('last-rte-element');
        return span;
    }
    updateDOM(prevNode, dom) {
        return false;
    }
    static importDOM() {
        return {
            span: node => {
                if (node.hasAttribute('data-annotation-node') && node.hasAttribute('data-reference-id') && node.hasAttribute('data-start') && node.hasAttribute('data-end') && node.hasAttribute('data-content')) {
                    return {
                        conversion: convertAnnotationNodeElement,
                        priority: lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL
                    };
                }
                else {
                    return null;
                }
            }
        };
    }
    exportDOM(editor) {
        const { element } = super.exportDOM(editor); // calls createDOM
        return {
            element
        };
    }
    static importJSON(serializedNode) {
        const { start, end, content, reference_id } = serializedNode;
        const text_color = serializedNode.text_color;
        const background_color = serializedNode.background_color;
        var obj = undefined;
        if (text_color && background_color)
            obj = {
                text_color,
                background_color
            };
        const node = $createAnnotationNode({
            start,
            end,
            content,
            reference_id
        }, obj);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: this.getType(),
            start: this.getStart(),
            end: this.getEnd(),
            content: this.getContent(),
            reference_id: this.getReferenceId(),
            version: ANNOTATION_NODE_VERSION,
            text_color: this.getTextColor(),
            background_color: this.getBackgroundColor()
        };
    }
}
exports.AnnotationNode = AnnotationNode;
function convertAnnotationNodeElement(span) {
    span.getAttribute('data-annotation-node');
    const start = span.getAttribute('data-start');
    const end = span.getAttribute('data-end');
    const content = span.getAttribute('data-content');
    const reference_id = span.getAttribute('data-reference-id');
    const text_color = span.getAttribute('data-text-color');
    const background_color = span.getAttribute('data-background-color');
    if (start && end && content && reference_id) {
        const startNum = parseInt(start);
        const endNum = parseInt(end);
        if (text_color && background_color) {
            const node = new AnnotationNode({
                start: startNum,
                end: endNum,
                content,
                reference_id
            }, {
                text_color,
                background_color
            });
            return {
                node
            };
        }
        else {
            const node = new AnnotationNode({
                start: startNum,
                end: endNum,
                content,
                reference_id
            });
            return {
                node
            };
        }
    }
    else {
        const node = new AnnotationNode({
            start: 0,
            end: 0,
            content: '',
            reference_id: ''
        });
        return {
            node
        };
    }
}
exports.convertAnnotationNodeElement = convertAnnotationNodeElement;
function $createAnnotationNode(state, obj) {
    return new AnnotationNode(state, obj);
}
exports.$createAnnotationNode = $createAnnotationNode;
function $isAnnotationNode(node) {
    return node instanceof AnnotationNode;
}
exports.$isAnnotationNode = $isAnnotationNode;
const AI_WRITER_HELPER_STATE = {
    current_editor_id: null,
    timeout: null
};
function getEnableAIWriter() {
    const input = document.getElementById('enable-ai-writer');
    if (input) {
        return input.checked;
    }
}
function openAIWriterHelper() {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    const rewriteWithAI = document.getElementById('rewrite-with-ai-button');
    const writeWithAI = document.getElementById('write-with-ai-button');
    if (editor && editor.isEditable() && rewriteWithAI && writeWithAI) {
        editor.getEditorState().read(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            const domSelection = document.getSelection();
            const root = editor.getRootElement();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed() && domSelection && root) {
                const anchor = selection.anchor;
                if ((0, lexical_selectionLexicalSelection_js_1.$isAtNodeEnd)(anchor)) {
                    rewriteWithAI.setAttribute('hidden', '');
                    writeWithAI.removeAttribute('hidden');
                }
                else {
                    writeWithAI.setAttribute('hidden', '');
                    rewriteWithAI.removeAttribute('hidden');
                }
                openAIWriterMenu();
            }
        });
    }
}
/* ----------------------------------------- WRITE / REWRITE WITH AI ---------------------------------- */
const AI_WRITING_STATE = {};
const EMPTY_PARA = {
    "children": [],
    "direction": null,
    "format": "left",
    "indent": 0,
    "type": "paragraph",
    "version": 1,
    "first_element": false,
    "blockStyle": {
        "textAlign": "left",
        "backgroundColor": "transparent",
        "textColor": "inherit",
        "margin": ["6px", "0px"],
        "padding": "0px",
        "borderRadius": "0px",
        "borderColor": "transparent",
        "borderWidth": "0px",
        "borderType": "none",
        "boxShadowOffsetX": "0px",
        "boxShadowOffsetY": "0px",
        "boxShadowBlurRadius": "0px",
        "boxShadowSpreadRadius": "0px",
        "boxShadowInset": false,
        "boxShadowColor": "transparent"
    }
};
async function convertNodesToMarkdownString(nodeStates) {
    const editorState = {
        "root": {
            "children": [],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "root",
            "version": 1
        }
    };
    for (let nodeState of nodeStates) {
        editorState.root.children.push(nodeState);
    }
    if (!!!editorState.root.children.length) {
        editorState.root.children.push(EMPTY_PARA);
    }
    const str = await window.convertNodesToMarkdownString(editorState);
    return str;
}
function exportJSONHelper(node) {
    const json = node.exportJSON();
    if (!!!json.children) {
        json.children = [];
    }
    if (node.getChildren) {
        for (let child_node of node.getChildren()) {
            const child = exportJSONHelper(child_node);
            json.children.push(child);
        }
    }
    return json;
}
function $exportJSONWithChildren(node) {
    const json = node.exportJSON();
    if (!!!json.children) {
        json.children = [];
    }
    if (node.getChildren) {
        for (let child_node of node.getChildren()) {
            const child = exportJSONHelper(child_node);
            json.children.push(child);
        }
    }
    return json;
}
async function handleWriteWithAi(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        const namespace = editor._config.namespace;
        try {
            const [markdownContextNodes, loadingNodeKey] = await new Promise((resolve, reject) => {
                editor.update(() => {
                    const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
                    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                        const nodes = selection.getNodes();
                        const node = nodes[nodes.length - 1];
                        var elementNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, n => (0, lexicalLexical_js_1.$isElementNode)(n));
                        if (elementNode) {
                            var markdown_context_nodes = [];
                            var curr_node = elementNode;
                            while ((0, lexicalLexical_js_1.$isElementNode)(curr_node)) {
                                markdown_context_nodes = [curr_node].concat(markdown_context_nodes);
                                curr_node = curr_node.getPreviousSibling();
                            }
                            const loadingNode = (0, lexical_decoratorsLexicalDecorators_js_1.$createLoadingNode)({
                                size: "small",
                                inline: true
                            });
                            node.insertAfter(loadingNode);
                            resolve([markdown_context_nodes.slice(-10).map($exportJSONWithChildren), [loadingNode.getKey()]]);
                        }
                    }
                });
            });
            const markdownContext = await convertNodesToMarkdownString(markdownContextNodes);
            if (window.socket) {
                window.socket.on('ai-write', handleAIWriteResponse);
                window.socket.emit('ai-write', {
                    markdown_context: markdownContext,
                    type: 'write'
                }, ({ error, message, message_id }) => {
                    if (error) {
                        document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                            detail: {
                                severity: "error",
                                message: "Something went wrong writing with Artificial Intelligence."
                            }
                        }));
                    }
                    else {
                        AI_WRITING_STATE[message_id] = {
                            type: 'write',
                            editorID: namespace,
                            nodes: loadingNodeKey,
                            markdown: ''
                        };
                    }
                });
            }
        }
        catch (e) {
            console.error(e);
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                detail: {
                    severity: "error",
                    message: "Something went wrong writing with Artificial Intelligence."
                }
            }));
        }
    }
}
async function handleRewriteBlockkWithAI(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        const namespace = editor._config.namespace;
        try {
            const [markdown_to_rewrite_nodeStates, markdown_context_nodeStates, loading_node] = await new Promise((resolve, reject) => {
                editor.update(() => {
                    const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
                    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                        const node = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(selection.getNodes()[0], n => (0, lexicalLexical_js_1.$isElementNode)(n));
                        if (node) {
                            var markdown_context_nodes = [];
                            var curr_node = node;
                            while ((0, lexicalLexical_js_1.$isElementNode)(curr_node)) {
                                markdown_context_nodes = [curr_node].concat(markdown_context_nodes);
                                curr_node = curr_node.getPreviousSibling();
                            }
                            const loadingNode = (0, lexical_decoratorsLexicalDecorators_js_1.$createLoadingNode)({
                                size: "medium",
                                inline: false
                            });
                            node.insertAfter(loadingNode);
                            node.remove();
                            resolve([[$exportJSONWithChildren(node)], markdown_context_nodes.slice(-10).map($exportJSONWithChildren), loadingNode.getKey()]);
                        }
                    }
                });
            });
            const markdown_to_rewrite = await convertNodesToMarkdownString(markdown_to_rewrite_nodeStates);
            const markdown_context = await convertNodesToMarkdownString(markdown_context_nodeStates);
            if (window.socket) {
                window.socket.on('ai-write', handleAIWriteResponse);
                window.socket.emit('ai-write', {
                    type: 'rewrite',
                    rewrite_markdown: markdown_to_rewrite,
                    markdown_context
                }, ({ message_id, error, message }) => {
                    if (error) {
                        document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBBAR', {
                            detail: {
                                severity: "error",
                                message: message
                            }
                        }));
                    }
                    else {
                        AI_WRITING_STATE[message_id] = {
                            editorID: namespace,
                            type: 'rewrite',
                            nodesToReplace: [loading_node],
                            markdown: ''
                        };
                    }
                });
            }
        }
        catch (e) {
            console.error(e);
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                detail: {
                    severity: "error",
                    message: "Something went wrong rewriting block using Artificial Intelligence."
                }
            }));
        }
    }
}
async function onRewriteSelectionWidthAIClick(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        const namespace = editor._config.namespace;
        try {
            const [selectionNodes, selection_text_content, markdown_to_rewrite_nodes, markdown_context_before_nodes, markdown_context_after_nodes] = await new Promise((resolve, reject) => {
                editor.update(() => {
                    const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
                    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                        const selection_text_content = selection.getTextContent();
                        var markdown_context_before_nodes = [];
                        var markdown_context_after_nodes = [];
                        const nodeStart = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(selection.getNodes()[0], n => (0, lexicalLexical_js_1.$isElementNode)(n));
                        if ((0, lexicalLexical_js_1.$isElementNode)(nodeStart)) {
                            var curr_node_before = nodeStart.getPreviousSibling();
                            while ((0, lexicalLexical_js_1.$isElementNode)(curr_node_before)) {
                                markdown_context_before_nodes = [curr_node_before].concat(markdown_context_before_nodes);
                                curr_node_before = curr_node_before.getPreviousSibling();
                            }
                            var curr_node_after = nodeStart.getNextSibling();
                            while ((0, lexicalLexical_js_1.$isElementNode)(curr_node_after)) {
                                markdown_context_after_nodes.push(curr_node_after);
                                curr_node_after = curr_node_after.getNextSibling();
                            }
                            const selectionNodes = selection.getNodes().map(o => o.getKey());
                            resolve([selectionNodes, selection_text_content, [$exportJSONWithChildren(nodeStart)], markdown_context_before_nodes.slice(-10).map($exportJSONWithChildren), markdown_context_after_nodes.slice(-10).map($exportJSONWithChildren)]);
                            return;
                        }
                        reject("Something went wrong with rewriting markdown selection.");
                    }
                });
            });
            const markdown_to_rewrite = await convertNodesToMarkdownString(markdown_to_rewrite_nodes);
            const markdown_context_before = await convertNodesToMarkdownString(markdown_context_before_nodes);
            const markdown_context_after = await convertNodesToMarkdownString(markdown_context_after_nodes);
            if (window.socket) {
                window.socket.on('ai-write', handleAIWriteResponse);
                window.socket.emit('ai-write', {
                    type: 'rewrite-selection',
                    selection_text_content,
                    markdown_to_rewrite,
                    markdown_context_before,
                    markdown_context_after
                }, ({ message_id, error, message }) => {
                    if (error) {
                        document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBBAR', {
                            detail: {
                                severity: "error",
                                message: message
                            }
                        }));
                    }
                    else {
                        AI_WRITING_STATE[message_id] = {
                            editorID: namespace,
                            type: 'rewrite-selection',
                            selectionNodes,
                            markdown: ''
                        };
                    }
                });
            }
        }
        catch (e) {
            console.error(e);
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                detail: {
                    severity: "error",
                    message: "Something went wrong rewriting selection using Artificial Intelligence."
                }
            }));
        }
    }
}
async function handleAIWriteResponse(obj) {
    const WRITER_OBJ = AI_WRITING_STATE[obj.message_id];
    if (WRITER_OBJ) {
        WRITER_OBJ.markdown = obj.markdown;
        const editor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[WRITER_OBJ.editorID];
        var error = false;
        var html = '';
        if (editor) {
            try {
                html = await window.markdownToHTMLAi(WRITER_OBJ.markdown);
            }
            catch (e) {
                error = true;
            }
            editor.update(() => {
                if (!!!error) {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(html, 'text/html');
                    const nodes = (0, lexical_htmlLexicalHtml_js_1.$generateNodesFromDOM)(editor, dom);
                    switch (WRITER_OBJ.type) {
                        case 'write':
                            {
                                const lastNode = WRITER_OBJ.nodes[WRITER_OBJ.nodes.length - 1];
                                const lastNodeEditor = (0, lexicalLexical_js_1.$getNodeByKey)(lastNode);
                                if (lastNodeEditor) {
                                    var insertAfter = lastNodeEditor;
                                    var curr = 0;
                                    const new_nodes_replace = [];
                                    while (curr < nodes.length || WRITER_OBJ.nodes.length - 1 - curr > -1) {
                                        if (curr < nodes.length) {
                                            insertAfter.insertAfter(nodes[curr]);
                                            insertAfter.selectNext();
                                            insertAfter = nodes[curr];
                                            new_nodes_replace.push(nodes[curr]);
                                        }
                                        if (WRITER_OBJ.nodes.length - 1 - curr > -1) {
                                            const nodeKey = WRITER_OBJ.nodes[WRITER_OBJ.nodes.length - 1 - curr];
                                            const nodeCurrent = (0, lexicalLexical_js_1.$getNodeByKey)(nodeKey);
                                            if (nodeCurrent)
                                                nodeCurrent.remove();
                                        }
                                        curr += 1;
                                    }
                                    if (!!!obj.end) {
                                        const loading = (0, lexical_decoratorsLexicalDecorators_js_1.$createLoadingNode)({
                                            size: 'small',
                                            inline: true
                                        });
                                        insertAfter.insertAfter(loading);
                                        insertAfter.selectNext();
                                        new_nodes_replace.push(loading);
                                    }
                                    WRITER_OBJ.nodes = new_nodes_replace.map(o => o.getKey());
                                }
                                break;
                            }
                        case 'rewrite':
                            {
                                for (let i = WRITER_OBJ.nodesToReplace.length - 1; i > -1; i--) {
                                    if (i === 0) {
                                        const insertAfterKey = WRITER_OBJ.nodesToReplace[i];
                                        const node = (0, lexicalLexical_js_1.$getNodeByKey)(insertAfterKey);
                                        if (node) {
                                            var insertAfter = node;
                                            var curr = 0;
                                            const new_nodes = [];
                                            while (curr < nodes.length) {
                                                insertAfter.insertAfter(nodes[curr]);
                                                insertAfter.selectNext();
                                                new_nodes.push(nodes[curr]);
                                                if (curr === 0)
                                                    insertAfter.remove();
                                                insertAfter = nodes[curr];
                                                curr += 1;
                                            }
                                            if (!!!obj.end) {
                                                const loading = (0, lexical_decoratorsLexicalDecorators_js_1.$createLoadingNode)({
                                                    size: "medium",
                                                    inline: false
                                                });
                                                insertAfter.insertAfter(loading);
                                                insertAfter.selectNext();
                                                new_nodes.push(loading);
                                            }
                                            WRITER_OBJ.nodesToReplace = new_nodes.map(o => o.getKey());
                                        }
                                    }
                                    else {
                                        const nodeKey = WRITER_OBJ.nodesToReplace[i];
                                        const node = (0, lexicalLexical_js_1.$getNodeByKey)(nodeKey);
                                        if (node)
                                            node.remove();
                                    }
                                }
                                break;
                            }
                        case 'rewrite-selection':
                            {
                                for (let i = WRITER_OBJ.selectionNodes.length - 1; i > -1; i--) {
                                    if (i === 0) {
                                        const insertAfterKey = WRITER_OBJ.selectionNodes[i];
                                        const node = (0, lexicalLexical_js_1.$getNodeByKey)(insertAfterKey);
                                        if (node) {
                                            var insertAfter = node;
                                            var curr = 0;
                                            const new_nodes = [];
                                            while (curr < nodes.length) {
                                                insertAfter.insertAfter(nodes[curr]);
                                                insertAfter.selectNext();
                                                new_nodes.push(nodes[curr]);
                                                if (curr === 0)
                                                    insertAfter.remove();
                                                insertAfter = nodes[curr];
                                                curr += 1;
                                            }
                                            if (!!!obj.end) {
                                                const loading = (0, lexical_decoratorsLexicalDecorators_js_1.$createLoadingNode)({
                                                    size: "small",
                                                    inline: true
                                                });
                                                insertAfter.insertAfter(loading);
                                                insertAfter.selectNext();
                                                new_nodes.push(loading);
                                            }
                                            WRITER_OBJ.selectionNodes = new_nodes.map(o => o.getKey());
                                        }
                                    }
                                    else {
                                        const nodeKey = WRITER_OBJ.selectionNodes[i];
                                        const node = (0, lexicalLexical_js_1.$getNodeByKey)(nodeKey);
                                        if (node)
                                            node.remove();
                                    }
                                }
                                break;
                            }
                    }
                }
                else {
                    switch (WRITER_OBJ.type) {
                        case 'rewrite':
                            {
                                const nodes = WRITER_OBJ.nodesToReplace.map(o => (0, lexicalLexical_js_1.$getNodeByKey)(o));
                                nodes.forEach(n => {
                                    if ((0, lexical_decoratorsLexicalDecorators_js_1.$isLoadingNode)(n))
                                        n.remove();
                                });
                                break;
                            }
                        case 'rewrite-selection':
                            {
                                const nodes = WRITER_OBJ.selectionNodes.map(o => (0, lexicalLexical_js_1.$getNodeByKey)(o));
                                nodes.forEach(n => {
                                    if ((0, lexical_decoratorsLexicalDecorators_js_1.$isLoadingNode)(n))
                                        n.remove();
                                });
                                break;
                            }
                        case 'write':
                            {
                                const nodes = WRITER_OBJ.nodes.map(o => (0, lexicalLexical_js_1.$getNodeByKey)(o));
                                nodes.forEach(n => {
                                    if ((0, lexical_decoratorsLexicalDecorators_js_1.$isLoadingNode)(n))
                                        n.remove();
                                });
                                break;
                            }
                    }
                    document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                        detail: {
                            severity: "error",
                            message: "Something went wrong with the AI writing!"
                        }
                    }));
                    if (!!!obj.end && window.socket) {
                        window.socket.emit('ai-write-end', {
                            message_id: obj.message_id
                        });
                        delete AI_WRITING_STATE[obj.message_id];
                    }
                }
            });
        }
    }
}
function registerAIWritingHelperEditable(editor) {
    const writeWithAI = document.getElementById('write-with-ai-button');
    const rewriteWithAI = document.getElementById('rewrite-with-ai-button');
    if (writeWithAI)
        writeWithAI.addEventListener('click', handleWriteWithAi);
    if (rewriteWithAI)
        rewriteWithAI.addEventListener('click', handleRewriteBlockkWithAI);
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
        if (AI_WRITER_HELPER_STATE.timeout) {
            clearTimeout(AI_WRITER_HELPER_STATE.timeout);
            AI_WRITER_HELPER_STATE.timeout = null;
        }
        closeAIWriterMenu();
        AI_WRITER_HELPER_STATE.current_editor_id = editor._config.namespace;
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if (getEnableAIWriter() && (0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
            AI_WRITER_HELPER_STATE.timeout = setTimeout(() => {
                openAIWriterHelper();
            }, 2000);
        }
        else {
            closeAIWriterMenu();
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), editor.registerCommand(lexicalLexical_js_1.BLUR_COMMAND, () => {
        setTimeout(() => {
            if (AI_WRITER_HELPER_STATE.timeout) {
                clearTimeout(AI_WRITER_HELPER_STATE.timeout);
                AI_WRITER_HELPER_STATE.timeout = null;
            }
            closeAIWriterMenu();
        }, 100);
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_CRITICAL), () => {
        if (AI_WRITER_HELPER_STATE.timeout) {
            clearTimeout(AI_WRITER_HELPER_STATE.timeout);
            AI_WRITER_HELPER_STATE.timeout = null;
        }
        Object.entries(AI_WRITING_STATE).forEach(([str, obj]) => {
            if (obj.editorID === editor._config.namespace) {
                if (window.socket) {
                    window.socket.emit('ai-write-end', {
                        message_id: str
                    });
                }
                delete AI_WRITING_STATE[str];
            }
        });
        closeAIWriterMenu();
    });
}
exports.registerAIWritingHelperEditable = registerAIWritingHelperEditable;
function getPollQuestionMenuInputs(wrapper) {
    return {
        boldButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'bold'),
        italicButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'italic'),
        strikethroughButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'strikethrough'),
        underlineButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'underline'),
        superscriptButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'superscript'),
        subscriptButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'subscript'),
        codeButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'FORMAT_TEXT_COMMAND', 'code'),
        clearFormattingButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'CLEAR_TEXT_FORMATTING', undefined),
        backgroundColorButton: wrapper.querySelector('button[data-lexical-bg-color-button]'),
        backgroundColorInput: wrapper.querySelector('input[data-lexical-background-color]'),
        backgroundColorTransparent: wrapper.querySelector('input[data-lexical-background-transparent]'),
        textColorButton: wrapper.querySelector('button[data-lexical-text-color]'),
        textColorInput: wrapper.querySelector('input[data-lexical-text-color]'),
        textColorTransparent: wrapper.querySelector('input[data-lexical-text-transparent]'),
        blockStyleButton: wrapper.querySelector('button[data-lexical-block-style-button]'),
        undoButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'UNDO_COMMAND', undefined),
        redoButton: (0, lexical_sharedLexicalShared_js_1.q)(wrapper, 'REDO_COMMAND', undefined)
    };
}
function $updatePollQuestionToolbar(el) {
    const selection = (0, lexicalLexical_js_1.$getSelection)();
    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
        const nodes = selection.getNodes();
        const textFormat = {
            'bold': undefined,
            'italic': undefined,
            'strikethrough': undefined,
            'underline': undefined,
            'superscript': undefined,
            'subscript': undefined,
            'code': undefined
        };
        for (let node of nodes) {
            if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
                Object.keys(textFormat).forEach(key => {
                    const hasFormat = node.hasFormat(key);
                    /* @ts-ignore */
                    textFormat[key] = Boolean((textFormat[key] === true || textFormat[key] === undefined) && hasFormat);
                });
                if (node.hasFormat('superscript') && node.hasFormat('subscript')) {
                    const tag = (0, lexicalLexical_js_1.getElementOuterTag)(node, node.getFormat());
                    if (tag === 'sup') {
                        node.toggleFormat('subscript');
                        textFormat['subscript'] = false;
                    }
                    else if (tag === 'sub') {
                        node.toggleFormat('superscript');
                        textFormat['superscript'] = false;
                    }
                }
            }
        }
        const defaultBackgroundColor = (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)();
        const defaultTextColor = (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)();
        const backgroundColorTemp = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'background-color', 'undefined');
        const backgroundColor = Boolean(backgroundColorTemp === "undefined") ? defaultBackgroundColor : backgroundColorTemp;
        const textColorTemp = (0, lexical_selectionLexicalSelection_js_1.$getSelectionStyleValueForProperty)(selection, 'color', 'undefined');
        const textColor = Boolean(textColorTemp === "undefined") ? defaultTextColor : textColorTemp;
        const { boldButton, italicButton, strikethroughButton, underlineButton, superscriptButton, subscriptButton, codeButton, clearFormattingButton, backgroundColorButton, backgroundColorInput, backgroundColorTransparent, textColorButton, textColorInput, textColorTransparent, blockStyleButton } = getPollQuestionMenuInputs(el);
        const hasNoFormatting = Boolean(Object.values(textFormat).filter(b => Boolean(b === true)).length === 0);
        if (boldButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(boldButton, false, Boolean(textFormat.bold === true));
        if (italicButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(italicButton, false, Boolean(textFormat.italic === true));
        if (strikethroughButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(strikethroughButton, false, Boolean(textFormat.strikethrough === true));
        if (underlineButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(underlineButton, false, Boolean(textFormat.underline === true));
        if (superscriptButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(superscriptButton, false, Boolean(textFormat.superscript === true));
        if (subscriptButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(subscriptButton, false, Boolean(textFormat.subscript === true));
        if (codeButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(codeButton, false, Boolean(textFormat.code === true));
        if (clearFormattingButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(clearFormattingButton, hasNoFormatting, false);
        if (backgroundColorButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(backgroundColorButton, false, false);
        if (backgroundColorInput && lexicalLexical_js_1.VALID_HEX_REGEX.test(backgroundColor))
            backgroundColorInput.value = backgroundColor;
        else if (backgroundColorInput)
            backgroundColorInput.value = (0, lexical_sharedLexicalShared_js_1.getDefaultBackground)();
        if (backgroundColorTransparent) {
            if (backgroundColorTemp === 'undefined')
                backgroundColorTransparent.checked = true;
            else
                backgroundColorTransparent.checked = false;
        }
        if (textColorButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(textColorButton, false, false);
        if (textColorInput && lexicalLexical_js_1.VALID_HEX_REGEX.test(textColor))
            textColorInput.value = textColor;
        else if (textColorInput)
            textColorInput.value = (0, lexical_sharedLexicalShared_js_1.getDefaultTextColor)();
        if (textColorTransparent) {
            if (textColorTemp === 'undefined')
                textColorTransparent.checked = true;
            else
                textColorTransparent.checked = false;
        }
        if (blockStyleButton)
            (0, lexical_sharedLexicalShared_js_1.disableAndSelect)(blockStyleButton, false, false);
    }
}
function dispatchOnClick(e) {
    const wrapper = this.closest('div.lexical-wrapper');
    const dispatchStr = this.getAttribute('data-dispatch');
    const payload = this.getAttribute('data-payload');
    if (wrapper && dispatchStr) {
        const id = wrapper.id;
        if (id) {
            const editorInstances = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
            const editor = editorInstances[id];
            const dispatch = {
                'FORMAT_TEXT_COMMAND': lexicalLexical_js_1.FORMAT_TEXT_COMMAND,
                'MAKE_TRANSPARENT': lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT,
                'BACKGROUND_COLOR_CHANGE': lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE,
                'TEXT_COLOR_CHANGE': lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE,
                'UNDO_COMMAND': lexicalLexical_js_1.UNDO_COMMAND,
                'REDO_COMMAND': lexicalLexical_js_1.REDO_COMMAND,
                'CLEAR_TEXT_FORMATTING': lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING
            }[dispatchStr];
            if (payload && dispatch)
                editor.dispatchCommand(dispatch, payload);
            else if (dispatch)
                editor.dispatchCommand(dispatch, undefined);
        }
    }
}
var DEBOUNCE_COLOR_CHANGE$1 = undefined;
const COLOR_CHANGE_TIMEOUT_MS$1 = 500;
function onTextColorChange() {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    const value = this.value;
    const parent = this.parentElement;
    if (parent) {
        const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
        if (checkbox)
            checkbox.checked = false;
    }
    if (editor && lexicalLexical_js_1.VALID_HEX_REGEX.test(value)) {
        if (DEBOUNCE_COLOR_CHANGE$1)
            clearTimeout(DEBOUNCE_COLOR_CHANGE$1);
        const toDoFunc = function () {
            editor.dispatchCommand(lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE, value);
        };
        DEBOUNCE_COLOR_CHANGE$1 = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS$1);
    }
}
function onBackgroundColorChange() {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    const value = this.value;
    const parent = this.parentElement;
    if (parent) {
        const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
        if (checkbox)
            checkbox.checked = false;
    }
    if (editor && lexicalLexical_js_1.VALID_HEX_REGEX.test(value)) {
        if (DEBOUNCE_COLOR_CHANGE$1)
            clearTimeout(DEBOUNCE_COLOR_CHANGE$1);
        const toDoFunc = function () {
            editor.dispatchCommand(lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE, value);
        };
        DEBOUNCE_COLOR_CHANGE$1 = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS$1);
    }
}
function handleTextTransparentChange() {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            const wrapper = rootElement.closest('div.lexical-wrapper');
            if (wrapper) {
                if (this.checked) {
                    this.setAttribute('checked', '');
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'text',
                        color: null
                    });
                }
                else {
                    this.removeAttribute('checked');
                    const colorInput = wrapper.querySelector('input[data-lexical-text-color]');
                    if (colorInput)
                        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                            type: 'text',
                            color: colorInput.value
                        });
                }
            }
        }
    }
}
function handleBackgroundColorTransparentChange() {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            const wrapper = rootElement.closest('div.lexical-wrapper');
            if (wrapper) {
                if (this.checked) {
                    this.setAttribute('checked', '');
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'background',
                        color: null
                    });
                }
                else {
                    this.removeAttribute('checked');
                    const colorInput = wrapper.querySelector('input[data-lexical-background-color]');
                    if (colorInput)
                        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                            type: 'background',
                            color: colorInput.value
                        });
                }
            }
        }
    }
}
function setToolbarListeners(el, editor) {
    const { boldButton, italicButton, strikethroughButton, underlineButton, superscriptButton, subscriptButton, codeButton, clearFormattingButton, 
    // backgroundColorButton,
    backgroundColorInput, backgroundColorTransparent, 
    // textColorButton,
    textColorInput, textColorTransparent, undoButton, redoButton } = getPollQuestionMenuInputs(el);
    if (boldButton)
        boldButton.addEventListener('click', dispatchOnClick);
    if (italicButton)
        italicButton.addEventListener('click', dispatchOnClick);
    if (strikethroughButton)
        strikethroughButton.addEventListener('click', dispatchOnClick);
    if (underlineButton)
        underlineButton.addEventListener('click', dispatchOnClick);
    if (superscriptButton)
        superscriptButton.addEventListener('click', dispatchOnClick);
    if (subscriptButton)
        subscriptButton.addEventListener('click', dispatchOnClick);
    if (codeButton)
        codeButton.addEventListener('click', dispatchOnClick);
    if (clearFormattingButton)
        clearFormattingButton.addEventListener('click', dispatchOnClick);
    if (backgroundColorTransparent)
        backgroundColorTransparent.addEventListener('change', handleBackgroundColorTransparentChange);
    if (textColorTransparent)
        textColorTransparent.addEventListener('change', handleTextTransparentChange);
    if (textColorInput)
        textColorInput.addEventListener('input', onTextColorChange);
    if (backgroundColorInput)
        backgroundColorInput.addEventListener('input', onBackgroundColorChange);
    if (undoButton)
        undoButton.addEventListener('click', dispatchOnClick);
    if (redoButton)
        redoButton.addEventListener('click', dispatchOnClick);
}
function registerPollQuestionToolbar(editor) {
    const rootElement = editor.getRootElement();
    if (rootElement) {
        const wrapper = rootElement.closest('div.lexical-wrapper');
        if (wrapper)
            setToolbarListeners(wrapper);
    }
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            const wrapper = rootElement.closest('div.lexical-wrapper');
            if (wrapper) {
                $updatePollQuestionToolbar(wrapper);
            }
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE, textColor => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            const obj = {
                "color": textColor,
                'font-weight': '400'
            };
            if (textColor !== 'inherit')
                obj['font-weight'] = '500';
            (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, obj);
            (0, lexicalLexical_js_1.$setSelection)(selection);
            editor.dispatchCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, undefined);
            editor.focus();
            return true;
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE, backgroundColor => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
                "background-color": backgroundColor
            });
            (0, lexicalLexical_js_1.$setSelection)(selection);
            editor.dispatchCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, undefined);
            editor.focus();
            return true;
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING, () => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            const nodes = selection.getNodes();
            for (let node of nodes) {
                if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
                    node.setFormat(0);
                    node.setStyle('');
                }
            }
        }
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, payload => {
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            if (payload.type === "background") {
                (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
                    'background-color': payload.color
                });
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.focus();
                return true;
            }
            else if (payload.type === "text") {
                (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
                    'color': payload.color
                });
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.focus();
            }
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.INSERT_TAB_COMMAND, () => {
        (0, lexicalLexical_js_1.$insertNodes)([(0, lexicalLexical_js_1.$createTabNode)()]);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.KEY_TAB_COMMAND, () => {
        (0, lexicalLexical_js_1.$insertNodes)([(0, lexicalLexical_js_1.$createTabNode)()]);
        return true;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
}
exports.registerPollQuestionToolbar = registerPollQuestionToolbar;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CURRENT_VERSION = 1;
function getHandleMaxHeightClick(namespace, maxHeight) {
    const func = function (e) {
        const svg = this.querySelector('svg');
        const wrapper = document.getElementById(namespace);
        if (wrapper && svg) {
            if (wrapper.getAttribute('data-abbreviated') === "true") {
                wrapper.setAttribute('data-abbreviated', 'false');
                wrapper.style.setProperty("scrollbar-width", "none", 'important');
                wrapper.style.setProperty("overflow-y", "scroll");
                const scrollHeight = wrapper.scrollHeight;
                wrapper.style.setProperty("transition", 'max-height 0.5s ease-in-out');
                wrapper.style.setProperty("max-height", scrollHeight.toString().concat('px'));
                svg.style.setProperty("transform", "rotate(180deg)", 'important');
                setTimeout(() => {
                    wrapper.style.setProperty('max-height', 'auto');
                    wrapper.style.removeProperty("overflow-y");
                    wrapper.style.removeProperty("transition");
                }, 550);
            }
            else if (wrapper.getAttribute('data-abbreviated') === "false") {
                wrapper.setAttribute('data-abbreviated', 'true');
                wrapper.style.setProperty("transition", 'max-height 0.5s ease-in-out');
                wrapper.style.setProperty("overflow-y", "hidden");
                wrapper.style.setProperty('max-height', maxHeight.toString().concat('px'));
                svg.style.setProperty("transform", "rotate(0deg)", 'important');
                setTimeout(() => {
                    wrapper.style.removeProperty("transition");
                }, 550);
            }
        }
    };
    return func;
}
function createMaxHeightButton(config, maxHeight) {
    const button = document.createElement('button');
    button.insertAdjacentHTML("afterbegin", '<svg style="transition: transform 0.5s ease-in-out;" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowDown"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
    button.classList.add("icon", "filled", "primary", 'medium');
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", "Hide/Show Content");
    button.style.cssText = "position:absolute; bottom: 1rem; right: 1rem;";
    button.addEventListener("click", getHandleMaxHeightClick(config.namespace, maxHeight));
    return button;
}
/** @noInheritDoc */
class MaxHeightButtonNode extends lexicalLexical_js_1.DecoratorNode {
    constructor(maxHeight, key) {
        super(key);
        this.__maxHeight = maxHeight;
    }
    static getType() {
        return 'max-height-button';
    }
    static clone(node) {
        const newNode = new MaxHeightButtonNode(node.getMaxHeight(), node.__key);
        return newNode;
    }
    createDOM(config) {
        const span = document.createElement('span');
        return span;
    }
    updateDOM(prevNode, dom, config) {
        return false;
    }
    static importDOM() {
        return null;
    }
    exportDOM(editor) {
        const { element } = super.exportDOM(editor); // calls createDOM
        return {
            element
        };
    }
    getMaxHeight() {
        const self = this.getLatest();
        return self.__maxHeight;
    }
    setMaxHeight(n) {
        const self = this.getWritable();
        self.__maxHeight = n;
        return self;
    }
    static importJSON(serializedNode) {
        const node = $createMaxHeightNode(serializedNode.maxHeight);
        return node;
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            type: 'max-height-button',
            version: CURRENT_VERSION,
            maxHeight: this.getMaxHeight()
        };
    }
    // Mutation
    collapseAtStart() {
        return false;
    }
    isInline() {
        return true;
    }
    decorate(editor, config) {
        const element = editor.getElementByKey(this.__key);
        if (element) {
            if (element.children.length === 0) {
                const button = createMaxHeightButton(config, this.getMaxHeight());
                element.append(button);
                return button;
            }
        }
        return document.createElement('div');
    }
}
exports.MaxHeightButtonNode = MaxHeightButtonNode;
function $createMaxHeightNode(n) {
    return new MaxHeightButtonNode(n);
}
function registerMaxHeightNode(editor) {
    var _a;
    const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    if (wrapper) {
        const dataMaxHeight = wrapper.getAttribute('data-max-height');
        if (dataMaxHeight) {
            wrapper.style.setProperty("position", "relative", "important");
            wrapper.style.setProperty("max-height", dataMaxHeight.concat("px"), "important");
            wrapper.style.setProperty("scrollbar-width", "none", 'important');
            wrapper.style.setProperty("overflow-y", "scroll");
            if (wrapper.scrollHeight > wrapper.offsetHeight) {
                wrapper.style.setProperty("overflow-y", "hidden");
                wrapper.setAttribute("data-abbreviated", "true");
                wrapper.style.removeProperty("scrollbar-width");
                if (dataMaxHeight && Number.isInteger(parseInt(dataMaxHeight))) {
                    editor.update(() => {
                        const root = (0, lexicalLexical_js_1.$getRoot)();
                        root.append($createMaxHeightNode(parseInt(dataMaxHeight)));
                    });
                    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerEditableListener(editable => {
                        if (editable) {
                            const maxHeightNodes = (0, lexicalLexical_js_1.$nodesOfType)(MaxHeightButtonNode);
                            maxHeightNodes.forEach(node => node.remove());
                        }
                    }), editor.registerMutationListener(MaxHeightButtonNode, nodeMutations => {
                        for (const [nodeKey, mutation] of nodeMutations) {
                            if (mutation === 'created') {
                                const maxHeightNodes = (0, lexicalLexical_js_1.$nodesOfType)(MaxHeightButtonNode);
                                maxHeightNodes.slice(1).forEach(node => node.remove());
                            }
                        }
                    }));
                }
            }
            else {
                wrapper.style.removeProperty("position");
                wrapper.style.removeProperty("max-height");
                wrapper.style.removeProperty("overflow-y");
                wrapper.style.removeProperty("scrollbar-width");
            }
        }
    }
    return () => { };
}
exports.registerMaxHeightNode = registerMaxHeightNode;
// https://github.com/facebook/lexical/blob/65bf70d0325bf49a86fee25661aeb23380e88dc6/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx
const HISTORY_MERGE = {
    tag: 'history-merge'
};
const uuid_autocomplete = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
class AutocompleteNode extends lexicalLexical_js_1.TextNode {
    /**
     * A unique uuid is generated for each session and assigned to the instance.
     * This helps to:
     * - Ensures max one Autocomplete node per session.
     * - Ensure that when collaboration is enabled, this node is not shown in
     *   other sessions.
     * See https://github.com/facebook/lexical/blob/master/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx#L39
     */
    static clone(node) {
        return new AutocompleteNode(node.__text, node.__uuid, node.__key);
    }
    static getType() {
        return 'autocomplete';
    }
    static importJSON(serializedNode) {
        return (0, lexicalLexical_js_1.$createTextNode)('');
    }
    exportJSON() {
        return {
            ...super.exportJSON(),
            uuid: uuid_autocomplete,
            type: 'autocomplete'
        };
    }
    constructor(text, uuid, key) {
        super(text, key);
        this.__uuid = uuid;
    }
    updateDOM(prevNode, dom, config) {
        return false;
    }
    exportDOM(_) {
        return {
            element: null
        };
    }
    importDOM() {
        return null;
    }
    excludeFromCopy() {
        return true;
    }
    createDOM(config) {
        const dom = super.createDOM(config);
        dom.classList.add('autocomplete');
        if (this.__uuid !== uuid_autocomplete) {
            dom.style.display = 'none';
        }
        return dom;
    }
}
exports.AutocompleteNode = AutocompleteNode;
function $createAutocompleteNode(text, uuid) {
    return new AutocompleteNode(text, uuid).setMode('token');
}
function getIncludeAutocomplete() {
    const includeAutoComplete = document.getElementById('include-autocomplete-suggestions');
    return includeAutoComplete === null || includeAutoComplete === void 0 ? void 0 : includeAutoComplete.checked;
}
let autocompleteNodeKey = null;
let lastMatch = null;
let lastSuggestion = null;
let prevNodeFormat = 0;
let prevNodeStyle = '';
var searchPromiseUUID = null;
// TODO lookup should be custom
function $search(selection) {
    var _a;
    if (!(0, lexicalLexical_js_1.$isRangeSelection)(selection) || !selection.isCollapsed()) {
        return [false, ''];
    }
    const node = selection.getNodes()[0];
    const anchor = selection.anchor;
    // Check siblings?
    if (!(0, lexicalLexical_js_1.$isTextNode)(node) || !node.isSimpleText() || !(0, lexical_selectionLexicalSelection_js_1.$isAtNodeEnd)(anchor) || node.getNextSibling() !== null && ((_a = node.getNextSibling()) === null || _a === void 0 ? void 0 : _a.getType()) !== "autocomplete") {
        return [false, ''];
    }
    const word = [];
    const text = node.getTextContent();
    let i = node.getTextContentSize();
    let c;
    while (i-- && i >= 0 && (c = text[i]) !== ' ') {
        word.push(c);
    }
    if (word.length === 0) {
        return [false, ''];
    }
    return [true, word.reverse().join('')];
}
function formatSuggestionText(suggestion) {
    const isMobile = (0, lexical_sharedLexicalShared_js_1.isTouchDevice)();
    return `${suggestion} ${isMobile ? '(SWIPE \u2B95)' : '(TAB)'}`;
}
/**
 * Remove autocomplete node from editor
 */
function $clearSuggestion() {
    const autocompleteNode = autocompleteNodeKey !== null ? (0, lexicalLexical_js_1.$getNodeByKey)(autocompleteNodeKey) : null;
    if (autocompleteNode !== null && autocompleteNode.isAttached()) {
        autocompleteNode.remove();
        autocompleteNodeKey = null;
    }
    if (searchPromiseUUID !== null) {
        searchPromiseUUID = null;
    }
    lastMatch = null;
    lastSuggestion = null;
    prevNodeFormat = 0;
    prevNodeStyle = '';
}
function updateAsyncSuggestion(searchPromiseUUIDCalbback, editor, newSuggestion) {
    var ret = false;
    if (searchPromiseUUID !== searchPromiseUUIDCalbback || newSuggestion === null) {
        editor.update(() => {
            // Outdated or no suggestion
            $clearSuggestion();
            ret = true;
            return;
        });
    }
    if (ret)
        return;
    if ((0, lexical_sharedLexicalShared_js_1.getCurrentEditorID)() === editor._config.namespace) {
        editor.update(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            const [hasMatch, match] = $search(selection);
            if (!hasMatch || match !== lastMatch || !(0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                // Outdated
                $clearSuggestion();
                return;
            }
            const selectionCopy = selection.clone();
            const prevNode = selection.getNodes()[0];
            prevNodeFormat = prevNode.getFormat();
            prevNodeStyle = prevNode.getStyle();
            const node = $createAutocompleteNode(formatSuggestionText(String(newSuggestion)), uuid_autocomplete).setFormat(prevNodeFormat).setStyle(prevNodeStyle.concat('opacity: 0.4;'));
            autocompleteNodeKey = node.getKey();
            selection.insertNodes([node]);
            (0, lexicalLexical_js_1.$setSelection)(selectionCopy);
            lastSuggestion = newSuggestion;
        }, HISTORY_MERGE);
    }
}
function $handleAutocompleteNodeTransform(node) {
    const key = node.getKey();
    if (node.__uuid === uuid_autocomplete && key !== autocompleteNodeKey) {
        // Max one Autocomplete node per session
        $clearSuggestion();
    }
}
function getOnResponse(editor_id) {
    const func = function (newSuggestionObj) {
        const current_editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (current_editor && current_editor._config.namespace === editor_id) {
            updateAsyncSuggestion(newSuggestionObj[1], current_editor, newSuggestionObj[0]);
        }
        else {
            const editor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[editor_id];
            if (editor) {
                editor.update(() => {
                    $clearSuggestion();
                });
            }
        }
    };
    return func;
}
function getHandleUpdate(editor) {
    const func = function () {
        editor.update(() => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            const [hasMatch, match] = $search(selection);
            if (!hasMatch) {
                $clearSuggestion();
                return;
            }
            // If match is the same return
            if (match === lastMatch) {
                return;
            }
            // Clear Suggestion
            $clearSuggestion();
            if (window.socket && getIncludeAutocomplete()) {
                var newPromiseUUID = window.crypto.randomUUID();
                const emitArgs = [match, newPromiseUUID];
                lastMatch = match;
                searchPromiseUUID = newPromiseUUID;
                if (window.socket)
                    window.socket.emit('ai-autocomplete', emitArgs, getOnResponse(editor._config.namespace));
            }
        }, HISTORY_MERGE);
    };
    return func;
}
function $handleAutocompleteIntent() {
    if (lastSuggestion === null || autocompleteNodeKey === null) {
        return false;
    }
    const autocompleteNode = (0, lexicalLexical_js_1.$getNodeByKey)(autocompleteNodeKey);
    if (autocompleteNode === null) {
        return false;
    }
    const textNode = (0, lexicalLexical_js_1.$createTextNode)(lastSuggestion).setFormat(prevNodeFormat).setStyle(prevNodeStyle);
    autocompleteNode.replace(textNode);
    textNode.selectNext();
    $clearSuggestion();
    return true;
}
function $handleKeypressCommand(e) {
    if ($handleAutocompleteIntent()) {
        e.preventDefault();
        return true;
    }
    return false;
}
function getHandleSwipeRightListener(editor) {
    const func = function (_force, e) {
        editor.update(() => {
            if ($handleAutocompleteIntent()) {
                e.preventDefault();
            }
            else {
                (0, lexicalLexical_js_1.$addUpdateTag)(HISTORY_MERGE.tag);
            }
        });
    };
    return func;
}
function getUnmountSuggestion(editor) {
    const func = function () {
        editor.update(() => {
            $clearSuggestion();
        }, HISTORY_MERGE);
    };
    return func;
}
function registerAutocompleteEditable(editor) {
    const rootElem = editor.getRootElement();
    editor.update(() => {
        const nodes = (0, lexicalLexical_js_1.$nodesOfType)(AutocompleteNode);
        nodes.forEach(n => n.remove(false));
    });
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(editor.registerNodeTransform(AutocompleteNode, $handleAutocompleteNodeTransform), editor.registerUpdateListener(getHandleUpdate(editor)), editor.registerCommand(lexicalLexical_js_1.KEY_TAB_COMMAND, $handleKeypressCommand, lexicalLexical_js_1.COMMAND_PRIORITY_NORMAL), editor.registerCommand(lexicalLexical_js_1.KEY_ARROW_RIGHT_COMMAND, $handleKeypressCommand, lexicalLexical_js_1.COMMAND_PRIORITY_LOW), ...(rootElem !== null ? [(0, lexical_sharedLexicalShared_js_1.addSwipeRightListener)(rootElem, getHandleSwipeRightListener(editor))] : []), getUnmountSuggestion(editor));
}
exports.registerAutocompleteEditable = registerAutocompleteEditable;
const LAUNCH_ARTICLE_SELECTION_MENU = (0, lexicalLexical_js_1.createCommand)('LAUNCH_ARTICLE_SELECTION_MENU');
exports.LAUNCH_ARTICLE_SELECTION_MENU = LAUNCH_ARTICLE_SELECTION_MENU;
const ADD_COMMENT_ARTICLE_COMMAND = (0, lexicalLexical_js_1.createCommand)('ADD_COMMENT_ARTICLE_COMMAND');
exports.ADD_COMMENT_ARTICLE_COMMAND = ADD_COMMENT_ARTICLE_COMMAND;
const RECEIVE_COMMENT_ARTICLE_COMMAND = (0, lexicalLexical_js_1.createCommand)('RECEIVE_COMMENT_ARTICLE_COMMAND');
exports.RECEIVE_COMMENT_ARTICLE_COMMAND = RECEIVE_COMMENT_ARTICLE_COMMAND;
const ADD_ANNOTATE_ARTICLE_COMMAND = (0, lexicalLexical_js_1.createCommand)('ADD_ANNOTATE_ARTICLE_COMMAND');
exports.ADD_ANNOTATE_ARTICLE_COMMAND = ADD_ANNOTATE_ARTICLE_COMMAND;
const RECEIVE_ANNOTATE_ARTICLE_COMMAND = (0, lexicalLexical_js_1.createCommand)('RECEIVE_ANNOTATE_ARTICLE_COMMAND');
exports.RECEIVE_ANNOTATE_ARTICLE_COMMAND = RECEIVE_ANNOTATE_ARTICLE_COMMAND;
const SCROLL_TO_NODE = (0, lexicalLexical_js_1.createCommand)('SCROLL_TO_NODE');
exports.SCROLL_TO_NODE = SCROLL_TO_NODE;
const COPY_LINK_SELECTION = (0, lexicalLexical_js_1.createCommand)('COPY_LINK_SELECTION');
exports.COPY_LINK_SELECTION = COPY_LINK_SELECTION;
const UPDATE_TOOLBAR_COMMAND = (0, lexicalLexical_js_1.createCommand)('UPDATE_TOOLBAR_COMMAND');
exports.UPDATE_TOOLBAR_COMMAND = UPDATE_TOOLBAR_COMMAND;
const FONT_FAMILY_CHANGE = (0, lexicalLexical_js_1.createCommand)('FONT_FAMILY_CHANGE');
exports.FONT_FAMILY_CHANGE = FONT_FAMILY_CHANGE;
const FONT_WEIGHT_CHANGE = (0, lexicalLexical_js_1.createCommand)('FONT_WEIGHT_CHANGE');
exports.FONT_WEIGHT_CHANGE = FONT_WEIGHT_CHANGE;
const FONT_SIZE_CHANGE = (0, lexicalLexical_js_1.createCommand)('FONT_SIZE_CHANGE');
exports.FONT_SIZE_CHANGE = FONT_SIZE_CHANGE;
const LAUNCH_TABLE_MENU = (0, lexicalLexical_js_1.createCommand)('LAUNCH_TABLE_MENU');
exports.LAUNCH_TABLE_MENU = LAUNCH_TABLE_MENU;
const LAUNCH_SELECTION_MENU = (0, lexicalLexical_js_1.createCommand)('LAUNCH_SELECTION_MENU');
exports.LAUNCH_SELECTION_MENU = LAUNCH_SELECTION_MENU;
const ASK_AI_COMMAND = (0, lexicalLexical_js_1.createCommand)('ASK_AI_COMMAND');
exports.ASK_AI_COMMAND = ASK_AI_COMMAND;
/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 *
 */
const autoUpdateObject = {};
function getPortalEl() {
    return document.getElementById('text-table-selection-ref');
}
exports.getPortalEl = getPortalEl;
const ALLOWED_FONTS = new Set(["Anuphan, sans-serif;", "Arial, sans-serif;", "Verdana, sans-serif;", "Tahoma, sans-serif;", "Trebuchet MS, sans-serif;", "Times New Roman, serif;", "Georgia, serif;", "Garamond, serif;", "Courier New, monospace;", "Brush Script MT, cursive;"]);
const ALLOWED_FONT_WEIGHTS = new Set(['100', '200', '300', '400', '500', '600', '700']);
exports.ALLOWED_FONT_WEIGHTS = ALLOWED_FONT_WEIGHTS;
const ALLOWED_FONT_SIZES = new Set(['caption', 'body2', 'body1', 'h6', 'h5', 'h4', 'h3', 'h2', 'h1']);
exports.ALLOWED_FONT_SIZES = ALLOWED_FONT_SIZES;
const FONT_SIZE_TO_CSS = {
    'caption': {
        'font-size': '0.75rem',
        'line-height': '1.66',
        'letter-spacing': '0.03333em'
    },
    'body2': {
        'font-size': '0.875rem',
        'line-height': '1.43',
        'letter-spacing': '0.01071em'
    },
    'body1': {
        'font-size': '1rem',
        'line-height': '1.5',
        'letter-spacing': '0.00938em'
    },
    'h6': {
        'font-size': '1.15rem',
        'line-height': '1.6',
        'letter-spacing': '0.0075em'
    },
    'h5': {
        'font-size': '1.35rem',
        'line-height': '1.334',
        'letter-spacing': '0em'
    },
    'h4': {
        'font-size': '1.6rem',
        'line-height': '1.2944',
        'letter-spacing': '0.00294em'
    },
    'h3': {
        'font-size': '1.85rem',
        'line-height': '1.2548',
        'letter-spacing': '0.00588'
    },
    'h2': {
        'font-size': '2.1rem',
        'line-height': '1.205',
        'letter-spacing': '0.0042em'
    },
    'h1': {
        'font-size': '2.6rem',
        'line-height': '1.167',
        'letter-spacing': '0em'
    }
};
exports.FONT_SIZE_TO_CSS = FONT_SIZE_TO_CSS;
const VALID_FORMAT_ELEMENT_COMMAND_SET = new Set(['left', 'center', 'right', 'justify']);
const VALID_FORMAT_TEXT_COMMAND_SET = new Set(['bold', 'italic', 'strikethrough', 'underline', 'superscript', 'subscript', 'mark', 'code', 'quote', 'kbd']);
const AI_WRITER_ID = 'ai-writer-helper-menu';
const FLOATING_TEXT_MENU_ID = 'text-selection-menu-toolbar-rte';
const FLOATING_ARTICLE_MENU_ID = 'text-selection-article';
var FOCUS_OUT_TIMEOUT = undefined;
/* --------------------------------------------- Per Editor ----------------------------- */
var DEBOUNCE_COLOR_CHANGE = undefined;
const COLOR_CHANGE_TIMEOUT_MS = 500;
function getFontFamilyChange(editor) {
    const handleFontFamilyChange = function () {
        if (ALLOWED_FONTS.has(this.value) || this.value === 'Inherit')
            editor.dispatchCommand(FONT_FAMILY_CHANGE, this.value);
    };
    return handleFontFamilyChange;
}
function getFontWeightChange(editor) {
    const handleFontWeightChange = function () {
        if (ALLOWED_FONT_WEIGHTS.has(this.value) || this.value === 'Inherit')
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, this.value);
    };
    return handleFontWeightChange;
}
function getFontSizeChange(editor) {
    const handleFontWeightChange = function () {
        if (ALLOWED_FONT_SIZES.has(this.value) || this.value === 'Inherit')
            editor.dispatchCommand(FONT_SIZE_CHANGE, this.value);
    };
    return handleFontWeightChange;
}
function getTextColorChange(editor) {
    const handleTextColorChange = function () {
        const value = this.value;
        const parent = this.parentElement;
        if (parent) {
            const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
            if (checkbox)
                checkbox.checked = false;
        }
        if (lexicalLexical_js_1.VALID_HEX_REGEX.test(value)) {
            if (DEBOUNCE_COLOR_CHANGE)
                clearTimeout(DEBOUNCE_COLOR_CHANGE);
            const toDoFunc = function () {
                editor.dispatchCommand(lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE, value);
            };
            DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS);
        }
    };
    return handleTextColorChange;
}
/**
 * Returns a function that handles the change of the background color input for an editor
 * @param editor
 * @returns
 */
function getBackgroundColorChange(editor) {
    const handleBackgroundColorChange = function (_) {
        if (lexicalLexical_js_1.VALID_HEX_REGEX.test(this.value)) {
            if (DEBOUNCE_COLOR_CHANGE)
                clearTimeout(DEBOUNCE_COLOR_CHANGE);
            const value = this.value;
            const parent = this.parentElement;
            if (parent) {
                const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
                if (checkbox)
                    checkbox.checked = false;
            }
            const toDoFunc = function () {
                editor.dispatchCommand(lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE, value);
            };
            DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS);
        }
    };
    return handleBackgroundColorChange;
}
function floatingTextColorChange(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        if (lexicalLexical_js_1.VALID_HEX_REGEX.test(this.value)) {
            if (lexicalLexical_js_1.VALID_HEX_REGEX.test(this.value)) {
                if (DEBOUNCE_COLOR_CHANGE)
                    clearTimeout(DEBOUNCE_COLOR_CHANGE);
                const value = this.value;
                const parent = this.parentElement;
                if (parent) {
                    const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
                    if (checkbox)
                        checkbox.checked = false;
                }
                const toDoFunc = function () {
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE, value);
                };
                DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS);
            }
        }
    }
}
function floatingBackgroundColorChange(e) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        if (lexicalLexical_js_1.VALID_HEX_REGEX.test(this.value)) {
            if (DEBOUNCE_COLOR_CHANGE)
                clearTimeout(DEBOUNCE_COLOR_CHANGE);
            const value = this.value;
            const parent = this.parentElement;
            if (parent) {
                const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector('input[type="checkbox"]') : null;
                if (checkbox)
                    checkbox.checked = false;
            }
            const toDoFunc = function () {
                editor.dispatchCommand(lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE, value);
            };
            DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc, COLOR_CHANGE_TIMEOUT_MS);
        }
    }
}
function floatingTextTransparentChange(e) {
    var _a;
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        if (this.checked) {
            this.setAttribute('checked', '');
            editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                type: 'text',
                color: null
            });
        }
        else {
            this.removeAttribute('checked');
            const wrapper = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            if (wrapper) {
                const colorInput = wrapper.querySelector('input#floating-text-color-color');
                if (colorInput)
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'text',
                        color: colorInput.value
                    });
            }
        }
    }
}
function floatingBackgroundTransparentChange(e) {
    var _a;
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        if (this.checked) {
            this.setAttribute('checked', '');
            editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                type: 'background',
                color: null
            });
        }
        else {
            this.removeAttribute('checked');
            const wrapper = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
            if (wrapper) {
                const colorInput = wrapper.querySelector('input#floating-bg-color-bg-color');
                if (colorInput)
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'background',
                        color: colorInput.value
                    });
            }
        }
    }
}
const VALID_COMMANDS = new Set(['REDO_COMMAND', 'UNDO_COMMAND', 'CLEAR_EDITOR_COMMAND', 'INSERT_LINE_BREAK_COMMAND', 'INDENT_CONTENT_COMMAND', 'OUTDENT_CONTENT_COMMAND', 'FORMAT_ELEMENT_COMMAND', 'FORMAT_TEXT_COMMAND', 'MAKE_TRANSPARENT']);
function dispatchLexicalCommand(e) {
    const wrapper = this.closest('div.lexical-wrapper');
    const command = this.getAttribute('data-dispatch');
    const payload = this.getAttribute('data-payload');
    if (wrapper && command) {
        e.preventDefault();
        e.stopPropagation();
        const id = wrapper.id;
        const editorInstances = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
        const editor = id ? editorInstances[id] : undefined;
        if (editor) {
            try {
                switch (command) {
                    case 'REDO_COMMAND':
                        editor.dispatchCommand(lexicalLexical_js_1.REDO_COMMAND, undefined);
                        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                        return;
                    case 'UNDO_COMMAND':
                        editor.dispatchCommand(lexicalLexical_js_1.UNDO_COMMAND, undefined);
                        return;
                    case 'CLEAR_EDITOR_COMMAND':
                        const shouldClearHistory = payload === "true" ? true : false;
                        /* @ts-ignore */
                        editor.dispatchCommand(lexicalLexical_js_1.CLEAR_EDITOR_COMMAND, shouldClearHistory);
                        return;
                    case 'INSERT_LINE_BREAK_COMMAND':
                        /* @ts-ignore */
                        editor.dispatchCommand(lexicalLexical_js_1.INSERT_LINE_BREAK_COMMAND, undefined);
                        return;
                    case 'INDENT_CONTENT_COMMAND':
                        editor.dispatchCommand(lexicalLexical_js_1.INDENT_CONTENT_COMMAND, undefined);
                        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                        return;
                    case 'OUTDENT_CONTENT_COMMAND':
                        editor.dispatchCommand(lexicalLexical_js_1.OUTDENT_CONTENT_COMMAND, undefined);
                        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                        return;
                    case 'FORMAT_ELEMENT_COMMAND':
                        if (VALID_FORMAT_ELEMENT_COMMAND_SET.has(payload)) {
                            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, payload);
                            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                        }
                        return;
                    case 'FORMAT_TEXT_COMMAND':
                        if (VALID_FORMAT_TEXT_COMMAND_SET.has(payload)) {
                            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, payload);
                            this.classList.toggle('selected');
                        }
                        return;
                    default:
                        console.error('Unrecognized Command: '.concat(command));
                        return;
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}
function openFloatingContextMenu(el, editor) {
    closeFloatingArticleMenu();
    const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
    const currentEditorID = (0, lexical_sharedLexicalShared_js_1.getCurrentEditorID)();
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#lexical-insert-link-main-menu"
        }
    }));
    const linkMenu = document.getElementById('lexical-insert-link-main-menu');
    if (linkMenu)
        linkMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#floating-bg-color-menu"
        }
    }));
    const bgMenu = document.getElementById('floating-bg-color-menu');
    if (bgMenu)
        bgMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#floating-text-color-menu"
        }
    }));
    const colorMenu = document.getElementById('floating-text-color-menu');
    if (colorMenu)
        colorMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#lexical-insert-abbr-main"
        }
    }));
    const abbrMenu = document.getElementById('lexical-insert-abbr-main');
    if (abbrMenu)
        abbrMenu.style.display = 'none';
    if (menu && currentEditorID === editor._config.namespace) {
        menu.style.display = 'flex';
        const updatePopover = function () {
            const selection = document.getSelection();
            const root = editor.getRootElement();
            if (selection && root && selection.rangeCount > 0) {
                const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                if (getPortalEl()) {
                    this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                    this.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                }
            }
            else
                return;
            const options = {
                placement: "top",
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
        }.bind(el);
        updatePopover();
        const cleanup = (0, dom_1.autoUpdate)(el, menu, updatePopover);
        if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
            autoUpdateObject[FLOATING_TEXT_MENU_ID]();
            delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
        }
        autoUpdateObject[FLOATING_TEXT_MENU_ID] = cleanup;
    }
    else {
        closeFloatingContextMenu();
    }
}
function closeFloatingContextMenu() {
    const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#lexical-insert-link-main-menu"
        }
    }));
    const linkMenu = document.getElementById('lexical-insert-link-main-menu');
    if (linkMenu)
        linkMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#floating-bg-color-menu"
        }
    }));
    const bgMenu = document.getElementById('floating-bg-color-menu');
    if (bgMenu)
        bgMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#floating-text-color-menu"
        }
    }));
    const colorMenu = document.getElementById('floating-text-color-menu');
    if (colorMenu)
        colorMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
        detail: {
            str: "#lexical-insert-abbr-main"
        }
    }));
    const abbrMenu = document.getElementById('lexical-insert-abbr-main');
    if (abbrMenu)
        abbrMenu.style.display = 'none';
    if (menu) {
        if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
            try {
                autoUpdateObject[FLOATING_TEXT_MENU_ID]();
                delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
            }
            catch (error) { }
            menu.style.display = "none";
            menu.style.opacity = "0";
        }
    }
}
exports.closeFloatingContextMenu = closeFloatingContextMenu;
function openAIWriterMenu() {
    const el = getPortalEl();
    closeAIWriterMenu();
    const menu = document.getElementById(AI_WRITER_ID);
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    const selection = document.getSelection();
    if (menu && editor && editor.isEditable() && selection) {
        const root = editor.getRootElement();
        if (root) {
            if (selection && root && selection.rangeCount > 0) {
                const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                const PORTAL_EL = getPortalEl();
                if (PORTAL_EL && rect) {
                    const ancestor = selection.getRangeAt(0).commonAncestorContainer;
                    if (rect.left === 0 && rect.right === 0 && ancestor instanceof HTMLElement) {
                        const rectNew = ancestor.getBoundingClientRect();
                        rect.left = rectNew.left;
                        rect.right = rectNew.right;
                        rect.top += rectNew.top;
                    }
                    el.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                    el.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                }
            }
            menu.style.display = 'flex';
            const updatePopover = function () {
                const selection = document.getSelection();
                const root = editor.getRootElement();
                if (selection && root && selection.rangeCount > 0) {
                    const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                    const PORTAL_EL = getPortalEl();
                    if (PORTAL_EL && rect) {
                        const ancestor = selection.getRangeAt(0).commonAncestorContainer;
                        if (rect.left === 0 && rect.right === 0 && ancestor instanceof HTMLElement) {
                            const rectNew = ancestor.getBoundingClientRect();
                            rect.left = rectNew.left;
                            rect.right = rectNew.right;
                            rect.top += rectNew.top;
                        }
                        this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                        this.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                    }
                }
                else
                    return;
                const options = {
                    placement: "top",
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
            }.bind(el);
            updatePopover();
            const cleanup = (0, dom_1.autoUpdate)(el, menu, updatePopover);
            if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
                autoUpdateObject[FLOATING_TEXT_MENU_ID]();
                delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
            }
            autoUpdateObject[FLOATING_TEXT_MENU_ID] = cleanup;
        }
        else {
            closeAIWriterMenu();
        }
    }
    else {
        closeAIWriterMenu();
    }
}
exports.openAIWriterMenu = openAIWriterMenu;
function closeAIWriterMenu() {
    const menu = document.getElementById(AI_WRITER_ID);
    if (menu) {
        if (autoUpdateObject[AI_WRITER_ID]) {
            try {
                autoUpdateObject[AI_WRITER_ID]();
                delete autoUpdateObject[AI_WRITER_ID];
            }
            catch (error) { }
        }
        menu.style.display = "none";
        menu.style.opacity = "0";
    }
}
exports.closeAIWriterMenu = closeAIWriterMenu;
const setFloatingContextMenu = () => {
    window.closeFloatingContextMenu = closeFloatingContextMenu();
};
var IS_MOBILE_DEVICE = false;
function openFloatingArticleMenu(el, editor, currentEditorID, annotateOnly) {
    closeFloatingContextMenu();
    IS_MOBILE_DEVICE = Boolean((0, lexical_sharedLexicalShared_js_1.getDeviceType)() === "mobile");
    const IS_EDGE = /(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:|\bEdge\/)(\d+)/.test(navigator.userAgent);
    const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
    if (menu && currentEditorID === editor._config.namespace) {
        if (annotateOnly) {
            const butt = menu.querySelector('button[data-comment-button][data-dispatch="COMMENT_ARTICLE_COMMAND"]');
            if (butt)
                butt.setAttribute('disabled', '');
        }
        menu.style.display = 'flex';
        const updatePopover = function () {
            const selection = document.getSelection();
            const root = editor.getRootElement();
            if (selection && root && selection.rangeCount > 0) {
                const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                if (getPortalEl()) {
                    if (!!!IS_MOBILE_DEVICE && !!!IS_EDGE)
                        this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                    else
                        this.style.top = `calc(${rect.top.toFixed(0).concat('px') + ` + ${rect.height.toFixed(0).concat('px')}` + ` + 3rem + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                    this.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                }
            }
            else
                return;
            const options = {
                placement: "top",
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
        }.bind(el);
        updatePopover();
        const cleanup = (0, dom_1.autoUpdate)(el, menu, updatePopover);
        if (autoUpdateObject[FLOATING_ARTICLE_MENU_ID]) {
            autoUpdateObject[FLOATING_ARTICLE_MENU_ID]();
            delete autoUpdateObject[FLOATING_ARTICLE_MENU_ID];
        }
        autoUpdateObject[FLOATING_ARTICLE_MENU_ID] = cleanup;
    }
    else {
        closeFloatingArticleMenu();
    }
}
function closeFloatingArticleMenu() {
    const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
    const shareSelection = document.getElementById('share-selection-comment-menu');
    if (shareSelection) {
        if (autoUpdateObject['share-selection-comment-menu']) {
            try {
                autoUpdateObject['share-selection-comment-menu']();
                delete autoUpdateObject['share-selection-comment-menu'];
            }
            catch (error) { }
            shareSelection.style.display = "none";
            shareSelection.style.opacity = "0";
        }
    }
    if (menu) {
        if (autoUpdateObject[FLOATING_ARTICLE_MENU_ID]) {
            try {
                autoUpdateObject[FLOATING_ARTICLE_MENU_ID]();
                delete autoUpdateObject[FLOATING_ARTICLE_MENU_ID];
            }
            catch (error) { }
            menu.style.display = "none";
            menu.style.opacity = "0";
        }
    }
}
exports.closeFloatingArticleMenu = closeFloatingArticleMenu;
/**
 *
 * @param this
 * @param e
 */
function dispatchFormatTextCommand(e) {
    this.classList.toggle('selected');
    e.stopPropagation();
    e.preventDefault();
    const payload = this.getAttribute('data-payload');
    if (payload && VALID_FORMAT_TEXT_COMMAND_SET.has(payload)) {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor)
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, payload);
    }
}
function clearTextFormattingOnClick(e) {
    e.stopPropagation();
    e.preventDefault();
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor)
        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING, undefined);
}
function stopPropagation(e) {
    e.stopPropagation();
    e.stopImmediatePropagation();
}
function getHandleInsertParagraphClick(editor) {
    const handleInsertParagraphClick = function () {
        editor.update(() => {
            const root = (0, lexicalLexical_js_1.$getRoot)();
            const p = (0, lexicalLexical_js_1.$createParagraphNode)();
            root.append(p);
            (0, lexicalLexical_js_1.$setSelection)(p.select());
        });
    };
    return handleInsertParagraphClick;
}
function getClearTextFormatting(editor) {
    const ret = function () {
        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING, undefined);
    };
    return ret;
}
function getHandleTextTransparentChange(editor) {
    const handleTextTransparentChange = function () {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            const wrapper = rootElement.closest('div.lexical-wrapper');
            if (wrapper) {
                if (this.checked) {
                    this.setAttribute('checked', '');
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'text',
                        color: null
                    });
                }
                else {
                    this.removeAttribute('checked');
                    const colorInput = wrapper.querySelector('input[data-lexical-text-color]');
                    if (colorInput)
                        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                            type: 'text',
                            color: colorInput.value
                        });
                }
            }
        }
    };
    return handleTextTransparentChange;
}
function getHandleBackgroundTransparentChange(editor) {
    const handleBackgroundTransparentChange = function () {
        const rootElement = editor.getRootElement();
        if (rootElement) {
            const wrapper = rootElement.closest('div.lexical-wrapper');
            if (wrapper) {
                if (this.checked) {
                    this.setAttribute('checked', '');
                    editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                        type: 'background',
                        color: null
                    });
                }
                else {
                    this.removeAttribute('checked');
                    const colorInput = wrapper.querySelector('input[data-lexical-background-color]');
                    if (colorInput)
                        editor.dispatchCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, {
                            type: 'background',
                            color: colorInput.value
                        });
                }
            }
        }
    };
    return handleBackgroundTransparentChange;
}
/**
 * Download lexical state
 * @param this
 * @param _e
 */
function downloadLexicalState(_e) {
    const wrapper = this.closest('div.lexical-wrapper');
    if (wrapper) {
        const id = wrapper.id;
        if (id) {
            const editors = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
            const editor = editors[id];
            if (editor)
                (0, lexical_fileLexicalFile_js_1.exportFile)(editor, {
                    fileName: id
                });
        }
    }
}
/* --------------------------------------------------------- Upload Lexical State -------------------------------------------------- */
/**
 * Aoppends lexical editor to output element to give user a preview of what the lexical editor will look like
 * @param output
 * @param richTextEditorType
 */
function appendRichTextEditorToOutput(output, richTextEditorType) {
    const div = document.createElement('div');
    div.setAttribute('id', 'prev_' + Math.random().toString().slice(2));
    div.classList.add('lexical-wrapper', 'example-render', 'mt-2');
    div.setAttribute('data-placeholder', '');
    div.setAttribute('data-rich-text-editor', '');
    div.setAttribute('data-type', 'article');
    div.style.cssText = "background-color: var(--background)!important; padding: 2px 5px!important; border-radius: 6px;";
    div.setAttribute('data-type', richTextEditorType);
    output.append(div);
    document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
        detail: {
            el: output
        }
    }));
}
exports.appendRichTextEditorToOutput = appendRichTextEditorToOutput;
/**
 * Returns the type of the currently focused editor
 * @returns
 */
function getCurrentEditorTypeForUpload() {
    const input = document.getElementById('current-lexical-editor-upload');
    if (input) {
        const id = input.value;
        if (id) {
            const editorWrapper = document.getElementById(id);
            if (editorWrapper) {
                const editor = editorWrapper.querySelector('div[data-rich-text-editor]');
                if (editor) {
                    return editor.getAttribute('data-type');
                }
            }
        }
    }
    return null;
}
async function onUploadAIChat(e) {
    e.stopPropagation();
    e.preventDefault();
    const dialog = this.closest('div.dialog-wrapper');
    const selected = this.querySelector('input[type="radio"]:checked');
    if (dialog && selected) {
        const chat_id = selected.value;
        try {
            const resp = await fetch(`/ai-chat/search/${encodeURIComponent(chat_id)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': (0, lexical_sharedLexicalShared_js_1.getCsrfToken)()
                }
            });
            const json = await resp.json();
            const str = json.str;
            const chat_id_new = json.chat_id;
            const chat_name = json.chat_name;
            if (!!!str || !!!chat_id_new || !!!chat_name)
                throw new Error("Something went wrong.");
            const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
            if (editor)
                editor.dispatchCommand(lexical_decoratorsLexicalDecorators_js_1.INSERT_AI_CHAT_NODE, {
                    html: str,
                    chat_id: chat_id_new,
                    chat_name
                });
        }
        catch (e) {
            console.error(e);
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: "error",
                        message: "Something went wrong getting the AI chat."
                    }
                }));
            }, 200);
        }
        (0, lexical_sharedLexicalShared_js_1.closeDialog)(dialog);
    }
}
function getOnOpenUploadFileDialog(e) {
    var _a, _b;
    if (e.detail.el.id === "lex-upload-file-dialog") {
        console.log("Upload Lexical File Dialog");
        const dialog = document.getElementById('lex-upload-file-dialog');
        if (dialog) {
            const uploadLexicalForm = document.getElementById('lexical-state-upload');
            const markdownFileForm = document.getElementById('markdown-file-upload');
            const notebookFileForm = document.getElementById('notebook-file-upload');
            const texFileForm = document.getElementById('tex-file-upload');
            const lexicalFileInput = document.getElementById('upload-lex-file-input');
            const markdownFileInput = document.getElementById('upload-md-file-input');
            const jupyterNotebookFileInput = document.getElementById('upload-ipynb-file-input');
            const texFileInput = document.getElementById('upload-tex-file-input');
            if (uploadLexicalForm && markdownFileForm && notebookFileForm && texFileForm) {
                uploadLexicalForm.addEventListener('submit', onLexicalUploadFormSubmit);
                uploadLexicalForm.addEventListener('reset', onLexicalUploadFormReset);
                markdownFileForm.addEventListener('reset', onLexicalUploadFormReset);
                notebookFileForm.addEventListener('reset', onLexicalUploadFormReset);
                texFileForm.addEventListener('reset', onLexicalUploadFormReset);
            }
            if (lexicalFileInput)
                lexicalFileInput.addEventListener('change', onLexicalFileUpload);
            if (markdownFileInput)
                markdownFileInput.addEventListener('change', onMarkdownFileUpload);
            if (jupyterNotebookFileInput)
                jupyterNotebookFileInput.addEventListener('change', onFileUpload);
            if (texFileInput)
                texFileInput.addEventListener('change', onFileUpload);
            const id = ((_b = (_a = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)()) === null || _a === void 0 ? void 0 : _a._config) === null || _b === void 0 ? void 0 : _b.namespace) || 'full';
            const uploadFileDialog = document.getElementById('lex-upload-file-dialog');
            const dialogOutput = document.getElementById('upload-lex-file-input-output');
            const markdownDialogOutput = document.getElementById('upload-md-file-input-output');
            const jupyterNotebookDialogOutput = document.getElementById('upload-ipynb-file-input-output');
            const texNoteDialogOutput = document.getElementById('upload-tex-file-input-output');
            const uploadAIChatForm = document.getElementById('insert-ai-chat-rte');
            if (uploadAIChatForm) {
                uploadAIChatForm.addEventListener('submit', onUploadAIChat);
            }
            const hiddenCurrentLexicalEditorInput = document.getElementById('current-lexical-editor-upload');
            if (dialogOutput && hiddenCurrentLexicalEditorInput && markdownDialogOutput && jupyterNotebookDialogOutput && texNoteDialogOutput && uploadFileDialog) {
                hiddenCurrentLexicalEditorInput.value = id;
                // Add a rich text editor to output
                const type = getCurrentEditorTypeForUpload();
                if (type) {
                    // If there is an editor instance already in the output, remove it
                    const previousEditors = Array.from(dialogOutput.querySelectorAll('div[data-rich-text-editor]'));
                    if (previousEditors)
                        previousEditors.forEach(ed => ed.dispatchEvent(new CustomEvent('delete-lexical-instance')));
                    dialogOutput.innerHTML = '';
                    markdownDialogOutput.innerHTML = '';
                    jupyterNotebookDialogOutput.innerHTML = '';
                    texNoteDialogOutput.innerHTML = '';
                    appendRichTextEditorToOutput(dialogOutput, type);
                    appendRichTextEditorToOutput(markdownDialogOutput, type);
                    appendRichTextEditorToOutput(jupyterNotebookDialogOutput, type);
                    appendRichTextEditorToOutput(texNoteDialogOutput, type);
                }
                if (window.htmx)
                    window.htmx.process(uploadFileDialog);
                document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED', {
                    detail: {
                        el: uploadFileDialog
                    }
                }));
            }
        }
        document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
            detail: {
                dialog: dialog
            }
        }));
    }
}
/**
 * When the lexical file is uploaded, try to get the lexical state from the file and set the output
 * lexical instance state as the uploaded lexical state
 */
async function onLexicalFileUpload(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const files = this.files;
    const form = this.closest('form');
    if (files && form) {
        const file = files[0];
        const outputLexicalInstance = form.querySelector('div.lexical-wrapper');
        if (file && outputLexicalInstance && outputLexicalInstance.id) {
            try {
                const contents = await file.text();
                const editors = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
                const outputEditor = editors[outputLexicalInstance.id];
                const lexicalState = JSON.parse(contents.toString());
                if (outputEditor) {
                    const parsedLexicalState = outputEditor.parseEditorState(lexicalState.editorState);
                    outputEditor.setEditorState(parsedLexicalState);
                    outputEditor.setEditable(false);
                    const ouputEditorEl = outputEditor._rootElement;
                    if (ouputEditorEl)
                        document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
                            detail: {
                                el: ouputEditorEl
                            }
                        }));
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    }
}
async function onMarkdownFileUpload(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const files = this.files;
    const form = this.closest('form');
    if (files && form) {
        const file = files[0];
        const outputLexicalInstance = form.querySelector('div.lexical-wrapper');
        if (file && outputLexicalInstance && outputLexicalInstance.id) {
            try {
                const contents = await file.text();
                if (window.markdownToHTMLAi) {
                    const html = await window.markdownToHTMLAi(contents);
                    const editors = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
                    const outputEditor = editors[outputLexicalInstance.id];
                    if (outputEditor) {
                        outputEditor.update(() => {
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(html, 'text/html');
                            const nodes = (0, lexical_htmlLexicalHtml_js_1.$generateNodesFromDOM)(outputEditor, dom);
                            const root = (0, lexicalLexical_js_1.$getRoot)();
                            if (root) {
                                root.clear();
                                root.append(...nodes);
                                root.selectEnd();
                            }
                        });
                        outputEditor.setEditable(false);
                        const ouputEditorEl = outputEditor._rootElement;
                        if (ouputEditorEl) {
                            document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
                                detail: {
                                    el: ouputEditorEl
                                }
                            }));
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: "error",
                        message: "Something went wrong parsing the markdown file."
                    }
                }));
            }
        }
    }
}
async function onFileUpload(e) {
    var type;
    const form = this.closest('form');
    if (this.id === "upload-ipynb-file-input") {
        type = 'notebook';
    }
    else {
        type = 'tex';
    }
    if (this.files === null || this.files.length < 1) {
        document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
            detail: {
                severity: "error",
                message: "Unable to find file for file upload."
            }
        }));
        return;
    }
    if (!!!form) {
        document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
            detail: {
                severity: "error",
                message: "Unable to find form for lexical file upload."
            }
        }));
        return;
    }
    const outputLexicalInstance = form.querySelector('div.lexical-wrapper');
    if (!!!outputLexicalInstance) {
        document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
            detail: {
                severity: "error",
                message: "Unable to find form for lexical file upload."
            }
        }));
        return;
    }
    const outputEditor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[outputLexicalInstance.id];
    if (!!!outputEditor) {
        document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
            detail: {
                severity: "error",
                message: "Unable to find output editor for lexical file upload."
            }
        }));
        return;
    }
    const file = this.files[0];
    const formData = new FormData();
    formData.append('file', file);
    fetch(`/api/lexical-file-upload/${type}`, {
        method: 'POST',
        body: formData
    }).then(res => {
        if (res.status !== 200) {
            throw new Error("Something went wrong getting the lexical state for the file upload.");
        }
        return res.json();
    }).then(res => {
    }).catch(e => {
        console.error(e);
    });
}
/**
 *
 */
function onLexicalUploadFormReset(_e) {
    var outputID;
    if (this.id === "markdown-file-upload") {
        outputID = "upload-md-file-input-output";
    }
    else if (this.id === "notebook-file-upload") {
        outputID = "upload-ipynb-file-input-output";
    }
    else if (this.id === "tex-file-upload") {
        outputID = "upload-tex-file-input-output";
    }
    else {
        outputID = "upload-lex-file-input-output";
    }
    const output = document.getElementById(outputID);
    const outputLexicalInstance = this.querySelector('div.lexical-wrapper');
    if (outputLexicalInstance)
        outputLexicalInstance.dispatchEvent(new CustomEvent('delete-lexical-instance'));
    if (output)
        output.innerHTML = '';
    const type = getCurrentEditorTypeForUpload();
    if (type && output) {
        appendRichTextEditorToOutput(output, type);
        document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
            detail: {
                el: output
            }
        }));
    }
}
/**
 * On upload lexical state form submit
 * @param this
 * @param e
 */
function onLexicalUploadFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const dialog = this.closest('div.dialog-wrapper');
    const input = this.querySelector('input[accept=".lexical"]');
    const currentEditorSecretInput = document.getElementById('current-lexical-editor-upload');
    try {
        if (input && dialog && currentEditorSecretInput && currentEditorSecretInput.value) {
            const outputLexicalInstance = this.querySelector('div.lexical-wrapper');
            if (outputLexicalInstance) {
                // Get the id of the output lexical instance
                const id = outputLexicalInstance.id;
                const editorInstances = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
                if (id) {
                    // Get the editor in the output element of the form
                    const editor = editorInstances[id];
                    const editorToInsert = editorInstances[currentEditorSecretInput.value];
                    if (editor && editorToInsert) {
                        // Set the editorState the current editor equal to the editorState of the editor in the output instance of the dialog
                        const editorState = editor.getEditorState().toJSON();
                        const parsedEditorState = editorToInsert.parseEditorState(editorState);
                        editorToInsert.setEditorState(parsedEditorState);
                        (0, lexical_sharedLexicalShared_js_1.closeDialog)(dialog);
                    }
                }
            }
        }
    }
    catch (error) {
        console.error(error);
    }
}
function handleFocusOut() {
    if (FOCUS_OUT_TIMEOUT)
        clearTimeout(FOCUS_OUT_TIMEOUT);
    FOCUS_OUT_TIMEOUT = setTimeout(() => {
        closeFloatingContextMenu();
    }, 100);
}
function onFloatingContextMenuFocusIn(e) {
    if (FOCUS_OUT_TIMEOUT)
        clearTimeout(FOCUS_OUT_TIMEOUT);
}
function handleFocusIn() {
    if (FOCUS_OUT_TIMEOUT)
        clearTimeout(FOCUS_OUT_TIMEOUT);
}
/* ----------------------------- Functions that will be used elsewhere as well --------------------------- */
function fontFamilyChangeCallback(selection, fontWithSemiColon) {
    if (fontWithSemiColon === 'Inherit')
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'font-family': null
        });
    else
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'font-family': fontWithSemiColon.replace(';', '')
        });
}
exports.fontFamilyChangeCallback = fontFamilyChangeCallback;
function fontWeightChangeCallback(selection, weight) {
    if (weight === 'Inherit')
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'font-weight': null
        });
    else
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'font-weight': weight
        });
}
exports.fontWeightChangeCallback = fontWeightChangeCallback;
function fontSizeChangeCallback(selection, size) {
    if (size === "Inherit") {
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'font-size': null,
            'line-height': null,
            'letter-spacing': null
        });
    }
    else {
        const cssObject = FONT_SIZE_TO_CSS[size];
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, cssObject);
    }
}
exports.fontSizeChangeCallback = fontSizeChangeCallback;
function textColorChangeCallback(selection, textColor) {
    (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
        "color": textColor
    });
}
exports.textColorChangeCallback = textColorChangeCallback;
function backgroundColorChangeCallback(selection, backgroundColor) {
    (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
        "background-color": backgroundColor
    });
}
exports.backgroundColorChangeCallback = backgroundColorChangeCallback;
function makeTransparentCallback(selection, payload) {
    if (payload.type === "background") {
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'background-color': payload.color
        });
        (0, lexicalLexical_js_1.$setSelection)(selection);
    }
    else if (payload.type === "text") {
        (0, lexical_selectionLexicalSelection_js_1.$patchStyleText)(selection, {
            'color': payload.color
        });
        (0, lexicalLexical_js_1.$setSelection)(selection);
    }
}
exports.makeTransparentCallback = makeTransparentCallback;
function clearTextFormattingCallback(selection) {
    const nodes = selection.getNodes();
    for (let node of nodes) {
        if ((0, lexicalLexical_js_1.$isTextNode)(node)) {
            node.setFormat(0);
            node.setStyle('');
        }
    }
}
exports.clearTextFormattingCallback = clearTextFormattingCallback;
var inHeading = false;
var inFormatText = false;
var inSize = false;
var inWeight = false;
var inAlign = false;
const SHARE_ARTICLE_STATE = {
    "facebook": null,
    "x": null,
    "reddit": null,
    "linkedin": null,
    "email": null,
    "link": null,
    "pinterest": null,
    "whats-app": null,
    "telegram": null,
    "tumblr": null,
    "pocket": null,
    "buffer": null,
    "digg": null,
    "mix": null,
    "vkonate": null,
    "xing": null,
    "evernote": null,
    "hacker": null,
    "flipboard": null,
    "mename": null,
    "blogger": null,
    "odnoklassiniki": null,
    "yahoo": null,
    "google": null,
    "renren": null,
    "weibo": null,
    "baidu": null,
    "line": null
};
const headingNum = new Set(['1', '2', '3', '4', '5', '6']);
function $getHeadingOrParagraphNode() {
    const selection = (0, lexicalLexical_js_1.$getSelection)();
    if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.isCollapsed()) {
        const nodes = selection.getNodes();
        if (nodes.length) {
            const node = nodes[0];
            const blockNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, n => (0, lexical_rich_textLexicalRichText_js_1.$isHeadingNode)(n) || (0, lexicalLexical_js_1.$isParagraphNode)(n));
            if (blockNode) {
                return blockNode;
            }
        }
    }
}
function closeOtherColorPopover(e) {
    const linkMenu = document.getElementById('lexical-insert-link-main-menu');
    if (this.id === "floating-bg-color-button") {
        const menu = document.getElementById('floating-text-color-menu');
        if (menu)
            menu.style.display = 'none';
        if (linkMenu)
            linkMenu.style.display = 'none';
        document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
                str: "#floating-text-color-menu"
            }
        }));
        document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
                str: "#lexical-insert-link-main-menu"
            }
        }));
    }
    else if (this.id === "floating-text-color-button") {
        const menu = document.getElementById('floating-bg-color-menu');
        if (menu)
            menu.style.display = 'none';
        if (linkMenu)
            linkMenu.style.display = 'none';
        document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
                str: "#floating-bg-color-menu"
            }
        }));
        document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
                str: "#lexical-insert-link-main-menu"
            }
        }));
    }
}
function handleHeadingKeyUp(e) {
    if (e.altKey && e.key.toUpperCase() === "P") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.update(() => {
                const node = $getHeadingOrParagraphNode();
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if (node && (0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    (0, lexical_selectionLexicalSelection_js_1.$setBlocksType)(selection, () => (0, lexicalLexical_js_1.$createParagraphNode)());
                }
            });
        }
    }
    else if (e.altKey && e.key.toUpperCase() === "H" && !!!inHeading) {
        inHeading = true;
        return;
    }
    else if (inHeading && e.altKey && headingNum.has(e.key)) {
        const headingTag = 'h'.concat(e.key);
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && editor.hasNode(lexical_rich_textLexicalRichText_js_1.HeadingNode)) {
            editor.update(() => {
                const node = $getHeadingOrParagraphNode();
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if (node && (0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                    (0, lexical_selectionLexicalSelection_js_1.$setBlocksType)(selection, () => (0, lexical_rich_textLexicalRichText_js_1.$createHeadingNode)(headingTag));
                }
            });
        }
    }
    else if (e.altKey && e.key.toUpperCase() === "T" && !!!inFormatText) {
        inFormatText = true;
        return;
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "C") {
        // code 
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'code');
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "Q") {
        // quote
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'quote');
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "K") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'kbd');
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "S") {
        // strikethrough
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'strikethrough');
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "Y") {
        // clear text formatting
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING, undefined);
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "B") {
        // Subscript
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'subscript');
        }
    }
    else if (inFormatText && e.altKey && e.key.toUpperCase() === "P") {
        // Superscript
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_TEXT_COMMAND, 'superscript');
        }
    }
    else if (e.altKey && e.key.toUpperCase() === "S" && !!!inSize) {
        inSize = true;
        return;
    }
    else if (inSize && e.altKey && e.key.toUpperCase() === "C") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "caption");
        }
    }
    else if (inSize && e.altKey && e.key.toUpperCase() === "V") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "body2");
        }
    }
    else if (inSize && e.altKey && e.key.toUpperCase() === "B") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "body1");
        }
    }
    else if (inSize && e.altKey && e.key === "6") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h6");
        }
    }
    else if (inSize && e.altKey && e.key === "5") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h5");
        }
    }
    else if (inSize && e.altKey && e.key === "4") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h4");
        }
    }
    else if (inSize && e.altKey && e.key === "3") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h3");
        }
    }
    else if (inSize && e.altKey && e.key === "2") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h2");
        }
    }
    else if (inSize && e.altKey && e.key === "1") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor && (0, lexical_sharedLexicalShared_js_1.editorCanChangeSize)(editor)) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "h1");
        }
    }
    else if (inSize && e.altKey && e.key.toUpperCase() === "I") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_SIZE_CHANGE, "Inherit");
        }
    }
    else if (e.altKey && e.key.toUpperCase() === "W" && !!!inWeight) {
        inWeight = true;
        return;
    }
    else if (inWeight && e.altKey && e.key === "1") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "100");
        }
    }
    else if (inWeight && e.altKey && e.key === "2") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "200");
        }
    }
    else if (inWeight && e.altKey && e.key === "3") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "300");
        }
    }
    else if (inWeight && e.altKey && e.key === "4") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "400");
        }
    }
    else if (inWeight && e.altKey && e.key === "5") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "500");
        }
    }
    else if (inWeight && e.altKey && e.key === "6") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "600");
        }
    }
    else if (inWeight && e.altKey && e.key === "7") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "700");
        }
    }
    else if (inWeight && e.altKey && e.key.toUpperCase() === "I") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(FONT_WEIGHT_CHANGE, "Inherit");
        }
    }
    else if (e.altKey && e.key.toUpperCase() === "A" && !!!inAlign) {
        inAlign = true;
        return;
    }
    else if (inAlign && e.altKey && e.key.toUpperCase() === "L") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, "left");
        }
    }
    else if (inAlign && e.altKey && e.key.toUpperCase() === "C") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, "center");
        }
    }
    else if (inAlign && e.altKey && e.key.toUpperCase() === "R") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, "right");
        }
    }
    else if (inAlign && e.altKey && e.key.toUpperCase() === "J") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        if (editor) {
            editor.dispatchCommand(lexicalLexical_js_1.FORMAT_ELEMENT_COMMAND, "justify");
        }
    }
    inHeading = false;
    inFormatText = false;
    inSize = false;
    inWeight = false;
    inAlign = false;
}
exports.handleHeadingKeyUp = handleHeadingKeyUp;
/* ------------------------------------------ Register Toolbar --------------------------------------- */
function registerToolbarListeners(editor) {
    var _a;
    const wrapper_id = editor._config.namespace;
    const wrapper = document.getElementById(wrapper_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    if (wrapper) {
        wrapper.addEventListener('keydown', handleHeadingKeyUp);
        const font_family_input = wrapper.querySelector('input[data-lexical-font-input]');
        const font_weight_input = wrapper.querySelector('input[data-lexical-font-weight-input]');
        const font_size_input = wrapper.querySelector('input[data-lexical-font-size-input]');
        const text_color_input = wrapper.querySelector('input[data-lexical-text-color]');
        const textColorTransparent = wrapper.querySelector('input[data-lexical-text-transparent]');
        const background_color_input = wrapper.querySelector('input[data-lexical-background-color]');
        const backgroundColorTransparent = wrapper.querySelector('input[data-lexical-background-transparent]');
        const insertParagraphButton = wrapper.querySelector('button[data-insert-paragraph-button]');
        if (font_family_input)
            font_family_input.addEventListener('change', getFontFamilyChange(editor));
        if (font_weight_input)
            font_weight_input.addEventListener('change', getFontWeightChange(editor));
        if (font_size_input)
            font_size_input.addEventListener('change', getFontSizeChange(editor));
        if (text_color_input && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            text_color_input.addEventListener('input', getTextColorChange(editor));
        if (background_color_input && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            background_color_input.addEventListener('input', getBackgroundColorChange(editor));
        if (insertParagraphButton)
            insertParagraphButton.addEventListener('click', getHandleInsertParagraphClick(editor));
        const dispatchCommandsButtons = Array.from(wrapper.querySelectorAll('button[data-dispatch]'));
        dispatchCommandsButtons.forEach(b => {
            const dispatch = b.getAttribute('data-dispatch');
            if (VALID_COMMANDS.has(dispatch)) {
                const dataMouseDown = b.getAttribute('data-mouse-down');
                if (dataMouseDown !== null) {
                    b.addEventListener('mousedown', dispatchLexicalCommand);
                    b.addEventListener('touchstart', dispatchLexicalCommand);
                }
                else {
                    b.addEventListener('click', dispatchLexicalCommand);
                }
            }
            else if (dispatch === "CLEAR_TEXT_FORMATTING") {
                b.addEventListener('click', getClearTextFormatting(editor));
            }
        });
        const downloadLexicalStateBtn = wrapper.querySelector('button[data-download-state]');
        if (downloadLexicalStateBtn)
            downloadLexicalStateBtn.addEventListener('click', downloadLexicalState);
        if (textColorTransparent)
            textColorTransparent.addEventListener('change', getHandleTextTransparentChange(editor));
        if (backgroundColorTransparent)
            backgroundColorTransparent.addEventListener('change', getHandleBackgroundTransparentChange(editor));
        wrapper.addEventListener('focusout', handleFocusOut);
        wrapper.addEventListener('focusin', handleFocusIn);
    }
}
function getOnViewDifferentSizesDialog(e) {
    if (e.detail.el.id === "view-content-lexical") {
        const dialog = document.getElementById('view-content-lexical');
        if (dialog) {
            const htmlEl = document.querySelector('html');
            const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
            if (dialog && editor && htmlEl) {
                const editorState = editor.getEditorState();
                const mobileEditor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()['example-mobile-view-lexical-editor'];
                const tabletEditor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()['example-tablet-view-lexical-editor'];
                const desktopEditor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()['example-desktop-view-lexical-editor'];
                if (mobileEditor && tabletEditor && desktopEditor) {
                    mobileEditor.setEditable(true);
                    const parseEditorState = mobileEditor.parseEditorState(editorState.toJSON());
                    mobileEditor.setEditorState(parseEditorState);
                    mobileEditor.setEditable(false);
                    tabletEditor.setEditable(true);
                    const parseEditorState2 = tabletEditor.parseEditorState(editorState.toJSON());
                    tabletEditor.setEditorState(parseEditorState2);
                    tabletEditor.setEditable(false);
                    desktopEditor.setEditable(true);
                    const parseEditorState3 = desktopEditor.parseEditorState(editorState.toJSON());
                    desktopEditor.setEditorState(parseEditorState3);
                    desktopEditor.setEditable(false);
                    htmlEl.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
                }
            }
        }
        document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
            detail: {
                dialog: dialog
            }
        }));
    }
}
function hideOpenPopovers() {
    Object.keys(autoUpdateObject).forEach(key => {
        try {
            autoUpdateObject[key]();
            delete autoUpdateObject[key];
            closeFloatingArticleMenu();
            closeFloatingContextMenu();
            closeAIWriterMenu();
        }
        catch (e) { }
    });
}
/**
 * This registersBlockStyleCustomization
 * This doesn't need to be called when the editor isn't going to be editable
 * Can cope with color and no color
 * @param editor
 * @returns
 */
function registerToolbarEditable(editor) {
    document.addEventListener('HIDE_OPEN_POPOVERS', hideOpenPopovers);
    setFloatingContextMenu();
    const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
    if (menu)
        menu.addEventListener('focusin', onFloatingContextMenuFocusIn);
    const floatingFormatTextMenu = document.getElementById(FLOATING_TEXT_MENU_ID);
    if (floatingFormatTextMenu) {
        floatingFormatTextMenu.addEventListener('click', stopPropagation);
        floatingFormatTextMenu.addEventListener('mousedown', stopPropagation);
        floatingFormatTextMenu.addEventListener('touchstart', stopPropagation);
        const buttons = Array.from(floatingFormatTextMenu.querySelectorAll('button[data-dispatch="FORMAT_TEXT_COMMAND"]'));
        buttons.forEach(b => {
            const dataMouseDown = b.getAttribute('data-mouse-down');
            if (dataMouseDown !== null) {
                b.addEventListener('mousedown', dispatchFormatTextCommand, true);
                b.addEventListener('touchstart', dispatchFormatTextCommand, true);
            }
            else {
                b.addEventListener('click', dispatchFormatTextCommand, true);
            }
        });
        const clearTextFormattingBtn = floatingFormatTextMenu.querySelector('button[data-dispatch="CLEAR_TEXT_FORMATTING"]');
        if (clearTextFormattingBtn)
            clearTextFormattingBtn.addEventListener('click', clearTextFormattingOnClick, true);
        const backgroundColorButtton = floatingFormatTextMenu.querySelector('#floating-bg-color-button');
        const backgroundColorInput = floatingFormatTextMenu.querySelector('#floating-bg-color-bg-color');
        const backgroundColorTransparent = floatingFormatTextMenu.querySelector('#floating-bg-color-transparent');
        const textColorButtton = floatingFormatTextMenu.querySelector('#floating-text-color-button');
        const textColorInput = floatingFormatTextMenu.querySelector('#floating-text-color-color');
        const textColorTransparent = floatingFormatTextMenu.querySelector('#floating-text-color-transparent');
        const rewriteWithAI = floatingFormatTextMenu.querySelector('button[data-dispatch="REWRITE_WITH_AI"]');
        if (rewriteWithAI)
            rewriteWithAI.addEventListener('click', onRewriteSelectionWidthAIClick);
        if (backgroundColorButtton && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            backgroundColorButtton.addEventListener('click', closeOtherColorPopover);
        if (backgroundColorInput && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            backgroundColorInput.addEventListener('input', floatingBackgroundColorChange);
        if (backgroundColorTransparent && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            backgroundColorTransparent.addEventListener('change', floatingBackgroundTransparentChange);
        if (textColorButtton && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            textColorButtton.addEventListener('click', closeOtherColorPopover);
        if (textColorInput && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            textColorInput.addEventListener('input', floatingTextColorChange);
        if (textColorTransparent && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor))
            textColorTransparent.addEventListener('change', floatingTextTransparentChange);
    }
    registerToolbarListeners(editor);
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenUploadFileDialog);
    document.addEventListener('OPEN_LEXICAL_DIALOG', lexical_sharedLexicalShared_js_1.handleOpenLexDialog);
    document.addEventListener('CLOSE_LEXICAL_DIALOG', lexical_sharedLexicalShared_js_1.handleCloseLexDialog);
    const arr = [editor.registerCommand(FONT_FAMILY_CHANGE, fontWithSemiColon => {
            var _a;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                fontFamilyChangeCallback(selection, fontWithSemiColon);
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
                if (wrapper)
                    wrapper.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(FONT_WEIGHT_CHANGE, weight => {
            var _a;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                fontWeightChangeCallback(selection, weight);
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
                if (wrapper)
                    wrapper.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(FONT_SIZE_CHANGE, size => {
            var _a;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                fontSizeChangeCallback(selection, size);
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
                if (wrapper)
                    wrapper.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.MAKE_TRANSPARENT, payload => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                makeTransparentCallback(selection, payload);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                editor.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_LOW), editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
            closeFloatingContextMenu(); // Close floating context menu on selection change command
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(UPDATE_TOOLBAR_COMMAND, () => {
            const ret = $updateToolbar(editor);
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && !!!selection.isCollapsed()) {
                editor.dispatchCommand(LAUNCH_SELECTION_MENU, ret);
            }
            else {
                closeFloatingContextMenu();
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_LOW), editor.registerCommand(LAUNCH_SELECTION_MENU, obj => {
            if (editor.isEditable()) {
                $updateFloatingMenu(obj, editor);
                const currentEditorID = (0, lexical_sharedLexicalShared_js_1.getCurrentEditorID)();
                const selection = (0, lexicalLexical_js_1.$getSelection)();
                if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.getNodes().length >= 1 && !!!selection.isCollapsed()) {
                    const selection = document.getSelection();
                    const root = editor.getRootElement();
                    if (root && selection && selection.rangeCount > 0 && currentEditorID === editor._config.namespace) {
                        const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                        if (getPortalEl()) {
                            getPortalEl().style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                            getPortalEl().style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                            if (obj && !!!obj.code.insideCode) {
                                openFloatingContextMenu(getPortalEl(), editor);
                            }
                            return true;
                        }
                    }
                }
            }
            closeFloatingContextMenu();
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.CLEAR_TEXT_FORMATTING, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection))
                clearTextFormattingCallback(selection);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), registerSpeechToText(editor), () => {
            var _a;
            const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
            if (wrapper)
                wrapper.removeEventListener('keydown', handleHeadingKeyUp);
        }, editor.registerCommand(lexicalLexical_js_1.BLUR_COMMAND, () => {
            var _a;
            const wrapper_id = editor._config.namespace;
            const wrapper = document.getElementById(wrapper_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
            if (wrapper) {
                const buttons = (0, lexical_sharedLexicalShared_js_1.getEditorButtons)(wrapper);
                Object.values(buttons).forEach(b => {
                    if (b && b.nodeName === "BUTTON") {
                        b.removeAttribute('disabled');
                    }
                });
            }
            handleFocusOut();
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(ASK_AI_COMMAND, ({ url, selection, context }) => {
            const root = (0, lexicalLexical_js_1.$getRoot)();
            if (root) {
                root.clear();
                const paragraphNode = (0, lexicalLexical_js_1.$createParagraphNode)();
                paragraphNode.append((0, lexicalLexical_js_1.$createTextNode)(`<CONTEXT>\n${context}\n</CONTEXT>\nBased on the provided context, what does the following mean: "${selection}"?`));
                const p2 = (0, lexicalLexical_js_1.$createParagraphNode)();
                p2.append((0, lexicalLexical_js_1.$createTextNode)("You can find out more about the context or selection by visiting: "));
                const l = (0, lexical_linkLexicalLink_js_1.$createLinkNode)(url);
                l.append((0, lexicalLexical_js_1.$createTextNode)("frankmbrown.net"));
                p2.append(l);
                root.append(paragraphNode, p2);
                root.selectEnd();
            }
            const dialog = document.getElementById('ai-chat-dialog');
            if (dialog)
                (0, lexical_sharedLexicalShared_js_1.openDialog)(dialog);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.REGISTER_TOOLBAR_LISTENERS, () => {
            registerToolbarListeners(editor);
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    if (editor.hasNode(lexical_decoratorsLexicalDecorators_js_1.AiChatNode)) {
        arr.push(editor.registerCommand(lexical_decoratorsLexicalDecorators_js_1.INSERT_AI_CHAT_NODE, obj => {
            const node = (0, lexical_decoratorsLexicalDecorators_js_1.$createAiChatNode)(obj);
            (0, lexicalLexical_js_1.$insertNodes)([node]);
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    }
    const wrapper = document.getElementById(editor._config.namespace);
    if (wrapper) {
        const viewSizesButton = wrapper.querySelector('button[data-lexical-view-sizes]');
        if (viewSizesButton) {
            document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnViewDifferentSizesDialog);
        }
    }
    if (!!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor)) {
        arr.push(editor.registerCommand(lexical_sharedLexicalShared_js_1.TEXT_COLOR_CHANGE, textColor => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor)) {
                textColorChangeCallback(selection, textColor);
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                editor.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexical_sharedLexicalShared_js_1.BACKGROUND_COLOR_CHANGE, backgroundColor => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && !!!(0, lexical_sharedLexicalShared_js_1.getNoColor)(editor)) {
                backgroundColorChangeCallback(selection, backgroundColor);
                (0, lexicalLexical_js_1.$setSelection)(selection);
                editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND, undefined);
                editor.focus();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), registerBlockStyleCustomization(editor));
    }
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerToolbarEditable = registerToolbarEditable;
function registerLoadUnloadToolbarEditable(editor) {
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(
    // editor.registerCommand(FOCUS_COMMAND,
    //   () => {
    //     console.log("Focus Command");
    //     const str = EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    //     if (EDITOR_ID_TO_TOOLBARS[editor._config.namespace]) {
    //       const wrapper = document.getElementById(editor._config.namespace);
    //        if (wrapper) {
    //         wrapper.insertAdjacentHTML("afterbegin",str);
    //         editor.dispatchCommand(REGISTER_TOOLBAR_LISTENERS,undefined);
    //         delete EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    //        }
    //     }
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL
    // ),
    // editor.registerCommand(BLUR_COMMAND,
    //   () => {
    //     const wrapper = document.getElementById(editor._config.namespace);
    //     if (wrapper) {
    //       var str = '';
    //       const children = wrapper.children;
    //       const children_to_remove:HTMLElement[] = [];
    //       for (let child of children) {
    //         if (child instanceof HTMLElement && child.getAttribute('role')==="toolbar") {
    //           str += child.outerHTML;
    //           children_to_remove.push(child);
    //         } else if (child instanceof HTMLElement && child.hasAttribute('data-rich-text-editor')) {
    //           break;
    //         }
    //       }
    //       children_to_remove.forEach((child) => child.remove());
    //       EDITOR_ID_TO_TOOLBARS[editor._config.namespace] = str;
    //     }
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL
    // ),
    // () => {
    //   delete EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    // },
    () => { });
}
exports.registerLoadUnloadToolbarEditable = registerLoadUnloadToolbarEditable;
function registerNoToolbar(editor) {
    var _a;
    const wrapper_id = editor._config.namespace;
    const wrapper = document.getElementById(wrapper_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    if (wrapper) {
        wrapper.addEventListener('focusin', closeFloatingContextMenu);
    }
    return () => {
        var _a;
        const wrapper_id = editor._config.namespace;
        const wrapper = document.getElementById(wrapper_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
        if (wrapper)
            wrapper.removeEventListener('focusin', closeFloatingContextMenu);
    };
}
exports.registerNoToolbar = registerNoToolbar;
function getOnDocumentClickArticle(e) {
    if (!!!e._lexicalHandled) {
        closeFloatingArticleMenu();
    }
}
exports.getOnDocumentClickArticle = getOnDocumentClickArticle;
function onCommentArticle(_) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor)
        editor.dispatchCommand(ADD_COMMENT_ARTICLE_COMMAND, undefined);
}
exports.onCommentArticle = onCommentArticle;
function onAnnotateArticle(_) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor) {
        editor.dispatchCommand(ADD_ANNOTATE_ARTICLE_COMMAND, undefined);
    }
}
exports.onAnnotateArticle = onAnnotateArticle;
function onShareArticle(_) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor)
        editor.dispatchCommand(COPY_LINK_SELECTION, undefined);
}
exports.onShareArticle = onShareArticle;
function shareFacebook() {
    if (SHARE_ARTICLE_STATE["facebook"]) {
        const a = document.createElement('a');
        a.target = "_blank";
        a.href = `https://www.facebook.com/share.php?u=${encodeURI(SHARE_ARTICLE_STATE["facebook"].payload)}`;
        a.target = "_blank";
        a.click();
    }
}
function shareTwitter() {
    if (SHARE_ARTICLE_STATE["x"]) {
        const a = document.createElement('a');
        a.target = "_blank";
        a.href = `http://twitter.com/share?&url=${SHARE_ARTICLE_STATE["x"].payload.url}&text=${SHARE_ARTICLE_STATE["x"].payload.text}`;
        a.click();
    }
}
function shareReddit() {
    if (SHARE_ARTICLE_STATE["reddit"]) {
        const a = document.createElement('a');
        a.target = "_blank";
        a.href = `http://www.reddit.com/submit?url=${SHARE_ARTICLE_STATE["reddit"].payload.url}&title=${SHARE_ARTICLE_STATE["reddit"].payload.title}&type=LINK`;
        a.click();
    }
}
function shareLinkedin() {
    if (SHARE_ARTICLE_STATE["linkedin"]) {
        const a = document.createElement('a');
        a.target = "_blank";
        a.href = `https://www.linkedin.com/sharing/share-offsite/?url=${SHARE_ARTICLE_STATE["linkedin"].payload}`;
        a.target = "_blank";
        a.click();
    }
}
function shareEmail() {
    if (SHARE_ARTICLE_STATE["email"]) {
        const a = document.createElement('a');
        a.target = "_blank";
        const mailtoLink = `mailto:?subject=${encodeURIComponent(SHARE_ARTICLE_STATE["email"].payload.subject)}&body=${encodeURIComponent(SHARE_ARTICLE_STATE["email"].payload.body)}`;
        a.href = mailtoLink;
        a.click();
    }
}
function shareLink() {
    if (SHARE_ARTICLE_STATE["link"]) {
        navigator.clipboard.writeText(SHARE_ARTICLE_STATE["link"].payload).then(() => {
            var _a;
            if (((_a = SHARE_ARTICLE_STATE["link"]) === null || _a === void 0 ? void 0 : _a.type) === "article")
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: 'success',
                        message: "Copied link to article selection to clipboard!"
                    }
                }));
            else
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: 'success',
                        message: "Copied link to comment to clipboard!"
                    }
                }));
        }).catch(e => {
            var _a;
            console.error(e);
            if (((_a = SHARE_ARTICLE_STATE["link"]) === null || _a === void 0 ? void 0 : _a.type) === "article")
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: 'error',
                        message: "Failed to copy link to selection to clipbaord!"
                    }
                }));
            else
                document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                    detail: {
                        severity: 'error',
                        message: "Failed to copy link to comment to clipbaord!"
                    }
                }));
        });
    }
}
function onPinterestClick() {
    if (SHARE_ARTICLE_STATE['pinterest']) {
        const { url, image, title } = SHARE_ARTICLE_STATE['pinterest'].payload;
        const a = document.createElement('a');
        a.href = `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onWhatsAppClick() {
    if (SHARE_ARTICLE_STATE['whats-app']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['whats-app'].payload;
        a.href = `https://api.whatsapp.com/send?text=${title} ${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onTelegramClick() {
    if (SHARE_ARTICLE_STATE['telegram']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['telegram'].payload;
        a.href = `https://telegram.me/share/url?url=${url}&text=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onTumblrClick() {
    if (SHARE_ARTICLE_STATE['tumblr']) {
        const a = document.createElement('a');
        const { url, title, description } = SHARE_ARTICLE_STATE['tumblr'].payload;
        a.href = `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}&caption=${description}`;
        a.target = "_blank";
        a.click();
    }
}
function onPocketClick() {
    if (SHARE_ARTICLE_STATE['pocket']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['pocket'].payload;
        a.href = `https://getpocket.com/save?url=${url}&title=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onBufferClick() {
    if (SHARE_ARTICLE_STATE['buffer']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['buffer'].payload;
        a.href = `https://buffer.com/add?text=${title}&url=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onDiggClick() {
    if (SHARE_ARTICLE_STATE['digg']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['digg'].payload;
        a.href = `https://digg.com/submit?url=${url}&title=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onMixClick() {
    if (SHARE_ARTICLE_STATE['mix']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['mix'].payload;
        a.href = `https://mix.com/add?url=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onVKontakteClick() {
    if (SHARE_ARTICLE_STATE['vkonate']) {
        const a = document.createElement('a');
        const { url, title, description, image } = SHARE_ARTICLE_STATE['vkonate'].payload;
        a.href = `https://vk.com/share.php?url=${url}&title=${title}&description=${description}&image=${image}&noparse=true`;
        a.target = "_blank";
        a.click();
    }
}
function onXINGClick() {
    if (SHARE_ARTICLE_STATE['xing']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['xing'].payload;
        a.href = `https://www.xing.com/spi/shares/new?url=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onEvernoteClick() {
    if (SHARE_ARTICLE_STATE['evernote']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['evernote'].payload;
        a.href = `https://www.evernote.com/clip.action?url=${url}&title=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onHackerClick() {
    if (SHARE_ARTICLE_STATE['hacker']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['hacker'].payload;
        a.href = `https://news.ycombinator.com/submitlink?u=${url}&t=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onFlipboardClick() {
    if (SHARE_ARTICLE_STATE['flipboard']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['flipboard'].payload;
        a.href = `https://share.flipboard.com/bookmarklet/popout?url=${url}&title=${title}`;
        a.target = "_blank";
        a.click();
    }
}
function onMeneameClick() {
    if (SHARE_ARTICLE_STATE['mename']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['mename'].payload;
        a.href = `https://www.meneame.net/submit.php?url=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onBloggerClick() {
    if (SHARE_ARTICLE_STATE['blogger']) {
        const a = document.createElement('a');
        const { url, title, description } = SHARE_ARTICLE_STATE['blogger'].payload;
        a.href = `https://www.blogger.com/blog-this.g?u=${url}&n=${title}&t=${description}`;
        a.target = "_blank";
        a.click();
    }
}
function onOdnoklassnikiClick() {
    if (SHARE_ARTICLE_STATE['odnoklassiniki']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['odnoklassiniki'].payload;
        a.href = `https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onYahooClick() {
    if (SHARE_ARTICLE_STATE['yahoo']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['yahoo'].payload;
        a.href = `http://compose.mail.yahoo.com/?body=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onGoogleClick() {
    if (SHARE_ARTICLE_STATE['google']) {
        const a = document.createElement('a');
        const { url, title, description } = SHARE_ARTICLE_STATE['google'].payload;
        a.href = `https://www.google.com/bookmarks/mark?op=add&bkmk=${url}&title=${title}&annotation=${description}`;
        a.target = "_blank";
        a.click();
    }
}
function onLineClick() {
    if (SHARE_ARTICLE_STATE['line']) {
        const a = document.createElement('a');
        const url = SHARE_ARTICLE_STATE['line'].payload;
        a.href = `https://social-plugins.line.me/lineit/share?url=${url}`;
        a.target = "_blank";
        a.click();
    }
}
function onRenrenClick() {
    if (SHARE_ARTICLE_STATE['renren']) {
        const a = document.createElement('a');
        const { url, title, description } = SHARE_ARTICLE_STATE['renren'].payload;
        a.href = `http://widget.renren.com/dialog/share?resourceUrl=${url}&srcUrl=${url}&title=${title}&description=${description}`;
        a.target = "_blank";
        a.click();
    }
}
function onWeiboClick() {
    if (SHARE_ARTICLE_STATE['weibo']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['weibo'].payload;
        a.href = `http://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=&appkey=`;
        a.target = "_blank";
        a.click();
    }
}
function onBaiduClick() {
    if (SHARE_ARTICLE_STATE['baidu']) {
        const a = document.createElement('a');
        const { url, title } = SHARE_ARTICLE_STATE['baidu'].payload;
        a.href = `http://cang.baidu.com/do/add?it=${title}&iu=${url}&fr=ien#nw=1`;
        a.target = "_blank";
        a.click();
    }
}
function setShareArticleSelection(_) {
    const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (editor && editor._rootElement) {
        const el = editor._rootElement;
        editor.getEditorState().read(() => {
            var _a, _b;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                const text_selection = selection.getTextContent();
                const title = document.title;
                const description = (_a = document.getElementById('PAGE_DESCRIPTION')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
                var twitter_text = title;
                if (description)
                    twitter_text += "\n" + description;
                twitter_text += "\n" + text_selection;
                const { start, end, content } = saveSelection(el);
                const editorNamespace = editor._config.namespace;
                var url = window.location.href;
                url = url.concat(`?scroll_to_node=true&namespace=${encodeURIComponent(editorNamespace)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&content=${encodeURIComponent(content)}`);
                const image = ((_b = document.getElementById('META_OG_IMAGE')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) || '';
                var email_body = url + "\n" + (description ? "\n" + description : "") + "\n" + text_selection;
                SHARE_ARTICLE_STATE.facebook = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE.x = {
                    type: "article",
                    payload: {
                        url,
                        text: twitter_text
                    }
                };
                SHARE_ARTICLE_STATE.reddit = {
                    type: "article",
                    payload: {
                        url,
                        title: title
                    }
                };
                SHARE_ARTICLE_STATE.linkedin = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE.email = {
                    type: "article",
                    payload: {
                        subject: title,
                        body: email_body
                    }
                };
                SHARE_ARTICLE_STATE.link = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["pinterest"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        image
                    }
                };
                SHARE_ARTICLE_STATE["whats-app"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        image
                    }
                };
                SHARE_ARTICLE_STATE["telegram"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["tumblr"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        description: description || ''
                    }
                };
                SHARE_ARTICLE_STATE["pocket"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["buffer"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["digg"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["mix"] = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["vkonate"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        description: description || '',
                        image
                    }
                };
                SHARE_ARTICLE_STATE["xing"] = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["evernote"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["hacker"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["flipboard"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["mename"] = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["blogger"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        description: description || ''
                    }
                };
                SHARE_ARTICLE_STATE["odnoklassiniki"] = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["yahoo"] = {
                    type: "article",
                    payload: url
                };
                SHARE_ARTICLE_STATE["google"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        description: description || ''
                    }
                };
                SHARE_ARTICLE_STATE["renren"] = {
                    type: "article",
                    payload: {
                        url,
                        title,
                        description: description || ''
                    }
                };
                SHARE_ARTICLE_STATE["weibo"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["baidu"] = {
                    type: "article",
                    payload: {
                        url,
                        title
                    }
                };
                SHARE_ARTICLE_STATE["line"] = {
                    type: "article",
                    payload: url
                };
            }
        });
    }
}
exports.setShareArticleSelection = setShareArticleSelection;
function onAskAiSelection() {
    const currentEditor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
    if (currentEditor) {
        currentEditor.getEditorState().read(() => {
            const Url = new URL(window.location.href);
            Url.hash = currentEditor._config.namespace;
            const url = Url.href;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                const textContent = selection.getTextContent();
                var context = '';
                const blockNodes = selection.getNodes();
                var firstBlock = undefined;
                for (let node of blockNodes) {
                    const closestBlock = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(node, n => (0, lexicalLexical_js_1.$isRootNode)(n.getParent()));
                    if (closestBlock) {
                        firstBlock = closestBlock;
                        break;
                    }
                }
                if (firstBlock) {
                    var curr = firstBlock;
                    while (curr && context.length < 1000) {
                        context = curr.getTextContent() + context;
                        curr = curr.getPreviousSibling();
                    }
                }
                const editor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()['ai-chat-editor'];
                if (editor) {
                    closeFloatingArticleMenu();
                    editor.dispatchCommand(ASK_AI_COMMAND, {
                        url,
                        selection: textContent,
                        context
                    });
                }
            }
        });
    }
}
exports.onAskAiSelection = onAskAiSelection;
// restore the selection specified by the given state and reference node, and
// return the new selection object
function getRange(state, referenceNode) {
    referenceNode = referenceNode || document.body;
    const textNodes = [];
    var i, node, nextNodeCharIndex, currentNodeCharIndex = 0, nodes = [referenceNode], range = document.createRange();
    //@ts-ignore
    range.setStart(referenceNode, 0);
    range.collapse(true);
    var started = false;
    var ended = false;
    while (node = nodes.pop()) {
        if (node.nodeType === 3) {
            // TEXT_NODE
            //@ts-ignore
            nextNodeCharIndex = currentNodeCharIndex + node.length;
            // if this node contains the character at the start index, set this as the
            // starting node with the correct offset
            if (state.start >= currentNodeCharIndex && state.start <= nextNodeCharIndex) {
                range.setStart(node, state.start - currentNodeCharIndex);
                textNodes.push({
                    node: node,
                    start: state.start - currentNodeCharIndex
                });
                started = true;
            }
            // if this node contains the character at the end index, set this as the
            // ending node with the correct offset and stop looking
            if (state.end >= currentNodeCharIndex && state.end <= nextNodeCharIndex) {
                range.setEnd(node, state.end - currentNodeCharIndex);
                textNodes.push({
                    node: node,
                    end: state.end - currentNodeCharIndex
                });
                ended = true;
                break;
            }
            if (started && !!!ended) {
                textNodes.push({
                    node: node
                });
            }
            currentNodeCharIndex = nextNodeCharIndex;
        }
        else {
            // get child nodes if the current node is not a text node
            i = node.childNodes.length;
            while (i--) {
                nodes.push(node.childNodes[i]);
            }
        }
    }
    return {
        range,
        nodes: textNodes
    };
}
// serialize the current selection offsets using given node as a reference point
function saveSelection(referenceNode) {
    referenceNode = referenceNode || document.body;
    var sel = window.getSelection(), range = (sel === null || sel === void 0 ? void 0 : sel.rangeCount) ? sel.getRangeAt(0).cloneRange() : document.createRange(), startContainer = range.startContainer, startOffset = range.startOffset, state = {
        content: range.toString()
    };
    // move the range to select the contents up to the selection
    // so we can find its character offset from the reference node
    range.selectNodeContents(referenceNode);
    range.setEnd(startContainer, startOffset);
    state.start = range.toString().length;
    state.end = state.start + state.content.length;
    return state;
}
function registerCommentArticleNotEditable(editor, annotationOnly) {
    document.addEventListener('HIDE_OPEN_POPOVERS', hideOpenPopovers);
    addSocialMediaListerrs();
    const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
    if (menu) {
        menu.addEventListener('click', stopPropagation);
        document.addEventListener('click', getOnDocumentClickArticle);
        const commentArticleCommand = menu.querySelector('button[data-dispatch="COMMENT_ARTICLE_COMMAND"]');
        const annotateArticleCommand = menu.querySelector('button[data-dispatch="ANNOTATE_ARTICLE_COMMAND"]');
        const linkArticleCommand = menu.querySelector('button[data-dispatch="COPY_LINK_SELECTION"]');
        const askAiSelection = menu.querySelector('button[data-dispatch="ASK_AI_SELECTION"]');
        const shareLexSelectionButton = menu.querySelector('#share-lex-selection-button');
        if (commentArticleCommand)
            commentArticleCommand.addEventListener('click', onCommentArticle);
        if (annotateArticleCommand)
            annotateArticleCommand.addEventListener('click', onAnnotateArticle);
        if (linkArticleCommand)
            linkArticleCommand.addEventListener('click', onShareArticle);
        if (shareLexSelectionButton) {
            if ((0, lexical_sharedLexicalShared_js_1.isTouchDevice)())
                shareLexSelectionButton.addEventListener('touchstart', setShareArticleSelection);
            else
                shareLexSelectionButton.addEventListener('mousedown', setShareArticleSelection);
        }
        if (askAiSelection)
            askAiSelection.addEventListener('click', onAskAiSelection);
    }
    const arr = [editor.registerCommand(lexicalLexical_js_1.SELECTION_CHANGE_COMMAND, () => {
            closeFloatingArticleMenu(); // Close floating context menu on selection change command
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && selection.getNodes().length >= 1 && !!!selection.isCollapsed()) {
                const selection = document.getSelection();
                const root = editor.getRootElement();
                if (root && selection && selection.rangeCount > 0 && (0, lexical_sharedLexicalShared_js_1.getCurrentEditorID)() === editor._config.namespace) {
                    const rect = (0, lexical_sharedLexicalShared_js_1.getDOMRangeRectAbsolute)(selection, root);
                    if (getPortalEl()) {
                        getPortalEl().style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                        getPortalEl().style.left = ((rect.left + rect.right) / 2).toString().concat('px');
                        closeFloatingContextMenu();
                        openFloatingArticleMenu(getPortalEl(), editor, editor._config.namespace, annotationOnly);
                        return true;
                    }
                }
            }
            closeFloatingArticleMenu();
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(lexicalLexical_js_1.CLICK_COMMAND, e => {
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if (!!!(0, lexicalLexical_js_1.$isRangeSelection)(selection) || selection.getNodes().length < 1 || selection.isCollapsed()) {
                closeFloatingArticleMenu();
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), function () {
            document.removeEventListener('click', closeFloatingArticleMenu);
        }, editor.registerCommand(ADD_ANNOTATE_ARTICLE_COMMAND, () => {
            const editorHTMLElement = editor._rootElement;
            const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && editorHTMLElement) {
                const editorWrapper = editorHTMLElement.classList.contains('lexical-wrapper') ? editorHTMLElement : editorHTMLElement.closest('div.lexical-wrapper');
                const annotationEditor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()['annotate-editor'];
                if (annotationEditor && annotationEditor.isEditable() && editorWrapper) {
                    const id = editorWrapper.id;
                    const annotation_root_element = document.getElementById('annotate-editor');
                    if (annotation_root_element) {
                        const annotation_form = annotation_root_element.closest('form');
                        if (annotation_form) {
                            const annotation_start = document.getElementById('annotation-start');
                            const annotation_end = document.getElementById('annotation-end');
                            const annotation_content = document.getElementById('annotation-content');
                            const annotation_refernce_id = document.getElementById('annotation-reference-id');
                            const selectionToSave = saveSelection(editorHTMLElement);
                            if (annotation_start && annotation_end && annotation_content && annotation_refernce_id && id.startsWith('id_') && selectionToSave.content.length >= 1 && Number.isInteger(selectionToSave.start) && Number.isInteger(selectionToSave.end)) {
                                annotation_start.value = String(selectionToSave.start);
                                annotation_end.value = String(selectionToSave.end);
                                annotation_content.value = String(selectionToSave.content);
                                annotation_refernce_id.value = String(id.slice(3));
                                closeFloatingArticleMenu();
                                annotationEditor.dispatchCommand(RECEIVE_ANNOTATE_ARTICLE_COMMAND, undefined);
                            }
                        }
                    }
                }
                else if (!!!annotationEditor || !!!annotationEditor.isEditable()) {
                    document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
                        detail: {
                            severity: "error",
                            message: "You must be logged in to add an annotation to the article."
                        }
                    }));
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(COPY_LINK_SELECTION, () => {
            const rootElement = editor._rootElement;
            const selection = (0, lexicalLexical_js_1.$getSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection) && rootElement) {
                const selection = saveSelection(rootElement);
                var str = window.location.href;
                str = str.concat(`?scroll_to_node=true&namespace=${encodeURIComponent(editor._config.namespace)}&start=${encodeURIComponent(selection.start)}&end=${encodeURIComponent(selection.end)}&content=${encodeURIComponent(selection.content)}`);
                navigator.clipboard.writeText(str).then(() => {
                    closeFloatingArticleMenu();
                    document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                        detail: {
                            severity: "success",
                            message: "Successfully copied link URL to clipboard!"
                        }
                    }));
                }).catch(e => {
                    console.error(e);
                    document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR', {
                        detail: {
                            severity: "error",
                            message: "Something went wrong copying the link URL to the clipboard."
                        }
                    }));
                });
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR), editor.registerCommand(SCROLL_TO_NODE, obj => {
            const rootElement = editor._rootElement;
            if (rootElement) {
                const { range, nodes } = getRange(obj, rootElement);
                if (nodes.length) {
                    const parentElement = nodes[0].node.parentElement;
                    if (parentElement)
                        parentElement.scrollIntoView();
                    const highlight = new Highlight(range);
                    highlight.type = "highlight";
                    CSS.highlights.set('temp-highlight', highlight);
                    setTimeout(() => {
                        CSS.highlights.delete('temp-highlight');
                    }, 4000);
                }
                return true;
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    if (!!!annotationOnly) {
        arr.push(editor.registerCommand(ADD_COMMENT_ARTICLE_COMMAND, () => {
            const selection = (0, lexicalLexical_js_1.$getSelection)() || (0, lexicalLexical_js_1.$getPreviousSelection)();
            if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
                const eventData = (0, lexical_clipboardLexicalClipboard_js_1.$getLexicalContent)(editor);
                const editorInstances = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)();
                if (editorInstances["comment-editor"] && editorInstances["comment-editor"].isEditable() && eventData) {
                    closeFloatingArticleMenu();
                    const hideShowSection = document.getElementById('hide-comment-hide-show');
                    if (hideShowSection && hideShowSection.hasAttribute('hidden'))
                        hideShowSection.removeAttribute('hidden');
                    editorInstances["comment-editor"].dispatchCommand(RECEIVE_COMMENT_ARTICLE_COMMAND, eventData);
                }
                else if (!!!editorInstances["comment-editor"] || !!!editorInstances["comment-editor"].isEditable()) {
                    document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
                        detail: {
                            severity: "error",
                            message: "You must be logged in to add a comment to the article."
                        }
                    }));
                }
            }
            return false;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    }
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerCommentArticleNotEditable = registerCommentArticleNotEditable;
// This is on the backend as well
const STRING_TO_NODE = {
    "ImageNode": lexical_decoratorsLexicalDecorators_js_1.ImageNode,
    "AudioNode": lexical_decoratorsLexicalDecorators_js_1.AudioNode,
    "VideoNode": lexical_decoratorsLexicalDecorators_js_1.VideoNode,
    "YouTubeNode": lexical_decoratorsLexicalDecorators_js_1.YouTubeNode,
    "NewsNode": lexical_decoratorsLexicalDecorators_js_1.NewsNode,
    "TwitterNode": lexical_decoratorsLexicalDecorators_js_1.TwitterNode,
    "TikTokNode": lexical_decoratorsLexicalDecorators_js_1.TikTokNode,
    "InstagramNode": lexical_decoratorsLexicalDecorators_js_1.InstagramNode,
    "HTMLNode": lexical_decoratorsLexicalDecorators_js_1.HtmlNode,
    "TableNode": lexical_tableLexicalTable_js_1.TableNode,
    "MathNode": lexical_mathLexicalMath_js_1.MathNode
};
const STRING_TO_NODE_STRING = {
    "ImageNode": "Image",
    "AudioNode": "Audio Element",
    "VideoNode": "Video Element",
    "YouTubeNode": "YouTube Video",
    "NewsNode": "News Link",
    "TwitterNode": "Twitter Embed",
    "TikTokNode": "TikTok Embed",
    "InstagramNode": "Instagram Embed",
    "HTMLNode": "HTML node",
    "TableNode": "Table",
    "MathNode": "Block Math node"
};
const DEFAULT_NODE_RESTRICTION = [{
        "count": 1,
        "nodes": ["ImageNode", "AudioNode", "VideoNode", "YouTubeNode", "NewsNode", "TwitterNode", "TikTokNode", "InstagramNode"]
    }, {
        "count": 1,
        "nodes": ["HTMLNode", "TableNode", "MathNode"]
    }];
const EDITOR_TO_NODE_RESTRICTION_STATE = {};
/**
 * Dispatch error snackbar on error message violation
 * @param error
 */
function onNodeRestrictionViolation(error) {
    document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR", {
        detail: {
            severity: "error",
            message: error
        }
    }));
}
function getMutationCallback(editor, editor_id, count, nodeArray) {
    const callback = mutations => {
        for (const [key, type] of mutations) {
            if (type !== 'updated') {
                editor.update(() => {
                    const nodesOfTypeArray = [];
                    for (let nodeType of nodeArray) {
                        const NodeClass = STRING_TO_NODE[nodeType];
                        if (nodeType === "MathNode") {
                            /* @ts-ignore */
                            nodesOfTypeArray.push(...(0, lexicalLexical_js_1.$nodesOfType)(NodeClass).filter(node => !!!node.isInline()));
                        }
                        else {
                            /* @ts-ignore */
                            nodesOfTypeArray.push(...(0, lexicalLexical_js_1.$nodesOfType)(NodeClass));
                        }
                    }
                    if (nodesOfTypeArray.length > count) {
                        var strArr = nodeArray.map(s => STRING_TO_NODE_STRING[s]).slice(0, nodeArray.length - 1).join(', ');
                        strArr += ", or " + STRING_TO_NODE_STRING[nodeArray[nodeArray.length - 1]];
                        const sortedNodesOfTypeArray = nodesOfTypeArray.sort((a, b) => parseInt(b.getKey()) - parseInt(a.getKey()));
                        var toDelete = nodesOfTypeArray.length - count;
                        while (toDelete > 0) {
                            sortedNodesOfTypeArray[toDelete].remove();
                            toDelete -= 1;
                        }
                        onNodeRestrictionViolation(`Only ${count} of ${strArr} nodes are allowed in the comments.`);
                    }
                    else if (nodesOfTypeArray.length === count) {
                        nodeArray.forEach(s => {
                            EDITOR_TO_NODE_RESTRICTION_STATE[editor_id][s] = true;
                        });
                    }
                    else {
                        nodeArray.forEach(s => {
                            EDITOR_TO_NODE_RESTRICTION_STATE[editor_id][s] = false;
                        });
                    }
                });
            }
        }
    };
    return callback;
}
/**
 * Testing out how to restrict the amount of certain nodes that can be inserted into the editor
 * Should be an array with each object in the array looking like:
 *
 * ```json
 * {
 *  "count": "number",
 *  "nodes": "string[]"
 * }
 * ```
 *
 * where `count` is the number of nodes of the types specified in `nodes` the editor is allowed to contain. Each string in `nodes` corresponds to a key in the object `STRING_TO_NODE`. We register a mutation listener to check for the creation and dleetion of these nodes so that we can prevent creation **AND** update the toolbar as necessary.
 *
 * @param editor
 * @returns
 */
function registerCommentEditable(editor, nodeRestrictions = DEFAULT_NODE_RESTRICTION) {
    const arr = [editor.registerCommand(RECEIVE_COMMENT_ARTICLE_COMMAND, serializedTextNodes => {
            const blockquote = (0, lexical_rich_textLexicalRichText_js_1.$createQuoteNode)();
            const parsed = JSON.parse(serializedTextNodes);
            const parsedNodes = parsed.nodes;
            const nodes = (0, lexical_clipboardLexicalClipboard_js_1.$generateNodesFromSerializedNodes)(parsedNodes);
            blockquote.append(...nodes);
            const rootNode = (0, lexicalLexical_js_1.$getRoot)();
            if (rootNode && editor.isEditable())
                rootNode.append(blockquote);
            if (editor._rootElement) {
                editor._rootElement.scrollIntoView();
                editor.focus();
            }
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    const editor_id = editor._config.namespace;
    EDITOR_TO_NODE_RESTRICTION_STATE[editor_id] = {
        "ImageNode": false,
        "AudioNode": false,
        "VideoNode": false,
        "YouTubeNode": false,
        "NewsNode": false,
        "TwitterNode": false,
        "TikTokNode": false,
        "InstagramNode": false,
        "HTMLNode": false,
        "TableNode": false,
        "MathNode": false
    };
    for (let i = 0; i < nodeRestrictions.length; i++) {
        const nodeArray = nodeRestrictions[i].nodes;
        const count = nodeRestrictions[i].count;
        for (let j = 0; j < nodeArray.length; j++) {
            const nodeTypeString = nodeArray[j];
            const NodeClass = STRING_TO_NODE[nodeTypeString];
            if (editor.hasNode(NodeClass))
                arr.push(editor.registerMutationListener(NodeClass, getMutationCallback(editor, editor_id, count, nodeArray)));
        }
    }
    arr.push(editor.registerCommand(UPDATE_TOOLBAR_COMMAND, () => {
        var _a;
        const wrapper = document.getElementById(editor_id) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
        if (wrapper) {
            const { imageButton, gifButton, audioButton, videoButton, embedNews, embedYoutube, embedX, embedTikTok, embedInstagram, embedReddit, embedMediaButton, codeButton, codeBlockButton, mathButton, tableButton, htmlButton } = (0, lexical_sharedLexicalShared_js_1.getEditorButtons)(wrapper);
            const state = EDITOR_TO_NODE_RESTRICTION_STATE[editor_id];
            Object.entries(state).forEach(([key, shouldDisable]) => {
                switch (key) {
                    case "ImageNode":
                        {
                            if (shouldDisable && imageButton && !!!imageButton.hasAttribute('diabled'))
                                imageButton.setAttribute('disabled', '');
                            if (shouldDisable && gifButton && !!!gifButton.hasAttribute('diabled'))
                                gifButton.setAttribute('disabled', '');
                            break;
                        }
                    case "AudioNode":
                        {
                            if (shouldDisable && audioButton && !!!audioButton.hasAttribute('diabled'))
                                audioButton.setAttribute('disabled', '');
                            break;
                        }
                    case "VideoNode":
                        {
                            if (shouldDisable && videoButton && !!!videoButton.hasAttribute('diabled'))
                                videoButton.setAttribute('disabled', '');
                            break;
                        }
                    case "YouTubeNode":
                        {
                            if (shouldDisable && embedYoutube && !!!embedYoutube.hasAttribute('diabled'))
                                embedYoutube.setAttribute('disabled', '');
                            break;
                        }
                    case "NewsNode":
                        {
                            if (shouldDisable && embedNews && !!!embedNews.hasAttribute('diabled'))
                                embedNews.setAttribute('disabled', '');
                            break;
                        }
                    case "TwitterNode":
                        {
                            if (shouldDisable && embedX && !!!embedX.hasAttribute('diabled'))
                                embedX.setAttribute('disabled', '');
                            break;
                        }
                    case "TikTokNode":
                        {
                            if (shouldDisable && embedTikTok && !!!embedTikTok.hasAttribute('diabled'))
                                embedTikTok.setAttribute('disabled', '');
                            break;
                        }
                    case "InstagramNode":
                        {
                            if (shouldDisable && embedInstagram && !!!embedInstagram.hasAttribute('diabled'))
                                embedInstagram.setAttribute('disabled', '');
                            break;
                        }
                    case "HTMLNode":
                        {
                            if (shouldDisable && htmlButton && !!!htmlButton.hasAttribute('diabled'))
                                htmlButton.setAttribute('disabled', '');
                            break;
                        }
                    case "TableNode":
                        {
                            if (shouldDisable && tableButton && !!!tableButton.hasAttribute('diabled'))
                                tableButton.setAttribute('disabled', '');
                            break;
                        }
                    case "MathNode":
                        {
                            if (shouldDisable && mathButton && !!!mathButton.hasAttribute('diabled'))
                                mathButton.setAttribute('disabled', '');
                            break;
                        }
                }
            });
        }
        return false;
    }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR));
    arr.push(() => {
        delete EDITOR_TO_NODE_RESTRICTION_STATE[editor_id];
    });
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerCommentEditable = registerCommentEditable;
function registerAnnotationEditable(editor) {
    const arr = [editor.registerCommand(RECEIVE_ANNOTATE_ARTICLE_COMMAND, annotation => {
            const rightSidebar = document.getElementById('notification-sidebar');
            if (rightSidebar && rightSidebar.classList.contains('drawer') && rightSidebar.getAttribute('aria-hidden') === "true") {
                rightSidebar.setAttribute('aria-hidden', 'false');
            }
            const annotationForm = document.getElementById('add-annotation-form');
            const hideShowButton = document.getElementById('hide-show-annotation-form');
            if (annotationForm && annotationForm.hasAttribute('hidden') && hideShowButton) {
                hideShowButton.click();
            }
            editor.focus();
            return true;
        }, lexicalLexical_js_1.COMMAND_PRIORITY_EDITOR)];
    if (editor.hasNode(AnnotationNode)) {
        arr.push(editor.registerMutationListener(AnnotationNode, mutations => {
            editor.update(() => {
                for (const [key, type] of mutations) {
                    if (type === 'created') {
                        const nodes = (0, lexicalLexical_js_1.$nodesOfType)(AnnotationNode);
                        for (let i = 0; i < nodes.length; i++) {
                            nodes[i].remove();
                        }
                    }
                }
            });
        }));
    }
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(...arr);
}
exports.registerAnnotationEditable = registerAnnotationEditable;
function addSocialMediaListerrs() {
    const facebook = document.getElementById('share-facebook-button-lex-menu');
    if (facebook)
        facebook.addEventListener('click', shareFacebook);
    const x = document.getElementById('share-x-button-lex-menu');
    if (x)
        x.addEventListener('click', shareTwitter);
    const reddit = document.getElementById('share-reddit-button-lex-menu');
    if (reddit)
        reddit.addEventListener('click', shareReddit);
    const linkedin = document.getElementById('share-linkedin-button-lex-menu');
    if (linkedin)
        linkedin.addEventListener('click', shareLinkedin);
    const email = document.getElementById('share-email-button-lex-menu');
    if (email)
        email.addEventListener('click', shareEmail);
    const link = document.getElementById('copy-link-button-lex-menu');
    if (link)
        link.addEventListener('click', shareLink);
    const pinterest = document.getElementById('share-pinterest-button-lex-menu');
    if (pinterest)
        pinterest.addEventListener('click', onPinterestClick);
    const WhatsApp = document.getElementById('share-WhatsApp-button-lex-menu');
    if (WhatsApp)
        WhatsApp.addEventListener('click', onWhatsAppClick);
    const Telegram = document.getElementById('share-Telegram-button-lex-menu');
    if (Telegram)
        Telegram.addEventListener('click', onTelegramClick);
    const Tumblr = document.getElementById('share-Tumblr-button-lex-menu');
    if (Tumblr)
        Tumblr.addEventListener('click', onTumblrClick);
    const Pocket = document.getElementById('share-Pocket-button-lex-menu');
    if (Pocket)
        Pocket.addEventListener('click', onPocketClick);
    const Buffer = document.getElementById('share-Buffer-button-lex-menu');
    if (Buffer)
        Buffer.addEventListener('click', onBufferClick);
    const Digg = document.getElementById('share-Digg-button-lex-menu');
    if (Digg)
        Digg.addEventListener('click', onDiggClick);
    const Mix = document.getElementById('share-Mix-button-lex-menu');
    if (Mix)
        Mix.addEventListener('click', onMixClick);
    const VKontakte = document.getElementById('share-VKontakte-button-lex-menu');
    if (VKontakte)
        VKontakte.addEventListener('click', onVKontakteClick);
    const XING = document.getElementById('share-XING-button-lex-menu');
    if (XING)
        XING.addEventListener('click', onXINGClick);
    const Evernote = document.getElementById('share-Evernote-button-lex-menu');
    if (Evernote)
        Evernote.addEventListener('click', onEvernoteClick);
    const HackerNews = document.getElementById('share-HackerNews-button-lex-menu');
    if (HackerNews)
        HackerNews.addEventListener('click', onHackerClick);
    const Flipboard = document.getElementById('share-Flipboard-button-lex-menu');
    if (Flipboard)
        Flipboard.addEventListener('click', onFlipboardClick);
    const meneame = document.getElementById('share-meneame-button-lex-menu');
    if (meneame)
        meneame.addEventListener('click', onMeneameClick);
    const blogger = document.getElementById('share-blogger-button-lex-menu');
    if (blogger)
        blogger.addEventListener('click', onBloggerClick);
    const Odnoklassniki = document.getElementById('share-Odnoklassniki-button-lex-menu');
    if (Odnoklassniki)
        Odnoklassniki.addEventListener('click', onOdnoklassnikiClick);
    const yahoo_mai = document.getElementById('share-yahoo_mai-button-lex-menu');
    if (yahoo_mai)
        yahoo_mai.addEventListener('click', onYahooClick);
    const google_bookmarks = document.getElementById('share-google_bookmarks-button-lex-menu');
    if (google_bookmarks)
        google_bookmarks.addEventListener('click', onGoogleClick);
    const line = document.getElementById('share-line-button-lex-menu');
    if (line)
        line.addEventListener('click', onLineClick);
    const renren = document.getElementById('share-renren-button-lex-menu');
    if (renren)
        renren.addEventListener('click', onRenrenClick);
    const weibo = document.getElementById('share-weibo-button-lex-menu');
    if (weibo)
        weibo.addEventListener('click', onWeiboClick);
    const baidu = document.getElementById('share-baidu-button-lex-menu');
    if (baidu)
        baidu.addEventListener('click', onBaiduClick);
}
function hideCommentHelper(comment) {
    const commentBody = comment.querySelector('div.comment-body');
    const pp = comment.querySelector('img[data-profile-picture]');
    const showButton = comment.querySelector('button.show-comment');
    if (showButton && commentBody && pp) {
        pp.setAttribute('hidden', '');
        showButton.removeAttribute('hidden');
        commentBody.setAttribute('hidden', '');
        comment.setAttribute('data-hidden', 'true');
    }
}
function showCommentHelper(comment) {
    const commentBody = comment.querySelector('div.comment-body');
    const pp = comment.querySelector('img[data-profile-picture]');
    const showButton = comment.querySelector('button.show-comment');
    if (showButton && commentBody && pp) {
        showButton.setAttribute('hidden', '');
        pp.removeAttribute('hidden');
        commentBody.removeAttribute('hidden');
        comment.setAttribute('data-hidden', 'false');
    }
}
function hideComment(_) {
    const comment = this.closest('div[data-comment-tree-wrapper]');
    if (comment && comment.getAttribute('data-hidden') === "false") {
        hideCommentHelper(comment);
    }
}
function showComment() {
    const comment = this.closest('div[data-comment-tree-wrapper]');
    if (comment && comment.getAttribute('data-hidden') === "true") {
        showCommentHelper(comment);
    }
}
function onClickCommentSummary() {
    const comment = this.closest('div[data-comment-tree-wrapper]');
    if (comment && comment.getAttribute('data-hidden') === "true") {
        showCommentHelper(comment);
    }
    else if (comment && comment.getAttribute('data-hidden') === "false") {
        hideCommentHelper(comment);
    }
}
function getOnShareComment(editor, id, username) {
    const func = function () {
        editor.getEditorState().read(() => {
            var _a, _b;
            const text_selection = (0, lexicalLexical_js_1.$getTextContent)();
            const title = document.title + " - " + username.concat(`'s Comment`);
            const description = (_a = document.getElementById('PAGE_DESCRIPTION')) === null || _a === void 0 ? void 0 : _a.getAttribute('content');
            var twitter_text = title;
            if (description)
                twitter_text += "\n" + description;
            twitter_text += "\n" + text_selection;
            const Url = new URL(window.location.href);
            Url.hash = id;
            var url = Url.href;
            const image = ((_b = document.getElementById('META_OG_IMAGE')) === null || _b === void 0 ? void 0 : _b.getAttribute('content')) || '';
            var email_body = url + "\n" + (description ? "\n" + description : "") + "\n" + text_selection;
            SHARE_ARTICLE_STATE.facebook = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE.x = {
                type: "article",
                payload: {
                    url,
                    text: twitter_text
                }
            };
            SHARE_ARTICLE_STATE.reddit = {
                type: "article",
                payload: {
                    url,
                    title: title
                }
            };
            SHARE_ARTICLE_STATE.linkedin = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE.email = {
                type: "article",
                payload: {
                    subject: title,
                    body: email_body
                }
            };
            SHARE_ARTICLE_STATE.link = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["pinterest"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    image
                }
            };
            SHARE_ARTICLE_STATE["whats-app"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    image
                }
            };
            SHARE_ARTICLE_STATE["telegram"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["tumblr"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    description: description || ''
                }
            };
            SHARE_ARTICLE_STATE["pocket"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["buffer"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["digg"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["mix"] = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["vkonate"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    description: description || '',
                    image
                }
            };
            SHARE_ARTICLE_STATE["xing"] = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["evernote"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["hacker"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["flipboard"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["mename"] = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["blogger"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    description: description || ''
                }
            };
            SHARE_ARTICLE_STATE["odnoklassiniki"] = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["yahoo"] = {
                type: "article",
                payload: url
            };
            SHARE_ARTICLE_STATE["google"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    description: description || ''
                }
            };
            SHARE_ARTICLE_STATE["renren"] = {
                type: "article",
                payload: {
                    url,
                    title,
                    description: description || ''
                }
            };
            SHARE_ARTICLE_STATE["weibo"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["baidu"] = {
                type: "article",
                payload: {
                    url,
                    title
                }
            };
            SHARE_ARTICLE_STATE["line"] = {
                type: "article",
                payload: url
            };
        });
    };
    return func;
}
function registerCommentNotEditable(editor) {
    addSocialMediaListerrs();
    const rootElement = editor._rootElement;
    if (rootElement) {
        const comment = rootElement.closest('div[data-comment-tree-wrapper]');
        if (comment) {
            const id = comment.id;
            const username = comment.querySelector('a[data-username]');
            if (window.commentObserver)
                window.commentObserver.observe(comment);
            const hideShowSummary = comment.querySelector('div.hide-comment-summary');
            if (hideShowSummary)
                hideShowSummary.addEventListener('click', onClickCommentSummary);
            const hideSidebar = comment.querySelector('div.comment-sidebar');
            if (hideSidebar)
                hideSidebar.addEventListener('click', hideComment);
            const showButton = comment.querySelector('button.show-comment');
            if (showButton)
                showButton.addEventListener('click', showComment);
            const shareButton = comment.querySelector('button[data-share-button]');
            if (shareButton && username) {
                if ((0, lexical_sharedLexicalShared_js_1.isTouchDevice)())
                    shareButton.addEventListener('touchstart', getOnShareComment(editor, id, username.innerText.trim()));
                else
                    shareButton.addEventListener('mousedown', getOnShareComment(editor, id, username.innerText.trim()));
            }
        }
    }
    return () => { };
}
exports.registerCommentNotEditable = registerCommentNotEditable;
function handleHideShowAnnotation() {
    const svg = this.querySelector('svg');
    const annotation = this.closest('div[data-annotation]');
    if (svg && annotation) {
        const annotationContent = annotation.querySelector('div[data-annotation-content]');
        if (annotationContent) {
            if (svg.style.cssText === "") {
                svg.style.cssText = "transform: rotate(180deg);";
                annotationContent.setAttribute('hidden', '');
            }
            else {
                svg.style.cssText = "";
                annotationContent.removeAttribute('hidden');
            }
        }
    }
}
function getScrollHighlightIntoView(nodes) {
    const func = function () {
        if (nodes.length) {
            const parentElement = nodes[0].node.parentElement;
            if (parentElement)
                parentElement.scrollIntoView();
        }
    };
    return func;
}
function registerAnnotationNotEditable(editor) {
    const rootElement = editor._rootElement;
    var see_button = undefined;
    if (rootElement) {
        const annotationWrapper = rootElement.closest('div[data-annotation]');
        if (annotationWrapper) {
            if (window.annotationObserver)
                window.annotationObserver.observe(annotationWrapper);
            const goToAnnotation = annotationWrapper.querySelector('button[data-goto-annotation]');
            if (goToAnnotation) {
                see_button = goToAnnotation;
            }
            const hideShowAnnotation = annotationWrapper.querySelector('button[data-hide-show-annotation]');
            if (hideShowAnnotation)
                hideShowAnnotation.addEventListener('click', handleHideShowAnnotation);
        }
    }
    editor.update(() => {
        var _a;
        const annotationNodes = (0, lexicalLexical_js_1.$nodesOfType)(AnnotationNode);
        for (let node of annotationNodes) {
            if (typeof node.getTextColor() === "string" && typeof node.getBackgroundColor() === "string") {
                const reference_id = node.getReferenceId();
                // Should be the id of the div.lexical-wrapper article
                const id = 'id_'.concat(reference_id);
                const editorInstance = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[id];
                if (editorInstance && editorInstance._rootElement) {
                    const referenceElement = document.getElementById(id);
                    if (referenceElement) {
                        const text_color = node.getTextColor();
                        const background_color = node.getBackgroundColor();
                        if (see_button && background_color) {
                            see_button.classList.remove('transparent');
                            see_button.classList.add('text', 'primary');
                            const svg = see_button.querySelector('svg');
                            if (svg)
                                svg.style.setProperty('fill', background_color, 'important');
                        }
                        const { range, nodes } = getRange({
                            start: node.getStart(),
                            end: node.getEnd(),
                            content: node.getContent()
                        }, referenceElement);
                        if (see_button)
                            see_button.addEventListener('click', getScrollHighlightIntoView(nodes));
                        const userHighlight = new Highlight(range);
                        userHighlight.type = "highlight";
                        const highlight_id = "user-highlight-".concat(window.crypto.randomUUID());
                        CSS.highlights.set(highlight_id, userHighlight);
                        const wrapper_el = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
                        if (wrapper_el) {
                            const style_el = document.createElement('style');
                            style_el.innerText = `::highlight(${highlight_id}) {
    background-color: ${background_color};
    color: ${text_color}!important;
  }`;
                            wrapper_el.insertAdjacentElement("afterend", style_el);
                        }
                    }
                    break;
                }
            }
        }
    });
}
exports.registerAnnotationNotEditable = registerAnnotationNotEditable;
var CURRENT_SAVED_STORAGE;
function getOnSubmitFormReloadHistory(editor) {
    const func = function (e) {
        const dialog = document.getElementById('insert-previous-lexical');
        e.preventDefault();
        e.stopPropagation();
        if (CURRENT_SAVED_STORAGE && dialog) {
            const parsedEditorState = editor.parseEditorState(CURRENT_SAVED_STORAGE);
            editor.setEditorState(parsedEditorState);
            (0, lexical_sharedLexicalShared_js_1.closeDialog)(dialog);
        }
    };
    return func;
}
function getOnOpenReloadHistory(e) {
    if (e.detail.el.id === "insert-previous-lexical") {
        const editor = (0, lexical_sharedLexicalShared_js_1.getCurrentEditor)();
        const dialogOutput = document.getElementById('upload-prev-lexical-state-out');
        const dialog = document.getElementById('insert-previous-lexical');
        const dialogForm = document.querySelector('#insert-previous-lexical form');
        if (dialog && dialogOutput && dialogForm && editor) {
            dialogOutput.innerHTML = '';
            appendRichTextEditorToOutput(dialogOutput, 'full');
            document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED', {
                detail: {
                    el: dialogOutput
                }
            }));
            dialogForm.addEventListener('submit', getOnSubmitFormReloadHistory(editor));
            document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
                detail: {
                    dialog: dialog
                }
            }));
        }
    }
}
function onAfterReloadHistoryDialogOpen() {
    const dialogOutput = document.getElementById('upload-prev-lexical-state-out');
    if (dialogOutput) {
        console.log("onAfterReloadHistoryDialogOpen");
        const richTextEditor = dialogOutput.querySelector('div.lexical-wrapper');
        if (richTextEditor && CURRENT_SAVED_STORAGE) {
            const output_editor_id = richTextEditor.id;
            const editor = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[output_editor_id];
            if (editor) {
                const parsedEditorState = editor.parseEditorState(CURRENT_SAVED_STORAGE);
                editor.setEditorState(parsedEditorState);
            }
        }
    }
}
exports.onAfterReloadHistoryDialogOpen = onAfterReloadHistoryDialogOpen;
function onBeforeChange() {
    const editor = document.querySelector('div.lexical-wrapper div[data-rich-text-editor][data-type="full"][data-editable="true"]');
    if (editor) {
        const id = editor.id;
        const editorState = (0, lexical_sharedLexicalShared_js_1.getEditorInstances)()[id];
        if (editorState) {
            const stringified = JSON.stringify(editorState.toJSON());
            const path_to_use = "frankmbrown-" + window.location.pathname;
            const new_path = path_to_use + "-new";
            window.localStorage.setItem(new_path, stringified);
        }
    }
}
/**
 * The lexical wrapper needs to have the data-save-state attribute on it for this to be registered. This makes it easier to implement.
 * div.lexical-wrapper[data-save-state]
 * @param editor
 * @returns
 */
function registerSaveAndReloadHistoryEditable(editor) {
    var _a;
    const wrapper = document.getElementById(editor._config.namespace) || ((_a = editor._rootElement) === null || _a === void 0 ? void 0 : _a.closest('div.lexical-wrapper'));
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenReloadHistory);
    document.addEventListener('ON_AFTER_RELOAD_HISTORY', onAfterReloadHistoryDialogOpen);
    const path_to_use = "frankmbrown-" + window.location.pathname;
    const old_path = path_to_use + "-old";
    const new_path = path_to_use + "-new";
    if (wrapper && wrapper.hasAttribute('data-save-state')) {
        const button = wrapper.querySelector('button[data-dialog="insert-previous-lexical"]');
        if (button) {
            const saved_state = window.localStorage.getItem(new_path);
            if (saved_state) {
                try {
                    const newJsonState = JSON.parse(saved_state);
                    CURRENT_SAVED_STORAGE = newJsonState;
                    window.localStorage.setItem(old_path, saved_state);
                    const current_editor_state = JSON.stringify(editor.getEditorState().toJSON());
                    if (current_editor_state !== newJsonState) {
                        const shownAlert = window.localStorage.getItem("frankmbrown-alert-save-state") === "true";
                        if (!!!shownAlert) {
                            document.dispatchEvent(new CustomEvent("OPEN_SNACKBAR", {
                                detail: {
                                    selem: '#saved-article-v-available'
                                }
                            }));
                            window.localStorage.setItem("frankmbrown-alert-save-state", "true");
                        }
                        button.removeAttribute('hidden');
                    }
                    else {
                        button.setAttribute('hidden', '');
                    }
                }
                catch (e) {
                    button.setAttribute('hidden', '');
                    console.error(e);
                }
            }
            else {
                button.setAttribute('hidden', '');
            }
        }
    }
    document.addEventListener('htmx:beforeRequest', onBeforeChange);
    window.addEventListener('beforeunload', onBeforeChange);
    return (0, lexical_utilsLexicalUtils_js_1.mergeRegister)(() => {
        document.removeEventListener('htmx:beforeRequest', onBeforeChange);
        window.removeEventListener('beforeunload', onBeforeChange);
    });
}
exports.registerSaveAndReloadHistoryEditable = registerSaveAndReloadHistoryEditable;
