import { scrollUp,scrollDown, isTouchDevice } from "../shared";

if(isTouchDevice()){
  import('./dragAndDropMobilePlugin')
  .then((module)=>module.default());
}

function handleFocusIn(this:HTMLDivElement,e:Event) {
  const elementToDragStr = this.getAttribute('data-drag');
  if(elementToDragStr){
    const elementToDrag = document.querySelector(elementToDragStr);
    if (elementToDrag) {
      elementToDrag.setAttribute('draggable','true');
    }
  }
}
function handleFocusOut(this:HTMLDivElement,e:Event){
  const elementToDragStr = this.getAttribute('data-drag');
  if(elementToDragStr){
    const elementToDrag = document.querySelector(elementToDragStr);
    if (elementToDrag) {
      elementToDrag.setAttribute('draggable','false');
    }
  }
}

function onDragStart(this:HTMLElement,e:DragEvent) {
  if (!!!e.target||!!!(e.target instanceof HTMLElement)||(e.target.id!==this.id)) {
    return;
  }
  this.classList.add('dragging');
}

function onDragEnd(this:HTMLElement) {
  this.classList.remove('dragging');
  this.setAttribute('draggable','false');
}
function onDragMove(this:HTMLElement,e:DragEvent) {
  setTimeout(()=>{
    const y = e.clientY;
    const screenHeight = window.innerHeight;
    if (y < 60){ 
      scrollDown();
    } else if (y>screenHeight-60) {
      scrollUp();
    }
  },25);
 
}

function onDragOver(this:HTMLElement,e:DragEvent){
  e.preventDefault();
  const draggable = this.querySelector<HTMLElement>('.dragging');
  const id = this.id;
  if (draggable&&draggable.getAttribute('data-drag-container')===id){
    const afterElement = getDragAfterElement(this,e.clientY);
    if (!!!afterElement) {
      this.appendChild(draggable);
    } else {
      this.insertBefore(draggable,afterElement);
    }
  }
}

function preventDefaultIfNotTarget(this:HTMLElement,e:DragEvent) {
  if (!!!e.target||!!!(e.target instanceof HTMLElement)||!!!e.target.hasAttribute('draggable')) {
    e.preventDefault();
    e.stopPropagation();
  }
}

export default function addDragAndDrop() {
  const dragButtons = Array.from(document.querySelectorAll('div.drag-container'));
  const dragContainers = Array.from(document.querySelectorAll<HTMLElement>('[data-drag-container]'));
  const dragEls = Array.from(document.querySelectorAll<HTMLElement>('[data-drag-el]'));
  dragButtons.forEach((el)=>{
    el.addEventListener('focusin',handleFocusIn);
    el.addEventListener('focusout',handleFocusOut);
  });
  dragEls.forEach((el)=>{
    el.addEventListener('dragstart',onDragStart);
    el.addEventListener('dragend',onDragEnd);
    el.addEventListener('drag',onDragMove);
  })
  dragContainers.forEach((el) => {
    el.addEventListener('dragover',onDragOver);
    el.addEventListener('drag',preventDefaultIfNotTarget);
  })

}

function getDragAfterElement(el:HTMLElement,y:number) {
  const draggableElements = Array.from(el.querySelectorAll<HTMLElement>('[data-drag-el]:not(.dragging)'));
  /* @ts-ignore */
  return draggableElements.reduce((closest,child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
    /* @ts-ignore*/
  },{ offset: Number.NEGATIVE_INFINITY }).element as HTMLElement|falsy;
}