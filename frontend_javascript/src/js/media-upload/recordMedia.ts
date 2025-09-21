import {
  computePosition,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/dom";
import { 
  captureClick, 
  isTouchDevice, 
  openDialog, 
  closeDialog, 
  getDurationString,
  getClosestDialogOrBody 
} from "../shared";

import { 
  getAudioHTML,
  getVideoHTML,
  handleImageUpload,
  handleAudioUpload,
  handleVideoUpload,
  handleImageError,
  handleAudioError,
  handleVideoError, 
} from ".";
const supportedConstraints = navigator?.mediaDevices?.getSupportedConstraints();
const HAS_MULTIPLE_CAMERA_DIRECTIONS = isTouchDevice() && supportedConstraints &&Boolean(new Set(Object.keys(supportedConstraints)).has('facingMode'));
/**
 * 
 * @returns An array of the supported media types by the device
 */
function getAllSupportedMimeTypes() {
  const mediaTypes =['video', 'audio']
  const CONTAINERS = ['webm', 'ogg', 'mp3', 'mp4', 'x-matroska', '3gpp', '3gpp2', '3gp2', 'quicktime', 'mpeg', 'aac', 'flac', 'x-flac', 'wave', 'wav', 'x-wav', 'x-pn-wav', 'not-supported']
  const CODECS = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h.265', 'h264', 'h.264', 'opus', 'vorbis', 'pcm', 'aac', 'mpeg', 'mp4a', 'rtx', 'red', 'ulpfec', 'g722', 'pcmu', 'pcma', 'cn', 'telephone-event', 'not-supported']
  
  return [...Array.from(new Set(
    CONTAINERS.flatMap(ext =>
        mediaTypes.flatMap(mediaType => [
          `${mediaType}/${ext}`,
        ]),
    ),
  )), ...Array.from(new Set(
    CONTAINERS.flatMap(ext =>
      CODECS.flatMap(codec =>
        mediaTypes.flatMap(mediaType => [
          // NOTE: 'codecs:' will always be true (false positive)
          `${mediaType}/${ext};codecs=${codec}`,
        ]),
      ),
    ),
  )), ...Array.from(new Set(
    CONTAINERS.flatMap(ext =>
      CODECS.flatMap(codec1 =>
      CODECS.flatMap(codec2 =>
        mediaTypes.flatMap(mediaType => [
          `${mediaType}/${ext};codecs="${codec1}, ${codec2}"`,
        ]),
      ),
      ),
    ),
  ))].filter(variation => MediaRecorder.isTypeSupported(variation));
}
/**
 * Prevent camera or video from being paused on click
 * @param this 
 * @param e 
 */
async function preventStopOnClick(this:HTMLVideoElement,e:Event) {
  await this.play().catch((e) => console.error(e));
}
 
/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 */
const autoUpdateObject:{[key: string]: any} = {};
/**
 * Array to keep track of the current media stream. This array should be 
 * 
 */
var MEDIA_STREAM: MediaStream|undefined = undefined;
/**
 * Array to keep track of the current media stream. This array should be 
 * 
 */
var IMAGE_CAPTURE: ImageCapture|undefined = undefined;
/**
 * - MediaRecorder to keep track of the current media stream. This MediaRecorder should be initialized when the 
 * user starts recording audio
 * - After initialization, the MEDI
 * - This should be set to undefined when 1) the user stops recording and 2) when the dialog is closed
 */
var MEDIA_RECORDER: MediaRecorder|undefined = undefined;
/**
 * Array to keep track of the current data. 
 * - This array should be made empty whenever the dialog closes
 * - This array should be made empty before the user 
 * - This array should be added to on the media recorder ondataavailable event
 * - When the user stops recording audio / video, this array should be turned into a blob using the 
 * `new  Blob(CURRENT_DATA, {type: '[audio|video]/[any]'})` and it should then be made empty again
 */
var CURRENT_DATA: Blob[] = [];
var CURRENT_FILES:File[]|File|undefined = undefined;
var IMAGE_DIRECTION:"user"|"environment" = "user";
var VIDEO_DIRECTION: "user"|"environment" = "user";
var FILES_TO_UPLOAD:File[]|File|undefined = undefined;
var CURRENT_TYPE:'video'|'audio'|undefined = undefined;
var START_TIME = 0;
var END_TIME = 0;
var DISABLE_DEFAULT_IMAGE:boolean = true;
var DISABLE_DEFAULT_AUDIO:boolean = true;
var DISABLE_DEFAULT_VIDEO:boolean = true;

function getPreviewVideo(file: File) {
  const src = URL.createObjectURL(file);
  return getVideoHTML(src,true);
}

function getPreviewAudio(file: File) {
  const src = URL.createObjectURL(file);
  return getAudioHTML(src,true);
}

function getPreviewImage(file: File) {
  const image = new Image();
  image.style.setProperty("max-width","min(600px, 100%)");
  image.style.setProperty("max-height","min(600px, 100%)");
  image.style.setProperty("width","auto");
  image.style.setProperty("height","auto");
  image.classList.add('no-click');
  image.src = URL.createObjectURL(file);
  return image;
}

const getImagePopover = () => document.getElementById("upload-image-popover") as HTMLDivElement|null;
const getAudioPopover = () => document.getElementById("upload-audio-popover") as HTMLDivElement|null;
const getVideoPopover = () => document.getElementById("upload-video-popover") as HTMLDivElement|null;

function getImageDialog() {
  const dialog = document.getElementById('upload-image-dialog') as HTMLDivElement|null;
  if(dialog){
    const multiple = dialog.querySelector<HTMLInputElement>('input[data-multiple]');
    const preview = dialog.querySelector<HTMLButtonElement>('button[data-preview]');
    const takeImage = dialog.querySelector<HTMLButtonElement>('button#take-image-button');
    const form = dialog.querySelector<HTMLFormElement>('form#upload-image-form');
    const loader = dialog.querySelector<HTMLDivElement>('div[data-loader]');
    const output = dialog.querySelector<HTMLOutputElement>('output[form="upload-image-form"]');
    const video = dialog.querySelector<HTMLVideoElement>('video');
    const actions = dialog.querySelector<HTMLDivElement>('div[data-actions]');
    const switchCameraButton = dialog.querySelector<HTMLButtonElement>('button[data-switch-camera]');
    if(
      dialog&&
      multiple&&
      preview&&
      takeImage&&
      form&&
      loader&&
      output&&
      video&&
      actions&&
      switchCameraButton
    ) {
      return {
        dialog,
        multiple,
        preview,
        takeImage,
        form,
        loader,
        output,
        video,
        actions,
        switchCameraButton
      };
    }
  }
  return null;
}
function getAudioDialog() {
  const dialog = document.getElementById('upload-audio-dialog') as HTMLDivElement|null;
  if(dialog){
    const multiple = dialog.querySelector<HTMLInputElement>('input[data-multiple]');
    const preview = dialog.querySelector<HTMLButtonElement>('button[data-preview]');
    const recordAudio =  dialog.querySelector<HTMLButtonElement>('button#record-audio-button');
    const form = dialog.querySelector<HTMLFormElement>('form#upload-audio-form');
    const loader = dialog.querySelector<HTMLDivElement>('div[data-loader]');
    const output = dialog.querySelector<HTMLOutputElement>('output[form="upload-audio-form"]');
    const audio = dialog.querySelector<HTMLAudioElement>('audio');
    const time = dialog.querySelector<HTMLSpanElement>('span[data-time]');
    const actions = dialog.querySelector<HTMLDivElement>('div[data-actions]');
    if(
      dialog&&
      multiple&&
      preview&&
      recordAudio&&
      form&&
      loader&&
      output&&
      audio&&
      time&&
      actions
    ) {
      return {
        dialog,
        multiple,
        preview,
        recordAudio,
        form,
        loader,
        output,
        audio,
        time,
        actions
      };
    }
  }
  return null;
}
function getVideoDialog() {
  const dialog = document.getElementById('upload-video-dialog') as HTMLDivElement|null;
  if(dialog) {
    const multiple = dialog.querySelector<HTMLInputElement>('input[data-multiple]');
    const preview = dialog.querySelector<HTMLButtonElement>('button[data-preview]');
    const recordVideo =  dialog.querySelector<HTMLButtonElement>('button#take-video-button');
    const form = dialog.querySelector<HTMLFormElement>('form#upload-video-form');
    const loader = dialog.querySelector<HTMLDivElement>('div[data-loader]');
    const output = dialog.querySelector<HTMLOutputElement>('output[form="upload-video-form"]');
    const video = dialog.querySelector<HTMLVideoElement>('video');
    const time = dialog.querySelector<HTMLSpanElement>('span[data-time]');
    const actions = dialog.querySelector<HTMLDivElement>('div[data-actions]');
    const switchCameraButton = dialog.querySelector<HTMLButtonElement>('button[data-switch-camera]');
    if(
      multiple &&
      preview &&
      recordVideo &&
      form &&
      loader &&
      output &&
      video&&
      time&&
      actions&&
      switchCameraButton
      ) {
      return {
        dialog,
        multiple,
        preview,
        recordVideo,
        form,
        loader,
        output,
        video,
        time,
        actions,
        switchCameraButton
      };
    }
  }
  return null;
}

function closeImagePopover(){
  if (autoUpdateObject['upload-image-popover']) {
    try {
      autoUpdateObject['upload-image-popover']();
      delete autoUpdateObject['upload-image-popover'];
      const popover = getImagePopover();
      if (popover) {
        popover.style.display = "none";
        popover.style.opacity = "0";
      }
    } catch (e) {}
  }
}
function closeAudioPopover(){
  if (autoUpdateObject['upload-audio-popover']) {
    try {
      autoUpdateObject['upload-audio-popover']();
      delete autoUpdateObject['upload-audio-popover'];
      const popover = getAudioPopover();
      if (popover) {
        popover.style.display = "none";
        popover.style.opacity = "0";
      }
    } catch (e) {}
  }
}
function closeVideoPopover(){
  if (autoUpdateObject['upload-video-popover']) {
    try {
      autoUpdateObject['upload-video-popover']();
      delete autoUpdateObject['upload-video-popover'];
      const popover = getVideoPopover();
      if (popover) {
        popover.style.display = "none";
        popover.style.opacity = "0";
      }
    } catch (e) {}
  }
}

function closePopovers(this:HTMLElement) {
  closeImagePopover();
  closeAudioPopover();
  closeVideoPopover();
  this.removeEventListener('click',closePopovers);
}

function openPopover(input:HTMLInputElement,popover:HTMLDivElement,type:"image"|"audio"|"video") {
  const el = getClosestDialogOrBody(input);
  if (el) el.addEventListener('click',closePopovers);
  popover.addEventListener('click',captureClick);
  popover.style.display = "block";
  const updatePopover = () => {
    const middleWare:any[] = [];
    const options:any = {};
    const classList = popover.classList;
    middleWare.push(offset(1));
    middleWare.push(shift());
    const placement = "bottom-start";
    const noFlip = popover.getAttribute("data-no-flip");
    if (noFlip === null) middleWare.push(flip());
    options.placement = placement;
    options.middleware = middleWare;

    computePosition(input, popover, options).then(
      ({ x, y }) => {
        var assignObj = {};
          assignObj = {
            left: `${x}px`,
            top: `${y}px`,
            opacity: "1",
        };
        Object.assign(popover.style, assignObj);
      }
    ).catch((err) => {
      console.error(err);
      const assignObj = {
        left: `0px`,
        top: `0px`,
        opacity: "0",
      };
      Object.assign(popover.style, assignObj);
      popover.setAttribute('hidden','');
    });
  };
  updatePopover();
  const cleanup = autoUpdate(input, popover, updatePopover);
  if (type==="image"){
    delete autoUpdateObject["upload-image-popover"];
    autoUpdateObject["upload-image-popover"] = cleanup;
  }else if (type==="audio"){
    delete autoUpdateObject["upload-audio-popover"];
    autoUpdateObject["upload-audio-popover"] = cleanup;
  }else if (type==="video"){
    delete autoUpdateObject["upload-video-popover"];
    autoUpdateObject["upload-video-popover"] = cleanup;
  }
}

export function closeMediaStream() {
  CURRENT_TYPE = undefined;
  if (MEDIA_STREAM) {
    MEDIA_STREAM.getTracks().forEach((track) => track.stop());
    MEDIA_STREAM = undefined;
  }
  if (CURRENT_FILES) {
    CURRENT_FILES = undefined;
  }
  if (IMAGE_CAPTURE){
    IMAGE_CAPTURE = undefined;
  }
  if (MEDIA_RECORDER) {
    MEDIA_RECORDER.stop();
    MEDIA_RECORDER = undefined;
  }
}

/* -------------------------- Handle Audio, Video and Input Clicks ------------------------------- */
var CURRENT_IMAGE_INPUT:HTMLInputElement|undefined = undefined;
var CURRENT_AUDIO_INPUT:HTMLInputElement|undefined = undefined;
var CURRENT_VIDEO_INPUT:HTMLInputElement|undefined = undefined;

function setCurrentImage(input:HTMLInputElement) {
  CURRENT_IMAGE_INPUT = input;
}
function getCurrentImage() {
  if (CURRENT_IMAGE_INPUT&&CURRENT_IMAGE_INPUT.isConnected) {
    return CURRENT_IMAGE_INPUT;
  } else {
    CURRENT_IMAGE_INPUT = undefined;
    return null;
  }
}

function setCurrentAudio(input:HTMLInputElement) {
  CURRENT_AUDIO_INPUT = input;
}
function getCurrentAudio() {
  if (CURRENT_AUDIO_INPUT&&CURRENT_AUDIO_INPUT.isConnected) {
    return CURRENT_AUDIO_INPUT;
  } else {
    CURRENT_AUDIO_INPUT = undefined;
    return null;
  }
}
function setCurrentVideo(input:HTMLInputElement) {
  CURRENT_VIDEO_INPUT = input;
}
function getCurrentVideo() {
  if (CURRENT_VIDEO_INPUT&&CURRENT_VIDEO_INPUT.isConnected) {
    return CURRENT_VIDEO_INPUT;
  } else {
    CURRENT_VIDEO_INPUT = undefined;
    return null;
  }
}



function handleImageInputClick(this:HTMLInputElement,e:Event){
  if(DISABLE_DEFAULT_IMAGE){
    e.preventDefault();
    e.stopPropagation();
    const name = this.getAttribute('name');
    if (name) setCurrentImage(this);
    const imagePopover = getImagePopover();
    if(imagePopover)openPopover(this,imagePopover,"image");
  }else {
    DISABLE_DEFAULT_IMAGE = true;
  }
}
function handleAudioInputClick(this:HTMLInputElement,e:Event){
  if(DISABLE_DEFAULT_AUDIO){
    e.preventDefault();
    e.stopPropagation();
    const name = this.getAttribute('name');
    if (name) setCurrentAudio(this);
    const audioPopover = getAudioPopover();
    if(audioPopover)openPopover(this,audioPopover,"audio");
  }else {
    DISABLE_DEFAULT_AUDIO = true;
  }
}
function handleVideoInputClick(this:HTMLInputElement,e:Event){
  if(DISABLE_DEFAULT_VIDEO) {
    e.preventDefault();
    e.stopPropagation();
    const name = this.getAttribute('name');
    if (name) setCurrentVideo(this);
    const videoPopover = getVideoPopover();
    if(videoPopover)openPopover(this,videoPopover,"video");
  } else {
    DISABLE_DEFAULT_VIDEO = true;
  }
} 

function dispatchDefaultImageBehavior(this:HTMLInputElement){
  DISABLE_DEFAULT_IMAGE = false;
  const input = getCurrentImage();
  if (input) {
    input.click();
  }
  closeImagePopover();
}
function dispatchDefaultAudioBehavior(this:HTMLInputElement){
  DISABLE_DEFAULT_AUDIO = false;
  const input = getCurrentAudio();
  if (input) {
    input.click();
  }
  closeAudioPopover();
}
function dispatchDefaultVideoBehavior(this:HTMLInputElement){
  DISABLE_DEFAULT_VIDEO = false;
  const input = getCurrentVideo();
  if (input) {
    input.click();
  }
  closeVideoPopover();
}

/* -------------------------- Handle Audio, Video and Input Dialogs ------------------------------- */
function openImageDialog(this:HTMLButtonElement,e:Event) {
  const dialogObj = getImageDialog();
  const currentImage = getCurrentImage();
  if(dialogObj&&currentImage){
    const { dialog, form, loader, output, multiple, video, switchCameraButton  } = dialogObj;
    const inputIsMultiple = currentImage.hasAttribute('multiple');
    form.setAttribute('hidden','');
    output.innerHTML = '';
    output.setAttribute('hidden','');
    loader.removeAttribute('hidden');
    if (HAS_MULTIPLE_CAMERA_DIRECTIONS) {
      switchCameraButton.removeAttribute('hidden');
    } else switchCameraButton.setAttribute('hidden','');
    multiple.value=String(inputIsMultiple);
    video.srcObject=null;
    closeMediaStream();
    openDialog(dialog);
    CURRENT_TYPE = undefined;
    IMAGE_DIRECTION = 'user';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: IMAGE_DIRECTION } })
    .then((mediaStream) => {
      MEDIA_STREAM = mediaStream;
      video.srcObject = MEDIA_STREAM;
      video.addEventListener('pause',preventStopOnClick);
      const track = MEDIA_STREAM.getVideoTracks()[0];
      if ('ImageCapture' in window) { 
        try {
          IMAGE_CAPTURE = new ImageCapture(track);
        } catch (error) {
          console.error(error);
          IMAGE_CAPTURE = undefined;
          closeDialog(dialog);
          handleImageError(6);
        }
      }
      loader.setAttribute('hidden','');
      form.removeAttribute('hidden');
    })
    .catch((error) => {
      closeDialog(dialog);
      handleImageError(6);
      form.setAttribute('hidden','');
      output.innerHTML = '';
      output.setAttribute('hidden','');
      loader.setAttribute('hidden','');
    })
    closeImagePopover();
  }
}
function openAudioDialog(this:HTMLButtonElement,e:Event) {
  const dialogObj = getAudioDialog();
  const currentAudio = getCurrentAudio();
  if(dialogObj&&currentAudio){
    const { dialog, form, loader, output, multiple, audio  } = dialogObj;
    const inputIsMultiple = currentAudio.hasAttribute('multiple');
    form.setAttribute('hidden','');
    output.innerHTML = '';
    output.setAttribute('hidden','');
    loader.removeAttribute('hidden');
    multiple.value=String(inputIsMultiple);
    audio.srcObject=null;
    closeMediaStream();
    openDialog(dialog);
    CURRENT_TYPE = 'audio';
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then((mediaStream) => {
      MEDIA_STREAM = mediaStream;
      audio.srcObject = MEDIA_STREAM;
      audio.volume = 0;
      loader.setAttribute('hidden','');
      form.removeAttribute('hidden');
    })
    .catch((error) => {
      closeDialog(dialog);
      handleAudioError(6);
      form.setAttribute('hidden','');
      output.innerHTML = '';
      output.setAttribute('hidden','');
      loader.setAttribute('hidden','');
    })
    closeAudioPopover();
  }
}
function openVideoDialog(this:HTMLButtonElement,e:Event) {
  const dialogObj = getVideoDialog();
  const currentVideo = getCurrentVideo();
  if(dialogObj&&currentVideo){
    const { dialog, form, loader, output, multiple, video, switchCameraButton  } = dialogObj;
    const inputIsMultiple = currentVideo.hasAttribute('multiple');
    form.setAttribute('hidden','');
    output.innerHTML = '';
    output.setAttribute('hidden','');
    loader.removeAttribute('hidden');
    if (HAS_MULTIPLE_CAMERA_DIRECTIONS) switchCameraButton.removeAttribute('hidden');
    else switchCameraButton.setAttribute('hidden','');
    multiple.value=String(inputIsMultiple);
    video.srcObject=null;
    closeMediaStream();
    openDialog(dialog);
    CURRENT_TYPE = 'video';
    VIDEO_DIRECTION = 'user';
    navigator.mediaDevices.getUserMedia({ video: { facingMode: VIDEO_DIRECTION }, audio: true })
    .then((mediaStream) => {
      MEDIA_STREAM = mediaStream;
      video.srcObject = MEDIA_STREAM;
      video.addEventListener('pause',preventStopOnClick);
      video.volume=0;
      loader.setAttribute('hidden','');
      form.removeAttribute('hidden');
    })
    .catch((error) => {
      closeDialog(dialog);
      handleVideoError(6);
      form.setAttribute('hidden','');
      output.innerHTML = '';
      output.setAttribute('hidden','');
      loader.setAttribute('hidden','');
    })
    closeVideoPopover();
  }
} 

/*--------------------------------- On Dialog Close ---------------------------------- */
/*
- Set Everything Hidden
- Close Media Stream
- Remove the srcObject of the audio or video element
*/
export function closeRecordImageDialog() {
  const dialogObj = getImageDialog();
  if(dialogObj) {
    const { form, loader, output, video, actions } = dialogObj;
    video.srcObject = null;
    closeMediaStream();
    form.setAttribute('hidden','');
    loader.setAttribute('hidden','');
    output.setAttribute('hidden','');
    actions.setAttribute('hidden','');
  }
}
export type closeRecordImageDialogType = typeof closeRecordImageDialog;
window.closeRecordImageDialog = closeRecordImageDialog;
export function closeRecordAudioDialog() {
  const dialogObj = getAudioDialog();
  if(dialogObj) {
    const { audio, output, form, loader, actions, recordAudio:recordAudioButton, time } = dialogObj;
    audio.srcObject = null;
    closeMediaStream();
    form.setAttribute('hidden','');
    loader.setAttribute('hidden','');
    output.setAttribute('hidden','');
    actions.setAttribute('hidden','');
    time.innerText="0:00";
    recordAudioButton.classList.remove('recording');
  }
}
export type closeRecordAudioDialogType = typeof closeRecordAudioDialog;
window.closeRecordAudioDialog = closeRecordAudioDialog;
export function closeRecordVideoDialog() {
  const dialogObj = getVideoDialog();
  if(dialogObj) {
    const { video, output, form, loader, actions, recordVideo:recordVideoButton, time } = dialogObj;
    video.srcObject = null;
    closeMediaStream();
    form.setAttribute('hidden','');
    loader.setAttribute('hidden','');
    output.setAttribute('hidden','');
    actions.setAttribute('hidden','');
    time.innerText="0:00";
    recordVideoButton.classList.remove('recording');
  }
}
export type closeRecordVideoDialogType = typeof closeRecordVideoDialog;
window.closeRecordVideoDialog = closeRecordVideoDialog;

async function onSubmitImageDialog(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const input = getCurrentImage();
  const imageDialogObj = getImageDialog();
  if(imageDialogObj&&input){
    const { dialog } = imageDialogObj;
    const output = document.querySelector<HTMLOutputElement>(`output[for="${String(input.getAttribute('name'))}"]`);
    if(CURRENT_FILES&&output) {
      FILES_TO_UPLOAD = structuredClone(CURRENT_FILES);
      closeDialog(dialog);
      if (Array.isArray(FILES_TO_UPLOAD)) {
        await handleImageUpload(FILES_TO_UPLOAD,output,input);
      } else {
        await handleImageUpload([FILES_TO_UPLOAD],output,input);
      }
      const dataTransfer = new DataTransfer();
      const arr = Array.isArray(FILES_TO_UPLOAD) ? FILES_TO_UPLOAD : [FILES_TO_UPLOAD];
      for (let i=0; i < arr.length; i++) {
        dataTransfer.items.add(arr[i]);
        if (!!!input.hasAttribute('multiple')) break;
      }
      input.files = dataTransfer.files;
    }else {
      closeDialog(dialog);
    } 
  }
}
async function onSubmitAudioDialog(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const input = getCurrentAudio();
  const audioDialogObj = getAudioDialog();
  if(audioDialogObj&&input){
    const { dialog } = audioDialogObj;
    const output = document.querySelector<HTMLOutputElement>(`output[for="${String(input.getAttribute('name'))}"]`);
    if(CURRENT_FILES&&output) {
      FILES_TO_UPLOAD = structuredClone(CURRENT_FILES);
      closeDialog(dialog);
      if (Array.isArray(FILES_TO_UPLOAD)) {
        await handleAudioUpload(FILES_TO_UPLOAD,input,output);
      } else {
        await handleAudioUpload([FILES_TO_UPLOAD],input,output);
      }
    }else{  
      closeDialog(dialog);
    }
  }
}
async function onSubmitVideoDialog(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const input = getCurrentVideo();
  const videoDialogObj = getVideoDialog();
  if(videoDialogObj&&input){
    const { dialog } = videoDialogObj;
    const output = document.querySelector<HTMLOutputElement>(`output[for="${String(input.getAttribute('name'))}"]`);
    if(CURRENT_FILES&&output) {
      FILES_TO_UPLOAD = structuredClone(CURRENT_FILES);
      closeDialog(dialog);
      if (Array.isArray(FILES_TO_UPLOAD)) {
        await handleVideoUpload(FILES_TO_UPLOAD,input,output);
      } else {
        await handleVideoUpload([FILES_TO_UPLOAD],input,output);
      }
    } else {
      closeDialog(dialog);
    }
  }
}

function onResetImageDialog(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  const imageDialogObj = getImageDialog();
  if(imageDialogObj){
    const { actions, form, output } = imageDialogObj;
    output.setAttribute('hidden','');
    output.innerHTML='';
    if (CURRENT_FILES) {
      CURRENT_FILES = undefined;
    }
    form.removeAttribute('hidden');
    actions.setAttribute('hidden','');
  }
  
}
function onResetAudioDialog(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  const audioDialogObj = getAudioDialog();
  if(audioDialogObj){
    const { actions, form, output, time } = audioDialogObj;
    output.setAttribute('hidden','');
    output.innerHTML='';
    if (CURRENT_FILES) {
      CURRENT_FILES = undefined;
    }
    if (MEDIA_RECORDER) {
      MEDIA_RECORDER.ondataavailable = null;
      MEDIA_RECORDER.stop();
      MEDIA_RECORDER = undefined;
    }
    if (CURRENT_DATA.length) CURRENT_DATA = [];
    time.innerText="0:00";
    form.removeAttribute('hidden');
    actions.setAttribute('hidden','');
  }
}
function onResetVideoDialog(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  const videoDialogObj = getVideoDialog();
  if(videoDialogObj){
    const { actions, form, output, time } = videoDialogObj;
    output.setAttribute('hidden','');
    output.innerHTML='';
    if (CURRENT_FILES) {
      CURRENT_FILES = undefined;
    }
    if (MEDIA_RECORDER) {
      MEDIA_RECORDER.ondataavailable = null;
      MEDIA_RECORDER.stop();
      MEDIA_RECORDER = undefined;
    }
    if (CURRENT_DATA.length) CURRENT_DATA = [];
    time.innerText="0:00";
    form.removeAttribute('hidden');
    actions.setAttribute('hidden','');
  }
}

const VALID_DATA_TYPES = new Set(['image','audio','video'] as const);
function handleDeleteMediaClick(this:HTMLButtonElement,e:Event) {
  const deleteStr = this.getAttribute('data-delete');
  const type = this.getAttribute('data-type');
  if(deleteStr&&VALID_DATA_TYPES.has(type as any)) {
    const deleteIndex = parseInt(deleteStr);
    const dialog = this.closest('div.dialog-wrapper');
    const div = this.closest('div');
    const output = this.closest('output');
    if(div&&output&&!!!isNaN(deleteIndex)&&dialog){
      div.remove();
      if(Array.isArray(CURRENT_FILES)) {
        if (CURRENT_FILES.length===1) {
          CURRENT_FILES = undefined;
        } else {
          if (deleteIndex===0) {
            CURRENT_FILES = CURRENT_FILES.slice(1);
          } else if (deleteIndex===CURRENT_FILES.length-1){
            CURRENT_FILES = CURRENT_FILES.slice(0,CURRENT_FILES.length-1);
          } else {
            CURRENT_FILES = CURRENT_FILES.slice(0,deleteIndex).concat(CURRENT_FILES.slice(deleteIndex+1,CURRENT_FILES.length));
          }
          const childDiv = output.children[1];
          if (childDiv&&childDiv.nodeName==="DIV") (childDiv as HTMLDivElement).style.setProperty("border-top","none");
        }
      } else {
        CURRENT_FILES = undefined;
      }
    }
  }

}

function getDeleteButton(deleteIndex:number,type:"image"|"audio"|"video") {
  const button = document.createElement('button');
  button.setAttribute('type','button');
  button.classList.add('icon-text','medium','filled','error');
  button.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
  button.append(new Text("DELETE"));
  button.setAttribute('data-delete',String(deleteIndex));
  button.setAttribute('data-type',type);
  button.style.setProperty("margin","4px 0px");
  button.style.setProperty("margin-left","auto");
  button.addEventListener('click',handleDeleteMediaClick);
  return button;
}
function getShowForm(type:"image"|"audio"|"video") {
  const showForm = function(){
    if (type==="image"){
      const imageDialogObj = getImageDialog();
      if(imageDialogObj) {
        const { output, form, actions } = imageDialogObj;
        output.setAttribute('hidden','');
        output.innerHTML = '';
        if (!!!CURRENT_FILES) actions.setAttribute('hidden','');
        else actions.removeAttribute('hidden');
        form.removeAttribute('hidden');
        
      }
    } else if (type==="audio"){
      const audioDialogObj = getAudioDialog();
      if(audioDialogObj) {
        const { output, form, actions, time } = audioDialogObj;
        output.setAttribute('hidden','');
        output.innerHTML = '';
        time.innerText="0:00";
        if (!!!CURRENT_FILES) actions.setAttribute('hidden','');
        else actions.removeAttribute('hidden');
        form.removeAttribute('hidden');
      }
    } else if (type==="video"){
      const videoDialogObj = getVideoDialog();
      if(videoDialogObj) {
        const { output, form, actions, time } = videoDialogObj;
        output.setAttribute('hidden','');
        output.innerHTML = '';
        time.innerText="0:00";
        if (!!!CURRENT_FILES) actions.setAttribute('hidden','');
        else actions.removeAttribute('hidden');
        form.removeAttribute('hidden');
      }
    }
  };
  return showForm;
}
function getButtonShowForm(type:"image"|"audio"|"video") {
  const div = document.createElement('div');
  const button = document.createElement('button');
  button.setAttribute('type','button');
  button.classList.add('icon-text','medium','filled','warning');
  button.insertAdjacentHTML("afterbegin",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Edit"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>');
  button.append(new Text("BACK TO FORM"));
  button.addEventListener('click',getShowForm(type));
  div.append(button);
  return div;
}
function insertPreviewImage(output:HTMLOutputElement,file:File,i:number) {
  const div = document.createElement('div');
  const div2 = document.createElement('div');
  if (!!!isTouchDevice()) {
    div2.style.cssText = "max-width: 600px; max-height: 600px; display:block; margin: auto";
  }  
  div.classList.add('text-align-right');
  if (i!==0) div.style.setProperty('border-top','2px solid var(--divider)');
  div.style.setProperty('margin-bottom','0.75rem');
  const button = getDeleteButton(i,"image");
  const image = getPreviewImage(file);
  div2.append(button,image);
  div.append(div2);
  output.append(div);
}
function onPreviewImageDialog(this:HTMLButtonElement,e:Event) {
  if (CURRENT_FILES) {
    const imageDialogObj = getImageDialog();
    if(imageDialogObj){
      const { output, form } = imageDialogObj;
      output.innerHTML='';
      output.append(getButtonShowForm("image"));
      if (Array.isArray(CURRENT_FILES)) {
        for (let i = 0; i < CURRENT_FILES.length; i++) {
          insertPreviewImage(output,CURRENT_FILES[i],i)
        }
      } else {
        insertPreviewImage(output,CURRENT_FILES,0)
      }
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
      form.setAttribute('hidden','');
      output.removeAttribute('hidden');
    }
  }
}
function insertPreviewVideo(output:HTMLOutputElement,file:File,i:number) {
  const div = document.createElement('div');
  const div2 = document.createElement('div');
  div2.classList.add('text-align-right');
  if (!!!isTouchDevice()) {
    div2.style.cssText = "max-width: 600px; max-height: 600px; display:block; margin: auto";
  }  
  div.classList.add('flex-row','justify-center');
  if (i!==0) div.style.setProperty('border-top','2px solid var(--divider)');
  div.style.setProperty('margin-bottom','0.75rem');
  div.style.setProperty('margin-top','0.25rem');
  const button = getDeleteButton(i,"image");
  const video = getPreviewVideo(file);
  div2.append(button);
  div2.insertAdjacentHTML("beforeend",video);
  div.append(div2);
  output.append(div);
}
function onPreviewVideoDialog(this:HTMLButtonElement,e:Event) {
  if (CURRENT_FILES) {
    const videoDialogObj = getVideoDialog();
    if(videoDialogObj){
      const { output, form } = videoDialogObj;
      output.innerHTML='';
      output.append(getButtonShowForm("video"));
      if (Array.isArray(CURRENT_FILES)) {
        for (let i = 0; i < CURRENT_FILES.length; i++) {
          insertPreviewVideo(output,CURRENT_FILES[i],i);
        }
      } else {
        insertPreviewVideo(output,CURRENT_FILES,0);
      }
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
      form.setAttribute('hidden','');
      output.removeAttribute('hidden');
    }
  }
}
function insertPreviewAudio(output:HTMLOutputElement,file:File,i:number) {
  const div = document.createElement('div');
  const div2 = document.createElement('div');
  div2.classList.add('text-align-right');
  if (!!!isTouchDevice()) {
    div2.style.cssText = "max-width: 600px; max-height: 600px; display:block; margin: auto";
  }  
  div.classList.add('block');
  if (i!==0) div.style.setProperty('border-top','2px solid var(--divider)');
  div.style.setProperty('margin-bottom','0.75rem');
  div.style.setProperty('margin-top','0.25rem');
  const button = getDeleteButton(i,"audio");
  const audio = getPreviewAudio(file);
  div2.append(button);
  div2.insertAdjacentHTML("beforeend",audio);
  div.append(div2);
  output.append(div);
}
function onPreviewAudioDialog(this:HTMLButtonElement,e:Event) {
  if (CURRENT_FILES) {
    const audioDialogObj = getAudioDialog();
    if(audioDialogObj){
      const { output, form } = audioDialogObj;
      output.innerHTML='';
      output.append(getButtonShowForm("audio"));
      if (Array.isArray(CURRENT_FILES)) {
        for (let i = 0; i < CURRENT_FILES.length; i++) {
          insertPreviewAudio(output,CURRENT_FILES[i],i)
        }
      } else {
        insertPreviewAudio(output,CURRENT_FILES,0)
      }
      document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
      form.setAttribute('hidden','');
      output.removeAttribute('hidden');
    } 
  }
}

function getSwitchCameraDirection(type:"image"|"video"){
  const switchCameraDirection = function (this:HTMLButtonElement,e:Event) {
    // Returning the same thing for image and video assumes that you don't need top rest the IMAGE_CAPTURE object
    if (MEDIA_STREAM) {
      const track = MEDIA_STREAM.getVideoTracks()[0]
      if (track) {
        const settings = track.getSettings();
        const facingMode = settings.facingMode;
        if (facingMode==='user') {
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints
          track.applyConstraints({ facingMode: 'environment' })
          .then(() => {})
          .catch((error) => {
            alert(String(error));
          })
        } else if (facingMode === 'environment') {
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/applyConstraints
          track.applyConstraints({ facingMode: 'user' })
          .then(() => {})
          .catch((error) => {
            alert(String(error));
          })
        }
      }
    }
  }
  return switchCameraDirection;
}
/**
 * For 
 */
function onNewDataAvailable(ev: BlobEvent) {
  CURRENT_DATA.push(ev.data);
  const now = Math.floor(Date.now()/1000);
  END_TIME = now;
  const diff = END_TIME-START_TIME;
  if(CURRENT_TYPE==="audio") {
    const audioDialogObj = getAudioDialog();
    if(audioDialogObj){
      audioDialogObj.time.innerText = getDurationString(diff);
    }
  } else if (CURRENT_TYPE==="video") {
    const videoDialogObj = getVideoDialog();
    if(videoDialogObj){
      videoDialogObj.time.innerText = getDurationString(diff);
    }
  }
}
function recordAudio(this:HTMLButtonElement,e:Event){
  if (this.classList.contains('recording')) {
    this.classList.remove('recording');
    if (MEDIA_RECORDER) {
      MEDIA_RECORDER.stop();
      const name = 'audio_'.concat(window.crypto.randomUUID()).concat('.mp3');
      const NewAudioFile = new File(structuredClone(CURRENT_DATA),name, { type: 'audio/mp3' });
      const audioDialogObj = getAudioDialog();
      if (audioDialogObj) {
        const { multiple, actions, time } = audioDialogObj;
        if (multiple.value==="true") {
          if (Array.isArray(CURRENT_FILES)) CURRENT_FILES.push(NewAudioFile);
          else CURRENT_FILES = [NewAudioFile];
        } else {
          CURRENT_FILES = NewAudioFile;
        }
        actions.removeAttribute('hidden');
        time.innerText = "0:00";
      }
      CURRENT_DATA=[];
      MEDIA_RECORDER.ondataavailable = null;
      MEDIA_RECORDER = undefined;
    }
  } else {
    this.classList.add('recording');
    if (MEDIA_STREAM) {
      CURRENT_TYPE='audio';
      const now = Math.floor(Date.now()/1000);
      START_TIME = now;
      END_TIME = now;
      const newMediaRecorder = new MediaRecorder(MEDIA_STREAM);
      CURRENT_DATA = [];
      newMediaRecorder.ondataavailable = onNewDataAvailable;
      MEDIA_RECORDER = newMediaRecorder;
      MEDIA_RECORDER.start(1000);
    }
  }
  this.blur();
}
function recordVideo(this:HTMLButtonElement,e:Event) {
  if (this.classList.contains('recording')) {
    this.classList.remove('recording');
    if (MEDIA_RECORDER) {
      MEDIA_RECORDER.stop();
      const name = 'video_'.concat(window.crypto.randomUUID()).concat('.mp4');
      const NewVideoFile = new File(structuredClone(CURRENT_DATA),name,{ type: 'video/mp4'});
      const videoDialogObj = getVideoDialog();
      if (videoDialogObj) {
        const { multiple, actions, time } = videoDialogObj;
        if (multiple.value==="true") {
          if (Array.isArray(CURRENT_FILES)) CURRENT_FILES.push(NewVideoFile);
          else CURRENT_FILES = [NewVideoFile];
        } else {
          CURRENT_FILES = NewVideoFile;
        }
        actions.removeAttribute('hidden');
        time.innerText = "0:00";
        CURRENT_DATA=[];
        MEDIA_RECORDER.ondataavailable = null;
        MEDIA_RECORDER = undefined;
      }
    }
  } else {
    this.classList.add('recording');
    if (MEDIA_STREAM) {
      CURRENT_TYPE='video';
      const now = Math.floor(Date.now()/1000);
      START_TIME = now;
      END_TIME = now;
      const newMediaRecorder = new MediaRecorder(MEDIA_STREAM);
      CURRENT_DATA = [];
      newMediaRecorder.ondataavailable = onNewDataAvailable;
      MEDIA_RECORDER = newMediaRecorder;
      MEDIA_RECORDER.start(1000);
    }
  }
  this.blur();
}
/**
 * W.O.R.A.
 */
function handleTakenImage(NewImageFile: File) {
  const imageDialogObj = getImageDialog();
  if(imageDialogObj) {
    const { multiple, actions } = imageDialogObj;
    if(multiple.value==="true"){
      if(Array.isArray(CURRENT_FILES)) {
        CURRENT_FILES.push(NewImageFile);
      } else {
        CURRENT_FILES = [NewImageFile];
      }
    }else if (multiple.value==="false"){
      CURRENT_FILES = NewImageFile;
    }
    actions.removeAttribute('hidden');
  }
}

function takeImage(this:HTMLButtonElement,e:Event) {
  const imageFileName = 'image_'.concat(window.crypto.randomUUID()).concat('.webp');
  if(IMAGE_CAPTURE) {
    try {
      IMAGE_CAPTURE.takePhoto()
      .then((blob) => {
        const NewImageFile = new File([blob],imageFileName,{type:'image/webp'});
        handleTakenImage(NewImageFile);
      })
      .catch((error)=>{
        console.error(error);
      })
    } catch (error) {
      console.error(error);
    }
  } else if (MEDIA_STREAM) {
    const canvas = document.createElement('canvas');
    const video = document.getElementById('take-image-video') as HTMLVideoElement|null;
    if (video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video,0,0,video.videoWidth,video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob],imageFileName,{ type:'image/webp' });
            handleTakenImage(file);
          }
        })

      }
    }
  }
  this.blur();
}
/**
 * Close all dialogs on page change to prevent bug - like behavior
 * @param e 
 */
function closeUploadMediaDialogsOnSuccessfulPageChange(e:CustomEvent) {
  const pushURL = e.detail.elt.hasAttribute('hx-push-url');
  if (pushURL && e.detail.successful) {
    closeRecordImageDialog();
    closeRecordVideoDialog();
    closeRecordAudioDialog();
  }
}


/* -------------------------- On Load ------------------------------- */
export function onLoadSetUploadMediaListeners() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    document.addEventListener('htmx:afterRequest',closeUploadMediaDialogsOnSuccessfulPageChange);
    const imageInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-image-input]'));
    const audioInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-audio-input]'));
    const videoInputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"][data-video-input]'));
    imageInputs.forEach((input)=>{
      input.addEventListener('click',handleImageInputClick);
    })
    audioInputs.forEach((input)=>{
      input.addEventListener('click',handleAudioInputClick);
    })
    videoInputs.forEach((input)=>{
      input.addEventListener('click',handleVideoInputClick);   
    })
    /* --- Buttons that Indicate the User wants to upload media, dispatch the default behavior --- */
    const defaultImageBehaviorButton = document.getElementById('show-picker-image') as HTMLInputElement|null;
    const defaultAudioBehaviorButton = document.getElementById('show-picker-audio') as HTMLInputElement|null;
    const defaultVideoBehaviorButton = document.getElementById('show-picker-video') as HTMLInputElement|null;
    if (defaultImageBehaviorButton) defaultImageBehaviorButton.addEventListener('click',dispatchDefaultImageBehavior,true);
    if (defaultAudioBehaviorButton) defaultAudioBehaviorButton.addEventListener('click',dispatchDefaultAudioBehavior,true);
    if (defaultVideoBehaviorButton) defaultVideoBehaviorButton.addEventListener('click',dispatchDefaultVideoBehavior,true);
    
    /* ------------ Buttons that indicate the user wants to take their own video / audio ------------------- */
    const openImageDialogButton = document.getElementById('open-image-dialog');
    const openAudioDialogButton = document.getElementById('open-audio-dialog');
    const openVideoDialogButton = document.getElementById('open-video-dialog');
    if(openImageDialogButton) openImageDialogButton.addEventListener('click',openImageDialog,true);
    if(openAudioDialogButton) openAudioDialogButton.addEventListener('click',openAudioDialog,true); 
    if(openVideoDialogButton) openVideoDialogButton.addEventListener('click',openVideoDialog,true);
    
    /* ------------ Set Listeners in the Dialogs ------------------- */
    const imageDialogObj = getImageDialog();
    const videoDialogObj = getVideoDialog();
    const audioDialogObj = getAudioDialog();
    if(imageDialogObj) {
      const { preview, takeImage:takeImageButton, form, switchCameraButton } = imageDialogObj;
      form.addEventListener('submit',onSubmitImageDialog);
      form.addEventListener('reset',onResetImageDialog);
      preview.addEventListener('click',onPreviewImageDialog);
      takeImageButton.addEventListener('click',takeImage);
      switchCameraButton.addEventListener('click',getSwitchCameraDirection("image"));
    } 
    if (audioDialogObj) {
      const { preview, recordAudio:recordAudioButton, form } = audioDialogObj;
      form.addEventListener('submit',onSubmitAudioDialog);
      form.addEventListener('reset',onResetAudioDialog);
      preview.addEventListener('click',onPreviewAudioDialog);
      recordAudioButton.addEventListener('click',recordAudio);
    } 
    if(videoDialogObj) {
      const { preview, recordVideo:recordVideoButton, form, switchCameraButton } = videoDialogObj;
      form.addEventListener('submit',onSubmitVideoDialog);
      form.addEventListener('reset',onResetVideoDialog);
      preview.addEventListener('click',onPreviewVideoDialog);
      recordVideoButton.addEventListener('click',recordVideo);
      switchCameraButton.addEventListener('click',getSwitchCameraDirection("video"));
    }
  }
}