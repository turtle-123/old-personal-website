import { closeDialog, openDialog, isTouchDevice } from "../shared";
import { getEditorInstances } from "../lexical-implementation";
import { getCodeMirrorEditorText } from "../code-editors";

var CONFIRM_NAVIGATE:{element: HTMLElement, page: string}|undefined = undefined;
var INITIAL_FORM_STATE:{[key: string]: any} = {};


/* ------------------------------------- Forms ----------------------------- */

function handleConfirmNavigateClick(this:HTMLButtonElement,e:Event) {
	const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
	if (dialog && CONFIRM_NAVIGATE) {
    if (window.htmx) window.htmx.trigger(CONFIRM_NAVIGATE.element,'click');
    INITIAL_FORM_STATE={};
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
/**
 * Returning void does not show the alert menu while returning true does show the alert menu
 * @param e 
 * @returns 
 */
function onBeforeUnloadWarn(e:Event) {
  const warnForm = getWarnForm();
  if (warnForm) {
    const doNotCheckInitialState = warnForm.hasAttribute('data-no-check-initial');
    if (!!!doNotCheckInitialState) {
      var IS_SAME = true;
      const formState = getFormState(warnForm);
      const keys = Object.keys(formState);
      for (let key of keys) {
        if (formState[key]!==INITIAL_FORM_STATE[key]) {
          IS_SAME = false;
          break;
        }
      }
      if (!!IS_SAME) return;
    }
    // Recommended
    e.preventDefault();    
    // Included for legacy support, e.g. Chrome/Edge < 119
    e.returnValue = true;
    return true; 
  } else {
    return;
  }
}
/**
 * We get the keys from the first obj, so pass the INITIAL_FORM_STATE as the first parameter
 * @param obj1 
 * @param obj2 
 */
function areFormsEqual(obj1:any,obj2:any) {
  var IS_SAME = true;
  if (!!!obj1||!!!obj2) return false;
  const keys = Object.keys(obj1);
  for (let key of keys) {
    if (obj1[key]!==obj2[key]) {
      IS_SAME = false;
      break;
    }
  }
  if (WEBPACK_PROCESS==="development") console.log(obj1,obj2,IS_SAME);
  return IS_SAME;
}
/**
 * Call back function that runs when a link that navigates user away from page with form is clicked
 * @param this 
 * @param e 
 * @returns 
 */
function handleWarnNavigateAway(this:HTMLElement,e:MouseEvent) {
  const warnForm = getWarnForm();
  if (warnForm) {
    const doNotCheckInitialState = warnForm.hasAttribute('data-no-check-initial');
    if (!!!doNotCheckInitialState) {
      const formState = getFormState(warnForm);
      const formsEqual = areFormsEqual(INITIAL_FORM_STATE,formState);
      if (!!formsEqual) return true;
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
}
/**
 * Get the form that you are worried about the user losing progress on
 * @returns 
 */
function getWarnForm() {
  const warnFormElement = document.querySelector('div[data-warn-form-progress]');
  if (warnFormElement) {
    const formID = warnFormElement.getAttribute('data-warn-form-progress');
    if(formID) {
      const form = document.getElementById(formID) as HTMLFormElement|null;
      if (form) return form;
    }
  }
  return null;
}
/**
 * Function for getting the initial form state and seeing if any changes have been made to the form
 * @param form 
 */
function getFormState(form:HTMLFormElement) {
  const skipInputRegex = /(lexical|lex-)/;
  const retObj:{[index:string]:any}={};
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
  const textAreas = Array.from(form.querySelectorAll<HTMLTextAreaElement>('textarea'));
  const lexicalStates = Array.from(form.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'));
  const codeEditors = Array.from(form.querySelectorAll<HTMLDivElement>('div[data-editor-wrapper]'));
  inputs.forEach((inp) => {
    const name = inp.getAttribute('name');
    if (name&&!!!skipInputRegex.test(name)) {
      retObj[name] = inp.value;
    }
  })
  textAreas.forEach((inp) => {
    const name = inp.getAttribute('name');
    if (name&&!!!skipInputRegex.test(name)) {
      retObj[name] = inp.value;
    }
  })
  lexicalStates.forEach((div) => {
    const editorID = div.id;
    const lexicalInputNames = Array.from(div.querySelectorAll<HTMLInputElement>('input'));
    lexicalInputNames.forEach((el) => {
      const name = el.getAttribute('name');
      if (name&&retObj[name]) delete retObj[name];
    })
    if (editorID) {
      const editorInstances = getEditorInstances();
      const editor = editorInstances[editorID]
      if (editor) {
        retObj[editorID] = JSON.stringify(editor.getEditorState().toJSON());
      }
    }
  })
  codeEditors.forEach((div) => {
    const codeMirrorID = div.id;
    if (codeMirrorID) {
      const innerText = getCodeMirrorEditorText(codeMirrorID);
      retObj[codeMirrorID] = innerText;
    }
  })
  return retObj;
}

function resetInitialFormStateOnSubmit(this:HTMLButtonElement|HTMLFormElement,e:Event) {
  const form = getWarnForm();
  if (form) INITIAL_FORM_STATE = getFormState(form);
}

const LINKS_QUERY_SELECTOR = `[hx-push-url="true"]:not([data-force-navigate]):not([type="submit"]), [href^="/"]:not([href^="#"])`
/**
 * 1. Get the form that you want to warn the user about saving progress
 * 2. get the form state 
 * 3. Get all links that navigate to new page except for submit buttons
 * 4. Add a mousedown or touchstart event listener that calls `handleWarnNavigateAway`
 * 5. Add a before unload warn listener to window
 */
function warnUsersNavigateAway() {
  if (WEBPACK_PROCESS==="development") console.log('Warn users navigate away');
  const form = getWarnForm();
  if (form) {
    form.addEventListener('lexical_state_registered',resetInitialFormStateOnSubmit,true);  
    form.addEventListener('submit',resetInitialFormStateOnSubmit,true);
    const submitButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"]'))
    submitButtons.forEach((b) => b.addEventListener('click',resetInitialFormStateOnSubmit,true));
    INITIAL_FORM_STATE = getFormState(form);
    const links = Array.from(document.querySelectorAll<HTMLElement>(LINKS_QUERY_SELECTOR));
    links.forEach((link) => link.addEventListener(isTouchDevice() ? 'touchstart' : 'mousedown',handleWarnNavigateAway,true));
    window.addEventListener('beforeunload',onBeforeUnloadWarn);
  } else {
    INITIAL_FORM_STATE = {};
    window.removeEventListener('beforeunload',handleWarnNavigateAway);
    const links = document.querySelectorAll<HTMLElement>(LINKS_QUERY_SELECTOR);
    links.forEach((link) => link.removeEventListener(isTouchDevice() ? 'touchstart' : 'mousedown',handleWarnNavigateAway,true));
    window.removeEventListener('beforeunload',onBeforeUnloadWarn);
  }
}

/**
 * Function should be run when there is a `<div data-warn-form-progress="FORM_ID"></div>`
 * 
 */
export function runWarnNavigateAway() {
  warnUsersNavigateAway();
}
