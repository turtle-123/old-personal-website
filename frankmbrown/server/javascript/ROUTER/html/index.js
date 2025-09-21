"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWarningAlert = exports.getInfoAlert = exports.getErrorAlert = exports.getSuccessAlert = exports.getWarningSnackbar = exports.getErrorSnackbar = exports.getSuccessSnackbar = exports.getAllowSettingsString = exports.ALLOW_EDIT_SETTINGS_STRING = void 0;
exports.ALLOW_EDIT_SETTINGS_STRING = `<button hx-swap-oob="true" hx-get="/api/light-mode-dark-mode" type="button" class="icon medium" aria-label="Light Mode / Dark Mode Toggle" id="light-mode-dark-mode" hx-target="#application-styles">
<svg focusable="false" inert viewBox="0 0 24 24">
  <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z">
  </path>
</svg>
</button>
<button id="open-settings-dialog-btn" hx-swap-oob="true" type="button" aria-label="Edit Settings" aria-haspopup="dialog" data-dialog="settings-dialog" class="icon medium">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Settings"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path></svg>
</button>`;
const getAllowSettingsString = (req) => {
    // const settings = req.session.settings || DEFAULT_SETTINGS;
    // const navbarColor = Boolean(settings.mode==="light")? settings.lightMode.navbarColor:settings.darkMode.navbarColor;
    // const themeColors = /*html*/`
    // <head hx-merge="true">
    // <meta name="theme-color" id="THEME_COLOR" content="${navbarColor}" hx-preserve="true" hx-swap-oob="true">
    // <meta name="msapplication-navbutton-color" id="THEME_COLOR_2" content="${navbarColor}" hx-preserve="true" hx-swap-oob="true">
    // <meta name="msapplication-TileColor" id="THEME_COLOR_3" content="${navbarColor}" hx-preserve="true" hx-swap-oob="true">
    // </head> 
    // `;
    return exports.ALLOW_EDIT_SETTINGS_STRING;
};
exports.getAllowSettingsString = getAllowSettingsString;
const getSuccessSnackbar = (str) => {
    return /*html*/ ` <div class="snackbar success" aria-hidden="false" role="alert" data-snacktime="4000">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Check"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
    <p class="p-sm">${str}</p>
    <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
    </button>
  </div> `;
};
exports.getSuccessSnackbar = getSuccessSnackbar;
const getErrorSnackbar = (str) => {
    return /*html*/ ` <div class="snackbar error" aria-hidden="false" role="alert" data-snacktime="4000">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
  <p class="p-sm">${str}</p>
  <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
  </button>
</div> `;
};
exports.getErrorSnackbar = getErrorSnackbar;
const getWarningSnackbar = (str) => {
    return /*html*/ ` <div class="snackbar warning" aria-hidden="false" role="alert" data-snacktime="4000">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
  <p class="p-sm">${str}</p>
  <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
  </button>
</div> `;
};
exports.getWarningSnackbar = getWarningSnackbar;
const getSuccessAlert = (str, svg, includeButton = true) => {
    return /*html*/ `
  <div class="alert icon success filled medium mt-1" role="alert">
    ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CheckSharp"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>`}
    <p class="alert">
      ${str}
    </p>
    ${includeButton ? `
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>` : ``}
    </div>
  `;
};
exports.getSuccessAlert = getSuccessAlert;
const getErrorAlert = (str, svg, includeButton = true) => {
    return /*html*/ `
    <div class="alert icon error filled medium mt-1" role="alert">
      ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>`}
      <p class="alert">
        ${str}
      </p>
      ${includeButton ? `
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>` : ``}
    </div>
  `;
};
exports.getErrorAlert = getErrorAlert;
const getInfoAlert = (str, svg, includeButton = true) => {
    return /*html*/ `
    <div class="alert icon info filled medium mt-1" role="alert">
      ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Info"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>`}
      <p class="alert">
        ${str}
      </p>
      ${includeButton ? `
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>` : ``}
    </div>
  `;
};
exports.getInfoAlert = getInfoAlert;
const getWarningAlert = (str, svg, includeButton = true) => {
    return /*html*/ `
    <div class="alert icon warning filled medium mt-1" role="alert">
      ${svg ? svg : `<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Warning"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>`}
      <p class="alert">
        ${str}
      </p>
      ${includeButton ? `
    <button aria-label="Close Alert" class="icon medium close-alert" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
    </button>` : ``}
    </div>
  `;
};
exports.getWarningAlert = getWarningAlert;
