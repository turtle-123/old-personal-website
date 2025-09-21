"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderExampleLexical = exports.getArticleBuilder3RenderObj = exports.getFullLexicalRenderObj = exports.renderLexicalArticleBuilder2 = exports.renderLexicalArticleBuilder1 = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const ejs_1 = __importDefault(require("ejs"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const DEFAULT_SETTINGS_1 = __importDefault(require("../../CONSTANTS/DEFAULT_SETTINGS"));
const IS_DEVELOPMENT_1 = __importDefault(require("../../CONSTANTS/IS_DEVELOPMENT"));
const settingsHandler_1 = require("./settingsHandler");
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const lexical_1 = require("../../lexical");
const html_1 = require("../html");
const html_escaper_1 = require("html-escaper");
const ArticleBuilder1 = node_fs_1.default.readFileSync(node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'views', 'lexical', 'rich-text-editor-article-builder.ejs'), { encoding: 'utf-8' });
const ArticleBuilder2 = node_fs_1.default.readFileSync(node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'views', 'lexical', 'rich-text-editor-article-builder-2.ejs'), { encoding: 'utf-8' });
function renderLexicalArticleBuilder1(req) {
    const rand = node_crypto_1.default.randomUUID();
    const renderObj = {
        layout: false,
        "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
        "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
        "font_family_lexical": 'font_family_lexical_'.concat(rand),
        "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
        "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
        "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
        "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
        "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
        "highlight-lexical": 'highlight-lexical_'.concat(rand),
        "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
        "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
        "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
        "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
        "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
        "font_size_lexical": 'font_size_lexical_'.concat(rand),
        "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
        "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
        "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
        "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
        "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
        "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
        "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
        "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
        "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
        "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
        "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
        "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
        "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
        "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
        "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
        "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
        "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
        "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
        "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
        "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
        "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
        "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
        'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
        'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
        'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
        ...getRequiredVariablesPartial(req)
    };
    const str = ejs_1.default.render(ArticleBuilder1, renderObj);
    return str;
}
exports.renderLexicalArticleBuilder1 = renderLexicalArticleBuilder1;
function renderLexicalArticleBuilder2(req) {
    const rand = node_crypto_1.default.randomUUID();
    const renderObj = {
        layout: false,
        'random-id': 'random-id_'.concat(rand),
        'random-heading': 'random_heading_'.concat(rand),
        "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
        "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
        "font_family_lexical": 'font_family_lexical_'.concat(rand),
        "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
        "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
        "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
        "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
        "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
        "highlight-lexical": 'highlight-lexical_'.concat(rand),
        "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
        "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
        "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
        "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
        "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
        "font_size_lexical": 'font_size_lexical_'.concat(rand),
        "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
        "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
        "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
        "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
        "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
        "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
        "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
        "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
        "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
        "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
        "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
        "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
        "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
        "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
        "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
        "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
        "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
        "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
        "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
        "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
        "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
        "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
        'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
        'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
        'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
        ...getRequiredVariablesPartial(req)
    };
    const str = ejs_1.default.render(ArticleBuilder2, renderObj);
    return str;
}
exports.renderLexicalArticleBuilder2 = renderLexicalArticleBuilder2;
function getFullLexicalRenderObj() {
    const rand = node_crypto_1.default.randomUUID();
    return {
        "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
        "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
        "font_family_lexical": 'font_family_lexical_'.concat(rand),
        "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
        "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
        "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
        "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
        "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
        "highlight-lexical": 'highlight-lexical_'.concat(rand),
        "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
        "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
        "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
        "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
        "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
        "font_size_lexical": 'font_size_lexical_'.concat(rand),
        "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
        "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
        "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
        "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
        "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
        "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
        "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
        "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
        "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
        "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
        "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
        "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
        "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
        "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
        "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
        "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
        "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
        "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
        "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
        "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
        "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
        "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
        'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
        'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
        'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
        'lexical-wrapper': 'lexical_wrapper_'.concat(rand)
    };
}
exports.getFullLexicalRenderObj = getFullLexicalRenderObj;
function getArticleBuilder3RenderObj({ hxPost, loading, target, id }) {
    const rand = node_crypto_1.default.randomUUID();
    return {
        'random-id': 'random-id_'.concat(rand),
        'random-heading': 'random_heading_'.concat(rand),
        "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
        "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
        "font_family_lexical": 'font_family_lexical_'.concat(rand),
        "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
        "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
        "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
        "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
        "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
        "highlight-lexical": 'highlight-lexical_'.concat(rand),
        "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
        "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
        "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
        "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
        "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
        "font_size_lexical": 'font_size_lexical_'.concat(rand),
        "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
        "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
        "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
        "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
        "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
        "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
        "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
        "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
        "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
        "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
        "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
        "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
        "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
        "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
        "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
        "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
        "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
        "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
        "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
        "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
        "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
        "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
        'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
        'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
        'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
        "form-id": "form_".concat(rand),
        "article-title": "article_title_".concat(rand),
        "mobile-preview-button": "mpb_".concat(rand),
        "tablet-preview-button": "tpb_".concat(rand),
        "desktop-preview-button": "dpb_".concat(rand),
        'lexical-wrapper': id ? id : 'lexical_wrapper_'.concat(rand),
        hxPost: hxPost ? 'hx-post="'.concat(hxPost).concat('"') : undefined,
        loading: loading ? 'data-loading="'.concat(loading).concat('"') : undefined,
        target: target ? 'hx-target="'.concat(target).concat('"') : undefined,
    };
}
exports.getArticleBuilder3RenderObj = getArticleBuilder3RenderObj;
function getLexical(req, res) {
    const { type, other } = req.params;
    const rand = node_crypto_1.default.randomUUID();
    if (type === "classic" || type === "poll-description") {
        var view = '';
        if (type === "classic")
            view = 'lexical/rich-text-editor-full';
        else if (type === "poll-description")
            view = 'lexical/rich-text-editor-poll-description';
        const renderObj = {
            layout: false,
            "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
            "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
            "font_family_lexical": 'font_family_lexical_'.concat(rand),
            "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
            "highlight-lexical": 'highlight-lexical_'.concat(rand),
            "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
            "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
            "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
            "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
            "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
            "font_size_lexical": 'font_size_lexical_'.concat(rand),
            "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
            "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
            "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
            "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
            "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
            "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
            "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
            "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
            "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
            "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
            "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
            "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
            "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
            "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
            "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
            "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
            "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
            "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
            "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
            "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
            "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
            "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
            'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            'lexical-wrapper': 'lexical_wrapper_'.concat(Math.random().toString().slice(2)),
            ...getRequiredVariablesPartial(req)
        };
        return res.render(view, renderObj);
    }
    else if (type === "article-builder") {
        const renderObj = {
            layout: false,
            "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
            "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
            "font_family_lexical": 'font_family_lexical_'.concat(rand),
            "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
            "highlight-lexical": 'highlight-lexical_'.concat(rand),
            "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
            "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
            "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
            "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
            "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
            "font_size_lexical": 'font_size_lexical_'.concat(rand),
            "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
            "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
            "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
            "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
            "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
            "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
            "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
            "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
            "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
            "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
            "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
            "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
            "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
            "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
            "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
            "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
            "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
            "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
            "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
            "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
            "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
            "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
            'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            ...getRequiredVariablesPartial(req)
        };
        return res.render('lexical/rich-text-editor-article-builder', renderObj);
    }
    else if (type === "article-builder-2") {
        const renderObj = {
            layout: false,
            'random-id': 'random-id_'.concat(rand),
            'random-heading': 'random_heading_'.concat(rand),
            "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
            "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
            "font_family_lexical": 'font_family_lexical_'.concat(rand),
            "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
            "highlight-lexical": 'highlight-lexical_'.concat(rand),
            "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
            "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
            "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
            "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
            "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
            "font_size_lexical": 'font_size_lexical_'.concat(rand),
            "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
            "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
            "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
            "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
            "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
            "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
            "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
            "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
            "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
            "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
            "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
            "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
            "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
            "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
            "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
            "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
            "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
            "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
            "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
            "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
            "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
            "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
            'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            ...getRequiredVariablesPartial(req)
        };
        return res.render('lexical/rich-text-editor-article-builder-2', renderObj);
    }
    else if (type === "poll-question") {
        const renderObj = {
            layout: false,
            'random-id': 'question_'.concat(rand),
            'wrapper-id': 'lexical-wrapper_'.concat(rand),
            'question-type-dropdown': 'question-type-dropdown_'.concat(rand),
            'question-type-input': 'question-type-input_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-background-color-transparent-2': 'lex-background-color-transparent-2_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            'lex-text-color-transparent-2': 'lex-text-color-transparent-2_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
            "new-question-indicator": "new-question-indicator_".concat(rand),
            'poll-required-checkbox': 'poll-required-checkbox_'.concat(rand),
            'example-response-id': 'example-response-id_'.concat(rand),
            'example-option-id': 'example-option-id_'.concat(rand),
            'example-input-name': 'example-input-name_'.concat(rand),
            ...getRequiredVariablesPartial(req),
        };
        return res.render('lexical/rich-text-editor-poll-wrapper', renderObj);
    }
    else if (type === "poll-option") {
        const renderObj = {
            /* @ts-ignore */
            layout: false,
            'example-option-id': 'example-option-id_'.concat(rand),
            'example-input-name': 'example-input-name_'.concat(rand),
            'example-response-id': 'example-response-id_'.concat(rand),
            'poll-required-checkbox': 'poll-required-checkbox_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-background-color-transparent-2': 'lex-background-color-transparent-2_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            'lex-text-color-transparent-2': 'lex-text-color-transparent-2_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
        };
        if (other === "multiple-choice") {
            renderObj.optionType = "multiple-choice";
            return res.status(200).render('lexical/rich-text-editor-poll-option', renderObj);
        }
        else if (other === "checkbox") {
            renderObj.optionType = "checkbox";
            return res.status(200).send('');
        }
        else {
            return res.status(200).send('');
        }
    }
    else if (type === "article-builder-3") {
        const renderObj = {
            layout: false,
            'random-id': 'random-id_'.concat(rand),
            'random-heading': 'random_heading_'.concat(rand),
            "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
            "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
            "font_family_lexical": 'font_family_lexical_'.concat(rand),
            "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
            "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
            "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
            "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
            "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
            "highlight-lexical": 'highlight-lexical_'.concat(rand),
            "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
            "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
            "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
            "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
            "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
            "font_size_lexical": 'font_size_lexical_'.concat(rand),
            "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
            "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
            "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
            "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
            "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
            "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
            "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
            "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
            "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
            "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
            "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
            "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
            "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
            "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
            "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
            "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
            "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
            "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
            "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
            "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
            "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
            "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
            'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
            'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
            'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
            'lexical-wrapper': 'lexical_wrapper_'.concat(rand),
            ...getRequiredVariablesPartial(req)
        };
        return res.render('lexical/rich-text-editor-article-builder-3', renderObj);
    }
}
exports.default = getLexical;
/**
 * Get Required variables that are usually used for rendering full pages
 * for rendering partials
 * @param req
 * @returns
 */
function getRequiredVariablesPartial(req) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var snackbarMessage = undefined;
    if (((_a = req.session.snackbarMessage) === null || _a === void 0 ? void 0 : _a.showMessage) === true) {
        snackbarMessage = req.session.snackbarMessage.message;
        req.session.snackbarMessage.showMessage = false;
    }
    return {
        phone: ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.device) === null || _c === void 0 ? void 0 : _c.phone) || false,
        tablet: ((_e = (_d = req.session) === null || _d === void 0 ? void 0 : _d.device) === null || _e === void 0 ? void 0 : _e.tablet) || false,
        desktop: ((_g = (_f = req.session) === null || _f === void 0 ? void 0 : _f.device) === null || _g === void 0 ? void 0 : _g.desktop) || false,
        fullPageRequest: (0, frontendHelper_1.fullPageRequest)(req),
        pageRequest: (0, frontendHelper_1.pageRequest)(req),
        subPageRequest: (0, frontendHelper_1.subPageRequest)(req),
        development: IS_DEVELOPMENT_1.default,
        settings: req.session.settings || structuredClone(DEFAULT_SETTINGS_1.default),
        navbarColor: (0, settingsHandler_1.getNavbarColor)((_h = req.session) === null || _h === void 0 ? void 0 : _h.settings),
        jsNonce: String(req.session.jsNonce),
        snackbarMessage,
        showedBanner: Boolean(((_k = (_j = req === null || req === void 0 ? void 0 : req.session) === null || _j === void 0 ? void 0 : _j.cookiePreferences) === null || _k === void 0 ? void 0 : _k.showedBanner) === true),
        cookieStatistics: Boolean(((_l = req.session.cookiePreferences) === null || _l === void 0 ? void 0 : _l.statistics) === true),
        spellcheck: Boolean(((_m = req.session.settings) === null || _m === void 0 ? void 0 : _m.spellcheck) === true),
        settingsMode: Boolean(((_p = (_o = req.session) === null || _o === void 0 ? void 0 : _o.settings) === null || _p === void 0 ? void 0 : _p.mode) === "light") ? "lightMode" : "darkMode",
        auth: Number((_q = req.session.auth) === null || _q === void 0 ? void 0 : _q.level),
        csrf_token: String(req.session.csrf_token)
    };
}
async function renderExampleLexical(req, res) {
    try {
        const getHTML = (obj) => {
            var _a, _b;
            if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) {
                return obj.desktop_html;
            }
            else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) {
                return obj.tablet_html;
            }
            else {
                return obj.mobile_html;
            }
        };
        const randomUUID = node_crypto_1.default.randomUUID();
        const lexicalState = JSON.parse(req.body['lexical_example_editor']);
        const resp = await (0, lexical_1.parseFullLexicalEditor)(lexicalState);
        const html = getHTML(resp);
        const desktop_html = resp.desktop_html;
        const tablet_html = resp.tablet_html;
        const mobile_html = resp.mobile_html;
        const s = JSON.stringify(lexicalState, null, ' ');
        return res.status(200).send(`<div class="lexical-wrapper example-render hz-scroll" data-display-only style="padding: 0px;" data-rich-text-editor data-type="full" data-editable="false" id="${randomUUID}">${html}</div>
<details aria-label="JSON Lexical State" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">JSON Lexical State</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code >
<pre  style="font-family: monospace;">
${s}
</pre>
</code> 
</div>
</details>

<details aria-label="Desktop HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Desktop HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${(0, html_escaper_1.escape)(desktop_html)}
</pre>
</code> 
</div>
</details>

<details aria-label="Tablet HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Tablet HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${(0, html_escaper_1.escape)(tablet_html)} 
</pre>
</code> 
</div>
</details>

<details aria-label="Mobile HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Mobile HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${(0, html_escaper_1.escape)(mobile_html)}
</pre>
</code> 
</div>
</details>
    `);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorSnackbar)('Something went wrong getting the lexical state!'));
    }
}
exports.renderExampleLexical = renderExampleLexical;
