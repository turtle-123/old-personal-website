"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCookieBanner = exports.validLatLng = exports.getPolygonInputs = exports.getCircleInputs = exports.handlePolygonExample = exports.handleCircleExample = void 0;
const highlight_js_1 = __importDefault(require("highlight.js"));
/**
 * Function to test whether latitude and longitude are valid
 * @param lat latitude
 * @param lng longitude
 */
const validLatLng = (lat, lng) => {
    return Boolean(lat < 90 && lat > -90 && lng > -180 && lng < 180);
};
exports.validLatLng = validLatLng;
/**
 *
 * @param body req.body after bodyParser middleware
 * @returns {[key: string]: CircleInput} where the **key** is the **name** of the input
 */
const getCircleInputs = (body) => {
    const ret = {};
    try {
        Object.keys(body).forEach((key) => {
            var _a, _b;
            if (key.startsWith('circle_')) {
                try {
                    const temp = JSON.parse(body[key]);
                    if (typeof temp.r !== 'number')
                        return;
                    if (typeof ((_a = temp === null || temp === void 0 ? void 0 : temp.c) === null || _a === void 0 ? void 0 : _a.lat) !== 'number')
                        return;
                    if (typeof ((_b = temp === null || temp === void 0 ? void 0 : temp.c) === null || _b === void 0 ? void 0 : _b.lng) !== 'number')
                        return;
                    if (temp.r > 40000 * 1000)
                        return;
                    if (!!!validLatLng(temp.c.lat, temp.c.lng))
                        return;
                    ret[key] = { r: temp.r, c: { lat: temp.c.lat, lng: temp.c.lng } };
                }
                catch (error) {
                    return;
                }
            }
        });
        return ret;
    }
    catch (error) {
        return {};
    }
};
exports.getCircleInputs = getCircleInputs;
/**
 *
 * @param body req.body after bodyParser middleware
 * @returns {[key: string]: string}
 */
const getPolygonInputs = (body) => {
    const ret = {};
    try {
        Object.keys(body).forEach((key) => {
            if (key.startsWith('polygon_')) {
                try {
                    const curr = [];
                    const temp = JSON.parse(body[key]);
                    if (!!!Array.isArray(temp))
                        return;
                    for (let [lng, lat] of temp) {
                        if (!!!validLatLng(lat, lng))
                            return;
                        else
                            curr.push([lng, lat]);
                    }
                    ret[key] = {
                        type: "Feature",
                        geometry: {
                            type: "Polygon",
                            coordinates: [curr]
                        },
                        properties: {}
                    };
                }
                catch (error) {
                    return;
                }
            }
        });
        return ret;
    }
    catch (error) {
        return {};
    }
};
exports.getPolygonInputs = getPolygonInputs;
/**
 * Should be used on the **design-system/google-maps** page
 * This API route is used to show the user an example of what the form output looks like for circle
 * inputs
 */
function handleCircleExample(req, res) {
    const view = 'partials/circleInputExampleResponse';
    const renderObj = {
        layout: false,
        circleInputs: [],
        error: false
    };
    try {
        const circleInputs = getCircleInputs(req.body);
        Object.keys(circleInputs)
            .forEach((key) => {
            const name = String(key);
            const inputString = JSON.stringify(circleInputs[key]);
            const obj = circleInputs[key];
            var centerStr = '';
            if (obj.c.lat < 0)
                centerStr += `${Math.abs(obj.c.lat)}°S`;
            else
                centerStr += `${Math.abs(obj.c.lat)}°N`;
            if (obj.c.lng < 0)
                centerStr += `, ${Math.abs(obj.c.lng)}°W`;
            else
                centerStr += `, ${Math.abs(obj.c.lng)}°E`;
            renderObj.circleInputs.push({ name, formString: inputString, centerStr, ...obj });
        });
        return res.status(200).render(view, renderObj);
    }
    catch (error) {
        renderObj.error = true;
        return res.status(200).render(view, renderObj);
    }
}
exports.handleCircleExample = handleCircleExample;
/**
 * Should be used on the **design-system/google-maps** page
 * This API route is used to show the user an example of what the form output looks like for polygon
 * inputs
 */
function handlePolygonExample(req, res) {
    const view = 'partials/polygonInputExampleResponse';
    const renderObj = {
        layout: false,
        inputNames: [],
        inputStrings: [],
        polygonInputs: [],
        jsonStrings: [],
        error: false
    };
    try {
        const polygonInputs = getPolygonInputs(req.body);
        Object.keys(polygonInputs).forEach((name) => {
            renderObj.inputNames.push(name);
            renderObj.inputStrings.push(JSON.stringify(req.body[name]));
            renderObj.polygonInputs.push(polygonInputs[name]);
            const highlight = highlight_js_1.default.highlight(JSON.stringify(polygonInputs[name], null, ' '), { language: 'json' });
            renderObj.jsonStrings.push(highlight.value);
        });
        return res.status(200).render(view, renderObj);
    }
    catch (error) {
        console.error(error);
        renderObj.error = true;
        return res.status(200).render(view, renderObj);
    }
}
exports.handlePolygonExample = handlePolygonExample;
function validateGeojson() {
}
function createGeojson() {
}
/**
 * This route should be called about every 250 milliseconds. We want to display the cookie banner
 * only after we know whether we have information on the user from their ip address. If we know whether or not we have
 * information on the user - i.e. whether req.session.create_ip_address_row equals true or false,
 * then we can respond withe cookie banner and swap the outer HTML. Else, we should respond with the same element
 * that will call this route again in 250 ms.
 */
function handleCookieBanner(req, res) {
    var _a, _b, _c;
    const cookieBannerView = 'partials/cookieBanner';
    const showCookieBanner = Boolean(((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.create_ip_address_row) !== undefined);
    const renderObject = {
        layout: false,
        showCookieBanner,
        showedBanner: Boolean(((_c = (_b = req === null || req === void 0 ? void 0 : req.session) === null || _b === void 0 ? void 0 : _b.cookiePreferences) === null || _c === void 0 ? void 0 : _c.showedBanner) === true)
    };
    return res.status(200).render(cookieBannerView, renderObject);
}
exports.handleCookieBanner = handleCookieBanner;
