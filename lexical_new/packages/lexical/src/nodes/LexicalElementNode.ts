/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {DOMExportOutput, NodeKey, SerializedLexicalNode} from '../LexicalNode';
import type {
  GridSelection,
  NodeSelection,
  PointType,
  RangeSelection,
} from '../LexicalSelection';
import type {LexicalEditor, ParagraphNode, Spread} from 'lexical';

import invariant from 'shared/invariant';

import {$isParagraphNode, $isTextNode, MAX_INDENT_PARAGRAPH_LEVEL, TextNode} from '../';
import {
  DOUBLE_LINE_BREAK,
  ELEMENT_FORMAT_TO_TYPE,
  ELEMENT_TYPE_TO_FORMAT,
} from '../LexicalConstants';
import {LexicalNode} from '../LexicalNode';
import {
  $getSelection,
  $isRangeSelection,
  internalMakeRangeSelection,
  moveSelectionPointToSibling
} from '../LexicalSelection';
import {errorOnReadOnly, getActiveEditor} from '../LexicalUpdates';
import {
  $getNodeByKey,
  $isRootOrShadowRoot,
  removeFromParent,
} from '../LexicalUtils';
import type { HeadingNode } from '@lexical/rich-text';
import type { ListNode } from '@lexical/list';



export type SerializedElementNode<
  T extends SerializedLexicalNode = SerializedLexicalNode,
> = Spread<
  {
    children: Array<T>;
    direction: 'ltr' | 'rtl' | null;
    format: ElementFormatType;
    indent: number;
  },
  SerializedLexicalNode
>;

export type SerializedElementNodeWithBlockStyle<
  T extends SerializedLexicalNode = SerializedLexicalNode,
> = Spread<
  {
    children: Array<T>;
    direction: 'ltr' | 'rtl' | null;
    format: ElementFormatType;
    indent: number;
    blockStyle: BlockNodeStyleType;
    first_element: boolean;
  },
  SerializedLexicalNode
>;


export type ElementFormatType =
  | 'left'
  | 'start'
  | 'center'
  | 'right'
  | 'end'
  | 'justify'
  | '';
export const ALLOWED_FORMAT_TYPE = new Set([
'left',
'start',
'center',
'right',
'end',
'justify'
]);
  
export type AllowedBorderStyleType = "dotted"|
"dashed"|
"solid"|
"double"|
"groove"|
"ridge"|
"inset"|
"outset"|
"none"|
"hidden";

export type AllowedBorderWidth = '0px'|'1px'|'2px'|'3px'|'4px'|'5px';


export const VALID_HEX_REGEX = /^#[0-9a-fA-F]{6}$/i;
export const ALLOWED_BORDER_STYLES = new Set([
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "none",
  "hidden"
]);
const CURRENT_VERSION = 1;
const IS_REAL_BROWSER = Object.getOwnPropertyDescriptor(globalThis, 'window')?.get?.toString().includes('[native code]') ?? false;

/** @noInheritDoc */
export class ElementNode extends LexicalNode {
  /** @internal */
  __first: null | NodeKey;
  /** @internal */
  __last: null | NodeKey;
  /** @internal */
  __size: number;
  /** @internal */
  __format: number;
  /** @internal */
  __indent: number;
  /** @internal */
  __dir: 'ltr' | 'rtl' | null;
  __version: number = CURRENT_VERSION;

  constructor(key?: NodeKey) {
    super(key);
    this.__first = null;
    this.__last = null;
    this.__size = 0;
    this.__format = 0;
    this.__indent = 0;
    this.__dir = null;
  }

  getFormat(): number {
    const self = this.getLatest();
    return self.__format;
  }
  getFormatType(): ElementFormatType {
    const format = this.getFormat();
    return ELEMENT_FORMAT_TO_TYPE[format] || '';
  }
  getIndent(): number {
    const self = this.getLatest();
    return self.__indent;
  }
  getChildren<T extends LexicalNode>(): Array<T> {
    const children: Array<T> = [];
    let child: T | null = this.getFirstChild();
    while (child !== null) {
      children.push(child);
      child = child.getNextSibling();
    }
    return children;
  }
  getChildrenKeys(): Array<NodeKey> {
    const children: Array<NodeKey> = [];
    let child: LexicalNode | null = this.getFirstChild();
    while (child !== null) {
      children.push(child.__key);
      child = child.getNextSibling();
    }
    return children;
  }
  getChildrenSize(): number {
    const self = this.getLatest();
    return self.__size;
  }
  isEmpty(): boolean {
    return this.getChildrenSize() === 0;
  }
  isDirty(): boolean {
    const editor = getActiveEditor();
    const dirtyElements = editor._dirtyElements;
    return dirtyElements !== null && dirtyElements.has(this.__key);
  }
  isLastChild(): boolean {
    const self = this.getLatest();
    const parentLastChild = this.getParentOrThrow().getLastChild();
    return parentLastChild !== null && parentLastChild.is(self);
  }
  getAllTextNodes(): Array<TextNode> {
    const textNodes = [];
    let child: LexicalNode | null = this.getFirstChild();
    while (child !== null) {
      if ($isTextNode(child)) {
        textNodes.push(child);
      }
      if ($isElementNode(child)) {
        const subChildrenNodes = child.getAllTextNodes();
        textNodes.push(...subChildrenNodes);
      }
      child = child.getNextSibling();
    }
    return textNodes;
  }
  getFirstDescendant<T extends LexicalNode>(): null | T {
    let node = this.getFirstChild<T>();
    while (node !== null) {
      if ($isElementNode(node)) {
        const child = node.getFirstChild<T>();
        if (child !== null) {
          node = child;
          continue;
        }
      }
      break;
    }
    return node;
  }
  getLastDescendant<T extends LexicalNode>(): null | T {
    let node = this.getLastChild<T>();
    while (node !== null) {
      if ($isElementNode(node)) {
        const child = node.getLastChild<T>();
        if (child !== null) {
          node = child;
          continue;
        }
      }
      break;
    }
    return node;
  }
  getDescendantByIndex<T extends LexicalNode>(index: number): null | T {
    const children = this.getChildren<T>();
    const childrenLength = children.length;
    // For non-empty element nodes, we resolve its descendant
    // (either a leaf node or the bottom-most element)
    if (index >= childrenLength) {
      const resolvedNode = children[childrenLength - 1];
      return (
        ($isElementNode(resolvedNode) && resolvedNode.getLastDescendant()) ||
        resolvedNode ||
        null
      );
    }
    const resolvedNode = children[index];
    return (
      ($isElementNode(resolvedNode) && resolvedNode.getFirstDescendant()) ||
      resolvedNode ||
      null
    );
  }
  getFirstChild<T extends LexicalNode>(): null | T {
    const self = this.getLatest();
    const firstKey = self.__first;
    return firstKey === null ? null : $getNodeByKey<T>(firstKey);
  }
  getFirstChildOrThrow<T extends LexicalNode>(): T {
    const firstChild = this.getFirstChild<T>();
    if (firstChild === null) {
      invariant(false, 'Expected node %s to have a first child.', this.__key);
    }
    return firstChild;
  }
  getLastChild<T extends LexicalNode>(): null | T {
    const self = this.getLatest();
    const lastKey = self.__last;
    return lastKey === null ? null : $getNodeByKey<T>(lastKey);
  }
  getLastChildOrThrow<T extends LexicalNode>(): T {
    const lastChild = this.getLastChild<T>();
    if (lastChild === null) {
      invariant(false, 'Expected node %s to have a last child.', this.__key);
    }
    return lastChild;
  }
  getChildAtIndex<T extends LexicalNode>(index: number): null | T {
    const size = this.getChildrenSize();
    let node: null | T;
    let i;
    if (index < size / 2) {
      node = this.getFirstChild<T>();
      i = 0;
      while (node !== null && i <= index) {
        if (i === index) {
          return node;
        }
        node = node.getNextSibling();
        i++;
      }
      return null;
    }
    node = this.getLastChild<T>();
    i = size - 1;
    while (node !== null && i >= index) {
      if (i === index) {
        return node;
      }
      node = node.getPreviousSibling();
      i--;
    }
    return null;
  }
  getTextContent(): string {
    let textContent = '';
    const children = this.getChildren();
    const childrenLength = children.length;
    for (let i = 0; i < childrenLength; i++) {
      const child = children[i];
      textContent += child.getTextContent();
      if (
        $isElementNode(child) &&
        i !== childrenLength - 1 &&
        !child.isInline()
      ) {
        textContent += DOUBLE_LINE_BREAK;
      }
    }
    return textContent;
  }
  getTextContentSize(): number {
    let textContentSize = 0;
    const children = this.getChildren();
    const childrenLength = children.length;
    for (let i = 0; i < childrenLength; i++) {
      const child = children[i];
      textContentSize += child.getTextContentSize();
      if (
        $isElementNode(child) &&
        i !== childrenLength - 1 &&
        !child.isInline()
      ) {
        textContentSize += DOUBLE_LINE_BREAK.length;
      }
    }
    return textContentSize;
  }
  getDirection(): 'ltr' | 'rtl' | null {
    const self = this.getLatest();
    return self.__dir;
  }
  hasFormat(type: ElementFormatType): boolean {
    if (type !== '') {
      const formatFlag = ELEMENT_TYPE_TO_FORMAT[type];
      return (this.getFormat() & formatFlag) !== 0;
    }
    return false;
  }

  // Mutators

  select(_anchorOffset?: number, _focusOffset?: number): RangeSelection {
    errorOnReadOnly();
    const selection = $getSelection();
    let anchorOffset = _anchorOffset;
    let focusOffset = _focusOffset;
    const childrenCount = this.getChildrenSize();
    if (!this.canBeEmpty()) {
      if (_anchorOffset === 0 && _focusOffset === 0) {
        const firstChild = this.getFirstChild();
        if ($isTextNode(firstChild) || $isElementNode(firstChild)) {
          return firstChild.select(0, 0);
        }
      } else if (
        (_anchorOffset === undefined || _anchorOffset === childrenCount) &&
        (_focusOffset === undefined || _focusOffset === childrenCount)
      ) {
        const lastChild = this.getLastChild();
        if ($isTextNode(lastChild) || $isElementNode(lastChild)) {
          return lastChild.select();
        }
      }
    }
    if (anchorOffset === undefined) {
      anchorOffset = childrenCount;
    }
    if (focusOffset === undefined) {
      focusOffset = childrenCount;
    }
    const key = this.__key;
    if (!$isRangeSelection(selection)) {
      return internalMakeRangeSelection(
        key,
        anchorOffset,
        key,
        focusOffset,
        'element',
        'element',
      );
    } else {
      selection.anchor.set(key, anchorOffset, 'element');
      selection.focus.set(key, focusOffset, 'element');
      selection.dirty = true;
    }
    return selection;
  }
  selectStart(): RangeSelection {
    const firstNode = this.getFirstDescendant();
    if ($isElementNode(firstNode) || $isTextNode(firstNode)) {
      return firstNode.select(0, 0);
    }
    // Decorator or LineBreak
    if (firstNode !== null) {
      return firstNode.selectPrevious();
    }
    return this.select(0, 0);
  }
  selectEnd(): RangeSelection {
    const lastNode = this.getLastDescendant();
    if ($isElementNode(lastNode) || $isTextNode(lastNode)) {
      return lastNode.select();
    }
    // Decorator or LineBreak
    if (lastNode !== null) {
      return lastNode.selectNext();
    }
    return this.select();
  }
  clear(): this {
    const writableSelf = this.getWritable();
    const children = this.getChildren();
    children.forEach((child) => child.remove());
    return writableSelf;
  }
  append(...nodesToAppend: LexicalNode[]): this {
    return this.splice(this.getChildrenSize(), 0, nodesToAppend);
  }
  setDirection(direction: 'ltr' | 'rtl' | null): this {
    const self = this.getWritable();
    self.__dir = direction;
    return self;
  }
  setFormat(type: ElementFormatType): this {
    const self = this.getWritable();
    self.__format = type !== '' ? ELEMENT_TYPE_TO_FORMAT[type] : 0;
    return this;
  }
  setIndent(indentLevel: number): this {
    const self = this.getWritable();
    self.__indent = indentLevel;
    return this;
  }
  splice(
    start: number,
    deleteCount: number,
    nodesToInsert: Array<LexicalNode>,
  ): this {
    const nodesToInsertLength = nodesToInsert.length;
    const oldSize = this.getChildrenSize();
    const writableSelf = this.getWritable();
    const writableSelfKey = writableSelf.__key;
    const nodesToInsertKeys = [];
    const nodesToRemoveKeys = [];
    const nodeAfterRange = this.getChildAtIndex(start + deleteCount);
    let nodeBeforeRange = null;
    let newSize = oldSize - deleteCount + nodesToInsertLength;

    if (start !== 0) {
      if (start === oldSize) {
        nodeBeforeRange = this.getLastChild();
      } else {
        const node = this.getChildAtIndex(start);
        if (node !== null) {
          nodeBeforeRange = node.getPreviousSibling();
        }
      }
    }

    if (deleteCount > 0) {
      let nodeToDelete =
        nodeBeforeRange === null
          ? this.getFirstChild()
          : nodeBeforeRange.getNextSibling();
      for (let i = 0; i < deleteCount; i++) {
        if (nodeToDelete === null) {
          invariant(false, 'splice: sibling not found');
        }
        const nextSibling = nodeToDelete.getNextSibling();
        const nodeKeyToDelete = nodeToDelete.__key;
        const writableNodeToDelete = nodeToDelete.getWritable();
        removeFromParent(writableNodeToDelete);
        nodesToRemoveKeys.push(nodeKeyToDelete);
        nodeToDelete = nextSibling;
      }
    }

    let prevNode = nodeBeforeRange;
    for (let i = 0; i < nodesToInsertLength; i++) {
      const nodeToInsert = nodesToInsert[i];
      if (prevNode !== null && nodeToInsert.is(prevNode)) {
        nodeBeforeRange = prevNode = prevNode.getPreviousSibling();
      }
      const writableNodeToInsert = nodeToInsert.getWritable();
      if (writableNodeToInsert.__parent === writableSelfKey) {
        newSize--;
      }
      removeFromParent(writableNodeToInsert);
      const nodeKeyToInsert = nodeToInsert.__key;
      if (prevNode === null) {
        writableSelf.__first = nodeKeyToInsert;
        writableNodeToInsert.__prev = null;
      } else {
        const writablePrevNode = prevNode.getWritable();
        writablePrevNode.__next = nodeKeyToInsert;
        writableNodeToInsert.__prev = writablePrevNode.__key;
      }
      if (nodeToInsert.__key === writableSelfKey) {
        invariant(false, 'append: attempting to append self');
      }
      // Set child parent to self
      writableNodeToInsert.__parent = writableSelfKey;
      nodesToInsertKeys.push(nodeKeyToInsert);
      prevNode = nodeToInsert;
    }

    if (start + deleteCount === oldSize) {
      if (prevNode !== null) {
        const writablePrevNode = prevNode.getWritable();
        writablePrevNode.__next = null;
        writableSelf.__last = prevNode.__key;
      }
    } else if (nodeAfterRange !== null) {
      const writableNodeAfterRange = nodeAfterRange.getWritable();
      if (prevNode !== null) {
        const writablePrevNode = prevNode.getWritable();
        writableNodeAfterRange.__prev = prevNode.__key;
        writablePrevNode.__next = nodeAfterRange.__key;
      } else {
        writableNodeAfterRange.__prev = null;
      }
    }

    writableSelf.__size = newSize;

    // In case of deletion we need to adjust selection, unlink removed nodes
    // and clean up node itself if it becomes empty. None of these needed
    // for insertion-only cases
    if (nodesToRemoveKeys.length) {
      // Adjusting selection, in case node that was anchor/focus will be deleted
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodesToRemoveKeySet = new Set(nodesToRemoveKeys);
        const nodesToInsertKeySet = new Set(nodesToInsertKeys);

        const {anchor, focus} = selection;
        if (isPointRemoved(anchor, nodesToRemoveKeySet, nodesToInsertKeySet)) {
          moveSelectionPointToSibling(
            anchor,
            anchor.getNode(),
            this,
            nodeBeforeRange,
            nodeAfterRange,
          );
        }
        if (isPointRemoved(focus, nodesToRemoveKeySet, nodesToInsertKeySet)) {
          moveSelectionPointToSibling(
            focus,
            focus.getNode(),
            this,
            nodeBeforeRange,
            nodeAfterRange,
          );
        }
        // Cleanup if node can't be empty
        if (newSize === 0 && !this.canBeEmpty() && !$isRootOrShadowRoot(this)) {
          this.remove();
        }
      }
    }

    return writableSelf;
  }
  // JSON serialization
  exportJSON(): SerializedElementNode {
    return {
      children: [],
      direction: this.getDirection(),
      format: this.getFormatType(),
      indent: this.getIndent(),
      type: 'element',
      version: CURRENT_VERSION
    };
  }
  // These are intended to be extends for specific element heuristics.
  insertNewAfter(
    selection: RangeSelection,
    restoreSelection?: boolean,
  ): null | LexicalNode {
    return null;
  }
  canIndent(): boolean {
    return true;
  }
  /*
   * This method controls the behavior of a the node during backwards
   * deletion (i.e., backspace) when selection is at the beginning of
   * the node (offset 0)
   */
  collapseAtStart(selection: RangeSelection): boolean {
    return false;
  }
  excludeFromCopy(destination?: 'clone' | 'html'): boolean {
    return false;
  }
  // TODO 0.10 deprecate
  canExtractContents(): boolean {
    return true;
  }
  canReplaceWith(replacement: LexicalNode): boolean {
    return true;
  }
  canInsertAfter(node: LexicalNode): boolean {
    return true;
  }
  canBeEmpty(): boolean {
    return true;
  }
  canInsertTextBefore(): boolean {
    return true;
  }
  canInsertTextAfter(): boolean {
    return true;
  }
  isInline(): boolean {
    return false;
  }
  // A shadow root is a Node that behaves like RootNode. The shadow root (and RootNode) mark the
  // end of the hiercharchy, most implementations should treat it as there's nothing (upwards)
  // beyond this point. For example, node.getTopLevelElement(), when performed inside a TableCellNode
  // will return the immediate first child underneath TableCellNode instead of RootNode.
  isShadowRoot(): boolean {
    return false;
  }
  canMergeWith(node: ElementNode): boolean {
    return false;
  }
  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection | null,
    destination: 'clone' | 'html',
  ): boolean {
    return false;
  }
  /**
   * These get property tests are to see whether you 
   * can style block level elements and their default is false 
   */
  hasBlockStyling(): boolean {
    return false;
  }
}


export type BlockNodeStyleType = {
  textAlign:'start'|'left'|'center'|'right'|'end',

  backgroundColor: string,
  textColor: string,
  margin: string|[string,string,string,string]|[string,string],
  padding: string|[string,string,string,string]|[string,string],
  borderRadius: string|[string,string,string,string]|[string,string], 
  borderColor: string|[string,string,string,string]|[string,string],
  borderWidth: string|[string,string,string,string]|[string,string],
  borderType: string|[string,string,string,string]|[string,string],
  boxShadowOffsetX: string,
  boxShadowOffsetY: string,
  boxShadowBlurRadius: string,
  boxShadowSpreadRadius: string,
  boxShadowInset: boolean,
  boxShadowColor: string
}

export const BLOCK_STYLE_DEFAULT = {
  textAlign:'left' as "left",
  backgroundColor: 'transparent',
  textColor: 'inherit', //'inherit' or color
  margin: ['6px','0px','6px','0px'] as [string,string,string,string], 
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

export class ElementNodeWithBlockStyle extends ElementNode {
  __blockStyle: BlockNodeStyleType =structuredClone(BLOCK_STYLE_DEFAULT);
  __version: number = CURRENT_VERSION;
  constructor(key?: NodeKey,styleObject?: BlockNodeStyleType) {
    super(key);
    if (styleObject) {
      this.__blockStyle = structuredClone(styleObject);
    }
  }

  exportJSON(): SerializedElementNodeWithBlockStyle {
    return {
      ...super.exportJSON(),
      first_element: this.getFirstElement(),
      blockStyle: this.getBlockStyle(),
      version: CURRENT_VERSION
    };
  }
  hasBlockStyling(): boolean {
    return true;
  }
  getBlockStyle():BlockNodeStyleType {
    const self = this.getLatest();
    return self.__blockStyle;
  }
  setBlockStyle(styleObject: BlockNodeStyleType) {
    const self = this.getWritable();
    self.__blockStyle = structuredClone(styleObject);
    return self;
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER&&element instanceof HTMLElement) {
      element.classList.add('first-rte-element');
    }
    if (this.getLastElement()&&!!!IS_REAL_BROWSER&&element instanceof HTMLElement) {
      element.classList.add('last-rte-element');
    }
    return {element};
  }
}
/**
 * Returns true when the node is an instance of the element node
 * @param node 
 * @returns 
 */
export function $isElementNode(
  node: LexicalNode | null | undefined,
): node is ElementNode {
  return node instanceof ElementNode;
}

function isPointRemoved(
  point: PointType,
  nodesToRemoveKeySet: Set<NodeKey>,
  nodesToInsertKeySet: Set<NodeKey>,
): boolean {
  let node: ElementNode | TextNode | null = point.getNode();
  while (node) {
    const nodeKey = node.__key;
    if (nodesToRemoveKeySet.has(nodeKey) && !nodesToInsertKeySet.has(nodeKey)) {
      return true;
    }
    node = node.getParent();
  }
  return false;
}

/**
 * Creating function to compare two values, one of which may be a string and the other might be a string array
 * Can't compare strings outright because comparing two arrays always returns false
 * @param s1 
 * @param s2 
 */
function isEqualStringOrStringArray(s1:string|string[],s2:string|string[]){
  if (typeof s1!==typeof s2) return false;
  else if (s1.length!==s2.length) return false;
  else if (typeof s1==='object') {
    for (let i=0;i<s1.length;i++) {
      if (s1[i]!==s2[i]) return false;
    }
    return true;
  } else if (typeof s1==="string") {
    return Boolean(s1===s2);
  } else {
    return true;
  }
}

export function getCssTextForElementNodeWithBlockStyle(node1: ParagraphNode|HeadingNode|ListNode,type:'list'|'heading'|'p') {
  const node = node1.getLatest();
  const format = node.getFormatType();
  const LIST = type==="list";
  const style = node.getBlockStyle();
  var cssText = '';
  // Format
  cssText+='text-align:'.concat(format || 'left').concat(';');
  // Background Color  
  if (style.backgroundColor!==BLOCK_STYLE_DEFAULT.backgroundColor) cssText+='background-color:'.concat(style.backgroundColor).concat(';');
  // Text Color
  if (style.textColor!==BLOCK_STYLE_DEFAULT.textColor) cssText+='color:'.concat(style.textColor).concat(';');
  // Margin - Always Set
  if (Array.isArray(style.margin)) cssText+='margin:'.concat(style.margin.join(' ')).concat(';');
  else cssText+='margin:'.concat(style.margin).concat(';');
  // Padding - Always set
  if (LIST) {
    if (Array.isArray(style.padding)) {
      if (style.padding.length===2){
        cssText += 'padding-top:'.concat(style.padding[0]).concat(';');
        cssText += 'padding-bottom:'.concat(style.padding[0]).concat(';');
      } else if (style.padding.length===4){
        cssText += 'padding-top:'.concat(style.padding[0]).concat(';');
        cssText += 'padding-bottom:'.concat(style.padding[2]).concat(';');
      }
    } else {
      cssText += 'padding-top:'.concat(style.padding).concat(';');
      cssText += 'padding-bottom:'.concat(style.padding).concat(';');
    } 
  } else {
    const indent = node1.getIndent();
    if (Array.isArray(style.padding)) {
      var paddingLeftStart:number;
      if (style.padding.length===2){
        paddingLeftStart = parseInt((style.padding[1] as string).replace('px',''));
        const paddingLeft = (paddingLeftStart + indent*20).toString().concat('px');
        cssText+='padding:'.concat([style.padding[0],style.padding[1],style.padding[0],paddingLeft].join(' ')).concat('!important;');
      }else if (style.padding.length===4){
        paddingLeftStart = parseInt((style.padding[3] as string).replace('px',''));  
        const paddingLeft = (paddingLeftStart + indent*20).toString().concat('px');
        cssText+='padding:'.concat([style.padding[0],style.padding[1],style.padding[2],paddingLeft].join(' ')).concat('!important;');
      } else {
        paddingLeftStart = 0;
      }
    } else {
      const paddingLeftStart = parseInt((style.padding as string).replace('px',''));
      const paddingLeft = (paddingLeftStart + indent*20).toString().concat('px');
      cssText+='padding:'.concat([style.padding,style.padding,style.padding,paddingLeft].join(' ').concat('!important;'));

    }
  }
  // Border Radius
  if (!!!isEqualStringOrStringArray(style.borderRadius,BLOCK_STYLE_DEFAULT.borderRadius)) {
    if (Array.isArray(style.borderRadius)) cssText+='border-radius: '.concat(style.borderRadius.join(' ')).concat(';');
    else cssText+='border-radius:'.concat(style.borderRadius).concat(';');
  }
  // Border Color
  if (!!!isEqualStringOrStringArray(style.borderColor,BLOCK_STYLE_DEFAULT.borderColor)) {
    if (Array.isArray(style.borderColor))cssText+='border-color:'.concat(style.borderColor.join(' ')).concat(';');
    else cssText+='border-color:'.concat(style.borderColor).concat(';');
  }
  // Border Width
  if (!!!isEqualStringOrStringArray(style.borderWidth,BLOCK_STYLE_DEFAULT.borderWidth)) {
    if (Array.isArray(style.borderWidth))cssText+='border-width:'.concat(style.borderWidth.join(' ')).concat(';');
    else cssText+='border-width:'.concat(style.borderWidth).concat(';');
  }
  // Border Type
  if (!!!isEqualStringOrStringArray(style.borderType,BLOCK_STYLE_DEFAULT.borderType)) {
    if (Array.isArray(style.borderType))cssText+='border-style:'.concat(style.borderType.join(' ')).concat(';');
    else cssText+='border-style:'.concat(style.borderType).concat(';');
  } 

  if ((
      style.boxShadowInset!==BLOCK_STYLE_DEFAULT.boxShadowInset
    ) || (
      style.boxShadowOffsetX!==BLOCK_STYLE_DEFAULT.boxShadowOffsetX
    ) || (
      style.boxShadowOffsetY!==BLOCK_STYLE_DEFAULT.boxShadowOffsetY
    ) || (
      style.boxShadowSpreadRadius!==BLOCK_STYLE_DEFAULT.boxShadowSpreadRadius
    ) || (
      style.boxShadowBlurRadius!==BLOCK_STYLE_DEFAULT.boxShadowBlurRadius
    )) {
      // Box Shadow
      var boxShadowStr = 'box-shadow:';
      boxShadowStr+=style.boxShadowInset?'inset ':'';
      boxShadowStr+=style.boxShadowOffsetX.concat(' ').concat(style.boxShadowOffsetY).concat(' ').concat(style.boxShadowBlurRadius).concat(' ').concat(style.boxShadowSpreadRadius).concat(' ').concat(style.boxShadowColor);
      boxShadowStr+=';';
      cssText+=boxShadowStr;
  }
  return cssText;
}

function componentFromStr(numStr:string, percent:string) {
  var num = Math.max(0, parseInt(numStr, 10));
  return percent ?
      Math.floor(255 * Math.min(100, num) / 100) : Math.min(255, num);
}
/**
 * Function to convert rgb string to hex string found HERE[https://stackoverflow.com/questions/13070054/convert-rgb-strings-to-hex-in-javascript]
 * @param rgb 
 * @returns 
 */
function rgbToHex(rgb:string) {
  var rgbRegex = /^rgb\(\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*,\s*(-?\d+)(%?)\s*\)$/;
  var result, r, g, b, hex = "";
  if ( (result = rgbRegex.exec(rgb)) ) {
      r = componentFromStr(result[1], result[2]);
      g = componentFromStr(result[3], result[4]);
      b = componentFromStr(result[5], result[6]);
      hex = "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  return hex;
}


/**
 * Creates an object containing all the styles and their values provided in the CSS string.
 * The values do not include the colon at the end of the string
 * @param css - The CSS string of styles and their values.
 * @returns The styleObject containing all the styles and their values.
 */
export function getStyleObjectFromRawCSS(css: string): Record<string, string> {
  const styleObject: Record<string, string> = {};
  const styles = css.split(';');

  for (const style of styles) {
    if (style !== '') {
      const [key, value] = style.split(/:([^]+)/); // split on first colon
      if (key && value) {
        styleObject[key.trim()] = value.trim();
      }
    }
  }

  return styleObject;
}

/**
 * Parse Color string
 * @param str string
 */
export function parseColorStr(str:string|any,defaultRet: string) {
  if (!!!str) return defaultRet;
  const s = str.trim();
  if (s.startsWith('rgb')) {
    const hexStr = rgbToHex(s);
    return hexStr;
  } else if (s.startsWith('#')) {
    if (VALID_HEX_REGEX.test(s)) return s; 
  }
  return defaultRet;
}

export const VALID_PX = /^\d+px$/;

function clampSize(str:string,min:number,max:number) {
  const num = parseInt(str);
  if(isNaN(num)||!!!isFinite(num))return'0px';
  if (num < min) return min.toString().concat('px');
  else if (num > max) return max.toString().concat('px');
  else return str;
}

function parseSizeStr(str:string,defaultStr:string|[string,string]|[string,string,string,string],minMax?:{min:number,max:number},validLength?:1|2|4) {
  if (typeof str === 'string') {
    const strWithoutImportant = str.replace('!important','');
    const arr = strWithoutImportant.trim().split(' ').map(q=>q.trim()).filter(q=>q.length>0);
    for (let i=0;i<arr.length;i++){
      if (validLength&&i+1>validLength) break;
      if (VALID_PX.test(arr[i])) {
        if (minMax) {
          arr[i] = clampSize(arr[i],minMax.min,minMax.max)
        } else {
          arr[i] = arr[i];
        }
        
      } else if (Array.isArray(defaultStr)&&defaultStr[i]) arr[i] = defaultStr[i];
      else if (Array.isArray(defaultStr)) arr[i] = defaultStr[0];
      else arr[i] = defaultStr[0];
    }
    if (validLength) {
      if (arr.length===validLength) {
        if (arr.length===1) return arr[0];
        else return arr as [string,string]|[string,string,string,string];
      } else return defaultStr;
    }
    if (arr.length===1) return arr[0];
    else if (arr.length===2) return arr as [string,string];
    else if (arr.length===4) return arr as [string,string,string,string];
    else return defaultStr;
  } else return defaultStr;
}



/**
 * Parse the border type css string
 * @param s 
 * @returns 
 */
export function parseBorderTypeStr(s:string) {
  if (typeof s !=='string') return 'none';
  const str = s.trim().split(' ').map(a=>a.trim());
  for (let i = 0; i < str.length && i < 4; i++) {
    if (ALLOWED_BORDER_STYLES.has(str[i])) continue;
    else {
      str[i] = 'none';
    }
  }
  if (str.length===1) return str[0];
  else if (str.length===3) {
    str.push(str[1]);
    return str as [string,string,string,string];
  } else {
    return str as [string,string,string,string]|[string,string];
  }
}

export function parseBorderColorStr(s:string) {
  const str = s.trim();
  const startColorIndexes:number[] = [];
  const colors:string[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i]==='r') startColorIndexes.push(i);
    else if (str[i]==='#') startColorIndexes.push(i);
  }
  for (let index of startColorIndexes) {
    if (str[index]==='#') {
      const color = str.slice(index,str.indexOf(' ',index)+1);
      if (VALID_HEX_REGEX.test(color)) colors.push(color);
      else colors.push('transparent');
    } else if (str[index]==='r') {
      const colorStr = str.slice(index,str.indexOf(')',index)+1);
      const color = parseColorStr(colorStr,'transparent');
      colors.push(color);
    }
  }
  if (colors.length===1) return colors[0];
  else if (colors.length===2) return colors as [string,string];
  else if (colors.length===3) return [colors[0],colors[1],colors[2],colors[1]] as [string,string,string,string];
  else if (colors.length===4) return colors as [string,string,string,string]; 
  else return 'transparent';
}

function parseBorderCssText(obj:Record<string, string>) {
  const retObj:{
    borderRadius: undefined|string|[string,string]|[string,string,string,string],
    borderColor: undefined|string|[string,string]|[string,string,string,string],
    borderWidth: undefined|string|[string,string]|[string,string,string,string],
    borderType: undefined|string|[string,string]|[string,string,string,string],
  } = {
    borderRadius: undefined,
    borderColor: undefined,
    borderWidth: undefined,
    borderType: undefined
  }
  if (obj['border']) {
    const borderStr = String(obj['border']).trim();
    const borderArr = borderStr.split(' ').map(s=>s.trim());
    if (borderArr.length===1 && ALLOWED_BORDER_STYLES.has(borderArr[0])) retObj.borderType = borderArr[0];
    else if (borderArr.length===2){
      if (VALID_PX.test(borderArr[0]) && ALLOWED_BORDER_STYLES.has(borderArr[1])) {
        retObj.borderWidth = borderArr[0];
        retObj.borderType = borderArr[1];
      } else if (ALLOWED_BORDER_STYLES.has(borderArr[0]) && VALID_HEX_REGEX.test(borderArr[1] || '')) {
        retObj.borderType = borderArr[0];
        retObj.borderColor = borderArr[1];
      }
    } else if (borderArr.length===3) {
      if (VALID_PX.test(borderArr[0]) && ALLOWED_BORDER_STYLES.has(borderArr[1])&&VALID_HEX_REGEX.test(borderArr[2] || '')){
        retObj.borderWidth = borderArr[0];
        retObj.borderType = borderArr[1];
        retObj.borderColor = borderArr[2];
      }
    }
  }
  if (!!!retObj.borderRadius&&obj['border-radius']) {
    retObj.borderRadius = parseSizeStr(obj['border-radius'],'0px',{min: 0, max: 50});
  }
  if (!!!retObj.borderColor&&obj['border-color']) {
    retObj.borderColor = parseBorderColorStr(obj['border-color']);
  }
  if (!!!retObj.borderWidth&&obj['border-width']) {
    retObj.borderWidth = parseSizeStr(obj['border-width'],'0px',{min: 0, max: 15});
  }
  if (!!!retObj.borderType&&obj['border-style']) {
    retObj.borderType = parseBorderTypeStr(obj['border-style']);
  }
  const ret = {
    borderRadius: retObj.borderRadius || '0px',
    borderColor: retObj.borderColor || 'transparent',
    borderWidth: retObj.borderWidth || '0px',
    borderType: retObj.borderType || 'none'
  };
  return ret;
}

/**
 * Number of spaces in a string
 * @param my_string 
 * @returns 
 */
const numSpaces = (my_string:string) => (my_string.split(" ").length - 1);
export function parseBoxShadowCssText(obj:Record<string, string>) {
  const RET = {
    boxShadowOffsetX: '0px',
    boxShadowOffsetY: '0px',
    boxShadowBlurRadius: '0px',
    boxShadowSpreadRadius: '0px',
    boxShadowInset: false,
    boxShadowColor: 'transparent'
  }
  var str = obj['box-shadow']?.trim();
  if (str) {
    if (str.includes('inset')) {
      str = str.replace('inset','').trim();
      RET.boxShadowInset=true;
    }
    var strArr:string[] = [];
    if (str.includes('rgb')) {
      const rgbIndex = str.indexOf('rgb');
      const endRgbIndex = str.indexOf(')',rgbIndex+1);
      const colorString = str.slice(rgbIndex,endRgbIndex+1);
      const nonColorString = str.slice(0,rgbIndex).concat(str.slice(endRgbIndex+1,str.length));
      const nonColorArr = nonColorString.split(' ').map(s=>s.trim()).filter(s=>s.length);
      const elementsBefore = numSpaces(str.slice(0,rgbIndex));
      for (let i = 0; i < elementsBefore; i++) {
        strArr.push(nonColorArr[i]);
      }
      strArr.push(colorString);
      for (let i = Math.max(elementsBefore-1,0);i<nonColorArr.length;i++) {
        strArr.push(nonColorArr[i]);
      }
    } else {
      strArr = obj['box-shadow'].split(' ').map(a=>a.trim()).filter(b=>b.length);  
    }
    if (strArr.length===5) {
      if (VALID_PX.test(strArr[0])) {
        RET.boxShadowOffsetX = clampSize(strArr[0],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[1],-15,15);
        RET.boxShadowBlurRadius = clampSize(strArr[2],0,50);
        RET.boxShadowSpreadRadius = clampSize(strArr[3],0,15);
        RET.boxShadowColor = parseColorStr(strArr[4],'transparent');
      } else {
        RET.boxShadowColor = parseColorStr(strArr[0],'transparent');
        RET.boxShadowOffsetX = clampSize(strArr[1],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[2],-15,15);
        RET.boxShadowBlurRadius = clampSize(strArr[3],0,50);
        RET.boxShadowSpreadRadius = clampSize(strArr[4],0,15);
      }
    } else if (strArr.length===4) {
      if (VALID_PX.test(strArr[0])) {
        RET.boxShadowOffsetX = clampSize(strArr[0],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[1],-15,15);
        RET.boxShadowBlurRadius = clampSize(strArr[2],0,50);
        RET.boxShadowSpreadRadius = '0px';
        RET.boxShadowColor = parseColorStr(strArr[3],'transparent');
      } else {
        RET.boxShadowColor = parseColorStr(strArr[0],'transparent');
        RET.boxShadowOffsetX = clampSize(strArr[1],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[2],-15,15);
        RET.boxShadowBlurRadius = clampSize(strArr[3],0,50);
        RET.boxShadowSpreadRadius = '0px';
      }
    } else if (strArr.length===3) {
      if (VALID_PX.test(strArr[0])) {
        RET.boxShadowOffsetX = clampSize(strArr[0],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[1],-15,15);
        RET.boxShadowBlurRadius = '0px';
        RET.boxShadowSpreadRadius = '0px';
        RET.boxShadowColor = parseColorStr(strArr[2],'transparent');
      } else {
        RET.boxShadowColor = parseColorStr(strArr[0],'transparent');
        RET.boxShadowOffsetX = clampSize(strArr[1],-15,15);
        RET.boxShadowOffsetY = clampSize(strArr[2],-15,15);
        RET.boxShadowBlurRadius = '0px';
        RET.boxShadowSpreadRadius = '0px';
      }
    } 
  }
  return {
    boxShadowOffsetX: RET.boxShadowOffsetX || '0px',
    boxShadowOffsetY: RET.boxShadowOffsetY || '0px',
    boxShadowBlurRadius: RET.boxShadowBlurRadius || '0px',
    boxShadowSpreadRadius: RET.boxShadowSpreadRadius || '0px',
    boxShadowInset: RET.boxShadowInset || false,
    boxShadowColor: RET.boxShadowColor || 'transparent'
  }
}

export const VALID_FORMAT_TYPES = new Set([
  'left',
  'start',
  'center',
  'right',
  'end'
]);




/**
 * Take in a css string and return an object of strings that contains the values needed for 
 * ElementNodeWithBlockStyle
 * @param cssText 
 * @returns 
 */
export function extractStylesFromCssText(cssText: string,tag:'ul'|'ol'|'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'hr'):BlockNodeStyleType {
  const obj = getStyleObjectFromRawCSS(cssText);
  const textAlign = (VALID_FORMAT_TYPES.has(obj['text-align']) ? obj['text-align'] : 'left') as "left" | "start" | "center" | "right" | "end";
  const backgroundColor = parseColorStr(obj['background-color'],'transparent') as string;
  const textColor = parseColorStr(obj['color'],'inherit') as string;//'inherit' or color
  const margin = parseSizeStr(obj['margin'],['6px','0px','6px','0px'],{min: 0, max: 50});
  var padding;
  if (tag==='ul'||tag==='ol') {
    const paddingTop = parseSizeStr(obj['padding-top'],'0px',{min: 0, max: 50},1) as string;
    const paddingBottom = parseSizeStr(obj['padding-bottom'],'0px',{min: 0, max: 50},1) as string;
    padding = [paddingTop,'5px',paddingBottom,'5px'] as [string,string,string,string];
  } else {
    padding = parseSizeStr(obj['padding'],'0px',{min: 0, max: 50});
  }
  
  const {
    borderRadius,
    borderColor,
    borderWidth,
    borderType
  } = parseBorderCssText(obj);

  const {
    boxShadowOffsetX,
    boxShadowOffsetY,
    boxShadowBlurRadius,
    boxShadowSpreadRadius,
    boxShadowInset,
    boxShadowColor
  } = parseBoxShadowCssText(obj);

  
  const copyObj = structuredClone({
    textAlign,

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
  });
  return copyObj;
}

