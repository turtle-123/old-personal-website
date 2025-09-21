/** @module @lexical/overflow */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
} from 'lexical';

import {$applyNodeReplacement, ElementNode} from 'lexical';

export type SerializedOverflowNode = SerializedElementNode;
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class OverflowNode extends ElementNode {
  __version: number = CURRENT_VERSION;

  static getType(): string {
    return 'overflow';
  }

  static clone(node: OverflowNode): OverflowNode {
    return new OverflowNode(node.__key);
  }

  static importJSON(serializedNode: SerializedOverflowNode): OverflowNode {
    return $createOverflowNode();
  }

  static importDOM(): null {
    return null;
  }

  constructor(key?: NodeKey) {
    super(key);
    this.__type = 'overflow';
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'overflow',
      version: CURRENT_VERSION
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('span');
    const className = config.theme.characterLimit;
    if (typeof className === 'string') {
      div.className = className;
    }
    div.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    return div;
  }

  updateDOM(prevNode: OverflowNode, dom: HTMLElement): boolean {
    return false;
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): null | LexicalNode {
    const parent = this.getParentOrThrow();
    return parent.insertNewAfter(selection, restoreSelection);
  }

  excludeFromCopy(): boolean {
    return true;
  }
}

export function $createOverflowNode(): OverflowNode {
  return $applyNodeReplacement(new OverflowNode());
}

export function $isOverflowNode(
  node: LexicalNode | null | undefined,
): node is OverflowNode {
  return node instanceof OverflowNode;
}
