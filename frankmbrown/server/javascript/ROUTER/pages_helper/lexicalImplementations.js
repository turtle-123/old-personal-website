"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextBlockTextImplementation = exports.getTextWithLinksImplementation = exports.getTextOnlyImplementation = exports.getCommentImplementation = exports.getFullLexicalRenderObj = exports.getArticleBuilderImplementation = void 0;
const ejs_1 = __importDefault(require("ejs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const END_PADDING = `<p class="lex-p" data-v="1" style="text-align: left; margin: 6px 0px; padding: 0px !important;"><br></p>`;
function getArticleBuilderImplementation(req, id = "article", innerHTML = '<p>Insert article content here...</p>', obj = { minHeight: 600, wrapperClass: 'block lexical-wrapper mt-3' }) {
    var _a;
    const desktop = Boolean(((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) === true);
    const uuid = node_crypto_1.default.randomUUID();
    return /*html*/ `
<div class="${obj.wrapperClass}" id="${id}" data-current="true" data-save-state>
  <div style="position: sticky; top: calc(var(--navbar-height) + var(--safe-area-inset-top-0px)); z-index: 3; opacity: 1; border: 2px solid var(--text-primary); background-color: var(--background);" class="navbar-sticky-transition">
      <div role="toolbar" class="toggle-button-group hz-scroll">
          <div role="toolbar" class="toggle-button-group subgroup left" data-popover data-mouse="" data-pelem="#lex-font-fam-tool">
              <div hidden="" id="hidden-label-lexical-font-1_">Font Family For Editor</div>
              <button style="height: 2.13rem!important; border-radius: 0px!important;" type="button" role="combobox" aria-haspopup="listbox" aria-controls="lexical-font-family-dropdown_" aria-labelledby="hidden-label-lexical-font-1_" data-pelem="#lexical-font-family-dropdown_" aria-expanded="false" data-placeholder="Current Font for Lexical" class="select small" data-popover data-click="" data-lexical-font-button="">
              <span class="body1" style="width: max-content!important; min-width: 150px;text-align: left!important;">Font</span>
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
              </button>
              <div tabindex="0" id="lexical-font-family-dropdown_" role="listbox" class="select-menu o-xs" data-placement="bottom" style="display: none; opacity: 0;">
                  <input data-lexical-font-input="" type="text" hidden="" value="Anuphan, sans-serif;" name="font_family_lexical_" id="font_family_lexical_">
                  <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="Inherit">
                  Inherit
                  </button>
                  <button style="font-family: Anuphan, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Anuphan, sans-serif;">
                  Anuphan, sans-serif;
                  </button>
                  <button style="font-family: Arial, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Arial, sans-serif;">
                  Arial, sans-serif;
                  </button>
                  <button style="font-family: Verdana, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Verdana, sans-serif;">
                  Verdana, sans-serif;
                  </button>
                  <button style="font-family: Tahoma, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Tahoma, sans-serif;">
                  Tahoma, sans-serif;
                  </button>
                  <button style="font-family: Trebuchet MS, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Trebuchet MS, sans-serif;">
                  Trebuchet MS, sans-serif;
                  </button>
                  <button style="font-family: Times New Roman, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Times New Roman, serif;"> 
                  Times New Roman, serif;
                  </button>
                  <button style="font-family: Georgia, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Georgia, serif;">
                  Georgia, serif;
                  </button>
                  <button style="font-family: Garamond, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Garamond, serif;">
                  Garamond, serif;
                  </button>
                  <button style="font-family: Courier New, monospace;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Courier New, monospace;"> 
                  Courier New, monospace;
                  </button>
                  <button style="font-family: Brush Script MT, cursive;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Brush Script MT, cursive;">
                  Brush Script MT, cursive;
                  </button>
              </div> 
          </div>
          <div role="toolbar" class="pl-1 toggle-button-group subgroup left">
              <div ${desktop ? 'data-popover data-mouse data-pelem="#lex-heading-node" aria-describedby="lex-heading-node"' : ''}>
              <button data-lexical-heading-button="" type="button" class="toggle-button" aria-label="Insert Heading Node" data-popover data-pelem="#heading-node-lexical-menu_" data-click="">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatSizeSharp"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"></path></svg>
              </button>
              </div>
              <div style="padding: 0px; background-color: var(--background)!important; border-radius: 0px;" class="floating-menu o-xs" role="dialog" id="heading-node-lexical-menu_" data-placement="bottom">
              <button data-mouse-down="" type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h2">
                  H2
              </button>
              <button data-mouse-down="" type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h3">
                  H3
              </button>
              <button data-mouse-down="" type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h4">
                  H4
              </button>
              <button data-mouse-down="" type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h5">
                  H5
              </button>
              <button data-mouse-down="" type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h6">
                  H6
              </button>
              <button data-mouse-down="" type="button" class="toggle-button selected" data-dispatch="CREATE_HEADING_COMMAND" data-payload="p">
                  P
              </button>
              </div>
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-section-heading-node" aria-describedby="lex-section-heading-node"' : ''}>
                  <button data-lexical-section-button="" type="button" class="toggle-button" aria-label="Insert Section Heading Node" data-click="" disabled="">
                      <svg viewBox="0 0 640 512" title="link" focusable="false" inert tabindex="-1"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"></path></svg>
                  </button>
              </div>
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"' : ''}>
                  <button data-lexical-link-button="" data-click="" type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog" data-popover data-pelem="#lexical-insert-link-main_" data-force-close="" disabled="">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
                  </button>
              </div>
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-background-color" aria-describedby="lex-background-color"' : ''}>
              <button data-lexical-bg-color-button="" aria-haspopup="dialog" data-popover data-click="" data-pelem="#lexical-background-color-menu_" data-force-close="" type="button" class="toggle-button" aria-label="Background Color">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorFillSharp"><path d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z"></path></svg>
              </button>
              </div>
              <div data-click-capture="" class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="lexical-background-color-menu_">
              <label class="body2" for="lexical-background-color-1_">Background Color:</label>
              <div class="flex-row justify-begin align-center gap-2">
                  <input data-lexical-background-color="" type="color" data-coloris name="lexical-background-color-1_" id="lexical-background-color-1_" value="#1e1e1e" style="margin-top: 2px;">
                  <span class="body2">#1e1e1e</span>
              </div>
              <label class="checkbox mt-1">
                  <input data-lexical-background-transparent="" checked="" type="checkbox" class="secondary" name="lex-background-color-transparent_" id="lex-background-color-transparent_">
                  Transparent
              </label>
              </div>
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-text-color" aria-describedby="lex-text-color"' : ''}>
              <button data-lexical-text-color-button="" data-popover data-pelem="#lexical-text-color-menu_" data-force-close="" aria-haspopup="dialog" data-click="" type="button" class="toggle-button" aria-label="Text Color">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorTextSharp"><path d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z"></path></svg>
              </button>
              </div>
              <div data-click-capture="" class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="lexical-text-color-menu_">
              <label class="body2" for="lexical-text-color-1_">Text Color:</label>
              <div class="flex-row justify-begin align-center gap-2">
                  <input data-lexical-text-color="" type="color" data-coloris name="lexical-text-color-1_" id="lexical-text-color-1_" value="#ffffff" style="margin-top: 2px;">
                  <span class="body2">#ffffff</span>
              </div>
              <label class="checkbox mt-1">
                  <input data-lexical-text-transparent="" checked="" type="checkbox" class="secondary" name="lex-text-color-transparent_" id="lex-text-color-transparent_">
                  Inherit
              </label>
              </div>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-bold" aria-describedby="lex-bold"' : ''} class="toggle-button" aria-label="Bold">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-italic" aria-describedby="lex-italic"' : ''} class="toggle-button" aria-label="Italic">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"' : ''} class="toggle-button" aria-label="Strikethrough">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp"><path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-underline" aria-describedby="lex-underline"' : ''} class="toggle-button" aria-label="Underline">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatUnderlinedSharp"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-kbd" aria-describedby="lex-kbd"' : ''} class="toggle-button" aria-label="Insert Keyboard Command">
              <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"' : ''} class="toggle-button" aria-label="Insert Quote">
              <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>
              </button>   
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-abbreviation" aria-describedby="lex-abbreviation"' : ''}>
                <button data-lexical-abbr-button data-force-close="" data-popover data-pelem="#lexical-insert-abbr_${uuid}" data-click type="button" class="toggle-button" aria-label="Insert Abbreviation">
                    <svg title="ShortText" tabindex="-1" viewBox="0 0 24 24"><path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z"></path></svg>
                </button>
              </div>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-superscript" aria-describedby="lex-superscript"' : ''} class="toggle-button" aria-label="Superscript">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp"><path d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-subscript" aria-describedby="lex-subscript"' : ''} class="toggle-button" aria-label="Subscript">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp"><path d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"></path></svg>
              </button>
              <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"' : ''} class="toggle-button" aria-label="Clear Text Formatting">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear"><path d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"></path></svg>
              </button>
          </div>
          <div role="toolbar" class="toggle-button-group subgroup pl-1 none">
              <div hidden="" id="hidden-label-lexical-size-1_">Font Size For Editor</div>
              <button style="height: 2.13rem!important; border-radius: 0px!important;" type="button" role="combobox" aria-haspopup="listbox" aria-controls="lexical-font-size-dropdown_" aria-labelledby="hidden-label-lexical-size-1_" data-pelem="#lexical-font-size-dropdown_" aria-expanded="false" data-placeholder="Current Font Size for Lexical" class="select small" data-popover data-click="" data-lexical-font-size-button="">
              <span class="body1" style="width: max-content!important; min-width: 60px!important; text-align: left!important;">Size</span>
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
              </button>
              <div style="width: fit-content !important; display: none; opacity: 0;" tabindex="0" id="lexical-font-size-dropdown_" role="listbox" class="select-menu o-xs" data-placement="bottom">
              <input data-lexical-font-size-input="" type="text" hidden="" value="400" name="font_size_lexical_" id="font_size_lexical_">
              <button data-val="Inherit" type="button" tabindex="-1" class="select-option" role="option" aria-selected="true">
                  Inherit
              </button>
              <button data-val="caption" type="button" tabindex="-1" class="select-option caption" role="option" aria-selected="false">
                  Caption
              </button>
              <button data-val="body2" type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false">
                  Body 2
              </button>
              <button data-val="body1" type="button" tabindex="-1" class="select-option body1" role="option" aria-selected="false">
                  Body 1
              </button>
              <button data-val="h6" type="button" tabindex="-1" class="select-option h6" role="option" aria-selected="false">
                  H6
              </button>
              <button data-val="h5" type="button" tabindex="-1" class="select-option h5" role="option" aria-selected="false">
                  H5
              </button>
              <button data-val="h4" type="button" tabindex="-1" class="select-option h4" role="option" aria-selected="false">
                  H4
              </button>
              <button data-val="h3" type="button" tabindex="-1" class="select-option h3" role="option" aria-selected="false">
                  H3
              </button>
              <button data-val="h2" type="button" tabindex="-1" class="select-option h2" role="option" aria-selected="false">
                  H2
              </button>
              <button data-val="h1" type="button" tabindex="-1" class="select-option h1" role="option" aria-selected="false">
                  H1
              </button>
              </div>
          </div>
      </div>
      <div role="toolbar" class="toggle-button-group hz-scroll">
          <div role="toolbar" class="toggle-button-group subgroup left">
          <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-prev-v" aria-describedby="lex-insert-prev-v"' : ''}>
                <button hidden type="button" class="toggle-button" data-dialog="insert-previous-lexical" aria-label="Insert Previous Version of Code">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="History"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg>
                </button>
            </div>
              <button data-dispatch="UNDO_COMMAND" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-undo-last-change" aria-describedby="lex-undo-last-change"' : ''} class="toggle-button" aria-label="Undo">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="UndoSharp"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
              </button>
              <button data-dispatch="REDO_COMMAND" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-redo-last-change" aria-describedby="lex-redo-last-change"' : ''} class="toggle-button" aria-label="Redo">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RedoSharp"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
              </button>
              <button data-dispatch="CLEAR_EDITOR_COMMAND" data-payload="false" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-clear-editor" aria-describedby="lex-clear-editor"' : ''} class="toggle-button" aria-label="Reset">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Clear"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>                      
              </button>
              <button data-copy-editor data-dispatch="COPY_EDITOR_COMMAND" type="button" class="toggle-button" aria-label="Copy Editor Contents"  ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-copy-contents" aria-describedby="lex-copy-contents"' : ''}>
                    <svg viewBox="0 0 448 512" title="copy" focusable="false" inert tabindex="-1"><path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"></path></svg> 
               </button>
          </div>
          <div class="toggle-button-group subgroup left pl-1">
              <button data-dispatch="INSERT_LINE_BREAK_COMMAND" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-line-break" aria-describedby="lex-insert-line-break"' : ''} class="toggle-button" aria-label="New Line">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardReturnSharp"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"></path></svg>
              </button>
              <button data-dispatch="INDENT_CONTENT_COMMAND" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-indent" aria-describedby="lex-indent"' : ''} class="toggle-button" aria-label="Indent">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatIndentIncrease"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"></path></svg>
              </button>
              <button data-dispatch="OUTDENT_CONTENT_COMMAND" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-outdent" aria-describedby="lex-outdent"' : ''} class="toggle-button" aria-label="Outdent" disabled="">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatIndentDecrease"><path d="M11 17h10v-2H11v2zm-8-5 4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"></path></svg>
              </button>
          </div>
          <div role="toolbar" class="toggle-button-group subgroup left pl-1">
              <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="left" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-left-align" aria-describedby="lex-left-align"' : ''} class="toggle-button selected" aria-label="Left Align">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignLeftSharp"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="center" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-center-align" aria-describedby="lex-center-align"' : ''} class="toggle-button" aria-label="Center Align">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignCenterSharp"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="right" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-right-align" aria-describedby="lex-right-align"' : ''} class="toggle-button" aria-label="Right Align">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignRightSharp"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"></path></svg>
              </button>
              <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="justify" type="button" ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-justify-align" aria-describedby="lex-justify-align"' : ''} class="toggle-button" aria-label="Justify Align">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignJustifySharp"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"></path></svg>
              </button>
          </div>
          <div role="toolbar" class="toggle-button-group subgroup pl-1 left" data-popover data-pelem="#lex-edit-block-element" data-mouse="">
              <button data-lexical-block-style-button="" type="button" data-click="" aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg>
              </button>
          </div>
          <div role="toolbar" class="toggle-button-group subgroup left">
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-upload-or-take-image" aria-describedby="lex-upload-or-take-image"' : ''}>
              <button data-lexical-image-button="" data-click="" type="button" class="toggle-button" aria-label="Upload or Take Image">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ImageSharp"><path d="M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
              </button>
              </div>
              
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-upload-or-record-audio" aria-describedby="lex-upload-or-record-audio"' : ''}>
              <button data-lexical-audio-button="" data-click="" type="button" class="toggle-button" aria-label="Upload or Record Audio">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AudiotrackSharp"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
              </button>
              </div>
              
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-upload-or-take-video" aria-describedby="lex-upload-or-take-video"' : ''}>
              <button data-lexical-video-button="" data-click="" type="button" class="toggle-button" aria-label="Upload or Record Video">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VideocamSharp"><path d="M17 10.5V6H3v12h14v-4.5l4 4v-11l-4 4z"></path></svg>
              </button>
              </div>
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-custom-html-pop" aria-describedby="lex-insert-custom-html-pop"' : ''}>
                  <button data-custom-html-btn type="button" class="toggle-button" aria-label="Insert Custom HTML">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Html"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm14 0H13c-.55 0-1 .45-1 1v5h1.5v-4.5h1V14H16v-3.51h1V15h1.5v-5c0-.55-.45-1-1-1zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
                  </button>
                  <input data-lexical-gif-input="" multiple="" type="file" hidden="hidden" accept=".gif">
              </div>

              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-upload-gif" aria-describedby="lex-upload-gif"' : ''}>
                  <button data-lexical-gif-button="" data-click="" type="button" class="toggle-button" aria-label="Upload GIF">
                      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Gif"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"></path></svg>
                  </button>
                  <input data-lexical-gif-input="" multiple="" type="file" hidden="hidden" accept=".gif">
              </div>
          
              <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-speech-to-text" aria-describedby="lex-speech-to-text"' : ''}>
              <button data-lexical-speech-to-text="" data-click="" type="button" class="toggle-button lex-stt" aria-label="Speech to Text">
                  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Mic"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
              </button>
              </div>
      
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-download-state" aria-describedby="lex-download-state"' : ''}>
              <button data-download-state="" data-click="" type="button" class="toggle-button" aria-label="Download Editor State">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Download"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path></svg>
              </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-upload-state" aria-describedby="lex-upload-state"' : ''}>
              <button data-dialog="lex-upload-file-dialog" data-click="" type="button" class="toggle-button" aria-label="Upload Lexical, Markdown, Notebook, or TeX">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Upload"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"></path></svg>
              </button>
          </div>
          <div data-lexical-link-popup="" id="lexical-insert-link-main_" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="bottom" data-click-capture="">
              <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
                  <label for="lex-insert-link-main-url_">Link URL:</label>
                  <div class="text-input block medium">
                      <input data-lexical-link-input="" name="lex-insert-link-main-url_" id="lex-insert-link-main-url_" class="mt-1 
                      medium icon-before" placeholder="Enter the URL of the link..." maxlength="1500" autocomplete="off" autocapitalize="on" spellcheck="false" type="url" style="padding: 5px 12px;">
                      <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
                          </path>
                      </svg>
                  </div>
              </div>
              <p hidden="" class="caption t-warning" data-error-text="">
                  Please input a valid url.
              </p>
              <div class="mt-1 flex-row w-100 justify-between align-center">
                  <button data-close-menu="" class="warning filled small" type="button">
                  CLOSE
                  </button>
                  <div>
                  <button hidden="" class="filled error small" type="button" data-lexical-remove-link="" style="margin-right: 4px;">
                      REMOVE LINK
                  </button>
                  <button class="filled success small" type="button" data-lexical-link-submit="">
                      SUBMIT
                  </button>
                  </div>
              </div>
                  
          </div>
          <div data-lexical-abbr-popup id="lexical-insert-abbr_${uuid}" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="bottom" data-click-capture="">
              <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
                  <label for="lex-insert-abbr-input_${uuid}">Abbreviation:</label>
                  <div class="text-input block medium">
                      <input data-lexical-abbr-input="" name="lex-insert-abbr-input_${uuid}" id="lex-insert-abbr-input_${uuid}" class="mt-1 
                      medium icon-before" placeholder="Enter the Abbreviation for the selected text" maxlength="200" autocomplete="off" autocapitalize="on" spellcheck="false" type="text" style="padding: 5px 12px;">
                      <svg class="icon-before" title="ShortText" tabindex="-1" viewBox="0 0 24 24"><path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z"></path></svg>
                  </div>
              </div>
              <div class="mt-1 flex-row w-100 justify-between align-center">
                  <button data-close-menu="" class="warning filled small" type="button">
                  CLOSE
                  </button>
                  <div>
                  <button hidden="" class="filled error small" type="button" data-lexical-remove-abbr="" style="margin-right: 4px;">
                      REMOVE ABBREVIATION
                  </button>
                  <button class="filled success small" type="button" data-lexical-abbr-submit="">
                      SUBMIT
                  </button>
                  </div>
              </div>
                  
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-embed-media-content" aria-describedby="lex-embed-media-content"' : ''}>
          <button data-lexical-embed-media="" data-click="" type="button" class="toggle-button" aria-label="Insert Embedded Content" aria-haspopup="dialog" data-popover data-pelem="#embed-media-content-popup_">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ThumbUp"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg>              </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-quote" aria-describedby="lex-insert-quote"' : ''}>
          <button data-lexical-insert-quote-button="" aria-haspopup="dialog" data-popover data-pelem="#lex-insert-quotes-popover_" data-click="" type="button" class="toggle-button" aria-label="Insert Quote">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-lists" aria-describedby="lex-insert-lists"' : ''}>
          <button data-lexical-list-button="" aria-haspopup="dialog" data-popover data-pelem="#lex-insert-lists-popover_" data-click="" type="button" class="toggle-button" aria-label="Insert List">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListSharp"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-code" aria-describedby="lex-insert-code"' : ''}>
          <button data-lexical-insert-code="" data-click="" data-popover data-pelem="#lex-insert-code-menu_" type="button" class="toggle-button" aria-label="Insert Code">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CodeSharp"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
          </button>
          </div>
          
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-math" aria-describedby="lex-insert-math"' : ''}>
          <button data-lexical-math-button="" data-click="" aria-haspopup="dialog" data-dialog="math-markup-lexical" type="button" class="toggle-button" aria-label="Insert Equation">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Functions"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-table" aria-describedby="lex-insert-table"' : ''}>
          <button data-lexical-table-button="" data-click="" aria-haspopup="dialog" data-dialog="tables-lexical" type="button" class="toggle-button" aria-label="Insert Table">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableView"><path d="M19 7H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 2v2H9V9h10zm-6 6v-2h2v2h-2zm2 2v2h-2v-2h2zm-4-2H9v-2h2v2zm6-2h2v2h-2v-2zm-8 4h2v2H9v-2zm8 2v-2h2v2h-2zM6 17H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1h-2V5H5v10h1v2z"></path></svg>
          </button>
          </div>

          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-hr" aria-describedby="lex-hr"' : ''}>
          <button data-lexical-hr-button="" data-click="" aria-haspopup="dialog" data-dialog="horizontal-rule-lexical" type="button" class="toggle-button" aria-label="Insert Horizontal Rule">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HorizontalRule"><path fill-rule="evenodd" d="M4 11h16v2H4z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-column" aria-describedby="lex-insert-column"' : ''}>
              <button data-lexical-column-button data-dialog="column-layout-lexical" aria-haspopup="dialog" type="button" class="toggle-button" aria-label="Insert Columnar Layout">
                  <svg viewBox="0 0 512 512" title="table-columns" focusable="false" inert tabindex="-1"><path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zm64 64V416H224V160H64zm384 0H288V416H448V160z"></path></svg>
              </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-aside" aria-describedby="lex-insert-aside"' : ''}>
          <button data-lexical-aside-button="" aria-haspopup="dialog" data-popover data-pelem="#lex-insert-aside-menu_" data-click="" type="button" class="toggle-button" aria-label="Insert Aside">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="East"><path d="m15 5-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-details" aria-describedby="lex-insert-details"' : ''}>
          <button data-lexical-details-button="" data-click="" aria-haspopup="dialog" data-dialog="details-content-lexical" type="button" class="toggle-button" aria-label="Insert Details Element">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Details"><path d="M12 3 2 21h20L12 3zm1 5.92L18.6 19H13V8.92zm-2 0V19H5.4L11 8.92z"></path></svg>
          </button>
          </div>
          <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-para" aria-describedby="lex-para"' : ''}>
          <button data-insert-paragraph-button="" data-click="" type="button" class="toggle-button" aria-label="Insert Paragraph At End of Editor">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"><path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8-4-4v3H5v2h12v3l4-4z"></path></svg>
          </button>
          </div>
      </div>
      <div role="toolbar" class="block hz-scroll">
          <div hidden="" data-insert-media="" data-type="image" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
          <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
              <p class="grow-1 flex-row h6 bold">Insert Images</p>
              <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
              </button>
          </div>
          <details aria-label="Image Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
              <summary>
                  <span class="body1 fw-regular">Image Requirements</span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content body2" aria-hidden="true">
              <ul>
                  <li>
                  Images must be less than <strong>5 MegaBytes</strong> in size.
                  </li>
                  <li>
                  Images must have one of the following file types: .jpeg, .jpg, .png, .webp, .gif, .bmp, or .svg.
                  </li>
                  <li>
                  For inputs that accept multiple images, the maximum number of images you can upload at once is 
                  <strong>30</strong>.
                  </li>
              </ul>
              </div>
          </details>
          <div class="tabs">
              <ul class="tabs" role="tablist">
              <li role="presentation">
                  <button id="lexical-upload-single-image_" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
                  Single Image
                  </button>
              </li>
              <li role="presentation">
                  <button id="lexical-upload-multiple-images_" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
                  Multiple Images
                  </button>
              </li>
              </ul>
          </div>
          <div class="tab-panels">
              <div aria-labelledby="lexical-upload-single-image_" role="tabpanel" tabindex="0">
              <div class="block mt-1">
                  <details aria-label="About Uploading Images" class="mt-2" style="background-color: var(--background)!important;">
                  <summary>
                      <span class="body1 fw-regular">Uploading Images</span>
                      <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </summary>
                  <div class="accordion-content body2" aria-hidden="true">
                      <ol>
                      <li>
                          Upload an image.
                      </li>
                      <li>
                          Edit the image. Make sure that you save the edits on the image by clicking the checkmark button before submitting the form. 
                          <ul class="first">
                          <li>
                              For each image, you have the opportunity to add a title and a description of the image. The title and description will be shown 
                              when the user clicks on the image. The title will be used as the <span class="t-info bold">alt</span> attribute for the image as well.
                          </li>
                          </ul>
                      </li>
                      <li class="fw-regular t-warning">
                          If you want to add additional images, it is best to submit the form and relaunch this dialog.
                      </li>
                      </ol>
                  </div>
                  </details>
                  <div data-form="" data-type="image" data-count="single" class="mt-1">
                  
                  <label for="lexical-upload-single-image-input_" class="body1 bold">Upload Single Image:</label>
                  <input class="primary mt-1" type="file" data-image-input="" accept="image/*" id="lexical-upload-single-image-input_" name="lexical-upload-single-image-input_">
                  <output for="lexical-upload-single-image-input_" class="block mt-1"></output>
          
                  <div class="flex-row mt-2 align-center justify-between">
                      <button type="button" data-reset="" class="medium filled warning">
                      Reset
                      </button>
                      <button type="button" data-submit="" class="medium filled info">
                      SUBMIT IMAGES
                      </button>
                  </div>
                  </div>
              </div>   
              </div>
              <div aria-labelledby="lexical-upload-multiple-images_" role="tabpanel" tabindex="0" hidden="">
              <div class="block mt-1">
                  <details aria-label="About Uploading Multiple Images" class="mt-2" style="background-color: var(--background)!important;">
                  <summary>
                      <span class="body1 fw-regular">Uploading Multiple Images</span>
                      <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </summary>
                  <div class="accordion-content body2" aria-hidden="true">
                      <ol class="first">
                      <li>
                          Upload all the images that you want to include in the input.
                      </li>
                      <li>
                          Select how you want the images to appear in the editor.
                          <ul>
                          <li>
                              <span class="bold">Image Carousel:</span>: Inserts an image carousel into the editor. <span class="t-warning fw-regular">Make sure you upload all the images that you want to include in the carousel on 
                              the first upload. Any subsequent uploads will replace the currently saved 
                              images and their associated edits. If you want to include additional images, it is best 
                              to submit the current form, and then relaunch the dialog to add more images.</span>
                          </li>
                          <li>
                              <span class="bold">Single Image(s)</span>: Inserts images into the editor as if they were inserted as a single image one by one.
                          </li>
                          </ul>
                      </li>
                      <li>
                          Edit the images. Make sure that you save the edits on each image by clicking the checkmark button before moving on to the next image.
                          <ul class="first">
                          <li>
                              For each image, you have the opportunity to add a title and a description of the image. The title and description will be shown 
                              when the user clicks on the image. The title will be used as the <span class="t-info bold">alt</span> attribute for the image as well.
                          </li>
                          </ul>
                      </li>
                      <li>
                          <span class="t-success bold">SUBMIT</span> the form, and the images will be added to the input.
                      </li>
                      </ol>
                  </div>
                  </details>
                  <div data-form="" data-type="image" data-count="multiple" class="mt-1">
                  <label for="lexical-upload-multiple-images-input_" class="body1 bold">Upload Multiple Images:</label>
                  <input class="secondary mt-1" type="file" data-image-input="" accept="image/*" multiple="" id="lexical-upload-multiple-images-input_" name="lexical-upload-multiple-images-input_">
                  <output for="lexical-upload-multiple-images-input_" class="block mt-1"></output>
                  <fieldset class="mt-1">
                      <legend class="body1 bold">Upload Type:</legend>
                      <div class="flex-row align-center wrap gap-3">
                      <label class="radio">
                      <input type="radio" value="single" name="multi-image-type" class="error">
                          As Single Image(s)
                      </label>
                      <label class="radio">
                      <input type="radio" value="carousel" name="multi-image-type" class="error" checked="">
                          Image Carousel
                      </label>
                      </div>
                  </fieldset>
                  <div class="flex-row mt-2 align-center justify-between">
                      <button type="button" data-reset="" class="medium filled warning">
                      Reset
                      </button>
                      <button type="button" data-submit="" class="medium filled info">
                      SUBMIT IMAGES
                      </button>
                  </div>
                  </div>
              </div>
              </div>
          </div>
          </div>
          <div hidden="" data-insert-media="" data-type="audio" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
          <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
              <p class="grow-1 flex-row h6 bold">Insert Audio</p>
              <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
              </button>
          </div>
          <details aria-label="Audio Upload Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
              <summary>
                  <span class="body1 fw-regular">Audio Upload Requirements</span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content body2" aria-hidden="true">
              <ul>
                  <li>
                  Each audio upload must be less than <strong>300 MegaBytes</strong> in size.
                  </li>
                  <li>
                  Audio uploads must have one of the following file types: .m4a, .flac, .mp3, .mp4, .wav, .wma, .aac, .webm, or .mpeg.
                  </li>
                  <li>
                  Each audio upload must have an associated title.
                  </li>
              </ul>
              </div>
          </details>
          <details aria-label="About Uploading Audio Recording" class="mt-2" style="background-color:var(--background);">
              <summary>
                  <span class="body1 fw-regular">Uploading Audio Recordings</span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content body2" aria-hidden="true">
              <ol>
                  <li>
                  Upload an audio recording.
                  </li>
                  <li>
                  Add a title for the audio recording.
                  </li>
                  <li>
                  <span class="t-info bold">SUBMIT</span> the form.
                  </li>
                  <li class="fw-regular t-warning">
                  If you want to add additional audio recordings, it is best to submit the form and relaunch this dialog.
                  </li>
              </ol>
              </div>
          </details>
          <div data-form="" data-type="audio" data-count="single" class="mt-1">
              <label for="lexical-upload-single-audio-input_" class="body1 bold">Upload Audio File:</label>
              <input class="mt-1" type="file" data-audio-input="" accept="audio/*" id="lexical-upload-single-audio-input_" name="lexical-upload-single-audio-input_">
              <output for="lexical-upload-single-audio-input_"></output>
              <div data-error-alert="" tabindex="-1" hidden="" class="alert icon medium error filled mt-2" role="alert">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
              <p class="alert">
                  Please enter valid inputs to insert an audio recording.  
              </p>
              </div>
              <div class="flex-row mt-2 align-center justify-between">
              <button type="button" data-reset="" class="medium filled warning">
                  Reset
              </button>
              <button type="button" data-submit="" class="medium filled info">
                  SUBMIT AUDIO
              </button>
              </div>
          </div>
          </div>
          <div hidden="" data-insert-media="" data-type="video" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
          <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
              <p class="grow-1 flex-row h6 bold">Insert Video</p>
              <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
              </button>
          </div>
          <details aria-label="Video Upload Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
              <summary>
                  <span class="body1 fw-regular">Video Upload Requirements</span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content body2" aria-hidden="true">
              <ul>
                  <li>
                  Each video upload must be less than <strong>300 MegaBytes</strong> in size.
                  </li>
                  <li>
                  Video uploads must have one of the following file types: .mp4, .mov, .avi, .wmv, .avchd, .webm, or .flv.
                  </li>
                  <li>
                  For inputs that accept multiple video files, the maximum number of video files you can upload at once is 
                  <strong>10</strong>.
                  </li>
                  <li>
                  Each uploaded video must have an associated title.
                  </li>
              </ul>
              </div>
          </details>
          <details aria-label="About Inserting Video" class="mt-2" style="background-color:var(--background);">
              <summary>
                  <span class="body1 fw-regular">
                  Uploading Videos
                  </span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content body2" aria-hidden="true">
              <ol>
                  <li>
                  Upload a video recording.
                  </li>
                  <li>
                  Add a title and optionally add a description for the video.
                  </li>
                  <li>
                  <span class="t-info bold">SUBMIT</span> the form.
                  </li>
                  <li class="fw-regular t-warning">
                  If you want to add additional videos, it is best to submit the form and relaunch this dialog.
                  </li>
              </ol>
              </div>
          </details>
          <div data-form="" data-type="video" data-count="single" class="mt-1">
              <label for="lexical-upload-single-video-input_" class="body1 bold">Upload Video:</label>
              <input class="mt-1" type="file" data-video-input="" accept="video/*" id="lexical-upload-single-video-input_" name="lexical-upload-single-video-input_">
              <output for="lexical-upload-single-video-input_"></output>
              <div data-error-alert="" tabindex="-1" hidden="" class="alert icon medium error filled mt-2" role="alert">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
              <p class="alert">
                  Please enter valid inputs to insert a video recording
              </p>
              </div>
              <div class="flex-row mt-2 align-center justify-between">
              <button type="button" data-reset="" class="medium filled warning">
                  Reset
              </button>
              <button type="button" data-submit="" class="medium filled info">
                  SUBMIT VIDEO
              </button>
              </div>
          </div>
          </div>
      </div>
  </div>
  <div role="dialog" class="floating-menu o-xs" id="lex-insert-aside-menu_" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
      <button type="button" data-mouse-down="" data-dispatch="INSERT_ASIDE_COMMAND" data-payload="left" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="West"><path d="m9 19 1.41-1.41L5.83 13H22v-2H5.83l4.59-4.59L9 5l-7 7 7 7z"></path></svg>
          Left Aside
      </button>
      <button type="button" data-mouse-down="" data-dispatch="INSERT_ASIDE_COMMAND" data-payload="right" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="East"><path d="m15 5-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z"></path></svg>
          Right Aside
      </button>
  </div>
  <div role="dialog" class="floating-menu o-xs" id="lex-insert-code-menu_" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
    <button type="button" data-mouse-down="" data-dialog="coding-lang-lexical" class="select-option" style="border-radius: 0px!important; width: 100%;" aria-selected="false">
        Code Block
    </button>
    <button type="button" data-mouse-down="" data-dispatch="FORMAT_TEXT_COMMAND" data-payload="code" class="select-option" style="border-radius: 0px!important; width: 100%;" aria-selected="false">
        Inline Code
    </button>
  </div>
  <div role="dialog" class="floating-menu o-xs" id="lex-insert-lists-popover_" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
      <button type="button" data-mouse-down="" data-dispatch="INSERT_ORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListAlt"><path d="M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"></path></svg>
          Ordered List
      </button>
      <button type="button" data-mouse-down="" data-dispatch="INSERT_UNORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="List"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>                  
          Unordered List
      </button>
      <button type="button" data-mouse-down="" data-dispatch="INSERT_CHECK_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Checklist"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"></path></svg>
          Check List
      </button>
  </div>
  <div role="dialog" class="floating-menu o-xs" id="lex-insert-quotes-popover_" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
    <button data-lexical-quote-button="" data-dispatch="INSERT_QUOTE_COMMAND" type="button" data-mouse-down="" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
        <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>
        Block Quote
    </button>
    <button type="button" data-mouse-down="" data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>
        Inline Quote
    </button>
  </div>

  <div id="embed-media-content-popup_" class="floating-menu o-xs" role="dialog" style="padding:0px;border-radius:2px;min-width: 190px;" data-placement="top-start">
      <button data-embed-news="" data-mouse-down="" type="button" data-dialog="lex-embed-news" class="icon-text medium social-media news">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Newspaper"><path d="m22 3-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z"></path></svg>
          Embed News Article
      </button>
      <button data-embed-youtube="" data-mouse-down="" type="button" data-dialog="lex-embed-youtube" class="icon-text medium social-media youtube">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="YouTube"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path></svg>
          Embed Youtube Video
      </button>
      <button data-embed-x data-mouse-down type="button" data-dialog="lex-embed-twitter" class="icon-text medium social-media twitter" >
        <svg viewBox="0 0 512 512" title="x-twitter" focusable="false" inert tabindex="-1"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>
        Embed X Post
    </button>
    <button data-embed-tiktok data-mouse-down type="button" data-dialog="lex-embed-tiktok" class="icon-text medium social-media tiktok" >
        <svg viewBox="0 0 448 512" title="tiktok" focusable="false" inert tabindex="-1"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>
        Embed TikTok Video
    </button>
    <button data-embed-instagram data-mouse-down type="button" data-dialog="lex-embed-instagram"class="icon-text medium social-media instagram" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Instagram"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
        Embed Instagram Post
    </button>
  </div>
  
  <div contenteditable="true" data-rich-text-editor="" data-type="full" data-editable="true" spellcheck="true" style="min-height: ${(obj === null || obj === void 0 ? void 0 : obj.minHeight) || 600}px; user-select: text; white-space: pre-wrap; word-break: break-word;" data-lexical-editor="true">${innerHTML}${END_PADDING}</div>
</div>`;
}
exports.getArticleBuilderImplementation = getArticleBuilderImplementation;
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
function getCommentImplementation(req, id = "comment", disabled = false, initialHTML = "<p>Insert comment here...</p>", options = { wrapperStyle: 'block lexical-wrapper mt-3', type: 'comment', rteStyle: 'max-height: 400px; min-height: 150px; overflow-y:auto;' }) {
    var _a;
    const obj = getFullLexicalRenderObj();
    obj.initialHTML = initialHTML;
    var backgroundColor = '';
    var textColor = '';
    if (req.session.settings) {
        if (req.session.settings.mode === "light") {
            backgroundColor = req.session.settings.lightMode.background;
            textColor = req.session.settings.lightMode.textColor;
        }
        else {
            backgroundColor = req.session.settings.darkMode.background;
            textColor = req.session.settings.darkMode.textColor;
        }
    }
    var wrapperStyle = options.wrapperStyle;
    const desktop = Boolean((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop);
    const rteStyle = options.rteStyle;
    const uuid = node_crypto_1.default.randomUUID();
    return /*html*/ `<div class="${wrapperStyle}" id="${id}" data-current="false">
<div role="toolbar" class="toggle-button-group hz-scroll">
    
    <div role="toolbar" class="toggle-button-group subgroup left">
        <div ${desktop ? 'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"' : ''}>
        <button data-lexical-bg-color-button aria-haspopup="dialog" data-popover data-click data-pelem="#${obj['lexical-background-color-menu']}" data-force-close type="button" class="toggle-button" aria-label="Background Color">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorFillSharp"><path d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z"></path></svg>
        </button>
        </div>
        <div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="${obj['lexical-background-color-menu']}">
        <label class="body2" for="${obj['lexical-background-color-1']}">Background Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
            <input data-lexical-background-color type="color" data-coloris name="${obj['lexical-background-color-1']}" id="${obj['lexical-background-color-1']}" value="${backgroundColor}" style="margin-top: 2px;">
            <span class="body2">${backgroundColor}</span>
        </div>
        <label class="checkbox mt-1">
            <input data-lexical-background-transparent checked type="checkbox" class="secondary" name="${obj['lex-background-color-transparent']}" id="${obj['lex-background-color-transparent']}">
            Transparent
        </label>
        </div>
        <div ${desktop ? 'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"' : ''}>
        <button data-lexical-text-color-button data-popover data-pelem="#${obj['lexical-text-color-menu']}" data-force-close aria-haspopup="dialog" data-click type="button" class="toggle-button" aria-label="Text Color">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorTextSharp"><path d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z"></path></svg>
        </button>
        </div>
        <div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="${obj['lexical-text-color-menu']}">
        <label class="body2" for="${obj['lexical-text-color-1']}">Text Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
            <input data-lexical-text-color type="color" data-coloris name="${obj['lexical-text-color-1']}" id="${obj['lexical-text-color-1']}" value="${textColor}" style="margin-top: 2px;">
            <span class="body2">${textColor}</span>
        </div>
        <label class="checkbox mt-1">
            <input data-lexical-text-transparent checked type="checkbox" class="secondary" name="${obj['lex-text-color-transparent']}" id="${obj['lex-text-color-transparent']}">
            Inherit
        </label>
        </div>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-bold" aria-describedby="lex-bold"' : ''} class="toggle-button" aria-label="Bold" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-italic" aria-describedby="lex-italic"' : ''} class="toggle-button" aria-label="Italic" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"' : ''} class="toggle-button" aria-label="Strikethrough" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp"><path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-underline" aria-describedby="lex-underline"' : ''} class="toggle-button" aria-label="Underline" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatUnderlinedSharp"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"></path></svg>
        </button>
        <button  data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-kbd" aria-describedby="lex-kbd"' : ''}  class="toggle-button" aria-label="Insert Keyboard Command">
        <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z"></path></svg>
        </button>
        <button  data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"' : ''}  class="toggle-button" aria-label="Insert Quote">
        <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"' : ''} class="toggle-button" aria-label="Superscript" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp"><path d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"' : ''} class="toggle-button" aria-label="Subscript" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp"><path d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"></path></svg>
        </button>
        <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"' : ''} class="toggle-button" aria-label="Clear Text Formatting" >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear"><path d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"></path></svg>
        </button>
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"' : ''}>
        <button data-lexical-link-button data-click type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog"  data-popover data-pelem="#${obj['lexical-insert-link-main']}" data-force-close>
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
        </button>
        </div>
    </div>
    <div role="toolbar" class="toggle-button-group subgroup pl-1 left" ${desktop ? 'data-popover data-pelem="#lex-edit-block-element" data-mouse' : ''}>
        <button data-lexical-block-style-button type="button" data-click aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg>
        </button>
    </div>
    
    <div role="toolbar" class="toggle-button-group subgroup pl-1 left">
        <div hidden id="${obj['hidden-label-lexical-size-1']}">Font Size For Editor</div>
        <button 
        style="height: 2.13rem!important; border-radius: 0px!important;" 
        type="button" 
        role="combobox" 
        aria-haspopup="listbox" 
        aria-controls="${obj['lexical-font-size-dropdown']}" 
        aria-labelledby="${obj['hidden-label-lexical-size-1']}"
        data-pelem="#${obj['lexical-font-size-dropdown']}"
        aria-expanded="false" 
        data-placeholder="Current Font Size for Lexical" 
        class="select small" 
        data-popover 
        data-click
        data-lexical-font-size-button
        ${desktop ? 'data-force-close' : ''}
        >
        <span class="body1" style="width: max-content!important; min-width: 60px!important; text-align: left!important;">Font Size</span>
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
        </button>
        <div 
        ${desktop ? 'data-click-capture' : ''}
        style="width: fit-content!important;" 
        tabindex="0" 
        id="${obj['lexical-font-size-dropdown']}" 
        role="listbox" 
        class="select-menu o-xs" 
        data-placement="bottom"
        >
        <input data-lexical-font-size-input type="text" hidden="" value="400" name="${obj['font_size_lexical']}" id="${obj['font_size_lexical']}">
        <button data-val="Inherit" type="button" tabindex="-1" class="select-option" role="option" aria-selected="true">
            Inherit
        </button>
        <button data-val="caption" type="button" tabindex="-1" class="select-option caption" role="option" aria-selected="false">
            Caption
        </button>
        <button data-val="body2" type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false">
            Body 2
        </button>
        <button data-val="body1" type="button" tabindex="-1" class="select-option body1" role="option" aria-selected="false">
            Body 1
        </button>
        <button data-val="h6" type="button" tabindex="-1" class="select-option h6" role="option" aria-selected="false">
            H6
        </button>
        <button data-val="h5" type="button" tabindex="-1" class="select-option h5" role="option" aria-selected="false">
            H5
        </button>
        <button data-val="h4" type="button" tabindex="-1" class="select-option h4" role="option" aria-selected="false">
            H4
        </button>
        <button data-val="h3" type="button" tabindex="-1" class="select-option h3" role="option" aria-selected="false">
            H3
        </button>
        <button data-val="h2" type="button" tabindex="-1" class="select-option h2" role="option" aria-selected="false">
            H2
        </button>
        <button data-val="h1" type="button" tabindex="-1" class="select-option h1" role="option" aria-selected="false">
            H1
        </button>
        </div>
        <button data-dispatch="UNDO_COMMAND" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-undo-last-change" aria-describedby="lex-undo-last-change"' : ''} class="toggle-button" aria-label="Undo">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="UndoSharp"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
        </button>
        <button data-dispatch="REDO_COMMAND" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-redo-last-change" aria-describedby="lex-redo-last-change"' : ''} class="toggle-button" aria-label="Redo">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RedoSharp"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
        </button>
        <button data-dispatch="CLEAR_EDITOR_COMMAND" data-payload="false" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-clear-editor" aria-describedby="lex-clear-editor"' : ''} class="toggle-button" aria-label="Reset">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Clear"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>                      
        </button>
        <button data-dispatch="INSERT_LINE_BREAK_COMMAND" type="button" ${desktop ? 'data-popover data-mouse data-pelem="#lex-insert-line-break" aria-describedby="lex-insert-line-break"' : ''} class="toggle-button" aria-label="New Line">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardReturnSharp"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"></path></svg>
        </button>  
    </div>
    <div role="toolbar" class="toggle-button-group subgroup left">
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-upload-or-take-image" aria-describedby="lex-upload-or-take-image"' : ''}>
        <button data-lexical-image-button data-click type="button" class="toggle-button" aria-label="Upload or Take Image">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ImageSharp"><path d="M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
        </button>
        </div>
        
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-upload-or-record-audio" aria-describedby="lex-upload-or-record-audio"' : ''}>
        <button data-lexical-audio-button data-click type="button" class="toggle-button" aria-label="Upload or Record Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AudiotrackSharp"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
        </button>
        </div>
        
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-upload-or-take-video" aria-describedby="lex-upload-or-take-video"' : ''}>
        <button data-lexical-video-button data-click type="button" class="toggle-button" aria-label="Upload or Record Video">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VideocamSharp"><path d="M17 10.5V6H3v12h14v-4.5l4 4v-11l-4 4z"></path></svg>
        </button>
        </div>

        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-upload-gif" aria-describedby="lex-upload-gif"' : ''}>
        <button data-lexical-gif-button data-click type="button" class="toggle-button" aria-label="Upload GIF">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Gif"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"></path></svg>
        </button>
        <input data-lexical-gif-input multiple type="file" hidden="hidden" accept=".gif" />
        </div>
    
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-speech-to-text" aria-describedby="lex-speech-to-text"' : ''}>
        <button data-lexical-speech-to-text data-click type="button" class="toggle-button lex-stt" aria-label="Speech to Text">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Mic"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
        </button>
        </div>
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-lists" aria-describedby="lex-insert-lists"' : ''}>
        <button data-lexical-list-button aria-haspopup="dialog" data-popover data-pelem="#${obj['lex-insert-lists-popover']}" data-click type="button"  class="toggle-button" aria-label="Insert List">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListSharp"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>
        </button>
        </div>
        <div ${desktop ? 'data-popover data-mouse="" data-pelem="#lex-insert-custom-html-pop" aria-describedby="lex-insert-custom-html-pop"' : ''}>
            <button data-custom-html-btn type="button" class="toggle-button" aria-label="Insert Custom HTML">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Html"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm14 0H13c-.55 0-1 .45-1 1v5h1.5v-4.5h1V14H16v-3.51h1V15h1.5v-5c0-.55-.45-1-1-1zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
            </button>
            <input data-lexical-gif-input="" multiple="" type="file" hidden="hidden" accept=".gif">
        </div>
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-quote" aria-describedby="lex-insert-quote"' : ''}>
        <button data-lexical-quote-button="" data-dispatch="INSERT_QUOTE_COMMAND"  data-click type="button" class="toggle-button" aria-label="Insert Quote">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>
        </button>
        </div>
        
    
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-code" aria-describedby="lex-insert-code"' : ''}>
        <button data-lexical-insert-code data-click data-popover data-pelem="#${obj['lex-insert-code-menu']}" type="button" class="toggle-button" aria-label="Insert Code">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CodeSharp"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
        </button>
        </div>
        
    
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-math" aria-describedby="lex-insert-math"' : ''}>
        <button data-lexical-math-button data-click  aria-haspopup="dialog" data-dialog="math-markup-lexical" type="button" class="toggle-button" aria-label="Insert Equation">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Functions"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"></path></svg>
        </button>
        </div>
    
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-insert-table" aria-describedby="lex-insert-table"' : ''}>
        <button data-lexical-table-button data-click aria-haspopup="dialog" data-dialog="tables-lexical" type="button" class="toggle-button" aria-label="Insert Table">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableView"><path d="M19 7H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 2v2H9V9h10zm-6 6v-2h2v2h-2zm2 2v2h-2v-2h2zm-4-2H9v-2h2v2zm6-2h2v2h-2v-2zm-8 4h2v2H9v-2zm8 2v-2h2v2h-2zM6 17H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1h-2V5H5v10h1v2z"></path></svg>
        </button>
        </div>
    
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-hr" aria-describedby="lex-hr"' : ''}>
        <button data-lexical-hr-button data-click aria-haspopup="dialog" data-dialog="horizontal-rule-lexical" type="button" class="toggle-button" aria-label="Insert Horizontal Rule">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HorizontalRule"><path fill-rule="evenodd" d="M4 11h16v2H4z"></path></svg>
        </button>
        </div>
        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-embed-media-content" aria-describedby="lex-embed-media-content"' : ''}>
        <button data-lexical-embed-media data-click type="button" class="toggle-button" aria-label="Insert Embedded Content" aria-haspopup="dialog" 
        data-popover
        data-pelem="#${obj['embed-media-content-popup']}"
        data-click 
        >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ThumbUp"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg>              </button>
        </div>


        <div data-lexical-link-popup id="${obj['lexical-insert-link-main']}" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="top-start" data-click-capture>
            <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
            <label for="${obj['lex-insert-link-main-url']}">Link URL:</label>
            <div class="text-input block medium">
                <input
                data-lexical-link-input
                name="${obj['lex-insert-link-main-url']}"
                id="${obj['lex-insert-link-main-url']}" 
                class="mt-1 
                medium icon-before" 
                placeholder="Enter the URL of the link..." 
                maxlength="1500"
                autocomplete="off" 
                autocapitalize="on" 
                spellcheck="false" 
                type="url" 
                style="padding: 5px 12px;"
                >
                <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
                    </path>
                </svg>
            </div>
            </div>
            <p hidden class="caption t-warning" data-error-text>
            Please input a valid url.
            </p>
            <div class="mt-1 flex-row w-100 justify-between align-center">
            <button data-close-menu class="warning filled small" type="button">
                CLOSE
            </button>
            <div>
                <button hidden class="filled error small" type="button" data-lexical-remove-link style="margin-right: 4px;">
                REMOVE LINK
                </button>
                <button class="filled success small" type="button" data-lexical-link-submit>
                SUBMIT
                </button>
            </div>
            </div>
            
        </div>

        <div role="dialog" class="floating-menu o-xs" id="${obj['lex-insert-code-menu']}" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
        <button type="button" data-mouse-down data-dialog="coding-lang-lexical" class="select-option" style="border-radius: 0px!important; width: 100%;">
            Code Block
        </button>
        <button type="button" data-mouse-down data-dispatch="FORMAT_TEXT_COMMAND" data-payload="code" class="select-option" style="border-radius: 0px!important; width: 100%;">
            Inline Code
        </button>
        </div>
        <div role="dialog" class="floating-menu o-xs" id="${obj['lex-insert-lists-popover']}" style="padding: 0px; border-radius: 0px; min-width: 150px;" data-placement="bottom-start">
        <button type="button" data-mouse-down data-dispatch="INSERT_ORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListAlt"><path d="M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"></path></svg>
            Ordered List
        </button>
        <button type="button" data-mouse-down data-dispatch="INSERT_UNORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="List"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>                  
            Unordered List
        </button>
        <button type="button" data-mouse-down="" data-dispatch="INSERT_CHECK_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Checklist"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"></path></svg>
            Check List
        </button>
        </div>
        <div id="${obj['embed-media-content-popup']}" class="floating-menu o-xs" role="dialog" style="padding:0px;border-radius:2px;min-width: 190px;" data-placement="top-start">
        <button data-embed-news data-mouse-down type="button" data-dialog="lex-embed-news" class="icon-text medium social-media news">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Newspaper"><path d="m22 3-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z"></path></svg>
            Embed News Article
        </button>
        <button data-embed-youtube data-mouse-down type="button" data-dialog="lex-embed-youtube"class="icon-text medium social-media youtube" >
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="YouTube"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path></svg>
            Embed Youtube Video
        </button>
        <button data-embed-x data-mouse-down type="button" data-dialog="lex-embed-twitter" class="icon-text medium social-media twitter" >
            <svg viewBox="0 0 512 512" title="x-twitter" focusable="false" inert tabindex="-1"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>
            Embed X Post
        </button>
        <button data-embed-tiktok data-mouse-down type="button" data-dialog="lex-embed-tiktok" class="icon-text medium social-media tiktok" >
            <svg viewBox="0 0 448 512" title="tiktok" focusable="false" inert tabindex="-1"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>
            Embed TikTok Video
        </button>
        <button data-embed-instagram data-mouse-down type="button" data-dialog="lex-embed-instagram"class="icon-text medium social-media instagram" >
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Instagram"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
            Embed Instagram Post
        </button>
        </div>

        <div ${Boolean(desktop === true) ? 'data-popover data-mouse data-pelem="#lex-para" aria-describedby="lex-para"' : ''}>
        <button data-insert-paragraph-button data-click type="button" class="toggle-button" aria-label="Insert Paragraph At End of Editor">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"><path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8-4-4v3H5v2h12v3l4-4z"></path></svg>
        </button>
        </div>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="left" type="button" ${Boolean(desktop === true) ? 'data-popover data-mouse="" data-pelem="#lex-left-align" aria-describedby="lex-left-align"' : ''} class="toggle-button selected" aria-label="Left Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignLeftSharp"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="center" type="button" ${Boolean(desktop === true) ? 'data-popover data-mouse="" data-pelem="#lex-center-align" aria-describedby="lex-center-align"' : ''} class="toggle-button" aria-label="Center Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignCenterSharp"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="right" type="button" ${Boolean(desktop === true) ? 'data-popover data-mouse="" data-pelem="#lex-right-align" aria-describedby="lex-right-align"' : ''} class="toggle-button" aria-label="Right Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignRightSharp"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="justify" type="button" ${Boolean(desktop === true) ? 'data-popover data-mouse="" data-pelem="#lex-justify-align" aria-describedby="lex-justify-align"' : ''} class="toggle-button" aria-label="Justify Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignJustifySharp"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"></path></svg>
        </button>

    </div>
    
    </div>
    <div role="toolbar" class="block hz-scroll">
        <div hidden="" data-insert-media="" data-type="image" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
        <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
            <p class="grow-1 flex-row h6 bold">Insert Images</p>
            <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
            </button>
        </div>
        <details aria-label="Image Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
            <summary>
                <span class="body1 fw-regular">Image Requirements</span>
                <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                </path>
                </svg>
            </summary>
            <div class="accordion-content body2" aria-hidden="true">
            <ul>
                <li>
                Images must be less than <strong>5 MegaBytes</strong> in size.
                </li>
                <li>
                Images must have one of the following file types: .jpeg, .jpg, .png, .webp, .gif, .bmp, or .svg.
                </li>
                <li>
                For inputs that accept multiple images, the maximum number of images you can upload at once is 
                <strong>30</strong>.
                </li>
            </ul>
            </div>
        </details>
        <div class="tabs">
            <ul class="tabs" role="tablist">
            <li role="presentation">
                <button id="lexical-upload-single-image_" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
                Single Image
                </button>
            </li>
            <li role="presentation">
                <button id="lexical-upload-multiple-images_" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
                Multiple Images
                </button>
            </li>
            </ul>
        </div>
        <div class="tab-panels">
            <div aria-labelledby="lexical-upload-single-image_" role="tabpanel" tabindex="0">
            <div class="block mt-1">
                <details aria-label="About Uploading Images" class="mt-2" style="background-color: var(--background)!important;">
                <summary>
                    <span class="body1 fw-regular">Uploading Images</span>
                    <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                        </path>
                    </svg>
                </summary>
                <div class="accordion-content body2" aria-hidden="true">
                    <ol>
                    <li>
                        Upload an image.
                    </li>
                    <li>
                        Edit the image. Make sure that you save the edits on the image by clicking the checkmark button before submitting the form. 
                        <ul class="first">
                        <li>
                            For each image, you have the opportunity to add a title and a description of the image. The title and description will be shown 
                            when the user clicks on the image. The title will be used as the <span class="t-info bold">alt</span> attribute for the image as well.
                        </li>
                        </ul>
                    </li>
                    <li class="fw-regular t-warning">
                        If you want to add additional images, it is best to submit the form and relaunch this dialog.
                    </li>
                    </ol>
                </div>
                </details>
                <div data-form="" data-type="image" data-count="single" class="mt-1">
                
                <label for="lexical-upload-single-image-input_" class="body1 bold">Upload Single Image:</label>
                <input class="primary mt-1" type="file" data-image-input="" accept="image/*" id="lexical-upload-single-image-input_${uuid}" name="lexical-upload-single-image-input_${uuid}">
                <output for="lexical-upload-single-image-input_${uuid}" class="block mt-1"></output>
        
                <div class="flex-row mt-2 align-center justify-between">
                    <button type="button" data-reset="" class="medium filled warning">
                    Reset
                    </button>
                    <button type="button" data-submit="" class="medium filled info">
                    SUBMIT IMAGES
                    </button>
                </div>
                </div>
            </div>   
            </div>
            <div aria-labelledby="lexical-upload-multiple-images_" role="tabpanel" tabindex="0" hidden="">
            <div class="block mt-1">
                <details aria-label="About Uploading Multiple Images" class="mt-2" style="background-color: var(--background)!important;">
                <summary>
                    <span class="body1 fw-regular">Uploading Multiple Images</span>
                    <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                        <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                        </path>
                    </svg>
                </summary>
                <div class="accordion-content body2" aria-hidden="true">
                    <ol class="first">
                    <li>
                        Upload all the images that you want to include in the input.
                    </li>
                    <li>
                        Select how you want the images to appear in the editor.
                        <ul>
                        <li>
                            <span class="bold">Image Carousel:</span>: Inserts an image carousel into the editor. <span class="t-warning fw-regular">Make sure you upload all the images that you want to include in the carousel on 
                            the first upload. Any subsequent uploads will replace the currently saved 
                            images and their associated edits. If you want to include additional images, it is best 
                            to submit the current form, and then relaunch the dialog to add more images.</span>
                        </li>
                        <li>
                            <span class="bold">Single Image(s)</span>: Inserts images into the editor as if they were inserted as a single image one by one.
                        </li>
                        </ul>
                    </li>
                    <li>
                        Edit the images. Make sure that you save the edits on each image by clicking the checkmark button before moving on to the next image.
                        <ul class="first">
                        <li>
                            For each image, you have the opportunity to add a title and a description of the image. The title and description will be shown 
                            when the user clicks on the image. The title will be used as the <span class="t-info bold">alt</span> attribute for the image as well.
                        </li>
                        </ul>
                    </li>
                    <li>
                        <span class="t-success bold">SUBMIT</span> the form, and the images will be added to the input.
                    </li>
                    </ol>
                </div>
                </details>
                <div data-form="" data-type="image" data-count="multiple" class="mt-1">
                <label for="lexical-upload-multiple-images-input_${uuid}" class="body1 bold">Upload Multiple Images:</label>
                <input class="secondary mt-1" type="file" data-image-input="" accept="image/*" multiple="" id="lexical-upload-multiple-images-input_${uuid}" name="lexical-upload-multiple-images-input_${uuid}">
                <output for="lexical-upload-multiple-images-input_${uuid}" class="block mt-1"></output>
                <fieldset class="mt-1">
                    <legend class="body1 bold">Upload Type:</legend>
                    <div class="flex-row align-center wrap gap-3">
                    <label class="radio">
                    <input type="radio" value="single" name="multi-image-type" class="error">
                        As Single Image(s)
                    </label>
                    <label class="radio">
                    <input type="radio" value="carousel" name="multi-image-type" class="error" checked="">
                        Image Carousel
                    </label>
                    </div>
                </fieldset>
                <div class="flex-row mt-2 align-center justify-between">
                    <button type="button" data-reset="" class="medium filled warning">
                    Reset
                    </button>
                    <button type="button" data-submit="" class="medium filled info">
                    SUBMIT IMAGES
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
        <div hidden="" data-insert-media="" data-type="audio" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
        <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
            <p class="grow-1 flex-row h6 bold">Insert Audio</p>
            <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
            </button>
        </div>
        <details aria-label="Audio Upload Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
            <summary>
                <span class="body1 fw-regular">Audio Upload Requirements</span>
                <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                </path>
                </svg>
            </summary>
            <div class="accordion-content body2" aria-hidden="true">
            <ul>
                <li>
                Each audio upload must be less than <strong>300 MegaBytes</strong> in size.
                </li>
                <li>
                Audio uploads must have one of the following file types: .m4a, .flac, .mp3, .mp4, .wav, .wma, .aac, .webm, or .mpeg.
                </li>
                <li>
                Each audio upload must have an associated title.
                </li>
            </ul>
            </div>
        </details>
        <details aria-label="About Uploading Audio Recording" class="mt-2" style="background-color:var(--background);">
            <summary>
                <span class="body1 fw-regular">Uploading Audio Recordings</span>
                <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                </path>
                </svg>
            </summary>
            <div class="accordion-content body2" aria-hidden="true">
            <ol>
                <li>
                Upload an audio recording.
                </li>
                <li>
                Add a title for the audio recording.
                </li>
                <li>
                <span class="t-info bold">SUBMIT</span> the form.
                </li>
                <li class="fw-regular t-warning">
                If you want to add additional audio recordings, it is best to submit the form and relaunch this dialog.
                </li>
            </ol>
            </div>
        </details>
        <div data-form="" data-type="audio" data-count="single" class="mt-1">
            <label for="lexical-upload-single-audio-input_${uuid}" class="body1 bold">Upload Audio File:</label>
            <input class="mt-1" type="file" data-audio-input="" accept="audio/*" id="lexical-upload-single-audio-input_${uuid}" name="lexical-upload-single-audio-input_${uuid}">
            <output for="lexical-upload-single-audio-input_${uuid}"></output>
            <div data-error-alert="" tabindex="-1" hidden="" class="alert icon medium error filled mt-2" role="alert">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
            <p class="alert">
                Please enter valid inputs to insert an audio recording.  
            </p>
            </div>
            <div class="flex-row mt-2 align-center justify-between">
            <button type="button" data-reset="" class="medium filled warning">
                Reset
            </button>
            <button type="button" data-submit="" class="medium filled info">
                SUBMIT AUDIO
            </button>
            </div>
        </div>
        </div>
        <div hidden="" data-insert-media="" data-type="video" style="background-color: var(--secondary-background); padding: 6px; border-radius: 0px 0px 6px 6px;">
        <div class="flex-row align-center justify-between bb-main" style="margin-bottom: 4px;">
            <p class="grow-1 flex-row h6 bold">Insert Video</p>
            <button class="icon medium close-insert-media-section" type="button" aria-label="Close Section">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
            </button>
        </div>
        <details aria-label="Video Upload Requirements" class="small" style="background-color: var(--background); margin-top: 2px;">
            <summary>
                <span class="body1 fw-regular">Video Upload Requirements</span>
                <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                </path>
                </svg>
            </summary>
            <div class="accordion-content body2" aria-hidden="true">
            <ul>
                <li>
                Each video upload must be less than <strong>300 MegaBytes</strong> in size.
                </li>
                <li>
                Video uploads must have one of the following file types: .mp4, .mov, .avi, .wmv, .avchd, .webm, or .flv.
                </li>
                <li>
                For inputs that accept multiple video files, the maximum number of video files you can upload at once is 
                <strong>10</strong>.
                </li>
                <li>
                Each uploaded video must have an associated title.
                </li>
            </ul>
            </div>
        </details>
        <details aria-label="About Inserting Video" class="mt-2" style="background-color:var(--background);">
            <summary>
                <span class="body1 fw-regular">
                Uploading Videos
                </span>
                <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                </path>
                </svg>
            </summary>
            <div class="accordion-content body2" aria-hidden="true">
            <ol>
                <li>
                Upload a video recording.
                </li>
                <li>
                Add a title and optionally add a description for the video.
                </li>
                <li>
                <span class="t-info bold">SUBMIT</span> the form.
                </li>
                <li class="fw-regular t-warning">
                If you want to add additional videos, it is best to submit the form and relaunch this dialog.
                </li>
            </ol>
            </div>
        </details>
        <div data-form="" data-type="video" data-count="single" class="mt-1">
            <label for="lexical-upload-single-video-input_${uuid}" class="body1 bold">Upload Video:</label>
            <input class="mt-1" type="file" data-video-input="" accept="video/*" id="lexical-upload-single-video-input_${uuid}" name="lexical-upload-single-video-input_${uuid}">
            <output for="lexical-upload-single-video-input_${uuid}"></output>
            <div data-error-alert="" tabindex="-1" hidden="" class="alert icon medium error filled mt-2" role="alert">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
            <p class="alert">
                Please enter valid inputs to insert a video recording
            </p>
            </div>
            <div class="flex-row mt-2 align-center justify-between">
            <button type="button" data-reset="" class="medium filled warning">
                Reset
            </button>
            <button type="button" data-submit="" class="medium filled info">
                SUBMIT VIDEO
            </button>
            </div>
        </div>
        </div>
    </div>
    <div ${disabled ? 'disabled' : ''} contenteditable="${disabled ? 'false' : 'true'}" data-rich-text-editor data-type="${options.type}" data-editable="true" spellcheck="true" style="${rteStyle}">${obj.initialHTML}${END_PADDING}</div>
</div>`;
}
exports.getCommentImplementation = getCommentImplementation;
function getTextOnlyImplementation(req, id = 'text-implementation', noColor = false) {
    var _a, _b;
    const obj = getFullLexicalRenderObj();
    obj.initialHTML = '<p>Insert comment here...</p>';
    obj.settingsMode = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mode) === "light" ? "lightMode" : "darkMode";
    obj.settings = req.session.settings;
    const ifNotNoColor1 = /*html*/ `<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"'
  :''%>>
  <button data-lexical-bg-color-button aria-haspopup="dialog" data-popover data-click
      data-pelem="#<%=locals['lexical-background-color-menu']%>" data-force-close type="button"
      class="toggle-button" aria-label="Background Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorFillSharp">
          <path
              d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-background-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-background-color-1']%>">Background Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-background-color type="color" data-coloris name="<%=locals['lexical-background-color-1']%>"
          id="<%=locals['lexical-background-color-1']%>"
          value="<%=locals?.settings[settingsMode].background%>" style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].background%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-background-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-background-color-transparent']%>"
          id="<%=locals['lex-background-color-transparent']%>">
      Transparent
  </label>
</div>
<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"'
  :''%>>
  <button data-lexical-text-color-button data-popover data-pelem="#<%=locals['lexical-text-color-menu']%>"
      data-force-close aria-haspopup="dialog" data-click type="button" class="toggle-button"
      aria-label="Text Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorTextSharp">
          <path
              d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-text-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-text-color-1']%>">Text Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-text-color type="color" data-coloris name="<%=locals['lexical-text-color-1']%>"
          id="<%=locals['lexical-text-color-1']%>" value="<%=locals?.settings[settingsMode].textColor%>"
          style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].textColor%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-text-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-text-color-transparent']%>" id="<%=locals['lex-text-color-transparent']%>">
      Inherit
  </label>
</div>`;
    const ifNotNoColor2 = /*html*/ `<button data-lexical-block-style-button="" type="button" data-click="" aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg></button>`;
    return ejs_1.default.render(/*html*/ `<div class="block lexical-wrapper mt-3" id="${id}" data-current="false">
  <div role="toolbar" class="toggle-button-group hz-scroll">
      <div role="toolbar" class="toggle-button-group subgroup">
         ${!!!noColor ? ifNotNoColor1 : ''}
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-bold" aria-describedby="lex-bold"' :''%>
              class="toggle-button" aria-label="Bold" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp">
                  <path
                      d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-italic" aria-describedby="lex-italic"'
              :''%> class="toggle-button" aria-label="Italic" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"'
              :''%> class="toggle-button" aria-label="Strikethrough" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp">
                  <path
                      d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-underline" aria-describedby="lex-underline"'
              :''%> class="toggle-button" aria-label="Underline" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
                  title="FormatUnderlinedSharp">
                  <path
                      d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-kbd" aria-describedby="lex-kbd"' :''%>
              class="toggle-button" aria-label="Insert Keyboard Command">
              <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1">
                  <path
                      d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"'
              :''%> class="toggle-button" aria-label="Insert Quote">
              <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1">
                  <path
                      d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"'
              :''%> class="toggle-button" aria-label="Superscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp">
                  <path
                      d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"'
              :''%> class="toggle-button" aria-label="Subscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp">
                  <path
                      d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"'
              :''%> class="toggle-button" aria-label="Clear Text Formatting" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear">
                  <path
                      d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z">
                  </path>
              </svg>
          </button>
          ${!!!noColor ? ifNotNoColor2 : ''}
      </div>
  </div>
  <div contenteditable="true" data-rich-text-editor ${noColor ? 'data-no-color' : ''} data-type="text-only" data-editable="true" spellcheck="true" style="max-height: 400px; min-height: 150px; overflow-y:auto;"><%-locals?.initialHTML || '<p>Enter content here...</p>'%>${END_PADDING}</div>
</div>`, obj);
}
exports.getTextOnlyImplementation = getTextOnlyImplementation;
function getTextWithLinksImplementation(req, id = "text-links-implementation", noColor = false) {
    var _a, _b;
    const obj = getFullLexicalRenderObj();
    obj.initialHTML = '<p>Insert comment here...</p>';
    obj.settingsMode = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mode) === "light" ? "lightMode" : "darkMode";
    obj.settings = req.session.settings;
    const ifNotNoColor1 = /*html*/ `<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"'
  :''%>>
  <button data-lexical-bg-color-button aria-haspopup="dialog" data-popover data-click
      data-pelem="#<%=locals['lexical-background-color-menu']%>" data-force-close type="button"
      class="toggle-button" aria-label="Background Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorFillSharp">
          <path
              d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-background-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-background-color-1']%>">Background Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-background-color type="color" data-coloris name="<%=locals['lexical-background-color-1']%>"
          id="<%=locals['lexical-background-color-1']%>"
          value="<%=locals?.settings[settingsMode].background%>" style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].background%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-background-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-background-color-transparent']%>"
          id="<%=locals['lex-background-color-transparent']%>">
      Transparent
  </label>
</div>
<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"'
  :''%>>
  <button data-lexical-text-color-button data-popover data-pelem="#<%=locals['lexical-text-color-menu']%>"
      data-force-close aria-haspopup="dialog" data-click type="button" class="toggle-button"
      aria-label="Text Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorTextSharp">
          <path
              d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-text-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-text-color-1']%>">Text Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-text-color type="color" data-coloris name="<%=locals['lexical-text-color-1']%>"
          id="<%=locals['lexical-text-color-1']%>" value="<%=locals?.settings[settingsMode].textColor%>"
          style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].textColor%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-text-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-text-color-transparent']%>" id="<%=locals['lex-text-color-transparent']%>">
      Inherit
  </label>
</div>`;
    const ifNotNoColor2 = /*html*/ `<button data-lexical-block-style-button="" type="button" data-click="" aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg></button>`;
    return ejs_1.default.render(/*html*/ `<div class="block lexical-wrapper mt-3" id="${id}" data-current="false">
  <div role="toolbar" class="toggle-button-group hz-scroll">
      <div role="toolbar" class="toggle-button-group subgroup">
          ${!!!noColor ? ifNotNoColor1 : ''}
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-bold" aria-describedby="lex-bold"' :''%>
              class="toggle-button" aria-label="Bold" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp">
                  <path
                      d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-italic" aria-describedby="lex-italic"'
              :''%> class="toggle-button" aria-label="Italic" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"'
              :''%> class="toggle-button" aria-label="Strikethrough" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp">
                  <path
                      d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-underline" aria-describedby="lex-underline"'
              :''%> class="toggle-button" aria-label="Underline" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
                  title="FormatUnderlinedSharp">
                  <path
                      d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-kbd" aria-describedby="lex-kbd"' :''%>
              class="toggle-button" aria-label="Insert Keyboard Command">
              <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1">
                  <path
                      d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"'
              :''%> class="toggle-button" aria-label="Insert Quote">
              <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1">
                  <path
                      d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"'
              :''%> class="toggle-button" aria-label="Superscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp">
                  <path
                      d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"'
              :''%> class="toggle-button" aria-label="Subscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp">
                  <path
                      d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"'
              :''%> class="toggle-button" aria-label="Clear Text Formatting" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear">
                  <path
                      d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z">
                  </path>
              </svg>
          </button>
          <div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"':''%>>
          <button data-lexical-link-button data-click type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog"  data-popover data-pelem="#<%=locals['lexical-insert-link-main']%>" data-force-close>
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
          </button>
        </div>
        ${!!!noColor ? ifNotNoColor2 : ''}
      </div>
  </div>
  <div data-lexical-link-popup id="<%=locals['lexical-insert-link-main']%>" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="top-start" data-click-capture>
          <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
            <label for="<%=locals['lex-insert-link-main-url']%>">Link URL:</label>
            <div class="text-input block medium">
                <input
                data-lexical-link-input
                name="<%=locals['lex-insert-link-main-url']%>"
                id="<%=locals['lex-insert-link-main-url']%>" 
                class="mt-1 
                medium icon-before" 
                placeholder="Enter the URL of the link..." 
                maxlength="1500"
                autocomplete="off" 
                autocapitalize="on" 
                spellcheck="false" 
                type="url" 
                style="padding: 5px 12px;"
                >
                <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
                    </path>
                </svg>
            </div>
          </div>
          <p hidden class="caption t-warning" data-error-text>
            Please input a valid url.
          </p>
          <div class="mt-1 flex-row w-100 justify-between align-center">
            <button data-close-menu class="warning filled small" type="button">
              CLOSE
            </button>
            <div>
              <button hidden class="filled error small" type="button" data-lexical-remove-link style="margin-right: 4px;">
                REMOVE LINK
              </button>
              <button class="filled success small" type="button" data-lexical-link-submit>
                SUBMIT
              </button>
            </div>
          </div>
            
        </div>
  <div contenteditable="true" data-rich-text-editor ${noColor ? 'data-no-color' : ''} data-type="text-with-links" data-edtable="true" spellcheck="true" style="max-height: 400px; min-height: 150px; overflow-y:auto;"><%-locals?.initialHTML || '<p>Enter content here...</p>'%>${END_PADDING}</div>
</div>`, obj);
}
exports.getTextWithLinksImplementation = getTextWithLinksImplementation;
function getTextBlockTextImplementation(req, id = "text-blocks-implementation", noColor = false, max_height = 400) {
    var _a, _b;
    const obj = getFullLexicalRenderObj();
    obj.initialHTML = '<p>Insert comment here...</p>';
    obj.settingsMode = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mode) === "light" ? "lightMode" : "darkMode";
    obj.settings = req.session.settings;
    const ifNotNoColor1 = /*html*/ `<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"'
  :''%>>
  <button data-lexical-bg-color-button aria-haspopup="dialog" data-popover data-click
      data-pelem="#<%=locals['lexical-background-color-menu']%>" data-force-close type="button"
      class="toggle-button" aria-label="Background Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorFillSharp">
          <path
              d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-background-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-background-color-1']%>">Background Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-background-color type="color" data-coloris name="<%=locals['lexical-background-color-1']%>"
          id="<%=locals['lexical-background-color-1']%>"
          value="<%=locals?.settings[settingsMode].background%>" style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].background%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-background-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-background-color-transparent']%>"
          id="<%=locals['lex-background-color-transparent']%>">
      Transparent
  </label>
</div>
<div <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"'
  :''%>>
  <button data-lexical-text-color-button data-popover data-pelem="#<%=locals['lexical-text-color-menu']%>"
      data-force-close aria-haspopup="dialog" data-click type="button" class="toggle-button"
      aria-label="Text Color">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
          title="FormatColorTextSharp">
          <path
              d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z">
          </path>
      </svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end"
  id="<%=locals['lexical-text-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-text-color-1']%>">Text Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
      <input data-lexical-text-color type="color" data-coloris name="<%=locals['lexical-text-color-1']%>"
          id="<%=locals['lexical-text-color-1']%>" value="<%=locals?.settings[settingsMode].textColor%>"
          style="margin-top: 2px;">
      <span class="body2">
          <%=locals?.settings[settingsMode].textColor%>
      </span>
  </div>
  <label class="checkbox mt-1">
      <input data-lexical-text-transparent checked type="checkbox" class="secondary"
          name="<%=locals['lex-text-color-transparent']%>" id="<%=locals['lex-text-color-transparent']%>">
      Inherit
  </label>
</div>`;
    const ifNotNoColor2 = /*html*/ `<button data-lexical-block-style-button="" type="button" data-click="" aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg></button>`;
    return ejs_1.default.render(/*html*/ `<div class="block lexical-wrapper mt-3" id="${id}" data-current="false">
  <div role="toolbar" class="toggle-button-group hz-scroll">
      <div role="toolbar" class="toggle-button-group subgroup left">
            ${!!!noColor ? ifNotNoColor1 : ''}
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-bold" aria-describedby="lex-bold"' :''%>
              class="toggle-button" aria-label="Bold" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp">
                  <path
                      d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-italic" aria-describedby="lex-italic"'
              :''%> class="toggle-button" aria-label="Italic" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"'
              :''%> class="toggle-button" aria-label="Strikethrough" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp">
                  <path
                      d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-underline" aria-describedby="lex-underline"'
              :''%> class="toggle-button" aria-label="Underline" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"
                  title="FormatUnderlinedSharp">
                  <path
                      d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-kbd" aria-describedby="lex-kbd"' :''%>
              class="toggle-button" aria-label="Insert Keyboard Command">
              <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1">
                  <path
                      d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"'
              :''%> class="toggle-button" aria-label="Insert Quote">
              <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1">
                  <path
                      d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"'
              :''%> class="toggle-button" aria-label="Superscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp">
                  <path
                      d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"'
              :''%> class="toggle-button" aria-label="Subscript" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp">
                  <path
                      d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z">
                  </path>
              </svg>
          </button>
          <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button"
              <%-locals.desktop? 'data-popover data-mouse data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"'
              :''%> class="toggle-button" aria-label="Clear Text Formatting" >
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear">
                  <path
                      d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z">
                  </path>
              </svg>
          </button>
          <div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"':''%>>
          <button data-lexical-link-button data-click type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog"  data-popover data-pelem="#<%=locals['lexical-insert-link-main']%>" data-force-close>
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
          </button>
        </div>
        
      </div>
      
  <div role="toolbar" class="toggle-button-group subgroup pl-1">     <div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-lists" aria-describedby="lex-insert-lists"':''%>>         <button data-lexical-list-button aria-haspopup="dialog" data-popover data-pelem="#<%=locals['lex-insert-lists-popover']%>" data-click type="button" class="toggle-button" aria-label="Insert List">         <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ListSharp">             <path                 d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z">             </path>         </svg>         </button>     </div>     <div role="dialog" class="floating-menu o-xs" id="<%=locals['lex-insert-lists-popover']%>"         style="padding: 0px; border-radius: 0px;" data-placement="bottom-start">         <button type="button" data-mouse-down data-dispatch="INSERT_ORDERED_LIST_COMMAND"             class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">             <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ListAlt">                 <path                     d="M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z">                 </path>             </svg>             Ordered List         </button>         <button type="button" data-mouse-down data-dispatch="INSERT_UNORDERED_LIST_COMMAND"             class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">             <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="List">                 <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>             </svg>             Unordered List         </button>  <button type="button" data-mouse-down="" data-dispatch="INSERT_CHECK_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Checklist"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"></path></svg>
            Check List
        </button>   </div>   <div <%-Boolean(locals.desktop===true)?' data-popover data-mouse data-pelem="#lex-insert-quote"         aria-describedby="lex-insert-quote"':''%>>     <button data-lexical-quote-button="" data-dispatch="INSERT_QUOTE_COMMAND"  data-click type="button" class="toggle-button" aria-label="Insert Quote">         <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>     </button>     </div> 
  ${!!!noColor ? ifNotNoColor2 : ''}

</div>   </div>

  <div data-lexical-link-popup id="<%=locals['lexical-insert-link-main']%>" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="top-start" data-click-capture>
          <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
            <label for="<%=locals['lex-insert-link-main-url']%>">Link URL:</label>
            <div class="text-input block medium">
                <input
                data-lexical-link-input
                name="<%=locals['lex-insert-link-main-url']%>"
                id="<%=locals['lex-insert-link-main-url']%>" 
                class="mt-1 
                medium icon-before" 
                placeholder="Enter the URL of the link..." 
                maxlength="1500"
                autocomplete="off" 
                autocapitalize="on" 
                spellcheck="false" 
                type="url" 
                style="padding: 5px 12px;"
                >
                <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
                    </path>
                </svg>
            </div>
          </div>
          <p hidden class="caption t-warning" data-error-text>
            Please input a valid url.
          </p>
          <div class="mt-1 flex-row w-100 justify-between align-center">
            <button data-close-menu class="warning filled small" type="button">
              CLOSE
            </button>
            <div>
              <button hidden class="filled error small" type="button" data-lexical-remove-link style="margin-right: 4px;">
                REMOVE LINK
              </button>
              <button class="filled success small" type="button" data-lexical-link-submit>
                SUBMIT
              </button>
            </div>
          </div>
            
  </div>
  <div contenteditable="true" data-rich-text-editor ${noColor ? 'data-no-color' : ''} data-type="text-block-elements" data-editable="true" spellcheck="true" style="max-height: ${max_height}px; min-height: 150px; overflow-y:auto;"><%-locals?.initialHTML || '<p>Enter content here...</p>'%>${END_PADDING}</div>
</div>`, obj);
}
exports.getTextBlockTextImplementation = getTextBlockTextImplementation;
