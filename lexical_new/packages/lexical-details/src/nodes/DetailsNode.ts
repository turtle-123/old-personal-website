import type {
  EditorConfig, 
  LexicalCommand, 
  LexicalEditor, 
  NodeKey, 
  RangeSelection, 
  SerializedElementNode
} from 'lexical';
import {
  $getNodeByKey,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode
} from 'lexical';
import { 
  ElementNode, 
  Spread
} from 'lexical';
import { 
  $createAccordionContentNode,
  $isAccordionContentNode, 
  AccordionContentNode
} from './AccordionContentNode';
import { getEditorInstances, IS_REAL_BROWSER } from '@lexical/shared';
export type SerializedDetailsNode = Spread<
  SerializedElementNode,
  {
    summary: string,
    flat: boolean,
    first_element: boolean
  }
>;

const CURRENT_VERSION = 1;

const summarySVG = `<svg contenteditable="false" class="details" focusable="false" inert viewBox="0 0 24 24"><path contenteditable="false" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>`;

function getHandleSummaryClick(key:string) {
  const func = function (this:HTMLElement,e:Event) {
    const editor = this.closest('div.lexical-wrapper');
    const detailsParent = this.parentElement;
    if (editor&&detailsParent&&detailsParent.nodeName==="DETAILS") {
      const isOpen = detailsParent.hasAttribute('open');
      const id = editor.id;
      const editorInstances = getEditorInstances();
      const editorInstance = editorInstances[id];
      if (editorInstance&&editorInstance.isEditable()) {
        editorInstance.update(() => {
          const detailsNode = $getNodeByKey(key);
          if ($isDetailsNode(detailsNode)) {
            detailsNode.setOpen(!!!isOpen);
          }
        })
      }
    }
  }
  return func;
}

export class DetailsNode extends ElementNode {
  __summary: string;
  __flat: boolean;
  __open: boolean = false;
  __version: number = CURRENT_VERSION;

  constructor({flat,summary}:{flat:boolean,summary:string},key?:NodeKey){
    super(key);
    this.__summary = summary;
    this.__flat = flat;
  }
  static getType():string{
    return 'details';
  }
  static clone(node: DetailsNode):DetailsNode{
    return new DetailsNode({
      summary: node.getSummary(),
      flat: node.getFlat()
    },node.__key);
  }
  createDOM(_config: EditorConfig, _editor: LexicalEditor):HTMLElement {
    const details = document.createElement('details');
    details.setAttribute('data-node-key',this.getKey());
    details.classList.add('rte');
    if (this.getFlat()) details.classList.add('flat');
    const span = document.createElement('span');
    span.innerText = this.getSummary();
    span.classList.add('h6','bold');
    span.setAttribute('contenteditable','false');
    const summaryEl = document.createElement('summary');
    summaryEl.setAttribute('contenteditable','false');
    summaryEl.setAttribute('data-rte','');
    summaryEl.append(span);
    summaryEl.insertAdjacentHTML("beforeend",summarySVG)
    details.append(summaryEl);
    summaryEl.addEventListener('click',getHandleSummaryClick(this.__key),true);
    if (this.__open) {
      details.setAttribute('open','');
    }
    details.setAttribute('data-v',String(CURRENT_VERSION));
    if (this.getFirstElement()) details.classList.add('first-rte-element');
    if (this.getLastElement()) details.classList.add('last-rte-element');
    return details;
  }
  updateDOM(_prevNode: DetailsNode, _dom: HTMLElement, _config: EditorConfig): boolean {
    if (_prevNode.__flat !== this.getFlat() || _prevNode.__summary!==this.getSummary() || _prevNode.__open!==this.getOpen()) return true;
    else return false;
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('details');
    element.setAttribute('data-details-summary',this.getSummary());
    element.setAttribute('data-flat',String(this.getFlat()));
    element.setAttribute('data-v',String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }
  static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
    return {
      details: (domNode: HTMLDetailsElement) => {
        return {
          conversion: convertDetailsElement,
          priority: 1,
        };
      },
    }
  }
  static importJSON(serializedJSON: SerializedDetailsNode):DetailsNode {
    const { flat, summary } = serializedJSON;
    const node = $createDetailsNode({summary,flat});
    node.setFirstElement(serializedJSON?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      summary: this.getSummary(),
      flat: this.getFlat(),
      type:'details',
      version: CURRENT_VERSION
    };
  }

  getSummary(){
    const self = this.getLatest();
    return self.__summary;
  }
  setSummary(s:string){
    const self = this.getWritable();
    self.__summary = s.slice(0,50);
    return self;
  }
  getFlat(){
    const self = this.getLatest();
    return self.__flat;
  }
  setFlat(b:boolean){
    const self = this.getWritable();
    self.__flat = b;
    return self;
  }
  append(...nodesToAppend: LexicalNode[]): this {
    if (this.getChildrenSize()===0 && $isAccordionContentNode(nodesToAppend[0])) {
      return super.append((nodesToAppend[0] as AccordionContentNode).append(...nodesToAppend.slice(1)));
    } else if (this.getChildrenSize()===1) {
      return super.append(...nodesToAppend.filter((node) => !!!$isDetailsNode(node) && !!!$isAccordionContentNode(node)));
    } else {
      const accordionContentNode = $createAccordionContentNode();
      const children = this.getChildren();
      accordionContentNode.append(...children.filter((node) => !!!$isDetailsNode(node) && !!!$isAccordionContentNode(node)));
      super.clear();
      return super.append(accordionContentNode);
    }
  }
  canIndent(): boolean {
    return false;
  }
  isShadowRoot(): boolean {
    return true;
  }
  select(_anchorOffset?: number | undefined, _focusOffset?: number | undefined): RangeSelection {
    if (_anchorOffset===0 && _focusOffset===0 || (!!!_anchorOffset&&!!!_focusOffset)){
      const children = this.getChildren();
      const accordionContent = children.filter((node) => $isAccordionContentNode(node));
      if (accordionContent.length===1) {
        return (accordionContent[0] as AccordionContentNode).select(_anchorOffset,_focusOffset);
      } else {
        return super.select(_anchorOffset,_focusOffset);
      }
    } else {
      return super.select(_anchorOffset,_focusOffset);
    }
  }
  setOpen(b:boolean) {
    const self = this.getWritable()
    self.__open = b;
    return self;
  }
  getOpen() {
    return this.getLatest().__open;
  }
} 

function convertDetailsElement(domNode: HTMLDetailsElement) {
  const summary = String(domNode.getAttribute('data-details-summary'));
  const flat = Boolean(domNode.getAttribute('data-flat')==="true");
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  const node = $createDetailsNode({summary,flat});
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return {node};
}

export function $createDetailsNode({ summary, flat }:{summary:string,flat:boolean}) {
  return new DetailsNode({flat,summary});
}
export function $isDetailsNode(node: any):node is DetailsNode {
  return node instanceof DetailsNode;
}
