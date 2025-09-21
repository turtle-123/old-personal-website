import { IS_REAL_BROWSER } from '@lexical/shared';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread
} from 'lexical';
import {
  $applyNodeReplacement, 
  DecoratorNode, 
  DOMExportOutput, 
  $getNodeByKey,
  $setSelection
} from 'lexical';


export type SerializedMathNode = Spread<
  {
    equation: string;
    inline: boolean;
    first_element: boolean;
  },
  SerializedLexicalNode
>;
const CURRENT_VERSION = 1;



export class MathNode extends DecoratorNode<HTMLElement> {
  __equation: string;
  __inline: boolean;
  __editable: boolean = false;
  __version: number = CURRENT_VERSION;

  static getType(): string {
    return 'math';
  }
  isKeyboardSelectable(): boolean {
    return true;
  }
  static clone(node: MathNode): MathNode {
    return new MathNode(node.__equation, node.__inline, node.__key);
  }

  constructor(equation: string, inline?: boolean, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }

  static importJSON(serializedNode: SerializedMathNode): MathNode {
    const node = $createMathNode(
      serializedNode.equation,
      serializedNode.inline,
    );
    if (serializedNode?.first_element) node.setFirstElement(true);
    return node;
  }

  exportJSON(): SerializedMathNode {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: 'math',
      version: CURRENT_VERSION,
      first_element: this.getFirstElement()
    };
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    // EquationNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
    element.className = 'lexical-math';
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    // Encode the equation as base64 to avoid issues with special characters
    var equation = ''
    try {
      equation = window.btoa(this.__equation);
    } catch (error) {
      console.error(error);
    }
    element.setAttribute('data-frank-equation', equation);
    element.setAttribute('data-frank-inline', `${this.__inline}`);
    if (!!!this.__inline) element.style.setProperty('overflow-x','auto');
    if (this.__inline) {
      renderMathInline(element,this.__equation);
    } else {
      renderMathBlock(element,this.__equation);
    }
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-frank-equation')) {
          return null;
        }
        return {
          conversion: convertMathElement,
          priority: 4,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-frank-equation')) {
          return null;
        }
        return {
          conversion: convertMathElement,
          priority: 2,
        };
      },
    };
  }

  updateDOM(prevNode: MathNode): boolean {
    // If the inline property changes, replace the element
    return Boolean(
      (this.__inline !== prevNode.__inline) ||
      (this.__editable !== prevNode.__editable)
    );
  }

  getTextContent(): string {
    return this.__equation;
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  setEditable(bool: boolean):MathNode {
    const self = this.getWritable();
    self.__editable = bool;
    return self;
  }

  getEditable():boolean {
    const self = this.getLatest();
    return self.__editable;
  }

  isInline() {
    const self = this.getLatest();
    return self.__inline;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): HTMLElement {
    const element = editor.getElementByKey(this.__key);
    if (this.__equation.length===0) {
      this.remove();
      return document.createElement('div');
    }
    if (element) {
      if(this.getEditable()){
        const div = document.createElement('div');
        div.setAttribute('data-frank-equation','');
        div.className = 'katex-equation-editor';
        const span = document.createElement('span');
        span.className = 'katex-equation-dollar-sign';
        span.innerText = this.__inline ? '$' : '$$';
        const textArea = document.createElement('textarea');
        textArea.className = 'katex-equation-editor';
        textArea.value = this.__equation;
        function handleEquationChange(this:HTMLTextAreaElement,e:Event) {
          const value = this.value;
          const nodeWrapper = this.closest<HTMLDivElement>('[data-frank-decorator]');
          if (nodeWrapper) {
            const nodeKey = nodeWrapper.getAttribute('data-node-key');
            if (nodeKey) {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isMathNode(node) && value.length!==0) node.setEquation(value);
                else if ($isMathNode(node)) node.remove();
              })
            }
          }
        }
        function keyPress(this: HTMLTextAreaElement,e:KeyboardEvent) {
          const selectionStart = this.selectionStart;
          const selectionEnd = this.selectionEnd;
          const value = this.value;
          const nodeWrapper = this.closest<HTMLDivElement>('[data-frank-decorator]');
          if (nodeWrapper) {
            const nodeKey = nodeWrapper.getAttribute('data-node-key');
            if (nodeKey) {
              if (e.key === "ArrowUp") {
                const firstLine = !!!Boolean(value.slice(0,selectionStart).includes('\n'));
                if (firstLine) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectStart());
                      }
                    }
                  })
                }
              } else if (e.key === "ArrowDown") {
                const lastLine = !!!Boolean(value.slice(selectionEnd,value.length).includes('\n'));
                if (lastLine) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectEnd());
                      }
                    }
                  })
                }
              } else if (e.key === "ArrowLeft") {
                if (selectionStart===0) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectStart());
                      }
                    }
                  })
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setSelectionRange(selectionStart-1,selectionStart-1);
                }
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                e.stopPropagation();
                if (selectionEnd===value.length){
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectEnd());
                      }
                    }
                  })
    
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setSelectionRange(selectionStart+1,selectionStart+1);
                }
              }
            }
          }
        }
        textArea.addEventListener('change',handleEquationChange);
        textArea.addEventListener('keydown',keyPress,true);
        const span2 = span.cloneNode(true);
        div.append(span);
        div.append(textArea);
        div.append(span2);
        clearInnerHTML(element);
        element.append(div);
        setTimeout(() => {
          textArea.focus();
        },100);
       
        return div;
      }else{
        if (this.isInline()){
          const span = document.createElement('span');
          span.setAttribute('data-frank-equation','');
          span.className = 'inline-katex';
          renderMathInline(span,this.__equation);
          clearInnerHTML(element);
          element.append(span);
          return span;
        }else{
          const div = document.createElement('div');
          if (this.getFirstElement()) div.classList.add('first-rte-element');
          if (this.getLastElement()) div.classList.add('last-rte-element');
          div.setAttribute('data-frank-equation','');
          div.className = 'hz-scroll';
          div.style.setProperty("overflow-x","auto");
          const innerDiv = document.createElement('div');
          innerDiv.className="katex-block"
          innerDiv.style.cssText = "position:relative;";
          renderMathBlock(innerDiv,this.__equation);
          clearInnerHTML(element);
          div.append(innerDiv);
          element.append(div);
          return div;
        }
      }
    } else return document.createElement('div'); 
  }
}

function convertMathElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  let equation = domNode.getAttribute('data-frank-equation');
  const inline = domNode.getAttribute('data-frank-inline') === 'true';
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  // Decode the equation from base64
  equation = window.atob(equation || '');
  if (equation) {
    const node = $createMathNode(equation, inline);
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node};
  }

  return null;
}

export function $createMathNode(
  equation = '',
  inline = false,
): MathNode {
  const mathNode = new MathNode(equation, inline);
  return $applyNodeReplacement(mathNode);
}

export function $isMathNode(
  node: LexicalNode | null | undefined,
): node is MathNode {
  return node instanceof MathNode;
}


export function renderMathInline(element: HTMLElement,equation: string) {
  import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
  .then((res) => {
    res.katex.render(equation, element, {
      displayMode: false, // true === block display //
      errorColor: '#cc0000',
      output: 'html',
      strict: false,
      throwOnError: false,
      trust: false,
    });
  })
  .catch((error) => {
    console.error(error);
  })
}
export function renderMathBlock(element: HTMLElement,equation: string) {
  import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
  .then((res) => {
    res.katex.render(equation, element, {
      displayMode: true, // true === block display //
      errorColor: '#cc0000',
      output: 'html',
      strict: false,
      throwOnError: false,
      trust: false,
    });
  })
  .catch((error) => {
    console.error(error);
  })
  
}
export function clearInnerHTML(element: HTMLElement) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild as ChildNode);
  }
}