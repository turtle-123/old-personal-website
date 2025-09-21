import { Request } from 'express';

export function getFontFamily(req:Request,rand:string) {
  const desktop = Boolean(req.session.device?.desktop);
  const hiddenLabel1 = 'lex_font_label_'.concat(rand);
  const fontDropdown = 'lex_dropdown_'.concat(rand);
  const fontFamily = req.session.settings?.fontFamily || 'Anuphan, sans-serif;';
  const fontFamilyLexical = 'font_fam_lex_'.concat(rand);
  
  return /*html*/`<div hidden id="${hiddenLabel1}">Font Family For Editor</div>  <button   style="height: 2.13rem!important; border-radius: 0px!important;"   type="button"   role="combobox"   aria-haspopup="listbox"   aria-controls="${fontDropdown}"   aria-labelledby="${hiddenLabel1}"  data-pelem="#${fontDropdown}"  aria-expanded="false"   data-placeholder="Current Font for Lexical"   class="select small"   data-popover   data-click  data-lexical-font-button  ${desktop?'data-force-close':''}  >  <span class="body1" style="width: max-content!important; min-width: 150px;text-align: left!important;">${fontFamily}</span>  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>  </button>  <div ${desktop?'data-click-capture':''} tabindex="0" id="${fontDropdown}" role="listbox" class="select-menu o-xs" data-placement="bottom">  <input data-lexical-font-input type="text" hidden="" value="${fontFamily}" name="${fontFamilyLexical}" id="${fontFamilyLexical}">  <button type="button" tabindex="-1" class="select-option" role="option" aria-selected="true" data-val="Inherit">  Inherit  </button>  <button style="font-family: Anuphan, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Anuphan, sans-serif;">  Anuphan, sans-serif;  </button>  <button style="font-family: Arial, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Arial, sans-serif;">  Arial, sans-serif;  </button>  <button style="font-family: Verdana, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Verdana, sans-serif;">  Verdana, sans-serif;  </button>  <button style="font-family: Tahoma, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Tahoma, sans-serif;">  Tahoma, sans-serif;  </button>  <button style="font-family: Trebuchet MS, sans-serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Trebuchet MS, sans-serif;">  Trebuchet MS, sans-serif;  </button>  <button style="font-family: Times New Roman, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Times New Roman, serif;">   Times New Roman, serif;  </button>  <button style="font-family: Georgia, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Georgia, serif;">  Georgia, serif;  </button>  <button style="font-family: Garamond, serif;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Garamond, serif;">  Garamond, serif;  </button>  <button style="font-family: Courier New, monospace;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Courier New, monospace;">   Courier New, monospace;  </button>  <button style="font-family: Brush Script MT, cursive;" type="button" tabindex="-1" class="select-option" role="option" aria-selected="false" data-val="Brush Script MT, cursive;">  Brush Script MT, cursive;  </button>  </div> `;
}

export function getHeading(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-heading-node" aria-describedby="lex-heading-node"':''%> >
  <button data-lexical-heading-button type="button" class="toggle-button" aria-label="Insert Heading Node" data-popover data-pelem="#<%=locals['heading-node-lexical-menu']%>" data-click>
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatSizeSharp"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"></path></svg>
  </button>
</div>
<div style="padding: 0px; background-color: var(--background)!important; border-radius: 0px;" class="floating-menu o-xs" role="dialog" id="<%=locals['heading-node-lexical-menu']%>" data-placement="bottom">
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h1">
    H1
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h2">
    H2
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h3">
    H3
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h4">
    H4
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h5">
    H5
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="h6">
    H6
  </button>
  <button data-mouse-down type="button" class="toggle-button" data-dispatch="CREATE_HEADING_COMMAND" data-payload="p">
    P
  </button>
</div>`;
}
export function getSectionHeading(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  return /*html*/`<div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-section-heading-node" aria-describedby="lex-section-heading-node"':''%>>
  <button data-lexical-section-button type="button" class="toggle-button" aria-label="Insert Section Heading Node" data-click type="button">
    <svg viewBox="0 0 640 512" title="link" focusable="false" inert tabindex="-1"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"></path></svg>
  </button>
</div>`;
}
export function getLink(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-link-pop" aria-describedby="lex-insert-link-pop"':''}>
  <button data-lexical-link-button data-click type="button" class="toggle-button" aria-label="Insert Link" aria-haspopup="dialog"  data-popover data-pelem="#<%=locals['lexical-insert-link-main']%>" data-force-close>
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path></svg>
  </button>
</div>
<div data-lexical-link-popup id="<%=locals['lexical-insert-link-main']%>" role="dialog" class="floating-menu o-xs" style="padding:4px;border-radius:6px; max-width: 500px!important; width: 400px!important;" data-placement="top-start" data-click-capture>
  <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
    <label for="<%=locals['lex-insert-link-main-url']%>">Link URL:</label>
    <div class="text-input block medium">
        <input
        data-lexical-link-input
        name="<%=locals['lex-insert-link-main-url']%>"
        id="<%=locals['lex-insert-link-main-url']%>" 
        class="mt-1 
        medium icon-before" 
        placeholder="Enter the URL of the link..." 
        maxlength="1500"
        autocomplete="off" 
        autocapitalize="off" 
        spellcheck="false" 
        type="url" 
        style="padding: 5px 12px;"
        >
        <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Link">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z">
            </path>
        </svg>
    </div>
  </div>
  <p hidden class="caption t-warning" data-error-text>
    Please input a valid url.
  </p>
  <div class="mt-1 flex-row w-100 justify-between align-center">
    <button data-close-menu class="warning filled small" type="button">
      CLOSE
    </button>
    <div>
      <button hidden class="filled error small" type="button" data-lexical-remove-link style="margin-right: 4px;">
        REMOVE LINK
      </button>
      <button class="filled success small" type="button" data-lexical-link-submit>
        SUBMIT
      </button>
    </div>
  </div>
    
</div>`;

}
export function getBackgroundColor(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  return /*html*/`<div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-background-color" aria-describedby="lex-background-color"':''%>>
  <button data-lexical-bg-color-button aria-haspopup="dialog" data-popover data-click data-pelem="#<%=locals['lexical-background-color-menu']%>" data-force-close type="button" class="toggle-button" aria-label="Background Color">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorFillSharp"><path d="M10 17.62 17.62 10l-10-10-1.41 1.41 2.38 2.38L2.38 10 10 17.62zm0-12.41L14.79 10H5.21L10 5.21zM19 17c1.1 0 2-.9 2-2 0-1.33-2-3.5-2-3.5s-2 2.17-2 3.5c0 1.1.9 2 2 2zM2 20h20v4H2z"></path></svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="<%=locals['lexical-background-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-background-color-1']%>">Background Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
    <input data-lexical-background-color type="color" data-coloris name="<%=locals['lexical-background-color-1']%>" id="<%=locals['lexical-background-color-1']%>" value="<%=locals?.settings[settingsMode].background%>" style="margin-top: 2px;">
    <span class="body2"><%=locals?.settings[settingsMode].background%></span>
  </div>
  <label class="checkbox mt-1">
    <input data-lexical-background-transparent checked type="checkbox" class="secondary" name="<%=locals['lex-background-color-transparent']%>" id="<%=locals['lex-background-color-transparent']%>">
    Transparent
  </label>
</div>`;
}
export function getTextColor(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div <%-Boolean(locals.desktop===true)?'data-popover data-mouse data-pelem="#lex-text-color" aria-describedby="lex-text-color"':''%>>
  <button data-lexical-text-color-button data-popover data-pelem="#<%=locals['lexical-text-color-menu']%>" data-force-close aria-haspopup="dialog" data-click type="button" class="toggle-button" aria-label="Text Color">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatColorTextSharp"><path d="M2 20h20v4H2v-4zm3.49-3h2.42l1.27-3.58h5.65L16.09 17h2.42L13.25 3h-2.5L5.49 17zm4.42-5.61 2.03-5.79h.12l2.03 5.79H9.91z"></path></svg>
  </button>
</div>
<div data-click-capture class="floating-menu o-xs" style="min-width: 150px;" data-placement="bottom-end" id="<%=locals['lexical-text-color-menu']%>">
  <label class="body2" for="<%=locals['lexical-text-color-1']%>">Text Color:</label>
  <div class="flex-row justify-begin align-center gap-2">
    <input data-lexical-text-color type="color" data-coloris name="<%=locals['lexical-text-color-1']%>" id="<%=locals['lexical-text-color-1']%>" value="<%=locals?.settings[settingsMode].textColor%>" style="margin-top: 2px;">
    <span class="body2"><%=locals?.settings[settingsMode].textColor%></span>
  </div>
  <label class="checkbox mt-1">
    <input data-lexical-text-transparent checked type="checkbox" class="secondary" name="<%=locals['lex-text-color-transparent']%>" id="<%=locals['lex-text-color-transparent']%>">
    Inherit
  </label>
</div>
</div>`;
}
export function getBold(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getItalic(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getStrikethrough(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getUnderline(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getKeyboard(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getQuote(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getSubscript(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="subscript" type="button"  ${desktop?'data-popover data-mouse data-pelem="#lex-subscript" aria-describedby="lex-subscript"':''} class="toggle-button" aria-label="Subscript" >
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SubscriptSharp"><path d="M20 18v1h3v1h-4v-3h3v-1h-3v-1h4v3h-3zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"></path></svg>
</button>`;
}
export function getSuperscript(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<button data-dispatch="FORMAT_TEXT_COMMAND" data-payload="superscript" type="button"  ${desktop?'data-popover data-mouse data-pelem="#lex-superscript" aria-describedby="lex-superscript"':''} class="toggle-button" aria-label="Superscript" >
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SuperscriptSharp"><path d="M20 7v1h3v1h-4V6h3V5h-3V4h4v3h-3zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"></path></svg>
</button>`;
}
export function getClearTextFormatting(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getFontSize(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getUndo(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getRedo(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getClearEditor(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getNewline(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getIndent(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getOutdent(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getLeftAlign(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getCenterAlign(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getRightAlign(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getJustifyAlign(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getBlockStyle(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div role="toolbar" class="toggle-button-group subgroup pl-1 left" <%-Boolean(locals.desktop===true)?'data-popover data-pelem="#lex-edit-block-element" data-mouse':''%>>
  <button data-lexical-block-style-button type="button" data-click aria-haspopup="dialog" data-dialog="lexical-block-edit-dialog" class="toggle-button" aria-label="Edit block elements in selection">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="SettingsSuggest"><path d="M17.41 6.59 15 5.5l2.41-1.09L18.5 2l1.09 2.41L22 5.5l-2.41 1.09L18.5 9l-1.09-2.41zm3.87 6.13L20.5 11l-.78 1.72-1.72.78 1.72.78.78 1.72.78-1.72L23 13.5l-1.72-.78zm-5.04 1.65 1.94 1.47-2.5 4.33-2.24-.94c-.2.13-.42.26-.64.37l-.3 2.4h-5l-.3-2.41c-.22-.11-.43-.23-.64-.37l-2.24.94-2.5-4.33 1.94-1.47c-.01-.11-.01-.24-.01-.36s0-.25.01-.37l-1.94-1.47 2.5-4.33 2.24.94c.2-.13.42-.26.64-.37L7.5 6h5l.3 2.41c.22.11.43.23.64.37l2.24-.94 2.5 4.33-1.94 1.47c.01.12.01.24.01.37s0 .24-.01.36zM13 14c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"></path></svg>
  </button>
</div>`;
}
export function getImage(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-upload-or-take-image" aria-describedby="lex-upload-or-take-image"':''}>
  <button data-lexical-image-button data-click type="button" class="toggle-button" aria-label="Upload or Take Image">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ImageSharp"><path d="M21 21V3H3v18h18zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>
  </button>
</div>
`;
}
export function getAudio(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/` <div  ${desktop?'data-popover data-mouse data-pelem="#lex-upload-or-record-audio" aria-describedby="lex-upload-or-record-audio"':''}>
  <button data-lexical-audio-button data-click type="button" class="toggle-button" aria-label="Upload or Record Audio">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AudiotrackSharp"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
  </button>
</div>`;
}
export function getVideo(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-upload-or-take-video" aria-describedby="lex-upload-or-take-video"':''}>
  <button data-lexical-video-button data-click type="button" class="toggle-button" aria-label="Upload or Record Video">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VideocamSharp"><path d="M17 10.5V6H3v12h14v-4.5l4 4v-11l-4 4z"></path></svg>
  </button>
</div>`;
}
export function getHTML(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/``;
}
export function getGif(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-upload-gif" aria-describedby="lex-upload-gif"':''}>
  <button data-lexical-gif-button data-click type="button" class="toggle-button" aria-label="Upload GIF">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Gif"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"></path></svg>
  </button>
  <input data-lexical-gif-input multiple type="file" hidden="hidden" accept=".gif" />
</div>`;
}
export function getSpeechToText(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-speech-to-text" aria-describedby="lex-speech-to-text"':''}>
  <button data-lexical-speech-to-text data-click type="button" class="toggle-button lex-stt" aria-label="Speech to Text">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Mic"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
  </button>
</div>`;
}
export function getDownload(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div ${desktop?'data-popover="" data-mouse="" data-pelem="#lex-download-state" aria-describedby="lex-download-state"':''}>
  <button data-download-state="" data-click="" type="button" class="toggle-button" aria-label="Download Editor State">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Download"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path></svg>
  </button>
</div>`;
}
export function getUpload(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div ${desktop?'data-popover="" data-mouse="" data-pelem="#lex-upload-state" aria-describedby="lex-upload-state"':''}>
  <button data-dialog="lex-upload-file-dialog" data-click="" type="button" class="toggle-button" aria-label="Upload Lexical, Markdown, Notebook, or TeX">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Upload"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"></path></svg>
  </button>
</div>`;
}
export function getEmbedMedia(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-embed-media-content" aria-describedby="lex-embed-media-content"':''}>
  <button data-lexical-embed-media data-click type="button" class="toggle-button" aria-label="Insert Embedded Content" aria-haspopup="dialog" 
  data-popover
  data-pelem="#<%=locals['embed-media-content-popup']%>"
  data-click 
  >
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ThumbUp"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path></svg>              </button>
</div>
<div id="<%=locals['embed-media-content-popup']%>" class="floating-menu o-xs" role="dialog" style="padding:0px;border-radius:2px" data-placement="top-start">
  <button data-embed-news data-mouse-down type="button" data-dialog="lex-embed-news" class="icon-text medium social-media news">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Newspaper"><path d="m22 3-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 19H4v-6h7v6zm9 0h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4H4V8h16v3z"></path></svg>
    Embed News Article
  </button>
  <button data-embed-youtube data-mouse-down type="button" data-dialog="lex-embed-youtube"class="icon-text medium social-media youtube" >
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="YouTube"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path></svg>
    Embed Youtube Video
  </button>
  <button data-embed-x data-mouse-down type="button" data-dialog="lex-embed-twitter" class="icon-text medium social-media twitter" >
    <svg viewBox="0 0 512 512" title="x-twitter" focusable="false" inert tabindex="-1"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg>
    Embed X Post
  </button>
  <button data-embed-tiktok data-mouse-down type="button" data-dialog="lex-embed-tiktok" class="icon-text medium social-media tiktok" >
    <svg viewBox="0 0 448 512" title="tiktok" focusable="false" inert tabindex="-1"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path></svg>
    Embed TikTok Video
  </button>
  <button data-embed-instagram data-mouse-down type="button" data-dialog="lex-embed-instagram"class="icon-text medium social-media instagram" >
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Instagram"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path></svg>
    Embed Instagram Post
  </button>
</div>`;
}
export function getBlockquote(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  return /*html*/`<div>     <button data-lexical-quote-button="" data-dispatch="INSERT_QUOTE_COMMAND" data-click="" type="button" class="toggle-button" aria-label="Insert Quote">         <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FormatQuote"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path></svg>     </button>     </div>`;
}
export function getList(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-lists" aria-describedby="lex-insert-lists"':''}>
  <button data-lexical-list-button aria-haspopup="dialog" data-popover data-pelem="#<%=locals['lex-insert-lists-popover']%>" data-click type="button"  class="toggle-button" aria-label="Insert List">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListSharp"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>
  </button>
</div>
<div role="dialog" class="floating-menu o-xs" id="<%=locals['lex-insert-lists-popover']%>" style="padding: 0px; border-radius: 0px;" data-placement="bottom-start">
  <button type="button" data-mouse-down data-dispatch="INSERT_ORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ListAlt"><path d="M19 5v14H5V5h14m1.1-2H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM11 7h6v2h-6V7zm0 4h6v2h-6v-2zm0 4h6v2h-6zM7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7z"></path></svg>
    Ordered List
  </button>
  <button type="button" data-mouse-down data-dispatch="INSERT_UNORDERED_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="List"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path></svg>                  
    Unordered List
  </button>
  <button type="button" data-mouse-down="" data-dispatch="INSERT_CHECK_LIST_COMMAND" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Checklist"><path d="M22 7h-9v2h9V7zm0 8h-9v2h9v-2zM5.54 11 2 7.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 11zm0 8L2 15.46l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41L5.54 19z"></path></svg>
      Check List
  </button>
</div>`;
}
export function getAside(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-aside" aria-describedby="lex-insert-aside"':''}>
  <button data-lexical-aside-button aria-haspopup="dialog" data-popover data-pelem="#<%=locals['lex-insert-aside-menu']%>" data-click type="button" class="toggle-button" aria-label="Insert Aside">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="East"><path d="m15 5-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z"></path></svg>
  </button>
</div>
<div role="dialog" class="floating-menu o-xs" id="<%=locals['lex-insert-aside-menu']%>" style="padding: 0px; border-radius: 0px;" data-placement="bottom-start">
  <button type="button" data-mouse-down data-dispatch="INSERT_ASIDE_COMMAND" data-payload="left" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="West"><path d="m9 19 1.41-1.41L5.83 13H22v-2H5.83l4.59-4.59L9 5l-7 7 7 7z"></path></svg>
    Left Aside
  </button>
  <button type="button" data-mouse-down data-dispatch="INSERT_ASIDE_COMMAND" data-payload="right" class="icon-text medium transparent" style="border-radius: 0px!important; width: 100%;">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="East"><path d="m15 5-1.41 1.41L18.17 11H2v2h16.17l-4.59 4.59L15 19l7-7-7-7z"></path></svg>
    Right Aside
  </button>
</div>`;
}
export function getDetails(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  
  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-details" aria-describedby="lex-insert-details"':''}>
  <button data-lexical-details-button data-click aria-haspopup="dialog" data-dialog="details-content-lexical" type="button" class="toggle-button" aria-label="Insert Details Element">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Details"><path d="M12 3 2 21h20L12 3zm1 5.92L18.6 19H13V8.92zm-2 0V19H5.4L11 8.92z"></path></svg>
  </button>
</div>`;
}
export function getCode(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div class="select" data-lex-code-language-wrapper hidden>
  <button type="button" role="combobox" aria-haspopup="listbox" 
  aria-controls="<%=locals['lexical-code-lang-dropdown']%>" 
  class="select" 
  aria-label="Select Coding Language" 
  data-popover 
  data-pelem="#<%=locals['lexical-code-lang-dropdown']%>" 
  data-click 
  aria-expanded="false"
  style="height: 2.13rem!important; border-radius: 0px!important;"
  >
    <span class="body2" style="min-width: 77px;">Auto</span>
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg>
  </button>
  <div data-click-capture tabindex="0" id="<%=locals['lexical-code-lang-dropdown']%>" role="listbox" class="select-menu o-xs" data-placement="bottom">
    <input data-lex-coding-language type="text" hidden value="undefined" name="<%=locals['lexical-code-lang-dropdown']%>" id="<%=locals['lexical-code-lang-dropdown']%>">
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="arm-asm">
    arm-asm
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="armasm">
    armasm
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="bash">
    bash
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="basic">
    basic
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="c">
    c
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="cpp">
    c++
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="clike">
    clike
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="cs">
    cs
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="csharp">
    C#
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="css">
    CSS
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="dotent">
    dotent
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="excel-formula">
    excel-formula
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="gcode">
    gcode
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="git">
    Git
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="go">
    Go
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="html">
    HTML
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="java">
    Java
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="javascript">
    JavaScript
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="json">
    JSON
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="markdown">
    Markdown
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="markdown">
    Markdown
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="markup">
    Markup
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="mathml">
    MathML
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="objectivec">
    Objective-C
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="php">
    php
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="plain">
    Plain
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="plaintext">
    Plain Text
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="plsql">
    plsql
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="python">
    Python
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="rss">
    RSS
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="rust">
    Rust
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="shell">
    Shell
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="shell-session">
    shell-session
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="sql">
    SQL
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="swift">
    Swift
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="text">
    Text
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="typescript">
    TypeScript
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="wasm">
    wasm
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="webmanifest">
    webmanifest
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="xls">
    xls
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="xlsx">
    xlsx
    </button>
    <button type="button" tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="xml">
    xml
    </button>
</div>
</div>
<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-code" aria-describedby="lex-insert-code"':''}>
  <button data-lexical-insert-code data-click data-popover data-pelem="#<%=locals['lex-insert-code-menu']%>" type="button" class="toggle-button" aria-label="Insert Code">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CodeSharp"><path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path></svg>
  </button>
</div>
<div role="dialog" class="floating-menu o-xs" id="<%=locals['lex-insert-code-menu']%>" style="padding: 0px; border-radius: 0px; width: 150px;" data-placement="bottom-start">
  <button type="button" data-mouse-down data-dialog="coding-lang-lexical" class="select-option" style="border-radius: 0px!important; width: 100%;">
    Code Block
  </button>
  <button type="button" data-mouse-down data-dispatch="FORMAT_TEXT_COMMAND" data-payload="code" class="select-option" style="border-radius: 0px!important; width: 100%;">
    Inline Code
  </button>
</div>`;
}
export function getMath(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);

  return /*html*/`<div  ${desktop?'data-popover data-mouse data-pelem="#lex-insert-math" aria-describedby="lex-insert-math"':''}>
  <button data-lexical-math-button data-click  aria-haspopup="dialog" data-dialog="math-markup-lexical" type="button" class="toggle-button" aria-label="Insert Equation">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Functions"><path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"></path></svg>
  </button>
</div>`;
}
export function getTable(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  return /*html*/`<div ${desktop?'data-popover data-mouse data-pelem="#lex-insert-table" aria-describedby="lex-insert-table"':''}> <button data-lexical-table-button data-click aria-haspopup="dialog" data-dialog="tables-lexical" type="button" class="toggle-button" aria-label="Insert Table"> <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="TableView"><path d="M19 7H9c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 2v2H9V9h10zm-6 6v-2h2v2h-2zm2 2v2h-2v-2h2zm-4-2H9v-2h2v2zm6-2h2v2h-2v-2zm-8 4h2v2H9v-2zm8 2v-2h2v2h-2zM6 17H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v1h-2V5H5v10h1v2z"></path></svg> </button> </div>`;
}
export function getHorizontalRule(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
return /*html*/`<div ${desktop?'data-popover data-mouse data-pelem="#lex-hr" aria-describedby="lex-hr"':''}> <button data-lexical-hr-button data-click aria-haspopup="dialog" data-dialog="horizontal-rule-lexical" type="button" class="toggle-button" aria-label="Insert Horizontal Rule"> <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="HorizontalRule"><path fill-rule="evenodd" d="M4 11h16v2H4z"></path></svg> </button> </div>`;
}
export function getParagraph(req: Request, rand: string) {
  const desktop = Boolean(req.session.device?.desktop);
  return /*html*/`<div ${desktop?'data-popover data-mouse data-pelem="#lex-para" aria-describedby="lex-para"':''}> <button data-insert-paragraph-button data-click type="button" class="toggle-button" aria-label="Insert Paragraph At End of Editor"> <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1"><path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4zm12 8-4-4v3H5v2h12v3l4-4z"></path></svg> </button> </div>`;
}
export function getTextEditor(req: Request, options: { innerHTML?: string, type?: string, minHeight?: string, maxHeight?: string }) {
const maxHeightStr = options.maxHeight || '400px';
const minHeightStr = options.minHeight || '150px';
return /*html*/`<div contenteditable="true" data-rich-text-editor data-type="full" spellcheck="true" style="max-height: ${maxHeightStr}; min-height: ${minHeightStr}; overflow-y:auto;">${options.innerHTML || '<p>Insert Content here...</p>'}</div>`;
}