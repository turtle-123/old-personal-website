import { 
  createElement, 
  getAudioInputHTML,
  getQuestionLexicalStateFromWrapper,  
} from "./sharedSurvey";
import { getRegisterSurveyQuestion, getEditorInstances } from "../lexical-implementation";
import { DISPATCH_SNACKBAR_CED } from '../index';
const VERSION = 1;

export type GetSurveyAudioQuestionState = {
  type: 'survey-audio',
  question: string, 
  required: boolean,
  VERSION: number
};
export type RespondSurveyAudioState = {
  type: 'survey-audio',
  audio?: string
};



/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyAudioCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyAudioQuestionState) {
  const audioInputElements = getAudioInputHTML(true);
  const div = createElement({ type:'div', className: 'block p-md'});
  div.append(...audioInputElements);
  return div;
}
/* Validate Created Survey Question */ 
function validateSurveyAudioCreateSurvey(question:HTMLElement) {
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
function getCreateAudioSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  if (questionLexicalState&&requiredCheckbox) {
    const ret:GetSurveyAudioQuestionState = {
      type: 'survey-audio',
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
function renderAudioSurveyQuestion(question:HTMLElement,state: GetSurveyAudioQuestionState) {
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
    const audioInput = getAudioInputHTML(false);
    questionResponse.append(...audioInput);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}


export {
  validateSurveyAudioCreateSurvey,
  getSurveyAudioCreateSurveyHTML,
  renderAudioSurveyQuestion,
  getCreateAudioSurveyQuestionInput,
};

