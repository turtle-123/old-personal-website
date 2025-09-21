import { IS_REAL_BROWSER } from '@lexical/shared';
import type {
  DOMExportOutput,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig
} from 'lexical';

import {DecoratorNode} from 'lexical';

export const VALID_ALIGN_DECORATOR_BLOCK = new Set(['left','center','right','justify'] as const);

export type SerializedDecoratorBlockNode = Spread<
  {
    format: ElementFormatType;
    first_element: boolean;
  },
  SerializedLexicalNode
>;

const CURRENT_VERSION = 1;


export class DecoratorBlockNode extends DecoratorNode<Element> {
  __format: ElementFormatType;
  __version: number = CURRENT_VERSION;

  constructor(format?: ElementFormatType, key?: NodeKey) {
    super(key);
    this.__format = format || 'left';
  }

  exportJSON(): SerializedDecoratorBlockNode {
    return {
      format: this.__format || '',
      type: 'decorator-block',
      version: CURRENT_VERSION,
      first_element: this.getFirstElement()
    };
  }

  createDOM(): HTMLElement {
    const el =  document.createElement('div');
    el.style.textAlign = this.__format;
    el.style.whiteSpace = "normal";
    el.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    return el;
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig,
  ): boolean {
    return false;
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-frank-decorator-block','');
    element.setAttribute('data-text-align',this.getFormat());
    element.style.setProperty("text-align",this.getFormat());
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-frank-decorator-block')) {
          return null;
        }
        return {
          conversion: convertDecoratorBlockNode,
          priority: 3,
        };
      },
    };
  }
  getFormat() {
    const self = this.getLatest();
    return self.__format;
  }
  setFormat(format: ElementFormatType): void {
    const self = this.getWritable();
    self.__format = format;
  }

  isInline(): false {
    return false;
  }

  canAlign():boolean {
    return true;
  }
  isKeyboardSelectable() {
    return true;
  }
}

function isValidTextAlign(align:any):align is ('left'|'center'|'right'|'justify') {
  return Boolean(
    align==="left"||
    align==="center"||
    align==="right"||
    align==="justify"
  );
}
function convertDecoratorBlockNode(el:HTMLElement):DOMConversionOutput {
  const textAlign = el.getAttribute('data-text-align');  
  const first_element = el.classList.contains('first-rte-element');
  const last_element = el.classList.contains('last-rte-element');
  if (isValidTextAlign(textAlign)) {
    const node = $createDecoratorBlockNode(textAlign);
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return { node };
  } else{
    const node = $createDecoratorBlockNode();
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node };
  }
}
  

function $createDecoratorBlockNode(textAlign?:'left'|'center'|'right'|'justify'):DecoratorBlockNode {
  if (textAlign) {
    const node = new DecoratorBlockNode(textAlign);
    return node;
  } else {
    const node = new DecoratorBlockNode();
    return node;
  }
}

export function $isDecoratorBlockNode(
  node: LexicalNode | null | undefined,
): node is DecoratorBlockNode {
  return node instanceof DecoratorBlockNode;
}
