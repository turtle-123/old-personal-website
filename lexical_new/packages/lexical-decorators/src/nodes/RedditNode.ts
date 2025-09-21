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
import { closeDialog, getCurrentEditor, UPDATE_ON_SET_HTML } from '@lexical/shared';
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';


export type SerializedRedditNode = Spread<SerializedDecoratorBlockNode,{
  html: string,
  minHeight: number
}>;

const CURRENT_VERSION = 1;

export class RedditNode extends DecoratorBlockNode {
  __html: string;
  __minHeight: number;

 static getType(): string {
    return 'reddit';  
  }
  static clone(node: RedditNode):RedditNode {
    return new RedditNode({html: node.getHTML(), minHeight: node.getMinHeight() },node.__format,node.__key);
  }
  static importJSON(serializedNode:SerializedRedditNode):RedditNode {
    const { html, minHeight } = serializedNode;
    const node = $createRedditNode({html,minHeight});
    node.setFormat('center');
    return node;
  }
  exportJSON():SerializedRedditNode {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      minHeight: this.getMinHeight(),
      type: this.getType(),
      version: CURRENT_VERSION
    };
  }
  static importDOM():DOMConversionMap|null {
    return {
      div: (domNode:HTMLElement) => {
        if (
          !domNode.hasAttribute('data-reddit')||
          Boolean(domNode.innerHTML.length===0)
        ) {
          return null;
        }
        return {
          conversion: convertRedditElement,
          priority: 3
        };
      }
    }
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.style.setProperty('min-height',String(this.getMinHeight()).concat('px'));
    element.insertAdjacentHTML('afterbegin',this.getHTML());
    element.setAttribute('data-reddit','');
    element.setAttribute('data-min-height',String(this.getMinHeight()));
    element.classList.add('reddit-wrapper');
    return {element};
  }
  constructor(obj:{html:string, minHeight: number},format?:ElementFormatType,key?:NodeKey) {
    super("center",key);
    this.__html = obj.html;
    this.__minHeight = obj.minHeight;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  getMinHeight() {
    const self = this.getLatest();
    return self.__minHeight;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    div.setAttribute('data-reddit','');
    div.style.setProperty('min-height',String(this.getMinHeight()).concat('px'));
    div.insertAdjacentHTML('afterbegin',this.getHTML());
    div.classList.add('reddit-wrapper');
    if (decoratorNodeElement&&decoratorNodeElement.children.length===0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertRedditElement(domNode:HTMLElement):DOMConversionOutput{
  const html = domNode.innerHTML;
  const minHeight = domNode.getAttribute('data-min-height');
  const node = $createRedditNode({html, minHeight: Number(minHeight)});
  return {node};
}
export function $createRedditNode(obj:{html:string,minHeight:number}) {
  return new RedditNode(obj);
}
export function $isRedditNode(
  node: RedditNode | LexicalNode | null | undefined,
):node is RedditNode {
  return node instanceof RedditNode;
}

export const EMBED_REDDIT_COMMAND: LexicalCommand<{html: string, minHeight: number }> = createCommand('EMBED_REDDIT_COMMAND');

function handleRedditFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
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
        const { html:str, minHeight } = (res as any).validateRedditEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_REDDIT_COMMAND,str);
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

export function registerRedditEditable(editor: LexicalEditor) {
  if (editor.hasNode(RedditNode)) {
    const dialog = document.getElementById('lex-embed-reddit');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit',handleRedditFormSubmit);
      }
    }
    return mergeRegister(
        editor.registerCommand(
        EMBED_REDDIT_COMMAND,
        (embedCode) => {
          const node = $createRedditNode(embedCode);
          $insertNodeToNearestRoot(node);
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('EMBED_REDDIT'));
          },500);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerMutationListener(RedditNode,(nodeMutations) => {
        for (const [nodeKey, mutation] of nodeMutations) {
          if (mutation === 'created') {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_REDDIT"));
            },500);
          }
        }
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const redditNodes = $nodesOfType(RedditNode);
          if (redditNodes.length) {
            setTimeout(() => {
              document.dispatchEvent(new CustomEvent("EMBED_REDDIT"));
            },1000);
          }
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),
    );
  } else {
    console.error("Editor does not have RedditNode registered.");
    return () => {};
  }
 
}