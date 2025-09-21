/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IS_REAL_BROWSER, UPDATE_ON_SET_HTML, getCurrentEditor, closeDialog } from './lexical-sharedLexicalShared.js';
import { DecoratorNode, $applyNodeReplacement, $getNodeByKey, $setSelection, createCommand, KEY_ESCAPE_COMMAND, COMMAND_PRIORITY_HIGH, $createParagraphNode, $insertNodes, COMMAND_PRIORITY_EDITOR, KEY_ENTER_COMMAND, $getSelection, $isRangeSelection, $isParagraphNode, $nodesOfType } from './lexicalLexical.js';
import { mergeRegister, $findMatchingParent, $insertNodeToNearestRoot } from './lexical-utilsLexicalUtils.js';

const CURRENT_VERSION = 1;
class MathNode extends DecoratorNode {
  __editable = false;
  __version = CURRENT_VERSION;
  static getType() {
    return 'math';
  }
  isKeyboardSelectable() {
    return true;
  }
  static clone(node) {
    return new MathNode(node.__equation, node.__inline, node.__key);
  }
  constructor(equation, inline, key) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }
  static importJSON(serializedNode) {
    const node = $createMathNode(serializedNode.equation, serializedNode.inline);
    if (serializedNode?.first_element) node.setFirstElement(true);
    return node;
  }
  exportJSON() {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: 'math',
      version: CURRENT_VERSION,
      first_element: this.getFirstElement()
    };
  }
  createDOM(_config) {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    // EquationNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
    element.className = 'lexical-math';
    element.setAttribute("data-v", String(CURRENT_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  exportDOM() {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    // Encode the equation as base64 to avoid issues with special characters
    var equation = '';
    try {
      equation = window.btoa(this.__equation);
    } catch (error) {
      console.error(error);
    }
    element.setAttribute('data-frank-equation', equation);
    element.setAttribute('data-frank-inline', `${this.__inline}`);
    if (!!!this.__inline) element.style.setProperty('overflow-x', 'auto');
    if (this.__inline) {
      renderMathInline(element, this.__equation);
    } else {
      renderMathBlock(element, this.__equation);
    }
    element.setAttribute("data-v", String(CURRENT_VERSION));
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-frank-equation')) {
          return null;
        }
        return {
          conversion: convertMathElement,
          priority: 4
        };
      },
      span: domNode => {
        if (!domNode.hasAttribute('data-frank-equation')) {
          return null;
        }
        return {
          conversion: convertMathElement,
          priority: 2
        };
      }
    };
  }
  updateDOM(prevNode) {
    // If the inline property changes, replace the element
    return Boolean(this.__inline !== prevNode.__inline || this.__editable !== prevNode.__editable);
  }
  getTextContent() {
    return this.__equation;
  }
  getEquation() {
    return this.__equation;
  }
  setEquation(equation) {
    const writable = this.getWritable();
    writable.__equation = equation;
  }
  setEditable(bool) {
    const self = this.getWritable();
    self.__editable = bool;
    return self;
  }
  getEditable() {
    const self = this.getLatest();
    return self.__editable;
  }
  isInline() {
    const self = this.getLatest();
    return self.__inline;
  }
  decorate(editor, config) {
    const element = editor.getElementByKey(this.__key);
    if (this.__equation.length === 0) {
      this.remove();
      return document.createElement('div');
    }
    if (element) {
      if (this.getEditable()) {
        const div = document.createElement('div');
        div.setAttribute('data-frank-equation', '');
        div.className = 'katex-equation-editor';
        const span = document.createElement('span');
        span.className = 'katex-equation-dollar-sign';
        span.innerText = this.__inline ? '$' : '$$';
        const textArea = document.createElement('textarea');
        textArea.className = 'katex-equation-editor';
        textArea.value = this.__equation;
        function handleEquationChange(e) {
          const value = this.value;
          const nodeWrapper = this.closest('[data-frank-decorator]');
          if (nodeWrapper) {
            const nodeKey = nodeWrapper.getAttribute('data-node-key');
            if (nodeKey) {
              editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isMathNode(node) && value.length !== 0) node.setEquation(value);else if ($isMathNode(node)) node.remove();
              });
            }
          }
        }
        function keyPress(e) {
          const selectionStart = this.selectionStart;
          const selectionEnd = this.selectionEnd;
          const value = this.value;
          const nodeWrapper = this.closest('[data-frank-decorator]');
          if (nodeWrapper) {
            const nodeKey = nodeWrapper.getAttribute('data-node-key');
            if (nodeKey) {
              if (e.key === "ArrowUp") {
                const firstLine = !!!Boolean(value.slice(0, selectionStart).includes('\n'));
                if (firstLine) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectStart());
                      }
                    }
                  });
                }
              } else if (e.key === "ArrowDown") {
                const lastLine = !!!Boolean(value.slice(selectionEnd, value.length).includes('\n'));
                if (lastLine) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectEnd());
                      }
                    }
                  });
                }
              } else if (e.key === "ArrowLeft") {
                if (selectionStart === 0) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectStart());
                      }
                    }
                  });
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setSelectionRange(selectionStart - 1, selectionStart - 1);
                }
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                e.stopPropagation();
                if (selectionEnd === value.length) {
                  e.preventDefault();
                  e.stopPropagation();
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isMathNode(node)) {
                      node.setEditable(false);
                      const paragraph = node.getParentOrThrow();
                      if (paragraph) {
                        $setSelection(paragraph.selectEnd());
                      }
                    }
                  });
                } else {
                  e.preventDefault();
                  e.stopPropagation();
                  this.setSelectionRange(selectionStart + 1, selectionStart + 1);
                }
              }
            }
          }
        }
        textArea.addEventListener('change', handleEquationChange);
        textArea.addEventListener('keydown', keyPress, true);
        const span2 = span.cloneNode(true);
        div.append(span);
        div.append(textArea);
        div.append(span2);
        clearInnerHTML(element);
        element.append(div);
        setTimeout(() => {
          textArea.focus();
        }, 100);
        return div;
      } else {
        if (this.isInline()) {
          const span = document.createElement('span');
          span.setAttribute('data-frank-equation', '');
          span.className = 'inline-katex';
          renderMathInline(span, this.__equation);
          clearInnerHTML(element);
          element.append(span);
          return span;
        } else {
          const div = document.createElement('div');
          if (this.getFirstElement()) div.classList.add('first-rte-element');
          if (this.getLastElement()) div.classList.add('last-rte-element');
          div.setAttribute('data-frank-equation', '');
          div.className = 'hz-scroll';
          div.style.setProperty("overflow-x", "auto");
          const innerDiv = document.createElement('div');
          innerDiv.className = "katex-block";
          innerDiv.style.cssText = "position:relative;";
          renderMathBlock(innerDiv, this.__equation);
          clearInnerHTML(element);
          div.append(innerDiv);
          element.append(div);
          return div;
        }
      }
    } else return document.createElement('div');
  }
}
function convertMathElement(domNode) {
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
    return {
      node
    };
  }
  return null;
}
function $createMathNode(equation = '', inline = false) {
  const mathNode = new MathNode(equation, inline);
  return $applyNodeReplacement(mathNode);
}
function $isMathNode(node) {
  return node instanceof MathNode;
}
function renderMathInline(element, equation) {
  import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
    res.katex.render(equation, element, {
      displayMode: false,
      // true === block display //
      errorColor: '#cc0000',
      output: 'html',
      strict: false,
      throwOnError: false,
      trust: false
    });
  }).catch(error => {
    console.error(error);
  });
}
function renderMathBlock(element, equation) {
  import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
    res.katex.render(equation, element, {
      displayMode: true,
      // true === block display //
      errorColor: '#cc0000',
      output: 'html',
      strict: false,
      throwOnError: false,
      trust: false
    });
  }).catch(error => {
    console.error(error);
  });
}
function clearInnerHTML(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

/**
 * @todo Will need to change audio and video validation
 */
const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND');

/* ------------------------------------- Math Stuff --------------------------------------- */
/**
 * Math Stuff
 * @returns 
 */
function getMathDialog() {
  const dialog = document.getElementById('math-markup-lexical');
  if (dialog) {
    const text = dialog.querySelector('textarea');
    const equation = text ? text.value : '';
    const radios = Array.from(dialog.querySelectorAll('input[type="radio"]'));
    const checkedRadio = radios.filter(el => el.checked);
    const radio = checkedRadio.length ? checkedRadio[0].value : 'block';
    const displayStyle = radio === "block" || radio === "inline" ? Boolean(radio === "block") : true;
    const example = dialog.querySelector('output[data-preview]');
    const form = dialog.querySelector('form');
    return {
      dialog,
      equation,
      displayStyle,
      example,
      form
    };
  } else return null;
}
var MATH_DEBOUNCER = undefined;
function handleMathDialogChange(e) {
  const mathDialog = getMathDialog();
  if (MATH_DEBOUNCER) clearTimeout(MATH_DEBOUNCER);
  if (mathDialog && mathDialog.example) {
    const updateMathPreview = function () {
      /* displayStyle===true -> block */
      if (this.displayStyle) {
        clearInnerHTML(this.example);
        if (this.equation.length) {
          this.example.className = "katex-block mt-3";
          this.example.style.cssText = "position:relative;";
          renderMathBlock(this.example, this.equation);
        }
      } else {
        if (this.equation.length) {
          clearInnerHTML(this.example);
          this.example.className = "inline-katex mt-3";
          this.example.style.cssText = "";
          renderMathInline(this.example, this.equation);
        }
      }
    }.bind(mathDialog);
    MATH_DEBOUNCER = setTimeout(updateMathPreview, 250);
  }
}
function handleMathDialogSubmit(e) {
  e.preventDefault();
  const mathDialog = getMathDialog();
  const editor = getCurrentEditor();
  if (mathDialog && editor && mathDialog.dialog) {
    editor.dispatchCommand(INSERT_MATH_COMMAND, {
      equation: mathDialog.equation,
      inline: !!!mathDialog.displayStyle
    });
    closeDialog(mathDialog.dialog);
    if (mathDialog.example) {
      clearInnerHTML(mathDialog.example);
      mathDialog.example.className = "";
      mathDialog.example.style.cssText = "";
    }
    this.reset();
  }
}
function getOnOpenMathDialog(e) {
  if (e.detail.el.id === "math-markup-lexical") {
    const dialog = document.getElementById('math-markup-lexical');
    if (dialog) {
      const mathDialog = getMathDialog();
      if (mathDialog && mathDialog.form) {
        mathDialog.form.addEventListener('submit', handleMathDialogSubmit);
        mathDialog.form.addEventListener('change', handleMathDialogChange);
        mathDialog.form.addEventListener('input', handleMathDialogChange);
      }
    }
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: dialog
      }
    }));
  }
}
function registerMathEditable(editor) {
  if (editor.hasNode(MathNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenMathDialog);
    return mergeRegister(editor.registerCommand(KEY_ESCAPE_COMMAND, payload => {
      const decorators = editor.getDecorators();
      for (let key of Object.keys(decorators)) {
        const node = $getNodeByKey(key);
        if ($isMathNode(node) && node.getEditable()) node.setEditable(false);
      }
      return false;
    }, COMMAND_PRIORITY_HIGH), editor.registerCommand(INSERT_MATH_COMMAND, payload => {
      const {
        equation,
        inline
      } = payload;
      const mathNode = $createMathNode(equation, inline);
      const paragraphNode = $createParagraphNode();
      $insertNodes([mathNode, paragraphNode]);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(KEY_ENTER_COMMAND, e => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const nodes = selection.getNodes();
        if (nodes.length) {
          const node = nodes[0];
          if (node) {
            const para = $findMatchingParent(node, n => $isParagraphNode(n));
            if ($isParagraphNode(para)) {
              const textContent = para.getTextContent();
              if (textContent.trim() === "$$") {
                var currNode = para.getPreviousSibling();
                const nodesToReplace = [para];
                var continueLookingUp = true;
                var katexExpression = '';
                var insertMathBlock = false;
                while (continueLookingUp) {
                  if (!!!$isParagraphNode(currNode)) break;else {
                    const text = currNode.getTextContent();
                    if (/\$\$/.test(text.trim())) {
                      insertMathBlock = true;
                      nodesToReplace.push(currNode);
                      continueLookingUp = false;
                      break;
                    } else {
                      katexExpression = currNode.getTextContent() + ' ' + katexExpression;
                      nodesToReplace.push(currNode);
                      currNode = currNode.getPreviousSibling();
                      continue;
                    }
                  }
                }
                if (insertMathBlock) {
                  nodesToReplace.forEach(node => node.remove(false));
                  const mathNode = $createMathNode(katexExpression, false);
                  $insertNodeToNearestRoot(mathNode);
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    }, COMMAND_PRIORITY_HIGH), registerMathNotEditable(editor));
  } else {
    console.error("Editor does not have MathNode registered.");
  }
  return () => {
    return;
  };
}
function registerMathNotEditable(editor) {
  if (editor.hasNode(MathNode)) {
    return mergeRegister(editor.registerEditableListener(editable => {
      editor.update(() => {
        const mathNodes = $nodesOfType(MathNode);
        if (!!!editable) {
          mathNodes.forEach(node => {
            node.setEditable(false);
          });
        }
      });
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const mathNodes = $nodesOfType(MathNode);
      mathNodes.forEach(node => {
        if (node.getEditable()) node.setEditable(false);
      });
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have MathNode registered.");
  }
  return () => {
    return;
  };
}

export { $createMathNode, $isMathNode, MathNode, clearInnerHTML, registerMathEditable, registerMathNotEditable, renderMathBlock, renderMathInline };
