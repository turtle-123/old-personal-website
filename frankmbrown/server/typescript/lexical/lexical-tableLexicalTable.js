/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ElementNode, isHTMLElement, $applyNodeReplacement, $isTextNode, DEPRECATED_GridRowNode, DEPRECATED_GridNode, $getNearestNodeFromDOMNode, TableWrapperNode, $nodesOfType, $isTableWrapperNode, $createTableWrapperNode, COMMAND_PRIORITY_EDITOR, $createTextNode, $getNodeByKey, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_CRITICAL, FORMAT_TEXT_COMMAND, $getSelection, DEPRECATED_$isGridSelection, COMMAND_PRIORITY_LOW, FORMAT_ELEMENT_COMMAND, $isElementNode, COMMAND_PRIORITY_HIGH, $isRangeSelection, ALLOWED_BORDER_STYLES, parseColorStr, VALID_HEX_REGEX, $setSelection, DEPRECATED_$createGridSelection, $createRangeSelection, $getRoot, DEPRECATED_$getNodeTriplet, DEPRECATED_$computeGridMap, DEPRECATED_$isGridRowNode, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, KEY_ESCAPE_COMMAND, DELETE_WORD_COMMAND, DELETE_LINE_COMMAND, DELETE_CHARACTER_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, CONTROLLED_TEXT_INSERTION_COMMAND, KEY_TAB_COMMAND, FOCUS_COMMAND, $getPreviousSelection, $isLineBreakNode, $isDecoratorNode, DEPRECATED_GridCellNode, createCommand } from './lexicalLexical.js';
import { isHTMLElement as isHTMLElement$1, addClassNamesToElement, $wrapNodeInElement, mergeRegister, $insertNodeToNearestRoot, $findMatchingParent, removeClassNamesFromElement } from './lexical-utilsLexicalUtils.js';
import { IS_REAL_BROWSER, isHTMLElementCustom, TEXT_COLOR_CHANGE, BACKGROUND_COLOR_CHANGE, MAKE_TRANSPARENT, CLEAR_TEXT_FORMATTING, openDialog, SET_EDITOR_COMMAND, REGISTER_TOOLBAR_LISTENERS, getEditorInstances, editorCanChangeSize, getNoColor, getCurrentEditor, getDefaultBackground, getDefaultTextColor, setSelectInput, getFileListForFileInput, openLoadingDialog, getCsrfToken, closeLoadingDialog, closeDialog, isTouchDevice } from './lexical-sharedLexicalShared.js';
import { offset, shift, flip, computePosition, autoUpdate } from '@floating-ui/dom';
import { FONT_FAMILY_CHANGE, FONT_WEIGHT_CHANGE, FONT_SIZE_CHANGE, fontSizeChangeCallback, fontWeightChangeCallback, fontFamilyChangeCallback, backgroundColorChangeCallback, clearTextFormattingCallback, makeTransparentCallback, textColorChangeCallback } from './lexical-toolbarLexicalToolbar.js';
import { DRAG_DROP_PASTE } from './lexical-rich-textLexicalRichText.js';

const CURRENT_VERSION$3 = 1;

/** @noInheritDoc */
class CellParagraphNode extends ElementNode {
  __version = CURRENT_VERSION$3;
  constructor(key) {
    super(key);
    this.__first = null;
    this.__last = null;
    this.__size = 0;
    this.__format = 2;
    this.__indent = 0;
    this.__dir = null;
  }
  static getType() {
    return 'cell-paragraph';
  }
  static clone(node) {
    return new CellParagraphNode(node.__key);
  }

  // View

  createDOM(config) {
    const dom = document.createElement('p');
    dom.className = "lex-grid-p";
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  updateDOM(prevNode, dom, config) {
    return false;
  }
  static importDOM() {
    return {
      p: node => {
        if (node.classList.contains('lex-grid-p')) {
          return {
            conversion: convertCellParagraphElement,
            priority: 3
          };
        } else {
          return null;
        }
      }
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
      const indent = this.getIndent();
      if (indent > 0) {
        // padding-inline-start is not widely supported in email HTML, but
        // Lexical Reconciler uses padding-inline-start. Using text-indent instead.
        element.style.textIndent = `${indent * 20}px`;
      }
      element.setAttribute("data-v", String(CURRENT_VERSION$3));
    }
    return {
      element
    };
  }
  static importJSON(serializedNode) {
    const node = $createCellParagraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'cell-paragraph',
      version: CURRENT_VERSION$3
    };
  }

  // Mutation

  insertNewAfter(_, restoreSelection) {
    const newElement = $createCellParagraphNode();
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }
  collapseAtStart() {
    const children = this.getChildren();
    // If we have an empty (trimmed) first paragraph and try and remove it,
    // delete the paragraph as long as we have another sibling to go to
    if (children.length === 0 || $isTextNode(children[0]) && children[0].getTextContent().trim() === '') {
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
    }
    return false;
  }
}
function convertCellParagraphElement(element) {
  const node = $createCellParagraphNode();
  if (element.style) {
    node.setFormat(element.style.textAlign);
    const indent = parseInt(element.style.textIndent, 10) / 20;
    if (indent > 0) {
      node.setIndent(indent);
    }
  }
  return {
    node
  };
}
function $createCellParagraphNode() {
  return $applyNodeReplacement(new CellParagraphNode());
}
function $isCellParagraphNode(node) {
  return node instanceof CellParagraphNode;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const PIXEL_VALUE_REG_EXP = /^(\d+(?:\.\d+)?)px$/;

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CURRENT_VERSION$2 = 1;

/** @noInheritDoc */
class TableRowNode extends DEPRECATED_GridRowNode {
  /** @internal */

  __version = CURRENT_VERSION$2;
  static getType() {
    return 'tablerow';
  }
  static clone(node) {
    return new TableRowNode(node.__height, node.__key);
  }
  static importDOM() {
    return {
      tr: node => ({
        conversion: convertTableRowElement,
        priority: 0
      })
    };
  }
  exportDOM(editor) {
    const {
      element
    } = super.exportDOM(editor);
    if (element) {
      if (this.__height) {
        const element_ = element;
        element_.style.height = `${this.getHeight()}px`;
      }
      if (isHTMLElement$1(element)) {
        element.setAttribute('data-v', String(CURRENT_VERSION$2));
      }
    }
    return {
      element
    };
  }
  static importJSON(serializedNode) {
    return $createTableRowNode(serializedNode.height);
  }
  constructor(height, key) {
    super(key);
    this.__height = height;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tablerow',
      version: CURRENT_VERSION$2
    };
  }
  createDOM(config) {
    const element = document.createElement('tr');
    if (this.__height) {
      element.style.height = `${this.__height}px`;
    }
    addClassNamesToElement(element, config.theme.tableRow);
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  isShadowRoot() {
    return true;
  }
  setHeight(height) {
    const self = this.getWritable();
    self.__height = height;
    return this.__height;
  }
  getHeight() {
    return this.getLatest().__height;
  }
  updateDOM(prevNode) {
    return prevNode.__height !== this.__height;
  }
  canBeEmpty() {
    return false;
  }
  canIndent() {
    return false;
  }
}
function convertTableRowElement(domNode) {
  const domNode_ = domNode;
  let height = undefined;
  if (PIXEL_VALUE_REG_EXP.test(domNode_.style.height)) {
    height = parseFloat(domNode_.style.height);
  }
  return {
    node: $createTableRowNode(height)
  };
}
function $createTableRowNode(height) {
  return $applyNodeReplacement(new TableRowNode(height));
}
function $isTableRowNode(node) {
  return node instanceof TableRowNode;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const ALIGN_LEFT_TEXT = "10px auto 10px 0px";
const ALIGN_CENTER_TEXT = "10px auto";
const ALIGN_RIGHT_TEXT = "10px 0px 10px auto";
const CURRENT_VERSION$1 = 1;

/** @noInheritDoc */
class TableNode extends DEPRECATED_GridNode {
  /** @internal */

  __version = CURRENT_VERSION$1;
  static getType() {
    return 'table';
  }
  static clone(node) {
    return new TableNode({
      caption: node.getCaption(),
      bandedRows: node.getBandedRows(),
      bandedCols: node.getBandedCols(),
      align: node.getAlign()
    }, node.__key);
  }
  static importDOM() {
    return {
      table: _node => ({
        conversion: convertTableElement,
        priority: 1
      })
    };
  }
  static importJSON(_serializedNode) {
    const node = $createTableNode({
      caption: _serializedNode.caption,
      bandedRows: _serializedNode.bandedRows,
      bandedCols: _serializedNode.bandedCols,
      align: _serializedNode.align
    });
    node.setFirstElement(_serializedNode?.first_element);
    return node;
  }
  constructor(obj, key) {
    super(key);
    this.__caption = obj?.caption;
    this.__bandedRows = obj?.bandedRows || false;
    this.__bandedCols = obj?.bandedCols || false;
    this.__align = obj?.align || 'center';
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'table',
      version: CURRENT_VERSION$1,
      caption: this.getCaption(),
      bandedCols: this.getBandedCols(),
      bandedRows: this.getBandedRows(),
      align: this.getAlign(),
      first_element: this.getFirstElement()
    };
  }
  createDOM(config, editor) {
    const tableElement = document.createElement('table');
    tableElement.setAttribute('cellspacing', '0');
    addClassNamesToElement(tableElement, config.theme.table);
    if (this.__caption) {
      const caption = document.createElement('caption');
      if (editor?.isEditable()) caption.setAttribute('contenteditable', 'false');
      caption.className = "h5 bold";
      caption.innerText = this.__caption;
      tableElement.append(caption);
      tableElement.setAttribute('data-caption', this.__caption);
    }
    if (this.__bandedRows) tableElement.classList.add('banded-row');
    if (this.__bandedCols) tableElement.classList.add('banded-col');
    if (this.__align === 'left') {
      tableElement.style.setProperty('margin', ALIGN_LEFT_TEXT, 'important');
    } else if (this.__align === 'center') {
      tableElement.style.setProperty('margin', ALIGN_CENTER_TEXT, 'important');
    } else if (this.__align === 'right') {
      tableElement.style.setProperty('margin', ALIGN_RIGHT_TEXT, 'important');
    }
    tableElement.setAttribute("data-v", String(CURRENT_VERSION$1));
    if (this.getFirstElement()) tableElement.classList.add('first-rte-element');
    if (this.getLastElement()) tableElement.classList.add('last-rte-element');
    return tableElement;
  }
  updateDOM(prevNode, dom, config) {
    return prevNode.__bandedCols !== this.__bandedCols || prevNode.__bandedRows !== this.__bandedRows || prevNode.__caption !== this.__caption || prevNode.__align !== this.__align;
  }
  exportDOM(editor) {
    const caption = this.getCaption();
    const bandedCols = this.getBandedCols();
    const bandedRows = this.getBandedRows();
    const align = this.getAlign();
    return {
      ...super.exportDOM(editor),
      after: tableElement => {
        if (tableElement) {
          const newElement = tableElement.cloneNode();
          if (isHTMLElement$1(tableElement)) {
            if (this.getFirstElement() && !!!IS_REAL_BROWSER) tableElement.classList.add('first-rte-element');
            if (this.getLastElement() && !!!IS_REAL_BROWSER) tableElement.classList.add('last-rte-element');
            if (caption) tableElement.setAttribute('data-caption', caption);
            if (bandedCols) tableElement.classList.add('banded-col');
            if (bandedRows) tableElement.classList.add('banded-row');
            if (align === 'left') {
              tableElement.style.setProperty('margin', ALIGN_LEFT_TEXT, 'important');
            } else if (align === 'center') {
              tableElement.style.setProperty('margin', ALIGN_CENTER_TEXT, 'important');
            } else if (align === 'right') {
              tableElement.style.setProperty('margin', ALIGN_RIGHT_TEXT, 'important');
            }
            tableElement.setAttribute("data-v", String(CURRENT_VERSION$1));
          }
          const colGroup = document.createElement('colgroup');
          const tBody = document.createElement('tbody');
          if (isHTMLElement$1(tableElement)) {
            tBody.append(...tableElement.children);
          }
          const firstRow = this.getFirstChildOrThrow();
          if (!$isTableRowNode(firstRow)) {
            throw new Error('Expected to find row node.');
          }
          const colCount = firstRow.getChildrenSize();
          for (let i = 0; i < colCount; i++) {
            const col = document.createElement('col');
            colGroup.append(col);
          }
          newElement.replaceChildren(colGroup, tBody);
          return newElement;
        }
      }
    };
  }

  // TODO 0.10 deprecate
  canExtractContents() {
    return false;
  }
  canBeEmpty() {
    return false;
  }
  isShadowRoot() {
    return true;
  }
  getCordsFromCellNode(tableCellNode, grid) {
    const {
      rows,
      cells
    } = grid;
    for (let y = 0; y < rows; y++) {
      const row = cells[y];
      if (row == null) {
        continue;
      }
      const x = row.findIndex(cell => {
        if (!cell) return;
        const {
          elem
        } = cell;
        const cellNode = $getNearestNodeFromDOMNode(elem);
        return cellNode === tableCellNode;
      });
      if (x !== -1) {
        return {
          x,
          y
        };
      }
    }
    throw new Error('Cell not found in table.');
  }
  getCellFromCords(x, y, grid) {
    const {
      cells
    } = grid;
    const row = cells[y];
    if (row == null) {
      return null;
    }
    const cell = row[x];
    if (cell == null) {
      return null;
    }
    return cell;
  }
  getCellFromCordsOrThrow(x, y, grid) {
    const cell = this.getCellFromCords(x, y, grid);
    if (!cell) {
      throw new Error('Cell not found at cords.');
    }
    return cell;
  }
  getCellNodeFromCords(x, y, grid) {
    const cell = this.getCellFromCords(x, y, grid);
    if (cell == null) {
      return null;
    }
    const node = $getNearestNodeFromDOMNode(cell.elem);
    if ($isTableCellNode(node)) {
      return node;
    }
    return null;
  }
  getCellNodeFromCordsOrThrow(x, y, grid) {
    const node = this.getCellNodeFromCords(x, y, grid);
    if (!node) {
      throw new Error('Node at cords not TableCellNode.');
    }
    return node;
  }
  canSelectBefore() {
    return true;
  }
  canIndent() {
    return false;
  }
  getCaption() {
    const self = this.getLatest();
    return self.__caption;
  }
  setCaption(s) {
    const self = this.getWritable();
    self.__caption = s;
    return self;
  }
  getBandedRows() {
    const self = this.getLatest();
    return self.__bandedRows;
  }
  setBandedRows(b) {
    const self = this.getWritable();
    self.__bandedRows = b;
    return self;
  }
  getBandedCols() {
    const self = this.getLatest();
    return self.__bandedCols;
  }
  setBandedCols(b) {
    const self = this.getWritable();
    self.__bandedCols = b;
    return self;
  }
  getAlign() {
    const self = this.getLatest();
    return self.__align;
  }
  setAlign(input) {
    const self = this.getWritable();
    self.__align = input;
    return self;
  }
}
function $getElementGridForTableNode(editor, tableNode) {
  const tableElement = editor.getElementByKey(tableNode.getKey());
  if (tableElement == null) {
    throw new Error('Table Element Not Found');
  }
  return getTableGrid(tableElement);
}
function convertTableElement(_domNode) {
  if (isHTMLElementCustom(_domNode)) {
    const first_element = _domNode.classList.contains('first-rte-element');
    const last_element = _domNode.classList.contains('last-rte-element');
    const caption = _domNode.getAttribute('data-caption');
    const bandedRows = _domNode.classList.contains('banded-row');
    const bandedCols = _domNode.classList.contains('banded-col');
    const alignText = _domNode.style.getPropertyValue('margin');
    var align;
    if (alignText === ALIGN_LEFT_TEXT) align = "left";else if (alignText === ALIGN_CENTER_TEXT) align = "center";else if (alignText === ALIGN_RIGHT_TEXT) align = "right";
    const node = $createTableNode({
      caption: caption ? caption : undefined,
      bandedCols,
      bandedRows,
      align: align ? align : 'center'
    });
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  } else {
    return {
      node: $createTableNode()
    };
  }
}
function $createTableNode(obj) {
  const tableNode = $applyNodeReplacement(new TableNode(obj));
  return tableNode;
}
function $isTableNode(node) {
  return node instanceof TableNode;
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
 * @todo Need to work on adding / removing columns / rows when cells are merged
 * @todo Maybe adding borders for the cells 
 * @todo Working on nested tables
 */

/* --------------------------------------- Variables ------------------------------------ */
var LAST_SELECTED_TABLE_NAMESPACE = '';
/**
 * JSON that was uploaded for creating a table from a csv / excel file
 */

var RECENT_JSON = undefined;
/**
 * See [This for a Reference](https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/TableCellResizer/index.tsx)
 */
const TABLE_STATE = {};
const getDefaultTableState = () => ({
  activeCell: null,
  selection: null,
  columns: null,
  rows: null,
  backgroundColor: null,
  rectangular: true,
  canUnmergeCells: false,
  canMergeCells: false,
  canAddRowHeader: true,
  canAddColHeader: true,
  canRemoveColHeader: true,
  canRemoveRowHeader: true,
  rowIndexes: new Set(),
  colIndexes: new Set(),
  bandedRows: false,
  bandedCols: false,
  tableKey: "-1",
  caption: undefined,
  align: 'center',
  namespace: '',
  canDeleteColumn: false
});
var tableSelections = {};
/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 * 
 */
const autoUpdateObject = {};
const VALID_ALIGN_TABLE = new Set(['left', 'center', 'right']);
const TABLE_ACTION_MENU_ID = 'lexical-table-action-menu';
var FOCUS_OUT_TIMEOUT = undefined;

/*------------------------------- Helper Functions ---------------------------------- */
function clearInnerHTML(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}
function clearTableState(editorNamespace) {
  if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
  TABLE_STATE[editorNamespace].activeCell = null;
  TABLE_STATE[editorNamespace].selection = null;
  TABLE_STATE[editorNamespace].columns = null;
  TABLE_STATE[editorNamespace].rows = null;
  TABLE_STATE[editorNamespace].backgroundColor = null;
  TABLE_STATE[editorNamespace].rectangular = true;
  TABLE_STATE[editorNamespace].canUnmergeCells = false;
  TABLE_STATE[editorNamespace].canMergeCells = false;
  TABLE_STATE[editorNamespace].canAddRowHeader = true;
  TABLE_STATE[editorNamespace].canAddColHeader = true;
  TABLE_STATE[editorNamespace].canRemoveColHeader = true;
  TABLE_STATE[editorNamespace].canRemoveRowHeader = true;
  TABLE_STATE[editorNamespace].rowIndexes = new Set();
  TABLE_STATE[editorNamespace].colIndexes = new Set();
  TABLE_STATE[editorNamespace].bandedRows = false;
  TABLE_STATE[editorNamespace].bandedCols = false;
  TABLE_STATE[editorNamespace].tableKey = "-1";
  TABLE_STATE[editorNamespace].caption = undefined;
  TABLE_STATE[editorNamespace].align = "center";
  TABLE_STATE[editorNamespace].namespace = '';
  TABLE_STATE[editorNamespace].canDeleteColumn = true;
}

/* ------------------------------- Upload Data to Table Form ------------------------------------- */
function getUploadTableForm() {
  const dialog = document.getElementById('tables-lexical');
  if (dialog) {
    const form = dialog.querySelector('form#lexical-insert-table-upload-data');
    if (form) {
      const fileUpload = dialog.querySelector('input#upload-data-to-table');
      const includeHeadingRowInput = dialog.querySelector('input#lexical-table-include-heading-row-upload');
      const includeHeadingRow = includeHeadingRowInput ? includeHeadingRowInput.checked : true;
      const includeHeadingColumnInput = dialog.querySelector('input#lexical-table-include-heading-column-upload');
      const includeHeadingCol = includeHeadingColumnInput ? includeHeadingColumnInput.checked : true;
      const bandedRowsInput = dialog.querySelector('input#lexical-table-banded-rows-upload');
      const bandedRows = bandedRowsInput ? bandedRowsInput.checked : false;
      const bandedColsInput = dialog.querySelector('input#lexical-table-banded-cols-upload');
      const bandedCols = bandedColsInput ? bandedColsInput.checked : false;
      const preview = dialog.querySelector('output[form="lexical-insert-table-upload-data"][data-preview]');
      const includeCaptionInput = dialog.querySelector('input#lexical-table-include-caption-upload');
      const includeCaption = includeCaptionInput ? includeCaptionInput.checked : false;
      const captionInput = dialog.querySelector('input#lex-table-caption-input-upload');
      const alignInputs = Array.from(dialog.querySelectorAll('input[name="lexical-insert-table-align-upload"]'));
      var align = 'center';
      if (Array.isArray(alignInputs)) {
        const alignValue = alignInputs.filter(obj => obj.checked === true).map(obj => obj.value)[0];
        if (VALID_ALIGN_TABLE.has(alignValue)) align = alignValue;
      }
      const caption = captionInput ? captionInput.value : '';
      return {
        fileUpload,
        dialog,
        form,
        headingRow: includeHeadingRow,
        headingCol: includeHeadingCol,
        bandedRows,
        bandedCols,
        preview,
        includeCaption,
        captionInput,
        caption,
        align
      };
    } else return null;
  } else return null;
}
/**
 * After there is a change event on the upload data input, replace the input element
 * @param input 
 */
function cloneDataUploadInput(input) {
  const newInput = document.createElement('input');
  newInput.name = input.name;
  newInput.id = input.id;
  newInput.className = input.className;
  newInput.type = input.type;
  newInput.accept = input.accept;
  input.replaceWith(newInput);
  newInput.addEventListener('change', handleUploadData);
}
function updateUploadTableFormOutput() {
  const tableForm = getUploadTableForm();
  if (tableForm) {
    const output = tableForm.preview;
    if (output) {
      const table = output.querySelector('table');
      if (table) {
        const captionEl = table.querySelector('caption');
        if (tableForm.bandedCols && !!!table.classList.contains('banded-col')) table.classList.add("banded-col");
        if (tableForm.bandedRows && !!!table.classList.contains('banded-row')) table.classList.add("banded-row");
        if (tableForm.align === "left") table.style.setProperty('margin', '10px auto 10px 0px', 'important');else if (tableForm.align === "center") table.style.setProperty('margin', '10px auto', 'important');else if (tableForm.align === "right") table.style.setProperty('margin', '10px 0px 10px auto', 'important');
        if (tableForm.includeCaption) {
          if (tableForm.captionInput) tableForm.captionInput.removeAttribute('disabled');
          if (!!!captionEl) {
            const newCaptionEl = document.createElement('caption');
            newCaptionEl.innerText = tableForm.caption;
            table.insertAdjacentElement("afterbegin", newCaptionEl);
          } else {
            if (captionEl.innerText !== tableForm.caption) {
              captionEl.innerText = tableForm.caption;
            }
          }
        } else {
          if (captionEl) captionEl.remove();
          if (tableForm.captionInput) tableForm.captionInput.setAttribute('disabled', '');
        }
        const cellClassName = "rte-tableCell";
        const cellHeadingClassName = "rte-tableCell rte-tableCellHeader";
        const possibleTableColNodes = Array.from(table.querySelectorAll('tr:first-child>*'));
        if (possibleTableColNodes.length) {
          // Include heading col, nodes should be TH nodes with classNames = cellHeadingClassName and scope="col"
          if (tableForm.headingCol) {
            possibleTableColNodes.forEach(cell => {
              var cellToCheck = cell;
              if (cellToCheck.tagName !== 'TH') {
                const newCell = document.createElement('th');
                newCell.style.setProperty("text-align", "center");
                newCell.setAttribute('scope', 'col');
                newCell.scope = 'col';
                newCell.className = cellHeadingClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className !== cellHeadingClassName) cellToCheck.className = cellHeadingClassName;
            });
          } else {
            possibleTableColNodes.forEach(cell => {
              var cellToCheck = cell;
              if (cellToCheck.tagName !== 'TD') {
                const newCell = document.createElement('td');
                newCell.style.setProperty("text-align", "center");
                newCell.className = cellClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className !== cellClassName) cellToCheck.className = cellClassName;
            });
          }
        }
        const possibleHeadingRowNodes = Array.from(table.querySelectorAll('tr>*:first-child'));
        if (possibleHeadingRowNodes.length) {
          // Include heading row, nodes should be TH nodes with classNames = cellHeadingClassName and scope="row"
          if (tableForm.headingRow) {
            possibleHeadingRowNodes.forEach(cell => {
              var cellToCheck = cell;
              if (cellToCheck.tagName !== 'TH') {
                const newCell = document.createElement('th');
                newCell.style.setProperty("text-align", "center");
                newCell.setAttribute('scope', 'row');
                newCell.scope = 'row';
                newCell.className = cellHeadingClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className !== cellHeadingClassName) cellToCheck.className = cellHeadingClassName;
            });
          } else {
            possibleHeadingRowNodes.forEach(cell => {
              var cellToCheck = cell;
              if (cellToCheck.tagName !== 'TD') {
                const newCell = document.createElement('td');
                newCell.style.setProperty("text-align", "center");
                newCell.className = cellClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className !== cellClassName) cellToCheck.className = cellClassName;
            });
          }
        }
      }
    }
  }
}

/**
 * When the file input for uploading excel / csv files changes, upload the data to the server
 * @param this 
 * @param e 
 */
function handleUploadData(e) {
  const htmlEl = document.querySelector('html');
  const editor = getCurrentEditor();
  if (this.files && this.files.length && htmlEl && editor) {
    var output;
    var submitButton = undefined;
    const file = this.files[0];
    const data = new FormData();
    const form = this.closest('form');
    if (form) {
      output = document.querySelector(`output[form="${form.id}"]`);
      submitButton = form.querySelector('button[type="submit"]');
    }
    data.append('file', file);
    openLoadingDialog('Creating table from uploaded file...');
    fetch('/api/lexical-table', {
      method: 'POST',
      body: data,
      headers: {
        'X-CSRF-Token': getCsrfToken()
      }
    }).then(async res => {
      if (res.status !== 200) {
        const {
          html
        } = await res.json();
        if (form) form.insertAdjacentHTML("beforeend", html);
        if (form) htmlEl.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED', {
          detail: {
            el: form
          }
        }));
      } else {
        const {
          html,
          json
        } = await res.json();
        const editorNamespace = editor._config.namespace;
        RECENT_JSON = {
          editorNamespace,
          json
        };
        if (output) output.innerHTML = html;
        updateUploadTableFormOutput();
        if (submitButton && submitButton.hasAttribute('disabled')) submitButton.removeAttribute('disabled');
      }
      closeLoadingDialog();
      cloneDataUploadInput(this);
    }).catch(error => {
      closeLoadingDialog();
      cloneDataUploadInput(this);
    });
  }
}
/**
 * Upload table form submit event, add the data to the table if there is RECENT_JSON object and the r
 * @param this 
 * @param e 
 */
function handleUploadTableFormSubmit(e) {
  const form = getUploadTableForm();
  const editor = getCurrentEditor();
  if (form && editor) {
    if (RECENT_JSON && RECENT_JSON.json && RECENT_JSON.editorNamespace === editor._config.namespace) {
      const includeHeaders = {
        rows: form.headingRow,
        columns: form.headingCol
      };
      editor.dispatchCommand(INSERT_TABLE_COMMAND_WITH_DATA, {
        columns: RECENT_JSON.json[0].length.toFixed(0),
        rows: RECENT_JSON.json.length.toFixed(0),
        includeHeaders,
        caption: form.includeCaption ? form.caption : undefined,
        bandedRows: form.bandedRows,
        bandedCols: form.bandedCols,
        align: form.align,
        json: RECENT_JSON.json
      });
      if (form.preview) clearInnerHTML(form.preview);
      form.form.reset();
      closeDialog(form.dialog);
    }
  }
}
/**
 * On table form change, if a `<table>` element exists in the `<output>` element, update the `<table>` element
 * @param this 
 * @param e 
 */
function handleUploadTableFormChange() {
  const tableForm = getUploadTableForm();
  const editor = getCurrentEditor();
  if (tableForm && editor) {
    const submitButton = tableForm.form.querySelector('button[type="submit"]');
    if (submitButton) {
      if (RECENT_JSON && RECENT_JSON.editorNamespace === editor._config.namespace && submitButton.hasAttribute('disabled')) submitButton.removeAttribute('disabled');else if (!!!submitButton.hasAttribute('disabled') && (!!!RECENT_JSON || RECENT_JSON.editorNamespace !== editor._config.namespace)) submitButton.setAttribute('disabled', '');
    }
    updateUploadTableFormOutput();
  }
}

/* ------------------------------- Create Table Form ------------------------------------- */
/**
 * Get the table dialog and form and inputs
 */
function getTableForm() {
  const dialog = document.getElementById('tables-lexical');
  if (dialog) {
    const form = dialog.querySelector('form#lexical-insert-table-form');
    if (form) {
      const includeHeadingRowInput = dialog.querySelector('input#lexical-table-include-heading-row');
      const includeHeadingRow = includeHeadingRowInput ? includeHeadingRowInput.checked : true;
      const includeHeadingColumnInput = dialog.querySelector('input#lexical-table-include-heading-column');
      const includeHeadingCol = includeHeadingColumnInput ? includeHeadingColumnInput.checked : true;
      const bandedRowsInput = dialog.querySelector('input#lexical-table-banded-rows');
      const bandedRows = bandedRowsInput ? bandedRowsInput.checked : false;
      const bandedColsInput = dialog.querySelector('input#lexical-table-banded-cols');
      const bandedCols = bandedColsInput ? bandedColsInput.checked : false;
      const numberOfRowsInput = dialog.querySelector('input#lexical-table-number-rows');
      const numberOfRows = numberOfRowsInput ? Math.max(Math.min(parseInt(numberOfRowsInput.value), 50), 2) : 5;
      const numberOfColsInput = dialog.querySelector('input#lexical-table-number-cols');
      const numberOfCols = numberOfColsInput ? Math.max(Math.min(parseInt(numberOfColsInput.value), 50), 2) : 5;
      const preview = dialog.querySelector('output[form="lexical-insert-table-form"][data-preview]');
      const includeCaptionInput = dialog.querySelector('input#lexical-table-include-caption');
      const includeCaption = includeCaptionInput ? includeCaptionInput.checked : false;
      const captionInput = dialog.querySelector('input#lex-table-caption-input');
      const alignInputs = Array.from(dialog.querySelectorAll('input[name="lexical-insert-table-align"]'));
      var align = 'center';
      if (Array.isArray(alignInputs)) {
        const alignValue = alignInputs.filter(obj => obj.checked === true).map(obj => obj.value)[0];
        if (VALID_ALIGN_TABLE.has(alignValue)) align = alignValue;
      }
      const caption = captionInput ? captionInput.value : '';
      return {
        dialog,
        form,
        headingRow: includeHeadingRow,
        headingCol: includeHeadingCol,
        bandedRows,
        bandedCols,
        numRows: numberOfRows,
        numCols: numberOfCols,
        preview,
        includeCaption,
        captionInput,
        caption,
        align
      };
    } else return null;
  } else return null;
}

/* ------------------------------- Edit Table Form ------------------------------------- */
function getEditTableForm() {
  const form = document.getElementById('lexical-edit-table-form');
  if (form) {
    const bandedRowsCheckbox = form.querySelector('input[name="edit-table-banded-rows"]');
    const bandedColsCheckbox = form.querySelector('input[name="edit-table-banded-columns"]');
    const captionCheckbox = form.querySelector('input[name="edit-table-include-caption"]');
    const captionInput = form.querySelector('input[name="edit-table-new-caption"]');
    const captionLabel = form.querySelector('label[for="edit-table-new-caption"]');
    const alignInputs = Array.from(form.querySelectorAll('input[name="lexical-edit-table-align"]'));
    const bandedRows = bandedRowsCheckbox ? bandedRowsCheckbox.checked : false;
    const bandedCols = bandedColsCheckbox ? bandedColsCheckbox.checked : false;
    const includeCaption = captionCheckbox ? captionCheckbox.checked : false;
    const align = Array.isArray(alignInputs) ? alignInputs.filter(inputEl => inputEl.checked)?.[0]?.value : 'center';
    return {
      bandedRowsCheckbox,
      bandedColsCheckbox,
      captionCheckbox,
      captionInput,
      captionLabel,
      alignInputs,
      bandedRows,
      bandedCols,
      includeCaption,
      align
    };
  }
}
function setEditTableForm({
  bandedRows,
  bandedCols,
  caption,
  align
}) {
  const form = getEditTableForm();
  if (form) {
    const {
      bandedRowsCheckbox,
      bandedColsCheckbox,
      captionCheckbox,
      captionInput,
      captionLabel,
      alignInputs
    } = form;
    if (bandedRowsCheckbox) {
      if (bandedRows) bandedRowsCheckbox.checked = true;else bandedRowsCheckbox.checked = false;
    }
    if (bandedColsCheckbox) {
      if (bandedCols) bandedColsCheckbox.checked = true;else bandedColsCheckbox.checked = false;
    }
    if (captionCheckbox) {
      if (caption !== undefined) captionCheckbox.checked = true;else captionCheckbox.checked = false;
    }
    if (captionInput) {
      if (caption === undefined) {
        captionInput.setAttribute('disabled', '');
        captionInput.value = '';
      } else {
        captionInput.removeAttribute('disabled');
        captionInput.value = caption;
      }
    }
    if (captionLabel && captionInput) {
      if (caption === undefined) captionLabel.classList.add('disabled');else captionLabel.classList.remove('disabled');
    }
    if (Array.isArray(alignInputs)) {
      alignInputs.forEach(inputEl => inputEl.checked = Boolean(align === inputEl.value));
    }
  }
}
function handleEditTableFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  const editor = getCurrentEditor();
  const bandedRowsCheckbox = this.querySelector('input[name="edit-table-banded-rows"]');
  const bandedColsCheckbox = this.querySelector('input[name="edit-table-banded-columns"]');
  const captionCheckbox = this.querySelector('input[name="edit-table-include-caption"]');
  const captionInput = this.querySelector('input[name="edit-table-new-caption"]');
  const alignInputs = Array.from(this.querySelectorAll('input[name="lexical-edit-table-align"]'));
  const tempAlignValue = alignInputs.filter(input => input.checked === true).map(obj => obj.value)[0];
  if (dialog && editor) {
    const tempTableKey = TABLE_STATE[editor._config.namespace].tableKey;
    clearTableState(editor._config.namespace);
    editor.update(() => {
      if (tempTableKey) {
        const table = $getNodeByKey(tempTableKey);
        if ($isTableNode(table)) {
          if (bandedColsCheckbox && bandedColsCheckbox.checked !== table.getBandedCols()) table.setBandedCols(bandedColsCheckbox.checked);
          if (bandedRowsCheckbox && bandedRowsCheckbox.checked !== table.getBandedRows()) table.setBandedRows(bandedRowsCheckbox.checked);
          if (captionCheckbox) {
            if (captionCheckbox.checked && captionInput) table.setCaption(captionInput.value);else table.setCaption(undefined);
          }
          if (VALID_ALIGN_TABLE.has(tempAlignValue)) table.setAlign(tempAlignValue);
        }
      }
      handleTableActionButtonBlur();
      closeDialog(dialog);
    });
  }
}
function handleEditTableIncludeCaptionChange(e) {
  const form = this.closest('form');
  if (form) {
    const captionInput = form.querySelector('input[type="text"]');
    if (captionInput) {
      if (this.checked) {
        captionInput.removeAttribute('disabled');
      } else {
        captionInput.setAttribute('disabled', '');
      }
    }
  }
}

/* --------------------------------- Table Action Menu ------------------------- */
/**
 * Called in update toolbar if there is a table cell in the selection
 */
function setLaunchTableMenuListeners(editorNamespace) {
  if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
  const b = document.getElementById('table-action-menu-launch');
  if (b) {
    b.addEventListener('click', handleTableActionButtonFocus, true);
    b.addEventListener('focus', handleTableActionButtonFocus, true);
    b.addEventListener('pointerdown', handleTableActionButtonFocus, true);
    b.addEventListener('touchstart', handleTableActionButtonFocus, true);
    b.addEventListener('blur', handleTableActionButtonBlur);
  }
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    const buttons = Array.from(menu.querySelectorAll('button'));
    buttons.forEach(b => {
      if (b.hasAttribute('data-table-merge')) {
        if (TABLE_STATE[editorNamespace].canMergeCells) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
      } else if (b.hasAttribute('data-table-unmerge')) {
        if (TABLE_STATE[editorNamespace].canUnmergeCells) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
      } else if (b.hasAttribute('data-table-row-above')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Insert ${Boolean(!!!rows || rows === 1) ? 'Row' : `${rows} Rows`} Above`;
      } else if (b.hasAttribute('data-table-row-below')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Insert ${Boolean(!!!rows || rows === 1) ? 'Row' : `${rows} Rows`} Below`;
      } else if (b.hasAttribute('data-table-col-left')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Insert ${Boolean(!!!columns || columns === 1) ? 'Column' : `${columns} Columns`} Left`;
      } else if (b.hasAttribute('data-table-col-right')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Insert ${Boolean(!!!columns || columns === 1) ? 'Column' : `${columns} Columns`} Right`;
      } else if (b.hasAttribute('data-table-delete-row')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Delete ${Boolean(!!!rows || rows === 1) ? 'Row' : `${rows} Rows`}`;
      } else if (b.hasAttribute('data-table-delete-column')) {
        if (TABLE_STATE[editorNamespace].canDeleteColumn) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Delete ${Boolean(!!!columns || columns === 1) ? 'Column' : `${columns} Columns`}`;
      } else if (b.hasAttribute('data-table-add-row-header')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        if (TABLE_STATE[editorNamespace].canAddRowHeader) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
        b.innerText = `Add ${Boolean(rows && rows > 1) ? 'Row Headers' : 'Row Header'}`;
      } else if (b.hasAttribute('data-table-add-col-header')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        if (TABLE_STATE[editorNamespace].canAddColHeader) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
        b.innerText = `Add ${Boolean(columns && columns > 1) ? 'Column Headers' : 'Column Header'}`;
      } else if (b.hasAttribute('data-table-remove-row-header')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        if (TABLE_STATE[editorNamespace].canRemoveRowHeader) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
        b.innerText = `Remove ${Boolean(rows && rows > 1) ? 'Row Headers' : 'Row Header'}`;
      } else if (b.hasAttribute('data-table-remove-col-header')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        if (TABLE_STATE[editorNamespace].canRemoveColHeader) b.removeAttribute('hidden');else b.setAttribute('hidden', '');
        b.innerText = `Remove ${Boolean(columns && columns > 1) ? 'Column Headers' : 'Column Header'}`;
      }
    });
  }
  setEditTableForm({
    bandedCols: TABLE_STATE[editorNamespace].bandedCols,
    bandedRows: TABLE_STATE[editorNamespace].bandedRows,
    caption: TABLE_STATE[editorNamespace].caption,
    align: TABLE_STATE[editorNamespace].align
  });
}
function handleTableActionButtonFocus(e) {
  e.stopPropagation();
  e.preventDefault();
  handleTableActionButtonBlur();
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    menu.style.display = 'flex';
    const updatePopover = function () {
      const options = {
        placement: "right-start",
        middleware: [offset(2), shift(), flip()]
      };
      if (!!!this.isConnected) handleTableActionButtonBlur();
      computePosition(this, menu, options).then(({
        x,
        y
      }) => {
        const assignObj = {
          left: `${x}px`,
          top: `${y}px`,
          opacity: "1"
        };
        Object.assign(menu.style, assignObj);
      });
    }.bind(this);
    updatePopover();
    const cleanup = autoUpdate(this, menu, updatePopover);
    if (autoUpdateObject[TABLE_ACTION_MENU_ID]) delete autoUpdateObject[TABLE_ACTION_MENU_ID];
    autoUpdateObject[TABLE_ACTION_MENU_ID] = cleanup;
  }
}
function handleTableActionButtonBlur() {
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    if (autoUpdateObject[TABLE_ACTION_MENU_ID]) {
      try {
        autoUpdateObject[TABLE_ACTION_MENU_ID]();
        delete autoUpdateObject[TABLE_ACTION_MENU_ID];
      } catch (error) {}
    }
    menu.style.display = "none";
    menu.style.opacity = "0";
  }
}
/* ------------------------------- Dispatch Commands ------------------------------------ */
function mergeCells(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].selection && TABLE_STATE[editorNamespace].tableKey) {
        const tableElement = editor.getElementByKey(TABLE_STATE[editorNamespace].tableKey);
        const {
          columns,
          rows
        } = TABLE_STATE[editorNamespace];
        const firstCell = TABLE_STATE[editorNamespace]?.activeCell;
        if (firstCell && columns && rows && TABLE_STATE[editorNamespace].selection) {
          const nodes = TABLE_STATE[editorNamespace].selection.getNodes();
          for (let node of nodes) {
            if (node.is(firstCell)) {
              node.setColSpan(columns).setRowSpan(rows);
            } else if ($isTableCellNode(node)) {
              node.remove();
            }
          }
        }
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        if (firstCell) {
          firstCell.setActive(true);
          $selectLastDescendant(firstCell);
        }
        if (tableElement) tableElement.classList.remove('selecting');
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
        handleTableActionButtonBlur();
      }
    });
  }
}
function unmergeCells(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
      $unmergeCell();
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
        }
      }
    });
  }
}
function insertRowAbove(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell && TABLE_STATE[editorNamespace].rows) {
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const rows = TABLE_STATE[editorNamespace].rows;
        $insertTableRow__EXPERIMENTAL(TABLE_STATE[editorNamespace].rowIndexes.has(0) ? true : false, rows, TABLE_STATE[editorNamespace].canRemoveRowHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function insertRowBelow(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell && TABLE_STATE[editorNamespace].rows) {
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const rows = TABLE_STATE[editorNamespace].rows;
        $insertTableRow__EXPERIMENTAL(true, rows, TABLE_STATE[editorNamespace].canRemoveRowHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function insertColRight(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell && TABLE_STATE[editorNamespace].columns) {
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const columns = TABLE_STATE[editorNamespace].columns;
        $insertTableColumn__EXPERIMENTAL(false, columns, TABLE_STATE[editorNamespace].canRemoveColHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function insertColLeft(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell && TABLE_STATE[editorNamespace].columns) {
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const columns = TABLE_STATE[editorNamespace].columns;
        $insertTableColumn__EXPERIMENTAL(true, columns, TABLE_STATE[editorNamespace].canRemoveColHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function deleteRow(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell) {
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        $deleteTableRow__EXPERIMENTAL();
        handleTableActionButtonBlur();
        if (key) {
          const tableElement = editor.getElementByKey(key);
          if (tableElement) tableElement.classList.remove('selecting');
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function deleteColumn(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell) {
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        $deleteTableColumn__EXPERIMENTAL();
        handleTableActionButtonBlur();
        if (key) {
          const tableElement = editor.getElementByKey(TABLE_STATE[editorNamespace].tableKey);
          if (tableElement) tableElement.classList.remove('selecting');
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function deleteTable(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell) {
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(TABLE_STATE[editorNamespace]?.activeCell);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        if (tableNode) {
          const parent = tableNode.getParent();
          if ($isTableWrapperNode(parent)) {
            parent.remove();
          } else {
            tableNode.remove();
          }
          handleTableActionButtonBlur();
        }
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
          }
        }
      }
    });
  }
}
function addRowHeader(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].rowIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if (TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedRowArray = Array.from(TABLE_STATE[editorNamespace].rowIndexes).sort((a, b) => a - b);
        const minRow = sortedRowArray[0];
        const maxRow = sortedRowArray[sortedRowArray.length - 1];
        if ($isTableNode(table) && !!!isNaN(minRow) && !!!isNaN(maxRow)) {
          const rowHeaders = $getRowHeaderCellsInRange(table, minRow, maxRow);
          if (rowHeaders) rowHeaders.forEach(cell => cell.setHeaderStyles(2));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
        }
      }
    });
  }
}
function addColumnHeader(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].colIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if (TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedColArray = Array.from(TABLE_STATE[editorNamespace].colIndexes).sort((a, b) => a - b);
        const minCol = sortedColArray[0];
        const maxCol = sortedColArray[sortedColArray.length - 1];
        if ($isTableNode(table) && !!!isNaN(minCol) && !!!isNaN(maxCol)) {
          const colHeaders = $getColumnHeaderCellsInRange(table, minCol, maxCol);
          if (colHeaders) colHeaders.forEach(cell => cell.setHeaderStyles(3));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
        }
      }
    });
  }
}
function removeRowHeader(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].rowIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if (TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedRowArray = Array.from(TABLE_STATE[editorNamespace].rowIndexes).sort((a, b) => a - b);
        const minRow = sortedRowArray[0];
        const maxRow = sortedRowArray[sortedRowArray.length - 1];
        if ($isTableNode(table) && !!!isNaN(minRow) && !!!isNaN(maxRow)) {
          const rowHeaders = $getRowHeaderCellsInRange(table, minRow, maxRow);
          if (rowHeaders) rowHeaders.forEach(cell => cell.setHeaderStyles(0));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
        }
      }
    });
  }
}
function removeColumnHeader(e) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].colIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if (TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedColArray = Array.from(TABLE_STATE[editorNamespace].colIndexes).sort((a, b) => a - b);
        const minCol = sortedColArray[0];
        const maxCol = sortedColArray[sortedColArray.length - 1];
        if ($isTableNode(table) && !!!isNaN(minCol) && !!!isNaN(maxCol)) {
          const colHeaders = $getColumnHeaderCellsInRange(table, minCol, maxCol);
          if (colHeaders) colHeaders.forEach(cell => cell.setHeaderStyles(0));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
        }
      }
    });
  }
}

/*------------------------------------------ Table Dialogs ------------------------------- */
function setTableActionMenuButtonsListeners() {
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    const buttons = Array.from(menu.querySelectorAll('button'));
    for (let b of buttons) {
      if (b.hasAttribute('data-table-merge')) b.addEventListener('click', mergeCells);else if (b.hasAttribute('data-table-unmerge')) b.addEventListener('click', unmergeCells);else if (b.hasAttribute('data-table-row-above')) b.addEventListener('click', insertRowAbove);else if (b.hasAttribute('data-table-row-below')) b.addEventListener('click', insertRowBelow);else if (b.hasAttribute('data-table-col-left')) b.addEventListener('click', insertColRight);else if (b.hasAttribute('data-table-col-right')) b.addEventListener('click', insertColLeft);else if (b.hasAttribute('data-table-delete-row')) b.addEventListener('click', deleteRow);else if (b.hasAttribute('data-table-delete-column')) b.addEventListener('click', deleteColumn);else if (b.hasAttribute('data-table-delete-table')) b.addEventListener('click', deleteTable);else if (b.hasAttribute('data-table-add-row-header')) b.addEventListener('click', addRowHeader);else if (b.hasAttribute('data-table-add-col-header')) b.addEventListener('click', addColumnHeader);else if (b.hasAttribute('data-table-remove-row-header')) b.addEventListener('click', removeRowHeader);else if (b.hasAttribute('data-table-remove-col-header')) b.addEventListener('click', removeColumnHeader);else continue;
    }
  }
}

/*---------------------------------- Edit Table Cells in Selection ---------------------------------- */
function parseBorderStr(s) {
  try {
    const firstInstanceSpace = s.indexOf(' ');
    const widthStr = s.slice(0, firstInstanceSpace);
    const afterSpace = s.slice(firstInstanceSpace + 1);
    const secondIndexSpace = afterSpace.indexOf(' ');
    const styleStr = afterSpace.slice(0, secondIndexSpace);
    const colorStr = afterSpace.slice(secondIndexSpace + 1);
    const widthPre = parseInt(widthStr);
    const width = !!!isNaN(widthPre) && isFinite(widthPre) ? Math.max(0, Math.min(widthPre, 5)) : undefined;
    const style = ALLOWED_BORDER_STYLES.has(styleStr.trim()) ? styleStr.trim() : undefined;
    const color = String(parseColorStr(colorStr.trim(), getDefaultTextColor()));
    return {
      width,
      style,
      color
    };
  } catch (error) {
    console.error(error);
    return {
      width: undefined,
      style: undefined,
      color: undefined
    };
  }
}
function getChangeCellsForm() {
  const form = document.getElementById('lexical-edit-bg-color-form');
  const colorInput = document.getElementById('lexical-cell-bg-color-input');
  const transparentInput = document.getElementById('lexical-cell-bg-color-input-trans');
  const verticalAlign = document.querySelector('input[name="table-cell-vertical-align"]:checked');
  const borderColor = document.getElementById('lex-cell-border-color');
  const transparentBorder = document.getElementById('lex-cell-border-color-transparent');
  const borderStyle = document.getElementById('cell-border-style-value');
  const borderWidth = document.getElementById('lex-cell-border-width');
  return {
    form,
    colorInput,
    transparentInput,
    verticalAlign,
    borderColor,
    transparentBorder,
    borderStyle,
    borderWidth
  };
}
function handleChangeCellsFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  const editor = getCurrentEditor();
  const {
    colorInput,
    transparentInput,
    borderColor,
    transparentBorder,
    borderStyle,
    borderWidth,
    verticalAlign
  } = getChangeCellsForm();
  if (colorInput && transparentInput && editor && dialog && borderColor && transparentBorder && borderStyle && borderWidth) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    const VALID_VERTICAL_ALIGN = new Set(['top', 'middle', 'bottom']);
    const newBackgroundColor = transparentInput.checked ? null : VALID_HEX_REGEX.test(colorInput.value) ? colorInput.value : null;
    const newBorderColor = transparentBorder.checked ? undefined : VALID_HEX_REGEX.test(borderColor.value) ? borderColor.value : undefined;
    const newBorderStyle = ALLOWED_BORDER_STYLES.has(borderStyle.value) ? borderStyle.value : undefined;
    const newBorderWidthTemp = parseInt(borderWidth.value);
    const newBorderWidth = Boolean(!!!isNaN(newBorderWidthTemp) && isFinite(newBorderWidthTemp)) ? Math.max(0, Math.min(5, newBorderWidthTemp)) : undefined;
    const newBorder = Boolean(newBorderColor !== undefined && newBorderStyle !== undefined && newBorderWidth !== undefined) ? `${newBorderWidth}px ${newBorderStyle} ${newBorderColor}` : undefined;
    const newVerticalAlign = verticalAlign ? VALID_VERTICAL_ALIGN.has(verticalAlign.value) ? verticalAlign.value : undefined : undefined;
    if (TABLE_STATE[editorNamespace].selection && editor) {
      editor.update(() => {
        const nodes = TABLE_STATE[editorNamespace].selection.getNodes();
        for (let node of nodes) {
          if ($isTableCellNode(node)) {
            node.setCustomStyles({
              border: newBorder,
              backgroundColor: newBackgroundColor,
              verticalAlign: newVerticalAlign
            });
          }
        }
        closeDialog(dialog);
        handleTableActionButtonBlur();
      });
    } else if (TABLE_STATE[editorNamespace]?.activeCell && editor) {
      editor.update(() => {
        (TABLE_STATE[editorNamespace]?.activeCell).setCustomStyles({
          border: newBorder,
          backgroundColor: newBackgroundColor,
          verticalAlign: newVerticalAlign
        });
        closeDialog(dialog);
        handleTableActionButtonBlur();
      });
    }
  }
}
function handleChangeCellsFormReset(e) {
  const {
    form,
    colorInput,
    transparentInput,
    verticalAlign,
    borderColor,
    transparentBorder,
    borderStyle,
    borderWidth
  } = getChangeCellsForm();
  if (form && colorInput && transparentInput && verticalAlign && borderColor && transparentBorder && borderStyle && borderWidth) {
    const backgroundColor = getDefaultBackground();
    colorInput.value = backgroundColor;
    transparentInput.checked = true;
    const defaultVerticalAlign = 'middle';
    Array.from(form.querySelectorAll('input[name="table-cell-vertical-align"]')).forEach(input => {
      if (input.value !== defaultVerticalAlign) input.checked = false;else input.checked = true;
    });
    const defaultBorder = getDefaultTextColor();
    borderColor.value = defaultBorder;
    transparentBorder.checked = true;
    setSelectInput(borderStyle, 'none', 'None');
    borderWidth.value = '0';
  }
}
const createTh = (scope, text = "") => {
  const th = document.createElement('th');
  th.setAttribute('scope', scope);
  th.className = "rte-tableCell rte-tableCellHeader";
  th.innerText = text;
  return th;
};
const createTd = (text = "") => {
  const td = document.createElement('td');
  td.className = "rte-tableCell";
  td.innerText = text;
  return td;
};
const getCellStr = (row, col) => '('.concat(String(row)).concat(',').concat(String(col)).concat(')');
function handleTableFormChange() {
  const tableForm = getTableForm();
  if (tableForm && tableForm.preview) {
    const table = document.createElement('table');
    table.classList.add("rte-table");
    table.setAttribute('cellspacing', '0');
    if (tableForm.bandedCols && tableForm.bandedRows) table.classList.add("banded-col", "banded-row");else if (tableForm.bandedCols) table.classList.add("banded-col");else if (tableForm.bandedRows) table.classList.add("banded-row");
    if (tableForm.align === "left") table.style.setProperty('margin', '10px auto 10px 0px', 'important');else if (tableForm.align === "center") table.style.setProperty('margin', '10px auto', 'important');else if (tableForm.align === "right") table.style.setProperty('margin', '10px 0px 10px auto', 'important');
    if (tableForm.includeCaption) {
      if (tableForm.captionInput) tableForm.captionInput.removeAttribute('disabled');
      const caption = document.createElement('caption');
      caption.innerText = tableForm.caption;
      table.append(caption);
    } else {
      if (tableForm.captionInput) tableForm.captionInput.setAttribute('disabled', '');
    }
    if (tableForm.headingRow) {
      const tr = document.createElement('tr');
      tr.className = "thead";
      for (let col = 0; col < tableForm.numCols; col++) {
        tr.append(createTh("col", getCellStr(0, col)));
      }
      table.append(tr);
    }
    const tbody = document.createElement('tbody');
    tbody.style.cssText = "background-color:var(--background);";
    for (let row = Number(tableForm.headingRow); row < tableForm.numRows; row++) {
      const tr = document.createElement('tr');
      for (let col = 0; col < tableForm.numCols; col++) {
        if (col === 0 && tableForm.headingCol) {
          tr.append(createTh("row", getCellStr(row, col)));
          continue;
        }
        tr.append(createTd(getCellStr(row, col)));
      }
      tbody.append(tr);
    }
    table.append(tbody);
    clearInnerHTML(tableForm.preview);
    tableForm.preview.append(table);
  }
}
function handleTableFormSubmit(e) {
  const tableForm = getTableForm();
  e.preventDefault();
  if (tableForm && tableForm.preview) {
    const includeHeaders = {
      rows: tableForm.headingRow,
      columns: tableForm.headingCol
    };
    const rows = isNaN(tableForm.numRows) ? 5 : tableForm.numRows;
    const columns = isNaN(tableForm.numCols) ? 5 : tableForm.numCols;
    const caption = tableForm.includeCaption ? tableForm.caption : undefined;
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        includeHeaders,
        rows: String(rows),
        columns: String(columns),
        caption,
        bandedCols: tableForm.bandedCols,
        bandedRows: tableForm.bandedRows,
        align: tableForm.align
      });
      handleTableActionButtonBlur();
      closeDialog(tableForm.dialog);
    }
  }
}
function handleTableFormReset(e) {
  if (this.id === "lexical-insert-table-form") handleTableFormChange.bind(this)();else if (this.id === "lexical-insert-table-upload-data") {
    RECENT_JSON = undefined;
    handleUploadTableFormChange.bind(this)();
  }
}

/* --------------------------------------- RegisterTable ------------------------------------ */
function initializeTableNode(editor, tableNode) {
  const nodeKey = tableNode.getKey();
  const id = editor._config.namespace;
  const tableElement = editor.getElementByKey(nodeKey);
  if (tableElement && (!!!tableSelections[id] || !!!tableSelections[id].has(nodeKey))) {
    const tableSelection = applyTableHandlers(tableNode, tableElement, editor, false);
    if (!!!tableSelections[id]) tableSelections[id] = new Map();
    tableSelections[id].set(nodeKey, tableSelection);
  }
}

/**
 * Clear the current table selectiuon for a table
 * @param editorNamespace 
 */
function clearEditorTableSelection(editorNamespace) {
  const EDITOR_INSTANCES = getEditorInstances();
  const editor = EDITOR_INSTANCES[editorNamespace];
  if (TABLE_STATE[editorNamespace] && editor) {
    const key = TABLE_STATE[editorNamespace].tableKey;
    if (tableSelections[editorNamespace] && key) {
      const tableSelection = tableSelections[editorNamespace].get(key);
      if (tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor, tableSelection);
    }
    clearTableState(editorNamespace);
  }
}
function $handleDispatchCommandOnGridSelection(editor, selection, dispatchObj) {
  switch (dispatchObj.name) {
    case 'FORMAT_TEXT_COMMAND':
      {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, dispatchObj.formatType);
        break;
      }
    case 'TEXT_COLOR_CHANGE':
      {
        if (!!!getNoColor(editor)) textColorChangeCallback(selection, dispatchObj.color);
        break;
      }
    case 'MAKE_TRANSPARENT':
      {
        makeTransparentCallback(selection, dispatchObj.payload);
        break;
      }
    case 'CLEAR_TEXT_FORMATTING':
      {
        clearTextFormattingCallback(selection);
        break;
      }
    case 'BACKGROUND_COLOR_CHANGE':
      {
        if (!!!getNoColor(editor)) backgroundColorChangeCallback(selection, dispatchObj.color);
        break;
      }
    case 'FONT_FAMILY_CHANGE':
      {
        fontFamilyChangeCallback(selection, dispatchObj.fontWithSemiColon);
        break;
      }
    case 'FONT_WEIGHT_CHANGE':
      {
        fontWeightChangeCallback(selection, dispatchObj.fontWeight);
        break;
      }
    case 'FONT_SIZE_CHANGE':
      {
        if (editorCanChangeSize(editor)) fontSizeChangeCallback(selection, dispatchObj.fontSize);
        break;
      }
  }
  return true;
}
function handleFocusOut(e) {
  FOCUS_OUT_TIMEOUT = setTimeout(() => {
    const editorNamespace = this.id;
    const editor = getEditorInstances()[editorNamespace];
    if (editor) {
      editor.update(() => {
        const activeCell = TABLE_STATE[editorNamespace]?.activeCell;
        if ($isTableCellNode(activeCell)) {
          activeCell.setActive(false);
        }
      });
    }
    clearTableState(editorNamespace);
    handleTableActionButtonBlur();
  }, 100);
}
function handleTableActionMenuFocusIn() {
  if (FOCUS_OUT_TIMEOUT) clearTimeout(FOCUS_OUT_TIMEOUT);
}
function $onTableSelectionChange(editor) {
  const editorNamespace = editor._config.namespace;
  if (RECENT_JSON && editorNamespace !== RECENT_JSON.editorNamespace) RECENT_JSON = undefined;
  const selection = $getSelection();
  if (LAST_SELECTED_TABLE_NAMESPACE !== editorNamespace) clearEditorTableSelection(editorNamespace);
  LAST_SELECTED_TABLE_NAMESPACE = editorNamespace;
  if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
  TABLE_STATE[editorNamespace].namespace = editor._config.namespace;
  if (DEPRECATED_$isGridSelection(selection)) {
    TABLE_STATE[editorNamespace].selection = selection;
    if (TABLE_STATE[editorNamespace]?.activeCell) {
      handleTableActionButtonBlur();
      (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
    }
    const anchorKey = selection.anchor.key;
    const anchorNode = $getNodeByKey(anchorKey);
    if (anchorNode) {
      if ($isTableCellNode(anchorNode)) {
        if (TABLE_STATE[editorNamespace]) {
          TABLE_STATE[editorNamespace].activeCell = anchorNode;
          if (editor.isEditable()) (TABLE_STATE[editorNamespace]?.activeCell).setActive(true);
        }
      }
    }
    var backgroundColorCell = undefined;
    var canAddRowHeader = false;
    var canAddColHeader = false;
    var canRemoveColHeader = false;
    var canRemoveRowHeader = false;
    var caption = undefined;
    var bandedRows = false;
    var bandedCols = false;
    var canDeleteColumn = true;
    const rowIndexes = new Set();
    const colIndexes = new Set();
    var table = undefined;
    for (let node of selection.getNodes()) {
      if ($isTableCellNode(node)) {
        if (!!!table) {
          table = $getTableNodeFromLexicalNodeOrThrow(node);
        }
        if (backgroundColorCell !== 'transparent') {
          const bgColor = node.getBackgroundColor();
          if (backgroundColorCell === undefined) backgroundColorCell = bgColor ? bgColor : 'transparent';else backgroundColorCell = bgColor === backgroundColorCell ? backgroundColorCell : 'transparent';
        }
        const rowIndex = $getTableRowIndexFromTableCellNode(node);
        const colIndex = $getTableColumnIndexFromTableCellNode(node);
        rowIndexes.add(rowIndex);
        colIndexes.add(colIndex);
      }
    }
    if (table) {
      var numCols = 0;
      const firstRow = table.getFirstChild();
      if (firstRow) {
        const cellNodesInRow = firstRow.getChildren();
        for (let node of cellNodesInRow) {
          if ($isTableCellNode(node)) {
            numCols += node.getColSpan();
          }
        }
      }
      const lastColIndex = Math.max(0, numCols - 1);
      canDeleteColumn = !!!Boolean(colIndexes.has(lastColIndex) && colIndexes.size > 1);
      bandedCols = table.getBandedCols();
      bandedRows = table.getBandedRows();
      caption = table.getCaption();
      TABLE_STATE[editorNamespace].tableKey = table.getKey();
      TABLE_STATE[editorNamespace].align = table.getAlign();
      if (tableSelections[editorNamespace]) {
        const tableSelection = tableSelections[editorNamespace].get(table.getKey());
        if (tableSelection) {
          for (let row of rowIndexes) {
            for (let col of colIndexes) {
              const rowHeader = table.getCellNodeFromCords(0, row, tableSelection.getGrid());
              const colHeader = table.getCellNodeFromCords(col, 0, tableSelection.getGrid());
              if (rowHeader) {
                if (!!!canAddRowHeader) canAddRowHeader = Boolean(rowHeader.getTag() !== 'th' || rowHeader.getScope() !== 'row');
                if (!!!canRemoveRowHeader) canRemoveRowHeader = Boolean(rowHeader.getTag() === 'th' && rowHeader.getScope() === 'row');
              }
              if (colHeader) {
                if (!!!canAddColHeader) canAddColHeader = Boolean(colHeader.getTag() !== 'th' || colHeader.getScope() !== 'col');
                if (!!!canRemoveColHeader) canRemoveColHeader = Boolean(colHeader.getTag() === 'th' && colHeader.getScope() === 'col');
              }
            }
          }
        }
      }
    }
    TABLE_STATE[editorNamespace].canMergeCells = true;
    TABLE_STATE[editorNamespace].backgroundColor = String(backgroundColorCell);
    TABLE_STATE[editorNamespace].canAddColHeader = canAddColHeader;
    TABLE_STATE[editorNamespace].canAddRowHeader = canAddRowHeader;
    TABLE_STATE[editorNamespace].canRemoveColHeader = canRemoveColHeader;
    TABLE_STATE[editorNamespace].canRemoveRowHeader = canRemoveRowHeader;
    TABLE_STATE[editorNamespace].canUnmergeCells = $canUnmerge();
    TABLE_STATE[editorNamespace].colIndexes = colIndexes;
    TABLE_STATE[editorNamespace].rowIndexes = rowIndexes;
    TABLE_STATE[editorNamespace].rectangular = isGridSelectionRectangular(selection);
    const {
      rows,
      columns
    } = computeSelectionCount(selection);
    TABLE_STATE[editorNamespace].rows = rows;
    TABLE_STATE[editorNamespace].columns = columns;
    TABLE_STATE[editorNamespace].bandedCols = bandedCols;
    TABLE_STATE[editorNamespace].bandedRows = bandedRows;
    TABLE_STATE[editorNamespace].caption = caption;
    TABLE_STATE[editorNamespace].canDeleteColumn = canDeleteColumn;
  } else if ($isRangeSelection(selection)) {
    var newActiveCell = undefined;
    const selectionNodes = selection.getNodes();
    for (let node of selectionNodes) {
      const tableCellNode = $findMatchingParent(node, n => $isTableCellNode(n));
      if ($isTableCellNode(tableCellNode)) {
        newActiveCell = tableCellNode;
        break;
      }
    }
    if (newActiveCell) {
      if (TABLE_STATE[editorNamespace]?.activeCell && (TABLE_STATE[editorNamespace]?.activeCell).getKey() !== newActiveCell.getKey()) {
        handleTableActionButtonBlur();
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
      }
      if (TABLE_STATE[editorNamespace]) {
        TABLE_STATE[editorNamespace].activeCell = newActiveCell;
      }
      if (editor.isEditable()) {
        handleTableActionButtonBlur();
        newActiveCell.setActive(true);
      }
      var backgroundColorCell = undefined;
      var canAddRowHeader = false;
      var canAddColHeader = false;
      var canRemoveColHeader = false;
      var canRemoveRowHeader = false;
      var caption = undefined;
      var bandedRows = false;
      var bandedCols = false;
      const rowIndexes = new Set();
      const colIndexes = new Set();
      const rowIndex = $getTableRowIndexFromTableCellNode(TABLE_STATE[editorNamespace]?.activeCell);
      const colIndex = $getTableColumnIndexFromTableCellNode(TABLE_STATE[editorNamespace]?.activeCell);
      rowIndexes.add(rowIndex);
      colIndexes.add(colIndex);
      const table = $getTableNodeFromLexicalNodeOrThrow(TABLE_STATE[editorNamespace]?.activeCell);
      if (table) {
        TABLE_STATE[editorNamespace].tableKey = table.getKey();
        bandedCols = table.getBandedCols();
        bandedRows = table.getBandedRows();
        caption = table.getCaption();
        TABLE_STATE[editorNamespace].align = table.getAlign();
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(table.getKey());
          if (tableSelection) {
            const rowHeader = table.getCellNodeFromCords(0, rowIndex, tableSelection.getGrid());
            const colHeader = table.getCellNodeFromCords(colIndex, 0, tableSelection.getGrid());
            if (rowHeader) {
              canAddRowHeader = Boolean(rowHeader.getTag() !== 'th' || rowHeader.getScope() !== 'row');
              canRemoveRowHeader = !!!canAddRowHeader;
            }
            if (colHeader) {
              canAddColHeader = Boolean(colHeader.getTag() !== 'th' || colHeader.getScope() !== 'col');
              canRemoveColHeader = !!!canAddColHeader;
            }
          }
        }
      }
      TABLE_STATE[editorNamespace].rectangular = Boolean((TABLE_STATE[editorNamespace]?.activeCell).getRowSpan() === (TABLE_STATE[editorNamespace]?.activeCell).getColSpan());
      TABLE_STATE[editorNamespace].canMergeCells = false;
      TABLE_STATE[editorNamespace].canUnmergeCells = $canUnmerge();
      TABLE_STATE[editorNamespace].rows = 1;
      TABLE_STATE[editorNamespace].columns = 1;
      TABLE_STATE[editorNamespace].rowIndexes = rowIndexes;
      TABLE_STATE[editorNamespace].colIndexes = colIndexes;
      TABLE_STATE[editorNamespace].canAddRowHeader = canAddRowHeader;
      TABLE_STATE[editorNamespace].canAddColHeader = canAddColHeader;
      TABLE_STATE[editorNamespace].canRemoveRowHeader = canRemoveRowHeader;
      TABLE_STATE[editorNamespace].canRemoveColHeader = canRemoveColHeader;
      TABLE_STATE[editorNamespace].bandedCols = bandedCols;
      TABLE_STATE[editorNamespace].bandedRows = bandedRows;
      TABLE_STATE[editorNamespace].caption = caption;
      TABLE_STATE[editorNamespace].selection = null;
      TABLE_STATE[editorNamespace].canDeleteColumn = true;
    } else {
      if (TABLE_STATE[editorNamespace]?.activeCell) {
        handleTableActionButtonBlur();
        (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
      }
      clearTableState(editorNamespace);
    }
  } else {
    if (TABLE_STATE[editorNamespace]?.activeCell) {
      handleTableActionButtonBlur();
      (TABLE_STATE[editorNamespace]?.activeCell).setActive(false);
    }
  }
  setLaunchTableMenuListeners(editorNamespace);
}
function $setActiveCell(editor, cell) {
  if (TABLE_STATE[editor._config.namespace].activeCell) {
    TABLE_STATE[editor._config.namespace].activeCell?.setActive(false);
    cell.setActive(true);
    TABLE_STATE[editor._config.namespace].activeCell = cell;
  }
}
function getOnOpenEditTableDialog(e) {
  if (e.detail.el.id === "edit-table-lexical") {
    const editTableForm = document.getElementById('lexical-edit-table-form');
    const editTableIncludeCaption = document.getElementById('edit-table-include-caption');
    if (editTableIncludeCaption) editTableIncludeCaption.addEventListener('change', handleEditTableIncludeCaptionChange);
    if (editTableForm) {
      editTableForm.addEventListener('submit', handleEditTableFormSubmit, true);
    }
    const dialog = document.getElementById('edit-table-lexical');
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: dialog
      }
    }));
  }
}
function getOnOpenEditTableCellDialog(e) {
  if (e.detail.el.id === "lexical-table-cell-bg") {
    const editCellsForm = document.getElementById('lexical-edit-bg-color-form');
    if (editCellsForm) {
      editCellsForm.addEventListener('submit', handleChangeCellsFormSubmit);
      editCellsForm.addEventListener('reset', handleChangeCellsFormReset);
    }
    const editor = getCurrentEditor();
    const {
      colorInput,
      transparentInput,
      borderColor,
      transparentBorder,
      borderStyle,
      borderWidth,
      verticalAlign,
      form
    } = getChangeCellsForm();
    if (editor && borderColor && transparentBorder && borderStyle && borderWidth && verticalAlign && colorInput && transparentInput && form) {
      const canChangeColor = getNoColor(editor);
      if (!!!canChangeColor) form.setAttribute('disabled', '');else form.removeAttribute('disabled');
      const id = editor._config.namespace;
      if (TABLE_STATE[id].selection && editor) {
        editor.getEditorState().read(() => {
          const nodes = TABLE_STATE[id].selection.getNodes();
          var bgColor = undefined;
          var border = null;
          for (let node of nodes) {
            if ($isTableCellNode(node)) {
              const nodeBgColor = node.getBackgroundColor();
              const nodeBorder = node.getBorder();
              node.getVerticalAlign();
              if (bgColor === undefined) bgColor = nodeBgColor;else if (bgColor !== nodeBgColor) bgColor = null;
              if (border === null) border = nodeBorder;else if (border !== nodeBorder) border = undefined;
            }
          }
          // Set the form inputs
          const backgroundColor = getDefaultBackground();
          colorInput.value = !!!bgColor ? backgroundColor : bgColor;
          transparentInput.checked = !!!bgColor;
          const defaultVerticalAlign = !!!verticalAlign ? 'middle' : verticalAlign;
          Array.from(form.querySelectorAll('input[name="table-cell-vertical-align"]')).forEach(input => {
            if (input.value !== defaultVerticalAlign) input.checked = false;else input.checked = true;
          });
          if (border) {
            const {
              width,
              color,
              style
            } = parseBorderStr(border);
            const defaultBorder = getDefaultTextColor();
            borderColor.value = color ? color : defaultBorder;
            transparentBorder.checked = !!!color;
            setSelectInput(borderStyle, style ? style : 'none', style ? style[0].toUpperCase().concat(style.slice(1)) : 'None');
            borderWidth.value = !!!isNaN(width) ? width.toFixed(0) : '0';
          } else {
            const defaultBorder = getDefaultTextColor();
            borderColor.value = defaultBorder;
            transparentBorder.checked = true;
            setSelectInput(borderStyle, 'none', 'None');
            borderWidth.value = '0';
          }
        });
      } else if (TABLE_STATE[id]?.activeCell && editor) {
        editor.getEditorState().read(() => {
          const bgColor = (TABLE_STATE[id]?.activeCell).getBackgroundColor();
          const border = (TABLE_STATE[id]?.activeCell).getBorder();
          const verticalAlign = (TABLE_STATE[id]?.activeCell).getVerticalAlign();
          // Set the form inputs
          const backgroundColor = getDefaultBackground();
          colorInput.value = !!!bgColor ? backgroundColor : bgColor;
          transparentInput.checked = !!!bgColor;
          const defaultVerticalAlign = !!!verticalAlign ? 'middle' : verticalAlign;
          Array.from(form.querySelectorAll('input[name="table-cell-vertical-align"]')).forEach(input => {
            if (input.value !== defaultVerticalAlign) input.checked = false;else input.checked = true;
          });
          if (border) {
            const {
              width,
              color,
              style
            } = parseBorderStr(border);
            const defaultBorder = getDefaultTextColor();
            borderColor.value = color ? color : defaultBorder;
            transparentBorder.checked = !!!color;
            setSelectInput(borderStyle, style ? style : 'none', style ? style[0].toUpperCase().concat(style.slice(1)) : 'None');
            borderWidth.value = !!!isNaN(width) ? width.toFixed(0) : '0';
          } else {
            const defaultBorder = getDefaultTextColor();
            borderColor.value = defaultBorder;
            transparentBorder.checked = true;
            setSelectInput(borderStyle, 'none', 'None');
            borderWidth.value = '0';
          }
        });
      }
    }
    const dialog = document.getElementById('lexical-table-cell-bg');
    if (dialog) document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: dialog
      }
    }));
  }
}
var UPLOAD_CURRENT_FILE = null;
function getOnOpenTablesLexical(e) {
  if (e.detail.el.id === "tables-lexical") {
    const mainTableForm = getTableForm();
    if (mainTableForm && mainTableForm.form) {
      if (mainTableForm.captionInput) mainTableForm.captionInput.addEventListener('input', handleTableFormChange);
      mainTableForm.form.addEventListener('change', handleTableFormChange);
      mainTableForm.form.addEventListener('submit', handleTableFormSubmit);
      mainTableForm.form.addEventListener('reset', handleTableFormReset);
      mainTableForm.form.dispatchEvent(new Event('change'));
    }
    const uploadTableFrom = getUploadTableForm();
    if (uploadTableFrom && uploadTableFrom.form) {
      if (uploadTableFrom.fileUpload) uploadTableFrom.fileUpload.addEventListener('change', handleUploadData);
      if (uploadTableFrom.form) {
        if (uploadTableFrom.captionInput) uploadTableFrom.captionInput.addEventListener('input', handleUploadTableFormChange);
        uploadTableFrom.form.addEventListener('change', handleUploadTableFormChange);
        uploadTableFrom.form.addEventListener('submit', handleUploadTableFormSubmit);
        uploadTableFrom.form.addEventListener('reset', handleTableFormReset);
      }
    }
    if (UPLOAD_CURRENT_FILE) {
      const tabButton = document.getElementById("create_table_from_upload_lexical");
      if (tabButton) {
        tabButton.dispatchEvent(new Event("click"));
        const input = document.getElementById("upload-data-to-table");
        if (input) {
          input.files = getFileListForFileInput([UPLOAD_CURRENT_FILE]);
          UPLOAD_CURRENT_FILE = null;
          input.dispatchEvent(new Event("change"));
        }
      }
    }
    const dialog = document.getElementById('tables-lexical');
    if (dialog) document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: dialog
      }
    }));
  }
}
function hideOpenPopovers() {
  Object.keys(autoUpdateObject).forEach(key => {
    try {
      autoUpdateObject[key]();
      delete autoUpdateObject[key];
      handleTableActionButtonBlur();
    } catch (e) {}
  });
}
function registerTableEditableListeners(editor) {
  document.addEventListener('HIDE_OPEN_POPOVERS', hideOpenPopovers);
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) wrapper.addEventListener('focusout', handleFocusOut, true);
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) menu.addEventListener('focusin', handleTableActionMenuFocusIn);
}
function registerTableEditable(editor) {
  const editorNamespace = editor._config.namespace;
  if (editor.hasNodes([TableCellNode, TableNode, TableRowNode, TableWrapperNode, CellParagraphNode])) {
    registerTableEditableListeners(editor);
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenEditTableDialog);
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenEditTableCellDialog);
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenTablesLexical);
    setTableActionMenuButtonsListeners();
    if (editor.isEditable()) {
      editor.getEditorState().read(() => {
        const tableNodes = $nodesOfType(TableNode);
        tableNodes.forEach(node => {
          if (!!!$isTableWrapperNode(node.getParent())) $wrapNodeInElement(node, $createTableWrapperNode);
          initializeTableNode(editor, node);
        });
      });
    }
    return mergeRegister(editor.registerCommand(INSERT_TABLE_COMMAND, ({
      rows,
      columns,
      includeHeaders,
      caption,
      bandedRows,
      bandedCols,
      align
    }) => {
      const tableNode = $createTableNodeWithDimensions(Number(rows), Number(columns), includeHeaders, caption, bandedRows, bandedCols, align);
      const wrapper = $createTableWrapperNode();
      $insertNodeToNearestRoot(wrapper);
      wrapper.append(tableNode);
      const firstDescendant = tableNode.getFirstDescendant();
      if ($isTextNode(firstDescendant)) {
        firstDescendant.select();
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INSERT_TABLE_COMMAND_WITH_DATA, ({
      rows,
      columns,
      includeHeaders,
      caption,
      bandedRows,
      bandedCols,
      align,
      json
    }) => {
      const tableNode = $createTableNodeWithDimensions(Number(rows), Number(columns), includeHeaders, caption, bandedRows, bandedCols, align);
      const rowNodes = tableNode.getChildren();
      for (let i = 0; i < rowNodes.length; i++) {
        const rowNode = rowNodes[i];
        if ($isTableRowNode(rowNode)) {
          const cellNodes = rowNode.getChildren();
          for (let j = 0; j < cellNodes.length; j++) {
            const cellNode = cellNodes[j];
            if ($isTableCellNode(cellNode)) {
              const cellParagraph = cellNode.getFirstChild();
              if ($isCellParagraphNode(cellParagraph)) {
                const replacementNode = $createCellParagraphNode();
                replacementNode.append($createTextNode(json[i][j]));
                cellParagraph.replace(replacementNode);
              }
            }
          }
        }
      }
      const wrapper = $createTableWrapperNode();
      $insertNodeToNearestRoot(wrapper);
      wrapper.append(tableNode);
      const firstDescendant = tableNode.getFirstDescendant();
      if ($isTextNode(firstDescendant)) {
        firstDescendant.select();
      }
      RECENT_JSON = undefined;
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(TableNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          editor.getEditorState().read(() => {
            const tableNode = $getNodeByKey(nodeKey);
            if ($isTableNode(tableNode)) {
              if (!!!$isTableWrapperNode(tableNode.getParent())) $wrapNodeInElement(tableNode, $createTableWrapperNode);
              initializeTableNode(editor, tableNode);
            }
          });
        } else if (mutation === 'destroyed') {
          clearTableState(editor._config.namespace);
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(nodeKey);
            if (tableSelection !== undefined && tableSelection instanceof TableSelection) {
              tableSelection.removeListeners();
              tableSelections[editorNamespace].delete(nodeKey);
            }
          }
        } else if (mutation === "updated") {
          clearTableState(editor._config.namespace);
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(nodeKey);
            if (tableSelection !== undefined && tableSelection instanceof TableSelection) {
              tableSelection.removeListeners();
              tableSelections[editorNamespace].delete(nodeKey);
            }
            editor.getEditorState().read(() => {
              const tableNode = $getNodeByKey(nodeKey);
              if ($isTableNode(tableNode)) {
                initializeTableNode(editor, tableNode);
              }
            });
          }
        }
      }
    }), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
      $onTableSelectionChange(editor);
      return false;
    }, COMMAND_PRIORITY_CRITICAL), editor.registerCommand(FORMAT_TEXT_COMMAND, formatType => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: FORMAT_TEXT_COMMAND,
          name: 'FORMAT_TEXT_COMMAND',
          formatType
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(FORMAT_ELEMENT_COMMAND, elementFormat => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        const nodes = selection.getNodes();
        for (let node of nodes) {
          if ($isTableCellNode(node)) {
            const children = node.getChildren();
            for (let child of children) {
              if ($isElementNode(child)) {
                child.setFormat(elementFormat);
              }
            }
          }
        }
        return true;
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(TEXT_COLOR_CHANGE, color => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: TEXT_COLOR_CHANGE,
          name: 'TEXT_COLOR_CHANGE',
          color
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(BACKGROUND_COLOR_CHANGE, color => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: BACKGROUND_COLOR_CHANGE,
          name: 'BACKGROUND_COLOR_CHANGE',
          color
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(MAKE_TRANSPARENT, payload => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: MAKE_TRANSPARENT,
          name: 'MAKE_TRANSPARENT',
          payload
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(CLEAR_TEXT_FORMATTING, () => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: CLEAR_TEXT_FORMATTING,
          name: 'CLEAR_TEXT_FORMATTING'
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(FONT_FAMILY_CHANGE, fontFamily => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: FONT_FAMILY_CHANGE,
          name: 'FONT_FAMILY_CHANGE',
          fontWithSemiColon: fontFamily
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(FONT_WEIGHT_CHANGE, fontWeight => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: FONT_WEIGHT_CHANGE,
          name: 'FONT_WEIGHT_CHANGE',
          fontWeight
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(FONT_SIZE_CHANGE, fontSize => {
      const selection = $getSelection();
      if (DEPRECATED_$isGridSelection(selection)) {
        return $handleDispatchCommandOnGridSelection(editor, selection, {
          command: FONT_SIZE_CHANGE,
          name: 'FONT_SIZE_CHANGE',
          fontSize
        });
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(DRAG_DROP_PASTE, files => {
      if (files.length) {
        const file = files[0];
        if (file.type === "text/csv" || file.type === "application/vnd.ms-excel" || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          UPLOAD_CURRENT_FILE = file;
          const dialog = document.getElementById("tables-lexical");
          if (dialog) {
            openDialog(dialog);
            return true;
          }
        }
      }
      return false;
    }, COMMAND_PRIORITY_HIGH), registerTableNotEditableListener(editor), editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
      registerTableEditableListeners(editor);
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error('Editor does not have TableCellNode, TableNode, TableRowNode, TableWrapperNode, or CellParagraphNode registered.');
    return () => {};
  }
}
/**
 * Register when the editor is not editable
 * @param editor 
 * @returns 
 */
function registerTableNotEditableListener(editor) {
  const editorNamespace = editor._config.namespace;
  return mergeRegister(editor.registerEditableListener(isEditable => {
    const editorNamespace = editor._config.namespace;
    if (TABLE_STATE[editorNamespace] && !!!isEditable) {
      clearTableState(editorNamespace);
    }
    if (isEditable) {
      editor.update(() => {
        const tableCellNodes = $nodesOfType(TableCellNode);
        tableCellNodes.forEach(cell => {
          cell.setCanResize(true);
        });
      });
    } else {
      editor.update(() => {
        const tableCellNodes = $nodesOfType(TableCellNode);
        tableCellNodes.forEach(cell => {
          cell.setCanResize(false);
        });
      });
    }
  }), editor.registerCommand(SET_EDITOR_COMMAND, newEditorNamespace => {
    if (TABLE_STATE[editorNamespace] && newEditorNamespace !== editorNamespace) {
      clearEditorTableSelection(editorNamespace);
    }
    return false;
  }, COMMAND_PRIORITY_EDITOR), function () {
    if (tableSelections[editorNamespace]) {
      tableSelections[editorNamespace].forEach((value, key) => value.removeListeners());
    }
    delete TABLE_STATE[editorNamespace];
  }, function () {
    if (RECENT_JSON && RECENT_JSON.editorNamespace === editor._config.namespace) RECENT_JSON = undefined;
  });
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const getDOMSelection = targetWindow => CAN_USE_DOM ? (targetWindow || window).getSelection() : null;
class TableSelection {
  constructor(editor, tableNodeKey) {
    this.isHighlightingCells = false;
    this.anchorX = -1;
    this.anchorY = -1;
    this.focusX = -1;
    this.focusY = -1;
    this.listenersToRemove = new Set();
    this.tableNodeKey = tableNodeKey;
    this.editor = editor;
    this.grid = {
      cells: [],
      columns: 0,
      rows: 0
    };
    this.gridSelection = null;
    this.anchorCellNodeKey = null;
    this.focusCellNodeKey = null;
    this.anchorCell = null;
    this.focusCell = null;
    this.hasHijackedSelectionStyles = false;
    this.trackTableGrid();
  }
  getGrid() {
    return this.grid;
  }
  removeListeners() {
    for (let removeListener of this.listenersToRemove) {
      removeListener();
    }
  }
  trackTableGrid() {
    const observer = new MutationObserver(records => {
      this.editor.update(() => {
        let gridNeedsRedraw = false;
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const target = record.target;
          const nodeName = target.nodeName;
          if (nodeName === 'TABLE' || nodeName === 'TR') {
            gridNeedsRedraw = true;
            break;
          }
        }
        if (!gridNeedsRedraw) {
          return;
        }
        const tableElement = this.editor.getElementByKey(this.tableNodeKey);
        if (!tableElement) {
          throw new Error('Expected to find TableElement in DOM');
        }
        this.grid = getTableGrid(tableElement);
      });
    });
    this.editor.update(() => {
      const tableElement = this.editor.getElementByKey(this.tableNodeKey);
      if (!tableElement) {
        throw new Error('Expected to find TableElement in DOM');
      }
      this.grid = getTableGrid(tableElement);
      observer.observe(tableElement, {
        childList: true,
        subtree: true
      });
    });
  }
  clearHighlight() {
    const editor = this.editor;
    this.isHighlightingCells = false;
    this.anchorX = -1;
    this.anchorY = -1;
    this.focusX = -1;
    this.focusY = -1;
    this.gridSelection = null;
    this.anchorCellNodeKey = null;
    this.focusCellNodeKey = null;
    this.anchorCell = null;
    this.focusCell = null;
    this.hasHijackedSelectionStyles = false;
    this.enableHighlightStyle();
    editor.update(() => {
      const tableNode = $getNodeByKey(this.tableNodeKey);
      if (!$isTableNode(tableNode)) {
        throw new Error('Expected TableNode.');
      }
      const tableElement = editor.getElementByKey(this.tableNodeKey);
      if (!tableElement) {
        throw new Error('Expected to find TableElement in DOM');
      }
      const grid = getTableGrid(tableElement);
      $updateDOMForSelection(editor, grid, null);
      $setSelection(null);
      editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
    });
  }
  enableHighlightStyle() {
    const editor = this.editor;
    editor.update(() => {
      const tableElement = editor.getElementByKey(this.tableNodeKey);
      if (!tableElement) {
        throw new Error('Expected to find TableElement in DOM');
      }
      removeClassNamesFromElement(tableElement, editor._config.theme.tableSelection);
      tableElement.classList.remove('disable-selection');
      this.hasHijackedSelectionStyles = false;
    });
  }
  disableHighlightStyle() {
    const editor = this.editor;
    editor.update(() => {
      const tableElement = editor.getElementByKey(this.tableNodeKey);
      if (!tableElement) {
        throw new Error('Expected to find TableElement in DOM');
      }
      addClassNamesToElement(tableElement, editor._config.theme.tableSelection);
      this.hasHijackedSelectionStyles = true;
    });
  }
  updateTableGridSelection(selection) {
    if (selection != null && selection.gridKey === this.tableNodeKey) {
      const editor = this.editor;
      this.gridSelection = selection;
      this.isHighlightingCells = true;
      this.disableHighlightStyle();
      $updateDOMForSelection(editor, this.grid, this.gridSelection);
    } else if (selection == null) {
      this.clearHighlight();
    } else {
      this.tableNodeKey = selection.gridKey;
      this.updateTableGridSelection(selection);
    }
  }
  setFocusCellForSelection(cell, ignoreStart = false) {
    const editor = this.editor;
    editor.update(() => {
      const tableNode = $getNodeByKey(this.tableNodeKey);
      if (!$isTableNode(tableNode)) {
        throw new Error('Expected TableNode.');
      }
      const tableElement = editor.getElementByKey(this.tableNodeKey);
      if (!tableElement) {
        throw new Error('Expected to find TableElement in DOM');
      }
      const cellX = cell.x;
      const cellY = cell.y;
      this.focusCell = cell;
      if (this.anchorCell !== null) {
        const domSelection = getDOMSelection(editor._window);
        // Collapse the selection
        if (domSelection) {
          domSelection.setBaseAndExtent(this.anchorCell.elem, 0, this.focusCell.elem, 0);
        }
      }
      if (!this.isHighlightingCells && (this.anchorX !== cellX || this.anchorY !== cellY || ignoreStart)) {
        this.isHighlightingCells = true;
        this.disableHighlightStyle();
      } else if (cellX === this.focusX && cellY === this.focusY) {
        return;
      }
      this.focusX = cellX;
      this.focusY = cellY;
      if (this.isHighlightingCells) {
        const focusTableCellNode = $getNearestNodeFromDOMNode(cell.elem);
        if (this.gridSelection != null && this.anchorCellNodeKey != null && $isTableCellNode(focusTableCellNode)) {
          const focusNodeKey = focusTableCellNode.getKey();
          this.gridSelection = this.gridSelection.clone() || DEPRECATED_$createGridSelection();
          this.focusCellNodeKey = focusNodeKey;
          this.gridSelection.set(this.tableNodeKey, this.anchorCellNodeKey, this.focusCellNodeKey);
          $setSelection(this.gridSelection);
          editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
          $updateDOMForSelection(editor, this.grid, this.gridSelection);
        }
      }
    });
  }
  setAnchorCellForSelection(cell) {
    this.isHighlightingCells = false;
    this.anchorCell = cell;
    this.anchorX = cell.x;
    this.anchorY = cell.y;
    this.editor.update(() => {
      const anchorTableCellNode = $getNearestNodeFromDOMNode(cell.elem);
      if ($isTableCellNode(anchorTableCellNode)) {
        $setActiveCell(this.editor, anchorTableCellNode);
        const anchorNodeKey = anchorTableCellNode.getKey();
        this.gridSelection = this.gridSelection != null ? this.gridSelection.clone() : DEPRECATED_$createGridSelection();
        this.anchorCellNodeKey = anchorNodeKey;
      }
    });
  }
  formatCells(type) {
    this.editor.update(() => {
      const selection = $getSelection();
      if (!DEPRECATED_$isGridSelection(selection)) {
        {
          throw Error(`Expected grid selection`);
        }
      }
      const formatSelection = $createRangeSelection();
      const anchor = formatSelection.anchor;
      const focus = formatSelection.focus;
      selection.getNodes().forEach(cellNode => {
        if ($isTableCellNode(cellNode) && cellNode.getTextContentSize() !== 0) {
          anchor.set(cellNode.getKey(), 0, 'element');
          focus.set(cellNode.getKey(), cellNode.getChildrenSize(), 'element');
          formatSelection.formatText(type);
        }
      });
      $setSelection(selection);
      this.editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
    });
  }
  clearText() {
    const editor = this.editor;
    editor.update(() => {
      const tableNode = $getNodeByKey(this.tableNodeKey);
      if (!$isTableNode(tableNode)) {
        throw new Error('Expected TableNode.');
      }
      const selection = $getSelection();
      if (!DEPRECATED_$isGridSelection(selection)) {
        {
          throw Error(`Expected grid selection`);
        }
      }
      const selectedNodes = selection.getNodes().filter($isTableCellNode);
      if (selectedNodes.length === this.grid.columns * this.grid.rows) {
        tableNode.selectPrevious();
        // Delete entire table
        const parent = tableNode.getParent();
        if ($isTableWrapperNode(parent)) {
          parent.remove();
        } else {
          tableNode.remove();
        }
        const rootNode = $getRoot();
        rootNode.selectStart();
        return;
      }
      selectedNodes.forEach(cellNode => {
        if ($isElementNode(cellNode)) {
          const paragraphNode = $createCellParagraphNode();
          const textNode = $createTextNode();
          paragraphNode.append(textNode);
          cellNode.append(paragraphNode);
          cellNode.getChildren().forEach(child => {
            if (child !== paragraphNode) {
              child.remove();
            }
          });
        }
      });
      $updateDOMForSelection(editor, this.grid, null);
      $setSelection(null);
      editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
    });
  }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
function $createTableNodeWithDimensions(rowCount, columnCount, includeHeaders = true, caption, bandedRows, bandedCols, align) {
  const tableNode = $createTableNode({
    caption,
    bandedRows,
    bandedCols,
    align
  });
  for (let iRow = 0; iRow < rowCount; iRow++) {
    const tableRowNode = $createTableRowNode();
    for (let iColumn = 0; iColumn < columnCount; iColumn++) {
      let headerState = TableCellHeaderStates.NO_STATUS;
      if (typeof includeHeaders === 'object') {
        if (iRow === 0 && includeHeaders.rows) headerState |= TableCellHeaderStates.ROW;
        if (iColumn === 0 && includeHeaders.columns) headerState |= TableCellHeaderStates.COLUMN;
      } else if (includeHeaders) {
        if (iRow === 0) headerState |= TableCellHeaderStates.ROW;
        if (iColumn === 0) headerState |= TableCellHeaderStates.COLUMN;
      }
      const tableCellNode = $createTableCellNode(headerState);
      const paragraphNode = $createCellParagraphNode();
      paragraphNode.append($createTextNode());
      tableCellNode.append(paragraphNode);
      tableRowNode.append(tableCellNode);
    }
    tableNode.append(tableRowNode);
  }
  return tableNode;
}
function $getTableCellNodeFromLexicalNode(startingNode) {
  const node = $findMatchingParent(startingNode, n => $isTableCellNode(n));
  if ($isTableCellNode(node)) {
    return node;
  }
  return null;
}
function $getTableRowNodeFromTableCellNodeOrThrow(startingNode) {
  const node = $findMatchingParent(startingNode, n => $isTableRowNode(n));
  if ($isTableRowNode(node)) {
    return node;
  }
  throw new Error('Expected table cell to be inside of table row.');
}
function $getTableNodeFromLexicalNodeOrThrow(startingNode) {
  const node = $findMatchingParent(startingNode, n => $isTableNode(n));
  if ($isTableNode(node)) {
    return node;
  }
  throw new Error('Expected table cell to be inside of table.');
}
function $getTableRowIndexFromTableCellNode(tableCellNode) {
  const tableRowNode = $getTableRowNodeFromTableCellNodeOrThrow(tableCellNode);
  const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableRowNode);
  return tableNode.getChildren().findIndex(n => n.is(tableRowNode));
}
function $getTableColumnIndexFromTableCellNode(tableCellNode) {
  const tableRowNode = $getTableRowNodeFromTableCellNodeOrThrow(tableCellNode);
  return tableRowNode.getChildren().findIndex(n => n.is(tableCellNode));
}
function $getTableCellSiblingsFromTableCellNode(tableCellNode, grid) {
  const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
  const {
    x,
    y
  } = tableNode.getCordsFromCellNode(tableCellNode, grid);
  return {
    above: tableNode.getCellNodeFromCords(x, y - 1, grid),
    below: tableNode.getCellNodeFromCords(x, y + 1, grid),
    left: tableNode.getCellNodeFromCords(x - 1, y, grid),
    right: tableNode.getCellNodeFromCords(x + 1, y, grid)
  };
}
function $removeTableRowAtIndex(tableNode, indexToDelete) {
  const tableRows = tableNode.getChildren();
  if (indexToDelete >= tableRows.length || indexToDelete < 0) {
    throw new Error('Expected table cell to be inside of table row.');
  }
  const targetRowNode = tableRows[indexToDelete];
  targetRowNode.remove();
  return tableNode;
}
function $insertTableRow(tableNode, targetIndex, shouldInsertAfter = true, rowCount, grid) {
  const tableRows = tableNode.getChildren();
  if (targetIndex >= tableRows.length || targetIndex < 0) {
    throw new Error('Table row target index out of range');
  }
  const targetRowNode = tableRows[targetIndex];
  if ($isTableRowNode(targetRowNode)) {
    for (let r = 0; r < rowCount; r++) {
      const tableRowCells = targetRowNode.getChildren();
      const tableColumnCount = tableRowCells.length;
      const newTableRowNode = $createTableRowNode();
      for (let c = 0; c < tableColumnCount; c++) {
        const tableCellFromTargetRow = tableRowCells[c];
        if (!$isTableCellNode(tableCellFromTargetRow)) {
          throw Error(`Expected table cell`);
        }
        const {
          above,
          below
        } = $getTableCellSiblingsFromTableCellNode(tableCellFromTargetRow, grid);
        let headerState = TableCellHeaderStates.NO_STATUS;
        const width = above && above.getWidth() || below && below.getWidth() || undefined;
        if (above && above.hasHeaderState(TableCellHeaderStates.COLUMN) || below && below.hasHeaderState(TableCellHeaderStates.COLUMN)) {
          headerState |= TableCellHeaderStates.COLUMN;
        }
        const tableCellNode = $createTableCellNode(headerState, 1, width);
        tableCellNode.append($createCellParagraphNode());
        newTableRowNode.append(tableCellNode);
      }
      if (shouldInsertAfter) {
        targetRowNode.insertAfter(newTableRowNode);
      } else {
        targetRowNode.insertBefore(newTableRowNode);
      }
    }
  } else {
    throw new Error('Row before insertion index does not exist.');
  }
  return tableNode;
}
function $insertTableRow__EXPERIMENTAL(insertAfter = true, numOfRows = 1, includeRowHeader) {
  const selection = $getSelection();
  if (!($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
    throw Error(`Expected a RangeSelection or GridSelection`);
  }
  const focus = selection.focus.getNode();
  const [focusCell,, grid] = DEPRECATED_$getNodeTriplet(focus);
  const [gridMap, focusCellMap] = DEPRECATED_$computeGridMap(grid, focusCell, focusCell);
  const columnCount = gridMap[0].length;
  const {
    startRow: focusStartRow
  } = focusCellMap;
  if (insertAfter) {
    const focusEndRow = focusStartRow + focusCell.__rowSpan - 1;
    const focusEndRowMap = gridMap[focusEndRow];
    const rowsToAdd = [];
    for (let j = 0; j < numOfRows; j++) {
      const newRow = $createTableRowNode();
      for (let i = 0; i < columnCount; i++) {
        const {
          cell,
          startRow
        } = focusEndRowMap[i];
        if (startRow + cell.__rowSpan - 1 <= focusEndRow) {
          newRow.append($createTableCellNode(Boolean(includeRowHeader && i === 0) ? 2 : TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode()));
        } else {
          cell.setRowSpan(cell.__rowSpan + 1);
        }
      }
      rowsToAdd.push(newRow);
    }
    const focusEndRowNode = grid.getChildAtIndex(focusEndRow);
    if (!DEPRECATED_$isGridRowNode(focusEndRowNode)) {
      throw Error(`focusEndRow is not a GridRowNode`);
    }
    var insertAfterRow = focusEndRowNode;
    for (let i = 0; i < rowsToAdd.length; i++) {
      insertAfterRow.insertAfter(rowsToAdd[i]);
      insertAfterRow = rowsToAdd[i];
    }
  } else {
    const focusStartRowMap = gridMap[focusStartRow];
    const rowsToAdd = [];
    for (let j = 0; j < numOfRows; j++) {
      const newRow = $createTableRowNode();
      for (let i = 0; i < columnCount; i++) {
        const {
          cell,
          startRow
        } = focusStartRowMap[i];
        if (startRow === focusStartRow) {
          newRow.append($createTableCellNode(Boolean(includeRowHeader && i === 0) ? 2 : TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode()));
        } else {
          cell.setRowSpan(cell.__rowSpan + 1);
        }
      }
      rowsToAdd.push(newRow);
    }
    const focusStartRowNode = grid.getChildAtIndex(focusStartRow);
    if (!DEPRECATED_$isGridRowNode(focusStartRowNode)) {
      throw Error(`focusEndRow is not a GridRowNode`);
    }
    for (let i = 0; i < rowsToAdd.length; i++) {
      focusStartRowNode.insertBefore(rowsToAdd[i]);
    }
  }
}
function $insertTableColumn(tableNode, targetIndex, shouldInsertAfter = true, columnCount, grid) {
  const tableRows = tableNode.getChildren();
  const tableCellsToBeInserted = [];
  for (let r = 0; r < tableRows.length; r++) {
    const currentTableRowNode = tableRows[r];
    if ($isTableRowNode(currentTableRowNode)) {
      for (let c = 0; c < columnCount; c++) {
        const tableRowChildren = currentTableRowNode.getChildren();
        if (targetIndex >= tableRowChildren.length || targetIndex < 0) {
          throw new Error('Table column target index out of range');
        }
        const targetCell = tableRowChildren[targetIndex];
        if (!$isTableCellNode(targetCell)) {
          throw Error(`Expected table cell`);
        }
        const {
          left,
          right
        } = $getTableCellSiblingsFromTableCellNode(targetCell, grid);
        let headerState = TableCellHeaderStates.NO_STATUS;
        if (left && left.hasHeaderState(TableCellHeaderStates.ROW) || right && right.hasHeaderState(TableCellHeaderStates.ROW)) {
          headerState |= TableCellHeaderStates.ROW;
        }
        const newTableCell = $createTableCellNode(headerState);
        newTableCell.append($createCellParagraphNode());
        tableCellsToBeInserted.push({
          newTableCell,
          targetCell
        });
      }
    }
  }
  tableCellsToBeInserted.forEach(({
    newTableCell,
    targetCell
  }) => {
    if (shouldInsertAfter) {
      targetCell.insertAfter(newTableCell);
    } else {
      targetCell.insertBefore(newTableCell);
    }
  });
  return tableNode;
}
function $insertTableColumn__EXPERIMENTAL(insertAfter = true, columns = 1, hasHeaderColumn = false) {
  const selection = $getSelection();
  if (!($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
    throw Error(`Expected a RangeSelection or GridSelection`);
  }
  const anchor = selection.anchor.getNode();
  const focus = selection.focus.getNode();
  const [anchorCell] = DEPRECATED_$getNodeTriplet(anchor);
  const [focusCell,, grid] = DEPRECATED_$getNodeTriplet(focus);
  const [gridMap, focusCellMap, anchorCellMap] = DEPRECATED_$computeGridMap(grid, focusCell, anchorCell);
  const rowCount = gridMap.length;
  const startColumn = insertAfter ? Math.max(focusCellMap.startColumn, anchorCellMap.startColumn) : Math.min(focusCellMap.startColumn, anchorCellMap.startColumn);
  const insertAfterColumn = insertAfter ? startColumn + focusCell.__colSpan - 1 : startColumn - 1;
  const gridFirstChild = grid.getFirstChild();
  if (!DEPRECATED_$isGridRowNode(gridFirstChild)) {
    throw Error(`Expected firstTable child to be a row`);
  }
  let firstInsertedCell = null;
  function $createTableCellNodeForInsertTableColumn(firstCell) {
    const cell = $createTableCellNode(Boolean(firstCell && hasHeaderColumn) ? 3 : TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode());
    if (firstInsertedCell === null) {
      firstInsertedCell = cell;
    }
    return cell;
  }
  var start = gridFirstChild;
  for (let j = 0; j < columns; j++) {
    let loopRow = start;
    rowLoop: for (let i = 0; i < rowCount; i++) {
      if (i !== 0) {
        const currentRow = loopRow.getNextSibling();
        if (!DEPRECATED_$isGridRowNode(currentRow)) {
          throw Error(`Expected row nextSibling to be a row`);
        }
        loopRow = currentRow;
      }
      const rowMap = gridMap[i];
      if (insertAfterColumn < 0) {
        $insertFirst(loopRow, $createTableCellNodeForInsertTableColumn(Boolean(i === 0)));
        continue;
      }
      const {
        cell: currentCell,
        startColumn: currentStartColumn,
        startRow: currentStartRow
      } = rowMap[insertAfterColumn];
      if (currentStartColumn + currentCell.__colSpan - 1 <= insertAfterColumn) {
        let insertAfterCell = currentCell;
        let insertAfterCellRowStart = currentStartRow;
        let prevCellIndex = insertAfterColumn;
        while (insertAfterCellRowStart !== i && insertAfterCell.__rowSpan > 1) {
          prevCellIndex -= currentCell.__colSpan;
          if (prevCellIndex >= 0) {
            const {
              cell: cell_,
              startRow: startRow_
            } = rowMap[prevCellIndex];
            insertAfterCell = cell_;
            insertAfterCellRowStart = startRow_;
          } else {
            loopRow.append($createTableCellNodeForInsertTableColumn(Boolean(i === 0)));
            continue rowLoop;
          }
        }
        insertAfterCell.insertAfter($createTableCellNodeForInsertTableColumn(Boolean(i === 0)));
      } else {
        currentCell.setColSpan(currentCell.__colSpan + 1);
      }
    }
  }
  if (firstInsertedCell !== null) {
    $moveSelectionToCell(firstInsertedCell);
  }
}
function $deleteTableColumn(tableNode, targetIndex) {
  const tableRows = tableNode.getChildren();
  for (let i = 0; i < tableRows.length; i++) {
    const currentTableRowNode = tableRows[i];
    if ($isTableRowNode(currentTableRowNode)) {
      const tableRowChildren = currentTableRowNode.getChildren();
      if (targetIndex >= tableRowChildren.length || targetIndex < 0) {
        throw new Error('Table column target index out of range');
      }
      tableRowChildren[targetIndex].remove();
    }
  }
  return tableNode;
}
function $deleteTableRow__EXPERIMENTAL() {
  const selection = $getSelection();
  if (!($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
    throw Error(`Expected a RangeSelection or GridSelection`);
  }
  const anchor = selection.anchor.getNode();
  const focus = selection.focus.getNode();
  const [anchorCell,, grid] = DEPRECATED_$getNodeTriplet(anchor);
  const [focusCell] = DEPRECATED_$getNodeTriplet(focus);
  const [gridMap, anchorCellMap, focusCellMap] = DEPRECATED_$computeGridMap(grid, anchorCell, focusCell);
  const {
    startRow: anchorStartRow
  } = anchorCellMap;
  const {
    startRow: focusStartRow
  } = focusCellMap;
  const focusEndRow = focusStartRow + focusCell.__rowSpan - 1;
  if (gridMap.length === focusEndRow - anchorStartRow + 1) {
    // Empty grid
    grid.remove();
    return;
  }
  const columnCount = gridMap[0].length;
  const nextRow = gridMap[focusEndRow + 1];
  const nextRowNode = grid.getChildAtIndex(focusEndRow + 1);
  for (let row = focusEndRow; row >= anchorStartRow; row--) {
    for (let column = columnCount - 1; column >= 0; column--) {
      const {
        cell,
        startRow: cellStartRow,
        startColumn: cellStartColumn
      } = gridMap[row][column];
      if (cellStartColumn !== column) {
        // Don't repeat work for the same Cell
        continue;
      }
      // Rows overflowing top have to be trimmed
      if (row === anchorStartRow && cellStartRow < anchorStartRow) {
        cell.setRowSpan(cell.__rowSpan - (cellStartRow - anchorStartRow));
      }
      // Rows overflowing bottom have to be trimmed and moved to the next row
      if (cellStartRow >= anchorStartRow && cellStartRow + cell.__rowSpan - 1 > focusEndRow) {
        cell.setRowSpan(cell.__rowSpan - (focusEndRow - cellStartRow + 1));
        if (!(nextRowNode !== null)) {
          throw Error(`Expected nextRowNode not to be null`);
        }
        if (column === 0) {
          $insertFirst(nextRowNode, cell);
        } else {
          const {
            cell: previousCell
          } = nextRow[column - 1];
          previousCell.insertAfter(cell);
        }
      }
    }
    const rowNode = grid.getChildAtIndex(row);
    if (!DEPRECATED_$isGridRowNode(rowNode)) {
      throw Error(`Expected GridNode childAtIndex(${String(row)}) to be RowNode`);
    }
    rowNode.remove();
  }
  if (nextRow !== undefined) {
    const {
      cell
    } = nextRow[0];
    $moveSelectionToCell(cell);
  } else {
    const previousRow = gridMap[anchorStartRow - 1];
    const {
      cell
    } = previousRow[0];
    $moveSelectionToCell(cell);
  }
}
function $deleteTableColumn__EXPERIMENTAL() {
  const selection = $getSelection();
  if (!($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
    throw Error(`Expected a RangeSelection or GridSelection`);
  }
  const anchor = selection.anchor.getNode();
  const focus = selection.focus.getNode();
  const [anchorCell,, grid] = DEPRECATED_$getNodeTriplet(anchor);
  const [focusCell] = DEPRECATED_$getNodeTriplet(focus);
  const [gridMap, anchorCellMap, focusCellMap] = DEPRECATED_$computeGridMap(grid, anchorCell, focusCell);
  const {
    startColumn: anchorStartColumn
  } = anchorCellMap;
  const {
    startRow: focusStartRow,
    startColumn: focusStartColumn
  } = focusCellMap;
  const startColumn = Math.min(anchorStartColumn, focusStartColumn);
  const endColumn = Math.max(anchorStartColumn + anchorCell.__colSpan - 1, focusStartColumn + focusCell.__colSpan - 1);
  const selectedColumnCount = endColumn - startColumn + 1;
  const columnCount = gridMap[0].length;
  if (columnCount === endColumn - startColumn + 1) {
    // Empty grid
    grid.selectPrevious();
    grid.remove();
    return;
  }
  const rowCount = gridMap.length;
  for (let row = 0; row < rowCount; row++) {
    for (let column = startColumn; column <= endColumn; column++) {
      const {
        cell,
        startColumn: cellStartColumn
      } = gridMap[row][column];
      if (cellStartColumn < startColumn) {
        if (column === startColumn) {
          const overflowLeft = startColumn - cellStartColumn;
          // Overflowing left
          cell.setColSpan(cell.__colSpan -
          // Possible overflow right too
          Math.min(selectedColumnCount, cell.__colSpan - overflowLeft));
        }
      } else if (cellStartColumn + cell.__colSpan - 1 > endColumn) {
        if (column === endColumn) {
          // Overflowing right
          const inSelectedArea = endColumn - cellStartColumn + 1;
          cell.setColSpan(cell.__colSpan - inSelectedArea);
        }
      } else {
        cell.remove();
      }
    }
  }
  const focusRowMap = gridMap[focusStartRow];
  const nextColumn = focusRowMap[focusStartColumn + focusCell.__colSpan] || focusRowMap[focusStartColumn - 1];
  if (nextColumn !== undefined) {
    const {
      cell
    } = nextColumn;
    $moveSelectionToCell(cell);
  } else {
    const previousRow = focusRowMap[focusStartColumn - 1];
    const {
      cell
    } = previousRow;
    $moveSelectionToCell(cell);
  }
}
function $moveSelectionToCell(cell) {
  const firstDescendant = cell.getFirstDescendant();
  if (firstDescendant == null) {
    cell.selectStart();
  } else {
    firstDescendant.getParentOrThrow().selectStart();
  }
}
function $insertFirst(parent, node) {
  const firstChild = parent.getFirstChild();
  if (firstChild !== null) {
    firstChild.insertBefore(node);
  } else {
    parent.append(node);
  }
}
function $unmergeCell() {
  const selection = $getSelection();
  if (!($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection))) {
    throw Error(`Expected a RangeSelection or GridSelection`);
  }
  const anchor = selection.anchor.getNode();
  const [cell, row, grid] = DEPRECATED_$getNodeTriplet(anchor);
  const colSpan = cell.__colSpan;
  const rowSpan = cell.__rowSpan;
  if (colSpan > 1) {
    for (let i = 1; i < colSpan; i++) {
      cell.insertAfter($createTableCellNode(TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode()));
    }
    cell.setColSpan(1);
  }
  if (rowSpan > 1) {
    const [map, cellMap] = DEPRECATED_$computeGridMap(grid, cell, cell);
    const {
      startColumn,
      startRow
    } = cellMap;
    let currentRowNode;
    for (let i = 1; i < rowSpan; i++) {
      const currentRow = startRow + i;
      const currentRowMap = map[currentRow];
      currentRowNode = (currentRowNode || row).getNextSibling();
      if (!DEPRECATED_$isGridRowNode(currentRowNode)) {
        throw Error(`Expected row next sibling to be a row`);
      }
      let insertAfterCell = null;
      for (let column = 0; column < startColumn; column++) {
        const currentCellMap = currentRowMap[column];
        const currentCell = currentCellMap.cell;
        if (currentCellMap.startRow === currentRow) {
          insertAfterCell = currentCell;
        }
        if (currentCell.__colSpan > 1) {
          column += currentCell.__colSpan - 1;
        }
      }
      if (insertAfterCell === null) {
        for (let j = 0; j < colSpan; j++) {
          $insertFirst(currentRowNode, $createTableCellNode(TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode()));
        }
      } else {
        for (let j = 0; j < colSpan; j++) {
          insertAfterCell.insertAfter($createTableCellNode(TableCellHeaderStates.NO_STATUS).append($createCellParagraphNode()));
        }
      }
    }
    cell.setRowSpan(1);
  }
}
function $getColumnHeaderCellsInRange(table, colMin, colMax) {
  const rowNodes = table.getChildren();
  var actualColIndex = 0;
  var ret = undefined;
  const headerRow = rowNodes[0];
  if ($isTableRowNode(headerRow)) {
    const cells = headerRow.getChildren();
    for (let cell of cells) {
      if ($isTableCellNode(cell)) {
        const colSpan = cell.getColSpan();
        if (actualColIndex >= colMin && actualColIndex <= colMax) {
          if (!!!ret) ret = [];
          ret.push(cell);
        }
        actualColIndex = actualColIndex + colSpan;
      }
    }
  }
  return ret;
}
function $getRowHeaderCellsInRange(table, rowMin, rowMax) {
  const rowNodes = table.getChildren();
  var actualRowIndex = 0;
  var ret = undefined;
  for (let rowNode of rowNodes) {
    if ($isTableRowNode(rowNode)) {
      const cells = rowNode.getChildren();
      const headerCell = cells[0];
      if ($isTableCellNode(headerCell)) {
        const rowSpan = headerCell.getRowSpan();
        if (actualRowIndex >= rowMin && actualRowIndex <= rowMax) {
          if (!!!ret) ret = [];
          ret.push(headerCell);
        }
        actualRowIndex = actualRowIndex + rowSpan;
      }
    }
  }
  return ret;
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const LEXICAL_ELEMENT_KEY = '__lexicalTableSelection';
function applyTableHandlers(tableNode, tableElement, editor, hasTabHandler) {
  const rootElement = editor.getRootElement();
  if (rootElement === null) {
    throw new Error('No root element.');
  }
  const tableSelection = new TableSelection(editor, tableNode.getKey());
  const editorWindow = editor._window || window;
  attachTableSelectionToTableElement(tableElement, tableSelection);
  tableElement.addEventListener('mousedown', event => {
    setTimeout(() => {
      if (event.button !== 0) {
        return;
      }
      if (!editorWindow) {
        return;
      }
      const anchorCell = getCellFromTarget(event.target);
      if (anchorCell !== null) {
        stopEvent(event);
        tableSelection.setAnchorCellForSelection(anchorCell);
      }
      const onMouseUp = () => {
        editorWindow.removeEventListener('mouseup', onMouseUp);
        editorWindow.removeEventListener('mousemove', onMouseMove);
      };
      const onMouseMove = moveEvent => {
        const focusCell = getCellFromTarget(moveEvent.target);
        if (focusCell !== null && (tableSelection.anchorX !== focusCell.x || tableSelection.anchorY !== focusCell.y)) {
          moveEvent.preventDefault();
          tableSelection.setFocusCellForSelection(focusCell);
        }
      };
      editorWindow.addEventListener('mouseup', onMouseUp);
      editorWindow.addEventListener('mousemove', onMouseMove);
    }, 0);
  });

  // Clear selection when clicking outside of dom.
  const mouseDownCallback = event => {
    if (event.button !== 0) {
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      const target = event.target;
      if (DEPRECATED_$isGridSelection(selection) && selection.gridKey === tableSelection.tableNodeKey && rootElement.contains(target)) {
        tableSelection.clearHighlight();
      }
    });
  };
  editorWindow.addEventListener('mousedown', mouseDownCallback);
  tableSelection.listenersToRemove.add(() => editorWindow.removeEventListener('mousedown', mouseDownCallback));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_ARROW_DOWN_COMMAND, event => $handleArrowKey(editor, event, 'down', tableNode, tableSelection), COMMAND_PRIORITY_HIGH));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_ARROW_UP_COMMAND, event => $handleArrowKey(editor, event, 'up', tableNode, tableSelection), COMMAND_PRIORITY_HIGH));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_ARROW_LEFT_COMMAND, event => $handleArrowKey(editor, event, 'backward', tableNode, tableSelection), COMMAND_PRIORITY_HIGH));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, event => $handleArrowKey(editor, event, 'forward', tableNode, tableSelection), COMMAND_PRIORITY_HIGH));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_ESCAPE_COMMAND, event => {
    const selection = $getSelection();
    if (DEPRECATED_$isGridSelection(selection)) {
      const focusCellNode = $findMatchingParent(selection.focus.getNode(), $isTableCellNode);
      if ($isTableCellNode(focusCellNode)) {
        stopEvent(event);
        focusCellNode.selectEnd();
        return true;
      }
    }
    return false;
  }, COMMAND_PRIORITY_HIGH));
  const deleteTextHandler = command => () => {
    const selection = $getSelection();
    if (!$isSelectionInTable(selection, tableNode)) {
      return false;
    }
    if (DEPRECATED_$isGridSelection(selection)) {
      tableSelection.clearText();
      return true;
    } else if ($isRangeSelection(selection)) {
      const tableCellNode = $findMatchingParent(selection.anchor.getNode(), n => $isTableCellNode(n));
      if (!$isTableCellNode(tableCellNode)) {
        return false;
      }
      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      const isAnchorInside = tableNode.isParentOf(anchorNode);
      const isFocusInside = tableNode.isParentOf(focusNode);
      const selectionContainsPartialTable = isAnchorInside && !isFocusInside || isFocusInside && !isAnchorInside;
      if (selectionContainsPartialTable) {
        tableSelection.clearText();
        return true;
      }
      const nearestElementNode = $findMatchingParent(selection.anchor.getNode(), n => $isElementNode(n));
      const topLevelCellElementNode = nearestElementNode && $findMatchingParent(nearestElementNode, n => $isElementNode(n) && $isTableCellNode(n.getParent()));
      if (!$isElementNode(topLevelCellElementNode) || !$isElementNode(nearestElementNode)) {
        return false;
      }
      if (command === DELETE_LINE_COMMAND && topLevelCellElementNode.getPreviousSibling() === null) {
        // TODO: Fix Delete Line in Table Cells.
        return true;
      }
      if (command === DELETE_CHARACTER_COMMAND || command === DELETE_WORD_COMMAND) {
        if (selection.isCollapsed() && selection.anchor.offset === 0) {
          if (nearestElementNode !== topLevelCellElementNode) {
            const children = nearestElementNode.getChildren();
            const newParagraphNode = $createCellParagraphNode();
            children.forEach(child => newParagraphNode.append(child));
            nearestElementNode.replace(newParagraphNode);
            nearestElementNode.getWritable().__parent = tableCellNode.getKey();
            return true;
          }
        }
      }
    }
    return false;
  };
  [DELETE_WORD_COMMAND, DELETE_LINE_COMMAND, DELETE_CHARACTER_COMMAND].forEach(command => {
    tableSelection.listenersToRemove.add(editor.registerCommand(command, deleteTextHandler(command), COMMAND_PRIORITY_CRITICAL));
  });
  const deleteCellHandler = event => {
    const selection = $getSelection();
    if (!$isSelectionInTable(selection, tableNode)) {
      return false;
    }
    if (DEPRECATED_$isGridSelection(selection)) {
      event.preventDefault();
      event.stopPropagation();
      tableSelection.clearText();
      return true;
    } else if ($isRangeSelection(selection)) {
      const tableCellNode = $findMatchingParent(selection.anchor.getNode(), n => $isTableCellNode(n));
      if (!$isTableCellNode(tableCellNode)) {
        return false;
      }
      if (tableCellNode.getChildren().length === 1) {
        const node = tableCellNode.getChildren()[0];
        if ($isElementNode(node)) {
          const IS_EMPTY = node.isEmpty();
          if (IS_EMPTY) {
            event.preventDefault();
            event.stopPropagation();
          }
          if (!!!$isCellParagraphNode(node)) {
            node.replace($createCellParagraphNode());
          }
        } else if ($isLineBreakNode(node)) {
          node.replace($createCellParagraphNode().append($createTextNode()), false);
          event.preventDefault();
          event.stopPropagation();
        } else if ($isDecoratorNode(node)) {
          node.replace($createCellParagraphNode().append($createTextNode()), false);
          event.preventDefault();
          event.stopPropagation();
        }
        return true;
      }
    }
    return false;
  };
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_BACKSPACE_COMMAND, deleteCellHandler, COMMAND_PRIORITY_CRITICAL));
  tableSelection.listenersToRemove.add(editor.registerCommand(KEY_DELETE_COMMAND, deleteCellHandler, COMMAND_PRIORITY_CRITICAL));
  tableSelection.listenersToRemove.add(editor.registerCommand(FORMAT_TEXT_COMMAND, payload => {
    const selection = $getSelection();
    if (!$isSelectionInTable(selection, tableNode)) {
      return false;
    }
    if (DEPRECATED_$isGridSelection(selection)) {
      tableSelection.formatCells(payload);
      return true;
    } else if ($isRangeSelection(selection)) {
      const tableCellNode = $findMatchingParent(selection.anchor.getNode(), n => $isTableCellNode(n));
      if (!$isTableCellNode(tableCellNode)) {
        return false;
      }
    }
    return false;
  }, COMMAND_PRIORITY_CRITICAL));
  tableSelection.listenersToRemove.add(editor.registerCommand(CONTROLLED_TEXT_INSERTION_COMMAND, payload => {
    const selection = $getSelection();
    if (!$isSelectionInTable(selection, tableNode)) {
      return false;
    }
    if (DEPRECATED_$isGridSelection(selection)) {
      tableSelection.clearHighlight();
      return false;
    } else if ($isRangeSelection(selection)) {
      const tableCellNode = $findMatchingParent(selection.anchor.getNode(), n => $isTableCellNode(n));
      if (!$isTableCellNode(tableCellNode)) {
        return false;
      }
    }
    return false;
  }, COMMAND_PRIORITY_CRITICAL));
  if (hasTabHandler) {
    tableSelection.listenersToRemove.add(editor.registerCommand(KEY_TAB_COMMAND, event => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed() || !$isSelectionInTable(selection, tableNode)) {
        return false;
      }
      const tableCellNode = $findCellNode(selection.anchor.getNode());
      if (tableCellNode === null) {
        return false;
      }
      stopEvent(event);
      const currentCords = tableNode.getCordsFromCellNode(tableCellNode, tableSelection.grid);
      selectGridNodeInDirection(tableSelection, tableNode, currentCords.x, currentCords.y, !event.shiftKey ? 'forward' : 'backward');
      return true;
    }, COMMAND_PRIORITY_CRITICAL));
  }
  tableSelection.listenersToRemove.add(editor.registerCommand(FOCUS_COMMAND, payload => {
    return tableNode.isSelected();
  }, COMMAND_PRIORITY_HIGH));
  function getCellFromCellNode(tableCellNode) {
    const currentCords = tableNode.getCordsFromCellNode(tableCellNode, tableSelection.grid);
    return tableNode.getCellFromCordsOrThrow(currentCords.x, currentCords.y, tableSelection.grid);
  }
  tableSelection.listenersToRemove.add(editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    const selection = $getSelection();
    const prevSelection = $getPreviousSelection();
    if ($isRangeSelection(selection)) {
      const {
        anchor,
        focus
      } = selection;
      const anchorNode = anchor.getNode();
      const focusNode = focus.getNode();
      // Using explicit comparison with table node to ensure it's not a nested table
      // as in that case we'll leave selection resolving to that table
      const anchorCellNode = $findCellNode(anchorNode);
      const focusCellNode = $findCellNode(focusNode);
      const isAnchorInside = anchorCellNode && tableNode.is($findTableNode(anchorCellNode));
      const isFocusInside = focusCellNode && tableNode.is($findTableNode(focusCellNode));
      const isPartialyWithinTable = isAnchorInside !== isFocusInside;
      const isWithinTable = isAnchorInside && isFocusInside;
      const isBackward = selection.isBackward();
      if (isPartialyWithinTable) {
        const newSelection = selection.clone();
        newSelection.focus.set(tableNode.getKey(), isBackward ? 0 : tableNode.getChildrenSize(), 'element');
        $setSelection(newSelection);
        $addHighlightStyleToTable(editor, tableSelection);
      } else if (isWithinTable) {
        // Handle case when selection spans across multiple cells but still
        // has range selection, then we convert it into grid selection
        if (!anchorCellNode.is(focusCellNode)) {
          tableSelection.setAnchorCellForSelection(getCellFromCellNode(anchorCellNode));
          tableSelection.setFocusCellForSelection(getCellFromCellNode(focusCellNode), true);
        }
      }
    }
    if (selection && !selection.is(prevSelection) && (DEPRECATED_$isGridSelection(selection) || DEPRECATED_$isGridSelection(prevSelection)) && tableSelection.gridSelection && !tableSelection.gridSelection.is(prevSelection)) {
      if (DEPRECATED_$isGridSelection(selection) && selection.gridKey === tableSelection.tableNodeKey) {
        tableSelection.updateTableGridSelection(selection);
      } else if (!DEPRECATED_$isGridSelection(selection) && DEPRECATED_$isGridSelection(prevSelection) && prevSelection.gridKey === tableSelection.tableNodeKey) {
        tableSelection.updateTableGridSelection(null);
      }
      return false;
    }
    if (tableSelection.hasHijackedSelectionStyles && !tableNode.isSelected()) {
      $removeHighlightStyleToTable(editor, tableSelection);
    } else if (!tableSelection.hasHijackedSelectionStyles && tableNode.isSelected()) {
      $addHighlightStyleToTable(editor, tableSelection);
    }
    return false;
  }, COMMAND_PRIORITY_CRITICAL));
  return tableSelection;
}
function attachTableSelectionToTableElement(tableElement, tableSelection) {
  tableElement[LEXICAL_ELEMENT_KEY] = tableSelection;
}
function getTableSelectionFromTableElement(tableElement) {
  return tableElement[LEXICAL_ELEMENT_KEY];
}
function getCellFromTarget(node) {
  let currentNode = node;
  while (currentNode != null) {
    const nodeName = currentNode.nodeName;
    if (nodeName === 'TD' || nodeName === 'TH') {
      // @ts-expect-error: internal field
      const cell = currentNode._cell;
      if (cell === undefined) {
        return null;
      }
      return cell;
    }
    currentNode = currentNode.parentNode;
  }
  return null;
}
function getTableGrid(tableElement) {
  const cells = [];
  const grid = {
    cells,
    columns: 0,
    rows: 0
  };
  let currentNode = tableElement.firstChild;
  let x = 0;
  let y = 0;
  cells.length = 0;
  while (currentNode != null) {
    const nodeMame = currentNode.nodeName;
    if (nodeMame === 'TD' || nodeMame === 'TH') {
      const elem = currentNode;
      const cell = {
        elem,
        hasBackgroundColor: elem.style.backgroundColor !== '',
        highlighted: false,
        x,
        y
      };

      // @ts-expect-error: internal field
      currentNode._cell = cell;
      let row = cells[y];
      if (row === undefined) {
        row = cells[y] = [];
      }
      row[x] = cell;
    } else {
      const child = currentNode.firstChild;
      if (child != null) {
        currentNode = child;
        continue;
      }
    }
    const sibling = currentNode.nextSibling;
    if (sibling != null) {
      x++;
      currentNode = sibling;
      continue;
    }
    const parent = currentNode.parentNode;
    if (parent != null) {
      const parentSibling = parent.nextSibling;
      if (parentSibling == null) {
        break;
      }
      y++;
      x = 0;
      currentNode = parentSibling;
    }
  }
  grid.columns = x + 1;
  grid.rows = y + 1;
  return grid;
}
function getTableElementFromGrid(editor, grid) {
  const {
    cells
  } = grid;
  const row = cells[0];
  if (row) {
    const cell = row[0];
    if (cell) {
      const lexicalNode = $getNearestNodeFromDOMNode(cell.elem);
      if (lexicalNode) {
        const table = $getTableNodeFromLexicalNodeOrThrow(lexicalNode);
        if (table) {
          const tableElement = editor.getElementByKey(table.getKey());
          if (tableElement) return tableElement;
        }
      }
    }
  }
  return undefined;
}
function $updateDOMForSelection(editor, grid, selection) {
  const selectedCellNodes = new Set(selection ? selection.getNodes() : []);
  if (selectedCellNodes.size) {
    const tableHTMLElement = getTableElementFromGrid(editor, grid);
    if (tableHTMLElement) tableHTMLElement.classList.add('selecting');
  } else {
    const tableHTMLElement = getTableElementFromGrid(editor, grid);
    if (tableHTMLElement) tableHTMLElement.classList.remove('selecting');
  }
  $forEachGridCell(grid, (cell, lexicalNode) => {
    const elem = cell.elem;
    if (selectedCellNodes.has(lexicalNode)) {
      cell.highlighted = true;
      $addHighlightToDOM(editor, cell);
    } else {
      cell.highlighted = false;
      $removeHighlightFromDOM(editor, cell);
      if (!elem.getAttribute('style')) {
        elem.removeAttribute('style');
      }
    }
  });
}
function $forEachGridCell(grid, cb) {
  const {
    cells
  } = grid;
  for (let y = 0; y < cells.length; y++) {
    const row = cells[y];
    if (!row) {
      continue;
    }
    for (let x = 0; x < row.length; x++) {
      const cell = row[x];
      if (!cell) {
        continue;
      }
      const lexicalNode = $getNearestNodeFromDOMNode(cell.elem);
      if (lexicalNode !== null) {
        cb(cell, lexicalNode, {
          x,
          y
        });
      }
    }
  }
}
function $addHighlightStyleToTable(editor, tableSelection) {
  tableSelection.disableHighlightStyle();
  $forEachGridCell(tableSelection.grid, cell => {
    cell.highlighted = true;
    $addHighlightToDOM(editor, cell);
  });
}
function $removeHighlightStyleToTable(editor, tableSelection) {
  tableSelection.enableHighlightStyle();
  $forEachGridCell(tableSelection.grid, cell => {
    const elem = cell.elem;
    cell.highlighted = false;
    $removeHighlightFromDOM(editor, cell);
    if (!elem.getAttribute('style')) {
      elem.removeAttribute('style');
    }
  });
}
const selectGridNodeInDirection = (tableSelection, tableNode, x, y, direction) => {
  const isForward = direction === 'forward';
  switch (direction) {
    case 'backward':
    case 'forward':
      if (x !== (isForward ? tableSelection.grid.columns - 1 : 0)) {
        selectTableCellNode(tableNode.getCellNodeFromCordsOrThrow(x + (isForward ? 1 : -1), y, tableSelection.grid), isForward);
      } else {
        if (y !== (isForward ? tableSelection.grid.rows - 1 : 0)) {
          selectTableCellNode(tableNode.getCellNodeFromCordsOrThrow(isForward ? 0 : tableSelection.grid.columns - 1, y + (isForward ? 1 : -1), tableSelection.grid), isForward);
        } else if (!isForward) {
          tableNode.selectPrevious();
        } else {
          tableNode.selectNext();
        }
      }
      return true;
    case 'up':
      if (y !== 0) {
        selectTableCellNode(tableNode.getCellNodeFromCordsOrThrow(x, y - 1, tableSelection.grid), false);
      } else {
        tableNode.selectPrevious();
      }
      return true;
    case 'down':
      if (y !== tableSelection.grid.rows - 1) {
        selectTableCellNode(tableNode.getCellNodeFromCordsOrThrow(x, y + 1, tableSelection.grid), true);
      } else {
        tableNode.selectNext();
      }
      return true;
    default:
      return false;
  }
};
const adjustFocusNodeInDirection = (tableSelection, tableNode, x, y, direction) => {
  const isForward = direction === 'forward';
  switch (direction) {
    case 'backward':
    case 'forward':
      if (x !== (isForward ? tableSelection.grid.columns - 1 : 0)) {
        tableSelection.setFocusCellForSelection(tableNode.getCellFromCordsOrThrow(x + (isForward ? 1 : -1), y, tableSelection.grid));
      }
      return true;
    case 'up':
      if (y !== 0) {
        tableSelection.setFocusCellForSelection(tableNode.getCellFromCordsOrThrow(x, y - 1, tableSelection.grid));
        return true;
      } else {
        return false;
      }
    case 'down':
      if (y !== tableSelection.grid.rows - 1) {
        tableSelection.setFocusCellForSelection(tableNode.getCellFromCordsOrThrow(x, y + 1, tableSelection.grid));
        return true;
      } else {
        return false;
      }
    default:
      return false;
  }
};
function $isSelectionInTable(selection, tableNode) {
  if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
    const isAnchorInside = tableNode.isParentOf(selection.anchor.getNode());
    const isFocusInside = tableNode.isParentOf(selection.focus.getNode());
    return isAnchorInside && isFocusInside;
  }
  return false;
}
function selectTableCellNode(tableCell, fromStart) {
  if (fromStart) {
    tableCell.selectStart();
  } else {
    tableCell.selectEnd();
  }
}
function $addHighlightToDOM(editor, cell) {
  const element = cell.elem;
  const node = $getNearestNodeFromDOMNode(element);
  if (!$isTableCellNode(node)) {
    throw Error(`Expected to find LexicalNode from Table Cell DOMNode`);
  }
  const backgroundColor = node.getBackgroundColor();
  if (backgroundColor === null) {
    element.style.setProperty('background-color', `var(--select-button-hover)`, 'important');
  } else {
    element.style.setProperty('background-image', `linear-gradient(to right, var(--select-button-hover), var(--select-button-hover)`);
  }
  element.style.setProperty('caret-color', 'transparent');
}
function $removeHighlightFromDOM(editor, cell) {
  const element = cell.elem;
  const node = $getNearestNodeFromDOMNode(element);
  if (!$isTableCellNode(node)) {
    throw Error(`Expected to find LexicalNode from Table Cell DOMNode`);
  }
  const backgroundColor = node.getBackgroundColor();
  if (backgroundColor === null) {
    element.style.removeProperty('background-color');
  }
  element.style.removeProperty('background-image');
  element.style.removeProperty('caret-color');
}
function $findCellNode(node) {
  const cellNode = $findMatchingParent(node, $isTableCellNode);
  return $isTableCellNode(cellNode) ? cellNode : null;
}
function $findTableNode(node) {
  const tableNode = $findMatchingParent(node, $isTableNode);
  return $isTableNode(tableNode) ? tableNode : null;
}
function $handleArrowKey(editor, event, direction, tableNode, tableSelection) {
  const selection = $getSelection();
  if (!$isSelectionInTable(selection, tableNode)) {
    return false;
  }
  if ($isRangeSelection(selection) && selection.isCollapsed()) {
    const {
      anchor,
      focus
    } = selection;
    const anchorCellNode = $findMatchingParent(anchor.getNode(), $isTableCellNode);
    const focusCellNode = $findMatchingParent(focus.getNode(), $isTableCellNode);
    if (!$isTableCellNode(anchorCellNode) || !anchorCellNode.is(focusCellNode)) {
      return false;
    }
    const anchorCellTable = $findTableNode(anchorCellNode);
    if (anchorCellTable !== tableNode && anchorCellTable != null) {
      const anchorCellTableElement = editor.getElementByKey(anchorCellTable.getKey());
      if (anchorCellTableElement != null) {
        tableSelection.grid = getTableGrid(anchorCellTableElement);
        return $handleArrowKey(editor, event, direction, anchorCellTable, tableSelection);
      }
    }
    const anchorCellDom = editor.getElementByKey(anchorCellNode.__key);
    const anchorDOM = editor.getElementByKey(anchor.key);
    if (anchorDOM == null || anchorCellDom == null) {
      return false;
    }
    let edgeSelectionRect;
    if (anchor.type === 'element') {
      edgeSelectionRect = anchorDOM.getBoundingClientRect();
    } else {
      const domSelection = window.getSelection();
      if (domSelection === null || domSelection.rangeCount === 0) {
        return false;
      }
      const range = domSelection.getRangeAt(0);
      edgeSelectionRect = range.getBoundingClientRect();
    }
    const edgeChild = Boolean(direction === 'up' || direction === "backward") ? anchorCellNode.getFirstChild() : anchorCellNode.getLastChild();
    if (edgeChild == null) {
      return false;
    }
    const edgeChildDOM = editor.getElementByKey(edgeChild.__key);
    if (edgeChildDOM == null) {
      return false;
    }
    const edgeRect = edgeChildDOM.getBoundingClientRect();
    const isExiting = Boolean(direction === "up" || direction === "down") ? direction === 'up' ? edgeRect.top > edgeSelectionRect.top - edgeSelectionRect.height : edgeSelectionRect.bottom + edgeSelectionRect.height > edgeRect.bottom : direction === "backward" ? edgeRect.left <= edgeSelectionRect.left && selection.isCollapsed() && selection.anchor.offset === 0 && selection.focus.offset === 0 : edgeSelectionRect.right >= edgeRect.right;
    if (isExiting) {
      stopEvent(event);
      const cords = tableNode.getCordsFromCellNode(anchorCellNode, tableSelection.grid);
      if (event.shiftKey) {
        const cell = tableNode.getCellFromCordsOrThrow(cords.x, cords.y, tableSelection.grid);
        tableSelection.setAnchorCellForSelection(cell);
        tableSelection.setFocusCellForSelection(cell, true);
      } else {
        return selectGridNodeInDirection(tableSelection, tableNode, cords.x, cords.y, direction);
      }
      return true;
    }
  } else if (DEPRECATED_$isGridSelection(selection)) {
    const {
      anchor,
      focus
    } = selection;
    const anchorCellNode = $findMatchingParent(anchor.getNode(), $isTableCellNode);
    const focusCellNode = $findMatchingParent(focus.getNode(), $isTableCellNode);
    const [tableNodeFromSelection] = selection.getNodes();
    const tableElement = editor.getElementByKey(tableNodeFromSelection.getKey());
    if (!$isTableCellNode(anchorCellNode) || !$isTableCellNode(focusCellNode) || !$isTableNode(tableNodeFromSelection) || tableElement == null) {
      return false;
    }
    tableSelection.updateTableGridSelection(selection);
    const grid = getTableGrid(tableElement);
    const cordsAnchor = tableNode.getCordsFromCellNode(anchorCellNode, grid);
    const anchorCell = tableNode.getCellFromCordsOrThrow(cordsAnchor.x, cordsAnchor.y, grid);
    tableSelection.setAnchorCellForSelection(anchorCell);
    stopEvent(event);
    if (event.shiftKey) {
      const cords = tableNode.getCordsFromCellNode(focusCellNode, grid);
      return adjustFocusNodeInDirection(tableSelection, tableNodeFromSelection, cords.x, cords.y, direction);
    } else {
      focusCellNode.selectEnd();
    }
    return true;
  }
  return false;
}
function stopEvent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const TableCellHeaderStates = {
  BOTH: 3,
  COLUMN: 2,
  NO_STATUS: 0,
  ROW: 1
};
const MIN_ROW_HEIGHT = 33;
const MIN_COLUMN_WIDTH = 50;
var mouseMoveListener = undefined;
var mouseUpHandler = undefined;

/**
 * Need to set the state of the mouse position. Need to change the right style 
 * value of the column resizer and the bottom style value 
 * of the row resizer
 * @param el 
 * @param tableRect 
 * @param cellRect 
 * @returns 
 */
function onDocumentMouseMove(el) {
  const onMouseMove = function (e) {
    setTimeout(() => {
      const IS_POINTER_EVENT = e instanceof MouseEvent;
      const x = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
      const y = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
      el.setAttribute('data-mouse-pos', JSON.stringify({
        x,
        y
      }));
      const start = el.getAttribute('data-mouse-start');
      if (!!!start) return;
      try {
        const jsonStart = JSON.parse(String(start));
        if (isNaN(jsonStart.x) || isNaN(jsonStart.y)) return;
        if (el.classList.contains('row-resize')) {
          el.style.bottom = `${jsonStart.y - y}px`;
        } else if (el.classList.contains('col-resize')) {
          el.style.right = `${jsonStart.x - x}px`;
        }
      } catch (error) {
        console.error(error);
      }
    }, 0);
  };
  return onMouseMove;
}
function onDocumentMouseUp(thisEl) {
  const func = function (e) {
    const IS_POINTER_EVENT = e instanceof MouseEvent;
    if (!!!thisEl.classList.contains('resizing')) return;
    if (!!!mouseMoveListener) return;
    document.removeEventListener(isTouchDevice() ? 'touchmove' : 'mousemove', mouseMoveListener);
    if (mouseUpHandler) document.removeEventListener(isTouchDevice() ? 'touchend' : 'mouseup', mouseUpHandler);
    mouseMoveListener = undefined;
    thisEl.classList.remove('resizing');
    const tableEl = thisEl.parentElement?.parentElement?.parentElement;
    if (tableEl) tableEl.classList.remove('resizing');
    e.stopPropagation();
    e.preventDefault();
    if (thisEl.hasAttribute('data-mouse-start')) {
      const mouseStart = thisEl.getAttribute('data-mouse-start');
      thisEl.removeAttribute('data-mouse-start');
      thisEl.removeAttribute('data-mouse-pos');
      const tdOrTh = thisEl.parentElement;
      const cell = getCellFromTarget(tdOrTh);
      if (thisEl.classList.contains('row-resize')) {
        thisEl.style.left = '0px';
        thisEl.style.width = '100%';
        thisEl.style.bottom = '0px';
        tdOrTh.style.setProperty('overflow', 'auto', 'important');
        try {
          const editor = getCurrentEditor();
          const mouseStartY = JSON.parse(String(mouseStart)).y;
          const heightBefore = tdOrTh.getBoundingClientRect().height;
          const mouseCurrent = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
          const change = mouseCurrent - mouseStartY;
          if (editor && editor.isEditable() && cell) {
            editor.update(() => {
              const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
              if (!tableCellNode) {
                console.error('TableCellResizer: Table cell node not found.');
                return;
              }
              const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
              if (!!!tableNode) {
                console.error('TableCellResizer: Table Node not found.');
                return;
              }
              const tableElement = editor.getElementByKey(tableNode.getKey());
              if (!tableElement) {
                console.error('TableCellResizer: Table element not found.');
                return;
              }
              tableElement.style.setProperty('overflow', 'auto', 'important');
              tableElement.classList.remove('resizing');
              const tableRowNode = $getTableRowNodeFromTableCellNodeOrThrow(tableCellNode);
              if (tableRowNode) {
                tableRowNode.setHeight(Math.max(heightBefore + change, MIN_ROW_HEIGHT));
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      } else if (thisEl.classList.contains('col-resize')) {
        thisEl.style.height = '100%';
        thisEl.style.top = '0px';
        thisEl.style.right = '0px';
        tdOrTh.style.setProperty('overflow', 'auto', 'important');
        try {
          const editor = getCurrentEditor();
          const mouseStartX = JSON.parse(String(mouseStart)).x;
          const widthBefore = tdOrTh.getBoundingClientRect().width;
          const mouseCurrent = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
          const change = mouseCurrent - mouseStartX;
          if (editor && editor.isEditable() && cell) {
            editor.update(() => {
              const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
              if (!$isTableCellNode(tableCellNode)) {
                console.error('TableCellResizer: Table cell node not found.');
                return;
              }
              const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
              const tableElement = editor.getElementByKey(tableNode.getKey());
              if (tableElement) {
                tableElement.style.setProperty('overflow', 'auto', 'important');
                tableElement.classList.remove('resizing');
              }
              const tableColumnIndex = $getTableColumnIndexFromTableCellNode(tableCellNode);
              const tableRows = tableNode.getChildren();
              for (let r = 0; r < tableRows.length; r++) {
                const tableRow = tableRows[r];
                if (!$isTableRowNode(tableRow)) {
                  console.error('Expected table row');
                  return;
                }
                const rowCells = tableRow.getChildren();
                const rowCellsSpan = rowCells.map(cell => cell.getColSpan());
                const aggregatedRowSpans = rowCellsSpan.reduce((rowSpans, cellSpan) => {
                  const previousCell = rowSpans[rowSpans.length - 1] ?? 0;
                  rowSpans.push(previousCell + cellSpan);
                  return rowSpans;
                }, []);
                const rowColumnIndexWithSpan = aggregatedRowSpans.findIndex(cellSpan => cellSpan > tableColumnIndex);
                if (rowColumnIndexWithSpan >= rowCells.length || rowColumnIndexWithSpan < 0) {
                  console.error('Expected table cell to be inside of table row.');
                  return;
                }
                const tableCell = rowCells[rowColumnIndexWithSpan];
                if (!$isTableCellNode(tableCell)) {
                  console.error('Expected table cell');
                  return;
                }
                tableCell.setWidth(Math.max(widthBefore + change, MIN_COLUMN_WIDTH));
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  };
  return func;
}
function handleMouseDown(e) {
  if (mouseMoveListener) return;
  e.stopPropagation();
  e.preventDefault();
  const tdOrTh = this.parentElement;
  const tableHTMLElement = tdOrTh.parentElement.parentElement;
  if (tableHTMLElement && tableHTMLElement?.classList.contains('selecting')) return;
  if (this.getAttribute('tabindex') === '-1') return;
  if (tdOrTh) {
    const cell = getCellFromTarget(tdOrTh);
    if (cell) {
      const editor = getCurrentEditor();
      if (editor && editor.isEditable()) {
        editor.update(() => {
          const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
          if (!tableCellNode) {
            console.error('TableCellResizer: Table cell node not found.');
            return;
          }
          const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
          const tableElement = editor.getElementByKey(tableNode.getKey());
          if (!tableElement) {
            console.error('TableCellResizer: Table element not found.');
            return;
          }
          const tableRect = tableElement.getBoundingClientRect();
          const cellRect = cell.elem.getBoundingClientRect();
          if (this.classList.contains('row-resize')) {
            this.classList.add('resizing');
            this.style.left = `${tableRect.left - cellRect.left}px`;
            this.style.width = `${tableRect.width}px`;
            tdOrTh.style.setProperty('overflow', 'visible', 'important');
            tableElement.style.setProperty('overflow', 'visible', 'important');
            tableElement.classList.add('resizing');
          } else if (this.classList.contains('col-resize')) {
            this.classList.add('resizing');
            this.style.height = `${tableRect.height}px`;
            this.style.top = `${tableRect.top - cellRect.top}px`;
            tdOrTh.style.setProperty('overflow', 'visible', 'important');
            tableElement.style.setProperty('overflow', 'visible', 'important');
            tableElement.classList.add('resizing');
          }
          const IS_POINTER_EVENT = e instanceof MouseEvent;
          const x = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
          const y = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
          this.setAttribute('data-mouse-start', JSON.stringify({
            x,
            y
          }));
          this.setAttribute('data-mouse-pos', JSON.stringify({
            x,
            y
          }));
          const listener = onDocumentMouseMove(this);
          mouseMoveListener = listener;
          const mouseUpHandlerNew = onDocumentMouseUp(this);
          mouseUpHandler = mouseUpHandlerNew;
          if (!!!isTouchDevice()) {
            document.addEventListener('mousemove', listener);
            document.addEventListener('mouseup', mouseUpHandlerNew);
          } else {
            document.addEventListener('touchmove', listener);
            document.addEventListener('touchend', mouseUpHandlerNew);
          }
        });
      }
    }
  }
}
const CURRENT_VERSION = 1;

/** @noInheritDoc */
class TableCellNode extends DEPRECATED_GridCellNode {
  /** @internal */

  /** @internal */

  /** @internal */

  __active = false;
  __canResize = true;
  __version = CURRENT_VERSION;
  static getType() {
    return 'tablecell';
  }
  static clone(node) {
    const cellNode = new TableCellNode(node.__headerState, node.__colSpan, node.__width, node.__key);
    cellNode.__rowSpan = node.__rowSpan;
    cellNode.__backgroundColor = node.__backgroundColor;
    cellNode.__border = node.__border;
    cellNode.__verticalAlign = node.__verticalAlign;
    if (!!!cellNode.__width) {
      cellNode.__width = MIN_COLUMN_WIDTH;
    }
    return cellNode;
  }
  static importDOM() {
    return {
      td: node => ({
        conversion: convertTableCellNodeElement,
        priority: 0
      }),
      th: node => ({
        conversion: convertTableCellNodeElement,
        priority: 0
      })
    };
  }
  static importJSON(serializedNode) {
    const colSpan = serializedNode.colSpan || 1;
    const rowSpan = serializedNode.rowSpan || 1;
    const cellNode = $createTableCellNode(serializedNode.headerState, colSpan, serializedNode.width || undefined);
    cellNode.__rowSpan = rowSpan;
    cellNode.__backgroundColor = serializedNode.backgroundColor || null;
    if (serializedNode.border) cellNode.__border = serializedNode.border;
    if (serializedNode.verticalAlign) cellNode.__verticalAlign = serializedNode.verticalAlign;
    return cellNode;
  }
  constructor(headerState = TableCellHeaderStates.NO_STATUS, colSpan = 1, width, key) {
    super(colSpan, key);
    this.__headerState = headerState;
    this.__width = width;
    this.__backgroundColor = null;
    this.__verticalAlign = 'middle';
  }
  createDOM(config) {
    const element = document.createElement(this.getTag());
    if (this.__width) {
      element.style.width = `${this.__width}px`;
    }
    if (this.__colSpan > 1) {
      element.colSpan = this.__colSpan;
      element.setAttribute('colspan', this.__colSpan.toString());
    }
    if (this.__rowSpan > 1) {
      element.rowSpan = this.__rowSpan;
      element.setAttribute('rowspan', this.__rowSpan.toString());
    }
    if (this.getTag() === 'th') {
      switch (this.__headerState) {
        case 2:
          element.scope = 'row';
          element.setAttribute('scope', 'row');
          break;
        case 3:
          element.scope = 'col';
          element.setAttribute('scope', 'col');
          break;
        case 0:
          break;
        case 1:
          element.scope = 'col';
          element.setAttribute('scope', 'col');
          break;
      }
    }
    if (this.__backgroundColor !== null) {
      element.style.backgroundColor = this.__backgroundColor;
    }
    if (this.__border !== undefined) {
      element.style.border = this.__border;
    }
    if (this.__verticalAlign !== undefined) {
      element.style.verticalAlign = this.__verticalAlign;
    }
    if (this.getActive()) {
      const b = document.createElement('button');
      b.setAttribute('tabindex', '1');
      b.setAttribute('type', 'button');
      b.setAttribute('data-table-cell-action', 'true');
      b.setAttribute('id', 'table-action-menu-launch');
      b.className = "table-cell-action-button";
      b.insertAdjacentHTML('afterbegin', '<svg style="width:12px;height:12px;" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowDown"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
      element.append(b);
    }
    if (this.getCanResize()) {
      const columnResize = document.createElement('div');
      columnResize.className = "col-resize";
      const rowResize = document.createElement('div');
      rowResize.className = "row-resize";
      if (!!!isTouchDevice()) {
        columnResize.addEventListener('mousedown', handleMouseDown);
        rowResize.addEventListener('mousedown', handleMouseDown);
      } else {
        columnResize.addEventListener('touchstart', handleMouseDown);
        rowResize.addEventListener('touchstart', handleMouseDown);
      }
      element.append(columnResize);
      element.append(rowResize);
    }
    addClassNamesToElement(element, config.theme.tableCell, this.hasHeader() && config.theme.tableCellHeader);
    element.setAttribute("data-v", String(CURRENT_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  exportDOM(editor) {
    const {
      element
    } = super.exportDOM(editor);
    if (element) {
      if (isHTMLElement$1(element)) {
        element.setAttribute("data-v", String(CURRENT_VERSION));
        switch (this.__headerState) {
          case 2:
            element.setAttribute('data-scope', 'row');
            break;
          case 3:
            element.setAttribute('data-scope', 'col');
            break;
          case 0:
            break;
          case 1:
            element.setAttribute('data-scope', 'col');
            break;
        }
      }
      const element_ = element;
      const maxWidth = 800;
      const colCount = this.getParentOrThrow().getChildrenSize();
      if (this.__colSpan > 1) {
        element_.colSpan = this.__colSpan;
      }
      if (this.__rowSpan > 1) {
        element_.rowSpan = this.__rowSpan;
      }
      element_.style.width = `${this.getWidth() || Math.max(75, maxWidth / colCount)}px`;
      const verticalAlign = this.getVerticalAlign();
      const border = this.getBorder();
      if (verticalAlign) element_.style.verticalAlign = verticalAlign;
      if (border) element_.style.border = border;
      element_.style.textAlign = 'start';
      const backgroundColor = this.getBackgroundColor();
      if (backgroundColor !== null) {
        element_.style.setProperty('background-color', backgroundColor, 'important');
      } else {
        element_.style.setProperty('background-color', null);
      }
    }
    return {
      element
    };
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      backgroundColor: this.getBackgroundColor(),
      headerState: this.__headerState,
      type: 'tablecell',
      width: this.getWidth(),
      verticalAlign: this.getVerticalAlign(),
      border: this.getBorder(),
      version: CURRENT_VERSION
    };
  }
  getTag() {
    return this.hasHeader() ? 'th' : 'td';
  }
  setHeaderStyles(headerState) {
    const self = this.getWritable();
    self.__headerState = headerState;
    return this.__headerState;
  }
  getHeaderStyles() {
    return this.getLatest().__headerState;
  }
  setWidth(width) {
    const self = this.getWritable();
    self.__width = width;
    return this.__width;
  }
  getWidth() {
    return this.getLatest().__width;
  }
  getBackgroundColor() {
    return this.getLatest().__backgroundColor;
  }
  setBackgroundColor(newBackgroundColor) {
    this.getWritable().__backgroundColor = newBackgroundColor;
  }
  getVerticalAlign() {
    return this.getLatest().__verticalAlign;
  }
  setVerticalAlign(verticalAlign) {
    this.getWritable().__verticalAlign = verticalAlign;
  }
  getBorder() {
    return this.getLatest().__border;
  }
  setBorder(newBorder) {
    this.getWritable().__border = newBorder;
  }
  setCustomStyles({
    border,
    verticalAlign,
    backgroundColor
  }) {
    const self = this.getWritable();
    self.__border = border;
    self.__verticalAlign = verticalAlign;
    self.__backgroundColor = backgroundColor;
  }
  toggleHeaderStyle(headerStateToToggle) {
    const self = this.getWritable();
    if ((self.__headerState & headerStateToToggle) === headerStateToToggle) {
      self.__headerState -= headerStateToToggle;
    } else {
      self.__headerState += headerStateToToggle;
    }
    return self;
  }
  hasHeaderState(headerState) {
    return (this.getHeaderStyles() & headerState) === headerState;
  }
  hasHeader() {
    return this.getLatest().__headerState !== TableCellHeaderStates.NO_STATUS;
  }
  updateDOM(prevNode) {
    return prevNode.__headerState !== this.__headerState || prevNode.__width !== this.__width || prevNode.__colSpan !== this.__colSpan || prevNode.__rowSpan !== this.__rowSpan || prevNode.__backgroundColor !== this.__backgroundColor || prevNode.__canResize !== this.__canResize || prevNode.__active !== this.__active || prevNode.__verticalAlign !== this.__verticalAlign || prevNode.__border !== this.__border;
  }
  isShadowRoot() {
    return true;
  }
  collapseAtStart() {
    return true;
  }
  canBeEmpty() {
    return false;
  }
  canIndent() {
    return false;
  }
  getActive() {
    const self = this.getLatest();
    return self.__active;
  }
  setActive(bool) {
    const self = this.getWritable();
    self.__active = bool;
    return self;
  }
  getScope() {
    switch (this.getLatest().__headerState) {
      case 2:
        return 'row';
      case 3:
        return 'col';
      case 0:
        return undefined;
      case 1:
        return 'col';
      default:
        return undefined;
    }
  }
  getCanResize() {
    const self = this.getLatest();
    return self.__canResize;
  }
  setCanResize(b) {
    const self = this.getWritable();
    self.__canResize = b;
    return self;
  }
}
function convertTableCellNodeElement(domNode) {
  const domNode_ = domNode;
  const nodeName = domNode.nodeName.toLowerCase();
  let width = undefined;
  if (PIXEL_VALUE_REG_EXP.test(domNode_.style.width)) {
    width = parseFloat(domNode_.style.width);
  }
  var tableCellNode;
  if (nodeName === 'th') {
    if (domNode instanceof HTMLElement) {
      switch (domNode.getAttribute('data-scope')) {
        case 'row':
          tableCellNode = $createTableCellNode(TableCellHeaderStates.COLUMN, domNode_.colSpan, width);
          break;
        case 'col':
          tableCellNode = $createTableCellNode(TableCellHeaderStates.ROW, domNode_.colSpan, width);
          break;
        case null:
          tableCellNode = $createTableCellNode(TableCellHeaderStates.ROW, domNode_.colSpan, width);
          break;
        case '':
          tableCellNode = $createTableCellNode(TableCellHeaderStates.ROW, domNode_.colSpan, width);
          break;
        default:
          tableCellNode = $createTableCellNode(TableCellHeaderStates.ROW, domNode_.colSpan, width);
          break;
      }
    } else {
      tableCellNode = $createTableCellNode(TableCellHeaderStates.ROW, domNode_.colSpan, width);
    }
  } else {
    tableCellNode = $createTableCellNode(TableCellHeaderStates.NO_STATUS, domNode_.colSpan, width);
  }
  tableCellNode.__rowSpan = domNode_.rowSpan;
  const backgroundColor = domNode_.style.backgroundColor;
  if (backgroundColor !== '') {
    tableCellNode.__backgroundColor = backgroundColor;
  }
  const verticalAlign = domNode_.style.verticalAlign;
  const border = domNode_.style.border;
  if (verticalAlign && (verticalAlign === 'top' || verticalAlign === 'middle' || verticalAlign === 'bottom')) tableCellNode.__verticalAlign = verticalAlign;
  if (border) tableCellNode.__border = border;
  return {
    forChild: (lexicalNode, parentLexicalNode) => {
      if ($isTableCellNode(parentLexicalNode) && !$isElementNode(lexicalNode)) {
        const paragraphNode = $createCellParagraphNode();
        if ($isLineBreakNode(lexicalNode) && lexicalNode.getTextContent() === '\n') {
          return null;
        }
        paragraphNode.append(lexicalNode);
        return paragraphNode;
      }
      return lexicalNode;
    },
    node: tableCellNode
  };
}
function $createTableCellNode(headerState, colSpan = 1, width) {
  return $applyNodeReplacement(new TableCellNode(headerState, colSpan, width));
}
function $isTableCellNode(node) {
  return node instanceof TableCellNode;
}

function computeSelectionCount(selection) {
  const selectionShape = selection.getShape();
  return {
    columns: selectionShape.toX - selectionShape.fromX + 1,
    rows: selectionShape.toY - selectionShape.fromY + 1
  };
}
// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
function isGridSelectionRectangular(selection) {
  const nodes = selection.getNodes();
  const currentRows = [];
  let currentRow = null;
  let expectedColumns = null;
  let currentColumns = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if ($isTableCellNode(node)) {
      const row = node.getParentOrThrow();
      if (!$isTableRowNode(row)) {
        throw Error(`Expected CellNode to have a RowNode parent`);
      }
      if (currentRow !== row) {
        if (expectedColumns !== null && currentColumns !== expectedColumns) {
          return false;
        }
        if (currentRow !== null) {
          expectedColumns = currentColumns;
        }
        currentRow = row;
        currentColumns = 0;
      }
      const colSpan = node.__colSpan;
      for (let j = 0; j < colSpan; j++) {
        if (currentRows[currentColumns + j] === undefined) {
          currentRows[currentColumns + j] = 0;
        }
        currentRows[currentColumns + j] += node.__rowSpan;
      }
      currentColumns += colSpan;
    }
  }
  return (expectedColumns === null || currentColumns === expectedColumns) && currentRows.every(v => v === currentRows[0]);
}
function $canUnmerge() {
  const selection = $getSelection();
  if ($isRangeSelection(selection) && !selection.isCollapsed() || DEPRECATED_$isGridSelection(selection) && !selection.anchor.is(selection.focus) || !$isRangeSelection(selection) && !DEPRECATED_$isGridSelection(selection)) {
    return false;
  }
  const [cell] = DEPRECATED_$getNodeTriplet(selection.anchor);
  return cell.__colSpan > 1 || cell.__rowSpan > 1;
}
function $cellContainsEmptyParagraph(cell) {
  if (cell.getChildrenSize() !== 1) {
    return false;
  }
  const firstChild = cell.getFirstChildOrThrow();
  if (!$isCellParagraphNode(firstChild) || !firstChild.isEmpty()) {
    return false;
  }
  return true;
}
function $selectLastDescendant(node) {
  const lastDescendant = node.getLastDescendant();
  if ($isTextNode(lastDescendant)) {
    lastDescendant.select();
  } else if ($isElementNode(lastDescendant)) {
    lastDescendant.selectEnd();
  } else if (lastDescendant !== null) {
    lastDescendant.selectNext();
  }
}
function currentCellBackgroundColor(editor) {
  return editor.getEditorState().read(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
      const [cell] = DEPRECATED_$getNodeTriplet(selection.anchor);
      if ($isTableCellNode(cell)) {
        return cell.getBackgroundColor();
      }
    }
    return null;
  });
}

/** @module @lexical/table */
const INSERT_TABLE_COMMAND = createCommand('INSERT_TABLE_COMMAND');
const INSERT_TABLE_COMMAND_WITH_DATA = createCommand('INSERT_TABLE_COMMAND_WITH_DATA');

export { $canUnmerge, $cellContainsEmptyParagraph, $createCellParagraphNode, $createTableCellNode, $createTableNode, $createTableNodeWithDimensions, $createTableRowNode, $deleteTableColumn, $deleteTableColumn__EXPERIMENTAL, $deleteTableRow__EXPERIMENTAL, $getColumnHeaderCellsInRange, $getElementGridForTableNode, $getRowHeaderCellsInRange, $getTableCellNodeFromLexicalNode, $getTableColumnIndexFromTableCellNode, $getTableNodeFromLexicalNodeOrThrow, $getTableRowIndexFromTableCellNode, $getTableRowNodeFromTableCellNodeOrThrow, $insertTableColumn, $insertTableColumn__EXPERIMENTAL, $insertTableRow, $insertTableRow__EXPERIMENTAL, $isCellParagraphNode, $isTableCellNode, $isTableNode, $isTableRowNode, $removeHighlightStyleToTable, $removeTableRowAtIndex, $selectLastDescendant, $unmergeCell, CellParagraphNode, INSERT_TABLE_COMMAND, INSERT_TABLE_COMMAND_WITH_DATA, TableCellHeaderStates, TableCellNode, TableNode, TableRowNode, TableSelection, applyTableHandlers, computeSelectionCount, currentCellBackgroundColor, getCellFromTarget, getTableSelectionFromTableElement, isGridSelectionRectangular, registerTableEditable, registerTableNotEditableListener };
