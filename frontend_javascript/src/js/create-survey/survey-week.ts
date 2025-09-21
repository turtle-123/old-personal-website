import {  
  createElement,
  getHandleStepChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper,
  isValidDateString,
  isValidWeekString
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyWeekQuestionState = {
  type: 'survey-week',
  question: string, 
  required: boolean,
  minWeek: string|undefined,
  maxWeek: string|undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyWeekState = {
  type: 'survey-week',
  week?: string
};

/* --------------------------- Helper functions ---------------------------------- */

const LAUNCH_PICKER_BUTTON = '<button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Week Menu"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="CalendarViewWeek"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-7 2h2.5v12H13V6zm-2 12H8.5V6H11v12zM4 6h2.5v12H4V6zm16 12h-2.5V6H20v12z"></path></svg></button>';


function getWeekInput(type:'min'|'max'|'date_response',obj?:{min?:string, max?:string},value?:string) {
  var innerText:string;
  var INPUT_ID: string; 
  if(type==='min') {
    innerText = 'Min Week:';
    INPUT_ID = 'min_week_'.concat(window.crypto.randomUUID());
  } else if (type==='max'){
    innerText = 'Max Week:';
    INPUT_ID = 'max_week_'.concat(window.crypto.randomUUID());
  } else {
    innerText = 'Input Week:';
    INPUT_ID = 'week_resp_'.concat(window.crypto.randomUUID());
  }
  const wrapperDiv = createElement({type:'div',className:'input-group block p-md'});
  const label = createElement({type:'label', attributes: {for: INPUT_ID}, innerText: innerText})
  const innerDiv = createElement({type:'div', className:'flex-row align-center gap-2 mt-1'});
  const input = createElement({ type: 'input', attributes: {type:'week', id: INPUT_ID, name: INPUT_ID, placeholder: 'yyyy-mm'}})
  if (value) {
    (input as HTMLInputElement).setAttribute('value',value);
  }
  innerDiv.insertAdjacentHTML("afterbegin",LAUNCH_PICKER_BUTTON);
  innerDiv.append(input);
  wrapperDiv.append(label,innerDiv);
  if(obj&&obj.min) {
    const [yearStr,weekStr] = obj.min.split('-'); 
    const week = weekStr.replace('W','');
    input.setAttribute('min',obj.min);
    if(type==='date_response') {
      const minWeekStr = 'Week ' + week + ', ' + yearStr;
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Min Week: '}));
      helper.append(document.createTextNode(minWeekStr));
      wrapperDiv.append(helper);
    }
  }
  if(obj&&obj.max){
    const [yearStr,weekStr] = obj.max.split('-'); 
    const week = weekStr.replace('W','');
    input.setAttribute('min',obj.max);
    if(type==='date_response') {
      const maxWeekStr = 'Week ' + week + ', ' + yearStr;
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Max Week: '}));
      helper.append(document.createTextNode(maxWeekStr));
      wrapperDiv.append(helper);
    }
  }
  return wrapperDiv;
}
/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyWeekCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyWeekQuestionState) {
  const minWeek = getWeekInput('min',undefined,questionState?.minWeek);
  const maxWeek = getWeekInput('max',undefined,questionState?.maxWeek);
  const stepID = 'step_'.concat(window.crypto.randomUUID());
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '60', required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const minInput = minWeek.querySelector<HTMLInputElement>('input');
  const maxInput = maxWeek.querySelector<HTMLInputElement>('input');
  const stepInput = step.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
  }
  step.classList.remove('mt-1');
  step.classList.add('p-md');
  const div = createElement({ type: 'div', className: 'block'});
  div.append(minWeek,maxWeek,step);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyWeekCreateSurvey(question:HTMLElement) {
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
  const minWeekInput = question.querySelector<HTMLInputElement>('input[type="week"][id^="min_week_"]');
  const maxWeekInput = question.querySelector<HTMLInputElement>('input[type="week"][id^="max_week_"]');
  if(!!!minWeekInput||!!!maxWeekInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  if (minWeekInput.value&&maxWeekInput.value) {
    const [minYearStr,minWeekStr] = minWeekInput.value.split('-');
    const [maxYearStr,maxWeekStr] = maxWeekInput.value.split('-');
    const minWeek = parseInt(minWeekStr.replace('W',''))
    const minYear = parseInt(minYearStr);
    const maxWeek = parseInt(maxWeekStr.replace('W',''))
    const maxYear = parseInt(maxYearStr);
    const IS_INVALID = Boolean(minYear > maxYear || (minYear <= maxYear && minWeek > maxWeek));
    if (IS_INVALID) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum week for this week survey question can not be later than the maximum week." }}))
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
function getCreateWeekSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minWeekInput = question.querySelector<HTMLInputElement>('input[type="week"][id^="min_week_"]');
  const maxWeekInput = question.querySelector<HTMLInputElement>('input[type="week"][id^="max_week_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if(questionLexicalState&&requiredCheckbox&&minWeekInput&&maxWeekInput&&stepInput) {
    const ret: GetSurveyWeekQuestionState = {
      type: 'survey-week',
      question: questionLexicalState, 
      required: Boolean(requiredCheckbox.checked===true),
      minWeek: isValidWeekString(minWeekInput.value) ? (minWeekInput.value):undefined,
      maxWeek: isValidWeekString(maxWeekInput.value) ? (maxWeekInput.value):undefined,
      step: parseFloat(stepInput.value),
      VERSION
    };
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderWeekSurveyQuestion(question: HTMLElement,state:GetSurveyWeekQuestionState) {
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
    const dateInput = getWeekInput('date_response',{min: state.minWeek, max: state.maxWeek});
    questionResponse.append(dateInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}

export {
  validateSurveyWeekCreateSurvey,
  getSurveyWeekCreateSurveyHTML,
  renderWeekSurveyQuestion,
  getCreateWeekSurveyQuestionInput,
};

