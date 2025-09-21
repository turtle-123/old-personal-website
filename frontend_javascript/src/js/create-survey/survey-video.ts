import {  
  createElement,
  getVideoInputHTML,
  getQuestionLexicalStateFromWrapper,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion, getRegisterSurveyOption } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyVideoQuestionState = {
  type: 'survey-video',
  question: string, 
  required: boolean,
  VERSION: number
}
export type RespondSurveyVideoState = {
  type: 'survey-time',
  video?: string
};

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyVideoCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyVideoQuestionState) {
  const videoInputElements = getVideoInputHTML(true);
  const div = createElement({ type:'div', className: 'block p-md'});
  div.append(...videoInputElements);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyVideoCreateSurvey(question:HTMLElement) {
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
  return true;
}
/* Get the created survey question Input */
function getCreateVideoSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  if (questionLexicalState&&requiredCheckbox) {
    const ret: GetSurveyVideoQuestionState = {
      type: 'survey-video',
      question: questionLexicalState, // stringified JSON string
      required: Boolean(requiredCheckbox.checked===true),
      VERSION
    };
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function validateSurveyVideoSubmitSurvey(question: HTMLElement,state:GetSurveyVideoQuestionState) {
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
    const videoInput = getVideoInputHTML(false);
    questionResponse.append(...videoInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}
/* Validate Survey Respondent Input */
function renderVideoSurveyQuestion(question: HTMLElement,state:GetSurveyVideoQuestionState) {
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
    const videoInput = getVideoInputHTML(false);
    questionResponse.append(...videoInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}


export {
  validateSurveyVideoCreateSurvey,
  validateSurveyVideoSubmitSurvey,
  getSurveyVideoCreateSurveyHTML,
  renderVideoSurveyQuestion,
  getCreateVideoSurveyQuestionInput,
};

