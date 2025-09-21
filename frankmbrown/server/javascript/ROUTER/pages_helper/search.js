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
exports.updateSearchImagesConfirm = exports.updateSearchImagesInitial = exports.updateSearchImages = exports.updateSearchConfirm = exports.updateSearch = exports.populateSearch = exports.addPathToSearch = exports.getCurrentSitemap = exports.imageSearch = exports.getSearch = void 0;
const index_1 = __importDefault(require("../../database/index"));
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const TIME = __importStar(require("../../utils/time"));
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
const fast_xml_parser_1 = require("fast-xml-parser");
const ai_1 = require("../../ai");
const pg_1 = require("pgvector/pg");
const html_1 = require("../html");
const ejs_1 = __importDefault(require("ejs"));
const image_1 = require("../../utils/image");
const cmd_1 = require("../../utils/cmd");
const aws_implementation_1 = require("../../aws/aws-implementation");
const COMMON_SVG_1 = __importDefault(require("../../CONSTANTS/COMMON_SVG"));
const projects_1 = require("./projects");
const mime_types_1 = __importDefault(require("mime-types"));
const markdown_1 = require("../functions/markdown");
const html_escaper_1 = require("html-escaper");
// CREATE TABLE search (
// 	id bigserial PRIMARY KEY,
// 	path TEXT NOT NULL CHECK (path LIKE '/%'),
// 	hash TEXT,
// 	lastmod bigint NOT NULL, -- unix time
// 	title TEXT NOT NULL,
// 	section_title TEXT,
// 	description TEXT NOT NULL,
// 	image TEXT NOT NULL CHECK (image SIMILAR TO 'https://(www.|)frankmbrown.net/%' OR image LIKE 'https://image.storething.org/%'),
// 	document TEXT NOT NULL,
// 	search_vector tsvector GENERATED ALWAYS AS (
// 		setweight(to_tsvector('english',coalesce(title,'')),'A') ||
// 		setweight(to_tsvector('english',coalesce(section_title,'')),'B') ||
// 		setweight(to_tsvector('english',coalesce(description,'')),'C') ||
// 		setweight(to_tsvector('english',coalesce(document,'')),'D')
// 	) STORED,
// 	embedding_vector vector(1536) NOT NULL
// );
// CREATE INDEX gin_search_vector_idx ON search USING GIN(search_vector);
// CREATE INDEX gin_search_path_idx ON search USING GIN(path gin_trgm_ops);
// CREATE INDEX hnsw_search_embedding_vector_idx ON search USING hnsw(embedding_vector vector_l2_ops);
/**
 * url -> where you want to go
 * imageHeight & image Width
 *  - on desktop: 100x100, on mobile: 50x50
 * title: title of the page
 * section_title
 *
 */
const renderSearchResultTemplate = /*html*/ `<a tabindex="0" class="search-result <%=locals.addClass%> p-md flex-row justify-start align-center gap-3 w-100 mt-2" style="border-radius: 8px; max-width: 100%; border: 2px solid var(--divider); text-decoration: none!important; color: var(--text-primary);" hx-get="<%=locals.url%>" href="<%=locals.url%>" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress">
<img style="display: inline-block; border-radius: 6px;flex-shrink:0px; object-fit: contain; background-color: black;" src="<%=locals.image%>" alt="<%=locals.title%>" style="width=<%=locals.imageWidth%>px;height=<%=locals.imageHeight%>px;" width="<%=locals.imageWidth%>" height="<%=locals.imageHeight%>" data-text="<%=locals.title%>" />
<div class="flex-column grow-1 align-start justify-start" style="height: 100%; min-width: 0px;">
  <p class="h5 bold" style="text-decoration: none!important; color: var(--text-primary)!important;">
    <%=locals.title%>
    <%if(locals.section_title!==null){%>
      <br>
      <span class="h6 fw-regular" style="text-decoration: none!important; color: var(--text-primary)!important;"><%=locals.section_title%></span>
    <%}%>
  </p>
  <p class="body1 block mt-1 wrap" style="text-decoration: none!important; color: var(--text-primary)!important; word-break: break-all;"><%-locals.headline%></p>
</div>
</a>`;
async function getSearch(req, res) {
    var _a;
    var errStr = { severity: 'error', msg: 'Something went wrong with the search. Try reloading the page.' };
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Search', item: '/search', position: 2 }
    ];
    const title = "Search frankmbrown.net";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "Search frankmbrown.net"
    ];
    const description = 'Search blogs, notes, ideas, markdown notes and the entire site for frankmbrown.net.';
    const tableOfContents = [
        {
            "id": "about-search",
            "text": "About Search"
        },
        {
            "id": "search-application",
            "text": "Search the Application"
        }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/search' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    const isHxRequest = req.get('hx-request');
    const hxTarget = isHxRequest ? req.get('hx-target') : undefined;
    const onlyIncludeResults = Boolean((hxTarget === 'search-main-target' || hxTarget === '#search-main-target' || hxTarget === '#search-results' || hxTarget === 'search-results'));
    try {
        // throw new Error("Testing out");
        const searchQuery = req.query["search-application"];
        const searchBlogs = Boolean(req.query["search-blog"] === "on");
        const searchNotes = Boolean(req.query["search-notes"] === "on");
        const searchIdeas = Boolean(req.query["search-ideas"] === "on");
        const searchMarkdownNotes = Boolean(req.query["search-markdown-notes"] === "on");
        const searchJupyter = Boolean(req.query["search-jupyternb"] === "on");
        const searchDailyReading = Boolean(req.query["search-wotd"] === "on");
        const searchTexNotes = Boolean(req.query['search-tex-notes'] === "on");
        const searchGoodreads = Boolean(req.query['search-goodreads'] === "on");
        const searchLetterboxd = Boolean(req.query['search-letterboxd'] === "on");
        const searchGames = Boolean(req.query['search-games'] === "on");
        const search3d_designs = Boolean(req.query['search-3d-designs'] === "on");
        const searchUsers = Boolean(req.query['search-users'] === "on");
        const searchTypePre = String(req.query["search_type"] || 'default');
        const searchType = ((new Set(["default", "semantic", "string_match"])).has(searchTypePre) ? searchTypePre : 'default');
        if (typeof searchQuery !== 'string') {
            errStr.severity = 'warning';
            errStr.msg = "Enter your search query into the textbox above..";
            throw new Error("Search Query should be a string.");
        }
        if (!!!searchQuery.length) {
            errStr.severity = 'warning';
            errStr.msg = "Search query should be at least one character long.";
            throw new Error("Search query should be at least one character long.");
        }
        if (searchType === "semantic" && searchQuery.length < 10) {
            errStr.severity = 'error';
            errStr.msg = "Search must be at least 10 characters long when using semantic search.";
            throw new Error("Search must be at least 10 characters long when using semantic search.");
        }
        var limitSearch = '';
        if (!!!searchBlogs)
            limitSearch += `AND path NOT SIMILAR TO '\/blog\/\d+\/%' `;
        if (!!!searchNotes)
            limitSearch += `AND path NOT SIMILAR TO '\/note\/\d+\/%' `;
        if (!!!searchIdeas)
            limitSearch += `AND path NOT SIMILAR TO '\/idea\/\d+\/%' `;
        if (!!!searchMarkdownNotes)
            limitSearch += `AND path NOT SIMILAR TO '\/markdown-notes\/%\/%' `;
        if (!!!searchJupyter)
            limitSearch += `AND path NOT SIMILAR TO '\/jupyter-notebooks\/%\/%' `;
        if (!!!searchDailyReading)
            limitSearch += `AND path NOT SIMILAR TO '\/daily-reading\/\d+\/%' `;
        if (!!!searchTexNotes)
            limitSearch += `AND path NOT SIMILAR TO '\/tex-notes\/\d+\/%' `;
        if (!!!searchGoodreads)
            limitSearch += `AND path NOT SIMILAR TO '\/goodreads\/\d+\/%' `;
        if (!!!searchLetterboxd)
            limitSearch += `AND path NOT SIMILAR TO '\/letterboxd\/\d+\/%' `;
        if (!!!searchGames)
            limitSearch += `AND path NOT SIMILAR TO '\/games\/\d+\/%' `;
        if (!!!search3d_designs)
            limitSearch += `AND path NOT SIMILAR TO '\/3d-designs\/\d+\/%' `;
        if (!!!searchUsers)
            limitSearch = `AND path NOT SIMILAR TO '\/users\/\d+\/%' `;
        var searchDbQuery = '';
        const arr = [];
        if (searchType === "default") {
            searchDbQuery = /*sql*/ `WITH query AS (
  SELECT websearch_to_tsquery('english',$1) term
) SELECT id, title, path, hash, section_title, image, ts_headline(document,(SELECT term FROM query),'StartSel="<mark>",StopSel="</mark>"') headline
FROM search WHERE (SELECT term FROM query) @@ search_vector ${limitSearch}
ORDER BY ts_rank(search_vector,(SELECT term FROM query)) DESC LIMIT 50;`;
            arr.push(searchQuery);
        }
        else if (searchType === "semantic") {
            const embedding = await (0, ai_1.createEmbedding)(searchQuery, "text-embedding-ada-002");
            searchDbQuery = /*sql*/ `WITH query AS (
  SELECT websearch_to_tsquery('english',$1) term
) SELECT id, title, path, hash, section_title, image, ts_headline(document,(SELECT term FROM query),'StartSel="<mark>",StopSel="</mark>"') headline
FROM search WHERE true ${limitSearch} ORDER BY embedding_vector<->$2 LIMIT 50;`;
            arr.push(searchQuery, (0, pg_1.toSql)(embedding));
        }
        else if (searchType === "string_match") {
            searchDbQuery = /*sql*/ `SELECT id, title, path, hash, section_title, image, ts_headline(document,websearch_to_tsquery('english',$1),'StartSel="<mark>",StopSel="</mark>"') headline
FROM search WHERE title LIKE '%'|| $1 || '%' OR section_title LIKE '%'|| $1 || '%' OR  document LIKE '%'|| $1 || '%' ${limitSearch} ORDER BY similarity($1,title) DESC, similarity($1,section_title) DESC, similarity($1,document) DESC  LIMIT 50;`;
            arr.push(searchQuery);
        }
        const db = (0, index_1.default)(); // searchNotesInit,searchBlogInit
        const dbRes = await db.query(searchDbQuery, arr);
        if (!!!dbRes.rows.length) {
            errStr.severity = 'warning';
            errStr.msg = "There were no search resuts found.";
            throw new Error("There were no search resuts found.");
        }
        const rows = dbRes.rows;
        var searchResult = '';
        const desktop = Boolean((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop);
        const dialog = Boolean(hxTarget === "search-main-target" || hxTarget === "#search-main-target");
        rows.forEach((row) => {
            const url = row.hash !== null ? row.path.concat(`#`).concat(row.hash) : row.path;
            var imageHeight = 80;
            var imageWidth = 80;
            if (!!!desktop) {
                imageHeight = 60;
                imageWidth = 60;
            }
            var addClass = '';
            if (dialog) {
                addClass = 'dialog-search';
            }
            else {
                addClass = 'main-search';
            }
            searchResult += ejs_1.default.render(renderSearchResultTemplate, {
                url,
                title: row.title,
                section_title: row.section_title,
                headline: row.headline,
                image: row.image,
                imageHeight,
                imageWidth,
                addClass
            });
        });
        if (onlyIncludeResults) {
            return res.status(200).send(searchResult);
        }
        else {
            return res.status(200).render('pages/search', {
                layout: requiredVariables.fullPageRequest ? 'layout' : false,
                ...requiredVariables,
                searchResult
            });
        }
    }
    catch (error) {
        console.error(error);
        var searchResult = '';
        if (errStr.severity === "warning") {
            searchResult = (0, html_1.getWarningAlert)(errStr.msg, '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SearchOff"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3 6.08 3 3.28 5.64 3.03 9h2.02C5.3 6.75 7.18 5 9.5 5 11.99 5 14 7.01 14 9.5S11.99 14 9.5 14c-.17 0-.33-.03-.5-.05v2.02c.17.02.33.03.5.03 1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"></path><path d="M6.47 10.82 4 13.29l-2.47-2.47-.71.71L3.29 14 .82 16.47l.71.71L4 14.71l2.47 2.47.71-.71L4.71 14l2.47-2.47z"></path></svg>', false);
        }
        else {
            searchResult = (0, html_1.getErrorAlert)(errStr.msg, '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SearchOff"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3 6.08 3 3.28 5.64 3.03 9h2.02C5.3 6.75 7.18 5 9.5 5 11.99 5 14 7.01 14 9.5S11.99 14 9.5 14c-.17 0-.33-.03-.5-.05v2.02c.17.02.33.03.5.03 1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"></path><path d="M6.47 10.82 4 13.29l-2.47-2.47-.71.71L3.29 14 .82 16.47l.71.71L4 14.71l2.47 2.47.71-.71L4.71 14l2.47-2.47z"></path></svg>', false);
        }
        if (onlyIncludeResults) {
            return res.status(200).send(searchResult);
        }
        else {
            return res.status(200).render('pages/search', {
                layout: requiredVariables.fullPageRequest ? 'layout' : false,
                ...(0, frontendHelper_1.getRequiredVariables)(req, SEO),
                searchResult
            });
        }
    }
}
exports.getSearch = getSearch;
async function imageSearch(req, res) {
    try {
        const image = req.file;
        if (!!!image) {
            return res.status(200).send((0, html_1.getErrorAlert)("Unable to locate image for image search.", COMMON_SVG_1.default.SEARCH_ERROR, false));
        }
        const extension = mime_types_1.default.extension(image.mimetype);
        const base64String = (await (0, projects_1.convertImageToPillowCompatable)(image.buffer, extension)).toString('base64');
        const body = { image: base64String };
        const response = await (0, projects_1.postToPythonBackend)('/python/image-embed', body, 5000);
        const embedding = response.vector;
        console.log("Got Embedding");
        const query = `WITH init_query AS (
SELECT 
image_url, 
$1 <-> image_embeddings.embedding AS relevancy,
image_captions.user_caption AS user_caption,
image_captions.ai_caption AS ai_caption,
image_data.width AS width,
image_data.height AS height
FROM images 
JOIN image_embeddings ON images.id=image_embeddings.image_id 
JOIN image_nsfw ON images.id=image_nsfw.image_id
JOIN image_captions ON images.id=image_captions.image_id
JOIN image_data ON images.id=image_data.image_id
) SELECT * FROM init_query ORDER BY relevancy DESC LIMIT 20;`;
        const similar_images = (await (0, index_1.default)().query(query, [(0, pg_1.toSql)(embedding)])).rows;
        var ret_str = '';
        for (let i = 0; i < similar_images.length; i++) {
            const { relevancy, user_caption, ai_caption, width, height, image_url } = similar_images[i];
            var width_to_use = null;
            var height_to_use = null;
            var aspect_ratio_str = null;
            if (width && height) {
                const { widthMobile, heightMobile, aspectRatioStr } = (0, markdown_1.getSizesFromWidthAndHeight)(width, height);
                width_to_use = widthMobile;
                height_to_use = heightMobile;
                aspect_ratio_str = aspectRatioStr;
            }
            var str = `<p class="mt-2"><span class="bold">Relevancy:</span> ${(0, html_escaper_1.escape)(relevancy)}</p><div class="mt-1 flex-row justify-center"><img `;
            if (width_to_use && height_to_use)
                str += `width="${width_to_use}" height="${height_to_use}" `;
            if (aspect_ratio_str)
                str += `style="max-width: 100%; aspect-ratio: auto ${aspect_ratio_str} !important; max-width: 100%; display: inline-block;" `;
            str += `src="${image_url}" `;
            var caption = String(ai_caption);
            if (user_caption)
                caption = user_caption;
            str += `alt="${caption.replace(/"/g, '\'')}" `;
            str += '/></div>';
            ret_str += str;
        }
        return res.status(200).send(ret_str);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong with image search.", COMMON_SVG_1.default.SEARCH_ERROR, false));
    }
}
exports.imageSearch = imageSearch;
/**
 * - Returns (boolean) whether or not this page contains lexical article
 * - This is signifant right now because of the way hash navigation is handled
 * - In other parts of the website, there are `<section>`s in which a certain topic is discussed, but
 * for Lexical articles what should be contained by the hash navigation is a sibling of
 * @param url
 * @returns
 */
const isLexicalOrMarkdownOrJupyterArticle = (url) => {
    return Boolean(/https:\/\/frankmbrown\.net\/(daily\-reading|note|blog|idea)\/(\d+)\/.*/.test(url) || /https:\/\/frankmbrown\.net\/(jupyter\-notebooks|markdown\-notes)\/.*/.test(url));
};
/**
* 1. Gets the current sitemap from https://frankmbrown.net/sitemap.xml
* 2. Returns an array of paths (e.g, '/note' ) and lastmod unix time stamps
* - The Home Page path would be '/'
* @returns
*/
async function getCurrentSitemap() {
    var _a;
    try {
        const sitemapPage = await axios_1.default.get('https://frankmbrown.net/sitemap.xml', { timeout: 4000 });
        const sitemap = sitemapPage.data;
        const parser = new fast_xml_parser_1.XMLParser();
        const jObj = parser.parse(sitemap);
        if (!!!Array.isArray((_a = jObj === null || jObj === void 0 ? void 0 : jObj.urlset) === null || _a === void 0 ? void 0 : _a.url))
            throw new Error("Inavlid xml data.");
        // lastmod is in the form of YYY-MM-DD
        const objs = jObj.urlset.url.filter((obj) => /https:\/\/frankmbrown\.net.*/.test(obj.loc) && /\d\d\d\d-\d\d-\d\d/.test(obj.lastmod)).map((obj) => ({ path: obj.loc.replace('https://frankmbrown.net', ''), lastmod: TIME.getUnixFromDateString(obj.lastmod) }));
        return objs;
    }
    catch (error) {
        console.error(error);
        throw new Error("Unable to get current sitemap.");
    }
}
exports.getCurrentSitemap = getCurrentSitemap;
/**
* - Clean the `.textContent` to make search better
* - I am not sure if this has an effect
* @param s
*/
function cleanTextContent(s) {
    return s.replace(/(\n|\r|\s+)/g, ' ');
}
/**
* - Given the `main#PAGE` element, return an obj of {[hashString]: documentText} that can be used to store stuff in the database
* -
* @param el
*/
function parseLexicalPage(document, mainPageEl) {
    const retArr = [];
    const titleEl = document.querySelector('title');
    const descriptionEl = document.getElementById('META_OG_DESCRIPTION');
    const imageEl = document.getElementById('META_OG_IMAGE');
    if (!!!titleEl || !!!descriptionEl || !!!imageEl) {
        console.error("titleEl: ", titleEl, "descriptionEl:", descriptionEl, "imageEl:", imageEl);
        throw new Error("There should be a title, decription, and image element on every page of the website.");
    }
    const title = titleEl.textContent;
    const description = descriptionEl.getAttribute('content');
    const image = imageEl.getAttribute('content');
    if (!!!title || !!!description || !!!image) {
        console.error("Title: ", title, "Description: ", description, "Image: ", image);
        throw new Error("There should be a title, decription, and image on every page of the website.");
    }
    const samePageLinks = Array.from(mainPageEl.querySelectorAll('a[href^="#"]'));
    const lexicalHrefIdsAndTitles = [];
    samePageLinks.forEach((el) => {
        const hrefAttr = el.getAttribute('href');
        var sectionHeading = el.textContent;
        if (hrefAttr && sectionHeading) {
            const href = hrefAttr.slice(1);
            sectionHeading = cleanTextContent(sectionHeading);
            const sectionElement = document.getElementById(href);
            if (sectionElement) {
                if (sectionElement.id === el.id) {
                    lexicalHrefIdsAndTitles.push({ href: el.id, title: sectionHeading });
                    const parent = sectionElement.parentElement;
                    if (parent && /H(1|2|3|4|5|6)/.test(parent.tagName)) {
                        const grandParent = parent.parentElement;
                        // only add those links that are direct descendants of the root element
                        if (grandParent && grandParent.tagName === "DIV" && grandParent.classList.contains('lexical-wrapper'))
                            parent.setAttribute('data-temp-search-index', el.id);
                    }
                }
                else {
                    var textContent = sectionElement.textContent;
                    if (textContent) {
                        textContent = cleanTextContent(textContent);
                        sectionElement.remove();
                        retArr.push({ hash: href, document: textContent, section_title: sectionHeading.trim(), title, description, image });
                    }
                }
            }
        }
    });
    /**
     * Get the heading element for the section, and keep on marching until you meet another element with the
     *
     */
    lexicalHrefIdsAndTitles.forEach((obj) => {
        const { href, title: section_title } = obj;
        const el = document.querySelector(`[data-temp-search-index="${href}"]`);
        if (el) {
            var textContent = el.textContent;
            var currentEl = el;
            var nextSibling = el.nextElementSibling;
            while (textContent && nextSibling && !!!nextSibling.hasAttribute('data-temp-search-index')) {
                currentEl.remove();
                currentEl = nextSibling;
                nextSibling = null;
                var tempTextContent = currentEl.textContent;
                if (tempTextContent) {
                    textContent += tempTextContent;
                }
                nextSibling = currentEl.nextElementSibling;
            }
            if (textContent) {
                retArr.push({ hash: href, document: textContent, section_title: section_title.trim(), title, description, image });
            }
        }
    });
    var textContent = mainPageEl.textContent;
    if (textContent) {
        textContent = cleanTextContent(textContent);
        retArr.push({ hash: null, section_title: null, title, description, image, document: textContent });
    }
    return retArr;
}
/**
* - Given the `main#PAGE` element
* - Returns an array of { href: string (without the initial #), document: string } that can be used to store stuff in the database
*
*/
function parseNormalPage(document, mainPageEl) {
    const retArr = [];
    const titleEl = document.querySelector('title');
    const descriptionEl = document.getElementById('META_OG_DESCRIPTION');
    const imageEl = document.getElementById('META_OG_IMAGE');
    if (!!!titleEl || !!!descriptionEl || !!!imageEl) {
        console.error("titleEl: ", titleEl, "descriptionEl:", descriptionEl, "imageEl:", imageEl);
        throw new Error("There should be a title, decription, and image element on every page of the website.");
    }
    const title = titleEl.textContent;
    const description = descriptionEl.getAttribute('content');
    const image = imageEl.getAttribute('content');
    if (!!!title || !!!description || !!!image) {
        console.error("Title: ", title, "Description: ", description, "Image: ", image);
        throw new Error("There should be a title, decription, and image on every page of the website.");
    }
    const samePageLinks = Array.from(mainPageEl.querySelectorAll('a[href^="#"]'));
    samePageLinks.forEach((el) => {
        const hrefAttr = el.getAttribute('href');
        var sectionHeading = el.textContent;
        if (hrefAttr && sectionHeading) {
            const href = hrefAttr.slice(1);
            sectionHeading = cleanTextContent(sectionHeading);
            const sectionElement = document.getElementById(href);
            if (sectionElement) {
                var textContent = sectionElement.textContent;
                if (textContent) {
                    textContent = cleanTextContent(textContent);
                    sectionElement.remove();
                    retArr.push({ hash: href, document: textContent, section_title: sectionHeading.trim(), title, description, image });
                }
            }
        }
    });
    var textContent = mainPageEl.textContent;
    if (textContent) {
        textContent = cleanTextContent(textContent);
        retArr.push({ hash: null, section_title: null, title, description, image, document: textContent });
    }
    return retArr;
}
/**
* - Path should be the location (e.g., '/' representing home) and lastmod should be the Unix Time since the epoch where this page was last changed
* @param param0
*/
async function addPathToSearch({ path: pathStr, lastmod }) {
    try {
        const url = 'https://frankmbrown.net'.concat(pathStr);
        const pageHTTP = await axios_1.default.get(url, { timeout: 4000 });
        if (pageHTTP.status !== 200)
            throw new Error("Unable to add page " + pathStr + " to search.");
        const html = pageHTTP.data;
        const dom = new jsdom_1.JSDOM(html, {});
        const page = dom.window.document.querySelector('main#PAGE');
        if (!!!page) {
            throw new Error("There should be a `main#PAGE` on every page on this website.");
        }
        Array.from(page.querySelectorAll('script, form, dialog, div.tooltip, input, div[role="dialog"], style, *[data-no-search]'))
            .forEach((el) => el.remove());
        const IS_LEXICAL_PAGE = isLexicalOrMarkdownOrJupyterArticle(url);
        var res = [];
        if (IS_LEXICAL_PAGE) {
            console.log("Is Lexical Page");
            res = parseLexicalPage(dom.window.document, page);
        }
        else {
            console.log("Not Lexical Page");
            res = parseNormalPage(dom.window.document, page);
        }
        const db = (0, index_1.default)();
        for (let obj of res) {
            if (obj.document.length > 4000) {
                var charInd = 0;
                var tempDocText = '';
                while (charInd < obj.document.length) {
                    const docText = obj.document.slice(charInd, charInd + 4000);
                    if (docText === tempDocText) {
                        throw new Error("Duplicate Doc Test: " + obj.title);
                    }
                    tempDocText = docText;
                    const embedding = await (0, ai_1.createEmbedding)(docText, "text-embedding-ada-002");
                    charInd += 4000;
                    await db.query(`INSERT INTO search (path,hash,lastmod,title,description,image,document,embedding_vector,section_title) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`, [pathStr, obj.hash, lastmod, obj.title, obj.description, obj.image, docText, (0, pg_1.toSql)(embedding), obj.section_title]);
                }
            }
            else {
                const embedding = await (0, ai_1.createEmbedding)(obj.document, "text-embedding-ada-002");
                await db.query(`INSERT INTO search (path,hash,lastmod,title,description,image,document,embedding_vector,section_title) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`, [pathStr, obj.hash, lastmod, obj.title, obj.description, obj.image, obj.document, (0, pg_1.toSql)(embedding), obj.section_title]);
            }
        }
    }
    catch (e) {
        console.error(e);
        console.error('Unable to add path to search: ' + `https://frankmbrown.net${pathStr}`);
    }
}
exports.addPathToSearch = addPathToSearch;
/**
* Function to run to populate search after everything is removed from the search table
* - Get the title, description, image for each page
* -
*/
async function populateSearch() {
    try {
        await (0, index_1.default)().query(`DELETE FROM search;`);
        const sitemap = await getCurrentSitemap();
        for (let i = 0; i < sitemap.length; i++) {
            await addPathToSearch(sitemap[i]);
            console.log(sitemap[i].path);
        }
    }
    catch (error) {
        console.error(error);
        throw new Error("Unable to populate search");
    }
}
exports.populateSearch = populateSearch;
async function getPagesToUpdate() {
    const db = (0, index_1.default)();
    const pathsToUpdate = [];
    const currentSearchPathsDB = await db.query(`SELECT DISTINCT path, lastmod FROM search;`);
    const currentSearchPaths = currentSearchPathsDB.rows;
    const currentSearchPathsObj = {};
    currentSearchPaths.forEach((obj) => { currentSearchPathsObj[obj.path] = parseInt(obj.lastmod); });
    const currentSitemap = await getCurrentSitemap();
    const pathsToCheckForUpdate = {};
    currentSitemap.forEach((obj) => { pathsToCheckForUpdate[obj.path] = obj.lastmod; });
    const newPages = [];
    const updatedPages = [];
    const pagesToDelete = [];
    Object.keys(pathsToCheckForUpdate)
        .forEach((pathStr) => {
        if (currentSearchPathsObj[pathStr] === undefined) {
            newPages.push({ path: pathStr, lastmod: pathsToCheckForUpdate[pathStr] });
            pathsToUpdate.push({ path: pathStr, lastmod: pathsToCheckForUpdate[pathStr] });
        }
        else if (currentSearchPathsObj[pathStr] < pathsToCheckForUpdate[pathStr]) {
            updatedPages.push({ path: pathStr, lastmod: pathsToCheckForUpdate[pathStr] });
            pathsToUpdate.push({ path: pathStr, lastmod: pathsToCheckForUpdate[pathStr] });
        }
    });
    Object.keys(currentSearchPathsObj)
        .forEach((str) => {
        if (!!!pathsToCheckForUpdate[str])
            pagesToDelete.push(str);
    });
    return { newPages, pathsToUpdate, updatedPages, pagesToDelete };
}
/**
* - Function to run when you want to update search for the site
* - it relies on the sitemap for information
* - This function only gets the pages that need to be updated
* there is a confirmation after this to make sure that you want to update the pages.
*/
async function updateSearch(req, res) {
    try {
        const { newPages, pathsToUpdate, updatedPages, pagesToDelete } = await getPagesToUpdate();
        const template = `<div class="block mt-2">
    <h4 class="h6 bold">New Pages to Index:</h4>
    <ul class="mt-1">
        <%for(let i = 0; i < locals.newPages.length; i++){%>
            <li style="word-break: break-all;"><%=locals.newPages[i].path%></li>
        <%}%>
    </ul>
    <h4 class="h4 bold mt-2">Pages Updated Since Last Indexed:</h4>
    <ul class="mt-1">
        <%for(let i = 0; i < locals.updatedPages.length; i++){%>
            <li style="word-break: break-all;"><%=locals.updatedPages[i].path%></li>
        <%}%>
    </ul>
    <h4 class="h4 bold mt-2 t-error">Pages To Delete:</h4>
    <ul class="mt-1">
        <%for(let i = 0; i < locals.pagesToDelete.length; i++){%>
            <li style="word-break: break-all;"><%=locals.pagesToDelete[i]%></li>
        <%}%>
    </ul>
    <div class="alert warning icon mt-2 medium" role="alert">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Search"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
        <p class="alert">
            Are you sure you want to update the above pages in search? Click the button below to confirm.  
        </p>
    </div>
    <div class="mt-2 flex-row justify-center">
        <button type="button" class="icon-text success filled medium" hx-get="/admin/utilities/update-search/confirm" hx-indicator="#up-s-ind" hx-target="#update-search-confirm-out" hx-swap="innerHTML">
            <svg viewBox="0 0 448 512" title="check" focusable="false" inert tabindex="-1"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
            UPDATE SEARCH
        </button>
    </div>
</div>
<div class="flex-row justify-center t-primary htmx-indicator" role="progressbar" aria-busy="false" aria-label="Updating Search" id="up-s-ind">
    <div class="lds-dual-ring"></div>
</div>
<div class="mt-2" id="update-search-confirm-out">

</div>`;
        const str = ejs_1.default.render(template, { newPages, updatedPages, pagesToDelete });
        return res.status(200).send(str);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Unable to update search.'));
    }
}
exports.updateSearch = updateSearch;
async function updateSearchConfirm(req, res) {
    try {
        const { pathsToUpdate, pagesToDelete } = await getPagesToUpdate();
        const promiseArr1 = [];
        for (let i = 0; i < pagesToDelete.length; i++) {
            promiseArr1.push((0, index_1.default)().query(`DELETE FROM search WHERE path=$1;`, [pagesToDelete[i]]));
        }
        await Promise.all(promiseArr1);
        const promiseArr = [];
        const res1 = await (0, index_1.default)().query(`SELECT count(id) total_search_indexes FROM search;`);
        if (res1.rows.length !== 1)
            throw new Error("Unable to retrieve the amount of search indexes before deleting the search indexes.");
        const search_indexes_before = res1.rows[0].total_search_indexes;
        for (let obj of pathsToUpdate) {
            promiseArr.push((0, index_1.default)().query(`DELETE FROM search WHERE path=$1;`, [obj.path]));
        }
        await Promise.all(promiseArr);
        for (let obj of pathsToUpdate) {
            await addPathToSearch(obj);
        }
        const res2 = await (0, index_1.default)().query(`SELECT count(id) total_search_indexes FROM search;`);
        if (res2.rows.length !== 1)
            throw new Error("Unable to retrieve the amount of search indexes after deleting the search indexes.");
        const search_indexes_after = res2.rows[0].total_search_indexes;
        const template = `<div class="mt-2 block">
    <p>Amount of search indexes before update: <span class="t-primary bold"><%=locals.before%></span></p>
    <p class="mt-1">Amount of search indexes after update: <span class="t-secondary bold"><%=locals.after%></span></p>
</div>`;
        const str = ejs_1.default.render(template, { befor: search_indexes_before, after: search_indexes_after });
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully updated pages in search database.").concat(str));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Unable to update search.'));
    }
}
exports.updateSearchConfirm = updateSearchConfirm;
async function updateSearchImages() {
    try {
        const dbImagesAndPathsRes = await (0, index_1.default)().query(`SELECT DISTINCT path, image FROM search;`);
        const dbImagesAndPaths = dbImagesAndPathsRes.rows;
        for (let { path, image } of dbImagesAndPaths) {
            const url = 'https://frankmbrown.net'.concat(path);
            const pageHTTP = await axios_1.default.get(url, { timeout: 4000 });
            const html = pageHTTP.data;
            const dom = new jsdom_1.JSDOM(html, {});
            const imageEl = dom.window.document.getElementById('META_OG_IMAGE');
            if (!!!imageEl)
                throw new Error("There should be a title, decription, and image on every page of the website.");
            const newImageStr = imageEl.getAttribute('content');
            if (newImageStr && newImageStr !== image) {
                await (0, index_1.default)().query(`UPDATE search SET image=$1 WHERE path=$2;`, [newImageStr, path]);
                console.log("Updated search image for ".concat(path).concat('.'));
            }
        }
    }
    catch (error) {
        console.error(error);
        throw new Error("Unable to update search images in database.");
    }
}
exports.updateSearchImages = updateSearchImages;
async function addPageImageAndTwitterImageToPage(imageURL) {
    try {
        const image = await (0, image_1.getImageFromUrl)(imageURL);
        if (!!!image)
            throw new Error("Unable to get image from URL.");
        const isOpaque = await (0, image_1.isImageOpaque)(image);
        var newImage;
        if (!!!isOpaque) {
            const background = await (0, image_1.getTransparentImageBackgroundColor)(image);
            newImage = await (0, cmd_1.executeWithArgument)("magick", ['convert', '-', '-background', background, '-flatten', 'jpeg:-'], image);
        }
        else {
            newImage = image;
        }
        var name = imageURL.replace('https://image.storething.org/frankmbrown/', '');
        if (name.startsWith('og-image/'))
            name = name.replace('og-image/', '');
        const { twitter, linkedin } = await (0, image_1.createTwitterAndLinkedInImages)(image);
        const key = 'frankmbrown/'.concat(name);
        const twitterKey = 'frankmbrown/twitter/'.concat(name);
        const linkedinKey = 'frankmbrown/og-image/'.concat(name);
        await Promise.all([
            (0, aws_implementation_1.uploadImageObject)(key, newImage, 'jpg', {}, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(twitterKey, twitter, 'jpg', {}, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(linkedinKey, linkedin, 'jpg', {}, 3, 25)
        ]);
    }
    catch (e) {
        console.error(e);
    }
}
async function updateSearchImagesInitial(req, res) {
    try {
        const arr = [];
        const dbImagesAndPathsRes = await (0, index_1.default)().query(`SELECT DISTINCT path, image FROM search;`);
        const dbImagesAndPaths = dbImagesAndPathsRes.rows;
        for (let { path, image } of dbImagesAndPaths) {
            console.log(path, image);
            const url = 'https://frankmbrown.net'.concat(path);
            const pageHTTP = await axios_1.default.get(url, { timeout: 4000 });
            const html = pageHTTP.data;
            const dom = new jsdom_1.JSDOM(html, {});
            const imageEl = dom.window.document.getElementById('META_OG_IMAGE');
            if (!!!imageEl)
                throw new Error("There should be a title, description, and image on every page of the website.");
            const newImageStr = imageEl.getAttribute('content');
            if (newImageStr && newImageStr !== image) {
                arr.push({ newImage: newImageStr, oldImage: image, url });
                const twitterURL = newImageStr.replace('https://image.storething.org/frankmbrown', 'https://image.storething.org/frankmbrown/twitter');
                const pageURL = newImageStr.replace('https://image.storething.org/frankmbrown', 'https://image.storething.org/frankmbrown/og-image');
                const [twitterImage, pageImage] = await Promise.all([
                    (0, image_1.getImageFromUrl)(twitterURL).catch((e) => undefined),
                    (0, image_1.getImageFromUrl)(pageURL).catch((e) => undefined)
                ]);
                if (!!!twitterImage || !!!pageImage) {
                    await addPageImageAndTwitterImageToPage(newImageStr);
                }
            }
            else if (image.startsWith('https://image.storething.org/frankmbrown')) {
                const twitterURL = image.replace('https://image.storething.org/frankmbrown', 'https://image.storething.org/frankmbrown/twitter');
                const pageURL = image.replace('https://image.storething.org/frankmbrown', 'https://image.storething.org/frankmbrown/og-image');
                const [twitterImage, pageImage] = await Promise.all([
                    (0, image_1.getImageFromUrl)(twitterURL).catch((e) => undefined),
                    (0, image_1.getImageFromUrl)(pageURL).catch((e) => undefined)
                ]);
                if (!!!twitterImage || !!!pageImage) {
                    await addPageImageAndTwitterImageToPage(image);
                }
            }
        }
        const template = `<%if(Array.isArray(locals.arr)&&locals.arr.length){%>
  <div class="flex-row justify-center t-info htmx-indicator mt-2" role="progressbar" aria-busy="false" aria-label="Updating Search Images" id="up-s-im-ind">
    <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
  </div>
  <div id="replace-this-update-images">
    <div class="table-wrapper mt-2">
      <table cellspacing="0">
        <caption class="h5 bold">Update Images:</caption>
      <thead>
        <tr>
          <th scope="col">Url</th>
          <th scope="col" colspan="2">Images</th>
        </tr>
      </thead>
      <tbody>
        <%for (let i = 0; i < locals.arr.length; i++){%>
          <tr>
            <td rowspan="2"><%=locals.arr[i].url%></td>
            <th scope="col">Old Image:</th>
            <th scope="col">New Image:</th>
          </tr>
          <tr>
            <td><img src="<%=locals.arr[i].oldImage%>" alt="Old Image" style="width:50px;height:50px;" width="50" height="50" /></td>
            <td><img src="<%=locals.arr[i].newImage%>" alt="New Image" style="width:50px;height:50px;" width="50" height="50" /></td>
          </tr>
        <%}%>
      </tbody>
    </table>
    </div>
    <div class="mt-2 flex-row justify-center" hx-get="/admin/utilities/update-search-images/confirm" hx-target="#replace-this-update-images" hx-swap="innerHTML" hx-indicator="#up-s-im-ind">
      <button type="button" class="success filled icon-text medium">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Update"><path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"></path></svg>
        UPDATE IMAGES
      </button>
    </div>
  </div>
 
<%}else{%>
  <div class="alert icon success filled medium mt-1" role="alert">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Checklist"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"></path></svg>
    <p class="alert">
      There are no paths to update images for!
    </p>
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>
  </div>
<%}%>
`;
        const str = ejs_1.default.render(template, { arr });
        return res.status(200).send(str);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)("Unable to get paths for updating search images in database."));
    }
}
exports.updateSearchImagesInitial = updateSearchImagesInitial;
async function updateSearchImagesConfirm(req, res) {
    try {
        await updateSearchImages();
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully updated images for pages in the database!"));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)("Unable to update search images in databse."));
    }
}
exports.updateSearchImagesConfirm = updateSearchImagesConfirm;
