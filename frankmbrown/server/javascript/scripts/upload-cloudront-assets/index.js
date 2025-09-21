"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* ----------------------- Imports ----------------------- */
const env_1 = __importDefault(require("../../utils/env"));
const client_cloudfront_1 = require("@aws-sdk/client-cloudfront");
const client_s3_1 = require("@aws-sdk/client-s3");
const client_cloudfront_2 = require("@aws-sdk/client-cloudfront");
const node_path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("fs"));
const CSS_FILE_HASH_1 = __importDefault(require("../../CONSTANTS/CSS_FILE_HASH"));
/* ----------------------- Constants ----------------------- */
const AWS_ACCESS_KEY = env_1.default.AWS_ACCESS_KEY;
if (!!!AWS_ACCESS_KEY)
    throw new Error("Unable to get AWS_ACCESS_KEY from env.");
const AWS_SECRET_ACCESS_KEY = env_1.default.AWS_SECRET_ACCESS_KEY;
if (!!!AWS_SECRET_ACCESS_KEY)
    throw new Error("Unable to get AWS_SECRET_ACCESS_KEY from env.");
const AWS_CDN_BUCKET = env_1.default.AWS_CDN_BUCKET;
if (!!!AWS_CDN_BUCKET)
    throw new Error("Unable to get AWS_CDN_BUCKET from env.");
const AWS_CLOUDFRONT_LOAD_BALANCER_ID = env_1.default.AWS_CLOUDFRONT_LOAD_BALANCER_ID;
if (!!!AWS_CLOUDFRONT_LOAD_BALANCER_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_LOAD_BALANCER_ID from env.");
const AWS_CLOUDFRONT_CDN_ID = env_1.default.AWS_CLOUDFRONT_CDN_ID;
if (!!!AWS_CLOUDFRONT_CDN_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_CDN_ID from env.");
const AWS_CLOUDFRONT_IMAGE_ID = env_1.default.AWS_CLOUDFRONT_IMAGE_ID;
if (!!!AWS_CLOUDFRONT_IMAGE_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_IMAGE_ID from env.");
const AWS_CLOUDFRONT_GEOGRAPHY_ID = env_1.default.AWS_CLOUDFRONT_GEOGRAPHY_ID;
if (!!!AWS_CLOUDFRONT_GEOGRAPHY_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_GEOGRAPHY_ID from env.");
const AWS_CLOUDFRONT_AUDIO_ID = env_1.default.AWS_CLOUDFRONT_AUDIO_ID;
if (!!!AWS_CLOUDFRONT_AUDIO_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_AUDIO_ID from env.");
const AWS_CLOUDFRONT_VIDEO_ID = env_1.default.AWS_CLOUDFRONT_VIDEO_ID;
if (!!!AWS_CLOUDFRONT_VIDEO_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_VIDEO_ID from env.");
const AWS_CLOUDFRONT_TEXT_ID = env_1.default.AWS_CLOUDFRONT_TEXT_ID;
if (!!!AWS_CLOUDFRONT_TEXT_ID)
    throw new Error("Unable to get AWS_CLOUDFRONT_TEXT_ID from env.");
const mobile_css_key = `frankmbrown/css/mobile-bundle-${CSS_FILE_HASH_1.default}.min.css`;
const desktop_css_key = `frankmbrown/css/desktop-bundle-${CSS_FILE_HASH_1.default}.min.css`;
const desktop_bundle_path_client = node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'static', 'css', `desktop-bundle-${CSS_FILE_HASH_1.default}.min.css`);
const mobile_bundle_path_client = node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'static', 'css', `mobile-bundle-${CSS_FILE_HASH_1.default}.min.css`);
const path_to_js = node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'static', 'js');
const desktopCSS = fs_1.default.readFileSync(desktop_bundle_path_client, { encoding: 'utf-8' });
const mobileCSS = fs_1.default.readFileSync(mobile_bundle_path_client, { encoding: 'utf-8' });
const getUploadJsCommand = (key, file) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: AWS_CDN_BUCKET,
        Body: file,
        Key: key,
        ContentType: 'text/javascript'
    });
    return command;
};
const cloudfrontClient = new client_cloudfront_1.CloudFrontClient({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
});
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: 'us-east-1'
});
const uploadMobileCss = new client_s3_1.PutObjectCommand({
    Bucket: AWS_CDN_BUCKET,
    Body: mobileCSS,
    Key: mobile_css_key,
    ContentType: 'text/css'
});
const uploadDesktopCss = new client_s3_1.PutObjectCommand({
    Bucket: AWS_CDN_BUCKET,
    Body: desktopCSS,
    Key: desktop_css_key,
    ContentType: 'text/css'
});
const invalidateServiceWorker = new client_cloudfront_2.CreateInvalidationCommand({
    DistributionId: AWS_CLOUDFRONT_CDN_ID, // required
    InvalidationBatch: {
        Paths: {
            Quantity: 1, // required
            Items: [
                '/'.concat("frankmbrown/js/service-worker.js"), // CloudFront Invalidation paths must begin with slash
            ],
        },
        CallerReference: String((new Date()).getTime()), // required
    },
});
/* ----------------------- Helper Functions ----------------------- */
/**
 * Return all JavaScript Files and what their keys should vbe in S3
 */
async function getKeysAndJSFiles() {
    const array = [];
    const topDir = await fs_1.default.promises.readdir(path_to_js);
    for (let i = 0; i < topDir.length; i++) {
        const file_path = node_path_1.default.resolve(path_to_js, topDir[i]);
        const stat = await fs_1.default.promises.stat(file_path);
        var key = 'frankmbrown/js/';
        // there should be only one directory
        if (stat.isDirectory()) {
            key += topDir[i] + "/";
            const path_to_directory = node_path_1.default.resolve(path_to_js, topDir[i]);
            const secondDir = await fs_1.default.promises.readdir(path_to_directory);
            for (let j = 0; j < secondDir.length; j++) {
                const file_path_new = node_path_1.default.resolve(path_to_js, topDir[i], secondDir[j]);
                key += secondDir[j];
                const file = fs_1.default.readFileSync(file_path_new, { encoding: 'utf-8' });
                array.push({ key, file });
            }
        }
        else {
            key += topDir[i];
            const file = fs_1.default.readFileSync(file_path, { encoding: 'utf-8' });
            array.push({ key, file });
        }
    }
    return array;
}
/* ----------------------- Functions ----------------------- */
Promise.all([s3Client.send(uploadDesktopCss), s3Client.send(uploadMobileCss)])
    .then((res) => {
    return getKeysAndJSFiles();
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .then((arr) => {
    return Promise.all(arr.map((obj) => getUploadJsCommand(obj.key, obj.file)).map((command) => s3Client.send(command)));
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .then(() => {
    process.exit(0);
});
