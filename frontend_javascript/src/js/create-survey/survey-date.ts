import {  
  createElement,
  getHandleMaxChange,
  getHandleMinChange,
  getHandleStepChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper,
  isValidDateString,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
export type GetSurveyDateQuestionState = {
  type: 'survey-date',
  question: string, 
  required: boolean,
  minDate: string | undefined,
  maxDate: string | undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyDateState = {
  type: 'survey-date',
  date?: string
};

const VERSION = 1;
const LAUNCH_PICKER_BUTTON = '<button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Date Input Menu"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="DateRange"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path></svg></button>';

/* ----------------------------- Helper Functions ---------------------------------- */
function getDateInput(type:'min'|'max'|'date_response',obj?:{min?:string, max?:string},value?:string) {
  var innerText:string;
  var INPUT_ID: string; 
  if(type==='min') {
    innerText = 'Min Date:';
    INPUT_ID = 'min_date_'.concat(window.crypto.randomUUID());
  } else if (type==='max'){
    innerText = 'Max Date:';
    INPUT_ID = 'max_date_'.concat(window.crypto.randomUUID());
  } else {
    innerText = 'Input Date:';
    INPUT_ID = 'date_resp_'.concat(window.crypto.randomUUID());
  }
  const wrapperDiv = createElement({type:'div',className:'input-group block p-md'});
  const label = createElement({type:'label', attributes: {for: INPUT_ID}, innerText: innerText})
  const innerDiv = createElement({type:'div', className:'flex-row align-center gap-2 mt-1'});
  const input = createElement({ type: 'input', attributes: {type:'date', id: INPUT_ID, name: INPUT_ID, placeholder: 'yyyy-mm-dd'}});
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
    const minDate  = [year,month,day].join('-');
    input.setAttribute('min',minDate);
    if(type==='date_response') {
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Min Date: '}));
      helper.append(document.createTextNode(minDate));
      wrapperDiv.append(helper);
    }
  }
  if(obj&&obj.max){
    const max = new Date(obj.max);
    const year = max.getFullYear();
    const month = max.getMonth()+1;
    const day = max.getDate();
    const maxDate = [year,month,day].join('-');
    input.setAttribute('max',maxDate);
    if(type==='date_response') {
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Max Date: '}));
      helper.append(document.createTextNode(maxDate));
      wrapperDiv.append(helper);
    }
  }
  return wrapperDiv;
}


/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyDateCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyDateQuestionState) {
  const minDate = getDateInput('min',undefined,questionState?.minDate);
  const maxDate = getDateInput('max',undefined,questionState?.maxDate);
  const stepID = 'step_'.concat(window.crypto.randomUUID());
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '1', required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const minInput = minDate.querySelector<HTMLInputElement>('input');
  const maxInput = maxDate.querySelector<HTMLInputElement>('input');
  const stepInput = step.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
    minInput.addEventListener('change',getHandleMinChange(minInput,maxInput));
    maxInput.addEventListener('change',getHandleMaxChange(minInput,maxInput));
  }
  step.classList.remove('mt-1');
  step.classList.add('p-md');
  const div = createElement({type:'div', style:'display: block;'});
  div.append(minDate,maxDate,step);
  return div;
} 
/* Validate Created Survey Question */ 
function validateSurveyDateCreateSurvey(question:HTMLElement) {
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
  const minDateInput = question.querySelector<HTMLInputElement>('input[type="date"][id^="min_date_"]');
  const maxDateInput = question.querySelector<HTMLInputElement>('input[type="date"][id^="max_date_"]');
  if(!!!minDateInput||!!!maxDateInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  if (minDateInput.value&&maxDateInput.value) {
    const minDate = new Date(minDateInput.value);
    const maxDate = new Date(maxDateInput.value);
    if (minDate>=maxDate) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum date for this date survey question can not be later than the maximum date." }}))
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
function getCreateDateSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minDateInput = question.querySelector<HTMLInputElement>('input[type="date"][id^="min_date_"]');
  const maxDateInput = question.querySelector<HTMLInputElement>('input[type="date"][id^="max_date_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if(questionLexicalState&&requiredCheckbox&&minDateInput&&maxDateInput&&stepInput) {
    const ret: GetSurveyDateQuestionState = {
      type: 'survey-date',
      question: questionLexicalState, 
      required: Boolean(requiredCheckbox.checked===true),
      minDate: isValidDateString(minDateInput.value) ? (minDateInput.value):undefined,
      maxDate: isValidDateString(maxDateInput.value) ? (maxDateInput.value):undefined,
      step: parseFloat(stepInput.value),
      VERSION
    };
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderDateSurveyQuestion(question: HTMLElement,state:GetSurveyDateQuestionState) {
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
    const dateInput = getDateInput('date_response',{min: state.minDate, max: state.maxDate});
    questionResponse.append(dateInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}



export {
  validateSurveyDateCreateSurvey,
  getSurveyDateCreateSurveyHTML,
  renderDateSurveyQuestion,
  getCreateDateSurveyQuestionInput,
};
