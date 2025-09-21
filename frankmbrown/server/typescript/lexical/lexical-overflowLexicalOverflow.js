/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ElementNode, $applyNodeReplacement } from './lexicalLexical.js';

/** @module @lexical/overflow */
const CURRENT_VERSION = 1;

/** @noInheritDoc */
class OverflowNode extends ElementNode {
  __version = CURRENT_VERSION;
  static getType() {
    return 'overflow';
  }
  static clone(node) {
    return new OverflowNode(node.__key);
  }
  static importJSON(serializedNode) {
    return $createOverflowNode();
  }
  static importDOM() {
    return null;
  }
  constructor(key) {
    super(key);
    this.__type = 'overflow';
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'overflow',
      version: CURRENT_VERSION
    };
  }
  createDOM(config) {
    const div = document.createElement('span');
    const className = config.theme.characterLimit;
    if (typeof className === 'string') {
      div.className = className;
    }
    div.setAttribute("data-v", String(CURRENT_VERSION));
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    return div;
  }
  updateDOM(prevNode, dom) {
    return false;
  }
  insertNewAfter(selection, restoreSelection = true) {
    const parent = this.getParentOrThrow();
    return parent.insertNewAfter(selection, restoreSelection);
  }
  excludeFromCopy() {
    return true;
  }
}
function $createOverflowNode() {
  return $applyNodeReplacement(new OverflowNode());
}
function $isOverflowNode(node) {
  return node instanceof OverflowNode;
}

export { $createOverflowNode, $isOverflowNode, OverflowNode };
