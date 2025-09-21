import { 
  createElement, 
  getDeleteOptionButton,  
  getQuestionLexicalStateFromWrapper,
  getClosestSurveyQuestion,
  getRadioHTML,
  getCheckboxHTML
} from "./sharedSurvey";
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion } from "../lexical-implementation";
import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from '../index';
const VERSION = 1;

export type GetSurveySelectionQuestionState = {
  type: 'survey-selection',
  question: string, 
  required: boolean,
  options: {option: string, selected: boolean, index: number}[],
  include_other: boolean,
  VERSION: number
};
export type RespondSurveySelectionState = {
  type: 'survey-selection',
  choice?: string
};

/* --------------------------- Helper Function --------------------------*/ 

function getTextInput(value?:string) {
  const uuid = window.crypto.randomUUID();
  const inputID = 'select_option_'.concat(uuid);
  const div = createElement({ type: "div", className: "text-input block medium" });
  const input = createElement({ type: "input", className: "medium", attributes: {name:inputID,id:inputID, maxlength: "100", minlength: "1", spellcheck: "true", placeholder: "Enter a value for the select option here..."}});
  if (value) {
    (input as HTMLInputElement).value = value;
  }
  div.append(input);
  return div;
  // const input = createElement({ })
}
function createSelect(options:{option: string, selected: boolean, index: number}[]) {
  const selectedOptionObj = options.filter((obj)=>obj.selected)?.[0];
  const selectedOption = selectedOptionObj?.option || undefined;
  const selectedOptionIndex = Number.isInteger(selectedOptionObj?.index) ? selectedOptionObj?.index : undefined;
  const minWidth = Math.min(options.map((obj) => obj.option).sort((a,b) => b.length-a.length)?.[0].length*17,400) || 200;
  const uuid = window.crypto.randomUUID();
  const label_id = 'label_'.concat(uuid);
  const dropdown_id = 'dropdown_'.concat(uuid);
  const input_id = 'select_input_'.concat(uuid);
  const labelDiv = createElement({ type: 'div', className:'block text-align-left', attributes: {id: label_id} });
  const selectWrapperDiv = createElement({ type: "div", className: "mt-1 flex-row justify-start"});
  const selectDiv = createElement({type:"div", className:"select"});
  const button = createElement({ type: "button", className: "select", attributes: { role: "combobox", "aria-haspopup": "listbox", "aria-controls": dropdown_id, "aria-labelledby": label_id, "data-popover": "", "data-pelem": "#".concat(dropdown_id), "data-click": "", "aria-expanded": "false", style: `min-width: ${minWidth}px;` }});
  const spanButton = createElement({ type: "span", className: "body1", innerText: selectedOption || "Select Option" });
  const svg = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>`;
  button.append(spanButton);
  button.insertAdjacentHTML("beforeend",svg);
  const dropdownDIV = createElement({type:"div", attributes: {"tabindex": "0", id: dropdown_id, role: "listbox", "data-placement": "bottom" }, className: "select-menu o-xs"});
  const input = createElement({ type: "input", attributes: {"type":"text", "hidden":"", value: selectedOptionIndex ? String(selectedOptionIndex) : '', name: input_id, id: input_id }});
  dropdownDIV.append(input);
  for (let i=0; i<options.length;i++) {
    const button = createElement({ type: "button", className: "select-option", attributes: {"tabindex": "-1", "data-val": String(options[i].index), "aria-selected": Boolean(selectedOptionIndex===i).toString(), role: "option", style: "width:100%;" }, innerText: options[i].option });
    dropdownDIV.append(button);
  }
  selectDiv.append(button,dropdownDIV);
  selectWrapperDiv.append(selectDiv);
  return [labelDiv,selectWrapperDiv];
}


/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveySelectionCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveySelectionQuestionState) {
  const questionID = question.id;
  const arr:HTMLElement[] = [];
  if (!!!questionState) {
    const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
    const wrapperDiv = createElement({
      type:'div',
      className: 'flex-row align-center justify-start p-md w-100 gap-1 mt-2',
      attributes: {
        id: wrapper_id,
        'data-option': '',
        'data-type': 'survey-paragraph'
      }
    });
    const radio = getRadioHTML('select_radio_')
    const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
    const textInput = getTextInput();
    grow1.append(textInput);
    wrapperDiv.append(radio,grow1,getDeleteOptionButton());
    arr.push(wrapperDiv);
  } else {
    for (let option of questionState.options) {
      const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
      const wrapperDiv = createElement({
        type:'div',
        className: 'flex-row align-center justify-start p-md w-100 gap-1 mt-2',
        attributes: {
          id: wrapper_id,
          'data-option': '',
          'data-type': 'survey-paragraph'
        }
      });
      const radio = getRadioHTML('select_radio_',option.selected);
      const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
      const textInput = getTextInput(option.option);
      grow1.append(textInput);
      wrapperDiv.append(radio,grow1,getDeleteOptionButton());
      arr.push(wrapperDiv);
    }
  }

  // Include Other Checkbox
  const div = createElement({type:'div', className:'flex-row justify-center', attributes: {'data-include-other': '', id: 'wrap_include_other_'.concat(window.crypto.randomUUID())}});
  const checkbox = createElement({ type: 'label', className: 'checkbox', style: 'margin: 0px 6px;' });
  
  const CONFIRM_RESPONSE_ID = "include_other_".concat(window.crypto.randomUUID());
  const span = document.createElement('span');
  span.innerText="Include Other";
  span.style.cssText = "font-size: 1.25rem!important;"
  const checkbox_attributes = {
    "type": "checkbox",
    "name":CONFIRM_RESPONSE_ID,
    "id":CONFIRM_RESPONSE_ID,
  } as any;
  if (questionState?.include_other) {
    checkbox_attributes.checked = true;
  }
  const checkboxInput = createElement({
    type: 'input',
    "className": "primary medium flex-row align-center",
    "attributes": checkbox_attributes
  });
  checkbox.append(checkboxInput,span);
  div.append(checkbox);
  arr.push(div);
  return arr;
}

/* Add Option */
function addSurveySelectionOption(this:HTMLButtonElement) {
  const question = getClosestSurveyQuestion(this);
  if (question) {
    const include_other_wrap = question.querySelector('div[id^="wrap_include_other_"]');
    if (include_other_wrap) {
      const wrapper_id = 'option_'.concat(window.crypto.randomUUID());
      const wrapperDiv = createElement({
        type:'div',
        className: 'flex-row align-center justify-start p-md w-100 gap-1 mt-2',
        attributes: {
          id: wrapper_id,
          'data-option': '',
          'data-type': 'survey-paragraph'
        }
      });
      const radio = getRadioHTML('select_radio_');
      const grow1 = createElement({ type:'div', attributes: {'data-option-middle':''}, className: "grow-1", style: "min-width: 0px;" });
      const textInput = getTextInput();
      grow1.append(textInput);
      wrapperDiv.append(radio,grow1,getDeleteOptionButton());
      include_other_wrap.insertAdjacentElement("beforebegin",wrapperDiv);
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED', { detail: { el: wrapperDiv } }));
    }
  }
}
/* Validate Created Survey Question */ 
/**
 * One option doe snot have to be selected due to the fact that the question is optional
 * @param question 
 * @returns 
 */
function validateSurveySelectionCreateSurvey(question:HTMLElement) {
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
  const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
  if (!!!options.length) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "There must be at least one option for multiple choice inputs." }}))
    return false;
  }
  var index = 0;
  for (let option of options) {
    const radio = option.querySelector<HTMLInputElement>('input[type="radio"]');
    const textInput = option.querySelector<HTMLInputElement>('input[name^="select_option_"]');
    if (!!!radio||!!!textInput) {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find one of the select options for this question." }}))
      return false;
    } else if (textInput.value==='') {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Every select option must have a non-empty value." }}))
      return false;
    }
    index+=1;
  }
  return true;
}
/* Get the created survey question Input */
function getCreateSelectionSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
  const includeOther = question.querySelector<HTMLInputElement>('input[id^="include_other_"]')
  if (questionLexicalState&&requiredCheckbox&&options.length>=1&&includeOther) {
    const ret:GetSurveySelectionQuestionState = {
      type: 'survey-selection',
      question: questionLexicalState, // stringified JSON string
      required: Boolean(requiredCheckbox.checked===true),
      include_other: includeOther.checked,
      options: [],
      VERSION
    };
    var index = 0;
    for (let option of options) {
      const radio = option.querySelector<HTMLInputElement>('input[type="radio"]');
      const textInput = option.querySelector<HTMLInputElement>('input[name^="select_option_"]');
      if (!!!radio||!!!textInput) return null;
      ret.options.push({ index, selected: radio.checked, option: textInput.value });
      index+=1;
    }
    return ret;
  }
  return null;
}

/* ------------ Submit Survey ------------- */
/* Render Question */
function renderSelectionSurveyQuestion(question: HTMLElement,state:GetSurveySelectionQuestionState) {
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
    const questionResponse = createElement({type:'div', attributes:{'data-pq-answer':'',}, className: 'block p-md'});
    question.append(questionResponse);
    /* ------ Insert Question Response Options/Actions -------------- */
    const select = createSelect(state.options);
    questionResponse.append(...select);
    if (state.include_other) {
      const row = createElement({ type: 'div', className: 'flex-row align-center justify-start gap-1 mt-3', attributes: { "data-other-option": "" } });
      const checkbox = getCheckboxHTML(false);
      const uuid = window.crypto.randomUUID();
      const inputID = 'other_option_'.concat(uuid);
      const div = createElement({ type: "div", className: "text-input block medium grow-1" });
      const input = createElement({ type: "input", className: "medium", attributes: {name:inputID,id:inputID, maxlength: "100", minlength: "1", spellcheck: "true", placeholder: "Enter other value..." }});
      div.append(input)
      row.append(checkbox,div);
      questionResponse.append(row);
    }
    /* ------ End -------------- */
  }
}

export {
  validateSurveySelectionCreateSurvey,
  getSurveySelectionCreateSurveyHTML,
  renderSelectionSurveyQuestion,
  getCreateSelectionSurveyQuestionInput,
  addSurveySelectionOption,
};