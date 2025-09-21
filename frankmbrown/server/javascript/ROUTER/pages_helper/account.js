"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccount = exports.getLogout = exports.finishResetCredentials = exports.finishCreateAccount = exports.postCreateAccount2fa = exports.postResetCredentials2fa = exports.getResetCredentials = exports.postResetCredentials = exports.resendResetCredentialsEmail = exports.getCreateAccountSendEmail = exports.postCreateAccount = exports.getCreateAccount = exports.postLogin = exports.getLogin = exports.getUser = exports.postEditDescription = exports.postEditPassword = exports.postEditUsername = exports.postEditProfilePicture = exports.getEditDescription = exports.getEditPassword = exports.getEditUsername = exports.sendEmail = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const ejs_1 = __importDefault(require("ejs"));
const database_1 = __importDefault(require("../../database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const env_1 = __importDefault(require("../../utils/env"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TIME = __importStar(require("../../utils/time"));
const settingsHandler_1 = require("../functions/settingsHandler");
const redirect_override_1 = require("../helper_functions/redirect-override");
const image_1 = require("../../utils/image");
const aws_implementation_1 = require("../../aws/aws-implementation");
const __1 = require("../..");
const node_crypto_1 = __importDefault(require("node:crypto"));
const lexicalImplementations_1 = require("./lexicalImplementations");
const lexical_1 = require("../../lexical");
const projects_1 = require("./projects");
const html_1 = require("../html");
const IS_DEVELOPMENT_1 = __importDefault(require("../../CONSTANTS/IS_DEVELOPMENT"));
const getUserInfoHelper_1 = require("./article_helpers/getUserInfoHelper");
const CREATE_ACCOUNT_EMAIL = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', '..', 'views', 'emails', 'create-account.ejs'), { encoding: 'utf-8' });
const RESET_CREDENTIALS_EMAIL = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', '..', 'views', 'emails', 'reset-credentials.ejs'), { encoding: 'utf-8' });
const sentEmailNotification = /*html*/ `<div class="flex-row justify-center">
<div class="alert mt-3 filled warning icon medium" style="max-width: 600px;" role="alert">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Mail"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"></path></svg>
  <p class="alert">
    An email with the two factor authentication code has been sent to <%=locals.email%>. You have <%=locals.emailsLeft%> emails left before you can no longer <%=locals.action%>.
  </p>
  <button aria-label="Close Alert" class="icon medium close-alert" type="button">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
  </button>
</div>
</div>`;
const sentEmailErrorNotification = /*html*/ `<div class="flex-row justify-center">
<div class="alert mt-3 filled error icon medium" style="max-width: 600px;" role="alert">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
  <p class="alert">
    You have exceeded the maximum amount of emails that you can use to <%= locals.action %>.
  </p>
  <button aria-label="Close Alert" class="icon medium close-alert" type="button">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
  </button>
</div>
</div>`;
const EMAIL_REGEX = /(?=.{1,250}$)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const USERNAME_REGEX = /^(?!Anonymous$)(?!.*\s)(.{4,50})$/;
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$/;
const sendGridApiKey = env_1.default.SENDGRID_API_KEY;
if (!!!sendGridApiKey)
    throw new Error('Unable to locate the sendgrid API key.');
mail_1.default.setApiKey(sendGridApiKey);
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_CREATE_ACCOUNT_EMAIL = 4;
const MAX_RESET_CREDENTIALS_EMAIL = 4;
const MAX_CREATE_ACCOUNT_ATTEMPTS = 6;
const MAX_RESET_CREDENTIALS_ATTEMPTS = 6;
const get2faCode = () => Math.random().toFixed(6).slice(2);
const loginQueryString = `SELECT 
  users.id,
  users.user_username, 
  users.user_password, 
  users.user_email, 
  users.user_date_created, 
  users.user_banned,
  user_settings.settings_mode,
  user_settings.disable_default_tab,
  user_settings.tab_size,
  user_settings.font_family,
  user_settings.light_primary,
  user_settings.light_secondary,
  user_settings.light_warning,
  user_settings.light_success,
  user_settings.light_info,
  user_settings.light_error,
  user_settings.light_button_contrast_text,
  user_settings.light_background,
  user_settings.light_secondary_background,
  user_settings.light_navbar_color,
  user_settings.light_shadow_color,
  user_settings.light_text_color,
  user_settings.dark_primary,
  user_settings.dark_secondary,
  user_settings.dark_warning,
  user_settings.dark_success,
  user_settings.dark_info,
  user_settings.dark_error,
  user_settings.dark_button_contrast_text,
  user_settings.dark_background,
  user_settings.dark_secondary_background,
  user_settings.dark_navbar_color,
  user_settings.dark_shadow_color,
  user_settings.dark_text_color,
  user_settings.settings_string,
  user_settings.spellcheck,
  user_settings.code_editor_theme,
  user_settings.code_editor_emmet,
  user_settings.desktop_application_size,
  user_settings.tablet_application_size,
  user_settings.mobile_application_size,
  user_settings.lang,
  user_settings.timezone,
  user_settings.include_autocomplete_suggestions include_autocomplete_suggestions,
  user_settings.enable_ai_writer enable_ai_writer,
  user_settings.ai_writer_temperature ai_writer_temperature,
  user_settings.ai_writer_model ai_writer_model,
  user_settings.enable_ai_coder enable_ai_coder,
  user_settings.ai_coder_temperature ai_coder_temperature,
  user_settings.ai_coder_model ai_coder_model,
  user_settings.ai_writer_max_tokens ai_writer_max_tokens,
  user_settings.ai_coder_max_tokens ai_coder_max_tokens,
  notification_preferences_user.create_annotation create_annotation,
  notification_preferences_user.create_note create_note,
  notification_preferences_user.update_note update_note,
  notification_preferences_user.create_blog create_blog,
  notification_preferences_user.update_blog update_blog,
  notification_preferences_user.create_idea create_idea,
  notification_preferences_user.update_idea update_idea,
  notification_preferences_user.create_comment create_comment,
  notification_preferences_user.create_jupyter_notebook create_jupyter_notebook,
  notification_preferences_user.create_markdown_note create_markdown_note,
  notification_preferences_user.create_stream_consciousness create_stream_consciousness,
  notification_preferences_user.create_daily_reading create_daily_reading,
  notification_preferences_user.create_tex_note create_tex_note,
  notification_preferences_user.create_link create_link,
  notification_preferences_user.create_quote create_quote,
  notification_preferences_user.create_project create_project,
  notification_preferences_user.project_update project_update,
  notification_preferences_user.create_survey create_survey,
  notification_preferences_user.create_goodreads create_goodreads,
  notification_preferences_user.create_letterboxd create_letterboxd,
  notification_preferences_user.create_game create_game,
  notification_preferences_user.create_3d_design create_3d_design,
    notification_preferences_user.create_electronics create_electronics
  FROM users JOIN user_settings ON users.id=user_settings.user_id
  JOIN notification_preferences_user ON notification_preferences_user.user_id=users.id
  WHERE users.user_username=$1::TEXT;`;
/* --------------------------------- login ------------------------------------- */
/**
 * - 100 loginAttempts allowed per session
 *
 */
const getCanLogin = (req) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return Boolean(Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.loginAttempts) < MAX_LOGIN_ATTEMPTS && Number((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.level) === 0 && ((_f = (_e = req === null || req === void 0 ? void 0 : req.session) === null || _e === void 0 ? void 0 : _e.auth) === null || _f === void 0 ? void 0 : _f.banned) !== true && ((_g = req.session.cookiePreferences) === null || _g === void 0 ? void 0 : _g.showedBanner) === true);
};
function getLogin(req, res) {
    var _a, _b, _c, _d, _e, _f, _g;
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Login', item: '/login', position: 2 }];
    const title = "Login to frankmbrown.net";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Login", "Login to frankmbrown.net", "Login Functionality has not yet been implemented", "Blog", "Notes"];
    const description = 'Login to frankmbrown.net. Login functionality has not yet been implemented. Login functionality will be implemented if I ever decide to write a blog and decide to allow comments on posts.';
    const tableOfContents = [{ id: "login-form", text: "Login" }];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/login' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    const pageObj = {
        canLogin: getCanLogin(req),
        canLoginMessage: '',
        username: '',
        password: '',
        loginError: false,
        loginErrorMessage: ''
    };
    if (!!!pageObj.canLogin) {
        if (Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.loginAttempts) > MAX_LOGIN_ATTEMPTS) {
            pageObj.canLoginMessage = "You have exceeded the maximum number of login attempts.";
        }
        else if (Number((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.level) >= 1) {
            pageObj.canLoginMessage = "You are already logged in.";
        }
        else if ((_f = (_e = req === null || req === void 0 ? void 0 : req.session) === null || _e === void 0 ? void 0 : _e.auth) === null || _f === void 0 ? void 0 : _f.banned) {
            pageObj.canLoginMessage = "You are banned from continued interaction with this platform.";
        }
        else if (!!!((_g = req.session.cookiePreferences) === null || _g === void 0 ? void 0 : _g.showedBanner)) {
            pageObj.canLoginMessage = "Please accept of deny cookies before logging in.";
        }
    }
    return res.status(200).render('pages/account/login', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        pageObj
    });
}
exports.getLogin = getLogin;
/**
 * Should render the loginForm
 * @param req
 * @param res
 * @returns
 */
async function postLogin(req, res) {
    var _a;
    const view = 'pages/account/loginForm';
    const pageObj = {
        canLogin: true,
        canLoginMessage: '',
        username: '',
        password: '',
        loginError: false,
        loginErrorMessage: ''
    };
    try {
        if (!!!req.session.auth)
            throw new Error('Something went wrong on our side.');
        req.session.auth.loginAttempts += 1;
        const { username, password } = req.body;
        const validateUsernameObj = validateUsername(username);
        const validatePasswordObj = validatePassword(password);
        if (typeof username === 'string')
            pageObj.username = username;
        if (typeof password === 'string')
            pageObj.password = password;
        if (!!!validateUsernameObj.valid) {
            pageObj.canLogin = getCanLogin(req);
            if (!!!pageObj.canLogin) {
                pageObj.canLoginMessage = 'You have exceeded the maximum limit of login attempts.';
            }
            pageObj.loginError = true;
            pageObj.loginErrorMessage = validateUsernameObj.error;
            return res.render(view, { layout: false, pageObj: pageObj });
        }
        if (!!!validatePasswordObj.valid) {
            pageObj.canLogin = getCanLogin(req);
            if (!!!pageObj.canLogin) {
                pageObj.canLoginMessage = 'You have exceeded the maximum limit of login attempts.';
            }
            pageObj.loginError = true;
            pageObj.loginErrorMessage = validatePasswordObj.error;
            return res.render(view, { layout: false, pageObj: pageObj });
        }
        const db = (0, database_1.default)();
        const dbRes = await db.query(loginQueryString, [username]);
        if (!!!dbRes.rows.length) {
            pageObj.loginError = true;
            pageObj.loginErrorMessage = 'A user with this username and password combination does not exist.';
            return res.status(200).render(view, { pageObj, layout: false });
        }
        const { id, user_username, user_password, user_email, user_date_created, user_banned, settings_mode, disable_default_tab, tab_size, font_family, light_primary, light_secondary, light_warning, light_success, light_info, light_error, light_button_contrast_text, light_background, light_secondary_background, light_navbar_color, light_shadow_color, light_text_color, dark_primary, dark_secondary, dark_warning, dark_success, dark_info, dark_error, dark_button_contrast_text, dark_background, dark_secondary_background, dark_navbar_color, dark_shadow_color, dark_text_color, settings_string, spellcheck, code_editor_theme, code_editor_emmet, desktop_application_size, tablet_application_size, mobile_application_size, lang, timezone, create_annotation, create_note, update_note, create_blog, update_blog, create_idea, update_idea, create_comment, create_jupyter_notebook, create_markdown_note, create_stream_consciousness, create_daily_reading, create_tex_note, create_link, create_quote, create_project, project_update, create_survey, create_goodreads, create_letterboxd, create_game, create_3d_design, create_electronics, include_autocomplete_suggestions, enable_ai_writer, ai_writer_temperature, ai_writer_model, enable_ai_coder, ai_coder_temperature, ai_coder_model, ai_coder_max_tokens, ai_writer_max_tokens } = dbRes.rows[0];
        if (user_banned) {
            pageObj.canLogin = false;
            pageObj.canLoginMessage = 'You have been banned from interacting with this website.';
            req.session.auth.banned = user_banned;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        const passwordValid = await comparePasswords(password, user_password);
        if (!!!passwordValid) {
            pageObj.loginError = true;
            pageObj.loginErrorMessage = 'A user with this username / password combination does not exist.';
            return res.status(200).render(view, { layout: false, pageObj });
        }
        /**
         * Whether or not to call the endpoint that switches from light mode t
         * o dark mode
         */
        var changeMode = false;
        if (((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.mode) !== settings_mode) {
            changeMode = true;
        }
        req.session.settings = {
            mode: settings_mode,
            disableDefaultTab: disable_default_tab,
            spellcheck,
            tabSize: tab_size,
            fontFamily: font_family,
            lightMode: {
                primary: light_primary,
                secondary: light_secondary,
                warning: light_warning,
                success: light_success,
                info: light_info,
                error: light_error,
                buttonContrastText: light_button_contrast_text,
                background: light_background,
                secondaryBackground: light_secondary_background,
                navbarColor: light_navbar_color,
                textColor: light_text_color,
                shadowColor: light_shadow_color
            },
            darkMode: {
                primary: dark_primary,
                secondary: dark_secondary,
                warning: dark_warning,
                success: dark_success,
                info: dark_info,
                error: dark_error,
                buttonContrastText: dark_button_contrast_text,
                background: dark_background,
                secondaryBackground: dark_secondary_background,
                navbarColor: dark_navbar_color,
                textColor: dark_text_color,
                shadowColor: dark_shadow_color
            },
            settingsString: settings_string,
            desktop_application_size,
            tablet_application_size,
            mobile_application_size,
            code_editor_theme,
            code_editor_emmet,
            lang,
            timezone,
            create_annotation,
            create_note,
            update_note,
            create_blog,
            update_blog,
            create_idea,
            update_idea,
            create_comment,
            create_jupyter_notebook,
            create_markdown_note,
            create_stream_consciousness,
            create_daily_reading,
            create_tex_note,
            create_link,
            create_quote,
            create_project,
            project_update,
            create_survey,
            create_goodreads,
            create_letterboxd,
            create_game,
            create_3d_design,
            create_electronics,
            include_autocomplete_suggestions,
            enable_ai_writer,
            ai_writer_temperature,
            ai_writer_model,
            enable_ai_coder,
            ai_coder_temperature,
            ai_coder_model,
            ai_coder_max_tokens,
            ai_writer_max_tokens,
            ai_chat_id: 'chat_'.concat(node_crypto_1.default.randomUUID())
        };
        req.session.auth.level = Boolean(user_email === 'owner@frankmbrown.net') ? 3 : 1;
        req.session.auth.loginAttempts = 0;
        req.session.auth.email = user_email;
        req.session.auth.username = user_username;
        req.session.auth.banned = user_banned;
        req.session.auth.userID = id;
        req.session.auth.date_created = Number(user_date_created);
        const io = (0, __1.getWebSocketServer)();
        io.to(req.session.id).emit('login', { changeMode });
        // <div  hx-trigger="load" hx-get="save-settings"></div>
        const html = /*html*/ `<div  hx-trigger="load" hx-get="/" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`;
        return res.status(200).send(html);
    }
    catch (error) {
        console.error(error);
        pageObj.canLogin = false;
        pageObj.canLoginMessage = 'Something Went wrong on our side. Try reloading the page.';
        return res.status(200).render(view, { pageObj, layout: false });
    }
}
exports.postLogin = postLogin;
/* --------------------------------- create account --------------------------  */
const getCanCreateAccount = (req) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return Boolean(Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.level) < 1 && !!!((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.banned) && Number((_f = (_e = req === null || req === void 0 ? void 0 : req.session) === null || _e === void 0 ? void 0 : _e.auth) === null || _f === void 0 ? void 0 : _f.createAccountEmailsSent) < MAX_CREATE_ACCOUNT_EMAIL && Number((_g = req.session.auth) === null || _g === void 0 ? void 0 : _g.createAccountAttempts) < MAX_CREATE_ACCOUNT_ATTEMPTS);
};
const getCreateAccountMessage = (req) => {
    var _a, _b, _c, _d, _e, _f;
    if (Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.level) >= 1) {
        return 'You can not create an account when you are already logged in.';
    }
    else if (Boolean((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.banned)) {
        return 'You are banned from interacting with this platform.';
    }
    else if (Number((_e = req.session.auth) === null || _e === void 0 ? void 0 : _e.createAccountEmailsSent) >= MAX_CREATE_ACCOUNT_EMAIL) {
        return 'You have exceeded the amount of emails that you are alloted per session to create an account.';
    }
    else if (Number((_f = req.session.auth) === null || _f === void 0 ? void 0 : _f.createAccountAttempts) >= MAX_CREATE_ACCOUNT_ATTEMPTS) {
        return 'You have exceeded the maximum number of attempts you have to create an account.';
    }
    else {
        return '';
    }
};
/**
 * Should already have set tempCreateAccount
 * @param req
 * @returns
 */
const getCreateAccountEmail = (req) => {
    var _a, _b, _c, _d, _e;
    var textColor = '#000000';
    var backgroundColor = '#171717';
    if (req.session.settings) {
        const modeKey = req.session.settings.mode === "light" ? 'lightMode' : 'darkMode';
        const settingsObj = req.session.settings[modeKey];
        textColor = settingsObj.textColor;
        backgroundColor = settingsObj.background;
    }
    const html = ejs_1.default.render(CREATE_ACCOUNT_EMAIL, {
        backgroundColor: backgroundColor,
        textColor,
        username: ((_a = req.session.tempCreateAccount) === null || _a === void 0 ? void 0 : _a.username) || '',
        code: ((_c = (_b = req === null || req === void 0 ? void 0 : req.session) === null || _b === void 0 ? void 0 : _b.tempCreateAccount) === null || _c === void 0 ? void 0 : _c.tfa_code) || ''
    });
    const msg = {
        to: ((_e = (_d = req === null || req === void 0 ? void 0 : req.session) === null || _d === void 0 ? void 0 : _d.tempCreateAccount) === null || _e === void 0 ? void 0 : _e.email) || '', // Change to your recipient
        from: 'owner@frankmbrown.net', // Change to your verified sender
        subject: 'Authenticate frankmbrown.net Account',
        html
    };
    return msg;
};
function getCreateAccount(req, res) {
    var _a;
    const view = 'pages/account/create-account';
    const pageObj = {
        canCreateAccount: getCanCreateAccount(req),
        canCreateAccountMessage: getCreateAccountMessage(req),
        createAccountError: false,
        createAccountErrorMessage: '',
        email: '',
        username: '',
        password: '',
        twoFactorAuthentication: false,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: false,
        emailsLeft: MAX_CREATE_ACCOUNT_EMAIL,
        creatingAccount: false
    };
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Create Account', item: '/create-account', position: 2 }];
    const title = "Create Account for frankmbrown.net";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Create Account for frankmbrown.net"];
    const description = 'Create an account for frankmbrown.net using your email.';
    const tableOfContents = [{ id: "create-account-form", text: "Create Account" }];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/create-account' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    if ((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.tempCreateAccount)
        delete req.session.tempCreateAccount;
    return res.status(200).render(view, {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        pageObj
    });
}
exports.getCreateAccount = getCreateAccount;
async function postCreateAccount(req, res) {
    const view = 'pages/account/createAccountForm';
    const pageObj = {
        canCreateAccount: getCanCreateAccount(req),
        canCreateAccountMessage: getCreateAccountMessage(req),
        createAccountError: false,
        createAccountErrorMessage: '',
        email: '',
        username: '',
        password: '',
        twoFactorAuthentication: false,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: false,
        emailsLeft: MAX_CREATE_ACCOUNT_EMAIL,
        creatingAccount: false
    };
    if (!!!pageObj.canCreateAccount) {
        return res.status(200).render(view, { layout: false, pageObj });
    }
    try {
        if (!!!req.session.auth)
            throw new Error('auth should be set by now.');
        req.session.auth.createAccountAttempts += 1;
        const { username, password, email } = req.body;
        const validateUsernameObj = validateUsername(username);
        const validatePasswordObj = validatePassword(password);
        const validateEmailObj = validateEmail(email);
        if (typeof username === 'string') {
            pageObj.username = username;
        }
        if (typeof password === 'string') {
            pageObj.password = password;
        }
        if (typeof email === 'string') {
            pageObj.email = email;
        }
        if (!!!validateUsernameObj.valid) {
            pageObj.createAccountError = true;
            pageObj.createAccountErrorMessage = validateUsernameObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        if (!!!validatePasswordObj.valid) {
            pageObj.createAccountError = true;
            pageObj.createAccountErrorMessage = validatePasswordObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        if (!!!validateEmailObj.valid) {
            pageObj.createAccountError = true;
            pageObj.createAccountErrorMessage = validateEmailObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        const [hashedPassword, usernameOrEmailExists] = await Promise.all([
            hashPassword(password),
            usernameAndEmailDoesNotExist(username, email)
        ]);
        if (usernameOrEmailExists.exists) {
            pageObj.createAccountError = true;
            pageObj.createAccountErrorMessage = usernameOrEmailExists.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        const code = get2faCode();
        req.session.tempCreateAccount = {
            username,
            password: hashedPassword,
            email,
            tfa_code: code
        };
        if (req.session.auth && req.session.settings) {
            req.session.auth.createAccountEmailsSent += 1;
            pageObj.emailsLeft = MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent;
            const msg = getCreateAccountEmail(req);
            await sendEmail(msg);
            pageObj.twoFactorAuthentication = true;
            pageObj.emailSent = true;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        else {
            throw new Error('The auth should be set here.');
        }
    }
    catch (error) {
        pageObj.canCreateAccount = false;
        pageObj.canCreateAccountMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
        return res.status(200).render(view, { layout: false, pageObj });
    }
}
exports.postCreateAccount = postCreateAccount;
async function postCreateAccount2fa(req, res) {
    const view = 'pages/account/createAccountForm';
    const { two_factor_code } = req.body;
    const pageObj = {
        canCreateAccount: getCanCreateAccount(req),
        canCreateAccountMessage: getCreateAccountMessage(req),
        createAccountError: false,
        createAccountErrorMessage: '',
        email: '',
        username: '',
        password: '',
        twoFactorAuthentication: true,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: true,
        emailsLeft: MAX_CREATE_ACCOUNT_EMAIL,
        creatingAccount: false
    };
    try {
        if (!!!req.session.tempCreateAccount || !!!req.session.auth)
            throw new Error('These values should be set by now.');
        const { email, password, username, tfa_code } = req.session.tempCreateAccount;
        pageObj.email = email;
        pageObj.password = password;
        pageObj.username = username;
        if (typeof two_factor_code === 'string') {
            pageObj.twoFactorAuthenticationCode = two_factor_code;
        }
        const validTwoFactorAuthenticationCode = validate2FA(two_factor_code, tfa_code);
        if (!!!validTwoFactorAuthenticationCode.valid) {
            if (req.session.auth.createAccountEmailsSent >= MAX_CREATE_ACCOUNT_EMAIL)
                throw new Error('You have exceeded the amount of emails you can utilize to create an account.');
            pageObj.twoFactorAuthenticationError = true;
            pageObj.twoFactorAuthenticationErrorMessage = validTwoFactorAuthenticationCode.error;
            const newCode = get2faCode();
            req.session.tempCreateAccount.tfa_code = newCode;
            req.session.auth.createAccountEmailsSent += 1;
            const msg = getCreateAccountEmail(req);
            await sendEmail(msg);
            pageObj.emailSent = true;
            pageObj.emailsLeft = MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        // create account - make sure to delete tempCreateAccount
        pageObj.creatingAccount = true;
        return res.status(200).render(view, { layout: false, pageObj });
    }
    catch (error) {
        pageObj.canCreateAccount = false;
        pageObj.canCreateAccountMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
        return res.status(200).render(view, { layout: false, pageObj });
    }
}
exports.postCreateAccount2fa = postCreateAccount2fa;
async function getCreateAccountSendEmail(req, res) {
    const actionString = 'create an account';
    try {
        if (!!!req.session.auth || !!!req.session.tempCreateAccount)
            throw new Error('Auth should be set by now.');
        if (req.session.auth.createAccountEmailsSent > MAX_CREATE_ACCOUNT_EMAIL) {
            throw new Error('You have exceed the number of emails that we can send per day for you to reset your login credentials.');
        }
        const newCode = get2faCode();
        req.session.tempCreateAccount.tfa_code = newCode;
        const msg = getCreateAccountEmail(req);
        await sendEmail(msg);
        req.session.auth.createAccountEmailsSent += 1;
        const html = ejs_1.default.render(sentEmailNotification, {
            email: req.session.tempCreateAccount.email,
            emailsLeft: MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent,
            action: actionString
        });
        return res.status(200).send(html);
    }
    catch (error) {
        console.error(error);
        const html = ejs_1.default.render(sentEmailErrorNotification, {
            action: actionString
        });
        return res.status(200).send(html);
    }
}
exports.getCreateAccountSendEmail = getCreateAccountSendEmail;
async function finishCreateAccount(req, res) {
    try {
        if (!!!req.session.tempCreateAccount || !!!req.session.settings)
            throw new Error('These values should be set by now.');
        const { username, password, email } = req.session.tempCreateAccount;
        const db = (0, database_1.default)();
        const now = TIME.getUnixTime();
        const profile_picture = await (0, image_1.createDefaultProfilePicture)(username);
        const { twitter, linkedin } = await (0, image_1.createTwitterAndLinkedInImages)(profile_picture.buffer, profile_picture.background);
        const name = node_crypto_1.default.randomUUID().concat('.jpg');
        const key = `frankmbrown/${name}`;
        const twitterKey = `frankmbrown/twitter/${name}`;
        const pageKey = `frankmbrown/og-image/${name}`;
        const { ip_id } = (0, aws_implementation_1.getUserIdAndIpIdForImageUpload)(req);
        const [url, ...rest] = await Promise.all([
            (0, aws_implementation_1.uploadImageObject)(key, profile_picture.buffer, 'jpg', {}, null, ip_id),
            (0, aws_implementation_1.uploadImageObject)(twitterKey, twitter, 'jpg', { "no-index": "true" }, null, ip_id),
            (0, aws_implementation_1.uploadImageObject)(pageKey, linkedin, 'jpg', { "no-index": "true" }, null, ip_id)
        ]);
        const queryStr = `INSERT INTO users (
      user_username,
      user_password,
      user_email,
      user_date_created,
      user_banned,
      profile_picture
    ) VALUES (
      $1::TEXT,
      $2::TEXT,
      $3::TEXT,
      $4::bigint,
      false,
      $5
    ) RETURNING id;`;
        const createAccountRes = await db.query(queryStr, [username, password, email, now, url]);
        const userID = createAccountRes.rows[0].id;
        await (0, settingsHandler_1.createUserSettingsInDatabase)(req, userID);
        delete req.session.tempCreateAccount;
        return res.status(200).send(/*html*/ `
        <div 
        hx-push-url="true"
        class="snackbar success" 
        aria-hidden="false" 
        role="alert" 
        data-snacktime="4000"
        hx-trigger="load delay:1.5s"
        hx-get="/login"
        hx-target="#PAGE"
        hx-indicator="#page-transition-progress"
        >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Check"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
          <p class="p-sm">
            You have successfully created a frankmbrown.net account!
          </p>
        </div>
    `);
    }
    catch (error) {
        console.error(error);
        const errorAlert = /*html*/ `
<div class="alert filled icon medium error" role="alert">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
  <p class="alert">
    Something went wrong creating your account. Try reloading the page to try again.  
  </p>
  <button aria-label="Close Alert" class="icon medium close-alert" type="button">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
  </button>
</div>
    `;
        return res.status(200).send(errorAlert);
    }
}
exports.finishCreateAccount = finishCreateAccount;
const getCanResetCredentials = (req) => {
    var _a, _b, _c, _d, _e, _f, _g;
    return Boolean(Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.resetCredentialsEmailsSent) < MAX_RESET_CREDENTIALS_EMAIL && Number((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.level) === 0 && ((_f = (_e = req === null || req === void 0 ? void 0 : req.session) === null || _e === void 0 ? void 0 : _e.auth) === null || _f === void 0 ? void 0 : _f.banned) !== true && Number((_g = req.session.auth) === null || _g === void 0 ? void 0 : _g.resetCredentialsAttempts) < MAX_RESET_CREDENTIALS_ATTEMPTS);
};
const getCanResetCredentialsMessage = (req) => {
    var _a, _b, _c, _d, _e, _f;
    if (Number((_b = (_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.level) >= 1) {
        return 'You can not reset your credentials when you are already logged in.';
    }
    else if (Boolean((_d = (_c = req === null || req === void 0 ? void 0 : req.session) === null || _c === void 0 ? void 0 : _c.auth) === null || _d === void 0 ? void 0 : _d.banned)) {
        return 'You are banned from interacting with this platform.';
    }
    else if (Number((_e = req.session.auth) === null || _e === void 0 ? void 0 : _e.resetCredentialsEmailsSent) >= MAX_RESET_CREDENTIALS_EMAIL) {
        return 'You have exceeded the amount of emails that you are alloted per session to reset your credentials.';
    }
    else if (Number((_f = req.session.auth) === null || _f === void 0 ? void 0 : _f.resetCredentialsAttempts) >= MAX_RESET_CREDENTIALS_ATTEMPTS) {
        return 'You have exceeded the maximum number of attempts you have to reset your credentials.';
    }
    else {
        return '';
    }
};
const getResetCredentialsEmail = (req) => {
    var _a, _b, _c, _d, _e;
    var textColor = '#000000';
    var backgroundColor = '#171717';
    if (req.session.settings) {
        const modeKey = req.session.settings.mode === "light" ? 'lightMode' : 'darkMode';
        const settingsObj = req.session.settings[modeKey];
        textColor = settingsObj.textColor;
        backgroundColor = settingsObj.background;
    }
    const html = ejs_1.default.render(RESET_CREDENTIALS_EMAIL, {
        backgroundColor: backgroundColor,
        textColor,
        username: ((_a = req.session.tempResetCredentials) === null || _a === void 0 ? void 0 : _a.username) || '',
        code: ((_c = (_b = req === null || req === void 0 ? void 0 : req.session) === null || _b === void 0 ? void 0 : _b.tempResetCredentials) === null || _c === void 0 ? void 0 : _c.tfa_code) || ''
    });
    const msg = {
        to: ((_e = (_d = req === null || req === void 0 ? void 0 : req.session) === null || _d === void 0 ? void 0 : _d.tempResetCredentials) === null || _e === void 0 ? void 0 : _e.email) || '', // Change to your recipient
        from: 'owner@frankmbrown.net', // Change to your verified sender
        subject: 'Reset frankmbrown.net Account Credentials',
        html
    };
    return msg;
};
function getResetCredentials(req, res) {
    var _a;
    const resetCredentialsPageObj = {
        canResetCredentials: getCanResetCredentials(req), //
        canResetCredentialsMessage: getCanResetCredentialsMessage(req), // 
        resetCredentialsError: false, //
        resetCredentialsErrorMessage: '', // 
        email: '',
        newUsername: '',
        newPassword: '',
        twoFactorAuthentication: false,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: false,
        emailsLeft: MAX_RESET_CREDENTIALS_EMAIL,
        resettingCredentials: false
    };
    const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: '', item: '/create-account', position: 2 }];
    const title = "Create Account for frankmbrown.net";
    const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Create Account for frankmbrown.net"];
    const description = 'Create an account for frankmbrown.net using your email.';
    const tableOfContents = [{ id: "create-account-form", text: "Create Account" }];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/create-account' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    if ((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.tempResetCredentials)
        delete req.session.tempResetCredentials;
    return res.status(200).render('pages/account/reset-credentials', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        pageObj: resetCredentialsPageObj
    });
}
exports.getResetCredentials = getResetCredentials;
async function postResetCredentials(req, res) {
    const view = 'pages/account/resetCredentialsForm';
    const pageObj = {
        canResetCredentials: getCanResetCredentials(req), //
        canResetCredentialsMessage: getCanResetCredentialsMessage(req), // 
        resetCredentialsError: false, //
        resetCredentialsErrorMessage: '', // 
        email: '',
        newUsername: '',
        newPassword: '',
        twoFactorAuthentication: false,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: false,
        emailsLeft: MAX_RESET_CREDENTIALS_EMAIL,
        resettingCredentials: false
    };
    try {
        if (!!!req.session.auth)
            throw new Error('Auth should be set by now.');
        req.session.auth.resetCredentialsAttempts += 1;
        const { new_username, email, new_password } = req.body;
        const validateUsernameObj = validateUsername(new_username);
        const validatePasswordObj = validatePassword(new_password);
        const validateEmailObj = validateEmail(email);
        if (typeof new_username === 'string') {
            pageObj.newUsername = new_username;
        }
        if (typeof new_password === 'string') {
            pageObj.newPassword = new_password;
        }
        if (typeof email === 'string') {
            pageObj.email = email;
        }
        if (!!!validateUsernameObj.valid) {
            pageObj.resetCredentialsError = true;
            pageObj.resetCredentialsErrorMessage = validateUsernameObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        if (!!!validatePasswordObj.valid) {
            pageObj.resetCredentialsError = true;
            pageObj.resetCredentialsErrorMessage = validatePasswordObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        if (!!!validateEmailObj.valid) {
            pageObj.resetCredentialsError = true;
            pageObj.resetCredentialsErrorMessage = validateEmailObj.error;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        const queryStr = 'SELECT id FROM users WHERE user_email=$1::TEXT;';
        const db = (0, database_1.default)();
        const [hashedPassword, emailExists] = await Promise.all([
            hashPassword(new_password),
            db.query(queryStr, [email])
        ]);
        if (!!!emailExists.rows.length) {
            pageObj.resetCredentialsError = true;
            pageObj.resetCredentialsErrorMessage = 'A user with this email does not exist.';
            return res.status(200).render(view, { layout: false, pageObj });
        }
        const code = get2faCode();
        req.session.tempResetCredentials = {
            username: new_username,
            password: hashedPassword,
            email,
            tfa_code: code
        };
        if (req.session.auth && req.session.settings) {
            req.session.auth.resetCredentialsEmailsSent += 1;
            pageObj.emailsLeft = MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsAttempts;
            const msg = getResetCredentialsEmail(req);
            await sendEmail(msg);
            pageObj.twoFactorAuthentication = true;
            pageObj.emailSent = true;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        else {
            throw new Error('The auth should be set here.');
        }
    }
    catch (error) {
        pageObj.canResetCredentials = false;
        pageObj.canResetCredentialsMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
        return res.status(200).render(view, { layout: false, pageObj });
    }
}
exports.postResetCredentials = postResetCredentials;
async function postResetCredentials2fa(req, res) {
    const view = 'pages/account/resetCredentialsForm';
    const pageObj = {
        canResetCredentials: true, //
        canResetCredentialsMessage: '', // 
        resetCredentialsError: false, //
        resetCredentialsErrorMessage: '', // 
        email: '',
        newUsername: '',
        newPassword: '',
        twoFactorAuthentication: false,
        twoFactorAuthenticationCode: '',
        twoFactorAuthenticationError: false,
        twoFactorAuthenticationErrorMessage: '',
        emailSent: true,
        emailsLeft: MAX_RESET_CREDENTIALS_EMAIL,
        resettingCredentials: false
    };
    try {
        const { two_factor_code } = req.body;
        if (!!!req.session.tempResetCredentials || !!!req.session.auth)
            throw new Error('These values should be set by now.');
        const { email, password, username, tfa_code } = req.session.tempResetCredentials;
        pageObj.email = email;
        pageObj.newPassword = password;
        pageObj.newUsername = username;
        if (typeof two_factor_code === 'string') {
            pageObj.twoFactorAuthenticationCode = two_factor_code;
        }
        const validTwoFactorAuthenticationCode = validate2FA(two_factor_code, tfa_code);
        if (!!!validTwoFactorAuthenticationCode.valid) {
            if (req.session.auth.resetCredentialsAttempts >= MAX_RESET_CREDENTIALS_ATTEMPTS)
                throw new Error('You have exceeded the amount of emails you can utilize to reset your credentials.');
            pageObj.twoFactorAuthenticationError = true;
            pageObj.twoFactorAuthenticationErrorMessage = validTwoFactorAuthenticationCode.error;
            const newCode = get2faCode();
            req.session.tempResetCredentials.tfa_code = newCode;
            req.session.auth.resetCredentialsEmailsSent += 1;
            const msg = getResetCredentialsEmail(req);
            await sendEmail(msg);
            pageObj.emailSent = true;
            pageObj.emailsLeft = MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsEmailsSent;
            return res.status(200).render(view, { layout: false, pageObj });
        }
        // reset credentials 
        pageObj.resettingCredentials = true;
        return res.status(200).render(view, { layout: false, pageObj });
    }
    catch (error) {
        pageObj.canResetCredentials = false;
        pageObj.canResetCredentialsMessage = 'Sorry, something went wrong on our side. Try reloading the page to reset your credentials.';
        return res.status(200).render(view, { layout: false, pageObj });
    }
}
exports.postResetCredentials2fa = postResetCredentials2fa;
async function resendResetCredentialsEmail(req, res) {
    const actionString = 'reset your credentials';
    try {
        if (!!!req.session.auth || !!!req.session.tempResetCredentials)
            throw new Error('Auth should be set by now.');
        if (req.session.auth.resetCredentialsEmailsSent > MAX_RESET_CREDENTIALS_EMAIL) {
            throw new Error('You have exceed the number of emails that we can send per day for you to reset your login credentials.');
        }
        const code = get2faCode();
        req.session.tempResetCredentials.tfa_code = code;
        const msg = getResetCredentialsEmail(req);
        await sendEmail(msg);
        req.session.auth.resetCredentialsEmailsSent += 1;
        const html = ejs_1.default.render(sentEmailNotification, {
            email: req.session.tempResetCredentials.email,
            emailsLeft: MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsEmailsSent,
            action: actionString
        });
        return res.status(200).send(html);
    }
    catch (error) {
        console.error(error);
        const html = ejs_1.default.render(sentEmailErrorNotification, {
            action: actionString
        });
        return res.status(200).send(html);
    }
}
exports.resendResetCredentialsEmail = resendResetCredentialsEmail;
async function finishResetCredentials(req, res) {
    try {
        if (!!!req.session.tempResetCredentials || !!!req.session.settings)
            throw new Error('These values should be set by now.');
        const { username, password, email } = req.session.tempResetCredentials;
        const queryString = `UPDATE users SET user_username=$1::TEXT, user_password=$2::TEXT WHERE user_email=$3;`;
        const db = (0, database_1.default)();
        await db.query(queryString, [username, password, email]);
        delete req.session.tempResetCredentials;
        return res.status(200).send(/*html*/ `
        <div class="snackbar success" aria-hidden="false" role="alert" data-snacktime="4000"
        hx-trigger="load delay:1.5s"
        hx-get="/login"
        hx-target="#PAGE"
        hx-indicator="#page-transition-progress"
        hx-push-url="true"
        >
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Check"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
          <p class="p-sm">
            You have successfully reset your credentials!
          </p>
        </div>
    `);
    }
    catch (error) {
        console.error(error);
        const errorAlert = /*html*/ `
<div class="alert filled icon medium error" role="alert">
  <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Error"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
  <p class="alert">
    Something went wrong resetting your login credentials. Try reloading the page to try again.  
  </p>
  <button aria-label="Close Alert" class="icon medium close-alert" type="button">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Close"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
  </button>
</div>
    `;
        return res.status(200).send(errorAlert);
    }
}
exports.finishResetCredentials = finishResetCredentials;
/* ----------------------------------- Send email ---------------------------- */
function sendEmail(data) {
    return new Promise((resolve, reject) => {
        mail_1.default.send(data)
            .then(() => {
            resolve(true);
        })
            .catch((error) => reject(error));
    });
}
exports.sendEmail = sendEmail;
/* ------------------------------------- Helper functions -------------------- */
/**
 * Generate an encrypted password - the one that should be stored in the database
 * @param plainTextPassword
 * @returns
 */
async function hashPassword(plainTextPassword) {
    const saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt_1.default.hash(plainTextPassword, saltRounds, function (err, hash) {
            if (err)
                reject('Something went wrong hashing the password.');
            else
                resolve(hash);
        });
    });
}
/**
 * Compare an encrypted password to a plain text password. TRhis should be done on login
 * Returns true if the passwords are the same
 */
async function comparePasswords(plainTextPassword, hash) {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(plainTextPassword, hash, function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}
/**
 * Make sure that a username does not exist already
 */
async function usernameAndEmailDoesNotExist(username, email) {
    const queryString = 'SELECT id FROM users WHERE user_username=$1::TEXT OR user_email=$2::TEXT;';
    const db = (0, database_1.default)();
    try {
        const res = await db.query(queryString, [username, email]);
        if (res.rows.length) {
            return {
                exists: true, error: 'A user with this username or email already exists.'
            };
        }
        else {
            return { exists: false, error: '' };
        }
    }
    catch (error) {
        return { exists: true, error: 'Something went wrong querying the database. Try reloading the page.' };
    }
}
/**
 * Function to validate username
 * @param s
 * @returns
 */
function validateUsername(s) {
    if (typeof s !== 'string') {
        return { valid: false, error: 'Username must be a string.' };
    }
    else if (/\s/.test(s)) {
        return { valid: false, error: 'Username must not contain any spaces.' };
    }
    const username = s.trim();
    if (username === 'Anonymous') {
        return { valid: false, error: 'Username cannot be equal to \'Anonymous\'.' };
    }
    else if (username.length < 4 || username.length > 50) {
        return { valid: false, error: 'Username must be between 4 and 50 characters long inclusive.' };
    }
    else if (!!!USERNAME_REGEX.test(username)) {
        return { valid: false, error: 'Please enter a valid username.' };
    }
    else {
        return { valid: true, error: '' };
    }
}
/**
 * Validate email
 * @param userInput
 * @returns
 */
function validateEmail(userInput) {
    if (typeof userInput !== 'string') {
        return {
            valid: false,
            error: 'Email must be a string.'
        };
    }
    else if (!!!EMAIL_REGEX.test(userInput)) {
        return {
            valid: false,
            error: 'Please enter a valid email.'
        };
    }
    else {
        return {
            valid: true,
            error: ''
        };
    }
}
/**
 * validate password
 * @param userInput
 */
function validatePassword(userInput) {
    if (typeof userInput !== 'string') {
        return {
            valid: false,
            error: 'Password must be a string.'
        };
    }
    else if (!!!PASSWORD_REGEX.test(userInput)) {
        return {
            valid: false,
            error: 'Please enter a valid password.'
        };
    }
    else {
        return {
            valid: true,
            error: ''
        };
    }
}
/**
 * validate 2fa
 * @param s
 */
function validate2FA(userInput, correct2fa) {
    if (typeof userInput !== 'string') {
        return {
            valid: false,
            error: 'Two Factor Authentication input must be a string.'
        };
    }
    else if (typeof correct2fa !== 'string') {
        return {
            valid: false,
            error: 'Something went wrong on our side. Try reloading the page.'
        };
    }
    else if (userInput !== correct2fa) {
        return {
            valid: false,
            error: 'Please enter the valid two factor authentication code.'
        };
    }
    else {
        return {
            valid: true,
            error: ''
        };
    }
}
/* --------------------------------------- logout ------------------------ */
async function getLogout(req, res) {
    if (req.session.auth) {
        req.session.auth.level = 0;
        req.session.auth.userID = undefined;
        req.session.auth.username = undefined;
        req.session.auth.email = undefined;
        req.session.auth.date_created = 0;
    }
    const io = (0, __1.getWebSocketServer)();
    io.to(req.session.id).emit('logout');
    const html = /*html*/ `<div hx-trigger="load" hx-get="/" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`;
    return res.status(200).send(html);
}
exports.getLogout = getLogout;
/* --------------------------------------- Account ------------------------ */
async function getRelevantAccountInfo(req) {
    var _a, _b, _c;
    var type_html = 'description_mobile_html';
    if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) {
        type_html = 'description_desktop_html';
    }
    else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) {
        type_html = 'description_tablet_html';
    }
    const user_info_query = `SELECT user_username AS username, user_date_created AS date_created, profile_picture AS pp, user_email as email, ${type_html} as html FROM users WHERE id=$1;`;
    const resp = await (0, database_1.default)().query(user_info_query, [parseInt(String(((_c = req.session.auth) === null || _c === void 0 ? void 0 : _c.userID) || 0))]);
    if (resp.rows.length !== 1)
        throw new Error("Unable to find user with the given id.");
    const { username, date_created, html, pp, email } = resp.rows[0];
    return { username, date_created, html, pp, email };
}
async function getAccount(req, res) {
    var _a;
    try {
        const view = 'pages/account/account';
        const { username, date_created, html, pp, email } = await getRelevantAccountInfo(req);
        const pageObj = {
            username,
            dateCreated: TIME.formatDateFromUnixTime('YYYY-MM-DD', ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York', date_created),
            email,
            pp,
            html
        };
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Account', item: '/account', position: 2 }];
        const title = "Your Account";
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Your account information for frankmbrown.net"];
        const description = 'Edit your account information.';
        const tableOfContents = [{ id: "recent-activity", text: "Recent Activity" }];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/account', noIndex: true };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        console.log(encodeURIComponent(JSON.stringify({ src: pp, shortDescription: 'Profile Picture', longDescription: '' })));
        const imageInput = `<label for="profile-pic-input" class="bold mt-2">Profile Picture:</label>
    <input data-image-input data-prevent-default data-profile-picture data-ignore data-default-value="${encodeURIComponent(JSON.stringify([{ src: pp, shortDescription: 'Profile Picture', longDescription: '' }]))}" type="file" id="profile-pic-input" accept="image/*" name="profile-pic-input" class="mt-1 primary">
    <output class="block" for="profile-pic-input">
    </output>`;
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            pageObj,
            imageInput
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 500, { severity: 'error', message: "Something went wrong getting the account page." });
    }
}
exports.getAccount = getAccount;
const getEditAccountForm = (typ, innerHtml) => {
    return `<form class="mt-2" hx-post="/account/${typ}" hx-trigger="submit" hx-target="this" data-loading="Updating Account..." hx-swap="outerHTML">${innerHtml}<div class="mt-2 flex-row justify-end"><button type="submit" aria-label="Submit" class="success filled icon-text medium"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT</button></div></form>`;
};
async function getEditUsername(req, res) {
    try {
        const { username } = await getRelevantAccountInfo(req);
        const html = `<div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="true">
  <label for="new-username">New Username:</label>
  <div class="text-input block medium">
      <input 
      type="text" 
      name="new-username" 
      id="new-username" 
      class="medium icon-before mt-1" 
      required
      value="${username}"
      placeholder="Enter New Username" 
      maxlength="50"
      minlength="4" 
      pattern="^(?!Anonymous$)(?!.*\s)(.{4,50})$" 
      spellcheck="true" 
      autocapitalize="off"
      >
      <svg class="icon-before" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="AccountCircleSharp">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z">
          </path>
      </svg>
  </div>
</div>`;
        return res.status(200).send(getEditAccountForm('username', html));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong getting edit the username.");
    }
}
exports.getEditUsername = getEditUsername;
async function getEditPassword(req, res) {
    try {
        const html = `<div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
  <label for="new-password">New Password:</label>
  <div class="text-input block medium">
      <input 
      name="new-password" 
      id="new-password" 
      class="mt-1 medium icon-after" 
      placeholder="Enter your new password"  
      autocomplete="new-password" 
      autocapitalize="off" 
      spellcheck="true" 
      type="password" 
      required
      pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z]).{8,}$"
      >
      <button class="icon-after icon medium" data-vis-switch type="button" aria-label="Change Visibility">
          <svg focusable="false" inert viewBox="0 0 24 24">
              <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z">
              </path>
          </svg>
          <svg hidden="" focusable="false" inert viewBox="0 0 24 24">
              <path d="M12 6.5c2.76 0 5 2.24 5 5 0 .51-.1 1-.24 1.46l3.06 3.06c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l2.17 2.17c.47-.14.96-.24 1.47-.24zM3.42 2.45 2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.97-.3 4.31-.82l3.43 3.43 1.41-1.41L3.42 2.45zM12 16.5c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07L14.14 16c-.65.32-1.37.5-2.14.5zm2.97-5.33c-.15-1.4-1.25-2.49-2.64-2.64l2.64 2.64z">
              </path>
          </svg>
      </button>
  </div>
</div>`;
        return res.status(200).send(getEditAccountForm('password', html));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong getting edit the password.");
    }
}
exports.getEditPassword = getEditPassword;
async function getEditDescription(req, res) {
    try {
        const { html } = await getRelevantAccountInfo(req);
        const commentImplementation = (0, lexicalImplementations_1.getCommentImplementation)(req, 'new-description', false, html);
        return res.status(200).send(getEditAccountForm('description', `<p class="mt-2"><span class="bold body1">New Description:</span></p>` + commentImplementation));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong getting edit the description.");
    }
}
exports.getEditDescription = getEditDescription;
const getReloadPageScript = (req, msg) => {
    const nonce = req.session.jsNonce || '';
    return (0, html_1.getSuccessAlert)(msg).concat(`<script nonce="${nonce}"> (() => {
  setTimeout(() => {
    window.location.reload();
  },1000); 
})();</script>`);
};
async function postEditProfilePicture(req, res) {
    var _a;
    try {
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || 0;
        const ip_id = req.session.ip_id;
        if (!!!ip_id)
            throw new Error("Unable to get ip id.");
        const input = req.body['profile-picture-text'];
        if (!!!input.startsWith('https://image.storething.org'))
            throw new Error("Something went wrong updating the profile picture.");
        const image = await (0, image_1.getImageFromUrl)(input);
        const newImage = await (0, image_1.createProfilePicture)(image);
        const pilImage = await (0, projects_1.convertImageToPillowCompatable)(newImage, false);
        const base64String = pilImage.toString('base64');
        const body = { image: base64String };
        if (!!!IS_DEVELOPMENT_1.default) {
            const response = await (0, projects_1.postToPythonBackend)('/python/safe-search-image', body, 7000);
            const nsfw = Math.round(Number(response.filter((obj) => obj.label === "nsfw")[0].score.toFixed(2)) * 100);
            if (nsfw > 20) {
                throw new Error("Unsafe profile picture");
            }
        }
        const key = 'frankmbrown/'.concat(node_crypto_1.default.randomUUID()).concat('.png');
        const newURL = await (0, aws_implementation_1.uploadImageObject)(key, newImage, 'png', {}, user_id, ip_id);
        await (0, projects_1.uploadPageImageFromUrl)(req, newURL);
        await (0, database_1.default)().query(`UPDATE users SET profile_picture=$1 WHERE id=$2;`, [newURL, user_id]);
        return res.status(200).send('');
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went posting the new profile picture.");
    }
}
exports.postEditProfilePicture = postEditProfilePicture;
async function postEditUsername(req, res) {
    var _a;
    try {
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || 0;
        const input = req.body['new-username'];
        const validateUsernameObj = validateUsername(input);
        if (!!!validateUsernameObj.valid)
            throw new Error("Invalid Username...");
        await (0, database_1.default)().query(`UPDATE users SET user_username=$1 WHERE id=$2;`, [input, user_id]);
        return res.status(200).send(getReloadPageScript(req, 'Successfully updated username!'));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went posting the new username.");
    }
}
exports.postEditUsername = postEditUsername;
async function postEditPassword(req, res) {
    var _a;
    try {
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || 0;
        const input = req.body['new-password'];
        const validatePasswordObj = validatePassword(input);
        if (!!!validatePasswordObj.valid)
            throw new Error("Invalid Password...");
        const hashedPassword = await hashPassword(input);
        await (0, database_1.default)().query(`UPDATE users SET user_password=$1 WHERE id=$2;`, [hashedPassword, user_id]);
        return res.status(200).send(getReloadPageScript(req, 'Successfully updated password!'));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went posting the new password.");
    }
}
exports.postEditPassword = postEditPassword;
async function postEditDescription(req, res) {
    var _a;
    try {
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || 0;
        const input = req.body['new-description'];
        const body = JSON.parse(input);
        const { editorState, desktop_html, tablet_html, mobile_html, able_to_validate, contains_nsfw } = await (0, lexical_1.parseCommentLexicalEditor)(body);
        if (!!!able_to_validate || contains_nsfw) {
            throw new Error("Wait a while before posting description. Need to validate that everything does not contain unsafe material.");
        }
        await (0, database_1.default)().query(`UPDATE users SET description_editor_state=$1, description_desktop_html=$2, description_tablet_html=$3, description_mobile_html=$4 WHERE id=$5;`, [editorState, desktop_html, tablet_html, mobile_html, user_id]);
        return res.status(200).send(getReloadPageScript(req, 'Successfully updated description!'));
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went posting the new description.");
    }
}
exports.postEditDescription = postEditDescription;
/* --------------------------------------- Users ------------------------ */
async function getUser(req, res) {
    var _a, _b, _c;
    try {
        const { id: idStr, username: username_init } = req.params;
        var type_html = 'description_mobile_html';
        if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop) {
            type_html = 'description_desktop_html';
        }
        else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet) {
            type_html = 'description_tablet_html';
        }
        const resp = await (0, database_1.default)().query(`SELECT id, user_username AS username, user_date_created AS date_created, profile_picture AS pp, ${type_html} as html FROM users WHERE id=$1;`, [idStr]);
        const row = resp.rows[0];
        if (!!!row)
            throw new Error("Unable to find user.");
        const view = 'pages/account/user';
        const pageObj = {};
        const { id, username, date_created, pp, html } = row;
        pageObj.id = id;
        pageObj.username = username;
        const tz = ((_c = req.session.settings) === null || _c === void 0 ? void 0 : _c.timezone) || 'America/New_York';
        const date_created_text = TIME.formatDateFromUnixTime('dddd MMMM D, YYYY', tz, Number(date_created));
        const datetime = TIME.getDateTimeStringFromUnix(Number(date_created), true);
        pageObj.date_created_text = date_created_text;
        pageObj.datetime = datetime;
        pageObj.pp = pp;
        pageObj.html = html;
        const userInfo = await (0, getUserInfoHelper_1.getUserInformation)(req, id);
        pageObj.comments = userInfo.comments;
        pageObj.annotations = userInfo.annotations;
        pageObj.likes = userInfo.likes;
        pageObj.upvotes = userInfo.upvotes;
        pageObj.downvotes = userInfo.downvotes;
        const description = html.replace(/<\/?[^>]+(>|$)/g, '');
        const breadcrumbs = [
            { name: 'Home', item: '/', position: 1 },
            { name: username, item: `/users/${encodeURIComponent(id)}/${encodeURIComponent(username)}`, position: 2 },
        ];
        const title = username;
        const keywords = description.split(/\s+/);
        const tableOfContents = [
            {
                "id": "user-activity",
                "text": "User Activity"
            },
        ];
        const image = pp;
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: `/users/${encodeURIComponent(id)}/${encodeURIComponent(username)}`, image };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            pageObj
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: "error", message: "Unable to find requested user." });
    }
}
exports.getUser = getUser;
