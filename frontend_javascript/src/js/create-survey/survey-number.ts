import {  
  createElement,
  getHandleMaxChange,
  getHandleMinChange,
  getHandleStepChange,
  getNumberInput,
  getQuestionLexicalStateFromWrapper,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyNumberQuestionState = {
  type: 'survey-number',
  question: string, 
  required: boolean,
  min: number|undefined,
  max: number|undefined,
  step: number,
  VERSION: number
};
export type RespondSurveyNumberState = {
  type: 'survey-number',
  response?: string
};


/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyNumberCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyNumberQuestionState) {
  const numberID = 'survey_num_'.concat(window.crypto.randomUUID());
  const minLengthID = 'survey_num_min_'.concat(window.crypto.randomUUID());
  const maxLengthID = 'survey_num_max_'.concat(window.crypto.randomUUID());
  const stepID = 'survey_num_step_'.concat(window.crypto.randomUUID());
  const wrapperDiv = createElement({type:'div',className:'block p-md'});
  const numInput = getNumberInput({id:numberID,label:'Response', disabled:true, placeholder: 'User Response would go here ...' });
  const min = getNumberInput({ id: minLengthID, min: 0, label: 'Minimum:', placeholder:'Enter the minimum value for the user response...', defaultValue: questionState?.min ? String(questionState.min) : undefined });
  const max = getNumberInput({ id: maxLengthID, min: 0, label: 'Maximum:', placeholder:'Enter the maximum value for the user response...', defaultValue: questionState?.max ? String(questionState.max) : undefined})
  const step = getNumberInput({ id: stepID, defaultValue: questionState?.step ? String(questionState.step) : '1', min: 0, required: true, label: 'Step:', placeholder:'Enter the step value for the user response...'});
  const stepInput = step.querySelector<HTMLInputElement>('input');
  const maxInput = max.querySelector<HTMLInputElement>('input');
  const minInput = min.querySelector<HTMLInputElement>('input');
  if (stepInput&&maxInput&&minInput) {
    stepInput.addEventListener('change',getHandleStepChange(stepInput,minInput,maxInput));
    minInput.addEventListener('change',getHandleMinChange(minInput,maxInput));
    maxInput.addEventListener('change',getHandleMaxChange(minInput,maxInput));
  }

  wrapperDiv.append(numInput,min,max,step);
  return wrapperDiv;
}
/* Validate Created Survey Question */ 
function validateSurveyNumberCreateSurvey(question:HTMLElement) {
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
  const minInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_min_"]');
  const maxInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_max_"]');
  const stepInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_step_"]');
  if(!!!minInput||!!!maxInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find whether this question is required." }}))
    return false;
  }
  if(minInput.value!==''&&maxInput.value!=='') {
    if (Number(minInput.value)>Number(maxInput.value)) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The required minimum value of the user response must not be greater than the required maximum value of the user response." }}))
      return false;
    }
  }
  if (!!!stepInput||isNaN(parseFloat(stepInput.value))||parseFloat(stepInput.value)<=0) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The step input value is invalid. Step input must be greater than 0." }}))
      return false;
  }
  

  return true;
}
/* Get the created survey question Input */
function getCreateNumberSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const minLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_min_"]');
  const maxLengthInput = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_max_"]');
  const step = question.querySelector<HTMLInputElement>('input[type="number"][id^="survey_num_step_"]');
  if(questionLexicalState&&requiredCheckbox&&minLengthInput&&maxLengthInput&&step) {
    const ret:GetSurveyNumberQuestionState = {
      type:'survey-number',
      question: questionLexicalState,
      required: Boolean(requiredCheckbox.checked===true),
      min: minLengthInput.value!==''?Number(minLengthInput.value):undefined,
      max: maxLengthInput.value!==''?Number(maxLengthInput.value):undefined,
      step: parseFloat(step.value),
      VERSION
    };
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function renderNumberSurveyQuestion(question: HTMLElement,state:GetSurveyNumberQuestionState) {
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
    const inputID = 'urnum_'.concat(window.crypto.randomUUID());
    const numberInput = getNumberInput({ label:'Response:', placeholder:'Enter your response here...', id: inputID, min:state.min,max:state.max, step: state.step, disabled:false, })
    questionResponse.append(numberInput);
    if (typeof state.min ==='number' && isFinite(state.min)) {
      const helperMin = createElement({type:'p', className:'block body2 mt-1'});
      helperMin.append(createElement({type:'span',className:'bold', innerText:'Minimum: '}));
      helperMin.append(document.createTextNode(state.min.toString()));
      questionResponse.append(helperMin);
    }
    if (typeof state.max ==='number' && isFinite(state.max)) {
      const helperMax = createElement({type:'p', className:'block body2 mt-1'});
      helperMax.append(createElement({type:'span',className:'bold', innerText:'Maximum: '}));
      helperMax.append(document.createTextNode(state.max.toString()));
      questionResponse.append(helperMax);
    }
    const helperStep = createElement({type:'p', className:'block body2 mt-1'});
    helperStep.append(createElement({type:'span',className:'bold', innerText:'Step: '}));
    helperStep.append(document.createTextNode(state.step.toString()));
    questionResponse.append(helperStep);

    /* ------ End -------------- */
    question.append(questionResponse);
  }
}

export {
  validateSurveyNumberCreateSurvey,
  getSurveyNumberCreateSurveyHTML,
  renderNumberSurveyQuestion,
  getCreateNumberSurveyQuestionInput,
};



