"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const deviceDetection_1 = require("../utils/deviceDetection");
const env_1 = __importDefault(require("../utils/env"));
/**
 * If the input parameter is a string, then return the string - else return null
 * This should make things easier in the database
 * @param s
 * @returns
 */
const stringOrNull = (s) => {
    if (typeof s === 'string')
        return String(s);
    else
        return null;
};
/**
 * Set device information using the user-agent string
 *
 * See [UAParser.js](https://docs.uaparser.js.org/v2/api/ua-parser-js/get-os.html) for more information
 *
 * @param req
 * @param res
 * @param next
 */
function setDeviceInformation(req, res, next) {
    if (!!!req.session.device) {
        const userAgent = req.get('user-agent');
        const ua = new ua_parser_js_1.default(req.get('user-agent'));
        const browser = ua.getBrowser();
        const cpu = ua.getCPU();
        const device = ua.getDevice();
        const engine = ua.getEngine();
        const os = ua.getOS();
        var phone;
        var touchEnabled;
        // To run in phone only mode, uncomment the line below and then comment out the if statement below it
        if (env_1.default.PHONE_ONLY === "true") {
            phone = true;
            touchEnabled = true;
        }
        else {
            if (!Boolean(typeof userAgent === 'string')) {
                phone = false;
                touchEnabled = false;
            }
            else {
                phone = (0, deviceDetection_1.isMobileDevice)(userAgent);
                touchEnabled = !!!phone ? (0, deviceDetection_1.isMobileOrTablet)(userAgent) : true;
            }
        }
        /**
         * We don't want to make any async requests before sending the initial page back to the user, so
         * we are setting a stringified temp object in cache that we might utilize when setting the initial settings.
         * We will set the temp object to null after setting settings in database to save cache space
         * I'm putting this in the same format as it should be in the database here
         */
        const TEMP_OBJECT = {
            phone,
            tablet: Boolean(!!!phone && !!touchEnabled),
            desktop: Boolean(!!!phone && !!!touchEnabled),
            browser_name: stringOrNull(browser.name),
            browser_version: stringOrNull(browser.version),
            browser_major: stringOrNull(browser.major),
            cpu_architecture: stringOrNull(cpu.architecture),
            device_type: stringOrNull(device.type),
            device_vendor: stringOrNull(device.vendor),
            device_model: stringOrNull(device.model),
            engine_name: stringOrNull(engine.name),
            engine_version: stringOrNull(engine.version),
            os_name: stringOrNull(os.name),
            os_version: stringOrNull(os.version)
        };
        req.session.device = {
            phone,
            tablet: Boolean(!!!phone && !!touchEnabled),
            desktop: Boolean(!!!phone && !!!touchEnabled),
            browser: browser.name,
            temp: JSON.stringify(TEMP_OBJECT)
        };
    }
    next();
}
exports.default = setDeviceInformation;
