import { VALID_HEX_REGEX } from "../lexical-folder/lexicalLexical";
import {  
  createElement,
  getDefaultTextColor,
  getQuestionLexicalStateFromWrapper,
} from "./sharedSurvey";
import { DISPATCH_SNACKBAR_CED } from '../index';
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyColorQuestionState = {
  type: 'survey-color',
  question: string, 
  required: boolean,
  defaultColor: string,
  VERSION: number
};
export type RespondSurveyColorState = {
  type: 'survey-color',
  color?: string
};

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyColorCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyColorQuestionState) {
  const defaultColor = questionState ? questionState.defaultColor : getDefaultTextColor();
  const inputID = 'def_color_'.concat(window.crypto.randomUUID());
  const wrapperDiv = createElement({type:'div',className:'block p-md'});
  const label = createElement({type:'label',className:'body1 bold', attributes: {for: inputID}, innerText: 'Default Color:'});
  const interiorDiv = createElement({type:'div', className: 'flex-row justify-begin align-center gap-2'});
  const input = createElement({type:'input',attributes: {id: inputID, name: inputID, value: defaultColor, type:'color'}, style: "margin-top: 2px;"})
  const span = createElement({type:'span',className:'body1',innerText:defaultColor});
  interiorDiv.append(input,span);
  wrapperDiv.append(label,interiorDiv);
  return wrapperDiv;
}
/* Validate Created Survey Question */ 
function validateSurveyColorCreateSurvey(question: HTMLElement) {
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
  const colorInput = question.querySelector<HTMLInputElement>('input[type="color"]');
  if (!!!colorInput) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the color input for this color-survey question." }}))
    return false;
  } else if (!!!VALID_HEX_REGEX.test(colorInput.value)) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid default color input value." }}))
    return false;
  }
  return true;
}
/* Get the created survey question Input */
function getCreateColorSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const colorInput = question.querySelector<HTMLInputElement>('input[type="color"][id^="def_color_"]');
  if(questionLexicalState&&requiredCheckbox&&colorInput) {
    if(!!!VALID_HEX_REGEX.test(colorInput.value)) return null;
    const ret:GetSurveyColorQuestionState = {
      type: 'survey-color',
      question: questionLexicalState, // stringified JSON string
      required: Boolean(requiredCheckbox.checked===true),
      defaultColor: colorInput.value,
      VERSION
    };
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderColorSurveyQuestion(question: HTMLElement,state:GetSurveyColorQuestionState) {
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
    const inputID = 'color_'.concat(window.crypto.randomUUID());
    const label = createElement({type:'label',className:'body1 bold', attributes: {for: inputID}, innerText: 'Color Input:'});
    const interiorDiv = createElement({type:'div', className: 'flex-row justify-begin align-center gap-2'});
    const input = createElement({type:'input',attributes: {id: inputID, name: inputID, value: state.defaultColor, type:'color'}, style: "margin-top: 2px;"})
    const span = createElement({type:'span',className:'body1',innerText:state.defaultColor});
    interiorDiv.append(input,span);
    questionResponse.append(label,interiorDiv);
    /* ------ End -------------- */
    question.append(questionResponse);
  }
}

export {
  validateSurveyColorCreateSurvey,
  getSurveyColorCreateSurveyHTML,
  renderColorSurveyQuestion,
  getCreateColorSurveyQuestionInput,
};

