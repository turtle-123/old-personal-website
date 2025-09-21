/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// eslint-disable-next-line simple-import-sort/imports
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  RangeSelection,
  SerializedElementNode,
  Spread,
  TabNode,
} from 'lexical';
import type {CodeHighlightNode} from '@lexical/code';



import {addClassNamesToElement, isHTMLElement} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $createLineBreakNode,
  $createParagraphNode,
  ElementNode,
  $isTabNode,
  $createTabNode,
  $isTextNode,
} from 'lexical';
import {
  $isCodeHighlightNode,
  $createCodeHighlightNode,
  getFirstCodeNodeOfLine,
} from './CodeHighlightNode';
// @ts-ignore
import { Prism } from 'personal-website-shared';

import { DISPATCH_SNACKBAR_CED, IS_REAL_BROWSER } from '@lexical/shared';


const VALID_LANGUAGES = new Set(["abap","abnf","actionscript","ada","agda","al","antlr4","apacheconf","apex","apl","applescript","aql","arduino","arff","armasm","arturo","asciidoc","asm6502","asmatmel","aspnet","autohotkey","autoit","avisynth","avro-idl","awk","bash","basic","batch","bbcode","bbj","bicep","birb","bison","bnf","bqn","brainfuck","brightscript","bro","bsl","c","cfscript","chaiscript","cil","cilkc","cilkcpp","clike","clojure","cmake","cobol","coffeescript","concurnas","cooklang","coq","core","cpp","crystal","csharp","cshtml","csp","css","css-extras","csv","cue","cypher","d","dart","dataweave","dax","dhall","diff","django","dns-zone-file","docker","dot","ebnf","editorconfig","eiffel","ejs","elixir","elm","erb","erlang","etlua","excel-formula","factor","false","firestore-security-rules","flow","fortran","fsharp","ftl","gap","gcode","gdscript","gedcom","gettext","gherkin","git","glsl","gml","gn","go","go-module","gradle","graphql","groovy","haml","handlebars","haskell","haxe","hcl","hlsl","hoon","hpkp","hsts","http","ichigojam","icon","icu-message-format","idris","iecst","ignore","inform7","ini","io","j","java","javadoc","javadoclike","javascript","javastacktrace","jexl","jolie","jq","js-extras","js-templates","jsdoc","json","json5","jsonp","jsstacktrace","jsx","julia","keepalived","keyman","kotlin","kumir","kusto","latex","latte","less","lilypond","linker-script","liquid","lisp","livescript","llvm","log","lolcode","lua","magma","makefile","markdown","markup","markup-templating","mata","matlab","maxscript","mel","mermaid","metafont","mizar","mongodb","monkey","moonscript","n1ql","n4js","nand2tetris-hdl","naniscript","nasm","neon","nevod","nginx","nim","nix","nsis","objectivec","ocaml","odin","opencl","openqasm","oz","parigp","parser","pascal","pascaligo","pcaxis","peoplecode","perl","php","php-extras","phpdoc","plant-uml","plsql","powerquery","powershell","processing","prolog","promql","properties","protobuf","psl","pug","puppet","pure","purebasic","purescript","python","q","qml","qore","qsharp","r","racket","reason","regex","rego","renpy","rescript","rest","rip","roboconf","robotframework","ruby","rust","sas","sass","scala","scheme","scss","shell-session","smali","smalltalk","smarty","sml","solidity","solution-file","soy","sparql","splunk-spl","sqf","sql","squirrel","stan","stata","stylus","supercollider","swift","systemd","t4-cs","t4-templating","t4-vb","tap","tcl","textile","toml","tremor","tsx","tt2","turtle","twig","typescript","typoscript","unrealscript","uorazor","uri","v","vala","vbnet","velocity","verilog","vhdl","vim","visual-basic","warpscript","wasm","web-idl","wgsl","wiki","wolfram","wren","xeora","xml-doc","xojo","xquery","yaml","yang","zig"]);

export type SerializedCodeNode = Spread<
  {
    language: string | null | undefined;
    onlyCodeEditor: boolean;
    first_element: boolean;
  },
  SerializedElementNode
>;

const mapToPrismLanguage = (
  language: string | null | undefined,
): string | null | undefined => {
  // eslint-disable-next-line no-prototype-builtins
  if (language && !!!Prism.languages.hasOwnProperty(language)&&VALID_LANGUAGES.has(language)) {
    return language;
  } else if (language != null && Prism.languages.hasOwnProperty(language)) {
    return language;
  } else {
    return undefined;
  }
};

function hasChildDOMNodeTag(node: Node, tagName: string) {
  for (const child of node.childNodes) {
    if (isHTMLElement(child) && child.tagName === tagName) {
      return true;
    }
    hasChildDOMNodeTag(child, tagName);
  }
  return false;
}

const LANGUAGE_DATA_ATTRIBUTE = 'data-highlight-language';

const CURRENT_VERSION = 1;

function handleButtonClick(this:HTMLButtonElement,e:Event) {
  const code = this.closest('code');
  if (code) {
    const innerText = code.innerText.trim();
    navigator.clipboard.writeText(innerText)
    .then(() => {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "success", message: "Successfully copied code to clipboard!" }}))
    })
    .catch((error) => {
      console.error(error);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: "Successfully copied code to clipboard!" }}))
    });

  }
}

const getCopyButton = () => {
  const b = document.createElement('button');
  b.className="icon code-copy-lexical small transparent";
  b.setAttribute('type','button');
  b.setAttribute('aria-label','Copy Code');
  b.style.cssText="position: absolute; top: 0px; right: 0px;z-index:3;";
  b.insertAdjacentHTML("afterbegin",'<svg viewBox="0 0 448 512" title="copy" focusable="false" inert tabindex="-1"><path d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"></path></svg>');
  b.addEventListener('click',handleButtonClick);
  return b;
}

/** @noInheritDoc */
export class CodeNode extends ElementNode {
  /** @internal */
  __language: string | null | undefined;
  __onlyCodeEditor: boolean; // Tells you whether the lexical editor should only contain one code node
  __version: number = CURRENT_VERSION;
  __editable: boolean = true;

  static getType(): string {
    return 'code';
  }

  static clone(node: CodeNode): CodeNode {
    return new CodeNode({language: node.__language, onlyCodeEditor: node.__onlyCodeEditor}, node.__key);
  }

  constructor(obj:{language?: string | null | undefined,onlyCodeEditor?:boolean}, key?: NodeKey) {
    super(key);
    this.__language = mapToPrismLanguage(obj.language);
    this.__onlyCodeEditor = obj.onlyCodeEditor===undefined ? false : Boolean(obj.onlyCodeEditor);
  }

  // View
  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('code');
    addClassNamesToElement(element, config.theme.code);
    element.setAttribute('spellcheck', 'false');
    const language = this.getLanguage();
    if (language) {
      element.setAttribute(LANGUAGE_DATA_ATTRIBUTE, language);
    }
    if (this.getOnlyCodeEditor()) {
      element.classList.add('only-code-editor');
    }
    element.setAttribute('data-v',String(CURRENT_VERSION));
    if (!!!this.getEditable()) {
      const codeButton = getCopyButton();
      element.append(codeButton);
    }
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(
    prevNode: CodeNode,
    dom: HTMLElement,
    config: EditorConfig,
  ): boolean {
    const language = this.__language;
    const prevLanguage = prevNode.__language;
    const prevOnlyCodeEditor = prevNode.__onlyCodeEditor;
    const onlyCodeEditor = this.__onlyCodeEditor;
    
    if (this.__editable!==prevNode.__editable) return true;
    if (language) {
      if (language !== prevLanguage) {
        dom.setAttribute(LANGUAGE_DATA_ATTRIBUTE, language);
      }
    } else if (prevLanguage) {
      dom.removeAttribute(LANGUAGE_DATA_ATTRIBUTE);
    }
    if(prevOnlyCodeEditor!==onlyCodeEditor){
      if (onlyCodeEditor) dom.classList.add('only-code-editor');
      else if (!!!onlyCodeEditor) dom.classList.remove('only-code-editor');
    }
    if (onlyCodeEditor) {
      const childrenLength = this.getChildren().length;
      if (childrenLength < 20) {
        const nodesToAddLength = 20 - childrenLength;
        const nodesToAdd:LexicalNode[] = [];
        for (let i = 0; i < nodesToAddLength; i++) {
          nodesToAdd.push($createCodeHighlightNode('\n'))
        }
        this.append(...nodesToAdd);
        return true;
      }
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('pre');
    element.setAttribute('spellcheck', 'false');
    element.setAttribute('data-only-code-editor',String(this.getOnlyCodeEditor()));
    const language = this.getLanguage();
    if (language) {
      element.setAttribute(LANGUAGE_DATA_ATTRIBUTE, language);
    }
    element.setAttribute('data-v',String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      // Typically <pre> is used for code blocks, and <code> for inline code styles
      // but if it's a multi line <code> we'll create a block. Pass through to
      // inline format handled by TextNode otherwise.
      code: (node: Node) => {
        const isMultiLine =
          node.textContent != null &&
          (/\r?\n/.test(node.textContent) || hasChildDOMNodeTag(node, 'BR'));

        return isMultiLine
          ? {
              conversion: convertPreElement,
              priority: 1,
            }
          : null;
      },
      div: (node: Node) => ({
        conversion: convertDivElement,
        priority: 1,
      }),
      pre: (node: Node) => ({
        conversion: convertPreElement,
        priority: 0,
      }),
      table: (node: Node) => {
        const table = node;
        // domNode is a <table> since we matched it by nodeName
        if (isGitHubCodeTable(table as HTMLTableElement)) {
          return {
            conversion: convertTableElement,
            priority: 3,
          };
        }
        return null;
      },
      td: (node: Node) => {
        // element is a <td> since we matched it by nodeName
        const td = node as HTMLTableCellElement;
        const table: HTMLTableElement | null = td.closest('table');

        if (isGitHubCodeCell(td)) {
          return {
            conversion: convertTableCellElement,
            priority: 3,
          };
        }
        if (table && isGitHubCodeTable(table)) {
          // Return a no-op if it's a table cell in a code table, but not a code line.
          // Otherwise it'll fall back to the T
          return {
            conversion: convertCodeNoop,
            priority: 3,
          };
        }

        return null;
      },
      tr: (node: Node) => {
        // element is a <tr> since we matched it by nodeName
        const tr = node as HTMLTableCellElement;
        const table: HTMLTableElement | null = tr.closest('table');
        if (table && isGitHubCodeTable(table)) {
          return {
            conversion: convertCodeNoop,
            priority: 3,
          };
        }
        return null;
      },
    };
  }

  static importJSON(serializedNode: SerializedCodeNode): CodeNode {
    const node = $createCodeNode({language: serializedNode.language, onlyCodeEditor: serializedNode.onlyCodeEditor });
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    node.setOnlyCodeEditor(serializedNode.onlyCodeEditor);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }

  exportJSON(): SerializedCodeNode {
    return {
      ...super.exportJSON(),
      language: this.getLanguage(),
      onlyCodeEditor: this.getOnlyCodeEditor(),
      type: 'code',
      version: 1,
      first_element: this.getFirstElement()
    };
  }

  // Mutation
  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true,
  ): null | ParagraphNode | CodeHighlightNode | TabNode {
    const children = this.getChildren();
    const childrenLength = children.length;
    if(!!!this.getOnlyCodeEditor()) {
      if (
        childrenLength >= 2 &&
        children[childrenLength - 1].getTextContent() === '\n' &&
        children[childrenLength - 2].getTextContent() === '\n' &&
        selection.isCollapsed() &&
        selection.anchor.key === this.__key &&
        selection.anchor.offset === childrenLength
      ) {
        children[childrenLength - 1].remove();
        children[childrenLength - 2].remove();
        const newElement = $createParagraphNode();
        this.insertAfter(newElement, restoreSelection);
        return newElement;
      }

      // If the selection is within the codeblock, find all leading tabs and
      // spaces of the current line. Create a new line that has all those
      // tabs and spaces, such that leading indentation is preserved.
      const {anchor, focus} = selection;
      const firstPoint = anchor.isBefore(focus) ? anchor : focus;
      const firstSelectionNode = firstPoint.getNode();
      if ($isTextNode(firstSelectionNode)) {
        let node = getFirstCodeNodeOfLine(firstSelectionNode);
        const insertNodes = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          if ($isTabNode(node)) {
            insertNodes.push($createTabNode());
            node = node.getNextSibling();
          } else if ($isCodeHighlightNode(node)) {
            let spaces = 0;
            const text = node.getTextContent();
            const textSize = node.getTextContentSize();
            for (; spaces < textSize && text[spaces] === ' '; spaces++);
            if (spaces !== 0) {
              insertNodes.push($createCodeHighlightNode(' '.repeat(spaces)));
            }
            if (spaces !== textSize) {
              break;
            }
            node = node.getNextSibling();
          } else {
            break;
          }
        }
        const split = firstSelectionNode.splitText(anchor.offset)[0];
        const x = anchor.offset === 0 ? 0 : 1;
        const index = split.getIndexWithinParent() + x;
        const codeNode = firstSelectionNode.getParentOrThrow();
        const nodesToInsert = [$createLineBreakNode(), ...insertNodes];
        codeNode.splice(index, 0, nodesToInsert);
        const last = insertNodes[insertNodes.length - 1];
        if (last) {
          last.select();
        } else if (anchor.offset === 0) {
          split.selectPrevious();
        } else {
          split.getNextSibling()!.selectNext(0, 0);
        }
      }
      if ($isCodeNode(firstSelectionNode)) {
        const {offset} = selection.anchor;
        firstSelectionNode.splice(offset, 0, [$createLineBreakNode()]);
        firstSelectionNode.select(offset + 1, offset + 1);
      }
    }
    return null;
  }

  canIndent(): false {
    return false;
  }

  collapseAtStart(): boolean {
    if (!!!this.getOnlyCodeEditor()) {
      const paragraph = $createParagraphNode();
      const children = this.getChildren();
      children.forEach((child) => paragraph.append(child));
      this.replace(paragraph);
      return true;
    } else {
      return false;
    }
  }

  setLanguage(language: string): void {
    const writable = this.getWritable();
    writable.__language = mapToPrismLanguage(language);
  }

  getLanguage(): string | null | undefined {
    return this.getLatest().__language;
  }

  setOnlyCodeEditor(b:boolean){
    const self = this.getWritable();
    self.__onlyCodeEditor = b;
    return self;
  }
  getOnlyCodeEditor() {
    const self = this.getLatest();
    return self.__onlyCodeEditor;
  }
  getEditable() {
    return this.getLatest().__editable;
  }
  setEditable(b:boolean) {
    const self = this.getWritable();
    self.__editable = b;
    return self;
  }
}

export function $createCodeNode(obj?:{
  language?: string | null | undefined,
  onlyCodeEditor?: boolean
}): CodeNode {
  return $applyNodeReplacement(new CodeNode({language: obj?.language, onlyCodeEditor: obj?.onlyCodeEditor===undefined ? false : obj.onlyCodeEditor}));
}

export function $isCodeNode(
  node: LexicalNode | null | undefined,
): node is CodeNode {
  return node instanceof CodeNode;
}

function convertPreElement(domNode: Node): DOMConversionOutput {
  let language;
  let onlyCodeEditor;
  if (isHTMLElement(domNode)) {
    language = domNode.getAttribute(LANGUAGE_DATA_ATTRIBUTE);
    onlyCodeEditor = Boolean((domNode.getAttribute('data-only-code-editor') as any)===true);
  }
  const node = $createCodeNode({language, onlyCodeEditor})
  node.setFirstElement((domNode as any)?.classList?.contains('first-rte-element'));
  node.setLastElement((domNode as any)?.classList?.contains('last-rte-element'));
  return {node};
}

function convertDivElement(domNode: Node): DOMConversionOutput {
  // domNode is a <div> since we matched it by nodeName
  const div = domNode as HTMLDivElement;
  const isCode = isCodeElement(div);
  
  if (!isCode && !isCodeChildElement(div)) {
    return {
      node: null,
    };
  }
  return {
    after: (childLexicalNodes) => {
      const domParent = domNode.parentNode;
      if (domParent != null && domNode !== domParent.lastChild) {
        childLexicalNodes.push($createLineBreakNode());
      }
      return childLexicalNodes;
    },
    node: isCode ? $createCodeNode() : null,
  };
}

function convertTableElement(): DOMConversionOutput {
  return {node: $createCodeNode()};
}

function convertCodeNoop(): DOMConversionOutput {
  return {node: null};
}

function convertTableCellElement(domNode: Node): DOMConversionOutput {
  // domNode is a <td> since we matched it by nodeName
  const cell = domNode as HTMLTableCellElement;

  return {
    after: (childLexicalNodes) => {
      if (cell.parentNode && cell.parentNode.nextSibling) {
        // Append newline between code lines
        childLexicalNodes.push($createLineBreakNode());
      }
      return childLexicalNodes;
    },
    node: null,
  };
}

function isCodeElement(div: HTMLElement): boolean {
  return div.style.fontFamily.match('monospace') !== null;
}

function isCodeChildElement(node: HTMLElement): boolean {
  let parent = node.parentElement;
  while (parent !== null) {
    if (isCodeElement(parent)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}

function isGitHubCodeCell(
  cell: HTMLTableCellElement,
): cell is HTMLTableCellElement {
  return cell.classList.contains('js-file-line');
}

function isGitHubCodeTable(table: HTMLTableElement): table is HTMLTableElement {
  return table.classList.contains('js-file-line-container');
}
