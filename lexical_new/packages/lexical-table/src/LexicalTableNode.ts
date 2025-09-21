/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {TableCellNode} from './LexicalTableCellNode';
import type {Cell, Grid} from './LexicalTableSelection';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread
} from 'lexical';

import {addClassNamesToElement, isHTMLElement} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $getNearestNodeFromDOMNode,
  DEPRECATED_GridNode,
} from 'lexical';

import {$isTableCellNode} from './LexicalTableCellNode';
import {$isTableRowNode, TableRowNode} from './LexicalTableRowNode';
import {getTableGrid} from './LexicalTableSelectionHelpers';
import { $createTableWrapperNode } from '../../lexical/src/TableWrapperNode';
import { IS_REAL_BROWSER, isHTMLElementCustom } from '@lexical/shared';

export type SerializedTableNode = Spread<
  SerializedElementNode,
{
  caption: string|undefined,
  bandedRows: boolean,
  bandedCols: boolean,
  align: 'center'|'left'|'right';
  first_element: boolean;
}>;

const ALIGN_LEFT_TEXT = "10px auto 10px 0px";
const ALIGN_CENTER_TEXT = "10px auto";
const ALIGN_RIGHT_TEXT = "10px 0px 10px auto";

const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class TableNode extends DEPRECATED_GridNode {
  /** @internal */
  __grid?: Grid;
  __caption?: string;
  __bandedRows: boolean;
  __bandedCols: boolean;
  __align: 'center'|'left'|'right';
  __version: number = CURRENT_VERSION;

  static getType(): string {
    return 'table';
  }

  static clone(node: TableNode): TableNode {
    return new TableNode(
      {
        caption: node.getCaption(),
        bandedRows: node.getBandedRows(),
        bandedCols: node.getBandedCols() ,
        align: node.getAlign() 
      }, 
      node.__key
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      table: (_node: Node) => ({
        conversion: convertTableElement,
        priority: 1,
      }),
    };
  }

  static importJSON(_serializedNode: SerializedTableNode): TableNode {
    const node = $createTableNode({ 
      caption: _serializedNode.caption,
      bandedRows: _serializedNode.bandedRows,
      bandedCols: _serializedNode.bandedCols,
      align: _serializedNode.align
    });
    node.setFirstElement(_serializedNode?.first_element);
    return node;
  }

  constructor(obj?:{
    caption: string|undefined, 
    bandedRows: boolean, 
    bandedCols: boolean,
    align: 'left'|'center'|'right'
  }, key?: NodeKey) {
    super(key);
    this.__caption = obj?.caption;
    this.__bandedRows = obj?.bandedRows || false;
    this.__bandedCols = obj?.bandedCols || false;
    this.__align = obj?.align || 'center';
  }

  exportJSON(): SerializedTableNode {
    return {
      ...super.exportJSON(),
      type: 'table',
      version: CURRENT_VERSION,
      caption: this.getCaption(),
      bandedCols: this.getBandedCols(),
      bandedRows: this.getBandedRows(),
      align: this.getAlign(),
      first_element: this.getFirstElement()
    };
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const tableElement = document.createElement('table');
    tableElement.setAttribute('cellspacing','0');
    addClassNamesToElement(tableElement, config.theme.table);
    if (this.__caption) {
      const caption = document.createElement('caption');
      if (editor?.isEditable()) caption.setAttribute('contenteditable','false');
      caption.className="h5 bold";
      caption.innerText = this.__caption;
      tableElement.append(caption);
      tableElement.setAttribute('data-caption',this.__caption);
    }
    if (this.__bandedRows) tableElement.classList.add('banded-row');
    if (this.__bandedCols) tableElement.classList.add('banded-col');
    if(this.__align==='left') {
      tableElement.style.setProperty('margin',ALIGN_LEFT_TEXT,'important');
    } else if (this.__align==='center') {
      tableElement.style.setProperty('margin',ALIGN_CENTER_TEXT,'important');
    } else if (this.__align==='right') {
      tableElement.style.setProperty('margin',ALIGN_RIGHT_TEXT,'important');
    }
    tableElement.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) tableElement.classList.add('first-rte-element');
    if (this.getLastElement()) tableElement.classList.add('last-rte-element');
    return tableElement;
  }

  updateDOM(
    prevNode: TableNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    return (  
      prevNode.__bandedCols!==this.__bandedCols ||
      prevNode.__bandedRows!==this.__bandedRows ||
      prevNode.__caption!==this.__caption || 
      prevNode.__align!==this.__align
    );
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const caption = this.getCaption();
    const bandedCols = this.getBandedCols();
    const bandedRows = this.getBandedRows();
    const align = this.getAlign();

    return {
      ...super.exportDOM(editor),
      after: (tableElement) => {
        if (tableElement) {
          const newElement = tableElement.cloneNode() as ParentNode;
          if (isHTMLElement(tableElement)) {
            if (this.getFirstElement()&&!!!IS_REAL_BROWSER) tableElement.classList.add('first-rte-element');
            if (this.getLastElement()&&!!!IS_REAL_BROWSER) tableElement.classList.add('last-rte-element');
            if(caption)tableElement.setAttribute('data-caption',caption);
            if(bandedCols)tableElement.classList.add('banded-col');
            if(bandedRows)tableElement.classList.add('banded-row');
            if(align==='left') {
              tableElement.style.setProperty('margin',ALIGN_LEFT_TEXT,'important');
            } else if (align==='center') {
              tableElement.style.setProperty('margin',ALIGN_CENTER_TEXT,'important');
            } else if (align==='right') {
              tableElement.style.setProperty('margin',ALIGN_RIGHT_TEXT,'important');
            }
            tableElement.setAttribute("data-v",String(CURRENT_VERSION));
          }
          const colGroup = document.createElement('colgroup');
          const tBody = document.createElement('tbody');
          if (isHTMLElement(tableElement)) {
            tBody.append(...tableElement.children);
          }
          const firstRow = this.getFirstChildOrThrow<TableRowNode>();

          if (!$isTableRowNode(firstRow)) {
            throw new Error('Expected to find row node.');
          }

          const colCount = firstRow.getChildrenSize();

          for (let i = 0; i < colCount; i++) {
            const col = document.createElement('col');
            colGroup.append(col);
          }

          newElement.replaceChildren(colGroup, tBody);

          return newElement as HTMLElement;
        }
      },
    };
  }

  // TODO 0.10 deprecate
  canExtractContents(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }

  getCordsFromCellNode(
    tableCellNode: TableCellNode,
    grid: Grid,
  ): {x: number; y: number} {
    const {rows, cells} = grid;

    for (let y = 0; y < rows; y++) {
      const row = cells[y];

      if (row == null) {
        continue;
      }

      const x = row.findIndex((cell) => {
        if (!cell) return;
        const {elem} = cell;
        const cellNode = $getNearestNodeFromDOMNode(elem);
        return cellNode === tableCellNode;
      });

      if (x !== -1) {
        return {x, y};
      }
    }

    throw new Error('Cell not found in table.');
  }

  getCellFromCords(x: number, y: number, grid: Grid): Cell | null {
    const {cells} = grid;

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

  getCellFromCordsOrThrow(x: number, y: number, grid: Grid): Cell {
    const cell = this.getCellFromCords(x, y, grid);

    if (!cell) {
      throw new Error('Cell not found at cords.');
    }

    return cell;
  }

  getCellNodeFromCords(x: number, y: number, grid: Grid): TableCellNode | null {
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

  getCellNodeFromCordsOrThrow(x: number, y: number, grid: Grid): TableCellNode {
    const node = this.getCellNodeFromCords(x, y, grid);

    if (!node) {
      throw new Error('Node at cords not TableCellNode.');
    }

    return node;
  }

  canSelectBefore(): true {
    return true;
  }

  canIndent(): false {
    return false;
  }

  getCaption() {
    const self = this.getLatest();
    return self.__caption;
  }
  setCaption(s: string|undefined) {
    const self = this.getWritable();
    self.__caption = s;
    return self;
  }
  getBandedRows() {
    const self = this.getLatest();
    return self.__bandedRows;
  }
  setBandedRows(b: boolean) {
    const self = this.getWritable();
    self.__bandedRows = b;
    return self;
  }
  getBandedCols() {
    const self = this.getLatest();
    return self.__bandedCols;
  }
  setBandedCols(b: boolean) {
    const self = this.getWritable();
    self.__bandedCols = b;
    return self;
  }
  getAlign() {
    const self = this.getLatest();
    return self.__align;
  }
  setAlign(input: 'left'|'center'|'right') {
    const self = this.getWritable();
    self.__align = input;
    return self;
  }
}

export function $getElementGridForTableNode(
  editor: LexicalEditor,
  tableNode: TableNode,
): Grid {
  const tableElement = editor.getElementByKey(tableNode.getKey());

  if (tableElement == null) {
    throw new Error('Table Element Not Found');
  }

  return getTableGrid(tableElement);
}

export function convertTableElement(_domNode: Node): DOMConversionOutput {
  if (isHTMLElementCustom(_domNode)) {
    const first_element = _domNode.classList.contains('first-rte-element');
    const last_element = _domNode.classList.contains('last-rte-element');
    const caption = _domNode.getAttribute('data-caption');
    const bandedRows = _domNode.classList.contains('banded-row');
    const bandedCols = _domNode.classList.contains('banded-col');
    const alignText = _domNode.style.getPropertyValue('margin');
    var align:'left'|'center'|'right'|undefined;
    if (alignText===ALIGN_LEFT_TEXT) align = "left";
    else if (alignText===ALIGN_CENTER_TEXT) align = "center";
    else if (alignText===ALIGN_RIGHT_TEXT) align = "right";
    const node =$createTableNode({ 
      caption: caption ? caption : undefined,
      bandedCols,
      bandedRows,
      align: align ? align : 'center'
    });
    node.setFirstElement(first_element); 
    node.setLastElement(last_element);
    return {node};
  } else {
    return {node: $createTableNode()};
  }
}

export function $createTableNode(obj?:{
  caption: string|undefined,
  bandedRows: boolean,
  bandedCols: boolean,
  align: 'left'|'center'|'right'
}): TableNode {
  const tableNode = $applyNodeReplacement(new TableNode(obj));
  return tableNode as TableNode;
}

export function $isTableNode(
  node: LexicalNode | null | undefined,
): node is TableNode {
  return node instanceof TableNode;
}
