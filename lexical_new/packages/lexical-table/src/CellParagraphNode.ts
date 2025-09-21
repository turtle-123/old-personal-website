import type {
  EditorConfig, 
  LexicalEditor, 
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  ElementFormatType,
  SerializedElementNode,
  RangeSelection
} from 'lexical';
import {
  $applyNodeReplacement,
  isHTMLElement,
  ElementNode,
  $isTextNode,
} from 'lexical';
import type { NodeKey } from 'lexical';
export type SerializedCellParagraphNode = SerializedElementNode;
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class CellParagraphNode extends ElementNode {
  __version: number = CURRENT_VERSION;

  constructor(key?: NodeKey) {
    super(key);
    this.__first = null;
    this.__last = null;
    this.__size = 0;
    this.__format = 2;
    this.__indent = 0;
    this.__dir = null;
  }

  static getType(): string {
    return 'cell-paragraph';
  }

  static clone(node: CellParagraphNode): CellParagraphNode {
    return new CellParagraphNode(node.__key);
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('p');
    dom.className = "lex-grid-p";
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  updateDOM(
    prevNode: CellParagraphNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      p: (node: Node) => {
        if ((node as HTMLParagraphElement).classList.contains('lex-grid-p')) {
          return {
            conversion: convertCellParagraphElement,
            priority: 3,
          };
        } else {
          return null;
        }
      },
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) element.append(document.createElement('br'));

      const formatType = this.getFormatType();
      element.style.textAlign = formatType;

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
      const indent = this.getIndent();
      if (indent > 0) {
        // padding-inline-start is not widely supported in email HTML, but
        // Lexical Reconciler uses padding-inline-start. Using text-indent instead.
        element.style.textIndent = `${indent * 20}px`;
      }
      element.setAttribute("data-v",String(CURRENT_VERSION));
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedCellParagraphNode): CellParagraphNode {
    const node = $createCellParagraphNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: 'cell-paragraph',
      version: CURRENT_VERSION,
    };
  }

  // Mutation

  insertNewAfter(_: RangeSelection, restoreSelection: boolean): CellParagraphNode {
    const newElement = $createCellParagraphNode();
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }

  collapseAtStart(): boolean {
    const children = this.getChildren();
    // If we have an empty (trimmed) first paragraph and try and remove it,
    // delete the paragraph as long as we have another sibling to go to
    if (
      children.length === 0 ||
      ($isTextNode(children[0]) && children[0].getTextContent().trim() === '')
    ) {
      const nextSibling = this.getNextSibling();
      if (nextSibling !== null) {
        this.selectNext();
        this.remove();
        return true;
      }
      const prevSibling = this.getPreviousSibling();
      if (prevSibling !== null) {
        this.selectPrevious();
        this.remove();
        return true;
      }
    }
    return false;
  }
}

function convertCellParagraphElement(element: HTMLElement): DOMConversionOutput {
  const node = $createCellParagraphNode();
  if (element.style) {
    node.setFormat(element.style.textAlign as ElementFormatType);
    const indent = parseInt(element.style.textIndent, 10) / 20;
    if (indent > 0) {
      node.setIndent(indent);
    }
  }
  return {node};
}

export function $createCellParagraphNode(): CellParagraphNode {
  return $applyNodeReplacement(new CellParagraphNode());
}

export function $isCellParagraphNode(
  node: LexicalNode | null | undefined,
): node is CellParagraphNode {
  return node instanceof CellParagraphNode;
}