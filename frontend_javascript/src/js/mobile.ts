import * as shared from './shared';
import { enableZoom, disableZoom } from './shared';

/**
 * Function to call on initial page load
 */
function onInitialPageLoad(_e:Event) {
  shared.onNewContentLoaded(document);
}
/**
 * Disable zoom on focus of input elements (elements that accept input) on mobile
 * @param e 
 */
function onInputTextareaFocus(e:FocusEvent) {
  disableZoom();
}
/**
 * Enable zoom on blur of input elements (elements that accept input) on mobile
 * @param e 
 */
function onInputTextareaBlur(e:FocusEvent) {
  enableZoom();
}
/**
 * Disable zoom on focus of input elements (elements that accept input) on mobile
 */
function onContentEditableFocusIn(this:HTMLDivElement,e:FocusEvent) {
  if (e.target instanceof HTMLDivElement) {
    const sameNode = this.isSameNode(e.target);
    if (sameNode) disableZoom();
  } 
}
/**
 * Enable zoom on blur of input elements (elements that accept input) on mobile
 */
function onContentEditableFocusOut(this:HTMLDivElement,e:FocusEvent) {
  if (e.target instanceof HTMLDivElement) {
    const sameNode = this.isSameNode(e.target);
    if (sameNode) enableZoom();
  } 
}

/**
 * On new content loaded, get all input elements, textarea elements, and contenteditable elements and disable zoom
 */
function handleNewContentLoadedMobile() {
  const elements = Array.from(document.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>('input, textarea'));
  elements.forEach((el) => {
    el.addEventListener('touchstart',onInputTextareaFocus,true);
    el.addEventListener('touchend',onInputTextareaFocus,true)
    el.addEventListener('blur',onInputTextareaBlur,true);
  })
  const contentEditableELements = Array.from(document.querySelectorAll<HTMLDivElement>(`div[contenteditable="true"]`));
  contentEditableELements.forEach((div)=>{
    div.addEventListener('touchstart',onContentEditableFocusIn,true);
    div.addEventListener('touchend',onContentEditableFocusIn,true);
    div.addEventListener('focusout',onContentEditableFocusOut,true);
  });
}

document.addEventListener('NEW_CONTENT_LOADED',handleNewContentLoadedMobile);


window.addEventListener('DOMContentLoaded', onInitialPageLoad);    