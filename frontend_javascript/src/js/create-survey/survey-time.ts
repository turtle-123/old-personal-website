import {  
  createElement,
  getHandleMaxChange,
  getHandleMinChange,
  getHandleStepChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyTimeQuestionState = {
  type: 'survey-time',
  question: string, 
  required: boolean,
  minTime: string|undefined,
  maxTime: string|undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyTimeState = {
  type: 'survey-time',
  time?: string
};

/* --------------------------- Helper functions ---------------------------------- */
const LAUNCH_PICKER_BUTTON = '<button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Time Input Menu"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="QueryBuilder"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg></button>';

function getTimeInput(type:'min'|'max'|'date_response',obj?:{min?:string, max?:string},defaultValue?:string) {
  var innerText:string;
  var INPUT_ID: string; 
  if(type==='min') {
    innerText = 'Min Time:';
    INPUT_ID = 'min_time_'.concat(window.crypto.randomUUID());
  } else if (type==='max'){
    innerText = 'Max Time:';
    INPUT_ID = 'max_time_'.concat(window.crypto.randomUUID());
  } else {
    innerText = 'Input Time:';
    INPUT_ID = 'time_resp_'.concat(window.crypto.randomUUID());
  }
  const wrapperDiv = createElement({type:'div',className:'input-group block mt-2'});
  const label = createElement({type:'label', attributes: {for: INPUT_ID}, innerText: innerText})
  const innerDiv = createElement({type:'div', className:'flex-row align-center gap-2 mt-1'});
  const input = createElement({ type: 'input', attributes: {type:'time', id: INPUT_ID, name: INPUT_ID, placeholder: 'hh:mm:ss', step: "1"}})
  if (defaultValue) {
    input.setAttribute("value",defaultValue);
  }
  innerDiv.insertAdjacentHTML("afterbegin",LAUNCH_PICKER_BUTTON);
  innerDiv.append(input);
  wrapperDiv.append(label,innerDiv);
  
  if(obj&&obj.min) {
    input.setAttribute('min',obj.min);
    if(type==='date_response') {
      const arr = obj.min.split(':').map((n)=>parseInt(n));
      const hoursMin = arr[0];
      const minutesMin = arr[1];
      const minTimeSeconds = arr?.[2] || 0;
      var minTimeString = String(hoursMin > 12 ? hoursMin-12 : hoursMin) + ":" + (minutesMin<10 ? "0":"") + String(minutesMin);
      if (minTimeSeconds!==0) {
        minTimeString += ":" + (minTimeSeconds<10 ? "0":"") + String(minTimeSeconds);
      }
      minTimeString+= hoursMin > 12 ? " PM" : " AM";
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Min Time: '}));
      helper.append(document.createTextNode(minTimeString));
      wrapperDiv.append(helper);
    }
  }
  if(obj&&obj.max){
    input.setAttribute('max',obj.max);
    if(type==='date_response') {
      const arr = obj.max.split(':').map((n)=>parseInt(n));
      const hoursMax = arr[0];
      const minutesMax = arr[1];
      const maxTimeSeconds = arr?.[2] || 0;
      var maxTimeString = String(hoursMax > 12 ? hoursMax-12 : hoursMax) + ":" + (minutesMax<10 ? "0":"") + String(minutesMax);
      if (maxTimeSeconds!==0) {
        maxTimeString += ":" + (maxTimeSeconds<10 ? "0":"") + String(maxTimeSeconds);
      }
      maxTimeString+= hoursMax > 12 ? " PM" : " AM";
      const helper = createElement({type:'p', className:'block body2 mt-1'});
      helper.append(createElement({type:'span',className:'bold', innerText:'Max Time: '}));
      helper.append(document.createTextNode(maxTimeString));
      wrapperDiv.append(helper);
    }
  }
  return wrapperDiv;
}

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
const isValidHour = (n:number) => Boolean(!!!isNaN(n)&&isFinite(n)&&n>=0&&n<=23);
const isValidMinute = (n:number) => Boolean(!!!isNaN(n)&&isFinite(n)&&n>=0&&n<=59);
const isValidSeconds = (n:number) => Boolean(!!!isNaN(n)&&isFinite(n)&&n>=0&&n<=59);
/* Create HTML */
function getSurveyTimeCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyTimeQuestionState) {
  const minTime = getTimeInput('min',undefined,questionState?.minTime);
  const maxTime = getTimeInput('max',undefined,questionState?.maxTime);
  const stepID = 'step_'.concat(window.crypto.randomUUID());
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '60', required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const minInput = minTime.querySelector<HTMLInputElement>('input');
  const maxInput = maxTime.querySelector<HTMLInputElement>('input');
  const stepInput = step.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
    minInput.addEventListener('change',getHandleMinChange(minInput,maxInput));
    maxInput.addEventListener('change',getHandleMaxChange(minInput,maxInput));
  }
  step.classList.remove('mt-1');
  step.classList.add('p-md');
  const div = createElement({type:'div', className:'p-lg block'});
  div.append(minTime,maxTime,step);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyTimeCreateSurvey(question:HTMLElement) {
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
  const minTimeInput = question.querySelector<HTMLInputElement>('input[type="time"][id^="min_time_"]');
  const maxTimeInput = question.querySelector<HTMLInputElement>('input[type="time"][id^="max_time_"]');
  if(!!!minTimeInput||!!!maxTimeInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid Survey Question" }}))
    return false;
  }
  if (minTimeInput.value&&maxTimeInput.value) {
    const [minHoursStr,minMinutesStr,minSecondsStr] = minTimeInput.value.split(':');
    const [maxHoursStr,maxMinutesStr,maxSecondsStr] = maxTimeInput.value.split(':');
    const [
      minHours,
      minMinutes,
      maxHours,
      maxMinutes,
      minSeconds,
      maxSeconds
    ] = [
      parseInt(minHoursStr),
      parseInt(minMinutesStr),
      parseInt(maxHoursStr),
      parseInt(maxMinutesStr),
      parseInt(minSecondsStr),
      parseInt(maxSecondsStr)
    ];
    if(!!!isValidMinute(minMinutes)||!!!isValidMinute(maxMinutes)||!!!isValidHour(minHours)||!!!isValidHour(maxHours)||!!!isValidSeconds(minSeconds)||!!!isValidSeconds(maxSeconds)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Please enter valid minimum and maximum time inputs." }}))
      return false;
    }
    const minTime = (minHours*3600) + (minMinutes*60) + minSeconds;
    const maxTime = (maxHours*3600) + (maxMinutes*60) + maxSeconds;
    if (minTime>=maxTime) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum time for this time survey question can not be later than the maximum time." }}))
      return false;
    }
  } else if (minTimeInput.value) {
    const [minHoursStr,minMinutesStr,minSecondsStr] = minTimeInput.value.split(':');
    const [minHours,minMinutes,minSeconds]= [parseInt(minHoursStr),parseInt(minMinutesStr),parseInt(minSecondsStr)];
    if(!!!isValidMinute(minMinutes)||!!!isValidHour(minHours)||!!!isValidSeconds(minSeconds)){
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Please enter a valid minimum time input." }}))
      return false;
    }
  } else if (maxTimeInput.value) {
    const [maxHoursStr,maxMinutesStr,maxSecondsStr] = maxTimeInput.value.split(':');
    const [maxHours,maxMinutes,maxSeconds]= [parseInt(maxHoursStr),parseInt(maxMinutesStr),parseInt(maxSecondsStr)];
    if(!!!isValidMinute(maxMinutes)||!!!isValidHour(maxHours)||!!!isValidSeconds(maxSeconds)){
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Please enter a valid maximum time input." }}))
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
function getCreateTimeSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minTimeInput = question.querySelector<HTMLInputElement>('input[type="time"][id^="min_time_"]');
  const maxTimeInput = question.querySelector<HTMLInputElement>('input[type="time"][id^="max_time_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="step_"]');
  if(questionLexicalState&&requiredCheckbox&&minTimeInput&&maxTimeInput&&stepInput) {
    const ret: GetSurveyTimeQuestionState = {
      type: 'survey-time',
      question: questionLexicalState, 
      required: Boolean(requiredCheckbox.checked===true),
      minTime: minTimeInput.value,
      maxTime: maxTimeInput.value,
      step: parseFloat(stepInput.value),
      VERSION
    };
    return ret;
  }
  return null;
}



/* ------------ Submit Survey ------------- */
/* Render Question */
function renderTimeSurveyQuestion(question: HTMLElement,state:GetSurveyTimeQuestionState) {
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
    const dateInput = getTimeInput('date_response',{min: state.minTime, max: state.maxTime });
    questionResponse.append(dateInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}


export {
  validateSurveyTimeCreateSurvey,
  getSurveyTimeCreateSurveyHTML,
  renderTimeSurveyQuestion,
  getCreateTimeSurveyQuestionInput,
};



