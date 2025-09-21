/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  GridSelection,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $isElementNode,
  $isRangeSelection,
  ElementNode,
} from 'lexical';

export type SerializedMarkNode = Spread<
  {
    ids: Array<string>,
    markClass: MarkNodeClassType
  },
  SerializedElementNode
>;

export type MarkNodeClassType = 'normal'|'primary'|'secondary'|'error'|'warning'|'info'|'success';
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class MarkNode extends ElementNode {
  /** @internal */
  __ids: Array<string>;
  __markClass: MarkNodeClassType = 'normal';
  __version: number = CURRENT_VERSION;
  static getType(): string {
    return 'mark';
  }
  static clone(node: MarkNode): MarkNode {
    return new MarkNode(Array.from(node.__ids), node.__key,node.__markClass);
  }
  static importDOM(): null {
    return null;
  }
  static importJSON(serializedNode: SerializedMarkNode): MarkNode {
    const node = $createMarkNode(serializedNode.ids,serializedNode.markClass);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  exportJSON(): SerializedMarkNode {
    return {
      ...super.exportJSON(),
      ids: this.getIDs(),
      type: 'mark',
      version: CURRENT_VERSION,
      markClass: this.getMarkClass()
    };
  }
  constructor(ids: Array<string>, key?: NodeKey, markClass?: MarkNodeClassType) {
    super(key);
    this.__markClass = markClass ? markClass : 'normal';
    this.__ids = ids || [];
  }
  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('mark');
    addClassNamesToElement(element, config.theme.mark);
    if (this.__ids.length > 1) {
      addClassNamesToElement(element, config.theme.markOverlap);
    }
    addClassNamesToElement(element,this.__markClass);
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(
    prevNode: MarkNode,
    element: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const prevIDs = prevNode.__ids;
    const nextIDs = this.__ids;
    const prevIDsCount = prevIDs.length;
    const nextIDsCount = nextIDs.length;
    const overlapTheme = config.theme.markOverlap;

    if (prevIDsCount !== nextIDsCount) {
      if (prevIDsCount === 1) {
        if (nextIDsCount === 2) {
          addClassNamesToElement(element, overlapTheme);
        }
      } else if (nextIDsCount === 1) {
        removeClassNamesFromElement(element, overlapTheme);
      }
    }
    return false;
  }
  hasID(id: string): boolean {
    const ids = this.getIDs();
    for (let i = 0; i < ids.length; i++) {
      if (id === ids[i]) {
        return true;
      }
    }
    return false;
  }
  getIDs(): Array<string> {
    const self = this.getLatest();
    return $isMarkNode(self) ? self.__ids : [];
  }
  addID(id: string): void {
    const self = this.getWritable();
    if ($isMarkNode(self)) {
      const ids = self.__ids;
      self.__ids = ids;
      for (let i = 0; i < ids.length; i++) {
        // If we already have it, don't add again
        if (id === ids[i]) return;
      }
      ids.push(id);
    }
  }

  deleteID(id: string): void {
    const self = this.getWritable();
    if ($isMarkNode(self)) {
      const ids = self.__ids;
      self.__ids = ids;
      for (let i = 0; i < ids.length; i++) {
        if (id === ids[i]) {
          ids.splice(i, 1);
          return;
        }
      }
    }
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection,
    );
    if ($isElementNode(element)) {
      const markNode = $createMarkNode(this.__ids,this.__markClass);
      element.append(markNode);
      return markNode;
    }
    return null;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection,
    destination: 'clone' | 'html',
  ): boolean {
    if (!$isRangeSelection(selection) || destination === 'html') {
      return false;
    }
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = anchor.getNode();
    const focusNode = focus.getNode();
    const isBackward = selection.isBackward();
    const selectionLength = isBackward
      ? anchor.offset - focus.offset
      : focus.offset - anchor.offset;
    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      this.getTextContent().length === selectionLength
    );
  }

  excludeFromCopy(destination: 'clone' | 'html'): boolean {
    return destination !== 'clone';
  }
  getMarkClass():MarkNodeClassType {
    const self = this.getLatest();
    return self.__markClass;
  }
  setMarkClass(input: MarkNodeClassType):this {
    const self = this.getWritable();
    self.__markClass = input;
    return this;
  }
}

export function $createMarkNode(ids: Array<string>,nodeClass?:MarkNodeClassType): MarkNode {
  return $applyNodeReplacement(new MarkNode(ids,undefined,nodeClass ? nodeClass : 'normal'));
}

export function $isMarkNode(node: LexicalNode | null): node is MarkNode {
  return node instanceof MarkNode;
}
