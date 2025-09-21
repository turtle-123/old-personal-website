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
import { COMMAND_PRIORITY_EDITOR, createCommand,  } from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { VALID_ALIGN_DECORATOR_BLOCK } from './DecoratorBlockNode';
import { IS_REAL_BROWSER, isTouchDevice } from '@lexical/shared';

export type NewsNodeObject = {
  url: string;
  title: string;
  description: string;
  imageURL: string;
  host: string;
};
export type SerializedNewsNode = Spread<
  NewsNodeObject,
  SerializedDecoratorBlockNode
>;

const CURRENT_VERSION = 1;

/* @ts-ignore */
export class NewsNode extends DecoratorBlockNode {
  __url: string;
  __title: string;
  __description: string;
  __imageURL: string;
  __host: string;
  __version: number = CURRENT_VERSION;

  static getType(): string {
    return 'news';  
  }
  static clone(node: NewsNode):NewsNode {
    return new NewsNode({
      url: node.getURL(),
      title: node.getTitle(),
      description: node.getDescription(),
      imageURL: node.getImageURL(),
      host: node.getHost()
    },node.__format,node.__key);
  }
  static importJSON(serializedNode: SerializedNewsNode):NewsNode {
    const {url,title,description,imageURL,host,format} = serializedNode;
    const node = $createNewsNode({url,title,description,imageURL,host,format});
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON():SerializedNewsNode {
    return {
      ...super.exportJSON(),
      url: this.getURL(),
      title: this.getTitle(),
      description: this.getDescription(),
      imageURL: this.getImageURL(),
      host: this.getHost(),
      type: 'news',
      first_element: this.getFirstElement(),
      version: CURRENT_VERSION
    }
  }
  static importDOM():DOMConversionMap<HTMLDivElement>|null{
    return {
      div: (domNode: HTMLDivElement) => {
        if (
          !domNode.hasAttribute('data-href')||
          !domNode.hasAttribute('data-news-title')||
          !domNode.hasAttribute('data-news-description')||
          !domNode.hasAttribute('data-news-image-url')||
          !domNode.hasAttribute('data-host')
        ) {
          return null;
        }
        return {
          conversion: convertNewsElement,
          priority: 3
        }
      }
    }
  }
  // TODO: Add Height
  exportDOM(): DOMExportOutput {
    const div = document.createElement('div');    
    div.setAttribute('data-href',this.getURL());
    div.setAttribute('data-news-title',this.getTitle());
    div.setAttribute('data-news-description',this.getDescription());
    div.setAttribute('data-news-image-url',this.getImageURL());
    div.setAttribute('data-host',this.getHost());
    div.setAttribute("data-v",String(CURRENT_VERSION));
    div.style.textAlign = this.getFormat();
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) div.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) div.classList.add('last-rte-element');
    return {element: div};
  }
  constructor(obj:NewsNodeObject,format?:ElementFormatType,key?:NodeKey) {
    super(format?format:'center',key);
    this.__url = obj.url;
    this.__title = obj.title;
    this.__description = obj.description;
    this.__imageURL = obj.imageURL;
    this.__host = obj.host;
  }
  getURL(){
    const self = this.getLatest();
    return self.__url;
  }
  getTitle(){
    const self = this.getLatest();
    return self.__title;
  }
  getDescription(){
    const self = this.getLatest();
    return self.__description;
  }
  getImageURL(){
    const self = this.getLatest();
    return self.__imageURL;
  }
  getHost(){
    const self = this.getLatest();
    return self.__host;
  }
  decorate(editor: LexicalEditor, config: EditorConfig): Element {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const element = createNewsElement({
      url: this.getURL(),
      title: this.getTitle(),
      description: this.getDescription(),
      imageURL: this.getImageURL(),
      host: this.getHost(),
    });
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    if (decoratorNodeElement&&decoratorNodeElement.children.length===0) {
      decoratorNodeElement.insertAdjacentElement("afterbegin",element);
    }
    return element;
  }
  
}

function createNewsElement(obj: NewsNodeObject) {
  const a = document.createElement('a');
  a.setAttribute('href',obj.url);
  a.classList.add("lexical-news-article");
  a.setAttribute('target','_blank');
  a.setAttribute('title',obj.url);
  const img = document.createElement('img');
  img.setAttribute("src",obj.imageURL); 
  img.setAttribute("width","325"); 
  img.setAttribute("height","160")
  img.setAttribute("alt",obj.title); 
  img.setAttribute("data-text",obj.description);
  img.setAttribute('loading','lazy');
  const p = document.createElement('p');
  p.classList.add('body1');
  p.innerText=obj.title;
  const span = document.createElement('span'); 
  span.innerText=obj.host;
  a.append(img);
  a.append(p);
  a.append(span);
  return a;
}

function convertNewsElement(domNode:HTMLDivElement):DOMConversionOutput|null {
  const url = String(domNode.getAttribute('data-href'));
  const title = String(domNode.getAttribute('data-news-title'));
  const description = String(domNode.getAttribute('data-news-description'));
  const imageURL = String(domNode.getAttribute('data-news-image-url'));
  const host = String(domNode.getAttribute('data-host'));
  const format = (VALID_ALIGN_DECORATOR_BLOCK.has(domNode.style.textAlign as any) ? domNode.style.textAlign : 'center') as ElementFormatType;
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  const node = $createNewsNode({
    url,
    title,
    description,
    imageURL,
    host,
    format
  });
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return { node };
}

export function $createNewsNode(obj: Spread<NewsNodeObject,{format: ElementFormatType}>) {
  return new NewsNode(obj,obj.format);
}
export function $isNewsNode(
  node: NewsNode | LexicalNode | null | undefined,
): node is NewsNode {
  return node instanceof NewsNode;
}

export const INSERT_NEWS_NODE: LexicalCommand<NewsNodeObject> = createCommand('INSERT_NEWS_NODE');
export function registerNewsNode(editor: LexicalEditor) {
  return editor.registerCommand(
    INSERT_NEWS_NODE,
    (obj) => {
      const {url,title,description,imageURL,host} = obj;
      const node = $createNewsNode({url,title,description,imageURL,host,format:'center'});
      $insertNodeToNearestRoot(node);
      return true;
    },
    COMMAND_PRIORITY_EDITOR
  )
}