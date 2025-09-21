/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorConfig, LexicalEditor} from '../LexicalEditor';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
} from '../LexicalNode';
import type {RangeSelection} from 'lexical';

import {
  $applyNodeReplacement,
  getCachedClassNameArray,
  isHTMLElement,
} from '../LexicalUtils';
import {
  ElementNodeWithBlockStyle,
  SerializedElementNodeWithBlockStyle,
  getCssTextForElementNodeWithBlockStyle,
  extractStylesFromCssText,
  BlockNodeStyleType,
  $isRootNode,
  ParagraphNode
} from 'lexical';
import {$isTextNode} from './LexicalTextNode';



export type SerializedCustomParagraphNode = SerializedElementNodeWithBlockStyle;

export const MAX_INDENT_PARAGRAPH_LEVEL=5;

const BLOCK_STYLE_DEFAULT = {
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
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class CustomParagraphNode extends ParagraphNode {
  __blockStyle: BlockNodeStyleType = structuredClone(BLOCK_STYLE_DEFAULT);
  __updateStyle: boolean = true;

  constructor(key?:string,styleObj?: BlockNodeStyleType) {
    super(key);
    this.__format = 1;
    this.__dir = 'ltr';
    this.__version = CURRENT_VERSION;
    if(styleObj) {
      this.__blockStyle = styleObj;
    }
  }

  static getType(): string {
    return 'custom-paragraph';
  }

  static clone(node: CustomParagraphNode): CustomParagraphNode {
    const newNode = new CustomParagraphNode(node.__key,node.getBlockStyle());
    return newNode;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('p');
    const classNames = getCachedClassNameArray(config.theme, 'paragraph');
    if (classNames !== undefined) {
      const domClassList = dom.classList;
      domClassList.add(...classNames);
    }
    const cssText = getCssTextForElementNodeWithBlockStyle(this.getLatest(),"p");
    dom.style.cssText = cssText;
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  updateDOM(
    prevNode: CustomParagraphNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const nextStyle = getCssTextForElementNodeWithBlockStyle(this,"p");
    dom.style.cssText = nextStyle;
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: (node: Node) => ({
        conversion: convertParagraphElement,
        priority: 0,
      }),
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));

      const cssText = getCssTextForElementNodeWithBlockStyle(this.getLatest(),"p");
      element.style.cssText = cssText;

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      element.setAttribute('data-e-indent',this.getIndent().toString());
      element.setAttribute('data-v',String(CURRENT_VERSION));
    }
    
    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedCustomParagraphNode): CustomParagraphNode {
    const node = $createCustomParagraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    node.setBlockStyle(structuredClone(serializedNode.blockStyle));
    return node;
  }

  exportJSON(): SerializedElementNodeWithBlockStyle {
    return {
      ...super.exportJSON(),
      blockStyle: this.getBlockStyle(),
      type: 'custom-paragraph',
      version: CURRENT_VERSION
    };
  }

  // Mutation

  insertNewAfter(_: RangeSelection, restoreSelection: boolean): CustomParagraphNode {
    const newElement = $createCustomParagraphNode();
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }

  collapseAtStart(): boolean {
    const children = this.getChildren();
    // If we have an empty (trimmed) first paragraph and try and remove it,
    // delete the paragraph as long as we have another sibling to go to
    if (
      children.length === 0 ||
      ($isTextNode(children[0]) && children[0].getTextContent().trim() === '')
    ) {
      const nextSibling = this.getNextSibling();
      if (nextSibling !== null) {
        this.selectNext();
        this.remove();
        return true;
      }
      const prevSibling = this.getPreviousSibling();
      if (prevSibling !== null) {
        this.selectPrevious();
        this.remove();
        return true;
      }
      const parent = this.getParent();
      if(!!!$isRootNode(parent)) {
        if (parent && parent.canReplaceWith(this)) {
          parent.replace(this,false);
          return true;
        }
      }
    }
    return false;
  }

  setIndent(indentLevel: number): this {
    const self = this.getWritable();
    self.__indent = Math.min(indentLevel,MAX_INDENT_PARAGRAPH_LEVEL);
    return this;
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
    self.__updateStyle = true;
    return self;
  }
  getUpdateStyle() {
    const self = this.getLatest();
    return self.__updateStyle;
  }
  setUpdateStyle(bool: boolean) {
    const self = this.getWritable();
    self.__updateStyle = bool;
    return self;
  }
  
}

function convertParagraphElement(element: HTMLElement): DOMConversionOutput {
  const node = $createCustomParagraphNode();
  if (element.style.cssText) {
    const obj = extractStylesFromCssText(element.style.cssText,'p');
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
  return {node};
}

export function $createCustomParagraphNode(): CustomParagraphNode {
  return $applyNodeReplacement(new CustomParagraphNode());
}

export function $isCustomParagraphNode(
  node: LexicalNode | null | undefined,
): node is CustomParagraphNode {
  return node instanceof CustomParagraphNode;
}
