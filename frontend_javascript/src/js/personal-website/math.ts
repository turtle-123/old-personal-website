import { DocOrEl } from '..';
import { onNewContentLoaded } from '../shared';


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

function getKatexInputs(form:HTMLFormElement) {
  const textarea = form.querySelector<HTMLTextAreaElement>('textarea');
  const leqno = form.querySelector<HTMLInputElement>('input[name="leqno-dialog"]');
  const fleqn = form.querySelector<HTMLInputElement>('input[name="fleqn-dialog"]');
  const displayStyle = form.querySelector<HTMLInputElement>('input[name^="math-display-style"]:checked');
  const output = document.querySelector<HTMLOutputElement>(`output[form="${form.id}"]`);
  const dialog = form.closest<HTMLDivElement>('div.dialog-wrapper');
  if(textarea&&leqno&&fleqn&&output&&displayStyle) {
    return {
      tex: textarea.value,
      leqno: Boolean(leqno.checked===true),
      fleqn: Boolean(fleqn.checked===true),
      output,
      blockDisplayStyle: Boolean(displayStyle.value==='block-math-dialog'),
      dialog: Boolean(dialog)
    }
  }
  return null;
}

function renderOutput(htmlStr:string,block:boolean,input:string,dialog:boolean) {
  const copyHtmlID = `cop_html_`.concat(Math.random().toString().slice(2))
  const copySnackbarID = `snack_id_`.concat(Math.random().toString().slice(2))
  const copyInputID = 'cop_inp_'.concat(Math.random().toString().slice(2))

  return /*html*/`
  <div class="flex-row align-center justify-start p-sm">
    <div role="tooltip" data-placement="top" class="tooltip caption" id="copy-html-math-tooltip">
      Copy HTML of <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mspace linebreak="newline"></mspace><mi>T</mi><mi>e</mi><mi>X</mi><mspace linebreak="newline"></mspace></mrow><annotation encoding="application/x-tex">\\TeX\\</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="mspace"></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span><span class="mspace"></span></span></span> Expression
    </div>
    <button 
    aria-haspopup="true" 
    aria-label="Copy HTML Math Element" 
    class="toggle-button large" 
    data-copy-el 
    data-el="#${copyHtmlID}" 
    data-snackbar 
    data-selem="#${copySnackbarID}"
    data-popover 
    data-mouse
    data-pelem="#copy-html-math-tooltip"
    aria-describedby="copy-html-math-tooltip"
    >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HtmlSharp"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm15 0H12v6h1.5v-4.5h1V14H16v-3.51h1V15h1.5V9zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
    </button>
    <div 
    id="${copySnackbarID}" 
    class="snackbar dialog-snackbar success" 
    aria-hidden="true" 
    data-snacktime="4000"
    >
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
          <p class="p-sm">
            HTML Elements with <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mspace linebreak="newline"></mspace><mi>T</mi><mi>e</mi><mi>X</mi><mspace linebreak="newline"></mspace></mrow><annotation encoding="application/x-tex">\\TeX\\</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="mspace"></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span><span class="mspace"></span></span></span> code copied to clipboard!
          </p>
          <button aria-label="Close Snackbar" class="icon medium" type="button" data-close-snackbar>
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
          </button>
    </div>
  </div>
  <div style="margin: 0.25rem; position: relative;">
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


function onKatexFormChange(this:HTMLFormElement,e:Event) {
  const inputs = getKatexInputs(this); 
  if (inputs) {
    const { tex, leqno, fleqn, output, blockDisplayStyle, dialog } = inputs;
    try {
      import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
      .then((res) => {
        const htmlString = res.katex.renderToString(tex,{ throwOnError: false, displayMode: blockDisplayStyle, leqno, fleqn });
        const html = renderOutput(htmlString,blockDisplayStyle,String(tex),dialog);
        output.innerHTML='';
        output.insertAdjacentHTML("afterbegin",html);
        onNewContentLoaded();
      })
    } catch(error) {
      console.error(error);
      output.innerHTML='';
      output.insertAdjacentHTML("afterbegin",getErrorAlert('Something went wrong rendering the katex expression. Check the console for the error.'));
      onNewContentLoaded(output);
    }
  }
}

function onKatexFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const inputs = getKatexInputs(this);
  if (inputs) {
    const { tex, leqno, fleqn, output, blockDisplayStyle, dialog } = inputs;
    try {
      import(/* webpackChunkName: "personal-website-shared" */'personal-website-shared')
      .then((res) => {
        const htmlString = res.katex.renderToString(tex,{ throwOnError: false, displayMode: blockDisplayStyle, leqno, fleqn });
        const html = renderOutput(htmlString,blockDisplayStyle,String(tex),dialog);
        output.innerHTML='';
        output.insertAdjacentHTML("afterbegin",html);
        onNewContentLoaded(output);
      })
    } catch(error) {
      console.error(error);
      output.innerHTML='';
      output.insertAdjacentHTML("afterbegin",getErrorAlert('Something went wrong rendering the katex expression. Check the console for the error.'));
      onNewContentLoaded(output);
    }
  }  
}

export function onKatexLoad(el:DocOrEl) {
  Array.from(el.querySelectorAll<HTMLTextAreaElement>('textarea[data-katex-input]')).forEach((el) => {
    const form = el.closest<HTMLFormElement>('form');
    if (form) {
      form.addEventListener('input',onKatexFormChange);
      form.addEventListener('change',onKatexFormChange);
      form.addEventListener('submit',onKatexFormSubmit);
    }
  })
}