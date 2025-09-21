"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeAgoString = exports.TIME_ZONES_AVAILABLE = exports.WEEK = exports.DAY = exports.HOUR = exports.MINUTE = exports.getMonthYearFromUnix = exports.getUnixFromDateString = exports.getStartOfDaySeconds = exports.getUnixTime = exports.formatDateFromUnixTime = exports.getUnixFromDatetimeString = exports.getFullDateStringFromUnix = exports.getDateTimeStringFromUnix = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
/**
 *
 * @param s unix time in seconds
 * @param includeTime w
 * @param includeSeconds whether or not to include seconds in return string
 * @returns
 */
function getDateTimeStringFromUnix(s, includeSeconds = true) {
    const d = dayjs_1.default.utc(s * 1000);
    try {
        if (includeSeconds) {
            const str = d.format('YYYY-MM-DD HH:mm:ss');
            return str.replace(' ', 'T');
        }
        else {
            const str = d.format('YYYY-MM-DD HH:mm');
            return str.replace(' ', 'T');
        }
    }
    catch (error) {
        console.error(error);
        return '';
    }
}
exports.getDateTimeStringFromUnix = getDateTimeStringFromUnix;
/**
 * Get the full date string in UTC time from the time in unix seconds
 * @param s
 */
function getFullDateStringFromUnix(s) {
    const d = dayjs_1.default.utc(s * 1000);
    const str = d.format('YYYY-MM-DD HH:mm:ss').replace(' ', 'T');
    return str;
}
exports.getFullDateStringFromUnix = getFullDateStringFromUnix;
/**
 * Provide dateime string, e.g. 2023-12-24T10:30:00 and return unix time of that datetime string
 * @param s
 * @param timezone
 * @returns
 */
function getUnixFromDatetimeString(s, timezone) {
    const dt = (0, dayjs_1.default)(s).tz(timezone);
    const unixTimestamp = dt.unix();
    return unixTimestamp;
}
exports.getUnixFromDatetimeString = getUnixFromDatetimeString;
function formatDateFromUnixTime(format, timezone, unixTime) {
    const dt = dayjs_1.default.utc(unixTime * 1000).tz(timezone);
    return dt.format(format);
}
exports.formatDateFromUnixTime = formatDateFromUnixTime;
const getUnixTime = () => dayjs_1.default.utc().unix();
exports.getUnixTime = getUnixTime;
/**
 * Get the unix time (in seconds) at the start of the day
 * I am doing it this way so that we keep the same time between timezones
 * @returns
 */
function getStartOfDaySeconds(timezone) {
    const dt = (0, dayjs_1.default)().tz(timezone);
    const day = dt.date();
    const dayStr = day >= 10 ? day.toString() : `0${day}`;
    const month = dt.month() + 1;
    const monthStr = month >= 10 ? month.toString() : `0${month}`;
    const year = dt.year();
    const unix = dayjs_1.default.tz(`${year}-${monthStr}-${dayStr}`, timezone).unix();
    return unix;
}
exports.getStartOfDaySeconds = getStartOfDaySeconds;
/**
 * Retuns the number of seconds since the Unix epoch given a YYYY-MM-DD date string
 * @param s
 */
function getUnixFromDateString(s) {
    return (0, dayjs_1.default)(s).unix();
}
exports.getUnixFromDateString = getUnixFromDateString;
/**
 * Returns the date formatted as month, year
 * @param s unix time string (since the date is strored as bigint in database)
 * @param timezone timezone of user
 * @returns
 */
function getMonthYearFromUnix(s, timezone) {
    const dt = dayjs_1.default.utc(Number(s) * 1000).tz(timezone);
    return dt.format('MMMM, YYYY');
}
exports.getMonthYearFromUnix = getMonthYearFromUnix;
exports.MINUTE = 60;
exports.HOUR = 3600;
exports.DAY = exports.HOUR * 24;
exports.WEEK = exports.DAY * 7;
exports.TIME_ZONES_AVAILABLE = ["Pacific/Niue", "Pacific/Pago_Pago", "Pacific/Honolulu", "Pacific/Rarotonga", "Pacific/Tahiti", "America/Anchorage", "America/Juneau", "America/Nome", "America/Sitka", "America/Yakutat", "America/Los_Angeles", "America/Tijuana", "America/Vancouver", "America/Los_Angeles", "America/Tijuana", "America/Vancouver", "America/Creston", "America/Dawson", "America/Dawson_Creek", "America/Hermosillo", "America/Phoenix", "America/Whitehorse", "America/Chihuahua", "America/Mazatlan", "America/Boise", "America/Cambridge_Bay", "America/Denver", "America/Edmonton", "America/Inuvik", "America/Ojinaga", "America/Yellowknife", "America/Belize", "America/Costa_Rica", "America/El_Salvador", "America/Guatemala", "America/Managua", "America/Tegucigalpa", "Pacific/Galapagos", "America/Chicago", "America/Indiana/Knox", "America/Indiana/Tell_City", "America/Matamoros", "America/Menominee", "America/North_Dakota/Beulah", "America/North_Dakota/Center", "America/North_Dakota/New_Salem", "America/Rainy_River", "America/Rankin_Inlet", "America/Resolute", "America/Winnipeg", "America/Bahia_Banderas", "America/Cancun", "America/Merida", "America/Mexico_City", "America/Monterrey", "America/Regina", "America/Swift_Current", "America/Bogota", "America/Eirunepe", "America/Guayaquil", "America/Jamaica", "America/Lima", "America/Panama", "America/Rio_Branco", "America/Detroit", "America/Havana", "America/Indiana/Petersburg", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Iqaluit", "America/Kentucky/Monticello", "America/Nassau", "America/New_York", "America/Nipigon", "America/Pangnirtung", "America/Port-au-Prince", "America/Thunder_Bay", "America/Toronto", "America/Detroit", "America/Havana", "America/Indiana/Petersburg", "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Iqaluit", "America/Kentucky/Monticello", "America/Nassau", "America/New_York", "America/Nipigon", "America/Pangnirtung", "America/Port-au-Prince", "America/Thunder_Bay", "America/Toronto", "America/Indiana/Marengo", "America/Indiana/Vevay", "America/Asuncion", "America/Campo_Grande", "America/Cuiaba", "America/Barbados", "America/Blanc-Sablon", "America/Boa_Vista", "America/Curacao", "America/Grand_Turk", "America/Guyana", "America/La_Paz", "America/Manaus", "America/Martinique", "America/Port_of_Spain", "America/Porto_Velho", "America/Puerto_Rico", "America/Santo_Domingo", "America/Santiago", "Antarctica/Palmer", "Australia/Brisbane", "Australia/Lindeman", "Australia/Melbourne", "Australia/Sydney", "Antarctica/DumontDUrville", "Pacific/Guam", "Pacific/Port_Moresby", "Australia/Currie", "Australia/Hobart"];
function getTimeAgoString(before) {
    const now = (0, exports.getUnixTime)();
    const diff = now - before;
    const YEAR = 31556952;
    const MONTH = 2629746;
    if (diff > YEAR) {
        return (Math.floor(diff / YEAR)).toString() + "y ago";
    }
    else if (diff > MONTH) {
        return (Math.floor(diff / MONTH)).toString() + "m ago";
    }
    else if (diff > exports.WEEK) {
        return (Math.floor(diff / exports.WEEK)).toString() + "w ago";
    }
    else if (diff > exports.DAY) {
        return (Math.floor(diff / exports.DAY)).toString().concat('d ago');
    }
    else if (diff > exports.HOUR) {
        return (Math.floor(diff / exports.HOUR)).toString().concat('hr ago');
    }
    else if (diff > exports.MINUTE) {
        return (Math.floor(diff / exports.MINUTE)).toString().concat('min ago');
    }
    else {
        return diff.toString().concat('s ago');
    }
}
exports.getTimeAgoString = getTimeAgoString;
