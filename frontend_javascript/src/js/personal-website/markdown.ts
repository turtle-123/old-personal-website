import { onNewContentLoaded } from '../shared';
import highlight from 'highlight.js';
import { 
  DOMPurify,
  katex,
  marked,
  RendererObject,
  markedKatex,
  markedExtendedTables,
  markedFootnote 
} from 'personal-website-shared';
import { getCodeMirrorEditorText } from '../code-editors';



const HLJS_CODING_LANGUAGES_AVAILABLE = new Set(["auto","1c","abnf","accesslog","actionscript","ada","angelscript","apache","applescript","arcade","arduino","armasm","xml","asciidoc","aspectj","autohotkey","autoit","avrasm","awk","axapta","bash","basic","bnf","brainfuck","c","cal","capnproto","ceylon","clean","clojure","clojure-repl","cmake","coffeescript","coq","cos","cpp","crmsh","crystal","csharp","csp","css","d","markdown","dart","delphi","diff","django","dns","dockerfile","dos","dsconfig","dts","dust","ebnf","elixir","elm","ruby","erb","erlang-repl","erlang","excel","fix","flix","fortran","fsharp","gams","gauss","gcode","gherkin","glsl","gml","go","golo","gradle","graphql","groovy","haml","handlebars","haskell","haxe","hsp","http","hy","inform7","ini","irpf90","isbl","java","javascript","jboss-cli","json","julia","julia-repl","kotlin","lasso","latex","ldif","leaf","less","lisp","livecodeserver","livescript","llvm","lsl","lua","makefile","mathematica","matlab","maxima","mel","mercury","mipsasm","mizar","perl","mojolicious","monkey","moonscript","n1ql","nestedtext","nginx","nim","nix","node-repl","nsis","objectivec","ocaml","openscad","oxygene","parser3","pf","pgsql","php","php-template","plaintext","pony","powershell","processing","profile","prolog","properties","protobuf","puppet","purebasic","python","python-repl","q","qml","r","reasonml","rib","roboconf","routeros","rsl","ruleslanguage","rust","sas","scala","scheme","scilab","scss","shell","smali","smalltalk","sml","sqf","sql","stan","stata","step21","stylus","subunit","swift","taggerscript","yaml","tap","tcl","thrift","tp","twig","typescript","vala","vbnet","vbscript","vbscript-html","verilog","vhdl","vim","wasm","wren","x86asm","xl","xquery","zephir"]);

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
"data-pelem"
]))
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
  'form' // for right now, you could do something interesting with this
]
const FORBID_ATTR = [...DISALLOW_HTMX_ATTRIBUTES,...DISALLOW_DATA_ATTRIBUTES, ...DISALLOW_ATTRIBUTE_CUSTOM];

/**
 * Purify User Input HTML
 * @param html 
 * @returns 
 */
export function purifyUserInputHTML(html:string) {
  const CONFIG:DOMPurify.Config = {
    FORBID_ATTR, // need to add a specific rel attribute for anchor tags
    ADD_ATTR,
    FORBID_TAGS,
    USE_PROFILES: { html: true, mathMl: true, svg: true },
    ALLOW_ARIA_ATTR: false,
    RETURN_DOM: false
  }
  const domPurify = DOMPurify(window);
  domPurify.addHook('afterSanitizeAttributes',(el) => {
    if (el.nodeName&&el.nodeName==="A") {
      el.setAttribute("rel","ugc");
    }
  })
  const purifiedHtml = domPurify.sanitize(html,CONFIG) as string; 
  return purifiedHtml;
}

function purifyHTML(html:string) {
  const domPurify = DOMPurify(window);
  const purifiedHTML = domPurify.sanitize(html);
  return purifiedHTML;
}

function renderCode({ block, htmlString, language }:{ block: boolean, htmlString: string, language?:string}) {
return `${block ? /*html*/`<!--Split--><div style="position: relative;"><pre class="hz-scroll"><code class="hljs" data-language="${language}">${htmlString}</code></pre>
  <button aria-label="Copy Code Output" data-snackbar data-selem="#copy-code-success" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;" aria-haspopup="true">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
      </path>
    </svg>
  </button>
</div><!--Split-->
`: /*html*/`
<!--Split--><span><code class="hljs">${htmlString}</code></span><!--Split-->
`}`

}

function renderMath({ inline, math }: {inline:boolean, math: string}) {
  const htmlString = katex.renderToString(math,{ throwOnError: false, displayMode: !!!inline, leqno: false, fleqn: false, });
  const copyHtmlID = `cop_html_`.concat(Math.random().toString().slice(2))
  const copyInputID = 'cop_inp_'.concat(Math.random().toString().slice(2))
  const block = !!!inline;
  const htmlStr = htmlString;
  const dialog = false;
  const input = math;
  return /*html*/`
  <div style="margin: 0.25rem; position: relative; overflow-x:auto;" class="hz-scroll">
  ${block ? /*html*/`
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
  ` : /*html*/`
      <span id="${copyHtmlID}" class="inline-katex">
      ${htmlStr}
      </span>
  `}
  </div>
  `;
}

const getCheckbox = (checked: boolean) => {
  const classNum = Math.floor(Math.random()*6);
  const other = `${checked?'checked':''} style="display:inline;"`;
  switch (classNum) {
    case 0: {
      return /*html*/`<input type="checkbox" class="primary" ${other} />`;
    }
    case 1: {
      return /*html*/`<input type="checkbox" class="secondary" ${other} />`;
    }
    case 2: {
      return /*html*/`<input type="checkbox" class="error" ${other} />`;
    }
    case 3: {
      return /*html*/`<input type="checkbox" class="info" ${other} />`;
    }
    case 4: {
      return /*html*/`<input type="checkbox" class="warning" ${other} />`;
    }
    case 5: {
      return /*html*/`<input type="checkbox" class="success" ${other} />`;
    }
    default: {
      return /*html*/`<input type="checkbox" class="primary" ${other} />`;
    }
  }
}


const myDesignSystemRenderer:RendererObject = {
  code(code,infostring,escaped) {
    if (infostring) {
      if (infostring==='math') {
        return renderMath({ inline: false, math: code });
      } else if (HLJS_CODING_LANGUAGES_AVAILABLE.has(infostring)) {
        const highlightResult = highlight.highlight(code,{ language: infostring, ignoreIllegals: true })
        const htmlString = highlightResult.value;
        return renderCode({ block: true, htmlString, language: infostring }) 
      } else {
        const highlightResult = highlight.highlightAuto(code);
        const htmlString = highlightResult.value;
        return renderCode({ block: true, htmlString, language: highlightResult.language || '' }) 
      }
    } else {
      const highlightResult = highlight.highlightAuto(code);
      const htmlString = highlightResult.value;
      return renderCode({ block: true, htmlString, language: highlightResult.language || '' }) 
    } 
  },
  blockquote(quote) {
    return /*html*/`<blockquote class="blockquote">${quote}</blockquote>`;
  },
  html(html,block) {
    return purifyHTML(html);
  },
  heading(text,level,raw) {
    level = Math.max(2,Math.min(6,level));
    const id = 'id_'.concat(Math.random().toString().slice(2));
    if (level <=2) {
      return `<section id="${id}" class="mt-4">
      <h${level} class="bold bb-main h2">
        <a href="#${id}" class="same-page bold">
          ${text}
        </a>
      </h${level}>
  </section>`;
    }
    return `<h${level} class="h${level} bold">${text}</h${level}>`
  },
  hr() {
    return /*html*/`<hr/>`
  },
  list(body,ordered,start) {
    const t = ordered ? 'ol' : 'ul';
    var newStart = start ? Math.max(1,start) : 1;
    return /*html*/`<${t} start="${newStart}">${body}</${t}>`;
  },
  listitem(text,task,checked) {
    if (task) {
      return /*html*/`<li class="flex-row justify-start gap-3 align-center">
      <span style="position: relative; bottom: 4px;">
      ${text}
      </span>
      </li>`;
    } else {
      return /*html*/`<li>${text}</li>`;
    }
    
  },
  checkbox(checked) {
    return getCheckbox(checked);
  },
  paragraph(text) {
    return /*html*/`<p class="body1">${text}</p>`;
  },
  table(header,body) {
    return /*html*/`<div class="lexical-wrapper"><table cellspacing="0"><caption>${header}</caption>${body}</table></div>`;
  },
  tablerow(content) {
    return /*html*/`<tr>${content}</tr>`;
  },
  tablecell(content,flags) {
    var isHeader = flags.header;
    const style = flags.align ? `style="text-align: ${flags.align};"` : '';
    if (isHeader) {
      return /*html*/`<th ${style}>${content}</th>`;
    } else {
      return /*html*/`<td ${style}>${content}</td>`;
    }
  },
  strong(text) {
    return /*html*/`<strong class="bolder">${text}</strong>`;
  },
  em(text) {
    return /*html*/`<em class="italic">${text}</em>`;
  },
  codespan(code) {
     const highlightResult = highlight.highlightAuto(code);
    const htmlString = highlightResult.value;
    return renderCode({ block: false, htmlString, language: highlightResult.language || '' }) 
  },
  br() {
    return /*html*/`<br />`;
  },
  del(text) {
    return /*html*/`<del>${text}</del>`;
  },
  link(href,title,text) {
    const titleAttr = title ? `title="${title}"` : '';
    if (/^https:\/\/(www.)?frankmbrown.net/.test(href)) {
      return /*html*/`<a class="primary link" hx-get="" href="" hx-target="#PAGE" hx-indicator="#page-transition-progress" ${titleAttr}>${text}</a>`;
    } else {
      return /*html*/`<a class="secondary link" target="_blank" href="${href}" ${titleAttr}>${text}</a>`;
    }
  },
  image(href,title,text) {
    return /*html*/``;
  },
  text(text) {
    return /*html*/`${text}`;
  }
}

const renderer:RendererObject = {
  code(code,infostring,escaped) {
    if (infostring) {
      if (infostring==='math') {
        return renderMath({ inline: false, math: code });
      } else if (HLJS_CODING_LANGUAGES_AVAILABLE.has(infostring)) {
        const highlightResult = highlight.highlight(code,{ language: infostring, ignoreIllegals: true })
        const htmlString = highlightResult.value;
        return renderCode({ block: true, htmlString, language: infostring }) 
      } else {
        const highlightResult = highlight.highlightAuto(code);
        const htmlString = highlightResult.value;
        return renderCode({ block: true, htmlString, language: highlightResult.language || '' }) 
      }
    } else {
      const highlightResult = highlight.highlightAuto(code);
      const htmlString = highlightResult.value;
      return renderCode({ block: true, htmlString, language: highlightResult.language || '' }) 
    } 
  },
  blockquote(quote) {
    return /*html*/`<blockquote class="blockquote">${quote}</blockquote>`;
  },
  html(html,block) {
    return purifyHTML(html);
  },
  heading(text,level,raw) {
    level = Math.max(1,Math.min(6,level))
    return `<h${level} class="h${level} bold">${text}</h${level}>`
  },
  hr() {
    return /*html*/`<hr/>`
  },
  list(body,ordered,start) {
    const t = ordered ? 'ol' : 'ul';
    var newStart = start ? Math.max(1,start) : 1;
    return /*html*/`<${t} start="${newStart}">${body}</${t}>`;
  },
  listitem(text,task,checked) {
    if (task) {
      return /*html*/`<li class="flex-row justify-start gap-3 align-center">
      <span style="position: relative; bottom: 4px;">
      ${text}
      </span>
      </li>`;
    } else {
      return /*html*/`<li>${text}</li>`;
    }
    
  },
  checkbox(checked) {
    return getCheckbox(checked);
  },
  paragraph(text) {
    return /*html*/`<p class="body1">${text}</p>`;
  },
  table(header,body) {
    return /*html*/`<div class="lexical-wrapper"><table cellspacing="0"><caption>${header}</caption>${body}</table></div>`;
  },
  tablerow(content) {
    return /*html*/`<tr>${content}</tr>`;
  },
  tablecell(content,flags) {
    var isHeader = flags.header;
    const style = flags.align ? `style="text-align: ${flags.align};"` : '';
    if (isHeader) {
      return /*html*/`<th ${style}>${content}</th>`;
    } else {
      return /*html*/`<td ${style}>${content}</td>`;
    }
  },
  strong(text) {
    return /*html*/`<strong class="bolder">${text}</strong>`;
  },
  em(text) {
    return /*html*/`<em class="italic">${text}</em>`;
  },
  codespan(code) {
    return /*html*/`<span class="text-code">${code}</span>`;
  },
  br() {
    return /*html*/`<br />`;
  },
  del(text) {
    return /*html*/`<del>${text}</del>`;
  },
  link(href,title,text) {
    const titleAttr = title ? `title="${title}"` : '';
    if (/^https:\/\/(www.)?frankmbrown.net/.test(href)) {
      return /*html*/`<a class="primary link" hx-get="" href="" hx-target="#PAGE" hx-indicator="#page-transition-progress" ${titleAttr}>${text}</a>`;
    } else {
      return /*html*/`<a class="secondary link" target="_blank" href="${href}" ${titleAttr}>${text}</a>`;
    }
  },
  image(href,title,text) {
    return /*html*/``;
  },
  text(text) {
    return /*html*/`${text}`;
  }
}

/**
 * Postprocess markdown string
 * @param html 
 * @returns 
 */
function postprocess(html:string) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const linksToAddClasses = Array.from(div.querySelectorAll('a[data-footnote-ref], a[data-footnote-backref]'));
  linksToAddClasses.forEach((el) => {
    el.className = "primary link";
  })
  return div.innerHTML;
}

export async function parseMarkdown(s:string,obj:{useDesignSystem: boolean, breaks: boolean, gfm: boolean, pedantic: boolean }={useDesignSystem:false,breaks:true,gfm: true, pedantic: false }) {
  try {
    marked.use(markedKatex()); // https://github.com/UziTech/marked-katex-extension
    marked.use(markedExtendedTables()); // https://github.com/calculuschild/marked-extended-tables
    marked.use(markedFootnote());  // https://github.com/bent10/marked-extensions/tree/main/packages/footnote 
    marked.use(markedFootnote());
    if (obj.useDesignSystem) {
      marked.use({ renderer: myDesignSystemRenderer });
    } else {
      marked.use({ renderer: {
        ...renderer
      }});
    }
    marked.use({
      async: true,
      breaks: obj.breaks,
      gfm: obj.gfm,
      pedantic: obj.pedantic
    });
    marked.use({ hooks: { postprocess }})
    const resp = await marked(s.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,""));
    return purifyHTML(resp);
  } catch (error) {
    console.error(error);
    return getErrorAlert("Something went wrong generating the HTML From the markdown.");
  }
}

async function renderNewHTML(this:HTMLElement,e:Event) {
  const form = document.getElementById('submit-markdown-form') as HTMLFormElement|null;
  if (form) {
    const val = getCodeMirrorEditorText('markdown-input');
    const breaks = form.querySelector<HTMLInputElement>('input[name="breaks"]');
    const gfm = form.querySelector<HTMLInputElement>('input[name="gfm"]');
    const pedantic = form.querySelector<HTMLInputElement>('input[name="pedantic"]');
    const designSystem = form.querySelector<HTMLInputElement>('input[name="design-system"]:checked');
    const output1 = document.getElementById("preview-mobile-md" ) as HTMLElement|null;
    const output2 = document.getElementById("preview-tablet-md" ) as HTMLElement|null;
    const output3 = document.getElementById("preview-desktop-md") as HTMLElement|null; 

    const title = document.getElementById('markdown-title') as HTMLInputElement|null;
    const description = document.getElementById('markdown-description') as HTMLTextAreaElement|null;
    if (val&&output1&&output2&&output3&&breaks&&gfm&&pedantic&&designSystem&&title&&description) {
      const html = await parseMarkdown(val,{useDesignSystem:designSystem.value!=='default', breaks: breaks.checked, gfm: gfm.checked, pedantic: pedantic.checked });
      const outputArr = [output1,output2,output3];
      for (let output of outputArr) {
        output.innerHTML='';
        const h1 = document.createElement('h1');
        h1.className="page-title";
        h1.innerText = title.value;
        const p = document.createElement('p');
        p.className='mt-2';
        p.innerText=description.value;
        output.append(h1,p);
        output.insertAdjacentHTML("beforeend",html);
      }
      onNewContentLoaded(output1);
      onNewContentLoaded(output2);
      onNewContentLoaded(output3);
    }
  }
}

function addLoaders() {
  const output1 = document.getElementById("preview-mobile-md" ) as HTMLElement|null;
  const output2 = document.getElementById("preview-tablet-md" ) as HTMLElement|null;
  const output3 = document.getElementById("preview-desktop-md") as HTMLElement|null; 
  if (output1&&output2&&output3) {
    const outputArr = [output1,output2,output3];
    const classes = ["info","warning","success"];
    for (let i=0;i<outputArr.length;i++) {
      outputArr[i].innerHTML= /*html*/`<div class="flex-row justify-center t-${classes[i]} mt-2" role="progressbar" aria-busy="false">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div>`
    }
  }
}


function getErrorAlert(str: string,svg?:string) {
  return /*html*/`
    <div class="alert icon error filled medium mt-1" role="alert">
      ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>`}
      <p class="alert">
        ${str}
      </p>
      <button aria-label="Close Alert" class="icon medium close-alert" type="button">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
  `;
}

export default function onMarkdownPageLoad() {
  const button = document.getElementById('view-markdown-html');
  if (button) {
    button.addEventListener('click',addLoaders,true);
    button.addEventListener('click',renderNewHTML,false);
  }
}
