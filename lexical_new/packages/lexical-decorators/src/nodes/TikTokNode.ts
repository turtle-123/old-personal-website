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


export type SerializedTikTokNode = Spread<SerializedDecoratorBlockNode,{
  html: string
}>;

const CURRENT_VERSION = 1;

export class TikTokNode extends DecoratorBlockNode {
  __html: string;

 static getType(): string {
    return 'tiktok';  
  }
  static clone(node: TikTokNode):TikTokNode {
    return new TikTokNode(node.getHTML(),node.__format,node.__key);
  }
  static importJSON(serializedNode:SerializedTikTokNode):TikTokNode {
    const { html } = serializedNode;
    const node = $createTikTokNode(html);
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON():SerializedTikTokNode {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      type: this.getType(),
      version: CURRENT_VERSION
    };
  }
  static importDOM():DOMConversionMap|null {
    return {
      div: (domNode:HTMLElement) => {
        if (
          !domNode.hasAttribute('data-tiktok')||
          Boolean(domNode.innerHTML.length===0)
        ) {
          return null;
        }
        return {
          conversion: convertTikTokElement,
          priority: 3
        };
      }
    }
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin',this.getHTML());
    element.setAttribute('data-tiktok','');
    element.classList.add('tiktok-wrapper');
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
    div.setAttribute('data-tiktok','');
    div.insertAdjacentHTML('afterbegin',this.getHTML());
    div.classList.add('tiktok-wrapper');
    div.addEventListener("load",() => {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_TIKTOK'));
      },500);
    })
    if (decoratorNodeElement&&decoratorNodeElement.children.length===0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertTikTokElement(domNode:HTMLElement):DOMConversionOutput{
  const html = domNode.innerHTML;
  const node = $createTikTokNode(html);
  if (domNode.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (domNode.classList.contains('last-rte-element')) node.setLastElement(true);
  return {node};
}
export function $createTikTokNode(html:string) {
  return new TikTokNode(html);
}
export function $isTikTokNode(
  node: TikTokNode | LexicalNode | null | undefined,
):node is TikTokNode {
  return node instanceof TikTokNode;
}

export const EMBED_TikTok_COMMAND: LexicalCommand<string> = createCommand('EMBED_TikTok_COMMAND');

function handleTikTokFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  var err:null|string = null;
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  try {
    const input = this.querySelector<HTMLInputElement>('input[type="url"]');
    if (!!!input) throw new Error("Unable to find textarea to embed tweet.");
    const urlInit = input.value;
    const url = new URL('https://www.tiktok.com/oembed');
    url.searchParams.append('url',urlInit)
    fetch(url)
    .then((res) => {
      if (res.status!==200) {
        throw new Error("Something went wrong handling TikTok embed.");
      }
      return res.json()
    })
    .then((res) => {
      const { html:value } = res;
      if (typeof value==='string'&&value.length) {
        import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
        .then((res) => {
          const str = (res as any).validateTikTokEmbed(value);
          const editor = getCurrentEditor();
          if (editor) {
            editor.dispatchCommand(EMBED_TikTok_COMMAND,str);
            input.value = '';
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
    })
    .catch((e) => {
      if (e instanceof Error) {
        err = e.message;
      } else {
        err = "Something went wrong embedding the TikTok video.";
      }
    })
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}

function getOnOpenTikToksDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lex-embed-tiktok") {
    const dialog = document.getElementById('lex-embed-tiktok');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',handleTikTokFormSubmit);
      }
      document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
  }
} 

export function registerTikTokEditable(editor: LexicalEditor) {
  if (editor.hasNode(TikTokNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenTikToksDialog)
    return mergeRegister(
      editor.registerCommand(
        EMBED_TikTok_COMMAND,
        (embedCode) => {
          const node = $createTikTokNode(embedCode);
          $insertNodeToNearestRoot(node);
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('EMBED_TIKTOK'));
          },500);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(TikTokNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_TIKTOK"));
            },500);
          }
        }
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const tiktokNodes = $nodesOfType(TikTokNode);
          if (tiktokNodes.length) {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_TIKTOK"));
            },1000);
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
    )
  } else {
    console.error("Editor does not have TikTokNode registered.");
    return () => {};
  }
 
}
