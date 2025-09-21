"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiChatID = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const getAiChatID = () => {
    return 'chat_'.concat(node_crypto_1.default.randomUUID());
};
exports.getAiChatID = getAiChatID;
const DEFAULT_SETTINGS = {
    mode: 'light',
    disableDefaultTab: true,
    spellcheck: false,
    tabSize: 2,
    fontFamily: "Anuphan, sans-serif;",
    lightMode: {
        primary: '#004da3',
        secondary: '#9c27b0',
        warning: '#c54800',
        success: '#0f661d',
        info: '#00599d',
        error: '#b30019',
        buttonContrastText: '#FFFFFF',
        background: '#ffffff',
        secondaryBackground: '#dddddd',
        navbarColor: '#42A5F5',
        shadowColor: '#000000',
        textColor: '#000000'
    },
    darkMode: {
        primary: '#90caf9',
        secondary: '#ce93d8',
        warning: '#ffa726',
        success: '#66bb6a',
        info: '#29b6f6',
        error: '#f44336',
        buttonContrastText: '#000000',
        background: '#171717',
        secondaryBackground: '#3A3A3A',
        navbarColor: '#3A3A3A',
        shadowColor: '#FFFFFF',
        textColor: '#FFFFFF'
    },
    code_editor_theme: 'vscode',
    code_editor_emmet: true,
    desktop_application_size: 100,
    tablet_application_size: 100,
    mobile_application_size: 100,
    timezone: 'America/New_York',
    lang: 'en',
    settingsString: `html body, html body * {--background:#ffffff!important;--secondary-background:#dddddd!important;--text-primary:rgba(0,0,0,1)!important;--text-secondary:rgba(0,0,0,0.7)!important;--text-disabled:rgba(0,0,0,0.5)!important;--text-icon:rgba(0,0,0,5)!important;--text-divider:rgba(0,0,0,0.12)!important;--button-contrast-text:rgba(255,255,255,1)!important;--icon-hover:rgba(0,0,0,0.1)!important;--icon-focus:rgba(0,0,0,0.15)!important;--outlined-text-hover:rgba(200,229,252,0.08)!important;--shadow-button:0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--shadow-button-hover:0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--divider:rgba(0,0,0,0.12)!important;--select-button-hover:#b1c0d1!important;--background-image-alert:none!important;--primary-light:#80a6d1!important;--primary:#004da3!important;--primary-dark:#002e62!important;--secondary-light:#ce93d8!important;--secondary:#9c27b0!important;--secondary-dark: #5e176a!important;--secondary-hover: #e1bee7!important;--error-light:#d9808c!important;--error:#b30019!important;--error-dark: #6b000f!important;--error-alert-color: #1b0004!important;--error-alert-background:#e8b3ba!important;--warning-light:#e2a480!important;--warning:#c54800!important;--warning-dark:  #762b00!important;--warning-alert-color:#1e0b00!important;--warning-alert-background:#eec8b3!important;--info-light:#80acce!important;--info:#00599d!important;--info-dark: #00355e!important;--info-alert-color:#000d18!important;--info-alert-background:#b3cde2!important;--success-light: #87b38e!important;--success:#0f661d!important;--success-dark: #093d11!important;--success-alert-color:#020f04!important;--success-alert-background: #b7d1bb!important;--disabled:rgba(0,0,0,0.3)!important;--card-1-background: #f4f4f4!important;--card-1-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)!important;--card-2-background: #e9e9e9!important;--card-2-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--card-3-background:#dddddd!important;--card-3-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)!important;--card-3-hover-shadow:0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)!important;--card-3-hover-background: #c7c7c7!important;--kbd-color-background:#dddddd!important;--kbd-color-border: #000000!important;--kbd-color-text: #000000!important;--dialog-shadow: 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)!important;--chip: 0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--chip-hover: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--shadow-navbar: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--navbar-color:#42A5F5!important;} .pintura-editor, pintura-editor {--color-primary:#004da3;--color-primary-dark:#002e62;--color-primary-text:#FFFFFF;--color-secondary:#004da3;--color-secondary-dark:#5e176a;--color-focus:0,46,98;--color-error:179,0,25;--color-background:255,255,255;--color-foreground:0,0,0;--font-size: 1rem;--pattern-transparent: url(data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h4v4H0zm4 4h4v4H4z' fill='%23E5E5E5'/%3E%3C/svg%3E);}`,
    create_annotation: true,
    create_note: true,
    update_note: true,
    create_blog: true,
    update_blog: true,
    create_idea: true,
    update_idea: true,
    create_comment: true,
    create_jupyter_notebook: true,
    create_markdown_note: true,
    create_stream_consciousness: true,
    create_daily_reading: true,
    create_tex_note: true,
    create_link: true,
    create_quote: true,
    create_project: true,
    project_update: true,
    create_survey: true,
    create_goodreads: true,
    create_letterboxd: true,
    create_game: true,
    create_3d_design: true,
    create_electronics: true,
    include_autocomplete_suggestions: true,
    enable_ai_writer: true,
    ai_writer_temperature: 0.7,
    ai_writer_max_tokens: 100,
    ai_writer_model: 'google/gemini-flash-1.5-8b',
    enable_ai_coder: true,
    ai_coder_temperature: 0.7,
    ai_coder_max_tokens: 100,
    ai_coder_model: 'google/gemini-flash-1.5',
    ai_chat_id: (0, exports.getAiChatID)()
};
exports.default = DEFAULT_SETTINGS;
