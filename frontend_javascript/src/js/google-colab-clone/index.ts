/* ------------------------------------ ADD CELLS ---------------------------------- */

function addCell(after:undefined|HTMLElement,type:'code'|'markdown') {
  
}

function addCodeButtonOnEnd(this:HTMLButtonElement,e:Event) {
  addCell(undefined,'code');
}

function addMarkdownButtonOnEnd(this:HTMLButtonElement,e:Event) {
  addCell(undefined,'markdown');
}

/* ------------------------------------ THUMB DRAG ---------------------------------- */
function handleThumbDragStart() {

}
function handleThumbDrag() {
  
}
function handleThumbDragEnd() {

}

/* ------------------------------------ CHANGE SIDEBAR SECTION ---------------------------------- */
/**
 * 
 * @param {HTMLButtonElement} this 
 * @param {Event} e 
 */
function onChangeSidebarSection(this:HTMLButtonElement,e:Event) {
  const id = this.id;
  const findReplaceSidebar = document.getElementById('find-replace-sidebar');
  const variablesSidebar = document.getElementById('colab-vars');
  const secretsSidebar = document.getElementById('colab-secrets');
  const uploadFilesSidebar = document.getElementById('colab-files');
  const sidebars:HTMLElement[] = [findReplaceSidebar,variablesSidebar,secretsSidebar,uploadFilesSidebar] as any;
  const parent = this.parentElement; // not NULL
  const currentlySelected = document.querySelector('colab-sidebar-constant>div.selected-sidebar-option'); // Could by NULL
  if (findReplaceSidebar&&variablesSidebar&&secretsSidebar&&uploadFilesSidebar&&parent) {
    switch (id) {
      case 'colab-find-replace': {
        const currentlyOpen = !!!findReplaceSidebar.hasAttribute('hidden');
        if (currentlyOpen) {
          uploadFilesSidebar.setAttribute('hidden','');
          parent.classList.remove('selected-sidebar-option');
        } else {
          if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
          sidebars.filter((el) => el.id!=="find-replace-sidebar").forEach((el)=>el.setAttribute('hidden',''))
          findReplaceSidebar.removeAttribute('hidden');
          parent.classList.add('selected-sidebar-option');
        }
        break;
      }
      case 'colab-vars': {
        const currentlyOpen = !!!variablesSidebar.hasAttribute('hidden');
        if (currentlyOpen) {
          uploadFilesSidebar.setAttribute('hidden','');
          parent.classList.remove('selected-sidebar-option');
        } else {
          if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
          sidebars.filter((el) => el.id!=="colab-vars").forEach((el)=>el.setAttribute('hidden',''))
          variablesSidebar.removeAttribute('hidden');
          parent.classList.add('selected-sidebar-option');
        }
        break;
      }
      case 'colab-secrets': {
        const currentlyOpen = !!!secretsSidebar.hasAttribute('hidden');
        if (currentlyOpen) {
          uploadFilesSidebar.setAttribute('hidden','');
          parent.classList.remove('selected-sidebar-option');
        } else {
          if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
          sidebars.filter((el) => el.id!=="colab-secrets").forEach((el)=>el.setAttribute('hidden',''))
          secretsSidebar.removeAttribute('hidden');
          parent.classList.add('selected-sidebar-option');
        }
        break;
      }
      case 'colab-files': {
        const currentlyOpen = !!!uploadFilesSidebar.hasAttribute('hidden');
        if (currentlyOpen) {
          uploadFilesSidebar.setAttribute('hidden','');
          parent.classList.remove('selected-sidebar-option');
        } else {
          if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
          sidebars.filter((el) => el.id!=="colab-files").forEach((el)=>el.setAttribute('hidden',''))
          variablesSidebar.removeAttribute('hidden');
          parent.classList.add('selected-sidebar-option');
        } 
        break;
      }
      default: {
        console.error("Invalid change sidebar section button.");
        return;
      }
    }
  }
}

/* ------------------------------------ Set Sidebar Hiden ---------------------------------- */
function onHideSidebar(this:HTMLButtonElement,e:Event) {
  const id = this.id;
  const currentlySelected = document.querySelector('colab-sidebar-constant>div.selected-sidebar-option');
  switch (id.replace('colab-hide-sidebar-','')) {
    case '1': {
      const sidebar = document.getElementById('find-replace-sidebar');
      if (sidebar) sidebar.setAttribute('hidden','');
      if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
      break;
    }
    case '2': {
      const sidebar = document.getElementById('variables-sidebar');
      if (sidebar) sidebar.setAttribute('hidden','');
      if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
      break;
    }
    case '3': {
      const sidebar = document.getElementById('secrets-sidebar');
      if (sidebar) sidebar.setAttribute('hidden','');
      if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
      break;
    }
    case '4': {
      const sidebar = document.getElementById('upload-files-sidebar');
      if (sidebar) sidebar.setAttribute('hidden','');
      if (currentlySelected) currentlySelected.classList.remove('selected-sidebar-option');
      break;
    }
    default: {
      console.error("Invalid Hide Sidebar Button");
      return;
    }
  }
}


/* ------------------------------------ ON LOAD / UNLOAD ---------------------------------- */

export default function onLoadColabClone() {
  const resizerThumb = document.getElementById('resizer-thumb');
  if (resizerThumb) {
    resizerThumb.addEventListener('dragstart',handleThumbDragStart);
    resizerThumb.addEventListener('drag',handleThumbDrag);
    resizerThumb.addEventListener('dragend',handleThumbDragEnd);
  }
  const addCodeButton = document.getElementById('add-code-button');
  if (addCodeButton) addCodeButton.addEventListener('click',addCodeButtonOnEnd);
  const addMarkdownButton = document.getElementById('add-markdown-button');
  if (addMarkdownButton) addMarkdownButton.addEventListener('click',addMarkdownButtonOnEnd);

  const colabFindReplaceButton = document.getElementById('colab-find-replace');
  const colabVariablesButton = document.getElementById('colab-vars');
  const colabSecretsButton = document.getElementById('colab-secrets');
  const colabFilesButton = document.getElementById('colab-files');
  if (colabFindReplaceButton) colabFindReplaceButton.addEventListener('click',onChangeSidebarSection);
  if (colabVariablesButton) colabVariablesButton.addEventListener('click',onChangeSidebarSection);
  if (colabSecretsButton) colabSecretsButton.addEventListener('click',onChangeSidebarSection);
  if (colabFilesButton) colabFilesButton.addEventListener('click',onChangeSidebarSection);

  const hideSidebar1 = document.getElementById('colab-hide-sidebar-1');
  const hideSidebar2 = document.getElementById('colab-hide-sidebar-2');
  const hideSidebar3 = document.getElementById('colab-hide-sidebar-3');
  const hideSidebar4 = document.getElementById('colab-hide-sidebar-4');
  if (hideSidebar1) hideSidebar1.addEventListener('click',onHideSidebar);
  if (hideSidebar2) hideSidebar2.addEventListener('click',onHideSidebar);
  if (hideSidebar3) hideSidebar3.addEventListener('click',onHideSidebar);
  if (hideSidebar4) hideSidebar4.addEventListener('click',onHideSidebar);
}
