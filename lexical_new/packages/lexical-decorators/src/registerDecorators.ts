/**
 * @todo Will need to change audio and video validation
 */
import { 
  LexicalCommand, 
  createCommand,
  LexicalEditor, 
  COMMAND_PRIORITY_EDITOR,
  $insertNodes,
  LexicalNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  VALID_HEX_REGEX,
  $createParagraphNode,
  $getNodeByKey,  
  CLICK_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  $isDecoratorNode,
  $createNodeSelection,
  $setSelection,
  ElementFormatType,
  COMMAND_PRIORITY_HIGH,
  $isParagraphNode,
  NodeKey,
  $getRoot,
  $createRangeSelection,
  KEY_ENTER_COMMAND,
  $isTextNode,
  DROP_COMMAND,
  DRAGSTART_COMMAND,
  DRAGOVER_COMMAND,
  Spread,
  $isElementNode,
  $nodesOfType
} from "lexical";
import { 
  closeLoadingDialog,
  SCROLL_INTO_VIEW_OPTIONS as SCROLL_INTO_VIEW_OPTIONS_OLD,
  getCurrentEditor,
  closeDialog,
  openLoadingDialog,
  getEditorButtons,
  isTouchDevice,
  setColorInput,
  getDefaultTextColor,
  getEditorInstances,
  getCsrfToken,
  getFileListForFileInput,
  isMobileDevice,
  getDeviceType,
  openDialog,
  getDefaultBackground,
  NEW_CONTENT_LOADED_CED,
  REGISTER_TOOLBAR_LISTENERS,
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED,
  GET_BACKGROUND_COLOR_DIALOG,
  UPDATE_ON_SET_HTML
} from '@lexical/shared';
import { 
  mergeRegister,
  $insertNodeToNearestRoot,
  $wrapNodeInElement,
  $getNearestBlockElementAncestorOrThrow,
  $findMatchingParent
} from "@lexical/utils";
import { 
  $createAudioNode,
  $createCarouselImageNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  $createImageNode,
  $createNewsNode,
  ImageType,
  NewsNodeObject,
  $createVideoNode,
  $createYouTubeNode,
  validateYoutubeUrl,
  $isDecoratorBlockNode,
  $isImageNode,
  HorizontalRuleNode,
  AudioNode,
  VideoNode,
  ImageNode,
  CarouselImageNode,
  NewsNode,
  YouTubeNode,
  MIN_IMAGE_DIMENSION,
  GET_MAX_IMAGE_WIDTH,
  GET_MAX_IMAGE_HEIGHT,
  InstagramNode,
  registerInstagramEditable,
  TwitterNode,
  registerTwitterEditable,
  RedditNode,
  registerRedditEditable,
  TikTokNode,
  registerTikTokEditable,
  INSERT_CAROUSEL_COMMAND
} from ".";
import type { MathNode } from "@lexical/math";
import { DRAG_DROP_PASTE } from "@lexical/rich-text";
import { $onDragOverImage, $onDragStartImage, $onDropImage } from ".";

const SCROLL_INTO_VIEW_OPTIONS = { ...SCROLL_INTO_VIEW_OPTIONS_OLD, block: "end"} as const;

/*---------------------------------------------------- Variables -------------------------------------------*/
/**
 * undefined or an array of node keys
 */
var SELECTED_DECORATORS: undefined|string[] = undefined;
/**
 * The currently selected image
 */
var SELECTED_IMAGE: HTMLImageElement|undefined = undefined;

/* --------------------------------------------------------- Commands ------------------------------------------------ */
export const INSERT_AUDIO_NODE: LexicalCommand<{ src: string, title: string }> = createCommand(
  'INSERT_AUDIO_NODE',
);

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<{ width: number, color: string|undefined }> = createCommand(
  'INSERT_HORIZONTAL_RULE_COMMAND',
);
export const FORMAT_HORIZONTAL_RULE_COMMAND: LexicalCommand<{ width: number, color: string|undefined }> = createCommand(
  'FORMAT_HORIZONTAL_RULE_COMMAND',
);
export const INSERT_IMAGE_COMMAND: LexicalCommand<Spread<ImageType, { width: number, height: number }>> = createCommand('INSERT_IMAGE_COMMAND')
export const INSERT_IMAGES_COMMAND: LexicalCommand<Spread<ImageType, { width: number, height: number }>[]> = createCommand('INSERT_IMAGES_COMMAND')
export const INSERT_NEWS_NODE: LexicalCommand<NewsNodeObject> = createCommand('INSERT_NEWS_NODE');
export const INSERT_VIDEO_NODE: LexicalCommand<{ src: string, title: string, description: string, height:number, width: number }> = createCommand(
  'INSERT_VIDEO_NODE',
);
export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND',
);
export const CAROUSEL_CLICK: LexicalCommand<NodeKey> = createCommand('CAROUSEL_CLICK');
/*------------------------------------------------------ Helpers ------------------------------------------- */
const clampWidth = (num: number) => Math.min(Math.max(1,num),10);
/**
 * Get all the decorator block nodes on the editor and remove the `selected-decorator-block` from them
 * @param editor 
 */
function clearSelectedDecorators(editor: LexicalEditor) {
  const decorators = editor.getDecorators();
  const rootElement = editor.getRootElement();
  if (decorators && rootElement) {
    Object.keys(decorators)
    .forEach((key) => {
      const queryStr = 'div[data-node-key="'.concat(String(key)).concat('"]');
      const blockElement = rootElement.querySelector(queryStr);
      if (blockElement) blockElement.classList.remove('selected-decorator-block');
    })
  }
  SELECTED_DECORATORS=undefined;
}
/**
 * Based on **SELECTED_DECORATORS**, get the block elements with alignable contents and add the `selected-decorator-block` to the elementx
 * @param editor 
 */
function setSelectedDecorators(editor: LexicalEditor) {
  const rootElement = editor.getRootElement();
  const typesSet = new Set<string>();
  if(Array.isArray(SELECTED_DECORATORS)&&rootElement) {
    SELECTED_DECORATORS.forEach((key) => {
      const queryStr = 'div[data-node-key="'.concat(String(key)).concat('"]');
      const blockElement = rootElement.querySelector(queryStr);
      const node = $getNodeByKey(key);
      if (blockElement && !!!(node?.getType()==="math" && node.getEditable())) blockElement.classList.add('selected-decorator-block');
      if (node) typesSet.add(node.getType());
    })
  }
  return typesSet;
}


function clearInnerHTML(element: HTMLElement) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild as ChildNode);
  }
}


/*-------------------------------------- Image Stuff -------------------------------*/
var CURRENT_IMAGE_BG_EDIT:undefined|{ editorNamespace: string, nodeKey: string} = undefined;
var USER_SELECT_CURRENT: { priority: string, value: string} = { priority: '', value: 'default' };
type ImageResizeStateType = {
  currentHeight: 'auto' | number;
  currentWidth: 'auto' | number;
  direction: string;
  isResizing: boolean;
  ratio: number;
  startHeight: number;
  startWidth: number;
  startX: number;
  startY: number;
  editorType: string;
};
/**
 * Keep track of the current resize image state
 */
var IMAGE_RESIZE_STATE: undefined|ImageResizeStateType = undefined;

function onImageResizerMove(e: MouseEvent|TouchEvent) {
  const IS_POINTER_EVENT = e instanceof MouseEvent;
  const clientX = IS_POINTER_EVENT ? e.clientX :  e.touches[0].clientX;
  const clientY = IS_POINTER_EVENT ? e.clientY :  e.touches[0].clientY;

  if (SELECTED_IMAGE && IMAGE_RESIZE_STATE && !!!isNaN(clientX) && !!!isNaN(clientY)) {
    const dir = IMAGE_RESIZE_STATE.direction;
    if (dir==='n'||dir==='s') {
      const COEFFICIENT = Boolean(dir==='n')?-1:1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startY - clientY);
      const height = Math.max(Math.min(GET_MAX_IMAGE_HEIGHT(IMAGE_RESIZE_STATE.editorType),IMAGE_RESIZE_STATE.startHeight - COEFFICIENT*diff),MIN_IMAGE_DIMENSION);
      SELECTED_IMAGE.style.height = `${height}px`;
      IMAGE_RESIZE_STATE.currentHeight = height;
    } else if (dir==='w'||dir==='e') {
      const COEFFICIENT = Boolean(dir==='w')?-1:1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startX - clientX);
      const width = Math.max(Math.min(GET_MAX_IMAGE_WIDTH(IMAGE_RESIZE_STATE.editorType),IMAGE_RESIZE_STATE.startWidth - COEFFICIENT*diff),MIN_IMAGE_DIMENSION);
      SELECTED_IMAGE.style.width = `${width}px`;
      IMAGE_RESIZE_STATE.currentWidth = width;
    } else {
      const COEFFICIENT = Boolean(dir==='nw'||dir==='sw')?-1:1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startX - clientX);
      const width = Math.max(Math.min(GET_MAX_IMAGE_WIDTH(IMAGE_RESIZE_STATE.editorType),IMAGE_RESIZE_STATE.startWidth - COEFFICIENT*diff),MIN_IMAGE_DIMENSION);
      const height = width / IMAGE_RESIZE_STATE.ratio;
      SELECTED_IMAGE.style.width = `${width}px`;
      SELECTED_IMAGE.style.height = `${height}px`;
      IMAGE_RESIZE_STATE.currentWidth = width;
      IMAGE_RESIZE_STATE.currentHeight = height;
    } 
  }
}

function onImageResizeEnd() {
  const editor = getCurrentEditor();
  if (SELECTED_IMAGE && IMAGE_RESIZE_STATE && editor) {
    const decorator = SELECTED_IMAGE.closest('span[data-frank-decorator="true"]');
    if(decorator) {
      const nodeKey = decorator.getAttribute('data-node-key');
      if (nodeKey) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node && $isImageNode(node)) {
            const cW = (IMAGE_RESIZE_STATE as ImageResizeStateType).currentWidth;
            const cH = (IMAGE_RESIZE_STATE  as ImageResizeStateType).currentHeight;
            (IMAGE_RESIZE_STATE as ImageResizeStateType).editorType = editor._editorType;
            if(typeof cW==='number'&&typeof cH==='number') {
              const width = Math.round(cW) ;
              const height = Math.round(cH);
              if (SELECTED_IMAGE) SELECTED_IMAGE.style.removeProperty('height');
              node.setWidth(Number(width.toFixed(2)));
              node.setHeight(Number(height.toFixed(2)));
              node.setOriginalDevice(getDeviceType());
            }
          }
        })
        const controlWrapper = SELECTED_IMAGE.nextElementSibling;
        if (controlWrapper) controlWrapper.classList.remove('image-control-wrapper--resizing');
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.style.setProperty('cursor', 'text');
          document.body.style.setProperty('cursor', 'default');
          document.body.style.setProperty('-webkit-user-select',USER_SELECT_CURRENT.value,USER_SELECT_CURRENT.priority);
        }
        IMAGE_RESIZE_STATE = undefined;
      }
    }

    
  }
  if (!!!isTouchDevice()) {
    document.removeEventListener('mousemove',onImageResizerMove);
    document.removeEventListener('mouseup',onImageResizeEnd);
  } else {
    document.addEventListener('touchmove',onImageResizerMove);
    document.addEventListener('touchend',onImageResizeEnd);
  }
}

/**
 * Called when when of the square blocks around the image is clicked
 */
function onImageResizeStart(this:HTMLDivElement,e:MouseEvent|TouchEvent) {
  const IS_POINTER_EVENT = e instanceof MouseEvent;
  const x = IS_POINTER_EVENT ? e.clientX :  e.touches[0].clientX;
  const y = IS_POINTER_EVENT ? e.clientY :  e.touches[0].clientY;
  const dir = this.getAttribute('data-dir');
  const editor = getCurrentEditor();
  const controlWrapper = this.parentElement;
  if (SELECTED_IMAGE && editor && controlWrapper && dir && !!!isNaN(x) && !!!isNaN(y)) {
    e.preventDefault();
    const rootElement = editor.getRootElement();
    if (rootElement) {
      if (dir==='e'||dir==='w'){
        rootElement.style.setProperty('cursor','ew-resize','important');
        document.body.style.setProperty('cursor','ew-resize','important');
      } else if (dir==='n'||dir==='s') {
        rootElement.style.setProperty('cursor','ns-resize','important');
        document.body.style.setProperty('cursor','ns-resize','important');
      } else if (dir==='ne'||dir==='sw') {
        rootElement.style.setProperty('cursor','nesw-resize','important');
        document.body.style.setProperty('cursor','nesw-resize','important');
      } else if (dir==='nw'||dir==='se') {
        rootElement.style.setProperty('cursor','nwse-resize','important');
        document.body.style.setProperty('cursor','nwse-resize','important');
      }
      USER_SELECT_CURRENT.value = document.body.style.getPropertyValue('-webkit-user-select');
      USER_SELECT_CURRENT.priority = document.body.style.getPropertyPriority('-webkit-user-select');
      document.body.style.setProperty('-webkit-user-select',`none`,'important');
      const { width, height } = SELECTED_IMAGE.getBoundingClientRect();
      const heightStyle = SELECTED_IMAGE.style.height;
      const widthStyle = SELECTED_IMAGE.style.width;

      IMAGE_RESIZE_STATE = {
        currentHeight: heightStyle ? height : 'auto',
        currentWidth: widthStyle ? width : 'auto',
        direction: dir,
        isResizing: true,
        ratio: width / height,
        startHeight: height,
        startWidth:width,
        startX: x,
        startY: y,
        editorType: editor._editorType
      }
      controlWrapper.classList.add('image-control-wrapper--resizing');
    }
    
  }
  if (!!!isNaN(x) && !!!isNaN(y)){
    if (!!!isTouchDevice()) {
      document.addEventListener('mousemove',onImageResizerMove);
      document.addEventListener('mouseup',onImageResizeEnd);
    } else {
      document.addEventListener('touchmove',onImageResizerMove);
      document.addEventListener('touchend',onImageResizeEnd);
    }
  }
  
}

function onDeleteDecorators(editor:LexicalEditor,event: KeyboardEvent) {
  const selection = $getSelection();
  var nodeToSelect:LexicalNode|null = null;

  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    for (let node of nodes) {
      const closestToParent = $findMatchingParent(node,(n) => Boolean(n.getParent()&&n.getParent()?.__type==='root'));
      if (closestToParent) {
        const previousSiblings = closestToParent.getPreviousSiblings();
        const nextSiblings = closestToParent.getNextSiblings();
        var nodeToSelectTemp: null|LexicalNode = null;
        for (let i = 0; i < Math.max(previousSiblings.length,nextSiblings.length); i++) {
          if (previousSiblings[i]) {
              if ($isElementNode(previousSiblings[i])) {
                nodeToSelectTemp = previousSiblings[i];
                break;
              }
          }
          if (nextSiblings[i]) {
            if ($isElementNode(nextSiblings[i])) {
              nodeToSelectTemp = nextSiblings[i];
              break;
            }
          }
        }
        if (nodeToSelectTemp) {
          nodeToSelect = nodeToSelectTemp;
          break;
        }
      }
    }
    if (selection.dirty===true) {
      return false;
    }
    event.preventDefault();
    nodes.forEach((node) => {
      if (node&&node.getType&&node.getType()==="math"&&(node as MathNode).getEditable()&&(node as MathNode).getTextContent().length>0) return;
      else if (node&&node.getType&&node.getType()==='math'&&(node as MathNode).getTextContent().length>0) return;
      else if (node&&node.getType&&node.getType()==='html') {
        const element = editor.getElementByKey(node.getKey()) 
        if (element) {
          const isEditingElement = element.querySelector('div[data-custom-code]');
          if (isEditingElement&&isEditingElement.getAttribute('data-editing')==="false") {
            node.remove();
          } else {
            return;
          }
        }
      }
      else node.remove();
    });
    const root = $getRoot();
    const rangeSelection = $createRangeSelection();
    if (nodeToSelect) {
      rangeSelection.anchor.set(nodeToSelect.__key,0,'element');
      rangeSelection.anchor.set(nodeToSelect.__key,0,'element');
    } else {
      rangeSelection.anchor.set(root.__key,0,"element");
      rangeSelection.focus.set(root.__key,0,"element");
    }
   
    $setSelection(rangeSelection);
    return true;
  }
  return false;
}
/**
 * For the image that is currently selected, remove focus from it
 * @param img 
 */
function clearSelectedImage() {
  if (SELECTED_IMAGE) {
    SELECTED_IMAGE.nextElementSibling?.remove();
    SELECTED_IMAGE.classList.remove('focused','draggable');
    if(SELECTED_IMAGE.parentElement)SELECTED_IMAGE.parentElement.setAttribute('draggable','false');
  }
}

function onChangeImageBackgroundColorSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (CURRENT_IMAGE_BG_EDIT) {
    const dilaog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
    const colorInput = document.getElementById('image-bg-color-lex') as HTMLInputElement|null;
    const transparentInput = document.getElementById('image-bg-color-lex-transparent') as HTMLInputElement|null;
    const shortDescriptionEl = document.getElementById('img-short-description') as HTMLInputElement|null;
    const longDescriptionEl = document.getElementById('img-long-description') as HTMLTextAreaElement|null;
    const editor = getEditorInstances()[CURRENT_IMAGE_BG_EDIT.editorNamespace];
    if (editor&&colorInput&&transparentInput&&dilaog&&shortDescriptionEl&&longDescriptionEl) {
      const transparent=transparentInput.checked;
      const bgColor = colorInput.value;
      if (transparent||!!!VALID_HEX_REGEX.test(bgColor)) {
        editor.update(() => {
          const image = $getNodeByKey(String(CURRENT_IMAGE_BG_EDIT?.nodeKey));
          if ($isImageNode(image)) {
            image.setBackgroundColor(undefined);
            image.setShort(shortDescriptionEl.value);
            image.setLong(longDescriptionEl.value);
          }
          CURRENT_IMAGE_BG_EDIT=undefined;
          closeDialog(dilaog);
        })
      } else {
        editor.update(() => {
          const image = $getNodeByKey(String(CURRENT_IMAGE_BG_EDIT?.nodeKey));
          if ($isImageNode(image)) {
            image.setBackgroundColor(bgColor);
            image.setShort(shortDescriptionEl.value);
            image.setLong(longDescriptionEl.value);
          }
          CURRENT_IMAGE_BG_EDIT=undefined;
          closeDialog(dilaog);
        })
      }
    }
    
  }
}
export function getOpenImageBackgroundColorDialog(key:string,editorNamespace:string,currentBgColor:string|undefined,shortDescription:string,longDescription:string) {
  const func = function() {
    CURRENT_IMAGE_BG_EDIT = { nodeKey: key, editorNamespace };
    const insertAfterDiv = document.getElementById('insert-after-lexical-layout'); 
    if (insertAfterDiv) {
      const str = GET_BACKGROUND_COLOR_DIALOG(getDefaultBackground());
      insertAfterDiv.insertAdjacentHTML("afterbegin",str);
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: insertAfterDiv } }));
      const dialog = document.getElementById('image-bg-color-dialog') as HTMLDivElement|null;
      const colorInput = document.getElementById('image-bg-color-lex') as HTMLInputElement|null;
      const transparentInput = document.getElementById('image-bg-color-lex-transparent') as HTMLInputElement|null;
      const shortDescriptionEl = document.getElementById('img-short-description') as HTMLInputElement|null;
      const longDescriptionEl = document.getElementById('img-long-description') as HTMLTextAreaElement|null;
      const bgForm = document.getElementById('image-bg-color-form') as HTMLFormElement|null;
      if (bgForm) bgForm.addEventListener('submit',onChangeImageBackgroundColorSubmit);
      if (colorInput&&transparentInput&&shortDescriptionEl&&longDescriptionEl) {
        if (currentBgColor===undefined||!!!VALID_HEX_REGEX.test(currentBgColor)) {
          colorInput.value = getDefaultBackground();
          transparentInput.checked = true;
          shortDescriptionEl.value = shortDescription;
          longDescriptionEl.value = longDescription;
        } else {
          colorInput.value = currentBgColor;
          transparentInput.checked = false;
          shortDescriptionEl.value = shortDescription;
          longDescriptionEl.value = longDescription;
        }
      }
      if (dialog) {
        document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
      }
    }    
  }
  return func;
}

/* -------------------------------------------------------- Dialogs ------------------------------------------ */
/**
 * Function for getting the horizontal rule form 
 */
function getHorizontalRuleForm() {
  const dialog = document.getElementById("horizontal-rule-lexical");
  if (dialog) { 
    const form = dialog.querySelector<HTMLFormElement>('form');
    const title = dialog.querySelector<HTMLParagraphElement>('p[data-title]');
    const checkbox = dialog.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const color = dialog.querySelector<HTMLInputElement>('input[type="color"]');
    const width = dialog.querySelector<HTMLInputElement>('input[type="number"]');
    const example = dialog.querySelector<HTMLHRElement>('hr[data-example]');
    return {
      form,
      checkbox,
      title,
      color,
      width,
      example,
      dialog
    }
  } else return null;
}


/**
 * Show the section that allows the user to insert images, audio, and video files.
 * We had to include this because the pintura image editor does not behave correctly in a dialog 
 */
function handleShowInsertMediaSection(btn:HTMLButtonElement,type:'image'|'video'|'audio') {
  const wrapper = btn.closest('div.lexical-wrapper');
  if (wrapper) {
    const insertMediaSections = Array.from(wrapper.querySelectorAll<HTMLDivElement>('div[data-insert-media]'));
    var add: HTMLElement|undefined = undefined;
    insertMediaSections.forEach((el) => {
      if (el) {
        const dataType = el.getAttribute('data-type');
        if (type===dataType){ 
          add = el;
        } else {
          el.setAttribute('hidden','');
          el.className="";
        }
      }
    })
    if (add) {
      (add as HTMLDivElement).removeAttribute('hidden');
      (add as HTMLDivElement).className = "block";
    }
  }
}
function handleInsertImageClick(this:HTMLButtonElement,e:Event) {
  handleShowInsertMediaSection(this,"image");
}
function handleInsertAudioClick(this:HTMLButtonElement,e:Event) {
  handleShowInsertMediaSection(this,"audio");
}
function handleInsertVideoClick(this:HTMLButtonElement,e:Event) {
  handleShowInsertMediaSection(this,"video");
}
function closeInsertMediaSectionHelper(b:HTMLButtonElement,e:Event) {
  const section = b.closest('div[data-insert-media]');
  if (section) {
    section.className = "";
    section.setAttribute('hidden','');
    const wrapper = section.closest('div.lexical-wrapper');
    const error = section.querySelector('div[data-error]');
    if(error) error.setAttribute('hidden','');
  }
}
function closeInsertMediaSection(this:HTMLButtonElement,e:Event) {
  closeInsertMediaSectionHelper(this,e);
}

function openAudioVideoError(b:HTMLButtonElement) {
  const section = b.closest('div[data-form]');
  if (section) {
    const error = section.querySelector('div[data-error-alert]');
    if (error) error.removeAttribute('hidden');
  }
}

function handleInsertMediaSectionSubmit(this: HTMLButtonElement,e:Event) {
  const form = this.closest('div[data-form]');
  const editor = getCurrentEditor();
  if (form && editor) {
    const afterInsertNode = () => {
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED", { detail: { el: this  } }));
    };
    const AFTER_INSERT_NODE_TIMEOUT = 100;
    const dataType = form.getAttribute('data-type');
    const dataCount = form.getAttribute('data-count');
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    if (!!!fileInput) return;
    const inputName = fileInput.getAttribute('name');
    if (!!!inputName) return;
    switch (dataType) {
      case 'image':
        const input = form.querySelector<HTMLInputElement>(`input[type="text"][name="${inputName}-text"]`);
        if (dataCount==="single"&&input) {
          const imageUrl = input.value;
          if (!!!imageUrl.startsWith('https://image.storething.org/frankmbrown/')) return;
          const shortDescription = form.querySelector<HTMLInputElement>(`input[name="${inputName}-short-description"]`);  
          const longDescription = form.querySelector<HTMLTextAreaElement>(`textarea[name="${inputName}-long-description"]`); 
          if (shortDescription&&longDescription) {
            getImageWidthAndHeight(imageUrl)
            .then(({ width, height }) => {
              const imageObj = {
                src: imageUrl,
                short: shortDescription.value,
                long: longDescription.value,
                width,
                height
              };
              editor.dispatchCommand(INSERT_IMAGE_COMMAND,imageObj);
              resetInsertMediaSectionForm(this,e);
              closeInsertMediaSectionHelper(this,e);
              setTimeout(afterInsertNode,AFTER_INSERT_NODE_TIMEOUT);
            })
            .catch((error) => {
              console.error(error);
            })
            
          }
        } else if (dataCount==="multiple"&&input) {
          const multiImageType = form.querySelector<HTMLInputElement>('input[name="multi-image-type"]:checked');

          const imageUrls = input.value.split('|').filter((el) => el.startsWith('https://image.storething.org/frankmbrown/'));
          const imagesToAdd = imageUrls.map(url=>{
            const shortDescription = form.querySelector<HTMLInputElement>(`input[name="${url}-short-description"]`);  
            const longDescription = form.querySelector<HTMLTextAreaElement>(`textarea[name="${url}-long-description"]`); 
            if (shortDescription&&longDescription) {
              return {
                src: url,
                short: shortDescription.value,
                long: longDescription.value
              };
            }  
            return null;
          }).filter((obj) => obj!==null) as {src: string, short: string, long: string}[];
          if (imagesToAdd.length&&multiImageType) {
            if (multiImageType.value==="carousel") {
              Promise.all(imagesToAdd.map((obj) => getImageWidthAndHeight(obj.src)))
              .then((arr) => {
                const objArr = imagesToAdd.map((obj,i) => ({ ...obj, width: arr[i].width, height: arr[i].height }))
                editor.dispatchCommand(INSERT_CAROUSEL_COMMAND,objArr);
                resetInsertMediaSectionForm(this,e);
                closeInsertMediaSectionHelper(this,e);
                setTimeout(afterInsertNode,AFTER_INSERT_NODE_TIMEOUT);
              })
              .catch((e) => {
                console.error(e);
              })
              
            } else if (multiImageType.value==="single") {
              Promise.all(imagesToAdd.map((obj) => getImageWidthAndHeight(obj.src)))
              .then((arr) => {
                const objArr = imagesToAdd.map((obj,i) => ({ ...obj, width: arr[i].width, height: arr[i].height }))
                editor.dispatchCommand(INSERT_IMAGES_COMMAND,objArr);
                resetInsertMediaSectionForm(this,e);
                closeInsertMediaSectionHelper(this,e);
                setTimeout(afterInsertNode,AFTER_INSERT_NODE_TIMEOUT);
              })
              .catch((error) => {
                console.error(error);
              })
            }
            
          }
          
        } 
        return;
      case 'audio':
        if (dataCount==="single") {
          const srcInput = form.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-src-"]');
          if (srcInput) {
            const inputKey = (srcInput.getAttribute('name') as string).replace('audio-input-src-','');
            const title = form.querySelector<HTMLInputElement>('input[name="audio-input-title-'.concat(String(inputKey)).concat('"]'));
            if (!!!title||!!!title.value.length) {
              openAudioVideoError(this);
              return;
            }
            const audioObj = {
              src: srcInput.value,
              title: title?.value ? title.value : ''
            };
            editor.dispatchCommand(INSERT_AUDIO_NODE,audioObj);
            resetInsertMediaSectionForm(this,e);
            closeInsertMediaSectionHelper(this,e);
            setTimeout(afterInsertNode,AFTER_INSERT_NODE_TIMEOUT);
          }
        } 
        return;
      case 'video':
        if (dataCount==="single") {
          const srcInput = form.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-src-"]');
          if (srcInput) {
            const inputKey = (srcInput.getAttribute('name') as string).replace('video-input-src-','');
            const title = form.querySelector<HTMLInputElement>('input[name="video-input-title-'.concat(String(inputKey)).concat('"]'));
            const description = form.querySelector<HTMLTextAreaElement>('textarea[name="video-input-description-'.concat(String(inputKey)).concat('"]'));
            const videoWrapper = srcInput.closest<HTMLDivElement>('div.video-wrapper');
            if (videoWrapper) {
              const video = videoWrapper.querySelector<HTMLVideoElement>('video');
              if (video) {
                const height = video.videoHeight;
                const width = video.videoWidth;
                if (!!!title||!!!title.value.length) {
                  openAudioVideoError(this);
                  return;
                }
                const videoObj = {
                  src: srcInput.value,
                  title: title?.value ? title.value : '',
                  description: description?.value ? description.value : '',
                  height,
                  width
                };
                editor.dispatchCommand(INSERT_VIDEO_NODE,videoObj);
              }             
            }
            resetInsertMediaSectionForm(this,e);
            closeInsertMediaSectionHelper(this,e);
            setTimeout(afterInsertNode,AFTER_INSERT_NODE_TIMEOUT);
          }
        } 
        return;
      default:
        return;
    }
  }
}
function resetInsertMediaSectionForm(b:HTMLButtonElement,e:Event) {
  const form = b.closest<HTMLDivElement>('div[data-form]');
  if (form) {
    const outputs = Array.from(form.querySelectorAll<HTMLOutputElement>('output'));
    outputs.forEach((output) => clearInnerHTML(output));
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="file"]'));
    inputs.forEach((input) => {
      const className = input.className;
      const type = input.getAttribute('type');
      const id = input.id;
      const name = input.getAttribute('name');
      const accept = input.getAttribute('accept');
      if (input.hasAttribute('data-image-input')) input.dispatchEvent(new CustomEvent('delete-image',{detail:{inputName:name}}));
      const multiple = input.hasAttribute('multiple');
      const newInput = document.createElement('input');
      newInput.className=className;
      if(type)newInput.setAttribute('type',type);
      if(accept)newInput.setAttribute('accept',accept);
      if(id)newInput.setAttribute('id',id);
      if(name){
        const inputThatHoldsDBValues = form.querySelector(`input[name="${name}-text"]`);
        if (inputThatHoldsDBValues) inputThatHoldsDBValues.remove();
        newInput.setAttribute('name',name);
      }
      if(multiple) newInput.setAttribute('multiple','');
      if (input.hasAttribute('data-image-input')) newInput.setAttribute('data-image-input','')
      if (input.hasAttribute('data-audio-input')) newInput.setAttribute('data-audio-input','')
      if (input.hasAttribute('data-video-input')) newInput.setAttribute('data-video-input','')
      const parentElement = input.parentElement;
      if (parentElement) parentElement.replaceChild(newInput,input);
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: form }}));
    });
    form.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
  }
}
function handleInsertMediaSectionReset(this: HTMLButtonElement,e:Event) {
  resetInsertMediaSectionForm(this,e);
}




/* ------------------------------------- Horizontal Rule Stuff ------------------------------- */
/**
 * Handle the submit of the horizontal rule form
 * @param this 
 * @param e 
 */
function handleHorizontalRuleSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  const form = getHorizontalRuleForm();
  const color = form?.color;
  const width = form?.width;
  const checkbox = form?.checkbox;
  const dialog = form?.dialog;
  if (form &&dialog&&checkbox&&color&&width) {
    const editor = getCurrentEditor();
    if (editor && SELECTED_DECORATORS && SELECTED_DECORATORS.length>=1) {
      editor.update(() => {
        var UPDATED_HRS = false;
        if (SELECTED_DECORATORS && SELECTED_DECORATORS.length>=1) {
          SELECTED_DECORATORS.forEach((dec) => {
            var node = $getNodeByKey(dec) ;
            if (node) {
              if ($isHorizontalRuleNode(node)) {
                node.setHorizontalRuleStyle({ color: checkbox.checked?'var(--divider)':color.value, width: Number(width.value)});
                UPDATED_HRS = true;
                const dom = editor._rootElement;
                if (dom) {
                  const hr = dom.querySelector<HTMLElement>(`div[data-node-key="${dec}"]>hr`);
                  if (hr) {
                    hr.style.setProperty('border-bottom-width',String(width.value).concat('px'));
                    if (checkbox.checked) {
                      hr.classList.add('divider-color');
                      hr.style.removeProperty('border-bottom-color');
                    } else {
                      if (hr.classList.contains('divider-color')) hr.classList.remove('divider-color');
                      hr.style.setProperty('border-bottom-color',color.value);
                    }
                    
                  }
                }
              }
            }
          })
          if (!!!UPDATED_HRS) editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND,{ color: checkbox.checked?'var(--divider)':color.value, width: Number(width.value)});
        }
      })
    } else if(editor) {
      editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND,{ color: checkbox.checked?'var(--divider)':color.value, width: Number(width.value)});
    }
    closeDialog(form.dialog as HTMLDivElement);
  }
}
/**
 * When an input on the horizontal rule form changes, change the example horizontal rule to reflect that
 */
function handleHorizontalRuleChange(this: HTMLFormElement, e: Event){
  const form = getHorizontalRuleForm();
  if (form && form.checkbox && form.color && form.width && form.example) {
    const width = form.width.value;
    const divider = form.checkbox.checked;
    const colorInput = VALID_HEX_REGEX.test(form.color.value)?form.color.value:'var(--divider)';
    const color = divider?'var(--divider)':colorInput;
    form.example.style.borderBottomWidth = String(width).concat('px');
    form.example.style.borderBottomColor = color;
  }
}

/* ------------------------------------------- Embed News and Youtube ---------------------- --------------- */
/**
 * Function to be called whenever embedding content is successful
 * @param form 
 * @param e 
 * @param dialog 
 */
function onEmbedSuccess(form: HTMLFormElement,dialog: HTMLDivElement) {
  const errorAlert = dialog.querySelector('div[data-embed-error]');
  if (errorAlert) errorAlert.setAttribute('hidden','');
  form.reset();
  closeDialog(dialog);
}
/**
 * Function to be called whenever there is an error embedding content
 * @param this 
 * @param e 
 * @param dialog 
 */
function onEmbedError(dialog: HTMLDivElement) {
  const errorAlert = dialog.querySelector('div[data-embed-error]');
  if (errorAlert) errorAlert.removeAttribute('hidden');
}
const VALID_URL_REGEX= /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export type NewsContentResponse = {
  url: string;
  title: string;
  description: string;
  imageURL: string;
  host: string;
};
/**
 * To embed a news article, the provided url must have:
 * a `<meta property="og:type"/>` with a content of article
 * a `<meta property="og:title"/>` with a non-empty content value
 * a `<meta property="og:image"/>` with a valid image that has can be obtained
 * a `<meta property="og:description"/>` with a non empty content attribute
 * @param form 
 * @param e 
 * @param dialog 
 */
async function handleEmbedNews(form: HTMLFormElement,e:Event,dialog: HTMLDivElement) {
  try {
    const url = form.querySelector<HTMLInputElement>('input[id="lex-embed-news-input"]');
    if (!!!url) throw new Error('Please enter a valid url.');
    if (!!!VALID_URL_REGEX.test(url.value)) throw new Error('Please enter a valid url.');
    const body = { embed_type:'news', url: url.value };
    openLoadingDialog("Generating News Article Embed...");
    const resp = await fetch('/api/embed',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json', 'X-CSRF-Token': getCsrfToken()}});
    if (resp.status!==200) {
      throw new Error("Something went wrong embedding news.");
    }
    const obj = await resp.json() as NewsContentResponse;
    const editor = getCurrentEditor();
    if (editor) editor.dispatchCommand(INSERT_NEWS_NODE,obj);
    closeLoadingDialog();
    if (resp.status!==200) throw new Error('Something went wrong embedding news content.');
    onEmbedSuccess(form,dialog);
  } catch (error) {
    closeLoadingDialog();
    onEmbedError(dialog);
  }
}
/**
 * Embed youtube video in the input
 * @param form 
 * @param e 
 * @param dialog 
 */
function handleEmbedYoutube(form: HTMLFormElement,e:Event,dialog: HTMLDivElement) {
  try {
    const textInput = form.querySelector<HTMLInputElement>('input[type="url"]');
    if (!!!textInput) throw new Error('Can\'t find url for youtube video.');
    const videoID = validateYoutubeUrl(textInput.value);
    if (videoID) {
      const editor = getCurrentEditor();
      if (editor) {
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND,String(videoID));
        onEmbedSuccess(form,dialog); 
      }
    } else throw new Error('Invalid Youtube url.');
  } catch (error) {
    closeLoadingDialog();
    onEmbedError(dialog);
  }
}
function onNewsFormSubmit(dialog:HTMLDivElement,form:HTMLFormElement) {
  const func = function (e:Event) {
    handleEmbedNews(form,e,dialog);
  }
  return func;
}
function onYoutubeFormSubmit(dialog:HTMLDivElement,form:HTMLFormElement) {
  const func = function (e:Event) {
    handleEmbedYoutube(form,e,dialog);
  }
  return func;
}


function getOnOpenNewsDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-embed-news") {
    const newsDialog = document.getElementById('lex-embed-news') as HTMLDivElement|null;
    if (newsDialog) {
      const form = newsDialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',onNewsFormSubmit(newsDialog,form))
      }
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: newsDialog as HTMLDivElement }}));
  }
} 

function getOnOpenYouTubeDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-embed-youtube") {
    const youtubeDialog = document.getElementById('lex-embed-youtube') as HTMLDivElement|null;
    if (youtubeDialog) {
      const form = youtubeDialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',onYoutubeFormSubmit(youtubeDialog,form))
      }
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: youtubeDialog as HTMLDivElement }}));
  }
}

const isMathNode = (node: LexicalNode) => Boolean(node.getType()==="math");

function setToolbarSelectedImage(wrapper:HTMLDivElement) {
  const buttons = getEditorButtons(wrapper);
  Object.values(buttons)
  .forEach((b) => {
    if(b&&b.nodeName==="BUTTON"){
      if (b.hasAttribute('data-lexical-image-button')) b.classList.add('selected');
      else if (b.getAttribute('data-dispatch')==="FORMAT_ELEMENT_COMMAND") return;
      else {
        b.setAttribute('disabled','');
      }
    }
  })
}

function getImageWidthAndHeight(url:string) {
  return new Promise<{width: number, height: number }>((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.decode()
    .then(() => {
      resolve({width: Math.max(img.naturalWidth,50), height: Math.max(img.naturalHeight,25)})
    })
    .catch((e) => {
      console.error(e);
      resolve({ width: 50, height: 25 })
    })
  });
}

function onGifButtonClick(this:HTMLButtonElement,e:Event) {
  const div = this.parentElement;
  if (div) {
    const input = div.querySelector<HTMLInputElement>('input');
    if (input) {
      if (input) input.addEventListener<any>('gif-upload',handleGifUpload);
      input.click();
    }
  }
}
async function handleGifUpload(this:HTMLInputElement,e:CustomEvent<{urls: string[]}>) {
  try {
    const wrapper = this.closest<HTMLDivElement>('div.lexical-wrapper');
    if (wrapper&&wrapper.id){
      const id = wrapper.id;
      const urls = e.detail.urls;
      const editors = getEditorInstances();
      const editor = editors[id];
      if (editor){
        const widthsAndHeights = await Promise.all(urls.map((obj) => getImageWidthAndHeight(obj)))
        editor.dispatchCommand(INSERT_IMAGES_COMMAND,urls.map((url,i) => ({src: url, short: '', long: '', width: widthsAndHeights[i].width, height: widthsAndHeights[i].height })))
      }
    }
  } catch (error) {
    console.error(error);
  }
}

/*----------------------------------------------------- Register Decorators ----------------------------------- */
function registerDecoratorsListeners(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if(wrapper){
    const closeInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('button.close-insert-media-section'));
    const submitInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('div[data-insert-media] button[data-submit]'));
    const resetInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('div[data-insert-media] button[data-reset]'));
    // Handle with registerImage or registerInlineImage
    const insertImageButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-image-button]');
    if (insertImageButton) insertImageButton.addEventListener('click',handleInsertImageClick);
    // Handle with registerAudioNodes
    const insertAudioButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-audio-button]');
    if (insertAudioButton) insertAudioButton.addEventListener('click',handleInsertAudioClick);
    // Handle with registerVideoNodes
    const insertVideoButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-video-button]');
    if (insertVideoButton) insertVideoButton.addEventListener('click',handleInsertVideoClick);
    if(Array.isArray(closeInsertMediaSectionButtons))closeInsertMediaSectionButtons.forEach(b=>b.addEventListener('click',closeInsertMediaSection))
    if(Array.isArray(submitInsertMediaSectionButtons))submitInsertMediaSectionButtons.forEach(b=>b.addEventListener('click',handleInsertMediaSectionSubmit));
    if(Array.isArray(resetInsertMediaSectionButtons))resetInsertMediaSectionButtons.forEach(b=>b.addEventListener('click',handleInsertMediaSectionReset));

    const gifButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-gif-button]');
    if(gifButton) gifButton.addEventListener('click',onGifButtonClick);
  }
}
function getOnOpenDecoratorsLexical(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="horizontal-rule-lexical") {
      const horizontalRuleForm = getHorizontalRuleForm();
      if (horizontalRuleForm&&horizontalRuleForm.form) {
      horizontalRuleForm.form.addEventListener("submit",handleHorizontalRuleSubmit);
      horizontalRuleForm.form.addEventListener("change",handleHorizontalRuleChange);
      const editor = getCurrentEditor();
      if (editor&&SELECTED_DECORATORS&&SELECTED_DECORATORS.length) {
        editor.getEditorState().read(() => {
          if (SELECTED_DECORATORS&&SELECTED_DECORATORS.length>=1) {
            const node = $getNodeByKey(SELECTED_DECORATORS[0]);
            if ($isHorizontalRuleNode(node)) {
              const width = node.getWidth();
              const color = node.getColor();
              const widthInput = document.getElementById('lex-horizontal-rule-width') as HTMLInputElement|null;
              const colorInput = document.getElementById('lex-horizontal-rule-color') as HTMLInputElement|null;
              const defaultHR = document.getElementById('horizontal-rule-default') as HTMLInputElement|null;
              if (widthInput) widthInput.value = String(width);
              if (colorInput) colorInput.value = String(color==="var(--divider)" ? getDefaultTextColor() : color);
              if (defaultHR) defaultHR.checked = Boolean(color==='var(--divider)');
            }
          }
        })
      }
      document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: horizontalRuleForm.dialog as HTMLDivElement }}));
      }
    }
}
function getOnOpenImageBackgroundLexical(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="image-bg-color-dialog") {
      const bgForm = document.getElementById('image-bg-color-form') as HTMLFormElement|null;
      if (bgForm) bgForm.addEventListener('submit',onChangeImageBackgroundColorSubmit);
      const dialog = document.getElementById('image-bg-color-dialog');
      if (dialog) {
        document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
      }
    }
}

export function registerDecoratorsEditable(editor:LexicalEditor) {
  registerDecoratorsListeners(editor);
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  

  const arr: (() => void)[] = [];
  if (editor.hasNode(HorizontalRuleNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenDecoratorsLexical);
    arr.push(editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      (payload) => {
        const horizontalRuleNode = $createHorizontalRuleNode({ color: String(payload.color), width: payload.width })
        $insertNodeToNearestRoot(horizontalRuleNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ));
    arr.push(editor.registerCommand(
      FORMAT_HORIZONTAL_RULE_COMMAND,
      (payload) => {
        const color = VALID_HEX_REGEX.test(String(payload.color))?String(payload.color):'var(--divider)';
        const width = clampWidth(payload.width);
        const selection = $getSelection();
        if ($isNodeSelection(selection)||$isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          for (let node of nodes) {
            if ($isHorizontalRuleNode(node)) {
              node.setHorizontalRuleStyle({color,width});
            }
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ));
  }
  if (editor.hasNode(AudioNode)) {
    arr.push(
      editor.registerCommand(
        INSERT_AUDIO_NODE,
        (payload) => {
          if (payload.src.startsWith('https://audio.storething.org/frankmbrown/',0) && payload.title.length) {
            const audioNode = $createAudioNode(payload);
            $insertNodeToNearestRoot(audioNode);
            const key = audioNode.getKey();
            try {
              const element = editor.getElementByKey(key);
              if (element) element.scrollIntoView();
            } catch (e) {
            }
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(AudioNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            const el_id = editor._config.namespace;
            setTimeout(() => {
              const el = document.getElementById(el_id) as HTMLDivElement|null;
              if (el) document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: {el} }));
            },500);
          }
        }
      })
    );
  }
  if (editor.hasNode(VideoNode)) {
    arr.push(
      editor.registerCommand(
        INSERT_VIDEO_NODE,
        (payload) => {
          if (payload.src.startsWith('https://video.storething.org/frankmbrown/',0) && payload.title.length) {
            const videoNode = $createVideoNode(payload);
            $insertNodeToNearestRoot(videoNode);
            const key = videoNode.getKey();
            try {
              const element = editor.getElementByKey(key);
              if (element) element.scrollIntoView();
            } catch (e) {
            }
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(VideoNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            const el_id = editor._config.namespace;
            setTimeout(() => {
              const el = document.getElementById(el_id) as HTMLDivElement|null;
              if (el) document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: {el} }));
            },500);
          }
        }
      })
    );
  }
  if (editor.hasNode(ImageNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenImageBackgroundLexical);
    arr.push(editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const deviceType = getDeviceType();
        const node =  $createImageNode({...payload, width:payload.width, height:payload.height, originalDevice: deviceType, backgroundColor: undefined });
        $insertNodes([node]);
        if (!!!$isParagraphNode(node.getParentOrThrow())) {
          $wrapNodeInElement(node,$createParagraphNode).selectEnd();
          const parent = node.getParent();
          if ($isParagraphNode(parent)) {
            parent.setFormat('center');
          }
        } else if ($isParagraphNode(node.getParentOrThrow())) {
          const p = node.getParentOrThrow();
          p.setFormat('center');
        }
        const key = node.getKey();
        try {
          const element = editor.getElementByKey(key);
          if (element) element.scrollIntoView();
        } catch (e) {
        }
        return true;  
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      INSERT_IMAGES_COMMAND,
      (payload) => {
        const deviceType = getDeviceType();
        const nodes = payload.map((obj) =>  $createImageNode({...obj, width:obj.width, height:obj.height, originalDevice: deviceType, backgroundColor: undefined  }))
        $insertNodes(nodes);
        if (!!!$isParagraphNode(nodes[0].getParentOrThrow())) {
          $wrapNodeInElement(nodes[0],$createParagraphNode).selectEnd();
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ));
    arr.push(registerDecoratorsNotEditable(editor,false));
  }
  if (editor.hasNode(CarouselImageNode)) {
    arr.push(
      editor.registerCommand(
        INSERT_CAROUSEL_COMMAND,
        (payload) => {
          const node = $createCarouselImageNode(payload);
          $insertNodeToNearestRoot(node);
          const el_id = editor._config.namespace;
          setTimeout(() => {
            const el = document.getElementById(el_id) as HTMLDivElement|null;
            if (el) document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: { el }}));
          },500);
          const key = node.getKey();
          try {
            const element = editor.getElementByKey(key);
            if (element) element.scrollIntoView();
          } catch (e) {
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(  
        CAROUSEL_CLICK,
        (key) => {
          const nodeSelection = $createNodeSelection();
          nodeSelection.add(key);
          $setSelection(nodeSelection);
          SELECTED_DECORATORS = [key];
          setSelectedDecorators(editor);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(
        CarouselImageNode,
        (nodeMutations) => {
          for (const [nodeKey, mutation] of nodeMutations) {
            if (mutation === 'created') {
              const el_id = editor._config.namespace;
              setTimeout(() => {
                const el = document.getElementById(el_id) as HTMLDivElement|null;
                if (el) document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>("NEW_CONTENT_LOADED",{ detail: { el }}));
              },500);
            }
          }
        }
      )
    )
  }
  if (editor.hasNode(NewsNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenNewsDialog)
    arr.push(editor.registerCommand(
      INSERT_NEWS_NODE,
      (payload) => {
        const {url,title,description,imageURL,host} = payload;
        const node = $createNewsNode({url,title,description,imageURL,host,format:'center'});
        $insertNodeToNearestRoot(node);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ));
  }
  if (editor.hasNode(YouTubeNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenYouTubeDialog)
    arr.push(editor.registerCommand(
      INSERT_YOUTUBE_COMMAND,
      (payload) => {
        const youTubeNode = $createYouTubeNode(payload);
        youTubeNode.setFormat('center');
        $insertNodeToNearestRoot(youTubeNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ));
  }
  if (editor.hasNode(InstagramNode)) arr.push(registerInstagramEditable(editor));
  if (editor.hasNode(TwitterNode)) arr.push(registerTwitterEditable(editor));
  if (editor.hasNode(TikTokNode)) arr.push(registerTikTokEditable(editor));
  return mergeRegister(
    ...arr,
    editor.registerCommand(
      FORMAT_ELEMENT_COMMAND,
      (formatType: ElementFormatType) => {
        const selection = $getSelection();
        if($isNodeSelection(selection) || $isRangeSelection(selection)){
          const nodes = selection.getNodes();
          for (let node of nodes) {
            if ($isDecoratorNode(node)) {
              if ($isImageNode(node)) {
                const parent = node.getParentOrThrow();
                if (parent) parent.setFormat(formatType);
              } else if ($isDecoratorBlockNode(node)) {
                node.setFormat(formatType);
              }
            } else {
              const element = $getNearestBlockElementAncestorOrThrow(node);
              element.setFormat(formatType);
            }
          }
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        var CLEAR_IMAGE = true;
        if (event.target) {
          var el:null|HTMLElement = event.target as HTMLElement;
          var i = 0;
          while (i < 10) {
            if (el.hasAttribute('data-frank-decorator')) break;
            else {
              el = el.parentElement as HTMLElement|null;
              if (!!!el) break;
              i+=1;
            }
          }
          if(el){
            const isDecorator = (<HTMLDivElement>el).getAttribute('data-frank-decorator');
            if (isDecorator==="true") {
              event.preventDefault();
              event.stopPropagation();
              if ((el.nodeName!=='SPAN'&&el.className!=="lexical-math")&&(!!!el.classList.contains('splide'))) {
                (<HTMLDivElement>el).classList.add('selected-decorator-block');
              }
              if (el.classList.contains('rte-image')) {
                CLEAR_IMAGE = false;
                if (SELECTED_IMAGE && el.getAttribute('src')!==SELECTED_IMAGE.getAttribute('src')) {
                  clearSelectedImage();
                }
                const img = el.querySelector('img');
                const div = el.querySelector('div[data-image-wrapper="true"]');
                if (img) {
                  img.classList.add('focused','draggable');
                  const div = document.createElement('div');
                  const arr = ['n','ne','e','se','s','sw','w','nw'];
                  arr.forEach((dir) => {
                    const newDiv = document.createElement('div');
                    newDiv.className = `image-resizer image-resizer-${dir}`;
                    newDiv.setAttribute('data-dir',dir);
                    if (!!!isTouchDevice()) newDiv.addEventListener('mousedown',onImageResizeStart);
                    else newDiv.addEventListener('touchstart',onImageResizeStart);
                    div.append(newDiv);
                  })
                  img.insertAdjacentElement("afterend",div);
                  img.setAttribute('draggable','false');
                  SELECTED_IMAGE = img;
                  if(wrapper)setToolbarSelectedImage(wrapper as HTMLDivElement);
                }
                if (div) div.setAttribute('draggable','true');
              } 
              const nodeKey = (<HTMLDivElement>el).getAttribute('data-node-key');
              if (nodeKey) {
                SELECTED_DECORATORS = [nodeKey];
                const nodeSelection = $createNodeSelection();
                nodeSelection.add(nodeKey);
                $setSelection(nodeSelection);
              }
              if (CLEAR_IMAGE) {
                clearSelectedImage();
              }
              return true;
            }
          }
        } 
        if (CLEAR_IMAGE) {
          clearSelectedImage();
        }
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      KEY_DELETE_COMMAND,
      (payload) => {
        const resp = onDeleteDecorators(editor,payload)
        if ((window as any).closeFloatingContextMenu) (window as any).closeFloatingContextMenu();
        return resp;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      KEY_BACKSPACE_COMMAND,
      (payload) => {
        const resp = onDeleteDecorators(editor,payload)
        if ((window as any).closeFloatingContextMenu) (window as any).closeFloatingContextMenu();
        return resp;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        var selectedTypes = new Set<string>();
        var align: undefined|null|ElementFormatType = undefined;
        clearSelectedDecorators(editor);
        const selection = $getSelection();
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          if (isMathNode(nodes[0])) {
            const key = nodes[0].getKey();
            const decorators = editor.getDecorators();
            Object.keys(decorators).forEach((key2)=> {
              if (key2!==key && $getNodeByKey(key2) && isMathNode($getNodeByKey(key2) as LexicalNode)) ($getNodeByKey(key2) as any).setEditable(false);
            })
            nodes[0].setEditable(true);
            const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
            if (wrapper) {
              const buttons = getEditorButtons(wrapper as any);
              Object.values(buttons).forEach((b)=>{
                if(b && b.nodeName==="BUTTON"){
                  const editHistory = b.getAttribute('data-dispatch');
                  if (editHistory==='UNDO_COMMAND'||editHistory==='REDO_COMMAND'||editHistory==='CLEAR_EDITOR_COMMAND'){
                    return;
                  } else {
                    b.setAttribute('disabled','');
                  }
                }
              });
            }
            
            return true;
          }
          const arr:string[] = [];
          nodes.forEach((n) => {
            if ($isDecoratorBlockNode(n)) {
              const key = n.getKey();
              arr.push(key);
              if (align!==null) {
                const currentAlign = n.getFormat();
                if(align===undefined)align=currentAlign;
                else if (align===currentAlign) {
                  return;
                } else if (align!==currentAlign) {
                  align=null;
                  return;
                }
              }
            }
            if ($isHorizontalRuleNode(n)&&editor.isEditable()){
              const width = n.getWidth();
              const color = n.getColor();
              const colorInput = document.getElementById('lex-horizontal-rule-color');
              if (colorInput) setColorInput(colorInput,(color==='var(--divider)')?getDefaultTextColor():color);
              const widthInput = document.getElementById('lex-horizontal-rule-width')as HTMLInputElement|null;
              if(widthInput){
                widthInput.value=String(width);
                widthInput.dispatchEvent(new Event('change'));
              }
            }
          })
          SELECTED_DECORATORS = arr;
          selectedTypes = setSelectedDecorators(editor);
        } else if (DEPRECATED_$isGridSelection(selection)) {
          SELECTED_DECORATORS = undefined;
          selectedTypes = setSelectedDecorators(editor);
        } else {
          const decorators = editor.getDecorators();
          for (let key of Object.keys(decorators)){
            const node = $getNodeByKey(key)
            if (node && isMathNode(node) && node.getEditable()) node.setEditable(false);
          }
        }
        if (wrapper) {
          const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
          if (wrapper) {
            if (SELECTED_IMAGE) selectedTypes.add('image');
            const buttons = getEditorButtons(wrapper as any);
            Object.values(buttons).forEach((b)=>{
              if(b && b.nodeName==="BUTTON"){
                if (b.hasAttribute('data-lexical-image-button')){ 
                  if (selectedTypes.has('image')){b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.hasAttribute('data-lexical-audio-button')){ 
                  if (selectedTypes.has('audio-node')){b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.hasAttribute('data-lexical-video-button')){ 
                  if (selectedTypes.has('video-node')) {b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.hasAttribute('data-lexical-embed-media')){
                  if (selectedTypes.has('news')||selectedTypes.has('youtube')) {b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.hasAttribute('data-lexical-math-button')){
                  if (selectedTypes.has('math')) {b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.hasAttribute('data-lexical-hr-button')){
                  if (selectedTypes.has('horizontal-rule')) {b.classList.add('selected');b.removeAttribute('disabled');} 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                if (b.getAttribute('data-dispatch')==="FORMAT_ELEMENT_COMMAND"){
                  if (selectedTypes.has('image')||selectedTypes.has('youtube')) {
                    const payload = b.getAttribute('data-payload');
                    if (payload===align) b.classList.add('selected');
                    else b.classList.remove('selected');
                    b.removeAttribute('disabled');
                  } 
                  else if (selectedTypes.size>0) {b.setAttribute('disabled',''); b.classList.remove('selected');}
                  else {b.removeAttribute('disabled'); b.classList.remove('selected');}
                  return;
                }
                const editHistory = b.getAttribute('data-dispatch');
                if (editHistory==='UNDO_COMMAND'||editHistory==='REDO_COMMAND'||editHistory==='CLEAR_EDITOR_COMMAND'){
                  return;
                }
                if (selectedTypes.size>0) b.setAttribute('disabled','');
                else b.removeAttribute('disabled');
              } else return;
            })
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    ),
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      (e) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&selection.isCollapsed()){
          const nodes = selection.getNodes();
          if (nodes.length) {
            const node = nodes[0];
            if ($isTextNode(node)) {
              const parent = node.getParent();
              if ($isParagraphNode(parent)) {
                const textContent = parent.getTextContent();
                if (/^-----(\[#[a-fA-F0-9]{6}])?(\[\d+\])?$/.test(textContent)) {
                  var hexColor = '';
                  var width = 0;
                  const firstIndexBracket = textContent.indexOf('[');
                  if (firstIndexBracket!==-1){
                    const endBracketFirst = textContent.indexOf(']');
                    if (endBracketFirst!==-1) {
                      const firstGroup = textContent.slice(firstIndexBracket+1,endBracketFirst);
                      if (firstGroup.startsWith('#')) hexColor = firstGroup;
                      else width = parseInt(firstGroup);
                      const newStr = textContent.slice(endBracketFirst+1);
                      if (newStr.length) {
                        const secondGroup = newStr.slice(1,newStr.length-1);
                        if (secondGroup.startsWith('#')) hexColor = secondGroup;
                        else width = parseInt(secondGroup);
                      }
                    }
                  }
                  parent.remove();
                  editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND,{
                    color: hexColor.length ? hexColor : 'var(--divider)',
                    width: width===0 ? 1 : width
                  });
                }
              }
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    ),
    editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
        if (files.length&&wrapper) {
          const file = files[0];
          if (file.type==="image/gif"&&editor.hasNode(ImageNode)) {
            const input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-gif-input]');
            if (input) {
              input.files = getFileListForFileInput([file]);
              input.dispatchEvent(new Event("change"));
              return true;
            }
          } else if (file.type.startsWith('image/')&&editor.hasNode(ImageNode)) {
            const imageButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-image-button]');
            if (imageButton) {
              imageButton.dispatchEvent(new Event("click"));
              if (files.length>1) {
                const imageFiles = files.filter((file) => file.type.startsWith("image/"));
                const tab = wrapper.querySelector<HTMLButtonElement>('button[id^="lexical-upload-multiple-images"]');
                if (tab) tab.dispatchEvent(new Event("click"));
                const input = wrapper.querySelector<HTMLInputElement>('input[data-image-input][multiple]')
                if (input) {
                  input.files = getFileListForFileInput(imageFiles);
                  input.dispatchEvent(new Event("change"));
                  return true;
                }
              } else {
                const tab = wrapper.querySelector<HTMLButtonElement>('button[id^="lexical-upload-single-image"]');
                if (tab) tab.dispatchEvent(new Event("click"));
                const input = wrapper.querySelector<HTMLInputElement>('input[data-image-input]:not([multiple])')
                if (input) {
                  input.files = getFileListForFileInput([file]);
                  input.dispatchEvent(new Event("change"));
                  return true;
                }
              }
            }
          } else if (file.type.startsWith('audio/')&&editor.hasNode(AudioNode)) {
            const audioButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-audio-button]');
            if (audioButton) {
              audioButton.dispatchEvent(new Event("click"));
              const audioInput = wrapper.querySelector<HTMLInputElement>('input[data-audio-input]');
              if (audioInput) {
                audioInput.files = getFileListForFileInput([file]);
                audioInput.dispatchEvent(new Event("change"));
                return true;
              }
            }
          } else if (file.type.startsWith('video/')&&editor.hasNode(VideoNode)) {
            const videoButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-video-button]');
            if (videoButton) {
              videoButton.dispatchEvent(new Event("click"));
              const videoInput = wrapper.querySelector<HTMLInputElement>('input[data-video-input]');
              if (videoInput) {
                videoInput.files = getFileListForFileInput([file]);
                videoInput.dispatchEvent(new Event("change"));
                return true;
              }
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH
    ),
    editor.registerCommand<DragEvent>(
      DRAGSTART_COMMAND,
      (event) => {
        return $onDragStartImage(event);
      },
      COMMAND_PRIORITY_HIGH,
    ),
    editor.registerCommand<DragEvent>(
      DRAGOVER_COMMAND,
      (event) => {
        return $onDragOverImage(event);
      },
      COMMAND_PRIORITY_LOW,
    ),
    editor.registerCommand<DragEvent>(
      DROP_COMMAND,
      (event) => {
        return $onDropImage(event, editor);
      },
      COMMAND_PRIORITY_HIGH,
    ),
    editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,()=> {
      registerDecoratorsListeners(editor);
      return false;
    },COMMAND_PRIORITY_EDITOR)
  );
}

export function registerDecoratorsNotEditable(editor:LexicalEditor,setImagesInitialNotEditable:boolean=true) {
  if (editor.hasNode(ImageNode)) {
    if (setImagesInitialNotEditable) {
      editor.update(() => {
        const imageNodes = $nodesOfType(ImageNode);
        for (let node of imageNodes) {
          node.setDialogOnClick(true);
        }
      })
    }    
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        if (!!!editable) {
          editor.update(() => {
            const imageNodes = $nodesOfType(ImageNode);
            imageNodes.forEach((node) => {
              node.setDialogOnClick(true);
            })
          })
        } else {
          editor.update(() => {
            const imageNodes = $nodesOfType(ImageNode);
            imageNodes.forEach((node) => {
              node.setDialogOnClick(false);
            })
          })
        }
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const imageNodes = $nodesOfType(ImageNode);
          imageNodes.forEach((node) => {
            if (!!!node.getDialogOnClick()) node.setDialogOnClick(true);
          })
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
    )
  } else {
    console.error("Image Not Not registered.")
    return () => {}
  }
}