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
  EditorConfig
} from "lexical";
import { IS_REAL_BROWSER, isTouchDevice } from "@lexical/shared";

export type SerializedVideoNode = Spread<
{
  src: string,
  title: string,
  description: string,
  height: number|undefined,
  width: number|undefined,
  text: string|undefined
},
SerializedDecoratorBlockNode
>;

export const MAX_VIDEO_HEIGHT = 400;
export const MIN_VIDEO_HEIGHT = 100;

const CURRENT_VERSION = 1;

export class VideoNode extends DecoratorBlockNode {
  __src: string;
  __title: string;
  __description: string;
  __height?: number;
  __width?: number;
  __version: number = CURRENT_VERSION;
  __text?:string=undefined;

  constructor(obj: {src: string, title: string, description: string, height?: number, text?: string, width?: number},key?:string, format?: ElementFormatType) {
    super(format,key);
    this.__src = obj.src;
    this.__title = obj.title;
    this.__description = obj.description;
    if(obj.height) {
      this.__height = Math.min(Math.max(MIN_VIDEO_HEIGHT,obj.height),MAX_VIDEO_HEIGHT);
    } else {
      this.__height = MAX_VIDEO_HEIGHT;
    }
    if (obj.width) this.__width = obj.width;
  }
  static getType() {
    return 'video-node';
  }
  static clone(node: VideoNode): VideoNode {
    return new VideoNode({
      src: node.getSrc(), 
      title: node.getTitle(), 
      description: node.getDescription(),
      height: node.getHeight(),
      text: node.getText(),
      width: node.getWidth() 
    })
  }
  getDescription() {
    const self = this.getLatest();
    return self.__description;
  }
  setDescription(d: string) {
    const self = this.getWritable();
    self.__description = d;
    return self;
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
  setSrc(s:string) {
    const self = this.getWritable();
    if (s.startsWith('https://video.storething.org/')) {
      self.__src = s;
    }
  }
  setFormat(_: ElementFormatType): void {
    const self = this.getWritable();
    self.__format = "left";
  }
  getHeight() {
    const self = this.getLatest();
    return self.__height;
  }
  setHeight(n:number) {
    const self = this.getWritable();
    self.__height = Math.max(Math.min(MAX_VIDEO_HEIGHT,n),MIN_VIDEO_HEIGHT);
  }
  getWidth() {
    const self = this.getLatest();
    return self.__width;
  }
  setWidth(w:number) {
    const self = this.getWritable();
    self.__width = w;
    return self;
  }
  getText() {
    const latest = this.getLatest();
    return latest.__test;
  }
  setText(s:string) {
    const self = this.getWritable();
    self.__text = s;
    return self;
  }
  getTextContent(): string {
    const latest = this.getLatest();
    const title = latest.getTitle();
    const desciption = latest.getDescription();
    const text = latest.getText();
    const src = latest.getSrc();
    var ret = `[Video](${src})\nTitle: ${title}\nDescription: ${desciption}\nTranscription: ${text ? `"""${text}"""` : 'N/A'}`
    return ret;
  }
  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
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

  exportJSON(): SerializedVideoNode {
    return {
      ...super.exportJSON(),
      type: 'video-node',
      version: CURRENT_VERSION,
      src: this.getSrc(),
      title: this.getTitle(),
      description: this.getDescription(),
      height: this.getHeight(),
      text: this.getText(),
      width: this.getWidth(),
      first_element: this.getFirstElement()
    };
  }
  exportDOM(): DOMExportOutput {
    const element = document.createElement('video');
    element.setAttribute('data-src', this.getSrc());
    element.setAttribute('data-title',this.getTitle());
    element.setAttribute('data-description',this.getDescription());
    const height = this.getHeight();
    if(height){
      element.setAttribute('height',String(height));
    } else {
      element.setAttribute('height','400');
    }
    element.setAttribute('data-width','width');
    element.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      video: (domNode: HTMLElement) => {
        return {
          conversion: convertVideoElement,
          priority: 2,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const html = getVideoHTML(this.getSrc(), { title:this.getTitle(), description:this.getDescription() },String(this.getHeight() || 400));
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0) {
        element.insertAdjacentHTML("afterbegin",html);
      }
    }
    const video = document.createElement('video');
    video.setAttribute('src', this.getSrc());
    video.setAttribute('data-title',this.getTitle());
    return video;
  }
}

function convertVideoElement(domNode: HTMLElement): null|DOMConversionOutput {
  const src = domNode.getAttribute('src') || domNode.getAttribute('data-src');
  const title = domNode.getAttribute('data-title');
  const description = domNode.getAttribute('data-description');
  const heightStr = domNode.getAttribute('height');
  const height = heightStr&&Number.isInteger(parseInt(heightStr)) ? parseInt(heightStr) : 400; 
  const widthStr = domNode.getAttribute('data-width');
  const width = widthStr&&Number.isInteger(parseInt(widthStr)) ? parseInt(widthStr) : undefined; 
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
  return { node };
}


const VIDEO_EXTENSIONS = [
  { videoCodec: 'libvpx', extension: 'webm', type:'video/webm' }, 
  { videoCodec:'libx264',extension:'mp4', type:'video/mp4' }
];
/**
 * Given the original file name, get the srcs for that media recording (get all the keys of the same recording that are stored in s3 - including the transcoded media keys)
 * @param src The original file element
 * @returns an array of src and types - the order in which the <source> elements should be sorted in the <video> or <audio> element
 */
function getVideoSourcesFromOriginalFileName(src: string) {
  const ret:{src: string, type: string}[] = [];
  const srcString = src.replace('https://video.storething.org/frankmbrown/','');
  const name = srcString.slice(0,srcString.lastIndexOf('.'));
  const fileType = srcString.slice(srcString.lastIndexOf('.')+1);
  for (let obj of VIDEO_EXTENSIONS) {
    ret.push({
      src: `https://video.storething.org/frankmbrown/${name}.${obj.videoCodec}.${obj.extension}`,
      type: obj.type
    })
  }
  ret.push({
    src,
    type: `video/${fileType}`
  });
  return { videoSources: ret, name, key: srcString };
}

export function getVideoHTML(src: string,defaultVideo?:boolean|{title: string, description: string},height?:string) {
  const desktop = !!!isTouchDevice();
  const input_number = 'iN_' + window.crypto.randomUUID();
  const videoInputId = 'video-input-src-'.concat(input_number);
  const videoTitleId = 'video-input-title-'.concat(input_number);
  const videoDescriptionId = 'video-input-description-'.concat(input_number);
  const randomId1= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId2= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId3= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId4= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId5= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId6= 'video_rand_id_'.concat(window.crypto.randomUUID());
  const randomId7= 'video_rand_id_'.concat(window.crypto.randomUUID());
  
  const videoEl = document.createElement('video');
  videoEl.setAttribute('data-play-through','true');
  videoEl.setAttribute('playsinline','');
  videoEl.setAttribute('webkit-playsinline','');
  videoEl.setAttribute('data-src',src);
  videoEl.setAttribute('preload','metadata');
  if (height) {
    videoEl.setAttribute('height',String(height));
    videoEl.setAttribute('data-height',String(height));
  }
  if (typeof defaultVideo==='boolean'&&defaultVideo===true) {
    const source = document.createElement('source');
    source.setAttribute('src',src);
    videoEl.append(source);
  } else {
    const {videoSources, key, name } = getVideoSourcesFromOriginalFileName(src);
    videoEl.setAttribute('poster',`https://image.storething.org/frankmbrown/${name}-thumbnail.png`); // thumbnail image
    const track = document.createElement('track');
    track.setAttribute('default','');
    track.setAttribute('kind','captions'); // maybe subtitles
    track.setAttribute('src',`/vtt/video/${name}`);
    track.setAttribute('srclang','en');
    videoEl.append(track);  
    for (let source of videoSources) {
      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src',source.src);
      sourceEl.setAttribute('type',source.type);
      videoEl.append(sourceEl);
    }
  }
  const videoInput = document.createElement('input');
  videoInput.setAttribute('value',src);
  videoInput.setAttribute('hidden','');
  videoInput.setAttribute('type','text');
  videoInput.setAttribute('id',videoInputId);
  videoInput.setAttribute('name',videoInputId);
  var defaultImageText = '';
  if (typeof defaultVideo!=='boolean'&& defaultVideo!==undefined) {
    const div = document.createElement('div');
    div.className="video-info";
    const title = document.createElement('p');
    title.className="bold h4";
    title.innerText = defaultVideo.title;
    const description = document.createElement('p');
    description.className="body1";
    description.innerText = defaultVideo.description;
    div.append(title,description);
    defaultImageText = div.outerHTML;
  }
  const useTooltips = Boolean(!!!isTouchDevice());
  return /*html*/`<div class="video-wrapper" data-video-wrapper style="margin: 10px 0px;">
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
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId2}" aria-describedby="${randomId2}"`:``}>
          <button data-mute-button data-type="video" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
            <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
            <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
            <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
          </button>
        </div>
        ${useTooltips?/*html*/`
        <input class="small secondary" data-sound data-type="video" id="${randomId3}" name="${randomId3}" type="range" value="100" min="0" max="100" step="1" style="background-size: 100% 100%;">
        <output for="${randomId3}" hidden>100</output>
        `:`<div class="grow-1"></div>`}
        <div class="video-time-left">
          <span data-ellapsed>0:00</span>
          /
          <span data-remaining>0:00</span>
        </div>
        <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse`:``}>
          <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
          <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        </button>
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId6}" aria-describedby="${randomId6}"`:``}>
          <div class="select" aria-label="Sound Playback Speed Select">
            <button ${Boolean(desktop)?'':'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId4}" aria-controls="${randomId4}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
            </button>
            <div ${Boolean(desktop)?'':'data-click-capture'} tabindex="0" id="${randomId4}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="top">
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
            ${useTooltips?/*html*/`
            <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
              Mute / Unmute Audio
            </div>
            <div data-placement="left-start" class="tooltip caption" id="${randomId6}" role="tooltip">
              Playback Speed
            </div>
            <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
              Closed Captions
            </div>
            `:``}
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
</div>`;
}


export function $createVideoNode(obj:{src: string, title: string, description: string, height?: number, text?:string, width?:number }) {
  return new VideoNode(obj);
}

export function $isVideoNode(
  node: VideoNode | LexicalNode | null | undefined,
): node is VideoNode {
  return node instanceof VideoNode;
}


