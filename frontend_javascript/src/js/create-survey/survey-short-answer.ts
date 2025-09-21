import {  
  createElement,
  getHandleMaxChange,
  getHandleMinChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyShortAnswerQuestionState = {
  type: 'survey-short-answer',
  question: string, 
  required: boolean,
  minLength: number|undefined,
  maxLength: number|undefined,
  VERSION: number
};
export type RespondSurveyShortAnswerState = {
  type: 'survey-short-answer',
  response?: string
};

/* --------------------------- Helper functions ---------------------------------- */
function getTextInput({ id, label, placeholder, maxLength, minLength, disabled=false, wrapperClassName='input-group block mt-1' }:{id: string, label: string, maxLength?: number, minLength?: number, placeholder?:string, disabled: boolean, wrapperClassName?: string}) {
  const wrapperDiv = createElement({type:'div', className: wrapperClassName });
  const labelEl = createElement({ type:'label', innerText: label, attributes:{for: id}});
  if (disabled) labelEl.classList.add('disabled');
  const innerDiv = createElement({type:'div',className: 'mt-1 text-input block medium'});
  const textInput = createElement({type:'input', attributes:{type:'text', name:id,id:id,rows:"10",spellcheck:"false",autocomplete:"off",autocapitalize:"off"}});
  if(minLength) textInput.setAttribute('minlength',String(minLength));
  if(maxLength)textInput.setAttribute('maxlength',String(maxLength));
  if(placeholder)textInput.setAttribute('placeholder',placeholder);
  if(disabled) textInput.setAttribute('disabled','');
  innerDiv.append(textInput);
  wrapperDiv.append(labelEl,innerDiv);
  return wrapperDiv;
}

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyShortAnswerCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyShortAnswerQuestionState) {
  const textareaID = 'survey_short_'.concat(window.crypto.randomUUID());
  const minLengthID = 'survey_short_min_'.concat(window.crypto.randomUUID());
  const maxLengthID = 'survey_short_max_'.concat(window.crypto.randomUUID());
  const wrapperDiv = createElement({type:'div',className:'block p-md'});
  const textarea = getTextInput({id:textareaID,label:'Response', disabled:true, placeholder: 'User Response would go here ...'})
  const min = getNumberInput({ id: minLengthID, min: 0, label: 'Minimum Length:', placeholder:'Enter the minimum length for the user response...', defaultValue: questionState?.minLength ? String(questionState.minLength) : undefined  });
  const max = getNumberInput({ id: maxLengthID, min: 1, max: 300, label: 'Maximum Length:', placeholder:'Enter the maximum length for the user response...', defaultValue: questionState?.maxLength ? String(questionState.maxLength) : undefined });
  wrapperDiv.append(textarea,min,max);
  return wrapperDiv;
}
/* Validate Created Survey Question */ 
function validateSurveyShortAnswerCreateSurvey(question:HTMLElement) {
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
  const minLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_short_min_"]');
  const maxLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_short_max_"]');
  if(!!!minLengthInput||!!!maxLengthInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find whether this question is required." }}))
    return false;
  }
  if(minLengthInput.value!==''&&maxLengthInput.value!=='') {
    if (Number(minLengthInput.value)>Number(maxLengthInput.value)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The required minimum length of the user response must not be greater than the required maximum length of the user response." }}))
      return false;
    }
  }
  if (minLengthInput.value!=='') {
    if (Number(minLengthInput.value) < 0) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The required minimum length of the user response must be at least 0." }}))
      return false;
    }
  }
  if (maxLengthInput.value!=='') {
    if (Number(maxLengthInput.value) < 1) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The required maximum length of the user response must be at least 1." }}))
      return false;
    }
  }
  return true;
}
/* Get the created survey question Input */
function getCreateShortAnswerSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_short_min_"]');
  const maxLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_short_max_"]');
  if(questionLexicalState&&requiredCheckbox&&minLengthInput&&maxLengthInput) {
    const ret:GetSurveyShortAnswerQuestionState = {
      type:'survey-short-answer',
      question: questionLexicalState,
      required: Boolean(requiredCheckbox.checked===true),
      minLength: minLengthInput.value!==''?parseInt(minLengthInput.value):undefined,
      maxLength: maxLengthInput.value!==''?parseInt(maxLengthInput.value):undefined,
      VERSION
    };
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function renderShortAnswerSurveyQuestion(question: HTMLElement,state:GetSurveyShortAnswerQuestionState) {
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
    /* ------ Insert Question Response Options/Actions -------------- */
    const inputID = 'ursa_'.concat(window.crypto.randomUUID());
    const textInput = getTextInput({ label:'Response:', placeholder:'Enter your response here...', id: inputID, minLength:state.minLength,maxLength:state.maxLength,disabled:false, })
    questionResponse.append(textInput);
    if (typeof state.minLength ==='number' && isFinite(state.minLength)) {
      const helperMin = createElement({type:'p', className:'block body2 mt-1'});
      helperMin.append(createElement({type:'span',className:'bold', innerText:'Minimum Length: '}));
      helperMin.append(document.createTextNode(state.minLength.toString()));
      questionResponse.append(helperMin);
    }
    if (typeof state.maxLength ==='number' && isFinite(state.maxLength)) {
      const helperMax = createElement({type:'p', className:'block body2 mt-1'});
      helperMax.append(createElement({type:'span',className:'bold', innerText:'Maximum Length: '}));
      helperMax.append(document.createTextNode(state.maxLength.toString()));
      questionResponse.append(helperMax);
    }
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}
export {
  validateSurveyShortAnswerCreateSurvey,
  getSurveyShortAnswerCreateSurveyHTML,
  renderShortAnswerSurveyQuestion,
  getCreateShortAnswerSurveyQuestionInput,
};



