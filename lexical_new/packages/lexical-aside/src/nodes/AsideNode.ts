import type {
  EditorConfig, 
  ElementFormatType, 
  LexicalCommand, 
  LexicalEditor, 
  NodeKey, 
  RangeSelection,
  SerializedElementNode,
  
} from 'lexical';
import {
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  isHTMLElement,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $isRootNode,
  INSERT_PARAGRAPH_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  BLOCK_STYLE_DEFAULT,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $isTextNode
} from 'lexical';
import { 
  ElementNode, 
  Spread, 
  $applyNodeReplacement,
  ParagraphNode,
  $createParagraphNode 
} from 'lexical';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { isTouchDevice, REGISTER_TOOLBAR_LISTENERS } from '@lexical/shared';

export type SerializedAsideNode = Spread<
  SerializedElementNode,
  {
    side: 'left'|'right'
  }
>;

const CURRENT_VERSION = 1;

export class AsideNode extends ElementNode {
  __side: 'left'|'right';
  constructor(side:'left'|'right',key?:NodeKey) {
    super(key);
    this.__side = side;
    this.__version = CURRENT_VERSION;
  }
  static getType():string {
    return 'aside';
  }
  static clone(node: AsideNode):AsideNode {
    return new AsideNode(node.__side,node.__key);
  }
  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const aside = document.createElement('aside');
    aside.classList.add(this.getSide(),'rte');
    aside.setAttribute('data-v',String(CURRENT_VERSION));
    return aside;
  }
  updateDOM() {
    return false;
  }
  static importDOM():DOMConversionMap|null {
    return {
      aside: (node: HTMLElement) => ({
        conversion: convertAsideElement,
        priority: 1
      })
    }
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor); // See LexicalNode.ts -> should call this element createDOM method
    if (element && isHTMLElement(element)){
      if(this.isEmpty()) element.append(document.createElement('br'));
      element.setAttribute('data-v',String(CURRENT_VERSION));
    }
    return {
      element
    };
  }
  static importJSON(serializedNode: SerializedAsideNode):AsideNode {
    const node = $createAsideNode(serializedNode.side);
    return node;
  }
  exportJSON():SerializedAsideNode {
    return {
      ...super.exportJSON(),
      side: this.getSide(),
      type:'aside',
      version: CURRENT_VERSION
    };
  }
  insertNewAfter(_: RangeSelection, restoreSelection: boolean): ParagraphNode {
    const newElement = $createParagraphNode();
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    return newElement;
  }
  collapseAtStart(): boolean {
    this.replace($createParagraphNode());
    return true;
  }
  getSide() {
    const self = this.getLatest();
    return self.__side;
  }
  setIndent(_: number): this {
    return this.getWritable();
  }
  setFormat(_: ElementFormatType): this {
    return this.getWritable();
  }
  isShadowRoot(): boolean {
    return true;
  }
  canReplaceWith(replacement: LexicalNode): boolean {
    return $isParagraphNode(replacement);
  }
}

function convertAsideElement(el:HTMLElement) {
  const left = el.classList.contains('left');
  const side = left ? 'left' : 'right';
  const node = $createAsideNode(side);
  return {node};
}

export function $createAsideNode(side:'left'|'right'): AsideNode {
  return $applyNodeReplacement(new AsideNode(side));
}

export function $isAsideNode(
  node: LexicalNode | null | undefined,
): node is AsideNode {
  return node instanceof AsideNode;
}

export const INSERT_ASIDE_COMMAND:LexicalCommand<{side:'left'|'right'}> = createCommand('INSERT_ASIDE_ELEMENT');

function getInsertAside(editor:LexicalEditor) {
  const insertAside = function (this:HTMLButtonElement) {
    const payload = this.getAttribute('data-payload');
    if(payload==="left"){
      editor.dispatchCommand(INSERT_ASIDE_COMMAND,{side: "left"});
    }else if (payload==="right"){
      editor.dispatchCommand(INSERT_ASIDE_COMMAND,{side: "right"});
    }
  }
  return insertAside;
}

function registerAsideListeners(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if (wrapper) {
      const insertAsideButtons = Array.from(document.querySelectorAll('button[data-dispatch="INSERT_ASIDE_COMMAND"]'));
      insertAsideButtons.forEach((button)=>{
        const dataMouseDown = button.getAttribute('data-mouse-down');
        if (dataMouseDown!==null) {
          if (!!!isTouchDevice()) button.addEventListener('mousedown',getInsertAside(editor));
          else button.addEventListener('touchstart',getInsertAside(editor));
        } else {
          button.addEventListener('click',getInsertAside(editor));
        }
      })
    }
}
export function registerAsideEditable(editor:LexicalEditor) {
  if (editor.hasNode(AsideNode)) {
    registerAsideListeners(editor);
    return mergeRegister(
      // Insert Aside Element
      editor.registerCommand(
      INSERT_ASIDE_COMMAND,
      (payload) => {
        const selection = $getSelection();
        const paragraphNode = $createParagraphNode();
        paragraphNode.setBlockStyle({ ...BLOCK_STYLE_DEFAULT, margin: '0px' });
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const nearestParagraphNode = $findMatchingParent(anchorNode,(node) => $isParagraphNode(node) && $isRootNode(node.getParent()));
          if($isParagraphNode(nearestParagraphNode)) {
            nearestParagraphNode.insertBefore($createAsideNode(payload.side).append(paragraphNode));
          } else {
            const rootNode = $findMatchingParent(anchorNode,(node) => $isRootNode(node)||(node.isShadowRoot&&node.isShadowRoot()));
            if (rootNode) {
              rootNode.append(paragraphNode);
              paragraphNode.insertBefore($createAsideNode(payload.side).append($createParagraphNode()));
            }
          }
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
      ),
      // When the user tries to escape aside by pressing ENTER, let them
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&selection.isCollapsed()&&editor.isEditable()) {
            const anchor = selection.anchor.getNode();
            const paragraphNode = $findMatchingParent(anchor, node => $isParagraphNode(node) && $isAsideNode(node.getParent()));
            if (paragraphNode) {
              const asideNode = paragraphNode.getParent() as AsideNode;
              const lastChild = asideNode.getLastChild();
              const previousChild = lastChild?.getPreviousSibling();
              if (asideNode.getChildrenSize() >=3 && 
              $isParagraphNode(lastChild) && 
              $isParagraphNode(previousChild) && 
              lastChild.isEmpty() && 
              previousChild.isEmpty()
              ) {
                lastChild.remove();
                previousChild.remove();
                const p = $createParagraphNode();
                asideNode.insertAfter(p);
                p.selectEnd();
                return true;
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (e) => {
          if (e&&e.shiftKey) {
            const selection = $getSelection();
            if ($isRangeSelection(selection)&&selection.isCollapsed()) {
              const nodes = selection.getNodes();
              if(nodes.length) {
                const node = nodes[0];
                if ($isTextNode(node)) {
                  const para = node.getParent();
                  if ($isParagraphNode(para)) {
                    const textContent = node.getTextContent();
                    const offset = selection.getCharacterOffsets();
                    const endCharacter = offset[0];
                    const startCharacter = endCharacter-3;
                    const asideText = textContent.slice(startCharacter,endCharacter);
                    if (asideText==="-->") {
                      node.setTextContent(textContent.slice(0,startCharacter));
                      const asideNode = $createAsideNode("right");
                      asideNode.append($createParagraphNode());
                      para.insertBefore(asideNode);
                      return true;
                    } else if (asideText==="<--") {
                      node.setTextContent(textContent.slice(0,startCharacter));
                      const asideNode = $createAsideNode("left");
                      asideNode.append($createParagraphNode());
                      para.insertBefore(asideNode);
                      return true;
                    }
                  }
                }
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        REGISTER_TOOLBAR_LISTENERS,
        () => {
          registerAsideListeners(editor);
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  } else {
    console.error('Editor does not have AsideNode registered.');
  }
  return () => {return};  
}