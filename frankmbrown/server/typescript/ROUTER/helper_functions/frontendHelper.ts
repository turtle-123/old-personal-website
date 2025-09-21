import { Request } from "express";
import env from "../../utils/env";
import IS_DEVELOPMENT from "../../CONSTANTS/IS_DEVELOPMENT";
import type {SEO} from '../../types';
import DEFAULT_SETTINGS from "../../CONSTANTS/DEFAULT_SETTINGS";
import { getNavbarColor } from "../functions/settingsHandler";
import { getThemeColorsStyle } from "../functions/settingsHandler";
import CSS_FILE_HASH from '../../CONSTANTS/CSS_FILE_HASH';
import JS_FILE_HASH_MOBILE from '../../CONSTANTS/JS_FILE_HASH_MOBILE';
import JS_FILE_HASH_DESKTOP from '../../CONSTANTS/JS_FILE_HASH_DESKTOP';
import { escape } from "html-escaper";

const MAPS_API_KEY: string|undefined = (IS_DEVELOPMENT) ? env.MAPS_API_KEY_DEVELOPMENT : env.MAPS_API_KEY_PRODUCTION;
if (!!!MAPS_API_KEY) throw new Error('Unable to get MAPS_API_KEY from env.');

const DESKTOP_JS = IS_DEVELOPMENT ? `/static/js/desktop.${JS_FILE_HASH_DESKTOP}.min.js` : `https://cdn.storething.org/frankmbrown/js/desktop.${JS_FILE_HASH_DESKTOP}.min.js`;
const MOBILE_JS = IS_DEVELOPMENT ? `/static/js/mobile.${JS_FILE_HASH_MOBILE}.min.js` : `https://cdn.storething.org/frankmbrown/js/mobile.${JS_FILE_HASH_MOBILE}.min.js`;
const DESKTOP_CSS = `https://cdn.storething.org/frankmbrown/css/desktop-bundle-${CSS_FILE_HASH}.min.css` // See cleanCssHelper.ts, this is only used in production
const MOBILE_CSS = `https://cdn.storething.org/frankmbrown/css/mobile-bundle-${CSS_FILE_HASH}.min.css` // See cleanCssHelper.ts, this is only used in production

const imgObj = {"/":"https://image.storething.org/frankmbrown/0c0a5f6c-fd12-4e48-98a4-07e32feb2480.png","/404":"https://image.storething.org/frankmbrown/75f5631c-e2cc-45ee-bfb1-25427399bcc7.png","/blog":"https://image.storething.org/frankmbrown/f2e80f44-9132-4d61-879f-07d0f7312581.png","/idea":"https://image.storething.org/frankmbrown/b0037a78-8188-4152-8847-5e0063095868.jpg","/note":"https://image.storething.org/frankmbrown/193dd336-e1ac-4321-8121-ccbc5aae114c.avif","/about":"https://image.storething.org/frankmbrown/3050f7aa-35e3-4297-b0b2-754d96f53d06.jpg","/links":"https://image.storething.org/frankmbrown/8ebfe920-dbe3-4def-af9b-f383efd34330.jpg","/login":"https://image.storething.org/frankmbrown/62ada98e-03ce-4929-8789-d5753b985da4.webp","/quotes":"https://image.storething.org/frankmbrown/1deafa54-2a85-4214-985d-423dc552f60d.png","/search":"","/cookies":"https://image.storething.org/frankmbrown/4e75fc29-dce1-40aa-a071-827a8527535d.webp","/projects":"https://image.storething.org/frankmbrown/1f9f381c-2871-4ebd-87fb-f1860475776a.png","/daily-reading":"https://image.storething.org/frankmbrown/d3dcb07a-b43b-4cfe-a94c-c63cfff0b1e4.jpg","/utilities":"https://image.storething.org/frankmbrown/984e3588-8767-4806-bc03-47321e1e8ad6.jpg","/markdown-notes":"https://image.storething.org/frankmbrown/59a2cee5-e4f4-401a-9542-21b43e80700b.png","/privacy-policy":"https://image.storething.org/frankmbrown/f80c6f32-2f4e-47ab-b548-52b27d669d26.png","/create-account":"https://image.storething.org/frankmbrown/d8ad88e2-b95d-4a13-b09a-bb1948e987f7.jpg","/jupyter-notebooks":"https://image.storething.org/frankmbrown/3e0053f2-8320-466f-a921-a1121865a14e.jpg","/reset-credentials":"https://image.storething.org/frankmbrown/b6210d73-420a-4c9e-8822-2d09b7f6c7a0.png","/projects/create-svg":"https://image.storething.org/frankmbrown/8ca4882e-4215-4a8d-938d-a1684e534d4b.png","/projects/record-media":"https://image.storething.org/frankmbrown/f1344e40-2c66-4186-81c7-c27346294a8d.jpg","/projects/create-a-survey":"https://image.storething.org/frankmbrown/c050e236-263d-4dda-b51a-a387938fc4b3.png","/projects/design-system":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/create-gradient":"https://image.storething.org/frankmbrown/fcbb21ff-526f-48a7-b971-e74001bd5812.jpg","/projects/article-builder":"https://image.storething.org/frankmbrown/9396e0a3-c498-4ef1-ae3e-2b0a2ee9c781.png","/projects/markdown-to-html":"https://image.storething.org/frankmbrown/943d5221-bd1f-4967-a961-891b28befeb4.png","/projects/article-builder-2":"https://image.storething.org/frankmbrown/9396e0a3-c498-4ef1-ae3e-2b0a2ee9c781.png","/projects/article-builder-3":"https://image.storething.org/frankmbrown/9396e0a3-c498-4ef1-ae3e-2b0a2ee9c781.png","/projects/article-builder-4":"https://image.storething.org/frankmbrown/9396e0a3-c498-4ef1-ae3e-2b0a2ee9c781.png","/projects-archive/svg-basics":"https://image.storething.org/frankmbrown/2e1607c1-71b5-41bf-a736-5b54571bd98b.png","/projects/design-system/code":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/time":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/math":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/geo":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/tabs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/svgs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/text":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/dsv":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/html-to-javascript":"https://image.storething.org/frankmbrown/a239fa8c-5228-419d-aba9-5619a28dd866.webp","/projects/design-system/lists":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/ease":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/three-js-playground":"https://image.storething.org/frankmbrown/c566cf4b-b54f-4181-a6bb-3fb3e127131d.jpg","/projects/learning-d3-js/path":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/links":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/drag":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/zoom":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/media":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/time":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/axes":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/tables":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/scale":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/census-info-near-you":"https://image.storething.org/frankmbrown/cfc7a28a-6c01-4725-a2d6-b3ae1df97692.png","/projects/learning-d3-js/fetch":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/array":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/color":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/image-editor":"https://image.storething.org/frankmbrown/82a0d8a9-881f-49cc-8063-2cbe32a60468.webp","/projects/design-system/alerts":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/media-convert-format":"https://image.storething.org/frankmbrown/fabd8404-f422-4e09-9e99-9a27c4b1118d.jpg","/projects/learning-d3-js/shape":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/brush":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/timer":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/force":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/random":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects-archive/three-js-test":"https://image.storething.org/frankmbrown/c566cf4b-b54f-4181-a6bb-3fb3e127131d.jpg","/projects/design-system/general":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/format":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/buttons":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-html5-canvas":"https://image.storething.org/frankmbrown/bbd7d265-040d-4842-af24-487938e80d61.png","/projects/learning-d3-js/chords":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/surfaces":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/contour":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/polygon":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/popovers":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/dispatch":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/create-three-js-texture":"https://image.storething.org/frankmbrown/c566cf4b-b54f-4181-a6bb-3fb3e127131d.jpg","/projects/learning-d3-js/delaunay":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/utilities":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/quadtree":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/lexical-implementations":"https://image.storething.org/frankmbrown/bf6183c4-f665-474e-889b-f7c5a08ffa83.jpg","/projects/learning-d3-js/selection":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/indicators":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/accordions":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/embed-social-media-posts":"https://image.storething.org/frankmbrown/1e96de4b-0fe6-4790-8a56-11f55f03aafa.jpg","/projects/learning-d3-js/hierarchy":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/google-maps":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/breadcrumbs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/learning-d3-js/transition":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/excalidraw-implementation":"https://image.storething.org/frankmbrown/63434158-8629-428f-96e6-eb529af09cab.png","/projects/testing-css-env-variables":"https://image.storething.org/frankmbrown/369bdeab-4ae1-4cb0-a53e-054bd9e4def3.png","/projects-archive/implementing-auth":"https://image.storething.org/frankmbrown/ecbee2ff-3f7a-494d-925a-9824d0e18350.webp","/projects/design-system/text-inputs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/ncaa-basketball-tournament":"https://image.storething.org/frankmbrown/022f9216-da6d-4eb6-99f8-19145ead6196.png","/projects/learning-d3-js/time-format":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/learning-d3-js/interpolate":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects/design-system/other-inputs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/creating-css-sprite-builder":"https://image.storething.org/frankmbrown/eb21c06f-7a0f-481f-b799-2e90db4475ea.png","/projects/design-system/select-inputs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/fixed-content":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/design-system/boolean-inputs":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp","/projects/html-css-javascript-playground":"https://image.storething.org/frankmbrown/e32d2e66-148e-4cb6-9b64-8bcae8fbe408.png","/projects/configure-size-adjust-property":"https://image.storething.org/frankmbrown/a4820a72-33f8-41be-a11c-aecc3ba00741.jpg","/projects/learning-d3-js/scale-chromatic":"https://image.storething.org/frankmbrown/b4c23975-8806-4cec-9fb3-8f8c14a9aae5.jpg","/projects-archive/creating-full-text-search":"https://image.storething.org/frankmbrown/54a41fd4-4ebe-4795-8c82-9b7b77037e6b.png","/projects/design-system/lexical-rich-text-editor":"https://image.storething.org/frankmbrown/e7a05bb9-1013-4562-99d2-a7331e348d85.webp"}

/**
 * Function that tells you whether the ajax request is for the entire page (should be only on initial load)
 */
export const fullPageRequest = (req: Request) => Boolean(!!!req.get('hx-request'));
/**
 * Function that tells you whether the client is requesting the entire page (everything in the `<main>` tag)
 * @param req Request Object
 * @returns 
 */
export const pageRequest = (req: Request) => Boolean(req.get('hx-request')==="true"&&req.get('hx-target')==="PAGE");
/**
 * Function that tells you whether the client is requesting a subpage (everything inside an html element where the **id^="subpage"**)
 * @param req Request Object
 * @returns 
*/
export const subPageRequest = (req: Request) =>  Boolean(req.get('hx-request')==="true"&&req.get('hx-target')?.startsWith('subpage'));

/**
 * Function to get the required variables for rendering the page on the server
 */
export function getRequiredVariables(req: Request,seo: SEO,options?:{ includeAnnotation: boolean, includeAnnotationFormOnly?: boolean }) {
  const url = new URL(req.url,'https://frankmbrown.net');
  const path = url.pathname;
  const comment_path = '/comment'.concat(path);
  const annotation_path = '/annotate'.concat(path);
  const annotations_path = '/annotations'.concat(path);

  var snackbarMessage = undefined;
  if(req.session.snackbarMessage?.showMessage===true) {
    snackbarMessage = req.session.snackbarMessage.message;
    req.session.snackbarMessage.showMessage = false;
  }
  var DEFAULT_FONT_SIZE:number = 13.6;
  var FONT_SIZE:string = '100';
  if (req.session.device&&req.session.settings) {
    if(req.session.device?.desktop===true){
      DEFAULT_FONT_SIZE = 13.6;
      FONT_SIZE = ((req.session.settings.desktop_application_size/100)*DEFAULT_FONT_SIZE).toFixed(2);
    }else if(req.session.device?.tablet===true){
      DEFAULT_FONT_SIZE = 13.6;
      FONT_SIZE = ((req.session.settings.tablet_application_size/100)*DEFAULT_FONT_SIZE).toFixed(2);
    }else{
      DEFAULT_FONT_SIZE = 13.6;
      FONT_SIZE = ((req.session.settings.mobile_application_size/100)*DEFAULT_FONT_SIZE).toFixed(2);
    }
  }
  var image = seo.image;
  if (!!!image&&imgObj[seo.path as keyof typeof imgObj]) {
    image = imgObj[seo.path as keyof typeof imgObj];
  }
  return {
    phone: req.session?.device?.phone || false,
    tablet: req.session?.device?.tablet || false,
    desktop: req.session?.device?.desktop || false,
    fullPageRequest: fullPageRequest(req),
    pageRequest: pageRequest(req),
    subPageRequest: subPageRequest(req),
    development: IS_DEVELOPMENT,
    settings: req.session.settings || structuredClone(DEFAULT_SETTINGS),
    navbarColor: getNavbarColor(req.session?.settings),
    path: seo.path,
    url: `https://frankmbrown.net${seo.path}`,
    noIndex: (seo.noIndex===true)?true:false,
    breadcrumbs: seo.breadcrumbs,
    title: seo.title,
    keywords: seo.keywords,
    description: seo.description,
    tableOfContents: seo.tableOfContents,
    MAPS_API_KEY: String(MAPS_API_KEY),
    jsNonce: String(req.session.jsNonce),
    snackbarMessage,
    showedBanner: Boolean(req?.session?.cookiePreferences?.showedBanner===true),
    cookieStatistics: Boolean(req.session.cookiePreferences?.statistics===true),
    themeColorsStyle: getThemeColorsStyle(req.session.settings?.settingsString||DEFAULT_SETTINGS.settingsString),
    spellcheck: Boolean(req.session.settings?.spellcheck===true),
    settingsMode: Boolean(req.session?.settings?.mode==="light")?"lightMode":"darkMode",
    auth: Number(req.session.auth?.level),
    DEFAULT_FONT_SIZE,
    FONT_SIZE,
    HTML_STYLE_STR: `style="font-size: ${FONT_SIZE}px;"`,
    lang: req.session.settings?.lang || 'en',
    csrf_token: String(req.session.csrf_token),
    includeAnnotation: Boolean(options&&options.includeAnnotation),
    includeAnnotationFormOnly: Boolean(options&&options.includeAnnotation&&options.includeAnnotationFormOnly),
    pageImage: image ? image.replace('https://image.storething.org/frankmbrown','https://image.storething.org/frankmbrown/og-image') : 'https://cdn.storething.org/frankmbrown/asset/192x192.png',
    twitterImage: image ? image.replace('https://image.storething.org/frankmbrown','https://image.storething.org/frankmbrown/twitter') : '',
    codeTheme: req.session.settings?.code_editor_theme || 'vscode',
    comment_path,
    annotation_path,
    annotations_path,
    DESKTOP_JS,
    DESKTOP_CSS,
    MOBILE_JS,
    MOBILE_CSS,
    
  };
}
