"use strict";
/**
CREATE TABLE letterboxd (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  rating smallint NOT NULL,
  editor_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  table_of_contents jsonb[] NOT NULL,
  date_created bigint NOT NULL,
  last_edited bigint NOT NULL,
  lexical_uuid uuid DEFAULT gen_random_uuid()
);
CREATE TABLE goodreads (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  rating smallint NOT NULL,
  editor_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  table_of_contents jsonb[] NOT NULL,
  date_created bigint NOT NULL,
  last_edited bigint NOT NULL,
  lexical_uuid uuid DEFAULT gen_random_uuid()
);
CREATE TABLE games (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  editor_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  table_of_contents jsonb[] NOT NULL,
  date_created bigint NOT NULL,
  lexical_uuid uuid DEFAULT gen_random_uuid(),
  game_javascript TEXT NOT NULL,
  extra_html TEXT NOT NULL DEFAULT '',
  last_edited bigint NOT NULL
);
CREATE TABLE designs_3d (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  editor_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  table_of_contents jsonb[] NOT NULL,
  date_created bigint NOT NULL,
  lexical_uuid uuid DEFAULT gen_random_uuid(),
  game_javascript TEXT NOT NULL,
  extra_html TEXT NOT NULL DEFAULT '',
  last_edited bigint NOT NULL,
  asset_url TEXT NOT NULL
);

CREATE TABLE electronics_projects (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  editor_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  table_of_contents jsonb[] NOT NULL,
  date_created bigint NOT NULL,
  lexical_uuid uuid DEFAULT gen_random_uuid(),
  last_edited bigint NOT NULL
);

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
exports.postElectronicsAndRobotics = exports.getElectronicsAndRoboticsProject = exports.getElectronicsAndRobotics = exports.searchAIChatResult = exports.searchAIChat = exports.getAIChatPage = exports.getGame = exports.postGameJavaScript = exports.postGame = exports.getGames = exports.download3dDesign = exports.post3dDesignJavaScript = exports.post3dDesignAsset = exports.get3dDesign = exports.post3dDesign = exports.get3dDesigns = exports.postGoodRead = exports.getGoodreadPage = exports.getGoodreads = exports.postLetterboxd = exports.getLetterboxdPage = exports.getLetterboxd = exports.getAITools = exports.getRatingsHTML = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const lexicalImplementations_1 = require("./lexicalImplementations");
const redirect_override_1 = require("../helper_functions/redirect-override");
const html_1 = require("../html");
const lexical_1 = require("../../lexical");
const projects_1 = require("./projects");
const database_1 = __importDefault(require("../../database"));
const handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
const time_1 = require("../../utils/time");
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const admin_1 = require("./admin");
const TIME = __importStar(require("../../utils/time"));
const aws_implementation_1 = require("../../aws/aws-implementation");
const axios_1 = __importDefault(require("axios"));
const escape_html_1 = __importDefault(require("escape-html"));
const COMPONENTS_ROUTER_1 = require("../COMPONENTS_ROUTER");
function getRatingsHTML(rating) {
    var html = '';
    for (let i = 0; i < 5; i++) {
        html += ``;
        if (i + 1 <= rating) {
            html += ` <svg class="star-rating" viewBox="0 0 24 24" title="star" focusable="false"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>`;
        }
        else {
            html += ` <svg class="star-rating" viewBox="0 0 576 512" title="star" focusable="false"  ><path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"></path></svg>`;
        }
    }
    return html;
}
exports.getRatingsHTML = getRatingsHTML;
function getAITools(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'AI Tools', item: '/ai-tools', position: 2 }];
    const view = 'pages/ai-tools';
    const title = "Frank's AI Tools";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Artificial Intelligence", "AI", "AI Tools"];
    const description = ' I created this page to separate the AI tools that I have created / will create from other projects that I have created (which are on the Project Page).';
    const tableOfContents = [
        {
            "id": "ai-tools-about",
            "text": "Abot Page"
        },
        {
            "id": "tools",
            "text": "AI Tools"
        }
    ];
    const image = "https://image.storething.org/frankmbrown%2F5c8b5e8c-235d-4a78-994c-f130bdb13564.jpg";
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/ai-tools', image };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getAITools = getAITools;
async function getLetterboxd(req, res) {
    var _a;
    try {
        const is_auth = Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) >= 3;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Letterboxd', item: '/letterboxd', position: 2 }];
        const view = 'pages/letterboxd';
        const title = "Frank's Letterboxd";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Letterboxd", "Movies", "TV Shows"];
        const description = '';
        const image = "https://image.storething.org/frankmbrown%2Fd48275a6-b125-4358-9b7b-48e54f07776e.jpg";
        const tableOfContents = [
            {
                "id": "ai-tools-about",
                "text": "About Page"
            }
        ];
        var createArticleHTML = '';
        if (is_auth) {
            createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "letterboxd-review", '<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-weight: 400; white-space: pre-wrap;" data-v="1">Enter your review here...</span></p>');
            tableOfContents.push({
                "id": "add-review",
                "text": "Add Review"
            });
        }
        tableOfContents.push({
            "id": "reviews",
            "text": "Reviews"
        });
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('letterboxd_id', order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        tableOfContents.push(...previews.toc);
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/letterboxd', image };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            createArticleHTML,
            previews: previews.str,
            order_by
        });
    }
    catch (e) {
        console.error(e);
    }
}
exports.getLetterboxd = getLetterboxd;
async function getLetterboxdPage(req, res) {
    var _a;
    try {
        const { id: idStr, title: titleStr } = req.params;
        var articleBody = '';
        var trueTitle = '';
        var trueDescription = '';
        var lastEditedTime = '';
        var dateCreatedTime = '';
        var keywords = [];
        var tableOfContents = [];
        var pageImage = null;
        var path = '';
        var like_url = `/like/letterboxd/${parseInt(idStr)}/${encodeURIComponent(titleStr)}`;
        var has_liked = false;
        var like_count = 'N/A';
        var view_count = 'N/A';
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getGoodreadsLetterboxdLikesAndViews)(req, parseInt(idStr), 'letterboxd'), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        articleBody = (0, admin_1.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.date_created));
        const last_edited_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.last_edited));
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/letterboxd/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = articleFromDB.table_of_contents;
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        const rating = articleFromDB.rating;
        const ratingHTML = getRatingsHTML(rating);
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Letterboxd', item: '/letterboxd', position: 2 }];
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        const view = 'pages/goodread-letterboxd';
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                date_created: dateCreatedTime,
                last_edited: lastEditedTime,
                date_created_str,
                last_edited_str,
                title: trueTitle,
                articleHTML: articleBody,
                description: trueDescription,
                ratingHTML
            },
            like_count,
            view_count,
            has_liked,
            like_url,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str,
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/letterboxd', 400, { severity: 'error', message: 'Something went wrong getting the letterboxd review.' });
    }
}
exports.getLetterboxdPage = getLetterboxdPage;
async function postLetterboxd(req, res) {
    try {
        const title = req.body['movie-show-name'];
        const description = req.body['movie-show-desc'];
        const image = req.body['image-movie-show-text'];
        const rating = parseInt(req.body['star-rating']);
        const article = JSON.parse(req.body['letterboxd-review']);
        if (!!!title || typeof title !== "string" || title.length < 1 || title.length > 200) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid title."));
        }
        if (!!!description || typeof description !== 'string' || description.length < 1 || description.length > 1000) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid description."));
        }
        if (!!!image || typeof image !== 'string' || !!!image.startsWith('https://image.storething.org')) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid image."));
        }
        if (isNaN(rating) || !!!isFinite(rating) || rating < 0 || rating > 5) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid rating."));
        }
        const { desktop_html, tableOfContents, tablet_html, mobile_html, innerText, editorState } = await (0, lexical_1.parseArticleLexical)(article);
        const date_created = (0, time_1.getUnixTime)();
        const [dbResp, _] = await Promise.all([
            (0, database_1.default)().query(`INSERT INTO letterboxd (title,description,image,rating,editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,date_created,last_edited) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`, [title, description, image, rating, editorState, desktop_html, tablet_html, mobile_html, tableOfContents, date_created, date_created]),
            (0, projects_1.uploadPageImageFromUrl)(req, image)
        ]);
        const id = dbResp.rows[0].id;
        if (!!!Number.isInteger(id)) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong uploading the review."));
        }
        const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully uploaded review.").concat(reloadPageScript));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong posting the letterboxd review."));
    }
}
exports.postLetterboxd = postLetterboxd;
async function getGoodreads(req, res) {
    var _a;
    const is_auth = Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) >= 3;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Goodreads', item: '/goodreads', position: 2 }];
    const view = 'pages/goodreads';
    const title = "Frank's Goodreads";
    const image = "https://image.storething.org/frankmbrown%2F40bb1f10-e1b5-404f-8397-4bda8fd045a8.jpg";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Goodreads", "Reading", "Books"];
    const description = 'Goodreads is a website that helps people find and share books they love. I am creating this page because I would prefer to keep my book reviews on this site rather than create a good reads account. I feel like it will force me to have more acccountability when trying to read more vs creating a goodreads account, for which I may forget the login information or just forget about the existance of the account altogether.';
    const tableOfContents = [
        {
            "id": "ai-tools-about",
            "text": "About Page"
        }
    ];
    var createArticleHTML = '';
    if (is_auth) {
        createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "goodreads-review", '<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-weight: 400; white-space: pre-wrap;" data-v="1">Enter your review here...</span></p>');
        tableOfContents.push({
            "id": "add-review",
            "text": "Add Review"
        });
    }
    const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
    const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('goodreads_id', order_by.order_by_value, req);
    if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
        return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
    }
    tableOfContents.push({
        "id": "reviews",
        "text": "Reviews"
    });
    tableOfContents.push(...previews.toc);
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/goodreads', image };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        createArticleHTML,
        previews: previews.str,
        order_by
    });
}
exports.getGoodreads = getGoodreads;
async function getGoodreadPage(req, res) {
    var _a;
    try {
        const { id: idStr, title: titleStr } = req.params;
        var articleBody = '';
        var trueTitle = '';
        var trueDescription = '';
        var lastEditedTime = '';
        var dateCreatedTime = '';
        var keywords = [];
        var tableOfContents = [];
        var pageImage = null;
        var path = '';
        var like_url = `/like/goodreads/${parseInt(idStr)}/${encodeURIComponent(titleStr)}`;
        var has_liked = false;
        var like_count = 'N/A';
        var view_count = 'N/A';
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getGoodreadsLetterboxdLikesAndViews)(req, parseInt(idStr), 'goodreads'), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        articleBody = (0, admin_1.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.date_created));
        const last_edited_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.last_edited));
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/goodreads/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = articleFromDB.table_of_contents;
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        const rating = articleFromDB.rating;
        const ratingHTML = getRatingsHTML(rating);
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Goodreads', item: '/goodreads', position: 2 }];
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        const view = 'pages/goodread-letterboxd';
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                date_created: dateCreatedTime,
                last_edited: lastEditedTime,
                date_created_str,
                last_edited_str,
                title: trueTitle,
                articleHTML: articleBody,
                description: trueDescription,
                ratingHTML
            },
            like_count,
            view_count,
            has_liked,
            like_url,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str,
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/goodreads', 400, { severity: 'error', message: 'Something went wrong getting the goodreads review.' });
    }
}
exports.getGoodreadPage = getGoodreadPage;
async function postGoodRead(req, res) {
    try {
        const title = req.body['book-name'];
        const description = req.body['book-desc'];
        const image = req.body['image-book-text'];
        const rating = req.body['star-rating'];
        const article = JSON.parse(req.body['goodreads-review']);
        if (!!!title || typeof title !== "string" || title.length < 1 || title.length > 200) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid title."));
        }
        if (!!!description || typeof description !== 'string' || description.length < 1 || description.length > 1000) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid description."));
        }
        if (!!!image || typeof image !== 'string' || !!!image.startsWith('https://image.storething.org')) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid image."));
        }
        if (isNaN(rating) || !!!isFinite(rating) || rating < 0 || rating > 5) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Invalid rating."));
        }
        const { desktop_html, tableOfContents, tablet_html, mobile_html, innerText, editorState } = await (0, lexical_1.parseArticleLexical)(article);
        const date_created = (0, time_1.getUnixTime)();
        const [dbResp, _] = await Promise.all([
            (0, database_1.default)().query(`INSERT INTO goodreads (title,description,image,rating,editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,date_created,last_edited) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`, [title, description, image, rating, editorState, desktop_html, tablet_html, mobile_html, tableOfContents, date_created, date_created]),
            (0, projects_1.uploadPageImageFromUrl)(req, image)
        ]);
        const id = dbResp.rows[0].id;
        if (!!!Number.isInteger(id)) {
            return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong uploading the review."));
        }
        const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully uploaded review.").concat(reloadPageScript));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong posting the goodreads review."));
    }
}
exports.postGoodRead = postGoodRead;
async function get3dDesigns(req, res) {
    var _a;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: '3D Designs', item: '/3d-designs', position: 2 }];
    const view = 'pages/3d-designs';
    const title = "Frank's 3D Designs";
    const image = "https://image.storething.org/frankmbrown%2Ffbedbbe7-de8b-4cb6-801d-9e6f3ab37e9f.jpg";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Solidworks", "3D designs", "Blender"];
    const description = 'I am creating this page to showcase my 3D designs. My goals for 2025 include getting back into 3D printing and learning Blender, so I am going to try to do that and showcase my designs here. ';
    const tableOfContents = [
        {
            "id": "ai-tools-about",
            "text": "About Page"
        }
    ];
    if (Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) >= 3) {
        tableOfContents.push();
    }
    tableOfContents.push({
        "id": "designs-list",
        "text": "Designs"
    });
    const createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "game-article", `<h2 class="h2 first-rte-element" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr"><a href="#i3f235e47-139f-4fb6-a9e1-344d6a838b1c" id="i3f235e47-139f-4fb6-a9e1-344d6a838b1c" class="same-page" data-v="1"><b data-v="1"><strong class="bolder" data-v="1" style="white-space: pre-wrap;">About the Game</strong></b></a></h2><hr class="lexical divider-color" style="border-bottom-width: 5px !important;" data-color="var(--divider)" data-width="5" data-v="1"><ul style="text-align: left; margin: 6px 0px 6px 0px; padding-top: 0px; padding-bottom: 0px;" class="first" data-v="1"><li value="1" data-v="1"></li></ul><p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" data-e-indent="0"><br></p><h2 class="h2" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr"><a href="#i6017bd96-7c08-475b-9ce3-9ac3b7de4d73" id="i6017bd96-7c08-475b-9ce3-9ac3b7de4d73" class="same-page" data-v="1"><b data-v="1"><strong class="bolder" data-v="1" style="white-space: pre-wrap;">How to Play</strong></b></a></h2><hr class="lexical divider-color" style="border-bottom-width: 5px !important;" data-color="var(--divider)" data-width="5" data-v="1">
`);
    const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
    const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('design_id', order_by.order_by_value, req);
    if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
        return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
    }
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/3d-designs', image };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        createArticleHTML,
        previews: previews.str,
        order_by
    });
}
exports.get3dDesigns = get3dDesigns;
async function post3dDesign(req, res) {
    try {
        const title = req.body['3d-design-title'];
        const description = req.body['3d-design-description'];
        const image = req.body['3d-design-image-text'];
        const javascript = req.body['3d-design-js'];
        const asset = req.body['3d-design-asset'];
        const article = JSON.parse(req.body['game-article']);
        if (typeof title !== 'string' || title.length < 1 || title.length > 150) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid title."));
        }
        if (typeof description !== 'string' || description.length < 1 || description.length > 500) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid description."));
        }
        if (typeof image !== 'string' || !!!image.startsWith('https://image.storething.org/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid image."));
        }
        if (typeof javascript !== 'string' || !!!javascript.startsWith('https://cdn.storething.org/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid javascript."));
        }
        if (typeof asset !== 'string' || !!!asset.startsWith('https://cdn.storething.org/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid asset."));
        }
        const { desktop_html, tableOfContents, tablet_html, mobile_html, innerText, editorState } = await (0, lexical_1.parseArticleLexical)(article);
        const date_created = (0, time_1.getUnixTime)();
        const [dbResp, _] = await Promise.all([
            (0, database_1.default)().query(`INSERT INTO designs_3d (title,description,image,editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,date_created,last_edited,game_javascript,asset_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id;`, [title, description, image, editorState, desktop_html, tablet_html, mobile_html, tableOfContents, date_created, date_created, javascript, asset]),
            (0, projects_1.uploadPageImageFromUrl)(req, image)
        ]);
        const id = dbResp.rows[0].id;
        if (!!!Number.isInteger(id)) {
            return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong uploading the 3d design."));
        }
        const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully uploaded 3d design.").concat(reloadPageScript));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the 3D desigm!"));
    }
}
exports.post3dDesign = post3dDesign;
async function get3dDesign(req, res) {
    var _a;
    try {
        const { id: idStr, title: titleStr } = req.params;
        const view = 'pages/3d-design';
        var articleBody = '';
        var trueTitle = '';
        var trueDescription = '';
        var lastEditedTime = '';
        var dateCreatedTime = '';
        var keywords = [];
        var tableOfContents = [
            { id: "about-design", text: "About Design" }
        ];
        var pageImage = null;
        var path = '';
        var like_url = `/like/3d-designs/${parseInt(idStr)}/${encodeURIComponent(titleStr)}`;
        var has_liked = false;
        var like_count = 'N/A';
        var view_count = 'N/A';
        var game_javascript = '';
        var asset_url;
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getGameAndDesignLikesAndViews)(req, parseInt(idStr), 'design'), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        articleBody = (0, admin_1.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.date_created));
        const last_edited_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.last_edited));
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/3d-designs/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = tableOfContents.concat(articleFromDB.table_of_contents);
        tableOfContents.push({ id: "design-sect", text: "Design" });
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        game_javascript = articleFromDB.game_javascript;
        asset_url = articleFromDB.asset_url;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Goodreads', item: '/3d-designs', position: 2 }];
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                date_created: dateCreatedTime,
                last_edited: lastEditedTime,
                date_created_str,
                last_edited_str,
                title: trueTitle,
                articleHTML: articleBody,
                description: trueDescription
            },
            like_count,
            view_count,
            has_liked,
            like_url,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str,
            game_javascript,
            asset_url
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/3d-designs', 400, { severity: "error", message: "Something went wrong getting the 3D design!" });
    }
}
exports.get3dDesign = get3dDesign;
async function post3dDesignAsset(req, res) {
    try {
        const file = req.file;
        if (!!!file)
            throw new Error("Something went wrong uploading the game JavaScript file.");
        const fileURL = await (0, aws_implementation_1.putGameAssetS3)(file);
        return res.status(200).send(`<p class="t-success">${fileURL}</p>`);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the 3d design asset."));
    }
}
exports.post3dDesignAsset = post3dDesignAsset;
async function post3dDesignJavaScript(req, res) {
    try {
        const file = req.file;
        if (!!!file)
            throw new Error("Something went wrong uploading the 3D design JavaScript file.");
        const fileURL = await (0, aws_implementation_1.putJavaScriptGamesDesigns)(file);
        return res.status(200).send(`<p class="t-success">${fileURL}</p>`);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the 3d design JavaScript."));
    }
}
exports.post3dDesignJavaScript = post3dDesignJavaScript;
async function download3dDesign(req, res) {
    try {
        const asset_url_req = await (0, database_1.default)().query(`SELECT asset_url FROM designs_3d WHERE id=$1;`, [parseInt(req.params.id)]);
        if (!!!asset_url_req.rows[0].asset_url)
            throw new Error("Something went wrong getting the asset url.");
        const asset_url = asset_url_req.rows[0].asset_url;
        const response = await (0, axios_1.default)({
            method: 'GET',
            url: asset_url,
            responseType: 'stream',
        });
        res.setHeader('Content-Disposition', `attachment; filename="${asset_url.replace('https://cdn.storething.org/frankmbrown/assets-designs-games/', '')}"`);
        // Pipe remote stream directly to the response
        response.data.pipe(res);
        response.data.on('error', (err) => {
            console.error('Download Asset Stream error:', err);
            res.status(500).end('Stream failed.');
        });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong downloading the file.");
    }
}
exports.download3dDesign = download3dDesign;
async function getGames(req, res) {
    var _a;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Games', item: '/games', position: 2 }];
    const view = 'pages/games';
    const title = "Frank's Games";
    const image = "https://image.storething.org/frankmbrown%2F527e1a39-33f7-4967-bf31-2c13f7635b54.jpg";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Games"];
    const description = 'I am creating this page to host games that I create. You can see links to the games that I have created below. Some background: I developed some interest in creating 2D and 3D games after reading about Computer Graphics and using Three.js over the past couple weeks (March 2025), and now that AI has made it easier to create pixel art, I am going to try to create some games.';
    const tableOfContents = [
        {
            "id": "page-about",
            "text": "About Page"
        }
    ];
    if (Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) === 3) {
        tableOfContents.push({ "id": "upload-game-script", text: "Upload Game Script" }, { "id": "upload-new-game", text: "Upload New Game" });
    }
    tableOfContents.push({
        "id": "games-list",
        "text": "Games"
    });
    const createArticleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "game-article", `<h2 class="h2 first-rte-element" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr"><a href="#i3f235e47-139f-4fb6-a9e1-344d6a838b1c" id="i3f235e47-139f-4fb6-a9e1-344d6a838b1c" class="same-page" data-v="1"><b data-v="1"><strong class="bolder" data-v="1" style="white-space: pre-wrap;">About the Game</strong></b></a></h2><hr class="lexical divider-color" style="border-bottom-width: 5px !important;" data-color="var(--divider)" data-width="5" data-v="1"><ul style="text-align: left; margin: 6px 0px 6px 0px; padding-top: 0px; padding-bottom: 0px;" class="first" data-v="1"><li value="1" data-v="1"></li></ul><p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" data-e-indent="0"><br></p><h2 class="h2" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr"><a href="#i6017bd96-7c08-475b-9ce3-9ac3b7de4d73" id="i6017bd96-7c08-475b-9ce3-9ac3b7de4d73" class="same-page" data-v="1"><b data-v="1"><strong class="bolder" data-v="1" style="white-space: pre-wrap;">How to Play</strong></b></a></h2><hr class="lexical divider-color" style="border-bottom-width: 5px !important;" data-color="var(--divider)" data-width="5" data-v="1">
`);
    const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
    const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('game_id', order_by.order_by_value, req);
    if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
        return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
    }
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/games', image };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        createArticleHTML,
        order_by,
        previews: previews.str
    });
}
exports.getGames = getGames;
async function postGame(req, res) {
    try {
        const title = req.body['game-title'];
        const description = req.body['game-description'];
        const image = req.body['game-img-text'];
        const javascript = req.body['game-javascript'];
        const article = JSON.parse(req.body['game-article']);
        if (typeof title !== 'string' || title.length < 1 || title.length > 150) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid title."));
        }
        if (typeof description !== 'string' || description.length < 1 || description.length > 500) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid description."));
        }
        if (typeof image !== 'string' || !!!image.startsWith('https://image.storething.org/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid image."));
        }
        if (typeof javascript !== 'string' || !!!javascript.startsWith('https://cdn.storething.org/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid javascript."));
        }
        const { desktop_html, tableOfContents, tablet_html, mobile_html, innerText, editorState } = await (0, lexical_1.parseArticleLexical)(article);
        const date_created = (0, time_1.getUnixTime)();
        const [dbResp, _] = await Promise.all([
            (0, database_1.default)().query(`INSERT INTO games (title,description,image,editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,date_created,last_edited,game_javascript) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`, [title, description, image, editorState, desktop_html, tablet_html, mobile_html, tableOfContents, date_created, date_created, javascript]),
            (0, projects_1.uploadPageImageFromUrl)(req, image)
        ]);
        const id = dbResp.rows[0].id;
        if (!!!Number.isInteger(id)) {
            return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong uploading the game."));
        }
        const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`;
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully uploaded the game.").concat(reloadPageScript));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the game!"));
    }
}
exports.postGame = postGame;
async function postGameJavaScript(req, res) {
    try {
        const file = req.file;
        if (!!!file)
            throw new Error("Something went wrong uploading the game JavaScript file.");
        const fileURL = await (0, aws_implementation_1.putJavaScriptGamesDesigns)(file);
        return res.status(200).send(`<p class="t-success">${fileURL}</p>`);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the game javascript!"));
    }
}
exports.postGameJavaScript = postGameJavaScript;
async function getGame(req, res) {
    var _a;
    try {
        const { id: idStr, title: titleStr } = req.params;
        const view = 'pages/game';
        var articleBody = '';
        var trueTitle = '';
        var trueDescription = '';
        var lastEditedTime = '';
        var dateCreatedTime = '';
        var keywords = [];
        var tableOfContents = [
            { id: "about-design", text: "About the Game" }
        ];
        var pageImage = null;
        var path = '';
        var like_url = `/like/games/${parseInt(idStr)}/${encodeURIComponent(titleStr)}`;
        var has_liked = false;
        var like_count = 'N/A';
        var view_count = 'N/A';
        var game_javascript = '';
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getGameAndDesignLikesAndViews)(req, parseInt(idStr), 'game'), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        articleBody = (0, admin_1.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.date_created));
        const last_edited_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.last_edited));
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/games/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = tableOfContents.concat(articleFromDB.table_of_contents);
        tableOfContents.push({ id: "design-sect", text: "Design" });
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        game_javascript = articleFromDB.game_javascript;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Goodreads', item: '/games', position: 2 }];
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                date_created: dateCreatedTime,
                last_edited: lastEditedTime,
                date_created_str,
                last_edited_str,
                title: trueTitle,
                articleHTML: articleBody,
                description: trueDescription
            },
            like_count,
            view_count,
            has_liked,
            like_url,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str,
            game_javascript
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/games', 400, { severity: "error", message: "Something went wrong getting the game!" });
    }
}
exports.getGame = getGame;
async function getAIChatPage(req, res) {
    var _a, _b;
    try {
        if (req.get('hx-target') === "#replace-with-nothing" || req.get('hx-target') === "replace-with-nothing") {
            return res.status(200).send('');
        }
        const view = 'pages/projects/ai-chat';
        const chat_id = (_a = req.params) === null || _a === void 0 ? void 0 : _a.uuid;
        const title = "AI Chat";
        const image = "https://image.storething.org/frankmbrown/7537ebac-c6eb-4b26-9d5a-4d1f347b0eda.jpg";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "AI Chat"];
        const description = 'AI Chat page.';
        const path = chat_id ? `/ai-tools/ai-chat/${chat_id}` : `/ai-tools/ai-chat`;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'AI Tools', item: '/ai-tools', position: 2 }, { name: 'AI Chat', item: path, position: 3 }];
        const tableOfContents = [];
        const ip_id = req.session.ip_id;
        const user_id = (_b = req.session.auth) === null || _b === void 0 ? void 0 : _b.userID;
        var messages;
        var chat_names_rows_resp;
        var chat_html = '';
        const db = (0, database_1.default)();
        if (chat_id) {
            [messages, chat_names_rows_resp] = await Promise.all([
                db.query(`SELECT id, user_message, html, model, is_error AS error, chat_name FROM ai_chat WHERE chat_id=$1 ORDER BY id DESC LIMIT 100;`, [chat_id]),
                db.query(`SELECT DISTINCT chat_id, chat_name FROM ai_chat WHERE ${user_id !== undefined ? `user_id=$1;` : `ip_id=$1;`}`, [user_id !== undefined ? user_id : ip_id])
            ]);
        }
        else {
            chat_names_rows_resp = await db.query(`SELECT DISTINCT chat_id, chat_name FROM ai_chat WHERE ${user_id !== undefined ? `user_id=$1;` : `ip_id=$1;`}`, [user_id !== undefined ? user_id : ip_id]);
        }
        var current_chat_name = `Select AI Chat`;
        const chat_names_rows = chat_names_rows_resp.rows.filter((obj) => Boolean(obj.chat_name && obj.chat_id)).map((obj) => {
            const { chat_name, chat_id: chat_id_obj } = obj;
            const current_chat = chat_id_obj === chat_id;
            if (current_chat)
                current_chat_name = (0, escape_html_1.default)(chat_name);
            return `<button type="button" tabindex="-1" class="select-option" role="option" aria-selected="${current_chat}" data-val="${(0, escape_html_1.default)(chat_id_obj)}" hx-get="/ai-tools/ai-chat/${(0, escape_html_1.default)(chat_id_obj)}" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress">${(0, escape_html_1.default)(chat_name)}</button>`;
        }).join('');
        const select_html = `<div class="flex-row justify-center">
  <div class="select">
    <button type="button" role="combobox" aria-haspopup="listbox" aria-controls="ai-chat-page-select-dropdown" class="select" aria-label="Select AI Chat" data-popover data-pelem="#ai-chat-page-select-dropdown" data-click aria-expanded="false" style="padding: 0.25rem 0.3rem !important; margin: 0; min-width: 150px; max-width: 200px; overflow-x: hidden; overflow-y: hidden;">
      <span class="body2" id="current-ai-chat-page-name">${current_chat_name}</span>
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
    </button>
    <div tabindex="0" id="ai-chat-page-select-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
      <input type="text" hidden value="${(0, escape_html_1.default)(chat_id ? chat_id : '')}" name="ai-chat-page-select-input" id="ai-chat-page-select-input">
      ${chat_names_rows}
    </div>
  </div>
</div>`;
        if (messages) {
            chat_html = messages.rows.reverse().map((message) => {
                const { user_message, html, model, id, error } = message;
                if (user_message) {
                    return `<fieldset role="none" class="response-ai-chat user">
        <legend role="none" class="flex-row align-center gap-1"><span>User</span> <svg class="ai-chat" viewBox="0 0 448 512" title="user" focusable="false" inert tabindex="-1"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"></path></svg></legend>
        <div class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="ai-chat-response-${id}">${html}</div>
        </fieldset>`;
                }
                else if (error) {
                    return `<div style="margin-top:6px;" class="text-align-center">${html}</div>`;
                }
                else {
                    var svg = '';
                    var className = '';
                    var modelProviderName = '';
                    if (model.includes('meta-llama')) {
                        modelProviderName = 'Meta';
                        svg = `<svg class="ai-chat" viewBox="0 0 640 512" title="meta" focusable="false" inert="" tabindex="-1"><path d="M640 317.9C640 409.2 600.6 466.4 529.7 466.4C467.1 466.4 433.9 431.8 372.8 329.8L341.4 277.2C333.1 264.7 326.9 253 320.2 242.2C300.1 276 273.1 325.2 273.1 325.2C206.1 441.8 168.5 466.4 116.2 466.4C43.42 466.4 0 409.1 0 320.5C0 177.5 79.78 42.4 183.9 42.4C234.1 42.4 277.7 67.08 328.7 131.9C365.8 81.8 406.8 42.4 459.3 42.4C558.4 42.4 640 168.1 640 317.9H640zM287.4 192.2C244.5 130.1 216.5 111.7 183 111.7C121.1 111.7 69.22 217.8 69.22 321.7C69.22 370.2 87.7 397.4 118.8 397.4C149 397.4 167.8 378.4 222 293.6C222 293.6 246.7 254.5 287.4 192.2V192.2zM531.2 397.4C563.4 397.4 578.1 369.9 578.1 322.5C578.1 198.3 523.8 97.08 454.9 97.08C421.7 97.08 393.8 123 360 175.1C369.4 188.9 379.1 204.1 389.3 220.5L426.8 282.9C485.5 377 500.3 397.4 531.2 397.4L531.2 397.4z"></path></svg>`;
                        className = "meta";
                    }
                    else if (model.includes('qwen')) {
                        svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`;
                        className = 'qwen';
                        modelProviderName = 'Qwen';
                    }
                    else if (model.includes('google')) {
                        svg = `<svg class="ai-chat" viewBox="0 0 488 512" title="google" focusable="false" inert="" tabindex="-1"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>`;
                        className = 'google';
                        modelProviderName = 'Google';
                    }
                    else if (model.includes('mistralai')) {
                        svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em"><path d="M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z"></path><path d="M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z"></path><path d="M3.428 10.258h17.144v3.428H3.428v-3.428z"></path><path d="M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z"></path><path d="M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z"></path></svg>`;
                        className = 'mistral';
                        modelProviderName = 'Mistral';
                    }
                    else if (model.includes('amazon')) {
                        svg = `<svg class="ai-chat" viewBox="0 0 448 512" title="amazon" focusable="false" inert="" tabindex="-1"><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"></path></svg>`;
                        className = 'amazon';
                        modelProviderName = 'Amazon';
                    }
                    else if (model.includes('anthropic')) {
                        svg = '<svg class="ai-chat" xmlns:x="ns_extend;" xmlns:i="ns_ai;" xmlns:graph="ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 92.2 65" xml:space="preserve"> <path d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z   M24.3,39.3l8.8-22.8l8.8,22.8H24.3z"></path></svg>';
                        className = "anthropic";
                        modelProviderName = "Anthropic";
                    }
                    else if (model.includes('openai')) {
                        svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" focusable="false" inert=""><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path></svg>`;
                        className = 'openai';
                        modelProviderName = 'OpenAI';
                    }
                    return `<fieldset role="none" class="response-ai-chat ai ${className}">
        <legend role="none" class="flex-row align-center gap-1"><span>${modelProviderName} (${model})</span> ${svg}</legend>
        <div class="lexical-wrapper" data-rich-text-editor="true" data-editable="false" data-type="full" id="ai-chat-response-${id}">${html}</div>
        </fieldset>`;
                }
            }).join('');
        }
        else {
            chat_html = `<div style="margin-top:6px;" class="text-align-center"><p class="body1 bold text-align-center" style="max-width: 600px; margin: auto;">Welcome to Frank's AI Chat. Edit the Model you want to use in the settings dialog.Chat with the model using the textbox below. <br> <mark class="bold">NOTE:</mark> Users are limited to $1 per day in chat-related costs, though this is actually a lot of messages.</p></div>`;
        }
        const resp = (0, lexicalImplementations_1.getCommentImplementation)(req, 'page-ai-chat-editor', false, '<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span data-v="1" style="white-space: pre-wrap;">Enter your AI chat message here...</span></p>', { wrapperStyle: 'lexical-wrapper', type: 'comment', rteStyle: 'padding-bottom: 30px; min-height: 100px; max-height: 200px;' });
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path, image, noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            chat_box: resp,
            select_html,
            chat_html
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: "error", message: "Something went wrong getting the AI chat page." });
    }
}
exports.getAIChatPage = getAIChatPage;
async function searchAIChat(req, res) {
    var _a;
    try {
        const search_term = req.query['search-ai-chat-box'];
        if (typeof search_term !== 'string' || !!!(search_term === null || search_term === void 0 ? void 0 : search_term.length)) {
            return res.status(200).send((0, html_1.getWarningAlert)('Search term must be at least one character long.', undefined, false));
        }
        const user_id = (_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID;
        const ip_id = req.session.ip_id;
        const rows = await (0, database_1.default)().query(`WITH init_table AS (
	SELECT DISTINCT chat_name, chat_id FROM ai_chat WHERE ${user_id !== undefined ? `user_id` : `ip_id`}=$1
) SELECT similarity(lower($2),lower(chat_name)), chat_name, chat_id FROM init_table WHERE similarity(lower($2),lower(chat_name))<>0 ORDER BY similarity DESC NULLS LAST LIMIT 20;`, [user_id || ip_id, search_term]);
        const options = rows.rows.filter((obj) => typeof obj.chat_name === "string" && typeof obj.chat_id === "string").map((obj) => `<div class="flex-row justify-start align-center mt-1" style="min-width: 0px; border: 2px solid var(--text-primary); padding: 6px; background-color: var(--background);">
    <label class="radio">
    <input type="radio" name="ai-chat-search-option" value="${(0, escape_html_1.default)(obj.chat_id)}" class="secondary">
    ${(0, escape_html_1.default)(obj.chat_name)}
    </label>
    </div>`).join('');
        if (!!!options.length) {
            return res.status(200).send((0, html_1.getWarningAlert)('No AI Chats matched the results.', undefined, false));
        }
        return res.status(200).send(options);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong searching AI chat.", undefined, false));
    }
}
exports.searchAIChat = searchAIChat;
async function searchAIChatResult(req, res) {
    var _a;
    try {
        const chat_id = req.params.id;
        const user_id = (_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID;
        const ip_id = req.session.ip_id;
        if (typeof chat_id !== "string")
            throw new Error('Something went wrong getting the chat_id from the request.');
        const resp = await (0, database_1.default)().query(`SELECT id, user_message, html, model, is_error AS error, chat_name, chat_id FROM ai_chat WHERE chat_id=$1 AND ${user_id !== undefined ? `user_id` : `ip_id`}=$2 ORDER BY id DESC LIMIT 100;`, [chat_id, user_id || ip_id]);
        if (!!!resp.rows.length)
            throw new Error("No rows in response");
        const chat_id_new = resp.rows[0].chat_id;
        const chat_name = resp.rows[0].chat_name;
        const str = (0, COMPONENTS_ROUTER_1.getAIChatHTML)(resp.rows.reverse(), true);
        console.log(chat_name, chat_id);
        return res.status(200).json({ str: str, chat_name, chat_id: chat_id_new });
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong searching AI chat.");
    }
}
exports.searchAIChatResult = searchAIChatResult;
async function getElectronicsAndRobotics(req, res) {
    try {
        const view = `pages/electronics-robotics`;
        const path = `/electronics-robotics`;
        const title = `Frank\'s Electronics and Robotics Projects`;
        const image = "https://image.storething.org/frankmbrown/a09e6f8d-f3a6-4a32-8e07-c4bbb4760fa8.jpg";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "AI Chat"];
        const description = 'AI Chat page.';
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'AI Tools', item: '/ai-tools', position: 2 }, { name: 'AI Chat', item: path, position: 3 }];
        const tableOfContents = [
            { id: "about-this-page", text: "About this Page" },
            { id: "elec-rob-projects", text: "Electronics & Robotics Project" },
        ];
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)('electronics_id', order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path, image, noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        const articleHTML = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, 'elec-proj-art', '<p>Write about the electronics / robotics project here...</p>');
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            articleHTML,
            order_by,
            previews: previews.str
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: 'error', message: 'Something went wrong getting the electronics / robotics page.' });
    }
}
exports.getElectronicsAndRobotics = getElectronicsAndRobotics;
async function getElectronicsAndRoboticsProject(req, res) {
    var _a;
    try {
        const { id: idStr, title: titleStr } = req.params;
        const view = 'pages/electronics-robotics-page';
        var articleBody = '';
        var trueTitle = '';
        var trueDescription = '';
        var lastEditedTime = '';
        var dateCreatedTime = '';
        var keywords = [];
        var tableOfContents = [];
        var pageImage = null;
        var path = '';
        var like_url = `/like/electronics-robotics/${parseInt(idStr)}/${encodeURIComponent(titleStr)}`;
        var has_liked = false;
        var like_count = 'N/A';
        var view_count = 'N/A';
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getElectronicsLikesAndViews)(req, parseInt(idStr)), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        articleBody = (0, admin_1.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.date_created));
        const last_edited_str = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, parseInt(articleFromDB.last_edited));
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/electronics-robotics/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = tableOfContents.concat(articleFromDB.table_of_contents);
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Electronics and Robotics', item: '/electronics-robotics', position: 2 }];
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                date_created: dateCreatedTime,
                last_edited: lastEditedTime,
                date_created_str,
                last_edited_str,
                title: trueTitle,
                articleHTML: articleBody,
                description: trueDescription
            },
            like_count,
            view_count,
            has_liked,
            like_url,
            comments_str,
            ...comment_required_variables,
            ...annotation_required_variables,
            annotation_main_str,
            annotation_search_str
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/electronics-robotics', 400, { severity: 'error', message: 'Something went wrong getting the electronics / robotics project.' });
    }
}
exports.getElectronicsAndRoboticsProject = getElectronicsAndRoboticsProject;
async function postElectronicsAndRobotics(req, res) {
    try {
        const project_name = req.body['project-name'];
        const project_description = req.body['project-desc'];
        const project_image = req.body['project-image-text'];
        const articleString = req.body['elec-proj-art'];
        if (typeof project_name !== 'string' || project_name.length < 1 || project_name.length > 200) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid project name."));
        }
        if (typeof project_description !== 'string' || project_description.length < 1 || project_description.length > 500) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid project description."));
        }
        if (typeof project_image !== 'string' || !!!project_image.startsWith('https://image.storething.org')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid project image."));
        }
        const editorState = JSON.parse(articleString);
        const { editorState: editor_state, desktop_html, tablet_html, mobile_html, tableOfContents } = await (0, lexical_1.parseArticleLexical)(editorState);
        const now = (0, time_1.getUnixTime)();
        const [resp, _] = await Promise.all([
            (0, database_1.default)().query(`INSERT INTO electronics_projects (title,description,image,editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,date_created,last_edited) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`, [project_name, project_description, project_image, editor_state, desktop_html, tablet_html, mobile_html, tableOfContents, now, now]),
            (0, projects_1.uploadPageImageFromUrl)(req, project_image)
        ]);
        if (resp.rows.length !== 1) {
            return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the electronics / robotics project."));
        }
        const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`;
        return res.status(200).send((0, html_1.getSuccessAlert)('Successfully posted electronics / robotics prokect.').concat(reloadPageScript));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send('');
    }
}
exports.postElectronicsAndRobotics = postElectronicsAndRobotics;
