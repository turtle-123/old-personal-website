/**
 * @file This is the main and should be the only javascript file for 
 * desktop Civgauge applications. 
 * 
 * 
 * @author Frank Brown
 */

import * as shared from './shared';

/* ---------------------------------- Helper Functions -------------------------- */
function setSidebarsHidden(hideLeft:boolean,hideRight:boolean) {
  const leftSidebar = document.getElementById('main-navigation') as HTMLElement|null;
  const leftButton = document.getElementById('notification-button') as HTMLButtonElement|null;
  const rightSidebar = document.getElementById('notification-sidebar') as HTMLElement|null;
  const rightButton = document.getElementById('navigation-button') as HTMLButtonElement|null;
  if(leftSidebar&&leftButton&&rightButton&&rightSidebar) {
    if (hideLeft) {
      if (leftSidebar.style.getPropertyValue('transition')!=='none'||leftSidebar.style.getPropertyPriority('transition')!=='important') leftSidebar.style.setProperty("transition","none","important");
      if (leftSidebar.getAttribute('aria-hidden')!=='true') leftSidebar.setAttribute('aria-hidden','true');
      if (!!!leftSidebar.hasAttribute('data-click-capture')) leftSidebar.setAttribute('data-click-capture','');
      if (!!!leftSidebar.classList.contains('drawer')||!!!leftSidebar.classList.contains('left')||!!!leftSidebar.classList.contains('lg')) leftSidebar.classList.add('drawer','left','lg');
      if (leftButton.hasAttribute('hidden')) leftButton.removeAttribute('hidden');
      setTimeout(() => {
        leftSidebar.style.removeProperty('transition');
      },100)
      Array.from(leftSidebar.querySelectorAll('.button.icon-text.medium.transparent.collapse-xs')).forEach((el)=>{
        if(el.className==="button icon-text medium transparent collapse-xs") el.className="button icon-text medium transparent"
        if (el.hasAttribute('data-popover')) el.removeAttribute('data-popover');
      });
    } else {
      if (!!!leftButton.hasAttribute('hidden')) leftButton.setAttribute('hidden','');
      if (leftSidebar.hasAttribute('data-click-capture')) leftSidebar.removeAttribute('data-click-capture');
      if (leftSidebar.classList.contains('drawer')||leftSidebar.classList.contains('left')||leftSidebar.classList.contains('lg')) leftSidebar.classList.remove('drawer','left','lg');
      if (leftSidebar.hasAttribute('aria-hidden')) leftSidebar.removeAttribute('aria-hidden');
      Array.from(leftSidebar.querySelectorAll('.button.icon-text.medium.transparent')).forEach((el)=>{
        if(el.className==="button icon-text medium transparent") el.className="button icon-text medium transparent collapse-xs";
        if (!!!el.hasAttribute('data-popover')) el.setAttribute('data-popover','');
      });
    }
    if (hideRight) {
      if (rightSidebar.style.getPropertyValue('transition')!=='none'||rightSidebar.style.getPropertyPriority('transition')!=='important') rightSidebar.style.setProperty("transition","none","important");
      if (rightSidebar.getAttribute('aria-hidden')!=='true') rightSidebar.setAttribute('aria-hidden','true');
      if (!!!rightSidebar.hasAttribute('data-click-capture')) rightSidebar.setAttribute('data-click-capture','');
      if (!!!rightSidebar.classList.contains('drawer')||!!!rightSidebar.classList.contains('right')||!!!rightSidebar.classList.contains('lg')) rightSidebar.classList.add('drawer','right','lg');
      if (rightButton.hasAttribute('hidden')) rightButton.removeAttribute('hidden');
      setTimeout(() => {
        rightSidebar.style.removeProperty('transition');
      },100);
    } else {
      rightSidebar.style.setProperty("transition","none","important");
      setTimeout(() => {
        rightSidebar.style.removeProperty('transition');
      },700)
      if (!!!rightButton.hasAttribute('hidden')) rightButton.setAttribute('hidden','');
      if (rightSidebar.hasAttribute('data-click-capture')) rightSidebar.removeAttribute('data-click-capture');
      if (rightSidebar.classList.contains('drawer')||rightSidebar.classList.contains('right')||rightSidebar.classList.contains('lg')) rightSidebar.classList.remove('drawer','right','lg');
      if (rightSidebar.hasAttribute('aria-hidden')) rightSidebar.removeAttribute('aria-hidden');      
    }
  }
}

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
  if (width<700){
    breakpoint='xs';
  }else if(width>=700&&width<900){
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
const bodyRegex=/(main-only|right-and-main|left-and-main)/;

/**
 * Function to call on resize event
 */
function handleResize() {
  const body = document.querySelector('body');
  const breakpointObject = getBreakpoint();
  const notificationSidebar = document.getElementById('notification-sidebar');
  const notificationButton= document.getElementById('notification-button');
  if(notificationSidebar&&notificationButton&&body) {
    if ((breakpointObject.breakpoint==='xs')&&!!!bodyRegex.test(body.className)) {
      notificationSidebar.style.setProperty("transition","none","important");
      notificationSidebar.setAttribute('aria-hidden','true');
      setTimeout(()=>{
        notificationSidebar.style.removeProperty("transition");
      },100);
      notificationSidebar.setAttribute('data-click-capture','');
      notificationSidebar.classList.add('drawer','right','lg');
      notificationSidebar.addEventListener('click',shared.captureClick);
      notificationButton.removeAttribute('hidden');
    } else if(!!!bodyRegex.test(body.className)) {
      notificationButton.setAttribute('hidden','');
      notificationSidebar.removeAttribute('data-click-capture');
      notificationSidebar.removeEventListener('click',shared.captureClick);
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
    if (searchModal && searchModal instanceof HTMLDivElement) shared.openDialog(searchModal);
}
function openCodeDialog() {
    const codeDialog = document.getElementById('code-markup-dialog');
    if (codeDialog instanceof HTMLDivElement) shared.openDialog(codeDialog);
}
function openMathDialog() {
    const mathDialog = document.getElementById('math-markup-dialog');
    if (mathDialog instanceof HTMLDivElement) shared.openDialog(mathDialog);
}
function openSettingsDialog() {
  const settingsDialog = document.getElementById('settings-dialog');
  if (settingsDialog instanceof HTMLDivElement) shared.openDialog(settingsDialog);
}

function isValidIntegerAsAny(n:any):n is number {
  return Boolean(
    !!!isNaN(parseInt(n))&&
    isFinite(parseInt(n))
  )
}

/**
 * User pressed keydown
 * @param {Event} e 
 */
function handleKeydown(e:KeyboardEvent) {
  if (e.key === "Escape") {
      const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper[data-esc]:not([hidden])'));
      if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
  } else if ((e.ctrlKey && e.key.toLowerCase() === "k")) {
      /**
       * Check to see if ctrl + k is pressed, and if it is, then open the search modal
       */
      e.preventDefault();
      e.stopPropagation();
      openSearchDialog();
  } else if ((e.ctrlKey && e.key.toLowerCase() === "q")) {
      e.preventDefault();
      e.stopPropagation();
      const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper:not([hidden])'));
      if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
      openCodeDialog();
  } else if ((e.ctrlKey && e.key.toLowerCase() === "m")) {
      e.preventDefault();
      e.stopPropagation();
      const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper:not([hidden])'));
      if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
      openMathDialog();
  } else if ((e.altKey && e.key.toLowerCase() === "e")) {
      e.preventDefault();
      e.stopPropagation();
      const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper:not([hidden])'));
      if (openDialogs.length) openDialogs.forEach((dialog) => shared.closeDialog(dialog));
      openSettingsDialog();
  } else if ((e.ctrlKey && e.key.toLowerCase() === "=")) {
      const applicationSizeInput = document.getElementById('application-font-size') as HTMLInputElement|null;
      if (applicationSizeInput) {
        const min = applicationSizeInput.getAttribute('min');
        const max = applicationSizeInput.getAttribute('max');
        const step = applicationSizeInput.step;
        const currentValue = applicationSizeInput.value;
        if (isValidIntegerAsAny(min)&&isValidIntegerAsAny(max)&&isValidIntegerAsAny(step)&&isValidIntegerAsAny(currentValue)){
          if (parseInt(currentValue) < parseInt(max)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            applicationSizeInput.value = String(parseInt(currentValue)+parseInt(step));
            applicationSizeInput.dispatchEvent(new Event('change'));
          }
        }
      } 
  } else if ((e.ctrlKey && e.key.toLowerCase() === "-")) {
    const applicationSizeInput = document.getElementById('application-font-size') as HTMLInputElement|null;
    if (applicationSizeInput) {
      const min = applicationSizeInput.getAttribute('min');
      const max = applicationSizeInput.getAttribute('max');
      const step = applicationSizeInput.step;
      const currentValue = applicationSizeInput.value;
      if (isValidIntegerAsAny(min)&&isValidIntegerAsAny(max)&&isValidIntegerAsAny(step)&&isValidIntegerAsAny(currentValue)){
        if (parseInt(currentValue) > parseInt(min)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          applicationSizeInput.value = String(parseInt(currentValue)-parseInt(step));
          applicationSizeInput.dispatchEvent(new Event('change'));
        }
      }
    } 
  }
}


document.addEventListener('keydown', handleKeydown,true);
window.addEventListener('resize', onDocumentResize);




/*------------------------------------------------- END CUSTOM -------------------------------------- */

/**
* Function to call on initial page load
*/
function onInitialPageLoad(_e:Event) {
  shared.onNewContentLoaded(document);
  handleResize();
}
/**
 * Change the className of the body
 */
function onDesktopNewContentLoaded(e:CustomEvent) {
  const elt = e?.detail?.elt;
  const targ = e?.detail?.target;
  const mainClass = document.getElementById('MAIN_CLASS') as HTMLDivElement|null;
  const body = document.querySelector<HTMLBodyElement>('body');
  if (mainClass&&body) {
    const classNameToApply = mainClass.getAttribute('data-value') || '';
    if (classNameToApply) {
      const bodyClassName = body.className.replace('dialog-open','').trim();
      if (bodyClassName!==classNameToApply) {
        if (classNameToApply==="main-only") {
          setSidebarsHidden(true,true);
        } else if (classNameToApply==="left-and-main") {
          setSidebarsHidden(false,true);
        } else if (classNameToApply==="right-and-main") {
          if (targ&&targ instanceof HTMLElement) {
            if (!!!targ.closest('aside.notification')) {
              setSidebarsHidden(true,false);
            }
          }
        } else {
          if (elt&&elt instanceof HTMLElement) {
            if (!!!elt.closest('aside.notification')) {
              setSidebarsHidden(false,false);
            }
          }
        }
        if (body.className.includes('dialog-open')) {
          body.className = classNameToApply.concat(' dialog-open');
        } else {
          body.className = classNameToApply;
        }
      }
    }
  } else if (body) {
    body.className='';
    if (targ&&targ instanceof HTMLElement) {
      if (!!!targ.closest('aside.notification')) {
        setSidebarsHidden(false,false);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', onInitialPageLoad);    
document.addEventListener('htmx:afterSwap',onDesktopNewContentLoaded,true);