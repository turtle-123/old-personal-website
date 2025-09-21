/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {ElementNode} from 'lexical';
import { IS_REAL_BROWSER } from '@lexical/shared';

export type SerializedLayoutContainerNode = Spread<
  {
    templateColumns: string;
    first_element: boolean;
  },
  SerializedElementNode
>;

function $convertLayoutContainerElement(domNode: HTMLElement): DOMConversionOutput | null {
  const gridTemplateColumns = domNode.getAttribute('data-template-columns');
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (gridTemplateColumns) {
    const node = $createLayoutContainerNode(gridTemplateColumns);
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node};
  }
  return null;
}

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string;

  constructor(templateColumns: string, key?: NodeKey) {
    super(key);
    this.__templateColumns = templateColumns;
  }

  static getType(): string {
    return 'layout-container';
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.style.gridTemplateColumns = this.__templateColumns;
    dom.classList.add('rte-layout-container');
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.style.cssText = `grid-template-columns: ${this.__templateColumns}`;
    element.setAttribute('data-template-columns',this.__templateColumns);
    element.setAttribute('data-lexical-layout-container', 'true');
    element.className = "rte-layout-container";
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-layout-container')) {
          return null;
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 4,
        };
      },
    };
  }

  static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    const node = $createLayoutContainerNode(json.templateColumns);
    node.setFirstElement(json?.first_element);
    return node;
  }

  isShadowRoot(): boolean {
    return true;
  }

  canBeEmpty(): boolean {
    return false;
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
      type: 'layout-container',
      version: 1,
      first_element: this.getFirstElement()
    };
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns;
  }

  setTemplateColumns(templateColumns: string) {
    this.getWritable().__templateColumns = templateColumns;
  }
}

export function $createLayoutContainerNode(
  templateColumns: string,
): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns);
}

export function $isLayoutContainerNode(
  node: LexicalNode | null | undefined,
): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode;
}