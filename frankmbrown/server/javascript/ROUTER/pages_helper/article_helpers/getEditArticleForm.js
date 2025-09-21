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
exports.getArticleForm = void 0;
const NUMBER = __importStar(require("../../../utils/number"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const lexicalImplementations_1 = require("../lexicalImplementations");
function getArticleVersionSelect({ current_v, versions, rand, type, id, title }) {
    const selectInputLabel = 'article_version_'.concat(rand);
    const selectDropdown = 'art_v_d'.concat(rand);
    const canDelete = Boolean(versions.length !== 1);
    var optionsStr = '';
    for (let v of versions) {
        optionsStr += /*html*/ `<button type="button" tabindex="-1" class="select-option" role="option" aria-selected="${v === current_v}" data-val="${v}"
    hx-get="/admin/${type}/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}?active_v=${v}" hx-push-url="true" hx-target="#PAGE"
    hx-swap="innerHTML" hx-trigger="mousedown, touchstart"
    hx-indicator="#reloading-article-form-indicator"
    >
    ${v}
  </button>
    `;
    }
    return /*html*/ `
<div class="flex-column w-100 align-center justify-start">
<div class="body1 mt-2" id="${selectInputLabel}">Version:</div>
  <div class="select mt-1 flex-row justify-start align-center gap-3">
    <button type="button" role="combobox" aria-haspopup="listbox" aria-controls="${selectDropdown}" aria-labelledby="${selectInputLabel}" class="select" data-popover="" data-pelem="#${selectDropdown}" data-click="" aria-expanded="false">
      <span class="body1 grow-1 justify-start" style="min-width:100px;">${current_v}</span>
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
    </button>
    <div tabindex="0" id="${selectDropdown}" role="listbox" class="select-menu o-xs" data-placement="bottom" >
      <input data-article-version type="text" hidden="" value="${current_v}" name="article-version" id="article-version">
      ${optionsStr}
    </div>

    <button class="icon-text medium filled primary" aria-label="Add Version" hx-trigger="click" hx-get="/admin/${type}/add-version/${id}/${encodeURIComponent(title || 'Placeholder Title')}?active_v=${current_v}" hx-target="#PAGE"
    hx-swap="beforebegin" hx-indicator="#reloading-article-form-indicator">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
      ADD VERSION
    </button>
    ${canDelete ? /*html*/ `
    <button class="icon-text medium filled error" aria-label="Delete Version" hx-delete="/admin/${type}/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}?active_v=${current_v}"
    hx-target="#PAGE"
    hx-swap="innerHTML" hx-indicator="#reloading-article-form-indicator"
    >
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
      DELETE VERSION
    </button>
    ` : /*html*/ ``}
  </div>
</div>
`;
}
/**
 * Get the article form
 * @param param0
 * @returns
 */
function getArticleForm(req, { innerHTML, id, title, description, image, current_v, versions, type, desktop }) {
    const rand = node_crypto_1.default.randomUUID();
    const imageUrlUpload = 'image_url_'.concat(rand);
    const audioUrlUpload = 'audio_url_'.concat(rand);
    const videoUrlUpload = 'video_url_'.concat(rand);
    var selectStr = '';
    var deleteArticle = '';
    if (type !== "diary") {
        if (NUMBER.isValidInteger(current_v) && versions.length >= 1 && NUMBER.isValidInteger(id))
            selectStr = getArticleVersionSelect({ current_v, versions, rand, type, id, title });
        if (!!id)
            deleteArticle = /*html*/ `<div class="flex-row w-100 mt-2 justify-center align-center" style="padding-top:6px; border-top:1px solid var(--divider);">
      <button hx-delete="${`/admin/${type}/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}`}" hx-target="#PAGE" hx-swap="innerHTML" hx-indicator="#reloading-article-form-indicator" type="button" class="error filled icon-text small">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
        DELETE ${type.toUpperCase()}
      </button>
    </div>`;
    }
    var imageData = '';
    if (image) {
        imageData = encodeURIComponent(JSON.stringify([{ src: image, shortDescription: title, longDescription: description }]));
    }
    var formDataAttributes = '';
    if (type === "diary") {
        formDataAttributes = `data-hx-post="/admin/diary/${id}"
    data-loading="Saving diary entry..."
    data-article
    class="mt-2"
    data-hx-target="this"
    data-hx-swap="afterend"
    id="article" 
    style="display: block; position: relative;"`;
    }
    else {
        const hxPost = (id && current_v) ? `/admin/${type}/edit/${id}/${encodeURIComponent(title || 'Placeholder Title')}?active_v=${current_v}` : `/admin/${type}`;
        const formTarget = !!!id ? `data-hx-target="#PAGE" data-hx-swap="beforebegin"` : '';
        formDataAttributes = `data-hx-post="${hxPost}"
    data-loading="Saving ${type} entry..."
    data-article
    class="mt-2"
    ${formTarget}
    id="article" 
    style="display: block; position: relative;"
    `;
    }
    const articleBuilderLexical = (0, lexicalImplementations_1.getArticleBuilderImplementation)(req, "article-body", innerHTML);
    const str = /*html*/ `<div data-warn-form-progress="article" hidden></div>
  <form ${formDataAttributes}>
  <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="true">
    <label for="article-title">Article Title*:</label>
    <div class="text-input block medium">
        <input 
        type="text" 
        id="article-title"
        name="article-title"
        class="medium icon-before mt-1" 
        required
        placeholder="Enter the article title..." 
        maxlength="100"
        minlength="1" 
        spellcheck="true" 
        autocapitalize="on"
        value="${title}"
        >
        <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
    </div>
  </div>
  <div class="input-group block mt-3" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
    <label for="article-description">Article Description:</label>
    <div class="mt-1 text-input block medium disabled">
        <textarea 
        id="article-description"
        name="article-description" 
        id="article-description" 
        placeholder="Enter the article description here..." 
        rows="5" 
        maxlength="400"  
        spellcheck="true"
        autocomplete="off"
        autocapitalize="on"
        >${description}</textarea>
    </div>
  </div>
  <label for="article-banner-image" class="bold mt-3">Article Banner Image:</label>
  ${!!!imageData.length ? /*html*/ `<input data-article-image type="file" id="article-banner-image" data-image-input accept="image/*" name="article-banner-image" class="mt-1 secondary"><output class="block" for="article-banner-image"></output>` :
        /*html*/ `<input data-default-value="${imageData}" data-article-image type="file" id="article-banner-image" data-image-input accept="image/*" name="article-banner-image" class="mt-1 secondary"><output style="min-height:420px;" class="block" for="article-banner-image"></output>`}
  
  ${selectStr}
  ${articleBuilderLexical}
  <div id="article-take-actions" class="flex-row justify-between" style="padding: 8px 0px 16px 0px; border-top: 1px solid var(--text-primary); margin-top: 2rem;">
      <button data-preview-article="" type="button" class="icon-text info filled medium">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RemoveRedEye"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path></svg>
        PREVIEW
      </button>
      <div class="flex-row gap-3">
        <button data-submit="save" type="submit" class="warning filled icon-text medium">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Save"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></svg>
          SAVE
        </button>
        <button data-submit="publish" type="submit" class="success filled icon-text medium">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Publish"><path d="M5 4v2h14V4H5zm0 10h4v6h6v-6h4l-7-7-7 7z"></path></svg>
          PUBLISH
        </button>
      </div>
  </div>
  ${deleteArticle}
  <details aria-label="Upload Media" class="mt-4">
    <summary>
      <span class="h6 fw-regular">Upload Media</span>
      <svg class="details" focusable="false" inert viewBox="0 0 24 24">
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
      </path>
      </svg>
    </summary>
    <div class="accordion-content" aria-hidden="true">
      To reference an image, audio file, or video file inside custom code, you must first upload the file to our databases due to the fact that our <abbr title="Content Security Policy">CSP</abbr> does not allow for images, audio, and video to be loaded from URLs that we do not recognize. 
      <br>
      Use the inputs below to upload images, audio files, and video files and copy the resulting URLs.
      <label for="${imageUrlUpload}" class="bold mt-2">Upload Image File and Copy Resource URL:</label>
      <input data-copy-url multiple type="file" id="${imageUrlUpload}" data-image-input accept="image/*" name="${imageUrlUpload}" class="mt-1 primary">
      <output class="block" for="${imageUrlUpload}"></output>

      <label for="${audioUrlUpload}" class="bold mt-2">Upload Audio File and Copy Resource URL:</label>
      <input data-copy-url multiple type="file" id="${audioUrlUpload}" data-audio-input accept="audio/*" name="${audioUrlUpload}" class="mt-1 secondary">
      <output class="block" for="${audioUrlUpload}"></output>
      
      <label for="${videoUrlUpload}" class="bold mt-2">Upload Video File and Copy Resource URL:</label>
      <input data-copy-url multiple type="file" id="${videoUrlUpload}" data-video-input accept="video/*" name="${videoUrlUpload}" class="mt-1 info">
      <output class="block" for="${videoUrlUpload}"></output>

    </div>
  </details>
  </form>
  <output form="example-article" hidden class="mt-2">
  <div class="flex-row justify-start p-md bb">
    <button data-edit-article id="edit-article" type="button" class="icon-text info filled medium">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Edit"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
      EDIT
    </button>
  </div>
  <div class="tabs mt-2">
    <ul class="tabs" role="tablist">
      <li role="presentation">
        <button id="mobile_preview" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
          Mobile
        </button>
      </li>
      <li role="presentation">
        <button id="tablet_preview" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
          Tablet
        </button>
      </li>
      <li role="presentation">
        <button id="desktop_preview" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="2" tabindex="-1">
          Desktop
        </button>
      </li>
    </ul>
  </div>
  <div class="tab-panels"  style="background-color: var(--secondary-background);">
    <div aria-labelledby="mobile_preview" role="tabpanel" tabindex="0">
      <div style="padding: 8px 0px;overflow-x:auto;" class="hz-scroll">
        <article role="presentation" class="preview-editor-mobile hz-scroll" data-preview-mobile style="max-width: 100%; overflow-x: hidden;">
  
        </article>
      </div>
    </div>
    <div aria-labelledby="tablet_preview" role="tabpanel" tabindex="0" hidden>
      <div style="padding: 8px 0px;overflow-x:auto;" class="hz-scroll">
        <article role="presentation" class="preview-editor-tablet hz-scroll" data-preview-tablet style="max-width: 100%; overflow-x: hidden;">
  
        </article>
      </div>
    </div>
    <div aria-labelledby="desktop_preview" role="tabpanel" tabindex="0" hidden>
      <div style="padding: 8px 0px;overflow-x:auto;" class="hz-scroll">
        <article role="presentation" class="preview-editor-desktop hz-scroll" data-preview-desktop style="max-width: 100%; overflow-x: hidden;">
  
        </article>
      </div>
    </div>
  </div>
  
  </output>`;
    return str;
}
exports.getArticleForm = getArticleForm;
