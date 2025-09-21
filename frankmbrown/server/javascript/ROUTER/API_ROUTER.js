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
const express_1 = require("express");
const searchIcons_1 = __importDefault(require("./functions/searchIcons"));
const body_parser_1 = __importDefault(require("body-parser"));
const code_1 = require("./functions/code");
const settingsHandler_1 = require("./functions/settingsHandler");
const exampleStateSelect_1 = __importDefault(require("./functions/exampleStateSelect"));
const general_1 = require("./functions/general");
const getIpLocationAndCheckDbSettings_1 = __importDefault(require("../MIDDLEWARE/getIpLocationAndCheckDbSettings"));
const aws_implementation_1 = require("../aws/aws-implementation");
const embed_1 = require("./functions/embed");
const lexical_1 = __importStar(require("./functions/lexical"));
const multer_1 = __importDefault(require("multer"));
const table_1 = require("./functions/table");
const rateLimit_1 = require("../MIDDLEWARE/rateLimit");
const mediaHelpers_1 = require("../aws/mediaHelpers");
const html_1 = require("./html");
const ejs_1 = __importDefault(require("ejs"));
const census_1 = require("./functions/census");
const markdownAPI_1 = require("./functions/markdownAPI");
const database_1 = __importDefault(require("../database"));
const AUTH = __importStar(require("../MIDDLEWARE/authMiddleware"));
const SURVEYS = __importStar(require("./pages_helper/surveys"));
const API_ROUTER = (0, express_1.Router)();
const upload = (0, multer_1.default)();
function ugcCodeRoute(req, res) {
    try {
        const nonce = req.session.jsNonce;
        const codeTemplate = `
      <style>
      <%-locals.css%>
      </style>
      <%-locals.html%>
      <script nonce="<%=locals.nonce%>">
        (function(){
          <%-locals.js%>
        })();
      </script>
    `;
        const { html, css, js } = req.body;
        if (typeof html !== 'string' || typeof css !== 'string' || typeof js !== 'string') {
            return res.status(200).send((0, html_1.getErrorAlert)('HTML CSS and Javascript must be a string.'));
        }
        const ret = ejs_1.default.render(codeTemplate, { html, css, js, nonce });
        const finalRet = ejs_1.default.render(`<iframe style="width: 100%; min-height: 500px; margin-top: 0.5rem; display: block;" srcdoc="<%=ret%>"></iframe>`, { ret });
        ;
        return res.status(200).send(finalRet);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong rendering the output.'));
    }
}
async function embedPost(req, res) {
    try {
        const { embed_type } = req.body;
        if (!!!VALID_EMBED_TYPES.has(embed_type))
            throw new Error('Embedding type not recognized');
        if (embed_type === 'news') {
            const { url } = req.body;
            if (typeof url !== 'string' || !!!VALID_URL_REGEX.test(url))
                throw new Error('URL should be a string and a valid URL for embedding news content.');
            const resp = await (0, embed_1.embedNews)(req, { url });
            return res.status(200).json({ ...resp });
        }
        else {
            throw new Error('Embed Type not recognized.');
        }
    }
    catch (error) {
        console.error(error);
        // Errors are handles on the client
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
async function getImageSignedURL(req, res) {
    const sizeStr = String(req.query['size']);
    const widthStr = String(req.query['width']);
    const heightStr = String(req.query['height']);
    const { image_name } = req.params;
    try {
        const { user_id, ip_id } = (0, aws_implementation_1.getUserIdAndIpIdForImageUpload)(req);
        if (!!!ip_id)
            throw new Error("Must have registered ip address to upload image to database.");
        const signedUrl = await (0, aws_implementation_1.getPostImageSignedUrl)(image_name, { image_name, size: sizeStr, width: widthStr, height: heightStr, user_id: String(user_id), ip_id: String(ip_id) });
        return res.status(200).json({ url: signedUrl });
    }
    catch (error) {
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
async function getAudioSignedURL(req, res) {
    var _a;
    const { audio_name, parts: partsStr } = req.params;
    const sizeInBytesStr = String(req.query['size']) || '0';
    try {
        if (req.session.uploadedAudio && req.session.uploadedAudio >= 3) {
            return res.status(500).json({ error: 'You are only allowed to upload 3 videos per sesison.' });
        }
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
        const ip_id = req.session.ip_id;
        if (!!!ip_id)
            throw new Error("Must have ip_id before uploading audio.");
        const parts = parseInt(partsStr);
        if (isNaN(parts) || parts < 0 || parts > 90)
            throw new Error('Invalid parts parameter');
        const metadata = {
            original: String(true),
            size: sizeInBytesStr,
            ip_id: String(ip_id),
            user_id: String(user_id)
        };
        const { signedUrls, UploadId, Key } = await (0, aws_implementation_1.getPostAudioSignedUrls)(audio_name, parts, metadata);
        return res.status(200).json({ urls: signedUrls, UploadId, Key });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
async function completeAudio(req, res) {
    try {
        const { Parts, UploadId, Key } = req.body;
        await (0, aws_implementation_1.completeMultipartUploadAudio)(Parts, UploadId, Key);
        return (0, mediaHelpers_1.afterMultipartUploadCompleteAudio)(req, res, Key);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Something went wrong completing the multipart upload.');
    }
}
async function getVideoSignedURL(req, res) {
    var _a;
    const { video_name, parts: partsStr } = req.params;
    const heightStr = req.query['height'] || null;
    const sizeInBytesStr = req.query['size'] || '0';
    const height = heightStr ? parseFloat(String(heightStr)) : null;
    if (!!!height || height < 100) {
        return res.status(500).json({ error: 'Height of a video must be at least 100px.' });
    }
    const sizeInBytes = parseFloat(String(sizeInBytesStr));
    try {
        if (req.session.uploadedVideo && req.session.uploadedVideo >= 3) {
            return res.status(500).json({ error: 'You are only allowed to upload 3 videos per session.' });
        }
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
        const ip_id = req.session.ip_id;
        if (!!!ip_id)
            throw new Error("Must have ip_id before uploading audio.");
        const parts = parseInt(partsStr);
        if (isNaN(parts) || parts < 0 || parts > 91)
            throw new Error('Invalid parts parameter');
        const metadata = {
            width: String(null),
            height: String(height),
            original: String(true),
            size: String(sizeInBytes),
            ip_id: String(ip_id),
            user_id: String(user_id)
        };
        const { signedUrls, UploadId, Key } = await (0, aws_implementation_1.getPostVideoSignedUrls)(video_name, parts, metadata);
        return res.status(200).json({ urls: signedUrls, UploadId, Key });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong.' });
    }
}
async function completeVideo(req, res) {
    try {
        const { Parts, UploadId, Key } = req.body;
        await (0, aws_implementation_1.completeMultipartUploadVideo)(Parts, UploadId, Key);
        return (0, mediaHelpers_1.afterMultipartUploadCompleteVideo)(req, res, Key);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send('Something went wrong completing the multipart upload.');
    }
}
async function onPostFirebaseToken(req, res) {
    try {
        const { token } = req.body;
        if (typeof token !== 'string') {
            throw new Error("Unable to retrieve token: " + token + " from API request.");
        }
        const ip_id = req.session.ip_id;
        const user_id = req.session.auth ? req.session.auth.userID : null;
        if (typeof ip_id !== "number") {
            throw new Error("Must have ip_id to send push notification.");
        }
        const query = `INSERT INTO firebase_tokens (ip_id,user_id,token) VALUES ($1,$2,$3) ON CONFLICT (ip_id) DO UPDATE SET user_id=$2, token=$3;`;
        await (0, database_1.default)().query(query, [ip_id, user_id, token]);
        return res.status(200).json({ success: "Successfully stored direbase token in database." });
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Something went wrong posting the firebase token." });
    }
}
async function getYesterdayDiary(req, res) {
    try {
        const query = `WITH diary_cte AS (
      SELECT id FROM diary ORDER BY diary.id DESC OFFSET 1 LIMIT 1
    ) SELECT article.lexical_state AS lexical_state FROM diary 
    JOIN article ON article.diary_id=diary.id
    JOIN diary_cte ON diary.id=diary_cte.id
    WHERE article.diary_id=diary_cte.id ORDER BY article.v DESC LIMIT 1;`;
        const dbResp = await (0, database_1.default)().query(query);
        if (!!!dbResp.rows.length) {
            throw new Error("Something went wrong getting the lexical state.");
        }
        const lexical_state = dbResp.rows[0].lexical_state;
        if (!!!lexical_state)
            throw new Error("Something went wrong getting the lexical state.");
        return res.status(200).json({ "lexical_state": lexical_state });
    }
    catch (e) {
        console.error(e);
        return res.status(500).send("Something went wrong getting the lexical state.");
    }
}
async function getLexicalStateFromNotebookFile(req, res) {
    try {
        const file = req.file;
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Something went wrong converting Notebook to Lexical State." });
    }
}
async function getLexicalStateFromTexFile(req, res) {
    try {
        const file = req.file;
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Something went wrong converting TeX to HTML." });
    }
}
API_ROUTER.post('/ugc-code', (0, rateLimit_1.getRateLimit)(60000, 200), body_parser_1.default.json({}), ugcCodeRoute);
API_ROUTER.post('/example-lexical', body_parser_1.default.urlencoded({}), lexical_1.renderExampleLexical);
/* --------------------------------- Design System and Other --------------------------- */
API_ROUTER.post('/search-icons/?', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.urlencoded({ extended: true }), searchIcons_1.default);
API_ROUTER.post('/search-mui-icons/?', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.urlencoded({ extended: true }), searchIcons_1.default);
API_ROUTER.post('/search-coding-languages/?', (0, rateLimit_1.getRateLimit)(60000, 10), body_parser_1.default.urlencoded({ extended: true }), code_1.codingLanguages);
API_ROUTER.post('/circle-example/?', (0, rateLimit_1.getRateLimit)(60000, 20), body_parser_1.default.urlencoded({ extended: true }), general_1.handleCircleExample);
API_ROUTER.post('/polygon-example/?', (0, rateLimit_1.getRateLimit)(60000, 20), body_parser_1.default.urlencoded({ extended: true }), general_1.handlePolygonExample);
API_ROUTER.post('/example-state-select/?', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.urlencoded({ extended: true }), exampleStateSelect_1.default);
/**
* Get Census commui
*/
API_ROUTER.post('/device-position/?', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.json(), census_1.getCensusCommunities);
API_ROUTER.post('/table', (0, rateLimit_1.getRateLimit)(60000, 100), upload.single('upload-data-to-table-2'), table_1.getTableHTML);
API_ROUTER.post('/markdown', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.urlencoded({}), markdownAPI_1.markdownApi);
API_ROUTER.post('/html-table-to-csv-json', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.urlencoded({}), table_1.tableToCsvAndJsonApiRoute);
/**
 * In layout.ejs, there is a hidden div that polls this api route every second to
 * figure out if create_ip_address_row (i.e. -
 * figure out if this value is not undefined) has been
 * set in cache. If it has not been set in cache, it returns the same element. Else,
 * it returns the cookie banner.
 */
API_ROUTER.get('/cookie-banner/?', (0, rateLimit_1.getRateLimit)(60000, 1000), general_1.handleCookieBanner);
/* ---------------------------------------------- Settings -------------------------------- */
/**
 * - Called in forms/settings-form.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.post('/settings/?', (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({ extended: true }), settingsHandler_1.settingsHandler);
/**
 * - Called in layout.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 *
 * - Use this route to get the settings - if they exist - for a user's ip address and to make the
 * asynchronous call using node-ip_info to get information about the user's ip address
 * - If the user's ip address does not exist in cache, then send the page back to the user with
 * a hidden element that can be used to set the initial settings in cache
 */
API_ROUTER.get('/get-settings-and-form/?', (0, rateLimit_1.getRateLimit)(60000, 500), getIpLocationAndCheckDbSettings_1.default, settingsHandler_1.getSettingsAndForm); // Called in layout.ejs
/**
 * - Called in partials/settings.ejs
 * - Renders forms/settings-form.ejs
 */
API_ROUTER.get('/settings-form/?', (0, rateLimit_1.getRateLimit)(60000, 100), settingsHandler_1.getSettingsForm);
/**
 * - Called in partials/navbar.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.get('/light-mode-dark-mode/?', (0, rateLimit_1.getRateLimit)(60000, 200), settingsHandler_1.lightModeDarkMode);
/**
 * - Called in forms/settings-form.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.get('/settings-form-reset/?', (0, rateLimit_1.getRateLimit)(60000, 200), settingsHandler_1.resetThemeColors);
/**
 * Call this route when you need to create a row in the database to store the user's
 * settings according to his or her ip address. This should only be called when
 * you haven't encountered a new ip address  and you want to store information for it in the
 * database
 */
API_ROUTER.get('/create-ip-settings/?', (0, rateLimit_1.getRateLimit)(60000, 200), settingsHandler_1.createIPSettingsInDatabase);
/**
 * Call this route when you need to update the user's settings. This should be called anytime the settings
 * change (e.g., settings form change, light mode / dark mode, settings reset)
*/
API_ROUTER.get('/save-settings/?', (0, rateLimit_1.getRateLimit)(60000, 200), settingsHandler_1.updateSettingsInDatabase);
/**
 * This API Route should be called in layout.ejs after the user has accepted
 * the application's use of preferences cookies and if we know that the user already has their settings
 * saved in the database
 */
API_ROUTER.get('/set-settings-after-cookie/?', (0, rateLimit_1.getRateLimit)(60000, 100), settingsHandler_1.setSettingsAfterCookie);
/* ---------------------------------------- File Inputs ------------------------------------------ */
API_ROUTER.get('/signed-url/image/:image_name/?', (0, rateLimit_1.getRateLimit)(60000, 100), getImageSignedURL);
/**
 * 6 MB per part * 90 Parts -> 540MB max
 */
API_ROUTER.get('/signed-url/audio/:audio_name/:parts/?', getAudioSignedURL);
/**
 * API Path To Call after completing uploading the parts of the audio / video file on
 * the client. This api route should update the metadata of the uploaded file,
 * transcode the file to different formats, generate closed captions, and for video files,
 * generate and post a thumbnail video to the client
 */
API_ROUTER.post('/complete-audio/?', body_parser_1.default.json(), completeAudio);
/**
 * For videos, we actually need to use the width and height metadata to generate the video
 * using ffmpeg
 */
API_ROUTER.get('/signed-url/video/:video_name/:parts/?', getVideoSignedURL);
/**
 * API Path To Call after completing uploading the parts of the audio / video file on
 * the client. This api route should update the metadata of the uploaded file,
 * transcode the file to different formats, generate closed captions, and for video files,
 * generate and post a thumbnail video to the client
 */
API_ROUTER.post('/complete-video/?', body_parser_1.default.json(), completeVideo);
const VALID_EMBED_TYPES = new Set([
    'news',
    'facebook-page',
    'facebook-post',
    'facebook-video',
    'tiktok',
    'tweet',
    'twitter-timeline',
    'reddit',
    'instagram'
]);
const VALID_URL_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
/**
 * Embed news articles as of right now
 */
API_ROUTER.post('/embed/?', (0, rateLimit_1.getRateLimit)(60000, 100), body_parser_1.default.json(), embedPost);
/**
 * Get lexical HTML. The reason why this route exists is because you may want to have multiple lexical editors on the page at once
 */
API_ROUTER.get('/lexical/:type/:other?', (0, rateLimit_1.getRateLimit)(60000, 600), lexical_1.default);
API_ROUTER.get('/lexical/:type/?', (0, rateLimit_1.getRateLimit)(60000, 600), lexical_1.default);
API_ROUTER.post('/lexical-table/?', (0, rateLimit_1.getRateLimit)(60000, 200), upload.single('file'), table_1.lexicalTable);
/* -------------------------------- Analytics ----------------------------------- */
API_ROUTER.get('/get-file/:type/frankmbrown/:key', (0, rateLimit_1.getRateLimit)(60000, 5), aws_implementation_1.handleGetFileFromS3);
API_ROUTER.get('/get-file/:type/civgauge/:key', (0, rateLimit_1.getRateLimit)(60000, 5), aws_implementation_1.handleGetFileFromS3);
API_ROUTER.post('/firebase-token', (0, rateLimit_1.getRateLimit)(60000, 5), body_parser_1.default.json({}), onPostFirebaseToken);
API_ROUTER.get('/reload-yesterday-diary', (0, rateLimit_1.getRateLimit)(60000, 10), AUTH.isAdmin, getYesterdayDiary);
API_ROUTER.get('/download-survey/:id', (0, rateLimit_1.getRateLimit)(60000, 30), SURVEYS.downloadSurvey);
API_ROUTER.post('/save-survey', (0, rateLimit_1.getRateLimit)(60000, 20), SURVEYS.postSaveSurvey);
API_ROUTER.use((req, res) => {
    if (req.headers['content-type'] === "application/json") {
        return res.status(404).json({ error: "API route not found." });
    }
    else {
        return res.status(404).send((0, html_1.getErrorSnackbar)("Path not found"));
    }
});
API_ROUTER.post('/lexical-file-upload/notebook', upload.single('upload-ipynb-file-input'), getLexicalStateFromNotebookFile);
API_ROUTER.post('/lexical-file-upload/tex', upload.single('upload-tex-file-input'), getLexicalStateFromTexFile);
exports.default = API_ROUTER;
