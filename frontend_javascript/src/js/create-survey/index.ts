import { clearEditor, registerFullEditor, setEditorState } from "../lexical-implementation";
import { isTouchDevice, closeDialog, openDialog, onNewContentLoaded, getCsrfToken, openLoadingDialog, getAndOpenLoadingDialog, closeLoadingDialog } from "../shared";


import { getEditorInstances } from "../lexical-implementation";
import { 
  getAudioInputHTML,
  getImageInputHTML,
  getVideoInputHTML,
  getSurveyRteHTML,
  updateSurvey,
  handleQuestionTypeButtonClick,
  handleQuestionTypeFormChange,
  handleQuestionTypeFormSubmit,

  getSurveyQuestionHTML,

  getCurrentSurveyQuestion,
  getCurrentSurveyOption,
  setCurrentSurveyOptionID,
  setCurrentSurveyQuestionID,
  getCurrentSurveyQuestionID,
  getCurrentSurveyOptionID,
  getTypeMenu,
  getQuestionTypeDialog,
  setCurrentSurveyQuestion,
  setCurrentSurveyOption,

  onOptionTypeButtonClick,
  OPTION_TYPES,
  GetQuestionAny,
  POLL_ACTIONS_OBJECT,
  createElement,
  isValidDateString,
} from "./sharedSurvey";

import { DISPATCH_SNACKBAR_CED, HIDE_OPEN_POPOVER_CED, NEW_CONTENT_LOADED_CED } from "..";




const VALID_POLL_QUESTION_TYPES = new Set([
  'survey-short-answer',
  'survey-paragraph',
  'survey-short-blog',
  'survey-multiple-choice',
  'survey-checkbox',
  'survey-range',
  'survey-date',
  'survey-datetime',
  'survey-time',
  'survey-image',
  'survey-audio',
  'survey-video',
  'survey-month',
  'survey-color',
  'survey-ranking'
] as const);
const QUESTION_TYPES_ADD_OPTION = new Set([
  'survey-multiple-choice',
  'survey-checkbox',
  'survey-ranking'
] as const);
var SURVEY_STATE:string|null = null;


/*------------------------------------ Get HTML ------------------------------------- */



/* ----------------------------------------- Question Functions ------------------------------------------------ */
/**
 * Delete survey question on button click
 * 
 * @param this 
 * @param e 
 */
function deleteSurveyQuestion(this:HTMLButtonElement,e:Event) {
  const sectionWrapper = this.closest('section');
  if(sectionWrapper) {
    const getNewQuestionIndicator = sectionWrapper.nextElementSibling; 
    const lexicalEditors = Array.from(sectionWrapper.querySelectorAll('div[data-rich-text-editor]'));
    lexicalEditors.forEach((el)=>{
      const lexicalWrapper = el.closest('div.lexical-wrapper');
      if (lexicalWrapper) {
        const id = lexicalWrapper.id;
        if (id) clearEditor(id);
      }
    })
    const questionID = sectionWrapper.id;
    const optionIDs = new Set(Array.from(sectionWrapper.querySelectorAll('div[data-option]')).map((obj)=>obj.id).filter((val)=>val!==null) as string[]);
    if (questionID&&getCurrentSurveyQuestionID()===questionID) setCurrentSurveyQuestionID(undefined);
    if (optionIDs.has(String(getCurrentSurveyOptionID()))) setCurrentSurveyOptionID(undefined);
    sectionWrapper.remove();
    if (getNewQuestionIndicator && getNewQuestionIndicator.nodeName==="DIV"&&getNewQuestionIndicator.hasAttribute('data-get-question-indicator')) getNewQuestionIndicator.remove();
    updateSurvey();
  }
}


/**
 * Hide and Show the survey question on click
 * @param this 
 * @param e 
 */
function hideAndShowSurveyQuestion(this:HTMLButtonElement,e:Event) {
  const question = this.closest<HTMLElement>('section.survey-question');
  const svg = this.querySelector('svg');
  const span = this.querySelector('span');
  if(question&&svg&&span) {
    const editSurveyQuestion = question.querySelector('div[data-edit-survey-question]');
    if(editSurveyQuestion) {
      const IS_HIDDEN = editSurveyQuestion.hasAttribute('hidden');
      if(IS_HIDDEN) {
        editSurveyQuestion.removeAttribute('hidden');
        span.innerText = "COLLAPSE";
        svg.style.cssText="";
        this.classList.add('warning');
        this.classList.remove('success');
      } else {
        editSurveyQuestion.setAttribute('hidden','');
        span.innerText = "SHOW";
        svg.style.cssText="transform: rotate(180deg);";
        this.classList.add('success');
        this.classList.remove('warning');
      }
    } 
  }
}

/*------------------------------------------------ Option Functions ------------------------------------------ */


/**
 * Change the type of the button
 * @param this 
 */
function changeOptionType(this:HTMLButtonElement) {
  const newOptionType = this.getAttribute('data-val');
  const option = getCurrentSurveyOption();
  const question = getCurrentSurveyQuestion();
  if(option&&question&&OPTION_TYPES.has(newOptionType as any)) {
    const oldOptionType = option.getAttribute('data-type');
    const questionTypeEl = question.querySelector<HTMLButtonElement>('button[data-question-type]');
    if(questionTypeEl&&OPTION_TYPES.has(oldOptionType as any)){
      const questionType = questionTypeEl.getAttribute('data-val');
      if(QUESTION_TYPES_ADD_OPTION.has(questionType as any)){
        const middleOptionDiv = option.querySelector<HTMLDivElement>('div[data-option-middle]');
        if(middleOptionDiv) {
          if(oldOptionType==="survey-paragraph") {
            const lexicalWrapper = middleOptionDiv.querySelector<HTMLDivElement>('div.lexical-wrapper');
            if(lexicalWrapper) {
              const id = lexicalWrapper.id;
              if (id) clearEditor(id);
            }
          }
          middleOptionDiv.innerHTML='';
          if((newOptionType as "audio" | "video" | "image" | "survey-paragraph")==="survey-paragraph") {
            middleOptionDiv.insertAdjacentElement("beforeend",getSurveyRteHTML({ rteType: 'survey-option'}))
            middleOptionDiv.style.cssText="min-width: 0px;"
            option.setAttribute('data-type','survey-paragraph');
          } else if ((newOptionType as "audio" | "video" | "image" | "survey-paragraph")==="audio") {
            middleOptionDiv.append(...getAudioInputHTML());
            option.setAttribute('data-type','audio');
            middleOptionDiv.style.cssText="min-width: 0px; padding-left: 10px;";
          } else if ((newOptionType as "audio" | "video" | "image" | "survey-paragraph")==="video") {
            middleOptionDiv.append(...getVideoInputHTML());
            option.setAttribute('data-type','video');
            middleOptionDiv.style.cssText="min-width: 0px; padding-left: 10px;";
          } else if ((newOptionType as "audio" | "video" | "image" | "survey-paragraph")==="image") {
            middleOptionDiv.append(...getImageInputHTML());
            option.setAttribute('data-type','image');
            middleOptionDiv.style.cssText="min-width: 0px; padding-left: 10px;";
          }
          document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:question}}));
          document.dispatchEvent(new CustomEvent<HIDE_OPEN_POPOVER_CED>('HIDE_OPEN_POPOVER',{detail:{str:'#change-survey-option-type-menu'}}));
          const typeMenu = getTypeMenu();
          if (typeMenu) {
            typeMenu.style.display='none';
          }
          updateSurvey();
        }
      }
    }
  }
}
function deleteOption(this:HTMLButtonElement,e:Event){
  const question = this.closest('section.survey-question');
  const option = this.closest<HTMLDivElement>('div[data-option]');
  if(option&&question){
    const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
    if (options.length >= 2) {
      const lexicalEditors = Array.from(option.querySelectorAll('div.lexical-wrapper'));
      lexicalEditors.forEach((editor) => {
        const id = editor.id;
        if (id) clearEditor(id);
      })
      option.remove();
      onSurveyLoad();
    }
  }
}

/*-------------------------------------------- Survey Functions --------------------------------------------*/
function preventDispatchSnackbar(e:CustomEvent) {
  return true;
}
/**
 * Write Once Run anywhere (WORA)
 * @returns 
 */
function validateSurveyAndGetQuestionStates(preventDispatchScroll:boolean=false) {
  const surveyTitle = document.getElementById('survey-title') as HTMLInputElement|null;
  const surveyUUIDEl = document.getElementById('survey-uuid') as HTMLInputElement|null;
  const surveyDescription = getEditorInstances()['survey-description'];
  const surveyDescriptionState = JSON.stringify(surveyDescription.getEditorState().toJSON());
  const surveyImage = document.querySelector('input[name="survey-image-text"]') as HTMLInputElement|null;
  const surveyQuestions = Array.from(document.querySelectorAll<HTMLElement>('section.survey-question[data-drag-container="survey-questions-container"]'));
  const deadlineInput = document.getElementById('survey-deadline') as HTMLInputElement|null;
  
  if (!!!surveyTitle||!!!surveyTitle.checkValidity()) {
    if (surveyTitle&&!!!preventDispatchScroll) surveyTitle.scrollIntoView();
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid survey title. The survey title must be between 1 and 100 characters in length." }}));
    return;
  }
  if (!!!surveyDescription) {
    const descriptionEl = document.getElementById('survey-description');
    if (descriptionEl&&!!!preventDispatchScroll) descriptionEl.scrollIntoView();
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the survey description." }}));
    return;
  }
  if (!!!surveyImage||!!!surveyImage.value.startsWith('https://image.storething.org/frankmbrown')) {
    if (surveyImage&&!!!preventDispatchScroll) surveyImage.scrollIntoView();
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find the survey image. An image for the survey is required." }}));
    return;
  }
  if (!!!surveyQuestions.length) {
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find any questions for the survey. At least 1 question is required." }}));
    return;
  }
  if (!!!surveyUUIDEl||!!!surveyUUIDEl.value) {
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find survey unique identifier." }}));
    return;
  }
  if (!!!deadlineInput||!!!isValidDateString(deadlineInput.value)||!!!deadlineInput.checkValidity()) {
    if (deadlineInput&&!!!preventDispatchScroll) deadlineInput.scrollIntoView();
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Invalid survey deadline value." }}));
    return;
  }
  const questions:GetQuestionAny[] = [];
  for (let question of surveyQuestions) {
    const questionTypeButton = question.querySelector<HTMLButtonElement>('button[data-question-type]');
    if (!!!questionTypeButton) {
      if (!!!preventDispatchScroll) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unable to find out what kind of question this question is." }}));
        question.classList.add('invalid-q');
        question.scrollIntoView();
      }
      return;
    }
    const type = questionTypeButton.getAttribute('data-val');
    if (!!!POLL_ACTIONS_OBJECT.hasOwnProperty(String(type))) {
      if (!!!preventDispatchScroll) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Unrecognized question type." }}));
        question.classList.add('invalid-q');
        question.scrollIntoView();
      }
      return;
    }
    const isValid = POLL_ACTIONS_OBJECT[String(type) as keyof typeof POLL_ACTIONS_OBJECT].validateCreate(question);
    if (!!!isValid) {
      if (!!!preventDispatchScroll) {
        question.classList.add('invalid-q');
        question.scrollIntoView();
      }
      return;
    }
    if (preventDispatchScroll) document.addEventListener("DISPATCH_SNACKBAR",preventDispatchSnackbar,true);
    const questionState = POLL_ACTIONS_OBJECT[String(type) as keyof typeof POLL_ACTIONS_OBJECT].getCreateInput(question);
    if (preventDispatchScroll) document.removeEventListener("DISPATCH_SNACKBAR",preventDispatchSnackbar,true);
    if (!!!questionState) {
      if (!!!preventDispatchScroll)  {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "Something went wrong getting this question state." }}));
        question.classList.add('invalid-q');
        question.scrollIntoView();
      }
      return;
    }
    if (question.classList.contains('invalid-q')) question.classList.remove('invalid-q');
    questions.push(questionState);
  }
  const AT_LEAST_ONE_REQUIRED = questions.filter((obj) => obj.required).length>=1;
  if (!!!AT_LEAST_ONE_REQUIRED) {
    if (!!!preventDispatchScroll) document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR", { detail: { severity: "error", message: "At least one survey question must be required." }}));
    return;
  }
  return { title: surveyTitle.value, description: surveyDescriptionState, image: surveyImage.value, questions, survey_uuid: surveyUUIDEl.value, deadline: deadlineInput.value };
}

/**
 * Preview the Survey
 */
function onPreviewSurvey() {
  const res = validateSurveyAndGetQuestionStates();
  const pageHeadSection = document.querySelector<HTMLElement>('section#page-head'); 
  const requiredSurveyAttributesSection = document.querySelector<HTMLElement>('section#required-survey-attributes'); 
  const surveyQuestionsWrapperSection = document.querySelector<HTMLElement>('section#survey-questions-wrapper'); 
  const outputForm = document.querySelector<HTMLOutputElement>('output[form="survey-form"]');
  const editorInstances = getEditorInstances();
  if (res&&pageHeadSection&&requiredSurveyAttributesSection&&surveyQuestionsWrapperSection&&outputForm) {
    if (!!!outputForm.hasAttribute('hidden')) {
      return;
    }
    const { title, description, questions } = res;
    const h1 = createElement({type:'h1',className:'page-title',innerText: title});
    const descID = 'id_'.concat(window.crypto.randomUUID());
    const descriptionEditor = createElement({type:'div', className: 'lexical-wrapper example-render hz-scroll mt-2', attributes: { 'data-rich-text-editor': '', 'data-type': 'full', "data-editable": "false", id: descID  }});
    registerFullEditor(descriptionEditor,false);
    const parsedEditorState = editorInstances[descID].parseEditorState(JSON.parse(description));
    editorInstances[descID].setEditorState(parsedEditorState);
    editorInstances[descID].setEditable(false);
    const div = document.createElement('div');
    div.className="block mt-2";
    const editSurveyButton = createElement({ type: "button", className: "filled warning icon-text medium" });
    editSurveyButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Edit"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>');
    editSurveyButton.append(new Text("EDIT SURVEY"));
    editSurveyButton.addEventListener('click',onEditSurvey);
    div.append(editSurveyButton);
    outputForm.append(h1,div,descriptionEditor);
    for (let i=0;i<questions.length;i++) {
      const question = questions[i];
      const type = question.type;
      const el = createElement({ type: 'section', className: 'mt-3 survey-question', attributes: { id: 'question-'.concat(String(i+1)) } });
      const div = createElement({ type: 'div', className: 'flex-row justify-between align-center navbar-sticky-transition', style: 'background-color: var(--background); opacity: 1; position: sticky; top: var(--navbar-height); z-index: 2;' });
      const h2 = createElement({ type: 'h2', className: 'h3 bold', innerText: 'Question '.concat(String(i+1)) });
      const questionWrapperID = 'qw_'.concat(window.crypto.randomUUID());
      const hideShow = `<button type="button" class="small icon-text text warning" data-hide-show="" data-el="#${questionWrapperID}">
  <svg data-arrow="" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
  <span data-hide="">HIDE</span>
  <span data-show="" hidden="">SHOW</span>
</button>`;

      div.append(h2);
      div.insertAdjacentHTML("beforeend",hideShow);
      el.append(div);
      const questionBodyWrapper = createElement({ type: 'div', attributes: { id: questionWrapperID } });
      POLL_ACTIONS_OBJECT[type].render(questionBodyWrapper,question as any);
      if (!!!question.required) {
        const confirmResponse = createElement({ type: 'div', className: 'survey-question-footer' });
        const checkbox = createElement({ type: 'label', className: 'checkbox', style: 'margin: 0px 6px;'});
        const CONFIRM_RESPONSE_ID = "confirm_response_question_".concat(String(i+1));
        const span = document.createElement('span');
        span.innerText="Confirm Response";
        span.style.cssText = "font-size:1.25rem!important;"
        checkbox.append(createElement({
          type: 'input',
          "className": "primary medium flex-row align-center",
          "attributes": {
            "type": "checkbox",
            "name":CONFIRM_RESPONSE_ID,
            "id":CONFIRM_RESPONSE_ID,
            'checked': ''
          }
        }),span);
        confirmResponse.append(checkbox);
        questionBodyWrapper.append(confirmResponse);
      }
      el.append(questionBodyWrapper);
      outputForm.append(el);
    }
    [pageHeadSection,requiredSurveyAttributesSection,surveyQuestionsWrapperSection].forEach((el) => el.setAttribute('hidden',''));
    outputForm.removeAttribute('hidden');
    document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:outputForm}}));
    window.scrollTo(0,0);
  }
}

function onEditSurvey() {
  const pageHeadSection = document.querySelector<HTMLElement>('section#page-head'); 
  const requiredSurveyAttributesSection = document.querySelector<HTMLElement>('section#required-survey-attributes'); 
  const surveyQuestionsWrapperSection = document.querySelector<HTMLElement>('section#survey-questions-wrapper'); 
  const outputForm = document.querySelector<HTMLOutputElement>('output[form="survey-form"]');
  const editorInstances = getEditorInstances();
  if(pageHeadSection&&requiredSurveyAttributesSection&&surveyQuestionsWrapperSection&&outputForm){
    const lexicalEditors = outputForm.querySelectorAll<HTMLDivElement>('div.lexical-wrapper');
    lexicalEditors.forEach((editor)=>{
      const id = editor.id;
      if (id&&editorInstances[id]) clearEditor(id);
    })
    outputForm.setAttribute('hidden','');
    pageHeadSection.removeAttribute('hidden');
    requiredSurveyAttributesSection.removeAttribute('hidden');
    surveyQuestionsWrapperSection.removeAttribute('hidden');
    outputForm.innerHTML='';
  }
}

function onSubmitSurvey(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  const res = validateSurveyAndGetQuestionStates();
  if(res){
    const { title, description, questions, image, survey_uuid, deadline } = res;
    const body = JSON.stringify({title,description,questions,image,survey_uuid,deadline});
    getAndOpenLoadingDialog('Submitting Survey...');
    fetch('/projects/create-a-survey',{ method: 'POST', body, headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken()} })
    .then((res)=> {
      if (res.status!==200) throw new Error('Network request');
      closeLoadingDialog();
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "success", message: "Successfully submitted the survey." }}));
      setTimeout(() => {
        if (window.htmx) {
          const el = document.createElement('div');
          const main = document.getElementById('PAGE');
          if (main) main.append(el);
          el.setAttribute('hx-get','/surveys');
          el.setAttribute('hx-target','#PAGE');
          el.setAttribute('hx-push-url','true');
          el.setAttribute('hx-indicator','#page-transition-progress');
          el.setAttribute('hx-trigger','click');
          window.htmx.process(el);
          window.htmx.trigger(el,'click');
        }
      },1000); 
    })
    .catch((error)=>{
      console.error(error);
      closeLoadingDialog();
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong saving the survey." }}));
    })
  }
}

function onSaveSurvey() {
  const surveyState = validateSurveyAndGetQuestionStates();
  if (surveyState) {
    const { title, description, image, questions, survey_uuid, deadline } = surveyState;
    const body = { title, description, image, questions, survey_uuid, deadline };
    getAndOpenLoadingDialog('Saving Survey...');
    fetch(`/api/save-survey`,{ method: 'POST', headers: { "Content-Type": "application/json",  'X-CSRF-Token': getCsrfToken() }, body: JSON.stringify(body)})
    .then((res) => {
      if (res.status!==200) throw new Error("Something went wrong saving the survey state.");
      closeLoadingDialog();
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"success",message:"Successfully saved survey! You can re-download it later using the DOWNLOAD button near the bottom of the page."}}));
      SURVEY_STATE = JSON.stringify(surveyState,null,'');
    })
    .catch((e) => {
      closeLoadingDialog();
      console.error(e);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"error",message:"Something went wrong saving the survey state."}}));
    })
  }
}

function onDownloadSurvey(state:{ title: string, description: any, image: string, questions:GetQuestionAny[], survey_uuid: string, deadline: string }) {
  const surveyTitle = document.getElementById('survey-title') as HTMLInputElement|null;
  const surveyDescription = getEditorInstances()['survey-description'];
  const surveyImage = document.getElementById('survey-image') as HTMLInputElement|null;
  const questionsContainer = document.getElementById('survey-questions-container') as HTMLDivElement|null;
  const surveyUUIDEl = document.getElementById('survey-uuid') as HTMLInputElement|null;
  const deadlineInput = document.getElementById('survey-deadline') as HTMLInputElement|null;

  if (surveyTitle&&surveyDescription&&surveyImage&&questionsContainer&&surveyUUIDEl&&deadlineInput) {
    surveyTitle.value = state.title;
    surveyUUIDEl.value = state.survey_uuid;
    deadlineInput.value = state.deadline;
    const surveyImageOutput = document.querySelector('output[survey-image]') as HTMLOutputElement|null;
    if (surveyImageOutput) {
      surveyImageOutput.innerHTML='';
    }
    surveyImage.setAttribute('data-default-value',JSON.stringify([{ src: state.image, shortDescription: state.title + " - Survey Image"}]));
    const parsed = surveyDescription.parseEditorState(state.description);
    surveyDescription.setEditorState(parsed);
    const lexicalEditors = questionsContainer.querySelectorAll<HTMLDivElement>('div.lexical-wrapper');
    lexicalEditors.forEach((editor)=>{
      const id = editor.id;
      if (id&&getEditorInstances()[id]) clearEditor(id);
    })
    questionsContainer.innerHTML = '';
    state.questions.forEach((q) => {
      if (POLL_ACTIONS_OBJECT[q.type]) {
        const question = getSurveyQuestionHTML(q.type,q);
        questionsContainer.append(question);
      }
    })
    document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{detail:{el:questionsContainer}}));
    
  }
}


/*---------------------------------------- on Survey Load Main ------------------------------------------ */
var CONFIRM_NAVIGATE:{element: HTMLElement, page: string}|undefined = undefined;
function handleWarnNavigateAwaySurvey(this:HTMLElement,e:Event) {
    if (SURVEY_STATE) {
      const state = validateSurveyAndGetQuestionStates(true);
      if (state!==undefined) {
        const s = JSON.stringify(state,null,'');
        if (s.length===SURVEY_STATE.length) return;
      }
    }
    e.stopPropagation();
    const dialog = document.getElementById('confirm-dialog') as HTMLDivElement|null;
    if (dialog) {
      CONFIRM_NAVIGATE = {page: window.location.pathname, element: this };
      const confirmButton = dialog.querySelector<HTMLButtonElement>(`button[data-confirm]`);
      const cancelButton = dialog.querySelector<HTMLButtonElement>(`button[data-cancel]`);
      if (confirmButton&&cancelButton) {
        confirmButton.addEventListener('click',handleConfirmNavigateClick);
        cancelButton.addEventListener('click',handleCancelNavigateClick);
        openDialog(dialog);
      }
    }
}
function handleConfirmNavigateClick(this:HTMLButtonElement,e:Event) {
  const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
  if (dialog && CONFIRM_NAVIGATE) {
    if (window.htmx) window.htmx.trigger(CONFIRM_NAVIGATE.element,'click');
    closeDialog(dialog);
  }
}
/**
 * When user cancels the navigate away process
 * @param this 
 * @param e 
 */
function handleCancelNavigateClick(this:HTMLButtonElement,e:Event) {
  const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
  if (dialog){
    CONFIRM_NAVIGATE = undefined;
    closeDialog(dialog);
  }	
}
function onBeforeUnloadWarnSurvey(e:Event) {
  if (SURVEY_STATE) {
    const state = validateSurveyAndGetQuestionStates(true);
    if (state!==undefined) {
      const s = JSON.stringify(state,null,'');
      if (s.length===SURVEY_STATE.length) return;
    }
  }
  // Recommended
  e.preventDefault();    
  // Included for legacy support, e.g. Chrome/Edge < 119
  e.returnValue = true;
  return true; 
}

function handleDownloadSurveySubmit(this:HTMLFormElement,e:SubmitEvent) {
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement;
  e.preventDefault();
  e.stopPropagation();
  const checked = this.querySelector<HTMLInputElement>('input:checked');
  if (!!!checked) {
    closeDialog(dialog);
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"error",message:"You must select a survey to download."}}));
    return;
  } 
  const value = checked.value;
  if (!!!Number.isInteger(parseInt(value))) {
    closeDialog(dialog);
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"error",message:"Something went wrong downloading the survey."}}));
    return;
  }
  fetch(`/api/download-survey/${encodeURIComponent(value)}`,{ headers: { "Content-Type": "application/json",  'X-CSRF-Token': getCsrfToken() }})
  .then((res) => {
    if (res.status!==200) {
      throw new Error("Something went wrong downloading the survey.");
    } 
    return res.json();
  })
  .then((res) => {
    getAndOpenLoadingDialog("Updating survey...");
    try {
      onDownloadSurvey(res);
      closeLoadingDialog();
      closeDialog(dialog);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"success",message:"Successfully downloaded saved survey!"}}));
    } catch (e) {
      console.error(e);
      closeLoadingDialog();
      closeDialog(dialog);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"error",message:"Something went wrong downloading the saved survey!"}}));
    }
    const SURVEY_STATE_TEMP = validateSurveyAndGetQuestionStates();
    SURVEY_STATE = SURVEY_STATE_TEMP===undefined?null:JSON.stringify(SURVEY_STATE_TEMP,null,'');
    closeDialog(dialog);
  })
  .catch((e) => {
    console.error(e);
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{detail:{severity:"error",message:"Something went wrong downloading the survey."}}));
  })
}

function handleSaveKeypress(e:KeyboardEvent) {
  if (e.key.toLowerCase()==="s"&&e.ctrlKey) {
    e.preventDefault();
    onSaveSurvey();
  }
}

const LINKS_QUERY_SELECTOR = `[hx-push-url="true"]:not([data-force-navigate]):not([type="submit"]), [href^="/"]:not([href^="#"])`
/**
 * Function is called when the current location is equal to `/create-a-survey` and whenever new content is loaded
 * When the page is loaded
 */
export function onSurveyLoad(){
  const form = document.getElementById('survey-form');
  if (form) {
    form.addEventListener('submit',onSubmitSurvey);
  }
  const questionTypeDialog = getQuestionTypeDialog();
  if(questionTypeDialog){
    const questionTypeForm = questionTypeDialog.querySelector<HTMLFormElement>('form');
    if (questionTypeForm) {
      questionTypeForm.addEventListener('submit',handleQuestionTypeFormSubmit);
      questionTypeForm.addEventListener('change',handleQuestionTypeFormChange);
    }
  }
  const previewSurvey = document.getElementById('preview-survey') as HTMLButtonElement|null;
  if (previewSurvey) previewSurvey.addEventListener('click',onPreviewSurvey);

  const questionsContainer = document.getElementById('survey-questions-container') as HTMLDivElement|null;
  if(questionsContainer) {
    const surveyQuestions = Array.from(questionsContainer.querySelectorAll<HTMLElement>('section.survey-question'));
    const CANT_DELETE = Boolean(surveyQuestions.length===1);
    if (surveyQuestions.length===0) {
      const firstSurveyQuestion = getSurveyQuestionHTML('survey-multiple-choice');
      questionsContainer.append(firstSurveyQuestion);
      onNewContentLoaded(questionsContainer);
      surveyQuestions.push(firstSurveyQuestion);
      setTimeout(()=> {
        const SURVEY_STATE_TEMP = validateSurveyAndGetQuestionStates(true);
        SURVEY_STATE = SURVEY_STATE_TEMP===undefined?null:JSON.stringify(SURVEY_STATE_TEMP,null,'');
      },1000);
    }
    surveyQuestions.forEach((question) => {
      if (!!!getCurrentSurveyQuestionID()) setCurrentSurveyQuestion.bind(question)();
      question.addEventListener('focusin',setCurrentSurveyQuestion);
      const options = Array.from(question.querySelectorAll<HTMLDivElement>('div[data-option]'));
      const CAN_REMOVE_OPTION = Boolean(options.length>=2);
      options.forEach((option) =>{
        option.addEventListener('focusin',setCurrentSurveyOption);
        if (!!!getCurrentSurveyOptionID()) setCurrentSurveyOption.bind(option)();
        const deleteOptionButton = option.querySelector<HTMLButtonElement>('button[data-delete-option]');
        if (CAN_REMOVE_OPTION&&deleteOptionButton&&deleteOptionButton.hasAttribute('disabled')) deleteOptionButton.removeAttribute('disabled');
        else if (deleteOptionButton&&!!!CAN_REMOVE_OPTION) deleteOptionButton.setAttribute('disabled','');
        if(deleteOptionButton) deleteOptionButton.addEventListener('click',deleteOption);

        const optionTypeButton = option.querySelector('button[data-option-type]');
        if(optionTypeButton)optionTypeButton.addEventListener('click',onOptionTypeButtonClick);
        
      })
      /* Delete Question */
      const deleteQuestionButton = question.querySelector<HTMLButtonElement>('button[data-delete-survey]');
      if (CANT_DELETE&&deleteQuestionButton) deleteQuestionButton.setAttribute('disabled','');
      else if(deleteQuestionButton&&deleteQuestionButton.hasAttribute('disabled')) deleteQuestionButton.removeAttribute('disabled');
      if (deleteQuestionButton) deleteQuestionButton.addEventListener('click',deleteSurveyQuestion);
      
      const questionTypeButton = question.querySelector<HTMLButtonElement>('button[data-question-type]');
      if (questionTypeButton) questionTypeButton.addEventListener('click',handleQuestionTypeButtonClick,true);
      /* Collapse Question */ 
      const collapseQuestionButton = question.querySelector<HTMLButtonElement>('button[data-hide-question]');
      if(collapseQuestionButton)collapseQuestionButton.addEventListener('click',hideAndShowSurveyQuestion);
      /* Add Question */
      const addQuestionButton = question.querySelector<HTMLButtonElement>('button[data-add-question]');
      if(addQuestionButton &&surveyQuestions.length>=200) addQuestionButton.setAttribute('disabled','');
      else if (addQuestionButton&&addQuestionButton.hasAttribute('disabled')) addQuestionButton.removeAttribute('disabled'); 
    })
    const typeMenu = getTypeMenu();
    if(typeMenu){
      Array.from(typeMenu.querySelectorAll<HTMLButtonElement>('button'))
      .forEach((button)=>{
        button.addEventListener('click',changeOptionType);
      })
    }
  }
  
  const save_state = document.getElementById("save-survey");
  if (save_state) {
    save_state.addEventListener('click',onSaveSurvey);
  }
  const download_survey_form = document.getElementById('search-surveys-download-form') as HTMLFormElement|null;
  if (download_survey_form) {
    download_survey_form.addEventListener('submit',handleDownloadSurveySubmit);
  }
  document.body.addEventListener('POLL_UPDATE',onSurveyLoad);

  const links = Array.from(document.querySelectorAll<HTMLElement>(LINKS_QUERY_SELECTOR));
  links.forEach((link) => link.addEventListener(isTouchDevice() ? 'touchstart' : 'mousedown',handleWarnNavigateAwaySurvey,true));
  window.addEventListener('beforeunload',onBeforeUnloadWarnSurvey);
  document.addEventListener('keydown',handleSaveKeypress);
} 

export function onSurveyUnload() {
  SURVEY_STATE = null;
  const links = Array.from(document.querySelectorAll<HTMLElement>(LINKS_QUERY_SELECTOR));
  links.forEach((link) => link.removeEventListener(isTouchDevice() ? 'touchstart' : 'mousedown',handleWarnNavigateAwaySurvey,true));
  window.removeEventListener('beforeunload',onBeforeUnloadWarnSurvey);
  document.body.removeEventListener('POLL_UPDATE',onSurveyLoad);
}
