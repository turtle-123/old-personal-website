const SECONDS_MINUTE = 60;
const SECONDS_HOUR = 3600;
const SECONDS_DAY = 86400;
const SECONDS_WEEK = 604800;
const SECONDS_MONTH = 2629746;
const SECONDS_YEAR = 31536000;
/**
 * Function that takes the number of seconds between two events occuring and translates this number
 * to a valid duration string that can be used for the dateime attribute for an HTML time element
 * 
 * @param {number} diff The duration to be formatted in seconds. The difference in seconds between two events occurring.
 * @returns {string} A properly formatted, valid duration string that can be used for the datetime attribute for a HTML time element
 * @example
 * const timeAgo = getDateTimeDuration(1694652601.776-1698939486.616);
 * console.log(timeAgo); // P1M2W5DT4H18M59S
 */
function getDateTimeDuration(diff) {
    var timeLeft = Math.abs(Math.floor(diff));
    var ret = 'P';
    const YEARS = Math.floor(timeLeft/SECONDS_YEAR);
    if (YEARS>0){
        ret+=String(YEARS).concat('Y');
        timeLeft-=YEARS*SECONDS_YEAR;
    }
    const MONTHS = Math.floor(timeLeft/SECONDS_MONTH);
    if (MONTHS > 0){
        ret+=String(MONTHS).concat('M');
        timeLeft-=MONTHS*SECONDS_MONTH;
    }
    const WEEKS = Math.floor(timeLeft/SECONDS_WEEK);
    if (WEEKS>0){
        ret+=String(WEEKS).concat('W');
        timeLeft-=WEEKS*SECONDS_WEEK;
    }
    const DAYS = Math.floor(timeLeft/SECONDS_DAY);
    if (DAYS>0){
        ret+=String(DAYS).concat('D');
        timeLeft-=DAYS*SECONDS_DAY;
    }
    if (ret!=='P') ret=ret.concat('T'); // Delineate between dates and times
    const HOURS = Math.floor(timeLeft/SECONDS_HOUR);
    if (HOURS>0){
        ret+=String(HOURS).concat('H');
        timeLeft-=HOURS*SECONDS_HOUR;
    }
    const MINUTES = Math.floor(timeLeft/SECONDS_MINUTE);
    if (MINUTES>0){
        ret+=String(MINUTES).concat('M');
        timeLeft-=MINUTES*SECONDS_MINUTE;
    }
    if (timeLeft!==0) {
        ret+=String(timeLeft).concat('S');
    }
    return ret;
}
/**
 * Function that takes a number, the number of milliseconds since the UNIX epoch that some event occurred, 
 * and returns a string that can be used for the datetime attribute for a HTML time element
 * 
 * @param {number} ms The number of milliseconds since the UNIX epoch  
 * @returns {string} A simplified string date format based on ISO8601 that can be used for the datetime attribute for a HTML time element
*/
const getISOString = (ms) => (new Date(ms)).toISOString();

module.exports = {
    getDateTimeDuration,
    getISOString
};

