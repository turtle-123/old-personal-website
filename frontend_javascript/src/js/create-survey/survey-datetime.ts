import {  
  createElement,
  getHandleMaxChange,
  getHandleMinChange,
  getHandleStepChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper,
  isValidDateString
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

const LAUNCH_PICKER_BUTTON = '<button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Datetime Input Menu"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Today"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></svg></button>';

export type GetSurveyDatetimeQuestionState = {
  type: 'survey-datetime',
  question: string, 
  required: boolean,
  minDatetime: string|undefined,
  maxDatetime: string|undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyDatetimeState = {
  type: 'survey-datetime',
  datetime?: string
};

/* --------------------------- Helper functions ---------------------------------- */
function getDatetimeInput(type:'min'|'max'|'date_response',obj?:{min?:string, max?:string},value?:string) {
  var innerText:string;
  var INPUT_ID: string; 
  if(type==='min') {
    innerText = 'Min Datetime:';
    INPUT_ID = 'min_datetime_'.concat(window.crypto.randomUUID());
  } else if (type==='max'){
    innerText = 'Max Datetime:';
    INPUT_ID = 'max_datetime_'.concat(window.crypto.randomUUID());
  } else {
    innerText = 'Input Datetime:';
    INPUT_ID = 'datetime_resp_'.concat(window.crypto.randomUUID());
  }
  const wrapperDiv = createElement({type:'div',className:'input-group block mt-2'});
  const label = createElement({type:'label', attributes: {for: INPUT_ID}, innerText: innerText})
  const innerDiv = createElement({type:'div', className:'flex-row align-center gap-2 mt-1'});
  const input = createElement({ type: 'input', attributes: {type:'datetime-local', id: INPUT_ID, name: INPUT_ID, placeholder: 'yyyy-mm-ddThh:mm:ss'}});
  if (value) {
    (input as HTMLInputElement).setAttribute('value',value);
  }
  innerDiv.insertAdjacentHTML("afterbegin",LAUNCH_PICKER_BUTTON);
  innerDiv.append(input);
  wrapperDiv.append(label,innerDiv);
  if(obj&&obj.min) {
    const min = new Date(obj.min);
    const year = min.getFullYear();
    const month = min.getMonth()+1;
    const day = min.getDate();
    const hours = min.getHours();
    const minutes = min.getMinutes();
    const seconds = min.getSeconds();
    const minDatetime = [year,month,day].join('-').concat('T').concat([hours,minutes,seconds].join(':'));
    input.setAttribute('min',minDatetime);
    if(type==='date_response') {
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Min Datetime: '}));
      helper.append(document.createTextNode(minDatetime));
      wrapperDiv.append(helper);
    }
  }
  if(obj&&obj.max){
    const max = new Date(obj.max);
    const year = max.getFullYear();
    const month = max.getMonth()+1;
    const day = max.getDate();
    const hours = max.getHours();
    const minutes = max.getMinutes();
    const seconds = max.getSeconds();
    const maxDatetime = [year,month,day].join('-').concat('T').concat([hours,minutes,seconds].join(':'));
    input.setAttribute('max',maxDatetime);
    if(type==='date_response') {
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Max Datetime: '}));
      helper.append(document.createTextNode(maxDatetime));
      wrapperDiv.append(helper);
    }
  }
  return wrapperDiv;
}
/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyDatetimeCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyDatetimeQuestionState) {
  const minDatetime = getDatetimeInput('min',undefined,questionState?.minDatetime);
  const maxDatetime = getDatetimeInput('max',undefined,questionState?.maxDatetime);
  const stepID = 'step_'.concat(window.crypto.randomUUID());
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '1', required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const minInput = minDatetime.querySelector<HTMLInputElement>('input');
  const maxInput = maxDatetime.querySelector<HTMLInputElement>('input');
  const stepInput = step.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
    minInput.addEventListener('change',getHandleMinChange(minInput,maxInput));
    maxInput.addEventListener('change',getHandleMaxChange(minInput,maxInput));
  }
  step.classList.remove('mt-1');
  step.classList.add('p-md');
  const div = createElement({type:'div', className: 'block p-md'});
  div.append(minDatetime,maxDatetime,step);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyDatetimeCreateSurvey(question:HTMLElement) {
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
  const minDatetimeInput = question.querySelector<HTMLInputElement>('input[type="datetime-local"][id^="min_datetime_"]');
  const maxDatetimeInput = question.querySelector<HTMLInputElement>('input[type="datetime-local"][id^="max_datetime_"]');
  if(!!!minDatetimeInput||!!!maxDatetimeInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  if (minDatetimeInput.value&&maxDatetimeInput.value) {
    const minDatetime = new Date(minDatetimeInput.value);
    const maxDatetime = new Date(maxDatetimeInput.value);
    if (minDatetime>=maxDatetime) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum datetime for this datetime survey question can not be later than the maximum datetime." }}))
      return false;
    }
  }
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if (!!!stepInput||isNaN(parseFloat(stepInput.value))||parseFloat(stepInput.value)<=0) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid step input. The step input is required, and it must be greater than 0." }}))
    return false;
  }
  return true;
}
/* Get the created survey question Input */
function getCreateDatetimeSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minDatetimeInput = question.querySelector<HTMLInputElement>('input[type="datetime-local"][id^="min_datetime_"]');
  const maxDatetimeInput = question.querySelector<HTMLInputElement>('input[type="datetime-local"][id^="max_datetime_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if(questionLexicalState&&requiredCheckbox&&minDatetimeInput&&maxDatetimeInput&&stepInput) {
    const ret: GetSurveyDatetimeQuestionState = {
      type: 'survey-datetime',
      question: questionLexicalState, 
      required: Boolean(requiredCheckbox.checked===true),
      minDatetime: isValidDateString(minDatetimeInput.value) ? (minDatetimeInput.value):undefined,
      maxDatetime: isValidDateString(maxDatetimeInput.value) ? (maxDatetimeInput.value):undefined,
      step: parseFloat(stepInput.value),
      VERSION
    };
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function renderDatetimeSurveyQuestion(question: HTMLElement,state:GetSurveyDatetimeQuestionState) {
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
    const dateInput = getDatetimeInput('date_response',{min: state.minDatetime, max: state.maxDatetime});
    questionResponse.append(dateInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}


export {
  validateSurveyDatetimeCreateSurvey,
  getSurveyDatetimeCreateSurveyHTML,
  renderDatetimeSurveyQuestion,
  getCreateDatetimeSurveyQuestionInput,
};


