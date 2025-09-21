/**
 * @file This is the main and should be the only javascript file for 
 * desktop Civgauge applications. 
 * 
 * 
 * @author Frank Brown
 */

import * as shared from './shared';

/* ---------------------------------- Document Listeners ----------------------- */
/**
 * breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @returns {{width: number, height: number, breakpoint: string}} Returns the current state of the window
 */
const getBreakpoint = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  /**
   * @type {string} 'xs'|'sm'|'md'|'lg'|'xl'
   */
  var breakpoint;
  if (width<600){
    breakpoint='xs';
  }else if(width>=600&&width<900){
    breakpoint='sm';
  }else if(width>=900&&width<1200){
    breakpoint='md';
  }else if(width>=1200&&width<1536){
    breakpoint='lg';
  }else{
    breakpoint='xl';
  }
  return {
    width,
    height,
    breakpoint
  };
}

/**
 * Function to call on resize event
 */
function handleResize() {
  const breakpointObject = getBreakpoint();
  const notificationSidebar = document.getElementById('notification-sidebar');
  const notificationButton= document.getElementById('notification-button');
  if(notificationSidebar&&notificationButton) {
    if (breakpointObject.breakpoint==='xs'||breakpointObject.breakpoint==='sm') {
      notificationSidebar.style.setProperty("transition","none","important");
      notificationSidebar.setAttribute('aria-hidden','true');
      setTimeout(()=>{
        notificationSidebar.style.removeProperty("transition");
      },100);
      notificationSidebar.setAttribute('data-click-capture','');
      notificationSidebar.classList.add('drawer','right','lg');
      notificationButton.removeAttribute('hidden');
    } else {
      notificationButton.setAttribute('hidden','');
      notificationSidebar.removeAttribute('data-click-capture');
      notificationSidebar.classList.remove('drawer','right','lg');
      notificationSidebar.removeAttribute('aria-hidden');
    }
  }
}

/**
 * @type {NodeJS.Timeout|undefined}
 */
var resizeDebounce: NodeJS.Timeout|undefined;
/**
 * On resize event debounce and get all elements that have a 
 * data-resize attribute and see if you should set aria-hidden
 * to true based on their data-above attribute, which is the min screen
 * size to show the element
 * @this {HTMLElement}
 * @param {Event} _e 
 */
function onDocumentResize(_e:Event) {
    try {
        if (resizeDebounce) clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(() => {
          handleResize();
        }, 100);
    } catch (error) {
    }


}
function openSearchDialog() {
    const searchModal = document.getElementById("search-dialog");
    if (searchModal && shared.isDialog(searchModal)) shared.openDialog(searchModal);
}
function openCodeDialog() {
    const codeDialog = document.getElementById('code-markup-dialog');
    if (shared.isDialog(codeDialog)) shared.openDialog(codeDialog);
}
function openMathDialog() {
    const mathDialog = document.getElementById('math-markup-dialog');
    if (shared.isDialog(mathDialog)) shared.openDialog(mathDialog);
}
function openSettingsDialog() {
  const settingsDialog = document.getElementById('settings-dialog');
  if (shared.isDialog(settingsDialog)) shared.openDialog(settingsDialog);
}

/**
 * User pressed keydown
 * @param {Event} e 
 */
function handleKeydown(e:any) {
    if (e.key === "Escape") {
        const openDialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[data-esc][open]'));
        if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
    } else if ((e.ctrlKey && e.key.toLowerCase() === "k")) {
        /**
         * Check to see if ctrl + k is pressed, and if it is, then open the search modal
         */
        if (e.preventDefault) e.preventDefault();
        openSearchDialog();
    } else if ((e.ctrlKey && e.key.toLowerCase() === "q")) {
        if (e.preventDefault) e.preventDefault();
        const openDialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
        if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
        openCodeDialog();
    } else if ((e.ctrlKey && e.key.toLowerCase() === "m")) {
        if (e.preventDefault) e.preventDefault();
        const openDialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
        if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
        openMathDialog();
    } else if ((e.ctrlKey && e.key.toLowerCase() === "e")) {
        if (e.preventDefault) e.preventDefault();
        const openDialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'));
        if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
        openSettingsDialog();
    }
}


document.addEventListener('keydown', handleKeydown);
window.addEventListener('resize', onDocumentResize);

/*------------------------------------------------- END CUSTOM -------------------------------------- */

/**
* Function to call on initial page load
*/
function onInitialPageLoad(_e:Event) {
  shared.onNewContentLoaded();
  handleResize();
}


window.addEventListener('DOMContentLoaded', onInitialPageLoad);    