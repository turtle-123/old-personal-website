// @ts-nocheck
/**
 * @file This file should contain functions that are shared between desktop and mobile
 * javascript implementations.
 * We keep these functions here so that we can ensure that changes made here will affect both desktop and mobile devices equally
 *
 */

/**
 * Import [floatingui](https://floating-ui.com/docs/getting-started) stuff for
 * tooltips, dropdows, menus, and the like
 */
import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";

/**
 * Import custom javascript
 */
import * as custom from "./custom";

/**
 * Class to add to body when dialog is open **UNLESS** you want to enable scrolling
 * while the dialog is open.
 *
 * @type {string}
 */
const dialogOpenBodyClass = "dialog-open";
/**
 * Below are three variables needed because copying preformatted code with javascript is not too easy:
 * 1. codeStr - the string (preformatted) from the http request that got the code block from the server
 * 2. CODE_BUTTON_ID - the id of the button to copy the code block from the server
 * 3. CODE_API_ROUTE - the api route used to get the code block
 */
var codeStr = "";
const CODE_BUTTON_ID = "COPY_CODE_BUTTON";
const CODE_API_ROUTE = "/api/code"; 
/**
 * @type {boolean} Tells you whether the current page has any google maps on it
 */
var PAGE_HAS_MAPS = false;
/**
 * Variable to keep track of whether or not the current page has any lexical rich text editors
 * @type {boolean}
 */
var PAGE_HAS_EDITORS = false;

/**
 * Set of pathname strings. Prevent the page from being stored in local storage 
 * @type {Set<string>}
 */
const MAPS_PAGES_SET = new Set<string>([]);
/**
 * variable to hold the import of the imported google map script 
 * @type {typeof import("c:/Users/fmb20/Desktop/CODE/personal-website-project/functionality/src/js/googleMaps")|undefined}
 */
var MAPS_MODULE: typeof import("c:/Users/fmb20/Desktop/CODE/personal-website-project/functionality/src/js/googleMaps")|undefined;
var LEXICAL_MODULE: {clearAllEditors: () => void, setEditors: () => void}|undefined;
var FILE_EDITOR: typeof import("./fileInputEditor")|undefined;
var SPLIDE_MODULE: typeof import('./splideImplementation')|undefined;
var ARTICLE_BUILDER_MODULE: typeof import('./article-builder')|undefined;
var DRAG_DROP_MODULE: typeof import('./dragAndDrop')|undefined;
var CREATE_POLL_MODULE: typeof import('./createAPoll')|undefined;
var HTML_TO_JAVASCRIPT: typeof import('./htmlToJavascript')|undefined;

var SCROLL_Y = 0;
/**
 * Handling Image on Click -> opening dialog -> only want to do this for 
 * images that come from your source (prevent google maps images from being shown)
 */
const IMAGE_URL = 'https://image.storething.org';
const lightModeDarkModeID = "light-mode-dark-mode";

/* ---------------------------- Helper Functions ---------------------- */
export const isButton = (el:HTMLElement|Element|null|any):el is HTMLButtonElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "BUTTON");
export const isDialog = (el:HTMLElement|Element|null|any):el is HTMLDialogElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "DIALOG");
export const isDiv = (el:HTMLElement|Element|null|any):el is HTMLDivElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "DIV");
export const isSummary = (el:HTMLElement|Element|null|any):el is HTMLElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "SUMMARY");
export const isDetails = (el:HTMLElement|Element|null|any):el is HTMLDetailsElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "DETAILS");
export const isUL = (el:HTMLElement|Element|null|any):el is HTMLUListElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "UL");
export const isInput = (el:HTMLElement|Element|null|any):el is HTMLInputElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "INPUT");
export const isLabel = (el:HTMLElement|Element|null|any):el is HTMLLabelElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "LABEL");
const isAudio = (el:HTMLElement|Element|null|any):el is HTMLAudioElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "AUDIO");
const isVideo = (el:HTMLElement|Element|null|any):el is HTMLVideoElement =>
  Boolean(el && typeof el === "object" && el.nodeName === "VIDEO");

/**
 * Generate a random string of a given length, **"length"**, with only
 * the characters in **"chars"** input in the returned string
 * @param {number} length Length of the string to return
 * @param {string} chars String of characters to allow in the random string. Defaults to numbers 0-9a-zA-Z
 * @returns {string}
 */
export function randomString(
  length:number,
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
/**
 * Function which returns true if a value is not equal to null and not equal to "",
 * else returns false
 * @param {any} val
 * @returns {boolean}
 */
export const notNullOrEmptyString = (val:any):val is string =>
  Boolean(val !== "" && val !== null);
/**
 * Tells you whether an input is a string or undefined
 * @param {any} val
 * @returns {boolean} **true** if the input is a string or undefined, else **false**
 */
export const stringOrUndefined = (val:any) =>
  Boolean(typeof val === "string" || val === undefined);

/**
 * Do not allow for scrolling of the page by adding the **.dialog-open** class to the html and body tags
 */
export function preventScroll() {
  const html = document.querySelector("html");
  const body = document.querySelector("body");
  SCROLL_Y = Math.round(window.scrollY);
  if (body) body.classList.add(dialogOpenBodyClass);
  if (html) html.classList.add(dialogOpenBodyClass);
}
/**
 * Allow for scrolling of the page by removing the **.dialog-open** class from the html and body tags
 */
export function allowScroll() {
  const html = document.querySelector("html");
  const body = document.querySelector("body");
  if (body) body.classList.remove(dialogOpenBodyClass);
  if (html) html.classList.remove(dialogOpenBodyClass);
  window.scrollTo({left: 0,top: SCROLL_Y, behavior:'instant'});
}

export function scrollUp() {
  window.scroll(0,window.scrollY+20);
}

export function scrollDown() {
  window.scroll(0,window.scrollY-20);
}

/**
 * 
 * @param {HTMLElement} el 
 */
export function getClosestDialogOrBody(el:HTMLElement) {
  const dialog = el.closest('div.dialog');
  const closestSelectMenu = el.closest('div.select-menu');
  if (dialog) return dialog;
  else if (closestSelectMenu) return closestSelectMenu;
  else {
    const body = document.querySelector('body');
    if (body) return body;
    else return null;
  }
}


/* ---------------------------------- Custom ------------------------------------ */

/**
 * Still need to figure out what the best way to handle this is.
 * @param {Event} e Click Event on the light mode / dark mode button
 * @this {HTMLButtonElement}
 */
export function setLightMode(this: HTMLButtonElement,e:Event) {
  if (e.stopPropagation) e.stopPropagation();
  const HTML = document.querySelector("html");
  if (HTML) {
    const a = HTML.getAttribute("data-mode");
    if (a === "dark") {
      HTML.setAttribute("data-mode", "light");
    } else {
      HTML.setAttribute("data-mode", "dark");
    }
  }
  if (this.blur) this.blur();
}
/* ------------------------------------ Dialogs --------------------------------- */
/**
 * Function to close dialogs appropriately
 * @param {HTMLDialogElement} dialog Dialog to close
 */
export function closeDialog(dialog:HTMLDialogElement) {
  const id=dialog.getAttribute('id');
  if (id==='loading-dialog') {
    const indicator = dialog.querySelector<HTMLDivElement>('div[data-indicator]');
    if (indicator) indicator.setAttribute('aria-busy','false');
  }
if(id!=='image-dialog') {
  const viewport = document.querySelector('meta[name="viewport"]');
  if(viewport) viewport.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=5');
}
  dialog.close();
  allowScroll();
}

/**
 * Function to open dialogs appropriately
 * @param {HTMLDialogElement} dialog
 */
export function openDialog(dialog:HTMLDialogElement) {
  if(dialog.getAttribute('id')!=='image-dialog') {
    const viewport = document.querySelector('meta[name="viewport"]');
    if(viewport) viewport.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=1');
  }
  dialog.showModal();
  preventScroll();
}
/**
 * Custom function for opening full page dialog to alllow for some customization
 * @param dialog 
 * @param text 
 */
export function openLoadingDialog(dialog:HTMLDialogElement,text:string|null) {
  const indicator = dialog.querySelector<HTMLDivElement>('div[data-indicator]');
  if (indicator) indicator.setAttribute('aria-busy','true');
  const textEl = dialog.querySelector<HTMLParagraphElement>('p[data-text]');
  if (textEl&&text) textEl.innerText = text;
  openDialog(dialog);
}
/**
 * Show dialog whenever corresponding button element is clicked
 * @param {Event} _e Click event on a button element
 * @this {HTMLButtonElement}
 */
export function openDialogOnButtonClick(this:HTMLElement,_e: Event) {
  const DIALOG_ID = this.getAttribute("data-dialog");
  /**
   * @type {HTMLDialogElement|null}
   */
  const dialog = document.querySelector(`dialog[id="${DIALOG_ID}"]`);
  if (isDialog(dialog) && DIALOG_ID === "loading-dialog") {
    const text = this.getAttribute('data-text');
    openLoadingDialog(dialog,text);
  } else if (isDialog(dialog)) openDialog(dialog);
}
/**
 * Function to set the innerText of the dialog
 * @param text 
 */
export function setLoadingDialogInnerText(text: string) {
  const dialog = document.getElementById('loading-dialog');
  if (dialog) {
    const textEl = dialog.querySelector<HTMLParagraphElement>('p[data-text]');
    if (textEl) {
      textEl.innerText = text;
    }
  }
}
/**
 * 1. Get All buttons that are supposed to open dialogs, buttons that
 * include the attribute data-dialog, and open their corresponding dialogs on click.
 *
 * 2. Corresponding dialogs should have an id matching the data-dialog of the button.
 */
export function setDialogOpenButtons() {
  const dialogButtons = Array.from(
    document.querySelectorAll("button[data-dialog]")
  );
  if (dialogButtons.length) {
    dialogButtons.forEach((button) => {
      if (button.getAttribute('data-click')!==null) {
        button.addEventListener('click',openDialogOnButtonClick);
      }else{
        button.addEventListener("mousedown", openDialogOnButtonClick);
        button.addEventListener('touchstart',openDialogOnButtonClick);
      }
    });
  }
}
/**
 * https://stackoverflow.com/questions/25864259/how-to-close-the-new-html-dialog-tag-by-clicking-on-its-backdrop
 *
 * Function to close dialog on backdrop click
 *
 * @param {Event} e HTML Click Event
 * @this {HTMLDialogElement}
 */
export function closeDialogOnBackdropClick(this:HTMLDialogElement,e:Event) {
  if (e && e.target && isDialog(this) && e.target === this) closeDialog(this);
}
/**
 * Get all dialogs that have the boolean attribute
 * **data-close-backdrop** and listen for clicks on them to close
 * on backdrop click.
 */
export function setDialogCloseOnBackdropClick() {
  const dialogs = Array.from(
    document.querySelectorAll("dialog[data-close-backdrop]")
  );
  if (dialogs.length) {
    dialogs.forEach((dialog) => {
      if (isDialog(dialog))
        dialog.addEventListener("mousedown", closeDialogOnBackdropClick);
    });
  }
}
/**
 * Closes the parent dialog on button click
 * @param {Event} _e HTML button click event
 * @this {HTMLButtonElement}
 */
export function closeDialogOnButtonClick(this:HTMLButtonElement,_e:Event) {
  if (this && this.closest) {
    const dialog = this.closest("dialog");
    if (dialog && isDialog(dialog)) closeDialog(dialog);
  }
}
/**
 * Gets all `<button class="close-dialog>"`, and
 * adds a click event listener to them so that they close their parent dialog
 * when clicked.
 */
export function setDialogCloseButtons() {
  const dialogButtons = Array.from(
    document.querySelectorAll("button.close-dialog")
  );
  if (dialogButtons.length) {
    dialogButtons.forEach((button) => {
      if (isButton(button))
        button.addEventListener("click", closeDialogOnButtonClick);
    });
  }
}

/* ------------------------------------ Alerts ------------------------------ */
/**
 * Close the closest `<div class="alert">` on click
 *
 * @param {Event} _e
 * @this {HTMLButtonElement}
 */
export function closeAlert(this:HTMLButtonElement,_e:Event) {
  const alert = this.closest("div.alert");
  if (alert && isDiv(alert)) {
    alert.classList.add("closing", "overflow-hidden");
    setTimeout(() => {
      alert.remove();
    }, 700);
    this.blur();
  }
}
/**
 * Get all `<button class="close-alert">`, and add a click listener
 * to the button. When the button is clicked, close the closest `<div class="alert">`.
 */
export function setCloseAlertsButtons() {
  const closeAlertButtons = Array.from(
    document.querySelectorAll("button.close-alert")
  );
  if (closeAlertButtons.length)
    closeAlertButtons.forEach((button) =>
      button.addEventListener("click", closeAlert)
    );
}
/* --------------------------------- Accordions (Details And Summary) ---------------- */
/**
 *
 * Handle summary click.
 *
 * - For regular accordions, this just opens the accordion.
 * - For details elements that are in a `<ul> > <li>` it checks to see
 * if the `<ul>` has a **data-only** attribute. If it does, then this closes the open accordion and opens the new one
 *
 * @this {HTMLElement} Summary Element
 * @param {Event} e Click Event
 */
export function handleSummaryClick(this:HTMLElement,e:Event) {
  if (e.preventDefault) e.preventDefault(); // prevent default to handle manually
  /**
   * @type {HTMLDetailsElement|undefined}
   */
  const details = this.parentElement;
  if (details && isDetails(details)) {
    /**
     * @type {HTMLUListElement|Element|null}
     */
    const isAccordionGroupEl = details?.parentElement?.parentElement;
    const open = details.getAttribute("open");
    const div = details.querySelector("div.accordion-content");
    if (div && isDiv(div)) {
      if (
        isUL(isAccordionGroupEl) &&
        isAccordionGroupEl.classList.contains("accordion") &&
        isAccordionGroupEl.getAttribute("data-only") !== null
      ) {
        /**
         * @type {HTMLDetailsElement|null}
         */
        const openDetails = isAccordionGroupEl.querySelector("details[open]");
        if (
          openDetails &&
          isDetails(openDetails) &&
          openDetails.getAttribute("open") !== null
        ) {
          openDetails.removeAttribute("open");
          const div = openDetails.querySelector("div.accordion-content");
          if (div && isDiv(div)) div.setAttribute("aria-hidden", "true");
        }
      }
      if (open === null && div) {
        details.setAttribute("open", "true");
        div.setAttribute("aria-hidden", "false");
      } else if (div && isDiv(div)) {
        details.removeAttribute("open");
        div.setAttribute("aria-hidden", "true");
      }
    }
  }
}

/**
 * 1. Get all summary elements and add a click listener to them
 */
export function setSummariesOnClickEvents() {
  const summaries = Array.from(document.querySelectorAll("summary"));
  if (Array.isArray(summaries))
    summaries.forEach((summary) => {
      summary.addEventListener("click", handleSummaryClick);
    });
}

/* ---------------------------------- Inputs ------------------------------------ */

/**
 * Sets the **data-focus** attribute of the parent element of the parent element of the input to **true**
 * if that gradparent element has the class input-group.
 * @this {HTMLInputElement}
 * @param {Event} _e Focus Event
 */
export function onInputFocus(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if (isDiv(wrapper as HTMLElement) && wrapper?.classList?.contains("input-group")) {
    wrapper.setAttribute("data-focus", "true");
  }
}
/**
 * Sets the **data-blurred** attribute of the parent element of the parent element of the input to **true**
 * if that gradparent element has the class input-group. Also sets the ** data-focus**
 * attribute to false if the previous conditions are met.
 * @this {HTMLInputElement}
 * @param {Event} _e Blur Event
 */
export function onInputBlur(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if (isDiv(wrapper) && wrapper?.classList?.contains("input-group")) {
    wrapper.setAttribute("data-focus", "false");
    wrapper.setAttribute("data-blurred", "true");
  }
}
/**
 * @type {undefined|{name: string, timeout: number}}
 */
var rangeAutoBlur:undefined|{name: string|null, timeout: NodeJS.Timeout};
/**
 * @type {NodeJS.Timeout}
 */
var changeDebouncer: undefined|NodeJS.Timeout;
/**
 * @type {NodeJS.Timeout}
 */
var formDebouncer: undefined|NodeJS.Timeout;


/**
 * Function called when text input changes
 * @this {HTMLInputElement|HTMLTextAreaElement}
 *
 * @param {Event} _e
 */
export function onInputChange(this:HTMLInputElement,_e:Event) {
  if (this.classList.contains("chip")) return;
  const id = this.getAttribute("id");
  const inputName = this.getAttribute("name");
  const type = this.getAttribute('type');
  const rangeInput = Boolean(type=== "range");
  const colorInput = Boolean(type === "color");
  const numberInput = Boolean(type==="number");
  const fileInput = Boolean(type==="file");

  const inputLength = Number(this.value?.length);
  const maxLengthStr = this.getAttribute("maxlength");
  const minLengthStr = this.getAttribute("minlength");
  
  if (numberInput) {
    const numMax = this.getAttribute('max');
    const numMin = this.getAttribute('min');
    if (numMax!==null) {
      if (Number(numMax) < Number(this.value)) {
        this.value = numMax;
      }
    }
    if (numMin!==null) {
      if (Number(numMin) > Number(this.value)) {
        this.value = numMin;
      }
    }
  }

  if (changeDebouncer) clearTimeout(changeDebouncer);
  const debouncedFunction = function (this: HTMLInputElement) {
    if (
      inputName &&
      (notNullOrEmptyString(maxLengthStr) || notNullOrEmptyString(minLengthStr))
    ) {
      /**
       * @type {HTMLParagraphElement|null}
       */
      const charCounter = document.querySelector(
        `p.char-counter[data-input='${inputName}']`
      );
      if (charCounter) {
        /**
         * @type {HTMLSpanElement|null}
         */
        const minLengthCounter = charCounter.querySelector("span.min-counter");
        /**
         * @type {HTMLSpanElement|null}
         */
        const maxLengthCounter = charCounter.querySelector("span.max-counter");
        if (minLengthStr) {
          const minLength = Number(minLengthStr);
          /**
           * Number of characters the user still has to type to have a valid input
           */
          const newVal = Number(minLength - inputLength);
          /**
           * In the case where there is a minimum length counter and a maximum length counter,
           * show the minimum length counter only if the user has not input enough charcters.
           * If there is only a max length counter, then only that will be shown.
           * There will never be a case where there is only a min length counter.
           */
          if (newVal <= 0 && minLengthCounter && maxLengthCounter) {
            minLengthCounter.setAttribute("aria-hidden", "true");
            maxLengthCounter.setAttribute("aria-hidden", "false");
          } else if (minLengthCounter && maxLengthCounter) {
            maxLengthCounter.setAttribute("aria-hidden", "true");
            minLengthCounter.setAttribute("aria-hidden", "false");
          }
          if (minLengthCounter)
            minLengthCounter.setAttribute("data-val", String(newVal));
        }
        if (maxLengthStr) {
          const maxLength = Number(maxLengthStr);
          /**
           * Number of characters the user still has to type to have a valid input
           */
          const newVal = Number(maxLength - inputLength);
          if (maxLengthCounter)
            maxLengthCounter.setAttribute("data-val", String(newVal));
        }
      }
    }
    if (rangeInput) {
      const min = Number(this.min);
      const max = Number(this.max);
      const val = Number(this.value);
      this.style.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
      const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
      if (output) {
        const val = this.value;
        output.innerText = String(val);
      }
    }
    if (colorInput) {
      const span = this.nextElementSibling as HTMLSpanElement;
      if (span && span.innerText) span.innerText = this.value;
    }
  }.bind(this);
  changeDebouncer = setTimeout(debouncedFunction, 10);
  if (rangeInput) {
    const blurFunc = function (this:HTMLInputElement) {
      this.blur();
      this.dispatchEvent(new Event("blur"));
    }.bind(this);
    if (rangeAutoBlur && inputName === rangeAutoBlur?.name)
      clearTimeout(rangeAutoBlur.timeout);
    rangeAutoBlur = { name: inputName, timeout: setTimeout(blurFunc, 100) };
  }
  if (formDebouncer) clearTimeout(formDebouncer);
  const changeForm = function (this: HTMLInputElement) {
    const form = this.closest("form");
    if (form) form.dispatchEvent(new Event("change"));
  }.bind(this);
  formDebouncer = setTimeout(changeForm, 100);
}
/**
 * Sets the **data-hover** attribute of the parent element of the parent element of the input to **true** if that
 * gradparent element has the
 * class input-group
 * @this {HTMLInputElement}
 * @param {Event} _e
 */
export function onInputHover(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if (isDiv(wrapper) && wrapper?.classList?.contains("input-group")) {
    wrapper.setAttribute("data-hover", "true");
  }
}
/**
 * Call this function on input mouse out if the input is
 * not readonly.
 * Sets the **data-hover** attribute of the parent element of the parent element of the input to **false**
 * if that gradparent element has the
 * class input-group
 * @this {HTMLInputElement}
 * @param {Event} _e
 */
export function onInputMouseOut(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if (isDiv(wrapper) && wrapper?.classList?.contains("input-group")) {
    wrapper.setAttribute("data-hover", "false");
  }
}
/**
 * When this function is called, toggle the 'type'
 * of the input to either be 'password' or 'text' based on
 * what the current type of the input element is.
 * @param {Event} _e Button Click Event
 * @this {HTMLButtonElement}
 */
export function togglePassword(this:HTMLButtonElement,_e:Event) {
  /**
   * @type {HTMLOrSVGElement[]}
   */
  const svgs = Array.from(this.querySelectorAll("svg"));
  const input = this.parentElement?.querySelector("input");
  if (Array.isArray(svgs) && input && isInput(input)) {
    const type = input.getAttribute("type");
    svgs.forEach((svg) => {
      if (svg.getAttribute("hidden") !== null) svg.removeAttribute("hidden");
      else svg.setAttribute("hidden", "");
    });
    if (type === "password") {
      input.setAttribute("type", "text");
    } else if (type === "text") {
      input.setAttribute("type", "password");
    }
    input.focus();
  }
}
/**
 * Set click event listeners on all buttons that have the
 * data-vis-switch attribute to switch the visibility of
 * an input element from 'password' to 'text' and back when
 * clicked
 */
export function setPasswordToggleButtons() {
  /**
   * @type {HTMLButtonElement[]}
   */
  const buttons = Array.from(
    document.querySelectorAll("button[data-vis-switch]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((button) => {
      button.addEventListener("click", togglePassword);
    });
  }
}
/**
 * When a button is clicked, regenerate the input value of the input whose name
 * is equal to data-input
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function regenerateInputValue(this:HTMLInputElement,_e:Event) {
  /**
   * @type {string|null}
   */
  const inputName = this.getAttribute("data-input");
  if (inputName) {
    /**
     * @type {HTMLInputElement|null}
     */
    const input = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
    if (input) {
      switch (inputName) {
        case "secret-access-key":
          input.value = randomString(20);
        default:
          break;
      }
    }
  }
  this.blur();
}
/**
 * Get all buttons that have the attribute data-regenerate-value
 * and add a click event listener to them to regenerate the input value of the
 * input with the name equal to data-input
 */
export function regenerateInputValueButtons() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-regenerate-value]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", regenerateInputValue);
    });
  }
}
/**
 * When a button is clicked, get the value of the data-input attribute on the
 * button and copy the value of that input.
 *
 * @this {HTMLButtonElement} Button
 * @param {Event} _e Click Event
 */
export function copyInput(this:HTMLButtonElement,_e:Event) {
  /**
   * @type {string|null}
   */
  const inputName = this.getAttribute("data-input");
  if (inputName) {
    /**
     * @type {HTMLInputElement|null}
     */
    const input = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
    if (input) {
      const inputValue = input.value;
      navigator.clipboard
        .writeText(inputValue)
        .then(() => {})
        .catch((_error) => {});
    }
  }
  this.blur();
}
/**
 * Get all buttons that have the attribute data-copy-input
 * and set a click event listener on them so that when they are clicked
 * they copy the value of the input. The button should have an
 * attribute data-input which should be equal to the name of the input
 * whose value you want to copy.
 */
export function copyInputButtons() {
  /**
   * @type {HTMLButtonElement[]}
   */
  const buttons = Array.from(
    document.querySelectorAll("button[data-copy-input]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", copyInput);
    });
  }
}
/**
 * Increase value of adjacent number input on click
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function increaseValue(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.parentElement;
  if (wrapper && isDiv(wrapper) && wrapper.classList.contains("number-input")) {
    const input = wrapper.querySelector("input");
    if (input && isInput(input) && input.getAttribute("type") === "number") {
      const value = input.value;
      const max = input.getAttribute("max");
      if (Number(value) + 1 <= Number(max)) {
        input.value = String(Number(value) + 1);
        input.dispatchEvent(new Event("change"));
      }
    }
  }
  this.blur();
}
/**
 * Get all of the buttons with data-increase attribute and
 * set them to decrease the adjacent number input
 */
export function setIncreaseButtonsListeners() {
  const increaseButtons = Array.from(
    document.querySelectorAll("button[data-increase]")
  );
  if (Array.isArray(increaseButtons)) {
    increaseButtons.forEach((button) => {
      button.addEventListener("click", increaseValue);
    });
  }
}
/**
 * Decrease the value of adjacent number value on click
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function decreaseValue(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.parentElement;
  if (wrapper && isDiv(wrapper) && wrapper.classList.contains("number-input")) {
    const input = wrapper.querySelector("input");
    if (input && isInput(input) && input.getAttribute("type") === "number") {
      const value = input.value;
      const min = input.getAttribute("min");
      if (Number(value) - 1 >= Number(min)) {
        input.value = String(Number(value) - 1);
        input.dispatchEvent(new Event("change"));
      }
    }
  }
  this.blur();
}
/**
 * Get all of the buttons with data-decrease attribute and
 * set them to decrease the adjacent number input
 */
export function setDecreaseButtonsListeners() {
  const decreaseButtons = Array.from(
    document.querySelectorAll("button[data-decrease]")
  );
  if (Array.isArray(decreaseButtons)) {
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", decreaseValue);
    });
  }
}

/**
 * @this {HTMLElement} HTML Element - should be label, svg, or path
 * @param {Event} e Click Event on Label
 */
export function onChipLabelClick(this:HTMLElement,e:PointerEvent) {
  e.stopPropagation();
  if (e.pointerId === -1) return;
  var label = this;
  if (isLabel(label)) {
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (checkbox && isInput(checkbox)) {
      const isDisabled = Boolean(checkbox.getAttribute("disabled") !== null);
      if (isDisabled) return;
      const isUnchecked = label.classList.toggle("unchecked");
      if (isUnchecked) {
        checkbox.removeAttribute("checked");
      } else {
        checkbox.setAttribute("checked", "");
      }
    }
  }
}
/**
 * Get all labels with class .chip and set a click event listener on them
 * to toggle the state of the hidden checkbox input within the chip
 */
export function setChipListeners() {
  const chips = Array.from(
    document.querySelectorAll("label.chip:not(:disabled)")
  );
  if (Array.isArray(chips)) {
    chips.forEach((chip) => {
      chip.addEventListener("click", onChipLabelClick);
      chip.setAttribute('tabindex','0');
    });
  }
}
/**
 * Handles the click event on all `<button data-toggle>`
 *
 * @this {HTMLButtonElement} Button
 * @param {Event} _e HTML Click Event
 */
export function toggleButtonOnClick(this:HTMLButtonElement,_e:Event) {
  /**
   * true - the element that got clicked is currently selected
   *
   * false - the element that got clicked is not currently selected
   *
   * @type {boolean}
   */
  const isCurrentlyClicked = this.classList.contains("selected");
  /**
   * @type {HTMLElement|null} Should be a div - toggle button subgroup or toggle button group wrapper
   */
  const toggleGroupWrapper = this.parentElement;
  if (isDiv(toggleGroupWrapper)) {
    /**
     * data-only === "" when only one button in the toggle button group / subgroup can be selected
     *
     * data-only === null when more than one toggle button can be selected
     *
     * @type {''|null}
     */
    const onlyOne = toggleGroupWrapper.getAttribute("data-only");
    /**
     * data-one === "" when only one button in the toggle button group / subgroup must be selected
     *
     * data-one === null when one button in the toggle group does not have to be selected
     *
     * @type {''|null}
     */
    const mustBeOne = toggleGroupWrapper.getAttribute("data-one");
    /**
     * In this if - else statement, you toggle the selected values of the currently selected
     * buttons
     */
    if (onlyOne !== null && !!!isCurrentlyClicked) {
      /**
       *
       * @type {HTMLButtonElement|null} The button that is currently selected in this group or null
       */
      const currentlySelectedButton =
        toggleGroupWrapper.querySelector("button.selected");
      if (isButton(currentlySelectedButton)) {
        currentlySelectedButton.classList.remove("selected");
      }
    }
    const isNowSelected = this.classList.toggle("selected");
    /**
     * In this if statement, you check if there must be at least one button selected,
     * and if the button that got clicked is now not selected
     */
    if (mustBeOne !== null && isNowSelected === false) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const oneSelected = toggleGroupWrapper.querySelector("button.selected");
      if (oneSelected === null) {
        /**
         * @type {HTMLButtonElement|null} The default button that should be selected if one button must be selected
         */
        const defaultButton = toggleGroupWrapper.querySelector(
          "button[data-default]"
        );
        if (isButton(defaultButton)) {
          defaultButton.classList.add("selected");
        } else
          console.error(
            "There must be a buttton with the data-default attribute when there there is a toggle button group with the data-one attribute."
          );
      }
    }
  } else
    console.error(
      "Unable to find toggle button group wrapper or this toggle button does not have an input."
    );
  this.blur();
}
/**
 * Function that gets all toggle buttons -
 * that is all toggle buttons with the data-toggle attribute
 * and adds a click listener to them
 *
 */
export function setToggleButtonGroups() {
  const buttons = Array.from(document.querySelectorAll("button[data-toggle]"));
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", toggleButtonOnClick);
    });
  }
}
/**
 * Handle the initial setup for inputs - whatever that may be
 * @param {HTMLInputElement} input
 */
export function handleInitialSetup(input:HTMLInputElement) {
  const id = input.getAttribute("id");
  const type = input.getAttribute("type");
  if (type === "range") {
    const min = input.min;
    const max = input.max;
    const val = input.value;
    input.style.backgroundSize = ((Number(val) - Number(min)) * 100) / (Number(max) - Number(min)) + "% 100%";
    const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
    if (output) {
      const val = input.value;
      output.innerText = String(val);
    }
  }
  
}
/**
 * **data-value** - attribute equal to the value of the option that should be set on the hidden text input
 *
 * **Structure of Select**:
 *
 * div (select wrapper)
 *
 * - button (select button)
 *    - span (current selection)
 *    - svg (arrow)
 *
 * - div (select dropdown)
 *    - input (hidden type="text")
 *    - button (option 1)
 *    - button (option 2)
 *    - (more Options)
 * @this {HTMLButtonElement}
 * @param {Event} _e Button Click Event
 */
export function handleSelectionButtonOptionClick(this:HTMLButtonElement,_e:Event) {
  // remove the currently selected option
  const removeSelected = this?.parentElement?.querySelector(
    'button[aria-selected="true"]'
  );
  if (removeSelected) removeSelected.setAttribute("aria-selected", "false");
  /**
   * @type {undefined|string|null}
   * The new value for the select input
   */
  var newVal = undefined;
  /**
   * @type {string|null|undefined} The new innerText for the select button
   */
  var text = undefined;
  this.setAttribute("aria-selected", "true");
  newVal = this.getAttribute("data-val");
  text = this.innerText;
  /**
   * Make sure that newVal and text are not null
   */
  if (typeof newVal === "string" && typeof text === "string") {
    const selectWrapper = this?.parentElement?.parentElement;
    if (isDiv(selectWrapper)) {
      const selectButtonSpan =
        selectWrapper.querySelector<HTMLSpanElement>("button.select>span");
      const input = selectWrapper.querySelector("input");
      if (isInput(input)) {
        if (selectButtonSpan) {
          selectButtonSpan.innerText = text;
        }
        input.value = newVal;
        input.dispatchEvent(new Event('change'));
      }
    }
  }
}
/**
 * 1. Get all buttons with classname select-option that are not :disabled
 * 2. For each of the buttons, add a mousedown event that changes the value of the custom select input
 */
export function setSelectButtonListeners() {
  const buttons = Array.from(
    document.querySelectorAll("button.select-option:not(:disabled)")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((button, _i) => {
      if (button.hasAttribute('data-click')) button.addEventListener('click',handleSelectionButtonOptionClick);
      else {
        button.addEventListener("mousedown", handleSelectionButtonOptionClick);
        button.addEventListener("touchstart", handleSelectionButtonOptionClick);
      }
    });
  }
}
/**
 * Handle the mousedown event of a combobox option
 *
 * @this {HTMLButtonElement}
 * @param {Event} _e Mouse down event
 */
export function handleComboboxOptionSelect(this:HTMLButtonElement,_e:Event) {
  const thisValue = this?.getAttribute("data-val");
  if (notNullOrEmptyString(thisValue)) {
    const div = this?.parentElement?.parentElement;
    if (isDiv(div)) {
      const inputID = div.getAttribute("data-input");
      if (notNullOrEmptyString(inputID)) {
        const input = document.querySelector(`input#${inputID}`);
        if (isInput(input)) {
          input.value = String(thisValue);
          input.dispatchEvent(new Event('change'));
          const form = input.closest("form");
          if (form) form.dispatchEvent(new Event("change"));
        }
      }
    }
  }
}
/**
 * 1. Get all buttons that have the data-combobox-option attribute
 * 2. Add a mousedown event listener to them so that when they are clicked, you can get their value and
 * set it as the value of the appropriate input
 *
 * 3. The value of the appropriate input should be determined by getting the parent element
 * of the button, getting the data-input value of that element,
 * querySelector for that element, and then replace the value of that input if it exists
 *
 */
export function setComboboxListeners() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-combobox-option]")
  );
  buttons.forEach((btn) =>{
    btn.addEventListener("mousedown", handleComboboxOptionSelect)
    btn.addEventListener("touchstart", handleComboboxOptionSelect)
  });
}
/**
 * @this {HTMLFormElement}
 */
function onFormReset(this:HTMLFormElement) {
  this.dispatchEvent(new Event("change"));
}

/**
 * on reset for forms, add an event listeners to dispatch change on the form
 */
export function setFormReset() {
  const inputs = Array.from(document.querySelectorAll('input[type="reset"]'));
  if(Array.isArray(inputs)) inputs.forEach((f)=>f.addEventListener('click',onFormReset));
}

/**
 * Show picker for color / date inputs
 * @param this
 */
function showPicker(this:HTMLInputElement){
  this.showPicker();
}
/**
 * When the button next to the `time`, `datetime` or `date` input is clicked,
 * launch the picker
 * @param this 
 */
function launchPickerOnButtonClick(this:HTMLButtonElement) {
  const input = this.nextElementSibling;
  if(isInput(input)) showPicker.bind(input)();
}
/**
 * For `time`, `datetime` and `date` inputs, launch the picker when the button next to the text-like
 * input is clicked
 * @param input 
 */
function showPickerOnButtonClick(input:HTMLInputElement) {
  const button = input.previousElementSibling;
  if(isButton(button)&&button.hasAttribute('data-launch-datetime')) button.addEventListener('click',launchPickerOnButtonClick);
}

function handlePhoneInputChange(this:HTMLInputElement,e:Event){
  if (this.value.length < 3) this.value = "+1 ";
  else {
    var numbersStr = this.value.split('').filter((s) => /\d+/.test(s)).join('');
    numbersStr = numbersStr.startsWith('1') ? numbersStr : '1'.concat(numbersStr);
    var newVal = '';
    for (let i = 0; i < numbersStr.length; i++){
      if (i===0) newVal += "+1 ";
      else if (i===1) newVal+="(".concat(String(numbersStr[i]))
      else if (i===2||i===3) newVal+=numbersStr[i];
      else if (i===4) newVal+=") ".concat(numbersStr[i]);
      else if (i===5||i===6) newVal+=numbersStr[i];
      else if (i===7) newVal+=" - ".concat(numbersStr[i]);
      else if (i===8||i===9||i===10) newVal+=numbersStr[i];
      if (i===10) break;
    }
    this.value = newVal;
  }
}

/**
 * Set input listeners, handle initial setup of inputs
 *
 */
export function setInputListeners() {
  /**
   * Get all inputs into an array
   * @type {HTMLInputElement[]}
   */
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("input"));
  /**
   * @type {HTMLTextAreaElement[]}
   */
  const textarea = Array.from(document.querySelectorAll<HTMLTextAreaElement>("textarea"));
  /* @ts-ignore */
  const array = inputs.concat(textarea);
  array.forEach((input) => {
    const type = input.getAttribute("type");
    handleInitialSetup(input as HTMLInputElement);
    const readOnly = Boolean(input.getAttribute("readonly") !== null);
    if (!!!readOnly) input.addEventListener("focus", onInputFocus);
    input.addEventListener("blur", onInputBlur);
    if (!!!readOnly && isInput(input))input.addEventListener("change",onInputChange);
    else input.addEventListener("input",onInputChange);
    if (!!!readOnly) input.addEventListener("mouseover",onInputHover);
    if (!!!readOnly) input.addEventListener("mouseout",onInputMouseOut);
    if (type==="range") input.addEventListener("input",onInputChange);
    if (type==="color") input.addEventListener("input",onInputChange);
    if (type==="color") input.addEventListener('click',showPicker);
    if (type==="date"||type==="datetime"||type==="datetime-local"||type==="time"||type==="week"||type==="month") showPickerOnButtonClick(input);
    if (type==="tel") {input.addEventListener('input',handlePhoneInputChange); input.addEventListener('change',handlePhoneInputChange);}
  });
}

/* ------------------------------------- Images -------------------------- */
function onImageDialogLoad(this:HTMLImageElement){
  const naturalWidth = this.naturalWidth;
  const naturalHeight = this.naturalHeight;
  const width = this.width;
  const height = this.height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const maxHeight = windowHeight*0.6;
  const maxWidth = windowWidth*0.8;
  const widowAspect = maxWidth/maxHeight;
  this.style.setProperty("max-width",'80vw','important');
  this.style.setProperty("max-height",'60vh','important');
  if(!!!isNaN(naturalHeight)&&!!!isNaN(naturalWidth)&&naturalHeight&&naturalWidth) {
    if (naturalWidth/naturalHeight >=widowAspect) {
      this.style.setProperty("width",'80vw','important');
      this.style.setProperty("height",'auto','important');
    } else {
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'60vh','important');
    }
    return;
  } else if(!!!isNaN(height)&&!!!isNaN(width)&&height&&width) {
    if (width/height >=widowAspect) {
      this.style.setProperty("width",'80vw','important');
      this.style.setProperty("height",'auto','important');
    } else {
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'60vh','important');
    }
    return;
  } else {
    const body = document.querySelector('body');
    if(body){
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'auto','important');
      this.style.setProperty("max-width",'80vw','important');
      this.style.setProperty("max-height",'60vh','important');
    }
    
  }
}

/**
 * Handle Image click, set image as the src on the image modal,
 * and open the image modal
 * @param {Event} _e
 * @this {HTMLImageElement}
 */
export function onImageClick(this:HTMLImageElement,_e:Event) {
  /**
   * @type {HTMLDialogElement|null}
   */
  const src = this.getAttribute("src");
  if (typeof src === "string" && !!!src.startsWith(IMAGE_URL)) return;
  const title = this.getAttribute("alt");
  const moreText = this.getAttribute("data-text");
  const imageDialog = document.getElementById("image-dialog") as HTMLDialogElement;
  if (imageDialog && src) {
    /**
     * @type {HTMLSpanElement}
     */
    const titleSpan = imageDialog.querySelector<HTMLSpanElement>("#image-modal-text");
    /**
     * @type {HTMLImageElement}
     */
    const img = imageDialog.querySelector<HTMLImageElement>("img");
    /**
     * @type {HTMLParagraphElement}
     */
    const descriptionP = imageDialog.querySelector<HTMLParagraphElement>(
      "#image-modal-additional-description"
    );
    if (titleSpan && img && descriptionP) {
      img.style.setProperty('max-width','0px','important');
      img.style.setProperty('max-height','0px','important');
      img.style.setProperty('width','0px','important');
      img.style.setProperty('height','0px','important');
      img.removeEventListener('load',onImageDialogLoad);
      img.addEventListener('load',onImageDialogLoad);
      img.setAttribute("src", src);
      img.setAttribute("alt", String(title));
      titleSpan.innerText = String(title||'');
      descriptionP.innerText = String(moreText||'');
      openDialog(imageDialog);
    }
  }
}

export function handleImageError(this:HTMLImageElement) {
  this.src = '/static/asset/default-image.png';
}

/**
 * Get all images that do not have the `.no-click` class and
 * add a click listener to them to show the image dialog
 */
export function setImagesOnClick() {
  /**
   * @type {HTMLImageElement[]}
   */
  const images = document.querySelectorAll("img");
  images.forEach((image) => {
    if (!!!image.classList.contains('no-click')) {
      image.addEventListener("click", onImageClick);
    }
    image.addEventListener('eror',handleImageError)
  });
}

/* ----------------------- User Controls -------------------------- */

/**
 * Get the `<audio>` element
 * @param {HTMLElement} el A child of the audio wrapper element that wants to get access to the audio element
 */
function getAudio(el: HTMLElement) {
  const audioWrapper = el.closest("div[data-audio-wrapper]");
  if (audioWrapper) {
    const audio = audioWrapper.querySelector("audio");
    if (audio) {
      return audio;
    } else return null;
  } else return null;
}
/**
 * Get the `<video>` element
 * @param {HTMLElement} el A child of the video wrapper element that wants to get access to the video element
 */
function getVideo(el:HTMLElement) {
  const videoWrapper = el.closest("div[data-video-wrapper]");
  if (videoWrapper) {
    const video = videoWrapper.querySelector("video");
    if (video) {
      return video;
    } else return null;
  } else return null;
}
/**
 * @type {NodeJS.Timeout|undefined}
 */
var debounceTimeChangeAudio:undefined|NodeJS.Timeout = undefined;
/**
 * @type {NodeJS.Timeout|undefined}
 */
var debounceTimeChangeVideo:undefined|NodeJS.Timeout = undefined;
/**
 * Might as well use this function to handle multiple input events since you will be reacting to:
 * 1. Audio Time Change
 * 2. Video Time Change
 * 3. Video Sound Change
 * 4. Audio Sound Change
 *
 * @this {HTMLInputElement} Range Input
 *
 * @param {Event} _e Input Event
 */
export function handleMediaElementInput(this:HTMLInputElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const sound = this.getAttribute("data-sound");
  const time = this.getAttribute("data-time");
  const val = this.value;
  const max = this.getAttribute("max");
  const min = this.getAttribute("min");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  const debounceTimeChange =
    type === "audio" ? debounceTimeChangeAudio : debounceTimeChangeVideo;
  if (mediaElement) {
    if (time === "") {
      if (debounceTimeChange) clearTimeout(debounceTimeChange);
      mediaElement.currentTime = Math.max(
        Math.min(Number(max), Number(val)),
        Number(min)
      );
    } else if (sound === "") {
      mediaElement.volume = Number(val) / 100;
    }
  }
}
const VALID_AUDIO_STATES = new Set(["sound-up", "sound-down", "muted"]);
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
export function muteUnmuteAudio(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const svgs = Array.from(this.children);
  const currentState = (() => {
    const arr = svgs.filter((svg) => svg.getAttribute("hidden") === null);
    if (arr.length) {
      const curr = arr[0].getAttribute("data-type");
      if (VALID_AUDIO_STATES.has(curr as string)) {
        return curr;
      } else return null;
    } else return null;
  })();
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement && currentState) {
    if (currentState !== "muted") {
      mediaElement.muted = true;
    } else {
      mediaElement.muted = false;
      const soundInput =
        mediaElement?.parentElement?.querySelector<HTMLInputElement>("input[data-sound]");
      if (soundInput) {
        const currSound = soundInput.value;
        if (currSound) {
          const volume = Number(currSound) / 100 || 50;
          /* @ts-ignore */
          soundInput.volume = volume;
        }
      }
    }
  }
}
const VALID_PLAYBACK_SPEEDS = new Set([
  "0.25",
  "0.5",
  "0.75",
  "1",
  "1.25",
  "1.5",
  "1.75",
  "2",
]);
/**
 * @this {HTMLInputElement}
 *
 * @param {Event} _e
 */
export function changePlaybackSpeed(this:HTMLInputElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const value = this.value;
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement && VALID_PLAYBACK_SPEEDS.has(value))
    mediaElement.playbackRate = Number(value);
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
export function playMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    mediaElement.play();
    this.blur();
  }
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
export function pauseMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    mediaElement.pause();
    this.blur();
  }
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
export function replayMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    mediaElement.currentTime = 0;
    mediaElement.play();
    this.blur();
  }
}
/* ------------------ Event Handlers ------------------------------- */
/**
 * 1. Get the main controls div - the div that wraps around the buttons that control
 * play, pause, replay and around the loading and error symbols
 *
 * 2. Set all children of the wrapper in (1) to hidden except the one that has the attribute **attribute**
 * @param {HTMLDivElement} wrapper
 * @param {string} attribute
 */
function setMainControls(wrapper:HTMLDivElement, attribute:string) {
  const mainControls = wrapper.querySelector("div[data-main-controls]");
  if (mainControls) {
    const children = Array.from(mainControls.children);
    children.forEach((el) => {
      if (el.getAttribute(attribute) !== null) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });
  }
}
/**
 *
 * @param {number} secs An amount of seconds - could be ellapsed or remainig
 * @returns {string} a string of (minutes):(seconds)
 */
const getDurationString = (secs:number) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${
    seconds <= 9 ? "0".concat(String(seconds)) : String(seconds)
  }`;
};
/**
 *
 * @param {HTMLDivElement} wrapper
 * @param {number} ellapsed
 * @param {number} remaining
 * @param {boolean} initial
 */
function setTime(wrapper:HTMLDivElement, ellapsed:number, remaining:number, initial = false) {
  const ellapsedStr = getDurationString(ellapsed);
  const remainingStr = getDurationString(remaining);
  const ellapsedSpan = wrapper.querySelector<HTMLSpanElement>("span[data-ellapsed]");
  const remainingSpan = wrapper.querySelector<HTMLSpanElement>("span[data-remaining]");
  const ellapsedIndicator = wrapper.querySelector<HTMLInputElement>("input[data-time]");
  if (ellapsedSpan && remainingSpan && ellapsedIndicator) {
    const timeSet = Boolean(
      ellapsedIndicator.getAttribute("data-time-set") === "true"
    );
    ellapsedSpan.innerText = ellapsedStr;
    remainingSpan.innerText = remainingStr;
    if (
      document?.activeElement?.getAttribute("name") !==
      ellapsedIndicator?.getAttribute("name")
    ) {
      ellapsedIndicator.value = String(Math.floor(ellapsed));
      ellapsedIndicator.style.backgroundSize =
        (100 * ellapsed) / (ellapsed + remaining) + "% 100%";
    }
    if (initial || !!!timeSet) {
      ellapsedIndicator.setAttribute("max", String(Math.floor(remaining + ellapsed)));
      ellapsedIndicator.setAttribute("data-time-set", "true");
    }
  }
}
/**
 *
 * @param {HTMLButtonElement} wrapper
 * @param {boolean} muted
 * @param {boolean} low
 * @param {boolean} high
 */
function setVolumeButton(wrapper:HTMLButtonElement, muted:boolean, low:boolean, high:boolean) {
  Array.from(wrapper.children).forEach((svg) => {
    const type = svg.getAttribute("data-type");
    if (type === "muted" && muted) svg.removeAttribute("hidden");
    else if (type === "sound-up" && high) svg.removeAttribute("hidden");
    else if (type === "sound-down" && low) svg.removeAttribute("hidden");
    else svg.setAttribute("hidden", "");
  });
}

/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Abort Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/abort_event)
 */
export function handleAbort(this:HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) {
    setMainControls(wrapper, "data-error");
    const warnText = wrapper.querySelector("p[data-warn-text]");
    if (warnText) warnText.removeAttribute("hidden");
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} _e [Can Play Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplay_event)
 */
export function handleCanPlay(this:HTMLMediaElement,_e:Event) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-play");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Can Play Through](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event)
 */
export function handleCanPlayThrough(this:HTMLMediaElement) {
  this.setAttribute("data-play-through", "true");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Duration Change](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/durationchange_event)
 */
export function handleDurationChange(this:HTMLMediaElement) {
  const duration = Math.floor(this.duration);
  const currentTime = Math.floor(this.currentTime);
  const wrapper = this.parentElement as HTMLDivElement;
  setTime(wrapper, currentTime, Math.max(currentTime - duration, 0), true);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} _e [Emptied Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/emptied_event)
 */
export function handleEmptied(this:HTMLMediaElement,_e:Event) {
  // not handled
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Ended Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event)
 */
export function handleEnded(this:HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-replay");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Error Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/error_event)
 */
export function handleError(this:HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) {
    setMainControls(wrapper, "data-error");
    wrapper.classList.add("error");
    const errorText = wrapper.querySelector("p[data-error-text]");
    if (errorText) errorText.removeAttribute("hidden");
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handleLoadedData(this: HTMLMediaElement) {
  if (isAudio(this)) {
    // do nothing
  }
  if (isVideo(this)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Loaded Metadata Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event)
 */
export function handleLoadedMetadata(this: HTMLMediaElement) {
  const duration = Math.floor(this.duration);
  const wrapper = this.parentElement as HTMLDivElement;
  if (duration && wrapper) setTime(wrapper, 0, duration, true);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handleLoadStart(this: HTMLMediaElement) {
  if (isAudio(this)) {
    // Do nothing
  }
  if (isVideo(this)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handlePause(this: HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-play");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Play Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play_event)
 */
export function handlePlay(this: HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-pause");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handlePlaying(this: HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-pause");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handleProgress(this: HTMLMediaElement) {
  if (isAudio(this)) {
    // do nothing
  }
  if (isVideo(this)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Rate Change](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ratechange_event)
 */
export function handleRateChange(this: HTMLMediaElement) {
  if (isAudio(this)) {
    // do nothing
  }
  if (isVideo(this)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Seeked Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeked_event)
 */
export function handleSeeked(this: HTMLMediaElement) {
  const shouldPlay = Boolean(this.getAttribute("data-should-play") === "true");
  if (shouldPlay && this.paused) {
    this.play();
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Seeking Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeking_event)
 */
export function handleSeeking(this: HTMLMediaElement) {
  this.setAttribute("data-should-play", this.paused ? "false" : "true");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Stalled Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/stalled_event)
 */
export function handleStalled(this: HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-load");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Suspend Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/suspend_event)
 */
export function handleSuspend(this: HTMLMediaElement) {
  if (isAudio(this)) {
    // do nothing
  }
  if (isVideo(this)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Time Update Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)
 */
export function handleTimeUpdate(this: HTMLMediaElement) {
  const wrapper = this.parentElement as HTMLDivElement;
  const currentTime = Math.floor(this.currentTime);
  const duration = Math.floor(this.duration);
  if (wrapper && currentTime && duration)
    setTime(wrapper, currentTime, Math.max(duration - currentTime, 0));
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
export function handleVolumeChange(this: HTMLMediaElement) {
  const volume = this.volume;
  const muted = this.muted;
  const soundDown = Boolean(!!!muted && volume < 0.5);
  const soundUp = Boolean(!!!muted && volume >= 0.5);
  const volumeButton = this.parentElement?.querySelector<HTMLButtonElement>(
    "button[data-mute-button]"
  );
  if (volumeButton) setVolumeButton(volumeButton, muted, soundDown, soundUp);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Waiting Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event)
 */
export function handleWaiting(this: HTMLMediaElement) {
  this.setAttribute("data-resume", "true");
}
/**
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Click Event
 */
function onVideoClick(this: HTMLMediaElement,_e:Event) {
  if (this.paused) this.play();
  else this.pause();
}

/**
 * @this {HTMLMediaElement} Audio Element
 *
 * @param {Event} _e Focus Event
 */
function onVideoFocus(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-focus", "true");
}
/**
 *
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Hover Event
 */
function onVideoMouseEnter(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-hover", "true");
}
/**
 * @this {HTMLMediaElement} Audio Element
 *
 * @param {Event} _e Blur Event
 */
function onVideoBlur(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-focus", "false");
}
/**
 *
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Hover Event
 */
function onVideoMouseLeave(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-hover", "false");
}
/**
 * @this {HTMLButtonElement} Button Element
 *
 * @param {Event} _e Click Event
 */
function handleFullscreenClick(this: HTMLMediaElement,_e:Event) {
  const video = getVideo(this);
  const children = Array.from(this.children);
  const currentState = (() => {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        if (children[i].getAttribute("hidden") === "") {
          return children[i].getAttribute("data-type");
        }
      }
      return null;
    } else return null;
  })();
  if (video) {
    const videoWrapper = video.parentElement;
    if (videoWrapper && currentState === "no-fullscreen") {
      videoWrapper.requestFullscreen().then(() => {
        videoWrapper.setAttribute("data-fullscreen", "true");
        for (let i = 0; i < children.length; i++) {
          if (children[i].getAttribute("hidden") === "")
            children[i].removeAttribute("hidden");
          else children[i].setAttribute("hidden", "");
        }
      });
    } else if (videoWrapper && currentState === "fullscreen") {
      document.exitFullscreen().then(() => {
        videoWrapper.setAttribute("data-fullscreen", "false");
        for (let i = 0; i < children.length; i++) {
          if (children[i].getAttribute("hidden") === "")
            children[i].removeAttribute("hidden");
          else children[i].setAttribute("hidden", "");
        }
        this.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      });
    }
  }
}
export function setAudioListeners() {
  const audioElements = Array.from(document.querySelectorAll("audio"));
  audioElements.forEach((audio) => {
    audio.addEventListener("abort", handleAbort);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("emptied", handleEmptied);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("ratechange", handleRateChange);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("suspend", handleSuspend);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("waiting", handleWaiting);
    const audioWrapper = audio.parentElement;
    if (audioWrapper) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const playAudio = audioWrapper.querySelector("button[data-play]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const pauseAudio = audioWrapper.querySelector("button[data-pause]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const replayAudio = audioWrapper.querySelector("button[data-replay]");
      /**
       * @type {HTMLInputElement|null}
       */
      const audioTimeRange = audioWrapper.querySelector("input[data-time]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const audioMuteButton = audioWrapper.querySelector(
        "button[data-mute-button]"
      );
      /**
       * @type {HTMLInputElement|null}
       */
      const audioSoundRange = audioWrapper.querySelector("input[data-sound]");
      /**
       * @type {HTMLInputElement|null}
       */
      const playBackSpeed = audioWrapper.querySelector("input[data-playback]");
      if (audioTimeRange)
        audioTimeRange.addEventListener("blur", handleMediaElementInput);
      if (audioMuteButton)
        audioMuteButton.addEventListener("click", muteUnmuteAudio);
      if (audioSoundRange)
        audioSoundRange.addEventListener("input", handleMediaElementInput);
      if (playBackSpeed)
        playBackSpeed.addEventListener("change", changePlaybackSpeed);
      if (playAudio) playAudio.addEventListener("click", playMedia);
      if (pauseAudio) pauseAudio.addEventListener("click", pauseMedia);
      if (replayAudio) replayAudio.addEventListener("click", replayMedia);
    }
  });
}
export function setVideoListeners() {
  const videoElements = Array.from(document.querySelectorAll("video"));
  videoElements.forEach((video) => {
    video.addEventListener("abort", handleAbort);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("emptied", handleEmptied);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("suspend", handleSuspend);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("waiting", handleWaiting);

    video.addEventListener("click", onVideoClick);
    video.addEventListener("focus", onVideoFocus);
    video.addEventListener("mouseenter", onVideoMouseEnter);
    video.addEventListener("blur", onVideoBlur);
    video.addEventListener("mouseleave", onVideoMouseLeave);
    const videoWrapper = video.parentElement;
    if (videoWrapper) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const playAudio = videoWrapper.querySelector("button[data-play]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const pauseAudio = videoWrapper.querySelector("button[data-pause]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const replayAudio = videoWrapper.querySelector("button[data-replay]");
      /**
       * @type {HTMLInputElement|null}
       */
      const videoTimeRange = videoWrapper.querySelector("input[data-time]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const videoMuteButton = videoWrapper.querySelector(
        "button[data-mute-button]"
      );
      /**
       * @type {HTMLInputElement|null}
       */
      const videoSoundRange = videoWrapper.querySelector("input[data-sound]");
      /**
       * @type {HTMLInputElement|null}
       */
      const playBackSpeed = videoWrapper.querySelector("input[data-playback]");

      const fullscreenButton = videoWrapper.querySelector(
        "button[data-fullscreen]"
      );
      if (videoTimeRange)
        videoTimeRange.addEventListener("blur", handleMediaElementInput);
      if (videoMuteButton)
        videoMuteButton.addEventListener("click", muteUnmuteAudio);
      if (videoSoundRange)
        videoSoundRange.addEventListener("input", handleMediaElementInput);
      if (playBackSpeed)
        playBackSpeed.addEventListener("change", changePlaybackSpeed);
      if (playAudio) playAudio.addEventListener("click", playMedia);
      if (pauseAudio) pauseAudio.addEventListener("click", pauseMedia);
      if (replayAudio) replayAudio.addEventListener("click", replayMedia);
      if (fullscreenButton)
        fullscreenButton.addEventListener("click", handleFullscreenClick);
    }
  });
}

/* ---------------------------------- Menus, Popups, Tooltips, Dropdowns, Snackbars -------------- */
/**
 * Element 
 */
var openPopoverElement: undefined|HTMLElement = undefined;


/**
 * 
 */
function hidePopoverOnClick(e:Event) {
  e.stopPropagation();
  if(openPopoverElement) hidePopoverHelper(openPopoverElement);
}

/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 */
const autoUpdateObject:{[key: string]: any} = {};
/**
 * @this {HTMLElement} HTML element with data-popover attribute
 * @param {Event} e MouseEnter or Focus Event
 */
export function showPopover(this: HTMLElement,e:Event) {
  e.stopPropagation();
  const EVENT_TYPE = e.type;
  if(EVENT_TYPE==="click") e.preventDefault();
  const popoverElStr = this.getAttribute("data-pelem");
  if (this?.nodeName?.toUpperCase()!=='INPUT' && !!!autoUpdateObject[String(popoverElStr)]) e.stopPropagation();
  if (this?.nodeName?.toUpperCase()==='INPUT') this.focus();
  if (this.getAttribute('data-click')!==null) {
    if (this.classList.contains('select')&&this.getAttribute('disabled')!==null) return;
    /**
     * Add click listener so popover works on mobile devices
     */
    const el = getClosestDialogOrBody(this);
    if(el) {
      setTimeout(() => {openPopoverElement=this;},60);
      el.addEventListener('mousedown',hidePopoverOnClick);
      el.addEventListener('touchstart',hidePopoverOnClick);
      el.addEventListener('click',hidePopoverOnClick);
    }
  }
  if (this?.getAttribute("aria-haspopup") === "listbox") this.setAttribute("aria-expanded", "true");
  
  if (notNullOrEmptyString(popoverElStr)) {
    const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
    if (popoverEl) {
      popoverEl.addEventListener('click',captureClick);
      const buttons = Array.from(popoverEl.querySelectorAll<HTMLButtonElement>('button[data-close-menu]'));
      if (buttons) buttons.forEach((btn) => btn.addEventListener('click',hidePopoverOnClick));

      popoverEl.style.display = "block";
      const elementWithPopover = this;
      const updatePopover = () => {
        const isSelect = Boolean(
          elementWithPopover.classList.contains("select")
        );
        const isAuto = Boolean(elementWithPopover.classList.contains("auto-w"));

        const middleWare:any[] = [];
        const options:any = {};
        const classList = popoverEl.classList;
        if (classList.contains("o-lg")) middleWare.push(offset(12));
        else if (classList.contains("o-sm")) middleWare.push(offset(4));
        else if (classList.contains("o-xs")) middleWare.push(offset(1));
        else middleWare.push(offset(8));
        middleWare.push(shift());
        const placement = popoverEl.getAttribute("data-placement");
        const noFlip = popoverEl.getAttribute("data-no-flip");
        if (noFlip === null) middleWare.push(flip());
        if (validPlacements.has(String(placement))) options.placement = placement;
        else options.placement = "top";
        options.middleware = middleWare;

        computePosition(elementWithPopover, popoverEl, options).then(
          ({ x, y }) => {
            var assignObj = {};
            if (isSelect && !!!isAuto) {
              const width = elementWithPopover.offsetWidth;
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                opacity: "1",
              };
            } else {
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                opacity: "1",
              };
            }
            Object.assign(popoverEl.style, assignObj);
          }
        );
      };
      updatePopover();
      const cleanup = autoUpdate(this, popoverEl, updatePopover);
      delete autoUpdateObject[popoverElStr];
      autoUpdateObject[popoverElStr] = cleanup;
    }
  }

  
}
/**
 * 
 * @param {HTMLElement} element HTML element with data-popover attribute
 */
function hidePopoverHelper(element:HTMLElement) {
  if (element.getAttribute('data-click')!==null) {
    /**
     * Add click listener so popover works on mobile devices
     */
    const el = getClosestDialogOrBody(element);
    if(el) {
      openPopoverElement=undefined;
      el.removeEventListener('mousedown',hidePopoverOnClick);
      el.removeEventListener('touchstart',hidePopoverOnClick);
      el.addEventListener('click',hidePopoverOnClick);
    }
  }
  if (element?.getAttribute("aria-haspopup") === "listbox") element.setAttribute("aria-expanded", "false");
  const popoverElStr = element.getAttribute("data-pelem");
  if (notNullOrEmptyString(popoverElStr)&&typeof popoverElStr==='string') {
    const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
    if (popoverEl) {
      const buttons = Array.from(popoverEl.querySelectorAll<HTMLButtonElement>('button[data-close-menu]'));
      if (buttons) buttons.forEach((btn) => btn.removeEventListener('click',hidePopoverOnClick));
      if (autoUpdateObject[popoverElStr]) {
        try {
          autoUpdateObject[popoverElStr]();
          delete autoUpdateObject[popoverElStr];
        } catch (e) {}
      }
      popoverEl.style.display = "none";
      popoverEl.style.opacity = "0";
    }
  }
}

/**
 * @this {HTMLElement} HTML element with data-popover attribute
 * @param {Event} _e MouseLeave or Blur Event
 */
export function hidePopover(this: HTMLElement,_e:Event) {
  hidePopoverHelper(this);
}
const validPlacements = new Set([
  "top",
  "right",
  "bottom",
  "left",
  "top-start",
  "right-start",
  "bottom-start",
  "left-start",
  "top-end",
  "right-end",
  "bottom-end",
  "left-end",
]);

/**
 * Get all elements with a data-popover attribute and add appropriate event listeners to
 * them based on data attributes of the element with a popover.
 *
 * Attributes:
 * - data-pelem: The value of this data attribute will be used to
 * - data-mouse:
 * - data-click:
 *
 * [Floating ui Docs](https://floating-ui.com/docs/tutorial#functionality)
 */
export function setPopoverListeners() {
  /**
   * Get all elements that have the data-popover attribute
   * @type {HTMLElement[]}
   */
  const elementsWithPopover = Array.from(
    document.querySelectorAll("[data-popover]")
  );
  if (Array.isArray(elementsWithPopover)) {
    elementsWithPopover.forEach((elementWithPopover) => {
      const popoverElStr = elementWithPopover.getAttribute("data-pelem");
      const forceClose = elementWithPopover.getAttribute("data-force-close");
      if (notNullOrEmptyString(popoverElStr)) {
        const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
        if (popoverEl) {
          /**
           * Include this attribute on the element with a popover
           * if you want the element with a popover to show
           * the popover on click events (mouseenter / mouseleave)
           * @type {""|null}
           */
          const mouseEvents = elementWithPopover.getAttribute("data-mouse");
          /**
           * Include this attribute on the element with a popover
           * if you want the element with a popover to show
           * the popover on click events (click / blur)
           * @type {""|null}
           */
          const clickEvents = elementWithPopover.getAttribute("data-click");
          if (mouseEvents !== null) {
            elementWithPopover.addEventListener("mouseenter", showPopover);
            elementWithPopover.addEventListener("mouseleave", hidePopover);
          }
          if (clickEvents !== null) {
            elementWithPopover.addEventListener("focus", showPopover);
            elementWithPopover.addEventListener("click", showPopover); /* Added the click event for popovers to work on mobile */
            if (forceClose===null) {
              elementWithPopover.addEventListener("blur", hidePopover);
              elementWithPopover.addEventListener("focusout", hidePopover);
            }
          }
        }
      }
    });
  }
}
/**
 * 1. Get **data-selem** attribute from button
 * 2. If attribute exists, perform document.querySelector on the document to search for snackbar element
 * 3. If snackbar element exists, set aria-hidden = false
 * 4. If snackbar element has a data-snacktime attribute, setTimeout for that time and remove attribute after that period
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function openSnackbar(this: HTMLButtonElement,_e:Event) {
  const selectorStr = this.getAttribute("data-selem");
  if (notNullOrEmptyString(selectorStr)) {
    const snackbarEl = document.querySelector(String(selectorStr));
    if (isDiv(snackbarEl)) {
      snackbarEl.setAttribute("aria-hidden", "false");
      const timeoutStr = snackbarEl.getAttribute("data-snacktime");
      if (notNullOrEmptyString(timeoutStr) && !!!isNaN(Number(timeoutStr))) {
        setTimeout(() => {
          snackbarEl.setAttribute("aria-hidden", "true");
        }, Number(timeoutStr));
      }
    }
  }
}
/**
 * 1. Get all buttons that have a **data-snackbar** attribute
 * 2. Add event listener for a click event on those buttons
 */
export function setSnackbarListeners() {
  const buttons = Array.from(document.querySelectorAll("*[data-snackbar]"));
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", openSnackbar);
    });
  }
}
/**
 * Get the parent snackbar and close the snackbar. **The snackbar should
 * be the immedate parent of the button.**
 * @param {Event} _e Click Event
 *
 * @this {HTMLButtonElement} Button
 */
export function closeSnackbar(this:HTMLButtonElement,_e:Event) {
  const snackbar = this.closest("div.snackbar");
  if (isDiv(snackbar) && snackbar.getAttribute("aria-hidden") === "false") {
    snackbar.setAttribute("aria-hidden", "true");
  }
}
/**
 * Get all buttons that have the **data-close-snackbar** attribute and add a click
 * event listener to them so that, when they are clicked, they set the aria-hidden
 * value of the snackbar to true, effectively closing the snackbar
 */
export function setSnackbarCloseListers() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-close-snackbar]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((button) => {
      button.addEventListener("click", closeSnackbar);
    });
  }
}
/**
 * Get all snackbars that are open on new new content loaded, and
 * if they have a data-snacktime attribute create a setTimeout function that closes
 * the snackbar after the number of ms specified by `data-snacktime` has ellapsed
 */
export function getOpenSnackbars() {
  const openSnackbars = Array.from(document.querySelectorAll('div.snackbar[aria-hidden="false"]'));
  if(Array.isArray(openSnackbars)){
    openSnackbars.forEach((snackbar) => {
      const dataSnacktime = String(snackbar.getAttribute('data-snacktime'));
      if (typeof parseInt(dataSnacktime)==='number' && !!!isNaN(parseInt(dataSnacktime))) {
        setTimeout(() => {
          snackbar.setAttribute('aria-hidden','true');
        },parseInt(dataSnacktime));
      }
    })
  }
}
/* --------------------------------- Buttons ------------------------------------ */
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function handleScrollToButtonClick(this: HTMLButtonElement,_e:Event) {
  const scrollToStr = this.getAttribute("data-to");
  if (notNullOrEmptyString(scrollToStr)) {
    if ((scrollToStr as string)[0] === "(") {
      const x = Number(
        scrollToStr?.slice(1, scrollToStr.length - 1)?.split(",")[0]
      );
      const y = Number(
        scrollToStr?.slice(1, scrollToStr.length - 1)?.split(",")[0]
      );
      if (!!!isNaN(x) && !!!isNaN(y)) {
        window.scrollTo(x, y);
      }
    }
  }
}
/**
 * 1. Get all buttons with the data-scroll attribute
 * 2. When clicked, get the scroll-to attribute on the button
 * 3. **If** the first character in the scroll-to attribute is a parantheses, then treat the string as (x,y) coordinate (with checks), and scroll accordingly
 * 4. Else, querySelector the element and go to there
 */
export function setScrollToButtons() {
  const buttons = Array.from(document.querySelectorAll("button[data-scroll]"));
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", handleScrollToButtonClick);
      btn.addEventListener("mousedown", handleScrollToButtonClick);
      btn.addEventListener("touchstart", handleScrollToButtonClick);
    });
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function copyPrevious(this: HTMLButtonElement,_e:Event) {
  const codeBlock = this.previousElementSibling;
  if (codeBlock) {
    const codeToCopy = (codeBlock as HTMLElement).innerText;
    navigator.clipboard.writeText(codeToCopy);
  }
}
/**
 * 1. Get all buttons that have
 */
export function setCopyCodeButtons() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-copy-prev]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", copyPrevious);
    });
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} e Click Event or popstate event
 */
function handleNavigateBackClick(e:Event) {
  if(e?.type?.toLowerCase()==="popstate") {e.preventDefault(); e.stopPropagation();}
  const navigate_back_link = document.querySelector('a#NAVIGATE_BACK_LINK');
  if (navigate_back_link) navigate_back_link.dispatchEvent(new Event('click'));
  else window.location.reload();
}

function handlePopState(e:any) {
  const target = String(e?.currentTarget?.location?.href);
  const currentLocation = window.location.href.slice(0,window.location.href.indexOf('#'));
  const IS_HASH_NAVIGATION = Boolean(target.replace(currentLocation,'')?.startsWith('#'));
  if (IS_HASH_NAVIGATION) {e.preventDefault(); e.stopPropagation();}
  else {
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    handleNavigateBackClick(e);
  }
}
window.addEventListener('popstate',handlePopState);

/**
 * 1. Get all buttons with the data-nav-back attribute
 * 2. Add an event listener so that when the buttons are clicked, find the a#NAVIGATE_BACK_LINK element
 * 3. If the element exists, the dispatch a click event on the element
 * 4. else, reload the page
 */
export function setNavigateBackButtons() {
  const navBackButtons = Array.from(document.querySelectorAll('button[data-nav-back]'));
  if(Array.isArray(navBackButtons)) {
    navBackButtons.forEach((btn)=>btn.addEventListener('mousedown',handleNavigateBackClick));
    navBackButtons.forEach((btn)=>btn.addEventListener('touchstart',handleNavigateBackClick));
  }
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
export function hideShowContent(this: HTMLButtonElement,_e:Event) {
  const elStr = this.getAttribute("data-el");
  const showMore = this.querySelector("*[data-show]");
  const showLess = this.querySelector("*[data-hide]");
  if (elStr) {
    const element = document.querySelector(elStr);
    if (element) {
      const ariaHidden = element.getAttribute("aria-hidden");
      if (ariaHidden === "true") {
        element.setAttribute("aria-hidden", "false");
        if (showMore && showLess) {
          showMore.setAttribute("hidden", "");
          showLess.removeAttribute("hidden");
        }
      } else if (ariaHidden === "false") {
        element.setAttribute("aria-hidden", "true");
        if (showMore && showLess) {
          showLess.setAttribute("hidden", "");
          showMore.removeAttribute("hidden");
        }
      }
    }
  }
}
/**
 * Get all `<button[data-hide-show]>` and add click listeners to them to hide / show content
 */
export function setHideShowButtons() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-hide-show]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => {
      btn.addEventListener("click", hideShowContent);
    });
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function copyCodeToClipboard(_e:Event) {
  navigator.clipboard.writeText(codeStr);
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function copyElement(this: HTMLButtonElement,_e:Event) {
  const elStr = this.getAttribute("data-el");
  if (notNullOrEmptyString(elStr)) {
    const element = document.querySelector(elStr);
    if (element !== null) {
      const innerHTML = element?.getAttribute("data-inner");
      var str = "";
      if (innerHTML !== null) {
        str = element.innerHTML;
      } else {
        str = element.outerHTML;
        if (element.classList.contains("katex-block")) {
          str = str.replace("#copy-math-success-dialog", "#copy-math-success");
        }
      }
      navigator.clipboard.writeText(str);
    }
  }
}
/**
 * Get all `<button data-copy-el>` elements and add a click listener to them to copy the element on click
 */
export function setCopyElementButtons() {
  const buttons = Array.from(document.querySelectorAll("button[data-copy-el]"));
  if (Array.isArray(buttons)) {
    buttons.forEach((button) => {
      button.addEventListener("click", copyElement);
    });
  }
}

/* --------------------------------- Tabs -------------------------------------- */

/**
 * @param {HTMLElement} div div.tabs | div.mobile-stepper
 * @param {number} newTabButtonIndex
 * @param {number} oldTabButtonIndex
 */
export function switchTabs(div:HTMLElement, newTabButtonIndex:number, oldTabButtonIndex:number) {
  const backButton = div.querySelector("button[data-step-back]");
  const forwardButton = div.querySelector("button[data-step-forward]");
  const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
  /* @ts-ignore */
  const panels = Array.from(div?.nextElementSibling?.children) as HTMLElement[];
  if (Array.isArray(tabs) && Array.isArray(panels) && tabs.length===panels.length) {
    for (let i = 0; i < tabs.length; i++) {
      if (i !== newTabButtonIndex) {
        tabs[i].setAttribute("tabindex", '-1');
        tabs[i]?.classList?.remove("secondary");
        tabs[i]?.classList?.add("t-secondary");
        tabs[i]?.setAttribute("aria-selected", "false");
        panels[i].setAttribute("tabindex", "0");
        panels[i].setAttribute("hidden", "");
      }
    }
    if (tabs[newTabButtonIndex]) {
      tabs[newTabButtonIndex]?.classList?.add("secondary");
      tabs[newTabButtonIndex]?.classList?.remove("t-secondary");
      panels[newTabButtonIndex]?.removeAttribute("hidden");
      tabs[newTabButtonIndex]?.setAttribute("aria-selected", "true");
      if (isButton(backButton) && isButton(forwardButton)) {
        if (oldTabButtonIndex === 0 && newTabButtonIndex !== 0) {
          backButton.removeAttribute("disabled");
        } else if (
          oldTabButtonIndex === tabs.length - 1 &&
          newTabButtonIndex !== tabs.length - 1
        ) {
          forwardButton.removeAttribute("disabled");
        }
        if (newTabButtonIndex === 0) backButton.setAttribute("disabled", "");
        else if (newTabButtonIndex === tabs.length - 1)
          forwardButton.setAttribute("disabled", "");
      }
      /* @ts-ignore */
      tabs[newTabButtonIndex]?.focus();
    }
  }
  const PAGE = document.querySelector('main#PAGE');
  if (PAGE) {
      const tabChange = new CustomEvent('tabChange',{detail: { from: oldTabButtonIndex, to: newTabButtonIndex, wrapper: div }});
      PAGE.dispatchEvent(tabChange);
  }
}

/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function changeTab(this: HTMLButtonElement,_e:Event) {
  const thisTabAttr = this.getAttribute("data-tab");
  const div = this?.parentElement?.parentElement?.parentElement;
  if (isDiv(div) && notNullOrEmptyString(thisTabAttr)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(div?.nextElementSibling?.children);
    var thisTabIndex = null;
    var currentlySelectedIndex = null;
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("data-tab") === thisTabAttr) thisTabIndex = i;
        else if (tabs[i]?.getAttribute("aria-selected") === "true")
          currentlySelectedIndex = i;
        if (thisTabIndex !== null && currentlySelectedIndex !== null) break;
      }
      if (thisTabIndex !== null && currentlySelectedIndex !== null) {
        switchTabs(div, thisTabIndex, currentlySelectedIndex);
      }
    }
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function goForwardTab(this: HTMLButtonElement,_e:Event) {
  const div = this?.parentElement;
  var currentlySelected = null;
  if (isDiv(div)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(div?.nextElementSibling?.children);
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          currentlySelected = i;
          break;
        }
      }
      if (
        currentlySelected !== null &&
        currentlySelected < tabs.length - 1 &&
        currentlySelected >= 0
      )
        switchTabs(div, currentlySelected + 1, currentlySelected);
    }
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
export function goBackTab(this: HTMLButtonElement,_e:Event) {
  const div = this?.parentElement;
  var currentlySelected = null;
  if (isDiv(div)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore*/
    const panels = Array.from(div?.nextElementSibling?.children);
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          currentlySelected = i;
          break;
        }
      }
      if (
        currentlySelected !== null &&
        currentlySelected > 0 &&
        currentlySelected < tabs.length
      )
        switchTabs(div, currentlySelected - 1, currentlySelected);
    }
  }
}
/**
 * Set Listeners on `<div class="tabs">` elements
 */
export function setTabListeners() {
  const tabsWrapper = Array.from(document.querySelectorAll("div.tabs"));
  if (Array.isArray(tabsWrapper)) {
    tabsWrapper.forEach((tab) => {
      tab.addEventListener("keydown", handleTabKeydown);
      const tabs = Array.from(tab.querySelectorAll('button[role="tab"]'));
      /* @ts-ignore */
      const panels = Array.from(tab?.nextElementSibling?.children);
      if (Array.isArray(tabs) && Array.isArray(panels)) {
        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i]?.getAttribute("aria-selected") === "true") {
            panels[i]?.removeAttribute("hidden");
          } else {
            panels[i]?.setAttribute("hidden", "");
          }
          tabs[i].addEventListener("click", changeTab);
        }
      }
    });
  }
}
/**
 * @this {HTMLElement} div.tabs **OR** div.mobile-stepper
 * @param {Event} e
 */
export function handleTabKeydown(this: HTMLElement,e:any) {
  var currentlySelected = null;
  const tabs = Array.from(this.querySelectorAll('button[role="tab"]'));
  /* @ts-ignore */
  const panels = Array.from(this?.nextElementSibling?.children);
  if (Array.isArray(tabs) && Array.isArray(panels)) {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i]?.getAttribute("aria-selected") === "true") {
        currentlySelected = i;
        break;
      }
    }
  }
  if (currentlySelected !== null && tabs.length) {
    switch (e.key) {
      case "ArrowLeft":
        if (currentlySelected !== 0)
          switchTabs(this, currentlySelected - 1, currentlySelected);
        break;
      case "ArrowRight":
        if (currentlySelected !== tabs.length - 1)
          switchTabs(this, currentlySelected + 1, currentlySelected);
        break;
      case "Home":
        e.preventDefault();
        switchTabs(this, 0, currentlySelected);
        break;
      case "End":
        e.preventDefault();
        switchTabs(this, tabs.length - 1, currentlySelected);
        break;
    }
  }
}
/**
 * Set Listeners on `<div class="mobile-stepper">` elements
 */
export function setMobileStepperListeners() {
  const mobileSteppers = Array.from(
    document.querySelectorAll("div.mobile-stepper")
  );
  if (Array.isArray(mobileSteppers)) {
    mobileSteppers.forEach((div) => {
      div.addEventListener("keydown", handleTabKeydown);
      const backButton = div.querySelector("button[data-step-back]");
      const forwardButton = div.querySelector("button[data-step-forward]");
      if (forwardButton) {
        forwardButton.addEventListener("click", goForwardTab);
      }
      if (backButton) {
        backButton.addEventListener("click", goBackTab);
      }
      const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
      /* @ts-ignore */
      const panels = Array.from(div?.nextElementSibling?.children);
      var tabIndex = null;
      if (Array.isArray(tabs) && Array.isArray(panels)) {
        for (let i = 0; i < tabs.length; i++) {
          if (tabs[i]?.getAttribute("aria-selected") === "true") {
            tabIndex = i;
            panels[i]?.removeAttribute("hidden");
          } else {
            panels[i]?.setAttribute("hidden", "");
          }
          tabs[i].addEventListener("click", changeTab);
        }
        if (backButton && tabIndex === 0) {
          backButton.setAttribute("disabled", "");
        }
        if (forwardButton && tabIndex === tabs.length - 1) {
          forwardButton.setAttribute("disabled", "");
        }
      }
    });
  }
}
/* --------------------------------------------- Time ---------------------------------------- */
/**
 * Get time string
 * @param {boolean} short Whether you want a short or long date
 * @param {string} datetime datetime attribute of time element
 */
const getTimeString = (short:boolean, datetime:string) => {
  const d = new Date(datetime);
  const [day, month, year] = [d.getDate(), d.getMonth(), d.getFullYear()];
  var retStr;
  if (short) {
    retStr = `${month + 1}/${day}/${year}`;
  } else {
    const months = {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December",
    };
    retStr = `${months[month as keyof typeof months]} ${day}, ${year}`;
  }
  return retStr;
};
/**
 * This assumes that you have a UTC timestamp as your datetime attribute and that you time component either consists
 * of just text or svg + textspan combo
 * @this {HTMLTimeElement}
 *
 * @param {HTMLElement} timeEl
 * @param {boolean} short
 */
export function setLocalDate(timeEl:HTMLTimeElement, short:boolean) {
  const dateTime = timeEl.getAttribute("datetime");
  if (dateTime) {
    try {
      const str = getTimeString(short, dateTime);
      const span = timeEl.querySelector("span");
      if (span) span.innerText = str;
      else timeEl.innerText = str;
    } catch (error) {
      console.error(error);
    }
  }
}
/**
 * Get all time elements that have the
 *
 * 1. data-date-short or
 * 2. data-date-long attributes
 *
 * If they have these attributes, set the innerText of the span inside the time element
 *
 */
export function setLocalTimes() {
  const dates = Array.from(document.querySelectorAll("time"));
  if (Array.isArray(dates)) {
    dates.forEach((el) => {
      const timeShort = el.getAttribute("data-date-short");
      const timeLong = el.getAttribute("data-date-long");
      if (timeShort === "") setLocalDate(el, true);
      if (timeLong === "") setLocalDate(el, false);
    });
  }
}

/**
 * Disables links that are equal to the current url
 * Enables links that are unequal to current url
 * @param {HTMLAnchorElement} link
 * @param {boolean} subPageTarget
 */
export function setLinkDisabled(link:HTMLAnchorElement, subPageTarget:boolean) {
  const currentPathname = window.location.pathname;
  const target = String(link.getAttribute("hx-get"));
  var equal;
  if (subPageTarget) {
    const currentHash = window.location.hash;
    const hashIndex = target.indexOf("#");
    const targetHash = target.slice(hashIndex);
    equal = Boolean(
      targetHash === currentHash &&
        target.slice(0, hashIndex) === currentPathname
    );
  } else {
    equal = Boolean(target === currentPathname);
  }
  if (equal) link.setAttribute("aria-disabled", "true");
  else link.setAttribute("aria-disabled", "false");
}
/**
 * Gets all links and sets their aria-disabled attribute to true if their
 * hx-get is equal to the current url on the page.
 */
export function disableLinks() {
  const pageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[hx-target="#PAGE"]')
  );
  const subPageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[hx-target^="#subpage"]')
  );
  if (Array.isArray(pageLinks))
    pageLinks.forEach((link) => setLinkDisabled(link, false));
  if (Array.isArray(subPageLinks))
    subPageLinks.forEach((link) => setLinkDisabled(link, true));
}
/**
 * Stop Propagation of Click Event
 * @param {Event} e Click Event
 */
function captureClick(e:Event) {
  e.stopPropagation();
}
/**
 * Get All elements that have the data-click-capture attribute and make it so that click events
 * do not propagate past them.
 */
export function setClickCapture() {
  const elements = Array.from(
    document.querySelectorAll("*[data-click-capture]")
  );
  if (Array.isArray(elements)) {
    elements.forEach((el) => el.addEventListener("click", captureClick));
    elements.forEach((el) => el.addEventListener("mousedown", captureClick));
    elements.forEach((el) => el.addEventListener("touchstart", captureClick));
  }
}
/**
 * 
 * @param {Event} _e
 */
function closeOpenDrawer(_e:Event){
  const drawer = document.querySelector('.drawer[aria-hidden="false"]');
  if (drawer) {
    drawer.setAttribute('aria-hidden','true');
  }
}

/**
 *
 * @param {Event} e Toggle open state of drawer
 */
export function toggleDrawer(this:HTMLElement,e:Event) {
  e.stopPropagation(); // stop propogation of click event so that drawer still opens
  const selectorStr = this.getAttribute("data-drawer-el");
  if (selectorStr) {
    const element = document.querySelector(selectorStr);
    if (element) {
      const ariaHidden = element.getAttribute("aria-hidden");
      if (ariaHidden === "false") {
        element.setAttribute("aria-hidden", "true");
      } else if (ariaHidden === "true") {
        element.setAttribute("aria-hidden", "false");
        document.addEventListener('click',closeOpenDrawer);
      }
    }
  }
}
/**
 * Get all buttons that have the data-drawer attribute and add a click listener to them to set the
 * aria-hidden attribute of the element identified by data-elem to be false/true when clicked
 */
export function setDrawerButtons() {
  const buttons = Array.from(
    document.querySelectorAll("button[data-drawer-button]")
  );
  if (Array.isArray(buttons)) {
    buttons.forEach((btn) => btn.addEventListener("click", toggleDrawer));
  }
}

/**
 * @this {HTMLElement}
 *
 * @param {Event} _e Click Event
 */
export function closeDrawer(this:HTMLElement,_e:Event) {
  const drawer = this.closest(".drawer");
  if (drawer) {
    drawer.setAttribute("aria-hidden", "true");
  }
}
/**
 * Get all data-close-drawer elements and add a click listener to them to close the drawer when they are clicked
 */
export function setDrawerCloseElements() {
  const elements = Array.from(
    document.querySelectorAll('*[data-close-drawer=""]')
  );
  if (Array.isArray(elements)) {
    elements.forEach((el) => el.addEventListener("click", closeDrawer));
  }
}
/**
 * Function to check to see if there are any maps on the page
 * @returns {boolean}
 */
export const hasMaps = () => {
  const normalMaps = Array.from(document.querySelectorAll('div[id^="google_map"]'));
  const drawMaps  = Array.from(document.querySelectorAll('div[id^="draw_google_map"]'));
  const circleMaps = Array.from(document.querySelectorAll('div[id^="circle_google_map"]'));
  return Boolean(normalMaps.length>=1 || drawMaps.length >= 1 || circleMaps.length >= 1)
}

export const hasLexicalEditors = () => {
  const editors = document.querySelectorAll('div[data-rich-text-editor]');
  return Boolean(editors.length>=1);
}
/**
 * Get all `div.splide` elements on the page and initiate the elements 
 */
function handleSplideElements() {
  const elements = Array.from(document.querySelectorAll<HTMLDivElement>('div.splide'));
  if(Array.isArray(elements)) {
    if (SPLIDE_MODULE) SPLIDE_MODULE.handleSplideElements(elements);
    else {
      import(/* webpackChunkName: "splide-module" */ './splideImplementation')
      .then((res) => {
        SPLIDE_MODULE = res;
        SPLIDE_MODULE.handleSplideElements(elements);
      })
    }
  }
}


/* ---------------------------------------------- HTMX Listeners --------------------------------------- */
/**
 * Set of api endpoints that returns a `<style id="theme-colors">` element which defined custom styles
 * When these api endpoints are called, before request, remove the hx-preserve attribute from the 
 * `<style id="theme-colors">` attributes already in the head so that they can be removed
 */
const CHANGING_SETTINGS_ENDPOINTS = new Set([
  "/api/light-mode-dark-mode",
  "/api/settings",
  "/api/settings-form-reset",
  "/api/get-settings-and-form"
]);
/**
 * When there has been a successful api call to any of these paths, 
 * then you can un-disable the light mode / dark mode button and the settings dialog button
 * 
 * You want the buttons disabled at first to avoid a race condition of setting the settings and 
 * saving settings
 */
const SAVE_SETTINGS_INITIAL = new Set([
  "/api/create-ip-settings",
  "/api/save-ip-settings",
  "/cookies/denied-preference-cookies"
]);
/**
 * NOTE: This function means that all htmx-indicators should equal a value
 * that can be used to find the element using document.querySelector
 *
 * This function gets the hx-indicator denoted by the element and sets aria-busy equal to true
 * after the request begins
 *
 * This function also gets the data-remove attribute from the element and if the attribute
 * is not null, it adds 'hidden' to the element before the request
 *
 * @this {HTMLElement} HTML Element with a hx-indicator attribute that is not null or empty
 * @param {Event} _e htmx:beforeRequest event https://htmx.org/events/#:~:text=%23Event%20%2D%20htmx%3AafterRequest,in%20a%20network%20error%20situation.
 */
function beforeHtmxRequest(this:HTMLElement,_e:Event) {
  const querySelectorStr = this.getAttribute("hx-indicator");
  const dataRemove = this.getAttribute("data-remove");
  const targetStr = this.getAttribute("hx-target");
  const apiEndpoint = this.getAttribute("hx-get") || this.getAttribute("hx-post") || this.getAttribute("hx-delete") || this.getAttribute("hx-put");
  const isChangingSettings = Boolean(CHANGING_SETTINGS_ENDPOINTS.has(String(apiEndpoint)));
  if (isChangingSettings) {
    const themeColorStyles = Array.from(
      document.querySelectorAll("style#theme-colors")
    );
    themeColorStyles.forEach((el) => {
      el.removeAttribute("hx-preserve");
      el.setAttribute('data-remove','true');
    });
  }
  if (notNullOrEmptyString(targetStr) && targetStr?.trim() !== "this") {
    const targetEl = document.querySelector<HTMLElement>(targetStr);
    if (targetEl) clearInnerHTML(targetEl);
  }
  if (querySelectorStr) {
    const el = document.querySelector(querySelectorStr);
    if (el && el.setAttribute) {
      el.setAttribute("aria-busy", "true");
    }
  }
  if (dataRemove !== null) {
    this.setAttribute("hidden", "");
    this.classList.add("hidden");
  }
  if(this.getAttribute('hx-target')==="#PAGE"){
    if (PAGE_HAS_MAPS) {
      const mapStyles = Array.from(document.querySelectorAll('html>head>style'));
      const mapScripts = Array.from(document.querySelectorAll('html>head>script[src^="https://maps.googleapis.com"]'));
      const mapLinks = Array.from(document.querySelectorAll('html>head>link[href^="https://fonts.googleapis.com"]'));
      if(Array.isArray(mapStyles)){
        mapStyles.filter((el)=>el.getAttribute('id')!==null).forEach((el)=>el.setAttribute('hx-preserve',"true"));
      }
      if(Array.isArray(mapScripts)) mapScripts.forEach((script)=>script.setAttribute('hx-preserve','true'));
      if(Array.isArray(mapLinks)) mapLinks.forEach((link)=>link.setAttribute('hx-preserve','true'));
      if (MAPS_MODULE) MAPS_MODULE.removeGoogleMaps();
    }
    if (LEXICAL_MODULE && PAGE_HAS_EDITORS) LEXICAL_MODULE.clearAllEditors();
    if (FILE_EDITOR) FILE_EDITOR.handlePageChangeMediaInputs();
  }
}
/**
 * NOTE: This function means that all htmx-indicators should equal a value
 * that can be used to find the element using document.querySelector
 *
 * This function gets the hx-indicator denoted by the element and sets aria-busy equal to false
 * after the request ends
 *
 * @this {HTMLElement} HTML Element with a hx-indicator attribute that is not null or empty
 * @param {Event} e htmx:afterRequest event https://htmx.org/events/#:~:text=%23Event%20%2D%20htmx%3AafterRequest,in%20a%20network%20error%20situation.
 */
function afterHtmxRequest(this:HTMLElement,e:any) {
  const querySelectorStr = this.getAttribute("hx-indicator");
  const el = document.querySelector(String(querySelectorStr));
  const target = this.getAttribute("hx-target");
  if (el && el.setAttribute) {
    el.setAttribute("aria-busy", "false");
  }
  /**
   * Reload the current page on response of 205
   */
  if(e?.detail?.xhr?.status === 205) window.location.reload();
  if (e.detail.successful) {
    if (target === "#PAGE") window.scrollTo(0, 0);
    if (typeof target==="string" && target.startsWith("#subpage", 0)) {
      const targetElement = document.querySelector(target);
      if (targetElement) targetElement.scrollIntoView();
    }
    onNewContentLoaded();
    if (e.detail?.pathInfo?.requestPath === CODE_API_ROUTE) {
      /**
       * @type {string}
       */
      const codeResp = e.detail?.xhr?.responseText;
      const split = Number(String(codeResp)?.indexOf("<!--Split-->")) + 12;
      const codeResp2 = codeResp?.slice(split);
      const split3 = codeResp2?.indexOf("<!--Split-->");
      const codeResp3 = codeResp2?.slice(0, split3);
      codeStr = codeResp3.replace(
        "#copy-code-success-dialog",
        "#copy-code-success"
      );
    }
    if (CHANGING_SETTINGS_ENDPOINTS.has(e.detail?.pathInfo?.requestPath||'')){
      if(PAGE_HAS_MAPS&&MAPS_MODULE) {
        MAPS_MODULE.editGeographyStyles();
      }
    }
    if(SAVE_SETTINGS_INITIAL.has(e.detail?.pathInfo?.requestPath)){
      const lightModeDarkModeButton = document.getElementById(lightModeDarkModeID);
      const settingsDialogButton = document.querySelector('button[data-dialog="settings-dialog"]');
      if (isButton(lightModeDarkModeButton)) lightModeDarkModeButton.removeAttribute('disabled');
      if (isButton(settingsDialogButton)) settingsDialogButton.removeAttribute('disabled');
    }
  }
  const removeStyleTags = Array.from(document.querySelectorAll('style[data-remove="true"]'));
  if (Array.isArray(removeStyleTags)) {
    removeStyleTags.forEach((el) => el.remove());
  }
}
/**
 * Set listeners on all elements that have a attribute
 */
function setHxElementListeners() {
  const get = Array.from(document.querySelectorAll("[hx-get]"));
  const post = Array.from(document.querySelectorAll("[hx-post]"));
  const put = Array.from(document.querySelectorAll("[hx-put]"));
  const del = Array.from(document.querySelectorAll("[hx-delete]"));
  const elements = get.concat(post).concat(put).concat(del);
  if (Array.isArray(elements)) {
    elements.forEach((el) => {
      el.addEventListener("htmx:beforeRequest", beforeHtmxRequest);
      el.addEventListener("htmx:afterRequest", afterHtmxRequest);
    }); 
  }
}


/* --------------------------------- General Javascript ------------------------ */
/**
 * Call this function to prevent pages with the google maps javascript api from being stored in cache
 */
// function deleteMapsPagesFromCache() {
//   const key = "htmx-history-cache";
//   const value = localStorage.getItem(key);
//   if (!!!value) return;
//   try {
//     var changed:boolean = false;
//     const arr = JSON.parse(value);
//     const newArr:any[] = [];
//     arr.forEach((obj:any) => {
//       if (MAPS_PAGES_SET.has(String(obj?.url) as never)) {
//         changed = true;
//       } else {
//         newArr.push(obj);
//       }
//     })
//     if(changed as boolean ===true){
//       localStorage.setItem(key,JSON.stringify(newArr));
//     }
//   } catch (error) {
//     console.error(error);
//   }
// }

// /**
//  * function to call to set the tweets on the page
//  */
// async function setTweets() {
//   const tweets = Array.from(document.querySelectorAll<HTMLDivElement>('div[data-tweet-id][data-added="false"]'));
//   tweets.forEach((el) => {
//     el.setAttribute('data-added','true');
//     const id = el.getAttribute('data-tweet-id');
//     /* @ts-ignore */
//     window.twttr.widgets.createTweet(id,el)
//     .then((res: any) => {
//       if (res===undefined) throw new Error('Couldn\'t create tweet');
//     })
//     .catch((error: any) => {
//       console.error(error);
//       el.setAttribute('hidden','');
//       el.className = "alert filled error medium";
//       el.style.cssText = "margin: 1rem 0rem!important; text-align: center!important;";
//       const p = document.createElement('p');
//       p.classList.add('alert');
//       p.innerText = 'Sorry, something went wrong loading this tweet. Try reloading the page.';
//       el.append(p);
//       el.removeAttribute('hidden');
//     })
//   })
// }

/**
 * Function to call whenever new content is loaded
 */
export function onNewContentLoaded() {
  /* Dialogs */
  setDialogOpenButtons();
  setDialogCloseOnBackdropClick();
  setDialogCloseButtons();
  /* Alerts */
  setCloseAlertsButtons();
  /* Accordions (Details / Summaries) */
  setSummariesOnClickEvents();
  /* Inputs (All - includes textareas and chips) */
  setInputListeners();
  setPasswordToggleButtons();
  copyInputButtons();
  regenerateInputValueButtons();
  setIncreaseButtonsListeners();
  setDecreaseButtonsListeners();
  setChipListeners();
  setToggleButtonGroups();
  setSelectButtonListeners();
  setComboboxListeners();
  setFormReset();

  /* Menus, tooltips, dropdowns, snackbars */
  setPopoverListeners();
  setSnackbarListeners();
  setSnackbarCloseListers();
  getOpenSnackbars();

  /* Buttons */
  setScrollToButtons();
  setNavigateBackButtons();
  setCopyCodeButtons();
  setCopyElementButtons();
  setHideShowButtons();
  /* Tabs */
  setMobileStepperListeners();
  setTabListeners();

  /* Time */
  setLocalTimes();

  /* Images, Audio, Video */
  setImagesOnClick();
  setAudioListeners();
  setVideoListeners();

  /* Links */
  setTimeout(() => {
    /* Links */
    disableLinks();
  }, 50);

  /* Other */
  setClickCapture();
  setDrawerButtons();
  setDrawerCloseElements();
  handleSplideElements();

  /* HTMX */
  setHxElementListeners();
  
  /* Custom */
  custom.onNewContentLoaded();
  const lightModeDarkModeButton = document.getElementById(lightModeDarkModeID);
  if (lightModeDarkModeButton && isButton(lightModeDarkModeButton))
    lightModeDarkModeButton.addEventListener("click", setLightMode);

  const copyButton = document.getElementById(CODE_BUTTON_ID);
  if (copyButton) {
    copyButton.addEventListener("click", copyCodeToClipboard);
  }

  /* Google Maps */
  PAGE_HAS_MAPS = hasMaps();
  if (PAGE_HAS_MAPS) {
    setTimeout(() => {
      MAPS_PAGES_SET.add(window.location.pathname as string);
    },100);
    import(/* webpackChunkName: "google-maps-js" */'./googleMaps')
    .then((module)=>{
      MAPS_MODULE = module;
      return MAPS_MODULE.setGoogleMaps();
    })
    .catch((error)=>{
      console.error(error);
    })
  }

  /* Lexical */
  PAGE_HAS_EDITORS = hasLexicalEditors();
  if (PAGE_HAS_EDITORS) {
    import(/* webpackChunkName: "lexical-js" */'./lexicalImplementation')
    .then(({ setEditors, clearAllEditors }) => {
      LEXICAL_MODULE = { setEditors, clearAllEditors };
      LEXICAL_MODULE.setEditors();
    })
  }

  const butt = Array.from(document.querySelectorAll('button')).filter(b => b.getAttribute('type')!=='submit' && b.type!=='button');
  butt.forEach((butt)=>butt.setAttribute('type','button'));

  // deleteMapsPagesFromCache();

  // setTweets();
 
  const imageUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]'));
  const audioUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][accept="audio/*"]'));
  const videoUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][accept="video/*"]'));
  if (imageUpload.length || audioUpload.length || videoUpload.length) {
    if (FILE_EDITOR) FILE_EDITOR.setFileUploadListeners();
    else {
      import(/* webpackChunkName: "file-editors" */'./fileInputEditor').then((res) => {
        FILE_EDITOR = res;
        FILE_EDITOR.setFileUploadListeners();
      })
    }
  }

  const dragElements = Array.from(document.querySelectorAll('[data-drag-el]'));
  if (dragElements.length) {
    if (DRAG_DROP_MODULE) DRAG_DROP_MODULE.default();
    else {
      import(/* webpackChunkName: "drag-and-drop" */'./dragAndDrop')
      .then((module) => {
        DRAG_DROP_MODULE = module;
        DRAG_DROP_MODULE.default();
      })
    }
  }

  /* Page Specific */
  const path = window.location.pathname;
  if(path==='/article-builder'||path==='/article-builder-2') {
    if(ARTICLE_BUILDER_MODULE) {
      if(path==='/article-builder') ARTICLE_BUILDER_MODULE.onArticleBuilder();
      else if(path==='/article-builder-2') ARTICLE_BUILDER_MODULE.onArticleBuilder2();
    } else {
      import(/* webpackChunkName: "article-builder" */ './article-builder')
      .then((article_builder_module) => {
        ARTICLE_BUILDER_MODULE = article_builder_module;
        if(path==='/article-builder') ARTICLE_BUILDER_MODULE.onArticleBuilder();
        else if(path==='/article-builder-2') ARTICLE_BUILDER_MODULE.onArticleBuilder2();
      })
    }
  } else {
    if (ARTICLE_BUILDER_MODULE) ARTICLE_BUILDER_MODULE.onArticleBuilderUnload();
  }
  if(path==="/create-a-poll"){
    if (!!!CREATE_POLL_MODULE) {
      import(/* webpackChunkName: "create-a-poll" */'./createAPoll')
      .then((module)=>{
        CREATE_POLL_MODULE = module;
        CREATE_POLL_MODULE.onPollLoad();
      })
    } else {
      CREATE_POLL_MODULE.onPollLoad();
    }
  }
  if(path==='/html-to-javascript'){
    if (!!!HTML_TO_JAVASCRIPT) {
      import(/* webpackChunkName: "html-to-javascript" */'./htmlToJavascript')
      .then((module)=>{
        HTML_TO_JAVASCRIPT = module;
        HTML_TO_JAVASCRIPT.default();
      })
    } else {
      HTML_TO_JAVASCRIPT.default();
    }
  }
}

/**
 * When the user goes offline:
 *
 * 1. Remove the `<style id="theme-color">`element to fall back to default light mode / dark mode styles
 *
 */
function handleOfflineEvent() {
  const themeColorsStyle = document.querySelector("style#theme-colors");
  if (themeColorsStyle) themeColorsStyle.remove();
}

window.addEventListener("offline", handleOfflineEvent);

document.addEventListener('DOMContentLoaded',() => {
  onNewContentLoaded();
  const html = document.querySelector<HTMLElement>('html');
  if (html) html.addEventListener('NEW_CONTENT_LOADED',onNewContentLoaded);
});

/**
 * Function to clear the innerHTML from an element safely
 * @param targetEl 
 */
export function clearInnerHTML(targetEl: HTMLElement) {
  while (targetEl.hasChildNodes()) {
    targetEl.removeChild(targetEl.firstChild as ChildNode);
  }
}
/**
 * Function that generates the main loader element of a given height and color
 * @param param0 
 * @returns  
 */
export function getLoader({height, color="t-primary"}: {height: number, color: string}) {
  const minHeight = Math.max(height,40).toString().concat('px');
  const id = "rand_".concat(Math.random().toString().slice(2));
  const div = document.createElement('div');
  div.style.cssText = "min-height:".concat(minHeight).concat(';');
  div.className = "flex-row justify-center align-center ".concat(color);
  div.setAttribute('role','progressbar');
  div.setAttribute('aria-busy','false');
  div.setAttribute('id',id);
  const spinner = document.createElement('div');
  spinner.className ="lds-ring";
  for (let i = 0; i < 3; i++) spinner.append(document.createElement('div'));
  div.append(spinner);
  return { element: div, id };
}
/**
 * 
 * @returns boolean Whether or not the device is a touch device
 */
export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (window.navigator.maxTouchPoints > 0) ||
     /* @ts-ignore */
     (window.navigator.msMaxTouchPoints > 0));
}
