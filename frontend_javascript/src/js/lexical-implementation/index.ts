/**
 * @file File for my vanilla js implementation of Lexical
 * @author Frank Brown 
 * 
 */
import { EDITOR_THEME } from "./EDITOR_THEME";
import { 
  isTouchDevice, 
  onNewContentLoaded 
} from "../shared";
import { 
  $isDecoratorNode,
  $isElementNode, 
  $nodesOfType, 
  createEditor, 
  VALID_HEX_REGEX 
} from '../lexical-folder/lexicalLexical';
import { 
  registerRichTextEditable,
  registerRichTextNotEditable, 
  HeadingNode, 
  QuoteNode,
  registerHistoryCustomEditable,
  ListNode,
  ListItemNode, 
  registerListEditable,
  LinkNode, 
  registerLinkEditable,
  AsideNode,
  registerAsideEditable,
  DetailsNode,
  AccordionContentNode,
  registerDetailsElementEditable,
  registerDetailsElementNotEdiable,
  registerToolbarEditable,
  UPDATE_TOOLBAR_COMMAND,
  handleEditorFocus, 
  getEditorInstances,
  setEditorInstance,
  registerMaxLengthEditable,
  registerTableEditable,
  registerTableNotEditableListener,
  TableNode,
  TableWrapperNode,
  TableRowNode,
  TableCellNode,
  CellParagraphNode,
  YouTubeNode,
  TwitterNode,
  TikTokNode,
  InstagramNode,
  NewsNode,
  HorizontalRuleNode,
  AudioNode,
  VideoNode,
  ImageNode,
  CarouselImageNode,
  registerDecoratorsEditable,
  OverflowNode,
  $generateNodesFromDOM,
  $getRoot,
  ExtendedTextNode,
  TextNode,
  insertPlaceholder,
  registerMathEditable,
  registerMathNotEditable,
  MathNode,
  CodeNode,
  CodeHighlightNode, 
  registerCodeEditable,
  registerCodeNotEditable,
  getCurrentEditor,
  SET_EDITOR_COMMAND,
  registerMarkdownShortcutsEditable,
  FULL_EDITOR_TRANSFORMERS,
  COMMENT_EDITOR_TRANSFORMERS,
  TEXT_ONLY_EDITOR_TRANSFORMERS,
  TEXT_WITH_LINKS_EDITOR_TRANSFORMERS,
  TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS,
  SectionHeadingNode,
  registerSectionHeadingNodeEditable,
  HtmlNode,
  registerHTMLNodeEditable,
  registerHTMLNodeNotEditable,
  registerCommentArticleNotEditable,
  SCROLL_TO_NODE,
  registerDecoratorsNotEditable,
  registerLayoutEditable,
  registerAbbrEditable,
  LayoutContainerNode,
  LayoutItemNode,
  AbbreviationNode,
  registerAnnotationEditable,
  registerAnnotationNotEditable,
  registerCommentEditable,
  AnnotationNode,
  registerSaveAndReloadHistoryEditable,
  registerCommentNotEditable,
  registerMaxHeightNode,
  MaxHeightButtonNode,
  AutocompleteNode,
  LoadingNode,
  registerAutocompleteEditable,
  registerAIWritingHelperEditable,
  $convertToMarkdownString,
  getCurrentEditorID, 
  setCurrentEditor,
  registerLoadUnloadToolbarEditable,
  AiChatNode,
} from './lexicalBundle1';
import { 
  DocOrEl, 
  NEW_CONTENT_LOADED_CED
} from "..";
import { 
  $generateHtmlFromNodes 
} from "../lexical-folder/lexical-htmlLexicalHtml";
import { UPDATE_ON_SET_HTML } from "../lexical-folder/lexical-sharedLexicalShared";


var LISTENERS_TO_REMOVE: {[id: string]: (() => void)[]} = {};
var GET_EDITOR_INSTANCES: undefined|(() => {
  [idOfWrapperDiv: string]: any;
}) = undefined;
var UPDATE_TOOLBAR_COMMAND_REF: undefined|any = undefined;

export {
  getEditorInstances,
  getCurrentEditor
};


const SETTING_EDITOR_INSTANCES:{[id: string]:boolean}={};

export function getFullLexicalRenderObj() {
  const rand = window.crypto.randomUUID()
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

type CommentOptions = {
  wrapperStyle: string,
  type: 'comment'|'survey-question'|'survey-short-blog'|'survey-option'|'range-description';
  rteStyle:string,
  lexicalState?: string
}

export function getCommentImplementation(id:string="comment",disabled:boolean=false,initialHTML="<p>Insert comment here...</p>",options:CommentOptions={ wrapperStyle: 'block lexical-wrapper mt-3', type:'comment', rteStyle: 'max-height: 400px; min-height: 150px; overflow-y:auto;' }) {
  const obj:any = getFullLexicalRenderObj();
  obj.initialHTML = initialHTML;
  const html = document.querySelector('html');
  const mode = html?.getAttribute("data-mode")==="light" ? "light" : "dark";
  const backgroundColorEl = document.getElementById(`background-${mode}-settings-color`) as HTMLInputElement|null;
  const textColorEl = document.getElementById(`textColor-${mode}-settings-color`) as HTMLInputElement|null;
  const backgroundColor = backgroundColorEl && VALID_HEX_REGEX.test(backgroundColorEl.value) ? backgroundColorEl.value : '#000000';
  const textColor = textColorEl && VALID_HEX_REGEX.test(textColorEl.value) ? textColorEl.value : '#ffffff';
  var wrapperStyle =options.wrapperStyle;
  const desktop = !!!isTouchDevice();
  const rteStyle = options.rteStyle;
  const uuid = window.crypto.randomUUID();
  const div = document.createElement('div');
  div.className=wrapperStyle;
  div.id = id;
  div.setAttribute('data-current','false');
  const includeSocialMedia = Boolean(options.type!=='range-description'&&options.type!=='survey-option');
  const includeHTMLNode = Boolean(options.type!=='range-description');
  div.insertAdjacentHTML("beforeend",`<div role="toolbar" class="toggle-button-group hz-scroll">
     
      <div role="toolbar" class="toggle-button-group subgroup left">
        <div ${desktop? 'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"':''}>
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
        <div ${desktop? 'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"':''}>
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
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="bold" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-bold" aria-describedby="lex-bold"':''} class="toggle-button" aria-label="Bold" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="italic" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-italic" aria-describedby="lex-italic"':''} class="toggle-button" aria-label="Italic" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="strikethrough" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-strikethrough" aria-describedby="lex-strikethrough"':''} class="toggle-button" aria-label="Strikethrough" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp"><path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="underline" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-underline" aria-describedby="lex-underline"':''} class="toggle-button" aria-label="Underline" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatUnderlinedSharp"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"></path></svg>
        </button>
        <button  data-dispatch="FORMAT_TEXT_COMMAND" data-payload="kbd" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-kbd" aria-describedby="lex-kbd"':''}  class="toggle-button" aria-label="Insert Keyboard Command">
          <svg viewBox="0 0 576 512" title="keyboard" focusable="false" inert tabindex="-1"><path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z"></path></svg>
        </button>
        <button  data-dispatch="FORMAT_TEXT_COMMAND" data-payload="quote" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-quote-inline" aria-describedby="lex-quote-inline"':''}  class="toggle-button" aria-label="Insert Quote">
          <svg viewBox="0 0 448 512" title="quote-left" focusable="false" inert tabindex="-1"><path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"':''} class="toggle-button" aria-label="Superscript" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp"><path d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"':''} class="toggle-button" aria-label="Subscript" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp"><path d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"></path></svg>
        </button>
        <button data-dispatch="CLEAR_TEXT_FORMATTING" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-clear-text-formatting" aria-describedby="lex-clear-text-formatting"':''} class="toggle-button" aria-label="Clear Text Formatting" >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear"><path d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"></path></svg>
        </button>
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"':''}>
          <button data-lexical-link-button data-click type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog"  data-popover data-pelem="#${obj['lexical-insert-link-main']}" data-force-close>
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
          </button>
        </div>
      </div>
      <div role="toolbar" class="toggle-button-group subgroup pl-1 left" ${desktop? 'data-popover data-pelem="#lex-edit-block-element" data-mouse':''}>
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
        ${desktop?'data-force-close':''}
        >
          <span class="body1" style="width: max-content!important; min-width: 60px!important; text-align: left!important;">Font Size</span>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
        </button>
        <div 
        ${desktop?'data-click-capture':''}
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
        <button data-dispatch="UNDO_COMMAND" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-undo-last-change" aria-describedby="lex-undo-last-change"':''} class="toggle-button" aria-label="Undo">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="UndoSharp"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>
        </button>
        <button data-dispatch="REDO_COMMAND" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-redo-last-change" aria-describedby="lex-redo-last-change"':''} class="toggle-button" aria-label="Redo">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RedoSharp"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>
        </button>
        <button data-dispatch="CLEAR_EDITOR_COMMAND" data-payload="false" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-clear-editor" aria-describedby="lex-clear-editor"':''} class="toggle-button" aria-label="Reset">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Clear"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>                      
        </button>
        <button data-dispatch="INSERT_LINE_BREAK_COMMAND" type="button" ${desktop? 'data-popover data-mouse data-pelem="#lex-insert-line-break" aria-describedby="lex-insert-line-break"':''} class="toggle-button" aria-label="New Line">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardReturnSharp"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"></path></svg>
        </button>  
      </div>
      <div role="toolbar" class="toggle-button-group subgroup left">
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-upload-or-take-image" aria-describedby="lex-upload-or-take-image"':''}>
          <button data-lexical-image-button data-click type="button" class="toggle-button" aria-label="Upload or Take Image">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ImageSharp"><path d="M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
          </button>
        </div>
        
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-upload-or-record-audio" aria-describedby="lex-upload-or-record-audio"':''}>
          <button data-lexical-audio-button data-click type="button" class="toggle-button" aria-label="Upload or Record Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AudiotrackSharp"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
          </button>
        </div>
        
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-upload-or-take-video" aria-describedby="lex-upload-or-take-video"':''}>
          <button data-lexical-video-button data-click type="button" class="toggle-button" aria-label="Upload or Record Video">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VideocamSharp"><path d="M17 10.5V6H3v12h14v-4.5l4 4v-11l-4 4z"></path></svg>
          </button>
        </div>

        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-upload-gif" aria-describedby="lex-upload-gif"':''}>
          <button data-lexical-gif-button data-click type="button" class="toggle-button" aria-label="Upload GIF">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Gif"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"></path></svg>
          </button>
          <input data-lexical-gif-input multiple type="file" hidden="hidden" accept=".gif" />
        </div>
    
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-speech-to-text" aria-describedby="lex-speech-to-text"':''}>
          <button data-lexical-speech-to-text data-click type="button" class="toggle-button lex-stt" aria-label="Speech to Text">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Mic"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
          </button>
        </div>
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-lists" aria-describedby="lex-insert-lists"':''}>
          <button data-lexical-list-button aria-haspopup="dialog" data-popover data-pelem="#${obj['lex-insert-lists-popover']}" data-click type="button"  class="toggle-button" aria-label="Insert List">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListSharp"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>
          </button>
        </div>
        ${includeHTMLNode?`
        <div ${desktop?'data-popover data-mouse="" data-pelem="#lex-insert-custom-html-pop" aria-describedby="lex-insert-custom-html-pop"':''}>
            <button data-custom-html-btn data-dialog="lex-insert-custom-html" type="button" class="toggle-button" aria-label="Insert Custom HTML">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Html"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm14 0H13c-.55 0-1 .45-1 1v5h1.5v-4.5h1V14H16v-3.51h1V15h1.5v-5c0-.55-.45-1-1-1zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
            </button>
            <input data-lexical-gif-input="" multiple="" type="file" hidden="hidden" accept=".gif">
        </div>`:``}
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-quote" aria-describedby="lex-insert-quote"':''}>
          <button data-lexical-quote-button="" data-dispatch="INSERT_QUOTE_COMMAND"  data-click type="button" class="toggle-button" aria-label="Insert Quote">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>
          </button>
        </div>
        
    
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-code" aria-describedby="lex-insert-code"':''}>
          <button data-lexical-insert-code data-click data-popover data-pelem="#${obj['lex-insert-code-menu']}" type="button" class="toggle-button" aria-label="Insert Code">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CodeSharp"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
          </button>
        </div>
        
    
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-math" aria-describedby="lex-insert-math"':''}>
          <button data-lexical-math-button data-click  aria-haspopup="dialog" data-dialog="math-markup-lexical" type="button" class="toggle-button" aria-label="Insert Equation">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Functions"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"></path></svg>
          </button>
        </div>
    
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-insert-table" aria-describedby="lex-insert-table"':''}>
          <button data-lexical-table-button data-click aria-haspopup="dialog" data-dialog="tables-lexical" type="button" class="toggle-button" aria-label="Insert Table">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableView"><path d="M19 7H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 2v2H9V9h10zm-6 6v-2h2v2h-2zm2 2v2h-2v-2h2zm-4-2H9v-2h2v2zm6-2h2v2h-2v-2zm-8 4h2v2H9v-2zm8 2v-2h2v2h-2zM6 17H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1h-2V5H5v10h1v2z"></path></svg>
          </button>
        </div>
    
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-hr" aria-describedby="lex-hr"':''}>
          <button data-lexical-hr-button data-click aria-haspopup="dialog" data-dialog="horizontal-rule-lexical" type="button" class="toggle-button" aria-label="Insert Horizontal Rule">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HorizontalRule"><path fill-rule="evenodd" d="M4 11h16v2H4z"></path></svg>
          </button>
        </div>
        ${includeSocialMedia?`
        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-embed-media-content" aria-describedby="lex-embed-media-content"':''}>
          <button data-lexical-embed-media data-click type="button" class="toggle-button" aria-label="Insert Embedded Content" aria-haspopup="dialog" 
          data-popover
          data-pelem="#${obj['embed-media-content-popup']}"
          data-click 
          >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ThumbUp"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg>              </button>
        </div>`:``}


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
        ${includeSocialMedia?`
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
        </div>`:``}

        <div ${Boolean(desktop===true)?'data-popover data-mouse data-pelem="#lex-para" aria-describedby="lex-para"':''}>
          <button data-insert-paragraph-button data-click type="button" class="toggle-button" aria-label="Insert Paragraph At End of Editor">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"><path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8-4-4v3H5v2h12v3l4-4z"></path></svg>
          </button>
        </div>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="left" type="button" ${Boolean(desktop===true)?'data-popover data-mouse="" data-pelem="#lex-left-align" aria-describedby="lex-left-align"':''} class="toggle-button selected" aria-label="Left Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignLeftSharp"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="center" type="button" ${Boolean(desktop===true)?'data-popover data-mouse="" data-pelem="#lex-center-align" aria-describedby="lex-center-align"':''} class="toggle-button" aria-label="Center Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignCenterSharp"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="right" type="button" ${Boolean(desktop===true)?'data-popover data-mouse="" data-pelem="#lex-right-align" aria-describedby="lex-right-align"':''} class="toggle-button" aria-label="Right Align">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatAlignRightSharp"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"></path></svg>
        </button>
        <button data-dispatch="FORMAT_ELEMENT_COMMAND" data-payload="justify" type="button" ${Boolean(desktop===true)?'data-popover data-mouse="" data-pelem="#lex-justify-align" aria-describedby="lex-justify-align"':''} class="toggle-button" aria-label="Justify Align">
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
    <div ${disabled?'disabled':''} contenteditable="${disabled?'false':'true'}" data-rich-text-editor data-type="${options.type}" data-editable="true" spellcheck="true" style="${rteStyle}">
      ${obj.initialHTML}
    </div>`);
  const el = div.querySelector<HTMLDivElement>('div[data-rich-text-editor]');
  if (el) {
    if (options.lexicalState) {
      switch (options.type) {
        case 'comment': {
          registerComment(el);
          break;
        }
        case 'range-description': {
          registerRangeDescriptions(el);
          break;
        }
        case 'survey-option': {
          registerSurveyOption(el);
          break;
        }
        case 'survey-question': {
          registerSurveyQuestion(el);
          break;
        }
        case 'survey-short-blog': {
          registerSurveyShortBlog(el);
          break;
        }
        default: {
          throw new Error("Invalid type.");
        }
      }
      const lexicalState = getEditorInstances()[id];
      if (lexicalState) {
        const parsedEditorState = lexicalState.parseEditorState(JSON.parse(options.lexicalState));
        lexicalState.setEditorState(parsedEditorState);
        lexicalState.setEditable(true);
      }
    }
  }
  
  return div;
}
window.getCommentImplementation = getCommentImplementation;


/*------------------------------------------------------- register Lexical Types ---------------------------------- */
export async function convertNodesToMarkdownString(editorState:any) {
  const EDITOR_NODES_TOTAL = [
    ExtendedTextNode,
    { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
    ListNode,
    ListItemNode,
    HeadingNode,
    QuoteNode,
    LinkNode,
    YouTubeNode,
    HorizontalRuleNode,
    MathNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableWrapperNode,
    TableRowNode,
    TableCellNode,
    CellParagraphNode,
    AudioNode,
    VideoNode,
    CarouselImageNode,
    ImageNode,
    NewsNode,
    AsideNode,
    DetailsNode,
    AccordionContentNode,
    SectionHeadingNode,
    HtmlNode,
    TwitterNode,
    TikTokNode,
    InstagramNode,
    LayoutContainerNode,
    LayoutItemNode,
    AbbreviationNode,
    LoadingNode,
    AutocompleteNode
  ] as any[];
  const markdownEditor = createEditor({
    namespace: 'markdown_'.concat(window.crypto.randomUUID()),
    theme: structuredClone(EDITOR_THEME),
    onError: console.error,
    nodes: EDITOR_NODES_TOTAL,
    editable: true,
    editorType: 'full'
  });
  const parsed = markdownEditor.parseEditorState(editorState,undefined);
  markdownEditor.setEditorState(parsed,undefined);
  return new Promise<string>((resolve,reject) => {
    markdownEditor.update(() => {
      const str = $convertToMarkdownString(FULL_EDITOR_TRANSFORMERS as any);
      resolve(str);
    },undefined)
  })
}
window.convertNodesToMarkdownString = convertNodesToMarkdownString;



export function registerFullEditor(el:HTMLElement,setInstance?:boolean) {
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      const annotationOnly = el.hasAttribute('data-annotate-only');
      const displayOnly = el.hasAttribute('data-display-only');
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const innerHTML = editor.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        HeadingNode,
        QuoteNode,
        LinkNode,
        YouTubeNode,
        HorizontalRuleNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode,
        AudioNode,
        VideoNode,
        CarouselImageNode,
        ImageNode,
        NewsNode,
        AsideNode,
        DetailsNode,
        AccordionContentNode,
        SectionHeadingNode,
        HtmlNode,
        TwitterNode,
        TikTokNode,
        InstagramNode,
        LayoutContainerNode,
        LayoutItemNode,
        AbbreviationNode,
        AiChatNode,
      ] as any[];
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'full'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } 
      setEditorInstance(id,newEditorInstance);

      LISTENERS_TO_REMOVE[id] = [];
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerRichTextNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDetailsElementEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDetailsElementNotEdiable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAsideEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,FULL_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerSectionHeadingNodeEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance)); 
      if (editable)LISTENERS_TO_REMOVE[id].push(registerLayoutEditable(newEditorInstance))
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (!!!editable&&!!!displayOnly) LISTENERS_TO_REMOVE[id].push(registerCommentArticleNotEditable(newEditorInstance,annotationOnly)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable&&wrapper.hasAttribute('data-save-state')) LISTENERS_TO_REMOVE[id].push(registerSaveAndReloadHistoryEditable(newEditorInstance));
      // if (editable&&isTouchDevice()) LISTENERS_TO_REMOVE[id].push(registerStickyNavbar(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      if (!!!editable) newEditorInstance.setEditable(false);
      if (!!!editable) {
        const url = new URL(window.location.href);
        const scroll_to_node = url.searchParams.get('scroll_to_node');
        const namespace = url.searchParams.get('namespace');
        const start_str = url.searchParams.get('start');
        const start = parseInt(start_str||'');
        const end_str = url.searchParams.get('end');
        const end = parseInt(end_str||'');
        const content = url.searchParams.get('content');
        if (scroll_to_node==="true"&&Number.isInteger(start)&&Number.isInteger(end)&&content&&content.length&&namespace===newEditorInstance._config.namespace) {
          newEditorInstance.dispatchCommand(SCROLL_TO_NODE,{ start, end, content });
        } 
      }
      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
      newEditorInstance.getEditorState().read(() => {
        const twitterNodes = $nodesOfType(TwitterNode);
        const tiktokNodes = $nodesOfType(TikTokNode);
        const instagramNodes = $nodesOfType(InstagramNode);
        if (twitterNodes.length) document.dispatchEvent(new CustomEvent("EMBED_TWITTER"));
        if (tiktokNodes.length) document.dispatchEvent(new CustomEvent("EMBED_TIKTOK"));
        if (instagramNodes.length) document.dispatchEvent(new CustomEvent("EMBED_INSTAGRAM"));
      })
      
    } 
  }
}
// No Social 
export function registerComment(el:HTMLElement,setInstance?:boolean) {
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = editor.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        QuoteNode,
        LinkNode,
        YouTubeNode,
        TwitterNode,
        TikTokNode,
        InstagramNode,
        HorizontalRuleNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode,
        AudioNode,
        VideoNode,
        CarouselImageNode,
        ImageNode,
        NewsNode,
        HtmlNode,
        AbbreviationNode,
        AiChatNode,
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'comment'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      }
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,COMMENT_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCommentEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCommentNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (!!!editable) newEditorInstance.setEditable(false);
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
export function registerTextOnly(el:HTMLElement,setInstance?:boolean) {
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = editor.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode)
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'text-only'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } 
      setEditorInstance(id,newEditorInstance);

      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,TEXT_ONLY_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (!!!editable) newEditorInstance.setEditable('false');

      if (editable) insertPlaceholder(newEditorInstance);
      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
export function registerTextWithLinks(el:HTMLElement,setInstance?:boolean) {
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = editor.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        LinkNode,
        AbbreviationNode
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'text-with-links'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } 
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,TEXT_WITH_LINKS_EDITOR_TRANSFORMERS));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (!!!editable) newEditorInstance.setEditable(false);
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}

function handleRefreshAnnotationEditor() {
  const json = {
    "root": {
     "children": [
      {
       "children": [
        {
         "detail": 0,
         "format": 0,
         "mode": "normal",
         "style": "",
         "text": "Insert article annotation here...",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "left",
       "indent": 0,
       "type": "paragraph",
       "version": 1,
       "first_element": false,
       "blockStyle": {
        "textAlign": "left",
        "backgroundColor": "transparent",
        "textColor": "inherit",
        "margin": [
         "6px",
         "0px",
         "6px",
         "0px"
        ],
        "padding": "0px",
        "borderRadius": "0px",
        "borderColor": "transparent",
        "borderWidth": "0px",
        "borderType": "none",
        "boxShadowOffsetX": "0px",
        "boxShadowOffsetY": "0px",
        "boxShadowBlurRadius": "0px",
        "boxShadowSpreadRadius": "0px",
        "boxShadowInset": false,
        "boxShadowColor": "transparent"
       }
      }
     ],
     "direction": "ltr",
     "format": "",
     "indent": 0,
     "type": "root",
     "version": 1
    }
   };
   const annotation_editor = getEditorInstances()['annotate-editor'];
   if (annotation_editor&&annotation_editor.isEditable()) {
    const parsedEditorState = annotation_editor.parseEditorState(json);
    annotation_editor.setEditorState(parsedEditorState);
    annotation_editor.setEditable(true);
   }
}

export function registerAnnotation(el:HTMLElement,setInstance?:boolean) {
  document.addEventListener("REFRESH_ANNOTATION_EDITOR",handleRefreshAnnotationEditor);
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = editor.innerHTML.trim();
      const editorNodes:any[] = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        LinkNode,
        AbbreviationNode,
      ];
      if (!!!editable) editorNodes.push(AnnotationNode);
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'annotation'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } 
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,TEXT_WITH_LINKS_EDITOR_TRANSFORMERS));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAnnotationEditable(newEditorInstance));
      else registerAnnotationNotEditable(newEditorInstance);
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (!!!editable) newEditorInstance.setEditable(false);
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
export function registerTextWithBlockElements(el:HTMLElement,setInstance?:boolean) {
  const editor = el;
  const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
  const form = editor.closest('form');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true") {
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id] = true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = editor.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        QuoteNode,
        LinkNode,
        AbbreviationNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'text-block-elements'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(editor);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } 
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      if (!!!editable) newEditorInstance.setEditable(false);

      if (setInstance) {
        const res = setCurrentEditor(id);
        if (res) newEditorInstance.dispatchCommand(SET_EDITOR_COMMAND,id);
      }
      if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}

// Maybe change
export function registerSurveyQuestion(el:HTMLElement) {
  const wrapper = el.closest<HTMLDivElement>('div.lexical-wrapper');
  if (wrapper) {
    const form = el.closest('form');
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true"){
      const annotationOnly = el.hasAttribute('data-annotate-only');
      const displayOnly = el.hasAttribute('data-display-only');
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id]= true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = el.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        QuoteNode,
        LinkNode,
        YouTubeNode,
        TwitterNode,
        TikTokNode,
        InstagramNode,
        HorizontalRuleNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode,
        AudioNode,
        VideoNode,
        ImageNode,
        CarouselImageNode,
        NewsNode,
        HtmlNode,
        AbbreviationNode,
        OverflowNode
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'survey-question'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(el);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          /**
           * We can listen to event and update saved form state for warning users about navigating away
           */
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } else {
        if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      }
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,COMMENT_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCommentEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCommentNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMaxLengthEditable(newEditorInstance,{min: 1, max: 1000, showCounter: true}));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLoadUnloadToolbarEditable(newEditorInstance));
      if (!!!editable&&!!!displayOnly) LISTENERS_TO_REMOVE[id].push(registerCommentArticleNotEditable(newEditorInstance,annotationOnly)); 
      if (!!!editable) {
        const url = new URL(window.location.href);
        const scroll_to_node = url.searchParams.get('scroll_to_node');
        const namespace = url.searchParams.get('namespace');
        const start_str = url.searchParams.get('start');
        const start = parseInt(start_str||'');
        const end_str = url.searchParams.get('end');
        const end = parseInt(end_str||'');
        const content = url.searchParams.get('content');
        if (scroll_to_node==="true"&&Number.isInteger(start)&&Number.isInteger(end)&&content&&content.length&&namespace===newEditorInstance._config.namespace) {
          newEditorInstance.dispatchCommand(SCROLL_TO_NODE,{ start, end, content });
        } 
      }
      if (editable) insertPlaceholder(newEditorInstance);
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
// No Social Media
export function registerSurveyOption(el:HTMLElement) {
  const wrapper = el.closest<HTMLDivElement>('div.lexical-wrapper');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true"){
      const annotationOnly = el.hasAttribute('data-annotate-only');
      const displayOnly = el.hasAttribute('data-display-only');
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id]= true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = el.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        QuoteNode,
        LinkNode,
        HorizontalRuleNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode,
        AudioNode,
        VideoNode,
        CarouselImageNode,
        ImageNode,
        HtmlNode,
        AbbreviationNode,
        OverflowNode
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'survey-option'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(el);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
        },undefined);
      } 
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,COMMENT_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCommentEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCommentNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMaxLengthEditable(newEditorInstance,{min: 1, max: 1000, showCounter: true}));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLoadUnloadToolbarEditable(newEditorInstance));
      if (!!!editable&&!!!displayOnly) LISTENERS_TO_REMOVE[id].push(registerCommentArticleNotEditable(newEditorInstance,annotationOnly)); 
      if (editable) insertPlaceholder(newEditorInstance);
      setEditorInstance(id,newEditorInstance);
      if (!!!editable) {
        const url = new URL(window.location.href);
        const scroll_to_node = url.searchParams.get('scroll_to_node');
        const namespace = url.searchParams.get('namespace');
        const start_str = url.searchParams.get('start');
        const start = parseInt(start_str||'');
        const end_str = url.searchParams.get('end');
        const end = parseInt(end_str||'');
        const content = url.searchParams.get('content');
        if (scroll_to_node==="true"&&Number.isInteger(start)&&Number.isInteger(end)&&content&&content.length&&namespace===newEditorInstance._config.namespace) {
          newEditorInstance.dispatchCommand(SCROLL_TO_NODE,{ start, end, content });
        } 
      }
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
export function registerSurveyShortBlog(el:HTMLElement) {
  const wrapper = el.closest<HTMLDivElement>('div.lexical-wrapper');
  if (wrapper) {
    const form = el.closest('form');
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true"){
      const annotationOnly = el.hasAttribute('data-annotate-only');
      const displayOnly = el.hasAttribute('data-display-only');
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id]= true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const dataMaxHeight = el.getAttribute('data-max-height');
      const innerHTML = el.innerHTML.trim();
      const editorNodes = [
        ExtendedTextNode,
        { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
        ListNode,
        ListItemNode,
        QuoteNode,
        LinkNode,
        YouTubeNode,
        TwitterNode,
        TikTokNode,
        InstagramNode,
        HorizontalRuleNode,
        MathNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableWrapperNode,
        TableRowNode,
        TableCellNode,
        CellParagraphNode,
        AudioNode,
        VideoNode,
        ImageNode,
        CarouselImageNode,
        NewsNode,
        HtmlNode,
        AbbreviationNode,
        OverflowNode
      ] as any[];
      if (!!!editable) editorNodes.push(MaxHeightButtonNode);
      if (true) editorNodes.push(AutocompleteNode,LoadingNode);
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: editorNodes,
        editable: true,
        editorType: 'short-blog'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(el);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
          /**
           * We can listen to event and update saved form state for warning users about navigating away
           */
          if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
        },{ discrete: true });
      } else {
        if (form) form.dispatchEvent(new CustomEvent('lexical_state_registered',{ detail: { id } }));
      }
      setEditorInstance(id,newEditorInstance);
      LISTENERS_TO_REMOVE[id] = [];
      if (dataMaxHeight&&!!!editable) LISTENERS_TO_REMOVE[id].push(registerMaxHeightNode(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,COMMENT_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCommentEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCommentNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMaxLengthEditable(newEditorInstance,{min: 1, max: 1000, showCounter: true}));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAutocompleteEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAIWritingHelperEditable(newEditorInstance));
      if (!!!editable&&!!!displayOnly) LISTENERS_TO_REMOVE[id].push(registerCommentArticleNotEditable(newEditorInstance,annotationOnly)); 
      if (!!!editable) {
        const url = new URL(window.location.href);
        const scroll_to_node = url.searchParams.get('scroll_to_node');
        const namespace = url.searchParams.get('namespace');
        const start_str = url.searchParams.get('start');
        const start = parseInt(start_str||'');
        const end_str = url.searchParams.get('end');
        const end = parseInt(end_str||'');
        const content = url.searchParams.get('content');
        if (scroll_to_node==="true"&&Number.isInteger(start)&&Number.isInteger(end)&&content&&content.length&&namespace===newEditorInstance._config.namespace) {
          newEditorInstance.dispatchCommand(SCROLL_TO_NODE,{ start, end, content });
        } 
      }
      if (editable) insertPlaceholder(newEditorInstance);
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}
// No Social Media, no custom HTML node  
export function registerRangeDescriptions(el:HTMLElement) {
  const wrapper = el.closest<HTMLDivElement>('div.lexical-wrapper');
  if (wrapper) {
    const id = wrapper.id;
    if (id&&el.getAttribute('data-registered')!=="true"){
      const annotationOnly = el.hasAttribute('data-annotate-only');
      const displayOnly = el.hasAttribute('data-display-only');
      el.setAttribute('data-registered','true');
      if (GET_EDITOR_INSTANCES&&GET_EDITOR_INSTANCES()[id]) {
        clearEditor(id);
      }
      getSettingsEditorInstances()[id]= true;
      const editableAttribute = el.getAttribute('data-editable');
      const editable = Boolean(editableAttribute !=="false");
      const innerText = el.innerText.trim();
      const innerHTML = el.innerHTML.trim();
      const newEditorInstance = createEditor({
        namespace: id,
        theme: structuredClone(EDITOR_THEME),
        onError: console.error,
        nodes: [
          ExtendedTextNode,
          { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
          ListNode,
          ListItemNode,
          QuoteNode,
          LinkNode,
          HorizontalRuleNode,
          MathNode,
          CodeNode,
          CodeHighlightNode,
          TableNode,
          TableWrapperNode,
          TableRowNode,
          TableCellNode,
          CellParagraphNode,
          AudioNode,
          VideoNode,
          CarouselImageNode,
          ImageNode,
          AbbreviationNode,
          OverflowNode
        ] as any [],
        editable: true,
        editorType: 'range-description'
      });
      if (editable) wrapper.addEventListener('focusin',handleEditorFocus,true);
      else wrapper.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleEditorFocus,true);
      newEditorInstance.setRootElement(el);
      if (LISTENERS_TO_REMOVE[id]) {
        while (LISTENERS_TO_REMOVE[id].length) {
          const func = LISTENERS_TO_REMOVE[id].pop();
          if (func) func();
        }
      }
      if (innerHTML.length>=1) {
        newEditorInstance.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(innerHTML,"text/html");
          // DEBUG: console.log(dom.body.innerHTML);
          const nodes = $generateNodesFromDOM(newEditorInstance,dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
          // Select the root
          const root = $getRoot()
          if (root) {
            root.append(...nodes);
          }
        },undefined);
      } 
      LISTENERS_TO_REMOVE[id] = [];
      if (editable) LISTENERS_TO_REMOVE[id].push(registerToolbarEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerTableEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerTableNotEditableListener(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerDecoratorsEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerDecoratorsNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMathEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerMathNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerRichTextEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLinkEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCodeEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCodeNotEditable(newEditorInstance)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerListEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHistoryCustomEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMarkdownShortcutsEditable(newEditorInstance,COMMENT_EDITOR_TRANSFORMERS as any));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerHTMLNodeEditable(newEditorInstance));
      if (!!!editable&&!!!displayOnly) LISTENERS_TO_REMOVE[id].push(registerCommentArticleNotEditable(newEditorInstance,annotationOnly)); 
      if (editable) LISTENERS_TO_REMOVE[id].push(registerAbbrEditable(newEditorInstance))
      else LISTENERS_TO_REMOVE[id].push(registerHTMLNodeNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerCommentEditable(newEditorInstance));
      else LISTENERS_TO_REMOVE[id].push(registerCommentNotEditable(newEditorInstance));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerMaxLengthEditable(newEditorInstance,{min: 1, max: 1000, showCounter: true}));
      if (editable) LISTENERS_TO_REMOVE[id].push(registerLoadUnloadToolbarEditable(newEditorInstance));
      if (editable) insertPlaceholder(newEditorInstance);
      setEditorInstance(id,newEditorInstance);
      if (!!!editable) {
        const url = new URL(window.location.href);
        const scroll_to_node = url.searchParams.get('scroll_to_node');
        const namespace = url.searchParams.get('namespace');
        const start_str = url.searchParams.get('start');
        const start = parseInt(start_str||'');
        const end_str = url.searchParams.get('end');
        const end = parseInt(end_str||'');
        const content = url.searchParams.get('content');
        if (scroll_to_node==="true"&&Number.isInteger(start)&&Number.isInteger(end)&&content&&content.length&&namespace===newEditorInstance._config.namespace) {
          newEditorInstance.dispatchCommand(SCROLL_TO_NODE,{ start, end, content });
        } 
      }
      if (wrapper) onNewContentLoaded(wrapper);
    }
  }
}


/**
 * Returns a function that registers a survey option editor
 * @returns 
 */
export function getRegisterSurveyOption() {
  return registerSurveyOption;
}
/**
 * Returns a function that registers a survey question editor
 * @returns 
 */
export function getRegisterSurveyQuestion() {
  return registerSurveyQuestion;
}

function getSettingsEditorInstances() {
  return SETTING_EDITOR_INSTANCES;
}

/*---------------------------------- Other ----------------------------- */


/* ---------------------------------------------------------- Exported Functions that will be called in 'Functionality' ------------------------------------------------------------- */

/**
 * Delete lexical instance custom event
 */
function handleDeleteLexicalInstance(this:HTMLDivElement,_e:Event) {
  const id = this.id;
  if(id) {
    clearEditor(id);
    this.remove();
  }
}
/**
 * Returns the EditorState.toJSON() or null
 * @param id id of the div.lexical-wrapper
 * @returns 
 */
export function getEditorState(id:string) {
  if (GET_EDITOR_INSTANCES) {
    const editorInstance = GET_EDITOR_INSTANCES()[id];
    if (editorInstance) {
      const state = editorInstance.getEditorState().toJSON();
      if (state) return state;
    }
  }
  return null;
}
export type getEditorStateType = typeof getEditorState;
window.getEditorState = getEditorState;
/**
 * 
 * @param id 
 * @param lexicalState Should be editorState.toJSON()
 * @returns 
 */
export function setEditorState(id:string,lexicalState:any) {
  if (GET_EDITOR_INSTANCES) {
    const editorInstance = GET_EDITOR_INSTANCES()[id];
    if (editorInstance) {
      const state = editorInstance.parseEditorState(lexicalState);
      editorInstance.setEditorState(state);
    }
  }
}
export type setEditorStateType = typeof setEditorState;
window.setEditorState = setEditorState;

function onConfigRequest(e:CustomEvent) {
  const elementDispatchedRequest = e.detail.elt as HTMLElement|null;
  if(elementDispatchedRequest) {
    const IS_FORM = Boolean(elementDispatchedRequest.nodeName==="FORM");
    const parameters = e.detail.parameters;
    const headers = e.detail.headers;
    if (typeof e.detail.verb==='string' && typeof parameters==='object'&&typeof headers==='object') {
      const IS_POST = Boolean(e.detail.verb.toUpperCase()==="POST"||e.detail.verb.toUpperCase()==="PUT");
      if (IS_FORM&&IS_POST) {
        const lexicalWrappers = Array.from(elementDispatchedRequest.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'));
        lexicalWrappers.forEach(async (el) => {
          const id = el.id;
          if (id&&!!!parameters[id]) {
            const lexicalState = getEditorState(id);
            if (lexicalState) parameters[id] = JSON.stringify(lexicalState);
          }
        })
      }
    }
  }
}

function stopPropagation(e:Event) {
  e.stopPropagation();
}

/**
 * The main client side code looks for any div[contenteditable="true"] on the page and runs this function if there is one or more
 * editor like this on the page
 */
export function setEditors(docOrEl:DocOrEl) {
  
  const fullEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="full"]'));
  const commentEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="comment"]'));
  const textOnlyEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="text-only"]'))
  const textWithLinksEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="text-with-links"]'))
  const annotationEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="annotation"]'))
  const textWithBlockElementsEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="text-block-elements"]'));

  // Maybe change
  const surveyQuestionEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="survey-question"]'));
  const surveyShortBlog = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="survey-short-blog"]')); 
  const surveyOptionEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="survey-option"]'));
  const surveyRangeDescriptionEditors = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-rich-text-editor][data-type="range-description"]'));

  if (
    fullEditors.length||
    commentEditors.length||
    textOnlyEditors.length||
    textWithLinksEditors.length||
    textWithBlockElementsEditors.length||
    surveyQuestionEditors.length||
    surveyOptionEditors.length||
    surveyShortBlog.length||
    surveyRangeDescriptionEditors.length
  ) {
      // Prevent Unwanted drag behavior
      fullEditors.forEach((el) => {
        el.addEventListener('drag',stopPropagation);
      });
      surveyQuestionEditors.forEach((el) => {
        el.addEventListener('drag',stopPropagation);
      });
      surveyOptionEditors.forEach((el) => {
        el.addEventListener('drag',stopPropagation);
      });
      surveyShortBlog.forEach((el) => {
        el.addEventListener('drag',stopPropagation);
      })
      surveyRangeDescriptionEditors.forEach((el) => {
        el.addEventListener('drag',stopPropagation);
      })

      GET_EDITOR_INSTANCES = getEditorInstances;
      UPDATE_TOOLBAR_COMMAND_REF= UPDATE_TOOLBAR_COMMAND;
      
      fullEditors.forEach((editor,i) => registerFullEditor(editor));
      commentEditors.forEach((editor,i) => registerComment(editor));
      textOnlyEditors.forEach((editor,i) => registerTextOnly(editor));
      textWithLinksEditors.forEach((editor,i) => registerTextWithLinks(editor));
      annotationEditors.forEach((editor,i) => registerAnnotation(editor));
      textWithBlockElementsEditors.forEach((editor,i) => registerTextWithBlockElements(editor));

      surveyQuestionEditors.forEach((editor) => registerSurveyQuestion(editor));
      surveyOptionEditors.forEach((editor)=> registerSurveyOption(editor));
      surveyShortBlog.forEach((editor) => registerSurveyShortBlog(editor))
      surveyRangeDescriptionEditors.forEach((editor) => registerRangeDescriptions(editor));

      surveyQuestionEditors
      .concat(surveyOptionEditors)
      .concat(surveyShortBlog)
      .concat(surveyRangeDescriptionEditors)
      .forEach((editor) => {
        const wrapper = editor.closest<HTMLDivElement>('div.lexical-wrapper');
        if (wrapper) wrapper.addEventListener('delete-lexical-instance',handleDeleteLexicalInstance);
      })
  }
  document.addEventListener('htmx:configRequest',onConfigRequest);
}

export function clearEditor(id:string) {
  if (GET_EDITOR_INSTANCES) {
    const EDITOR_INSTANCES = GET_EDITOR_INSTANCES();
    const LISTENERS_TO_REMOVE_ARRAY = LISTENERS_TO_REMOVE[id];
    const currentEditorID = getCurrentEditorID();
    if (currentEditorID===id) {
      setCurrentEditor('');
    }
    
    if (LISTENERS_TO_REMOVE_ARRAY) {
      LISTENERS_TO_REMOVE_ARRAY.forEach((func) => func());
      delete LISTENERS_TO_REMOVE[id];
    }
    if (EDITOR_INSTANCES[id]) delete EDITOR_INSTANCES[id];
    if (getSettingsEditorInstances()[id]) delete getSettingsEditorInstances()[id];
    if (SETTING_EDITOR_INSTANCES[id]) delete SETTING_EDITOR_INSTANCES[id];
  }
}
export type clearEditorType = typeof clearEditor;
window.clearEditor = clearEditor;

export function onLexicalThemeChange() {
  if(GET_EDITOR_INSTANCES) {
    const editor_instances = GET_EDITOR_INSTANCES();
    Object.values(editor_instances).forEach((editor) =>{
      if (UPDATE_TOOLBAR_COMMAND_REF) editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND_REF,undefined);
    });
  }
}
window.onLexicalThemeChange = onLexicalThemeChange;


export function unloadLexicalEditorsBeforeSwap(docOrEl:DocOrEl) {
  const editors = docOrEl.querySelectorAll('div.lexical-wrapper');
  editors.forEach((el) => {
    if (el.getAttribute('data-current')==="true") {
      setCurrentEditor('');
    }
    clearEditor(el.id);
  })
}
window.unloadLexicalEditorsBeforeSwap = unloadLexicalEditorsBeforeSwap;

export async function editorToChatMessage(id:string):Promise<{markdown: string, html: string }> {
  const editor = getEditorInstances()[id];
  if (!!!editor) return editor;
  else {
    return new Promise((resolve,reject) => {
      editor.update(() => {
        const autoCompleteNodes = $nodesOfType(AutocompleteNode);
        autoCompleteNodes.forEach((node) => node.remove());
        const loadingNodes = $nodesOfType(LoadingNode);
        loadingNodes.forEach((node) => node.remove());
        const root = $getRoot();
        if (root) {
          const children = root.getChildren();
          for (let j = children.length-1; j>-1; j--) {
            if ($isElementNode(children[j])) {
              const a = children[j].getTextContent();
              if (a.trim().length===0) children[j].remove();
            }
          }
        }
      },{ discrete: true })
      editor.update(() => {
        const markdown = $convertToMarkdownString(FULL_EDITOR_TRANSFORMERS as any);
        const html = $generateHtmlFromNodes(editor);
        resolve({markdown, html});
      })
    })    
  }
}
window.editorToChatMessage = editorToChatMessage;

const update_editor_timeout:{[key:string]:NodeJS.Timeout} = {};
export function updateLexicalInstanceWithHtml(id:string,html_string:string) {
  const editor = getEditorInstances()[id];
  var twitterNodes = false;
  var tiktokNodes = false;
  var instagramNodes = false;
  if (editor) {
    editor.update(() => {
      // In the browser you can use the native DOMParser API to parse the HTML string.
      const parser = new DOMParser();
      const dom = parser.parseFromString(html_string, 'text/html');
      // Once you have the DOM instance it's easy to generate LexicalNodes.
      const nodes = $generateNodesFromDOM(editor, dom).filter((node) => $isElementNode(node)||$isDecoratorNode(node));
      const root = $getRoot()
      if (root) {
        root.clear();
        root.append(...nodes);
        root.selectEnd();
      }
      tiktokNodes = $nodesOfType(TikTokNode).length>=1;
      twitterNodes = $nodesOfType(TwitterNode).length>=1;
      instagramNodes = $nodesOfType(InstagramNode).length>=1;

      editor.dispatchCommand(UPDATE_ON_SET_HTML,undefined);
      editor.setEditable(false);
    })
    const root = document.getElementById(id);
    if (root) {
      if (update_editor_timeout[id]) clearTimeout(update_editor_timeout[id]);
      update_editor_timeout[id] = setTimeout(() => {
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: {el: root} }));
        if (twitterNodes) document.dispatchEvent(new CustomEvent('EMBED_TWITTER'));
        if (tiktokNodes) document.dispatchEvent(new CustomEvent('EMBED_TIKTOK'));
        if (instagramNodes) document.dispatchEvent(new CustomEvent('EMBED_INSTAGRAM'));
        delete update_editor_timeout[id];
      },500)
    }
  }
}
window.updateLexicalInstanceWithHtml = updateLexicalInstanceWithHtml;