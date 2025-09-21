"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownToHTMLAi = exports.getTableOfContentsFromMarkdownHTML = exports.parseMarkdown = exports.markedVideo = exports.markedAudio = exports.markedImageCarousel = exports.markedImage = exports.markedInstagram = exports.markedTikTok = exports.markedTwitter = exports.markedYoutube = exports.markedNews = exports.markedHorizontalRule = exports.markedAbbrevation = exports.markedKatexLexical = exports.lexicalMarkdownRenderer = exports.defaultMarkdownRenderer = exports.myDesignSystemMarkdownRenderer = exports.renderMarkdownCode = exports.purifyAndUpdateJupyterNotebookMarkdownHTML = exports.sizeImageWithSrc = exports.sizeImage = exports.getSizesFromWidthAndHeight = exports.purifyHTMLDefault = exports.purifyLexicalMarkdownInlineHTML = exports.updateCustomHTMLLexical = exports.purifyUserInputHTMLForLexical = void 0;
const highlight_js_1 = __importDefault(require("highlight.js"));
const katex_1 = __importDefault(require("katex"));
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = require("jsdom");
const marked_1 = require("marked");
const marked_katex_extension_1 = __importDefault(require("marked-katex-extension"));
const marked_extended_tables_1 = require("./extensions/marked-extended-tables");
const marked_footnote_1 = __importDefault(require("marked-footnote"));
const escape_html_1 = __importDefault(require("escape-html"));
const buffer_image_size_1 = __importDefault(require("buffer-image-size"));
const image_1 = require("../../../utils/image");
const mediaHelpers_1 = require("../../../aws/mediaHelpers");
const cmd_1 = require("../../../utils/cmd");
const aws_implementation_1 = require("../../../aws/aws-implementation");
const personal_website_shared_1 = require("../../../personal-website-shared");
const socialMedia_1 = require("../../../utils/socialMedia");
const DEFAULT_MARKDOWN_OPTIONS = { design_system: 'default', breaks: true, gfm: true, pedantic: false };
const HLJS_CODING_LANGUAGES_AVAILABLE = new Set(["auto", "1c", "abnf", "accesslog", "actionscript", "ada", "angelscript", "apache", "applescript", "arcade", "arduino", "armasm", "xml", "asciidoc", "aspectj", "autohotkey", "autoit", "avrasm", "awk", "axapta", "bash", "basic", "bnf", "brainfuck", "c", "cal", "capnproto", "ceylon", "clean", "clojure", "clojure-repl", "cmake", "coffeescript", "coq", "cos", "cpp", "crmsh", "crystal", "csharp", "csp", "css", "d", "markdown", "dart", "delphi", "diff", "django", "dns", "dockerfile", "dos", "dsconfig", "dts", "dust", "ebnf", "elixir", "elm", "ruby", "erb", "erlang-repl", "erlang", "excel", "fix", "flix", "fortran", "fsharp", "gams", "gauss", "gcode", "gherkin", "glsl", "gml", "go", "golo", "gradle", "graphql", "groovy", "haml", "handlebars", "haskell", "haxe", "hsp", "http", "hy", "inform7", "ini", "irpf90", "isbl", "java", "javascript", "jboss-cli", "json", "julia", "julia-repl", "kotlin", "lasso", "latex", "ldif", "leaf", "less", "lisp", "livecodeserver", "livescript", "llvm", "lsl", "lua", "makefile", "mathematica", "matlab", "maxima", "mel", "mercury", "mipsasm", "mizar", "perl", "mojolicious", "monkey", "moonscript", "n1ql", "nestedtext", "nginx", "nim", "nix", "node-repl", "nsis", "objectivec", "ocaml", "openscad", "oxygene", "parser3", "pf", "pgsql", "php", "php-template", "plaintext", "pony", "powershell", "processing", "profile", "prolog", "properties", "protobuf", "puppet", "purebasic", "python", "python-repl", "q", "qml", "r", "reasonml", "rib", "roboconf", "routeros", "rsl", "ruleslanguage", "rust", "sas", "scala", "scheme", "scilab", "scss", "shell", "smali", "smalltalk", "sml", "sqf", "sql", "stan", "stata", "step21", "stylus", "subunit", "swift", "taggerscript", "yaml", "tap", "tcl", "thrift", "tp", "twig", "typescript", "vala", "vbnet", "vbscript", "vbscript-html", "verilog", "vhdl", "vim", "wasm", "wren", "x86asm", "xl", "xquery", "zephir"]);
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
/**
 * CTRL+SHIFT+F (Regex) -> document.querySelector(All)?\(.*?\[data-
 * copy the data attributes
 */
const DISALLOW_DATA_ATTRIBUTES = Array.from(new Set([
    "data-codemirror",
    "data-editor-wrapper",
    "data-article-title",
    "data-article-description",
    "data-article-image",
    "data-article-version",
    "data-article-builder",
    "data-preview-mobile",
    "data-preview-tablet",
    "data-preview-desktop",
    "data-code-output-div",
    "data-submit",
    "data-output-code",
    "data-delete-section",
    "data-preview-article",
    "data-edit-article",
    "data-article-builder-final",
    "data-article",
    "data-stop",
    "data-transform",
    "data-grad-container",
    "data-stop-container",
    "data-stop-list",
    "data-add-stop",
    "data-delete-stop",
    "data-delete-transform",
    "data-rich-text-editor",
    "data-option",
    "data-edit-poll-question",
    "data-question-type",
    "data-option-middle",
    "data-question-content",
    "data-delete-option",
    "data-option-type",
    "data-delete-poll",
    "data-hide-question",
    "data-add-question",
    "data-poll-question",
    "data-pixi-container",
    "data-hide-show-section",
    "data-add-line-dash-segment",
    "data-remove-line-dash-segment",
    "data-line-dash-segment",
    "data-scroll",
    "data-path-operation",
    "data-added-element",
    "data-delete-operation",
    "data-line-dash-details",
    "data-add-line-dash",
    "data-remove-line-dash",
    "data-drag-container",
    "data-drag-el",
    "data-type",
    "data-error",
    "data-previous",
    "data-next",
    "data-photo-text",
    "data-index",
    "data-wrapper",
    "data-media-output-wrapper",
    "data-image-input",
    "data-audio-input",
    "data-video-input",
    "data-multiple",
    "data-preview",
    "data-loader",
    "data-actions",
    "data-switch-camera",
    "data-time",
    "data-highlight-js-form",
    "data-katex-input",
    "data-form",
    "data-warn-form-progress",
    "data-esc",
    "data-show-geography",
    "data-close-map-window",
    "data-delete-geometry",
    "data-hx-disable",
    "data-indicator",
    "data-text",
    "data-dialog",
    "data-close-backdrop",
    "data-vis-switch",
    "data-regenerate-value",
    "data-copy-input",
    "data-increase",
    "data-decrease",
    "data-default",
    "data-toggle",
    "data-combobox-option",
    "data-audio-wrapper",
    "data-video-wrapper",
    "data-sound",
    "data-on",
    "data-off",
    "data-main-controls",
    "data-ellapsed",
    "data-remaining",
    "data-warn-text",
    "data-error-text",
    "data-mute-button",
    "data-closed-captions",
    "data-play",
    "data-pause",
    "data-replay",
    "data-playback",
    "data-fullscreen",
    "data-close-menu",
    "data-popover",
    "data-snackbar",
    "data-close-snackbar",
    "data-enter",
    "data-exit",
    "data-fullscreen-btn",
    "data-copy-prev",
    "data-nav-back",
    "data-nav-forward",
    "data-show",
    "data-hide",
    "data-arrow",
    "data-hide-show",
    "data-copy-el",
    "data-remove-el",
    "data-step-back",
    "data-step-forward",
    "data-click-capture",
    "data-drawer-button",
    "data-close-drawer",
    "data-three-js",
    "data-remove",
    "data-pelem",
    "contenteditable"
]));
const DISALLOW_ATTRIBUTE_CUSTOM = ['rel']; // Need to set rel for anchor tags
/**
 * To Know it is user generated content
 */
const ADD_ATTR = ['data-ugc'];
const FORBID_TAGS = [
    'html', // Page Layout
    'base', // Page Layout
    'head', // Page Layout
    'link', // SEO
    'meta', // SEO
    'title', // SEO
    'body', // SEO
    'main', // SEO
    'script', // functionality
    'iframe',
    'fencedframe',
    'object',
    'portal',
    'form', // for right now, you could do something interesting with this
    'style',
    'noscript',
    'form',
    'dialog',
    'slot',
    'template'
];
const FORBID_ATTR = [...DISALLOW_HTMX_ATTRIBUTES, ...DISALLOW_DATA_ATTRIBUTES, ...DISALLOW_ATTRIBUTE_CUSTOM];
/**
 * Purify User Input HTML
 * @param html
 * @returns
 */
function purifyUserInputHTMLForLexical(html) {
    var _a;
    const CONFIG = {
        FORBID_ATTR, // need to add a specific rel attribute for anchor tags
        ADD_ATTR,
        FORBID_TAGS,
        USE_PROFILES: { html: true, mathMl: true, svg: true },
        ALLOW_ARIA_ATTR: false,
        RETURN_DOM: true,
    };
    const { window } = new jsdom_1.JSDOM('');
    const domPurify = (0, dompurify_1.default)(window);
    const images = [];
    const audio = [];
    const video = [];
    domPurify.addHook('afterSanitizeAttributes', (el) => {
        if (el.nodeName && el.nodeName === "A" || el.nodeName && el.nodeName === "AREA") {
            el.setAttribute("rel", "ugc");
            if (!!!String(el.getAttribute('href')).startsWith('#'))
                el.setAttribute("target", "_blank");
        }
    });
    const purifiedHtml = domPurify.sanitize(html, CONFIG);
    const imageElements = Array.from(purifiedHtml.querySelectorAll('img'));
    const audioElements = Array.from(purifiedHtml.querySelectorAll('audio'));
    const videoElements = Array.from(purifiedHtml.querySelectorAll('video'));
    const otherElements = Array.from(purifiedHtml.querySelectorAll('track, embed, source'));
    imageElements.forEach((el) => {
        if (!!!String(el.getAttribute('src')).startsWith('https://image.storething.org')) {
            el.remove();
        }
        const src = String(el.getAttribute('src'));
        var caption = '';
        const short = String(el.getAttribute('alt'));
        const long = String(el.getAttribute('data-text'));
        if (typeof short === "string")
            caption += short;
        if (typeof long === "string")
            caption += ' ' + long;
        const heightStr = el.getAttribute('height');
        const widthStr = el.getAttribute('width');
        const height = heightStr && !!!isNaN(parseFloat(heightStr)) ? parseFloat(heightStr) : undefined;
        const width = widthStr && !!!isNaN(parseFloat(widthStr)) ? parseFloat(widthStr) : undefined;
        images.push({ url: src, caption, height, width });
    });
    audioElements.forEach((el) => {
        if (el.getAttribute('src') && (!!!String(el.getAttribute('src')).startsWith('https://audio.storething.org'))) {
            el.remove();
        }
        else {
            audio.push(String(el.getAttribute('src')));
        }
    });
    videoElements.forEach((el) => {
        if (el.getAttribute('src') && (!!!String(el.getAttribute('src')).startsWith('https://video.storething.org'))) {
            el.remove();
        }
        else {
            const url = String(el.getAttribute('src'));
            const heightStr = el.getAttribute('height');
            const height = heightStr && !!!isNaN(parseFloat(heightStr)) ? parseFloat(heightStr) : undefined;
            const poster = el.getAttribute('poster');
            video.push({ url, height });
            if (poster && poster.startsWith("https://image.storething.org")) {
                images.push({ url: poster, caption: 'Video Poster', width: undefined, height: height });
            }
            else {
                el.removeAttribute('poster');
            }
        }
    });
    otherElements.forEach((el) => {
        if (el.nodeName && el.nodeName === "TRACK") {
            const src = el.getAttribute('src');
            if (!!!src || !!!src.startsWith('/vtt'))
                el.remove();
        }
        else {
            const src = el.getAttribute('src');
            const heightStr = el.getAttribute('height');
            const widthStr = el.getAttribute('width');
            const height = heightStr && !!!isNaN(parseFloat(heightStr)) ? parseFloat(heightStr) : undefined;
            const width = widthStr && !!!isNaN(parseFloat(widthStr)) ? parseFloat(widthStr) : undefined;
            var caption = '';
            const short = String(el.getAttribute('alt'));
            const long = String(el.getAttribute('data-text'));
            if (typeof short === "string")
                caption += short;
            if (typeof long === "string")
                caption += ' ' + long;
            const type = el.getAttribute('type');
            if (!!!src || !!!type)
                el.remove();
            if (String(type).startsWith('img')) {
                if (String(src).startsWith('https://image.storething.org')) {
                    images.push({ url: String(src), caption, width, height });
                }
                else {
                    el.remove();
                }
            }
            else if (String(type).startsWith('audio')) {
                if (String(src).startsWith('https://audio.storething.org')) {
                    audio.push(String(src));
                }
                else {
                    el.remove();
                }
            }
            else if (String(type).startsWith('video')) {
                if (String(src).startsWith('https://video.storething.org')) {
                    video.push({ url: String(src), height });
                }
                else {
                    el.remove();
                }
            }
        }
    });
    const text = ((_a = purifiedHtml.textContent) === null || _a === void 0 ? void 0 : _a.replace(/(\n|\s+)/g, ' ')) || '';
    return { html: purifiedHtml.innerHTML, text, audio, video, images };
}
exports.purifyUserInputHTMLForLexical = purifyUserInputHTMLForLexical;
function updateCustomHTMLLexical(html, media, nsfw_handle) {
    var contains_nsfw = false;
    var able_to_validate = true;
    const { window } = new jsdom_1.JSDOM(html);
    const document = window.document;
    const imageElements = document.querySelectorAll('img');
    const audioElements = Array.from(document.querySelectorAll('audio'));
    const videoElements = Array.from(document.querySelectorAll('video'));
    const otherElements = Array.from(document.querySelectorAll('track, embed, source'));
    const unvalidated_image_urls = [];
    const unvalidated_audio_urls = [];
    const unvalidated_video_urls = [];
    const imageFunc = (el) => {
        const src = String(el.getAttribute('src'));
        if (media.in_images[src]) {
            const { nsfw, ai_caption } = media.in_images[src];
            if (nsfw === null) {
                able_to_validate = false;
                unvalidated_image_urls.push(src);
            }
            else if (nsfw > 90) {
                if (nsfw_handle === "remove") {
                    el.remove();
                }
                else if (nsfw_handle === "set_src") {
                    el.setAttribute("src", "https://cdn.storething.org/frankmbrown/asset/default-image.png");
                }
                else if (nsfw_handle === "notify") {
                    contains_nsfw = true;
                }
            }
            if (ai_caption && !!!el.getAttribute('alt')) {
                el.setAttribute('alt', 'AI Caption: '.concat(ai_caption));
            }
            else if (ai_caption && !!!el.getAttribute('data-text')) {
                el.setAttribute('data-text', 'AI Caption: '.concat(ai_caption));
            }
        }
        else {
            unvalidated_image_urls.push(src);
            able_to_validate = false;
        }
    };
    const audioFunc = (el) => {
        const src = String(el.getAttribute('src'));
        if (media.in_audio[src]) {
            const { flagged } = media.in_audio[src];
            if (flagged === null) {
                able_to_validate = false;
                unvalidated_audio_urls.push(src);
            }
            else if (flagged) {
                if (nsfw_handle === "remove")
                    el.remove();
                else if (nsfw_handle === "set_src")
                    el.setAttribute("src", "https://video.storething.org/frankmbrown/default-video.mp4");
                else if (nsfw_handle === "notify")
                    contains_nsfw = true;
            }
        }
        else {
            unvalidated_audio_urls.push(src);
            able_to_validate = false;
        }
    };
    const videoFunc = (el) => {
        const src = String(el.getAttribute('src'));
        const poster = el.getAttribute('poster');
        if (media.in_video[src]) {
            const { flagged } = media.in_audio[src];
            if (flagged === null) {
                able_to_validate = false;
                unvalidated_video_urls.push(src);
            }
            else if (flagged) {
                if (nsfw_handle === "remove")
                    el.remove();
                else if (nsfw_handle === "set_src")
                    el.setAttribute("src", "https://video.storething.org/frankmbrown/default-video.mp4");
                else if (nsfw_handle === "notify")
                    contains_nsfw = true;
            }
        }
        else {
            unvalidated_video_urls.push(src);
            able_to_validate = false;
        }
        if (poster && poster.startsWith("https://image.storething.org")) {
            if (media.in_images[poster]) {
                const { nsfw } = media.in_images[poster];
                if (nsfw === null) {
                    unvalidated_image_urls.push(poster);
                    able_to_validate = false;
                }
                else if (nsfw > 90) {
                    if (nsfw_handle === "remove") {
                        el.removeAttribute('poster');
                    }
                    else if (nsfw_handle === "set_src") {
                        el.setAttribute("poster", "https://cdn.storething.org/frankmbrown/asset/default-image.png");
                    }
                    else if (nsfw_handle === "notify") {
                        contains_nsfw = true;
                    }
                }
            }
            else {
                able_to_validate = false;
                unvalidated_image_urls.push(src);
            }
        }
    };
    imageElements.forEach((el) => {
        imageFunc(el);
    });
    audioElements.forEach((el) => {
        audioFunc(el);
    });
    videoElements.forEach((el) => {
        videoFunc(el);
    });
    otherElements.forEach((el) => {
        const type = el.getAttribute('type');
        if (String(type).startsWith('img')) {
            imageFunc(el);
        }
        else if (String(type).startsWith('audio')) {
            audioFunc(el);
        }
        else if (String(type).startsWith('video')) {
            videoFunc(el);
        }
    });
    return { html: document.body.innerHTML, contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls };
}
exports.updateCustomHTMLLexical = updateCustomHTMLLexical;
const LEXICAL_INLINE_ALLOWED_TAGS = [
    'b',
    'br',
    'em',
    'i',
    'kbd',
    'mark',
    'q',
    's',
    'span',
    'strong',
    'sub',
    'sup',
    'u'
];
function purifyLexicalMarkdownInlineHTML(html) {
    const CONFIG = {
        ALLOWED_TAGS: LEXICAL_INLINE_ALLOWED_TAGS
    };
    const { window } = new jsdom_1.JSDOM(html);
    const domPurify = (0, dompurify_1.default)(window);
    const purifiedHTML = domPurify.sanitize(html, CONFIG);
    return purifiedHTML;
}
exports.purifyLexicalMarkdownInlineHTML = purifyLexicalMarkdownInlineHTML;
function purifyHTMLDefault(html) {
    const window = new jsdom_1.JSDOM().window;
    const domPurify = (0, dompurify_1.default)(window);
    const purifiedHTML = domPurify.sanitize(html);
    return purifiedHTML;
}
exports.purifyHTMLDefault = purifyHTMLDefault;
const MAX_WIDTH_DESKTOP = 650;
const MAX_WIDTH_TABLET = 500;
const MAX_WIDTH_MOBILE = 350;
const MAX_HEIGHT_DESKTOP = 600;
const MAX_HEIGHT_TABKET = 500;
const MAX_HEIGHT_MOBILE = 400;
const MIN_IMAGE_DIMENSION = 50;
function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
/**
 * Returns widths / heights for image at different sizes. All numbers should be integers.
 * @param width
 * @param height
 * @returns
 */
function getSizesFromWidthAndHeight(width, height) {
    var widthDesktop, heightDesktop, widthTablet, heightTablet, widthMobile, heightMobile;
    const aspectRatioPre = width / height;
    if (aspectRatioPre > 1.05) {
        if (width > MAX_WIDTH_DESKTOP) {
            widthDesktop = MAX_WIDTH_DESKTOP;
        }
        else {
            widthDesktop = Math.round(Math.max(width, 500));
        }
        heightDesktop = Math.round(widthDesktop / aspectRatioPre);
    }
    else {
        if (height > MAX_HEIGHT_DESKTOP) {
            heightDesktop = MAX_HEIGHT_DESKTOP;
        }
        else {
            heightDesktop = Math.round(Math.max(height, 500));
        }
        widthDesktop = Math.round(heightDesktop * aspectRatioPre);
    }
    widthTablet = Math.round(0.77 * widthDesktop);
    heightTablet = Math.round(0.83 * heightDesktop);
    widthMobile = Math.round(0.54 * widthDesktop);
    heightMobile = Math.round(0.66 * heightDesktop);
    var widthGCDPre = widthMobile % 2 === 0 ? widthMobile : widthMobile + 1;
    var heightGCDPre = heightMobile % 2 === 0 ? heightMobile : heightMobile + 1;
    const gcdWidthHeight = gcd(widthGCDPre, heightGCDPre);
    const widthGCD = Math.round(widthGCDPre / gcdWidthHeight);
    const heightGCD = Math.round(heightGCDPre / gcdWidthHeight);
    return { widthDesktop, heightDesktop, widthMobile, heightMobile, widthTablet, heightTablet, aspectRatioStr: `${widthGCD} / ${heightGCD}` };
}
exports.getSizesFromWidthAndHeight = getSizesFromWidthAndHeight;
/**
 * Sizes image assuming desktop
 * @param buffer
 * @returns
 */
function sizeImage(buffer) {
    const size = (0, buffer_image_size_1.default)(buffer);
    var newWidthProperty, newHeightProperty, deviceRatio;
    const { width: widthPropertyPre, height: heightPropertyPre } = size;
    const aspectRatioPre = widthPropertyPre / heightPropertyPre;
    var widthProperty;
    var heightProperty;
    if (aspectRatioPre > 1.05) {
        if (widthPropertyPre > MAX_WIDTH_DESKTOP) {
            widthProperty = MAX_WIDTH_DESKTOP;
            heightProperty = Math.round(MAX_WIDTH_DESKTOP / aspectRatioPre);
        }
        else {
            widthProperty = Math.round(widthPropertyPre);
            heightProperty = Math.round(heightPropertyPre);
        }
    }
    else {
        if (heightPropertyPre > MAX_HEIGHT_DESKTOP) {
            heightProperty = MAX_HEIGHT_DESKTOP;
            widthProperty = Math.round(MAX_HEIGHT_DESKTOP * aspectRatioPre);
        }
        else {
            widthProperty = Math.round(widthPropertyPre);
            heightProperty = Math.round(heightPropertyPre);
        }
    }
    var newWidthProperty = widthProperty;
    var newHeightProperty = heightProperty;
    const aspectRatio = widthProperty / heightProperty;
    if (heightProperty > widthProperty && newHeightProperty < MIN_IMAGE_DIMENSION) {
        newWidthProperty = MIN_IMAGE_DIMENSION;
        newHeightProperty = newWidthProperty * (heightProperty / widthProperty);
    }
    else if (widthProperty > heightProperty && newWidthProperty < MIN_IMAGE_DIMENSION) {
        newHeightProperty = MIN_IMAGE_DIMENSION;
    }
    const widthDesktop = newWidthProperty;
    const heightDesktop = newHeightProperty;
    var widthMobile;
    var heightMobile;
    widthMobile = (widthDesktop / MAX_WIDTH_DESKTOP) * MAX_WIDTH_MOBILE;
    heightMobile = (heightDesktop / MAX_HEIGHT_DESKTOP) * MAX_HEIGHT_MOBILE;
    var newWidth = widthDesktop;
    var newHeight = heightDesktop;
    if (newWidth % 2 !== 0) {
        newWidth += 1;
    }
    if (newHeight % 2 !== 0) {
        newHeight += 1;
    }
    const gcdWidthHeight = gcd(newWidth, newHeight);
    const widthGCD = Math.round(newWidth / gcdWidthHeight);
    const heightGCD = Math.round(newHeight / gcdWidthHeight);
    return { widthDesktop: Math.round(widthDesktop), heightDesktop: Math.round(heightDesktop), widthMobile: Math.round(widthMobile), heightMobile: Math.round(heightMobile), aspectRatioStr: `${widthGCD} / ${heightGCD}` };
}
exports.sizeImage = sizeImage;
async function sizeImageWithSrc(src) {
    try {
        const image = await (0, image_1.getImageFromUrl)(src);
        const { width, height, color: backgroundColor } = (await (0, mediaHelpers_1.getImageMetadata)(image))[0];
        const { widthDesktop, heightDesktop, widthMobile, heightMobile, widthTablet, heightTablet, aspectRatioStr } = getSizesFromWidthAndHeight(width, height);
        const [mobileImage, tabletImage, desktopImage] = await Promise.all([
            (0, cmd_1.executeWithArgument)('magick', ['convert', '-', '-thumbnail', `${widthMobile}x${heightMobile}`, '-background', `${backgroundColor}`, '-gravity', 'center', ...image_1.RESIZE_OPTIONS_BEFORE, '-extent', `${widthMobile}x${heightMobile}`, 'jpeg:-'], image),
            (0, cmd_1.executeWithArgument)('magick', ['convert', '-', '-thumbnail', `${widthTablet}x${heightTablet}`, '-background', `${backgroundColor}`, '-gravity', 'center', ...image_1.RESIZE_OPTIONS_BEFORE, '-extent', `${widthTablet}x${heightTablet}`, 'jpeg:-'], image),
            (0, cmd_1.executeWithArgument)('magick', ['convert', '-', '-thumbnail', `${widthDesktop}x${heightDesktop}`, '-background', `${backgroundColor}`, '-gravity', 'center', ...image_1.RESIZE_OPTIONS_BEFORE, '-extent', `${widthDesktop}x${heightDesktop}`, 'jpeg:-'], image)
        ]);
        const [mobileURL, tabletURL, desktopURL] = await Promise.all([
            (0, aws_implementation_1.uploadImageObject)(`frankmbrown/${crypto.randomUUID()}.jpg`, mobileImage, 'jpg', { width: `${widthMobile}`, height: `${heightMobile}`, "no-index": "true" }, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(`frankmbrown/${crypto.randomUUID()}.jpg`, tabletImage, 'jpg', { width: `${widthTablet}`, height: `${heightTablet}`, "no-index": "true" }, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(`frankmbrown/${crypto.randomUUID()}.jpg`, desktopImage, 'jpg', { width: `${widthTablet}`, height: `${heightTablet}`, "no-index": "true" }, 3, 25)
        ]);
        return {
            style: `max-width: 100%; aspect-ratio: auto ${aspectRatioStr} !important; width: 100%; display: inline-block;`,
            srcset: `${mobileURL} ${widthMobile}w, ${tabletURL} ${widthTablet}w, ${desktopURL} ${widthDesktop}w`,
            sizes: `(max-width: 550px) ${heightMobile}px, ((min-width: 550px) and (max-width: 1200px)) ${heightTablet}px, (min-width: 1200px) ${heightDesktop}px`,
            src: `${desktopURL}`
        };
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
exports.sizeImageWithSrc = sizeImageWithSrc;
async function purifyAndUpdateJupyterNotebookMarkdownHTML(html) {
    const CONFIG = {
        FORBID_ATTR, // need to add a specific rel attribute for anchor tags
        ADD_ATTR,
        FORBID_TAGS,
        USE_PROFILES: { html: true, mathMl: true, svg: true },
        ALLOW_ARIA_ATTR: false,
        RETURN_DOM: true,
    };
    const window = new jsdom_1.JSDOM().window;
    const domPurify = (0, dompurify_1.default)(window);
    domPurify.addHook('afterSanitizeAttributes', (el) => {
        if (el.nodeName && el.nodeName === "A") {
            el.setAttribute("rel", "ugc");
            if (!!!String(el.getAttribute('href')).startsWith('#'))
                el.setAttribute("target", "_blank");
        }
    });
    const purifiedHtml = domPurify.sanitize(html, CONFIG);
    const ps = purifiedHtml.querySelectorAll('blockquote>p');
    ps.forEach((p) => {
        p.className = "";
    });
    const images = purifiedHtml.querySelectorAll('img[data-update-image]');
    const promiseArray = [];
    for (let el of images) {
        const src = el.getAttribute('src');
        if (typeof src === "string" && src.startsWith('https://image.storething.org/frankmbrown')) {
            promiseArray.push(sizeImageWithSrc(src));
        }
    }
    const promiseArrayResp = await Promise.all(promiseArray);
    for (let i = 0; i < images.length; i++) {
        const src = images[i].getAttribute('src');
        if (typeof src === "string" && src.startsWith('https://image.storething.org/frankmbrown')) {
            const objOrNull = promiseArrayResp[i];
            if (objOrNull !== null) {
                const { sizes, srcset, src, style } = objOrNull;
                images[i].setAttribute('sizes', sizes);
                images[i].removeAttribute('data-update-image');
                images[i].setAttribute('src', src);
                images[i].setAttribute('srcset', srcset);
                images[i].setAttribute('style', style);
            }
        }
    }
    const spans = purifiedHtml.querySelectorAll('span.katex-display');
    spans.forEach((el) => {
        el.className = "katex-display hz-scroll";
        el.setAttribute('style', 'overflow-x: auto; overflow-y:hidden; height: auto; padding: 6px 0px;');
    });
    return purifiedHtml.innerHTML;
}
exports.purifyAndUpdateJupyterNotebookMarkdownHTML = purifyAndUpdateJupyterNotebookMarkdownHTML;
function renderMarkdownCode({ block, htmlString, language }) {
    return `${block ? `<!--Split--><div style="position: relative;" class="mt-2"><pre class="hz-scroll"><code class="hljs" data-language="${language}">${htmlString}</code></pre>
  <button aria-label="Copy Code Output" data-snackbar data-selem="#copy-code-success" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;" aria-haspopup="true">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
      </path>
    </svg>
  </button>
</div><!--Split-->
` : `
<!--Split--><span><code class="hljs">${htmlString}</code></span><!--Split-->
`}`;
}
exports.renderMarkdownCode = renderMarkdownCode;
function renderMath({ inline, math }) {
    const htmlString = katex_1.default.renderToString(math, { throwOnError: false, displayMode: !!!inline, leqno: false, fleqn: false, });
    const copyHtmlID = `cop_html_`.concat(Math.random().toString().slice(2));
    const copyInputID = 'cop_inp_'.concat(Math.random().toString().slice(2));
    const block = !!!inline;
    const htmlStr = htmlString;
    const dialog = false;
    const input = math;
    return `
  <div style="margin: 0.25rem; position: relative; overflow-x: auto;" class="hz-scroll">
  ${block ? `
  <div id="${copyHtmlID}" class="katex-block" style="position: relative;">
    ${htmlStr}
      <button 
        type="button" 
        data-snackbar 
        data-selem="#${dialog ? 'copy-math-success-dialog' : 'copy-math-success'}" 
        data-copy-input 
        data-input="${copyInputID}"
        aria-haspopup="true"
        class="toggle-button dark small" style="position: absolute; top: 3px; right: 3px; z-index: 2;"
        aria-label="Copy TeX Expression"
        >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
          </path>
        </svg>
        <input hidden type="text" name="${copyInputID}" id="${copyInputID}" value="${input}" />
      </button>
    </div> 
  ` : `
      <span id="${copyHtmlID}" class="inline-katex">
      ${htmlStr}
      </span>
  `}
  </div>
  `;
}
const getCheckbox = (checked) => {
    const classNum = Math.floor(Math.random() * 6);
    const other = `${checked ? 'checked' : ''} style="display:inline;"`;
    switch (classNum) {
        case 0: {
            return `<input type="checkbox" class="primary" ${other} />`;
        }
        case 1: {
            return `<input type="checkbox" class="secondary" ${other} />`;
        }
        case 2: {
            return `<input type="checkbox" class="error" ${other} />`;
        }
        case 3: {
            return `<input type="checkbox" class="info" ${other} />`;
        }
        case 4: {
            return `<input type="checkbox" class="warning" ${other} />`;
        }
        case 5: {
            return `<input type="checkbox" class="success" ${other} />`;
        }
        default: {
            return `<input type="checkbox" class="primary" ${other} />`;
        }
    }
};
exports.myDesignSystemMarkdownRenderer = {
    code(code, infostring, escaped) {
        if (infostring) {
            if (infostring === 'math') {
                return renderMath({ inline: false, math: code });
            }
            else if (HLJS_CODING_LANGUAGES_AVAILABLE.has(infostring)) {
                const highlightResult = highlight_js_1.default.highlight(code, { language: infostring, ignoreIllegals: true });
                const htmlString = highlightResult.value;
                return renderMarkdownCode({ block: true, htmlString, language: infostring });
            }
            else {
                const highlightResult = highlight_js_1.default.highlightAuto(code);
                const htmlString = highlightResult.value;
                return renderMarkdownCode({ block: true, htmlString, language: highlightResult.language || '' });
            }
        }
        else {
            const highlightResult = highlight_js_1.default.highlightAuto(code);
            const htmlString = highlightResult.value;
            return renderMarkdownCode({ block: true, htmlString, language: highlightResult.language || '' });
        }
    },
    blockquote(quote) {
        return `<blockquote class="blockquote mt-3">${quote}</blockquote>`;
    },
    html(html, block) {
        return purifyHTMLDefault(html);
    },
    heading(text, level, raw) {
        level = Math.max(2, Math.min(6, level));
        const id = 'id_'.concat(Math.random().toString().slice(2));
        if (level <= 2) {
            return `<section id="${id}" class="mt-4">
      <h${level} class="bold bb-thick h2">
        <a href="#${id}" class="same-page fw-regular">
          ${text}
        </a>
      </h${level}>
  </section>`;
        }
        return `<h${level} class="h${level} bold mt-3">${text}</h${level}>`;
    },
    hr() {
        return `<hr/>`;
    },
    list(body, ordered, start) {
        const t = ordered ? 'ol' : 'ul';
        var newStart = start ? Math.max(1, start) : 1;
        return `<${t} class="mt-3" start="${newStart}">${body}</${t}>`;
    },
    listitem(text, task, checked) {
        if (task) {
            return `<li class="flex-row justify-start gap-3 align-center">
      <span style="position: relative; bottom: 4px;">
      ${text}
      </span>
      </li>`;
        }
        else {
            return `<li>${text}</li>`;
        }
    },
    checkbox(checked) {
        return getCheckbox(checked);
    },
    paragraph(text) {
        return `<p class="body1 mt-3">${text}</p>`;
    },
    table(header, body) {
        return `
  <div class="table-wrapper mt-3">
  <table cellspacing="0">
    <thead>
      ${header}
    </thead>
    ${body}
  </table>
  </div>`;
    },
    tablerow(content) {
        return `<tr>${content}</tr>`;
    },
    tablecell(content, flags) {
        var isHeader = flags.header;
        const style = flags.align ? `style="text-align: ${flags.align};"` : 'style="text-align: center;"';
        if (isHeader) {
            return `<th ${style}>${content}</th>`;
        }
        else {
            return `<td ${style}>${content}</td>`;
        }
    },
    strong(text) {
        return `<strong class="bolder">${text}</strong>`;
    },
    em(text) {
        return `<em class="italic">${text}</em>`;
    },
    codespan(code) {
        return `<span class="text-code">${code}</span>`;
    },
    br() {
        return `<br />`;
    },
    del(text) {
        return `<del>${text}</del>`;
    },
    link(href, title, text) {
        const titleAttr = title ? `title="${title}"` : '';
        return `<a class="secondary link fw-regular" target="_blank" href="${href}" ${titleAttr}>${text}</a>`;
    },
    image(href, title, text) {
        if (href.startsWith('https://image.storething.org/frankmbrown')) {
            return `<div class="flex-row justify-center align-center" style="margin: 6px 0px;"><img  src="${href}" alt="${(0, escape_html_1.default)(text)}" data-update-image /></div>`;
        }
        else {
            return '';
        }
    },
    text(text) {
        return `${text}`;
    }
};
exports.defaultMarkdownRenderer = {
    code(code, infostring, escaped) {
        if (infostring) {
            if (infostring === 'math') {
                return renderMath({ inline: false, math: code });
            }
            else if (HLJS_CODING_LANGUAGES_AVAILABLE.has(infostring)) {
                const highlightResult = highlight_js_1.default.highlight(code, { language: infostring, ignoreIllegals: true });
                const htmlString = highlightResult.value;
                return renderMarkdownCode({ block: true, htmlString, language: infostring });
            }
            else {
                const highlightResult = highlight_js_1.default.highlightAuto(code);
                const htmlString = highlightResult.value;
                return renderMarkdownCode({ block: true, htmlString, language: highlightResult.language || '' });
            }
        }
        else {
            const highlightResult = highlight_js_1.default.highlightAuto(code);
            const htmlString = highlightResult.value;
            return renderMarkdownCode({ block: true, htmlString, language: highlightResult.language || '' });
        }
    },
    blockquote(quote) {
        return `<blockquote class="blockquote">${quote}</blockquote>`;
    },
    html(html, block) {
        return purifyHTMLDefault(html);
    },
    heading(text, level, raw) {
        level = Math.max(1, Math.min(6, level));
        return `<h${level} class="h${level} bold">${text}</h${level}>`;
    },
    hr() {
        return `<hr/>`;
    },
    list(body, ordered, start) {
        const t = ordered ? 'ol' : 'ul';
        var newStart = start ? Math.max(1, start) : 1;
        return `<${t} start="${newStart}">${body}</${t}>`;
    },
    listitem(text, task, checked) {
        if (task) {
            return `<li class="flex-row justify-start gap-3 align-center">
      <span style="position: relative; bottom: 4px;">
      ${text}
      </span>
      </li>`;
        }
        else {
            return `<li>${text}</li>`;
        }
    },
    checkbox(checked) {
        return getCheckbox(checked);
    },
    paragraph(text) {
        return `<p class="body1">${text}</p>`;
    },
    table(header, body) {
        return `<div class="lexical-wrapper"><table cellspacing="0"><caption>${header}</caption>${body}</table></div>`;
    },
    tablerow(content) {
        return `<tr>${content}</tr>`;
    },
    tablecell(content, flags) {
        var isHeader = flags.header;
        const style = flags.align ? `style="text-align: ${flags.align};"` : '';
        if (isHeader) {
            return `<th ${style}>${content}</th>`;
        }
        else {
            return `<td ${style}>${content}</td>`;
        }
    },
    strong(text) {
        return `<strong class="bolder">${text}</strong>`;
    },
    em(text) {
        return `<em class="italic">${text}</em>`;
    },
    codespan(code) {
        return `<span class="text-code">${code}</span>`;
    },
    br() {
        return `<br />`;
    },
    del(text) {
        return `<del>${text}</del>`;
    },
    link(href, title, text) {
        const titleAttr = title ? `title="${title}"` : '';
        return `<a class="secondary link fw-regular" target="_blank" href="${href}" ${titleAttr}>${text}</a>`;
    },
    image(href, title, text) {
        return ``;
    },
    text(text) {
        return `${text}`;
    }
};
exports.lexicalMarkdownRenderer = {
    code(code, infostring, escaped) {
        var lang = 'javacript';
        if (infostring && personal_website_shared_1.ALLOWED_PRISM_LANGUAGES.has(infostring)) {
            lang = infostring;
        }
        var html = '';
        if (personal_website_shared_1.Prism.languages[lang]) {
            html = personal_website_shared_1.Prism.highlight(code, personal_website_shared_1.Prism.languages[lang], lang);
        }
        else {
            lang = 'code';
            html = (0, escape_html_1.default)(code);
        }
        return `<pre spellcheck="false" data-only-code-editor="false" data-highlight-language="${(0, escape_html_1.default)(lang)}" data-v="1" class="first-rte-element">${html}</pre>`;
    },
    blockquote(quote) {
        return `<blockquote class="blockquote" data-v="1" dir="ltr" data-e-indent="0">${quote}</blockquote>`;
    },
    html(html, block) {
        if (block) {
            return `<div data-custom-code="" data-editing="false" class="first-rte-element"><div data-html="">${purifyHTMLDefault(html)}</div></div>`;
        }
        else {
            return purifyLexicalMarkdownInlineHTML(html).toString();
        }
    },
    heading(text, level, raw) {
        level = Math.max(2, Math.min(6, level));
        return `<h${level} class="h${level}" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr">${text}</h${level}>`;
    },
    hr() {
        return `<hr class="lexical divider-color" style="border-bottom-width: 3px !important;" data-color="var(--divider)" data-width="3" data-v="1" />`;
    },
    list(body, ordered, start) {
        const t = ordered ? 'ol' : 'ul';
        var newStart = start ? Math.max(1, start) : 1;
        return `<${t} class="mt-3" ${t === 'ol' ? `start="${newStart}"` : ``} style="text-align: left; margin: 6px 0px 6px 0px; padding-top: 0px; padding-bottom: 0px;" data-v="1" dir="ltr">${body}</${t}>`;
    },
    listitem(text, task, checked) {
        if (task) {
            return `<li role="checkbox" tabindex="-1" aria-checked="${checked}" class="rte-li-unchecked" data-v="1">${text}</li>`;
        }
        else {
            return `<li data-v="1">${text}</li>`;
        }
    },
    paragraph(text) {
        return `<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0">${text.length ? text : `<br />`}</p>`;
    },
    table(header, body) {
        return `
  <div class="table-wrapper" data-v="1">
  <table cellspacing="0" class="rte-table" style="margin: 10px auto;" data-v="1" ${header.trim().length ? `data-caption="${(0, escape_html_1.default)(header.trim())}"` : ``}>
    ${body}
  </table>
  </div>`;
    },
    tablerow(content) {
        return `<tr data-v="1">${content}</tr>`;
    },
    tablecell(content, flags) {
        var isHeader = flags.header;
        const style = flags.align ? `style="text-align: ${flags.align};"` : 'style="text-align: center;"';
        const length = content.replace(/s+/g, ' ').trim().length;
        const width = 6 * length > 150 ? 150 : Math.max(6 * length, 50);
        if (isHeader) {
            return `<th ${style} scope="col" class="rte-tableCell rte-tableCellHeader" data-v="1" data-scope="col"><p class="lex-grid-p" data-v="1" ${style} dir="ltr">${content}</p></th>`;
        }
        else {
            return `<td ${style} style="width: ${width}px; vertical-align: middle; text-align: start;" class="rte-tableCell" data-v="1"><p class="lex-grid-p" data-v="1" ${style} dir="ltr">${content}</p></td>`;
        }
    },
    strong(text) {
        return `<strong class="bolder" data-v="1" style="white-space: pre-wrap;">${text}</strong>`;
    },
    em(text) {
        return `<i data-v="1"><em class="italic" data-v="1" style="white-space: pre-wrap;">${text}</em></i>`;
    },
    codespan(code) {
        return `<code spellcheck="false" data-v="1" style="white-space: pre-wrap;"><span class="text-code">${code}</span></code>`;
    },
    br() {
        return `<br />`;
    },
    del(text) {
        return `<s data-v="1"><span class="strikethrough" data-v="1" style="white-space: pre-wrap;">${text}</span></s>`;
    },
    link(href, title, text) {
        return `<a href="${href}" data-v="1" class="lexical-link"><span data-v="1" style="white-space: pre-wrap;">${text}</span></a>`;
    },
    image(href, title, text) {
        if (href.startsWith('https://image.storething.org/frankmbrown')) {
            return `<p class="lex-p" style="text-align: center; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" data-e-indent="0"><img loading="lazy" data-v="1" src="${href}" alt="${(0, escape_html_1.default)(title)}" data-text="${(0, escape_html_1.default)(text)}" data-original-device="desktop" style="max-width: 100%;" class="img-node"></p>`;
        }
        else {
            return false;
        }
    },
    text(text) {
        return `<span data-v="1" style="white-space: pre-wrap;">${text}</span>`;
    }
};
/* --------------------------------------- Marked KateX Replacement for Lexial --------------------- */
function escapeAttribute(s) {
    return (0, escape_html_1.default)(String(s));
}
const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1(?=[\s?!\.,:？！。，：]|$)/;
const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1/;
const blockRule = /^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/;
function markedKatexLexical(options = {}) {
    const nonStandard = options && options.nonStandard;
    const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule;
    return {
        extensions: [
            {
                name: 'inlineKatex',
                level: 'inline',
                start(src) {
                    let index;
                    let indexSrc = src;
                    while (indexSrc) {
                        index = indexSrc.indexOf('$');
                        if (index === -1) {
                            return;
                        }
                        const f = nonStandard ? index > -1 : index === 0 || indexSrc.charAt(index - 1) === ' ';
                        if (f) {
                            const possibleKatex = indexSrc.substring(index);
                            if (possibleKatex.match(ruleReg)) {
                                return index;
                            }
                        }
                        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, '');
                    }
                },
                tokenizer(src, tokens) {
                    const match = src.match(ruleReg);
                    if (match) {
                        return {
                            type: 'inlineKatex',
                            raw: match[0],
                            text: match[2].trim(),
                            displayMode: match[1].length === 2,
                        };
                    }
                },
                renderer: (token) => {
                    const equation = btoa(typeof token.text === "string" ? token.text : '');
                    const options = {
                        displayMode: false, // true === block display //
                        errorColor: '#cc0000',
                        output: 'html',
                        strict: false,
                        throwOnError: false,
                        trust: false,
                    };
                    const str = katex_1.default.renderToString(typeof token.text === "string" ? token.text : '', options);
                    const span = `<span data-frank-inline="true" data-frank-equation="${escapeAttribute(equation)}" data-v="1">${str}</span>`;
                    return span;
                },
            },
            {
                name: 'blockKatex',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(blockRule);
                    if (match) {
                        return {
                            type: 'blockKatex',
                            raw: match[0],
                            text: match[2].trim(),
                            displayMode: match[1].length === 2,
                        };
                    }
                },
                renderer: (token) => {
                    const equation = btoa(typeof token.text === "string" ? token.text : '');
                    const options = {
                        displayMode: true, // true === block display //
                        errorColor: '#cc0000',
                        output: 'html',
                        strict: false,
                        throwOnError: false,
                        trust: false,
                    };
                    const str = katex_1.default.renderToString(typeof token.text === "string" ? token.text : '', options);
                    const span = `<div data-frank-inline="false" data-frank-equation="${escapeAttribute(equation)}" data-v="1">${str}</div>`;
                    return span;
                },
            }
        ],
    };
}
exports.markedKatexLexical = markedKatexLexical;
const ABBREVIATION_INLINE_RULE = /^\[>\((.*?)\)\s(.*?)\]/;
function markedAbbrevation() {
    return {
        extensions: [
            {
                name: 'abbreviation',
                level: 'inline',
                start(src) {
                    let index;
                    let indexSrc = src;
                    while (indexSrc) {
                        index = indexSrc.indexOf('[');
                        if (index === -1) {
                            return;
                        }
                        const f = index === 0 || indexSrc.charAt(index - 1) === ' ';
                        if (f) {
                            const possibleMatch = indexSrc.substring(index);
                            if (possibleMatch.match(ABBREVIATION_INLINE_RULE)) {
                                return index;
                            }
                        }
                        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, '');
                    }
                },
                tokenizer(src, tokens) {
                    const match = src.match(ABBREVIATION_INLINE_RULE);
                    if (match && match.length >= 3) {
                        return {
                            type: 'abbreviation',
                            raw: match[0],
                            title: match[1].trim(),
                            text: match[2].trim()
                        };
                    }
                },
                renderer: (obj) => {
                    return `<arr data-v="1" spellcheck="false" title="${escapeAttribute(obj.title)}"><span data-v="1" style="white-space: pre-wrap;"></span></abbr>`;
                },
            },
        ]
    };
}
exports.markedAbbrevation = markedAbbrevation;
const HORIZONTAL_RULE = /^-----(\[#[0-9a-fA-F]{6}\])?(\[[1-{10}]\])?/;
const VALID_HEX_REGEX = /^#[0-9a-fA-F]{6}$/i;
function markedHorizontalRule() {
    return {
        extensions: [
            {
                name: 'hr_custom',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(HORIZONTAL_RULE);
                    if (match) {
                        return {
                            type: 'hr_custom',
                            raw: match[0],
                            match_1: (match === null || match === void 0 ? void 0 : match[1]) || null,
                            match_2: (match === null || match === void 0 ? void 0 : match[2]) || null
                        };
                    }
                },
                renderer: (obj) => {
                    var className = "lexical";
                    var color = 'var(--divider)';
                    var size = 3;
                    if (obj.match_1 && obj.match_2) {
                        const match_1_true = obj.match_1.slice(1, obj.match_1.length - 1);
                        const match_2_true = obj.match_2.slice(1, obj.match_2.length - 1);
                        if (VALID_HEX_REGEX.test(match_1_true)) {
                            color = match_1_true;
                        }
                        if (parseInt(match_2_true) > 0 && parseInt(match_2_true) < 11) {
                            size = parseInt(match_2_true);
                        }
                    }
                    else if (obj.match_1) {
                        const match_1_true = obj.match_1.slice(1, obj.match_1.length - 1);
                        if (VALID_HEX_REGEX.test(match_1_true)) {
                            color = match_1_true;
                        }
                        else if (parseInt(match_1_true) > 0 && parseInt(match_1_true) < 11) {
                            size = parseInt(match_1_true);
                        }
                    }
                    var cssString = "border-bottom-width: ".concat(String(size)).concat('px !important;');
                    if (color === "var(--divider)" || !!!color) {
                        className += ' divider-color';
                        cssString += `border-bottom-color: ${color} !important;`;
                    }
                    else if (VALID_HEX_REGEX.test(color)) {
                        cssString += `border-bottom-color: ${color} !important;`;
                    }
                    return `<hr data-v="1" data-color="${escapeAttribute(color)}" data-width="${escapeAttribute(size)}" style="${cssString}" class="${className}" />`;
                },
            }
        ]
    };
}
exports.markedHorizontalRule = markedHorizontalRule;
const NEWS_RULE = /^!!\[News Node\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)/;
function markedNews() {
    return {
        extensions: [
            {
                name: 'news',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(NEWS_RULE);
                    if (match && match.length === 6) {
                        const url = match[1].replace(/\\\)/g, ')');
                        const title = match[2].replace(/\\\)/g, ')');
                        const description = match[3].replace(/\\\)/g, ')');
                        const imageURL = match[4].replace(/\\\)/g, ')');
                        const host = match[5].replace(/\\\)/g, ')');
                        return {
                            type: 'news',
                            raw: match[0],
                            url,
                            title,
                            description,
                            imageURL,
                            host
                        };
                    }
                },
                renderer: (obj) => {
                    return `<div data-v="1" data-href="${escapeAttribute(obj.url)}" data-news-title="${escapeAttribute(obj.title)}" data-news-description="${escapeAttribute(obj.description)}" data-news-image-url="${escapeAttribute(obj.imageURL)}" data-host="${escapeAttribute(obj.host)}"></div>`;
                },
            }
        ]
    };
}
exports.markedNews = markedNews;
const YOUTUBE_RULE = /^!!\[YouTube Node\]\((.*?)\)/;
function markedYoutube() {
    return {
        extensions: [
            {
                name: 'youtube',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(YOUTUBE_RULE);
                    if (match && match.length === 2) {
                        const id = match[1];
                        return {
                            type: 'youtube',
                            raw: match[0],
                            id
                        };
                    }
                },
                renderer: (obj) => {
                    return `<iframe data-text-align="center" class="youtube-embed" width="560" height="315" src="${escapeAttribute('https://www.youtube-nocookie.com/embed/'.concat(obj.id))}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true" data-frank-youtube loading="lazy"></iframe>`;
                },
            }
        ]
    };
}
exports.markedYoutube = markedYoutube;
const TWITTER_RULE = /^<div(.*?)data-twitter(.*?)>(.*?)<\/div>/;
function markedTwitter() {
    return {
        extensions: [
            {
                name: 'twitter',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(TWITTER_RULE);
                    if (match && match.length === 4) {
                        const tweet = match[3];
                        try {
                            const valid_twitter = (0, socialMedia_1.validateTwitterEmbed)(tweet);
                            return {
                                type: 'twitter',
                                raw: match[0],
                                tweet: valid_twitter
                            };
                        }
                        catch (e) {
                            console.error("Invalid Twitter Node");
                        }
                    }
                },
                renderer: (obj) => {
                    return `<div class="twitter-wrapper" data-twitter>${obj.tweet}</div>`;
                },
            }
        ]
    };
}
exports.markedTwitter = markedTwitter;
const TIK_TOK_RULE = /^<div(.*?)data-tiktok(.*?)>(.*?)<\/div>/;
function markedTikTok() {
    return {
        extensions: [
            {
                name: 'tiktok',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(TIK_TOK_RULE);
                    if (match && match.length === 4) {
                        const tiktok = match[3];
                        try {
                            const valid_tik = (0, socialMedia_1.validateTikTokEmbed)(tiktok);
                            return {
                                type: 'tiktok',
                                raw: match[0],
                                tiktok: valid_tik
                            };
                        }
                        catch (e) {
                            console.error("Invalid TikTok Node");
                        }
                    }
                },
                renderer: (obj) => {
                    return `<div class="tiktok-wrapper" data-tiktok>${obj.tiktok}</div>`;
                },
            }
        ]
    };
}
exports.markedTikTok = markedTikTok;
const INSTAGRAM_RULE = /^<div(.*?)data-instagram(.*?)>(.*?)<\/div>/;
function markedInstagram() {
    return {
        extensions: [
            {
                name: 'instagram',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(INSTAGRAM_RULE);
                    if (match && match.length === 4) {
                        const insta = match[3];
                        try {
                            const valid_insta = (0, socialMedia_1.validateInstagramEmbed)(insta);
                            return {
                                type: 'instagram',
                                raw: match[0],
                                insta: valid_insta
                            };
                        }
                        catch (e) {
                            console.error("Invalid Instagram Node");
                        }
                    }
                },
                renderer: (obj) => {
                    return `<div data-instagram class="instagram-wrapper">${obj.insta}</div>`;
                },
            }
        ]
    };
}
exports.markedInstagram = markedInstagram;
const IMAGE_RULE_NEW = /^!\[(.*?)\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)(\(.*?\))?/;
function markedImage() {
    return {
        extensions: [
            {
                name: 'image_new',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(IMAGE_RULE_NEW);
                    if (match && (match.length === 7 || match.length === 8)) {
                        const [raw_temp, alt_temp, src_temp, long_temp, width_temp, height_temp, originalDevice_temp] = match.slice(0, 7);
                        if (src.startsWith('https://image.storething.org')) {
                            var background_color = undefined;
                            if (match[7] && VALID_HEX_REGEX.test(match[7])) {
                                background_color = match[7];
                            }
                            return {
                                type: 'image_new',
                                raw: raw_temp,
                                src: src_temp,
                                short: alt_temp,
                                long: long_temp,
                                width: Number(width_temp),
                                height: Number(height_temp),
                                original_device: originalDevice_temp,
                                background_color
                            };
                        }
                    }
                },
                renderer: (obj) => {
                    return `<img ${obj.background_color ? `data-bg-color="${escapeAttribute(obj.background_color)}"` : ``} src="${escapeAttribute(obj.src)}" alt="${escapeAttribute(obj.short)}" data-text="${escapeAttribute(obj.long)}" width="${escapeAttribute(obj.width)}" height="${escapeAttribute(obj.height)}" data-original-device="${obj.original_device}" />`;
                },
            }
        ]
    };
}
exports.markedImage = markedImage;
const IMAGE_CAROUSEL_RULE = /^!!\[CarouselImage Node\]\((.*?)\)/;
function markedImageCarousel() {
    return {
        extensions: [
            {
                name: 'image_carousel',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(IMAGE_CAROUSEL_RULE);
                    if (match && match.length === 2) {
                        try {
                            const json = JSON.parse(match[1]);
                            if (Array.isArray(json)) {
                                const new_json = json.filter((obj) => Boolean(typeof obj.width === "number" &&
                                    typeof obj.height === "number" &&
                                    typeof obj.src === "string" &&
                                    obj.src.startsWith('https://image.storething.org') &&
                                    typeof obj.short === "string" &&
                                    typeof obj.long === "string"));
                                if (new_json.length) {
                                    return {
                                        type: 'image_carousel',
                                        raw: match[0],
                                        json: new_json
                                    };
                                }
                            }
                        }
                        catch (e) {
                            console.error("Something went wrong parsing JSON for Carousel Image Node");
                        }
                    }
                },
                renderer: (obj) => {
                    const div = document.createElement('div');
                    return `<div data-image-list="${escapeAttribute(JSON.stringify(obj.json))}" data-image-carousel="true" style="max-height: 300px; min-height: 300px; height: 300px;" class="block"></div>`;
                },
            }
        ]
    };
}
exports.markedImageCarousel = markedImageCarousel;
const AUDIO_RULE = /^!!\[Audio Node\]\((.*?)\)\((.*?)\)/;
function markedAudio() {
    return {
        extensions: [
            {
                name: 'audio',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(AUDIO_RULE);
                    if (match && match.length === 3) {
                        const src = match[1];
                        const title = match[2];
                        if (src.startsWith('https://audio.storething.org')) {
                            return {
                                type: 'audio',
                                raw: match[0],
                                src,
                                title: title.slice(0, 50)
                            };
                        }
                    }
                },
                renderer: (obj) => {
                    return `<audio data-src="${escapeAttribute(obj.src)}" data-title="${escapeAttribute(obj.title)}" data-v="1"></audio>`;
                },
            }
        ]
    };
}
exports.markedAudio = markedAudio;
const VIDEO_RULE = /^!!\[Video Node\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)/;
function markedVideo() {
    return {
        extensions: [
            {
                name: 'video',
                level: 'block',
                tokenizer(src, tokens) {
                    const match = src.match(VIDEO_RULE);
                    if (match && match.length === 5) {
                        const src = match[1];
                        const title = match[2];
                        const description = match[3];
                        const height = match[4];
                        if (src.startsWith('https://video.storething.org')) {
                            return {
                                type: 'video',
                                raw: match[0],
                                src,
                                title,
                                description,
                                height
                            };
                        }
                    }
                },
                renderer: (obj) => {
                    return `<video data-src="${escapeAttribute(obj.src)}" data-title="${escapeAttribute(obj.title)}" data-description="${escapeAttribute(obj.description)}" height="${escapeAttribute(Math.max(obj.height, 400))}"></video>`;
                },
            }
        ]
    };
}
exports.markedVideo = markedVideo;
/* ----------------------------------------------------------- */
async function parseMarkdown(s, obj = DEFAULT_MARKDOWN_OPTIONS) {
    try {
        const { design_system, breaks, gfm, pedantic } = obj;
        marked_1.marked.use((0, marked_katex_extension_1.default)()); // https://github.com/UziTech/marked-katex-extension
        marked_1.marked.use((0, marked_extended_tables_1.markedExtendedTables)()); // https://github.com/calculuschild/marked-extended-tables
        marked_1.marked.use((0, marked_footnote_1.default)()); // https://github.com/bent10/marked-extensions/tree/main/packages/footnote 
        if (design_system === 'my-design-system') {
            marked_1.marked.use({ renderer: exports.myDesignSystemMarkdownRenderer });
        }
        else {
            marked_1.marked.use({ renderer: exports.defaultMarkdownRenderer });
        }
        marked_1.marked.use({
            async: true,
            breaks: breaks,
            gfm: gfm,
            pedantic: pedantic
        });
        const resp = await (0, marked_1.marked)(s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""));
        const respNew = await purifyAndUpdateJupyterNotebookMarkdownHTML(resp);
        return respNew;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to parse markdown.');
    }
}
exports.parseMarkdown = parseMarkdown;
function getTableOfContentsFromMarkdownHTML(html, designSystem) {
    const tableOfContents = [];
    var newHTML = html;
    const dom = new jsdom_1.JSDOM(newHTML);
    const document = dom.window.document;
    if (designSystem === 'my-design-system') {
        const links = Array.from(document.querySelectorAll('h2>a[href^="#"], h3>a[href^="#"], h4>a[href^="#"]'));
        links.forEach((link) => {
            var _a, _b, _c;
            const id = ((_a = link.getAttribute('href')) === null || _a === void 0 ? void 0 : _a.slice(1)) || '';
            const text = ((_c = (_b = link.textContent) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.slice(0, 30)) || '';
            if (id.length && text.length) {
                tableOfContents.push({ id, text });
            }
        });
    }
    else {
        const addLinkHeaders = Array.from(document.querySelectorAll('a.same-page'));
        addLinkHeaders.forEach((el) => {
            var _a;
            const id = el.id;
            const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim().replace(/(\s+|\n)/g, ' ').slice(0, 50)) || '';
            if (text.length && id.length) {
                tableOfContents.push({ id, text });
            }
        });
    }
    return { html: dom.window.document.body.innerHTML, table_of_contents: tableOfContents };
}
exports.getTableOfContentsFromMarkdownHTML = getTableOfContentsFromMarkdownHTML;
async function markdownToHTMLAi(s) {
    try {
        marked_1.marked.use(markedKatexLexical());
        marked_1.marked.use((0, marked_extended_tables_1.markedExtendedTables)()); // https://github.com/calculuschild/marked-extended-tables
        marked_1.marked.use((0, marked_footnote_1.default)()); // https://github.com/bent10/marked-extensions/tree/main/packages/footnote 
        marked_1.marked.use({ renderer: exports.lexicalMarkdownRenderer });
        const resp = await (0, marked_1.marked)(s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""));
        const respNew = purifyHTMLDefault(resp);
        return respNew;
    }
    catch (e) {
        console.error(e);
        throw new Error("Something went wrong converting AI markdown to HTML.");
    }
}
exports.markdownToHTMLAi = markdownToHTMLAi;
