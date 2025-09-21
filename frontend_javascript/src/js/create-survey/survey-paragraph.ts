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

export type GetSurveyParagraphQuestionState = {
  type: 'survey-paragraph',
  question: string, 
  required: boolean,
  minLength: number|undefined,
  maxLength: number|undefined,
  VERSION: number
};
export type RespondSurveyParagraphState = {
  type: 'survey-paragraph',
  response?: string
};

/* --------------------------- Helper functions ---------------------------------- */
function getTextArea({ id, label, placeholder, maxLength, minLength, disabled=false, includeCharCounter=false }:{id: string, label: string, maxLength?: number, minLength?: number, placeholder?:string, disabled: boolean, includeCharCounter?:boolean}) {
  const wrapperDiv = createElement({type:'div', className: 'input-group block mt-1'});
  const labelEl = createElement({ type:'label', innerText: label, attributes:{for: id}});
  if (disabled) labelEl.classList.add('disabled');
  const innerDiv = createElement({type:'div',className: 'mt-1 text-input block medium'});
  const textarea = createElement({type:'textarea', attributes:{name:id,id:id,rows:"5",spellcheck:"false",autocomplete:"off",autocapitalize:"off",style: !!!disabled ? 'resize:vertical!important; min-height: 100px;' : ''}});
  if(minLength) textarea.setAttribute('minlength',String(minLength));
  if(maxLength)textarea.setAttribute('maxlength',String(maxLength));
  if(placeholder)textarea.setAttribute('placeholder',placeholder);
  if(disabled) textarea.setAttribute('disabled','');
  innerDiv.append(textarea);
  wrapperDiv.append(labelEl,innerDiv);
  if(includeCharCounter) {
    const charCounter = createElement({type:'p',className:'char-counter t-disabled',attributes:{"data-input":id}});
    if(typeof minLength==='number') {
      const minCharCounter = createElement({type:'span', className:'min-counter body2', attributes:{"data-val": String(minLength), "aria-hidden": "false"} });
      minCharCounter.append(document.createTextNode("more characters required"));
      charCounter.append(minCharCounter);
    }
    if (typeof maxLength==='number') {
      const maxCharCounter = createElement({type:'span', className:'max-counter body2', attributes:{"data-val": String(maxLength), "aria-hidden": Boolean(typeof minLength==='number').toString() } });
      maxCharCounter.append(document.createTextNode("Characters Remaining"));
      charCounter.append(maxCharCounter);
    }
    wrapperDiv.append(charCounter);
  }
  return wrapperDiv;
}
/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyParagraphCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyParagraphQuestionState) {
  const textareaID = 'textarea_'.concat(window.crypto.randomUUID());
  const minLengthID = 'textarea_min_'.concat(window.crypto.randomUUID());
  const maxLengthID = 'textarea_max_'.concat(window.crypto.randomUUID());
  const wrapperDiv = createElement({type:'div',className:'block p-md'});
  const textarea = getTextArea({id:textareaID,label:'Response', disabled:true, placeholder: 'User Response would go here ...'});
  const min = getNumberInput({ id: minLengthID, min: 0, max: 19_999, label: 'Minimum Length:', placeholder:'Enter the minimum length for the user response...', defaultValue: questionState?.minLength ? questionState.minLength.toString() : undefined});
  const max = getNumberInput({ id: maxLengthID, min: 1, max: 20000, label: 'Maximum Length:', placeholder:'Enter the maximum length for the user response...', defaultValue: questionState?.maxLength ? questionState.maxLength.toString() : undefined });
  wrapperDiv.append(textarea,min,max);
  return wrapperDiv;
}
/* Validate Created Survey Question */ 
function validateSurveyParagraphCreateSurvey(question:HTMLElement) {
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
  const minLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="textarea_min_"]');
  const maxLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="textarea_max_"]');
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
function getCreateParagraphSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="textarea_min_"]');
  const maxLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="textarea_max_"]');
  if(questionLexicalState&&requiredCheckbox&&minLengthInput&&maxLengthInput) {
    const ret:GetSurveyParagraphQuestionState = {
      type:'survey-paragraph',
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
function renderParagraphSurveyQuestion(question: HTMLElement,state:GetSurveyParagraphQuestionState) {
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
    const inputID = 'urt_'.concat(window.crypto.randomUUID());
    const includeCharCounter = Boolean(typeof state.minLength==='number'||typeof state.maxLength==='number');
    const textarea = getTextArea({ label:'Response:', placeholder:'Enter your response here...', id: inputID, minLength:state.minLength,maxLength:state.maxLength,disabled:false, includeCharCounter })
    questionResponse.append(textarea);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}

export {
  validateSurveyParagraphCreateSurvey,
  getSurveyParagraphCreateSurveyHTML,
  renderParagraphSurveyQuestion,
  getCreateParagraphSurveyQuestionInput,
};



