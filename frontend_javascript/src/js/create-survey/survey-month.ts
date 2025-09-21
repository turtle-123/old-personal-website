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

export type GetSurveyMonthQuestionState = {
  type: 'survey-month',
  question: string, 
  required: boolean,
  minMonth: string|undefined,
  maxMonth: string|undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyMonthState = {
  type: 'survey-month',
  month?: string
};

/* --------------------------- Helper functions ---------------------------------- */

const LAUNCH_PICKER_BUTTON = '<button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Time Input Menu"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarMonth"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"></path></svg></button>';
const monthToFullMonth = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
function getMonthInput(type:'min'|'max'|'date_response',obj?:{min?:string, max?:string},value?:string) {
  var innerText:string;
  var INPUT_ID: string; 
  if(type==='min') {
    innerText = 'Min Month:';
    INPUT_ID = 'min_month_'.concat(window.crypto.randomUUID());
  } else if (type==='max'){
    innerText = 'Max Month:';
    INPUT_ID = 'max_month_'.concat(window.crypto.randomUUID());
  } else {
    innerText = 'Input Month:';
    INPUT_ID = 'month_resp_'.concat(window.crypto.randomUUID());
  }
  const wrapperDiv = createElement({type:'div',className:'input-group block p-md'});
  const label = createElement({type:'label', attributes: {for: INPUT_ID}, innerText: innerText})
  const innerDiv = createElement({type:'div', className:'flex-row align-center gap-2 mt-1'});
  const input = createElement({ type: 'input', attributes: {type:'month', id: INPUT_ID, name: INPUT_ID, placeholder: 'yyyy-mm'}})
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
    const minMonth = [year,month].join('-');
    input.setAttribute('min',minMonth);
    if(type==='date_response') {
      const minMonthStr = monthToFullMonth[month-1] + ", " + String(year);
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Min Month: '}));
      helper.append(document.createTextNode(minMonthStr));
      wrapperDiv.append(helper);
    }
  }
  if(obj&&obj.max){
    const max = new Date(obj.max);
    const year =  max.getFullYear();
    const month = max.getMonth()+1;
    const maxMonth = [year,month].join('-');
    input.setAttribute('max',maxMonth);
    if(type==='date_response') {
      const maxMonthStr = monthToFullMonth[month-1] + ", " + String(year);
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Max Month: '}));
      helper.append(document.createTextNode(maxMonthStr));
      wrapperDiv.append(helper);
    }
  }
  return wrapperDiv;
}
/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyMonthCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyMonthQuestionState) {
  const minMonth = getMonthInput('min',undefined,questionState?.minMonth);
  const maxMonth = getMonthInput('max',undefined,questionState?.maxMonth);
  const stepID = 'step_'.concat(window.crypto.randomUUID());
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '1', required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const minInput = minMonth.querySelector<HTMLInputElement>('input');
  const maxInput = maxMonth.querySelector<HTMLInputElement>('input');
  const stepInput = step.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
    minInput.addEventListener('change',getHandleMinChange(minInput,maxInput));
    maxInput.addEventListener('change',getHandleMaxChange(minInput,maxInput));
  }
  step.classList.remove('mt-1');
  step.classList.add('p-md');
  const div = createElement({ type: 'div', className: 'block'});
  div.append(minMonth,maxMonth,step);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyMonthCreateSurvey(question:HTMLElement) {
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
  const minMonthInput = question.querySelector<HTMLInputElement>('input[type="month"][id^="min_month_"]');
  const maxMonthInput = question.querySelector<HTMLInputElement>('input[type="month"][id^="max_month_"]');
  if(!!!minMonthInput||!!!maxMonthInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  if (minMonthInput.value&&maxMonthInput.value) {
    const minMonth = new Date(minMonthInput.value);
    const maxMonth = new Date(maxMonthInput.value);
    if (minMonth>=maxMonth) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum month for this month survey question can not be later than the maximum month." }}))
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
function getCreateMonthSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minMonthInput = question.querySelector<HTMLInputElement>('input[type="month"][id^="min_month_"]');
  const maxMonthInput = question.querySelector<HTMLInputElement>('input[type="month"][id^="max_month_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if(questionLexicalState&&requiredCheckbox&&minMonthInput&&maxMonthInput&&stepInput) {
    const ret: GetSurveyMonthQuestionState = {
      type: 'survey-month',
      question: questionLexicalState, 
      required: Boolean(requiredCheckbox.checked===true),
      minMonth: isValidDateString(minMonthInput.value) ? (minMonthInput.value):undefined,
      maxMonth: isValidDateString(maxMonthInput.value) ? (maxMonthInput.value):undefined,
      step: parseFloat(stepInput.value),
      VERSION
    };
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderMonthSurveyQuestion(question: HTMLElement,state:GetSurveyMonthQuestionState) {
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
    const dateInput = getMonthInput('date_response',{min: state.minMonth, max: state.maxMonth});
    questionResponse.append(dateInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}


export {
  validateSurveyMonthCreateSurvey,
  getSurveyMonthCreateSurveyHTML,
  renderMonthSurveyQuestion,
  getCreateMonthSurveyQuestionInput,
};

