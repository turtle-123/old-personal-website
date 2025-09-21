/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
  LexicalCommand
} from 'lexical';
import { createCommand, COMMAND_PRIORITY_EDITOR } from 'lexical';
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode,
} from './DecoratorBlockNode';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import { IS_REAL_BROWSER } from '@lexical/shared';

export type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedDecoratorBlockNode
>;
const CURRENT_VERSION = 1;


export class YouTubeNode extends DecoratorBlockNode {
  __id: string;
  __version: number = CURRENT_VERSION;

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }
  
  static getType(): string {
    return 'youtube';
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const node = $createYouTubeNode(serializedNode.videoID);
    node.setFormat(serializedNode.format);
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      type: 'youtube',
      version: CURRENT_VERSION,
      videoID: this.__id,
      first_element: this.getFirstElement()
    };
  }

  exportDOM(): DOMExportOutput {
    const element = setYoutubeIframe(document.createElement('iframe'),this.getId(),this.__format);
    element.setAttribute('loading','lazy');
    element.setAttribute('data-text-align',this.__format);
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-frank-youtube')) {
          return null;
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined,
  ): string {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }

  decorate(editor: LexicalEditor, config: EditorConfig) {
    const el = setYoutubeIframe(document.createElement('iframe'),this.getId(),this.__format);
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0) {
        element.append(el);
      } else {
        element.style.textAlign = this.__format;
      }
    }
    return el;
  }
}

function setYoutubeIframe(el: HTMLIFrameElement,id: string,textAlign:string) {
  el.classList.add('youtube-embed');
  el.setAttribute('width','560');
  el.setAttribute('height','315');
  el.setAttribute('src','https://www.youtube-nocookie.com/embed/'.concat(id))
  el.setAttribute('frameborder','0');
  el.setAttribute('allow',"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
  el.setAttribute('allowfullscreen','true');
  el.setAttribute('data-frank-youtube','');
  el.setAttribute('loading','lazy');
  el.style.textAlign = textAlign;
  return el;
}

function convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('src');
  if (videoID) {
    const node = $createYouTubeNode(videoID.replace('https://www.youtube-nocookie.com/embed/',''));
    const tempTextAlign = domNode.getAttribute('data-text-align');
    if(tempTextAlign==='left'||tempTextAlign==='center'||tempTextAlign==='right'||tempTextAlign==='justify') {
      node.setFormat(tempTextAlign);
    }
    const first_element = domNode.classList.contains('first-rte-element');
    const last_element = domNode.classList.contains('last-rte-element');
    node.setFirstElement(first_element);
    node.setLastElement(last_element);
    return {node};
  }
  return null;
}


export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID);
}

export function $isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined,
): node is YouTubeNode {
  return node instanceof YouTubeNode;
}

export const YOUTUBE_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
/**
 * Returns false if the youtube url is not valid and 
 * returns true if it is valid
 * @param s 
 * @returns 
 */
export function validateYoutubeUrl(s: string) {
  try {
    const u = new URL(s);
    if (u.protocol!=='https:') return false;
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

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND',
);

export function registerYoutube(editor: LexicalEditor) {
  return editor.registerCommand<string>(
    INSERT_YOUTUBE_COMMAND,
    (payload) => {
      const youTubeNode = $createYouTubeNode(payload);
      $insertNodeToNearestRoot(youTubeNode);
      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}