
import { isTouchDevice } from "../shared";

import {
  validateSurveyAudioCreateSurvey,
  getSurveyAudioCreateSurveyHTML,
  renderAudioSurveyQuestion,
  getCreateAudioSurveyQuestionInput,
  type GetSurveyAudioQuestionState
} from './survey-audio';

import {
  validateSurveyCheckboxCreateSurvey,
  getSurveyCheckboxCreateSurveyHTML,
  renderCheckboxSurveyQuestion,
  getCreateCheckboxSurveyQuestionInput,
  addSurveyCheckboxOption,
  type GetSurveyCheckboxQuestionState,
} from './survey-checkbox';

import {
  validateSurveyColorCreateSurvey,
  getSurveyColorCreateSurveyHTML,
  renderColorSurveyQuestion,
  getCreateColorSurveyQuestionInput,
  type GetSurveyColorQuestionState,
} from './survey-color';

import {
  validateSurveyDateCreateSurvey,
  getSurveyDateCreateSurveyHTML,
  renderDateSurveyQuestion,
  getCreateDateSurveyQuestionInput,
  type GetSurveyDateQuestionState,
} from './survey-date';

import {
  validateSurveyDatetimeCreateSurvey,
  getSurveyDatetimeCreateSurveyHTML,
  renderDatetimeSurveyQuestion,
  getCreateDatetimeSurveyQuestionInput,
  type GetSurveyDatetimeQuestionState,
} from './survey-datetime';

import {
  validateSurveyImageCreateSurvey,
  getSurveyImageCreateSurveyHTML,
  renderImageSurveyQuestion,
  getCreateImageSurveyQuestionInput,
  type GetSurveyImageQuestionState,
} from './survey-image';

import {
  validateSurveyMonthCreateSurvey,
  getSurveyMonthCreateSurveyHTML,
  renderMonthSurveyQuestion,
  getCreateMonthSurveyQuestionInput,
  type GetSurveyMonthQuestionState,
} from './survey-month';

import {
  validateSurveyMultipleChoiceCreateSurvey,
  getSurveyMultipleChoiceCreateSurveyHTML,
  renderMultipleChoiceSurveyQuestion,
  getCreateMultipleChoiceSurveyQuestionInput,
  addSurveyMultipleChoiceOption,
  type GetSurveyMultipleChoiceQuestionState,
} from './survey-multiple-choice';

import {
  validateSurveyParagraphCreateSurvey,
  getSurveyParagraphCreateSurveyHTML,
  renderParagraphSurveyQuestion,
  getCreateParagraphSurveyQuestionInput,
  type GetSurveyParagraphQuestionState,
} from './survey-paragraph';

import {
  validateSurveyRangeCreateSurvey,
  getSurveyRangeCreateSurveyHTML,
  renderRangeSurveyQuestion,
  getCreateRangeSurveyQuestionInput,
  type GetSurveyRangeQuestionState,
} from './survey-range';

import {
  validateSurveyShortBlogCreateSurvey,
  getSurveyShortBlogCreateSurveyHTML,
  renderShortBlogSurveyQuestion,
  getCreateShortBlogSurveyQuestionInput,
  type GetSurveyShortBlogQuestionState,
} from './survey-short-blog';

import {
  validateSurveyTimeCreateSurvey,
  getSurveyTimeCreateSurveyHTML,
  renderTimeSurveyQuestion,
  getCreateTimeSurveyQuestionInput,
  type GetSurveyTimeQuestionState,
} from './survey-time';

import {
  validateSurveyVideoCreateSurvey,
  getSurveyVideoCreateSurveyHTML,
  renderVideoSurveyQuestion,
  getCreateVideoSurveyQuestionInput,
  type GetSurveyVideoQuestionState,
} from './survey-video';

import {
  validateSurveyShortAnswerCreateSurvey,
  getSurveyShortAnswerCreateSurveyHTML,
  renderShortAnswerSurveyQuestion,
  getCreateShortAnswerSurveyQuestionInput,
  type GetSurveyShortAnswerQuestionState,
} from './survey-short-answer';

import {
  validateSurveySelectionCreateSurvey,
  getSurveySelectionCreateSurveyHTML,
  renderSelectionSurveyQuestion,
  getCreateSelectionSurveyQuestionInput,
  addSurveySelectionOption,
  GetSurveySelectionQuestionState
} from './survey-selection';

import {
  validateSurveyNumberCreateSurvey,
  getSurveyNumberCreateSurveyHTML,
  renderNumberSurveyQuestion,
  getCreateNumberSurveyQuestionInput,  
  GetSurveyNumberQuestionState
} from './survey-number';


export type GetQuestionAny = GetSurveyAudioQuestionState|GetSurveyCheckboxQuestionState|GetSurveyColorQuestionState|GetSurveyDateQuestionState|GetSurveyDatetimeQuestionState|GetSurveyImageQuestionState|GetSurveyMonthQuestionState|GetSurveyMultipleChoiceQuestionState|GetSurveyParagraphQuestionState|GetSurveyRangeQuestionState|GetSurveyShortAnswerQuestionState|GetSurveyShortBlogQuestionState|GetSurveyTimeQuestionState|GetSurveyVideoQuestionState|GetSurveyRankingQuestionState|GetSurveySelectionQuestionState|GetSurveyNumberQuestionState;

import { closeDialog } from "../shared";

import { clearEditor, getCommentImplementation } from "../lexical-implementation";
import { getEditorInstances } from "../lexical-implementation";
import { addRankingOption, getCreateRankingSurveyQuestionInput, getSurveyRankingCreateSurveyHTML, GetSurveyRankingQuestionState, renderRankingSurveyQuestion, validateSurveyRankingCreateSurvey } from "./survey-ranking";
import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from "..";

/*----------------- Making These Types for reference -----------------*/
export type SurveyParagraphOptionType = {
  type: 'survey-paragraph',
  defaultChecked: boolean,
  option: string
}
export type AudioOptionType = {
  type: 'audio',
  defaultChecked: boolean,
  src: string,
  title: string
}
export type VideoOptionType = {
  type: 'video',
  defaultChecked: boolean,
  src: string,
  title: string,
  description: string,
  height: number
}
export type ImageOptionType = {
  type: 'image',
  defaultChecked: boolean,
  src: string,
  shortDescription: string,
  longDescription: string
}


export const POLL_ACTIONS_OBJECT = {
  'survey-short-answer':{
    validateCreate: validateSurveyShortAnswerCreateSurvey,
    create: getSurveyShortAnswerCreateSurveyHTML,
    render: renderShortAnswerSurveyQuestion,
    getCreateInput: getCreateShortAnswerSurveyQuestionInput,
  } as const,
  'survey-paragraph':{
    validateCreate:validateSurveyParagraphCreateSurvey,
    create: getSurveyParagraphCreateSurveyHTML,
    render: renderParagraphSurveyQuestion,
    getCreateInput: getCreateParagraphSurveyQuestionInput,
  } as const,
  'survey-short-blog':{
    validateCreate: validateSurveyShortBlogCreateSurvey, 
    create: getSurveyShortBlogCreateSurveyHTML,
    render: renderShortBlogSurveyQuestion,
    getCreateInput: getCreateShortBlogSurveyQuestionInput,
  } as const,
  'survey-multiple-choice':{
    validateCreate: validateSurveyMultipleChoiceCreateSurvey,
    create: getSurveyMultipleChoiceCreateSurveyHTML,
    render: renderMultipleChoiceSurveyQuestion,
    getCreateInput: getCreateMultipleChoiceSurveyQuestionInput,
    addOption: addSurveyMultipleChoiceOption,
  } as const,
  'survey-checkbox':{
    validateCreate: validateSurveyCheckboxCreateSurvey,
    create: getSurveyCheckboxCreateSurveyHTML,
    render: renderCheckboxSurveyQuestion,
    getCreateInput: getCreateCheckboxSurveyQuestionInput,
    addOption: addSurveyCheckboxOption,
  } as const,
  'survey-range':{
    validateCreate: validateSurveyRangeCreateSurvey,
    create: getSurveyRangeCreateSurveyHTML,
    render: renderRangeSurveyQuestion,
    getCreateInput: getCreateRangeSurveyQuestionInput,
  } as const,
  'survey-date':{
    validateCreate: validateSurveyDateCreateSurvey,
    create: getSurveyDateCreateSurveyHTML,
    render: renderDateSurveyQuestion,
    getCreateInput: getCreateDateSurveyQuestionInput,
  } as const,
  'survey-datetime':{
    validateCreate: validateSurveyDatetimeCreateSurvey,
    create: getSurveyDatetimeCreateSurveyHTML,
    render: renderDatetimeSurveyQuestion,
    getCreateInput: getCreateDatetimeSurveyQuestionInput,
  } as const,
  'survey-time':{
    validateCreate: validateSurveyTimeCreateSurvey,
    create: getSurveyTimeCreateSurveyHTML,
    render: renderTimeSurveyQuestion,
    getCreateInput: getCreateTimeSurveyQuestionInput,
  } as const,
  'survey-image':{
    validateCreate: validateSurveyImageCreateSurvey,
    create: getSurveyImageCreateSurveyHTML,
    render: renderImageSurveyQuestion,
    getCreateInput: getCreateImageSurveyQuestionInput,
  } as const,
  'survey-audio':{
    validateCreate: validateSurveyAudioCreateSurvey,
    create: getSurveyAudioCreateSurveyHTML,
    render: renderAudioSurveyQuestion,
    getCreateInput: getCreateAudioSurveyQuestionInput,
  } as const,
  'survey-video':{
    validateCreate: validateSurveyVideoCreateSurvey,
    create: getSurveyVideoCreateSurveyHTML,
    render: renderVideoSurveyQuestion,
    getCreateInput: getCreateVideoSurveyQuestionInput,
  } as const,
  'survey-month':{
    validateCreate: validateSurveyMonthCreateSurvey,
    create: getSurveyMonthCreateSurveyHTML,
    render: renderMonthSurveyQuestion,
    getCreateInput: getCreateMonthSurveyQuestionInput,
  } as const,
  'survey-color':{
    validateCreate: validateSurveyColorCreateSurvey,
    create: getSurveyColorCreateSurveyHTML,
    render: renderColorSurveyQuestion,
    getCreateInput: getCreateColorSurveyQuestionInput,
  } as const,
  'survey-ranking': {
    validateCreate: validateSurveyRankingCreateSurvey,
    create: getSurveyRankingCreateSurveyHTML,
    render: renderRankingSurveyQuestion,
    getCreateInput: getCreateRankingSurveyQuestionInput,
    addOption: addRankingOption,
  },
  "survey-selection": {
    validateCreate: validateSurveySelectionCreateSurvey,
    create: getSurveySelectionCreateSurveyHTML,
    render: renderSelectionSurveyQuestion,
    getCreateInput: getCreateSelectionSurveyQuestionInput,
    addOption: addSurveySelectionOption,
  } as const,
  "survey-number": {
    validateCreate:validateSurveyNumberCreateSurvey,    
    create:getSurveyNumberCreateSurveyHTML,
    render:renderNumberSurveyQuestion,
    getCreateInput:getCreateNumberSurveyQuestionInput,
  },
  // "survey-week": {
  //   validateCreate: validateSurveyWeekCreateSurvey,
  //   
  //   create: getSurveyWeekCreateSurveyHTML,
  //   render: renderWeekSurveyQuestion,
  //   getCreateInput: getCreateWeekSurveyQuestionInput,
  //   getSubmitInput: () => {}
  // } as const
};


export const isValidSurveyType = (key: string):key is keyof typeof POLL_ACTIONS_OBJECT => key in POLL_ACTIONS_OBJECT;

export function createElement({ type, className, style, attributes, innerText, innerHTML }: {type: keyof HTMLElementTagNameMap, className?: string, style?: string,innerText?: string, innerHTML?: string, attributes?: {[a: string]: string, }}) {
  const el = document.createElement(type);
  if(className)el.className = className;
  if(style)el.style.cssText = style;
  if(attributes) {
    const atts = Object.keys(attributes);
    for (let key of atts) {
      el.setAttribute(key,attributes[key as any]);
    }
  }
  if (innerText) {
    el.innerText=innerText;
  }
  if(innerHTML) {
    el.insertAdjacentHTML("afterbegin",innerHTML);
  }
  return el;
}
/**
 * You should dispatch a newContentLoaded event on the html element so that 
 * @returns  The nodes that should be appended to the grow-1 middle node of a survey option
 */
export function getAudioInputHTML(disabled:boolean=false,defaultValues?:{ src:string, title:string }){
  const audioID = 'audio_'.concat(window.crypto.randomUUID());
  const label = document.createElement('label');
  label.setAttribute('for',audioID);
  label.className="bold";
  label.innerText = "Upload Audio File";
  const input = document.createElement('input');
  input.setAttribute('type','file');
  input.setAttribute('accept','audio/*');
  input.setAttribute('data-audio-input','');
  input.setAttribute('name',audioID);
  input.setAttribute('id',audioID);
  if (disabled) {
    label.classList.add('disabled');
    input.setAttribute('disabled','');
  }
  if (defaultValues) {
    const { src, title } = defaultValues;
    input.setAttribute('data-default-value',JSON.stringify([{ src, title }]))
  }
  input.className = "warning";
  const output = document.createElement('output');
  output.setAttribute('for',audioID);
  output.className = "block";
  return [label,input,output] as const;
}
/**
 * 
 * @returns  The nodes that should be appended to the grow-1 middle node of a survey option
 */
export function getImageInputHTML(disabled:boolean=false,defaultValues?:{src:string, shortDescription:string,longDescription:String}){
  const imageID = 'image_'.concat(window.crypto.randomUUID());
  const label = document.createElement('label');
  label.setAttribute('for',imageID);
  label.className="bold";
  label.innerText = "Upload Image File";

  const input = document.createElement('input');
  input.setAttribute('type','file');
  input.setAttribute('accept','image/*');
  input.setAttribute('data-image-input','');
  input.setAttribute('name',imageID);
  input.setAttribute('id',imageID);
  if (disabled) {
    label.classList.add('disabled');
    input.setAttribute('disabled','');
  }
  if (defaultValues) {
    const { src, shortDescription, longDescription } = defaultValues;
    input.setAttribute('data-default-value',JSON.stringify([{ src, shortDescription, longDescription }]))
  }
  input.className = "error";
  const output = document.createElement('output');
  output.setAttribute('for',imageID);
  output.className = "block";
  return [label,input,output] as const;
}
/**
 * 
 * @returns The nodes that should be appended to the grow-1 middle node of a survey option
 */
export function getVideoInputHTML(disabled:boolean=false,defaultValues?:{src: string,title: string,description: string,height: number}) {
  const videoID = 'video_'.concat(window.crypto.randomUUID());
  const label = document.createElement('label');
  label.setAttribute('for',videoID);
  label.className="bold";
  label.innerText = "Upload Video File";
  const input = document.createElement('input');
  input.setAttribute('type','file');
  input.setAttribute('accept','video/*');
  input.setAttribute('data-video-input','');
  input.setAttribute('name',videoID);
  input.setAttribute('id',videoID);
  if (disabled) {
    label.classList.add('disabled');
    input.setAttribute('disabled','');
  }
  if (defaultValues) {
    const { src, title, description, height } = defaultValues;
    input.setAttribute('data-default-value',JSON.stringify([{ src, title, description, height }]))
  }
  input.className = "info";
  const output = document.createElement('output');
  output.setAttribute('for',videoID);
  output.className = "block";
  return [label,input,output] as const;
}

export function getCheckboxHTML(checked: boolean=false) {
  const id = 'checkbox_' + window.crypto.randomUUID();
  const label = document.createElement('label');
  label.setAttribute('aria-label','Example Survey Question');
  label.classList.add('radio','grow-0','large');
  const input = document.createElement('input');
  input.setAttribute('aria-label','Example Survey Question');
  input.setAttribute('type','checkbox');
  input.setAttribute('name',id);
  input.setAttribute('id',id);
  input.classList.add('secondary');
  const span = document.createElement('span');
  span.setAttribute('hidden','');
  span.innerText = id;
  label.append(input,span);
  if (checked) input.checked = true;
  return label;
}

export function getDeleteOptionButton() {
  const b = document.createElement('button');
  b.setAttribute('data-delete-option','');
  b.setAttribute('type','button');
  b.classList.add('icon','medium');
  b.setAttribute('aria-label','Delete Option');
  b.setAttribute('disabled','');
  b.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Clear"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>');
  return b;
}

export function getChangeOptionTypeButton() {
  const b = document.createElement('button');
  b.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="MoreVert"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>');
  b.setAttribute('data-option-type','');
  b.setAttribute('data-popover','');
  b.setAttribute('data-pelem','#change-survey-option-type-menu');
  b.setAttribute('data-force-close','');
  b.setAttribute('data-click','');
  b.setAttribute('type','button');
  b.setAttribute('aria-label','Option Type');
  b.setAttribute('aria-haspopup','dialog');
  b.classList.add('icon','medium');
  return b;
}

export function getThemeMode() {
  const html = document.querySelector('html');
  if (html) {
    const mode = html.getAttribute('data-mode');
    if (mode==="light"||mode==="dark") return mode as "light"|"dark";
    else return "dark";
  } else return 'dark';
}

export function getDefaultTextColor() {
  const mode = getThemeMode();
  var id: string;
  if(mode==="light"){
    id = 'background-light-settings-color';
  }else {
    id = 'background-dark-settings-color';
  }
  const input = document.getElementById(id) as HTMLInputElement|null;
  if(input) return input.value;
  else return '#FFFFFF';
} 
export function getDefaultBackgroundColor() {
  const mode = getThemeMode();
  var id: string;
  if(mode==="light"){
    id = 'textColor-light-settings-color';
  }else {
    id = 'textColor-dark-settings-color';
  }
  const input = document.getElementById(id) as HTMLInputElement|null;
  if(input) return input.value;
  else return '#000000';
}
var radio_obj:{[index:string]:boolean} = {};
function handleRadioMouseDown(this:HTMLInputElement) {
  const name = this.name;
  radio_obj[name] = this.checked;
}
function handleClickRadio(this:HTMLInputElement) {
  if (radio_obj[this.name]!==undefined) {
    if (radio_obj[this.name]===true) {
      this.checked = false;
    } else {
      this.checked = true;
    }
  }
  radio_obj = {};
}

/**
 * **s** should be the id of the current question
 */
export function getRadioHTML(s: string,checked:boolean=false){
  const id = 'radio_' + window.crypto.randomUUID();
  const label = document.createElement('label');
  label.setAttribute('aria-label','Example Survey Question');
  label.classList.add('radio','grow-0','large');
  const input = document.createElement('input');
  input.setAttribute('aria-label','Example Survey Question');
  input.setAttribute('type','radio');
  input.setAttribute('name','radio_'.concat(s));
  input.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleRadioMouseDown);
  input.addEventListener('click',handleClickRadio);
  input.classList.add('secondary');
  const span = document.createElement('span');
  span.setAttribute('hidden','');
  span.innerText = id;
  label.append(input,span);
  if (checked) {
    input.checked = true;
  }
  return label;
}


const toolbarButtons = [
  {
      "data-dispatch": "UNDO_COMMAND",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-undo-last-change",
      "aria-describedby": "lex-undo-last-change",
      "class": "toggle-button",
      "aria-label": "Undo",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="UndoSharp"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"></path></svg>'
  } as const,
  {
      "data-dispatch": "REDO_COMMAND",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-redo-last-change",
      "aria-describedby": "lex-redo-last-change",
      "class": "toggle-button",
      "aria-label": "Redo",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="RedoSharp"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "bold",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-bold",
      "aria-describedby": "lex-bold",
      "class": "toggle-button",
      "aria-label": "Bold",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatBoldSharp"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "italic",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-italic",
      "aria-describedby": "lex-italic",
      "class": "toggle-button",
      "aria-label": "Italic",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatItalicSharp"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "strikethrough",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-strikethrough",
      "aria-describedby": "lex-strikethrough",
      "class": "toggle-button",
      "aria-label": "Strikethrough",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="StrikethroughSSharp"><path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43s.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13s-.53.21-.72.36c-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51s.35.36.43.57c.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75s-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58s.37.85.65 1.21c.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28s1.21-.45 1.67-.79c.46-.34.82-.77 1.07-1.27s.38-1.07.38-1.71c0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21V12z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "underline",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-underline",
      "aria-describedby": "lex-underline",
      "class": "toggle-button",
      "aria-label": "Underline",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatUnderlinedSharp"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "superscript",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-superscript",
      "aria-describedby": "lex-superscript",
      "class": "toggle-button",
      "aria-label": "Superscript",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp"><path d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "subscript",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-subscript",
      "aria-describedby": "lex-subscript",
      "class": "toggle-button",
      "aria-label": "Subscript",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp"><path d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"></path></svg>'
  } as const,
  {
      "data-dispatch": "FORMAT_TEXT_COMMAND",
      "data-payload": "code",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-inline-code",
      "aria-describedby": "lex-inline-code",
      "class": "toggle-button",
      "aria-label": "Inline Code",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Code"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>'
  } as const,
  {
      "data-dispatch": "CLEAR_TEXT_FORMATTING",
      "type": "button",
      "data-popover": "",
      "data-mouse": "",
      "data-pelem": "#lex-clear-text-formatting",
      "aria-describedby": "lex-clear-text-formatting",
      "class": "toggle-button",
      "aria-label": "Clear Text Formatting",
      "disabled": "",
      "innerHTML": '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatClear"><path d="M3.27 5 2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"></path></svg>'
  } as const
] as const;

const QUESTION_INITIAL_HTML = '<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important; border-radius: 0px 0px 0px 0px; border-color: transparent transparent transparent transparent; border-width: 0px 0px 0px 0px; border-style: none none none none;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; white-space: pre-wrap;" data-v="1">Enter your survey question here...</span></p>';
const OPTION_INITIAL_HTML = '<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important; border-radius: 0px 0px 0px 0px; border-color: transparent transparent transparent transparent; border-width: 0px 0px 0px 0px; border-style: none none none none;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; white-space: pre-wrap;" data-v="1">Enter an option for the survey question here...</span></p>';
const RANGE_INITIAL_HTML = '<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important; border-radius: 0px 0px 0px 0px; border-color: transparent transparent transparent transparent; border-width: 0px 0px 0px 0px; border-style: none none none none;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; white-space: pre-wrap;" data-v="1">Enter a description for  a point in the range here...</span></p>';
const BLOG_INITIAL_HTML = '<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important; border-radius: 0px 0px 0px 0px; border-color: transparent transparent transparent transparent; border-width: 0px 0px 0px 0px; border-style: none none none none;" data-v="1" dir="ltr" data-e-indent="0"><span style="font-size: 1rem; line-height: 1.5; letter-spacing: 0.00938em; white-space: pre-wrap;" data-v="1">Enter a short blog response here...</span></p>';
const RTE_TYPE_TO_INITIAL_HTML = {
  'survey-question': QUESTION_INITIAL_HTML,
  'survey-option': OPTION_INITIAL_HTML,
  'range-description':RANGE_INITIAL_HTML,
  'survey-short-blog': BLOG_INITIAL_HTML
};
const RTE_TYPE_TO_WRAPPER_STYLE = {
  'survey-question':  'block lexical-wrapper mt-2',
  'survey-option':  'block lexical-wrapper',
  'range-description': 'block lexical-wrapper mt-1',
  'survey-short-blog':  'block lexical-wrapper mt-1'
};
const RTE_TYPE_TO_RTE_STYLE = {
  'survey-question': 'min-height: 100px; overflow-y:auto; resize: vertical!important; max-height:400px;',
  'survey-option': 'min-height: 70px; overflow-y:auto; resize: vertical!important; max-height:400px;',
  'range-description':'max-height: 250px; min-height: 70px; overflow-y:auto; resize: vertical!important; max-height:400px;',
  'survey-short-blog': 'max-height: 250px; min-height: 100px; overflow-y:auto; resize: vertical!important; max-height:400px;'
};
/**
 * Get The survey rich text editor html for options or questions
 */
export function getSurveyRteHTML({rteType}:{ rteType: 'survey-question'|'survey-option'|'range-description'|'survey-short-blog'},shortBlogDisabled=true,questionLexicalState?:string) {
  const wrapperID = 'wrapper_' + window.crypto.randomUUID();
  const lexicalWrapper = document.createElement('div');
  lexicalWrapper.classList.add('lexical-wrapper','survey-q-wrap','mt-2');
  lexicalWrapper.style.setProperty("overflow",'hidden');
  if (rteType!=="survey-short-blog") {
    lexicalWrapper.setAttribute('data-display-only','');
  }
  const initialHTML:string = RTE_TYPE_TO_INITIAL_HTML[rteType];
  const wrapperStyle =  RTE_TYPE_TO_WRAPPER_STYLE[rteType];
  var rteStyle = RTE_TYPE_TO_RTE_STYLE[rteType];

  const html = getCommentImplementation(wrapperID,Boolean(rteType==="survey-short-blog"&&shortBlogDisabled),initialHTML,{ type: rteType, wrapperStyle: wrapperStyle, rteStyle: rteStyle, lexicalState: questionLexicalState ? questionLexicalState : undefined })

  return html;
}


export function getIncreaseNumberInput(disabled:boolean=false) {
  const button = createElement({type: 'button', attributes: {type:'button', 'aria-label':'Increase Input', 'data-increase': ''}, className:'icon large'});
  button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg>')
  if(disabled) button.setAttribute('disabled','');
  return button;
}

export function getDecreaseNumberInput(disabled:boolean=false) {
  const button = createElement({type: 'button', attributes: {type:'button', 'aria-label':'Decrease Input', 'data-decrease': ''}, className:'icon large'});
  button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
  if(disabled) button.setAttribute('disabled','');
  return button;
}

export function getNumberInput({id,  min, max, defaultValue, label, placeholder, disabled=false, required=false, step }:{id: string, placeholder?:string, min?:number, max?:number, label: string, defaultValue?: string, disabled?: boolean, required?:boolean, step?:number}) {
  var useState = typeof step==="number" ? step : 1;
  const wrapperDiv = createElement({type:'div',className:"input-group block mt-1"});
  const labelEl = createElement({type:'label',attributes:{for:id},innerText: label});
  if (disabled) labelEl.classList.add('disabled');
  const innerDiv = createElement({type:'div', className:"mt-1 number-input medium"});
  const input = createElement({ type:'input', attributes: {type:'number',name:id,id:id,autocomplete: "off", spellcheck: "false", autocapitalize: "off"}})
  input.setAttribute("step",String(useState));
  if (required) input.setAttribute('required','');
  if (disabled) input.setAttribute('disabled','');
  if (typeof min==="number") input.setAttribute('min',String(min));
  if (typeof max ==="number") input.setAttribute('max',String(max));
  if (defaultValue) input.setAttribute('value',defaultValue);
  if (placeholder) input.setAttribute('placeholder',placeholder);
  innerDiv.append(input,getIncreaseNumberInput(),getDecreaseNumberInput());
  wrapperDiv.append(labelEl,innerDiv);
  return wrapperDiv;
}

export function getHandleStepChange(stepInput:HTMLInputElement,minInput:HTMLInputElement,maxInput:HTMLInputElement) {
  const func = function () {
    if (!!!isNaN(parseFloat(stepInput.step))) {
      minInput.step = stepInput.value;
      maxInput.step = stepInput.value;
    }
  }
  return func;
}
export function getHandleMinChange(minInput:HTMLInputElement,maxInput:HTMLInputElement) {
  const func = function () {
    const minValue = minInput.value;
    if (minValue) {
      maxInput.min = minValue;
    }
  }
  return func;
}
export function getHandleMaxChange(minInput:HTMLInputElement,maxInput:HTMLInputElement) {
  const func = function () {
    const maxValue = maxInput.value;
    if (maxValue) {
      minInput.max = maxValue;
    }
  }
  return func;
}

/**
 * Call this function to call the `onSurveyLoad()` function
 * @returns 
 */
export const updateSurvey = () => document.body.dispatchEvent(new CustomEvent('POLL_UPDATE'));


var CURRENT_QUESTION:string|undefined = undefined;
var CURRENT_OPTION:string|undefined = undefined;
export function getQuestionTypeDialog(){return document.getElementById('survey-question-type-dialog') as HTMLDivElement|null;}
export function getTypeMenu(){return document.getElementById('change-survey-option-type-menu') as HTMLDivElement|null;}

/* ----------------------------------------- Helper Functions ------------------------------------------------ */
export function getCurrentSurveyQuestionID() {
  return CURRENT_QUESTION;
}
export function setCurrentSurveyQuestionID(s:string|undefined) {
  CURRENT_QUESTION = s;
}
export function setCurrentSurveyOptionID(s:string|undefined) {
  CURRENT_OPTION = s;
}
export function getCurrentSurveyOptionID() {
  return CURRENT_OPTION;
}
export function getCurrentSurveyQuestion() {
  if (CURRENT_QUESTION) return document.getElementById(CURRENT_QUESTION);
  else return null;
}
export function getCurrentSurveyOption() {
  if (CURRENT_OPTION) return document.getElementById(CURRENT_OPTION);
  else return null;
}
/**
 * Function to call to get the `closest` survey question
 * @param el 
 * @returns 
 */
export function getClosestSurveyQuestion(el:HTMLElement) {
  const question = el.closest<HTMLElement>('section.survey-question');
  return question;
}
/**
 * Function to call to get the `closest` survey option
 * @param el 
 * @returns 
 */
export function getClosestSurveyOption(el:HTMLElement) {
  const option = el.closest<HTMLDivElement>('div[data-option]');
  return option;
}
/**
 * Function to call to set the current survey question. Called whenever the focusin event is called for a question
 */
export function setCurrentSurveyQuestion(this:HTMLElement) {
  const id = this.id;
  if (CURRENT_QUESTION!==id) {
    if (id) CURRENT_QUESTION = id;
    const typeEl = this.querySelector('button[data-question-type]');
    if(typeEl){
      const type = typeEl.getAttribute('data-val');
      if(type){
        const dialog = getQuestionTypeDialog();
        if(dialog){
          const radios = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[name="survey-question-type"]'))
          radios.forEach((radio) => {
            radio.checked = Boolean(String(radio.getAttribute('value'))===type)
          });
          const output = dialog.querySelector<HTMLOutputElement>('output[form="question-type-form"]');
          if (output) {
            output.innerHTML='';
            output.insertAdjacentHTML('afterbegin',questionTypeToOutputHTML(type));
          }
        }
      }
    }
  }
} 

/**
 * Function to call to set the current survey option called whenever the focusin event is called for an option
 */
export function setCurrentSurveyOption(this:HTMLElement) {
  const id = this.id;
  if (id) CURRENT_OPTION = id;
}


/**
 * Function to call after the survey question type form is submitted
 * @param questionElement 
 * @param newType 
 */
function handleQuestionTypeChange(questionElement:HTMLElement,previousType:string,newType:string) {
  questionElement.classList.remove('invalid-q');
  if (isValidSurveyType(newType) && isValidSurveyType(previousType)){
    const editSurveyQuestion = questionElement.querySelector<HTMLDivElement>('div[data-edit-survey-question]');
    if(editSurveyQuestion) {
      const typeHasLexicalEditors = new Set(['survey-short-answer','survey-paragraph','survey-short-blog','survey-multiple-choice','survey-checkbox','survey-range'] as const);
      if(typeHasLexicalEditors.has(previousType as any)) {
        const lexicalWrappers = Array.from(editSurveyQuestion.querySelectorAll('div.lexical-wrapper'));
        lexicalWrappers.forEach((wrapper) =>{
          const id = wrapper.id;
          if (id) clearEditor(id);
        })
      }
      editSurveyQuestion.innerHTML='';
      const newQuestionOption = POLL_ACTIONS_OBJECT[newType].create(questionElement);
      if (Array.isArray(newQuestionOption)) editSurveyQuestion.append(...newQuestionOption);
      else editSurveyQuestion.append(newQuestionOption);
      if (POLL_ACTIONS_OBJECT[newType].hasOwnProperty('addOption')) {
        const addOptionDiv = createElement({ type: 'div', className: 'flex-row align-center justify-center p-md'});
        const addOptionButton = createElement({type:'button', attributes:{type:'button', 'data-add-option': ''}, className: 'medium icon-text text info'});
        addOptionButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>');
        addOptionButton.append(document.createTextNode("Add Option"));
        addOptionButton.addEventListener('click',(POLL_ACTIONS_OBJECT[newType] as any).addOption as any);
        addOptionDiv.append(addOptionButton);
        editSurveyQuestion.append(addOptionDiv);
      }
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail:{el:questionElement}}));
    }
  }
}



/*---------------------------------------- Handle Question Type form changes ---------------------------------------- */
export function questionTypeToOutputHTML(type: string) {
  if (isValidSurveyType(type)) {
    if (type==='survey-short-answer'){
      return `<p class="mt-2 bold">Short Answer:</p>
      <p class="mt-1">
        Allow survey respondents to respond to the survey question with a short answer (between 1 and 100 characters).
      </p>`;
    } else if (type==='survey-paragraph'){
      return `<p class="mt-2 bold">Paragraph:</p>
      <p class="mt-1">
        Allow survey respondents to respond to the survey question with a longer answer (between 1 and 500 characters).
      </p>`;
    } else if (type==='survey-short-blog'){
      return `<p class="mt-2 bold">Blog:</p>
      <p class="mt-1">
        Allow survey respondents to respond to the survey question with a short blog. Survey respondents will be able to respond the survey question by with a short blog post.
      </p>`;
    } else if (type==='survey-multiple-choice'){
      return `<p class="mt-2 bold">Multiple Choice:</p>
      <p class="mt-1">
        For the survey question, add multiple options from which the survey respondent can select one option as their answer to the question.
      </p>`;
    } else if (type==='survey-checkbox'){
      return `<p class="mt-2 bold">Checkbox:</p>
      <p class="mt-1">
        For the survey question, add multiple options from which the survey respondent can select multiple options as their answer to the question.
      </p>`;
    } else if (type==='survey-range'){
      return `<p class="mt-2 bold">Range:</p>
      <p class="mt-1">
        For the survey question, add a range slider 
      </p>`;
    } else if (type==='survey-date'){
      return `<p class="mt-2 bold">Date:</p>
      <p class="mt-1">
        Allow the survey respondent to input a date as their answer to a question. You may constrain the date by adding a maximum and minimum value for the date.
      </p>`;
    } else if (type==='survey-datetime'){
      return `<p class="mt-2 bold">Datetime:</p>
      <p class="mt-1">
        Allow the survey respondent to input a date with a time as their answer to a question. You may constrain the datetime by adding a maximum and minimum value for the datetime.
      </p>`;
    } else if (type==='survey-time'){
      return `<p class="mt-2 bold">Time:</p>
      <p class="mt-1">
        Allow the survey respondent to input a time as their answer to a question. You may constrain the datetime by adding a maximum and minimum value for the time.
      </p>`;
    } else if (type==='survey-image'){
      return `<p class="mt-2 bold">Image:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question with an image.
      </p>`;
    } else if (type==='survey-audio'){
      return `<p class="mt-2 bold">Audio:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question with an audio recording.
      </p>`;
    } else if (type==='survey-video'){
      return `<p class="mt-2 bold">Video:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question with a video.
      </p>`;
    } else if (type==='survey-month'){
      return `<p class="mt-2 bold">Month:</p>
      <p class="mt-1">
        Allow the survey respondent to respond to the survey question with a month input.
      </p>`;
    } else if (type==='survey-color'){
      return `<p class="mt-2 bold">Color:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question with a color.
      </p>`;
    } else if (type==="survey-ranking") {
      return `<p class="mt-2 bold">Ranking:</p>
      <p class="mt-1">
        Allow the respondent to answer survey question by ranking various options shown to them.
      </p>`;
    } else if (type==="survey-selection") {
      return `<p class="mt-2 bold">Selection:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question by selecting an option from a dropdown menu.
      </p>`;
    } else if (type==="survey-number") {
      return `<p class="mt-2 bold">Number:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question by selecting an option from a dropdown menu.
      </p>`;
    } else if (type==="survey-week") {
      return `<p class="mt-2 bold">Week:</p>
      <p class="mt-1">
        Allow the respondent to answer the survey question by selecting an option from a dropdown menu.
      </p>`;
    } else {
      return ``;
    }
  } else return '';
};
export function handleQuestionTypeButtonClick(this:HTMLButtonElement,e:Event){
  const question = getClosestSurveyQuestion(this);
  const dialog = getQuestionTypeDialog();
  if(question&&dialog) {
    setCurrentSurveyQuestion.bind(question)();
  }
}
export function handleQuestionTypeFormChange(this:HTMLFormElement){
  const output = this.nextElementSibling;
  const valueEl = this.querySelector<HTMLInputElement>('input[name="survey-question-type"]:checked');
  if(output&&output.nodeName==="OUTPUT"&&valueEl){
    output.innerHTML='';
    output.insertAdjacentHTML('afterbegin',questionTypeToOutputHTML(valueEl.value));
  }
}
export function handleQuestionTypeFormSubmit(this:HTMLFormElement,e:SubmitEvent){
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
  const valueEl = this.querySelector<HTMLInputElement>('input[name="survey-question-type"]:checked');
  if(dialog&&valueEl &&valueEl.parentElement) {
    const stringEl = valueEl.parentElement.querySelector<HTMLSpanElement>('span.fw-regular.body-1');
    const value = valueEl.value;
    if (isValidSurveyType(value)&&stringEl){
      const string = stringEl.innerText;
      const question = document.getElementById(String(CURRENT_QUESTION));
      if(question) {
        const typeButton =  question.querySelector<HTMLButtonElement>('button[data-question-type]');
        if(typeButton){
          const buttonSpan = typeButton.querySelector<HTMLSpanElement>('span');
          if (buttonSpan) buttonSpan.innerText = string;
          const previousVal = structuredClone(typeButton.getAttribute('data-val'));
          typeButton.setAttribute('data-val',value);
          if(previousVal!==value) handleQuestionTypeChange(question,String(previousVal),value);
          closeDialog(dialog);
        }
      }
    } 
  }
}

function addQuestionBelow(this:HTMLButtonElement) {
  const question = getClosestSurveyQuestion(this);
  if(question) {
    const typeButton = question.querySelector<HTMLButtonElement>('button[data-question-type]');
    if(typeButton){
      const type = String(typeButton.getAttribute('data-val'));
      if(isValidSurveyType(type)) {
        question.insertAdjacentElement("afterend",getSurveyQuestionHTML(type));
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:question.parentElement||undefined}}));
      }
    }
  }
}
function duplicateQuestionBelow(this:HTMLButtonElement) {
  const question = getClosestSurveyQuestion(this);
  if(question) {
    const typeButton = question.querySelector<HTMLButtonElement>('button[data-question-type]');
    if(typeButton){
      const type = String(typeButton.getAttribute('data-val'));
      if(isValidSurveyType(type)) {
        const questionState = POLL_ACTIONS_OBJECT[type].getCreateInput(question);
        if (questionState) {
          question.insertAdjacentElement("afterend",getSurveyQuestionHTML(type,questionState));
          document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:question.parentElement||undefined}}));
        } else {
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong getting the question state." }}));
        }
      }
    }
  }
}

/**
 * Change the type of an option
 * @param this 
 * @param e 
 */
export function onOptionTypeButtonClick(this:HTMLButtonElement,e:Event){
  const  question = getClosestSurveyQuestion(this);
  const menu = getTypeMenu();
  const option = getClosestSurveyOption(this);
  if(question&&option&&menu){
    const questionId = question.id;
    if (questionId) setCurrentSurveyQuestionID(questionId);
    const optionId = option.id;
    if (optionId) setCurrentSurveyOptionID(optionId);
    const type = option.getAttribute('data-type');
    if (OPTION_TYPES.has(String(type) as any)) {
      Array.from(menu.querySelectorAll('button')).forEach((button)=>{
        if (String(button.getAttribute('data-val'))===type) button.setAttribute('aria-selected','true');
        else button.setAttribute('aria-selected','false');
      })
    }
  }
}

const surveyQuestionTypeToString = {
  'survey-short-answer': 'Short Answer',
  'survey-paragraph': 'Paragraph',
  'survey-short-blog': 'Short Blog',
  'survey-multiple-choice': 'Multiple Choice',
  'survey-checkbox': 'Checkbox',
  'survey-range': 'Range',
  'survey-date': 'Date',
  'survey-datetime': 'Datetime',
  'survey-time': 'Time',
  'survey-image': 'Image',
  'survey-audio': 'Audio',
  'survey-video': 'Video',
  'survey-month': 'Month',
  'survey-color': 'Color',
  'survey-ranking': 'Ranking',
  'survey-selection': 'Selection',
  'survey-number': 'Number',
  'survey-week': 'Week'
} as const;
export function getSurveyQuestionHTML(type: keyof typeof POLL_ACTIONS_OBJECT,questionState?:GetQuestionAny) {
  /* ------------------------ Survey Question Header -------------------------------- */
  const sectionID = 'question_'.concat(window.crypto.randomUUID());
  const section = createElement({ type:'section', className: "survey-question mt-3", attributes: {"data-drag-container": "survey-questions-container", "data-drag-el": "", "id": sectionID} });
  const firstDiv = createElement({type: 'div', className: "flex-row justify-between align-center"});
  const dragContainer = createElement({type: 'div', className: "drag-container", attributes: {"data-drag": "#".concat(sectionID), "tabindex": "0"}});
  dragContainer.insertAdjacentHTML("afterbegin",' <svg class="custom-survey t-normal drag" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"></path></svg>');
  firstDiv.append(dragContainer);
  const hideShowButtonWrapper = createElement({type:'div', className: 'flex-row justify-center grow-1' });
  const hideShowButton = createElement({type:'button',attributes: {type:'button',"data-hide-question":"","aria-label":"Collapse / Show the Survey Question" }, className:"icon-text text warning medium"});
  hideShowButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp" style=""><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>');
  hideShowButton.append(createElement({type:'span', innerText: 'COLLAPSE'}));
  hideShowButtonWrapper.append(hideShowButton);
  const buttonTypeLabel = createElement({ type: 'span', className: 'body1 bold', style: 'margin-right: 0.5rem; margin-left: auto;', innerText: 'Type:'});
  const changeQuestionTypeButton = createElement({
    type: 'button',
    "className": "select small",
    "style": "min-width: 175px;",
    "attributes": {
        "data-question-type": "",
        "data-click":"",
        "type": "button",
        "aria-haspopup": "dialog",
        "data-val": type,
        "data-dialog": "survey-question-type-dialog"
    }
  });
  if (!!!isTouchDevice()) changeQuestionTypeButton.addEventListener('mousedown',onOptionTypeButtonClick);
  else changeQuestionTypeButton.addEventListener('touchstart',onOptionTypeButtonClick);
  const changeQuestionTypeButtonSpan = createElement({type:'span', className: 'body1', innerText: String(surveyQuestionTypeToString[type as keyof typeof surveyQuestionTypeToString]) });
  changeQuestionTypeButton.append(changeQuestionTypeButtonSpan);
  changeQuestionTypeButton.insertAdjacentHTML('beforeend','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>');
  firstDiv.append(dragContainer,hideShowButtonWrapper,buttonTypeLabel,changeQuestionTypeButton);
  section.append(firstDiv);
  section.insertAdjacentElement("beforeend",getSurveyRteHTML({ rteType: 'survey-question'},undefined,questionState?.question));
  /* --------------- Edit Survey Question Section ---------------------- */
  const editSurveyQuestion = createElement({ type: 'div', attributes: {'data-edit-survey-question': ''}, className: 'edit-survey' });
  if(isValidSurveyType(type)) {
    if (questionState&&questionState.type===type) {
      const questionInsides = POLL_ACTIONS_OBJECT[type].create(section,questionState as any);
      if (Array.isArray(questionInsides)) editSurveyQuestion.append(...questionInsides);
      else editSurveyQuestion.append(questionInsides);
    } else {
      const questionInsides = POLL_ACTIONS_OBJECT[type].create(section);
      if (Array.isArray(questionInsides)) editSurveyQuestion.append(...questionInsides);
      else editSurveyQuestion.append(questionInsides);
    }

    if (POLL_ACTIONS_OBJECT[type].hasOwnProperty('addOption')) {
      const addOptionDiv = createElement({ type: 'div', className: 'flex-row align-center justify-center p-md'});
      const addOptionButton = createElement({type:'button', attributes:{type:'button', 'data-add-option': ''}, className: 'medium icon-text text info'});
      addOptionButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>');
      addOptionButton.append(document.createTextNode("Add Option"));
      addOptionButton.addEventListener('click',(POLL_ACTIONS_OBJECT[type] as any).addOption as any);
      addOptionDiv.append(addOptionButton);
      editSurveyQuestion.append(addOptionDiv);
    }
  }
  section.append(editSurveyQuestion);
  /*---------------------- Survey Footer --------------------------- */
  const surveyFooter = createElement({ type: 'div', className: 'survey-question-footer hz-scroll'});
  const surveyFooterToolbar = createElement({ type: 'div', attributes: {role: 'toolbar' }, style: 'margin-right: 6px; padding-right: 6px; border-right: 2px solid var(--text-primary);' });
  
  const cloneSVG = `<svg viewBox="0 0 512 512" title="clone" focusable="false" inert tabindex="-1"><path d="M64 464H288c8.8 0 16-7.2 16-16V384h48v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h64v48H64c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16zM224 304H448c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H224c-8.8 0-16 7.2-16 16V288c0 8.8 7.2 16 16 16zm-64-16V64c0-35.3 28.7-64 64-64H448c35.3 0 64 28.7 64 64V288c0 35.3-28.7 64-64 64H224c-35.3 0-64-28.7-64-64z"></path></svg>`;
  const duplicateQuestionAttr: {[ind:string]:string} = {
    "type": "button",
    "aria-label": "Duplicate Survey Question",
    "aria-describedby": "duplicate-survey-tooltip",
    "data-duplicate-question": ""
  };
  if (!!!isTouchDevice()){
    Object.assign(duplicateQuestionAttr,{    
      "data-popover": "",
      "data-pelem": "#duplicate-survey-tooltip",
      "data-mouse": ""
    });
  }
  const duplicateQuestion = createElement({
    "type": "button",
    "className": "icon medium text warning",
    "attributes": duplicateQuestionAttr
  });
  duplicateQuestion.insertAdjacentHTML("afterbegin",cloneSVG);
  duplicateQuestion.addEventListener('click',duplicateQuestionBelow);

  const addQuestionsAttribute: {[ind:string]:string} = {
    "type": "button",
    "aria-label": "Add Survey Question",
    "aria-describedby": "add-survey-tooltip",
    "data-add-question": ""
  };
  if (!!!isTouchDevice()){
    Object.assign(addQuestionsAttribute,{    
      "data-popover": "",
      "data-pelem": "#add-survey-tooltip",
      "data-mouse": ""
  })
  }
  const addQuestion = createElement({
    "type": "button",
    "className": "icon medium text success",
    "attributes": addQuestionsAttribute
  });
  addQuestion.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>');
  addQuestion.addEventListener('click',addQuestionBelow);
  var attribute_del_q:any = {
    "data-delete-survey": "",
    "type": "button",
    "aria-label": "Delete Question",
    "disabled": ""
  };
  if (!!!isTouchDevice()) {
    attribute_del_q = {
      ...attribute_del_q,
      "aria-described-by": "delete-question-tool",
      "data-popover": "",
      "data-pelem": "#delete-question-tool",
      "data-mouse": ""
    }
  }
  const deleteQuestion = createElement({
    'type': 'button',
    "className": "icon medium text error",
    "attributes": attribute_del_q
  });
  deleteQuestion.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'); 
  const checkbox = createElement({ type: 'label', className: 'checkbox', style: 'margin: 0px 6px;'});
  const REQUIRED_CHECKBOX_ID = "survey-required-checkbox_".concat(window.crypto.randomUUID());
  const span = document.createElement('span');
  span.innerText="Required";
  span.style.cssText = "font-size:1.25rem!important;"
  const requiredQuestionCheckboxInput = createElement({
    type: 'input',
    "className": "primary medium flex-row align-center",
    "attributes": {
        "type": "checkbox",
        "name":REQUIRED_CHECKBOX_ID,
        "id":REQUIRED_CHECKBOX_ID
    }
  });
  if (questionState?.required) {
    (requiredQuestionCheckboxInput as HTMLInputElement).checked = true;
  }
  checkbox.append(requiredQuestionCheckboxInput,span);
  surveyFooterToolbar.append(duplicateQuestion,addQuestion,deleteQuestion);
  surveyFooter.append(surveyFooterToolbar,checkbox);
  section.append(surveyFooter);
  return section;
} 


export const OPTION_TYPES = new Set([
  'survey-paragraph', 
  'image',
  'audio',
  'video'
] as const);

export function getQuestionLexicalStateFromWrapper(questionEl:HTMLElement):string|null {
  const questionRTE = questionEl.querySelector<HTMLElement>('div[data-rich-text-editor][data-type="survey-question"]');
  if(questionRTE){
    const lexicalWrapper = questionRTE.closest<HTMLDivElement>('div.lexical-wrapper');
    if(lexicalWrapper) {
      const id = lexicalWrapper.id;
      if (id) {
        const editorInstance = getEditorInstances()[id];
        if (editorInstance) return JSON.stringify(editorInstance.getEditorState().toJSON());
      }
    }
  }
  return null;
}


export function isValidDateString(s:string) {
  try {
    if (!!!s.length) return false;
    const d = new Date(s);
    return Boolean(d);
  } catch (error) {
    console.error(error);
    return false;
  }
}
export function isValidTimeString(s:string) {
  try {    
    if (!!!/\d\d:\d\d(:\d\d?)/.test(s)) return false;
    const arr = s.split(':').map((n) => parseInt(n));
    if (arr[0]>=24||arr[0]<0||arr[1]<0||arr[1]>=60) return false;
    if (arr?.[2]&&(arr[2]<0||arr[2]<=60)) return false;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
  
}
export function isValidWeekString(s:string) {
  try {
    return /^\d{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$/.test(s);
  } catch (error) {
    console.error(error);
    return false;
  }
}


export function renderImageOptionType({src,shortDescription,longDescription}:{src:string,shortDescription:string,longDescription:string}) {
  const image = document.createElement("img");
  image.setAttribute('src',src);
  image.style.cssText = "max-height: 200px;width: auto;height: auto;max-width:100%;margin: 0px 0px!important;";
  image.setAttribute('alt',shortDescription);
  image.setAttribute('data-text',longDescription);
  return image;
}


function hideShowQuestion(this:HTMLElement) {
  const question = this.closest<HTMLElement>('section');
  const svg = this.querySelector('svg');
  const span = this.querySelector('span');
  if(question&&svg&&span) {
    const questionContent = question.querySelector<HTMLDivElement>('div[data-question-content]');
    if(questionContent) {
      if (questionContent.hasAttribute('hidden')) {
        questionContent.removeAttribute('hidden');
        this.classList.add('warning');
        this.classList.remove('success');
        svg.style.cssText="transform: rotate(180deg);";
        span.innerText = 'HIDE';
      } else {
        questionContent.setAttribute('hidden','');
        this.classList.add('success');
        this.classList.remove('warning');
        svg.style.cssText="";
        span.innerText = 'SHOW';
      }
    }
  }
}

export function createQuestion(input: GetQuestionAny,i:number) {
  const section = createElement({type:'section', className:'rendered-question' });
  const questionHeadingWrapper = createElement({type:'div', className: 'flex-row justify-between align-center gap-1 bb', style: 'padding-bottom: 8px; margin-bottom:10px;'});
  const h2 = createElement({type:'h2',className:'h5 bold', innerText: 'Question #'.concat(String(i))});
  if (input.required) {
    const requiredSpan = createElement({type: 'span', className: 't-warning ml-auto', innerText: '*'});
    h2.append(requiredSpan);
  }
  questionHeadingWrapper.append(h2);
  const hideShowButton = createElement({type:'button',attributes:{type:'button'}, className:'icon-text warning medium outlined'});
  hideShowButton.insertAdjacentHTML('afterbegin',' <svg style="transform: rotate(180deg);" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowDown"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
  hideShowButton.append(createElement({type:'span',innerText:'HIDE'}));
  hideShowButton.addEventListener('click',hideShowQuestion);
  questionHeadingWrapper.append(hideShowButton);
  section.append(questionHeadingWrapper);
  const div = createElement({type:'div', className:'block', attributes:{"data-question-content":""}});
  section.append(div);
  return section;
}