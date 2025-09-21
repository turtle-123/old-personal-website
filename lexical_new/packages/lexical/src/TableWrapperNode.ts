import type {
  EditorConfig, 
  LexicalEditor, 
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  SerializedElementNode,
  RangeSelection,
  ParagraphNode
} from 'lexical';
import {
  $applyNodeReplacement,
  isHTMLElement,
  ElementNode,
  COMMAND_PRIORITY_CRITICAL,
  $createParagraphNode,
  $isTabNode,
} from 'lexical';
import type { NodeKey } from 'lexical';
export type SerializedTableWrapperNode = SerializedElementNode;
const CURRENT_VERSION = 1;

/** @noInheritDoc */
export class TableWrapperNode extends ElementNode {
  constructor(key?: NodeKey) {
    super(key);
    this.__first = null;
    this.__last = null;
    this.__size = 0;
    this.__format = 0;
    this.__indent = 0;
    this.__dir = null;
    this.__version = CURRENT_VERSION;
  }

  static getType(): string {
    return 'table-wrapper';
  }

  static clone(node: TableWrapperNode): TableWrapperNode {
    return new TableWrapperNode(node.__key);
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    dom.className="table-wrapper";
    if (this.getFirstElement()) dom.classList.add('first-rte-element');
    if (this.getLastElement()) dom.classList.add('last-rte-element');
    return dom;
  }
  updateDOM(
    prevNode: TableWrapperNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        if ((node as HTMLDivElement).classList.contains('table-wrapper')) {
          return {
            conversion: convertTableWrapperElement,
            priority: COMMAND_PRIORITY_CRITICAL,
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
      element.setAttribute('data-v',String(CURRENT_VERSION));
    }

    return {
      element,
    };
  }

  static importJSON(serializedNode: SerializedTableWrapperNode): TableWrapperNode {
    const node = $createTableWrapperNode();
    return node;
  }

  exportJSON(): SerializedElementNode {
    return {
      ...super.exportJSON(),
      type: "table-wrapper",
      version: CURRENT_VERSION
    };
  }

  // Mutation

  insertNewAfter(_: RangeSelection, restoreSelection: boolean): ParagraphNode {
    const newElement = $createParagraphNode();
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }

  collapseAtStart(): boolean {
    const children = this.getChildren();
    // If we have an empty (trimmed) first paragraph and try and remove it,
    // delete the paragraph as long as we have another sibling to go to
    if (children.length===0) {
      this.remove();
      return true;
    } else {
      return false;
    }
  }

  setIndent(_: number): this {
    const self = this.getWritable();
    return self;
  }

  append(...nodesToAppend: LexicalNode[]): this {
    const children = this.getChildren();
    if (nodesToAppend.length===1&&nodesToAppend[0].__type==="table"&&children.length===0) {
      super.append(nodesToAppend[0]);
    } 
    return this;
  }
}

function convertTableWrapperElement(element: HTMLElement): DOMConversionOutput {
  const node = $createTableWrapperNode();
  return {node};
}

export function $createTableWrapperNode(): TableWrapperNode {
  return $applyNodeReplacement(new TableWrapperNode());
}

export function $isTableWrapperNode(
  node: LexicalNode | null | undefined,
): node is TableWrapperNode {
  return node instanceof TableWrapperNode;
}