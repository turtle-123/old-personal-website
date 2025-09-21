
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone);



/**
 * 
 * @param s unix time in seconds
 * @param includeTime w
 * @param includeSeconds whether or not to include seconds in return string
 * @returns 
 */
export function getDateTimeStringFromUnix(s:number,includeSeconds:boolean=true) {
  const d = dayjs.utc(s*1000);
  try {
    if (includeSeconds) {
      const str = d.format('YYYY-MM-DD HH:mm:ss');
      return str.replace(' ','T');
    } else {
      const str = d.format('YYYY-MM-DD HH:mm');
      return str.replace(' ','T');
    }
  } catch (error) {
    console.error(error);
    return '';
  }
}
/**
 * Get the full date string in UTC time from the time in unix seconds 
 * @param s 
 */
export function getFullDateStringFromUnix(s:number) {
  const d = dayjs.utc(s*1000);
  const str = d.format('YYYY-MM-DD HH:mm:ss').replace(' ','T');
  return str;
}
/**
 * Provide dateime string, e.g. 2023-12-24T10:30:00 and return unix time of that datetime string
 * @param s 
 * @param timezone 
 * @returns 
 */
export function getUnixFromDatetimeString(s:string,timezone:ALLOWED_TIME_ZONE) {
  const dt = dayjs(s).tz(timezone);
  const unixTimestamp = dt.unix();
  return unixTimestamp;
}
export function formatDateFromUnixTime(format:string,timezone:ALLOWED_TIME_ZONE,unixTime:number) {
  const dt = dayjs.utc(unixTime*1000).tz(timezone);
  return dt.format(format);
}

export const getUnixTime = () => dayjs.utc().unix();
/**
 * Get the unix time (in seconds) at the start of the day 
 * I am doing it this way so that we keep the same time between timezones
 * @returns 
 */
export function getStartOfDaySeconds(timezone:ALLOWED_TIME_ZONE) {
  const dt = dayjs().tz(timezone);
  const day = dt.date();
  const dayStr = day>=10 ? day.toString():`0${day}`;
  const month = dt.month()+1;
  const monthStr = month>=10 ? month.toString():`0${month}`;
  const year = dt.year();
  const unix = dayjs.tz(`${year}-${monthStr}-${dayStr}`,timezone).unix();
  return unix;
}

/**
 * Retuns the number of seconds since the Unix epoch given a YYYY-MM-DD date string
 * @param s 
 */
export function getUnixFromDateString(s:string) {
  return dayjs(s).unix();
}

/**
 * Returns the date formatted as month, year
 * @param s unix time string (since the date is strored as bigint in database)
 * @param timezone timezone of user
 * @returns 
 */
export function getMonthYearFromUnix(s:string,timezone:ALLOWED_TIME_ZONE) {
  const dt = dayjs.utc(Number(s)*1000).tz(timezone);
  return dt.format('MMMM, YYYY');
}


export const MINUTE = 60;
export const HOUR = 3600;
export const DAY = HOUR*24;
export const WEEK = DAY*7;

export type ALLOWED_TIME_ZONE = "Pacific/Niue"|"Pacific/Pago_Pago"|"Pacific/Honolulu"|"Pacific/Rarotonga"|"Pacific/Tahiti"|"America/Anchorage"|"America/Juneau"|"America/Nome"|"America/Sitka"|"America/Yakutat"|"America/Los_Angeles"|"America/Tijuana"|"America/Vancouver"|"America/Los_Angeles"|"America/Tijuana"|"America/Vancouver"|"America/Creston"|"America/Dawson"|"America/Dawson_Creek"|"America/Hermosillo"|"America/Phoenix"|"America/Whitehorse"|"America/Chihuahua"|"America/Mazatlan"|"America/Boise"|"America/Cambridge_Bay"|"America/Denver"|"America/Edmonton"|"America/Inuvik"|"America/Ojinaga"|"America/Yellowknife"|"America/Belize"|"America/Costa_Rica"|"America/El_Salvador"|"America/Guatemala"|"America/Managua"|"America/Tegucigalpa"|"Pacific/Galapagos"|"America/Chicago"|"America/Indiana/Knox"|"America/Indiana/Tell_City"|"America/Matamoros"|"America/Menominee"|"America/North_Dakota/Beulah"|"America/North_Dakota/Center"|"America/North_Dakota/New_Salem"|"America/Rainy_River"|"America/Rankin_Inlet"|"America/Resolute"|"America/Winnipeg"|"America/Bahia_Banderas"|"America/Cancun"|"America/Merida"|"America/Mexico_City"|"America/Monterrey"|"America/Regina"|"America/Swift_Current"|"America/Bogota"|"America/Eirunepe"|"America/Guayaquil"|"America/Jamaica"|"America/Lima"|"America/Panama"|"America/Rio_Branco"|"America/Detroit"|"America/Havana"|"America/Indiana/Petersburg"|"America/Indiana/Vincennes"|"America/Indiana/Winamac"|"America/Iqaluit"|"America/Kentucky/Monticello"|"America/Nassau"|"America/New_York"|"America/Nipigon"|"America/Pangnirtung"|"America/Port-au-Prince"|"America/Thunder_Bay"|"America/Toronto"|"America/Detroit"|"America/Havana"|"America/Indiana/Petersburg"|"America/Indiana/Vincennes"|"America/Indiana/Winamac"|"America/Iqaluit"|"America/Kentucky/Monticello"|"America/Nassau"|"America/New_York"|"America/Nipigon"|"America/Pangnirtung"|"America/Port-au-Prince"|"America/Thunder_Bay"|"America/Toronto"|"America/Indiana/Marengo"|"America/Indiana/Vevay"|"America/Asuncion"|"America/Campo_Grande"|"America/Cuiaba"|"America/Barbados"|"America/Blanc-Sablon"|"America/Boa_Vista"|"America/Curacao"|"America/Grand_Turk"|"America/Guyana"|"America/La_Paz"|"America/Manaus"|"America/Martinique"|"America/Port_of_Spain"|"America/Porto_Velho"|"America/Puerto_Rico"|"America/Santo_Domingo"|"America/Santiago"|"Antarctica/Palmer"|"Australia/Brisbane"|"Australia/Lindeman"|"Australia/Melbourne"|"Australia/Sydney"|"Antarctica/DumontDUrville"|"Pacific/Guam"|"Pacific/Port_Moresby"|"Australia/Currie"|"Australia/Hobart";
export const TIME_ZONES_AVAILABLE:ALLOWED_TIME_ZONE[] = ["Pacific/Niue", "Pacific/Pago_Pago", "Pacific/Honolulu", "Pacific/Rarotonga", "Pacific/Tahiti", "America/Anchorage", "America/Juneau", "America/Nome", "America/Sitka", "America/Yakutat", "America/Los_Angeles", "America/Tijuana", "America/Vancouver", "America/Los_Angeles", "America/Tijuana", "America/Vancouver", "America/Creston", "America/Dawson", "America/Dawson_Creek", "America/Hermosillo", "America/Phoenix", "America/Whitehorse", "America/Chihuahua", "America/Mazatlan", "America/Boise", "America/Cambridge_Bay", "America/Denver", "America/Edmonton", "America/Inuvik", "America/Ojinaga", "America/Yellowknife", "America/Belize", "America/Costa_Rica", "America/El_Salvador", "America/Guatemala", "America/Managua", "America/Tegucigalpa", "Pacific/Galapagos", "America/Chicago", "America/Indiana/Knox", "America/Indiana/Tell_City", "America/Matamoros", "America/Menominee", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Rainy_River", "America/Rankin_Inlet", "America/Resolute", "America/Winnipeg", "America/Bahia_Banderas", "America/Cancun", "America/Merida", "America/Mexico_City", "America/Monterrey", "America/Regina", "America/Swift_Current", "America/Bogota", "America/Eirunepe", "America/Guayaquil", "America/Jamaica", "America/Lima", "America/Panama", "America/Rio_Branco", "America/Detroit", "America/Havana", "America/Indiana/Petersburg", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Iqaluit", "America/Kentucky/Monticello", "America/Nassau", "America/New_York", "America/Nipigon", "America/Pangnirtung", "America/Port-au-Prince", "America/Thunder_Bay", "America/Toronto", "America/Detroit", "America/Havana", "America/Indiana/Petersburg", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Iqaluit", "America/Kentucky/Monticello", "America/Nassau", "America/New_York", "America/Nipigon", "America/Pangnirtung", "America/Port-au-Prince", "America/Thunder_Bay", "America/Toronto", "America/Indiana/Marengo", "America/Indiana/Vevay", "America/Asuncion", "America/Campo_Grande", "America/Cuiaba", "America/Barbados", "America/Blanc-Sablon", "America/Boa_Vista", "America/Curacao", "America/Grand_Turk", "America/Guyana", "America/La_Paz", "America/Manaus", "America/Martinique", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Santo_Domingo", "America/Santiago", "Antarctica/Palmer", "Australia/Brisbane", "Australia/Lindeman", "Australia/Melbourne", "Australia/Sydney", "Antarctica/DumontDUrville", "Pacific/Guam", "Pacific/Port_Moresby", "Australia/Currie", "Australia/Hobart"]; 

export function getTimeAgoString(before:number) {
  const now = getUnixTime();
  const diff = now-before;
  const YEAR = 31556952;
  const MONTH =2629746;
  if (diff>YEAR) {
    return (Math.floor(diff/YEAR)).toString() + "y ago";
  } else if (diff > MONTH) {
    return (Math.floor(diff/MONTH)).toString() + "m ago";
  } else if (diff > WEEK) {
    return (Math.floor(diff/WEEK)).toString() + "w ago";
  } else if (diff > DAY) {
    return (Math.floor(diff/DAY)).toString().concat('d ago')
  } else if (diff > HOUR) {
    return (Math.floor(diff/HOUR)).toString().concat('hr ago')
  } else if (diff > MINUTE) {
    return (Math.floor(diff/MINUTE)).toString().concat('min ago')
  } else {
    return diff.toString().concat('s ago')
  }
}