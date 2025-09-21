import {  
  createElement, 
  getSurveyRteHTML,
  getQuestionLexicalStateFromWrapper,  
} from "./sharedSurvey";
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
import { DISPATCH_SNACKBAR_CED } from '../index';
const VERSION = 1;

export type GetSurveyShortBlogQuestionState = {
  type: 'survey-short-blog',
  question: string, 
  required: boolean,
  VERSION: number
};
export type RespondSurveyShortBlogState = {
  type: 'survey-short-blog',
  response?: string
};

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyShortBlogCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyShortBlogQuestionState) {
  const wrapper = createElement({ type:'div', className:'p-lg block'});
  const p = createElement({ type: 'p', style:'margin-bottom:6px;', className:'bold body1', innerText: 'Response:'})
  const surveyRte = getSurveyRteHTML({  rteType: 'survey-short-blog'});
  wrapper.append(p);
  wrapper.insertAdjacentElement("beforeend",surveyRte);
  return wrapper;
}
/* Validate Created Survey Question */ 
function validateSurveyShortBlogCreateSurvey(question:HTMLElement) {
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
function getCreateShortBlogSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  if (questionLexicalState&&requiredCheckbox) {
    const ret:GetSurveyShortBlogQuestionState = {
      type: 'survey-short-blog',
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
function renderShortBlogSurveyQuestion(question: HTMLElement,state:GetSurveyShortBlogQuestionState) {
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
    const lexicalWrapperUserResponse = getSurveyRteHTML({rteType:'survey-short-blog'},false);
    questionResponse.insertAdjacentElement("beforeend",lexicalWrapperUserResponse);
    question.append(questionResponse);
  }
}


export {
  validateSurveyShortBlogCreateSurvey,
  getSurveyShortBlogCreateSurveyHTML,
  renderShortBlogSurveyQuestion,
  getCreateShortBlogSurveyQuestionInput,
};
