import { DISPATCH_SNACKBAR_CED, NEW_CONTENT_LOADED_CED } from "..";
import { markdownToHTMLAi } from "../ai-chat";
import { delay } from "../shared";

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
// Done
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
// Done
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
// Done
function updateAiChat(html_string:string) {
  if (CURRENT_CHAT_MESSAGE_ID&&window.updateLexicalInstanceWithHtml) {
    window.updateLexicalInstanceWithHtml(CURRENT_CHAT_MESSAGE_ID,html_string);
    window.scrollY = window.innerHeight;
  }
}
// Done
function appendErrorToAiChatDialog(message:string) {
  const error = `<div style="max-width: max(95%,600px); margin-left: auto; margin-top: 6px;">
    <div class="alert error filled small icon" role="alert">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CancelOutlined"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z"></path></svg>
        <p class="alert">
          ${message}  
        </p>
      </div>
</div>`
  const chatBody = document.getElementById('ai-page-chat-body');
  if (chatBody) chatBody.insertAdjacentHTML("beforeend",error);
  window.scrollY = window.innerHeight;
}

async function handleAIChatButtonClick(this:HTMLButtonElement,e:Event) {
  if (this.classList.contains('success')) {
    if (window.editorToChatMessage) {
      const { markdown, html } = await window.editorToChatMessage('page-ai-chat-editor');
      if (markdown.length&&window.socket&&html.length) {
        const regex2 = /^\/ai-tools\/ai-chat\/(chat_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\?.*)?$/i;
        const matches = window.location.pathname.match(regex2);
        var chat_id_send = undefined;
        if (matches&&matches.length>=2&&matches[1]) {
          chat_id_send = matches[1];
        }
        window.socket.emit('ai-chat-page',{ markdown, html, chat_id_send },({ error, message, id, chat_name, chat_id }:{error:boolean,message:string, id?:string, chat_name?: string, chat_id?: string }) => {
          if (error) {
            appendErrorToAiChatDialog(message);
          } else if (id) {
            
            CURRENT_CHAT_MESSAGE_ID = id;
            const chatBody = document.getElementById('ai-page-chat-body');
            if (chatBody) appendUserAiChatQuery(html,chatBody);
            if (chatBody) appendAiChatQuery('<p class="lex-p first-rte-element" style="text-align: left; margin: 6px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><br/></p>',chatBody);
            this.classList.remove('success');
            this.classList.add('warning');
            this.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>PAUSE`;
            const newChatButton = document.getElementById('new-ai-chat-button');
            if (newChatButton) newChatButton.setAttribute('disabled','');
            if (chat_name&&chat_id) {
              const currentAIChatNameSpan = document.getElementById('current-ai-chat-page-name');
              const currentChatInput = document.getElementById('ai-chat-page-select-input') as HTMLInputElement|null;
              const currentChatNameSelectedButton = Array.from(document.querySelectorAll('#ai-chat-page-select-dropdown button[aria-selected="true"]'));
              const aiSelectDropdown = document.getElementById('ai-chat-page-select-dropdown');
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
                window.setEditorState('page-ai-chat-editor',NEXT_MESSAGE_LEXICAL_STATE);
              }
              const url = `/ai-tools/ai-chat/${encodeURIComponent(chat_id)}`;
              const main = document.querySelector('main#PAGE');
              const el = document.createElement('div');
              el.setAttribute('hx-get',url);
              el.setAttribute('hx-target','#replace-with-nothing');
              el.setAttribute('hx-push-url','true');
              el.setAttribute('hx-trigger','click');
              if (main) {
                main.append(el);
                if (window.htmx) {
                  window.htmx.process(el);
                  window.htmx.trigger(el,'click',{});
                }
                return;
              }
            }
          }
        })
      }
    }
  } else {
    if (window.socket&&CURRENT_CHAT_MESSAGE_ID) {
      const regex2 = /^\/ai-tools\/ai-chat\/(chat_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\?.*)?$/i;
      const matches = window.location.pathname.match(regex2);
      var chat_id_send = undefined;
      if (matches&&matches.length>=2&&matches[1]) {
        chat_id_send = matches[1];
      }
      window.socket.emit('ai-chat-end-page',{ message_id: CURRENT_CHAT_MESSAGE_ID, chat_id: chat_id_send },({error, message_id}:{error:boolean, message_id: string}) => {
        if (!!!error) {
          this.classList.remove('warning');
          this.classList.add('success');
          this.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT`;
          if (message_id===CURRENT_CHAT_MESSAGE_ID) CURRENT_CHAT_MESSAGE_ID = null;
          const newChatButton = document.getElementById('new-ai-chat-button');
          if (newChatButton) newChatButton.removeAttribute('disabled');
        }
      })
    }
  }
}
// Done
function onNewAiChat() {
  const url = '/ai-tools/ai-chat';
  const main = document.querySelector('main#PAGE');
  const el = document.createElement('div');
  el.setAttribute('hx-get',url);
  el.setAttribute('hx-target','#PAGE');
  el.setAttribute('hx-push-url','true');
  el.setAttribute('hx-indicator','#page-transition-progress');
  el.setAttribute('hx-trigger','click');
  if (main) {
    main.append(el);
    if (window.htmx) {
      window.htmx.process(el);
      window.htmx.trigger(el,'click',{});
    }
    return;
  }
}
// Done
function onCopyAiChatLink() {
  const regex2 = /^\/ai-tools\/ai-chat\/chat_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\?.*)?$/i;
  if (regex2.test(window.location.pathname)) {
    navigator.clipboard.writeText(window.location.href)
    .then(() => {
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "success", message: "Successfully copied url to AI chat to clipboard. "}}));
    })
  } else {
    document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Start the chat to copy a link to the chat. "}}));
  }
}

async function onAIChatResponse(obj:{message_id: string, markdown: string, end: boolean }) {
  const html = await markdownToHTMLAi(obj.markdown);
  updateAiChat(html);
  if (obj.end) {
    if (obj.message_id===CURRENT_CHAT_MESSAGE_ID) {
      CURRENT_CHAT_MESSAGE_ID = null;
      const submitButton = document.getElementById('submit-ai-chat-button');
      if (submitButton) {
        submitButton.classList.remove('warning');
        submitButton.classList.add('success');
        submitButton.innerHTML = `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT`;
      }
      const newChatButton = document.getElementById('new-ai-chat-button');
      if (newChatButton) newChatButton.removeAttribute('disabled');
    }
    if (window.setEditorState) {
      window.setEditorState('page-ai-chat-editor',NEXT_MESSAGE_LEXICAL_STATE);
    }
  }
}

export async function onLoad() {
  var ai_chat_editor = document.getElementById('ai-chat-editor');
  while (!!!ai_chat_editor) {
    await delay(500);
    ai_chat_editor = document.getElementById('ai-chat-editor');
  }
  const submitButton = document.getElementById('submit-ai-chat-button');
  if (submitButton) {
    submitButton.addEventListener('click',handleAIChatButtonClick);
  }
  const newChatButton = document.getElementById('new-ai-chat-button');
  if (newChatButton) {
    newChatButton.addEventListener('click',onNewAiChat);
  }

  const copyLinkButton = document.getElementById('page-copy-ai-chat-link');
  if (copyLinkButton) {
    copyLinkButton.addEventListener('click',onCopyAiChatLink);
  }
  if (window.socket) {
    window.socket.on('ai-chat-page',onAIChatResponse);
  }
}

export function onUnload() {
  if (window.socket) {
    window.socket.off('ai-chat-page');
  }
}