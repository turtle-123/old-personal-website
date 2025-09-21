import { 
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR, 
  ElementFormatType
} from "lexical";
import type { SerializedDecoratorBlockNode } from "./DecoratorBlockNode";
import { DecoratorBlockNode } from "./DecoratorBlockNode";
import type { 
  EditorConfig, 
  DOMExportOutput, 
  LexicalCommand, 
  LexicalEditor, 
  Spread, 
  LexicalNode, 
  DOMConversionOutput,
  DOMConversionMap
} from "lexical";
import { createCommand } from "lexical";
import { VALID_HEX_REGEX } from "lexical";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import { IS_REAL_BROWSER } from "@lexical/shared";

const HORIZONTAL_RULE_VERSION = 1;

export type SerializedHorizontalRuleNode = Spread<
  {
    color: string;
    width: number;
  },
  SerializedDecoratorBlockNode
>;

const clampWidth = (num: number) => Math.min(Math.max(1,num),10);

export class HorizontalRuleNode extends DecoratorBlockNode {
  __color: string;
  __width: number;
  __version: number = HORIZONTAL_RULE_VERSION;

  constructor(styleObj?: {color: string, width: number}, key?:string, format?: ElementFormatType) {
    super(format,key);
    if (styleObj) {
      if (VALID_HEX_REGEX.test(String(styleObj.color))) {
        this.__color = styleObj.color;
      } else this.__color = 'var(--divider)';
      this.__width = clampWidth(styleObj.width);
    } else {
      this.__color = 'var(--divider)';
      this.__width = 1;
    }
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode({color: node.getColor(), width: node.getWidth() })
  }

  static getType() {
    return 'horizontal-rule';
  }

  getColor() {
    const self = this.getLatest();
    return self.__color;
  }
  getWidth() {
    const self = this.getLatest();
    return self.__width;
  }
  getTextContent(): string {
    return '\n-----\n';
  }
  setFormat(format: ElementFormatType): void {
    const self = this.getWritable();
    self.__format = 'center';
  }
  getHorizontalRuleStyle() {
    const self = this.getLatest();
    return {
      color: self.__color,
      width: self.__width
    }
  }
  setHorizontalRuleStyle({ color, width}: {color: string, width: number}) {
    const self = this.getWritable();
    self.__color = VALID_HEX_REGEX.test(color) ? color : 'var(--divider)';
    self.__width = clampWidth(width);
    return self;
  }
  static importJSON(serializedNode: SerializedHorizontalRuleNode): HorizontalRuleNode {
    const node = $createHorizontalRuleNode({ color: serializedNode.color, width: serializedNode.width });
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode.first_element);
    return node;
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: HORIZONTAL_RULE_VERSION,
      color: this.getColor(),
      width: this.getWidth()
    };
  }
  exportDOM(): DOMExportOutput {
    const element = createHorizontalRule(this.getHorizontalRuleStyle());
    element.setAttribute('data-color',this.__color);
    element.setAttribute('data-width',this.__width.toString());
    element.setAttribute('data-v',String(HORIZONTAL_RULE_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: (domNode: HTMLElement) => {
        return {
          conversion: convertHorizontalRuleElement,
          priority: 1,
        };
      },
    };
  }



  decorate(editor: LexicalEditor, config: EditorConfig) {
    const el = createHorizontalRule(this.getHorizontalRuleStyle());
    const element = editor.getElementByKey(this.__key);
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    if (element) {
      if (element.children.length===0) {
        element.append(el);
      } else {
        element.style.borderBottomWidth = String(this.__width).concat('px');
        if (this.__color==="var(--divider)") {
          element.style.removeProperty('border-bottom-color');
          element.classList.add('divider-color');
        } else {
          if (element.classList.contains('divider-color')) element.classList.remove('divider-color');
          element.style.borderBottomColor = this.__color;
        }
      }
    }
    return el;
  }
}

function createHorizontalRule(styleObj:{color: string, width: number}) {
  const hr = document.createElement('hr');
  hr.classList.add('lexical');
  var cssString = "border-bottom-width: ".concat(String(styleObj.width)).concat('px !important;');
  if (styleObj.color==="var(--divider)"||!!!styleObj.color) {
    hr.style.removeProperty('border-bottom-color');
    hr.classList.add('divider-color');
  } else if (VALID_HEX_REGEX.test(styleObj.color)) {
    hr.classList.remove('divider-color');
    cssString+=`border-bottom-color: ${styleObj.color} !important;`;
  }
  hr.style.cssText = cssString;
  return hr;
}

function convertHorizontalRuleElement(domNode: HTMLElement): null|DOMConversionOutput {
  var color = domNode.getAttribute('data-color') || '';
  var width = parseInt(domNode.getAttribute('data-width') || '');
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (!!!VALID_HEX_REGEX.test(color)) color = 'var(--divider)';
  if (isNaN(width)||width<1||width>10) width = 1;
  const node = $createHorizontalRuleNode({ color, width});
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return { node };
}

export function $createHorizontalRuleNode(styleObj?:{color: string, width: number}) {
  return new HorizontalRuleNode(styleObj);
}

export function $isHorizontalRuleNode(
  node: HorizontalRuleNode | LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}


export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<{ width: number, color: string|undefined }> = createCommand(
  'INSERT_HORIZONTAL_RULE_COMMAND',
);
export const FORMAT_HORIZONTAL_RULE_COMMAND: LexicalCommand<{ width: number, color: string|undefined }> = createCommand(
  'FORMAT_HORIZONTAL_RULE_COMMAND',
);

export function registerHorizontalRule(editor: LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      (payload) => {
        const horizontalRuleNode = $createHorizontalRuleNode({ color: String(payload.color), width: payload.width })
        $insertNodeToNearestRoot(horizontalRuleNode);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    editor.registerCommand(
      FORMAT_HORIZONTAL_RULE_COMMAND,
      (payload) => {
        const color = VALID_HEX_REGEX.test(String(payload.color))?String(payload.color):'var(--divider)';
        const width = clampWidth(payload.width);
        const selection = $getSelection();
        if ($isNodeSelection(selection)||$isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          for (let node of nodes) {
            if ($isHorizontalRuleNode(node)) {
              node.setHorizontalRuleStyle({color,width});
            }
          }
        } 
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ),
  );
}