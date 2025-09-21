"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchJupyterNotebook = exports.postJupyterNotebook = exports.deleteJupyterNotebook = exports.downloadJupyterNotebook = exports.getJupyterNotebook = exports.getJupyterNotebooksPage = exports.jupyterNotebookToHTML = void 0;
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const html_escaper_1 = require("html-escaper");
const TIME = __importStar(require("../../utils/time"));
const aws_implementation_1 = require("../../aws/aws-implementation");
const node_crypto_1 = __importDefault(require("node:crypto"));
const markdown_1 = require("../functions/markdown");
const highlight_js_1 = __importDefault(require("highlight.js"));
const buffer_image_size_1 = __importDefault(require("buffer-image-size"));
const redirect_override_1 = require("../helper_functions/redirect-override");
const html_1 = require("../html");
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
const articleHelpers_1 = require("./articleHelpers");
const image_1 = require("../../utils/image");
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const node_path_1 = __importDefault(require("node:path"));
const filenamify_1 = __importDefault(require("filenamify"));
const projects_1 = require("./projects");
const INSERT_INTO_NOTEBOOK = /*sql*/ `INSERT INTO jupyter_notebooks (
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
const GET_NOTEBOOK_PREVIEWS = /*sql*/ `SELECT id, title, description, date_created, image_url FROM jupyter_notebooks ORDER BY date_created DESC;`;
const DELETE_NOTEBOOK = /*sql*/ `WITH rte_1 AS (
  DELETE FROM jupyter_notebooks WHERE id=$1
) ${GET_NOTEBOOK_PREVIEWS}`;
const NOTEBOOKS_CACHE_KEY = 'fmb-ipynbs';
const GET_NOTEBOOK_CACHE_KEY = (id) => `fmb-ipynb-${id}`;
function getJupyterImageMetadata(body) {
    // @ts-ignore
    const res = (0, buffer_image_size_1.default)(Buffer.from(body));
    return {
        width: res.width,
        height: res.height,
        type: res.type
    };
}
async function handleImageUpload(str) {
    const buffer = Buffer.from(str, 'base64');
    const metadata = getJupyterImageMetadata(buffer);
    const imageKey = 'frankmbrown/img_'.concat(node_crypto_1.default.randomUUID()).concat('.png');
    const image_url = await (0, aws_implementation_1.uploadImageObject)(imageKey, buffer, 'png', { ...metadata, width: String(metadata.width), height: String(metadata.height) }, 3, 25);
    return /*html*/ `<div class="flex-row justify-center align-center" style="margin: 6px 0px;"><img  src="${image_url}" alt="Jupyter Notebook Image" data-update-image /></div>`;
}
const getCellID = (cell_num, output) => {
    return `cell_${cell_num}${output ? '_output' : ''}`;
};
const getOutputHTML = (html, num) => ( /*html*/`<div class="ipynb-output mt-2">
    <div class="flex-row justify-begin align-center">
      <button type="button" class="icon medium" data-state="0" aria-label="Expand or Collapse Output" data-ipynb-button>
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowRight"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
      </button>
      <span style="font-family: monospace; margin-left: 4px;">
        out[${num}]
      </span>
    </div>
    <div class="ipynb-output-inner hz-scroll" data-state="0">${html}</div>
  </div>`);
async function jupyterNotebookToHTML(notebookStr) {
    try {
        const notebookJSON = JSON.parse(notebookStr);
        const table_of_contents = [];
        var html = '';
        var curr_cell = 1;
        for (let cell of notebookJSON.cells) {
            if (cell.cell_type === "code") {
                const codeCell = cell;
                const code = highlight_js_1.default.highlight(codeCell.source.join(''), { language: 'python' });
                const codeHTML = (0, markdown_1.renderMarkdownCode)({ block: true, htmlString: code.value, language: 'python' });
                const codeCellID = getCellID(curr_cell, false);
                html += /*html*/ `<div class="mt-2" id="${codeCellID}">${codeHTML}</div>`;
                table_of_contents.push({ id: codeCellID, text: `Code Cell ${curr_cell}` });
                var outputHTML = '';
                for (let output of codeCell.outputs) {
                    if (output.output_type === "stream") {
                        const errorText = output.name === "stderr";
                        const className = errorText ? "mt-1 t-error fw-regular" : "mt-1";
                        const newHTML = /*html*/ `<p class="${className}" style="overflow: hidden;" data-no-search>${(0, html_escaper_1.escape)(output.text.join('')).replace(/\n/g, '<br/>')}</p>`;
                        outputHTML += newHTML;
                    }
                    else if (output.output_type === "execute_result") {
                        var newOutputHTML = /*html*/ `<div data-no-search>`;
                        if (output.data['image/png']) {
                            const newHTML = await handleImageUpload(output.data['image/png']);
                            newOutputHTML += newHTML;
                        }
                        if (output.data['text/plain']) {
                            const newHTML = /*html*/ `<p data-no-search class="mt-1" style="overflow: hidden;">${(0, html_escaper_1.escape)(output.data['text/plain'].join('\n')).replace(/\n/g, '<br/>')}</p>`;
                            newOutputHTML += newHTML;
                        }
                        if (newOutputHTML === `<div>`) {
                            console.error('Unrecognized Type: ', Object.keys(output.data));
                        }
                        newOutputHTML += '</div>';
                        outputHTML += newOutputHTML;
                    }
                    else if (output.output_type === "display_data") {
                        var newOutputHTML = /*html*/ `<div>`;
                        if (output.data['image/png']) {
                            const newHTML = await handleImageUpload(output.data['image/png']);
                            newOutputHTML += newHTML;
                        }
                        if (output.data['text/plain']) {
                            const newHTML = /*html*/ `<p class="mt-1" style="overflow: hidden;">${(0, html_escaper_1.escape)(output.data['text/plain'].join('\n')).replace(/\n/g, '<br/>')}</p>`;
                            newOutputHTML += newHTML;
                        }
                        if (newOutputHTML === `<div>`) {
                            console.error('Unrecognized Type: ', Object.keys(output.data));
                        }
                        newOutputHTML += '</div>';
                        outputHTML += newOutputHTML;
                    }
                    else {
                        console.error('Unrecognized Type: ', Object.keys(output));
                    }
                }
                html += getOutputHTML(outputHTML, curr_cell);
            }
            else {
                const markdownCell = cell;
                const str = markdownCell.source.join('');
                const markdown = await (0, markdown_1.parseMarkdown)(str, { design_system: 'my-design-system', gfm: true, breaks: true, pedantic: false });
                const tanleOfContents = (0, markdown_1.getTableOfContentsFromMarkdownHTML)(markdown, 'my-design-system');
                var newHTML = /*html*/ `<div>${markdown}</div>`;
                table_of_contents.push(...tanleOfContents.table_of_contents);
                html += newHTML;
            }
            curr_cell += 1;
        }
        const HTML = await (0, markdown_1.purifyAndUpdateJupyterNotebookMarkdownHTML)(html);
        return { html: HTML, table_of_contents };
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to convert jupyter notebook to HTML.');
    }
}
exports.jupyterNotebookToHTML = jupyterNotebookToHTML;
async function createHTMLFromNotebook({ title, description, date_created, keywords, notebookStr, image_url }, req) {
    // RENDER THE HTML
    try {
        const { html: HTML, table_of_contents } = await jupyterNotebookToHTML(notebookStr);
        const db = (0, database_1.default)();
        const dbRes = await db.query(INSERT_INTO_NOTEBOOK, [notebookStr, HTML, title, description, keywords, table_of_contents, date_created, image_url]);
        const id = dbRes.rows[0].id;
        const notebookPreviewsRes = await (0, database_1.default)().query(GET_NOTEBOOK_PREVIEWS);
        const notebookPreviews = notebookPreviewsRes.rows;
        const notebookSetInCache = {
            id,
            title,
            description,
            html: HTML,
            date_created,
            table_of_contents,
            keywords,
            image_url
        };
        await Promise.all([
            req.cache.set(NOTEBOOKS_CACHE_KEY, JSON.stringify(notebookPreviews, null, '')),
            req.cache.set(GET_NOTEBOOK_CACHE_KEY(id), JSON.stringify(notebookSetInCache))
        ]);
        return { id, title };
    }
    catch (error) {
        console.error(error);
        throw new Error('There was an error creating a new row for the jupyter notebook in the database.');
    }
}
/* ------------------------------------------------ Get Notebook Information From DB ---------------------------------------- */
async function getNotebookPreviewsFromDB(req) {
    try {
        const cacheNotebooks = await req.cache.get(NOTEBOOKS_CACHE_KEY);
        if (cacheNotebooks && typeof cacheNotebooks === 'string') {
            return JSON.parse(cacheNotebooks);
        }
        else {
            const jupyterNotebooksPostgres = await (0, database_1.default)().query(GET_NOTEBOOK_PREVIEWS);
            const rows = jupyterNotebooksPostgres.rows;
            await req.cache.set(NOTEBOOKS_CACHE_KEY, JSON.stringify(rows, null, ''));
            return rows;
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get Jupyter notebook previews from databse.');
    }
}
function renderNotebookPreviews(notebookPreviews, req) {
    const arr1 = notebookPreviews.map((obj) => {
        var _a, _b;
        const path = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
        const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_created));
        return { str: (0, handleArticlePreview_1.renderJupyterPreview)({ ...obj, path, date_created, phone: Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)), image: obj.image_url }), monthYear: TIME.getMonthYearFromUnix(obj.date_created, ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York') };
    });
    const ret = (0, articleHelpers_1.renderArticlesMonthYears)(arr1);
    return ret;
}
/*------------------------------------------------ Notebook API Routes From Database ---------------------------------*/
async function getJupyterNotebooksPage(req, res) {
    try {
        const view = 'pages/jupyter-notebooks';
        const breadcrumbs = [
            { name: 'Home', item: '/', position: 1 },
            { name: 'Jupyter Notebooks', item: '/jupyter-notebooks', position: 2 },
        ];
        const title = "Frank's Jupyter Notebooks";
        const description = "I created this page using nbconvert, my markdown to html system, and highlight.js to keep track of machine learning notes primarily.";
        const keywords = ['Jupyter Notebooks', "Machine Learning", "nbconvert", "highlight.js", "notes"];
        const tableOfContents = [
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
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/jupyter-notebooks' };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        if (order_by.order_by_value === "last-edit-new") {
            order_by.order_by_value = "date-created-new";
            order_by.order_by_str = "Date Created (New)";
        }
        const notebooks = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('jupyter_notebooks_id', order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(notebooks.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        var notebookHTML = notebooks.str;
        requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat(notebooks.toc);
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                jupyterNotebooksList: notebookHTML
            },
            order_by
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/', 500, { severity: 'error', message: 'Something went wrong getting the jupyter notebooks pages.' });
    }
}
exports.getJupyterNotebooksPage = getJupyterNotebooksPage;
async function getJupyterNotebook(req, res) {
    try {
        const { id, title } = req.params;
        const view = 'pages/posts/jupyter-notebook';
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const [article, comments_str] = await Promise.all([(0, handleArticleData_1.getJupyterNotebookAndLikesAndViews)(req, id), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables)]);
        const { html, description, date_created, table_of_contents, keywords, image_url } = article;
        table_of_contents.push({ id: "comments", text: "Comments" });
        const date_created_string = TIME.getDateTimeStringFromUnix(Number(date_created));
        const breadcrumbs = [
            { name: 'Home', item: '/', position: 1 },
            { name: 'Jupyter Notebooks', item: '/jupyter-notebooks', position: 2 },
        ];
        const path = `/jupyter-notebooks/${encodeURIComponent(id)}/${encodeURIComponent(title)}`;
        breadcrumbs.push({ name: title, item: path, position: 3 });
        const SEO = { breadcrumbs, image: image_url, keywords, title, description, tableOfContents: table_of_contents, path: '/jupyter-notebooks' };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        var like_url = `/like/jupyter-notebooks/${encodeURIComponent(id)}/${encodeURIComponent(title)}`;
        var has_liked = article.has_liked;
        var like_count = article.likes;
        var view_count = article.views;
        const filename = (0, filenamify_1.default)('frankmbrown-notebook-'.concat(title).concat('.ipynb'));
        const path_to_download = `/jupyter-notebook/download/${id}/${title}`;
        return res.status(200).render(view, {
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
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/jupyter-notebooks', 404, { severity: 'error', message: 'The jupyter notebook you requested does not exist.' });
    }
}
exports.getJupyterNotebook = getJupyterNotebook;
async function downloadJupyterNotebook(req, res) {
    var _a, _b;
    try {
        const { id, title } = req.params;
        const resp = await (0, database_1.default)().query(`SELECT notebook FROM jupyter_notebooks WHERE id=$1;`, [id]);
        const notebook = (_b = (_a = resp.rows) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.notebook;
        if (!!!notebook) {
            return res.status(400).send("Unable to download the requested file.");
        }
        const filename = (0, filenamify_1.default)('frankmbrown-notebook-'.concat(title).concat('.ipynb'));
        const path_to_temp_download_files = node_path_1.default.resolve(__dirname, 'temp', filename);
        await fs_1.default.promises.writeFile(path_to_temp_download_files, notebook);
        res.download(path_to_temp_download_files, async () => {
            await fs_1.default.promises.unlink(path_to_temp_download_files);
            return;
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Unable to download the requested file.");
    }
}
exports.downloadJupyterNotebook = downloadJupyterNotebook;
async function deleteJupyterNotebook(req, res) {
    try {
        const { id } = req.params;
        const dbRes = await (0, database_1.default)().query(DELETE_NOTEBOOK, [id]);
        if (!!!dbRes.rows.length)
            throw new Error('Unable to delete jupyter notebook.');
        await Promise.all([
            req.cache.del(GET_NOTEBOOK_CACHE_KEY(id)),
            req.cache.del(NOTEBOOKS_CACHE_KEY)
        ]);
        return (0, redirect_override_1.redirect)(req, res, '/jupyter-notebooks', 200, { severity: 'success', message: 'Successfully deleted jupyter notebook!' });
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Something went wrong deleting the jupyter notebook.'));
    }
}
exports.deleteJupyterNotebook = deleteJupyterNotebook;
async function postJupyterNotebook(req, res) {
    var _a, _b;
    const validString = (s, { min, max }) => {
        if (typeof s !== 'string')
            return false;
        else if (typeof min === 'number' && s.length < min)
            return false;
        else if (typeof max === 'number' && s.length > max)
            return false;
        return true;
    };
    try {
        const title = req.body["jupyter-title"];
        const description = req.body["jupyter-description"];
        const image_url = req.body['jupyter-notebook-image-text'];
        const notebook = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a["upload-jupyter-notebook"]) === null || _b === void 0 ? void 0 : _b[0];
        if (!!!validString(title, { min: 5, max: 100 }))
            throw new Error('Invalid title for jupyter notebook.');
        if (!!!validString(description, { min: 10, max: 300 }))
            throw new Error('Invalid description for jupyter notebook');
        if (typeof image_url !== 'string' || !!!image_url.startsWith('https://image.storething.org/frankmbrown'))
            throw new Error("Need to upload appropraite image for upyter notebook.");
        if (!!!notebook)
            throw new Error('Unable to retrieve notebook from jupyter notebook submission.');
        const new_image_url = await (0, image_1.handleImageUpload150_75)(image_url);
        await (0, projects_1.uploadPageImageFromUrl)(req, new_image_url);
        if (notebook.mimetype !== 'application/octet-stream')
            throw new Error('Incorrect mimetype for jupyter notebook.');
        const fileExtension = notebook.originalname.slice(notebook.originalname.lastIndexOf('.') + 1);
        if (fileExtension !== 'ipynb')
            throw new Error('Incorrect file extension for jupyter notebook.');
        const notebookStr = notebook.buffer.toString();
        const date_created = TIME.getUnixTime();
        const keywords = Array.from(new Set(title.concat(' ').concat(description).replace(/\s+/g, ' ').split(' ').map((o) => o.toLowerCase())));
        const { id, title: newTitle } = await createHTMLFromNotebook({ title, description, date_created, notebookStr, keywords, image_url: new_image_url }, req);
        const redirectPath = `/jupyter-notebooks/${id}/${encodeURIComponent(title)}`;
        return (0, redirect_override_1.redirect)(req, res, redirectPath, 200, { severity: 'success', message: 'Successfully inserted jupyter notebook into the database!' });
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Something went wrong creating the jupyter notebook.'));
    }
}
exports.postJupyterNotebook = postJupyterNotebook;
async function searchJupyterNotebook(req, res) {
    try {
        const search_term = req.query['search-notebooks-title'];
        if (!!!search_term) {
            return res.status(200).send((0, html_1.getWarningAlert)('Please enter a title to search for.'));
        }
        const searchQueryStr = `SELECT id, title, description, date_created, image_url FROM jupyter_notebooks WHERE lower(title) LIKE '%' || lower($1) || '%' ORDER BY similarity(lower(title),lower($1)) DESC;`;
        const dbRes = await (0, database_1.default)().query(searchQueryStr, [search_term]);
        const rows = dbRes.rows;
        if (!!!rows.length) {
            return res.status(200).send((0, html_1.getWarningAlert)('There were no notebooks that matched the search.'));
        }
        const ret = rows.map((obj) => {
            var _a;
            const path = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
            const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_created));
            return (0, handleArticlePreview_1.renderJupyterPreview)({ ...obj, path, date_created, phone: Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)), image: obj.image_url });
        }).join('');
        return res.status(200).send(ret);
    }
    catch (error) {
        return res.status(200).send((0, html_1.getErrorAlert)("Unable to complete search for Jupyter Notebook."));
    }
}
exports.searchJupyterNotebook = searchJupyterNotebook;
