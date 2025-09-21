import { 
  DecoratorNode, 
  LexicalNode, 
  NodeKey, 
  SerializedLexicalNode, 
  Spread,
  LexicalEditor,
  EditorConfig,
  DOMExportOutput,
  DOMConversionMap,
  createCommand,
  LexicalCommand,
  COMMAND_PRIORITY_CRITICAL
} from "lexical";
import { IS_REAL_BROWSER } from "@lexical/shared";
export type SerializedAiChatNode = Spread<{
  chat_id: string,
  html: string,
  chat_name: string
},
SerializedLexicalNode
>;
export type InsertAiChatNodePayload = {
  chat_id: string,
  html: string,
  chat_name: string
};



const CURRENT_VERSION = 1;

export class AiChatNode extends DecoratorNode<Element> {
  __chat_id: string;
  __html: string; 
  __chat_name: string;
  __version: number = CURRENT_VERSION;

  constructor(obj: InsertAiChatNodePayload, key?:NodeKey) {
    super(key);
    this.__chat_id = obj.chat_id;
    this.__html = obj.html;
    this.__chat_name = obj.chat_name;
  }
  static clone(node: AiChatNode): AiChatNode {
    return new AiChatNode({ chat_id: node.__chat_id, chat_name: node.__chat_name, html: node.__html });
  }

  static getType(): string {
    return 'ai-chat-node';
  }
  exportJSON(): SerializedAiChatNode {
    return {
      type: this.getType(),
      version: CURRENT_VERSION,
      html: this.getHTML(),
      chat_id: this.getChatID(),
      chat_name: this.getChatName()
    }
  }
  static importJSON({ chat_id, chat_name, html}: SerializedAiChatNode): AiChatNode {
    const node = $createAiChatNode({ 
      chat_id, chat_name, html
    });
    return node;
  }
  getHTML() {
    const latest = this.getLatest();
    return latest.__html;
  }
  setHTML(s:string) {
    const writable = this.getWritable();
    writable.__html = s;
    return writable;
  }
  getChatID() {
    const latest = this.getLatest();
    return latest.__chat_id;
  }
  setChatID(s:string) {
    const writable = this.getWritable();
    writable.__chat_id = s;
    return writable;
  }
  getChatName() {
    const latest = this.getLatest();
    return latest.__chat_name;
  }
  setChatName(s:string) {
    const writable = this.getWritable();
    writable.__chat_name = s;
    return writable;
  }
  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-ai-chat','true');
    div.setAttribute('data-chat-name',this.getChatName());
    div.setAttribute('data-chat-id',this.getChatID());
    div.classList.add('ai-chat-lexical');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    return div;
  }
  getTextContent(): string {
    return this.getHTML();
  }
  updateDOM(): false {
    return false;
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-ai-chat','true');
    div.setAttribute('data-chat-name',this.getChatName());
    div.setAttribute('data-chat-id',this.getChatID());
    div.insertAdjacentHTML('afterbegin',this.getHTML());
    div.classList.add('ai-chat-lexical');
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) div.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) div.classList.add('last-rte-element');
    return {element: div};
  }
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (domNode.getAttribute('data-ai-chat')!=="true"||!!!domNode.getAttribute('data-chat-name')||!!!domNode.getAttribute('data-chat-id')) {
          return null;
        }
        return {
          conversion: convertAIChatElement,
          priority: COMMAND_PRIORITY_CRITICAL,
        };
      },
    };
  }

  isInline(): false {
    return false;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0){
        element.innerHTML = this.getHTML();
      }
    }
    return document.createElement('div');
  }
}

function convertAIChatElement(div: HTMLElement) {
  try { 
    const chat_name = div.getAttribute('data-chat-name')
    const chat_id = div.getAttribute('data-chat-id')
    const html = div.innerHTML;
    if (!!!chat_id||!!!chat_name) {
      return null;
    }
    const node = $createAiChatNode({ chat_name, chat_id, html });
    return { node };
  } catch (error) {
    return null;
  }
}

export function $isAiChatNode(
  node: LexicalNode|null|undefined
):node is AiChatNode {
  return node instanceof AiChatNode;
}
export function $createAiChatNode({ chat_id, chat_name, html }: InsertAiChatNodePayload) {
  return new AiChatNode({chat_id, chat_name, html});
}

export const INSERT_AI_CHAT_NODE: LexicalCommand<InsertAiChatNodePayload> = createCommand('INSERT_AI_CHAT_NODE');

