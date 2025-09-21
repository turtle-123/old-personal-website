/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ElementNode, createCommand, KEY_ARROW_DOWN_COMMAND, COMMAND_PRIORITY_LOW, KEY_ARROW_RIGHT_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ARROW_LEFT_COMMAND, $createParagraphNode, COMMAND_PRIORITY_EDITOR, $getNodeByKey, $getSelection, $isRangeSelection } from './lexicalLexical.js';
import { IS_REAL_BROWSER, getCurrentEditor, closeDialog } from './lexical-sharedLexicalShared.js';
import { mergeRegister, $insertNodeToNearestRoot, $findMatchingParent } from './lexical-utilsLexicalUtils.js';

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function $convertLayoutContainerElement(domNode) {
  const gridTemplateColumns = domNode.getAttribute('data-template-columns');
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (gridTemplateColumns) {
    const node = $createLayoutContainerNode(gridTemplateColumns);
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  }
  return null;
}
class LayoutContainerNode extends ElementNode {
  constructor(templateColumns, key) {
    super(key);
    this.__templateColumns = templateColumns;
  }
  static getType() {
    return 'layout-container';
  }
  static clone(node) {
    return new LayoutContainerNode(node.__templateColumns, node.__key);
  }
  createDOM(config) {
    const dom = document.createElement('div');
    dom.style.gridTemplateColumns = this.__templateColumns;
    dom.classList.add('rte-layout-container');
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  exportDOM() {
    const element = document.createElement('div');
    element.style.cssText = `grid-template-columns: ${this.__templateColumns}`;
    element.setAttribute('data-template-columns', this.__templateColumns);
    element.setAttribute('data-lexical-layout-container', 'true');
    element.className = "rte-layout-container";
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  updateDOM(prevNode, dom) {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns;
    }
    return false;
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-lexical-layout-container')) {
          return null;
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 4
        };
      }
    };
  }
  static importJSON(json) {
    const node = $createLayoutContainerNode(json.templateColumns);
    node.setFirstElement(json?.first_element);
    return node;
  }
  isShadowRoot() {
    return true;
  }
  canBeEmpty() {
    return false;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      templateColumns: this.__templateColumns,
      type: 'layout-container',
      version: 1,
      first_element: this.getFirstElement()
    };
  }
  getTemplateColumns() {
    return this.getLatest().__templateColumns;
  }
  setTemplateColumns(templateColumns) {
    this.getWritable().__templateColumns = templateColumns;
  }
}
function $createLayoutContainerNode(templateColumns) {
  return new LayoutContainerNode(templateColumns);
}
function $isLayoutContainerNode(node) {
  return node instanceof LayoutContainerNode;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
class LayoutItemNode extends ElementNode {
  static getType() {
    return 'layout-item';
  }
  static clone(node) {
    return new LayoutItemNode(node.__key);
  }
  createDOM(config) {
    const dom = document.createElement('div');
    dom.classList.add('rte-layout-item');
    return dom;
  }
  updateDOM() {
    return false;
  }
  exportDOM() {
    const element = document.createElement('div');
    element.setAttribute('data-lexical-layout-item', 'true');
    element.className = "rte-layout-item";
    return {
      element
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-lexical-layout-item')) {
          return null;
        }
        return {
          conversion: $convertLayoutItemElement,
          priority: 4
        };
      }
    };
  }
  static importJSON() {
    return $createLayoutItemNode();
  }
  isShadowRoot() {
    return true;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'layout-item',
      version: 1
    };
  }
}
function $createLayoutItemNode() {
  return new LayoutItemNode();
}
function $isLayoutItemNode(node) {
  return node instanceof LayoutItemNode;
}
function $convertLayoutItemElement(domNode) {
  const node = $createLayoutItemNode();
  return {
    node
  };
}

const INSERT_LAYOUT_COMMAND = createCommand();
const UPDATE_LAYOUT_COMMAND = createCommand();
function getItemsCountFromTemplate(template) {
  return template.trim().split(/\s+/).length;
}
const ValidColumnValues = new Set(["2-1", "2-2", "3-1", "3-2", "4"]);
const LAYOUTS = {
  "2-1": {
    label: '2 columns (equal width)',
    value: '1fr 1fr'
  },
  "2-2": {
    label: '2 columns (25% - 75%)',
    value: '1fr 3fr'
  },
  "3-1": {
    label: '3 columns (equal width)',
    value: '1fr 1fr 1fr'
  },
  "3-2": {
    label: '3 columns (25% - 50% - 25%)',
    value: '1fr 2fr 1fr'
  },
  "4": {
    label: '4 columns (equal width)',
    value: '1fr 1fr 1fr 1fr'
  }
};
function handleSubmitColumnLayout(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  const colInput = document.getElementById('ins-col-lex-input');
  if (dialog && colInput) {
    const val = colInput.value;
    if (ValidColumnValues.has(val)) {
      const layout = LAYOUTS[val];
      if (layout) {
        const editor = getCurrentEditor();
        if (editor) editor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout.value);
      }
    }
    closeDialog(dialog);
  }
}
function getOnOpenColumnDialog(e) {
  const columnDialog = document.getElementById('column-layout-lexical');
  if (columnDialog) {
    const form = columnDialog.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleSubmitColumnLayout);
    }
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: columnDialog
      }
    }));
  }
}
function registerLayoutEditable(editor) {
  if (editor.hasNodes([LayoutContainerNode, LayoutItemNode])) {
    const $onEscape = before => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed() && selection.anchor.offset === 0) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isLayoutContainerNode);
        if ($isLayoutContainerNode(container)) {
          const parent = container.getParent();
          const child = parent && (before ? parent.getFirstChild() : parent?.getLastChild());
          const descendant = before ? container.getFirstDescendant()?.getKey() : container.getLastDescendant()?.getKey();
          if (parent !== null && child === container && selection.anchor.key === descendant) {
            if (before) {
              container.insertBefore($createParagraphNode());
            } else {
              container.insertAfter($createParagraphNode());
            }
          }
        }
      }
      return false;
    };
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenColumnDialog);
    return mergeRegister(
    // When layout is the last child pressing down/right arrow will insert paragraph
    // below it to allow adding more content. It's similar what $insertBlockNode
    // (mainly for decorators), except it'll always be possible to continue adding
    // new content even if trailing paragraph is accidentally deleted
    editor.registerCommand(KEY_ARROW_DOWN_COMMAND, () => $onEscape(false), COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, () => $onEscape(false), COMMAND_PRIORITY_LOW),
    // When layout is the first child pressing up/left arrow will insert paragraph
    // above it to allow adding more content. It's similar what $insertBlockNode
    // (mainly for decorators), except it'll always be possible to continue adding
    // new content even if leading paragraph is accidentally deleted
    editor.registerCommand(KEY_ARROW_UP_COMMAND, () => $onEscape(true), COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_LEFT_COMMAND, () => $onEscape(true), COMMAND_PRIORITY_LOW), editor.registerCommand(INSERT_LAYOUT_COMMAND, template => {
      editor.update(() => {
        const container = $createLayoutContainerNode(template);
        const itemsCount = getItemsCountFromTemplate(template);
        for (let i = 0; i < itemsCount; i++) {
          container.append($createLayoutItemNode().append($createParagraphNode()));
        }
        $insertNodeToNearestRoot(container);
        container.selectStart();
      });
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(UPDATE_LAYOUT_COMMAND, ({
      template,
      nodeKey
    }) => {
      editor.update(() => {
        const container = $getNodeByKey(nodeKey);
        if (!$isLayoutContainerNode(container)) {
          return;
        }
        const itemsCount = getItemsCountFromTemplate(template);
        const prevItemsCount = getItemsCountFromTemplate(container.getTemplateColumns());

        // Add or remove extra columns if new template does not match existing one
        if (itemsCount > prevItemsCount) {
          for (let i = prevItemsCount; i < itemsCount; i++) {
            container.append($createLayoutItemNode().append($createParagraphNode()));
          }
        } else if (itemsCount < prevItemsCount) {
          for (let i = prevItemsCount - 1; i >= itemsCount; i--) {
            const layoutItem = container.getChildAtIndex(i);
            if ($isLayoutItemNode(layoutItem)) {
              layoutItem.remove();
            }
          }
        }
        container.setTemplateColumns(template);
      });
      return true;
    }, COMMAND_PRIORITY_EDITOR),
    // Structure enforcing transformers for each node type. In case nesting structure is not
    // "Container > Item" it'll unwrap nodes and convert it back
    // to regular content.
    editor.registerNodeTransform(LayoutItemNode, node => {
      const parent = node.getParent();
      if (!$isLayoutContainerNode(parent)) {
        const children = node.getChildren();
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
      }
    }), editor.registerNodeTransform(LayoutContainerNode, node => {
      const children = node.getChildren();
      if (!children.every($isLayoutItemNode)) {
        for (const child of children) {
          node.insertBefore(child);
        }
        node.remove();
      }
    }));
  } else {
    console.error("Editor doesn;t have LayoutContainerNode or LayoutItemNode registered.");
  }
  return () => {};
}

export { $createLayoutContainerNode, $createLayoutItemNode, $isLayoutContainerNode, $isLayoutItemNode, LayoutContainerNode, LayoutItemNode, registerLayoutEditable };
