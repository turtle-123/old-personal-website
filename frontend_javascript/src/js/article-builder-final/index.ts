import { clearEditor, getEditorInstances, getEditorState, registerFullEditor } from "../lexical-implementation";
import { openLoadingDialog, closeDialog, getCsrfToken } from "../shared";

var LAST_FOCUSED_FORM:string|undefined = undefined;
var CURRENT_STATE:{
  title: string;
  editorState: string;
  description: string;
  image: string;
  version: number | undefined;
} | null = null;

function dispatchErrorPopover(s:string) {
  const id = 's_'.concat(window.crypto.randomUUID());
  const html = /*html*/`
  <div id="${id}" class="snackbar error filled medium icon" aria-hidden="false" role="alert" data-snacktime="4000">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Code"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
    <p class="p-sm">${s}</p>
    <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend',html);
  document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
  setTimeout(()=> {
    const el = document.getElementById(id);
    if (el) el.remove();
  },4000);
}

/**
 * state should be editorState.toJSON() result
 * @param state 
 */
function getLexicalEditorElement(state: any){
  const div = document.createElement('div');
  div.classList.add('lexical-wrapper','example-render');
  div.style.setProperty('padding','0px','important');
  div.setAttribute('data-rich-text-editor','');
  const id = 'sect_'.concat(window.crypto.randomUUID());
  div.setAttribute('id',id);
  registerFullEditor(div);
  const editor = getEditorInstances()[id];
  if (editor) {
    const parsedEditorState = editor.parseEditorState(state);
    editor.setEditorState(parsedEditorState);
    editor.setEditable(false);
    return div;
  }
  return null;
}

function getArticleBuilderState(form: HTMLFormElement) {
  const title = document.getElementById('article-title') as HTMLInputElement|null;
  const description = document.getElementById('article-description') as HTMLTextAreaElement|null;
  const imageInput = document.getElementById('article-banner-image') as HTMLInputElement|null;
  const lexicalInput = document.getElementById('article-body') as HTMLDivElement|null;
  const versionInput = document.getElementById('article-version') as HTMLInputElement;
  if (title&&description&&imageInput&&lexicalInput) {
    const image = document.querySelector("input[name=\"article-banner-image-text\"]") as HTMLInputElement|null;
    const version = versionInput && !!!isNaN(parseInt(versionInput.value)) && isFinite(parseInt(versionInput.value)) ? parseInt(versionInput.value) : undefined;
    const editorState = getEditorState(lexicalInput.id);
    if (editorState) {
      return {
        title: title.value,
        description: description.value,
        editorState,
        image: image?.value || '',
        version: version
      }
    }
  }
  return CURRENT_STATE;
}

/**
 * on button[data-edit-article] button click
 */
function onEditArticleBuilder(this:HTMLButtonElement,e:Event) {
  const output=this.closest<HTMLOutputElement>('output');
  if (!!!output) {
    console.error('There should be an output here.');
    return;
  }
  const mobileOutput = output.querySelector<HTMLElement>('article[data-preview-mobile]');
  const tabletOutput = output.querySelector<HTMLElement>('article[data-preview-tablet]');
  const desktopOutput = output.querySelector<HTMLElement>('article[data-preview-desktop]');
  if (!!!mobileOutput||!!!tabletOutput||!!!desktopOutput) {
    dispatchErrorPopover('Unable to find mobile, tablet, or desktop output <article> elements.');
    return;
  }
  const formID = output.getAttribute('form');
  if(formID){
    const form = document.getElementById(formID) as HTMLFormElement|null;
    if (form) {
      output.setAttribute('hidden','');
      form.removeAttribute('hidden');
      const lexicalEditors = Array.from(output.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'));
      if (lexicalEditors.length){
        lexicalEditors.forEach((div)=> {
          const id = div.id;
          if (id) clearEditor(id);
        })
      }
      mobileOutput.innerHTML='';
      tabletOutput.innerHTML='';
      desktopOutput.innerHTML='';
    }
  }
}

/**
 * On button[data-preview-article] button click
 */
async function onPreviewArticleBuilder(this:HTMLButtonElement,e:Event) {
  const form = this.closest<HTMLFormElement>('form');
  const html = document.querySelector('html');
  if (form&&html) {
    const id = form.id;
    const state = getArticleBuilderState(form);
    if (state&&id) {
      const output = document.querySelector<HTMLOutputElement>(`output[form="${id}"]`);
      if (!!!state.title){ 
        dispatchErrorPopover('Unable to find article title.');
        return;
      }
      if (!!!state.editorState){ 
        dispatchErrorPopover('Unable to locate the article body.');
        return;
      }
      if (!!!output) {
        dispatchErrorPopover(`There must be an output element for the form#${id} to preview the article.`);
        return;
      }
      const mobileOutput = output.querySelector<HTMLElement>('article[data-preview-mobile]');
      const tabletOutput = output.querySelector<HTMLElement>('article[data-preview-tablet]');
      const desktopOutput = output.querySelector<HTMLElement>('article[data-preview-desktop]');
      if (!!!mobileOutput||!!!tabletOutput||!!!desktopOutput) {
        dispatchErrorPopover('Unable to find mobile, tablet, or desktop output <article> elements.');
        return;
      }
      const previewTitle = document.createElement('h1');
      previewTitle.classList.add('page-title');
      previewTitle.innerText = state.title;
      const previewDescription = document.createElement('p');
      previewDescription.classList.add('mt-2');
      previewDescription.innerText = state.description;
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth()+1;
      const day = now.getDate();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const datetime = `${year}-${month}-${day}T${hour}:${minutes}`;
      const a = /*html*/`<div class="mt-2 bb-main flex-row justify-between" style="padding-bottom: 4px;">
      <div class="flex-column align-center gap-2" style="width: fit-content;">
        <span class="bold">Date Created:</span>
        <time data-date-format="MM/DD/YYYY" datetime="${datetime}">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
            <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
            </path>
          </svg>
          <span></span>
        </time>
      </div>
      <div class="flex-column align-center gap-2" style="width: fit-content;">
        <span class="bold">Last Edited:</span>
        <time data-date-format="MM/DD/YYYY" datetime="${datetime}">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Edit"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
          <span></span>
        </time>
      </div>
    </div>`;      
      mobileOutput.append(previewTitle.cloneNode(true),previewDescription.cloneNode(true));
      tabletOutput.append(previewTitle.cloneNode(true),previewDescription.cloneNode(true));
      desktopOutput.append(previewTitle.cloneNode(true),previewDescription.cloneNode(true));
      mobileOutput.insertAdjacentHTML('beforeend',a);
      tabletOutput.insertAdjacentHTML('beforeend',a);
      desktopOutput.insertAdjacentHTML('beforeend',a);
      const mobileDiv = getLexicalEditorElement(state.editorState);
      const tabletDiv = getLexicalEditorElement(state.editorState);
      const desktopDiv = getLexicalEditorElement(state.editorState);
      if (mobileDiv&&tabletDiv&&desktopDiv) {
        mobileOutput.append(mobileDiv);
        tabletOutput.append(tabletDiv);
        desktopOutput.append(desktopDiv);
      }
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
      form.setAttribute('hidden','');
      output.removeAttribute('hidden');
    } 
  }
}


function keydownArticleBuilder(e:KeyboardEvent) {
  if ((e.ctrlKey && e.key.toLowerCase() === "s")) {
    e.preventDefault();
    if (LAST_FOCUSED_FORM) {
      const form = document.getElementById(LAST_FOCUSED_FORM);
      if (form) {
        const button = form.querySelector('button[type="submit"][data-submit="save"]');
        if (button) button.dispatchEvent(new Event('click'));
      }
    }
    return false;
  } else if ((e.ctrlKey && e.key.toLowerCase()==="h")) {
    e.preventDefault();
    // hide all editors
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('section[data-article-builder] button[data-hide-show]'));
    buttons.forEach((b) => {
      const el = document.getElementById(String(b.getAttribute('data-el')).slice(1)) as HTMLDivElement|null;
      if (el && !!!el.hasAttribute('hidden')) b.click();
    })
  } else if ((e.ctrlKey && e.key.toLowerCase()==="o")) {
    e.preventDefault();
    // show all editoes
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('section[data-article-builder] button[data-hide-show]'));
    buttons.forEach((b) => {
      const el = document.getElementById(String(b.getAttribute('data-el')).slice(1)) as HTMLDivElement|null;
      if (el && el.hasAttribute('hidden')) b.click();
    })
  }
}

function submitForm(this:HTMLButtonElement,e:Event) {
  var submitType:'submit'|'publish'|'save' = 'submit';
  if (this.getAttribute('data-submit')==='publish') submitType='publish';
  else if (this.getAttribute('data-submit')==='save') submitType='save';

  const form = this.closest<HTMLFormElement>('form');
  if (form) {
    const params = form.getAttribute('data-hx-params');
    const loadingTitle = form.getAttribute('data-loading');
    var post = form.getAttribute('data-hx-post');
    if (params) {
      var paramsStr = '';
      const paramsArr=params.split(',').map((s)=>s.trim()).filter(s=>s.length);
      for (let inputName of paramsArr) {
        const input = form.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
        if (input) {
          if (!!!paramsStr.length) paramsStr+='?';
          else paramsStr+='&';
          paramsStr+=`${inputName}=${input.value}`;
        }
      }
    }
    const target = form.getAttribute('data-hx-target');
    const swap = form.getAttribute('data-hx-swap');
    CURRENT_STATE=getArticleBuilderState(form);
    const state = {...CURRENT_STATE, submitType};
    var loadingDialog:HTMLDivElement|null = null;
    if (state&&post) {
      if (loadingTitle) {
        loadingDialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
        if (loadingDialog) openLoadingDialog(loadingDialog,loadingTitle);
      }
      
      fetch(post,{method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() }, body: JSON.stringify(state)})
      .then((res)=>{
        if (res.status!==200) throw new Error('Network request');
        return res.text();
      })
      .then((res) => {
        if (target) {
          const targetEl = document.querySelector(target);
          const div = document.createElement('div');
          div.insertAdjacentHTML("afterbegin",res);
          if (targetEl) {
            if (!!!swap||swap==='innerHTML') {
              targetEl.innerHTML = div.outerHTML;
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="outerHTML") {
              targetEl.outerHTML = div.outerHTML;
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="beforebegin") {
              targetEl.insertAdjacentElement("beforebegin",div);
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="afterbegin") {
              targetEl.insertAdjacentElement("afterbegin",div);
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="beforeend") {
              targetEl.insertAdjacentElement("beforeend",div);
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="afterend") {
              targetEl.insertAdjacentElement("afterend",div);
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="delete"){
              targetEl.remove();
              if (window.htmx) window.htmx.process(div);;
            } else if (swap==="none") {

            }
            document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
            
          }
        }
        if (loadingDialog) closeDialog(loadingDialog);
      })
      .catch((error)=> {
        console.error(error);
        if (loadingDialog) closeDialog(loadingDialog);
        dispatchErrorPopover('Something went wrong submitting the article.');
      })
    }
  }
}
function setFocusInListener(this:HTMLFormElement,e:Event) {
  const id = this.id;
  if (id) LAST_FOCUSED_FORM = id;
}
function preventFormSubmit(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
}


export function registerArticle(form:HTMLFormElement) {
  form.addEventListener('focusin',setFocusInListener);
  form.addEventListener('submit',preventFormSubmit,true);
  document.addEventListener('keydown',keydownArticleBuilder,true);
  const submitButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit'));
  if (submitButtons) submitButtons.forEach(b=>b.addEventListener('click',submitForm,true));
  const previewButton = form.querySelector<HTMLButtonElement>('button[data-preview-article]');
  if(previewButton) {
    previewButton.addEventListener('click',onPreviewArticleBuilder);
  }
  if(form.id){
    const output = document.querySelector<HTMLOutputElement>(`output[form="${form.id}"]`);
    if(output){
      const editButton = output.querySelector<HTMLButtonElement>('button[data-edit-article]');
      if (editButton) editButton.addEventListener('click',onEditArticleBuilder);
    }
  }

}


export function onLoadArticleBuilder() {
  const form = document.querySelector<HTMLFormElement>('form[data-article]');
  if(form)registerArticle(form);
}

export function onUnloadArticleBuilder() {
  CURRENT_STATE = null;
  document.removeEventListener('keydown',keydownArticleBuilder);
}