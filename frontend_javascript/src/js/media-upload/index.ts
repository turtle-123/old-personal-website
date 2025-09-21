/**
 * @todo Scroll to image editor after load. Add spinner for image editor in between when the dialog is closed and 
 */
import { 
  closeDialog, 
  openLoadingDialog as openLoadingDialogFunc, 
  clearInnerHTML, 
  setLoadingDialogInnerText,
  isTouchDevice ,
  onNewContentLoaded,
  getCsrfToken,
  openSnackbar,
  openSnackbarFinal2
} from "../shared";
import type { PinturaDefaultImageWriterResult, PinturaEditor, PinturaEditorDefaultOptions } from "@pqina/pintura/pintura";

import { onLoadSetUploadMediaListeners, closeMediaStream, closeRecordImageDialog, closeRecordAudioDialog, closeRecordVideoDialog  } from './recordMedia';
/* ------------------------------------------------------- Constants ---------------------------------------------------- */

type ImageFilesArray = {
  name: string,
  currentUrl: string,
  currentFile: File,
  type: string,
  inputName: string
}[];
type KeepTrackType = {
  images: {
    [inputName: string]: {
      name: string,
      currentUrl: string,
      currentFile: File,
      index: number,
      imageEditor: PinturaEditor|undefined,
      type: string
    }
  },
  multipleImages: {
    [inputName: string]: {
      files: ImageFilesArray,
      input: HTMLInputElement,
      imageEditor: PinturaEditor|undefined
    }
  }
}


const TOUCH_DEVICE = isTouchDevice();
const SCROLL_INTO_VIEW_OPTIONS = { behavior: 'smooth', block: 'start', inline: 'center'} as const;


/**
 * Object to keep track of all images, audio, and videos that have been submitted on the page. This object should be cleared on page change
 *  
 */
const KeepTrackPage: KeepTrackType = {
  images: {},
  multipleImages: {}
};

const ALLOWED_IMAGE_TYPES = new Set([
  'jpeg',
  'jpg',
  'png',
  'webp',
  'avif',
  'tiff',
  'svg'
]);
const MAX_IMAGE_SIZE = 5000000; // 5MB
const MAX_AUDIO_SIZE = 540000000; // 540MB
const MAX_VIDEO_SIZE = 540000000; // 540MB
const CHUNK_SIZE = 6000000; // 6 MB - https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html- minimum size for uploading parts is 6MB
const VALID_AUDIO_FILE_EXTENSIONS = new Set([
  'm4a', 
  'flac', 
  'mp3', 
  'mp4', 
  'wav', 
  'wma', 
  'aac', 
  'webm', 
  'mpeg', 
  'mov',
  'ogg'
]);
const VALID_VIDEO_FILE_EXTENSIONS = new Set([
  'mp4', 
  'mov', 
  'avi', 
  'wmv', 
  'avchd', 
  'webm', 
  'flv'
]);
const AUDIO_EXTENSIONS = [
  { audioCodec: 'aac', extension: 'mp4', type:'audio/mp4' },
  { audioCodec: 'flac', extension: 'flac', type:'audio/flac' },
  { audioCodec: 'opus', extension: 'webm', type:'audio/webm' }
];
const VIDEO_EXTENSIONS = [
  { videoCodec: 'libvpx', extension: 'webm', type:'video/webm' }, 
  { videoCodec:'libx264',extension:'mp4', type:'video/mp4' }
];

/* -------------------------------------------- GET CUSTOM EVENT WHEN FILE UPLOAD IS COMPLETE --------------------------------------------- */
/**
 * When the upload is complete - dispatch a custom event on the input with the urls / widths and heights of the images
 * @param type 
 * @param objs 
 * @returns 
 */
function getUploadCompleteCustomEvent(type:'image'|'audio'|'video',objs: { url: string, height?:number, width?: number}[]) {
  return new CustomEvent('media-upload-complete',{
    detail: {
      uploads: objs
    }
  })
}



/**
 * Returns the type of a file, assumes that the characters after the last period in the file name express the file's extension
 * @param str 
 * @returns 
 */
const getExtension = (str: string) => {
  const lastIndexOfPeriod = str.lastIndexOf('.');
  return str.slice(lastIndexOfPeriod+1);
}

/*-------------------------------------------- Get the Width And Height of Images / Videos ------------------- */
/**
 * Returns the preferred width and height of a video (the width and height of the video that should be used
 * on the <video> element) if they are valid - else returns null
 * @param obj 
 * @returns 
 */
export function resolveVideoWidthAndHeight(obj:{width:number,height:number}|null) {
  var width:number, height: number;
  if (!!!obj||obj.width===0||obj.height===0) {
    return null;
  } else {
    const widthToHeightRatio = obj.width/obj.height;
    if (obj.height > 400) {
      height = 400;
      width = height*widthToHeightRatio;
    } else {
      height = obj.height;
      width = obj.width;
    }
    return { width, height };
  }
}
/**
 * Function to get video width and height
 * @param file 
 */
export async function getVideoWidthAndHeightFromVideo(file:File) {
  return new Promise<{width:number,height:number}|null>((resolve,reject) => {
    var timeout: NodeJS.Timeout|undefined = undefined;
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.onloadedmetadata = (evt:Event) => {
      if (timeout) clearTimeout(timeout);
      // Revoke when you don't need the url any more to release any reference
      URL.revokeObjectURL(url)
      if (video.videoWidth===0||video.videoHeight===0) resolve(null);
      resolve({ 
        width: video.videoWidth,
        height: video.videoHeight
      });
    }
    video.src = url
    video.load() // fetches metadata
    timeout = setTimeout(() => {
      resolve(null);
    },2000);
  })
}
/**
 * Attempts to find the width and height of a video if one exists
 * @param file 
 * @returns 
 */
export async function getVideoWidthAndHeight(file:File) {
  try {
    const videoWidthAndHeight = await getVideoWidthAndHeightFromVideo(file);
    return resolveVideoWidthAndHeight(videoWidthAndHeight);
  } catch(error) {
    return null;
  }
}
/**
 * Try to get the natural width and natural height of an image
 * @param file 
 * @returns 
 */
export async function getImageWidthAndHeightFromImage(file:File) {
  return new Promise<{width:number,height:number}|null>((resolve,reject) => {
    var timeout: NodeJS.Timeout|undefined = undefined;
    const url = URL.createObjectURL(file)
    const image = document.createElement('img')
    image.onload = (evt:Event) => {
      if (timeout) clearTimeout(timeout);
      // Revoke when you don't need the url any more to release any reference
      URL.revokeObjectURL(url)
      if (image.naturalWidth===0||image.naturalHeight===0) resolve(null);
      resolve({ 
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    }
    image.src = url;
    timeout = setTimeout(() => {
      resolve(null);
    },2000);
  })
}
/**
 * Try to get the image width and height
 * @param file 
 * @returns 
 */
export async function getImageWidthAndHeight(file:File) {
  try {
    const obj = await getImageWidthAndHeightFromImage(file);
    if (!!!obj) return { width: null, height: null };
    else return obj as {width: number, height: number};
  } catch (error) {
    return { width: null, height: null };
  }
}

function renderURLsInOutputImage(output:HTMLElement,type:'image',url:({ filename: string, originalFilename: string})|({ filename: string, originalFilename: string}[])) {
  var arrToUse: { filename: string, originalFilename: string}[] = [];
  if (Array.isArray(url)) arrToUse = url;
  else arrToUse = [url];
  for (let url of arrToUse) {
    const span = document.createElement('span');
    span.innerText = url.filename;
    span.classList.add('body2');
    const randID = 'cop_url_'.concat(window.crypto.randomUUID());
    const button = document.createElement('button');
    button.className="icon button small";
    button.setAttribute('type','button');
    button.setAttribute('aria-label','Copy URL');
    button.setAttribute('data-copy-input','');
    button.setAttribute('data-input',randID);
    button.setAttribute('data-snackbar','');
    button.setAttribute('data-selem','#copy-url-input');
    button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CopyAll"><path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path></svg>');
    const input = document.createElement('input');
    input.setAttribute('type','text'); 
    input.setAttribute('name',randID); 
    input.setAttribute('hidden',''); 
    input.setAttribute('readonly',''); 
    input.setAttribute('value',url.filename);
    const p = document.createElement('p');
    p.classList.add('mt-2');
    p.innerText = url.originalFilename;   
    const pSpan = document.createElement('span');
    pSpan.innerText = "Original Filename: ";
    pSpan.classList.add('bold');
    p.insertAdjacentElement("afterbegin",pSpan);

    output.insertAdjacentHTML("beforeend",/*html*/`
${p.outerHTML}
<div class="flex-row justify-begin mt-1">
  <span class="bg-card w-auto p-md flex-row gap-3 align-center no-wrap" style="border-radius: 0.5rem; border: 2px solid var(--text-primary);">
    ${span.outerHTML}
    ${button.outerHTML}
  </span>
    ${input.outerHTML}
</div>
    `)
  }
  onNewContentLoaded(output);
}

/**
 * functions for rendering urls for the user to copy in the <output> element
 */
function renderURLsInOutput(output:HTMLElement,type:'video'|'audio',url:string|string[]) {
  var arrToUse: string[] = [];
  if (Array.isArray(url)) arrToUse = url;
  else arrToUse = [url];
  for (let url of arrToUse) {
    const span = document.createElement('span');
    span.innerText = url;
    span.classList.add('body2');
    const randID = 'cop_url_'.concat(window.crypto.randomUUID());
    const button = document.createElement('button');
    button.className="icon button small";
    button.setAttribute('type','button');
    button.setAttribute('aria-label','Copy URL');
    button.setAttribute('data-copy-input','');
    button.setAttribute('data-input',randID);
    button.setAttribute('data-snackbar','');
    button.setAttribute('data-selem','#copy-url-input');
    button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CopyAll"><path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path></svg>');
    const input = document.createElement('input');
    input.setAttribute('type','text'); 
    input.setAttribute('name',randID); 
    input.setAttribute('hidden',''); 
    input.setAttribute('readonly',''); 
    input.setAttribute('value',url);    
    output.insertAdjacentHTML("beforeend",/*html*/`
<div class="mt-3 flex-row justify-begin">
  <span class="bg-card w-auto p-md flex-row gap-3 align-center no-wrap" style="border-radius: 0.5rem; border: 2px solid var(--text-primary);">
    ${span.outerHTML}
    ${button.outerHTML}
  </span>
    ${input.outerHTML}
</div>
    `)
  }
  onNewContentLoaded(output);
}

/*---------------------------------- Given the original filename, determine the other audio / video files that can be used to access audio / video on multiple devices ------------------------------ */
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


/* ------------------------------------------------------- Loading Dialog ---------------------------------------------------- */
/**
 * Opens the loading dialog with the specified text
 * @param text 
 */
function openLoadingDialog(text: string) {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog) openLoadingDialogFunc(dialog,text);
}
/**
 * Closes the loading dialog with the specified text
 */
function closeLoadingDialog() {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog&&!!!dialog.hasAttribute('hidden')) closeDialog(dialog);
}
/* --------------------------------------------------------- HTML Strings ------------------------------------------------------ */
/**
 * Get the associated text inputs (so user can fill out a short and long description) for a image input
 * For single image inputs, we use the input name of the original file input as the `inputName`. For multiple image inputs, we use 
 * the image's current url as the `inputName`.
 * @param inputName 
 * @param index 
 * @param hidden 
 * @returns 
 */
function getAssociatedPhotoTextHTML(inputName: string, index: number, hidden: boolean) {
  const details = document.createElement('details');
  details.setAttribute('data-photo-text','');
  details.style.cssText="border:1px solid var(--divider);";
  details.setAttribute('data-index',String(index));
  details.setAttribute('aria-label','Image Associated Text');
  if (hidden) details.setAttribute('hidden','');
  const label1 = document.createElement('label');
  label1.setAttribute('for',String(inputName).concat(`-short-description`));
  label1.className="caption bold";
  label1.innerText = "Short Image Description:";
  const input = document.createElement('input');
  input.setAttribute('type','text');
  input.setAttribute('autocomplete','off');
  input.setAttribute('name',`${String(inputName)}-short-description`);
  input.setAttribute('id',`${String(inputName)}-short-description`);
  input.className="medium icon-before mt-1";
  input.setAttribute('placeholder','Enter a short description of the image...');
  input.setAttribute('maxlength','50');
  input.setAttribute('spellcheck','false');
  input.setAttribute('autocapitalize','off');
  const label2 = document.createElement('label');
  label2.className="caption bold";
  label2.setAttribute('for',String(inputName).concat(`-long-description`));
  label2.innerText = "Longer Image Description:";
  const textarea = document.createElement('textarea');
  textarea.setAttribute('name',`${String(inputName)}-long-description`);
  textarea.setAttribute('id',`${String(inputName)}-long-description`);
  textarea.setAttribute('placeholder',`Enter a long description of the image ...`);
  textarea.setAttribute('rows','5');
  textarea.setAttribute('maxlength','200');
  textarea.setAttribute('spellcheck',"false");
  textarea.setAttribute('autocomplete',"off");
  textarea.setAttribute('autocapitalize',"off");
  const s = `
    <summary>
        <span class="h6 fw-regular">Image Associated Text</span>
        <svg class="details" focusable="false" inert viewBox="0 0 24 24">
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
          </path>
        </svg>
    </summary>
    <div class="accordion-content" aria-hidden="true">
      <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
        ${label1.outerHTML}
        <div class="text-input block medium">
            ${input.outerHTML}
            <svg class="icon-before"  focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
        </div>
      </div>
      <div class="input-group block mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
        ${label2.outerHTML}
        <div class="mt-1 text-input block medium disabled">
            ${textarea.outerHTML}
        </div>
      </div>
    </div>`;
    details.insertAdjacentHTML("afterbegin",s);
    return details;
}

/**
 * Get the inputs for the audio input. 
 * @param src 
 * @returns 
 */
export function getAudioHTML(src: string,defaultAudio?:boolean|string) {
  const desktop = !!!TOUCH_DEVICE;
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
        <button data-play data-type="audio" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
          <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
        </button>
        <button data-pause data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
        </button>
        <button data-replay data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
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
export function getVideoHTML(src: string,defaultVideo?:boolean|{title: string, description: string},height?:string) {
  const desktop = !!!TOUCH_DEVICE;
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
    title.className="h4 bold";
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
          <button data-play data-type="video" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
            <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
          </button>
          <button data-pause data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
          </button>
          <button data-replay data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
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
/**
 * For rendering default audio uploads 
 * @param src 
 * @param title 
 */
export function setAudioDefaultTitle(src:string,title:string,outputEl?:HTMLOutputElement) {
  const audioEl = (outputEl || document).querySelector<HTMLAudioElement>(`audio[data-src="${src}"]`);
  if(audioEl){
    const wrapper = audioEl.closest<HTMLAudioElement>('div.audio');
    if(wrapper){
      const titleInput = wrapper.querySelector<HTMLInputElement>('input[type="text"][id^="audio-input-title-"]');
      if(titleInput) titleInput.value = title;
    }
  }
}
/**
 * For rendering default video uploads 
 * @param src 
 * @param title 
 */
export function setVideoDefaultTitle(src:string,title:string,description:string,outputEl?:HTMLOutputElement) {
  const videoEl = (outputEl || document).querySelector<HTMLVideoElement>(`video[data-src="${src}"]`);
  if (videoEl) {
    const wrapper = videoEl.closest<HTMLDivElement>('div.video-wrapper');
    if (wrapper) {
      const titleInput = wrapper.querySelector<HTMLInputElement>('input[type="text"][id^="video-input-title-"]');
      const textAreaInput = wrapper.querySelector<HTMLTextAreaElement>('textarea[id^="video-input-description-"]');
      if (titleInput) titleInput.value = title;
      if (textAreaInput) textAreaInput.value = description;
    }
  }
}


/* ----------------------------------------------------- Image Upload ------------------------------------------------------------------- */
/**
 * Show the image snackbar with certain text depending on the error
 * 
 * @param num 
 * @returns 
 */
export function handleImageError(num: number) {
  const id = 'image-error-popover';
  const el = document.getElementById(id) as HTMLDivElement|null;
  const ariaHidden = el ? el.getAttribute('aria-hidden') : 'true';
  if (ariaHidden==="false") return;
  if (el) {
    const texts = Array.from(el.querySelectorAll<HTMLSpanElement>('span[data-error]'));
    texts.forEach((el) => {
      if (el.getAttribute('data-error')===String(num)) el.removeAttribute('hidden');
      else el.setAttribute('hidden','');
    })
    openSnackbarFinal2(el);
  }
}

/**
 * 1. Validate the image 
 *  A. Make sure that the type and size are correct
 * 2. If this is a single image upload, open the loading dialog
 * Gets the signed url and posts the image to the database. Returns the url that starts with https://image.storething.org 
 * @param param0 
 * @returns 
 */
async function getSignedUrlAndPostImage({
  name, 
  file,
  initial,
  multiple=false,
  original,
  previouslyUploaded=false
}:{
  name: string, 
  file: File,
  initial: boolean,
  multiple?: boolean,
  original: boolean,
  previouslyUploaded?:boolean
}) {
  try {
    // If single file upload, open the dialog with specific text
    const loadingDialogText = multiple ? (initial ? "Uploading Images..." : "Updating Image in Database...") : (initial ? "Uploading Image..." : "Updating Image in Database...");
    // Validate the image size and type
    if (!!!multiple&&!!!previouslyUploaded) openLoadingDialog(loadingDialogText);
    const typeStr = file.type;
    if (!!!typeStr.startsWith('image/',0)) throw new Error('1');
    const type = typeStr.replace('image/','');
    if (file.size > MAX_IMAGE_SIZE) throw new Error('2');
    if (!!!ALLOWED_IMAGE_TYPES.has(type)) throw new Error('3');
    const widthAndHeight = await getImageWidthAndHeight(file);
    // Get the signed url from the database
    const signedURL = await fetch('/api/signed-url/image/'.concat(encodeURIComponent(name)).concat(`?size=${file.size}&height=${widthAndHeight.height}&width=${widthAndHeight.width}`))
    .then((res)=>{
      if (res.status!==200) throw new Error('Network request');
      return res.json()}
    )
    .then((res) => res.url as string)
    .catch((error) => {
      console.error(error);
      throw new Error("Unable to get Image signed URL.");
    });
    // Upload the picture to s3 using the signed url
    await fetch(signedURL,{ method: 'PUT', headers: {"Content-Type": "multipart/form-data" }, body: file })
    .then((res) => {
      if (res.status!==200) throw new Error('Network request');
    })
    .catch((error) => {
      console.error(error);
      throw new Error("Unable to post image object to s3.");
    });
    // Extract the s3 image key from the signed url
    const url = new URL(signedURL);
    const newImageUrl = 'https://image.storething.org'.concat(url.pathname);
    if (!!!multiple) closeLoadingDialog();
    return {imageUrl: newImageUrl, type };
  } catch (error) {
    console.error(error);
    if (!!!multiple) closeLoadingDialog();
    const errorCode = parseInt(error.message);
    if (!!!isNaN(errorCode) && errorCode>=1 && errorCode < 4) handleImageError(errorCode);
    else handleImageError(4);// 4: Something went wrong uploading the image to the database try reloading the page
    return null;
  }
}

/**
 * Callback that is called when the user finishes editing something
 * @param imageWriterResult 
 * @param div 
 * @param file 
 * @param type 
 * @param inputName 
 * @returns 
 */
async function handlePinturaProcess(imageWriterResult: PinturaDefaultImageWriterResult,div: HTMLDivElement,file:File,type: string,inputName: string ) {
  /**
   * Get the original image input
   */
  const originalImageInput = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
  if (originalImageInput) {
    /**
     * Is the original image input a multiple input
     */
    const multiple = originalImageInput.hasAttribute('multiple');
    if (multiple) {
      const multipleImageObj = KeepTrackPage['multipleImages'][inputName];
      if (multipleImageObj) {
        const originalFileInput = multipleImageObj.input;
        const outputEl = div.closest<HTMLOutputElement>('output');
        if (outputEl) {
          const tabIndexHolder = outputEl.querySelector(`div[data-input-name="${inputName}"]`);
          if (tabIndexHolder) {
            const currentIndexStr = String(tabIndexHolder.getAttribute('data-index'));
            const currentIndex = parseInt(currentIndexStr);
            if (!!!isNaN(currentIndex)&&isFinite(currentIndex)) {
              const currentFileObj = multipleImageObj.files[currentIndex];
              if (currentFileObj) {
                const imageName = currentFileObj.name;
                const resp = await getSignedUrlAndPostImage({name:imageName,initial:false,file:imageWriterResult.dest as File,original:false});
                const label1 = document.querySelector(`label[for="${currentFileObj.currentUrl}-short-description"]`);
                const label2 =document.querySelector(`label[for="${currentFileObj.currentUrl}-long-description"]`);
                const input = document.querySelector(`input[id="${currentFileObj.currentUrl}-short-description"]`);
                const textarea = document.querySelector(`textarea[id="${currentFileObj.currentUrl}-long-description"]`);
                // Change the HTML to correspond with image change and change the client side object as well
                if (resp&&label1&&label2&&input&&textarea) {
                  const { imageUrl, type } = resp;
                  if (label1) label1.setAttribute('for',imageUrl.concat('-short-description'));
                  if (label2) label2.setAttribute('for',imageUrl.concat('-long-description'));
                  if (textarea){
                    textarea.setAttribute('name',imageUrl.concat('-long-description'));
                    textarea.setAttribute('id',imageUrl.concat('-long-description'));
                  }
                  if (input){
                    input.setAttribute('name',imageUrl.concat('-short-description'));
                    input.setAttribute('id',imageUrl.concat('-short-description'));
                  }
                  currentFileObj.currentUrl = imageUrl;
                  currentFileObj.currentFile = imageWriterResult.dest;
                  currentFileObj.type = type;
                  if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src=imageWriterResult.dest;
                  originalFileInput.value = multipleImageObj.files.map((obj) => obj.currentUrl.trim()).join('|');
                  if (resp) {
                    originalImageInput.dispatchEvent(getUploadCompleteCustomEvent('image',multipleImageObj.files.map((obj) => obj.currentUrl.trim()).map((val) => ({ url:  val}))));
                  }
                }
              }
            } 
          }
        }
      }
    } else {
      const singleImageObj = KeepTrackPage["images"][inputName];
      if (singleImageObj) {
        const imageName = singleImageObj.name;
        const resp = await getSignedUrlAndPostImage({name:imageName,initial:false,file:imageWriterResult.dest as File,original:false});
        const input=document.querySelector<HTMLInputElement>(`input[id="${inputName}-short-description"]`);
        const textarea=document.querySelector<HTMLTextAreaElement>(`textarea[id="${inputName}-long-description"]`);
        // Change the HTML to correspond with image change and change the client side object as well
        if (resp&&input&&textarea) {
          const { imageUrl } = resp;
          if(textarea)textarea.value='';
          if(input)input.value='';
          singleImageObj.currentUrl=imageUrl;
          const objToChangeURL = document.querySelector<HTMLInputElement>(`input[name="${inputName}-text"]`);
          if (objToChangeURL) objToChangeURL.value = imageUrl;
          singleImageObj.currentFile=imageWriterResult.dest;
          if(singleImageObj.imageEditor)singleImageObj.imageEditor.src=imageWriterResult.dest;
          if (resp) {
            originalImageInput.dispatchEvent(getUploadCompleteCustomEvent('image',[{ url: resp.imageUrl }]));
          }
        }
      }
    }
  }
}

/**
 * 
 * @param div 
 * @param file 
 * @param type The type of the file without the initial '.' 
 * @returns 
 */
async function getPinturaImageEditor(div: HTMLDivElement, file: File, type: string, inputName: string,initial:boolean=false) {
  return new Promise<PinturaEditor>((resolve,reject) => {
    import(/* webpackChunkName: "pintura-image-editor" */ '@pqina/pintura/pintura')
    .then(({ appendDefaultEditor }) => {
      const pintura = appendDefaultEditor(div, { 
        src: file,
        animations: 'auto'
      });
      setTimeout(() => {
        if (!!!initial) div.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
      },10);
      pintura.on('process',async (imageWriterResult) => {
        await handlePinturaProcess(imageWriterResult,div,file,type,inputName);
      });
      pintura.on('loaderror',(e) => {
        handleImageError(4);
      })
      pintura.on('processerror',(e) => {
        handleImageError(4);
      })
      resolve(pintura);
    })
    .catch((error) => {
      reject("Something went wrong ");
    })
  })
}
/**
 * When the user uploads multiple images, 
 * @param this 
 * @param e 
 */
function handleNavMedia(this: HTMLDivElement,e:CustomEvent) {
  const detail = e.detail;
  if (detail==="next") {
    const currentIndexStr = String(this.getAttribute('data-index'));
    const currentIndexParsed = parseInt(currentIndexStr);
    const inputName = String(this.getAttribute('data-input-name'));
    if (inputName && KeepTrackPage["multipleImages"][inputName]) {
      const obj = KeepTrackPage["multipleImages"][inputName];
      const max = obj.files.length-2;
      const currentIndex = isNaN(currentIndexParsed) ? 0 : Math.min(Math.max(currentIndexParsed,0),max);
      const newIndex = currentIndex+1;
      const fileObj = obj.files[newIndex];
      if (obj.imageEditor && newIndex!==currentIndex) obj.imageEditor.src = fileObj.currentFile;

      const backButton = this.querySelector('button[data-previous="true"]');
      const nextButton = this.querySelector('button[data-next="true"]');
      if (newIndex===0) {
        if (backButton) backButton.setAttribute('disabled','');
        if (nextButton) nextButton.removeAttribute('disabled');
      }
      if (newIndex===obj.files.length-1) {
        if (backButton)backButton.removeAttribute('disabled');
        if (nextButton)nextButton.setAttribute('disabled','');
      }
      if (newIndex!==0&&newIndex!==obj.files.length-1){
        if (nextButton) nextButton.removeAttribute('disabled');
        if (backButton)backButton.removeAttribute('disabled');
      }
      const oldDetails = (this.parentElement as HTMLDivElement).querySelector<HTMLDetailsElement>('details[data-photo-text][data-index="'.concat(String(currentIndexStr)).concat('"]'));
      const newDetails = (this.parentElement as HTMLDivElement).querySelector<HTMLDetailsElement>('details[data-photo-text][data-index="'.concat(String(newIndex)).concat('"]'));
      if(oldDetails)oldDetails.setAttribute('hidden','');
      if(newDetails)newDetails.removeAttribute('hidden');
      this.setAttribute('data-index',String(newIndex));
    }
  } else if (detail==="back") {
    const currentIndexStr = String(this.getAttribute('data-index'));
    const currentIndexParsed = parseInt(currentIndexStr);
    const inputName = String(this.getAttribute('data-input-name'));
    if (inputName && KeepTrackPage["multipleImages"][inputName]) {
      const obj = KeepTrackPage["multipleImages"][inputName];
      const max = obj.files.length-1;
      const currentIndex = isNaN(currentIndexParsed) ? 0 : Math.min(Math.max(currentIndexParsed,0),max);
      const newIndex = currentIndex-1;
      const fileObj = obj.files[newIndex];
      if (obj.imageEditor && newIndex!==currentIndex) obj.imageEditor.src = fileObj.currentFile;

      const backButton = this.querySelector('button[data-previous="true"]');
      const nextButton = this.querySelector('button[data-next="true"]');
      if (newIndex===0) {
        if (backButton) backButton.setAttribute('disabled','');
        if (nextButton) nextButton.removeAttribute('disabled');
      }
      if (newIndex===obj.files.length-1) {
        if (backButton)backButton.removeAttribute('disabled');
        if (nextButton)nextButton.setAttribute('disabled','');
      }
      if (newIndex!==0&&newIndex!==obj.files.length-1){
        if (nextButton) nextButton.removeAttribute('disabled');
        if (backButton)backButton.removeAttribute('disabled');
      }
      const oldDetails = (this.parentElement as HTMLDivElement).querySelector<HTMLDetailsElement>('details[data-photo-text][data-index="'.concat(String(currentIndexStr)).concat('"]'));
      const newDetails = (this.parentElement as HTMLDivElement).querySelector<HTMLDetailsElement>('details[data-photo-text][data-index="'.concat(String(newIndex)).concat('"]'));
      if(oldDetails)oldDetails.setAttribute('hidden','');
      if(newDetails)newDetails.removeAttribute('hidden');
      this.setAttribute('data-index',String(newIndex));
    }
  }
}

function dispatchCustomChangeMediaEvent(this:HTMLButtonElement,e:Event){
  const wrapper = this.closest('div[data-wrapper="true"]');
  if (this.getAttribute('data-previous')) {
    if (wrapper) wrapper.dispatchEvent(new CustomEvent("nav-media",{detail: "back"}));
  } else if (this.getAttribute('data-next')) {
    if (wrapper) wrapper.dispatchEvent(new CustomEvent("nav-media",{detail: "next"}));
  }
}

/**
 * 
 * @param this 
 * @param e 
 */
function handleDeleteMultipleImage(this:HTMLButtonElement,e:Event) {
  const output = this.closest<HTMLOutputElement>('output');
  if(output) {
    const inputName = String(output.getAttribute('for'));
    const hiddenInputThatKeepsURLs = document.querySelector<HTMLInputElement>(`input[name="${inputName}-text"]`);
    const tabsWrapper = output.querySelector(`div[data-input-name="${inputName}"][data-wrapper="true"]`);
    if (tabsWrapper) {
      const currentIndex = parseInt(String(tabsWrapper.getAttribute('data-index')));
      if (!!!isNaN(currentIndex)&&isFinite(currentIndex)) {
        const multipleImageObj = KeepTrackPage['multipleImages'][inputName];
        if (multipleImageObj){
          const onlyOneFile = Boolean(multipleImageObj.files.length===1);
          if (onlyOneFile) {
            delete KeepTrackPage['multipleImages'][inputName];
            clearInnerHTML(output);
            if (hiddenInputThatKeepsURLs) hiddenInputThatKeepsURLs.remove();
          } else {
            const wrapper = output.querySelector<HTMLDivElement>('div[data-wrapper="true"]');
            const details = output.querySelector(`details[data-index="${currentIndex}"]`);
            if (details) details.remove();
            if (currentIndex===0) {
              multipleImageObj.files=multipleImageObj.files.slice(1);
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src = multipleImageObj.files[0].currentFile;
              for (let i = 1; i < multipleImageObj.files.length+1; i++) {
                const details = output.querySelector(`details[data-index="${i}"]`);
                if(details) details.setAttribute('data-index',String(i-1)); // need to reset indices on details elements
              }
              const unHideDetails = output.querySelector(`details[data-index="0"]`);
              if(unHideDetails)unHideDetails.removeAttribute('hidden');
              const newFile = multipleImageObj.files[0].currentFile;
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src=newFile;
            } else if (currentIndex===multipleImageObj.files.length-1) {
              multipleImageObj.files = multipleImageObj.files.slice(0,multipleImageObj.files.length-1);
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src = multipleImageObj.files[multipleImageObj.files.length-1].currentFile;  
              if (wrapper) wrapper.setAttribute('data-index',String(currentIndex-1)); // need to reset index on wrapper
              const unHideDetails = output.querySelector(`details[data-index="${currentIndex-1}"]`);
              if(unHideDetails)unHideDetails.removeAttribute('hidden');
              const newFile = multipleImageObj.files[currentIndex-1].currentFile;
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src=newFile;
            } else {
              multipleImageObj.files = multipleImageObj.files.slice(0,currentIndex).concat(multipleImageObj.files.slice(currentIndex+1));
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src = multipleImageObj.files[currentIndex].currentFile;
              for (let i = currentIndex+1; i < multipleImageObj.files.length+1; i++) {
                const details = output.querySelector(`details[data-index="${i}"]`);
                if(details) details.setAttribute('data-index',String(i-1)); // need to reset indices on details element
              }
              const unHideDetails = output.querySelector(`details[data-index="${currentIndex}"]`);
              if(unHideDetails)unHideDetails.removeAttribute('hidden');
              const newFile = multipleImageObj.files[currentIndex].currentFile;
              if(multipleImageObj.imageEditor)multipleImageObj.imageEditor.src=newFile;
            }
            if (hiddenInputThatKeepsURLs) hiddenInputThatKeepsURLs.value = multipleImageObj.files.map((obj)=>obj.currentUrl.trim()).join('|');
          }
          

        } 
      }
    }
    
  }
}
/**
 * 
 * @param this 
 * @param e 
 */
function handleDeleteImage(this:HTMLButtonElement,e:Event) {
const output = this.closest<HTMLOutputElement>('output');
  if(output) {
    const inputName = String(output.getAttribute('for'));
    const hiddenInputThatKeepsURLs = document.querySelector<HTMLInputElement>(`input[name="${inputName}-text"]`);
    if (KeepTrackPage['images'][inputName]) {
      delete KeepTrackPage['images'][inputName];
      clearInnerHTML(output);
      if (hiddenInputThatKeepsURLs) hiddenInputThatKeepsURLs.remove();
    } 
  }
}

/**
 * Append the tabs that allows the user to navigate multiple image uploads to the output element. Giving this process its own function to make code more readable
 * @param outputEl 
 * @param inputName 
 * @param fileLength 
 */
function appendMultipleImagesTabs(outputEl:HTMLOutputElement,inputName:string,fileLength:number) {
   // Create the wrapper and forward and back buttons for navigating image inputs
   const wrapper = document.createElement('div');
   wrapper.className="flex-row align-center justify-between w-100 bb p-md mt-2";
   wrapper.setAttribute('data-wrapper','true');
   wrapper.setAttribute('data-index','0');
   wrapper.setAttribute('data-input-name',inputName);
   wrapper.addEventListener("nav-media",handleNavMedia);
   const backButton = document.createElement('button');
   backButton.setAttribute('tabindex','-1');
   backButton.setAttribute('type','button');
   backButton.setAttribute('data-previous','true');
   backButton.className = "filled icon small secondary";
   backButton.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowBack"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>')
   backButton.addEventListener('click',dispatchCustomChangeMediaEvent);
   backButton.setAttribute('disabled','');
   
   const deleteButton = document.createElement('button');
   deleteButton.setAttribute('tabindex','-1');
   deleteButton.setAttribute('type','button');
   deleteButton.className = "filled icon small error";
   deleteButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
   deleteButton.addEventListener('click',handleDeleteMultipleImage);

   const forwardButton = document.createElement('button');
   forwardButton.setAttribute('tabindex','-1');
   forwardButton.setAttribute('type','button');
   forwardButton.setAttribute('data-next','true');
   forwardButton.className = "filled icon small primary";
   forwardButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowForward"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>');
   forwardButton.addEventListener('click',dispatchCustomChangeMediaEvent);

   if (fileLength===1) {
    forwardButton.setAttribute('disabled','');
    backButton.setAttribute('disabled','');
  } 
   wrapper.append(backButton);
   wrapper.append(deleteButton);
   wrapper.append(forwardButton);
   outputEl.append(wrapper);
}


/**
 * Need to add helper function for Image, Audio, and Video Change so you can 
 */
export async function handleImageUpload(files:FileList|File[],outputEl:HTMLOutputElement,inputEl:HTMLInputElement,initial:false|string|string[]=false) {
  /**
   * Should we show the pintura image editor or render the audio / video Element 
   * OR
   * if the input element has this attribute, should we just show the user the url(s) to copy
   */
  const GET_URL = inputEl.hasAttribute('data-copy-url');
  const PREVENT_DEFAULT = inputEl.hasAttribute('data-prevent-default');
  // Does the file input accept multiple images
  const multiple = inputEl.hasAttribute('multiple');
  // Open the loading dialog for uploading images
  if (!!!initial) openLoadingDialog(multiple ? "Uploading Images...":"Uploading Image...");
  // Get the name of the input element
  const inputName = String(inputEl.getAttribute('name'));  
  if (files && outputEl) {
    try {
      // If this is a multiple image input
      if (multiple&&files.length) {
        if (!!!initial) openLoadingDialog("Uploading Images...");
        // If there hasn't been uploaded images for this input yet
        if (!!!KeepTrackPage["multipleImages"][inputName]) {
          var responses: ({
            imageUrl: string;
            type: string;
          } | null)[];
          if (files.length > 30) handleImageError(5); // Maximum number of images to upload is 30
          const namesArray = Array.from(files).map((file) => file.name).slice(0,30);
          if (initial===false||!!!Array.isArray(initial)) {
            responses = await Promise.all(Array.from(files).slice(0,30).map((file,i) => getSignedUrlAndPostImage({name: namesArray[i], file, initial: true, multiple: true, original: true, previouslyUploaded: Boolean(initial) })));
          } else {
            responses = (initial as string[]).map((s,i) => ({ imageUrl: s, type: files[i].type.replace('image/','') }))
          }
          
          if (!!!GET_URL&&!!!PREVENT_DEFAULT) {
            if (responses.length) {
              appendMultipleImagesTabs(outputEl,inputName,files.length);
            }
            if (!!!initial) closeLoadingDialog();
            const filesArray: ImageFilesArray = []; 
            responses.forEach((resp,i) => {
              if (resp) filesArray.push({ name: namesArray[i], currentUrl: resp.imageUrl, currentFile: structuredClone(Array.from(files)[i]), type: resp.type, inputName });
            });
            const input = document.createElement('input');
            input.setAttribute('type','text');
            input.setAttribute('hidden','');
            input.setAttribute('name',inputName.concat('-text'));
            input.value = filesArray.map((obj) => obj.currentUrl.trim()).join('|');
            inputEl.insertAdjacentElement("afterend",input);
            const div = document.createElement('div');
            div.className = "image-editor-pintura";
            outputEl.append(div);
            responses.forEach((resp,i) => {
              if (resp) outputEl.insertAdjacentElement("beforeend",getAssociatedPhotoTextHTML(resp.imageUrl,i,Boolean(i!==0)));
            })
            onNewContentLoaded(outputEl);
            const pintura = await getPinturaImageEditor(div,files[0],filesArray[0].type,inputName,Boolean(initial));
            if (pintura) {
              KeepTrackPage["multipleImages"][inputName] = {
                input,
                files: filesArray,
                imageEditor: pintura
              };
            }
          } else if (GET_URL) {
            if (!!!initial) closeLoadingDialog();
            // If we should show the user the url to copy
            const renderURLsObject = responses.map((obj:{imageUrl: string;type: string;},i)=>({ filename: obj.imageUrl as string, originalFilename: namesArray[i]}))
            renderURLsInOutputImage(outputEl,'image',renderURLsObject);
          }
          if (responses) {
            inputEl.dispatchEvent(getUploadCompleteCustomEvent('image',responses.filter((obj) => obj).map((obj) => ({url: (obj as { imageUrl: string}).imageUrl}))));
          }
          // If there has been uploaded images for this input, do cleanup and upload the new images
        } 
      // Else if this is a single image input
      } else if (files.length===1&&outputEl) {
        if (!!!initial) openLoadingDialog("Uploading Image...");

        const fileName = files[0].name;
        const file = files[0];
        var resp: { imageUrl: string, type: string } | null = null;
        if (initial===false||Array.isArray(initial)){
           /**
           * Get the signed url to post the image
           */
          resp = await getSignedUrlAndPostImage({ name: fileName, file, initial: true, original: true, previouslyUploaded: Boolean(initial) });
        } else {
          resp = {imageUrl: initial as string, type: file.type.replace('image/','') }
        }
       
        if (resp && !!!GET_URL && !!!PREVENT_DEFAULT) {
          const { imageUrl, type } = resp;
          /**
           * If an input already exists for this file upload, then replace the currentURL, input value, and currentFile on the client side object and 
           * update the title and description attributes and update the pintura image editor 
           * 
           * Else create the div inside the `<output>` element for the pintura image editor, the input that contains the url of the file input 
           * and the `<details>` element for the associated image text 
           */
          if (KeepTrackPage["images"][inputName] && imageUrl) {
            KeepTrackPage["images"][inputName].currentUrl = imageUrl;
            const objToChangeURL = document.querySelector<HTMLInputElement>(`input[name="${inputName}-text"]`);
            if (objToChangeURL) objToChangeURL.value = imageUrl;
            KeepTrackPage["images"][inputName].currentFile = file;
            const title = outputEl.querySelector<HTMLInputElement>('input[name="'.concat(inputName.concat('-short-description')).concat('"]'));
            const textarea = outputEl.querySelector<HTMLTextAreaElement>('textarea[name="'.concat(inputName.concat('-long-description')).concat('"]'));
            if (title) title.value = '';
            if (textarea) textarea.value = '';
            if (KeepTrackPage["images"][inputName].imageEditor) (KeepTrackPage["images"][inputName].imageEditor as PinturaEditor).src = file;
          } else if (imageUrl) {
            const deleteImageDiv = document.createElement('div');
            deleteImageDiv.classList.add('flex-row','justify-end','align-center','bb','p-sm');
            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('tabindex','-1');
            deleteButton.setAttribute('type','button');
            deleteButton.className = "filled small icon error";
            deleteButton.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
            deleteButton.addEventListener('click',handleDeleteImage);
            deleteImageDiv.append(deleteButton);
            outputEl.append(deleteImageDiv);
            const div = document.createElement('div');
            div.className = "image-editor-pintura";
            outputEl.append(div);
            const input = document.createElement('input');
            input.setAttribute('type','text');
            input.setAttribute('readonly','');
            input.setAttribute('name',inputName.concat('-text'));
            input.setAttribute('hidden','');
            input.value = imageUrl;
            inputEl.insertAdjacentElement('afterend',input);
            KeepTrackPage["images"][inputName] = {
              name: fileName,
              currentUrl: imageUrl,
              index: 0,
              imageEditor: undefined,
              type,
              currentFile: structuredClone(file)
            };
            const pintura = await getPinturaImageEditor(div,file,type,inputName,Boolean(initial));
            if (pintura) {
              KeepTrackPage["images"][inputName].imageEditor = pintura; 
            }
            div.insertAdjacentElement("afterend",getAssociatedPhotoTextHTML(inputName,0,false));
            onNewContentLoaded(outputEl);
          }
        } else if (resp && GET_URL) {
          if (!!!initial) closeLoadingDialog();
          // If we should show the user the url to copy
          const renderURLsObj = { filename: resp.imageUrl, originalFilename: file.name };
          renderURLsInOutputImage(outputEl,'image',renderURLsObj);
        } 
        if (resp) {
          inputEl.dispatchEvent(getUploadCompleteCustomEvent('image',[{ url: resp.imageUrl }]));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (!!!initial) closeLoadingDialog();
}

/**
 * Callback that runs when the user uploads an image file from their device. Checks for a file on change,
 * a name of the input element, and an output element for the input element. If all three exist, then the 
 * `handleImageUpload` function is called 
 */
export async function addImageOnChange(this: HTMLInputElement,e:Event) {
  e.preventDefault();
  const inputName = String(this.getAttribute('name'));
  const files = this.files;
  const outputEl = document.querySelector<HTMLOutputElement>('output[for="'.concat(inputName).concat('"]'))
  if (files&&outputEl) {
    await handleImageUpload(Array.from(files),outputEl,this);
  }
}

/**
 * Delete reference to image from client side code - mainly used for lexical but 
 * might also extend to audio and video inputs depending on how this works out. 
 * 1. Deletes the client side reference to the image
 * @param this 
 * @param e 
 */
export function deleteImage(this:HTMLInputElement,e:CustomEvent<{inputName: string}>) {
  const inputName = e.detail.inputName;
  if(inputName){
		const inputElement = document.querySelector(`input[type="file"][name="${inputName}"]`);
		if (inputElement) {
			const multiple = inputElement.hasAttribute('multiple');
			if (multiple){
				if (KeepTrackPage.multipleImages[inputName]) delete KeepTrackPage.multipleImages[inputName]
			} else {
				const keys = Object.keys(KeepTrackPage.images);
				for (let key of keys){
					if (KeepTrackPage.images[key]) delete KeepTrackPage.images[key];
				}
			}
		}
  }	
}

/*---------------------------------------- Audio and Video Types ---------------------------------- */
type InitialFileArray = { file: File; name: string; size: number; }[]
// See '/signed-url/audio/:audio_name/:parts'
type SignedURLsRequestResponse = {
  urls: string[],
  UploadId: string,
  Key: string
};
/**
 * Delete an audio or video input after uploading
 * **Note**: This means that you should never use the original file input to check for the actual input value
 */
function handleDeleteMedia(this:HTMLButtonElement,e:Event) {
  const closestWrapper = this.closest<HTMLDivElement>('div[data-media-output-wrapper]');
  if (closestWrapper) closestWrapper.remove();
  const output = this.closest('output');
  if (output) {
    const videoOrAudio = output.querySelector('audio, video');
    const outputHeader = output.querySelector('p[data-media-output-header]');
    if (!!!videoOrAudio&&outputHeader) outputHeader.remove();
  }
}
/**
 * Function to get the html that should wrap audio and video inputs. Since this function will run 4 times, we only write it once.
 * 
 * @param audioOrVideoHTML 
 * @param outputElement 
 */
function appendAudioOrVideoOutput(audioOrVideoHTML:string,outputElement:HTMLElement) {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-media-output-wrapper','');
  wrapper.style.borderBottom = '1px solid var(--divider)'; 
  wrapper.style.paddingBottom = '6px';

  const buttonWrapper = document.createElement('div');
  buttonWrapper.className="flex-row justify-end align-center";
  buttonWrapper.style.paddingBottom = "2px";

  const button = document.createElement('button');
  button.setAttribute('type','button');
  button.className = 'icon small filled error';
  button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
  button.addEventListener('click',handleDeleteMedia);
  
  buttonWrapper.append(button);

  wrapper.append(buttonWrapper);
  wrapper.insertAdjacentHTML("beforeend",audioOrVideoHTML); //getAudioHTML(url)
  outputElement.append(wrapper);
}
/**
 * Append a header for the audio or video output to improve styling
 * @param type 
 * @param multiple 
 * @param outputElement 
 */
function appendAudioOrVideoOutputElementHeader(type:'audio'|'video',multiple:boolean,outputElement:HTMLOutputElement) {
  const p = document.createElement('p');
  p.style.cssText = "margin-bottom: 6px;"
  p.classList.add('h5','bold','bb');
  p.setAttribute('data-media-output-header','')
  if (type==="audio"){
    p.innerText= multiple ? "Audio Outputs:" : "Audio Output:";
  }else if(type==="video") {
    p.innerText= multiple ? "Video Outputs:" : "Video Output:";
  }
  outputElement.append(p);
}
//2.13rem
/* ----------------------------------------------------- Video Upload ------------------------------------------------------------------- */
/**
 * Show the appropriate error snackbar when there is an error uploading the video
 * @param num 
 * @returns 
 */
export function handleVideoError(num:number) {
  const id = 'video-error-popover';
  const el = document.getElementById(id) as HTMLDivElement|null;
  const ariaHidden = el ? el.getAttribute('aria-hidden') : 'true';
  if (ariaHidden==="false") return;
  if (el) {
    const texts = Array.from(el.querySelectorAll<HTMLSpanElement>('span[data-error]'));
    texts.forEach((el) => {
      if (el.getAttribute('data-error')===String(num)) el.removeAttribute('hidden');
      else el.setAttribute('hidden','');
    })
    openSnackbarFinal2(el);
  }
}

/**
 * Validate the size and (type/extension) of the video
 * @param file 
 * @returns Size is the the number of chunks for the multipart upload
 */
function validateVideo(file: File) {
  try {
    const name = file.name;
    if (!!!file.type.startsWith('video/',0)) throw new Error('1');
    const type = getExtension(name);
    if (!!!VALID_VIDEO_FILE_EXTENSIONS.has(type)) throw new Error('2');
    if (file.size > MAX_VIDEO_SIZE) throw new Error('3');
    const size = Math.ceil(file.size/CHUNK_SIZE);
    return { file, name, size };
  } catch (error) {
    const int = parseInt(error.message);
    if (!!!isNaN(int)) {
      handleVideoError(int);
    } else {
      handleVideoError(4);
    }
    return null;
  }
}

export async function handleVideoUpload(files:FileList|File[],inputEl: HTMLInputElement,outputElement:HTMLOutputElement,initial:boolean=false) {
  const GET_URL = inputEl.hasAttribute('data-copy-url');
  const PREVENT_DEFAULT = inputEl.hasAttribute('data-prevent-default');
  const multiple = Boolean(inputEl.hasAttribute('multiple'));
  try {
    if (multiple && files) {
      // Validate all  the videos
      const videos:InitialFileArray = Array.from(files).map((obj) => validateVideo(obj)).filter((obj) => obj!==null) as InitialFileArray;
      if (videos.length) {
        // Open the loading video dialog        
        openLoadingDialog('Uploading Videos...');
        // Only accept 10 videos, for the first 10 videos, get their width and height
        const videosSizes = await Promise.all(
          videos.slice(0,10).map((obj) => getVideoWidthAndHeight(obj.file)
          )
        );
        /**
         * Get the signed urls for all the valid videos
         * Signed URLs Resp should be the same length as videos (max 10)
         */
        const signedUrlsResp = await Promise.all(
          videos.slice(0,10)
          .map((video,i) => 
          fetch('/api/signed-url/video/'.concat(encodeURIComponent(video.name)).concat('/').concat(String(video.size).concat(`?height=${videosSizes[i]?.height || null}&size=${video.file.size}`)))
          .then((res)=>{
            if (res.status!==200) throw new Error('Network request');
            return res.json()
          })
          .then((res: SignedURLsRequestResponse) => res))
        );
        const promiseArray: Promise<{ETag: string, PartNumber: number}>[] = [];
        /**
         * Get the stats for the loading indicator
         */
        const highestPartCompleted = videos.map((o) => 0); // highest part completed per array
        var highestPartToComplete = 0;
        for (let i = 0; i < signedUrlsResp.length; i++) {
          highestPartToComplete = Math.max(highestPartToComplete,signedUrlsResp[i].urls.length);
        }
        /**
         * Upload the chunks to the database
         */
        for (let respIndex = 0; respIndex < signedUrlsResp.length; respIndex++){
          for (let urlIndex=0; urlIndex < signedUrlsResp[respIndex].urls.length; urlIndex++){
            promiseArray.push(
              fetch(signedUrlsResp[respIndex].urls[urlIndex],{
                method: 'PUT', 
                body: videos[respIndex].file.slice(CHUNK_SIZE*urlIndex,CHUNK_SIZE*(urlIndex+1)) 
              })
              .then((res) => {
                if (res.status!==200) throw new Error('Network request');
                if(urlIndex+1>highestPartCompleted[respIndex]){
                  highestPartCompleted[respIndex]=urlIndex+1;
                  const text = "Video Uploads Percent Complete: ".concat(String(100*Math.min(...highestPartCompleted)/highestPartToComplete).slice(0,5)).concat('%');
                  setLoadingDialogInnerText(text);
                }
                return { ETag:  (res.headers.get('ETag')||res.headers.get('Etag')) as string, PartNumber: urlIndex+1 as number};
              })
            );
          }
        }
        const uploadPartsResp = await Promise.all(promiseArray);
        const completePromiseArray:Promise<{height:number}>[] = [];
        var currPartIndex = 0;
        /**
         * Complete the multipart uploads for all the videos
         */
        for (let videoIndex = 0; videoIndex < videos.length; videoIndex++) {
          const { Key, UploadId } = signedUrlsResp[videoIndex];
          const { size } = videos[videoIndex];
          const Parts = uploadPartsResp.slice(currPartIndex,currPartIndex+size);
          currPartIndex+=size;
          completePromiseArray.push(
            fetch('/api/complete-video',
            { method: 'POST', body: JSON.stringify({ Parts, UploadId, Key }), 
            headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken()} }
            ).then((res) => {
              if (res.status!==200) throw new Error('Network request');
              return res.json() as Promise<{ height: number}>
            })
          );
        }
        const widthAndHeightArr = await Promise.all(completePromiseArray);
        closeLoadingDialog();
        if (!!!GET_URL&&!!!PREVENT_DEFAULT) {
          /**
           * Add video inputs to the dom
           */
          if (outputElement) {
            clearInnerHTML(outputElement);
            appendAudioOrVideoOutputElementHeader('video',false,outputElement);
            for (let i=0; i < signedUrlsResp.length;i++){
              const {Key} = signedUrlsResp[i];
              const src = 'https://video.storething.org/'.concat(Key);
              appendAudioOrVideoOutput(getVideoHTML(src,undefined,String(widthAndHeightArr[i].height)),outputElement);
            }
            onNewContentLoaded(outputElement);
            outputElement.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
          }
        } else if (GET_URL) {
          closeLoadingDialog();
          // If we should show the user the url to copy
          const urls = signedUrlsResp.map((obj) => getVideoSourcesFromOriginalFileName(`https://video.storething.org/${obj.Key}`).videoSources.map((obj) => obj.src)).flat(1);
          renderURLsInOutput(outputElement,'video',urls);
        }
        inputEl.dispatchEvent(getUploadCompleteCustomEvent('video',signedUrlsResp.map((obj) => ({ url: `https://video.storething.org/${obj.Key}` }))));
      } else throw new Error('4');
    } else if (files) {
      const video = validateVideo(files[0]);
      if (video) {
        openLoadingDialog("Uploading Video...");
        const widthAndHeight = await getVideoWidthAndHeight(video.file);
        /**
         * Get signed urls for the video
         */
        const signedURLsResp = await fetch('/api/signed-url/video/'.concat(encodeURIComponent(video.name)).concat('/').concat(String(video.size)).concat(`?height=${widthAndHeight?.height || null}&size=${video.file.size}`))
        .then((res)=>{
          if (res.status!==200) throw new Error('Network request');
          return res.json()
        })
        .then((res:SignedURLsRequestResponse) => res);

        const promiseArray: Promise<{ETag: string, PartNumber: number}>[] = [];
        var highestPartCompleted = 0;
        const maxPartCompleted = signedURLsResp.urls.length;
        /**
         * Upload the chunks to the s3 database
         */
        for (let i = 0; i < signedURLsResp.urls.length; i++) {
          if (signedURLsResp.urls[i]) {
            promiseArray.push(
              fetch(signedURLsResp.urls[i],{method: 'PUT', body: video.file.slice(CHUNK_SIZE*i,CHUNK_SIZE*(i+1)) })
              .then((res) => {
                if (res.status!==200) throw new Error('Network request');
                if (i+1 > highestPartCompleted) {
                  highestPartCompleted=i+1;
                  const text = "Video Upload Percent Complete: ".concat(String(100*highestPartCompleted/maxPartCompleted).slice(0,5)).concat('%');
                  setLoadingDialogInnerText(text);
                }
                return { ETag:  (res.headers.get('ETag')||res.headers.get('Etag')) as string, PartNumber: i+1 as number};
              })
            );
          }
          else throw new Error('4'); // something went wrong
        }
        const uploadPartsResp = await Promise.all(promiseArray);
        /**
         * Complete the multipart upload
         */
        const {height} = await fetch('/api/complete-video',{ method: 'POST', body: JSON.stringify({ Parts: uploadPartsResp, UploadId: signedURLsResp.UploadId, Key: signedURLsResp.Key}), headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken()} }).then((res) => {
          if (res.status!==200) throw new Error('Network request');
          return res.json()
        }) as {height: number};
        closeLoadingDialog();
        if (!!!GET_URL && !!!PREVENT_DEFAULT) {
          /**
           * Add the video input to the dom
           */
          if (outputElement) {
            clearInnerHTML(outputElement);
            appendAudioOrVideoOutputElementHeader('video',true,outputElement);
            appendAudioOrVideoOutput(getVideoHTML('https://video.storething.org/'.concat(signedURLsResp.Key),undefined,String(height)),outputElement);
            onNewContentLoaded(outputElement);
            outputElement.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
          }
        } else if (GET_URL) {
          closeLoadingDialog();
          // If we should show the user the url to copy
          const urls = getVideoSourcesFromOriginalFileName(`https://video.storething.org/${signedURLsResp.Key}`);
          renderURLsInOutput(outputElement,'video',urls.videoSources.map((obj)=>obj.src));
        }
        inputEl.dispatchEvent(getUploadCompleteCustomEvent('video',[{ height: height, url: `https://video.storething.org/${signedURLsResp.Key}`}]))
      } else throw new Error('4');
    }
  } catch (error) {
    closeLoadingDialog();
    const int = parseInt(error.message);
    if (!!!isNaN(int)) {
      handleVideoError(int);
    } else {
      handleVideoError(4);
    }
  }
}

/**
 * Video on Change callback that is called when the user uploads a video from their device
 * The callback checks for files on the input, the name of the input element, and the output element for the input
 * If all three exist, the `handleVideoUpload` callback is called. 
 * @param this 
 * @param _ 
 */
export async function addVideoOnChange(this: HTMLInputElement,e:Event) {
  e.preventDefault();
  const files = this.files;
  const inputName = String(this.getAttribute('name'));
  const outputElement = document.querySelector<HTMLOutputElement>('output[for="'.concat(inputName).concat('"]'));
  if (files&&inputName&&outputElement) {
    await handleVideoUpload(files,this,outputElement);
  }
}


/* ------------------------------------ Audio Upload ---------------------------------------------------- */

/**
 * Show the error snackbar if there is an error handling audio uploads
 * @param num 
 * @returns 
 */
export function handleAudioError(num:number) {
  const id = 'audio-error-popover';
  const el = document.getElementById(id) as HTMLDivElement|null;
  const ariaHidden = el ? el.getAttribute('aria-hidden') : 'true';
  if (ariaHidden==="false") return;
  if (el) {
    const texts = Array.from(el.querySelectorAll<HTMLSpanElement>('span[data-error]'));
    texts.forEach((el) => {
      if (el.getAttribute('data-error')===String(num)) el.removeAttribute('hidden');
      else el.setAttribute('hidden','');
    })
    openSnackbarFinal2(el);
  }
}

/**
 * Check the type of the audio file and the size of the audio file. Throw error if 
 * the file is too big or if the file does not have the right type
 * @param file 
 * @returns Size is the the number of chunks for the multipart upload
 */
function validateAudio(file: File) {
  try {
    const name = file.name;
    if (!!!file.type.startsWith('audio/',0)&&!!!file.type.startsWith('video/',0)) throw new Error('1');
    const type = getExtension(file.name);
    if (!!!VALID_AUDIO_FILE_EXTENSIONS.has(type)) throw new Error('2');
    if (file.size > MAX_AUDIO_SIZE) throw new Error('3');
    const size = Math.ceil(file.size/CHUNK_SIZE);
    return { file, name, size };
  } catch (error) {
    const int = parseInt(error.message);
    if (!!!isNaN(int)) {
      handleAudioError(int);
    } else {
      handleAudioError(4);
    }
    return null;
  }
}

export async function handleAudioUpload(files:FileList|File[],inputEl: HTMLInputElement,outputElement:HTMLOutputElement,initial:boolean=false) {
  const GET_URL = inputEl.hasAttribute('data-copy-url');
  const PREVENT_DEFAULT = inputEl.hasAttribute('data-prevent-default');
  const multiple = Boolean(inputEl.hasAttribute('multiple'));
  const html = document.querySelector('html');
  try {
    if (multiple && files) {
      const audios: InitialFileArray = Array.from(files).map((obj) => validateAudio(obj)).filter((obj) => obj!==null) as InitialFileArray;
      if (audios.length) {
        openLoadingDialog('Uploading Audio Files...');
        /**
         * Get the keys, upload ids, signed urls for all of the uploaded audio files
         */
        const signedUrlsResp = await Promise.all(
          audios.slice(0,10)
          .map((audio) => fetch('/api/signed-url/audio/'.concat(encodeURIComponent(audio.name)).concat('/').concat(String(audio.size)).concat(`?size=${audio.file.size}`))
          .then((res)=>{
            if (res.status!==200) throw new Error('Network request');
            return res.json()
          })
          .then((res:SignedURLsRequestResponse) => res))
        );
        const promiseArray: Promise<{ETag: string, PartNumber: number}>[] = [];
        /**
         * Get stats for indicator
         */
        const highestPartCompleted = audios.slice(0,10).map((o) => 0); // highest part completed per array
        var highestPartToComplete = 0;
        for (let i = 0; i < signedUrlsResp.length; i++) {
          highestPartToComplete = Math.max(highestPartToComplete,signedUrlsResp[i].urls.length);
        }
        /**
         * Upload all the chunks to the database
         */
        for (let respIndex = 0; respIndex < signedUrlsResp.length; respIndex++){
          for (let urlIndex=0; urlIndex < signedUrlsResp[respIndex].urls.length; urlIndex++){
            promiseArray.push(
              fetch(signedUrlsResp[respIndex].urls[urlIndex],{method: 'PUT', body: audios[respIndex].file.slice(CHUNK_SIZE*urlIndex,CHUNK_SIZE*(urlIndex+1)) })
              .then((res) => {
                if (res.status!==200) throw new Error('Network request');
                if(urlIndex+1>highestPartCompleted[respIndex]){
                  highestPartCompleted[respIndex]=urlIndex+1;
                  const text = "Audio Uploads Percent Complete: ".concat(Number(100*Math.min(...highestPartCompleted)/highestPartToComplete).toFixed(3)).concat('%');
                  setLoadingDialogInnerText(text);
                }
                return { ETag:  (res.headers.get('ETag')||res.headers.get('Etag')) as string, PartNumber: urlIndex+1 as number};
              })
            );
          }
        }
        const uploadPartsResp = await Promise.all(promiseArray);
        const completePromiseArray:Promise<any>[] = [];
        var currPartIndex = 0;
        /**
         * Complete multipart Uploads
         */
        for (let audioIndex = 0; audioIndex < audios.length; audioIndex++) {
          const { Key, UploadId } = signedUrlsResp[audioIndex];
          const { size } = audios[audioIndex];
          const Parts = uploadPartsResp.slice(currPartIndex,currPartIndex+size);
          currPartIndex+=size;
          completePromiseArray.push(fetch('/api/complete-audio',{ method: 'POST', body: JSON.stringify({ Parts, UploadId, Key }), headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken()} }).then((res) => {
            if (res.status!==200) throw new Error('Network request');
          }));
        }
        await Promise.all(completePromiseArray);
        closeLoadingDialog();
        if(!!!GET_URL&&!!!PREVENT_DEFAULT) {
          /**
           * Insert the html for the audio inputs
           */
          if (outputElement) {
            clearInnerHTML(outputElement);
            appendAudioOrVideoOutputElementHeader('audio',false,outputElement);
            for (let i=0; i < signedUrlsResp.length;i++){
              const {Key} = signedUrlsResp[i];
              const url = 'https://audio.storething.org/'.concat(Key);
              appendAudioOrVideoOutput(getAudioHTML(url),outputElement);
            }
            onNewContentLoaded(outputElement);
            outputElement.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
          }
        } else if (GET_URL) {
          closeLoadingDialog();
          // If we should show the user the url to copy
          const urls = signedUrlsResp.map((obj) => getAudioSourcesFromOriginalFilename(`https://audio.storething.org/${obj.Key}`).audioSources.map((obj) => obj.src)).flat(1);
          renderURLsInOutput(outputElement,'audio',urls);
        }
        inputEl.dispatchEvent(getUploadCompleteCustomEvent('audio',signedUrlsResp.map((obj) => ({ url:  `https://audio.storething.org/${obj.Key}` }))));
      } else throw new Error('4');
    } else if (files) {
      const audio = validateAudio(files[0]);
      if (audio) {
        openLoadingDialog("Uploading Audio...");
        /**
         * Get the signed urls for the audio upload
         */
        const resp = await fetch('/api/signed-url/audio/'.concat(encodeURIComponent(audio.name)).concat('/').concat(String(audio.size)).concat(`?size=${audio.file.size}`))
        .then((res)=>{
          if (res.status!==200) throw new Error('Network request');
          return res.json()
        })
        .then((res:SignedURLsRequestResponse) => res);
        const promiseArray: Promise<{ETag: string, PartNumber: number}>[] = [];
        var highestPartCompleted = 0;
        const maxPartCompleted = resp.urls.length;
        /**
         * Upload the audio chunks to the database
         */
        for (let i = 0; i < resp.urls.length; i++) {
          if (resp.urls[i]) promiseArray.push(
            fetch(resp.urls[i],{method: 'PUT', body: audio.file.slice(CHUNK_SIZE*i,CHUNK_SIZE*(i+1)) })
            .then((res) => {
              if (res.status!==200) throw new Error('Network request');
              if (i+1 > highestPartCompleted) {
                highestPartCompleted=i+1;
                const text = "Audio Upload Percent Complete: ".concat(String(100*highestPartCompleted/maxPartCompleted).slice(0,5)).concat('%');
                setLoadingDialogInnerText(text);
              }
              return { ETag: (res.headers.get('ETag')||res.headers.get('Etag')) as string, PartNumber: i+1 as number};
            })
          );
          else throw new Error('4'); // something went wrong
        }
        const uploadPartsResp = await Promise.all(promiseArray);
        /**
         * Complete the multipart upload
         */
        await fetch('/api/complete-audio',{ method: 'POST', body: JSON.stringify({ Parts: uploadPartsResp, UploadId: resp.UploadId, Key: resp.Key}), headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken()} }).then((res) => {
          if (res.status!==200) throw new Error('Network request');
        });
        closeLoadingDialog();
        if (!!!GET_URL&&!!!PREVENT_DEFAULT) {
          /**
           * Add the audio outputs to the dom
           */
          if (outputElement) {
            clearInnerHTML(outputElement);
            appendAudioOrVideoOutputElementHeader('audio',true,outputElement);
            appendAudioOrVideoOutput(getAudioHTML('https://audio.storething.org/'.concat(resp.Key)),outputElement);
            onNewContentLoaded(outputElement);
            outputElement.scrollIntoView(SCROLL_INTO_VIEW_OPTIONS);
          }
        } else if (GET_URL) {
          closeLoadingDialog();
          // If we should show the user the url to copy
          const { Key } = resp;
          const { audioSources } = getAudioSourcesFromOriginalFilename(`https://audio.storething.org/${Key}`);
          const urls = audioSources.map((obj) => obj.src);
          renderURLsInOutput(outputElement,'audio',urls);
        }
        inputEl.dispatchEvent(getUploadCompleteCustomEvent('audio',[{ url: `https://audio.storething.org/${resp.Key}`}]))
      } else throw new Error('4');
    }
  } catch (error) {
    closeLoadingDialog();
    const int = parseInt(error.message);
    if (!!!isNaN(int)) {
      handleAudioError(int);
    } else {
      handleAudioError(4);
    }
  }
}

/**
 * Video on Change callback that is called when the user uploads a video from their device
 * The callback checks for files on the input, the name of the input element, and the output element for the input
 * If all three exist, the `handleVideoUpload` callback is called. 
 * @param this 
 * @param _ 
 */
export async function addAudioOnChange(this: HTMLInputElement,e:Event) {
  e.preventDefault();
  const files = this.files;
  const inputName = String(this.getAttribute('name'));
  const outputElement = document.querySelector<HTMLOutputElement>('output[for="'.concat(inputName).concat('"]'));
  if (files&&inputName&&outputElement) {
    await handleAudioUpload(files,this,outputElement);
  }
}

/* ------------------------- GIF on Change ------------------------------------------ */

export async function addGifOnChange(this:HTMLInputElement,e:Event) {
  const files = this.files;
  if (files) {
    try {
      var filesToUse:File[] = [];
      if (this.hasAttribute('multiple')) {
        filesToUse = Array.from(files).slice(0,30);
      } else {
        filesToUse = Array.from(files).slice(0,1);
      }
      const loadingDialogText = "Uploading GIF...";
      // Validate the image size and type
      openLoadingDialog(loadingDialogText);
      const filesToUseFinal:File[] = [];
      const signedURLs = await Promise.all(
        filesToUse.filter((file) => {
          try {
            const typeStr = file.type;
            if (!!!typeStr.startsWith('image/',0)) throw new Error('1');
            const type = typeStr.replace('image/','');
            if (file.size > MAX_IMAGE_SIZE) throw new Error('2');
            if (type!=='gif') throw new Error('3');
            filesToUseFinal.push(file);
            return true;
          } catch (error) {
            handleImageError(parseInt(error.message));
            return false;
          }
        }).map(async (file) => {
          const widthAndHeight = await getImageWidthAndHeight(file);
          // Get the signed url from the database
          return fetch('/api/signed-url/image/'.concat(encodeURIComponent(file.name)).concat(`?size=${file.size}&height=${widthAndHeight.height}&width=${widthAndHeight.width}`))
          .then((res)=>{
            if (res.status!==200) throw new Error('Network request');
            return res.json()
          }).then((res) => res.url as string);
        })
      );
      await Promise.all(signedURLs.map((s,i) => {
        return fetch(s,{ method: 'PUT', headers: {"Content-Type": "multipart/form-data"}, body: filesToUseFinal[i] }).then((res) => {
          if (res.status!==200) throw new Error('Network request');
        });
      }))
      const urls = signedURLs.map((s) => {
          // Extract the s3 image key from the signed url
        const url = new URL(s);
        const newImageUrl = 'https://image.storething.org'.concat(url.pathname);
        return newImageUrl;
      })
      closeLoadingDialog();
      this.setAttribute('data-uploads',urls.join('|'));
      this.dispatchEvent(new CustomEvent('gif-upload',{ detail: {urls} }));
    } catch (error) {
      console.error(error);
      closeLoadingDialog();
    }
    
  }
}

/* ----------------------------------------------------------- Ste Listeners and Remove Inputs on Page Change ----------------------------- */
/**
 * Set the change and delete-image listeners on the inputs with types equal to file, audio, and video
 */
export function setFileUploadListeners(){
  onLoadSetUploadMediaListeners();
  const imageUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-image-input]:not([data-ignore-change])'));
  const gifUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][accept=".gif"]:not([data-ignore-change])'));
  const audioUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-audio-input]:not([data-ignore-change])'));
  const videoUpload = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-video-input]:not([data-ignore-change])'));
  imageUpload.forEach(async (el) => {
    el.addEventListener("change",addImageOnChange);
    el.addEventListener('delete-image',deleteImage);
    const inputName = String(el.getAttribute('name'));
    const id = String(el.id);
    const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
    const defaultValues = el.getAttribute('data-default-value');
    el.removeAttribute('data-default-value');
    const multiple = el.hasAttribute('multiple');
    if(defaultValues&&output&&output.innerText.trim()==="") {
      try {
        const jsonObj = JSON.parse(decodeURIComponent(defaultValues)) as {src:string,shortDescription:string,longDescription:string}[];
        const imageFiles:File[] = [];
        if (multiple) {
          await Promise.all(
              jsonObj.map((imageObj) => 
              fetch(imageObj.src)
              .then((res) => {
                if (res.status!==200) throw new Error('Network request');
                return res.blob()
              })
              .then((blob) => {
                const name = imageObj.src.replace('https://image.storething.org/frankmbrown/','');
                const lastIndexOfPeriod = name.lastIndexOf('.');
                const type = 'image/'.concat(name.slice(lastIndexOfPeriod+1));
                const file = new File([blob],name,{ type });
                imageFiles.push(file);
              })
              .catch((e) => console.error(e))
            )
          );
          await handleImageUpload(imageFiles,output,el,jsonObj.map((o) => o.src));
          for (let imageObj of jsonObj) {
            const shortDescription = document.querySelector<HTMLInputElement>(`input[type="text"][id="${imageObj.src}-short-description"]`);
            const longDescription = document.querySelector<HTMLTextAreaElement>(`input[type="text"][id="${imageObj.src}-long-description"]`);
            if (shortDescription)shortDescription.value = imageObj.shortDescription;
            if (longDescription)longDescription.value = imageObj.longDescription;
          }
        } else {
          await fetch(jsonObj[0].src)
          .then((res) => {
            if (res.status!==200) throw new Error('Network request');
            return res.blob()
          })
          .then((blob) => {
            const name = jsonObj[0].src.replace('https://image.storething.org/frankmbrown/','');
            const lastIndexOfPeriod = name.lastIndexOf('.');
            const type = 'image/'.concat(name.slice(lastIndexOfPeriod+1));
            const file = new File([blob],name,{ type });
            imageFiles.push(file);
          })
          .catch((e) => console.error(e));
          await handleImageUpload(imageFiles,output,el,jsonObj[0].src);
          const shortDescription = document.querySelector<HTMLInputElement>(`input[type="text"][id="${inputName}-short-description"]`);
          const longDescription = document.querySelector<HTMLTextAreaElement>(`input[type="text"][id="${inputName}-long-description"]`);
          if (shortDescription)shortDescription.value = jsonObj[0].shortDescription;
          if (longDescription)longDescription.value = jsonObj[0].longDescription;
        }
      } catch (e) {
        console.error(e);
      }
      output.style.removeProperty('min-height');
    }
  });
  /**
   * Add change listener for the file input and see if the audio upload has a default value. If the file upload has a default value, then 
   * render the audio HTML inside the `<output>` element
   */
  audioUpload.forEach(el => {
    el.addEventListener("change",addAudioOnChange);
    const id = String(el.id);
    const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
    const defaultValues = el.getAttribute('data-default-value');
    el.removeAttribute('data-default-value');
    const multiple = el.hasAttribute('multiple');
    if(defaultValues&&output&&output.innerText.trim()==="") {
      try {
        const jsonObj = JSON.parse(decodeURIComponent(defaultValues)) as {src:string,title:string}[];
        if (Array.isArray(jsonObj)) {
          const parsedArr = jsonObj.filter((obj) => Boolean(
            typeof obj.src === "string" && 
            obj.src.startsWith('https://audio.storething.org/') && 
            typeof obj.title==="string"
          ));
          if (parsedArr.length) {
            if (multiple) {
              appendAudioOrVideoOutputElementHeader('audio',true,output);
              for (let obj of parsedArr) {
                appendAudioOrVideoOutput(getAudioHTML(obj.src,undefined),output);
                setAudioDefaultTitle(obj.src,obj.title,output);
              }
            } else {
              appendAudioOrVideoOutput(getAudioHTML(parsedArr[0].src,undefined),output);
              setAudioDefaultTitle(parsedArr[0].src,parsedArr[0].title,output);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      output.style.removeProperty('min-height');
    }
  });
  /**
   * Add change listener for the file input and see if the video upload has a default value. If the file upload has a default value, then 
   * render the video HTML inside the `<output>` element
   */
  videoUpload.forEach(el => {
    el.addEventListener("change",addVideoOnChange);
    const id = String(el.id);
    const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
    const defaultValues = el.getAttribute('data-default-value');
    el.removeAttribute('data-default-value');
    const multiple = el.hasAttribute('multiple');
    if(defaultValues&&output&&output.innerText.trim()==="") {
      try {
        clearInnerHTML(output);
        const jsonObj = JSON.parse(decodeURIComponent(defaultValues)) as {src:string,title:string,description:string,height: number}[];
        if (Array.isArray(jsonObj)) {
          const parsedArr = jsonObj.filter((obj) => Boolean(
            typeof obj.src === "string" && 
            obj.src.startsWith('https://video.storething.org/') && 
            typeof obj.title==="string" && 
            typeof obj.description==="string" && 
            typeof obj.height==="number"
          ));
          if (parsedArr.length) {
            if (multiple) {
              appendAudioOrVideoOutputElementHeader('video',true,output);
              for (let obj of parsedArr) {
                appendAudioOrVideoOutput(getVideoHTML(obj.src,undefined,String(obj.height)),output);
                setVideoDefaultTitle(obj.src,obj.title,obj.description,output);
              }
            } else {
              appendAudioOrVideoOutputElementHeader('video',false,output);
              setVideoDefaultTitle(parsedArr[0].src,parsedArr[0].title,parsedArr[0].description,output);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
      output.style.removeProperty('min-height');
    }
    
  });
  gifUpload.forEach((el) => {
    el.addEventListener('change',addGifOnChange);
  })
}

/**
 * Clears keeping track of images on the page
 */
export function handlePageChangeMediaInputs(){
  KeepTrackPage.images = {};
  KeepTrackPage.multipleImages = {}; 
}
window.handlePageChangeMediaInputs = handlePageChangeMediaInputs;

export function getClientImageData(id:string,multiple:boolean) {
  if (multiple) KeepTrackPage.multipleImages[id];
  return KeepTrackPage.images[id];
}


export { 
  onLoadSetUploadMediaListeners, 
  closeMediaStream, 
  closeRecordImageDialog as closeImageDialog, 
  closeRecordAudioDialog as closeAudioDialog, 
  closeRecordVideoDialog as closeVideoDialog  
};


