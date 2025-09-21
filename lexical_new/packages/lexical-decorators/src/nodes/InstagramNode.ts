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
import { $nodesOfType, COMMAND_PRIORITY_EDITOR, createCommand,  } from 'lexical';
import { closeDialog, getCurrentEditor, IS_REAL_BROWSER, OPEN_DIALOG_FINAL_CED, OPEN_LEXICAL_DIALOG_FINAL_CED, UPDATE_ON_SET_HTML } from '@lexical/shared';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';


export type SerializedInstagramNode = Spread<SerializedDecoratorBlockNode,{
  html: string
}>;

const CURRENT_VERSION = 1;

export class InstagramNode extends DecoratorBlockNode {
  __html: string;

 static getType(): string {
    return 'instagram';  
  }
  static clone(node: InstagramNode):InstagramNode {
    return new InstagramNode(node.getHTML(),node.__format,node.__key);
  }
  static importJSON(serializedNode:SerializedInstagramNode):InstagramNode {
    const { html } = serializedNode;
    const node = $createInstagramNode(html);
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON():SerializedInstagramNode {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      type: this.getType(),
      first_element: this.getFirstElement(),
      version: CURRENT_VERSION
    };
  }
  static importDOM():DOMConversionMap|null {
    return {
      div: (domNode:HTMLElement) => {
        if (
          !domNode.hasAttribute('data-instagram')||
          Boolean(domNode.innerHTML.length===0)
        ) {
          return null;
        }
        return {
          conversion: convertInstagramElement,
          priority: 3
        };
      }
    }
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin',this.getHTML());
    element.setAttribute('data-instagram','');
    element.classList.add('instagram-wrapper');
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }
  constructor(html:string,format?:ElementFormatType,key?:NodeKey) {
    super("center",key);
    this.__html = html;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    div.setAttribute('data-instagram','');
    div.classList.add('instagram-wrapper');
    div.insertAdjacentHTML('afterbegin',this.getHTML());
    if (decoratorNodeElement&&decoratorNodeElement.children.length===0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertInstagramElement(domNode:HTMLElement):DOMConversionOutput{
  const html = domNode.innerHTML;
  const node = $createInstagramNode(html);
  if (domNode.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (domNode.classList.contains('last-rte-element')) node.setLastElement(true);
  return {node};
}
export function $createInstagramNode(html:string) {
  return new InstagramNode(html);
}
export function $isInstagramNode(
  node: InstagramNode | LexicalNode | null | undefined,
):node is InstagramNode {
  return node instanceof InstagramNode;
}


export const EMBED_INSTA_COMMAND: LexicalCommand<string> = createCommand('EMBED_INSTA_COMMAND');

function handleInstagramFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  try {
    const textarea = this.querySelector('textarea');
    if (!!!textarea) throw new Error("Unable to find textarea to embed instagram post.");
    const value = textarea.value;
    if (value&&value.length) {
      var err:null|string = null;
      import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
      .then((res) => {
        const str = (res as any).validateInstagramEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_INSTA_COMMAND,str);
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
function getOnOpenInstagramDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-embed-instagram") {
    const dialog = document.getElementById('lex-embed-instagram');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',handleInstagramFormSubmit);
      }
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
  }
}
export function registerInstagramEditable(editor: LexicalEditor) {
  if (editor.hasNode(InstagramNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenInstagramDialog)
    return mergeRegister( 
      editor.registerCommand(
        EMBED_INSTA_COMMAND,
        (embedCode) => {
          const node = $createInstagramNode(embedCode);
          $insertNodeToNearestRoot(node);
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('EMBED_INSTAGRAM'));
          },500);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(InstagramNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_INSTAGRAM"));
            },500);
          }
        }
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const instagramNodes = $nodesOfType(InstagramNode);
          if (instagramNodes.length) {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_INSTAGRAM"));
            },1000);
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  } else {
    console.error("Editor does not have InstagramNode registered.");
    return () => {};
  }
 
}