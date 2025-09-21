CREATE TABLE ip_info (
  id serial PRIMARY KEY NOT NULL,
  ip_address TEXT NOT NULL UNIQUE,
  ip_address_type integer
);
CREATE TABLE ip_device (
  ip_id integer references ip_info(id) ON DELETE CASCADE,
  CONSTRAINT unique_ip UNIQUE (ip_id),
  phone boolean NOT NULL,
  tablet boolean NOT NULL,
  desktop boolean NOT NULL,
  browser_name TEXT,
  browser_version TEXT,
  browser_major TEXT,
  cpu_architecture TEXT,
  device_type TEXT,
  device_vendor TEXT,
  device_model TEXT,
  engine_name TEXT,
  engine_version TEXT,
  os_name TEXT,
  os_version TEXT
);
CREATE TABLE ip_settings (
  ip_id integer references ip_info(id) ON DELETE CASCADE, 
  CONSTRAINT unique_ip UNIQUE (ip_id),
  settings_mode TEXT NOT NULL,
  disable_default_tab boolean NOT NULL,
  tab_size integer NOT NULL,
  spellcheck boolean NOT NULL DEFAULT false,
  font_family TEXT NOT NULL,
  light_primary TEXT NOT NULL,
  light_secondary TEXT NOT NULL,
  light_warning TEXT NOT NULL,
  light_success TEXT NOT NULL,
  light_info TEXT NOT NULL,
  light_error TEXT NOT NULL,
  light_button_contrast_text TEXT NOT NULL,
  light_background TEXT NOT NULL,
  light_secondary_background TEXT NOT NULL,
  light_navbar_color TEXT NOT NULL,
  light_shadow_color TEXT NOT NULL,
  light_text_color TEXT NOT NULL,
  dark_primary TEXT NOT NULL,
  dark_secondary TEXT NOT NULL,
  dark_warning TEXT NOT NULL,
  dark_success TEXT NOT NULL,
  dark_info TEXT NOT NULL,
  dark_error TEXT NOT NULL,
  dark_button_contrast_text TEXT NOT NULL,
  dark_background TEXT NOT NULL,
  dark_secondary_background TEXT NOT NULL,
  dark_navbar_color TEXT NOT NULL,
  dark_shadow_color TEXT NOT NULL,
  dark_text_color TEXT NOT NULL,
  settings_string TEXT NOT NULL,
  code_editor_theme TEXT NOT NULL DEFAULT 'vscode',
  code_editor_emmet boolean NOT NULL DEFAULT true,
  desktop_application_size smallint DEFAULT 100 CHECK (desktop_application_size>=80 AND desktop_application_size<=120),
  tablet_application_size smallint DEFAULT 100 CHECK (tablet_application_size>=80 AND tablet_application_size<=120),
  mobile_application_size smallint DEFAULT 100 CHECK (mobile_application_size>=80 AND mobile_application_size<=120)
);

CREATE TABLE ip_random_names (
	ip_id integer NOT NULL REFERENCES ip_info (id),
	random_name TEXT NOT NULL,
  profile_picture TEXT NOT NULL,
  UNIQUE(ip_id)
);

CREATE TABLE ip_location (
  ip_id integer references ip_info(id) ON DELETE CASCADE,
  CONSTRAINT unique_ip UNIQUE (ip_id),
  hostname TEXT,
  bogon boolean,
  anycast boolean,
  city TEXT,
  region TEXT,
  country TEXT,
  country_flag_emoji TEXT,
  country_flag_unicode TEXT,
  country_flag_url TEXT,
  country_currency_code TEXT,
  country_currency_symbol TEXT,
  continent_code TEXT,
  continent_name TEXT,
  isEU boolean,
  countryCode TEXT,
  loc point,
  org TEXT,
  postal TEXT,
  timezone TEXT,
  asn_asn TEXT,
  asn_name TEXT,
  asn_domain TEXT,
  asn_route TEXT,
  asn_type TEXT,
  company_name TEXT,
  company_domain TEXT,
  company_type TEXT,
  carrier_name TEXT,
  carrier_mcc TEXT,
  carrier_mnc TEXT,
  privacy_vpn TEXT,
  privacy_proxy TEXT,
  privacy_tor TEXT,
  privacy_relay TEXT,
  privacy_hosting TEXT,
  privacy_service TEXT,
  abuse_address TEXT,
  abuse_country TEXT,
  abuse_country_code TEXT,
  abuse_email TEXT,
  abuse_name TEXT,
  abuse_network TEXT,
  abuse_phone TEXT,
  domains_ip TEXT,
  domains_total integer,
  domains_domains TEXT[]
);
-- Query for checking whether ip address already exists in DB before setting 
-- new info in database 
-- SHOULD try to get all information that you plan to keep in cache 
SELECT ip_info.id AS ip_id,  
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
) AS ip_device_temp
FROM ip_info 
JOIN ip_device ON ip_info.id=ip_device.ip_id
JOIN ip_settings ON ip_info.id=ip_settings.ip_id 
JOIN ip_location ON ip_info.id=ip_location.ip_id
WHERE ip_info.ip_address=$1::TEXT;



-- CREATE ip_address row if this is the first time you are seeing the information in cache
CREATE OR REPLACE FUNCTION create_ip_settings_rows(
  in_ip_address TEXT,
  in_ip_address_type integer,
  in_phone boolean DEFAULT false,
  in_tablet boolean DEFAULT false,
  in_desktop boolean DEFAULT true,
  in_browser_name TEXT DEFAULT null,
  in_browser_version TEXT DEFAULT null,
  in_browser_major TEXT DEFAULT null,
  in_cpu_architecture TEXT DEFAULT null,
  in_device_type TEXT DEFAULT null,
  in_device_vendor TEXT DEFAULT null,
  in_device_model TEXT DEFAULT null,
  in_engine_name TEXT DEFAULT null,
  in_engine_version TEXT DEFAULT null,
  in_os_name TEXT DEFAULT null,
  in_os_version TEXT DEFAULT null,
  in_settings_mode TEXT DEFAULT 'dark',
  in_disable_default_tab boolean DEFAULT false,
  in_tab_size integer DEFAULT 2,
  in_spellcheck boolean DEFAULT false,
  in_font_family TEXT DEFAULT 'Anuphan, sans-serif;',
  in_light_primary TEXT DEFAULT '#004da3',
  in_light_secondary TEXT DEFAULT '#9c27b0',
  in_light_warning TEXT DEFAULT '#c54800',
  in_light_success TEXT DEFAULT '#0f661d',
  in_light_info TEXT DEFAULT '#00599d',
  in_light_error TEXT DEFAULT '#b30019',
  in_light_button_contrast_text TEXT DEFAULT '#FFFFFF',
  in_light_background TEXT DEFAULT '#ffffff',
  in_light_secondary_background TEXT DEFAULT '#dddddd',
  in_light_navbar_color TEXT DEFAULT '#42A5F5',
  in_light_shadow_color TEXT DEFAULT '#000000',
  in_light_text_color TEXT DEFAULT '#000000',
  in_dark_primary TEXT DEFAULT '#90caf9',
  in_dark_secondary TEXT DEFAULT '#ab47bc',
  in_dark_warning TEXT DEFAULT '#ffa726',
  in_dark_success TEXT DEFAULT '#66bb6a',
  in_dark_info TEXT DEFAULT '#29b6f6',
  in_dark_error TEXT DEFAULT '#f44336',
  in_dark_button_contrast_text TEXT DEFAULT '#000000',
  in_dark_background TEXT DEFAULT '#171717',
  in_dark_secondary_background TEXT DEFAULT '#3A3A3A',
  in_dark_navbar_color TEXT DEFAULT '#3A3A3A',
  in_dark_shadow_color TEXT DEFAULT '#FFFFFF',
  in_dark_text_color TEXT DEFAULT '#FFFFFF',
  in_settings_string TEXT DEFAULT 'html body, html body * {--font-family:Anuphan, sans-serif!important;--background:#ffffff!important;--secondary-background:#dddddd!important;--text-primary:rgba(0,0,0,1)!important;--text-secondary:rgba(0,0,0,0.7)!important;--text-disabled:rgba(0,0,0,0.5)!important;--text-icon:rgba(0,0,0,5)!important;--text-divider:rgba(0,0,0,0.12)!important;--button-contrast-text:rgba(255,255,255,1)!important;--icon-hover:rgba(0,0,0,0.1)!important;--icon-focus:rgba(0,0,0,0.15)!important;--outlined-text-hover:rgba(200,229,252,0.08)!important;--shadow-button:0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--shadow-button-hover:0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--divider:rgba(0,0,0,0.12)!important;--select-button-hover:#b1c0d1!important;--background-image-alert:none!important;--primary-light:#80a6d1!important;--primary:#004da3!important;--primary-dark:#002e62!important;--secondary-light:#ce93d8!important;--secondary:#9c27b0!important;--secondary-dark: #5e176a!important;--secondary-hover: #e1bee7!important;--error-light:#d9808c!important;--error:#b30019!important;--error-dark: #6b000f!important;--error-alert-color: #1b0004!important;--error-alert-background:#e8b3ba!important;--warning-light:#e2a480!important;--warning:#c54800!important;--warning-dark:  #762b00!important;--warning-alert-color:#1e0b00!important;--warning-alert-background:#eec8b3!important;--info-light:#80acce!important;--info:#00599d!important;--info-dark: #00355e!important;--info-alert-color:#000d18!important;--info-alert-background:#b3cde2!important;--success-light: #87b38e!important;--success:#0f661d!important;--success-dark: #093d11!important;--success-alert-color:#020f04!important;--success-alert-background: #b7d1bb!important;--disabled:rgba(0,0,0,0.3)!important;--card-1-background: #f4f4f4!important;--card-1-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)!important;--card-2-background: #e9e9e9!important;--card-2-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--card-3-background:#dddddd!important;--card-3-shadow: 0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)!important;--card-3-hover-shadow:0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)!important;--card-3-hover-background: #c7c7c7!important;--kbd-color-background:#dddddd!important;--kbd-color-border: #000000!important;--kbd-color-text: #000000!important;--dialog-shadow: 0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)!important;--chip: 0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)!important;--chip-hover: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--shadow-navbar: 0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)!important;--navbar-color:#42A5F5!important;} .pintura-editor, pintura-editor {--color-primary:#004da3!important;--color-primary-dark:#002e62!important;--color-primary-text:#FFFFFF!important;--color-secondary:#004da3!important;--color-secondary-dark:#5e176a!important;--color-focus:0,46,98!important;--color-error:179,0,25!important;--color-background:255,255,255!important;--color-foreground:0,0,0!important;--font-size: 1rem!important;--font-family: Anuphan, sans-serif!important;--pattern-transparent: url(data:image/svg+xml;charset=utf-8,%3Csvg width="8" height="8" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h4v4H0zm4 4h4v4H4z" fill="%23E5E5E5"/%3E%3C/svg%3E);}',
  in_hostname TEXT DEFAULT null,
  in_bogon boolean DEFAULT false,
  in_anycast boolean DEFAULT false,
  in_city TEXT DEFAULT null,
  in_region TEXT DEFAULT null,
  in_country TEXT DEFAULT null,
  in_country_flag_emoji TEXT DEFAULT null,
  in_country_flag_unicode TEXT DEFAULT null,
  in_country_flag_url TEXT DEFAULT null,
  in_country_currency_code TEXT DEFAULT null,
  in_country_currency_symbol TEXT DEFAULT null,
  in_continent_code TEXT DEFAULT null,
  in_continent_name TEXT DEFAULT null,
  in_isEU boolean DEFAULT false,
  in_countryCode TEXT DEFAULT null,
  in_loc point DEFAULT '(-86.5264,39.1653)',
  in_org TEXT DEFAULT null,
  in_postal TEXT DEFAULT null,
  in_timezone TEXT DEFAULT null,
  in_asn_asn TEXT DEFAULT null,
  in_asn_name TEXT DEFAULT null,
  in_asn_domain TEXT DEFAULT null,
  in_asn_route TEXT DEFAULT null,
  in_asn_type TEXT DEFAULT null,
  in_company_name TEXT DEFAULT null,
  in_company_domain TEXT DEFAULT null,
  in_company_type TEXT DEFAULT null,
  in_carrier_name TEXT DEFAULT null,
  in_carrier_mcc TEXT DEFAULT null,
  in_carrier_mnc TEXT DEFAULT null,
  in_privacy_vpn TEXT DEFAULT null,
  in_privacy_proxy TEXT DEFAULT null,
  in_privacy_tor TEXT DEFAULT null,
  in_privacy_relay TEXT DEFAULT null,
  in_privacy_hosting TEXT DEFAULT null,
  in_privacy_service TEXT DEFAULT null,
  in_abuse_address TEXT DEFAULT null,
  in_abuse_country TEXT DEFAULT null,
  in_abuse_country_code TEXT DEFAULT null,
  in_abuse_email TEXT DEFAULT null,
  in_abuse_name TEXT DEFAULT null,
  in_abuse_network TEXT DEFAULT null,
  in_abuse_phone TEXT DEFAULT null,
  in_domains_ip TEXT DEFAULT null,
  in_domains_total integer DEFAULT null,
  in_domains_domains TEXT[] DEFAULT null,
  inp_random_name TEXT DEFAULT 'undefined',
  inp_profile_pic TEXT DEFAULT 'undefined'
  ) RETURNS integer AS $$
  DECLARE
    ip_id_var integer;
  BEGIN
    INSERT INTO ip_info (ip_address,ip_address_type) VALUES (in_ip_address,in_ip_address_type) RETURNING id INTO ip_id_var;
    INSERT INTO ip_device (
      ip_id,
      phone,
      tablet,
      desktop,
      browser_name,
      browser_version,
      browser_major,
      cpu_architecture,
      device_type,
      device_vendor,
      device_model,
      engine_name,
      engine_version,
      os_name,
      os_version
    ) VALUES (
      ip_id_var,
      in_phone,
      in_tablet,
      in_desktop,
      in_browser_name,
      in_browser_version,
      in_browser_major,
      in_cpu_architecture,
      in_device_type,
      in_device_vendor,
      in_device_model,
      in_engine_name,
      in_engine_version,
      in_os_name,
      in_os_version
    );
    INSERT INTO ip_settings (
      ip_id,
      settings_mode,
      disable_default_tab,
      tab_size,
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
      settings_string
    ) VALUES (
      ip_id_var,
      in_settings_mode,
      in_disable_default_tab,
      in_tab_size,
      in_spellcheck,
      in_font_family,
      in_light_primary,
      in_light_secondary,
      in_light_warning,
      in_light_success,
      in_light_info,
      in_light_error,
      in_light_button_contrast_text,
      in_light_background,
      in_light_secondary_background,
      in_light_navbar_color,
      in_light_shadow_color,
      in_light_text_color,
      in_dark_primary,
      in_dark_secondary,
      in_dark_warning,
      in_dark_success,
      in_dark_info,
      in_dark_error,
      in_dark_button_contrast_text,
      in_dark_background,
      in_dark_secondary_background,
      in_dark_navbar_color,
      in_dark_shadow_color,
      in_dark_text_color,
      in_settings_string
    );
    INSERT INTO ip_location (
      ip_id,
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
    ) VALUES (
      ip_id_var,
      in_hostname,
      in_bogon,
      in_anycast,
      in_city,
      in_region,
      in_country,
      in_country_flag_emoji,
      in_country_flag_unicode,
      in_country_flag_url,
      in_country_currency_code,
      in_country_currency_symbol,
      in_continent_code,
      in_continent_name,
      in_isEU,
      in_countryCode,
      in_loc,
      in_org,
      in_postal,
      in_timezone,
      in_asn_asn,
      in_asn_name,
      in_asn_domain,
      in_asn_route,
      in_asn_type,
      in_company_name,
      in_company_domain,
      in_company_type,
      in_carrier_name,
      in_carrier_mcc,
      in_carrier_mnc,
      in_privacy_vpn,
      in_privacy_proxy,
      in_privacy_tor,
      in_privacy_relay,
      in_privacy_hosting,
      in_privacy_service,
      in_abuse_address,
      in_abuse_country,
      in_abuse_country_code,
      in_abuse_email,
      in_abuse_name,
      in_abuse_network,
      in_abuse_phone,
      in_domains_ip,
      in_domains_total,
      in_domains_domains
    );
    INSERT INTO ip_random_names (ip_id,random_name,profile_picture) VALUES (ip_id_var,inp_random_name,inp_profile_pic);
    INSERT INTO notification_preferences_ip (ip_id) VALUES (ip_id_var);
    RETURN ip_id_var;
  END;
$$ LANGUAGE plpgsql;



-- Update settings
UPDATE ip_settings SET 
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
settings_string=$29::TEXT WHERE ip_id=$30::integer;

-- Table used for analytics on who viewed a table and when
CREATE TABLE page_view (
  page_location TEXT NOT NULL,
  ip_id integer,
  unix_time integer 
);

-- Table used to record instances of violating content security policy
CREATE TABLE csp_violations (
  ip_id integer,
  unix_time integer,
  blocked_uri TEXT,
  disposition TEXT,
  document_uri TEXT,
  effective_directive TEXT,
  original_policy TEXT,
  referrer TEXT,
  script_sample TEXT,
  status_code TEXT,
  violated_directive TEXT
);

INSERT INTO csp_violations (
  ip_id,
  unix_time,
  blocked_uri,
  disposition,
  document_uri,
  effective_directive,
  original_policy,
  referrer,
  script_sample,
  status_code,
  violated_directive
) VALUES (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11
);

-- Table to keep track of blog posts
CREATE TABLE blog_post (
  id serial PRIMARY KEY NOT NULL,
  blog_title TEXT NOT NULL,
  blog_description TEXT NOT NULL, 
  blog_keywords TEXT NOT NULL,
  blog_image TEXT,
  lexical_state TEXT NOT NULL,
  date_created integer NOT NULL
);
INSERT INTO blog_post (
  blog_title,
  blog_description, 
  blog_keywords,
  blog_image,
  lexical_state,
  date_created
) VALUES (
  $1::TEXT,
  $2::TEXT,
  $3::TEXT,
  $4::TEXT,
  $5::TEXT,
  $6::integer
);


/* --------------------------------------------- search ------------------------ */
CREATE TABLE search(
	id bigserial PRIMARY KEY,
	og_text TEXT NOT NULL,
	search tsvector GENERATED ALWAYS AS (
		to_tsvector('english',og_text) || ' '
	) STORED NOT NULL,
	note boolean NOT NULL,
	blog boolean NOT NULL,
	blog_title tsvector,
	note_title tsvector,
	date_added bigint,
  url TEXT NOT NULL
);

CREATE INDEX idx_search ON search USING GIN(search);

SELECT og_text, url, ts_rank(search, websearch_to_tsquery('simple',$1::TEXT)) rank 
FROM search WHERE search @@ websearch_to_tsquery('simple',$1::TEXT) AND note=$2 AND blog=$3
ORDER BY rank DESC LIMIT 50;

CREATE TABLE search_queries (
  id bigserial PRIMARY KEY,
  query TEXT NOT NULL,
  date_requested bigint NOT NULL
);

/* --------------------------------------------- User Stuff ------------------------ */
DROP TABLE users, user_settings, user_actions CASCADE;
CREATE TABLE users (
  id serial PRIMARY KEY,
  user_username TEXT UNIQUE NOT NULL check (char_length(user_username)>=4 AND char_length(user_username)<=50),
  user_password TEXT NOT NULL,
  user_email TEXT UNIQUE NOT NULL,
  user_date_created bigint NOT NULL, 
  user_banned boolean NOT NULL DEFAULT false
);
-- Create Account
INSERT INTO users (
  user_username,
  user_password,
  user_email,
  user_date_created,
  user_banned
) VALUES (
  $1::TEXT,
  $2::TEXT,
  $2::TEXT,
  $4::bigint,
  false
) RETURNING id;
CREATE TABLE user_settings (
  user_settings_id serial PRIMARY KEY,
  user_id INTEGER NOT NULL,
  settings_mode TEXT NOT NULL,
  disable_default_tab boolean NOT NULL,
  tab_size integer NOT NULL,
  spellcheck boolean NOT NULL DEFAULT false,
  font_family TEXT NOT NULL,
  light_primary TEXT NOT NULL,
  light_secondary TEXT NOT NULL,
  light_warning TEXT NOT NULL,
  light_success TEXT NOT NULL,
  light_info TEXT NOT NULL,
  light_error TEXT NOT NULL,
  light_button_contrast_text TEXT NOT NULL,
  light_background TEXT NOT NULL,
  light_secondary_background TEXT NOT NULL,
  light_navbar_color TEXT NOT NULL,
  light_shadow_color TEXT NOT NULL,
  light_text_color TEXT NOT NULL,
  dark_primary TEXT NOT NULL,
  dark_secondary TEXT NOT NULL,
  dark_warning TEXT NOT NULL,
  dark_success TEXT NOT NULL,
  dark_info TEXT NOT NULL,
  dark_error TEXT NOT NULL,
  dark_button_contrast_text TEXT NOT NULL,
  dark_background TEXT NOT NULL,
  dark_secondary_background TEXT NOT NULL,
  dark_navbar_color TEXT NOT NULL,
  dark_shadow_color TEXT NOT NULL,
  dark_text_color TEXT NOT NULL,
  settings_string TEXT NOT NULL,
  code_editor_theme TEXT NOT NULL DEFAULT 'vscode',
  code_editor_emmet boolean NOT NULL DEFAULT true,
  desktop_application_size smallint DEFAULT 100 CHECK (desktop_application_size>=80 AND desktop_application_size<=120),
  tablet_application_size smallint DEFAULT 100 CHECK (tablet_application_size>=80 AND tablet_application_size<=120),
  mobile_application_size smallint DEFAULT 100 CHECK (mobile_application_size>=80 AND mobile_application_size<=120),
	user_settings_fkey 
  FOREIGN KEY(user_id)
  REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO user_settings (
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
user_id 
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
$29::TEXT ,
$30::integer
);


CREATE TABLE user_actions (
  id bigserial PRIMARY KEY,
  user_id integer NOT NULL,
  action_id integer,
  date_of_action bigint,
	constraint user_svgs_fkey 
		FOREIGN KEY(user_id)
		REFERENCES users(id) ON DELETE CASCADE;
);
-- SVGs
CREATE TYPE svg_type AS ENUM ('linear', 'radial');
CREATE TABLE svgs (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id integer,
	ip_id integer NOT NULL,
	svg_obj jsonb NOT NULL,
  svg_text TEXT NOT NULL,
	svg_type svg_type NOT NULL, -- linear or radial
  date_created bigint NOT NUll,
	constraint user_svgs_fkey 
	FOREIGN KEY(user_id)
		REFERENCES users(id) ON DELETE CASCADE,
  constraint ip_id_svgs_fkey 
	FOREIGN KEY(ip_id)
		REFERENCES ip_info(id) ON DELETE CASCADE
);


CREATE TABLE weight_recorder (
	id serial PRIMARY KEY,
	weight real NOT NULL,
	time_recorded bigint NOT NULL
);
CREATE INDEX weight_recorded_time_idx ON weight_recorder USING btree (time_recorded);

--------------------------------- ToDO ---------------------------------------
CREATE TABLE to_do (
	id serial PRIMARY KEY,
	lexical_state TEXT NOT NULL,
	date_created bigint NOT NULL,
	date_completed bigint,
	target_completion_date bigint NOT NULL
);
CREATE INDEX date_created_idx 
ON to_do USING btree(date_created);
CREATE INDEX target_completion_date_idx 
ON to_do USING btree(target_completion_date);


-------------------------- Notes -------------------------------------
CREATE TABLE notes (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,

);  
-------------------------- Blog -------------------------------------
CREATE TABLE blog (
  id serial PRIMARY KEY,
  title TEXT NOT NULL,
  
);  

-------------------------- Blog Sections -------------------------------------
DROP TABLE IF EXISTS diary;
CREATE TABLE diary (
	id serial PRIMARY KEY,
	start_of_day bigint NOT NULL,
	last_edited bigint NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	v smallint NOT NULL DEFAULT 1,
	image TEXT
);
ALTER TABLE diary ADD CONSTRAINT unique_diary_days UNIQUE(start_of_day);
CREATE INDEX start_day_diary_idx ON diary USING btree(start_of_day);
CREATE INDEX version_diary_idx ON diary USING btree(v);

-- Get diary for today
INSERT INTO diary (start_of_day,last_edited,title,description,v) VALUES ($1::bigint,$2::$2::bigint,'','',1::smallint) RETURNING id,start_of_day,last_edited,title,description,v
ON CONFLICT DO SELECT RETURNING id,start_of_day,last_edited,title,description,v;

-- 
UPDATE diary SET last_edited=$1::bigint,title=$2::TEXT,description=$3::TEXT,v=v+1 WHERE start_of_day=$5::bigint RETURNING id,start_of_day,last_edited,title,description,v;

-- FOR blog, note, and idea pages, the last_edited unix time should be the time 
-- when the blog / note / idea was last published

DROP TABLE IF EXISTS blog;
CREATE TABLE blog (
	id serial PRIMARY KEY,
	date_created bigint NOT NULL,
	last_edited bigint NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	active_v smallint,
  highest_v smallint NOT NULL,
	image TEXT,
  versions smallint[] NOT NULL
);

DROP TABLE IF EXISTS note;
CREATE TABLE note (
	id serial PRIMARY KEY,
	date_created bigint NOT NULL,
	last_edited bigint NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	active_v smallint,
  highest_v smallint NOT NULL,
	image TEXT,
  versions smallint[] NOT NULL
);

DROP TABLE IF EXISTS idea;
CREATE TABLE idea (
	id serial PRIMARY KEY,
	date_created bigint NOT NULL,
	last_edited bigint NOT NULL,
	title TEXT NOT NULL,
	description TEXT NOT NULL,
	active_v smallint,
  highest_v smallint NOT NULL,
	image TEXT,
  versions smallint[] NOT NULL
);

CREATE INDEX IF NOT EXISTS blog_active_version_idx ON blog USING btree(active_v);
CREATE INDEX IF NOT EXISTS blog_highest_version_idx ON blog USING btree(highest_v);
CREATE INDEX IF NOT EXISTS note_active_version_idx ON note USING btree(active_v);
CREATE INDEX IF NOT EXISTS note_highest_version_idx ON note USING btree(highest_v);
CREATE INDEX IF NOT EXISTS idea_active_version_idx ON idea USING btree(active_v);
CREATE INDEX IF NOT EXISTS idea_highest_version_idx ON idea USING btree(highest_v);
CREATE INDEX IF NOT EXISTS blog_edited_idx ON blog USING btree(last_edited);
CREATE INDEX IF NOT EXISTS idea_edited_idx ON idea USING btree(last_edited);
CREATE INDEX IF NOT EXISTS note_edited_idx ON note USING btree(last_edited);
CREATE INDEX IF NOT EXISTS blog_created_idx ON blog USING btree(date_created);
CREATE INDEX IF NOT EXISTS idea_created_idx ON idea USING btree(date_created);
CREATE INDEX IF NOT EXISTS note_created_idx ON note USING btree(date_created);


DROP TABLE IF EXISTS lexical_article_section;
CREATE TABLE lexical_article_section (
	id bigserial PRIMARY KEY,
	v smallint NOT NULL,
	section_position smallint NOT NULL,
	diary_id integer,
	blog_id integer,
	note_id integer, 
	idea_id integer,
	words TEXT NOT NULL,
	html TEXT NOT NULL,
	lexical_state jsonb NOT NULL,
  self_v smallint NOT NULL DEFAULT 1,
	CONSTRAINT lex_section_references_object CHECK (diary_id<>NULL OR blog_id<>NULL OR note_id<>NULL OR idea_id<>NULL)
);

SELECT section_position, html FROM lexical_article_section WHERE ${type}_id=$1::integer AND v=$2::smallint ORDER BY section_position ASC; 
INSERT INTO lexical_article_section (v,section_position,${type}_id,words,html,lexical_state) 
VALUES 
($1::smallint,$2::smallint,${type}_id::integer,$4::TEXT,$5::TEXT,$6::jsonb);

CREATE INDEX lex_pos_idx ON lexical_article_section USING btree(section_position);
CREATE INDEX lex_diary_idx ON lexical_article_section USING btree(diary_id);
CREATE INDEX lex_blog_idx ON lexical_article_section USING btree(blog_id);
CREATE INDEX lex_note_idx ON lexical_article_section USING btree(note_id);
CREATE INDEX lex_idea_idx ON lexical_article_section USING btree(idea_id);
CREATE INDEX lex_section_self_v_ind ON lexical_article_section USING btree(self_v);

DROP TABLE IF EXISTS html_article_section;
CREATE TABLE html_article_section (
	id bigserial PRIMARY KEY,
	v smallint NOT NULL,
	section_position smallint NOT NULL,
	diary_id integer,
	blog_id integer,
	note_id integer, 
	idea_id integer,
	words TEXT NOT NULL,
	html TEXT NOT NULL,
	css TEXT NOT NULL,
	javascript TEXT NOT NULL,
  self_v smallint NOT NULL DEFAULT 1,
	CONSTRAINT html_section_references_object CHECK (diary_id<>NULL OR blog_id<>NULL OR note_id<>NULL OR idea_id<>NULL),
	CONSTRAINT html_section_not_empty CHECK (html<>''OR css<>'' or javascript<>'')
);
SELECT section_position, html, css, javascript FROM html_article_section WHERE ${type}_id=$1::integer AND v=$2::smallint ORDER BY section_position ASC; 
INSERT INTO html_article_section (v,section_position,${type}_id,words,html,css,javascript) 
VALUES 
($1::smallint,$2::smallint,${type}_id::integer,$4::TEXT,$5::TEXT,$6::TEXT,$7::TEXT);

ALTER TABLE lexical_article_section ADD CONSTRAINT foreign_key_lex_diary FOREIGN KEY(diary_id) REFERENCES diary(id) ON DELETE CASCADE;
ALTER TABLE lexical_article_section ADD CONSTRAINT foreign_key_lex_blog FOREIGN KEY(blog_id) REFERENCES blog(id) ON DELETE CASCADE;
ALTER TABLE lexical_article_section ADD CONSTRAINT foreign_key_lex_note FOREIGN KEY(note_id) REFERENCES note(id) ON DELETE CASCADE;
ALTER TABLE lexical_article_section ADD CONSTRAINT foreign_key_lex_idea FOREIGN KEY(idea_id) REFERENCES idea(id) ON DELETE CASCADE;


ALTER TABLE html_article_section ADD CONSTRAINT foreign_key_code_diary FOREIGN KEY(diary_id) REFERENCES diary(id) ON DELETE CASCADE;
ALTER TABLE html_article_section ADD CONSTRAINT foreign_key_code_blog FOREIGN KEY(blog_id) REFERENCES blog(id) ON DELETE CASCADE;
ALTER TABLE html_article_section ADD CONSTRAINT foreign_key_code_note FOREIGN KEY(note_id) REFERENCES note(id) ON DELETE CASCADE;
ALTER TABLE html_article_section ADD CONSTRAINT foreign_key_code_idea FOREIGN KEY(idea_id) REFERENCES idea(id) ON DELETE CASCADE;


CREATE INDEX code_pos_idx ON html_article_section USING btree(section_position);
CREATE INDEX code_diary_idx ON html_article_section USING btree(diary_id);
CREATE INDEX code_blog_idx ON html_article_section USING btree(blog_id);
CREATE INDEX code_note_idx ON html_article_section USING btree(note_id);
CREATE INDEX code_idea_idx ON html_article_section USING btree(idea_id);
CREATE INDEX html_section_self_v_ind ON html_article_section USING btree(self_v);


CREATE TABLE markdown_article_section (
	id bigserial PRIMARY KEY,
	v smallint NOT NULL,
	section_position smallint NOT NULL,
	diary_id integer,
	blog_id integer,
	note_id integer, 
	idea_id integer,
	words TEXT NOT NULL,
	html TEXT NOT NULL,
	markdown TEXT NOT NULL,
  	self_v smallint NOT NULL DEFAULT 1,
	CONSTRAINT markdown_section_references_object CHECK (diary_id<>NULL OR blog_id<>NULL OR note_id<>NULL OR idea_id<>NULL)
);
CREATE INDEX mark_pos_idx ON markdown_article_section USING btree(section_position);
CREATE INDEX mark_diary_idx ON markdown_article_section USING btree(diary_id);
CREATE INDEX mark_blog_idx ON markdown_article_section USING btree(blog_id);
CREATE INDEX mark_note_idx ON markdown_article_section USING btree(note_id);
CREATE INDEX mark_idea_idx ON markdown_article_section USING btree(idea_id);
CREATE INDEX mark_section_self_v_ind ON markdown_article_section USING btree(self_v);

--------------------------- Keeping Track of Media in S3 ------------------------
CREATE TABLE media (
  s3_key TEXT PRIMARY KEY, -- 
  name TEXT NOT NULL, -- The name of the media
  user_id integer, -- User ID
  ip_id integer NOT NULL, -- 
  media_type TEXT NOT NULL, -- 
  extension TEXT NOT NULL, -- 
  audio_codec TEXT, --
  video_codec TEXT, 
  media_size integer NOT NULL, -- media size in bytes
  date_created bigint NOT NULL, -- Date when he media wa uploaded to the server
  json_data jsonb, -- 
  original boolean default false, -- is this the original version of this media
  inappropriate boolean NOT NULL DEFAULT false, --
  completed_upload boolean DEFAULT false, -- 
  height real, -- height of an image
  width real, -- width of an image
  duration real,
  orig_file_key TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ip_id) REFERENCES ip_info(id) ON DELETE CASCADE
);
CREATE index media_type_idx ON media USING btree(media_type);
ALTER TABLE media ADD CONSTRAINT unique_s3_key UNIQUE(s3_key);

------------------ Geolocation Position -----------------------------
CREATE TABLE geolocation_position (
	ip_id integer NOT NULL,
	user_id integer,
  accuracy real NOT NULL,
  altitude real, 
  altitude_accuracy real,
  heading real,
  latitude real NOT NULL,
  longitude real NOT NULL,
  speed real,
  date_created bigint NOT NULL,
  FOREIGN KEY(user_id)
      REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(ip_id)
    REFERENCES ip_info(id) ON DELETE CASCADE
);

----------------------------- Search Census Communities -------------------------
CREATE TABLE search_census_communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_name TEXT NOT NULL,
  search tsvector GENERATED ALWAYS AS (
		to_tsvector('english',community_name) || ' '
	) STORED NOT NULL,
  community_id integer NOT NULL UNIQUE,
  cache_community jsonb
);

------------------- Search MUI Icons -----------------------------
CREATE TYPE mui_icon_type AS ENUM ('Filled', 'Outlined', 'Rounded', 'Sharp', 'TwoTone');

CREATE TABLE search_mui_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	svg_type mui_icon_type NOT NULL,
  embedding vector(1536) NOT NULL,
  svg TEXT NOT NULL
);

CREATE INDEX mui_icon_title_index ON search_mui_icons 
USING btree(title);
CREATE INDEX mui_icons_embedding_index ON search_mui_icons USING hnsw (embedding vector_cosine_ops);
CREATE TABLE embedding_record (
	string text UNIQUE PRIMARY KEY NOT NULL,
	embedding vector(1536) NOT NULL,
  model TEXT NOT NULL DEFAULT 'text-embedding-ada-002'
);
-- String matching
CREATE EXTENSION pg_trgm;



CREATE TABLE links (
	id smallserial PRIMARY KEY,
	description TEXT NOT NULL,
	embedding vector(1536),
	date_added bigint NOT NULL,
  href TEXT NOT NULL,
  title TEXT NOT NULL,
  desc_search tsvector GENERATED ALWAYS AS (
		to_tsvector('english',description) || ' ' 
  ) STORED NOT NULL
);


DROP TABLE IF EXISTS markdown_notes;
CREATE TABLE markdown_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  markdown TEXT NOT NULL,
  html TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_created bigint NOT NULL,
  last_edited bigint NOT NULL,
  published boolean DEFAULT false,
  table_of_contents jsonb[] NOT NULL,
  design_system TEXT NOT NULL,
  breaks boolean NOT NULL DEFAULT true,
  gfm boolean NOT NULL DEFAULT true,
  pedantic boolean NOT NULL DEFAULT false
);
CREATE INDEX date_created_md_idx ON markdown_notes USING BTREE(last_edited);



CREATE TYPE ai_chat_role_type AS ENUM ( 'system', 'user', 'assistant' );
CREATE TYPE token_type_type AS ENUM ( 'input', 'cached_input', 'batch_input', 'output', 'batch_output' );
CREATE TABLE ai_chat (
 id bigserial PRIMARY KEY, -- bigserial id
 user_id INT NOT NULL, -- user interacting with chatbot
 chat_id uuid NOT NULL DEFAULT gen_random_uuid(), -- the id of the chat,
 chat_name TEXT NOT NULL, -- the name of the chat corresponding to chat_id
 model TEXT NOT NULL, -- name of the model
 role ai_chat_role_type NOT NULL, -- what type of message is this
 content TEXT NOT NULL, -- the content of the message
 tokens INT NOT NULL, -- the amount of tokens of the message
 token_type  token_type_type, -- Token type
 query_cost NUMERIC(10,8) NOT NULL, -- assume max cost of query $100 and min value $0.000000001 (most queries don't cost cent
 initial_system_prompt BOOLEAN NOT NULL DEFAULT false, -- Is this the initial system prompt ?
 min_context_id bigint, -- Min context id of the query
 message_time bigint NOT NULL, 
 FOREIGN KEY user_id REFERENCES users(id) -- Keep Track of users 
);
CREATE INDEX chat_id_idx ON ai_chat USING hash(chat_id);
CREATE INDEX chat_name_idx ON ai_chat USING hash(chat_name);

-- GET chats
WITH (
  SELECT array_agg(SELECT DISTINCT chat_name FROM ai_chat WHERE user_id=$1) chat_history;
) SELECT chat_name 


if (!!!chat_history.length) {
  // MAKE CHAT
}

-- CREATE CHAT WHERE ONE DOES NOT EXIST
INSERT INTO ai_chat (user_id,chat_name,model,)

-- Get Content For Chat:
-- You have the new message for the user and 
WITH system_prompt_info AS (
  SELECT content, role, tokens FROM ai_chat WHERE chat_name=$1 AND user_id=$2 AND initial_system_prompt=true
) 

CREATE TABLE note_likes (
  note_id integer NOT NULL,
  user_id integer NOT NULL,
  note_id FOREIGN KEY REFERENCES note(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE note_views (
  note_id integer NOT NULL,
  user_id integer NOT NULL,
  note_id FOREIGN KEY REFERENCES note(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE blog_likes (
  blog_id integer NOT NULL,
  user_id integer NOT NULL,
  blog_id FOREIGN KEY REFERENCES blog(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE blog_views (
  blog_id integer NOT NULL,
  user_id integer NOT NULL,
  blog_id FOREIGN KEY REFERENCES blog(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE idea_likes (
  idea_id integer NOT NULL,
  user_id integer NOT NULL,
  idea_id FOREIGN KEY REFERENCES idea(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE idea_views (
  idea_id integer NOT NULL,
  user_id integer NOT NULL,
  idea_id FOREIGN KEY REFERENCES idea(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE markdown_notes_likes (
  markdown_note_id uuid NOT NULL,
  user_id integer NOT NULL,
  markdown_note_id FOREIGN KEY REFERENCES markdown_notes(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE markdown_notes_views (
  markdown_note_id uuid NOT NULL,
  user_id integer NOT NULL,
  markdown_note_id FOREIGN KEY REFERENCES markdown_notes(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE jupyter_notebooks_likes (
  jupyter_notebook_id uuid NOT NULL,
  user_id integer NOT NULL,
  jupyter_notebook_id FOREIGN KEY REFERENCES jupyter_notebooks(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE jupyter_notebooks_views (
  jupyter_notebook_id uuid NOT NULL,
  user_id integer NOT NULL,
  jupyter_notebook_id FOREIGN KEY REFERENCES jupyter_notebooks(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE tex_notes_likes (
  tex_note_id integer NOT NULL,
  user_id integer NOT NULL,
  tex_note_id FOREIGN KEY REFERENCES tex_notes(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE tex_notes_views (
  tex_note_id integer NOT NULL,
  user_id integer NOT NULL,
  tex_note_id FOREIGN KEY REFERENCES tex_notes(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE wikipedia_likes (
  wikipedia_id integer NOT NULL,
  user_id integer NOT NULL,
  wikipedia_id FOREIGN KEY REFERENCES wikipedia(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE wikipedia_views (
  wikipedia_id integer NOT NULL,
  user_id integer NOT NULL,
  wikipedia_id FOREIGN KEY REFERENCES wikipedia(id) ON DELETE CASCADE,
  user_id FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE
);



