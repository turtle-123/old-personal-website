import { COMMAND_PRIORITY_CRITICAL, DecoratorNode, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from "lexical";


const CURRENT_VERSION = 1;
export type ValidLoadingNodeSizes = 'small'|'medium'|'large';
export type SerializedLoadingNode = Spread<{
  size: ValidLoadingNodeSizes,
  inline: boolean
},
SerializedLexicalNode
>;
export type InsertLoadingNodeCommandPayload = {
  size: ValidLoadingNodeSizes,
  inline: boolean
}

export class LoadingNode extends DecoratorNode<Element> {
  __size: ValidLoadingNodeSizes;
  __inline: boolean;
  __version: number = CURRENT_VERSION;
  constructor(obj?:InsertLoadingNodeCommandPayload,key?:NodeKey) {
    super(key);
    if (obj&&obj.size) this.__size = obj.size;
    else this.__size = 'medium';
    if (obj&&typeof obj.inline==="boolean") this.__inline = obj.inline;
    else this.__inline = true;
  }
  static clone(node:LoadingNode):LoadingNode {
    return new LoadingNode({size: node.__size, inline: node.__inline });
  }
  static getType():string {
    return 'loading-node';
  }
  exportJSON(): SerializedLoadingNode {
    return {
      type: this.getType(),
      version: CURRENT_VERSION,
      size: this.getSize(),
      inline: this.getInline()
    }
  }
  static importJSON(serializedNode: SerializedLoadingNode): LoadingNode {
    const { size, inline } = serializedNode;
    const node = $createLoadingNode({ size, inline });
    return node;
  }
  getSize() {
    const self = this.getLatest();
    return self.__size;
  }
  setSize(s:ValidLoadingNodeSizes) {
    const self = this.getWritable();
    self.__size = s;
    return self;
  }
  getInline() {
    const self = this.getLatest();
    return self.__inline;
  }
  setInline(inline:boolean) {
    const self = this.getWritable();
    self.__inline = inline;
    return self;
  }
  createDOM() {
    const span = document.createElement('span');
    span.setAttribute('data-lex-loader','true');
    span.setAttribute('data-v',String(CURRENT_VERSION));
    if (this.getFirstElement()) span.classList.add('first-rte-element');
    if (this.getLastElement()) span.classList.add('last-rte-element');
    return span;
  }
  getTextContent(): string {
    return 'Loading...'
  }
  updateDOM() {
    return false;
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const span = document.createElement('span');
    span.setAttribute('data-lex-loader','true');
    const inline = this.getInline()
    const size = this.getSize();
    span.classList.add('css-loader');
    if (inline) {
      span.classList.add('primary');
    } else {
      span.classList.add('block','secondary');
      span.style.setProperty("margin","3px auto","important");
    }
    span.classList.add(size);
    
    return {element: span};
  }
  static importDOM() {
    return {
      span: (domNode:HTMLElement) => {
        if (domNode.getAttribute('data-lex-loader')!=='true') return null;
        return {
          conversion: convertLoadingElement,
          priority: COMMAND_PRIORITY_CRITICAL
        }
      }
    }
  }
  isInline(): boolean {
    return this.__inline;
  }
  decorate(editor: LexicalEditor, config: EditorConfig): HTMLElement {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0) {
        const span = document.createElement('span');
        if (!!!this.getInline()) {
          span.classList.add('block','secondary');
          span.style.setProperty("margin",'3px auto');
        } else {
          span.classList.add('primary');
        }
        const size = this.getSize();
        span.classList.add('css-loader',size);
        element.append(span);
      }
    }
    return document.createElement('span');
  }
}
function convertLoadingElement(domNode:HTMLElement) {
  var size:ValidLoadingNodeSizes;
  if (domNode.classList.contains('small')) size = 'small';
  else if (domNode.classList.contains('large')) size = 'large';
  else size = 'medium';
  const block = domNode.classList.contains('block');
  const node = $createLoadingNode({ size, inline: !!!block });
  return { node };
}
export function $isLoadingNode(node:LexicalNode|null|undefined):node is LoadingNode {
  return node instanceof LoadingNode;
}
export function $createLoadingNode({ size, inline }:InsertLoadingNodeCommandPayload) {
  return new LoadingNode({ size, inline });
}
