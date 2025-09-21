"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderArticlePreview = exports.renderDiaryPreview = exports.getArticleForm = exports.renderArticlesMonthYears = void 0;
const ejs_1 = __importDefault(require("ejs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const ejsTemplate = `<section id="<%=locals.temp_id%>" class="mt-4 block" style="width: 100%;">
    <h2 class="bold bb-thick h2 navbar-sticky-transition" style="position: sticky; top: var(--navbar-height); opacity:1; z-index: 5; background-color: var(--background); padding: 3px 0px;">
      <a href="#<%=locals.temp_id%>" class="same-page bold">
        <%=locals.monthYear%>
      </a>
    </h2>
    <div class="mt-2">
      <%-locals.innerHTML%>
    </div>
</section>`;
function renderArticlesMonthYears(arr1) {
    if (arr1.length === 0) {
        return { str: '', tableOfContents: [] };
    }
    else {
        let currMonth = '';
        let iter = 0;
        let arriter = -1;
        const arr = [];
        while (iter < arr1.length) {
            if (arr1[iter].monthYear !== currMonth) {
                arr.push({ monthYear: arr1[iter].monthYear, innerHTML: arr1[iter].str });
                arriter += 1;
                currMonth = arr1[iter].monthYear;
            }
            else {
                arr[arriter].innerHTML = arr[arriter].innerHTML + arr1[iter].str;
            }
            iter += 1;
        }
        var finalStr = '';
        var tableOfContents = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].innerHTML.length) {
                let temp_id = 'month_'.concat(node_crypto_1.default.randomUUID());
                finalStr += ejs_1.default.render(ejsTemplate, {
                    temp_id,
                    monthYear: arr[i].monthYear,
                    innerHTML: arr[i].innerHTML
                });
                tableOfContents.push({ id: temp_id, text: arr[i].monthYear });
            }
        }
        return { str: finalStr, tableOfContents: tableOfContents };
    }
}
exports.renderArticlesMonthYears = renderArticlesMonthYears;
var getEditArticleForm_1 = require("./article_helpers/getEditArticleForm");
Object.defineProperty(exports, "getArticleForm", { enumerable: true, get: function () { return getEditArticleForm_1.getArticleForm; } });
var handleArticlePreview_1 = require("./article_helpers/handleArticlePreview");
Object.defineProperty(exports, "renderDiaryPreview", { enumerable: true, get: function () { return handleArticlePreview_1.renderDiaryPreview; } });
Object.defineProperty(exports, "renderArticlePreview", { enumerable: true, get: function () { return handleArticlePreview_1.renderArticlePreview; } });
