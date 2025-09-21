import type { Graphics, Text } from 'pixi.js';
import type htmx from 'htmx.org';
import type { getCodeMirrorEditorTextType, unloadCodeEditorsBeforeSwap } from './code-editors';
import type { Socket } from 'socket.io-client';
import type { 
  clearEditorType, 
  convertNodesToMarkdownString, 
  editorToChatMessage, 
  getCommentImplementation, 
  getEditorStateType, 
  onLexicalThemeChange, 
  setEditorStateType, 
  unloadLexicalEditorsBeforeSwap, 
  updateLexicalInstanceWithHtml 
} from './lexical-implementation';
import type { closeRecordImageDialogType, closeRecordAudioDialogType, closeRecordVideoDialogType } from './media-upload/recordMedia';
import type { setGoogleMapsType, removeGoogleMapsType, editGeographyStylesType } from './google-maps';
import type { getCsrfToken } from './shared';
import type { removeCodeMirrorEditor, codeEditorsThemeChange } from './code-editors';
import type { handlePageChangeMediaInputs } from './media-upload';
import type { markdownToHTMLAi } from './ai-chat';


declare global {
  interface Window {
    myCustomProperty: string;
    htmx:typeof htmx|undefined;
    getCodeMirrorEditorText: getCodeMirrorEditorTextType|undefined,
    socket: Socket|undefined,
    commentObserver: IntersectionObserver|undefined,
    annotationObserver: IntersectionObserver|undefined,
    getEditorState: getEditorStateType|undefined,
    setEditorState: setEditorStateType|undefined,
    clearEditor: clearEditorType|undefined,
    getCsrfToken: typeof getCsrfToken|undefined,
    removeCodeMirrorEditor: typeof removeCodeMirrorEditor | undefined,
    closeRecordImageDialog: closeRecordImageDialogType|undefined,
    closeRecordAudioDialog: closeRecordAudioDialogType|undefined,
    closeRecordVideoDialog: closeRecordVideoDialogType|undefined,
    setGoogleMaps: setGoogleMapsType|undefined,
    removeGoogleMaps: removeGoogleMapsType|undefined,
    editGeographyStyles: editGeographyStylesType|undefined,
    codeEditorsThemeChange: typeof codeEditorsThemeChange|undefined,
    handlePageChangeMediaInputs: typeof handlePageChangeMediaInputs|undefined,
    onLexicalThemeChange: typeof onLexicalThemeChange|undefined,
    unloadLexicalEditorsBeforeSwap: typeof unloadLexicalEditorsBeforeSwap|undefined,
    unloadCodeEditorsBeforeSwap: typeof unloadCodeEditorsBeforeSwap|undefined,
    tableOfContentsObserver: IntersectionObserver|undefined,
    getCommentImplementation: typeof getCommentImplementation|undefined,
    editorToChatMessage: typeof editorToChatMessage|undefined,
    updateLexicalInstanceWithHtml: typeof updateLexicalInstanceWithHtml|undefined,
    markdownToHTMLAi: typeof markdownToHTMLAi|undefined,
    convertNodesToMarkdownString: typeof convertNodesToMarkdownString|undefined,
    THREE: any|undefined 
  }
}


/*------------------------ Custom Events --------------------------- */ 
// Define an interface for the event data
export interface NEW_CONTENT_LOADED_CED {
  el: HTMLElement|undefined;
}
export interface tabChange_CED {
  from: number, 
  to: number, 
  wrapper: HTMLDivElement
}
export type VALID_CURRENT_MODES = "circle"|"ellipse"|"line"|"path"|"polygon"|"polyline"|"text"|"manipulate"|"rectangle";
export interface new_element_added_CED {
  type: VALID_CURRENT_MODES, 
  shape:  Graphics|Text
}
export interface lexical_state_registered_CED {
  id: string
}
export interface media_upload_complete_CED {
  upload: { url: string, height?:number, width?: number}[];
}
export interface nav_media_CED {
  detail: 'next'|'back'
}
export interface delete_image_CED {
  inputName: string 
}
export interface HIDE_OPEN_POPOVER_CED {
  str: string
}
export interface OPEN_DIALOG_CED {
  dialog: HTMLDivElement, 
  loading?: boolean, 
  text?: string,
  payload?: any
}
export interface CLOSE_DIALOG_CED {
  dialog: HTMLDivElement
}
export interface OPEN_LEXICAL_DIALOG_CED {
  dialogID: string
}
export interface CLOSE_LEXICAL_DIALOG_CED {
  dialog: HTMLDivElement
}

export type REGISTER_LEXICAL_CODE_EDITOR_CED = HTMLElement;

export interface GET_CODEMIRROR_TEXT_CED {
  id: string
}
export type GET_LEXICAL_EDITORS_CODE_CED = undefined;

export type INSERT_LEXICAL_CODE_EDITORS_CED = HTMLElement;

export type REMOVE_LEXICAL_CODE_EDITORS_CED = undefined;

export interface GOT_LEXICAL_EDITORS_CODE_CED {
  html: string
}
export interface GOT_CODEMIRROR_TEXT_CED {
  code: string
}
export interface GOT_CODEMIRROR_TEXT_CED {
  selem: string
}
export interface CHANGE_CODEMIRROR_LANGUAGE_CED {
  id: string,
  language: string
}
export interface DISPATCH_SNACKBAR_CED {
  severity: 'error'|'warning'|'success'|'info', 
  message: string, 
  svg?: string 
}
export interface OPEN_SNACKBAR_CED {
  selem: string
}
export interface FULLSCREEN_CHANGE_CED {
  fullscreen: boolean,
  el: HTMLElement
}

/*--------------------- Types ---------------------------- */ 
export type AVAILABLE_TIME_ZONE = "Pacific/Niue"|"Pacific/Pago_Pago"|"Pacific/Honolulu"|"Pacific/Rarotonga"|"Pacific/Tahiti"|"America/Anchorage"|"America/Juneau"|"America/Nome"|"America/Sitka"|"America/Yakutat"|"America/Los_Angeles"|"America/Tijuana"|"America/Vancouver"|"America/Los_Angeles"|"America/Tijuana"|"America/Vancouver"|"America/Creston"|"America/Dawson"|"America/Dawson_Creek"|"America/Hermosillo"|"America/Phoenix"|"America/Whitehorse"|"America/Chihuahua"|"America/Mazatlan"|"America/Boise"|"America/Cambridge_Bay"|"America/Denver"|"America/Edmonton"|"America/Inuvik"|"America/Ojinaga"|"America/Yellowknife"|"America/Belize"|"America/Costa_Rica"|"America/El_Salvador"|"America/Guatemala"|"America/Managua"|"America/Tegucigalpa"|"Pacific/Galapagos"|"America/Chicago"|"America/Indiana/Knox"|"America/Indiana/Tell_City"|"America/Matamoros"|"America/Menominee"|"America/North_Dakota/Beulah"|"America/North_Dakota/Center"|"America/North_Dakota/New_Salem"|"America/Rainy_River"|"America/Rankin_Inlet"|"America/Resolute"|"America/Winnipeg"|"America/Bahia_Banderas"|"America/Cancun"|"America/Merida"|"America/Mexico_City"|"America/Monterrey"|"America/Regina"|"America/Swift_Current"|"America/Bogota"|"America/Eirunepe"|"America/Guayaquil"|"America/Jamaica"|"America/Lima"|"America/Panama"|"America/Rio_Branco"|"America/Detroit"|"America/Havana"|"America/Indiana/Petersburg"|"America/Indiana/Vincennes"|"America/Indiana/Winamac"|"America/Iqaluit"|"America/Kentucky/Monticello"|"America/Nassau"|"America/New_York"|"America/Nipigon"|"America/Pangnirtung"|"America/Port-au-Prince"|"America/Thunder_Bay"|"America/Toronto"|"America/Detroit"|"America/Havana"|"America/Indiana/Petersburg"|"America/Indiana/Vincennes"|"America/Indiana/Winamac"|"America/Iqaluit"|"America/Kentucky/Monticello"|"America/Nassau"|"America/New_York"|"America/Nipigon"|"America/Pangnirtung"|"America/Port-au-Prince"|"America/Thunder_Bay"|"America/Toronto"|"America/Indiana/Marengo"|"America/Indiana/Vevay"|"America/Asuncion"|"America/Campo_Grande"|"America/Cuiaba"|"America/Barbados"|"America/Blanc-Sablon"|"America/Boa_Vista"|"America/Curacao"|"America/Grand_Turk"|"America/Guyana"|"America/La_Paz"|"America/Manaus"|"America/Martinique"|"America/Port_of_Spain"|"America/Porto_Velho"|"America/Puerto_Rico"|"America/Santo_Domingo"|"America/Santiago"|"Antarctica/Palmer"|"Australia/Brisbane"|"Australia/Lindeman"|"Australia/Melbourne"|"Australia/Sydney"|"Antarctica/DumontDUrville"|"Pacific/Guam"|"Pacific/Port_Moresby"|"Australia/Currie"|"Australia/Hobart";
export type NotificationType = {
  badge: string,
  body: string,
  data: {},
  dir: 'ltr',
  renotify: boolean,
  requireInteraction: boolean,
  silent: boolean,
  timestamp: number,
  title: string,
  tag: string
}
export interface NotificationOptions {
  actions?: [],
  badge?: string,
  body?: string,
  data?: object,
  icon?: string,
  image?: string,
  renotify: false,
  requireInteraction: false,
  silent: false,
  tag?: string
}

export interface FrankmBrownNotification {
  html: string;
  id: number;
  title: string;
  notificationOptions: NotificationOptions;
}
export type DocOrEl = Document|HTMLElement;