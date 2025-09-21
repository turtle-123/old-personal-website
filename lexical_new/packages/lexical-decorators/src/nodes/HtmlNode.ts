import { 
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR, 
  ElementFormatType
} from "lexical";
import type { SerializedDecoratorBlockNode } from "./DecoratorBlockNode";
import { DecoratorBlockNode } from "./DecoratorBlockNode";
import type { 
  EditorConfig, 
  DOMExportOutput, 
  LexicalEditor, 
  Spread, 
  LexicalNode, 
  DOMConversionOutput,
  DOMConversionMap
} from "lexical";
import { createCommand } from "lexical";
import { VALID_HEX_REGEX } from "lexical";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import { closeDialog, getCurrentEditor, IS_REAL_BROWSER, OPEN_DIALOG_FINAL_CED, OPEN_LEXICAL_DIALOG_FINAL_CED, UPDATE_ON_SET_HTML } from "@lexical/shared";

const HTML_NODE_VERSION = 1;

export type SerializedHtmlNode = Spread<
  {
    html: string;
  },
  SerializedDecoratorBlockNode
>;
const VALID_THEMES = new Set([
  "abcdef",
  "abyss",
  "androidstudio",
  "andromeda",
  "atomone",
  "aura",
  "bbedit",
  "basic light",
  "basic dark",
  "bespin",
  "copilot",
  "dracula",
  "darcula",
  "duotone light",
  "duotone dark",
  "eclipse",
  "github light",
  "github dark",
  "gruvbox dark",
  "gruvbox light",
  "material light",
  "material dark",
  "monokai",
  "monokai dimmed",
  "kimbie",
  "noctis-lilac",
  "nord",
  "okaidia",
  "quietlight",
  "red",
  "solarized light",
  "solarized dark",
  "sublime",
  "tokyo-night",
  "tokyo-night-storm",
  "tokyo-night-day",
  "tomorrow-night-blue",
  "white dark",
  "white light",
  "vscode",
  "xcode light",
  "xcode dark"
]);
function getCodeEditorsHTML(html: string) {
  const rand = window.crypto.randomUUID();
  const themeInput = document.getElementById('code-editor-theme-main') as HTMLInputElement|null;
  const theme = themeInput && VALID_THEMES.has(themeInput.value) ? themeInput.value : 'vscode';
  const str = /*html*/`<div data-editor-wrapper id="html_wrapper_${rand}" aria-labelledby="html_tab_button_${rand}" role="tabpanel" tabindex="0">
  <div hidden id="html_ed"  data-theme="${theme}" data-type="auto"  data-codemirror="html" class="mt-2">${html}</div>
</div>`;
return str;
}

function handleKeydownHtmlNode(e:KeyboardEvent) {
  if (e.ctrlKey&&e.key.toLowerCase()==="c") {
    e.stopPropagation();
  } else if (e.ctrlKey&&e.key.toLowerCase()==="x") {
    e.stopPropagation();
  }
}
function handleKeyUpHtmlNode(e:KeyboardEvent) {
  if (e.ctrlKey&&e.key.toLowerCase()==="c") {
    e.stopPropagation();
  } else if (e.ctrlKey&&e.key.toLowerCase()==="x") {
    e.stopPropagation();
  }
}


export class HtmlNode extends DecoratorBlockNode {
  __html: string;
  __version: number = HTML_NODE_VERSION;
  __editable: boolean = true;

  constructor(html?:string, key?:string) {
    super(undefined,key);
    if (html) {
      this.__html = html;   
    } else {
      this.__html = /*html*/`<p class='body1 custom'>
Double click inside the custom HTML to edit the html.
Learn about the basics of HTML using the <a class="secondary link" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML">mdn web docs on HTML</a>. 
</p>`;
    }
  }

  static clone(node: HtmlNode): HtmlNode {
    return new HtmlNode(node.getHtml())
  }

  static getType() {
    return 'html';
  }
  getEditable() {
    return this.__editable;
  }
  setEditable(b:boolean) {
    const self = this.getWritable();
    self.__editable = b;
    return self;
  }
  getHtml() {
    const self = this.getLatest();
    return self.__html;
  }
  setHtml(html:string) {
    const self = this.getWritable();
    self.__html = html;
  }
  getTextContent(): string {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getHtml();
    return String(wrapper.textContent || '');
  }
  setFormat(format: ElementFormatType): void {
    const self = this.getWritable();
    self.__format = 'left';
  }
  static importJSON(serializedNode: SerializedHtmlNode): HtmlNode {
    const node = $createHtmlNode(serializedNode.html);
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  updateDOM(
    _prevNode: HtmlNode,
    _dom: HTMLElement,
    _config: EditorConfig,
  ) {
    return _prevNode.getEditable()!==this.getEditable();
  }
  exportJSON(): SerializedHtmlNode {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: HTML_NODE_VERSION,
      html: this.getHtml(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM(): DOMExportOutput {
    const element = createHtmlElement(this.getHtml());
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (domNode.hasAttribute('data-custom-code')) {
          return {
            conversion: convertHtmlNode,
            priority: 4,
          };
        } else {
          return null;
        }
      },
    };
  }



  decorate(editor: LexicalEditor, config: EditorConfig) {
    const el = createHtmlElement(this.getHtml());
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    if (this.getEditable()) {
      el.addEventListener('dblclick',(e) => {
        if (editor.isEditable()) {
          document.dispatchEvent(new CustomEvent('REGISTER_LEXICAL_CODE_EDITOR',{ detail: el }));
          if (el.getAttribute('data-editing')==="false") {
            editor.getEditorState().read(() => {
              const html = getCodeEditorsHTML(this.getHtml())
              el.innerHTML = '';
              el.innerHTML = html;
              el.dispatchEvent(new CustomEvent('INSERT_LEXICAL_CODE_EDITORS'));
              el.setAttribute('data-editing','true');
              el.addEventListener('keydown',handleKeydownHtmlNode);
              el.addEventListener('keydown',handleKeyUpHtmlNode);
            })
          }
        }
      });
      el.addEventListener('focusout',(e:FocusEvent) => {
        if (el.getAttribute('data-editing')==='true') {
          el.dispatchEvent(new CustomEvent('GET_LEXICAL_EDITORS_CODE')); // get the code for the HTML and CSS code editors that are descendants of this node
        }
        el.removeEventListener('keydown',handleKeydownHtmlNode);
        el.removeEventListener('keydown',handleKeyUpHtmlNode);
      });
      // @ts-ignore
      el.addEventListener('GOT_LEXICAL_EDITORS_CODE',(e:CustomEvent) => {
        if (e&&e.detail&&typeof e.detail.html==='string')
        editor.update(() => {
          el.setAttribute('data-editing','false');
          this.setHtml(e.detail.html);
          el.dispatchEvent(new CustomEvent('REMOVE_LEXICAL_CODE_EDITORS'));
          el.innerHTML = '';
          const { htmlDiv } = createInnerHTML(e.detail.html);
          el.append(htmlDiv);
        })
      });
    }

    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0) {
        element.append(el);
      }
    }
    return el;
  }
}

function createInnerHTML(html:string) {
  const div2 = document.createElement('div');
  div2.setAttribute('data-html','');
  div2.insertAdjacentHTML("beforeend",html);
  return { htmlDiv: div2 };
}

function createHtmlElement(html: string) {
  const div = document.createElement('div');
  div.setAttribute('data-custom-code','');
  div.setAttribute('data-editing','false');
  const { htmlDiv } = createInnerHTML(html);
  div.append(htmlDiv);
  return div;
}

function convertHtmlNode(domNode: HTMLElement): null|DOMConversionOutput {
  const htmlNodeArr = Array.from(domNode.children).filter((node) => node.nodeName==='DIV' && node.hasAttribute('data-html')) as HTMLDivElement[];
  var html = '';
  if (htmlNodeArr.length) {
    const el = htmlNodeArr[0];
    html = el.innerHTML;
  } else {
    html = '';
  }
  const node = $createHtmlNode(html);
  const first_element = domNode.classList.contains('first-rte-element');
  node.setFirstElement(first_element);
  const last_element = domNode.classList.contains('last-rte-element');
  node.setLastElement(last_element);
  return { node };
}

export function $createHtmlNode(html?: string) {
  return new HtmlNode(html);
}

export function $isHtmlNode(
  node: HtmlNode | LexicalNode | null | undefined,
): node is HtmlNode {
  return node instanceof HtmlNode;
}

export const INSERT_HTML_COMMAND = createCommand<string>('INSERT_HTML_COMMAND')

function onHtmlClick() {
  const editor = getCurrentEditor();
  if (editor) {
    editor.dispatchCommand(INSERT_HTML_COMMAND,`<h1 style="padding: 6px; border-radius: 6px; background: linear-gradient(217deg, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0) 70.71%), linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%), linear-gradient(336deg, rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0) 70.71%); color: black; border: 3px dotted blue;" class="bold">Double click to edit the HTML node.</h1>
<p>You can learn more about what is allowed in custom HTML nodes <a href="https://frankmbrown.net/blog/22/Rich%20Text%20Editor%20Implementation?version=1" target="_blank">Here</a>.</p>`);
  }
}

export function registerHTMLNodeEditable(editor:LexicalEditor) {
  if (editor.hasNode(HtmlNode)) {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if (wrapper) {
      const htmlButton = document.querySelector<HTMLButtonElement>('button[data-custom-html-btn]');
      if (htmlButton) {
        htmlButton.addEventListener('click',onHtmlClick);
      }
    }
    return mergeRegister(editor.registerCommand(
      INSERT_HTML_COMMAND,
      (payload:string) => {
        if (typeof payload==='string') {
          const node = $createHtmlNode(payload);
          $insertNodeToNearestRoot(node);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    ))
  } else {
    console.error('HtmlNode not registered on editor.');
    return () => {};
  }
}

export function registerHTMLNodeNotEditable(editor:LexicalEditor) {
  return mergeRegister(
    editor.registerEditableListener((editable) => {
      editor.update(() => {
        const htmlNodes = $nodesOfType(HtmlNode);
        if (editable) {
          htmlNodes.forEach((node) => {
            node.setEditable(false);
          })
        } else {
          htmlNodes.forEach((node) => {
            node.setEditable(true);
          })
        }
      })
    }),
    editor.registerCommand(
      UPDATE_ON_SET_HTML,
      () => {
        const htmlNodes = $nodesOfType(HtmlNode);
        htmlNodes.forEach((node) => {
          if (node.getEditable()) node.setEditable(false);
        })
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    
  )
}