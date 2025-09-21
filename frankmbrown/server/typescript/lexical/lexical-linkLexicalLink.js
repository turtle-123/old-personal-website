/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { addClassNamesToElement, isHTMLAnchorElement, mergeRegister, isHTMLElement } from './lexical-utilsLexicalUtils.js';
import { createCommand, ElementNode, $applyNodeReplacement, $isRangeSelection, $isElementNode, COMMAND_PRIORITY_LOW, PASTE_COMMAND, $getSelection, SELECTION_CHANGE_COMMAND, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_EDITOR, $isTextNode, $getNodeByKey, $createRangeSelection } from './lexicalLexical.js';
import { isTouchDevice, REGISTER_TOOLBAR_LISTENERS, getCurrentEditor } from './lexical-sharedLexicalShared.js';
import { $isHeadingNode, $createHeadingNode } from './lexical-rich-textLexicalRichText.js';
import { $setBlocksType } from './lexical-selectionLexicalSelection.js';

/** @module @lexical/link */
const CURRENT_LINK_NODE_KEY = {};
const SUPPORTED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'sms:', 'tel:']);
const LINK_NODE_VERSION = 1;
const SECTION_LINK_NODE_VERSION = 1;
const ABBR_NODE_VERSION = 1;

/** @noInheritDoc */
class LinkNode extends ElementNode {
  /** @internal */

  /** @internal */

  /** @internal */

  /** @internal */

  __version = LINK_NODE_VERSION;
  static getType() {
    return 'link';
  }
  static clone(node) {
    return new LinkNode(node.__url, {
      rel: node.__rel,
      target: node.__target,
      title: node.__title
    }, node.__key);
  }
  constructor(url, attributes = {}, key) {
    super(key);
    const {
      target = null,
      rel = null,
      title = null
    } = attributes;
    this.__url = url;
    this.__target = target;
    this.__rel = rel;
    this.__title = title;
  }
  createDOM(config) {
    const element = document.createElement('a');
    element.href = this.sanitizeUrl(this.__url);
    if (this.__target !== null) {
      element.target = this.__target;
    }
    if (this.__rel !== null) {
      element.rel = this.__rel;
    }
    if (this.__title !== null) {
      element.title = this.__title;
    }
    element.setAttribute('data-v', String(LINK_NODE_VERSION));
    addClassNamesToElement(element, config.theme.link);
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(prevNode, anchor, config) {
    const url = this.__url;
    const target = this.__target;
    const rel = this.__rel;
    const title = this.__title;
    if (url !== prevNode.__url) {
      anchor.href = url;
    }
    if (target !== prevNode.__target) {
      if (target) {
        anchor.target = target;
      } else {
        anchor.removeAttribute('target');
      }
    }
    if (rel !== prevNode.__rel) {
      if (rel) {
        anchor.rel = rel;
      } else {
        anchor.removeAttribute('rel');
      }
    }
    if (title !== prevNode.__title) {
      if (title) {
        anchor.title = title;
      } else {
        anchor.removeAttribute('title');
      }
    }
    return false;
  }
  static importDOM() {
    return {
      a: node => ({
        conversion: convertAnchorElement,
        priority: 1
      })
    };
  }
  static importJSON(serializedNode) {
    const node = $createLinkNode(serializedNode.url, {
      rel: serializedNode.rel,
      target: serializedNode.target,
      title: serializedNode.title
    });
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  sanitizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      // eslint-disable-next-line no-script-url
      if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
        return 'about:blank';
      }
    } catch (_unused) {
      return url;
    }
    return url;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      rel: this.getRel(),
      target: this.getTarget(),
      title: this.getTitle(),
      type: 'link',
      url: this.getURL(),
      version: LINK_NODE_VERSION
    };
  }
  getURL() {
    return this.getLatest().__url;
  }
  setURL(url) {
    const writable = this.getWritable();
    writable.__url = url;
  }
  getTarget() {
    return this.getLatest().__target;
  }
  setTarget(target) {
    const writable = this.getWritable();
    writable.__target = target;
  }
  getRel() {
    return this.getLatest().__rel;
  }
  setRel(rel) {
    const writable = this.getWritable();
    writable.__rel = rel;
  }
  getTitle() {
    return this.getLatest().__title;
  }
  setTitle(title) {
    const writable = this.getWritable();
    writable.__title = title;
  }
  insertNewAfter(_, restoreSelection = true) {
    const linkNode = $createLinkNode(this.__url, {
      rel: this.__rel,
      target: this.__target,
      title: this.__title
    });
    this.insertAfter(linkNode, restoreSelection);
    return linkNode;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
  canBeEmpty() {
    return false;
  }
  isInline() {
    return true;
  }
  extractWithChild(child, selection, destination) {
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    return this.isParentOf(anchorNode) && this.isParentOf(focusNode) && selection.getTextContent().length > 0;
  }
}
function convertAnchorElement(domNode) {
  let node = null;
  if (isHTMLAnchorElement(domNode)) {
    const content = domNode.textContent;
    if (content !== null && content !== '' || domNode.children.length > 0) {
      node = $createLinkNode(domNode.getAttribute('href') || '', {
        rel: domNode.getAttribute('rel'),
        target: domNode.getAttribute('target'),
        title: domNode.getAttribute('title')
      });
    }
  }
  return {
    node
  };
}

/**
 * Takes a URL and creates a LinkNode.
 * @param url - The URL the LinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes { target, rel, title }
 * @returns The LinkNode.
 */
function $createLinkNode(url, attributes) {
  return $applyNodeReplacement(new LinkNode(url, attributes));
}

/**
 * Determines if node is a LinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a LinkNode, false otherwise.
 */
function $isLinkNode(node) {
  return node instanceof LinkNode;
}
const TOGGLE_LINK_COMMAND = createCommand('TOGGLE_LINK_COMMAND');

/**
 * Generates or updates a LinkNode. It can also delete a LinkNode if the URL is null,
 * but saves any children and brings them up to the parent node.
 * @param url - The URL the link directs to.
 * @param attributes - Optional HTML a tag attributes. { target, rel, title }
 */
function toggleLink(selection, url, attributes = {}) {
  const {
    target,
    title
  } = attributes;
  const rel = attributes.rel === undefined ? 'noreferrer' : attributes.rel;
  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();
  if (url === null) {
    // Remove LinkNodes
    nodes.forEach(node => {
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }
        parent.remove();
      }
    });
  } else {
    // Add or merge LinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a LinkNode or if its
      // parent is a LinkNode, we update the URL, target and rel.
      const linkNode = $getAncestor(firstNode, $isLinkNode);
      if (linkNode !== null) {
        linkNode.setURL(url);
        if (target !== undefined) {
          linkNode.setTarget(target);
        }
        if (rel !== null) {
          linkNode.setRel(rel);
        }
        if (title !== undefined) {
          linkNode.setTitle(title);
        }
        return;
      }
    }
    let prevParent = null;
    let linkNode = null;
    nodes.forEach(node => {
      const parent = node.getParent();
      if (parent === linkNode || parent === null || $isElementNode(node) && !node.isInline()) {
        return;
      }
      if ($isLinkNode(parent)) {
        linkNode = parent;
        parent.setURL(url);
        if (target !== undefined) {
          parent.setTarget(target);
        }
        if (rel !== null) {
          linkNode.setRel(rel);
        }
        if (title !== undefined) {
          linkNode.setTitle(title);
        }
        return;
      }
      if (!parent.is(prevParent)) {
        prevParent = parent;
        linkNode = $createLinkNode(url, {
          rel,
          target,
          title
        });
        if ($isLinkNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(linkNode);
          } else {
            parent.insertAfter(linkNode);
          }
        } else {
          node.insertBefore(linkNode);
        }
      }
      if ($isLinkNode(node)) {
        if (node.is(linkNode)) {
          return;
        }
        if (linkNode !== null) {
          const children = node.getChildren();
          for (let i = 0; i < children.length; i++) {
            linkNode.append(children[i]);
          }
        }
        node.remove();
        return;
      }
      if (linkNode !== null) {
        linkNode.append(node);
      }
    });
  }
}
/**
 * Traverses up the node tree by getting the parent of the node and returns the first node 
 * that matches the predicate
 * @param node 
 * @param predicate 
 * @returns 
 */
function $getAncestor(node, predicate) {
  let parent = node;
  while (parent !== null && parent.getParent() !== null && !predicate(parent)) {
    parent = parent.getParentOrThrow();
  }
  return predicate(parent) ? parent : null;
}

/* ------------------------------------- Link Stuff --------------------------------- */
/**
 * Need to store range selection because things get weird when the link input form is open
 */
var SELECTION = {};
function preventFormSubmitEnter(e) {
  if (e.key.toUpperCase() === "ENTER") {
    e.preventDefault();
    e.stopPropagation();
    const floatingMenu = this.closest('div.floating-menu');
    if (floatingMenu) {
      const button = floatingMenu.querySelector('button[data-lexical-link-submit], button[data-lexical-abbr-submit]');
      if (button) button.dispatchEvent(new Event('click'));
    }
  }
}
function getHandleLinkSubmit(editor) {
  const handleLinkSubmit = function (e) {
    const wrapper = this.closest('div.floating-menu');
    if (wrapper) {
      const textInput = wrapper.querySelector('input[data-lexical-link-input]');
      if (textInput && $isRangeSelection(SELECTION[editor._config.namespace])) {
        const value = textInput.value;
        if (!!!CURRENT_LINK_NODE_KEY[editor._config.namespace]) {
          if (value) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
              selection: SELECTION[editor._config.namespace],
              url: value,
              rel: 'ugc'
            });
            const errorText = wrapper.querySelector('p[data-error-text]');
            if (errorText) errorText.setAttribute('hidden', '');
            textInput.value = '';
            document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
              detail: {
                str: "#".concat(wrapper.id)
              }
            }));
            wrapper.style.display = 'none';
          } else {
            const errorText = wrapper.querySelector('p[data-error-text]');
            if (errorText) errorText.removeAttribute('hidden');
          }
        } else {
          if (value) {
            editor.update(() => {
              const node = $getNodeByKey(String(CURRENT_LINK_NODE_KEY[editor._config.namespace]));
              if ($isLinkNode(node)) {
                node.setURL(value);
                const errorText = wrapper.querySelector('p[data-error-text]');
                if (errorText) errorText.setAttribute('hidden', '');
                textInput.value = '';
                document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
                  detail: {
                    str: "#".concat(wrapper.id)
                  }
                }));
                wrapper.style.display = 'none';
              }
            });
          } else {
            const errorText = wrapper.querySelector('p[data-error-text]');
            if (errorText) errorText.removeAttribute('hidden');
          }
        }
      }
    }
  };
  return handleLinkSubmit;
}
function handleLinkSubmitFloating(e) {
  const editor = getCurrentEditor();
  const toolbarLinkMenu = document.getElementById('lexical-insert-link-main-menu');
  if (editor && toolbarLinkMenu) {
    const id = editor._config.namespace;
    const selection = SELECTION[id];
    const textInput = toolbarLinkMenu.querySelector('input[data-lexical-link-input]');
    if ($isRangeSelection(selection) && textInput) {
      const value = textInput.value;
      if (value) {
        if (!!!CURRENT_LINK_NODE_KEY[editor._config.namespace]) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
            selection: SELECTION[editor._config.namespace],
            url: value,
            rel: 'ugc'
          });
          const errorText = toolbarLinkMenu.querySelector('p[data-error-text]');
          if (errorText) errorText.setAttribute('hidden', '');
          textInput.value = '';
          document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
              str: "#lexical-insert-link-main-menu"
            }
          }));
          toolbarLinkMenu.style.display = 'none';
        } else {
          editor.update(() => {
            const node = $getNodeByKey(String(CURRENT_LINK_NODE_KEY[editor._config.namespace]));
            if ($isLinkNode(node)) {
              node.setURL(value);
              textInput.value = '';
              document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
                detail: {
                  str: "#lexical-insert-link-main-menu"
                }
              }));
              toolbarLinkMenu.style.display = 'none';
            }
          });
        }
      } else {
        const errorText = toolbarLinkMenu.querySelector('p[data-error-text]');
        if (errorText) errorText.removeAttribute('hidden');
      }
    }
  }
}
function getHandleRemoveLink(editor) {
  /**
   * Function called when the remove link button is clicked. 
   * This button is only shown when the selection currently contains a link.
   * @param this 
   * @param e 
   */
  const handleRemoveLink = function (e) {
    const wrapper = this.closest('div.floating-menu');
    if (wrapper) {
      const textInput = wrapper.querySelector('input[type="url"]');
      if (textInput && $isRangeSelection(SELECTION[editor._config.namespace])) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
          selection: SELECTION[editor._config.namespace],
          url: null,
          rel: 'ugc'
        });
        const errorText = wrapper.querySelector('p[data-error-text]');
        if (errorText) errorText.setAttribute('hidden', '');
        textInput.value = '';
      }
    }
  };
  return handleRemoveLink;
}
function handleRemoveLinkFloating(e) {
  const wrapper = document.getElementById('lexical-insert-link-main-menu');
  const editor = getCurrentEditor();
  if (wrapper && editor) {
    const textInput = wrapper.querySelector('input[type="url"]');
    if (textInput && $isRangeSelection(SELECTION[editor._config.namespace])) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
        selection: SELECTION[editor._config.namespace],
        url: null,
        rel: 'ugc'
      });
      const errorText = wrapper.querySelector('p[data-error-text]');
      if (errorText) errorText.setAttribute('hidden', '');
      textInput.value = '';
    }
  }
}

/**
 * Function to validate urls for links in the editor
 * @param str 
 */
function validateURLDefault(str) {
  try {
    const url = new URL(str);
    const VALID_PROTOCOL = url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:';
    return VALID_PROTOCOL;
  } catch (error) {
    return false;
  }
}
function handleFloatLinkClick() {
  const editor = getCurrentEditor();
  const toolbarLinkMenu = document.getElementById('lexical-insert-link-main-menu');
  if (toolbarLinkMenu && editor) {
    const removeLinkButton = toolbarLinkMenu.querySelector('button[data-lexical-remove-link]');
    const id = editor._config.namespace;
    const selection = SELECTION[id];
    var SHOW_REMOVE_BUTTON = false;
    editor.getEditorState().read(() => {
      if ($isRangeSelection(selection) && removeLinkButton) {
        const INCLUDES_LINK_NODE = Boolean(selection.getNodes().filter(s => $isLinkNode(s) || $isLinkNode(s.getParent())).length >= 1);
        if (INCLUDES_LINK_NODE) {
          SHOW_REMOVE_BUTTON = true;
          removeLinkButton.removeAttribute('hidden');
        }
      }
    });
    if (!!!SHOW_REMOVE_BUTTON && removeLinkButton) {
      removeLinkButton.setAttribute('hidden', '');
    }
  }
}

/**
 * If there is a link in the node selection, get the node key of the link, put the url in the text box, 
 * @param this 
 * @param e 
 */
function handleEditLinkURL(e) {
  const currentEditor = getCurrentEditor();
  if (currentEditor) {
    currentEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        var TEMP_LINK_NODE_KEY = undefined;
        var TEMP_URL = '';
        for (let node of nodes) {
          if ($isTextNode(node)) {
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
              const key = parent.getKey();
              if (TEMP_LINK_NODE_KEY && key !== TEMP_LINK_NODE_KEY) {
                TEMP_LINK_NODE_KEY = undefined;
                TEMP_URL = '';
                break;
              } else if (!!!TEMP_LINK_NODE_KEY) {
                TEMP_LINK_NODE_KEY = key;
                TEMP_URL = parent.getURL();
              }
            }
          } else if ($isLinkNode(node)) {
            const key = node.getKey();
            if (TEMP_LINK_NODE_KEY && key !== TEMP_LINK_NODE_KEY) {
              TEMP_LINK_NODE_KEY = undefined;
              TEMP_URL = '';
              break;
            } else if (!!!TEMP_LINK_NODE_KEY) {
              TEMP_LINK_NODE_KEY = key;
              TEMP_URL = node.getURL();
            }
          }
        }
        const wrapper = document.getElementById(currentEditor._config.namespace);
        if (wrapper) {
          const linkTextInput = wrapper.querySelector('input[data-lexical-link-input]');
          if (linkTextInput) {
            if (TEMP_URL && TEMP_LINK_NODE_KEY) {
              CURRENT_LINK_NODE_KEY[currentEditor._config.namespace] = TEMP_LINK_NODE_KEY;
              linkTextInput.value = TEMP_URL;
            } else {
              linkTextInput.value = '';
              CURRENT_LINK_NODE_KEY[currentEditor._config.namespace] = undefined;
            }
          }
        }
      }
    });
  }
}
function handleEditLinkURLFloating(e) {
  const currentEditor = getCurrentEditor();
  if (currentEditor) {
    currentEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        var TEMP_LINK_NODE_KEY = undefined;
        var TEMP_URL = '';
        for (let node of nodes) {
          if ($isTextNode(node)) {
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
              const key = parent.getKey();
              if (TEMP_LINK_NODE_KEY && key !== TEMP_LINK_NODE_KEY) {
                TEMP_LINK_NODE_KEY = undefined;
                TEMP_URL = '';
                break;
              } else if (!!!TEMP_LINK_NODE_KEY) {
                TEMP_LINK_NODE_KEY = key;
                TEMP_URL = parent.getURL();
              }
            }
          } else if ($isLinkNode(node)) {
            const key = node.getKey();
            if (TEMP_LINK_NODE_KEY && key !== TEMP_LINK_NODE_KEY) {
              TEMP_LINK_NODE_KEY = undefined;
              TEMP_URL = '';
              break;
            } else if (!!!TEMP_LINK_NODE_KEY) {
              TEMP_LINK_NODE_KEY = key;
              TEMP_URL = node.getURL();
            }
          }
        }
        const wrapper = document.getElementById('lexical-insert-link-main-menu');
        if (wrapper) {
          const linkTextInput = wrapper.querySelector('input[data-lexical-link-input]');
          if (linkTextInput) {
            if (TEMP_URL && TEMP_LINK_NODE_KEY) {
              CURRENT_LINK_NODE_KEY[currentEditor._config.namespace] = TEMP_LINK_NODE_KEY;
              linkTextInput.value = TEMP_URL;
            } else {
              linkTextInput.value = '';
              CURRENT_LINK_NODE_KEY[currentEditor._config.namespace] = undefined;
            }
          }
        }
      }
    });
  }
}
function registerLinkListeners(editor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const linkButton = wrapper.querySelector('button[data-lexical-link-button]');
    if (linkButton) {
      if (isTouchDevice()) linkButton.addEventListener('touchstart', handleEditLinkURL);else linkButton.addEventListener('mousedown', handleEditLinkURL);
    }
    // Handle with registerLink
    const linkSubmitButton = wrapper.querySelector('button[data-lexical-link-submit]');
    const linkTextInput = wrapper.querySelector('input[data-lexical-link-input]');
    const removeLinkButton = wrapper.querySelector('button[data-lexical-remove-link]');
    if (linkSubmitButton) linkSubmitButton.addEventListener('click', getHandleLinkSubmit(editor));
    if (removeLinkButton) removeLinkButton.addEventListener('click', getHandleRemoveLink(editor));
    if (linkTextInput) linkTextInput.addEventListener('keydown', preventFormSubmitEnter);
  }
}
function registerLinkEditable(editor, validateUrl = validateURLDefault) {
  if (editor.hasNode(LinkNode)) {
    registerLinkListeners(editor);
    const linkButton2 = document.getElementById('float-menu-link');
    if (linkButton2) linkButton2.addEventListener('click', handleFloatLinkClick, true);
    if (linkButton2) {
      if (isTouchDevice()) linkButton2.addEventListener('touchstart', handleEditLinkURLFloating);else linkButton2.addEventListener('mousedown', handleEditLinkURLFloating);
    }
    const toolbarLinkMenu = document.getElementById('lexical-insert-link-main-menu');
    if (toolbarLinkMenu) {
      const linkSubmitButton2 = toolbarLinkMenu.querySelector('button[data-lexical-link-submit]');
      const linkTextInput2 = toolbarLinkMenu.querySelector('input[data-lexical-link-input]');
      const removeLinkButton2 = toolbarLinkMenu.querySelector('button[data-lexical-remove-link]');
      if (linkSubmitButton2) linkSubmitButton2.addEventListener('click', handleLinkSubmitFloating);
      if (removeLinkButton2) removeLinkButton2.addEventListener('click', handleRemoveLinkFloating);
      if (linkTextInput2) linkTextInput2.addEventListener('keydown', preventFormSubmitEnter);
    }
    return mergeRegister(editor.registerCommand(TOGGLE_LINK_COMMAND, payload => {
      const {
        selection,
        url,
        ...rest
      } = payload;
      if (url === null) {
        toggleLink(selection, null);
        return true;
      } else if (typeof url === 'string' && validateUrl(url)) {
        toggleLink(selection, url, {
          rel: rest.rel,
          title: rest.title,
          target: rest.target || '_blank'
        });
        return true;
      } else {
        return false;
      }
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(PASTE_COMMAND, /* @ts-ignore */
    event => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || selection.isCollapsed() || !(event instanceof ClipboardEvent) || event.clipboardData == null) {
        return false;
      }
      const clipboardText = event.clipboardData.getData('text');
      if (!validateUrl(clipboardText)) {
        return false;
      }
      // If we select nodes that are elements then avoid applying the link.
      if (!selection.getNodes().some(node => $isElementNode(node))) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
          selection,
          url: clipboardText,
          rel: 'ugc',
          target: '_blank'
        });
        event.preventDefault();
        return true;
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !!!selection.isCollapsed()) SELECTION[editor._config.namespace] = selection;else SELECTION[editor._config.namespace] = undefined;
      return false;
    }, COMMAND_PRIORITY_HIGH), function () {
      const editorNamespace = editor._config.namespace;
      if (SELECTION[editorNamespace]) delete SELECTION[editorNamespace];
      return;
    }, editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
      registerLinkListeners(editor);
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have LinkNode registered.");
  }
  return () => {
    return;
  };
}

/*-------------------------------------------------- SectionHeadingNode ---------------------------------------- */

class SectionHeadingNode extends ElementNode {
  /** @internal */

  __version = SECTION_LINK_NODE_VERSION;
  static getType() {
    return 'section-heading';
  }
  static clone(node) {
    return new SectionHeadingNode(node.__id, node.__key);
  }
  constructor(id, key) {
    super(key);
    this.__id = id;
  }
  createDOM(config) {
    const element = document.createElement('a');
    element.href = '#'.concat(this.__id);
    element.id = this.__id;
    element.className = "same-page";
    element.setAttribute('data-v', String(SECTION_LINK_NODE_VERSION));
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(prevNode, anchor, config) {
    return prevNode.__id !== this.__id;
  }
  static importDOM() {
    return {
      a: node => {
        if (node.classList.contains('same-page') || node.getAttribute('href')?.startsWith('#')) {
          return {
            conversion: convertSectionHeadingElement,
            priority: 2
          };
        }
        return null;
      }
    };
  }
  static importJSON(serializedNode) {
    const node = $createSectionHeadingNode(serializedNode.id);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      version: SECTION_LINK_NODE_VERSION,
      type: this.getType()
    };
  }
  getId() {
    return this.getLatest().__id;
  }
  setId(s) {
    const self = this.getWritable();
    self.__id = s;
    return self;
  }
  insertNewAfter(_, restoreSelection = true) {
    const sectionHeadingNode = $createSectionHeadingNode(this.__id);
    this.insertAfter(sectionHeadingNode, restoreSelection);
    return sectionHeadingNode;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
  canBeEmpty() {
    return false;
  }
  isInline() {
    return true;
  }
  extractWithChild(child, selection, destination) {
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    return this.isParentOf(anchorNode) && this.isParentOf(focusNode) && selection.getTextContent().length > 0;
  }
}
function convertSectionHeadingElement(domNode) {
  let node = null;
  if (isHTMLAnchorElement(domNode)) {
    const content = domNode.textContent;
    if (content !== null && content !== '' || domNode.children.length > 0) {
      const randID = "i" + window.crypto.randomUUID();
      node = $createSectionHeadingNode(domNode.getAttribute('id') || randID);
    }
  }
  return {
    node
  };
}

/**
 * Takes a URL and creates a LinkNode.
 * @param url - The URL the LinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes { target, rel, title }
 * @returns The LinkNode.
 */
function $createSectionHeadingNode(id) {
  return $applyNodeReplacement(new SectionHeadingNode(id));
}

/**
 * Determines if node is a LinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a LinkNode, false otherwise.
 */
function $isSectionHeadingNode(node) {
  return node instanceof SectionHeadingNode;
}
const TOGGLE_SECTION_HEADING_COMMAND = createCommand("TOGGLE_SECTION_HEADING_COMMAND");
function getDisaptchSectionHeading(editor) {
  const func = function () {
    editor.dispatchCommand(TOGGLE_SECTION_HEADING_COMMAND, undefined);
  };
  return func;
}
function toggleSectionHeading(id, selection) {
  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();
  if (id === null) {
    // Remove LinkNodes
    nodes.forEach(node => {
      const parent = node.getParent();
      if ($isSectionHeadingNode(parent)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }
        parent.remove();
      }
    });
  } else {
    // Add or merge LinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a LinkNode or if its
      // parent is a LinkNode, we update the URL, target and rel.
      const sectionHeadingNode = $getAncestor(firstNode, $isSectionHeadingNode);
      if (sectionHeadingNode !== null) {
        sectionHeadingNode.setId(id);
        return;
      }
    }
    let prevParent = null;
    let sectionHeadingNode = null;
    nodes.forEach(node => {
      const parent = node.getParent();
      if (parent === sectionHeadingNode || parent === null || $isElementNode(node) && !node.isInline()) {
        return;
      }
      if ($isSectionHeadingNode(parent)) {
        sectionHeadingNode = parent;
        parent.setId(id);
        return;
      }
      if (!parent.is(prevParent)) {
        prevParent = parent;
        sectionHeadingNode = $createSectionHeadingNode(id);
        if ($isSectionHeadingNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(sectionHeadingNode);
          } else {
            parent.insertAfter(sectionHeadingNode);
          }
        } else {
          node.insertBefore(sectionHeadingNode);
        }
      }
      if ($isSectionHeadingNode(node)) {
        if (node.is(sectionHeadingNode)) {
          return;
        }
        if (sectionHeadingNode !== null) {
          const children = node.getChildren();
          for (let i = 0; i < children.length; i++) {
            sectionHeadingNode.append(children[i]);
          }
        }
        node.remove();
        return;
      }
      if (sectionHeadingNode !== null) {
        sectionHeadingNode.append(node);
      }
    });
  }
}
function registerSectionHeadingListeners(editor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const sectionHeadingButton = wrapper.querySelector('button[data-lexical-section-button]');
    if (sectionHeadingButton) {
      sectionHeadingButton.addEventListener('click', getDisaptchSectionHeading(editor));
    }
  }
}
function registerSectionHeadingNodeEditable(editor) {
  if (editor.hasNode(SectionHeadingNode)) {
    registerSectionHeadingListeners(editor);
    return mergeRegister(editor.registerCommand(TOGGLE_SECTION_HEADING_COMMAND, () => {
      const selection = $getSelection();
      var removeSectionHeading = false;
      const id = "i" + window.crypto.randomUUID();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        for (let node of nodes) {
          if ($isSectionHeadingNode(node)) {
            removeSectionHeading = true;
            break;
          } else if ($isTextNode(node)) {
            const parent = node.getParent();
            if ($isSectionHeadingNode(parent)) {
              removeSectionHeading = true;
              break;
            }
          }
        }
        toggleSectionHeading(removeSectionHeading ? null : id, selection);
        return true;
      }
      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerMutationListener(SectionHeadingNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === "created") {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isSectionHeadingNode(node)) {
              if (!!!$isHeadingNode(node.getParent())) {
                const selection = $createRangeSelection();
                selection.insertNodes([node.getParent()]);
                $setBlocksType(selection, () => $createHeadingNode('h6'));
              }
            }
          });
        } else if (mutation === "updated") {
          editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isSectionHeadingNode(node)) {
              if (!!!$isHeadingNode(node.getParent())) {
                const selection = $createRangeSelection();
                selection.insertNodes([node.getParent()]);
                $setBlocksType(selection, () => $createHeadingNode('h6'));
              }
            }
          });
        }
      }
    }), editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
      registerSectionHeadingListeners(editor);
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have SectionHeadingNode registered.");
    return () => {};
  }
}

/* --------------------------------------------------- AbbreviationNode ---------------------------------------------- */

class AbbreviationNode extends ElementNode {
  /** @internal */
  __title = '';
  __version = LINK_NODE_VERSION;
  static getType() {
    return 'abbreviation';
  }
  static clone(node) {
    return new AbbreviationNode(node.__title);
  }
  constructor(title, key) {
    super(key);
    this.__title = title;
  }
  createDOM(config) {
    const element = document.createElement('abbr');
    element.setAttribute('title', this.getTitle());
    element.setAttribute('data-v', String(LINK_NODE_VERSION));
    element.setAttribute('spellcheck', 'false');
    addClassNamesToElement(element, config.theme.abbr);
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    return element;
  }
  updateDOM(prevNode, abbrEl, config) {
    const title = this.__title;
    if (title !== prevNode.__title) {
      abbrEl.title = title;
    }
    return false;
  }
  static importDOM() {
    return {
      abbr: node => ({
        conversion: convertAbbrElement,
        priority: 1
      })
    };
  }
  static importJSON(serializedNode) {
    const node = $createAbbreviationNode(serializedNode.title);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      title: this.getTitle(),
      type: this.getType(),
      version: ABBR_NODE_VERSION
    };
  }
  getTitle() {
    return this.getLatest().__title;
  }
  setTitle(title) {
    const writable = this.getWritable();
    writable.__title = title;
  }
  insertNewAfter(_, restoreSelection = true) {
    const abbrNode = $createAbbreviationNode(this.__title);
    this.insertAfter(abbrNode, restoreSelection);
    return abbrNode;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
  canBeEmpty() {
    return false;
  }
  isInline() {
    return true;
  }
  extractWithChild(child, selection, destination) {
    if (!$isRangeSelection(selection)) {
      return false;
    }
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    return this.isParentOf(anchorNode) && this.isParentOf(focusNode) && selection.getTextContent().length > 0;
  }
}
function convertAbbrElement(domNode) {
  let node = null;
  if (isHTMLElement(domNode) && domNode.tagName === 'ABBR') {
    const content = domNode.textContent;
    if (content !== null && content !== '' || domNode.children.length > 0) {
      node = $createAbbreviationNode(domNode.getAttribute('title') || '');
    }
  }
  return {
    node
  };
}

/**
 * Takes a title and creates a AbbreviationNode.
 */
function $createAbbreviationNode(title) {
  return $applyNodeReplacement(new AbbreviationNode(title));
}

/**
 * Determines if node is a AbbreviationNode.
 */
function $isAbbreviationNode(node) {
  return node instanceof AbbreviationNode;
}
const TOGGLE_ABBR_COMMAND = createCommand('TOGGLE_ABBR_COMMAND');
function toggleAbbr(selection, title) {
  if (!$isRangeSelection(selection)) {
    return;
  }
  const nodes = selection.extract();
  if (title === null) {
    // Remove LinkNodes
    nodes.forEach(node => {
      const parent = node.getParent();
      if ($isAbbreviationNode(parent)) {
        const children = parent.getChildren();
        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i]);
        }
        parent.remove();
      }
    });
  } else {
    // Add or merge LinkNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0];
      // if the first node is a LinkNode or if its
      // parent is a LinkNode, we update the URL, target and rel.
      const abbrNode = $getAncestor(firstNode, $isAbbreviationNode);
      if (abbrNode !== null) {
        abbrNode.setTitle(title);
        return;
      }
    }
    let prevParent = null;
    let abbrNode = null;
    nodes.forEach(node => {
      const parent = node.getParent();
      if (parent === abbrNode || parent === null || $isElementNode(node) && !node.isInline()) {
        return;
      }
      if ($isAbbreviationNode(parent)) {
        abbrNode = parent;
        parent.setTitle(title);
        return;
      }
      if (!parent.is(prevParent)) {
        prevParent = parent;
        abbrNode = $createAbbreviationNode(title);
        if ($isAbbreviationNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(abbrNode);
          } else {
            parent.insertAfter(abbrNode);
          }
        } else {
          node.insertBefore(abbrNode);
        }
      }
      if ($isAbbreviationNode(node)) {
        if (node.is(abbrNode)) {
          return;
        }
        if (abbrNode !== null) {
          const children = node.getChildren();
          for (let i = 0; i < children.length; i++) {
            abbrNode.append(children[i]);
          }
        }
        node.remove();
        return;
      }
      if (abbrNode !== null) {
        abbrNode.append(node);
      }
    });
  }
}

/* ------------------------------------- Abbreviation Stuff --------------------------------- */
const validateAbbr = s => Boolean(s.length >= 1 && s.length <= 200);

/**
 * Need to store range selection because things get weird when the link input form is open
 */
var ABBR_SELECTION = {};
const CURRENT_ABBR_NODE_KEY = {};
function getHandleAbbrSubmit(editor) {
  const handleAbbrSubmit = function (e) {
    const wrapper = this.closest('div.floating-menu');
    if (wrapper) {
      const textInput = wrapper.querySelector('input[data-lexical-abbr-input]');
      if (textInput && $isRangeSelection(ABBR_SELECTION[editor._config.namespace])) {
        const value = textInput.value;
        if (!!!CURRENT_ABBR_NODE_KEY[editor._config.namespace]) {
          if (validateAbbr(value)) {
            editor.dispatchCommand(TOGGLE_ABBR_COMMAND, {
              selection: ABBR_SELECTION[editor._config.namespace],
              title: value
            });
            textInput.value = '';
            document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
              detail: {
                str: "#".concat(wrapper.id)
              }
            }));
            wrapper.style.display = 'none';
          }
        } else {
          if (validateAbbr(value)) {
            editor.update(() => {
              const node = $getNodeByKey(String(CURRENT_ABBR_NODE_KEY[editor._config.namespace]));
              if ($isAbbreviationNode(node)) {
                node.setTitle(value);
                textInput.value = '';
                document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
                  detail: {
                    str: "#".concat(wrapper.id)
                  }
                }));
                wrapper.style.display = 'none';
              }
            });
          }
        }
      }
    }
  };
  return handleAbbrSubmit;
}
function getHandleRemoveAbbr(editor) {
  /**
   * Function called when the remove link button is clicked. 
   * This button is only shown when the selection currently contains a link.
   * @param this 
   * @param e 
   */
  const handleRemoveLink = function (e) {
    const wrapper = this.closest('div.floating-menu');
    if (wrapper) {
      const textInput = wrapper.querySelector('input[type="text"]');
      if (textInput && $isRangeSelection(ABBR_SELECTION[editor._config.namespace])) {
        editor.dispatchCommand(TOGGLE_ABBR_COMMAND, {
          selection: SELECTION[editor._config.namespace],
          title: null
        });
        textInput.value = '';
      }
    }
  };
  return handleRemoveLink;
}
function handleAbbrSubmitFloating(e) {
  const editor = getCurrentEditor();
  const toolbarLinkMenu = document.getElementById('lexical-insert-abbr-main');
  if (editor && toolbarLinkMenu) {
    const id = editor._config.namespace;
    const selection = SELECTION[id];
    const textInput = toolbarLinkMenu.querySelector('input[data-lexical-abbr-input]');
    if ($isRangeSelection(selection) && textInput) {
      const value = textInput.value;
      if (validateAbbr(value)) {
        if (!!!CURRENT_ABBR_NODE_KEY[editor._config.namespace]) {
          editor.dispatchCommand(TOGGLE_ABBR_COMMAND, {
            selection: SELECTION[editor._config.namespace],
            title: value
          });
          textInput.value = '';
          document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
            detail: {
              str: "#lexical-insert-abbr-main"
            }
          }));
          toolbarLinkMenu.style.display = 'none';
        } else {
          editor.update(() => {
            const node = $getNodeByKey(String(CURRENT_ABBR_NODE_KEY[editor._config.namespace]));
            if ($isAbbreviationNode(node)) {
              node.setTitle(value);
              textInput.value = '';
              document.dispatchEvent(new CustomEvent("HIDE_OPEN_POPOVER", {
                detail: {
                  str: "#lexical-insert-abbr-main"
                }
              }));
              toolbarLinkMenu.style.display = 'none';
            }
          });
        }
      }
    }
  }
}
function handleRemoveAbbrFloating(e) {
  const wrapper = document.getElementById('lexical-insert-abbr-main');
  const editor = getCurrentEditor();
  if (wrapper && editor) {
    const textInput = wrapper.querySelector('input[type="text"]');
    if (textInput && $isRangeSelection(ABBR_SELECTION[editor._config.namespace])) {
      editor.dispatchCommand(TOGGLE_ABBR_COMMAND, {
        selection: ABBR_SELECTION[editor._config.namespace],
        title: null
      });
      textInput.value = '';
    }
  }
}
function handleFloatAbbrClick() {
  const editor = getCurrentEditor();
  const toolbarLinkMenu = document.getElementById('lexical-insert-abbr-main');
  if (toolbarLinkMenu && editor) {
    const removeLinkButton = toolbarLinkMenu.querySelector('button[data-lexical-remove-abbr]');
    const id = editor._config.namespace;
    const selection = ABBR_SELECTION[id];
    var SHOW_REMOVE_BUTTON = false;
    editor.getEditorState().read(() => {
      if ($isRangeSelection(selection) && removeLinkButton) {
        const INCLUDES_LINK_NODE = Boolean(selection.getNodes().filter(s => $isAbbreviationNode(s) || $isAbbreviationNode(s.getParent())).length >= 1);
        if (INCLUDES_LINK_NODE) {
          SHOW_REMOVE_BUTTON = true;
          removeLinkButton.removeAttribute('hidden');
        }
      }
    });
    if (!!!SHOW_REMOVE_BUTTON && removeLinkButton) {
      removeLinkButton.setAttribute('hidden', '');
    }
  }
}

/**
 * If there is a link in the node selection, get the node key of the link, put the url in the text box, 
 * @param this 
 * @param e 
 */
function handleEditAbbrURL(e) {
  const currentEditor = getCurrentEditor();
  if (currentEditor) {
    currentEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        var TEMP_ABBR_NODE_KEY = undefined;
        var TEMP_TITLE = '';
        for (let node of nodes) {
          if ($isTextNode(node)) {
            const parent = node.getParent();
            if ($isAbbreviationNode(parent)) {
              const key = parent.getKey();
              if (TEMP_ABBR_NODE_KEY && key !== TEMP_ABBR_NODE_KEY) {
                TEMP_ABBR_NODE_KEY = undefined;
                TEMP_TITLE = '';
                break;
              } else if (!!!TEMP_ABBR_NODE_KEY) {
                TEMP_ABBR_NODE_KEY = key;
                TEMP_TITLE = parent.getTitle();
              }
            }
          } else if ($isAbbreviationNode(node)) {
            const key = node.getKey();
            if (TEMP_ABBR_NODE_KEY && key !== TEMP_ABBR_NODE_KEY) {
              TEMP_ABBR_NODE_KEY = undefined;
              TEMP_TITLE = '';
              break;
            } else if (!!!TEMP_ABBR_NODE_KEY) {
              TEMP_ABBR_NODE_KEY = key;
              TEMP_TITLE = node.getTitle();
            }
          }
        }
        const wrapper = document.getElementById(currentEditor._config.namespace);
        if (wrapper) {
          const linkTextInput = wrapper.querySelector('input[data-lexical-abbr-input]');
          if (linkTextInput) {
            if (TEMP_TITLE && TEMP_ABBR_NODE_KEY) {
              CURRENT_ABBR_NODE_KEY[currentEditor._config.namespace] = TEMP_ABBR_NODE_KEY;
              linkTextInput.value = TEMP_TITLE;
            } else {
              linkTextInput.value = '';
              CURRENT_ABBR_NODE_KEY[currentEditor._config.namespace] = undefined;
            }
          }
        }
      }
    });
  }
}
function handleEditAbbrURLFloating(e) {
  const currentEditor = getCurrentEditor();
  if (currentEditor) {
    currentEditor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        var TEMP_ABBR_NODE_KEY = undefined;
        var TEMP_TITLE = '';
        for (let node of nodes) {
          if ($isTextNode(node)) {
            const parent = node.getParent();
            if ($isAbbreviationNode(parent)) {
              const key = parent.getKey();
              if (TEMP_ABBR_NODE_KEY && key !== TEMP_ABBR_NODE_KEY) {
                TEMP_ABBR_NODE_KEY = undefined;
                TEMP_TITLE = '';
                break;
              } else if (!!!TEMP_ABBR_NODE_KEY) {
                TEMP_ABBR_NODE_KEY = key;
                TEMP_TITLE = parent.getTitle();
              }
            }
          } else if ($isAbbreviationNode(node)) {
            const key = node.getKey();
            if (TEMP_ABBR_NODE_KEY && key !== TEMP_ABBR_NODE_KEY) {
              TEMP_ABBR_NODE_KEY = undefined;
              TEMP_TITLE = '';
              break;
            } else if (!!!TEMP_ABBR_NODE_KEY) {
              TEMP_ABBR_NODE_KEY = key;
              TEMP_TITLE = node.getTitle();
            }
          }
        }
        const wrapper = document.getElementById('lexical-insert-abbr-main');
        if (wrapper) {
          const linkTextInput = wrapper.querySelector('input[data-lexical-abbr-input]');
          if (linkTextInput) {
            if (TEMP_TITLE && TEMP_ABBR_NODE_KEY) {
              CURRENT_ABBR_NODE_KEY[currentEditor._config.namespace] = TEMP_ABBR_NODE_KEY;
              linkTextInput.value = TEMP_TITLE;
            } else {
              linkTextInput.value = '';
              CURRENT_ABBR_NODE_KEY[currentEditor._config.namespace] = undefined;
            }
          }
        }
      }
    });
  }
}
function registerAbbrListeners(editor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const linkButton = wrapper.querySelector('button[data-lexical-abbr-button]');
    if (linkButton) {
      if (isTouchDevice()) linkButton.addEventListener('touchstart', handleEditAbbrURL);else linkButton.addEventListener('mousedown', handleEditAbbrURL);
    }
    // Handle with registerLink
    const linkSubmitButton = wrapper.querySelector('button[data-lexical-abbr-submit]');
    const linkTextInput = wrapper.querySelector('input[data-lexical-abbr-input]');
    const removeLinkButton = wrapper.querySelector('button[data-lexical-remove-abbr]');
    if (linkSubmitButton) linkSubmitButton.addEventListener('click', getHandleAbbrSubmit(editor));
    if (removeLinkButton) removeLinkButton.addEventListener('click', getHandleRemoveAbbr(editor));
    if (linkTextInput) linkTextInput.addEventListener('keydown', preventFormSubmitEnter);
  }
  const linkButton2 = document.getElementById('lexical-menu-abbr-btn');
  if (linkButton2) linkButton2.addEventListener('click', handleFloatAbbrClick, true);
  if (linkButton2) {
    if (isTouchDevice()) linkButton2.addEventListener('touchstart', handleEditAbbrURLFloating);else linkButton2.addEventListener('mousedown', handleEditAbbrURLFloating);
  }
  const toolbarLinkMenu = document.getElementById('lexical-insert-abbr-main');
  if (toolbarLinkMenu) {
    const linkSubmitButton2 = toolbarLinkMenu.querySelector('button[data-lexical-abbr-submit]');
    const linkTextInput2 = toolbarLinkMenu.querySelector('input[data-lexical-abbr-input]');
    const removeLinkButton2 = toolbarLinkMenu.querySelector('button[data-lexical-remove-abbr]');
    if (linkSubmitButton2) linkSubmitButton2.addEventListener('click', handleAbbrSubmitFloating);
    if (removeLinkButton2) removeLinkButton2.addEventListener('click', handleRemoveAbbrFloating);
    if (linkTextInput2) linkTextInput2.addEventListener('keydown', preventFormSubmitEnter);
  }
}
function registerAbbrEditable(editor) {
  if (editor.hasNode(AbbreviationNode)) {
    registerAbbrListeners(editor);
    return mergeRegister(editor.registerCommand(TOGGLE_ABBR_COMMAND, payload => {
      const {
        selection,
        title
      } = payload;
      if (title === null) {
        toggleAbbr(selection, null);
        return true;
      } else if (typeof title === 'string' && validateAbbr(title)) {
        toggleAbbr(selection, title);
        return true;
      } else {
        return false;
      }
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && !!!selection.isCollapsed()) ABBR_SELECTION[editor._config.namespace] = selection;else ABBR_SELECTION[editor._config.namespace] = undefined;
      return false;
    }, COMMAND_PRIORITY_HIGH), function () {
      const editorNamespace = editor._config.namespace;
      if (ABBR_SELECTION[editorNamespace]) delete ABBR_SELECTION[editorNamespace];
      return;
    }, editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
      registerAbbrListeners(editor);
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have AbbreviationNode registered.");
  }
  return () => {
    return;
  };
}

export { $createAbbreviationNode, $createLinkNode, $createSectionHeadingNode, $isAbbreviationNode, $isLinkNode, $isSectionHeadingNode, AbbreviationNode, LinkNode, SectionHeadingNode, TOGGLE_ABBR_COMMAND, TOGGLE_LINK_COMMAND, TOGGLE_SECTION_HEADING_COMMAND, registerAbbrEditable, registerLinkEditable, registerSectionHeadingNodeEditable, toggleAbbr, toggleLink, toggleSectionHeading };
