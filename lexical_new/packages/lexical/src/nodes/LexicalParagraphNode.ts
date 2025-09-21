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
  $isRootNode
} from 'lexical';
import {$isTextNode} from './LexicalTextNode';
import { AccordionContentNode, DetailsNode } from '@lexical/details';

const IS_REAL_BROWSER = Object.getOwnPropertyDescriptor(globalThis, 'window')?.get?.toString().includes('[native code]') ?? false;

export type SerializedParagraphNode = SerializedElementNodeWithBlockStyle;

export const MAX_INDENT_PARAGRAPH_LEVEL=5;
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class ParagraphNode extends ElementNodeWithBlockStyle {
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
    return 'paragraph';
  }

  static clone(node: ParagraphNode): ParagraphNode {
    const newNode = new ParagraphNode(node.__key,node.getBlockStyle());
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
    dom.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  updateDOM(
    prevNode: ParagraphNode,
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
      element.setAttribute("data-v",String(CURRENT_VERSION));
      if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
      if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedParagraphNode): ParagraphNode {
    const node = $createParagraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    node.setBlockStyle(structuredClone(serializedNode.blockStyle));
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }

  exportJSON(): SerializedElementNodeWithBlockStyle {
    return {
      ...super.exportJSON(),
      type: 'paragraph',
      version:CURRENT_VERSION
    };
  }

  // Mutation

  insertNewAfter(_: RangeSelection, restoreSelection: boolean): ParagraphNode {
    const newElement = $createParagraphNode();
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
      if (prevSibling && prevSibling.getType()==="details") {
        (prevSibling as DetailsNode).setOpen(true);
        const accordionContentArr = (prevSibling as DetailsNode).getChildren().filter((c) => c.getType()==="accordion-content");
        if (accordionContentArr.length) {
          const accordionContent = accordionContentArr[0] as AccordionContentNode;
          accordionContent.select();
        }
      }
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
}

function convertParagraphElement(element: HTMLElement): DOMConversionOutput {

  const node = $createParagraphNode();
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
  if (element.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (element.classList.contains('last-rte-element')) node.setLastElement(true);
  return {node};
}

export function $createParagraphNode(): ParagraphNode {
  return $applyNodeReplacement(new ParagraphNode());
}

export function $isParagraphNode(
  node: LexicalNode | null | undefined,
): node is ParagraphNode {
  return node instanceof ParagraphNode;
}
