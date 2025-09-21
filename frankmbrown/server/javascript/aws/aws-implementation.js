'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageObject = exports.completeMultipartUploadVideo = exports.completeMultipartUploadAudio = exports.getPostAudioSignedUrls = exports.getPostVideoSignedUrls = exports.getPostImageSignedUrl = exports.getImageObjectReturnNull = exports.testForeignImage = exports.listAllImageObjects = exports.deleteImageObject = exports.getImageObject = exports.putGameAssetS3 = exports.putJavaScriptGamesDesigns = exports.getVttObject = exports.getTexNoteFromUrl = exports.uploadFileGeneral = exports.getDownloadFileUrl = exports.handleGetFileFromS3 = exports.listVideoTranscriptionJobs = exports.startTranscribeVideoJob = exports.startTranscribeAudioJob = exports.deleteAudioObject = exports.uploadAudioObject = exports.getAudioObject = exports.deleteVideoObject = exports.uploadVideoOject = exports.getVideoObject = exports.multiPartUpload = exports.listAudioObjects = exports.listAllAudioObjects = exports.listVideoObjects = exports.listAllVideoObjects = exports.listImageObjects = exports.postJSONTemp = exports.getImageObjectMetadata = exports.getUserIdAndIpIdForImageUpload = exports.safeSearchImage = exports.transcribeClient = exports.s3Client = void 0;
const env_1 = __importDefault(require("../utils/env"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const vision_1 = __importDefault(require("@google-cloud/vision"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const buffer_image_size_1 = __importDefault(require("buffer-image-size"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const client_transcribe_1 = require("@aws-sdk/client-transcribe");
const AWS_ACCESS_KEY = env_1.default.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = env_1.default.AWS_SECRET_ACCESS_KEY;
const AWS_INGRESS_IMAGE = env_1.default.AWS_INGRESS_IMAGE;
const AWS_INGRESS_AUDIO = env_1.default.AWS_INGRESS_AUDIO;
const AWS_INGRESS_VIDEO = env_1.default.AWS_INGRESS_VIDEO;
const AWS_INGRESS_TEXT = env_1.default.AWS_INGRESS_TEXT;
const AWS_CDN_BUCKET = env_1.default.AWS_CDN_BUCKET;
if (!!!AWS_ACCESS_KEY)
    throw Error('Unable to get AWS_ACCESS_KEY from env.');
if (!!!AWS_SECRET_ACCESS_KEY)
    throw Error('Unable to get AWS_SECRET_ACCESS_KEY from env.');
if (!!!AWS_INGRESS_IMAGE)
    throw new Error('Unable to get AWS_INGRESS_IMAGE from env.');
if (!!!AWS_INGRESS_AUDIO)
    throw new Error('Unable to get AWS_INGRESS_AUDIO from env.');
if (!!!AWS_INGRESS_VIDEO)
    throw new Error('Unable to get AWS_INGRESS_VIDEO from env.');
if (!!!AWS_INGRESS_TEXT)
    throw new Error("Unable to get AWS_INGRESS_TEXT from env.");
if (!!!AWS_CDN_BUCKET)
    throw new Error("Unable to get AWS_CDN_BUCKET from env.");
const CHUNK_SIZE = 6000000; // 6 MB - https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html- minimum size for uploading parts is 6MB
/* Amazon S3 Clients */
exports.s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: 'us-east-1'
});
/* Transcribe Client for starting Transcription Jobs */
exports.transcribeClient = new client_transcribe_1.TranscribeClient({
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: 'us-east-1'
});
/**
 * Image Safe Search
 * https://cloud.google.com/vision/docs/detecting-safe-search
 * Video Safe Search
 * https://cloud.google.com/video-intelligence/docs/analyze-safesearch
 * Ended up using Amazon Rekognition
 * https://docs.aws.amazon.com/rekognition/latest/dg/video.html#video-api-overview
 */
/* ----------------------------------------------- Images --------------------------- */
/* Google Safe Search Client */
const SAFE_SEARCH_IMAGE = new vision_1.default.ImageAnnotatorClient({
    keyFilename: path_1.default.resolve(__dirname, '..', '..', '..', 'certificates', '..', 'personal-website-403817-f95ee5280bf9.json')
});
const SAFE_SEARCH_ANNOTATION_LEVELS = {
    'VERY_UNLIKELY': 0,
    'UNLIKELY': 1,
    "POSSIBLE": 2,
    "LIKELY": 3,
    "VERY_LIKELY": 4,
    "UNKNOWN": undefined
};
/**
 * Given the url of an s3 image, determine if the video is safe to use
 * I implement this in a Lambda function now, but I am keeping here for reference
 * @param imageURL
 * @returns {boolean} Whether or not the image is safe to use, true = is safe, false = should delete
 */
async function safeSearchImage(imageURL) {
    try {
        const [result] = await SAFE_SEARCH_IMAGE.safeSearchDetection(imageURL);
        const { safeSearchAnnotation } = result;
        if (!!!safeSearchAnnotation)
            return false;
        const keys = Object.keys(safeSearchAnnotation);
        if (keys.length !== 5)
            return false;
        for (let i = 0; i < keys.length; i++) {
            const value = safeSearchAnnotation[keys[i]];
            const annotationLevel = SAFE_SEARCH_ANNOTATION_LEVELS[value];
            if (!!!value || isNaN(annotationLevel) || Number(annotationLevel) >= 3) {
                return false;
            }
        }
        return true;
    }
    catch (error) {
        console.error(error);
    }
}
exports.safeSearchImage = safeSearchImage;
/**
 * Function gets image object from s3 and returns it
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
 * Access the image data on the `Body` attribute of the response
 * @param key Image Object Key
 * @returns GetObjectCommandOutput or Throws Error
*/
async function getImageObject(key, bucket = AWS_INGRESS_IMAGE) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const response = await exports.s3Client.send(command);
        return response;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to get '.concat(key).concat(' image object from s3 Bucket.'));
    }
}
exports.getImageObject = getImageObject;
/**
 * Function gets image object from s3 and returns it, if object does not exist, return null
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
 * @param key Image Object Key
 * @returns GetObjectCommandOutput or returns null if image object with key does not exist
*/
async function getImageObjectReturnNull(key, bucket) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const response = await exports.s3Client.send(command);
        return response;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
exports.getImageObjectReturnNull = getImageObjectReturnNull;
function getUserIdAndIpIdForImageUpload(req) {
    var _a;
    const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
    const ip_id = req.session.ip_id;
    if (!!!ip_id)
        throw new Error("ip_id must be defined to upload an image.");
    return { user_id, ip_id };
}
exports.getUserIdAndIpIdForImageUpload = getUserIdAndIpIdForImageUpload;
/**
 * Post image to the s3 image bucket. Returns the image url of the posted image
 * @param name name of the image
 * @param image Buffer of image
 */
async function uploadImageObject(key, image, extension, metadata, user_id, ip_id) {
    if (!!!metadata.user_id) {
        metadata.user_id = String(user_id);
    }
    if (!!!metadata.ip_id) {
        metadata.ip_id = String(ip_id);
    }
    const command = new client_s3_1.PutObjectCommand({
        Bucket: AWS_INGRESS_IMAGE,
        Body: image,
        Key: key,
        ContentType: 'image/'.concat(extension),
        Metadata: metadata
    });
    try {
        await exports.s3Client.send(command);
        return 'https://image.storething.org/'.concat(encodeURIComponent(key));
    }
    catch (error) {
        throw new Error('Unable to post image object to s3 bucket.');
    }
}
exports.uploadImageObject = uploadImageObject;
async function getImageObjectMetadata(key) {
    try {
        const command = new client_s3_1.HeadObjectCommand({
            Bucket: AWS_INGRESS_IMAGE,
            Key: key
        });
        const resp = await exports.s3Client.send(command);
        const metadata = resp.Metadata;
        if (metadata) {
            return metadata;
        }
        else {
            throw new Error("Unable to get Image metadata.");
        }
    }
    catch (e) {
        console.error(e);
        throw new Error("Unable to get Image metadata.");
    }
}
exports.getImageObjectMetadata = getImageObjectMetadata;
/**
 * Function to fix the fact that I accidentally deleted some stuff from
 *
 * @param key
 * @param image
 * @returns
 */
async function postJSONTemp(key, image) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: AWS_INGRESS_IMAGE,
        Body: image,
        Key: key,
        ContentType: 'json',
    });
    try {
        await exports.s3Client.send(command);
        return 'https://image.storething.org/'.concat(encodeURIComponent(key));
    }
    catch (error) {
        throw new Error('Unable to post image object to s3 bucket.');
    }
}
exports.postJSONTemp = postJSONTemp;
/**
 * Delete Image object from s3 or throw Error if something goes wrong
 * @param key Image Object Key
 * @returns DeleteObjectCommandOutput or throw Error
 */
async function deleteImageObject(key, bucket) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const response = await exports.s3Client.send(command);
        return response;
    }
    catch (error) {
        throw Error('Unable to delete '.concat(key).concat(' image object from s3 Bucket.'));
    }
}
exports.deleteImageObject = deleteImageObject;
/**
 * Get (Fetch) image and test to see if it returns a 200 response code
 * and if it does, then return the image string
 * @param {string} url The url of the image
 * @returns {Promise<{width: number, height: number, type: string, buffer: Buffer}>} This is an object, { width: number, height: number, type: [image type (e.g., png)], buffer: binary image buffer
 */
async function testForeignImage(url) {
    try {
        const resp = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 4000 });
        if (resp.status !== 200)
            throw Error('Image response did not have a status code of 200.');
        const img = Buffer.from(resp.data, 'binary');
        const imgData = (0, buffer_image_size_1.default)(img);
        return { ...imgData, buffer: img };
    }
    catch (error) {
        return null;
    }
}
exports.testForeignImage = testForeignImage;
/**
 * List all keys in s3 image bucket
 * It is probably better to use the terminal commands in Amazon than to call this function
 * https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
 */
async function listAllImageObjects() {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket: AWS_INGRESS_IMAGE
    });
    const images = [];
    try {
        let isTruncated = true;
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
            if (Contents) {
                Contents.forEach((c) => images.push(`${c.Key}`));
                isTruncated = Boolean(IsTruncated);
                command.input.ContinuationToken = NextContinuationToken;
            }
        }
        return images;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to list all the image objects in the s3 bucket.');
    }
}
exports.listAllImageObjects = listAllImageObjects;
/**
 * List image objects
 * @param nextToken
 */
async function listImageObjects(nextToken, prefix) {
    const images = [];
    try {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: AWS_INGRESS_IMAGE,
            Prefix: prefix
        });
        if (nextToken) {
            command.input.ContinuationToken = nextToken;
        }
        const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
        if (Contents) {
            Contents.forEach((c) => images.push({ url: `https://image.storething.org/${c.Key}`, key: String(c.Key) }));
            return { images, IsTruncated, NextContinuationToken };
        }
        else {
            throw new Error('Unable to list image objects.');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to list image objects.');
    }
}
exports.listImageObjects = listImageObjects;
/* ----------------------------------------------- Video and Audio --------------------------- */
function isVttFile(key) {
    return Boolean(key.endsWith('.temp') || key.endsWith('.json') || key.endsWith('.vtt'));
}
/**
 * List Video Objects in Video s3 Bucket
 * @returns
 */
async function listAllVideoObjects() {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket: AWS_INGRESS_VIDEO
    });
    const videos = [];
    try {
        let isTruncated = true;
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
            if (Contents) {
                Contents.filter((c) => !!!isVttFile(String(c.Key)))
                    .forEach((c) => videos.push(`${c.Key}`));
                isTruncated = Boolean(IsTruncated);
                command.input.ContinuationToken = NextContinuationToken;
            }
        }
        return videos;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to list all the video objects in the input video s3 bucket.');
    }
}
exports.listAllVideoObjects = listAllVideoObjects;
/**
 * List video objects
 * @param nextToken The continuation token to use for the list objects request
 */
async function listVideoObjects(nextToken) {
    const videos = [];
    try {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: AWS_INGRESS_VIDEO
        });
        if (nextToken) {
            command.input.ContinuationToken = nextToken;
        }
        const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
        if (Contents) {
            Contents.filter((c) => !!!isVttFile(String(c.Key)))
                .forEach((c) => videos.push({ url: `https://video.storething.org/${c.Key}`, key: String(c.Key) }));
            return { videos, IsTruncated, NextContinuationToken };
        }
        else {
            throw new Error('Unable to list video objects.');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to list video objects.');
    }
}
exports.listVideoObjects = listVideoObjects;
/**
 * List Audio Objects in Audio s3 Bucket
 * @returns
 */
async function listAllAudioObjects() {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket: AWS_INGRESS_AUDIO
    });
    const audios = [];
    try {
        let isTruncated = true;
        while (isTruncated) {
            const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
            if (Contents) {
                Contents.filter((c) => !!!isVttFile(String(c.Key)))
                    .forEach((c) => audios.push(`${c.Key}`));
                isTruncated = Boolean(IsTruncated);
                command.input.ContinuationToken = NextContinuationToken;
            }
        }
        return audios;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to list all the audio objects in the input audio s3 bucket.');
    }
}
exports.listAllAudioObjects = listAllAudioObjects;
/**
 * List audio objects
 * @param nextToken The continuation token to use for the list objects request
 */
async function listAudioObjects(nextToken) {
    const audios = [];
    try {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: AWS_INGRESS_AUDIO
        });
        if (nextToken) {
            command.input.ContinuationToken = nextToken;
        }
        const { Contents, IsTruncated, NextContinuationToken } = await exports.s3Client.send(command);
        if (Contents) {
            Contents.filter((c) => !!!isVttFile(String(c.Key)))
                .forEach((c) => audios.push({ url: `https://audio.storething.org/${c.Key}`, key: String(c.Key) }));
            return { audios, IsTruncated, NextContinuationToken };
        }
        else {
            throw new Error('Unable to list audio objects.');
        }
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to list audio objects.');
    }
}
exports.listAudioObjects = listAudioObjects;
/**
 * Create, upload, and complete a multiPartUpload for an audio or video object
 * @param file
 * @param fileType
 * @param Key
 * @param Bucket
 * @param client
 */
async function multiPartUpload(file, fileType, Key, Bucket, client, metadata = {}, type) {
    try {
        // @ts-ignore
        const size = Math.ceil(Buffer.byteLength(file) / CHUNK_SIZE);
        const params = {
            Bucket,
            Key,
            ContentType: `${type}/`.concat(fileType),
            Metadata: metadata
        };
        const createMultipartCommand = new client_s3_1.CreateMultipartUploadCommand(params);
        const { UploadId } = await client.send(createMultipartCommand);
        var promiseArray = [];
        for (let i = 0; i < size; i++) {
            const uploadPartCommand = new client_s3_1.UploadPartCommand({
                Bucket,
                Key,
                UploadId,
                PartNumber: i + 1,
                Body: file.slice((i * CHUNK_SIZE), (i + 1) * CHUNK_SIZE)
            });
            promiseArray.push(client.send(uploadPartCommand));
        }
        const uploadPartsResp = await Promise.all(promiseArray);
        const Parts = uploadPartsResp.map((uploadPartResp, i) => ({ ETag: String(uploadPartResp.ETag), PartNumber: i + 1 }));
        const completeMultipartUploadCommand = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket,
            UploadId,
            Key,
            MultipartUpload: {
                Parts
            }
        });
        await client.send(completeMultipartUploadCommand);
    }
    catch (error) {
        console.error(error);
        throw new Error('There was an error completing the multipart upload command request.');
    }
}
exports.multiPartUpload = multiPartUpload;
/**
 * Get video object from s3 bucket
 * @param key
 * @returns
 */
async function getVideoObject(key) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: AWS_INGRESS_VIDEO,
        Key: key
    });
    try {
        const response = await exports.s3Client.send(command);
        return response;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to get '.concat(key).concat(' video object from s3 Bucket.'));
    }
}
exports.getVideoObject = getVideoObject;
/**
 * Upload video object to s3 bucket using `multipartUpload`
 * @param pathToVideo
 * @param Key
 */
async function uploadVideoOject(pathToVideo, Key, metadata = {}, extension) {
    try {
        const video = await node_fs_1.default.promises.readFile(pathToVideo);
        await multiPartUpload(video, extension, Key, String(AWS_INGRESS_VIDEO), exports.s3Client, metadata, 'video');
    }
    catch (error) {
        console.error(error);
        throw new Error('Something went wrong uploading the video file to the s3 Bucket.');
    }
}
exports.uploadVideoOject = uploadVideoOject;
/**
 * Function for deleting video object from s3 database given the s3 key
 * @param key
 */
async function deleteVideoObject(key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: AWS_INGRESS_VIDEO,
        Key: key
    });
    try {
        const res = await exports.s3Client.send(command);
        return res;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to delete video object from database.');
    }
}
exports.deleteVideoObject = deleteVideoObject;
/**
 * Get audio object from s3 audio bucket
 * @param key
 * @returns
 */
async function getAudioObject(key) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: AWS_INGRESS_AUDIO,
        Key: key
    });
    try {
        const response = await exports.s3Client.send(command);
        return response;
    }
    catch (error) {
        console.error(error);
        throw Error('Unable to get '.concat(key).concat(' audio object from s3 Bucket.'));
    }
}
exports.getAudioObject = getAudioObject;
/**
 * Upload audio object to s3 bucket using `multipartUpload`
 * @param pathToAudio
 * @param Key
 */
async function uploadAudioObject(pathToAudio, Key, metadata = {}, extension) {
    try {
        const audio = await node_fs_1.default.promises.readFile(pathToAudio);
        await multiPartUpload(audio, extension, Key, String(AWS_INGRESS_AUDIO), exports.s3Client, metadata, 'audio');
    }
    catch (error) {
        console.error(error);
        throw new Error('There was an error uploading the audio file to the s3 bucket.');
    }
}
exports.uploadAudioObject = uploadAudioObject;
/**
 * Function for deleting video object from s3 database given the s3 key
 * @param key
 */
async function deleteAudioObject(key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: AWS_INGRESS_AUDIO,
        Key: key
    });
    try {
        const res = await exports.s3Client.send(command);
        return res;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to delete audio object from database.');
    }
}
exports.deleteAudioObject = deleteAudioObject;
async function startTranscribeAudioJob(key, extension, name) {
    try {
        const MediaFileUri = `https://${AWS_INGRESS_AUDIO}.s3-us-east-1.amazonaws.com/${key}`;
        const params = {
            TranscriptionJobName: name,
            LanguageCode: "en-US", // For example, 'en-US'
            MediaFormat: extension, // For example, 'wav'
            Media: {
                MediaFileUri
            },
            OutputBucketName: AWS_INGRESS_AUDIO,
            OutputKey: `frankmbrown/${name}/`,
            Subtitles: {
                Formats: ['vtt'],
                OutputStartIndex: 1
            }
        };
        const data = await exports.transcribeClient.send(new client_transcribe_1.StartTranscriptionJobCommand(params));
        return data;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to start transcribe audio job');
    }
}
exports.startTranscribeAudioJob = startTranscribeAudioJob;
async function startTranscribeVideoJob(key, extension, name) {
    try {
        const MediaFileUri = `https://${AWS_INGRESS_VIDEO}.s3-us-east-1.amazonaws.com/${key}`;
        const params = {
            TranscriptionJobName: name,
            LanguageCode: "en-US", // For example, 'en-US'
            MediaFormat: extension, // For example, 'wav'
            Media: {
                MediaFileUri
            },
            OutputBucketName: AWS_INGRESS_VIDEO,
            OutputKey: `frankmbrown/${name}/`,
            Subtitles: {
                Formats: ['vtt'],
                OutputStartIndex: 1
            }
        };
        const data = await exports.transcribeClient.send(new client_transcribe_1.StartTranscriptionJobCommand(params));
        return data;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to start transcribe video job');
    }
}
exports.startTranscribeVideoJob = startTranscribeVideoJob;
async function listVideoTranscriptionJobs() {
    try {
        var nextToken = null;
        var transcriptionJobNames = [];
        const listVideoTranscriptionJobsCommand = new client_transcribe_1.ListTranscriptionJobsCommand({});
        const firstResult = await exports.transcribeClient.send(listVideoTranscriptionJobsCommand);
        const { NextToken } = firstResult;
    }
    catch (error) {
        console.error(error);
        throw new Error('Something went wrong listing the video transcription jobs.');
    }
}
exports.listVideoTranscriptionJobs = listVideoTranscriptionJobs;
/* ------------------------------------ Server and API Helpers ------------------------- */
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html
const createPresignedUrlWithClient = ({ region, bucket, key }, metadata = {}) => {
    const command = new client_s3_1.PutObjectCommand({ Bucket: bucket, Key: key, Metadata: metadata });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: 1800 });
};
/**
 * Get the type of a file
 * @param str
 * @returns
 */
const getType = (str) => {
    const lastIndexOfPeriod = str.lastIndexOf('.');
    return str.slice(lastIndexOfPeriod + 1);
};
/**
 * CREATING KEYS: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html
 * @param name the name of the image from the client ?
 * [Reference](https://www.npmjs.com/package/@aws-sdk/cloudfront-signer)
 */
async function getPostImageSignedUrl(name, metadata) {
    const key = 'frankmbrown/' + node_crypto_1.default.randomUUID().concat('.').concat(getType(name));
    try {
        const url = await createPresignedUrlWithClient({
            region: 'us-east-1',
            bucket: AWS_INGRESS_IMAGE,
            key
        }, metadata);
        return url;
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to get presigned url for posting object to s3.');
    }
}
exports.getPostImageSignedUrl = getPostImageSignedUrl;
const VALID_AUDIO_FILE_EXTENSIONS = new Set([
    'm4a',
    'flac',
    'mp3',
    'mp4',
    'wav',
    'wma',
    'aac',
    'webm',
    'mpeg',
    'mov',
    'ogg'
]);
const VALID_VIDEO_FILE_EXTENSIONS = new Set([
    'mp4',
    'mov',
    'avi',
    'wmv',
    'avchd',
    'webm',
    'flv'
]);
/**
 * Get the signed urls for creating the multipart upload command and uploading the parts on the client
 * returns the signedurls, the UploadId, and the key of the audio / video file A new name is generated for the
 * audio / video file using the crypto module
 * https://aws.amazon.com/blogs/compute/uploading-large-objects-to-amazon-s3-using-multipart-upload-and-transfer-acceleration/
 * @param name
 * @param length
 */
async function getPostAudioSignedUrls(name, length, metadata = {}) {
    try {
        const type = getType(name);
        const Key = 'frankmbrown/' + node_crypto_1.default.randomUUID().concat(`.${type}`);
        if (!!!VALID_AUDIO_FILE_EXTENSIONS.has(type))
            throw new Error('Audio Type not allowed.');
        const params = {
            Bucket: AWS_INGRESS_AUDIO,
            Key,
            ContentType: 'audio/'.concat(type),
            Metadata: metadata
        };
        const command = new client_s3_1.CreateMultipartUploadCommand(params);
        const { UploadId } = await exports.s3Client.send(command);
        const promiseArray = [];
        for (let i = 0; i < length; i++) {
            const command = new client_s3_1.UploadPartCommand({
                Bucket: AWS_INGRESS_AUDIO,
                Key,
                UploadId,
                PartNumber: i + 1,
            });
            promiseArray.push((0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: 1800 }));
        }
        const signedUrls = await Promise.all(promiseArray);
        return {
            signedUrls,
            UploadId,
            Key
        };
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to create audio signed urls.');
    }
}
exports.getPostAudioSignedUrls = getPostAudioSignedUrls;
/**
 * Get the signed urls for creating the multipart upload command and uploading the parts on the client
 * returns the signedurls, the UploadId, and the key of the audio / video file. A new name is generated for the
 * audio / video file using the crypto module
 * @param name
 * @param length
 * @returns
 */
async function getPostVideoSignedUrls(name, length, metadata = {}) {
    try {
        const type = getType(name);
        const Key = 'frankmbrown/' + node_crypto_1.default.randomUUID().concat(`.${type}`);
        if (!!!VALID_VIDEO_FILE_EXTENSIONS.has(type))
            throw new Error('Video Type not allowed.');
        const params = {
            Bucket: AWS_INGRESS_VIDEO,
            Key,
            ContentType: 'video/'.concat(type),
            Metadata: metadata
        };
        const command = new client_s3_1.CreateMultipartUploadCommand(params);
        const { UploadId } = await exports.s3Client.send(command);
        const promiseArray = [];
        for (let i = 0; i < length; i++) {
            const command = new client_s3_1.UploadPartCommand({
                Bucket: AWS_INGRESS_VIDEO,
                Key,
                UploadId,
                PartNumber: i + 1,
            });
            promiseArray.push((0, s3_request_presigner_1.getSignedUrl)(exports.s3Client, command, { expiresIn: 1800 }));
        }
        const signedUrls = await Promise.all(promiseArray);
        return {
            signedUrls,
            UploadId,
            Key
        };
    }
    catch (error) {
        console.error(error);
        throw new Error('Unable to create video signed urls.');
    }
}
exports.getPostVideoSignedUrls = getPostVideoSignedUrls;
/**
 * Complete the multipart upload command for uploading audio file
 * @param Parts
 * @param UploadId
 * @param Key
 * @returns
 */
async function completeMultipartUploadAudio(Parts, UploadId, Key) {
    try {
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: AWS_INGRESS_AUDIO,
            UploadId,
            Key,
            MultipartUpload: {
                Parts
            }
        });
        const resp = await exports.s3Client.send(command);
        return resp;
    }
    catch (error) {
        console.error(error);
        throw new Error('Something went wrong completing the multipart audio upload.');
    }
}
exports.completeMultipartUploadAudio = completeMultipartUploadAudio;
/**
 * Complete the multipart upload command uploading video file
 * @param Parts
 * @param UploadId
 * @param Key
 * @returns
 */
async function completeMultipartUploadVideo(Parts, UploadId, Key) {
    try {
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: AWS_INGRESS_VIDEO,
            UploadId,
            Key,
            MultipartUpload: {
                Parts
            }
        });
        const resp = await exports.s3Client.send(command);
        return resp;
    }
    catch (error) {
        console.error(error);
        throw new Error('Something went wrong completing the multipart audio upload.');
    }
}
exports.completeMultipartUploadVideo = completeMultipartUploadVideo;
const path_to_temp_download_files = path_1.default.resolve(__dirname, 'temp_files');
if (!!!node_fs_1.default.existsSync(path_to_temp_download_files)) {
    node_fs_1.default.mkdirSync(path_to_temp_download_files);
}
async function handleGetFileFromS3(req, res) {
    try {
        const keyPrefix = req.path.includes('frankmbrown') ? 'frankmbrown/' : 'civgauge/';
        const VALID_TYPES = new Set(['text', 'image', 'audio', 'video']);
        const { key, type } = req.params;
        if (typeof key !== 'string' || !!!VALID_TYPES.has(type)) {
            throw new Error("Key not recognized or type not valid.");
        }
        var bucket = '';
        switch (type) {
            case 'image':
                bucket = AWS_INGRESS_IMAGE;
                break;
            case 'audio':
                bucket = AWS_INGRESS_AUDIO;
                break;
            case 'video':
                bucket = AWS_INGRESS_VIDEO;
                break;
            case 'text':
                bucket = AWS_INGRESS_TEXT;
                break;
            default: {
                throw new Error("Something went wrong getting the object from s3.");
            }
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: keyPrefix + key
        });
        const extension = key.slice(key.lastIndexOf('.'), key.length);
        const resp = await exports.s3Client.send(command);
        if (resp.Body) {
            const buffer = await resp.Body.transformToByteArray();
            const path_to_temp_file = path_1.default.resolve(path_to_temp_download_files, node_crypto_1.default.randomUUID() + extension);
            await node_fs_1.default.promises.writeFile(path_to_temp_file, buffer);
            res.download(path_to_temp_file, async () => {
                await node_fs_1.default.promises.unlink(path_to_temp_file);
                return;
            });
        }
        else {
            throw new Error("Unable to download file.");
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).send("Something went wrong getting the file.");
    }
}
exports.handleGetFileFromS3 = handleGetFileFromS3;
/**
 * Returns URL without beinning https://frankmbrown.net
 * @param type
 * @param key
 * @returns
 */
function getDownloadFileUrl(type, key) {
    return `/api/get-file/${type}/${key}`;
}
exports.getDownloadFileUrl = getDownloadFileUrl;
async function uploadFileGeneral(key, buffer, bucketType, contentType) {
    const TWENTY_FIVE_MB = 25 * 1024 * 1024;
    const TEN_MB = 10 * 1024 * 1024;
    var bucket = '';
    var url = '';
    switch (bucketType) {
        case 'image': {
            bucket = String(AWS_INGRESS_IMAGE);
            url = `https://image.storething.org/` + key;
            break;
        }
        case 'audio': {
            bucket = String(AWS_INGRESS_AUDIO);
            url = `https://audio.storething.org/` + key;
            break;
        }
        case 'video': {
            bucket = String(AWS_INGRESS_VIDEO);
            url = `https://video.storething.org/` + key;
            break;
        }
        case 'text': {
            bucket = String(AWS_INGRESS_TEXT);
            url = `https://text.storething.org/` + key;
            break;
        }
        default: {
            throw new Error("Invalie bucket type");
        }
    }
    const sizeOfBuffer = buffer.length;
    if (sizeOfBuffer > TWENTY_FIVE_MB) {
        const params = {
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            Metadata: {}
        };
        const createMultipartUpload = new client_s3_1.CreateMultipartUploadCommand(params);
        const { UploadId } = await exports.s3Client.send(createMultipartUpload);
        const promiseArray = [];
        let offset = 0;
        let i = 0;
        while (offset < buffer.length) {
            const end = Math.min(offset + TEN_MB, buffer.length);
            const command = new client_s3_1.UploadPartCommand({
                Body: buffer.subarray(offset, end),
                Bucket: bucket,
                Key: key,
                UploadId,
                PartNumber: i + 1,
            });
            promiseArray.push(exports.s3Client.send(command));
            offset = end;
            i += 1;
        }
        const uploadPartsResponse = await Promise.all(promiseArray);
        const parts = uploadPartsResponse.map((obj, i) => ({
            ETag: obj.ETag,
            PartNumber: i + 1
        }));
        const command = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: bucket,
            UploadId,
            Key: key,
            MultipartUpload: {
                Parts: parts
            }
        });
        await exports.s3Client.send(command);
        return key;
    }
    else {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Body: buffer,
            Key: key,
            ContentType: contentType,
            Metadata: {}
        });
        await exports.s3Client.send(command);
        return key;
    }
}
exports.uploadFileGeneral = uploadFileGeneral;
async function getTexNoteFromUrl(url) {
    const Key = url.replace('https://text.storething.org/', '');
    const command = new client_s3_1.GetObjectCommand({
        Bucket: AWS_INGRESS_TEXT,
        Key
    });
    const resp = await exports.s3Client.send(command);
    if (resp.Body) {
        const buffer = await resp.Body.transformToByteArray();
        return buffer;
    }
    else {
        throw new Error("Unable to download file.");
    }
}
exports.getTexNoteFromUrl = getTexNoteFromUrl;
async function getVttObject(Key, typ) {
    const Bucket = typ === "audio" ? AWS_INGRESS_AUDIO : AWS_INGRESS_VIDEO;
    try {
        const resp = await exports.s3Client.send(new client_s3_1.GetObjectCommand({
            Key,
            Bucket
        }));
        return resp;
    }
    catch (e) {
        console.error(e);
        throw new Error("Something went wrong getting VTT object.");
    }
}
exports.getVttObject = getVttObject;
async function putJavaScriptGamesDesigns(file) {
    const Body = file.buffer;
    const key = 'frankmbrown/assets-designs-games/'.concat(node_crypto_1.default.randomUUID()).concat('.js');
    const command = new client_s3_1.PutObjectCommand({
        Bucket: AWS_CDN_BUCKET,
        Body,
        Key: key,
        ContentType: file.mimetype
    });
    await exports.s3Client.send(command);
    return `https://cdn.storething.org/`.concat(key);
}
exports.putJavaScriptGamesDesigns = putJavaScriptGamesDesigns;
async function putGameAssetS3(file) {
    const Body = file.buffer;
    const extension = file.originalname.slice(file.originalname.lastIndexOf('.') + 1 || file.originalname.length - 1);
    const key = 'frankmbrown/assets-designs-games/'.concat(node_crypto_1.default.randomUUID()).concat(`.${extension || 'any'}`);
    const command = new client_s3_1.PutObjectCommand({
        Bucket: AWS_CDN_BUCKET,
        Body,
        Key: key,
        ContentType: file.mimetype
    });
    await exports.s3Client.send(command);
    return `https://cdn.storething.org/`.concat(key);
}
exports.putGameAssetS3 = putGameAssetS3;
