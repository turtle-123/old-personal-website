"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSettingsInDatabase = exports.setSettingsAfterCookie = exports.updateSettingsInDatabase = exports.createIPSettingsInDatabase = exports.getNavbarColor = exports.getThemeColorsStyle = exports.getSettingsString = exports.blendRGBColors = exports.shadeRGBColor = exports.blendHexColors = exports.shadeHexColor = exports.resetThemeColors = exports.getSettingsForm = exports.lightModeDarkMode = exports.getSettingsAndForm = exports.settingsHandler = exports.getFillColor = exports.getStrokeColor = exports.CODER_MODEL_TO_NAME = exports.VALID_AI_CODERS_SET = exports.AVAILABLE_AI_CODER_MODELS = exports.VALID_AI_WRITERS_SET = exports.WRITER_MODEL_TO_NAME = exports.AVAILABLE_AI_WRITER_MODELS = exports.APPLICATION_LANGUAGES = void 0;
const DEFAULT_SETTINGS_1 = __importDefault(require("../../CONSTANTS/DEFAULT_SETTINGS"));
const color_convert_1 = __importDefault(require("color-convert"));
const getIpLocationAndCheckDbSettings_1 = require("../../MIDDLEWARE/getIpLocationAndCheckDbSettings");
const database_1 = __importDefault(require("../../database"));
const html_1 = require("../html");
const time_1 = require("../../utils/time");
const unique_names_generator_1 = require("unique-names-generator");
const image_1 = require("../../utils/image");
const aws_implementation_1 = require("../../aws/aws-implementation");
const crypto_1 = __importDefault(require("crypto"));
const set_1 = require("../../utils/set");
/**
 * View for rendering `<meta>` tags for theme colors and
 * the `<style id="theme-colors">` tag
 * Should be used when
 *
 * 1. Setting initial settings (don't want to hold up initial page load) or resetting the settings
 * 2. Changing the settings (changing the colors and such)
 * 3. Changing light mode / dark mode
 */
const settingsView = 'partials/settings';
/**
 * View for rendering the `<form id="settings-dialog-form">` form
 * Should be used when
 *
 * 1. On initial load
 * 2. resetting the theme
 */
const settingsFormView = 'forms/settings-form';
exports.APPLICATION_LANGUAGES = ['en', 'es'];
exports.AVAILABLE_AI_WRITER_MODELS = [
    { model: 'meta-llama/llama-3.2-1b-instruct', name: "Meta: Llama 3.1 1B Instruct" },
    { model: 'meta-llama/llama-3.2-3b-instruct', name: "Meta: Llama 3.2 3B Instruct" },
    { model: 'meta-llama/llama-3.1-8b-instruct', name: "Meta: Llama 3.1 8B Instruct" },
    { model: 'qwen/qwen-2.5-7b-instruct', name: "Qwen2.5 7B Instruct" },
    { model: 'mistralai/mistral-7b-instruct', name: "Mistral: Mistral 7B Instruct" },
    { model: 'google/gemma-2-9b-it', name: "Google: Gemma 2 9B" },
    { model: 'meta-llama/llama-3-8b-instruct', name: "Meta: Llama 8B Instruct" },
    { model: 'mistralai/ministral-3b', name: "Mistral: Ministral 3B" },
    { model: 'amazon/nova-micro-v1', name: "Amazon: Nova Micro 1.0" },
    { model: 'google/gemini-flash-1.5-8b', name: "Google: Gemini Flash 1.5 8B" },
    { model: 'mistralai/ministral-8b', name: "Mistral: Ministral 8B" },
    { model: 'google/gemini-2.0-flash-001', name: "Google: Gemini Flash 2.0" },
    { model: 'meta-llama/llama-3.3-70b-instruct', name: "Meta: Llama 3.3 70B Instruct" },
    { model: 'meta-llama/llama-3.1-70b-instruct', name: "Meta: Llama 3.3 70B Instruct" },
    { model: 'google/gemma-7b-it', name: "Google: Gemma 7B" },
    { model: 'openai/gpt-4o-mini-2024-07-18', name: "OpenAI: GPT-40-mini" },
    { model: 'meta-llama/llama-2-13b-chat', name: "Meta: Llama 2 13B Chat" },
    { model: 'anthropic/claude-3-haiku', name: "Anthropic: Claude 3 Haiku" },
    { model: 'openai/gpt-3.5-turbo', name: "OpenAI: GPT-3.5 Turbo" },
    { model: 'anthropic/claude-3.5-haiku', name: "Anthropic: Claude 3.5 Haiku" },
    { model: 'openai/o3-mini', name: "OpenAI: o3 Mini" },
    { model: 'openai/gpt-4o', name: "OpenAI: GPT-4o" },
];
exports.WRITER_MODEL_TO_NAME = {
    "meta-llama/llama-3.2-1b-instruct": "Meta: Llama 3.1 1B Instruct",
    "meta-llama/llama-3.2-3b-instruct": "Meta: Llama 3.2 3B Instruct",
    "meta-llama/llama-3.1-8b-instruct": "Meta: Llama 3.1 8B Instruct",
    "qwen/qwen-2.5-7b-instruct": "Qwen2.5 7B Instruct",
    "mistralai/mistral-7b-instruct": "Mistral: Mistral 7B Instruct",
    "google/gemma-2-9b-it": "Google: Gemma 2 9B",
    "meta-llama/llama-3-8b-instruct": "Meta: Llama 8B Instruct",
    "mistralai/ministral-3b": "Mistral: Ministral 3B",
    "amazon/nova-micro-v1": "Amazon: Nova Micro 1.0",
    "google/gemini-flash-1.5-8b": "Google: Gemini Flash 1.5 8B",
    "mistralai/ministral-8b": "Mistral: Ministral 8B",
    "google/gemini-2.0-flash-001": "Google: Gemini Flash 2.0",
    "meta-llama/llama-3.3-70b-instruct": "Meta: Llama 3.3 70B Instruct",
    "meta-llama/llama-3.1-70b-instruct": "Meta: Llama 3.3 70B Instruct",
    "google/gemma-7b-it": "Google: Gemma 7B",
    "openai/gpt-4o-mini-2024-07-18": "OpenAI: GPT-40-mini",
    "meta-llama/llama-2-13b-chat": "Meta: Llama 2 13B Chat",
    "anthropic/claude-3-haiku": "Anthropic: Claude 3 Haiku",
    "openai/gpt-3.5-turbo": "OpenAI: GPT-3.5 Turbo",
    "anthropic/claude-3.5-haiku": "Anthropic: Claude 3.5 Haiku",
    "openai/o3-mini": "OpenAI: o3 Mini",
    "openai/gpt-4o": "OpenAI: GPT-4o"
};
exports.VALID_AI_WRITERS_SET = new Set(exports.AVAILABLE_AI_WRITER_MODELS.map((obj) => obj.model));
exports.AVAILABLE_AI_CODER_MODELS = [
    { model: 'qwen/qwen-2.5-coder-32b-instruct', name: "Mistral: Codestral Mamba" },
    { model: 'google/gemini-flash-1.5', name: "Google: Gemini Flash 1.5" },
    { model: 'google/gemini-2.0-flash-001', name: "Google: Gemini Flash 2.0" },
    { model: 'meta-llama/llama-3.3-70b-instruct', name: "Meta: Llama 3.3 70B Instruct" },
    { model: 'openai/gpt-4o-mini', name: "OpenAI: GPT-4o-mini" },
    { model: 'mistralai/mistral-7b-instruct-v0.1', name: "Mistal: Mistral 7B Instruct v0.1" },
    { model: 'google/palm-2-chat-bison', name: "Google PaLM 2 Chat" },
];
exports.VALID_AI_CODERS_SET = new Set(exports.AVAILABLE_AI_CODER_MODELS.map((obj) => obj.model));
exports.CODER_MODEL_TO_NAME = {
    "qwen/qwen-2.5-coder-32b-instruct": "Qwen2.5 Coder 32B Instruct",
    "google/gemini-flash-1.5": "Google: Gemini Flash 1.5",
    "google/gemini-2.0-flash-001": "Google: Gemini Flash 2.0",
    "meta-llama/llama-3.3-70b-instruct": "Meta: Llama 3.3 70B Instruct",
    "openai/gpt-4o-mini": "OpenAI: GPT-4o-mini",
    "mistralai/mistral-7b-instruct-v0.1": "Mistal: Mistral 7B Instruct v0.1",
    "google/palm-2-chat-bison": "Google PaLM 2 Chat"
};
/**
 * Included this function for standardization
 *
 * **Note**:
 *
 * @param s String that contains the innerHTML for the `<style id="theme-colors">` tag that allows for customization of theme
 * @returns {string}
 */
const getThemeColorsStyle = (s) => `<style id="theme-colors">${s}</style>`;
exports.getThemeColorsStyle = getThemeColorsStyle;
/**
 * ### POST: /api/settings
 *
 * - Handles a change to the settings.
 * - Receives the `<form id="settings-dialog-form">`
 * - Should change settings in cache and database and respond by changing the theme-colors
 * and `<style id="theme-colors">` of the application
 * @param req Request Object
 * @param res Response Object
 */
function settingsHandler(req, res) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        var tabSize;
        const disableDefaultTab = Boolean(req.body['disabled-default-tab'] !== undefined);
        const spellcheck = Boolean(req.body['spellcheck-settings'] !== undefined);
        const tempLang = req.body['application-language'];
        const lang = (new Set(exports.APPLICATION_LANGUAGES).has(tempLang)) ? tempLang : 'en';
        const tempSettingsTimezone = req.body['settings-timezone'];
        const timezone = (new Set(time_1.TIME_ZONES_AVAILABLE).has(tempSettingsTimezone)) ? tempSettingsTimezone : 'America/New_York';
        if (((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) === true) {
            const applicationSizeStr = req.body['desktop-font-size'];
            if (applicationSizeStr) {
                const applicationSize = parseInt(applicationSizeStr);
                if (!!!isNaN(applicationSize) && isFinite(applicationSize)) {
                    if (req.session.settings) {
                        req.session.settings.desktop_application_size = Math.max(Math.min(120, applicationSize), 80);
                    }
                }
            }
        }
        else if (((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) === true) {
            const applicationSizeStr = req.body['tablet-font-size'];
            if (applicationSizeStr) {
                const applicationSize = parseInt(applicationSizeStr);
                if (!!!isNaN(applicationSize) && isFinite(applicationSize)) {
                    if (req.session.settings) {
                        req.session.settings.tablet_application_size = Math.max(Math.min(120, applicationSize), 80);
                    }
                }
            }
        }
        else {
            const applicationSizeStr = req.body['mobile-font-size'];
            if (applicationSizeStr) {
                const applicationSize = parseInt(applicationSizeStr);
                if (!!!isNaN(applicationSize) && isFinite(applicationSize)) {
                    if (req.session.settings) {
                        req.session.settings.mobile_application_size = Math.max(Math.min(120, applicationSize), 80);
                    }
                }
            }
        }
        if (disableDefaultTab) {
            const tabSizeInitial = Number(req.body['tab-indent-size']);
            tabSize = (typeof tabSizeInitial !== 'number') ? 2 : Math.min(Math.max(1, tabSizeInitial), 12);
        }
        const fontFamilyInitial = req.body['font-family-settings'];
        const fontFamily = "Anuphan, sans-serif;";
        const codeMirrorTheme = String(req.body['code-editor-theme-main']);
        const newCodeMirrorTheme = getIpLocationAndCheckDbSettings_1.VALID_CODEMIRROR_THEMES.has(codeMirrorTheme) ? codeMirrorTheme : 'vscode';
        const codeMirrorEmmet = Boolean(req.body['codemirror_emmet'] !== undefined);
        const { lightMode, darkMode } = extractSettings(req);
        const create_annotation = req.body["create_annotation"];
        const create_note = req.body["create_note"];
        const update_note = req.body["update_note"];
        const create_blog = req.body["create_blog"];
        const update_blog = req.body["update_blog"];
        const create_idea = req.body["create_idea"];
        const update_idea = req.body["update_idea"];
        const create_comment = req.body["create_comment"];
        const create_jupyter_notebook = req.body["create_jupyter_notebook"];
        const create_markdown_note = req.body["create_markdown_note"];
        const create_stream_consciousness = req.body["create_stream_consciousness"];
        const create_daily_reading = req.body["create_daily_reading"];
        const create_tex_note = req.body["create_tex_note"];
        const create_link = req.body["create_link"];
        const create_quote = req.body["create_quote"];
        const create_project = req.body["create_project"];
        const project_update = req.body["project_update"];
        const create_survey = req.body['create_survey'];
        const create_goodreads = req.body['create_goodreads'];
        const create_letterboxd = req.body['create_letterboxd'];
        const create_game = req.body['create_game'];
        const create_3d_design = req.body['create_3d_design'];
        const create_electronics = req.body['create_electronics'];
        const include_autocomplete_suggestions = req.body['include-autocomplete-suggestions'] === "on";
        const enable_ai_writer = req.body['enable-ai-writer'] === "on";
        const enable_ai_coder = req.body['enable-ai-coder'] === "on";
        const coder_temperature = parseFloat(req.body['ai-coder-temperature']);
        const coder_max_tokens = parseInt(req.body['ai-coder-max-tokens']);
        const writer_temperature = parseFloat(req.body['ai-writer-temperature']);
        const writer_max_tokens = parseInt(req.body['ai-writer-max-tokens']);
        const ai_writer_model = req.body['ai-writer-model-input'];
        const ai_coder_model = req.body['ai-coder-model-input'];
        if (req.session.settings) {
            req.session.settings.spellcheck = spellcheck;
            req.session.settings.disableDefaultTab = disableDefaultTab;
            req.session.settings.fontFamily = fontFamily;
            req.session.settings.lang = lang;
            req.session.settings.timezone = timezone;
            if (tabSize) {
                req.session.settings.tabSize = tabSize;
            }
            req.session.settings.lightMode = lightMode;
            req.session.settings.darkMode = darkMode;
            req.session.settings.code_editor_theme = newCodeMirrorTheme;
            req.session.settings.code_editor_emmet = codeMirrorEmmet;
            req.session.settings.create_annotation = Boolean(create_annotation === "on");
            req.session.settings.create_note = Boolean(create_note === "on");
            req.session.settings.update_note = Boolean(update_note === "on");
            req.session.settings.create_blog = Boolean(create_blog === "on");
            req.session.settings.update_blog = Boolean(update_blog === "on");
            req.session.settings.create_idea = Boolean(create_idea === "on");
            req.session.settings.update_idea = Boolean(update_idea === "on");
            req.session.settings.create_comment = Boolean(create_comment === "on");
            req.session.settings.create_jupyter_notebook = Boolean(create_jupyter_notebook === "on");
            req.session.settings.create_markdown_note = Boolean(create_markdown_note === "on");
            req.session.settings.create_stream_consciousness = Boolean(create_stream_consciousness === "on");
            req.session.settings.create_daily_reading = Boolean(create_daily_reading === "on");
            req.session.settings.create_tex_note = Boolean(create_tex_note === "on");
            req.session.settings.create_link = Boolean(create_link === "on");
            req.session.settings.create_quote = Boolean(create_quote === "on");
            req.session.settings.create_project = Boolean(create_project === "on");
            req.session.settings.project_update = Boolean(project_update === "on");
            req.session.settings.create_survey = Boolean(create_survey === "on");
            req.session.settings.create_goodreads = Boolean(create_goodreads === "on");
            req.session.settings.create_letterboxd = Boolean(create_letterboxd === "on");
            req.session.settings.create_game = Boolean(create_game === "on");
            req.session.settings.create_3d_design = Boolean(create_3d_design === "on");
            req.session.settings.create_electronics = Boolean(create_electronics === "on");
            req.session.settings.include_autocomplete_suggestions = include_autocomplete_suggestions;
            req.session.settings.enable_ai_coder = enable_ai_coder;
            req.session.settings.enable_ai_writer = enable_ai_writer;
            req.session.settings.ai_coder_max_tokens = Math.min(Math.max(10, writer_temperature), 1000);
            req.session.settings.ai_writer_max_tokens = Math.min(Math.max(10, writer_max_tokens), 1000);
            req.session.settings.ai_writer_temperature = Math.min(Math.max(0, coder_max_tokens), 1);
            req.session.settings.ai_coder_temperature = Math.min(Math.max(0, coder_temperature), 1);
            req.session.settings.ai_coder_model = (0, set_1.isMemberOf)(ai_coder_model, exports.VALID_AI_CODERS_SET) ? ai_coder_model : DEFAULT_SETTINGS_1.default.ai_coder_model;
            req.session.settings.ai_writer_model = (0, set_1.isMemberOf)(ai_writer_model, exports.VALID_AI_WRITERS_SET) ? ai_writer_model : DEFAULT_SETTINGS_1.default.ai_writer_model;
            const settingsStr = getSettingsString(req.session.settings, req.session.settings.mode);
            req.session.settings.settingsString = settingsStr;
            const themeColorsStyle = getThemeColorsStyle(settingsStr);
            const renderObject = {
                layout: false,
                getSettingsForm: false,
                navbarColor: getNavbarColor((_c = req.session) === null || _c === void 0 ? void 0 : _c.settings),
                themeColorsStyle,
                strokeColor: (0, exports.getStrokeColor)(req.session.settings),
                fillColor: (0, exports.getFillColor)(req.session.settings),
                create_ip_address_row: false,
                mode: req.session.settings.mode,
                preferencesCookie: Boolean(((_d = req.session.cookiePreferences) === null || _d === void 0 ? void 0 : _d.preferences) === true),
                showedBanner: Boolean(((_e = req.session.cookiePreferences) === null || _e === void 0 ? void 0 : _e.showedBanner) === true),
                ip_id: req.session.ip_id
            };
            return res.status(200).render(settingsView, renderObject);
        }
        else
            throw new Error('Settings should be defined.');
    }
    catch (error) {
        const renderObject = {
            layout: false,
            getSettingsForm: false,
            navbarColor: getNavbarColor((_f = req.session) === null || _f === void 0 ? void 0 : _f.settings),
            themeColorsStyle: getThemeColorsStyle(DEFAULT_SETTINGS_1.default.settingsString),
            strokeColor: (0, exports.getStrokeColor)(req.session.settings),
            fillColor: (0, exports.getFillColor)(req.session.settings),
            create_ip_address_row: false,
            mode: ((_h = (_g = req === null || req === void 0 ? void 0 : req.session) === null || _g === void 0 ? void 0 : _g.settings) === null || _h === void 0 ? void 0 : _h.mode) || 'light',
            preferencesCookie: Boolean(((_j = req.session.cookiePreferences) === null || _j === void 0 ? void 0 : _j.preferences) === true),
            showedBanner: Boolean(((_k = req.session.cookiePreferences) === null || _k === void 0 ? void 0 : _k.showedBanner) === true),
            ip_id: req.session.ip_id
        };
        return res.status(200).render(settingsView, renderObject);
    }
}
exports.settingsHandler = settingsHandler;
/**
 * ### GET: /api/get-settings-and-form
 * Do not delay user initial load by getting their settings from the database
 * (if they are not currently in a session)
 *
 * - Instead, send the initial page back to the user and get the initial settings from a hidden
 * span#get-initial-settings element which calls this api route
 * - This api route should return a <style> element that configures the css variables for an application,
 * a head element which changes the theme-color of the application and a hidden span#get-initial-settings-form
 * that requests the initial settings form for the application.
 * - This should return the same thing as the settings handler, except for getting the form
 *
 */
function getSettingsAndForm(req, res) {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (!!!req.session.settings)
            req.session.settings = DEFAULT_SETTINGS_1.default;
        const settingsStr = getSettingsString(req.session.settings, req.session.settings.mode);
        const themeColorsStyle = getThemeColorsStyle(settingsStr);
        const create_ip_address_row = Boolean(((_a = req.session.cookiePreferences) === null || _a === void 0 ? void 0 : _a.preferences) === true &&
            ((_b = req.session.cookiePreferences) === null || _b === void 0 ? void 0 : _b.showedBanner) === true &&
            req.session.create_ip_address_row === true);
        const renderObject = {
            layout: false,
            getSettingsForm: true,
            navbarColor: getNavbarColor(req.session.settings),
            themeColorsStyle,
            strokeColor: (0, exports.getStrokeColor)(req.session.settings),
            fillColor: (0, exports.getFillColor)(req.session.settings),
            create_ip_address_row,
            mode: ((_d = (_c = req.session) === null || _c === void 0 ? void 0 : _c.settings) === null || _d === void 0 ? void 0 : _d.mode) || 'light',
            preferencesCookie: Boolean(((_e = req.session.cookiePreferences) === null || _e === void 0 ? void 0 : _e.preferences) === true),
            showedBanner: Boolean(((_f = req.session.cookiePreferences) === null || _f === void 0 ? void 0 : _f.showedBanner) === true),
            ip_id: Number(req.session.ip_id)
        };
        return res.status(200).render(settingsView, renderObject);
    }
    catch (error) {
        console.error(error);
        return res.status(500).send(error);
    }
}
exports.getSettingsAndForm = getSettingsAndForm;
/**
 * - Returns the settings form.
 * - Should be called:
 *
 * 1. On initial load
 * 2. After the settings are reset
 * @param req Request
 * @param res Response
 * @returns
 */
function getSettingsForm(req, res) {
    var _a, _b, _c, _d;
    const renderObject = {
        layout: false,
        settings: ((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.settings) || DEFAULT_SETTINGS_1.default,
        desktop: Boolean(((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.desktop) === true),
        ai_writer_model_name: exports.WRITER_MODEL_TO_NAME[((_c = req.session.settings) === null || _c === void 0 ? void 0 : _c.ai_writer_model) || 'google/gemini-flash-1.5-8b'],
        ai_coder_model_name: exports.CODER_MODEL_TO_NAME[((_d = req.session.settings) === null || _d === void 0 ? void 0 : _d.ai_coder_model) || 'google/gemini-flash-1.5']
    };
    return res.status(200).render(settingsFormView, renderObject);
}
exports.getSettingsForm = getSettingsForm;
/**
 * - Change the light mode / dark mode state of the application.
 * - The button that initiates this request is the light mode dark mode button in the navbar
 * - Should change the theme-color of the application
 * - Target should be the aria-hidden div#application-styles
 * @param req Request
 * @param res Response
 * @returns
 */
function lightModeDarkMode(req, res) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const renderObject = {
        layout: false,
        getSettingsForm: false,
        navbarColor: DEFAULT_SETTINGS_1.default.darkMode.navbarColor,
        themeColorsStyle: getThemeColorsStyle(DEFAULT_SETTINGS_1.default.settingsString),
        strokeColor: (0, exports.getStrokeColor)(req.session.settings),
        fillColor: (0, exports.getFillColor)(req.session.settings),
        create_ip_address_row: false,
        mode: ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mode) || 'light',
        preferencesCookie: Boolean(((_c = req.session.cookiePreferences) === null || _c === void 0 ? void 0 : _c.preferences) === true),
        showedBanner: Boolean(((_d = req.session.cookiePreferences) === null || _d === void 0 ? void 0 : _d.showedBanner) === true),
        ip_id: req.session.ip_id
    };
    try {
        if (((_f = (_e = req === null || req === void 0 ? void 0 : req.session) === null || _e === void 0 ? void 0 : _e.settings) === null || _f === void 0 ? void 0 : _f.mode) === "light") {
            req.session.settings.mode = "dark";
        }
        else if (((_h = (_g = req === null || req === void 0 ? void 0 : req.session) === null || _g === void 0 ? void 0 : _g.settings) === null || _h === void 0 ? void 0 : _h.mode) === "dark") {
            req.session.settings.mode = "light";
        }
        if (req.session.settings) {
            renderObject.navbarColor = getNavbarColor(req.session.settings);
            renderObject.strokeColor = (0, exports.getStrokeColor)(req.session.settings);
            renderObject.fillColor = (0, exports.getFillColor)(req.session.settings);
            renderObject.mode = req.session.settings.mode;
            const settingStr = getSettingsString(req.session.settings, req.session.settings.mode);
            req.session.settings.settingsString = settingStr;
            renderObject.themeColorsStyle = getThemeColorsStyle(settingStr);
        }
        else
            throw new Error('Settings not set.');
        return res.status(200).render(settingsView, renderObject);
    }
    catch (error) {
        return res.status(200).render(settingsView, renderObject);
    }
}
exports.lightModeDarkMode = lightModeDarkMode;
/**
 * Call after clicking and confirming the reset-theme-colors button
 * Return settings string and set initial=true so that the settings-form is reset
 * @param req Request
 * @param res Response
 */
function resetThemeColors(req, res) {
    var _a, _b, _c, _d;
    const renderObject = {
        layout: false,
        getSettingsForm: true,
        navbarColor: getNavbarColor(DEFAULT_SETTINGS_1.default),
        themeColorsStyle: getThemeColorsStyle(DEFAULT_SETTINGS_1.default.settingsString),
        strokeColor: (0, exports.getStrokeColor)(req.session.settings),
        fillColor: (0, exports.getFillColor)(req.session.settings),
        create_ip_address_row: false,
        mode: ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.settings) === null || _b === void 0 ? void 0 : _b.mode) || 'light',
        preferencesCookie: Boolean(((_c = req.session.cookiePreferences) === null || _c === void 0 ? void 0 : _c.preferences) === true),
        showedBanner: Boolean(((_d = req.session.cookiePreferences) === null || _d === void 0 ? void 0 : _d.showedBanner) === true),
        ip_id: req.session.ip_id
    };
    try {
        if (req.session.settings) {
            var modeKey = 'darkMode';
            if (req.session.settings.mode === "light")
                modeKey = "lightMode";
            else
                modeKey = "darkMode";
            const keys = Object.keys(req.session.settings[modeKey]);
            keys.forEach((key) => {
                req.session.settings[modeKey][key] = DEFAULT_SETTINGS_1.default[modeKey][key];
            });
            const settingsStr = getSettingsString(req.session.settings, req.session.settings.mode);
            renderObject.navbarColor = getNavbarColor(req.session.settings);
            renderObject.themeColorsStyle = getThemeColorsStyle(settingsStr);
            renderObject.strokeColor = (0, exports.getStrokeColor)(req.session.settings);
            renderObject.fillColor = (0, exports.getFillColor)(req.session.settings);
            renderObject.mode = req.session.settings.mode;
            return res.status(200).render(settingsView, renderObject);
        }
        else
            throw new Error('Settings should be defined');
    }
    catch (error) {
        return res.status(200).render(settingsView, renderObject);
    }
}
exports.resetThemeColors = resetThemeColors;
/**
 * This function should be called if we know the settings preferred for this ip address and if
 * the user has accepted preferences cookies
 */
function setSettingsAfterCookie(req, res) {
    var _a, _b, _c, _d, _e;
    const renderObject = {
        layout: false,
        getSettingsForm: true,
        navbarColor: getNavbarColor(req.session.settings),
        themeColorsStyle: getThemeColorsStyle(((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.settingsString) || DEFAULT_SETTINGS_1.default.settingsString),
        strokeColor: (0, exports.getStrokeColor)(req.session.settings),
        fillColor: (0, exports.getFillColor)(req.session.settings),
        create_ip_address_row: false,
        mode: ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.settings) === null || _c === void 0 ? void 0 : _c.mode) || 'light',
        preferencesCookie: Boolean(((_d = req.session.cookiePreferences) === null || _d === void 0 ? void 0 : _d.preferences) === true),
        showedBanner: Boolean(((_e = req.session.cookiePreferences) === null || _e === void 0 ? void 0 : _e.showedBanner) === true),
        ip_id: req.session.ip_id
    };
    return res.status(200).render(settingsView, renderObject);
}
exports.setSettingsAfterCookie = setSettingsAfterCookie;
/* --------------------------------------------- Utilities Start ------------------------------------ */
/**
 * Function to extract theme colors object from settings dialog input form
 * @param req Request
 */
function extractSettings(req) {
    const VALID_HEX_REGEX = /^#([0-9a-f]{3}){1,2}$/i;
    const lightMode = structuredClone(DEFAULT_SETTINGS_1.default.lightMode);
    const darkMode = structuredClone(DEFAULT_SETTINGS_1.default.darkMode);
    const keys = [
        "primary",
        "secondary",
        "warning",
        "success",
        "info",
        "error",
        "buttonContrastText",
        "background",
        "secondaryBackground",
        "navbarColor",
        "shadowColor",
        "textColor"
    ];
    keys.forEach((key) => {
        if (VALID_HEX_REGEX.test(String(req.body[`${key}-light-settings-color`])))
            lightMode[key] = req.body[`${key}-light-settings-color`];
        if (VALID_HEX_REGEX.test(String(req.body[`${key}-dark-settings-color`])))
            darkMode[key] = req.body[`${key}-dark-settings-color`];
    });
    return { lightMode, darkMode };
}
/**
 * [Reference](https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin)
 * @param color
 * @param percent
 * @returns
 */
function shadeHexColor(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}
exports.shadeHexColor = shadeHexColor;
/**
 * [Reference](https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin)
 * @param color
 * @param percent
 * @returns
 */
function blendHexColors(c0, c1, p) {
    var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
}
exports.blendHexColors = blendHexColors;
/**
 * [Reference](https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin)
 * @param color
 * @param percent
 * @returns
 */
function shadeRGBColor(color, percent) {
    var f = color.split(","), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = parseInt(f[0].slice(4)), G = parseInt(f[1]), B = parseInt(f[2]);
    return "rgb(" + (Math.round((t - R) * p) + R) + "," + (Math.round((t - G) * p) + G) + "," + (Math.round((t - B) * p) + B) + ")";
}
exports.shadeRGBColor = shadeRGBColor;
/**
 * [Reference](https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin)
 * @param color
 * @param percent
 * @returns
 */
function blendRGBColors(c0, c1, p) {
    var f = c0.split(","), t = c1.split(","), R = parseInt(f[0].slice(4)), G = parseInt(f[1]), B = parseInt(f[2]);
    return "rgb(" + (Math.round((parseInt(t[0].slice(4)) - R) * p) + R) + "," + (Math.round((parseInt(t[1]) - G) * p) + G) + "," + (Math.round((parseInt(t[2]) - B) * p) + B) + ")";
}
exports.blendRGBColors = blendRGBColors;
const shad = (rgb, opacity) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
const getSettingsString = (settings, mode, pintura = true) => {
    const settingsKey = (mode === 'light') ? 'lightMode' : 'darkMode';
    var str = `html body, html body * {--font-family:${settings.fontFamily.slice(0, settings.fontFamily.length - 1)}!important;`;
    str += `--background:${settings[settingsKey].background}!important;`;
    str += `--secondary-background:${settings[settingsKey].secondaryBackground}!important;`;
    // text color  
    const t = color_convert_1.default.hex.rgb(settings[settingsKey].textColor.slice(1));
    str += `--text-primary:${shad(t, 1)}!important;`;
    str += `--text-secondary:${shad(t, 0.7)}!important;`;
    str += `--text-disabled:${shad(t, 0.5)}!important;`;
    str += `--text-icon:${shad(t, 5)}!important;`;
    str += `--text-divider:${shad(t, 0.12)}!important;`;
    // button contrast text  
    const bct = color_convert_1.default.hex.rgb(settings[settingsKey].buttonContrastText.slice(1));
    str += `--button-contrast-text:${shad(bct, 1)}!important;`;
    str += `--icon-hover:${shad(t, 0.1)}!important;`;
    str += `--icon-focus:${shad(t, 0.15)}!important;`;
    // blend primary and text-color by 0.5 and give opacity of 0.08
    str += `--outlined-text-hover:${shad(color_convert_1.default.hex.rgb(blendHexColors('#ce93d8', '#FFFFFF', 0.5).slice(1)), 0.08)}!important;`;
    // Shadow Color  
    const s = color_convert_1.default.hex.rgb(settings[settingsKey].shadowColor.slice(1));
    str += `--shadow-button:0px 3px 5px -1px ${shad(s, 0.2)},0px 6px 10px 0px ${shad(s, 0.14)},0px 1px 18px 0px ${shad(s, 0.12)}!important;`;
    str += `--shadow-button-hover:0px 3px 5px -1px ${shad(s, 0.2)},0px 6px 10px 0px ${shad(s, 0.14)},0px 1px 18px 0px ${shad(s, 0.12)}!important;`;
    str += `--divider:${shad(t, 0.12)}!important;`;
    // blend primary and secondary background
    str += `--select-button-hover:${blendHexColors(settings[settingsKey].secondaryBackground, settings[settingsKey].primary, 0.2)}!important;`;
    str += `--background-image-alert:none!important;`;
    str += `--primary-light:${shadeHexColor(settings[settingsKey].primary, 0.5)}!important;`;
    str += `--primary:${settings[settingsKey].primary}!important;`;
    const primaryDark = shadeHexColor(settings[settingsKey].primary, -0.4);
    str += `--primary-dark:${primaryDark}!important;`;
    str += `--secondary-light:${shadeHexColor(settings[settingsKey].secondary, 0.5)}!important;`;
    str += `--secondary:${settings[settingsKey].secondary}!important;`;
    const secondaryDark = shadeHexColor(settings[settingsKey].secondary, -0.4);
    str += `--secondary-dark: ${secondaryDark}!important;`;
    str += `--secondary-hover: ${blendHexColors(settings[settingsKey].background, settings[settingsKey].secondary, 0.3)}!important;`;
    str += `--error-light:${shadeHexColor(settings[settingsKey].error, 0.5)}!important;`;
    str += `--error:${settings[settingsKey].error}!important;`;
    str += `--error-dark: ${shadeHexColor(settings[settingsKey].error, -0.4)}!important;`;
    str += `--error-alert-color: ${blendHexColors(settings[settingsKey].textColor, settings[settingsKey].error, 0.15)}!important;`;
    str += `--error-alert-background:${blendHexColors(settings[settingsKey].error, settings[settingsKey].background, 0.7)}!important;`;
    str += `--warning-light:${shadeHexColor(settings[settingsKey].warning, 0.5)}!important;`;
    str += `--warning:${settings[settingsKey].warning}!important;`;
    str += `--warning-dark:  ${shadeHexColor(settings[settingsKey].warning, -0.4)}!important;`;
    str += `--warning-alert-color:${blendHexColors(settings[settingsKey].textColor, settings[settingsKey].warning, 0.15)}!important;`;
    str += `--warning-alert-background:${blendHexColors(settings[settingsKey].warning, settings[settingsKey].background, 0.7)}!important;`;
    str += `--info-light:${shadeHexColor(settings[settingsKey].info, 0.5)}!important;`;
    str += `--info:${settings[settingsKey].info}!important;`;
    str += `--info-dark: ${shadeHexColor(settings[settingsKey].info, -0.4)}!important;`;
    str += `--info-alert-color:${blendHexColors(settings[settingsKey].textColor, settings[settingsKey].info, 0.15)}!important;`;
    str += `--info-alert-background:${blendHexColors(settings[settingsKey].info, settings[settingsKey].background, 0.7)}!important;`;
    str += `--success-light: ${shadeHexColor(settings[settingsKey].success, 0.5)}!important;`;
    str += `--success:${settings[settingsKey].success}!important;`;
    str += `--success-dark: ${shadeHexColor(settings[settingsKey].success, -0.4)}!important;`;
    str += `--success-alert-color:${blendHexColors(settings[settingsKey].textColor, settings[settingsKey].success, 0.15)}!important;`;
    str += `--success-alert-background: ${blendHexColors(settings[settingsKey].success, settings[settingsKey].background, 0.7)}!important;`;
    str += `--disabled:${shad(t, 0.3)}!important;`;
    str += `--card-1-background: ${blendHexColors(settings[settingsKey].background, settings[settingsKey].secondaryBackground, 0.33)}!important;`;
    str += `--card-1-shadow: 0px 2px 1px -1px ${shad(s, 0.2)},0px 1px 1px 0px ${shad(s, 0.14)},0px 1px 3px 0px ${shad(s, 0.12)}!important;`;
    str += `--card-2-background: ${blendHexColors(settings[settingsKey].background, settings[settingsKey].secondaryBackground, 0.66)}!important;`;
    str += `--card-2-shadow: 0px 3px 3px -2px ${shad(s, 0.2)},0px 3px 4px 0px ${shad(s, 0.14)},0px 1px 8px 0px ${shad(s, 0.12)}!important;`;
    str += `--card-3-background:${settings[settingsKey].secondaryBackground}!important;`;
    str += `--card-3-shadow: 0px 3px 5px -1px ${shad(s, 0.2)}, 0px 6px 10px 0px ${shad(s, 0.14)}, 0px 1px 18px 0px ${shad(s, 0.12)}!important;`;
    str += `--card-3-hover-shadow:0px 8px 10px -5px ${shad(s, 0.2)},0px 16px 24px 2px ${shad(s, 0.14)},0px 6px 30px 5px ${shad(s, 0.12)}!important;`;
    str += `--card-3-hover-background: ${blendHexColors(settings[settingsKey].secondaryBackground, settings[settingsKey].textColor, 0.1)}!important;`;
    str += `--kbd-color-background:${settings[settingsKey].secondaryBackground}!important;`;
    // shade text color by -0.15
    str += `--kbd-color-border: ${shadeHexColor(settings[settingsKey].textColor, -0.15)}!important;`;
    str += `--kbd-color-text: ${settings[settingsKey].textColor}!important;`;
    str += `--dialog-shadow: 0px 11px 15px -7px ${shad(s, 0.2)},0px 24px 38px 3px ${shad(s, 0.14)},0px 9px 46px 8px ${shad(s, 0.12)}!important;`;
    str += `--chip: 0px 3px 5px -1px ${shad(s, 0.2)},0px 6px 10px 0px ${shad(s, 0.14)},0px 1px 18px 0px ${shad(s, 0.12)}!important;`;
    str += `--chip-hover: 0px 3px 3px -2px ${shad(s, 0.2)},0px 3px 4px 0px ${shad(s, 0.14)},0px 1px 8px 0px ${shad(s, 0.12)}!important;`;
    str += `--shadow-navbar: 0px 3px 3px -2px ${shad(s, 0.2)},0px 3px 4px 0px ${shad(s, 0.14)},0px 1px 8px 0px ${shad(s, 0.12)}!important;`;
    str += `--navbar-color:${settings[settingsKey].navbarColor}!important;`;
    str += '} ';
    if (pintura) { // pintura
        str += '.pintura-editor, pintura-editor {';
        str += `--color-primary:${settings[settingsKey].primary};`;
        str += `--color-primary-dark:${primaryDark};`;
        str += `--color-primary-text:${settings[settingsKey].buttonContrastText};`;
        str += `--color-secondary:${settings[settingsKey].primary};`;
        str += `--color-secondary-dark:${secondaryDark};`;
        const primaryDarkRGB = color_convert_1.default.hex.rgb(primaryDark.slice(1));
        str += `--color-focus:${primaryDarkRGB[0]},${primaryDarkRGB[1]},${primaryDarkRGB[2]};`;
        const errorRGB = color_convert_1.default.hex.rgb(settings[settingsKey].error.slice(1));
        str += `--color-error:${errorRGB[0]},${errorRGB[1]},${errorRGB[2]};`;
        const foregroundRGB = color_convert_1.default.hex.rgb(settings[settingsKey].background.slice(1));
        str += `--color-background:${foregroundRGB[0]},${foregroundRGB[1]},${foregroundRGB[2]};`;
        str += `--color-foreground:${t[0]},${t[1]},${t[2]};`;
        str += `--font-size: 1rem;`;
        str += `--pattern-transparent: url(data:image/svg+xml;charset=utf-8,%3Csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h4v4H0zm4 4h4v4H4z' fill='%23E5E5E5'/%3E%3C/svg%3E);`;
        str += '}';
    }
    return str;
};
exports.getSettingsString = getSettingsString;
/**
 * Function included here to only write once
 * @param settings
 * @returns
 */
const getNavbarColor = (settings) => {
    if (settings) {
        if (settings.mode === "light")
            return settings.lightMode.navbarColor;
        else
            return settings.darkMode.navbarColor;
    }
    else {
        return DEFAULT_SETTINGS_1.default.darkMode.navbarColor;
    }
};
exports.getNavbarColor = getNavbarColor;
/**
 * Get the stroke color for google maps geographies
 * Function included here to only write once
 * @param settings
 * @returns
 */
const getStrokeColor = (settings) => {
    if (settings) {
        if (settings.mode === "light")
            return shadeHexColor(settings.lightMode.secondary, -0.4);
        else
            return shadeHexColor(settings.darkMode.secondary, -0.4);
    }
    else {
        return shadeHexColor(DEFAULT_SETTINGS_1.default.darkMode.secondary, -0.4);
    }
};
exports.getStrokeColor = getStrokeColor;
/**
 * Get the fill color for google maps geographies
 * google maps geographies
 * @param settings
 * @returns
 */
const getFillColor = (settings) => {
    if (settings) {
        if (settings.mode === "light")
            return settings.lightMode.secondary;
        else
            return settings.darkMode.secondary;
    }
    else {
        return DEFAULT_SETTINGS_1.default.darkMode.secondary;
    }
};
exports.getFillColor = getFillColor;
/* --------------------------------------------- Utilities End ------------------------------------ */
/*-------------------------------------------- Touching Postgres ------------------------------------ */
/**
 * - Called in `partials/settings.ejs`
 * - Call this api route when you encounter an ip address for the first time and
 * need to set it up in the database
 * - If this is the case, there should be a stringified json object in
 * `req.session.device.temp` and `req.session.ip_location.temp` that you can use to
 * set up the tables for ip_device and ip_location. You should use the information in cache
 * to set up the ip_info table and ip_settings table
 *
 * @param req
 * @param res
 */
async function createIPSettingsInDatabase(req, res) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (req.session.ip_id !== undefined)
        return res.status(200).send(`<span hidden hx-get="/api/save-settings" hx-swap="outerHTML" hx-trigger="load delay:100ms"></span>`);
    if (req.session.creating_ip_address_row === true)
        return res.status(200).send(`<span hidden hx-get="/api/save-settings" hx-swap="outerHTML" hx-trigger="load delay:100ms"></span>`);
    req.session.creating_ip_address_row = true;
    try {
        if (((_a = req.session.ip_location) === null || _a === void 0 ? void 0 : _a.temp) && ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.temp) && req.session.ip && req.session.settings) {
            const ip_info = { ip_address: String((_c = req.session.ip) === null || _c === void 0 ? void 0 : _c.address), ip_address_type: Number((_e = (_d = req.session) === null || _d === void 0 ? void 0 : _d.ip) === null || _e === void 0 ? void 0 : _e.type) };
            const tempDeviceObject = JSON.parse(String((_f = req.session.device) === null || _f === void 0 ? void 0 : _f.temp));
            const settings = req.session.settings;
            const tempIPLocationObject = JSON.parse(String((_g = req.session.ip_location) === null || _g === void 0 ? void 0 : _g.temp));
            const randomName = (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.colors, unique_names_generator_1.animals] });
            const profile_picture = await (0, image_1.createDefaultProfilePicture)(randomName);
            const key = 'frankmbrown/'.concat(crypto_1.default.randomUUID()).concat('.jpg');
            const url = await (0, aws_implementation_1.uploadImageObject)(key, profile_picture.buffer, 'jpg', {}, 3, 25);
            const query = `SELECT * FROM create_ip_settings_rows($1::TEXT,$2::integer,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54,$55,$56,$57,$58,$59,$60,$61,$62,$63,$64,$65,$66,$67,$68,$69,$70,$71,$72,$73,$74,$75,$76,$77,$78,$79,$80,$81,$82,$83,$84,$85,$86,$87,$88,$89,$90,$91,$92,$93,$94);`;
            const arr = [
                ip_info.ip_address, // should go to 550
                ip_info.ip_address_type,
                tempDeviceObject.phone,
                tempDeviceObject.tablet,
                tempDeviceObject.desktop,
                tempDeviceObject.browser_name,
                tempDeviceObject.browser_version,
                tempDeviceObject.browser_major,
                tempDeviceObject.cpu_architecture,
                tempDeviceObject.device_type,
                tempDeviceObject.device_vendor,
                tempDeviceObject.device_model,
                tempDeviceObject.engine_name,
                tempDeviceObject.engine_version,
                tempDeviceObject.os_name,
                tempDeviceObject.os_version,
                settings.mode,
                settings.disableDefaultTab,
                settings.tabSize,
                settings.spellcheck,
                settings.fontFamily,
                settings.lightMode.primary,
                settings.lightMode.secondary,
                settings.lightMode.warning,
                settings.lightMode.success,
                settings.lightMode.info,
                settings.lightMode.error,
                settings.lightMode.buttonContrastText,
                settings.lightMode.background,
                settings.lightMode.secondaryBackground,
                settings.lightMode.navbarColor,
                settings.lightMode.shadowColor,
                settings.lightMode.textColor,
                settings.darkMode.primary,
                settings.darkMode.secondary,
                settings.darkMode.warning,
                settings.darkMode.success,
                settings.darkMode.info,
                settings.darkMode.error,
                settings.darkMode.buttonContrastText,
                settings.darkMode.background,
                settings.darkMode.secondaryBackground,
                settings.darkMode.navbarColor,
                settings.darkMode.shadowColor,
                settings.darkMode.textColor,
                settings.settingsString,
                tempIPLocationObject.hostname,
                tempIPLocationObject.bogon,
                tempIPLocationObject.anycast,
                tempIPLocationObject.city,
                tempIPLocationObject.region,
                tempIPLocationObject.country,
                tempIPLocationObject.country_flag_emoji,
                tempIPLocationObject.country_flag_unicode,
                tempIPLocationObject.country_flag_url,
                tempIPLocationObject.country_currency_code,
                tempIPLocationObject.country_currency_symbol,
                tempIPLocationObject.continent_code,
                tempIPLocationObject.continent_name,
                tempIPLocationObject.isEU,
                tempIPLocationObject.countryCode,
                tempIPLocationObject.loc,
                tempIPLocationObject.org,
                tempIPLocationObject.postal,
                tempIPLocationObject.timezone,
                tempIPLocationObject.asn_asn,
                tempIPLocationObject.asn_name,
                tempIPLocationObject.asn_domain,
                tempIPLocationObject.asn_route,
                tempIPLocationObject.asn_type,
                tempIPLocationObject.company_name,
                tempIPLocationObject.company_domain,
                tempIPLocationObject.company_type,
                tempIPLocationObject.carrier_name,
                tempIPLocationObject.carrier_mcc,
                tempIPLocationObject.carrier_mnc,
                tempIPLocationObject.privacy_vpn,
                tempIPLocationObject.privacy_proxy,
                tempIPLocationObject.privacy_tor,
                tempIPLocationObject.privacy_relay,
                tempIPLocationObject.privacy_hosting,
                tempIPLocationObject.privacy_service,
                tempIPLocationObject.abuse_address,
                tempIPLocationObject.abuse_country,
                tempIPLocationObject.abuse_country_code,
                tempIPLocationObject.abuse_email,
                tempIPLocationObject.abuse_name,
                tempIPLocationObject.abuse_network,
                tempIPLocationObject.abuse_phone,
                tempIPLocationObject.domains_ip,
                tempIPLocationObject.domains_total,
                tempIPLocationObject.domains_domains,
                randomName,
                url
            ];
            const dbRes = await (0, database_1.default)().query(query, arr);
            const ip_id = Number(dbRes.rows[0].create_ip_settings_rows);
            if (ip_id) {
                req.session.ip_id = ip_id;
                req.session.create_ip_address_row = false;
            }
            else
                throw new Error('Something went wrong creating the rows for the ip address in the database.');
        }
        else
            throw new Error('req.session.ip_location.temp and req.session.device.temp and req.session.ip should be defined in cache here.');
    }
    catch (error) {
        console.error(error);
    }
    req.session.creating_ip_address_row = false;
    res.removeHeader('Etag'); // Prevent caching of this route
    return res.status(200).send((0, html_1.getAllowSettingsString)(req).concat(`<div hidden hx-swap-oob="true" id="ip-set-wrapper"><input type="number" readonly id="ip_id" value="${req.session.ip_id}"></div>`));
}
exports.createIPSettingsInDatabase = createIPSettingsInDatabase;
/**
 * - Called in `partials/settings.ejs`
 * - Call this api route whenever the settings are updated. This includes whenever
 * the settings form changes, whenever the light mode / dark mode changes, whenever the settings are reset
 * @param req
 * @param res
 * @returns
 */
async function updateSettingsInDatabase(req, res) {
    req.session.create_ip_address_row = Boolean(isNaN(Number(req.session.ip_id)));
    if (req.session.creating_ip_address_row === true) {
        res.removeHeader('Etag'); // Prevent caching of this route
        return res.status(200).send(`<span hidden hx-get="/api/save-settings" hx-swap="outerHTML" hx-trigger="load delay:100ms"></span>`);
    }
    else if (req.session.create_ip_address_row === true) {
        return createIPSettingsInDatabase(req, res);
    }
    else {
        const ipQuery = `UPDATE ip_settings SET 
    settings_mode=$1::TEXT,
    disable_default_tab=$2::boolean,
    tab_size=$3::integer,
    font_family=$4::TEXT,
    light_primary=$5::TEXT,
    light_secondary=$6::TEXT,
    light_warning=$7::TEXT,
    light_success=$8::TEXT,
    light_info=$9::TEXT,
    light_error=$10::TEXT,
    light_button_contrast_text=$11::TEXT,
    light_background=$12::TEXT,
    light_secondary_background=$13::TEXT,
    light_navbar_color=$14::TEXT,
    light_shadow_color=$15::TEXT,
    light_text_color=$16::TEXT,
    dark_primary=$17::TEXT,
    dark_secondary=$18::TEXT,
    dark_warning=$19::TEXT,
    dark_success=$20::TEXT,
    dark_info=$21::TEXT,
    dark_error=$22::TEXT,
    dark_button_contrast_text=$23::TEXT,
    dark_background=$24::TEXT,
    dark_secondary_background=$25::TEXT,
    dark_navbar_color=$26::TEXT,
    dark_shadow_color=$27::TEXT,
    dark_text_color=$28::TEXT,
    settings_string=$29::TEXT,
    spellcheck=$30::boolean,
    code_editor_theme=$31::TEXT,
    code_editor_emmet=$32::boolean,
    desktop_application_size=$33::smallint,
    tablet_application_size=$34::smallint,
    mobile_application_size=$35::smallint,
    lang=$36::TEXT,
    timezone=$37::TEXT,
    include_autocomplete_suggestions=$38,
    enable_ai_writer=$39,
    ai_writer_temperature=$40,
    ai_writer_model=$41,
    enable_ai_coder=$42,
    ai_coder_temperature=$43,
    ai_coder_model=$44,
    ai_coder_max_tokens=$45,
    ai_writer_max_tokens=$46
    WHERE 
    ip_id=$47::integer;`;
        const userQuery = `UPDATE user_settings SET 
    settings_mode=$1::TEXT,
    disable_default_tab=$2::boolean,
    tab_size=$3::integer,
    font_family=$4::TEXT,
    light_primary=$5::TEXT,
    light_secondary=$6::TEXT,
    light_warning=$7::TEXT,
    light_success=$8::TEXT,
    light_info=$9::TEXT,
    light_error=$10::TEXT,
    light_button_contrast_text=$11::TEXT,
    light_background=$12::TEXT,
    light_secondary_background=$13::TEXT,
    light_navbar_color=$14::TEXT,
    light_shadow_color=$15::TEXT,
    light_text_color=$16::TEXT,
    dark_primary=$17::TEXT,
    dark_secondary=$18::TEXT,
    dark_warning=$19::TEXT,
    dark_success=$20::TEXT,
    dark_info=$21::TEXT,
    dark_error=$22::TEXT,
    dark_button_contrast_text=$23::TEXT,
    dark_background=$24::TEXT,
    dark_secondary_background=$25::TEXT,
    dark_navbar_color=$26::TEXT,
    dark_shadow_color=$27::TEXT,
    dark_text_color=$28::TEXT,
    settings_string=$29::TEXT,
    spellcheck=$30::boolean,
    code_editor_theme=$31::TEXT,
    code_editor_emmet=$32::boolean,
    desktop_application_size=$33::smallint,
    tablet_application_size=$34::smallint,
    mobile_application_size=$35::smallint,
    lang=$36::TEXT,
    timezone=$37::TEXT,
    include_autocomplete_suggestions=$38,
    enable_ai_writer=$39,
    ai_writer_temperature=$40,
    ai_writer_model=$41,
    enable_ai_coder=$42,
    ai_coder_temperature=$43,
    ai_coder_model=$44,
    ai_coder_max_tokens=$45,
    ai_writer_max_tokens=$46
    WHERE 
    user_id=$47::integer;`;
        const ipQueryNotifications = `UPDATE notification_preferences_ip SET create_annotation=$1,
create_note=$2,
update_note=$3,
create_blog=$4,
update_blog=$5,
create_idea=$6,
update_idea=$7,
create_comment=$8,
create_jupyter_notebook=$9,
create_markdown_note=$10,
create_stream_consciousness=$11,
create_daily_reading=$12,
create_tex_note=$13,
create_link=$14,
create_quote=$15,
create_project=$16,
project_update=$17,
create_survey=$18,
create_goodreads=$19, 
create_letterboxd=$20, 
create_game=$21, 
create_3d_design=$22,
create_electronics=$23
WHERE ip_id=$24;`;
        const userQueryNotifications = `UPDATE notification_preferences_user SET create_annotation=$1,
create_note=$2,
update_note=$3,
create_blog=$4,
update_blog=$5,
create_idea=$6,
update_idea=$7,
create_comment=$8,
create_jupyter_notebook=$9,
create_markdown_note=$10,
create_stream_consciousness=$11,
create_daily_reading=$12,
create_tex_note=$13,
create_link=$14,
create_quote=$15,
create_project=$16,
project_update=$17,
create_survey=$18,
create_goodreads=$19, 
create_letterboxd=$20, 
create_game=$21, 
create_3d_design=$22,
create_electronics=$23
WHERE user_id=$24;`;
        try {
            var promiseArray = [];
            if (req.session.settings) {
                const settings = req.session.settings;
                const arr = [
                    settings.mode,
                    settings.disableDefaultTab,
                    settings.tabSize,
                    settings.fontFamily,
                    settings.lightMode.primary,
                    settings.lightMode.secondary,
                    settings.lightMode.warning,
                    settings.lightMode.success,
                    settings.lightMode.info,
                    settings.lightMode.error,
                    settings.lightMode.buttonContrastText,
                    settings.lightMode.background,
                    settings.lightMode.secondaryBackground,
                    settings.lightMode.navbarColor,
                    settings.lightMode.shadowColor,
                    settings.lightMode.textColor,
                    settings.darkMode.primary,
                    settings.darkMode.secondary,
                    settings.darkMode.warning,
                    settings.darkMode.success,
                    settings.darkMode.info,
                    settings.darkMode.error,
                    settings.darkMode.buttonContrastText,
                    settings.darkMode.background,
                    settings.darkMode.secondaryBackground,
                    settings.darkMode.navbarColor,
                    settings.darkMode.shadowColor,
                    settings.darkMode.textColor,
                    settings.settingsString,
                    settings.spellcheck,
                    settings.code_editor_theme,
                    settings.code_editor_emmet,
                    settings.desktop_application_size,
                    settings.tablet_application_size,
                    settings.mobile_application_size,
                    settings.lang,
                    settings.timezone,
                    settings.include_autocomplete_suggestions,
                    settings.enable_ai_writer,
                    settings.ai_writer_temperature,
                    settings.ai_writer_model,
                    settings.enable_ai_coder,
                    settings.ai_coder_temperature,
                    settings.ai_coder_model,
                    settings.ai_coder_max_tokens,
                    settings.ai_writer_max_tokens
                ];
                const arr2 = [
                    settings.create_annotation,
                    settings.create_note,
                    settings.update_note,
                    settings.create_blog,
                    settings.update_blog,
                    settings.create_idea,
                    settings.update_idea,
                    settings.create_comment,
                    settings.create_jupyter_notebook,
                    settings.create_markdown_note,
                    settings.create_stream_consciousness,
                    settings.create_daily_reading,
                    settings.create_tex_note,
                    settings.create_link,
                    settings.create_quote,
                    settings.create_project,
                    settings.project_update,
                    settings.create_survey,
                    settings.create_goodreads,
                    settings.create_letterboxd,
                    settings.create_game,
                    settings.create_3d_design,
                    settings.create_electronics
                ];
                const db = (0, database_1.default)();
                if (req.session.ip_id) {
                    const ipArr = arr.concat([req.session.ip_id]);
                    promiseArray.push(db.query(ipQuery, ipArr));
                    const ipNotifArray = arr2.concat([req.session.ip_id]);
                    promiseArray.push(db.query(ipQueryNotifications, ipNotifArray));
                }
                if (req.session.auth && req.session.auth.level >= 1 && req.session.auth.userID) {
                    const userArr = arr.concat([req.session.auth.userID]);
                    promiseArray.push(db.query(userQuery, userArr));
                    const userNotifArray = arr2.concat([req.session.auth.userID]);
                    promiseArray.push(db.query(userQueryNotifications, userNotifArray));
                }
                if (promiseArray.length) {
                    await Promise.all(promiseArray);
                }
            }
            else
                throw new Error('Settings and ip_id should be set.');
        }
        catch (error) {
            console.error(error);
        }
        res.removeHeader('Etag'); // Prevent caching of this route
        return res.status(200).send((0, html_1.getAllowSettingsString)(req).concat(`<div hidden hx-swap-oob="true" id="ip-set-wrapper"><input type="number" readonly id="ip_id" value="${req.session.ip_id}"></div>`));
    }
}
exports.updateSettingsInDatabase = updateSettingsInDatabase;
const createUserSettingsDBString = `INSERT INTO user_settings (
  settings_mode,
  disable_default_tab,
  tab_size,
  font_family,
  light_primary,
  light_secondary,
  light_warning,
  light_success,
  light_info,
  light_error,
  light_button_contrast_text,
  light_background,
  light_secondary_background,
  light_navbar_color,
  light_shadow_color,
  light_text_color,
  dark_primary,
  dark_secondary,
  dark_warning,
  dark_success,
  dark_info,
  dark_error,
  dark_button_contrast_text,
  dark_background,
  dark_secondary_background,
  dark_navbar_color,
  dark_shadow_color,
  dark_text_color,
  settings_string,
  spellcheck,
  user_id,
  code_editor_theme,
  code_editor_emmet,
  desktop_application_size,
  tablet_application_size,
  mobile_application_size,
  lang,
  timezone
  )
  VALUES (
  $1::TEXT,
  $2::boolean,
  $3::integer,
  $4::TEXT,
  $5::TEXT,
  $6::TEXT,
  $7::TEXT,
  $8::TEXT,
  $9::TEXT,
  $10::TEXT,
  $11::TEXT,
  $12::TEXT,
  $13::TEXT,
  $14::TEXT,
  $15::TEXT,
  $16::TEXT,
  $17::TEXT,
  $18::TEXT,
  $19::TEXT,
  $20::TEXT,
  $21::TEXT,
  $22::TEXT,
  $23::TEXT,
  $24::TEXT,
  $25::TEXT,
  $26::TEXT,
  $27::TEXT,
  $28::TEXT,
  $29::TEXT,
  $30::boolean,
  $31::integer,
  $32::TEXT,
  $33::boolean,
  $34::smallint,
  $35::smallint,
  $36::smallint,
  $37::TEXT,
  $38::TEXT
);`;
async function createUserSettingsInDatabase(req, userID) {
    if (req.session.settings) {
        const settings = req.session.settings;
        const arr = [
            settings.mode,
            settings.disableDefaultTab,
            settings.tabSize,
            settings.fontFamily,
            settings.lightMode.primary,
            settings.lightMode.secondary,
            settings.lightMode.warning,
            settings.lightMode.success,
            settings.lightMode.info,
            settings.lightMode.error,
            settings.lightMode.buttonContrastText,
            settings.lightMode.background,
            settings.lightMode.secondaryBackground,
            settings.lightMode.navbarColor,
            settings.lightMode.shadowColor,
            settings.lightMode.textColor,
            settings.darkMode.primary,
            settings.darkMode.secondary,
            settings.darkMode.warning,
            settings.darkMode.success,
            settings.darkMode.info,
            settings.darkMode.error,
            settings.darkMode.buttonContrastText,
            settings.darkMode.background,
            settings.darkMode.secondaryBackground,
            settings.darkMode.navbarColor,
            settings.darkMode.shadowColor,
            settings.darkMode.textColor,
            settings.settingsString,
            settings.spellcheck,
            userID,
            settings.code_editor_theme,
            settings.code_editor_emmet,
            settings.desktop_application_size,
            settings.tablet_application_size,
            settings.mobile_application_size,
            settings.lang,
            settings.timezone
        ];
        const db = (0, database_1.default)();
        await Promise.all([
            db.query(createUserSettingsDBString, arr),
            db.query(`INSERT INTO notification_preferences_user (user_id) VALUES ($1);`, [userID]),
        ]);
    }
}
exports.createUserSettingsInDatabase = createUserSettingsInDatabase;
