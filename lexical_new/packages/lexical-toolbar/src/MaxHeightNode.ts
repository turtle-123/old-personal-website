/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { mergeRegister } from '@lexical/utils';
import {
  type EditorConfig, 
  type LexicalEditor,
  type DOMConversionMap,
  type DOMExportOutput,
  type LexicalNode,
  type SerializedLexicalNode,
  DecoratorNode,
  Spread,
  $getRoot,
  $nodesOfType,
} from 'lexical';



export type SerializedMaxHeightNode = Spread<SerializedLexicalNode,{ maxHeight: number}>;

const CURRENT_VERSION = 1;


function getHandleMaxHeightClick(namespace:string,maxHeight:number) {
  const func = function (this:HTMLButtonElement,e:Event) {
    const svg = this.querySelector('svg');
    const wrapper = document.getElementById(namespace);
    if (wrapper&&svg) {
      if (wrapper.getAttribute('data-abbreviated')==="true") {
        wrapper.setAttribute('data-abbreviated','false');
        wrapper.style.setProperty("scrollbar-width","none",'important');
        wrapper.style.setProperty("overflow-y","scroll");
        const scrollHeight = wrapper.scrollHeight;
        wrapper.style.setProperty("transition",'max-height 0.5s ease-in-out');
        wrapper.style.setProperty("max-height",scrollHeight.toString().concat('px'));
        svg.style.setProperty("transform","rotate(180deg)",'important');
        setTimeout(() => {
          wrapper.style.setProperty('max-height','auto');
          wrapper.style.removeProperty("overflow-y");
          wrapper.style.removeProperty("transition");
        },550);
      } else if (wrapper.getAttribute('data-abbreviated')==="false") {
        wrapper.setAttribute('data-abbreviated','true');
        wrapper.style.setProperty("transition",'max-height 0.5s ease-in-out');
        wrapper.style.setProperty("overflow-y","hidden");
        wrapper.style.setProperty('max-height',maxHeight.toString().concat('px'));
        svg.style.setProperty("transform","rotate(0deg)",'important');
        setTimeout(() => {
          wrapper.style.removeProperty("transition");
        },550);
      }
    }
  }
  return func;
}

function createMaxHeightButton(config:EditorConfig,maxHeight:number) {
  const button = document.createElement('button');
  button.insertAdjacentHTML("afterbegin",'<svg style="transition: transform 0.5s ease-in-out;" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowDown"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
  button.classList.add("icon","filled","primary",'medium');
  button.setAttribute("type","button");
  button.setAttribute("aria-label","Hide/Show Content");
  button.style.cssText = "position:absolute; bottom: 1rem; right: 1rem;"
  button.addEventListener("click",getHandleMaxHeightClick(config.namespace,maxHeight));
  return button;
}

/** @noInheritDoc */
export class MaxHeightButtonNode extends DecoratorNode<HTMLElement> {
  __maxHeight: number;

  constructor(maxHeight:number,key?:string) {
    super(key);
    this.__maxHeight = maxHeight;
  }

  static getType(): string {
    return 'max-height-button';
  }

  static clone(node: MaxHeightButtonNode): MaxHeightButtonNode {
    const newNode = new MaxHeightButtonNode(node.getMaxHeight(),node.__key);
    return newNode;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    return span;
  }
  updateDOM(
    prevNode: MaxHeightButtonNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const {element} = super.exportDOM(editor); // calls createDOM
    return {
      element,
    };
  }
  getMaxHeight() {
    const self = this.getLatest();
    return self.__maxHeight;
  }
  setMaxHeight(n:number) {
    const self = this.getWritable();
    self.__maxHeight = n;
    return self;
  }

  static importJSON(serializedNode: SerializedMaxHeightNode): MaxHeightButtonNode {
    const node = $createMaxHeightNode(serializedNode.maxHeight);
    return node;
  }

  exportJSON(): SerializedMaxHeightNode {
    return {
      ...super.exportJSON(),
      type: 'max-height-button',
      version:CURRENT_VERSION,
      maxHeight: this.getMaxHeight()
    };
  }

  // Mutation

  collapseAtStart(): boolean {
    return false;
  }

  isInline(): boolean {
    return true;
  }

  decorate(editor: LexicalEditor, config: EditorConfig) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0){
        const button = createMaxHeightButton(config,this.getMaxHeight());
        element.append(button);
        return button;
      }
    }
    return document.createElement('div');
    
  }
}


export function $createMaxHeightNode(n:number): MaxHeightButtonNode {
  return new MaxHeightButtonNode(n);
}

export function $isMaxHeightNode(
  node: LexicalNode | null | undefined,
): node is MaxHeightButtonNode {
  return node instanceof MaxHeightButtonNode;
}

export function registerMaxHeightNode(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const dataMaxHeight = wrapper.getAttribute('data-max-height');
    if (dataMaxHeight) {
      wrapper.style.setProperty("position","relative","important");
      wrapper.style.setProperty("max-height",dataMaxHeight.concat("px"),"important");
      wrapper.style.setProperty("scrollbar-width","none",'important');
      wrapper.style.setProperty("overflow-y","scroll");
      if (wrapper.scrollHeight > wrapper.offsetHeight) {
        wrapper.style.setProperty("overflow-y","hidden");
        wrapper.setAttribute("data-abbreviated","true");
        wrapper.style.removeProperty("scrollbar-width");
        if (dataMaxHeight&&Number.isInteger(parseInt(dataMaxHeight))) {
          editor.update(() => {
            const root = $getRoot();
            root.append($createMaxHeightNode(parseInt(dataMaxHeight)));
          })
          return mergeRegister(
            editor.registerEditableListener((editable:boolean) => {
              if (editable) {
                const maxHeightNodes = $nodesOfType(MaxHeightButtonNode);
                maxHeightNodes.forEach((node) => node.remove());
              }
            }),
            editor.registerMutationListener(MaxHeightButtonNode,(nodeMutations) => {
              for (const [nodeKey, mutation] of nodeMutations) {
                if (mutation === 'created') {
                  const maxHeightNodes = $nodesOfType(MaxHeightButtonNode);
                  maxHeightNodes.slice(1).forEach((node) => node.remove());
                }
              }
            })
          )
        }
      } else {
        wrapper.style.removeProperty("position");
        wrapper.style.removeProperty("max-height");
        wrapper.style.removeProperty("overflow-y");
        wrapper.style.removeProperty("scrollbar-width");
      }
    }
  } 
  return () => {}
}