import { Request, Response } from 'express';
import csvtojsonV2 from "csvtojson";
import * as XLSX from 'xlsx';
import { getErrorAlert, getErrorSnackbar } from '../html';
import escapeHTML from 'escape-html';
import { JSDOM } from 'jsdom';
import { json2csv } from 'json-2-csv';


/**
 * Parse table json resulting from parsing excel / csv file
 * @param json 
 * @param excel 
 * @returns 
 */
export function parseTableJSON(json:{[key: string]: string}[],excel:boolean=false,maxLength:boolean=true) {
  try {
    const arr:string[][] = [];
    var keysOrig: string[] = [];
    if (maxLength) {
      keysOrig = Object.keys(json[0] as any).slice(0,50);
    } else {
      keysOrig =  Object.keys(json[0] as any);
    }
    const keysSet = new Set(keysOrig);
    const keyToIndex:{[ind:string]:number} = {};
    keysOrig.forEach((key,i) => {
      keyToIndex[key] = i;
    })
    arr.push(Array.from(keysSet));
    if (maxLength) {
      for (let i=0;i<json.length&&i<50;i++) {
        const tempArr = new Array(keysSet.size);
        tempArr.fill(0);
        const rowKeys = Object.keys(json[i]).slice(0,50);
        for (let j = 0; j < rowKeys.length; j++) {
          if (keysSet.has(rowKeys[j])) {
            tempArr[keyToIndex[rowKeys[j]]] = String(json[i][rowKeys[j]]);
          }
        }
        arr.push(tempArr);
      }
    } else {
      for (let i=0;i<json.length;i++) {
        const tempArr = new Array(keysSet.size);
        tempArr.fill(0);
        const rowKeys = Object.keys(json[i]);
        for (let j = 0; j < rowKeys.length; j++) {
          if (keysSet.has(rowKeys[j])) {
            tempArr[keyToIndex[rowKeys[j]]] = String(json[i][rowKeys[j]]);
          }
        }
        arr.push(tempArr);
      }
    }
    
    return arr;
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong parsing the json for generating lexical table from csv / excel file.');
  }
}
/**
 * Get HTML version of table that should be output inside the <output> element of the form
 * @param arr 
 * @param obj 
 * @returns 
 */
function getHTMLTable(arr:string[][],obj:GenerateTableHTML) {
  var className = "rte-table";
  if (obj.bandedRows) className+=' banded-row';
  if (obj.bandedCols) className+= ' banded-col';
  var str = /*html*/`<table class="rte-table" cellspacing="0" style="margin: 10px auto !important;">`;
  if (obj.includeCaption) {
    str+=/*html*/`<caption>${escapeHTML(obj.caption)}</caption>`;
  }
  for (let i=0;i<arr.length;i++) {
    str+=/*html*/`<tr class="thead">`;
    for (let j=0;j<arr[i].length;j++) {
      if (i===0&&j===0&&(obj.headingColumn||obj.headingRow)) {
        str+=/*html*/`<th scope="col" class="rte-tableCell rte-tableCellHeader" style="text-align:center;">${escapeHTML(arr[i][j])}</th>`;
      } else if (j===0&&obj.headingColumn) {
        str+=/*html*/`<th scope="row" class="rte-tableCell rte-tableCellHeader" style="text-align:center;">${escapeHTML(arr[i][j])}</th>`;
      } else if (i===0&&obj.headingRow) {
        str+=/*html*/`<th scope="col" class="rte-tableCell rte-tableCellHeader" style="text-align:center;">${escapeHTML(arr[i][j])}</th>`;
      } else str+=/*html*/`<td class="rte-tableCell text-align-center">${escapeHTML(arr[i][j])}</td>`;
    }
    str+=/*html*/`</tr>`;
  }
  str+=/*html*/`</table>`;
  return str;
}

type GenerateTableHTML = {
  headingRow: boolean,
  headingColumn: boolean,
  bandedRows: boolean,
  bandedCols: boolean,
  includeCaption: boolean,
  caption: string
};

export async function generateJsonFromCsvExcel(file:Express.Multer.File) {
  const type = file.mimetype;
  if (type.endsWith('/csv')) {
    const json = await new Promise<{[key: string]: string}[]>((resolve,reject) => {
      csvtojsonV2()
      .on('error',(err) => {
        console.error('error');
        reject(err);
      })
      .fromString(file.buffer.toString())
      .then((csvJSON) => {
        resolve(csvJSON);
      })
    }); 
    return {json, fileType:'csv'};
  } else if (type.endsWith('.sheet')||type.endsWith('.ms-excel')||type.endsWith('.xlsx')||type.endsWith('.xls')) {
    const workbook = XLSX.read(file.buffer,{type:"buffer"});
    const sheet_name_list = workbook.SheetNames;
    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]) as {[key: string]: string}[];
    return {json, fileType:'excel'};
  } else {
    throw new Error('Unrecognized file type.');
  }
}

export async function lexicalTable(req:Request,res:Response){
  try{
    const headingRow = Boolean(req.body['lexical-table-include-heading-row-upload']);
    const headingColumn = Boolean(req.body['lexical-table-include-heading-column-upload']);
    const bandedRows = Boolean(req.body['lexical-table-banded-rows-upload']);
    const bandedCols = Boolean(req.body['lexical-table-banded-cols-upload']);
    const includeCaption = Boolean(req.body['lexical-table-include-caption-upload']);
    const caption = req.body['lex-table-caption-input-upload'] || '';
    const formObj = {headingRow,headingColumn,bandedRows,bandedCols,includeCaption,caption};
    const file = req.file as Express.Multer.File|undefined;
    if (!!!file) throw new Error('File does not exist.');
    if (file) {
      const {json, fileType} = await generateJsonFromCsvExcel(file);
      const arr = parseTableJSON(json,fileType==='excel',true);
      const html = getHTMLTable(arr,formObj);
      return res.status(200).send({ json: arr, html});
    } else throw new Error('File does not exist.');
  } catch (error){
    console.error(error);
    return res.status(400).json({ html: getErrorSnackbar('Something went wrong creating a table from the uploaded file. ')});
  }
}

export async function getTableHTML(req:Request,res:Response) {
  try{
    const headingRow = Boolean(req.body['lexical-table-include-heading-row-upload']);
    const headingColumn = Boolean(req.body['lexical-table-include-heading-column-upload']);
    const bandedRows = Boolean(req.body['lexical-table-banded-rows-upload']);
    const bandedCols = Boolean(req.body['lexical-table-banded-cols-upload']);
    const includeCaption = Boolean(req.body['lexical-table-include-caption-upload']);
    const caption = req.body['lex-table-caption-input-upload'] || req.body['lex-table-caption-input-upload-2'];
    const formObj = {headingRow,headingColumn,bandedRows,bandedCols,includeCaption,caption};
    const file = req.file as Express.Multer.File|undefined;
    if (!!!file) throw new Error('File does not exist.');
    if (file) {
      const {json, fileType} = await generateJsonFromCsvExcel(file);
      const arr = parseTableJSON(json,fileType==='excel',false);
      const html = getHTMLTable(arr,formObj);
      const copyHTML = /*html*/`
<div class="flex-row justify-end mt-2">
  <button data-snackbar data-selem="#copied-table-success" data-click  data-copy-el data-el="#get-table-output" data-inner type="button" class="icon-text filled medium info" aria-label="Copy Output">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
  COPY OUTPUT
  </button>
</div>
<div id="copied-table-success" class="snackbar success" aria-hidden="true" role="alert" data-snacktime="4000">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableView"><path d="M19 7H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 2v2H9V9h10zm-6 6v-2h2v2h-2zm2 2v2h-2v-2h2zm-4-2H9v-2h2v2zm6-2h2v2h-2v-2zm-8 4h2v2H9v-2zm8 2v-2h2v2h-2zM6 17H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1h-2V5H5v10h1v2z"></path></svg>
  <p class="p-sm">Successfully copied table to clipboard!</p>
  <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
  </button>
</div>

<div id="get-table-output" class="table-wrapper">
  ${html}
</div>
      `;
      return res.status(200).send(copyHTML);
    } else throw new Error('File does not exist.');
  } catch (error){
    console.error(error);
    return res.status(400).json(getErrorSnackbar('Something went wrong creating a table from the uploaded file. '));
  }
}
export function parseHTMLTable(table:HTMLTableElement) {
  var column_count = 0;
  const rows = Array.from(table.querySelectorAll('tr')) as HTMLTableRowElement[];
  const rows_count = rows.length;
  var arr:string[][] = [];
  for (let i=0; i<rows.length; i++) {
    const tds = Array.from(rows[i].querySelectorAll('td, th')) as HTMLTableCellElement[];
    if (i===0) {   
      for (let j=0; j<tds.length && j < 100; j++) {
        const cell = tds[j];
        const colSpan = cell.getAttribute('colspan');
        if (Number.isInteger(parseInt(String(colSpan)))) {
          column_count+=parseInt(String(colSpan));
        } else {
          column_count+=1;
        }
      }
      for (let j=0; j < rows_count; j++) {
        const subArr:string[] = [];
        for (let k = 0; k < column_count; k++) {
          subArr.push('');
        }
        arr.push(subArr);
      }
    }
    for (let j=0; j<tds.length && j < column_count; j++) {
      const cell = tds[j];
      const colSpan = cell.getAttribute('colspan');
      const rowSpan = cell.getAttribute('rowspan');
      const cells_to_fill: [number,number][] = [];
      var colspan = 1;
      var rowspan = 1;
      if (Number.isInteger(parseInt(String(colSpan)))) {
        colspan = parseInt(String(colSpan));
      }
      if (Number.isInteger(parseInt(String(rowSpan)))) {
        rowspan = parseInt(String(rowSpan));
      }
      for (let k = 0; k < rowspan; k++) {
        for (let l = 0; l < colspan; l++) {
          cells_to_fill.push([i+k,j+l]);
          try {
            arr[i+k][j+l] = cell.innerHTML.trim();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  }
  return arr;
}
export function tableToCsvAndJson(tableHTMLStr:string) {
  try {
    const dom = new JSDOM(tableHTMLStr);
    const table = dom.window.document.querySelector('table');
    var numOfCols = 0;
    var numOfRows = 0;
    if (!!!table) throw new Error('Unable to find the table from the input.');
    const rows = Array.from(table.querySelectorAll('tr'));
    if (!!!rows.length) throw new Error('Unable to find any rows in the input.');
    const columnsLengthPre = Array.from(rows[0].querySelectorAll('th, td')) as HTMLTableCellElement[];
    const rowsLengthPre = rows.map((row) => Array.from(row.querySelectorAll('th, td'))).filter((el) => el.length) as HTMLTableCellElement[][];
    if (!!!columnsLengthPre.length||!!!rowsLengthPre.length) throw new Error('There is no data to convert to CSV / JSON.');
    const headers:string[] = [];
    columnsLengthPre.forEach((el) => {
      const colspan = el.getAttribute('colspan');
      const innerText = el?.textContent?.trim() || '';
      if (!!!colspan) {
        headers.push(innerText);
        numOfCols += 1;
      }
      else {
        const colspanNum = parseInt(colspan);
        if (!!!isNaN(colspanNum)&&isFinite(colspanNum)) {
          numOfCols += colspanNum;
          for (let i = 0; i < colspanNum; i++) {
            headers.push(innerText);
          }
        } else {
          numOfCols += 1;
          headers.push(innerText);
        }
      }
    });
    rowsLengthPre.forEach((arr) => {
      var min_row_span = 1;
      for (let cell of arr) {
        const rowspan = cell.getAttribute('rowspan');
        if (!!!rowspan) min_row_span = 1;
        else {
          const rowspanNum = parseInt(rowspan);
          if (!!!isNaN(rowspanNum)&&isFinite(rowspanNum)) {
            min_row_span = Math.min(rowspanNum,min_row_span);
          } else {
            min_row_span = 1;
          }
        }
      }
      numOfRows += min_row_span
    });
    const rowToCopy = Array(numOfCols).fill(undefined);
    if (headers.length!==rowToCopy.length) throw new Error('Something went wrong getting getting the headers / rows.');
    const data:(string|undefined)[][] = [];
    for (let i = 0; i < numOfRows; i++) {
      data.push(structuredClone(rowToCopy));
    }    
    let currRow = 1;
    while (currRow < numOfRows) {
      if (rows[currRow]) {
        const cells = Array.from(rows[currRow].querySelectorAll('th, td')) as HTMLTableCellElement[];
        var currCol = 0;
        var currColIndex = 0;
        var min_row_span:undefined|number = undefined;
        if (cells.length) {
          var LEN = cells.length;
          while (data[currRow][currCol]!==undefined) currCol+=1;
          while (currColIndex < LEN) {
            var colspan:number|undefined = undefined, rowspan: number|undefined = undefined;
            const innerText = cells[currColIndex]?.textContent?.trim() || undefined;
            const colspanPre = cells[currColIndex].getAttribute('colspan');
            if (colspanPre) {
              const colspanPre2 = parseInt(colspanPre);
              if (!!!isNaN(colspanPre2)&&isFinite(colspanPre2)) {
                colspan = colspanPre2;
              }
            }
            if (!!!colspan) colspan = 1;
            const rowspanPre = cells[currColIndex].getAttribute('rowspan');
            if (rowspanPre) {
              const rowspanPre2 = parseInt(rowspanPre);
              if (!!!isNaN(rowspanPre2)&&isFinite(rowspanPre2)) {
                rowspan = rowspanPre2;
              }
            }
            if (!!!rowspan) rowspan = 1;
            min_row_span = cells.length===1 ? rowspan : 1;
            for (let j = currRow; j < currRow+rowspan; j++) {
              for (let i = currCol; i < currCol+colspan; i++) {
                data[j][i] = innerText;
              }
            }
            currCol+=colspan;
            currColIndex+=1;
          }
        }
        currCol=0;
        currColIndex=0;
        currRow+=min_row_span ? min_row_span : 1;
      } else {
        currRow+=1;
      }
    }
    var json:{[index: string]: (string|null)}[] = [];
    for (let i = 0; i < data.length; i++) {
      const obj:{[index:string]:(string|null)} = {};
      for (let j = 0; j < data[i].length; j++) {
        obj[headers[j]] = data[i][j]===undefined ? null : data[i][j] as string|null;
      }
      json.push(obj);
    }
    json = json.slice(1);
    const csv = json2csv(json);
    return { csv, json };
  } catch (error) {
    console.error(error);
    throw new Error('Unable to convert HTML Table to CSV and JSON.');
  }
}
export async function tableToCsvAndJsonApiRoute(req:Request,res:Response) {
  try {
    const table = req.body['html-table-input'];
    if (typeof table!=='string' || table.length<1) throw new Error('Invalid table input for converting HTML Table to CSV and JSON.');
    const { csv, json } = tableToCsvAndJson(table)
    const resp = /*html*/`
<div style="border: 2px solid var(--primary); border-radius: 0.5rem;">
  <div class="flex-row justify-between mt-1">
    <button data-snackbar data-selem="#coped-csv-clip" data-copy-el data-el="#html-table-json-out-res" data-inner data-click type="button" class="icon-text medium filled secondary">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Javascript"><path d="M12 14v-1h1.5v.5h2v-1H13c-.55 0-1-.45-1-1V10c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1h-1.5v-.5h-2v1H16c.55 0 1 .45 1 1V14c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1zM9 9v4.5H7.5v-1H6v1c0 .83.67 1.5 1.5 1.5H9c.83 0 1.5-.67 1.5-1.5V9H9z"></path></svg>
      COPY CSV
    </button>

    <button data-snackbar data-selem="#coped-json-clip" data-copy-el data-el="#html-table-csv-out-res" data-inner data-click type="button" class="icon-text medium filled info">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableChart"><path d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"></path></svg>
      COPY JSON
    </button>
  </div>
  <div id="coped-json-clip" class="snackbar success" aria-hidden="true" role="alert" data-snacktime="4000">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Javascript"><path d="M12 14v-1h1.5v.5h2v-1H13c-.55 0-1-.45-1-1V10c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1h-1.5v-.5h-2v1H16c.55 0 1 .45 1 1V14c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1zM9 9v4.5H7.5v-1H6v1c0 .83.67 1.5 1.5 1.5H9c.83 0 1.5-.67 1.5-1.5V9H9z"></path></svg>
    <p class="p-sm">Successfully copied JSON to clipboard!</p>
    <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div>

  <details aria-label="JSON Output for HTML Table" class="mt-2">
    <summary>
      <span class="h6 fw-regular">JSON</span>
      <svg class="details" focusable="false" inert viewBox="0 0 24 24">
        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
        </path>
      </svg>
    </summary>
    <div class="accordion-content hz-scroll" style="overflow: auto;" aria-hidden="true">
  <pre style="font-family: monospace;"   id="html-table-json-out-res">
  ${JSON.stringify(json,null,' ')}
  </pre>
  </div>
  </details>

  <div id="coped-csv-clip" class="snackbar success" aria-hidden="true" role="alert" data-snacktime="4000">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableChart"><path d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"></path></svg>
    <p class="p-sm">Successfully copied CSV to clipboard!</p>
    <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div>
  <details aria-label="CSV Output for HTML Table" class="mt-2">
    <summary>
      <span class="h6 fw-regular">CSV</span>
      <svg class="details" focusable="false" inert viewBox="0 0 24 24">
        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
        </path>
      </svg>
    </summary>
    <div class="accordion-content" aria-hidden="true">
  <pre style="font-family: monospace;" id="html-table-csv-out-res">
  ${csv}
  </pre>
  </div>
  </details>
</div>
`;
    return res.status(200).send(resp);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Unable to generate CSV and JSON from file.'));
  }
}

