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
exports.indexPages = void 0;
const googleapis_1 = require("googleapis");
const node_fs_1 = __importDefault(require("node:fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const BASE_URL_1 = __importDefault(require("../../CONSTANTS/BASE_URL"));
const fast_xml_parser_1 = require("fast-xml-parser");
const TIME = __importStar(require("../../utils/time"));
const PATH_TO_KEYFILE = path_1.default.resolve(__dirname, '..', '..', '..', '..', '..', 'certificates', 'personal-website-403817-40e4d06a19fe.json');
const certificateFile = node_fs_1.default.readFileSync(PATH_TO_KEYFILE, { encoding: 'utf-8' });
const key = JSON.parse(certificateFile);
async function getCurrentSitemap() {
    var _a;
    try {
        const sitemapPage = await axios_1.default.get('https://frankmbrown.net/sitemap.xml', { timeout: 4000 });
        const sitemap = sitemapPage.data;
        const parser = new fast_xml_parser_1.XMLParser();
        const jObj = parser.parse(sitemap);
        if (!!!Array.isArray((_a = jObj === null || jObj === void 0 ? void 0 : jObj.urlset) === null || _a === void 0 ? void 0 : _a.url))
            throw new Error("Inavlid xml data.");
        // lastmod is in the form of YYY-MM-DD
        const objs = jObj.urlset.url.filter((obj) => /https:\/\/frankmbrown\.net.*/.test(obj.loc) && /\d\d\d\d-\d\d-\d\d/.test(obj.lastmod)).map((obj) => ({ path: obj.loc.replace('https://frankmbrown.net', ''), lastmod: TIME.getUnixFromDateString(obj.lastmod) }));
        return objs;
    }
    catch (error) {
        console.error(error);
        throw new Error("Unable to get current sitemap.");
    }
}
const endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const jwtClient = new googleapis_1.google.auth.JWT(key.client_email, PATH_TO_KEYFILE, key.private_key, ["https://www.googleapis.com/auth/indexing"], undefined, key.private_key_id);
async function indexPages() {
    return new Promise((resolve, reject) => {
        try {
            jwtClient.authorize(async function (err, tokens) {
                if (err || !!!tokens) {
                    console.error(err);
                    return;
                }
                const sitemap = await getCurrentSitemap();
                const promiseArray = [];
                for (let obj of sitemap) {
                    var pathToUse = obj.path;
                    if (obj.path.endsWith('/')) {
                        pathToUse = obj.path.slice(0, obj.path.length - 1);
                    }
                    const body = {
                        "url": `${BASE_URL_1.default}${pathToUse}`,
                        "type": "URL_UPDATED"
                    };
                    const headers = {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokens.access_token}`
                    };
                    promiseArray.push(axios_1.default.post(endpoint, JSON.stringify(body), { headers }));
                }
                Promise.all(promiseArray)
                    .then(async (res) => {
                    await node_fs_1.default.promises.writeFile(path_1.default.resolve(__dirname, './output.json'), JSON.stringify(res.map((obj) => obj.data), null, ' '));
                    resolve(true);
                })
                    .catch(async (error) => {
                    console.error(error);
                    await node_fs_1.default.promises.writeFile(path_1.default.resolve(__dirname, './output.json'), JSON.stringify(error));
                    resolve(true);
                });
            });
        }
        catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
exports.indexPages = indexPages;
