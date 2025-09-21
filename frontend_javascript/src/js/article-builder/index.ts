import { NEW_CONTENT_LOADED_CED } from "..";
import { clearEditor, registerFullEditor,  getCurrentEditor, getEditorInstances } from "../lexical-implementation";

function handlePreviewButtonClick(this:HTMLButtonElement,e:Event){
  var title = '';
  const articleBuilder = document.getElementById('article-builder-form') as HTMLFormElement|null;
  const articleTitle = document.getElementById('article-title') as HTMLInputElement|null;
  const html = document.querySelector('html');
  if (articleTitle) title = articleTitle.value;
  const previewArticleDifferentSizes = document.getElementById('preview-article-different-sizes') as HTMLDivElement|null;
  if (articleBuilder&&previewArticleDifferentSizes&&html) {
    const editor = getCurrentEditor();
    if(editor) {
      const editorState = editor.getEditorState();
      const mobileEditor = getEditorInstances()['mobile-article-builder-example'];
      const tabletEditor = getEditorInstances()['tablet-article-builder-example'];
      const desktopEditor = getEditorInstances()['desktop-article-builder-example'];
      if (mobileEditor&&tabletEditor&&desktopEditor) {
        /* MOBILE: */
        const mobileParent = mobileEditor.getRootElement()?.parentElement as HTMLElement|undefined;
        if (mobileParent) {
          const children = Array.from(mobileParent.children);
          const header = children[0];
          const previewDate = children.length>=2 ? children[1] : undefined;
          if (header && header.nodeName==='H1') header.remove();
          if (previewDate && previewDate.hasAttribute('data-preview-article-date')) previewDate.remove();
          const mobileHeader = getPreviewEditorArticleHeader(title);
          const mobilePreviewDate = getPreviewEditorDate();
          mobileParent.insertAdjacentElement("afterbegin",mobileHeader);
          mobileHeader.insertAdjacentElement("afterend",mobilePreviewDate);
        }
        mobileEditor.setEditable(false);
        const parseEditorState = mobileEditor.parseEditorState(editorState.toJSON());
        mobileEditor.setEditorState(parseEditorState);
        /* TABLET: */
        const tabletParent = tabletEditor.getRootElement()?.parentElement  as HTMLElement|undefined;
        if (tabletParent) {
          const children = Array.from(tabletParent.children);
          const header = children[0];
          const previewDate = children.length>=2 ? children[1] : undefined;
          if (header && header.nodeName==='H1') header.remove();
          if (previewDate && previewDate.hasAttribute('data-preview-article-date')) previewDate.remove();
          const tabletHeader = getPreviewEditorArticleHeader(title);
          const tabletPreviewDate = getPreviewEditorDate();
          tabletParent.insertAdjacentElement("afterbegin",tabletHeader);
          tabletHeader.insertAdjacentElement("afterend",tabletPreviewDate);
        }
        tabletEditor.setEditable(false);
        const parseEditorState2 = tabletEditor.parseEditorState(editorState.toJSON());
        tabletEditor.setEditorState(parseEditorState2);
        /* DESKTOP: */
        const desktopParent = desktopEditor.getRootElement()?.parentElement  as HTMLElement|undefined;
        if (desktopParent) {
          const children = Array.from(desktopParent.children);
          const header = children[0];
          const previewDate = children.length>=2 ? children[1] : undefined;
          if (header && header.nodeName==='H1') header.remove();
          if (previewDate && previewDate.hasAttribute('data-preview-article-date')) previewDate.remove();
          const desktopHeader = getPreviewEditorArticleHeader(title);
          const desktopPreviewDate = getPreviewEditorDate();
          desktopParent.insertAdjacentElement("afterbegin",desktopHeader);
          desktopHeader.insertAdjacentElement("afterend",desktopPreviewDate);
        }
        desktopEditor.setEditable(false);
        const parseEditorState3 = desktopEditor.parseEditorState(editorState.toJSON());
        desktopEditor.setEditorState(parseEditorState3);
        
        document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: { el: previewArticleDifferentSizes} }));
        articleBuilder.setAttribute('hidden','');
        previewArticleDifferentSizes.removeAttribute('hidden');
      }
    }
  }
}

function handleEndPreviewButtonClick(this:HTMLButtonElement,e:Event){
  const articleBuilder = document.getElementById('article-builder-form') as HTMLFormElement|null;
  const previewArticleDifferentSizes = document.getElementById('preview-article-different-sizes') as HTMLDivElement|null;
  if (articleBuilder&&previewArticleDifferentSizes) {
    previewArticleDifferentSizes.setAttribute('hidden','');
    articleBuilder.removeAttribute('hidden');
  }
}

function handleArticleBuilderSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const editor = getCurrentEditor();
  if (editor) {
    const str = JSON.stringify(editor.getEditorState().toJSON());
    navigator.clipboard.writeText(str)
    .then(() => {
      const el = document.getElementById('article-builder-success');
      if(el){
        el.setAttribute('aria-hidden','false');
        setTimeout(()=>{
          el.setAttribute('aria-hidden','true');
        },4000);
      }
    })
    .catch((error)=> {
      console.error(error);
      const el = document.getElementById('article-builder-error');
      if(el){
        el.setAttribute('aria-hidden','false');
        setTimeout(()=>{
          el.setAttribute('aria-hidden','true');
        },4000);
      }
    })
  }
}
export function onArticleBuilder() {
  const footer = document.querySelector('footer');
  if (footer) footer.setAttribute('hidden','');
  const pageSpeedDialButton = document.getElementById('speed-dial-main') as HTMLButtonElement|null;
  if(pageSpeedDialButton) pageSpeedDialButton.style.setProperty('bottom','12vh','important');

  const form = document.getElementById('article-builder-form');
  if (form) {
    form.addEventListener('submit',handleArticleBuilderSubmit,true);
  }
  const previewButton = document.getElementById('preview-content-sizes');
  const endPreviewButton = document.getElementById('show-article-editor');
  if(previewButton) previewButton.addEventListener('click',handlePreviewButtonClick);
  if(endPreviewButton)endPreviewButton.addEventListener('click',handleEndPreviewButtonClick);

}
export function onArticleBuilderUnload() {
  const footer = document.querySelector('footer');
  if (footer) footer.removeAttribute('hidden');
  const pageSpeedDialButton = document.getElementById('speed-dial-main') as HTMLButtonElement|null;
  if(pageSpeedDialButton) pageSpeedDialButton.style.removeProperty('bottom');
}

function deleteSection(this:HTMLButtonElement){
  const sections = Array.from(document.querySelectorAll('section[data-article-builder]'));
  const section = this.closest('section[data-article-builder]');
  if (section && sections.length>1) {
    const wrapper = section.querySelector('div.lexical-wrapper');
    if (wrapper) {
      const id = wrapper.id;
      clearEditor(String(id));
      section.remove();
    }
  }
  const deleteSectionButtons = Array.from(document.querySelectorAll('button[data-delete-section]'));
  deleteSectionButtons.forEach((b)=>{
    if(deleteSectionButtons.length===1) b.setAttribute('disabled','');
    else if (b.hasAttribute('disabled')) b.removeAttribute('disabled');
  });
}

function getPreviewEditorArticleHeader(title:string) {
  const header = document.createElement('h1');
  header.classList.add('page-title');
  header.setAttribute('role','presentation');
  header.innerText = title;
  return header;
}
function getPreviewEditorElement(){
  const editor = document.createElement('div');
  editor.classList.add('lexical-wrapper','example-render','mt-3');
  editor.setAttribute('data-rich-text-editor','');
  editor.style.setProperty('padding','0px','important');
  return editor;
}
function getPreviewEditorDate() {
  const div = document.createElement('div');
  div.setAttribute('data-preview-article-date','');
  div.classList.add('flex-row','align-center','justify-between','w-100','bb-main','p-md');
  const articleAuthor = document.createElement('address');
  articleAuthor.classList.add('body1');
  articleAuthor.style.setProperty("font-style","normal",'important');
  articleAuthor.insertAdjacentHTML('afterbegin','<span>By: </span><a class="primary link" href="/" hx-get="/" hx-target="#PAGE" hx-indicator="#page-transition-progress">Frank Brown</a>');
  const dateCreated = document.createElement('time');
  dateCreated.setAttribute('data-date-short','');
  const now = (new Date()).toISOString();
  dateCreated.setAttribute('datetime',now);
  dateCreated.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"></path></svg><span></span>');
  div.append(articleAuthor);
  div.append(dateCreated);
  return div;
}

function handlePreviewArticle(){
  var title = '';
  const articleTitle = document.getElementById('article-title') as HTMLInputElement|null;
  if (articleTitle) title = articleTitle.value;
  const editorWrappers = Array.from(document.querySelectorAll('section[data-article-builder]>div.lexical-wrapper'));
  const ids = editorWrappers.map((obj)=>obj.id).filter((s) => typeof s ==='string') as string[];
  const EDITOR_INSTANCES = getEditorInstances();
  const editors = ids.map((id) => EDITOR_INSTANCES[id]);
  const editorStates = editors.map((editor) => editor.getEditorState());
  const now = Date.now();
  const mobileEditorIdPrefix = 'mobile_'.concat(String(now));
  const tabletEditorIdPrefix = 'tablet_'.concat(String(now));
  const desktopEditorIdPrefix = 'desktop_'.concat(String(now));
  const mobileWrapper = document.querySelector('section#article-preview-section article[data-preview-mobile]');
  const tabletWrapper = document.querySelector('section#article-preview-section article[data-preview-tablet]');
  const desktopWrapper = document.querySelector('section#article-preview-section article[data-preview-desktop]');
  if (mobileWrapper) {
    const header = getPreviewEditorArticleHeader(title);
    const articleInfo = getPreviewEditorDate();
    mobileWrapper.append(header);
    mobileWrapper.append(articleInfo);
    editorStates.forEach((editorState,i) => {
      const editor = getPreviewEditorElement();
      const id = mobileEditorIdPrefix.concat('_').concat(String(i));
      editor.setAttribute('id',id);
      mobileWrapper.append(editor);
      registerFullEditor(editor);
      const EDITOR_INSTANCES = getEditorInstances();
      const thisInstance = EDITOR_INSTANCES[id];
      if (thisInstance) {
        thisInstance.setEditable(false);
        thisInstance.setEditorState(editorState);
      }
    })
  }
  if (tabletWrapper) {
    const header = getPreviewEditorArticleHeader(title);
    const articleInfo = getPreviewEditorDate();
    tabletWrapper.append(header);
    tabletWrapper.append(articleInfo);
    editorStates.forEach((editorState,i) => {
      const editor = getPreviewEditorElement();
      const id = tabletEditorIdPrefix.concat('_').concat(String(i));
      editor.setAttribute('id',id);
      tabletWrapper.append(editor);
      registerFullEditor(editor);
      const EDITOR_INSTANCES = getEditorInstances();
      const thisInstance = EDITOR_INSTANCES[id];
      if (thisInstance) {
        thisInstance.setEditable(false);
        thisInstance.setEditorState(editorState);
        
      }
    })
  }
  if (desktopWrapper) {
    const header = getPreviewEditorArticleHeader(title);
    const articleInfo = getPreviewEditorDate();
    desktopWrapper.append(header);
    desktopWrapper.append(articleInfo);
    editorStates.forEach((editorState,i) => {
      const editor = getPreviewEditorElement();
      const id = desktopEditorIdPrefix.concat('_').concat(String(i));
      editor.setAttribute('id',id);
      desktopWrapper.append(editor);
      registerFullEditor(editor);
      const EDITOR_INSTANCES = getEditorInstances();
      const thisInstance = EDITOR_INSTANCES[id];
      if (thisInstance) {
        thisInstance.setEditable(false);
        thisInstance.setEditorState(editorState);
      }
    })
  }
  document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
  const form = document.getElementById('article-builder-form') as HTMLFormElement|null;
  const previewSection = document.getElementById('article-preview-section') as HTMLElement|null;
  if (form) form.setAttribute('hidden','');
  if (previewSection) previewSection.removeAttribute('hidden');
}
/**
 * When the user wants to go back to editing the article, you need to clear the editors and the innerHTML of the tabs
 * @param this 
 */
function handleEditArticleClick(this:HTMLButtonElement){
  const mobileWrapper = document.querySelector('section#article-preview-section article[data-preview-mobile]');
  const tabletWrapper = document.querySelector('section#article-preview-section article[data-preview-tablet]');
  const desktopWrapper = document.querySelector('section#article-preview-section article[data-preview-desktop]');

  if(mobileWrapper) {
    const editors = Array.from(mobileWrapper.querySelectorAll('div[data-rich-text-editor]'));
    const ids = editors.map((obj) => obj.id).filter(s=>typeof s==='string') as string[];
    ids.forEach((id)=>{
      clearEditor(id);
    });
    mobileWrapper.innerHTML='';
  }
  if(tabletWrapper){
    const editors = Array.from(tabletWrapper.querySelectorAll('div[data-rich-text-editor]'));
    const ids = editors.map((obj) => obj.id).filter(s=>typeof s==='string') as string[];
    ids.forEach((id)=>{
      clearEditor(id);
    });
    tabletWrapper.innerHTML = '';
  }
  if(desktopWrapper){
    const editors = Array.from(desktopWrapper.querySelectorAll('div[data-rich-text-editor]'));
    const ids = editors.map((obj) => obj.id).filter(s=>typeof s==='string') as string[];
    ids.forEach((id)=>{
      clearEditor(id);
    });
    desktopWrapper.innerHTML = '';
  }

  const form = document.getElementById('article-builder-form') as HTMLFormElement|null;
  const previewSection = document.getElementById('article-preview-section') as HTMLElement|null;
  if (previewSection) previewSection.setAttribute('hidden','');
  if (form) form.removeAttribute('hidden');
}

export function onArticleBuilder2() {
  const deleteSectionButtons = Array.from(document.querySelectorAll('button[data-delete-section]'));
  deleteSectionButtons.forEach((b)=>{
    b.addEventListener('click',deleteSection)
    if(deleteSectionButtons.length===1) b.setAttribute('disabled','');
    else if (b.hasAttribute('disabled')) b.removeAttribute('disabled');
  });
  const previewContentButton = document.getElementById('preview-article-button') as HTMLButtonElement|null;
  const editArticleButton = document.getElementById('edit-article-button') as HTMLButtonElement|null;
  if (previewContentButton) previewContentButton.addEventListener('click',handlePreviewArticle);
  if (editArticleButton) editArticleButton.addEventListener('click',handleEditArticleClick);
}