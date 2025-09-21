import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
  LexicalCommand
} from 'lexical';
import { SerializedDecoratorBlockNode, DecoratorBlockNode } from './DecoratorBlockNode';
import { $getNodeByKey, $nodesOfType, COMMAND_PRIORITY_EDITOR, createCommand,  } from 'lexical';
import { closeDialog, getCurrentEditor, getDeviceType, getEditorInstances, IS_REAL_BROWSER, OPEN_DIALOG_FINAL_CED, OPEN_LEXICAL_DIALOG_FINAL_CED, UPDATE_ON_SET_HTML } from '@lexical/shared';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import { CAN_USE_DOM } from 'shared/canUseDOM';

var TwitterMutationObserver:MutationObserver|null = null;

function setMinHeightOnElement(element:HTMLElement,calculatedHeight?:CalculatedHeight) {
  if (calculatedHeight) {
    const device = calculatedHeight.deviceDetected;
    if (device==="desktop"){
      if (calculatedHeight.deviceDetected!=="mobile") {
        element.style.setProperty('min-height',String(calculatedHeight.height).concat('px'));
      } else {
        if (calculatedHeight.height>700) {
          element.style.setProperty('min-height','550px');
        } else {
          element.style.setProperty('min-height',String(calculatedHeight.height).concat('px'));
        }
      }
    } else if (device==="mobile") {
      if (calculatedHeight.deviceDetected==="mobile") {
        element.style.setProperty('min-height',String(calculatedHeight.height).concat('px'));
      } else {
        if (calculatedHeight.height>500) {
          element.style.setProperty('min-height','700px');
        } else {
          element.style.setProperty('min-height',String(calculatedHeight.height).concat('px'));
        }
      } 
    }
  } else {
    element.style.setProperty('min-height','300px');
  }
}

function twitterMutationObserverCallback(records:MutationRecord[],mutationObserver:MutationObserver) {
  for (let record of records) {
    if (record.target.nodeName==="IFRAME") {
      const iframe = record.target as HTMLIFrameElement;
      const rect = iframe.getBoundingClientRect()
      if (rect){
        const height = rect.height;
        if (height>300) {
          const wrapperNode = iframe.closest('div[data-frank-decorator="true"]');
          const wrapper = iframe.closest('div.lexical-wrapper');
          if (wrapperNode&&wrapper) {
            const key = wrapperNode.getAttribute('data-node-key')
            const id = wrapper.id;
            const instances = getEditorInstances();
            if (instances[id]&&/\d+/.test(String(key))) {
              const editor = instances[id];
              editor.update(() => {
                const node = $getNodeByKey(String(key));
                if ($isTwitterNode(node)) {
                  node.setCalculatedHeight({ height, deviceDetected: getDeviceType() });
                }
              })
            }
          }
        }        
      }
    }
  }
}
(() => {
  if (CAN_USE_DOM && typeof window.MutationObserver!==undefined) {
    TwitterMutationObserver = new window.MutationObserver(twitterMutationObserverCallback);
  }
})()

const twitterSocialMutationObserverOptions = {
  childList: true,
  subtree: true,
  attributes: true
}


export type SerializedTwitterNode = Spread<SerializedDecoratorBlockNode,{
  html: string,
  calculatedHeight?: CalculatedHeight
}>;
type CalculatedHeight = {deviceDetected: 'mobile'|'tablet'|'desktop', height: number}
const CURRENT_VERSION = 1;

export class TwitterNode extends DecoratorBlockNode {
  __html: string;
  __calculatedHeight?:CalculatedHeight;

 static getType(): string {
    return 'twitter';  
  }
  static clone(node: TwitterNode):TwitterNode {
    return new TwitterNode({html: node.getHTML(), calculatedHeight: node.getCalculatedHeight() },node.__format,node.__key);
  }
  static importJSON(serializedNode:SerializedTwitterNode):TwitterNode {
    const { html, calculatedHeight } = serializedNode;
    const node = $createTwitterNode({ html, calculatedHeight});
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON():SerializedTwitterNode {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      calculatedHeight: this.getCalculatedHeight(),
      type: this.getType(),
      version: CURRENT_VERSION,
      first_element: this.getFirstElement()
    };
  }
  static importDOM():DOMConversionMap|null {
    return {
      div: (domNode:HTMLElement) => {
        if (
          !domNode.hasAttribute('data-twitter')||
          Boolean(domNode.innerHTML.length===0)
        ) {
          return null;
        }
        return {
          conversion: convertTwitterElement,
          priority: 3
        };
      }
    }
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin',this.getHTML());
    element.setAttribute('data-twitter','');
    element.classList.add('twitter-wrapper');
    const calclatedHeight = this.getCalculatedHeight();
    if (calclatedHeight) {
      element.setAttribute('data-calculated-height-num',String(calclatedHeight.height));
      element.setAttribute('data-calculated-height-device',String(calclatedHeight.deviceDetected));
    }
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    setMinHeightOnElement(element,calclatedHeight);
    return {element};
  }
  constructor(obj:{html:string,calculatedHeight?:CalculatedHeight},format?:ElementFormatType,key?:NodeKey) {
    super("center",key);
    this.__html = obj.html;
    if (obj.calculatedHeight) this.__calculatedHeight = obj.calculatedHeight;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  setCalculatedHeight(inp:CalculatedHeight) {
    const self = this.getWritable();
    self.__calculatedHeight = inp;
    return self;
  }
  getCalculatedHeight() {
    const self = this.getLatest();
    return self.__calculatedHeight;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    div.setAttribute('data-twitter','');
    div.insertAdjacentHTML('afterbegin',this.getHTML());
    div.classList.add('twitter-wrapper');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    if (decoratorNodeElement&&decoratorNodeElement.children.length===0) {
      if(TwitterMutationObserver&&editor.isEditable() && !!!this.getCalculatedHeight()) {
        TwitterMutationObserver.observe(div,twitterSocialMutationObserverOptions);
      }
      setMinHeightOnElement(div,this.getCalculatedHeight());
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertTwitterElement(domNode:HTMLElement):DOMConversionOutput{
  const html = domNode.innerHTML;
  const calcHeightStr = domNode.getAttribute('data-calculated-height-num')
  const calcHeightDev = domNode.getAttribute('data-calculated-height-device')
  const calcHeightNum = parseInt(String(calcHeightStr));
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (Number.isInteger(calcHeightNum)&&(calcHeightDev==="desktop"||calcHeightDev==="tablet"||calcHeightDev==="mobile")) {
    const node = $createTwitterNode({html, calculatedHeight: { height: calcHeightNum, deviceDetected: calcHeightDev as 'desktop'|'mobile'|'tablet' }});
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node};
  } else {
    const node = $createTwitterNode({html});
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node};
  }
  
}
export function $createTwitterNode(obj:{html:string, calculatedHeight?: CalculatedHeight}) {
  return new TwitterNode(obj);
}
export function $isTwitterNode(
  node: TwitterNode | LexicalNode | null | undefined,
):node is TwitterNode {
  return node instanceof TwitterNode;
}


export const EMBED_TWEET_COMMAND: LexicalCommand<string> = createCommand('EMBED_TWEET_COMMAND');

function handleTwitterFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  try {
    const textarea = this.querySelector('textarea');
    if (!!!textarea) throw new Error("Unable to find textarea to embed tweet.");
    const value = textarea.value;
    if (value&&value.length) {
      var err:null|string = null;
      import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
      .then((res) => {
        const str = (res as any).validateTwitterEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_TWEET_COMMAND,str);
          textarea.value = '';
          if (dialog) closeDialog(dialog);
          if (dialog) {
            const errorAlert = dialog.querySelector('div[data-embed-error]');
            if (errorAlert) errorAlert.setAttribute('hidden','');
          }
        }
      })
      .catch((e) => {
        console.error(e);
        if (dialog) {
          const errorAlert = dialog.querySelector('div[data-embed-error]');
          if (errorAlert) errorAlert.removeAttribute('hidden');
        }
      })
      
    }
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}

function getOnOpenTwittersDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-embed-twitter") {
    const dialog = document.getElementById('lex-embed-twitter');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',handleTwitterFormSubmit);
      }
      document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
  }
} 

export function registerTwitterEditable(editor: LexicalEditor) {
  if (editor.hasNode(TwitterNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenTwittersDialog)
    return mergeRegister(
      editor.registerCommand(
        EMBED_TWEET_COMMAND,
        (embedCode) => {
          const node = $createTwitterNode({html: embedCode});
          $insertNodeToNearestRoot(node);
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('EMBED_TWITTER'));
          },500);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(TwitterNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_TWITTER"));
            },500);
          }
        }
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const tiktokNodes = $nodesOfType(TwitterNode);
          if (tiktokNodes.length) {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_TWITTER"));
            },1000);
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  } else {
    console.error("Editor does not have TwitterNode registered.");
    return () => {};
  }
 
}