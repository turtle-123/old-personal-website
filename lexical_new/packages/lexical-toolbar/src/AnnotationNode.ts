
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread
} from 'lexical';
import {
  COMMAND_PRIORITY_CRITICAL,
  ElementNode
} from 'lexical';
import { AnnotationSelectionState } from '.';

const ANNOTATION_NODE_VERSION = 1;
type ConnotationStringTypes = 'primary'|'secondary'|'info'|'warning'|'error';
const ConnotationStringTypesSet = new Set(['primary','secondary','info','warning','error']);
export type SerializedAnnotationNode = Spread<SerializedElementNode,{ start: number, end: number, content: string, reference_id: string, text_color?:string, background_color?:string }>;
type EditableAnnotationNodeState = Spread<AnnotationSelectionState,{ reference_id: string }>;
type OptionalAnnotationNodeState = { text_color: string, background_color: string };
type InformationType = {
  "optimism": number,
  "love": number,
  "aggressiveness": number,
  "submission": number,
  "contempt": number,
  "awe": number,
  "remorse": number,
  "disapproval": number,
  "annoyance": number,
  "anger": number,
  "rage": number,
  "vigilance": number,
  "anticipation": number,
  "interest": number,
  "ecstasy": number,
  "joy": number,
  "serenity": number,
  "admiration": number,
  "trust": number,
  "acceptance": number,
  "terror": number,
  "fear": number,
  "apprehension": number,
  "amazement": number,
  "surprise": number,
  "distraction": number,
  "pensiveness": number,
  "sadness": number,
  "grief": number,
  "boredom": number,
  "disgust": number,
  "loathing":number
}
type FullAnnotationNodeState = Spread<EditableAnnotationNodeState,OptionalAnnotationNodeState>;

/** @noInheritDoc */
export class AnnotationNode extends ElementNode {
  __version: number = ANNOTATION_NODE_VERSION;
  __start: number;
  __end: number;
  __content:string;
  __reference_id: string; // the id (minus id_) that the lexical editor that you want to add an annotation to has
  __text_color?: string;
  __background_color?: string;

  static getType(): string {
    return 'annotation';
  }
  static clone(node: AnnotationNode): AnnotationNode {
    const start = node.__start;
    const end = node.__end;
    const content = node.__content;
    const reference_id = node.__reference_id;
    var optional:undefined|OptionalAnnotationNodeState=undefined;
    if (node.__text_color&&node.__background_color) {
      optional = {
        text_color: node.__text_color,
        background_color: node.__background_color
      }
    }
    return new AnnotationNode({start, end, content, reference_id },optional,node.__key);
  }
  constructor(state:EditableAnnotationNodeState,optional?:OptionalAnnotationNodeState,key?: NodeKey) {
    super(key);
    this.__start = state.start;
    this.__end = state.end;
    this.__content = state.content;
    this.__reference_id = state.reference_id;
    if (optional) {
      this.__text_color = optional.text_color;
      this.__background_color = optional.background_color;
    }
  }
  getStart() {
    const self = this.getLatest();
    return self.__start;
  }
  setStart(n:number) {
    const self = this.getWritable();
    self.__start = n;
    return self;
  }
  getEnd() {
    const self = this.getLatest();
    return self.__end;
  }
  setEnd(n:number) {
    const self = this.getWritable();
    self.__end = n;
    return self;
  }
  getContent() {
    const self = this.getLatest();
    return self.__content;
  }
  setContent(s:string) {
    const self = this.getWritable();
    self.__content = s;
    return self;
  }
  getReferenceId() {
    const self = this.getLatest();
    return self.__reference_id;
  }
  setReferenceId(s:string) {
    const self = this.getWritable();
    self.__reference_id = s;
    return self;
  }
  getTextColor() {
    const self = this.getLatest();
    return self.__text_color;
  }
  setTextColor(s:string) {
    const self = this.getWritable();
    self.__text_color = s;
    return self;
  }
  getBackgroundColor() {
    const self = this.getLatest();
    return self.__background_color;
  }
  setBackgroundColor(s:string) {
    const self = this.getWritable();
    self.__background_color = s;
    return self;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.setAttribute('hidden','');
    span.setAttribute('data-annotation-node','');
    span.setAttribute('data-start',String(this.getStart()))
    span.setAttribute('data-end',String(this.getEnd()))
    span.setAttribute('data-content',String(this.getContent()));
    span.setAttribute('data-reference-id',this.getReferenceId());
    const [text_color,background_color]=[this.getTextColor(),this.getBackgroundColor()];
    if(text_color&&background_color) {
      span.setAttribute('data-text-color',text_color);
      span.setAttribute('data-background-color',background_color);
    }
    if (this.getFirstElement()) span.classList.add('first-rte-element');
    if (this.getLastElement()) span.classList.add('last-rte-element');
    return span;
  }
  updateDOM(prevNode: AnnotationNode, dom: HTMLElement): boolean {
    return false;
  }
  static importDOM(): DOMConversionMap | null {
    return {
      span: (node: HTMLElement) => {
        if (
          node.hasAttribute('data-annotation-node')&&
          node.hasAttribute('data-reference-id')&&
          node.hasAttribute('data-start')&&
          node.hasAttribute('data-end')&&
          node.hasAttribute('data-content')
        ) {
          return {
            conversion: convertAnnotationNodeElement,
            priority: COMMAND_PRIORITY_CRITICAL
          }
        } else {
          return null;
        }
      },
    };
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor); // calls createDOM
    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedAnnotationNode): AnnotationNode {
    const { start, end, content, reference_id } = serializedNode;
    const text_color = serializedNode.text_color;
    const background_color = serializedNode.background_color;
    var obj:undefined|OptionalAnnotationNodeState=undefined;
    if (text_color&&background_color) obj = {text_color,background_color};
    const node = $createAnnotationNode({ start, end, content, reference_id },obj);
    return node;
  }

  exportJSON(): SerializedAnnotationNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      start: this.getStart(),
      end: this.getEnd(),
      content: this.getContent(),
      reference_id: this.getReferenceId(),
      version: ANNOTATION_NODE_VERSION,
      text_color: this.getTextColor(),
      background_color: this.getBackgroundColor()
    };
  }
}

export function convertAnnotationNodeElement(span:HTMLElement) {
    span.getAttribute('data-annotation-node');
    const start = span.getAttribute('data-start');
    const end = span.getAttribute('data-end');
    const content = span.getAttribute('data-content');
    const reference_id = span.getAttribute('data-reference-id');

    const text_color = span.getAttribute('data-text-color');
    const background_color = span.getAttribute('data-background-color');

    if (text_color&&background_color) {

    }
    if (start&&end&&content&&reference_id) {
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      if (text_color&&background_color) {
        const node = new AnnotationNode({ start: startNum, end: endNum, content, reference_id },{ text_color, background_color });
        return { node };
      } else {
        const node = new AnnotationNode({ start: startNum, end: endNum, content, reference_id });
        return { node };
      }
    } else {
      const node = new AnnotationNode({ start: 0, end: 0, content: '', reference_id: '' });
      return { node };
    }
}

export function $createAnnotationNode(state:EditableAnnotationNodeState,obj?:OptionalAnnotationNodeState): AnnotationNode {
  return new AnnotationNode(state,obj);
}

export function $isAnnotationNode(
  node: LexicalNode | null | undefined,
): node is AnnotationNode {
  return node instanceof AnnotationNode;
}