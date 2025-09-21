/** @module @lexical/rich-text */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  BlockNodeStyleType,
  CommandPayloadType,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  PasteCommandType,
  RangeSelection,
  SerializedElementNode,
  SerializedElementNodeWithBlockStyle,
  Spread,
  TextFormatType
} from 'lexical';

import {
  $getHtmlContent,
  $getLexicalContent,
  $insertDataTransferForRichText,
  $insertGeneratedNodes,
  copyToClipboard,
} from '@lexical/clipboard';
import {
  $moveCharacter,
  $shouldOverrideDefaultCharacterSelection,
} from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  addClassNamesToElement,
  isHTMLElement,
  mergeRegister,
  objectKlassEquals,
} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createRangeSelection,
  $createTabNode,
  $createTextNode,
  $getAdjacentNode,
  $getNearestNodeFromDOMNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  $normalizeSelection__EXPERIMENTAL,
  $selectAll,
  $setSelection,
  CLEAR_EDITOR_COMMAND,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  CONTROLLED_TEXT_INSERTION_COMMAND,
  COPY_COMMAND,
  createCommand,
  CUT_COMMAND,
  DELETE_CHARACTER_COMMAND,
  DELETE_LINE_COMMAND,
  DELETE_WORD_COMMAND,
  DEPRECATED_$isGridSelection,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  ElementNode,
  FOCUS_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
  INSERT_TAB_COMMAND,
  isSelectionCapturedInDecoratorInput,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  PASTE_COMMAND,
  REMOVE_TEXT_COMMAND,
  SELECT_ALL_COMMAND,
  MAX_INDENT_PARAGRAPH_LEVEL,
  ElementNodeWithBlockStyle,
  getCssTextForElementNodeWithBlockStyle,
  extractStylesFromCssText,
  COMMAND_PRIORITY_CRITICAL,
  $isParagraphNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  BLUR_COMMAND,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import caretFromPoint from 'shared/caretFromPoint';
import {
  CAN_USE_BEFORE_INPUT,
  IS_APPLE_WEBKIT,
  IS_IOS,
  IS_SAFARI,
} from 'shared/environment';
import { $setBlocksType } from '@lexical/selection';
import { IS_REAL_BROWSER, LAUNCH_TEXT_INSERTION_COMMAND, REGISTER_TOOLBAR_LISTENERS, getCurrentEditor, getDOMRangeRectAbsolute, } from '@lexical/shared';
import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";
import { INSERT_HTML_COMMAND } from '@lexical/decorators';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

export type SerializedHeadingNode = Spread<
  {
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    sectionHeader: boolean;
  },
  SerializedElementNodeWithBlockStyle
>;

const autoUpdateObject:{[key: string]: () => void} = {};
var TEXT_CONTENT_TO_INSERT:string|undefined = undefined;
const PASTE_CONTEXT_MENU_ID = "paste-html-action-menu";
var CLOSE_PASTE_MENU_BLUR_TIMEOUT:NodeJS.Timeout|null = null;
const QUOTE_NODE_VERSION = 1;
const HEADING_NODE_VERSION = 1;
export const DRAG_DROP_PASTE: LexicalCommand<Array<File>> = createCommand(
  'DRAG_DROP_PASTE_FILE',
);

export type SerializedQuoteNode = Spread<{first_element: boolean},SerializedElementNode>;

/** @noInheritDoc */
export class QuoteNode extends ElementNode {
  __version: number = QUOTE_NODE_VERSION;

  static getType(): string {
    return 'quote';
  }

  static clone(node: QuoteNode): QuoteNode {
    return new QuoteNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('blockquote');
    addClassNamesToElement(element, config.theme.quote);
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(prevNode: QuoteNode, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: (node: Node) => ({
        conversion: convertBlockquoteElement,
        priority: 0,
      }),
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));

      const formatType = this.getFormatType();
      element.style.textAlign = formatType;
      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      element.setAttribute('data-e-indent',this.getIndent().toString());
      element.setAttribute('data-v',String(QUOTE_NODE_VERSION));
      if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
      if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedQuoteNode): QuoteNode {
    const node = $createQuoteNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    if (serializedNode?.first_element) node.setFirstElement(serializedNode?.first_element);
    return node;
  }

  exportJSON(): SerializedQuoteNode {
    return {
      ...super.exportJSON(),
      type: 'quote',
      version: QUOTE_NODE_VERSION,
      first_element: this.getFirstElement()
    };
  }

  // Mutation

  insertNewAfter(_: RangeSelection, restoreSelection?: boolean): ParagraphNode {
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  collapseAtStart(): true {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => paragraph.append(child));
    this.replace(paragraph);
    return true;
  }
}

export function $createQuoteNode(): QuoteNode {
  return $applyNodeReplacement(new QuoteNode());
}

export function $isQuoteNode(
  node: LexicalNode | null | undefined,
): node is QuoteNode {
  return node instanceof QuoteNode;
}

export type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';



/** @noInheritDoc */
export class HeadingNode extends ElementNodeWithBlockStyle {
  /** @internal */
  __tag: HeadingTagType;
  __version: number = HEADING_NODE_VERSION;
  __sectionHeader: boolean = false;

  static getType(): string {
    return 'heading';
  }

  static clone(node: HeadingNode): HeadingNode {
    const newNode = new HeadingNode(node.__tag, node.__sectionHeader, node.__key,node.getBlockStyle());
    return newNode;
  }

  constructor(tag: HeadingTagType, sectionHeader?:boolean, key?: NodeKey,styleObj?:BlockNodeStyleType) {
    super(key);
    this.__tag = tag;
    if (sectionHeader!==undefined) {
      this.__sectionHeader = sectionHeader;
    }
    if (styleObj) {
      this.__blockStyle = styleObj;
    }
  }

  getTag(): HeadingTagType {
    return this.__tag;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
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
    const cssText = getCssTextForElementNodeWithBlockStyle(this,"heading");
    element.style.cssText = cssText;
    element.setAttribute("data-v",String(HEADING_NODE_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }

  updateDOM(prevNode: HeadingNode, dom: HTMLElement): boolean {
    const cssText = getCssTextForElementNodeWithBlockStyle(this.getLatest(),"heading");
    dom.style.cssText = cssText;
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      h1: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      h2: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      h3: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      h4: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      h5: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      h6: (node: Node) => ({
        conversion: convertHeadingElement,
        priority: 0,
      }),
      p: (node: Node) => {
        // domNode is a <p> since we matched it by nodeName
        const paragraph = node as HTMLParagraphElement;
        const firstChild = paragraph.firstChild;
        if (firstChild !== null && isGoogleDocsTitle(firstChild)) {
          return {
            conversion: () => ({node: null}),
            priority: 3,
          };
        }
        return null;
      },
      span: (node: Node) => {
        if (isGoogleDocsTitle(node)) {
          return {
            conversion: (domNode: Node) => {
              return {
                node: $createHeadingNode('h1'),
              };
            },
            priority: 3,
          };
        }
        return null;
      },
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));

      const cssText = getCssTextForElementNodeWithBlockStyle(this,"heading");
      element.style.cssText = cssText;
      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      if (this.__sectionHeader) {
        element.classList.add('rte-section-header');
      }
      element.setAttribute('data-v',String(HEADING_NODE_VERSION));
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
    const node = $createHeadingNode(serializedNode.tag);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    node.setBlockStyle(structuredClone(serializedNode.blockStyle));
    node.setSectionHeader(serializedNode.sectionHeader);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }

  exportJSON(): SerializedHeadingNode {
    return {
      ...super.exportJSON(),
      tag: this.getTag(),
      type: 'heading',
      version: HEADING_NODE_VERSION,
      sectionHeader: this.__sectionHeader
    };
  }

  // Mutation
  insertNewAfter(
    selection?: RangeSelection,
    restoreSelection = true,
  ): ParagraphNode | HeadingNode {
    const anchorOffet = selection ? selection.anchor.offset : 0;
    const newElement =
      anchorOffet === this.getTextContentSize() || !selection
        ? $createParagraphNode()
        : $createHeadingNode(this.getTag());
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

  collapseAtStart(): true {
    const newElement = !this.isEmpty()
      ? $createHeadingNode(this.getTag())
      : $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => newElement.append(child));
    this.replace(newElement);
    return true;
  }

  extractWithChild(): boolean {
    return true;
  }
  setIndent(indentLevel: number): this {
    const self = this.getWritable();
    self.__indent = Math.min(indentLevel,MAX_INDENT_PARAGRAPH_LEVEL);
    return this;
  }

  getSectionHeader() {
    return this.getLatest().__sectionHeader;
  }
  setSectionHeader(b:boolean) {
    const self = this.getWritable();
    self.__sectionHeader = b;
    return self;
  }
}


function isGoogleDocsTitle(domNode: Node): boolean {
  if (domNode.nodeName.toLowerCase() === 'span') {
    return (domNode as HTMLSpanElement).style.fontSize === '26pt';
  }
  return false;
}

function convertHeadingElement(element: HTMLElement): DOMConversionOutput {
  const nodeName = element.nodeName.toLowerCase();
  let node = null;
  if (
    nodeName === 'h1' ||
    nodeName === 'h2' ||
    nodeName === 'h3' ||
    nodeName === 'h4' ||
    nodeName === 'h5' ||
    nodeName === 'h6'
  ) {
    node = $createHeadingNode(nodeName);
    if (element.style!==null) {
      const obj = extractStylesFromCssText(element.style.cssText,nodeName);
      node.setFormat(obj.textAlign);
      // Set Indent
      const indentStr = element.getAttribute('data-e-indent');
      if (indentStr) {
        const indentNum = parseInt(indentStr);
        if (!!!isNaN(indentNum)&&isFinite(indentNum)) {
          node.setIndent(Math.max(0,Math.min(indentNum,MAX_INDENT_PARAGRAPH_LEVEL)));
        } else {
          node.setIndent(0);
        }
      } else {
        node.setIndent(0);
      }
      const dir = element.getAttribute('dir');
      if(dir==="ltr"||dir==="rtl") node.setDirection(dir);
      else node.setDirection("ltr");
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
  return {node};
}

function convertBlockquoteElement(element: HTMLElement): DOMConversionOutput {
  const node = $createQuoteNode();
  if (element.style !== null) {
    node.setFormat(element.style.textAlign as ElementFormatType);
  }
  if (element.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (element.classList.contains('last-rte-element')) node.setLastElement(true);
  return {node};
}

export function $createHeadingNode(headingTag: HeadingTagType): HeadingNode {
  return $applyNodeReplacement(new HeadingNode(headingTag));
}

export function $isHeadingNode(
  node: LexicalNode | null | undefined,
): node is HeadingNode {
  return node instanceof HeadingNode;
}

function onPasteForRichText(
  event: CommandPayloadType<typeof PASTE_COMMAND>,
  editor: LexicalEditor,
): void {
  event.preventDefault();
  editor.update(
    () => {
      const selection = $getSelection();
      const clipboardData =
        event instanceof InputEvent || event instanceof KeyboardEvent
          ? null
          : event.clipboardData;
      if (
        clipboardData != null &&
        ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))
      ) {
        $insertDataTransferForRichText(clipboardData, selection, editor);
      }
    },
    {
      tag: 'paste',
    },
  );
}

async function onCutForRichText(
  event: CommandPayloadType<typeof CUT_COMMAND>,
  editor: LexicalEditor,
): Promise<void> {
  await copyToClipboard(
    editor,
    objectKlassEquals(event, ClipboardEvent) ? (event as ClipboardEvent) : null,
  );
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      selection.removeText();
    } else if ($isNodeSelection(selection)) {
      selection.getNodes().forEach((node) => node.remove());
    }
  });
}

// Clipboard may contain files that we aren't allowed to read. While the event is arguably useless,
// in certain occasions, we want to know whether it was a file transfer, as opposed to text. We
// control this with the first boolean flag.
export function eventFiles(
  event: DragEvent | PasteCommandType,
): [boolean, Array<File>, boolean] {
  let dataTransfer: null | DataTransfer = null;
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
  const hasContent =
    types.includes('text/html') || types.includes('text/plain');
  return [hasFiles, Array.from(dataTransfer.files), hasContent];
}

function handleIndentAndOutdent(
  indentOrOutdent: (block: ElementNode) => void,
): boolean {
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

function $isTargetWithinDecorator(target: HTMLElement): boolean {
  const node = $getNearestNodeFromDOMNode(target);
  return $isDecoratorNode(node);
}

function $isSelectionAtEndOfRoot(selection: RangeSelection) {
  const focus = selection.focus;
  return focus.key === 'root' && focus.offset === $getRoot().getChildrenSize();
}
type AllowedHeadingTagType = 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'p';
export const HANDLE_EMPTY_COMMAND = createCommand('HANDLE_EMPTY_COMMAND');
export const INSERT_QUOTE_COMMAND:LexicalCommand<undefined> = createCommand('INSERT_QUOTE_COMMAND');
export const CREATE_HEADING_COMMAND:LexicalCommand<AllowedHeadingTagType> = createCommand('CREATE_HEADING_COMMAND');


function getDispatchQuote(editor:LexicalEditor) {
  const dispatchQuote = function () {
    editor.dispatchCommand(INSERT_QUOTE_COMMAND,undefined);
  }
  return dispatchQuote;
}
const ALLOWED_HEADERS = new Set(['h1','h2','h3','h4','h5','h6','p'] as AllowedHeadingTagType[]);
function getDispatchHeading(editor:LexicalEditor) {
  const dispatchHeadingCommand = function (this:HTMLButtonElement) {
    const payload = this.getAttribute('data-payload');
    if (ALLOWED_HEADERS.has(payload as any)) editor.dispatchCommand(CREATE_HEADING_COMMAND,payload as AllowedHeadingTagType);
  };
  return dispatchHeadingCommand;
}

function setDispatchButtons(wrapper: HTMLElement,editor: LexicalEditor) {
  const dispatchHeadingButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('button[data-dispatch="CREATE_HEADING_COMMAND"]'));
  const dispatchQuoteButton = wrapper.querySelector<HTMLButtonElement>('button[data-dispatch="INSERT_QUOTE_COMMAND"]');
  if (editor.hasNode(HeadingNode)) {
    dispatchHeadingButtons.forEach((button) => {
      const dataMouseDown = button.getAttribute('data-mouse-down'); 
      if (dataMouseDown!==null) {
        button.addEventListener('mousedown',getDispatchHeading(editor));
        button.addEventListener('touchstart',getDispatchHeading(editor));
      } else {
        button.addEventListener('click',getDispatchHeading(editor));
      }
    })
  }
  if (editor.hasNode(QuoteNode)) {
    if (dispatchQuoteButton) {
      const dataMouseDown = dispatchQuoteButton.getAttribute('data-mouse-down');
      if (dataMouseDown!==null) {
        dispatchQuoteButton.addEventListener('mousedown',getDispatchQuote(editor));
        dispatchQuoteButton.addEventListener('touchstart',getDispatchQuote(editor));
      } else {
        dispatchQuoteButton.addEventListener('click',getDispatchQuote(editor));
      }
      editor.dispatchCommand(INSERT_QUOTE_COMMAND,undefined);
    }
  }
  
  
} 

export function insertPlaceholder(editor:LexicalEditor) {
  editor.update(() => {
    const rootElement = editor.getRootElement();
    const root = $getRoot();
    if (root.isEmpty()) {
      const paragraph = $createParagraphNode();
      if (rootElement && rootElement.hasAttribute('data-placeholder')) {
        const textNode = $createTextNode(rootElement.getAttribute('data-placeholder') as string);
        paragraph.append(textNode);
      } else {
        const textNode = $createTextNode('Insert Content Here...');
        paragraph.append(textNode);
      }
      root.append(paragraph);
    }
  });
}

var OPTIONS_MENU_OPEN = false;


function closePasteOptionsMenu() {
  OPTIONS_MENU_OPEN = false;
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

function openPasteOptionsMenu(PORTAL_EL:HTMLElement,editor:LexicalEditor) {
  const menu = document.getElementById(PASTE_CONTEXT_MENU_ID);
  OPTIONS_MENU_OPEN = true;
  if (menu) {
    menu.style.display = 'flex';
    const updatePopover = function (this:HTMLElement) {
      const selection = document.getSelection();
      const root = editor.getRootElement();
      if (selection&&root&&selection.rangeCount>0) {
        const rect = getDOMRangeRectAbsolute(selection,root);
        if (PORTAL_EL&&rect) {
          const ancestor = selection.getRangeAt(0).commonAncestorContainer;
          if (rect.left===0&&rect.right===0&&ancestor instanceof HTMLElement) {
            const rectNew = ancestor.getBoundingClientRect();
            rect.left=rectNew.left;
            rect.right = rectNew.right;
            rect.top+=rectNew.top;
          }
          if (rect.top===0&&rect.left===0) closePasteOptionsMenu();
          this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          this.style.left = ((rect.left+rect.right)/2).toString().concat('px');
        }
      } else closePasteOptionsMenu();

      const options:any = {
        placement: "bottom-end",
        middleware: [offset(6),shift(),flip()]
      };
      computePosition(this,menu,options)
      .then(({ x, y })=>{
        const assignObj = {
          left: `${x}px`,
          top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
          opacity: "1"
        };
        Object.assign(menu.style,assignObj);
      })
    }.bind(PORTAL_EL);
    updatePopover();
    const cleanup = autoUpdate(PORTAL_EL,menu,updatePopover);
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
      if (($isRangeSelection(selection)||DEPRECATED_$isGridSelection(selection))&&TEXT_CONTENT_TO_INSERT) {
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
        } catch {
          // Fail silently.
        }
      }
    })
  }
}

function sanitizePastedHTML(dom:Document,noStyle:boolean=false) {
  if (noStyle) {
    Array.from(dom.querySelectorAll('*'))
    .forEach((node: Element) => {
      if(node instanceof HTMLElement) {
        node.style.cssText = "";
      }
    })
  }
  dom.querySelectorAll('table table')
  .forEach((el) => {
    el.remove();
  })
  dom.querySelectorAll('table')
  .forEach((el) => {
    const div = document.createElement('div');
    div.className="table-wrapper";
    div.insertAdjacentHTML("afterbegin",el.outerHTML);
    el.replaceWith(div);
  })
  dom.querySelectorAll<HTMLTableCellElement>('td, th')
  .forEach((el) => {
    const childNodes = Array.from(el.childNodes);
    const children = Array.from(el.children);
    // If the table cell element starts with a text node that has text, assume that the HTML elements inside 
    // the table cell element are inline nodes, and wrap everything in a cell paragraph
    if ((childNodes[0].textContent && childNodes[0].textContent.trim().length>=1) || children.length===0) {
      const p = document.createElement('p');
      p.className = "lex-grid-p";
      p.innerHTML = el.innerHTML;
      el.innerHTML = '';
      el.append(p);
      el.style.width = String(Math.min(7*el.innerText.length,265)).concat('px');
    } else {
      for (let child of children) {
        if (child.tagName==="P") {
          child.className = "lex-grid-p";
          el.style.width = String(Math.min(7*el.innerText.length,265)).concat('px');
        } else {
          const p = document.createElement('p');
          child.insertBefore(p,child);
          p.appendChild(child);
          el.style.width = String(Math.min(7*el.innerText.length,265)).concat('px');
        }
      }
    }
  })
}

function handlePasteHTMLNoStyle() {
  closePasteOptionsMenu();
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if (($isRangeSelection(selection)||DEPRECATED_$isGridSelection(selection))&&TEXT_CONTENT_TO_INSERT) {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
          sanitizePastedHTML(dom,true)
          const nodes = $generateNodesFromDOM(editor, dom);
          return $insertGeneratedNodes(editor, nodes, selection);
        } catch {
          // Fail silently.
        }
      }
    })
  }
}

function handlePasteHTMLWithStyle() {
  closePasteOptionsMenu();
  const editor = getCurrentEditor();
  if (editor) {
    editor.update(() => {
      const selection = $getSelection();
      if (($isRangeSelection(selection)||DEPRECATED_$isGridSelection(selection))&&TEXT_CONTENT_TO_INSERT) {
        try {
          const parser = new DOMParser();
          const dom = parser.parseFromString(TEXT_CONTENT_TO_INSERT, 'text/html');
          sanitizePastedHTML(dom,false);
          const nodes = $generateNodesFromDOM(editor, dom);
          return $insertGeneratedNodes(editor, nodes, selection);
        } catch {
          // Fail silently.
        }
      }
    })
  }
}

function handlePasteAsHtmlNode() {
  closePasteOptionsMenu();
  if (TEXT_CONTENT_TO_INSERT) {
    const editor = getCurrentEditor();
    if (editor) {
      import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
      .then((res) => {
        const newHTML = (res as any).validateUgcCode(TEXT_CONTENT_TO_INSERT);
        editor.dispatchCommand(INSERT_HTML_COMMAND,newHTML);
      })
      .catch((e) => {
        console.error(e);
      })
    }
  }
}

export const COPY_EDITOR_COMMAND:LexicalCommand<null> = createCommand('COPY_EDITOR_COMMAND');


function onCopyEditorContents(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) editor.dispatchCommand(COPY_EDITOR_COMMAND,null);
}

function registerRichTextListeners(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    setDispatchButtons(wrapper,editor);
    const copyEditorButton = wrapper.querySelector<HTMLButtonElement>('button[data-copy-editor]')
    if (copyEditorButton) copyEditorButton.addEventListener('click',onCopyEditorContents);
  }
}
function hideOpenPopovers() {
  Object.keys(autoUpdateObject)
  .forEach((key) => {
    try {
      autoUpdateObject[key]();
      delete autoUpdateObject[key];
      closePasteOptionsMenu();
    } catch (e) {}
  })
}
/**
 * Register Rich Text Should be called on basically all editors
 * This function checks for whether or not HeadingNode and QuoteNodes are registered on the editor before implementing related functionality
 * @param editor 
 * @returns 
 */
export function registerRichTextEditable(editor: LexicalEditor): () => void {
  hideOpenPopovers
  registerRichTextListeners(editor);
  const pasteContextMenu = document.getElementById(PASTE_CONTEXT_MENU_ID);
  if (pasteContextMenu) {
    const pasteText = pasteContextMenu.querySelector('button[data-type="text"]');
    if (pasteText) pasteText.addEventListener('click',handlePasteText);
    const pasteHtmlNoStyle = pasteContextMenu.querySelector('button[data-type="html-no-style"]');
    if (pasteHtmlNoStyle) pasteHtmlNoStyle.addEventListener('click',handlePasteHTMLNoStyle);
    const pasteHtmlWithStyle = pasteContextMenu.querySelector('button[data-type="html-style"]');
    if (pasteHtmlWithStyle) pasteHtmlWithStyle.addEventListener('click',handlePasteHTMLWithStyle);
    const pasteAsHtmlNode = pasteContextMenu.querySelector('button[data-type="html-node"]');
    if (pasteAsHtmlNode) pasteAsHtmlNode.addEventListener('click',handlePasteAsHtmlNode);
  }
  const arr:(() => void)[] = [
    editor.registerCommand(
      CLICK_COMMAND,
      (payload) => {
        if(payload){
          const root = $getRoot();
          if(root){
            const nodes = root.getChildren();
            if ($isDecoratorNode(nodes[nodes.length-1])) {
              const lastNode = nodes[nodes.length-1];
              const nodeKey = lastNode.getKey();
              const element = editor.getElementByKey(nodeKey);
              if(element && payload.clientY > element.getBoundingClientRect().bottom + window.scrollY) {
                root.append($createParagraphNode());
                return true;
              }
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    ),
    editor.registerCommand<boolean>(
      DELETE_CHARACTER_COMMAND,
      (isBackward) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.deleteCharacter(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      DELETE_WORD_COMMAND,
      (isBackward) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.deleteWord(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      DELETE_LINE_COMMAND,
      (isBackward) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.deleteLine(isBackward);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CONTROLLED_TEXT_INSERTION_COMMAND,
      (eventOrText) => {
        const selection = $getSelection();

        if (typeof eventOrText === 'string') {
          if ($isRangeSelection(selection)) {
            selection.insertText(eventOrText);
          } else if (DEPRECATED_$isGridSelection(selection)) {
            // TODO: Insert into the first cell & clear selection.
          }
        } else {
          if (
            !$isRangeSelection(selection) &&
            !DEPRECATED_$isGridSelection(selection)
          ) {
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
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      REMOVE_TEXT_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.removeText();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<TextFormatType>(
      FORMAT_TEXT_COMMAND,
      (format) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.formatText(format);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<ElementFormatType>(
      FORMAT_ELEMENT_COMMAND,
      (format) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) && !$isNodeSelection(selection)) {
          return false;
        }
        const nodes = selection.getNodes();
        for (const node of nodes) {
          const element = $findMatchingParent(
            node,
            (parentNode) =>
              $isElementNode(parentNode) && !parentNode.isInline(),
          );
          if (element !== null) {
            element.setFormat(format);
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<boolean>(
      INSERT_LINE_BREAK_COMMAND,
      (selectStart) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        selection.insertLineBreak(selectStart);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        const node = selection.insertParagraph();
        if (node) node.setFormat('left');
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INSERT_TAB_COMMAND,
      () => {
        $insertNodes([$createTabNode()]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      INDENT_CONTENT_COMMAND,
      () => {
        return handleIndentAndOutdent((block) => {
          const indent = block.getIndent();
          block.setIndent(indent + 1);
        });
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      OUTDENT_CONTENT_COMMAND,
      () => {
        return handleIndentAndOutdent((block) => {
          const indent = block.getIndent();
          if (indent > 0) {
            block.setIndent(indent - 1);
          }
        });
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_BACKSPACE_COMMAND,
      (event) => {
        if ($isTargetWithinDecorator(event.target as HTMLElement)) {
          return false;
        }
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        event.preventDefault();
        const {anchor} = selection;
        const anchorNode = anchor.getNode();

        if (
          selection.isCollapsed() &&
          anchor.offset === 0 &&
          !$isRootNode(anchorNode)
        ) {
          const element = $getNearestBlockElementAncestorOrThrow(anchorNode);
          if (element.getIndent() > 0) {
            return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          }
        }
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, true);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_DELETE_COMMAND,
      (event) => {
        if ($isTargetWithinDecorator(event.target as HTMLElement)) {
          return false;
        }
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(DELETE_CHARACTER_COMMAND, false);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent | null>(
      KEY_ENTER_COMMAND,
      (event) => {
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
          if (
            (IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) &&
            CAN_USE_BEFORE_INPUT
          ) {
            return false;
          }
          event.preventDefault();
          if (event.shiftKey) {
            return editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND, false);
          }
        }
        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        editor.blur();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<DragEvent>(
      DROP_COMMAND,
      (event) => {
        const [, files] = eventFiles(event);
        if (files.length > 0) {
          const x = event.clientX;
          const y = event.clientY;
          const eventRange = caretFromPoint(x, y);
          if (eventRange !== null) {
            const {offset: domOffset, node: domNode} = eventRange;
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
              const normalizedSelection =
                $normalizeSelection__EXPERIMENTAL(selection);
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
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<DragEvent>(
      DRAGSTART_COMMAND,
      (event) => {
        const [isFileTransfer] = eventFiles(event);
        const selection = $getSelection();
        if (isFileTransfer && !$isRangeSelection(selection)) {
          return false;
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<DragEvent>(
      DRAGOVER_COMMAND,
      (event) => {
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
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      SELECT_ALL_COMMAND,
      () => {
        $selectAll();

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CUT_COMMAND,
      (event) => {
        onCutForRichText(event, editor);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const [, files, hasTextContent] = eventFiles(event);
        if (files.length > 0 && !hasTextContent) {
          editor.dispatchCommand(DRAG_DROP_PASTE, files);
          return true;
        }

        // if inputs then paste within the input ignore creating a new node on paste event
        if (isSelectionCapturedInDecoratorInput(event.target as Node)) {
          return false;
        }

        const selection = $getSelection();
        if (
          $isRangeSelection(selection) ||
          DEPRECATED_$isGridSelection(selection)
        ) {
          onPasteForRichText(event, editor);
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      CLEAR_EDITOR_COMMAND,
      () => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode().append($createTextNode()));
        root.selectEnd();
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      FOCUS_COMMAND,
      () => {
        const root = $getRoot();
        const IS_EMPTY = root.isEmpty();
        if (IS_EMPTY) {
          const p = $createParagraphNode();
          const text = $createTextNode();
          p.append(text);
          root.append(p);
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    registerRichTextNotEditable(editor),
    editor.registerCommand(
      LAUNCH_TEXT_INSERTION_COMMAND,
      ({ rect, html }) => {
        TEXT_CONTENT_TO_INSERT = html;
        const PORTAL_EL = document.getElementById('text-table-selection-ref');
        if (PORTAL_EL) {
          PORTAL_EL.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          PORTAL_EL.style.left = ((rect.left+rect.right)/2).toString().concat('px');
          openPasteOptionsMenu(PORTAL_EL,editor);
        }
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    ),
    editor.registerCommand(FOCUS_COMMAND,() => {
      if (CLOSE_PASTE_MENU_BLUR_TIMEOUT) clearTimeout(CLOSE_PASTE_MENU_BLUR_TIMEOUT);
      return false;
    },COMMAND_PRIORITY_EDITOR),
    editor.registerCommand(BLUR_COMMAND,() => {
      CLOSE_PASTE_MENU_BLUR_TIMEOUT = setTimeout(() => {
        closePasteOptionsMenu();
        CLOSE_PASTE_MENU_BLUR_TIMEOUT = null;
      },500);
      return false;
    },COMMAND_PRIORITY_EDITOR),
    editor.registerCommand(SELECTION_CHANGE_COMMAND,() => {
      closePasteOptionsMenu();
      return false;
    },COMMAND_PRIORITY_EDITOR),
    editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,() => {
      registerRichTextListeners(editor);
      return false;
    },COMMAND_PRIORITY_EDITOR)
  ];

  if (editor.hasNode(HeadingNode)) {
    arr.push(editor.registerCommand(
      CREATE_HEADING_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if($isRangeSelection(selection)) {
          if (payload==="p") {
            $setBlocksType(selection,()=>$createParagraphNode());
            return true;
          } else {
            $setBlocksType(selection,()=>$createHeadingNode(payload));
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),)
  }
  if (editor.hasNode(QuoteNode)) {
    arr.push(editor.registerCommand(
      INSERT_QUOTE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
          $setBlocksType(selection,() => $createQuoteNode());
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ));
  }
  if (editor._rootElement&&!!!editor._rootElement.hasAttribute('data-no-color')) {
    arr.push(editor.registerCommand(
      KEY_ENTER_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&selection.isCollapsed()) {
          const nodes = selection.getNodes();
          if(nodes.length) {
            const node = nodes[0];
            if ($isTextNode(node)&&($isParagraphNode(node.getParent())||node.getParent()?.getType()==="heading")) {
              const para = node.getParent() as ElementNode;
              const textContent = para.getTextContent();
              if (/css\[.*\]/.test(textContent)) {
                const cssStr = textContent.slice(4,textContent.length-1);
                if (para.getType()==="paragraph") {
                  const blockStyle = extractStylesFromCssText(cssStr,'p');
                  (para as ParagraphNode|HeadingNode).setBlockStyle(blockStyle);
                  return true;
                } else if (para.getType()==="heading") {
                  const tag = (para as HeadingNode).getTag();
                  const blockStyle = extractStylesFromCssText(cssStr,tag);
                  (para as ParagraphNode|HeadingNode).setBlockStyle(blockStyle);
                  return true;
                }
              } 
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    ))
  }
  
  arr.push(editor.registerCommand(COPY_EDITOR_COMMAND,() => {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    editor.update(() => {
      $selectAll();
      const lexicalString = $getLexicalContent(editor);
      const htmlString = $getHtmlContent(editor);
      if (htmlString&&ClipboardItem.supports('text/html')) {
        const clipboardItem = new ClipboardItem({ 'text/html': htmlString });
        navigator.clipboard.write([clipboardItem])
      }
      if (lexicalString&&ClipboardItem.supports('application/json')) {    
        const clipboardItem = new ClipboardItem({ 'application/json': JSON.parse(lexicalString) });
        navigator.clipboard.write([clipboardItem])
      }
      if (wrapper&&ClipboardItem.supports('text/plain')) {
        navigator.clipboard.writeText(wrapper.innerText)
      }
      document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity: "success", message: 'Successfully copied editor state to clipboard!' }}))
    })
    return true;
  },COMMAND_PRIORITY_EDITOR))
  

  return mergeRegister(...arr);
}

export function registerRichTextNotEditable(editor: LexicalEditor) {
  const arr = [
    editor.registerCommand(
      CLICK_COMMAND,
      (payload) => {
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          selection.clear();
          return true;
        }
        return false;
      },
      0,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_UP_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (
          $isNodeSelection(selection) &&
          !$isTargetWithinDecorator(event.target as HTMLElement)
        ) {
          // If selection is on a node, let's try and move selection
          // back to being a range selection.
          const nodes = selection.getNodes();
          if (nodes.length > 0) {
            nodes[0].selectPrevious();
            return true;
          }
        } else if ($isRangeSelection(selection)) {
          const possibleNode = $getAdjacentNode(selection.focus, true);
          if (
            !event.shiftKey &&
            $isDecoratorNode(possibleNode) &&
            !possibleNode.isIsolated() &&
            !possibleNode.isInline()
          ) {
            possibleNode.selectPrevious();
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      (event) => {
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
          if (
            !event.shiftKey &&
            $isDecoratorNode(possibleNode) &&
            !possibleNode.isIsolated() &&
            !possibleNode.isInline()
          ) {
            possibleNode.selectNext();
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_LEFT_COMMAND,
      (event) => {
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
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_RIGHT_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (
          $isNodeSelection(selection) &&
          !$isTargetWithinDecorator(event.target as HTMLElement)
        ) {
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
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      COPY_COMMAND,
      (event) => {
        copyToClipboard(
          editor,
          objectKlassEquals(event, ClipboardEvent)
            ? (event as ClipboardEvent)
            : null,
        );
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
  ];
  return mergeRegister(...arr);
}

