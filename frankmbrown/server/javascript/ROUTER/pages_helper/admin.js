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
exports.getCreateGameDesign = exports.postNotifications = exports.postEditToDo = exports.getEditToDo = exports.markToDoComplete = exports.deleteToDo = exports.postToDo = exports.getAdminToDosPage = exports.getCreateChartPage = exports.sendEmailRoute = exports.getAdminUtilitiesIndexPages = exports.getAdminUtilitiesClearCache = exports.getAdminUtilities = exports.getAdminPage = exports.getAdminViewVideoPage = exports.getAdminViewAudioPage = exports.getAdminViewImagePage = exports.deleteS3Media = exports.getMoreS3Media = exports.getArticle = exports.getAdminPageArticle = exports.deleteArticleOrArticleVersion = exports.addArticleVersion = exports.postEditOrCreateArticle = exports.getAdminPageArticlePost = exports.searchNotes = exports.getArticlePreviews = exports.getArticlePostsPreviews = exports.updateSearchAdminDiary = exports.searchAdminDiary = exports.saveDiary = exports.getEditDiary = exports.getDiary = exports.getTodayDiary = exports.getAdminPageDiary = exports.getDiaryOrArticle = exports.getArticleInnerHTML = exports.getDevice = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const database_1 = __importDefault(require("../../database"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const lexical_1 = require("../../lexical");
const TIME = __importStar(require("../../utils/time"));
const NUMBER = __importStar(require("../../utils/number"));
const ARTICLE_HELPER = __importStar(require("./articleHelpers"));
const redirect_override_1 = require("../helper_functions/redirect-override");
const html_1 = require("../html");
const aws_implementation_1 = require("../../aws/aws-implementation");
const escape_html_1 = __importDefault(require("escape-html"));
const mediaHelpers_1 = require("../../aws/mediaHelpers");
const cache_1 = require("../../database/cache");
const indexPagesHelper_1 = require("../../scripts/index-pages/indexPagesHelper");
const env_1 = __importDefault(require("../../utils/env"));
const lexicalImplementations_1 = require("./lexicalImplementations");
const IS_DEVELOPMENT_1 = __importDefault(require("../../CONSTANTS/IS_DEVELOPMENT"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const buffer_image_size_1 = __importDefault(require("buffer-image-size"));
const jsdom_1 = __importDefault(require("jsdom"));
const ai_1 = require("../../ai");
const pgvector_1 = __importDefault(require("pgvector"));
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const account_1 = require("./account");
const handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
const projects_1 = require("./projects");
const BASE_PATH_1 = __importDefault(require("../../CONSTANTS/BASE_PATH"));
const ejs_1 = __importDefault(require("ejs"));
var gm;
if (IS_DEVELOPMENT_1.default) {
    gm = require('gm').subClass({ imageMagick: '7+' });
}
else {
    gm = require('gm');
}
const INGRESS_IMAGE = env_1.default.AWS_INGRESS_IMAGE;
const EGRESS_IMAGE = env_1.default.EGRESS_IMAGE;
if (INGRESS_IMAGE === undefined)
    throw new Error("Unable to get Ingress Image Bucket");
if (!!!EGRESS_IMAGE === undefined)
    throw new Error("Unable to get Egress Image Bucket.");
var IMAGE_LAST_UPDATED_DATE = 0;
var LAST_UPDATED_IMAGE_URL = '';
async function getDiaryImageToday(startOfDay, timezone) {
    const IMAGE_PATH = node_path_1.default.resolve(__dirname, 'diary_image', `template.png`);
    const IMAGE_OUT_PATH = node_path_1.default.resolve(__dirname, 'diary_image', `today_image.png`);
    const randColor = "#000000".replace(/0/g, function () {
        return (~~(Math.random() * 16)).toString(16);
    });
    const randColor2 = "#000000".replace(/0/g, function () {
        return (~~(Math.random() * 16)).toString(16);
    });
    const datestring = TIME.formatDateFromUnixTime('MM/DD/YYYY', timezone, parseInt((startOfDay).toString()));
    const file = await new Promise((resolve, reject) => {
        gm(IMAGE_PATH)
            .font("Arial")
            .fontSize(150)
            .fill(randColor)
            .stroke(randColor2)
            .strokeWidth(5)
            .gravity('Center')
            .drawText(0, 0, datestring)
            .write(IMAGE_OUT_PATH, async (err) => {
            if (err)
                reject(err);
            const ret = await node_fs_1.default.promises.readFile(IMAGE_OUT_PATH);
            resolve(ret);
        });
    });
    const { height, width, type } = (0, buffer_image_size_1.default)(file);
    const filename = node_crypto_1.default.randomUUID().concat(`.${type}`);
    const key = 'frankmbrown/'.concat(filename);
    await (0, aws_implementation_1.uploadImageObject)(key, file, type, { width: String(width), height: String(height) }, 3, 25);
    const url = `https://image.storething.org/${key}`;
    IMAGE_LAST_UPDATED_DATE = startOfDay;
    LAST_UPDATED_IMAGE_URL = url;
    return url;
}
const getDevice = (obj) => {
    if (!!!obj)
        return 'mobile';
    if (obj.phone)
        return 'mobile';
    if (obj.tablet)
        return 'tablet';
    if (obj.desktop)
        return 'desktop';
    else {
        return 'mobile';
    }
};
exports.getDevice = getDevice;
const getArticleInnerHTML = (html, id) => {
    const randomUUID = 'id_'.concat(id ? id : node_crypto_1.default.randomUUID());
    return `<div class="lexical-wrapper example-render hz-scroll mt-2" style="padding: 0px; overflow-x: hidden;" data-rich-text-editor data-type="full" data-editable="false" id="${randomUUID}">${html}</div>`;
};
exports.getArticleInnerHTML = getArticleInnerHTML;
function parseSelectResults(rows, type) {
    const row = rows[0];
    if (type === 'diary') {
        const { html, id, start_of_day, last_edited, title, description, image, table_of_contents } = row;
        return {
            html,
            id: parseInt(String(id)),
            start_of_day: parseInt(String(start_of_day)),
            last_edited: parseInt(String(last_edited)),
            title: title || '',
            description: description || '',
            image,
            table_of_contents
        };
    }
    else {
        const { html, id, date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents } = row;
        return {
            html,
            id: parseInt(String(id)),
            start_of_day: parseInt(String(date_created)),
            last_edited: parseInt(String(last_edited)),
            active_v: parseInt(String(active_v)),
            highest_v: parseInt(String(highest_v)),
            versions,
            title: title || '',
            description: description || '',
            image,
            table_of_contents
        };
    }
}
async function getDiaryOrArticle(type, device, id, version) {
    const db = (0, database_1.default)();
    if (type === 'diary') {
        const resp = await db.query(`SELECT diary.id,diary.start_of_day,diary.last_edited,diary.title,diary.description,diary.v,diary.table_of_contents,diary.image, article.${device}_html html FROM diary FULL OUTER JOIN article ON diary.id=article.diary_id AND article.v=diary.v WHERE diary.id=$1::integer;`, [id]);
        if (!!!resp.rows.length)
            throw new Error('Unable to get diary from database.');
        return parseSelectResults(resp.rows, 'diary');
    }
    else {
        if (version.active_v) {
            const connection = await (0, database_1.default)().connect();
            try {
                await connection.query('BEGIN');
                const res1 = await connection.query(`SELECT id, date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents FROM ${type} WHERE id=$1::integer;`, [id]);
                if (!!!res1.rows.length) {
                    throw new Error('Unable to get main table information for note');
                }
                const row = res1.rows[0];
                const res2 = await connection.query(`SELECT article.${device}_html html FROM article WHERE article.${type}_id=$1::integer AND article.v=$2::smallint AND deprecated_time IS NULL;`, [row.id, row.active_v]);
                if (!!!res2.rows.length) {
                    throw new Error('Unable to get article information for note');
                }
                await connection.query('COMMIT');
                connection.release();
                const row2 = res2.rows[0];
                const newRow = { ...row, ...row2 };
                return parseSelectResults([newRow], type);
            }
            catch (error) {
                await connection.query('ROLLBACK');
                connection.release();
                console.error(error);
                throw new Error('Something went wrong getting note.');
            }
        }
        else {
            const connection = await (0, database_1.default)().connect();
            try {
                await connection.query('BEGIN');
                const res1 = await connection.query(`SELECT id, date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents FROM ${type} WHERE id=$1::integer;`, [id]);
                if (!!!res1.rows.length) {
                    throw new Error('Unable to get main table information for note');
                }
                const row = res1.rows[0];
                const res2 = await connection.query(`SELECT article.${device}_html html FROM article WHERE article.${type}_id=$1 AND article.v=$2 AND deprecated_time IS NULL;`, [row.id, version.v]);
                if (!!!res2.rows.length) {
                    throw new Error('Unable to get article information for note');
                }
                await connection.query('COMMIT');
                connection.release();
                const row2 = res2.rows[0];
                const newRow = { ...row, ...row2 };
                return parseSelectResults([newRow], type);
            }
            catch (error) {
                console.error(error);
                connection.release();
                throw new Error('Something went wrong getting note.');
            }
        }
    }
}
exports.getDiaryOrArticle = getDiaryOrArticle;
async function parsePostArticle(obj) {
    const { title, editorState, description, image, version, submitType } = obj;
    if (typeof title !== 'string' || title.length < 3 || title.length > 200)
        throw new Error(`${title}: Invalid title.`);
    if (typeof description !== 'string')
        throw new Error(`${description}: Invalid description.`);
    if (!!!editorState)
        throw new Error(`${editorState}: Unable to get article editor state.`);
    var newImage = image;
    if (typeof image === 'string' && !!!image.startsWith('https://image.storething.org')) {
        newImage = null;
    }
    if (typeof version === 'number' && (isNaN(version) || !!!isFinite(version)))
        throw new Error(`${version}: Invalid version.`);
    if (submitType !== 'save' && submitType !== 'publish')
        throw new Error(`${submitType}: Invalid submit type.`);
    const lexical = await (0, lexical_1.parseArticleLexical)(editorState);
    return {
        ...lexical,
        title,
        description,
        image: newImage,
        version,
        submitType
    };
}
/**
 *
 * @param type
 * @param obj
 * @param param2
 * @param publish
 * @returns
 */
async function createOrUpdateDiaryOrArticle(type, obj, { id, version }, publish) {
    var clearCache = false;
    var retID = id;
    const now = TIME.getUnixTime();
    const connection = await (0, database_1.default)().connect();
    const checkForRow = (a, query) => {
        if (!!!a.rows.length) {
            throw new Error(`Unable to get row for ${query}`);
        }
    };
    try {
        await connection.query('BEGIN;');
        if (type === "diary") {
            const query1 = `UPDATE diary SET last_edited=$1,title=$2,description=$3,v=v+1,image=$4,table_of_contents=$5 WHERE id=$6 RETURNING v;`;
            const res1 = await connection.query(query1, [now, obj.title, obj.description, obj.image, obj.tableOfContents, id]);
            checkForRow(res1, query1);
            const v = res1.rows[0].v;
            const query2 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
            const arr = [v, 1, id, null, null, null, obj.editorState, obj.desktop_html, obj.tablet_html, obj.mobile_html];
            const res2 = await connection.query(query2, arr);
            checkForRow(res2, query2);
            await connection.query('COMMIT;');
            connection.release();
            return { id: retID, clearCache: true };
        }
        else {
            // CREATE
            if (!!!id) {
                const query1 = `INSERT INTO ${type} (date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;`;
                const arr = [now, now, obj.title, obj.description, obj.image, publish ? 1 : null, 1, [1], obj.tableOfContents];
                const res1 = await connection.query(query1, arr);
                checkForRow(res1, query1);
                const query2 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
                const arr2 = [1, 1];
                if (type === "blog") {
                    arr2.push(null, res1.rows[0].id, null, null);
                }
                else if (type === "idea") {
                    arr2.push(null, null, res1.rows[0].id, null);
                }
                else if (type === "note") {
                    arr2.push(null, null, null, res1.rows[0].id);
                }
                arr2.push(obj.editorState, obj.desktop_html, obj.tablet_html, obj.mobile_html);
                const res2 = await connection.query(query2, arr2);
                checkForRow(res2, query2);
                await connection.query('COMMIT;');
                connection.release();
                retID = res1.rows[0].id;
                return { id: retID, clearCache: true };
                // UPDATE
            }
            else {
                if (version.active_v) {
                    clearCache = true;
                    const query1 = `UPDATE ${type} SET last_edited=$1,title=$2,description=$3,image=$4,table_of_contents=$5 WHERE id=$6 RETURNING *;`;
                    const arr1 = [now, obj.title, obj.description, obj.image, obj.tableOfContents, id];
                    const res1 = await connection.query(query1, arr1);
                    checkForRow(res1, query1);
                    const { id: articleID, active_v } = res1.rows[0];
                    const query2 = `UPDATE article SET deprecated_time=$1 WHERE ${type}_id=$2 AND v=$3 AND deprecated_time IS NULL RETURNING id;`;
                    const arr2 = [now, articleID, active_v];
                    const res2 = await connection.query(query2, arr2);
                    checkForRow(res2, query2);
                    const query3 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
                    const arr3 = [active_v, 1];
                    if (type === "blog") {
                        arr3.push(null, id, null, null);
                    }
                    else if (type === "idea") {
                        arr3.push(null, null, id, null);
                    }
                    else if (type === "note") {
                        arr3.push(null, null, null, id);
                    }
                    arr3.push(obj.editorState, obj.desktop_html, obj.tablet_html, obj.mobile_html);
                    const res3 = await connection.query(query3, arr3);
                    checkForRow(res3, query3);
                }
                else if (version.v) {
                    if (publish) {
                        clearCache = true;
                        const query1 = `UPDATE ${type} SET last_edited=$1,title=$2, description=$3, image=$4, active_v=$5, table_of_contents=$6 WHERE id=$7 RETURNING *;`;
                        const arr1 = [now, obj.title, obj.description, obj.image, version.v, obj.tableOfContents, id];
                        const res1 = await connection.query(query1, arr1);
                        checkForRow(res1, query1);
                        const { active_v, id: articleID } = res1.rows[0];
                        const query2 = `UPDATE article SET deprecated_time=$1 WHERE ${type}_id=$2 AND v=$3 AND deprecated_time IS NULL RETURNING id;`;
                        const arr2 = [now, articleID, active_v];
                        const res2 = await connection.query(query2, arr2);
                        checkForRow(res2, query2);
                        const query3 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
                        const arr3 = [active_v, 1];
                        if (type === "blog") {
                            arr3.push(null, id, null, null);
                        }
                        else if (type === "idea") {
                            arr3.push(null, null, id, null);
                        }
                        else if (type === "note") {
                            arr3.push(null, null, null, id);
                        }
                        arr3.push(obj.editorState, obj.desktop_html, obj.tablet_html, obj.mobile_html);
                        const res3 = await connection.query(query3, arr3);
                        checkForRow(res3, query3);
                    }
                    else {
                        const query0 = `SELECT active_v, versions FROM ${type} WHERE id=$1;`;
                        const res0 = await connection.query(query0, [id]);
                        checkForRow(res0, query0);
                        const { active_v: currentActive, versions } = res0.rows[0];
                        if (currentActive === version.v || versions.length === 1) {
                            clearCache = true;
                            const query1 = `UPDATE ${type} SET last_edited=$1,title=$2, description=$3, image=$4,table_of_contents=$5 WHERE id=$6 RETURNING *;`;
                            const arr1 = [now, obj.title, obj.description, obj.image, obj.tableOfContents, id];
                            const res1 = await connection.query(query1, arr1);
                            checkForRow(res1, query1);
                        }
                        const query2 = `UPDATE article SET deprecated_time=$1 WHERE ${type}_id=$2 AND v=$3 AND deprecated_time IS NULL RETURNING id;`;
                        const arr2 = [now, id, version.v];
                        const res2 = await connection.query(query2, arr2);
                        checkForRow(res2, query2);
                        const query3 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
                        const arr3 = [version.v, 1];
                        if (type === "blog") {
                            arr3.push(null, id, null, null);
                        }
                        else if (type === "idea") {
                            arr3.push(null, null, id, null);
                        }
                        else if (type === "note") {
                            arr3.push(null, null, null, id);
                        }
                        arr3.push(obj.editorState, obj.desktop_html, obj.tablet_html, obj.mobile_html);
                        const res3 = await connection.query(query3, arr3);
                        checkForRow(res3, query3);
                    }
                    await connection.query('COMMIT;');
                    connection.release();
                    return { id: retID, clearCache };
                }
                else {
                    throw new Error("Conditional wrong for updating article.");
                }
            }
        }
    }
    catch (error) {
        connection.query('ROLLBACK');
        connection.release();
        console.error(error);
        throw new Error("There was an error creating or updating diary or article.");
    }
}
/* -------------------------- Diary ------------------------------ */
async function getAllDiaryEntriesPreviews(admin, req) {
    const getDiariesQuery = /*sql*/ `SELECT id, start_of_day, last_edited, title, description, image FROM diary ORDER BY start_of_day desc;`;
    try {
        const diaryEntries = await (0, database_1.default)().query(getDiariesQuery, []);
        var str = diaryEntries.rows.map((obj) => {
            return ARTICLE_HELPER.renderDiaryPreview({
                date_created: Number(obj.start_of_day),
                last_edited: Number(obj.last_edited),
                title: obj.title.length ? obj.title : 'Not Yet Started',
                description: obj.description,
                type: 'diary',
                image: obj.image ? obj.image : undefined,
                id: obj.id,
                admin
            }, req);
        }).join('');
        return str;
    }
    catch (error) {
        console.error(error);
        throw new Error('Something went wrong with getting all the diary entry previews.');
    }
}
async function getAdminPageDiary(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Diary', item: '/admin/diary', position: 2 }];
    const title = "View Admin Diary Posts";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Diary"];
    const description = 'View All Diary Posts';
    const tableOfContents = [];
    const SEO = {
        breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/diary', noIndex: true
    };
    var page = '';
    try {
        page = await getAllDiaryEntriesPreviews(true, req);
    }
    catch (error) {
        page = (0, html_1.getErrorAlert)('Something went wrong getting the previews for the diary entries.');
    }
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/admin/admin-diary', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        page: page
    });
}
exports.getAdminPageDiary = getAdminPageDiary;
async function getTodayDiary(req) {
    var _a, _b, _c, _d;
    try {
        const startOfDaySeconds = TIME.getStartOfDaySeconds(((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York');
        if (!!!req.session.diary || req.session.startOfDay !== startOfDaySeconds) {
            IMAGE_LAST_UPDATED_DATE = startOfDaySeconds;
            const [url, _] = await Promise.all([
                getDiaryImageToday(IMAGE_LAST_UPDATED_DATE, ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York'),
                req.cache.del(`frankmbrown-diary-all-prev`)
            ]);
            const now = TIME.getUnixTime();
            const day_formatted = TIME.formatDateFromUnixTime('dddd MMMM D, YYYY', ((_c = req.session.settings) === null || _c === void 0 ? void 0 : _c.timezone) || 'America/New_York', now);
            const title = "Diary Entry: " + day_formatted.trim();
            const description = "Diary entry for " + day_formatted.trim().replace(/\s+/g, ' ');
            const db = (0, database_1.default)();
            const device = (0, exports.getDevice)(req.session.device);
            const connection = await db.connect();
            try {
                await connection.query('BEGIN;');
                const resp = await connection.query(`INSERT INTO diary (start_of_day,last_edited,image,title,description,v) VALUES ($1::bigint,$2::bigint,$3,$4,$5,1::smallint) ON CONFLICT (start_of_day) DO UPDATE SET v=diary.v RETURNING id,start_of_day,last_edited,title,description,v,table_of_contents, image`, [startOfDaySeconds, now, url, title, description]);
                const row = resp.rows[0];
                const resp2 = await db.query(`SELECT ${device}_html html FROM article WHERE diary_id=$1 AND v=$2;`, [row.id, row.v]);
                const articleRow = resp2.rows.length ? resp2.rows[0].html : '<p>Insert diary content here...</p>';
                await connection.query('COMMIT');
                connection.release();
                await req.cache.del(`frankmbrown-diary-all-prev`);
                const obj = {
                    html: articleRow,
                    id: parseInt(String(row.id)),
                    start_of_day: parseInt(String(startOfDaySeconds)),
                    last_edited: parseInt(String(row.last_edited)),
                    title: row.title || 'MISSING TITLE',
                    description: row.description || 'MISSING DESCRIPTION',
                    image: row.image,
                    table_of_contents: row.table_of_contents
                };
                req.session.diary = {
                    todayID: obj.id,
                    todayState: obj
                };
            }
            catch (error) {
                await connection.query('ROLLBACK');
                connection.release();
                console.error(error);
                throw new Error('Unabe to get today diary');
            }
        }
        const obj = req.session.diary.todayState;
        const tableOfContents = obj.table_of_contents;
        const form = ARTICLE_HELPER.getArticleForm(req, { innerHTML: obj.html || '<p>Insert article content here</p>', id: obj.id, title: obj.title, description: obj.description, type: 'diary', image: obj.image, versions: [1], desktop: Boolean((_d = req.session.device) === null || _d === void 0 ? void 0 : _d.desktop) });
        return { tableOfContents, form };
    }
    catch (error) {
        console.error(error);
        return { form: (0, html_1.getErrorAlert)('Unable to render today\'s diary. Try reloading the page.'), tableOfContents: [] };
    }
}
exports.getTodayDiary = getTodayDiary;
async function getDiary(req, res) {
    const view = 'pages/posts/diary';
    const { id: idString } = req.params;
    const id = parseInt(idString);
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Admin Diaries', item: '/admin/diary', position: 2 }
    ];
    const SEO = {
        breadcrumbs: breadcrumbs,
        keywords: [],
        title: '',
        description: '',
        tableOfContents: [],
        path: '',
        noIndex: true
    };
    if (NUMBER.isValidInteger(id)) {
        try {
            const resp = await getDiaryOrArticle('diary', (0, exports.getDevice)(req.session.device), id, { active_v: true, v: 1 });
            const { title, description, start_of_day, last_edited, table_of_contents, html } = resp;
            SEO.title = title;
            SEO.description = description;
            SEO.keywords = description.split(' ');
            SEO.path = `/admin/diary/${id}/${encodeURIComponent(title || 'Placeholder Title')}`;
            SEO.tableOfContents = table_of_contents;
            const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
            const dateStringCreated = TIME.getFullDateStringFromUnix(Number(start_of_day));
            const dateStringEdited = TIME.getFullDateStringFromUnix(Number(last_edited));
            const innerHTML = (0, exports.getArticleInnerHTML)(html);
            return res.status(200).render(view, {
                layout: requiredVariables.fullPageRequest ? 'layout' : false,
                ...requiredVariables,
                pageObj: {
                    title,
                    description,
                    dateStringCreated,
                    dateStringEdited,
                    innerHTML,
                    editDiaryHref: `/admin/diary/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}`
                }
            });
        }
        catch (error) {
            console.error(error);
            const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
            const dateStringCreated = TIME.getFullDateStringFromUnix(TIME.getUnixTime());
            const dateStringEdited = TIME.getFullDateStringFromUnix(TIME.getUnixTime());
            return res.status(200).render(view, {
                ...requiredVariables,
                pageObj: {
                    title: 'Something Went Wrong',
                    description: 'Something went wrong loading the page. Try reloading the page.',
                    dateStringCreated,
                    dateStringEdited,
                    innerHTML: (0, html_1.getErrorAlert)('Invalid article ID. Try reloading the page')
                }
            });
        }
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/admin/diary', 404, { severity: 'error', message: 'Diary entry not found.' });
    }
}
exports.getDiary = getDiary;
async function getEditDiary(req, res) {
    var _a;
    const view = 'pages/admin/admin-edit-diary';
    const { id: idString } = req.params;
    const id = parseInt(idString);
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Admin Home', item: '/admin', position: 2 },
        { name: 'Admin Diaries', item: '/admin/diary', position: 3 }
    ];
    const SEO = {
        breadcrumbs: breadcrumbs,
        keywords: [],
        title: '',
        description: '',
        tableOfContents: [],
        path: '',
        noIndex: true
    };
    if (NUMBER.isValidInteger(id)) {
        try {
            const obj = await getDiaryOrArticle('diary', (0, exports.getDevice)(req.session.device), id, { active_v: true, v: 1 });
            SEO.title = 'Edit ' + obj.title;
            SEO.description = 'Edit the article described by ' + obj.description;
            SEO.breadcrumbs.push({ name: SEO.title, item: `/admin/${obj.id}/${encodeURIComponent(obj.title || 'Placeholder Title')}`, position: 4 });
            const form = ARTICLE_HELPER.getArticleForm(req, { innerHTML: obj.html, id, title: obj.title, description: obj.description, image: obj.image, versions: [1], type: 'diary', desktop: Boolean((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) });
            const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
            return res.status(200).render(view, {
                ...requiredVariables,
                layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
                pageObj: {
                    innerHTML: form
                }
            });
        }
        catch (error) {
            console.error(error);
            const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
            return res.status(200).render(view, {
                ...requiredVariables,
                layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
                pageObj: {
                    innerHTML: (0, html_1.getErrorAlert)('Something went wrong getting the diary to edit. try reloading the page.')
                }
            });
        }
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/admin', 301, { severity: 'error', message: 'Diary entry not found.' });
    }
}
exports.getEditDiary = getEditDiary;
async function saveDiary(req, res) {
    const { id: idString } = req.params;
    const device = (0, exports.getDevice)(req.session.device);
    const id = parseInt(idString);
    try {
        if (NUMBER.isValidInteger(id)) {
            const parsedBody = await parsePostArticle(req.body);
            const obj = await createOrUpdateDiaryOrArticle('diary', parsedBody, { id, version: { active_v: true, v: 1 } }, true);
            const parsedResults = await getDiaryOrArticle('diary', device, id, { v: 1 });
            if (req.session.diary && req.session.diary.todayID === id) {
                req.session.diary.todayState = parsedResults;
            }
            await req.cache.del(`frankmbrown-diary-all-prev`);
            return res.status(200).send((0, html_1.getSuccessSnackbar)('Successfully updated diary.'));
        }
        else
            throw new Error('Invalid diary id.');
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Failed to update diary.'));
    }
}
exports.saveDiary = saveDiary;
/**
 * ```sql
 * CREATE TABLE diary_search (
    disary_search_id serial PRIMARY KEY,
    diary_id integer REFERENCES diary(id),
    diary_title TEXT,
    diary_description TEXT,
    diary_document TEXT NOT NULL,
    search tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english',coalesce(diary_title,'')),'A') ||
        setweight(to_tsvector('english',coalesce(diary_description,'')),'B') ||
        setweight(to_tsvector('english',coalesce(diary_document,'')),'C')
    ) STORED,
    embedding vector (1536) NOT NULL,
  date_created bigint NOT NULL
);
```
 * @param req
 * @param res
 * @returns
 */
async function searchAdminDiary(req, res) {
    try {
        const search_term = String(req.query['search-diary']);
        if (!!!search_term.length) {
            return res.status(200).send((0, html_1.getErrorAlert)("Text search must be at least one character long."));
        }
        const defaultSearchType = req.query['default'];
        const embeddingSearchType = req.query['embedding-search-type'];
        const textMatchSearchType = req.query['text-match-search-type'];
        var rows;
        if (embeddingSearchType === "on") {
            var embedding;
            if (req.session.cachedEmbeddingString === search_term && req.session.cachedEmbedding) {
                embedding = req.session.cachedEmbedding;
            }
            else {
                embedding = await (0, ai_1.createEmbedding)(search_term, 'text-embedding-ada-002');
                req.session.cachedEmbedding = embedding;
                req.session.cachedEmbeddingString = search_term;
            }
            const query = `SELECT diary.id id, diary.title title, diary.image image, diary.start_of_day start_of_day, diary.last_edited last_edited 
      FROM diary JOIN diary_search ON diary.id=diary_search.diary_id 
      ORDER BY embedding <-> $1 DESC
      LIMIT 100;`;
            const dbRes = await (0, database_1.default)().query(query, [pgvector_1.default.toSql(embedding)]);
            rows = dbRes.rows;
        }
        else if (textMatchSearchType === "on") {
            const query = `SELECT diary.id id, diary.title title, diary.image image, diary.start_of_day start_of_day, diary.last_edited last_edited, similarity($1,diary_search.document) 
      FROM diary JOIN diary_search ON diary.id=diary_search.diary_id 
      ORDER BY rank DESC
      LIMIT 100;`;
            const dbRes = await (0, database_1.default)().query(query, [search_term]);
            rows = dbRes.rows;
        }
        else {
            const query = `SELECT diary.id id, diary.title title, diary.image image, diary.start_of_day start_of_day, diary.last_edited last_edited, ts_rank(search, websearch_to_tsquery('english',$1)) rank 
      FROM diary JOIN diary_search ON diary.id=diary_search.diary_id 
      WHERE diary_search.search @@ websearch_to_tsquery('english',$1)
      ORDER BY rank DESC
      LIMIT 100;`;
            const dbRes = await (0, database_1.default)().query(query, [search_term]);
            rows = dbRes.rows;
        }
        if (!!!rows.length) {
            return res.status(200).send((0, html_1.getWarningAlert)("There are no search results!"));
        }
        var str = rows.map((obj) => {
            return ARTICLE_HELPER.renderDiaryPreview({
                date_created: Number(obj.start_of_day),
                last_edited: Number(obj.last_edited),
                title: obj.title.length ? obj.title : 'Not Yet Started',
                description: obj.description || '',
                type: 'diary',
                image: obj.image ? obj.image : undefined,
                id: obj.id,
                admin: true,
            }, req);
        }).join('');
        return res.status(200).send(str);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong searching the admin diary!"));
    }
}
exports.searchAdminDiary = searchAdminDiary;
async function updateSearchAdminDiary(req, res) {
    try {
        const query = `WITH havent_searched AS (
	SELECT diary.id id 
	FROM diary 
	EXCEPT 
	SELECT DISTINCT diary_search.diary_id id FROM diary_search
), update_search AS (
	SELECT diary.id id FROM diary 
	JOIN diary_search 
	ON diary.id=diary_search.diary_id
	WHERE diary.last_edited > diary_search.date_created
) SELECT id FROM havent_searched UNION SELECT id FROM update_search ORDER BY id ASC;`;
        const dbRes = await (0, database_1.default)().query(query);
        const ids = dbRes.rows.map((obj) => obj.id);
        const deletePromiseArr = [];
        for (let i = 0; i < ids.length; i++) {
            deletePromiseArr.push((0, database_1.default)().query(`DELETE FROM diary_search WHERE diary_id=$1;`, [ids[i]]));
        }
        await Promise.all(deletePromiseArr);
        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const diary = await (0, database_1.default)().query(`SELECT diary.id id, diary.title title, diary.description description, article.desktop_html html FROM diary 
JOIN article ON diary.id=article.diary_id WHERE diary.id=$1;`, [id]);
            const row = diary.rows[0];
            const dom = new jsdom_1.default.JSDOM(row.html);
            var text = row.title + row.description;
            const innerText = dom.window.document.body.textContent;
            if (innerText) {
                text += row.innerText;
            }
            const date_created = TIME.getUnixTime();
            var inputs = [];
            var curr = 0;
            while (curr < text.length) {
                inputs.push(text.slice(curr, curr + 4000));
                curr += 4000;
            }
            const promiseArr = [];
            for (let i = 0; i < inputs.length; i++) {
                promiseArr.push((0, ai_1.createEmbedding)(inputs[i], 'text-embedding-ada-002'));
            }
            const embeddings = await Promise.all(promiseArr);
            const promiseArr2 = [];
            const db = (0, database_1.default)();
            for (let i = 0; i < inputs.length; i++) {
                promiseArr2.push(db.query(`INSERT INTO diary_search (diary_id, diary_title, diary_description, diary_document, embedding, date_created) VALUES ($1,$2,$3,$4,$5,$6);`, [row.id, row.title, row.description, inputs[i], pgvector_1.default.toSql(embeddings[i]), date_created]));
            }
        }
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully updated diary search!"));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong updating the admin diary search!"));
    }
}
exports.updateSearchAdminDiary = updateSearchAdminDiary;
/* ------------------------- Articles (Blogs, Notes, and Ideas) ----------------------------------- */
/*
frankmbrown-blog-all-prev: result of select * FROM idea (basically)
  - We use a function to get the previews from this result
  - Filter for !!!active_v when showing user idea/blog/note
frankmbrown-blog-${id}-${v}
frankmbrown-blog-${id}-active


frankmbrown-note-all-prev:  result of select * FROM idea (basically)
  - We use a function to get the previews from this result
  - Filter for !!!active_v when showing user idea/blog/note
frankmbrown-note-${id}-${v}
frankmbrown-note-${id}-active

frankmbrown-idea-all-prev: result of select * FROM idea (basically)
  - We use a function to get the previews from this result
  - Filter for !!!active_v when showing user idea/blog/note
frankmbrown-idea-${id}-${v}
frankmbrown-idea-${id}-active

*/
const parseArticleURL = (req) => {
    const { id: idStr } = req.params;
    const id = parseInt(idStr);
    const { active_v: activeV } = req.query;
    const active_vPre = parseInt(String(activeV));
    const active_v = NUMBER.isValidInteger(active_vPre) ? active_vPre : undefined;
    const a = new URL(`https://frankmbrown.net${req.url}`);
    const urlArr = a.pathname.split('/').slice(req.url.startsWith('/') ? 1 : 0);
    const isAdmin = Boolean(urlArr[0] === 'admin');
    const type = (isAdmin ? urlArr[1] : urlArr[0]);
    var currInd = isAdmin ? 2 : 1;
    var isEdit = false;
    if (type === 'blog' || type === 'note' || type === 'idea') {
        if (urlArr[currInd] === 'edit') {
            isEdit = true;
            currInd += 1;
        }
        else {
            isEdit = false;
        }
        const ret = {
            type,
            isEdit,
            isAdmin,
            id,
            active_v
        };
        return ret;
    }
    else {
        throw new Error(`Type in url ${req.url} should be blog or note or idea.`);
    }
};
const ADMIN_POST_PREVIEWS_OBJ = {
    'blog': {
        queryStr: /*sql*/ `SELECT * FROM blog ORDER BY last_edited DESC, active_v NULLS FIRST`,
        cache: 'frankmbrown-blog-all-prev'
    },
    'note': {
        queryStr: /*sql*/ `SELECT * FROM note ORDER BY last_edited DESC, active_v NULLS FIRST`,
        cache: 'frankmbrown-note-all-prev'
    },
    'idea': {
        queryStr: /*sql*/ `SELECT * FROM idea ORDER BY last_edited DESC, active_v NULLS FIRST`,
        cache: 'frankmbrown-idea-all-prev'
    }
};
async function getArticlePostsPreviews(req, type, admin) {
    var _a;
    const { queryStr } = ADMIN_POST_PREVIEWS_OBJ[type];
    try {
        const timezone = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const db = (0, database_1.default)();
        const queryResult = await db.query(queryStr, []);
        const rows = queryResult.rows;
        const arr1 = rows.map((row) => ({ str: ARTICLE_HELPER.renderArticlePreview({ ...row, admin, type }, req), monthYear: TIME.getMonthYearFromUnix(row.last_edited, timezone) }));
        const ret = ARTICLE_HELPER.renderArticlesMonthYears(arr1);
        return ret;
    }
    catch (error) {
        console.error(error);
        throw new Error(`Unable to get ${type} posts previews.`);
    }
}
exports.getArticlePostsPreviews = getArticlePostsPreviews;
const PREVIEW_OBJ = {
    'blog': {
        view: 'pages/blogs',
        SEO: {
            breadcrumbs: [
                { position: 1, name: 'Home', item: '/' },
                { position: 2, name: 'Blog', item: '/blog' },
            ],
            keywords: ['Blog'],
            title: 'Frank\'s Blogs',
            description: 'View frankmbrown\'s blog posts. I\'m not sure what I\'m going to write about yet, ',
            path: '/blog',
            tableOfContents: [
                { id: 'about', text: 'About the Blog' }
            ],
            noIndex: false
        },
    },
    'note': {
        view: 'pages/notes',
        SEO: {
            breadcrumbs: [
                { position: 1, name: 'Home', item: '/' },
                { position: 2, name: 'Note', item: '/note' },
            ],
            keywords: ['Note'],
            title: 'Frank\'s Notes',
            description: 'View frankmbrown\'s note posts. I\'m not sure what I\'m going to write about yet, ',
            path: '/note',
            tableOfContents: [
                { id: 'about', text: 'About the Notes' }, { id: "blogs", text: "Blogs" }
            ],
            noIndex: false
        }
    },
    'idea': {
        view: 'pages/ideas',
        SEO: {
            breadcrumbs: [
                { position: 1, name: 'Home', item: '/' },
                { position: 2, name: 'Idea', item: '/idea' },
            ],
            keywords: ['Ideas'],
            title: 'Frank\'s Ideas',
            description: 'View frankmbrown\'s idea posts. I\'m not sure what I\'m going to write about yet, ',
            path: '/idea',
            tableOfContents: [
                { id: 'about', text: 'About the Ideas' }, { id: "ideas", text: "Ideas" }
            ],
            noIndex: false
        },
    }
};
async function getArticlePreviews(req, res) {
    const type = req.path.slice(1);
    if (type !== 'blog' && type !== 'idea' && type !== 'note') {
        return (0, redirect_override_1.redirect)(req, res, '/', 401, { severity: 'warning', message: 'Something went wrong getting the article. Try reloading the page.' });
    }
    const obj = PREVIEW_OBJ[type];
    const view = obj.view;
    const SEO = obj.SEO;
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat([{ text: `Search ${type}`, id: `search_instances` }]);
    try {
        const order_by = (0, handleArticlePreview_1.getOrderBy)(req);
        const previews = await (0, handleArticlePreview_1.GET_ARTICLE_PREVIEWS)(type.concat('_id'), order_by.order_by_value, req);
        if ((0, handleArticlePreview_1.isReOrderRequest)(req)) {
            return res.status(200).send(previews.str.concat((0, handleArticlePreview_1.updateTocOnReOrderScript)(req)));
        }
        requiredVariables.tableOfContents.push(...previews.toc);
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            previews: previews.str,
            order_by
        });
    }
    catch (error) {
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            previews: (0, html_1.getErrorAlert)(`Unable to get previews for ${type}. Try reloading the page.`),
            order_by: {
                order_by_value: "last-edit-new",
                order_by_str: "Last Edited (New)"
            }
        });
    }
}
exports.getArticlePreviews = getArticlePreviews;
async function searchNotes(req, res) {
    try {
        var type = '';
        const admin = req.path.includes('/admin');
        type = req.path.replace('/admin', '');
        type = type.slice(1).replace('/search', '');
        const search_term = req.query['search-notes-title'];
        if (!!!search_term) {
            return res.status(200).send((0, html_1.getWarningAlert)('Please enter a title to search for.'));
        }
        if (type !== 'blog' && type !== 'idea' && type !== 'note') {
            return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong with the search."));
        }
        const query = `SELECT * FROM ${type} WHERE lower(title) LIKE '%' || lower($1) || '%' ORDER BY similarity(lower($1),lower(title)) DESC;`;
        const dbRes = await (0, database_1.default)().query(query, [search_term]);
        const rows = dbRes.rows;
        if (!!!rows.length) {
            return res.status(200).send((0, html_1.getWarningAlert)('There were no notes that matched the search.'));
        }
        const str = rows.map((row) => ARTICLE_HELPER.renderArticlePreview({ ...row, admin, type }, req)).join('');
        return res.status(200).send(str);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong with the search..."));
    }
}
exports.searchNotes = searchNotes;
async function getAdminPageArticlePost(req, res) {
    const view = 'pages/admin/admin-edit-article';
    try {
        const device = (0, exports.getDevice)(req.session.device);
        const { active_v: activeV } = req.query;
        const v = parseInt(String(activeV));
        const { type, isEdit, isAdmin, id } = parseArticleURL(req);
        const changeArticleVersionStr = req.get('hx-target');
        if (changeArticleVersionStr === "#create-article-wrapper" || changeArticleVersionStr === "create-article-wrapper") {
            if (!!!NUMBER.isValidInteger(v) || !!!NUMBER.isValidInteger(id) || (type !== 'blog' && type !== 'idea' && type !== 'note')) {
                throw new Error(`The article type, id, and version must be included when changing the article version. Current Values: ${type}, ${id}, ${v}`);
            }
            const article = await getDiaryOrArticle(type, device, id, { v: v });
            const form = ARTICLE_HELPER.getArticleForm(req, {
                innerHTML: article.html,
                id,
                title: article.title,
                description: article.description,
                image: article.image,
                current_v: v,
                versions: article.versions,
                type,
                desktop: Boolean(device === "desktop")
            });
            return res.status(200).send(form);
        }
        if (!!!id)
            throw new Error('ID should be set here.');
        if (isEdit) {
            var parsedArticle;
            if (v) {
                const parsedArticleCache = await req.cache.get(`frankmbrown-${type}-${id}-${v}`);
                if (parsedArticleCache)
                    parsedArticle = JSON.parse(parsedArticleCache);
                else {
                    parsedArticle = await getDiaryOrArticle(type, device, id, { v: v });
                    if (!!!(new Set(parsedArticle.versions)).has(v)) {
                        req.session.snackbarMessage = {
                            showMessage: true,
                            message: (0, html_1.getWarningSnackbar)(`A ${type} post with this version number does not exist.`)
                        };
                        var navigateTo = ``;
                        if (parsedArticle.versions.length) {
                            navigateTo = `/admin/${type}/edit/${id}/${encodeURIComponent(parsedArticle.title || 'Placeholder Title')}?active_v=${parsedArticle.versions[parsedArticle.versions.length - 1]}`;
                            return (0, redirect_override_1.redirect)(req, res, navigateTo, 302);
                        }
                        else {
                            navigateTo = `/admin/${type}`;
                            return (0, redirect_override_1.redirect)(req, res, navigateTo, 302);
                        }
                    }
                }
            }
            else {
                parsedArticle = await getDiaryOrArticle(type, device, id, { active_v: true, v: 1 });
            }
            if (!!!parsedArticle) {
                return (0, redirect_override_1.redirect)(req, res, `/admin/${type}`, 401, { severity: 'error', message: `A ${type} post with this id does not exist.` });
            }
            const tableOfContents = parsedArticle.table_of_contents;
            var editArticleForm = '';
            const articleEdit = {
                innerHTML: parsedArticle.html,
                id,
                title: parsedArticle.title,
                description: parsedArticle.description,
                image: parsedArticle.image,
                current_v: v,
                versions: parsedArticle.versions,
                type,
                desktop: Boolean(device === "desktop")
            };
            if (v)
                editArticleForm = ARTICLE_HELPER.getArticleForm(req, articleEdit);
            else {
                articleEdit.current_v = parsedArticle.active_v || 1;
                editArticleForm = ARTICLE_HELPER.getArticleForm(req, articleEdit);
            }
            const path = `/admin/${type}/edit/${id}/${encodeURIComponent(parsedArticle.title || 'Placeholder Title')}?active_v=${v ? v : parsedArticle.active_v ? parsedArticle.active_v : parsedArticle.highest_v}`;
            var thirdBreadcrumb;
            var pageTitle;
            if (type === "blog") {
                thirdBreadcrumb = { name: 'Admin Blogs', item: '/admin/blog', position: 3 };
                pageTitle = 'Edit Blog Post';
            }
            else if (type === "note") {
                thirdBreadcrumb = { name: 'Admin Notes', item: '/admin/note', position: 3 };
                pageTitle = 'Edit Note Post';
            }
            else {
                thirdBreadcrumb = { name: 'Admin Ideas', item: '/admin/idea', position: 3 };
                pageTitle = 'Edit Idea Post';
            }
            const SEO = {
                title: parsedArticle.title,
                breadcrumbs: [
                    { name: 'Home', item: '/', position: 1 },
                    { name: 'Admin Home', item: '/admin', position: 2 },
                    thirdBreadcrumb,
                    { name: parsedArticle.title, item: path, position: 4 },
                ],
                keywords: parsedArticle.description.split(' '),
                description: parsedArticle.description,
                path: path,
                tableOfContents,
                noIndex: true
            };
            const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
            return res.status(200).render(view, {
                ...requiredVariables,
                layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
                pageObj: {
                    title: pageTitle,
                    innerHTML: editArticleForm
                }
            });
        }
        else
            return getArticle(req, res);
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/admin', 401, { severity: 'warning', message: 'Something went wrong getting the article. Try reloading the page.' });
    }
}
exports.getAdminPageArticlePost = getAdminPageArticlePost;
async function postEditOrCreateArticle(req, res) {
    var _a;
    try {
        const { type, isEdit, isAdmin, active_v, id } = parseArticleURL(req);
        if (id && !!!NUMBER.isValidInteger(id))
            throw new Error(`If there is an id, then the id should be valid. If there is not an id, then a new ${type} will be created. Submitted id: ${id}.`);
        const body = req.body;
        const device = (0, exports.getDevice)(req.session.device);
        const parsedArticle = await parsePostArticle(body);
        const image = parsedArticle.image;
        if (!!!id) {
            await (0, projects_1.uploadPageImageFromUrl)(req, image);
        }
        else if (id) {
            const current_image_url = (_a = (await (0, database_1.default)().query(`SELECT image FROM ${type} WHERE id=$1;`, [id])).rows) === null || _a === void 0 ? void 0 : _a[0].image;
            if (current_image_url && current_image_url !== image) {
                await (0, projects_1.uploadPageImageFromUrl)(req, image);
            }
        }
        const obj = await createOrUpdateDiaryOrArticle(type, parsedArticle, { id, version: { v: Number(active_v), active_v: !!!active_v } }, Boolean(parsedArticle.submitType === "publish"));
        if (obj === null || obj === void 0 ? void 0 : obj.clearCache) {
            if (obj.id) {
                await req.cache.del(`frankmbrown-${type}-${obj.id}-tablet-active`);
                await req.cache.del(`frankmbrown-${type}-${obj.id}-desktop-active`);
                await req.cache.del(`frankmbrown-${type}-${obj.id}-mobile-active`);
            }
            await req.cache.del(`frankmbrown-${type}-all-prev`);
        }
        const parsedResults = await getDiaryOrArticle(type, device, obj && obj.id ? obj.id : id, { v: (obj && obj.id) ? 1 : Number(active_v), active_v: !!!active_v && !!!(obj && obj.id) });
        if (!!!id) {
            return res.status(200).send(
            /*html*/ `<div hx-trigger="load" hx-get="${`/admin/${type}/edit/${parsedResults.id}/${encodeURIComponent(parsedResults.title || 'Placeholder Title')}?active_v=${1}`}" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-push-url="true"></div>`);
        }
        return res.status(200).send((0, html_1.getSuccessSnackbar)(`Successfully updated ${type} post!`));
    }
    catch (error) {
        console.error(error);
        try {
            return res.status(401).send((0, html_1.getErrorSnackbar)(typeof error === "object" ? 'There was an error posting the article.' : String(error)));
        }
        catch (error) {
            console.error(error);
            return res.status(401).send((0, html_1.getErrorSnackbar)("Something went wrong submitting the article."));
        }
    }
}
exports.postEditOrCreateArticle = postEditOrCreateArticle;
async function addArticleVersion(req, res) {
    try {
        const { id: idStr } = req.params;
        const id = parseInt(idStr);
        const { active_v: activeVString } = req.query;
        const active_v = parseInt(String(activeVString));
        const type = req.url.split('/')[2];
        const device = (0, exports.getDevice)(req.session.device);
        if (!!!NUMBER.isValidInteger(active_v) || !!!NUMBER.isValidInteger(id) || (type !== 'blog' && type !== 'idea' && type !== 'note')) {
            throw new Error(`When adding an article version, the id active_v and type must exist in the request. Current Values: ${active_v}, ${id}, and ${type}.`);
        }
        const db = (0, database_1.default)();
        const connection = await db.connect();
        try {
            await connection.query('BEGIN;');
            const res1 = await connection.query(`UPDATE ${type} SET versions=array_append(versions,highest_v+1), highest_v=highest_v+1 WHERE id=$1 RETURNING *;`, [id]);
            if (!!!res1.rows.length)
                throw new Error('UNABLE to add version due to updating main table.');
            const { highest_v } = res1.rows[0];
            const res2 = await connection.query(`SELECT page, diary_id, blog_id, note_id, idea_id, lexical_state, mobile_html, tablet_html, desktop_html FROM article WHERE ${type}_id=$1 AND v=$2 AND deprecated_time IS NULL;`, [id, active_v]);
            if (!!!res2.rows.length)
                throw new Error('UNABLE to add version due to getting copy article infomation.');
            const { lexical_state, mobile_html, tablet_html, desktop_html } = res2.rows[0];
            const query3 = `INSERT INTO article (v,page,diary_id,blog_id,idea_id,note_id,lexical_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`;
            const arr3 = [highest_v, 1];
            if (type === "blog") {
                arr3.push(null, id, null, null);
            }
            else if (type === "idea") {
                arr3.push(null, null, id, null);
            }
            else if (type === "note") {
                arr3.push(null, null, null, id);
            }
            arr3.push(lexical_state, desktop_html, tablet_html, mobile_html);
            const res3 = await connection.query(query3, arr3);
            if (!!!res3.rows.length)
                throw new Error('UNABLE to add version due to inserting new article.');
            await connection.query('COMMIT;');
            connection.release();
            const parsedResults = await getDiaryOrArticle(type, device, id, { v: highest_v });
            return res.status(200).send(/*html*/ `<div
      hx-trigger="load"
      hx-get="/admin/${type}/edit/${id}/${encodeURIComponent(parsedResults.title)}?active_v=${highest_v}"
      hx-target="#PAGE"
      hx-indicator="#page-transition-progress"
      hx-push-url="true"
      ></div>`);
        }
        catch (error) {
            await connection.query('ROLLBACK;');
            connection.release();
            console.error(error);
            throw new Error('Unable to add new article version.');
        }
    }
    catch (error) {
        console.error(error);
        return res.status(401).send('Something went wrong trying to add another version for the article.');
    }
}
exports.addArticleVersion = addArticleVersion;
/**
 * active_v should only exist on articles that you want to delete completely
 * @param req
 * @param res
 */
async function deleteArticleOrArticleVersion(req, res) {
    try {
        const db = (0, database_1.default)();
        const { type, isEdit, isAdmin, active_v, id } = parseArticleURL(req);
        const { title } = req.params;
        const connection = await (0, database_1.default)().connect();
        try {
            await connection.query('BEGIN;');
            if (active_v) {
                await connection.query(`DELETE FROM article WHERE ${type}_id=$1 AND v=$2;`, [id, active_v]);
                const res1 = await connection.query(`SELECT title, versions, active_v FROM ${type} WHERE id=$1;`, [id]);
                if (!!!res1.rows.length)
                    throw new Error('Unable to get main table information for deleting article version.');
                const { title, versions, active_v: currentActiveV } = res1.rows[0];
                const newVersions = versions.filter((v) => v !== active_v);
                const highest_v = newVersions[newVersions.length - 1];
                if (currentActiveV === active_v) {
                    await connection.query(`UPDATE ${type} SET versions=$1,active_v=NULL,highest_v=$3 WHERE id=$2;`, [newVersions, id, highest_v]);
                    await req.cache.del(`frankmbrown-${type}-${id}-tablet-active`);
                    await req.cache.del(`frankmbrown-${type}-${id}-desktop-active`);
                    await req.cache.del(`frankmbrown-${type}-${id}-mobile-active`);
                }
                else {
                    await connection.query(`UPDATE ${type} SET versions=$1,highest_v=$3 WHERE id=$2;`, [newVersions, id, highest_v]);
                }
                await req.cache.del(`frankmbrown-${type}-all-prev`);
                await connection.query('COMMIT;');
                connection.release();
                return res.status(200).send(/*html*/ `<div
        hx-target="#PAGE"
        hx-get="/admin/${type}/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}?active_v=${highest_v}"
        hx-indicator="#page-transition-progress"
        hx-trigger="load"
        hx-push-url="true"
        ></div>`);
            }
            else {
                await connection.query(`DELETE FROM ${type} WHERE id=$1;`, [id]);
                await connection.query('COMMIT;');
                connection.release();
                await req.cache.del(`frankmbrown-${type}-all-prev`);
                await req.cache.del(`frankmbrown-${type}-${id}-tablet-active`);
                await req.cache.del(`frankmbrown-${type}-${id}-desktop-active`);
                await req.cache.del(`frankmbrown-${type}-${id}-mobile-active`);
                return res.status(200).send(/*html*/ `<div
        hx-target="#PAGE"
        hx-get="/admin/${type}"
        hx-indicator="#page-transition-progress"
        hx-trigger="load"
        hx-push-url="true"
        ></div>`);
            }
        }
        catch (error) {
            console.error(error);
            await connection.query('ROLLBACK');
            connection.release();
        }
        throw new Error('Something went wrong deleting article version.');
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong. Try reloading the page.'));
    }
}
exports.deleteArticleOrArticleVersion = deleteArticleOrArticleVersion;
const AdminArticle = {
    'blog': {
        SEO: {
            breadcrumbs: [
                { name: 'Home', item: '/', position: 1 },
                { name: 'Admin Home', item: '/admin', position: 2 },
                { name: 'Admin Blog', item: '/admin/blog', position: 3 }
            ],
            title: 'Admin Blog Page',
            keywords: ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Blog Page"],
            description: 'Add, edit or delete blog posts from the website.',
            tableOfContents: [
                { id: "create-article-wrapper", text: "Create or Edit Blog" },
                { id: "article-take-actions", text: "Take Blog Actions" }
            ],
            noIndex: true,
            path: 'admin/blog'
        },
        pageObj: {
            title: 'Admin Blog Page',
            edit: 'Edit Blogs',
            searchLabel: 'Search for Blogs To Edit',
            searchPlaceholder: 'Enter the name of the blog post or describe content in the blog posts...',
            createNew: 'Create New Blog:',
            type: 'blog',
        }
    },
    'note': {
        SEO: {
            breadcrumbs: [
                { name: 'Home', item: '/', position: 1 },
                { name: 'Admin Home', item: '/admin', position: 2 },
                { name: 'Admin Note', item: '/admin/note', position: 3 }
            ],
            title: 'Admin Note Page',
            keywords: ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Note Page"],
            description: 'Add, edit or delete blog notes from the website.',
            tableOfContents: [
                { id: "create-article-wrapper", text: "Create or Edit Note" },
                { id: "article-take-actions", text: "Take Note Actions" }
            ],
            noIndex: true,
            path: 'admin/note'
        },
        pageObj: {
            title: 'Admin Note Page',
            edit: 'Edit Notes',
            searchLabel: 'Search for Notes To Edit',
            searchPlaceholder: 'Enter the name of the note or describe content in the note...',
            createNew: 'Create New Note:',
            type: 'note',
        }
    },
    'idea': {
        SEO: {
            breadcrumbs: [
                { name: 'Home', item: '/', position: 1 },
                { name: 'Admin Home', item: '/admin', position: 2 },
                { name: 'Admin Idea', item: '/admin/idea', position: 3 }
            ],
            title: 'Admin Idea Page',
            keywords: ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Idea Page"],
            description: 'Add, edit or delete idea posts from the website.',
            tableOfContents: [
                { id: "create-article-wrapper", text: "Edit Idea" },
                { id: "article-take-actions", text: "Take Idea Actions" }
            ],
            noIndex: true,
            path: 'admin/idea'
        },
        pageObj: {
            title: 'Admin Idea Page',
            edit: 'Edit Idea',
            searchLabel: 'Search for Ideas To Edit',
            searchPlaceholder: 'Enter the name of the idea post or describe content in the idea posts...',
            createNew: 'Create New Idea:',
            type: 'idea',
        }
    }
};
async function getAdminPageArticle(req, res) {
    try {
        const { type, isEdit, isAdmin, active_v: v, id } = parseArticleURL(req);
        const device = (0, exports.getDevice)(req.session.device);
        const ForPage = AdminArticle[type];
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, ForPage.SEO);
        const DEFAULT_HTML = '<p class="lex-p ltr" data-v="1" dir="ltr" style="text-align: left; margin: 6px 0px 0px; padding: 0px !important;"><span data-v="1" data-frank-text="true">Insert the body of the article here...</span></p>';
        const createPost = ARTICLE_HELPER.getArticleForm(req, {
            innerHTML: DEFAULT_HTML,
            title: '',
            description: '',
            image: null,
            type,
            versions: [],
            desktop: device === "desktop"
        });
        var articlePostsPreview = /*html*/ `<p class="t-warning bold h6 mt-2 text-align-center">There are no ${type[0].toUpperCase().concat(type.slice(1))} Posts to show.</p>`;
        requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat([{ text: "Search", id: "search-notes-body" }]);
        try {
            const temp = await getArticlePostsPreviews(req, type, true);
            if (temp.tableOfContents.length) {
                articlePostsPreview = temp.str;
                requiredVariables.tableOfContents = structuredClone(requiredVariables.tableOfContents).concat(temp.tableOfContents);
            }
        }
        catch (error) {
            console.error(error);
        }
        return res.status(200).render('pages/admin/admin-article', {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                ...ForPage.pageObj,
                articlePostsPreview,
                createPost
            },
        });
    }
    catch (error) {
        console.error(error);
        return (0, redirect_override_1.redirect)(req, res, '/admin', 401, { severity: 'warning', message: 'Something went wrong getting the article. Try reloading the page.' });
    }
}
exports.getAdminPageArticle = getAdminPageArticle;
async function getArticle(req, res) {
    const { id: idStr, title } = req.params;
    const view = 'pages/posts/article';
    const device = (0, exports.getDevice)(req.session.device);
    const id = parseInt(idStr);
    const type = req.url.split('/')[1];
    if (!!!NUMBER.isValidInteger(id) || (type !== 'blog' && type !== 'note' && type !== 'idea')) {
        return (0, redirect_override_1.redirect)(req, res, '/', 200, { severity: 'warning', message: 'This article does not exist' });
    }
    var articleBody = '';
    var trueTitle = '';
    var trueDescription = '';
    var lastEditedTime = '';
    var dateCreatedTime = '';
    var keywords = [];
    var tableOfContents = [];
    var pageImage = null;
    var path = '';
    var like_url = `/like/${type}/${parseInt(idStr)}/${encodeURIComponent(title)}`;
    var has_liked = false;
    var like_count = 'N/A';
    var view_count = 'N/A';
    try {
        const comment_required_variables = (0, handleArticleData_1.getCommentsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingCommentsRequest)(req)) {
            return (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables);
        }
        const annotation_required_variables = (0, handleArticleData_1.getAnnotationsRequiredVariables)(req);
        if ((0, handleArticleData_1.gettingAnnotationsRequest)(req)) {
            return (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables);
        }
        const [articleFromDB, comments_str, annotation_resp] = await Promise.all([(0, handleArticleData_1.getArticleAndLikesAndViews)(req, type, id), (0, handleArticleData_1.getArticleComments)(req, res, comment_required_variables), (0, handleArticleData_1.getArticleAnnotations)(req, res, annotation_required_variables)]);
        var annotation_main_str = '';
        var annotation_search_str = '';
        if (Array.isArray(annotation_resp)) {
            annotation_main_str = annotation_resp[0];
            annotation_search_str = annotation_resp[1];
        }
        await req.cache.set(`frankmbrown-${type}-${id}-${device}-active`, JSON.stringify(articleFromDB));
        articleBody = (0, exports.getArticleInnerHTML)(articleFromDB.html, articleFromDB.lexical_id);
        lastEditedTime = TIME.getFullDateStringFromUnix(Number(articleFromDB.last_edited));
        dateCreatedTime = TIME.getFullDateStringFromUnix(articleFromDB.date_created || articleFromDB.start_of_day);
        trueTitle = articleFromDB.title;
        trueDescription = articleFromDB.description;
        keywords = articleFromDB.description.split(' ');
        path = `/${type}/${articleFromDB.id}/${encodeURIComponent(articleFromDB.title)}`;
        tableOfContents = articleFromDB.table_of_contents;
        tableOfContents.push({ id: 'comments', text: 'Comments' });
        pageImage = articleFromDB.image;
        has_liked = articleFromDB.has_liked;
        like_count = articleFromDB.likes.toString();
        view_count = articleFromDB.views.toString();
        const breadcrumbs = structuredClone(PREVIEW_OBJ[type].SEO.breadcrumbs);
        breadcrumbs.push({ name: trueTitle, item: path, position: 3 });
        const SEO = { breadcrumbs, keywords, title: trueTitle, description: trueDescription, path, tableOfContents, noIndex: false, image: pageImage ? pageImage : undefined };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true });
        return res.status(200).render(view, {
            layout: !!!requiredVariables.fullPageRequest ? false : 'layout',
            ...requiredVariables,
            pageObj: {
                dateCreated: dateCreatedTime,
                lastEdited: lastEditedTime,
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
    catch (error) {
        console.error(error);
        const type = req.url.split('/')[1];
        return (0, redirect_override_1.redirect)(req, res, `/${type}`, 400, { severity: "error", message: "Something went wrong getting the article." });
    }
}
exports.getArticle = getArticle;
/* ------------------------------------------------ Handle S3 Media ----------------------- */
function renderS3Images(images, IsTruncated, NextContinuationToken, type = 'frankmbrown') {
    var str = '';
    images.forEach((obj) => {
        str += /*html*/ `<div style="position: relative; display: flex;">
      <button hx-trigger="click" hx-target="closest div" hx-swap="outerHTML" hx-delete="/admin/view-images/${obj.key}" class="icon small filled error" style="position: absolute; top: 0px; right: 0px; z-index: 3;">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
    </button>
    <img src="${(0, escape_html_1.default)(obj.url)}" alt="${obj.key}" width="100" height="100" style="width: 100px; height: 100px; display: inline-block;" >
  </div>`;
    });
    if (IsTruncated) {
        str += /*html*/ `
    <div class="text-align-center block w-100">
    <button type="button" style="margin: 0px auto;" class="icon-text medium filled info" hx-get="/admin/view-images/${encodeURIComponent(String(NextContinuationToken))}/${type}" hx-target="closest div" hx-swap="outerHTML" hx-trigger="click">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Download"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path></svg>
      LOAD MORE
      </button>
    </div>`;
    }
    return str;
}
function renderS3Audio(audios, IsTruncated, NextContinuationToken, desktop) {
    var str = '';
    audios.filter((obj) => Boolean(!!!obj.key.endsWith('.aac.mp4') &&
        !!!obj.key.endsWith('.flac.flac') &&
        !!!obj.key.endsWith('.mp3_mf.mp3'))).forEach((obj) => {
        str += /*html*/ `<section style="border-top: 1px solid var(--divider);" class="p-md">
    <div class="flex-row justify-end align-center">
      <button hx-trigger="click" hx-target="closest section" hx-swap="outerHTML" hx-delete="/admin/view-audio/${obj.key}" class="icon small filled error">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
      </button>
    </div>
      ${(0, mediaHelpers_1.renderAudioHTML)(obj.key, obj.key, desktop)}
</section>`;
    });
    if (IsTruncated) {
        str += /*html*/ `<div hx-trigger="intersect once" hx-get="/admin/view-audio/${encodeURIComponent(String(NextContinuationToken))}" hx-target="this" hx-swap="outerHTML"></div>`;
    }
    return str;
}
function renderS3Video(videos, IsTruncated, NextContinuationToken, desktop) {
    var str = '';
    videos.filter((obj) => Boolean(!!!obj.key.endsWith('.libvpx.webm') &&
        !!!obj.key.endsWith('.libx264.mp4'))).forEach((obj) => {
        str += /*html*/ `<section style="border-top: 1px solid var(--divider);" class="p-md">
    <div class="flex-row justify-end align-center">
      <button hx-trigger="click" hx-target="closest section" hx-swap="outerHTML" hx-delete="/admin/view-video/${obj.key}" class="icon small filled error">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
      </button>
    </div>
      ${(0, mediaHelpers_1.renderVideoHTML)(obj.key, obj.key, '', desktop, 400)}
</section>`;
    });
    if (IsTruncated) {
        str += /*html*/ `<div hx-trigger="intersect once" hx-get="/admin/view-video/${encodeURIComponent(String(NextContinuationToken))}" hx-target="this" hx-swap="outerHTML"></div>`;
    }
    return str;
}
async function getMoreS3Media(req, res) {
    var _a, _b;
    try {
        const { nextToken, type } = req.params;
        const isImage = req.path.includes('/view-image');
        const isAudio = req.path.includes('/view-audio');
        const isVideo = req.path.includes('/view-video');
        var retStr = '';
        if (isImage) {
            const s3Obj = await (0, aws_implementation_1.listImageObjects)(nextToken ? nextToken : undefined);
            const { images, IsTruncated, NextContinuationToken } = s3Obj;
            retStr = renderS3Images(images, Boolean(IsTruncated), NextContinuationToken, 'frankmbrown');
            return res.status(200).send(retStr);
        }
        else if (isAudio) {
            const s3Obj = await (0, aws_implementation_1.listAudioObjects)(nextToken ? nextToken : undefined);
            const { audios, IsTruncated, NextContinuationToken } = s3Obj;
            retStr = renderS3Audio(audios, Boolean(IsTruncated), NextContinuationToken, Boolean(((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) === true));
            return res.status(200).send(retStr);
        }
        else if (isVideo) {
            const s3Obj = await (0, aws_implementation_1.listVideoObjects)(nextToken ? nextToken : undefined);
            const { videos, IsTruncated, NextContinuationToken } = s3Obj;
            retStr = renderS3Video(videos, Boolean(IsTruncated), NextContinuationToken, Boolean(((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.desktop) === true));
            return res.status(200).send(retStr);
        }
        else
            throw new Error(`${req.path}: Request is not an image, audio, or video request.`);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Unable to get more media from s3 bucket.'));
    }
}
exports.getMoreS3Media = getMoreS3Media;
async function deleteS3Media(req, res) {
    try {
        const { key } = req.params;
        const isImage = req.path.includes('/view-image');
        const isAudio = req.path.includes('/view-audio');
        const isVideo = req.path.includes('/view-video');
        if (isImage) {
            await Promise.all([
                (0, aws_implementation_1.deleteImageObject)(key, INGRESS_IMAGE),
                (0, aws_implementation_1.deleteImageObject)(key, EGRESS_IMAGE)
            ]);
            return res.status(200).send((0, html_1.getSuccessSnackbar)('Successfully deleted image object.'));
        }
        else if (isAudio) {
            await (0, aws_implementation_1.deleteAudioObject)(key);
            return res.status(200).send((0, html_1.getSuccessSnackbar)('Successfully deleted audio object.'));
        }
        else if (isVideo) {
            await (0, aws_implementation_1.deleteVideoObject)(key);
            return res.status(200).send((0, html_1.getSuccessSnackbar)('Successfully deleted video object.'));
        }
        else
            throw new Error(`${req.path}: Request is not an image, audio, or video request.`);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Unable to delete media from s3 bucket.'));
    }
}
exports.deleteS3Media = deleteS3Media;
/**
 * GET /admin
 * Should be auth level 3
 * @param req
 * @param res
 * @returns
 */
async function getAdminViewImagePage(req, res) {
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'View Image', item: '/admin/view-image', position: 3 }];
    const title = "Administrator Image Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
    const description = 'Administrator Image Page. View and delete images from the s3 bucket.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/view-image', noIndex: true };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    var frankmbrownHTML = '';
    var civgaugeHTML = '';
    try {
        const s3Obj = await (0, aws_implementation_1.listImageObjects)(undefined);
        const { images, IsTruncated, NextContinuationToken } = s3Obj;
        frankmbrownHTML = renderS3Images(images, Boolean(IsTruncated), NextContinuationToken, 'frankmbrown');
    }
    catch (error) {
        console.error(error);
    }
    return res.status(200).render('pages/admin/admin-view-image', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        frankmbrownHTML,
        civgaugeHTML
    });
}
exports.getAdminViewImagePage = getAdminViewImagePage;
/**
 * GET /admin
 * Should be auth level 3
 * @param req
 * @param res
 * @returns
 */
async function getAdminViewAudioPage(req, res) {
    var _a;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'View Audio', item: '/admin/view-audio', position: 3 }];
    const title = "Administrator Audio Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
    const description = 'Administrator Audio Page. View and delete audio files from the s3 bucket.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/view-audio', noIndex: true };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    var initialHTML = '';
    try {
        const s3Obj = await (0, aws_implementation_1.listAudioObjects)(undefined);
        const { audios, IsTruncated, NextContinuationToken } = s3Obj;
        initialHTML = renderS3Audio(audios, Boolean(IsTruncated), NextContinuationToken, Boolean(((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) === true));
    }
    catch (error) {
        console.error(error);
    }
    return res.status(200).render('pages/admin/admin-view-audio', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        initialHTML
    });
}
exports.getAdminViewAudioPage = getAdminViewAudioPage;
/**
 * GET /admin
 * Should be auth level 3
 * @param req
 * @param res
 * @returns
 */
async function getAdminViewVideoPage(req, res) {
    var _a;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'View Video', item: '/admin/view-video', position: 3 }];
    const title = "Administrator Video Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
    const description = 'Administrator Video Page. View and delete videos from the s3 bucket.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/view-video', noIndex: true };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    var initialHTML = '';
    try {
        const s3Obj = await (0, aws_implementation_1.listVideoObjects)(undefined);
        const { videos, IsTruncated, NextContinuationToken } = s3Obj;
        initialHTML = renderS3Video(videos, Boolean(IsTruncated), NextContinuationToken, Boolean(((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) === true));
    }
    catch (error) {
        console.error(error);
    }
    return res.status(200).render('pages/admin/admin-view-video', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        initialHTML
    });
}
exports.getAdminViewVideoPage = getAdminViewVideoPage;
/* ---------------------- Admin Page ------------------------- */
/**
 * GET /admin
 * Should be auth level 3
 * @param req
 * @param res
 * @returns
 */
async function getAdminPage(req, res) {
    var _a, _b, _c;
    const todayDateString = TIME.getFullDateStringFromUnix(TIME.getStartOfDaySeconds(((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York'));
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Admin Page', item: '/admin', position: 2 }
    ];
    const title = "Admin Page";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
    const description = 'Add things to the website.';
    const tableOfContents = [
        { id: "take-actions", text: "Take Action" },
        { id: "personal-diary", text: "Personal Diary" },
        { id: "project-notifications", text: "Project Notifications" },
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin', noIndex: true };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    const [{ tableOfContents: tableOfContentsDiary, form }, staticPageSitemap] = await Promise.all([
        getTodayDiary(req),
        (0, database_1.default)().query(`SELECT * FROM static_pages_sitemap;`)
    ]);
    var diaryForm = '';
    diaryForm = form;
    if (tableOfContentsDiary)
        tableOfContents.push(...tableOfContentsDiary);
    return res.status(200).render('pages/admin/admin-home', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        pageObj: {
            todayDateString,
            lat: ((_b = req.session.ip_location) === null || _b === void 0 ? void 0 : _b.lat) || 0,
            lng: ((_c = req.session.ip_location) === null || _c === void 0 ? void 0 : _c.lng) || 0,
            diaryForm
        }
    });
}
exports.getAdminPage = getAdminPage;
function getAdminUtilities(req, res) {
    try {
        const view = 'pages/admin/admin-utilities';
        const breadcrumbs = [
            { name: 'Home', item: '/', position: 1 },
            { name: 'Admin Home', item: '/admin', position: 2 },
            { name: 'Admin Utilities', item: '/admin/utilities', position: 3 }
        ];
        const title = "Admin Utilities";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Utilities Page"];
        const description = 'Perform some functions that are difficult to perform when the development server is running...';
        const tableOfContents = [
            { id: "why-create", text: "Why Create This Page" },
            { id: "take-actions", text: "Take Action" }
        ];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/utilities', noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables
        });
    }
    catch (error) {
        return (0, redirect_override_1.redirect)(req, res, '/404', 500, { severity: 'error', message: 'Something went wrong.' });
    }
}
exports.getAdminUtilities = getAdminUtilities;
async function getAdminUtilitiesClearCache(req, res) {
    try {
        await (0, cache_1.clearCache)();
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully cleared cache!"));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong clearing cache."));
    }
}
exports.getAdminUtilitiesClearCache = getAdminUtilitiesClearCache;
async function getAdminUtilitiesIndexPages(req, res) {
    try {
        await (0, indexPagesHelper_1.indexPages)();
        return res.status(200).send((0, html_1.getSuccessSnackbar)("Successfully indexed pages using the google indexing api."));
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)("Something went wrong indexing the pages for the admin page."));
    }
}
exports.getAdminUtilitiesIndexPages = getAdminUtilitiesIndexPages;
async function sendEmailRoute(req, res) {
    try {
        const msg = {
            to: "fmb201704@gmail.com", // Change to your recipient
            from: 'owner@frankmbrown.net', // Change to your verified sender
            subject: 'Daily Email To Make Sure That Everything is OK',
            html: '<h1 style="color: red;">Hello World</h1>'
        };
        await (0, account_1.sendEmail)(msg);
        return res.status(200).send((0, html_1.getSuccessAlert)("Everything went OK sending email. Check your fmb201704@gmail.com account."));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong sending the email."));
    }
}
exports.sendEmailRoute = sendEmailRoute;
function getCreateChartPage(req, res) {
    try {
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'Create Chart', item: '/admin/create-chart', position: 3 }];
        const title = "Create Chart";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
        const description = 'Create a Chart on this page.';
        const tableOfContents = [];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/create-chart', noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render('pages/admin/admin-create-chart', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: 'error', message: 'Something went wrong getting the create chart page.' });
    }
}
exports.getCreateChartPage = getCreateChartPage;
const TO_DO_EJS = node_fs_1.default.readFileSync(node_path_1.default.resolve(BASE_PATH_1.default, 'views', 'pages', 'admin', 'to-do.ejs'), { encoding: 'utf-8' });
function renderToDo(req, obj) {
    var _a;
    const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
    const date_str = TIME.formatDateFromUnixTime('MM/DD/YYYY, h:m:s A', tz, Number(obj.date_to_complete_by));
    const datetime_str = TIME.getDateTimeStringFromUnix(Number(obj.date_to_complete_by), true);
    const id = obj.id;
    const html = obj.html;
    const unix_time = TIME.getUnixTime();
    const error = unix_time > Number(obj.date_to_complete_by);
    return ejs_1.default.render(TO_DO_EJS, { id, html, date_str, datetime_str, error });
}
/**
```sql
CREATE TABLE to_dos (
    id serial PRIMARY KEY,
    date_to_complete_by bigint NOT NULL,
    editor_state jsonb NOT NULL,
    desktop_html TEXT NOT NULL,
    tablet_html TEXT NOT NULL,
    mobile_html TEXT NOT NULL,
    date_completed bigint
);
```
 */
async function getAdminToDosPage(req, res) {
    var _a, _b, _c;
    try {
        const title = "To Dos";
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'To Dos', item: '/admin/to-dos', position: 3 }];
        const image = "https://image.storething.org/frankmbrown%2Ff91bdfb9-1f46-4f9d-9e0a-2a7e1329aa58.jpg";
        const description = "Page on which I am going to keep track of things that I need to do.";
        const tableOfContents = [
            { id: "add-to-do", "text": "Add To Do" },
            { id: "to-dos", "text": "To Dos" },
            { id: "recently-completed", "text": "Recently Completed" },
        ];
        const keywords = ["To Dos"];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/create-chart', noIndex: true, image };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        const commentLexicalImplementation = (0, lexicalImplementations_1.getCommentImplementation)(req, 'to-do-lexical', false, `<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span data-v="1" style="white-space: pre-wrap;">Enter your to do item here...</span></p>`, { wrapperStyle: 'block lexical-wrapper mt-2', type: 'comment', rteStyle: 'max-height: 400px; min-height: 150px; overflow-y:auto;' });
        var type_id = 'mobile_html';
        if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)
            type_id = 'desktop_html';
        else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet)
            type_id = 'tablet_html';
        var to_dos_str = (0, html_1.getWarningAlert)("There are no to dos to show currently.", undefined, false);
        var recently_completed_str = (0, html_1.getWarningAlert)("There are no recently completed to dos to show.", undefined, false);
        const tz = ((_c = req.session.settings) === null || _c === void 0 ? void 0 : _c.timezone) || 'America/New_York';
        try {
            const db = (0, database_1.default)();
            const [toDos, recentlyCompleted] = await Promise.all([(db.query(`SELECT id, ${type_id} AS html, date_to_complete_by FROM to_dos WHERE date_completed IS NULL ORDER BY date_to_complete_by ASC LIMIT 100;`)), db.query(`SELECT id, ${type_id} AS html, date_to_complete_by, date_completed FROM to_dos WHERE date_completed IS NOT NULL ORDER BY date_completed DESC LIMIT 50;`)]);
            ;
            if (toDos.rows.length) {
                to_dos_str = toDos.rows.map((obj) => {
                    return renderToDo(req, obj);
                }).join('');
            }
            if (recentlyCompleted.rows.length) {
                recently_completed_str = recentlyCompleted.rows.map((obj) => {
                    const date_str = TIME.formatDateFromUnixTime('MM/DD/YYYY, h:m:s A', tz, Number(obj.date_to_complete_by));
                    const datetime_str = TIME.getDateTimeStringFromUnix(Number(obj.date_to_complete_by), true);
                    const date_str_2 = TIME.formatDateFromUnixTime('MM/DD/YYYY, h:m:s A', tz, Number(obj.date_completed));
                    const datetime_str_2 = TIME.getDateTimeStringFromUnix(Number(obj.date_completed), true);
                    return `<div class="mt-2" style="padding: 4px; border-radius: 6px; border: 2px solid var(--text-primary);" data-to-do-wrapper>
  <div class="lexical-wrapper" data-rich-text-editor data-type="comment" data-editable="false" id="to-do-<%-locals.id%>-editor" data-max-height="400" style="max-height: 400px;">
        ${obj.html}
  </div>
  <div class="flex-row justify-between align-center">
    <span>
      <span class="bold">Date To Complete By:</span>
      <time data-date-format="MM/DD/YYYY, h:m:s A" datetime="${datetime_str}">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
          </path>
        </svg>
        <span>${date_str}</span>
      </time>
    </span>
    <span>
        <span class="bold">Date Completed:</span>
      <time data-date-format="MM/DD/YYYY, h:m:s A" datetime="${datetime_str_2}">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
          </path>
        </svg>
        <span>${date_str_2}</span>
      </time>
    </span>
  </div>
</div>`;
                }).join('');
            }
        }
        catch (e) {
            to_dos_str = (0, html_1.getErrorAlert)("Something went wrong getting the to dos.", undefined, false);
            recently_completed_str = (0, html_1.getErrorAlert)("Something went wrong getting the recently completed to dos. ");
            console.error(e);
        }
        const datetime_string_now = TIME.getDateTimeStringFromUnix(TIME.getUnixTime(), false);
        return res.status(200).render('pages/admin/admin-todos', {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            lexicalHTML: commentLexicalImplementation,
            to_dos_str,
            recently_completed_str,
            datetime_string_now
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/admin', 400, { severity: 'error', message: 'Something went wrong getting the admin to do page.' });
    }
}
exports.getAdminToDosPage = getAdminToDosPage;
async function postToDo(req, res) {
    try {
        const to_do = req.body['to-do-lexical'];
        const date_to_complete_by = req.body['date-complete-by'];
        const deadline_number = Math.round((new Date(date_to_complete_by)).getTime() / 1000);
        const { editorState, desktop_html, tablet_html, mobile_html } = await (0, lexical_1.parseCommentLexicalEditor)(to_do);
        await (0, database_1.default)().query(`INSERT INTO to_dos (date_to_complete_by,editor_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5);`, [deadline_number, editorState, desktop_html, tablet_html, mobile_html]);
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully inserted to do item.", undefined, false).concat(`<script nonce="${req.session.jsNonce}">(() => { 
  setTimeout(() => {
      window.location.reload();
  },500);      
})()</script>`));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the to do.", undefined, false));
    }
}
exports.postToDo = postToDo;
async function deleteToDo(req, res) {
    try {
        const { id } = req.params;
        const dbResp = await (0, database_1.default)().query(`DELETE FROM to_dos WHERE id=$1 RETURNING id;`, [parseInt(id)]);
        if (dbResp.rows.length === 1) {
            return res.status(200).send((0, html_1.getSuccessAlert)("Successfully deleted to do!"));
        }
        else
            throw new Error("Something went wronng deleting the to do.");
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong deleting the to do.", undefined));
    }
}
exports.deleteToDo = deleteToDo;
async function markToDoComplete(req, res) {
    try {
        const { id } = req.params;
        const deadline_number = Math.round((new Date()).getTime() / 1000);
        const dbResp = await (0, database_1.default)().query(`UPDATE to_dos SET date_completed=$1 WHERE id=$2 RETURNING id;`, [deadline_number, parseInt(id)]);
        if (dbResp.rows.length === 1) {
            return res.status(200).send((0, html_1.getSuccessAlert)("Successfully marked to do as complete!"));
        }
        else
            throw new Error("Something went wronng marking the to do as complete.");
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong deleting the to do.", undefined));
    }
}
exports.markToDoComplete = markToDoComplete;
async function getEditToDo(req, res) {
    var _a, _b;
    try {
        const { id } = req.params;
        const datetime_string_now = TIME.getDateTimeStringFromUnix(TIME.getUnixTime(), false);
        var type_id = 'mobile_html';
        if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)
            type_id = 'desktop_html';
        else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet)
            type_id = 'tablet_html';
        const row = (await (0, database_1.default)().query(`SELECT id, date_to_complete_by, ${type_id} AS html FROM to_dos WHERE id=$1;`, [parseInt(id)])).rows;
        if (row.length !== 1)
            throw new Error("Something went wrong getting the row.");
        const { id: id_new, date_to_complete_by, html } = row[0];
        const datetime_string_val = TIME.getDateTimeStringFromUnix(Number(date_to_complete_by), false);
        const comment_implementation = (0, lexicalImplementations_1.getCommentImplementation)(req, `to-do-edit-lex-${id_new}`, false, html, { wrapperStyle: 'block lexical-wrapper mt-2', type: 'comment', rteStyle: 'max-height: 400px; min-height: 150px; overflow-y:auto;' });
        const form = `<form class="mt-2" hx-put="/admin/to-dos/${parseInt(id_new)}" data-loading="Editing To Do" hx-target="this"hx-trigger="submit" hx-swap="outerHTML">
  ${comment_implementation}
  <div class="input-group block mt-2">
      <label for="date-complete-by-${id_new}">Date To Complete By:</label>
      <div class="flex-row align-center gap-2 mt-1">
        <button data-launch-datetime type="button" class="icon medium" aria-label="Launch Datetime Input Menu">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Today"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></svg>
        </button>
        <input placeholder="mm/dd/yyyy" type="datetime-local" id="date-complete-by-${id_new}-2" name="date-complete-by-${id_new}" min="${datetime_string_now}" value="${datetime_string_val}" />
      </div>
    </div>
<div class="flex-row justify-between align-center mt-3">
  <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
  <button type="submit" aria-label="Submit" class="success filled icon-text medium">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
      SUBMIT
  </button>
</div>
</form>`;
        return res.status(200).send(form);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong deleting the to do.", undefined));
    }
}
exports.getEditToDo = getEditToDo;
async function postEditToDo(req, res) {
    var _a, _b;
    try {
        const { id } = req.params;
        const lexical_state_key = Object.keys(req.body).filter((k) => k.startsWith('to-do-edit-lex-'))[0];
        const date_completed_str = Object.keys(req.body).filter((k) => k.startsWith('date-complete-by-'))[0];
        const to_do = req.body[lexical_state_key];
        const date_to_complete_by = req.body[date_completed_str];
        const deadline_number = Math.round((new Date(date_to_complete_by)).getTime() / 1000);
        const { editorState, desktop_html, tablet_html, mobile_html } = await (0, lexical_1.parseCommentLexicalEditor)(to_do);
        var type_id = 'mobile_html';
        if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)
            type_id = 'desktop_html';
        else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet)
            type_id = 'tablet_html';
        const resp = await (0, database_1.default)().query(`UPDATE to_dos SET date_to_complete_by=$1,editor_state=$2,desktop_html=$3,tablet_html=$4,mobile_html=$5 WHERE id=$6 RETURNING id, ${type_id} AS html, date_to_complete_by;`, [deadline_number, editorState, desktop_html, tablet_html, mobile_html, parseInt(id)]);
        if (resp.rows.length !== 1) {
            throw new Error("Something went wrong posting the edit to the to do.");
        }
        const obj = resp.rows[0];
        const html = renderToDo(req, obj);
        return res.status(200).send(html);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong editing the to do."));
    }
}
exports.postEditToDo = postEditToDo;
async function postNotifications(req, res) {
    try {
        const notif_type = req.body['notif_type'];
        const notif_title = req.body['notif_title'];
        const notif_desc = req.body['notif_desc'];
        const notif_link = req.body['notif_url'];
        if (notif_type !== 'project_update' && notif_type !== 'create_project') {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid notification type."));
        }
        if (notif_title.length < 1 || notif_title.length > 150) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid notification title."));
        }
        if (notif_desc.length < 1 || notif_title.notif_desc > 400) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid notification descripton."));
        }
        if (!!!notif_link.startsWith('https://frankmbrown.net/')) {
            return res.status(200).send((0, html_1.getErrorAlert)("Invalid notification url."));
        }
        const icon = 'https://image.storething.org/frankmbrown/create_project.png';
        await (0, database_1.default)().query(`INSERT INTO notifications (topic,title,body,icon,link,date_created) VALUES ($1,$2,$3,$4,$5,EXTRACT(EPOCH FROM NOW()));`, [notif_type, notif_title, notif_desc, icon, notif_link]);
        return res.status(200).send((0, html_1.getSuccessAlert)("Successfully posted notification.").concat(`<script nonce="${req.session.jsNonce}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500)
    })()</nonce>`));
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong posting the notification."));
    }
}
exports.postNotifications = postNotifications;
async function getCreateGameDesign(req, res) {
    try {
        const view = `pages/admin/admin-create-game-design`;
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Admin Page', item: '/admin', position: 2 }, { name: 'Create Gane or Design', item: '/admin/create-game-design', position: 3 }];
        const title = "Create Game or Design";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Administrator Page"];
        const description = 'Use this page to create a game or design for the games/design page.';
        const tableOfContents = [];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/admin/create-game-design', noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/admin', 400, { severity: "error", message: "Something went wrong getting the create game design page." });
    }
}
exports.getCreateGameDesign = getCreateGameDesign;
