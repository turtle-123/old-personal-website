"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMarkdownShortcutsEditable = exports.UNORDERED_LIST = exports.TRANSFORMERS = exports.TEXT_WITH_LINKS_EDITOR_TRANSFORMERS = exports.TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS = exports.TEXT_ONLY_EDITOR_TRANSFORMERS = exports.TEXT_MATCH_TRANSFORMERS = exports.TEXT_FORMAT_TRANSFORMERS = exports.STRIKETHROUGH = exports.QUOTE = exports.ORDERED_LIST = exports.LINK = exports.ITALIC_UNDERSCORE = exports.ITALIC_STAR = exports.INLINE_CODE = exports.HEADING = exports.FULL_EDITOR_TRANSFORMERS = exports.ELEMENT_TRANSFORMERS = exports.COMMENT_EDITOR_TRANSFORMERS = exports.CODE = exports.CHECK_LIST = exports.BOLD_UNDERSCORE = exports.BOLD_STAR = exports.BOLD_ITALIC_UNDERSCORE = exports.BOLD_ITALIC_STAR = exports.$convertToMarkdownString = exports.$convertFromMarkdownString = void 0;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const lexicalLexical_js_1 = require("./lexicalLexical.js");
const lexical_codeLexicalCode_js_1 = require("./lexical-codeLexicalCode.js");
const lexical_listLexicalList_js_1 = require("./lexical-listLexicalList.js");
const lexical_rich_textLexicalRichText_js_1 = require("./lexical-rich-textLexicalRichText.js");
const lexical_utilsLexicalUtils_js_1 = require("./lexical-utilsLexicalUtils.js");
const lexical_linkLexicalLink_js_1 = require("./lexical-linkLexicalLink.js");
const lexical_decoratorsLexicalDecorators_js_1 = require("./lexical-decoratorsLexicalDecorators.js");
const lexical_mathLexicalMath_js_1 = require("./lexical-mathLexicalMath.js");
const lexical_tableLexicalTable_js_1 = require("./lexical-tableLexicalTable.js");
const lexical_sharedLexicalShared_js_1 = require("./lexical-sharedLexicalShared.js");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function indexBy(list, callback) {
    const index = {};
    for (const item of list) {
        const key = callback(item);
        if (index[key]) {
            index[key].push(item);
        }
        else {
            index[key] = [item];
        }
    }
    return index;
}
function transformersByType(transformers) {
    const byType = indexBy(transformers, t => t.type);
    return {
        element: byType.element || [],
        textFormat: byType['text-format'] || [],
        textMatch: byType['text-match'] || []
    };
}
const PUNCTUATION_OR_SPACE = /[!-/:-@[-`{-~\s]/;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function createMarkdownExport(transformers) {
    const byType = transformersByType(transformers);
    // Export only uses text formats that are responsible for single format
    // e.g. it will filter out *** (bold, italic) and instead use separate ** and *
    const textFormatTransformers = byType.textFormat.filter(transformer => transformer.format.length === 1);
    return node => {
        const output = [];
        const children = (node || (0, lexicalLexical_js_1.$getRoot)()).getChildren();
        for (const child of children) {
            const result = exportTopLevelElements(child, byType.element, textFormatTransformers, byType.textMatch);
            if (result != null) {
                output.push(result);
            }
        }
        return output.join('\n\n');
    };
}
function exportTopLevelElements(node, elementTransformers, textTransformersIndex, textMatchTransformers) {
    for (const transformer of elementTransformers) {
        const result = transformer.export(node, _node => exportChildren(_node, textTransformersIndex, textMatchTransformers));
        if (result != null) {
            return result;
        }
    }
    if ((0, lexicalLexical_js_1.$isElementNode)(node)) {
        return exportChildren(node, textTransformersIndex, textMatchTransformers);
    }
    else if ((0, lexicalLexical_js_1.$isDecoratorNode)(node)) {
        return node.getTextContent();
    }
    else {
        return null;
    }
}
function exportChildren(node, textTransformersIndex, textMatchTransformers) {
    const output = [];
    const children = node.getChildren();
    mainLoop: for (const child of children) {
        for (const transformer of textMatchTransformers) {
            const result = transformer.export(child, parentNode => exportChildren(parentNode, textTransformersIndex, textMatchTransformers), (textNode, textContent) => exportTextFormat(textNode, textContent, textTransformersIndex));
            if (result != null) {
                output.push(result);
                continue mainLoop;
            }
        }
        if ((0, lexicalLexical_js_1.$isLineBreakNode)(child)) {
            output.push('\n');
        }
        else if ((0, lexicalLexical_js_1.$isTextNode)(child)) {
            output.push(exportTextFormat(child, child.getTextContent(), textTransformersIndex));
        }
        else if ((0, lexicalLexical_js_1.$isElementNode)(child)) {
            output.push(exportChildren(child, textTransformersIndex, textMatchTransformers));
        }
        else if ((0, lexicalLexical_js_1.$isDecoratorNode)(child)) {
            output.push(child.getTextContent());
        }
    }
    return output.join('');
}
function exportTextFormat(node, textContent, textTransformers) {
    // This function handles the case of a string looking like this: "   foo   "
    // Where it would be invalid markdown to generate: "**   foo   **"
    // We instead want to trim the whitespace out, apply formatting, and then
    // bring the whitespace back. So our returned string looks like this: "   **foo**   "
    const frozenString = textContent.trim();
    let output = frozenString;
    const applied = new Set();
    for (const transformer of textTransformers) {
        const format = transformer.format[0];
        const tag = transformer.tag;
        if (hasFormat(node, format) && !applied.has(format)) {
            // Multiple tags might be used for the same format (*, _)
            applied.add(format);
            // Prevent adding opening tag is already opened by the previous sibling
            const previousNode = getTextSibling(node, true);
            if (!hasFormat(previousNode, format)) {
                output = tag + output;
            }
            // Prevent adding closing tag if next sibling will do it
            const nextNode = getTextSibling(node, false);
            if (!hasFormat(nextNode, format)) {
                output += tag;
            }
        }
    }
    // Replace trimmed version of textContent ensuring surrounding whitespace is not modified
    return textContent.replace(frozenString, output);
}
// Get next or previous text sibling a text node, including cases
// when it's a child of inline element (e.g. link)
function getTextSibling(node, backward) {
    let sibling = backward ? node.getPreviousSibling() : node.getNextSibling();
    if (!sibling) {
        const parent = node.getParentOrThrow();
        if (parent.isInline()) {
            sibling = backward ? parent.getPreviousSibling() : parent.getNextSibling();
        }
    }
    while (sibling) {
        if ((0, lexicalLexical_js_1.$isElementNode)(sibling)) {
            if (!sibling.isInline()) {
                break;
            }
            const descendant = backward ? sibling.getLastDescendant() : sibling.getFirstDescendant();
            if ((0, lexicalLexical_js_1.$isTextNode)(descendant)) {
                return descendant;
            }
            else {
                sibling = backward ? sibling.getPreviousSibling() : sibling.getNextSibling();
            }
        }
        if ((0, lexicalLexical_js_1.$isTextNode)(sibling)) {
            return sibling;
        }
        if (!(0, lexicalLexical_js_1.$isElementNode)(sibling)) {
            return null;
        }
    }
    return null;
}
function hasFormat(node, format) {
    return (0, lexicalLexical_js_1.$isTextNode)(node) && node.hasFormat(format);
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
CAN_USE_DOM && 'InputEvent' in window && !documentMode ? 'getTargetRanges' in new window.InputEvent('input') : false;
const IS_SAFARI = CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
const IS_IOS = CAN_USE_DOM && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
CAN_USE_DOM && /Android/.test(navigator.userAgent);
// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
const IS_CHROME = CAN_USE_DOM && /^(?=.*Chrome).*/i.test(navigator.userAgent);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;
const IS_APPLE_WEBKIT = CAN_USE_DOM && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && !IS_CHROME;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const MARKDOWN_EMPTY_LINE_REG_EXP = /^\s{0,3}$/;
const CODE_BLOCK_REG_EXP = /^```(\w{1,10})?\s?$/;
function createMarkdownImport(transformers) {
    const byType = transformersByType(transformers);
    const textFormatTransformersIndex = createTextFormatTransformersIndex(byType.textFormat);
    return (markdownString, node) => {
        const lines = markdownString.split('\n');
        const linesLength = lines.length;
        const root = node || (0, lexicalLexical_js_1.$getRoot)();
        root.clear();
        for (let i = 0; i < linesLength; i++) {
            const lineText = lines[i];
            // Codeblocks are processed first as anything inside such block
            // is ignored for further processing
            // TODO:
            // Abstract it to be dynamic as other transformers (add multiline match option)
            const [codeBlockNode, shiftedIndex] = importCodeBlock(lines, i, root);
            if (codeBlockNode != null) {
                i = shiftedIndex;
                continue;
            }
            importBlocks(lineText, root, byType.element, textFormatTransformersIndex, byType.textMatch);
        }
        // Removing empty paragraphs as md does not really
        // allow empty lines and uses them as dilimiter
        const children = root.getChildren();
        for (const child of children) {
            if (isEmptyParagraph(child)) {
                child.remove();
            }
        }
        if ((0, lexicalLexical_js_1.$getSelection)() !== null) {
            root.selectEnd();
        }
    };
}
function isEmptyParagraph(node) {
    if (!(0, lexicalLexical_js_1.$isParagraphNode)(node)) {
        return false;
    }
    const firstChild = node.getFirstChild();
    return firstChild == null || node.getChildrenSize() === 1 && (0, lexicalLexical_js_1.$isTextNode)(firstChild) && MARKDOWN_EMPTY_LINE_REG_EXP.test(firstChild.getTextContent());
}
function importBlocks(lineText, rootNode, elementTransformers, textFormatTransformersIndex, textMatchTransformers) {
    const lineTextTrimmed = lineText.trim();
    const textNode = (0, lexicalLexical_js_1.$createTextNode)(lineTextTrimmed);
    const elementNode = (0, lexicalLexical_js_1.$createParagraphNode)();
    elementNode.append(textNode);
    rootNode.append(elementNode);
    for (const { regExp, replace } of elementTransformers) {
        const match = lineText.match(regExp);
        if (match) {
            textNode.setTextContent(lineText.slice(match[0].length));
            replace(elementNode, [textNode], match, true);
            break;
        }
    }
    importTextFormatTransformers(textNode, textFormatTransformersIndex, textMatchTransformers);
    // If no transformer found and we left with original paragraph node
    // can check if its content can be appended to the previous node
    // if it's a paragraph, quote or list
    if (elementNode.isAttached() && lineTextTrimmed.length > 0) {
        const previousNode = elementNode.getPreviousSibling();
        if ((0, lexicalLexical_js_1.$isParagraphNode)(previousNode) || (0, lexical_rich_textLexicalRichText_js_1.$isQuoteNode)(previousNode) || (0, lexical_listLexicalList_js_1.$isListNode)(previousNode)) {
            let targetNode = previousNode;
            if ((0, lexical_listLexicalList_js_1.$isListNode)(previousNode)) {
                const lastDescendant = previousNode.getLastDescendant();
                if (lastDescendant == null) {
                    targetNode = null;
                }
                else {
                    targetNode = (0, lexical_utilsLexicalUtils_js_1.$findMatchingParent)(lastDescendant, lexical_listLexicalList_js_1.$isListItemNode);
                }
            }
            if (targetNode != null && targetNode.getTextContentSize() > 0) {
                targetNode.splice(targetNode.getChildrenSize(), 0, [(0, lexicalLexical_js_1.$createLineBreakNode)(), ...elementNode.getChildren()]);
                elementNode.remove();
            }
        }
    }
}
function importCodeBlock(lines, startLineIndex, rootNode) {
    const openMatch = lines[startLineIndex].match(CODE_BLOCK_REG_EXP);
    if (openMatch) {
        let endLineIndex = startLineIndex;
        const linesLength = lines.length;
        while (++endLineIndex < linesLength) {
            const closeMatch = lines[endLineIndex].match(CODE_BLOCK_REG_EXP);
            if (closeMatch) {
                const codeBlockNode = (0, lexical_codeLexicalCode_js_1.$createCodeNode)({
                    language: openMatch[1],
                    onlyCodeEditor: false
                });
                const textNode = (0, lexicalLexical_js_1.$createTextNode)(lines.slice(startLineIndex + 1, endLineIndex).join('\n'));
                codeBlockNode.append(textNode);
                rootNode.append(codeBlockNode);
                return [codeBlockNode, endLineIndex];
            }
        }
    }
    return [null, startLineIndex];
}
// Processing text content and replaces text format tags.
// It takes outermost tag match and its content, creates text node with
// format based on tag and then recursively executed over node's content
//
// E.g. for "*Hello **world**!*" string it will create text node with
// "Hello **world**!" content and italic format and run recursively over
// its content to transform "**world**" part
function importTextFormatTransformers(textNode, textFormatTransformersIndex, textMatchTransformers) {
    const textContent = textNode.getTextContent();
    const match = findOutermostMatch(textContent, textFormatTransformersIndex);
    if (!match) {
        // Once text format processing is done run text match transformers, as it
        // only can span within single text node (unline formats that can cover multiple nodes)
        importTextMatchTransformers(textNode, textMatchTransformers);
        return;
    }
    let currentNode, remainderNode, leadingNode;
    // If matching full content there's no need to run splitText and can reuse existing textNode
    // to update its content and apply format. E.g. for **_Hello_** string after applying bold
    // format (**) it will reuse the same text node to apply italic (_)
    if (match[0] === textContent) {
        currentNode = textNode;
    }
    else {
        const startIndex = match.index || 0;
        const endIndex = startIndex + match[0].length;
        if (startIndex === 0) {
            [currentNode, remainderNode] = textNode.splitText(endIndex);
        }
        else {
            [leadingNode, currentNode, remainderNode] = textNode.splitText(startIndex, endIndex);
        }
    }
    currentNode.setTextContent(match[2]);
    const transformer = textFormatTransformersIndex.transformersByTag[match[1]];
    if (transformer) {
        for (const format of transformer.format) {
            if (!currentNode.hasFormat(format)) {
                currentNode.toggleFormat(format);
            }
        }
    }
    // Recursively run over inner text if it's not inline code
    if (!currentNode.hasFormat('code')) {
        importTextFormatTransformers(currentNode, textFormatTransformersIndex, textMatchTransformers);
    }
    // Run over leading/remaining text if any
    if (leadingNode) {
        importTextFormatTransformers(leadingNode, textFormatTransformersIndex, textMatchTransformers);
    }
    if (remainderNode) {
        importTextFormatTransformers(remainderNode, textFormatTransformersIndex, textMatchTransformers);
    }
}
function importTextMatchTransformers(textNode_, textMatchTransformers) {
    let textNode = textNode_;
    mainLoop: while (textNode) {
        for (const transformer of textMatchTransformers) {
            const match = textNode.getTextContent().match(transformer.importRegExp);
            if (!match) {
                continue;
            }
            const startIndex = match.index || 0;
            const endIndex = startIndex + match[0].length;
            let replaceNode, leftTextNode, rightTextNode;
            if (startIndex === 0) {
                [replaceNode, textNode] = textNode.splitText(endIndex);
            }
            else {
                [leftTextNode, replaceNode, rightTextNode] = textNode.splitText(startIndex, endIndex);
            }
            if (leftTextNode) {
                importTextMatchTransformers(leftTextNode, textMatchTransformers);
            }
            if (rightTextNode) {
                textNode = rightTextNode;
            }
            transformer.replace(replaceNode, match);
            continue mainLoop;
        }
        break;
    }
}
// Finds first "<tag>content<tag>" match that is not nested into another tag
function findOutermostMatch(textContent, textTransformersIndex) {
    const openTagsMatch = textContent.match(textTransformersIndex.openTagsRegExp);
    if (openTagsMatch == null) {
        return null;
    }
    for (const match of openTagsMatch) {
        // Open tags reg exp might capture leading space so removing it
        // before using match to find transformer
        const tag = match.replace(/^\s/, '');
        const fullMatchRegExp = textTransformersIndex.fullMatchRegExpByTag[tag];
        if (fullMatchRegExp == null) {
            continue;
        }
        const fullMatch = textContent.match(fullMatchRegExp);
        const transformer = textTransformersIndex.transformersByTag[tag];
        if (fullMatch != null && transformer != null) {
            if (transformer.intraword !== false) {
                return fullMatch;
            }
            // For non-intraword transformers checking if it's within a word
            // or surrounded with space/punctuation/newline
            const { index = 0 } = fullMatch;
            const beforeChar = textContent[index - 1];
            const afterChar = textContent[index + fullMatch[0].length];
            if ((!beforeChar || PUNCTUATION_OR_SPACE.test(beforeChar)) && (!afterChar || PUNCTUATION_OR_SPACE.test(afterChar))) {
                return fullMatch;
            }
        }
    }
    return null;
}
function createTextFormatTransformersIndex(textTransformers) {
    const transformersByTag = {};
    const fullMatchRegExpByTag = {};
    const openTagsRegExp = [];
    const escapeRegExp = `(?<![\\\\])`;
    for (const transformer of textTransformers) {
        const { tag } = transformer;
        transformersByTag[tag] = transformer;
        const tagRegExp = tag.replace(/(\*|\^|\+)/g, '\\$1');
        openTagsRegExp.push(tagRegExp);
        if (IS_SAFARI || IS_IOS || IS_APPLE_WEBKIT) {
            fullMatchRegExpByTag[tag] = new RegExp(`(${tagRegExp})(?![${tagRegExp}\\s])(.*?[^${tagRegExp}\\s])${tagRegExp}(?!${tagRegExp})`);
        }
        else {
            fullMatchRegExpByTag[tag] = new RegExp(`(?<![\\\\${tagRegExp}])(${tagRegExp})((\\\\${tagRegExp})?.*?[^${tagRegExp}\\s](\\\\${tagRegExp})?)((?<!\\\\)|(?<=\\\\\\\\))(${tagRegExp})(?![\\\\${tagRegExp}])`);
        }
    }
    return {
        // Reg exp to find open tag + content + close tag
        fullMatchRegExpByTag,
        // Reg exp to find opening tags
        openTagsRegExp: new RegExp((IS_SAFARI || IS_IOS || IS_APPLE_WEBKIT ? '' : `${escapeRegExp}`) + '(' + openTagsRegExp.join('|') + ')', 'g'),
        transformersByTag
    };
}
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function runElementTransformers(parentNode, anchorNode, anchorOffset, elementTransformers) {
    const grandParentNode = parentNode.getParent();
    if (!(0, lexicalLexical_js_1.$isRootOrShadowRoot)(grandParentNode) || parentNode.getFirstChild() !== anchorNode) {
        return false;
    }
    const textContent = anchorNode.getTextContent();
    // Checking for anchorOffset position to prevent any checks for cases when caret is too far
    // from a line start to be a part of block-level markdown trigger.
    //
    // TODO:
    // Can have a quick check if caret is close enough to the beginning of the string (e.g. offset less than 10-20)
    // since otherwise it won't be a markdown shortcut, but tables are exception
    if (textContent[anchorOffset - 1] !== ' ') {
        return false;
    }
    for (const { regExp, replace } of elementTransformers) {
        const match = textContent.match(regExp);
        if (match && match[0].length === anchorOffset) {
            const nextSiblings = anchorNode.getNextSiblings();
            const [leadingNode, remainderNode] = anchorNode.splitText(anchorOffset);
            leadingNode.remove();
            const siblings = remainderNode ? [remainderNode, ...nextSiblings] : nextSiblings;
            replace(parentNode, siblings, match, false);
            return true;
        }
    }
    return false;
}
function runTextMatchTransformers(anchorNode, anchorOffset, transformersByTrigger) {
    let textContent = anchorNode.getTextContent();
    const lastChar = textContent[anchorOffset - 1];
    const transformers = transformersByTrigger[lastChar];
    if (transformers == null) {
        return false;
    }
    // If typing in the middle of content, remove the tail to do
    // reg exp match up to a string end (caret position)
    if (anchorOffset < textContent.length) {
        textContent = textContent.slice(0, anchorOffset);
    }
    for (const transformer of transformers) {
        const match = textContent.match(transformer.regExp);
        if (match === null) {
            continue;
        }
        const startIndex = match.index || 0;
        const endIndex = startIndex + match[0].length;
        let replaceNode;
        if (startIndex === 0) {
            [replaceNode] = anchorNode.splitText(endIndex);
        }
        else {
            [, replaceNode] = anchorNode.splitText(startIndex, endIndex);
        }
        replaceNode.selectNext(0, 0);
        transformer.replace(replaceNode, match);
        return true;
    }
    return false;
}
function runTextFormatTransformers(anchorNode, anchorOffset, textFormatTransformers) {
    const textContent = anchorNode.getTextContent();
    const closeTagEndIndex = anchorOffset - 1;
    const closeChar = textContent[closeTagEndIndex];
    // Quick check if we're possibly at the end of inline markdown style
    const matchers = textFormatTransformers[closeChar];
    if (!matchers) {
        return false;
    }
    for (const matcher of matchers) {
        const { tag } = matcher;
        const tagLength = tag.length;
        const closeTagStartIndex = closeTagEndIndex - tagLength + 1;
        // If tag is not single char check if rest of it matches with text content
        if (tagLength > 1) {
            if (!isEqualSubString(textContent, closeTagStartIndex, tag, 0, tagLength)) {
                continue;
            }
        }
        // Space before closing tag cancels inline markdown
        if (textContent[closeTagStartIndex - 1] === ' ') {
            continue;
        }
        // Some tags can not be used within words, hence should have newline/space/punctuation after it
        const afterCloseTagChar = textContent[closeTagEndIndex + 1];
        if (matcher.intraword === false && afterCloseTagChar && !PUNCTUATION_OR_SPACE.test(afterCloseTagChar)) {
            continue;
        }
        const closeNode = anchorNode;
        let openNode = closeNode;
        let openTagStartIndex = getOpenTagStartIndex(textContent, closeTagStartIndex, tag);
        // Go through text node siblings and search for opening tag
        // if haven't found it within the same text node as closing tag
        let sibling = openNode;
        while (openTagStartIndex < 0 && (sibling = sibling.getPreviousSibling())) {
            if ((0, lexicalLexical_js_1.$isLineBreakNode)(sibling)) {
                break;
            }
            if ((0, lexicalLexical_js_1.$isTextNode)(sibling)) {
                const siblingTextContent = sibling.getTextContent();
                openNode = sibling;
                openTagStartIndex = getOpenTagStartIndex(siblingTextContent, siblingTextContent.length, tag);
            }
        }
        // Opening tag is not found
        if (openTagStartIndex < 0) {
            continue;
        }
        // No content between opening and closing tag
        if (openNode === closeNode && openTagStartIndex + tagLength === closeTagStartIndex) {
            continue;
        }
        // Checking longer tags for repeating chars (e.g. *** vs **)
        const prevOpenNodeText = openNode.getTextContent();
        if (openTagStartIndex > 0 && prevOpenNodeText[openTagStartIndex - 1] === closeChar) {
            continue;
        }
        // Some tags can not be used within words, hence should have newline/space/punctuation before it
        const beforeOpenTagChar = prevOpenNodeText[openTagStartIndex - 1];
        if (matcher.intraword === false && beforeOpenTagChar && !PUNCTUATION_OR_SPACE.test(beforeOpenTagChar)) {
            continue;
        }
        // Clean text from opening and closing tags (starting from closing tag
        // to prevent any offset shifts if we start from opening one)
        const prevCloseNodeText = closeNode.getTextContent();
        const closeNodeText = prevCloseNodeText.slice(0, closeTagStartIndex) + prevCloseNodeText.slice(closeTagEndIndex + 1);
        closeNode.setTextContent(closeNodeText);
        const openNodeText = openNode === closeNode ? closeNodeText : prevOpenNodeText;
        openNode.setTextContent(openNodeText.slice(0, openTagStartIndex) + openNodeText.slice(openTagStartIndex + tagLength));
        const selection = (0, lexicalLexical_js_1.$getSelection)();
        const nextSelection = (0, lexicalLexical_js_1.$createRangeSelection)();
        (0, lexicalLexical_js_1.$setSelection)(nextSelection);
        // Adjust offset based on deleted chars
        const newOffset = closeTagEndIndex - tagLength * (openNode === closeNode ? 2 : 1) + 1;
        nextSelection.anchor.set(openNode.__key, openTagStartIndex, 'text');
        nextSelection.focus.set(closeNode.__key, newOffset, 'text');
        // Apply formatting to selected text
        for (const format of matcher.format) {
            if (!nextSelection.hasFormat(format)) {
                nextSelection.formatText(format);
            }
        }
        // Collapse selection up to the focus point
        nextSelection.anchor.set(nextSelection.focus.key, nextSelection.focus.offset, nextSelection.focus.type);
        // Remove formatting from collapsed selection
        for (const format of matcher.format) {
            if (nextSelection.hasFormat(format)) {
                nextSelection.toggleFormat(format);
            }
        }
        if ((0, lexicalLexical_js_1.$isRangeSelection)(selection)) {
            nextSelection.format = selection.format;
        }
        return true;
    }
    return false;
}
function getOpenTagStartIndex(string, maxIndex, tag) {
    const tagLength = tag.length;
    for (let i = maxIndex; i >= tagLength; i--) {
        const startIndex = i - tagLength;
        if (isEqualSubString(string, startIndex, tag, 0, tagLength) &&
            // Space after opening tag cancels transformation
            string[startIndex + tagLength] !== ' ') {
            return startIndex;
        }
    }
    return -1;
}
function isEqualSubString(stringA, aStart, stringB, bStart, length) {
    for (let i = 0; i < length; i++) {
        if (stringA[aStart + i] !== stringB[bStart + i]) {
            return false;
        }
    }
    return true;
}
function registerMarkdownShortcutsEditable(editor, transformers = TRANSFORMERS) {
    const byType = transformersByType(transformers);
    const textFormatTransformersIndex = indexBy(byType.textFormat, ({ tag }) => tag[tag.length - 1]);
    const textMatchTransformersIndex = indexBy(byType.textMatch, ({ trigger }) => trigger);
    for (const transformer of transformers) {
        const type = transformer.type;
        if (type === 'element' || type === 'text-match') {
            const dependencies = transformer.dependencies;
            for (const node of dependencies) {
                if (!editor.hasNode(node)) {
                    {
                        throw Error(`MarkdownShortcuts: missing dependency ${node.getType()} for transformer. Ensure node dependency is included in editor initial config.`);
                    }
                }
            }
        }
    }
    const transform = (parentNode, anchorNode, anchorOffset) => {
        if (runElementTransformers(parentNode, anchorNode, anchorOffset, byType.element)) {
            return;
        }
        if (runTextMatchTransformers(anchorNode, anchorOffset, textMatchTransformersIndex)) {
            return;
        }
        runTextFormatTransformers(anchorNode, anchorOffset, textFormatTransformersIndex);
    };
    return editor.registerUpdateListener(({ tags, dirtyLeaves, editorState, prevEditorState }) => {
        // Ignore updates from undo/redo (as changes already calculated)
        if (tags.has('historic')) {
            return;
        }
        // If editor is still composing (i.e. backticks) we must wait before the user confirms the key
        if (editor.isComposing()) {
            return;
        }
        const selection = editorState.read(lexicalLexical_js_1.$getSelection);
        const prevSelection = prevEditorState.read(lexicalLexical_js_1.$getSelection);
        if (!(0, lexicalLexical_js_1.$isRangeSelection)(prevSelection) || !(0, lexicalLexical_js_1.$isRangeSelection)(selection) || !selection.isCollapsed()) {
            return;
        }
        const anchorKey = selection.anchor.key;
        const anchorOffset = selection.anchor.offset;
        const anchorNode = editorState._nodeMap.get(anchorKey);
        if (!(0, lexicalLexical_js_1.$isTextNode)(anchorNode) || !dirtyLeaves.has(anchorKey) || anchorOffset !== 1 && anchorOffset > prevSelection.anchor.offset + 1) {
            return;
        }
        editor.update(() => {
            // Markdown is not available inside code
            if (anchorNode.hasFormat('code')) {
                return;
            }
            const parentNode = anchorNode.getParent();
            if (parentNode === null || (0, lexical_codeLexicalCode_js_1.$isCodeNode)(parentNode)) {
                return;
            }
            transform(parentNode, anchorNode, selection.anchor.offset);
        });
    });
}
exports.registerMarkdownShortcutsEditable = registerMarkdownShortcutsEditable;
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const createBlockNode = createNode => {
    return (parentNode, children, match) => {
        const node = createNode(match);
        node.append(...children);
        parentNode.replace(node);
        node.select(0, 0);
    };
};
// Amount of spaces that define indentation level
// TODO: should be an option
const LIST_INDENT_SIZE = 4;
const listReplace = listType => {
    return (parentNode, children, match) => {
        const previousNode = parentNode.getPreviousSibling();
        const nextNode = parentNode.getNextSibling();
        const listItem = (0, lexical_listLexicalList_js_1.$createListItemNode)(listType === 'check' ? match[3] === 'x' : undefined);
        if ((0, lexical_listLexicalList_js_1.$isListNode)(nextNode) && nextNode.getListType() === listType) {
            const firstChild = nextNode.getFirstChild();
            if (firstChild !== null) {
                firstChild.insertBefore(listItem);
            }
            else {
                // should never happen, but let's handle gracefully, just in case.
                nextNode.append(listItem);
            }
            parentNode.remove();
        }
        else if ((0, lexical_listLexicalList_js_1.$isListNode)(previousNode) && previousNode.getListType() === listType) {
            previousNode.append(listItem);
            parentNode.remove();
        }
        else {
            const list = (0, lexical_listLexicalList_js_1.$createListNode)(listType, listType === 'number' ? Number(match[2]) : undefined);
            list.append(listItem);
            parentNode.replace(list);
        }
        listItem.append(...children);
        listItem.select(0, 0);
        const indent = Math.floor(match[1].length / LIST_INDENT_SIZE);
        if (indent) {
            listItem.setIndent(indent);
        }
    };
};
const listExport = (listNode, exportChildren, depth) => {
    const output = [];
    const children = listNode.getChildren();
    let index = 0;
    for (const listItemNode of children) {
        if ((0, lexical_listLexicalList_js_1.$isListItemNode)(listItemNode)) {
            if (listItemNode.getChildrenSize() === 1) {
                const firstChild = listItemNode.getFirstChild();
                if ((0, lexical_listLexicalList_js_1.$isListNode)(firstChild)) {
                    output.push(listExport(firstChild, exportChildren, depth + 1));
                    continue;
                }
            }
            const indent = ' '.repeat(depth * LIST_INDENT_SIZE);
            const listType = listNode.getListType();
            const prefix = listType === 'number' ? `${listNode.getStart() + index}. ` : listType === 'check' ? `- [${listItemNode.getChecked() ? 'x' : ' '}] ` : '- ';
            output.push(indent + prefix + exportChildren(listItemNode));
            index++;
        }
    }
    return output.join('\n');
};
const IMAGE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.ImageNode],
    export: node => {
        if (!(0, lexical_decoratorsLexicalDecorators_js_1.$isImageNode)(node)) {
            return null;
        }
        const alt = node.getShort().replace(/\)/g, '\\)');
        const long = node.getLong().replace(/\)/g, '\\)');
        const width = node.getWidth();
        const height = node.getHeight();
        const originalDevice = node.getOriginalDevice();
        const backgroundColor = node.getBackgroundColor();
        const src = node.getSrc();
        var str = `![${alt}](${src})(${long})(${width})(${height})(${originalDevice})`;
        if (backgroundColor)
            str += `(${backgroundColor})`;
        console.log(str);
        return str;
    },
    importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
    regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
    replace: (textNode, match) => {
        const [, altText, src] = match;
        const imageNode = (0, lexical_decoratorsLexicalDecorators_js_1.$createImageNode)({
            short: altText,
            long: '',
            src: src,
            width: 300,
            height: 300,
            originalDevice: (0, lexical_sharedLexicalShared_js_1.getDeviceType)(),
            backgroundColor: undefined
        });
        textNode.replace(imageNode);
    },
    trigger: ')',
    type: 'text-match'
};
const EQUATION = {
    dependencies: [lexical_mathLexicalMath_js_1.MathNode],
    export: node => {
        if (!(0, lexical_mathLexicalMath_js_1.$isMathNode)(node)) {
            return null;
        }
        return `$${node.getEquation()}$`;
    },
    importRegExp: /\$([^$]+?)\$/,
    regExp: /\$([^$]+?)\$$/,
    replace: (textNode, match) => {
        const [, equation] = match;
        const equationNode = (0, lexical_mathLexicalMath_js_1.$createMathNode)(equation, true);
        textNode.replace(equationNode);
    },
    trigger: '$',
    type: 'text-match'
};
const HEADING = {
    dependencies: [lexical_rich_textLexicalRichText_js_1.HeadingNode],
    export: (node, exportChildren) => {
        if (!(0, lexical_rich_textLexicalRichText_js_1.$isHeadingNode)(node)) {
            return null;
        }
        const level = Math.max(2, Number(node.getTag().slice(1)));
        return '#'.repeat(level) + ' ' + exportChildren(node);
    },
    regExp: /^(#{2,6})\s/,
    replace: createBlockNode(match => {
        const tag = 'h' + match[1].length;
        return (0, lexical_rich_textLexicalRichText_js_1.$createHeadingNode)(tag);
    }),
    type: 'element'
};
exports.HEADING = HEADING;
const QUOTE = {
    dependencies: [lexical_rich_textLexicalRichText_js_1.QuoteNode],
    export: (node, exportChildren) => {
        if (!(0, lexical_rich_textLexicalRichText_js_1.$isQuoteNode)(node)) {
            return null;
        }
        const lines = exportChildren(node).split('\n');
        const output = [];
        for (const line of lines) {
            output.push('> ' + line);
        }
        return output.join('\n');
    },
    regExp: /^>\s/,
    replace: (parentNode, children, _match, isImport) => {
        if (isImport) {
            const previousNode = parentNode.getPreviousSibling();
            if ((0, lexical_rich_textLexicalRichText_js_1.$isQuoteNode)(previousNode)) {
                previousNode.splice(previousNode.getChildrenSize(), 0, [(0, lexicalLexical_js_1.$createLineBreakNode)(), ...children]);
                previousNode.select(0, 0);
                parentNode.remove();
                return;
            }
        }
        const node = (0, lexical_rich_textLexicalRichText_js_1.$createQuoteNode)();
        node.append(...children);
        parentNode.replace(node);
        node.select(0, 0);
    },
    type: 'element'
};
exports.QUOTE = QUOTE;
const CODE = {
    dependencies: [lexical_codeLexicalCode_js_1.CodeNode, lexical_codeLexicalCode_js_1.CodeHighlightNode],
    export: node => {
        if (!(0, lexical_codeLexicalCode_js_1.$isCodeNode)(node)) {
            return null;
        }
        const textContent = node.getTextContent();
        return '```' + (node.getLanguage() || '') + (textContent ? '\n' + textContent : '') + '\n' + '```';
    },
    regExp: /^```(\w{1,14})?\s/,
    replace: createBlockNode(match => {
        return (0, lexical_codeLexicalCode_js_1.$createCodeNode)({
            language: match ? match[1] : undefined,
            onlyCodeEditor: false
        });
    }),
    type: 'element'
};
exports.CODE = CODE;
const UNORDERED_LIST = {
    dependencies: [lexical_listLexicalList_js_1.ListNode, lexical_listLexicalList_js_1.ListItemNode],
    export: (node, exportChildren) => {
        return (0, lexical_listLexicalList_js_1.$isListNode)(node) ? listExport(node, exportChildren, 0) : null;
    },
    regExp: /^(\s*)[-*+]\s/,
    replace: listReplace('bullet'),
    type: 'element'
};
exports.UNORDERED_LIST = UNORDERED_LIST;
const CHECK_LIST = {
    dependencies: [lexical_listLexicalList_js_1.ListNode, lexical_listLexicalList_js_1.ListItemNode],
    export: (node, exportChildren) => {
        return (0, lexical_listLexicalList_js_1.$isListNode)(node) ? listExport(node, exportChildren, 0) : null;
    },
    regExp: /^(\s*)(?:-\s)?\s?(\[(\s|x)?\])\s/i,
    replace: listReplace('check'),
    type: 'element'
};
exports.CHECK_LIST = CHECK_LIST;
const ORDERED_LIST = {
    dependencies: [lexical_listLexicalList_js_1.ListNode, lexical_listLexicalList_js_1.ListItemNode],
    export: (node, exportChildren) => {
        return (0, lexical_listLexicalList_js_1.$isListNode)(node) ? listExport(node, exportChildren, 0) : null;
    },
    regExp: /^(\s*)(\d{1,})\.\s/,
    replace: listReplace('number'),
    type: 'element'
};
exports.ORDERED_LIST = ORDERED_LIST;
const INLINE_CODE = {
    format: ['code'],
    tag: '`',
    type: 'text-format'
};
exports.INLINE_CODE = INLINE_CODE;
const INLINE_QUOTE = {
    format: ['quote'],
    tag: '"',
    type: 'text-format'
};
const SUPERSCRIPT_COMMAND = {
    format: ['superscript'],
    tag: '^',
    type: 'text-format'
};
const SUBSCRIPT_COMMAND = {
    format: ['subscript'],
    tag: '~',
    type: 'text-format'
};
const KBD_COMMAND = {
    format: ['kbd'],
    tag: '|',
    type: 'text-format'
};
// export const HIGHLIGHT: TextFormatTransformer = {
//   format: ['highlight'],
//   tag: '==',
//   type: 'text-format',
// };
const BOLD_ITALIC_STAR = {
    format: ['bold', 'italic'],
    tag: '***',
    type: 'text-format'
};
exports.BOLD_ITALIC_STAR = BOLD_ITALIC_STAR;
const BOLD_ITALIC_UNDERSCORE = {
    format: ['bold', 'italic'],
    intraword: false,
    tag: '___',
    type: 'text-format'
};
exports.BOLD_ITALIC_UNDERSCORE = BOLD_ITALIC_UNDERSCORE;
const BOLD_STAR = {
    format: ['bold'],
    tag: '**',
    type: 'text-format'
};
exports.BOLD_STAR = BOLD_STAR;
const BOLD_UNDERSCORE = {
    format: ['bold'],
    intraword: false,
    tag: '__',
    type: 'text-format'
};
exports.BOLD_UNDERSCORE = BOLD_UNDERSCORE;
const STRIKETHROUGH = {
    format: ['strikethrough'],
    tag: '~~',
    type: 'text-format'
};
exports.STRIKETHROUGH = STRIKETHROUGH;
const ITALIC_STAR = {
    format: ['italic'],
    tag: '*',
    type: 'text-format'
};
exports.ITALIC_STAR = ITALIC_STAR;
const ITALIC_UNDERSCORE = {
    format: ['italic'],
    intraword: false,
    tag: '\\_',
    type: 'text-format'
};
exports.ITALIC_UNDERSCORE = ITALIC_UNDERSCORE;
// Order of text transformers matters:
//
// - code should go first as it prevents any transformations inside
// - then longer tags match (e.g. ** or __ should go before * or _)
const LINK = {
    dependencies: [lexical_linkLexicalLink_js_1.LinkNode],
    export: (node, exportChildren, exportFormat) => {
        if (!(0, lexical_linkLexicalLink_js_1.$isLinkNode)(node)) {
            return null;
        }
        const title = node.getTitle();
        const linkContent = title ? `[${node.getTextContent()}](${node.getURL()} "${title}")` : `[${node.getTextContent()}](${node.getURL()})`;
        const firstChild = node.getFirstChild();
        // Add text styles only if link has single text node inside. If it's more
        // then one we ignore it as markdown does not support nested styles for links
        if (node.getChildrenSize() === 1 && (0, lexicalLexical_js_1.$isTextNode)(firstChild)) {
            return exportFormat(firstChild, linkContent);
        }
        else {
            return linkContent;
        }
    },
    importRegExp: /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
    regExp: /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
    replace: (textNode, match) => {
        const [, linkText, linkUrl, linkTitle] = match;
        const linkNode = (0, lexical_linkLexicalLink_js_1.$createLinkNode)(linkUrl, {
            title: linkTitle
        });
        const linkTextNode = (0, lexicalLexical_js_1.$createTextNode)(linkText);
        linkTextNode.setFormat(textNode.getFormat());
        linkNode.append(linkTextNode);
        textNode.replace(linkNode);
    },
    trigger: ')',
    type: 'text-match'
};
exports.LINK = LINK;
const SECTION_HEADING = {
    dependencies: [lexical_linkLexicalLink_js_1.SectionHeadingNode],
    export: (node, exportChildren, exportFormat) => {
        if (!(0, lexical_linkLexicalLink_js_1.$isSectionHeadingNode)(node)) {
            return null;
        }
        const id = node.getId();
        const content = `[Section Heading Node](#${id})`;
        const firstChild = node.getFirstChild();
        if (node.getChildrenSize() === 1 && (0, lexicalLexical_js_1.$isTextNode)(firstChild)) {
            return exportFormat(firstChild, content);
        }
        else {
            return content;
        }
    },
    importRegExp: /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
    regExp: /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
    replace: (textNode, match) => {
        const [, linkText, linkUrl, linkTitle] = match;
        if (linkUrl.startsWith('#i')) {
            const sectionHeadingNode = (0, lexical_linkLexicalLink_js_1.$createSectionHeadingNode)(linkUrl.slice(1));
            const textNode = (0, lexicalLexical_js_1.$createTextNode)(linkText);
            textNode.setFormat(textNode.getFormat());
            sectionHeadingNode.append(textNode);
            textNode.replace(sectionHeadingNode);
        }
        else {
            const linkNode = (0, lexical_linkLexicalLink_js_1.$createLinkNode)(linkUrl, {
                title: linkTitle
            });
            const linkTextNode = (0, lexicalLexical_js_1.$createTextNode)(linkText);
            linkTextNode.setFormat(textNode.getFormat());
            linkNode.append(linkTextNode);
            textNode.replace(linkNode);
        }
    },
    trigger: ')',
    type: 'text-match'
};
const ABBREVIATION = {
    dependencies: [lexical_linkLexicalLink_js_1.AbbreviationNode],
    export: (node, exportChildren, exportFormat) => {
        if (!(0, lexical_linkLexicalLink_js_1.$isAbbreviationNode)(node)) {
            return null;
        }
        const title = node.getTitle();
        const innerText = node.getChildren().map(el => el.getTextContent()).join('');
        return `[>(${title}) ${innerText}]`;
    },
    importRegExp: /\[>\((\w+)\)\s(\w+)\]/,
    regExp: /\[>\((\w+)\)\s(\w+)\]/,
    replace: (textNode, match) => {
        const [, linkText, linkTitle] = match;
        const abbreviationNode = (0, lexical_linkLexicalLink_js_1.$createAbbreviationNode)(linkTitle);
        const abbrTextNode = (0, lexicalLexical_js_1.$createTextNode)(linkText);
        abbreviationNode.append(abbrTextNode);
        textNode.replace(abbreviationNode);
    },
    trigger: ']',
    type: 'text-match'
};
// Very primitive table setup
const TABLE_ROW_REG_EXP = /^(?:\|)(.+)(?:\|)\s?$/;
const TABLE_ROW_DIVIDER_REG_EXP = /^(\| ?:?-*:? ?)+\|\s?$/;
const SKIP_IMPORT_REGEX = /$.^/;
const TABLE = {
    dependencies: [lexical_tableLexicalTable_js_1.TableNode, lexical_tableLexicalTable_js_1.TableRowNode, lexical_tableLexicalTable_js_1.TableCellNode, lexicalLexical_js_1.TableWrapperNode],
    export: node => {
        var _a;
        if (!(0, lexicalLexical_js_1.$isTableWrapperNode)(node)) {
            return null;
        }
        const table = (_a = node.getChildren()) === null || _a === void 0 ? void 0 : _a[0];
        if (!!!(0, lexical_tableLexicalTable_js_1.$isTableNode)(table)) {
            return null;
        }
        const output = [];
        for (const row of table.getChildren()) {
            const rowOutput = [];
            if (!(0, lexical_tableLexicalTable_js_1.$isTableRowNode)(row)) {
                continue;
            }
            let isHeaderRow = false;
            for (const cell of row.getChildren()) {
                // It's TableCellNode so it's just to make flow happy
                if ((0, lexical_tableLexicalTable_js_1.$isTableCellNode)(cell)) {
                    rowOutput.push($convertToMarkdownString(FULL_EDITOR_TRANSFORMERS, cell).replace(/\n/g, '\\n'));
                    if (cell.__headerState === lexical_tableLexicalTable_js_1.TableCellHeaderStates.ROW) {
                        isHeaderRow = true;
                    }
                }
            }
            output.push(`| ${rowOutput.join(' | ')} |`);
            if (isHeaderRow) {
                output.push(`| ${rowOutput.map(_ => '---').join(' | ')} |`);
            }
        }
        return output.join('\n');
    },
    regExp: TABLE_ROW_REG_EXP,
    replace: (parentNode, _1, match) => {
        // Header row
        if (TABLE_ROW_DIVIDER_REG_EXP.test(match[0])) {
            const table = parentNode.getPreviousSibling();
            if (!table || !(0, lexical_tableLexicalTable_js_1.$isTableNode)(table)) {
                return;
            }
            const rows = table.getChildren();
            const lastRow = rows[rows.length - 1];
            if (!lastRow || !(0, lexical_tableLexicalTable_js_1.$isTableRowNode)(lastRow)) {
                return;
            }
            // Add header state to row cells
            lastRow.getChildren().forEach(cell => {
                if (!(0, lexical_tableLexicalTable_js_1.$isTableCellNode)(cell)) {
                    return;
                }
                cell.toggleHeaderStyle(lexical_tableLexicalTable_js_1.TableCellHeaderStates.ROW);
            });
            // Remove line
            parentNode.remove();
            return;
        }
        const matchCells = mapToTableCells(match[0]);
        if (matchCells == null) {
            return;
        }
        const rows = [matchCells];
        let sibling = parentNode.getPreviousSibling();
        let maxCells = matchCells.length;
        while (sibling) {
            if (!(0, lexicalLexical_js_1.$isParagraphNode)(sibling)) {
                break;
            }
            if (sibling.getChildrenSize() !== 1) {
                break;
            }
            const firstChild = sibling.getFirstChild();
            if (!(0, lexicalLexical_js_1.$isTextNode)(firstChild)) {
                break;
            }
            const cells = mapToTableCells(firstChild.getTextContent());
            if (cells == null) {
                break;
            }
            maxCells = Math.max(maxCells, cells.length);
            rows.unshift(cells);
            const previousSibling = sibling.getPreviousSibling();
            sibling.remove();
            sibling = previousSibling;
        }
        const table = (0, lexical_tableLexicalTable_js_1.$createTableNode)();
        for (const cells of rows) {
            const tableRow = (0, lexical_tableLexicalTable_js_1.$createTableRowNode)();
            table.append(tableRow);
            for (let i = 0; i < maxCells; i++) {
                tableRow.append(i < cells.length ? cells[i] : $createTableCell(''));
            }
        }
        const previousSibling = parentNode.getPreviousSibling();
        if ((0, lexical_tableLexicalTable_js_1.$isTableNode)(previousSibling) && getTableColumnsSize(previousSibling) === maxCells) {
            previousSibling.append(...table.getChildren());
            parentNode.remove();
        }
        else {
            parentNode.replace(table);
        }
        table.selectEnd();
    },
    type: 'element'
};
const EQUATION_BLOCK = {
    dependencies: [lexical_mathLexicalMath_js_1.MathNode],
    export: node => {
        if (!!!(0, lexical_mathLexicalMath_js_1.$isMathNode)(node)) {
            return null;
        }
        return `$$\n${node.getEquation()}\n$$`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
/* Added 3/6/2025 */
const HORIZONTAL_RULE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.HorizontalRuleNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isHorizontalRuleNode)(node)) {
            return null;
        }
        var str = '-----';
        const color = node.getColor();
        if (color !== 'var(--divider)') {
            str += `[${color}]`;
        }
        const size = node.getWidth();
        if (size >= 1 && size <= 10) {
            str += `[${size}]`;
        }
        return str;
    },
    regExp: /^-----(\[#[0-9A-F]{6}\])?(\[[1-10]\])?/,
    replace: (parentNode, _1, match) => {
        var color = 'var(--divider)';
        var size = 2;
        if (Array.isArray(match) && match.length) {
            const a = match[0];
            if (match.length === 2) {
                const b = match[1];
                if (lexicalLexical_js_1.VALID_HEX_REGEX.test(a.slice(1, a.length - 1))) {
                    color = a.slice(1, a.length - 1);
                }
                if (parseInt(b) >= 1 && parseInt(b) <= 10) {
                    size = parseInt(b);
                }
            }
            else if (a) {
                if (lexicalLexical_js_1.VALID_HEX_REGEX.test(a.slice(1, a.length - 1))) {
                    color = a.slice(1, a.length - 1);
                }
                else if (parseInt(a) >= 1 && parseInt(a) <= 10) {
                    size = parseInt(a);
                }
            }
        }
        const node = (0, lexical_decoratorsLexicalDecorators_js_1.$createHorizontalRuleNode)({
            color,
            width: size
        });
        parentNode.replace(node);
        node.select(0, 0);
    },
    type: 'element'
};
const NEWS_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.NewsNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isNewsNode)(node)) {
            return null;
        }
        const url = node.getURL().replace(/\)/g, '\\)');
        const title = node.getTitle().replace(/\)/g, '\\)');
        const description = node.getDescription().replace(/\)/g, '\\)');
        const imageURL = node.getImageURL().replace(/\)/g, '\\)');
        const host = node.getHost().replace(/\)/g, '\\)');
        return `!![News Node](${url})(${title})(${description})(${imageURL})(${host})`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const YOUTUBE_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.YouTubeNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isYouTubeNode)(node)) {
            return null;
        }
        return `!![YouTube Node](${node.getId().replace(/\)/g, '\\)')})`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const TWITTER_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.TwitterNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isTwitterNode)(node)) {
            return null;
        }
        return node.exportDOM().element.outerHTML;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const TIKTOK_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.TikTokNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isTikTokNode)(node)) {
            return null;
        }
        return node.exportDOM().element.outerHTML;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const INSTAGRAM_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.InstagramNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isInstagramNode)(node)) {
            return null;
        }
        return node.exportDOM().element.outerHTML;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const CAROUSEL_IMAGE_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.CarouselImageNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isCarouselImageNode)(node)) {
            return null;
        }
        return `!![CarouselImage Node](${JSON.stringify(node.getImageList(), null, '')})`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const AUDIO_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.AudioNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isAudioNode)(node)) {
            return null;
        }
        return `!![Audio Node](${node.getSrc().replace(/\)/g, '\\)')})(${node.getTitle().replace(/\)/g, '\\)')})`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const VIDEO_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.VideoNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isVideoNode)(node)) {
            return null;
        }
        return `!![Video Node](${node.getSrc().replace(/\)/g, '\\)')})(${node.getTitle().replace(/\)/g, '\\)')})(${node.getDescription().replace(/\)/g, '\\)')})(${node.getHeight()})`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
const HTML_NODE = {
    dependencies: [lexical_decoratorsLexicalDecorators_js_1.HtmlNode],
    export: node => {
        if (!!!(0, lexical_decoratorsLexicalDecorators_js_1.$isHtmlNode)(node)) {
            return null;
        }
        return `<div data-custom-code data-editing="false"><div data-html> ${node.getHtml()}</div></div>`;
    },
    regExp: SKIP_IMPORT_REGEX,
    replace: (parentNode, _1, match) => {
        parentNode.selectEnd();
    },
    type: 'element'
};
function getTableColumnsSize(table) {
    const row = table.getFirstChild();
    return (0, lexical_tableLexicalTable_js_1.$isTableRowNode)(row) ? row.getChildrenSize() : 0;
}
const $createTableCell = textContent => {
    textContent = textContent.replace(/\\n/g, '\n');
    const cell = (0, lexical_tableLexicalTable_js_1.$createTableCellNode)(lexical_tableLexicalTable_js_1.TableCellHeaderStates.NO_STATUS);
    $convertFromMarkdownString(textContent, FULL_EDITOR_TRANSFORMERS, cell);
    return cell;
};
const mapToTableCells = textContent => {
    const match = textContent.match(TABLE_ROW_REG_EXP);
    if (!match || !match[1]) {
        return null;
    }
    return match[1].split('|').map(text => $createTableCell(text));
};
/** @module @lexical/markdown */
const ELEMENT_TRANSFORMERS = [HEADING, QUOTE, CODE, UNORDERED_LIST, ORDERED_LIST, CHECK_LIST, EQUATION_BLOCK, HORIZONTAL_RULE, NEWS_NODE, YOUTUBE_NODE, TWITTER_NODE, TIKTOK_NODE, INSTAGRAM_NODE, CAROUSEL_IMAGE_NODE, AUDIO_NODE, VIDEO_NODE, HTML_NODE];
exports.ELEMENT_TRANSFORMERS = ELEMENT_TRANSFORMERS;
// Order of text format transformers matters:
//
// - code should go first as it prevents any transformations inside
// - then longer tags match (e.g. ** or __ should go before * or _)
const TEXT_FORMAT_TRANSFORMERS = [INLINE_CODE, BOLD_ITALIC_STAR, BOLD_ITALIC_UNDERSCORE, BOLD_STAR, BOLD_UNDERSCORE, INLINE_QUOTE, SUPERSCRIPT_COMMAND, SUBSCRIPT_COMMAND, KBD_COMMAND, ITALIC_STAR, ITALIC_UNDERSCORE, STRIKETHROUGH];
exports.TEXT_FORMAT_TRANSFORMERS = TEXT_FORMAT_TRANSFORMERS;
const TEXT_MATCH_TRANSFORMERS = [LINK, ABBREVIATION, SECTION_HEADING];
exports.TEXT_MATCH_TRANSFORMERS = TEXT_MATCH_TRANSFORMERS;
const TRANSFORMERS = [...ELEMENT_TRANSFORMERS, ...TEXT_FORMAT_TRANSFORMERS, ...TEXT_MATCH_TRANSFORMERS];
exports.TRANSFORMERS = TRANSFORMERS;
const FULL_EDITOR_TRANSFORMERS = [...TRANSFORMERS, EQUATION, IMAGE, TABLE];
exports.FULL_EDITOR_TRANSFORMERS = FULL_EDITOR_TRANSFORMERS;
const COMMENT_EDITOR_TRANSFORMERS = [QUOTE, CODE, UNORDERED_LIST, ORDERED_LIST, CHECK_LIST, ...TEXT_FORMAT_TRANSFORMERS, LINK, EQUATION];
exports.COMMENT_EDITOR_TRANSFORMERS = COMMENT_EDITOR_TRANSFORMERS;
const TEXT_ONLY_EDITOR_TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS];
exports.TEXT_ONLY_EDITOR_TRANSFORMERS = TEXT_ONLY_EDITOR_TRANSFORMERS;
const TEXT_WITH_LINKS_EDITOR_TRANSFORMERS = [...TEXT_FORMAT_TRANSFORMERS, LINK];
exports.TEXT_WITH_LINKS_EDITOR_TRANSFORMERS = TEXT_WITH_LINKS_EDITOR_TRANSFORMERS;
const TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS = [QUOTE, CODE, UNORDERED_LIST, ORDERED_LIST, CHECK_LIST, ...TEXT_FORMAT_TRANSFORMERS, LINK, EQUATION];
exports.TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS = TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS;
function $convertFromMarkdownString(markdown, transformers = TRANSFORMERS, node) {
    const importMarkdown = createMarkdownImport(transformers);
    return importMarkdown(markdown, node);
}
exports.$convertFromMarkdownString = $convertFromMarkdownString;
function $convertToMarkdownString(transformers = TRANSFORMERS, node) {
    const exportMarkdown = createMarkdownExport(transformers);
    return exportMarkdown(node);
}
exports.$convertToMarkdownString = $convertToMarkdownString;
