// Modules
import {computePosition,flip,shift,offset,autoUpdate} from "@floating-ui/dom";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import htmx from 'htmx.org';
import Splide from '@splidejs/splide';
import type { Workbox, WorkboxMessageEvent } from "workbox-window";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage  } from "firebase/messaging";
import { io, Socket } from 'socket.io-client';

// Custom
import { AVAILABLE_TIME_ZONE, CLOSE_LEXICAL_DIALOG_CED, DISPATCH_SNACKBAR_CED, DocOrEl, FrankmBrownNotification, FULLSCREEN_CHANGE_CED, NEW_CONTENT_LOADED_CED, NotificationType, OPEN_DIALOG_CED, OPEN_LEXICAL_DIALOG_CED, OPEN_SNACKBAR_CED } from ".";
import { TIME_ZONES_AVAILABLE } from "./CONSTANTS";
import { onCodeLoad } from "./personal-website/code";
import detectSinglePageApplicationDesktop, { detectSpaMobile } from './singlePageApplication';
import { onKatexLoad } from "./personal-website/math";
import * as custom from "./custom";
import { setSocialMediaShareButtons } from "./social-media";
import { markdownToHTMLAi } from "./ai-chat";

dayjs.extend(utc);
dayjs.extend(timezone);
/**
 * Keep Track of whether this is the current tab
 */
var IS_CURRENT_TAB = true;
const INITIAL_TIME_ZONE:AVAILABLE_TIME_ZONE = guessTimeZone();
/**
 * Class to add to body when dialog is open **UNLESS** you want to enable scrolling
 * while the dialog is open.
 */
const dialogOpenBodyClass = "dialog-open";
/**
 * @type {boolean} Tells you whether the current page has any google maps on it
 */
var PAGE_HAS_MAPS = false;
/**
 * Variable to keep track of whether or not the current page has any lexical rich text editors
 * @type {boolean}
 */
var PAGE_HAS_EDITORS = false;
/**
 * Set of pathname strings. Prevent the page from being stored in local storage 
 * @type {Set<string>}
 */
const MAPS_PAGES_SET = new Set<string>([]);
var INTENTIONAL_NAV_BACK_FORWARD = false;
var BACKWARDS_NAVIGATE = false;
const historyURLs:string[] = [];
var CURRENT_HISTORY_INDEX = -1;
var SCROLL_Y = 0;
var wb: Workbox|undefined;
const EMPTY_NOTIFICATIONS_HTML = '<div class="h5 t-warning text-align-center mt-2 bold">No Notifications to Show</div>'
var socket: undefined|Socket = undefined;
var NOTIFICATIONS_TIMEOUT:NodeJS.Timeout|undefined = undefined;
const ONE_MINUTE = 60*1000;
const UPLOAD_MEDIA_DIALOGS_IDS = new Set(['upload-image-dialog','upload-audio-dialog','upload-video-dialog'] as const);
/**
 * @type {undefined|{name: string, timeout: number}}
 */
var rangeAutoBlur:undefined|{name: string|null, timeout: NodeJS.Timeout};
/**
 * @type {NodeJS.Timeout}
 */
var changeDebouncer: undefined|NodeJS.Timeout;
/**
 * @type {NodeJS.Timeout}
 */
var formDebouncer: undefined|NodeJS.Timeout;

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCPmzS434BPMQHnFnEPqQ5IP1qWV7tmj4w",
  authDomain: "personal-website-6ec90.firebaseapp.com",
  projectId: "personal-website-6ec90",
  storageBucket: "personal-website-6ec90.firebasestorage.app",
  messagingSenderId: "299346210453",
  appId: "1:299346210453:web:3aa9d4c63769e41488f59c"
};
// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
// Initialize Firebase Cloud Messaging and get a reference to the service
const messaging = getMessaging(app);



window.htmx = htmx;
htmx.config.historyEnabled=true;
htmx.config.historyCacheSize=10;
htmx.config.refreshOnHistoryMiss=false;
htmx.config.defaultSwapStyle="innerHTML";
htmx.config.defaultSwapDelay=0;
htmx.config.defaultSettleDelay=20;
htmx.config.includeIndicatorStyles=false;
htmx.config.indicatorClass="htmx-indicator";
htmx.config.requestClass="htmx-request";
htmx.config.addedClass="htmx-added";
htmx.config.settlingClass="htmx-settling";
htmx.config.swappingClass="htmx-swapping";
htmx.config.allowEval=true;
htmx.config.allowScriptTags=true;
htmx.config.inlineScriptNonce="";
htmx.config.attributesToSettle=["class","style","width","height"];
htmx.config.withCredentials=true;
htmx.config.timeout=0;
htmx.config.wsReconnectDelay="full-jitter";
htmx.config.wsBinaryType="blob";
htmx.config.disableSelector="[hx-disable], [data-hx-disable]";
htmx.config.scrollBehavior="smooth";
htmx.config.defaultFocusScroll=false;
htmx.config.getCacheBusterParam=true;
htmx.config.globalViewTransitions=false;
htmx.config.methodsThatUseUrlParams=["get"];
htmx.config.selfRequestsOnly=false;

// [htmx Head Tag Support Extension](https://htmx.org/extensions/head-support/)
/* @ts-ignore */
!function(){var e=null;function t(){}function r(r,a){if(r&&r.indexOf("<head")>-1){let n=document.createElement("html");var d=r.replace(/<svg(\s[^>]*>|>)([\s\S]*?)<\/svg>/gim,"").match(/(<head(\s[^>]*>|>)([\s\S]*?)<\/head>)/im);if(d){var i=[],o=[],h=[],l=[];n.innerHTML=d;var u=n.querySelector("head"),m=document.head;if(null==u)return;var g=new Map;for(let s of u.children)g.set(s.outerHTML,s);var v=e.getAttributeValue(u,"hx-head")||a;for(let f of m.children){var p=g.has(f.outerHTML),c="re-eval"===f.getAttribute("hx-head"),x="true"===e.getAttributeValue(f,"hx-preserve");p||x?c?o.push(f):(g.delete(f.outerHTML),h.push(f)):"append"===v?c&&(o.push(f),l.push(f)):!1!==e.triggerEvent(document.body,"htmx:removingHeadElement",{headElement:f})&&o.push(f)}for(let E of(l.push(...g.values()),t("to append: ",l),l)){t("adding: ",E);var b=document.createRange().createContextualFragment(E.outerHTML);t(b),!1!==e.triggerEvent(document.body,"htmx:addingHeadElement",{headElement:b})&&(m.appendChild(b),i.push(b))}for(let H of o)!1!==e.triggerEvent(document.body,"htmx:removingHeadElement",{headElement:H})&&m.removeChild(H);e.triggerEvent(document.body,"htmx:afterHeadMerge",{added:i,kept:h,removed:o})}}}htmx.defineExtension("head-support",{init:function(t){e=t,htmx.on("htmx:afterSwap",function(t){var a=t.detail.xhr?.response;e.triggerEvent(document.body,"htmx:beforeHeadMerge",t.detail)&&r(a,t.detail.boosted?"merge":"append")}),htmx.on("htmx:historyRestore",function(t){e.triggerEvent(document.body,"htmx:beforeHeadMerge",t.detail)&&(t.detail.cacheMiss?r(t.detail.serverResponse,"merge"):r(t.detail.item.head,"merge"))}),htmx.on("htmx:historyItemCreated",function(e){e.detail.item.head=document.head.outerHTML})}})}();



/* ------------------------------- SECTION: HELPERS ------------------------------------ */ 
/**
 * Membership test for typescript
 * @param item 
 * @param set 
 * @returns 
 */
function isMemberOf<Type>(item:any,set:Set<Type>): item is Type {
  return set.has(item);
}
/**
 * Guess the time zone
 */
function guessTimeZone() {
  const GUESS = dayjs.tz.guess()
  return isMemberOf(GUESS,new Set(TIME_ZONES_AVAILABLE)) ? GUESS:"America/New_York";
}
/**
 * Check to see if ip_id exists
 * @returns 
 */
function checkIpIdExists() {
  const ip_id = <HTMLInputElement|null>document.getElementById('ip_id');
  return Boolean(ip_id&&Number.isInteger(parseInt(ip_id.value))&&parseInt(ip_id.value)>0);
}
/**
 * Tests whether the device is an IOS device. If the device is an ios device, 
 */
export function isIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
/**
 * Generate a random string of a given length, **"length"**, with only
 * the characters in **"chars"** input in the returned string
 */
function randomString(
  length:number,
  chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
) {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
const notNullOrEmptyString = (val:any):val is string => Boolean(val !== "" && val !== null);
/**
 * Used for drag and drop to scroll window up adn down
 */
export function scrollUp(n:number=20) {
  window.scroll(0,window.scrollY+n);
}
/**
 * Used for drag and drop to scroll window up adn down
 */
export function scrollDown(n:number=20) {
  window.scroll(0,window.scrollY-n);
}
/**
 * 
 * @param {HTMLElement} el 
 */
export function getClosestDialogOrBody(el:HTMLElement) {
  const dialog = el.closest<HTMLDivElement>('div.dialog');
  const closestSelectMenu = el.closest<HTMLDivElement>('div.select-menu');
  if (dialog) return dialog;
  else if (closestSelectMenu) return closestSelectMenu;
  else {
    const body = document.querySelector<HTMLBodyElement>('body');
    if (body) return body;
    else return null;
  }
}
/**
 * Wait an amount of ms (**num**)
 */
export const delay = async (num:number) => {
  return new Promise((resolve,_)=> {
    setTimeout(() => {
      resolve(true);
    },num);
  })
}
export function getCsrfToken() {
  const csrf = document.getElementById('csrf_token') as HTMLInputElement|null;
  if (csrf) return csrf.value;
  else return 'csrf-not-found';
}
window.getCsrfToken = getCsrfToken;
function setWindowBlur() {
  IS_CURRENT_TAB = false;
}
function setWindowFocus() {
  IS_CURRENT_TAB = true;
}
/**
 * Disable zoom by changing the `<meta name="viewport" />` tag to have a maximum-scale of 1
 * Zoom should be disabled when dialogs are opened that are not image dialogs and when inputs or contenteditables are focused on mobile
 */
export function disableZoom() {
  const DISABLED_ZOOM_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover';
  const viewport = document.querySelector('meta[name="viewport"]');
  if(viewport&&viewport.getAttribute('content')!==DISABLED_ZOOM_CONTENT) viewport.setAttribute('content',DISABLED_ZOOM_CONTENT);
}
/**
 * Enable zoom by changing the `<meta name="viewport" />` tag
 *  Zoom should be enabled when dialogs (that are not image dialogs) are closed and when inputs or contenteditables are not focused on mobile
 */
export function enableZoom() {
  const ENABLED_ZOOM_CONTENT = 'width=device-width, initial-scale=1.0, maximum-scale=5, viewport-fit=cover';
  const viewport = document.querySelector('meta[name="viewport"]');
  if(viewport&&!!!isIOS()&&viewport.getAttribute('content')!==ENABLED_ZOOM_CONTENT) viewport.setAttribute('content',ENABLED_ZOOM_CONTENT);
}

/* ------------------------------------------- SECTION: LAZY LOADING ----------------------------------------------------- */
var LOADED_GOOGLE_MAPS = false;
const loadModuleGoogleMaps = () => import('./google-maps');
var LOADED_LEXICAL = false;
const loadModuleLexical = () => import('./lexical-implementation')
var LOADED_MEDIA = false;
const loadModuleMediaUpload = () => import('./media-upload')
var LOADED_DRAG_DROP = false;
const loadModuleDragDrop = () => import('./drag-and-drop')
var LOADED_CODE_EDITOR = false;
const loadModuleCodeEditors = () => import('./code-editors')
var LOADED_WARN_USERS_NAVIGATE = false;
const loadModuleWarnUsersNavigate = () => import('./warn-users-navigate-away')
var LOADED_ARTICLE_BUILDER = false;
const loadModuleArticleBuilder = () => import( './article-builder')
var LOADED_CREATE_SURVEY = false;
const loadModuleCreateSurvey = () => import('./create-survey')
var LOADED_HTML_JAVASCIPT = false;
const loadModuleHTMLToJavascript = () => import('./html-to-javascript')
var LOADED_CREATE_SVG = false;
const loadModuleCreateSvg = () => import( './create-svg')
var LOADED_CREATE_GRADIENT = false;
const loadModuleCreateGradient = () => import( './create-gradient')
var LOADED_CSS_SPRITE = false;
const loadModuleCssSpriteBuilder = () => import('./css-sprite-builder')
var LOADED_MARKDOWN = false;
const loadModuleMarkdown = () => import('./personal-website/markdown')
var LOADED_THREE = false;
const loadModuleThreeJs = () => import( './three-js-test')
var LOADED_ARTICLE_BUILDER_3 = false;
const loadModuleArticleBuilder3 = () => import( './article-builder-3');
var LOADED_ARTICLE_BUILDER = false;
const loadArticleBuilder = () => import( './article-builder-final');
var LOADED_CHAT = false;
const loadChat = () => import('./chat');
var LOADED_TESTING_SELECT = false;
const loadSelect = () => import('./testing-select-implementations');
var LOADED_AI_CHAT_PAGE = false;
const loadAiChat = () => import('./ai-chat-page');
var LOADED_COLAB_CLONE = false;
const loadColabClone = () => import('./google-colab-clone');
const LOADED_RECOMMENDATION_SYSTEM = false;
const loadRecommendationSystem = () => import('./recommendation-systems');
const LOADED_FILTERING_SORTING = false;
const loadFilteringSorting = () => import('./filtering-sorting');
const LOADED_SURVEY_RESPONSE = false;
const loadSurveyResponse = () => import('./survey-response');



/* ------------------------------------------- SECTION: HISTORY ----------------------------------------------------- */
/**
 * Keeping track of history
 * @param forward 
 * @param newURL 
 * @param intentionalForwardBack 
 */
function updateHistory(forward:boolean,newURL:string,intentionalForwardBack:boolean) {
  historyURLs.push(newURL);
  if (!!!forward) {
    CURRENT_HISTORY_INDEX = Math.max(0,CURRENT_HISTORY_INDEX-1);
  } else {
    if (intentionalForwardBack) {
      CURRENT_HISTORY_INDEX = Math.min(historyURLs.length-1,CURRENT_HISTORY_INDEX+2);
    } else {
      CURRENT_HISTORY_INDEX = historyURLs.length-1;
    }
  }
}
function handleNavigateBack(e:(PopStateEvent|Event|MouseEvent|TouchEvent)) {
  if(e.type.toLowerCase()==="popstate") {
    e.preventDefault(); 
    e.stopPropagation();
  }
  if (CURRENT_HISTORY_INDEX>0) {
    const url = historyURLs[CURRENT_HISTORY_INDEX-1];
    const main = document.querySelector('main#PAGE');
    const el = document.createElement('div');
    el.setAttribute('hx-get',url);
    el.setAttribute('hx-target','#PAGE');
    el.setAttribute('hx-push-url','true');
    el.setAttribute('hx-indicator','#page-transition-progress');
    el.setAttribute('hx-trigger','click');
    if (main) {
      main.append(el);
      htmx.process(el);
      BACKWARDS_NAVIGATE = true;
      INTENTIONAL_NAV_BACK_FORWARD = true;
      htmx.trigger(el,'click',{});
      return;
    }
  }
}
function handleNavigateForward(e:Event) {
  if(e.type.toLowerCase()==="popstate") {
    e.preventDefault(); 
    e.stopPropagation();
  }
  if (CURRENT_HISTORY_INDEX<historyURLs.length-1) {
    const url = historyURLs[CURRENT_HISTORY_INDEX+1];
    const main = document.querySelector('main#PAGE');
    const el = document.createElement('div');
    el.setAttribute('hx-get',url);
    el.setAttribute('hx-target','#PAGE');
    el.setAttribute('hx-push-url','true');
    el.setAttribute('hx-indicator','#page-transition-progress');
    el.setAttribute('hx-trigger','click');
    if (main) {
      main.append(el);
      htmx.process(el);
      INTENTIONAL_NAV_BACK_FORWARD = true;
      htmx.trigger(el,'click',{});
      return;
    }
  }
  window.location.reload();
  return;
}
function handlePopState(e:PopStateEvent) {
  const target = window.location.href;
  const currentLocation = window.location.href.slice(0,window.location.href.indexOf('#'));
  const IS_HASH_NAVIGATION = Boolean(target.replace(currentLocation,'')?.startsWith('#'));
  if (IS_HASH_NAVIGATION) {
    e.preventDefault(); 
    e.stopPropagation();
  } else {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    handleNavigateBack(e);
  }
}
function setNavigateBackButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll('button[data-nav-back]')).forEach((btn)=>{
    if (btn.hasAttribute('data-mouse'))btn.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleNavigateBack)
    else btn.addEventListener('click',handleNavigateBack)
  });
}
function setNavigateForwardButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll('button[data-nav-forward]')).forEach((btn)=>{
    if (btn.hasAttribute('data-mouse'))btn.addEventListener(isTouchDevice()?'touchstart':'mousedown',handleNavigateForward)
    else btn.addEventListener('click',handleNavigateForward)
  })
}
function handleNavigateHistoryButtons(docOrEl:DocOrEl) {
  setNavigateBackButtons(docOrEl);
  setNavigateForwardButtons(docOrEl);
}

/* ---------------------------- SECTION: INTERSECTION OBSERVERS ---------------------- */
const VIEWED_COMMENTS = new Set<number>();
const INTERSECTION_OBSERVER_OPTIONS_COMMENTS = {
  root: null,
  rootMargin: '40px 0px 0px 0px',
  threshold: [0]
};
function viewCommentsCallback(entries:IntersectionObserverEntry[]) {
  const commentIDs:number[] = [];
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.intersectionRatio>0) {
        if (entry.target.nodeName==="DIV") {
          const commentID = entry.target.getAttribute('data-comment-id');
          if (commentID&&Number.isInteger(parseInt(commentID))&&!!!VIEWED_COMMENTS.has(parseInt(commentID))) {
            commentIDs.push(parseInt(commentID));
            VIEWED_COMMENTS.add(parseInt(commentID));
          }
        }
      }
    }
  })
  if (commentIDs.length) {
    const formData = new FormData();
    formData.append("comment-ids",JSON.stringify(commentIDs));
    formData.append("X-CSRF-Token",getCsrfToken());
    navigator.sendBeacon('/analytics/view-comments',formData);
  }
}
window.commentObserver = new IntersectionObserver(viewCommentsCallback,INTERSECTION_OBSERVER_OPTIONS_COMMENTS);
const VIEWED_ANNOTATIONS = new Set<number>();
const INTERSECTION_OBSERVER_OPTIONS_ANNOTATIONS = {
  root: null,
  rootMargin: '40px 0px 0px 0px',
  threshold: [0]
};
function viewAnnotationsCallback(entries:IntersectionObserverEntry[]) {
  const annotationIDs:number[] = [];
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.intersectionRatio>0) {
        if (entry.target.nodeName==="DIV") {
          const annotationID = entry.target.getAttribute('data-annotation-id');
          if (annotationID&&Number.isInteger(parseInt(annotationID))&&!!!VIEWED_ANNOTATIONS.has(parseInt(annotationID))) {
            annotationIDs.push(parseInt(annotationID));
            VIEWED_ANNOTATIONS.add(parseInt(annotationID));
          }
        }
      }
    }
  })
  if (annotationIDs.length) {
    const formData = new FormData();
    formData.append("annotation-ids",JSON.stringify(annotationIDs));
    formData.append("X-CSRF-Token",getCsrfToken());
    navigator.sendBeacon('/analytics/view-annotations',formData);
  }
}
window.annotationObserver = new IntersectionObserver(viewAnnotationsCallback,INTERSECTION_OBSERVER_OPTIONS_ANNOTATIONS);

const INTERSECTION_OBSERVER_OPTIONS_CONTENTS = {
  root: null,
  rootMargin: '40px 0px 0px 0px',
  threshold: [0]
};
/**
 * Callback function for intersection observer
 */
function tableOfContentsIntersectionCallback(entries:IntersectionObserverEntry[]) {
  var id = '';
  const TABLE_OF_CONTENTS = document.getElementById(`TABLE_OF_CONTENTS`) as HTMLElement|null;
  if (TABLE_OF_CONTENTS) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        id = entry.target.id;
      }
    })
    const anchorTags = Array.from(TABLE_OF_CONTENTS.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    anchorTags.forEach((el) => {
      const idRef = String(el.getAttribute('href')).slice(1);
      if (id===idRef&&!!!el.classList.contains('current')) el.classList.add('current');
      else if (el.classList.contains('current')&&id) el.classList.remove('current');
    })
  }
}
const TABLE_OF_CONTENTS_INTERSECTION_OBSERVER = new IntersectionObserver(tableOfContentsIntersectionCallback,INTERSECTION_OBSERVER_OPTIONS_CONTENTS);
/**
 * Should be called on initial page load and when a new page is loaded (or new subpage)
 * Sets the intersection observer listeners for the table of contents
 */
function setIntersectionObserverTableOfContents() {
  const TABLE_OF_CONTENTS_WRAPPER = document.getElementById('TABLE_OF_CONTENTS') as HTMLElement|null;
  if (TABLE_OF_CONTENTS_WRAPPER) {
    const links = Array.from(TABLE_OF_CONTENTS_WRAPPER.querySelectorAll('a[href^="#"]'));
    links.forEach((anchorEl) => {
      const href = anchorEl.getAttribute('href');
      if (href) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) TABLE_OF_CONTENTS_INTERSECTION_OBSERVER.observe(el);
      }
    })
  }
}
window.tableOfContentsObserver = TABLE_OF_CONTENTS_INTERSECTION_OBSERVER;

function createTableOfContentsItem(id:string,innerText:string) {
  const a = document.createElement('a');
  a.href = "#".concat(id);
  a.className="button icon-text medium transparent toc";
  a.setAttribute('data-close-drawer','');
  a.style.cssText="max-width: 100%;";
  const span = document.createElement('span');
  span.style.cssText="max-width: none;";
  span.innerText=innerText;
  a.append(span);
  return a;
}

function updateTableOfContents() {
  const new_table_of_contents:HTMLAnchorElement[] = [];
  const page = document.getElementById('PAGE') as HTMLElement|null;
  const table_of_contents = document.getElementById('TABLE_OF_CONTENTS');
  if (page&&table_of_contents) {
    const same_page_links = Array.from(page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    for (let link of same_page_links) {
      const id = link.getAttribute('href')?.slice(1);
      const linked_el = document.getElementById(String(id));
      if (linked_el) {
        const innerText = link.innerText.trim().replace(/\s+/g,' ');
        if (innerText.length) {
          new_table_of_contents.push(createTableOfContentsItem(String(id),innerText));
        }
      }
    }
    if (new_table_of_contents.length) {
      const ul = document.createElement('ul');
      ul.className="none no-scrollbar";
      ul.style.cssText = "max-height: var(--max-width-toc); overflow-y: auto; max-height: 250px; scrollbar-width: none;";
      for (let toc of new_table_of_contents) {
        const li = document.createElement('li');
        li.append(toc);
        ul.append(li);
      }
      table_of_contents.innerHTML="";
      table_of_contents.append(ul);
    } else {
      table_of_contents.innerHTML="";
      table_of_contents.insertAdjacentHTML("afterbegin",`<div class="h6 bold text-align-center mt-2" id="TABLE_OF_CONTENTS" hx-swap-oob="outerHTML">No Table of Contents Items</div>`);
    }
    document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: table_of_contents }}));
    setIntersectionObserverTableOfContents();
  }
}

/* ------------------------------------ SECTION: DIALOGS --------------------------------- */
function hideShowFab(hide:boolean) {
  const speedDial = document.getElementById('speed-dial-main');
  const speedDialActions = document.getElementById('speed-dial-main-actions');
  if (hide) {
    speedDial?.setAttribute('hidden','');
    speedDialActions?.setAttribute('hidden','');
  } else {
    speedDial?.removeAttribute('hidden');
    speedDialActions?.removeAttribute('hidden');
  }
}
function updateMenuBar(secondaryBackground:boolean=false) {
  const html = document.querySelector('html');
  var color = '#000000';
  if (html&&html.getAttribute('data-mode')==="light") {
    const dialogColorInput = document.getElementById(secondaryBackground?'secondaryBackground-light-settings-color':'navbarColor-light-settings-color') as HTMLInputElement;
    if (dialogColorInput) color = dialogColorInput.value;
  } else {
    const dialogColorInput = document.getElementById(secondaryBackground?'secondaryBackground-dark-settings-color':'navbarColor-dark-settings-color') as HTMLInputElement;
    if (dialogColorInput) color = dialogColorInput.value;
  }
  const meta1 = document.getElementById('THEME_COLOR');
  const meta2 = document.getElementById('THEME_COLOR_2');
  const meta3 = document.getElementById('THEME_COLOR_3');
  if(color&&meta1&&meta2&&meta3){
    meta1.setAttribute('content',color);
    meta2.setAttribute('content',color);
    meta3.setAttribute('content',color);
  }
}
const LEXICAL_DIALOG_IDS = new Set([
  "math-markup-lexical",
  "lex-embed-news",
  "lex-embed-youtube",
  "lex-embed-tiktok",
  "lex-embed-twitter",
  "lex-embed-instagram",
  "details-content-lexical",
  "tables-lexical",
  "horizontal-rule-lexical",
  "view-content-lexical",
  "lexical-block-edit-dialog",
  "lexical-table-cell-bg",
  "edit-table-lexical",
  "lex-upload-file-dialog",
  "lex-insert-custom-html",
  "image-bg-color-dialog",
  "column-layout-lexical",
  "coding-lang-lexical",
  "insert-previous-lexical"
]);
export function closeDialog(dialog:HTMLDivElement) {
  hideShowFab(false);
  if (!!!dialog.hasAttribute('hidden')) {
    const id=dialog.id;
    if (id==='loading-dialog') {
      const indicator = dialog.querySelector<HTMLDivElement>('div[data-indicator]');
      if (indicator) indicator.setAttribute('aria-busy','false');
    } else if (isMemberOf(id,UPLOAD_MEDIA_DIALOGS_IDS)){
      if (id==="upload-image-dialog"&&window.closeRecordImageDialog) window.closeRecordImageDialog()
      else if (id==="upload-audio-dialog"&&window.closeRecordAudioDialog) window.closeRecordAudioDialog()
      else if (id==="upload-video-dialog"&&window.closeRecordVideoDialog) window.closeRecordVideoDialog();  
    } 
    if(id!=='image-dialog') {
      enableZoom();
    }
    if (dialog.classList.contains('whole')) {
      updateMenuBar();
    }
    document.body.classList.remove(dialogOpenBodyClass);
    window.scrollTo({ top: SCROLL_Y, left: 0, behavior: 'auto' });
    dialog.setAttribute('hidden','');
    dialog.style.setProperty('display','none');
    dialog.style.removeProperty('z-index');
    if (dialog.hasAttribute('data-z-index')) dialog.removeAttribute('data-z-index');
    const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper:not([hidden])'))
    openDialogs.forEach((openDialogEl) => {
      if (openDialogEl.hasAttribute('data-z-index')) {
        const currZIndex = openDialogEl.getAttribute('data-z-index');
        if (Number.isInteger(parseInt(String(currZIndex)))) {
          openDialogEl.setAttribute('data-z-index',`${parseInt(String(currZIndex))})`);
          openDialogEl.style.setProperty('z-index',`calc(var(--dialog-z-index) + ${parseInt(String(currZIndex))-1})`);
        }
      }
    })
    if (dialog.hasAttribute('data-remove-close')) {
      dialog.remove();
    }
    if (LEXICAL_DIALOG_IDS.has(dialog.id)) {
      document.dispatchEvent(new CustomEvent<CLOSE_LEXICAL_DIALOG_CED>("CLOSE_LEXICAL_DIALOG",{ detail: { dialog }}));
    }
    setTimeout(() => {
      setPreventNavbarModification(false);
    },50);
  }
}

export function openDialog(dialog:HTMLDivElement,payload?:any) {
  hideShowFab(true);
  setPreventNavbarModification(true);
  if (dialog.hasAttribute('hidden')) {
    const openDialogs = Array.from(document.querySelectorAll('div.dialog-wrapper:not([hidden])')).length;

    SCROLL_Y = window.scrollY;
    document.body.classList.add(dialogOpenBodyClass);
    if(dialog.id!=='image-dialog') disableZoom();
    if (openDialogs>0) {
      dialog.style.setProperty('z-index',`calc(var(--dialog-z-index) + ${openDialogs})`);
      dialog.setAttribute('data-z-index',String(openDialogs));
    }
    var autoFocusEl:null|HTMLElement = null;
    const autofocus = dialog.querySelector<HTMLElement>('input[autofocus]');
    if (autofocus) autoFocusEl = autofocus;
    dialog.removeAttribute('hidden');
    dialog.style.removeProperty('display');
    if (autoFocusEl) autoFocusEl.focus();
    if (dialog.classList.contains('whole')) {
      updateMenuBar(true);
    }
    if (dialog.id==="ai-chat-dialog") {
      const body = document.getElementById('ai-chat-body');
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    }
  }
}
function openDialogCustom(e:CustomEvent) {
  if (e&&e.detail&&e.detail.dialog&&e.detail.dialog.nodeName==="DIV") {
    if (LEXICAL_DIALOG_IDS.has(e.detail.dialog.id)) {
      document.dispatchEvent(new CustomEvent<OPEN_LEXICAL_DIALOG_CED>('OPEN_LEXICAL_DIALOG',{detail: { dialogID: e.detail.dialog.id }}));
    } else if (e.detail.loading===true&&typeof e.detail.text==="string") {
      openLoadingDialog(e.detail.dialog,e.detail.text);
    } else {
      openDialog(e.detail.dialog,e.detail.payload);
    }   
  }    
}
function openDialogFinal(e:CustomEvent) {
  openDialog(e.detail.dialog);
}
function closeDialogCustom(e:CustomEvent) {
  if (e&&e.detail&&e.detail.dialog&&e.detail.dialog.nodeName==="DIV") {
    closeDialog(e.detail.dialog);
  }
}
export function getAndOpenLoadingDialog(text:string) {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog) {
    openLoadingDialog(dialog,text);
  }
}
export function closeLoadingDialog() {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog) {
    closeDialog(dialog);
  }
}
/**
 * Custom function for opening full page dialog to alllow for some customization
 * @param dialog 
 * @param text 
 */
export function openLoadingDialog(dialog:HTMLDivElement,text:string|null) {
  const indicator = dialog.querySelector<HTMLDivElement>('div[data-indicator]');
  if (indicator) indicator.setAttribute('aria-busy','true');
  const textEl = dialog.querySelector<HTMLParagraphElement>('p[data-text]');
  if (textEl&&text) textEl.innerText = text;
  openDialog(dialog);
}
/**
 * Show dialog whenever corresponding button element is clicked
 * @param {Event} _e Click event on a button element
 * @this {HTMLButtonElement}
 */
function openDialogOnButtonClick(this:HTMLElement,_e: Event) {
  const DIALOG_ID = this.getAttribute("data-dialog");
  if (DIALOG_ID&&LEXICAL_DIALOG_IDS.has(DIALOG_ID)) {
    document.dispatchEvent(new CustomEvent<OPEN_LEXICAL_DIALOG_CED>('OPEN_LEXICAL_DIALOG',{detail: { dialogID: DIALOG_ID }}));
  } else {
    const dialog = document.querySelector<HTMLDivElement>(`div.dialog-wrapper[id="${DIALOG_ID}"]`);
    if (dialog && DIALOG_ID === "loading-dialog") {
      const text = this.getAttribute('data-text');
      openLoadingDialog(dialog,text);
    } else if (dialog) openDialog(dialog);
  }
}
/**
 * Function to set the innerText of the dialog
 * @param text 
 */
export function setLoadingDialogInnerText(text: string) {
  const dialog = document.getElementById('loading-dialog');
  if (dialog) {
    const textEl = dialog.querySelector<HTMLParagraphElement>('p[data-text]');
    if (textEl) {
      textEl.innerText = text;
    }
  }
}
/**
 * 1. Get All buttons that are supposed to open dialogs, buttons that
 * include the attribute data-dialog, and open their corresponding dialogs on click.
 *
 * 2. Corresponding dialogs should have an id matching the data-dialog of the button.
 */
function setDialogOpenButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-dialog]")).forEach((button) => {
    if (button.hasAttribute('data-mouse-down')) {
      button.addEventListener(isTouchDevice()?'touchstart':'mousedown',openDialogOnButtonClick);
    }
    button.addEventListener('click',openDialogOnButtonClick);
  });
}


function closeDialogOnBackdropClick(this:HTMLDivElement,e:Event) {
  if (e && e.target && (e.target instanceof HTMLDivElement) && e.target.isSameNode(this)) closeDialog(this);
}
/**
 * Get all dialogs that have the boolean attribute
 * **data-close-backdrop** and listen for clicks on them to close
 * on backdrop click.
 */
function setDialogCloseOnBackdropClick(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLDivElement>("div.dialog-wrapper[data-close-backdrop]")).forEach((dialog) => {
    dialog.addEventListener("mousedown", closeDialogOnBackdropClick);
  });
}
/**
 * Closes the parent dialog on button click
 * @param {Event} _e HTML button click event
 * @this {HTMLButtonElement}
 */
function closeDialogOnButtonClick(this:HTMLButtonElement,_e:Event) {
  const dialog = this.closest<HTMLDivElement>("div.dialog-wrapper");
  if (dialog) closeDialog(dialog);
}
/**
 * Gets all `<button class="close-dialog>"`, and
 * adds a click event listener to them so that they close their parent dialog
 * when clicked.
 */
function setDialogCloseButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLButtonElement>("button.close-dialog"))
  .forEach((button) => {
    button.addEventListener("click", closeDialogOnButtonClick);
  });
}

/* ------------------------------------ SECTION: ALERTS ------------------------------ */
/**
 * Close the closest `<div class="alert">` on click
 *
 * @param {Event} _e
 * @this {HTMLButtonElement}
 */
function closeAlert(this:HTMLButtonElement,_e:Event) {
  const alert = this.closest<HTMLDivElement>("div.alert");
  if (alert) {
    alert.classList.add("closing", "overflow-hidden");
    setTimeout(() => {
      alert.remove();
    }, 700);
    this.blur();
  }
}
/**
 * Get all `<button class="close-alert">`, and add a click listener
 * to the button. When the button is clicked, close the closest `<div class="alert">`.
 */
function setCloseAlertsButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button.close-alert")).forEach((button) => button.addEventListener("click", closeAlert));
}

/* --------------------------------- SECTION: DETAILS ---------------- */
/**
 *
 * Handle summary click.
 *
 * - For regular accordions, this just opens the accordion.
 * - For details elements that are in a `<ul> > <li>` it checks to see
 * if the `<ul>` has a **data-only** attribute. If it does, then this closes the open accordion and opens the new one
 *
 * @this {HTMLElement} Summary Element
 * @param {Event} e Click Event
 */
function handleSummaryClick(this:HTMLElement,e:Event) {
  if (e.preventDefault) e.preventDefault(); // prevent default to handle manually
  /**
   * @type {HTMLDetailsElement|undefined}
   */
  const details = this.parentElement;
  if (details && (details instanceof HTMLDetailsElement)) {
    /**
     * @type {HTMLUListElement|Element|null}
     */
    const isAccordionGroupEl = details?.parentElement?.parentElement;
    const open = details.getAttribute("open");
    const div = details.querySelector<HTMLDivElement>("div.accordion-content");
    if (div) {
      if (
        (isAccordionGroupEl instanceof HTMLUListElement) &&
        isAccordionGroupEl.classList.contains("accordion") &&
        isAccordionGroupEl.getAttribute("data-only") !== null
      ) {
        /**
         * @type {HTMLDetailsElement|null}
         */
        const openDetails = isAccordionGroupEl.querySelector<HTMLDetailsElement>("details[open]");
        if (openDetails && openDetails.getAttribute("open") !== null) {
          openDetails.removeAttribute("open");
          const div = openDetails.querySelector<HTMLDivElement>("div.accordion-content");
          if (div) div.setAttribute("aria-hidden", "true");
        }
      }
      if (open === null && div) {
        details.setAttribute("open", "true");
        div.setAttribute("aria-hidden", "false");
      } else if (div && (div instanceof HTMLDivElement)) {
        details.removeAttribute("open");
        div.setAttribute("aria-hidden", "true");
      }
    }
  }
}
/**
 * 1. Get all summary elements and add a click listener to them
 */
function setSummariesOnClickEvents(docOrEl:DocOrEl) {
  docOrEl.querySelectorAll("summary:not(data-rte)").forEach((summary) => {
    summary.addEventListener("click", handleSummaryClick);
  });
}

/* ---------------------------------- SECTION: INPUTS ------------------------------------ */
/**
 * Sets the **data-focus** attribute of the parent element of the parent element of the input to **true**
 * if that gradparent element has the class input-group.
 * @this {HTMLInputElement}
 * @param {Event} _e Focus Event
 */
function onInputFocus(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if (wrapper instanceof HTMLDivElement && wrapper.classList.contains("input-group")) {
    wrapper.setAttribute("data-focus", "true");
  }
}
/**
 * Sets the **data-blurred** attribute of the parent element of the parent element of the input to **true**
 * if that gradparent element has the class input-group. Also sets the ** data-focus**
 * attribute to false if the previous conditions are met.
 * @this {HTMLInputElement}
 * @param {Event} _e Blur Event
 */
function onInputBlur(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if ((wrapper instanceof HTMLDivElement) && wrapper.classList.contains("input-group")) {
    wrapper.setAttribute("data-focus", "false");
    wrapper.setAttribute("data-blurred", "true");
  }
}
/**
 * Function called when text input changes
 * @this {HTMLInputElement|HTMLTextAreaElement}
 *
 * @param {Event} _e
 */
function onInputChange(this:HTMLInputElement,_e:Event) {
  const id = this.id;
  const inputName = this.getAttribute("name");
  const type = this.getAttribute('type');
  const rangeInput = Boolean(type=== "range");
  const colorInput = Boolean(type === "color");
  const numberInput = Boolean(type==="number");

  const inputLength = Number(this.value?.length);
  const maxLengthStr = this.maxLength;
  const minLengthStr = this.minLength;
  
  if (numberInput) {
    const numMax = this.max;
    const numMin = this.min;
    if (numMax!=='') {
      if (Number(numMax) < Number(this.value)) {
        this.value = numMax;
      }
    }
    if (numMin!=='') {
      if (Number(numMin) > Number(this.value)) {
        this.value = numMin;
      }
    }
  }

  if (changeDebouncer) clearTimeout(changeDebouncer);
  const debouncedFunction = function (this: HTMLInputElement) {
    if (
      inputName &&
      (notNullOrEmptyString(maxLengthStr) || notNullOrEmptyString(minLengthStr))
    ) {
      /**
       * @type {HTMLParagraphElement|null}
       */
      const charCounter = document.querySelector(`p.char-counter[data-input='${inputName}']`);
      if (charCounter) {
        /**
         * @type {HTMLSpanElement|null}
         */
        const minLengthCounter = charCounter.querySelector("span.min-counter");
        /**
         * @type {HTMLSpanElement|null}
         */
        const maxLengthCounter = charCounter.querySelector("span.max-counter");
        if (minLengthStr) {
          const minLength = Number(minLengthStr);
          /**
           * Number of characters the user still has to type to have a valid input
           */
          const newVal = Number(minLength - inputLength);
          /**
           * In the case where there is a minimum length counter and a maximum length counter,
           * show the minimum length counter only if the user has not input enough charcters.
           * If there is only a max length counter, then only that will be shown.
           * There will never be a case where there is only a min length counter.
           */
          if (newVal <= 0 && minLengthCounter && maxLengthCounter) {
            minLengthCounter.setAttribute("aria-hidden", "true");
            maxLengthCounter.setAttribute("aria-hidden", "false");
          } else if (minLengthCounter && maxLengthCounter) {
            maxLengthCounter.setAttribute("aria-hidden", "true");
            minLengthCounter.setAttribute("aria-hidden", "false");
          }
          if (minLengthCounter)
            minLengthCounter.setAttribute("data-val", String(newVal));
        }
        if (maxLengthStr) {
          const maxLength = Number(maxLengthStr);
          /**
           * Number of characters the user still has to type to have a valid input
           */
          const newVal = Number(maxLength - inputLength);
          if (maxLengthCounter)
            maxLengthCounter.setAttribute("data-val", String(newVal));
        }
      }
    }
    const rangeInputIsAudioOrVideoTime = Boolean(rangeInput && this.getAttribute('data-time')==='' && (this.getAttribute('data-type')==="audio"||this.getAttribute('data-type')==="video")); 
    if (!!!rangeInputIsAudioOrVideoTime) {
      const min = Number(this.min);
      const max = Number(this.max);
      const val = Number(this.value);
      this.style.backgroundSize = ((val - min) * 100) / (max - min) + "% 100%";
      const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
      if (output&&this.type!=="file") {
        const val = this.value;
        output.innerText = String(val);
      }
    }
    if (colorInput) {
      const span = this.nextElementSibling as HTMLSpanElement;
      if (span && span.innerText) span.innerText = this.value;
    }
  }.bind(this);
  changeDebouncer = setTimeout(debouncedFunction, 10);
  if (rangeInput) {
    const blurFunc = function (this:HTMLInputElement) {
      this.blur();
      this.dispatchEvent(new Event("blur"));
    }.bind(this);
    if (rangeAutoBlur && inputName === rangeAutoBlur?.name) clearTimeout(rangeAutoBlur.timeout);
    rangeAutoBlur = { name: inputName, timeout: setTimeout(blurFunc, 100) };
  }
  if (formDebouncer) clearTimeout(formDebouncer);
  const changeForm = function (this: HTMLInputElement) {
    const form = this.closest("form");
    if (form) form.dispatchEvent(new Event("change"));
  }.bind(this);
  formDebouncer = setTimeout(changeForm, 100);
}
/**
 * Sets the **data-hover** attribute of the parent element of the parent element of the input to **true** if that
 * gradparent element has the
 * class input-group
 * @this {HTMLInputElement}
 * @param {Event} _e
 */
function onInputHover(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if ((wrapper instanceof HTMLDivElement) && wrapper.classList.contains("input-group")) {
    wrapper.setAttribute("data-hover", "true");
  }
}
/**
 * Call this function on input mouse out if the input is
 * not readonly.
 * Sets the **data-hover** attribute of the parent element of the parent element of the input to **false**
 * if that gradparent element has the
 * class input-group
 * @this {HTMLInputElement}
 * @param {Event} _e
 */
function onInputMouseOut(this:HTMLInputElement,_e:Event) {
  const wrapper = this.parentElement?.parentElement;
  if ((wrapper instanceof HTMLDivElement) && wrapper.classList.contains("input-group")) {
    wrapper.setAttribute("data-hover", "false");
  }
}
/**
 * When this function is called, toggle the 'type'
 * of the input to either be 'password' or 'text' based on
 * what the current type of the input element is.
 * @param {Event} _e Button Click Event
 * @this {HTMLButtonElement}
 */
function togglePassword(this:HTMLButtonElement,_e:Event) {
  /**
   * @type {HTMLOrSVGElement[]}
   */
  const svgs = Array.from(this.querySelectorAll("svg"));
  const input = this.parentElement?.querySelector("input");
  if (Array.isArray(svgs) && input && (input instanceof HTMLInputElement)) {
    const type = input.getAttribute("type");
    svgs.forEach((svg) => {
      if (svg.getAttribute("hidden") !== null) svg.removeAttribute("hidden");
      else svg.setAttribute("hidden", "");
    });
    if (type === "password") {
      input.setAttribute("type", "text");
    } else if (type === "text") {
      input.setAttribute("type", "password");
    }
    input.focus();
  }
}
/**
 * Set click event listeners on all buttons that have the
 * data-vis-switch attribute to switch the visibility of
 * an input element from 'password' to 'text' and back when
 * clicked
 */
function setPasswordToggleButtons(docOrEl:DocOrEl) {
  /**
   * @type {HTMLButtonElement[]}
   */
  Array.from(docOrEl.querySelectorAll("button[data-vis-switch]")).forEach((button) => {
    button.addEventListener("click", togglePassword);
  });
}
/**
 * When a button is clicked, regenerate the input value of the input whose name
 * is equal to data-input
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
function regenerateInputValue(this:HTMLInputElement,_e:Event) {
  /**
   * @type {string|null}
   */
  const inputName = this.getAttribute("data-input");
  if (inputName) {
    /**
     * @type {HTMLInputElement|null}
     */
    const input = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
    if (input) {
      switch (inputName) {
        case "secret-access-key":
          input.value = randomString(20);
        default:
          break;
      }
    }
  }
  this.blur();
}
/**
 * Get all buttons that have the attribute data-regenerate-value
 * and add a click event listener to them to regenerate the input value of the
 * input with the name equal to data-input
 */
function regenerateInputValueButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-regenerate-value]")).forEach((btn) => {
    btn.addEventListener("click", regenerateInputValue);
  });
}
/**
 * When a button is clicked, get the value of the data-input attribute on the
 * button and copy the value of that input.
 *
 * @this {HTMLButtonElement} Button
 * @param {Event} _e Click Event
 */
function copyInput(this:HTMLButtonElement,_e:Event) {
  /**
   * @type {string|null}
   */
  const inputName = this.getAttribute("data-input");
  if (inputName) {
    /**
     * @type {HTMLInputElement|null}
     */
    const input = document.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
    if (input) {
      const inputValue = input.value;
      navigator.clipboard
        .writeText(inputValue)
        .then(() => {})
        .catch((_error) => {});
    }
  }
  this.blur();
}
/**
 * Get all buttons that have the attribute data-copy-input
 * and set a click event listener on them so that when they are clicked
 * they copy the value of the input. The button should have an
 * attribute data-input which should be equal to the name of the input
 * whose value you want to copy.
 */
function copyInputButtons(docOrEl:DocOrEl) {
  /**
   * @type {HTMLButtonElement[]}
   */
  Array.from(docOrEl.querySelectorAll("button[data-copy-input]")).forEach((btn) => {
    btn.addEventListener("click", copyInput);
  });
}
/**
 * Increase value of adjacent number input on click
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
function increaseValue(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.parentElement;
  if (wrapper && (wrapper instanceof HTMLDivElement)) {
    const input = wrapper.querySelector("input");
    if (input && (input instanceof HTMLInputElement) && input.getAttribute("type") === "number") {
      const value = input.value;
      const stepStr = input.step;
      const stepNum = parseFloat(stepStr as any) || 1;
      var step = 1;
      var decs = 0;
      if (!!!isNaN(stepNum)&&isFinite(stepNum)) {
        step = stepNum;
        decs = stepNum.toString().slice(String(stepStr).indexOf('.')).length-1;
      }
      const max = input.max;
      if (max!==''&&!!!isNaN(Number(max))&&isFinite(Number(max))) {
        if (Number(value) + step <= Number(max)) {
          input.value = (Number(value) + step).toFixed(decs).toString();
          input.dispatchEvent(new Event("change"));
        }
      } else {
        input.value = (Number(value) + step).toFixed(decs).toString();
        input.dispatchEvent(new Event("change"));
      }
    }
  }
  this.blur();
}
/**
 * Get all of the buttons with data-increase attribute and
 * set them to decrease the adjacent number input
 */
function setIncreaseButtonsListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-increase]")).forEach((button) => {
    button.addEventListener("click", increaseValue);
  });
}
/**
 * Decrease the value of adjacent number value on click
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
function decreaseValue(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.parentElement;
  if (wrapper && (wrapper instanceof HTMLDivElement)) {
    const input = wrapper.querySelector("input");
    if (input && (input instanceof HTMLInputElement) && input.getAttribute("type") === "number") {
      const value = input.value;
      const stepStr = input.step;
      const stepNum = parseFloat(stepStr as any) || 1;
      var step = 1;
      var decs = 0;
      if (!!!isNaN(stepNum)&&isFinite(stepNum)) {
        step = stepNum;
        decs = stepNum.toString().slice(String(stepStr).indexOf('.')).length-1;
      }
      const min = input.min;
      if(min!==null&&!!!isNaN(Number(min))&&isFinite(Number(min))) {
        if (Number(value) - step >= Number(min)) {
          input.value = (Number(value) - step).toFixed(decs).toString();
          input.dispatchEvent(new Event("change"));
        }
      } else {
        input.value = (Number(value) - step).toFixed(decs).toString();
        input.dispatchEvent(new Event("change"));
      }
    }
  }
  this.blur();
}
/**
 * Get all of the buttons with data-decrease attribute and
 * set them to decrease the adjacent number input
 */
function setDecreaseButtonsListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-decrease]")).forEach((button) => {
    button.addEventListener("click", decreaseValue);
  });
}

/**
 * Handles the click event on all `<button data-toggle>`
 *
 * @this {HTMLButtonElement} Button
 * @param {Event} _e HTML Click Event
 */
function toggleButtonOnClick(this:HTMLButtonElement,_e:Event) {
  /**
   * true - the element that got clicked is currently selected
   *
   * false - the element that got clicked is not currently selected
   *
   * @type {boolean}
   */
  const isCurrentlyClicked = this.classList.contains("selected");
  /**
   * @type {HTMLElement|null} Should be a div - toggle button subgroup or toggle button group wrapper
   */
  const toggleGroupWrapper = this.parentElement;
  if ((toggleGroupWrapper instanceof HTMLDivElement)) {
    /**
     * data-only === "" when only one button in the toggle button group / subgroup can be selected
     *
     * data-only === null when more than one toggle button can be selected
     *
     * @type {''|null}
     */
    const onlyOne = toggleGroupWrapper.getAttribute("data-only");
    /**
     * data-one === "" when only one button in the toggle button group / subgroup must be selected
     *
     * data-one === null when one button in the toggle group does not have to be selected
     *
     * @type {''|null}
     */
    const mustBeOne = toggleGroupWrapper.getAttribute("data-one");
    /**
     * In this if - else statement, you toggle the selected values of the currently selected
     * buttons
     */
    if (onlyOne !== null && !!!isCurrentlyClicked) {
      /**
       *
       * @type {HTMLButtonElement|null} The button that is currently selected in this group or null
       */
      const currentlySelectedButton =
        toggleGroupWrapper.querySelector("button.selected");
      if ((currentlySelectedButton instanceof HTMLButtonElement)) {
        currentlySelectedButton.classList.remove("selected");
      }
    }
    const isNowSelected = this.classList.toggle("selected");
    /**
     * In this if statement, you check if there must be at least one button selected,
     * and if the button that got clicked is now not selected
     */
    if (mustBeOne !== null && isNowSelected === false) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const oneSelected = toggleGroupWrapper.querySelector("button.selected");
      if (oneSelected === null) {
        /**
         * @type {HTMLButtonElement|null} The default button that should be selected if one button must be selected
         */
        const defaultButton = toggleGroupWrapper.querySelector(
          "button[data-default]"
        );
        if ((defaultButton instanceof HTMLButtonElement)) {
          defaultButton.classList.add("selected");
        } else
          console.error(
            "There must be a buttton with the data-default attribute when there there is a toggle button group with the data-one attribute."
          );
      }
    }
  } else
    console.error(
      "Unable to find toggle button group wrapper or this toggle button does not have an input."
    );
  this.blur();
}
/**
 * Function that gets all toggle buttons -
 * that is all toggle buttons with the data-toggle attribute
 * and adds a click listener to them
 *
 */
function setToggleButtonGroups(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-toggle]")).forEach((btn) => {
    btn.addEventListener("click", toggleButtonOnClick);
  });
}
/**
 * Handle the initial setup for inputs - whatever that may be
 * @param {HTMLInputElement} input
 */
function handleInitialSetup(input:HTMLInputElement) {
  const id = input.id;
  const type = input.getAttribute("type");
  if (type === "range") {
    const min = input.min;
    const max = input.max;
    const val = input.value;
    input.style.backgroundSize = ((Number(val) - Number(min)) * 100) / (Number(max) - Number(min)) + "% 100%";
    const output = document.querySelector<HTMLOutputElement>(`output[for="${id}"]`);
    if (output) {
      const val = input.value;
      output.innerText = String(val);
    }
  }
}

/**
 * Handle the mousedown event of a combobox option
 *
 * @this {HTMLButtonElement}
 * @param {Event} _e Mouse down event
 */
function handleComboboxOptionSelect(this:HTMLButtonElement,_e:Event) {
  const thisValue = this?.getAttribute("data-val");
  if (notNullOrEmptyString(thisValue)) {
    const div = this?.parentElement?.parentElement;
    if ((div instanceof HTMLDivElement)) {
      const inputID = div.getAttribute("data-input");
      if (notNullOrEmptyString(inputID)) {
        const input = document.getElementById(inputID);
        if ((input instanceof HTMLInputElement)) {
          input.value = String(thisValue);
          input.dispatchEvent(new Event('change'));
          const form = input.closest("form");
          if (form) form.dispatchEvent(new Event("change"));
        }
      }
    }
  }
}
/**
 * 1. Get all buttons that have the data-combobox-option attribute
 * 2. Add a mousedown event listener to them so that when they are clicked, you can get their value and
 * set it as the value of the appropriate input
 *
 * 3. The value of the appropriate input should be determined by getting the parent element
 * of the button, getting the data-input value of that element,
 * querySelector for that element, and then replace the value of that input if it exists
 *
 */
function setComboboxListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-combobox-option]")).forEach((btn) =>{
    if (!!!isTouchDevice())  btn.addEventListener("mousedown", handleComboboxOptionSelect)
    else btn.addEventListener("touchstart", handleComboboxOptionSelect)
  });
}
/**
 * @this {HTMLFormElement}
 */
function onFormReset(this:HTMLFormElement) {
  this.dispatchEvent(new Event("change"));
}

/**
 * on reset for forms, add an event listeners to dispatch change on the form
 */
function setFormReset(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll('input[type="reset"]')).forEach((f)=>f.addEventListener('click',onFormReset));
}

/**
 * Show picker for color / date inputs
 * @param this
 */
function showPicker(this:HTMLInputElement){
  if ("showPicker" in HTMLInputElement.prototype) {
    this.showPicker();
  }
}
/**
 * When the button next to the `time`, `datetime` or `date` input is clicked,
 * launch the picker
 * @param this 
 */
function launchPickerOnButtonClick(this:HTMLButtonElement) {
  const input = this.nextElementSibling;
  if((input instanceof HTMLInputElement)) showPicker.bind(input)();
}
/**
 * For `time`, `datetime` and `date` inputs, launch the picker when the button next to the text-like
 * input is clicked
 * @param input 
 */
function showPickerOnButtonClick(input:HTMLInputElement) {
  const button = input.previousElementSibling;
  if ("showPicker" in HTMLInputElement.prototype) { 
    if((button instanceof HTMLButtonElement)&&button.hasAttribute('data-launch-datetime')) button.addEventListener('click',launchPickerOnButtonClick);
  } else {
    if ((button instanceof HTMLButtonElement)) button.classList.add('no-picker');
  }
}

function handlePhoneInputChange(this:HTMLInputElement,e:Event){
  if (this.value.length < 3) this.value = "+1 ";
  else {
    var numbersStr = this.value.split('').filter((s) => /\d+/.test(s)).join('');
    numbersStr = numbersStr.startsWith('1') ? numbersStr : '1'.concat(numbersStr);
    var newVal = '';
    for (let i = 0; i < numbersStr.length; i++){
      if (i===0) newVal += "+1 ";
      else if (i===1) newVal+="(".concat(String(numbersStr[i]))
      else if (i===2||i===3) newVal+=numbersStr[i];
      else if (i===4) newVal+=") ".concat(numbersStr[i]);
      else if (i===5||i===6) newVal+=numbersStr[i];
      else if (i===7) newVal+=" - ".concat(numbersStr[i]);
      else if (i===8||i===9||i===10) newVal+=numbersStr[i];
      if (i===10) break;
    }
    this.value = newVal;
  }
}

/**
 * Set input listeners, handle initial setup of inputs
 *
 */
function setInputListeners(docOrEl:DocOrEl) {
  /**
   * Get all inputs into an array
   * @type {HTMLInputElement[]}
   */
  docOrEl.querySelectorAll<HTMLInputElement|HTMLTextAreaElement>("input, textarea").forEach((input) => {
    const type = input.getAttribute("type");
    handleInitialSetup(input as HTMLInputElement);
    const readOnly = Boolean(input.getAttribute("readonly") !== null);
    if (!!!readOnly) input.addEventListener("focus", onInputFocus);
    input.addEventListener("blur", onInputBlur);
    if (!!!readOnly && (input instanceof HTMLInputElement))input.addEventListener("change",onInputChange);
    else input.addEventListener("input",onInputChange);
    if (!!!readOnly) input.addEventListener("mouseover",onInputHover);
    if (!!!readOnly) input.addEventListener("mouseout",onInputMouseOut);
    if (type==="range") input.addEventListener("input",onInputChange);
    if (type==="color") input.addEventListener("input",onInputChange);
    // if (type==="color") input.addEventListener('click',showPicker);
    if ((type==="date"||type==="datetime"||type==="datetime-local"||type==="time"||type==="week"||type==="month")&&input instanceof HTMLInputElement) showPickerOnButtonClick(input);
    if (type==="tel") {input.addEventListener('input',handlePhoneInputChange); input.addEventListener('change',handlePhoneInputChange);}
  });
}

function onFileInputDragOver(this:HTMLInputElement,e:DragEvent) {
  e.preventDefault();
  this.classList.add('file-dragover');
}
function onFileInputDragLeave(this:HTMLInputElement,e:DragEvent) {
  e.preventDefault();
  this.classList.remove('file-dragover');
}
function onFileInputDrop(this:HTMLInputElement,e:DragEvent) {
  e.preventDefault();
  this.classList.remove('file-dragover');
  if (e.dataTransfer) {
    const files = e.dataTransfer.files;
    this.files = files;
    this.dispatchEvent(new Event('change'));
  }
}

function setFileDragListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLInputElement>('input[type="file"')).forEach((input) =>{
    input.addEventListener("dragenter",onFileInputDragOver);
    input.addEventListener("dragenter",onFileInputDragOver);
    input.addEventListener("dragleave",onFileInputDragLeave);
    input.addEventListener("drop",onFileInputDrop);
  })
}


/* ------------------------------------- SECTION: IMAGES -------------------------- */
function onImageDialogLoad(this:HTMLImageElement){
  const naturalWidth = this.naturalWidth;
  const naturalHeight = this.naturalHeight;
  const width = this.width;
  const height = this.height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const maxHeight = windowHeight*0.6;
  const maxWidth = windowWidth*0.8;
  const widowAspect = maxWidth/maxHeight;
  this.style.setProperty("max-width",'80vw','important');
  this.style.setProperty("max-height",'60vh','important');
  if(!!!isNaN(naturalHeight)&&!!!isNaN(naturalWidth)&&naturalHeight&&naturalWidth) {
    if (naturalWidth/naturalHeight >=widowAspect) {
      this.style.setProperty("width",'80vw');
      this.style.setProperty("height",'auto','important');

    } else {
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'60vh');
    }
    return;
  } else if(!!!isNaN(height)&&!!!isNaN(width)&&height&&width) {
    if (width/height >=widowAspect) {
      this.style.setProperty("width",'80vw');
      this.style.setProperty("height",'auto','important');
    } else {
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'60vh');
    }
    return;
  } else {
    const body = document.querySelector('body');
    if(body){
      this.style.setProperty("width",'auto','important');
      this.style.setProperty("height",'auto','important');
    }    
  }
  if (width&&height) this.style.setProperty("aspect-ratio",`${width} / ${height}`);
}

/**
 * Handle Image click, set image as the src on the image modal,
 * and open the image modal
 * @param {Event} _e
 * @this {HTMLImageElement}
 */
export function onImageClick(this:HTMLImageElement) {
  const src = this.getAttribute("src");
  if (typeof src !== "string" || !!!src.startsWith('https://image.storething.org')) return;
  const title = this.getAttribute("alt");
  const moreText = this.getAttribute("data-text");
  const imageDialog = document.getElementById("image-dialog") as HTMLDivElement;
  if (imageDialog && src) {
    /**
     * @type {HTMLSpanElement}
     */
    const titleSpan = imageDialog.querySelector<HTMLSpanElement>("#image-modal-text");
    /**
     * @type {HTMLImageElement}
     */
    const img = imageDialog.querySelector<HTMLImageElement>("img");
    /**
     * @type {HTMLParagraphElement}
     */
    const descriptionP = imageDialog.querySelector<HTMLParagraphElement>(
      "#image-modal-additional-description"
    );
    if (titleSpan && img && descriptionP) {
      img.style.setProperty('max-width','0px','important');
      img.style.setProperty('max-height','0px','important');
      img.style.setProperty('width','0px','important');
      img.style.setProperty('height','0px','important');
      img.removeEventListener('load',onImageDialogLoad);
      img.addEventListener('load',onImageDialogLoad);
      img.setAttribute("src", src);
      img.setAttribute("alt", String(title));
      titleSpan.innerText = String(title||'');
      descriptionP.innerText = String(moreText||'');
      openDialog(imageDialog);
    }
  }
}

/**
 * The detail should have an image attribute that is an HTMLImageElement
 * @param e 
 */
function onImageClickCustom(e:CustomEvent) {
  const image = e.detail.image;
  if (image&&image?.nodeName==="IMG") onImageClick.bind(image)();
}


export function handleImageError(this:HTMLImageElement) {
  this.src = 'https://cdn.storething.org/frankmbrown/asset/default-image.png';
}

/**
 * Get all images that do not have the `.no-click` class and
 * add a click listener to them to show the image dialog
 */
export function setImagesOnClick(docOrEl:DocOrEl) {
  /**
   * @type {HTMLImageElement[]}
   */
  docOrEl.querySelectorAll("img").forEach((image) => {
    if (!!!image.classList.contains('no-click')) {
      image.addEventListener("click", onImageClick);
    }
    image.addEventListener('error',handleImageError)
  });
}

/* ----------------------- SECTION: AUDIO AND VIDEO -------------------------- */
/**
 * @type {NodeJS.Timeout|undefined}
 */
var debounceTimeChangeAudio:undefined|NodeJS.Timeout = undefined;
/**
 * @type {NodeJS.Timeout|undefined}
 */
var debounceTimeChangeVideo:undefined|NodeJS.Timeout = undefined;
const VALID_AUDIO_STATES = new Set(["sound-up", "sound-down", "muted"] as const);
const VALID_PLAYBACK_SPEEDS = new Set([
  "0.25",
  "0.5",
  "0.75",
  "1",
  "1.25",
  "1.5",
  "1.75",
  "2",
] as const);

/**
 * Get the `<audio>` element
 * @param {HTMLElement} el A child of the audio wrapper element that wants to get access to the audio element
 */
function getAudio(el: HTMLElement) {
  const audioWrapper = el.closest<HTMLDivElement>("div[data-audio-wrapper]");
  if (audioWrapper) {
    const audio = audioWrapper.querySelector<HTMLAudioElement>("audio");
    if (audio) {
      return audio;
    }
  }
  return null;
}
/**
 * Get the `<video>` element
 * @param {HTMLElement} el A child of the video wrapper element that wants to get access to the video element
 */
function getVideo(el:HTMLElement) {
  const videoWrapper = el.closest<HTMLDivElement>("div[data-video-wrapper]");
  if (videoWrapper) {
    const video = videoWrapper.querySelector<HTMLVideoElement>("video");
    if (video) {
      return video;
    }
  }
  return null;
}
/**
 * Might as well use this function to handle multiple input events since you will be reacting to:
 * 1. Audio Time Change
 * 2. Video Time Change
 * 3. Video Sound Change
 * 4. Audio Sound Change
 *
 * @this {HTMLInputElement} Range Input
 *
 * @param {Event} _e Input Event
 */
function handleMediaElementInput(this:HTMLInputElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const sound = this.getAttribute("data-sound");
  const time = this.getAttribute("data-time");
  const val = this.value;
  const max = this.max;
  const min = this.min;
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  const debounceTimeChange = type === "audio" ? debounceTimeChangeAudio : debounceTimeChangeVideo;
  if (mediaElement) {
    if (time === "") {
      if (debounceTimeChange) clearTimeout(debounceTimeChange);
      mediaElement.currentTime = Math.max(Math.min(Number(max), Number(val)),Number(min));
    } else if (sound === "") {
      mediaElement.volume = Number(val) / 100;
    }
  }
}

/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
function muteUnmuteAudio(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const svgs = Array.from(this.children);
  const currentState = (() => {
    const arr = svgs.filter((svg) => svg.getAttribute("hidden") === null);
    if (arr.length) {
      const curr = arr[0].getAttribute("data-type");
      if (isMemberOf(curr,VALID_AUDIO_STATES)) {
        return curr;
      }
    }
    return null;
  })();
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement && currentState) {
    if (currentState !== "muted") {
      mediaElement.muted = true;
    } else {
      mediaElement.muted = false;
      const soundInput = mediaElement?.parentElement?.querySelector<HTMLInputElement>("input[data-sound]");
      if (soundInput) {
        const currSound = soundInput.value;
        if (currSound) {
          const volume = Number(currSound) / 100 || 50;
          mediaElement.volume = volume;
        }
      }
    }
  }
}

/**
 * @this {HTMLInputElement}
 *
 * @param {Event} _e
 */
function changePlaybackSpeed(this:HTMLInputElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const value = this.value;
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement && isMemberOf(value,VALID_PLAYBACK_SPEEDS)) mediaElement.playbackRate = Number(value);
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
async function playMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    await mediaElement.play().catch((e) => console.error(e));
    this.blur();
  }
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
function pauseMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    mediaElement.pause();
    this.blur();
  }
}
/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
async function replayMedia(this:HTMLButtonElement,_e:Event) {
  const type = this.getAttribute("data-type");
  const mediaElement = type === "audio" ? getAudio(this) : getVideo(this);
  if (mediaElement) {
    mediaElement.currentTime = 0;
    await mediaElement.play().catch((e) => console.error(e));
    this.blur();
  }
}
/**
 * 
 * @param this 
 * @param e 
 */
function turnOffOnClosedCaptions(this:HTMLButtonElement,e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div.audio, div.video-wrapper');
  const onCaptionSVG = this.querySelector<SVGElement>('svg[data-on]');
  const offCaptionSVG = this.querySelector<SVGElement>('svg[data-off]');
  if (wrapper&&onCaptionSVG&&offCaptionSVG) {
    const track = wrapper.querySelector<HTMLTrackElement>('track');
    if (track) {
      const currentMode =  track.track.mode;
      if(currentMode==="showing") {
        track.track.mode = "hidden";
        onCaptionSVG.setAttribute('hidden','');
        offCaptionSVG.removeAttribute('hidden');
      } else if (currentMode==="hidden") {
        track.track.mode = "showing";
        offCaptionSVG.setAttribute('hidden','');
        onCaptionSVG.removeAttribute('hidden');
      }
    }
  }
}
/**
 * Set the initial state of the closed caption button based on whichever svg
 * the data-on or data-off, is hidden. If neither of them are hidden, then turn closed captions off
 * @param b 
 */
function setInitialClosedCaptionState(b:HTMLButtonElement) {
  const onClosedCaption = b.querySelector('svg[data-on]');
  const offClosedCaption = b.querySelector('svg[data-off]');
  const wrapper = b.closest<HTMLDivElement>('div.audio, div.video-wrapper');
  if(onClosedCaption&&offClosedCaption&&wrapper) {
    const track = wrapper.querySelector<HTMLTrackElement>('track');
    if(track) {
      if (onClosedCaption.hasAttribute('hidden')&&!!!offClosedCaption.hasAttribute('hidden')) {
        track.track.mode = "hidden";
      } else if (!!!onClosedCaption.hasAttribute('hidden')&&offClosedCaption.hasAttribute('hidden')) {
        track.track.mode = "showing";
      } else {
        onClosedCaption.setAttribute('hidden','');
        offClosedCaption.removeAttribute('hidden');
      }
    }
  }
}

/**
 * 1. Get the main controls div - the div that wraps around the buttons that control
 * play, pause, replay and around the loading and error symbols
 *
 * 2. Set all children of the wrapper in (1) to hidden except the one that has the attribute **attribute**
 * @param {HTMLDivElement} wrapper
 * @param {string} attribute
 */
function setMainControls(wrapper:HTMLDivElement, attribute:string) {
  const mainControls = wrapper.querySelector("div[data-main-controls]");
  if (mainControls) {
    const children = Array.from(mainControls.children);
    children.forEach((el) => {
      if (el.getAttribute(attribute) !== null) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "");
    });
  }
}
/**
 *
 * @param {number} secs An amount of seconds - could be ellapsed or remainig
 * @returns {string} a string of (minutes):(seconds)
 */
export function getDurationString(secs:number) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return Boolean(isNaN(minutes)||isNaN(seconds))? '0:00' : `${minutes}:${
    seconds <= 9 ? "0".concat(String(seconds)) : String(seconds)
  }`;
};
/**
 * returns whether a number `isFinite` and `!!!isNaN`
 */
function validDuration(n:number) {
  return Boolean(isFinite(n)&&!!!isNaN(n));
}
/**
 *
 * @param {HTMLDivElement} wrapper
 * @param {number} ellapsed
 * @param {number} remaining
 * @param {boolean} initial
 */
function setTime(wrapper:HTMLDivElement, ellapsed:number, remaining:number,buffered:TimeRanges, initial = false) {
  const ellapsedStr = getDurationString(ellapsed);
  const remainingStr = getDurationString(remaining);
  const ellapsedSpan = wrapper.querySelector<HTMLSpanElement>("span[data-ellapsed]");
  const remainingSpan = wrapper.querySelector<HTMLSpanElement>("span[data-remaining]");
  const ellapsedIndicator = wrapper.querySelector<HTMLInputElement>("input[data-time]");
  if (ellapsedSpan && remainingSpan && ellapsedIndicator) {
    ellapsedIndicator.removeAttribute('disabled');
    const timeSet = Boolean(
      ellapsedIndicator.getAttribute("data-time-set") === "true"
    );
    ellapsedSpan.innerText = ellapsedStr;
    remainingSpan.innerText = remainingStr;
    if (
      document?.activeElement?.getAttribute("name") !==
      ellapsedIndicator?.getAttribute("name")
    ) {
      ellapsedIndicator.value = String(Math.floor(ellapsed));
      ellapsedIndicator.style.backgroundSize =
        Number((100 * ellapsed) / (ellapsed + remaining)).toFixed(2) + "% 100%";
    }
    if (initial || !!!timeSet) {
      ellapsedIndicator.max = String(Math.floor(remaining + ellapsed));
      ellapsedIndicator.setAttribute("data-time-set", "true");
    }
  }
}
/**
 *
 * @param {HTMLButtonElement} wrapper
 * @param {boolean} muted
 * @param {boolean} low
 * @param {boolean} high
 */
function setVolumeButton(wrapper:HTMLButtonElement, muted:boolean, low:boolean, high:boolean) {
  Array.from(wrapper.children).forEach((svg) => {
    const type = svg.getAttribute("data-type");
    if (type === "muted" && muted) svg.removeAttribute("hidden");
    else if (type === "sound-up" && high) svg.removeAttribute("hidden");
    else if (type === "sound-down" && low) svg.removeAttribute("hidden");
    else svg.setAttribute("hidden", "");
  });
}

/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Abort Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/abort_event)
 */
function handleAbort(this:HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) {
    setMainControls(wrapper, "data-error");
    const warnText = wrapper.querySelector("p[data-warn-text]");
    if (warnText) warnText.removeAttribute("hidden");
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} _e [Can Play Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplay_event)
 */
function handleCanPlay(this:HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement;
  if (wrapper instanceof HTMLDivElement) setMainControls(wrapper, "data-play");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Can Play Through](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event)
 */
function handleCanPlayThrough(this:HTMLMediaElement,_e:Event) {
  
  this.setAttribute("data-play-through", "true");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Duration Change](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/durationchange_event)
 */
function handleDurationChange(this:HTMLMediaElement,_e:Event) {
  
  const duration = Math.floor(this.duration);
  const currentTime = Math.floor(this.currentTime);
  const wrapper = this.parentElement as HTMLDivElement|null;
  if(validDuration(duration)&&currentTime&&wrapper) setTime(wrapper, currentTime, Math.max(duration-currentTime,0),this.buffered, true);
  else if (wrapper) setAudioVideoTimeRangeDisabled(wrapper);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Ended Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ended_event)
 */
function handleEnded(this:HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-replay");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Error Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/error_event)
 */
function handleError(this:HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) {
    setMainControls(wrapper, "data-error");
    wrapper.classList.add("error");
    const errorText = wrapper.querySelector("p[data-error-text]");
    if (errorText) errorText.removeAttribute("hidden");
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handleLoadedData(this: HTMLMediaElement,_e:Event) {
  
  if ((this instanceof HTMLAudioElement)) {
    // do nothing
  }
  if ((this instanceof HTMLVideoElement)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Loaded Metadata Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loadedmetadata_event)
 */
function handleLoadedMetadata(this: HTMLMediaElement,_e:Event) {
  
  const duration = Math.floor(this.duration);
  const wrapper = this.parentElement as HTMLDivElement|null;
  if (validDuration(duration) && wrapper) setTime(wrapper, 0, duration,this.buffered, true);
  else if(wrapper) setAudioVideoTimeRangeDisabled(wrapper);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handleLoadStart(this: HTMLMediaElement,_e:Event) {
  
  if ((this instanceof HTMLAudioElement)) {
    // Do nothing
  }
  if ((this instanceof HTMLVideoElement)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handlePause(this: HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-play");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Play Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play_event)
 */
function handlePlay(this: HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-pause");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handlePlaying(this: HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-pause");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handleProgress(this: HTMLMediaElement,_e:Event) {
  
  if ((this instanceof HTMLAudioElement)) {
    // do nothing
  }
  if ((this instanceof HTMLVideoElement)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Rate Change](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/ratechange_event)
 */
function handleRateChange(this: HTMLMediaElement,_e:Event) {
  
  if ((this instanceof HTMLAudioElement)) {
    // do nothing
  }
  if ((this instanceof HTMLVideoElement)) {
    // do nothing
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Seeked Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeked_event)
 */
async function handleSeeked(this: HTMLMediaElement,_e:Event) {
  const shouldPlay = Boolean(this.getAttribute("data-should-play") === "true");
  if (shouldPlay && this.paused) {
    await this.play().catch((e) => console.error(e));
  }
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Seeking Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/seeking_event)
 */
function handleSeeking(this: HTMLMediaElement,_e:Event) {
  
  this.setAttribute("data-should-play", this.paused ? "false" : "true");
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Stalled Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/stalled_event)
 */
function handleStalled(this: HTMLMediaElement,_e:Event) {
  
  const wrapper = this.parentElement as HTMLDivElement;
  if (wrapper) setMainControls(wrapper, "data-load");
}

function setAudioVideoTimeRangeDisabled(wrapper:HTMLDivElement) {
  const timeSlider = wrapper.querySelector<HTMLInputElement>('input[data-time]');
  if (timeSlider) timeSlider.setAttribute('disabled','');
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Time Update Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)
 */
function handleTimeUpdate(this: HTMLMediaElement,_e:Event) {
  const wrapper = this.parentElement as HTMLDivElement|null;
  const currentTime = Math.floor(this.currentTime);
  const duration = Math.floor(this.duration);
  if (wrapper && currentTime && validDuration(duration)) setTime(wrapper, currentTime, Math.max(duration - currentTime, 0),this.buffered);
  else if (wrapper) setAudioVideoTimeRangeDisabled(wrapper);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e
 */
function handleVolumeChange(this: HTMLMediaElement,_e:Event) {
  const volume = this.volume;
  const muted = this.muted;
  const soundDown = Boolean(!!!muted && volume < 0.5);
  const soundUp = Boolean(!!!muted && volume >= 0.5);
  const volumeButton = this.parentElement?.querySelector<HTMLButtonElement>(
    "button[data-mute-button]"
  );
  if (volumeButton) setVolumeButton(volumeButton, muted, soundDown, soundUp);
}
/**
 * @this {HTMLMediaElement} Video Element or Audio Element
 *
 * @param {Event} e [Waiting Event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/waiting_event)
 */
function handleWaiting(this: HTMLMediaElement,_e:Event) {
  
  this.setAttribute("data-resume", "true");
}


/**
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Click Event
 */
async function onVideoClick(this: HTMLMediaElement,_e:Event) {
  if (this.paused) {
    await this.play().catch((e) => console.error(e));
  } else {
    await this.pause();
  }
}

/**
 * @this {HTMLMediaElement} Audio Element
 *
 * @param {Event} _e Focus Event
 */
function onVideoFocus(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-focus", "true");
}
/**
 *
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Hover Event
 */
function onVideoMouseEnter(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-hover", "true");
}
/**
 * @this {HTMLMediaElement} Audio Element
 *
 * @param {Event} _e Blur Event
 */
function onVideoBlur(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-focus", "false");
}
/**
 *
 * @this {HTMLMediaElement} Video Element
 *
 * @param {Event} _e Hover Event
 */
function onVideoMouseLeave(this: HTMLMediaElement,_e:Event) {
  const videoWrapper = this.parentElement;
  if (videoWrapper) videoWrapper.setAttribute("data-hover", "false");
}


/**
 * @this {HTMLButtonElement} Button Element
 * https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide
 * @param {Event} _e Click Event
 */
function handleFullscreenClick(this: HTMLButtonElement,_e:Event) {
  const video = getVideo(this);
  const children = Array.from(this.children);
  const currentState = (() => {
    for (let i = 0; i < children.length; i++) {
      if (children[i].getAttribute("hidden") === "") {
        return children[i].getAttribute("data-type");
      }
    }
    return null;
  })();
  if (video) {
    const videoWrapper = video.parentElement;
    if (videoWrapper && currentState === "no-fullscreen" && Boolean(document.fullscreenEnabled || (document as any).webkitFullscreenEnabled)) {
      video.removeAttribute('height');
      if (videoWrapper&&videoWrapper.requestFullscreen) {
        videoWrapper.requestFullscreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "true");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
        }).catch((err) => console.error(err));
      } else if (videoWrapper && (videoWrapper as any).webkitRequestFullscreen) {
        (videoWrapper as any).webkitRequestFullscreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "true");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
        }).catch((err:any) => console.error(err));
      } else if (videoWrapper && (videoWrapper as any).mozRequestFullScreen) {
        (videoWrapper as any).mozRequestFullScreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "true");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
        }).catch((err:any) => console.error(err));
      }
    } else if (videoWrapper && currentState === "fullscreen") {
      const dataHeight = video.getAttribute('data-height');
      if (dataHeight) video.setAttribute('height',dataHeight);
      if (document.fullscreenEnabled) {
        document.exitFullscreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "false");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
          setNavbarOpenClosed(true);
          setPreventNavbarModification(true);
          videoWrapper.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          setTimeout(() => {
            setPreventNavbarModification(false);
          },100)
        }).catch((err) => console.error(err));
      } else if ((document as any).webkitFullscreenEnabled) {
        (document as any).webkitExitFullscreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "false");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
          setNavbarOpenClosed(true);
          setPreventNavbarModification(true);
          videoWrapper.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          setTimeout(() => {
            setPreventNavbarModification(false);
          },100)
        }).catch((err:any) => console.error(err));
      } else if ((document as any).mozFullScreenEnabled) {
        (document as any).mozCancelFullScreen().then(() => {
          videoWrapper.setAttribute("data-fullscreen", "false");
          for (let i = 0; i < children.length; i++) {
            if (children[i].getAttribute("hidden") === "")
              children[i].removeAttribute("hidden");
            else children[i].setAttribute("hidden", "");
          }
          setNavbarOpenClosed(true);
          setPreventNavbarModification(true);
          videoWrapper.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          setTimeout(() => {
            setPreventNavbarModification(false);
          },100);
        }).catch((err:any) => console.error(err));
      }
    }
  }
}
/**
 * When the vtt file fails to load, disable the closed cap
 * @param this 
 * @param e 
 */
function handleTrackError(this:HTMLTrackElement,e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div.audio, div.video-wrapper');
  if(wrapper) {
    const closedCaptionButton = wrapper.querySelector('button[data-closed-captions]');
    if (closedCaptionButton&&!!!closedCaptionButton.hasAttribute('disabled')) closedCaptionButton.setAttribute('disabled','');
  }
}


function setAudioListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLAudioElement>('audio')).forEach((audio) => {
    audio.addEventListener("abort", handleAbort);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("ratechange", handleRateChange);
    audio.addEventListener("seeked", handleSeeked);
    audio.addEventListener("seeking", handleSeeking);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("volumechange", handleVolumeChange);
    audio.addEventListener("waiting", handleWaiting);
    const trackElement = audio.querySelector<HTMLTrackElement>('track');
    if(trackElement)trackElement.addEventListener('error',handleTrackError)
    
    const audioWrapper = audio.parentElement;
    if (audioWrapper) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const playAudio = audioWrapper.querySelector("button[data-play]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const pauseAudio = audioWrapper.querySelector("button[data-pause]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const replayAudio = audioWrapper.querySelector("button[data-replay]");
      /**
       * @type {HTMLInputElement|null}
       */
      const audioTimeRange = audioWrapper.querySelector("input[data-time]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const audioMuteButton = audioWrapper.querySelector(
        "button[data-mute-button]"
      );
      /**
       * @type {HTMLInputElement|null}
       */
      const audioSoundRange = audioWrapper.querySelector("input[data-sound]");
      /**
       * @type {HTMLInputElement|null}
       */
      const playBackSpeed = audioWrapper.querySelector("input[data-playback]");
      /**
       * Button that controls the closed captions
       * Should be used to turn on / off closed captions and should be set to disabled when there is an error loading the closed captions
       */
      const closedCaptionButton = audioWrapper.querySelector<HTMLButtonElement>('button[data-closed-captions]');
      if(audioTimeRange)audioTimeRange.addEventListener("blur", handleMediaElementInput);
      if(audioMuteButton)audioMuteButton.addEventListener("click", muteUnmuteAudio);
      if(audioSoundRange)audioSoundRange.addEventListener("input", handleMediaElementInput);
      if(playBackSpeed)playBackSpeed.addEventListener("change", changePlaybackSpeed);
      if(playAudio)playAudio.addEventListener("click", playMedia);
      if(pauseAudio)pauseAudio.addEventListener("click", pauseMedia);
      if(replayAudio)replayAudio.addEventListener("click", replayMedia);
      if(closedCaptionButton)closedCaptionButton.addEventListener('click',turnOffOnClosedCaptions);
      if (closedCaptionButton) setInitialClosedCaptionState(closedCaptionButton);
    }
  });
}
function setVideoListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLVideoElement>('video')).forEach((video) => {
    video.addEventListener("abort", handleAbort);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("stalled", handleStalled);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("waiting", handleWaiting);

    video.addEventListener("click", onVideoClick);
    video.addEventListener("focus", onVideoFocus);
    video.addEventListener("mouseenter", onVideoMouseEnter);
    video.addEventListener("blur", onVideoBlur);
    video.addEventListener("mouseleave", onVideoMouseLeave);
    const trackElement = video.querySelector<HTMLTrackElement>('track');
    if(trackElement) trackElement.addEventListener('error',handleTrackError);
    const videoWrapper = video.parentElement;
    if (videoWrapper) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const playAudio = videoWrapper.querySelector("button[data-play]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const pauseAudio = videoWrapper.querySelector("button[data-pause]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const replayAudio = videoWrapper.querySelector("button[data-replay]");
      /**
       * @type {HTMLInputElement|null}
       */
      const videoTimeRange = videoWrapper.querySelector("input[data-time]");
      /**
       * @type {HTMLButtonElement|null}
       */
      const videoMuteButton = videoWrapper.querySelector(
        "button[data-mute-button]"
      );
      /**
       * @type {HTMLInputElement|null}
       */
      const videoSoundRange = videoWrapper.querySelector("input[data-sound]");
      /**
       * @type {HTMLInputElement|null}
       */
      const playBackSpeed = videoWrapper.querySelector("input[data-playback]");
      /**
       * Button that controls the closed captions
       * Should be used to turn on / off closed captions and should be set to disabled when there is an error loading the closed captions
       */
      const closedCaptionButton = videoWrapper.querySelector<HTMLButtonElement>('button[data-closed-captions]');
      const fullscreenButton = videoWrapper.querySelector(
        "button[data-fullscreen]"
      );
      if (videoTimeRange)videoTimeRange.addEventListener("blur", handleMediaElementInput);
      if (videoMuteButton)videoMuteButton.addEventListener("click", muteUnmuteAudio);
      if (videoSoundRange)videoSoundRange.addEventListener("input", handleMediaElementInput);
      if (playBackSpeed)playBackSpeed.addEventListener("change", changePlaybackSpeed);
      if (playAudio)playAudio.addEventListener("click", playMedia);
      if (pauseAudio)pauseAudio.addEventListener("click", pauseMedia);
      if (replayAudio)replayAudio.addEventListener("click", replayMedia);
      if (fullscreenButton)fullscreenButton.addEventListener("click", handleFullscreenClick);
      if(closedCaptionButton)closedCaptionButton.addEventListener('click',turnOffOnClosedCaptions);
      if (closedCaptionButton) setInitialClosedCaptionState(closedCaptionButton);
    }
  });
}



/* ----------------------------- SECTONX: SELECT  ------------------- */
const autoUpdateSelectObject:{[key: string]: any} = {};
var openSelectButtonPelem: string|undefined = undefined;
/**
 * Get select button and dropdown given ID helper function
 */
function getSelectButtonAndDropdown(s:string) {
  const button = document.querySelector(`button[data-pelem="${s}"]`) as HTMLButtonElement|null;
  if (button) {
    const dropdownStr = button.getAttribute('data-pelem');
    if (dropdownStr) {
      const dropdown = document.querySelector(dropdownStr) as HTMLDivElement|null;
      if (dropdown) {
        return [button,dropdown] as [HTMLButtonElement,HTMLDivElement];
      }
    }
  }
  return null;
}

function onSelectKeydown(e:KeyboardEvent) {
  /**
   * Button that have aria-selected="true"
   */
  var currentlySelectedIndex: undefined|number = undefined;
  /**
   * Button that has the classlist hover
   */
  var currentHoverIndex: undefined|number = undefined;
  const handleEventKeys = new Set(['arrowup','arrowdown','enter',"tab"]);
  const key = e.key.toLowerCase();
  if(openSelectButtonPelem&&handleEventKeys.has(key)) {
    const selectAndDropdown = getSelectButtonAndDropdown(openSelectButtonPelem);
    if(selectAndDropdown) {
      e.preventDefault();
      const [_,dropdown] = selectAndDropdown; 
      const selectOptionButtons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('button[role="option"]'));
      selectOptionButtons.forEach((b,i)=>{
        if (b.getAttribute('aria-selected')==="true") currentlySelectedIndex=i;
        if (b.classList.contains('hover')) currentHoverIndex=i;
      })
      if (!!!currentHoverIndex) currentHoverIndex=0;
      const currentFocusedButtonIndex = (typeof currentHoverIndex === 'number') ?currentHoverIndex:currentlySelectedIndex;
      if (typeof currentFocusedButtonIndex === 'number') {
        if (key==="arrowup") {
          if (currentFocusedButtonIndex===0) {
            selectOptionButtons[0].classList.remove('hover');
            selectOptionButtons[selectOptionButtons.length-1].classList.add('hover');
          } else {
            selectOptionButtons[currentFocusedButtonIndex].classList.remove('hover');
            selectOptionButtons[currentFocusedButtonIndex-1].classList.add('hover');
          }
        } else if (key==="arrowdown") {
          if (currentFocusedButtonIndex===selectOptionButtons.length-1) {
            selectOptionButtons[selectOptionButtons.length-1].classList.remove('hover');
            selectOptionButtons[0].classList.add('hover');
            
          } else {
            selectOptionButtons[currentFocusedButtonIndex].classList.remove('hover');
            selectOptionButtons[currentFocusedButtonIndex+1].classList.add('hover');
            
          }
        } else if (key==="enter") {
          handleSelectionButtonOptionClick.bind(selectOptionButtons[currentFocusedButtonIndex])();
          closeSelect(openSelectButtonPelem);
        } else if (key==="tab") {
          closeSelect(openSelectButtonPelem);
        }
      }
    }
  }
  return true;
}
/**
 * Helper function to properly close select menu when it is closed
 */
function closeSelect(selectButtonPelem?:string) {
  const strToUse = selectButtonPelem ? selectButtonPelem : openSelectButtonPelem;
  if (strToUse&&autoUpdateSelectObject[strToUse]) {
    try { 
      autoUpdateSelectObject[strToUse]();
      delete autoUpdateSelectObject[strToUse];
    } catch (e) {}
  }
  if (strToUse) {
    const buttonAndDropdown = getSelectButtonAndDropdown(strToUse);
    if(buttonAndDropdown) {
      const [selectButton,dropdown] = buttonAndDropdown;
      const addClickListenerElement = selectButton.closest<HTMLBodyElement|HTMLElement>('body, div.dialog');
      if (addClickListenerElement) addClickListenerElement.removeEventListener('click',closeSelectOnDocumentClick);
      selectButton.setAttribute('aria-expanded','false');
      if (dropdown) {
        const currentHover = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('button.hover'));
        currentHover.forEach((b)=>b.classList.remove('hover'));
        dropdown.style.display='none';
        dropdown.style.opacity='0';
      }
      document.removeEventListener('keydown',onSelectKeydown,true);
      const dialog = selectButton.closest<HTMLDivElement>('div.dialog-body, *[data-click-capture], body');
      if (dialog) {
        dialog.removeEventListener('click',closeSelectOnClick);
      } else {
        document.removeEventListener('click',closeSelectOnClick);
      }
    }
  }
  openSelectButtonPelem=undefined;
}
/**
 * When the closest div.dialog, *[data-click-capture], or body recieves a click 
 * event, close the select menu
 * @param this 
 * @param e 
 */
function closeSelectOnClick(this:HTMLElement|Document,e:Event) {
  closeSelect();
}
/**
 * **data-value** - attribute equal to the value of the option that should be set on the hidden text input
 *
 * **Structure of Select**:
 *
 * div (select wrapper)
 *
 * - button (select button)
 *    - span (current selection)
 *    - svg (arrow)
 *
 * - div (select dropdown)
 *    - input (hidden type="text")
 *    - button (option 1)
 *    - button (option 2)
 *    - (more Options)
 * @this {HTMLButtonElement}
 * @param {Event} _e Button Click Event
 */
function handleSelectionButtonOptionClick(this:HTMLButtonElement,_:Event) {
  const parentElement = this.parentElement;
  if(parentElement) {
    // remove the currently selected option
    const removeSelected = parentElement.querySelector('button[aria-selected="true"]'
    );
    
    if (removeSelected) removeSelected.setAttribute("aria-selected", "false");
    /**
     * @type {undefined|string|null}
     * The new value for the select input
     */
    var newVal = undefined;
    /**
     * @type {string|null|undefined} The new innerText for the select button
     */
    var text = undefined;
    this.setAttribute("aria-selected", "true");
    newVal = this.getAttribute("data-val");
    text = this.innerText;
    /**
     * Make sure that newVal and text are not null
     */
    if (typeof newVal === "string" && typeof text === "string") {
      const selectWrapper = this?.parentElement?.parentElement;
      if ((selectWrapper instanceof HTMLDivElement)) {
        const selectButtonSpan =
          selectWrapper.querySelector<HTMLSpanElement>("button.select>span");
        const input = selectWrapper.querySelector("input");
        if ((input instanceof HTMLInputElement)) {
          if (selectButtonSpan) {
            selectButtonSpan.innerText = text;
          }
          input.value = newVal;
          input.dispatchEvent(new Event('change'));
        }
      }
    }
    closeSelect();
  } 
}
/**
 * When the body or closest dialog encours a touchend or mouseup event, close the select as long as the click want inside the 
 * select button or dropdown 
 */
function closeSelectOnDocumentClick(e:(TouchEvent|MouseEvent|Event)) {
  const IS_POINTER_EVENT = e instanceof MouseEvent;
  const IS_TOUCH_EVENT = e && Array.isArray((e as any).touches) && (e as any).touches.length && (e as any).touches[0].hasProperty('clientX') && (e as any).touches[0].hasProperty('clientY');
  const clientX = !!IS_POINTER_EVENT ? e.clientX : IS_TOUCH_EVENT ? (e as TouchEvent).touches?.[0].clientX : undefined;
  const clientY = !!IS_POINTER_EVENT ? e.clientY :  IS_TOUCH_EVENT ? (e as TouchEvent).touches?.[0].clientY : undefined;
  if (clientX&&clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (el&&openSelectButtonPelem) {
      const closestButtonOrDropdown = el.closest<HTMLElement>('button.select, div.select-menu');
      if (closestButtonOrDropdown) closeSelect(openSelectButtonPelem);
    }
  }
}
/**
 * - Open the select dropdown
 * - Add a listener to the document to listen for keydown arrows and enter
 * - On select close, the dropdown should close
 * 
 * 
 * @param this 
 * @param e 
 */
function openSelect(this:HTMLButtonElement,e:Event) {
  e.stopPropagation();
  Object.keys(autoUpdateSelectObject)
  .forEach((key) => closeSelect(key));
  if (this.classList.contains('select')&&this.getAttribute('disabled')!==null) return;
  const selectDropdownStr = this.getAttribute('data-pelem');
  if (selectDropdownStr) openSelectButtonPelem = selectDropdownStr;
  if (this.getAttribute("aria-haspopup") === "listbox") this.setAttribute("aria-expanded", "true");
  const elementWithPopover = this;
  const isAuto = Boolean(elementWithPopover.classList.contains("auto-w"));
  if (selectDropdownStr) {
    const dropdown = document.querySelector<HTMLElement>(selectDropdownStr);
    if (dropdown) {
      const selectOptionButtons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('button[role="option"]'));
      selectOptionButtons.forEach((b) => b.addEventListener('click',handleSelectionButtonOptionClick));
      const firstSelectedButton = selectOptionButtons.filter((b) => b.getAttribute('aria-selected')==="true")?.[0];
      // Scroll To First Selected Element
      dropdown.style.display = "block";
      if (firstSelectedButton) {
        const topPos = firstSelectedButton.offsetTop;
        dropdown.scrollTop = topPos;
      }
      const updateSelect = () => {
        const middleWare:any[] = [];
        const options:any = {};
        const classList = dropdown.classList;
        if (classList.contains("o-lg")) middleWare.push(offset(12));
        else if (classList.contains("o-sm")) middleWare.push(offset(4));
        else if (classList.contains("o-xs")) middleWare.push(offset(1));
        else middleWare.push(offset(8));
        middleWare.push(shift());
        const placement = dropdown.getAttribute("data-placement");
        const noFlip = dropdown.getAttribute("data-no-flip");
        if (noFlip === null) middleWare.push(flip());
        if (isMemberOf(placement,validPlacements)) options.placement = placement;
        else options.placement = "top";
        options.middleware = middleWare;

        computePosition(elementWithPopover, dropdown, options).then(
          ({ x, y }) => {
            var assignObj = {};
            if (!!!isAuto) {
              const width = elementWithPopover.offsetWidth;
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                opacity: "1",
              };
            } else {
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                opacity: "1",
              };
            }
            Object.assign(dropdown.style, assignObj);
          }
        ).catch((err) => {
          console.error(err);
          const assignObj = {
            left: `0px`,
            top: `0px`,
            opacity: "0",
          };
          Object.assign(dropdown.style, assignObj);
          dropdown.setAttribute('hidden','');
        });
      };
      document.addEventListener('keydown',onSelectKeydown,true);
      const dialog = this.closest<HTMLDivElement>('div.dialog-body, *[data-click-capture], body');
      if (dialog) {
        dialog.addEventListener('click',closeSelectOnClick);
      } else {
        document.addEventListener('click',closeSelectOnClick);
      }
      updateSelect();
      const cleanup = autoUpdate(this, dropdown, updateSelect);
      delete autoUpdateSelectObject[selectDropdownStr];
      autoUpdateSelectObject[selectDropdownStr] = cleanup;
    }
  }
}
/**
 * Creating a custom function to handle select components because I actually want it to work
 * @param selectButton 
 */
function handleSelect(selectButton:Element) {
  (selectButton as HTMLButtonElement).addEventListener('click',openSelect);
  const addClickListenerElement = selectButton.closest<HTMLBodyElement|HTMLElement>('body, div.dialog');
  if (addClickListenerElement) addClickListenerElement.addEventListener('click',closeSelectOnDocumentClick);
}

/* -------------------------------- SECTION: POPOVERS ------------------------- */
/**
 * Element 
 */
var openPopoverElement: undefined|HTMLElement = undefined;
/**
 * See [HERE](https://floating-ui.com/docs/autoUpdate)
 */
const autoUpdateObject:{[key: string]: any} = {};
const validPlacements = new Set([
  "top",
  "right",
  "bottom",
  "left",
  "top-start",
  "right-start",
  "bottom-start",
  "left-start",
  "top-end",
  "right-end",
  "bottom-end",
  "left-end",
] as const);

/**
 * 
 */
function hidePopoverOnClick(e:Event) {
  e.stopPropagation();
  if (openPopoverElement) hidePopoverHelper(openPopoverElement);
}
export function hideOpenPopover(s:string) {
  try {
    autoUpdateObject[s]();
    delete autoUpdateObject[s];
  } catch (error) {}
}
function hideOpenPopoverCallback(e:CustomEvent) {
  const str = e.detail.str;
  if (typeof str === "string") {
    hideOpenPopover(str);
  }
}
/**
 * @this {HTMLElement} HTML element with data-popover attribute
 * @param {Event} e MouseEnter or Focus Event
 */
function showPopover(this: HTMLElement,e:Event) {
  e.stopPropagation();
  const EVENT_TYPE = e.type;
  if(EVENT_TYPE==="click") e.preventDefault();
  const popoverElStr = this.getAttribute("data-pelem");
  if (this.nodeName.toUpperCase()!=='INPUT' && !!!autoUpdateObject[String(popoverElStr)]) e.stopPropagation();
  if (this.nodeName.toUpperCase()==='INPUT') this.focus();
  if (this.getAttribute('data-click')!==null) {
    if (this.classList.contains('select')&&this.getAttribute('disabled')!==null) return;
    /**
     * Add click listener so popover works on mobile devices
     */
    const el = getClosestDialogOrBody(this);
    if(el) {
      setTimeout(() => {openPopoverElement=this;},60);
      if (!!!isTouchDevice()) el.addEventListener('mousedown',hidePopoverOnClick);
      else el.addEventListener('touchstart',hidePopoverOnClick);
      el.addEventListener('click',hidePopoverOnClick);
    }
  }
  if (this?.getAttribute("aria-haspopup") === "listbox") this.setAttribute("aria-expanded", "true");
  
  if (notNullOrEmptyString(popoverElStr)) {
    const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
    if (popoverEl) {
      popoverEl.addEventListener('click',captureClick);
      const buttons = Array.from(popoverEl.querySelectorAll<HTMLButtonElement>('button[data-close-menu]'));
      if (buttons) buttons.forEach((btn) => btn.addEventListener('click',hidePopoverOnClick));

      popoverEl.style.display = "block";
      const elementWithPopover = this;
      const updatePopover = () => {
        const isSelect = Boolean(
          elementWithPopover.classList.contains("select")
        );
        const isAuto = Boolean(elementWithPopover.classList.contains("auto-w"));
        if (!!!elementWithPopover.isConnected) hidePopoverHelper(elementWithPopover);
        const middleWare:any[] = [];
        const options:any = {};
        const classList = popoverEl.classList;
        if (classList.contains("o-lg")) middleWare.push(offset(12));
        else if (classList.contains("o-sm")) middleWare.push(offset(4));
        else if (classList.contains("o-xs")) middleWare.push(offset(1));
        else middleWare.push(offset(8));
        middleWare.push(shift());
        const placement = popoverEl.getAttribute("data-placement");
        const noFlip = popoverEl.getAttribute("data-no-flip");
        if (noFlip === null) middleWare.push(flip());
        if (isMemberOf(placement,validPlacements)) options.placement = placement;
        else options.placement = "top";
        options.middleware = middleWare;

        computePosition(elementWithPopover, popoverEl, options).then(
          ({ x, y }) => {
            var assignObj = {};
            if (!!!isAuto&&isSelect) {
              const width = elementWithPopover.offsetWidth;
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                width: `${width}px`,
                opacity: "1",
              };
            } else {
              assignObj = {
                left: `${x}px`,
                top: `${y}px`,
                opacity: "1",
              };
            }
            Object.assign(popoverEl.style, assignObj);
          }
        ).catch((err) => {
          console.error(err);
          const assignObj = {
            left: `0px`,
            top: `0px`,
            opacity: "0",
          };
          Object.assign(popoverEl.style, assignObj);
          popoverEl.setAttribute('hidden','');
        });
      };
      updatePopover();
      const cleanup = autoUpdate(this, popoverEl, updatePopover);
      delete autoUpdateObject[popoverElStr];
      autoUpdateObject[popoverElStr] = cleanup;
    }
  }
}
/**
 * 
 * @param {HTMLElement} element HTML element with data-popover attribute
 */
function hidePopoverHelper(element:HTMLElement) {
  if (element.getAttribute('data-click')!==null) {
    /**
     * Add click listener so popover works on mobile devices
     */
    const el = getClosestDialogOrBody(element);
    if(el) {
      openPopoverElement=undefined;
      if(!!!isTouchDevice())el.removeEventListener('mousedown',hidePopoverOnClick);
      else el.removeEventListener('touchstart',hidePopoverOnClick);
      el.addEventListener('click',hidePopoverOnClick);
    }
  }
  if (element.getAttribute("aria-haspopup") === "listbox") element.setAttribute("aria-expanded", "false");
  const popoverElStr = element.getAttribute("data-pelem");
  if (notNullOrEmptyString(popoverElStr)&&typeof popoverElStr==='string') {
    const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
    if (popoverEl) {
      const buttons = Array.from(popoverEl.querySelectorAll<HTMLButtonElement>('button[data-close-menu]'));
      if (buttons) buttons.forEach((btn) => btn.removeEventListener('click',hidePopoverOnClick));
      if (autoUpdateObject[popoverElStr]) {
        try {
          autoUpdateObject[popoverElStr]();
          delete autoUpdateObject[popoverElStr];
        } catch (e) {}
      }
      popoverEl.style.display = "none";
      popoverEl.style.opacity = "0";
    }
  }
}
/**
 * @this {HTMLElement} HTML element with data-popover attribute
 * @param {Event} _e MouseLeave or Blur Event
 */
function hidePopover(this: HTMLElement,_e:Event) {
  hidePopoverHelper(this);
}

/**
 * Get all elements with a data-popover attribute and add appropriate event listeners to
 * them based on data attributes of the element with a popover.
 *
 * Attributes:
 * - data-pelem: The value of this data attribute will be used to
 * - data-mouse:
 * - data-click:
 *
 * [Floating ui Docs](https://floating-ui.com/docs/tutorial#functionality)
 */
function setPopoverListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("[data-popover]")).forEach((elementWithPopover) => {
    const isSelect = Boolean(elementWithPopover.classList.contains('select'));
    const popoverElStr = elementWithPopover.getAttribute("data-pelem");
    const forceClose = elementWithPopover.getAttribute("data-force-close");
    if (notNullOrEmptyString(popoverElStr)) {
      try {
        const popoverEl = document.querySelector<HTMLElement>(popoverElStr);
        if (popoverEl) {
          if (isSelect) {
            handleSelect(elementWithPopover);
          } else {
            /**
             * Include this attribute on the element with a popover
             * if you want the element with a popover to show
             * the popover on click events (mouseenter / mouseleave)
             * @type {""|null}
             */
            const mouseEvents = elementWithPopover.getAttribute("data-mouse");
            /**
             * Include this attribute on the element with a popover
             * if you want the element with a popover to show
             * the popover on click events (click / blur)
             * @type {""|null}
             */
            const clickEvents = elementWithPopover.getAttribute("data-click");
            if (mouseEvents !== null) {
              elementWithPopover.addEventListener("mouseenter", showPopover);
              elementWithPopover.addEventListener("mouseleave", hidePopover);
            }
            if (clickEvents !== null) {
              elementWithPopover.addEventListener("focus", showPopover);
              elementWithPopover.addEventListener("click", showPopover); /* Added the click event for popovers to work on mobile */
              if (forceClose===null) {
                elementWithPopover.addEventListener("blur", hidePopover);
                elementWithPopover.addEventListener("focusout", hidePopover);
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
}
function hideOpenPopovers() {
  document.dispatchEvent(new CustomEvent('HIDE_OPEN_POPOVERS'));
  Object.keys(autoUpdateObject).forEach((key) => {
    try {
      autoUpdateObject[key]();
      delete autoUpdateObject[key];
    } catch (error) {}
  })
}

/* -------------------------------- SECTION: SNACKBARS ------------------------- */
// COME
const getSnackbarTransform = (num:number,elsBefore:number) => {
  return `translate(-50%,calc(var(--navbar-height) + 0.5rem + var(--safe-area-inset-top-0px) + ${num}px + ${elsBefore*0.5}rem))`;
}

const openSnackbarsArr:HTMLElement[] = [];
export function openSnackbarFinal2(snackbarEl:HTMLElement,ignoreHidden=false) {
  if (snackbarEl&&snackbarEl.getAttribute('aria-hidden')==="true"||ignoreHidden) {
    const closeSnackbarButton = snackbarEl.querySelector<HTMLButtonElement>('button[data-close-snackbar]');
    if (closeSnackbarButton) {
      closeSnackbarButton.addEventListener('click',()=> {
        removeOpenSnackbar(snackbarEl);
      })
    }
    if (!!!snackbarEl.classList.contains('dialog-snackbar')) {
      const snackbarHeight = openSnackbarsArr.map((el) => el.clientHeight).reduce((prev,curr,i,arr) => { return prev + curr },0);
      snackbarEl.style.setProperty("transform",getSnackbarTransform(snackbarHeight,openSnackbarsArr.length),'important');
      snackbarEl.setAttribute("data-offset-height",String(snackbarHeight));
    }
    snackbarEl.setAttribute("aria-hidden", "false");
    openSnackbarsArr.push(snackbarEl);
    const timeoutStr = snackbarEl.getAttribute("data-snacktime");
    if (notNullOrEmptyString(timeoutStr) && !!!isNaN(Number(timeoutStr))) {
      setTimeout(() => {
        removeOpenSnackbar(snackbarEl);
      }, Number(timeoutStr));
    }
  }
}
function openSnackbarFinal(selectorStr:string) {
  const snackbarEl = document.querySelector<HTMLElement>(selectorStr);
  if (snackbarEl) openSnackbarFinal2(snackbarEl);
}
function removeOpenSnackbar(el:HTMLElement) {
  if (el.classList.contains('dialog-snackbar')) {
    el.setAttribute('aria-hidden','true');
    return;
  }
  const updateEls:{ el: HTMLElement, index: number}[] = [];
  var heightToRemove:number|undefined = undefined;
  for (let i = openSnackbarsArr.length-1; i>-1; i--) {
    if (el.id !== openSnackbarsArr[i].id) {
      updateEls.push({el: openSnackbarsArr[i], index: Math.max(i-1,0) });
    } else {
      heightToRemove = el.clientHeight;
      el.setAttribute('aria-hidden','true');
      openSnackbarsArr.splice(i,1);
      if (heightToRemove) {
        for (let j=updateEls.length-1;j>-1;j--) {
          const currHeight = parseFloat(String(updateEls[j].el.getAttribute('data-offset-height')));
          if (!!!isNaN(currHeight)) {
            const newHeight = currHeight - heightToRemove;
            updateEls[j].el.style.setProperty("transform",getSnackbarTransform(newHeight,updateEls[j].index),'important');
            updateEls[j].el.setAttribute("data-offset-height",String(newHeight));
          }
        }
      }
      heightToRemove = undefined;
      break;
    }
  }
} 
/**
 * 1. Get **data-selem** attribute from button
 * 2. If attribute exists, perform document.querySelector on the document to search for snackbar element
 * 3. If snackbar element exists, set aria-hidden = false
 * 4. If snackbar element has a data-snacktime attribute, setTimeout for that time and remove attribute after that period
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
export function openSnackbar(this: HTMLButtonElement,_e:Event) {
  const selectorStr = this.getAttribute("data-selem");
  if (notNullOrEmptyString(selectorStr)) {
    openSnackbarFinal(selectorStr);
  }
}

function customSnackbarHandler(e:CustomEvent<OPEN_SNACKBAR_CED>) {
  const selem = e.detail.selem;
  if (typeof selem ==="string") {
    openSnackbarFinal(selem);
  }
}

/**
 * 1. Get all buttons that have a **data-snackbar** attribute
 * 2. Add event listener for a click event on those buttons
 */
export function setSnackbarListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("*[data-snackbar]")).forEach((btn) => {
    btn.addEventListener("click", openSnackbar);
  });
}

function createAndOpenSnackbarElement(severity:"error"|'warning'|'info'|'success',message:string,svg?:string) {
  const div = document.createElement('div');
  div.setAttribute('aria-hidden','true');
  div.setAttribute('role','alert');
  div.setAttribute('data-snacktime','4000');
  div.id = 'rnd_'.concat(window.crypto.randomUUID());
  div.className ="snackbar "+severity;
  const svgToUse = svg ? svg : '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="WarningAmberOutlined"><path d="M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg>';
  const p = document.createElement('p');
  p.className = "p-sm";
  p.innerText = message;
  const button = `<button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>`;
  div.insertAdjacentHTML("afterbegin",svgToUse);
  div.append(p);
  div.insertAdjacentHTML("beforeend",button);
  const b = div.querySelector('button');
  if (b) b.addEventListener('click',closeSnackbar);
  const page = document.getElementById('PAGE');
  if (page) {
    page.append(div);
    openSnackbarFinal2(div);
  }
  setTimeout(() => {
    removeOpenSnackbar(div);
  },4000);
}

export function dispatchSnackbarEventHandler(e:CustomEvent<DISPATCH_SNACKBAR_CED>) {
  const severity = e.detail.severity;
  const message = e.detail.message;
  const svg = e.detail.svg;
  switch (severity) {
    case 'success': {
      const svgToUse = svg ? svg : '<svg viewBox="0 0 448 512" title="check" focusable="false" inert tabindex="-1"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>';  
      createAndOpenSnackbarElement(severity,message,svgToUse)
      break;
    }
    case 'info': {
      const svgToUse = svg ? svg : '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="InfoOutlined"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>';
      createAndOpenSnackbarElement(severity,message,svgToUse)
      break;
    }
    case 'error': {
      const svgToUse = svg ? svg : '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CancelOutlined"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"></path></svg>';
      createAndOpenSnackbarElement(severity,message,svgToUse)
      break;
    }
    case 'warning': {
      const svgToUse = svg ? svg : '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="WarningAmberOutlined"><path d="M12 5.99 19.53 19H4.47L12 5.99M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg>';
      createAndOpenSnackbarElement(severity,message,svgToUse)
      break;
    }
    default: {
      console.error("Unrecognized severity DISPATCH_SNACKBAR: "+severity);
      break;
    }
  }
} 


/**
 * Get the parent snackbar and close the snackbar. **The snackbar should
 * be the immedate parent of the button.**
 * @param {Event} _e Click Event
 *
 * @this {HTMLButtonElement} Button
 */
export function closeSnackbar(this:HTMLButtonElement,_e:Event) {
  this.blur();
  const snackbar = this.closest("div.snackbar");
  if ((snackbar instanceof HTMLDivElement) && snackbar.getAttribute("aria-hidden") === "false") {
    removeOpenSnackbar(snackbar);
  }
}

/**
 * Get all snackbars that are open on new new content loaded, and
 * if they have a data-snacktime attribute create a setTimeout function that closes
 * the snackbar after the number of ms specified by `data-snacktime` has ellapsed
 */
export function getOpenSnackbars(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div.snackbar[aria-hidden="false"]'))
  .forEach((snackbar) => {
    if (!!!snackbar.hasAttribute('data-handled')) {
      snackbar.setAttribute('data-handled','');
      openSnackbarFinal2(snackbar,true);
    }
  })
}


/* --------------------------------- SECTION: BUTTONS ------------------------------------ */
function toggleElementFullscreen(element:HTMLElement) {
  if (element.getAttribute('data-fullscreen')==="true") {
    if (document.fullscreenEnabled) {
      document.exitFullscreen()
      .then(() => {
        element.setAttribute('data-fullscreen','false');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: false }}));
        setNavbarOpenClosed(true);
        setPreventNavbarModification(true);
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        setTimeout(() => {
          setPreventNavbarModification(false);
        },100)
      })
      .catch((e) => console.error(e));
    } else if ((document as any).webkitFullscreenEnabled) {
      (document as any).webkitExitFullscreen()
      .then(() => {
        element.setAttribute('data-fullscreen','false');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: false }}));
        setNavbarOpenClosed(true);
        setPreventNavbarModification(true);
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        setTimeout(() => {
          setPreventNavbarModification(false);
        },100)
      })
      .catch((e:string) => console.error(e));
    } else if ((document as any).mozFullScreenEnabled) {
      (document as any).mozCancelFullScreen()
      .then(() => {
        element.setAttribute('data-fullscreen','false');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: false }}));
        setNavbarOpenClosed(true);
        setPreventNavbarModification(true);
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        setTimeout(() => {
          setPreventNavbarModification(false);
        },100)
      })
      .catch((e:string) => console.error(e));
    } else {
      const origWidth = element.getAttribute('data-orig-width');
      const origHeight = element.getAttribute('data-orig-height');
      if (origWidth!=='') element.style.setProperty('width',origWidth);
      if (origHeight!=='') element.style.setProperty('height',origHeight);
      element.setAttribute('data-fullscreen','false');
      document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: false }}));
      setNavbarOpenClosed(true);
      setPreventNavbarModification(true);
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      setTimeout(() => {
        setPreventNavbarModification(false);
      },100)
    }
    return false;
  } else {
    const ua = navigator.userAgent;
    // Check for iOS devices
    const isIOS = /iP(ad|hone|od)/.test(ua);
    // Check for Safari (but not Chrome or Firefox on iOS)
    const isSafari = !!ua.match(/Safari/) && !ua.match(/CriOS|FxiOS|OPiOS/);
    if (isIOS&&isSafari) {
      const origWidth = element.style.getPropertyValue('width');
      const origHeight = element.style.getPropertyValue('height');
      if (origWidth!=='') element.setAttribute('data-orig-width',origWidth);
      if (origHeight!=='') element.setAttribute('data-orig-height',origHeight);
      element.style.setProperty('width','100%','important');
      element.style.setProperty('height','100%','important');
      element.setAttribute('data-fullscreen','true');
      document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: true }}));
    } else if ((element as any).requestFullscreen) {
      element.requestFullscreen()
      .then(() => {
        element.setAttribute('data-fullscreen','true');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: true }}));
      })
      .catch((e) => console.error(e));
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen()
      .then(() => {
        element.setAttribute('data-fullscreen','true');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: true }}));
      })
      .catch((e: string) => console.error(e));
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen()
      .then(() => {
        element.setAttribute('data-fullscreen','true');
        document.dispatchEvent(new CustomEvent<FULLSCREEN_CHANGE_CED>('FULLSCREEN_CHANGE',{ detail: { el: element, fullscreen: true }}));
      })
      .catch((e: string) => console.error(e));
    } else {
      console.error('Unable to request fullscreen');
    }
    return true;
  }
}
function onFullscreenButtonClick(this:HTMLButtonElement,e:Event) {
  const el = this.getAttribute('data-el');
  if (el) {
    const element = document.querySelector(el) as HTMLElement|null;
    const enter = this.querySelector<SVGElement>('svg[data-enter]');
    const exit = this.querySelector<SVGElement>('svg[data-exit]');
    if(element&&enter&&exit){
      const isNowFullscreen = toggleElementFullscreen(element);
      if (isNowFullscreen) {
        enter.setAttribute('hidden','');
        exit.removeAttribute('hidden');
      } else {
        exit.setAttribute('hidden','');
        enter.removeAttribute('hidden');
      }
    }
  }
}
function setFullscreenButtons(docOrEl:Document|Element) {
  const fullscreenButtons = Array.from(docOrEl.querySelectorAll<HTMLButtonElement>('button[data-fullscreen-btn]'));
  fullscreenButtons.forEach(b=>b.addEventListener('click',onFullscreenButtonClick));
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e Click Event
 */
function handleScrollToButtonClick(this: HTMLButtonElement,_e:Event) {
  const scrollToStr = this.getAttribute("data-to");
  if (notNullOrEmptyString(scrollToStr)) {
    if ((scrollToStr as string)[0] === "(") {
      const x = Number(
        scrollToStr?.slice(1, scrollToStr.length - 1)?.split(",")[0]
      );
      const y = Number(
        scrollToStr?.slice(1, scrollToStr.length - 1)?.split(",")[0]
      );
      if (!!!isNaN(x) && !!!isNaN(y)) {
        window.scrollTo(x, y);
      }
    } else {
      try {
        const elToScrollTo = document.querySelector(scrollToStr);
        if(elToScrollTo) elToScrollTo.scrollIntoView();
      } catch (error) {
        console.error(error);
      }
    }
  }
}
/**
 * 1. Get all buttons with the data-scroll attribute
 * 2. When clicked, get the scroll-to attribute on the button
 * 3. **If** the first character in the scroll-to attribute is a parantheses, then treat the string as (x,y) coordinate (with checks), and scroll accordingly
 * 4. Else, querySelector the element and go to there
 */
function setScrollToButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-scroll]")).forEach((btn) => {
    if (btn.hasAttribute('data-mouse')) {
      if(!!!isTouchDevice()) btn.addEventListener("mousedown", handleScrollToButtonClick);
      else btn.addEventListener("touchstart", handleScrollToButtonClick);
    } else {
      btn.addEventListener("click", handleScrollToButtonClick);
    }
  });
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
function copyPrevious(this: HTMLButtonElement,_e:Event) {
  const codeBlock = this.previousElementSibling;
  if (codeBlock) {
    const codeToCopy = (codeBlock as HTMLElement).innerText;
    navigator.clipboard.writeText(codeToCopy);
  }
}
/**
 * 1. Get all buttons that have
 */
function setCopyCodeButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-copy-prev]")).forEach((btn) => {
    btn.addEventListener("click", copyPrevious);
  });
}

/**
 * @this {HTMLButtonElement}
 *
 * @param {Event} _e Click Event
 */
function hideShowContent(this: HTMLButtonElement,_e:Event) {
  const elStr = this.getAttribute("data-el");
  const showMore = this.querySelector("[data-show]");
  const showLess = this.querySelector("[data-hide]");
  const arrow = this.querySelector<HTMLElement>('[data-arrow]');
  if (elStr) {
    try {
      const element = document.querySelector(elStr);
      if (element) {
        const elementIsHidden = element.hasAttribute('hidden');
        if (elementIsHidden) {
          element.removeAttribute('hidden');
          if (showMore && showLess) {
            showMore.setAttribute("hidden", "");
            showLess.removeAttribute("hidden");
          }
          if (arrow) arrow.style.removeProperty('transform');
          if (this.className.includes('success')) {
            this.className = this.className.replace('success','warning');
          }
        } else if (!!!elementIsHidden) {
          element.setAttribute('hidden','');
          if (showMore && showLess) {
            showLess.setAttribute("hidden", "");
            showMore.removeAttribute("hidden");
          }
          if (arrow) arrow.style.setProperty('transform','rotate(180deg)','important');
          if (this.className.includes('warning')) {
            this.className = this.className.replace('warning','success');
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
/**
 * Get all `<button[data-hide-show]>` and add click listeners to them to hide / show content
 */
function setHideShowButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-hide-show]")).forEach((btn) => {
    btn.addEventListener("click", hideShowContent);
  });
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
function copyElement(this: HTMLButtonElement,_e:Event) {
  const elStr = this.getAttribute("data-el");
  if (notNullOrEmptyString(elStr)) {
    const element = document.querySelector(elStr);
    if (element !== null) {
      const innerHTML = element?.getAttribute("data-inner");
      var str = "";
      if (innerHTML !== null) {
        str = element.innerHTML;
      } else {
        str = element.outerHTML;
        if (element.classList.contains("katex-block")) {
          str = str.replace("#copy-math-success-dialog", "#copy-math-success");
        }
      }
      navigator.clipboard.writeText(str);
    }
  }
}
/**
 * Get all `<button data-copy-el>` elements and add a click listener to them to copy the element on click
 */
function setCopyElementButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-copy-el]")).forEach((button) => {
    button.addEventListener("click", copyElement);
  });
}
function removeElementOnClick(this:HTMLButtonElement) {
  const querySelector = this.getAttribute('data-remove-el');
  if (querySelector) {
    try {
      const el = document.querySelector<HTMLElement>(querySelector);
      if (el) {
        safelyRemoveElement(el);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
/**
 * Get all buttons with the `data-remove-el` attribute and  when they are clicked
 * get the element specified by the query string in `data-remove-el`, get that element, and 
 * remove it
 */
function removeElementsButtons(docOrEl:DocOrEl) {
  docOrEl.querySelectorAll('button[data-remove-el]').forEach((b)=>{
    b.addEventListener('click',removeElementOnClick);
  })
}

/* --------------------------------- SECTION: TABS -------------------------------------- */
/**
 * @param {HTMLElement} div div.tabs | div.mobile-stepper
 * @param {number} newTabButtonIndex
 * @param {number} oldTabButtonIndex
 */
function switchTabs(div:HTMLElement, newTabButtonIndex:number, oldTabButtonIndex:number) {
  const backButton = div.querySelector("button[data-step-back]");
  const forwardButton = div.querySelector("button[data-step-forward]");
  const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
  /* @ts-ignore */
  const panels = Array.from(div?.nextElementSibling?.children) as HTMLElement[];
  if (Array.isArray(tabs) && Array.isArray(panels) && tabs.length===panels.length) {
    for (let i = 0; i < tabs.length; i++) {
      if (i !== newTabButtonIndex) {
        tabs[i].setAttribute("tabindex", '-1');
        tabs[i]?.classList?.remove("secondary");
        tabs[i]?.classList?.add("t-secondary");
        tabs[i]?.setAttribute("aria-selected", "false");
        panels[i].setAttribute("tabindex", "0");
        panels[i].setAttribute("hidden", "");
      }
    }
    if (tabs[newTabButtonIndex]) {
      tabs[newTabButtonIndex]?.classList?.add("secondary");
      tabs[newTabButtonIndex]?.classList?.remove("t-secondary");
      panels[newTabButtonIndex]?.removeAttribute("hidden");
      tabs[newTabButtonIndex]?.setAttribute("aria-selected", "true");
      if ((backButton instanceof HTMLButtonElement) && (forwardButton instanceof HTMLButtonElement)) {
        if (oldTabButtonIndex === 0 && newTabButtonIndex !== 0) {
          backButton.removeAttribute("disabled");
        } else if (
          oldTabButtonIndex === tabs.length - 1 &&
          newTabButtonIndex !== tabs.length - 1
        ) {
          forwardButton.removeAttribute("disabled");
        }
        if (newTabButtonIndex === 0) backButton.setAttribute("disabled", "");
        else if (newTabButtonIndex === tabs.length - 1)
          forwardButton.setAttribute("disabled", "");
      }
      /* @ts-ignore */
      tabs[newTabButtonIndex]?.focus();
    }
  }
  const PAGE = document.querySelector('main#PAGE');
  if (PAGE) {
      const tabChange = new CustomEvent('tabChange',{detail: { from: oldTabButtonIndex, to: newTabButtonIndex, wrapper: div }});
      PAGE.dispatchEvent(tabChange);
  }
}

/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
function changeTab(this: HTMLButtonElement,_e:Event) {
  const thisTabAttr = this.getAttribute("data-tab");
  const div = this?.parentElement?.parentElement?.parentElement;
  if ((div instanceof HTMLDivElement) && notNullOrEmptyString(thisTabAttr)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(div?.nextElementSibling?.children);
    var thisTabIndex = null;
    var currentlySelectedIndex = null;
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("data-tab") === thisTabAttr) thisTabIndex = i;
        else if (tabs[i]?.getAttribute("aria-selected") === "true")
          currentlySelectedIndex = i;
        if (thisTabIndex !== null && currentlySelectedIndex !== null) break;
      }
      if (thisTabIndex !== null && currentlySelectedIndex !== null) {
        switchTabs(div, thisTabIndex, currentlySelectedIndex);
      }
    }
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
function goForwardTab(this: HTMLButtonElement,_e:Event) {
  const div = this?.parentElement;
  var currentlySelected = null;
  if ((div instanceof HTMLDivElement)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(div?.nextElementSibling?.children);
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          currentlySelected = i;
          break;
        }
      }
      if (
        currentlySelected !== null &&
        currentlySelected < tabs.length - 1 &&
        currentlySelected >= 0
      )
        switchTabs(div, currentlySelected + 1, currentlySelected);
    }
  }
}
/**
 * @this {HTMLButtonElement}
 * @param {Event} _e
 */
function goBackTab(this: HTMLButtonElement,_e:Event) {
  const div = this?.parentElement;
  var currentlySelected = null;
  if ((div instanceof HTMLDivElement)) {
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore*/
    const panels = Array.from(div?.nextElementSibling?.children);
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          currentlySelected = i;
          break;
        }
      }
      if (
        currentlySelected !== null &&
        currentlySelected > 0 &&
        currentlySelected < tabs.length
      )
        switchTabs(div, currentlySelected - 1, currentlySelected);
    }
  }
}

function handleTabPanelKeydown(this:HTMLElement,e:KeyboardEvent) {
  if (e.altKey&&/^\d+$/.test(e.key)) {
    const num = parseInt(e.key);
    if (!!!isNaN(num)&&isFinite(num)) {
      const tabs = this.previousElementSibling;
      if (tabs&&tabs.classList.contains('tabs')) {
        const tabButtons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
        if (tabButtons.length&&tabButtons[num]) {
          tabButtons[num].click();
          tabButtons[num].scrollIntoView()
        }
      }
    }
  }
}

function setTabKeyboardShortcuts(tabsWrapper:HTMLElement) {
  const panels = tabsWrapper.nextElementSibling;
  if (panels) panels.addEventListener('keydown',handleTabPanelKeydown);
}

/**
 * Set Listeners on `<div class="tabs">` elements
 */
function setTabListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLDivElement>("div.tabs")).forEach((tab) => {
    setTabKeyboardShortcuts(tab);
    tab.addEventListener("keydown", handleTabKeydown);
    const tabs = Array.from(tab.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(tab?.nextElementSibling?.children);
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          panels[i]?.removeAttribute("hidden");
        } else {
          panels[i]?.setAttribute("hidden", "");
        }
        tabs[i].addEventListener("click", changeTab);
      }
    }
  });
}
/**
 * @this {HTMLElement} div.tabs **OR** div.mobile-stepper
 * @param {Event} e
 */
function handleTabKeydown(this: HTMLElement,e:any) {
  var currentlySelected = null;
  const tabs = Array.from(this.querySelectorAll('button[role="tab"]'));
  /* @ts-ignore */
  const panels = Array.from(this?.nextElementSibling?.children);
  if (Array.isArray(tabs) && Array.isArray(panels)) {
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i]?.getAttribute("aria-selected") === "true") {
        currentlySelected = i;
        break;
      }
    }
  }
  if (currentlySelected !== null && tabs.length) {
    switch (e.key) {
      case "ArrowLeft":
        if (currentlySelected !== 0)
          switchTabs(this, currentlySelected - 1, currentlySelected);
        break;
      case "ArrowRight":
        if (currentlySelected !== tabs.length - 1)
          switchTabs(this, currentlySelected + 1, currentlySelected);
        break;
      case "Home":
        e.preventDefault();
        switchTabs(this, 0, currentlySelected);
        break;
      case "End":
        e.preventDefault();
        switchTabs(this, tabs.length - 1, currentlySelected);
        break;
    }
  }
}
/**
 * Set Listeners on `<div class="mobile-stepper">` elements
 */
function setMobileStepperListeners(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLDivElement>("div.mobile-stepper")).forEach((div) => {
    setTabKeyboardShortcuts(div);
    div.addEventListener("keydown", handleTabKeydown);

    const backButton = div.querySelector("button[data-step-back]");
    const forwardButton = div.querySelector("button[data-step-forward]");
    if (forwardButton) {
      forwardButton.addEventListener("click", goForwardTab);
    }
    if (backButton) {
      backButton.addEventListener("click", goBackTab);
    }
    const tabs = Array.from(div.querySelectorAll('button[role="tab"]'));
    /* @ts-ignore */
    const panels = Array.from(div?.nextElementSibling?.children);
    
    var tabIndex = null;
    if (Array.isArray(tabs) && Array.isArray(panels)) {
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i]?.getAttribute("aria-selected") === "true") {
          tabIndex = i;
          panels[i]?.removeAttribute("hidden");
        } else {
          panels[i]?.setAttribute("hidden", "");
        }
        tabs[i].addEventListener("click", changeTab);
      }
      if (backButton && tabIndex === 0) {
        backButton.setAttribute("disabled", "");
      }
      if (forwardButton && tabIndex === tabs.length - 1) {
        forwardButton.setAttribute("disabled", "");
      }
    }
  });
}


/* --------------------------------------------- SECTION: TIME ---------------------------------------- */
/**
 * This assumes that you have a UTC timestamp as your datetime attribute and that you time component either consists
 * of just text or svg + textspan combo
 * @this {HTMLTimeElement}
 *
 * @param {HTMLElement} timeEl
 * @param {boolean} short
 */
function setLocalDate(timeEl:HTMLTimeElement) {
  try {
    const dateTime = timeEl.getAttribute("datetime");
    const timezoneInput = document.getElementById('settings-timezone') as HTMLInputElement;
    const d = dayjs.utc(String(dateTime).replace('T',' ')).tz(timezoneInput?.value || INITIAL_TIME_ZONE);
    const str = d.format(String(timeEl.getAttribute('data-date-format')));
    const span = timeEl.querySelector("span");
    if (span) span.innerText = str;
  } catch (error) {
    console.error(error);
  }
}
/**
 * Get all time elements that have the
 *
 * 1. data-date-short or
 * 2. data-date-long attributes
 *
 * If they have these attributes, set the innerText of the span inside the time element
 *
 */
function setLocalTimes(docOrEl:Document|Element) {
  Array.from(docOrEl.querySelectorAll<HTMLTimeElement>('time')).forEach((el) => {
    if (el.hasAttribute('data-date-format')) setLocalDate(el);
  });
}
/**
 * Call this function whenever the target of an htmx request is the settings form amd when the timexone changes
 */
function onTimezoneChange() {
  const timezoneInput = document.getElementById('settings-timezone') as HTMLInputElement|null;
  if(timezoneInput) {
    const newTimezone = timezoneInput.value;
    if (newTimezone&&(new Set(TIME_ZONES_AVAILABLE)).has(newTimezone as any)) {
      const html = document.querySelector('html');
      if (html) {
        const htmlTimezone = html.getAttribute('data-timezone');
        if(htmlTimezone!==newTimezone) {
          html.setAttribute('data-timezone',newTimezone);
          setLocalTimes(document);
        }
      }
    }
  }
}
/**
 * Listen for timezone change and change all of the time elements 
 */
function listenForTimezoneChange() {
  const input = document.getElementById('settings-timezone') as HTMLInputElement|null;
  if (input) input.addEventListener('change',onTimezoneChange);
}

/* --------------------------------------------- SECTION: LINKS ---------------------------------------- */
/**
 * Disables links that are equal to the current url
 * Enables links that are unequal to current url
 * @param {HTMLAnchorElement} link
 * @param {boolean} subPageTarget
 */
function setLinkDisabled(link:HTMLAnchorElement, subPageTarget:boolean) {
  const currentPathname = window.location.pathname;
  const target = String(link.getAttribute("hx-get"));
  var equal;
  if (subPageTarget) {
    const currentHash = window.location.hash;
    const hashIndex = target.indexOf("#");
    const targetHash = target.slice(hashIndex);
    equal = Boolean(
      targetHash === currentHash &&
        target.slice(0, hashIndex) === currentPathname
    );
  } else {
    equal = Boolean(target === currentPathname);
  }
  if (equal) link.setAttribute("aria-disabled", "true");
  else link.setAttribute("aria-disabled", "false");
}
/**
 * Gets all links and sets their aria-disabled attribute to true if their
 * hx-get is equal to the current url on the page.
 */
function disableLinks() {
  const pageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[hx-target="#PAGE"]')
  );
  const subPageLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[hx-target^="#subpage"]')
  );
  if (Array.isArray(pageLinks))
    pageLinks.forEach((link) => setLinkDisabled(link, false));
  if (Array.isArray(subPageLinks))
    subPageLinks.forEach((link) => setLinkDisabled(link, true));
}

/* --------------------------------------------- SECTION: GENERAL ---------------------------------------- */
/**
 * Stop Propagation of Click Event
 * @param {Event} e Click Event
 */
export function captureClick(e:Event) {
  e.stopPropagation();
}
/**
 * Get All elements that have the data-click-capture attribute and make it so that click events
 * do not propagate past them.
 */
function setClickCapture(docOrEl:DocOrEl) {
  const elements = Array.from(docOrEl.querySelectorAll("*[data-click-capture]"));
  elements.forEach((el) => el.addEventListener("click", captureClick));
  if(!!!isTouchDevice())elements.forEach((el) => el.addEventListener("mousedown", captureClick));
  else elements.forEach((el) => el.addEventListener("touchstart", captureClick));
}
const hasMaps = (docOrEl:DocOrEl) => {
  const normalMaps = Array.from(docOrEl.querySelectorAll('div[id^="google_map"]'));
  const drawMaps  = Array.from(docOrEl.querySelectorAll('div[id^="draw_google_map"]'));
  const circleMaps = Array.from(docOrEl.querySelectorAll('div[id^="circle_google_map"]'));
  return Boolean(normalMaps.length>=1 || drawMaps.length >= 1 || circleMaps.length >= 1)
}
const hasLexicalEditors = (docOrEl:DocOrEl) => {
  const editors = docOrEl.querySelectorAll('div[data-rich-text-editor]');
  return Boolean(editors.length>=1);
}
function hasThreeJSComponents(docOrEl:DocOrEl) {
  const THREE_ACCEPT_FILE_TYPE = ".fbx,.obj,.stl,.3mf,.ply,.3dm,.drc,.gltf,.glb,.ktx2,.mpd,.3dl,.cube,.pmd,.pmx,.vmd,.vpd,.pcd,.pdb,.svg,.tga";
  const THREE_JS_PATHS = new Set<string>(['/projects-archive/three-js-test','/projects/create-three-js-texture'])
  const threeJSComponents = Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div[data-three-js]'));
  const threeJSInputs = Array.from(docOrEl.querySelectorAll(`input[type="file"][accept="${THREE_ACCEPT_FILE_TYPE}"]`));
  const hasIncludeThreeJS = document.getElementById('include-three-js');
  const pathHasThreeJSComponents = THREE_JS_PATHS.has(window.location.pathname);
  return Boolean(threeJSComponents.length ||threeJSInputs.length || pathHasThreeJSComponents||hasIncludeThreeJS);
}
/**
 * Function to clear the innerHTML from an element safely
 * @param targetEl 
 */
export function clearInnerHTML(targetEl: HTMLElement) {
  while (targetEl.hasChildNodes()) {
    targetEl.removeChild(targetEl.firstChild as ChildNode);
  }
}
/**
 * Function that generates the main loader element of a given height and color
 * @param param0 
 * @returns 
 */
export function getLoader({height, color="t-primary"}: {height: number, color: string}) {
  const minHeight = Math.max(height,40).toString().concat('px');
  const id = "rand_".concat(Math.random().toString().slice(2));
  const div = document.createElement('div');
  div.style.cssText = "min-height:".concat(minHeight).concat(';');
  div.className = "flex-row justify-center align-center ".concat(color);
  div.setAttribute('role','progressbar');
  div.setAttribute('aria-busy','false');
  div.setAttribute('id',id);
  const spinner = document.createElement('div');
  spinner.className ="lds-ring";
  for (let i = 0; i < 3; i++) spinner.append(document.createElement('div'));
  div.append(spinner);
  return { element: div, id };
}
/**
 * 
 * @returns boolean Whether or not the device is a touch device
 */
export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (window.navigator.maxTouchPoints > 0) ||
     /* @ts-ignore */
     (window.navigator.msMaxTouchPoints > 0));
}

/* --------------------------------------------- SECTION: DRAWERS ---------------------------------------- */
/**
 * 
 * @param {Event} _e
 */
function closeOpenDrawer(_e:Event){
  const drawer = document.querySelector('.drawer[aria-hidden="false"]');
  if (drawer instanceof HTMLElement) {
    setDrawerHidden(drawer);
  }
}

function setDrawerHidden(drawer:HTMLElement) {
  drawer.setAttribute("aria-hidden", "true");
  document.removeEventListener('click',closeOpenDrawer);

}
function setDrawerOpen(drawer:HTMLElement) {
  drawer.setAttribute("aria-hidden", "false");
  document.addEventListener('click',closeOpenDrawer);
}

/**
 *
 * @param {Event} e Toggle open state of drawer
 */
function toggleDrawer(this:HTMLElement,e:Event) {
  e.stopPropagation(); // stop propogation of click event so that drawer still opens
  const selectorStr = this.getAttribute("data-drawer-el");
  if (selectorStr) {
    const element = document.querySelector(selectorStr);
    if (element instanceof HTMLElement) {
      const ariaHidden = element.getAttribute("aria-hidden");
      if (ariaHidden === "false") {
        setDrawerHidden(element);
      } else if (ariaHidden === "true") {
        setDrawerOpen(element);
      }
    }
  }
}

/**
 * Get all buttons that have the data-drawer attribute and add a click listener to them to set the
 * aria-hidden attribute of the element identified by data-elem to be false/true when clicked
 */
function setDrawerButtons(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll("button[data-drawer-button]")).forEach((btn) => btn.addEventListener("click", toggleDrawer));
}

/**
 * @this {HTMLElement}
 *
 * @param {Event} _e Click Event
 */
function closeDrawer(this:HTMLElement,_e:Event) {
  const drawer = this.closest(".drawer");
  if (drawer) {
    drawer.setAttribute("aria-hidden", "true");
  }
}
/**
 * Get all data-close-drawer elements and add a click listener to them to close the drawer when they are clicked
 */
function setDrawerCloseElements(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll('*[data-close-drawer=""]')).forEach((el) => el.addEventListener("click", closeDrawer));
}

/* ---------------------------------------------- SECTION: SPLIDE --------------------------------------- */
function registerSplideElement(el:HTMLElement) {
  const isMounted = el.getAttribute('data-mounted');
  if (isMounted!=="true") {
    new Splide(el).mount();
    el.setAttribute('data-mounted','true');
  }
}
function customSplideElementListener(e:CustomEvent) {
  const { el } = e.detail;
  if (el && el instanceof HTMLElement && el.classList.contains('splide')) {
    registerSplideElement(el);
  }
}

/**
 * Get all `div.splide` elements on the page and initiate the elements 
 */
function handleSplideElements(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLDivElement>('div.splide')).forEach((el) => registerSplideElement(el));
}



/* ---------------------------------------------- SECTION; HTMX --------------------------------------- */
// COME
/**
 * Set of api endpoints that returns a `<style id="theme-colors">` element which defined custom styles
 * When these api endpoints are called, before request, remove the hx-preserve attribute from the 
 * `<style id="theme-colors">` attributes already in the head so that they can be removed
 */
const CHANGING_SETTINGS_ENDPOINTS = new Set([
  "/api/light-mode-dark-mode", // #application-styles innerHTML
  "/api/settings", // #application-styles innerHTML
  "/api/settings-form-reset", // ##application-styles innerHTML
  "/api/get-settings-and-form" // #application-styles innerHTML
]);

/**
 * 1. If changing the settings, remove the /html`<style id="theme colors/>` from head
 * 2. If we are swapping the innerHTML or the outerHTML of the target, 
 * then set the target to be transparent
 * 3. Set the indicators aria-busy attribute to true if it exists
 * 4. If the element has the dataRemove attribute then set it to hidden
 */
function beforeHTMXRequest(e:CustomEvent) {
  
  const targetEl = e.detail.target;
  if (targetEl.id==="PAGE") {
    setNavbarOpenClosed(true);
  }

  const elementDispatchedRequest = e.detail.elt as HTMLElement;  
  if (elementDispatchedRequest.hasAttribute('data-loading')) {
    const text = elementDispatchedRequest.getAttribute('data-loading'); 
    const loadingDialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
    if (text && typeof text==='string' && loadingDialog) openLoadingDialog(loadingDialog,text)
  }
  const indicatorStr = elementDispatchedRequest.getAttribute("hx-indicator");
  const dataRemove = elementDispatchedRequest.getAttribute("data-remove");
  const swapBehavior = elementDispatchedRequest.getAttribute('hx-swap');
  const apiEndpoint = elementDispatchedRequest.getAttribute("hx-get") || elementDispatchedRequest.getAttribute("hx-post") || elementDispatchedRequest.getAttribute("hx-delete") || elementDispatchedRequest.getAttribute("hx-put");
  
  const isChangingSettings = Boolean(CHANGING_SETTINGS_ENDPOINTS.has(String(apiEndpoint)));
  if (isChangingSettings) {
    const themeColorStyles = document.getElementById("theme-colors");
    if (themeColorStyles) {
      themeColorStyles.removeAttribute("hx-preserve");
      themeColorStyles.setAttribute('data-remove','true');
    }
  }
  if (targetEl) {
    if (targetEl&&(!!!swapBehavior||swapBehavior==='innerHTML'||swapBehavior==='outerHTML')){ 
      targetEl.classList.add('transparent-o');
    }
  }
  if (indicatorStr) {
    const el = document.querySelector(indicatorStr);
    if (el && el.setAttribute) {
      el.setAttribute("aria-busy", "true");
    }
  }
  if (dataRemove !== null) {
    elementDispatchedRequest.setAttribute("hidden", "");
    elementDispatchedRequest.classList.add("hidden");
  }
}

/**
 * 1. Set indicator's aria-busy to false
 * 2. If response status is 205, then reload page
 * 3. If successful:
 * - Hide all open popovers
 * - Handle page change for google maps and file editors
 * - close open dialogs
 * - scroll into view if target string starts with #subpage
 * 4. If not successfull,
 * - unhide hidden elements that were hidden before request
 */
function afterHTMXRequest(e:any) {
  const loadingDialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (loadingDialog && !!!loadingDialog.hasAttribute('hidden')) closeDialog(loadingDialog); 
  const indicatorSelectorStr = e.detail.elt.getAttribute("hx-indicator");
  const indicatorEl = document.querySelector(String(indicatorSelectorStr));
  const dataRemove = e.detail.elt.getAttribute("data-remove");
  const swapBehavior = e.detail.elt.getAttribute('hx-swap');
  const targetStr = e.detail.elt.getAttribute("hx-target");
  const endPoint = e.detail.elt.getAttribute("hx-get") || e.detail.elt.getAttribute("hx-post") || e.detail.elt.getAttribute("hx-delete") || e.detail.elt.getAttribute("hx-put")
  const get = e.detail.target.id;
  
  if (indicatorEl && indicatorEl.setAttribute) {
    indicatorEl.setAttribute("aria-busy", "false");
  }
  
  if(e?.detail?.xhr?.status === 205) window.location.reload();
  
  if (e.detail.successful) {
    if (CHANGING_SETTINGS_ENDPOINTS.has(endPoint)) {
      const responseText = e?.detail?.xhr?.responseText;
      if (typeof responseText ==="string"&&socket) socket.emit('change-settings',{text: responseText, swap: swapBehavior, target: targetStr });
    }

    if (!!get && get==="PAGE") {
      setNavbarOpenClosed(true);
      setPreventNavbarModification(true);
      window.scrollTo(0, 0);
      setTimeout(() => {
        setPreventNavbarModification(false);
      },100);
      if (window.handlePageChangeMediaInputs) window.handlePageChangeMediaInputs();
    }

    if (targetStr&&(targetStr === "#PAGE"||targetStr?.startsWith("#subpage"))) {
      const openDialogs = Array.from(document.querySelectorAll<HTMLDivElement>('div.dialog-wrapper:not([hidden])'));
      openDialogs.forEach((d) => closeDialog(d));
      const targetElement = document.querySelector(targetStr);
      if (targetElement) {
        setNavbarOpenClosed(true);
        setPreventNavbarModification(true);
        targetElement.scrollIntoView();
        setTimeout(() => {
          setPreventNavbarModification(false);
        },100)
      }
      hideOpenPopovers();
    }
    if (targetStr==="#settings-dialog-form"||targetStr==="settings-dialog-form") {
      // Update application size if they are not equal (this maybe important on login)
      const applicationSizeInput = document.getElementById('application-font-size')as HTMLInputElement|null;
      const html = document.querySelector('html');
      if (applicationSizeInput&&html) {
        const num = parseFloat(applicationSizeInput.value);
        const defaultFontSize = parseFloat(String(html.getAttribute('data-default-font-size')));
        if(!!!isNaN(defaultFontSize)&&isFinite(defaultFontSize)&&!!!isNaN(num)&&isFinite(num)&&num>=80&&num<=120) {
          const newFontSize = ((num/100)*(defaultFontSize)).toFixed(2).concat('px');
          if (html.style.fontSize!==newFontSize) html.style.fontSize = newFontSize;
        }
      }
      onTimezoneChange();
    }
    if (CHANGING_SETTINGS_ENDPOINTS.has(e.detail?.pathInfo?.requestPath||'')){
      if (window.editGeographyStyles) window.editGeographyStyles();
      // Update code mirror editors if you need to 
      if (window.codeEditorsThemeChange) window.codeEditorsThemeChange();
      if (window.onLexicalThemeChange) window.onLexicalThemeChange();
    }

    onNewContentLoaded(document);
    setIntersectionObserverTableOfContents();
  } else {
    const targetEl = document.querySelector(targetStr);
    if (targetEl&&(!!!swapBehavior||swapBehavior==='innerHTML'||swapBehavior==='outerHTML')){ 
      targetEl.classList.remove('transparent-o');
    }
    if (dataRemove !== null) {
      (e.detail.elt as HTMLElement).removeAttribute("hidden");
      (e.detail.elt as HTMLElement).classList.remove("hidden");
    }
  }
  
  const removeStyleTags = Array.from(document.querySelectorAll('style[data-remove="true"]'));
  removeStyleTags.forEach((el) => el.remove());
  const targetEl = e.detail.target;
  if ((targetEl as HTMLElement).classList.contains('transparent-o')) targetEl.classList.remove('transparent-o');

}

/**
 * Before HTMX Swap, safely remove any lexical editors or any code editors that are inside the targetEl
 * Close all open popovers that are referenced by elements that will be swapped out
 * @param e 
 */
function beforeHTMXSwap(e:CustomEvent) {
  const target = e.detail.target;
  if (target instanceof HTMLElement) {
    const popoverEls = Array.from(target.querySelectorAll<HTMLElement>('*[data-pelem]'))
    popoverEls.forEach((el)=>{
      const selector = el.getAttribute('data-pelem');
      if (selector) {
        try {
          if (autoUpdateObject[selector]) {
            autoUpdateObject[selector]();
            delete autoUpdateObject[selector]
          }
        } catch (error) {}
      }
    });
    const selectButtons = Array.from(target.querySelectorAll<HTMLButtonElement>('button.select'));
    selectButtons.forEach((b)=>{
      const id = b.getAttribute('data-pelem');
      if (id) {
        closeSelect(id);
      }
    })
    if (window.removeGoogleMaps) window.removeGoogleMaps(target);
    removeEditorsBeforeSwap(target);
  }
}

 
/**
https://htmx.org/events/#htmx:pushedIntoHistory
*/
function pushedIntoHistoryHTMX(e:CustomEvent) {
  const path = String(e.detail.path) || '/';
  updateHistory(!!!BACKWARDS_NAVIGATE,path,INTENTIONAL_NAV_BACK_FORWARD);
  if (INTENTIONAL_NAV_BACK_FORWARD) INTENTIONAL_NAV_BACK_FORWARD = false;
  if (BACKWARDS_NAVIGATE) BACKWARDS_NAVIGATE = false;
  const backButton = document.getElementById('speed-dial-action-2') as HTMLButtonElement|null;
  const forwardButton = document.getElementById('speed-dial-action-3') as HTMLButtonElement|null;
  if (backButton&&forwardButton) {
    if (CURRENT_HISTORY_INDEX===0) {
      if (!!!backButton.hasAttribute('disabled')||!!!backButton.classList.contains('disabled')||backButton.classList.contains('primary')){
        backButton.setAttribute('disabled','');
        backButton.classList.add('disabled');
        backButton.classList.remove('primary');
      }
      if (forwardButton.hasAttribute('disabled')||forwardButton.classList.contains('disabled')||!!!forwardButton.classList.contains('primary')) {
        forwardButton.removeAttribute('disabled');
        forwardButton.classList.add('primary');
        forwardButton.classList.remove('disabled');
      }
    } else if (CURRENT_HISTORY_INDEX===historyURLs.length-1) {
      if (!!!forwardButton.hasAttribute('disabled')||!!!forwardButton.classList.contains('disabled')||forwardButton.classList.contains('primary')){
        forwardButton.setAttribute('disabled','');
        forwardButton.classList.add('disabled');
        forwardButton.classList.remove('primary');
      }
      if (backButton.hasAttribute('disabled')||backButton.classList.contains('disabled')||!!!backButton.classList.contains('primary')) {
        backButton.removeAttribute('disabled');
        backButton.classList.add('primary');
        backButton.classList.remove('disabled');
      }
    } else {
      if (forwardButton.hasAttribute('disabled')||forwardButton.classList.contains('disabled')||!!!forwardButton.classList.contains('primary')) {
        forwardButton.removeAttribute('disabled');
        forwardButton.classList.add('primary');
        forwardButton.classList.remove('disabled');
      }
      if (backButton.hasAttribute('disabled')||backButton.classList.contains('disabled')||!!!backButton.classList.contains('primary')) {
        backButton.removeAttribute('disabled');
        backButton.classList.add('primary');
        backButton.classList.remove('disabled');
      }
    }
  }
  
  disableLinks();
  const formData = new FormData();
  formData.append("X-CSRF-Token",getCsrfToken());
  formData.append('path',window.location.pathname);
  navigator.sendBeacon('/analytics/page-view',formData);
}



function configRequestHTMX(e:CustomEvent) {
  const elementDispatchedRequest = e.detail.elt as HTMLElement|null;
  if(elementDispatchedRequest) {
    const parameters = e.detail.parameters;
    const headers = e.detail.headers;
    if (typeof e.detail.verb==='string' && typeof parameters==='object'&&typeof headers==='object') {
      const INCLUDE_CSRF = Boolean(e.detail.verb.toUpperCase()!=="GET"&&e.detail.verb.toUpperCase()!=="OPTIONS")
      if (INCLUDE_CSRF) {
        headers['X-CSRF-Token'] = getCsrfToken();
        headers['hx-current-path'] = location.pathname;
      } 
    }
  }
}


/* --------------------------------- JAVASCRIPT ------------------------ */
/**
 * Attach shadow roots that are loaded after initial page request 
 * Reference:
 * https://developer.chrome.com/docs/css-ui/declarative-shadow-dom#polyfill
 * @param el 
 */
function attachShadowRoots(el:Document|HTMLElement|ShadowRoot) {
  el.querySelectorAll<HTMLTemplateElement>("template[shadowrootmode]").forEach(template => {
  const mode = template.getAttribute("shadowrootmode");
  const parentNode = template.parentNode as HTMLElement|null;
  if (parentNode&&(mode==="open"||mode==="closed")) {
    const shadowRoot = parentNode.attachShadow({ mode });
    shadowRoot.appendChild(template.content);
    template.remove();
    attachShadowRoots(shadowRoot);
  }
  });
}
/**
 * Function to make sure that we cleanly remove elements from the DOM
 * @param el 
 */
function safelyRemoveElement(el:HTMLElement){
  if (LOADED_LEXICAL) {
    const lexicalEditors =Array.from(el.querySelectorAll<HTMLDivElement>('div.lexical-wrapper'));
    if (window.clearEditor) {
      lexicalEditors.forEach((el) => {
        const id = el.id;
        if (id&&window.clearEditor) window.clearEditor(id);
      })
    }
  }
  if (LOADED_CODE_EDITOR) {
    const codeMirrorEditors = Array.from(el.querySelectorAll<HTMLDivElement>('div[data-editor-wrapper]'));
    if (window.removeCodeMirrorEditor) {
      codeMirrorEditors.forEach((el) => {
        const id = el.id;
        if (id&&window.removeCodeMirrorEditor) window.removeCodeMirrorEditor(id);
      })
    } 
  }
  el.remove();
}

function removeEditorsBeforeSwap(docOrEl:DocOrEl) {
  if (window.unloadLexicalEditorsBeforeSwap) window.unloadLexicalEditorsBeforeSwap(docOrEl);
  if (window.unloadCodeEditorsBeforeSwap) window.unloadCodeEditorsBeforeSwap(docOrEl);
}




var screenHeight = 0;
const speedDial = document.getElementById('speed-dial-main');

function handleViewportResize() {
  if (window.visualViewport&&window.visualViewport.height!==screenHeight) {
    screenHeight = window.visualViewport.height;
    if (speedDial&&screenHeight<550) {
        speedDial.setAttribute('hidden','')
    } else if (speedDial) {
      speedDial.removeAttribute('hidden');
    }
  }
}

/* ------------------------------------ SECTION: JUPYTER NOTEBOOKS ---------------------------------------- */ 
/**
 * When the button is clicked to expand / contract the Jupyter Notebook
 * @param this 
 * @param e 
 */
function onJupyterNotebookButtonClick(this:HTMLButtonElement,e:Event) {
    const state = this.getAttribute('data-state');
    const parent = this.parentElement;
    if ((parent instanceof HTMLDivElement)) {
      const sib = parent.nextElementSibling;
      if ((sib instanceof HTMLDivElement)&&sib.classList.contains('ipynb-output-inner')) {
        switch (state) {
          case '0':
            this.setAttribute('data-state','1');
            sib.setAttribute('data-state','1');
            break;
          case '1':
            this.setAttribute('data-state','2');
            sib.setAttribute('data-state','2');
            break;
          case '2':
            this.setAttribute('data-state','3');
            sib.setAttribute('data-state','3');
            break;
          case '3':
            this.setAttribute('data-state','0');
            sib.setAttribute('data-state','0');
            break;
          default:
            break;
        }
      }
    }
}

function handleJupyterNotebooks(docOrEl:DocOrEl) {
  Array.from(docOrEl.querySelectorAll<HTMLButtonElement>('button[data-ipynb-button]')).forEach((el) => {
    el.addEventListener('click',onJupyterNotebookButtonClick);
  })
}




/* ------------------------------------ SECTION: SOCKET ---------------------------------------- */ 

function getHandleAcknowledgementNotificationCallback(wrapper:HTMLDivElement,notifications_div:HTMLDivElement) {
  const func = function () {
    wrapper.remove();
    const current_ids = new Set(
      Array.from(notifications_div.querySelectorAll('div[data-notification]'))
      .map((el) => el.getAttribute('data-notification-id'))
      .filter((s) => typeof s==="string")
      .map((s) => parseInt(s as string))
      .filter((s) => Number.isInteger(s))
    );
    if (current_ids.size===0) {
      notifications_div.innerHTML = EMPTY_NOTIFICATIONS_HTML
    }
  }
  return func;
}
function handleAcknowledgeNotification(this:HTMLButtonElement,e:Event) {
  const notifications_div = <HTMLDivElement>document.getElementById("notifications-div");
  const wrapper = <HTMLDivElement>this.closest('div[data-notification]');
  if (wrapper&&notifications_div) {
    const id = wrapper.getAttribute('data-notification-id');
    if (id&&Number.isInteger(parseInt(id))&&parseInt(id)>0&&socket) {
      socket.emit("acknowledge-notification",parseInt(id),getHandleAcknowledgementNotificationCallback(wrapper,notifications_div));
    }
  }
}
function handleNotificationsFromSocket(json:FrankmBrownNotification[]) {
  const spinner = document.getElementById('notification-spinner');
  if (spinner) spinner.setAttribute('hidden','');
  const notifications_div = <HTMLDivElement>document.getElementById("notifications-div");
  try {
    if (Array.isArray(json)&&notifications_div) {
      const current_ids = new Set(
        Array.from(notifications_div.querySelectorAll('div[data-notification]'))
        .map((el) => el.getAttribute('data-notification-id'))
        .filter((s) => typeof s==="string")
        .map((s) => parseInt(s as string))
        .filter((s) => Number.isInteger(s))
      );
      if (current_ids.size===0&&json.length===0) {
        notifications_div.innerHTML = EMPTY_NOTIFICATIONS_HTML;
      } else if (current_ids.size===0&&json.length!==0) {
        notifications_div.innerHTML = '';
      }
      for (let obj of json) {
        if (typeof obj.html ==="string" && typeof obj.id==="number" && !!!current_ids.has(obj.id)) {
          notifications_div.insertAdjacentHTML("afterbegin",obj.html);
        }
        Array.from(notifications_div.querySelectorAll('button[data-notif-acknowledge]'))
        .forEach((b) => {
          b.addEventListener('click',handleAcknowledgeNotification);
        })
        htmx.process(notifications_div);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function onSocketConnect() {
  const connectedSpan = document.getElementById('notification-connected-span');
  const disconnectedSpan = document.getElementById('notification-disconnected-span');
  if(disconnectedSpan&&connectedSpan) {
    disconnectedSpan.setAttribute('hidden','');
    connectedSpan.removeAttribute('hidden');
  }
}
function onSocketDisconnect(description:string) {
  // console.error("Socket Disconnect: " + description);
  const spinner = document.getElementById('notification-spinner');
  if (spinner) spinner.setAttribute('hidden','');
  const connectedSpan = document.getElementById('notification-connected-span');
  const disconnectedSpan = document.getElementById('notification-disconnected-span');
  if(disconnectedSpan&&connectedSpan) {
    connectedSpan.setAttribute('hidden','');
    disconnectedSpan.removeAttribute('hidden');
  }
  if (NOTIFICATIONS_TIMEOUT) {
    clearTimeout(NOTIFICATIONS_TIMEOUT);
  }
  setTimeout(() => {
    if (socket) socket.connect();
  }, 1000);
}
function onSocketConnectError() {
  // console.error("Socket Connection Error");
  setTimeout(() => {
    if (socket) socket.connect();
  }, 1000);
}
function handleLoginSocket(obj:{ changeMode: boolean }) {
  const application_styles = document.getElementById('application-styles');
  if (obj.changeMode&&application_styles) htmx.ajax('get','/api/light-mode-dark-mode',{ target: application_styles, swap: 'innerHTML' });
  const settingsStylesDiv = document.getElementById('settings-styles-div');
  if (settingsStylesDiv) htmx.ajax('get','/components/settings-styles',{ target: settingsStylesDiv, swap: 'innerHTML' })
  const settings_dialog_form = document.getElementById('settings-dialog-form');
  if (settings_dialog_form) htmx.ajax('get','/api/settings-form',{ target: settings_dialog_form, swap: 'outerHTML' });
  setTimeout(() => {
    const navigationSideBar = document.getElementById('navigation-sidebar-wrapper');
    if (navigationSideBar) htmx.ajax("get",'/components/navigation-sidebar',{ target: navigationSideBar, swap: 'outerHTML' })
  },100)
  
}
function handleLogoutSocket() {
  setTimeout(() => {
    const navigationSideBar = document.getElementById('navigation-sidebar-wrapper');
    if (navigationSideBar) htmx.ajax("get",'/components/navigation-sidebar',{ target: navigationSideBar, swap: 'outerHTML' })
  },100)
}
function handleChangeSettings(obj:{ text: string, swap: 'innerHTML'|'outerHTML', target: string }) {
  if (typeof obj.text==="string"&&typeof obj.target==="string"&&(obj.swap==="innerHTML"||obj.swap==="outerHTML")) {    
    htmx.swap(obj.target,obj.text,{ swapStyle: obj.swap, swapDelay: 10, transition: false, ignoreTitle: true, head: undefined, settleDelay: 10 });
  }
}


async function handleNotificationClick() {
  try {
    const newPermission = await Notification.requestPermission();
    if (newPermission==="granted") {
      onAcceptedNotifications()
      .catch((e) => {
        console.error(e);
      })
    }
  } catch (e) {
    console.error(e);
  }
}

function getNotifications() {
  const spinner = document.getElementById('notification-spinner');
  if (socket&&socket.active&&spinner) {
    spinner.removeAttribute('hidden');
    socket.emit("get-notifications",undefined,handleNotificationsFromSocket);
  }
}

async function handleNotifications() {
  var ip_id_exists = checkIpIdExists();
  while (!!!ip_id_exists) {
    await delay(500);
    ip_id_exists = checkIpIdExists();
  }
  socket = io();
  window.socket = socket;
  socket.on("changed-settings",handleChangeSettings);
  socket.on('logout',handleLogoutSocket);
  socket.on('login',handleLoginSocket);
  socket.on('connect',onSocketConnect);
  socket.on('disconnect',onSocketDisconnect);
  socket.on('connect_error',onSocketConnectError);
  socket.on('ai-chat',onAIChatResponse);
  const b = <HTMLButtonElement|null>document.getElementById('subscribe-to-notifications');
  if ("Notification" in window) {
    const currentPermission = Notification.permission;
    if (currentPermission!=='default') {
      if (currentPermission==="granted") {
        onAcceptedNotifications()
        .catch((e) => {
          console.error(e);
        })
      }
      if (b) b.remove();
    } else if (b) b.addEventListener('click',handleNotificationClick);
  } else {
    if (b) b.remove();
  }
  if (socket.active) {
    getNotifications();
  }
  NOTIFICATIONS_TIMEOUT = setInterval(() => {
    getNotifications();
  },ONE_MINUTE);
}

function handleServiceWorkerMessage(e:WorkboxMessageEvent) {
  const data = e.data;
  const type = data?.type;
  const message = data?.message;
  switch (type) {
    case 'error-snackbar': {
      if (message) document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: String(message) }}))
      break;
    }
    default: {
      console.error("Unrecognized Message from Service Worker:",type);
      break;
    }
  }
}


async function registerServiceWorker() {
  var ip_id_exists = checkIpIdExists();
  while (!!!ip_id_exists) {
    await delay(500);
    ip_id_exists = checkIpIdExists();
  }
  if ('serviceWorker' in navigator) {
    try {
      const {Workbox} = await import('workbox-window');
      wb = new Workbox('/firebase-messaging-sw.js',{ scope: '/'});
      const onFailRegister = (e:any) => {
        console.error("Service Worker Failed to Register.");
        console.error(e);
      }
      const serviceWorkerRegistration = await wb.register().catch(onFailRegister);
      if (wb && wb.addEventListener) wb.addEventListener('message',handleServiceWorkerMessage);
      if (wb) {
        console.log(serviceWorkerRegistration);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

/* ------------------------------------ SECTION: FIREBASE ---------------------------------------- */ 

onMessage(messaging,(payload) => {
  const notification = payload.notification as NotificationType;
  const notification_options = {...notification, title: undefined};
  new Notification(notification.title,notification_options);
})

// https://firebase.google.com/docs/cloud-messaging/js/client
async function onAcceptedNotifications() {
  try {
    const currentToken = await getToken(messaging,{ vapidKey: "BHJHrH0m3xyT8BRpql_H19f4Ze-HKhjY4DgoNrtW2384_dUph3LK-HfRQKXUMvMf3I99LNqY7rfCWHtxjO-uE48" });
    if (currentToken) {
      const body = JSON.stringify({ token: currentToken });
      fetch('/api/firebase-token',{ method: 'POST', headers: { "Content-Type": "application/json", 'X-CSRF-Token': getCsrfToken() }, body })
      .then((res) => {
        if (res.status!==200) throw new Error(res.status.toString());
      })
      .catch((e) => {
        console.error(e);
      })
    } else {
      document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: String("Something went wrong registering push notifications!") }}))
    }
  } catch (e) {
    console.error("Something went wrong after accepting notifications.");
    console.error(e);
  }
}

/* ------------------------------------ SECTION: AI CHAT ---------------------------------------- */ 
var CURRENT_CHAT_MESSAGE_ID:string|null = null;
const NEXT_MESSAGE_LEXICAL_STATE = {
  "root": {
   "children": [
    {
     "children": [
      {
       "detail": 0,
       "format": 0,
       "mode": "normal",
       "style": "font-weight: 500",
       "text": "E",
       "type": "text",
       "version": 1
      },
      {
       "detail": 0,
       "format": 0,
       "mode": "normal",
       "style": "",
       "text": "nter your next message here...",
       "type": "text",
       "version": 1
      }
     ],
     "direction": "ltr",
     "format": "left",
     "indent": 0,
     "type": "paragraph",
     "version": 1,
     "first_element": false,
     "blockStyle": {
      "textAlign": "left",
      "backgroundColor": "transparent",
      "textColor": "inherit",
      "margin": [
       "6px",
       "0px"
      ],
      "padding": "0px",
      "borderRadius": "0px",
      "borderColor": "transparent",
      "borderWidth": "0px",
      "borderType": "none",
      "boxShadowOffsetX": "0px",
      "boxShadowOffsetY": "0px",
      "boxShadowBlurRadius": "0px",
      "boxShadowSpreadRadius": "0px",
      "boxShadowInset": false,
      "boxShadowColor": "transparent"
     }
    }
   ],
   "direction": "ltr",
   "format": "",
   "indent": 0,
   "type": "root",
   "version": 1
  }
};

function appendUserAiChatQuery(dom:string,toAppend:HTMLElement) {
  const uuid = window.crypto.randomUUID();
  const fieldset = document.createElement('fieldset');
  fieldset.setAttribute('role','none');
  fieldset.className="response-ai-chat user";
  fieldset.insertAdjacentHTML("afterbegin",`<legend role="none" class="flex-row align-center gap-1"><span>User</span> <svg class="ai-chat" viewBox="0 0 448 512" title="user" focusable="false" inert tabindex="-1"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"></path></svg></legend>
<div class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="ai-chat-response-${uuid}">${dom}</div>`);
  toAppend.insertAdjacentElement("beforeend",fieldset);
  document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: fieldset }}));
}

function appendAiChatQuery(dom:string,toAppend:HTMLElement) {
  
  var modelEl = document.getElementById('ai-writer-model-input') as HTMLInputElement|null;
  while (!!!modelEl) {
    setTimeout(() => {
      modelEl = document.getElementById('ai-writer-model-input') as HTMLInputElement|null;
    },500)
  }
  const model = modelEl.value;
  if (CURRENT_CHAT_MESSAGE_ID) {
    var svg = '';
    var className = '';
    var modelProviderName = '';
    if (model.includes('meta-llama')) {
      modelProviderName = 'Meta';
      svg = `<svg class="ai-chat" viewBox="0 0 640 512" title="meta" focusable="false" inert="" tabindex="-1"><path d="M640 317.9C640 409.2 600.6 466.4 529.7 466.4C467.1 466.4 433.9 431.8 372.8 329.8L341.4 277.2C333.1 264.7 326.9 253 320.2 242.2C300.1 276 273.1 325.2 273.1 325.2C206.1 441.8 168.5 466.4 116.2 466.4C43.42 466.4 0 409.1 0 320.5C0 177.5 79.78 42.4 183.9 42.4C234.1 42.4 277.7 67.08 328.7 131.9C365.8 81.8 406.8 42.4 459.3 42.4C558.4 42.4 640 168.1 640 317.9H640zM287.4 192.2C244.5 130.1 216.5 111.7 183 111.7C121.1 111.7 69.22 217.8 69.22 321.7C69.22 370.2 87.7 397.4 118.8 397.4C149 397.4 167.8 378.4 222 293.6C222 293.6 246.7 254.5 287.4 192.2V192.2zM531.2 397.4C563.4 397.4 578.1 369.9 578.1 322.5C578.1 198.3 523.8 97.08 454.9 97.08C421.7 97.08 393.8 123 360 175.1C369.4 188.9 379.1 204.1 389.3 220.5L426.8 282.9C485.5 377 500.3 397.4 531.2 397.4L531.2 397.4z"></path></svg>`;
      className = "meta";
    } else if (model.includes('qwen')) {
      svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`;
      className = 'qwen';
      modelProviderName = 'Qwen';
    } else if (model.includes('google')) {
      svg = `<svg class="ai-chat" viewBox="0 0 488 512" title="google" focusable="false" inert="" tabindex="-1"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>`;
      className = 'google';
      modelProviderName = 'Google';
    } else if (model.includes('mistralai')) {
      svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em"><path d="M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z"></path><path d="M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z"></path><path d="M3.428 10.258h17.144v3.428H3.428v-3.428z"></path><path d="M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z"></path><path d="M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z"></path></svg>`;
      className = 'mistral';
      modelProviderName = 'Mistral';
    } else if (model.includes('anthropic')) {
      svg = '<svg class="ai-chat" xmlns:x="ns_extend;" xmlns:i="ns_ai;" xmlns:graph="ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 92.2 65" xml:space="preserve"> <path d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z   M24.3,39.3l8.8-22.8l8.8,22.8H24.3z"></path></svg>';
      className = "anthropic";
      modelProviderName = "Anthropic";
    } else if (model.includes('amazon')) {
      svg = `<svg class="ai-chat" viewBox="0 0 448 512" title="amazon" focusable="false" inert="" tabindex="-1"><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"></path></svg>`;
      className = 'amazon';
      modelProviderName = 'Amazon';
    } else {
      svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" focusable="false" inert=""><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path></svg>`;
      className = 'openai';
      modelProviderName = 'OpenAI';
    }
    const fieldset = document.createElement('fieldset');
    fieldset.setAttribute('role','none');
    fieldset.className=`response-ai-chat ai ${className}`;
    fieldset.insertAdjacentHTML("afterbegin",`<legend role="none" class="flex-row align-center gap-1"><span>${modelProviderName} (${model})</span> ${svg}</legend><div class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="${CURRENT_CHAT_MESSAGE_ID}">${dom}</div>`);
    toAppend.insertAdjacentElement("beforeend",fieldset);
    document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: fieldset }}));
  }
}

function updateAiChat(html_string:string) {
  if (CURRENT_CHAT_MESSAGE_ID&&window.updateLexicalInstanceWithHtml) {
    window.updateLexicalInstanceWithHtml(CURRENT_CHAT_MESSAGE_ID,html_string);
    const chatBody = document.getElementById('ai-chat-body');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
  }
}

function appendErrorToAiChatDialog(message:string) {
  const error = `<div style="max-width: max(95%,600px); margin-left: auto; margin-top: 6px;">
    <div class="alert error filled small icon" role="alert">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CancelOutlined"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"></path></svg>
        <p class="alert">
          ${message}  
        </p>
      </div>
</div>`
  const chatBody = document.getElementById('ai-chat-body');
  if (chatBody) chatBody.insertAdjacentHTML("beforeend",error);
}

async function handleAIChatButtonClick(this:HTMLButtonElement,e:Event) {
  if (this.classList.contains('success')) {
    if (window.editorToChatMessage) {
      const { markdown, html } = await window.editorToChatMessage('ai-chat-editor');
      if (markdown.length&&window.socket&&html.length) {
        window.socket.emit('ai-chat',{ markdown, html },({ error, message, id, chat_name, chat_id }:{error:boolean,message:string, id?:string, chat_name?: string, chat_id?: string }) => {
          if (error) {
            appendErrorToAiChatDialog(message);
          } else if (id) {
            CURRENT_CHAT_MESSAGE_ID = id;
            const chatBody = document.getElementById('ai-chat-body');
            if (chatBody) appendUserAiChatQuery(html,chatBody);
            if (chatBody) appendAiChatQuery('<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><br/></p>',chatBody);
            this.classList.remove('success');
            this.classList.add('warning');
            this.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>PAUSE`;
            const newChatButton = document.getElementById('new-ai-chat-dialog-button');
            if (newChatButton) newChatButton.setAttribute('disabled','');
            if (chat_name&&chat_id) {
              const currentAIChatNameSpan = document.getElementById('current-ai-chat-name');
              const currentChatInput = document.getElementById('ai-chat-select-input') as HTMLInputElement|null;
              const currentChatNameSelectedButton = Array.from(document.querySelectorAll('#ai-chat-select-dropdown button[aria-selected="true"]'));
              const aiSelectDropdown = document.getElementById('ai-chat-select-dropdown');
              if (currentAIChatNameSpan) currentAIChatNameSpan.innerText = chat_name;
              if (currentChatInput) currentChatInput.value = chat_id;
              currentChatNameSelectedButton.forEach((button) => button.setAttribute('aria-selected','false'));
              if (aiSelectDropdown) {
                const newButton = document.createElement('button');
                newButton.setAttribute('type','button');
                newButton.setAttribute('tabindex','-1');
                newButton.setAttribute('class','select-option');
                newButton.setAttribute('role','option');
                newButton.setAttribute('aria-selected','true');
                newButton.setAttribute('data-val',chat_id);
                newButton.innerText = chat_name;
                aiSelectDropdown.append(newButton);
              }
              if (window.setEditorState) {
                window.setEditorState('ai-chat-editor',NEXT_MESSAGE_LEXICAL_STATE);
              }
            }
          }
        })
      }
    }
  } else {
    if (window.socket&&CURRENT_CHAT_MESSAGE_ID) {
      window.socket.emit('ai-chat-end',{ message_id: CURRENT_CHAT_MESSAGE_ID },({error, message_id}:{error:boolean, message_id: string}) => {
        if (!!!error) {
          this.classList.remove('warning');
          this.classList.add('success');
          this.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT`;
          if (message_id===CURRENT_CHAT_MESSAGE_ID) CURRENT_CHAT_MESSAGE_ID = null;
          const newChatButton = document.getElementById('new-ai-chat-dialog-button');
          if (newChatButton) newChatButton.removeAttribute('disabled');
        }
      })
    }
  }
}

function onNewAiChat() {
  if (window.socket) {
    window.socket.emit('new-ai-chat',undefined,({error}:{error:boolean}) => {
      if (!!!error) {
        const chatBody = document.getElementById('ai-chat-body');
        if (chatBody) chatBody.innerHTML=`<div style="margin-top:6px;" class="text-align-center"><p class="body1 bold text-align-center" style="max-width: 600px; margin: auto;">Welcome to Frank's AI Chat. Edit the Model you want to use in the settings dialog.Chat with the model using the textbox below. <br> <mark class="bold">NOTE:</mark> Users are limited to $1 per day in chat-related costs, though this is actually a lot of messages.</p></div>`;
        const currentAIChatNameSpan = document.getElementById('current-ai-chat-name');
        const currentChatInput = document.getElementById('ai-chat-select-input') as HTMLInputElement|null;
        const currentChatNameSelectedButton = Array.from(document.querySelectorAll('#ai-chat-select-dropdown button[aria-selected="true"]'));
        if (currentAIChatNameSpan) currentAIChatNameSpan.innerText = "Select AI Chat";
        if (currentChatInput) currentChatInput.value = '';
        currentChatNameSelectedButton.forEach((button) => button.setAttribute('aria-selected','false'));
        if (window.setEditorState) {
          window.setEditorState('ai-chat-editor',NEXT_MESSAGE_LEXICAL_STATE);
        }
      }
    })
  }
}
function onCopyAiChatLink() {
  if (window.socket) {
    window.socket.emit('copy-ai-chat',undefined,({error, chat_url}:{error: Boolean, chat_url: string}) => {
      if (error) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR', { detail: { severity: "error", message: "Something went wrong getting the chat url." }}));
      } else {
        navigator.clipboard.writeText(chat_url)
        .then(() => {
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR', { detail: { severity: "success", message: "Copied chat URL to clipboard!" }}));
        })
      }
    })
  }
}
function handleAIChatChange(this:HTMLInputElement,e:Event) {
  const val = this.value;
  if (window.socket) {
    window.socket.emit('change-ai-chat',{ new_chat_id: val },({ error, new_chat_html }:{ error: boolean, new_chat_html: string }) => {
      const chatBody = document.getElementById('ai-chat-body');
      if (error||!!!chatBody) {
        document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail:{severity:"error", message: "Something went wrong changing the ai chat. Try reloading the page."}}));
      } else {
        chatBody.innerHTML = new_chat_html;
      }
    })
  }
}
async function handleAIChatDialog(){
  var ai_chat_editor = document.getElementById('ai-chat-editor');
  while (!!!ai_chat_editor) {
    await delay(500);
    ai_chat_editor = document.getElementById('ai-chat-editor');
  }
  const submitButton = document.getElementById('submit-ai-chat-dialog-button');
  if (submitButton) {
    submitButton.addEventListener('click',handleAIChatButtonClick);
  }
  const newChatButton = document.getElementById('new-ai-chat-dialog-button');
  if (newChatButton) {
    newChatButton.addEventListener('click',onNewAiChat);
  }

  const copyLinkButton = document.getElementById('copy-ai-chat-link');
  if (copyLinkButton) {
    copyLinkButton.addEventListener('click',onCopyAiChatLink);
  }
  const selectInput = document.getElementById('ai-chat-select-input');
  if (selectInput) {
    selectInput.addEventListener('change',handleAIChatChange);
  }
}

async function onAIChatResponse(obj:{message_id: string, markdown: string, end: boolean }) {
  const html = await markdownToHTMLAi(obj.markdown);
  updateAiChat(html);
  if (obj.end) {
    if (obj.message_id===CURRENT_CHAT_MESSAGE_ID) {
      CURRENT_CHAT_MESSAGE_ID = null;
      const submitButton = document.getElementById('submit-ai-chat-dialog-button');
      if (submitButton) {
        submitButton.classList.remove('warning');
        submitButton.classList.add('success');
        submitButton.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT`;
      }
      const newChatButton = document.getElementById('new-ai-chat-dialog-button');
      if (newChatButton) newChatButton.removeAttribute('disabled');
    }
    if (window.setEditorState) {
      window.setEditorState('ai-chat-editor',NEXT_MESSAGE_LEXICAL_STATE);
    }
  }
}


/* ------------------------------------ SECTION: ON NEW CONTENT ---------------------------------------- */ 

/**
 * Function to call whenever new content is loaded
 */
export function onNewContentLoaded(el:Document|HTMLElement=document) {
  try {
    /* set data hx attributes */
    /* Dialogs */
    setDialogOpenButtons(el);
    setDialogCloseOnBackdropClick(el);
    setDialogCloseButtons(el);
    /* Alerts */
    setCloseAlertsButtons(el);
    /* Accordions (Details / Summaries) */
    setSummariesOnClickEvents(el);
    /* Inputs (All - includes textareas and chips) */
    setInputListeners(el);
    setPasswordToggleButtons(el);
    copyInputButtons(el);
    regenerateInputValueButtons(el);
    setIncreaseButtonsListeners(el);
    setDecreaseButtonsListeners(el);
    setToggleButtonGroups(el);
    setComboboxListeners(el);
    setFormReset(el);

    /* Menus, tooltips, dropdowns, snackbars */
    setPopoverListeners(el);
    setSnackbarListeners(el);
    getOpenSnackbars(el);

    /* Buttons */
    setFullscreenButtons(el);
    setScrollToButtons(el);
    
    handleNavigateHistoryButtons(el);

    setCopyCodeButtons(el);
    setCopyElementButtons(el);
    setHideShowButtons(el);
    removeElementsButtons(el);
    
    /* Tabs */
    setMobileStepperListeners(el);
    setTabListeners(el);

    /* Time */
    setLocalTimes(el);
    listenForTimezoneChange();

    /* Images, Audio, Video */
    setImagesOnClick(el);
    setAudioListeners(el);
    setVideoListeners(el);

    /* Other */
    setClickCapture(el);
    setDrawerButtons(el);
    setDrawerCloseElements(el);
    handleSplideElements(el);

    

    disableLinks();

    if (!!!isTouchDevice()) detectSinglePageApplicationDesktop();
    else detectSpaMobile();

    setSocialMediaShareButtons();
    attachShadowRoots(el);
    
    handleJupyterNotebooks(el);

    const butt = Array.from(el.querySelectorAll('button')).filter(b => b.getAttribute('type')!=='submit' && b.type!=='button');
    butt.forEach((but)=>but.setAttribute('type','button'));

    setFileDragListeners(el);

    /* Custom */
    custom.onNewContentLoaded(el);


    const lightModeDarkModeButton = document.getElementById("light-mode-dark-mode");
    if (lightModeDarkModeButton && (lightModeDarkModeButton instanceof HTMLButtonElement)) {
      lightModeDarkModeButton.addEventListener("click",custom.setLightMode);
    }

    /* Google Maps */
    PAGE_HAS_MAPS = hasMaps(el);
    if (PAGE_HAS_MAPS) {
      setTimeout(() => {
        MAPS_PAGES_SET.add(window.location.pathname as string);
      },100);
      if (window.setGoogleMaps) window.setGoogleMaps(el);
      else {
        loadModuleGoogleMaps()
        .then((res) => {
          LOADED_GOOGLE_MAPS=true;
          res.setGoogleMaps(el);
        })
        .catch((e) => {
          console.error(e);
        })
      }
    }

    /* Lexical */
    PAGE_HAS_EDITORS = hasLexicalEditors(el);
    if (PAGE_HAS_EDITORS) {
      loadModuleLexical()
      .then((res) => {
        LOADED_LEXICAL = true;
        res.setEditors(el);
      })
      .catch((error) => {
        console.error(error);
      })
    } 

    
    const imageUpload = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="file"][data-image-input]'));
    const audioUpload = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="file"][data-audio-input]'));
    const videoUpload = Array.from(el.querySelectorAll<HTMLInputElement>('input[type="file"][data-video-input]'));
    if (imageUpload.length || audioUpload.length || videoUpload.length) {
      loadModuleMediaUpload()
      .then((res) => {
        LOADED_MEDIA=true;
        res.setFileUploadListeners()
      })
      .catch((e) => {
        console.error(e);
      })
    } else {
      if (LOADED_MEDIA) {
        loadModuleMediaUpload().then((res) => {
          LOADED_MEDIA=true;
          res.setFileUploadListeners();
        })
        .catch((e)=>{
          console.error(e);
        })
      }
    }

    const dragElements = Array.from(document.querySelectorAll('[data-drag-el]'));
    if (dragElements.length) {
      loadModuleDragDrop()
      .then((module) => {
        LOADED_DRAG_DROP = true;
        module.default();
      })
      .catch((err) => console.error(err))
    }
    const codeMirrorEditors = Array.from(document.querySelectorAll('div[data-codemirror]'))
    if (codeMirrorEditors.length||!!!LOADED_CODE_EDITOR) {
      loadModuleCodeEditors()
      .then((res)=>{
        LOADED_CODE_EDITOR = true;
        res.setAllCodeMirrorEditors();
      })
      .catch((error)=>{
        console.error(error);
      })
    } else if (!!!codeMirrorEditors.length&&LOADED_CODE_EDITOR) {
      loadModuleCodeEditors()
      .then((res)=>{
        res.onUnloadCodeMirrorEditors();
      })
      .catch((error)=>{
        console.error(error);
      })
    }

    const articleBuilderFinalForms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-article-builder-final]'));
    if (articleBuilderFinalForms.length) {
      loadModuleArticleBuilder3()
      .then((res) => {
        LOADED_ARTICLE_BUILDER_3 = true;
        res.onLoadArticleBuilderFinal();
      })
      .catch((e) => {
        console.error(e);
      })
    } else if (LOADED_ARTICLE_BUILDER_3) {
      loadModuleArticleBuilder3()
      .then((res) => {
        res.onUnloadArticleBuilder()
      })
      .catch((e) => {
        console.error(e);
      })
    }

    const articleBuilderForms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-article]'));
    if (articleBuilderForms) {
      loadArticleBuilder()
      .then((res) => {
        res.onLoadArticleBuilder();
        LOADED_ARTICLE_BUILDER=true;
      })
      .catch((e) => {
        console.error(e);
      })
    } else if (LOADED_ARTICLE_BUILDER) {
      loadArticleBuilder()
      .then((res) => {
        res.onUnloadArticleBuilder();
      })
      .catch((e) => {
        console.error(e);
      })
    }

    const warnFormElement = document.querySelector('div[data-warn-form-progress]');
    if (warnFormElement) {
      loadModuleWarnUsersNavigate()
      .then((res) => {
        LOADED_WARN_USERS_NAVIGATE=true;
        res.runWarnNavigateAway();
      })
      .catch((e) => console.error(e))
    } else if (LOADED_WARN_USERS_NAVIGATE) {
      loadModuleWarnUsersNavigate()
      .then((res) => {
        LOADED_WARN_USERS_NAVIGATE=true;
        res.runWarnNavigateAway();
      })
      .catch((e) => console.error(e))
    }

    /* Page Specific */
    const path = window.location.pathname;
    if(path==='/projects/article-builder'||path==='/projects/article-builder-2') {
      loadModuleArticleBuilder()
      .then((article_builder_module) => {
        LOADED_ARTICLE_BUILDER = true;
        if(path==='/projects/article-builder') {
          article_builder_module.onArticleBuilder();
        } else if (path==='/projects/article-builder-2') {
          article_builder_module.onArticleBuilder2();
        } 
      })
      .catch((err) => console.error(err))
    } else if (LOADED_ARTICLE_BUILDER) {
      loadModuleArticleBuilder()
      .then((article_builder_module) => {
        article_builder_module.onArticleBuilderUnload();
      })
      .catch((err) => console.error(err))
    }
    
    if(path==="/projects/create-a-survey"){
      loadModuleCreateSurvey()
      .then((res) => {
        LOADED_CREATE_SURVEY=true;
        res.onSurveyLoad();
      })
    } else {
      if (LOADED_CREATE_SURVEY) {
        loadModuleCreateSurvey()
        .then((res) => {
          LOADED_CREATE_SURVEY=true;
          res.onSurveyUnload();
        })
      }
    }
    
    if(path==='/projects/html-to-javascript'){
      loadModuleHTMLToJavascript()
      .then((res) => {
        LOADED_HTML_JAVASCIPT=true;
        res.default();
      })
      .catch((e) => console.error(e));
    }
    
    if(path==='/projects/create-svg') {
      loadModuleCreateSvg()
      .then((res) => {
        LOADED_CREATE_SVG=true;
        res.onPixiLoad();
      })
      .catch((err) => console.error(err))
    } else if (LOADED_CREATE_SVG) {
      loadModuleCreateSvg()
      .then((res) => {
        LOADED_CREATE_SVG=true;
        res.onPixiUnload();
      })
      .catch((err) => console.error(err))
    }

    if (path==='/projects/create-gradient') {
      loadModuleCreateGradient()
      .then((res) => {
        LOADED_CREATE_GRADIENT = true;
        res.onLoadCreateGradient();
      })
      .catch((error) => console.error(error));
    }

    if (path==='/projects/creating-css-sprite-builder') {
      loadModuleCssSpriteBuilder().then((res) => {
        LOADED_CSS_SPRITE = true;
        res.onCssSpriteBuilderLoad()
      })
      .catch((e) => console.error(e));
    } else if (LOADED_CSS_SPRITE) {
      loadModuleCssSpriteBuilder()
      .then((res) => {
        LOADED_CSS_SPRITE = true;
        res.onCssSpriteBuilderUnload();
      })
      .catch((error) => console.error(error));
    }

    if (path==='/projects/markdown-to-html') {
      loadModuleMarkdown().then((res) => {
        LOADED_MARKDOWN = true;
        res.default()
      }).catch((e) => console.error(e));
    }

    if (path==="/chat") {
      loadChat().then((module) => {
        module.onChatLoad();
        LOADED_CHAT = true;
      })
    } else if (LOADED_CHAT) {
      loadChat().then((module) => {
        module.onChatUnload();
        LOADED_CHAT = false;
      })
    }

    if (path==="/projects/testing-select-implementations") {
      loadSelect()
      .then((module) => {
        module.default();
        LOADED_TESTING_SELECT = true;
      })
    }
    if (path==="/projects/google-colab-clone") {

    }
    if (path==="/projects/testing-recommendation-systems") {
      
    }
    if (path==="/projects/sorting-mechanisms") {
      
    }
    if (/\/surveys\/\d+\/\w+/.test(path)) {
      loadSurveyResponse()
      .then((res) => {
        res.onSurveyLoad();
      })
    }
    if (/\/ai-tools\/ai-chat.*/.test(path)) {
      loadAiChat()
      .then((mod) => {
        LOADED_AI_CHAT_PAGE = true;
        mod.onLoad();
      })
    } else if (LOADED_AI_CHAT_PAGE) {
      loadAiChat()
      .then((mod) => {
        LOADED_AI_CHAT_PAGE = true;
        mod.onUnload();
      })
    }

    if (hasThreeJSComponents(el)) {
      loadModuleThreeJs()
      .then((res) => {
        res.onThreeJSLoad();
        LOADED_THREE = true;
      })
      .catch((e) => console.error(e));
    } else if (LOADED_THREE) {
      loadModuleThreeJs().then((res) => res.onThreeJSUnload()).catch((e) => console.error(e));
    }
  
    // Personal Website Stuff
    onKatexLoad(el);
    onCodeLoad(el);

  } catch (error) {
    console.error(error);
  }
}



function handleOnNewContentLoadedEvent(e:CustomEvent<NEW_CONTENT_LOADED_CED>) {
  const el = e?.detail?.el;
  if (el) onNewContentLoaded(el);
  else onNewContentLoaded(document);
}

var prevScrollpos = window.scrollY;
var initial_scroll:number|undefined = undefined;
var scrollTimeout:NodeJS.Timeout|undefined = undefined;
var PREVENT_NAVBAR_MODIFICATION = false;

/**
 * true = open
 */
function setNavbarOpenClosed(b:boolean) {
  if (!!!PREVENT_NAVBAR_MODIFICATION) {
    if (b) {
      document.documentElement.style.setProperty("--navbar-height","2.81rem","important")
    } else {
      document.documentElement.style.setProperty("--navbar-height","0rem","important")
    }
  }
}

function setPreventNavbarModification(b:boolean) {
  PREVENT_NAVBAR_MODIFICATION = b;
}

function windowScrollHelper() {
  var currentScrollPos = window.scrollY;
  if (!!!PREVENT_NAVBAR_MODIFICATION) {
    if (prevScrollpos > currentScrollPos) {
      document.documentElement.style.setProperty("--navbar-height","2.81rem","important")
    } else if (prevScrollpos < currentScrollPos) {
      document.documentElement.style.setProperty("--navbar-height","0rem","important")
    }
  }
  prevScrollpos = currentScrollPos;
}
function handleWindowScroll() {
  const now = (new Date()).getTime();
  if (!!!initial_scroll) initial_scroll = (new Date()).getTime();
  if (scrollTimeout&&now-initial_scroll>80) {
    clearTimeout(scrollTimeout);
    windowScrollHelper();
    scrollTimeout = setTimeout(() => {
      windowScrollHelper();
      initial_scroll = undefined;
    },20);
  } else {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      windowScrollHelper();
      initial_scroll = undefined;
    },20);
  }
}

/**
 * On Initial Page load only
 */
function onDomContentLoaded() {
  updateHistory(true,window.location.pathname,false);
  document.addEventListener('HIDE_OPEN_POPOVER',hideOpenPopoverCallback);
  document.addEventListener('SPLIDE_REGISTERED',customSplideElementListener);
  document.addEventListener('NEW_CONTENT_LOADED',handleOnNewContentLoadedEvent);
  document.addEventListener("OPEN_SNACKBAR",customSnackbarHandler);
  document.addEventListener('DISPATCH_SNACKBAR',dispatchSnackbarEventHandler);
  document.addEventListener('IMAGE_CLICK',onImageClickCustom);
  document.addEventListener('OPEN_DIALOG',openDialogCustom);
  document.addEventListener('OPEN_DIALOG_FINAL',openDialogFinal);
  document.addEventListener('CLOSE_DIALOG',closeDialogCustom);
  document.addEventListener('scroll',handleWindowScroll);
  if (isIOS()) disableZoom();
  if (window.visualViewport&&isTouchDevice()) {
    window.visualViewport.addEventListener('resize',handleViewportResize);
  }
  onNewContentLoaded(document);
  setIntersectionObserverTableOfContents();
  registerServiceWorker()
  handleNotifications();
  handleAIChatDialog();
  const formData = new FormData();
  formData.append("X-CSRF-Token",getCsrfToken());
  formData.append('path',window.location.pathname);
  navigator.sendBeacon('/analytics/page-view',formData);
  document.addEventListener('update-table-of-contents',updateTableOfContents);
}


htmx.on("htmx:beforeRequest", beforeHTMXRequest);
htmx.on("htmx:afterRequest", afterHTMXRequest);
htmx.on('htmx:beforeSwap',beforeHTMXSwap);
htmx.on('htmx:oobBeforeSwap',beforeHTMXSwap);
htmx.on('htmx:pushedIntoHistory',pushedIntoHistoryHTMX);
htmx.on('htmx:configRequest',configRequestHTMX);

window.addEventListener('load',onDomContentLoaded);
window.addEventListener('blur',setWindowBlur);
window.addEventListener('focus',setWindowFocus);
window.addEventListener('popstate',handlePopState);





