import { Request, Response } from 'express';
import type { Breadcrumbs, TableOfContentsItem, SEO, SUPPORTED_CODEMIRROR_THEMES, VALID_AI_WRITER_MODELS_TYPE, VALID_AI_CODER_MODELS_TYPE } from '../../types';
import { getRequiredVariables } from '../helper_functions/frontendHelper';
import ejs from 'ejs';
import getDatabase from '../../database';
import bcrypt from 'bcrypt';
import sgMail from '@sendgrid/mail';
import env from '../../utils/env';
import fs from 'fs';
import path from 'path';
import * as TIME from '../../utils/time';
import { createUserSettingsInDatabase } from '../functions/settingsHandler';
import { redirect } from '../helper_functions/redirect-override';
import type { ALLOWED_APPLICATION_LANGUAGES } from '../functions/settingsHandler';
import { createDefaultProfilePicture, createProfilePicture, createTwitterAndLinkedInImages, getImageFromUrl } from '../../utils/image';
import { getUserIdAndIpIdForImageUpload, uploadImageObject } from '../../aws/aws-implementation';
import { getWebSocketServer } from '../..';
import crypto from 'node:crypto';
import { getCommentImplementation } from './lexicalImplementations';
import { parseCommentLexicalEditor } from '../../lexical';
import { convertImageToPillowCompatable, postToPythonBackend, uploadPageImageFromUrl } from './projects';
import { getSuccessAlert } from '../html';
import IS_DEVELOPMENT from '../../CONSTANTS/IS_DEVELOPMENT';
import { getUserInformation } from './article_helpers/getUserInfoHelper';

const CREATE_ACCOUNT_EMAIL = fs.readFileSync(path.resolve(__dirname,'..','..','..','..','views','emails','create-account.ejs'),{encoding:'utf-8'});
const RESET_CREDENTIALS_EMAIL = fs.readFileSync(path.resolve(__dirname,'..','..','..','..','views','emails','reset-credentials.ejs'),{encoding:'utf-8'});
const sentEmailNotification = /*html*/`<div class="flex-row justify-center">
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

const sentEmailErrorNotification = /*html*/`<div class="flex-row justify-center">
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
const sendGridApiKey = env.SENDGRID_API_KEY;
if (!!!sendGridApiKey) throw new Error('Unable to locate the sendgrid API key.');
sgMail.setApiKey(sendGridApiKey);

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
const getCanLogin = (req: Request) => {
  return Boolean(Number(req?.session?.auth?.loginAttempts) < MAX_LOGIN_ATTEMPTS && Number(req?.session?.auth?.level)===0 && req?.session?.auth?.banned!==true && req.session.cookiePreferences?.showedBanner===true);
}
type LoginFormPageObj = {
  canLogin: boolean,
  canLoginMessage: string, // message to be shown if user can't login
  username: string,
  password: string,
  loginError: boolean,
  loginErrorMessage: string
}
function getLogin(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Login', item: '/login', position: 2 }];
  const title = "Login to frankmbrown.net";
  const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Login", "Login to frankmbrown.net", "Login Functionality has not yet been implemented", "Blog", "Notes"];
  const description = 'Login to frankmbrown.net. Login functionality has not yet been implemented. Login functionality will be implemented if I ever decide to write a blog and decide to allow comments on posts.';
  const tableOfContents: TableOfContentsItem[] = [{id:  "login-form", text: "Login"}];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/login'};
  const requiredVariables = getRequiredVariables(req,SEO);

  const pageObj: LoginFormPageObj = {
    canLogin:getCanLogin(req),
    canLoginMessage: '',
    username: '',
    password: '',
    loginError: false,
    loginErrorMessage:''
  }
  if (!!!pageObj.canLogin) {
    if (Number(req?.session?.auth?.loginAttempts)>MAX_LOGIN_ATTEMPTS) {
      pageObj.canLoginMessage="You have exceeded the maximum number of login attempts.";
    } else if (Number(req?.session?.auth?.level)>=1) {
      pageObj.canLoginMessage="You are already logged in.";
    } else if (req?.session?.auth?.banned) {
      pageObj.canLoginMessage="You are banned from continued interaction with this platform.";
    } else if (!!!req.session.cookiePreferences?.showedBanner) {
      pageObj.canLoginMessage="Please accept of deny cookies before logging in.";
    }
  }
  return res.status(200).render('pages/account/login',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    pageObj
  })
}
type LoginQueryResponse = {
  id: number,
  user_username:string, 
  user_password:string, 
  user_email:string, 
  user_date_created:number, 
  user_banned:boolean,
  settings_mode: 'light'|'dark',
  disable_default_tab: boolean,
  tab_size: number,
  font_family: string,
  light_primary: string,
  light_secondary: string,
  light_warning: string,
  light_success: string,
  light_info: string,
  light_error: string,
  light_button_contrast_text: string,
  light_background: string,
  light_secondary_background: string,
  light_navbar_color: string,
  light_shadow_color: string,
  light_text_color: string,
  dark_primary: string,
  dark_secondary: string,
  dark_warning: string,
  dark_success: string,
  dark_info: string,
  dark_error: string,
  dark_button_contrast_text: string,
  dark_background: string,
  dark_secondary_background: string,
  dark_navbar_color: string,
  dark_shadow_color: string,
  dark_text_color: string,
  settings_string: string,
  spellcheck: boolean,
  code_editor_theme:SUPPORTED_CODEMIRROR_THEMES,
  code_editor_emmet:boolean,
  desktop_application_size:number,
  tablet_application_size:number,
  mobile_application_size:number,
  lang: ALLOWED_APPLICATION_LANGUAGES,
  timezone: TIME.ALLOWED_TIME_ZONE,
  create_annotation: boolean,
  create_note: boolean,
  update_note: boolean,
  create_blog: boolean,
  update_blog: boolean,
  create_idea: boolean,
  update_idea: boolean,
  create_comment: boolean,
  create_jupyter_notebook: boolean,
  create_markdown_note: boolean,
  create_stream_consciousness: boolean,
  create_daily_reading: boolean,
  create_tex_note: boolean,
  create_link: boolean,
  create_quote: boolean,
  create_project: boolean,
  project_update: boolean,
  create_survey: boolean, 
  create_goodreads: boolean, 
  create_letterboxd: boolean, 
  create_game: boolean, 
  create_3d_design: boolean,
  create_electronics: boolean,
  include_autocomplete_suggestions: boolean,
  enable_ai_writer: boolean,
  ai_writer_temperature: number,
  ai_writer_model: VALID_AI_WRITER_MODELS_TYPE,
  enable_ai_coder: boolean,
  ai_coder_temperature: number,
  ai_coder_model: VALID_AI_CODER_MODELS_TYPE,
  ai_coder_max_tokens: number,
  ai_writer_max_tokens: number
};
/**
 * Should render the loginForm
 * @param req 
 * @param res 
 * @returns 
 */
async function postLogin(req:Request,res:Response) {
  const view = 'pages/account/loginForm';
  const pageObj:LoginFormPageObj = {
    canLogin: true,
    canLoginMessage: '',
    username: '',
    password: '',
    loginError:false,
    loginErrorMessage:''
  };
  try {
    if (!!!req.session.auth) throw new Error('Something went wrong on our side.'); 
    req.session.auth.loginAttempts += 1;
    const { username, password } = req.body;
    const validateUsernameObj = validateUsername(username);
    const validatePasswordObj = validatePassword(password);
    if (typeof username==='string') pageObj.username = username;
    if (typeof password==='string') pageObj.password = password;
    if (!!!validateUsernameObj.valid) {
      pageObj.canLogin = getCanLogin(req);
      if (!!!pageObj.canLogin) {
        pageObj.canLoginMessage = 'You have exceeded the maximum limit of login attempts.';
      }
      pageObj.loginError = true;
      pageObj.loginErrorMessage = validateUsernameObj.error;
      return res.render(view,{ layout: false, pageObj: pageObj})
    } 
    if (!!!validatePasswordObj.valid) {
      pageObj.canLogin = getCanLogin(req);
      if (!!!pageObj.canLogin) {
        pageObj.canLoginMessage = 'You have exceeded the maximum limit of login attempts.';
      }
      pageObj.loginError = true;
      pageObj.loginErrorMessage = validatePasswordObj.error;
      return res.render(view,{ layout: false, pageObj: pageObj})
    }
    const db = getDatabase();
    const dbRes = await db.query(loginQueryString,[username]);
    if (!!!dbRes.rows.length) {
     pageObj.loginError=true;
     pageObj.loginErrorMessage='A user with this username and password combination does not exist.';
     return res.status(200).render(view,{ pageObj, layout: false });
    } 
    const { 
      id,
      user_username,
      user_password,
      user_email,
      user_date_created,
      user_banned,
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
      code_editor_theme,
      code_editor_emmet,
      desktop_application_size,
      tablet_application_size,
      mobile_application_size,
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
      ai_writer_max_tokens
    }:LoginQueryResponse = dbRes.rows[0];
    if (user_banned) {
      pageObj.canLogin=false;
      pageObj.canLoginMessage='You have been banned from interacting with this website.';
      req.session.auth.banned = user_banned;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    const passwordValid = await comparePasswords(password,user_password);
    if (!!!passwordValid) {
      pageObj.loginError=true;
      pageObj.loginErrorMessage = 'A user with this username / password combination does not exist.';
      return res.status(200).render(view, { layout: false, pageObj });
    }
    /**
     * Whether or not to call the endpoint that switches from light mode t
     * o dark mode
     */
    var changeMode: boolean = false;
    if (req.session.settings?.mode !==settings_mode) {
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
      ai_chat_id: 'chat_'.concat(crypto.randomUUID())
    }
    req.session.auth.level = Boolean(user_email==='owner@frankmbrown.net')?3:1;
    req.session.auth.loginAttempts = 0;
    req.session.auth.email = user_email;
    req.session.auth.username = user_username;
    req.session.auth.banned = user_banned;
    req.session.auth.userID = id;
    req.session.auth.date_created = Number(user_date_created);
    const io = getWebSocketServer();
    io.to(req.session.id).emit('login',{ changeMode });
    // <div  hx-trigger="load" hx-get="save-settings"></div>
    const html = /*html*/`<div  hx-trigger="load" hx-get="/" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`;
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    pageObj.canLogin = false;
    pageObj.canLoginMessage = 'Something Went wrong on our side. Try reloading the page.';
    return res.status(200).render(view,{ pageObj, layout: false });
  }
  
}

/* --------------------------------- create account --------------------------  */
const getCanCreateAccount = (req:Request) => {
  return Boolean(Number(req?.session?.auth?.level)<1 && !!!req?.session?.auth?.banned && Number(req?.session?.auth?.createAccountEmailsSent) < MAX_CREATE_ACCOUNT_EMAIL && Number(req.session.auth?.createAccountAttempts) < MAX_CREATE_ACCOUNT_ATTEMPTS);
}
const getCreateAccountMessage = (req:Request) => {
  if (Number(req?.session?.auth?.level)>=1) {
    return 'You can not create an account when you are already logged in.';
  } else if (Boolean(req?.session?.auth?.banned)) {
    return 'You are banned from interacting with this platform.';
  } else if (Number(req.session.auth?.createAccountEmailsSent)>=MAX_CREATE_ACCOUNT_EMAIL) {
    return 'You have exceeded the amount of emails that you are alloted per session to create an account.';
  } else if (Number(req.session.auth?.createAccountAttempts) >= MAX_CREATE_ACCOUNT_ATTEMPTS) {
    return 'You have exceeded the maximum number of attempts you have to create an account.';
  } else {
    return '';
  }
}
/**
 * Should already have set tempCreateAccount
 * @param req 
 * @returns 
 */
const getCreateAccountEmail = (req: Request) => {
  var textColor = '#000000';
  var backgroundColor = '#171717';
  if (req.session.settings) {
    const modeKey = req.session.settings.mode==="light" ? 'lightMode':'darkMode';
    const settingsObj = req.session.settings[modeKey];
    textColor = settingsObj.textColor;
    backgroundColor = settingsObj.background;
  }
  const html = ejs.render(CREATE_ACCOUNT_EMAIL,{
    backgroundColor: backgroundColor,
    textColor,
    username: req.session.tempCreateAccount?.username || '',
    code: req?.session?.tempCreateAccount?.tfa_code || ''
  });
  const msg = {
    to: req?.session?.tempCreateAccount?.email || '', // Change to your recipient
    from: 'owner@frankmbrown.net', // Change to your verified sender
    subject: 'Authenticate frankmbrown.net Account',
    html
  }
  return msg;
}
type CreateAccountPageObj = {
  canCreateAccount: boolean,
  canCreateAccountMessage: string,
  createAccountError: boolean,
  createAccountErrorMessage: string,
  email: string,
  username: string,
  password: string,
  twoFactorAuthentication: boolean,
  twoFactorAuthenticationCode: string,
  twoFactorAuthenticationError: boolean,
  twoFactorAuthenticationErrorMessage: string,
  emailSent:boolean,
  emailsLeft: number,
  creatingAccount: boolean
}
function getCreateAccount(req:Request,res:Response) {
  const view = 'pages/account/create-account';
  const pageObj: CreateAccountPageObj = {
    canCreateAccount: getCanCreateAccount(req),
    canCreateAccountMessage: getCreateAccountMessage(req),
    createAccountError: false,
    createAccountErrorMessage: '',
    email: '',
    username:  '',
    password: '',
    twoFactorAuthentication: false,
    twoFactorAuthenticationCode: '',
    twoFactorAuthenticationError: false,
    twoFactorAuthenticationErrorMessage: '',
    emailSent: false,
    emailsLeft: MAX_CREATE_ACCOUNT_EMAIL,
    creatingAccount: false
  };
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Create Account', item: '/create-account', position: 2 }];
  const title = "Create Account for frankmbrown.net";
  const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Create Account for frankmbrown.net"];
  const description = 'Create an account for frankmbrown.net using your email.';
  const tableOfContents: TableOfContentsItem[] = [{id:  "create-account-form", text: "Create Account"}];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/create-account'};
  const requiredVariables = getRequiredVariables(req,SEO);
  if (req?.session?.tempCreateAccount) delete req.session.tempCreateAccount;
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    pageObj
  });
}
async function postCreateAccount(req:Request,res:Response) {
  const view = 'pages/account/createAccountForm';
  const pageObj: CreateAccountPageObj = {
    canCreateAccount: getCanCreateAccount(req),
    canCreateAccountMessage: getCreateAccountMessage(req),
    createAccountError: false,
    createAccountErrorMessage: '',
    email: '',
    username:  '',
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
    return res.status(200).render(view,{ layout: false, pageObj });
  }
  try {
    if (!!!req.session.auth) throw new Error('auth should be set by now.');
    req.session.auth.createAccountAttempts += 1;
    const { username, password, email } = req.body;
    const validateUsernameObj = validateUsername(username);
    const validatePasswordObj = validatePassword(password);
    const validateEmailObj = validateEmail(email);
    if (typeof username==='string') {
      pageObj.username = username;
    }
    if (typeof password==='string') {
      pageObj.password = password;
    }
    if (typeof email==='string') {
      pageObj.email = email;
    }
    if(!!!validateUsernameObj.valid) {
      pageObj.createAccountError=true;
      pageObj.createAccountErrorMessage = validateUsernameObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    if (!!!validatePasswordObj.valid) {
      pageObj.createAccountError=true;
      pageObj.createAccountErrorMessage = validatePasswordObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    if (!!!validateEmailObj.valid) {
      pageObj.createAccountError=true;
      pageObj.createAccountErrorMessage = validateEmailObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    const [hashedPassword,usernameOrEmailExists] = await Promise.all([
      hashPassword(password),
      usernameAndEmailDoesNotExist(username,email)
    ]);
    if (usernameOrEmailExists.exists) {
      pageObj.createAccountError = true;
      pageObj.createAccountErrorMessage = usernameOrEmailExists.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    const code = get2faCode();
    req.session.tempCreateAccount = {
      username,
      password: hashedPassword,
      email,
      tfa_code: code
    };
    if(req.session.auth&&req.session.settings) {
      req.session.auth.createAccountEmailsSent+=1;
      pageObj.emailsLeft = MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent;
      const msg = getCreateAccountEmail(req);
      await sendEmail(msg);
      pageObj.twoFactorAuthentication = true;
      pageObj.emailSent = true;
      return res.status(200).render(view, { layout: false, pageObj });
    } else {
      throw new Error('The auth should be set here.');
    }
  } catch (error) {
    pageObj.canCreateAccount=false;
    pageObj.canCreateAccountMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
    return res.status(200).render(view,{ layout: false, pageObj });
  }
}
async function postCreateAccount2fa(req:Request,res:Response) {
  const view = 'pages/account/createAccountForm';
  const { two_factor_code } = req.body;
  const pageObj: CreateAccountPageObj = {
    canCreateAccount: getCanCreateAccount(req),
    canCreateAccountMessage: getCreateAccountMessage(req),
    createAccountError: false,
    createAccountErrorMessage: '',
    email: '',
    username:  '',
    password: '',
    twoFactorAuthentication: true,
    twoFactorAuthenticationCode: '',
    twoFactorAuthenticationError: false,
    twoFactorAuthenticationErrorMessage: '',
    emailSent: true,
    emailsLeft:MAX_CREATE_ACCOUNT_EMAIL,
    creatingAccount: false 
  };
  
  try {
    if (!!!req.session.tempCreateAccount||!!!req.session.auth) throw new Error('These values should be set by now.');
    const { email, password, username, tfa_code } = req.session.tempCreateAccount;
    pageObj.email = email;
    pageObj.password = password;
    pageObj.username = username;
    if (typeof two_factor_code==='string') {
      pageObj.twoFactorAuthenticationCode = two_factor_code;
    }
    const validTwoFactorAuthenticationCode = validate2FA(two_factor_code,tfa_code);
    if(!!!validTwoFactorAuthenticationCode.valid) {
      if (req.session.auth.createAccountEmailsSent>=MAX_CREATE_ACCOUNT_EMAIL) throw new Error('You have exceeded the amount of emails you can utilize to create an account.');
      pageObj.twoFactorAuthenticationError = true;
      pageObj.twoFactorAuthenticationErrorMessage = validTwoFactorAuthenticationCode.error;
      const newCode = get2faCode();
      req.session.tempCreateAccount.tfa_code = newCode;
      req.session.auth.createAccountEmailsSent+=1;
      const msg = getCreateAccountEmail(req);
      await sendEmail(msg);
      pageObj.emailSent = true;
      pageObj.emailsLeft = MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent;
      return res.status(200).render(view,{ layout : false, pageObj });
    } 
    // create account - make sure to delete tempCreateAccount
    pageObj.creatingAccount = true;
    return res.status(200).render(view, { layout: false, pageObj });
  } catch (error) {
    pageObj.canCreateAccount=false;
    pageObj.canCreateAccountMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
    return res.status(200).render(view,{ layout: false, pageObj });
  }
}
async function getCreateAccountSendEmail(req:Request,res:Response) {
  const actionString = 'create an account';
  try {
    
    if (!!!req.session.auth||!!!req.session.tempCreateAccount) throw new Error('Auth should be set by now.');
    if (req.session.auth.createAccountEmailsSent>MAX_CREATE_ACCOUNT_EMAIL) {
      throw new Error('You have exceed the number of emails that we can send per day for you to reset your login credentials.');
    }
    const newCode = get2faCode();
    req.session.tempCreateAccount.tfa_code = newCode;
    const msg = getCreateAccountEmail(req);
    await sendEmail(msg);
    req.session.auth.createAccountEmailsSent+=1;
    const html = ejs.render(sentEmailNotification,{
      email: req.session.tempCreateAccount.email,
      emailsLeft: MAX_CREATE_ACCOUNT_EMAIL - req.session.auth.createAccountEmailsSent,
      action: actionString
    });
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    const html = ejs.render(sentEmailErrorNotification,{
      action: actionString
    });
    return res.status(200).send(html);
  }
}
async function finishCreateAccount(req:Request,res:Response) {
  try {
    
    if (!!!req.session.tempCreateAccount||!!!req.session.settings) throw new Error('These values should be set by now.');
    const { username, password, email } = req.session.tempCreateAccount;
    const db = getDatabase();
    const now = TIME.getUnixTime();
    const profile_picture = await createDefaultProfilePicture(username);
    const { twitter, linkedin }  = await createTwitterAndLinkedInImages(profile_picture.buffer,profile_picture.background);
    const name = crypto.randomUUID().concat('.jpg');
    const key = `frankmbrown/${name}`;
    const twitterKey = `frankmbrown/twitter/${name}`;
    const pageKey = `frankmbrown/og-image/${name}`;
    const {ip_id} = getUserIdAndIpIdForImageUpload(req);
    const [url,...rest]  = await Promise.all([
      uploadImageObject(key,profile_picture.buffer,'jpg',{},null,ip_id),
      uploadImageObject(twitterKey,twitter,'jpg',{"no-index": "true"},null,ip_id),
      uploadImageObject(pageKey,linkedin,'jpg',{"no-index": "true"},null,ip_id)
    ])
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
    const createAccountRes = await db.query(queryStr,[username,password,email,now,url]);
    const userID = createAccountRes.rows[0].id;
    await createUserSettingsInDatabase(req,userID); 
    delete req.session.tempCreateAccount;
    return res.status(200).send(/*html*/`
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
  } catch (error) {
    console.error(error);
    const errorAlert = /*html*/`
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
/* ---------------------------------- Forgot Username Password ------------------------------------- */ 
type ResetCredentialsPageObj = {
  canResetCredentials: boolean, //
  canResetCredentialsMessage: string, // 
  resetCredentialsError: boolean, //
  resetCredentialsErrorMessage: string, // 
  email: string,
  newUsername: string,
  newPassword: string,
  twoFactorAuthentication: boolean,
  twoFactorAuthenticationCode: string,
  twoFactorAuthenticationError: boolean,
  twoFactorAuthenticationErrorMessage: string,
  emailSent:boolean,
  emailsLeft: number,
  resettingCredentials: boolean
};
const getCanResetCredentials = (req:Request) => {
  return Boolean(Number(req?.session?.auth?.resetCredentialsEmailsSent) < MAX_RESET_CREDENTIALS_EMAIL && Number(req?.session?.auth?.level)===0 && req?.session?.auth?.banned!==true && Number(req.session.auth?.resetCredentialsAttempts) < MAX_RESET_CREDENTIALS_ATTEMPTS);
}
const getCanResetCredentialsMessage = (req:Request) => {
  if (Number(req?.session?.auth?.level)>=1) {
    return 'You can not reset your credentials when you are already logged in.';
  } else if (Boolean(req?.session?.auth?.banned)) {
    return 'You are banned from interacting with this platform.';
  } else if (Number(req.session.auth?.resetCredentialsEmailsSent)>=MAX_RESET_CREDENTIALS_EMAIL) {
    return 'You have exceeded the amount of emails that you are alloted per session to reset your credentials.';
  } else if (Number(req.session.auth?.resetCredentialsAttempts) >= MAX_RESET_CREDENTIALS_ATTEMPTS) {
    return 'You have exceeded the maximum number of attempts you have to reset your credentials.';
  } else {
    return '';
  }
}
const getResetCredentialsEmail = (req: Request) => {
  var textColor = '#000000';
  var backgroundColor = '#171717';
  if (req.session.settings) {
    const modeKey = req.session.settings.mode==="light" ? 'lightMode':'darkMode';
    const settingsObj = req.session.settings[modeKey];
    textColor = settingsObj.textColor;
    backgroundColor = settingsObj.background;
  }
  const html = ejs.render(RESET_CREDENTIALS_EMAIL,{
    backgroundColor: backgroundColor,
    textColor,
    username: req.session.tempResetCredentials?.username || '',
    code: req?.session?.tempResetCredentials?.tfa_code || ''
  });
  const msg = {
    to: req?.session?.tempResetCredentials?.email || '', // Change to your recipient
    from: 'owner@frankmbrown.net', // Change to your verified sender
    subject: 'Reset frankmbrown.net Account Credentials',
    html
  }
  return msg;
}
function getResetCredentials(req:Request,res:Response) {
  const resetCredentialsPageObj: ResetCredentialsPageObj = {
    canResetCredentials:  getCanResetCredentials(req), //
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
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: '', item: '/create-account', position: 2 }];
  const title = "Create Account for frankmbrown.net";
  const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Create Account for frankmbrown.net"];
  const description = 'Create an account for frankmbrown.net using your email.';
  const tableOfContents: TableOfContentsItem[] = [{id:  "create-account-form", text: "Create Account"}];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/create-account'};
  const requiredVariables = getRequiredVariables(req,SEO);
  if (req?.session?.tempResetCredentials) delete req.session.tempResetCredentials;
  return res.status(200).render('pages/account/reset-credentials',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    pageObj: resetCredentialsPageObj
  });
}
async function postResetCredentials(req:Request,res:Response) {
  const view = 'pages/account/resetCredentialsForm';
  const pageObj: ResetCredentialsPageObj = {
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
    
    if (!!!req.session.auth) throw new Error('Auth should be set by now.');
    req.session.auth.resetCredentialsAttempts += 1;
    const { new_username, email, new_password } = req.body;
    const validateUsernameObj = validateUsername(new_username);
    const validatePasswordObj = validatePassword(new_password);
    const validateEmailObj = validateEmail(email);
    if (typeof new_username==='string') {
      pageObj.newUsername = new_username;
    }
    if (typeof new_password==='string') {
      pageObj.newPassword = new_password;
    }
    if (typeof email==='string') {
      pageObj.email = email;
    }
    if(!!!validateUsernameObj.valid) {
      pageObj.resetCredentialsError=true;
      pageObj.resetCredentialsErrorMessage = validateUsernameObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    if (!!!validatePasswordObj.valid) {
      pageObj.resetCredentialsError=true;
      pageObj.resetCredentialsErrorMessage = validatePasswordObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    if (!!!validateEmailObj.valid) {
      pageObj.resetCredentialsError=true;
      pageObj.resetCredentialsErrorMessage = validateEmailObj.error;
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    const queryStr = 'SELECT id FROM users WHERE user_email=$1::TEXT;';
    const db = getDatabase();
    const [hashedPassword,emailExists] = await Promise.all([
      hashPassword(new_password),
      db.query(queryStr,[email])
    ]);
    if (!!!emailExists.rows.length) {
      pageObj.resetCredentialsError = true;
      pageObj.resetCredentialsErrorMessage = 'A user with this email does not exist.';
      return res.status(200).render(view,{ layout: false, pageObj });
    }
    const code = get2faCode();
    req.session.tempResetCredentials = {
      username: new_username,
      password: hashedPassword,
      email,
      tfa_code: code
    };
    if(req.session.auth&&req.session.settings) {
      req.session.auth.resetCredentialsEmailsSent+=1;
      pageObj.emailsLeft = MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsAttempts;
      const msg = getResetCredentialsEmail(req);
      await sendEmail(msg);
      pageObj.twoFactorAuthentication = true;
      pageObj.emailSent = true;
      return res.status(200).render(view, { layout: false, pageObj });
    } else {
      throw new Error('The auth should be set here.');
    }
  } catch (error) {
    pageObj.canResetCredentials=false;
    pageObj.canResetCredentialsMessage = 'Sorry, something went wrong on our side. Try reloading the page to create an account.';
    return res.status(200).render(view,{ layout: false, pageObj });
  }
}
async function postResetCredentials2fa(req:Request,res:Response) {
  const view = 'pages/account/resetCredentialsForm';
  const pageObj:ResetCredentialsPageObj = {
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
  if (!!!req.session.tempResetCredentials||!!!req.session.auth) throw new Error('These values should be set by now.');
  const { email, password, username, tfa_code } = req.session.tempResetCredentials;
  pageObj.email = email;
  pageObj.newPassword = password;
  pageObj.newUsername = username;
  if (typeof two_factor_code==='string') {
    pageObj.twoFactorAuthenticationCode = two_factor_code;
  }
  const validTwoFactorAuthenticationCode = validate2FA(two_factor_code,tfa_code);
  if(!!!validTwoFactorAuthenticationCode.valid) {
    if (req.session.auth.resetCredentialsAttempts>=MAX_RESET_CREDENTIALS_ATTEMPTS) throw new Error('You have exceeded the amount of emails you can utilize to reset your credentials.');
    pageObj.twoFactorAuthenticationError = true;
    pageObj.twoFactorAuthenticationErrorMessage = validTwoFactorAuthenticationCode.error;
    const newCode = get2faCode();
    req.session.tempResetCredentials.tfa_code = newCode;
    req.session.auth.resetCredentialsEmailsSent+=1;
    const msg = getResetCredentialsEmail(req);
    await sendEmail(msg);
    pageObj.emailSent = true;
    pageObj.emailsLeft = MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsEmailsSent;
    return res.status(200).render(view,{ layout : false, pageObj });
  }
  // reset credentials 
  pageObj.resettingCredentials = true;
  return res.status(200).render(view, { layout: false, pageObj });
  } catch (error) {
    pageObj.canResetCredentials=false;
    pageObj.canResetCredentialsMessage = 'Sorry, something went wrong on our side. Try reloading the page to reset your credentials.';
    return res.status(200).render(view,{ layout: false, pageObj });
  }
}
async function resendResetCredentialsEmail(req:Request,res:Response) {
  const actionString = 'reset your credentials';
  try {
    
    if (!!!req.session.auth||!!!req.session.tempResetCredentials) throw new Error('Auth should be set by now.');
    if (req.session.auth.resetCredentialsEmailsSent>MAX_RESET_CREDENTIALS_EMAIL) {
      throw new Error('You have exceed the number of emails that we can send per day for you to reset your login credentials.');
    } 
    const code = get2faCode();
    req.session.tempResetCredentials.tfa_code = code;
    const msg = getResetCredentialsEmail(req);
    await sendEmail(msg);
    req.session.auth.resetCredentialsEmailsSent+=1;
    const html = ejs.render(sentEmailNotification,{
      email: req.session.tempResetCredentials.email,
      emailsLeft: MAX_RESET_CREDENTIALS_EMAIL - req.session.auth.resetCredentialsEmailsSent,
      action: actionString
    });
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    const html = ejs.render(sentEmailErrorNotification,{
      action: actionString
    });
    return res.status(200).send(html);
  }
}
async function finishResetCredentials(req:Request,res:Response) {
  try {
    
    if (!!!req.session.tempResetCredentials||!!!req.session.settings) throw new Error('These values should be set by now.');
    const { username, password, email } = req.session.tempResetCredentials;
    const queryString = `UPDATE users SET user_username=$1::TEXT, user_password=$2::TEXT WHERE user_email=$3;`;
    const db = getDatabase();
    await db.query(queryString,[username,password,email]);
    delete req.session.tempResetCredentials;
    return res.status(200).send(/*html*/`
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
  } catch (error) {
    console.error(error);
    const errorAlert = /*html*/`
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
/* ----------------------------------- Send email ---------------------------- */
export function sendEmail(data: sgMail.MailDataRequired) {
  return new Promise((resolve,reject)=> {
    sgMail.send(data)
    .then(() => {
      resolve(true);
    })
    .catch((error)=>reject(error));
  })
  
}

/* ------------------------------------- Helper functions -------------------- */
/**
 * Generate an encrypted password - the one that should be stored in the database
 * @param plainTextPassword 
 * @returns 
 */
async function hashPassword(plainTextPassword:string) {
  const saltRounds = 10;
  return new Promise<string>((resolve,reject) => {
    bcrypt.hash(plainTextPassword, saltRounds, function(err, hash) {
      if (err) reject('Something went wrong hashing the password.');
      else resolve(hash);
    });
  })
}
/**
 * Compare an encrypted password to a plain text password. TRhis should be done on login
 * Returns true if the passwords are the same
 */
async function comparePasswords(plainTextPassword: string, hash: string) {
  return new Promise<boolean>((resolve,reject)=>{
    bcrypt.compare(plainTextPassword, hash, function(err, result) {
      if (err) reject(err);
      else resolve(result);
    });
  })
}
/**
 * Make sure that a username does not exist already
 */
async function usernameAndEmailDoesNotExist(username: string,email:string) {
  const queryString = 'SELECT id FROM users WHERE user_username=$1::TEXT OR user_email=$2::TEXT;';
  const db = getDatabase();
  try {
    const res = await db.query(queryString,[username,email]);
    if (res.rows.length) {
      return { 
        exists: true, error: 'A user with this username or email already exists.'};
    }
    else {
      return { exists: false, error: ''}
    }
  } catch (error) {
    return { exists: true, error: 'Something went wrong querying the database. Try reloading the page.'}
  }
}

/**
 * Function to validate username
 * @param s 
 * @returns 
 */
function validateUsername(s:any) {
  if (typeof s!=='string') {
    return { valid: false, error: 'Username must be a string.'};
  } else if (/\s/.test(s)) {
    return { valid: false, error: 'Username must not contain any spaces.' };
  }
  const username = s.trim();
  if (username==='Anonymous') {
    return { valid: false, error: 'Username cannot be equal to \'Anonymous\'.'};
  } else if (username.length < 4 || username.length>50) {
    return { valid: false, error: 'Username must be between 4 and 50 characters long inclusive.'}
  } else if (!!!USERNAME_REGEX.test(username)) {
    return { valid: false, error: 'Please enter a valid username.'};
  } else {
    return { valid: true, error: ''};
  }
}

/**
 * Validate email
 * @param userInput 
 * @returns 
 */
function validateEmail(userInput:any) {
  if (typeof userInput !=='string') {
    return {
      valid: false,
      error: 'Email must be a string.'
    };
  } else if (!!!EMAIL_REGEX.test(userInput)) {
    return {
      valid: false,
      error: 'Please enter a valid email.'
    };
  } else {
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
function validatePassword(userInput:any) {
  if (typeof userInput!=='string') {
    return {
      valid: false,
      error: 'Password must be a string.'
    };
  } else if (!!!PASSWORD_REGEX.test(userInput)) {
    return {
      valid: false,
      error: 'Please enter a valid password.'
    }
  } else {
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
function validate2FA(userInput: any,correct2fa:any) {
  if (typeof userInput!=='string') {
    return {
      valid: false, 
      error: 'Two Factor Authentication input must be a string.'
    };
  } else if (typeof correct2fa!=='string') {
    return {
      valid: false,
      error: 'Something went wrong on our side. Try reloading the page.'
    }
  } else if (userInput!==correct2fa) {
    return {
      valid: false,
      error: 'Please enter the valid two factor authentication code.'
    };
  } else {
    return {
      valid: true,
      error: ''
    };
  }
}

/* --------------------------------------- logout ------------------------ */
async function getLogout(req:Request,res:Response) {
  if (req.session.auth) {
    req.session.auth.level = 0;
    req.session.auth.userID = undefined;
    req.session.auth.username = undefined;
    req.session.auth.email = undefined;
    req.session.auth.date_created = 0;
  }
  const io = getWebSocketServer();
  io.to(req.session.id).emit('logout');
  const html = /*html*/`<div hx-trigger="load" hx-get="/" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress"></div>`;
  return res.status(200).send(html);
}

/* --------------------------------------- Account ------------------------ */
async function getRelevantAccountInfo(req:Request) {
  var type_html = 'description_mobile_html';
  if (req.session.device?.desktop) {
    type_html = 'description_desktop_html'
  } else if (req.session.device?.tablet) {
    type_html = 'description_tablet_html';
  }
  const user_info_query = `SELECT user_username AS username, user_date_created AS date_created, profile_picture AS pp, user_email as email, ${type_html} as html FROM users WHERE id=$1;`;
  const resp = await getDatabase().query(user_info_query,[parseInt(String(req.session.auth?.userID || 0))]);
  if (resp.rows.length!==1) throw new Error("Unable to find user with the given id.");
  const { username, date_created, html, pp, email } = resp.rows[0];
  return { username, date_created, html, pp, email };
}
async function getAccount(req:Request,res:Response) {
  try {
    const view = 'pages/account/account';
    const { username, date_created, html, pp, email } = await getRelevantAccountInfo(req);
    const pageObj = {
      username,
      dateCreated: TIME.formatDateFromUnixTime('YYYY-MM-DD',req.session.settings?.timezone || 'America/New_York',date_created),
      email, 
      pp,
      html
    };
    const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Account', item: '/account', position: 2 }];
    const title = "Your Account";
    const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Your account information for frankmbrown.net"];
    const description = 'Edit your account information.';
    const tableOfContents: TableOfContentsItem[] = [{id:  "recent-activity", text: "Recent Activity"}];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/account', noIndex: true};
    const requiredVariables = getRequiredVariables(req,SEO);
    console.log(encodeURIComponent(JSON.stringify({src:pp,shortDescription:'Profile Picture',longDescription:''})));
    const imageInput = `<label for="profile-pic-input" class="bold mt-2">Profile Picture:</label>
    <input data-image-input data-prevent-default data-profile-picture data-ignore data-default-value="${encodeURIComponent(JSON.stringify([{ src:pp,shortDescription:'Profile Picture',longDescription:''}]))}" type="file" id="profile-pic-input" accept="image/*" name="profile-pic-input" class="mt-1 primary">
    <output class="block" for="profile-pic-input">
    </output>`    
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      pageObj,
      imageInput
    });

  } catch (e) {
    console.error(e);
    return redirect(req,res,'/',500,{ severity:'error',message:"Something went wrong getting the account page." });
  }
}
const getEditAccountForm = (typ:'username'|'password'|'description',innerHtml:string) => {
  return `<form class="mt-2" hx-post="/account/${typ}" hx-trigger="submit" hx-target="this" data-loading="Updating Account..." hx-swap="outerHTML">${innerHtml}<div class="mt-2 flex-row justify-end"><button type="submit" aria-label="Submit" class="success filled icon-text medium"><svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Send"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"></path></svg>SUBMIT</button></div></form>`;
}

export async function getEditUsername(req:Request,res:Response) {
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
    return res.status(200).send(getEditAccountForm('username',html));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went wrong getting edit the username.");
  }
}
export async function getEditPassword(req:Request,res:Response) {
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
    return res.status(200).send(getEditAccountForm('password',html));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went wrong getting edit the password.");
  }
}
export async function getEditDescription(req:Request,res:Response) {
  try {
    const { html } = await getRelevantAccountInfo(req);
    const commentImplementation = getCommentImplementation(req,'new-description',false,html);
    return res.status(200).send(getEditAccountForm('description',`<p class="mt-2"><span class="bold body1">New Description:</span></p>` + commentImplementation));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went wrong getting edit the description.");
  }
}
const getReloadPageScript = (req:Request,msg:string) => {
  const nonce = req.session.jsNonce || '';
  return getSuccessAlert(msg).concat(`<script nonce="${nonce}"> (() => {
  setTimeout(() => {
    window.location.reload();
  },1000); 
})();</script>`);
}
export async function postEditProfilePicture(req:Request,res:Response) {
  try {
    const user_id = req.session.auth?.userID || 0;
    const ip_id = req.session.ip_id;
    if (!!!ip_id) throw new Error("Unable to get ip id.");
    const input = req.body['profile-picture-text'];
    if (!!!input.startsWith('https://image.storething.org')) throw new Error("Something went wrong updating the profile picture.");
    const image = await getImageFromUrl(input);
    const newImage = await createProfilePicture(image);
    const pilImage = await convertImageToPillowCompatable(newImage,false);
    const base64String = pilImage.toString('base64');
    const body = { image: base64String }
    if (!!!IS_DEVELOPMENT) {
      const response = await postToPythonBackend('/python/safe-search-image',body,7000) as { label: string, score: number }[];
      const nsfw = Math.round(Number(response.filter((obj) => obj.label==="nsfw")[0].score.toFixed(2))*100);
      if (nsfw>20) {
        throw new Error("Unsafe profile picture");
      }
    }
    const key = 'frankmbrown/'.concat(crypto.randomUUID()).concat('.png');
    const newURL = await uploadImageObject(key,newImage,'png',{},user_id,ip_id);
    await uploadPageImageFromUrl(req,newURL);
    await getDatabase().query(`UPDATE users SET profile_picture=$1 WHERE id=$2;`,[newURL,user_id]);
    return res.status(200).send('');
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went posting the new profile picture.");
  }
}
export async function postEditUsername(req:Request,res:Response) {
  try {
    const user_id = req.session.auth?.userID || 0;
    const input = req.body['new-username'];
    const validateUsernameObj = validateUsername(input);
    if (!!!validateUsernameObj.valid) throw new Error("Invalid Username...");
    await getDatabase().query(`UPDATE users SET user_username=$1 WHERE id=$2;`,[input,user_id]);
    return res.status(200).send(getReloadPageScript(req,'Successfully updated username!'));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went posting the new username.");
  }
}
export async function postEditPassword(req:Request,res:Response) {
  try {
    const user_id = req.session.auth?.userID || 0;
    const input = req.body['new-password'];
    const validatePasswordObj = validatePassword(input);
    if (!!!validatePasswordObj.valid) throw new Error("Invalid Password...");
    const hashedPassword = await hashPassword(input);
    await getDatabase().query(`UPDATE users SET user_password=$1 WHERE id=$2;`,[hashedPassword,user_id])
    return res.status(200).send(getReloadPageScript(req,'Successfully updated password!'));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went posting the new password.");
  }
}
export async function postEditDescription(req:Request,res:Response) {
  try {
    const user_id = req.session.auth?.userID || 0;
    const input = req.body['new-description'];
    const body = JSON.parse(input);
    const { editorState, desktop_html, tablet_html, mobile_html, able_to_validate, contains_nsfw } = await parseCommentLexicalEditor(body);
    if (!!!able_to_validate||contains_nsfw) {
      throw new Error("Wait a while before posting description. Need to validate that everything does not contain unsafe material.");
    }
    await getDatabase().query(`UPDATE users SET description_editor_state=$1, description_desktop_html=$2, description_tablet_html=$3, description_mobile_html=$4 WHERE id=$5;`,[editorState, desktop_html, tablet_html, mobile_html,user_id]);
    return res.status(200).send(getReloadPageScript(req,'Successfully updated description!'));
  } catch (e) {
    console.error(e);
    return res.status(400).send("Something went posting the new description.");
  }
}

/* --------------------------------------- Users ------------------------ */
export async function getUser(req:Request,res:Response) {
  try {
    const { id:idStr, username:username_init } = req.params;
    var type_html = 'description_mobile_html';
    if (req.session.device?.desktop) {
      type_html = 'description_desktop_html'
    } else if (req.session.device?.tablet) {
      type_html = 'description_tablet_html';
    }
    const resp = await getDatabase().query(`SELECT id, user_username AS username, user_date_created AS date_created, profile_picture AS pp, ${type_html} as html FROM users WHERE id=$1;`,[idStr]);
    const row = resp.rows[0];
    if (!!!row) throw new Error("Unable to find user.");
    const view = 'pages/account/user';
    const pageObj:any = {};
    const { id, username, date_created, pp, html } = row;
    pageObj.id = id;
    pageObj.username = username;
    const tz = req.session.settings?.timezone || 'America/New_York';
    const date_created_text = TIME.formatDateFromUnixTime('dddd MMMM D, YYYY',tz,Number(date_created));
    const datetime = TIME.getDateTimeStringFromUnix(Number(date_created),true);
    pageObj.date_created_text = date_created_text;
    pageObj.datetime = datetime;

    pageObj.pp = pp;
    pageObj.html = html;
    const userInfo = await getUserInformation(req,id);
    pageObj.comments = userInfo.comments;
    pageObj.annotations = userInfo.annotations;
    pageObj.likes = userInfo.likes;
    pageObj.upvotes = userInfo.upvotes;
    pageObj.downvotes = userInfo.downvotes;

    const description = html.replace(/<\/?[^>]+(>|$)/g, '');
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: username, item: `/users/${encodeURIComponent(id)}/${encodeURIComponent(username)}`, position: 2 }, 
    ];
    const title = username;
    const keywords = (description as string).split(/\s+/);
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "user-activity",
          "text": "User Activity"
      },
    ];
    const image = pp;
    const SEO: SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: `/users/${encodeURIComponent(id)}/${encodeURIComponent(username)}`, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      pageObj
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/',400,{ severity: "error", message: "Unable to find requested user." });
  }
}

export { 
  getLogin, 
  postLogin, 
  getCreateAccount, 
  postCreateAccount, 
  getCreateAccountSendEmail,
  resendResetCredentialsEmail,
  postResetCredentials,
  getResetCredentials,
  postResetCredentials2fa,
  postCreateAccount2fa,
  finishCreateAccount,
  finishResetCredentials,
  getLogout,
  getAccount
};