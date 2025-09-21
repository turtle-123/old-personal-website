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
exports.getMarkdownNotePreviewsInDatabase = exports.getAndRenderEditMarkdownNotesPreview = exports.downloadNote = exports.getMarkdownNotePage = exports.getMarkdownNotesPage = exports.deleteMarkdownNote = exports.putMarkdownNote = exports.postMarkdownNote = exports.renderMarkdownNote = exports.renderMarkdownNotesPreview = exports.getMarkdownNoteInDatabase = exports.updateMarkdownInDatabase = exports.postNewMarkdownNoteInDatabase = void 0;
const TIME = __importStar(require("../../utils/time"));
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const redirect_override_1 = require("../helper_functions/redirect-override");
const database_1 = __importDefault(require("../../database"));
const html_1 = require("../html");
const html_escaper_1 = require("html-escaper");
const index_1 = require("../functions/markdown/index");
const handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
const articleHelpers_1 = require("./articleHelpers");
const image_1 = require("../../utils/image");
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const filenamify_1 = __importDefault(require("filenamify"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const projects_1 = require("./projects");
const GET_MARKDOWNS = /*sql*/ `SELECT title, id, description, last_edited, date_created, published, image_url FROM markdown_notes ORDER BY last_edited DESC;`;
const POST_TO_MARKDOWN = /*sql*/ `INSERT INTO markdown_notes (
  markdown,
  html,
  title,
  description,
  date_created,
  last_edited,
  published,
  table_of_contents,
  design_system,
  breaks,
  gfm,
  pedantic,
  image_url
) VALUES (
  $1::TEXT,
  $2::TEXT,
  $3::TEXT,
  $4::TEXT,
  $5::bigint,
  $5::bigint,
  $6::boolean,
  $7,
  $8::TEXT,
  $9::boolean, 
  $10::boolean, 
  $11::boolean,
  $12::TEXT 
) RETURNING id;`;
const UPDATE_MARKDOWN = /*sql*/ `WITH init_up AS (
UPDATE markdown_notes SET 
markdown=$1::TEXT, 
html=$2::TEXT,
title=$3::TEXT,
description=$4::TEXT,
last_edited=$5::bigint,
published=$6::boolean,
table_of_contents=$7,
design_system=$8,
breaks=$9,
gfm=$10,
pedantic=$11,
image_url=$12
WHERE id=$13
) ${GET_MARKDOWNS}`;
const GET_MARKDOWN = /*sql*/ `SELECT id, markdown,
html,
title,
description,
date_created,
last_edited,
published,
table_of_contents,
design_system,
breaks,
gfm,
pedantic,
image_url FROM markdown_notes WHERE id=$1;`;
const DELETE_MARKDOWN = /*sql*/ `WITH ret_1 AS (DELETE FROM markdown_notes WHERE id=$1) ${GET_MARKDOWNS}`;
const MARKDOWN_PARTIAL_CACHE_KEY = 'fmb-mds';
/* --------------------------------------------- Markdown Database----------------------------*/
async function postNewMarkdownNoteInDatabase(req, { markdown, html, title, description, published, table_of_contents, design_system, breaks, gfm, pedantic, image_url }) {
    try {
        const date_created = TIME.getUnixTime();
        const dbResp = await (0, database_1.default)().query(POST_TO_MARKDOWN, [
            markdown,
            html,
            title,
            description,
            date_created,
            published,
            table_of_contents,
            design_system,
            breaks,
            gfm,
            pedantic,
            image_url
        ]);
        const id = dbResp.rows[0].id;
        const dbResp2 = await (0, database_1.default)().query(GET_MARKDOWNS);
        const rows = dbResp2.rows;
        await req.cache.set(MARKDOWN_PARTIAL_CACHE_KEY, JSON.stringify(rows, null, ''));
        return id;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to post new markdown note in database.');
    }
}
exports.postNewMarkdownNoteInDatabase = postNewMarkdownNoteInDatabase;
async function updateMarkdownInDatabase(req, { id, markdown, html, title, description, published, design_system, breaks, gfm, pedantic, table_of_contents, image_url }) {
    try {
        const last_edited = TIME.getUnixTime();
        const dbResp = await (0, database_1.default)().query(UPDATE_MARKDOWN, [
            markdown,
            html,
            title,
            description,
            last_edited,
            published,
            table_of_contents,
            design_system,
            breaks,
            gfm,
            pedantic,
            image_url,
            id
        ]);
        const rows = dbResp.rows;
        await Promise.all([
            req.cache.set(MARKDOWN_PARTIAL_CACHE_KEY, JSON.stringify(rows, null, '')),
            req.cache.del(`fmb-md-${id}`)
        ]);
        return;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to update markdown in the database.');
    }
}
exports.updateMarkdownInDatabase = updateMarkdownInDatabase;
async function getMarkdownNoteInDatabase(req, id) {
    const CACHE_KEY = `fmb-md-${id}`;
    try {
        const note = await req.cache.get(CACHE_KEY);
        if (typeof note === 'string' && note) {
            return JSON.parse(note);
        }
        else {
            const dbRes = await (0, database_1.default)().query(GET_MARKDOWN, [id]);
            if (dbRes.rows.length) {
                const obj = dbRes.rows[0];
                await req.cache.set(CACHE_KEY, JSON.stringify(obj));
                return obj;
            }
            else {
                throw new Error('Unable to get markdown from postgres database.');
            }
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get Markdown Nite in Database.');
    }
}
exports.getMarkdownNoteInDatabase = getMarkdownNoteInDatabase;
/* -------------------------------------- Render Markdown ---------------------------- */
async function renderMarkdownNotesPreview(markdownNotes, req) {
    var _a;
    try {
        const phone = Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop));
        const filteredMarkdownNotes = markdownNotes.filter((obj) => obj.published);
        if (!!!filteredMarkdownNotes.length) {
            return { str: `<div class="mt-2">${(0, html_1.getWarningAlert)('There are no markdown notes to see.')}</div>`, tableOfContents: [] };
        }
        else {
            const objs = filteredMarkdownNotes.map((obj) => { var _a; return ({ monthYear: TIME.getMonthYearFromUnix(obj.last_edited, ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York'), str: (0, handleArticlePreview_1.renderMarkdownPreview)({ ...obj, image: obj.image_url || null, phone }) }); });
            const { str, tableOfContents } = (0, articleHelpers_1.renderArticlesMonthYears)(objs);
            return { str, tableOfContents };
        }
    }
    catch (error) {
        console.error(error);
        return { str: (0, html_1.getErrorAlert)('Something went wrong getting the preview for the markdown notes.'), tableOfContents: [] };
    }
}
exports.renderMarkdownNotesPreview = renderMarkdownNotesPreview;
async function renderMarkdownNote(markdownNote, auth) {
    const IS_ADMIN = Boolean(auth === 3);
    try {
        const dateCreatedStr = TIME.getDateTimeStringFromUnix(Number(markdownNote.date_created));
        const lastEditedString = TIME.getDateTimeStringFromUnix(Number(markdownNote.last_edited));
        const str = /*html*/ `
    <h1 class="page-title">${(0, html_escaper_1.escape)(markdownNote.title)}</h1>
    <p class="mt-2">
      ${(0, html_escaper_1.escape)(markdownNote.description)}
    </p>
    ${IS_ADMIN ? /*html*/ `
    <div class="mt-2 flex-row justify-end">
      <button type="button" class="error filled medium icon-text" hx-delete="/markdown-notes/${encodeURIComponent(markdownNote.id)}/${encodeURIComponent(markdownNote.title)}" hx-indicator="#page-transition-progress" hx-target="#PAGE" hx-swap="innerHTML" hx-trigger="click">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
        DELETE MARKDOWN NOTE
      </button>
    </div>
    ` : ``}
    <div class="mt-2 bb-main flex-row justify-between" style="padding-bottom: 4px;">
    <div class="flex-column align-center gap-2" style="width: fit-content;">
      <span class="bold">Date Created:</span>
      <time data-date-format="MM/DD/YYYY" datetime="${dateCreatedStr}">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
          </path>
        </svg>
        <span></span>
      </time>
    </div>
    <div class="flex-column align-center gap-2" style="width: fit-content;">
      <span class="bold">Last Edited:</span>
      <time data-date-format="MM/DD/YYYY" datetime="${lastEditedString}">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Edit"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
        <span></span>
      </time>
    </div>
  </div>
  ${markdownNote.html}
  `;
        return str;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to properly render Markdown string.');
    }
}
exports.renderMarkdownNote = renderMarkdownNote;
/* ----------------------------------------------- Handle API Requests --------------------------------------- */
const stringIsValid = (s, obj) => {
    if (typeof s !== 'string')
        return false;
    if (obj && typeof obj.min === 'number') {
        if (s.length < obj.min)
            return false;
    }
    if (obj && typeof obj.max === 'number') {
        if (s.length > obj.max)
            return false;
    }
    return true;
};
const IS_VALID_DESIGN_SYSTEM = (s) => (new Set(['default', 'my-design-system']).has(s));
async function postMarkdownNote(req, res) {
    try {
        const markdown = req.body['markdown-input'];
        const title = req.body["markdown-title"];
        const description = req.body['markdown-description'];
        const design_system = req.body["design-system"];
        const breaks = req.body["breaks"] ? req.body["breaks"] === 'on' : true;
        const gfm = req.body["gfm"] ? req.body["gfm"] === 'on' : true;
        const pedantic = req.body["pedantic"] ? req.body['pedantic'] === 'on' : false;
        const image_url = req.body["markdown=note-image-text"];
        const markdownID = req.body["markdown-id"];
        const publish = req.body["markdown-publish"] ? req.body["markdown-publish"] === 'on' : false;
        if (!!!stringIsValid(markdown, { min: 10 }))
            throw new Error('Markdown should be a string that is at least 10 characters long.');
        if (!!!stringIsValid(title, { min: 1, max: 200 }))
            throw new Error('Markdown Title should be a string between 1 and 200 characters long.');
        if (!!!stringIsValid(description, { min: 10, max: 500 }))
            throw new Error('Markdown Description should be a string that is between 10 and 500 characters long.');
        if (!!!IS_VALID_DESIGN_SYSTEM(design_system))
            throw new Error('Invalid Markdown Design System specification.');
        if (!!!image_url || typeof image_url !== 'string' || !!!image_url.startsWith('https://image.storething.org/frankmbrown/'))
            throw new Error("Invalid Image for markdown note.");
        const new_image_url = await (0, image_1.handleImageUpload150_75)(image_url);
        await (0, projects_1.uploadPageImageFromUrl)(req, new_image_url);
        const markdownHTMLPre = await (0, index_1.parseMarkdown)(markdown, { design_system, breaks, gfm, pedantic });
        const { table_of_contents, html } = (0, index_1.getTableOfContentsFromMarkdownHTML)(markdownHTMLPre, design_system);
        const id = await postNewMarkdownNoteInDatabase(req, { markdown, html, title, description, published: publish, design_system, breaks, gfm, pedantic, table_of_contents, image_url: new_image_url });
        return (0, redirect_override_1.redirect)(req, res, `/projects/markdown-to-html?note=${encodeURIComponent(id)}`, 200, { severity: 'success', message: 'Successfully updated markdown note in database.' });
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Unable to post markdown note.'));
    }
}
exports.postMarkdownNote = postMarkdownNote;
async function putMarkdownNote(req, res) {
    try {
        const { id } = req.params;
        if (!!!id || typeof id !== 'string')
            throw new Error('Unable to parse markdown note id from request.');
        const markdown = req.body['markdown-input'];
        const title = req.body["markdown-title"];
        const description = req.body['markdown-description'];
        const design_system = req.body["design-system"];
        const breaks = req.body["breaks"] ? req.body["breaks"] === 'on' : true;
        const gfm = req.body["gfm"] ? req.body["gfm"] === 'on' : true;
        const pedantic = req.body["pedantic"] ? req.body['pedantic'] === 'on' : false;
        const image_url = req.body["markdown=note-image-text"];
        const markdownID = req.body["markdown-id"];
        const publish = req.body["markdown-publish"] ? req.body["markdown-publish"] === 'on' : false;
        if (!!!stringIsValid(markdown, { min: 10 }))
            throw new Error('Markdown should be a string that is at least 10 characters long.');
        if (!!!stringIsValid(title, { min: 1, max: 200 }))
            throw new Error('Markdown Title should be a string between 1 and 200 characters long.');
        if (!!!stringIsValid(description, { min: 10, max: 500 }))
            throw new Error('Markdown Description should be a string that is between 10 and 500 characters long.');
        if (!!!IS_VALID_DESIGN_SYSTEM(design_system))
            throw new Error('Invalid Markdown Design System specification.');
        if (!!!image_url || typeof image_url !== 'string' || !!!image_url.startsWith('https://image.storething.org/frankmbrown/'))
            throw new Error("Invalid Image for markdown note.");
        const markdownHTMLPre = await (0, index_1.parseMarkdown)(markdown, { design_system, breaks, gfm, pedantic });
        const { table_of_contents, html } = (0, index_1.getTableOfContentsFromMarkdownHTML)(markdownHTMLPre, design_system);
        await updateMarkdownInDatabase(req, { id, markdown, html, title, description, published: publish, design_system, breaks, gfm, image_url, pedantic, table_of_contents });
        return res.status(200).send((0, html_1.getSuccessSnackbar)('Successfully updated markdown note in database.'));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Unable to update markdown note.'));
    }
}
exports.putMarkdownNote = putMarkdownNote;
async function deleteMarkdownNote(req, res) {
    try {
        const { id } = req.params;
        if (!!!id)
            throw new Error('Unable to get the id to delete the Markdown Note.');
        const dbRes = await (0, database_1.default)().query(DELETE_MARKDOWN, [id]);
        if (dbRes && dbRes.rows) {
            await Promise.all([
                req.cache.del(`fmb-md-${id}`),
                req.cache.set(MARKDOWN_PARTIAL_CACHE_KEY, JSON.stringify(dbRes.rows))
            ]);
            return (0, redirect_override_1.redirect)(req, res, '/projects/markdown-to-html', 200, { severity: 'success', message: 'Successfully deleted markdown note from database.' });
        }
        else {
            throw new Error('Unable to find markdown note for deletion in database.');
        }
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Unable to delete markdown note.'));
    }
}
exports.deleteMarkdownNote = deleteMarkdownNote;
async function getMarkdownNotesPage(req, res) {
    const view = 'pages/markdown-notes';
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Markdown Notes', item: '/markdown-notes', position: 2 },
    ];
    const title = "Frank's Markdown Notes";
    const keywords = ["Markdown", "Notes", "Lexical", "Rich text Editor", "Frank McKee Brown"];
    const description = 'View FrankMBrown\s Markdown Notes. On this page, you can see all of my markdown notes and navigate to the note pages. I created this page because writing markdown can sometimes be easier than using a Rich Text Editor, especially when the notes are relatively simple.';
    const tableOfContents = [
        { id: 'about-page', text: 'About This Page' },
        { id: 'markdown-notes', text: 'Markdown Notes' }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/markdown-notes' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    try {
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        const markdownNotes = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('markdown_notes_id', order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(markdownNotes.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        var markdownNotesList = { str: '', tableOfContents: [] };
        markdownNotesList.str = markdownNotes.str;
        markdownNotesList.tableOfContents = markdownNotes.toc;
        requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat(markdownNotesList.tableOfContents);
        // get all markdown notes
        // render markdown notes
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            markdownNotesList: markdownNotesList.str,
            order_by
        });
    }
    catch (error) {
        console.error(error);
        var markdownNotesList = { str: (0, html_1.getErrorAlert)('Something went wrong getting the markdown notes list. Try reloading the page.'), tableOfContents: [] };
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            markdownNotesList: markdownNotesList.str,
            order_by: {
                order_by_value: "last-edit-new",
                order_by_str: "Last Edited (New)"
            }
        });
    }
}
exports.getMarkdownNotesPage = getMarkdownNotesPage;
async function getMarkdownNotePage(req, res) {
    const view = 'pages/posts/markdown-note';
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Markdown Notes', item: '/markdown-notes', position: 2 },
    ];
    var title = "";
    var keywords = ["Markdown", "Notes", "Lexical", "Rich text Editor", "Frank McKee Brown"];
    var description = '';
    var tableOfContents = [];
    try {
        const { id } = req.params;
        if (!!!id)
            throw new Error('Unable to parse id from request to get Markdown note.');
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const [markdownObj, comments_str] = await Promise.all([(0, handleArticleData_1.getMarkdownNoteAndLikesAndViews)(req, id), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables)]);
        breadcrumbs.push({ name: markdownObj.title, item: `/markdown-notes/${encodeURIComponent(id)}/${encodeURIComponent(title)}`, position: 3 });
        title = markdownObj.title;
        description = markdownObj.description;
        tableOfContents = markdownObj.table_of_contents;
        tableOfContents.push({ id: "comments", text: "Comments" });
        const pageObj = {
            title,
            description,
            html: markdownObj.html,
            date_created: TIME.getDateTimeStringFromUnix(Number(markdownObj.date_created)),
            last_edited: TIME.getDateTimeStringFromUnix(Number(markdownObj.last_edited)),
            noteID: markdownObj.id
        };
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: `/markdown-notes/${encodeURIComponent(id)}/${encodeURIComponent(title)}`, image: markdownObj.image_url };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        var like_url = `/like/markdown-notes/${encodeURIComponent(id)}/${encodeURIComponent(title)}`;
        var has_liked = markdownObj.has_liked;
        var like_count = markdownObj.likes;
        var view_count = markdownObj.views;
        const filename = (0, filenamify_1.default)('frankmbrown-note-'.concat(title).concat('.md'));
        const path_to_download = `/markdown-notes/download/${id}/${title}`;
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            pageObj,
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
        return (0, redirect_override_1.redirect)(req, res, '/markdown-notes', 404, { severity: 'error', message: 'It doesn\'t appear that this markdown note exists.' });
    }
}
exports.getMarkdownNotePage = getMarkdownNotePage;
async function downloadNote(req, res) {
    var _a, _b;
    try {
        const { id, title } = req.params;
        const resp = await (0, database_1.default)().query(`SELECT markdown FROM markdown_notes WHERE id=$1;`, [id]);
        const md = (_b = (_a = resp.rows) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.markdown;
        if (!!!md) {
            return res.status(400).send("Unable to download the requested file.");
        }
        const filename = (0, filenamify_1.default)('frankmbrown-note-'.concat(title).concat('.md'));
        const path_to_temp_download_files = node_path_1.default.resolve(__dirname, 'temp', filename);
        await node_fs_1.default.promises.writeFile(path_to_temp_download_files, md);
        res.download(path_to_temp_download_files, async () => {
            await node_fs_1.default.promises.unlink(path_to_temp_download_files);
            return;
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Unable to download the requested file.");
    }
}
exports.downloadNote = downloadNote;
/**
 *
 */
async function getAndRenderEditMarkdownNotesPreview(req) {
    var _a;
    try {
        const previews = await getMarkdownNotePreviewsInDatabase(req);
        const phone = Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop));
        if (Array.isArray(previews)) {
            return previews.map((obj) => {
                return (0, handleArticlePreview_1.renderEditMarkdownNotePreview)({ ...obj, image: obj.image_url || null, phone });
            }).join('');
        }
        else {
            return (0, html_1.getWarningAlert)('There are no markdown notes saved in the Database.');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get and render markdown notes preview.');
    }
}
exports.getAndRenderEditMarkdownNotesPreview = getAndRenderEditMarkdownNotesPreview;
async function getMarkdownNotePreviewsInDatabase(req) {
    try {
        const cacheRes = await req.cache.get(MARKDOWN_PARTIAL_CACHE_KEY);
        if (typeof cacheRes === 'string' && cacheRes) {
            return JSON.parse(cacheRes);
        }
        else {
            const dbRes = await (0, database_1.default)().query(GET_MARKDOWNS);
            if (dbRes.rows.length) {
                await req.cache.set(MARKDOWN_PARTIAL_CACHE_KEY, JSON.stringify(dbRes.rows));
                return dbRes.rows;
            }
            else {
                await req.cache.del(MARKDOWN_PARTIAL_CACHE_KEY);
                return '';
            }
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get Markdown Notes from database.');
    }
}
exports.getMarkdownNotePreviewsInDatabase = getMarkdownNotePreviewsInDatabase;
/*------------------------------------------------ Render Markdown and Get Table of Contents --------------------------------*/
