"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markdownApi = void 0;
const html_1 = require("../html");
const markdown_1 = require("./markdown");
async function markdownApi(req, res) {
    try {
        const useDesignSystem = Boolean(req.body['style-type'] === 'my-design-system');
        const breaks = Boolean(req.body['breaks'] === 'on');
        const gfm = Boolean(req.body['gfm'] === 'on');
        const pedantic = Boolean(req.body['pedantic'] === 'on');
        const markdownStrPre = req.body['markdown-input'];
        const design_system = useDesignSystem ? 'my-design-system' : 'default';
        if (typeof markdownStrPre !== 'string' || markdownStrPre.length < 10)
            return res.status(200).send((0, html_1.getErrorAlert)('Markdown Input must be at least 10 characters long.'));
        const markdownRespPre = await (0, markdown_1.parseMarkdown)(markdownStrPre, { design_system, breaks, gfm, pedantic });
        const markdownResp = await (0, markdown_1.purifyAndUpdateJupyterNotebookMarkdownHTML)(markdownRespPre);
        const resp = /*html*/ `
<div class="p-md mt-2" style="border: 2px solid var(--secondary); border-radius: 0.5rem;">
<div class="mt-1 flex-row justify-end">
    <button type="button" class="icon-text medium filled info" data-copy-el data-el="#markdown-resp-cont" data-inner data-snackbar data-selem="#copied-html-markdown" data-click>
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Html"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm14 0H13c-.55 0-1 .45-1 1v5h1.5v-4.5h1V14H16v-3.51h1V15h1.5v-5c0-.55-.45-1-1-1zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
      COPY HTML
    </button>
</div>
<details aria-label="Markdown HTML" class="mt-2 flat">
  <summary>
    <span class="h6 fw-regular">Markdown HTML</span>
    <svg class="details" focusable="false" inert viewBox="0 0 24 24">
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
      </path>
    </svg>
  </summary>
  <div class="accordion-content" aria-hidden="true" id="markdown-resp-cont" style="background-color: var(--background);">
    ${markdownResp}
  </div>
</details>
<div id="copied-html-markdown" class="snackbar success" aria-hidden="true" role="alert" data-snacktime="4000">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Html"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm14 0H13c-.55 0-1 .45-1 1v5h1.5v-4.5h1V14H16v-3.51h1V15h1.5v-5c0-.55-.45-1-1-1zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
  <p class="p-sm">Successfully copied HTML to clipboard!</p>
  <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
  </button>
</div>
</div>



`;
        return res.status(200).send(resp);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Unable to generate HTML for the markdown provided.'));
    }
}
exports.markdownApi = markdownApi;
