import { 
  getEditorInstances 
} from "../lexical-implementation";
import { 
  getCodeMirrorEditorText
} from "../code-editors";
import { 
  clearEditor, 
  registerFullEditor 
} from "../lexical-implementation";
import { closeDialog, getCsrfToken, hideOpenPopover, openLoadingDialog } from "../shared";
import { parseMarkdown, purifyUserInputHTML } from "../personal-website/markdown";

var CURRENT_STATE:{
  title: string;
  sectionStates: ({
      type: "lexical";
      state: any;
  }|{
      type: "code";
      html: string;
      css: string;
  }|{
    type: 'markdown';
    markdown: string;
  })[];
  description: string | undefined;
  image: string | undefined;
  version: number | undefined;
} | null = null;
/**
 * Keep track of the last focused form to know on which form you should dispatch the save event 
 * even though there should only be one form per page
 */
var LAST_FOCUSED_FORM:string|undefined = undefined;
var CURRENT_SECTION: string|undefined = undefined;

function getLoader() {
  const html = /*html*/`
  <div class="flex-row justify-center htmx-indicator htmx-request" role="progressbar" aria-busy="false" aria-label="Getting Code...">
    <div class="lds-facebook"><div></div><div></div><div></div></div>
  </div>
  `;
  return html;
}

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
 * 
 * @param wrapper The div.tabs element
 */
function getCodeFromTabs(tabs:HTMLDivElement) {
  const nextElementSibling = tabs.nextElementSibling;
  if (nextElementSibling) {
    const htmlCodeEditor =  nextElementSibling.querySelector<HTMLDivElement>('div[data-codemirror="html"]');
    const cssCodeEditor = nextElementSibling.querySelector<HTMLDivElement>('div[data-codemirror="css"]');
    if(htmlCodeEditor&&cssCodeEditor) {
      const htmlWrapper = htmlCodeEditor.closest<HTMLDivElement>('div[data-editor-wrapper]'); 
      const cssWrapper = cssCodeEditor.closest<HTMLDivElement>('div[data-editor-wrapper]'); 
      if (htmlWrapper&&cssWrapper) {
        const htmlID = htmlWrapper.id;
        const cssID = cssWrapper.id;
        if(htmlID&&cssID){
          const htmlText = getCodeMirrorEditorText(htmlID); 
          const cssText = getCodeMirrorEditorText(cssID); 
          if (typeof htmlText==='string' && typeof cssText==='string') {
            return { html: purifyUserInputHTML(htmlText), css: cssText };
          }
        }
      }
    }
  }
  return null;
}

function getMarkdownFromTabs(tabs:HTMLElement) {
  const nextElementSibling = tabs.nextElementSibling;
  if (nextElementSibling) {
    const makrdownCodeEditor =  nextElementSibling.querySelector<HTMLDivElement>('div[data-codemirror="markdown"]');
    if(makrdownCodeEditor) {
      const markdownWrapper = makrdownCodeEditor.closest<HTMLDivElement>('div[data-editor-wrapper]'); 
      if (markdownWrapper) {
        const markdownID = markdownWrapper.id;
        if(markdownID){
          const markdownText = getCodeMirrorEditorText(markdownID); 
          if (typeof markdownText==='string') {
            return { markdown: markdownText };
          }
        }
      }
    }
  }
  return null;
}

function getArticleBuilderState(form:HTMLFormElement) {
  const articleTitle = form.querySelector<HTMLInputElement>('input[type="text"][data-article-title]');
  const descriptionEl = form.querySelector<HTMLTextAreaElement>('textarea[data-article-description]');
  const imageInputEl = form.querySelector<HTMLInputElement>('input[type="file"][data-article-image]');
  const versionEl = form.querySelector<HTMLInputElement>('input[type="text"][data-article-version]');
  const articleBuilderSections = Array.from(form.querySelectorAll<HTMLElement>('section[data-article-builder]'));
  if(articleTitle&&articleBuilderSections) {
    var description:undefined|string = undefined;
    var image: undefined|string = undefined;
    var version: undefined|number =undefined;
    if (descriptionEl) description = descriptionEl.value;
    if(imageInputEl) {
      const imageInputName = imageInputEl.getAttribute('name');
      if (imageInputName) {
        const pinturaInput = document.querySelector<HTMLInputElement>(`input[name="${imageInputName.concat('-text')}"]`);
        if (pinturaInput&&pinturaInput.value) image = pinturaInput.value;
      }
    }
    if (versionEl) {
      version = parseInt(versionEl.value);
      if (isNaN(version)||!!!isFinite(version)) version = undefined;
    }
    const title = articleTitle.value;
    const sectionStates:({type:'lexical', state: any}|{type:'code', html: string, css: string }|{type:"markdown",markdown:string})[] = [];
    articleBuilderSections.forEach((sect) => {
      const type = sect.getAttribute('data-type');
      if (type==="code") {
        const tab = sect.querySelector<HTMLDivElement>('div.tabs');
        if (tab) {
          const codeObjs = getCodeFromTabs(tab);
          if (codeObjs) {
            sectionStates.push({ type: 'code', ...codeObjs });
          }
        }
      } else if (type==="lexical"){
        const lexicalWrapper = sect.querySelector<HTMLDivElement>('div.lexical-wrapper');
        if (lexicalWrapper) {
          const id = lexicalWrapper.id;
          if (id) {
            const editorOrUndefined = getEditorInstances()[id];
            if (editorOrUndefined) {
              const editorState = editorOrUndefined.getEditorState().toJSON();
              if (editorState) sectionStates.push({type:'lexical',state:editorState});
            }
          }
        }
      } else if (type==="markdown") {
        const tab = sect.querySelector<HTMLDivElement>('div.tabs');
        if (tab) {
          const markdownObj = getMarkdownFromTabs(tab);
          if (markdownObj) sectionStates.push({ type: 'markdown', markdown: markdownObj.markdown })
        }
      }
    });
    return { title, sectionStates, description, image, version };
  }
  return null;
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
      if (state.title.trim().length<1||state.title.trim().length>50){ 
        dispatchErrorPopover('Article title must be between 1 and 50 characters.');
        return;
      }
      if (!!!state.sectionStates.length){ 
        dispatchErrorPopover('There must be at least one article section for the article to be valid.');
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
      const pageTitle = document.createElement('h1');
      pageTitle.classList.add('page-title');
      pageTitle.innerText = state.title;
      mobileOutput.append(pageTitle.cloneNode(true));
      tabletOutput.append(pageTitle.cloneNode(true));
      desktopOutput.append(pageTitle.cloneNode(true));
      /**
       * Array of strings or lexical states.toJSON() or null
       */
      const statesArray:(string|any)[] = [];
      for (let i = 0; i < state.sectionStates.length; i++) {
        const obj = state.sectionStates[i];
        if (obj.type==="lexical") {
          statesArray.push(obj.state);
        } else if (obj.type==="code") {
          const div = document.createElement('div');
          div.style.setProperty('overflow','hidden','important');
          const style = document.createElement('style');
          style.innerText = obj.css;
          div.append(style);
          div.insertAdjacentHTML("beforeend",purifyUserInputHTML(obj.html));
          statesArray.push(div.outerHTML);
        } else if (obj.type==="markdown") {
          const div = document.createElement('div');
          div.style.setProperty('overflow','hidden','important');
          const markdownHTML = await parseMarkdown(obj.markdown,{useDesignSystem:false,breaks:true,gfm:true,pedantic:false});
          div.insertAdjacentHTML("afterbegin",markdownHTML);
          statesArray.push(div.outerHTML);
        }
      }
      statesArray.filter((obj)=>obj!==null).forEach((state) => {
        // HTML, Css, Js Result
        if (typeof state==='string') {
          mobileOutput.insertAdjacentHTML("beforeend",state);
          tabletOutput.insertAdjacentHTML("beforeend",state);
          desktopOutput.insertAdjacentHTML("beforeend",state);
        } else {
          const mobileDiv = getLexicalEditorElement(state);
          const tabletDiv = getLexicalEditorElement(state);
          const desktopDiv = getLexicalEditorElement(state);
          if (mobileDiv&&tabletDiv&&desktopDiv) {
            mobileOutput.append(mobileDiv);
            tabletOutput.append(tabletDiv);
            desktopOutput.append(desktopDiv);
          }
        }

      })
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
      form.setAttribute('hidden','');
      output.removeAttribute('hidden');
    } 
  }
}

function preventFormSubmit(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopImmediatePropagation();
  e.stopPropagation();
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

async function onCodeOutputButtonClick(this:HTMLButtonElement,e:Event) {
  const tabs = this.closest<HTMLDivElement>('div.tabs');
  if (tabs){
    const tabPanels = tabs.nextElementSibling;
    if (tabPanels) {
      const codeObjs = getCodeFromTabs(tabs);
      const outputDiv = tabPanels.querySelector<HTMLDivElement>('div[data-code-output-div]')
      if (outputDiv&&codeObjs) {
        outputDiv.innerHTML='';
        const div = document.createElement('div');
        div.style.setProperty('overflow','hidden','important');
        const style = document.createElement('style');
        style.innerText = codeObjs.css;
        div.append(style);
        div.insertAdjacentHTML("beforeend",codeObjs.html);
        outputDiv.append(div);
      }
    }
  }
}
/**
 * Render Markdown and put it in the output
 * @param this 
 * @param e 
 */
async function onMarkdownOutputButtonClick(this:HTMLButtonElement,e:Event) {
  const tabs = this.closest<HTMLDivElement>('div.tabs');
  if (tabs){
    const tabPanels = tabs.nextElementSibling;
    if (tabPanels) {
      const markdown = getMarkdownFromTabs(tabs);
      const outputDiv = tabPanels.querySelector<HTMLDivElement>('div[data-markdown-output-div]')
      if (outputDiv&&markdown) {
        outputDiv.innerHTML='';
        const div = document.createElement('div');
        div.style.setProperty('overflow','hidden','important');
        const html = await parseMarkdown(markdown.markdown,{useDesignSystem: false, breaks: true, gfm: true, pedantic: false })
        div.insertAdjacentHTML("beforeend",html);
        outputDiv.append(div);
      }
    }
  }
}

function setCurrentSectionOnClick(this:HTMLButtonElement,e:Event) {
  const section = this.closest('section');
  if (section) {
    CURRENT_SECTION = section.id;
  }
}

function deleteArticleSection(this:HTMLButtonElement,e:Event) {
  if (CURRENT_SECTION) {
    const section = document.getElementById(CURRENT_SECTION);
    const form = document.querySelector('form[data-article-builder-final]') as HTMLFormElement|null;
    if (form&&section) {
      const sections = Array.from(form.querySelectorAll('section[data-article-builder]'))
      if(sections&&sections.length>=2) {
        const el = document.getElementById('del-article-section');
        hideOpenPopover('#del-article-section');
        if (el) el.style.setProperty("display","none");
        section.remove();
        if (el) el.style.setProperty("display","none");
        hideOpenPopover('#del-article-section');
        registerArticleBuilderFormListeners(form);
        CURRENT_SECTION=undefined;
      }
    }
  }
}

function setFocusInListener(this:HTMLFormElement,e:Event) {
  const id = this.id;
  if (id) LAST_FOCUSED_FORM = id;
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

function registerArticleBuilderFormListeners(f:HTMLFormElement) {
  const id = f.id;
  f.addEventListener('focusin',setFocusInListener);
  f.addEventListener('submit',preventFormSubmit,true);
  const submitButtons = Array.from(f.querySelectorAll<HTMLButtonElement>('button[type="submit'));
  if (submitButtons) submitButtons.forEach(b=>b.addEventListener('click',submitForm,true));
  const outputCodeButtons = f.querySelectorAll('button[data-output-code]');
  outputCodeButtons.forEach((b) => {
    b.addEventListener('click',onCodeOutputButtonClick);
  });
  const outputMarkdownButtons = f.querySelectorAll('button[data-output-markdown]');
  outputMarkdownButtons.forEach((b) => {
    b.addEventListener('click',onMarkdownOutputButtonClick);
  })
  const articleBuilderSections = Array.from(f.querySelectorAll<HTMLElement>('section[data-article-builder]'));
  articleBuilderSections.forEach((sect)=>{
    const delButton = sect.querySelector<HTMLButtonElement>('button[data-pelem="#del-article-section"]');
    if (delButton) {
      if (articleBuilderSections.length===1&&!!!delButton.hasAttribute('disabled'))delButton.setAttribute('disabled','');
      else if (articleBuilderSections.length>1&&delButton.hasAttribute('disabled')) delButton.removeAttribute('disabled');
      delButton.addEventListener('click',setCurrentSectionOnClick)
    }
  })
  const previewButton = f.querySelector<HTMLButtonElement>('button[data-preview-article]');
  if(previewButton) {
    previewButton.addEventListener('click',onPreviewArticleBuilder);
  }
  if(id){
    const output = document.querySelector<HTMLOutputElement>(`output[form="${id}"]`);
    if(output){
      const editButton = output.querySelector<HTMLButtonElement>('button[data-edit-article]');
      if (editButton) editButton.addEventListener('click',onEditArticleBuilder);
    }
  }
  const deleteArticleSectionBtn = document.getElementById('del-article-section-btn') as HTMLButtonElement|null;
  if (deleteArticleSectionBtn){
    deleteArticleSectionBtn.addEventListener('click',deleteArticleSection);
  }
  document.addEventListener('keydown',keydownArticleBuilder,true);
} 

export function onLoadArticleBuilderFinal() {
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-article-builder-final]'));
  if (forms.length) {
    forms.forEach(f => registerArticleBuilderFormListeners(f));
  }
}

export function onUnloadArticleBuilder() {
  CURRENT_STATE = null;
  document.removeEventListener('keydown',keydownArticleBuilder);
}
