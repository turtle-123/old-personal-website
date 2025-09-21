import { Request, Response } from "express";
import { Router } from "express";
import DEFAULT_SETTINGS from "../CONSTANTS/DEFAULT_SETTINGS";
import { getNavbarColor, getStrokeColor, getFillColor } from "./functions/settingsHandler";
import crypto from 'node:crypto';
import { SUPPORTED_CODEMIRROR_THEMES } from "../types";
import { getCommentImplementation, getTextBlockTextImplementation, getTextWithLinksImplementation } from "./pages_helper/lexicalImplementations";
import getDatabase from "../database";
import escapeHTML from "escape-html";

const COMPONENTS_ROUTER = Router();

/* ----------------------- Navigation Sidebar --------------------------------- */
function getNavigationSidebar(req:Request,res:Response){
  return res.status(200).render('navigation',{
    layout: false, 
    phone: req.session.device?.phone || false,
    auth: Number(req.session.auth?.level) || 0
  });
}
COMPONENTS_ROUTER.get('/navigation-sidebar/?',getNavigationSidebar);

/* ----------------------- Settings Style --------------------------------- */
function getSettingsStyles(req:Request,res:Response) {
  const settingsString = req.session.settings?.settingsString||DEFAULT_SETTINGS.settingsString;
  const navbarColor = getNavbarColor(req.session.settings);
  const fillColor = getFillColor(req.session.settings);
  const strokeColor = getStrokeColor(req.session.settings);
  const mode = req.session?.settings?.mode || 'light';

  const html = /*html*/`
    <head hx-merge="true">
      <style id="theme-colors" hx-preserve="true">
        ${settingsString}
      </style>
    </head>
    <input type="text" data-ignore-oob hidden id="STROKE_COLOR_MAP" hx-swap-oob="true" value="${strokeColor}" />
    <input type="text" data-ignore-oob hidden id="FILL_COLOR_MAP" hx-swap-oob="true"  value="${fillColor}"/>
    <input type="text" data-ignore-oob hidden id="NAVBAR_COLOR" hx-swap-oob="true" value="${navbarColor}" />
    <input type="text" data-ignore-oob hidden id="mode-from-settings" hx-swap-oob="true" value="${mode}" />
  `;
  return res.status(200).send(html);
}
COMPONENTS_ROUTER.get('/settings-styles/?',getSettingsStyles);

/* ----------------------- Article Builder Code Editors --------------------------------- */

export function getCodeEditorsHTML(theme:SUPPORTED_CODEMIRROR_THEMES,state?:{html:string, css:string}) {
  const rand = crypto.randomUUID();
  const wrapperID = 'w_'.concat(rand);
  const wrapper1ID = 'w1_'.concat(rand);
  const wrapper2ID = 'w2_'.concat(rand);
  const htmlTabButton = 'html_'.concat(rand);
  const cssTabButton = 'css_'.concat(rand);
  const htmlEditorId = 'html_ed'.concat(rand); 
  const cssEditorId = 'css_ed'.concat(rand); 
  const outputTabButton = 'output_code_'.concat(rand);
  const wrapper4ID = 'w4_'.concat(rand);
  const initialTheme = theme;
  var initialHTMLState = /*html*/`<p class='body1 custom'>
Double click inside the custom HTML to edit the html. <br>
Learn about the basics of HTML using the <a class="secondary link" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML">mdn web docs on HTML</a>. 
</p>`;
  var initialCSSState = /*css*/`/* Learn about the basics of CSS using the mdn web docs on CSS - https://developer.mozilla.org/en-US/docs/Web/CSS*/
.custom {
  background-color: blue;
  color: white;
  padding: 15px;
  border: 3px dashed var(--text-primary);
}`;
  if (state) {
    initialHTMLState =state.html;
    initialCSSState = state.css;
  }
  const html = /*html*/`
  <section data-type="code" id="${wrapperID}" data-article-builder data-drag-container="sort-section-container" data-drag-el draggable="false" class="mt-3" style="border: 2px solid var(--text-secondary); padding: 4px; border-radius: 6px;">
  <div class="flex-row justify-between align-center" style="padding-bottom: 2px;">
    <div tabindex="0" class="drag-container" data-drag="#${wrapperID}">
      <svg class="custom-poll t-normal drag" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"/></svg>
    </div>
    <button type="button" class="small icon-text text warning" data-hide-show data-el="#${wrapper4ID}">
      <svg data-arrow focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
      <span data-hide>HIDE</span>
      <span data-show hidden>SHOW</span>
    </button>
  </div>
  <div id="${wrapper4ID}">
  <div class="tabs mt-1">
    <ul class="tabs" role="tablist">
      <li role="presentation">
        <button id="${htmlTabButton}" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
          HTML
        </button>
      </li>
      <li role="presentation">
        <button id="${cssTabButton}" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
          CSS
        </button>
      </li>
      <li role="presentation">
        <button data-output-code id="${outputTabButton}" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="3" tabindex="-1">
          Output
        </button>
      </li>
    </ul>
  </div>
    <div class="tab-panels" style="min-height: 230px;">
      <div data-editor-wrapper id="${wrapper1ID}" aria-labelledby="${htmlTabButton}" role="tabpanel" tabindex="0">
        <div hidden id="${htmlEditorId}"  data-theme="${initialTheme}" data-type="auto"  data-codemirror="html" class="mt-2">
          ${initialHTMLState}
        </div>
      </div>
      <div data-editor-wrapper id="${wrapper2ID}" aria-labelledby="${cssTabButton}" role="tabpanel" tabindex="0" hidden>
        <div hidden id="${cssEditorId}"  data-theme="${initialTheme}" data-type="auto"  data-codemirror="css" class="mt-2">
          ${initialCSSState}
        </div>
      </div>  
      <div aria-labelledby="${outputTabButton}" role="tabpanel" tabindex="0" hidden>
        <div class="mt-2" data-code-output-div></div>
      </div>
    </div>
  </div>
  <div class="flex-row justify-between">
    <button class="icon-text medium transparent collapse-xs" type="button" aria-haspopup="dialog" data-dialog="math-markup-dialog">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Functions"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"></path></svg>
      Math Markup
    </button>
    <button class="icon-text medium transparent collapse-xs" type="button" aria-haspopup="dialog" data-dialog="code-markup-dialog">
      <svg viewBox="0 0 640 512" title="code" focusable="false" inert tabindex="-1"><path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"></path></svg>
      Code Markup
    </button>
    <button class="icon-text medium transparent collapse-xs" type="button" aria-haspopup="dialog" data-dialog="svg-icon-search-dialog">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Search"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
      SVG Search
    </button>
    <button class="icon-text medium transparent collapse-xs" type="button"  data-dialog="">
      <svg viewBox="0 0 640 512" title="robot" focusable="false" inert tabindex="-1"><path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z"></path></svg>
      AI Generation
    </button>
  </div>
  <div class="mt-2 flex-row w-100 justify-between align-center">
      <button disabled data-popover data-click data-pelem="#del-article-section" data-force-close type="button" class="error filled medium icon" aria-label="Delete article/blog section">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Remove"><path d="M19 13H5v-2h14v2z"></path></svg>
      </button>
      <div class="flex-row gap-3">
        <button title="Add Code" aria-label="Add Code" hx-get="/components/article-builder-code" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="secondary filled medium icon" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Code"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
        </button>
        <button title="Add Markdown" aria-label="Add Markdown" hx-get="/components/markdown" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="info filled medium icon" >
          <svg  viewBox="0 0 24 24" focusable="false" inert tabindex="-1" title="Markdown"><path d="M22.269 19.385H1.731a1.73 1.73 0 0 1-1.73-1.73V6.345a1.73 1.73 0 0 1 1.73-1.73h20.538a1.73 1.73 0 0 1 1.73 1.73v11.308a1.73 1.73 0 0 1-1.73 1.731zm-16.5-3.462v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.461v7.847zM21.231 12h-2.308V8.077h-2.307V12h-2.308l3.461 4.039z"/></svg>
        </button>
        <button title="Add Editor" aria-label="Add Editor" hx-get="/api/lexical/article-builder-3" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="primary filled medium icon" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
        </button>
      </div>
    </div>
  </section>
    `;
    return html;
}

function getArticleBuilderCode(req:Request,res:Response){
  const theme = req.session.settings?.code_editor_theme || 'vscode';
  const html = getCodeEditorsHTML(theme);
  return res.status(200).send(html);
}
COMPONENTS_ROUTER.get('/article-builder-code/?',getArticleBuilderCode);

/* ----------------------- Article Builder Markdown --------------------------------- */
export function getMarkdownHTML(theme:SUPPORTED_CODEMIRROR_THEMES,state?:string) {
  const rand = crypto.randomUUID();
  const wrapperID = 'w_'.concat(rand);
  const wrapper4ID = 'w4_'.concat(rand);
  const markdownTabButton = 'markdown_'.concat(rand);
  const outputTabButton = 'output_markdown_'.concat(rand);
  const initialTheme = theme;
  const initialState = state ? state : `# Enter Markdown Here

Learn about the basics of Markdown on [markdownguide.org](https://www.markdownguide.org/).`;

  const html = /*html*/`  <section data-type="markdown" id="${wrapperID}" data-article-builder data-drag-container="sort-section-container" data-drag-el draggable="false" class="mt-3" style="border: 2px solid var(--text-secondary); padding: 4px; border-radius: 6px;">
  <div class="flex-row justify-between align-center" style="padding-bottom: 2px;">
    <div tabindex="0" class="drag-container" data-drag="#${wrapperID}">
      <svg class="custom-poll t-normal drag" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"/></svg>
    </div>
    <button type="button" class="small icon-text text warning" data-hide-show data-el="#${wrapper4ID}">
      <svg data-arrow focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
      <span data-hide>HIDE</span>
      <span data-show hidden>SHOW</span>
    </button>
  </div>
  <div id="${wrapper4ID}">
    <div class="tabs mt-2">
      <ul class="tabs" role="tablist">
        <li role="presentation">
          <button id="${markdownTabButton}" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">Markdown</button>
        </li>
        <li role="presentation">
          <button data-output-markdown id="${outputTabButton}" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">Preview</button>
        </li>
      </ul>
    </div>
    <div class="tab-panels" style="min-height: 230px;">
      <div data-editor-wrapper id="${wrapperID}" aria-labelledby="${markdownTabButton}" role="tabpanel" tabindex="0">
        <div id="${wrapperID}"  data-theme="${initialTheme}" data-type="auto"  data-codemirror="markdown" class="mt-2">${initialState}</div>
      </div>
      <div aria-labelledby="${outputTabButton}" role="tabpanel" tabindex="0" hidden>
        <div class="mt-2" data-markdown-output-div></div>
      </div>
    </div>
  </div>

    <div class="mt-2 flex-row w-100 justify-between align-center">
      <button disabled data-popover data-click data-pelem="#del-article-section" data-force-close type="button" class="error filled medium icon" aria-label="Delete article/blog section">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Remove"><path d="M19 13H5v-2h14v2z"></path></svg>
      </button>
      <div class="flex-row gap-3">
        <button title="Add Code" aria-label="Add Code" hx-get="/components/article-builder-code" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="secondary filled medium icon" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Code"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
        </button>
        <button title="Add Markdown" aria-label="Add Markdown" hx-get="/components/markdown" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="info filled medium icon" >
          <svg  viewBox="0 0 24 24" focusable="false" inert tabindex="-1" title="Markdown"><path d="M22.269 19.385H1.731a1.73 1.73 0 0 1-1.73-1.73V6.345a1.73 1.73 0 0 1 1.73-1.73h20.538a1.73 1.73 0 0 1 1.73 1.73v11.308a1.73 1.73 0 0 1-1.73 1.731zm-16.5-3.462v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.461v7.847zM21.231 12h-2.308V8.077h-2.307V12h-2.308l3.461 4.039z"/></svg>
        </button>
        <button title="Add Editor" aria-label="Add Editor" hx-get="/api/lexical/article-builder-3" hx-trigger="click" hx-target="closest section[data-article-builder]" hx-swap="afterend" type="button" class="primary filled medium icon" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
        </button>
      </div>
    </div>
  </section>
`;
  return html;
}

function getArticleBuilderMarkdownHTML(req:Request,res:Response) {
  const theme = req.session.settings?.code_editor_theme || 'vscode';
  const html = getMarkdownHTML(theme,undefined);
  return res.status(200).send(html);
}
COMPONENTS_ROUTER.get('/markdown/?',getArticleBuilderMarkdownHTML);

/**
 * 
 * @param rows Rows should be id ASC
 */
export function getAIChatHTML(rows:{id: number, user_message: boolean, html: string, model: string, error: boolean, chat_name: string}[],for_lexical=false) {
  var str = '';
  if (rows.length) {
    for (let message of rows) {
      const { user_message, html, model, id, error }:{model:string,error:boolean, user_message:boolean,html:string,id:number} = message;
      if (user_message) {
        str+=`<fieldset role="none" class="response-ai-chat user">
        <legend role="none" class="flex-row align-center gap-1"><span>User</span> <svg class="ai-chat" viewBox="0 0 448 512" title="user" focusable="false" inert tabindex="-1"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"></path></svg></legend>
        <div ${!!!for_lexical?`class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="ai-chat-response-${id}"`:``}>${html}</div>
        </fieldset>`;
      } else if (error) {
        str+=`<div style="margin-top:6px;" class="text-align-center">${html}</div>`
      } else {
        var svg = '';
        var className = '';
        var modelProviderName = '';
        if (model.includes('meta-llama')) {
          modelProviderName = 'Meta';
          svg = `<svg class="ai-chat" viewBox="0 0 640 512" title="meta" focusable="false" inert="" tabindex="-1"><path d="M640 317.9C640 409.2 600.6 466.4 529.7 466.4C467.1 466.4 433.9 431.8 372.8 329.8L341.4 277.2C333.1 264.7 326.9 253 320.2 242.2C300.1 276 273.1 325.2 273.1 325.2C206.1 441.8 168.5 466.4 116.2 466.4C43.42 466.4 0 409.1 0 320.5C0 177.5 79.78 42.4 183.9 42.4C234.1 42.4 277.7 67.08 328.7 131.9C365.8 81.8 406.8 42.4 459.3 42.4C558.4 42.4 640 168.1 640 317.9H640zM287.4 192.2C244.5 130.1 216.5 111.7 183 111.7C121.1 111.7 69.22 217.8 69.22 321.7C69.22 370.2 87.7 397.4 118.8 397.4C149 397.4 167.8 378.4 222 293.6C222 293.6 246.7 254.5 287.4 192.2V192.2zM531.2 397.4C563.4 397.4 578.1 369.9 578.1 322.5C578.1 198.3 523.8 97.08 454.9 97.08C421.7 97.08 393.8 123 360 175.1C369.4 188.9 379.1 204.1 389.3 220.5L426.8 282.9C485.5 377 500.3 397.4 531.2 397.4L531.2 397.4z"></path></svg>`;
          className = "meta";
        } else if (model.includes('qwen')) {
          svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`;
          className = 'qwen';
          modelProviderName = 'Qwen';
        } else if (model.includes('google')) {
          svg = `<svg class="ai-chat" viewBox="0 0 488 512" title="google" focusable="false" inert="" tabindex="-1"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>`;
          className = 'google';
          modelProviderName = 'Google';
        } else if (model.includes('mistralai')) {
          svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em"><path d="M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z"></path><path d="M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z"></path><path d="M3.428 10.258h17.144v3.428H3.428v-3.428z"></path><path d="M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z"></path><path d="M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z"></path></svg>`;
          className = 'mistral';
          modelProviderName = 'Mistral';
        } else if (model.includes('amazon')) {
          svg = `<svg class="ai-chat" viewBox="0 0 448 512" title="amazon" focusable="false" inert="" tabindex="-1"><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"></path></svg>`;
          className = 'amazon';
          modelProviderName = 'Amazon';
        } else if (model.includes('anthropic')) {
          svg = '<svg class="ai-chat" xmlns:x="ns_extend;" xmlns:i="ns_ai;" xmlns:graph="ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 92.2 65" xml:space="preserve"> <path d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z   M24.3,39.3l8.8-22.8l8.8,22.8H24.3z"></path></svg>';
          className = "anthropic";
          modelProviderName = "Anthropic";
        } else if (model.includes('openai')) {
          svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" focusable="false" inert=""><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path></svg>`;
          className = 'openai';
          modelProviderName = 'OpenAI';
        }
        str+=`<fieldset role="none" class="response-ai-chat ai ${className}">
        <legend role="none" class="flex-row align-center gap-1"><span>${modelProviderName} (${model})</span> ${svg}</legend>
        <div ${!!!for_lexical?`class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="ai-chat-response-${id}"`:``}>${html}</div>
        </fieldset>`;
      } 
    }
    return str;
  } else {
    return `<div style="margin-top:6px;" class="text-align-center"><p class="body1 bold text-align-center" style="max-width: 600px; margin: auto;">Welcome to Frank's AI Chat. Edit the Model you want to use in the settings dialog.Chat with the model using the textbox below. <br> <mark class="bold">NOTE:</mark> Users are limited to $1 per day in chat-related costs, though this is actually a lot of messages.</p></div>`;
  }
}

export async function getTextWithBlockElementsEditorAIChat(req:Request,res:Response) {
  const resp = getCommentImplementation(req,'ai-chat-editor',false,'<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span data-v="1" style="white-space: pre-wrap;">Enter your AI chat message here...</span></p>',{ wrapperStyle: 'lexical-wrapper', type: 'comment', rteStyle: 'padding-bottom: 30px; min-height: 100px; max-height: 200px;'});
  const db = getDatabase();
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID;
  const [messages,chat_names_rows_resp] = await Promise.all([
    db.query(`SELECT id, user_message, html, model, is_error AS error, chat_name FROM ai_chat WHERE chat_id=$1 ORDER BY id DESC LIMIT 100;`,[req.session.settings?.ai_chat_id||'']),
    db.query(`SELECT DISTINCT chat_id, chat_name FROM ai_chat WHERE ${user_id!==undefined?`user_id=$1;`:`ip_id=$1;`}`,[user_id!==undefined?user_id:ip_id])
  ]);

  const current_chat_id = req.session.settings?.ai_chat_id; 
  var current_chat_name = `Select AI Chat`
  const chat_names_rows = chat_names_rows_resp.rows.filter((obj) => Boolean(obj.chat_name&&obj.chat_id)).map((obj) => {
    const { chat_name, chat_id } = obj;
    const current_chat = chat_id===current_chat_id;
    if (current_chat) current_chat_name = escapeHTML(chat_name);
    return `<button type="button" tabindex="-1" class="select-option" role="option" aria-selected="${current_chat}" data-val="${escapeHTML(chat_id)}">${escapeHTML(chat_name)}</button>`
  }).join('');
  var select_str = `<div class="flex-row justify-center" id="select-ai-chats-swap" hx-swap-oob="true">
  <div class="select">
    <button type="button" role="combobox" aria-haspopup="listbox" aria-controls="ai-chat-select-dropdown" class="select" aria-label="Select AI Chat" data-popover data-pelem="#ai-chat-select-dropdown" data-click aria-expanded="false" style="padding: 0.25rem 0.3rem !important; margin: 0; min-width: 150px; max-width: 200px; overflow-x: hidden; overflow-y: hidden;">
      <span class="body2" id="current-ai-chat-name">${current_chat_name}</span>
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
    </button>
    <div tabindex="0" id="ai-chat-select-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
      <input type="text" hidden value="${escapeHTML(current_chat_id)}" name="ai-chat-select-input" id="ai-chat-select-input">
      ${chat_names_rows}
    </div>
  </div>
</div>`
  var str = getAIChatHTML(messages.rows.reverse());
  
  const html = `<div style="height: 80h; max-height: 80vh; padding: 2px; padding-bottom: 200px; overflow-y: auto; scrollbar-width: none; max-width: min(100%,800px); margin: auto;" id="ai-chat-body">${str}</div>
<div style="position: absolute; bottom: 0px; left: 0px; width: 100%; background-color: var(--background); z-index: 4;">
  <div id="ai-chat-editor-wrapper" style="position: relative; max-width: min(800px,100%); margin: auto;">
    ${resp}
  <button style="position: absolute; bottom: 0px; right: 0px; z-index: 3; border-radius:0px;" type="button" id="submit-ai-chat-dialog-button" aria-label="Submit" class="success filled icon-text medium">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
      SUBMIT
  </button>
  <div style="position: absolute; bottom: 0px; left: 0px; z-index: 3;" class="flex-row">
    <button style="border-radius:0px;" type="button" id="new-ai-chat-dialog-button" class="warning filled icon-text medium">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
      NEW CHAT
    </button>
    <button style="border-radius:0px;" type="button" id="copy-ai-chat-link" aria-label="Submit" class="info filled icon-text medium">
      <svg viewBox="0 0 448 512" title="copy" focusable="false" inert tabindex="-1"><path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"></path></svg>
      LINK
    </button>
  </div>
  </div>
</div>`;
  return res.status(200).send(html.concat(select_str));
}


COMPONENTS_ROUTER.get('/ai-chat-prompt/?',getTextWithBlockElementsEditorAIChat)
export default COMPONENTS_ROUTER;


