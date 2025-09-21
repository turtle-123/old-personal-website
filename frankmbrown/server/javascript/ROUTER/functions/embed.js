"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.embedNews = void 0;
const env_1 = __importDefault(require("../../utils/env"));
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const aws_implementation_1 = require("../../aws/aws-implementation");
const image_1 = require("../../utils/image");
const FACEBOOK_APP_SECRET = env_1.default.FACEBOOK_APP_SECRET;
if (!!!FACEBOOK_APP_SECRET)
    throw new Error('Unable to get Facebook app secret from env.');
async function embedNews(req, { url }) {
    try {
        const resp = await axios_1.default.get(url, { timeout: 10000 });
        if (resp.status !== 200)
            throw new Error('Unable to get information from news article.');
        const $ = (0, cheerio_1.load)(resp.data);
        const type = $('meta[property="og:type"]').prop('content');
        const title = $('meta[property="og:title"]').prop('content');
        const origImageUrl = $('meta[property="og:image"]').prop('content');
        const description = $('meta[property="og:description"]').prop('content');
        if (type !== 'article')
            throw new Error('<meta property="og:type" /> must have a content attribute equal to article.');
        const image = await (0, image_1.getImageFromUrl)(origImageUrl);
        const { user_id, ip_id } = (0, aws_implementation_1.getUserIdAndIpIdForImageUpload)(req);
        const imageURL = await (0, aws_implementation_1.uploadImageObject)(`frankmbrown/${encodeURIComponent(title)}`, image, 'jpeg', {}, user_id, ip_id);
        const host = new URL(url).host;
        const ret = {
            url,
            title,
            description,
            imageURL,
            host
        };
        return ret;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get embedding for news content.');
    }
}
exports.embedNews = embedNews;
