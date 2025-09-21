import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalNode,
  SerializedElementNode
} from 'lexical';
import { $isDetailsNode } from './DetailsNode';
export type SerializedAccordionContentNode = SerializedElementNode;

function convertAccordionContentElement(domNode: HTMLElement): DOMConversionOutput | null {
  const node = $createAccordionContentNode();
  return {
    node,
  };
}

const CURRENT_VERSION = 1;


export class AccordionContentNode extends ElementNode {
  __version: number = CURRENT_VERSION;
  static getType(): string {
    return 'accordion-content';
  }

  static clone(node: AccordionContentNode): AccordionContentNode {
    return new AccordionContentNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.classList.add('accordion-content');
    dom.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }

  updateDOM(prevNode: AccordionContentNode, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-frank-accordion-content')) {
          return null;
        }
        return {
          conversion: convertAccordionContentElement,
          priority: 4,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');
    element.setAttribute('data-frank-accordion-content', 'true');
    element.setAttribute("data-v",String(CURRENT_VERSION));
    return {element};
  }

  static importJSON(
    serializedNode: SerializedAccordionContentNode,
  ): AccordionContentNode {
    return $createAccordionContentNode();
  }

  isShadowRoot(): boolean {
    return true;
  }
  exportJSON(): SerializedAccordionContentNode {
    return {
      ...super.exportJSON(),
      type: 'accordion-content',
      version: CURRENT_VERSION,
    };
  }
  canBeEmpty(): boolean {
    return false;
  }
}

export function $createAccordionContentNode(): AccordionContentNode {
  return new AccordionContentNode();
}

export function $isAccordionContentNode(
  node: LexicalNode | null | undefined,
): node is AccordionContentNode {
  return node instanceof AccordionContentNode;
}