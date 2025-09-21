/**
 * 1. First Execute the below command where notebook.ipynb is the path to the jupyter notebook
 * - jupyter nbconvert --execute --to html notebook.ipynb
 * 2. Get the path to the output html file
 * 3. 
 * @author {Frank Brown}
 */
import { Request, Response } from 'express';
import fs from 'fs';
import getDatabase from '../../database';
import { escape } from 'html-escaper';
import * as TIME from '../../utils/time';
import { uploadImageObject } from '../../aws/aws-implementation';
import crypto from 'node:crypto';
import { getTableOfContentsFromMarkdownHTML, parseMarkdown, purifyAndUpdateJupyterNotebookMarkdownHTML, renderMarkdownCode } from '../functions/markdown';
import hljs from 'highlight.js';
import { Breadcrumbs, SEO, TableOfContentsItem } from '../../types';
import sizeOf from 'buffer-image-size';
import { redirect } from '../helper_functions/redirect-override';
import { getErrorAlert, getErrorSnackbar, getSuccessAlert, getWarningAlert } from '../html';
import { getRequiredVariables } from '../helper_functions/frontendHelper';
import { GET_ARTICLE_PREVIEWS, getOrderBy, isReOrderRequest, renderJupyterPreview, updateTocOnReOrderScript } from './article_helpers/handleArticlePreview';
import { renderArticlesMonthYears } from './articleHelpers';
import { handleImageUpload150_75 } from '../../utils/image';
import { getArticleComments, getCommentsRequiredVariables, getJupyterNotebookAndLikesAndViews, gettingCommentsRequest } from './article_helpers/handleArticleData';
import path from 'node:path';
import filenamify from 'filenamify';
import { uploadPageImageFromUrl } from './projects';

const INSERT_INTO_NOTEBOOK = /*sql*/`INSERT INTO jupyter_notebooks (
  notebook, 
  html,
  title,
  description,
  keywords,
  table_of_contents,
  date_created,
  image_url
) VALUES (
  $1::TEXT,
  $2::TEXT,
  $3::TEXT,
  $4::TEXT,
  $5::TEXT[],
  $6::jsonb[],
  $7::bigint,
  $8
) RETURNING id;`;
const GET_NOTEBOOK_PREVIEWS = /*sql*/`SELECT id, title, description, date_created, image_url FROM jupyter_notebooks ORDER BY date_created DESC;`;
const DELETE_NOTEBOOK = /*sql*/`WITH rte_1 AS (
  DELETE FROM jupyter_notebooks WHERE id=$1
) ${GET_NOTEBOOK_PREVIEWS}`;
const NOTEBOOKS_CACHE_KEY = 'fmb-ipynbs';
const GET_NOTEBOOK_CACHE_KEY = (id:string) => `fmb-ipynb-${id}`;

type NotebookPreview = {
  id:string,
  title:string,
  description:string,
  date_created:string,
  image_url: string
}
type NotebookType = {
  id:string,
  html:string,
  title:string,
  description:string,
  date_created:string,
  table_of_contents: TableOfContentsItem[],
  keywords: string[],
  image_url: string
}

/* -------------------------------------------------------------------------- Create Notebooks ----------------------------------------- */
type StdOutOutput = {
  text: string[],
  name:'stdout',
  output_type: 'stream'
}
type StdErrOutput = {
  text: string[],
  name:'stderr',
  output_type: 'stream'
}
type ExecuteResultOutput = {
  data: {
    'text/plain': string[],
    'image/png'?: string
  },
  metadata: {},
  output_type:'execute_result'
}
type DisplayDataOutput = {
  data: {
    'text/plain': string[],
    'image/png'?: string
  },
  metadata: {},
  output_type:'display_data'
}
type OutputType = StdOutOutput|StdErrOutput|ExecuteResultOutput|DisplayDataOutput;
type CodeCell = {
  cell_type: 'code',
  execution_count: number,
  metadata: {},
  outputs: OutputType[],
  source: string[]
}
type MarkdownCell = {
  cell_type:'markdown',
  metadata: {},
  source: string[],
}

function getJupyterImageMetadata(body: Buffer) {
  // @ts-ignore
  const res = sizeOf(Buffer.from(body));
  return {
    width: res.width,
    height: res.height,
    type: res.type
  }
}



async function handleImageUpload(str:string) {
  const buffer = Buffer.from(str, 'base64');
  const metadata = getJupyterImageMetadata(buffer);
  const imageKey = 'frankmbrown/img_'.concat(crypto.randomUUID()).concat('.png');
  const image_url = await uploadImageObject(imageKey,buffer,'png',{...metadata, width: String(metadata.width), height: String(metadata.height) },3,25);
  return /*html*/`<div class="flex-row justify-center align-center" style="margin: 6px 0px;"><img  src="${image_url}" alt="Jupyter Notebook Image" data-update-image /></div>`;
}

const getCellID = (cell_num:number,output:boolean) => {
  return `cell_${cell_num}${output ? '_output' : ''}`;
}

const getOutputHTML = (html:string,num:number) => (/*html*/`<div class="ipynb-output mt-2">
    <div class="flex-row justify-begin align-center">
      <button type="button" class="icon medium" data-state="0" aria-label="Expand or Collapse Output" data-ipynb-button>
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowRight"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
      </button>
      <span style="font-family: monospace; margin-left: 4px;">
        out[${num}]
      </span>
    </div>
    <div class="ipynb-output-inner hz-scroll" data-state="0">${html}</div>
  </div>`)

export async function jupyterNotebookToHTML(notebookStr: string) {
  try {
    const notebookJSON = JSON.parse(notebookStr);
    const table_of_contents:TableOfContentsItem[]=[];
    var html = '';
    var curr_cell = 1;
    for (let cell of notebookJSON.cells as (CodeCell|MarkdownCell)[]) {
      if (cell.cell_type==="code") {
        const codeCell = cell as CodeCell;
        const code = hljs.highlight(codeCell.source.join(''),{ language: 'python' });
        const codeHTML = renderMarkdownCode({ block: true, htmlString: code.value, language: 'python' });
        const codeCellID = getCellID(curr_cell,false);
        html+= /*html*/`<div class="mt-2" id="${codeCellID}">${codeHTML}</div>`;
        table_of_contents.push({id: codeCellID, text: `Code Cell ${curr_cell}`})
        var outputHTML = '';
        for (let output of codeCell.outputs) {          
          if (output.output_type==="stream") {
            const errorText = output.name==="stderr";
            const className = errorText ? "mt-1 t-error fw-regular" : "mt-1";
            const newHTML = /*html*/`<p class="${className}" style="overflow: hidden;" data-no-search>${escape(output.text.join('')).replace(/\n/g,'<br/>')}</p>`;
            outputHTML+=newHTML;
          } else if (output.output_type==="execute_result") {
            var newOutputHTML = /*html*/`<div data-no-search>`;
            if (output.data['image/png']) {
              const newHTML = await handleImageUpload(output.data['image/png']);
              newOutputHTML+=newHTML;
            } 
            if (output.data['text/plain']) {
              const newHTML = /*html*/`<p data-no-search class="mt-1" style="overflow: hidden;">${escape(output.data['text/plain'].join('\n')).replace(/\n/g,'<br/>')}</p>`;
              newOutputHTML+=newHTML;
            } 
            if (newOutputHTML===`<div>`) {
              console.error('Unrecognized Type: ',Object.keys(output.data));
            }
            newOutputHTML+='</div>';
            outputHTML+=newOutputHTML;
          } else if (output.output_type==="display_data") {
            var newOutputHTML = /*html*/`<div>`;
            if (output.data['image/png']) {
              const newHTML = await handleImageUpload(output.data['image/png'])
              newOutputHTML+=newHTML;
            } 
            if (output.data['text/plain']) {
              const newHTML = /*html*/`<p class="mt-1" style="overflow: hidden;">${escape(output.data['text/plain'].join('\n')).replace(/\n/g,'<br/>')}</p>`;
              newOutputHTML+=newHTML;
            } 
            if (newOutputHTML===`<div>`) {
              console.error('Unrecognized Type: ',Object.keys(output.data));
            }
            newOutputHTML+='</div>';
            outputHTML+=newOutputHTML;
          } else {
            console.error('Unrecognized Type: ',Object.keys(output));
          }
        }
        html+=getOutputHTML(outputHTML,curr_cell);
      } else {
        const markdownCell = cell as MarkdownCell;
        const str = markdownCell.source.join('');
        const markdown = await parseMarkdown(str,{design_system:'my-design-system',gfm:true,breaks:true,pedantic:false});
        const tanleOfContents = getTableOfContentsFromMarkdownHTML(markdown,'my-design-system');
        var newHTML = /*html*/`<div>${markdown}</div>`;
        table_of_contents.push(...tanleOfContents.table_of_contents);
        html+=newHTML;
      }
      curr_cell+=1;
    }
    const HTML = await purifyAndUpdateJupyterNotebookMarkdownHTML(html); 
    return {html: HTML, table_of_contents };
  } catch (error) {
    console.error(error);
    throw new Error('Unable to convert jupyter notebook to HTML.')
  }
} 

async function createHTMLFromNotebook({ title, description, date_created, keywords, notebookStr, image_url }:{title:string, description: string, date_created: number, keywords: string[], notebookStr: string, image_url: string },req:Request) {
  // RENDER THE HTML
  try {
    const {html:HTML, table_of_contents} = await jupyterNotebookToHTML(notebookStr);
    const db = getDatabase();
    const dbRes = await db.query(INSERT_INTO_NOTEBOOK,[notebookStr,HTML,title,description,keywords,table_of_contents,date_created,image_url]); 
    const id = dbRes.rows[0].id;
    const notebookPreviewsRes = await getDatabase().query(GET_NOTEBOOK_PREVIEWS);
    const notebookPreviews = notebookPreviewsRes.rows as NotebookPreview[];
    const notebookSetInCache = {
      id, 
      title, 
      description,
      html: HTML,
      date_created,
      table_of_contents,
      keywords,
      image_url
    }
    await Promise.all([
      req.cache.set(NOTEBOOKS_CACHE_KEY,JSON.stringify(notebookPreviews,null,'')),
      req.cache.set(GET_NOTEBOOK_CACHE_KEY(id),JSON.stringify(notebookSetInCache))
    ]);
    return { id, title };    
  } catch (error) {
    console.error(error);
    throw new Error('There was an error creating a new row for the jupyter notebook in the database.')
  }
}

/* ------------------------------------------------ Get Notebook Information From DB ---------------------------------------- */
async function getNotebookPreviewsFromDB(req:Request) {
  try {
    const cacheNotebooks = await req.cache.get(NOTEBOOKS_CACHE_KEY);
    if (cacheNotebooks&&typeof cacheNotebooks==='string') {
      return JSON.parse(cacheNotebooks) as NotebookPreview[];
    } else {
      const jupyterNotebooksPostgres = await getDatabase().query(GET_NOTEBOOK_PREVIEWS);
      const rows = jupyterNotebooksPostgres.rows as NotebookPreview[]; 
      await req.cache.set(NOTEBOOKS_CACHE_KEY,JSON.stringify(rows,null,''));
      return rows;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Unable to get Jupyter notebook previews from databse.')
  }
}
function renderNotebookPreviews(notebookPreviews:NotebookPreview[],req:Request) {
  const arr1 = notebookPreviews.map((obj) => {
    const path = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
    const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_created));
    return  { str: renderJupyterPreview({ ...obj, path, date_created, phone: Boolean(!!!req.session.device?.desktop), image: obj.image_url }), monthYear: TIME.getMonthYearFromUnix(obj.date_created,req.session.settings?.timezone||'America/New_York') };
  });
  const ret = renderArticlesMonthYears(arr1);
  return ret;
}


/*------------------------------------------------ Notebook API Routes From Database ---------------------------------*/

export async function getJupyterNotebooksPage(req:Request,res:Response) {
  try {
    const view = 'pages/jupyter-notebooks'
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Jupyter Notebooks', item: '/jupyter-notebooks', position: 2 }, 
    ];
    const title = "Frank's Jupyter Notebooks";
    const description = "I created this page using nbconvert, my markdown to html system, and highlight.js to keep track of machine learning notes primarily.";
    const keywords = ['Jupyter Notebooks',"Machine Learning","nbconvert","highlight.js","notes"];
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "about-page",
          "text": "About This Page"
      },
      {
        id: "search-notebooks",
        text: "Search Notebooks"
      },
      {
          "id": "jupyter-notebooks",
          "text": "Jupyter Notebooks"
      }
    ];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/jupyter-notebooks'};
    const requiredVariables = getRequiredVariables(req,SEO);
    const order_by = getOrderBy(req);
    if (order_by.order_by_value==="last-edit-new") {
      (order_by as any).order_by_value="date-created-new";
      (order_by as any).order_by_str="Date Created (New)"
    }
    const notebooks = await GET_ARTICLE_PREVIEWS('jupyter_notebooks_id',order_by.order_by_value,req);
    if (isReOrderRequest(req)) {
      return res.status(200).send(notebooks.str.concat(updateTocOnReOrderScript(req)));
    }
    var notebookHTML = notebooks.str;
    requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat(notebooks.toc);
    return res.status(200).render(view,{
      layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
      ...requiredVariables,
      pageObj: {
        jupyterNotebooksList: notebookHTML
      },
      order_by
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/',500,{ severity:'error',message:'Something went wrong getting the jupyter notebooks pages.'});
  }
}
export async function getJupyterNotebook(req:Request,res:Response) {
  try {
    const { id, title } = req.params;
    const view = 'pages/posts/jupyter-notebook';
    const comment_required_variables = getCommentsRequiredVariables(req);
    if (gettingCommentsRequest(req)) {
      return getArticleComments(req,res,comment_required_variables);
    }
    const [article,comments_str] = await Promise.all([getJupyterNotebookAndLikesAndViews(req,id),getArticleComments(req,res,comment_required_variables)]);
    const { 
      html,
      description,
      date_created,
      table_of_contents,
      keywords,
      image_url 
    } = article;
    table_of_contents.push({ id: "comments", text: "Comments" })
    const date_created_string = TIME.getDateTimeStringFromUnix(Number(date_created));
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Jupyter Notebooks', item: '/jupyter-notebooks', position: 2 }, 
    ];
    const path = `/jupyter-notebooks/${encodeURIComponent(id)}/${encodeURIComponent(title)}`
    breadcrumbs.push({ name: title, item: path, position: 3 });
    const SEO: SEO = {breadcrumbs, image: image_url, keywords, title, description, tableOfContents: table_of_contents, path: '/jupyter-notebooks'};
    const requiredVariables = getRequiredVariables(req,SEO);
    var like_url  = `/like/jupyter-notebooks/${encodeURIComponent(id)}/${encodeURIComponent(title)}`
    var has_liked = article.has_liked;
    var like_count = article.likes;
    var view_count = article.views;
    const filename = filenamify('frankmbrown-notebook-'.concat(title).concat('.ipynb'));
    const path_to_download = `/jupyter-notebook/download/${id}/${title}`;
    return res.status(200).render(view,{
      layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
      ...requiredVariables,
      pageObj: {
        html,
        title, 
        description,
        date_created_string,
        path
      },
      like_url,
      has_liked,
      like_count,
      view_count,
      comments_str,
      filename,
      path_to_download,
      ...comment_required_variables
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/jupyter-notebooks',404,{ severity:'error',message:'The jupyter notebook you requested does not exist.'}); 
  }
} 
export async function downloadJupyterNotebook(req:Request,res:Response) {
  try {
    const { id, title } = req.params;
    const resp = await getDatabase().query(`SELECT notebook FROM jupyter_notebooks WHERE id=$1;`,[id]);
    const notebook = resp.rows?.[0]?.notebook;
    if (!!!notebook) {
      return res.status(400).send("Unable to download the requested file.");
    }
    const filename = filenamify('frankmbrown-notebook-'.concat(title).concat('.ipynb'));
    const path_to_temp_download_files = path.resolve(__dirname,'temp',filename);
    await fs.promises.writeFile(path_to_temp_download_files,notebook);
    res.download(path_to_temp_download_files,async () => {
      await fs.promises.unlink(path_to_temp_download_files);
      return;
    });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Unable to download the requested file.");
  }
}
export async function deleteJupyterNotebook(req:Request,res:Response) {
  try {
    const { id } = req.params;
    const dbRes =await getDatabase().query(DELETE_NOTEBOOK,[id]);
    if (!!!dbRes.rows.length) throw new Error('Unable to delete jupyter notebook.');
    await Promise.all([
      req.cache.del(GET_NOTEBOOK_CACHE_KEY(id)),
      req.cache.del(NOTEBOOKS_CACHE_KEY)
    ]);
    return redirect(req,res,'/jupyter-notebooks',200,{ severity: 'success', message: 'Successfully deleted jupyter notebook!' });
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorSnackbar('Something went wrong deleting the jupyter notebook.'));
  }
}
export async function postJupyterNotebook(req:Request,res:Response) {
  const validString = (s:any,{min, max}:{min?:number,max?:number}) => {
    if (typeof s!=='string') return false;
    else if (typeof min==='number'&& s.length<min) return false;
    else if (typeof max==='number' && s.length > max) return false;
    return true;
  }
  try {
    const title = req.body["jupyter-title"];
    const description = req.body["jupyter-description"];
    const image_url = req.body['jupyter-notebook-image-text'];
    const notebook = (req.files as any)?.["upload-jupyter-notebook"]?.[0] as any;
    if (!!!validString(title,{min: 5, max: 100})) throw new Error('Invalid title for jupyter notebook.');
    if (!!!validString(description,{min:10,max:300})) throw new Error('Invalid description for jupyter notebook');
    if(typeof image_url!=='string'||!!!image_url.startsWith('https://image.storething.org/frankmbrown')) throw new Error("Need to upload appropraite image for upyter notebook.");
    if (!!!notebook) throw new Error('Unable to retrieve notebook from jupyter notebook submission.');
    const new_image_url = await handleImageUpload150_75(image_url);
    await uploadPageImageFromUrl(req,new_image_url);
    if (notebook.mimetype !=='application/octet-stream') throw new Error('Incorrect mimetype for jupyter notebook.');
    const fileExtension = notebook.originalname.slice(notebook.originalname.lastIndexOf('.')+1);
    if (fileExtension!=='ipynb') throw new Error('Incorrect file extension for jupyter notebook.');    
    const notebookStr = notebook.buffer.toString();
    const date_created = TIME.getUnixTime();
    const keywords = Array.from(new Set(title.concat(' ').concat(description).replace(/\s+/g,' ').split(' ').map((o:string) => o.toLowerCase()))) as string[];
    const {id, title:newTitle } = await createHTMLFromNotebook({ title, description, date_created, notebookStr, keywords, image_url: new_image_url },req);
    const redirectPath = `/jupyter-notebooks/${id}/${encodeURIComponent(title)}`;
    return redirect(req,res,redirectPath,200,{severity:'success', message: 'Successfully inserted jupyter notebook into the database!' });
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorSnackbar('Something went wrong creating the jupyter notebook.'));
  }
} 

export async function searchJupyterNotebook(req:Request,res:Response) {
  try {
    const search_term = req.query['search-notebooks-title'];
    if (!!!search_term) {
      return res.status(200).send(getWarningAlert('Please enter a title to search for.'));
    }
    const searchQueryStr = `SELECT id, title, description, date_created, image_url FROM jupyter_notebooks WHERE lower(title) LIKE '%' || lower($1) || '%' ORDER BY similarity(lower(title),lower($1)) DESC;`;
    const dbRes = await getDatabase().query(searchQueryStr,[search_term]);
    const rows = dbRes.rows;
    if (!!!rows.length) {
      return res.status(200).send(getWarningAlert('There were no notebooks that matched the search.'));
    }
    const ret = rows.map((obj) => {
      const path = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
      const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_created));
      return  renderJupyterPreview({ ...obj, path, date_created, phone: Boolean(!!!req.session.device?.desktop), image: obj.image_url });
    }).join('');
    return res.status(200).send(ret);
  } catch (error) {
    return res.status(200).send(getErrorAlert("Unable to complete search for Jupyter Notebook."));
  }
}