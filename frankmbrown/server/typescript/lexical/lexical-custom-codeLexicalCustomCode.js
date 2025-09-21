/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DecoratorNode, $applyNodeReplacement, createCommand, SELECTION_CHANGE_COMMAND, $getSelection, $isNodeSelection, $getNodeByKey, COMMAND_PRIORITY_HIGH, KEY_ESCAPE_COMMAND, $insertNodes, $isRootOrShadowRoot, $createParagraphNode, COMMAND_PRIORITY_EDITOR } from './lexicalLexical.js';
import { mergeRegister, $wrapNodeInElement } from './lexical-utilsLexicalUtils.js';

const CODING_LANGUAGE_ARRAY = ["1c", "abnf", "accesslog", "actionscript", "ada", "angelscript", "apache", "applescript", "arcade", "arduino", "armasm", "xml", "asciidoc", "aspectj", "autohotkey", "autoit", "avrasm", "awk", "axapta", "bash", "basic", "bnf", "brainfuck", "c", "cal", "capnproto", "ceylon", "clean", "clojure", "clojure-repl", "cmake", "coffeescript", "coq", "cos", "cpp", "crmsh", "crystal", "csharp", "csp", "css", "d", "markdown", "dart", "delphi", "diff", "django", "dns", "dockerfile", "dos", "dsconfig", "dts", "dust", "ebnf", "elixir", "elm", "ruby", "erb", "erlang-repl", "erlang", "excel", "fix", "flix", "fortran", "fsharp", "gams", "gauss", "gcode", "gherkin", "glsl", "gml", "go", "golo", "gradle", "graphql", "groovy", "haml", "handlebars", "haskell", "haxe", "hsp", "http", "hy", "inform7", "ini", "irpf90", "isbl", "java", "javascript", "jboss-cli", "json", "julia", "julia-repl", "kotlin", "lasso", "latex", "ldif", "leaf", "less", "lisp", "livecodeserver", "livescript", "llvm", "lsl", "lua", "makefile", "mathematica", "matlab", "maxima", "mel", "mercury", "mipsasm", "mizar", "perl", "mojolicious", "monkey", "moonscript", "n1ql", "nestedtext", "nginx", "nim", "nix", "node-repl", "nsis", "objectivec", "ocaml", "openscad", "oxygene", "parser3", "pf", "pgsql", "php", "php-template", "plaintext", "pony", "powershell", "processing", "profile", "prolog", "properties", "protobuf", "puppet", "purebasic", "python", "python-repl", "q", "qml", "r", "reasonml", "rib", "roboconf", "routeros", "rsl", "ruleslanguage", "rust", "sas", "scala", "scheme", "scilab", "scss", "shell", "smali", "smalltalk", "sml", "sqf", "sql", "stan", "stata", "step21", "stylus", "subunit", "swift", "taggerscript", "yaml", "tap", "tcl", "thrift", "tp", "twig", "typescript", "vala", "vbnet", "vbscript", "vbscript-html", "verilog", "vhdl", "vim", "wasm", "wren", "x86asm", "xl", "xquery", "zephir"];
const createSelectButton = (val, selected) => {
  const button = document.createElement('button');
  button.className = "select-option body2";
  const attrs = {
    type: "button",
    tabindex: "-1",
    role: "option",
    'aria-selected': String(selected),
    'data-val': val
  };
  Object.keys(attrs).forEach(key => button.setAttribute(key, attrs[key]));
  button.innerText = val;
  return button;
};
const createSvg = path => {
  const attr = {
    'focusable': 'false',
    'aria-hidden': 'true',
    'viewBox': '0 0 24 24',
    'tabindex': '-1'
  };
  const svg = document.createElement('svg');
  Object.keys(attr).forEach(key => svg.setAttribute(key, attr[key]));
  const pathEl = document.createElement('path');
  pathEl.setAttribute('d', path);
  svg.append(pathEl);
  return svg;
};
class CustomCodeNode extends DecoratorNode {
  __editable = false;
  static getType() {
    return 'custom-code';
  }
  static clone(node) {
    return new CustomCodeNode({
      code: node.__code,
      autodetect: node.__autodetect,
      language: node.__language
    }, node.__key);
  }
  constructor({
    code,
    autodetect,
    language
  }, key) {
    super(key);
    this.__code = code;
    this.__autodetect = autodetect;
    if (language) {
      this.__language = language;
    }
  }
  static importJSON(serializedNode) {
    const node = $createCustomCodeNode(serializedNode.code, serializedNode.autodetect, serializedNode.language);
    return node;
  }
  exportJSON() {
    return {
      code: this.getCode(),
      autodetect: this.getAutodetect(),
      language: this.getLanguage(),
      type: 'custom-code',
      version: 1
    };
  }
  createDOM(_config) {
    const element = document.createElement('div');
    // EquationNodes should implement `user-action:none` in their CSS to avoid issues with deletion on Android.
    element.className = 'lexical-code';
    return element;
  }
  exportDOM() {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = this.__code;
    // Encode the equation as base64 to avoid issues with special characters
    pre.setAttribute('data-frank-code', '');
    pre.setAttribute('data-frank-autodetect', String(this.__autodetect));
    pre.setAttribute('data-frank-code-language', String(this.__language));
    pre.append(code);
    return {
      element: pre
    };
  }
  static importDOM() {
    return {
      pre: domNode => {
        if (!domNode.hasAttribute('data-frank-code')) {
          return null;
        }
        return {
          conversion: convertCustomCodeElement,
          priority: 2
        };
      }
    };
  }
  updateDOM(prevNode) {
    return Boolean(this.__editable !== prevNode.__editable);
  }
  getTextContent() {
    return this.__code;
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
  getCode() {
    const self = this.getLatest();
    return self.__code;
  }
  setCode(code) {
    const self = this.getWritable();
    self.__code = code;
    return self;
  }
  isInline() {
    return false;
  }
  getLanguage() {
    const self = this.getLatest();
    return self.__language;
  }
  setLanguage(language) {
    const self = this.getWritable();
    self.__language = language;
    return self;
  }
  getAutodetect() {
    const self = this.getLatest();
    return self.__autodetect;
  }
  setAutodetect(auto) {
    const self = this.getWritable();
    self.__autodetect = auto;
    return self;
  }
  decorate(editor, config) {
    const nodeKey = this.__key;
    const element = editor.getElementByKey(nodeKey);
    if (element) {
      clearInnerHTML(element);
      if (this.getEditable()) {
        const div = document.createElement('div');
        div.className = "flex-row align-center justify-end gap-2 w-100";
        const changeEditable = document.createElement('button');
        changeEditable.className = "toggle-button small";
        changeEditable.setAttribute('type', 'button');
        const svg = createSvg('m12.126 8.125 1.937-1.937 3.747 3.747-1.937 1.938zM20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L20.71 7a1 1 0 0 0 0-1.37zM2 5l6.63 6.63L3 17.25V21h3.75l5.63-5.62L18 21l2-2L4 3 2 5z');
        changeEditable.append(svg);
        const select = getButtonSelect(editor, this.__language);
        div.append(changeEditable);
        div.append(select);
        const pre = document.createElement('pre');
        pre.className = "lexical-code-editor";
        const code = document.createElement('code');
        code.setAttribute('contenteditable', 'true');
        code.textContent = this.__code;
        function onInput(e) {
          const parent = this.parentElement;
          const textContent = parent.textContent;
          const node = parent.parentElement;
          const nodeKey = node.getAttribute('data-node-key');
          if (textContent && nodeKey) {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if ($isCustomCodeNode(node)) {
                node.setCode(textContent);
              }
            });
          }
        }
        code.addEventListener('input', onInput);
        pre.append(code);
        element.append(div);
        element.append(pre);
        const html = document.querySelector('html');
        if (html) html.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED"));
        return pre;
      } else {
        const div = document.createElement('div');
        div.className = "flex-row align-center justify-end gap-2 w-100";
        if (editor.isEditable()) {
          const changeEditable = document.createElement('button');
          changeEditable.className = "toggle-button small";
          changeEditable.setAttribute('type', 'button');
          const svg = createSvg('M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
          changeEditable.append(svg);
          div.append(changeEditable);
          function handleChangeEditableClick(e) {
            const div = this.parentElement;
            if (div) {
              const pre = div.nextElementSibling;
              if (pre && pre.nodeName === "pre") {
                const textContent = pre.textContent;
                if (textContent) {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if ($isCustomCodeNode(node)) {
                      node.setCode(textContent);
                      node.setEditable(false);
                    }
                  });
                }
              }
            }
          }
          changeEditable.addEventListener('click', handleChangeEditableClick);
        } else {
          const button = document.createElement('button');
          button.innerText = "Copy Button";
        }
        const span = document.createElement('span');
        span.className = "body2 p-md bg-card";
        if (this.__language) {
          span.classList.add('t-primary', 'bold');
          span.innerText = this.__language;
        } else {
          span.classList.add('t-secondary', 'bold');
          span.innerText = 'autodetect';
        }
        div.append(span);
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        if (this.__language) {
          code.className = "language-".concat(this.__language);
        }
        pre.append(code);
        // hljs.highlightElement(pre);
        element.append(div);
        element.append(pre);
        return pre;
      }
    }
    return document.createElement('div');
  }
}
function convertCustomCodeElement(domNode) {
  let code = domNode.getAttribute('data-frank-code');
  const autodetect = domNode.getAttribute('data-frank-autodetect') === "true";
  const languagePre = domNode.getAttribute('data-frank-code-language');
  const language = new Set(CODING_LANGUAGE_ARRAY).has(String(languagePre)) ? languagePre : autodetect ? undefined : 'python';
  // Decode the equation from base64
  code = window.atob(code || '');
  if (code) {
    const node = $createCustomCodeNode(code, autodetect, language);
    return {
      node
    };
  }
  return null;
}
function $createCustomCodeNode(code = '', autodetect = true, language) {
  const customCodeNode = new CustomCodeNode({
    code,
    autodetect,
    language
  });
  return $applyNodeReplacement(customCodeNode);
}
function $isCustomCodeNode(node) {
  return node instanceof CustomCodeNode;
}
const INSERT_CODE_COMMAND = createCommand('INSERT_CODE_COMMAND');

/**
 * 
 * @param editor 
 * @returns 
 */
function registerCustomCodeNode(editor) {
  return mergeRegister(editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    const selection = $getSelection();
    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes();
      if ($isCustomCodeNode(nodes[0])) {
        const key = nodes[0].getKey();
        const decorators = editor.getDecorators();
        Object.keys(decorators).forEach(key2 => {
          if (key2 !== key && $isCustomCodeNode($getNodeByKey(key2))) $getNodeByKey(key2).setEditable(false);
        });
        nodes[0].setEditable(true);
        return true;
      }
    } else {
      const decorators = editor.getDecorators();
      for (let key of Object.keys(decorators)) {
        const node = $getNodeByKey(key);
        if ($isCustomCodeNode(node) && node.getEditable()) node.setEditable(false);
      }
    }
    return false;
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(KEY_ESCAPE_COMMAND, payload => {
    const decorators = editor.getDecorators();
    for (let key of Object.keys(decorators)) {
      const node = $getNodeByKey(key);
      if ($isCustomCodeNode(node) && node.getEditable()) node.setEditable(false);
    }
    return false;
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(INSERT_CODE_COMMAND, () => {
    const codeNode = $createCustomCodeNode('', true, undefined);
    $insertNodes([codeNode]);
    if ($isRootOrShadowRoot(codeNode.getParentOrThrow())) {
      $wrapNodeInElement(codeNode, $createParagraphNode).selectEnd();
    }
    codeNode.setEditable(true);
    return true;
  }, COMMAND_PRIORITY_EDITOR));
}
function clearInnerHTML(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}
function getButtonSelect(editor, language) {
  const div = document.createElement('div');
  div.className = "select";
  const DROPDOWN_ID = 'lex_code_dropdown_'.concat(Math.random().toString().slice(2));
  const button = document.createElement('button');
  button.className = "select small";
  button.setAttribute('type', 'button');
  button.setAttribute('role', 'combobox');
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-controls', DROPDOWN_ID);
  button.setAttribute('data-popover', '');
  button.setAttribute('data-pelem', "#".concat(DROPDOWN_ID));
  button.setAttribute('data-click', '');
  button.setAttribute('aria-expanded', "false");
  const span = document.createElement('span');
  span.innerText = language ? language : 'autodetect';
  const svg = document.createElement('svg');
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("tabindex", "-1");
  const path = document.createElement('path');
  path.setAttribute('d', 'm7 10 5 5 5-5z');
  svg.append(path);
  button.append(span);
  button.append(svg);
  div.append(button);
  const dropdown = document.createElement('div');
  dropdown.setAttribute("tabindex", "0");
  dropdown.setAttribute("id", DROPDOWN_ID);
  dropdown.setAttribute("role", "listbox");
  dropdown.setAttribute("class", "select-menu o-xs");
  dropdown.setAttribute("data-placement", "bottom");
  dropdown.setAttribute("data-click-capture", 'true');
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('hidden', '');
  input.value = language ? language : 'autodetect';
  function onCodingLanguageChange(e) {
    const codeNode = this.closest('[data-frank-decorator]');
    if (codeNode) {
      const nodeKey = codeNode.getAttribute('data-node-key');
      if (nodeKey) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isCustomCodeNode(node)) {
            if (this.value === "autodetect") {
              node.setLanguage(undefined);
              node.setAutodetect(true);
            } else {
              if (new Set(CODING_LANGUAGE_ARRAY).has(this.value)) {
                node.setLanguage(this.value);
              } else {
                node.setLanguage('python');
              }
              node.setAutodetect(false);
            }
          }
        });
      }
    }
  }
  input.addEventListener('change', onCodingLanguageChange);
  dropdown.append(input);
  dropdown.append(createSelectButton("autodetect", !!!language));
  CODING_LANGUAGE_ARRAY.forEach(lang => {
    dropdown.append(createSelectButton(lang, Boolean(language === lang)));
  });
  div.append(dropdown);
  return div;
}

export { $createCustomCodeNode, $isCustomCodeNode, CustomCodeNode, INSERT_CODE_COMMAND, createSelectButton, createSvg, registerCustomCodeNode };
