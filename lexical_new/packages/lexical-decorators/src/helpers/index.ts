export function removeChildren(el: HTMLElement) {
  while (el.firstChild) {
    if(el.lastChild) el.removeChild(el.lastChild);
  }
}