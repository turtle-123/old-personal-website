import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  LexicalCommand,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  VALID_HEX_REGEX,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND, 
  INDENT_CONTENT_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  ElementFormatType,
  $getRoot,
  $createParagraphNode,
  $isTextNode,
  RangeSelection,
  GridSelection,
  $isParagraphNode,
  ParagraphNode,
  CLICK_COMMAND,
  BLUR_COMMAND,
  $nodesOfType,
  NodeMutation,
  $getTextContent,
  $isBlockElementNode,
  LexicalNode,
  $isRootNode,
  $createTextNode,
  $getPreviousSelection,
  FOCUS_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $insertNodes
} from 'lexical';
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { $patchStyleText, $setBlocksType } from '@lexical/selection';
import { registerBlockStyleCustomization } from './blockStyleDialog';
import { 
  $updateToolbar,
  $updateFloatingMenu 
} from './$updateToolbar';
import { 
  getCurrentEditor, 
  getDOMRangeRectAbsolute, 
  getEditorInstances, 
  openDialog,
  TEXT_COLOR_CHANGE,
  BACKGROUND_COLOR_CHANGE,
  CLEAR_TEXT_FORMATTING, 
  getCurrentEditorID,
  closeDialog,
  getNoColor,
  editorCanChangeSize,
  getEditorButtons,
  getDeviceType,
  isTouchDevice,
  getCsrfToken,
  DISPATCH_SNACKBAR_CED,
  NEW_CONTENT_LOADED_CED,
  getDOMRangeRect,
  closeLoadingDialog,
  REGISTER_TOOLBAR_LISTENERS,
  handleOpenLexDialog,
  handleCloseLexDialog,
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED,
  OPEN_SNACKBAR_CED,
  setEditorInstance
} from '@lexical/shared';
import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";
import { 
  MAKE_TRANSPARENT
} from '@lexical/shared';
import {
  exportFile
} from '@lexical/file';
import { registerSpeechToText } from './registerSpeechToText';
import { 
  $createHeadingNode, 
  $createQuoteNode, 
  $isHeadingNode, 
  HeadingNode, 
  type HeadingTagType 
} from '@lexical/rich-text';
import { AnnotationNode } from './AnnotationNode';
import { $generateNodesFromSerializedNodes, $getLexicalContent } from '@lexical/clipboard';
import { 
  AudioNode,
  HtmlNode, 
  ImageNode, 
  InstagramNode,
  NewsNode, 
  TikTokNode, 
  TwitterNode, 
  VideoNode, 
  YouTubeNode 
} from '@lexical/decorators';
import { TableNode } from '@lexical/table';
import { MathNode } from '@lexical/math';
import { $createLinkNode } from '@lexical/link';
import { $generateNodesFromDOM } from '@lexical/html';
import { onRewriteSelectionWidthAIClick } from './registerAIWritingHelper';
import { $createAiChatNode, AiChatNode, INSERT_AI_CHAT_NODE } from '@lexical/decorators';
export { registerBlockStyleCustomization } from './blockStyleDialog';
export { registerPollQuestionToolbar } from './registerPollToolbar';
export { AnnotationNode, $createAnnotationNode, $isAnnotationNode, convertAnnotationNodeElement } from './AnnotationNode';
export { MaxHeightButtonNode, registerMaxHeightNode } from './MaxHeightNode';

export type AnnotationSelectionState = {
  start: number,
  end: number,
  content: string
};

export const LAUNCH_ARTICLE_SELECTION_MENU:LexicalCommand<void> = createCommand('LAUNCH_ARTICLE_SELECTION_MENU');
export const ADD_COMMENT_ARTICLE_COMMAND: LexicalCommand<void> = createCommand('ADD_COMMENT_ARTICLE_COMMAND');
export const RECEIVE_COMMENT_ARTICLE_COMMAND: LexicalCommand<string> = createCommand('RECEIVE_COMMENT_ARTICLE_COMMAND');
export const ADD_ANNOTATE_ARTICLE_COMMAND: LexicalCommand<void> = createCommand('ADD_ANNOTATE_ARTICLE_COMMAND');
export const RECEIVE_ANNOTATE_ARTICLE_COMMAND: LexicalCommand<void> = createCommand('RECEIVE_ANNOTATE_ARTICLE_COMMAND');
export const SCROLL_TO_NODE: LexicalCommand<{ start: number, end: number, content: string }> = createCommand('SCROLL_TO_NODE');
export const COPY_LINK_SELECTION: LexicalCommand<void> = createCommand('COPY_LINK_SELECTION');
export const UPDATE_TOOLBAR_COMMAND:LexicalCommand<void> = createCommand('UPDATE_TOOLBAR_COMMAND');
export const FONT_FAMILY_CHANGE:LexicalCommand<VALID_FONT|'Inherit'> = createCommand('FONT_FAMILY_CHANGE');
export const FONT_WEIGHT_CHANGE:LexicalCommand<VALID_FONT_WEIGHT|'Inherit'> = createCommand('FONT_WEIGHT_CHANGE');
export const FONT_SIZE_CHANGE:LexicalCommand<VALID_FONT_SIZE|'Inherit'> = createCommand('FONT_SIZE_CHANGE');
export const LAUNCH_TABLE_MENU:LexicalCommand<void> = createCommand('LAUNCH_TABLE_MENU');
export const LAUNCH_SELECTION_MENU:LexicalCommand<ReturnType<typeof $updateToolbar>> = createCommand('LAUNCH_SELECTION_MENU');
export const ASK_AI_COMMAND:LexicalCommand<{ context: string, selection: string, url: string }> = createCommand('ASK_AI_COMMAND');

export { 
  AutocompleteNode,
  registerAutocompleteEditable
} from './AutocompleteNode'
export {
  registerAIWritingHelperEditable
} from './registerAIWritingHelper';

/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 * 
 */
const autoUpdateObject:{[key: string]: () => void} = {};

export function getPortalEl() {
  return document.getElementById('text-table-selection-ref') as HTMLDivElement;
}
export type VALID_FONT = "Anuphan, sans-serif;"|"Arial, sans-serif;"|"Verdana, sans-serif;"|"Tahoma, sans-serif;"|"Trebuchet MS, sans-serif;"|"Times New Roman, serif;"|"Georgia, serif;"|"Garamond, serif;"|"Courier New, monospace;"|"Brush Script MT, cursive;"
const ALLOWED_FONTS = new Set([
  "Anuphan, sans-serif;",
  "Arial, sans-serif;",
  "Verdana, sans-serif;",
  "Tahoma, sans-serif;",
  "Trebuchet MS, sans-serif;",
  "Times New Roman, serif;",
  "Georgia, serif;",
  "Garamond, serif;",
  "Courier New, monospace;",
  "Brush Script MT, cursive;"
] as VALID_FONT[]);
export type VALID_FONT_WEIGHT='100'|'200'|'300'|'400'|'500'|'600'|'700';
export const ALLOWED_FONT_WEIGHTS = new Set(['100','200','300','400','500','600','700'] as VALID_FONT_WEIGHT[]);
export type VALID_FONT_SIZE='caption'|'body2'|'body1'|'h6'|'h5'|'h4'|'h3'|'h2'|'h1';
export const ALLOWED_FONT_SIZES = new Set(['caption','body2','body1','h6','h5','h4','h3','h2','h1'] as VALID_FONT_SIZE[]);
export const FONT_SIZE_TO_CSS = {
  'caption': {
    'font-size': '0.75rem',
    'line-height': '1.66',
    'letter-spacing': '0.03333em'
  } as const,
  'body2': {
    'font-size': '0.875rem',
    'line-height': '1.43',
    'letter-spacing': '0.01071em'
  } as const,
  'body1': {
    'font-size': '1rem',
    'line-height': '1.5',
    'letter-spacing': '0.00938em'
  } as const,
  'h6': {
    'font-size': '1.15rem',
    'line-height': '1.6',
    'letter-spacing': '0.0075em'
  } as const,
  'h5': {
    'font-size': '1.35rem',
    'line-height': '1.334',
    'letter-spacing': '0em'
  } as const,
  'h4': {
    'font-size': '1.6rem',
    'line-height': '1.2944',
    'letter-spacing': '0.00294em'
  } as const,
  'h3': {
    'font-size': '1.85rem',
    'line-height': '1.2548',
    'letter-spacing': '0.00588'
  } as const,
  'h2': {
    'font-size': '2.1rem',
    'line-height': '1.205',
    'letter-spacing': '0.0042em'
  } as const,
  'h1': {
    'font-size': '2.6rem',
    'line-height': '1.167',
    'letter-spacing': '0em'
  } as const,
} as const;
const VALID_FORMAT_ELEMENT_COMMAND_SET = new Set(['left','center','right','justify'] as const);
const VALID_FORMAT_TEXT_COMMAND_SET = new Set(['bold','italic','strikethrough','underline','superscript','subscript','mark','code','quote','kbd'] as const);
const AI_WRITER_ID = 'ai-writer-helper-menu';
const FLOATING_TEXT_MENU_ID = 'text-selection-menu-toolbar-rte';
const FLOATING_ARTICLE_MENU_ID = 'text-selection-article';

var FOCUS_OUT_TIMEOUT: NodeJS.Timeout|undefined = undefined;
/* --------------------------------------------- Per Editor ----------------------------- */
var DEBOUNCE_COLOR_CHANGE: NodeJS.Timeout|undefined = undefined;
const COLOR_CHANGE_TIMEOUT_MS = 500;


function getFontFamilyChange(editor:LexicalEditor) {
  const handleFontFamilyChange = function (this:HTMLInputElement) {
    if (ALLOWED_FONTS.has(this.value as any)||this.value==='Inherit') editor.dispatchCommand(FONT_FAMILY_CHANGE,this.value as VALID_FONT|'Inherit');
  }
  return handleFontFamilyChange;
}

function getFontWeightChange(editor:LexicalEditor) {
  const handleFontWeightChange = function (this:HTMLInputElement) {
    if (ALLOWED_FONT_WEIGHTS.has(this.value as any)||this.value==='Inherit') editor.dispatchCommand(FONT_WEIGHT_CHANGE,this.value as VALID_FONT_WEIGHT|'Inherit');
  }
  return handleFontWeightChange;
}

function getFontSizeChange(editor:LexicalEditor) {
  const handleFontWeightChange = function (this:HTMLInputElement) {
    if (ALLOWED_FONT_SIZES.has(this.value as any)||this.value==='Inherit') editor.dispatchCommand(FONT_SIZE_CHANGE,this.value as VALID_FONT_SIZE|'Inherit');
  };
  return handleFontWeightChange;
}

function getTextColorChange(editor:LexicalEditor) {
  const handleTextColorChange = function (this:HTMLInputElement) {
    const value = this.value;
    const parent = this.parentElement;
    if (parent) {
      const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
      if (checkbox) checkbox.checked = false;
    }
    if ( VALID_HEX_REGEX.test(value)) {
      if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
      const toDoFunc = function () {
        editor.dispatchCommand(TEXT_COLOR_CHANGE,value);
      };
      DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS);
    }
  }
  return handleTextColorChange;
}

/**
 * Returns a function that handles the change of the background color input for an editor
 * @param editor 
 * @returns 
 */
function getBackgroundColorChange(editor:LexicalEditor) {
  const handleBackgroundColorChange = function (this:HTMLInputElement,_:Event) {
    if (VALID_HEX_REGEX.test(this.value)) {
      if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
      const value = this.value;
      const parent = this.parentElement;
      if (parent) {
        const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
        if (checkbox) checkbox.checked = false;
      }
      const toDoFunc = function () {
        editor.dispatchCommand(BACKGROUND_COLOR_CHANGE,value);
      };
      DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS) as any;
    }
  }
  return handleBackgroundColorChange;
}

function floatingTextColorChange(this:HTMLInputElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    if (VALID_HEX_REGEX.test(this.value)) {
      if (VALID_HEX_REGEX.test(this.value)) {
        if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
        const value = this.value;
        const parent = this.parentElement;
        if (parent) {
          const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
          if (checkbox) checkbox.checked = false;
        }
        const toDoFunc = function () {
          editor.dispatchCommand(TEXT_COLOR_CHANGE,value);
        };
        DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS) as any;
      }
    }
  }
}

function floatingBackgroundColorChange(this:HTMLInputElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    if (VALID_HEX_REGEX.test(this.value)) {
      if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
      const value = this.value;
      const parent = this.parentElement;
      if (parent) {
        const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
        if (checkbox) checkbox.checked = false;
      }
      const toDoFunc = function () {
        editor.dispatchCommand(BACKGROUND_COLOR_CHANGE,value);
      };
      DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS) as any;
    }
  }
}

function floatingTextTransparentChange(this:HTMLInputElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    if (this.checked) {
      this.setAttribute('checked','');
      editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color:null});
    } else {
      this.removeAttribute('checked');
      const wrapper = this.parentElement?.parentElement;
      if (wrapper) {
        const colorInput = wrapper.querySelector<HTMLInputElement>('input#floating-text-color-color');
        if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color: colorInput.value});
      }
    }
  }
}

function floatingBackgroundTransparentChange(this:HTMLInputElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    if (this.checked) {
      this.setAttribute('checked','');
      editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color:null});
    } else {
      this.removeAttribute('checked');
      const wrapper = this.parentElement?.parentElement;
      if (wrapper) {
        const colorInput = wrapper.querySelector<HTMLInputElement>('input#floating-bg-color-bg-color');
        if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color: colorInput.value});
      }
    }
  }
}




const VALID_COMMANDS = new Set([
  'REDO_COMMAND',
  'UNDO_COMMAND',
  'CLEAR_EDITOR_COMMAND',
  'INSERT_LINE_BREAK_COMMAND',
  'INDENT_CONTENT_COMMAND',
  'OUTDENT_CONTENT_COMMAND',
  'FORMAT_ELEMENT_COMMAND',
  'FORMAT_TEXT_COMMAND',
  'MAKE_TRANSPARENT'
]);


function dispatchLexicalCommand(this:HTMLButtonElement,e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div.lexical-wrapper');
  const command = this.getAttribute('data-dispatch');
  const payload = this.getAttribute('data-payload');
  if (wrapper&&command) {
    e.preventDefault();
    e.stopPropagation();
    const id = wrapper.id;
    const editorInstances = getEditorInstances();
    const editor = id ? editorInstances[id]:undefined;
    if (editor) {
      try {
        switch (command) {
          case 'REDO_COMMAND':
            editor.dispatchCommand(REDO_COMMAND,undefined);
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            return;
          case 'UNDO_COMMAND':
            editor.dispatchCommand(UNDO_COMMAND,undefined);
            return;
          case 'CLEAR_EDITOR_COMMAND':
            const shouldClearHistory = (payload==="true") ? true : false;
            /* @ts-ignore */
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND,shouldClearHistory);
            return;
          case 'INSERT_LINE_BREAK_COMMAND':
            /* @ts-ignore */
            editor.dispatchCommand(INSERT_LINE_BREAK_COMMAND,undefined);
            return;
          case 'INDENT_CONTENT_COMMAND':
            editor.dispatchCommand(INDENT_CONTENT_COMMAND,undefined);
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            return;
          case 'OUTDENT_CONTENT_COMMAND':
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND,undefined);
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            return;
          case 'FORMAT_ELEMENT_COMMAND':
            if (VALID_FORMAT_ELEMENT_COMMAND_SET.has(payload as any)) {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,payload as ElementFormatType);
              editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            }
            return;
          case 'FORMAT_TEXT_COMMAND':
            if (VALID_FORMAT_TEXT_COMMAND_SET.has(payload as any)) {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND,payload as any);
              this.classList.toggle('selected');
            }
            return;
          default:
            console.error('Unrecognized Command: '.concat(command));
            return;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

function openFloatingContextMenu(el:HTMLElement,editor:LexicalEditor) {
  closeFloatingArticleMenu();
  const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
  const currentEditorID = getCurrentEditorID();
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: { str: "#lexical-insert-link-main-menu" }}));
  const linkMenu = document.getElementById('lexical-insert-link-main-menu');
  if (linkMenu) linkMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-bg-color-menu"} }));
  const bgMenu =  document.getElementById('floating-bg-color-menu');
  if (bgMenu) bgMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-text-color-menu" } }));
  const colorMenu =  document.getElementById('floating-text-color-menu');
  if (colorMenu) colorMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#lexical-insert-abbr-main"} }));
  const abbrMenu =  document.getElementById('lexical-insert-abbr-main');
  if (abbrMenu) abbrMenu.style.display = 'none';

  if (menu&&currentEditorID===editor._config.namespace) {
    menu.style.display = 'flex';
    const updatePopover = function (this:HTMLElement) {
      const selection = document.getSelection();
      const root = editor.getRootElement();
      if (selection&&root&&selection.rangeCount>0) {
        const rect = getDOMRangeRectAbsolute(selection,root);
        if (getPortalEl()) {
          this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          this.style.left = ((rect.left+rect.right)/2).toString().concat('px');
        }
      } else return;

      const options:any = {
        placement: "top",
        middleware: [offset(6),shift(),flip()]
      };
      computePosition(this,menu,options)
      .then(({ x, y })=>{
        const assignObj = {
          left: `${x}px`,
          top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
          opacity: "1"
        };
        Object.assign(menu.style,assignObj);
      })
    }.bind(el);
    updatePopover();
    const cleanup = autoUpdate(el,menu,updatePopover);
    if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
      autoUpdateObject[FLOATING_TEXT_MENU_ID]();
      delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
    }
    autoUpdateObject[FLOATING_TEXT_MENU_ID] = cleanup;
  } else {
    closeFloatingContextMenu();
  }
}

export function closeFloatingContextMenu(){
  const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: { str: "#lexical-insert-link-main-menu" }}));
  const linkMenu = document.getElementById('lexical-insert-link-main-menu');
  if (linkMenu) linkMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-bg-color-menu"} }));
  const bgMenu =  document.getElementById('floating-bg-color-menu');
  if (bgMenu) bgMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-text-color-menu" } }));
  const colorMenu =  document.getElementById('floating-text-color-menu');
  if (colorMenu) colorMenu.style.display = 'none';
  document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#lexical-insert-abbr-main"} }));
  const abbrMenu =  document.getElementById('lexical-insert-abbr-main');
  if (abbrMenu) abbrMenu.style.display = 'none';
  if (menu) {
    if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
      try {
        autoUpdateObject[FLOATING_TEXT_MENU_ID]();
        delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
      } catch (error) {}
      menu.style.display = "none";
      menu.style.opacity = "0";
    }
  }
}

export function openAIWriterMenu() {
  const el = getPortalEl();
  closeAIWriterMenu();
  const menu = document.getElementById(AI_WRITER_ID);
  const editor = getCurrentEditor();
  const selection = document.getSelection();
  if (menu&&editor&&editor.isEditable()&&selection) {
    const root = editor.getRootElement();
    if (root) {
      if (selection&&root&&selection.rangeCount>0) {
        const rect = getDOMRangeRectAbsolute(selection,root);
        const PORTAL_EL = getPortalEl();
        if (PORTAL_EL&&rect) {
          const ancestor = selection.getRangeAt(0).commonAncestorContainer;
          if (rect.left===0&&rect.right===0&&ancestor instanceof HTMLElement) {
            const rectNew = ancestor.getBoundingClientRect();
            rect.left=rectNew.left;
            rect.right = rectNew.right;
            rect.top+=rectNew.top;
          }
          el.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          el.style.left = ((rect.left+rect.right)/2).toString().concat('px');
        }
      }
      menu.style.display = 'flex';
      const updatePopover = function (this:HTMLElement) {
        const selection = document.getSelection();
        const root = editor.getRootElement();
        if (selection&&root&&selection.rangeCount>0) {
          const rect = getDOMRangeRectAbsolute(selection,root);
          const PORTAL_EL = getPortalEl();
          if (PORTAL_EL&&rect) {
            const ancestor = selection.getRangeAt(0).commonAncestorContainer;
            if (rect.left===0&&rect.right===0&&ancestor instanceof HTMLElement) {
              const rectNew = ancestor.getBoundingClientRect();
              rect.left=rectNew.left;
              rect.right = rectNew.right;
              rect.top+=rectNew.top;
            }
            this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
            this.style.left = ((rect.left+rect.right)/2).toString().concat('px');
          }
        } else return;
  
        const options:any = {
          placement: "top",
          middleware: [offset(6),shift(),flip()]
        };
        computePosition(this,menu,options)
        .then(({ x, y })=>{
          const assignObj = {
            left: `${x}px`,
            top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
            opacity: "1"
          };
          Object.assign(menu.style,assignObj);
        })
      }.bind(el);
      updatePopover();
      const cleanup = autoUpdate(el,menu,updatePopover);
      if (autoUpdateObject[FLOATING_TEXT_MENU_ID]) {
        autoUpdateObject[FLOATING_TEXT_MENU_ID]();
        delete autoUpdateObject[FLOATING_TEXT_MENU_ID];
      }
      autoUpdateObject[FLOATING_TEXT_MENU_ID] = cleanup;
    } else {
      closeAIWriterMenu();
    }
  } else {
    closeAIWriterMenu();
  }
}

export function closeAIWriterMenu() {
  const menu = document.getElementById(AI_WRITER_ID);
  if (menu) {
    if (autoUpdateObject[AI_WRITER_ID]) {
      try {
        autoUpdateObject[AI_WRITER_ID]();
        delete autoUpdateObject[AI_WRITER_ID];
      } catch (error) {}
    } 
    menu.style.display = "none";
    menu.style.opacity = "0";
  }
}


const setFloatingContextMenu = () => {
  (window as any).closeFloatingContextMenu = closeFloatingContextMenu();
}

var IS_MOBILE_DEVICE = false;
function openFloatingArticleMenu(el:HTMLElement,editor:LexicalEditor,currentEditorID:string,annotateOnly:boolean) {
  closeFloatingContextMenu();
  IS_MOBILE_DEVICE = Boolean(getDeviceType()==="mobile");
  const IS_EDGE = /(?:\b(MS)?IE\s+|\bTrident\/7\.0;.*\s+rv:|\bEdge\/)(\d+)/.test(navigator.userAgent);
  const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
  if (menu&&currentEditorID===editor._config.namespace) {
    if (annotateOnly) {
      const butt = menu.querySelector<HTMLButtonElement>('button[data-comment-button][data-dispatch="COMMENT_ARTICLE_COMMAND"]')
      if (butt) butt.setAttribute('disabled','');
    }
    menu.style.display = 'flex';
    const updatePopover = function (this:HTMLElement) {
      const selection = document.getSelection();
      const root = editor.getRootElement();
      if (selection&&root&&selection.rangeCount>0) {
        const rect = getDOMRangeRectAbsolute(selection,root);
        if (getPortalEl()) {
          if (!!!IS_MOBILE_DEVICE&&!!!IS_EDGE) this.style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          else this.style.top = `calc(${rect.top.toFixed(0).concat('px') + ` + ${rect.height.toFixed(0).concat('px')}` + ` + 3rem + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
          this.style.left = ((rect.left+rect.right)/2).toString().concat('px');
        }
      } else return;

      const options:any = {
        placement: "top",
        middleware: [offset(6),shift(),flip()]
      };
      computePosition(this,menu,options)
      .then(({ x, y })=>{
        const assignObj = {
          left: `${x}px`,
          top: `calc(${y.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`,
          opacity: "1"
        };
        Object.assign(menu.style,assignObj);
      })
    }.bind(el);
    updatePopover();
    const cleanup = autoUpdate(el,menu,updatePopover);
    if (autoUpdateObject[FLOATING_ARTICLE_MENU_ID]) {
      autoUpdateObject[FLOATING_ARTICLE_MENU_ID]();
      delete autoUpdateObject[FLOATING_ARTICLE_MENU_ID];
    }
    autoUpdateObject[FLOATING_ARTICLE_MENU_ID] = cleanup;
  } else {
    closeFloatingArticleMenu();
  }
}

export function closeFloatingArticleMenu() {
  const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
  const shareSelection = document.getElementById('share-selection-comment-menu');
  if (shareSelection) {
    if (autoUpdateObject['share-selection-comment-menu']) {
      try {
        autoUpdateObject['share-selection-comment-menu']();
        delete autoUpdateObject['share-selection-comment-menu'];
      } catch (error) {}
      shareSelection.style.display = "none";
      shareSelection.style.opacity = "0";
    }
  }
  if (menu) {
    if (autoUpdateObject[FLOATING_ARTICLE_MENU_ID]) {
      try {
        autoUpdateObject[FLOATING_ARTICLE_MENU_ID]();
        delete autoUpdateObject[FLOATING_ARTICLE_MENU_ID];
      } catch (error) {}
      menu.style.display = "none";
      menu.style.opacity = "0";
    }
  }
}

/**
 * 
 * @param this 
 * @param e 
 */
function dispatchFormatTextCommand(this:HTMLButtonElement,e:Event){
  this.classList.toggle('selected');
  e.stopPropagation();
  e.preventDefault();
  const payload = this.getAttribute('data-payload');
  if (payload && VALID_FORMAT_TEXT_COMMAND_SET.has(payload as any)){
    const editor = getCurrentEditor();
    if (editor) editor.dispatchCommand(FORMAT_TEXT_COMMAND,payload as any);
  }
}
function clearTextFormattingOnClick(this:HTMLButtonElement,e:Event) {
  e.stopPropagation();
  e.preventDefault();
  const editor = getCurrentEditor();
  if (editor) editor.dispatchCommand(CLEAR_TEXT_FORMATTING,undefined);
}
function stopPropagation(e:Event) {
  e.stopPropagation();
  e.stopImmediatePropagation();
}



function getHandleInsertParagraphClick(editor:LexicalEditor) {
  const handleInsertParagraphClick = function () {
    editor.update(()=> {
      const root = $getRoot();
      const p = $createParagraphNode();
      root.append(p);
      $setSelection(p.select());
    })
  }
  return handleInsertParagraphClick;
}

function getClearTextFormatting(editor:LexicalEditor) {
  const ret = function () {
    editor.dispatchCommand(CLEAR_TEXT_FORMATTING,undefined);
  }
  return ret;
}
function getHandleTextTransparentChange(editor:LexicalEditor) {
  const handleTextTransparentChange=function(this:HTMLInputElement) {
    const rootElement = editor.getRootElement();
    if(rootElement){
      const wrapper = rootElement.closest('div.lexical-wrapper');
      if(wrapper){
        if (this.checked){ 
          this.setAttribute('checked','');
          editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color:null});
        } else {
          this.removeAttribute('checked');
          const colorInput = wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-color]');
          if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color: colorInput.value});
        }
      }
    }
  }
  return handleTextTransparentChange;
}

function getHandleBackgroundTransparentChange(editor:LexicalEditor) {
  const handleBackgroundTransparentChange=function(this:HTMLInputElement) {
    const rootElement = editor.getRootElement();
    if(rootElement){
      const wrapper = rootElement.closest('div.lexical-wrapper');
      if(wrapper){
        if (this.checked) {
          this.setAttribute('checked','');
          editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color:null});
        } else {
          this.removeAttribute('checked');
          const colorInput = wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-color]');
          if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color: colorInput.value});
        }
      }
    }
  }
  return handleBackgroundTransparentChange;
}
/**
 * Download lexical state
 * @param this 
 * @param _e 
 */
function downloadLexicalState(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.closest('div.lexical-wrapper');
  if (wrapper) {
    const id = wrapper.id;
    if (id){
      const editors = getEditorInstances();
      const editor = editors[id];
      if (editor) exportFile(editor,{ fileName: id });
    }
  }
}

/* --------------------------------------------------------- Upload Lexical State -------------------------------------------------- */
/**
 * Aoppends lexical editor to output element to give user a preview of what the lexical editor will look like
 * @param output 
 * @param richTextEditorType 
 */
export function appendRichTextEditorToOutput(output:HTMLElement,richTextEditorType:string) {
  const div = document.createElement('div');
  div.setAttribute('id','prev_'+Math.random().toString().slice(2));
  div.classList.add('lexical-wrapper','example-render','mt-2');
  div.setAttribute('data-placeholder','');
  div.setAttribute('data-rich-text-editor','');
  div.setAttribute('data-type','article');
  div.style.cssText="background-color: var(--background)!important; padding: 2px 5px!important; border-radius: 6px;";
  div.setAttribute('data-type',richTextEditorType);
  output.append(div);
  document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED", { detail: { el: output }}));
}
/**
 * Returns the type of the currently focused editor
 * @returns 
 */
function getCurrentEditorTypeForUpload() {
  const input = document.getElementById('current-lexical-editor-upload') as HTMLInputElement|null;
  if (input) {
    const id = input.value;
    if (id) {
      const editorWrapper = document.getElementById(id)
      if (editorWrapper) {
        const editor = editorWrapper.querySelector('div[data-rich-text-editor]');
        if (editor) {
          return editor.getAttribute('data-type');
        }
      }
    }
  }
  return null;
}

async function onUploadAIChat(this:HTMLFormElement,e:SubmitEvent) {
  e.stopPropagation();
  e.preventDefault();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  const selected = this.querySelector<HTMLInputElement>('input[type="radio"]:checked');
  if (dialog&&selected) {
    const chat_id = selected.value;
    try {
      const resp = await fetch(`/ai-chat/search/${encodeURIComponent(chat_id)}`,{ headers:{'Content-Type':'application/json', 'X-CSRF-Token': getCsrfToken()}});
      const json = await resp.json();
      const str = json.str;
      const chat_id_new = json.chat_id;
      const chat_name = json.chat_name;
      if (!!!str||!!!chat_id_new||!!!chat_name) throw new Error("Something went wrong.");
      const editor = getCurrentEditor();
      if (editor) editor.dispatchCommand(INSERT_AI_CHAT_NODE,{ html: str, chat_id: chat_id_new, chat_name });
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong getting the AI chat." }}))
      },200);
    }
    closeDialog(dialog);
  }
}

function getOnOpenUploadFileDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-upload-file-dialog") {
    console.log("Upload Lexical File Dialog");
    const dialog = document.getElementById('lex-upload-file-dialog');
    if (dialog) {
      const uploadLexicalForm = document.getElementById('lexical-state-upload') as HTMLFormElement|null;
      const markdownFileForm = document.getElementById('markdown-file-upload') as HTMLFormElement|null;
      const notebookFileForm = document.getElementById('notebook-file-upload') as HTMLFormElement|null;
      const texFileForm = document.getElementById('tex-file-upload') as HTMLFormElement|null;
      
      const lexicalFileInput = document.getElementById('upload-lex-file-input') as HTMLInputElement;
      const markdownFileInput = document.getElementById('upload-md-file-input') as HTMLInputElement;
      const jupyterNotebookFileInput = document.getElementById('upload-ipynb-file-input') as HTMLInputElement;
      const texFileInput = document.getElementById('upload-tex-file-input') as HTMLInputElement;

      if(uploadLexicalForm&&markdownFileForm&&notebookFileForm&&texFileForm) {
        uploadLexicalForm.addEventListener('submit',onLexicalUploadFormSubmit);


        uploadLexicalForm.addEventListener('reset',onLexicalUploadFormReset);
        markdownFileForm.addEventListener('reset',onLexicalUploadFormReset);
        notebookFileForm.addEventListener('reset',onLexicalUploadFormReset);
        texFileForm.addEventListener('reset',onLexicalUploadFormReset);
      }
      if (lexicalFileInput) lexicalFileInput.addEventListener('change',onLexicalFileUpload);
      if (markdownFileInput) markdownFileInput.addEventListener('change',onMarkdownFileUpload);
      if (jupyterNotebookFileInput) jupyterNotebookFileInput.addEventListener('change',onFileUpload);
      if (texFileInput) texFileInput.addEventListener('change',onFileUpload);
      
      const id = getCurrentEditor()?._config?.namespace || 'full';
      const uploadFileDialog = document.getElementById('lex-upload-file-dialog');
      const dialogOutput = document.getElementById('upload-lex-file-input-output') as HTMLOutputElement|null;
      const markdownDialogOutput = document.getElementById('upload-md-file-input-output') as HTMLOutputElement|null;
      const jupyterNotebookDialogOutput = document.getElementById('upload-ipynb-file-input-output') as HTMLOutputElement|null;
      const texNoteDialogOutput = document.getElementById('upload-tex-file-input-output') as HTMLOutputElement|null;
      const uploadAIChatForm = document.getElementById('insert-ai-chat-rte') as HTMLFormElement|null;
      if (uploadAIChatForm) {
        uploadAIChatForm.addEventListener('submit',onUploadAIChat);
      }
      const hiddenCurrentLexicalEditorInput = document.getElementById('current-lexical-editor-upload') as HTMLInputElement|null;

      if (dialogOutput&&hiddenCurrentLexicalEditorInput&&markdownDialogOutput&&jupyterNotebookDialogOutput&&texNoteDialogOutput&&uploadFileDialog) {
        hiddenCurrentLexicalEditorInput.value = id;
          // Add a rich text editor to output
          const type = getCurrentEditorTypeForUpload();
          if (type) {
            // If there is an editor instance already in the output, remove it
            const previousEditors = Array.from(dialogOutput.querySelectorAll('div[data-rich-text-editor]'));
            if(previousEditors) previousEditors.forEach((ed) => ed.dispatchEvent(new CustomEvent('delete-lexical-instance')));
            dialogOutput.innerHTML = '';
            markdownDialogOutput.innerHTML = '';
            jupyterNotebookDialogOutput.innerHTML = '';
            texNoteDialogOutput.innerHTML = '';
            appendRichTextEditorToOutput(dialogOutput,type);
            appendRichTextEditorToOutput(markdownDialogOutput,type);
            appendRichTextEditorToOutput(jupyterNotebookDialogOutput,type);
            appendRichTextEditorToOutput(texNoteDialogOutput,type);
          }
          if (window.htmx) window.htmx.process(uploadFileDialog);
          document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED', {detail: { el: uploadFileDialog}}));
      } 
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
  }
}

/**
 * When the lexical file is uploaded, try to get the lexical state from the file and set the output 
 * lexical instance state as the uploaded lexical state
 */
async function onLexicalFileUpload(this:HTMLInputElement,e:Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  const files = this.files;
  const form = this.closest<HTMLFormElement>('form');
  if (files&&form) {
    const file = files[0];
    const outputLexicalInstance = form.querySelector<HTMLDivElement>('div.lexical-wrapper');
    if (file&&outputLexicalInstance&&outputLexicalInstance.id) {
      try {
        const contents = await file.text();
        const editors = getEditorInstances();
        const outputEditor = editors[outputLexicalInstance.id];
        const lexicalState = JSON.parse(contents.toString());
        if (outputEditor) {
          const parsedLexicalState = outputEditor.parseEditorState(lexicalState.editorState);
          outputEditor.setEditorState(parsedLexicalState);
          outputEditor.setEditable(false);
          const ouputEditorEl = outputEditor._rootElement;
          if (ouputEditorEl) document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED", { detail: { el: ouputEditorEl }}));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}

async function onMarkdownFileUpload(this:HTMLInputElement,e:Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  const files = this.files;
  const form = this.closest<HTMLFormElement>('form');
  if (files&&form) {
    const file = files[0];
    const outputLexicalInstance = form.querySelector<HTMLDivElement>('div.lexical-wrapper');
    if (file&&outputLexicalInstance&&outputLexicalInstance.id) {
      try {
        const contents = await file.text();
        if (window.markdownToHTMLAi) {
          const html = await window.markdownToHTMLAi(contents);
          const editors = getEditorInstances();
          const outputEditor = editors[outputLexicalInstance.id];
          if (outputEditor) {
            outputEditor.update(() => {
              const parser = new DOMParser();
              const dom = parser.parseFromString(html, 'text/html');
              const nodes = $generateNodesFromDOM(outputEditor, dom);
              const root = $getRoot();
              if (root) {
                root.clear();
                root.append(...nodes);
                root.selectEnd();
              }
            })
            outputEditor.setEditable(false);
            const ouputEditorEl = outputEditor._rootElement;
            if (ouputEditorEl) {
              document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED", { detail: { el: ouputEditorEl }}));
            }
          }
        }
      } catch (e) {
        console.error(e);
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong parsing the markdown file." }}));
      }
    }
  }
}

async function onFileUpload(this:HTMLInputElement,e:Event) {
  var type:string;
  const form = this.closest('form');
  if (this.id==="upload-ipynb-file-input") {
    type = 'notebook';
  } else {
    type = 'tex';
  }
  if (this.files===null||this.files.length<1) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "Unable to find file for file upload." }}));
    return;
  }
  if (!!!form) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "Unable to find form for lexical file upload." }}));
    return;
  }
  const outputLexicalInstance = form.querySelector<HTMLDivElement>('div.lexical-wrapper');
  if (!!!outputLexicalInstance) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "Unable to find form for lexical file upload." }}));
    return;
  }
  const outputEditor = getEditorInstances()[outputLexicalInstance.id];
  if (!!!outputEditor) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "Unable to find output editor for lexical file upload." }}));
    return;
  }
  const file = this.files[0];
  const formData = new FormData();
  formData.append('file', file);

  fetch(`/api/lexical-file-upload/${type}`, { method: 'POST', body: formData })
  .then((res) => {
    if (res.status!==200) {
      throw new Error("Something went wrong getting the lexical state for the file upload.");
    } 
    return res.json();
  })
  .then((res) => {
    const { editorState } = res;
    
  })
  .catch((e) => {
    console.error(e);
    
  })
}



/**
 * 
 */
function onLexicalUploadFormReset(this:HTMLFormElement,_e:Event) {
  var outputID:string;
  if (this.id==="markdown-file-upload") {
    outputID="upload-md-file-input-output";
  } else if (this.id==="notebook-file-upload") {
    outputID="upload-ipynb-file-input-output";
  } else if (this.id==="tex-file-upload") {
    outputID="upload-tex-file-input-output";
  } else {
    outputID="upload-lex-file-input-output";
  }
  const output = document.getElementById(outputID) as HTMLOutputElement|null;
  const outputLexicalInstance = this.querySelector<HTMLDivElement>('div.lexical-wrapper');
  if (outputLexicalInstance) outputLexicalInstance.dispatchEvent(new CustomEvent('delete-lexical-instance'));
  if (output) output.innerHTML='';
  const type = getCurrentEditorTypeForUpload();
  if (type&&output) {
    appendRichTextEditorToOutput(output,type);
    document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: {el : output} }));
  }
}

/**
 * On upload lexical state form submit
 * @param this 
 * @param e 
 */
function onLexicalUploadFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
  const input = this.querySelector<HTMLInputElement>('input[accept=".lexical"]');
  const currentEditorSecretInput = document.getElementById('current-lexical-editor-upload') as HTMLInputElement|null;
  try {
    if(input&&dialog&&currentEditorSecretInput&&currentEditorSecretInput.value){
      const outputLexicalInstance = this.querySelector<HTMLDivElement>('div.lexical-wrapper');
      if (outputLexicalInstance) {
        // Get the id of the output lexical instance
        const id = outputLexicalInstance.id;
        const editorInstances = getEditorInstances();
        if(id) {
          // Get the editor in the output element of the form
          const editor = editorInstances[id];
          const editorToInsert = editorInstances[currentEditorSecretInput.value];
          if (editor&&editorToInsert) {
            // Set the editorState the current editor equal to the editorState of the editor in the output instance of the dialog
            const editorState = editor.getEditorState().toJSON();
            const parsedEditorState = editorToInsert.parseEditorState(editorState);
            editorToInsert.setEditorState(parsedEditorState);
            closeDialog(dialog);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}



function handleFocusOut() {
  if (FOCUS_OUT_TIMEOUT) clearTimeout(FOCUS_OUT_TIMEOUT);
  FOCUS_OUT_TIMEOUT = setTimeout(() => {
    closeFloatingContextMenu();
  },100);
}
function onFloatingContextMenuFocusIn(e:FocusEvent) {
  if (FOCUS_OUT_TIMEOUT) clearTimeout(FOCUS_OUT_TIMEOUT);
}
function handleFocusIn() {
  if (FOCUS_OUT_TIMEOUT) clearTimeout(FOCUS_OUT_TIMEOUT);
}
/* ----------------------------- Functions that will be used elsewhere as well --------------------------- */



export function fontFamilyChangeCallback(selection:RangeSelection|GridSelection,fontWithSemiColon:VALID_FONT|'Inherit') {
  if(fontWithSemiColon==='Inherit')$patchStyleText(selection,{'font-family': null});
  else $patchStyleText(selection,{'font-family': fontWithSemiColon.replace(';','')});
}

export function fontWeightChangeCallback(selection:RangeSelection|GridSelection,weight: VALID_FONT_WEIGHT|'Inherit') { 
  if (weight==='Inherit')$patchStyleText(selection,{'font-weight': null});
  else $patchStyleText(selection,{'font-weight': weight});
}

export function fontSizeChangeCallback(selection:RangeSelection|GridSelection,size:VALID_FONT_SIZE|'Inherit') {
  if (size==="Inherit") {
    $patchStyleText(selection,{
      'font-size': null,
      'line-height':null,
      'letter-spacing':null
    });
  } else {
    const cssObject = FONT_SIZE_TO_CSS[size];
    $patchStyleText(selection,cssObject);
  }
}

export function textColorChangeCallback(selection:RangeSelection|GridSelection,textColor:string) {
  $patchStyleText(selection,{ "color": textColor });
}

export function backgroundColorChangeCallback(selection:RangeSelection|GridSelection,backgroundColor:string) {
  $patchStyleText(selection,{ "background-color": backgroundColor });
}

export function makeTransparentCallback(selection:RangeSelection|GridSelection,payload:{
  type: "text" | "background";
  color: string | null;
}) {
  if (payload.type==="background") {
    $patchStyleText(selection,{'background-color': payload.color});
    $setSelection(selection);
  } else if (payload.type==="text"){
    $patchStyleText(selection,{'color': payload.color});
    $setSelection(selection);
  }
}

export function clearTextFormattingCallback(selection:RangeSelection|GridSelection) {
  const nodes = selection.getNodes();
  for (let node of nodes) {
    if ($isTextNode(node)) {
      node.setFormat(0);
      node.setStyle('');
    }
  }
}




var inHeading: boolean = false;
var inFormatText: boolean = false;
var inSize: boolean = false;
var inWeight: boolean = false;
var inAlign: boolean = false;

type UrlAndTitle = {url:string,title:string};

type SHARE_ARTICLE_STATE_TYPE = {
  // url to selection or comment
  "facebook": null|{"type":"article","payload":string}|{"type":"comment",payload:string},
  // url to selection or comment, text is body of tweet 
  "x": null|{"type":"article","payload":{ text: string, url: string }}|{"type":"comment",payload:{ text: string, url: string }},
  // Email: title should be <title> or <title> - username Comment, link should be link
  "reddit": null|{"type":"article","payload":UrlAndTitle}|{"type":"comment",payload:UrlAndTitle},
  // Link to article selection or comment 
  "linkedin": null|{"type":"article","payload":string}|{"type":"comment",payload:string},
  // Email: title should be <title> or <title> - username Comment, body should be desciption, Selection "" or description, comment
  "email": null|{"type":"article","payload":{ subject: string, body: string }}|{"type":"comment",payload:{ subject: string, body: string }},
  // Link to article selection or comment 
  "link": null|{"type":"article","payload":string}|{"type":"comment",payload:string},
  "pinterest": null|{"type":"article","payload":{ url: string, image: string, title: string }}|{"type":"comment",payload:{ url: string, image: string, title: string }},
  "whats-app": null|{"type":"article","payload":{ url: string, image: string, title: string }}|{"type":"comment",payload:{ url: string, image: string, title: string }},
  "telegram": null|{type:"article", payload: UrlAndTitle}|{type: "comment", payload:UrlAndTitle },
  "tumblr": null|{type:"article", payload: {url:string,title:string,description:string} }|{type: "comment", payload: {url:string,title:string,description:string} },
  "pocket": null|{type:"article", payload: UrlAndTitle }|{type: "comment", payload: UrlAndTitle },
  "buffer": null|{type:"article", payload: UrlAndTitle }|{type: "comment", payload: UrlAndTitle },
  "digg": null|{type:"article", payload:UrlAndTitle}|{type: "comment", payload:UrlAndTitle},
  "mix": null|{type:"article", payload: string }|{type: "comment", payload: string},
  "vkonate": null|{type:"article", payload: {url:string,title:string,description:string,image:string} }|{type: "comment", payload:{url:string,title:string,description:string,image:string} },
  "xing": null|{type:"article", payload: string }|{type: "comment", payload: string},
  "evernote": null|{type:"article", payload: UrlAndTitle}|{type: "comment", payload:UrlAndTitle },
  "hacker": null|{type:"article", payload: UrlAndTitle}|{type: "comment", payload: UrlAndTitle},
  "flipboard": null|{type:"article", payload: UrlAndTitle }|{type: "comment", payload: UrlAndTitle},
  "mename": null|{type:"article", payload: string }|{type: "comment", payload: string},
  "blogger": null|{type:"article", payload: {url:string,title:string,description:string} }|{type: "comment", payload: {url:string,title:string,description:string}},
  "odnoklassiniki": null|{type:"article", payload:string }|{type: "comment", payload: string},
  "yahoo": null|{type:"article", payload: string }|{type: "comment", payload: string},
  "google": null|{type:"article", payload:  {url:string,title:string,description:string}}|{type: "comment", payload:{url:string,title:string,description:string} },
  "renren": null|{type:"article", payload: {url:string,title:string,description:string} }|{type: "comment", payload:{url:string,title:string,description:string} },
  "weibo": null|{type:"article", payload:UrlAndTitle  }|{type: "comment", payload:UrlAndTitle },
  "baidu": null|{type:"article", payload: UrlAndTitle}|{type: "comment", payload: UrlAndTitle},
  "line": null|{type:"article", payload: string}|{type: "comment", payload: string}
};

const SHARE_ARTICLE_STATE:SHARE_ARTICLE_STATE_TYPE = {
  "facebook": null,
  "x": null,
  "reddit": null,
  "linkedin": null,
  "email": null,
  "link": null,
  "pinterest": null,
  "whats-app": null,
  "telegram": null,
  "tumblr": null,
  "pocket": null,
  "buffer": null,
  "digg": null,
  "mix": null,
  "vkonate": null,
  "xing": null,
  "evernote": null,
  "hacker": null,
  "flipboard": null,
  "mename": null,
  "blogger": null,
  "odnoklassiniki": null,
  "yahoo": null,
  "google": null,
  "renren": null,
  "weibo": null,
  "baidu": null,
  "line": null
}

const headingNum = new Set(['1','2','3','4','5','6']);

function $getHeadingOrParagraphNode() {
  const selection = $getSelection();
  if ($isRangeSelection(selection)&&selection.isCollapsed()) {
    const nodes = selection.getNodes();
    if(nodes.length) {
      const node = nodes[0];
      const blockNode = $findMatchingParent(node,(n) => $isHeadingNode(n)||$isParagraphNode(n));
      if (blockNode) {
        return blockNode as HeadingNode|ParagraphNode;
      }
    }
  }
}

function closeOtherColorPopover(this:HTMLElement,e:Event) {
  const linkMenu = document.getElementById('lexical-insert-link-main-menu');
  if (this.id==="floating-bg-color-button") {
    const menu = document.getElementById('floating-text-color-menu');
    if (menu) menu.style.display = 'none';
    if (linkMenu) linkMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-text-color-menu" } }))
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#lexical-insert-link-main-menu" } }))
  } else if (this.id==="floating-text-color-button") {
    const menu = document.getElementById('floating-bg-color-menu');
    if (menu) menu.style.display = 'none';
    if (linkMenu) linkMenu.style.display = 'none';
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#floating-bg-color-menu"} }))
    document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER",{ detail: {str: "#lexical-insert-link-main-menu" } }))
  }
}


export function handleHeadingKeyUp(e:KeyboardEvent) {
  if (e.altKey && e.key.toUpperCase()==="P") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const node = $getHeadingOrParagraphNode();
        const selection = $getSelection();
        if (node&&$isRangeSelection(selection)) {
          $setBlocksType(selection,()=>$createParagraphNode());
        }
      })
    }
  } else if (e.altKey&&e.key.toUpperCase()==="H"&&!!!inHeading) {
    inHeading=true;
    return;
  } else if (inHeading&&e.altKey&&headingNum.has(e.key)) {
    const headingTag = 'h'.concat(e.key) as HeadingTagType;
    const editor = getCurrentEditor();
    if (editor&&editor.hasNode(HeadingNode)) {
      editor.update(() => {
        const node = $getHeadingOrParagraphNode();
        const selection = $getSelection();
        if (node&&$isRangeSelection(selection)) {
          $setBlocksType(selection,()=>$createHeadingNode(headingTag));
        }
      })
    }
  } else if (e.altKey && e.key.toUpperCase()==="T"&&!!!inFormatText) {
    inFormatText = true;
    return;
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="C") { // code 
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'code');
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="Q") { // quote
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'quote');
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="K") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'kbd');
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="S") { // strikethrough
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'strikethrough');
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="Y") { // clear text formatting
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(CLEAR_TEXT_FORMATTING,undefined);
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="B") { // Subscript
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'subscript');
    }
  } else if (inFormatText&&e.altKey&&e.key.toUpperCase()==="P") { // Superscript
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND,'superscript');
    }
  } else if (e.altKey&&e.key.toUpperCase()==="S"&&!!!inSize) {
    inSize = true;
    return;
  } else if (inSize&&e.altKey&&e.key.toUpperCase()==="C") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"caption");
    }
  } else if (inSize&&e.altKey&&e.key.toUpperCase()==="V") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"body2");
    }
  } else if (inSize&&e.altKey&&e.key.toUpperCase()==="B") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"body1");
    }
  } else if (inSize&&e.altKey&&e.key==="6") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h6");
    }
  } else if (inSize&&e.altKey&&e.key==="5") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h5");
    }
  } else if (inSize&&e.altKey&&e.key==="4") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h4");
    }
  } else if (inSize&&e.altKey&&e.key==="3") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h3");
    }
  } else if (inSize&&e.altKey&&e.key==="2") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h2");
    }
  } else if (inSize&&e.altKey&&e.key==="1") {
    const editor = getCurrentEditor();
    if (editor&&editorCanChangeSize(editor)) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"h1");
    }
  } else if (inSize&&e.altKey&&e.key.toUpperCase()==="I") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_SIZE_CHANGE,"Inherit");
    }
  } else if (e.altKey&&e.key.toUpperCase()==="W"&&!!!inWeight) {
    inWeight = true;
    return;
  } else if (inWeight&&e.altKey&&e.key==="1") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"100");
    }
  } else if (inWeight&&e.altKey&&e.key==="2") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"200");
    }
  } else if (inWeight&&e.altKey&&e.key==="3") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"300");
    }
  } else if (inWeight&&e.altKey&&e.key==="4") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"400");
    }
  } else if (inWeight&&e.altKey&&e.key==="5") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"500");
    }
  } else if (inWeight&&e.altKey&&e.key==="6") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"600");
    }
  } else if (inWeight&&e.altKey&&e.key==="7") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"700");
    }
  } else if (inWeight&&e.altKey&&e.key.toUpperCase()==="I") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FONT_WEIGHT_CHANGE,"Inherit");
    }
  } else if (e.altKey&&e.key.toUpperCase()==="A"&&!!!inAlign) {
    inAlign = true;
    return;
  } else if (inAlign&&e.altKey&&e.key.toUpperCase()==="L") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,"left");
    }
  }  else if (inAlign&&e.altKey&&e.key.toUpperCase()==="C") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,"center");
    }
  } else if (inAlign&&e.altKey&&e.key.toUpperCase()==="R") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,"right");
    }
  } else if (inAlign&&e.altKey&&e.key.toUpperCase()==="J") {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND,"justify");
    }
  }
  inHeading = false;
  inFormatText = false;
  inSize = false;
  inWeight = false;
  inAlign = false;
}

/* ------------------------------------------ Register Toolbar --------------------------------------- */
function registerToolbarListeners(editor:LexicalEditor) {
  const wrapper_id = editor._config.namespace;
  const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
  if (wrapper) {
    wrapper.addEventListener('keydown',handleHeadingKeyUp);
    const font_family_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-font-input]');
    const font_weight_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-font-weight-input]');
    const font_size_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-font-size-input]');
    const text_color_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-color]');
    const textColorTransparent = wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-transparent]');
    const background_color_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-color]');
    const backgroundColorTransparent = wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-transparent]');
    const insertParagraphButton = wrapper.querySelector<HTMLButtonElement>('button[data-insert-paragraph-button]');
    
    if (font_family_input) font_family_input.addEventListener('change',getFontFamilyChange(editor));
    if (font_weight_input) font_weight_input.addEventListener('change',getFontWeightChange(editor));
    if (font_size_input) font_size_input.addEventListener('change',getFontSizeChange(editor));
    if (text_color_input&&!!!getNoColor(editor)) text_color_input.addEventListener('input',getTextColorChange(editor));
    if (background_color_input&&!!!getNoColor(editor)) background_color_input.addEventListener('input',getBackgroundColorChange(editor));
    if (insertParagraphButton) insertParagraphButton.addEventListener('click',getHandleInsertParagraphClick(editor));
    const dispatchCommandsButtons = Array.from(wrapper.querySelectorAll('button[data-dispatch]'));
    dispatchCommandsButtons.forEach((b) => {
      const dispatch = b.getAttribute('data-dispatch');
      if (VALID_COMMANDS.has(dispatch as any)) {
        const dataMouseDown = b.getAttribute('data-mouse-down');
        if (dataMouseDown!==null) {
          b.addEventListener('mousedown',dispatchLexicalCommand);
          b.addEventListener('touchstart',dispatchLexicalCommand);
        } else {
          b.addEventListener('click',dispatchLexicalCommand);
        }
      } else if (dispatch==="CLEAR_TEXT_FORMATTING") {
        b.addEventListener('click',getClearTextFormatting(editor));
      }
    })
    const downloadLexicalStateBtn = wrapper.querySelector<HTMLButtonElement>('button[data-download-state]');
    if(downloadLexicalStateBtn) downloadLexicalStateBtn.addEventListener('click',downloadLexicalState);
    


    if (textColorTransparent) textColorTransparent.addEventListener('change',getHandleTextTransparentChange(editor));
    if (backgroundColorTransparent) backgroundColorTransparent.addEventListener('change',getHandleBackgroundTransparentChange(editor));
    
    wrapper.addEventListener('focusout',handleFocusOut);
    wrapper.addEventListener('focusin',handleFocusIn);
  }
}
function getOnViewDifferentSizesDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="view-content-lexical") {
    const dialog = document.getElementById('view-content-lexical');
    if (dialog) {
      const htmlEl = document.querySelector('html');
      const editor = getCurrentEditor();
      if (dialog&&editor&&htmlEl) {
        const editorState = editor.getEditorState();
        const mobileEditor = getEditorInstances()['example-mobile-view-lexical-editor'];
        const tabletEditor = getEditorInstances()['example-tablet-view-lexical-editor'];
        const desktopEditor = getEditorInstances()['example-desktop-view-lexical-editor'];
        if (mobileEditor&&tabletEditor&&desktopEditor) {
          
          mobileEditor.setEditable(true);
          const parseEditorState = mobileEditor.parseEditorState(editorState.toJSON());
          mobileEditor.setEditorState(parseEditorState);
          mobileEditor.setEditable(false);
          
          tabletEditor.setEditable(true);
          const parseEditorState2 = tabletEditor.parseEditorState(editorState.toJSON());
          tabletEditor.setEditorState(parseEditorState2);
          tabletEditor.setEditable(false);
    
          desktopEditor.setEditable(true);
          const parseEditorState3 = desktopEditor.parseEditorState(editorState.toJSON());
          desktopEditor.setEditorState(parseEditorState3);
          desktopEditor.setEditable(false);
    
          htmlEl.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED'));
        } 
      }
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
  }
}

function hideOpenPopovers() {
  Object.keys(autoUpdateObject)
  .forEach((key) => {
    try {
      autoUpdateObject[key]();
      delete autoUpdateObject[key];
      closeFloatingArticleMenu();
      closeFloatingContextMenu();
      closeAIWriterMenu();
    } catch (e) {}
  })
}

/**
 * This registersBlockStyleCustomization
 * This doesn't need to be called when the editor isn't going to be editable
 * Can cope with color and no color
 * @param editor 
 * @returns 
 */
export function registerToolbarEditable(editor:LexicalEditor) {
  document.addEventListener('HIDE_OPEN_POPOVERS',hideOpenPopovers);
  setFloatingContextMenu();
  const menu = document.getElementById(FLOATING_TEXT_MENU_ID);
  if (menu) menu.addEventListener('focusin',onFloatingContextMenuFocusIn);
  const floatingFormatTextMenu = document.getElementById(FLOATING_TEXT_MENU_ID);
  if(floatingFormatTextMenu) {
    floatingFormatTextMenu.addEventListener('click',stopPropagation);
    floatingFormatTextMenu.addEventListener('mousedown',stopPropagation);
    floatingFormatTextMenu.addEventListener('touchstart',stopPropagation);
    const buttons = Array.from(floatingFormatTextMenu.querySelectorAll<HTMLButtonElement>('button[data-dispatch="FORMAT_TEXT_COMMAND"]'));
    buttons.forEach((b) => {
      const dataMouseDown = b.getAttribute('data-mouse-down');
      if (dataMouseDown!==null) {
        b.addEventListener('mousedown',dispatchFormatTextCommand,true);
        b.addEventListener('touchstart',dispatchFormatTextCommand,true);
      } else {
        b.addEventListener('click',dispatchFormatTextCommand,true);
      }
    });
    const clearTextFormattingBtn = floatingFormatTextMenu.querySelector<HTMLButtonElement>('button[data-dispatch="CLEAR_TEXT_FORMATTING"]');
    if (clearTextFormattingBtn) clearTextFormattingBtn.addEventListener('click',clearTextFormattingOnClick,true);
    const backgroundColorButtton = floatingFormatTextMenu.querySelector<HTMLButtonElement>('#floating-bg-color-button');
    const backgroundColorInput = floatingFormatTextMenu.querySelector<HTMLInputElement>('#floating-bg-color-bg-color');
    const backgroundColorTransparent = floatingFormatTextMenu.querySelector<HTMLInputElement>('#floating-bg-color-transparent');
    const textColorButtton = floatingFormatTextMenu.querySelector<HTMLButtonElement>('#floating-text-color-button');
    const textColorInput = floatingFormatTextMenu.querySelector<HTMLInputElement>('#floating-text-color-color');
    const textColorTransparent = floatingFormatTextMenu.querySelector<HTMLInputElement>('#floating-text-color-transparent');
    const rewriteWithAI = floatingFormatTextMenu.querySelector<HTMLButtonElement>('button[data-dispatch="REWRITE_WITH_AI"]');
    if (rewriteWithAI) rewriteWithAI.addEventListener('click',onRewriteSelectionWidthAIClick);
    if (backgroundColorButtton&&!!!getNoColor(editor)) backgroundColorButtton.addEventListener('click',closeOtherColorPopover);
    if (backgroundColorInput&&!!!getNoColor(editor)) backgroundColorInput.addEventListener('input',floatingBackgroundColorChange);
    if (backgroundColorTransparent&&!!!getNoColor(editor)) backgroundColorTransparent.addEventListener('change',floatingBackgroundTransparentChange);
    if (textColorButtton&&!!!getNoColor(editor)) textColorButtton.addEventListener('click',closeOtherColorPopover);
    if (textColorInput&&!!!getNoColor(editor)) textColorInput.addEventListener('input',floatingTextColorChange);
    if (textColorTransparent&&!!!getNoColor(editor)) textColorTransparent.addEventListener('change',floatingTextTransparentChange);
  }
  registerToolbarListeners(editor);
  document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenUploadFileDialog);
  document.addEventListener<any>('OPEN_LEXICAL_DIALOG',handleOpenLexDialog);
  document.addEventListener<any>('CLOSE_LEXICAL_DIALOG',handleCloseLexDialog);
  const arr = [
    editor.registerCommand(
      FONT_FAMILY_CHANGE,
      (fontWithSemiColon: VALID_FONT|'Inherit') => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
          fontFamilyChangeCallback(selection,fontWithSemiColon);
          $setSelection(selection);
          editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
          const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
          if (wrapper) wrapper.focus();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      FONT_WEIGHT_CHANGE,
      (weight: VALID_FONT_WEIGHT|'Inherit') => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
          fontWeightChangeCallback(selection,weight);
          $setSelection(selection);
          editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
          const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
          if (wrapper) wrapper.focus();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      FONT_SIZE_CHANGE,
      (size:VALID_FONT_SIZE|'Inherit') => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
          fontSizeChangeCallback(selection,size);
          $setSelection(selection);
          editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
          const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
          if (wrapper) wrapper.focus();
          return true;
        }
        return false;
      },  
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      MAKE_TRANSPARENT,
      (payload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          makeTransparentCallback(selection,payload);
          editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
          editor.focus();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        closeFloatingContextMenu(); // Close floating context menu on selection change command
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      UPDATE_TOOLBAR_COMMAND,
      () => {
        const ret = $updateToolbar(editor);
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&!!!selection.isCollapsed()){
          editor.dispatchCommand(LAUNCH_SELECTION_MENU,ret);
        } else {
          closeFloatingContextMenu();
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      LAUNCH_SELECTION_MENU,
      (obj) => {
        if (editor.isEditable()) {
          $updateFloatingMenu(obj,editor);
          const currentEditorID = getCurrentEditorID();
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&selection.getNodes().length>=1&&!!!selection.isCollapsed()) {
            const selection = document.getSelection();
            const root = editor.getRootElement();
            if (root&&selection&&selection.rangeCount>0&&currentEditorID===editor._config.namespace) {
              const rect = getDOMRangeRectAbsolute(selection,root);
              if (getPortalEl()) {
                getPortalEl().style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
                getPortalEl().style.left = ((rect.left+rect.right)/2).toString().concat('px');
                if (obj&&!!!obj.code.insideCode) {
                  openFloatingContextMenu(getPortalEl(),editor);
                }
                return true;
              }
            } 
          }
        }
        closeFloatingContextMenu();
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      CLEAR_TEXT_FORMATTING,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) clearTextFormattingCallback(selection);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    registerSpeechToText(editor),
    () => {
      const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
      if (wrapper) wrapper.removeEventListener('keydown',handleHeadingKeyUp)
    },
    editor.registerCommand(BLUR_COMMAND,() => {
      const wrapper_id = editor._config.namespace;
      const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
      if (wrapper) {
        const buttons = getEditorButtons(wrapper as HTMLDivElement);
        Object.values(buttons)
        .forEach((b) => {
          if(b&&b.nodeName==="BUTTON"){
            b.removeAttribute('disabled');
          }
        })
      }
      handleFocusOut();
      return false;
    },COMMAND_PRIORITY_EDITOR),
    editor.registerCommand(ASK_AI_COMMAND,({ url, selection, context }) => {
      const root = $getRoot();
      if (root) {
        root.clear();
        const paragraphNode = $createParagraphNode();
        paragraphNode.append($createTextNode(`<CONTEXT>\n${context}\n</CONTEXT>\nBased on the provided context, what does the following mean: "${selection}"?`))
        const p2 = $createParagraphNode();
        p2.append($createTextNode("You can find out more about the context or selection by visiting: "))
        const l = $createLinkNode(url);
        l.append($createTextNode("frankmbrown.net"));
        p2.append(l);
        root.append(paragraphNode,p2);
        root.selectEnd();
      }
      const dialog = document.getElementById('ai-chat-dialog') as HTMLDivElement|null;
      if (dialog) openDialog(dialog);
      return true;
    },COMMAND_PRIORITY_EDITOR),
    editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,() => {
      registerToolbarListeners(editor);
      return false;
    },COMMAND_PRIORITY_EDITOR)
  ];
  if (editor.hasNode(AiChatNode)) {
    arr.push(
      editor.registerCommand(
        INSERT_AI_CHAT_NODE,
        (obj) => {
          const node = $createAiChatNode(obj);
          $insertNodes([node]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }
  const wrapper = document.getElementById(editor._config.namespace);
  if (wrapper) {
    const viewSizesButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-view-sizes]');
    if (viewSizesButton) {
      document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnViewDifferentSizesDialog);
    }
  }
  

  if (!!!getNoColor(editor)) {
    arr.push(
      editor.registerCommand(
        TEXT_COLOR_CHANGE,
        (textColor: string) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&!!!getNoColor(editor)){
            textColorChangeCallback(selection,textColor);
            $setSelection(selection);
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            editor.focus();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        BACKGROUND_COLOR_CHANGE,
        (backgroundColor) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&!!!getNoColor(editor)) {
            backgroundColorChangeCallback(selection,backgroundColor);
            $setSelection(selection);
            editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
            editor.focus();
            return true;
          }
          return false;
        },  
        COMMAND_PRIORITY_EDITOR
      ),
      registerBlockStyleCustomization(editor),
    )
  }
  return mergeRegister(...arr);
}
const EDITOR_ID_TO_TOOLBARS:{[id:string]:string} = {};
export function registerLoadUnloadToolbarEditable(editor:LexicalEditor) {
  return mergeRegister(
    // editor.registerCommand(FOCUS_COMMAND,
    //   () => {
    //     console.log("Focus Command");
    //     const str = EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    //     if (EDITOR_ID_TO_TOOLBARS[editor._config.namespace]) {
    //       const wrapper = document.getElementById(editor._config.namespace);
    //        if (wrapper) {
    //         wrapper.insertAdjacentHTML("afterbegin",str);
    //         editor.dispatchCommand(REGISTER_TOOLBAR_LISTENERS,undefined);
    //         delete EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    //        }
    //     }
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL
    // ),
    // editor.registerCommand(BLUR_COMMAND,
    //   () => {
    //     const wrapper = document.getElementById(editor._config.namespace);
    //     if (wrapper) {
    //       var str = '';
    //       const children = wrapper.children;
    //       const children_to_remove:HTMLElement[] = [];
    //       for (let child of children) {
    //         if (child instanceof HTMLElement && child.getAttribute('role')==="toolbar") {
    //           str += child.outerHTML;
    //           children_to_remove.push(child);
    //         } else if (child instanceof HTMLElement && child.hasAttribute('data-rich-text-editor')) {
    //           break;
    //         }
    //       }
    //       children_to_remove.forEach((child) => child.remove());
    //       EDITOR_ID_TO_TOOLBARS[editor._config.namespace] = str;
    //     }
    //     return false;
    //   },
    //   COMMAND_PRIORITY_CRITICAL
    // ),
    // () => {
    //   delete EDITOR_ID_TO_TOOLBARS[editor._config.namespace];
    // },
    () => {}
  )
}

export function registerNoToolbar(editor:LexicalEditor) {
  const wrapper_id = editor._config.namespace;
  const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
  if (wrapper) {
    wrapper.addEventListener('focusin',closeFloatingContextMenu);
  }
  return () => {
    const wrapper_id = editor._config.namespace;
    const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
    if(wrapper)wrapper.removeEventListener('focusin',closeFloatingContextMenu)
  }
}
export function getOnDocumentClickArticle(e:Event) {
  if (!!!(e as any)._lexicalHandled) {
    closeFloatingArticleMenu();
  }
}

export function onCommentArticle(_:Event) {
  const editor = getCurrentEditor();
  if (editor) editor.dispatchCommand(ADD_COMMENT_ARTICLE_COMMAND,undefined);
}
export function onAnnotateArticle(_:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    editor.dispatchCommand(ADD_ANNOTATE_ARTICLE_COMMAND,undefined);
  }
}
export function onShareArticle(_:Event) {
  const editor = getCurrentEditor();
  if (editor) editor.dispatchCommand(COPY_LINK_SELECTION,undefined);
}

function shareFacebook() {
  if (SHARE_ARTICLE_STATE["facebook"]) {
    const a = document.createElement('a');
    a.target="_blank";
    a.href = `https://www.facebook.com/share.php?u=${encodeURI(SHARE_ARTICLE_STATE["facebook"].payload)}`;
    a.target="_blank";
    a.click();
  }
}
function shareTwitter() {
  if (SHARE_ARTICLE_STATE["x"]) {
    const a = document.createElement('a');
    a.target="_blank";
    a.href = `http://twitter.com/share?&url=${SHARE_ARTICLE_STATE["x"].payload.url}&text=${SHARE_ARTICLE_STATE["x"].payload.text}`;
    a.click();
  }
}
function shareReddit() {
  if (SHARE_ARTICLE_STATE["reddit"]) {
    const a = document.createElement('a');
    a.target="_blank";
    a.href = `http://www.reddit.com/submit?url=${SHARE_ARTICLE_STATE["reddit"].payload.url}&title=${SHARE_ARTICLE_STATE["reddit"].payload.title}&type=LINK`;
    a.click();
  }
}
function shareLinkedin() {
  if (SHARE_ARTICLE_STATE["linkedin"]) {
    const a = document.createElement('a');
    a.target="_blank";
    a.href = `https://www.linkedin.com/sharing/share-offsite/?url=${SHARE_ARTICLE_STATE["linkedin"].payload}`;
    a.target="_blank";
    a.click();
  }
}
function shareEmail() {
  if (SHARE_ARTICLE_STATE["email"]) {
    const a = document.createElement('a');
    a.target="_blank";
    const mailtoLink = `mailto:?subject=${encodeURIComponent(SHARE_ARTICLE_STATE["email"].payload.subject)}&body=${encodeURIComponent(SHARE_ARTICLE_STATE["email"].payload.body)}`;
    a.href = mailtoLink;
    a.click();
  }
}
function shareLink() {
  if (SHARE_ARTICLE_STATE["link"]) {
    navigator.clipboard.writeText(SHARE_ARTICLE_STATE["link"].payload)
    .then(() => {
      if (SHARE_ARTICLE_STATE["link"]?.type==="article") document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity: 'success', message: "Copied link to article selection to clipboard!"  }}));
      else document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: 'success', message: "Copied link to comment to clipboard!"  }}));
    })
    .catch((e) => {
      console.error(e);
      if (SHARE_ARTICLE_STATE["link"]?.type==="article") document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity: 'error', message: "Failed to copy link to selection to clipbaord!"  }}));
      else document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: 'error', message: "Failed to copy link to comment to clipbaord!"  }}));
    })
  }
}
function onPinterestClick() {
  if (SHARE_ARTICLE_STATE['pinterest']) {
    const { url, image, title } = SHARE_ARTICLE_STATE['pinterest'].payload; 
    const a = document.createElement('a');
    a.href=`https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`;
    a.target="_blank";
    a.click();
  }
}
function onWhatsAppClick() {
  if (SHARE_ARTICLE_STATE['whats-app']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['whats-app'].payload;
    a.href=`https://api.whatsapp.com/send?text=${title} ${url}`;
    a.target="_blank";
    a.click();
  }
}
function onTelegramClick() {
  if (SHARE_ARTICLE_STATE['telegram']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['telegram'].payload;
    a.href=`https://telegram.me/share/url?url=${url}&text=${title}`;
    a.target="_blank";
    a.click();
  }
}
function onTumblrClick() {
  if (SHARE_ARTICLE_STATE['tumblr']) {
    const a = document.createElement('a');
    const { url, title, description } = SHARE_ARTICLE_STATE['tumblr'].payload;
    a.href=`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${title}&caption=${description}`;
    a.target="_blank";
    a.click(); 
  }
}
function onPocketClick() {
  if (SHARE_ARTICLE_STATE['pocket']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['pocket'].payload;
    a.href=`https://getpocket.com/save?url=${url}&title=${title}`;
    a.target="_blank";
    a.click(); 
  }
}
function onBufferClick() {
  if (SHARE_ARTICLE_STATE['buffer']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['buffer'].payload;
    a.href=`https://buffer.com/add?text=${title}&url=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onDiggClick() {
  if (SHARE_ARTICLE_STATE['digg']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['digg'].payload;
    a.href=`https://digg.com/submit?url=${url}&title=${title}`;
    a.target="_blank";
    a.click(); 
  }
}
function onMixClick() {
  if (SHARE_ARTICLE_STATE['mix']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['mix'].payload;
    a.href=`https://mix.com/add?url=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onVKontakteClick() {
  if (SHARE_ARTICLE_STATE['vkonate']) {
    const a = document.createElement('a');
    const { url, title, description, image } = SHARE_ARTICLE_STATE['vkonate'].payload;
    a.href=`https://vk.com/share.php?url=${url}&title=${title}&description=${description}&image=${image}&noparse=true`;
    a.target="_blank";
    a.click(); 
  }
}
function onXINGClick() {
  if (SHARE_ARTICLE_STATE['xing']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['xing'].payload;
    a.href=`https://www.xing.com/spi/shares/new?url=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onEvernoteClick() {
  if (SHARE_ARTICLE_STATE['evernote']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['evernote'].payload;
    a.href=`https://www.evernote.com/clip.action?url=${url}&title=${title}`;
    a.target="_blank";
    a.click(); 
  }
}
function onHackerClick() {
  if (SHARE_ARTICLE_STATE['hacker']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['hacker'].payload;
    a.href=`https://news.ycombinator.com/submitlink?u=${url}&t=${title}`;
    a.target="_blank";
    a.click(); 
  }
}
function onFlipboardClick() {
  if (SHARE_ARTICLE_STATE['flipboard']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['flipboard'].payload;
    a.href=`https://share.flipboard.com/bookmarklet/popout?url=${url}&title=${title}`;
    a.target="_blank";
    a.click(); 
  }
}
function onMeneameClick() {
  if (SHARE_ARTICLE_STATE['mename']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['mename'].payload;
    a.href=`https://www.meneame.net/submit.php?url=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onBloggerClick() {
  if (SHARE_ARTICLE_STATE['blogger']) {
    const a = document.createElement('a');
    const { url, title, description } = SHARE_ARTICLE_STATE['blogger'].payload;
    a.href=`https://www.blogger.com/blog-this.g?u=${url}&n=${title}&t=${description}`;
    a.target="_blank";
    a.click(); 
  }
}
function onOdnoklassnikiClick() {
  if (SHARE_ARTICLE_STATE['odnoklassiniki']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['odnoklassiniki'].payload;
    a.href=`https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onYahooClick() {
  if (SHARE_ARTICLE_STATE['yahoo']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['yahoo'].payload;
    a.href=`http://compose.mail.yahoo.com/?body=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onGoogleClick() {
  if (SHARE_ARTICLE_STATE['google']) {
    const a = document.createElement('a');
    const { url, title, description } = SHARE_ARTICLE_STATE['google'].payload;
    a.href=`https://www.google.com/bookmarks/mark?op=add&bkmk=${url}&title=${title}&annotation=${description}`;
    a.target="_blank";
    a.click(); 
  }
}
function onLineClick() {
  if (SHARE_ARTICLE_STATE['line']) {
    const a = document.createElement('a');
    const url = SHARE_ARTICLE_STATE['line'].payload;
    a.href=`https://social-plugins.line.me/lineit/share?url=${url}`;
    a.target="_blank";
    a.click(); 
  }
}
function onRenrenClick() {
  if (SHARE_ARTICLE_STATE['renren']) {
    const a = document.createElement('a');
    const { url, title, description } = SHARE_ARTICLE_STATE['renren'].payload;
    a.href=`http://widget.renren.com/dialog/share?resourceUrl=${url}&srcUrl=${url}&title=${title}&description=${description}`;
    a.target="_blank";
    a.click(); 
  }
}
function onWeiboClick() {
  if (SHARE_ARTICLE_STATE['weibo']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['weibo'].payload;
    a.href=`http://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=&appkey=`;
    a.target="_blank";
    a.click(); 
  }
}
function onBaiduClick() {
  if (SHARE_ARTICLE_STATE['baidu']) {
    const a = document.createElement('a');
    const { url, title } = SHARE_ARTICLE_STATE['baidu'].payload;
    a.href=`http://cang.baidu.com/do/add?it=${title}&iu=${url}&fr=ien#nw=1`;
    a.target="_blank";
    a.click(); 
  }
}


export function setShareArticleSelection(_:Event) {
  const editor = getCurrentEditor();
  if (editor&&editor._rootElement) {
    const el = editor._rootElement;
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text_selection = selection.getTextContent();
        const title = document.title;
        const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content');
        var twitter_text = title;
        if (description) twitter_text += "\n" + description;
        twitter_text += "\n" + text_selection; 
        const { start, end, content } = saveSelection(el);
        const editorNamespace = editor._config.namespace;
        var url = window.location.href;
        url = url.concat(`?scroll_to_node=true&namespace=${encodeURIComponent(editorNamespace)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&content=${encodeURIComponent(content)}`);
        const image = document.getElementById('META_OG_IMAGE')?.getAttribute('content')||'';
        var email_body = url + "\n" + (description ? "\n"+description:"") + "\n" + text_selection;
        SHARE_ARTICLE_STATE.facebook = { type: "article", payload: url };
        SHARE_ARTICLE_STATE.x = { type: "article", payload: { url, text: twitter_text } };
        SHARE_ARTICLE_STATE.reddit = { type: "article", payload: { url, title: title }};
        SHARE_ARTICLE_STATE.linkedin = { type: "article", payload: url };
        SHARE_ARTICLE_STATE.email = { type: "article", payload: { subject: title, body: email_body }};
        SHARE_ARTICLE_STATE.link = { type: "article",payload: url };
        SHARE_ARTICLE_STATE["pinterest"] = {type:"article", payload: { url, title,image}}
        SHARE_ARTICLE_STATE["whats-app"] = {type:"article", payload: { url, title,image}}
        SHARE_ARTICLE_STATE["telegram"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["tumblr"] = {type:"article", payload: { url, title, description:description||''}}
        SHARE_ARTICLE_STATE["pocket"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["buffer"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["digg"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["mix"] = {type:"article", payload: url}
        SHARE_ARTICLE_STATE["vkonate"] = {type:"article", payload: { url, title, description:description||'',image}}
        SHARE_ARTICLE_STATE["xing"] = {type:"article", payload: url}
        SHARE_ARTICLE_STATE["evernote"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["hacker"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["flipboard"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["mename"] = {type:"article", payload: url}
        SHARE_ARTICLE_STATE["blogger"] = {type:"article", payload: { url, title, description:description||''}}
        SHARE_ARTICLE_STATE["odnoklassiniki"] = {type:"article", payload: url}
        SHARE_ARTICLE_STATE["yahoo"] = {type:"article", payload: url }
        SHARE_ARTICLE_STATE["google"] = {type:"article", payload: { url, title, description:description||''}}
        SHARE_ARTICLE_STATE["renren"] = {type:"article", payload: { url, title, description:description||'' }}
        SHARE_ARTICLE_STATE["weibo"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["baidu"] = {type:"article", payload: { url, title}}
        SHARE_ARTICLE_STATE["line"] = {type:"article", payload: url}

      }
    })
  }
}
export function onAskAiSelection() {
  const currentEditor = getCurrentEditor();
  if (currentEditor) {
    currentEditor.getEditorState().read(() => {
      const Url = new URL(window.location.href);
      Url.hash = currentEditor._config.namespace;
      const url = Url.href;
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const textContent = selection.getTextContent();
        var context = '';
        const blockNodes = selection.getNodes();
        var firstBlock:LexicalNode|undefined = undefined;
        for (let node of blockNodes) {
          const closestBlock = $findMatchingParent(node,(n) => $isRootNode(n.getParent()));
          if (closestBlock) {
            firstBlock = closestBlock;
            break;
          }
        }
        if (firstBlock) {
          var curr:LexicalNode|null = firstBlock;
          while (curr&&context.length < 1000) {
            context = curr.getTextContent() + context;
            curr = curr.getPreviousSibling();
          }
        }
        const editor = getEditorInstances()['ai-chat-editor'];
        if (editor) {
          closeFloatingArticleMenu();
          editor.dispatchCommand(ASK_AI_COMMAND,{ url, selection: textContent, context });         
        }
      }
    })
  }
  
  
}


// restore the selection specified by the given state and reference node, and
// return the new selection object
function getRange(state:AnnotationSelectionState, referenceNode?:Node) {
  referenceNode = (referenceNode || document.body) as any
  const textNodes:{node: Text, start?: number, end?:number }[] = []
  var i
    , node
    , nextNodeCharIndex
    , currentNodeCharIndex = 0
    , nodes = [referenceNode]
    , range = document.createRange();
  //@ts-ignore
  range.setStart(referenceNode, 0)
  range.collapse(true)
  var started = false;
  var ended = false;

  while (node = nodes.pop()) {
    
    if (node.nodeType === 3) { // TEXT_NODE
      //@ts-ignore
      nextNodeCharIndex = currentNodeCharIndex + node.length

      // if this node contains the character at the start index, set this as the
      // starting node with the correct offset
      if (state.start >= currentNodeCharIndex && state.start <= nextNodeCharIndex) {
        range.setStart(node, state.start - currentNodeCharIndex);
        textNodes.push({ node: node as Text, start: state.start - currentNodeCharIndex })
        started = true;
      }

      // if this node contains the character at the end index, set this as the
      // ending node with the correct offset and stop looking
      if (state.end >= currentNodeCharIndex && state.end <= nextNodeCharIndex) {
        range.setEnd(node, state.end - currentNodeCharIndex);
        textNodes.push({ node: node as Text, end: state.end - currentNodeCharIndex });
        ended = true;
        break
      }
      if (started&&!!!ended) {
        textNodes.push({ node: node as Text });
      }
      currentNodeCharIndex = nextNodeCharIndex
    } else {

      // get child nodes if the current node is not a text node
      i = node.childNodes.length
      while (i--) {
        nodes.push(node.childNodes[i])
      }
    }
  }
  return { range, nodes: textNodes };
}

// serialize the current selection offsets using given node as a reference point
function saveSelection(referenceNode?:HTMLElement) {
  referenceNode = referenceNode || document.body
  
  var sel = window.getSelection()
    , range = sel?.rangeCount
        ? sel.getRangeAt(0).cloneRange()
        : document.createRange()
    , startContainer = range.startContainer
    , startOffset = range.startOffset
    , state:Partial<AnnotationSelectionState> = { content: range.toString() }

  // move the range to select the contents up to the selection
  // so we can find its character offset from the reference node
  range.selectNodeContents(referenceNode)
  range.setEnd(startContainer, startOffset)

  state.start = range.toString().length
  state.end = state.start + (state as AnnotationSelectionState).content.length

  return state as AnnotationSelectionState
}

export function registerCommentArticleNotEditable(editor:LexicalEditor,annotationOnly:boolean) {
  document.addEventListener('HIDE_OPEN_POPOVERS',hideOpenPopovers);
  addSocialMediaListerrs();
  const menu = document.getElementById(FLOATING_ARTICLE_MENU_ID);
  if (menu) {
    menu.addEventListener('click',stopPropagation);
    document.addEventListener('click',getOnDocumentClickArticle);
    const commentArticleCommand = menu.querySelector<HTMLButtonElement>('button[data-dispatch="COMMENT_ARTICLE_COMMAND"]');
    const annotateArticleCommand = menu.querySelector<HTMLButtonElement>('button[data-dispatch="ANNOTATE_ARTICLE_COMMAND"]');
    const linkArticleCommand = menu.querySelector<HTMLButtonElement>('button[data-dispatch="COPY_LINK_SELECTION"]');
    const askAiSelection = menu.querySelector<HTMLButtonElement>('button[data-dispatch="ASK_AI_SELECTION"]');
    const shareLexSelectionButton = menu.querySelector<HTMLButtonElement>('#share-lex-selection-button');
    if (commentArticleCommand) commentArticleCommand.addEventListener('click',onCommentArticle);
    if (annotateArticleCommand)annotateArticleCommand.addEventListener('click',onAnnotateArticle);
    if (linkArticleCommand)linkArticleCommand.addEventListener('click',onShareArticle);
    if (shareLexSelectionButton) {
      if (isTouchDevice()) shareLexSelectionButton.addEventListener('touchstart',setShareArticleSelection);
      else shareLexSelectionButton.addEventListener('mousedown',setShareArticleSelection); 
    }
    if (askAiSelection) askAiSelection.addEventListener('click',onAskAiSelection);
  }
  const arr = [
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        closeFloatingArticleMenu(); // Close floating context menu on selection change command
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&selection.getNodes().length>=1&&!!!selection.isCollapsed()) {
          const selection = document.getSelection();
          const root = editor.getRootElement();
          if (root&&selection&&selection.rangeCount>0&&getCurrentEditorID()===editor._config.namespace) {
            const rect = getDOMRangeRectAbsolute(selection,root);
            if (getPortalEl()) {
              getPortalEl().style.top = `calc(${rect.top.toString().concat('px') + ` + var(--safe-area-inset-top-0px) + var(--virtual-keyboard-height)`})`;
              getPortalEl().style.left = ((rect.left+rect.right)/2).toString().concat('px');
              closeFloatingContextMenu();
              openFloatingArticleMenu(getPortalEl(),editor,editor._config.namespace,annotationOnly);
              return true;
            }
          } 
        }
        closeFloatingArticleMenu();
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      CLICK_COMMAND,(e) => {
        const selection = $getSelection();
        if (!!!$isRangeSelection(selection)||selection.getNodes().length<1||selection.isCollapsed()) { 
          closeFloatingArticleMenu();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ), 
    function() {
      document.removeEventListener('click',closeFloatingArticleMenu);
    },
    editor.registerCommand(
      ADD_ANNOTATE_ARTICLE_COMMAND,
      () => {
        const editorHTMLElement = editor._rootElement;
        const selection = $getSelection() || $getPreviousSelection();
        if ($isRangeSelection(selection)&&editorHTMLElement) {

          const editorWrapper = editorHTMLElement.classList.contains('lexical-wrapper')?editorHTMLElement:editorHTMLElement.closest('div.lexical-wrapper');
          const annotationEditor = getEditorInstances()['annotate-editor'];
          if (annotationEditor&&annotationEditor.isEditable()&&editorWrapper) {
            const id = editorWrapper.id;
            const annotation_root_element = document.getElementById('annotate-editor');
            if (annotation_root_element) {
              const annotation_form = annotation_root_element.closest('form');
              if (annotation_form) {
                const annotation_start = document.getElementById('annotation-start') as HTMLInputElement|null;
                const annotation_end = document.getElementById('annotation-end') as HTMLInputElement|null;
                const annotation_content = document.getElementById('annotation-content') as HTMLInputElement|null;
                const annotation_refernce_id = document.getElementById('annotation-reference-id') as HTMLInputElement|null;
                const selectionToSave = saveSelection(editorHTMLElement);
                if (annotation_start&&annotation_end&&annotation_content&&annotation_refernce_id&&id.startsWith('id_')&&selectionToSave.content.length>=1&&Number.isInteger(selectionToSave.start)&&Number.isInteger(selectionToSave.end)) {
                    annotation_start.value = String(selectionToSave.start);
                    annotation_end.value = String(selectionToSave.end);
                    annotation_content.value = String(selectionToSave.content);
                    annotation_refernce_id.value = String(id.slice(3));
                    closeFloatingArticleMenu();
                    annotationEditor.dispatchCommand(RECEIVE_ANNOTATE_ARTICLE_COMMAND,undefined);
                }
              }
            }
          } else if (!!!annotationEditor||!!!annotationEditor.isEditable()) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "You must be logged in to add an annotation to the article." }}))
          }
        }
        return false; 
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      COPY_LINK_SELECTION,
      () => {
        const rootElement = editor._rootElement;
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&rootElement) {
          const selection = saveSelection(rootElement);
          var str = window.location.href;
          str = str.concat(`?scroll_to_node=true&namespace=${encodeURIComponent(editor._config.namespace)}&start=${encodeURIComponent(selection.start)}&end=${encodeURIComponent(selection.end)}&content=${encodeURIComponent(selection.content)}`);

          navigator.clipboard.writeText(str)
          .then(() => {
            closeFloatingArticleMenu();
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity: "success", message: "Successfully copied link URL to clipboard!" }}))
          })
          .catch((e) => {
            console.error(e);
            document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong copying the link URL to the clipboard." }}))
          })
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      SCROLL_TO_NODE,
      (obj) => {
        const rootElement = editor._rootElement;
        if (rootElement) {
          const { range, nodes} = getRange(obj,rootElement);
          if (nodes.length) {
            const parentElement = nodes[0].node.parentElement;
            if (parentElement) parentElement.scrollIntoView();
            const highlight = new Highlight(range);
            highlight.type = "highlight";
            CSS.highlights.set('temp-highlight',highlight);
            setTimeout(() => {
              CSS.highlights.delete('temp-highlight');
            },4000);
          }
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
  ];
  if (!!!annotationOnly) {
    arr.push(editor.registerCommand(
      ADD_COMMENT_ARTICLE_COMMAND,
      () => {
        const selection = $getSelection() || $getPreviousSelection();
        if ($isRangeSelection(selection)) {
          const eventData = $getLexicalContent(editor);
          const editorInstances = getEditorInstances();
          if (editorInstances["comment-editor"]&&editorInstances["comment-editor"].isEditable()&&eventData) {
            closeFloatingArticleMenu();
            const hideShowSection = document.getElementById('hide-comment-hide-show');
            if (hideShowSection&&hideShowSection.hasAttribute('hidden')) hideShowSection.removeAttribute('hidden'); 
            editorInstances["comment-editor"].dispatchCommand(RECEIVE_COMMENT_ARTICLE_COMMAND,eventData);
          } else if (!!!editorInstances["comment-editor"]||!!!editorInstances["comment-editor"].isEditable()) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "You must be logged in to add a comment to the article." }}))
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ));
  }
  return mergeRegister(...arr);
}

// This is on the backend as well
const STRING_TO_NODE = {
  "ImageNode": ImageNode,
  "AudioNode": AudioNode,
  "VideoNode": VideoNode,
  "YouTubeNode": YouTubeNode,
  "NewsNode": NewsNode,
  "TwitterNode": TwitterNode,
  "TikTokNode": TikTokNode,
  "InstagramNode": InstagramNode,
  "HTMLNode": HtmlNode,
  "TableNode": TableNode,
  "MathNode": MathNode
} as const;
const STRING_TO_NODE_STRING = {
  "ImageNode": "Image",
  "AudioNode": "Audio Element",
  "VideoNode": "Video Element",
  "YouTubeNode": "YouTube Video",
  "NewsNode": "News Link",
  "TwitterNode": "Twitter Embed",
  "TikTokNode": "TikTok Embed",
  "InstagramNode": "Instagram Embed",
  "HTMLNode": "HTML node",
  "TableNode": "Table",
  "MathNode": "Block Math node"
} as const;
type NodeTypeString = "ImageNode"|"AudioNode"|"VideoNode"|"YouTubeNode"|"NewsNode"|"TwitterNode"|"TikTokNode"|"InstagramNode"|"HTMLNode"|"TableNode"|"MathNode";
type CommentNodeRestiction = {"count": number, "nodes": NodeTypeString[]}[]

const DEFAULT_NODE_RESTRICTION:CommentNodeRestiction = [
  {"count": 1, "nodes": ["ImageNode","AudioNode","VideoNode","YouTubeNode","NewsNode","TwitterNode","TikTokNode","InstagramNode"]},
  {"count": 1, "nodes": ["HTMLNode","TableNode","MathNode"]},
]

const EDITOR_TO_NODE_RESTRICTION:{[key:string]: CommentNodeRestiction} = {};
const EDITOR_TO_NODE_RESTRICTION_STATE:{[key:string]: {
  "ImageNode": boolean,
  "AudioNode": boolean,
  "VideoNode": boolean,
  "YouTubeNode": boolean,
  "NewsNode": boolean,
  "TwitterNode": boolean,
  "TikTokNode": boolean,
  "InstagramNode": boolean,
  "HTMLNode": boolean,
  "TableNode": boolean,
  "MathNode": boolean
}} = {};

/**
 * Dispatch error snackbar on error message violation
 * @param error 
 */
function onNodeRestrictionViolation(error:string) {
  document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: error }}))
}


function getMutationCallback(editor:LexicalEditor,editor_id:string,count:number,nodeArray:NodeTypeString[]) {
  const callback = (mutations: Map<string, NodeMutation>) => {
    for (const [key, type] of mutations) {
      if (type !== 'updated') {
        editor.update(() => {
          const nodesOfTypeArray = [];
          for (let nodeType of nodeArray) {
            const NodeClass = STRING_TO_NODE[nodeType];
            if (nodeType==="MathNode") {
              /* @ts-ignore */
              nodesOfTypeArray.push(...$nodesOfType(NodeClass).filter((node) => !!!(node as MathNode).isInline()));
            } else {
              /* @ts-ignore */
              nodesOfTypeArray.push(...$nodesOfType(NodeClass));
            }
          }
          if (nodesOfTypeArray.length>count) {
            var strArr = nodeArray.map((s) => STRING_TO_NODE_STRING[s]).slice(0,nodeArray.length-1).join(', ');
            strArr += ", or " + STRING_TO_NODE_STRING[nodeArray[nodeArray.length-1]];
            const sortedNodesOfTypeArray = nodesOfTypeArray.sort((a,b) => parseInt(b.getKey())-parseInt(a.getKey()));
            var toDelete = nodesOfTypeArray.length-count;
            while (toDelete>0) {
              sortedNodesOfTypeArray[toDelete].remove();
              toDelete-=1;
            }
            onNodeRestrictionViolation(`Only ${count} of ${strArr} nodes are allowed in the comments.`);
          } else if (nodesOfTypeArray.length===count) {
            nodeArray.forEach((s) => {
              EDITOR_TO_NODE_RESTRICTION_STATE[editor_id][s] = true;
            })
          } else {
            nodeArray.forEach((s) => {
              EDITOR_TO_NODE_RESTRICTION_STATE[editor_id][s] = false;
            })
          }
        })
      }
    }
  }
  return callback;
}

/**
 * Testing out how to restrict the amount of certain nodes that can be inserted into the editor
 * Should be an array with each object in the array looking like:
 * 
 * ```json
 * {
 *  "count": "number",
 *  "nodes": "string[]"
 * }
 * ```
 * 
 * where `count` is the number of nodes of the types specified in `nodes` the editor is allowed to contain. Each string in `nodes` corresponds to a key in the object `STRING_TO_NODE`. We register a mutation listener to check for the creation and dleetion of these nodes so that we can prevent creation **AND** update the toolbar as necessary. 
 * 
 * @param editor 
 * @returns 
 */
export function registerCommentEditable(editor:LexicalEditor,nodeRestrictions=DEFAULT_NODE_RESTRICTION) {
  const arr = [
    editor.registerCommand(
      RECEIVE_COMMENT_ARTICLE_COMMAND,
      (serializedTextNodes:string) => {
        const blockquote = $createQuoteNode();
        const parsed = JSON.parse(serializedTextNodes);
        const parsedNodes = parsed.nodes;
        const nodes = $generateNodesFromSerializedNodes(parsedNodes);
        blockquote.append(...nodes);
        const rootNode = $getRoot();
        if (rootNode&&editor.isEditable()) rootNode.append(blockquote);
        if (editor._rootElement) {
          editor._rootElement.scrollIntoView();
          editor.focus();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    )
  ]
  const editor_id = editor._config.namespace;
  EDITOR_TO_NODE_RESTRICTION[editor_id] = nodeRestrictions;
  EDITOR_TO_NODE_RESTRICTION_STATE[editor_id] = {
    "ImageNode": false,
    "AudioNode": false,
    "VideoNode": false,
    "YouTubeNode": false,
    "NewsNode": false,
    "TwitterNode": false,
    "TikTokNode": false,
    "InstagramNode": false,
    "HTMLNode": false,
    "TableNode": false,
    "MathNode": false,
  }
  for (let i = 0; i < nodeRestrictions.length; i++) {
    const nodeArray = nodeRestrictions[i].nodes;
    const count = nodeRestrictions[i].count;
    for (let j = 0; j < nodeArray.length; j++) {
      const nodeTypeString = nodeArray[j];
      const NodeClass = STRING_TO_NODE[nodeTypeString];
      const NodeClassString = STRING_TO_NODE_STRING[nodeTypeString];
      if (editor.hasNode(NodeClass)) arr.push(editor.registerMutationListener(NodeClass,getMutationCallback(editor,editor_id,count,nodeArray)));
    }
  }
  arr.push(
    editor.registerCommand(UPDATE_TOOLBAR_COMMAND,() => {
      const wrapper = document.getElementById(editor_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
      if (wrapper) {
        const {
          imageButton,
          gifButton,
          audioButton,
          videoButton,
          embedNews,
          embedYoutube,
          embedX,
          embedTikTok,
          embedInstagram,
          embedReddit,
          embedMediaButton,
          codeButton,
          codeBlockButton,
          mathButton,
          tableButton,
          htmlButton
        } = getEditorButtons(wrapper as any);
        const state = EDITOR_TO_NODE_RESTRICTION_STATE[editor_id];
        Object.entries(state)
        .forEach(([key,shouldDisable]) => {
          switch (key) {
            case "ImageNode": {
              if (shouldDisable&&imageButton&&!!!imageButton.hasAttribute('diabled')) imageButton.setAttribute('disabled','');
              if (shouldDisable&&gifButton&&!!!gifButton.hasAttribute('diabled')) gifButton.setAttribute('disabled','');
              break;
            }
            case "AudioNode": {
              if (shouldDisable&&audioButton&&!!!audioButton.hasAttribute('diabled')) audioButton.setAttribute('disabled','');
              break;
            }
            case "VideoNode": {
              if (shouldDisable&&videoButton&&!!!videoButton.hasAttribute('diabled')) videoButton.setAttribute('disabled','');
              break;
            }
            case "YouTubeNode": {
              if (shouldDisable&&embedYoutube&&!!!embedYoutube.hasAttribute('diabled')) embedYoutube.setAttribute('disabled','');
              break;
            }
            case "NewsNode": {
              if (shouldDisable&&embedNews&&!!!embedNews.hasAttribute('diabled')) embedNews.setAttribute('disabled','');
              break;
            }
            case "TwitterNode": {
              if (shouldDisable&&embedX&&!!!embedX.hasAttribute('diabled')) embedX.setAttribute('disabled','');
              break;
            }
            case "TikTokNode": {
              if (shouldDisable&&embedTikTok&&!!!embedTikTok.hasAttribute('diabled')) embedTikTok.setAttribute('disabled','');
              break;
            }
            case "InstagramNode": {
              if (shouldDisable&&embedInstagram&&!!!embedInstagram.hasAttribute('diabled')) embedInstagram.setAttribute('disabled','');
              break;
            }
            case "HTMLNode": {
              if (shouldDisable&&htmlButton&&!!!htmlButton.hasAttribute('diabled')) htmlButton.setAttribute('disabled','');
              break;
            }
            case "TableNode": {
              if (shouldDisable&&tableButton&&!!!tableButton.hasAttribute('diabled')) tableButton.setAttribute('disabled','');
              break;
            }
            case "MathNode": {
              if (shouldDisable&&mathButton&&!!!mathButton.hasAttribute('diabled')) mathButton.setAttribute('disabled','');
              break;
            }
            default: {
              break;
            }
          }
        })
      }
      return false;
    },COMMAND_PRIORITY_EDITOR)
  );
  arr.push(() => {
    delete EDITOR_TO_NODE_RESTRICTION[editor_id];
    delete EDITOR_TO_NODE_RESTRICTION_STATE[editor_id];
  })
  return mergeRegister(...arr);
}
export function registerAnnotationEditable(editor:LexicalEditor) {
  const arr = [
    editor.registerCommand(
      RECEIVE_ANNOTATE_ARTICLE_COMMAND,
      (annotation:undefined) => {
        const rightSidebar = document.getElementById('notification-sidebar');
        if (rightSidebar&&rightSidebar.classList.contains('drawer')&&rightSidebar.getAttribute('aria-hidden')==="true") {
          rightSidebar.setAttribute('aria-hidden','false');
        }
        const annotationForm = document.getElementById('add-annotation-form');
        const hideShowButton = document.getElementById('hide-show-annotation-form');
        if (annotationForm&&annotationForm.hasAttribute('hidden')&&hideShowButton) {
          hideShowButton.click();
        }
        editor.focus();
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    )
  ];
  if (editor.hasNode(AnnotationNode)) {
    arr.push(
      editor.registerMutationListener(AnnotationNode, (mutations) => {
        editor.update(() => {
          for (const [key, type] of mutations) {
            if (type === 'created') {
              const nodes = $nodesOfType(AnnotationNode);
              for (let i = 0; i < nodes.length; i++) {
                nodes[i].remove();
              }
            }
          }
        });
      })
    );
  }
  return mergeRegister(...arr);
}


function addSocialMediaListerrs() {
  const facebook = document.getElementById('share-facebook-button-lex-menu');
  if (facebook) facebook.addEventListener('click',shareFacebook);
  const x = document.getElementById('share-x-button-lex-menu');
  if (x) x.addEventListener('click',shareTwitter);
  const reddit = document.getElementById('share-reddit-button-lex-menu');
  if (reddit) reddit.addEventListener('click',shareReddit);
  const linkedin = document.getElementById('share-linkedin-button-lex-menu');
  if (linkedin) linkedin.addEventListener('click',shareLinkedin);
  const email = document.getElementById('share-email-button-lex-menu');
  if (email) email.addEventListener('click',shareEmail);
  const link = document.getElementById('copy-link-button-lex-menu');
  if (link) link.addEventListener('click',shareLink);
  const pinterest = document.getElementById('share-pinterest-button-lex-menu');
  if (pinterest) pinterest.addEventListener('click',onPinterestClick);
  const WhatsApp = document.getElementById('share-WhatsApp-button-lex-menu');
  if (WhatsApp) WhatsApp.addEventListener('click',onWhatsAppClick);
  const Telegram = document.getElementById('share-Telegram-button-lex-menu');
  if (Telegram) Telegram.addEventListener('click',onTelegramClick);
  const Tumblr = document.getElementById('share-Tumblr-button-lex-menu');
  if (Tumblr) Tumblr.addEventListener('click',onTumblrClick);
  const Pocket = document.getElementById('share-Pocket-button-lex-menu');
  if (Pocket) Pocket.addEventListener('click',onPocketClick);
  const Buffer = document.getElementById('share-Buffer-button-lex-menu');
  if (Buffer) Buffer.addEventListener('click',onBufferClick);
  const Digg = document.getElementById('share-Digg-button-lex-menu');
  if (Digg) Digg.addEventListener('click',onDiggClick);
  const Mix = document.getElementById('share-Mix-button-lex-menu');
  if (Mix) Mix.addEventListener('click',onMixClick);
  const VKontakte = document.getElementById('share-VKontakte-button-lex-menu');
  if (VKontakte) VKontakte.addEventListener('click',onVKontakteClick);
  const XING = document.getElementById('share-XING-button-lex-menu');
  if (XING) XING.addEventListener('click',onXINGClick);
  const Evernote = document.getElementById('share-Evernote-button-lex-menu');
  if (Evernote) Evernote.addEventListener('click',onEvernoteClick);
  const HackerNews = document.getElementById('share-HackerNews-button-lex-menu');
  if (HackerNews) HackerNews.addEventListener('click',onHackerClick);
  const Flipboard = document.getElementById('share-Flipboard-button-lex-menu');
  if (Flipboard) Flipboard.addEventListener('click',onFlipboardClick);
  const meneame = document.getElementById('share-meneame-button-lex-menu');
  if (meneame) meneame.addEventListener('click',onMeneameClick);
  const blogger = document.getElementById('share-blogger-button-lex-menu');
  if (blogger) blogger.addEventListener('click',onBloggerClick);
  const Odnoklassniki = document.getElementById('share-Odnoklassniki-button-lex-menu');
  if (Odnoklassniki) Odnoklassniki.addEventListener('click',onOdnoklassnikiClick);
  const yahoo_mai = document.getElementById('share-yahoo_mai-button-lex-menu');
  if (yahoo_mai) yahoo_mai.addEventListener('click',onYahooClick);
  const google_bookmarks = document.getElementById('share-google_bookmarks-button-lex-menu');
  if (google_bookmarks) google_bookmarks.addEventListener('click',onGoogleClick);
  const line = document.getElementById('share-line-button-lex-menu');
  if (line) line.addEventListener('click',onLineClick);
  const renren = document.getElementById('share-renren-button-lex-menu');
  if (renren) renren.addEventListener('click',onRenrenClick);
  const weibo = document.getElementById('share-weibo-button-lex-menu');
  if (weibo) weibo.addEventListener('click',onWeiboClick);
  const baidu = document.getElementById('share-baidu-button-lex-menu');
  if (baidu) baidu.addEventListener('click',onBaiduClick);
}

function hideCommentHelper(comment:HTMLElement) {
  const commentBody = comment.querySelector('div.comment-body');
  const pp = comment.querySelector('img[data-profile-picture]');
  const showButton = comment.querySelector('button.show-comment');
  if (showButton&&commentBody&&pp) {
    pp.setAttribute('hidden','');
    showButton.removeAttribute('hidden');
    commentBody.setAttribute('hidden','');
    comment.setAttribute('data-hidden','true');
  }
}
function showCommentHelper(comment:HTMLElement) {
  const commentBody = comment.querySelector('div.comment-body');
  const pp = comment.querySelector('img[data-profile-picture]');
  const showButton = comment.querySelector('button.show-comment');
  if (showButton&&commentBody&&pp) {
    showButton.setAttribute('hidden','');
    pp.removeAttribute('hidden');
    commentBody.removeAttribute('hidden');
    comment.setAttribute('data-hidden','false');
  }
}

function hideComment(this:HTMLElement,_:Event) {
  const comment = this.closest<HTMLDivElement>('div[data-comment-tree-wrapper]');
  if (comment&&comment.getAttribute('data-hidden')==="false") {
    hideCommentHelper(comment);
  }
}
function showComment(this:HTMLElement) {
  const comment = this.closest<HTMLDivElement>('div[data-comment-tree-wrapper]');
  if (comment&&comment.getAttribute('data-hidden')==="true") {
    showCommentHelper(comment);
  }
}
function onClickCommentSummary(this:HTMLElement) {
  const comment = this.closest<HTMLElement>('div[data-comment-tree-wrapper]');
  if (comment&&comment.getAttribute('data-hidden')==="true") {
    showCommentHelper(comment);
  } else if (comment&&comment.getAttribute('data-hidden')==="false") {
    hideCommentHelper(comment);
  }
}
function getOnShareComment(editor:LexicalEditor,id:string,username:string) {
  const func = function () {
    editor.getEditorState().read(() => {
      const text_selection = $getTextContent();
      const title = document.title + " - " + username.concat(`'s Comment`);
      const description = document.getElementById('PAGE_DESCRIPTION')?.getAttribute('content');
      var twitter_text = title;
      if (description) twitter_text += "\n" + description;
      twitter_text += "\n" + text_selection; 
      const Url = new URL(window.location.href);
      Url.hash = id;
      var url = Url.href;
      const image = document.getElementById('META_OG_IMAGE')?.getAttribute('content')||'';
      var email_body = url + "\n" + (description ? "\n"+description:"") + "\n" + text_selection;
      SHARE_ARTICLE_STATE.facebook = { type: "article", payload: url };
      SHARE_ARTICLE_STATE.x = { type: "article", payload: { url, text: twitter_text } };
      SHARE_ARTICLE_STATE.reddit = { type: "article", payload: { url, title: title }};
      SHARE_ARTICLE_STATE.linkedin = { type: "article", payload: url };
      SHARE_ARTICLE_STATE.email = { type: "article", payload: { subject: title, body: email_body }};
      SHARE_ARTICLE_STATE.link = { type: "article",payload: url };
      SHARE_ARTICLE_STATE["pinterest"] = {type:"article", payload: { url, title,image}}
      SHARE_ARTICLE_STATE["whats-app"] = {type:"article", payload: { url, title,image}}
      SHARE_ARTICLE_STATE["telegram"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["tumblr"] = {type:"article", payload: { url, title, description:description||''}}
      SHARE_ARTICLE_STATE["pocket"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["buffer"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["digg"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["mix"] = {type:"article", payload: url}
      SHARE_ARTICLE_STATE["vkonate"] = {type:"article", payload: { url, title, description:description||'',image}}
      SHARE_ARTICLE_STATE["xing"] = {type:"article", payload: url}
      SHARE_ARTICLE_STATE["evernote"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["hacker"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["flipboard"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["mename"] = {type:"article", payload: url}
      SHARE_ARTICLE_STATE["blogger"] = {type:"article", payload: { url, title, description:description||''}}
      SHARE_ARTICLE_STATE["odnoklassiniki"] = {type:"article", payload: url}
      SHARE_ARTICLE_STATE["yahoo"] = {type:"article", payload: url }
      SHARE_ARTICLE_STATE["google"] = {type:"article", payload: { url, title, description:description||''}}
      SHARE_ARTICLE_STATE["renren"] = {type:"article", payload: { url, title, description:description||'' }}
      SHARE_ARTICLE_STATE["weibo"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["baidu"] = {type:"article", payload: { url, title}}
      SHARE_ARTICLE_STATE["line"] = {type:"article", payload: url}
    })
  }
  return func;
}

export function registerCommentNotEditable(editor:LexicalEditor) {
  addSocialMediaListerrs();
  const rootElement = editor._rootElement;
  if (rootElement) {
    const comment = rootElement.closest('div[data-comment-tree-wrapper]')
    if (comment) {
      const id = comment.id;
      const username = comment.querySelector<HTMLAnchorElement>('a[data-username]');
      if ((window as any).commentObserver) (window as any).commentObserver.observe(comment);
      const hideShowSummary = comment.querySelector<HTMLDivElement>('div.hide-comment-summary');
      if (hideShowSummary) hideShowSummary.addEventListener('click',onClickCommentSummary)
      const hideSidebar = comment.querySelector<HTMLDivElement>('div.comment-sidebar');
      if (hideSidebar) hideSidebar.addEventListener('click',hideComment);
      const showButton = comment.querySelector<HTMLButtonElement>('button.show-comment');
      if (showButton) showButton.addEventListener('click',showComment);
      const shareButton = comment.querySelector('button[data-share-button]');
      if (shareButton&&username) {
        if (isTouchDevice()) shareButton.addEventListener('touchstart',getOnShareComment(editor,id,username.innerText.trim()))
        else shareButton.addEventListener('mousedown',getOnShareComment(editor,id,username.innerText.trim()));
      }
    }
  }
  return () => {

  }
}

function handleHideShowAnnotation(this:HTMLButtonElement) {
  const svg = this.querySelector('svg');
  const annotation = this.closest('div[data-annotation]');  
  if (svg&&annotation) {
    const annotationContent = annotation.querySelector<HTMLDivElement>('div[data-annotation-content]');
    if (annotationContent) {
      if (svg.style.cssText==="") {
        svg.style.cssText="transform: rotate(180deg);";
        annotationContent.setAttribute('hidden','');
      } else {
        svg.style.cssText="";
        annotationContent.removeAttribute('hidden');
      }
    }
  }
}
function getScrollHighlightIntoView(nodes:{ node: Text, start?: number, end?: number }[]) {
  const func = function () {
    if (nodes.length) {
      const parentElement = nodes[0].node.parentElement;
      if (parentElement) parentElement.scrollIntoView();
    }
  }
  return func;
}

export function registerAnnotationNotEditable(editor:LexicalEditor) {
  const rootElement = editor._rootElement;
  var wrapper:HTMLElement|undefined = undefined;
  var see_button:HTMLButtonElement|undefined = undefined;
  if (rootElement) {
    const annotationWrapper = rootElement.closest<HTMLDivElement>('div[data-annotation]');
    if (annotationWrapper) {
      wrapper = annotationWrapper;
      if ((window as any).annotationObserver) (window as any).annotationObserver.observe(annotationWrapper);
      const goToAnnotation = annotationWrapper.querySelector<HTMLButtonElement>('button[data-goto-annotation]');
      if (goToAnnotation) {
        see_button = goToAnnotation;
      }
      const hideShowAnnotation = annotationWrapper.querySelector('button[data-hide-show-annotation]');
      if (hideShowAnnotation) hideShowAnnotation.addEventListener('click',handleHideShowAnnotation);
    }
  }
  

  editor.update(() => {
    const annotationNodes = $nodesOfType(AnnotationNode);
    for (let node of annotationNodes) {
      if (typeof node.getTextColor()==="string"&&typeof node.getBackgroundColor()==="string") {
        const reference_id = node.getReferenceId();
        // Should be the id of the div.lexical-wrapper article
        const id = 'id_'.concat(reference_id);
        const editorInstance = getEditorInstances()[id];
        if (editorInstance&&editorInstance._rootElement) {
          const referenceElement = document.getElementById(id);
          if (referenceElement) {        
            const text_color = node.getTextColor();
            const background_color = node.getBackgroundColor();
            if (see_button&&background_color) {
              see_button.classList.remove('transparent');
              see_button.classList.add('text','primary');
              const svg = see_button.querySelector('svg');
              if (svg) svg.style.setProperty('fill',background_color,'important');
            }
            const { range, nodes } = getRange({ start: node.getStart(), end: node.getEnd(), content: node.getContent() },referenceElement);

            if (see_button) see_button.addEventListener('click',getScrollHighlightIntoView(nodes));
            const userHighlight = new Highlight(range);
            userHighlight.type = "highlight";
            const highlight_id = "user-highlight-".concat(window.crypto.randomUUID()); 
            CSS.highlights.set(highlight_id,userHighlight);
            const wrapper_el = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
            if (wrapper_el) {
              const style_el = document.createElement('style');
              style_el.innerText = `::highlight(${highlight_id}) {
    background-color: ${background_color};
    color: ${text_color}!important;
  }`;
              wrapper_el.insertAdjacentElement("afterend",style_el);
            }          
          }
          break;
        }
        
      }
    }
  })
}
var CURRENT_SAVED_STORAGE:null|any;


function getOnSubmitFormReloadHistory(editor:LexicalEditor) {
  const func = function (e:SubmitEvent) {
    const dialog = document.getElementById('insert-previous-lexical') as HTMLDivElement|null;
    e.preventDefault();
    e.stopPropagation();
    if (CURRENT_SAVED_STORAGE&&dialog) {
      const parsedEditorState = editor.parseEditorState(CURRENT_SAVED_STORAGE);
      editor.setEditorState(parsedEditorState);
      closeDialog(dialog);
    }

  }
  return func;
}

function getOnOpenReloadHistory(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="insert-previous-lexical") {
      const editor = getCurrentEditor();
      const dialogOutput = document.getElementById('upload-prev-lexical-state-out');
      const dialog = document.getElementById('insert-previous-lexical') as HTMLDivElement|null;
      const dialogForm = document.querySelector<HTMLFormElement>('#insert-previous-lexical form');
      if (dialog&&dialogOutput&&dialogForm&&editor) {
        dialogOutput.innerHTML='';
        appendRichTextEditorToOutput(dialogOutput,'full');
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: dialogOutput }}));
        dialogForm.addEventListener('submit',getOnSubmitFormReloadHistory(editor));
        document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
      }
    }
}

export function onAfterReloadHistoryDialogOpen() {
  const dialogOutput = document.getElementById('upload-prev-lexical-state-out');
  if (dialogOutput) {
    console.log("onAfterReloadHistoryDialogOpen");
    const richTextEditor = dialogOutput.querySelector<HTMLDivElement>('div.lexical-wrapper');
    if (richTextEditor&&CURRENT_SAVED_STORAGE) {
      const output_editor_id = richTextEditor.id;
      const editor = getEditorInstances()[output_editor_id];
      if (editor) {
        const parsedEditorState = editor.parseEditorState(CURRENT_SAVED_STORAGE);
        editor.setEditorState(parsedEditorState);
      }
    }
  }
}

function onBeforeChange() {
  const editor = document.querySelector('div.lexical-wrapper div[data-rich-text-editor][data-type="full"][data-editable="true"]');
  if (editor) {
    const id = editor.id;
    const editorState = getEditorInstances()[id];
    if (editorState) {
      const stringified = JSON.stringify(editorState.toJSON());
      const path_to_use = "frankmbrown-" + window.location.pathname;
      const new_path = path_to_use + "-new";
      window.localStorage.setItem(new_path,stringified);
    }
  }
}

/**
 * The lexical wrapper needs to have the data-save-state attribute on it for this to be registered. This makes it easier to implement.
 * div.lexical-wrapper[data-save-state]
 * @param editor 
 * @returns 
 */
export function registerSaveAndReloadHistoryEditable(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenReloadHistory);
  document.addEventListener('ON_AFTER_RELOAD_HISTORY',onAfterReloadHistoryDialogOpen);
  const path_to_use = "frankmbrown-" + window.location.pathname;
  const old_path = path_to_use + "-old";
  const new_path = path_to_use + "-new";
  if (wrapper&&wrapper.hasAttribute('data-save-state')) {
    const button = wrapper.querySelector<HTMLButtonElement>('button[data-dialog="insert-previous-lexical"]');
    if (button) {
      const saved_state = window.localStorage.getItem(new_path);
      if (saved_state) {
        try {
          const newJsonState = JSON.parse(saved_state);
          CURRENT_SAVED_STORAGE = newJsonState;
          window.localStorage.setItem(old_path,saved_state);
          const current_editor_state = JSON.stringify(editor.getEditorState().toJSON());
          if (current_editor_state!==newJsonState) {
            const shownAlert = window.localStorage.getItem("frankmbrown-alert-save-state")==="true";
            if (!!!shownAlert) {
              document.dispatchEvent(new CustomEvent<OPEN_SNACKBAR_CED>("OPEN_SNACKBAR",{ detail: { selem: '#saved-article-v-available' } }));
              window.localStorage.setItem("frankmbrown-alert-save-state","true");
            }
            button.removeAttribute('hidden');
          } else {
            button.setAttribute('hidden','');
          }
        } catch (e) {
          button.setAttribute('hidden','');
          console.error(e);
        }
      } else {
        button.setAttribute('hidden','');
      }
      
    }
  }
  document.addEventListener('htmx:beforeRequest',onBeforeChange)
  window.addEventListener('beforeunload',onBeforeChange);
  return mergeRegister(() => {
    document.removeEventListener('htmx:beforeRequest',onBeforeChange)
    window.removeEventListener('beforeunload',onBeforeChange);
  })
}

