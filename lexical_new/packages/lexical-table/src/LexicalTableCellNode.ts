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
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedGridCellNode,
  Spread,
} from 'lexical';

import {addClassNamesToElement, isHTMLElement} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $getNearestNodeFromDOMNode,
  $isElementNode,
  $isLineBreakNode,
  DEPRECATED_GridCellNode,
} from 'lexical';
import { getCellFromTarget } from './LexicalTableSelectionHelpers';
import { getCurrentEditor, isTouchDevice } from '@lexical/shared';


import { $createCellParagraphNode } from './CellParagraphNode';

import {PIXEL_VALUE_REG_EXP} from './constants';
import { $getTableColumnIndexFromTableCellNode, $getTableNodeFromLexicalNodeOrThrow, $getTableRowNodeFromTableCellNodeOrThrow } from './LexicalTableUtils';
import { $isTableRowNode } from './LexicalTableRowNode';

export const TableCellHeaderStates = {
  BOTH: 3,
  COLUMN: 2,
  NO_STATUS: 0,
  ROW: 1,
};

export type TableCellHeaderState =
  typeof TableCellHeaderStates[keyof typeof TableCellHeaderStates];

export type SerializedTableCellNode = Spread<
  {
    headerState: TableCellHeaderState;
    width?: number;
    backgroundColor?: null | string;
    verticalAlign?: 'top'|'middle'|'bottom';
    border?: string
  },
  SerializedGridCellNode
>;

const MIN_ROW_HEIGHT = 33;
const MIN_COLUMN_WIDTH = 50;

var mouseMoveListener:undefined|((e: (MouseEvent|TouchEvent)) => void) = undefined;
var mouseUpHandler:undefined|((e:  (MouseEvent|TouchEvent)) => void) = undefined;

/**
 * Need to set the state of the mouse position. Need to change the right style 
 * value of the column resizer and the bottom style value 
 * of the row resizer
 * @param el 
 * @param tableRect 
 * @param cellRect 
 * @returns 
 */
function onDocumentMouseMove(el: HTMLElement) {
  const onMouseMove = function (e:(MouseEvent|TouchEvent)) {
    setTimeout(() => {
      const IS_POINTER_EVENT = e instanceof MouseEvent;
      const x =  IS_POINTER_EVENT ? e.clientX :  e.touches[0].clientX;
      const y =  IS_POINTER_EVENT ? e.clientY :  e.touches[0].clientY;
      el.setAttribute('data-mouse-pos',JSON.stringify({ x, y }));
      const start = el.getAttribute('data-mouse-start');
      if (!!!start) return;
      try {
        const jsonStart = JSON.parse(String(start)) as { x: number, y: number };
        if (isNaN(jsonStart.x)||isNaN(jsonStart.y)) return;
        if (el.classList.contains('row-resize')) {
          el.style.bottom = `${jsonStart.y-y}px`;
        } else if (el.classList.contains('col-resize')) {
          el.style.right = `${jsonStart.x-x}px`;
        }
      } catch (error) {
        console.error(error);
      }   
    },0)
  }
  return onMouseMove;
}
function onDocumentMouseUp(thisEl:HTMLDivElement) {
  const func = function(e: (MouseEvent|TouchEvent)) {
    const IS_POINTER_EVENT = e instanceof MouseEvent;
    if (!!!thisEl.classList.contains('resizing')) return;
    if (!!!mouseMoveListener) return;
    document.removeEventListener(isTouchDevice()?'touchmove':'mousemove',mouseMoveListener);
    if (mouseUpHandler) document.removeEventListener(isTouchDevice()?'touchend':'mouseup',mouseUpHandler);
    mouseMoveListener = undefined;
    thisEl.classList.remove('resizing');
    const tableEl = thisEl.parentElement?.parentElement?.parentElement as HTMLTableElement;
    if (tableEl) tableEl.classList.remove('resizing');
    e.stopPropagation();
    e.preventDefault();
    if (thisEl.hasAttribute('data-mouse-start')) {
      const mouseStart = thisEl.getAttribute('data-mouse-start');
      thisEl.removeAttribute('data-mouse-start');
      thisEl.removeAttribute('data-mouse-pos');
      const tdOrTh = thisEl.parentElement as HTMLElement;
      const cell = getCellFromTarget(tdOrTh);
      if (thisEl.classList.contains('row-resize')) {
        thisEl.style.left = '0px';
        thisEl.style.width = '100%';
        thisEl.style.bottom = '0px';
        tdOrTh.style.setProperty('overflow','auto','important');
        try {
          const editor = getCurrentEditor();
          const mouseStartY = (JSON.parse(String(mouseStart)) as {x:number,y:number}).y;
          const heightBefore = tdOrTh.getBoundingClientRect().height;
          const mouseCurrent = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
          const change = mouseCurrent-mouseStartY;
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
              tableElement.style.setProperty('overflow','auto','important');
              tableElement.classList.remove('resizing');
              const tableRowNode = $getTableRowNodeFromTableCellNodeOrThrow(tableCellNode);
              if (tableRowNode) {
                tableRowNode.setHeight(Math.max(heightBefore+change,MIN_ROW_HEIGHT));
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
        tdOrTh.style.setProperty('overflow','auto','important');
        try {
          const editor = getCurrentEditor();
          const mouseStartX = (JSON.parse(String(mouseStart)) as {x:number,y:number}).x;
          const widthBefore = tdOrTh.getBoundingClientRect().width;
          const mouseCurrent = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
          const change = mouseCurrent-mouseStartX;
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
                tableElement.style.setProperty('overflow','auto','important');
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
      
                const rowCells = tableRow.getChildren<TableCellNode>();
                const rowCellsSpan = rowCells.map((cell) => cell.getColSpan());
      
                const aggregatedRowSpans = rowCellsSpan.reduce(
                  (rowSpans: number[], cellSpan) => {
                    const previousCell = rowSpans[rowSpans.length - 1] ?? 0;
                    rowSpans.push(previousCell + cellSpan);
                    return rowSpans;
                  },
                  [],
                );
                const rowColumnIndexWithSpan = aggregatedRowSpans.findIndex(
                  (cellSpan: number) => cellSpan > tableColumnIndex,
                );
      
                if (
                  rowColumnIndexWithSpan >= rowCells.length ||
                  rowColumnIndexWithSpan < 0
                ) {
                  console.error('Expected table cell to be inside of table row.');
                  return;
                }
      
                const tableCell = rowCells[rowColumnIndexWithSpan];
      
                if (!$isTableCellNode(tableCell)) {
                  console.error('Expected table cell');
                  return;
                }
                
                tableCell.setWidth(Math.max(widthBefore+change,MIN_COLUMN_WIDTH));
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    } 

  }
  return func;
}

function handleMouseDown(this:HTMLDivElement,e:(MouseEvent|TouchEvent)) {
  if (mouseMoveListener) return;
  e.stopPropagation();
  e.preventDefault();
  const tdOrTh = this.parentElement;
  const tableHTMLElement = ((tdOrTh as HTMLTableCellElement).parentElement as HTMLTableRowElement).parentElement as HTMLTableElement;
  if (tableHTMLElement&&tableHTMLElement?.classList.contains('selecting')) return;
  if(this.getAttribute('tabindex')==='-1')return;
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
            this.style.left = `${tableRect.left-cellRect.left}px`;
            this.style.width = `${tableRect.width}px`;
            tdOrTh.style.setProperty('overflow','visible','important');
            tableElement.style.setProperty('overflow','visible','important');
            tableElement.classList.add('resizing');
          } else if (this.classList.contains('col-resize')) {
            this.classList.add('resizing');
            this.style.height = `${tableRect.height}px`;
            this.style.top = `${tableRect.top-cellRect.top}px`;
            tdOrTh.style.setProperty('overflow','visible','important');
            tableElement.style.setProperty('overflow','visible','important');
            tableElement.classList.add('resizing');
          }
          const IS_POINTER_EVENT = e instanceof MouseEvent;
          const x =  IS_POINTER_EVENT ? e.clientX :  e.touches[0].clientX;
          const y =  IS_POINTER_EVENT ? e.clientY :  e.touches[0].clientY;
          this.setAttribute('data-mouse-start',JSON.stringify({x, y}));
          this.setAttribute('data-mouse-pos',JSON.stringify({x, y}));
          const listener = onDocumentMouseMove(this);
          mouseMoveListener = listener;
          const mouseUpHandlerNew = onDocumentMouseUp(this);
          mouseUpHandler = mouseUpHandlerNew;
          if (!!!isTouchDevice()) {
            document.addEventListener('mousemove',listener);
            document.addEventListener('mouseup',mouseUpHandlerNew);
          } else {
            document.addEventListener('touchmove',listener);
            document.addEventListener('touchend',mouseUpHandlerNew);
          } 
          
        });
      }
    }
  }
}



const CURRENT_VERSION = 1;


/** @noInheritDoc */
export class TableCellNode extends DEPRECATED_GridCellNode {
  /** @internal */
  __headerState: TableCellHeaderState;
  /** @internal */
  __width?: number;
  /** @internal */
  __backgroundColor: null | string;
  __verticalAlign?: 'top'|'middle'|'bottom';
  __border?: string;
  __active: boolean = false;
  __scope?: 'row'|'col';
  __canResize: boolean = true;
  __version: number = CURRENT_VERSION;

  static getType(): string {
    return 'tablecell';
  }

  static clone(node: TableCellNode): TableCellNode {
    const cellNode = new TableCellNode(
      node.__headerState,
      node.__colSpan,
      node.__width,
      node.__key,
    );
    cellNode.__rowSpan = node.__rowSpan;
    cellNode.__backgroundColor = node.__backgroundColor;
    cellNode.__border = node.__border;
    cellNode.__verticalAlign = node.__verticalAlign;
    if (!!!cellNode.__width) {
      cellNode.__width = MIN_COLUMN_WIDTH;
    }
    return cellNode;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      td: (node: Node) => ({
        conversion: convertTableCellNodeElement,
        priority: 0,
      }),
      th: (node: Node) => ({
        conversion: convertTableCellNodeElement,
        priority: 0,
      }),
    };
  }

  static importJSON(serializedNode: SerializedTableCellNode): TableCellNode {
    const colSpan = serializedNode.colSpan || 1;
    const rowSpan = serializedNode.rowSpan || 1;
    const cellNode = $createTableCellNode(
      serializedNode.headerState,
      colSpan,
      serializedNode.width || undefined,
    );
    cellNode.__rowSpan = rowSpan;
    cellNode.__backgroundColor = serializedNode.backgroundColor || null;
    if (serializedNode.border) cellNode.__border = serializedNode.border;
    if (serializedNode.verticalAlign) cellNode.__verticalAlign = serializedNode.verticalAlign;
    return cellNode;
  }

  constructor(
    headerState = TableCellHeaderStates.NO_STATUS,
    colSpan = 1,
    width?: number,
    key?: NodeKey,
  ) {
    super(colSpan, key);
    this.__headerState = headerState;
    this.__width = width;
    this.__backgroundColor = null;
    this.__verticalAlign='middle';
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement(
      this.getTag(),
    ) as HTMLTableCellElement;

    if (this.__width) {
      element.style.width = `${this.__width}px`;
    }
    if (this.__colSpan > 1) {
      element.colSpan = this.__colSpan;
      element.setAttribute('colspan',this.__colSpan.toString());
    }
    if (this.__rowSpan > 1) {
      element.rowSpan = this.__rowSpan;
      element.setAttribute('rowspan',this.__rowSpan.toString());
    }

    if (this.getTag()==='th') {
      switch (this.__headerState) {
        case 2:
          element.scope = 'row';
          element.setAttribute('scope','row');
          break;
        case 3:
          element.scope = 'col';
          element.setAttribute('scope','col');
          break;
        case 0:
          break;
        case 1:
          element.scope = 'col';
          element.setAttribute('scope','col');
          break;
        default:
          break;
      }
    }

    if (this.__backgroundColor !== null) {
      element.style.backgroundColor = this.__backgroundColor;
    }
    if (this.__border!==undefined) {
      element.style.border = this.__border;
    }
    if (this.__verticalAlign!==undefined) {
      element.style.verticalAlign = this.__verticalAlign;
    }
    if (this.getActive()) {
      const b = document.createElement('button');
      b.setAttribute('tabindex','1');
      b.setAttribute('type','button');
      b.setAttribute('data-table-cell-action','true');
      b.setAttribute('id','table-action-menu-launch')
      b.className = "table-cell-action-button";
      b.insertAdjacentHTML('afterbegin','<svg style="width:12px;height:12px;" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowDown"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
      element.append(b);
    }
    if (this.getCanResize()) {
      const columnResize = document.createElement('div');
      columnResize.className = "col-resize";
      const rowResize = document.createElement('div');
      rowResize.className = "row-resize";
      if (!!!isTouchDevice()) {
        columnResize.addEventListener('mousedown',handleMouseDown);
        rowResize.addEventListener('mousedown',handleMouseDown);
      } else  {
        columnResize.addEventListener('touchstart',handleMouseDown);
        rowResize.addEventListener('touchstart',handleMouseDown);
      }
      element.append(columnResize);
      element.append(rowResize);
    }
    addClassNamesToElement(
      element,
      config.theme.tableCell,
      this.hasHeader() && config.theme.tableCellHeader,
    );
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);

    if (element) {
      if (isHTMLElement(element)) {
        element.setAttribute("data-v",String(CURRENT_VERSION));
        switch (this.__headerState) {
          case 2:
            element.setAttribute('data-scope','row');
            break;
          case 3:
            element.setAttribute('data-scope','col');
            break;
          case 0:
            break;
          case 1:
            element.setAttribute('data-scope','col');
            break;
          default:
            break;
        }
        
      }
      
      const element_ = element as HTMLTableCellElement;
      const maxWidth = 800;
      const colCount = this.getParentOrThrow().getChildrenSize();
      if (this.__colSpan > 1) {
        element_.colSpan = this.__colSpan;
      }
      if (this.__rowSpan > 1) {
        element_.rowSpan = this.__rowSpan;
      }
      element_.style.width = `${
        this.getWidth() || Math.max(75, maxWidth / colCount)
      }px`;
      const verticalAlign =  this.getVerticalAlign();
      const border = this.getBorder();

      if (verticalAlign) element_.style.verticalAlign = verticalAlign;
      if (border) element_.style.border = border;
      element_.style.textAlign = 'start';

      const backgroundColor = this.getBackgroundColor();
      if (backgroundColor !== null) {
        element_.style.setProperty('background-color',backgroundColor,'important');
      } else {
        element_.style.setProperty('background-color',null);
      }
    }
    return {
      element,
    };
  }

  exportJSON(): SerializedTableCellNode {
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

  getTag(): string {
    return this.hasHeader() ? 'th' : 'td';
  }

  setHeaderStyles(headerState: TableCellHeaderState): TableCellHeaderState {
    const self = this.getWritable();
    self.__headerState = headerState;
    return this.__headerState;
  }

  getHeaderStyles(): TableCellHeaderState {
    return this.getLatest().__headerState;
  }

  setWidth(width: number): number | null | undefined {
    const self = this.getWritable();
    self.__width = width;
    return this.__width;
  }

  getWidth(): number | undefined {
    return this.getLatest().__width;
  }

  getBackgroundColor(): null | string {
    return this.getLatest().__backgroundColor;
  }

  setBackgroundColor(newBackgroundColor: null | string): void {
    this.getWritable().__backgroundColor = newBackgroundColor;
  }

  getVerticalAlign() {
    return this.getLatest().__verticalAlign;
  }

  setVerticalAlign(verticalAlign:'top'|'middle'|'bottom'|undefined) {
    this.getWritable().__verticalAlign = verticalAlign;
  }

  getBorder() {
    return this.getLatest().__border;
  }

  setBorder(newBorder:string|undefined) { 
    this.getWritable().__border = newBorder;
  }

  setCustomStyles({ border, verticalAlign, backgroundColor }:{ border?:string,verticalAlign?:'top'|'middle'|'bottom',backgroundColor:string|null}) {
    const self = this.getWritable();
    self.__border = border;
    self.__verticalAlign = verticalAlign;
    self.__backgroundColor = backgroundColor;
  }

  toggleHeaderStyle(headerStateToToggle: TableCellHeaderState): TableCellNode {
    const self = this.getWritable();

    if ((self.__headerState & headerStateToToggle) === headerStateToToggle) {
      self.__headerState -= headerStateToToggle;
    } else {
      self.__headerState += headerStateToToggle;
    }

    return self;
  }

  hasHeaderState(headerState: TableCellHeaderState): boolean {
    return (this.getHeaderStyles() & headerState) === headerState;
  }

  hasHeader(): boolean {
    return this.getLatest().__headerState !== TableCellHeaderStates.NO_STATUS;
  }

  updateDOM(prevNode: TableCellNode): boolean {
    return (
      prevNode.__headerState !== this.__headerState ||
      prevNode.__width !== this.__width ||
      prevNode.__colSpan !== this.__colSpan ||
      prevNode.__rowSpan !== this.__rowSpan ||
      prevNode.__backgroundColor !== this.__backgroundColor || 
      prevNode.__canResize !== this.__canResize ||
      prevNode.__active !== this.__active || 
      prevNode.__verticalAlign !== this.__verticalAlign || 
      prevNode.__border !== this.__border
    );
  }

  isShadowRoot(): boolean {
    return true;
  }

  collapseAtStart(): true {
    return true;
  }

  canBeEmpty(): false {
    return false;
  }
  
  canIndent(): false {
    return false;
  }

  getActive() {
    const self = this.getLatest();
    return self.__active;
  }
  setActive(bool: boolean) {
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
  setCanResize(b:boolean) {
    const self = this.getWritable();
    self.__canResize = b;
    return self;
  }
}

export function convertTableCellNodeElement(
  domNode: Node,
): DOMConversionOutput {
  const domNode_ = domNode as HTMLTableCellElement;
  const nodeName = domNode.nodeName.toLowerCase();

  let width: number | undefined = undefined;

  if (PIXEL_VALUE_REG_EXP.test(domNode_.style.width)) {
    width = parseFloat(domNode_.style.width);
  }
  var tableCellNode: TableCellNode;
  if (nodeName==='th') {
    if (domNode instanceof HTMLElement) {
      switch (domNode.getAttribute('data-scope')) {
        case 'row':
          tableCellNode = $createTableCellNode(
            TableCellHeaderStates.COLUMN,
            domNode_.colSpan,
            width,
          );
          break;
        case 'col':
          tableCellNode = $createTableCellNode(
            TableCellHeaderStates.ROW,
            domNode_.colSpan,
            width,
          );
          break;
        case null:
          tableCellNode = $createTableCellNode(
            TableCellHeaderStates.ROW,
            domNode_.colSpan,
            width,
          );
          break;
        case '':
          tableCellNode = $createTableCellNode(
            TableCellHeaderStates.ROW,
            domNode_.colSpan,
            width,
          );
          break;
        default:
          tableCellNode = $createTableCellNode(
            TableCellHeaderStates.ROW,
            domNode_.colSpan,
            width,
          );
          break;
      }
    } else {
      tableCellNode = $createTableCellNode(
        TableCellHeaderStates.ROW,
        domNode_.colSpan,
        width,
      );
    }
  } else {
    tableCellNode = $createTableCellNode(
      TableCellHeaderStates.NO_STATUS,
      domNode_.colSpan,
      width,
    );
  }
  

  tableCellNode.__rowSpan = domNode_.rowSpan;
  const backgroundColor = domNode_.style.backgroundColor;
  if (backgroundColor !== '') {
    tableCellNode.__backgroundColor = backgroundColor;
  }

  const verticalAlign =  domNode_.style.verticalAlign;
  const border =  domNode_.style.border;
  if (verticalAlign&&(verticalAlign==='top'||verticalAlign==='middle'||verticalAlign==='bottom')) tableCellNode.__verticalAlign = verticalAlign;
  if (border) tableCellNode.__border = border;

  return {
    forChild: (lexicalNode, parentLexicalNode) => {
      if ($isTableCellNode(parentLexicalNode) && !$isElementNode(lexicalNode)) {
        const paragraphNode = $createCellParagraphNode();
        if (
          $isLineBreakNode(lexicalNode) &&
          lexicalNode.getTextContent() === '\n'
        ) {
          return null;
        }
        paragraphNode.append(lexicalNode);
        return paragraphNode;
      }

      return lexicalNode;
    },
    node: tableCellNode,
  };
}

export function $createTableCellNode(
  headerState: TableCellHeaderState,
  colSpan = 1,
  width?: number,
): TableCellNode {
  return $applyNodeReplacement(new TableCellNode(headerState, colSpan, width));
}

export function $isTableCellNode(
  node: LexicalNode | null | undefined,
): node is TableCellNode {
  return node instanceof TableCellNode;
}
