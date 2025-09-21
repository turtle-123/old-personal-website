import { DocOrEl } from '..';
import { onNewContentLoaded } from '../shared';
var CURR_CODE = '';

const getErrorAlert = (str:string) => {
  return /*html*/`
<div class="alert icon error filled medium mt-1" role="alert">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
  <p class="alert">
    ${str}
  </p>
  <button aria-label="Close Alert" class="icon medium close-alert" type="button">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
  </button>
</div>
`; 
}

const HLJS_CODING_LANGUAGES_AVAILABLE = new Set(["auto","1c","abnf","accesslog","actionscript","ada","angelscript","apache","applescript","arcade","arduino","armasm","xml","asciidoc","aspectj","autohotkey","autoit","avrasm","awk","axapta","bash","basic","bnf","brainfuck","c","cal","capnproto","ceylon","clean","clojure","clojure-repl","cmake","coffeescript","coq","cos","cpp","crmsh","crystal","csharp","csp","css","d","markdown","dart","delphi","diff","django","dns","dockerfile","dos","dsconfig","dts","dust","ebnf","elixir","elm","ruby","erb","erlang-repl","erlang","excel","fix","flix","fortran","fsharp","gams","gauss","gcode","gherkin","glsl","gml","go","golo","gradle","graphql","groovy","haml","handlebars","haskell","haxe","hsp","http","hy","inform7","ini","irpf90","isbl","java","javascript","jboss-cli","json","julia","julia-repl","kotlin","lasso","latex","ldif","leaf","less","lisp","livecodeserver","livescript","llvm","lsl","lua","makefile","mathematica","matlab","maxima","mel","mercury","mipsasm","mizar","perl","mojolicious","monkey","moonscript","n1ql","nestedtext","nginx","nim","nix","node-repl","nsis","objectivec","ocaml","openscad","oxygene","parser3","pf","pgsql","php","php-template","plaintext","pony","powershell","processing","profile","prolog","properties","protobuf","puppet","purebasic","python","python-repl","q","qml","r","reasonml","rib","roboconf","routeros","rsl","ruleslanguage","rust","sas","scala","scheme","scilab","scss","shell","smali","smalltalk","sml","sqf","sql","stan","stata","step21","stylus","subunit","swift","taggerscript","yaml","tap","tcl","thrift","tp","twig","typescript","vala","vbnet","vbscript","vbscript-html","verilog","vhdl","vim","wasm","wren","x86asm","xl","xquery","zephir"]);

function copyCodeToClipboard() {
  navigator.clipboard.writeText(CURR_CODE);
  
}

function renderCodeInOutput(output:HTMLOutputElement,{ block, htmlString, language, relevance, snackbarID }:{ block: boolean, htmlString: string, language: string, relevance: number, snackbarID: string }) {
  output.innerHTML = '';
  const HTML_STRING_TO_COPY = block ? /*html*/`<div style="position: relative;"><pre class="hz-scroll"><code class="hljs">${htmlString}</code></pre>
  <button aria-label="Copy Code Output" data-snackbar data-selem="#copy-code-success" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;" aria-haspopup="true">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
      </path>
    </svg>
  </button>
</div>` : /*html*/`<span><code class="hljs">${htmlString}</code></span>`;
  const HTML = /*html*/`  <div class="flex-row w-100 justify-start align-center">
  <div class="tooltip caption" role="tooltip" id="copy-html-code-tooltip">
    Copy HTML Code Markup to Clipboard. 
  </div>
  <button 
  type="button" 
  aria-label="Copy HTML Code Element" 
  class="toggle-button large" 
  id="COPY_CODE_BUTTON" 
  data-snackbar 
  data-selem="#${snackbarID}"
  aria-describedby="#copy-html-code-tooltip"
  aria-haspopup="true"
  >
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HtmlSharp"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm15 0H12v6h1.5v-4.5h1V14H16v-3.51h1V15h1.5V9zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
  </button>
  <div class="success snackbar dialog-snackbar" aria-hidden="true" data-snacktime="4000" id="${snackbarID}">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
    <p class="p-sm">HTML Elements with highlighted code copied to clipboard!</p>
    <button aria-label="Close Snackbar" class="icon medium" type="button" data-close-snackbar>
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div>
</div>
<div class="block mt-2">
  ${HTML_STRING_TO_COPY}
</div>
<div class="block">
  <p class="flex-row justify-begin align-center body2 w-100">
    <span class="bold" style="margin-right: 4px;">Language:</span>${language}
  </p>
  <p class="flex-row justify-begin align-center body2 w-100">
    <span class="bold" style="margin-right: 4px;">Relevance:</span> ${relevance}
  </p>
</div>`;
  CURR_CODE = HTML_STRING_TO_COPY;
  output.insertAdjacentHTML("afterbegin",HTML);
  setTimeout(() => {
    const btn = document.getElementById('COPY_CODE_BUTTON') as HTMLButtonElement|null;
    if (btn) btn.addEventListener('click',copyCodeToClipboard);
  },250);
  onNewContentLoaded(output);
}


function getHighlightForm(form:HTMLFormElement) {
  const textArea = form.querySelector<HTMLTextAreaElement>('textarea');
  const block = form.querySelector<HTMLInputElement>('input[name="code-display-style"]:checked')
  const language = form.querySelector<HTMLInputElement>('input[name="highlight-js-language"]');
  const output = document.querySelector<HTMLOutputElement>(`output[form="${form.id}"]`);
  if (textArea&&block&&language&&output) {
    return {
      code: textArea.value,
      output,
      language: HLJS_CODING_LANGUAGES_AVAILABLE.has(language.value) ? language.value : 'auto',
      block: Boolean(block.value==="block-code-dialog")
    }
  }
  return null;
}

function handleHighlightChange(this:HTMLFormElement) {
  const form = getHighlightForm(this);
  if(form){
    import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
    .then((res) => {
      try {
        var highlightResult;
        if (form.language==="auto") {
          highlightResult = res.highlight.highlightAuto(form.code);
        } else {
          highlightResult = res.highlight.highlight(form.code, { language: form.language });
        }
        const htmlString = highlightResult.value;
        const relevance = highlightResult.relevance;
        const snackbarID = `copy_html_code_snackbar_`.concat(Math.random().toString().slice(2));
        renderCodeInOutput(form.output,{ block: form.block, language: highlightResult.language || form.language, relevance: relevance, snackbarID, htmlString });
      } catch (error) {
        form.output.innerHTML = '';
        form.output.insertAdjacentHTML("afterbegin",getErrorAlert("Something went wrong generating HTML for the code input."));
        onNewContentLoaded(form.output);
      }
    })
    .catch((error) => {
      console.error(error);
    })
  }
}

function handleHighlightSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const form = getHighlightForm(this)
  if (form){

  }
}

export function onCodeLoad(el:DocOrEl) {
  Array.from(el.querySelectorAll<HTMLFormElement>('form[data-highlight-js-form]')).forEach((el) => {
    el.addEventListener('change',handleHighlightChange)
    el.addEventListener('input',handleHighlightChange)
    el.addEventListener('submit',handleHighlightSubmit)
  });
}