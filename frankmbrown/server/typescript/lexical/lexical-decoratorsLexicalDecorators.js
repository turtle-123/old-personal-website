/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { IS_REAL_BROWSER, isTouchDevice, getDeviceType, getEditorButtons, setColorInput, getDefaultTextColor, getFileListForFileInput, REGISTER_TOOLBAR_LISTENERS, UPDATE_ON_SET_HTML, getCurrentEditor, GET_BACKGROUND_COLOR_DIALOG, getDefaultBackground, getEditorInstances, closeDialog, SCROLL_INTO_VIEW_OPTIONS as SCROLL_INTO_VIEW_OPTIONS$1, openLoadingDialog, getCsrfToken, closeLoadingDialog, isMobileDevice, isHTMLElementCustom, gcd } from './lexical-sharedLexicalShared.js';
import { DecoratorNode, createCommand, COMMAND_PRIORITY_EDITOR, VALID_HEX_REGEX, $getSelection, $isNodeSelection, $isRangeSelection, $insertNodes, $isParagraphNode, $createParagraphNode, $createNodeSelection, $setSelection, FORMAT_ELEMENT_COMMAND, $isDecoratorNode, COMMAND_PRIORITY_LOW, CLICK_COMMAND, KEY_DELETE_COMMAND, KEY_BACKSPACE_COMMAND, SELECTION_CHANGE_COMMAND, $getNodeByKey, DEPRECATED_$isGridSelection, COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND, $isTextNode, DRAGSTART_COMMAND, DRAGOVER_COMMAND, DROP_COMMAND, $nodesOfType, $isElementNode, $getRoot, $createRangeSelection, COMMAND_PRIORITY_CRITICAL } from './lexicalLexical.js';
import { $insertNodeToNearestRoot, mergeRegister, $wrapNodeInElement, $getNearestBlockElementAncestorOrThrow, $findMatchingParent } from './lexical-utilsLexicalUtils.js';
import { DRAG_DROP_PASTE } from './lexical-rich-textLexicalRichText.js';

const VALID_ALIGN_DECORATOR_BLOCK = new Set(['left', 'center', 'right', 'justify']);
const CURRENT_VERSION$c = 1;
class DecoratorBlockNode extends DecoratorNode {
  __version = CURRENT_VERSION$c;
  constructor(format, key) {
    super(key);
    this.__format = format || 'left';
  }
  exportJSON() {
    return {
      format: this.__format || '',
      type: 'decorator-block',
      version: CURRENT_VERSION$c,
      first_element: this.getFirstElement()
    };
  }
  createDOM() {
    const el = document.createElement('div');
    el.style.textAlign = this.__format;
    el.style.whiteSpace = "normal";
    el.setAttribute("data-v", String(CURRENT_VERSION$c));
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    return el;
  }
  updateDOM(_prevNode, _dom, _config) {
    return false;
  }
  exportDOM(editor) {
    const element = document.createElement('div');
    element.setAttribute('data-frank-decorator-block', '');
    element.setAttribute('data-text-align', this.getFormat());
    element.style.setProperty("text-align", this.getFormat());
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-frank-decorator-block')) {
          return null;
        }
        return {
          conversion: convertDecoratorBlockNode,
          priority: 3
        };
      }
    };
  }
  getFormat() {
    const self = this.getLatest();
    return self.__format;
  }
  setFormat(format) {
    const self = this.getWritable();
    self.__format = format;
  }
  isInline() {
    return false;
  }
  canAlign() {
    return true;
  }
  isKeyboardSelectable() {
    return true;
  }
}
function isValidTextAlign(align) {
  return Boolean(align === "left" || align === "center" || align === "right" || align === "justify");
}
function convertDecoratorBlockNode(el) {
  const textAlign = el.getAttribute('data-text-align');
  const first_element = el.classList.contains('first-rte-element');
  const last_element = el.classList.contains('last-rte-element');
  if (isValidTextAlign(textAlign)) {
    const node = $createDecoratorBlockNode(textAlign);
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  } else {
    const node = $createDecoratorBlockNode();
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  }
}
function $createDecoratorBlockNode(textAlign) {
  if (textAlign) {
    const node = new DecoratorBlockNode(textAlign);
    return node;
  } else {
    const node = new DecoratorBlockNode();
    return node;
  }
}
function $isDecoratorBlockNode(node) {
  return node instanceof DecoratorBlockNode;
}

const CURRENT_VERSION$b = 1;

/* @ts-ignore */
class NewsNode extends DecoratorBlockNode {
  __version = CURRENT_VERSION$b;
  static getType() {
    return 'news';
  }
  static clone(node) {
    return new NewsNode({
      url: node.getURL(),
      title: node.getTitle(),
      description: node.getDescription(),
      imageURL: node.getImageURL(),
      host: node.getHost()
    }, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const {
      url,
      title,
      description,
      imageURL,
      host,
      format
    } = serializedNode;
    const node = $createNewsNode({
      url,
      title,
      description,
      imageURL,
      host,
      format
    });
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      url: this.getURL(),
      title: this.getTitle(),
      description: this.getDescription(),
      imageURL: this.getImageURL(),
      host: this.getHost(),
      type: 'news',
      first_element: this.getFirstElement(),
      version: CURRENT_VERSION$b
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-href') || !domNode.hasAttribute('data-news-title') || !domNode.hasAttribute('data-news-description') || !domNode.hasAttribute('data-news-image-url') || !domNode.hasAttribute('data-host')) {
          return null;
        }
        return {
          conversion: convertNewsElement,
          priority: 3
        };
      }
    };
  }
  // TODO: Add Height
  exportDOM() {
    const div = document.createElement('div');
    div.setAttribute('data-href', this.getURL());
    div.setAttribute('data-news-title', this.getTitle());
    div.setAttribute('data-news-description', this.getDescription());
    div.setAttribute('data-news-image-url', this.getImageURL());
    div.setAttribute('data-host', this.getHost());
    div.setAttribute("data-v", String(CURRENT_VERSION$b));
    div.style.textAlign = this.getFormat();
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) div.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) div.classList.add('last-rte-element');
    return {
      element: div
    };
  }
  constructor(obj, format, key) {
    super(format ? format : 'center', key);
    this.__url = obj.url;
    this.__title = obj.title;
    this.__description = obj.description;
    this.__imageURL = obj.imageURL;
    this.__host = obj.host;
  }
  getURL() {
    const self = this.getLatest();
    return self.__url;
  }
  getTitle() {
    const self = this.getLatest();
    return self.__title;
  }
  getDescription() {
    const self = this.getLatest();
    return self.__description;
  }
  getImageURL() {
    const self = this.getLatest();
    return self.__imageURL;
  }
  getHost() {
    const self = this.getLatest();
    return self.__host;
  }
  decorate(editor, config) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const element = createNewsElement({
      url: this.getURL(),
      title: this.getTitle(),
      description: this.getDescription(),
      imageURL: this.getImageURL(),
      host: this.getHost()
    });
    if (this.getFirstElement()) element.classList.add('first-rte-element');
    if (this.getLastElement()) element.classList.add('last-rte-element');
    if (decoratorNodeElement && decoratorNodeElement.children.length === 0) {
      decoratorNodeElement.insertAdjacentElement("afterbegin", element);
    }
    return element;
  }
}
function createNewsElement(obj) {
  const a = document.createElement('a');
  a.setAttribute('href', obj.url);
  a.classList.add("lexical-news-article");
  a.setAttribute('target', '_blank');
  a.setAttribute('title', obj.url);
  const img = document.createElement('img');
  img.setAttribute("src", obj.imageURL);
  img.setAttribute("width", "325");
  img.setAttribute("height", "160");
  img.setAttribute("alt", obj.title);
  img.setAttribute("data-text", obj.description);
  img.setAttribute('loading', 'lazy');
  const p = document.createElement('p');
  p.classList.add('body1');
  p.innerText = obj.title;
  const span = document.createElement('span');
  span.innerText = obj.host;
  a.append(img);
  a.append(p);
  a.append(span);
  return a;
}
function convertNewsElement(domNode) {
  const url = String(domNode.getAttribute('data-href'));
  const title = String(domNode.getAttribute('data-news-title'));
  const description = String(domNode.getAttribute('data-news-description'));
  const imageURL = String(domNode.getAttribute('data-news-image-url'));
  const host = String(domNode.getAttribute('data-host'));
  const format = VALID_ALIGN_DECORATOR_BLOCK.has(domNode.style.textAlign) ? domNode.style.textAlign : 'center';
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  const node = $createNewsNode({
    url,
    title,
    description,
    imageURL,
    host,
    format
  });
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return {
    node
  };
}
function $createNewsNode(obj) {
  return new NewsNode(obj, obj.format);
}
function $isNewsNode(node) {
  return node instanceof NewsNode;
}
const INSERT_NEWS_NODE$1 = createCommand('INSERT_NEWS_NODE');
function registerNewsNode(editor) {
  return editor.registerCommand(INSERT_NEWS_NODE$1, obj => {
    const {
      url,
      title,
      description,
      imageURL,
      host
    } = obj;
    const node = $createNewsNode({
      url,
      title,
      description,
      imageURL,
      host,
      format: 'center'
    });
    $insertNodeToNearestRoot(node);
    return true;
  }, COMMAND_PRIORITY_EDITOR);
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const CURRENT_VERSION$a = 1;
class YouTubeNode extends DecoratorBlockNode {
  __version = CURRENT_VERSION$a;
  constructor(id, format, key) {
    super(format, key);
    this.__id = id;
  }
  static getType() {
    return 'youtube';
  }
  static clone(node) {
    return new YouTubeNode(node.__id, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const node = $createYouTubeNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: CURRENT_VERSION$a,
      videoID: this.__id,
      first_element: this.getFirstElement()
    };
  }
  exportDOM() {
    const element = setYoutubeIframe(document.createElement('iframe'), this.getId(), this.__format);
    element.setAttribute('loading', 'lazy');
    element.setAttribute('data-text-align', this.__format);
    element.setAttribute("data-v", String(CURRENT_VERSION$a));
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      iframe: domNode => {
        if (!domNode.hasAttribute('data-frank-youtube')) {
          return null;
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1
        };
      }
    };
  }
  updateDOM() {
    return false;
  }
  getId() {
    return this.__id;
  }
  getTextContent(_includeInert, _includeDirectionless) {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }
  decorate(editor, config) {
    const el = setYoutubeIframe(document.createElement('iframe'), this.getId(), this.__format);
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        element.append(el);
      } else {
        element.style.textAlign = this.__format;
      }
    }
    return el;
  }
}
function setYoutubeIframe(el, id, textAlign) {
  el.classList.add('youtube-embed');
  el.setAttribute('width', '560');
  el.setAttribute('height', '315');
  el.setAttribute('src', 'https://www.youtube-nocookie.com/embed/'.concat(id));
  el.setAttribute('frameborder', '0');
  el.setAttribute('allow', "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
  el.setAttribute('allowfullscreen', 'true');
  el.setAttribute('data-frank-youtube', '');
  el.setAttribute('loading', 'lazy');
  el.style.textAlign = textAlign;
  return el;
}
function convertYoutubeElement(domNode) {
  const videoID = domNode.getAttribute('src');
  if (videoID) {
    const node = $createYouTubeNode(videoID.replace('https://www.youtube-nocookie.com/embed/', ''));
    const tempTextAlign = domNode.getAttribute('data-text-align');
    if (tempTextAlign === 'left' || tempTextAlign === 'center' || tempTextAlign === 'right' || tempTextAlign === 'justify') {
      node.setFormat(tempTextAlign);
    }
    const first_element = domNode.classList.contains('first-rte-element');
    const last_element = domNode.classList.contains('last-rte-element');
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  }
  return null;
}
function $createYouTubeNode(videoID) {
  return new YouTubeNode(videoID);
}
function $isYouTubeNode(node) {
  return node instanceof YouTubeNode;
}
const YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
/**
 * Returns false if the youtube url is not valid and 
 * returns true if it is valid
 * @param s 
 * @returns 
 */
function validateYoutubeUrl(s) {
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return false;
    var match = s.match(YOUTUBE_REGEX);
    if (match && match[2].length == 11) {
      return String(match[2]);
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
const INSERT_YOUTUBE_COMMAND$1 = createCommand('INSERT_YOUTUBE_COMMAND');
function registerYoutube(editor) {
  return editor.registerCommand(INSERT_YOUTUBE_COMMAND$1, payload => {
    const youTubeNode = $createYouTubeNode(payload);
    $insertNodeToNearestRoot(youTubeNode);
    return true;
  }, COMMAND_PRIORITY_EDITOR);
}

const HORIZONTAL_RULE_VERSION = 1;
const clampWidth$1 = num => Math.min(Math.max(1, num), 10);
class HorizontalRuleNode extends DecoratorBlockNode {
  __version = HORIZONTAL_RULE_VERSION;
  constructor(styleObj, key, format) {
    super(format, key);
    if (styleObj) {
      if (VALID_HEX_REGEX.test(String(styleObj.color))) {
        this.__color = styleObj.color;
      } else this.__color = 'var(--divider)';
      this.__width = clampWidth$1(styleObj.width);
    } else {
      this.__color = 'var(--divider)';
      this.__width = 1;
    }
  }
  static clone(node) {
    return new HorizontalRuleNode({
      color: node.getColor(),
      width: node.getWidth()
    });
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
  getTextContent() {
    return '\n-----\n';
  }
  setFormat(format) {
    const self = this.getWritable();
    self.__format = 'center';
  }
  getHorizontalRuleStyle() {
    const self = this.getLatest();
    return {
      color: self.__color,
      width: self.__width
    };
  }
  setHorizontalRuleStyle({
    color,
    width
  }) {
    const self = this.getWritable();
    self.__color = VALID_HEX_REGEX.test(color) ? color : 'var(--divider)';
    self.__width = clampWidth$1(width);
    return self;
  }
  static importJSON(serializedNode) {
    const node = $createHorizontalRuleNode({
      color: serializedNode.color,
      width: serializedNode.width
    });
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: HORIZONTAL_RULE_VERSION,
      color: this.getColor(),
      width: this.getWidth()
    };
  }
  exportDOM() {
    const element = createHorizontalRule(this.getHorizontalRuleStyle());
    element.setAttribute('data-color', this.__color);
    element.setAttribute('data-width', this.__width.toString());
    element.setAttribute('data-v', String(HORIZONTAL_RULE_VERSION));
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      hr: domNode => {
        return {
          conversion: convertHorizontalRuleElement,
          priority: 1
        };
      }
    };
  }
  decorate(editor, config) {
    const el = createHorizontalRule(this.getHorizontalRuleStyle());
    const element = editor.getElementByKey(this.__key);
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    if (element) {
      if (element.children.length === 0) {
        element.append(el);
      } else {
        element.style.borderBottomWidth = String(this.__width).concat('px');
        if (this.__color === "var(--divider)") {
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
function createHorizontalRule(styleObj) {
  const hr = document.createElement('hr');
  hr.classList.add('lexical');
  var cssString = "border-bottom-width: ".concat(String(styleObj.width)).concat('px !important;');
  if (styleObj.color === "var(--divider)" || !!!styleObj.color) {
    hr.style.removeProperty('border-bottom-color');
    hr.classList.add('divider-color');
  } else if (VALID_HEX_REGEX.test(styleObj.color)) {
    hr.classList.remove('divider-color');
    cssString += `border-bottom-color: ${styleObj.color} !important;`;
  }
  hr.style.cssText = cssString;
  return hr;
}
function convertHorizontalRuleElement(domNode) {
  var color = domNode.getAttribute('data-color') || '';
  var width = parseInt(domNode.getAttribute('data-width') || '');
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (!!!VALID_HEX_REGEX.test(color)) color = 'var(--divider)';
  if (isNaN(width) || width < 1 || width > 10) width = 1;
  const node = $createHorizontalRuleNode({
    color,
    width
  });
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return {
    node
  };
}
function $createHorizontalRuleNode(styleObj) {
  return new HorizontalRuleNode(styleObj);
}
function $isHorizontalRuleNode(node) {
  return node instanceof HorizontalRuleNode;
}
const INSERT_HORIZONTAL_RULE_COMMAND$1 = createCommand('INSERT_HORIZONTAL_RULE_COMMAND');
const FORMAT_HORIZONTAL_RULE_COMMAND$1 = createCommand('FORMAT_HORIZONTAL_RULE_COMMAND');
function registerHorizontalRule(editor) {
  return mergeRegister(editor.registerCommand(INSERT_HORIZONTAL_RULE_COMMAND$1, payload => {
    const horizontalRuleNode = $createHorizontalRuleNode({
      color: String(payload.color),
      width: payload.width
    });
    $insertNodeToNearestRoot(horizontalRuleNode);
    return true;
  }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(FORMAT_HORIZONTAL_RULE_COMMAND$1, payload => {
    const color = VALID_HEX_REGEX.test(String(payload.color)) ? String(payload.color) : 'var(--divider)';
    const width = clampWidth$1(payload.width);
    const selection = $getSelection();
    if ($isNodeSelection(selection) || $isRangeSelection(selection)) {
      const nodes = selection.getNodes();
      for (let node of nodes) {
        if ($isHorizontalRuleNode(node)) {
          node.setHorizontalRuleStyle({
            color,
            width
          });
        }
      }
    }
    return true;
  }, COMMAND_PRIORITY_EDITOR));
}

const CURRENT_VERSION$9 = 1;
class AudioNode extends DecoratorBlockNode {
  __version = CURRENT_VERSION$9;
  __text = undefined;
  constructor(obj, key, format) {
    super(format, key);
    this.__src = obj.src;
    this.__title = obj.title;
    this.__text = obj.text;
  }
  static getType() {
    return 'audio-node';
  }
  static clone(node) {
    return new AudioNode({
      src: node.getSrc(),
      title: node.getTitle()
    });
  }
  getTitle() {
    const self = this.getLatest();
    return self.__title;
  }
  setTitle(s) {
    const self = this.getWritable();
    self.__title = s;
    return self;
  }
  getSrc() {
    const self = this.getLatest();
    return self.__src;
  }
  setSrc(s) {
    const self = this.getWritable();
    if (s.startsWith('https://audio.storething.org/')) {
      self.__src = s;
    }
  }
  getText() {
    const self = this.getLatest();
    return self.__text;
  }
  setText(s) {
    const self = this.getWritable();
    self.__text = s;
    return s;
  }
  getTextContent() {
    const self = this.getLatest();
    const title = self.getTitle();
    const text = self.getText();
    const src = self.getSrc();
    var ret = `[Audio](${src})\nTitle: ${title}\nTranscription: ${text ? `"""${text}"""` : 'N/A'}`;
    return ret;
  }
  setFormat(_) {
    const self = this.getWritable();
    self.__format = "left";
  }
  static importJSON(serializedNode) {
    const node = $createAudioNode({
      src: serializedNode.src,
      title: serializedNode.title
    });
    node.setFormat(serializedNode.format);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'audio-node',
      version: 1,
      src: this.getSrc(),
      title: this.getTitle(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM() {
    const element = document.createElement('audio');
    element.setAttribute('data-src', this.getSrc());
    element.setAttribute('data-title', this.getTitle());
    element.setAttribute('data-v', String(CURRENT_VERSION$9));
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      audio: domNode => {
        return {
          conversion: convertAudioElement,
          priority: 1
        };
      }
    };
  }
  updateDOM() {
    return false;
  }
  decorate(editor, config) {
    const html = getAudioHTML(this.getSrc(), String(this.getTitle()));
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        element.insertAdjacentHTML("afterbegin", html);
      }
    }
    const audio = document.createElement('audio');
    audio.setAttribute('src', this.getSrc());
    audio.setAttribute('data-title', this.getTitle());
    return audio;
  }
}
function convertAudioElement(domNode) {
  const src = domNode.getAttribute('src') || domNode.getAttribute('data-src');
  const title = domNode.getAttribute('data-title');
  const node = $createAudioNode({
    src: src || 'https://audio.storething.org/frankmbrown/default-audio.mp3',
    title: title || 'No Title Added'
  });
  const first_element = domNode.classList.contains('first-rte-element');
  node.setFirstElement(first_element);
  const last_element = domNode.classList.contains('last-rte-element');
  node.setLastElement(last_element);
  return {
    node
  };
}
const AUDIO_EXTENSIONS = [{
  audioCodec: 'aac',
  extension: 'mp4',
  type: 'audio/mp4'
}, {
  audioCodec: 'flac',
  extension: 'flac',
  type: 'audio/flac'
}, {
  audioCodec: 'opus',
  extension: 'webm',
  type: 'audio/mp3'
}];
/**
 * Given the original file name, get the srcs for that media recording (get all the keys of the same recording that are stored in s3 - including the transcoded media keys)
 * @param src The original file element
 * @returns an array of src and types - the order in which the <source> elements should be sorted in the <video> or <audio> element
 */
function getAudioSourcesFromOriginalFilename(src) {
  const ret = [];
  const srcString = src.replace('https://audio.storething.org/frankmbrown/', '');
  const name = srcString.slice(0, srcString.lastIndexOf('.'));
  const fileType = srcString.slice(srcString.lastIndexOf('.') + 1);
  for (let obj of AUDIO_EXTENSIONS) {
    ret.push({
      src: `https://audio.storething.org/frankmbrown/${name}.${obj.audioCodec}.${obj.extension}`,
      type: obj.type
    });
  }
  ret.push({
    src,
    type: `audio/${fileType}`
  });
  return {
    audioSources: ret,
    name,
    key: srcString
  };
}

/**
 * Get the inputs for the audio input. 
 * @param src 
 * @returns 
 */
function getAudioHTML(src, defaultAudio) {
  const desktop = !!!isTouchDevice();
  const input_number = 'iN_' + window.crypto.randomUUID();
  const audioInputId = 'audio-input-src-'.concat(input_number);
  const audioTitleId = 'audio-input-title-'.concat(input_number);
  const randomId1 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId2 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId3 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId4 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId5 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId6 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId7 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  var audioSrcInput;
  if (!!!defaultAudio) {
    audioSrcInput = document.createElement('input');
    audioSrcInput.setAttribute('type', 'text');
    audioSrcInput.setAttribute('hidden', '');
    audioSrcInput.setAttribute('name', audioInputId);
    audioSrcInput.setAttribute('id', audioInputId);
    audioSrcInput.setAttribute('value', String(src));
  } else {
    if (typeof defaultAudio === 'boolean') {
      audioSrcInput = document.createElement('p');
      audioSrcInput.classList.add('body1', 'bold');
      audioSrcInput.innerText = "Placeholder Audio Title";
    } else if (typeof defaultAudio === 'string') {
      audioSrcInput = document.createElement('p');
      audioSrcInput.classList.add('body1', 'bold');
      audioSrcInput.innerText = defaultAudio;
    } else {
      audioSrcInput = document.createElement('p');
    }
  }
  const audioEl = document.createElement('audio');
  audioEl.setAttribute('controls', '');
  audioEl.setAttribute('hidden', '');
  audioEl.setAttribute('data-resume', 'false');
  audioEl.setAttribute('data-play-through', 'true');
  audioEl.setAttribute('data-src', src);
  audioEl.setAttribute('preload', 'metadata');
  if (typeof defaultAudio === 'boolean' && defaultAudio === true) {
    const source = document.createElement('source');
    source.setAttribute('src', src);
    audioEl.append(source);
  } else {
    const {
      audioSources,
      key,
      name
    } = getAudioSourcesFromOriginalFilename(src);
    const track = document.createElement('track');
    track.setAttribute('default', '');
    track.setAttribute('kind', 'captions'); // maybe subtitles
    track.setAttribute('src', `/vtt/audio/${name}`);
    track.setAttribute('srclang', 'en');
    audioEl.append(track);
    for (let source of audioSources) {
      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', source.src);
      sourceEl.setAttribute('type', source.type);
      audioEl.append(sourceEl);
    }
  }
  const useTooltips = Boolean(!!!isTouchDevice());
  return (/*html*/`
  <div class="audio mt-3" data-audio-wrapper style="margin: 10px 0px;">
    ${audioEl.outerHTML}
    <div class="audio-header align-center gap-2" style="margin-bottom: 4px;">
      ${audioSrcInput.outerHTML}
      ${Boolean(defaultAudio) ? '' : /*html*/`
      <div class="input-group grow-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
        <label for="${audioTitleId}" class="caption bold">Audio Title*:</label>
        <div class="text-input block medium">
            <input 
            type="text" 
            autocomplete="off" 
            name="${audioTitleId}" 
            id="${audioTitleId}" 
            class="medium icon-before mt-1" 
            required
            placeholder="Enter the Audio Title..." 
            maxlength="50"
            minlength="1" 
            spellcheck="false" 
            autocapitalize="off"
            >
            <svg class="icon-before"  focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
        </div>
      </div>
      `}
      <div class="audio-time-left">
        <span data-ellapsed="">0:00</span>
        /
        <span data-remaining="">0:00</span>
      </div>
    </div>
    <p data-error-text class="caption w-100 t-error" hidden>There was an error loading this audio file. Try reloading the page.</p>
    <p data-warn-text class="caption w-100 t-warning" hidden>There was an error loading the rest of the audio file. Try reloading the page.</p>
    <div class="flex-row justify-start align-center">
      <div class="flex-row align-center justify-center grow-0" data-main-controls>
        <button data-play data-type="audio" class="icon large" type="button" aria-label="Play Audio">
          <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
        </button>
        <button data-pause data-type="audio" hidden class="icon large" type="button" aria-label="Pause Audio">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
        </button>
        <button data-replay data-type="audio" hidden class="icon large" type="button" aria-label="Replay Audio">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>                  
        </button>
        <div data-load data-type="audio" hidden class="t-tsecondary">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
        <svg data-error hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report">
          <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z">
          </path>
        </svg>
      </div>
      <input data-time data-type="audio" id="${randomId1}" name="${randomId1}" type="range" value="0" min="0" max="29" data-time-set="true" step="1" style="background-size: 0% 100%;">
      <output hidden for="${randomId1}">0</output>
    </div>
    <div class="flex-row align-center justify-start gap-2" style="max-width: 100%;">
      <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId2}" aria-describedby="${randomId2}"` : ``}>
        <button data-mute-button data-type="audio" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
          <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
          <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
          <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
        </button>
      </div>
      ${desktop ? /*html*/`
      <input data-sound data-type="audio" type="range" value="100" min="0" max="100" class="small primary" id="${randomId4}" name="${randomId4}" style="background-size: 100% 100%;">
      <output hidden for="${randomId4}">100</output>
      ` : /*html*/`<div class="grow-1"></div>`}

      <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse` : ``}>
        <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
      </button>
      <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId3}" aria-describedby="${randomId3}"` : ``}>
        <div class="select" aria-label="Sound Playback Speed Select">
          <button  ${Boolean(desktop) ? '' : 'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId5}" aria-controls="${randomId5}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
          </button>
          <div ${Boolean(desktop) ? '' : 'data-click-capture'} tabindex="0" id="${randomId5}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="bottom">
            <input data-playback data-type="audio" type="text" hidden value="1" name="${randomId6}" id="${randomId6}">
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
              0.25
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
              0.5
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
              0.75
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
              1
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
              1.25
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
              1.5
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
              1.75
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
              2
            </button>
          </div>
  
        </div>
      </div>
      ${useTooltips ? /*html*/`
      <div data-placement="left-start" class="tooltip caption" id="${randomId3}" role="tooltip"> 
        Playback Speed
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
        Mute / Unmute Audio
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
        Closed Captioning
      </div>
      ` : ``}
    </div>
  </div>`
  );
}
function $createAudioNode(obj) {
  return new AudioNode(obj);
}
function $isAudioNode(node) {
  return node instanceof AudioNode;
}
const INSERT_AUDIO_NODE$1 = createCommand('INSERT_AUDIO_NODE');
const INSERT_AUDIO_NODES = createCommand('INSERT_AUDIO_NODES');

const MAX_VIDEO_HEIGHT = 400;
const MIN_VIDEO_HEIGHT = 100;
const CURRENT_VERSION$8 = 1;
class VideoNode extends DecoratorBlockNode {
  __version = CURRENT_VERSION$8;
  __text = undefined;
  constructor(obj, key, format) {
    super(format, key);
    this.__src = obj.src;
    this.__title = obj.title;
    this.__description = obj.description;
    if (obj.height) {
      this.__height = Math.min(Math.max(MIN_VIDEO_HEIGHT, obj.height), MAX_VIDEO_HEIGHT);
    } else {
      this.__height = MAX_VIDEO_HEIGHT;
    }
    if (obj.width) this.__width = obj.width;
  }
  static getType() {
    return 'video-node';
  }
  static clone(node) {
    return new VideoNode({
      src: node.getSrc(),
      title: node.getTitle(),
      description: node.getDescription(),
      height: node.getHeight(),
      text: node.getText(),
      width: node.getWidth()
    });
  }
  getDescription() {
    const self = this.getLatest();
    return self.__description;
  }
  setDescription(d) {
    const self = this.getWritable();
    self.__description = d;
    return self;
  }
  getTitle() {
    const self = this.getLatest();
    return self.__title;
  }
  setTitle(s) {
    const self = this.getWritable();
    self.__title = s;
    return self;
  }
  getSrc() {
    const self = this.getLatest();
    return self.__src;
  }
  setSrc(s) {
    const self = this.getWritable();
    if (s.startsWith('https://video.storething.org/')) {
      self.__src = s;
    }
  }
  setFormat(_) {
    const self = this.getWritable();
    self.__format = "left";
  }
  getHeight() {
    const self = this.getLatest();
    return self.__height;
  }
  setHeight(n) {
    const self = this.getWritable();
    self.__height = Math.max(Math.min(MAX_VIDEO_HEIGHT, n), MIN_VIDEO_HEIGHT);
  }
  getWidth() {
    const self = this.getLatest();
    return self.__width;
  }
  setWidth(w) {
    const self = this.getWritable();
    self.__width = w;
    return self;
  }
  getText() {
    const latest = this.getLatest();
    return latest.__test;
  }
  setText(s) {
    const self = this.getWritable();
    self.__text = s;
    return self;
  }
  getTextContent() {
    const latest = this.getLatest();
    const title = latest.getTitle();
    const desciption = latest.getDescription();
    const text = latest.getText();
    const src = latest.getSrc();
    var ret = `[Video](${src})\nTitle: ${title}\nDescription: ${desciption}\nTranscription: ${text ? `"""${text}"""` : 'N/A'}`;
    return ret;
  }
  static importJSON(serializedNode) {
    const node = $createVideoNode({
      src: serializedNode.src,
      title: serializedNode.title,
      description: serializedNode.description,
      height: serializedNode.height,
      text: serializedNode.text,
      width: serializedNode.width
    });
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'video-node',
      version: CURRENT_VERSION$8,
      src: this.getSrc(),
      title: this.getTitle(),
      description: this.getDescription(),
      height: this.getHeight(),
      text: this.getText(),
      width: this.getWidth(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM() {
    const element = document.createElement('video');
    element.setAttribute('data-src', this.getSrc());
    element.setAttribute('data-title', this.getTitle());
    element.setAttribute('data-description', this.getDescription());
    const height = this.getHeight();
    if (height) {
      element.setAttribute('height', String(height));
    } else {
      element.setAttribute('height', '400');
    }
    element.setAttribute('data-width', 'width');
    element.setAttribute("data-v", String(CURRENT_VERSION$8));
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      video: domNode => {
        return {
          conversion: convertVideoElement,
          priority: 2
        };
      }
    };
  }
  updateDOM() {
    return false;
  }
  decorate(editor, config) {
    const html = getVideoHTML(this.getSrc(), {
      title: this.getTitle(),
      description: this.getDescription()
    }, String(this.getHeight() || 400));
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        element.insertAdjacentHTML("afterbegin", html);
      }
    }
    const video = document.createElement('video');
    video.setAttribute('src', this.getSrc());
    video.setAttribute('data-title', this.getTitle());
    return video;
  }
}
function convertVideoElement(domNode) {
  const src = domNode.getAttribute('src') || domNode.getAttribute('data-src');
  const title = domNode.getAttribute('data-title');
  const description = domNode.getAttribute('data-description');
  const heightStr = domNode.getAttribute('height');
  const height = heightStr && Number.isInteger(parseInt(heightStr)) ? parseInt(heightStr) : 400;
  const widthStr = domNode.getAttribute('data-width');
  const width = widthStr && Number.isInteger(parseInt(widthStr)) ? parseInt(widthStr) : undefined;
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  const node = $createVideoNode({
    src: src || 'https://video.storething.org/frankmbrown/default-video.mp4',
    title: title || 'No Title Added',
    description: description || '',
    height,
    width
  });
  node.setFirstElement(first_element);
  node.setLastElement(last_element);
  return {
    node
  };
}
const VIDEO_EXTENSIONS = [{
  videoCodec: 'libvpx',
  extension: 'webm',
  type: 'video/webm'
}, {
  videoCodec: 'libx264',
  extension: 'mp4',
  type: 'video/mp4'
}];
/**
 * Given the original file name, get the srcs for that media recording (get all the keys of the same recording that are stored in s3 - including the transcoded media keys)
 * @param src The original file element
 * @returns an array of src and types - the order in which the <source> elements should be sorted in the <video> or <audio> element
 */
function getVideoSourcesFromOriginalFileName(src) {
  const ret = [];
  const srcString = src.replace('https://video.storething.org/frankmbrown/', '');
  const name = srcString.slice(0, srcString.lastIndexOf('.'));
  const fileType = srcString.slice(srcString.lastIndexOf('.') + 1);
  for (let obj of VIDEO_EXTENSIONS) {
    ret.push({
      src: `https://video.storething.org/frankmbrown/${name}.${obj.videoCodec}.${obj.extension}`,
      type: obj.type
    });
  }
  ret.push({
    src,
    type: `video/${fileType}`
  });
  return {
    videoSources: ret,
    name,
    key: srcString
  };
}
function getVideoHTML(src, defaultVideo, height) {
  const desktop = !!!isTouchDevice();
  const input_number = 'iN_' + window.crypto.randomUUID();
  const videoInputId = 'video-input-src-'.concat(input_number);
  const videoTitleId = 'video-input-title-'.concat(input_number);
  const videoDescriptionId = 'video-input-description-'.concat(input_number);
  const randomId1 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId2 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId3 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId4 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId5 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId6 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId7 = 'video_rand_id_'.concat(window.crypto.randomUUID());
  const videoEl = document.createElement('video');
  videoEl.setAttribute('data-play-through', 'true');
  videoEl.setAttribute('playsinline', '');
  videoEl.setAttribute('webkit-playsinline', '');
  videoEl.setAttribute('data-src', src);
  videoEl.setAttribute('preload', 'metadata');
  if (height) {
    videoEl.setAttribute('height', String(height));
    videoEl.setAttribute('data-height', String(height));
  }
  if (typeof defaultVideo === 'boolean' && defaultVideo === true) {
    const source = document.createElement('source');
    source.setAttribute('src', src);
    videoEl.append(source);
  } else {
    const {
      videoSources,
      key,
      name
    } = getVideoSourcesFromOriginalFileName(src);
    videoEl.setAttribute('poster', `https://image.storething.org/frankmbrown/${name}-thumbnail.png`); // thumbnail image
    const track = document.createElement('track');
    track.setAttribute('default', '');
    track.setAttribute('kind', 'captions'); // maybe subtitles
    track.setAttribute('src', `/vtt/video/${name}`);
    track.setAttribute('srclang', 'en');
    videoEl.append(track);
    for (let source of videoSources) {
      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', source.src);
      sourceEl.setAttribute('type', source.type);
      videoEl.append(sourceEl);
    }
  }
  const videoInput = document.createElement('input');
  videoInput.setAttribute('value', src);
  videoInput.setAttribute('hidden', '');
  videoInput.setAttribute('type', 'text');
  videoInput.setAttribute('id', videoInputId);
  videoInput.setAttribute('name', videoInputId);
  var defaultImageText = '';
  if (typeof defaultVideo !== 'boolean' && defaultVideo !== undefined) {
    const div = document.createElement('div');
    div.className = "video-info";
    const title = document.createElement('p');
    title.className = "bold h4";
    title.innerText = defaultVideo.title;
    const description = document.createElement('p');
    description.className = "body1";
    description.innerText = defaultVideo.description;
    div.append(title, description);
    defaultImageText = div.outerHTML;
  }
  const useTooltips = Boolean(!!!isTouchDevice());
  return (/*html*/`<div class="video-wrapper" data-video-wrapper style="margin: 10px 0px;">
  <div class="video" data-fullscreen="false" data-focus="false" data-hover="false">
    ${videoEl.outerHTML}
    <div class="video-controls">
      <div class="block">
        <input data-time data-type="video" type="range" id="${randomId1}" name="${randomId1}" class="video small primary" min="0" value="0" max="422" data-time-set="true" step="1" style="background-size: 0% 100%;">
      </div>
      <div class="flex-row justify-begin align-center gap-2 p-sm" style="padding-top:0px;" data-row-2>
        <div class="flex-row align-center justify-center grow-0" data-main-controls>
          <button data-play data-type="video" class="icon large" type="button" aria-label="Play Audio">
            <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
          </button>
          <button data-pause data-type="video" hidden class="icon large" type="button" aria-label="Pause Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
          </button>
          <button data-replay data-type="video" hidden class="icon large" type="button" aria-label="Replay Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>                  
          </button>
          <div data-load data-type="video" hidden class="t-tsecondary">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </div>
          <svg data-error data-type="video" hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
        </div>
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId2}" aria-describedby="${randomId2}"` : ``}>
          <button data-mute-button data-type="video" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
            <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
            <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
            <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
          </button>
        </div>
        ${useTooltips ? /*html*/`
        <input class="small secondary" data-sound data-type="video" id="${randomId3}" name="${randomId3}" type="range" value="100" min="0" max="100" step="1" style="background-size: 100% 100%;">
        <output for="${randomId3}" hidden>100</output>
        ` : `<div class="grow-1"></div>`}
        <div class="video-time-left">
          <span data-ellapsed>0:00</span>
          /
          <span data-remaining>0:00</span>
        </div>
        <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse` : ``}>
          <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
          <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        </button>
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId6}" aria-describedby="${randomId6}"` : ``}>
          <div class="select" aria-label="Sound Playback Speed Select">
            <button ${Boolean(desktop) ? '' : 'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId4}" aria-controls="${randomId4}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
            </button>
            <div ${Boolean(desktop) ? '' : 'data-click-capture'} tabindex="0" id="${randomId4}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="top">
              <input data-playback data-type="video" type="text" hidden value="1" name="${randomId5}" id="${randomId5}">
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
                0.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
                0.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
                0.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
                1
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
                1.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
                1.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
                1.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
                2
              </button>
            </div>
            ${useTooltips ? /*html*/`
            <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
              Mute / Unmute Audio
            </div>
            <div data-placement="left-start" class="tooltip caption" id="${randomId6}" role="tooltip">
              Playback Speed
            </div>
            <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
              Closed Captions
            </div>
            ` : ``}
          </div>
        </div>
        <button class="icon medium" data-fullscreen type="button">
          <svg data-type="fullscreen" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenSharp"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
          <svg data-type="no-fullscreen" hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenExit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
        </button>
      </div>
    </div>
  </div>
  ${defaultVideo ? defaultImageText : /*html*/`
  <div class="video-info">
    ${videoInput.outerHTML}
    <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
      <label for="${videoTitleId}" class="caption bold">Video Title*:</label>
      <div class="text-input block medium">
          <input 
          type="text" 
          name="${videoTitleId}" 
          id="${videoTitleId}" 
          class="medium icon-before mt-1" 
          required
          placeholder="Enter Video Title..." 
          maxlength="50"
          minlength="1" 
          spellcheck="false" 
          autocapitalize="off"
          autocomplete="off"
          >
          <svg class="icon-before"  focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
          <!-- Buttons and SVGs -->
      </div>
    </div>
    <div class="input-group block mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
      <label for="${videoDescriptionId}" class="caption bold">Video Description:</label>
      <div class="mt-1 text-input block medium disabled">
          <textarea 
          name="${videoDescriptionId}" 
          id="${videoDescriptionId}" 
          placeholder="Enter a description of the video..." 
          rows="5" 
          maxlength="200" 
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          style=""
          ></textarea>
      </div>
      <p class="char-counter" data-input="${videoDescriptionId}">
          <span class="max-counter body2" data-val="200" aria-hidden="false">Characters Remaining</span>
      </p>
    </div>
  </div>
  `}
</div>`
  );
}
function $createVideoNode(obj) {
  return new VideoNode(obj);
}
function $isVideoNode(node) {
  return node instanceof VideoNode;
}

/**
 * @todo Will need to change audio and video validation
 */
const SCROLL_INTO_VIEW_OPTIONS = {
  ...SCROLL_INTO_VIEW_OPTIONS$1,
  block: "end"
};

/*---------------------------------------------------- Variables -------------------------------------------*/
/**
 * undefined or an array of node keys
 */
var SELECTED_DECORATORS = undefined;
/**
 * The currently selected image
 */
var SELECTED_IMAGE = undefined;

/* --------------------------------------------------------- Commands ------------------------------------------------ */
const INSERT_AUDIO_NODE = createCommand('INSERT_AUDIO_NODE');
const INSERT_HORIZONTAL_RULE_COMMAND = createCommand('INSERT_HORIZONTAL_RULE_COMMAND');
const FORMAT_HORIZONTAL_RULE_COMMAND = createCommand('FORMAT_HORIZONTAL_RULE_COMMAND');
const INSERT_IMAGE_COMMAND$1 = createCommand('INSERT_IMAGE_COMMAND');
const INSERT_IMAGES_COMMAND$1 = createCommand('INSERT_IMAGES_COMMAND');
const INSERT_NEWS_NODE = createCommand('INSERT_NEWS_NODE');
const INSERT_VIDEO_NODE = createCommand('INSERT_VIDEO_NODE');
const INSERT_YOUTUBE_COMMAND = createCommand('INSERT_YOUTUBE_COMMAND');
const CAROUSEL_CLICK = createCommand('CAROUSEL_CLICK');
/*------------------------------------------------------ Helpers ------------------------------------------- */
const clampWidth = num => Math.min(Math.max(1, num), 10);
/**
 * Get all the decorator block nodes on the editor and remove the `selected-decorator-block` from them
 * @param editor 
 */
function clearSelectedDecorators(editor) {
  const decorators = editor.getDecorators();
  const rootElement = editor.getRootElement();
  if (decorators && rootElement) {
    Object.keys(decorators).forEach(key => {
      const queryStr = 'div[data-node-key="'.concat(String(key)).concat('"]');
      const blockElement = rootElement.querySelector(queryStr);
      if (blockElement) blockElement.classList.remove('selected-decorator-block');
    });
  }
  SELECTED_DECORATORS = undefined;
}
/**
 * Based on **SELECTED_DECORATORS**, get the block elements with alignable contents and add the `selected-decorator-block` to the elementx
 * @param editor 
 */
function setSelectedDecorators(editor) {
  const rootElement = editor.getRootElement();
  const typesSet = new Set();
  if (Array.isArray(SELECTED_DECORATORS) && rootElement) {
    SELECTED_DECORATORS.forEach(key => {
      const queryStr = 'div[data-node-key="'.concat(String(key)).concat('"]');
      const blockElement = rootElement.querySelector(queryStr);
      const node = $getNodeByKey(key);
      if (blockElement && !!!(node?.getType() === "math" && node.getEditable())) blockElement.classList.add('selected-decorator-block');
      if (node) typesSet.add(node.getType());
    });
  }
  return typesSet;
}
function clearInnerHTML(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

/*-------------------------------------- Image Stuff -------------------------------*/
var CURRENT_IMAGE_BG_EDIT = undefined;
var USER_SELECT_CURRENT = {
  priority: '',
  value: 'default'
};
/**
 * Keep track of the current resize image state
 */
var IMAGE_RESIZE_STATE = undefined;
function onImageResizerMove(e) {
  const IS_POINTER_EVENT = e instanceof MouseEvent;
  const clientX = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
  const clientY = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
  if (SELECTED_IMAGE && IMAGE_RESIZE_STATE && !!!isNaN(clientX) && !!!isNaN(clientY)) {
    const dir = IMAGE_RESIZE_STATE.direction;
    if (dir === 'n' || dir === 's') {
      const COEFFICIENT = Boolean(dir === 'n') ? -1 : 1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startY - clientY);
      const height = Math.max(Math.min(GET_MAX_IMAGE_HEIGHT(IMAGE_RESIZE_STATE.editorType), IMAGE_RESIZE_STATE.startHeight - COEFFICIENT * diff), MIN_IMAGE_DIMENSION);
      SELECTED_IMAGE.style.height = `${height}px`;
      IMAGE_RESIZE_STATE.currentHeight = height;
    } else if (dir === 'w' || dir === 'e') {
      const COEFFICIENT = Boolean(dir === 'w') ? -1 : 1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startX - clientX);
      const width = Math.max(Math.min(GET_MAX_IMAGE_WIDTH(IMAGE_RESIZE_STATE.editorType), IMAGE_RESIZE_STATE.startWidth - COEFFICIENT * diff), MIN_IMAGE_DIMENSION);
      SELECTED_IMAGE.style.width = `${width}px`;
      IMAGE_RESIZE_STATE.currentWidth = width;
    } else {
      const COEFFICIENT = Boolean(dir === 'nw' || dir === 'sw') ? -1 : 1;
      let diff = Math.floor(IMAGE_RESIZE_STATE.startX - clientX);
      const width = Math.max(Math.min(GET_MAX_IMAGE_WIDTH(IMAGE_RESIZE_STATE.editorType), IMAGE_RESIZE_STATE.startWidth - COEFFICIENT * diff), MIN_IMAGE_DIMENSION);
      const height = width / IMAGE_RESIZE_STATE.ratio;
      SELECTED_IMAGE.style.width = `${width}px`;
      SELECTED_IMAGE.style.height = `${height}px`;
      IMAGE_RESIZE_STATE.currentWidth = width;
      IMAGE_RESIZE_STATE.currentHeight = height;
    }
  }
}
function onImageResizeEnd() {
  const editor = getCurrentEditor();
  if (SELECTED_IMAGE && IMAGE_RESIZE_STATE && editor) {
    const decorator = SELECTED_IMAGE.closest('span[data-frank-decorator="true"]');
    if (decorator) {
      const nodeKey = decorator.getAttribute('data-node-key');
      if (nodeKey) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if (node && $isImageNode(node)) {
            const cW = IMAGE_RESIZE_STATE.currentWidth;
            const cH = IMAGE_RESIZE_STATE.currentHeight;
            IMAGE_RESIZE_STATE.editorType = editor._editorType;
            if (typeof cW === 'number' && typeof cH === 'number') {
              const width = Math.round(cW);
              const height = Math.round(cH);
              if (SELECTED_IMAGE) SELECTED_IMAGE.style.removeProperty('height');
              node.setWidth(Number(width.toFixed(2)));
              node.setHeight(Number(height.toFixed(2)));
              node.setOriginalDevice(getDeviceType());
            }
          }
        });
        const controlWrapper = SELECTED_IMAGE.nextElementSibling;
        if (controlWrapper) controlWrapper.classList.remove('image-control-wrapper--resizing');
        const rootElement = editor.getRootElement();
        if (rootElement) {
          rootElement.style.setProperty('cursor', 'text');
          document.body.style.setProperty('cursor', 'default');
          document.body.style.setProperty('-webkit-user-select', USER_SELECT_CURRENT.value, USER_SELECT_CURRENT.priority);
        }
        IMAGE_RESIZE_STATE = undefined;
      }
    }
  }
  if (!!!isTouchDevice()) {
    document.removeEventListener('mousemove', onImageResizerMove);
    document.removeEventListener('mouseup', onImageResizeEnd);
  } else {
    document.addEventListener('touchmove', onImageResizerMove);
    document.addEventListener('touchend', onImageResizeEnd);
  }
}

/**
 * Called when when of the square blocks around the image is clicked
 */
function onImageResizeStart(e) {
  const IS_POINTER_EVENT = e instanceof MouseEvent;
  const x = IS_POINTER_EVENT ? e.clientX : e.touches[0].clientX;
  const y = IS_POINTER_EVENT ? e.clientY : e.touches[0].clientY;
  const dir = this.getAttribute('data-dir');
  const editor = getCurrentEditor();
  const controlWrapper = this.parentElement;
  if (SELECTED_IMAGE && editor && controlWrapper && dir && !!!isNaN(x) && !!!isNaN(y)) {
    e.preventDefault();
    const rootElement = editor.getRootElement();
    if (rootElement) {
      if (dir === 'e' || dir === 'w') {
        rootElement.style.setProperty('cursor', 'ew-resize', 'important');
        document.body.style.setProperty('cursor', 'ew-resize', 'important');
      } else if (dir === 'n' || dir === 's') {
        rootElement.style.setProperty('cursor', 'ns-resize', 'important');
        document.body.style.setProperty('cursor', 'ns-resize', 'important');
      } else if (dir === 'ne' || dir === 'sw') {
        rootElement.style.setProperty('cursor', 'nesw-resize', 'important');
        document.body.style.setProperty('cursor', 'nesw-resize', 'important');
      } else if (dir === 'nw' || dir === 'se') {
        rootElement.style.setProperty('cursor', 'nwse-resize', 'important');
        document.body.style.setProperty('cursor', 'nwse-resize', 'important');
      }
      USER_SELECT_CURRENT.value = document.body.style.getPropertyValue('-webkit-user-select');
      USER_SELECT_CURRENT.priority = document.body.style.getPropertyPriority('-webkit-user-select');
      document.body.style.setProperty('-webkit-user-select', `none`, 'important');
      const {
        width,
        height
      } = SELECTED_IMAGE.getBoundingClientRect();
      const heightStyle = SELECTED_IMAGE.style.height;
      const widthStyle = SELECTED_IMAGE.style.width;
      IMAGE_RESIZE_STATE = {
        currentHeight: heightStyle ? height : 'auto',
        currentWidth: widthStyle ? width : 'auto',
        direction: dir,
        isResizing: true,
        ratio: width / height,
        startHeight: height,
        startWidth: width,
        startX: x,
        startY: y,
        editorType: editor._editorType
      };
      controlWrapper.classList.add('image-control-wrapper--resizing');
    }
  }
  if (!!!isNaN(x) && !!!isNaN(y)) {
    if (!!!isTouchDevice()) {
      document.addEventListener('mousemove', onImageResizerMove);
      document.addEventListener('mouseup', onImageResizeEnd);
    } else {
      document.addEventListener('touchmove', onImageResizerMove);
      document.addEventListener('touchend', onImageResizeEnd);
    }
  }
}
function onDeleteDecorators(editor, event) {
  const selection = $getSelection();
  var nodeToSelect = null;
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes();
    for (let node of nodes) {
      const closestToParent = $findMatchingParent(node, n => Boolean(n.getParent() && n.getParent()?.__type === 'root'));
      if (closestToParent) {
        const previousSiblings = closestToParent.getPreviousSiblings();
        const nextSiblings = closestToParent.getNextSiblings();
        var nodeToSelectTemp = null;
        for (let i = 0; i < Math.max(previousSiblings.length, nextSiblings.length); i++) {
          if (previousSiblings[i]) {
            if ($isElementNode(previousSiblings[i])) {
              nodeToSelectTemp = previousSiblings[i];
              break;
            }
          }
          if (nextSiblings[i]) {
            if ($isElementNode(nextSiblings[i])) {
              nodeToSelectTemp = nextSiblings[i];
              break;
            }
          }
        }
        if (nodeToSelectTemp) {
          nodeToSelect = nodeToSelectTemp;
          break;
        }
      }
    }
    if (selection.dirty === true) {
      return false;
    }
    event.preventDefault();
    nodes.forEach(node => {
      if (node && node.getType && node.getType() === "math" && node.getEditable() && node.getTextContent().length > 0) return;else if (node && node.getType && node.getType() === 'math' && node.getTextContent().length > 0) return;else if (node && node.getType && node.getType() === 'html') {
        const element = editor.getElementByKey(node.getKey());
        if (element) {
          const isEditingElement = element.querySelector('div[data-custom-code]');
          if (isEditingElement && isEditingElement.getAttribute('data-editing') === "false") {
            node.remove();
          } else {
            return;
          }
        }
      } else node.remove();
    });
    const root = $getRoot();
    const rangeSelection = $createRangeSelection();
    if (nodeToSelect) {
      rangeSelection.anchor.set(nodeToSelect.__key, 0, 'element');
      rangeSelection.anchor.set(nodeToSelect.__key, 0, 'element');
    } else {
      rangeSelection.anchor.set(root.__key, 0, "element");
      rangeSelection.focus.set(root.__key, 0, "element");
    }
    $setSelection(rangeSelection);
    return true;
  }
  return false;
}
/**
 * For the image that is currently selected, remove focus from it
 * @param img 
 */
function clearSelectedImage() {
  if (SELECTED_IMAGE) {
    SELECTED_IMAGE.nextElementSibling?.remove();
    SELECTED_IMAGE.classList.remove('focused', 'draggable');
    if (SELECTED_IMAGE.parentElement) SELECTED_IMAGE.parentElement.setAttribute('draggable', 'false');
  }
}
function onChangeImageBackgroundColorSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  if (CURRENT_IMAGE_BG_EDIT) {
    const dilaog = this.closest('div.dialog-wrapper');
    const colorInput = document.getElementById('image-bg-color-lex');
    const transparentInput = document.getElementById('image-bg-color-lex-transparent');
    const shortDescriptionEl = document.getElementById('img-short-description');
    const longDescriptionEl = document.getElementById('img-long-description');
    const editor = getEditorInstances()[CURRENT_IMAGE_BG_EDIT.editorNamespace];
    if (editor && colorInput && transparentInput && dilaog && shortDescriptionEl && longDescriptionEl) {
      const transparent = transparentInput.checked;
      const bgColor = colorInput.value;
      if (transparent || !!!VALID_HEX_REGEX.test(bgColor)) {
        editor.update(() => {
          const image = $getNodeByKey(String(CURRENT_IMAGE_BG_EDIT?.nodeKey));
          if ($isImageNode(image)) {
            image.setBackgroundColor(undefined);
            image.setShort(shortDescriptionEl.value);
            image.setLong(longDescriptionEl.value);
          }
          CURRENT_IMAGE_BG_EDIT = undefined;
          closeDialog(dilaog);
        });
      } else {
        editor.update(() => {
          const image = $getNodeByKey(String(CURRENT_IMAGE_BG_EDIT?.nodeKey));
          if ($isImageNode(image)) {
            image.setBackgroundColor(bgColor);
            image.setShort(shortDescriptionEl.value);
            image.setLong(longDescriptionEl.value);
          }
          CURRENT_IMAGE_BG_EDIT = undefined;
          closeDialog(dilaog);
        });
      }
    }
  }
}
function getOpenImageBackgroundColorDialog(key, editorNamespace, currentBgColor, shortDescription, longDescription) {
  const func = function () {
    CURRENT_IMAGE_BG_EDIT = {
      nodeKey: key,
      editorNamespace
    };
    const insertAfterDiv = document.getElementById('insert-after-lexical-layout');
    if (insertAfterDiv) {
      const str = GET_BACKGROUND_COLOR_DIALOG(getDefaultBackground());
      insertAfterDiv.insertAdjacentHTML("afterbegin", str);
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED', {
        detail: {
          el: insertAfterDiv
        }
      }));
      const dialog = document.getElementById('image-bg-color-dialog');
      const colorInput = document.getElementById('image-bg-color-lex');
      const transparentInput = document.getElementById('image-bg-color-lex-transparent');
      const shortDescriptionEl = document.getElementById('img-short-description');
      const longDescriptionEl = document.getElementById('img-long-description');
      const bgForm = document.getElementById('image-bg-color-form');
      if (bgForm) bgForm.addEventListener('submit', onChangeImageBackgroundColorSubmit);
      if (colorInput && transparentInput && shortDescriptionEl && longDescriptionEl) {
        if (currentBgColor === undefined || !!!VALID_HEX_REGEX.test(currentBgColor)) {
          colorInput.value = getDefaultBackground();
          transparentInput.checked = true;
          shortDescriptionEl.value = shortDescription;
          longDescriptionEl.value = longDescription;
        } else {
          colorInput.value = currentBgColor;
          transparentInput.checked = false;
          shortDescriptionEl.value = shortDescription;
          longDescriptionEl.value = longDescription;
        }
      }
      if (dialog) {
        document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
          detail: {
            dialog: dialog
          }
        }));
      }
    }
  };
  return func;
}

/* -------------------------------------------------------- Dialogs ------------------------------------------ */
/**
 * Function for getting the horizontal rule form 
 */
function getHorizontalRuleForm() {
  const dialog = document.getElementById("horizontal-rule-lexical");
  if (dialog) {
    const form = dialog.querySelector('form');
    const title = dialog.querySelector('p[data-title]');
    const checkbox = dialog.querySelector('input[type="checkbox"]');
    const color = dialog.querySelector('input[type="color"]');
    const width = dialog.querySelector('input[type="number"]');
    const example = dialog.querySelector('hr[data-example]');
    return {
      form,
      checkbox,
      title,
      color,
      width,
      example,
      dialog
    };
  } else return null;
}

/**
 * Show the section that allows the user to insert images, audio, and video files.
 * We had to include this because the pintura image editor does not behave correctly in a dialog 
 */
function handleShowInsertMediaSection(btn, type) {
  const wrapper = btn.closest('div.lexical-wrapper');
  if (wrapper) {
    const insertMediaSections = Array.from(wrapper.querySelectorAll('div[data-insert-media]'));
    var add = undefined;
    insertMediaSections.forEach(el => {
      if (el) {
        const dataType = el.getAttribute('data-type');
        if (type === dataType) {
          add = el;
        } else {
          el.setAttribute('hidden', '');
          el.className = "";
        }
      }
    });
    if (add) {
      add.removeAttribute('hidden');
      add.className = "block";
    }
  }
}
function handleInsertImageClick(e) {
  handleShowInsertMediaSection(this, "image");
}
function handleInsertAudioClick(e) {
  handleShowInsertMediaSection(this, "audio");
}
function handleInsertVideoClick(e) {
  handleShowInsertMediaSection(this, "video");
}
function closeInsertMediaSectionHelper(b, e) {
  const section = b.closest('div[data-insert-media]');
  if (section) {
    section.className = "";
    section.setAttribute('hidden', '');
    section.closest('div.lexical-wrapper');
    const error = section.querySelector('div[data-error]');
    if (error) error.setAttribute('hidden', '');
  }
}
function closeInsertMediaSection(e) {
  closeInsertMediaSectionHelper(this);
}
function openAudioVideoError(b) {
  const section = b.closest('div[data-form]');
  if (section) {
    const error = section.querySelector('div[data-error-alert]');
    if (error) error.removeAttribute('hidden');
  }
}
function handleInsertMediaSectionSubmit(e) {
  const form = this.closest('div[data-form]');
  const editor = getCurrentEditor();
  if (form && editor) {
    const afterInsertNode = () => {
      document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
        detail: {
          el: this
        }
      }));
    };
    const AFTER_INSERT_NODE_TIMEOUT = 100;
    const dataType = form.getAttribute('data-type');
    const dataCount = form.getAttribute('data-count');
    const fileInput = form.querySelector('input[type="file"]');
    if (!!!fileInput) return;
    const inputName = fileInput.getAttribute('name');
    if (!!!inputName) return;
    switch (dataType) {
      case 'image':
        const input = form.querySelector(`input[type="text"][name="${inputName}-text"]`);
        if (dataCount === "single" && input) {
          const imageUrl = input.value;
          if (!!!imageUrl.startsWith('https://image.storething.org/frankmbrown/')) return;
          const shortDescription = form.querySelector(`input[name="${inputName}-short-description"]`);
          const longDescription = form.querySelector(`textarea[name="${inputName}-long-description"]`);
          if (shortDescription && longDescription) {
            getImageWidthAndHeight(imageUrl).then(({
              width,
              height
            }) => {
              const imageObj = {
                src: imageUrl,
                short: shortDescription.value,
                long: longDescription.value,
                width,
                height
              };
              editor.dispatchCommand(INSERT_IMAGE_COMMAND$1, imageObj);
              resetInsertMediaSectionForm(this);
              closeInsertMediaSectionHelper(this);
              setTimeout(afterInsertNode, AFTER_INSERT_NODE_TIMEOUT);
            }).catch(error => {
              console.error(error);
            });
          }
        } else if (dataCount === "multiple" && input) {
          const multiImageType = form.querySelector('input[name="multi-image-type"]:checked');
          const imageUrls = input.value.split('|').filter(el => el.startsWith('https://image.storething.org/frankmbrown/'));
          const imagesToAdd = imageUrls.map(url => {
            const shortDescription = form.querySelector(`input[name="${url}-short-description"]`);
            const longDescription = form.querySelector(`textarea[name="${url}-long-description"]`);
            if (shortDescription && longDescription) {
              return {
                src: url,
                short: shortDescription.value,
                long: longDescription.value
              };
            }
            return null;
          }).filter(obj => obj !== null);
          if (imagesToAdd.length && multiImageType) {
            if (multiImageType.value === "carousel") {
              Promise.all(imagesToAdd.map(obj => getImageWidthAndHeight(obj.src))).then(arr => {
                const objArr = imagesToAdd.map((obj, i) => ({
                  ...obj,
                  width: arr[i].width,
                  height: arr[i].height
                }));
                editor.dispatchCommand(INSERT_CAROUSEL_COMMAND, objArr);
                resetInsertMediaSectionForm(this);
                closeInsertMediaSectionHelper(this);
                setTimeout(afterInsertNode, AFTER_INSERT_NODE_TIMEOUT);
              }).catch(e => {
                console.error(e);
              });
            } else if (multiImageType.value === "single") {
              Promise.all(imagesToAdd.map(obj => getImageWidthAndHeight(obj.src))).then(arr => {
                const objArr = imagesToAdd.map((obj, i) => ({
                  ...obj,
                  width: arr[i].width,
                  height: arr[i].height
                }));
                editor.dispatchCommand(INSERT_IMAGES_COMMAND$1, objArr);
                resetInsertMediaSectionForm(this);
                closeInsertMediaSectionHelper(this);
                setTimeout(afterInsertNode, AFTER_INSERT_NODE_TIMEOUT);
              }).catch(error => {
                console.error(error);
              });
            }
          }
        }
        return;
      case 'audio':
        if (dataCount === "single") {
          const srcInput = form.querySelector('input[type="text"][name^="audio-input-src-"]');
          if (srcInput) {
            const inputKey = srcInput.getAttribute('name').replace('audio-input-src-', '');
            const title = form.querySelector('input[name="audio-input-title-'.concat(String(inputKey)).concat('"]'));
            if (!!!title || !!!title.value.length) {
              openAudioVideoError(this);
              return;
            }
            const audioObj = {
              src: srcInput.value,
              title: title?.value ? title.value : ''
            };
            editor.dispatchCommand(INSERT_AUDIO_NODE, audioObj);
            resetInsertMediaSectionForm(this);
            closeInsertMediaSectionHelper(this);
            setTimeout(afterInsertNode, AFTER_INSERT_NODE_TIMEOUT);
          }
        }
        return;
      case 'video':
        if (dataCount === "single") {
          const srcInput = form.querySelector('input[type="text"][name^="video-input-src-"]');
          if (srcInput) {
            const inputKey = srcInput.getAttribute('name').replace('video-input-src-', '');
            const title = form.querySelector('input[name="video-input-title-'.concat(String(inputKey)).concat('"]'));
            const description = form.querySelector('textarea[name="video-input-description-'.concat(String(inputKey)).concat('"]'));
            const videoWrapper = srcInput.closest('div.video-wrapper');
            if (videoWrapper) {
              const video = videoWrapper.querySelector('video');
              if (video) {
                const height = video.videoHeight;
                const width = video.videoWidth;
                if (!!!title || !!!title.value.length) {
                  openAudioVideoError(this);
                  return;
                }
                const videoObj = {
                  src: srcInput.value,
                  title: title?.value ? title.value : '',
                  description: description?.value ? description.value : '',
                  height,
                  width
                };
                editor.dispatchCommand(INSERT_VIDEO_NODE, videoObj);
              }
            }
            resetInsertMediaSectionForm(this);
            closeInsertMediaSectionHelper(this);
            setTimeout(afterInsertNode, AFTER_INSERT_NODE_TIMEOUT);
          }
        }
        return;
      default:
        return;
    }
  }
}
function resetInsertMediaSectionForm(b, e) {
  const form = b.closest('div[data-form]');
  if (form) {
    const outputs = Array.from(form.querySelectorAll('output'));
    outputs.forEach(output => clearInnerHTML(output));
    const inputs = Array.from(form.querySelectorAll('input[type="file"]'));
    inputs.forEach(input => {
      const className = input.className;
      const type = input.getAttribute('type');
      const id = input.id;
      const name = input.getAttribute('name');
      const accept = input.getAttribute('accept');
      if (input.hasAttribute('data-image-input')) input.dispatchEvent(new CustomEvent('delete-image', {
        detail: {
          inputName: name
        }
      }));
      const multiple = input.hasAttribute('multiple');
      const newInput = document.createElement('input');
      newInput.className = className;
      if (type) newInput.setAttribute('type', type);
      if (accept) newInput.setAttribute('accept', accept);
      if (id) newInput.setAttribute('id', id);
      if (name) {
        const inputThatHoldsDBValues = form.querySelector(`input[name="${name}-text"]`);
        if (inputThatHoldsDBValues) inputThatHoldsDBValues.remove();
        newInput.setAttribute('name', name);
      }
      if (multiple) newInput.setAttribute('multiple', '');
      if (input.hasAttribute('data-image-input')) newInput.setAttribute('data-image-input', '');
      if (input.hasAttribute('data-audio-input')) newInput.setAttribute('data-audio-input', '');
      if (input.hasAttribute('data-video-input')) newInput.setAttribute('data-video-input', '');
      const parentElement = input.parentElement;
      if (parentElement) parentElement.replaceChild(newInput, input);
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED', {
        detail: {
          el: form
        }
      }));
    });
    form.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
  }
}
function handleInsertMediaSectionReset(e) {
  resetInsertMediaSectionForm(this);
}

/* ------------------------------------- Horizontal Rule Stuff ------------------------------- */
/**
 * Handle the submit of the horizontal rule form
 * @param this 
 * @param e 
 */
function handleHorizontalRuleSubmit(e) {
  e.preventDefault();
  const form = getHorizontalRuleForm();
  const color = form?.color;
  const width = form?.width;
  const checkbox = form?.checkbox;
  const dialog = form?.dialog;
  if (form && dialog && checkbox && color && width) {
    const editor = getCurrentEditor();
    if (editor && SELECTED_DECORATORS && SELECTED_DECORATORS.length >= 1) {
      editor.update(() => {
        var UPDATED_HRS = false;
        if (SELECTED_DECORATORS && SELECTED_DECORATORS.length >= 1) {
          SELECTED_DECORATORS.forEach(dec => {
            var node = $getNodeByKey(dec);
            if (node) {
              if ($isHorizontalRuleNode(node)) {
                node.setHorizontalRuleStyle({
                  color: checkbox.checked ? 'var(--divider)' : color.value,
                  width: Number(width.value)
                });
                UPDATED_HRS = true;
                const dom = editor._rootElement;
                if (dom) {
                  const hr = dom.querySelector(`div[data-node-key="${dec}"]>hr`);
                  if (hr) {
                    hr.style.setProperty('border-bottom-width', String(width.value).concat('px'));
                    if (checkbox.checked) {
                      hr.classList.add('divider-color');
                      hr.style.removeProperty('border-bottom-color');
                    } else {
                      if (hr.classList.contains('divider-color')) hr.classList.remove('divider-color');
                      hr.style.setProperty('border-bottom-color', color.value);
                    }
                  }
                }
              }
            }
          });
          if (!!!UPDATED_HRS) editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, {
            color: checkbox.checked ? 'var(--divider)' : color.value,
            width: Number(width.value)
          });
        }
      });
    } else if (editor) {
      editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, {
        color: checkbox.checked ? 'var(--divider)' : color.value,
        width: Number(width.value)
      });
    }
    closeDialog(form.dialog);
  }
}
/**
 * When an input on the horizontal rule form changes, change the example horizontal rule to reflect that
 */
function handleHorizontalRuleChange(e) {
  const form = getHorizontalRuleForm();
  if (form && form.checkbox && form.color && form.width && form.example) {
    const width = form.width.value;
    const divider = form.checkbox.checked;
    const colorInput = VALID_HEX_REGEX.test(form.color.value) ? form.color.value : 'var(--divider)';
    const color = divider ? 'var(--divider)' : colorInput;
    form.example.style.borderBottomWidth = String(width).concat('px');
    form.example.style.borderBottomColor = color;
  }
}

/* ------------------------------------------- Embed News and Youtube ---------------------- --------------- */
/**
 * Function to be called whenever embedding content is successful
 * @param form 
 * @param e 
 * @param dialog 
 */
function onEmbedSuccess(form, dialog) {
  const errorAlert = dialog.querySelector('div[data-embed-error]');
  if (errorAlert) errorAlert.setAttribute('hidden', '');
  form.reset();
  closeDialog(dialog);
}
/**
 * Function to be called whenever there is an error embedding content
 * @param this 
 * @param e 
 * @param dialog 
 */
function onEmbedError(dialog) {
  const errorAlert = dialog.querySelector('div[data-embed-error]');
  if (errorAlert) errorAlert.removeAttribute('hidden');
}
const VALID_URL_REGEX = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
/**
 * To embed a news article, the provided url must have:
 * a `<meta property="og:type"/>` with a content of article
 * a `<meta property="og:title"/>` with a non-empty content value
 * a `<meta property="og:image"/>` with a valid image that has can be obtained
 * a `<meta property="og:description"/>` with a non empty content attribute
 * @param form 
 * @param e 
 * @param dialog 
 */
async function handleEmbedNews(form, e, dialog) {
  try {
    const url = form.querySelector('input[id="lex-embed-news-input"]');
    if (!!!url) throw new Error('Please enter a valid url.');
    if (!!!VALID_URL_REGEX.test(url.value)) throw new Error('Please enter a valid url.');
    const body = {
      embed_type: 'news',
      url: url.value
    };
    openLoadingDialog("Generating News Article Embed...");
    const resp = await fetch('/api/embed', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      }
    });
    if (resp.status !== 200) {
      throw new Error("Something went wrong embedding news.");
    }
    const obj = await resp.json();
    const editor = getCurrentEditor();
    if (editor) editor.dispatchCommand(INSERT_NEWS_NODE, obj);
    closeLoadingDialog();
    if (resp.status !== 200) throw new Error('Something went wrong embedding news content.');
    onEmbedSuccess(form, dialog);
  } catch (error) {
    closeLoadingDialog();
    onEmbedError(dialog);
  }
}
/**
 * Embed youtube video in the input
 * @param form 
 * @param e 
 * @param dialog 
 */
function handleEmbedYoutube(form, e, dialog) {
  try {
    const textInput = form.querySelector('input[type="url"]');
    if (!!!textInput) throw new Error('Can\'t find url for youtube video.');
    const videoID = validateYoutubeUrl(textInput.value);
    if (videoID) {
      const editor = getCurrentEditor();
      if (editor) {
        editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, String(videoID));
        onEmbedSuccess(form, dialog);
      }
    } else throw new Error('Invalid Youtube url.');
  } catch (error) {
    closeLoadingDialog();
    onEmbedError(dialog);
  }
}
function onNewsFormSubmit(dialog, form) {
  const func = function (e) {
    handleEmbedNews(form, e, dialog);
  };
  return func;
}
function onYoutubeFormSubmit(dialog, form) {
  const func = function (e) {
    handleEmbedYoutube(form, e, dialog);
  };
  return func;
}
function getOnOpenNewsDialog(e) {
  if (e.detail.el.id === "lex-embed-news") {
    const newsDialog = document.getElementById('lex-embed-news');
    if (newsDialog) {
      const form = newsDialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', onNewsFormSubmit(newsDialog, form));
      }
    }
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: newsDialog
      }
    }));
  }
}
function getOnOpenYouTubeDialog(e) {
  if (e.detail.el.id === "lex-embed-youtube") {
    const youtubeDialog = document.getElementById('lex-embed-youtube');
    if (youtubeDialog) {
      const form = youtubeDialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', onYoutubeFormSubmit(youtubeDialog, form));
      }
    }
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: youtubeDialog
      }
    }));
  }
}
const isMathNode = node => Boolean(node.getType() === "math");
function setToolbarSelectedImage(wrapper) {
  const buttons = getEditorButtons(wrapper);
  Object.values(buttons).forEach(b => {
    if (b && b.nodeName === "BUTTON") {
      if (b.hasAttribute('data-lexical-image-button')) b.classList.add('selected');else if (b.getAttribute('data-dispatch') === "FORMAT_ELEMENT_COMMAND") return;else {
        b.setAttribute('disabled', '');
      }
    }
  });
}
function getImageWidthAndHeight(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.decode().then(() => {
      resolve({
        width: Math.max(img.naturalWidth, 50),
        height: Math.max(img.naturalHeight, 25)
      });
    }).catch(e => {
      console.error(e);
      resolve({
        width: 50,
        height: 25
      });
    });
  });
}
function onGifButtonClick(e) {
  const div = this.parentElement;
  if (div) {
    const input = div.querySelector('input');
    if (input) {
      if (input) input.addEventListener('gif-upload', handleGifUpload);
      input.click();
    }
  }
}
async function handleGifUpload(e) {
  try {
    const wrapper = this.closest('div.lexical-wrapper');
    if (wrapper && wrapper.id) {
      const id = wrapper.id;
      const urls = e.detail.urls;
      const editors = getEditorInstances();
      const editor = editors[id];
      if (editor) {
        const widthsAndHeights = await Promise.all(urls.map(obj => getImageWidthAndHeight(obj)));
        editor.dispatchCommand(INSERT_IMAGES_COMMAND$1, urls.map((url, i) => ({
          src: url,
          short: '',
          long: '',
          width: widthsAndHeights[i].width,
          height: widthsAndHeights[i].height
        })));
      }
    }
  } catch (error) {
    console.error(error);
  }
}

/*----------------------------------------------------- Register Decorators ----------------------------------- */
function registerDecoratorsListeners(editor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const closeInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll('button.close-insert-media-section'));
    const submitInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll('div[data-insert-media] button[data-submit]'));
    const resetInsertMediaSectionButtons = Array.from(wrapper.querySelectorAll('div[data-insert-media] button[data-reset]'));
    // Handle with registerImage or registerInlineImage
    const insertImageButton = wrapper.querySelector('button[data-lexical-image-button]');
    if (insertImageButton) insertImageButton.addEventListener('click', handleInsertImageClick);
    // Handle with registerAudioNodes
    const insertAudioButton = wrapper.querySelector('button[data-lexical-audio-button]');
    if (insertAudioButton) insertAudioButton.addEventListener('click', handleInsertAudioClick);
    // Handle with registerVideoNodes
    const insertVideoButton = wrapper.querySelector('button[data-lexical-video-button]');
    if (insertVideoButton) insertVideoButton.addEventListener('click', handleInsertVideoClick);
    if (Array.isArray(closeInsertMediaSectionButtons)) closeInsertMediaSectionButtons.forEach(b => b.addEventListener('click', closeInsertMediaSection));
    if (Array.isArray(submitInsertMediaSectionButtons)) submitInsertMediaSectionButtons.forEach(b => b.addEventListener('click', handleInsertMediaSectionSubmit));
    if (Array.isArray(resetInsertMediaSectionButtons)) resetInsertMediaSectionButtons.forEach(b => b.addEventListener('click', handleInsertMediaSectionReset));
    const gifButton = wrapper.querySelector('button[data-lexical-gif-button]');
    if (gifButton) gifButton.addEventListener('click', onGifButtonClick);
  }
}
function getOnOpenDecoratorsLexical(e) {
  if (e.detail.el.id === "horizontal-rule-lexical") {
    const horizontalRuleForm = getHorizontalRuleForm();
    if (horizontalRuleForm && horizontalRuleForm.form) {
      horizontalRuleForm.form.addEventListener("submit", handleHorizontalRuleSubmit);
      horizontalRuleForm.form.addEventListener("change", handleHorizontalRuleChange);
      const editor = getCurrentEditor();
      if (editor && SELECTED_DECORATORS && SELECTED_DECORATORS.length) {
        editor.getEditorState().read(() => {
          if (SELECTED_DECORATORS && SELECTED_DECORATORS.length >= 1) {
            const node = $getNodeByKey(SELECTED_DECORATORS[0]);
            if ($isHorizontalRuleNode(node)) {
              const width = node.getWidth();
              const color = node.getColor();
              const widthInput = document.getElementById('lex-horizontal-rule-width');
              const colorInput = document.getElementById('lex-horizontal-rule-color');
              const defaultHR = document.getElementById('horizontal-rule-default');
              if (widthInput) widthInput.value = String(width);
              if (colorInput) colorInput.value = String(color === "var(--divider)" ? getDefaultTextColor() : color);
              if (defaultHR) defaultHR.checked = Boolean(color === 'var(--divider)');
            }
          }
        });
      }
      document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
        detail: {
          dialog: horizontalRuleForm.dialog
        }
      }));
    }
  }
}
function getOnOpenImageBackgroundLexical(e) {
  if (e.detail.el.id === "image-bg-color-dialog") {
    const bgForm = document.getElementById('image-bg-color-form');
    if (bgForm) bgForm.addEventListener('submit', onChangeImageBackgroundColorSubmit);
    const dialog = document.getElementById('image-bg-color-dialog');
    if (dialog) {
      document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
        detail: {
          dialog: dialog
        }
      }));
    }
  }
}
function registerDecoratorsEditable(editor) {
  registerDecoratorsListeners(editor);
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  const arr = [];
  if (editor.hasNode(HorizontalRuleNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenDecoratorsLexical);
    arr.push(editor.registerCommand(INSERT_HORIZONTAL_RULE_COMMAND, payload => {
      const horizontalRuleNode = $createHorizontalRuleNode({
        color: String(payload.color),
        width: payload.width
      });
      $insertNodeToNearestRoot(horizontalRuleNode);
      return true;
    }, COMMAND_PRIORITY_EDITOR));
    arr.push(editor.registerCommand(FORMAT_HORIZONTAL_RULE_COMMAND, payload => {
      const color = VALID_HEX_REGEX.test(String(payload.color)) ? String(payload.color) : 'var(--divider)';
      const width = clampWidth(payload.width);
      const selection = $getSelection();
      if ($isNodeSelection(selection) || $isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        for (let node of nodes) {
          if ($isHorizontalRuleNode(node)) {
            node.setHorizontalRuleStyle({
              color,
              width
            });
          }
        }
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR));
  }
  if (editor.hasNode(AudioNode)) {
    arr.push(editor.registerCommand(INSERT_AUDIO_NODE, payload => {
      if (payload.src.startsWith('https://audio.storething.org/frankmbrown/', 0) && payload.title.length) {
        const audioNode = $createAudioNode(payload);
        $insertNodeToNearestRoot(audioNode);
        const key = audioNode.getKey();
        try {
          const element = editor.getElementByKey(key);
          if (element) element.scrollIntoView();
        } catch (e) {}
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(AudioNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          const el_id = editor._config.namespace;
          setTimeout(() => {
            const el = document.getElementById(el_id);
            if (el) document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
              detail: {
                el
              }
            }));
          }, 500);
        }
      }
    }));
  }
  if (editor.hasNode(VideoNode)) {
    arr.push(editor.registerCommand(INSERT_VIDEO_NODE, payload => {
      if (payload.src.startsWith('https://video.storething.org/frankmbrown/', 0) && payload.title.length) {
        const videoNode = $createVideoNode(payload);
        $insertNodeToNearestRoot(videoNode);
        const key = videoNode.getKey();
        try {
          const element = editor.getElementByKey(key);
          if (element) element.scrollIntoView();
        } catch (e) {}
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(VideoNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          const el_id = editor._config.namespace;
          setTimeout(() => {
            const el = document.getElementById(el_id);
            if (el) document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
              detail: {
                el
              }
            }));
          }, 500);
        }
      }
    }));
  }
  if (editor.hasNode(ImageNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenImageBackgroundLexical);
    arr.push(editor.registerCommand(INSERT_IMAGE_COMMAND$1, payload => {
      const deviceType = getDeviceType();
      const node = $createImageNode({
        ...payload,
        width: payload.width,
        height: payload.height,
        originalDevice: deviceType,
        backgroundColor: undefined
      });
      $insertNodes([node]);
      if (!!!$isParagraphNode(node.getParentOrThrow())) {
        $wrapNodeInElement(node, $createParagraphNode).selectEnd();
        const parent = node.getParent();
        if ($isParagraphNode(parent)) {
          parent.setFormat('center');
        }
      } else if ($isParagraphNode(node.getParentOrThrow())) {
        const p = node.getParentOrThrow();
        p.setFormat('center');
      }
      const key = node.getKey();
      try {
        const element = editor.getElementByKey(key);
        if (element) element.scrollIntoView();
      } catch (e) {}
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(INSERT_IMAGES_COMMAND$1, payload => {
      const deviceType = getDeviceType();
      const nodes = payload.map(obj => $createImageNode({
        ...obj,
        width: obj.width,
        height: obj.height,
        originalDevice: deviceType,
        backgroundColor: undefined
      }));
      $insertNodes(nodes);
      if (!!!$isParagraphNode(nodes[0].getParentOrThrow())) {
        $wrapNodeInElement(nodes[0], $createParagraphNode).selectEnd();
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR));
    arr.push(registerDecoratorsNotEditable(editor, false));
  }
  if (editor.hasNode(CarouselImageNode)) {
    arr.push(editor.registerCommand(INSERT_CAROUSEL_COMMAND, payload => {
      const node = $createCarouselImageNode(payload);
      $insertNodeToNearestRoot(node);
      const el_id = editor._config.namespace;
      setTimeout(() => {
        const el = document.getElementById(el_id);
        if (el) document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
          detail: {
            el
          }
        }));
      }, 500);
      const key = node.getKey();
      try {
        const element = editor.getElementByKey(key);
        if (element) element.scrollIntoView();
      } catch (e) {}
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerCommand(CAROUSEL_CLICK, key => {
      const nodeSelection = $createNodeSelection();
      nodeSelection.add(key);
      $setSelection(nodeSelection);
      SELECTED_DECORATORS = [key];
      setSelectedDecorators(editor);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(CarouselImageNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          const el_id = editor._config.namespace;
          setTimeout(() => {
            const el = document.getElementById(el_id);
            if (el) document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED", {
              detail: {
                el
              }
            }));
          }, 500);
        }
      }
    }));
  }
  if (editor.hasNode(NewsNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenNewsDialog);
    arr.push(editor.registerCommand(INSERT_NEWS_NODE, payload => {
      const {
        url,
        title,
        description,
        imageURL,
        host
      } = payload;
      const node = $createNewsNode({
        url,
        title,
        description,
        imageURL,
        host,
        format: 'center'
      });
      $insertNodeToNearestRoot(node);
      return true;
    }, COMMAND_PRIORITY_EDITOR));
  }
  if (editor.hasNode(YouTubeNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenYouTubeDialog);
    arr.push(editor.registerCommand(INSERT_YOUTUBE_COMMAND, payload => {
      const youTubeNode = $createYouTubeNode(payload);
      youTubeNode.setFormat('center');
      $insertNodeToNearestRoot(youTubeNode);
      return true;
    }, COMMAND_PRIORITY_EDITOR));
  }
  if (editor.hasNode(InstagramNode)) arr.push(registerInstagramEditable(editor));
  if (editor.hasNode(TwitterNode)) arr.push(registerTwitterEditable(editor));
  if (editor.hasNode(TikTokNode)) arr.push(registerTikTokEditable(editor));
  return mergeRegister(...arr, editor.registerCommand(FORMAT_ELEMENT_COMMAND, formatType => {
    const selection = $getSelection();
    if ($isNodeSelection(selection) || $isRangeSelection(selection)) {
      const nodes = selection.getNodes();
      for (let node of nodes) {
        if ($isDecoratorNode(node)) {
          if ($isImageNode(node)) {
            const parent = node.getParentOrThrow();
            if (parent) parent.setFormat(formatType);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat(formatType);
          }
        } else {
          const element = $getNearestBlockElementAncestorOrThrow(node);
          element.setFormat(formatType);
        }
      }
      return true;
    }
    return false;
  }, COMMAND_PRIORITY_LOW), editor.registerCommand(CLICK_COMMAND, event => {
    var CLEAR_IMAGE = true;
    if (event.target) {
      var el = event.target;
      var i = 0;
      while (i < 10) {
        if (el.hasAttribute('data-frank-decorator')) break;else {
          el = el.parentElement;
          if (!!!el) break;
          i += 1;
        }
      }
      if (el) {
        const isDecorator = el.getAttribute('data-frank-decorator');
        if (isDecorator === "true") {
          event.preventDefault();
          event.stopPropagation();
          if (el.nodeName !== 'SPAN' && el.className !== "lexical-math" && !!!el.classList.contains('splide')) {
            el.classList.add('selected-decorator-block');
          }
          if (el.classList.contains('rte-image')) {
            CLEAR_IMAGE = false;
            if (SELECTED_IMAGE && el.getAttribute('src') !== SELECTED_IMAGE.getAttribute('src')) {
              clearSelectedImage();
            }
            const img = el.querySelector('img');
            const div = el.querySelector('div[data-image-wrapper="true"]');
            if (img) {
              img.classList.add('focused', 'draggable');
              const div = document.createElement('div');
              const arr = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
              arr.forEach(dir => {
                const newDiv = document.createElement('div');
                newDiv.className = `image-resizer image-resizer-${dir}`;
                newDiv.setAttribute('data-dir', dir);
                if (!!!isTouchDevice()) newDiv.addEventListener('mousedown', onImageResizeStart);else newDiv.addEventListener('touchstart', onImageResizeStart);
                div.append(newDiv);
              });
              img.insertAdjacentElement("afterend", div);
              img.setAttribute('draggable', 'false');
              SELECTED_IMAGE = img;
              if (wrapper) setToolbarSelectedImage(wrapper);
            }
            if (div) div.setAttribute('draggable', 'true');
          }
          const nodeKey = el.getAttribute('data-node-key');
          if (nodeKey) {
            SELECTED_DECORATORS = [nodeKey];
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(nodeKey);
            $setSelection(nodeSelection);
          }
          if (CLEAR_IMAGE) {
            clearSelectedImage();
          }
          return true;
        }
      }
    }
    if (CLEAR_IMAGE) {
      clearSelectedImage();
    }
    return false;
  }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_DELETE_COMMAND, payload => {
    const resp = onDeleteDecorators(editor, payload);
    if (window.closeFloatingContextMenu) window.closeFloatingContextMenu();
    return resp;
  }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_BACKSPACE_COMMAND, payload => {
    const resp = onDeleteDecorators(editor, payload);
    if (window.closeFloatingContextMenu) window.closeFloatingContextMenu();
    return resp;
  }, COMMAND_PRIORITY_LOW), editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    var selectedTypes = new Set();
    var align = undefined;
    clearSelectedDecorators(editor);
    const selection = $getSelection();
    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes();
      if (isMathNode(nodes[0])) {
        const key = nodes[0].getKey();
        const decorators = editor.getDecorators();
        Object.keys(decorators).forEach(key2 => {
          if (key2 !== key && $getNodeByKey(key2) && isMathNode($getNodeByKey(key2))) $getNodeByKey(key2).setEditable(false);
        });
        nodes[0].setEditable(true);
        const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
        if (wrapper) {
          const buttons = getEditorButtons(wrapper);
          Object.values(buttons).forEach(b => {
            if (b && b.nodeName === "BUTTON") {
              const editHistory = b.getAttribute('data-dispatch');
              if (editHistory === 'UNDO_COMMAND' || editHistory === 'REDO_COMMAND' || editHistory === 'CLEAR_EDITOR_COMMAND') {
                return;
              } else {
                b.setAttribute('disabled', '');
              }
            }
          });
        }
        return true;
      }
      const arr = [];
      nodes.forEach(n => {
        if ($isDecoratorBlockNode(n)) {
          const key = n.getKey();
          arr.push(key);
          if (align !== null) {
            const currentAlign = n.getFormat();
            if (align === undefined) align = currentAlign;else if (align === currentAlign) {
              return;
            } else if (align !== currentAlign) {
              align = null;
              return;
            }
          }
        }
        if ($isHorizontalRuleNode(n) && editor.isEditable()) {
          const width = n.getWidth();
          const color = n.getColor();
          const colorInput = document.getElementById('lex-horizontal-rule-color');
          if (colorInput) setColorInput(colorInput, color === 'var(--divider)' ? getDefaultTextColor() : color);
          const widthInput = document.getElementById('lex-horizontal-rule-width');
          if (widthInput) {
            widthInput.value = String(width);
            widthInput.dispatchEvent(new Event('change'));
          }
        }
      });
      SELECTED_DECORATORS = arr;
      selectedTypes = setSelectedDecorators(editor);
    } else if (DEPRECATED_$isGridSelection(selection)) {
      SELECTED_DECORATORS = undefined;
      selectedTypes = setSelectedDecorators(editor);
    } else {
      const decorators = editor.getDecorators();
      for (let key of Object.keys(decorators)) {
        const node = $getNodeByKey(key);
        if (node && isMathNode(node) && node.getEditable()) node.setEditable(false);
      }
    }
    if (wrapper) {
      const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
      if (wrapper) {
        if (SELECTED_IMAGE) selectedTypes.add('image');
        const buttons = getEditorButtons(wrapper);
        Object.values(buttons).forEach(b => {
          if (b && b.nodeName === "BUTTON") {
            if (b.hasAttribute('data-lexical-image-button')) {
              if (selectedTypes.has('image')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.hasAttribute('data-lexical-audio-button')) {
              if (selectedTypes.has('audio-node')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.hasAttribute('data-lexical-video-button')) {
              if (selectedTypes.has('video-node')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.hasAttribute('data-lexical-embed-media')) {
              if (selectedTypes.has('news') || selectedTypes.has('youtube')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.hasAttribute('data-lexical-math-button')) {
              if (selectedTypes.has('math')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.hasAttribute('data-lexical-hr-button')) {
              if (selectedTypes.has('horizontal-rule')) {
                b.classList.add('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            if (b.getAttribute('data-dispatch') === "FORMAT_ELEMENT_COMMAND") {
              if (selectedTypes.has('image') || selectedTypes.has('youtube')) {
                const payload = b.getAttribute('data-payload');
                if (payload === align) b.classList.add('selected');else b.classList.remove('selected');
                b.removeAttribute('disabled');
              } else if (selectedTypes.size > 0) {
                b.setAttribute('disabled', '');
                b.classList.remove('selected');
              } else {
                b.removeAttribute('disabled');
                b.classList.remove('selected');
              }
              return;
            }
            const editHistory = b.getAttribute('data-dispatch');
            if (editHistory === 'UNDO_COMMAND' || editHistory === 'REDO_COMMAND' || editHistory === 'CLEAR_EDITOR_COMMAND') {
              return;
            }
            if (selectedTypes.size > 0) b.setAttribute('disabled', '');else b.removeAttribute('disabled');
          } else return;
        });
      }
    }
    return false;
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(KEY_ENTER_COMMAND, e => {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && selection.isCollapsed()) {
      const nodes = selection.getNodes();
      if (nodes.length) {
        const node = nodes[0];
        if ($isTextNode(node)) {
          const parent = node.getParent();
          if ($isParagraphNode(parent)) {
            const textContent = parent.getTextContent();
            if (/^-----(\[#[a-fA-F0-9]{6}])?(\[\d+\])?$/.test(textContent)) {
              var hexColor = '';
              var width = 0;
              const firstIndexBracket = textContent.indexOf('[');
              if (firstIndexBracket !== -1) {
                const endBracketFirst = textContent.indexOf(']');
                if (endBracketFirst !== -1) {
                  const firstGroup = textContent.slice(firstIndexBracket + 1, endBracketFirst);
                  if (firstGroup.startsWith('#')) hexColor = firstGroup;else width = parseInt(firstGroup);
                  const newStr = textContent.slice(endBracketFirst + 1);
                  if (newStr.length) {
                    const secondGroup = newStr.slice(1, newStr.length - 1);
                    if (secondGroup.startsWith('#')) hexColor = secondGroup;else width = parseInt(secondGroup);
                  }
                }
              }
              parent.remove();
              editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, {
                color: hexColor.length ? hexColor : 'var(--divider)',
                width: width === 0 ? 1 : width
              });
            }
          }
        }
      }
    }
    return false;
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(DRAG_DROP_PASTE, files => {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if (files.length && wrapper) {
      const file = files[0];
      if (file.type === "image/gif" && editor.hasNode(ImageNode)) {
        const input = wrapper.querySelector('input[data-lexical-gif-input]');
        if (input) {
          input.files = getFileListForFileInput([file]);
          input.dispatchEvent(new Event("change"));
          return true;
        }
      } else if (file.type.startsWith('image/') && editor.hasNode(ImageNode)) {
        const imageButton = wrapper.querySelector('button[data-lexical-image-button]');
        if (imageButton) {
          imageButton.dispatchEvent(new Event("click"));
          if (files.length > 1) {
            const imageFiles = files.filter(file => file.type.startsWith("image/"));
            const tab = wrapper.querySelector('button[id^="lexical-upload-multiple-images"]');
            if (tab) tab.dispatchEvent(new Event("click"));
            const input = wrapper.querySelector('input[data-image-input][multiple]');
            if (input) {
              input.files = getFileListForFileInput(imageFiles);
              input.dispatchEvent(new Event("change"));
              return true;
            }
          } else {
            const tab = wrapper.querySelector('button[id^="lexical-upload-single-image"]');
            if (tab) tab.dispatchEvent(new Event("click"));
            const input = wrapper.querySelector('input[data-image-input]:not([multiple])');
            if (input) {
              input.files = getFileListForFileInput([file]);
              input.dispatchEvent(new Event("change"));
              return true;
            }
          }
        }
      } else if (file.type.startsWith('audio/') && editor.hasNode(AudioNode)) {
        const audioButton = wrapper.querySelector('button[data-lexical-audio-button]');
        if (audioButton) {
          audioButton.dispatchEvent(new Event("click"));
          const audioInput = wrapper.querySelector('input[data-audio-input]');
          if (audioInput) {
            audioInput.files = getFileListForFileInput([file]);
            audioInput.dispatchEvent(new Event("change"));
            return true;
          }
        }
      } else if (file.type.startsWith('video/') && editor.hasNode(VideoNode)) {
        const videoButton = wrapper.querySelector('button[data-lexical-video-button]');
        if (videoButton) {
          videoButton.dispatchEvent(new Event("click"));
          const videoInput = wrapper.querySelector('input[data-video-input]');
          if (videoInput) {
            videoInput.files = getFileListForFileInput([file]);
            videoInput.dispatchEvent(new Event("change"));
            return true;
          }
        }
      }
    }
    return false;
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(DRAGSTART_COMMAND, event => {
    return $onDragStartImage(event);
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(DRAGOVER_COMMAND, event => {
    return $onDragOverImage(event);
  }, COMMAND_PRIORITY_LOW), editor.registerCommand(DROP_COMMAND, event => {
    return $onDropImage(event, editor);
  }, COMMAND_PRIORITY_HIGH), editor.registerCommand(REGISTER_TOOLBAR_LISTENERS, () => {
    registerDecoratorsListeners(editor);
    return false;
  }, COMMAND_PRIORITY_EDITOR));
}
function registerDecoratorsNotEditable(editor, setImagesInitialNotEditable = true) {
  if (editor.hasNode(ImageNode)) {
    if (setImagesInitialNotEditable) {
      editor.update(() => {
        const imageNodes = $nodesOfType(ImageNode);
        for (let node of imageNodes) {
          node.setDialogOnClick(true);
        }
      });
    }
    return mergeRegister(editor.registerEditableListener(editable => {
      if (!!!editable) {
        editor.update(() => {
          const imageNodes = $nodesOfType(ImageNode);
          imageNodes.forEach(node => {
            node.setDialogOnClick(true);
          });
        });
      } else {
        editor.update(() => {
          const imageNodes = $nodesOfType(ImageNode);
          imageNodes.forEach(node => {
            node.setDialogOnClick(false);
          });
        });
      }
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const imageNodes = $nodesOfType(ImageNode);
      imageNodes.forEach(node => {
        if (!!!node.getDialogOnClick()) node.setDialogOnClick(true);
      });
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Image Not Not registered.");
    return () => {};
  }
}

const MAX_WIDTH_MOBILE_COMMENT = 150;
const MAX_HEIGHT_MOBILE_COMMENT = 80;
const MAX_WIDTH_MOBILE = 380;
const MAX_HEIGHT_MOBILE = 400;
const MAX_WIDTH_DESKTOP_COMMENT = 270;
const MAX_HEIGHT_DESKTOP_COMMENT = 150;
const MAX_WIDTH_DESKTOP = 680;
const MAX_HEIGHT_DESKTOP = 700;
const MIN_IMAGE_DIMENSION = 50;
const getUseragent = () => window?.navigator?.userAgent || global.userAgent;
const GET_MAX_IMAGE_WIDTH = editorType => {
  if (editorType === "comment" || editorType === "survey-question" || editorType === "survey-short-blog" || editorType === "survey-option" || editorType === "range-description") {
    return isMobileDevice(getUseragent()) ? MAX_WIDTH_MOBILE_COMMENT : MAX_WIDTH_DESKTOP_COMMENT;
  } else {
    return isMobileDevice(getUseragent()) ? MAX_WIDTH_MOBILE : MAX_WIDTH_DESKTOP;
  }
};
const GET_MAX_IMAGE_HEIGHT = editorType => {
  if (editorType === "comment" || editorType === "survey-question" || editorType === "survey-short-blog" || editorType === "survey-option" || editorType === "range-description") {
    return isMobileDevice(getUseragent()) ? MAX_HEIGHT_MOBILE_COMMENT : MAX_HEIGHT_DESKTOP_COMMENT;
  } else {
    return isMobileDevice(getUseragent()) ? MAX_HEIGHT_MOBILE : MAX_HEIGHT_DESKTOP;
  }
};
const CURRENT_VERSION$7 = 1;
function onImageClick(e) {
  e.stopPropagation();
  document.dispatchEvent(new CustomEvent("IMAGE_CLICK", {
    detail: {
      image: this
    }
  }));
}

/**
 * Return sizes string and aspect ratio string
 * @param widthProperty 
 * @param heightProperty 
 * @returns 
 */
function getSizesAndAspectRatio(widthProperty, heightProperty) {
  var newWidthProperty = widthProperty;
  var newHeightProperty = heightProperty;
  const aspectRatio = widthProperty / heightProperty;
  if (widthProperty >= heightProperty) {
    if (widthProperty > MAX_WIDTH_MOBILE) {
      newWidthProperty = MAX_WIDTH_MOBILE;
      newHeightProperty = newWidthProperty / aspectRatio;
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
  } else {
    if (heightProperty > MAX_HEIGHT_MOBILE) {
      newHeightProperty = MAX_HEIGHT_MOBILE;
      newWidthProperty = aspectRatio * newHeightProperty;
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
  }
  newWidthProperty = Math.round(newWidthProperty);
  newHeightProperty = Math.round(newHeightProperty);
  const sizes = `(max-width: 500px) ${newWidthProperty}px, (min-width:500px) ${widthProperty}px`;
  newWidthProperty = newWidthProperty % 2 === 0 ? newWidthProperty : newWidthProperty + 1;
  newHeightProperty = newHeightProperty % 2 === 0 ? newHeightProperty : newHeightProperty + 1;
  const greatestCommonDenom = gcd(newWidthProperty, newHeightProperty);
  const gcdWidth = newWidthProperty / greatestCommonDenom;
  const gcdHeight = newHeightProperty / greatestCommonDenom;
  return {
    sizes,
    aspectRatio: `${gcdWidth} / ${gcdHeight}`
  };
}
class ImageNode extends DecoratorNode {
  __originalDevice = 'mobile';
  __version = CURRENT_VERSION$7;
  __dialogOnClick = false;
  constructor(obj, key) {
    super(key);
    this.__src = obj.src;
    this.__short = obj.short;
    this.__long = obj.long;
    this.__width = obj.width;
    this.__height = obj.height;
    this.__dialogOnClick = false;
    if (obj.originalDevice) this.__originalDevice = obj.originalDevice;else this.__originalDevice = getDeviceType();
    if (obj.backgroundColor) this.__backgroundColor = obj.backgroundColor;
  }
  static getType() {
    return 'image';
  }
  static clone(node) {
    return new ImageNode({
      src: node.getSrc(),
      short: node.getShort(),
      long: node.getLong(),
      width: node.getWidth(),
      height: node.getHeight(),
      originalDevice: node.getOriginalDevice(),
      backgroundColor: node.getBackgroundColor()
    });
  }
  static importJSON(serializedNode) {
    const node = $createImageNode({
      src: serializedNode.src,
      short: serializedNode.short,
      long: serializedNode.long,
      width: serializedNode.width,
      height: serializedNode.height,
      originalDevice: serializedNode.originalDevice || 'mobile',
      backgroundColor: serializedNode.backgroundColor
    });
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      type: 'image',
      version: CURRENT_VERSION$7,
      src: this.getSrc(),
      short: this.getShort(),
      long: this.getLong(),
      width: this.getWidth(),
      height: this.getHeight(),
      originalDevice: this.getOriginalDevice(),
      backgroundColor: this.getBackgroundColor(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM(editor) {
    const element = document.createElement('img');
    element.setAttribute('loading', 'lazy');
    element.setAttribute('data-v', String(CURRENT_VERSION$7));
    element.setAttribute('src', this.getSrc());
    element.setAttribute('alt', this.getShort());
    element.setAttribute('data-text', this.getLong());
    element.setAttribute('data-original-device', this.getOriginalDevice());
    const bgColor = this.getBackgroundColor();
    if (bgColor) {
      element.setAttribute('data-bg-color', bgColor);
      element.style.setProperty('background-color', bgColor);
    }
    const widthProperty = this.getWidth();
    const heightProperty = this.getHeight();
    const aspectRatio = widthProperty / heightProperty;
    const deviceType = getDeviceType();
    var newWidthProperty, newHeightProperty, deviceRatio;
    const MAX_WIDTH_MOBILE_USE = editor._editorType === "comment" ? MAX_WIDTH_MOBILE_COMMENT : MAX_WIDTH_MOBILE;
    const MAX_WIDTH_DESKTOP_USE = editor._editorType === "comment" ? MAX_WIDTH_DESKTOP_COMMENT : MAX_WIDTH_DESKTOP;
    const MAX_HEIGHT_MOBILE_USE = editor._editorType === "comment" ? MAX_WIDTH_MOBILE_COMMENT : MAX_WIDTH_MOBILE;
    const MAX_HEIGHT_DESKTOP_USE = editor._editorType === "comment" ? MAX_WIDTH_DESKTOP_COMMENT : MAX_WIDTH_DESKTOP;
    if (deviceType === "mobile" && 'mobile' !== this.getOriginalDevice()) {
      if (widthProperty >= heightProperty) {
        if (widthProperty > MAX_WIDTH_MOBILE_USE) {
          newWidthProperty = Math.max(MIN_IMAGE_DIMENSION, widthProperty * MAX_WIDTH_MOBILE_USE / MAX_WIDTH_DESKTOP_USE);
          newHeightProperty = newWidthProperty / aspectRatio;
        } else {
          newWidthProperty = widthProperty;
          newHeightProperty = heightProperty;
        }
      } else {
        if (heightProperty > MAX_HEIGHT_MOBILE_USE) {
          newHeightProperty = Math.max(MIN_IMAGE_DIMENSION, heightProperty * MAX_HEIGHT_MOBILE_USE / MAX_HEIGHT_DESKTOP_USE);
          newWidthProperty = aspectRatio * newHeightProperty;
        } else {
          newWidthProperty = widthProperty;
          newHeightProperty = heightProperty;
        }
      }
    } else if (deviceType !== 'mobile' && 'mobile' === this.getOriginalDevice()) {
      if (aspectRatio > 1.05) {
        deviceRatio = widthProperty / MAX_WIDTH_MOBILE_USE;
        newWidthProperty = MAX_WIDTH_DESKTOP_USE * deviceRatio;
        newHeightProperty = newWidthProperty / aspectRatio;
      } else {
        deviceRatio = heightProperty / MAX_HEIGHT_MOBILE_USE;
        newHeightProperty = MAX_HEIGHT_DESKTOP_USE * deviceRatio;
        newWidthProperty = newHeightProperty * aspectRatio;
      }
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
    if (heightProperty > widthProperty && newHeightProperty < MIN_IMAGE_DIMENSION) {
      newWidthProperty = MIN_IMAGE_DIMENSION;
      newHeightProperty = newWidthProperty * (heightProperty / widthProperty);
    } else if (widthProperty > heightProperty && newWidthProperty < MIN_IMAGE_DIMENSION) {
      newHeightProperty = MIN_IMAGE_DIMENSION;
    }
    newWidthProperty = Math.round(newWidthProperty);
    newHeightProperty = Math.round(newHeightProperty);
    element.setAttribute('width', String(newWidthProperty));
    const {
      sizes,
      aspectRatio: aspectRatioStr
    } = getSizesAndAspectRatio(this.getWidth(), this.getHeight());
    element.setAttribute('sizes', sizes);
    element.style.setProperty('aspect-ratio', aspectRatioStr, 'important');
    element.style.setProperty("width", String(newWidthProperty).concat('px'));
    element.style.setProperty('max-width', '100%', 'important');
    element.setAttribute('data-width', String(newWidthProperty));
    element.setAttribute('data-height', String(newHeightProperty));
    element.classList.add('img-node');
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      img: node => ({
        conversion: convertImageElement,
        priority: 0
      })
    };
  }
  getSrc() {
    const self = this.getLatest();
    return self.__src;
  }
  getShort() {
    const self = this.getLatest();
    return self.__short;
  }
  getLong() {
    const self = this.getLatest();
    return self.__long;
  }
  setShort(s) {
    const self = this.getWritable();
    self.__short = s;
    return self;
  }
  setLong(s) {
    const self = this.getWritable();
    self.__long = s;
    return self;
  }
  setDialogOnClick(b) {
    const self = this.getWritable();
    self.__dialogOnClick = b;
    return self;
  }
  getDialogOnClick() {
    const self = this.getLatest();
    return self.__dialogOnClick;
  }
  updateDOM(_prevNode, _dom) {
    return Boolean(_prevNode.__dialogOnClick !== Boolean(_dom.getAttribute('data-dialog-click') === "true") || _prevNode.__backgroundColor !== _dom.getAttribute('data-bg-color') || _prevNode.__short !== _dom.getAttribute('alt') || _prevNode.__long !== _dom.getAttribute('data-text'));
  }
  getHeight() {
    return this.getLatest().__height;
  }
  setHeight(n) {
    const self = this.getWritable();
    self.__height = n;
    return self;
  }
  getWidth() {
    return this.getLatest().__width;
  }
  setWidth(n) {
    const self = this.getWritable();
    self.__width = n;
    return self;
  }
  getOriginalDevice() {
    const latest = this.getLatest();
    return latest.__originalDevice;
  }
  setOriginalDevice(type) {
    const self = this.getWritable();
    self.__originalDevice = type;
    return self;
  }
  setSrc(s) {
    const self = this.getWritable();
    if (s.startsWith('https://image.storething.org/')) {
      self.__src = s;
    }
  }
  getTextContent() {
    const self = this.getLatest();
    const alt = self.getShort();
    const long = self.getLong();
    const src = self.getSrc();
    return `[${alt || 'Image'}](${src})\nDescription: ${long || 'N/A'}`;
  }
  createDOM(config) {
    const span = document.createElement('span');
    span.className = 'rte-image';
    if (this.getDialogOnClick()) span.setAttribute('data-dialog-click', 'true');
    if (this.getBackgroundColor()) span.setAttribute('data-bg-color', String(this.getBackgroundColor()));
    if (this.getFirstElement()) span.classList.add('first-rte-element');
    if (this.getLastElement()) span.classList.add('last-rte-element');
    return span;
  }
  getBackgroundColor() {
    const self = this.getLatest();
    return self.__backgroundColor;
  }
  setBackgroundColor(s) {
    const self = this.getWritable();
    self.__backgroundColor = s;
    return self;
  }
  decorate(editor, config) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        const div = document.createElement('div');
        div.setAttribute('draggable', 'false');
        div.setAttribute('data-image-wrapper', 'true');
        if (this.getFirstElement()) div.classList.add('first-rte-element');
        if (this.getLastElement()) div.classList.add('last-rte-element');
        const img = document.createElement('img');
        if (this.getFirstElement()) img.classList.add('first-rte-element');
        if (this.getLastElement()) img.classList.add('last-rte-element');
        const bgColor = this.getBackgroundColor();
        if (bgColor) {
          img.style.setProperty("background-color", bgColor);
          img.setAttribute('data-bg-color', bgColor);
        }
        if (!!!this.getDialogOnClick()) {
          if (isTouchDevice()) img.addEventListener('dblclick', getOpenImageBackgroundColorDialog(this.__key, editor._config.namespace, this.getBackgroundColor(), this.getShort(), this.getLong()), true);else img.addEventListener('dblclick', getOpenImageBackgroundColorDialog(this.__key, editor._config.namespace, this.getBackgroundColor(), this.getShort(), this.getLong()), true);
        }
        img.setAttribute('src', this.getSrc());
        img.setAttribute('alt', this.getShort());
        img.setAttribute('data-text', this.getLong());
        img.setAttribute('loading', 'lazy');
        const widthProperty = this.getWidth();
        const heightProperty = this.getHeight();
        if (!!!isNaN(widthProperty)) img.setAttribute('width', String(widthProperty.toFixed(0)));
        if (!!!isNaN(widthProperty)) img.style.setProperty('width', String(widthProperty.toFixed(0)).concat('px'));
        img.style.setProperty('max-width', '100%', 'important');
        if (getDeviceType() === "desktop" && !!!isNaN(widthProperty) && !!!isNaN(heightProperty)) {
          const {
            sizes,
            aspectRatio
          } = getSizesAndAspectRatio(this.getWidth(), this.getHeight());
          img.setAttribute('sizes', sizes);
          img.style.setProperty('aspect-ratio', aspectRatio, 'important');
        } else {
          img.setAttribute('height', String(heightProperty.toFixed(0)));
          img.style.setProperty('height', String(heightProperty.toFixed(0)).concat('px'));
        }
        if (!!!this.getDialogOnClick()) {
          img.classList.add('no-click');
        } else {
          img.addEventListener('click', onImageClick, true);
        }
        img.classList.add('img-node');
        div.append(img);
        element.append(div);
        return div;
      }
    }
    return document.createElement('div');
  }
  isKeyboardSelectable() {
    return true;
  }
}
function convertImageElement(node) {
  const backgroundColorString = node.getAttribute('data-bg-color');
  var backgroundColor;
  if (typeof backgroundColorString === "string" && VALID_HEX_REGEX.test(backgroundColorString)) {
    backgroundColor = backgroundColorString;
  }
  const src = String(node.getAttribute('src'));
  const short = String(node.getAttribute('alt'));
  const long = String(node.getAttribute('data-text'));
  const widthStr = String(node.getAttribute('data-width'));
  const heightStr = String(node.getAttribute('data-height'));
  const widthNum = parseInt(widthStr);
  const heightNum = parseInt(heightStr);
  var deviceType = 'mobile';
  const deviceTypePre = node.getAttribute('data-original-device');
  if (deviceTypePre === 'mobile' || deviceTypePre === 'tablet' || deviceTypePre === 'desktop') deviceType = deviceTypePre;
  var width;
  var height;
  if (!!!isNaN(widthNum)) width = widthNum;else width = Number.NaN;
  if (!!!isNaN(heightNum)) height = heightNum;else height = Number.NaN;
  const newNode = new ImageNode({
    src,
    short,
    long,
    width,
    height,
    originalDevice: deviceType,
    backgroundColor
  });
  const first_element = node.classList.contains('first-rte-element');
  newNode.setFirstElement(first_element);
  const last_element = node.classList.contains('last-rte-element');
  newNode.setLastElement(last_element);
  return {
    node: newNode
  };
}
function $createImageNode(obj) {
  if (typeof obj.backgroundColor === "string" && !!!VALID_HEX_REGEX.test(obj.backgroundColor)) {
    obj.backgroundColor = undefined;
  }
  const editor = getCurrentEditor();
  const editorType = editor ? editor._editorType : '';
  if (obj.height > GET_MAX_IMAGE_HEIGHT(editorType) && obj.width > GET_MAX_IMAGE_WIDTH(editorType)) {
    const aspectRatio = obj.width / obj.height;
    if (aspectRatio > 1.05) {
      const newWidth = GET_MAX_IMAGE_WIDTH(editorType);
      const newHeight = GET_MAX_IMAGE_WIDTH(editorType) / aspectRatio;
      return new ImageNode({
        ...obj,
        width: newWidth,
        height: newHeight
      });
    } else {
      const newHeight = GET_MAX_IMAGE_HEIGHT(editorType);
      const newWidth = GET_MAX_IMAGE_HEIGHT(editorType) * aspectRatio;
      return new ImageNode({
        ...obj,
        width: newWidth,
        height: newHeight
      });
    }
  } else if (obj.height > GET_MAX_IMAGE_HEIGHT(editorType)) {
    const aspectRatio = obj.width / obj.height;
    const newHeight = GET_MAX_IMAGE_HEIGHT(editorType);
    const newWidth = GET_MAX_IMAGE_HEIGHT(editorType) * aspectRatio;
    return new ImageNode({
      ...obj,
      width: newWidth,
      height: newHeight
    });
  } else if (obj.width > GET_MAX_IMAGE_WIDTH(editorType)) {
    const aspectRatio = obj.width / obj.height;
    const newWidth = GET_MAX_IMAGE_WIDTH(editorType);
    const newHeight = GET_MAX_IMAGE_WIDTH(editorType) / aspectRatio;
    return new ImageNode({
      ...obj,
      width: newWidth,
      height: newHeight
    });
  } else return new ImageNode(obj);
}
function $isImageNode(node) {
  return node instanceof ImageNode;
}
const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');
const INSERT_IMAGES_COMMAND = createCommand('INSERT_IMAGES_COMMAND');
const getImg = () => {
  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;
  return img;
};
const getDOMSelection = targetWindow => (targetWindow || window)?.getSelection();
function canDropImage(event) {
  const target = event.target;
  return !!(target && isHTMLElementCustom(target) && !target.closest('code') && target.parentElement && target.parentElement.closest('div[data-rich-text-editor]'));
}
function getDragSelection(event) {
  let range;
  const target = event.target;
  const targetWindow = target == null ? null : target.nodeType === 9 ? target.defaultView : target.ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }
  return range;
}
function getDragImageData(event) {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const {
    type,
    data
  } = JSON.parse(dragData);
  if (type !== 'image') {
    return null;
  }
  return data;
}
function $getImageNodeInSelection() {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}
function $onDragStartImage(event) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(getImg(), 0, 0);
  dataTransfer.setData('application/x-lexical-drag', JSON.stringify({
    data: {
      short: node.getShort(),
      long: node.getLong(),
      height: node.getHeight(),
      key: node.getKey(),
      src: node.getSrc(),
      width: node.getWidth(),
      version: node.__version
    },
    type: 'image'
  }));
  return true;
}
function $onDragOverImage(event) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}
function $onDropImage(event, editor) {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

const CURRENT_VERSION$6 = 1;
class CarouselImageNode extends DecoratorNode {
  __version = CURRENT_VERSION$6;
  constructor(imageList, key) {
    super(key);
    this.__imageList = imageList;
  }
  static clone(node) {
    return new CarouselImageNode(node.__imageList);
  }
  static getType() {
    return 'image-carousel';
  }
  exportJSON() {
    return {
      type: this.getType(),
      version: CURRENT_VERSION$6,
      imageList: this.getImageList()
    };
  }
  static importJSON(serializedNode) {
    const node = $createCarouselImageNode(serializedNode.imageList);
    return node;
  }
  getImageList() {
    const self = this.getLatest();
    return self.__imageList;
  }
  setImageList(list) {
    const self = this.getWritable();
    self.__imageList = list;
    return self;
  }
  getMaxHeight() {
    const imageList = this.getImageList();
    const maxHeight = imageList.sort((a, b) => b.height - a.height)[0].height;
    return maxHeight;
  }
  createDOM() {
    const el = document.createElement('div');
    el.style.whiteSpace = "normal";
    el.setAttribute('data-image-carousel', "true");
    el.setAttribute("data-v", String(CURRENT_VERSION$6));
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    return el;
  }
  getTextContent() {
    const self = this.getLatest();
    const imageList = self.getImageList();
    var s = '';
    imageList.forEach(img => {
      s += `[${img.short || 'N/A'}](${img.src})\nDescription: ${img.long || 'N/A'}\n\n`;
    });
    return s;
  }
  updateDOM() {
    return false;
  }
  exportDOM(editor) {
    const div = document.createElement('div');
    div.setAttribute('data-image-list', JSON.stringify(this.getImageList()));
    div.setAttribute('data-image-carousel', "true");
    const maxHeightTemp = this.getMaxHeight();
    const maxHeight = Math.min(maxHeightTemp, GET_MAX_IMAGE_HEIGHT(editor._editorType));
    div.style.setProperty("min-height", maxHeight.toFixed(0).concat('px'));
    div.style.setProperty("max-height", maxHeight.toFixed(0).concat('px'));
    div.style.setProperty("height", maxHeight.toFixed(0).concat('px'));
    div.classList.add('block');
    return {
      element: div
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (domNode.getAttribute('data-image-carousel') !== "true") {
          return null;
        }
        return {
          conversion: convertCarouselImageElement,
          priority: COMMAND_PRIORITY_CRITICAL
        };
      }
    };
  }
  isInline() {
    return false;
  }
  decorate(editor, config) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        const carousel = createCarouselImageElement(editor, this.getImageList(), this.__key);
        element.append(carousel);
      }
    }
    return document.createElement('div');
  }
}
function convertCarouselImageElement(div) {
  try {
    const imageListStr = div.getAttribute('data-image-list');
    var imageList = JSON.parse(imageListStr);
    imageList = imageList.filter(obj => {
      return Boolean(obj && typeof obj.src === 'string' && typeof obj.short === 'string' && typeof obj.long === 'string' && typeof obj.width === "number" && typeof obj.height === "number");
    });
    if (!!!imageList.length) throw new Error('No Valid Images in ImageType array.');
    const node = $createCarouselImageNode(imageList);
    return {
      node
    };
  } catch (error) {
    return null;
  }
}
function getCarouselClick(key) {
  const onCarouselClick = function () {
    const lexical_wrapper = this.closest('div.lexical-wrapper');
    if (lexical_wrapper) {
      const id = lexical_wrapper.id;
      if (id) {
        const editor = getEditorInstances()[id];
        if (editor) {
          editor.dispatchCommand(CAROUSEL_CLICK, key);
        }
      }
    }
  };
  return onCarouselClick;
}
function resizeImageObj(editor, obj) {
  const aspectRatio = obj.width / obj.height;
  const maxWidth = GET_MAX_IMAGE_WIDTH(editor._editorType);
  const maxHeight = GET_MAX_IMAGE_HEIGHT(editor._editorType);
  if (aspectRatio > 1.2) {
    // like saying if width is greater than height
    if (obj.width > maxWidth) {
      const newWidth = maxWidth;
      const newHeight = newWidth / aspectRatio;
      return {
        width: Number(newWidth.toFixed(1)),
        height: Number(newHeight.toFixed(1))
      };
    } else {
      return {
        width: Number(obj.width.toFixed(1)),
        height: Number(obj.height.toFixed(1))
      };
    }
  } else {
    if (obj.height > maxHeight) {
      const newHeight = maxHeight;
      const newWidth = newHeight * aspectRatio;
      return {
        width: Number(newWidth.toFixed(1)),
        height: Number(newHeight.toFixed(1))
      };
    } else {
      return {
        width: Number(obj.width.toFixed(1)),
        height: Number(obj.height.toFixed(1))
      };
    }
  }
}
function createCarouselImageElement(editor, imageList, key) {
  const track = document.createElement('div');
  track.addEventListener('click', getCarouselClick(key));
  track.className = "splide__track";
  track.style.setProperty("padding-bottom", '1rem', 'important');
  const list = document.createElement('ul');
  list.className = "splide__list";
  const newImageList = imageList.map(obj => {
    const {
      width,
      height
    } = resizeImageObj(editor, obj);
    return {
      ...obj,
      width,
      height
    };
  });
  const maxHeight = newImageList.sort((a, b) => b.height - a.height)[0].height;
  for (let imageObj of imageList) {
    const listitem = document.createElement('li');
    listitem.className = "splide__slide";
    const image = document.createElement('img');
    image.className = "carousel-image";
    image.setAttribute('src', imageObj.src);
    image.setAttribute('alt', imageObj.short);
    image.setAttribute('data-text', imageObj.long);
    image.setAttribute('width', String(imageObj.width));
    image.setAttribute('height', String(imageObj.height));
    image.style.setProperty('width', String(imageObj.width).concat('px'));
    image.style.setProperty('height', String(imageObj.height).concat('px'));
    image.style.setProperty('max-height', String(maxHeight).concat('px'), 'important');
    image.style.setProperty("max-width", "100%", 'important');
    listitem.append(image);
    list.append(listitem);
  }
  track.append(list);
  const wrapper = document.createElement('div');
  wrapper.className = "splide rich-text-editor";
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', 'Image List');
  wrapper.append(track);
  return wrapper;
}
function $isCarouselImageNode(node) {
  return node instanceof CarouselImageNode;
}
function $createCarouselImageNode(imageList) {
  return new CarouselImageNode(imageList);
}
const INSERT_CAROUSEL_COMMAND = createCommand('INSERT_CAROUSEL_COMMAND');

const HTML_NODE_VERSION = 1;
const VALID_THEMES = new Set(["abcdef", "abyss", "androidstudio", "andromeda", "atomone", "aura", "bbedit", "basic light", "basic dark", "bespin", "copilot", "dracula", "darcula", "duotone light", "duotone dark", "eclipse", "github light", "github dark", "gruvbox dark", "gruvbox light", "material light", "material dark", "monokai", "monokai dimmed", "kimbie", "noctis-lilac", "nord", "okaidia", "quietlight", "red", "solarized light", "solarized dark", "sublime", "tokyo-night", "tokyo-night-storm", "tokyo-night-day", "tomorrow-night-blue", "white dark", "white light", "vscode", "xcode light", "xcode dark"]);
function getCodeEditorsHTML(html) {
  const rand = window.crypto.randomUUID();
  const themeInput = document.getElementById('code-editor-theme-main');
  const theme = themeInput && VALID_THEMES.has(themeInput.value) ? themeInput.value : 'vscode';
  const str = /*html*/`<div data-editor-wrapper id="html_wrapper_${rand}" aria-labelledby="html_tab_button_${rand}" role="tabpanel" tabindex="0">
  <div hidden id="html_ed"  data-theme="${theme}" data-type="auto"  data-codemirror="html" class="mt-2">${html}</div>
</div>`;
  return str;
}
function handleKeydownHtmlNode(e) {
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    e.stopPropagation();
  } else if (e.ctrlKey && e.key.toLowerCase() === "x") {
    e.stopPropagation();
  }
}
function handleKeyUpHtmlNode(e) {
  if (e.ctrlKey && e.key.toLowerCase() === "c") {
    e.stopPropagation();
  } else if (e.ctrlKey && e.key.toLowerCase() === "x") {
    e.stopPropagation();
  }
}
class HtmlNode extends DecoratorBlockNode {
  __version = HTML_NODE_VERSION;
  __editable = true;
  constructor(html, key) {
    super(undefined, key);
    if (html) {
      this.__html = html;
    } else {
      this.__html = /*html*/`<p class='body1 custom'>
Double click inside the custom HTML to edit the html.
Learn about the basics of HTML using the <a class="secondary link" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML">mdn web docs on HTML</a>. 
</p>`;
    }
  }
  static clone(node) {
    return new HtmlNode(node.getHtml());
  }
  static getType() {
    return 'html';
  }
  getEditable() {
    return this.__editable;
  }
  setEditable(b) {
    const self = this.getWritable();
    self.__editable = b;
    return self;
  }
  getHtml() {
    const self = this.getLatest();
    return self.__html;
  }
  setHtml(html) {
    const self = this.getWritable();
    self.__html = html;
  }
  getTextContent() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getHtml();
    return String(wrapper.textContent || '');
  }
  setFormat(format) {
    const self = this.getWritable();
    self.__format = 'left';
  }
  static importJSON(serializedNode) {
    const node = $createHtmlNode(serializedNode.html);
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  updateDOM(_prevNode, _dom, _config) {
    return _prevNode.getEditable() !== this.getEditable();
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: this.getType(),
      version: HTML_NODE_VERSION,
      html: this.getHtml(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM() {
    const element = createHtmlElement(this.getHtml());
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (domNode.hasAttribute('data-custom-code')) {
          return {
            conversion: convertHtmlNode,
            priority: 4
          };
        } else {
          return null;
        }
      }
    };
  }
  decorate(editor, config) {
    const el = createHtmlElement(this.getHtml());
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    if (this.getEditable()) {
      el.addEventListener('dblclick', e => {
        if (editor.isEditable()) {
          document.dispatchEvent(new CustomEvent('REGISTER_LEXICAL_CODE_EDITOR', {
            detail: el
          }));
          if (el.getAttribute('data-editing') === "false") {
            editor.getEditorState().read(() => {
              const html = getCodeEditorsHTML(this.getHtml());
              el.innerHTML = '';
              el.innerHTML = html;
              el.dispatchEvent(new CustomEvent('INSERT_LEXICAL_CODE_EDITORS'));
              el.setAttribute('data-editing', 'true');
              el.addEventListener('keydown', handleKeydownHtmlNode);
              el.addEventListener('keydown', handleKeyUpHtmlNode);
            });
          }
        }
      });
      el.addEventListener('focusout', e => {
        if (el.getAttribute('data-editing') === 'true') {
          el.dispatchEvent(new CustomEvent('GET_LEXICAL_EDITORS_CODE')); // get the code for the HTML and CSS code editors that are descendants of this node
        }

        el.removeEventListener('keydown', handleKeydownHtmlNode);
        el.removeEventListener('keydown', handleKeyUpHtmlNode);
      });
      // @ts-ignore
      el.addEventListener('GOT_LEXICAL_EDITORS_CODE', e => {
        if (e && e.detail && typeof e.detail.html === 'string') editor.update(() => {
          el.setAttribute('data-editing', 'false');
          this.setHtml(e.detail.html);
          el.dispatchEvent(new CustomEvent('REMOVE_LEXICAL_CODE_EDITORS'));
          el.innerHTML = '';
          const {
            htmlDiv
          } = createInnerHTML(e.detail.html);
          el.append(htmlDiv);
        });
      });
    }
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        element.append(el);
      }
    }
    return el;
  }
}
function createInnerHTML(html) {
  const div2 = document.createElement('div');
  div2.setAttribute('data-html', '');
  div2.insertAdjacentHTML("beforeend", html);
  return {
    htmlDiv: div2
  };
}
function createHtmlElement(html) {
  const div = document.createElement('div');
  div.setAttribute('data-custom-code', '');
  div.setAttribute('data-editing', 'false');
  const {
    htmlDiv
  } = createInnerHTML(html);
  div.append(htmlDiv);
  return div;
}
function convertHtmlNode(domNode) {
  const htmlNodeArr = Array.from(domNode.children).filter(node => node.nodeName === 'DIV' && node.hasAttribute('data-html'));
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
  return {
    node
  };
}
function $createHtmlNode(html) {
  return new HtmlNode(html);
}
function $isHtmlNode(node) {
  return node instanceof HtmlNode;
}
const INSERT_HTML_COMMAND = createCommand('INSERT_HTML_COMMAND');
function onHtmlClick() {
  const editor = getCurrentEditor();
  if (editor) {
    editor.dispatchCommand(INSERT_HTML_COMMAND, `<h1 style="padding: 6px; border-radius: 6px; background: linear-gradient(217deg, rgba(255, 0, 0, 0.8), rgba(255, 0, 0, 0) 70.71%), linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%), linear-gradient(336deg, rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0) 70.71%); color: black; border: 3px dotted blue;" class="bold">Double click to edit the HTML node.</h1>
<p>You can learn more about what is allowed in custom HTML nodes <a href="https://frankmbrown.net/blog/22/Rich%20Text%20Editor%20Implementation?version=1" target="_blank">Here</a>.</p>`);
  }
}
function registerHTMLNodeEditable(editor) {
  if (editor.hasNode(HtmlNode)) {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if (wrapper) {
      const htmlButton = document.querySelector('button[data-custom-html-btn]');
      if (htmlButton) {
        htmlButton.addEventListener('click', onHtmlClick);
      }
    }
    return mergeRegister(editor.registerCommand(INSERT_HTML_COMMAND, payload => {
      if (typeof payload === 'string') {
        const node = $createHtmlNode(payload);
        $insertNodeToNearestRoot(node);
      }
      return true;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error('HtmlNode not registered on editor.');
    return () => {};
  }
}
function registerHTMLNodeNotEditable(editor) {
  return mergeRegister(editor.registerEditableListener(editable => {
    editor.update(() => {
      const htmlNodes = $nodesOfType(HtmlNode);
      if (editable) {
        htmlNodes.forEach(node => {
          node.setEditable(false);
        });
      } else {
        htmlNodes.forEach(node => {
          node.setEditable(true);
        });
      }
    });
  }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
    const htmlNodes = $nodesOfType(HtmlNode);
    htmlNodes.forEach(node => {
      if (node.getEditable()) node.setEditable(false);
    });
    return false;
  }, COMMAND_PRIORITY_EDITOR));
}

const CURRENT_VERSION$5 = 1;
class InstagramNode extends DecoratorBlockNode {
  static getType() {
    return 'instagram';
  }
  static clone(node) {
    return new InstagramNode(node.getHTML(), node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const {
      html
    } = serializedNode;
    const node = $createInstagramNode(html);
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      type: this.getType(),
      first_element: this.getFirstElement(),
      version: CURRENT_VERSION$5
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-instagram') || Boolean(domNode.innerHTML.length === 0)) {
          return null;
        }
        return {
          conversion: convertInstagramElement,
          priority: 3
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getHTML());
    element.setAttribute('data-instagram', '');
    element.classList.add('instagram-wrapper');
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  constructor(html, format, key) {
    super("center", key);
    this.__html = html;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  decorate(editor, config) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    div.setAttribute('data-instagram', '');
    div.classList.add('instagram-wrapper');
    div.insertAdjacentHTML('afterbegin', this.getHTML());
    if (decoratorNodeElement && decoratorNodeElement.children.length === 0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertInstagramElement(domNode) {
  const html = domNode.innerHTML;
  const node = $createInstagramNode(html);
  if (domNode.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (domNode.classList.contains('last-rte-element')) node.setLastElement(true);
  return {
    node
  };
}
function $createInstagramNode(html) {
  return new InstagramNode(html);
}
function $isInstagramNode(node) {
  return node instanceof InstagramNode;
}
const EMBED_INSTA_COMMAND = createCommand('EMBED_INSTA_COMMAND');
function handleInstagramFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  try {
    const textarea = this.querySelector('textarea');
    if (!!!textarea) throw new Error("Unable to find textarea to embed instagram post.");
    const value = textarea.value;
    if (value && value.length) {
      import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
        const str = res.validateInstagramEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_INSTA_COMMAND, str);
          textarea.value = '';
          if (dialog) closeDialog(dialog);
          if (dialog) {
            const errorAlert = dialog.querySelector('div[data-embed-error]');
            if (errorAlert) errorAlert.setAttribute('hidden', '');
          }
        }
      }).catch(e => {
        console.error(e);
        if (dialog) {
          const errorAlert = dialog.querySelector('div[data-embed-error]');
          if (errorAlert) errorAlert.removeAttribute('hidden');
        }
      });
    }
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}
function getOnOpenInstagramDialog(e) {
  if (e.detail.el.id === "lex-embed-instagram") {
    const dialog = document.getElementById('lex-embed-instagram');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleInstagramFormSubmit);
      }
    }
    document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
      detail: {
        dialog: dialog
      }
    }));
  }
}
function registerInstagramEditable(editor) {
  if (editor.hasNode(InstagramNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenInstagramDialog);
    return mergeRegister(editor.registerCommand(EMBED_INSTA_COMMAND, embedCode => {
      const node = $createInstagramNode(embedCode);
      $insertNodeToNearestRoot(node);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_INSTAGRAM'));
      }, 500);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(InstagramNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("EMBED_INSTAGRAM"));
          }, 500);
        }
      }
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const instagramNodes = $nodesOfType(InstagramNode);
      if (instagramNodes.length) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("EMBED_INSTAGRAM"));
        }, 1000);
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have InstagramNode registered.");
    return () => {};
  }
}

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const CAN_USE_DOM = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';

var TwitterMutationObserver = null;
function setMinHeightOnElement(element, calculatedHeight) {
  if (calculatedHeight) {
    const device = calculatedHeight.deviceDetected;
    if (device === "desktop") {
      if (calculatedHeight.deviceDetected !== "mobile") {
        element.style.setProperty('min-height', String(calculatedHeight.height).concat('px'));
      } else {
        if (calculatedHeight.height > 700) {
          element.style.setProperty('min-height', '550px');
        } else {
          element.style.setProperty('min-height', String(calculatedHeight.height).concat('px'));
        }
      }
    } else if (device === "mobile") {
      if (calculatedHeight.deviceDetected === "mobile") {
        element.style.setProperty('min-height', String(calculatedHeight.height).concat('px'));
      } else {
        if (calculatedHeight.height > 500) {
          element.style.setProperty('min-height', '700px');
        } else {
          element.style.setProperty('min-height', String(calculatedHeight.height).concat('px'));
        }
      }
    }
  } else {
    element.style.setProperty('min-height', '300px');
  }
}
function twitterMutationObserverCallback(records, mutationObserver) {
  for (let record of records) {
    if (record.target.nodeName === "IFRAME") {
      const iframe = record.target;
      const rect = iframe.getBoundingClientRect();
      if (rect) {
        const height = rect.height;
        if (height > 300) {
          const wrapperNode = iframe.closest('div[data-frank-decorator="true"]');
          const wrapper = iframe.closest('div.lexical-wrapper');
          if (wrapperNode && wrapper) {
            const key = wrapperNode.getAttribute('data-node-key');
            const id = wrapper.id;
            const instances = getEditorInstances();
            if (instances[id] && /\d+/.test(String(key))) {
              const editor = instances[id];
              editor.update(() => {
                const node = $getNodeByKey(String(key));
                if ($isTwitterNode(node)) {
                  node.setCalculatedHeight({
                    height,
                    deviceDetected: getDeviceType()
                  });
                }
              });
            }
          }
        }
      }
    }
  }
}
(() => {
  if (CAN_USE_DOM && typeof window.MutationObserver !== undefined) {
    TwitterMutationObserver = new window.MutationObserver(twitterMutationObserverCallback);
  }
})();
const twitterSocialMutationObserverOptions = {
  childList: true,
  subtree: true,
  attributes: true
};
const CURRENT_VERSION$4 = 1;
class TwitterNode extends DecoratorBlockNode {
  static getType() {
    return 'twitter';
  }
  static clone(node) {
    return new TwitterNode({
      html: node.getHTML(),
      calculatedHeight: node.getCalculatedHeight()
    }, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const {
      html,
      calculatedHeight
    } = serializedNode;
    const node = $createTwitterNode({
      html,
      calculatedHeight
    });
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      calculatedHeight: this.getCalculatedHeight(),
      type: this.getType(),
      version: CURRENT_VERSION$4,
      first_element: this.getFirstElement()
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-twitter') || Boolean(domNode.innerHTML.length === 0)) {
          return null;
        }
        return {
          conversion: convertTwitterElement,
          priority: 3
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getHTML());
    element.setAttribute('data-twitter', '');
    element.classList.add('twitter-wrapper');
    const calclatedHeight = this.getCalculatedHeight();
    if (calclatedHeight) {
      element.setAttribute('data-calculated-height-num', String(calclatedHeight.height));
      element.setAttribute('data-calculated-height-device', String(calclatedHeight.deviceDetected));
    }
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    setMinHeightOnElement(element, calclatedHeight);
    return {
      element
    };
  }
  constructor(obj, format, key) {
    super("center", key);
    this.__html = obj.html;
    if (obj.calculatedHeight) this.__calculatedHeight = obj.calculatedHeight;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  setCalculatedHeight(inp) {
    const self = this.getWritable();
    self.__calculatedHeight = inp;
    return self;
  }
  getCalculatedHeight() {
    const self = this.getLatest();
    return self.__calculatedHeight;
  }
  decorate(editor, config) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    div.setAttribute('data-twitter', '');
    div.insertAdjacentHTML('afterbegin', this.getHTML());
    div.classList.add('twitter-wrapper');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    if (decoratorNodeElement && decoratorNodeElement.children.length === 0) {
      if (TwitterMutationObserver && editor.isEditable() && !!!this.getCalculatedHeight()) {
        TwitterMutationObserver.observe(div, twitterSocialMutationObserverOptions);
      }
      setMinHeightOnElement(div, this.getCalculatedHeight());
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertTwitterElement(domNode) {
  const html = domNode.innerHTML;
  const calcHeightStr = domNode.getAttribute('data-calculated-height-num');
  const calcHeightDev = domNode.getAttribute('data-calculated-height-device');
  const calcHeightNum = parseInt(String(calcHeightStr));
  const first_element = domNode.classList.contains('first-rte-element');
  const last_element = domNode.classList.contains('last-rte-element');
  if (Number.isInteger(calcHeightNum) && (calcHeightDev === "desktop" || calcHeightDev === "tablet" || calcHeightDev === "mobile")) {
    const node = $createTwitterNode({
      html,
      calculatedHeight: {
        height: calcHeightNum,
        deviceDetected: calcHeightDev
      }
    });
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  } else {
    const node = $createTwitterNode({
      html
    });
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {
      node
    };
  }
}
function $createTwitterNode(obj) {
  return new TwitterNode(obj);
}
function $isTwitterNode(node) {
  return node instanceof TwitterNode;
}
const EMBED_TWEET_COMMAND = createCommand('EMBED_TWEET_COMMAND');
function handleTwitterFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  try {
    const textarea = this.querySelector('textarea');
    if (!!!textarea) throw new Error("Unable to find textarea to embed tweet.");
    const value = textarea.value;
    if (value && value.length) {
      import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
        const str = res.validateTwitterEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_TWEET_COMMAND, str);
          textarea.value = '';
          if (dialog) closeDialog(dialog);
          if (dialog) {
            const errorAlert = dialog.querySelector('div[data-embed-error]');
            if (errorAlert) errorAlert.setAttribute('hidden', '');
          }
        }
      }).catch(e => {
        console.error(e);
        if (dialog) {
          const errorAlert = dialog.querySelector('div[data-embed-error]');
          if (errorAlert) errorAlert.removeAttribute('hidden');
        }
      });
    }
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}
function getOnOpenTwittersDialog(e) {
  if (e.detail.el.id === "lex-embed-twitter") {
    const dialog = document.getElementById('lex-embed-twitter');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleTwitterFormSubmit);
      }
      document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
        detail: {
          dialog: dialog
        }
      }));
    }
  }
}
function registerTwitterEditable(editor) {
  if (editor.hasNode(TwitterNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenTwittersDialog);
    return mergeRegister(editor.registerCommand(EMBED_TWEET_COMMAND, embedCode => {
      const node = $createTwitterNode({
        html: embedCode
      });
      $insertNodeToNearestRoot(node);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_TWITTER'));
      }, 500);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(TwitterNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("EMBED_TWITTER"));
          }, 500);
        }
      }
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const tiktokNodes = $nodesOfType(TwitterNode);
      if (tiktokNodes.length) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("EMBED_TWITTER"));
        }, 1000);
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have TwitterNode registered.");
    return () => {};
  }
}

const CURRENT_VERSION$3 = 1;
class RedditNode extends DecoratorBlockNode {
  static getType() {
    return 'reddit';
  }
  static clone(node) {
    return new RedditNode({
      html: node.getHTML(),
      minHeight: node.getMinHeight()
    }, node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const {
      html,
      minHeight
    } = serializedNode;
    const node = $createRedditNode({
      html,
      minHeight
    });
    node.setFormat('center');
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      minHeight: this.getMinHeight(),
      type: this.getType(),
      version: CURRENT_VERSION$3
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-reddit') || Boolean(domNode.innerHTML.length === 0)) {
          return null;
        }
        return {
          conversion: convertRedditElement,
          priority: 3
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement('div');
    element.style.setProperty('min-height', String(this.getMinHeight()).concat('px'));
    element.insertAdjacentHTML('afterbegin', this.getHTML());
    element.setAttribute('data-reddit', '');
    element.setAttribute('data-min-height', String(this.getMinHeight()));
    element.classList.add('reddit-wrapper');
    return {
      element
    };
  }
  constructor(obj, format, key) {
    super("center", key);
    this.__html = obj.html;
    this.__minHeight = obj.minHeight;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  getMinHeight() {
    const self = this.getLatest();
    return self.__minHeight;
  }
  decorate(editor, config) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    div.setAttribute('data-reddit', '');
    div.style.setProperty('min-height', String(this.getMinHeight()).concat('px'));
    div.insertAdjacentHTML('afterbegin', this.getHTML());
    div.classList.add('reddit-wrapper');
    if (decoratorNodeElement && decoratorNodeElement.children.length === 0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertRedditElement(domNode) {
  const html = domNode.innerHTML;
  const minHeight = domNode.getAttribute('data-min-height');
  const node = $createRedditNode({
    html,
    minHeight: Number(minHeight)
  });
  return {
    node
  };
}
function $createRedditNode(obj) {
  return new RedditNode(obj);
}
function $isRedditNode(node) {
  return node instanceof RedditNode;
}
const EMBED_REDDIT_COMMAND = createCommand('EMBED_REDDIT_COMMAND');
function handleRedditFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  try {
    const textarea = this.querySelector('textarea');
    if (!!!textarea) throw new Error("Unable to find textarea to embed tweet.");
    const value = textarea.value;
    if (value && value.length) {
      import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
        const {
          html: str,
          minHeight
        } = res.validateRedditEmbed(value);
        const editor = getCurrentEditor();
        if (editor) {
          editor.dispatchCommand(EMBED_REDDIT_COMMAND, str);
          textarea.value = '';
          if (dialog) closeDialog(dialog);
          if (dialog) {
            const errorAlert = dialog.querySelector('div[data-embed-error]');
            if (errorAlert) errorAlert.setAttribute('hidden', '');
          }
        }
      }).catch(e => {
        console.error(e);
        if (dialog) {
          const errorAlert = dialog.querySelector('div[data-embed-error]');
          if (errorAlert) errorAlert.removeAttribute('hidden');
        }
      });
    }
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}
function registerRedditEditable(editor) {
  if (editor.hasNode(RedditNode)) {
    const dialog = document.getElementById('lex-embed-reddit');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleRedditFormSubmit);
      }
    }
    return mergeRegister(editor.registerCommand(EMBED_REDDIT_COMMAND, embedCode => {
      const node = $createRedditNode(embedCode);
      $insertNodeToNearestRoot(node);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_REDDIT'));
      }, 500);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(RedditNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("EMBED_REDDIT"));
          }, 500);
        }
      }
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const redditNodes = $nodesOfType(RedditNode);
      if (redditNodes.length) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("EMBED_REDDIT"));
        }, 1000);
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have RedditNode registered.");
    return () => {};
  }
}

const CURRENT_VERSION$2 = 1;
class TikTokNode extends DecoratorBlockNode {
  static getType() {
    return 'tiktok';
  }
  static clone(node) {
    return new TikTokNode(node.getHTML(), node.__format, node.__key);
  }
  static importJSON(serializedNode) {
    const {
      html
    } = serializedNode;
    const node = $createTikTokNode(html);
    node.setFormat('center');
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      html: this.getHTML(),
      type: this.getType(),
      version: CURRENT_VERSION$2
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (!domNode.hasAttribute('data-tiktok') || Boolean(domNode.innerHTML.length === 0)) {
          return null;
        }
        return {
          conversion: convertTikTokElement,
          priority: 3
        };
      }
    };
  }
  exportDOM() {
    const element = document.createElement('div');
    element.insertAdjacentHTML('afterbegin', this.getHTML());
    element.setAttribute('data-tiktok', '');
    element.classList.add('tiktok-wrapper');
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {
      element
    };
  }
  constructor(html, format, key) {
    super("center", key);
    this.__html = html;
  }
  getHTML() {
    const self = this.getLatest();
    return self.__html;
  }
  decorate(editor, config) {
    const decoratorNodeElement = editor.getElementByKey(this.__key);
    const div = document.createElement('div');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    div.setAttribute('data-tiktok', '');
    div.insertAdjacentHTML('afterbegin', this.getHTML());
    div.classList.add('tiktok-wrapper');
    div.addEventListener("load", () => {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_TIKTOK'));
      }, 500);
    });
    if (decoratorNodeElement && decoratorNodeElement.children.length === 0) {
      decoratorNodeElement.append(div);
    }
    return div;
  }
}
function convertTikTokElement(domNode) {
  const html = domNode.innerHTML;
  const node = $createTikTokNode(html);
  if (domNode.classList.contains('first-rte-element')) node.setFirstElement(true);
  if (domNode.classList.contains('last-rte-element')) node.setLastElement(true);
  return {
    node
  };
}
function $createTikTokNode(html) {
  return new TikTokNode(html);
}
function $isTikTokNode(node) {
  return node instanceof TikTokNode;
}
const EMBED_TikTok_COMMAND = createCommand('EMBED_TikTok_COMMAND');
function handleTikTokFormSubmit(e) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest('div.dialog-wrapper');
  try {
    const input = this.querySelector('input[type="url"]');
    if (!!!input) throw new Error("Unable to find textarea to embed tweet.");
    const urlInit = input.value;
    const url = new URL('https://www.tiktok.com/oembed');
    url.searchParams.append('url', urlInit);
    fetch(url).then(res => {
      if (res.status !== 200) {
        throw new Error("Something went wrong handling TikTok embed.");
      }
      return res.json();
    }).then(res => {
      const {
        html: value
      } = res;
      if (typeof value === 'string' && value.length) {
        import( /* webpackChunkName: "personal-website-shared" */'../personal-website-shared').then(res => {
          const str = res.validateTikTokEmbed(value);
          const editor = getCurrentEditor();
          if (editor) {
            editor.dispatchCommand(EMBED_TikTok_COMMAND, str);
            input.value = '';
            if (dialog) closeDialog(dialog);
            if (dialog) {
              const errorAlert = dialog.querySelector('div[data-embed-error]');
              if (errorAlert) errorAlert.setAttribute('hidden', '');
            }
          }
        }).catch(e => {
          console.error(e);
          if (dialog) {
            const errorAlert = dialog.querySelector('div[data-embed-error]');
            if (errorAlert) errorAlert.removeAttribute('hidden');
          }
        });
      }
    }).catch(e => {
    });
  } catch (e) {
    console.error(e);
    if (dialog) {
      const errorAlert = dialog.querySelector('div[data-embed-error]');
      if (errorAlert) errorAlert.removeAttribute('hidden');
    }
  }
}
function getOnOpenTikToksDialog(e) {
  if (e.detail.el.id === "lex-embed-tiktok") {
    const dialog = document.getElementById('lex-embed-tiktok');
    if (dialog) {
      const form = dialog.querySelector('form');
      if (form) {
        form.addEventListener('submit', handleTikTokFormSubmit);
      }
      document.dispatchEvent(new CustomEvent('OPEN_DIALOG_FINAL', {
        detail: {
          dialog: dialog
        }
      }));
    }
  }
}
function registerTikTokEditable(editor) {
  if (editor.hasNode(TikTokNode)) {
    document.addEventListener('OPEN_LEXICAL_DIALOG_FINAL', getOnOpenTikToksDialog);
    return mergeRegister(editor.registerCommand(EMBED_TikTok_COMMAND, embedCode => {
      const node = $createTikTokNode(embedCode);
      $insertNodeToNearestRoot(node);
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('EMBED_TIKTOK'));
      }, 500);
      return true;
    }, COMMAND_PRIORITY_EDITOR), editor.registerMutationListener(TikTokNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent("EMBED_TIKTOK"));
          }, 500);
        }
      }
    }), editor.registerCommand(UPDATE_ON_SET_HTML, () => {
      const tiktokNodes = $nodesOfType(TikTokNode);
      if (tiktokNodes.length) {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent("EMBED_TIKTOK"));
        }, 1000);
      }
      return false;
    }, COMMAND_PRIORITY_EDITOR));
  } else {
    console.error("Editor does not have TikTokNode registered.");
    return () => {};
  }
}

const CURRENT_VERSION$1 = 1;
class LoadingNode extends DecoratorNode {
  __version = CURRENT_VERSION$1;
  constructor(obj, key) {
    super(key);
    if (obj && obj.size) this.__size = obj.size;else this.__size = 'medium';
    if (obj && typeof obj.inline === "boolean") this.__inline = obj.inline;else this.__inline = true;
  }
  static clone(node) {
    return new LoadingNode({
      size: node.__size,
      inline: node.__inline
    });
  }
  static getType() {
    return 'loading-node';
  }
  exportJSON() {
    return {
      type: this.getType(),
      version: CURRENT_VERSION$1,
      size: this.getSize(),
      inline: this.getInline()
    };
  }
  static importJSON(serializedNode) {
    const {
      size,
      inline
    } = serializedNode;
    const node = $createLoadingNode({
      size,
      inline
    });
    return node;
  }
  getSize() {
    const self = this.getLatest();
    return self.__size;
  }
  setSize(s) {
    const self = this.getWritable();
    self.__size = s;
    return self;
  }
  getInline() {
    const self = this.getLatest();
    return self.__inline;
  }
  setInline(inline) {
    const self = this.getWritable();
    self.__inline = inline;
    return self;
  }
  createDOM() {
    const span = document.createElement('span');
    span.setAttribute('data-lex-loader', 'true');
    span.setAttribute('data-v', String(CURRENT_VERSION$1));
    if (this.getFirstElement()) span.classList.add('first-rte-element');
    if (this.getLastElement()) span.classList.add('last-rte-element');
    return span;
  }
  getTextContent() {
    return 'Loading...';
  }
  updateDOM() {
    return false;
  }
  exportDOM(editor) {
    const span = document.createElement('span');
    span.setAttribute('data-lex-loader', 'true');
    const inline = this.getInline();
    const size = this.getSize();
    span.classList.add('css-loader');
    if (inline) {
      span.classList.add('primary');
    } else {
      span.classList.add('block', 'secondary');
      span.style.setProperty("margin", "3px auto", "important");
    }
    span.classList.add(size);
    return {
      element: span
    };
  }
  static importDOM() {
    return {
      span: domNode => {
        if (domNode.getAttribute('data-lex-loader') !== 'true') return null;
        return {
          conversion: convertLoadingElement,
          priority: COMMAND_PRIORITY_CRITICAL
        };
      }
    };
  }
  isInline() {
    return this.__inline;
  }
  decorate(editor, config) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        const span = document.createElement('span');
        if (!!!this.getInline()) {
          span.classList.add('block', 'secondary');
          span.style.setProperty("margin", '3px auto');
        } else {
          span.classList.add('primary');
        }
        const size = this.getSize();
        span.classList.add('css-loader', size);
        element.append(span);
      }
    }
    return document.createElement('span');
  }
}
function convertLoadingElement(domNode) {
  var size;
  if (domNode.classList.contains('small')) size = 'small';else if (domNode.classList.contains('large')) size = 'large';else size = 'medium';
  const block = domNode.classList.contains('block');
  const node = $createLoadingNode({
    size,
    inline: !!!block
  });
  return {
    node
  };
}
function $isLoadingNode(node) {
  return node instanceof LoadingNode;
}
function $createLoadingNode({
  size,
  inline
}) {
  return new LoadingNode({
    size,
    inline
  });
}

const CURRENT_VERSION = 1;
class AiChatNode extends DecoratorNode {
  __version = CURRENT_VERSION;
  constructor(obj, key) {
    super(key);
    this.__chat_id = obj.chat_id;
    this.__html = obj.html;
    this.__chat_name = obj.chat_name;
  }
  static clone(node) {
    return new AiChatNode({
      chat_id: node.__chat_id,
      chat_name: node.__chat_name,
      html: node.__html
    });
  }
  static getType() {
    return 'ai-chat-node';
  }
  exportJSON() {
    return {
      type: this.getType(),
      version: CURRENT_VERSION,
      html: this.getHTML(),
      chat_id: this.getChatID(),
      chat_name: this.getChatName()
    };
  }
  static importJSON({
    chat_id,
    chat_name,
    html
  }) {
    const node = $createAiChatNode({
      chat_id,
      chat_name,
      html
    });
    return node;
  }
  getHTML() {
    const latest = this.getLatest();
    return latest.__html;
  }
  setHTML(s) {
    const writable = this.getWritable();
    writable.__html = s;
    return writable;
  }
  getChatID() {
    const latest = this.getLatest();
    return latest.__chat_id;
  }
  setChatID(s) {
    const writable = this.getWritable();
    writable.__chat_id = s;
    return writable;
  }
  getChatName() {
    const latest = this.getLatest();
    return latest.__chat_name;
  }
  setChatName(s) {
    const writable = this.getWritable();
    writable.__chat_name = s;
    return writable;
  }
  createDOM() {
    const div = document.createElement('div');
    div.setAttribute('data-ai-chat', 'true');
    div.setAttribute('data-chat-name', this.getChatName());
    div.setAttribute('data-chat-id', this.getChatID());
    div.classList.add('ai-chat-lexical');
    if (this.getFirstElement()) div.classList.add('first-rte-element');
    if (this.getLastElement()) div.classList.add('last-rte-element');
    return div;
  }
  getTextContent() {
    return this.getHTML();
  }
  updateDOM() {
    return false;
  }
  exportDOM(editor) {
    const div = document.createElement('div');
    div.setAttribute('data-ai-chat', 'true');
    div.setAttribute('data-chat-name', this.getChatName());
    div.setAttribute('data-chat-id', this.getChatID());
    div.insertAdjacentHTML('afterbegin', this.getHTML());
    div.classList.add('ai-chat-lexical');
    if (this.getFirstElement() && !!!IS_REAL_BROWSER) div.classList.add('first-rte-element');
    if (this.getLastElement() && !!!IS_REAL_BROWSER) div.classList.add('last-rte-element');
    return {
      element: div
    };
  }
  static importDOM() {
    return {
      div: domNode => {
        if (domNode.getAttribute('data-ai-chat') !== "true" || !!!domNode.getAttribute('data-chat-name') || !!!domNode.getAttribute('data-chat-id')) {
          return null;
        }
        return {
          conversion: convertAIChatElement,
          priority: COMMAND_PRIORITY_CRITICAL
        };
      }
    };
  }
  isInline() {
    return false;
  }
  decorate(editor, config) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length === 0) {
        element.innerHTML = this.getHTML();
      }
    }
    return document.createElement('div');
  }
}
function convertAIChatElement(div) {
  try {
    const chat_name = div.getAttribute('data-chat-name');
    const chat_id = div.getAttribute('data-chat-id');
    const html = div.innerHTML;
    if (!!!chat_id || !!!chat_name) {
      return null;
    }
    const node = $createAiChatNode({
      chat_name,
      chat_id,
      html
    });
    return {
      node
    };
  } catch (error) {
    return null;
  }
}
function $isAiChatNode(node) {
  return node instanceof AiChatNode;
}
function $createAiChatNode({
  chat_id,
  chat_name,
  html
}) {
  return new AiChatNode({
    chat_id,
    chat_name,
    html
  });
}
const INSERT_AI_CHAT_NODE = createCommand('INSERT_AI_CHAT_NODE');

export { $createAiChatNode, $createAudioNode, $createCarouselImageNode, $createHorizontalRuleNode, $createImageNode, $createInstagramNode, $createLoadingNode, $createNewsNode, $createRedditNode, $createTikTokNode, $createTwitterNode, $createVideoNode, $createYouTubeNode, $isAiChatNode, $isAudioNode, $isCarouselImageNode, $isDecoratorBlockNode, $isHorizontalRuleNode, $isHtmlNode, $isImageNode, $isInstagramNode, $isLoadingNode, $isNewsNode, $isRedditNode, $isTikTokNode, $isTwitterNode, $isVideoNode, $isYouTubeNode, $onDragOverImage, $onDragStartImage, $onDropImage, AiChatNode, AudioNode, CarouselImageNode, DecoratorBlockNode, FORMAT_HORIZONTAL_RULE_COMMAND$1 as FORMAT_HORIZONTAL_RULE_COMMAND, GET_MAX_IMAGE_HEIGHT, GET_MAX_IMAGE_WIDTH, HorizontalRuleNode, HtmlNode, INSERT_AI_CHAT_NODE, INSERT_AUDIO_NODE$1 as INSERT_AUDIO_NODE, INSERT_AUDIO_NODES, INSERT_CAROUSEL_COMMAND, INSERT_HORIZONTAL_RULE_COMMAND$1 as INSERT_HORIZONTAL_RULE_COMMAND, INSERT_HTML_COMMAND, INSERT_IMAGES_COMMAND, INSERT_IMAGE_COMMAND, INSERT_NEWS_NODE$1 as INSERT_NEWS_NODE, INSERT_YOUTUBE_COMMAND$1 as INSERT_YOUTUBE_COMMAND, ImageNode, InstagramNode, LoadingNode, MIN_IMAGE_DIMENSION, NewsNode, RedditNode, TikTokNode, TwitterNode, VALID_ALIGN_DECORATOR_BLOCK, VideoNode, YOUTUBE_REGEX, YouTubeNode, registerDecoratorsEditable, registerDecoratorsNotEditable, registerHTMLNodeEditable, registerHTMLNodeNotEditable, registerHorizontalRule, registerInstagramEditable, registerNewsNode, registerRedditEditable, registerTikTokEditable, registerTwitterEditable, registerYoutube, validateYoutubeUrl };
