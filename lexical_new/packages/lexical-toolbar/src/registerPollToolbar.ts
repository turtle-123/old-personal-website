import { 
  $getSelection, 
  $isRangeSelection, 
  $isTextNode, 
  COMMAND_PRIORITY_EDITOR, 
  LexicalEditor, 
  SELECTION_CHANGE_COMMAND, 
  type TextFormatType,
  getElementOuterTag,
  FORMAT_TEXT_COMMAND,
  VALID_HEX_REGEX,
  $setSelection,
  UNDO_COMMAND,
  REDO_COMMAND,
  INSERT_TAB_COMMAND,
  KEY_TAB_COMMAND,
  $insertNodes,
  $createTabNode
} from "lexical";
import { mergeRegister } from "@lexical/utils";

import {
  getDefaultBackground,
  getDefaultTextColor,
  q,
  disableAndSelect,
  getCurrentEditor,
  MAKE_TRANSPARENT,
  BACKGROUND_COLOR_CHANGE,
  TEXT_COLOR_CHANGE,
  CLEAR_TEXT_FORMATTING,
  getEditorInstances
} from '@lexical/shared';
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText
} from '@lexical/selection';
type TextFormatObject = {
  'bold': undefined|boolean,
  'italic': undefined|boolean,
  'strikethrough': undefined|boolean,
  'underline': undefined|boolean,
  'superscript': undefined|boolean,
  'subscript': undefined|boolean,
  'code': undefined|boolean
}


function getPollQuestionMenuInputs(wrapper:HTMLElement) {
  return {
    boldButton: q(wrapper,'FORMAT_TEXT_COMMAND','bold'),
    italicButton:q(wrapper,'FORMAT_TEXT_COMMAND','italic'),
    strikethroughButton: q(wrapper,'FORMAT_TEXT_COMMAND','strikethrough'),
    underlineButton: q(wrapper,'FORMAT_TEXT_COMMAND','underline'),
    superscriptButton: q(wrapper,'FORMAT_TEXT_COMMAND','superscript'),
    subscriptButton: q(wrapper,'FORMAT_TEXT_COMMAND','subscript'),
    codeButton: q(wrapper,'FORMAT_TEXT_COMMAND','code'),
    clearFormattingButton: q(wrapper,'CLEAR_TEXT_FORMATTING',undefined),
    backgroundColorButton: wrapper.querySelector<HTMLButtonElement>('button[data-lexical-bg-color-button]'),
    backgroundColorInput: wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-color]'), 
    backgroundColorTransparent: wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-transparent]'),
    textColorButton: wrapper.querySelector<HTMLButtonElement>('button[data-lexical-text-color]'),
    textColorInput: wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-color]'), 
    textColorTransparent: wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-transparent]'),
    blockStyleButton:  wrapper.querySelector<HTMLButtonElement>('button[data-lexical-block-style-button]'),
    undoButton: q(wrapper,'UNDO_COMMAND',undefined),
    redoButton: q(wrapper,'REDO_COMMAND',undefined)
  }; 
}

function $updatePollQuestionToolbar(el:HTMLElement) {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    const nodes = selection.getNodes();
    const textFormat:TextFormatObject = {
      'bold': undefined,
      'italic': undefined,
      'strikethrough': undefined,
      'underline': undefined,
      'superscript': undefined,
      'subscript': undefined,
      'code': undefined
    };
    for (let node of nodes) {
      if ($isTextNode(node)){
        Object.keys(textFormat).forEach((key)=>{
          const hasFormat = node.hasFormat(key as TextFormatType);
          /* @ts-ignore */
          textFormat[key] = Boolean((textFormat[key]===true||textFormat[key]===undefined) &&hasFormat);
        })
        if (node.hasFormat('superscript')&&node.hasFormat('subscript')) {
          const tag = getElementOuterTag(node,node.getFormat());
          if (tag==='sup') {
            node.toggleFormat('subscript');
            textFormat['subscript']=false;
          } else if (tag==='sub') {
            node.toggleFormat('superscript');
            textFormat['superscript']=false;
          }
        }
      }
    }
    const defaultBackgroundColor = getDefaultBackground();
    const defaultTextColor = getDefaultTextColor();
    const backgroundColorTemp = $getSelectionStyleValueForProperty(selection,'background-color','undefined');
    const backgroundColor = Boolean(backgroundColorTemp==="undefined")?defaultBackgroundColor:backgroundColorTemp;
    const textColorTemp = $getSelectionStyleValueForProperty(selection,'color','undefined');
    const textColor = Boolean(textColorTemp==="undefined") ? defaultTextColor : textColorTemp;

    const {
      boldButton,
      italicButton,
      strikethroughButton,
      underlineButton,
      superscriptButton,
      subscriptButton,
      codeButton,
      clearFormattingButton,
      backgroundColorButton,
      backgroundColorInput,
      backgroundColorTransparent,
      textColorButton,
      textColorInput,
      textColorTransparent,
      blockStyleButton
    } = getPollQuestionMenuInputs(el);

    const hasNoFormatting = Boolean(Object.values(textFormat).filter((b) => Boolean(b===true)).length===0);
    if(boldButton)disableAndSelect(boldButton,false,Boolean(textFormat.bold===true));
    if(italicButton)disableAndSelect(italicButton,false,Boolean(textFormat.italic===true));
    if(strikethroughButton)disableAndSelect(strikethroughButton,false,Boolean(textFormat.strikethrough===true));
    if(underlineButton)disableAndSelect(underlineButton,false,Boolean(textFormat.underline===true));
    if(superscriptButton)disableAndSelect(superscriptButton,false,Boolean(textFormat.superscript===true));
    if(subscriptButton)disableAndSelect(subscriptButton,false,Boolean(textFormat.subscript===true));
    if(codeButton)disableAndSelect(codeButton,false,Boolean(textFormat.code===true));
    if(clearFormattingButton)disableAndSelect(clearFormattingButton,hasNoFormatting,false);
    if(backgroundColorButton)disableAndSelect(backgroundColorButton,false,false);
    if(backgroundColorInput&&VALID_HEX_REGEX.test(backgroundColor)) backgroundColorInput.value = backgroundColor;
    else if (backgroundColorInput) backgroundColorInput.value = getDefaultBackground();

    if(backgroundColorTransparent){
      if (backgroundColorTemp==='undefined') backgroundColorTransparent.checked = true;
      else backgroundColorTransparent.checked = false;
    }
    if(textColorButton)disableAndSelect(textColorButton,false,false);
    if(textColorInput&&VALID_HEX_REGEX.test(textColor)) textColorInput.value = textColor;
    else if (textColorInput) textColorInput.value = getDefaultTextColor();
    if(textColorTransparent){
      if (textColorTemp==='undefined') textColorTransparent.checked = true;
      else textColorTransparent.checked = false;
    }
    if(blockStyleButton)disableAndSelect(blockStyleButton,false,false);
  }
}
function dispatchOnClick(this:HTMLButtonElement,e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div.lexical-wrapper');
  const dispatchStr = this.getAttribute('data-dispatch');
    const payload = this.getAttribute('data-payload');
  if(wrapper&&dispatchStr) {
    const id = wrapper.id;
    if (id) {
      const editorInstances = getEditorInstances();
      const editor = editorInstances[id];
      const dispatch = {
        'FORMAT_TEXT_COMMAND': FORMAT_TEXT_COMMAND,
        'MAKE_TRANSPARENT':MAKE_TRANSPARENT,
        'BACKGROUND_COLOR_CHANGE':BACKGROUND_COLOR_CHANGE,
        'TEXT_COLOR_CHANGE':TEXT_COLOR_CHANGE,
        'UNDO_COMMAND': UNDO_COMMAND,
        'REDO_COMMAND': REDO_COMMAND,
        'CLEAR_TEXT_FORMATTING': CLEAR_TEXT_FORMATTING
      }[dispatchStr];
      if(payload&&dispatch) editor.dispatchCommand(dispatch,payload);
      else if (dispatch) editor.dispatchCommand(dispatch,undefined);
    }
  }
}

var DEBOUNCE_COLOR_CHANGE: NodeJS.Timeout|undefined = undefined;
const COLOR_CHANGE_TIMEOUT_MS = 500;

function onTextColorChange(this:HTMLInputElement) {
  const editor = getCurrentEditor();
  const value = this.value;
  const parent = this.parentElement;
  if (parent) {
    const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
    if (checkbox) checkbox.checked = false;
  }
  if(editor &&VALID_HEX_REGEX.test(value)){
    if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
    const toDoFunc = function () {
      editor.dispatchCommand(TEXT_COLOR_CHANGE,value);
    };
    DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS);
  }
}

function onBackgroundColorChange(this:HTMLInputElement) {
  const editor = getCurrentEditor();
  const value = this.value;
  const parent = this.parentElement;
  if (parent) {
    const checkbox = parent.nextElementSibling ? parent.nextElementSibling.querySelector<HTMLInputElement>('input[type="checkbox"]') : null;
    if (checkbox) checkbox.checked = false;
  }
  if(editor &&VALID_HEX_REGEX.test(value)){
    if (DEBOUNCE_COLOR_CHANGE) clearTimeout(DEBOUNCE_COLOR_CHANGE);
    const toDoFunc = function () {
      editor.dispatchCommand(BACKGROUND_COLOR_CHANGE,value);
    };
    DEBOUNCE_COLOR_CHANGE = setTimeout(toDoFunc,COLOR_CHANGE_TIMEOUT_MS);
  }
}

function handleTextTransparentChange(this:HTMLInputElement){
  const editor = getCurrentEditor();
  if (editor){
    const rootElement = editor.getRootElement();
    if(rootElement){
      const wrapper = rootElement.closest('div.lexical-wrapper');
      if(wrapper){
        if (this.checked) {
          this.setAttribute('checked','');
          editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color: null});
        } else {
          this.removeAttribute('checked');
          const colorInput = wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-color]');
          if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'text', color: colorInput.value});
        }
      }
    }
  }
}

function handleBackgroundColorTransparentChange(this:HTMLInputElement){
  const editor = getCurrentEditor();
  if(editor){
    const rootElement = editor.getRootElement();
    if(rootElement){
      const wrapper = rootElement.closest('div.lexical-wrapper');
      if(wrapper){
        if (this.checked) {
          this.setAttribute('checked','');
          editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color: null});
        } else {
          this.removeAttribute('checked');
          const colorInput = wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-color]');
          if (colorInput) editor.dispatchCommand(MAKE_TRANSPARENT,{type: 'background', color: colorInput.value});
        }
      }
    }
  }
}

function setToolbarListeners(el:HTMLElement,editor:LexicalEditor) {
  const {
    boldButton,
    italicButton,
    strikethroughButton,
    underlineButton,
    superscriptButton,
    subscriptButton,
    codeButton,
    clearFormattingButton,
    // backgroundColorButton,
    backgroundColorInput,
    backgroundColorTransparent,
    // textColorButton,
    textColorInput,
    textColorTransparent,
    undoButton,
    redoButton
  } = getPollQuestionMenuInputs(el);
  if(boldButton)boldButton.addEventListener('click',dispatchOnClick);

  if(italicButton)italicButton.addEventListener('click',dispatchOnClick);
  if(strikethroughButton)strikethroughButton.addEventListener('click',dispatchOnClick);
  if(underlineButton)underlineButton.addEventListener('click',dispatchOnClick);
  if(superscriptButton)superscriptButton.addEventListener('click',dispatchOnClick);
  if(subscriptButton)subscriptButton.addEventListener('click',dispatchOnClick);
  if(codeButton)codeButton.addEventListener('click',dispatchOnClick);
  if(clearFormattingButton)clearFormattingButton.addEventListener('click',dispatchOnClick);
  if(backgroundColorTransparent)backgroundColorTransparent.addEventListener('change',handleBackgroundColorTransparentChange);
  if(textColorTransparent)textColorTransparent.addEventListener('change',handleTextTransparentChange);
  if (textColorInput) textColorInput.addEventListener('input',onTextColorChange);
  if (backgroundColorInput) backgroundColorInput.addEventListener('input',onBackgroundColorChange);
  if(undoButton) undoButton.addEventListener('click',dispatchOnClick);
  if(redoButton)redoButton.addEventListener('click',dispatchOnClick);
}

export function registerPollQuestionToolbar(editor:LexicalEditor) {
  const rootElement = editor.getRootElement();
  if (rootElement) {
    const wrapper = rootElement.closest<HTMLDivElement>('div.lexical-wrapper');
    if (wrapper) setToolbarListeners(wrapper,editor);
  }
  return mergeRegister(
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          const wrapper = rootElement.closest<HTMLDivElement>('div.lexical-wrapper');
          if (wrapper) {
            $updatePollQuestionToolbar(wrapper);
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      TEXT_COLOR_CHANGE,
      (textColor: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)){
          const obj = {"color": textColor, 'font-weight': '400'};
          if (textColor!=='inherit') obj['font-weight'] = '500';
          $patchStyleText(selection,obj);
          $setSelection(selection);
          editor.dispatchCommand(SELECTION_CHANGE_COMMAND,undefined);
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
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection,{ "background-color": backgroundColor });
          $setSelection(selection);
          editor.dispatchCommand(SELECTION_CHANGE_COMMAND,undefined);
          editor.focus();
          return true;
        }
        return false;
      },  
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      CLEAR_TEXT_FORMATTING,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          for (let node of nodes) {
            if ($isTextNode(node)) {
              node.setFormat(0);
              node.setStyle('');
            }
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      MAKE_TRANSPARENT,
      (payload) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (payload.type==="background") {
            $patchStyleText(selection,{'background-color': payload.color});
            $setSelection(selection);
            editor.focus();
            return true;
          } else if (payload.type==="text"){
            $patchStyleText(selection,{'color': payload.color});
            $setSelection(selection);
            editor.focus();
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      INSERT_TAB_COMMAND,
      () => {
        $insertNodes([$createTabNode()]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      KEY_TAB_COMMAND,
      () => {
        $insertNodes([$createTabNode()]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    )
  )
}