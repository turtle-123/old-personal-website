import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion, getRegisterSurveyOption } from "../lexical-implementation";
import { 
  getCheckboxHTML, 
  createElement, 
  getSurveyRteHTML,
  getChangeOptionTypeButton,
  getDeleteOptionButton,
  getAudioInputHTML,
  getImageInputHTML,
  getVideoInputHTML,
  OPTION_TYPES,
  getQuestionLexicalStateFromWrapper,
  renderImageOptionType,
  getNumberInput,
  getHandleMinChange,
  getHandleMaxChange,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from '../index';
import type { SurveyParagraphOptionType, AudioOptionType, VideoOptionType, ImageOptionType } from "./sharedSurvey";
import { getAudioHTML, getVideoHTML } from "../media-upload";
import { isTouchDevice } from "../shared";
const VERSION = 1;

export type GetSurveyCheckboxQuestionState = {
  type: 'survey-checkbox',
  question: string, 
  required: boolean,
  options: (SurveyParagraphOptionType|AudioOptionType|VideoOptionType|ImageOptionType)[],
  min_selected_options?: number,
  max_selected_options?: number,
  VERSION: number
};
export type RespondSurveyCheckboxState = {
  type: 'survey-checkbox',
  checked: boolean[]
};

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyCheckboxCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyCheckboxQuestionState) {
  if (!!!questionState) {
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
    const checkbox = getCheckboxHTML();
    const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
    const surveyOptionRichTextEditor = getSurveyRteHTML({  rteType: 'survey-option'});
    grow1.insertAdjacentElement("beforeend",surveyOptionRichTextEditor);
    wrapperDiv.append(checkbox,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
    const uuid = window.crypto.randomUUID();
    const min_selected = getNumberInput({ id: `min_selections_${uuid}`, placeholder: "Enter the minimum number of selections for checkbox question", min: 0, max: 100, label: "Minimum Selections" });
    const max_selected = getNumberInput({ id: `max_selections_${uuid}`, placeholder: "Enter the maximum number of selections for checkbox question", min: 0, max: 100, label: "Maximum Selections" });
    const min_selected_num = min_selected.querySelector<HTMLInputElement>('input[type="number"]');
    const max_selected_num = max_selected.querySelector<HTMLInputElement>('input[type="number"]');
    if (min_selected_num&&max_selected_num) {
      min_selected_num.addEventListener('change',getHandleMinChange(min_selected_num,max_selected_num));
      max_selected_num.addEventListener('change',getHandleMaxChange(min_selected_num,max_selected_num));
    }
    const selectionsDiv = createElement({type:'div', className:'p-md'});
    selectionsDiv.append(min_selected,max_selected);
    return [wrapperDiv,selectionsDiv];
  } else {
    const divs:HTMLElement[]=[];
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
      const checkbox = getCheckboxHTML(option.defaultChecked);
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
      wrapperDiv.append(checkbox,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
      divs.push(wrapperDiv);
    }
    const uuid = window.crypto.randomUUID();
    const min_selected = getNumberInput({ id: `min_selections_${uuid}`, placeholder: "Enter the minimum number of selections for checkbox question", min: 0, step: 1, max: 100, label: "Minimum Selections", defaultValue: Number.isInteger(questionState.min_selected_options)?String(questionState.min_selected_options):undefined });
    const max_selected = getNumberInput({ id: `max_selections_${uuid}`, placeholder: "Enter the maximum number of selections for checkbox question", min: 0, max: 100, label: "Maximum Selections", defaultValue: Number.isInteger(questionState.max_selected_options)?String(questionState.max_selected_options):undefined });
    const min_selected_num = min_selected.querySelector<HTMLInputElement>('input[type="number"]');
    const max_selected_num = max_selected.querySelector<HTMLInputElement>('input[type="number"]');
    if (min_selected_num&&max_selected_num) {
      min_selected_num.addEventListener('change',getHandleMinChange(min_selected_num,max_selected_num));
      max_selected_num.addEventListener('change',getHandleMaxChange(min_selected_num,max_selected_num));
    }
    const selectionsDiv = createElement({type:'div', className:'p-md'});
    selectionsDiv.append(min_selected,max_selected);
    divs.push(selectionsDiv);
    return divs;
  }
}
/* Add Option */
function addSurveyCheckboxOption(this:HTMLButtonElement) {
  const question = this.closest<HTMLElement>('section.survey-question');
  if (question) {
    const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
    if (options&&options.length<100) {
      const optionType = options[options.length-1].getAttribute('data-type');
      if(OPTION_TYPES.has(optionType as any)) {
        const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
        const wrapperDiv = createElement({
          type:'div',
          className: 'flex-row align-center justify-start p-md w-100 gap-1',
          attributes: {
            id: wrapper_id,
            'data-option': ''
          }
        });
        const checkbox = getCheckboxHTML();
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
        wrapperDiv.append(checkbox,grow1,getChangeOptionTypeButton(),getDeleteOptionButton());
        options[options.length-1].insertAdjacentElement("afterend",wrapperDiv);
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:question}}));
      }
    } else if (options.length>=100){
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: 'The maximum number of options allowed is 100.' }}))
    }
  }
}
/* Validate Created Survey Question */ 
function validateSurveyCheckboxCreateSurvey(question: HTMLElement) {
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
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "There must be at least one option for checkbox inputs." }}))
    return false;
  }
  for (let option of options) {
    const type = option.getAttribute("data-type");
    const checkbox = option.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (!!!OPTION_TYPES.has(type as any)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "There must be at least one option for checkbox inputs." }}))
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
    if (!!!checkbox) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the checkbox for this checkbox input." }}))
      return false;
    }
  }
  const min_selection = question.querySelector<HTMLInputElement>('input[id^="min_selections_"]');
  const max_selection = question.querySelector<HTMLInputElement>('input[id^="max_selections_"]');
  if (!!!max_selection||(max_selection.value!==''&&!!!max_selection.checkValidity())) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid max selection value for checkbox input." }}))
    return false;
  }
  if (!!!min_selection||(min_selection.value!==''&&!!!min_selection.checkValidity())) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid min selection value for checkbox input." }}))
    return false;
  }
  if (min_selection&&min_selection.value!==''&&min_selection.checkValidity()) {
    if (options.length<parseInt(min_selection.value)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The number of checkbox options can not be less than the minimum number of required selections." }}))
    return false; 
    }
  }
  return true;
}
/* Get the created survey question Input */
function getCreateCheckboxSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
  const min_selection = question.querySelector<HTMLInputElement>('input[id^="min_selections_"]');
  const max_selection = question.querySelector<HTMLInputElement>('input[id^="max_selections_"]');

  if (questionLexicalState&&requiredCheckbox&&options.length>=1&&min_selection&&max_selection) {
    const ret:GetSurveyCheckboxQuestionState = {
      type: 'survey-checkbox',
      question: questionLexicalState, // stringified JSON string
      required: Boolean(requiredCheckbox.checked===true),
      min_selected_options: undefined,
      max_selected_options: undefined,
      options: [],
      VERSION
    };
    if (min_selection.value!=='') {
      ret.min_selected_options = parseInt(min_selection.value);
    }
    if (max_selection.value!=='') {
      ret.max_selected_options = parseInt(max_selection.value);
    }
    for (let option of options) {
      const type =  option.getAttribute("data-type");
      const defaultCheckedCheckbox = option.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (OPTION_TYPES.has(type as any)&&defaultCheckedCheckbox) {
        const defaultChecked = Boolean(defaultCheckedCheckbox.checked===true);
        if (type==="survey-paragraph") {
          const lexicalWrapper = option.querySelector<HTMLDivElement>('div.lexical-wrapper');
          if(lexicalWrapper) {
            const id = lexicalWrapper.id;
            if (!!!id) return null;
            const editorInstance = getEditorInstances()[id];
            if (!!!editorInstance) return null;
            const optionEditorState = JSON.stringify(editorInstance.getEditorState().toJSON());
            ret.options.push({ type: 'survey-paragraph',defaultChecked,option: optionEditorState });
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
function renderCheckboxSurveyQuestion(question:HTMLElement,state: GetSurveyCheckboxQuestionState) {
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
    const questionResponse = createElement({type:'div', attributes:{'data-pq-answer':''}, className: 'block p-md'});
    question.append(questionResponse);
    if (Number.isInteger(state.min_selected_options)||Number.isInteger(state.max_selected_options)) {
      const div = createElement({type:"div", className: "flex-row justify-between align-center mt-1"});
      if (Number.isInteger(state.min_selected_options)) {
        const span = createElement({ type: 'span' });
        const span2 = createElement({ type: 'span', className: 'bold' });
        span2.innerText = "Min Selections: ";
        span.append(span2,new Text(state.min_selected_options?.toString()))
        div.append(span);
      }
      if (Number.isInteger(state.max_selected_options)) {
        const span = createElement({ type: 'span' });
        const span2 = createElement({ type: 'span', className: 'bold' });
        span2.innerText = "Max Selections: ";
        span.append(span2,new Text(state.max_selected_options?.toString()))
        div.append(span);
      }
      questionResponse.append(div);
    }
    /* ------ Insert Question Response Options/Actions -------------- */
    state.options.forEach((option) => {
      const wrapperDiv = createElement({type:'div', attributes: {'data-pr-option': '', 'data-type': option.type, style: 'min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;' }, className:'flex-row mt-1 align-center gap-1 justify-start'})
      wrapperDiv.append(getCheckboxHTML(option.defaultChecked));
      const secondDiv = createElement({type:'div', className: 'grow-1', style: 'overflow: auto;'});
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
            const parsedEditorState = editorInstances[lexicalID].parseEditorState(JSON.parse((option as SurveyParagraphOptionType).option));
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
    // COME BACK
    
    /* ------ End -------------- */
  }
}


export {
  validateSurveyCheckboxCreateSurvey,
  getSurveyCheckboxCreateSurveyHTML,
  renderCheckboxSurveyQuestion,
  getCreateCheckboxSurveyQuestionInput,
  addSurveyCheckboxOption,
};


