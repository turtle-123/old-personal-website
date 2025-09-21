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
exports.renderTexNotePreview = exports.renderArticleComponentLink = exports.renderDailyReadingToDoPreview = exports.renderDailyReadingCompletedPreview = exports.renderJupyterPreview = exports.renderEditMarkdownNotePreview = exports.renderMarkdownPreview = exports.renderArticlePreview = exports.renderDiaryPreview = exports.GET_ARTICLE_PREVIEWS = exports.getOrderBy = exports.ARTICLE_SORT_BY_TO_STRING = exports.VALID_ARTICLE_PREVIEW_SORT_BY = exports.updateTocOnReOrderScript = exports.isReOrderRequest = void 0;
const ejs_1 = __importDefault(require("ejs"));
const TIME = __importStar(require("../../../utils/time"));
const escape_html_1 = __importDefault(require("escape-html"));
const database_1 = __importDefault(require("../../../database"));
const html_1 = require("../../html");
const set_1 = require("../../../utils/set");
const number_1 = require("../../../utils/number");
const ejsTemplate = /*html*/ `<%if(locals.link){%>
    <a hx-push-url="true" class="preview-article" href="<%=locals.path%>" hx-get="<%=locals.path%>" hx-target="#PAGE" hx-indicator="#page-transition-progress">
        <%if(locals.src){%>
          <div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
              <img src="<%=locals.src%>" alt="<%locals.alt%>" style="width: 150px;height: 75px; margin: 0px; object-fit: contain; background-color: black; align-self: center;" width="150" height="75" />
          </div>
        <%}%>
            <div class="p-md flex-column justify-start align-start grow-1">
                <p class="h5 bold w-100">
                    <%=locals.title%>
                </p>
                <p class="body2 mt-1 w-100">
                    <%=locals.description.length > 150 ? locals.description.slice(0,150).concat('...') : locals.description%>
                </p>
                <div class="flex-row w-100 align-center justify-between mt-1">
                    <time data-popover data-pelem="#date-created-tool" data-mouse data-date-format="MM/DD/YYYY"class="small" datetime="<%=locals.date_created%>">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
                          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
                          </path>
                      </svg>
                      <span></span>
                    </time>
                    <%if(locals.second_string){%>
                        <%-locals.second_string%>
                    <%}%>
                </div>
            </div>
        </a>
<%}else{%>
    <div class="preview-article">
        <%if(locals.src){%>
          <div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
              <img src="<%=locals.src%>" alt="<%locals.alt%>" style="width: 150px;height: 75px; margin: 0px; object-fit: contain; background-color: black; align-self: center;" width="150" height="75" />
          </div>
        <%}%>
            <div class="p-md flex-column justify-start align-start grow-1">
                <p class="h5 bold w-100">
                    <%=locals.title%>
                </p>
                <p class="body2 mt-1 w-100">
                    <%=locals.description.length > 150 ? locals.description.slice(0,150).concat('...') : locals.description%>
                </p>
                <div class="flex-row w-100 align-center justify-between mt-1">
                    <time data-popover data-pelem="#date-created-tool" data-mouse data-date-format="MM/DD/YYYY"class="small" datetime="<%=locals.date_created%>">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
                          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
                          </path>
                      </svg>
                      <span></span>
                    </time>
                    <%if(locals.second_string){%>
                        <%-locals.second_string%>
                    <%}%>
                </div>
            </div>
           
        </div>
<%}%>
`;
function renderArticlePreviewNew(url, isMobile, row, tz) {
    const id = row.id;
    const date_created = row.date_created;
    const last_edited = row.last_edited;
    const title = row.title;
    const description = String(row.description);
    const image = row.image;
    const view_count = row.view_count !== null && row.view_count !== undefined ? (0, number_1.formatNumberAttribute)(String(row.view_count)) : undefined;
    const like_count = row.like_count !== null && row.like_count !== undefined ? (0, number_1.formatNumberAttribute)(String(row.like_count)) : undefined;
    const comment_count = row.comment_count !== null && row.comment_count !== undefined ? (0, number_1.formatNumberAttribute)(String(row.comment_count)) : undefined;
    const annotation_count = row.annotation_count !== null && row.annotation_count !== undefined ? (0, number_1.formatNumberAttribute)(String(row.annotation_count)) : undefined;
    const article_type = row.article_type;
    const image_width = article_type === "tex_note" ? 100 : 150;
    const image_height = article_type === "tex_note" ? 100 : 75;
    const rating = row.rating !== null && row.rating !== undefined ? row.rating : undefined;
    var attribute_str = '';
    var popover_str = '';
    if (like_count !== undefined) {
        attribute_str += `<span data-popover data-pelem="#likes-tool" ${isMobile ? `data-click` : `data-mouse`} class="flex-row gap-1 align-center"><svg class="caption t-normal" viewBox="0 0 512 512" title="heart" focusable="false" inert tabindex="-1"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"></path></svg> <span class="body2">${like_count}</span></span>`;
    }
    if (comment_count !== undefined) {
        attribute_str += `<span data-popover data-pelem="#comments-tool" ${isMobile ? `data-click` : `data-mouse`} class="flex-row gap-1 align-center"> <svg class="caption t-normal" viewBox="0 0 512 512" title="comment" focusable="false" inert tabindex="-1"><path d="M123.6 391.3c12.9-9.4 29.6-11.8 44.6-6.4c26.5 9.6 56.2 15.1 87.8 15.1c124.7 0 208-80.5 208-160s-83.3-160-208-160S48 160.5 48 240c0 32 12.4 62.8 35.7 89.2c8.6 9.7 12.8 22.5 11.8 35.5c-1.4 18.1-5.7 34.7-11.3 49.4c17-7.9 31.1-16.7 39.4-22.7zM21.2 431.9c1.8-2.7 3.5-5.4 5.1-8.1c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208s-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6c-15.1 6.6-32.3 12.6-50.1 16.1c-.8 .2-1.6 .3-2.4 .5c-4.4 .8-8.7 1.5-13.2 1.9c-.2 0-.5 .1-.7 .1c-5.1 .5-10.2 .8-15.3 .8c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c4.1-4.2 7.8-8.7 11.3-13.5c1.7-2.3 3.3-4.6 4.8-6.9c.1-.2 .2-.3 .3-.5z"></path></svg> <span class="body2">${comment_count}</span></span>`;
    }
    if (annotation_count !== undefined) {
        attribute_str += `<span data-popover data-pelem="#annotations-tool" ${isMobile ? `data-click` : `data-mouse`} class="flex-row gap-1 align-center"><svg class="caption t-normal" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="EditNote"><path d="M3 10h11v2H3v-2zm0-2h11V6H3v2zm0 8h7v-2H3v2zm15.01-3.13.71-.71c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-.71.71-2.12-2.12zm-.71.71-5.3 5.3V21h2.12l5.3-5.3-2.12-2.12z"></path></svg>  <span class="body2">${annotation_count}</span></span>`;
    }
    if (view_count !== undefined) {
        attribute_str += `<span data-popover data-pelem="#views-tool" ${isMobile ? `data-click` : `data-mouse`} class="flex-row gap-1 align-center"> <svg class="caption t-normal" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RemoveRedEye"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg> <span class="body2">${view_count}</span></span>`;
    }
    if (rating !== undefined) {
        attribute_str += `<span data-popover data-pelem="#rating-tool" ${isMobile ? `data-click` : `data-mouse`} class="flex-row gap-1 align-center"> <svg class="caption t-normal" viewBox="0 0 576 512" title="star" focusable="false" inert tabindex="-1"><path d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"></path></svg> <span class="body2">${rating}</span></span>`;
    }
    if ((date_created === null || date_created === void 0 ? void 0 : date_created.length) || (last_edited === null || last_edited === void 0 ? void 0 : last_edited.length)) {
        const uuid = 'pop_'.concat(crypto.randomUUID());
        attribute_str += `<button data-popover="" data-click="" data-force-close="" style="margin-left: auto;" data-pelem="#${uuid}" type="button" class="icon small" aria-label="More Information on Article"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="InfoOutlined"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg></button>`;
        popover_str += `<div class="floating-menu o-xs" role="tooltip" id="${uuid}" data-placement="bottom-end">`;
        if (typeof date_created === "string") {
            const num = Number(date_created);
            const datimetime = TIME.getDateTimeStringFromUnix(num, true);
            const format = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, num);
            const date_created_str = `<time data-popover="" data-pelem="#date-created-tool" data-mouse="" data-date-format="MM/DD/YYYY" class="small" datetime="${datimetime}"> <svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="CalendarToday"> <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"> </path> </svg> <span>${format}</span></time>`;
            popover_str += `<p class="flex-row justify-start gap-1 align-center"><span class="bold">Date Created:</span> ${date_created_str}</p>`;
        }
        if (typeof last_edited === "string") {
            const num = Number(last_edited);
            const datimetime = TIME.getDateTimeStringFromUnix(num, true);
            const format = TIME.formatDateFromUnixTime('MM/DD/YYYY', tz, num);
            const last_edited_str = `<time data-popover="" data-pelem="#date-created-tool" data-mouse="" data-date-format="MM/DD/YYYY" class="small" datetime="${datimetime}"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="Create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg> <span>${format}</span></time>`;
            popover_str += `<p class="flex-row justify-start gap-1 align-center"><span class="bold">Last Edited:</span> ${last_edited_str}</p>`;
        }
        popover_str += `</div>`;
    }
    var str = `<a hx-push-url="true" class="preview-article" href="${url}" hx-get="${url}" hx-target="#PAGE" hx-indicator="#page-transition-progress">`;
    str += `<div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
    <img src="${String(image)}" alt="${(0, escape_html_1.default)(title)}" style="width:${image_width}px;height:${image_height}px; margin:0px; object-fit:contain; background-color:black;align-self: center;" width="${image_width}" height="${image_height}" />
</div>
<div class="p-md flex-column justify-start align-start grow-1">
<p class="h5 bold w-100">
${(0, escape_html_1.default)(title)}
</p>
<p class="body2 mt-1 w-100">
    ${description.length > 150 ? (0, escape_html_1.default)(description).concat('...') : (0, escape_html_1.default)(description)}
</p>
<div class="flex-row w-100 align-center justify-start mt-1 gap-3">
${attribute_str}
</div>
</div>`;
    str += `</a>${popover_str}`;
    return str;
}
const VALID_TYPS_SET = new Set(['blog_id', 'idea_id', 'note_id', 'wikipedia_id', 'tex_notes_id', 'jupyter_notebooks_id', 'markdown_notes_id', 'letterboxd_id', 'goodreads_id', 'game_id', 'design_id', 'electronics_id']);
const NOT_HAS_ANNOTATION = new Set(['tex_notes_id', 'jupyter_notebooks_id', 'markdown_notes_id']);
const typ_to_table = {
    'blog_id': 'blog',
    'idea_id': 'idea',
    'note_id': 'note',
    'wikipedia_id': 'wikipedia',
    'tex_notes_id': 'tex_notes',
    'jupyter_notebooks_id': 'jupyter_notebooks',
    'markdown_notes_id': 'markdown_notes',
    'letterboxd_id': 'letterboxd',
    'goodreads_id': 'goodreads',
    'game_id': 'games',
    'design_id': 'designs_3d',
    'electronics_id': 'electronics_projects'
};
function isReOrderRequest(req) {
    return Boolean(req.get('hx-target') === "articles-inner");
}
exports.isReOrderRequest = isReOrderRequest;
function updateTocOnReOrderScript(req) {
    return `<script nonce="${req.session.jsNonce}">
(() => {
  setTimeout(() => {
    document.dispatchEvent(new CustomEvent("update-table-of-contents"));
  },500);
})()
</script>`;
}
exports.updateTocOnReOrderScript = updateTocOnReOrderScript;
exports.VALID_ARTICLE_PREVIEW_SORT_BY = new Set(['last-edit-new', 'last-edit-old', 'date-created-new', 'date-created-old', 'num-comments', 'num-views', 'num-annotations', 'num-likes', 'rating']);
exports.ARTICLE_SORT_BY_TO_STRING = {
    'last-edit-new': "Last Edited (New)",
    'last-edit-old': "Last Edited (OLD)",
    'date-created-new': "Date Created (NEW)",
    'date-created-old': "Date Created (OLD)",
    'num-comments': "Number of Comments",
    'num-views': "Number of Views",
    'num-annotations': "Number of Annotations",
    'num-likes': "Number of Likes",
    'rating': 'Rating'
};
function getOrderBy(req) {
    var order_by = Array.isArray(req.query['order-by-select']) ? String(req.query['order-by-select'][0]) : String(req.query['order-by-select']);
    if ((0, set_1.isMemberOf)(order_by, exports.VALID_ARTICLE_PREVIEW_SORT_BY))
        return { order_by_value: order_by, order_by_str: exports.ARTICLE_SORT_BY_TO_STRING[order_by] };
    else
        return { order_by_value: 'last-edit-new', order_by_str: "Last Edited (New)" };
}
exports.getOrderBy = getOrderBy;
const GROUP_BY_MONTH_YEAR = new Set(['last-edit-new', 'last-edit-old', 'date-created-new', 'date-created-old']);
async function GET_ARTICLE_PREVIEWS(typ, order_by, req) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        var gro_by_month = false;
        if ((0, set_1.isMemberOf)(order_by, GROUP_BY_MONTH_YEAR))
            gro_by_month = true;
        if (order_by === "rating" && typ !== 'goodreads_id' && typ !== 'letterboxd_id')
            throw new Error("Ordering by rating is only available for goodreads and letterboxd");
        if (!!!VALID_TYPS_SET.has(typ))
            throw new Error("Umable to get article preview query.");
        const HAS_ANNOTATION = !!!NOT_HAS_ANNOTATION.has(typ);
        if (!!!HAS_ANNOTATION && order_by === "num-annotations")
            throw new Error("Cannot sort by the number of annotations when the ");
        if ((order_by === "last-edit-new" || order_by === "last-edit-old") && typ === "jupyter_notebooks_id")
            throw new Error("You cannot sort by last edited with Jupyter Notebooks.");
        var str = `WITH article_views_info AS (
      SELECT count(like_id) AS view_count, ${typ} 
      FROM article_views 
      WHERE ${typ} IS NOT NULL 
      GROUP BY ${typ} 
    ), article_likes_info AS (
      SELECT count(like_id) AS like_count, ${typ}
      FROM article_likes 
      WHERE ${typ} IS NOT NULL 
      GROUP BY ${typ}
    ), article_comment_info AS (
      SELECT count(id) AS comment_count, ${typ} 
      FROM comments 
      WHERE ${typ} IS NOT NULL 
      GROUP BY ${typ}
    )`;
        if (HAS_ANNOTATION) {
            str += `, article_annotation_info AS (
        SELECT count(id) AS annotation_count, ${typ} 
        FROM annotations WHERE ${typ} IS NOT NULL 
        GROUP BY ${typ}
      )`;
        }
        const TABLE = typ_to_table[typ];
        var ORDER_BY = '';
        var WHERE = ``;
        switch (order_by) {
            case 'date-created-new': {
                ORDER_BY = 'ORDER BY date_created DESC';
                break;
            }
            case 'date-created-old': {
                ORDER_BY = 'ORDER BY date_created ASC';
                break;
            }
            case 'last-edit-new': {
                ORDER_BY = 'ORDER BY last_edited DESC';
                break;
            }
            case 'last-edit-old': {
                ORDER_BY = 'ORDER BY last_edited ASC';
                break;
            }
            case 'num-annotations': {
                ORDER_BY = 'ORDER BY annotation_count DESC';
                break;
            }
            case 'num-comments': {
                ORDER_BY = 'ORDER BY comment_count DESC';
                break;
            }
            case 'num-views': {
                ORDER_BY = 'ORDER BY view_count DESC';
                break;
            }
            case 'num-likes': {
                ORDER_BY = 'ORDER BY like_count DESC';
                break;
            }
            case 'rating': {
                ORDER_BY = 'ORDER BY rating DESC';
                break;
            }
            default: {
                throw new Error("Something went wrong getting the article previews. ");
            }
        }
        var attributes = '';
        if (typ === "blog_id" || typ === "note_id" || typ === "idea_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, ${TABLE}.title AS title, ${TABLE}.description AS description, ${TABLE}.active_v AS active_v, ${TABLE}.image AS image, '${TABLE}' AS article_type `;
            WHERE = `WHERE ${TABLE}.active_v IS NOT NULL`;
        }
        else if (typ === "wikipedia_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.topic_name AS title, ${TABLE}.what_interested_you AS description, ${TABLE}.date_created AS date_created, ${TABLE}.date_submitted AS last_edited, ${TABLE}.topic_image AS image,  'wikipedia' AS article_type `;
            WHERE = `WHERE ${TABLE}.submitted=true`;
        }
        else if (typ === "jupyter_notebooks_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.date_created AS date_created, ${TABLE}.description AS description, ${TABLE}.image_url AS image, ${TABLE}.title AS title,  'jupyter_notebook' AS article_type `;
            WHERE = `WHERE true`;
        }
        else if (typ === "markdown_notes_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, ${TABLE}.description AS description, ${TABLE}.image_url AS image, ${TABLE}.title AS title, 'markdown_note' AS article_type `;
            WHERE = `WHERE ${TABLE}.published=true`;
        }
        else if (typ === "tex_notes_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.date_added AS date_created, ${TABLE}.date_completed AS last_edited, ${TABLE}.note_description AS description, ${TABLE}.note_image AS image, ${TABLE}.note_title AS title, 'tex_note' AS article_type `;
            WHERE = `WHERE ${TABLE}.date_completed IS NOT NULL`;
        }
        else if (typ === "goodreads_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.title AS title, ${TABLE}.description AS description,${TABLE}.image AS image, ${TABLE}.rating AS rating, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, 'goodreads' AS article_type `;
        }
        else if (typ === "letterboxd_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.title AS title, ${TABLE}.description AS description,${TABLE}.image AS image, ${TABLE}.rating AS rating, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, 'letterboxd' AS article_type `;
        }
        else if (typ === "game_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.title AS title, ${TABLE}.description AS description, ${TABLE}.image AS image, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, 'games' AS article_type `;
        }
        else if (typ === "design_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.title AS title, ${TABLE}.description AS description,${TABLE}.image AS image, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, 'designs_3d' AS article_type `;
        }
        else if (typ === "electronics_id") {
            attributes += `${TABLE}.id AS id, ${TABLE}.title AS title, ${TABLE}.description AS description,${TABLE}.image AS image, ${TABLE}.date_created AS date_created, ${TABLE}.last_edited AS last_edited, 'electronics' AS article_type `;
        }
        str += ` SELECT ${attributes}, COALESCE(article_views_info.view_count,0) AS view_count, COALESCE(article_likes_info.like_count,0) AS like_count, COALESCE(article_comment_info.comment_count,0) AS comment_count${HAS_ANNOTATION ? `, COALESCE(article_annotation_info.annotation_count,0) AS annotation_count` : ``}  FROM ${TABLE} 
    LEFT JOIN article_views_info ON article_views_info.${typ}=${TABLE}.id 
    LEFT JOIN article_likes_info ON article_likes_info.${typ}=${TABLE}.id 
    LEFT JOIN article_comment_info ON article_comment_info.${typ}=${TABLE}.id 
    ${HAS_ANNOTATION ? `LEFT JOIN article_annotation_info ON article_annotation_info.${typ}=${TABLE}.id ` : ``}
    ${WHERE}
    ${ORDER_BY};`;
        const dbResp = await (0, database_1.default)().query(str);
        const rows = dbResp.rows;
        if (!!!rows || !!!rows.length) {
            return { str: (0, html_1.getWarningAlert)("There are no article previews to show.", undefined, false), toc: [] };
        }
        else {
            var ret_str = '';
            if (gro_by_month) {
                const toc = [];
                var curr_month_year = (order_by === "date-created-new" || order_by === "date-created-old") ? TIME.getMonthYearFromUnix(String(rows[0].date_created), ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York') : TIME.getMonthYearFromUnix(String(rows[0].last_edited), ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York');
                var curr_id = 'month_'.concat(crypto.randomUUID());
                ret_str += `<section id="${curr_id}" class="mt-2">
  <h3 class="bold bb-thick h3 navbar-sticky-transition" style="position: sticky; top: var(--navbar-height); opacity:1; z-index: 5; background-color: var(--background); padding: 3px 0px;">
    <a href="#${curr_id}" class="same-page bold">
      ${curr_month_year}
    </a>
  </h3>
  <div class="mt-2">
`;
                toc.push({ id: curr_id, text: curr_month_year });
                for (let row of rows) {
                    var url = '';
                    switch (row.article_type) {
                        case 'note': {
                            url = `/note/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'blog': {
                            url = `/blog/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'idea': {
                            url = `/idea/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'wikipedia': {
                            url = `/daily-reading/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'jupyter_notebook': {
                            url = `/jupyter-notebooks/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'markdown_note': {
                            url = `/markdown-notes/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'tex_note': {
                            url = `/tex-notes/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'goodreads': {
                            url = `/goodreads/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'letterboxd': {
                            url = `/letterboxd/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'games': {
                            url = `/games/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'designs_3d': {
                            url = `/3d-designs/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'electronics': {
                            url = `/electronics-robotics/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        default: {
                            throw new Error("Unrecognized article_type when getting article previews.");
                        }
                    }
                    const month_year = (order_by === "date-created-new" || order_by === "date-created-old") ? TIME.getMonthYearFromUnix(String(row.date_created), ((_c = req.session.settings) === null || _c === void 0 ? void 0 : _c.timezone) || 'America/New_York') : TIME.getMonthYearFromUnix(String(row.last_edited), ((_d = req.session.settings) === null || _d === void 0 ? void 0 : _d.timezone) || 'America/New_York');
                    if (month_year === curr_month_year) {
                        ret_str += renderArticlePreviewNew(url, !!!((_e = req.session.device) === null || _e === void 0 ? void 0 : _e.desktop), row, ((_f = req.session.settings) === null || _f === void 0 ? void 0 : _f.timezone) || 'America/New_York');
                    }
                    else {
                        curr_month_year = month_year;
                        curr_id = 'month_'.concat(crypto.randomUUID());
                        toc.push({ id: curr_id, text: curr_month_year });
                        ret_str += `</div></section>`;
                        ret_str += `<section id="${curr_id}" class="mt-2">
  <h3 class="bold bb-thick h3 navbar-sticky-transition" style="position: sticky; top: var(--navbar-height); opacity:1; z-index: 5; background-color: var(--background); padding: 3px 0px;">
    <a href="#${curr_id}" class="same-page bold" >
      ${curr_month_year}
    </a>
  </h3>
  <div class="mt-2">`;
                        ret_str += renderArticlePreviewNew(url, !!!((_g = req.session.device) === null || _g === void 0 ? void 0 : _g.desktop), row, ((_h = req.session.settings) === null || _h === void 0 ? void 0 : _h.timezone) || 'America/New_York');
                    }
                }
                ret_str += `</div></section>`;
                return { str: ret_str, toc: toc };
            }
            else {
                for (let row of rows) {
                    var url = '';
                    switch (row.article_type) {
                        case 'note': {
                            url = `/note/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'blog': {
                            url = `/blog/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'idea': {
                            url = `/idea/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}?version=${encodeURIComponent(String(row.active_v))}`;
                            break;
                        }
                        case 'wikipedia': {
                            url = `/daily-reading/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'jupyter_notebook': {
                            url = `/jupyter-notebooks/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'markdown_note': {
                            url = `/markdown-notes/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'tex_note': {
                            url = `/tex-notes/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'goodreads': {
                            url = `/goodreads/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'letterboxd': {
                            url = `/letterboxd/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'games': {
                            url = `/games/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        case 'designs_3d': {
                            url = `/3d-designs/${encodeURIComponent(String(row.id))}/${encodeURIComponent(String(row.title))}`;
                            break;
                        }
                        default: {
                            throw new Error("Unrecognized article_type when getting article previews.");
                        }
                    }
                    ret_str += renderArticlePreviewNew(url, !!!((_j = req.session.device) === null || _j === void 0 ? void 0 : _j.desktop), row, ((_k = req.session.settings) === null || _k === void 0 ? void 0 : _k.timezone) || 'America/New_York');
                }
                return { str: ret_str, toc: [] };
            }
        }
    }
    catch (e) {
        console.error(e);
        return { str: (0, html_1.getErrorAlert)("Something went wrong getting the article previews.", undefined, false), toc: [] };
    }
}
exports.GET_ARTICLE_PREVIEWS = GET_ARTICLE_PREVIEWS;
function renderDiaryPreview(obj, req) {
    var _a;
    const { date_created, last_edited, title, description, type, image, admin, id } = obj;
    const path = `${admin ? '/admin' : ''}/${type}/${id}/${encodeURIComponent(title || 'Placeholder Title')}`;
    const dateCreatedString = TIME.getFullDateStringFromUnix(date_created);
    const lastEditedString = last_edited ? TIME.getFullDateStringFromUnix(last_edited) : undefined;
    ;
    const second_string = `${lastEditedString ? /*html*/ `
    <div class="flex-row gap-3 align-center">
      <time data-popover data-pelem="#last-edit-tool" data-mouse data-date-format="MM/DD/YYYY" class="small" datetime="${lastEditedString}">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
        <span></span>
      </time>
    </div>
    ` : ''}
`;
    return renderArticleComponentLink({ link: true, path, phone: Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)), src: image || undefined, alt: title, title, description, date_created: dateCreatedString, second_string });
}
exports.renderDiaryPreview = renderDiaryPreview;
function renderArticlePreview(obj, req) {
    var _a;
    const { date_created, last_edited, title, description, type, image, id, admin, active_v, highest_v } = obj;
    const path = `${admin ? '/admin' : ''}/${type}${admin ? '/edit' : ''}/${id}/${encodeURIComponent(title || 'Placeholder Title')}${admin ? `?active_v=${active_v ? active_v : highest_v}` : ''}`;
    const dateCreatedString = TIME.getFullDateStringFromUnix(Number(date_created));
    const lastEditedString = last_edited ? TIME.getFullDateStringFromUnix(Number(last_edited)) : undefined;
    const published = Boolean(active_v !== null);
    if (!!!admin && !!!published)
        return '';
    const second_string = `${lastEditedString ? /*html*/ `
    <div class="flex-row gap-3 align-center">
      <time data-popover data-pelem="#last-edit-tool" data-mouse data-date-format="MM/DD/YYYY" class="small" datetime="${lastEditedString}">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
        <span></span>
      </time>
      ${admin ? published ? `<span class="bold t-success">PUBLISHED</span>` : `<span class="bold t-error">NOT PUBLISHED</span>` : ''}
    </div>
    ` : ''}
`;
    return renderArticleComponentLink({ link: true, path, phone: Boolean(!!!((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)), src: image || undefined, alt: title, title, description, date_created: dateCreatedString, second_string });
}
exports.renderArticlePreview = renderArticlePreview;
function renderMarkdownPreview(obj) {
    const path = `/markdown-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
    const date_created = TIME.getDateTimeStringFromUnix(parseInt(obj.date_created));
    const last_edited = TIME.getDateTimeStringFromUnix(parseInt(obj.last_edited));
    const second_string = `<time data-popover data-pelem="#last-edit-tool" data-mouse data-date-format="MM/DD/YYYY" class="small" datetime="${last_edited}">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
  <span></span>
</time>`;
    return renderArticleComponentLink({
        link: true,
        path: path,
        phone: obj.phone,
        alt: obj.title,
        title: obj.title,
        description: obj.description,
        date_created,
        second_string,
        src: obj.image || undefined
    });
}
exports.renderMarkdownPreview = renderMarkdownPreview;
function renderEditMarkdownNotePreview(obj) {
    const path = `/projects/markdown-to-html?note=${encodeURIComponent(obj.id)}`;
    const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_created));
    const second_string = obj.published ? /*html*/ `<span class="t-success bold body1">PUBLISHED</span>` : /*html*/ `<span class="t-error bold body1">NOT PUBLISHED</span>`;
    return renderArticleComponentLink({
        link: true,
        path,
        phone: obj.phone,
        title: obj.title,
        description: obj.description,
        date_created,
        second_string,
        alt: obj.title,
        src: obj.image || undefined
    });
}
exports.renderEditMarkdownNotePreview = renderEditMarkdownNotePreview;
function renderJupyterPreview(obj) {
    return renderArticleComponentLink({
        link: true,
        path: obj.path,
        phone: obj.phone,
        alt: obj.title,
        title: obj.title,
        description: obj.description,
        date_created: obj.date_created,
        src: obj.image
    });
}
exports.renderJupyterPreview = renderJupyterPreview;
function renderDailyReadingCompletedPreview(obj) {
    const path = `/daily-reading/${obj.id}/${encodeURIComponent(obj.topic_name)}`;
    const date_created = TIME.getDateTimeStringFromUnix(obj.date_submitted);
    const title = obj.topic_name;
    const image = obj.topic_image;
    const description = obj.what_interested_you;
    return renderArticleComponentLink({
        link: true,
        path,
        phone: obj.phone,
        src: image,
        title,
        description,
        date_created,
        alt: title
    });
}
exports.renderDailyReadingCompletedPreview = renderDailyReadingCompletedPreview;
function renderDailyReadingToDoPreview(obj) {
    const second_string = `<span class="body1 bold">ID: ${Number(obj.id)}</span>`;
    const date_created = TIME.getDateTimeStringFromUnix(obj.date_created);
    const title = obj.topic_name;
    const image = obj.topic_image;
    const description = obj.what_interested_you;
    return renderArticleComponentLink({
        link: false,
        phone: obj.phone,
        src: image,
        title,
        description,
        date_created,
        alt: title,
        second_string
    });
}
exports.renderDailyReadingToDoPreview = renderDailyReadingToDoPreview;
/**
 * Render the links throughout this site
 * @param obj
 * @returns
 */
function renderArticleComponentLink(obj) {
    return ejs_1.default.render(ejsTemplate, obj);
}
exports.renderArticleComponentLink = renderArticleComponentLink;
function renderTexNotePreview(req, obj) {
    var _a;
    var path = '';
    const IS_ADMIN = Number((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) >= 3;
    if (obj.published)
        path = `/tex-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.note_title)}`;
    const date_created = TIME.getDateTimeStringFromUnix(Number(obj.date_added));
    const second_string = obj.published ? `<time data-popover data-pelem="#last-edit-tool" data-mouse data-date-format="MM/DD/YYYY" class="small" datetime="${TIME.getDateTimeStringFromUnix(Number(obj.date_completed))}">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Create"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
  <span></span>
</time>` : `<span class="bold">ID: ${(0, escape_html_1.default)(obj.id.toString())}</span>`;
    const ejsTemplateTeXNote = /*html*/ `<%if(locals.published){%>
    <a hx-push-url="true" class="preview-article" href="<%=locals.path%>" hx-get="<%=locals.path%>" hx-target="#PAGE" hx-indicator="#page-transition-progress">
          <div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
              <img src="<%=locals.note_image%>" alt="<%locals.note_title%>" style="width: 100px;height: 100px; margin: 0px; object-fit: contain; background-color: black; align-self: center;" width="100" height="100" />
          </div>
            <div class="p-md flex-column justify-start align-start grow-1" style="paddding-bottom: 0px;">
                <p class="h6 bold w-100">
                    <%=locals.note_title%>
                </p>
                <p class="body1 w-100">
                    <%=locals.note_description.length > 150 ? locals.note_description.slice(0,150).concat('...') : locals.note_description%>
                </p>
                <div class="flex-row w-100 align-center justify-between">
                  <%for(let i = 0; i < locals.flairs.length; i++){%>
                    <span style="color: <%-locals.flairs[i].color%>; background-color: <%-locals.flairs[i].background_color%>; padding: 1px 2px; border-radius: 3px;" class="body2"><%=locals.flairs[i].text%></span>
                  <%}%>
                    <%if(locals.second_string){%>
                        <%-locals.second_string%>
                    <%}%>
                </div>
            </div>
        </a>
  <%}else{%>
    <div class="preview-article">
    <div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
              <img src="<%=locals.note_image%>" alt="<%locals.note_title%>" style="width: 100px;height: 100px; margin: 0px; object-fit: contain; background-color: black; align-self: center;" width="100" height="100" />
          </div>
            <div class="p-md flex-column justify-start align-start grow-1" style="paddding-bottom: 0px;">
                <p class="h6 bold w-100">
                    <%=locals.note_title%>
                </p>
                <p>
                  <a class="secondary link caption" target="_blank" href="<%=locals.note_resource_link%>"><%=locals.note_resource_link_title%></a>
                </p>
                <p class="body2 w-100">
                    <%=locals.note_description.length > 150 ? locals.note_description.slice(0,150).concat('...') : locals.note_description%>
                </p>
                <div class="flex-row w-100 align-center justify-between mt-1">
                    ${IS_ADMIN ? `<time data-popover data-pelem="#date-created-tool" data-mouse data-date-format="MM/DD/YYYY"class="small" datetime="<%=locals.date_created%>">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
                          <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
                          </path>
                      </svg>
                      <span></span>
                    </time>
                    <%if(locals.second_string){%>
                        <%-locals.second_string%>
                    <%}%>
                    ` : ``}
                </div>
            </div>
           
        </div>
  <%}%>`;
    return ejs_1.default.render(ejsTemplateTeXNote, { ...obj, date_created, second_string, path });
}
exports.renderTexNotePreview = renderTexNotePreview;
