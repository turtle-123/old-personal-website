import {Request,Response,NextFunction} from 'express';
import IS_DEVELOPMENT from '../CONSTANTS/IS_DEVELOPMENT';
import { validLatLng } from '../ROUTER/functions/general';
import getDatabase from '../database';
import DEFAULT_SETTINGS, { getAiChatID } from '../CONSTANTS/DEFAULT_SETTINGS';
import { SUPPORTED_CODEMIRROR_THEMES, Settings, VALID_AI_CODER_MODELS_TYPE, VALID_AI_WRITER_MODELS_TYPE, ValidFonts } from '../types';
import { getSettingsString } from '../ROUTER/functions/settingsHandler';
import IPinfoWrapper, { IPinfo} from "node-ipinfo";
import DEFAULT_IP_LOCATION from '../CONSTANTS/DEFAULT_IP_LOCATION';
import { ALLOWED_TIME_ZONE, TIME_ZONES_AVAILABLE } from '../utils/time';
import type { ALLOWED_APPLICATION_LANGUAGES } from '../ROUTER/functions/settingsHandler';
import env from '../utils/env';


const getInitialSettingsQuery = `SELECT ip_info.id AS ip_id,  
ip_device.phone AS phone,
ip_device.tablet AS tablet,
ip_device.desktop AS desktop,
ip_device.browser_name AS browser,
ip_settings.settings_mode AS settings_mode,
ip_settings.disable_default_tab AS disable_default_tab,
ip_settings.tab_size AS tab_size,
ip_settings.spellcheck AS spellcheck,
ip_settings.font_family AS font_family,
ip_settings.light_primary AS light_primary,
ip_settings.light_secondary AS light_secondary,
ip_settings.light_warning AS light_warning,
ip_settings.light_success AS light_success,
ip_settings.light_info AS light_info,
ip_settings.light_error AS light_error,
ip_settings.light_button_contrast_text AS light_button_contrast_text,
ip_settings.light_background AS light_background,
ip_settings.light_secondary_background AS light_secondary_background,
ip_settings.light_navbar_color AS light_navbar_color,
ip_settings.light_shadow_color AS light_shadow_color,
ip_settings.light_text_color AS light_text_color,
ip_settings.dark_primary AS dark_primary,
ip_settings.dark_secondary AS dark_secondary,
ip_settings.dark_warning AS dark_warning,
ip_settings.dark_success AS dark_success,
ip_settings.dark_info AS dark_info,
ip_settings.dark_error AS dark_error,
ip_settings.dark_button_contrast_text AS dark_button_contrast_text,
ip_settings.dark_background AS dark_background,
ip_settings.dark_secondary_background AS dark_secondary_background,
ip_settings.dark_navbar_color AS dark_navbar_color,
ip_settings.dark_shadow_color AS dark_shadow_color,
ip_settings.dark_text_color AS dark_text_color,
ip_settings.settings_string AS settings_string,
ip_settings.code_editor_theme AS code_editor_theme,
ip_settings.code_editor_emmet AS code_editor_emmet,
ip_settings.desktop_application_size AS desktop_application_size,
ip_settings.tablet_application_size AS tablet_application_size,
ip_settings.mobile_application_size AS mobile_application_size,
ip_settings.include_autocomplete_suggestions include_autocomplete_suggestions,
ip_settings.enable_ai_writer enable_ai_writer,
ip_settings.ai_writer_temperature ai_writer_temperature,
ip_settings.ai_writer_model ai_writer_model,
ip_settings.enable_ai_coder enable_ai_coder,
ip_settings.ai_coder_temperature ai_coder_temperature,
ip_settings.ai_coder_model ai_coder_model,
ip_settings.ai_writer_max_tokens ai_writer_max_tokens,
ip_settings.ai_coder_max_tokens ai_coder_max_tokens,
ip_settings.lang AS lang,
ip_settings.timezone as timezone,
ip_location.loc AS ip_location,
json_build_object(
  'hostname',ip_location.hostname,
  'bogon',ip_location.bogon,
  'anycast',ip_location.anycast,
  'city',ip_location.city,
  'region',ip_location.region,
  'country',ip_location.country,
  'country_flag_emoji',ip_location.country_flag_emoji,
  'country_flag_unicode',ip_location.country_flag_unicode,
  'country_flag_url',ip_location.country_flag_url,
  'country_currency_code',ip_location.country_currency_code,
  'country_currency_symbol',ip_location.country_currency_symbol,
  'continent_code',ip_location.continent_code,
  'continent_name',ip_location.continent_name,
  'isEU',ip_location.isEU,
  'countryCode',ip_location.countryCode,
  'loc',ip_location.loc,
  'org',ip_location.org,
  'postal',ip_location.postal,
  'timezone',ip_location.timezone,
  'asn_asn',ip_location.asn_asn,
  'asn_name',ip_location.asn_name,
  'asn_domain',ip_location.asn_domain,
  'asn_route',ip_location.asn_route,
  'asn_type',ip_location.asn_type,
  'company_name',ip_location.company_name,
  'company_domain',ip_location.company_domain,
  'company_type',ip_location.company_type,
  'carrier_name',ip_location.carrier_name,
  'carrier_mcc',ip_location.carrier_mcc,
  'carrier_mnc',ip_location.carrier_mnc,
  'privacy_vpn',ip_location.privacy_vpn,
  'privacy_proxy',ip_location.privacy_proxy,
  'privacy_tor',ip_location.privacy_tor,
  'privacy_relay',ip_location.privacy_relay,
  'privacy_hosting',ip_location.privacy_hosting,
  'privacy_service',ip_location.privacy_service,
  'abuse_address',ip_location.abuse_address,
  'abuse_country',ip_location.abuse_country,
  'abuse_country_code',ip_location.abuse_country_code,
  'abuse_email',ip_location.abuse_email,
  'abuse_name',ip_location.abuse_name,
  'abuse_network',ip_location.abuse_network,
  'abuse_phone',ip_location.abuse_phone,
  'domains_ip',ip_location.domains_ip,
  'domains_total',ip_location.domains_total,
  'domains_domains',ip_location.domains_domains
) as ip_location_temp,
json_build_object(
  'phone',ip_device.phone,
  'tablet',ip_device.tablet,
  'desktop',ip_device.desktop,
  'browser_name',ip_device.browser_name,
  'browser_version',ip_device.browser_version,
  'browser_major',ip_device.browser_major,
  'cpu_architecture',ip_device.cpu_architecture,
  'device_type',ip_device.device_type,
  'device_vendor',ip_device.device_vendor,
  'device_model',ip_device.device_model,
  'engine_name',ip_device.engine_name,
  'engine_version',ip_device.engine_version,
  'os_name',ip_device.os_name,
  'os_version',ip_device.os_version
) AS ip_deivce_temp,
notification_preferences_ip.create_annotation create_annotation,
notification_preferences_ip.create_note create_note,
notification_preferences_ip.update_note update_note,
notification_preferences_ip.create_blog create_blog,
notification_preferences_ip.update_blog update_blog,
notification_preferences_ip.create_idea create_idea,
notification_preferences_ip.update_idea update_idea,
notification_preferences_ip.create_comment create_comment,
notification_preferences_ip.create_jupyter_notebook create_jupyter_notebook,
notification_preferences_ip.create_markdown_note create_markdown_note,
notification_preferences_ip.create_stream_consciousness create_stream_consciousness,
notification_preferences_ip.create_daily_reading create_daily_reading,
notification_preferences_ip.create_tex_note create_tex_note,
notification_preferences_ip.create_link create_link,
notification_preferences_ip.create_quote create_quote,
notification_preferences_ip.create_project create_project,
notification_preferences_ip.project_update project_update,
notification_preferences_ip.create_survey create_survey,
notification_preferences_ip.create_goodreads create_goodreads,
notification_preferences_ip.create_letterboxd create_letterboxd,
notification_preferences_ip.create_game create_game,
notification_preferences_ip.create_3d_design create_3d_design,
notification_preferences_ip.create_electronics create_electronics
FROM ip_info 
JOIN ip_device ON ip_info.id=ip_device.ip_id
JOIN ip_settings ON ip_info.id=ip_settings.ip_id 
JOIN ip_location ON ip_info.id=ip_location.ip_id
JOIN notification_preferences_ip ON ip_info.id=notification_preferences_ip.ip_id
WHERE ip_info.ip_address=$1::TEXT;`;
const ipInfoToken = env.IP_INFO_TOKEN;
if (!!!ipInfoToken) throw new Error('IP_INFO_TOKEN not imported properly from .env file.');
const ipinfoWrapper = new IPinfoWrapper(ipInfoToken);


/**
 * node-ipinfo returns the location as a string of the form seen below, so 
 * this helper function is used to extract a { lat, lng } json object from the
 * string
 * @param s String string of the form: 'number,number'
 */
const getLatLngFromString = (s: string):{lat:number,lng:number}|undefined => {
  const arr = s.split(',');
  if(arr.length!==2)return undefined;
  const lat = parseFloat(arr[0]);
  const lng = parseFloat(arr[1]);
  if (typeof lat!=='number'||isNaN(lat)||typeof lng!=='number'||isNaN(lng)||!!!validLatLng(lat,lng)) return undefined;
  return {lat, lng};
}

export const DEFAULT_LAT_LNG = getLatLngFromString(DEFAULT_IP_LOCATION.loc) as {lat: number, lng: number};



async function getIpLocation(req:Request,isDevelopment: boolean) {
    if (isDevelopment) {
        return new Promise<IPinfo>((resolve,reject) => resolve(DEFAULT_IP_LOCATION));
    } else {
        return new Promise<IPinfo>((resolve,reject) => {
        if (typeof req.session.ip?.address !== 'string') throw Error('Ip Address does not exist');
            ipinfoWrapper
            .lookupIp(req.session.ip?.address as string)
            .then((response: IPinfo) => {
                if (response.bogon) throw Error('Some IP addresses and IP ranges are reserved for special use, such as for local or private networks, and should not appear on the public internet. These reserved ranges, along with other IP ranges that haven\'t yet been allocated and therefore also shouldn\'t appear on the public internet are sometimes known as bogons. Because bogon IP addresses don\'t belong to a specific user or server on the internet, so there\'s no way to geolocate them.');
                else resolve(response);
            })
            .catch((err:any) => {
                reject(err);
            })
        })
    }
}

/**
 * Helper function to make sure that only one of the device types (phone, tablet, or desktop) 
 * in settings is true
 * @param phone 
 * @param tablet 
 * @param desktop 
 */
const validateDeviceType = (phone:boolean,tablet:boolean,desktop:boolean)=>{
  const IS_VALID = Boolean([phone,tablet,desktop].filter((arr)=>arr===true).length===1)
  if (IS_VALID) return { phone, tablet, desktop };
  else return { phone: false, tablet: false, desktop: true};
}
/**
 * Validate settings from database - make sure settings 
 * are valid before putting them in cache
 */
const validateSettingsFromDB = ({
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
  code_editor_theme,
  code_editor_emmet,
  desktop_application_size,
  tablet_application_size,
  mobile_application_size,
  settings_string,
  lang,
  timezone
}:{
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
  code_editor_theme: number,
  code_editor_emmet: string,
  desktop_application_size: number,
  tablet_application_size: number,
  mobile_application_size: number,
  settings_string: string,
  lang: ALLOWED_APPLICATION_LANGUAGES,
  timezone: ALLOWED_TIME_ZONE
}) => {

  const FONT_FAMILY = "Anuphan, sans-serif;";
  const VALID_HEX_REGEX=/^#([0-9a-f]{3}){1,2}$/i;
  const LIGHT_MODE_DEFAULT = structuredClone(DEFAULT_SETTINGS.lightMode);
  const LIGHT_MODE = {
    primary: VALID_HEX_REGEX.test(light_primary)?light_primary:LIGHT_MODE_DEFAULT.primary,
    secondary:VALID_HEX_REGEX.test(light_secondary)?light_secondary:LIGHT_MODE_DEFAULT.secondary,
    warning: VALID_HEX_REGEX.test(light_warning)?light_warning:LIGHT_MODE_DEFAULT.warning,
    success: VALID_HEX_REGEX.test(light_success)?light_success:LIGHT_MODE_DEFAULT.success,
    info: VALID_HEX_REGEX.test(light_info)?light_info:LIGHT_MODE_DEFAULT.info,
    error: VALID_HEX_REGEX.test(light_error)?light_error:LIGHT_MODE_DEFAULT.error,
    buttonContrastText:VALID_HEX_REGEX.test(light_button_contrast_text)?light_button_contrast_text:LIGHT_MODE_DEFAULT.buttonContrastText,
    background: VALID_HEX_REGEX.test(light_background)?light_background:LIGHT_MODE_DEFAULT.background,
    secondaryBackground: VALID_HEX_REGEX.test(light_secondary_background)?light_secondary_background:LIGHT_MODE_DEFAULT.secondaryBackground,
    navbarColor:VALID_HEX_REGEX.test(light_navbar_color)?light_navbar_color:LIGHT_MODE_DEFAULT.navbarColor,
    shadowColor: VALID_HEX_REGEX.test(light_shadow_color)?light_shadow_color:LIGHT_MODE_DEFAULT.shadowColor,
    textColor: VALID_HEX_REGEX.test(light_text_color)?light_text_color:LIGHT_MODE_DEFAULT.textColor
  };
  const DARK_MODE_DEFAULT = structuredClone(DEFAULT_SETTINGS.darkMode);
  const DARK_MODE = {
    primary: VALID_HEX_REGEX.test(dark_primary)?dark_primary:DARK_MODE_DEFAULT.primary,
    secondary:VALID_HEX_REGEX.test(dark_secondary)?dark_secondary:DARK_MODE_DEFAULT.secondary,
    warning: VALID_HEX_REGEX.test(dark_warning)?dark_warning:DARK_MODE_DEFAULT.warning,
    success: VALID_HEX_REGEX.test(dark_success)?dark_success:DARK_MODE_DEFAULT.success,
    info: VALID_HEX_REGEX.test(dark_info)?dark_info:DARK_MODE_DEFAULT.info,
    error: VALID_HEX_REGEX.test(dark_error)?dark_error:DARK_MODE_DEFAULT.error,
    buttonContrastText:VALID_HEX_REGEX.test(dark_button_contrast_text)?dark_button_contrast_text:DARK_MODE_DEFAULT.buttonContrastText,
    background: VALID_HEX_REGEX.test(dark_background)?dark_background:DARK_MODE_DEFAULT.background,
    secondaryBackground: VALID_HEX_REGEX.test(dark_secondary_background)?dark_secondary_background:DARK_MODE_DEFAULT.secondaryBackground,
    navbarColor:VALID_HEX_REGEX.test(dark_navbar_color)?dark_navbar_color:DARK_MODE_DEFAULT.navbarColor,
    shadowColor: VALID_HEX_REGEX.test(dark_shadow_color)?dark_shadow_color:DARK_MODE_DEFAULT.shadowColor,
    textColor: VALID_HEX_REGEX.test(dark_text_color)?dark_text_color:DARK_MODE_DEFAULT.textColor
  };
  const ret_code_editor_theme = (VALID_CODEMIRROR_THEMES.has(code_editor_theme as any) ? code_editor_theme : 'vscode') as SUPPORTED_CODEMIRROR_THEMES;
  const ret_code_editor_emmet = Boolean(code_editor_emmet);
  const ret_desktop_application_size = (typeof desktop_application_size==='number'&&!!!isNaN(desktop_application_size))?Math.min(120,Math.max(80,desktop_application_size)):100;
  const ret_tablet_application_size = (typeof tablet_application_size==='number'&&!!!isNaN(tablet_application_size))?Math.min(120,Math.max(80,tablet_application_size)):100;
  const ret_mobile_application_size = (typeof mobile_application_size==='number'&&!!!isNaN(mobile_application_size))?Math.min(120,Math.max(80,mobile_application_size)):100;
  return {
    fontFamily: FONT_FAMILY,
    lightMode: LIGHT_MODE,
    darkMode: DARK_MODE,
    code_editor_theme: ret_code_editor_theme,
    code_editor_emmet: ret_code_editor_emmet,
    desktop_application_size: ret_desktop_application_size,
    tablet_application_size: ret_tablet_application_size,
    mobile_application_size: ret_mobile_application_size
  };
}

export type TempIPLocationObject = {
  hostname: string|null,
  bogon: boolean,
  anycast: boolean,
  city: string|null,
  region: string|null,
  country: string|null,
  country_flag_emoji: string|null,
  country_flag_unicode: string|null,
  country_flag_url: string|null,
  country_currency_code: string|null,
  country_currency_symbol: string|null,
  continent_code: string|null,
  continent_name: string|null,
  isEU: boolean,
  countryCode: string|null,
  loc: string,
  org: string|null,
  postal: string|null,
  timezone: string|null,
  asn_asn: string|null,
  asn_name: string|null,
  asn_domain: string|null,
  asn_route: string|null,
  asn_type: string|null,
  company_name: string|null,
  company_domain: string|null,
  company_type: string|null,
  carrier_name: string|null,
  carrier_mcc: string|null,
  carrier_mnc: string|null,
  privacy_vpn: string|null,
  privacy_proxy: string|null,
  privacy_tor: string|null,
  privacy_relay: string|null,
  privacy_hosting: string|null,
  privacy_service: string|null,
  abuse_address: string|null,
  abuse_country: string|null,
  abuse_country_code: string|null,
  abuse_email: string|null,
  abuse_name: string|null,
  abuse_network: string|null,
  abuse_phone: string|null,
  domains_ip: string|null,
  domains_total: number|null,
  domains_domains: string[]|null
};

/**
 * Put the response from node-ipinfo in a form such that it will 
 * be easy to put it in the database later
 * @param res IPinfo
 */
export const getIpInfoObject = (res: IPinfo) => {
  const hostname = res?.hostname || null;
  const bogon = Boolean(res?.bogon);
  const anycast = Boolean(res?.anycast);
  const city = res?.city || null;
  const region = res?.region || null;
  const country = res?.country || null;
  const country_flag_emoji = res?.countryFlag?.emoji || null;
  const country_flag_unicode = res?.countryFlag?.unicode || null;
  const country_flag_url = res?.countryFlagURL || null;
  const country_currency_code = res?.countryCurrency?.code || null;
  const country_currency_symbol = res?.countryCurrency?.symbol || null;
  const continent_code = res?.continent?.code || null;
  const continent_name = res?.continent?.name || null;
  const isEU = Boolean(res?.isEU);
  const countryCode = res?.countryCode || null;
  const temp_loc = getLatLngFromString(res?.loc);
  const loc = temp_loc ? `(${temp_loc.lng},${temp_loc.lat})` : `(${DEFAULT_LAT_LNG.lng},${DEFAULT_LAT_LNG.lat})`; //
  const org = res?.org || null;
  const postal = res?.postal || null;
  const timezone = res?.timezone || null;
  const asn_asn = res?.asn?.asn || null;
  const asn_name = res?.asn?.name || null;
  const asn_domain = res?.asn?.domain || null;
  const asn_route = res?.asn?.route || null;
  const asn_type = res?.asn?.type || null;
  const company_name = res?.company?.name || null;
  const company_domain = res?.company?.domain || null;
  const company_type = res?.company?.type || null;
  const carrier_name = res?.carrier?.name || null;
  const carrier_mcc = res?.carrier?.mcc || null;
  const carrier_mnc = res?.carrier?.mnc || null;
  const privacy_vpn = res?.privacy?.vpn || null;
  const privacy_proxy = res?.privacy?.proxy || null;
  const privacy_tor = res?.privacy?.tor || null;
  const privacy_relay = res?.privacy?.relay || null;
  const privacy_hosting = res?.privacy?.hosting || null;
  const privacy_service = res?.privacy?.service || null;
  const abuse_address = res?.abuse?.address || null;
  const abuse_country = res?.abuse?.country || null;
  const abuse_country_code = res?.abuse?.countryCode || null;
  const abuse_email = res?.abuse?.email || null;
  const abuse_name = res?.abuse?.name || null;
  const abuse_network = res?.abuse?.network || null;
  const abuse_phone = res?.abuse?.phone || null;
  const domains_ip = res?.domains?.ip || null;
  const domains_total = parseInt(String(res?.domains?.total)) || null;
  const domains_domains = Array.isArray(res?.domains?.domains) ? res?.domains?.domains.map((s)=>String(s)) : null;
  return {
    hostname,
    bogon,
    anycast,
    city,
    region,
    country,
    country_flag_emoji,
    country_flag_unicode,
    country_flag_url,
    country_currency_code,
    country_currency_symbol,
    continent_code,
    continent_name,
    isEU,
    countryCode,
    loc,
    org,
    postal,
    timezone,
    asn_asn,
    asn_name,
    asn_domain,
    asn_route,
    asn_type,
    company_name,
    company_domain,
    company_type,
    carrier_name,
    carrier_mcc,
    carrier_mnc,
    privacy_vpn,
    privacy_proxy,
    privacy_tor,
    privacy_relay,
    privacy_hosting,
    privacy_service,
    abuse_address,
    abuse_country,
    abuse_country_code,
    abuse_email,
    abuse_name,
    abuse_network,
    abuse_phone,
    domains_ip,
    domains_total,
    domains_domains
  } as TempIPLocationObject;
}

type DbResponse = {
  ip_id: number,
  phone: boolean,
  tablet: boolean,
  desktop: boolean,
  browser: string,
  settings_mode: string,
  disable_default_tab: boolean,
  tab_size: number,
  spellcheck: boolean,
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
  code_editor_theme: number,
  code_editor_emmet: string,
  desktop_application_size: number,
  tablet_application_size: number,
  mobile_application_size: number,
  settings_string: string,
  ip_location: {lat: number, lng: number},
  ip_location_temp: any,
  ip_device_temp: any,
  lang: ALLOWED_APPLICATION_LANGUAGES,
  timezone: ALLOWED_TIME_ZONE,
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
  create_survey: boolean, 
  create_goodreads: boolean, 
  create_letterboxd: boolean, 
  create_game: boolean, 
  create_3d_design: boolean,
  create_electronics: boolean,
  project_update: boolean,
  include_autocomplete_suggestions: boolean,
  enable_ai_writer: boolean,
  ai_writer_temperature: number,
  ai_writer_model: VALID_AI_WRITER_MODELS_TYPE,
  enable_ai_coder: boolean,
  ai_coder_temperature: number,
  ai_coder_model: VALID_AI_CODER_MODELS_TYPE,
  ai_coder_max_tokens: number,
  ai_writer_max_tokens: number
}
type DeviceObjectType = {
  phone: boolean,
  tablet: boolean,
  desktop: boolean,
  browser: string|undefined,
  temp: string
};
export type StringifiedIPSettings = {
  settings: Settings,
  ip_location :{lat:number, lng: number, temp: string},
  device: {
    phone: boolean,
    tablet: boolean,
    desktop: boolean,
    browser: string|undefined,
    temp: string
  }
};

/**
 * - Try to get ip location and user's settings from database - using the user's ip address 
 * - If the ip address and settings exist in the database, then set the relevant information in cache
 * - If the ip address and settings do not exist in the database, then set the temp value of the 
 * ip_location object in settings to be a stringified version of what will be inserted into the table - 
 * see the **getIpInfoObject()** function. 
 * - If the user's ip address does not already exist in the database, then you will need to create a row in 
 * the database for the user's ip address - else, you will need to save the user's settings every time the user's settings changes
 * 
 * @param req 
 * @param res 
 * @param next 
 */
async function getIpLocationAndCheckDbSettings(req:Request,res:Response,next:NextFunction) {
  if (req.session.ip_location===undefined) {
    try {
      if (typeof req.session.ip?.address!=='string')throw new Error('IP Address should already be established as a string in cache.');
      const [ipInfo,dbInfo] = await Promise.all([getIpLocation(req,IS_DEVELOPMENT),getDatabase().query(getInitialSettingsQuery,[String(req.session.ip.address)])]);
      if(dbInfo.rows.length){
        const {
          ip_id,
          phone:dbPhone,
          tablet:dbTablet,
          desktop:dbDesktop,
          browser:dbBrowser,
          settings_mode,
          disable_default_tab,
          tab_size:db_tab_size,
          spellcheck,
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
          code_editor_theme,
          code_editor_emmet,
          desktop_application_size,
          tablet_application_size,
          mobile_application_size,
          settings_string,
          ip_location:db_ip_location,
          ip_location_temp,
          ip_device_temp,
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
        } = dbInfo.rows[0] as DbResponse;
        const mode = Boolean(settings_mode==="light"||settings_mode==="dark") ? "dark" : "light";
        const tabSize = Math.min(12,Math.max(Number(db_tab_size),1));
        const ip_location = validLatLng(Number(db_ip_location.lat),Number(db_ip_location.lng)) ? {lat: db_ip_location.lat, lng:db_ip_location.lng } : DEFAULT_LAT_LNG;
        const TEMP_SETTINGS = validateSettingsFromDB({
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
          code_editor_theme,
          code_editor_emmet,
          desktop_application_size,
          tablet_application_size,
          mobile_application_size,
          settings_string,
          lang,
          timezone
        });
        req.session.ip_id = Number(ip_id);
        const uuid = crypto.randomUUID();
        const SETTINGS: Settings = {
          mode,
          disableDefaultTab: disable_default_tab,
          tabSize,
          spellcheck: Boolean(spellcheck===true),
          fontFamily: TEMP_SETTINGS.fontFamily as ValidFonts,
          lightMode: TEMP_SETTINGS.lightMode,
          darkMode: TEMP_SETTINGS.darkMode,
          settingsString: '',
          code_editor_theme: TEMP_SETTINGS.code_editor_theme,
          code_editor_emmet: TEMP_SETTINGS.code_editor_emmet,
          desktop_application_size: TEMP_SETTINGS.desktop_application_size,
          tablet_application_size: TEMP_SETTINGS.tablet_application_size,
          mobile_application_size: TEMP_SETTINGS.mobile_application_size ,
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
          create_survey,
          create_goodreads,
          create_letterboxd,
          create_game,
          create_3d_design,
          create_electronics,
          project_update,
          include_autocomplete_suggestions,
          enable_ai_writer,
          ai_writer_temperature,
          ai_writer_model,
          enable_ai_coder,
          ai_coder_temperature,
          ai_coder_model,
          ai_coder_max_tokens,
          ai_writer_max_tokens,
          ai_chat_id: 'chat_'.concat(uuid)
        };
        SETTINGS.settingsString = getSettingsString(SETTINGS,SETTINGS.mode);
        const IP_LOCATION_DB:{lat:number, lng: number, temp: string} = {lat: ip_location.lat, lng: ip_location.lng, temp: JSON.stringify(ip_location_temp)};
        const DEVICE_DB: DeviceObjectType = req.session.device as DeviceObjectType;
        if (req.session.cookiePreferences?.preferences!==true){
          const TO_STRINGIFY:StringifiedIPSettings = {
            settings: structuredClone(SETTINGS),
            ip_location:structuredClone(IP_LOCATION_DB),
            device: structuredClone(DEVICE_DB)
          };
          req.session.ip_data_string = JSON.stringify(TO_STRINGIFY);
        }else {
          req.session.settings = structuredClone(SETTINGS);
        }
        req.session.create_ip_address_row = false;
      } else {
        req.session.create_ip_address_row = true;
      }
      if (typeof ipInfo.loc!=='string')throw new Error('IP Info loc should be a string of the form "number,number".');
      const loc_temp = getLatLngFromString(ipInfo.loc);
      const loc = loc_temp ? loc_temp : DEFAULT_LAT_LNG;
      const temp_ip_info_obj = getIpInfoObject(ipInfo);
      const temp_string = JSON.stringify(temp_ip_info_obj);
      if (req.session.settings&&req.session.create_ip_address_row&&(new Set(TIME_ZONES_AVAILABLE)).has(temp_ip_info_obj.timezone as any)) {
        req.session.settings.timezone = temp_ip_info_obj.timezone as ALLOWED_TIME_ZONE;
      }
      req.session.ip_location = {lat: loc.lat, lng: loc.lng, temp: temp_string}; 
    } catch (error) {
      console.error(error);
      req.session.create_ip_address_row = false;
      req.session.ip_location = {lat: DEFAULT_LAT_LNG.lat, lng: DEFAULT_LAT_LNG.lng, temp: JSON.stringify(getIpInfoObject(DEFAULT_IP_LOCATION))};
      req.session.settings = DEFAULT_SETTINGS;
      req.session.settings.ai_chat_id = getAiChatID();
    }
  }
  next();
}

export const VALID_CODEMIRROR_THEMES = new Set([
  'abcdef',
  'abyss',
  'androidstudio',
  'andromeda',
  'atomone',
  'aura',
  'bbedit',
  'basic light', // import light and basic dark from `basic`
  'basic dark', // import light and basic dark from `basic`
  'bespin',
  'copilot',
  'dracula',
  'darcula',
  'duotone light', // import duotone light and duotone dark from 'duotone'
  'duotone dark', // import duotone light and duotone dark from 'duotone'
  'eclipse',
  'github light', // import github light and github dark from 'github'
  'github dark', // import github light and github dark from 'github'
  'gruvbox dark', // import gruvbox dark and gruvbox light from gruvbox-dark
  'gruvbox light',
  'material light',
  'material dark', // material 
  'monokai',
  'monokai dimmed', //monoky-dimmed
  'kimbie',
  'noctis-lilac',
  'nord',
  'okaidia',
  'quietlight',
  'red',
  'solarized light', // solarized light && solarized dark from 'solarized'
  'solarized dark',
  'sublime',
  'tokyo-night',
  'tokyo-night-storm', //--
  'tokyo-night-day',
  'tomorrow-night-blue',
  'white dark', // both from 'white'
  'white light', // both from 'white'
  'vscode',
  'xcode light', // xcode
  'xcode dark' // xcode
] as const);


export default getIpLocationAndCheckDbSettings;

