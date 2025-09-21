/**
 * @todo Need to work on adding / removing columns / rows when cells are merged
 * @todo Maybe adding borders for the cells 
 * @todo Working on nested tables
 */
import { 
  COMMAND_PRIORITY_EDITOR,
  LexicalEditor,
  NodeKey,
  $isTextNode,
  $getNodeByKey,
  VALID_HEX_REGEX,
  type GridSelection, 
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $getSelection,
  DEPRECATED_$isGridSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_LOW,
  $setSelection,
  TextFormatType,
  $createTextNode,
  $createTableWrapperNode, 
  $isTableWrapperNode, 
  $getRoot,
  $nodesOfType,
  COMMAND_PRIORITY_CRITICAL,
  TableWrapperNode,
  FORMAT_ELEMENT_COMMAND,
  $isElementNode
} from "lexical";
import { 
  mergeRegister,
  $insertNodeToNearestRoot, 
  $findMatchingParent,
  $dfs,
  $wrapNodeInElement
} from "@lexical/utils";
import { 
  INSERT_TABLE_COMMAND, 
  $createTableNodeWithDimensions,
  $isTableNode,
  TableCellNode,
  $isTableCellNode,
  HTMLTableElementWithWithTableSelectionState, 
  applyTableHandlers,
  TableSelection,
  TableNode,
  $removeHighlightStyleToTable,
  $unmergeCell,
  $insertTableColumn__EXPERIMENTAL,
  $insertTableRow__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $selectLastDescendant,
  $getTableNodeFromLexicalNodeOrThrow,
  $getRowHeaderCellsInRange,
  $getColumnHeaderCellsInRange,
  computeSelectionCount,
  $getTableRowIndexFromTableCellNode,
  $getTableColumnIndexFromTableCellNode,
  $canUnmerge,
  isGridSelectionRectangular,
  TableRowNode,
  $isCellParagraphNode,
  CellParagraphNode,
  INSERT_TABLE_COMMAND_WITH_DATA,
  $isTableRowNode,
  $createCellParagraphNode
} from ".";
import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate
} from "@floating-ui/dom";
import { 
  getCurrentEditor,
  closeDialog, 
  SET_EDITOR_COMMAND,
  getEditorInstances,
  TEXT_COLOR_CHANGE,
  BACKGROUND_COLOR_CHANGE,
  MAKE_TRANSPARENT,
  CLEAR_TEXT_FORMATTING,
  getDefaultBackground,
  getDefaultTextColor,
  setSelectInput,
  openDialog,
  openLoadingDialog,
  closeLoadingDialog,
  getCsrfToken,
  getFileListForFileInput,
  getNoColor,
  editorCanChangeSize,
  NEW_CONTENT_LOADED_CED,
  REGISTER_TOOLBAR_LISTENERS,
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED
} from "@lexical/shared";
import { 
  FONT_FAMILY_CHANGE, 
  FONT_WEIGHT_CHANGE, 
  FONT_SIZE_CHANGE,
  clearTextFormattingCallback,
  fontSizeChangeCallback,
  fontWeightChangeCallback,
  fontFamilyChangeCallback,
  makeTransparentCallback,
  backgroundColorChangeCallback,
  textColorChangeCallback,
  VALID_FONT,
  VALID_FONT_WEIGHT,
  VALID_FONT_SIZE,
} from '@lexical/toolbar';
import { ALLOWED_BORDER_STYLES, parseColorStr } from "lexical";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";

/* --------------------------------------- Variables ------------------------------------ */
var LAST_SELECTED_TABLE_NAMESPACE: string = '';
/**
 * JSON that was uploaded for creating a table from a csv / excel file
 */
type RecentJSONType = {
  editorNamespace: string,
  json: string[][]
}

var RECENT_JSON:RecentJSONType|undefined = undefined;

export type TableStateType = {
  activeCell: TableCellNode|null, 
  selection: GridSelection|null,
  columns: number|null,
  rows: number|null,
  backgroundColor: string|null,
  rectangular: boolean,
  canUnmergeCells: boolean,
  canMergeCells: boolean,
  canAddRowHeader: boolean,
  canAddColHeader: boolean,
  canRemoveColHeader: boolean,
  canRemoveRowHeader: boolean,
  rowIndexes: Set<number>,
  colIndexes: Set<number>,
  bandedRows: boolean,
  bandedCols: boolean,
  tableKey: NodeKey,
  caption: string|undefined,
  align: 'left'|'center'|'right',
  namespace: string,
  canDeleteColumn: boolean
}
/**
 * See [This for a Reference](https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/plugins/TableCellResizer/index.tsx)
 */
const TABLE_STATE:{[editorNamespace: string]: TableStateType} = {}; 
const getDefaultTableState: () => TableStateType = () => ({
  activeCell: null,
  selection: null,
  columns: null,
  rows: null,
  backgroundColor:null,
  rectangular: true,
  canUnmergeCells: false,
  canMergeCells: false,
  canAddRowHeader: true,
  canAddColHeader: true,
  canRemoveColHeader: true,
  canRemoveRowHeader:true,
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

function getPortalEl() {
  return document.getElementById('text-table-selection-ref') as HTMLDivElement;
}
var tableSelections:{[editorNamespace: string]: Map<NodeKey,TableSelection>} = {};
/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 * 
 */
const autoUpdateObject:{[key: string]: () => void} = {};
const VALID_ALIGN_TABLE = new Set(['left','center','right'] as const);
const TABLE_ACTION_MENU_ID = 'lexical-table-action-menu';
var FOCUS_OUT_TIMEOUT:NodeJS.Timeout|undefined = undefined;

/*------------------------------- Helper Functions ---------------------------------- */
function clearInnerHTML(element: HTMLElement) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild as ChildNode);
  }
}
function clearTableState(editorNamespace:string) {
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
function getUploadTableForm(){
  const dialog = document.getElementById('tables-lexical') as HTMLDivElement;
  if(dialog){
    const form = dialog.querySelector<HTMLFormElement>('form#lexical-insert-table-upload-data');
    if(form){
      const fileUpload = dialog.querySelector<HTMLInputElement>('input#upload-data-to-table');
      const includeHeadingRowInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-heading-row-upload');
      const includeHeadingRow = includeHeadingRowInput ? includeHeadingRowInput.checked : true;
      const includeHeadingColumnInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-heading-column-upload');
      const includeHeadingCol = includeHeadingColumnInput ? includeHeadingColumnInput.checked : true;
      const bandedRowsInput =  dialog.querySelector<HTMLInputElement>('input#lexical-table-banded-rows-upload');
      const bandedRows = bandedRowsInput ? bandedRowsInput.checked : false;
      const bandedColsInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-banded-cols-upload');
      const bandedCols = bandedColsInput ? bandedColsInput.checked : false;
      const preview = dialog.querySelector<HTMLOutputElement>('output[form="lexical-insert-table-upload-data"][data-preview]');
      const includeCaptionInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-caption-upload'); 
      const includeCaption = includeCaptionInput ? includeCaptionInput.checked : false;
      const captionInput =  dialog.querySelector<HTMLInputElement>('input#lex-table-caption-input-upload');
      const alignInputs = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[name="lexical-insert-table-align-upload"]'));
      var align:'left'|'center'|'right' = 'center';
      if (Array.isArray(alignInputs)) {
        const alignValue = alignInputs.filter((obj) => obj.checked===true).map((obj) => obj.value)[0];
        if (VALID_ALIGN_TABLE.has(alignValue as any)) align = alignValue as 'left'|'center'|'right';
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
      }
    }else return null;
  } else return null;
}
/**
 * After there is a change event on the upload data input, replace the input element
 * @param input 
 */
function cloneDataUploadInput(input:HTMLInputElement) {
  const newInput = document.createElement('input');
  newInput.name = input.name;
  newInput.id = input.id;
  newInput.className = input.className;
  newInput.type = input.type;
  newInput.accept = input.accept;
  input.replaceWith(newInput);
  newInput.addEventListener('change',handleUploadData);
}

function updateUploadTableFormOutput() {
  const tableForm = getUploadTableForm();
  if(tableForm) {
    const output = tableForm.preview;
    if (output) {
      const table = output.querySelector('table');
      if (table) {
        const captionEl = table.querySelector<HTMLTableCaptionElement>('caption');
        if (tableForm.bandedCols&&!!!table.classList.contains('banded-col'))table.classList.add("banded-col");
        if (tableForm.bandedRows&&!!!table.classList.contains('banded-row'))table.classList.add("banded-row");
        if (tableForm.align==="left") table.style.setProperty('margin','10px auto 10px 0px','important');
        else if (tableForm.align==="center") table.style.setProperty('margin','10px auto','important');
        else if (tableForm.align==="right") table.style.setProperty('margin','10px 0px 10px auto','important');
        if(tableForm.includeCaption) {  
          if(tableForm.captionInput)tableForm.captionInput.removeAttribute('disabled');
          if (!!!captionEl) {
            const newCaptionEl = document.createElement('caption');
            newCaptionEl.innerText=tableForm.caption;
            table.insertAdjacentElement("afterbegin",newCaptionEl);
          } else {
            if (captionEl.innerText!==tableForm.caption) {
              captionEl.innerText = tableForm.caption;
            }
          } 
        } else {
          if (captionEl) captionEl.remove();
          if(tableForm.captionInput)tableForm.captionInput.setAttribute('disabled','');
        }
        const cellClassName = "rte-tableCell";
        const cellHeadingClassName = "rte-tableCell rte-tableCellHeader";
        const possibleTableColNodes = Array.from(table.querySelectorAll<(HTMLTableCellElement)>('tr:first-child>*'));
        if(possibleTableColNodes.length) {
          // Include heading col, nodes should be TH nodes with classNames = cellHeadingClassName and scope="col"
          if (tableForm.headingCol) {
            possibleTableColNodes.forEach((cell) => {
              var cellToCheck = cell;
              if (cellToCheck.tagName!=='TH') {
                const newCell = document.createElement('th');
                newCell.style.setProperty("text-align","center");
                newCell.setAttribute('scope','col');
                newCell.scope = 'col';
                newCell.className = cellHeadingClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className!==cellHeadingClassName) cellToCheck.className=cellHeadingClassName;
            })
          } else {
            possibleTableColNodes.forEach((cell) => {
              var cellToCheck = cell;
              if (cellToCheck.tagName!=='TD') {
                const newCell = document.createElement('td');
                newCell.style.setProperty("text-align","center");
                newCell.className = cellClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className!==cellClassName) cellToCheck.className=cellClassName;
            });
          }
        }
        const possibleHeadingRowNodes = Array.from(table.querySelectorAll<HTMLTableCellElement>('tr>*:first-child'));
        if (possibleHeadingRowNodes.length) {
          // Include heading row, nodes should be TH nodes with classNames = cellHeadingClassName and scope="row"
          if (tableForm.headingRow) {
            possibleHeadingRowNodes.forEach((cell) => {
              var cellToCheck = cell;
              if (cellToCheck.tagName!=='TH') {
                const newCell = document.createElement('th');
                newCell.style.setProperty("text-align","center");
                newCell.setAttribute('scope','row');
                newCell.scope = 'row';
                newCell.className = cellHeadingClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className!==cellHeadingClassName) cellToCheck.className=cellHeadingClassName;
            })
          } else {
            possibleHeadingRowNodes.forEach((cell) => {
              var cellToCheck = cell;
              if (cellToCheck.tagName!=='TD') {
                const newCell = document.createElement('td');
                newCell.style.setProperty("text-align","center");
                newCell.className = cellClassName;
                newCell.innerText = cellToCheck.innerText;
                cellToCheck.replaceWith(newCell);
                cellToCheck = newCell;
              }
              if (cellToCheck.className!==cellClassName) cellToCheck.className=cellClassName;
            })
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
function handleUploadData(this: HTMLInputElement,e:Event) {
  const htmlEl = document.querySelector('html');
  const editor = getCurrentEditor();
  if(this.files&&this.files.length&&htmlEl&&editor){
    var output:HTMLOutputElement|undefined|null;
    var submitButton:HTMLButtonElement|undefined|null = undefined;
    const file = this.files[0];
    const data = new FormData();
    const form = this.closest<HTMLFormElement>('form');
    if (form) {
      output = document.querySelector<HTMLOutputElement>(`output[form="${form.id}"]`);
      submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    }
    data.append('file',file);
    openLoadingDialog('Creating table from uploaded file...');
    fetch('/api/lexical-table',{method: 'POST', body: data, headers: { 'X-CSRF-Token': getCsrfToken()} })
    .then(async (res)=> {
      if (res.status!==200) {
        const { html } = await res.json();
        if (form) form.insertAdjacentHTML("beforeend",html);
        if (form) htmlEl.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: form }}));
      } else {
        const { html, json } = await res.json();
        const editorNamespace = editor._config.namespace;
        RECENT_JSON = { editorNamespace, json };
        if (output) output.innerHTML = html;
        updateUploadTableFormOutput();
        if (submitButton&&submitButton.hasAttribute('disabled')) submitButton.removeAttribute('disabled');
      }
      closeLoadingDialog();
      cloneDataUploadInput(this);
    })
    .catch((error) => {
      closeLoadingDialog();
      cloneDataUploadInput(this);
    })
  }  
}
/**
 * Upload table form submit event, add the data to the table if there is RECENT_JSON object and the r
 * @param this 
 * @param e 
 */
function handleUploadTableFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  const form = getUploadTableForm();
  const editor = getCurrentEditor();
  if(form&&editor){
    if (RECENT_JSON && RECENT_JSON.json&&RECENT_JSON.editorNamespace===editor._config.namespace) {
      const includeHeaders = {rows: form.headingRow, columns: form.headingCol};
      editor.dispatchCommand(INSERT_TABLE_COMMAND_WITH_DATA,{
        columns: RECENT_JSON.json[0].length.toFixed(0),
        rows: RECENT_JSON.json.length.toFixed(0),
        includeHeaders,
        caption: form.includeCaption ? form.caption : undefined,
        bandedRows: form.bandedRows,
        bandedCols: form.bandedCols,
        align:form.align,
        json: RECENT_JSON.json
      });
      if(form.preview)clearInnerHTML(form.preview);
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
function handleUploadTableFormChange(this:HTMLFormElement) {
  const tableForm = getUploadTableForm();
  const editor = getCurrentEditor();
  if(tableForm&&editor){
    const submitButton = tableForm.form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if(submitButton) {
      if (RECENT_JSON&&RECENT_JSON.editorNamespace===editor._config.namespace&&submitButton.hasAttribute('disabled')) submitButton.removeAttribute('disabled');
      else if (!!!submitButton.hasAttribute('disabled') && (!!!(RECENT_JSON)||RECENT_JSON.editorNamespace!==editor._config.namespace)) submitButton.setAttribute('disabled','');
    }
    updateUploadTableFormOutput();
  }
}

/* ------------------------------- Create Table Form ------------------------------------- */
/**
 * Get the table dialog and form and inputs
 */
function getTableForm() {
  const dialog = document.getElementById('tables-lexical') as HTMLDivElement;
  if (dialog) {
    const form = dialog.querySelector<HTMLFormElement>('form#lexical-insert-table-form');
    if (form) {
      const includeHeadingRowInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-heading-row');
      const includeHeadingRow = includeHeadingRowInput ? includeHeadingRowInput.checked : true;
      const includeHeadingColumnInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-heading-column');
      const includeHeadingCol = includeHeadingColumnInput ? includeHeadingColumnInput.checked : true;
      const bandedRowsInput =  dialog.querySelector<HTMLInputElement>('input#lexical-table-banded-rows');
      const bandedRows = bandedRowsInput ? bandedRowsInput.checked : false;
      const bandedColsInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-banded-cols');
      const bandedCols = bandedColsInput ? bandedColsInput.checked : false;
      const numberOfRowsInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-number-rows');
      const numberOfRows = numberOfRowsInput ? Math.max(Math.min(parseInt(numberOfRowsInput.value),50),2) : 5;
      const numberOfColsInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-number-cols');
      const numberOfCols = numberOfColsInput ? Math.max(Math.min(parseInt(numberOfColsInput.value),50),2) : 5;
      const preview = dialog.querySelector<HTMLDivElement>('output[form="lexical-insert-table-form"][data-preview]');
      const includeCaptionInput = dialog.querySelector<HTMLInputElement>('input#lexical-table-include-caption'); 
      const includeCaption = includeCaptionInput ? includeCaptionInput.checked : false;
      const captionInput =  dialog.querySelector<HTMLInputElement>('input#lex-table-caption-input');
      const alignInputs = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[name="lexical-insert-table-align"]'));
      
      var align:'left'|'center'|'right' = 'center';
      if (Array.isArray(alignInputs)) {
        const alignValue = alignInputs.filter((obj) => obj.checked===true).map((obj) => obj.value)[0];
        if (VALID_ALIGN_TABLE.has(alignValue as any)) align = alignValue as 'left'|'center'|'right';
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
      }
    } else return null;
  } else return null;
}

/* ------------------------------- Edit Table Form ------------------------------------- */
function getEditTableForm() {
  const form = document.getElementById('lexical-edit-table-form');
  if (form) {
    const bandedRowsCheckbox = form.querySelector<HTMLInputElement>('input[name="edit-table-banded-rows"]');
    const bandedColsCheckbox = form.querySelector<HTMLInputElement>('input[name="edit-table-banded-columns"]');
    const captionCheckbox = form.querySelector<HTMLInputElement>('input[name="edit-table-include-caption"]');
    const captionInput = form.querySelector<HTMLInputElement>('input[name="edit-table-new-caption"]');
    const captionLabel = form.querySelector<HTMLLabelElement>('label[for="edit-table-new-caption"]');
    const alignInputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="lexical-edit-table-align"]'));
    const bandedRows = bandedRowsCheckbox ? bandedRowsCheckbox.checked : false;
    const bandedCols = bandedColsCheckbox ? bandedColsCheckbox.checked : false;
    const includeCaption = captionCheckbox ? captionCheckbox.checked : false;
    const align = (Array.isArray(alignInputs)) ? alignInputs.filter((inputEl) => inputEl.checked)?.[0]?.value : 'center';
    return {
      bandedRowsCheckbox,
      bandedColsCheckbox,
      captionCheckbox,
      captionInput,
      captionLabel,
      alignInputs ,
      bandedRows,
      bandedCols,
      includeCaption,
      align,
    }
  }
}
function setEditTableForm({ bandedRows, bandedCols, caption, align }:{bandedRows:boolean, bandedCols:boolean, caption:string|undefined, align: 'left'|'center'|'right'}) {
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

    if (bandedRowsCheckbox){
      if (bandedRows) bandedRowsCheckbox.checked = true;
      else bandedRowsCheckbox.checked = false;
    } 
    if (bandedColsCheckbox){
      if (bandedCols) bandedColsCheckbox.checked = true;
      else bandedColsCheckbox.checked = false;
    }
    if (captionCheckbox){
      if (caption!==undefined) captionCheckbox.checked = true;
      else captionCheckbox.checked = false;
    }
    if (captionInput) {
      if (caption===undefined) {
        captionInput.setAttribute('disabled','');
        captionInput.value = '';
      } else {
        captionInput.removeAttribute('disabled');
        captionInput.value = caption;
      }
    }
    if (captionLabel&&captionInput) {
      if (caption===undefined) captionLabel.classList.add('disabled'); 
      else captionLabel.classList.remove('disabled'); 
    }
    if (Array.isArray(alignInputs)) {
      alignInputs.forEach((inputEl) => inputEl.checked = Boolean(align===inputEl.value));
    }
  } 
}
function handleEditTableFormSubmit(this: HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  const editor = getCurrentEditor();
  const bandedRowsCheckbox = this.querySelector<HTMLInputElement>('input[name="edit-table-banded-rows"]');
  const bandedColsCheckbox = this.querySelector<HTMLInputElement>('input[name="edit-table-banded-columns"]');
  const captionCheckbox = this.querySelector<HTMLInputElement>('input[name="edit-table-include-caption"]');
  const captionInput = this.querySelector<HTMLInputElement>('input[name="edit-table-new-caption"]');
  const alignInputs = Array.from(this.querySelectorAll<HTMLInputElement>('input[name="lexical-edit-table-align"]'));
  const tempAlignValue = alignInputs.filter((input) => input.checked===true).map((obj) => obj.value)[0];
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
            if (captionCheckbox.checked && captionInput) table.setCaption(captionInput.value);
            else table.setCaption(undefined);
          }
          if (VALID_ALIGN_TABLE.has(tempAlignValue as any)) table.setAlign(tempAlignValue as 'left'|'center'|'right');
        }
      }
      handleTableActionButtonBlur();
      closeDialog(dialog);     
    })
  }
}
function handleEditTableIncludeCaptionChange(this: HTMLInputElement,e:Event) {
  const form = this.closest('form');
  if (form) {
    const captionInput = form.querySelector<HTMLInputElement>('input[type="text"]');
    if (captionInput) {
      if (this.checked) {
        captionInput.removeAttribute('disabled');
      } else {
        captionInput.setAttribute('disabled','');
      }
    }
  }
}

/* --------------------------------- Table Action Menu ------------------------- */
/**
 * Called in update toolbar if there is a table cell in the selection
 */
function setLaunchTableMenuListeners(editorNamespace:string) {
  if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
  const b = document.getElementById('table-action-menu-launch');
  if (b) {
    b.addEventListener('click',handleTableActionButtonFocus,true);
    b.addEventListener('focus',handleTableActionButtonFocus,true);
    b.addEventListener('pointerdown',handleTableActionButtonFocus,true);
    b.addEventListener('touchstart',handleTableActionButtonFocus,true);
    b.addEventListener('blur',handleTableActionButtonBlur);
  }
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    const buttons = Array.from(menu.querySelectorAll('button'));
    buttons.forEach((b) => {
      if (b.hasAttribute('data-table-merge')) {
        if (TABLE_STATE[editorNamespace].canMergeCells) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
      } else if (b.hasAttribute('data-table-unmerge')) {
        if (TABLE_STATE[editorNamespace].canUnmergeCells) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
      } else if (b.hasAttribute('data-table-row-above')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Insert ${Boolean(!!!rows || rows===1) ? 'Row' : `${rows} Rows`} Above`;
      } else if (b.hasAttribute('data-table-row-below')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Insert ${Boolean(!!!rows || rows===1) ? 'Row' : `${rows} Rows`} Below`;
      } else if (b.hasAttribute('data-table-col-left')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Insert ${Boolean(!!!columns || columns===1) ? 'Column' : `${columns} Columns`} Left`;
      } else if (b.hasAttribute('data-table-col-right')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Insert ${Boolean(!!!columns || columns===1) ? 'Column' : `${columns} Columns`} Right`;
      } else if (b.hasAttribute('data-table-delete-row')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        b.innerText = `Delete ${Boolean(!!!rows || rows===1) ? 'Row' : `${rows} Rows`}`;
      } else if (b.hasAttribute('data-table-delete-column')) {
        if (TABLE_STATE[editorNamespace].canDeleteColumn) b.removeAttribute('hidden');
        else b.setAttribute('hidden','');
        
        const columns = TABLE_STATE[editorNamespace].columns;
        b.innerText = `Delete ${Boolean(!!!columns || columns===1) ? 'Column' : `${columns} Columns`}`;
      } else if (b.hasAttribute('data-table-add-row-header')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        if (TABLE_STATE[editorNamespace].canAddRowHeader) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
        b.innerText = `Add ${Boolean(rows && rows>1) ? 'Row Headers' : 'Row Header'}`;
      } else if (b.hasAttribute('data-table-add-col-header')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        if (TABLE_STATE[editorNamespace].canAddColHeader) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
        b.innerText = `Add ${Boolean(columns && columns>1) ? 'Column Headers' : 'Column Header'}`;
      } else if (b.hasAttribute('data-table-remove-row-header')) {
        const rows = TABLE_STATE[editorNamespace].rows;
        if (TABLE_STATE[editorNamespace].canRemoveRowHeader) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
        b.innerText = `Remove ${Boolean(rows && rows>1) ? 'Row Headers' : 'Row Header'}`;
      } else if (b.hasAttribute('data-table-remove-col-header')) {
        const columns = TABLE_STATE[editorNamespace].columns;
        if (TABLE_STATE[editorNamespace].canRemoveColHeader) b.removeAttribute('hidden');
        else  b.setAttribute('hidden','');
        b.innerText = `Remove ${Boolean(columns && columns>1) ? 'Column Headers' : 'Column Header'}`;
      } 
    })
  }
  setEditTableForm({ 
    bandedCols: TABLE_STATE[editorNamespace].bandedCols, 
    bandedRows: TABLE_STATE[editorNamespace].bandedRows, 
    caption: TABLE_STATE[editorNamespace].caption, 
    align: TABLE_STATE[editorNamespace].align 
  });
}

function handleTableActionButtonFocus(this:HTMLElement,e:Event) {
  e.stopPropagation();
  e.preventDefault();
  handleTableActionButtonBlur();
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    menu.style.display ='flex';
    const updatePopover = function (this: HTMLElement) {
      const options:any = {
        placement: "right-start",
        middleware: [offset(2),shift(),flip()]
      };
      if (!!!this.isConnected) handleTableActionButtonBlur();
      computePosition(this,menu,options)
      .then(({ x, y }) => {
        const assignObj = {
          left: `${x}px`,
          top: `${y}px`,
          opacity: "1"
        };
        Object.assign(menu.style,assignObj);
      })
    }.bind(this);
    updatePopover();
    const cleanup = autoUpdate(this,menu,updatePopover);
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
function mergeCells(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].selection && TABLE_STATE[editorNamespace].tableKey) {
        const tableElement = editor.getElementByKey(TABLE_STATE[editorNamespace].tableKey);
        const { columns, rows } = TABLE_STATE[editorNamespace];
        const firstCell = TABLE_STATE[editorNamespace]?.activeCell;
        if (firstCell && columns && rows && TABLE_STATE[editorNamespace].selection) {
          const nodes = (TABLE_STATE[editorNamespace].selection as GridSelection).getNodes();
          for (let node of nodes) {
            if (node.is(firstCell)) {
              (node as TableCellNode).setColSpan(columns).setRowSpan(rows);
            } else if ($isTableCellNode(node)) {
              node.remove();
            }
          }
        }
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        if(firstCell){
          firstCell.setActive(true);
          $selectLastDescendant(firstCell);
        }
        if (tableElement) tableElement.classList.remove('selecting');
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
        handleTableActionButtonBlur(); 
      }
    });
  }
}
function unmergeCells(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if(TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
      $unmergeCell();
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
        }
      }
    });
  }
}
function insertRowAbove(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell&&TABLE_STATE[editorNamespace].rows) {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const rows = TABLE_STATE[editorNamespace].rows as number;
        $insertTableRow__EXPERIMENTAL(TABLE_STATE[editorNamespace].rowIndexes.has(0) ? true : false,rows,TABLE_STATE[editorNamespace].canRemoveRowHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function insertRowBelow(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell&&TABLE_STATE[editorNamespace].rows) {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const rows = TABLE_STATE[editorNamespace].rows as number;
        $insertTableRow__EXPERIMENTAL(true,rows,TABLE_STATE[editorNamespace].canRemoveRowHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function insertColRight(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell&&TABLE_STATE[editorNamespace].columns) {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const columns = TABLE_STATE[editorNamespace].columns  as number;
        $insertTableColumn__EXPERIMENTAL(false,columns,TABLE_STATE[editorNamespace].canRemoveColHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function insertColLeft(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell&&TABLE_STATE[editorNamespace].columns) {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const columns = TABLE_STATE[editorNamespace].columns as number;
        $insertTableColumn__EXPERIMENTAL(true,columns,TABLE_STATE[editorNamespace].canRemoveColHeader);
        const key = TABLE_STATE[editorNamespace].tableKey;
        clearTableState(editorNamespace);
        handleTableActionButtonBlur();
        if (key) {
          if (tableSelections[editorNamespace]) {
            const tableSelection = tableSelections[editorNamespace].get(key);
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function deleteRow(this:HTMLButtonElement,e:Event) {
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
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function deleteColumn(this:HTMLButtonElement,e:Event) {
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
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function deleteTable(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace]?.activeCell) {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const tableNode = $getTableNodeFromLexicalNodeOrThrow(TABLE_STATE[editorNamespace]?.activeCell as TableCellNode);
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
            if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
          }
        }
      }
    });
  }
}
function addRowHeader(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].rowIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if(TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedRowArray = Array.from(TABLE_STATE[editorNamespace].rowIndexes).sort((a,b) => a-b);
        const minRow = sortedRowArray[0];
        const maxRow = sortedRowArray[sortedRowArray.length-1];
        if($isTableNode(table) && !!!isNaN(minRow) && !!!isNaN(maxRow)){
          const rowHeaders = $getRowHeaderCellsInRange(table,minRow,maxRow);
          if (rowHeaders) rowHeaders.forEach((cell) => cell.setHeaderStyles(2));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
        }
      }
    });
  }
}
function addColumnHeader(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].colIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if(TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedColArray = Array.from(TABLE_STATE[editorNamespace].colIndexes).sort((a,b) => a-b);
        const minCol = sortedColArray[0];
        const maxCol = sortedColArray[sortedColArray.length-1];
        if($isTableNode(table) && !!!isNaN(minCol) && !!!isNaN(maxCol)){
          const colHeaders = $getColumnHeaderCellsInRange(table,minCol,maxCol);
          if (colHeaders) colHeaders.forEach((cell) => cell.setHeaderStyles(3));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
        }
      }
    });
  }
}
function removeRowHeader(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].rowIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
       if(TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedRowArray = Array.from(TABLE_STATE[editorNamespace].rowIndexes).sort((a,b) => a-b);
        const minRow = sortedRowArray[0];
        const maxRow = sortedRowArray[sortedRowArray.length-1];
        if($isTableNode(table) && !!!isNaN(minRow) && !!!isNaN(maxRow)){
          const rowHeaders = $getRowHeaderCellsInRange(table,minRow,maxRow);
          if (rowHeaders) rowHeaders.forEach((cell) => cell.setHeaderStyles(0));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
        }
      }
    });
  }
}
function removeColumnHeader(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    editor.update(() => {
      if (TABLE_STATE[editorNamespace].colIndexes.size && TABLE_STATE[editorNamespace].tableKey) {
        if(TABLE_STATE[editorNamespace]?.activeCell) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
        const table = $getNodeByKey(TABLE_STATE[editorNamespace].tableKey);
        const sortedColArray = Array.from(TABLE_STATE[editorNamespace].colIndexes).sort((a,b) => a-b);
        const minCol = sortedColArray[0];
        const maxCol = sortedColArray[sortedColArray.length-1];
        if($isTableNode(table) && !!!isNaN(minCol) && !!!isNaN(maxCol)){
          const colHeaders = $getColumnHeaderCellsInRange(table,minCol,maxCol);
          if (colHeaders) colHeaders.forEach((cell) => cell.setHeaderStyles(0));
        }
      }
      const key = TABLE_STATE[editorNamespace].tableKey;
      clearTableState(editorNamespace);
      handleTableActionButtonBlur();
      if (key) {
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(key);
          if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
        }
      }
    });
  }
}

/*------------------------------------------ Table Dialogs ------------------------------- */
function setTableActionMenuButtonsListeners() {
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) {
    const buttons = Array.from(menu.querySelectorAll<HTMLButtonElement>('button'));
    for (let b of buttons) {
      if (b.hasAttribute('data-table-merge')) b.addEventListener('click',mergeCells);
      else if (b.hasAttribute('data-table-unmerge')) b.addEventListener('click',unmergeCells);
      else if (b.hasAttribute('data-table-row-above')) b.addEventListener('click',insertRowAbove);
      else if (b.hasAttribute('data-table-row-below')) b.addEventListener('click',insertRowBelow);
      else if (b.hasAttribute('data-table-col-left')) b.addEventListener('click',insertColRight);
      else if (b.hasAttribute('data-table-col-right')) b.addEventListener('click',insertColLeft);
      else if (b.hasAttribute('data-table-delete-row')) b.addEventListener('click',deleteRow);
      else if (b.hasAttribute('data-table-delete-column')) b.addEventListener('click',deleteColumn);
      else if (b.hasAttribute('data-table-delete-table')) b.addEventListener('click',deleteTable);
      else if (b.hasAttribute('data-table-add-row-header')) b.addEventListener('click',addRowHeader);
      else if (b.hasAttribute('data-table-add-col-header')) b.addEventListener('click',addColumnHeader);
      else if (b.hasAttribute('data-table-remove-row-header')) b.addEventListener('click',removeRowHeader);
      else if (b.hasAttribute('data-table-remove-col-header')) b.addEventListener('click',removeColumnHeader);
      else continue;
    }
  }
}


/*---------------------------------- Edit Table Cells in Selection ---------------------------------- */
function parseBorderStr(s:string) {
  try {
    const firstInstanceSpace = s.indexOf(' ');
    const widthStr = s.slice(0,firstInstanceSpace);
    const afterSpace = s.slice(firstInstanceSpace+1);
    const secondIndexSpace = afterSpace.indexOf(' ');
    const styleStr = afterSpace.slice(0,secondIndexSpace);
    const colorStr = afterSpace.slice(secondIndexSpace+1);
    const widthPre = parseInt(widthStr);
    const width = !!!isNaN(widthPre)&&isFinite(widthPre) ? Math.max(0,Math.min(widthPre,5)):undefined;
    const style = ALLOWED_BORDER_STYLES.has(styleStr.trim()) ? styleStr.trim() : undefined;
    const color = String(parseColorStr(colorStr.trim(),getDefaultTextColor()));
    return {
      width,
      style,
      color
    };
  } catch (error) {
    console.error(error);
    return {
      width:undefined,
      style:undefined,
      color:undefined
    };
  }
}
function getChangeCellsForm() {
  const form = document.getElementById('lexical-edit-bg-color-form') as HTMLFormElement|null;
  const colorInput = document.getElementById('lexical-cell-bg-color-input') as HTMLInputElement|null;
  const transparentInput = document.getElementById('lexical-cell-bg-color-input-trans') as HTMLInputElement|null;
  const verticalAlign = document.querySelector<HTMLInputElement>('input[name="table-cell-vertical-align"]:checked');
  const borderColor = document.getElementById('lex-cell-border-color') as HTMLInputElement|null;
  const transparentBorder = document.getElementById('lex-cell-border-color-transparent') as HTMLInputElement|null;
  const borderStyle = document.getElementById('cell-border-style-value') as HTMLInputElement|null;
  const borderWidth = document.getElementById('lex-cell-border-width') as HTMLInputElement|null;
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
function handleChangeCellsFormSubmit(this: HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
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
  if (colorInput&&transparentInput&&editor&&dialog&&borderColor&&transparentBorder&&borderStyle&&borderWidth) {
    const editorNamespace = editor._config.namespace;
    if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
    const VALID_VERTICAL_ALIGN = new Set(['top','middle','bottom']);
    const newBackgroundColor = transparentInput.checked?null:(VALID_HEX_REGEX.test(colorInput.value)?colorInput.value:null);
    const newBorderColor = transparentBorder.checked?undefined:(VALID_HEX_REGEX.test(borderColor.value)?borderColor.value:undefined);
    const newBorderStyle = ALLOWED_BORDER_STYLES.has(borderStyle.value)?borderStyle.value:undefined;
    const newBorderWidthTemp = parseInt(borderWidth.value);
    const newBorderWidth = Boolean(!!!isNaN(newBorderWidthTemp)&&isFinite(newBorderWidthTemp))?Math.max(0,Math.min(5,newBorderWidthTemp)):undefined;
    const newBorder =  Boolean(newBorderColor!==undefined && newBorderStyle!==undefined && newBorderWidth!==undefined) ? `${newBorderWidth}px ${newBorderStyle} ${newBorderColor}` : undefined;
    const newVerticalAlign = verticalAlign ? (VALID_VERTICAL_ALIGN.has(verticalAlign.value) ? verticalAlign.value : undefined ) as 'top'|'middle'|'bottom'|undefined : undefined;
    if (TABLE_STATE[editorNamespace].selection&&editor) {
      editor.update(() => {
        const nodes = (TABLE_STATE[editorNamespace].selection as GridSelection).getNodes();
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
      })
    } else if (TABLE_STATE[editorNamespace]?.activeCell&&editor) {
      editor.update(() => {
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setCustomStyles({
          border: newBorder, 
          backgroundColor: newBackgroundColor, 
          verticalAlign: newVerticalAlign
        });
        closeDialog(dialog);
        handleTableActionButtonBlur();
      })
    }
  }
}

function handleChangeCellsFormReset(this:HTMLFormElement,e:Event) {
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
  if (
    form&&
    colorInput&&
    transparentInput&&
    verticalAlign&&
    borderColor&&
    transparentBorder&&
    borderStyle&&
    borderWidth
  ) {
    const backgroundColor = getDefaultBackground();
    colorInput.value = backgroundColor;
    transparentInput.checked=true;
    const defaultVerticalAlign = 'middle';
    Array.from(form.querySelectorAll<HTMLInputElement>('input[name="table-cell-vertical-align"]'))
    .forEach((input) => {
      if (input.value!==defaultVerticalAlign) input.checked=false;
      else input.checked=true;
    })
    const defaultBorder = getDefaultTextColor();
    borderColor.value=defaultBorder;
    transparentBorder.checked=true;
    setSelectInput(borderStyle,'none','None');
    borderWidth.value = '0';
  }
}

const createTh = (scope: 'row'|'col',text="") => {
  const th = document.createElement('th');
  th.setAttribute('scope',scope);
  th.className = "rte-tableCell rte-tableCellHeader";
  th.innerText=text;
  return th as HTMLTableCellElement;
}
const createTd = (text="") => {
  const td = document.createElement('td');
  td.className = "rte-tableCell";
  td.innerText = text;
  return td;
}
const getCellStr = (row: number, col: number) => '('.concat(String(row)).concat(',').concat(String(col)).concat(')');

function handleTableFormChange(this:HTMLFormElement) {
  const tableForm = getTableForm();
  if (tableForm && tableForm.preview) {
    const table = document.createElement('table');
    table.classList.add("rte-table");
    table.setAttribute('cellspacing','0');
    if (tableForm.bandedCols && tableForm.bandedRows) table.classList.add("banded-col","banded-row");
    else if (tableForm.bandedCols)table.classList.add("banded-col");
    else if (tableForm.bandedRows)table.classList.add("banded-row");
    if (tableForm.align==="left") table.style.setProperty('margin','10px auto 10px 0px','important');
    else if (tableForm.align==="center") table.style.setProperty('margin','10px auto','important');
    else if (tableForm.align==="right") table.style.setProperty('margin','10px 0px 10px auto','important');

    if (tableForm.includeCaption) {
      if (tableForm.captionInput) tableForm.captionInput.removeAttribute('disabled');
      const caption = document.createElement('caption');
      caption.innerText = tableForm.caption;
      table.append(caption);
    } else {
      if (tableForm.captionInput) tableForm.captionInput.setAttribute('disabled','');
    }
    if (tableForm.headingRow) {
      const tr = document.createElement('tr');
      tr.className="thead";
      for (let col = 0; col < tableForm.numCols; col++) {
        tr.append(createTh("col",getCellStr(0,col)));
      }
      table.append(tr);
    }
    const tbody = document.createElement('tbody');
    tbody.style.cssText = "background-color:var(--background);"
    for (let row = Number(tableForm.headingRow); row < tableForm.numRows; row++) {
      const tr = document.createElement('tr');
      for (let col = 0; col < tableForm.numCols; col++) {
        if (col===0&&tableForm.headingCol) {
          tr.append(createTh("row",getCellStr(row,col)));
          continue;
        }
        tr.append(createTd(getCellStr(row,col)));
      }
      tbody.append(tr);
    }
    table.append(tbody);
    clearInnerHTML(tableForm.preview);
    tableForm.preview.append(table);
  }
}

function handleTableFormSubmit(this:HTMLFormElement,e:SubmitEvent){
  const tableForm = getTableForm();
  e.preventDefault();
  if (tableForm && tableForm.preview) {
    const includeHeaders = {rows: tableForm.headingRow, columns: tableForm.headingCol};
    const rows = isNaN(tableForm.numRows) ? 5 : tableForm.numRows;
    const columns =  isNaN(tableForm.numCols) ? 5 : tableForm.numCols;
    const caption = tableForm.includeCaption ? tableForm.caption : undefined;
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND,{
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

function handleTableFormReset(this:HTMLFormElement,e:Event) {
  if (this.id==="lexical-insert-table-form") handleTableFormChange.bind(this)();
  else if (this.id==="lexical-insert-table-upload-data") {
    RECENT_JSON=undefined;
    handleUploadTableFormChange.bind(this)();
  }
}

/* --------------------------------------- RegisterTable ------------------------------------ */
function initializeTableNode(editor: LexicalEditor, tableNode: TableNode) {
  const nodeKey = tableNode.getKey();
  const id = editor._config.namespace;
  const tableElement = editor.getElementByKey(nodeKey) as HTMLTableElementWithWithTableSelectionState;
  if (tableElement && (!!!tableSelections[id] || !!!tableSelections[id].has(nodeKey))) {
    const tableSelection = applyTableHandlers(
      tableNode,
      tableElement,
      editor,
      false
    );
    if (!!!tableSelections[id]) tableSelections[id] = new Map<NodeKey,TableSelection>();
    tableSelections[id].set(nodeKey, tableSelection);
  }
};

/**
 * Clear the current table selectiuon for a table
 * @param editorNamespace 
 */
function clearEditorTableSelection(editorNamespace:string) {
  const EDITOR_INSTANCES = getEditorInstances();
  const editor = EDITOR_INSTANCES[editorNamespace];
  if (TABLE_STATE[editorNamespace]&&editor) {
    const key = TABLE_STATE[editorNamespace].tableKey;
    if (tableSelections[editorNamespace] && key) {
      const tableSelection = tableSelections[editorNamespace].get(key);
      if(tableSelection instanceof TableSelection) $removeHighlightStyleToTable(editor,tableSelection);
    }
    clearTableState(editorNamespace);
  }
}


type DispatchCommandOnTableSelection = {
  command: typeof FORMAT_TEXT_COMMAND,
  formatType: TextFormatType,
  name: 'FORMAT_TEXT_COMMAND'
} | {
  command: typeof TEXT_COLOR_CHANGE,
  color: string,
  name: 'TEXT_COLOR_CHANGE'
} | {
  command: typeof MAKE_TRANSPARENT,
  payload: {type:'text'|'background', color:string|null},
  name: 'MAKE_TRANSPARENT'
} | {
  command: typeof CLEAR_TEXT_FORMATTING,
  name: 'CLEAR_TEXT_FORMATTING'
} | {
  command: typeof BACKGROUND_COLOR_CHANGE,
  color: string,
  name: 'BACKGROUND_COLOR_CHANGE'
} | {
  command: typeof FONT_FAMILY_CHANGE,
  fontWithSemiColon: VALID_FONT | "Inherit",
  name: 'FONT_FAMILY_CHANGE'
} | {
  command: typeof FONT_WEIGHT_CHANGE,
  fontWeight: VALID_FONT_WEIGHT | 'Inherit',
  name: 'FONT_WEIGHT_CHANGE'
} | {
  command: typeof FONT_SIZE_CHANGE,
  fontSize:  "Inherit" | VALID_FONT_SIZE,
  name: 'FONT_SIZE_CHANGE'
} 

function $handleDispatchCommandOnGridSelection(editor:LexicalEditor,selection:GridSelection,dispatchObj:DispatchCommandOnTableSelection):true {
  switch (dispatchObj.name) {
    case 'FORMAT_TEXT_COMMAND': {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,dispatchObj.formatType);
      break;
    }
    case 'TEXT_COLOR_CHANGE': {
      if (!!!getNoColor(editor)) textColorChangeCallback(selection,dispatchObj.color);
      break;
    }
    case 'MAKE_TRANSPARENT': {
      makeTransparentCallback(selection,dispatchObj.payload);
      break;
    }
    case 'CLEAR_TEXT_FORMATTING': {
      clearTextFormattingCallback(selection);
      break;
    }
    case 'BACKGROUND_COLOR_CHANGE': {
      if (!!!getNoColor(editor)) backgroundColorChangeCallback(selection,dispatchObj.color);
      break;
    }
    case 'FONT_FAMILY_CHANGE': {
      fontFamilyChangeCallback(selection,dispatchObj.fontWithSemiColon)
      break;
    }
    case 'FONT_WEIGHT_CHANGE': {
      fontWeightChangeCallback(selection,dispatchObj.fontWeight);
      break;
    }
    case 'FONT_SIZE_CHANGE': {
      if (editorCanChangeSize(editor)) fontSizeChangeCallback(selection,dispatchObj.fontSize);
      break;
    }
    default: {
      break;
    }
  }
  return true;
}

function handleFocusOut(this:HTMLDivElement,e:Event) {
  FOCUS_OUT_TIMEOUT = setTimeout(() => {
    const editorNamespace = this.id;
    const editor = getEditorInstances()[editorNamespace];
    if (editor) {
      editor.update(() => {
        const activeCell = (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode);
        if ($isTableCellNode(activeCell)){
          activeCell.setActive(false);
        }
      })
    }
    clearTableState(editorNamespace);
    handleTableActionButtonBlur();
  },100);
}
function handleTableActionMenuFocusIn() {
  if (FOCUS_OUT_TIMEOUT) clearTimeout(FOCUS_OUT_TIMEOUT);
}


export function $onTableSelectionChange(editor:LexicalEditor) {
  const editorNamespace = editor._config.namespace;
  if (RECENT_JSON && editorNamespace!==RECENT_JSON.editorNamespace) RECENT_JSON = undefined; 
  const selection = $getSelection();
  if (LAST_SELECTED_TABLE_NAMESPACE!==editorNamespace) clearEditorTableSelection(editorNamespace);
  LAST_SELECTED_TABLE_NAMESPACE = editorNamespace;
  if (!!!TABLE_STATE[editorNamespace]) TABLE_STATE[editorNamespace] = getDefaultTableState();
  TABLE_STATE[editorNamespace].namespace = editor._config.namespace;
  if (DEPRECATED_$isGridSelection(selection)) {
    TABLE_STATE[editorNamespace].selection = selection;
    if (TABLE_STATE[editorNamespace]?.activeCell){ 
      handleTableActionButtonBlur(); 
      (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
    }

    const anchorKey = selection.anchor.key;
    const anchorNode = $getNodeByKey(anchorKey);
    if (anchorNode) {
      if ($isTableCellNode(anchorNode)) {
        if (TABLE_STATE[editorNamespace]) {
          TABLE_STATE[editorNamespace].activeCell = anchorNode;
          if (editor.isEditable()) (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(true);
        }
      }
    }
    

    var backgroundColorCell:undefined|string = undefined;
    var canAddRowHeader = false;
    var canAddColHeader = false;
    var canRemoveColHeader = false;
    var canRemoveRowHeader = false;
    var caption: string|undefined = undefined;
    var bandedRows: boolean = false;
    var bandedCols: boolean = false;
    var canDeleteColumn: boolean = true;

    const rowIndexes = new Set<number>();
    const colIndexes = new Set<number>();
    var table: undefined|TableNode = undefined;
    for (let node of selection.getNodes()) {
      if ($isTableCellNode(node)) {
        if (!!!table) {
          table = $getTableNodeFromLexicalNodeOrThrow(node);
        }
        if (backgroundColorCell!=='transparent') {
          const bgColor = node.getBackgroundColor();
          if (backgroundColorCell===undefined) backgroundColorCell = bgColor ? bgColor : 'transparent';
          else backgroundColorCell = (bgColor===backgroundColorCell) ? backgroundColorCell : 'transparent';
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
        const cellNodesInRow = (firstRow as  TableRowNode).getChildren();
        for (let node of cellNodesInRow) {
          if ($isTableCellNode(node)){
            numCols+=node.getColSpan();
          }
        }
      }
      const lastColIndex = Math.max(0,numCols-1);
      canDeleteColumn = !!!Boolean(colIndexes.has(lastColIndex)&&colIndexes.size>1);
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
              const rowHeader = table.getCellNodeFromCords(0,row,tableSelection.getGrid());
              const colHeader = table.getCellNodeFromCords(col,0,tableSelection.getGrid());
              if (rowHeader) {
                if (!!!canAddRowHeader) canAddRowHeader = Boolean(rowHeader.getTag()!=='th'||rowHeader.getScope()!=='row');
                if (!!!canRemoveRowHeader) canRemoveRowHeader = Boolean(rowHeader.getTag()==='th'&&rowHeader.getScope()==='row');
              }
              if (colHeader) {
                if (!!!canAddColHeader) canAddColHeader = Boolean(colHeader.getTag()!=='th'||colHeader.getScope()!=='col');
                if (!!!canRemoveColHeader) canRemoveColHeader =  Boolean(colHeader.getTag()==='th'&&colHeader.getScope()==='col');
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
    const { rows, columns } = computeSelectionCount(selection);
    TABLE_STATE[editorNamespace].rows = rows;
    TABLE_STATE[editorNamespace].columns = columns;
    TABLE_STATE[editorNamespace].bandedCols = bandedCols;
    TABLE_STATE[editorNamespace].bandedRows = bandedRows;
    TABLE_STATE[editorNamespace].caption = caption;
    TABLE_STATE[editorNamespace].canDeleteColumn = canDeleteColumn;

  } else if ($isRangeSelection(selection)){
    var newActiveCell:undefined|TableCellNode = undefined;
    const selectionNodes = selection.getNodes();
    for (let node of selectionNodes){
      const tableCellNode = $findMatchingParent(node,(n) => $isTableCellNode(n));
      if ($isTableCellNode(tableCellNode)) {
        newActiveCell = tableCellNode;
        break;
      }
    }
    if (newActiveCell) {
      if (
        TABLE_STATE[editorNamespace]?.activeCell && 
        ((TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).getKey()!==newActiveCell.getKey())
      ) { 
        handleTableActionButtonBlur(); 
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
      }
      if (TABLE_STATE[editorNamespace]) {
        TABLE_STATE[editorNamespace].activeCell = newActiveCell;
      }
      if (editor.isEditable()) {
        handleTableActionButtonBlur(); 
        newActiveCell.setActive(true);
      }
      var backgroundColorCell:undefined|string = undefined;
      var canAddRowHeader = false;
      var canAddColHeader = false;
      var canRemoveColHeader = false;
      var canRemoveRowHeader = false;
      var caption: string|undefined = undefined;
      var bandedRows: boolean = false;
      var bandedCols: boolean = false;
      const rowIndexes = new Set<number>();
      const colIndexes = new Set<number>();
      const rowIndex = $getTableRowIndexFromTableCellNode((TABLE_STATE[editorNamespace]?.activeCell as TableCellNode));
      const colIndex = $getTableColumnIndexFromTableCellNode((TABLE_STATE[editorNamespace]?.activeCell as TableCellNode));
      rowIndexes.add(rowIndex);
      colIndexes.add(colIndex);
      const table = $getTableNodeFromLexicalNodeOrThrow((TABLE_STATE[editorNamespace]?.activeCell as TableCellNode));
      if(table){
        TABLE_STATE[editorNamespace].tableKey = table.getKey();
        bandedCols = table.getBandedCols();
        bandedRows = table.getBandedRows();
        caption = table.getCaption();
        TABLE_STATE[editorNamespace].align = table.getAlign();
        if (tableSelections[editorNamespace]) {
          const tableSelection = tableSelections[editorNamespace].get(table.getKey());
          if (tableSelection) {
            const rowHeader = table.getCellNodeFromCords(0,rowIndex,tableSelection.getGrid());
            const colHeader = table.getCellNodeFromCords(colIndex,0,tableSelection.getGrid());
            if (rowHeader) {
              canAddRowHeader = Boolean(rowHeader.getTag()!=='th'||rowHeader.getScope()!=='row');
              canRemoveRowHeader = !!!canAddRowHeader;
            }
            if (colHeader) {
              canAddColHeader = Boolean(colHeader.getTag()!=='th'||colHeader.getScope()!=='col');
              canRemoveColHeader = !!!canAddColHeader;
            }
          }
        }
      }
      TABLE_STATE[editorNamespace].rectangular = Boolean((TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).getRowSpan()===(TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).getColSpan());
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
      if (TABLE_STATE[editorNamespace]?.activeCell){ 
        handleTableActionButtonBlur(); 
        (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
      }
      clearTableState(editorNamespace);
    }
  } else {
    if (TABLE_STATE[editorNamespace]?.activeCell){ 
      handleTableActionButtonBlur(); 
      (TABLE_STATE[editorNamespace]?.activeCell as TableCellNode).setActive(false);
    }   
  }
  setLaunchTableMenuListeners(editorNamespace);
}


export function $setActiveCell(editor:LexicalEditor,cell:TableCellNode,) {
  if (TABLE_STATE[editor._config.namespace].activeCell) {
    TABLE_STATE[editor._config.namespace].activeCell?.setActive(false);
    cell.setActive(true);
    TABLE_STATE[editor._config.namespace].activeCell = cell;
  }
}
function getOnOpenEditTableDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="edit-table-lexical") {
      const editTableForm = document.getElementById('lexical-edit-table-form') as HTMLFormElement|null;
      const editTableIncludeCaption = document.getElementById('edit-table-include-caption') as HTMLInputElement|null;
      if (editTableIncludeCaption) editTableIncludeCaption.addEventListener('change',handleEditTableIncludeCaptionChange);
      if (editTableForm) {
        editTableForm.addEventListener('submit',handleEditTableFormSubmit,true);
      }
      const dialog = document.getElementById('edit-table-lexical');
      document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
}
function getOnOpenEditTableCellDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="lexical-table-cell-bg") {
      const editCellsForm = document.getElementById('lexical-edit-bg-color-form') as HTMLFormElement|null;
      if (editCellsForm) {
        editCellsForm.addEventListener('submit',handleChangeCellsFormSubmit);
        editCellsForm.addEventListener('reset',handleChangeCellsFormReset)
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
      if(editor&&borderColor&&transparentBorder&&borderStyle&&borderWidth&&verticalAlign&&colorInput&&transparentInput&&form) {    
        const canChangeColor = getNoColor(editor);
        if (!!!canChangeColor) form.setAttribute('disabled','');
        else form.removeAttribute('disabled');
        const id = editor._config.namespace;
        if (TABLE_STATE[id].selection&&editor) {
          editor.getEditorState().read(() => {
            const nodes = (TABLE_STATE[id].selection as GridSelection).getNodes();
            var bgColor:null|string|undefined = undefined;
            var border:null|undefined|string  = null;
            var verticalAlignVal:null|undefined|string  = null;
            for (let node of nodes) {
              if ($isTableCellNode(node)) {
                const nodeBgColor = node.getBackgroundColor();
                const nodeBorder = node.getBorder();
                const nodeVerticalAlign = node.getVerticalAlign();
                if (bgColor===undefined) bgColor = nodeBgColor; 
                else if (bgColor!==nodeBgColor) bgColor = null;
                if (border===null) border = nodeBorder;
                else if (border!==nodeBorder) border = undefined;
                if (verticalAlign===null) verticalAlignVal = nodeVerticalAlign;
                else if (verticalAlignVal!==nodeVerticalAlign) verticalAlignVal = undefined;
              }
            }
            // Set the form inputs
            const backgroundColor = getDefaultBackground();
            colorInput.value = !!!bgColor ? backgroundColor : bgColor;
            transparentInput.checked=!!!bgColor;
            const defaultVerticalAlign = !!!verticalAlign ? 'middle' : verticalAlign;
            Array.from(form.querySelectorAll<HTMLInputElement>('input[name="table-cell-vertical-align"]'))
            .forEach((input) => {
              if (input.value!==defaultVerticalAlign) input.checked=false;
              else input.checked=true;
            })
            if (border) {
              const { width, color, style } = parseBorderStr(border);
              const defaultBorder = getDefaultTextColor();
              borderColor.value=color ? color : defaultBorder;
              transparentBorder.checked=!!!color;
              setSelectInput(borderStyle,style?style:'none',style?style[0].toUpperCase().concat(style.slice(1)):'None');
              borderWidth.value = !!!isNaN(width as any)?(width as number).toFixed(0):'0';
            } else {
              const defaultBorder = getDefaultTextColor();
              borderColor.value=defaultBorder;
              transparentBorder.checked=true;
              setSelectInput(borderStyle,'none','None');
              borderWidth.value = '0';
            }
          });
        } else if (TABLE_STATE[id]?.activeCell&&editor) {
          editor.getEditorState().read(() => {
            const bgColor = (TABLE_STATE[id]?.activeCell as TableCellNode).getBackgroundColor();
            const border = (TABLE_STATE[id]?.activeCell as TableCellNode).getBorder();
            const verticalAlign = (TABLE_STATE[id]?.activeCell as TableCellNode).getVerticalAlign();
            // Set the form inputs
            const backgroundColor = getDefaultBackground();
            colorInput.value = !!!bgColor ? backgroundColor : bgColor;
            transparentInput.checked=!!!bgColor;
            const defaultVerticalAlign = !!!verticalAlign ? 'middle' : verticalAlign;
            Array.from(form.querySelectorAll<HTMLInputElement>('input[name="table-cell-vertical-align"]'))
            .forEach((input) => {
              if (input.value!==defaultVerticalAlign) input.checked=false;
              else input.checked=true;
            })
            if (border) {
              const { width, color, style } = parseBorderStr(border);
              const defaultBorder = getDefaultTextColor();
              borderColor.value=color ? color : defaultBorder;
              transparentBorder.checked=!!!color;
              setSelectInput(borderStyle,style?style:'none',style?style[0].toUpperCase().concat(style.slice(1)):'None');
              borderWidth.value = !!!isNaN(width as any)?(width as number).toFixed(0):'0';
            } else {
              const defaultBorder = getDefaultTextColor();
              borderColor.value=defaultBorder;
              transparentBorder.checked=true;
              setSelectInput(borderStyle,'none','None');
              borderWidth.value = '0';
            }
          });
        }
      }
      const dialog = document.getElementById('lexical-table-cell-bg');
      if (dialog) document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
}
var UPLOAD_CURRENT_FILE:File|null = null;
function getOnOpenTablesLexical(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="tables-lexical") {
      const mainTableForm = getTableForm();
      if (mainTableForm && mainTableForm.form) {
        if(mainTableForm.captionInput) mainTableForm.captionInput.addEventListener('input',handleTableFormChange);
        mainTableForm.form.addEventListener('change',handleTableFormChange);
        mainTableForm.form.addEventListener('submit',handleTableFormSubmit);
        mainTableForm.form.addEventListener('reset',handleTableFormReset);
        mainTableForm.form.dispatchEvent(new Event('change'));
      } 
      const uploadTableFrom = getUploadTableForm();
      if (uploadTableFrom && uploadTableFrom.form) {
        if (uploadTableFrom.fileUpload) uploadTableFrom.fileUpload.addEventListener('change',handleUploadData);
        if (uploadTableFrom.form) {
          if(uploadTableFrom.captionInput)uploadTableFrom.captionInput.addEventListener('input',handleUploadTableFormChange);
          uploadTableFrom.form.addEventListener('change',handleUploadTableFormChange);
          uploadTableFrom.form.addEventListener('submit',handleUploadTableFormSubmit);
          uploadTableFrom.form.addEventListener('reset',handleTableFormReset);
        }
      }
      if (UPLOAD_CURRENT_FILE) {
        const tabButton = document.getElementById("create_table_from_upload_lexical");
        if (tabButton) {
          tabButton.dispatchEvent(new Event("click"));
          const input = document.getElementById("upload-data-to-table") as HTMLInputElement|null;
          if (input) {
            input.files = getFileListForFileInput([UPLOAD_CURRENT_FILE]);
            UPLOAD_CURRENT_FILE = null;
            input.dispatchEvent(new Event("change"));
          }
        }
      }
      const dialog = document.getElementById('tables-lexical');
      if (dialog) document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
}

function hideOpenPopovers() {
  Object.keys(autoUpdateObject)
  .forEach((key) => {
    try {
      autoUpdateObject[key]();
      delete autoUpdateObject[key];
      handleTableActionButtonBlur();
    } catch (e) {}
  })
}

function registerTableEditableListeners(editor:LexicalEditor) {
  document.addEventListener('HIDE_OPEN_POPOVERS',hideOpenPopovers);
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
  if (wrapper) wrapper.addEventListener('focusout',handleFocusOut,true);
  const menu = document.getElementById(TABLE_ACTION_MENU_ID);
  if (menu) menu.addEventListener('focusin',handleTableActionMenuFocusIn);
}
export function registerTableEditable(editor: LexicalEditor) {
  const editorNamespace = editor._config.namespace;
  if (editor.hasNodes([TableCellNode,TableNode,TableRowNode,TableWrapperNode,CellParagraphNode])) {
    registerTableEditableListeners(editor);
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenEditTableDialog)
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenEditTableCellDialog)
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenTablesLexical)
    
    setTableActionMenuButtonsListeners();
    if (editor.isEditable()) {
      editor.getEditorState().read(() => {
        const tableNodes = $nodesOfType(TableNode);
        tableNodes.forEach((node) => {
          if (!!!$isTableWrapperNode(node.getParent())) $wrapNodeInElement(node,$createTableWrapperNode);
          initializeTableNode(editor,node);
        })
      })
    }
    return mergeRegister(
      editor.registerCommand(
        INSERT_TABLE_COMMAND,
        ({ rows, columns, includeHeaders, caption, bandedRows, bandedCols, align}) => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders,
            caption,
            bandedRows,
            bandedCols,
            align
          );
          const wrapper = $createTableWrapperNode();
          $insertNodeToNearestRoot(wrapper);
          wrapper.append(tableNode)
          const firstDescendant = tableNode.getFirstDescendant();
          if ($isTextNode(firstDescendant)) {
            firstDescendant.select();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        INSERT_TABLE_COMMAND_WITH_DATA,
        ({ rows, columns, includeHeaders, caption, bandedRows, bandedCols, align, json }) => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders,
            caption,
            bandedRows,
            bandedCols,
            align
          );
          const rowNodes = tableNode.getChildren();
          for (let i = 0; i < rowNodes.length;i++) {
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
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(
        TableNode,
        (nodeMutations) => {
          for (const [nodeKey, mutation] of nodeMutations) {
            if (mutation === 'created') {
              editor.getEditorState().read(() => {
                const tableNode = $getNodeByKey<TableNode>(nodeKey);
                if ($isTableNode(tableNode)) {
                  if (!!!$isTableWrapperNode(tableNode.getParent())) $wrapNodeInElement(tableNode,$createTableWrapperNode);
                  initializeTableNode(editor,tableNode);
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
                  const tableNode = $getNodeByKey<TableNode>(nodeKey);
                  if ($isTableNode(tableNode)) {
                    initializeTableNode(editor,tableNode);
                  }
                });
              }
            }
          }
        }
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $onTableSelectionChange(editor);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        (formatType) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: FORMAT_TEXT_COMMAND, name: 'FORMAT_TEXT_COMMAND', formatType});
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        FORMAT_ELEMENT_COMMAND,
        (elementFormat) => {
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
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        TEXT_COLOR_CHANGE,
        (color) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: TEXT_COLOR_CHANGE, name: 'TEXT_COLOR_CHANGE', color});
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        BACKGROUND_COLOR_CHANGE,
        (color) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: BACKGROUND_COLOR_CHANGE, name: 'BACKGROUND_COLOR_CHANGE', color});
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        MAKE_TRANSPARENT,
        (payload) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: MAKE_TRANSPARENT, name: 'MAKE_TRANSPARENT', payload});
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CLEAR_TEXT_FORMATTING,
        () => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: CLEAR_TEXT_FORMATTING, name: 'CLEAR_TEXT_FORMATTING' });
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        FONT_FAMILY_CHANGE,
        (fontFamily) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: FONT_FAMILY_CHANGE, name: 'FONT_FAMILY_CHANGE', fontWithSemiColon: fontFamily });
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        FONT_WEIGHT_CHANGE,
        (fontWeight) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: FONT_WEIGHT_CHANGE, name: 'FONT_WEIGHT_CHANGE', fontWeight });
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        FONT_SIZE_CHANGE,
        (fontSize) => {
          const selection = $getSelection();
          if (DEPRECATED_$isGridSelection(selection)) {
            return $handleDispatchCommandOnGridSelection(editor,selection,{ command: FONT_SIZE_CHANGE, name: 'FONT_SIZE_CHANGE', fontSize });
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAG_DROP_PASTE,
        (files) => { 
          if (files.length) {
            const file = files[0];
            if (file.type==="text/csv"||file.type==="application/vnd.ms-excel"||file.type==="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
              UPLOAD_CURRENT_FILE = file;
              const dialog = document.getElementById("tables-lexical") as HTMLDivElement|null;
              if (dialog) {
                openDialog(dialog);
                return true;
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      registerTableNotEditableListener(editor),
      editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,() => {
        registerTableEditableListeners(editor);
        return false;
      },COMMAND_PRIORITY_EDITOR)
    );
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
export function registerTableNotEditableListener(editor:LexicalEditor) {
  const editorNamespace = editor._config.namespace;
  return mergeRegister(
    editor.registerEditableListener((isEditable) => {
      const editorNamespace = editor._config.namespace;
      if (TABLE_STATE[editorNamespace]&&!!!isEditable) {
        clearTableState(editorNamespace);
      }
      if(isEditable) {
        editor.update(() => {
          const tableCellNodes = $nodesOfType(TableCellNode);
          tableCellNodes.forEach((cell) => {
            cell.setCanResize(true);
          })
        });
      } else  {
        editor.update(() => {
          const tableCellNodes = $nodesOfType(TableCellNode);
          tableCellNodes.forEach((cell) => {
            cell.setCanResize(false);
          })
        });
      }
    }),
    editor.registerCommand(
      SET_EDITOR_COMMAND,
      (newEditorNamespace: string) => {
        if(TABLE_STATE[editorNamespace] && newEditorNamespace!==editorNamespace){
          clearEditorTableSelection(editorNamespace);
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    function () {
      if (tableSelections[editorNamespace]) {
        tableSelections[editorNamespace].forEach((value,key) => value.removeListeners());
      }
      delete TABLE_STATE[editorNamespace];
    },
    function () {
      if (RECENT_JSON && RECENT_JSON.editorNamespace===editor._config.namespace) RECENT_JSON = undefined;
    },
  )
}

