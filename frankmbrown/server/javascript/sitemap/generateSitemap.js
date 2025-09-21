"use strict";
/**
 * @file  file for generating sitemaps
 * @author Frank Brown <frankmbrown.net>
 * [REFERENCE](https://www.sitemaps.org/protocol.html)
 */
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
const BASE_URL_1 = __importDefault(require("../CONSTANTS/BASE_URL"));
const helper_1 = require("../utils/helper");
const database_1 = __importDefault(require("../database"));
const TIME = __importStar(require("../utils/time"));
const paths_1 = __importDefault(require("./paths"));
const redirect_override_1 = require("../ROUTER/helper_functions/redirect-override");
const SUPPORTED_LANGUAGES = [];
const changeFreqSet = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);
const validPath = (p) => { var _a; return Boolean(!!!((_a = p.path) === null || _a === void 0 ? void 0 : _a.length) || (p.path[0] === '/' && p.path[p.path.length - 1] !== '/')); };
const validLastMod = (p) => {
    const e = `Please enter a valid lastmod date for ${p.path} path. Date should be of format YYYY-MM-DD.`;
    const arr = p.lastmod.split('-');
    if (arr.length !== 3)
        throw new Error(e);
    const numbers = (0, helper_1.extractNumbersFromString)(p.lastmod);
    if (numbers.length !== 3)
        throw new Error(e.concat(' (Format is invalid.)'));
    if (numbers[1] < 1 || numbers[1] > 12)
        throw new Error(e.concat(' (Month is invalid.)'));
    if (numbers[2] < 1 || numbers[2] > 31)
        throw new Error(e.concat(' (Day is invalid.)'));
};
const validPriority = (p) => {
    if (p.priority < 0)
        throw Error(`Priority must be greater than 0 for ${p.path} path.`);
    else if (p.priority > 1)
        throw Error(`Priority must be less than 1 for ${p.path} path.`);
};
const validChangeFreq = (p) => {
    if (!!!changeFreqSet.has(p.changefreq))
        throw new Error(`Please enter a valid changefreq for path ${p.path}.`);
};
async function generateSitemap(req, res) {
    try {
        const paths = paths_1.default.map((s) => ({
            path: s.path,
            lastmod: s.lastmod,
            changefreq: 'monthly',
            priority: 0.5
        }));
        /**
         * Validate Paths
         */
        paths.forEach((path) => {
            validPath(path);
            validLastMod(path);
            validPriority(path);
            validChangeFreq(path);
        });
        var str = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
        const db = (0, database_1.default)();
        const blogsQuery = /*sql*/ `SELECT id, title, last_edited FROM blog WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
        const notesQuery = /*sql*/ `SELECT id, title, last_edited FROM note WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
        const ideasQuery = /*sql*/ `SELECT id, title, last_edited FROM idea WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
        const markdownNotesQuery = /*sql*/ `SELECT id, title, last_edited FROM markdown_notes WHERE published=true;`;
        const getJupyterNotebooksQuery = /*sql*/ `SELECT id, title, date_created FROM jupyter_notebooks;`;
        const dailyReadingQuery = /*sql*/ `SELECT id, topic_name, date_submitted FROM wikipedia WHERE submitted=true;`;
        const texNoteQuery = /*sql*/ `SELECT id, date_completed, note_title FROM tex_notes WHERE published=true;`;
        const goodReadsQuery = /*sql*/ `SELECT id, last_edited, title FROM goodreads;`;
        const letterboxdQuery = /*sql*/ `SELECT id, last_edited, title FROM letterboxd;`;
        const surveysQuery = /*sql*/ `SELECT id, date_created AS last_edited, title FROM surveys;`;
        const gamesQuery = /*sql*/ `SELECT id, date_created AS last_edited, title FROM games;`;
        const designsQuery = /*sql*/ `SELECT id, date_created AS last_edited, title FROM designs_3d;`;
        const usersQuery = /*sql*/ `SELECT id, user_username AS username, user_date_created AS last_edited FROM users;`;
        const electronicsQuery = /*sql*/ `SELECT id, title, last_edited FROM electronics_projects;`;
        const [blogs, notes, ideas, markdownNotes, notebooks, dailyReading, texNotes, goodreads, letterboxd, surveys, games, designs, users, electronics] = await Promise.all([
            db.query(blogsQuery),
            db.query(notesQuery),
            db.query(ideasQuery),
            db.query(markdownNotesQuery),
            db.query(getJupyterNotebooksQuery),
            db.query(dailyReadingQuery),
            db.query(texNoteQuery),
            db.query(goodReadsQuery),
            db.query(letterboxdQuery),
            db.query(surveysQuery),
            db.query(gamesQuery),
            db.query(designsQuery),
            db.query(usersQuery),
            db.query(electronicsQuery)
        ]);
        if (blogs && blogs.rows.length) {
            blogs.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/blog/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (notes && notes.rows.length) {
            notes.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/note/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (ideas && ideas.rows.length) {
            ideas.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/idea/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (markdownNotes && markdownNotes.rows.length) {
            markdownNotes.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const pathStr = `/markdown-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
                const path = {
                    path: pathStr,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                const usePath = path.path;
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (notebooks && notebooks.rows.length) {
            notebooks.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.date_created));
                const pathStr = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
                const path = {
                    path: pathStr,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                const usePath = path.path;
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (dailyReading && dailyReading.rows.length) {
            dailyReading.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.date_submitted));
                const pathStr = `/daily-reading/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.topic_name)}`;
                const path = {
                    path: pathStr,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                const usePath = path.path;
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (texNotes && texNotes.rows.length) {
            texNotes.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.date_completed));
                const pathStr = `/tex-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.note_title)}`;
                const path = {
                    path: pathStr,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                const usePath = path.path;
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (goodreads && goodreads.rows.length) {
            goodreads.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/goodreads/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (letterboxd && letterboxd.rows.length) {
            letterboxd.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/letterboxd/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (surveys && surveys.rows.length) {
            surveys.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/surveys/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (games && games.rows.length) {
            games.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/games/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (designs && designs.rows.length) {
            designs.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/3d-designs/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (users && users.rows.length) {
            users.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/users/${obj.id}/${encodeURIComponent(obj.username)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        if (electronics && electronics.rows.length) {
            electronics.rows.forEach((obj) => {
                const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD', 'America/Chicago', Number(obj.last_edited));
                const path = {
                    path: `/electronics-robotics/${obj.id}/${encodeURIComponent(obj.title)}`,
                    changefreq: 'monthly',
                    priority: 0.5,
                    lastmod
                };
                var usePath = path.path;
                if (path.path.endsWith('/')) {
                    usePath = path.path.slice(path.path.length - 1);
                }
                str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                    .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                    .concat('\r\t</url>\r');
            });
        }
        paths.forEach((path) => {
            var usePath = path.path;
            if (path.path.endsWith('/')) {
                usePath = path.path.slice(path.path.length - 1);
            }
            str += `\r\t<url>\r\t\t<loc>${BASE_URL_1.default.concat(SUPPORTED_LANGUAGES.length > 1 ? '/en' : '').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
                .concat(SUPPORTED_LANGUAGES.length > 1 ? SUPPORTED_LANGUAGES.filter((lang) => lang.code !== 'en').map((obj) => `<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL_1.default.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t') : '')
                .concat('\r\t</url>\r');
        });
        str += '</urlset>';
        res.setHeader('Content-Type', 'application/xml');
        return res.status(200).send(str);
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/404', 404, { severity: 'error', message: 'Something went wrong getting the requested page. ' });
    }
}
exports.default = generateSitemap;
