import { 
  DecoratorBlockNode, 
  SerializedDecoratorBlockNode 
} from "./DecoratorBlockNode";
import type { 
  ElementFormatType, 
  Spread,
  LexicalNode,
  DOMExportOutput,
  DOMConversionMap,
  DOMConversionOutput,
  LexicalEditor,
  EditorConfig,
  LexicalCommand
} from "lexical";
import { createCommand, COMMAND_PRIORITY_EDITOR, $createParagraphNode, $insertNodes } from 'lexical';
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import { IS_REAL_BROWSER, isTouchDevice } from "@lexical/shared";


export type SerializedAudioNode = Spread<
{
  src: string,
  title: string,
  text?:string
},
SerializedDecoratorBlockNode
>;

const CURRENT_VERSION = 1;

export class AudioNode extends DecoratorBlockNode {
  __src: string;
  __title: string;
  __version: number = CURRENT_VERSION;
  __text?:string = undefined;

  constructor(obj: {src: string, title: string, text?:string},key?:string, format?: ElementFormatType) {
    super(format,key);
    this.__src = obj.src;
    this.__title = obj.title;
    this.__text = obj.text;
  }
  static getType() {
    return 'audio-node';
  }
  static clone(node: AudioNode): AudioNode {
    return new AudioNode({src: node.getSrc(), title: node.getTitle() })
  }

  getTitle() {
    const self = this.getLatest();
    return self.__title;
  }
  setTitle(s: string) {
    const self = this.getWritable();
    self.__title = s;
    return self;
  }
  getSrc() {
    const self = this.getLatest();
    return self.__src;
  }
  setSrc(s:string){
    const self = this.getWritable();
    if (s.startsWith('https://audio.storething.org/')) {
      self.__src = s;
    }
  }
  getText() {
    const self = this.getLatest();
    return self.__text;
  }
  setText(s:string) {
    const self = this.getWritable();
    self.__text = s;
    return s;
  }
  getTextContent(): string {
    const self = this.getLatest();
    const title = self.getTitle();
    const text = self.getText();
    const src = self.getSrc();
    var ret = `[Audio](${src})\nTitle: ${title}\nTranscription: ${text ? `"""${text}"""` : 'N/A'}`
    return ret;
  }

  setFormat(_: ElementFormatType): void {
    const self = this.getWritable();
    self.__format = "left";
  }
  static importJSON(serializedNode: SerializedAudioNode): AudioNode {
    const node = $createAudioNode({ src: serializedNode.src, title: serializedNode.title });
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedAudioNode {
    return {
      ...super.exportJSON(),
      type: 'audio-node',
      version: 1,
      src: this.getSrc(),
      title: this.getTitle(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('audio');
    element.setAttribute('data-src', this.getSrc());
    element.setAttribute('data-title',this.getTitle());
    element.setAttribute('data-v',String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      audio: (domNode: HTMLElement) => {
        return {
          conversion: convertAudioElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const html = getAudioHTML(this.getSrc(),String(this.getTitle()));
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0) {
        element.insertAdjacentHTML("afterbegin",html);
      }
    }
    const audio = document.createElement('audio');
    audio.setAttribute('src', this.getSrc());
    audio.setAttribute('data-title',this.getTitle());
    return audio;
  }
  
}

function convertAudioElement(domNode: HTMLElement): null|DOMConversionOutput {
  const src = domNode.getAttribute('src') || domNode.getAttribute('data-src');
  const title = domNode.getAttribute('data-title');
  const node = $createAudioNode({ src: src || 'https://audio.storething.org/frankmbrown/default-audio.mp3', title: title || 'No Title Added' });
  const first_element = domNode.classList.contains('first-rte-element');
  node.setFirstElement(first_element);
  const last_element = domNode.classList.contains('last-rte-element');
  node.setLastElement(last_element);
  return { node };
}

const AUDIO_EXTENSIONS = [
  { audioCodec: 'aac', extension: 'mp4', type:'audio/mp4' },
  { audioCodec: 'flac', extension: 'flac', type:'audio/flac' },
  { audioCodec: 'opus', extension: 'webm', type:'audio/mp3' }
];
/**
 * Given the original file name, get the srcs for that media recording (get all the keys of the same recording that are stored in s3 - including the transcoded media keys)
 * @param src The original file element
 * @returns an array of src and types - the order in which the <source> elements should be sorted in the <video> or <audio> element
 */
function getAudioSourcesFromOriginalFilename(src: string) {
  const ret:{src: string, type: string}[] = [];
  const srcString = src.replace('https://audio.storething.org/frankmbrown/','');
  const name = srcString.slice(0,srcString.lastIndexOf('.'));
  const fileType = srcString.slice(srcString.lastIndexOf('.')+1);
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
  return { audioSources: ret, name, key: srcString };
}

/**
 * Get the inputs for the audio input. 
 * @param src 
 * @returns 
 */
export function getAudioHTML(src: string,defaultAudio?:boolean|string) {
  const desktop = !!!isTouchDevice();
  const input_number = 'iN_' + window.crypto.randomUUID();
  const audioInputId = 'audio-input-src-'.concat(input_number);
  const audioTitleId = 'audio-input-title-'.concat(input_number);
  const randomId1= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId2= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId3= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId4= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId5= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId6= 'audio_rand_id_'.concat(window.crypto.randomUUID());
  const randomId7 = 'audio_rand_id_'.concat(window.crypto.randomUUID());
  var audioSrcInput: HTMLInputElement|HTMLParagraphElement;
  if (!!!defaultAudio) {
    audioSrcInput = document.createElement('input');
    audioSrcInput.setAttribute('type','text');
    audioSrcInput.setAttribute('hidden','');
    audioSrcInput.setAttribute('name',audioInputId);
    audioSrcInput.setAttribute('id',audioInputId);
    audioSrcInput.setAttribute('value',String(src));
  } else {
    if (typeof defaultAudio==='boolean') {
      audioSrcInput = document.createElement('p');
      audioSrcInput.classList.add('body1','bold');
      audioSrcInput.innerText = "Placeholder Audio Title";
    } else if (typeof defaultAudio === 'string') {
      audioSrcInput = document.createElement('p');
      audioSrcInput.classList.add('body1','bold');
      audioSrcInput.innerText = defaultAudio;
    } else {
      audioSrcInput = document.createElement('p');
    }
  }
  const audioEl = document.createElement('audio');
  audioEl.setAttribute('controls','');
  audioEl.setAttribute('hidden','');
  audioEl.setAttribute('data-resume','false');
  audioEl.setAttribute('data-play-through','true');
  audioEl.setAttribute('data-src',src);
  audioEl.setAttribute('preload','metadata');
  if (typeof defaultAudio==='boolean'&&defaultAudio===true) {
    const source = document.createElement('source');
    source.setAttribute('src',src);
    audioEl.append(source);
  } else {
    const {audioSources, key, name } = getAudioSourcesFromOriginalFilename(src);
    const track = document.createElement('track');
    track.setAttribute('default','');
    track.setAttribute('kind','captions'); // maybe subtitles
    track.setAttribute('src',`/vtt/audio/${name}`);
    track.setAttribute('srclang','en');
    audioEl.append(track);
    for (let source of audioSources) {
      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src',source.src);
      sourceEl.setAttribute('type',source.type);
      audioEl.append(sourceEl);
    }
  }
  const useTooltips = Boolean(!!!isTouchDevice());
  return /*html*/`
  <div class="audio mt-3" data-audio-wrapper style="margin: 10px 0px;">
    ${audioEl.outerHTML}
    <div class="audio-header align-center gap-2" style="margin-bottom: 4px;">
      ${audioSrcInput.outerHTML}
      ${Boolean(defaultAudio) ? '' :/*html*/`
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
      ${desktop?/*html*/`
      <input data-sound data-type="audio" type="range" value="100" min="0" max="100" class="small primary" id="${randomId4}" name="${randomId4}" style="background-size: 100% 100%;">
      <output hidden for="${randomId4}">100</output>
      `:/*html*/`<div class="grow-1"></div>`}

      <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse`:``}>
        <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
      </button>
      <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId3}" aria-describedby="${randomId3}"`:``}>
        <div class="select" aria-label="Sound Playback Speed Select">
          <button  ${Boolean(desktop)?'':'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId5}" aria-controls="${randomId5}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
          </button>
          <div ${Boolean(desktop)?'':'data-click-capture'} tabindex="0" id="${randomId5}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="bottom">
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
      ${useTooltips?/*html*/`
      <div data-placement="left-start" class="tooltip caption" id="${randomId3}" role="tooltip"> 
        Playback Speed
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
        Mute / Unmute Audio
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
        Closed Captioning
      </div>
      `:``}
    </div>
  </div>`;
}


export function $createAudioNode(obj:{src: string, title: string}) {
  return new AudioNode(obj);
}

export function $isAudioNode(
  node: AudioNode | LexicalNode | null | undefined,
): node is AudioNode {
  return node instanceof AudioNode;
}

export const INSERT_AUDIO_NODE: LexicalCommand<{ src: string, title: string }> = createCommand(
  'INSERT_AUDIO_NODE',
);
export const INSERT_AUDIO_NODES: LexicalCommand<{ src: string, title: string }[]> = createCommand(
  'INSERT_AUDIO_NODES',
);
