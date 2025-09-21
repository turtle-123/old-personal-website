import { Router, Request, Response } from 'express';
import type { Breadcrumbs, SEO, TableOfContentsItem } from '../../types';
import bodyParser from 'body-parser';
import { getRequiredVariables } from '../helper_functions/frontendHelper';
import getDatabase from '../../database';
import type { StringifiedIPSettings } from '../../MIDDLEWARE/getIpLocationAndCheckDbSettings';
import DEFAULT_SETTINGS from '../../CONSTANTS/DEFAULT_SETTINGS';
import { getSettingsString } from '../functions/settingsHandler';
import type { Settings } from '../../types';
import { redirect } from '../helper_functions/redirect-override';
import { getAllowSettingsString } from '../html';

const COOKIE_ROUTER = Router({mergeParams: true});
const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Cookies', item: '/cookies', position: 2 }];
const title = "Frank's Cookies";
const keywords: string[] = ["Cookies","Session Cookies","Strictly Necessary Cookies","Preferences Cookies","Statistics Cookies","European Union's General Data Protection Regulation","California Privacy Rights Act","Frank McKee Brown","Frank Brown"];
const description = 'View and edit the cookies that this site uses. Currently, this site utilizes strictly necessary cookies, preferences cookies, and statistics cookies.';
const tableOfContents: TableOfContentsItem[] = [
  { id: 'gdpr-definition', text: 'GDPR Definition of Cookies'},
  { id: "how-this-site-uses-cookies", text: "How This Site Uses Cookies"},
  { id: "edit-cookie-preferences", text: "Edit Cookie Preferences"}
];

function getCookiesPage(req: Request,res:Response) {
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/cookies'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/cookies',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    necessaryCookies:  Boolean(req.session.cookiePreferences?.necessary===true),
    preferencesCookies:  Boolean(req.session.cookiePreferences?.preferences===true),
    statisticsCookies: Boolean(req.session.cookiePreferences?.statistics===true)
  })
}

/**
 * This route is used to tell the frontend JavaScript that the user has denied 
 * the use of preference cookies, and so they should be able to edit the theme, 
 * but the edits won't be saved in the database.
 */
COOKIE_ROUTER.get('/denied-preference-cookies/?',(req,res) => {
  const navigate = Boolean(req.get('hx-navigate')==="true");
  if (navigate) {
    return res.status(200).send(getAllowSettingsString(req).concat(`<div hx-trigger="load delay:100ms" hx-get="/cookies" hx-indicator="#page-transition-progress" hx-target="#PAGE" hx-push-url="true"></div>`));
  } else {
    return res.status(200).send(getAllowSettingsString(req));
  }
});


COOKIE_ROUTER.get('/?',getCookiesPage);

type ValidateDbSettingsRet = {
  settings: Settings
};
/**
 * Function to validate the Stringified JSON object that should be of the type 
 */
function validateDBSettings(req: Request):ValidateDbSettingsRet {
  const ret = {
    settings: structuredClone(DEFAULT_SETTINGS)
  };
  try {
    const DB_SETTINGS = JSON.parse(String(req.session.ip_data_string)) as StringifiedIPSettings;
    const VALID_HEX_REGEX=/^#([0-9a-f]{3}){1,2}$/i;
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
    ] as const;
    const SETTINGS_KEYS = new Set(keys);
    for (let key of Object.keys(DB_SETTINGS.settings.lightMode)) {
      /* @ts-ignore */
      if (SETTINGS_KEYS.has(key as any)&&VALID_HEX_REGEX.test(DB_SETTINGS.settings.lightMode[key] as string)) {
        /* @ts-ignore */
        ret.settings.lightMode[key as keyof typeof DB_SETTINGS.settings.lightMode] = DB_SETTINGS.settings.lightMode[key];
      }
    }
    for (let key of Object.keys(DB_SETTINGS.settings.darkMode)) {
      /* @ts-ignore */
      if (SETTINGS_KEYS.has(key as any)&&VALID_HEX_REGEX.test(DB_SETTINGS.settings.darkMode[key] as string)) {
        /* @ts-ignore */
        ret.settings.darkMode[key as keyof typeof DB_SETTINGS.settings.darkMode] = DB_SETTINGS.settings.darkMode[key];
      }
    }
    ret.settings.fontFamily = "Anuphan, sans-serif;";
    ret.settings.disableDefaultTab = DB_SETTINGS.settings?.disableDefaultTab===undefined ? false : Boolean(DB_SETTINGS.settings.disableDefaultTab);
    ret.settings.mode = (DB_SETTINGS.settings?.mode!=="light"&&DB_SETTINGS.settings?.mode!=="dark") ? "light" : DB_SETTINGS.settings.mode;
    ret.settings.tabSize = typeof DB_SETTINGS.settings.tabSize==='number' ? Math.min(12,Math.max(1,Number(DB_SETTINGS.settings.tabSize))) : 2;
    ret.settings.settingsString = getSettingsString(ret.settings,ret.settings.mode);
    return ret;
  } catch (error) {
    console.error(error);
  }
  return ret;
}




/**
 * This route should be called when the user responds to the cookie banner.
 * 
 */
COOKIE_ROUTER.post('/?',bodyParser.urlencoded({extended: true}),async (req,res) => {
  var status: 200|205 = 200;
  const deleteQuery = 'DELETE FROM ip_info WHERE id=$1::integer RETURNING id;';
  var resp = '<div hidden aria-hidden="true"></div>'
  type CookiePreferences = {
    necessary: boolean,
    preferences: boolean,
    statistics: boolean,
    showedBanner: boolean
  };
  if (!!!req.session.cookiePreferences) {
    req.session.cookiePreferences = {
      necessary: true, 
      preferences: false,
      statistics: false, 
      showedBanner: true 
    };
  }
  const navigateToCookiesPage=Boolean(req.body['navigate-to-cookies-page']);
  const newCookiePreferences: Partial<CookiePreferences> = {};
  Object.keys(req.body).forEach((key) => {
    if(key.startsWith('necessary-cookies-input')) return;
    else if (key.startsWith('preferences-cookies-input')) {
      newCookiePreferences.preferences = true;
    } else if (key.startsWith('statistics-cookies-input')) {
      newCookiePreferences.statistics = true;
    }
  });
  /**
   * This possibility should only be possible when the user clicks the edit button in the cookie banner
   */
  if (navigateToCookiesPage) {
    resp+='<span hx-trigger="load" hx-get="/cookies/denied-preference-cookies" hx-target="this" hx-swap="outerHTML" hx-headers=\'{"hx-navigate": "true"}\'></span>'
  }
  // We should reload the page if the user is on the cookies page and they deny the opportunity for us to have preferences cookies
  const ON_COOKIES_PAGE = Boolean (req.get('hx-current-path')==="/coookies");
  if(ON_COOKIES_PAGE&&req.body['preferences-cookies-input-2']){
    status = 205;
  }
  if(newCookiePreferences.necessary!==true) newCookiePreferences.necessary = true;
  if(newCookiePreferences.preferences===undefined) newCookiePreferences.preferences = false;
  if(newCookiePreferences.statistics===undefined) newCookiePreferences.statistics = false;
  if(newCookiePreferences.showedBanner!==true) newCookiePreferences.showedBanner = true;
  req.session.cookiePreferences = structuredClone(newCookiePreferences) as CookiePreferences;
  if (req.session.cookiePreferences.preferences===false&&!!!isNaN(Number(req.session.ip_id))) {
    req.session.deleting_ip_address_row = true;
    try {
      req.session.create_ip_address_row = true;
      resp+='<span hx-trigger="load" hx-get="/cookies/denied-preference-cookies" hx-target="this" hx-swap="outerHTML" hx-headers=\'{"hx-navigate": "false"}\'></span>';
      await getDatabase().query(deleteQuery,[req.session.ip_id]);
      req.session.ip_id = undefined;
    } catch (error) {
      console.error(error);
    }
    req.session.deleting_ip_address_row = false;
  } else if (!!!navigateToCookiesPage && req.session.cookiePreferences.preferences===true) {
    const currentPath = req.get('hx-current-path')
    if (/\/login/.test(currentPath||'')) {
      resp+=`<script nonce="${req.session.jsNonce||''}">
      (() => {
        const form = document.querySelector('#login-form');
        if (form) {
          const dis = form.querySelectorAll('input[disabled]');
          dis.forEach((b) => b.removeAttribute('disabled'));
          const btn = form.querySelectorAll('button[disabled]');
          btn.forEach((b) => b.removeAttribute('disabled'));
        }
        const a = document.getElementById("log-page-mess");
        if (a) a.remove();
      })()
      </script>`
    }
    if (req.session.create_ip_address_row===true) {
      resp+='<span hidden hx-get="/api/create-ip-settings" hx-swap="none" hx-trigger="load"></span>';
    } else {
      const PARSED_JSON = validateDBSettings(req);
      req.session.settings = structuredClone(PARSED_JSON.settings);
      resp += '<span hidden hx-get="/api/set-settings-after-cookie" hx-target="#application-styles" hx-swap="innerHTML" hx-trigger="load"></span>';
    }
  } else if (req.session.cookiePreferences.preferences===false&&!!!navigateToCookiesPage&&!!isNaN(Number(req.session.ip_id))){
    req.session.create_ip_address_row = true;
    resp+='<span hx-trigger="load" hx-get="/cookies/denied-preference-cookies" hx-target="this" hx-swap="outerHTML" hx-headers=\'{"hx-navigate": "false"}\'></span>';
  }  
  res.removeHeader('Etag');
  return res.status(status).send(resp);
});


COOKIE_ROUTER.use((req,res) => {
  return redirect(req,res,'/404',404);
})

export default COOKIE_ROUTER;