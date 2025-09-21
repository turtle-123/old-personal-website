import { 
  createCommand, 
  VALID_HEX_REGEX, 
  type LexicalCommand, 
  LexicalEditor, 
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isLeafNode,
  $setSelection,
  LexicalNode,
  $getRoot,
  RootNode,
  EditorState,
  FOCUS_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  BLUR_COMMAND,
  RangeSelection,
  GridSelection
} from "lexical";
import { 
  mergeRegister,
  $dfs, 
  $restoreEditorState,

} from "@lexical/utils";
import { 
  $isOverflowNode,
  OverflowNode,
  $createOverflowNode,

} from "@lexical/overflow";
import { trimTextContentFromAnchor } from '@lexical/selection';
import { IS_FIREFOX } from "shared/environment";
export { addSwipeRightListener, addSwipeLeftListener, addSwipeDownListener, addSwipeUpListener } from './swipe';
import type { Socket  } from 'socket.io-client';

var MATH_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="math-markup-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Insert Math Markup</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details aria-label="About Inserting Math Content" class="mt-1 flat" style="background-color: var(--background);">
        <summary>
            <span class="h6 fw-regular">About Inserting Math Content</span>
            <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
            </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color: var(--background);">
            We use <a href="https://katex.org/" class="secondary link" target="_blank">KaTeX</a> to generate 
            math markup given a <span id="copy_math_htmll9vdp3omor" class="inline-katex">
              <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mi>e</mi><mi>X</mi></mrow><annotation encoding="application/x-tex">TeX</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span></span></span>
            </span> input. Enter a valid <span id="copy_math_htmll9vdp3omor" class="inline-katex">
              <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mi>e</mi><mi>X</mi></mrow><annotation encoding="application/x-tex">TeX</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span></span></span>
            </span> expression in the <span><code class="hljs"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">textarea</span>&gt;</span></span></code></span> below, 
            and we will use KaTeX to render the <span id="copy_math_htmll9vdp3omor" class="inline-katex">
              <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mi>e</mi><mi>X</mi></mrow><annotation encoding="application/x-tex">TeX</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span></span></span>
            </span>expression in HTML. 
        </div>
      </details>
      <form method="dialog" id="lexical-input-math-form-rand">
        <div class="input-group block mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="lexical-math-markup-tex-input"><span id="copy_math_htmll9vdp3omor" class="inline-katex">
            <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>T</mi><mi>e</mi><mi>X</mi></mrow><annotation encoding="application/x-tex">TeX</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span></span></span> Input:</label>
          <div class="mt-1 text-input block medium disabled">
              <textarea name="lexical-math-markup-tex-input" id="lexical-math-markup-tex-input" placeholder="a^{2}+b^{2}=c^{2}
e^{i\theta} = \cos \theta + i\sin \theta
i\hbar \frac{\partial \Psi}{\partial t} = -\frac{\hbar^2}{2m}
\frac{\partial^2 \Psi}{\partial x^2} + V \Psi
" 
              rows="10" minlength="1" spellcheck="false" autocomplete="off" autocapitalize="off" style="font-family: monospace!important;"></textarea>
          </div>
        </div>
        
        <div class="flex-row align-center justify-start">
          <fieldset class="grow-1">
            <legend class="body1 bold">Display Style:</legend>
            <label class="radio">
              <input type="radio" name="lex-math-display-style-radio" value="inline" class="secondary">
              Inline
            </label>
            <label class="radio mt-2">
              <input type="radio" name="lex-math-display-style-radio" value="block" class="secondary" checked>
              Block
            </label>
          </fieldset>
        </div>

        <div class="flex-row justify-between align-center mt-2">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="filled success medium" aria-label="Submit Form">SUBMIT</button>
        </div>
      </form>
      <div class="mt-2">
        <output form="lexical-input-math-form-rand" class="block" data-preview>

        </output>
      </div>
    </div>

    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>

  </div>
</div>`;
var NEWS_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-embed-news" data-close-backdrop data-esc>
  <div class="dialog medium" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Embed News Content</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details class="mt-2 flat" style="background-color: var(--background);" aria-label="About Inserting News Content">
        <summary>
          <span class="h6 fw-regular">About Embedding News Content</span>
          <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
          </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color:var(--background);">
          <ol class="body2">
            <li>Navigate to the News Article you want to embed.</li>
            <li>
              Copy the url of the article and paste into the input below.
              <ul>
                <li>
                  For a news article to be properly embedded, it must have valid <span><code class="hljs"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">meta</span>&gt;</span></span></code></span> tags as seen below.
                </li>
                <li class="t-warning fw-regular">
                  The image url must be able to be accessed from any source.
                </li>
              </ul>
            </li>
          </ol>
          <div style="position: relative; font-size: 0.85rem!important;" class="body2"><pre class="hz-scroll"><code class="hljs"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">property</span>=<span class="hljs-string">&quot;og:type&quot;</span> <span class="hljs-attr">content</span>=<span class="hljs-string">&quot;article&quot;</span> /&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">property</span>=<span class="hljs-string">&quot;og:type&quot;</span> <span class="hljs-attr">content</span>=<span class="hljs-string">&quot;any string&quot;</span> /&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">property</span>=<span class="hljs-string">&quot;og:image&quot;</span> <span class="hljs-attr">content</span>=<span class="hljs-string">&quot;valid image url&quot;</span> /&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">meta</span> <span class="hljs-attr">property</span>=<span class="hljs-string">&quot;og:description&quot;</span> <span class="hljs-attr">content</span>=<span class="hljs-string">&quot;any string&quot;</span> /&gt;</span></span></code></pre>

      </div>
        </div>
      </details>
      <form method="dialog" class="mt-2">
        <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="lex-embed-news-input">News Article URL:</label>
          <div class="text-input block medium">
              <input type="url" autocomplete="off" name="lex-embed-news-input" id="lex-embed-news-input" class="medium icon-before mt-1" required="" placeholder="Enter the news article url..." maxlength="500" spellcheck="false" autocapitalize="off">
              <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Newspaper"><path d="m22 3-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z"></path></svg>
          </div>
        </div>
        <div class="mt-2 flex-row justify-between align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form">

          <button type="submit" class="icon-text filled success medium" aria-label="Embed Content Form Submit">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
        <div class="mt-1 alert filled error icon medium" data-embed-error role="alert" hidden>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
          <p class="alert">
            Please enter a valid News Article url. 
          </p>
        </div>
      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var YOUTUBE_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-embed-youtube" data-close-backdrop data-esc>
  <div class="dialog medium" style="min-height: 375px; height: auto!important;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Embed Youtube Video</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details class="mt-2 flat" style="background-color: var(--background);" aria-label="About Inserting Youtube Content">
        <summary>
          <span class="h6 fw-regular">Embedding Youtube Videos</span>
          <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
          </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color:var(--background);">
          <ol class="body2">
            <li>Navigate to the page of the youtube video you want to embed.</li>
            <li>Copy the url and paste into the input below.</li>
          </ol>
        </div>
      </details>
      <form method="dialog" class="mt-2">
        <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="lex-embed-youtube-input">Youtube Embed URL:</label>
          <div class="text-input block medium">
              <input type="url" autocomplete="off" name="lex-embed-youtube-input" id="lex-embed-youtube-input" class="medium icon-before mt-1" required placeholder="Enter the Youtube Embed URL..." maxlength="500" spellcheck="false" autocapitalize="off" >
              <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="YouTube"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path></svg>
          </div>
        </div>
        
        <div class="mt-2 flex-row justify-between align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="icon-text filled success medium" aria-label="Embed Content Form Submit">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
        <div class="mt-1 alert filled error icon medium" data-embed-error role="alert" hidden>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
          <p class="alert">
            Please enter a valid Youtube url. 
          </p>
        </div>
      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var TIKTOK_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-embed-tiktok" data-close-backdrop data-esc>
  <div class="dialog medium" style="min-height: 375px; height: auto!important;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Embed TikTok Video</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details class="mt-2 flat" style="background-color: var(--background);" aria-label="About Inserting Youtube Content">
        <summary>
          <span class="h6 fw-regular">Embedding TikTok Videos</span>
          <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
          </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color:var(--background);">
          <ol class="body2">
            <li>
              Navigate to the TikTok post you want to embed on <a class="secondary link" target="_blank" href="https://www.tiktok.com/">TikTok.com</a>.
            </li>
            <li>
              Click on the <span class="bold">Share</span> button.
            </li>
            <li>
              Click on <span class="bold">Copy Link</span>.
            </li>
            <li>
              Paste the link into the input below.
            </li>
          </ol>
        </div>
      </details>
      <form method="dialog" class="mt-2">
        
        <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="true">
          <label for="tik-tok-embed-url">TikTok Embed Link:</label>
          <div class="text-input block medium">
              <input
              name="tik-tok-embed-url"
              id="tik-tok-embed-url" 
              class="mt-1 
              medium icon-before" 
              placeholder="Enter the TikTok Embed link..." 
              autocomplete="off" 
              autocapitalize="off" 
              spellcheck="false" 
              type="url" 
              >
              <svg class="icon-before" viewBox="0 0 448 512" title="tiktok" focusable="false" inert tabindex="-1"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>
          </div>
        </div>        
        <div class="mt-2 flex-row justify-between align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="icon-text filled success medium" aria-label="Embed Content Form Submit">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
        <div class="mt-1 alert filled error icon medium" data-embed-error role="alert" hidden>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
          <p class="alert">
            Something went wrong embedding the TikTok content. Try reloading the page or embedding a different video. 
          </p>
        </div>
      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var TWITTER_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-embed-twitter" data-close-backdrop data-esc>
  <div class="dialog medium" style="min-height: 375px; height: auto!important;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Embed X Post</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details class="mt-2 flat" style="background-color: var(--background);" aria-label="About Inserting Youtube Content">
        <summary>
          <span class="h6 fw-regular">Embedding X Posts</span>
          <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
          </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color:var(--background);">
          <ol class="body2">
            <li>Go to <a class="secondary link" target="_blank" href="https://x.com/home?lang=en">x.com</a>.</li>
            <li>Click on the three dots button in the upper right hand corner of the tweet.</li>
            <li>Click on the Embed Post button.</li>
            <li>
              Select the <span class="bold">Embedded Post</span> display option.
            </li>
            <li>
              Click on the <span class="bold">Copy Code</span> button.
            </li>
            <li>
              Paste the code into the textarea below and click submit.
            </li>
          </ol>
        </div>
      </details>
      <form method="dialog" class="mt-2">
        <div class="input-group block mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
          <label for="x-embed-code">X Embed Code:</label>
          <div class="mt-1 text-input block medium disabled">
              <textarea 
              name="x-embed-code" 
              id="x-embed-code" 
              placeholder="Enter the embed code generated using the process above." 
              rows="5" 
              minlength="1" 
              spellcheck="true"
              autocomplete="off"
              autocapitalize="off"
              ></textarea>
          </div>
        </div>
        
        <div class="mt-2 flex-row justify-between align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="icon-text filled success medium" aria-label="Embed Content Form Submit">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
        <div class="mt-1 alert filled error icon medium" data-embed-error role="alert" hidden>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
          <p class="alert">
            Something went wrong embedding the X post. Try reloading the page or embedding a different post. 
          </p>
        </div>
      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var INSTAGRAM_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-embed-instagram" data-close-backdrop data-esc>
  <div class="dialog medium" style="min-height: 375px; height: auto!important;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Embed Instagram Post</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <details class="mt-2 flat" style="background-color: var(--background);" aria-label="About Inserting Youtube Content">
        <summary>
          <span class="h6 fw-regular">Embedding Instagram Posts</span>
          <svg class="details" focusable="false" inert viewBox="0 0 24 24">
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
            </path>
          </svg>
        </summary>
        <div class="accordion-content" aria-hidden="true" style="background-color:var(--background);">
          <ol class="body2">
            <li>Go to the instagram post that you want to embed. </li>
            <li>Click on the three dots in the upper right hand corner of the post.</li>
            <li>Click <span class="bold">Embed</span>.</li>
            <li>Click <span class="bold">Copy embed code</span>.</li>
            <li>Paste the embed code into the textarea below.</li>
          </ol>
        </div>
      </details>
      <form method="dialog" class="mt-2">
        <div class="input-group block mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
          <label for="instagram-embed-code">Instagram Embed Code:</label>
          <div class="mt-1 text-input block medium disabled">
              <textarea 
              name="instagram-embed-code" 
              id="instagram-embed-code" 
              placeholder="Enter the embed code generated using the process above." 
              rows="5" 
              minlength="1" 
              spellcheck="true"
              autocomplete="off"
              autocapitalize="off"
              ></textarea>
          </div>
        </div>
        
        <div class="mt-2 flex-row justify-between align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="icon-text filled success medium" aria-label="Embed Content Form Submit">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
        <div class="mt-1 alert filled error icon medium" data-embed-error role="alert" hidden>
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
          <p class="alert">
            Something went wrong embedding the Instagram post. Try reloading the page or embedding a different post. 
          </p>
        </div>
      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var DETAILS_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="details-content-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Insert Details Element</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form id="lexical-insert-details-form" method="dialog" class="mt-2">
        <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="lexical-details-summary-title">Summary Title:</label>
          <div class="text-input block medium">
              <input 
              type="text" 
              autocomplete="off" 
              name="lexical-details-summary-title" 
              id="lexical-details-summary-title" 
              class="medium icon-before mt-1" 
              required
              placeholder="Enter the Title of the Details Element..." 
              maxlength="50"
              minlength="1" 
              spellcheck="true" 
              autocapitalize="off"
              value="Summary Title"
              >
              <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Details"><path d="M12 3 2 21h20L12 3zm1 5.92L18.6 19H13V8.92zm-2 0V19H5.4L11 8.92z"></path></svg>
          </div>
        </div>
        <label class="checkbox mt-3 medium">
          <input type="checkbox" class="primary" name="lexical-insert-details-flat" id="lexical-insert-details-flat">
          Flat
        </label>
        <div class="mt-3 flex-row align-center justify-end">
          <button type="submit" aria-label="Submit Form" class="filled success medium">
            SUBMIT
          </button>
        </div>
      </form>
      <output class="block mt-4" form="lexical-insert-details-form" style="padding: 5px 4px 15px 4px; background-color:var(--background);">
        <p class="bold h6">Example Output:</p>
        <details data-output aria-label="DETAILS DESCRIPTION" class="mt-2" open>
              <summary>
                  <span data-output class="h6 fw-regular">
                    Summary Title
                  </span>
                  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
                  </svg>
              </summary>
              <div class="accordion-content" aria-hidden="false">
                 You will be able to insert content here after confirming the title of the <span><code class="hljs"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">details</span>&gt;</span></span></code></span> element.
              </div>
        </details>
      </output>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var TABLES_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="tables-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Insert Table</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <div class="tabs mt-2">
        <ul class="tabs" role="tablist">
          <li role="presentation">
            <button id="create_table_from_nothing_lexical" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
              Create Table
            </button>
          </li>
          <li role="presentation">
            <button id="create_table_from_upload_lexical" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
              Upload Data
            </button>
          </li>
        </ul>
      </div>
      <div class="tab-panels">
        <div aria-labelledby="create_table_from_nothing_lexical" role="tabpanel" tabindex="0">
          <form id="lexical-insert-table-form" method="dialog" class="mt-1">
            <fieldset>
              <legend class="h6 bold">Customization</legend>
              <div class="w-100 flex-row align-start gap-2">
                <div class="grow-1">
                  <label class="checkbox">
                    <input type="checkbox" class="primary" name="lexical-table-include-heading-row" id="lexical-table-include-heading-row" checked>
                    Include Heading Row
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="secondary" name="lexical-table-include-heading-column" id="lexical-table-include-heading-column" checked>
                    Include Heading Column
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="error" name="lexical-table-include-caption" id="lexical-table-include-caption">
                    Include Caption
                  </label>
                </div>
                <div class="grow-1">
                  <label class="checkbox">
                    <input type="checkbox" class="info" name="lexical-table-banded-rows" id="lexical-table-banded-rows">
                    Banded Rows
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="success" name="lexical-table-banded-cols" id="lexical-table-banded-cols">
                    Banded Columns
                  </label>
                </div>
              </div>
              
              
            </fieldset>
            <fieldset class="mt-2">
              <legend class="body1 bold">Align:</legend>
              <div class="flex-row justify-between align-center w-100">
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align" value="left" class="secondary">
                  Left
                </label>
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align" value="center" class="secondary" checked>
                  Center
                </label>
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align" value="right" class="secondary">
                  Right
                </label>
              </div>
              
            </fieldset>
            <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
              <label for="lex-table-caption-input">Table Caption:</label>
              <div class="text-input block medium">
                  <input 
                  type="text"  
                  name="lex-table-caption-input" 
                  id="lex-table-caption-input" 
                  class="medium icon-before mt-1"  
                  maxlength="100"
                  minlength="1" 
                  spellcheck="true" 
                  autocapitalize="off"
                  value="Table Caption"
                  disabled
                  >
                  <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
              </div>
            </div>
            <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
              <label for="lexical-table-number-rows">Number of Rows:</label>
              <div class="mt-1 number-input medium">
                  <input 
                  type="number" 
                  min="2" 
                  max="50" 
                  value="5" 
                  name="lexical-table-number-rows" 
                  id="lexical-table-number-rows" 
                  autocomplete="off" 
                  spellcheck="false" 
                  autocapitalize="off"
                  >
                  <button class="icon large" data-increase aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
            <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
              <label for="lexical-table-number-cols">Number of Columns:</label>
              <div class="mt-1 number-input medium">
                  <input 
                  type="number" 
                  min="2" 
                  max="50" 
                  value="5" 
                  name="lexical-table-number-cols" 
                  id="lexical-table-number-cols" 
                  autocomplete="off" 
                  spellcheck="false" 
                  autocapitalize="off"
                  >
                  <button class="icon large" data-increase aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
            <div class="mt-3 flex-row align-center justify-between">
              <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
              <button type="submit" aria-label="Submit Form" class="filled success medium">
                SUBMIT
              </button>
            </div>
          </form>
    
          <div class="block body1 bold mt-4">Preview:</div>
          <output form="lexical-insert-table-form" class="block mt-2 table-wrapper" data-preview>
            
          </output>
        </div>
        <div aria-labelledby="create_table_from_upload_lexical" role="tabpanel" tabindex="0" hidden>
          <form method="dialog" class="mt-1" id="lexical-insert-table-upload-data">
            <label for="upload-data-to-table" class="body1 bold">Data File:</label>
            <input id="upload-data-to-table" name="upload-data-to-table" class="mt-1 primary" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            <fieldset class="mt-2">
              <legend class="h6 bold">Customization</legend>
              <div class="w-100 flex-row align-start gap-2">
                <div class="grow-1">
                  <label class="checkbox">
                    <input type="checkbox" class="primary" name="lexical-table-include-heading-row-upload" id="lexical-table-include-heading-row-upload" checked>
                    Include Heading Row
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="secondary" name="lexical-table-include-heading-column-upload" id="lexical-table-include-heading-column-upload" checked>
                    Include Heading Column
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="error" name="lexical-table-include-caption-upload" id="lexical-table-include-caption-upload">
                    Include Caption
                  </label>
                </div>
                <div class="grow-1">
                  <label class="checkbox">
                    <input type="checkbox" class="info" name="lexical-table-banded-rows-upload" id="lexical-table-banded-rows-upload">
                    Banded Rows
                  </label>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="success" name="lexical-table-banded-cols-upload" id="lexical-table-banded-cols-upload">
                    Banded Columns
                  </label>
                </div>
              </div>
            </fieldset>
            <fieldset class="mt-2">
              <legend class="body1 bold">Align:</legend>
              <div class="flex-row justify-between align-center w-100">
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align-upload" value="left" class="secondary">
                  Left
                </label>
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align-upload" value="center" class="secondary" checked>
                  Center
                </label>
                <label class="radio" style="width: auto;">
                  <input type="radio" name="lexical-insert-table-align-upload" value="right" class="secondary">
                  Right
                </label>
              </div>
              
            </fieldset>
            <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
              <label for="lex-table-caption-input-upload">Table Caption:</label>
              <div class="text-input block medium">
                  <input 
                  type="text"  
                  name="lex-table-caption-input-upload" 
                  id="lex-table-caption-input-upload" 
                  class="medium icon-before mt-1"  
                  maxlength="100"
                  minlength="1" 
                  spellcheck="true" 
                  autocapitalize="off"
                  value="Table Caption"
                  disabled
                  >
                  <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
              </div>
            </div>

            <div class="mt-3 flex-row align-center justify-between">
              <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
              <button type="submit" aria-label="Submit Form" class="filled success medium" disabled>
                SUBMIT
              </button>
            </div>
          </form>
            <div class="block body1 bold mt-4">Preview:</div>
            <output style="background-color: var(--background);" form="lexical-insert-table-upload-data" class="block mt-2 table-wrapper p-md" data-preview>
              
            </output>
        
        </div>
      </div>
      
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
const GET_HORIZONTAL_RULE_DIALOG = (textColor:string) => `<div style="display: none;" hidden class="dialog-wrapper" id="horizontal-rule-lexical" data-close-backdrop data-esc>
  <div class="dialog small" data-click-capture style="min-height: 350px !important; height: auto!important; max-height: 95vh!important; width: 350px!important;">
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold" data-title>Insert Horizontal Rule</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form method="dialog">
        <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="lex-horizontal-rule-width">Horizontal Rule Width:</label>
          <div class="mt-1 number-input medium">
              <input 
              type="number" 
              min="1" 
              max="10" 
              value="1" 
              name="lex-horizontal-rule-width" 
              id="lex-horizontal-rule-width" 
              autocomplete="off" 
              spellcheck="false" 
              autocapitalize="off"
              >
              <button class="icon large" data-increase aria-label="Increase Input" type="button">
                  <svg focusable="false" inert viewBox="0 0 24 24">
                      <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                      </path>
                  </svg>
              </button>
              <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
                  <svg focusable="false" inert viewBox="0 0 24 24">
                      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                      </path>
                  </svg>
              </button>
          </div>
        </div>
        <label class="body2 mt-2" for="lex-horizontal-rule-color">Horizontal Rule Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
          <input type="color" data-coloris name="lex-horizontal-rule-color" id="lex-horizontal-rule-color" value="${textColor}" style="margin-top: 2px;">
          <span class="body2">${textColor}</span>
        </div>
        <label class="checkbox mt-2">
          <input checked type="checkbox" class="primary" name="horizontal-rule-default" id="horizontal-rule-default">
          Default Horizontal Rule
        </label>
        <div class="block mt-3" tabindex="-1">
          <p tabindex="-1" class="body1 bold text-align-left" style="margin-bottom: 6px;">Preview:</p>
          <hr data-example style="border-bottom-width: 1px; border-bottom-color: var(--divider);" />
        </div>
        <div class="flex-row align-center justify-between mt-3">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="filled success medium" aria-label="Submit Form">
            SUBMIT
          </button>
        </div>

      </form>
    </div>
    <div class="dialog-footer no-pad" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var VIEW_SIZES_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="view-content-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture style="width: 850px;">
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">View Content At Different Sizes</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body hz-scroll" style="overflow-x: auto!important;">
      <div class="tabs mt-2">
        <ul class="tabs" role="tablist">
          <li role="presentation">
            <button id="mobile-tab-button-lexical-dialog" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">
              Mobile
            </button>
          </li>
          <li role="presentation">
            <button id="tablet-tab-button-lexical-dialog" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">
              Tablet
            </button>
          </li>
          <li role="presentation">
            <button id="lexical-tab-button-lexical-dialog" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="2" tabindex="-1">
              Desktop
            </button>
          </li>
        </ul>
      </div>
      <div class="tab-panels" style="background-color: var(--secondary-background);">
        <div aria-labelledby="mobile-tab-button-lexical-dialog" role="tabpanel" tabindex="0">
          <div style="padding-top: 8px;">
            <div data-rich-text-editor data-type="full" id="example-mobile-view-lexical-editor" class="lexical-wrapper example-render preview-editor-mobile" aria-labelledby="lexical-view-mobile-size-dialog hz-scroll">

            </div>
          </div>
        </div>
        <div aria-labelledby="tablet-tab-button-lexical-dialog" role="tabpanel" tabindex="0" hidden>
          <div style="padding-top: 8px;">
            <div data-rich-text-editor data-type="full"  id="example-tablet-view-lexical-editor" class="lexical-wrapper example-render preview-editor-tablet" aria-labelledby="lexical-view-tablet-size-dialog hz-scroll">

            </div>
          </div>
          
        </div>
        <div aria-labelledby="desktop-tab-button-lexical-dialog" role="tabpanel" tabindex="0" hidden>
          <div style="padding-top: 8px;">
            <div data-rich-text-editor data-type="full" id="example-desktop-view-lexical-editor" class="lexical-wrapper example-render preview-editor-desktop" aria-labelledby="lexical-view-desktop-size-dialog hz-scroll">

            </div> 
          </div>
           
        </div>
      </div>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
const GET_BLOCK_EDIT_DIALOG = (background:string,textColor:string) => `<div style="display: none;" hidden class="dialog-wrapper" id="lexical-block-edit-dialog" data-close-backdrop data-esc>
  <div class="dialog large">
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Edit Style of Block Nodes</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <p class="body2 mt-1">
        Edit the background color, default text color, margin, padding, and border of block nodes. Editable block nodes include <span class="bold">paragraphs</span>, <span class="bold">headers</span>, and <span class="bold">lists</span>.
      </p>
      <form method="dialog" id="lexical-block-style-form" class="mt-2">
        <div class="tabs hz-scroll">
          <ul class="tabs" role="tablist">
            <li role="presentation">
              <button id="lex-block-gen-styling" class="tab-button t-secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">General</button>
            </li>
            <li role="presentation">
              <button id="lex-block-borders-styling" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">Borders</button>
            </li>
            <li role="presentation">
              <button id="lex-block-box-shadow-styling" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="3" tabindex="-1">Box Shadow</button>
            </li>
          </ul>
        </div>
        <div class="tab-panels">
          <div aria-labelledby="lex-block-gen-styling" role="tabpanel" tabindex="0" class="mt-2">
            <div class="flex-row justify-start align-center">
              <div class="grow-1">
                <label class="body2" for="lex-block-background-color">Background Color:</label>
                <div class="flex-row justify-begin align-center gap-2">
                  <input type="color" data-coloris name="lex-block-background-color" id="lex-block-background-color" value="${background}" style="margin-top: 2px;" />
                  <span class="body2">${background}</span>
                </div>
                <label class="checkbox mt-2">
                  <input type="checkbox" class="primary" name="lex-block-background-color-transparent" id="lex-block-background-color-transparent" checked />
                  Transparent
                </label>
              </div>
              <div class="grow-1">
                <label class="body2" for="lex-block-text-color">Default Text Color:</label>
                <div class="flex-row justify-begin align-center gap-2">
                  <input type="color" data-coloris name="lex-block-text-color" id="lex-block-text-color" value="${textColor}" style="margin-top: 2px;" />
                  <span class="body2">${textColor}</span>
                </div>
                <label class="checkbox mt-2">
                  <input type="checkbox" class="secondary" name="lex-block-text-color-inherit" id="lex-block-text-color-inherit" checked />
                  Inherit
                </label>
              </div>
            </div>
            <div class="flex-row align-center w-100 justify-start gap-2 mt-2"> <div class="grow-1">
              <label for="lex-block-margin">Margin:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0" 
                  name="lex-block-margin" 
                  id="lex-block-margin" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
           <div class="grow-1">
              <label for="lex-block-padding">Padding:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-padding"
                  id="lex-block-padding" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
          </div><div class="flex-row align-center w-100 justify-start gap-2 mt-4"> <div class="grow-1">
              <label for="lex-block-margin-top">Margin Top:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="6"
                  name="lex-block-margin-top"
                  id="lex-block-margin-top" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
           <div class="grow-1">
              <label for="lex-block-padding-top">Padding Top:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-padding-top"
                  id="lex-block-padding-top" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
          </div><div class="flex-row align-center w-100 justify-start gap-2 mt-4"> <div class="grow-1">
              <label for="lex-block-margin-right">Margin Right:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-margin-right"
                  id="lex-block-margin-right" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
           <div class="grow-1">
              <label for="lex-block-padding-right">Padding Right:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-padding-right"
                  id="lex-block-padding-right" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
          </div><div class="flex-row align-center w-100 justify-start gap-2 mt-4"> <div class="grow-1">
              <label for="lex-block-margin-bottom">Margin Bottom:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="6"
                  name="lex-block-margin-bottom"
                  id="lex-block-margin-bottom" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
           <div class="grow-1">
              <label for="lex-block-padding-bottom">Padding Bottom:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-padding-bottom"
                  id="lex-block-padding-bottom" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
          </div><div class="flex-row align-center w-100 justify-start gap-2 mt-4"> <div class="grow-1">
              <label for="lex-block-margin-left">Margin Left:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-margin-left"
                  id="lex-block-margin-left" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
           <div class="grow-1">
              <label for="lex-block-padding-left">Padding Left:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="15" value="0"
                  name="lex-block-padding-left"
                  id="lex-block-padding-left" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
            </div>
          </div>
          
          </div>
          <div aria-labelledby="lex-block-borders-styling" role="tabpanel" tabindex="0" class="mt-2" hidden>
            <fieldset class="block mt-2">
              <legend class="h6 bold">Border</legend>
              <div class="flex-row align-start justify-start w-100">
                <div class="grow-1">
                  <label class="body2" for="lex-block-border-color">Border Color:</label>
                  <div class="flex-row justify-begin align-center gap-2"> 
                    <input type="color" data-coloris name="lex-block-border-color" id="lex-block-border-color" value="${textColor}" style="margin-top: 2px;" />
                    <span class="body2">${textColor}</span>
                  </div>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="primary" name="lex-block-border-color-transparent" id="lex-block-border-color-transparent" checked />
                    Transparent
                  </label>
                </div>
                <div class="grow-1">
                  <div class="body1 bold" id="border-style-label">Border Style:</div>
                   <div class="flex-row justify-center mt-1">
                    <div class="select">
                      <button type="button" role="combobox" aria-haspopup="listbox"
                      aria-controls="border-style-dropdown"
                      aria-labelledby="border-style-label" class="select" aria-label="Border Style Select" data-popover
                      data-pelem="#border-style-dropdown" data-click  aria-expanded="false"
                      id="border-style-select-button"
                      style="min-width: 100px;"
                      >
                        <span class="body1">None</span>
                        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                      </button>
                      <div tabindex="0" id="border-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                        <input type="text" hidden="" value="none" name="border-style-value" id="border-style-value">
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                          <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                          <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                          <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                          <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                          <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                          <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                          <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                          <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                          <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                          <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
               <div class="grow-1">
                  <label for="lex-block-border-width">Border Width:</label>
                  <div class="mt-1 number-input medium">
                      <input type="number" min="0" max="15" value="0"
                      name="lex-block-border-width"
                      id="lex-block-border-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                      <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                              </path>
                          </svg>
                      </button>
                      <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                              </path>
                          </svg>
                      </button>
                  </div>
               </div>
               <div class="grow-1">
                <label for="lex-block-border-radius">Border Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="50" value="0"
                    name="lex-block-border-radius"
                    id="lex-block-border-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
               </div>
              </div>
            </fieldset>
            <fieldset class="block mt-2">
              <legend class="h6 bold">Border Top</legend>
              <div class="flex-row align-start justify-start w-100">
                <div class="grow-1">
                  <label class="body2" for="lex-block-border-top-color">Border Top Color:</label>
                  <div class="flex-row justify-begin align-center gap-2">
                    <input type="color" data-coloris name="lex-block-border-top-color" id="lex-block-border-top-color" value="${textColor}" style="margin-top: 2px;" />
                    <span class="body2">${textColor}</span>
                  </div>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="primary" name="lex-block-border-top-color-transparent" id="lex-block-border-top-color-transparent" checked />
                    Transparent
                  </label>
                </div>
                <div class="grow-1">
                  <div class="body1 bold" id="border-top-style-label">Border Top Style:</div>
                   <div class="flex-row justify-center mt-1">
                    <div class="select">
                      <button type="button" role="combobox" aria-haspopup="listbox"
                      aria-controls="border-style-dropdown"
                      aria-labelledby="border-top-style-label" class="select" aria-label="Border Top Style Select" data-popover
                      data-pelem="#border-top-style-dropdown" data-click aria-expanded="false"
                      id="border-top-style-select-button"
                      style="min-width: 100px;"
                      >
                        <span class="body1">None</span>
                        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                      </button>
                      <div tabindex="0" id="border-top-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                        <input type="text" hidden="" value="none" name="border-top-style-value" id="border-top-style-value">
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                          <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                          <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                          <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                          <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                          <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                          <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                          <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                          <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                          <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                          <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
               <div class="grow-1">
                  <label for="lex-block-border-top-width">Border Top Width:</label>
                  <div class="mt-1 number-input medium">
                      <input type="number" min="0" max="15" value="0"
                      name="lex-block-border-top-width"
                      id="lex-block-border-top-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                      <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                              </path>
                          </svg>
                      </button>
                      <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                              </path>
                          </svg>
                      </button>
                  </div>
               </div>
               <div class="grow-1">
                <label for="lex-block-border-top-radius">Border Top Left Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="50" value="0"
                    name="lex-block-border-top-radius"
                    id="lex-block-border-top-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
               </div>
              </div>
            </fieldset>
            <fieldset class="block mt-2">
              <legend class="h6 bold">Border Right</legend>
              <div class="flex-row align-start justify-start w-100">
                <div class="grow-1">
                  <label class="body2" for="lex-block-border-right-color">Border Right Color:</label>
                  <div class="flex-row justify-begin align-center gap-2">
                    <input type="color" data-coloris name="lex-block-border-right-color" id="lex-block-border-right-color" value="${textColor}" style="margin-top: 2px;" />
                    <span class="body2">${textColor}</span>
                  </div>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="primary" name="lex-block-border-right-color-transparent" id="lex-block-border-right-color-transparent" checked />
                    Transparent
                  </label>
                </div>
                <div class="grow-1">
                  <div class="body1 bold" id="border-right-style-label">Border Right Style:</div>
                   <div class="flex-row justify-center mt-1">
                    <div class="select">
                      <button type="button" role="combobox" aria-haspopup="listbox"
                      aria-controls="border-style-dropdown"
                      aria-labelledby="border-right-style-label" class="select" aria-label="Border Right Style Select" data-popover
                      data-pelem="#border-right-style-dropdown" data-click aria-expanded="false"
                      id="border-right-style-select-button"
                      style="min-width: 100px;"
                      >
                        <span class="body1">None</span>
                        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                      </button>
                      <div tabindex="0" id="border-right-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                        <input type="text" hidden="" value="none" name="border-right-style-value" id="border-right-style-value">
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                          <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                          <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                          <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                          <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                          <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                          <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                          <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                          <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                          <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                          <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
               <div class="grow-1">
                  <label for="lex-block-border-right-width">Border Right Width:</label>
                  <div class="mt-1 number-input medium">
                      <input type="number" min="0" max="15" value="0"
                      name="lex-block-border-right-width"
                      id="lex-block-border-right-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                      <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                              </path>
                          </svg>
                      </button>
                      <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                              </path>
                          </svg>
                      </button>
                  </div>
               </div>
               <div class="grow-1">
                <label for="lex-block-border-right-radius">Border Top Right Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="50" value="0"
                    name="lex-block-border-right-radius"
                    id="lex-block-border-right-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
               </div>
              </div>
            </fieldset>
            <fieldset class="block mt-2">
              <legend class="h6 bold">Border Bottom</legend>
              <div class="flex-row align-start justify-start w-100">
                <div class="grow-1">
                  <label class="body2" for="lex-block-border-bottom-color">Border Bottom Color:</label>
                  <div class="flex-row justify-begin align-center gap-2">
                    <input type="color" data-coloris name="lex-block-border-bottom-color" id="lex-block-border-bottom-color" value="${textColor}" style="margin-top: 2px;" />
                    <span class="body2">${textColor}</span>
                  </div>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="primary" name="lex-block-border-bottom-color-transparent" id="lex-block-border-bottom-color-transparent" checked />
                    Transparent
                  </label>
                </div>
                <div class="grow-1">
                  <div class="body1 bold" id="border-bottom-style-label">Border Bottom Style:</div>
                   <div class="flex-row justify-center mt-1">
                    <div class="select">
                      <button type="button" role="combobox" aria-haspopup="listbox"
                      aria-controls="border-style-dropdown"
                      aria-labelledby="border-bottom-style-label" class="select" aria-label="Border Bottom Style Select" data-popover
                      data-pelem="#border-bottom-style-dropdown" data-click aria-expanded="false"
                      id="border-bottom-style-select-button"
                      style="min-width: 100px;"
                      >
                        <span class="body1">None</span>
                        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                      </button>
                      <div tabindex="0" id="border-bottom-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                        <input type="text" hidden="" value="none" name="border-bottom-style-value" id="border-bottom-style-value">
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                          <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                          <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                          <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                          <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                          <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                          <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                          <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                          <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                          <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                          <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
               <div class="grow-1">
                  <label for="lex-block-border-bottom-width">Border Bottom Width:</label>
                  <div class="mt-1 number-input medium">
                      <input type="number" min="0" max="15" value="0"
                      name="lex-block-border-bottom-width"
                      id="lex-block-border-bottom-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                      <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                              </path>
                          </svg>
                      </button>
                      <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                              </path>
                          </svg>
                      </button>
                  </div>
               </div>
               <div class="grow-1">
                <label for="lex-block-border-bottom-radius">Border Bottom Right Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="50" value="0"
                    name="lex-block-border-bottom-radius"
                    id="lex-block-border-bottom-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
               </div>
              </div>
            </fieldset>
            <fieldset class="block mt-2">
              <legend class="h6 bold">Border Left</legend>
              <div class="flex-row align-start justify-start w-100">
                <div class="grow-1">
                  <label class="body2" for="lex-block-border-left-color">Border Left Color:</label>
                  <div class="flex-row justify-begin align-center gap-2">
                    <input type="color" data-coloris name="lex-block-border-left-color" id="lex-block-border-left-color" value="${textColor}" style="margin-top: 2px;" />
                    <span class="body2">${textColor}</span>
                  </div>
                  <label class="checkbox mt-2">
                    <input type="checkbox" class="primary" name="lex-block-border-left-color-transparent" id="lex-block-border-left-color-transparent" checked />
                    Transparent
                  </label>
                </div>
                <div class="grow-1">
                  <div class="body1 bold" id="border-left-style-label">Border Left Style:</div>
                   <div class="flex-row justify-center mt-1">
                    <div class="select">
                      <button type="button" role="combobox" aria-haspopup="listbox"
                      aria-controls="border-style-dropdown"
                      aria-labelledby="border-left-style-label" class="select" aria-label="Border Left Style Select" data-popover
                      data-pelem="#border-left-style-dropdown" data-click aria-expanded="false"
                      id="border-left-style-select-button"
                      style="min-width: 100px;"
                      >
                        <span class="body1">None</span>
                        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                      </button>
                      <div tabindex="0" id="border-left-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                        <input type="text" hidden="" value="none" name="border-left-style-value" id="border-left-style-value">
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                          <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                          <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                          <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                          <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                          <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                          <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                          <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                          <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                          <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                        </button>
                        <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                          <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
               <div class="grow-1">
                  <label for="lex-block-border-left-width">Border Left Width:</label>
                  <div class="mt-1 number-input medium">
                      <input type="number" min="0" max="15" value="0"
                      name="lex-block-border-left-width"
                      id="lex-block-border-left-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                      <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                              </path>
                          </svg>
                      </button>
                      <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                          <svg focusable="false" inert viewBox="0 0 24 24">
                              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                              </path>
                          </svg>
                      </button>
                  </div>
               </div>
               <div class="grow-1">
                <label for="lex-block-border-left-radius">Border Bottom Left Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="50" value="0"
                    name="lex-block-border-left-radius"
                    id="lex-block-border-left-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
               </div>
              </div>
            </fieldset>
          </div>
          <div aria-labelledby="lex-block-box-shadow-styling" role="tabpanel" tabindex="0" class="mt-2" hidden>
            <div class="flex-row justify-start align-start mt-3">
              <div class="grow-1 align-center">
                <label class="body2" for="lex-block-box-shadow-color">Box Shadow Color:</label>
                <div class="flex-row justify-begin align-center gap-2">
                  <input type="color" data-coloris name="lex-block-box-shadow-color" id="lex-block-box-shadow-color" value="${textColor}" style="margin-top: 2px;" />
                  <span class="body2">${textColor}</span>
                </div>
                <label class="checkbox mt-2">
                  <input type="checkbox" class="primary" name="lex-block-box-shadow-color-transparent" id="lex-block-box-shadow-color-transparent" checked />
                  Transparent
                </label>
              </div>
              <div class="grow-1 align-center">
                <label class="checkbox medium">
                  <input type="checkbox" class="primary" name="lex-block-box-shadow-inset" id="lex-block-box-shadow-inset" />
                  Inset
                </label>
              </div>
            </div>
            <div class="flex-row justify-start align-center gap-2 mt-4">
              <div class="grow-1">
                <label for="lex-block-box-shadow-offset-x">Box Shadow Offset X:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="-15" max="15" value="0"
                    name="lex-block-box-shadow-offset-x"
                    id="lex-block-box-shadow-offset-x" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
             </div>
             <div class="grow-1">
                <label for="lex-block-box-shadow-offset-y">Box Shadow Offset Y:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="-15" max="15" value="0"
                    name="lex-block-box-shadow-offset-y"
                    id="lex-block-box-shadow-offset-y" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
              </div>
            </div>
            <div class="flex-row justify-start align-center gap-2 mt-4">
              <div class="grow-1">
                <label for="lex-block-box-shadow-blur-radius">Blur Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="15" value="0"
                    name="lex-block-box-shadow-blur-radius"
                    id="lex-block-box-shadow-blur-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
             </div>
             <div class="grow-1">
                <label for="lex-block-box-shadow-spread-radius">Spread Radius:</label>
                <div class="mt-1 number-input medium">
                    <input type="number" min="0" max="15" value="0"
                    name="lex-block-box-shadow-spread-radius"
                    id="lex-block-box-shadow-spread-radius" autocomplete="off" spellcheck="false" autocapitalize="off">
                    <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                            </path>
                        </svg>
                    </button>
                    <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                        <svg focusable="false" inert viewBox="0 0 24 24">
                            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                            </path>
                        </svg>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top: 2rem; padding: 20px; background-color: var(--background)!important;" class="block" role="presentation">
          <div class="block h6 bold text-align-center" id="block-style-form-example">
            Preview
          </div>
        </div>
        

        <div class="flex-row justify-between mt-2 align-center">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form">
          </input>
          <div role="toolbar" class="flex-row gap-3">
            <button id="randomize-block-style-btn" type="button" class="filled info icon-text medium" aria-label="Randomize Form">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Shuffle"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"></path></svg>
              RANDOMIZE
            </button>
            <button type="submit" class="filled success icon-text medium" aria-label="Submit Changes to Block Node Styling">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              SUBMIT
            </button>
          </div>
        </div>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
const GET_CELL_EDIT_DIALOG = (background:string,textColor:string) => `<div style="display: none;" hidden class="dialog-wrapper" id="lexical-table-cell-bg" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Edit Selected Cells</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <p class="body1 mt-1">Change the background color, vertical align, and borders of the cells in the current selection.</p>
      <form method="dialog" class="mt-2 p-md" id="lexical-edit-bg-color-form">
        <label class="body1 bold" for="lexical-cell-bg-color-input">Cell(s) Background Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
          <input type="color" data-coloris name="lexical-cell-bg-color-input" id="lexical-cell-bg-color-input" value="${background}" style="margin-top: 4px;">
          <span class="body2">${background}</span>
        </div>
        <label class="checkbox mt-2">
          <input type="checkbox" class="primary" name="lexical-cell-bg-color-input-trans" id="lexical-cell-bg-color-input-trans" checked>
          Transparent
        </label>

        <fieldset class="mt-3">
          <legend class="h6 bold">Vertical Align:</legend>
          <div class="flex-row align-center justify-start gap-3">
            <label class="radio">
              <input type="radio"  name="table-cell-vertical-align" value="top" class="secondary">
              Top
            </label>
            <label class="radio">
              <input type="radio"  name="table-cell-vertical-align" value="middle" class="secondary" checked>
              Middle
            </label>
            <label class="radio">
              <input type="radio"  name="table-cell-vertical-align" value="bottom" class="secondary" checked>
                Bottom
            </label>            
          </div>
        </fieldset>

        <fieldset class="block mt-3">
          <legend class="h6 bold">Border</legend>
          <div class="flex-row align-start justify-start w-100">
            <div class="grow-1">
              <label class="body2" for="lex-cell-border-color">Border Color:</label>
              <div class="flex-row justify-begin align-center gap-2"> 
                <input type="color" data-coloris name="lex-cell-border-color" id="lex-cell-border-color" value="${textColor}" style="margin-top: 2px;" />
                <span class="body2">${textColor}</span>
              </div>
              <label class="checkbox mt-2">
                <input type="checkbox" class="primary" name="lex-cell-border-color-transparent" id="lex-cell-border-color-transparent" checked />
                Transparent
              </label>
            </div>
            <div class="grow-1">
              <div class="body1 bold" id="border-style-label">Border Style:</div>
               <div class="flex-row justify-center mt-1">
                <div class="select">
                  <button type="button" role="combobox" aria-haspopup="listbox"
                  aria-controls="cell-border-style-dropdown"
                  aria-labelledby="border-style-label" class="select" aria-label="Border Style Select" data-popover
                  data-pelem="#cell-border-style-dropdown" data-click  aria-expanded="false"
                  id="cell-border-style-select-button"
                  style="min-width: 100px;"
                  >
                    <span class="body1">None</span>
                    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
                  </button>
                  <div tabindex="0" id="cell-border-style-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
                    <input type="text" hidden="" value="none" name="cell-border-style-value" id="cell-border-style-value">
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="none">
                      <span style="padding:2px;border: 3px none var(--text-primary);">None</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dotted">
                      <span style="padding:2px;border: 3px dotted var(--text-primary);">Dotted</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="dashed">
                      <span style="padding:2px;border: 3px dashed var(--text-primary);">Dashed</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="solid">
                      <span style="padding:2px;border: 3px solid var(--text-primary);">Solid</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="double">
                      <span style="padding:2px;border: 3px double var(--text-primary);">Double</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="groove">
                      <span style="padding:2px;border: 3px groove var(--text-primary);">Groove</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="ridge">
                      <span style="padding:2px;border: 3px ridge var(--text-primary);">Ridge</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="inset">
                      <span style="padding:2px;border: 3px inset var(--text-primary);">Inset</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="outset">
                      <span style="padding:2px;border: 3px outset var(--text-primary);">Outset</span>
                    </button>
                    <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="hidden">
                      <span style="padding:2px;border: 3px hidden var(--text-primary);">Hidden</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex-row align-center w-100 justify-start gap-2 mt-2">
           <div class="grow-1">
              <label for="lex-cell-border-width">Border Width:</label>
              <div class="mt-1 number-input medium">
                  <input type="number" min="0" max="5" value="0"
                  name="lex-cell-border-width"
                  id="lex-cell-border-width" autocomplete="off" spellcheck="false" autocapitalize="off">
                  <button class="icon large" data-increase="" aria-label="Increase Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                          </path>
                      </svg>
                  </button>
                  <button class="icon large" data-decrease="" aria-label="Decrease Input" type="button">
                      <svg focusable="false" inert viewBox="0 0 24 24">
                          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                          </path>
                      </svg>
                  </button>
              </div>
           </div>
          </div>
        </fieldset>

        <div class="flex-row align-center justify-between mt-3">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="filled success medium" aria-label="Submit Form">SUBMIT</button>
        </div>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var TABLE_EDIT_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="edit-table-lexical" data-close-backdrop data-esc>
  <div class="dialog large" style="min-height: 450px;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Edit Table</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form method="dialog" class="mt-2" id="lexical-edit-table-form">
        <fieldset>
          <legend class="h6 bold">Customization:</legend>
          <label class="checkbox">
            <input type="checkbox" class="primary" name="edit-table-banded-rows" id="edit-table-banded-rows">
            Banded Rows
          </label>
          <label class="checkbox">
            <input type="checkbox" class="primary" name="edit-table-banded-columns" id="edit-table-banded-columns">
            Banded Columns
          </label>
          <label class="checkbox">
            <input type="checkbox" class="primary" name="edit-table-include-caption" id="edit-table-include-caption">
            Include Caption
          </label>
        </fieldset>
        <fieldset class="mt-2">
          <legend class="body1 bold">Align:</legend>
          <div class="flex-row justify-between align-center w-100">
            <label class="radio" style="width: auto;">
              <input type="radio" name="lexical-edit-table-align" value="left" class="secondary">
              Left
            </label>
            <label class="radio" style="width: auto;">
              <input type="radio" name="lexical-edit-table-align" value="center" class="secondary" checked>
              Center
            </label>
            <label class="radio" style="width: auto;">
              <input type="radio" name="lexical-edit-table-align" value="right" class="secondary">
              Right
            </label>
          </div>
          
        </fieldset>
        <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
          <label for="edit-table-new-caption">New Table Caption:</label>
          <div class="text-input block medium">
              <input 
              type="text" 
              autocomplete="off" 
              name="edit-table-new-caption" 
              id="edit-table-new-caption" 
              class="medium icon-before mt-1" 
              placeholder="Enter the caption (title) for the table..." 
              maxlength="100"
              minlength="1" 
              spellcheck="true" 
              autocapitalize="off"
              >
              <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
          </div>
        </div>

        <div class="flex-row align-center justify-between mt-3">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" class="filled success medium" aria-label="Submit Form">SUBMIT</button>
        </div>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var UPLOAD_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="lex-upload-file-dialog" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture style="min-height: 350px !important; height: auto!important; max-height: 95vh!important;">
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Upload Files</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <div class="tabs mt-2">
        <ul class="tabs" role="tablist">
          <li role="presentation">
            <button id="lexical-file-tab-btn" class="tab-button secondary" role="tab" type="button" aria-selected="true" data-tab="0" tabindex="-1">Lexical</button>
          </li>
          <li role="presentation">
            <button id="markdown-file-tab-btn" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="1" tabindex="-1">Markdown</button>
          </li>
          <li role="presentation">
            <button id="jupyter-notebook-file-tab-btn" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="2" tabindex="-1">Jupyter Notebook</button>
          </li>
          <li role="presentation">
            <button id="tex-file-tab-btn" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="3" tabindex="-1">TeX
            </button>
          </li>
          <li role="presentation">
            <button id="ai-file-tab-btn" class="tab-button t-secondary" role="tab" type="button" aria-selected="false" data-tab="4" tabindex="-1">AI Chat</button>
          </li>
        </ul>
      </div>
      <div class="tab-panels">
        <div aria-labelledby="lexical-file-tab-btn" role="tabpanel" tabindex="0">
          <p class="body1 mt-1">
            Upload a .lexical file. If the file type matches the type of the current editor, then a preview will be shown below the file input. 
          </p>
          <form id="lexical-state-upload">
            <input hidden type="text" id="current-lexical-editor-upload">
            <label for="upload-lex-file-input" class="bold mt-2">Upload Lexical File:</label>
            <input type="file" id="upload-lex-file-input" accept=".lexical" name="upload-lex-file-input" class="mt-1 info">
            <output class="block mt-2" id="upload-lex-file-input-output">  
              
            </output>
            <div class="flex-row justify-between w-100 mt-4">
              <input role="button" value="RESET" type="reset" aria-label="Reset Form"></input>
    
              <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
              </button>
            </div>
          </form>
        </div>
        <div aria-labelledby="markdown-file-tab-btn" role="tabpanel" tabindex="0" hidden>
          <p class="body1 mt-1">
            Upload a markdown file, and it will converted to an appropriate format so that it can be inserted into the editor.
          </p>
          <form id="markdown-file-upload">
            <input hidden type="text" id="markdown-file-upload">
            <label for="upload-md-file-input" class="bold mt-2">Upload Markdown File:</label>
            <input type="file" id="upload-md-file-input" accept=".md" name="upload-md-file-input" class="mt-1 secondary">
            <output class="block mt-2" id="upload-md-file-input-output">  
            </output>
            <div class="flex-row justify-between w-100 mt-4">
              <input role="button" value="RESET" type="reset" aria-label="Reset Form"></input>
    
              <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
              </button>
            </div>
          </form>
          
        </div>
        <div aria-labelledby="jupyter-notebook-file-tab-btn" role="tabpanel" tabindex="0" hidden>
          <p class="body1 mt-1">
            Upload a Jupyter Notebook, and it will converted to an appropriate format so that it can be inserted into the editor.
          </p>
          <form id="notebook-file-upload">
            <input hidden type="text" id="notebook-file-upload">
            <label for="upload-ipynb-file-input" class="bold mt-2">Upload Jupyter Notebook:</label>
            <input type="file" id="upload-ipynb-file-input" accept=".ipynb" name="upload-ipynb-file-input" class="mt-1 primary">
            <output class="block mt-2" id="upload-ipynb-file-input-output">  
            </output>
            <div class="flex-row justify-between w-100 mt-4">
              <input role="button" value="RESET" type="reset" aria-label="Reset Form"></input>
    
              <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
              </button>
            </div>
          </form>
        </div>
        <div aria-labelledby="tex-file-tab-btn" role="tabpanel" tabindex="0" hidden>
          <p class="body1 mt-1">
            Upload a .tex file, and it will be converted to an appropriate format so that it can be inserted into the editor.  
          </p>
          <form id="tex-file-upload">
            <input hidden type="text" id="tex-file-upload">
            <label for="upload-tex-file-input" class="bold mt-2">Upload TeX File:</label>
            <input type="file" id="upload-tex-file-input" accept=".zip" name="upload-tex-file-input" class="mt-1 warning">
            <output class="block mt-2" id="upload-tex-file-input-output">                
            </output>
            <div class="flex-row justify-between w-100 mt-4">
              <input role="button" value="RESET" type="reset" aria-label="Reset Form"></input>
    
              <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
              </button>
            </div>
          </form>
        </div>
        <div aria-labelledby="ai-file-tab-btn" role="tabpanel" tabindex="0" hidden>
          <p>
            Search for an AI chat by name, select the chat to insert into the editor, and submit the form to insert the chat into the rich text editor.
          </p>
          <form id="insert-ai-chat-rte">
            <div class="input-group block w-100 mt-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
              <label for="search-ai-chat-box">Search AI Chat:</label>
              <div class="mt-1 text-input block medium">
                <input 
                type="search" 
                class="icon-after" 
                name="search-ai-chat-box" 
                id="search-ai-chat-box" 
                placeholder="Enter the name of the AI chat..." 
                hx-trigger="input changed delay:200ms, search"
                hx-target="#search-ai-chat-box-output"
                hx-swap="innerHTML"
                hx-indicator="#sea-ai-chat-ind"
                hx-get="/ai-chat/search"
                >
                <svg class="icon-after" focusable="false" inert viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z">
                  </path>
                </svg>
              </div>
            </div>
            <div class="flex-row justify-center t-primary htmx-indicator" role="progressbar" aria-busy="false" aria-label="Searching AI Chat..." id="sea-ai-chat-ind">
              <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
            <div id="search-ai-chat-box-output" class="mt-2 block" style="max-height: 400px; overflow-y: auto;">

            </div>
            <div class="flex-row justify-between w-100 mt-4">
              <input role="button" value="RESET" type="reset" aria-label="Reset Form"></input>
    
              <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>

      
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
export const GET_BACKGROUND_COLOR_DIALOG = (background:string) => `<div style="display: none;" hidden class="dialog-wrapper" id="image-bg-color-dialog" data-close-backdrop data-esc>
  <div class="dialog medium" data-click-capture style="min-height: 15rem;">
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Edit Image</p>
        
      
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form id="image-bg-color-form" class="mt-2">
        <label class="body2" for="image-bg-color-lex">Background Color:</label>
        <div class="flex-row justify-begin align-center gap-2">
          <input type="color" data-coloris name="image-bg-color-lex" id="image-bg-color-lex" value="${background}" style="margin-top: 2px;">
          <span class="body2">${background}/span>
        </div>
        <label class="checkbox mt-2">
        <input type="checkbox" class="info" name="image-bg-color-lex-transparent" id="image-bg-color-lex-transparent">
        Transparent
        </label>
        <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="true">
          <label for="img-short-description">Short Image Description:</label>
          <div class="text-input block medium">
              <input 
              type="text"
              name="img-short-description" 
              id="img-short-description" 
              class="medium icon-before mt-1" 
              maxlength="100"
              spellcheck="true" 
              autocapitalize="off"
              placeholder="Enter a Short Description of the Image"
              >
              <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Title"><path d="M5 4v3h5.5v12h3V7H19V4z"></path></svg>
          </div>
        </div>
        <div class="input-group block mt-2" data-hover="false" data-focus="false" data-error="false" data-blurred="false"> 
          <label for="img-long-description">Long Image Description:</label>
          <div class="mt-1 text-input block medium disabled">
              <textarea 
              name="img-long-description" 
              id="img-long-description" 
              placeholder="Enter a longer description of the image..." 
              rows="5" 
              maxlength="200" 
              spellcheck="true"
              autocomplete="off"
              autocapitalize="off"
              ></textarea>
          </div>
        </div>

        <div class="flex-row justify-between mt-3">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" aria-label="Submit" class="success filled icon-text medium">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </div>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var COLUMN_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="column-layout-lexical" data-close-backdrop data-esc>
  <div class="dialog large" style="min-height: 300px!important;" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Insert Columns Layout</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form  class="mt-2">
        <div class="body1 bold" id="col-lex-dropdown-label">Column Type:</div>
        <div class="mt-1 flex-row justify-center">
          <div class="select">
            <button type="button" role="combobox" aria-haspopup="listbox" aria-controls="col-lex-dropdown" aria-labelledby="col-lex-dropdown-label" class="select" aria-label="SELECT ARIA_LABEL" data-popover data-pelem="#col-lex-dropdown" data-click aria-expanded="false">
              <span class="body1">2 columns (equal width)</span>
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
            </button>
            <div tabindex="0" id="col-lex-dropdown" role="listbox" class="select-menu o-xs" data-placement="bottom">
              <input type="text" hidden value="2-1" name="ins-col-lex-input" id="ins-col-lex-input">
              <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="2-1">
                2 columns (equal width)
              </button>
              <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="2-2">
                2 columns (25% - 75%)
              </button>
              <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="3-1">
                3 columns (equal width)
              </button>
              <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="3-2">
                3 columns (25% - 50% - 25%)
              </button>
              <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="4">
                4 columns (equal width)
              </button>
            </div>
          </div>
        </div>
        <dib class="mt-2 flex-row justify-end align-center">
          <button type="submit" aria-label="Submit" class="success filled icon-text medium">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            SUBMIT
          </button>
        </dib>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var CODE_LANGUAGE_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="coding-lang-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Select Code Language</p>
      
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form>
        <fieldset class="mt-1">
          <legend class="h6 bold"> Select Coding Language</legend>
          <div class="flex-row align-center wrap" style="gap: 12px 6px;">
            <label class="radio">
              <input type="radio" name="coding_language" value="abap" class="primary">
              abap
              <!-- <span class="flex-row align-center gap-2">
                <span class="fw-regular">
                  abap
                </span>
                <img src="https://image.storething.org/frankmbrown/3fe2c2aa-0f3c-4f9e-8e13-477f20db58ab.png" style="background-color: white; border-radius: 50%;" class="no-click" alt="abap programming language" style="width:30px;height:30px;" width="30" height="30" />
              </span> -->
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="actionscript" class="info">
              actionscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ada" class="warning">
              ada
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="apacheconf" class="info">
              apacheconf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="arduino" class="secondary">
              arduino
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="arm-asm" class="warning">
              arm-asm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="armasm" class="success">
              armasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="asm6502" class="info">
              asm6502
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="aspnet" class="success">
              aspnet
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="awk" class="primary">
              awk
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="bash" class="secondary">
              bash
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="basic" class="info">
              basic
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="batch" class="warning">
              batch
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="c" class="warning">
              c
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cil" class="secondary">
              cil
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cilk" class="info">
              cilk
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cilk-c" class="warning">
              cilk-c
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cilk-cpp" class="success">
              cilk-cpp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="clike" class="secondary">
              clike
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="clojure" class="info">
              clojure
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cmake" class="warning">
              cmake
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cobol" class="success">
              cobol
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="coffeescript" class="primary">
              coffeescript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cpp" class="primary">
              cpp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="csharp" class="warning">
              csharp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="css" class="primary">
              css
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="csv" class="info">
              csv
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cue" class="warning">
              cue
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="cypher" class="success">
              cypher
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="d" class="error">
              d
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dart" class="primary">
              dart
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dataweave" class="secondary">
              dataweave
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dax" class="info">
              dax
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dhall" class="warning">
              dhall
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="diff" class="success">
              diff
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="django" class="error">
              django
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dns-zone" class="primary">
              dns-zone
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dns-zone-file" class="secondary">
              dns-zone-file
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="docker" class="info">
              docker
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dockerfile" class="warning">
              dockerfile
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dot" class="success">
              dot
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="dotnet" class="error">
              dotnet
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ebnf" class="primary">
              ebnf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="editorconfig" class="secondary">
              editorconfig
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="eiffel" class="info">
              eiffel
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ejs" class="warning">
              ejs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="elisp" class="success">
              elisp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="elixir" class="error">
              elixir
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="elm" class="primary">
              elm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="emacs" class="secondary">
              emacs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="emacs-lisp" class="info">
              emacs-lisp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="erb" class="warning">
              erb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="erlang" class="success">
              erlang
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="eta" class="error">
              eta
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="etlua" class="primary">
              etlua
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="excel-formula" class="secondary">
              excel-formula
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="factor" class="info">
              factor
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="false" class="warning">
              false
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="firestore-security-rules" class="success">
              firestore-security-rules
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="flow" class="error">
              flow
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="fortran" class="primary">
              fortran
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="fsharp" class="secondary">
              fsharp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ftl" class="info">
              ftl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="g4" class="warning">
              g4
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gamemakerlanguage" class="success">
              gamemakerlanguage
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gap" class="error">
              gap
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gawk" class="primary">
              gawk
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gcode" class="secondary">
              gcode
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gdscript" class="info">
              gdscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gedcom" class="warning">
              gedcom
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gettext" class="success">
              gettext
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gherkin" class="error">
              gherkin
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="git" class="primary">
              git
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gitignore" class="secondary">
              gitignore
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="glsl" class="info">
              glsl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gml" class="warning">
              gml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gn" class="success">
              gn
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gni" class="error">
              gni
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="go" class="primary">
              go
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="go-mod" class="secondary">
              go-mod
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="go-module" class="info">
              go-module
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gradle" class="warning">
              gradle
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="graphql" class="success">
              graphql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="groovy" class="error">
              groovy
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="gv" class="primary">
              gv
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="haml" class="secondary">
              haml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="handlebars" class="info">
              handlebars
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="haskell" class="warning">
              haskell
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="haxe" class="success">
              haxe
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hbs" class="error">
              hbs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hcl" class="primary">
              hcl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hgignore" class="secondary">
              hgignore
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hlsl" class="info">
              hlsl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hoon" class="warning">
              hoon
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hpkp" class="success">
              hpkp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hs" class="error">
              hs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="hsts" class="primary">
              hsts
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="html" class="secondary">
              html
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="http" class="info">
              http
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ichigojam" class="warning">
              ichigojam
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="icon" class="success">
              icon
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="icu-message-format" class="error">
              icu-message-format
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="idr" class="primary">
              idr
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="idris" class="secondary">
              idris
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="iecst" class="info">
              iecst
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ignore" class="warning">
              ignore
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="inform7" class="success">
              inform7
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ini" class="error">
              ini
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ino" class="primary">
              ino
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="io" class="secondary">
              io
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="j" class="info">
              j
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="java" class="warning">
              java
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="javadoc" class="success">
              javadoc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="javadoclike" class="error">
              javadoclike
            </label>
            <label class="radio">
              <input type="radio" checked name="coding_language" value="javascript" class="primary">
              javascript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="javastacktrace" class="secondary">
              javastacktrace
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jexl" class="info">
              jexl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jinja2" class="warning">
              jinja2
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jolie" class="success">
              jolie
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jq" class="error">
              jq
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="js" class="primary">
              js
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="js-extras" class="secondary">
              js-extras
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="js-templates" class="info">
              js-templates
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jsdoc" class="warning">
              jsdoc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="json" class="success">
              json
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="json5" class="error">
              json5
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jsonp" class="primary">
              jsonp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jsstacktrace" class="secondary">
              jsstacktrace
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="jsx" class="info">
              jsx
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="julia" class="warning">
              julia
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="keepalived" class="success">
              keepalived
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="keyman" class="error">
              keyman
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kotlin" class="primary">
              kotlin
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kt" class="secondary">
              kt
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kts" class="info">
              kts
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kum" class="warning">
              kum
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kumir" class="success">
              kumir
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="kusto" class="error">
              kusto
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="latex" class="primary">
              latex
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="latte" class="secondary">
              latte
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ld" class="info">
              ld
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="less" class="warning">
              less
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="lilypond" class="success">
              lilypond
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="linker-script" class="error">
              linker-script
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="liquid" class="primary">
              liquid
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="lisp" class="secondary">
              lisp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="livescript" class="info">
              livescript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="llvm" class="warning">
              llvm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="log" class="success">
              log
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="lolcode" class="error">
              lolcode
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="lua" class="primary">
              lua
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ly" class="secondary">
              ly
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="magma" class="info">
              magma
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="makefile" class="warning">
              makefile
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="markdown" class="success">
              markdown
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="markup" class="error">
              markup
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="markup-templating" class="primary">
              markup-templating
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mata" class="secondary">
              mata
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mathematica" class="info">
              mathematica
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mathml" class="warning">
              mathml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="matlab" class="success">
              matlab
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="maxscript" class="error">
              maxscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="md" class="primary">
              md
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mel" class="secondary">
              mel
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mermaid" class="info">
              mermaid
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="metafont" class="warning">
              metafont
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mizar" class="success">
              mizar
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mongodb" class="error">
              mongodb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="monkey" class="primary">
              monkey
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="moon" class="secondary">
              moon
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="moonscript" class="info">
              moonscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mscript" class="warning">
              mscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="mustache" class="success">
              mustache
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="n1ql" class="error">
              n1ql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="n4js" class="primary">
              n4js
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="n4jsd" class="secondary">
              n4jsd
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nand2tetris-hdl" class="info">
              nand2tetris-hdl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nani" class="warning">
              nani
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="naniscript" class="success">
              naniscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nasm" class="error">
              nasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nb" class="primary">
              nb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="neon" class="secondary">
              neon
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nevod" class="info">
              nevod
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nginx" class="warning">
              nginx
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nim" class="success">
              nim
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nix" class="error">
              nix
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="npmignore" class="primary">
              npmignore
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="nsis" class="secondary">
              nsis
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="objc" class="info">
              objc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="objectivec" class="warning">
              objectivec
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="objectpascal" class="success">
              objectpascal
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ocaml" class="error">
              ocaml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="odin" class="primary">
              odin
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="opencl" class="secondary">
              opencl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="openqasm" class="info">
              openqasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="oscript" class="warning">
              oscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="oz" class="success">
              oz
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="parigp" class="error">
              parigp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="parser" class="primary">
              parser
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pascal" class="secondary">
              pascal
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pascaligo" class="info">
              pascaligo
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pbfasm" class="warning">
              pbfasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pcaxis" class="success">
              pcaxis
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pcode" class="error">
              pcode
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="peoplecode" class="primary">
              peoplecode
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="perl" class="secondary">
              perl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="php" class="info">
              php
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="php-extras" class="warning">
              php-extras
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="phpdoc" class="success">
              phpdoc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="plant-uml" class="error">
              plant-uml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="plantuml" class="primary">
              plantuml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="plsql" class="secondary">
              plsql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="po" class="info">
              po
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="powerquery" class="warning">
              powerquery
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="powershell" class="success">
              powershell
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pq" class="error">
              pq
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="processing" class="primary">
              processing
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="prolog" class="secondary">
              prolog
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="promql" class="info">
              promql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="properties" class="warning">
              properties
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="protobuf" class="success">
              protobuf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="psl" class="error">
              psl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pug" class="primary">
              pug
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="puppet" class="secondary">
              puppet
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="pure" class="info">
              pure
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="purebasic" class="warning">
              purebasic
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="purescript" class="success">
              purescript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="purs" class="error">
              purs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="px" class="primary">
              px
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="py" class="secondary">
              py
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="python" class="info">
              python
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="q" class="warning">
              q
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="qasm" class="success">
              qasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="qml" class="error">
              qml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="qore" class="primary">
              qore
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="qs" class="secondary">
              qs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="qsharp" class="info">
              qsharp
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="r" class="warning">
              r
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="racket" class="success">
              racket
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="razor" class="error">
              razor
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rb" class="primary">
              rb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rbnf" class="secondary">
              rbnf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="reason" class="info">
              reason
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="regex" class="warning">
              regex
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rego" class="success">
              rego
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="renpy" class="error">
              renpy
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="res" class="primary">
              res
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rescript" class="secondary">
              rescript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rest" class="info">
              rest
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rip" class="warning">
              rip
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rkt" class="success">
              rkt
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="roboconf" class="error">
              roboconf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="robot" class="primary">
              robot
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="robotframework" class="secondary">
              robotframework
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rpy" class="info">
              rpy
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rq" class="warning">
              rq
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rss" class="success">
              rss
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ruby" class="error">
              ruby
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="rust" class="primary">
              rust
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sas" class="secondary">
              sas
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sass" class="info">
              sass
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="scala" class="warning">
              scala
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="scheme" class="success">
              scheme
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sclang" class="error">
              sclang
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="scss" class="primary">
              scss
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sh" class="secondary">
              sh
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sh-session" class="info">
              sh-session
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="shell" class="warning">
              shell
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="shell-session" class="success">
              shell-session
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="shellsession" class="error">
              shellsession
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="shortcode" class="primary">
              shortcode
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sln" class="secondary">
              sln
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="smali" class="info">
              smali
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="smalltalk" class="warning">
              smalltalk
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="smarty" class="success">
              smarty
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sml" class="error">
              sml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="smlnj" class="primary">
              smlnj
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sol" class="secondary">
              sol
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="solidity" class="info">
              solidity
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="solution-file" class="warning">
              solution-file
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="soy" class="success">
              soy
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sparql" class="error">
              sparql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="splunk-spl" class="primary">
              splunk-spl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sqf" class="secondary">
              sqf
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="sql" class="info">
              sql
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="squirrel" class="warning">
              squirrel
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ssml" class="success">
              ssml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="stan" class="error">
              stan
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="stata" class="primary">
              stata
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="stylus" class="secondary">
              stylus
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="supercollider" class="info">
              supercollider
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="svg" class="warning">
              svg
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="swift" class="success">
              swift
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="systemd" class="error">
              systemd
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="t4" class="primary">
              t4
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="t4-cs" class="secondary">
              t4-cs
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="t4-templating" class="info">
              t4-templating
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="t4-vb" class="warning">
              t4-vb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tap" class="success">
              tap
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tcl" class="error">
              tcl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tex" class="primary">
              tex
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="textile" class="secondary">
              textile
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="toml" class="info">
              toml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tremor" class="warning">
              tremor
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="trickle" class="success">
              trickle
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="trig" class="error">
              trig
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="troy" class="primary">
              troy
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="ts" class="secondary">
              ts
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tsconfig" class="info">
              tsconfig
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tsx" class="warning">
              tsx
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="tt2" class="success">
              tt2
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="turtle" class="error">
              turtle
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="twig" class="primary">
              twig
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="typescript" class="secondary">
              typescript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="typoscript" class="info">
              typoscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="uc" class="warning">
              uc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="unrealscript" class="success">
              unrealscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="uorazor" class="error">
              uorazor
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="uri" class="primary">
              uri
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="url" class="secondary">
              url
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="uscript" class="info">
              uscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="v" class="warning">
              v
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vala" class="success">
              vala
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vb" class="error">
              vb
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vba" class="primary">
              vba
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vbnet" class="secondary">
              vbnet
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="velocity" class="info">
              velocity
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="verilog" class="warning">
              verilog
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vhdl" class="success">
              vhdl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="vim" class="error">
              vim
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="visual-basic" class="primary">
              visual-basic
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="warpscript" class="secondary">
              warpscript
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wasm" class="info">
              wasm
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="web-idl" class="warning">
              web-idl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="webidl" class="success">
              webidl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="webmanifest" class="error">
              webmanifest
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wgsl" class="primary">
              wgsl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wiki" class="secondary">
              wiki
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wl" class="info">
              wl
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wolfram" class="warning">
              wolfram
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="wren" class="success">
              wren
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xeora" class="error">
              xeora
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xeoracube" class="primary">
              xeoracube
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xls" class="secondary">
              xls
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xlsx" class="info">
              xlsx
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xml" class="warning">
              xml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xml-doc" class="success">
              xml-doc
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xojo" class="error">
              xojo
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="xquery" class="primary">
              xquery
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="yaml" class="secondary">
              yaml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="yang" class="info">
              yang
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="yml" class="warning">
              yml
            </label>
            <label class="radio">
              <input type="radio" name="coding_language" value="zig" class="success">
              zig
            </label>
          </div>

        </fieldset>

        <div class="flex-row mt-2 justify-between">
          <input role="button" value="RESET"  type="reset" aria-label="Reset Form"></input>
          <button type="submit" aria-label="Submit" class="success filled icon-text medium">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              SUBMIT
          </button>
        </div>
      </form>
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;
var PREVIOUS_VERSION_DIALOG = `<div style="display: none;" hidden class="dialog-wrapper" id="insert-previous-lexical" data-close-backdrop data-esc>
  <div class="dialog large" data-click-capture>
    <div class="dialog-header">
      <p class="grow-1 flex-row h3 bold">Upload Previous Version of Editor State</p>
      <button class="icon medium close-dialog" type="button" aria-label="Close Dialog">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
      </button>
    </div>
    <div class="dialog-body">
      <form>
        <output class="block mt-2" id="upload-prev-lexical-state-out"></output>
        <div class="flex-row justify-between align-center mt-3">
            <button type="submit" aria-label="Submit" class="success filled icon-text medium">
                <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                SUBMIT
            </button>
          </div>
        </form>
        <div class="mt-2 flex-row justify-center t-primary htmx-indicator" role="progressbar" aria-busy="false" aria-label="" id="ind_fab069f0-3b63-4e8a-971e-c6f9519158ba">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
      
    </div>
    <div class="dialog-footer" role="toolbar">
      <button class="filled error small close-dialog" type="button" aria-label="Close Dialog">
        CLOSE DIALOG
      </button>
    </div>
  </div>
</div>`;


declare global {
  interface Window {
    myCustomProperty: string;
    htmx:any|undefined;
    getCodeMirrorEditorText: any|undefined,
    socket: Socket|undefined,
    commentObserver: IntersectionObserver|undefined,
    annotationObserver: IntersectionObserver|undefined,
    getEditorState: any|undefined,
    setEditorState: any|undefined,
    clearEditor: any|undefined,
    getCsrfToken: any|undefined,
    removeCodeMirrorEditor: any | undefined,
    closeRecordImageDialog: any|undefined,
    closeRecordAudioDialog: any|undefined,
    closeRecordVideoDialog: any|undefined,
    setGoogleMaps: any|undefined,
    removeGoogleMaps: any|undefined,
    editGeographyStyles: any|undefined,
    codeEditorsThemeChange: any|undefined,
    handlePageChangeMediaInputs: any|undefined,
    onLexicalThemeChange: any|undefined,
    unloadLexicalEditorsBeforeSwap: any|undefined,
    unloadCodeEditorsBeforeSwap: any|undefined,
    tableOfContentsObserver: IntersectionObserver|undefined,
    getCommentImplementation: any|undefined,
    editorToChatMessage: any|undefined,
    updateLexicalInstanceWithHtml: any|undefined,
    markdownToHTMLAi: ((s:string) => Promise<string>)|undefined,
    convertNodesToMarkdownString: (editorState: any) => Promise<string>
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
export type VALID_CURRENT_MODES = "circle" | "ellipse" | "line" | "path" | "polygon" | "polyline" | "text" | "manipulate" | "rectangle";
export interface new_element_added_CED {
  type: VALID_CURRENT_MODES, 
  shape:  any|Text
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
export interface OPEN_LEXICAL_DIALOG_CED {
  dialogID: string
}
export interface CLOSE_LEXICAL_DIALOG_CED {
  dialog: HTMLDivElement
}
export interface OPEN_LEXICAL_DIALOG_FINAL_CED {
  el: HTMLDivElement
}
export interface OPEN_DIALOG_FINAL_CED {
  dialog: HTMLDivElement
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

export function editorCanChangeSize(editor:LexicalEditor) {
  const wrapper = editor._rootElement ? editor._rootElement.closest('div.lexical-wrapper') : false;
  if (wrapper) {
    const font_size_input = wrapper.querySelector<HTMLInputElement>('input[data-lexical-font-size-input]');
    return Boolean(font_size_input); 
  }
}
/**
 * Creating thyis function so that we can run stuff on NodeJS
 * @param node 
 * @returns 
 */
export function isHTMLElementCustom(node:any):node is HTMLElement {
  return Boolean(typeof HTMLElement!=='undefined' || node instanceof HTMLElement);
}

export function getDeviceType() {
  const userAgent = window.navigator.userAgent;
  const mobileOrTablet = isMobileOrTablet(userAgent);
  if (!!!mobileOrTablet) return 'desktop';
  const mobile = isMobileDevice(userAgent);
  if (mobile) return 'mobile';
  else return 'tablet'; 
}

/**
 * 
 * @param str The result of req.get('user-agent')
 * @returns Boolean - true if device is phone, false otherwise
 */
export function isMobileDevice(str: string|undefined):boolean {
  if(!!!str) return false;
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(str);
  return check;
};
/**
* 
* @param str The result of req.get('user-agent')
* @returns Boolean - true if device is phone or tablet, false otherwise
*/
function isMobileOrTablet(str: string|undefined):boolean {
  if(!!!str) return false;
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(str);
  return check;
};
var mobileDevice = false;
var mobileOrTablet = false;
if (typeof window !== 'undefined') {
  mobileDevice = isMobileDevice(window.navigator.userAgent);
  mobileOrTablet = isMobileOrTablet(window.navigator.userAgent);
}


var IS_PHONE = Boolean(mobileDevice);
var IS_TABLET = Boolean(!!mobileOrTablet && !!!IS_PHONE);
var IS_DESKTOP = Boolean(!!!IS_PHONE && !!!IS_TABLET);
export {
  IS_PHONE,
  IS_TABLET,
  IS_DESKTOP
};

/**
 * Command that is called when the current editor changes
 */
export const SET_EDITOR_COMMAND:LexicalCommand<string> = createCommand('SET_EDITOR_COMMAND');

/**
 * @type {{[idOfWrapperDiv: string]: LexicalEditor}}
 */
const EDITOR_INSTANCES:{[idOfWrapperDiv: string]: LexicalEditor} = {};
/**
 * 
 * @returns {string|null} The current editor (the last editor that was focused) id or null of the input could not be found
 */
export function getCurrentEditorID() {
  const input = document.getElementById('LEXICAL_EDITOR_CURRENT') as HTMLInputElement;
  if (input&&input.value) return input.value;
  else return null;
}
/**
 * @param {string} id The id of the `div.lexical-wrapper`
 * @returns {boolean} **true** = an editor with that id exists in the EDITOR_INSTANCES object, **false** = an editor with that id does not exist in the EDITOR_INSTANCES object
 */
export function setCurrentEditor(id: string|'') {
  const input = document.getElementById('LEXICAL_EDITOR_CURRENT') as HTMLInputElement;
  if (input) {
    const oldValue = structuredClone(input.value);
    const oldFocusedEditor = document.getElementById(oldValue);
    if (oldFocusedEditor) oldFocusedEditor.setAttribute('data-current','false');
    if (id==='') {
      input.value=id;
      return true;
    }
    if (id&&EDITOR_INSTANCES[id]) {
      input.value=id;
      const newFocusedEditor = document.getElementById(id);
      if (newFocusedEditor) newFocusedEditor.setAttribute('data-current','true');
      return true;
    } else {
      console.error('Editor with id '.concat(id).concat(' does not exist.'));
      return false;
    }
  } else {
    console.error("Unable to find LEXICAL_EDITOR_CURRENT");
  }
}
/**
 * @returns {LexicalEditor|null}
 */
export function getCurrentEditor() {
  const id = getCurrentEditorID();
  if (typeof id==="string"&&EDITOR_INSTANCES[id]) return EDITOR_INSTANCES[id];
  else return null;
}
/**
 * When an editor is focused, set the value of the input#LEXICAL_EDITOR_CURRENT
 * to be 
 * @this {HTMLDivElement} div[contenteditable="true"] 
 * @param {Event} e Focus Event 
 */
export function handleEditorFocus(this:HTMLDivElement,e:Event) {
  const wrapper = this.classList.contains('lexical-wrapper') ? this : this.closest<HTMLDivElement>('div.lexical-wrapper');
  if (!!!wrapper) return;
  const id =  wrapper.id;
  if (typeof id==="string"&&getCurrentEditorID()!==id) {
    const res = setCurrentEditor(id);
    if (res) EDITOR_INSTANCES[id].dispatchCommand(SET_EDITOR_COMMAND,id);
  }
}
export function getEditorInstances() {
  return EDITOR_INSTANCES
}
export function setEditorInstance(id:string,editor:LexicalEditor) {
  EDITOR_INSTANCES[id] = editor;
}



export const SCROLL_INTO_VIEW_OPTIONS = { behavior: 'smooth', block: 'start', inline: 'center'} as const;
export function closeDialog(dialog:HTMLDivElement) {
  document.dispatchEvent(new CustomEvent("CLOSE_DIALOG",{ detail: { dialog }}))
}
export function openDialog(dialog: HTMLDivElement){
  document.dispatchEvent(new CustomEvent("OPEN_DIALOG",{ detail: { dialog }}))
}
/**
 * Is this device an IOS device
 * @returns 
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


export function openLoadingDialog(text:string|null) {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog) {
    const indicator = dialog.querySelector<HTMLDivElement>('div[data-indicator]');
    if (indicator) indicator.setAttribute('aria-busy','true');
    const textEl = dialog.querySelector<HTMLParagraphElement>('p[data-text]');
    if (textEl&&text) textEl.innerText = text;
    openDialog(dialog);
  }
}
export function closeLoadingDialog() {
  const dialog = document.getElementById('loading-dialog') as HTMLDivElement|null;
  if (dialog) {
    closeDialog(dialog);
  }
}

/* ------------------------------------------------------------------------------------------- */
/**
 * 
 * @param {HTMLButtonElement} button 
 */
export function disableButton(button:HTMLButtonElement) {
  if (button&&button.setAttribute) button.setAttribute('disabled','');
}
/**
 * 
 * @param {HTMLButtonElement} button 
*/
export function removeDisabledButton(button:HTMLButtonElement){
  if (button&&button.removeAttribute) button.removeAttribute('disabled');
}
/**
 * 
 * @param {HTMLButtonElement} button 
*/
export function selectButton(button:HTMLButtonElement) {
  if (button&&button.classList&&button.classList.add) button.classList.add('selected');
}
/**
 * 
 * @param {HTMLButtonElement} button 
*/
export function unselectButton(button:HTMLButtonElement){
  if (button&&button.classList&&button.classList.remove) button.classList.remove('selected');
}
/**
 * 
 * @param {HTMLButtonElement} button Button to set disabled and selected state
 * @param {true|false} disable true = button should be disabled
 * @param {true|false} select true = button should be selected
 */
export function disableAndSelect(button:HTMLElement,disable:boolean,select:boolean){
  if (disable) disableButton((button as HTMLButtonElement));
  else removeDisabledButton((button as HTMLButtonElement));
 if (select) selectButton((button as HTMLButtonElement));
 else unselectButton((button as HTMLButtonElement)); 
}
/**
 * Function to query the document or lexical wrapper to get a button element
 * @param {document|HTMLDivElement} wrapper should be either 'document' or the lexical wrapper 
 * @param {string} dispatch 
 * @param {string|undefined} payload 
 */
export function q(wrapper:HTMLElement,dispatch:string,payload:string|undefined):(HTMLButtonElement|null) {
  var str = 'button[data-dispatch="'.concat(dispatch).concat('"]');
  if(payload) {str = str.concat('[data-payload="').concat(payload).concat('"]');}
  return wrapper.querySelector<HTMLButtonElement>(str);
}
/**
 * Get the current light mode or dark mode
 */
export function getLightModeDarkMode() {
  const html = document.querySelector('html');
  if(html) {
    const mode = html.getAttribute('data-mode');
    if(mode==="light"||mode==="dark") return mode;
    else return "dark";
  } else return 'dark';
}
/**
 * Get the current font family
 * @returns {string}
 */
export function getDefaultFontFamily() {
  const input = document.getElementById('font-family-settings') as HTMLInputElement;
  if(input && input.value) return input.value;
  return 'Anuphan, sans-serif;';
}
/**
 * Get the current background
 * @returns {string}
 */
export function getDefaultBackground(){
  const mode = getLightModeDarkMode();
  const id = 'background-'.concat(mode).concat('-settings-color');
  const input = document.getElementById(id) as HTMLInputElement;
  if(input && input.value && VALID_HEX_REGEX.test(input.value)) return input.value;
  return '#000000';
}
/**
 * Get the current text color
 * @returns {string}
 */
export function getDefaultTextColor(){
  const mode = getLightModeDarkMode();
  const id = 'textColor-'.concat(mode).concat('-settings-color');
  const input = document.getElementById(id) as HTMLInputElement;
  if(input && input.value && VALID_HEX_REGEX.test(input.value)) return input.value;
  else return '#FFFFFF';
}

/**
 * Given a select button, get the next element sibling of the button 
 * 
 * @param {HTMLButtonElement} btn
 * @param {string} val
 */
export function setSelectOptionsStyle(button:HTMLButtonElement,val:string){
  /* @ts-ignore */
  if (button&&button.nextElementSibling) {
    const options = Array.from(button.nextElementSibling.querySelectorAll('button[role="option"]'));
    if (Array.isArray(options)) {
      options.forEach((btn) => {
        if (val===btn.getAttribute('data-val')) btn.setAttribute('aria-selected','true');
        else btn.setAttribute('aria-selected','false');
      })
    }
  }
  
}
/**
 * Set the text of a select button helper function
 * @param {HTMLButtonElement} button
 * @param {string} text
 */
export function setSelectButtonText(button:HTMLButtonElement,text:string){
  if(button&&typeof text==='string') {
    Array.from(button.children)
    .filter(c=>c.nodeName==='SPAN')
    .map((a) => {
      (a as HTMLSpanElement).innerText = text.trim();
    });
  }
}
/**
 * If the radio input has a "value" attribute that is 
 * equal to val, set the radio to checked. Else, set the radio
 * to unchecked.
 * @param {HTMLElement} fieldset
 * @param {string} val 
 */
export function setMarkRadioGroupChecked(fieldset:HTMLFieldSetElement,val:string|any) {
  
  if (fieldset) {
    const inputs = Array.from(fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    inputs.forEach((input) => {
      if (input.getAttribute('value')===val) input.checked = true;
      else if (!!!val && input.getAttribute('value')==='none') input.checked=true;
      else input.checked = false;
    })
  }
}
/**
 * 
 * @param {HTMLButtonElement[]} buttons
 * @param {string|undefined} type 
 */
export function setHeadingNodeButtons(buttons:HTMLButtonElement[],type:string|undefined) {
  if(Array.isArray(buttons)) {
    buttons.forEach((btn)=>{
      if(btn.getAttribute('data-payload')===type) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    })
  }
}
/**
 * Helper function for setting color input
 * Will not do anything if input does not exist
 * @param {HTMLInputElement|any} input
 * @param {string} value
 */
export function setColorInput(input:HTMLInputElement|any,value:string) {
  if (input) input.value = value;
  if (input?.nextElementSibling&&input?.nextElementSibling.nodeName==='SPAN') {
    input.nextElementSibling.innerText = value;
  }
}
/**
 * Helper function for setting the style of a select button on change
 * @param {HTMLInputElement|any} input
 * @param {string} value
 * @param {string} text
 */
export function setSelectInput(input:HTMLInputElement|any,value:string,text:string) {
  if (input) input.value = value;
  if (input&&input?.parentElement &&input?.parentElement?.previousElementSibling&&input?.parentElement?.previousElementSibling?.nodeName==="BUTTON"){
    const button = input.parentElement.previousElementSibling;
    setSelectButtonText(button,text);
    setSelectOptionsStyle(button,value);
  }
}
export function getDOMRangeRect(
  nativeSelection: Selection,
  rootElement: HTMLElement,
): DOMRect {
  const domRange = nativeSelection.getRangeAt(0);
  let rect;
  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild as HTMLElement;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }
  return rect;
}
export function getDOMRangeRectAbsolute(
  nativeSelection: Selection,
  rootElement: HTMLElement,
) {
  const domRange = nativeSelection.getRangeAt(0);
  let rect;
  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild as HTMLElement;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }
  return {
    top: rect.top+window.scrollY,
    left: rect.left,
    right: rect.right,
    height: rect.height
  };
}
export function getEditorButtons(wrapper:HTMLDivElement) {
  return {
    fontButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-font-button]'),
    headingButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-heading-button]'),
    backgroundColorButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-bg-color-button]'),
    backgroundColorInput:wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-color]'),
    backgroundColorTransparent:wrapper.querySelector<HTMLInputElement>('input[data-lexical-background-transparent]'),
    textColorButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-text-color-button]'),
    textColorInput:wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-color]'),
    textColorTransparent:wrapper.querySelector<HTMLInputElement>('input[data-lexical-text-transparent]'),
    markButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-mark-button]'),
    fontWeightButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-font-weight-button]'),
    blockStyleButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-block-style-button]'),
    fontSizeButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-font-size-button]'),
    undoButton:wrapper.querySelector<HTMLButtonElement>('buttom[data-dispatch="UNDO_COMMAND"]'),
    redoButton:wrapper.querySelector<HTMLButtonElement>('buttom[data-dispatch="REDO_COMMAND"]'),
    clearContentButton:wrapper.querySelector<HTMLButtonElement>('buttom[data-dispatch="CLEAR_EDITOR_COMMAND"]'),
    indentContentButton:q(wrapper,'INDENT_CONTENT_COMMAND',undefined),
    outdentContentButton:q(wrapper,'OUTDENT_CONTENT_COMMAND',undefined),
    leftAlignButton:q(wrapper,'FORMAT_ELEMENT_COMMAND','left'),
    centerAlignButton:q(wrapper,'FORMAT_ELEMENT_COMMAND','center'),
    rightAlignButton:q(wrapper,'FORMAT_ELEMENT_COMMAND','right'),
    justifyAlignButton:q(wrapper,'FORMAT_ELEMENT_COMMAND','justify'),
    boldButton:q(wrapper,'FORMAT_TEXT_COMMAND','bold'),
    italicButton:q(wrapper,'FORMAT_TEXT_COMMAND','italic'),
    strikethroughButton:q(wrapper,'FORMAT_TEXT_COMMAND','strikethrough'),
    underlineButton:q(wrapper,'FORMAT_TEXT_COMMAND','underline'),
    kbdButton: q(wrapper,'FORMAT_TEXT_COMMAND','kbd'),
    inlineQuoteButtonToolbar: wrapper.querySelector<HTMLButtonElement>('button.toggle-button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="quote"]'),
    clearFormattingButton:q(wrapper,'CLEAR_TEXT_FORMATTING',undefined),
    subscriptButton:q(wrapper,'FORMAT_TEXT_COMMAND','subscript'),
    superscriptButton:q(wrapper,'FORMAT_TEXT_COMMAND','superscript'),
    imageButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-image-button]'),
    audioButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-audio-button]'),
    videoButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-video-button]'),
    linkButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-link-button]'),
    removeLinkButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-remove-link]'),
    embedMediaButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-embed-media]'),
    embedNews:wrapper.querySelector<HTMLButtonElement>('button[data-embed-news]'),
    embedYoutube:wrapper.querySelector<HTMLButtonElement>('button[data-embed-youtube]'),
    embedX :wrapper.querySelector<HTMLButtonElement>('button[data-embed-x]'),
    embedTikTok:wrapper.querySelector<HTMLButtonElement>('button[data-embed-tiktok]'),
    embedInstagram:wrapper.querySelector<HTMLButtonElement>('button[data-embed-instagram]'),
    embedReddit:wrapper.querySelector<HTMLButtonElement>('button[data-embed-reddit]'),
    quoteButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-insert-quote-button]'),
    blockQuoteButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-quote-button]'), 
    inlineQuoteButton:wrapper.querySelector<HTMLButtonElement>('button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="quote"]'), 
    listButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-list-button]'),
    orderedListButton:q(wrapper,'INSERT_ORDERED_LIST_COMMAND',undefined),
    unorderedListButton:q(wrapper,'INSERT_UNORDERED_LIST_COMMAND',undefined),
    checkListButton:q(wrapper,'INSERT_CHECK_LIST_COMMAND',undefined),
    asideButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-aside-button]'),
    leftAside:q(wrapper,'INSERT_ASIDE_COMMAND','left'),
    rightAside:q(wrapper,'INSERT_ASIDE_COMMAND','right'),
    detailsButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-details-button]'),
    codeButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-insert-code]'),
    codeBlockButton:  q(wrapper,'INSERT_CODE_COMMAND',undefined),
    inlineCodeButton: q(wrapper,'FORMAT_TEXT_COMMAND','code'),
    mathButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-math-button]'),
    tableButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-table-button]'),
    chartButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-chart-button]'),
    horizontalRuleButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-hr-button]'),
    viewButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-hr-button]'),
    downloadLexicalStateButton: wrapper.querySelector<HTMLButtonElement>('button[data-download-state]'),
    uploadLexicalStateButton: wrapper.querySelector<HTMLButtonElement>('button[data-dialog="lex-upload-file-dialog"]'), 
    sectionHeadingButton: wrapper.querySelector<HTMLButtonElement>('button[data-lexical-section-button]'),
    paragraphButton: wrapper.querySelector<HTMLButtonElement>('button[data-insert-paragraph-button]'),
    htmlButton: wrapper.querySelector<HTMLButtonElement>('button[data-custom-html-btn]'), //
    gifButton : wrapper.querySelector<HTMLButtonElement>('button[data-lexical-gif-button]'),
    speechToTextButton : wrapper.querySelector<HTMLButtonElement>('button[data-lexical-speech-to-text]'),
    
    copyContentButton:wrapper.querySelector<HTMLButtonElement>('buttom[data-dispatch="COPY_EDITOR_COMMAND"]'),
    abbreviationButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-abbr-button]'),
    removeAbbreviationButton:wrapper.querySelector<HTMLButtonElement>('button[data-lexical-remove-abbr]'),
    columnLayoutButton : wrapper.querySelector<HTMLButtonElement>('button[data-lexical-column-button]'), 
  };
}

export function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (window.navigator.maxTouchPoints > 0) ||
     /* @ts-ignore */
     (window.navigator.msMaxTouchPoints > 0));
}

export const IS_REAL_BROWSER = Object.getOwnPropertyDescriptor(globalThis, 'window')?.get?.toString().includes('[native code]') ?? false;

export const MAKE_TRANSPARENT:LexicalCommand<{type: "background"|"text", color: string|null}> = createCommand('MAKE_TRANSPARENT');
export const TEXT_COLOR_CHANGE:LexicalCommand<string> = createCommand('TEXT_COLOR_CHANGE');
export const BACKGROUND_COLOR_CHANGE:LexicalCommand<string> = createCommand('BACKGROUND_COLOR_CHANGE');
export const CLEAR_TEXT_FORMATTING:LexicalCommand<void> = createCommand('CLEAR_TEXT_FORMATTING');
export const LAUNCH_TEXT_INSERTION_COMMAND: LexicalCommand<{html: string, rect: { top: number; left: number; right: number; }}> = createCommand('LAUNCH_TEXT_INSERTION_COMMAND');
export const REGISTER_TOOLBAR_LISTENERS:LexicalCommand<void> = createCommand('REGISTER_TOOLBAR_LISTENERS');
export const UPDATE_ON_SET_HTML:LexicalCommand<void> = createCommand('UPDATE_ON_SET_HTML');

/* ---------------------------------------------------------- Max Length Stuff --------------------------------------------------- */

let textEncoderInstance: null | TextEncoder = null;


function textEncoder(): null | TextEncoder {
  if (window.TextEncoder === undefined) {
    return null;
  }

  if (textEncoderInstance === null) {
    textEncoderInstance = new window.TextEncoder();
  }

  return textEncoderInstance;
}


function utf8Length(text: string) {
  const currentTextEncoder = textEncoder();

  if (currentTextEncoder === null) {
    // http://stackoverflow.com/a/5515960/210370
    const m = encodeURIComponent(text).match(/%[89ABab]/g);
    return text.length + (m ? m.length : 0);
  }

  return currentTextEncoder.encode(text).length;
}

function findOffset(
  text: string,
  maxCharacters: number,
  strlen: (input: string) => number,
): number {
  // @ts-ignore This is due to be added in a later version of TS
  const Segmenter = Intl.Segmenter;
  let offsetUtf16 = 0;
  let offset = 0;

  if (typeof Segmenter === 'function') {
    const segmenter = new Segmenter();
    const graphemes = segmenter.segment(text);

    for (const {segment: grapheme} of graphemes) {
      const nextOffset = offset + strlen(grapheme);

      if (nextOffset > maxCharacters) {
        break;
      }

      offset = nextOffset;
      offsetUtf16 += grapheme.length;
    }
  } else {
    const codepoints = Array.from(text);
    const codepointsLength = codepoints.length;

    for (let i = 0; i < codepointsLength; i++) {
      const codepoint = codepoints[i];
      const nextOffset = offset + strlen(codepoint);

      if (nextOffset > maxCharacters) {
        break;
      }

      offset = nextOffset;
      offsetUtf16 += codepoint.length;
    }
  }

  return offsetUtf16;
}
export function $rootTextContent(): string {
  const root = $getRoot();

  return root.getTextContent();
}

function $wrapOverflowedNodes(offset: number): void {
  const dfsNodes = $dfs();
  const dfsNodesLength = dfsNodes.length;
  let accumulatedLength = 0;

  for (let i = 0; i < dfsNodesLength; i += 1) {
    const {node} = dfsNodes[i];

    if ($isOverflowNode(node)) {
      const previousLength = accumulatedLength;
      const nextLength = accumulatedLength + node.getTextContentSize();

      if (nextLength <= offset) {
        const parent = node.getParent();
        const previousSibling = node.getPreviousSibling();
        const nextSibling = node.getNextSibling();
        $unwrapNode(node);
        const selection = $getSelection();

        // Restore selection when the overflow children are removed
        if (
          $isRangeSelection(selection) &&
          (!selection.anchor.getNode().isAttached() ||
            !selection.focus.getNode().isAttached())
        ) {
          if ($isTextNode(previousSibling)) {
            previousSibling.select();
          } else if ($isTextNode(nextSibling)) {
            nextSibling.select();
          } else if (parent !== null) {
            parent.select();
          }
        }
      } else if (previousLength < offset) {
        const descendant = node.getFirstDescendant();
        const descendantLength =
          descendant !== null ? descendant.getTextContentSize() : 0;
        const previousPlusDescendantLength = previousLength + descendantLength;
        // For simple text we can redimension the overflow into a smaller and more accurate
        // container
        const firstDescendantIsSimpleText =
          $isTextNode(descendant) && descendant.isSimpleText();
        const firstDescendantDoesNotOverflow =
          previousPlusDescendantLength <= offset;

        if (firstDescendantIsSimpleText || firstDescendantDoesNotOverflow) {
          $unwrapNode(node);
        }
      }
    } else if ($isLeafNode(node)) {
      const previousAccumulatedLength = accumulatedLength;
      accumulatedLength += node.getTextContentSize();

      if (accumulatedLength > offset && !$isOverflowNode(node.getParent())) {
        const previousSelection = $getSelection();
        let overflowNode;

        // For simple text we can improve the limit accuracy by splitting the TextNode
        // on the split point
        if (
          previousAccumulatedLength < offset &&
          $isTextNode(node) &&
          node.isSimpleText()
        ) {
          const [, overflowedText] = node.splitText(
            offset - previousAccumulatedLength,
          );
          overflowNode = $wrapNode(overflowedText);
        } else {
          overflowNode = $wrapNode(node);
        }

        if (previousSelection !== null) {
          $setSelection(previousSelection);
        }

        mergePrevious(overflowNode);
      }
    }
  }
}

function $wrapNode(node: LexicalNode): OverflowNode {
  const overflowNode = $createOverflowNode();
  node.insertBefore(overflowNode);
  overflowNode.append(node);
  return overflowNode;
}

function $unwrapNode(node: OverflowNode): LexicalNode | null {
  const children = node.getChildren();
  const childrenLength = children.length;

  for (let i = 0; i < childrenLength; i++) {
    node.insertBefore(children[i]);
  }

  node.remove();
  return childrenLength > 0 ? children[childrenLength - 1] : null;
}

export function mergePrevious(overflowNode: OverflowNode): void {
  const previousNode = overflowNode.getPreviousSibling();

  if (!$isOverflowNode(previousNode)) {
    return;
  }

  const firstChild = overflowNode.getFirstChild();
  const previousNodeChildren = previousNode.getChildren();
  const previousNodeChildrenLength = previousNodeChildren.length;

  if (firstChild === null) {
    overflowNode.append(...previousNodeChildren);
  } else {
    for (let i = 0; i < previousNodeChildrenLength; i++) {
      firstChild.insertBefore(previousNodeChildren[i]);
    }
  }

  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor;
    const anchorNode = anchor.getNode();
    const focus = selection.focus;
    const focusNode = anchor.getNode();

    if (anchorNode.is(previousNode)) {
      anchor.set(overflowNode.getKey(), anchor.offset, 'element');
    } else if (anchorNode.is(overflowNode)) {
      anchor.set(
        overflowNode.getKey(),
        previousNodeChildrenLength + anchor.offset,
        'element',
      );
    }

    if (focusNode.is(previousNode)) {
      focus.set(overflowNode.getKey(), focus.offset, 'element');
    } else if (focusNode.is(overflowNode)) {
      focus.set(
        overflowNode.getKey(),
        previousNodeChildrenLength + focus.offset,
        'element',
      );
    }
  }

  previousNode.remove();
}


const TEXT_LENGTH:{[editorNamespace:string]: {lastLength: null|number, text: string}} = {};
const EDITOR_STATE:{[editorNamespace:string]:EditorState}={};

function $addCharCounter(editor:LexicalEditor,{min, max}:{min?:number,max:number},initial:boolean=false) {
  const HAS_MIN = !!!isNaN(min as number);
  var SHOWING_MIN_SPAN = false;
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  const rootElement = editor._rootElement;
  if (wrapper&&rootElement) {
    const domTextLength = rootElement.innerText.length;
    const lastLength = TEXT_LENGTH[editor._config.namespace].lastLength;
    const textLength = initial ? domTextLength : Number(lastLength || 0);

    const id = editor._config.namespace.concat('-char-counter');
    const elementAlreadyExists = document.getElementById(id);
    if (elementAlreadyExists) return;
    const p = document.createElement('p');
    p.style.setProperty('padding-right','8px');
    p.setAttribute('id',id);
    p.classList.add('char-counter');
    
    if(HAS_MIN) {
      const minSpan = document.createElement('span');
      minSpan.classList.add('min-counter','body2');
      const charactersRemaining = Number(min)-textLength;
      minSpan.setAttribute('data-val',String(charactersRemaining));
      if (charactersRemaining>0) {
        minSpan.setAttribute('aria-hidden','false'); 
        SHOWING_MIN_SPAN=true;
      } else {
        minSpan.setAttribute('aria-hidden','true');
      }
      minSpan.innerText = "more characters required";
      p.append(minSpan);
    }
    if (max) {
      const maxSpan = document.createElement('span');
      maxSpan.classList.add('max-counter','body2');
      const charactersLeft = max-textLength;
      maxSpan.setAttribute('data-val',String(charactersLeft));
      if (!!SHOWING_MIN_SPAN) {
        maxSpan.setAttribute('aria-hidden','true');
      }
      else {
        maxSpan.setAttribute('aria-hidden','false');
      }
      maxSpan.innerText = "Characters Remaining";
      p.append(maxSpan);
    }
    wrapper.insertAdjacentElement("afterend",p);
  }
}

function removeCharCounter(editor:LexicalEditor) {
  const p = document.getElementById(editor._config.namespace.concat('-char-counter'));
  if (p) p.remove();
}


export function registerMaxLengthEditable(editor:LexicalEditor,{min,max,showCounter=true}:{min?:number,max:number, showCounter?: boolean}) {
  TEXT_LENGTH[editor._config.namespace] = {lastLength: null,text:editor.getEditorState().read($rootTextContent)};
  if(showCounter) $addCharCounter(editor,{min,max},true);
  return mergeRegister(
    editor.registerUpdateListener(({dirtyLeaves, dirtyElements}) => {
      const isComposing = editor.isComposing();
      const hasContentChanges =
        dirtyLeaves.size > 0 || dirtyElements.size > 0;

      if (isComposing || !hasContentChanges) {
        return;
      }

      const textLength = TEXT_LENGTH[editor._config.namespace]?.text?.length || 0;
      const textLengthAboveThreshold =
        textLength > Number(max) ||
        (TEXT_LENGTH[editor._config.namespace].lastLength !== null &&
          Number(TEXT_LENGTH[editor._config.namespace].lastLength) > max);
      const diff = max - textLength;

      if (TEXT_LENGTH[editor._config.namespace].lastLength === null || textLengthAboveThreshold) {
        const offset = findOffset(TEXT_LENGTH[editor._config.namespace]?.text||'', Number(max), (s:string)=>s.length);
        editor.update(
          () => {
            $wrapOverflowedNodes(offset);
          },
          {
            tag: 'history-merge',
          },
        );
      }

      TEXT_LENGTH[editor._config.namespace].lastLength = textLength;
    }),
    editor.registerTextContentListener((text) => {
      TEXT_LENGTH[editor._config.namespace].text = text;
      const length = text.length;
      const el = document.getElementById(editor._config.namespace.concat('-char-counter'));
      var SHOWING_MIN_SPAN = false;
      if (el){
        const children = Array.from(el.children);
        const minSpan = children.filter((el)=>el.classList.contains('min-counter'))[0];
        const maxSpan = children.filter((el)=>el.classList.contains('max-counter'))[0];
        if (minSpan) {
          const charactersRemaining = Number(min)-Number(length);
          minSpan.setAttribute('data-val',String(charactersRemaining));
          if (charactersRemaining>0) {minSpan.setAttribute('aria-hidden','false'); SHOWING_MIN_SPAN = true;}
          else minSpan.setAttribute('aria-hidden','true');
        }
        if (maxSpan) {
          const moreCharacters = max-Number(length);
          maxSpan.setAttribute('data-val',String(moreCharacters));
          if (!!!SHOWING_MIN_SPAN) maxSpan.setAttribute('aria-hidden','false');
          else maxSpan.setAttribute('aria-hidden','true');
        }
      }
    }),
    editor.registerEditableListener((editable) => {
      if (editable) {
        $addCharCounter(editor,{min,max});
      } else {
        removeCharCounter(editor);
      }
    }),
    function(){
      removeCharCounter(editor);
      delete TEXT_LENGTH[editor._config.namespace];
    },
    editor.registerNodeTransform(RootNode,(rootNode: RootNode)=>{
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return;
      }
      const prevEditorState = editor.getEditorState();
      const prevTextContentSize = prevEditorState.read(() =>
        rootNode.getTextContentSize(),
      );
      const textContentSize = rootNode.getTextContentSize();
      if (prevTextContentSize !== textContentSize) {
        const delCount = textContentSize - max;
        const anchor = selection.anchor;

        if (delCount > 0) {
          // Restore the old editor state instead if the last
          // text content was already at the limit.
          if (
            prevTextContentSize === max &&
            EDITOR_STATE[editor._config.namespace] !== prevEditorState
          ) {
            EDITOR_STATE[editor._config.namespace] = prevEditorState;
            $restoreEditorState(editor, prevEditorState);
          } else {
            trimTextContentFromAnchor(editor, anchor, delCount);
          }
        }
      }
    })
  )
}

export function getCsrfToken() {
  const csrf = document.getElementById('csrf_token') as HTMLInputElement|null;
  if (csrf) return csrf.value;
  else return 'csrf-not-found';
}

export function getFileListForFileInput(files:File[]) {
  const dataTransfer = new DataTransfer();
  for (let file of files) {
    dataTransfer.items.add(file);
  }
  return dataTransfer.files;
}

export function getNoColor(editor:LexicalEditor) {
  return Boolean(editor._rootElement&&editor._rootElement.hasAttribute('data-no-color'));
}


/**
 * Calculates the zoom level of an element as a result of using
 * css zoom property.
 * @param element
 */
export function calculateZoomLevel(element: Element | null): number {
  if (IS_FIREFOX) {
    return 1;
  }
  let zoom = 1;
  while (element) {
    zoom *= Number(window.getComputedStyle(element).getPropertyValue('zoom'));
    element = element.parentElement;
  }
  return zoom;
}

var STICKY_NAVBAR_INTERVAL:null|NodeJS.Timeout = null; 
export function registerStickyNavbar(editor:LexicalEditor) {
  // Element to keep track of virtual keyboard offset to keep sticky navbar sticky
  const virtualKeyboardOffset = document.getElementById('virual-keyboard-offset') as HTMLStyleElement|null;
  if (virtualKeyboardOffset&&window.visualViewport) {
    return mergeRegister(
      editor.registerCommand(
        FOCUS_COMMAND,
        () => {
          STICKY_NAVBAR_INTERVAL = setInterval(() => {
            const height = window.visualViewport?.offsetTop;
            if (Number.isFinite(height)) {
              virtualKeyboardOffset.innerText=`*{--virtual-keyboard-offset:${height}px;}`;
            }
          },500);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        () => {
          if (STICKY_NAVBAR_INTERVAL) {
            clearInterval(STICKY_NAVBAR_INTERVAL);
            STICKY_NAVBAR_INTERVAL = null;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    )
  } else {
    return () => {};
  }
  
}
/**
 * Find greatest common denomitar of two numbers
 * @param a 
 * @param b 
 * @returns 
 */
export function gcd(a:number, b:number) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

type VALID_LECIXAL_DIALOG_IDS = "math-markup-lexical"|"lex-embed-news"|"lex-embed-youtube"|"lex-embed-tiktok"|"lex-embed-twitter"|"lex-embed-instagram"|"details-content-lexical"|"tables-lexical"|"horizontal-rule-lexical"|"view-content-lexical"|"lexical-block-edit-dialog"|"lexical-table-cell-bg"|"edit-table-lexical"|"lex-upload-file-dialog"|"lex-insert-custom-html"|"image-bg-color-dialog"|"column-layout-lexical"|"coding-lang-lexical"|"insert-previous-lexical"

const LEXICAL_DIALOG_IDS = new Set<VALID_LECIXAL_DIALOG_IDS>([
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
const VALID_CODEMIRROR_THEMES = new Set([
  "abcdef",
  "abyss",
  "androidstudio",
  "andromeda",
  "atomone",
  "aura",
  "bbedit",
  "basic light",
  "basic dark",
  "bespin",
  "copilot",
  "dracula",
  "darcula",
  "duotone light",
  "duotone dark",
  "eclipse",
  "github light",
  "github dark",
  "gruvbox dark",
  "gruvbox light",
  "material light",
  "material dark",
  "monokai",
  "monokai dimmed",
  "kimbie",
  "noctis-lilac",
  "nord",
  "okaidia",
  "quietlight",
  "red",
  "solarized light",
  "solarized dark",
  "sublime",
  "tokyo-night",
  "tokyo-night-storm",
  "tokyo-night-day",
  "tomorrow-night-blue",
  "white dark",
  "white light",
  "vscode",
  "xcode light",
  "xcode dark"
]);

export function handleOpenLexDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_CED>) {
  const id = e.detail.dialogID;
  const insertAfterDiv = document.getElementById('insert-after-lexical-layout'); 
  if (insertAfterDiv) {
if (LEXICAL_DIALOG_IDS.has(id as any)) {
    switch (id as VALID_LECIXAL_DIALOG_IDS) {
      case 'coding-lang-lexical': { // DONE
        const str = CODE_LANGUAGE_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'column-layout-lexical': { // DONE
        const str = COLUMN_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'details-content-lexical': { // DONE
        const str = DETAILS_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'edit-table-lexical': { // DONE
        const str = TABLE_EDIT_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lexical-table-cell-bg': { // DONE
        const str = GET_CELL_EDIT_DIALOG(getDefaultBackground(),getDefaultTextColor());
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'tables-lexical': { // DONE
        const str = TABLES_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'horizontal-rule-lexical': { // DONE
        const str = GET_HORIZONTAL_RULE_DIALOG(getDefaultTextColor());
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'image-bg-color-dialog': { // DONE
        const str = GET_BACKGROUND_COLOR_DIALOG(getDefaultBackground());
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'insert-previous-lexical': { // DONE
        const str = PREVIOUS_VERSION_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lex-embed-instagram': { // DONE
        const str = INSTAGRAM_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lex-embed-news': { // DONE
        const str = NEWS_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lex-embed-youtube': { // DONE
        const str = YOUTUBE_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }

      case 'lex-embed-tiktok': { // DONE
        const str = TIKTOK_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lex-embed-twitter': { // DONE
        const str = TWITTER_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }

      case 'lex-upload-file-dialog': { // DONE
        const str = UPLOAD_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'lexical-block-edit-dialog': { // DONE
        const str = GET_BLOCK_EDIT_DIALOG(getDefaultBackground(),getDefaultTextColor());
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'math-markup-lexical': { // DONE
        const str = MATH_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      case 'view-content-lexical': {
        const str = VIEW_SIZES_DIALOG;
        insertAfterDiv.insertAdjacentHTML("afterbegin",str);
        break;
      }
      default: {
        console.error(id + " is not a valid lexical dialog ID.");
        return;
      }
    }
    const dialogEl = document.getElementById(id) as HTMLDivElement|null;
    if (dialogEl) {
      document.dispatchEvent(new CustomEvent<NEW_CONTENT_LOADED_CED>('NEW_CONTENT_LOADED',{ detail: { el: insertAfterDiv } }));
      document.dispatchEvent(new CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>('OPEN_LEXICAL_DIALOG_FINAL',{ detail: { el: dialogEl } })); 
      if (id==="insert-previous-lexical") {
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('ON_AFTER_RELOAD_HISTORY'));
        },250)
      }
    }
  }
  }
}

export function handleCloseLexDialog(e:CustomEvent<CLOSE_LEXICAL_DIALOG_CED>) {
  e.detail.dialog.setAttribute('hidden','');
  e.detail.dialog.style.setProperty('display','none');
  if (window.unloadCodeEditorsBeforeSwap) window.unloadCodeEditorsBeforeSwap(e.detail.dialog);
  if (window.unloadLexicalEditorsBeforeSwap) window.unloadLexicalEditorsBeforeSwap(e.detail.dialog);
  e.detail.dialog.remove();
}



