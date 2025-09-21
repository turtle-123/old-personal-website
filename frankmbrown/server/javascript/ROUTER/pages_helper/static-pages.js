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
exports.getChangeSitePermissionsPage = exports.downloadSPAMobile = exports.deleteStreamOfConsciousNess = exports.likeStreamOfConsciousness = exports.addToStreamOfConsciousness = exports.postStreamOfConsciousness = exports.getStreamOfConsciousness = exports.addTexNote = exports.addTexNoteUpcoming = exports.downloadTexNote = exports.getTexNote = exports.getTexNotes = exports.updateDailyReadingArticle = exports.addUpcomingDailyReading = exports.postDailyReading = exports.getDailyReadingOfTheDay = exports.postDailyReadingOld = exports.getDailyReadingOld = exports.getDailyReading = exports.searchDailyReading = exports.searchFranksLink = exports.addFranksLink = exports.getFranksLinks = exports.getFrankBrownLinks = exports.postTestRun = exports.postTest = exports.getTest = exports.get404 = exports.getHome = exports.postGetImageData = exports.postGetImageDataHelper = exports.renderCodeWrapper = exports.getUtilities = exports.getProjects = exports.getNotes = exports.getPrivacyPolicy = exports.deleteQuotes = exports.postQuotes = exports.getQuotes = exports.getAbout = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const redirect_override_1 = require("../helper_functions/redirect-override");
const html_1 = require("../html");
const TIME = __importStar(require("../../utils/time"));
const database_1 = __importDefault(require("../../database"));
const escape_html_1 = __importDefault(require("escape-html"));
const lexical_1 = require("../../lexical");
const jsdom_1 = require("jsdom");
const ejs_1 = __importDefault(require("ejs"));
const lexicalImplementations_1 = require("./lexicalImplementations");
const node_crypto_1 = __importDefault(require("node:crypto"));
const handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
const cmd_1 = require("../../utils/cmd");
const markdown_1 = require("../functions/markdown");
const aws_implementation_1 = require("../../aws/aws-implementation");
const personal_website_shared_1 = require("../../personal-website-shared");
const ai_1 = require("../../ai");
const pgvector_1 = __importDefault(require("pgvector"));
const image_1 = require("../../utils/image");
const test_1 = require("../../scripts/test");
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const COMMON_SVG_1 = __importDefault(require("../../CONSTANTS/COMMON_SVG"));
const filenamify_1 = __importDefault(require("filenamify"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const projects_1 = require("./projects");
const quoteCacheStringAdmin = 'frankmbrown-quotes-admin';
const quoteCacheString = 'frankmbrown-quotes';
const dailyReadingUpcomingCacheString = 'frankmbrown-wiki-upcoming';
const dailyReadingDoneCacheString = 'frankmbrown-wiki';
const dailyReadingSVG = '<svg viewBox="0 0 640 512" title="wikipedia-w" focusable="false" inert tabindex="-1"><path d="M640 51.2l-.3 12.2c-28.1.8-45 15.8-55.8 40.3-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1-.3.3-15 0-15-.3C172 352.3 122.8 243.4 75.8 133.4 64.4 106.7 26.4 63.4.2 63.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2 21.9 49.7 103.6 240.3 125.6 288.6 15-29.7 57.8-109.2 75.3-142.8-13.9-28.3-58.6-133.9-72.8-160-9.7-17.8-36.1-19.4-55.8-19.7V49.8l142.5.3v13.1c-19.4.6-38.1 7.8-29.4 26.1 18.9 40 30.6 68.1 48.1 104.7 5.6-10.8 34.7-69.4 48.1-100.8 8.9-20.6-3.9-28.6-38.6-29.4.3-3.6 0-10.3.3-13.6 44.4-.3 111.1-.3 123.1-.6v13.6c-22.5.8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7L559.2 91.8c-8.6-23.1-36.4-28.1-47.2-28.3V49.6l127.8 1.1.2.5z"></path></svg>';
const ejsQuoteTemplate = /*html*/ `<div style="padding: 4px; border-bottom: 2px solid var(--divider);" data-quote> 
<%if(locals.admin===true){%>
  <div class="flex-row justify-end" style="margin-bottom:4px;">
    <button class="error icon filled small" hx-delete="/quotes/<%=locals.id%>" hx-trigger="click" hx-swap="outerHTML" hx-target="closest div[data-quote]">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
    </button>
  </div>
<%}%>
<blockquote class="blockquote" cite="https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url">
    <%-locals.newQuote%>
    <br>
    <%if(locals.quoteCitationUrl!==null){%>
      <a class="secondary link fw-regular" target="_blank" href="<%=locals.quoteCitationUrl%>">
      <%=locals.quoteCitation%>
      </a>
    <%}else{%>
      <i class="italic fw-regular"><%=locals.quoteCitation%></i>
    <%}%>
</blockquote>
<%-locals.aboutTheQuoteParsed%>
    </div>
`;
function getAbout(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'About', item: '/about', position: 2 }];
    const title = "About frankmbrown.net";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "About this site", "Plato", "Socrates", "Epistemology", "Blog", "Notes", "Projects"];
    const description = 'Learn more about frankmbrown.net and what I plan to do with this website.';
    const tableOfContents = [
        {
            "id": "about-net",
            "text": "About"
        },
        {
            "id": "links-about",
            "text": "Links"
        },
        {
            "id": "application-hotkeys",
            "text": "Application Hotkeys"
        }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/about' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/about', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getAbout = getAbout;
async function getQuotes(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Frank\'s Quote Page', item: '/quotes', position: 2 }];
    const title = "Frank's Quote Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Quotes"];
    const description = 'I decided to add a quote page to this site à la Paul Graham\'s Quotes page on his website. I have been reading a textbook and each of the chapters begins with a quote, and I found one that was pretty good - one that I wanted to keep in mind, so I decided to create this page.';
    const tableOfContents = [
        {
            id: "about-this-page",
            text: "About"
        }
    ];
    var quotesHTML = '';
    if (req.session.auth && req.session.auth.level >= 3) {
        tableOfContents.push({
            id: "add-a-quote",
            text: "Add A Quote"
        });
        try {
            const quotesAdminCache = await req.cache.get(quoteCacheStringAdmin);
            if (typeof quotesAdminCache !== 'string') {
                const quotesAdminDb = await (0, database_1.default)().query('SELECT admin_html FROM quotes ORDER BY date_added DESC;');
                if (quotesAdminDb.rows.length) {
                    const quotesStrTemp = quotesAdminDb.rows.map((obj) => obj.admin_html).join('');
                    await req.cache.set(quoteCacheStringAdmin, quotesStrTemp);
                    quotesHTML = quotesStrTemp;
                }
                else {
                    quotesHTML = (0, html_1.getWarningAlert)('There are no quotes to show currently.', '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>');
                }
            }
            else {
                quotesHTML = quotesAdminCache;
            }
        }
        catch (error) {
            console.error(error);
            quotesHTML = (0, html_1.getErrorAlert)('Unable to get quotes from database. Try reloading the page.', '<svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>');
        }
    }
    else {
        try {
            const quotesCache = await req.cache.get(quoteCacheString);
            if (typeof quotesCache !== 'string') {
                const quotesDb = await (0, database_1.default)().query('SELECT html FROM quotes ORDER BY date_added DESC;');
                if (quotesDb.rows.length) {
                    const quotesStrTemp = quotesDb.rows.map((obj) => obj.html).join('');
                    await req.cache.set(quoteCacheString, quotesStrTemp);
                    quotesHTML = quotesStrTemp;
                }
                else {
                    quotesHTML = (0, html_1.getWarningAlert)('There are no quotes to show currently.', '<svg viewBox="0 0 448 512" title="quote-right" focusable="false" inert tabindex="-1"><path d="M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H320c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72zm-256 0c0 66.3-53.7 120-120 120H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64V160c0-35.3 28.7-64 64-64h64c35.3 0 64 28.7 64 64v32 32 72z"></path></svg>');
                }
            }
            else {
                quotesHTML = quotesCache;
            }
        }
        catch (error) {
            console.error(error);
            quotesHTML = (0, html_1.getErrorAlert)('Unable to get quotes from database. Try reloading the page.', '<svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>');
        }
    }
    tableOfContents.push({
        id: "quotes-quotes",
        text: "Quotes"
    });
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/quotes' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/quotes', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        quotesHTML
    });
}
exports.getQuotes = getQuotes;
async function postQuotes(req, res) {
    var initializedDomInNode = false;
    const db = (0, database_1.default)();
    try {
        const quote = req.body['quote-input'];
        const quoteCitation = req.body['quote-citation'];
        const quoteCitationUrlStr = req.body['quote-citation-url'];
        const aboutTheQuote = req.body['what-you-liked-about-quote'];
        if (typeof quote !== 'string' || quote.length < 1 || quote.length > 5000)
            throw new Error('Invalid quote.');
        if (typeof quoteCitation !== 'string' || quoteCitation.length < 1)
            throw new Error('Invalid quote citation.');
        if (typeof quoteCitationUrlStr === 'string' && quoteCitationUrlStr.length)
            (new URL(quoteCitationUrlStr));
        const quoteCitationUrl = typeof quoteCitationUrlStr === 'string' && quoteCitationUrlStr.length ? (new URL(quoteCitationUrlStr)).href : null;
        if (typeof aboutTheQuote !== 'string')
            throw new Error('Invalid about the quote input.');
        (0, lexical_1.initializeDomInNode)('desktop', aboutTheQuote);
        initializedDomInNode = true;
        const document = new jsdom_1.JSDOM(aboutTheQuote);
        const aboutTheQuoteParsed = document.window.document.body.innerHTML;
        (0, lexical_1.removeDOMFromNode)();
        initializedDomInNode = false;
        const connection = await db.connect();
        try {
            await connection.query('BEGIN;');
            const now = TIME.getUnixTime();
            const queryRes1 = await connection.query('INSERT INTO quotes (quote_text,citation,citation_url,date_added,about_the_quote) VALUES ($1,$2,$3,$4,$5) RETURNING id;', [quote, quoteCitation, quoteCitationUrl, now, aboutTheQuoteParsed]);
            if (!!!queryRes1.rows.length)
                throw new Error("Unable to insert quote into the database.");
            const { id } = queryRes1.rows[0];
            const newQuote = quote.split(/\n/g)
                .map((str) => str.split(/(\t|(\s\s\s\s))/g))
                .map((subArr) => subArr.map((str) => (0, escape_html_1.default)(str)))
                .map((subArr) => subArr.join('<span style="white-space: preserve;">    </span>')).join('<br />');
            const html = ejs_1.default.render(ejsQuoteTemplate, {
                id,
                admin: false,
                newQuote,
                quoteCitation,
                quoteCitationUrl,
                aboutTheQuoteParsed
            });
            const adminHtml = ejs_1.default.render(ejsQuoteTemplate, {
                id,
                admin: true,
                newQuote,
                quoteCitation,
                quoteCitationUrl,
                aboutTheQuoteParsed
            });
            const queryRes2 = await connection.query(`UPDATE quotes SET html=$1, admin_html=$2 WHERE id=$3 RETURNING id;`, [html, adminHtml, id]);
            if (!!!queryRes2.rows.length)
                throw new Error("Unable to update quotes in database.");
            await Promise.all([
                connection.query('COMMIT;'),
                req.cache.del(quoteCacheString),
                req.cache.del(quoteCacheStringAdmin)
            ]);
            connection.release();
            return res.status(200).send((0, html_1.getSuccessAlert)("Successfully inserted the quote into the database. Reload the page to see the quote in action."));
        }
        catch (error) {
            await new Promise((resolve, reject) => {
                connection.query('ROLLBACK;')
                    .then(() => {
                    connection.release();
                    resolve(true);
                })
                    .catch((e) => {
                    console.error(e);
                    reject(false);
                });
            });
            throw new Error("Something went wrong inserting a new quote into the database.");
        }
    }
    catch (error) {
        if (initializedDomInNode)
            (0, lexical_1.removeDOMFromNode)();
        console.error(error);
        const errorMsg = (0, html_1.getErrorAlert)('Unable to post quote to database. Check inputs again.');
        return res.status(200).send(errorMsg);
    }
}
exports.postQuotes = postQuotes;
async function deleteQuotes(req, res) {
    try {
        const { id: idStr } = req.params;
        if (typeof idStr !== 'string')
            throw new Error('Invalid ID query parameter for deleing quote.');
        const id = parseInt(idStr);
        if (!!!Number.isInteger(id))
            throw new Error('id query parameter must be an integer when deleting quotes.');
        const db = (0, database_1.default)();
        const [deleteRes, ...rest] = await Promise.all([
            db.query(`DELETE FROM quotes WHERE id=$1::smallint RETURNING id;`, [Number(id)]),
            req.cache.del(quoteCacheString),
            req.cache.del(quoteCacheStringAdmin)
        ]);
        if (!!!deleteRes.rows.length)
            throw new Error('Unable to delete row from database.');
        return res.status(200).send((0, html_1.getSuccessAlert)('Successfully deleted quote from database.'));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Unable to delete quote. Try relaoding the page.'));
    }
}
exports.deleteQuotes = deleteQuotes;
function getPrivacyPolicy(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Privacy Policy', item: '/privacy-policy', position: 2 }];
    const title = "frankmbrown.net Privacy Policy";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Privacy Policy"];
    const description = 'Privacy Policy for frankmbrown.net. I don\'t really collect any information on users right now.';
    const tableOfContents = [{ id: 'privacy-policy-main', text: 'Privacy Policy' }];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/privacy-policy' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/privacy-policy', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getPrivacyPolicy = getPrivacyPolicy;
function getNotes(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Notes', item: '/note', position: 2 }];
    const title = "Frank's Notes";
    const keywords = ["Notes", "Fraank McKee Brown"];
    const description = 'View Frank\'s notes. One of the main reasons for creating this site was to have a place to document my notes in a place that I could easily find and search.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/note' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/notes', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getNotes = getNotes;
function getProjects(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 }];
    const title = "Frank's Projects";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Projects", "My Design System"];
    const description = 'View Frank\'s projects. My latest project is creating the design system which can be seen at https://frankmbrown.net/design-system.';
    const tableOfContents = [
        { id: 'what-is-this', text: 'What Is This' },
        { id: 'projects', text: 'Projects' },
        { id: "ai-projects", text: 'AI Projects' },
        { id: "to-be-completed", text: "To Be Completed" },
        { id: "vis-projects", text: 'Visualization Projects' },
        { id: "section-archive", text: 'Projects Archive' },
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getProjects = getProjects;
function getUtilities(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Utilities', item: '/utilities', position: 2 }
    ];
    const title = "Frank's Utilities";
    const keywords = ["Code", "Frank McKee Brown", "frankmbrown.net", "Frank Brown"];
    const description = 'Generate <code> HTML markup in any coding language using highlight-js, generate <math> markup using KaTeX, and validate and generate geojson.';
    const tableOfContents = [
        {
            "id": "util-escape-string",
            "text": "Escape String"
        },
        {
            "id": "util-math-markup",
            "text": "Generate Math Markup"
        },
        {
            "id": "util-code-markup",
            "text": "Generate Code Markup"
        },
        {
            "id": "markdown-to-html",
            "text": "Markdown To HTML"
        },
        {
            "id": "upload-image-get-data",
            "text": "Upload Image, Get Data"
        },
        {
            "id": "csv-excel-to-html-table",
            "text": "CSV/Excel to HTML"
        },
        {
            "id": "html-table-to-csv-json",
            "text": "HTML Table to CSV"
        },
        {
            "id": "util-pattern-validator",
            "text": "Pattern Validator"
        },
        {
            "id": "util-random-id-gen",
            "text": "Random ID Generator"
        }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/utilities' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/utilities', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getUtilities = getUtilities;
function renderCodeWrapper({ block, htmlString, language, relevance, snackbarID }) {
    const HTML_STRING_TO_COPY = block ? /*html*/ `<div style="position: relative;"><pre class="hz-scroll"><code class="hljs">${htmlString}</code></pre>
  <button aria-label="Copy Code Output" data-snackbar data-selem="#copy-code-success" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;" aria-haspopup="true">
    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
      </path>
    </svg>
  </button>
</div>` : /*html*/ `<span><code class="hljs">${htmlString}</code></span>`;
    const HTML = /*html*/ `
  <div class="success snackbar dialog-snackbar" aria-hidden="true" data-snacktime="4000" id="${snackbarID}">
    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
    <p class="p-sm">HTML Elements with highlighted code copied to clipboard!</p>
    <button aria-label="Close Snackbar" class="icon medium" type="button" data-close-snackbar>
      <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div>
</div>
<div class="block mt-2">
  ${HTML_STRING_TO_COPY}
</div>
<div class="block">
  <p class="flex-row justify-begin align-center body2 w-100">
    <span class="bold" style="margin-right: 4px;">Language:</span>${language}
  </p>
  <p class="flex-row justify-begin align-center body2 w-100">
    <span class="bold" style="margin-right: 4px;">Relevance:</span> ${relevance}
  </p>
</div>`;
    return HTML;
}
exports.renderCodeWrapper = renderCodeWrapper;
async function postGetImageDataHelper(imageBuffer, req, addBackgroundColorIfTransparent = true) {
    var _a, _b;
    var imageInformation = await (0, cmd_1.executeWithArgument)('magick', ['identify', '-format', '%wx%hx%[opaque]', '-'], imageBuffer);
    imageInformation = imageInformation.toString('utf-8').trim();
    const widthHeight = imageInformation.split('x');
    if (widthHeight.length !== 3)
        throw new Error("Something went wrong getting the width, height, and opacity of the image.");
    const width = parseFloat(widthHeight[0]);
    const height = parseFloat(widthHeight[1]);
    const background = await (0, image_1.getImageBackgroundColor)(imageBuffer);
    const { widthDesktop, heightDesktop, widthTablet, heightTablet, widthMobile, heightMobile, aspectRatioStr } = (0, markdown_1.getSizesFromWidthAndHeight)(width, height);
    const upToResize = ['convert', '-', '-gravity', 'center', '-thumbnail', `${widthDesktop}x${heightDesktop}`];
    const after = [];
    if (addBackgroundColorIfTransparent) {
        after.push('-background', background);
    }
    after.push('-extent', `${widthDesktop}x${heightDesktop}`);
    const [desktopImage, mobileImage, tabletImage] = await Promise.all([
        (0, cmd_1.executeWithArgument)('magick', [...upToResize, ...image_1.RESIZE_OPTIONS_BEFORE, ...after, 'jpeg:-'], imageBuffer),
        (0, cmd_1.executeWithArgument)('magick', [...upToResize, ...image_1.RESIZE_OPTIONS_BEFORE, ...after, 'jpeg:-'], imageBuffer),
        (0, cmd_1.executeWithArgument)('magick', [...upToResize, ...image_1.RESIZE_OPTIONS_BEFORE, ...after, 'jpeg:-'], imageBuffer)
    ]);
    const uuid = node_crypto_1.default.randomUUID();
    const desktopKey = "frankmbrown/" + uuid + "-desktop.jpeg";
    const tabletKey = "frankmbrown/" + uuid + "-tablet.jpeg";
    const mobileKey = "frankmbrown/" + uuid + "-mobile.jpeg";
    const { user_id, ip_id } = (0, aws_implementation_1.getUserIdAndIpIdForImageUpload)(req);
    const [desktopURL, tabletURL, mobileURL] = await Promise.all([
        (0, aws_implementation_1.uploadImageObject)(desktopKey, desktopImage, 'jpeg', { width: String(widthDesktop), height: String(heightDesktop) }, user_id, ip_id),
        (0, aws_implementation_1.uploadImageObject)(tabletKey, tabletImage, 'jpeg', { width: String(widthTablet), height: String(heightTablet) }, user_id, ip_id),
        (0, aws_implementation_1.uploadImageObject)(mobileKey, mobileImage, 'jpeg', { width: String(widthMobile), height: String(heightMobile) }, user_id, ip_id),
    ]);
    const html = `<img 
width="<%-locals.desktop?${widthDesktop}:(locals.tablet?${widthTablet}:${widthMobile})%>" 
height="<%-locals.desktop?${heightDesktop}:(locals.tablet?${heightTablet}:${heightMobile})%>" 
style="margin: 4px auto; max-width: 100%; aspect-ratio: auto ${aspectRatioStr} !important; height: auto;"
srcset="${mobileURL} ${widthMobile}w, ${tabletURL} ${widthTablet}w, ${desktopURL} ${widthDesktop}w" 
sizes="(max-width: 550px) ${heightMobile}px, ((min-width: 550px) and (max-width: 1200px)) ${heightTablet}px, (min-width: 1200px) ${heightDesktop}px" 
src="${desktopURL}" 
alt="" 
/>`;
    const highlightResult = personal_website_shared_1.highlight.highlight(html, { language: 'vbscript-html' });
    const htmlString = highlightResult.value;
    const img = `<div class="mt-2">` + ejs_1.default.render(html, { desktop: Boolean((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop), tablet: Boolean((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) }) + "</div>";
    const retStr = renderCodeWrapper({ block: true, htmlString: htmlString, language: 'html', relevance: 1, snackbarID: `copy_html_code_snackbar_`.concat(node_crypto_1.default.randomUUID()) });
    return retStr.concat(img);
}
exports.postGetImageDataHelper = postGetImageDataHelper;
async function postGetImageData(req, res) {
    try {
        const file = req.file;
        const addBackgroundColorIfTransparent = Boolean(req.body['add-bg-trans'] === 'on');
        if (!!!file)
            throw new Error("Unable to get image file.");
        var imageBuffer = file.buffer;
        const str = await postGetImageDataHelper(imageBuffer, req, addBackgroundColorIfTransparent);
        return res.status(200).send(str);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong getting data for image.', '<svg viewBox="0 0 512 512" title="image" focusable="false" inert tabindex="-1"><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"></path></svg>'));
    }
}
exports.postGetImageData = postGetImageData;
function getHome(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }];
    const title = "Welcome to frankmbrown.net";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Personal Site"];
    const description = 'Welcome to my personal website. On this website, I plan to host a blog, my notes, and some projects. If you see anything on this site that you like or don\'t like, you can email me. If you are looking for why I created this site, see the About page.';
    const tableOfContents = [
        { id: 'site-introduction', text: 'Introduction' },
        { id: 'on-this-site', text: 'On This Page' },
        { id: "where-else-find-me", text: "Where Else to Find Me on the Internet" }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/home', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getHome = getHome;
function get404(req, res) {
    const { something } = req.params;
    const isHxRequest = Boolean(req.get('hx-request') === "true");
    const target = req.get('hx-target');
    var contentType = req.headers['content-type'];
    if ((isHxRequest && target !== 'PAGE' && target !== '#PAGE') || req.is('application/json')) {
        return res.status(200).send((0, html_1.getErrorSnackbar)('This was an unrecognized request! Try reloading the page.'));
    }
    else {
        if (something !== '404') {
            console.log("Page not found:", something);
            return (0, redirect_override_1.redirect)(req, res, '/404', 404, { severity: 'error', message: 'Page not found.' });
        }
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Not Found', item: '/404', position: 2 }];
        const title = "Frank's Not Found Page";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Not Found Page", "Navigate Home"];
        const description = 'We were unable to find the page you were looking for. Try navigating back to the home page.';
        const tableOfContents = [];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/404' };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render('pages/404', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables
        });
    }
}
exports.get404 = get404;
function getTest(req, res) {
    var _a;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Test Page', item: '/test', position: 2 }];
    const title = "Test Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Test Page", "My Design System"];
    const description = 'View Frank\'s projects. My latest project is creating the design system which can be seen at https://frankmbrown.net/design-system.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/test', noIndex: true };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    const fullLexicalEditor = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "test-editor", '<p>Test the HTML to Markdown functionality...<p>');
    return res.status(200).render('pages/test', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        isPhone: Boolean(true === ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.phone)),
        fullLexicalEditor,
    });
}
exports.getTest = getTest;
function postTest(req, res) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const phoneOnly = req.body['phone-only'];
        if (phoneOnly === "checked") {
            req.session.device = {
                phone: true,
                tablet: false,
                desktop: false,
                browser: ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.device) === null || _b === void 0 ? void 0 : _b.browser) || '',
                temp: ((_d = (_c = req.session) === null || _c === void 0 ? void 0 : _c.device) === null || _d === void 0 ? void 0 : _d.temp) || '',
            };
        }
        else {
            req.session.device = {
                phone: false,
                tablet: false,
                desktop: true,
                browser: ((_f = (_e = req.session) === null || _e === void 0 ? void 0 : _e.device) === null || _f === void 0 ? void 0 : _f.browser) || '',
                temp: ((_h = (_g = req.session) === null || _g === void 0 ? void 0 : _g.device) === null || _h === void 0 ? void 0 : _h.temp) || '',
            };
        }
        return res.status(200).send(/*html*/ `<script nonce="<%=locals.jsNonce%>">
    (() => {
        window.location.reload()
    })()
</script>`);
    }
    catch (e) {
        return res.status(200).send((0, html_1.getErrorAlert)("Unable to change req.session.device."));
    }
}
exports.postTest = postTest;
async function postTestRun(req, res) {
    try {
        const str = await (0, test_1.runTest)(req);
        return res.status(200).send(`<div>${str}</div>`);
    }
    catch (e) {
        return res.status(200).send((0, html_1.getErrorAlert)("Unable to change req.session.device."));
    }
}
exports.postTestRun = postTestRun;
/* ----------------------------- Links -------------------- */
const renderLink = (req, obj) => {
    var _a;
    const dateTime = TIME.getDateTimeStringFromUnix(obj.date_added);
    const formattedDate = TIME.formatDateFromUnixTime("MM/DD/YYYY", ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York', obj.date_added);
    var hrefToUse = obj.href;
    var url = new URL(obj.href);
    const querYStr = url.search;
    if (querYStr)
        hrefToUse = hrefToUse.replace(querYStr, '');
    return `
<div style="border: 2px solid var(--divider); border-radius: 0.5rem;" class="p-md mt-2"> 
  <span class="flex-row align-center justify-between">
    <div class="grow-1 flex-row justify-start align-center gap-1">
      <img src="${obj.image_url}" width="25" height="25" style="width:25px;height:25px;margin:0px; margin-right: 2px;" class="no-click" alt="${(0, escape_html_1.default)(obj.title).concat(" Link Image")}" />
      <span class="h6 fw-regular grow-1" style="text-decoration: none!important;">
      ${(0, escape_html_1.default)(obj.title)}
      </span>
    </div>
    <time data-date-format="MM/DD/YYYY" datetime="${dateTime}">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday" style="width:1.25rem; height: 1.25rem;">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
        </path>
      </svg>
      <span style="font-size: 1rem;">${(0, escape_html_1.default)(formattedDate)}</span>
    </time>
  </span>
  <a class="secondary link" target="_blank" href="${obj.href}">
  ${(0, escape_html_1.default)(hrefToUse)}
  </a>
  <span class="block mt-1 body2">
    ${(0, escape_html_1.default)(obj.description)}
  </span>
</div>
  `;
};
async function getFrankBrownLinks(req) {
    try {
        const GET_LINKS_QUERY = `SELECT description, date_added, href, title, image_url FROM links ORDER BY date_added DESC LIMIT 1000;`;
        const dbRes = await (0, database_1.default)().query(GET_LINKS_QUERY);
        const str = dbRes.rows.map(obj => renderLink(req, obj)).join('');
        return str;
    }
    catch (error) {
        console.error(error);
        return (0, html_1.getErrorAlert)('Something went wrong getting the links from cache.');
    }
}
exports.getFrankBrownLinks = getFrankBrownLinks;
async function getFranksLinks(req, res) {
    var _a;
    const view = 'pages/links';
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Links', item: '/links', position: 2 }
    ];
    const title = "Frank\'s Links";
    const description = 'I wanted to create this page to keep track of helpful resources that I found around the web. The bookmarks tab for the search engine that I use is not really helpful beyond a certain number of links, and it is sometimes hard to remember why I bookmarked a certain page.';
    const isAdmin = Boolean(((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) === 3);
    const tableOfContents = [
        { id: 'why-create-this', text: 'Why Create This' },
        { id: 'search-links-section', text: 'Search Links' }
    ];
    const common_links = [
        { "name": "Kaggle", "image": "https://image.storething.org/frankmbrown/7243df09-3afe-4bf8-99ad-a92ca7ccd8ca.png" },
        { "name": "GitHub", "image": "https://image.storething.org/frankmbrown/24951bd3-6fda-440f-a1db-8ee2d9899bda.png" },
        { "name": "Youtube", "image": "https://image.storething.org/frankmbrown%2Ff760c5cb-84eb-4354-9281-e7930067d8c2." },
        { "name": "aws", "image": "https://image.storething.org/frankmbrown/83d5f63c-9f75-4611-8047-7c1969a6331e.png" },
        { "name": "ffmpeg", "image": "https://image.storething.org/frankmbrown/d020ca46-8ff9-4040-b4de-04f8a6b5cfe4.png" },
        { "name": "Scikit Learn", "image": "https://image.storething.org/frankmbrown/1290b7c6-55b3-4ad7-9098-17d251319648.png" },
        { "name": "Reddit", "image": "https://image.storething.org/frankmbrown/87b3981e-9437-4c0e-8e32-65bb9f659ad1.png" },
        { "name": "Wikipedia", "image": "https://image.storething.org/frankmbrown/2334f442-1821-4679-b26f-9f20433c719b.png" },
        { "name": "Papers With Code", "image": "https://image.storething.org/frankmbrown/1af10a9d-376b-407c-a935-c08828fcfb1a.png" },
        { "name": "Arcnet", "image": "https://image.storething.org/frankmbrown/5cd28016-a7ad-457f-8c8c-f8bd607d7f94.png" }
    ];
    if (isAdmin)
        tableOfContents.push({ id: 'add-link', text: 'Add Link' });
    tableOfContents.push({ id: 'links', text: 'Links' });
    const keywords = ['Links'];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/links' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    const initHTML = await getFrankBrownLinks(req);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        initHTML,
        common_links
    });
}
exports.getFranksLinks = getFranksLinks;
async function addFranksLink(req, res) {
    const validString = (a, minLength, maxLength) => {
        return Boolean(typeof a === 'string' && a.length >= minLength && (typeof maxLength === 'number' ? a.length <= maxLength : true));
    };
    try {
        const href = req.body['link-url'];
        const title = req.body['add-link-title'];
        const description = req.body['link-description'];
        const imageURLStr = req.body['image-url'];
        const imageURL = (typeof imageURLStr === "string" && imageURLStr.startsWith('https://image.storething.org/')) ? imageURLStr : 'https://image.storething.org/frankmbrown/f92617a9-08a0-4ec3-87c3-fa94961ef240.jpg';
        const date_added = TIME.getUnixTime();
        if (!!!validString(href, 5) || !!!validString(title, 1, 100) || !!!validString(description, 10, 500)) {
            return res.status(200).send((0, html_1.getErrorAlert)('Please enter valid inputs to create a link.'));
        }
        const db = (0, database_1.default)();
        const [dbRes, ..._rest] = await Promise.all([
            db.query(`INSERT INTO links (
        href,
        title,
        description,
        date_added,
        image_url
      ) VALUES (
        $1,
        $2,
        $3,
        $4::bigint,
        $5
      ) RETURNING id;`, [href, title, description, date_added, imageURL])
        ]);
        if (dbRes.rows.length === 1) {
            return res.status(200).send(renderLink(req, { description, href, date_added, title, image_url: imageURL }).concat('<div hx-trigger="load" hx-get="/links" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-push-url="true"></div>'));
        }
        else {
            throw new Error('Something went wrong creating the link in the database.');
        }
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong creating the link. Try reloading the page.'));
    }
}
exports.addFranksLink = addFranksLink;
async function searchFranksLink(req, res) {
    try {
        const searchTitle = req.body['search-link-title'];
        if (typeof searchTitle !== 'string')
            throw new Error('Search Links search query must be a string.');
        const dbRes = await (0, database_1.default)().query(`SELECT description, date_added, href, title, similarity($1,title) as similarity_str, image_url FROM links ORDER BY similarity_str DESC LIMIT 25;`, [searchTitle]);
        const retStr = dbRes.rows.map((obj) => renderLink(req, obj)).join('');
        return res.status(200).send(retStr);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong search for the link. Try reloading the page.'));
    }
}
exports.searchFranksLink = searchFranksLink;
async function searchDailyReading(req, res) {
    try {
        const search = String(req.query['daily-reading-search-title']);
        if (search.length < 1) {
            return res.status(200).send((0, html_1.getInfoAlert)('Search daily reading articles by typing a title into the search box above. See results here...', COMMON_SVG_1.default.SEARCH_ERROR, false));
        }
        const query = `SELECT id, topic_name, what_interested_you, topic_image, date_created FROM wikipedia WHERE submitted=true AND LOWER(topic_name) LIKE '%' || LOWER($1) || '%' ORDER BY similarity(LOWER($1),LOWER(topic_name)) DESC LIMIT 15;`;
        const rows = (await (0, database_1.default)().query(query, [search])).rows;
        if (!!!rows.length) {
            return res.status(200).send((0, html_1.getWarningAlert)('There were no daily reading articles that matched your wuery.', COMMON_SVG_1.default.SEARCH_ERROR, false));
        }
        const str = rows.map((row) => { var _a; return (0, handleArticlePreview_1.renderDailyReadingCompletedPreview)({ ...row, phone: (_a = req.session.device) === null || _a === void 0 ? void 0 : _a.phone }); }).join('');
        return res.status(200).send(str);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong searching daily reading articles.', COMMON_SVG_1.default.SEARCH_ERROR, false));
    }
}
exports.searchDailyReading = searchDailyReading;
async function getDailyReading(req, res) {
    var _a, _b;
    try {
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Daily Reading', item: '/daily-reading', position: 2 }];
        const title = "Daily Reading";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Daily Reading"];
        const description = 'I thought that I might create this page so that I can set aside the topic for now, and in the future, return to the topic to learn more about it by reading a Wikipedia article or blog post or online article on it.';
        const tableOfContents = [
            {
                "id": "new-about-this-page",
                "text": "(NEW) About this Page"
            },
            {
                "id": "about-this-page",
                "text": "(OLD) About this Page"
            },
            {
                "id": "search-daily-reading",
                "text": "Search Daily Reading"
            },
            {
                "id": "upcoming-wikipedia",
                "text": "Upcoming Articles"
            },
        ];
        if (((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) && req.session.auth.level >= 3) {
            tableOfContents.push({
                "id": "add-up",
                "text": "Add Upcoming Article"
            }, {
                id: "update-article-sect",
                text: "Update Article in Databse"
            }, {
                "id": "add-art",
                "text": "Add Article"
            }, {
                "id": "articles-wiki",
                "text": "Articles"
            }, {
                id: "add-old-daily-read",
                text: "Add Old Daily Reading Post"
            });
        }
        else {
            tableOfContents.push({
                "id": "articles-wiki",
                "text": "Articles"
            });
        }
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        var [toDoHTML, completed] = await Promise.all([
            getUpcomingDailyReading(req),
            (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('wikipedia_id', order_by.order_by_value, req)
        ]);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(completed.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        toDoHTML = toDoHTML;
        var createArticleHTML = '';
        if (((_b = req.session.auth) === null || _b === void 0 ? void 0 : _b.level) && req.session.auth.level >= 3) {
            createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "wikipedia-of-day-art", '<h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ia6df4f3a-52be-4710-9256-e8f9f4657a03" id="ia6df4f3a-52be-4710-9256-e8f9f4657a03" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">References</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="12" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ac936920-4d3e-47bd-8fcc-3f61dbe17ab5" id="ac936920-4d3e-47bd-8fcc-3f61dbe17ab5" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">Related</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="12" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ifa3ccca8-d933-43c0-8169-5f95c29e2a02" id="ifa3ccca8-d933-43c0-8169-5f95c29e2a02" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">Notes</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="19" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr  data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p>');
        }
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/daily-reading' };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat(completed.toc);
        return res.status(200).render('pages/daily-reading', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            createArticleHTML,
            toDoHTML,
            completedHTML: completed.str,
            order_by
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/404', undefined, { severity: 'error', message: 'Something went wrong getting the Daily Reading page.' });
    }
}
exports.getDailyReading = getDailyReading;
function getDailyReadingOld(req, res) {
    try {
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Daily Reading', item: '/daily-reading', position: 2 }, {
                name: 'Old Daily Reading', item: `/daily-reading/old`, position: 3
            }];
        const table_of_contents = [
            {
                id: "why-create-this",
                text: "Why Create This"
            },
            {
                id: "add-old-daily-reading-article",
                text: "Add Old Daily Reading Article"
            },
            {
                id: "submit-art",
                text: "Submit Old Daily Reading Article"
            }
        ];
        const createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "daily-reading-art-old", '<h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ia6df4f3a-52be-4710-9256-e8f9f4657a03" id="ia6df4f3a-52be-4710-9256-e8f9f4657a03" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">References</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="12" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ac936920-4d3e-47bd-8fcc-3f61dbe17ab5" id="ac936920-4d3e-47bd-8fcc-3f61dbe17ab5" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">Related</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="12" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><h2 class="h2" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><a href="#ifa3ccca8-d933-43c0-8169-5f95c29e2a02" id="ifa3ccca8-d933-43c0-8169-5f95c29e2a02" class="same-page ltr" data-v="1" dir="ltr"><strong class="bolder" data-v="1" data-frank-text="true">Notes</strong></a></h2><div data-v="1" data-frank-decorator="true" data-node-key="19" contenteditable="false" style="text-align: left; white-space: normal; border-bottom-width: 5px; border-bottom-color: var(--divider);"><hr  data-width="5" class="lexical" style="border-bottom-width: 5px; border-bottom-color: var(--divider);"></div><ul class="first" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding-top: 0px; padding-bottom: 0px;"><li value="1" data-v="1"><br></li></ul><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p><p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><br></p>');
        const SEO = { breadcrumbs, keywords: ["Sometimes I miss the opportunity to submit a daily reading article (or I have many things that I want to read and I don't want to get too ahead of myself), so I am creating this page so that I can creating daily reading articles and submit them for previous days - days that I missed. "], title: "Add Old Daily Reading Post", description: "Sometimes I miss the opportunity to submit a daily reading article (or I have many things that I want to read and I don't want to get too ahead of myself), so I am creating this page so that I can creating daily reading articles and submit them for previous days - days that I missed. ", tableOfContents: table_of_contents, path: `/daily-reading/old`, image: "https://image.storething.org/frankmbrown/abff6f9a-a85c-4500-aeff-60980935a4de.jpg" };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render('pages/daily-reading-update-old', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            createArticleHTML
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/', 500, { severity: "error", message: "Something went wrong getting the post old Daily Reading article page." });
    }
}
exports.getDailyReadingOld = getDailyReadingOld;
async function postDailyReadingOld(req, res) {
    try {
        var idToUse = undefined;
        const id = req.body['article-id'];
        if (id && Number.isInteger(parseInt(id)) && parseInt(id) !== 0) {
            const resp = await (0, database_1.default)().query(`SELECT submitted FROM wikipedia WHERE id=$1 and submitted=false;`, [parseInt(id)]);
            if (resp && resp.rows.length && resp.rows.length === 1) {
                idToUse = parseInt(id);
            }
        }
        // YYYY-MM-DD
        const date = req.body["old-article-date"];
        if (typeof date !== 'string' || !!!/\d\d\d\d\-\d\d\-\d\d/.test(date))
            throw new Error("Invalid Date");
        const unix_time = TIME.getUnixFromDateString(date) + 21600;
        const lexical = req.body["daily-reading-art-old"];
        if (typeof lexical !== 'string' || !!!lexical.length)
            throw new Error('Invalid lexical state');
        const lexicalStateInitial = JSON.parse(lexical);
        const { editorState, mobile_html, tablet_html, desktop_html, tableOfContents } = await (0, lexical_1.parseArticleLexical)(lexicalStateInitial);
        if (idToUse) {
            await (0, database_1.default)().query(`UPDATE wikipedia SET date_submitted=$1, table_of_contents=$2, lexical_state=$3, desktop_html=$4, tablet_html=$5, mobile_html=$6, submitted=true WHERE id=$7;`, [unix_time, tableOfContents, editorState, desktop_html, tablet_html, mobile_html, idToUse]);
            return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully submitted old daily reading article!").concat(`<div hx-trigger="load delay:2s" hx-get="/daily-reading" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`));
        }
        else {
            const title = req.body["article-title"];
            const description = req.body["article-description"];
            const image = req.body["article-banner-image-text"];
            if (typeof title !== 'string' || title.length < 1 || title.length > 200)
                throw new Error('Invalid topic name. Topic Name must be between 1 and 200 characters.');
            if (typeof description !== 'string' || description.length < 1 || description.length > 2000)
                throw new Error('Invalid topic interest. Topic interest must be between 1 and 2000 characters.');
            if (typeof image !== 'string' || !!!image.startsWith('https://image.storething.org/'))
                throw new Error('Invalid image URL.');
            await (0, database_1.default)().query(`INSERT INTO wikipedia (topic_name, what_interested_you, topic_image, date_created, date_submitted, table_of_contents, lexical_state, desktop_html, tablet_html, mobile_html, submitted) VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10);`, [title, description, image, unix_time, tableOfContents, editorState, desktop_html, tablet_html, mobile_html, true]);
            return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully submitted old daily reading article!").concat(`<div hx-trigger="load delay:2s" hx-get="/daily-reading" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong submitting the old daily reading article."));
    }
}
exports.postDailyReadingOld = postDailyReadingOld;
async function getDailyReadingOfTheDay(req, res) {
    try {
        const { id: idStr } = req.params;
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [dbRes, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getDailyReadingAndLikesAndViews)(req, parseInt(idStr)), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        const { title, description, date_unix, html, table_of_contents, image } = dbRes;
        table_of_contents.push({ id: "comments", text: "Comments" });
        const date_created = TIME.getDateTimeStringFromUnix(Number(date_unix));
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Daily Reading', item: '/daily-reading', position: 2 }, {
                name: title, item: `/daily-reading/${encodeURIComponent(idStr)}/${encodeURIComponent(title)}`, position: 3
            }];
        const SEO = {
            breadcrumbs,
            keywords: description.split(' '),
            title,
            description,
            tableOfContents: table_of_contents,
            path: `/daily-reading/${encodeURIComponent(idStr)}/${encodeURIComponent(title)}`,
            image
        };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        const randomUUID = 'id_'.concat(dbRes.lexical_id);
        var like_url = `/like/daily-reading/${parseInt(idStr)}/${encodeURIComponent(title)}`;
        var has_liked = dbRes.has_liked;
        var like_count = dbRes.likes;
        var view_count = dbRes.views;
        return res.status(200).render('pages/daily-reading-of-the-day', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            pageObj: {
                title,
                description,
                date_created,
                html: `<div class="lexical-wrapper example-render hz-scroll mt-2" style="padding: 0px;" data-rich-text-editor data-type="full" data-editable="false" id="${randomUUID}">${html}</div>`
            },
            like_url,
            has_liked,
            like_count,
            view_count,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/daily-reading', 404, { severity: 'error', message: 'Something went wrong getting the requested Daily Reading article.' });
    }
}
exports.getDailyReadingOfTheDay = getDailyReadingOfTheDay;
async function getUpcomingDailyReading(req) {
    var _a;
    try {
        const phone = Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop));
        const db = (0, database_1.default)();
        const toDoDailyReading = await db.query(`SELECT id, topic_name, what_interested_you, topic_image, date_created FROM wikipedia WHERE submitted=false ORDER BY id DESC;`);
        const toDoRows = toDoDailyReading.rows;
        if (toDoRows.length)
            return toDoRows.map((obj) => {
                return (0, handleArticlePreview_1.renderDailyReadingToDoPreview)({ ...obj, phone });
            }).join('');
        else
            return (0, html_1.getWarningAlert)("There are no daily reading articles to show.", undefined, false);
    }
    catch (e) {
        return (0, html_1.getErrorAlert)("Something went wrong getting the upcoming daily reading articles.", undefined, false);
    }
}
async function postDailyReading(req, res) {
    try {
        const articleIdStr = req.body['article-id'];
        const stringifiedLexicalState = req.body['wikipedia-of-day-art'];
        if (typeof articleIdStr !== 'string' || !!!Number.isInteger(parseInt(articleIdStr)))
            throw new Error('Invalid article id.');
        if (typeof stringifiedLexicalState !== 'string' || !!!stringifiedLexicalState.length)
            throw new Error('Invalid lexical state');
        const lexicalStateInitial = JSON.parse(stringifiedLexicalState);
        const { editorState, mobile_html, tablet_html, desktop_html, tableOfContents } = await (0, lexical_1.parseArticleLexical)(lexicalStateInitial);
        const db = (0, database_1.default)();
        const resp = await db.query(`UPDATE wikipedia SET submitted=true, date_submitted=$1, table_of_contents=$2, lexical_state=$3, desktop_html=$4, tablet_html=$5, mobile_html=$6 WHERE id=$7 RETURNING id;`, [
            TIME.getUnixTime(),
            tableOfContents,
            editorState,
            desktop_html,
            tablet_html,
            mobile_html,
            Number(articleIdStr)
        ]);
        if (resp.rows.length !== 1 || !!!resp.rows[0].id)
            throw new Error("Something went wrong submitting the Daily Reading of the day.");
        const script = `<script nonce="${(0, escape_html_1.default)(req.session.jsNonce)}">setTimeout(() => {window.location.reload();},3000);</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully submitted Daily Reading article.").concat(script));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong submitting the Daily Reading article.'));
    }
}
exports.postDailyReading = postDailyReading;
async function addUpcomingDailyReading(req, res) {
    try {
        const topicName = req.body['topic-name'];
        const topicInterest = req.body['topic-interest'];
        const topicImage = req.body['topic-image-text'];
        if (typeof topicName !== 'string' || topicName.length < 1 || topicName.length > 200)
            throw new Error('Invalid topic name. Topic Name must be between 1 and 200 characters.');
        if (typeof topicInterest !== 'string' || topicInterest.length < 1 || topicInterest.length > 2000)
            throw new Error('Invalid topic interest. Topic interest must be between 1 and 2000 characters.');
        if (typeof topicImage !== 'string' || !!!topicImage.startsWith('https://image.storething.org/'))
            throw new Error('Invalid image URL.');
        const new_image_url = await (0, image_1.handleImageUpload150_75)(topicImage);
        await (0, projects_1.uploadPageImageFromUrl)(req, new_image_url);
        const db = (0, database_1.default)();
        const resp = await db.query(`INSERT INTO wikipedia (topic_name,what_interested_you,topic_image,date_created) VALUES ($1,$2,$3,$4) RETURNING id;`, [topicName, topicInterest, new_image_url, TIME.getUnixTime()]);
        if (resp.rows.length !== 1 || !!!resp.rows[0].id)
            throw new Error("Something went wrong inserting the Daily Reading article.");
        const script = `<script nonce="${(0, escape_html_1.default)(req.session.jsNonce)}">setTimeout(() => {window.location.reload();},3000);</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully created wikipedia topic.").concat(script));
    }
    catch (error) {
        return res.status(200).send((0, html_1.getErrorAlert)('Still working on finishing this.'));
    }
}
exports.addUpcomingDailyReading = addUpcomingDailyReading;
async function updateDailyReadingArticle(req, res) {
    try {
        const file = req.file;
        if (!!!file) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to find lexical file in POST request.'));
        }
        const fileContents = file.buffer.toString('utf-8');
        if (!!!fileContents) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to lexical file contents in POST request.'));
        }
        const fileJSON = JSON.parse(fileContents);
        if (!!!fileJSON) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to parse lexical file contents to JSON in POST request.'));
        }
        const editorState = fileJSON.editorState;
        if (!!!editorState) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to find editorState in lexical file contents in POST request.'));
        }
        const articleID = req.body['wikipedia-article-id'];
        if (!!!articleID || typeof articleID !== 'string' || !!!Number.isInteger(parseInt(articleID))) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to find Article ID or Article ID is not an integer in POST request.'));
        }
        const { editorState: newEditorState, mobile_html, tablet_html, desktop_html, tableOfContents } = await (0, lexical_1.parseArticleLexical)(editorState);
        const dbRes = await (0, database_1.default)().query(`WITH res_1 AS (
      SELECT lexical_state FROM wikipedia WHERE id=$1 
    ) UPDATE wikipedia SET lexical_state=$2, mobile_html=$3, tablet_html=$4, desktop_html=$5, table_of_contents=$6 WHERE id=$1 RETURNING (SELECT lexical_state FROM res_1) initial_lexical_state;`, [articleID, newEditorState, mobile_html, tablet_html, desktop_html, tableOfContents]);
        if (dbRes.rows.length !== 1) {
            return res.status(200).send((0, html_1.getErrorAlert)('Unable to update Daily Reading article notes in database in POST request.'));
        }
        const { initial_lexical_state } = dbRes.rows[0];
        const str = JSON.stringify(initial_lexical_state);
        const render = ejs_1.default.render(`<div class="flex-row justify-center mt-2">
    <button type="button" class="icon-text filled success medium" id="download-old-wiki-art" aria-label="Download Old File">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Download"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path></svg>
        DOWNLOAD OLD WIKI
    </button>
    
</div>
<details aria-label="Old Wikipedia Article Lexical State" class="mt-2">
    <summary>
        <span class="h6 fw-regular">Old Wikipedia Article Lexical State</span>
        <svg class="details" focusable="false" inert viewBox="0 0 24 24">
        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
        </path>
        </svg>
    </summary>
    <div class="accordion-content" aria-hidden="true" id="details-old-state">
        <%=locals.old_lexical_state%>
    </div>
</details>
<script nonce="<%=locals.jsNonce%>">
    (() => {
        const b = document.getElementById('download-old-wiki-art');
        if (b) {
            b.addEventListener('click',() => {
              const div = document.getElementById('details-old-state');
              if (div) navigator.clipboard.writeText(div.innerText);
            })
        }
    })()
</script>
`, {
            old_lexical_state: str
        });
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully updated lexical file!").concat(render));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong updating the Daily Reading of the day article in the database. Try reloading the page.'));
    }
}
exports.updateDailyReadingArticle = updateDailyReadingArticle;
/**
 * ```sql
 * CREATE TABLE tex_notes (
 * id smallserial PRIMARY KEY,
 * tex_zip TEXT, -- the URL of the ZIPED TEX Resource in S3
 * html TEXT,
 * published boolean NOT NULL DEFAULT false,
 * date_added bigint NOT NULL,
 * date_completed bigint,
 * note_title TEXT NOT NULL,
 * note_resource_link_title TEXT NOT NULL,
 * note_resource_link TEXT NOT NULL,
 * note_description TEXT NOT NULL,
 * note_image TEXT NOT NULL
 * );
 * ```
 * **Page for TeX Notes**, which have the schema seen above.
 *
 *
 * @param req
 * @param res
 * @returns
 */
async function getTexNotes(req, res) {
    try {
        // const flair_ilya_paper = [{ color: 'white', background_color: 'purple', text: 'Ilya Paper Rec' }];
        // const query = `UPDATE tex_notes SET flairs=$1::jsonb[];`;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'TeX Notes', item: '/tex-notes', position: 2 }];
        const title = "TeX Notes";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "TeX", "LaTeX", "Math", "Research Papers"];
        const description = 'Page to keep notes that I took using the TeX markup language.';
        const tableOfContents = [
            {
                "id": "why-create-this-page",
                "text": "Why Create This Page"
            },
            {
                "id": "upcoming-articles",
                "text": "Upcoming TeX Notes"
            },
            {
                "id": "articles-list",
                "text": "TeX Note List"
            }
        ];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/tex-notes', image: 'https://image.storething.org/frankmbrown/2af66425-f86d-4604-ae45-fd4097943d81.png' };
        var upcomingTex = (0, html_1.getWarningAlert)('There are currently no upcoming TeX notes.');
        var completedTexStr = (0, html_1.getWarningAlert)('There are currently no completed TeX notes to show.');
        const db = (0, database_1.default)();
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        const preview = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('tex_notes_id', order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(preview.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        completedTexStr = preview.str;
        const upcomingTeXNotes = await db.query(`SELECT id, date_added, date_completed, note_title, note_resource_link_title, note_resource_link, note_description, note_image, published FROM tex_notes WHERE published=false ORDER BY id DESC;`);
        if (upcomingTeXNotes.rows.length) {
            upcomingTex = upcomingTeXNotes.rows.map((obj) => (0, handleArticlePreview_1.renderTexNotePreview)(req, obj)).join('');
        }
        SEO.tableOfContents = SEO.tableOfContents.concat(preview.toc);
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render('pages/tex-notes', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            upcomingTex,
            completedTex: completedTexStr,
            order_by
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/404', undefined, { severity: 'error', message: 'Something went wrong getting the TeX Notes page.' });
    }
}
exports.getTexNotes = getTexNotes;
async function getTexNote(req, res) {
    var _a, _b;
    try {
        const { id, title: titleStr } = req.params;
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const [article, comments_str] = await Promise.all([(0, handleArticleData_1.getTexNotesAndLikesAndViews)(req, parseInt(id)), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables)]);
        const { html, date_added, date_completed, note_title, note_resource_link_title, note_resource_link, note_description, note_image } = article;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'TeX Notes', item: '/tex-notes', position: 2 }, { name: note_title, item: `/tex-notes/${encodeURIComponent(id)}/${encodeURIComponent(note_title)}`, position: 3 }];
        const title = note_title;
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "TeX", "LaTeX", "Math", "Research Papers"];
        const description = note_description;
        const tableOfContents = [{ id: "MAIN_ARTICLE", text: "Article" }];
        tableOfContents.push({ id: "comments", text: "Comments" });
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/tex-notes', image: note_image };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        const dateAddedTimeString = TIME.getDateTimeStringFromUnix(parseInt(date_added), true);
        const dateCompletedTimeString = TIME.getDateTimeStringFromUnix(parseInt(date_completed), true);
        const dateAddedSpanText = TIME.formatDateFromUnixTime('mm DD, YYYY', ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York', parseInt(date_added));
        const dateCompletedSpanText = TIME.formatDateFromUnixTime('mm DD, YYYY', ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York', parseInt(date_completed));
        var like_url = `/like/tex-notes/${encodeURIComponent(id)}/${encodeURIComponent(title)}`;
        var has_liked = article.has_liked;
        var like_count = article.likes;
        var view_count = article.views;
        const filename = (0, filenamify_1.default)('frankmbrown-tex-'.concat(title).concat('.tex'));
        const path_to_download = `/tex-notes/download/${id}/${title}`;
        return res.status(200).render('pages/tex-note', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            html,
            dateAddedTimeString,
            dateCompletedTimeString,
            dateAddedSpanText,
            dateCompletedSpanText,
            note_title,
            note_resource_link_title,
            note_resource_link,
            note_description,
            note_image,
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
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/tex-notes', 404, { severity: "error", message: "Unable to find TeX note!" });
    }
}
exports.getTexNote = getTexNote;
async function downloadTexNote(req, res) {
    var _a, _b;
    try {
        const { id, title } = req.params;
        const resp = await (0, database_1.default)().query(`SELECT tex_zip FROM tex_notes WHERE id=$1;`, [id]);
        const url = (_b = (_a = resp.rows) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.tex_zip;
        if (!!!url) {
            return res.status(400).send("Unable to download the requested file.");
        }
        const buffer = await (0, aws_implementation_1.getTexNoteFromUrl)(url);
        const filename = (0, filenamify_1.default)('frankmbrown-tex-'.concat(title).concat('.tex'));
        const path_to_temp_download_files = node_path_1.default.resolve(__dirname, 'temp', filename);
        await node_fs_1.default.promises.writeFile(path_to_temp_download_files, buffer);
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
exports.downloadTexNote = downloadTexNote;
async function addTexNoteUpcoming(req, res) {
    try {
        const note_title = req.body["note-title"];
        const text_link_to_note_resource = req.body["text-link-note-resource"];
        const link_to_note_resource = req.body["link-to-note"];
        const note_description = req.body["note-description"];
        const note_image = req.body["note-image-text"];
        if (typeof note_title !== 'string' || note_title.length < 3 || note_title.length > 100) {
            return res.status(200).send((0, html_1.getErrorAlert)("Note title must be string between 3 and 100 characters long."));
        }
        const link_to_note_resource_url = new URL(link_to_note_resource); // this will through error if invalid url
        if (typeof text_link_to_note_resource !== 'string' || text_link_to_note_resource.length < 3 || text_link_to_note_resource.length > 100) {
            return res.status(200).send((0, html_1.getErrorAlert)("Link to Note Resource Text must be a string and must be between 3 and 100 characters long."));
        }
        if (typeof note_description !== 'string' || note_description.length < 3 || note_description.length > 500) {
            return res.status(200).send((0, html_1.getErrorAlert)('Note description must be a string and must be between 3 and 100 characters long.'));
        }
        if (typeof note_image !== 'string' || !!!note_image.startsWith('https://image.storething.org/frankmbrown')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Need to upload note image."));
        }
        const new_image_url = await (0, image_1.handleImageUpload100_100)(note_image);
        await (0, projects_1.uploadPageImageFromUrl)(req, new_image_url);
        const date_added = TIME.getUnixTime();
        await (0, database_1.default)().query(`INSERT INTO tex_notes (date_added,note_title,note_resource_link_title,note_resource_link,note_description,note_image) VALUES ($1,$2,$3,$4,$5,$6);`, [date_added, note_title, text_link_to_note_resource, link_to_note_resource, note_description, new_image_url]);
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully added upcoming TeX note!").concat('<div hx-get="/tex-notes" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-push-url="true" hx-trigger="load delay:1.5s"></div>'));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the upcoming TeX note."));
    }
}
exports.addTexNoteUpcoming = addTexNoteUpcoming;
async function addTexNote(req, res) {
    try {
        if (!!!req.files ||
            !!!Array.isArray(req.files['html-file']) ||
            !!!Array.isArray(req.files['tex-file']) ||
            !!!req.files['html-file'].length ||
            !!!req.files['tex-file'].length) {
            return res.status(200).send((0, html_1.getErrorAlert)("Unable to locate TeX file to complete TeX note."));
        }
        const texFile = req.files['tex-file'][0];
        const htmlFile = req.files['html-file'][0];
        const htmlContents = htmlFile.buffer.toString('utf-8');
        const note_id = req.body['note_id'];
        if (typeof note_id !== 'string' || !!!Number.isInteger(parseInt(note_id))) {
            return res.status(200).send((0, html_1.getErrorAlert)("Unable to locate tex note id."));
        }
        const dbResp1 = await (0, database_1.default)().query('SELECT published FROM tex_notes WHERE id=$1;', [parseInt(note_id)]);
        if (!!!dbResp1.rows.length) {
            return res.status(200).send((0, html_1.getErrorAlert)("Unable to find out if TeX note is already published."));
        }
        else if (dbResp1.rows[0].published) {
            return res.status(200).send((0, html_1.getErrorAlert)("TeX note with the given ID is already published. To update TeX note, call UPDATE tex_notes SET tex_zip=$1, html=$2 WHERE id=$3; -- tex_zip is the URL to the resource (text.storething.org)."));
        }
        const key = 'frankmbrown/'.concat(node_crypto_1.default.randomUUID()).concat('.tex');
        await (0, aws_implementation_1.uploadFileGeneral)(key, texFile.buffer, 'text', 'application/octet-stream');
        const url = 'https://text.storething.org/'.concat(key);
        const date_completed = TIME.getUnixTime();
        const resp = await (0, database_1.default)().query(`UPDATE tex_notes SET tex_zip=$1, html=$2, published=true, date_completed=$3 WHERE id = $4 RETURNING id, note_title;`, [url, htmlContents, date_completed, note_id]);
        const row = resp.rows[0];
        const title = row.note_title;
        const id = row.id;
        const successSnack = (0, html_1.getSuccessSnackbar)("Successfully completed tex Note!");
        const navigate = `<div hx-trigger="load delay:1s" hx-get="/tex-notes/${encodeURIComponent(id)}/${encodeURIComponent(title)}" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-push-url="true"></div>`;
        return res.status(200).send(successSnack.concat(navigate));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong completing the TeX note."));
    }
}
exports.addTexNote = addTexNote;
async function getStreamOfConsciousnessPosts(req) {
    var _a, _b, _c, _d;
    try {
        const IS_LOGGED_IN = Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) >= 1;
        var moreQuery = false;
        const arr = [];
        var device_html = 'desktop_html';
        if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) {
            device_html = 'tablet_html';
        }
        else if ((_c = req.session.device) === null || _c === void 0 ? void 0 : _c.phone) {
            device_html = 'mobile_html';
        }
        const earlyDateTime = req.body["early-datetime"] || req.query["early-datetime"];
        const matchText = req.body["match-text"] || req.query["match-text"];
        const textStream = req.body["text-stream"] || req.query["text-stream"];
        const sort = req.body["sort-by"] || req.query["sort-by"];
        const latestDatetime = req.body["late-datetime"] || req.query["late-datetime"];
        var embeddingArrIndex = -1;
        var toGet = '/stream-of-consciousness?hello=world';
        var select = `stream_of_consciousness.id id, stream_of_consciousness.${device_html} lexical_html, stream_of_consciousness.html html, stream_of_consciousness.css css, stream_of_consciousness.js js, stream_of_consciousness.date_created date_created, stream_likes.likes likes`;
        if (sort === "relevancy" && typeof textStream === "string" && textStream.length) {
            if (textStream === req.session.cachedEmbeddingString && req.session.cachedEmbedding) {
                select += ', stream_of_consciousness.embedding <-> $1 relevancy';
                arr.push(pgvector_1.default.toSql(req.session.cachedEmbedding));
                embeddingArrIndex = 1;
            }
            else {
                const vector = await (0, ai_1.createEmbedding)(textStream, 'text-embedding-ada-002');
                select += ', stream_of_consciousness.embedding <-> $1 relevancy';
                arr.push(pgvector_1.default.toSql(vector));
                embeddingArrIndex = 1;
                req.session.cachedEmbedding = vector;
                req.session.cachedEmbeddingString = textStream;
            }
        }
        if (IS_LOGGED_IN) {
            select += `, CASE WHEN stream_of_consciousness_likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS liked`;
        }
        var WHERE = '';
        var ORDER_BY = '';
        if (earlyDateTime && Number.isInteger(parseInt(earlyDateTime)) && parseInt(earlyDateTime) > 0) {
            WHERE += ` AND date_created > $${arr.length + 1} `;
            arr.push(parseInt(earlyDateTime));
            toGet += `&early-datetime=${earlyDateTime}`;
        }
        if (latestDatetime && Number.isInteger(parseInt(latestDatetime)) && parseInt(latestDatetime) > 0) {
            WHERE += ` AND date_created < $${arr.length + 1} `;
            arr.push(parseInt(latestDatetime));
            toGet += `&late-datetime=${latestDatetime}`;
        }
        if (typeof matchText === "string" && matchText === "on" && (typeof textStream !== 'string' || !!!textStream.length)) {
            WHERE += ` AND search @@ to_tsquery($${arr.length + 1}) `;
            arr.push(textStream);
            toGet += `&match-text=on&text-stream=${encodeURIComponent(textStream)}`;
        }
        var sort_type = 'newest';
        switch (String(sort)) {
            case "newest": {
                sort_type = 'newest';
                const date_after_newest = req.body["date_after_date"] || req.query['date_after_date'];
                if (typeof date_after_newest === 'string' && Number.isInteger(parseInt(date_after_newest)) && parseInt(date_after_newest) > 0) {
                    WHERE += ` AND date_created < $${arr.length + 1} `;
                    arr.push(parseInt(date_after_newest));
                }
                ORDER_BY = ' ORDER BY date_created DESC;';
                break;
            }
            case "oldest": {
                sort_type = 'oldest';
                const date_before_oldest = req.body["date_before_oldest"] || req.query['date_before_oldest'];
                if (typeof date_before_oldest === 'string' && Number.isInteger(parseInt(date_before_oldest)) && parseInt(date_before_oldest) > 0) {
                    WHERE += ` AND date_created > $${arr.length + 1} `;
                    arr.push(parseInt(date_before_oldest));
                }
                ORDER_BY = ' ORDER BY date_created ASC;';
                break;
            }
            case "relevancy": {
                sort_type = 'relevancy';
                if (typeof textStream !== 'string' || !!!textStream.length) {
                    ORDER_BY = ' ORDER BY date_created DESC;';
                }
                else {
                    const max_relevancy = req.body['max_relevancy'];
                    if (typeof max_relevancy === 'string' && Number.isInteger(parseFloat(max_relevancy))) {
                        WHERE += ` AND relevancy < $${arr.length + 1} `;
                        arr.push(parseFloat(max_relevancy));
                    }
                    ORDER_BY = ` ORDER BY embedding <-> $${embeddingArrIndex};`;
                }
                break;
            }
            default: {
                sort_type = 'newest';
                const date_after_newest = req.body["date_after_date"] || req.query['date_after_date'];
                if (typeof date_after_newest === 'string' && Number.isInteger(parseInt(date_after_newest)) && parseInt(date_after_newest) > 0) {
                    WHERE += ` AND date_created < $${arr.length + 1} `;
                }
                ORDER_BY = ' ORDER BY date_created DESC;';
                break;
            }
        }
        toGet += `&sort-by=${sort_type}`;
        var query = 'WITH stream_likes AS (SELECT COUNT(stream_id) likes, stream_id FROM stream_of_consciousness_likes GROUP BY stream_of_consciousness_likes.stream_id) ';
        query += `SELECT ${select} FROM stream_of_consciousness LEFT JOIN stream_likes ON stream_of_consciousness.id=stream_likes.stream_id ${IS_LOGGED_IN ? `LEFT JOIN stream_of_consciousness_likes ON stream_of_consciousness.id=stream_of_consciousness_likes.stream_id AND stream_of_consciousness_likes.user_id=$${arr.length + 1}` : ``} WHERE true ${WHERE} ${ORDER_BY}`;
        if (IS_LOGGED_IN) {
            arr.push(Number((_d = req.session.auth) === null || _d === void 0 ? void 0 : _d.userID));
        }
        const resp = await (0, database_1.default)().query(query, arr);
        const rows = resp.rows;
        var html = '';
        const nonce = req.session.jsNonce;
        if (!!!rows.length) {
            html = (0, html_1.getWarningAlert)(`There are no ${moreQuery ? 'more ' : ''}streams to show!`);
        }
        else {
            html = rows.map((obj) => {
                var _a, _b;
                var str = '';
                if (obj.lexical_html) {
                    str = `<div data-rich-text-editor class="lexical-wrapper" data-type="full" data-editable="false" data-display-only id="ed_${node_crypto_1.default.randomUUID()}">${obj.lexical_html}</div>`;
                }
                else {
                    str = `<style>${obj.css}</style><div>${obj.html}</div><script defer nonce="${nonce}">${obj.js}</script>`;
                }
                const dateTime = TIME.getDateTimeStringFromUnix(obj.date_created);
                const dateTimeString = TIME.formatDateFromUnixTime('MMM D, YYYY', ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York', obj.date_created);
                return `<div data-stream-post class="mt-2" style="padding: 6px; border-radius: 6px; border: 2px solid var(--divider);"><div>${str}</div><div class="flex-row justify-end gap-2 mt-2">
        ${Number((_b = req.session.auth) === null || _b === void 0 ? void 0 : _b.level) >= 3 ? `<button type="button" class="error filled icon small" aria-label="Delete Post" hx-delete="/stream-of-consciousness/${obj.id}" hx-target="closest div[data-stream-post]">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
</button>` : ``}
        <span class="flex-row gap-2" style="margin:0px 8px;"> 
        <button type="button" class="icon small text primary" ${IS_LOGGED_IN ? `hx-trigger="click" hx-put="/stream-of-consciousness/like/${obj.id}" hx-target="closest span" hx-swap="outerHTML"` : `data-dialog="login-dialog" data-text="You must be logged in to like this stream of consciousness post!"`}>
          ${IS_LOGGED_IN && obj.liked ? `<svg viewBox="0 0 512 512" title="heart" focusable="false" inert="" tabindex="-1"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg>` : `<svg viewBox="0 0 512 512" title="heart" focusable="false" inert tabindex="-1"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"></path></svg>`}
         
        </button>
        <span style="position:relative; align-content: center;" class="fw-regular body1">${Number(obj.likes)}</span>
        </span>
        <time data-date-format="MMM D, YYYY" datetime="${dateTime}">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
    </path>
  </svg>
  <span>${dateTimeString}</span>
</time></div></div>`;
            }).join('');
        }
        if (rows.length === 200) {
            switch (sort_type) {
                case 'newest': {
                    const oldestDateCreated = rows[rows.length - 1].date_created;
                    toGet += `&date_after_date=${oldestDateCreated}`;
                    break;
                }
                case 'oldest': {
                    const newestDateCreated = rows[rows.length - 1].date_created;
                    toGet += `&date_before_oldest=${newestDateCreated}`;
                    break;
                }
                case 'relevancy': {
                    const minRelevancy = rows[rows.length - 1].relevancy;
                    toGet += `&max_relevancy=${minRelevancy}`;
                    break;
                }
                default: {
                    html += (0, html_1.getErrorAlert)("Something went wrong getting more stream of consciousness posts.");
                    break;
                }
            }
            const randId = 'id_'.concat(node_crypto_1.default.randomUUID());
            html += `<div hx-get="${toGet}" hx-target="this" hx-swap="outerHTML" hx-indicator="#${randId}"></div><div id="${randId}" class="flex-row justify-center t-primary htmx-indicator" role="progressbar" aria-busy="false" aria-label="Getting More Stream of Consciousness Posts">
  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
</div>`;
        }
        else if (rows.length >= 1) {
            html += (0, html_1.getWarningAlert)("There are no more stream of consciousness posts to show.");
        }
        const ret_obj = { html };
        if (earlyDateTime && typeof earlyDateTime === "string") {
            const early_date = TIME.getDateTimeStringFromUnix(Number(earlyDateTime), true);
            ret_obj["early_date"] = early_date;
        }
        if (latestDatetime && typeof latestDatetime === "string") {
            const late_date = TIME.getDateTimeStringFromUnix(Number(latestDatetime), true);
            ret_obj["late_date"] = late_date;
        }
        if (typeof matchText === "string" && matchText === "on") {
            ret_obj["matchText"] = "on";
        }
        if (typeof sort === "string" && sort === "newest" || sort === "oldest" || sort === "relevancy") {
            ret_obj["sort"] = sort;
        }
        else {
            ret_obj["sort"] = "newest";
        }
        if (typeof textStream === "string" && textStream.length) {
            ret_obj["textStream"] = textStream;
        }
        return ret_obj;
    }
    catch (e) {
        console.error(e);
        return {
            html: (0, html_1.getErrorAlert)("Something went wrong getting the stream of consciousness posts."),
            early_date: undefined,
            late_date: undefined,
            matchText: undefined,
            sort: 'newest',
            textStream: ''
        };
    }
}
/**
 * CREATE TABLE stream_of_consciousness (
 *  id serial PRIMARY KEY,
 *  date_created bigint NOT NULL,
 *  lexical_state jsonb,
 *  desktop_html TEXT,
 *  tablet_html TEXT,
 *  mobile_html TEXT,
 *  html TEXT,
 *  css TEXT,
 *  js TEXT,
 *  inner_text TEXT NOT NULL,
 *  search tsvector GENERATED ALWAYS AS (to_tsvector('english',inner_text) || ' ') STORED NOT NULL,
 *  embedding vector(1536) NOT NULL
 * );
 * CREATE TABLE stream_of_consciousness_likes (
    stream_id integer references stream_of_consciousness(id),
    user_id integer REFERENCES users(id)
  );
 * @param req
 * @param res
 * @returns
 */
async function getStreamOfConsciousness(req, res) {
    try {
        const view = 'pages/stream-of-consciousness';
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Stream of Consciousness', item: '/stream-of-consciousness', position: 2 }];
        const title = "Stream of Consciousness";
        const keywords = ["Stream of Consciousness"];
        const description = 'I sometimes want to note something or write something down for the future, but the thing that I want to write about is not long enough to warrant writing a full notes page on. This page is designed to be a microblogging page where I can insert custom HTML/CSS/JavaScript or a lexical editor.';
        const tableOfContents = [
            { id: "why-create-page", text: "Why Create This Page" }
        ];
        const SEO = {
            breadcrumbs,
            keywords,
            title,
            description,
            tableOfContents,
            path: '/stream-of-consciousness',
            noIndex: true
        };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        const { html: postsHtml, ...rest } = await getStreamOfConsciousnessPosts(req);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            postsHtml,
            pageObj: { ...rest }
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: "error", message: "Something went wrong getting the stream of consciosness page!" });
    }
}
exports.getStreamOfConsciousness = getStreamOfConsciousness;
async function postStreamOfConsciousness(req, res) {
    var _a, _b;
    try {
        var new_url = '/stream-of-consciousness?hello=world';
        const earlyDateTime = req.body["early-datetime"] || req.query["early-datetime"];
        if (typeof earlyDateTime === "string") {
            try {
                const earlyDateTimeUnix = TIME.getUnixFromDatetimeString(String(earlyDateTime), ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York');
                new_url += `&early-datetime=${earlyDateTimeUnix}`;
            }
            catch (e) {
                console.error(e);
            }
        }
        const latestDatetime = req.body["late-datetime"] || req.query["late-datetime"];
        if (typeof latestDatetime === "string") {
            try {
                const latestDatetimeUnix = TIME.getUnixFromDatetimeString(String(latestDatetime), ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York');
                new_url += `&late-datetime=${latestDatetimeUnix}`;
            }
            catch (e) {
                console.error(e);
            }
        }
        const sort = req.body["sort-by"] || req.query["sort-by"];
        const textStream = req.body["text-stream"] || req.query["text-stream"];
        if (typeof sort === "string" && (sort === "oldest" || sort === "newest")) {
            new_url += `&sort-by=${sort}`;
        }
        else if (typeof sort === "string" && sort === "relevancy" && typeof textStream === 'string' && textStream.length) {
            new_url += `&sort-by=${sort}&text-stream=${encodeURIComponent(textStream)}`;
        }
        const matchText = req.body["match-text"] || req.query["match-text"];
        if (typeof matchText === "string" && matchText === "on" && typeof textStream === 'string' && textStream.length) {
            new_url += `&match-text=on`;
            if (!!!new_url.includes('&text-stream=')) {
                new_url += `&text-stream=${encodeURIComponent(textStream)}`;
            }
        }
        return res.status(200).send(`<div hx-trigger="load" hx-get="${new_url}" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-swap="innerHTML" hx-push-url="true"></div>`);
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Unable to sort / filter the stream of consciousness posts as desired.");
    }
}
exports.postStreamOfConsciousness = postStreamOfConsciousness;
async function addToStreamOfConsciousness(req, res) {
    try {
        const { type } = req.query;
        if (type === "lexical") {
            const editor = req.body['lexical_example_editor'];
            const lexicalState = JSON.parse(editor);
            const { desktop_html, tablet_html, mobile_html, innerText, editorState } = await (0, lexical_1.parseArticleLexical)(lexicalState);
            const embedding = await (0, ai_1.createEmbedding)(innerText, 'text-embedding-ada-002');
            const unixTime = TIME.getUnixTime();
            await (0, database_1.default)().query(`INSERT INTO stream_of_consciousness (date_created,lexical_state,desktop_html,tablet_html,mobile_html,inner_text,embedding) VALUES ($1,$2,$3,$4,$5,$6,$7);`, [unixTime, JSON.stringify(editorState), desktop_html, tablet_html, mobile_html, innerText, pgvector_1.default.toSql(embedding)]);
            const nonce = req.session.jsNonce;
            const script = `<script nonce="${nonce}">
      (() => {
        setTimeout(() => {
          window.location.reload();
        },750)
      })()
      </script>`;
            return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully added to stream of consciousness.").concat(script));
        }
        else {
            const html = req.body["html-editor-wrapper"];
            const dom = new jsdom_1.JSDOM(html);
            const innerText = dom.window.document.body.textContent;
            const css = req.body["css-editor-wrapper"];
            const js = req.body["js-editor-wrapper"];
            if (!!!html && !!!css && !!!js) {
                throw new Error("Something went wrong posting code to stream of consciousness page.");
            }
            const embedding = await (0, ai_1.createEmbedding)(innerText, 'text-embedding-ada-002');
            const unixTime = TIME.getUnixTime();
            await (0, database_1.default)().query(`INSERT INTO stream_of_consciousness (date_created,html,css,js,inner_text,embedding) VALUES ($1,$2,$3,$4,$5,$6);`, [unixTime, html, css, js, innerText, pgvector_1.default.toSql(embedding)]);
            const nonce = req.session.jsNonce;
            const script = `<script nonce="${nonce}">
      (() => {
        setTimeout(() => {
          window.location.reload();
        },750)
      })()
      </script>`;
            return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully added to stream of consciousness.").concat(script));
        }
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong adding note to stream of consciousness."));
    }
}
exports.addToStreamOfConsciousness = addToStreamOfConsciousness;
async function likeStreamOfConsciousness(req, res) {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const user_id = (_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID;
        const dbConnection = await (0, database_1.default)().connect();
        await dbConnection.query('BEGIN;');
        try {
            const res1 = await (0, database_1.default)().query('SELECT user_id FROM stream_of_consciousness_likes WHERE stream_id=$1 AND user_id=$2;', [id, user_id]);
            if ((_c = (_b = res1.rows) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.user_id) {
                const res2 = await (0, database_1.default)().query(`WITH deleted_rows AS (
          DELETE FROM stream_of_consciousness_likes WHERE user_id=$1 and stream_id=$2 
        ) SELECT COUNT(*) likes FROM stream_of_consciousness_likes WHERE stream_id=$2;`, [user_id, id]);
                const likes = res2.rows[0].likes;
                await dbConnection.query('COMMIT');
                dbConnection.release();
                return res.status(200).send(`<span class="flex-row gap-2" style="margin:0px 8px;">
          <button type="button" class="icon small text primary" hx-trigger="click" hx-put="/stream-of-consciousness/like/${id}" hx-target="closest span" hx-swap="outerHTML">
            <svg viewBox="0 0 512 512" title="heart" focusable="false" inert tabindex="-1"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"></path></svg>
          </button>
          <span style="position:relative; align-content: center;" class="fw-regular body1">${Number(likes) - 1}</span>
          </span>`);
            }
            else {
                const res2 = await (0, database_1.default)().query(`WITH insert_table AS (
          INSERT INTO stream_of_consciousness_likes (user_id,stream_id) VALUES ($1,$2) RETURNING *
        ) SELECT COUNT(*) likes FROM stream_of_consciousness_likes WHERE stream_id=$2;`, [user_id, id]);
                const likes = res2.rows[0].likes;
                await dbConnection.query('COMMIT');
                dbConnection.release();
                return res.status(200).send(`<span class="flex-row gap-2" style="margin:0px 8px;">
          <button type="button" class="icon small text primary" hx-trigger="click" hx-put="/stream-of-consciousness/like/${id}" hx-target="closest span" hx-swap="outerHTML">
            <svg viewBox="0 0 512 512" title="heart" focusable="false" inert="" tabindex="-1"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg>
          </button>
          <span style="position:relative; align-content: center;" class="fw-regular body1">${Number(likes) + 1}</span>
          </span>`);
            }
        }
        catch (err) {
            await dbConnection.query('ROLLBACK');
            dbConnection.release();
            console.error(err);
            throw new Error('Something went wrong liking the stream of consciousness note.');
        }
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong liking the stream of consciousness post!");
    }
}
exports.likeStreamOfConsciousness = likeStreamOfConsciousness;
async function deleteStreamOfConsciousNess(req, res) {
    var _a, _b;
    try {
        const { id } = req.params;
        const resp = await (0, database_1.default)().query(`DELETE FROM stream_of_consciousness WHERE id=$1 RETURNING id;`, [parseInt(id)]);
        const idNew = (_b = (_a = resp.rows) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id;
        if (idNew) {
            return res.status(200).send((0, html_1.getSuccessAlert)("Successfully deleted stream of consciousness with id: ".concat(idNew).concat('.')));
        }
        else {
            return res.status(200).send((0, html_1.getWarningAlert)("Unable to determine if stream of consciousness post was deleted."));
        }
    }
    catch (err) {
        console.error(err);
        return res.status(400).send("Something went wrong deleting the stream of consciousness post.");
    }
}
exports.deleteStreamOfConsciousNess = deleteStreamOfConsciousNess;
function downloadSPAMobile(req, res) {
    const view = 'pages/download-spa-mobile';
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Download Application', item: '/download-spa-mobile', position: 2 }
    ];
    const title = "Download Application";
    const description = 'This page contains instructions on how to download the frankmbrown.net application on mobile devices.';
    const tableOfContents = [
        { id: 'on-iphone', text: 'On IPhone' },
        { id: 'on-android', text: 'On Android' }
    ];
    const image = "https://image.storething.org/frankmbrown/2f54e61b-9b55-4570-bf8d-fa56e5cb4110.jpg";
    const keywords = ['Download', 'Single Page Application'];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, image, path: '/download-spa-mobile' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.downloadSPAMobile = downloadSPAMobile;
function getChangeSitePermissionsPage(req, res) {
    const view = 'pages/change-site-permissions';
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Change Site Permissions', item: '/change-site-permissions', position: 2 }
    ];
    const title = "Change Site Permissions";
    const description = 'This site contains multiple Web APIs that require the user to give the site permission to use the API. Sometimes the user might accidentally deny the site access to the API, and the might later change their mind and decide to give teh site permission to use an API to enable some feature of this application.';
    const tableOfContents = [
        { id: 'why-create', text: 'Why Create This Page' },
        { id: 'chrome-permission', text: 'Chrome' },
        { id: 'safari-permission', text: 'Safari' },
        { id: 'edge-permission', text: 'Edge' }
    ];
    const image = "https://image.storething.org/frankmbrown%2F32811466-b019-42bb-a75f-010264381c00.jpg";
    const keywords = ['Change Site Permissions', 'Chrome', 'Safari', 'Edge'];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, image, path: '/change-site-permissions' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getChangeSitePermissionsPage = getChangeSitePermissionsPage;
