import { 
  getRadioHTML, 
  createElement, 
  getSurveyRteHTML,
  getChangeOptionTypeButton,
  getDeleteOptionButton,
  OPTION_TYPES,
  getAudioInputHTML,
  getImageInputHTML,
  getVideoInputHTML,  
  getQuestionLexicalStateFromWrapper,
  renderImageOptionType,
  getClosestSurveyQuestion
} from "./sharedSurvey";
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion, getRegisterSurveyOption } from "../lexical-implementation";
import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from '../index';
import type { SurveyParagraphOptionType, AudioOptionType, VideoOptionType, ImageOptionType } from "./sharedSurvey";
import { getAudioHTML, getVideoHTML } from "../media-upload";
import { isTouchDevice } from "../shared";
const VERSION = 1;

export type GetSurveyMultipleChoiceQuestionState = {
  type: 'survey-multiple-choice',
  question: string, 
  required: boolean,
  options: (SurveyParagraphOptionType|AudioOptionType|VideoOptionType|ImageOptionType)[],
  VERSION: number
};
export type RespondSurveyMultipleChoiceState = {
  type: 'survey-multiple-choice',
  choice?: number
};
/* --------------------------- Helper Function --------------------------*/ 
function handleRadioClick(this:HTMLInputElement,e:Event) {
  if (this.checked===true) {
    const question = getClosestSurveyQuestion(this);
    if(question) {
      const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
      if (requiredCheckbox) {
        if (requiredCheckbox.checked!==true) {
          this.checked = false;
          e.stopImmediatePropagation();
          e.stopPropagation();
        }
      }
    }
  }
}
function uncheckRadio(this:HTMLInputElement,e:Event) {
  if(this.checked===true) {
    e.preventDefault();
    e.stopPropagation();
    this.checked = false;
    this.dispatchEvent(new Event('change'));
  }
}
/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyMultipleChoiceCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyMultipleChoiceQuestionState) {
  const questionID = question.id;
  if (questionState) {
    const divs:HTMLElement[] = [];
    for (let option of questionState.options) {
      const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
      const wrapperDiv = createElement({
        type:'div',
        className: 'flex-row align-center justify-start p-md w-100 gap-1',
        attributes: {
          id: wrapper_id,
          'data-option': '',
          'data-type': option.type
        }
      });
      const radio = getRadioHTML(String(questionID));
      const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
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
      wrapperDiv.append(radio,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
      divs.push(wrapperDiv);
    }
    return divs;
  } else {
    const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
    const wrapperDiv = createElement({
      type:'div',
      className: 'flex-row align-center justify-start p-md w-100 gap-1',
      attributes: {
        id: wrapper_id,
        'data-option': '',
        'data-type': 'survey-paragraph'
      }
    });
    const radio = getRadioHTML(String(questionID));
    const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
    const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'});
    grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
    wrapperDiv.append(radio,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
    return wrapperDiv;
  }
}
/* Add Option */
function addSurveyMultipleChoiceOption(this:HTMLButtonElement) {
  const question = this.closest<HTMLElement>('section.survey-question');
  const html = document.querySelector('html');
  if(question&&html) {
    const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
    if (options&&options.length<100) {
      const optionType =options[options.length-1].getAttribute('data-type');
      if(OPTION_TYPES.has(optionType as any)) {
        const questionID = question.id;
        const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
        const wrapperDiv = createElement({
          type:'div',
          className: 'flex-row align-center justify-start p-md w-100',
          attributes: {
            id: wrapper_id,
            'data-option': ''
          }
        });
        const radio = getRadioHTML(String(questionID));
        radio.addEventListener('click',handleRadioClick,true);
        const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
        if(optionType==='survey-paragraph'){
          const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'});
          grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
          wrapperDiv.setAttribute('data-type','survey-paragraph');
        }else if (optionType==='audio'){
          grow1.append(...getAudioInputHTML());
          grow1.style.cssText = "min-width: 0px;padding-left:10px;";
          wrapperDiv.setAttribute('data-type','audio');
        }else if (optionType==='video'){
          grow1.append(...getVideoInputHTML());
          grow1.style.cssText = "min-width: 0px;padding-left:10px;";
          wrapperDiv.setAttribute('data-type','video');
        }else if (optionType==='image') {
          grow1.append(...getImageInputHTML());
          grow1.style.cssText = "min-width: 0px;padding-left:10px;";
          wrapperDiv.setAttribute('data-type','image');
        }
        wrapperDiv.append(radio,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
        options[options.length-1].insertAdjacentElement("afterend",wrapperDiv);
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:question}}));
      } 
    } else if (options.length>=100){
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: 'The maximum number of options allowed is 100.' }}))
    }
  }
}
/* Validate Created Survey Question */ 
/**
 * One option doe snot have to be selected due to the fact that the question is optional
 * @param question 
 * @returns 
 */
function validateSurveyMultipleChoiceCreateSurvey(question:HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  if (questionLexicalState===null) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  if (!!!requiredCheckbox) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find whether this question is required." }}))
    return false;
  }
  const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
  if (!!!options.length) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "There must be at least one option for multiple choice inputs." }}))
    return false;
  }
  for (let option of options) {
    const type = option.getAttribute("data-type");
    const radio = option.querySelector<HTMLInputElement>('input[type="radio"]');
    if (!!!OPTION_TYPES.has(type as any)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "There must be at least one option for multiple choice inputs." }}))
      return false;
    }
    if (type==="survey-paragraph") {
      const lexicalWrapper = option.querySelector<HTMLDivElement>('div.lexical-wrapper');
      if (lexicalWrapper) {
        const id = lexicalWrapper.id;
        if(id) {
          const editorState = getEditorInstances()[id];
          if (!!!editorState) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the option value for an option in this question." }}))
            return false;
          }
        }
      } else {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the option value for an option in this question." }}))
        return false;
      }
    } else if (type==="image") {
      const imageInputEl = option.querySelector('input[data-image-input]') as HTMLInputElement;
      const id = imageInputEl.id;
      const imageEl = option.querySelector<HTMLInputElement>(`input[name="${id}-text"]`); 
      const imageShortDescription = option.querySelector<HTMLInputElement>(`input[name="${id}-short-description"]`); 
      const imageLongDescription = option.querySelector<HTMLTextAreaElement>(`textarea[name="${id}-long-description"]`); 
      if (!!!imageEl||!!!imageEl.value||!!!imageShortDescription||!!!imageLongDescription) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "You must upload an image for a question option that has the image option type." }}))
        return false;
      }
    } else if (type==="video") {
      const videoInput = option.querySelector<HTMLVideoElement>('video');
      const videoTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-title"]');
      const videoDescription = option.querySelector<HTMLTextAreaElement>('textarea[name^="video-input-description"]');
      if (!!!videoInput||!!!videoInput.getAttribute('data-src')||!!!videoTitle||!!!videoTitle.value.length||!!!videoDescription) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "You must upload a video for each question option that has the video option type. Each video must have an associated title." }}))
        return false;
      }
    } else if (type==="audio") {
      const audioInput = option.querySelector<HTMLAudioElement>('audio');
      const audioTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-title"]');
      if (!!!audioInput||!!!audioInput.getAttribute('data-src')||!!!audioTitle||!!!audioTitle.value.length) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "You must upload an audio recording for each question option that has the audio option type. Each audio recording must have a title." }}))
        return false;
      }
    }
    if (!!!radio) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the radio input for this multiple choice input." }}))
      return false;
    }
  }
  return true;
}
/* Get the created survey question Input */
function getCreateMultipleChoiceSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
  if (questionLexicalState&&requiredCheckbox&&options.length>=1) {
    const ret:GetSurveyMultipleChoiceQuestionState = {
      type: 'survey-multiple-choice',
      question: questionLexicalState, // stringified JSON string
      required: Boolean(requiredCheckbox.checked===true),
      options: [],
      VERSION
    };
    for (let option of options) {
      const type =  option.getAttribute("data-type");
      var alreadySelected: boolean = false;
      const defaultCheckedCheckbox = option.querySelector<HTMLInputElement>('input[type="radio"]');
      if (OPTION_TYPES.has(type as any)&&defaultCheckedCheckbox) {
        const defaultChecked = Boolean(!!!alreadySelected&&defaultCheckedCheckbox.checked===true);
        if (defaultChecked) alreadySelected=true;
        if (type==="survey-paragraph") {
          const lexicalWrapper = option.querySelector<HTMLDivElement>('div.lexical-wrapper');
          if(lexicalWrapper) {
            const id = lexicalWrapper.id;
            if (!!!id) return null;
            const editorInstance = getEditorInstances()[id];
            if (!!!editorInstance) return null;
            ret.options.push({ type: 'survey-paragraph',defaultChecked,option:JSON.stringify(editorInstance.getEditorState().toJSON())});
          } else {
            return null;
          }
        } else if (type==="audio") {
          const audioEl = option.querySelector<HTMLAudioElement>('audio');
          const audioTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-title"]');
          if(!!!audioEl||!!!audioEl.getAttribute('data-src')||!!!audioTitle||!!!audioTitle.value) return null;
          ret.options.push({ type: 'audio',defaultChecked,src: audioEl.getAttribute('data-src') as string, title: audioTitle.value});
        } else if (type==="image") {
          const imageInputEl = option.querySelector('input[data-image-input]') as HTMLInputElement;
          const id = imageInputEl.id;
          const imageEl = option.querySelector<HTMLInputElement>(`input[name="${id}-text"]`); 
          const imageShortDescription = option.querySelector<HTMLInputElement>(`input[name="${id}-short-description"]`); 
          const imageLongDescription = option.querySelector<HTMLTextAreaElement>(`textarea[name="${id}-long-description"]`); 
          if(!!!imageEl||!!!imageEl.value||!!!imageShortDescription||!!!imageLongDescription) return null;
          ret.options.push({ type: 'image',defaultChecked,src: imageEl.value, shortDescription: imageShortDescription.value, longDescription: imageLongDescription.value});
        } else if (type==="video") {
          const videoEl = option.querySelector<HTMLVideoElement>('video');
          const videoTitle = option.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-title"]');
          const videoDescription = option.querySelector<HTMLTextAreaElement>('textarea[name^="video-input-description"]');
          if(!!!videoEl||!!!videoEl.getAttribute('data-src')||!!!videoTitle||!!!videoTitle.value.length||!!!videoDescription||!!!videoEl.videoHeight) return null;
          ret.options.push({ type: 'video',defaultChecked,src:videoEl.getAttribute('data-src') as string,title:videoTitle.value,description:videoDescription.value, height: Math.max(videoEl.videoHeight,250) });
        }
      } else return null;
    }
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function renderMultipleChoiceSurveyQuestion(question: HTMLElement,state:GetSurveyMultipleChoiceQuestionState) {
  const lexicalID = 'rnd_'.concat(window.crypto.randomUUID());
  const lexicalWrapper = createElement({type:'div', className: 'lexical-wrapper rpq', attributes: {id: lexicalID, 'data-editable': 'false'} });
  question.append(lexicalWrapper);
  const registerSurveyQuestion = getRegisterSurveyQuestion();
  if (registerSurveyQuestion) {
    registerSurveyQuestion(lexicalWrapper);
    const editorInstances = getEditorInstances();
    if (editorInstances[lexicalID]) {
      const parsedEditorState = editorInstances[lexicalID].parseEditorState(JSON.parse(state.question));
      editorInstances[lexicalID].setEditorState(parsedEditorState);
      editorInstances[lexicalID].setEditable(false);
    }
    const questionResponse = createElement({type:'div', attributes:{'data-pq-answer':'',}, className: 'block p-md'});
    question.append(questionResponse);
    /* ------ Insert Question Response Options/Actions -------------- */
    const option_id = 'op_'.concat(window.crypto.randomUUID());
    state.options.forEach((option) => {
      const wrapperDiv = createElement({type:'div', attributes: {'data-pr-option': '', 'data-type': option.type, style: 'min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;'}, className:'flex-row mt-1 align-center gap-1 justify-start'})
      const radio = getRadioHTML(option_id,option.defaultChecked)
      if (!!!state.required) radio.addEventListener('click',uncheckRadio);
      wrapperDiv.append(radio);
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
            const parsedEditorState = editorInstances[optionID].parseEditorState(JSON.parse((option as SurveyParagraphOptionType).option));
            editorInstances[optionID].setEditorState(parsedEditorState);
            editorInstances[optionID].setEditable(false);
          }
        }
      } else if (option.type==="audio") {
        secondDiv.insertAdjacentHTML("afterbegin",getAudioHTML((option as AudioOptionType).src,(option as AudioOptionType).title));
      } else if (option.type==="video") {
        secondDiv.insertAdjacentHTML("afterbegin",getVideoHTML((option as VideoOptionType).src,{ 
          title: (option as VideoOptionType).title,
          description: (option as VideoOptionType).description,
        },String(Math.min(option.height,isTouchDevice()?250:350))));
      } else if (option.type==="image") {
        secondDiv.append(renderImageOptionType({ 
          src: (option as ImageOptionType).src, 
          shortDescription: (option as ImageOptionType).shortDescription,  
          longDescription: (option as ImageOptionType).longDescription 
        }))
      }
    })
    /* ------ End -------------- */
  }
}

export {
  validateSurveyMultipleChoiceCreateSurvey,
  getSurveyMultipleChoiceCreateSurveyHTML,
  renderMultipleChoiceSurveyQuestion,
  getCreateMultipleChoiceSurveyQuestionInput,
  addSurveyMultipleChoiceOption,
};