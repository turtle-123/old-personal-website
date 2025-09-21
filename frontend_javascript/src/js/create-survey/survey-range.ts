import {  
  createElement, 
  getNumberInput, 
  getSurveyRteHTML,
  getQuestionLexicalStateFromWrapper,
  getHandleStepChange,
  getClosestSurveyQuestion
} from "./sharedSurvey";
import { getEditorInstances } from "../lexical-implementation";
import { getRegisterSurveyQuestion, getRegisterSurveyOption } from "../lexical-implementation";
import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from '../index';
import { clearEditor } from "../lexical-implementation";
const VERSION = 1;

export type GetSurveyRangeQuestionState = {
  type: 'survey-range',
  question: string, 
  required: boolean,
  rangeMin: number,
  rangeMax: number,
  rangeStep: number, 
  rangePointDescriptions: {
    description: string,
    point: number
  }[],
  VERSION: number
};
export type RespondSurveyRangeState = {
  type: 'survey-range',
  response?: number
};

/* --------------------------- Helper functions ---------------------------------- */
function removePointDescription(this:HTMLButtonElement) {
  const rangeDescriptionWrapper = this.closest<HTMLDivElement>('div.data-range-description-wrapper');
  if(rangeDescriptionWrapper){
    const lexicalEditors = Array.from(rangeDescriptionWrapper.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'));
    if (lexicalEditors) {
      lexicalEditors.forEach((editor) => {
        const id = editor.id;
        if(id)clearEditor(id);
      })
    }
    rangeDescriptionWrapper.remove();
  }
}
/**
 * Inserts a Range Point Description after the provided element
 * @param insertAfter 
 */
function insertRangePointDescription(insertAfter:HTMLElement,lexicalState?:string,point?:number,info?:{min:string,step:string,max:string}) {
  var minValue:string;
  var maxValue:string;
  var stepValue:string;
  if (!!!info) {
    const question = getClosestSurveyQuestion(insertAfter);
    if (question) {
      const minQuestionInput = question.querySelector<HTMLInputElement>('input[id^="range_min_"]');
      const maxQuestionInput = question.querySelector<HTMLInputElement>('input[id^="range_max_"]');
      const stepQuestionInput = question.querySelector<HTMLInputElement>('input[id^="range_step_"]');
      minValue = minQuestionInput&&minQuestionInput.value!=='' ? minQuestionInput.value : '0';
      maxValue = maxQuestionInput&&maxQuestionInput.value!=='' ? maxQuestionInput.value : '0';
      stepValue = stepQuestionInput&&stepQuestionInput.value!=='' ? stepQuestionInput.value : '0';
    } else {
      return;
    }
  } else {
    minValue = info.min;
    maxValue = info.max;
    stepValue = info.step;
  }
  if (minValue&&maxValue&&stepValue) {
    const numInputID = 'range_point_'.concat(window.crypto.randomUUID());
    const newDescriptionWrapper = createElement({type:'div', className: 'data-range-description-wrapper' });
    const removePontDescriptionWrapper = createElement({ type:'div', className:'flex-row align-center justify-start w-100', attributes:{role:'toolbar'}, style:'margin-bottom:4px;' });
    const removePointDescriptionButton = document.createElement("button");
    removePointDescriptionButton.setAttribute('type','button');
    removePointDescriptionButton.className = "icon small filled error";
    removePointDescriptionButton.setAttribute('aria-label','Remove Range Point Description');
    removePointDescriptionButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Remove"><path d="M19 13H5v-2h14v2z"></path></svg>');
    removePointDescriptionButton.addEventListener('click',removePointDescription);
    removePontDescriptionWrapper.append(removePointDescriptionButton);
    const rangeDescriptionRTE = getSurveyRteHTML({  rteType: 'range-description' },undefined,lexicalState);
    const numberInput = getNumberInput({ id: numInputID, placeholder: 'Enter the point for the range point description...', label: 'Range Description Point:', defaultValue: typeof point ==="number" ? point.toString() : undefined , min: Number(minValue), max: Number(maxValue), step: Number(stepValue)});
    newDescriptionWrapper.append(removePontDescriptionWrapper);
    newDescriptionWrapper.insertAdjacentElement("beforeend",rangeDescriptionRTE);
    newDescriptionWrapper.append(numberInput);
    insertAfter.insertAdjacentElement("afterend",newDescriptionWrapper);
    return newDescriptionWrapper;
  }
}
function addRangePointDescriptionOnClick(this:HTMLButtonElement,e:Event) {
  
  const rangePointDescriptionsWrapper = this.closest<HTMLElement>('section');
  if(rangePointDescriptionsWrapper){  
    const descriptions = Array.from(rangePointDescriptionsWrapper.querySelectorAll<HTMLDivElement>('div.data-range-description-wrapper'));
    if (descriptions&&descriptions.length>=5) {
      this.setAttribute('disabled','');
      return;
    } else {
      this.removeAttribute('disabled');
      var insertAfter: HTMLElement|undefined = undefined;
      if (descriptions.length) {
        insertAfter = descriptions[descriptions.length-1];
      } else {
        if (this.parentElement instanceof HTMLDivElement) insertAfter = this.parentElement;
      }
      if (insertAfter){
        insertRangePointDescription(insertAfter);
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: { el: rangePointDescriptionsWrapper } }))
      }
    }
  }
}
const insertRangePointDescriptionSection = (wrapperEl:HTMLElement) => {
  const wrapper = document.createElement('section');
  wrapper.setAttribute('data-range-descriptions','');
  wrapper.className='mt-3 block';
  wrapper.style.setProperty('border-top','2px solid var(--text-primary);');
  const rangeDescriptionsHeader = createElement({ type: 'p', className: 'bold bb h5 mt-1', innerText: 'Range Point Descriptions:'});
  const actionsDiv = document.createElement('div');
  actionsDiv.setAttribute('role','toolbar');
  actionsDiv.className="mt-1 flex-row justify-end";
  const addRangePointDescription = document.createElement('button');
  addRangePointDescription.className='icon-text medium filled info';
  addRangePointDescription.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AddBox"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"></path></svg>');
  addRangePointDescription.append(createElement({type:'span', innerText: 'ADD DESCRIPTION'}));
  addRangePointDescription.addEventListener('click',addRangePointDescriptionOnClick);
  actionsDiv.append(addRangePointDescription);
  wrapper.append(rangeDescriptionsHeader,actionsDiv);
  wrapperEl.insertAdjacentElement("afterend",wrapper);
  return wrapper;
}

function addRemoveRangeDescriptionsButtonOnClick(this:HTMLButtonElement,e:Event) {
  const parent = this.parentElement;
  if (parent instanceof HTMLDivElement) {
    const nextElementSibling = parent.nextElementSibling;
    if (nextElementSibling&&nextElementSibling.nodeName==='SECTION'){
      const lexicalWrappers = Array.from(nextElementSibling.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'))
      lexicalWrappers.forEach((wrapper)=>{
        const id = wrapper.id;
        if (id) clearEditor(id);
      });
      (nextElementSibling as HTMLElement).remove();
      const thisSpan = this.querySelector<HTMLSpanElement>('span');
      if(thisSpan) thisSpan.innerText = 'ADD POINT DESCRIPTIONS';
      const svg = this.querySelector('svg');
      if (svg) {
        svg.remove();
        this.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>');
      }
      this.classList.remove('warning');
      this.classList.add('primary');
    } else {
      const thisSpan = this.querySelector<HTMLSpanElement>('span');
      if(thisSpan) thisSpan.innerText = 'REMOVE POINT DESCRIPTIONS';
      const svg = this.querySelector('svg');
      if (svg) {
        svg.remove();
        this.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Remove"><path d="M19 13H5v-2h14v2z"></path></svg>');
      }
      this.classList.remove('primary');
      this.classList.add('warning');
      insertRangePointDescriptionSection(parent);
    }
  }
}

function onChangeRangeStep(this:HTMLInputElement,e:Event) {
  const question = getClosestSurveyQuestion(this);
  if (question&&this.value!=='') {
    const numberInputs = Array.from(question.querySelectorAll<HTMLInputElement>('input[type="number"][id^="range_point_"]'));
    const maxInput = question.querySelector<HTMLInputElement>('input[id^="range_max_"]');
    const minInput = question.querySelector<HTMLInputElement>('input[id^="range_min_"]');
    numberInputs.forEach((el) => {
      el.step = this.value;
    })
    if (maxInput&&minInput) {
      maxInput.step = this.value;
      minInput.step = this.value;
    }
  }
}
function onChangeRangeMin(this:HTMLInputElement,e:Event) {
  const question = getClosestSurveyQuestion(this);
  if (question&&this.value!=='') {
    const numberInputs = Array.from(question.querySelectorAll<HTMLInputElement>('input[type="number"][id^="range_point_"]'));
    const maxInput = question.querySelector<HTMLInputElement>('input[id^="range_max_"]');
    const stepInput = question.querySelector<HTMLInputElement>('input[id^="range_step_"]');
    numberInputs.forEach((el) => {
      el.min = this.value;
    })
    if (maxInput&&stepInput) {
      maxInput.min = this.value;
      stepInput.min = this.value;
    }
  }
}
function onChangeRangeMax(this:HTMLInputElement,e:Event) {
  const question = getClosestSurveyQuestion(this);
  if (question&&this.value!=='') {
    const numberInputs = Array.from(question.querySelectorAll<HTMLInputElement>('input[type="number"][id^="range_point_"]'));
    const stepInput = question.querySelector<HTMLInputElement>('input[id^="range_step_"]');
    const minInput = question.querySelector<HTMLInputElement>('input[id^="range_min_"]');
    numberInputs.forEach((el) => {
      el.max = this.value;
    })
    if (stepInput&&minInput) {
      stepInput.max = this.value;
      minInput.max = this.value;
    }
  }
}

/* ----------------------------- Main ---------------------------------- */
/* ------------ Creation of Survey ------------- */
/* Create HTML */
function getSurveyRangeCreateSurveyHTML(question: HTMLElement,questionState?:GetSurveyRangeQuestionState) {
  const rangeID = 'range_resp_'.concat(window.crypto.randomUUID());
  const rangeMinimumID = 'range_min_'.concat(window.crypto.randomUUID());
  const rangeMaximumID = 'range_max_'.concat(window.crypto.randomUUID());
  const rangeStepID = 'range_step_'.concat(window.crypto.randomUUID());
  const wrapper = createElement({'type':'div', className:'p-lg'});
  const labelEl = createElement({type:'label',attributes:{ hidden: '', for: rangeID}, className:'mt-2', innerText: rangeID})
  const rangeInputWrapper = createElement({type:'div',attributes:{'data-range-option':''},style:"position:relative;"});
  const rangeInput = createElement({type:'input',attributes:{type:'range',id:rangeID,name:rangeID, disabled: ''}, style: "background-size: 50% 100%;"});
  rangeInput.setAttribute('min','0');
  rangeInput.setAttribute('max','100');
  rangeInput.setAttribute('step','1');
  if (questionState) {
    rangeInput.setAttribute('min',questionState.rangeMin.toString());
    rangeInput.setAttribute('max',questionState.rangeMax.toString());
    rangeInput.setAttribute('step',questionState.rangeStep.toString());
  }
  rangeInputWrapper.append(rangeInput);
  const rangeMinimum = getNumberInput({ id: rangeMinimumID, label: 'Range Input Minimum:', defaultValue: questionState?.rangeMin ? questionState.rangeMin.toString() : '0', placeholder: 'Enter the minimum value for the range input...'});
  const rangeMaximum = getNumberInput({ id: rangeMaximumID, label: 'Range Input Maximum:', defaultValue:questionState?.rangeMax ? questionState.rangeMax.toString() : '100', placeholder: 'Enter the maximum value for the range input...'})
  const rangeStep = getNumberInput({ id: rangeStepID, label: 'Range Input Step:', defaultValue:questionState?.rangeStep ? questionState.rangeStep.toString() : '1', min: 0, placeholder: 'Enter the step for the range input...'});
  const rangeStepInput = rangeStep.querySelector<HTMLInputElement>('input');
  const rangeMaxInput = rangeMaximum.querySelector<HTMLInputElement>('input');
  const rangeMinInput = rangeMinimum.querySelector<HTMLInputElement>('input');
  if (rangeStepInput&&rangeMaxInput&&rangeMinInput) {
    rangeStepInput.addEventListener("change",getHandleStepChange(rangeStepInput,rangeMinInput,rangeMaxInput));
    rangeStepInput.addEventListener('change',onChangeRangeStep);
    rangeMinInput.addEventListener('change',onChangeRangeMin);
    rangeMaxInput.addEventListener('change',onChangeRangeMax);
  }

  wrapper.append(labelEl,rangeInputWrapper,rangeMinimum,rangeMaximum,rangeStep);

  // Handle With Question State
  if (!!!questionState||!!!questionState.rangePointDescriptions.length) {
    const rangeDescriptionButtonDiv = createElement({ type:'div', className:'flex-row align-center justify-end mt-2', attributes:{role:'toolbar'}});
    const addRemoveRangeDescriptionsButton = document.createElement('button');
    addRemoveRangeDescriptionsButton.className="filled primary icon-text medium";
    addRemoveRangeDescriptionsButton.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>');
    addRemoveRangeDescriptionsButton.append(createElement({type:'span', innerText: 'ADD POINT DESCRIPTIONS', style: 'max-width: none!important;'}));
    addRemoveRangeDescriptionsButton.addEventListener('click',addRemoveRangeDescriptionsButtonOnClick);
    rangeDescriptionButtonDiv.append(addRemoveRangeDescriptionsButton);
    wrapper.append(rangeDescriptionButtonDiv);
  } else {
    const rangeDescriptionButtonDiv = createElement({ type:'div', className:'flex-row align-center justify-end mt-2', attributes:{role:'toolbar'}});
    const removeRemoveRangeDescriptionsButton = document.createElement('button');
    if (questionState.rangePointDescriptions.length>=5) {
      removeRemoveRangeDescriptionsButton.setAttribute('disabled','');
    }
    removeRemoveRangeDescriptionsButton.className="filled warning icon-text medium";
    removeRemoveRangeDescriptionsButton.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Remove"><path d="M19 13H5v-2h14v2z"></path></svg>');
    removeRemoveRangeDescriptionsButton.append(createElement({type:'span', innerText: 'REMOVE POINT DESCRIPTIONS', style: 'max-width: none!important;'}));
    removeRemoveRangeDescriptionsButton.addEventListener('click',addRemoveRangeDescriptionsButtonOnClick);
    rangeDescriptionButtonDiv.append(removeRemoveRangeDescriptionsButton);
    const addRangeDescriptionsSection = insertRangePointDescriptionSection(rangeDescriptionButtonDiv);
    if (addRangeDescriptionsSection instanceof HTMLElement) {
      var insertAfter:any = addRangeDescriptionsSection.lastElementChild;
      for (let i = 0; i < questionState.rangePointDescriptions.length; i++) {
        if (insertAfter instanceof HTMLElement) {
          insertAfter = insertRangePointDescription(insertAfter,questionState.rangePointDescriptions[i].description,questionState.rangePointDescriptions[i].point, { min: String(questionState.rangeMin), max: String(questionState.rangeMax), step: String(questionState.rangeStep) });
        } else {
          break;
        }
      }
    }
    wrapper.append(rangeDescriptionButtonDiv,addRangeDescriptionsSection);
  }
  
  
  return wrapper;
}
/* Validate Created Survey Question */ 
function validateSurveyRangeCreateSurvey(question:HTMLElement) {
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
  const rangeMinimum = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_min_"]');
  const rangeMaximum = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_max_"]');
  const rangeStep = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_step_"]');
  const pointDescriptions = Array.from(question.querySelectorAll<HTMLDivElement>('div.data-range-description-wrapper')); 
  if(!!!rangeMinimum||!!!rangeMaximum||!!!rangeStep||rangeMinimum.value===''||rangeMaximum.value===''||rangeStep.value==='') {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Range Minimum, range maximum, or range step not valid." }}))
    return false;
  }
  if (parseFloat(rangeMinimum.value) >= parseFloat(rangeMaximum.value)) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The minimum value for the range input must be less than the maximum value for the range input." }}))
    return false;
  } 
  if (parseFloat(rangeStep.value) < 0 || parseFloat(rangeStep.value) > (parseFloat(rangeMaximum.value)-parseFloat(rangeMinimum.value))) {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "The step of the range input must be at least one and it must be less than the difference between the maximum and minimum values of the range." }}))
    return false;
  }
  if (pointDescriptions.length) {
    const rangeMinimumValue = parseFloat(rangeMinimum.value);
    const rangeMaximumValue = parseFloat(rangeMaximum.value);
    const stepValue = parseFloat(rangeStep.value);
    for (let divElement of pointDescriptions) {
      const numberInput = divElement.querySelector<HTMLInputElement>('input[type="number"][id^="range_point_"]');
      const lexicalWrapper = divElement.querySelector<HTMLDivElement>('div.lexical-wrapper');
      
      if (!!!numberInput) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Could not find the number input for the range point description." }}))
        return false;
      }
      if(numberInput.value==='') {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Each range point description must have a point associated with it." }}))
        return false;
      }
      const numberInputValue = parseFloat(numberInput.value);
      if (numberInputValue < rangeMinimumValue || numberInputValue > rangeMaximumValue || ((numberInputValue - rangeMinimumValue) % stepValue !== 0)) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Each range point description must have a valid point associated with it. The point must be greater than or equal to the minimum value for the range input, less than or equal to the maximum value, and be able to be reached by the user." }}))
        return false;
      }
      if (!!!lexicalWrapper) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the description for this range point description." }}))
        return false;
      }
      const id = lexicalWrapper.id;
      if (!!!id||!!!getEditorInstances()[id]) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the description for this range point description." }}))
        return false;
      }
    }
  }
  return true;
}
/* Get the created survey question Input */
function getCreateRangeSurveyQuestionInput(question: HTMLElement) {
  const questionLexicalState = getQuestionLexicalStateFromWrapper(question);
  const requiredCheckbox = question.querySelector<HTMLInputElement>('input[type="checkbox"][id^="survey-required-checkbox"]');
  const rangeMinimum = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_min_"]');
  const rangeMaximum = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_max_"]');
  const rangeStep = question.querySelector<HTMLInputElement>('input[type="number"][id^="range_step_"]');
  const pointDescriptions = Array.from(question.querySelectorAll<HTMLDivElement>('div.data-range-description-wrapper'));
  if(questionLexicalState&&requiredCheckbox&&rangeMinimum&&rangeMaximum&&rangeStep) {
    const required = Boolean(requiredCheckbox.checked===true);
    const rangeMinimumValue = parseFloat(rangeMinimum.value);
    const rangeMaximumValue = parseFloat(rangeMaximum.value);
    const rangeStepValue = parseFloat(rangeStep.value);
    const ret: GetSurveyRangeQuestionState = {
      type:'survey-range',
      question: questionLexicalState,
      required,
      rangeMin: rangeMinimumValue,
      rangeMax: rangeMaximumValue,
      rangeStep : rangeStepValue,
      rangePointDescriptions: [],
      VERSION
    };
    if (pointDescriptions.length) {
      for (let divElement of pointDescriptions) {
        const numberInput = divElement.querySelector<HTMLInputElement>('input[type="number"][id^="range_point_"]');
        const lexicalWrapper = divElement.querySelector<HTMLDivElement>('div.lexical-wrapper');
        if(numberInput&&lexicalWrapper) {
          const numberInputValue = parseFloat(numberInput.value);
          const id = lexicalWrapper.id;
          if (id) {
            const editorInstance = getEditorInstances()[id];
            if (!!!editorInstance) return null;
            ret.rangePointDescriptions.push({
              point: numberInputValue,
              description: JSON.stringify(editorInstance.getEditorState().toJSON())
            });
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
    }
    return ret;
  }
  return null;
}
/* ------------ Submit Survey ------------- */
/* Render Question */
function renderRangeSurveyQuestion(question: HTMLElement,state:GetSurveyRangeQuestionState) {
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
    const rangeID = 'rng_'.concat(window.crypto.randomUUID());
    const label = createElement({type:'label', attributes:{for: rangeID}, className: 'bold body1'});
    questionResponse.append(label);
    const divWrapper = createElement({type:'div',className:'flex-row gap-3 align-center justify-start'});
    const rangeInputWrapper = createElement({type:'div', style:'position:relative;padding: 7px 0px;', className:'grow-1' });
    const rangeInput = createElement({type:'input',attributes:{type:'range',min:state.rangeMin.toString(),max:state.rangeMax.toString(),step:state.rangeStep.toString(),id:rangeID,name:rangeID}});
    rangeInputWrapper.append(rangeInput);
    const output = createElement({type:'output',attributes:{for:rangeID}, className: 'h6 fw-regular' })
    divWrapper.append(rangeInputWrapper,output);
    questionResponse.append(divWrapper);
    question.append(questionResponse);

    const registerSurveyOption = getRegisterSurveyOption();
    if(registerSurveyOption) {
      for (let descriptionObj of state.rangePointDescriptions) {
        const { point, description } = descriptionObj;
        const floatingMenuID = 'rpdfm_'.concat(window.crypto.randomUUID());
        const floatingMenuLexicalWrapperID = 'rpdfm_'.concat(window.crypto.randomUUID());
        const attributes:{[s:string]:string} = {
          "aria-describedby":floatingMenuID,
          "data-popover":"",
          "data-pelem": "#".concat(floatingMenuID),
          "tabindex": "1",
          "data-force-close": "",
          "data-click": ""
        };
        const percentage = 100*(point-state.rangeMin)/(state.rangeMax-state.rangeMin);
        var styleText = 'left:'.concat(percentage.toString()).concat('%;');
        const circleDiv = createElement({type:'div', className:'rpd-point', style:styleText, attributes});
        var placement = 'top';
        if (percentage<34) {
          placement = 'top-start';
        } else if (percentage>68) {
          placement = 'top-end';
        }
        const floatingMenu = createElement({type:'div', className:'floating-menu o-xs', style:'padding:4px;border-radius:4px; background-color: var(--background);', attributes:{"data-placement":placement, id: floatingMenuID, role: 'tooltip'}});
        const floatingMenuLexicalWrapper = createElement({type:'div', className:'lexical-wrapper', attributes:{id:floatingMenuLexicalWrapperID, "data-click-capture": "", 'data-editable': 'false' }});
        floatingMenu.append(floatingMenuLexicalWrapper);
        rangeInputWrapper.append(circleDiv);
        questionResponse.append(floatingMenu);
        registerSurveyOption(floatingMenuLexicalWrapper);
        const editorInstancesNew = getEditorInstances();
        if (editorInstancesNew[floatingMenuLexicalWrapperID]) {
          const parsedEditorState = editorInstancesNew[floatingMenuLexicalWrapperID].parseEditorState(JSON.parse(description));
          editorInstancesNew[floatingMenuLexicalWrapperID].setEditorState(parsedEditorState);
          editorInstancesNew[floatingMenuLexicalWrapperID].setEditable(false);
        }
      }
    }
  }
}

export {
  validateSurveyRangeCreateSurvey,
  getSurveyRangeCreateSurveyHTML,
  renderRangeSurveyQuestion,
  getCreateRangeSurveyQuestionInput,
};
