import katex from 'katex';
import 'katex/contrib/mhchem';
import highlight from 'highlight.js';
import DOMPurify from 'dompurify';
import {marked, RendererObject} from 'marked';
import createDOMPurify from 'dompurify';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/';
import markedKatex from "marked-katex-extension";
import markedExtendedTables from './marked-extended-tables';
import markedFootnote from 'marked-footnote';

Prism.manual = true;


export function validateTikTokEmbed(s:string) {
  const ALLOWED_TAGS = [
    "BLOCKQUOTE",
    "SECTION",
    "A"
  ];
  const ALLOWED_ATTR = [
    "class",
    "cite",
    "data-video-id",
    "style",
    "target",
    "title",
    "href"
  ];
  const hrefRegex = /https:\/\/(www\.|)tiktok\.com\//;

  // Check the HTML first manually
  const dom = new DOMParser();
  const domDocument = dom.parseFromString(s,'text/html');

  domDocument.querySelectorAll('script')
  .forEach((s) => s.remove());
  const bodyChildren = Array.from(domDocument.body.children);
  if (bodyChildren.length>1) {
    throw new Error("TikTok embed should be wrapped in <blockquote> child.");
  }
  const blockquote = bodyChildren[0];
  if (
    blockquote.nodeName!=="BLOCKQUOTE" || 
    blockquote.className!=="tiktok-embed" ||
    !!!/https:\/\/(www\.|)tiktok.com\/.*\/video\/\d+/.test(String(blockquote.getAttribute('cite'))) || 
    !!!Number.isInteger(Number(blockquote.getAttribute('data-video-id'))) 
  ) {
    throw new Error("TikTok embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"tiktok-embed\". It should have a cite attribute that matches /https:\/\/(www.|)tiktok.com\/.*\/video\/\d+/. It should have an integer data-video-id attribute.");
  }
  const blockquoteChildren = Array.from(blockquote.children);
  if (blockquoteChildren.length>1) {
    throw new Error("TikTok embed HTML should be blockquote > 1 section > all other elements. ");
  }
  const section = blockquoteChildren[0];
  if (section.nodeName!=='SECTION'||section.className!=='') {
    throw new Error("TikTok embed HTML should be blockquote > 1 section > all other elements. Section Element should not have a class name.");
  }
  const sectionDescendants = Array.from(section.querySelectorAll('*'));
  for (let child of sectionDescendants) {
    if (child.tagName!=='A'&&child.tagName!=='P') {
      throw new Error("The descendants of the section element in a tiktok embed should either by and anchor tag or a paragraph.");
    }
    if (child.tagName==="A") {
      if (child.getAttribute('target')!=='_blank') throw new Error("The 'target' attribute of all anchor tags in the TikTok embed should be '_blank'.");
      if (!!!hrefRegex.test(String(child.getAttribute('href')))) {
        throw new Error("All links in the TikTok embed should have an href attribute that matches: /https:\/\/(www.|)tiktok.com\//.");
      }
    }
  }
  // Now Sanitive the HTML
  const newHTML = blockquote.outerHTML;
  const DOMPurify = createDOMPurify(window);
  const finalHTML = DOMPurify.sanitize(newHTML,{
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true
  });
  return finalHTML;
}
export function validateRedditEmbed(s:string) {
  const ALLOWED_TAGS = [
    "BLOCKQUOTE",
    "A",
    "BR"
  ];
  const ALLOWED_ATTR =  [
    "class",
    "data-embed-height",
    "href"
  ];
  const hrefRegex = /https:\/\/(www\.|)reddit\.com\/.*/

  const dom = new DOMParser();
  const domDocument = dom.parseFromString(s,'text/html');

  domDocument.querySelectorAll('script')
  .forEach((s) => s.remove());
  const bodyChildren = domDocument.body.children;
  if (bodyChildren.length>1) {
    throw new Error("Reddit embed should be wrapped in <blockquote> child.");
  }
  const blockquote = bodyChildren[0];
  if (
    blockquote.nodeName!=="BLOCKQUOTE" || 
    blockquote.className!=="reddit-embed-bq" ||
    !!!Number.isInteger(Number(blockquote.getAttribute('data-embed-height')))
  ) {
    throw new Error("Reddit embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"reddit-embed-bq\". It should have a data-embed-height attribute that is an integer.");
  }
  // This should be the max depth
  const blockquoteChildren = Array.from(blockquote.children);
  for (let child of blockquoteChildren) {
    if ((child.tagName!=='A'&&child.tagName!=='BR')||(Array.from(child.children).length>0)) {
      throw new Error("The children of the blockquote in the Reddit embed should be either anchor tags or line breaks and they should not have any children themselves.")
    }
    if (child.tagName==="A") {
      if (!!!hrefRegex.test(String(child.getAttribute('href')))) {
        throw new Error("Invalid href attribute for anchor tag inside Reddit embed.");
      }
    }
  }
  const newHTML = blockquote.outerHTML;
  const minHeight = Number(String(blockquote.getAttribute('data-embed-height')));
  const DOMPurify = createDOMPurify(window);
  const finalHTML = DOMPurify.sanitize(newHTML,{
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true
  });
  return {html: finalHTML, minHeight };
}
export function validateTwitterEmbed(s:string) {
  const ALLOWED_TAGS = [
    "BLOCKQUOTE",
    "P",
    "BR",
    "A"
  ];
  const ALLOWED_ATTR =  [
     "class",
     "lang",
     "dir",
     "href"
  ];
  const dom = new DOMParser();
  const domDocument = dom.parseFromString(s,'text/html');

  domDocument.querySelectorAll('script')
  .forEach((s) => s.remove());
  const bodyChildren = domDocument.body.children;
  if (bodyChildren.length>1) {
    throw new Error("Twitter embed should be wrapped in <blockquote> child.");
  }
  const blockquote = bodyChildren[0];
  if (
    blockquote.nodeName!=="BLOCKQUOTE" || 
    blockquote.className!=="twitter-tweet"
  ) {
    throw new Error("Twitter embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"twitter-tweet\".");
  }
  const blockquoteChildren = Array.from(blockquote.children);
  if (
    blockquoteChildren.length!==2 ||
    blockquoteChildren[0].tagName!=='P' ||
    blockquoteChildren[1].tagName!=='A' ||
    Array.from(blockquoteChildren[1].children).length>0 ||
    !!!/https:\/\/(www\.|)(twitter|x)\.com\/.*\/status\/\d+\?.*/.test(String(blockquoteChildren[1].getAttribute('href'))) ||
    (blockquoteChildren[0].getAttribute('dir')!=='ltr'&&blockquoteChildren[0].getAttribute('dir')!=='rtl') ||
    !!!blockquoteChildren[0].getAttribute('lang')
  ) {
    throw new Error("Twitter Embed bloclquote element should have two children. The first should be a paragraph and the second should be an anchor tag. The anchor tag should have no children and it should have an href attribute that matches /https:\/\/(www.|)(twitter|x).com\/.*\/status\/\d+\?.*/. The first paragraph should have appropriate lang and dir attributes.")
  }
  Array.from(blockquoteChildren[0].children)
  .forEach((child) => {
    if (child.tagName!=='A'&&child.tagName!=='BR') {
      throw new Error("The children of blockquote > p for the twitter implementation should only be anchor tags and newlines.")
    }
    if (Array.from(child.children).length>1) {
      throw new Error("The children of blockquote > p for the twitter implementation should not have children themselves.");
    }
    if (child.tagName==='A') {
      if (
        !!!/https:\/\/t\.co\/.*/.test(String(child.getAttribute('href'))) && 
        !!!/https:\/\/(twitter|x)\.com\/.*/.test(String(child.getAttribute('href')))
      ) {
        throw new Error("Twitter embed: Invalid twitter anchor tag href.");
      }
    }
  })
  const newHTML = blockquote.outerHTML;
  const DOMPurify = createDOMPurify(window);
  const finalHTML = DOMPurify.sanitize(newHTML,{
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  });
  return finalHTML;
}
export function validateInstagramEmbed(s:string) {
  const ALLOWED_TAGS = [
    "BLOCKQUOTE",
    "DIV",
    "svg",
    "g",
    "path",
    "A",
    "P"
  ];
  const ALLOWED_ATTR =  [
     "class",
     "lang",
     "dir",
     "href"
  ];
  const gAttributesSet = new Set([
    "stroke",
    "stroke-width",
    "fill",
    "fill-rule",
    "transform"
  ]);
  const dom = new DOMParser();
  const domDocument = dom.parseFromString(s,'text/html');

  domDocument.querySelectorAll('script')
  .forEach((s) => s.remove());
  const bodyChildren = domDocument.body.children;
  if (bodyChildren.length>1) {
    throw new Error("Instagram embed should be wrapped in <blockquote> child.");
  }
  const blockquote = bodyChildren[0];
  if (
    blockquote.nodeName!=="BLOCKQUOTE" || 
    blockquote.className!=="instagram-media" || 
    !!!blockquote.hasAttribute("data-instgrm-captioned") ||
    !!!/https:\/\/www.instagram.com\/.*/.test(String(blockquote.getAttribute("data-instgrm-permalink"))) ||
    !!!blockquote.hasAttribute("data-instgrm-version")
  ) {
    throw new Error("Instagram embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"instagram-media\". Instagram embed should have the data-instgrm captioned and data-instgrm-version attributes, and the data-instagram-permalink attribute should match /https:\/\/www.instagram.com\/.*/.");
  }
  const blockquoteChildren = Array.from(blockquote.children);
  if (blockquoteChildren.length!==1||blockquoteChildren[0].nodeName!=='DIV') {
    throw new Error("Instagram embed blcokquote wrapper should only have one <div> child with the style attribute.");
  }
  const divWrapper = blockquoteChildren[0];
  const divChildren = Array.from(divWrapper.children);
  if (divChildren[0].nodeName!=='A'||divChildren[1].nodeName!=='P') {

  }
  const anchorWrapper = divChildren[0];
  const anchorWrapperDescendents = Array.from(anchorWrapper.querySelectorAll('*'));
  anchorWrapperDescendents.forEach((child) => {
    switch (child.tagName) {
      case "DIV":
        // Children can be div | svg
        // can have style attribute
        const attribs = child.attributes;
        const attributeArray = [];
        for (let i = 0; i < attribs.length; i++) {
          const tempAt = attribs.item(i);
          if (tempAt) attributeArray.push(tempAt.name);
        }
        if (attributeArray.length>1||(attributeArray.length===1&&attributeArray[0]!=='style')) {
          throw new Error("DIV element in instagram embed can only have style attribute.")
        }
        break;
      case "svg":
          if (
            !!!child.hasAttribute("width") ||
            !!!child.hasAttribute("height") ||
            !!!child.hasAttribute("viewBox") ||
            !!!child.hasAttribute("version") ||
            !!!child.hasAttribute("xmlns") ||
            !!!child.hasAttribute("xmlns:xlink") ||
            Array.from(child.children).length!==1 ||
            Array.from(child.children)[0].tagName!=='g'
          ) {
            throw new Error("svg attribute in instagram embed does not have valid attributes or the correct number of children or its child is not a g element.")
          }
        break;  
      case "g":
        const HasUnrecognizedDescendants = Boolean(Array.from(child.querySelectorAll('*')).filter((el) => el.tagName!=='g'&&el.tagName!=='path').length>1);
        const HasMoreThanOneChild = Array.from(child.children).length>1;
        if (HasMoreThanOneChild||HasUnrecognizedDescendants) {
          throw new Error("g tag in Instagram embed has more than one child or has a descendant with a tagName that does not match the pattren.")
        }
        const attrs = child.attributes;
        const attributes = [];
        for (let i = 0; i < attrs.length; i++) {
          const tempAt = attrs.item(i);
          if (tempAt) attributes.push(tempAt.name);
        }
        for (let attr of attributes) {
          if (!!!gAttributesSet.has(attr)) {
            throw new Error("Unrecognized g attribute for instagram embed.");
          }
        }

        break;
      case "path":
        if (Array.from(child.children).length>0||!!!child.hasAttribute('d')) {
          throw new Error('path element for instagram embed should have no children and have a d attribute.');
        }
        break;
      default:
        throw new Error("Invalid Instagram embed structure. Unrecognized child tagName in anchor wrapper.")
    }
  })
  const endP = divChildren[1];
  const endPChildren = Array.from(endP.children);
  if (endPChildren.length!==1||endPChildren[0].nodeName!=='A' ||
    !!!/https:\/\/www.instagram.com\/.*/.test(String(endPChildren[0].getAttribute('href'))) || 
    !!!endPChildren[0].hasAttribute('style') || 
    endPChildren[0].getAttribute('target')!=='_blank' ||
    Array.from(endPChildren[0].children).length>0
  ) {
    throw new Error("The ending paragraph of the div wrapper should have one anchor tag child that has appropraiet attributes.");
  } 
  const newHTML = blockquote.outerHTML;
  const DOMPurify = createDOMPurify(window);
  const finalHTML = DOMPurify.sanitize(newHTML,{
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true
  });
  return finalHTML;
}

/**
 * https://htmx.org/reference/
 */
const DISALLOW_HTMX_ATTRIBUTES = Array.from(new Set([ 
  "hx-get",
  "hx-post",
  "hx-on*",
  "hx-push-url",
  "hx-select",
  "hx-select-oob",
  "hx-swap",
  "hx-swap-oob",
  "hx-target",
  "hx-trigger",
  "hx-vals",
  "hx-boost",
  "hx-confirm",
  "hx-delete",
  "hx-disable",
  "hx-disabled-elt",
  "hx-disinherit",
  "hx-encoding",
  "hx-ext",
  "hx-headers",
  "hx-history",
  "hx-history-elt",
  "hx-include",
  "hx-indicator",
  "htmx-request",
  "hx-params",
  "hx-patch",
  "hx-preserve",
  "hx-prompt",
  "hx-put",
  "hx-replace-url",
  "hx-request",
  "hx-sse",
  "hx-sync",
  "hx-validate",
  "hx-vars",
  "hx-vals",
  "hx-ws"
]));
const DISALLOW_ATTRIBUTE_CUSTOM = ['rel', 'contenteditable', 'id','autoplay']; // Need to set rel for anchor tags

const FORBID_TAGS = [
  'html', // Page Layout
  'base', // Page Layout
  'head', // Page Layout
  'link', // SEO
  'meta', // SEO
  'style', // Styling 
  'title', // SEO

  'body', // website
  'main', // SEO
  'script', // functionality
  'form', // for right now, you could do something interesting with this

  'dialog',
  'iframe', 
  'embed',
  'object',
  'picture',
  'portal',
  'source',
  'noscript',
  'slot',
  'template'
]

const FORBID_ATTR = [...DISALLOW_HTMX_ATTRIBUTES, ...DISALLOW_ATTRIBUTE_CUSTOM];


const DOMPURIFY_html = [
  'a',
  'abbr',
  'acronym',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'bdi',
  'bdo',
  'big',
  'blink',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'content',
  'data',
  'datalist',
  'dd',
  'decorator',
  'del',
  'details',
  'dfn',
  'dir',
  'div',
  'dl',
  'dt',
  'element',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'main',
  'map',
  'mark',
  'marquee',
  'menu',
  'menuitem',
  'meter',
  'nav',
  'nobr',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'section',
  'select',
  'shadow',
  'small',
  'source',
  'spacer',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'track',
  'tt',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
];

// SVG
const DOMPURIFY_svg = [
  'svg',
  'a',
  'altglyph',
  'altglyphdef',
  'altglyphitem',
  'animatecolor',
  'animatemotion',
  'animatetransform',
  'audio',
  'canvas',
  'circle',
  'clippath',
  'defs',
  'desc',
  'ellipse',
  'filter',
  'font',
  'g',
  'glyph',
  'glyphref',
  'hkern',
  'image',
  'line',
  'lineargradient',
  'marker',
  'mask',
  'metadata',
  'mpath',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialgradient',
  'rect',
  'stop',
  'style',
  'switch',
  'symbol',
  'text',
  'textpath',
  'title',
  'tref',
  'tspan',
  'video',
  'view',
  'vkern',
];

const DOMPURIFY_svgFilters = [
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
];

const DOMPURIFY_mathMl = [
  'math',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mglyph',
  'mi',
  'mlabeledtr',
  'mmuliscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mpspace',
  'msqrt',
  'mystyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
];
// https://github.com/cure53/DOMPurify/blob/1.0.8/src/tags.js
export const DOMPURIFY_DEFAULT_ELS = DOMPURIFY_html.concat(DOMPURIFY_svg).concat(DOMPURIFY_svgFilters).concat(DOMPURIFY_mathMl);

const html_ATTRS = [
  'accept',
  'action',
  'align',
  'alt',
  'autocomplete',
  'background',
  'bgcolor',
  'border',
  'cellpadding',
  'cellspacing',
  'checked',
  'cite',
  'class',
  'clear',
  'color',
  'cols',
  'colspan',
  'coords',
  'crossorigin',
  'datetime',
  'default',
  'dir',
  'disabled',
  'download',
  'enctype',
  'face',
  'for',
  'headers',
  'height',
  'hidden',
  'high',
  'href',
  'hreflang',
  'id',
  'integrity',
  'ismap',
  'label',
  'lang',
  'list',
  'loop',
  'low',
  'max',
  'maxlength',
  'media',
  'method',
  'min',
  'multiple',
  'name',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'optimum',
  'pattern',
  'placeholder',
  'poster',
  'preload',
  'pubdate',
  'radiogroup',
  'readonly',
  'rel',
  'required',
  'rev',
  'reversed',
  'role',
  'rows',
  'rowspan',
  'spellcheck',
  'scope',
  'selected',
  'shape',
  'size',
  'sizes',
  'span',
  'srclang',
  'start',
  'src',
  'srcset',
  'step',
  'style',
  'summary',
  'tabindex',
  'title',
  'type',
  'usemap',
  'valign',
  'value',
  'width',
  'xmlns',
];

const svg_ATTRS = [
  'accent-height',
  'accumulate',
  'additivive',
  'alignment-baseline',
  'ascent',
  'attributename',
  'attributetype',
  'azimuth',
  'basefrequency',
  'baseline-shift',
  'begin',
  'bias',
  'by',
  'class',
  'clip',
  'clip-path',
  'clip-rule',
  'color',
  'color-interpolation',
  'color-interpolation-filters',
  'color-profile',
  'color-rendering',
  'cx',
  'cy',
  'd',
  'dx',
  'dy',
  'diffuseconstant',
  'direction',
  'display',
  'divisor',
  'dur',
  'edgemode',
  'elevation',
  'end',
  'fill',
  'fill-opacity',
  'fill-rule',
  'filter',
  'flood-color',
  'flood-opacity',
  'font-family',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-weight',
  'fx',
  'fy',
  'g1',
  'g2',
  'glyph-name',
  'glyphref',
  'gradientunits',
  'gradienttransform',
  'height',
  'href',
  'id',
  'image-rendering',
  'in',
  'in2',
  'k',
  'k1',
  'k2',
  'k3',
  'k4',
  'kerning',
  'keypoints',
  'keysplines',
  'keytimes',
  'lang',
  'lengthadjust',
  'letter-spacing',
  'kernelmatrix',
  'kernelunitlength',
  'lighting-color',
  'local',
  'marker-end',
  'marker-mid',
  'marker-start',
  'markerheight',
  'markerunits',
  'markerwidth',
  'maskcontentunits',
  'maskunits',
  'max',
  'mask',
  'media',
  'method',
  'mode',
  'min',
  'name',
  'numoctaves',
  'offset',
  'operator',
  'opacity',
  'order',
  'orient',
  'orientation',
  'origin',
  'overflow',
  'paint-order',
  'path',
  'pathlength',
  'patterncontentunits',
  'patterntransform',
  'patternunits',
  'points',
  'preservealpha',
  'preserveaspectratio',
  'r',
  'rx',
  'ry',
  'radius',
  'refx',
  'refy',
  'repeatcount',
  'repeatdur',
  'restart',
  'result',
  'rotate',
  'scale',
  'seed',
  'shape-rendering',
  'specularconstant',
  'specularexponent',
  'spreadmethod',
  'stddeviation',
  'stitchtiles',
  'stop-color',
  'stop-opacity',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke',
  'stroke-width',
  'style',
  'surfacescale',
  'tabindex',
  'targetx',
  'targety',
  'transform',
  'text-anchor',
  'text-decoration',
  'text-rendering',
  'textlength',
  'type',
  'u1',
  'u2',
  'unicode',
  'values',
  'viewbox',
  'visibility',
  'vert-adv-y',
  'vert-origin-x',
  'vert-origin-y',
  'width',
  'word-spacing',
  'wrap',
  'writing-mode',
  'xchannelselector',
  'ychannelselector',
  'x',
  'x1',
  'x2',
  'xmlns',
  'y',
  'y1',
  'y2',
  'z',
  'zoomandpan',
];

const mathMl_ATTRS = [
  'accent',
  'accentunder',
  'align',
  'bevelled',
  'close',
  'columnsalign',
  'columnlines',
  'columnspan',
  'denomalign',
  'depth',
  'dir',
  'display',
  'displaystyle',
  'fence',
  'frame',
  'height',
  'href',
  'id',
  'largeop',
  'length',
  'linethickness',
  'lspace',
  'lquote',
  'mathbackground',
  'mathcolor',
  'mathsize',
  'mathvariant',
  'maxsize',
  'minsize',
  'movablelimits',
  'notation',
  'numalign',
  'open',
  'rowalign',
  'rowlines',
  'rowspacing',
  'rowspan',
  'rspace',
  'rquote',
  'scriptlevel',
  'scriptminsize',
  'scriptsizemultiplier',
  'selection',
  'separator',
  'separators',
  'stretchy',
  'subscriptshift',
  'supscriptshift',
  'symmetric',
  'voffset',
  'width',
  'xmlns',
];
export const DOMPURIFY_DEFAULT_ATTRS = html_ATTRS.concat(svg_ATTRS).concat(mathMl_ATTRS);


const xml_ATTRS = [
  'xlink:href',
  'xml:id',
  'xlink:title',
  'xml:space',
  'xmlns:xlink',
];

/**
 * Need to look into classnames to see which to not allow
 * @param s 
 */
export function validateUgcCode(s:string) {
  const CONFIG:DOMPurify.Config = {
    FORBID_ATTR, // need to add a specific rel attribute for anchor tags
    FORBID_TAGS,
    USE_PROFILES: { html: true, mathMl: true, svg: true },
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false
  }
  const domPurify = createDOMPurify(window);
  const purifiedHtml = domPurify.sanitize(s,CONFIG);
  return purifiedHtml;
}



export {
  katex,
  highlight,
  DOMPurify,
  marked,
  Prism,
  loadLanguages,
  RendererObject,
  markedKatex,
  markedExtendedTables,
  markedFootnote
};