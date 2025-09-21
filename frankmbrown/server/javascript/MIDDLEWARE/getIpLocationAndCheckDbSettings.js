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
exports.VALID_CODEMIRROR_THEMES = exports.getIpInfoObject = exports.DEFAULT_LAT_LNG = void 0;
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
const general_1 = require("../ROUTER/functions/general");
const database_1 = __importDefault(require("../database"));
const DEFAULT_SETTINGS_1 = __importStar(require("../CONSTANTS/DEFAULT_SETTINGS"));
const settingsHandler_1 = require("../ROUTER/functions/settingsHandler");
const node_ipinfo_1 = __importDefault(require("node-ipinfo"));
const DEFAULT_IP_LOCATION_1 = __importDefault(require("../CONSTANTS/DEFAULT_IP_LOCATION"));
const time_1 = require("../utils/time");
const env_1 = __importDefault(require("../utils/env"));
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
const ipInfoToken = env_1.default.IP_INFO_TOKEN;
if (!!!ipInfoToken)
    throw new Error('IP_INFO_TOKEN not imported properly from .env file.');
const ipinfoWrapper = new node_ipinfo_1.default(ipInfoToken);
/**
 * node-ipinfo returns the location as a string of the form seen below, so
 * this helper function is used to extract a { lat, lng } json object from the
 * string
 * @param s String string of the form: 'number,number'
 */
const getLatLngFromString = (s) => {
    const arr = s.split(',');
    if (arr.length !== 2)
        return undefined;
    const lat = parseFloat(arr[0]);
    const lng = parseFloat(arr[1]);
    if (typeof lat !== 'number' || isNaN(lat) || typeof lng !== 'number' || isNaN(lng) || !!!(0, general_1.validLatLng)(lat, lng))
        return undefined;
    return { lat, lng };
};
exports.DEFAULT_LAT_LNG = getLatLngFromString(DEFAULT_IP_LOCATION_1.default.loc);
async function getIpLocation(req, isDevelopment) {
    if (isDevelopment) {
        return new Promise((resolve, reject) => resolve(DEFAULT_IP_LOCATION_1.default));
    }
    else {
        return new Promise((resolve, reject) => {
            var _a, _b;
            if (typeof ((_a = req.session.ip) === null || _a === void 0 ? void 0 : _a.address) !== 'string')
                throw Error('Ip Address does not exist');
            ipinfoWrapper
                .lookupIp((_b = req.session.ip) === null || _b === void 0 ? void 0 : _b.address)
                .then((response) => {
                if (response.bogon)
                    throw Error('Some IP addresses and IP ranges are reserved for special use, such as for local or private networks, and should not appear on the public internet. These reserved ranges, along with other IP ranges that haven\'t yet been allocated and therefore also shouldn\'t appear on the public internet are sometimes known as bogons. Because bogon IP addresses don\'t belong to a specific user or server on the internet, so there\'s no way to geolocate them.');
                else
                    resolve(response);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
}
/**
 * Helper function to make sure that only one of the device types (phone, tablet, or desktop)
 * in settings is true
 * @param phone
 * @param tablet
 * @param desktop
 */
const validateDeviceType = (phone, tablet, desktop) => {
    const IS_VALID = Boolean([phone, tablet, desktop].filter((arr) => arr === true).length === 1);
    if (IS_VALID)
        return { phone, tablet, desktop };
    else
        return { phone: false, tablet: false, desktop: true };
};
/**
 * Validate settings from database - make sure settings
 * are valid before putting them in cache
 */
const validateSettingsFromDB = ({ font_family, light_primary, light_secondary, light_warning, light_success, light_info, light_error, light_button_contrast_text, light_background, light_secondary_background, light_navbar_color, light_shadow_color, light_text_color, dark_primary, dark_secondary, dark_warning, dark_success, dark_info, dark_error, dark_button_contrast_text, dark_background, dark_secondary_background, dark_navbar_color, dark_shadow_color, dark_text_color, code_editor_theme, code_editor_emmet, desktop_application_size, tablet_application_size, mobile_application_size, settings_string, lang, timezone }) => {
    const FONT_FAMILY = "Anuphan, sans-serif;";
    const VALID_HEX_REGEX = /^#([0-9a-f]{3}){1,2}$/i;
    const LIGHT_MODE_DEFAULT = structuredClone(DEFAULT_SETTINGS_1.default.lightMode);
    const LIGHT_MODE = {
        primary: VALID_HEX_REGEX.test(light_primary) ? light_primary : LIGHT_MODE_DEFAULT.primary,
        secondary: VALID_HEX_REGEX.test(light_secondary) ? light_secondary : LIGHT_MODE_DEFAULT.secondary,
        warning: VALID_HEX_REGEX.test(light_warning) ? light_warning : LIGHT_MODE_DEFAULT.warning,
        success: VALID_HEX_REGEX.test(light_success) ? light_success : LIGHT_MODE_DEFAULT.success,
        info: VALID_HEX_REGEX.test(light_info) ? light_info : LIGHT_MODE_DEFAULT.info,
        error: VALID_HEX_REGEX.test(light_error) ? light_error : LIGHT_MODE_DEFAULT.error,
        buttonContrastText: VALID_HEX_REGEX.test(light_button_contrast_text) ? light_button_contrast_text : LIGHT_MODE_DEFAULT.buttonContrastText,
        background: VALID_HEX_REGEX.test(light_background) ? light_background : LIGHT_MODE_DEFAULT.background,
        secondaryBackground: VALID_HEX_REGEX.test(light_secondary_background) ? light_secondary_background : LIGHT_MODE_DEFAULT.secondaryBackground,
        navbarColor: VALID_HEX_REGEX.test(light_navbar_color) ? light_navbar_color : LIGHT_MODE_DEFAULT.navbarColor,
        shadowColor: VALID_HEX_REGEX.test(light_shadow_color) ? light_shadow_color : LIGHT_MODE_DEFAULT.shadowColor,
        textColor: VALID_HEX_REGEX.test(light_text_color) ? light_text_color : LIGHT_MODE_DEFAULT.textColor
    };
    const DARK_MODE_DEFAULT = structuredClone(DEFAULT_SETTINGS_1.default.darkMode);
    const DARK_MODE = {
        primary: VALID_HEX_REGEX.test(dark_primary) ? dark_primary : DARK_MODE_DEFAULT.primary,
        secondary: VALID_HEX_REGEX.test(dark_secondary) ? dark_secondary : DARK_MODE_DEFAULT.secondary,
        warning: VALID_HEX_REGEX.test(dark_warning) ? dark_warning : DARK_MODE_DEFAULT.warning,
        success: VALID_HEX_REGEX.test(dark_success) ? dark_success : DARK_MODE_DEFAULT.success,
        info: VALID_HEX_REGEX.test(dark_info) ? dark_info : DARK_MODE_DEFAULT.info,
        error: VALID_HEX_REGEX.test(dark_error) ? dark_error : DARK_MODE_DEFAULT.error,
        buttonContrastText: VALID_HEX_REGEX.test(dark_button_contrast_text) ? dark_button_contrast_text : DARK_MODE_DEFAULT.buttonContrastText,
        background: VALID_HEX_REGEX.test(dark_background) ? dark_background : DARK_MODE_DEFAULT.background,
        secondaryBackground: VALID_HEX_REGEX.test(dark_secondary_background) ? dark_secondary_background : DARK_MODE_DEFAULT.secondaryBackground,
        navbarColor: VALID_HEX_REGEX.test(dark_navbar_color) ? dark_navbar_color : DARK_MODE_DEFAULT.navbarColor,
        shadowColor: VALID_HEX_REGEX.test(dark_shadow_color) ? dark_shadow_color : DARK_MODE_DEFAULT.shadowColor,
        textColor: VALID_HEX_REGEX.test(dark_text_color) ? dark_text_color : DARK_MODE_DEFAULT.textColor
    };
    const ret_code_editor_theme = (exports.VALID_CODEMIRROR_THEMES.has(code_editor_theme) ? code_editor_theme : 'vscode');
    const ret_code_editor_emmet = Boolean(code_editor_emmet);
    const ret_desktop_application_size = (typeof desktop_application_size === 'number' && !!!isNaN(desktop_application_size)) ? Math.min(120, Math.max(80, desktop_application_size)) : 100;
    const ret_tablet_application_size = (typeof tablet_application_size === 'number' && !!!isNaN(tablet_application_size)) ? Math.min(120, Math.max(80, tablet_application_size)) : 100;
    const ret_mobile_application_size = (typeof mobile_application_size === 'number' && !!!isNaN(mobile_application_size)) ? Math.min(120, Math.max(80, mobile_application_size)) : 100;
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
};
/**
 * Put the response from node-ipinfo in a form such that it will
 * be easy to put it in the database later
 * @param res IPinfo
 */
const getIpInfoObject = (res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
    const hostname = (res === null || res === void 0 ? void 0 : res.hostname) || null;
    const bogon = Boolean(res === null || res === void 0 ? void 0 : res.bogon);
    const anycast = Boolean(res === null || res === void 0 ? void 0 : res.anycast);
    const city = (res === null || res === void 0 ? void 0 : res.city) || null;
    const region = (res === null || res === void 0 ? void 0 : res.region) || null;
    const country = (res === null || res === void 0 ? void 0 : res.country) || null;
    const country_flag_emoji = ((_a = res === null || res === void 0 ? void 0 : res.countryFlag) === null || _a === void 0 ? void 0 : _a.emoji) || null;
    const country_flag_unicode = ((_b = res === null || res === void 0 ? void 0 : res.countryFlag) === null || _b === void 0 ? void 0 : _b.unicode) || null;
    const country_flag_url = (res === null || res === void 0 ? void 0 : res.countryFlagURL) || null;
    const country_currency_code = ((_c = res === null || res === void 0 ? void 0 : res.countryCurrency) === null || _c === void 0 ? void 0 : _c.code) || null;
    const country_currency_symbol = ((_d = res === null || res === void 0 ? void 0 : res.countryCurrency) === null || _d === void 0 ? void 0 : _d.symbol) || null;
    const continent_code = ((_e = res === null || res === void 0 ? void 0 : res.continent) === null || _e === void 0 ? void 0 : _e.code) || null;
    const continent_name = ((_f = res === null || res === void 0 ? void 0 : res.continent) === null || _f === void 0 ? void 0 : _f.name) || null;
    const isEU = Boolean(res === null || res === void 0 ? void 0 : res.isEU);
    const countryCode = (res === null || res === void 0 ? void 0 : res.countryCode) || null;
    const temp_loc = getLatLngFromString(res === null || res === void 0 ? void 0 : res.loc);
    const loc = temp_loc ? `(${temp_loc.lng},${temp_loc.lat})` : `(${exports.DEFAULT_LAT_LNG.lng},${exports.DEFAULT_LAT_LNG.lat})`; //
    const org = (res === null || res === void 0 ? void 0 : res.org) || null;
    const postal = (res === null || res === void 0 ? void 0 : res.postal) || null;
    const timezone = (res === null || res === void 0 ? void 0 : res.timezone) || null;
    const asn_asn = ((_g = res === null || res === void 0 ? void 0 : res.asn) === null || _g === void 0 ? void 0 : _g.asn) || null;
    const asn_name = ((_h = res === null || res === void 0 ? void 0 : res.asn) === null || _h === void 0 ? void 0 : _h.name) || null;
    const asn_domain = ((_j = res === null || res === void 0 ? void 0 : res.asn) === null || _j === void 0 ? void 0 : _j.domain) || null;
    const asn_route = ((_k = res === null || res === void 0 ? void 0 : res.asn) === null || _k === void 0 ? void 0 : _k.route) || null;
    const asn_type = ((_l = res === null || res === void 0 ? void 0 : res.asn) === null || _l === void 0 ? void 0 : _l.type) || null;
    const company_name = ((_m = res === null || res === void 0 ? void 0 : res.company) === null || _m === void 0 ? void 0 : _m.name) || null;
    const company_domain = ((_o = res === null || res === void 0 ? void 0 : res.company) === null || _o === void 0 ? void 0 : _o.domain) || null;
    const company_type = ((_p = res === null || res === void 0 ? void 0 : res.company) === null || _p === void 0 ? void 0 : _p.type) || null;
    const carrier_name = ((_q = res === null || res === void 0 ? void 0 : res.carrier) === null || _q === void 0 ? void 0 : _q.name) || null;
    const carrier_mcc = ((_r = res === null || res === void 0 ? void 0 : res.carrier) === null || _r === void 0 ? void 0 : _r.mcc) || null;
    const carrier_mnc = ((_s = res === null || res === void 0 ? void 0 : res.carrier) === null || _s === void 0 ? void 0 : _s.mnc) || null;
    const privacy_vpn = ((_t = res === null || res === void 0 ? void 0 : res.privacy) === null || _t === void 0 ? void 0 : _t.vpn) || null;
    const privacy_proxy = ((_u = res === null || res === void 0 ? void 0 : res.privacy) === null || _u === void 0 ? void 0 : _u.proxy) || null;
    const privacy_tor = ((_v = res === null || res === void 0 ? void 0 : res.privacy) === null || _v === void 0 ? void 0 : _v.tor) || null;
    const privacy_relay = ((_w = res === null || res === void 0 ? void 0 : res.privacy) === null || _w === void 0 ? void 0 : _w.relay) || null;
    const privacy_hosting = ((_x = res === null || res === void 0 ? void 0 : res.privacy) === null || _x === void 0 ? void 0 : _x.hosting) || null;
    const privacy_service = ((_y = res === null || res === void 0 ? void 0 : res.privacy) === null || _y === void 0 ? void 0 : _y.service) || null;
    const abuse_address = ((_z = res === null || res === void 0 ? void 0 : res.abuse) === null || _z === void 0 ? void 0 : _z.address) || null;
    const abuse_country = ((_0 = res === null || res === void 0 ? void 0 : res.abuse) === null || _0 === void 0 ? void 0 : _0.country) || null;
    const abuse_country_code = ((_1 = res === null || res === void 0 ? void 0 : res.abuse) === null || _1 === void 0 ? void 0 : _1.countryCode) || null;
    const abuse_email = ((_2 = res === null || res === void 0 ? void 0 : res.abuse) === null || _2 === void 0 ? void 0 : _2.email) || null;
    const abuse_name = ((_3 = res === null || res === void 0 ? void 0 : res.abuse) === null || _3 === void 0 ? void 0 : _3.name) || null;
    const abuse_network = ((_4 = res === null || res === void 0 ? void 0 : res.abuse) === null || _4 === void 0 ? void 0 : _4.network) || null;
    const abuse_phone = ((_5 = res === null || res === void 0 ? void 0 : res.abuse) === null || _5 === void 0 ? void 0 : _5.phone) || null;
    const domains_ip = ((_6 = res === null || res === void 0 ? void 0 : res.domains) === null || _6 === void 0 ? void 0 : _6.ip) || null;
    const domains_total = parseInt(String((_7 = res === null || res === void 0 ? void 0 : res.domains) === null || _7 === void 0 ? void 0 : _7.total)) || null;
    const domains_domains = Array.isArray((_8 = res === null || res === void 0 ? void 0 : res.domains) === null || _8 === void 0 ? void 0 : _8.domains) ? (_9 = res === null || res === void 0 ? void 0 : res.domains) === null || _9 === void 0 ? void 0 : _9.domains.map((s) => String(s)) : null;
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
    };
};
exports.getIpInfoObject = getIpInfoObject;
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
async function getIpLocationAndCheckDbSettings(req, res, next) {
    var _a, _b;
    if (req.session.ip_location === undefined) {
        try {
            if (typeof ((_a = req.session.ip) === null || _a === void 0 ? void 0 : _a.address) !== 'string')
                throw new Error('IP Address should already be established as a string in cache.');
            const [ipInfo, dbInfo] = await Promise.all([getIpLocation(req, IS_DEVELOPMENT_1.default), (0, database_1.default)().query(getInitialSettingsQuery, [String(req.session.ip.address)])]);
            if (dbInfo.rows.length) {
                const { ip_id, phone: dbPhone, tablet: dbTablet, desktop: dbDesktop, browser: dbBrowser, settings_mode, disable_default_tab, tab_size: db_tab_size, spellcheck, font_family, light_primary, light_secondary, light_warning, light_success, light_info, light_error, light_button_contrast_text, light_background, light_secondary_background, light_navbar_color, light_shadow_color, light_text_color, dark_primary, dark_secondary, dark_warning, dark_success, dark_info, dark_error, dark_button_contrast_text, dark_background, dark_secondary_background, dark_navbar_color, dark_shadow_color, dark_text_color, code_editor_theme, code_editor_emmet, desktop_application_size, tablet_application_size, mobile_application_size, settings_string, ip_location: db_ip_location, ip_location_temp, ip_device_temp, lang, timezone, create_annotation, create_note, update_note, create_blog, update_blog, create_idea, update_idea, create_comment, create_jupyter_notebook, create_markdown_note, create_stream_consciousness, create_daily_reading, create_tex_note, create_link, create_quote, create_project, project_update, create_survey, create_goodreads, create_letterboxd, create_game, create_3d_design, create_electronics, include_autocomplete_suggestions, enable_ai_writer, ai_writer_temperature, ai_writer_model, enable_ai_coder, ai_coder_temperature, ai_coder_model, ai_coder_max_tokens, ai_writer_max_tokens } = dbInfo.rows[0];
                const mode = Boolean(settings_mode === "light" || settings_mode === "dark") ? "dark" : "light";
                const tabSize = Math.min(12, Math.max(Number(db_tab_size), 1));
                const ip_location = (0, general_1.validLatLng)(Number(db_ip_location.lat), Number(db_ip_location.lng)) ? { lat: db_ip_location.lat, lng: db_ip_location.lng } : exports.DEFAULT_LAT_LNG;
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
                const SETTINGS = {
                    mode,
                    disableDefaultTab: disable_default_tab,
                    tabSize,
                    spellcheck: Boolean(spellcheck === true),
                    fontFamily: TEMP_SETTINGS.fontFamily,
                    lightMode: TEMP_SETTINGS.lightMode,
                    darkMode: TEMP_SETTINGS.darkMode,
                    settingsString: '',
                    code_editor_theme: TEMP_SETTINGS.code_editor_theme,
                    code_editor_emmet: TEMP_SETTINGS.code_editor_emmet,
                    desktop_application_size: TEMP_SETTINGS.desktop_application_size,
                    tablet_application_size: TEMP_SETTINGS.tablet_application_size,
                    mobile_application_size: TEMP_SETTINGS.mobile_application_size,
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
                SETTINGS.settingsString = (0, settingsHandler_1.getSettingsString)(SETTINGS, SETTINGS.mode);
                const IP_LOCATION_DB = { lat: ip_location.lat, lng: ip_location.lng, temp: JSON.stringify(ip_location_temp) };
                const DEVICE_DB = req.session.device;
                if (((_b = req.session.cookiePreferences) === null || _b === void 0 ? void 0 : _b.preferences) !== true) {
                    const TO_STRINGIFY = {
                        settings: structuredClone(SETTINGS),
                        ip_location: structuredClone(IP_LOCATION_DB),
                        device: structuredClone(DEVICE_DB)
                    };
                    req.session.ip_data_string = JSON.stringify(TO_STRINGIFY);
                }
                else {
                    req.session.settings = structuredClone(SETTINGS);
                }
                req.session.create_ip_address_row = false;
            }
            else {
                req.session.create_ip_address_row = true;
            }
            if (typeof ipInfo.loc !== 'string')
                throw new Error('IP Info loc should be a string of the form "number,number".');
            const loc_temp = getLatLngFromString(ipInfo.loc);
            const loc = loc_temp ? loc_temp : exports.DEFAULT_LAT_LNG;
            const temp_ip_info_obj = (0, exports.getIpInfoObject)(ipInfo);
            const temp_string = JSON.stringify(temp_ip_info_obj);
            if (req.session.settings && req.session.create_ip_address_row && (new Set(time_1.TIME_ZONES_AVAILABLE)).has(temp_ip_info_obj.timezone)) {
                req.session.settings.timezone = temp_ip_info_obj.timezone;
            }
            req.session.ip_location = { lat: loc.lat, lng: loc.lng, temp: temp_string };
        }
        catch (error) {
            console.error(error);
            req.session.create_ip_address_row = false;
            req.session.ip_location = { lat: exports.DEFAULT_LAT_LNG.lat, lng: exports.DEFAULT_LAT_LNG.lng, temp: JSON.stringify((0, exports.getIpInfoObject)(DEFAULT_IP_LOCATION_1.default)) };
            req.session.settings = DEFAULT_SETTINGS_1.default;
            req.session.settings.ai_chat_id = (0, DEFAULT_SETTINGS_1.getAiChatID)();
        }
    }
    next();
}
exports.VALID_CODEMIRROR_THEMES = new Set([
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
]);
exports.default = getIpLocationAndCheckDbSettings;
