import { DocOrEl } from ".";

const getTabCheckbox = () => document.getElementById("disabled-default-tab") as HTMLInputElement;
const getTabSizeInput = () => document.getElementById("tab-indent-size") as HTMLInputElement;

/**
 * Listen for keydown on textarea elements,
 * Then, if the key is equal to Tab, add an appropriate amount of spaces.
 *
 * @this {HTMLTextAreaElement} Textarea Element
 * @param {Event} e Keydown Event
 */
function onTabKeydown(this:HTMLTextAreaElement,e:any) {
  if (e?.key?.toUpperCase() === "TAB") {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;
    const numberInput = getTabSizeInput();
    const TAB_SIZE = Number(numberInput?.value);
    if (typeof start === "number" && typeof end === "number" && typeof TAB_SIZE==='number') {
      var newInnerText = this.value;
      newInnerText = newInnerText
        .slice(0, start)
        .concat(" ".repeat(TAB_SIZE))
        .concat(newInnerText.slice(end, newInnerText.length));
      this.value = newInnerText;
    }
  }
}

function addSpacesKeydown() {
  Array.from(document.getElementsByTagName("textarea")).forEach((el) => {
    el.addEventListener("keydown", onTabKeydown);
  });
  const tabSizeInput = getTabSizeInput();
  if (tabSizeInput) {
    tabSizeInput.removeAttribute('disabled');
    const increaseButton = tabSizeInput.nextElementSibling;
    const decreaseButton = increaseButton?.nextElementSibling;
    if (increaseButton&&decreaseButton) {
      increaseButton.removeAttribute('disabled');
      decreaseButton.removeAttribute('disabled');
    }
  }
}
function removeSpacesKeydown() {
  Array.from(document.getElementsByTagName("textarea")).forEach((el) => {
    el.removeEventListener("keydown", onTabKeydown);
  });
  const tabSizeInput = getTabSizeInput();
  if (tabSizeInput) {
    tabSizeInput.setAttribute('disabled','');
    const increaseButton = tabSizeInput.nextElementSibling;
    const decreaseButton = increaseButton?.nextElementSibling;
    if (increaseButton&&decreaseButton) {
      increaseButton.setAttribute('disabled','');
      decreaseButton.setAttribute('disabled','');
    }
  }
}
/**
 * @this {HTMLInputElement}
 *
 * @param {Event} _e Change Event
 */
function handleTabBehaviorChange(this:HTMLInputElement,_e:any) {
  if (this.checked) addSpacesKeydown() 
  else removeSpacesKeydown();
}

/**
 * Get the inputs for the tab size section of settings and add event listeners to them 
 * to properly handle them
 */
function addTabSizeSettingsListeners() {
  const tabCheckbox = getTabCheckbox();
  if (tabCheckbox instanceof HTMLInputElement) {
    tabCheckbox.addEventListener("change", handleTabBehaviorChange);
  }
  if (tabCheckbox&&tabCheckbox.checked) addSpacesKeydown() 
  else if (tabCheckbox) removeSpacesKeydown();
}
/**
 * Set the status bar color and the mode for the application. This is the only way to set the mode of the application when we 
 * don't know what the user's preferred mode is setting out
 */
function setThemeContent(){
  const openWholeDialog = document.querySelector('div.dialog-wrapper.whole:not([hidden])');
  const navbarColor = document.getElementById('NAVBAR_COLOR');
  const meta1 = document.getElementById('THEME_COLOR');
  const meta2 = document.getElementById('THEME_COLOR_2');
  const meta3 = document.getElementById('THEME_COLOR_3');
  if(navbarColor&&navbarColor?.getAttribute('value')&&meta1&&meta2&&meta3&&!!!openWholeDialog){
    const color = String(navbarColor.getAttribute('value'));
    meta1.setAttribute('content',color);
    meta2.setAttribute('content',color);
    meta3.setAttribute('content',color);
  }
  const modeFromSettings = document.getElementById('mode-from-settings');
  if(modeFromSettings&&modeFromSettings?.getAttribute('value')){
    const mode = modeFromSettings.getAttribute('value');
    const real_mode = (mode==="light"||mode==="dark") ? mode : "dark";
    const html = document.querySelector('html');
    if (html) {
      if (html.getAttribute('data-mode')!==real_mode) {
        html.setAttribute('data-mode',real_mode);
      }
    }
  }
}
/**
 * When the application font size changes 
 * @param this 
 * @param e 
 */
function handleApplicationSizeChange(this:HTMLInputElement,e:Event) {
  const value = this.value;
  const num = parseFloat(value);
  if (!!!isNaN(num)&&isFinite(num)&&num>=80&&num<=120) {
    const html = document.querySelector('html');
    if(html) {
      const defaultFontSize = parseFloat(String(html.getAttribute('data-default-font-size')));
      if(!!!isNaN(defaultFontSize)&&isFinite(defaultFontSize)) {
        html.style.fontSize = ((num/100)*(defaultFontSize)).toFixed(2).concat('px');
      }
    }
  }
}

function listenForApplicationThemeSize() {
  const applicationSizeInput = document.getElementById('application-font-size');
  if (applicationSizeInput) applicationSizeInput.addEventListener('change',handleApplicationSizeChange);
}

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

/**
 * Add some custom functionality on document load
 */
export function onNewContentLoaded(el:DocOrEl) {
  addTabSizeSettingsListeners();
  setThemeContent();
  listenForApplicationThemeSize();
}
