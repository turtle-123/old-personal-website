import { Prism, RendererObject, loadLanguages, DOMPurify, markedKatex, markedExtendedTables, markedFootnote, marked, katex, validateTwitterEmbed, validateTikTokEmbed, validateInstagramEmbed,DOMPURIFY_DEFAULT_ELS, DOMPURIFY_DEFAULT_ATTRS } from 'personal-website-shared';

import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-objectivec';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-plsql';
import 'prismjs/components/prism-armasm';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-excel-formula';
import 'prismjs/components/prism-gcode';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-shell-session';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-wasm';
import 'prismjs/components/prism-basic';
import 'prismjs/components/prism-latex';

/* --------------------------------------- Marked KateX Replacement for Lexial --------------------- */ 
function escapeAttribute(s:string|Number) {
  const span = document.createElement('span');
  span.setAttribute('data-attr',String(s));
  const new_s = span.getAttribute('data-attr');
  return new_s;
}
const inlineRule = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1(?=[\s?!\.,:？！。，：]|$)/;
const inlineRuleNonStandard = /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n\$]))\1/; // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule = /^(\${1,2})\n((?:\\[^]|[^\\])+?)\n\1(?:\n|$)/;

export function markedKatexLexical(options:any={}) {
  const nonStandard = options && options.nonStandard;
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule;

  return {
    extensions: [
      {
        name: 'inlineKatex',
        level: 'inline',
        start(src:string) {
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
        tokenizer(src:string, tokens:any) {
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
        renderer: (token:any) => {
          const equation = window.btoa(typeof token.text==="string" ? token.text : '');
          const el = document.createElement('span');
          el.setAttribute('data-frank-inline','true');
          el.setAttribute('data-frank-equation',equation);
          el.setAttribute('data-v','1');
          katex.render(typeof token.text==="string" ? token.text : '',el,{
            displayMode: false, // true === block display //
            errorColor: '#cc0000',
            output: 'html',
            strict: false,
            throwOnError: false,
            trust: false,
          });
          return el.outerHTML;
        },
      },
      {
        name: 'blockKatex',
        level: 'block',
        tokenizer(src:string, tokens:any) {
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
        renderer: (token:any) => {
          const equation = window.btoa(typeof token.text==="string" ? token.text : '');
          const el = document.createElement('div');
          el.setAttribute('data-frank-inline','false');
          el.setAttribute('data-frank-equation',equation);
          el.setAttribute('data-v','1');
          katex.render(typeof token.text==="string" ? token.text : '',el,{
            displayMode: true, // true === block display //
            errorColor: '#cc0000',
            output: 'html',
            strict: false,
            throwOnError: false,
            trust: false,
          });
          return el.outerHTML;
        },
      }
    ],
  };
}

const ABBREVIATION_INLINE_RULE = /^\[>\((.*?)\)\s(.*?)\]/
export function markedAbbrevation() {
  return {
    extensions: [
      {
        name: 'abbreviation',
        level: 'inline',
        start(src:string) {
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
        tokenizer(src:string, tokens:any) {
          const match = src.match(ABBREVIATION_INLINE_RULE);
          if (match&&match.length>=3) {
            return {
              type: 'abbreviation',
              raw: match[0],
              title: match[1].trim(),
              text: match[2].trim()
            };
          }
        },
        renderer: (obj:any) => {
          const abbr = document.createElement('abbr');
          abbr.setAttribute('title',obj.title);
          abbr.setAttribute('data-v','1');
          abbr.setAttribute('spellcheck','false');
          const span = document.createElement('span');
          span.setAttribute('data-v','1');
          span.style.cssText = "white-space: pre-wrap;";
          span.innerText = obj.text;
          abbr.append(span);
          return abbr.outerHTML;
        },
      },
    ]
  }
}

const HORIZONTAL_RULE = /^-----(\[#[0-9a-fA-F]{6}\])?(\[[1-{10}]\])?/;
const VALID_HEX_REGEX = /^#[0-9a-fA-F]{6}$/i;
export function markedHorizontalRule() {
  return {
    extensions: [
      {
        name: 'hr_custom',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(HORIZONTAL_RULE);
          if (match) {
            return {
              type: 'hr_custom',
              raw: match[0],
              match_1: match?.[1] || null,
              match_2: match?.[2] || null
            };
          }
        },
        renderer: (obj:any) => {
          const hr = document.createElement('hr');
          var color = 'var(--divider)';
          var size = 3;
          if (obj.match_1&&obj.match_2) {
            const match_1_true = obj.match_1.slice(1,obj.match_1.length-1);
            const match_2_true = obj.match_2.slice(1,obj.match_2.length-1); 
            if (VALID_HEX_REGEX.test(match_1_true)) {
              color = match_1_true;
            }
            if (parseInt(match_2_true)>0&&parseInt(match_2_true)<11) {
              size = parseInt(match_2_true);
            }
          } else if (obj.match_1) {
            const match_1_true = obj.match_1.slice(1,obj.match_1.length-1);
            if (VALID_HEX_REGEX.test(match_1_true)) {
              color = match_1_true;
            } else if (parseInt(match_1_true)>0&&parseInt(match_1_true)<11) {
              size = parseInt(match_1_true);
            }
          }
          hr.classList.add('lexical');
          var cssString = "border-bottom-width: ".concat(String(size)).concat('px !important;');
          if (color==="var(--divider)"||!!!color) {
            hr.classList.add('divider-color');
            cssString+=`border-bottom-color: ${color} !important;`;
          } else if (VALID_HEX_REGEX.test(color)) {
            hr.classList.remove('divider-color');
            cssString+=`border-bottom-color: ${color} !important;`;
          }
          hr.setAttribute('data-color',color);
          hr.setAttribute('data-width',size.toString());
          hr.setAttribute('data-v','1');
          hr.style.cssText = cssString;
          
          return hr.outerHTML;
        },
      }
    ]
  }
}

const NEWS_RULE = /^!!\[News Node\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)/;
export function markedNews() {
  return {
    extensions: [
      {
        name: 'news',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(NEWS_RULE);
          if (match&&match.length===6) {
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
        renderer: (obj:any) => {
          return `<div data-v="1" data-href="${escapeAttribute(obj.url)}" data-news-title="${escapeAttribute(obj.title)}" data-news-description="${escapeAttribute(obj.description)}" data-news-image-url="${escapeAttribute(obj.imageURL)}" data-host="${escapeAttribute(obj.host)}"></div>`
        },
      }
    ]
  }
}

const YOUTUBE_RULE = /^!!\[YouTube Node\]\((.*?)\)/;
export function markedYoutube() {
  return {
    extensions: [
      {
        name: 'youtube',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(YOUTUBE_RULE);
          if (match&&match.length===2) {
            const id = match[1];
            return {
              type: 'youtube',
              raw: match[0],
              id
            };
          }
        },
        renderer: (obj:any) => {
          return `<iframe data-text-align="center" class="youtube-embed" width="560" height="315" src="${escapeAttribute('https://www.youtube-nocookie.com/embed/'.concat(obj.id))}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true" data-frank-youtube loading="lazy"></iframe>`;
        },
      }
    ]
  }
}

const TWITTER_RULE = /^<div(.*?)data-twitter(.*?)>(.*?)<\/div>/;
export function markedTwitter() {
  return {
    extensions: [
      {
        name: 'twitter',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(TWITTER_RULE);
          if (match&&match.length===4) {
            const tweet = match[3];
            try {
              const valid_twitter = validateTwitterEmbed(tweet);
              return {
                type: 'twitter',
                raw: match[0],
                tweet: valid_twitter
              };
            } catch (e) {
              console.error("Invalid Twitter Node")
            }
          }
        },
        renderer: (obj:any) => {
          return `<div class="twitter-wrapper" data-twitter>${obj.tweet}</div>`
        },
      }
    ]
  }
}

const TIK_TOK_RULE = /^<div(.*?)data-tiktok(.*?)>(.*?)<\/div>/;
export function markedTikTok() {
  return {
    extensions: [
      {
        name: 'tiktok',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(TIK_TOK_RULE);
          if (match&&match.length===4) {
            const tiktok = match[3];
            try {
              const valid_tik = validateTikTokEmbed(tiktok);
              return {
                type: 'tiktok',
                raw: match[0],
                tiktok: valid_tik
              };
            } catch (e) {
              console.error("Invalid TikTok Node")
            }
          }
        },
        renderer: (obj:any) => {
          return `<div class="tiktok-wrapper" data-tiktok>${obj.tiktok}</div>`;
        },
      }
    ]
  }
}

const INSTAGRAM_RULE = /^<div(.*?)data-instagram(.*?)>(.*?)<\/div>/;
export function markedInstagram() {
  return {
    extensions: [
      {
        name: 'instagram',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(INSTAGRAM_RULE);
          if (match&&match.length===4) {
            const insta = match[3];
            try {
              const valid_insta = validateInstagramEmbed(insta);
              return {
                type: 'instagram',
                raw: match[0],
                insta: valid_insta
              };
            } catch (e) {
              console.error("Invalid Instagram Node")
            }
          }
        },
        renderer: (obj:any) => {
          return `<div data-instagram class="instagram-wrapper">${obj.insta}</div>`;
        },
      }
    ]
  }
}

const IMAGE_RULE_NEW = /^!\[(.*?)\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)(\(.*?\))?/;
export function markedImage() {
  return {
    extensions: [
      {
        name: 'image_new',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(IMAGE_RULE_NEW);
          if (match&&(match.length===7||match.length===8)) {
            const [raw_temp,alt_temp,src_temp,long_temp,width_temp,height_temp,originalDevice_temp] = match.slice(0,7);
            if (src.startsWith('https://image.storething.org')) {
              var background_color: undefined|string = undefined;
              if (match[7]&&VALID_HEX_REGEX.test(match[7])) {
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
        renderer: (obj:any) => {
          return `<img ${obj.background_color?`data-bg-color="${escapeAttribute(obj.background_color)}"`:``} src="${escapeAttribute(obj.src)}" alt="${escapeAttribute(obj.short)}" data-text="${escapeAttribute(obj.long)}" width="${escapeAttribute(obj.width)}" height="${escapeAttribute(obj.height)}" data-original-device="${obj.original_device}" />`
        },
      }
    ]
  }
}
const IMAGE_CAROUSEL_RULE = /^!!\[CarouselImage Node\]\((.*?)\)/;
export function markedImageCarousel() {
  return {
    extensions: [
      {
        name: 'image_carousel',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(IMAGE_CAROUSEL_RULE);
          if (match&&match.length===2) {
            try {
              const json = JSON.parse(match[1]);
              if (Array.isArray(json)) {
                const new_json = json.filter((obj) => Boolean(
                  typeof obj.width === "number" && 
                  typeof obj.height === "number" && 
                  typeof obj.src ==="string" && 
                  obj.src.startsWith('https://image.storething.org') && 
                  typeof obj.short==="string"&&
                  typeof obj.long === "string"
                ));
                if (new_json.length) {
                  return {
                    type: 'image_carousel',
                    raw: match[0],
                    json: new_json
                  };
                }
              }              
            } catch (e) {
              console.error("Something went wrong parsing JSON for Carousel Image Node");
            }
          }
          
        },
        renderer: (obj:any) => {
          const div = document.createElement('div');
          div.setAttribute('data-image-list',JSON.stringify(obj.json));
          div.setAttribute('data-image-carousel',"true");
          const maxHeight = 300;
          div.style.setProperty("min-height",maxHeight.toFixed(0).concat('px'));
          div.style.setProperty("max-height",maxHeight.toFixed(0).concat('px'));
          div.style.setProperty("height",maxHeight.toFixed(0).concat('px'));
          div.classList.add('block');
          return div.outerHTML;
        },
      }
    ]
  }
}
const AUDIO_RULE = /^!!\[Audio Node\]\((.*?)\)\((.*?)\)/;
export function markedAudio() {
  return {
    extensions: [
      {
        name: 'audio',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(AUDIO_RULE);
          if (match&&match.length===3) {
            const src = match[1];
            const title = match[2];
            if (src.startsWith('https://audio.storething.org')) {
              return {
                type: 'audio',
                raw: match[0],
                src,
                title: title.slice(0,50)
              };
            }
          }
          
        },
        renderer: (obj:any) => {
          return `<audio data-src="${escapeAttribute(obj.src)}" data-title="${escapeAttribute(obj.title)}" data-v="1"></audio>`
        },
      }
    ]
  }
}
const VIDEO_RULE = /^!!\[Video Node\]\((.*?)\)\((.*?)\)\((.*?)\)\((.*?)\)/;
export function markedVideo() {
  return {
    extensions: [
      {
        name: 'video',
        level: 'block',
        tokenizer(src:string, tokens:any) {
          const match = src.match(VIDEO_RULE);
          if (match&&match.length===5) {
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
        renderer: (obj:any) => {
          return `<video data-src="${escapeAttribute(obj.src)}" data-title="${escapeAttribute(obj.title)}" data-description="${escapeAttribute(obj.description)}" height="${escapeAttribute(Math.max(obj.height,400))}"></video>`
        },
      }
    ]
  }
}


/* ----------------------------------- Markdown to HTML -------------------------------------- */

const ALLOWED_PRISM_LANGUAGES = new Set([
  "abap",
  "abnf",
  "actionscript",
  "ada",
  "adoc",
  "agda",
  "al",
  "antlr4",
  "apacheconf",
  "apex",
  "apl",
  "applescript",
  "aql",
  "arduino",
  "arff",
  "arm-asm",
  "armasm",
  "art",
  "arturo",
  "asciidoc",
  "asm6502",
  "asmatmel",
  "aspnet",
  "atom",
  "autohotkey",
  "autoit",
  "avdl",
  "avisynth",
  "avro-idl",
  "avs",
  "awk",
  "bash",
  "basic",
  "batch",
  "bbcode",
  "bbj",
  "bicep",
  "birb",
  "bison",
  "bnf",
  "bqn",
  "brainfuck",
  "brightscript",
  "bro",
  "bsl",
  "c",
  "cfc",
  "cfscript",
  "chaiscript",
  "cil",
  "cilk",
  "cilk-c",
  "cilk-cpp",
  "cilkc",
  "cilkcpp",
  "clike",
  "clojure",
  "cmake",
  "cobol",
  "coffee",
  "coffeescript",
  "conc",
  "concurnas",
  "context",
  "cooklang",
  "coq",
  "cpp",
  "crystal",
  "cs",
  "csharp",
  "cshtml",
  "csp",
  "css",
  "css-extras",
  "csv",
  "cue",
  "cypher",
  "d",
  "dart",
  "dataweave",
  "dax",
  "dhall",
  "diff",
  "django",
  "dns-zone",
  "dns-zone-file",
  "docker",
  "dockerfile",
  "dot",
  "dotnet",
  "ebnf",
  "editorconfig",
  "eiffel",
  "ejs",
  "elisp",
  "elixir",
  "elm",
  "emacs",
  "emacs-lisp",
  "erb",
  "erlang",
  "eta",
  "etlua",
  "excel-formula",
  "factor",
  "false",
  "firestore-security-rules",
  "flow",
  "fortran",
  "fsharp",
  "ftl",
  "g4",
  "gamemakerlanguage",
  "gap",
  "gawk",
  "gcode",
  "gdscript",
  "gedcom",
  "gettext",
  "gherkin",
  "git",
  "gitignore",
  "glsl",
  "gml",
  "gn",
  "gni",
  "go",
  "go-mod",
  "go-module",
  "gradle",
  "graphql",
  "groovy",
  "gv",
  "haml",
  "handlebars",
  "haskell",
  "haxe",
  "hbs",
  "hcl",
  "hgignore",
  "hlsl",
  "hoon",
  "hpkp",
  "hs",
  "hsts",
  "html",
  "http",
  "ichigojam",
  "icon",
  "icu-message-format",
  "idr",
  "idris",
  "iecst",
  "ignore",
  "inform7",
  "ini",
  "ino",
  "io",
  "j",
  "java",
  "javadoc",
  "javadoclike",
  "javascript",
  "javastacktrace",
  "jexl",
  "jinja2",
  "jolie",
  "jq",
  "js",
  "js-extras",
  "js-templates",
  "jsdoc",
  "json",
  "json5",
  "jsonp",
  "jsstacktrace",
  "jsx",
  "julia",
  "keepalived",
  "keyman",
  "kotlin",
  "kt",
  "kts",
  "kum",
  "kumir",
  "kusto",
  "latex",
  "latte",
  "ld",
  "less",
  "lilypond",
  "linker-script",
  "liquid",
  "lisp",
  "livescript",
  "llvm",
  "log",
  "lolcode",
  "lua",
  "ly",
  "magma",
  "makefile",
  "markdown",
  "markup",
  "markup-templating",
  "mata",
  "mathematica",
  "mathml",
  "matlab",
  "maxscript",
  "md",
  "mel",
  "mermaid",
  "metafont",
  "mizar",
  "mongodb",
  "monkey",
  "moon",
  "moonscript",
  "mscript",
  "mustache",
  "n1ql",
  "n4js",
  "n4jsd",
  "nand2tetris-hdl",
  "nani",
  "naniscript",
  "nasm",
  "nb",
  "neon",
  "nevod",
  "nginx",
  "nim",
  "nix",
  "npmignore",
  "nsis",
  "objc",
  "objectivec",
  "objectpascal",
  "ocaml",
  "odin",
  "opencl",
  "openqasm",
  "oscript",
  "oz",
  "parigp",
  "parser",
  "pascal",
  "pascaligo",
  "pbfasm",
  "pcaxis",
  "pcode",
  "peoplecode",
  "perl",
  "php",
  "php-extras",
  "phpdoc",
  "plant-uml",
  "plantuml",
  "plsql",
  "po",
  "powerquery",
  "powershell",
  "pq",
  "processing",
  "prolog",
  "promql",
  "properties",
  "protobuf",
  "psl",
  "pug",
  "puppet",
  "pure",
  "purebasic",
  "purescript",
  "purs",
  "px",
  "py",
  "python",
  "q",
  "qasm",
  "qml",
  "qore",
  "qs",
  "qsharp",
  "r",
  "racket",
  "razor",
  "rb",
  "rbnf",
  "reason",
  "regex",
  "rego",
  "renpy",
  "res",
  "rescript",
  "rest",
  "rip",
  "rkt",
  "roboconf",
  "robot",
  "robotframework",
  "rpy",
  "rq",
  "rss",
  "ruby",
  "rust",
  "sas",
  "sass",
  "scala",
  "scheme",
  "sclang",
  "scss",
  "sh",
  "sh-session",
  "shell",
  "shell-session",
  "shellsession",
  "shortcode",
  "sln",
  "smali",
  "smalltalk",
  "smarty",
  "sml",
  "smlnj",
  "sol",
  "solidity",
  "solution-file",
  "soy",
  "sparql",
  "splunk-spl",
  "sqf",
  "sql",
  "squirrel",
  "ssml",
  "stan",
  "stata",
  "stylus",
  "supercollider",
  "svg",
  "swift",
  "systemd",
  "t4",
  "t4-cs",
  "t4-templating",
  "t4-vb",
  "tap",
  "tcl",
  "tex",
  "textile",
  "toml",
  "tremor",
  "trickle",
  "trig",
  "troy",
  "ts",
  "tsconfig",
  "tsx",
  "tt2",
  "turtle",
  "twig",
  "typescript",
  "typoscript",
  "uc",
  "unrealscript",
  "uorazor",
  "uri",
  "url",
  "uscript",
  "v",
  "vala",
  "vb",
  "vba",
  "vbnet",
  "velocity",
  "verilog",
  "vhdl",
  "vim",
  "visual-basic",
  "warpscript",
  "wasm",
  "web-idl",
  "webidl",
  "webmanifest",
  "wgsl",
  "wiki",
  "wl",
  "wolfram",
  "wren",
  "xeora",
  "xeoracube",
  "xls",
  "xlsx",
  "xml",
  "xml-doc",
  "xojo",
  "xquery",
  "yaml",
  "yang",
  "yml",
  "zig"
])

function escapeHTML(s:any) {
  const n = document.createElement('span');
  n.innerText = s;
  return n.innerHTML;
}
const ALLOW_IFRAME = DOMPURIFY_DEFAULT_ELS.concat([
  'iframe'
]);
const ALLOW_ATTRS_LEXICAL = DOMPURIFY_DEFAULT_ATTRS.concat([
  'frameborder',
  'allow',
  'allowfullscreen',
  'loading'
])
export function purifyHTMLDefault(html:string) {
  const CONFIG:DOMPurify.Config = {
    ALLOWED_TAGS: ALLOW_IFRAME,
    ALLOWED_ATTR: ALLOW_ATTRS_LEXICAL,
    RETURN_DOM: false
  }
  const domPurify = DOMPurify(window);
  const purifiedHTML = domPurify.sanitize(html,CONFIG);
  return purifiedHTML;
}
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
export function purifyLexicalMarkdownInlineHTML(html:string) {
  const CONFIG:DOMPurify.Config = {
    ALLOWED_TAGS: LEXICAL_INLINE_ALLOWED_TAGS
  }
  const domPurify = DOMPurify(window);
  const purifiedHTML = domPurify.sanitize(html,CONFIG);
  return purifiedHTML;
}
export const lexicalMarkdownRenderer:RendererObject = {
  code(code,infostring,escaped) {
    var lang = 'javacript';
    if (infostring&&ALLOWED_PRISM_LANGUAGES.has(infostring)) {
      lang = infostring;
    } else if (infostring) {
      lang = 'infostring';
      loadLanguages()
    } else {
      lang = 'plaintext';
    }
    var html = '';
    if (Prism.languages[lang]) {
      html = Prism.highlight(code,Prism.languages[lang],lang)
    } else {
      lang = 'code';
      html = escapeHTML(code);
    }
    return `<pre spellcheck="false" data-only-code-editor="false" data-highlight-language="${escapeHTML(lang)}" data-v="1" class="first-rte-element">${html}</pre>`
  },
  blockquote(quote) {
    return `<blockquote class="blockquote" data-v="1" dir="ltr" data-e-indent="0">${quote}</blockquote>`;
  },
  html(html,block) {
    if (block) {
      return `<div data-custom-code="" data-editing="false" class="first-rte-element"><div data-html="">${purifyHTMLDefault(html)}</div></div>`
    } else {
      return purifyLexicalMarkdownInlineHTML(html).toString();
    } 
  },
  heading(text,level,raw) {
    level = Math.max(2,Math.min(6,level));
    return `<h${level} class="h${level}" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr">${text}</h${level}>`
  },
  hr() {
    return `<hr class="lexical divider-color" style="border-bottom-width: 3px !important;" data-color="var(--divider)" data-width="3" data-v="1" />`
  },
  list(body,ordered,start) {
    const t = ordered ? 'ol' : 'ul';
    var newStart = start ? Math.max(1,start) : 1;
    return `<${t} class="mt-3" ${t==='ol'?`start="${newStart}"`:``} style="text-align: left; margin: 6px 0px 6px 0px; padding-top: 0px; padding-bottom: 0px;" data-v="1" dir="ltr">${body}</${t}>`;
  },
  listitem(text,task,checked) {
    if (task) {
      return `<li role="checkbox" tabindex="-1" aria-checked="${checked}" class="rte-li-unchecked" data-v="1">${text}</li>`;
    } else {
      return `<li data-v="1">${text}</li>`;
    }
  },
  paragraph(text) {
    return `<p class="lex-p" style="text-align: left; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0">${text.length?text:`<br />`}</p>`;
  },
  table(header,body) {
    return `
  <div class="table-wrapper" data-v="1">
  <table cellspacing="0" class="rte-table" style="margin: 10px auto;" data-v="1">
    ${header}
    ${body}
  </table>
  </div>`;
  },
  tablerow(content) {
    return `<tr data-v="1">${content}</tr>`;
  },
  tablecell(content,flags) {
    var isHeader = flags.header;
    const length = content.replace(/s+/g,' ').trim().length;
    const width = 6*length > 150 ? 150 : Math.max(6*length,50);
    const cellStyle = flags.align ? `style="vertical-align: middle; width: ${width}px;"` : `style="vertical-align: middle; width: ${width}px;"`;
    const pStyle = flags.align ? `style="text-align: ${flags.align};"`:`style="text-align: center;"`;
    if (isHeader) {
      return `<th ${cellStyle} scope="col" class="rte-tableCell rte-tableCellHeader" data-v="1" data-scope="col"><p class="lex-grid-p" data-v="1" ${pStyle} dir="ltr">${content}</p></th>`;
    } else {

      return `<td ${cellStyle} class="rte-tableCell" data-v="1"><p class="lex-grid-p" data-v="1" ${pStyle} dir="ltr">${content}</p></td>`;
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
  link(href,title,text) {
    if (href.startsWith('#i')) {
      return `<a href="${href}" data-v="1" class="same-page"><span data-v="1" style="white-space: pre-wrap;">${text}</span></a>`
    } else {
      return `<a href="${href}" data-v="1" class="lexical-link"><span data-v="1" style="white-space: pre-wrap;">${text}</span></a>`;
    }
  },
  image(href,title,text) {
    if (href.startsWith('https://image.storething.org/frankmbrown')) {
      return `<p class="lex-p" style="text-align: center; margin: 6px 0px 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" data-e-indent="0"><img loading="lazy" data-v="1" src="${href}" alt="${escapeHTML(title)}" data-text="${escapeHTML(text)}" data-original-device="desktop" style="max-width: 100%;" class="img-node"></p>`;
    } else {
      return false;
    }
  },
  text(text) {
    return `<span data-v="1" style="white-space: pre-wrap;">${text}</span>`;
  }
}

export async function markdownToHTMLAi(s:string) {
  try {
    marked.use(markedAbbrevation());
    marked.use(markedHorizontalRule());
    marked.use(markedNews());
    marked.use(markedYoutube());
    marked.use(markedTwitter());
    marked.use(markedTikTok());
    marked.use(markedInstagram());
    marked.use(markedImage());
    marked.use(markedImageCarousel());
    marked.use(markedAudio());
    marked.use(markedVideo());
    marked.use(markedKatexLexical()); // https://github.com/UziTech/marked-katex-extension
    marked.use(markedExtendedTables()); // https://github.com/calculuschild/marked-extended-tables
    marked.use(markedFootnote());  // https://github.com/bent10/marked-extensions/tree/main/packages/footnote 
    marked.use({ renderer: lexicalMarkdownRenderer });
    const resp = await marked(s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""))
    const respNew = purifyHTMLDefault(resp) as string;
    return respNew;  
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong converting AI markdown to HTML.")
  }
}
window.markdownToHTMLAi = markdownToHTMLAi;



function onAIChatLoad() {

}