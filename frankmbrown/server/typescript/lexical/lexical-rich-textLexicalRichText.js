/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { $insertDataTransferForRichText, $getLexicalContent, $getHtmlContent, copyToClipboard, $insertGeneratedNodes } from './lexical-clipboardLexicalClipboard.js';
import { $setBlocksType, $shouldOverrideDefaultCharacterSelection, $moveCharacter } from './lexical-selectionLexicalSelection.js';
import { addClassNamesToElement, isHTMLElement, $findMatchingParent, $getNearestBlockElementAncestorOrThrow, mergeRegister, objectKlassEquals } from './lexical-utilsLexicalUtils.js';
import { createCommand, ElementNode, $applyNodeReplacement, $createParagraphNode, ElementNodeWithBlockStyle, getCssTextForElementNodeWithBlockStyle, MAX_INDENT_PARAGRAPH_LEVEL, extractStylesFromCssText, $getRoot, $createTextNode, CLICK_COMMAND, $isDecoratorNode, COMMAND_PRIORITY_CRITICAL, DELETE_CHARACTER_COMMAND, $getSelection, $isRangeSelection, COMMAND_PRIORITY_EDITOR, DELETE_WORD_COMMAND, DELETE_LINE_COMMAND, CONTROLLED_TEXT_INSERTION_COMMAND, DEPRECATED_$isGridSelection, REMOVE_TEXT_COMMAND, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND, $isNodeSelection, $isElementNode, INSERT_LINE_BREAK_COMMAND, INSERT_PARAGRAPH_COMMAND, INSERT_TAB_COMMAND, $insertNodes, $createTabNode, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND, KEY_BACKSPACE_COMMAND, $isRootNode, KEY_DELETE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, DROP_COMMAND, $getNearestNodeFromDOMNode, $createRangeSelection, $isTextNode, $normalizeSelection__EXPERIMENTAL, $setSelection, DRAGSTART_COMMAND, DRAGOVER_COMMAND, SELECT_ALL_COMMAND, $selectAll, CUT_COMMAND, PASTE_COMMAND, isSelectionCapturedInDecoratorInput, CLEAR_EDITOR_COMMAND, FOCUS_COMMAND, COMMAND_PRIORITY_NORMAL, BLUR_COMMAND, SELECTION_CHANGE_COMMAND, $isParagraphNode, COMMAND_PRIORITY_HIGH, KEY_ARROW_UP_COMMAND, $getAdjacentNode, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, COPY_COMMAND } from './lexicalLexical.js';
import { IS_REAL_BROWSER, LAUNCH_TEXT_INSERTION_COMMAND, REGISTER_TOOLBAR_LISTENERS, getDOMRangeRectAbsolute, getCurrentEditor } from './lexical-sharedLexicalShared.js';
import { offset, shift, flip, computePosition, autoUpdate } from '@floating-ui/dom';
import { INSERT_HTML_COMMAND } from './lexical-decoratorsLexicalDecorators.js';
import { $generateNodesFromDOM } from './lexical-htmlLexicalHtml.js';

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
  } else if (document.caretPositionFromPoint !== 'undefined') {
    // @ts-ignore FF - no types
    const range = document.caretPositionFromPoint(x, y);
    if (range === null) {
      return null;
    }
    return {
      node: range.offsetNode,
      offset: range.offset
    };
  } else {
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
const DRAG_DROP_PASTE = createCommand('DRAG_DROP_PASTE_FILE');
/** @noInheritDoc */
class QuoteNode extends ElementNode {
  __version = QUOTE_NODE_VERSION;
  static getType() {
    return 'quote';
  }
  static clone(node) {
    return new QuoteNode(node.__key);
  }
  constructor(key) {
    super(key);
  }

  // View

  createDOM(config) {
    const element = document.createElement('blockquote');
    addClassNamesToElement(element, config.theme.quote);
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
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
    const {
      element
    } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));
      const formatType = this.getFormatType();
      element.style.textAlign = formatType;
      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      element.setAttribute('data-e-indent', this.getIndent().toString());
      element.setAttribute('data-v', String(QUOTE_NODE_VERSION));
      if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
      if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
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
    if (serializedNode?.first_element) node.setFirstElement(serializedNode?.first_element);
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
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }
  collapseAtStart() {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach(child => paragraph.append(child));
    this.replace(paragraph);
    return true;
  }
}
function $createQuoteNode() {
  return $applyNodeReplacement(new QuoteNode());
}
function $isQuoteNode(node) {
  return node instanceof QuoteNode;
}
/** @noInheritDoc */
class HeadingNode extends ElementNodeWithBlockStyle {
  /** @internal */

  __version = HEADING_NODE_VERSION;
  __sectionHeader = false;
  static getType() {
    return 'heading';
  }
  static clone(node) {
    const newNode = new HeadingNode(node.__tag, node.__sectionHeader, node.__key, node.getBlockStyle());
    return newNode;
  }
  constructor(tag, sectionHeader, key, styleObj) {
    super(key);
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
      addClassNamesToElement(element, className);
    }
    if (this.__sectionHeader) {
      element.classList.add('rte-section-header');
    }
    const cssText = getCssTextForElementNodeWithBlockStyle(this, "heading");
    element.style.cssText = cssText;
    element.setAttribute("data-v", String(HEADING_NODE_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(prevNode, dom) {
    const cssText = getCssTextForElementNodeWithBlockStyle(this.getLatest(), "heading");
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
    const {
      element
    } = super.exportDOM(editor);
    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));
      const cssText = getCssTextForElementNodeWithBlockStyle(this, "heading");
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
    node.setFirstElement(serializedNode?.first_element);
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
    const newElement = anchorOffet === this.getTextContentSize() || !selection ? $createParagraphNode() : $createHeadingNode(this.getTag());
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    if (anchorOffet === 0 && !this.isEmpty() && selection) {
      const paragraph = $createParagraphNode();
      paragraph.select();
      this.replace(paragraph, true);
    }
    return newElement;
  }
  collapseAtStart() {
    const newElement = !this.isEmpty() ? $createHeadingNode(this.getTag()) : $createParagraphNode();
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
    self.__indent = Math.min(indentLevel, MAX_INDENT_PARAGRAPH_LEVEL);
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
      const obj = extractStylesFromCssText(element.style.cssText, nodeName);
      node.setFormat(obj.textAlign);
      // Set Indent
      const indentStr = element.getAttribute('data-e-indent');
      if (indentStr) {
        const indentNum = parseInt(indentStr);
        if (!!!isNaN(indentNum) && isFinite(indentNum)) {
          node.setIndent(Math.max(0, Math.min(indentNum, MAX_INDENT_PARAGRAPH_LEVEL)));
        } else {
          node.setIndent(0);
        }
      } else {
        node.setIndent(0);
      }
      const dir = element.getAttribute('dir');
      if (dir === "ltr" || dir === "rtl") node.setDirection(dir);else node.setDirection("ltr");
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
  if (element.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (element.classList.contains('last-rte-element')) node.setLastElement(true);
  return {
    node
  };
}
function $createHeadingNode(headingTag) {
  return $applyNodeReplacement(new HeadingNode(headingTag));
}
function $isHeadingNode(node) {
  return node instanceof HeadingNode;
}
function onPasteForRichText(event, editor) {
  event.preventDefault();
  editor.update(() => {
    const selection = $getSelection();
    const clipboardData = event instanceof InputEvent || event instanceof KeyboardEvent ? null : event.clipboardData;
    if (clipboardData != null && ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
      $insertDataTransferForRichText(clipboardData, selection, editor);
    }
  }, {
    tag: 'paste'
  });
}
async function onCutForRichText(event, editor) {
  await copyToClipboard(editor, objectKlassEquals(event, ClipboardEvent) ? event : null);
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      selection.removeText();
    } else if ($isNodeSelection(selection)) {
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
  } else if (event instanceof InputEvent) {
    dataTransfer = event.dataTransfer;
  } else if (event instanceof ClipboardEvent) {
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
function handleIndentAndOutdent(indentOrOutdent) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
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
    const parentBlock = $getNearestBlockElementAncestorOrThrow(node);
    const parentKey = parentBlock.getKey();
    if (parentBlock.canIndent() && !alreadyHandled.has(parentKey)) {
      alreadyHandled.add(parentKey);
      indentOrOutdent(parentBlock);
    }
  }
  return alreadyHandled.size > 0;
}
function $isTargetWithinDecorator(target) {
  const node = $getNearestNodeFromDOMNode(target);
  return $isDecoratorNode(node);
}
function $isSelectionAtEndOfRoot(selection) {
  const focus = selection.focus;
  return focus.key === 'root' && focus.offset === $getRoot().getChildrenSize();
}
const HANDLE_EMPTY_COMMAND = createCommand('HANDLE_EMPTY_COMMAND');
const INSERT_QUOTE_COMMAND = createCommand('INSERT_QUOTE_COMMAND');
const CREATE_HEADING_COMMAND = createCommand('CREATE_HEADING_COMMAND');
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
    if (ALLOWED_HEADERS.has(payload)) editor.dispatchCommand(CREATE_HEADING_COMMAND, payload);
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
      } else {
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
      } else {
        dispatchQuoteButton.addEventListener('click', getDispatchQuote(editor));
      }
      editor.dispatchCommand(INSERT_QUOTE_COMMAND, undefined);
    }
  }
}
function insertPlaceholder(editor) {
  editor.update(() => {
    const rootElement = editor.getRootElement();
    const root = $getRoot();
    if (root.isEmpty()) {
      const paragraph = $createParagraphNode();
      if (rootElement && rootElement.hasAttribute('data-placeholder')) {
        const textNode = $createTextNode(rootElement.getAttribute('data-placeholder'));
        paragraph.append(textNode);
      } else {
        const textNode = $createTextNode('Insert Content Here...');
        paragraph.append(textNode);
      }
      root.append(paragraph);
    }
  });
}
function closePasteOptionsMenu() {
  const menu = document.getElementById(PASTE_CONTEXT_MENU_ID);
  if (menu) {
    if (autoUpdateObject[PASTE_CONTEXT_MENU_ID]) {
      try {
        autoUpdateObject[PASTE_CONTEXT_MENU_ID]();
        delete autoUpdateObject[PASTE_CONTEXT_MENU_ID];
      } catch (error) {}
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
        const rect = getDOMRangeRectAbsolute(selection, root);
        if (PORTAL_EL && rect) {
          const ancestor = selection.getRangeAt(0).commonAncestorContainer;
          if (rect.left === 0 && rect.right === 0 && ancestor instanceof HTMLElement) {
            const rectNew = ancestor.getBoundingClientRect();
            rect.left = rectNew.left;
            rect.right = rectNew.right;
            rect.top += rectNew.top;
          }
          if (rect.top === 0 && rect.left === 0) closePasteOptionsMenu();
          this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          this.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
        }
      } else closePasteOptionsMenu();
      const options = {
        placement: "bottom-end",
        middleware: [offset(6), shift(), flip()]
      };
      computePosition(this, menu, options).then(({
        x,
        y
      }) => {
        const assignObj = {
          left: `${x}px`,
          top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
          opacity: "1"
        };
        Object.assign(menu.style, assignObj);
      });
    }.bind(PORTAL_EL);
    updatePopover();
    const cleanup = autoUpdate(PORTAL_EL, menu, updatePopover);
    if (autoUpdateObject[PASTE_CONTEXT_MENU_ID]) delete autoUpdateObject[PASTE_CONTEXT_MENU_ID];
    autoUpdateObject[PASTE_CONTEXT_MENU_ID] = cleanup;
  } else {
    closePasteOptionsMenu();
  }
}
function handlePasteText() {
  closePasteOptionsMenu();
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if (($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) && TEXT_CONTENT_TO_INSERT) {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
          const text = dom.body.innerText.trim();
          if ($isRangeSelection(selection)) {
            const parts = text.split(/(\r?\n|\t)/);
            if (parts[parts.length - 1] === '') {
              parts.pop();
            }
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              if (part === '\n' || part === '\r\n') {
                selection.insertParagraph();
              } else if (part === '\t') {
                selection.insertNodes([$createTabNode()]);
              } else {
                selection.insertText(part);
              }
            }
          } else {
            selection.insertRawText(text);
          }
        } catch (_unused) {
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
    } else {
      for (let child of children) {
        if (child.tagName === "P") {
          child.className = "lex-grid-p";
          el.style.width = String(Math.min(7 * el.innerText.length, 265)).concat('px');
        } else {
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
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if (($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) && TEXT_CONTENT_TO_INSERT) {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
          sanitizePastedHTML(dom, true);
          const nodes = $generateNodesFromDOM(editor, dom);
          return $insertGeneratedNodes(editor, nodes, selection);
        } catch (_unused2) {
          // Fail silently.
        }
      }
    });
  }
}
function handlePasteHTMLWithStyle() {
  closePasteOptionsMenu();
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if (($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) && TEXT_CONTENT_TO_INSERT) {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
          sanitizePastedHTML(dom, false);
          const nodes = $generateNodesFromDOM(editor, dom);
          return $insertGeneratedNodes(editor, nodes, selection);
        } catch (_unused3) {
          // Fail silently.
        }
      }
    });
  }
}
function handlePasteAsHtmlNode() {
  closePasteOptionsMenu();
  if (TEXT_CONTENT_TO_INSERT) {
    const editor = getCurrentEditor();
    if (editor) {
      import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
        const newHTML = res.validateUgcCode(TEXT_CONTENT_TO_INSERT);
        editor.dispatchCommand(INSERT_HTML_COMMAND, newHTML);
      }).catch(e => {
        console.error(e);
      });
    }
  }
}
const COPY_EDITOR_COMMAND = createCommand('COPY_EDITOR_COMMAND');
function onCopyEditorContents(e) {
  const editor = getCurrentEditor();
  if (editor) editor.dispatchCommand(COPY_EDITOR_COMMAND, null);
}
function registerRichTextListeners(editor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    setDispatchButtons(wrapper, editor);
    const copyEditorButton = wrapper.querySelector('button[data-copy-editor]');
    if (copyEditorButton) copyEditorButton.addEventListener('click', onCopyEditorContents);
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
    if (pasteText) pasteText.addEventListener('click', handlePasteText);
    const pasteHtmlNoStyle = pasteContextMenu.querySelector('button[data-type="html-no-style"]');
    if (pasteHtmlNoStyle) pasteHtmlNoStyle.addEventListener('click', handlePasteHTMLNoStyle);
    const pasteHtmlWithStyle = pasteContextMenu.querySelector('button[data-type="html-style"]');
    if (pasteHtmlWithStyle) pasteHtmlWithStyle.addEventListener('click', handlePasteHTMLWithStyle);
    const pasteAsHtmlNode = pasteContextMenu.querySelector('button[data-type="html-node"]');
    if (pasteAsHtmlNode) pasteAsHtmlNode.addEventListener('click', handlePasteAsHtmlNode);
  }
  const arr = [editor.registerCommand(CLICK_COMMAND, payload => {
    if (payload) {
      const root = $getRoot();
      if (root) {
        const nodes = root.getChildren();
        if ($isDecoratorNode(nodes[nodes.length - 1])) {
          const lastNode = nodes[nodes.length - 1];
          const nodeKey = lastNode.getKey();
          const element = editor.getElementByKey(nodeKey);
          if (element && payload.clientY > element.getBoundingClientRect().bottom + window.scrollY) {
            root.append($createParagraphNode());
            return true;
          }
        }
      }
    }
    return false;
  }, COMMAND_PRIORITY_CRITICAL), editor.registerCommand(DELETE_CHARACTER_COMMAND, isBackward => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.deleteCharacter(isBackward);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(DELETE_WORD_COMMAND, isBackward => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.deleteWord(isBackward);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(DELETE_LINE_COMMAND, isBackward => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.deleteLine(isBackward);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(CONTROLLED_TEXT_INSERTION_COMMAND, eventOrText => {
    const selection = $getSelection();
    if (typeof eventOrText === 'string') {
      if ($isRangeSelection(selection)) {
        selection.insertText(eventOrText);
      } else if (DEPRECATED_$isGridSelection(selection)) ;
    } else {
      if (!$isRangeSelection(selection) && !DEPRECATED_$isGridSelection(selection)) {
        return false;
      }
      const dataTransfer = eventOrText.dataTransfer;
      if (dataTransfer != null) {
        $insertDataTransferForRichText(dataTransfer, selection, editor);
      } else if ($isRangeSelection(selection)) {
        const data = eventOrText.data;
        if (data) {
          selection.insertText(data);
        }
        return true;
      }
    }
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(REMOVE_TEXT_COMMAND, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.removeText();
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(FORMAT_TEXT_COMMAND, format => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.formatText(format);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(FORMAT_ELEMENT_COMMAND, format => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
      return false;
    }
    const nodes = selection.getNodes();
    for (const node of nodes) {
      const element = $findMatchingParent(node, parentNode => $isElementNode(parentNode) && !parentNode.isInline());
      if (element !== null) {
        element.setFormat(format);
      }
    }
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INSERT_LINE_BREAK_COMMAND, selectStart => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    selection.insertLineBreak(selectStart);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INSERT_PARAGRAPH_COMMAND, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const node = selection.insertParagraph();
    if (node) node.setFormat('left');
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INSERT_TAB_COMMAND, () => {
    $insertNodes([$createTabNode()]);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INDENT_CONTENT_COMMAND, () => {
    return handleIndentAndOutdent(block => {
      const indent = block.getIndent();
      block.setIndent(indent + 1);
    });
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(OUTDENT_CONTENT_COMMAND, () => {
    return handleIndentAndOutdent(block => {
      const indent = block.getIndent();
      if (indent > 0) {
        block.setIndent(indent - 1);
      }
    });
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_BACKSPACE_COMMAND, event => {
    if ($isTargetWithinDecorator(event.target)) {
      return false;
    }
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    event.preventDefault();
    const {
      anchor
    } = selection;
    const anchorNode = anchor.getNode();
    if (selection.isCollapsed() && anchor.offset === 0 && !$isRootNode(anchorNode)) {
      const element = $getNearestBlockElementAncestorOrThrow(anchorNode);
      if (element.getIndent() > 0) {
        return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      }
    }
    return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_DELETE_COMMAND, event => {
    if ($isTargetWithinDecorator(event.target)) {
      return false;
    }
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    event.preventDefault();
    return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, false);
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ENTER_COMMAND, event => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
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
        return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
      }
    }
    return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return false;
    }
    editor.blur();
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(DROP_COMMAND, event => {
    const [, files] = eventFiles(event);
    if (files.length > 0) {
      const x = event.clientX;
      const y = event.clientY;
      const eventRange = caretFromPoint(x, y);
      if (eventRange !== null) {
        const {
          offset: domOffset,
          node: domNode
        } = eventRange;
        const node = $getNearestNodeFromDOMNode(domNode);
        if (node !== null) {
          const selection = $createRangeSelection();
          if ($isTextNode(node)) {
            selection.anchor.set(node.getKey(), domOffset, 'text');
            selection.focus.set(node.getKey(), domOffset, 'text');
          } else {
            const parentKey = node.getParentOrThrow().getKey();
            const offset = node.getIndexWithinParent() + 1;
            selection.anchor.set(parentKey, offset, 'element');
            selection.focus.set(parentKey, offset, 'element');
          }
          const normalizedSelection = $normalizeSelection__EXPERIMENTAL(selection);
          $setSelection(normalizedSelection);
        }
        editor.dispatchCommand(DRAG_DROP_PASTE, files);
      }
      event.preventDefault();
      return true;
    }
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      return true;
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(DRAGSTART_COMMAND, event => {
    const [isFileTransfer] = eventFiles(event);
    const selection = $getSelection();
    if (isFileTransfer && !$isRangeSelection(selection)) {
      return false;
    }
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(DRAGOVER_COMMAND, event => {
    const [isFileTransfer] = eventFiles(event);
    const selection = $getSelection();
    if (isFileTransfer && !$isRangeSelection(selection)) {
      return false;
    }
    const x = event.clientX;
    const y = event.clientY;
    const eventRange = caretFromPoint(x, y);
    if (eventRange !== null) {
      const node = $getNearestNodeFromDOMNode(eventRange.node);
      if ($isDecoratorNode(node)) {
        // Show browser caret as the user is dragging the media across the screen. Won't work
        // for DecoratorNode nor it's relevant.
        event.preventDefault();
      }
    }
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(SELECT_ALL_COMMAND, () => {
    $selectAll();
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(CUT_COMMAND, event => {
    onCutForRichText(event, editor);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(PASTE_COMMAND, event => {
    const [, files, hasTextContent] = eventFiles(event);
    if (files.length > 0 && !hasTextContent) {
      editor.dispatchCommand(DRAG_DROP_PASTE, files);
      return true;
    }

    // if inputs then paste within the input ignore creating a new node on paste event
    if (isSelectionCapturedInDecoratorInput(event.target)) {
      return false;
    }
    const selection = $getSelection();
    if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
      onPasteForRichText(event, editor);
      return true;
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(CLEAR_EDITOR_COMMAND, () => {
    const root = $getRoot();
    root.clear();
    root.append($createParagraphNode().append($createTextNode()));
    root.selectEnd();
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(FOCUS_COMMAND, () => {
    const root = $getRoot();
    const IS_EMPTY = root.isEmpty();
    if (IS_EMPTY) {
      const p = $createParagraphNode();
      const text = $createTextNode();
      p.append(text);
      root.append(p);
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), registerRichTextNotEditable(editor), editor.registerCommand(LAUNCH_TEXT_INSERTION_COMMAND, ({
    rect,
    html
  }) => {
    TEXT_CONTENT_TO_INSERT = html;
    const PORTAL_EL = document.getElementById('text-table-selection-ref');
    if (PORTAL_EL) {
      PORTAL_EL.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
      PORTAL_EL.style.left = ((rect.left + rect.right) / 2).toString().concat('px');
      openPasteOptionsMenu(PORTAL_EL, editor);
    }
    return true;
  }, COMMAND_PRIORITY_NORMAL), editor.registerCommand(FOCUS_COMMAND, () => {
    if (CLOSE_PASTE_MENU_BLUR_TIMEOUT) clearTimeout(CLOSE_PASTE_MENU_BLUR_TIMEOUT);
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(BLUR_COMMAND, () => {
    CLOSE_PASTE_MENU_BLUR_TIMEOUT = setTimeout(() => {
      closePasteOptionsMenu();
      CLOSE_PASTE_MENU_BLUR_TIMEOUT = null;
    }, 500);
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    closePasteOptionsMenu();
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
    registerRichTextListeners(editor);
    return false;
  }, COMMAND_PRIORITY_EDITOR)];
  if (editor.hasNode(HeadingNode)) {
    arr.push(editor.registerCommand(CREATE_HEADING_COMMAND, payload => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (payload === "p") {
          $setBlocksType(selection, () => $createParagraphNode());
          return true;
        } else {
          $setBlocksType(selection, () => $createHeadingNode(payload));
          return true;
        }
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  }
  if (editor.hasNode(QuoteNode)) {
    arr.push(editor.registerCommand(INSERT_QUOTE_COMMAND, () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  }
  if (editor._rootElement && !!!editor._rootElement.hasAttribute('data-no-color')) {
    arr.push(editor.registerCommand(KEY_ENTER_COMMAND, () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const nodes = selection.getNodes();
        if (nodes.length) {
          const node = nodes[0];
          if ($isTextNode(node) && ($isParagraphNode(node.getParent()) || node.getParent()?.getType() === "heading")) {
            const para = node.getParent();
            const textContent = para.getTextContent();
            if (/css\[.*\]/.test(textContent)) {
              const cssStr = textContent.slice(4, textContent.length - 1);
              if (para.getType() === "paragraph") {
                const blockStyle = extractStylesFromCssText(cssStr, 'p');
                para.setBlockStyle(blockStyle);
                return true;
              } else if (para.getType() === "heading") {
                const tag = para.getTag();
                const blockStyle = extractStylesFromCssText(cssStr, tag);
                para.setBlockStyle(blockStyle);
                return true;
              }
            }
          }
        }
      }
      return false;
    }, COMMAND_PRIORITY_HIGH));
  }
  arr.push(editor.registerCommand(COPY_EDITOR_COMMAND, () => {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    editor.update(() => {
      $selectAll();
      const lexicalString = $getLexicalContent(editor);
      const htmlString = $getHtmlContent(editor);
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
  }, COMMAND_PRIORITY_EDITOR));
  return mergeRegister(...arr);
}
function registerRichTextNotEditable(editor) {
  const arr = [editor.registerCommand(CLICK_COMMAND, payload => {
    const selection = $getSelection();
    if ($isNodeSelection(selection)) {
      selection.clear();
      return true;
    }
    return false;
  }, 0), editor.registerCommand(KEY_ARROW_UP_COMMAND, event => {
    const selection = $getSelection();
    if ($isNodeSelection(selection) && !$isTargetWithinDecorator(event.target)) {
      // If selection is on a node, let's try and move selection
      // back to being a range selection.
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        nodes[0].selectPrevious();
        return true;
      }
    } else if ($isRangeSelection(selection)) {
      const possibleNode = $getAdjacentNode(selection.focus, true);
      if (!event.shiftKey && $isDecoratorNode(possibleNode) && !possibleNode.isIsolated() && !possibleNode.isInline()) {
        possibleNode.selectPrevious();
        event.preventDefault();
        return true;
      }
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ARROW_DOWN_COMMAND, event => {
    const selection = $getSelection();
    if ($isNodeSelection(selection)) {
      // If selection is on a node, let's try and move selection
      // back to being a range selection.
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        nodes[0].selectNext(0, 0);
        return true;
      }
    } else if ($isRangeSelection(selection)) {
      if ($isSelectionAtEndOfRoot(selection)) {
        event.preventDefault();
        return true;
      }
      const possibleNode = $getAdjacentNode(selection.focus, false);
      if (!event.shiftKey && $isDecoratorNode(possibleNode) && !possibleNode.isIsolated() && !possibleNode.isInline()) {
        possibleNode.selectNext();
        event.preventDefault();
        return true;
      }
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ARROW_LEFT_COMMAND, event => {
    const selection = $getSelection();
    if ($isNodeSelection(selection)) {
      // If selection is on a node, let's try and move selection
      // back to being a range selection.
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        event.preventDefault();
        nodes[0].selectPrevious();
        return true;
      }
    }
    if (!$isRangeSelection(selection)) {
      return false;
    }
    if ($shouldOverrideDefaultCharacterSelection(selection, true)) {
      const isHoldingShift = event.shiftKey;
      event.preventDefault();
      $moveCharacter(selection, isHoldingShift, true);
      return true;
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, event => {
    const selection = $getSelection();
    if ($isNodeSelection(selection) && !$isTargetWithinDecorator(event.target)) {
      // If selection is on a node, let's try and move selection
      // back to being a range selection.
      const nodes = selection.getNodes();
      if (nodes.length > 0) {
        event.preventDefault();
        nodes[0].selectNext(0, 0);
        return true;
      }
    }
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const isHoldingShift = event.shiftKey;
    if ($shouldOverrideDefaultCharacterSelection(selection, false)) {
      event.preventDefault();
      $moveCharacter(selection, isHoldingShift, false);
      return true;
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(COPY_COMMAND, event => {
    copyToClipboard(editor, objectKlassEquals(event, ClipboardEvent) ? event : null);
    return true;
  }, COMMAND_PRIORITY_EDITOR)];
  return mergeRegister(...arr);
}

export { $createHeadingNode, $createQuoteNode, $isHeadingNode, $isQuoteNode, COPY_EDITOR_COMMAND, CREATE_HEADING_COMMAND, DRAG_DROP_PASTE, HANDLE_EMPTY_COMMAND, HeadingNode, INSERT_QUOTE_COMMAND, QuoteNode, eventFiles, insertPlaceholder, registerRichTextEditable, registerRichTextNotEditable };
