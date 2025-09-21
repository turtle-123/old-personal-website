import {  
  createElement, 
  getSurveyRteHTML,
  getQuestionLexicalStateFromWrapper,
  
  getChangeOptionTypeButton,
  getDeleteOptionButton,
  OPTION_TYPES,
  getAudioInputHTML,
  getVideoInputHTML,
  getImageInputHTML,
  renderImageOptionType
} from "./sharedSurvey";
import { getEditorInstances, getRegisterSurveyOption, getRegisterSurveyQuestion } from "../lexical-implementation";
import { NEW_CONTENT_LOADED_CED } from "..";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getAudioHTML, getVideoHTML } from "../media-upload";
import { isTouchDevice } from "../shared";
const VERSION = 1;
export type SurveyParagraphRankingOptionType = {
  type: 'survey-paragraph',
  original_order: number,
  option: string
}
export type AudioRankingOptionType = {
  type: 'audio',
  original_order: number,
  src: string,
  title: string
}
export type VideoRankingOptionType = {
  type: 'video',
  original_order: number,
  src: string,
  title: string,
  description: string,
  height: number
}
export type ImageRankingOptionType = {
  type: 'image',
  original_order: number,
  src: string,
  shortDescription: string,
  longDescription: string
}
export type GetSurveyRankingQuestionState = {
  type: 'survey-ranking',
  question: string, 
  required: boolean,
  options: (SurveyParagraphRankingOptionType|AudioRankingOptionType|VideoRankingOptionType|ImageRankingOptionType)[],
  VERSION: number
};
export type RespondSurveyRankingState = {
  type: 'survey-ranking',
  response: string[]
};

/* --------------------------- Helper functions ---------------------------------- */
const getDragHTML = (id:string) => {
  const dragContainer = createElement({type: 'div', className: "drag-container grow-0", attributes: {"data-drag": "#".concat(id), "tabindex": "0"}});
  dragContainer.insertAdjacentHTML("afterbegin",' <svg class="custom-survey t-normal drag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"></path></svg>');
  return dragContainer;
}
function addRankingOption(this:HTMLButtonElement) {
  const question = this.closest<HTMLElement>('section.survey-question');
   if (question) {
     const dragContainer = question.querySelector<HTMLDivElement>('div[id^="ranking_container_"]');
     const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
     if (options&&options.length<100&&dragContainer) {
       const drag_container_id = dragContainer.id;
       const optionType = options[options.length-1].getAttribute('data-type');
       if(OPTION_TYPES.has(optionType as any)) {
         const wrapper_id = 'ranking_option_'.concat(window.crypto.randomUUID());
         const wrapperDiv = createElement({ type:'div', className: 'flex-row align-center justify-start p-md w-100 gap-1', attributes: {  id: wrapper_id,  'data-option': '', 'data-drag-el':'', 'data-drag-container': drag_container_id } });
         const dragContainer = getDragHTML(wrapper_id);
         const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
         if(optionType==='survey-paragraph'){
           const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'});
           grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
           wrapperDiv.setAttribute('data-type','survey-paragraph');
         }else if (optionType==='audio'){
           grow1.append(...getAudioInputHTML());
           wrapperDiv.setAttribute('data-type','audio');
           grow1.style.cssText = "min-width: 0px;padding-left: 10px;";
         }else if (optionType==='video'){
           grow1.append(...getVideoInputHTML());
           wrapperDiv.setAttribute('data-type','video');
           grow1.style.cssText = "min-width: 0px;padding-left: 10px;";
         }else if (optionType==='image') {
           grow1.append(...getImageInputHTML());
           wrapperDiv.setAttribute('data-type','image');
           grow1.style.cssText = "min-width: 0px;padding-left: 10px;";
         }
         wrapperDiv.append(dragContainer,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
         options[options.length-1].insertAdjacentElement("afterend",wrapperDiv);
         document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED', { detail: { el: wrapperDiv } }));
       }
     } else if (options.length>=100){
       document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: 'The maximum number of options allowed is 100.' }}))
     }
   }
}


/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyRankingCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyRankingQuestionState) {
  if (!!!questionState) {
    const uuid = window.crypto.randomUUID();
    const div = createElement({type:'div', attributes: { 'data-ranking-container': '', 'data-drag-container': '', id: 'ranking_container_'.concat(uuid) }});
    
    const id = 'ranking_option_'.concat(window.crypto.randomUUID());
    const option = createElement({type: 'div', className: 'flex-row align-center justify-start p-md w-100 gap-1', attributes: { id, style: 'min-width: 0px;', 'data-option': '', 'data-type': 'survey-paragraph', 'data-drag-el': '', 'data-drag-container': 'ranking_container_'.concat(uuid)  } })
    const dragContainer = getDragHTML(id);
    option.append(dragContainer);
    const grow1 = createElement({ type:'div', attributes: {'data-option-middle':'' }, className: "grow-1", style: "min-width: 0px;" });
    const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'});
    grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
    option.append(grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
    div.append(option);
    return div;
  } else {
    const uuid = window.crypto.randomUUID();
    const div = createElement({type:'div', attributes: { 'data-ranking-container': '', 'data-drag-container': '', id: 'ranking_container_'.concat(uuid) }});
    for (let option of questionState.options) {
      const id = 'ranking_option_'.concat(window.crypto.randomUUID());
      const optionEl = createElement({type: 'div', className: 'flex-row align-center justify-start p-md w-100 gap-1', attributes: { id, style: 'min-width: 0px;', 'data-option': '', 'data-type': 'survey-paragraph', 'data-drag-el': '', 'data-drag-container': 'ranking_container_'.concat(uuid) } })
      const dragContainer = getDragHTML(id);
      optionEl.append(dragContainer);
      const grow1 = createElement({ type:'div', attributes: {'data-option-middle':'' }, className: "grow-1", style: "min-width: 0px;" });
      switch (option.type) {
        case 'audio': {
          grow1.append(...getAudioInputHTML(undefined,{ src: option.src, title: option.title }));
          break;
        }
        case 'video': {
          grow1.append(...getVideoInputHTML(undefined,{ src: option.src, title: option.title, description: option.description, height: option.height }));
          break;
        }
        case 'image': {
          grow1.append(...getImageInputHTML(undefined,{ src: option.src, shortDescription: option.shortDescription, longDescription: option.longDescription }));
          break;
        }
        case 'survey-paragraph': {
          const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'},undefined,option.option);
          grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
          break;
        }
        default: {
          throw new Error("Something went wrong creating the checkbox HTML.");
        }
      }
      optionEl.append(grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
      div.append(optionEl);
    }
    return div;
  }
}

/* Validate Created Survey Question */ 
function validateSurveyRankingCreateSurvey(question:HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  if (questionLexicalState===null) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question. Unable to find question state." }}))
    return false;
  }
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  if (!!!requiredCheckbox) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find whether this question is required." }}))
    return false;
  }
  const options_els = Array.from(question.querySelectorAll('div[data-option][data-type="survey-paragraph"], div[data-option][data-type="survey-paragraph"],div[data-option][data-type="survey-paragraph"]'));
  if (options_els.length<1) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find any options for the ranking question." }}))
    return false;
  }
  for (let i=0; i<options_els.length;i++) {
    const option = options_els[i];
    const type =  option.getAttribute("data-type");
    if (OPTION_TYPES.has(type as any)) {
      if (type==="survey-paragraph") {
        const lexicalWrapper = option.querySelector<HTMLDivElement>('div.lexical-wrapper');
        if(lexicalWrapper) {
          const id = lexicalWrapper.id;
          if (!!!id) return false;
          const editorInstance = getEditorInstances()[id];
          if (!!!editorInstance) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find one of the paragraph options for the ranking question." }}));
            return false;
          }
        } else {
          return false;
        }
      } else if (type==="audio") {
        const audioEl = option.querySelector<HTMLAudioElement>('audio');
        const audioTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-title"]');
        if(!!!audioEl||!!!audioEl.getAttribute('data-src')||!!!audioTitle||!!!audioTitle.value) {
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find one of the audio options for the ranking question." }}));
          return false;
        }
      } else if (type==="image") {
        const imageInputEl = option.querySelector('input[data-image-input]') as HTMLInputElement;
        const id = imageInputEl.id;
        const imageEl = option.querySelector<HTMLInputElement>(`input[name="${id}-text"]`); 
        const imageShortDescription = option.querySelector<HTMLInputElement>(`input[name="${id}-short-description"]`); 
        const imageLongDescription = option.querySelector<HTMLTextAreaElement>(`textarea[name="${id}-long-description"]`); 
        if(!!!imageEl||!!!imageEl.value||!!!imageShortDescription||!!!imageLongDescription) {
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find one of the image options for the ranking question." }}));
          return false;
        }
      } else if (type==="video") {
        const videoEl = option.querySelector<HTMLVideoElement>('video');
        const videoTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-title"]');
        const videoDescription = option.querySelector<HTMLTextAreaElement>('textarea[name^="video-input-description"]');
        if(!!!videoEl||!!!videoEl.getAttribute('data-src')||!!!videoTitle||!!!videoTitle.value.length||!!!videoDescription) {
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find one of the video options for the ranking question." }}));
          return false;
        }
      }
    } else return false;
  } 
  return true;
}
/* Get the created survey question Input */
function getCreateRankingSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const options_els = Array.from(question.querySelectorAll('div[data-option][data-type="survey-paragraph"], div[data-option][data-type="survey-paragraph"],div[data-option][data-type="survey-paragraph"]'));
  if (questionLexicalState&&requiredCheckbox&&options_els.length>=1) {
    const ret:GetSurveyRankingQuestionState = {
        type: 'survey-ranking',
        question: questionLexicalState, // stringified JSON string
        required: Boolean(requiredCheckbox.checked===true),
        options: [],
        VERSION
    };
    for (let i=0; i<options_els.length;i++) {
      const option = options_els[i];
      const type =  option.getAttribute("data-type");
      if (OPTION_TYPES.has(type as any)) {
        if (type==="survey-paragraph") {
          const lexicalWrapper = option.querySelector<HTMLDivElement>('div.lexical-wrapper');
          if(lexicalWrapper) {
            const id = lexicalWrapper.id;
            if (!!!id) return null;
            const editorInstance = getEditorInstances()[id];
            if (!!!editorInstance) return null;
            ret.options.push({ type: 'survey-paragraph',original_order: i+1,option:JSON.stringify(editorInstance.getEditorState().toJSON())});
          } else {
            return null;
          }
        } else if (type==="audio") {
          const audioEl = option.querySelector<HTMLAudioElement>('audio');
          const audioTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-title"]');
          if(!!!audioEl||!!!audioEl.getAttribute('data-src')||!!!audioTitle||!!!audioTitle.value) return null;
          ret.options.push({ type: 'audio',original_order: i+1,src: audioEl.getAttribute('data-src') as string, title: audioTitle.value});
        } else if (type==="image") {
          const imageInputEl = option.querySelector('input[data-image-input]') as HTMLInputElement;
          const id = imageInputEl.id;
          const imageEl = option.querySelector<HTMLInputElement>(`input[name="${id}-text"]`); 
          const imageShortDescription = option.querySelector<HTMLInputElement>(`input[name="${id}-short-description"]`); 
          const imageLongDescription = option.querySelector<HTMLTextAreaElement>(`textarea[name="${id}-long-description"]`); 
          if(!!!imageEl||!!!imageEl.value||!!!imageShortDescription||!!!imageLongDescription) return null;
          ret.options.push({ type: 'image',original_order: i+1,src: imageEl.value, shortDescription: imageShortDescription.value, longDescription: imageLongDescription.value});
        } else if (type==="video") {
          const videoEl = option.querySelector<HTMLVideoElement>('video');
          const videoTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-title"]');
          const videoDescription = option.querySelector<HTMLTextAreaElement>('textarea[name^="video-input-description"]');
          if(!!!videoEl||!!!videoEl.getAttribute('data-src')||!!!videoTitle||!!!videoTitle.value.length||!!!videoDescription||!!!videoEl.videoHeight) return null;
          ret.options.push({ type: 'video',original_order: i+1,src:videoEl.getAttribute('data-src') as string,title:videoTitle.value,description:videoDescription.value, height: videoEl.videoHeight });
        }
      } else return null;
    } 
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderRankingSurveyQuestion(question: HTMLElement,state:GetSurveyRankingQuestionState) {
  const lexicalID = 'rnd_'.concat(window.crypto.randomUUID());
  const lexicalWrapper = createElement({type:'div', className: 'lexical-wrapper rpq', attributes: {id: lexicalID, 'data-editable': 'false'} });
  question.append(lexicalWrapper);
  const registerSurveyQuestion = getRegisterSurveyQuestion();
  registerSurveyQuestion(lexicalWrapper);
  const editorInstances = getEditorInstances();
  if (editorInstances[lexicalID]) {
    const parsedEditorState = editorInstances[lexicalID].parseEditorState(JSON.parse(state.question));
    editorInstances[lexicalID].setEditorState(parsedEditorState);
    editorInstances[lexicalID].setEditable(false);
  }
  const uuid = window.crypto.randomUUID();
  const dragContainerID = 'ranking_container_'.concat(uuid);
  const questionResponse = createElement({type:'div', attributes:{'data-pq-answer':'', 'data-ranking-container': '', 'data-drag-container': '', id: dragContainerID }, className: 'block p-md'});
  question.append(questionResponse);
  /* ------ Insert Question Response Options/Actions -------------- */
  state.options.forEach((option) => {
    const id = 'ranking_option_'.concat(window.crypto.randomUUID());
    const wrapperDiv = createElement({type: 'div', className: 'flex-row align-center justify-start p-md w-100 gap-1', attributes: { id, style: 'min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;', 'data-option': '', 'data-pr-option': '', 'data-drag-el': '', 'data-type': option.type, 'data-drag-container': dragContainerID } })
    const dragEl = getDragHTML(id);
    wrapperDiv.append(dragEl);
    const secondDiv = createElement({type:'div', className: 'grow-1'});
    wrapperDiv.append(secondDiv);
    questionResponse.append(wrapperDiv);
    const registerSurveyOption = getRegisterSurveyOption();
    if(option.type==="survey-paragraph") {
      const optionID = 'op_id_'.concat(window.crypto.randomUUID());
      const lexicalEditor = createElement({type:'div', className: 'lexical-wrapper rpo', attributes: {id: optionID, 'data-editable': 'false', 'data-max-height': '300', style: 'max-height: 300px;' }});
      secondDiv.append(lexicalEditor);
      if (registerSurveyOption) {
        registerSurveyOption(lexicalEditor);
        const editorInstances = getEditorInstances();
        if (editorInstances[optionID]) {
          const parsedEditorState = editorInstances[optionID].parseEditorState(JSON.parse((option as SurveyParagraphRankingOptionType).option));
          editorInstances[optionID].setEditorState(parsedEditorState);
          editorInstances[optionID].setEditable(false);
        }
      }
    } else if (option.type==="audio") {
      secondDiv.insertAdjacentHTML("afterbegin",getAudioHTML((option as AudioRankingOptionType).src,(option as AudioRankingOptionType).title));
    } else if (option.type==="video") {
      secondDiv.insertAdjacentHTML("afterbegin",getVideoHTML((option as VideoRankingOptionType).src,{ 
        title: (option as VideoRankingOptionType).title,
        description: (option as VideoRankingOptionType).description,
      },String(Math.min(option.height,isTouchDevice()?250:350))));
    } else if (option.type==="image") {
      secondDiv.append(renderImageOptionType({ 
        src: (option as ImageRankingOptionType).src, 
        shortDescription: (option as ImageRankingOptionType).shortDescription,  
        longDescription: (option as ImageRankingOptionType).longDescription 
      }))
    }
  })
  /* ------ End -------------- */
  return;
}

export {
  validateSurveyRankingCreateSurvey,
  getSurveyRankingCreateSurveyHTML,
  renderRankingSurveyQuestion,
  getCreateRankingSurveyQuestionInput,
  addRankingOption
};
