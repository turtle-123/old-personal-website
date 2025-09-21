"use strict";
/**
 * ```sql
CREATE TABLE images (
    id serial PRIMARY KEY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL CHECK (image_url LIKE 'https://image.storething.org/frankmbrown/%'),
  ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
  UNIQUE (image_url)
);
CREATE TABLE image_nsfw (
    image_id integer NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    normal smallint NOT NULL, -- Multiply decimal by 100 and round
    nsfw smallint NOT NULL -- Multiply decimal by 100 and round
);
CREATE TABLE image_embeddings (
    image_id integer NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    embedding vector (768) NOT NULL
);
CREATE TABLE image_captions (
    image_id integer NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    user_caption TEXT,
  ai_caption TEXT,
  CHECK (user_caption IS NOT NULL OR ai_caption IS NOT NULL)
);
CREATE TABLE image_data (
    id serial PRIMARY KEY,
    image_id integer NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  format TEXT,
    mimetype TEXT,
    width smallint,
    height smallint,
    color_space TEXT,
    image_type TEXT,
    image_depth TEXT,
    channels smallint,
    alpha TEXT,
    gamma real,
    matte_color TEXT,
    background_color TEXT,
    border_color TEXT,
    transparent_color TEXT,
    compression TEXT,
    oritentation TEXT,
    date_created integer,
    date_modified integer,
    tainted boolean,
    image_size int,
    number_pixels integer,
    ellapsed_milliseconds integer,
  color TEXT NOT NULL, -- background color
  frame smallint NOT NULL DEFAULT 0
);

CREATE INDEX ON images USING HASH (image_url);
CREATE INDEX ON images USING BTREE (user_id);
CREATE INDEX ON images USING BTREE (ip_id);
CREATE INDEX ON image_nsfw USING BTREE(image_id);
CREATE INDEX ON image_embeddings USING BTREE(image_id);
CREATE INDEX ON image_captions USING BTREE(image_id);
CREATE INDEX ON image_data USING BTREE (image_id);
CREATE INDEX ON image_embeddings USING hnsw (embedding vector_cosine_ops);


CREATE TABLE audio (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL CHECK (audio_url LIKE 'https://audio.storething.org/frankmbrown/%'),
  other_audio_urls TEXT[],
  UNIQUE (audio_url)
);
CREATE TABLE audio_data (
  id serial PRIMARY KEY,
  audio_id integer NOT NULL REFERENCES audio(id) ON DELETE CASCADE,
  audio_format TEXT,
  audio_format_long TEXT,
  size real,
  duration real,
  start_time real,
  bit_rate real,
  num_streams real,
  probe_score real,
  tags string
);
CREATE TABLE audio_streams (
  id serial PRIMARY KEY,
  audio_id integer NOT NULL REFERENCES audio(id) ON DELETE CASCADE,
  codec_name TEXT,
  codec_name_long TEXT,
  codec_type TEXT,
  codec_time_base TEXT,
  sample_rate real,
  channels real,
  start_time real,
  duration real,
  bit_rate real
);
CREATE TABLE audio_transcription (
  id serial PRIMARY KEY,
  audio_id integer NOT NULL REFERENCES audio(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  transcription_vtt TEXT NOT NULL
);
CREATE TABLE audio_transcription_moderation (
  id serial PRIMARY KEY,
    audio_id integer NOT NULL REFERENCES audio(id) ON DELETE CASCADE,
    flagged boolean,
    category_harassment boolean,
  category_score_harassment smallint,
  category_harassment_threatening boolean,
  category_score_harassment_threatening smallint,
  category_sexual boolean,
  category_score_sexual smallint,
  category_hate boolean,
  category_score_hate smallint,
  category_hate_threatening boolean,
  category_score_hate_threatening smallint,
  category_illicit boolean,
  category_score_illicit smallint,
  category_illicit_violent boolean,
  category_score_illicit_violent smallint,
  category_self_harm_intent boolean,
  category_score_self_harm_intent smallint,
  category_self_harm_instructions boolean,
  category_score_self_harm_instructions smallint,
  category_self_harm boolean,
  category_score_self_harm smallint,
  category_sexual_minors boolean,
  category_score_sexual_minors smallint,
  category_violence boolean,
  category_score_violence smallint,
  category_violence_graphic boolean,
  category_score_violence_graphic smallint
);
CREATE TABLE audio_transcription_embeddings (
  audio_id integer NOT NULL REFERENCES audio(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL
);

CREATE INDEX ON audio USING HASH (audio_url);
CREATE INDEX ON audio USING BTREE (user_id);
CREATE INDEX ON audio USING BTREE (ip_id);
CREATE INDEX ON audio_data USING BTREE (audio_id);
CREATE INDEX ON audio_streams USING BTREE (audio_id);
CREATE INDEX ON audio_transcription USING BTREE (audio_id);
CREATE INDEX ON audio_transcription_moderation USING BTREE (audio_id);
CREATE INDEX ON audio_transcription_embeddings USING BTREE(audio_id);
CREATE INDEX ON audio_transcription_embeddings USING hnsw (embedding vector_cosine_ops);


CREATE TABLE video (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL CHECK (image_url LIKE 'https://video.storething.org/frankmbrown/%'),
  other_video_urls TEXT[],
  UNIQUE (video_url)
);
CREATE TABLE video_data (
  id serial PRIMARY KEY,
  video_id integer NOT NULL REFERENCES video(id),
  video_format TEXT,
  video_format_long TEXT,
  size real,
  duration real,
  start_time real,
  bit_rate real,
  num_streams real,
  probe_score real,
  tags TEXT,
  width real,
  height real,
  audio_codec TEXT,
  video_codec TEXT
);
CREATE TABLE video_streams (
  id serial PRIMARY KEY,
  video_id integer NOT NULL REFERENCES video(id),
  codec_name TEXT,
  codec_name_long TEXT,
  profile TEXT,
  codec_type TEXT,
  codec_time_base TEXT,
  width real,
  height real,
  coded_width real,
  coded_height real,
  display_aspect_ratio TEXT,
  display_aspect_ratio_height real,
  display_aspect_ratio_width real,
  r_frame_rate TEXT,
  avg_frame_rate TEXT,
  time_base TEXT,
  frames TEXT,
  start_time real,
  duration real,
  bit_rate: real
);
CREATE TABLE video_transcription_moderation (
  id serial PRIMARY KEY,
    video_id integer NOT NULL REFERENCES video(id) ON DELETE CASCADE,
    flagged boolean,
    category_harassment boolean,
  category_score_harassment smallint,
  category_harassment_threatening boolean,
  category_score_harassment_threatening smallint,
  category_sexual boolean,
  category_score_sexual smallint,
  category_hate boolean,
  category_score_hate smallint,
  category_hate_threatening boolean,
  category_score_hate_threatening smallint,
  category_illicit boolean,
  category_score_illicit smallint,
  category_illicit_violent boolean,
  category_score_illicit_violent smallint,
  category_self_harm_intent boolean,
  category_score_self_harm_intent smallint,
  category_self_harm_instructions boolean,
  category_score_self_harm_instructions smallint,
  category_self_harm boolean,
  category_score_self_harm smallint,
  category_sexual_minors boolean,
  category_score_sexual_minors smallint,
  category_violence boolean,
  category_score_violence smallint,
  category_violence_graphic boolean,
  category_score_violence_graphic smallint
);
CREATE TABLE video_transcription (
  id serial PRIMARY KEY,
  video_id integer NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  transcription_vtt TEXT NOT NULL
);
CREATE TABLE video_frames (
  video_id integer NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  frame smallint NOT NULL,
  normal smallint NOT NULL, -- Multiply decimal by 100 and round
    nsfw smallint NOT NULL -- Multiply decimal by 100 and round
);
CREATE TABLE video_transcription_embeddings (
  video_id integer NOT NULL REFERENCES video(id) ON DELETE CASCADE,
  embedding vector(1536) NOT NULL
);

CREATE INDEX ON video USING HASH (video_url);
CREATE INDEX ON video USING BTREE (user_id);
CREATE INDEX ON video USING BTREE (ip_id);
CREATE INDEX ON video_data USING BTREE (video_id);
CREATE INDEX ON video_streams USING BTREE (video_id);
CREATE INDEX ON video_transcription USING BTREE (video_id);
CREATE INDEX ON video_transcription_moderation USING BTREE (video_id);
CREATE INDEX ON video_transcription_embeddings USING BTREE(video_id);
CREATE INDEX ON video_transcription_embeddings USING hnsw (embedding vector_cosine_ops);


DROP TABLE images;
DROP TABLE image_nsfw;
DROP TABLE image_embeddings;
DROP TABLE image_captions;
DROP TABLE image_data;
```
*/
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
exports.getVideoInformationLexical = exports.getAudioInformationLexical = exports.getImagesInformationLexical = exports.handleUserUploadedImage = exports.addImageToDatabase = exports.afterVideoTranscriptionComplete = exports.uploadVideoToDatabase = exports.afterAudioTranscriptionComplete = exports.uploadAudioToDatabase = exports.afterImageHasBeenUploadedLambda = exports.getFfmpegInfo = exports.getTestVideoHTML = exports.getTestAudioHTML = exports.renderVideoHTML = exports.renderAudioHTML = exports.afterMultipartUploadCompleteAudio = exports.afterMultipartUploadCompleteVideo = exports.getImageMetadata = exports.getVideoMetadata = exports.getAudioMetadata = exports.extractAudioFromVideoFile = exports.generateVideoThumbnail = exports.transcodeAudioFunction = exports.transcodeVideoFunction = exports.deleteLocalFileNoError = exports.deleteLocalFile = exports.extractExtensionAndNameFromFileName = exports.INSERT_INTO_IMAGE_DATA = void 0;
const getDocInfo = () => { };
/* ----------------------- Imports -------------------------- */
const node_fs_1 = __importDefault(require("node:fs"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const ffprobe_static_1 = __importDefault(require("ffprobe-static"));
const aws_implementation_1 = require("./aws-implementation");
const NUMBER = __importStar(require("../utils/number"));
const buffer_image_size_1 = __importDefault(require("buffer-image-size"));
const escape_html_1 = __importDefault(require("escape-html"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_worker_threads_1 = require("node:worker_threads");
const cmd_1 = require("../utils/cmd");
const image_1 = require("../utils/image");
const projects_1 = require("../ROUTER/pages_helper/projects");
const database_1 = __importDefault(require("../database"));
const pgvector_1 = __importDefault(require("pgvector"));
const env_1 = __importDefault(require("../utils/env"));
const ejs_1 = __importDefault(require("ejs"));
const handleArticleData_1 = require("../ROUTER/pages_helper/article_helpers/handleArticleData");
const ai_1 = require("../ai");
/* ----------------------- Types -------------------------- */
const LAMBDA_API_KEY = env_1.default.LAMBDA_API_KEY;
if (!!!LAMBDA_API_KEY)
    throw new Error("Unable to find LAMBDA_API_KEY in env.");
const path_to_temp_video = path_1.default.resolve(__dirname, 'temp-video');
const path_to_temp_audio = path_1.default.resolve(__dirname, 'temp-audio');
const path_to_temp_image = path_1.default.resolve(__dirname, 'temp-image');
if (!!!node_fs_1.default.existsSync(path_to_temp_video)) {
    node_fs_1.default.mkdirSync(path_to_temp_video);
}
if (!!!node_fs_1.default.existsSync(path_to_temp_audio)) {
    node_fs_1.default.mkdirSync(path_to_temp_audio);
}
if (!!!node_fs_1.default.existsSync(path_to_temp_image)) {
    node_fs_1.default.mkdirSync(path_to_temp_image);
}
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
fluent_ffmpeg_1.default.setFfprobePath(ffprobe_static_1.default.path);
/* ----------------------- Constants ----------------------- */
exports.INSERT_INTO_IMAGE_DATA = `INSERT INTO image_data (image_id,format,mimetype,width,height,color_space,image_type,image_depth,channels,alpha,gamma,matte_color,background_color,border_color,transparent_color,compression,oritentation,date_created,date_modified,tainted,image_size,number_pixels,ellapsed_milliseconds,color,frame) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25);`;
const AUDIO_EXTENSIONS = [
    { audioCodec: 'aac', extension: 'mp4' },
    { audioCodec: 'flac', extension: 'flac' },
    { audioCodec: 'opus', extension: 'webm' }
];
const VIDEO_EXTENSIONS = [
    { videoCodec: 'libvpx', extension: 'webm' },
    { videoCodec: 'libx264', extension: 'mp4' }
];
const PATH_TO_TEMP_AUDIO = path_1.default.resolve(__dirname, 'temp-audio');
const PATH_TO_TEMP_VIDEO = path_1.default.resolve(__dirname, 'temp-video');
const PATH_TO_TEMP_IMAGE = path_1.default.resolve(__dirname, 'temp-image');
const MAX_HEIGHT = 400;
if (!!!node_fs_1.default.existsSync(PATH_TO_TEMP_AUDIO)) {
    node_fs_1.default.mkdirSync(PATH_TO_TEMP_AUDIO);
}
if (!!!node_fs_1.default.existsSync(PATH_TO_TEMP_VIDEO)) {
    node_fs_1.default.mkdirSync(PATH_TO_TEMP_VIDEO);
}
if (!!!node_fs_1.default.existsSync(PATH_TO_TEMP_IMAGE)) {
    node_fs_1.default.mkdirSync(PATH_TO_TEMP_IMAGE);
}
/* --------------------- Helper Functions ------------------ */
/**
 * Extract the portion of the filename before the extension (excluding the period)
 * along with the extension from the string of a filename
 * Returns:
 * - **name**: The name of the file, i.e. Key: 'frankmbrown/1234.ext' => '1234.ext'
 * - **extension**: 'ext' in the case above
 *
 * @param ext
 */
function extractExtensionAndNameFromFileName(key) {
    var newKey = key.replace('frankmbrown/', '');
    if (newKey.startsWith('/'))
        newKey = newKey.slice(1);
    const lastPeriodIndex = newKey.lastIndexOf('.');
    const name = newKey.slice(0, lastPeriodIndex);
    const extension = newKey.slice(lastPeriodIndex + 1);
    return { name, extension };
}
exports.extractExtensionAndNameFromFileName = extractExtensionAndNameFromFileName;
/**
 * Delete a local file given the path to that file.
 *
 * # **IF**
 *
 * the file cannot be found, throw an error
 *
 * @param path
 * @returns
 */
async function deleteLocalFile(path) {
    return new Promise((resolve, reject) => {
        node_fs_1.default.promises.unlink(path)
            .then(() => resolve(true))
            .catch((e) => reject(e));
    });
}
exports.deleteLocalFile = deleteLocalFile;
/**
 * Delete a local file given the path to that file.
 *
 * # **IF**
 *
 * the file cannot be found, **do not** throw an error
 * @param path
 * @returns
 */
async function deleteLocalFileNoError(path) {
    return new Promise((resolve, reject) => {
        node_fs_1.default.promises.unlink(path)
            .then(() => resolve(true))
            .catch((e) => resolve(false));
    });
}
exports.deleteLocalFileNoError = deleteLocalFileNoError;
function isString(s) {
    return typeof s === "string";
}
function isNumber(s) {
    return typeof s === "number";
}
function newParseInt(a) {
    return parseInt(String(a));
}
/**
 * Parse return of ffprobe
 * @param res
 * @returns
 */
function parseFFMpegAudioData(res) {
    const retStreams = res.streams;
    const streams = [];
    const format = res.format;
    const num_streams = isString(format.nb_streams) ? format.nb_streams : null;
    const audio_format = isString(format.format_name) ? format.format_name : null;
    const audio_format_long = isString(format.format_long_name) ? format.format_long_name : null;
    const start_time = isString(format.start_time) ? format.start_time : null;
    const duration = isNumber(newParseInt(newParseInt(format.duration))) ? newParseInt(format.duration) : null;
    const size = isNumber(newParseInt(format.size)) ? newParseInt(format.size) : null;
    const bit_rate = isNumber(newParseInt(format.bit_rate)) ? newParseInt(format.bit_rate) : null;
    const probe_score = isNumber(newParseInt(format.probe_score)) ? newParseInt(format.probe_score) : null;
    const tags = JSON.stringify(format.tags);
    for (let stream of retStreams) {
        streams.push({
            codec_name: isString(stream.codec_name) ? stream.codec_name : null,
            codec_name_long: isString(stream.codec_long_name) ? stream.codec_long_name : null,
            codec_time_base: isString(stream.codec_time_base) ? stream.codec_time_base : null,
            codec_type: isString(stream.codec_type) ? stream.codec_type : null,
            sample_rate: isNumber(newParseInt(stream.sample_rate)) ? newParseInt(stream.sample_rate) : null,
            channels: isNumber(newParseInt(stream.channels)) ? newParseInt(stream.channels) : null,
            start_time: isNumber(newParseInt(stream.start_time)) ? newParseInt(stream.start_time) : null,
            duration: isNumber(newParseInt(parseFloat(String(stream.duration)))) ? parseFloat(String(stream.duration)) : null,
            bit_rate: isNumber(newParseInt(parseFloat(String(stream.bit_rate)))) ? parseFloat(String(stream.bit_rate)) : null
        });
    }
    return {
        audio_format,
        audio_format_long,
        size,
        duration,
        start_time,
        bit_rate,
        num_streams,
        probe_score,
        tags,
        streams
    };
}
/**
 * Parse Video Data
 * @param res
 * @returns
 */
function parseVideoData(res) {
    const retStreams = res.streams;
    const streams = [];
    const format = res.format;
    const num_streams = isString(format.nb_streams) ? format.nb_streams : null;
    const video_format = isString(format.format_name) ? format.format_name : null;
    const video_format_long = isString(format.format_long_name) ? format.format_long_name : null;
    const start_time = isNumber(newParseInt(format.start_time)) ? newParseInt(format.start_time) : null;
    const duration = isNumber(newParseInt(format.duration)) ? newParseInt(format.duration) : null;
    const size = isNumber(newParseInt(format.size)) ? newParseInt(format.size) : null;
    const bit_rate = isNumber(newParseInt(format.bit_rate)) ? newParseInt(format.bit_rate) : null;
    const probe_score = isNumber(newParseInt(format.probe_score)) ? newParseInt(format.probe_score) : null;
    const tags = JSON.stringify(format.tags);
    var width = null;
    var height = null;
    var video_codec = null;
    var audio_codec = null;
    for (let stream of retStreams) {
        if (stream.codec_type === "video") {
            if (Number.isInteger(parseInt(stream.width))) {
                width = parseInt(stream.width);
            }
            if (Number.isInteger(parseInt(stream.height))) {
                height = parseInt(stream.height);
            }
            if (video_codec === null) {
                video_codec = stream.codec_name || null;
            }
        }
        if (stream.codec_type === "audio") {
            audio_codec = stream.codec_name || null;
        }
        const display_aspect_ratio = String(stream.display_aspect_ratio);
        const aspect_ratio_arr = display_aspect_ratio.split(':');
        var display_aspect_ratio_height = null;
        var display_aspect_ratio_width = null;
        if (aspect_ratio_arr.length === 2 && Number.isInteger(parseInt(aspect_ratio_arr[0])) && Number.isInteger(parseInt(aspect_ratio_arr[1]))) {
            display_aspect_ratio_width = parseInt(aspect_ratio_arr[0]);
            display_aspect_ratio_height = parseInt(aspect_ratio_arr[1]);
        }
        streams.push({
            codec_name: isString(stream.codec_name) ? stream.codec_name : null,
            codec_name_long: isString(stream.codec_name_long) ? stream.codec_name_long : null,
            codec_type: isString(stream.codec_type) ? stream.codec_type : null,
            codec_time_base: isString(stream.codec_time_base) ? stream.codec_time_base : null,
            profile: String(stream.profile),
            width: parseInt(String(stream.width)) || null,
            height: parseInt(String(stream.height)) || null,
            coded_width: parseInt(String(stream.width)) || null,
            coded_height: parseInt(String(stream.height)) || null,
            display_aspect_ratio: display_aspect_ratio || null,
            display_aspect_ratio_height,
            display_aspect_ratio_width,
            r_frame_rate: String(stream.r_frame_rate),
            avg_frame_rate: String(stream.avg_frame_rate),
            time_base: String(stream.time_base),
            frames: String(stream.nb_frames),
            start_time: isNumber(newParseInt(stream.start_time)) ? newParseInt(stream.start_time) : null,
            duration: parseFloat(String(stream.duration)) || null,
            bit_rate: parseFloat(String(stream.bit_rate)) || null
        });
    }
    return {
        video_format,
        video_format_long,
        size,
        duration,
        start_time,
        bit_rate,
        num_streams,
        probe_score,
        tags,
        streams,
        width,
        height,
        audio_codec,
        video_codec
    };
}
function parseImageData(str) {
    const lines = str.split('\n');
    const retObj = {
        format: null, // text
        mimetype: null, // text
        width: 0, // smallint
        height: 0, // smallint
        color_space: null, // text
        type: null, // text
        depth: null, // text
        channels: 0, // smallint
        alpha: null, // text
        gamma: null, // text
        matte_color: null, // text
        background_color: null, // text
        border_color: null, // text
        transparent_color: null, // text
        compression: null, // text
        oritentation: null, // text
        date_created: null, // integer
        date_modified: null, // integer
        tainted: false, // boolean
        size: 0, // int
        number_pixels: 0, // int
        ellapsed_milliseconds: 0, // int
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('Format:')) {
            retObj["format"] = line.replace('Format:', '').trim();
        }
        if (line.startsWith('Mime type:')) {
            retObj["mimetype"] = line.replace('Mime type:', '').trim();
        }
        if (line.startsWith('Geometry:')) {
            const new_line = line.replace('Geometry:', '').trim();
            const matches = new_line.match(/(?<width>\d+)x(?<height>\d+)\+?(?<x>\d+)?\+(?<y>\d+)?/);
            if (matches && matches.groups) {
                const width = parseInt(matches.groups.width);
                const height = parseInt(matches.groups.height);
                if (Number.isInteger(width) && Number.isInteger(height)) {
                    retObj.width = Math.min(32767, width);
                    retObj.height = Math.min(32767, height);
                }
            }
        }
        if (line.startsWith('Colorspace:')) {
            const new_line = line.replace('Colorspace:', '').trim();
            retObj["color_space"] = new_line;
        }
        if (line.startsWith('Type:')) {
            const new_line = line.replace('Type:', '').trim();
            retObj["type"] = new_line;
        }
        if (line.startsWith('Depth:')) {
            const new_line = line.replace('Depth:', '').trim();
            retObj["depth"] = new_line;
        }
        if (line.startsWith('Channels:')) {
            const new_line = line.replace('Channels:', '').trim();
            const channels = parseInt(new_line);
            if (Number.isInteger(channels))
                retObj["channels"] = channels;
        }
        if (line.startsWith('Alpha:') && line !== 'Alpha:') {
            const new_line = line.replace('Alpha:', '').trim();
            retObj["alpha"] = new_line;
        }
        if (line.startsWith('Gamma:')) {
            const new_line = line.replace('Gamma:', '').trim();
            const gamma = parseFloat(new_line);
            if (Number.isFinite(gamma)) {
                retObj["gamma"] = gamma;
            }
        }
        if (line.startsWith('Matte color:')) {
            const new_line = line.replace('Matte color:', '').trim();
            retObj["matte_color"] = new_line;
        }
        if (line.startsWith('Background color:')) {
            const new_line = line.replace('Background color:', '').trim();
            retObj['background_color'] = new_line;
        }
        if (line.startsWith('Border color:')) {
            const new_line = line.replace('Border color:', '').trim();
            retObj['border_color'] = new_line;
        }
        if (line.startsWith('Transparent color:')) {
            const new_line = line.replace('Transparent color:', '').trim();
            retObj['transparent_color'] = new_line;
        }
        if (line.startsWith('Compression:')) {
            const new_line = line.replace('Compression:', '').trim();
            retObj['compression'] = new_line;
        }
        if (line.startsWith('Orientation:')) {
            const new_line = line.replace('Orientation:', '').trim();
            retObj['oritentation'] = new_line;
        }
        if (line.startsWith('date:create:')) {
            const new_line = line.replace('date:create:', '').trim();
            retObj['date_created'] = (new Date(new_line)).getTime() / 1000;
        }
        if (line.startsWith('date:modify:')) {
            const new_line = line.replace('date:modify:', '').trim();
            retObj['date_modified'] = (new Date(new_line)).getTime() / 1000;
        }
        if (line.startsWith('Tainted:')) {
            const new_line = line.replace('Tainted:', '').trim();
            retObj["tainted"] = Boolean(new_line === "True");
        }
        if (line.startsWith('Filesize:')) {
            const new_line = line.replace('Filesize:', '').trim().replace('B', '');
            retObj["size"] = parseInt(new_line);
        }
        if (line.startsWith('Number pixels:')) {
            const new_line = line.replace('Number pixels:', '').trim();
            retObj["number_pixels"] = parseInt(new_line);
        }
        if (line.startsWith('Elapsed time:')) {
            const time = line.replace('Elapsed time:', '').trim();
            const matches = time.match(/(?<minutes>\d+)\:(?<seconds>\d+)\.(?<ms>\d+)/);
            if (matches && matches.groups) {
                const ellapsed_minutes = parseInt(matches.groups.minutes) || 0;
                const ellapsed_seconds = parseInt(matches.groups.seconds) || 0;
                const ellapsed_ms = parseInt(matches.groups.ms) || 0;
                retObj["ellapsed_milliseconds"] = Math.min(60 * 1000 * ellapsed_minutes + ellapsed_seconds * 1000 + ellapsed_ms, 2147483647);
            }
        }
    }
    if (retObj.width === 0 && retObj.height === 0) {
        throw new Error("Unable to get width and height from magick identify.");
    }
    return retObj;
}
/* ---------------------- Functions ------------------------- */
/* -------------------------------------------- File Upload Process ----------------- --------- */
/**
 * Image Files:
 * 1. User uploads image file from the frontend.
 * 2. The type of the file as well as the extension and the size are validated on the frontend.
 * 3. The user then tries to get a signed url from the backend using the image name and the size of the file (we should also include whether this is an original file or a copy in the request)
 * 4. We get a signed url from the backend, validate the image, should get a new name for the image, and return it to the user where they then post the signedurl with the image to the s3 database.
 *
 * Video And Audio Files:
 * The process for audio and video file uploads goes as follows:
 * 1. User records or uploads audio file to frontend
 * 2. The audio file is validated on the frontend
 *  A. The type of the file, the extension, and the size of the file are checked
 *  B. The size of the file and the type of the file should be uploaded to the backend
 * 3. The audio file should receive a new name and be validated on the backend. If this is a video file, then the width and height of the video should be uploaded as well.
 *  A. The file is validated on the backend by checking the number of parts that were requested by the frontend
 * 4. A create multipart upload signed url and the signed urls for uploading the parts should be generated for the file and sent back to the frontend with the Key, UploadId for the multipart upload
 *  A. In this step, a row should also be created for the file in the RDS database. The row will be sparse given that we don't know anything about the file
 * 5. The user should upload the chunks of the file using the signed urls on the client.
 * 6. The user should then call the server to complete the multipart upload
 * 7. The server should send the complete multipart upload command and then get the file from s3
 * 8. The file from s3 should then be retrieved and saved to the temporary audio files folder
 * 9. Then, you should get the data for the original file upload and update the row in the RDS database as well as updating the metadata in s3 (For video files, you should also get a thumbnail image here that is the same as the original key + .jpg (make sure to set the correct width and height)). You should also transcode the files appropriately and upload the data to RDS / s3.
 *  A. Audio Files and Video files should generate their webvtt files during this step
 *    a. You can then parse the audio and video files webvtt files for inappropriate content during this step.
 *  B. Video files should probably start their AmazonRekognition during this step as well
 *    a. Need to see how long this takes.
 */
/**
 * Transcode the video that resides at `pathToInputFile`into the codecs / extensions provided in arr. This saves the files in the temp_video folder. If the arr has no length,
 * then we save the video in the singleFilePath
 * @param param0
 * @returns
 */
async function transcodeVideoFunction({ pathToInputFile, arr, name, height, singleFilePath }) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'transcodeVideo', 'index.js'), {
            workerData: { pathToInputFile, arr, name, height, singleFilePath }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", () => {
            resolve(true);
        });
    });
}
exports.transcodeVideoFunction = transcodeVideoFunction;
async function transcodeAudioFunction({ pathToInputFile, arr, name }) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'transcodeAudio', 'index.js'), {
            workerData: { pathToInputFile, arr, name }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", () => {
            resolve(true);
        });
    });
}
exports.transcodeAudioFunction = transcodeAudioFunction;
/**
 * Generate the thumbnail for a video with a certain height - I guess the width will
 * be 100% on the client
 * @param pathToInputFile
 * @param name
 * @param height
 * @returns
 */
async function generateVideoThumbnail(pathToInputFile, name, height) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'generateVideoThumbnail', 'index.js'), {
            workerData: { pathToInputFile, name, height }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", () => {
            resolve(true);
        });
    });
}
exports.generateVideoThumbnail = generateVideoThumbnail;
/**
 * Extract audio file from video
 * @param pathToInputFile path to video file
 * @param name name of the video file (name without the codec and the extension) - the information before the first period\
 * @returns
 */
async function extractAudioFromVideoFile(pathToInputFile, name) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'extractAudioFromVideoFile', 'index.js'), {
            workerData: { pathToInputFile, name }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", () => {
            resolve(true);
        });
    });
}
exports.extractAudioFromVideoFile = extractAudioFromVideoFile;
/**
 *
 * @param pathToFile Path to the audio file
 * @returns
 */
async function getAudioMetadata(pathToFile) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'getAudioMetadata', 'index.js'), {
            workerData: { pathToFile }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", (message) => {
            const data = JSON.parse(message.ffmpegData);
            const parsedData = parseFFMpegAudioData(data);
            resolve(parsedData);
        });
    });
}
exports.getAudioMetadata = getAudioMetadata;
/**
 *
 * @param pathToFile Path top the video File
 * @returns
 */
async function getVideoMetadata(pathToFile) {
    return new Promise((resolve, reject) => {
        const worker = new node_worker_threads_1.Worker(path_1.default.resolve(__dirname, 'worker_threads', 'getVideoMetadata', 'index.js'), {
            workerData: { pathToFile }
        });
        worker.on('error', (err) => {
            reject(err);
        });
        worker.on("message", (message) => {
            const data = JSON.parse(message.ffmpegData);
            const parsedData = parseVideoData(data);
            resolve(parsedData);
        });
    });
}
exports.getVideoMetadata = getVideoMetadata;
/**
 * Get the metadata for the image
 * @param body
 * @returns
 */
async function getImageMetadata(body) {
    try {
        const data = await (0, cmd_1.executeWithArgument)('magick', ['identify', '-verbose', '-precision', '16', '-'], body);
        const strData = data.toString('utf-8').trim().split('\n');
        const imageIndices = [];
        for (let i = 0; i < strData.length; i++) {
            if (strData[i].trim() === "Image:") {
                imageIndices.push(i);
            }
        }
        const dataToParse = [];
        for (let i = 0; i < imageIndices.length; i++) {
            if (i === imageIndices.length - 1)
                dataToParse.push(strData.slice(imageIndices[i]).join('\n'));
            else
                dataToParse.push(strData.slice(imageIndices[i], imageIndices[i + 1]).join('\n'));
        }
        const parsedDataArr = [];
        if (dataToParse.length > 1) {
            for (let i = 0; i < dataToParse.length; i++) {
                const gifFrame = await (0, cmd_1.executeWithArgument)('magick', ['convert', `-[${i}]`, 'png:-'], body);
                const backgroundColor = await (0, image_1.getImageBackgroundColor)(gifFrame);
                const parsedData = parseImageData(dataToParse[i]);
                parsedData.color = backgroundColor;
                parsedData.image = gifFrame;
                parsedDataArr.push(parsedData);
            }
        }
        else {
            const backgroundColor = await (0, image_1.getImageBackgroundColor)(body);
            const parsedData = parseImageData(dataToParse[0]);
            parsedData.color = backgroundColor;
            parsedDataArr.push(parsedData);
        }
        return parsedDataArr;
    }
    catch (e) {
        console.error(e);
        const retObj = {
            format: null, // text
            mimetype: null, // text
            width: 0, // smallint
            height: 0, // smallint
            color_space: null, // text
            type: null, // text
            depth: null, // text
            channels: 0, // smallint
            alpha: null, // text
            gamma: null, // text
            matte_color: null, // text
            background_color: null, // text
            border_color: null, // text
            transparent_color: null, // text
            compression: null, // text
            oritentation: null, // text
            date_created: null, // text
            date_modified: null, // text
            tainted: false, // boolean
            size: 0, // int
            number_pixels: 0, // int
            ellapsed_milliseconds: 0, // int
            color: "black"
        };
        const res = (0, buffer_image_size_1.default)(Buffer.from(body));
        retObj.width = res.width;
        retObj.height = res.height;
        retObj.format = res.type;
        return [retObj];
    }
}
exports.getImageMetadata = getImageMetadata;
/* ------------------------------------- After completing multipart upload --------------- */
/**
 * EFFECTS OF THIS FUNCTION:
 *
 * The file name (key) must not have a period before the separation between the key and the extension
 * The video should have width and height metadata
 * @param res
 * @param key frankmbrown/ crypto.randomUUID() + extension
 * @returns
 */
async function afterMultipartUploadCompleteVideo(req, res, key) {
    try {
        // Get Video Object from s3
        const videoObject = await (0, aws_implementation_1.getVideoObject)(key);
        const { Body, Metadata } = videoObject;
        if (!!!Body || !!!Metadata)
            throw new Error(`Unable to get video object ${key} from s3.`);
        // video object should have its width and height set when creating Metadata
        const { height: origHeight } = Metadata;
        // Get Original file data
        const originalFileData = await Body.transformToByteArray();
        var newKey = key.replace('frankmbrown/', '');
        if (newKey.startsWith('/'))
            newKey = newKey.slice(1);
        var PATH_TO_ORIGINAL_FILE = path_1.default.resolve(PATH_TO_TEMP_VIDEO, newKey);
        // Get the name and extension from the original file - this assumes that the file name has only one period (the extension is after the period)
        const { name, extension } = extractExtensionAndNameFromFileName(newKey);
        // Save the original file in the temp folder
        await node_fs_1.default.promises.writeFile(PATH_TO_ORIGINAL_FILE, originalFileData);
        const originalFileMetadata = await getVideoMetadata(PATH_TO_ORIGINAL_FILE);
        var heightToUse = 0;
        // If the height is not set or the height is not valid, try to get the height from the original file and set it to an appropriate size, 
        if (!!!origHeight || !!!NUMBER.isValidFloat(parseFloat(origHeight)) || parseFloat(origHeight) > MAX_HEIGHT) {
            const height = originalFileMetadata.height;
            if (!!!height || height > MAX_HEIGHT)
                heightToUse = MAX_HEIGHT;
            else
                heightToUse = height;
        }
        else {
            heightToUse = parseFloat(origHeight);
        }
        const arr = VIDEO_EXTENSIONS;
        // For each new file that will be created during transcoding, get the properties that we will need to upload the object to s3 / RDS
        const OUTPUT_FILE_NAMES = [{
                name: `${name}`,
                Key: key,
                pathToFile: path_1.default.resolve(PATH_TO_TEMP_VIDEO, `${name}-output.${extension}`),
                extension: extension
            }].concat(arr.map((obj) => ({
            name: `${name}`,
            Key: `frankmbrown/${name}.${obj.videoCodec}.${obj.extension}`,
            pathToFile: path_1.default.resolve(PATH_TO_TEMP_VIDEO, `${name}.${obj.videoCodec}.${obj.extension}`),
            extension: obj.extension,
            originalFileName: newKey
        })));
        // REMOVE
        // Transcode the original file into other formats and get the metadata for the original file. Use ffmpeg to put the original file into the correct height
        await Promise.all([
            // Put the original file in the correct height
            transcodeVideoFunction({
                pathToInputFile: PATH_TO_ORIGINAL_FILE,
                arr: [],
                name,
                height: String(heightToUse),
                singleFilePath: path_1.default.resolve(PATH_TO_TEMP_VIDEO, `${name}-output.${extension}`)
            }),
            transcodeVideoFunction({
                pathToInputFile: PATH_TO_ORIGINAL_FILE,
                arr,
                name,
                height: String(heightToUse)
            }),
            // Generate a video thumbnail
            generateVideoThumbnail(PATH_TO_ORIGINAL_FILE, name, String(heightToUse))
        ]);
        const imageThumbnailKey = `${name}-thumbnail.png`;
        const PATH_TO_THUMBNAIL_IMAGE = path_1.default.resolve(PATH_TO_TEMP_IMAGE, imageThumbnailKey);
        // Create arrays as needed for uploading files to s3 and recording upload in RDS
        const objectsToUploadToS3 = [];
        const objectsToUploadToDB = [];
        // Get the metadata for the newly created files
        const [thumbnailImageData, ...createdFilesMetadata] = await Promise.all([
            node_fs_1.default.promises.readFile(PATH_TO_THUMBNAIL_IMAGE),
            ...OUTPUT_FILE_NAMES.map((obj) => getVideoMetadata(obj.pathToFile))
        ]);
        const { width: imageWidth, height: imageHeight, type: imageType } = (await getImageMetadata(thumbnailImageData))[0];
        const imageMetadata = {
            key: `frankmbrown/${imageThumbnailKey}`,
            name: `${name}-thumbnail`,
            extension: 'png',
            codec: String(null),
            width: String(imageWidth),
            height: String(imageHeight),
            size: String(thumbnailImageData.byteLength)
        };
        // Populate the arrays for uploading to s3 / uploading to RDS
        createdFilesMetadata.forEach((obj, i) => {
            const objectToUploadToS3 = {
                name: OUTPUT_FILE_NAMES[i].name,
                Key: OUTPUT_FILE_NAMES[i].Key,
                extension: OUTPUT_FILE_NAMES[i].extension,
                metadata: {
                    duration: String(originalFileMetadata.duration),
                    video_codec: String(originalFileMetadata.video_codec),
                    audio_codec: String(originalFileMetadata.audio_codec),
                    width: String(originalFileMetadata.width),
                    height: String(originalFileMetadata.height),
                    size: String(originalFileMetadata.size)
                },
                pathToFile: OUTPUT_FILE_NAMES[i].pathToFile
            };
            objectsToUploadToS3.push(objectToUploadToS3);
            objectsToUploadToDB.push({ ...obj, ...objectToUploadToS3 });
        });
        const { user_id, ip_id } = (0, aws_implementation_1.getUserIdAndIpIdForImageUpload)(req);
        // REMOVE
        // Upload the files to s3
        await Promise.all([
            ...objectsToUploadToS3.map((obj) => (0, aws_implementation_1.uploadVideoOject)(obj.pathToFile, obj.Key, obj.metadata, obj.extension)),
            (0, aws_implementation_1.uploadImageObject)(imageMetadata.key, Buffer.from(thumbnailImageData), imageMetadata.extension, imageMetadata, user_id, ip_id)
        ]);
        const url = `https://video.storething.org/`.concat(objectsToUploadToS3[0].Key);
        const other_urls = objectsToUploadToS3.slice(1).map((obj) => `https://video.storething.org/`.concat(obj.Key));
        if (!!!ip_id)
            throw new Error("ip_id must be defined when uploading audio or video.");
        // REMOVE
        // Record the successfully file uploads in RDS and delete local files and start the transcription job
        await Promise.all([
            ...objectsToUploadToDB.map((obj) => {
                deleteLocalFile(obj.pathToFile);
            }),
            deleteLocalFile(PATH_TO_ORIGINAL_FILE),
            deleteLocalFileNoError(PATH_TO_THUMBNAIL_IMAGE),
            (0, aws_implementation_1.startTranscribeVideoJob)(OUTPUT_FILE_NAMES[OUTPUT_FILE_NAMES.length - 1].Key, OUTPUT_FILE_NAMES[OUTPUT_FILE_NAMES.length - 1].extension, OUTPUT_FILE_NAMES[OUTPUT_FILE_NAMES.length - 1].extension),
            uploadVideoToDatabase(url, other_urls, originalFileMetadata, { ip_id, user_id: user_id || null })
        ]);
        if (req.session.uploadedVideo)
            req.session.uploadedVideo += 1;
        else
            req.session.uploadedVideo = 1;
        return res.status(200).json({ height: heightToUse });
    }
    catch (error) {
        console.error(error);
        try {
            const { name, extension } = extractExtensionAndNameFromFileName(key);
            await (0, aws_implementation_1.deleteVideoObject)(key);
            const origFile = path_1.default.resolve(PATH_TO_TEMP_VIDEO, key);
            const outputFile = path_1.default.resolve(PATH_TO_TEMP_VIDEO, `${name}-output.${extension}`);
            const transcodedFiles = VIDEO_EXTENSIONS.map((obj) => {
                return path_1.default.resolve(PATH_TO_TEMP_VIDEO, `${name}.${obj.videoCodec}.${obj.extension}`);
            });
            const thumbnailImage = path_1.default.resolve(PATH_TO_TEMP_IMAGE, `${name}-thumbnail.png`);
            await Promise.all([
                deleteLocalFileNoError(origFile),
                deleteLocalFileNoError(outputFile),
                deleteLocalFileNoError(thumbnailImage),
                ...transcodedFiles.map((s) => deleteLocalFileNoError(s))
            ]);
        }
        catch (error) {
            console.error(error);
        }
        return res.status(500).send('Something went wrong transcoding the video file.');
    }
}
exports.afterMultipartUploadCompleteVideo = afterMultipartUploadCompleteVideo;
/**
 *
 * @param res
 * @param key frankmbrown/ crypto.randomUUID() + extension
 * @returns
 */
async function afterMultipartUploadCompleteAudio(req, res, key) {
    var _a, _b;
    try {
        // Get Audio Object from s3
        const audioObject = await (0, aws_implementation_1.getAudioObject)(key);
        const { Body } = audioObject;
        if (!!!Body)
            throw new Error(`Unable to get audio object ${key} from s3.`);
        // Get Original file data
        const originalFileData = await Body.transformToByteArray();
        var newKey = key.replace('frankmbrown/', '');
        if (newKey.startsWith('/'))
            newKey = newKey.slice(1);
        const PATH_TO_ORIGINAL_FILE = path_1.default.resolve(PATH_TO_TEMP_AUDIO, newKey);
        // Get the name and extension from the original file - this assumes that the file name has only one period (the extension is after the period)
        const { name, extension } = extractExtensionAndNameFromFileName(newKey);
        // Save the original file in the temp folder
        await node_fs_1.default.promises.writeFile(PATH_TO_ORIGINAL_FILE, originalFileData);
        const arr = AUDIO_EXTENSIONS;
        // For each new file that will be created during transcoding, get the properties that we will need to upload the object to s3 / RDS
        const OUTPUT_FILE_NAMES = arr.map((obj) => ({
            name: `${name}`,
            Key: `frankmbrown/${name}.${obj.audioCodec}.${obj.extension}`,
            pathToFile: path_1.default.resolve(PATH_TO_TEMP_AUDIO, `${name}.${obj.audioCodec}.${obj.extension}`),
            extension: obj.extension,
            originalFileName: key
        }));
        // Transcode the original file into other formats and get the metadata for the original file
        const [_, originalFileMetadata] = await Promise.all([
            transcodeAudioFunction({ pathToInputFile: PATH_TO_ORIGINAL_FILE, arr, name }),
            getAudioMetadata(PATH_TO_ORIGINAL_FILE)
        ]);
        // Create arrays as needed for uploading files to s3 and recording upload in RDS
        const objectsToUploadToS3 = [{
                name,
                Key: key,
                extension,
                metadata: {
                    duration: String(originalFileMetadata.duration),
                    audio_codec: String(((_a = originalFileMetadata.streams) === null || _a === void 0 ? void 0 : _a[0].codec_name) || ''),
                    size: String(originalFileMetadata.size)
                },
                pathToFile: PATH_TO_ORIGINAL_FILE
            }];
        const objectsToUploadToDB = [{
                ...originalFileMetadata,
                ...objectsToUploadToS3[0]
            }];
        // Get the metadata for the newly created files
        const createdFilesMetadata = await Promise.all(OUTPUT_FILE_NAMES.map((obj) => getAudioMetadata(obj.pathToFile)));
        // Populate the arrays for uploading to s3 / uploading to RDS
        createdFilesMetadata.forEach((obj, i) => {
            var _a, _b;
            const objectToUploadToS3 = {
                name: OUTPUT_FILE_NAMES[i].name,
                Key: OUTPUT_FILE_NAMES[i].Key,
                extension: OUTPUT_FILE_NAMES[i].extension,
                metadata: {
                    duration: String(obj.duration),
                    audio_codec: String(((_b = (_a = obj.streams) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.codec_name) || ''),
                    size: String(obj.size)
                },
                pathToFile: OUTPUT_FILE_NAMES[i].pathToFile
            };
            objectsToUploadToS3.push(objectToUploadToS3);
            objectsToUploadToDB.push({ ...obj, ...objectToUploadToS3 });
        });
        // Upload the files to s3
        await Promise.all([
            ...objectsToUploadToS3.map((obj) => (0, aws_implementation_1.uploadAudioObject)(obj.pathToFile, obj.Key, obj.metadata, obj.extension)),
        ]);
        const url = `https://audio.storething.org/`.concat(objectsToUploadToS3[0].Key);
        const other_urls = objectsToUploadToS3.slice(1).map((obj) => `https://audio.storething.org/`.concat(obj.Key));
        const ip_id = req.session.ip_id;
        if (!!!ip_id)
            throw new Error("ip_id must be defined when uploading audio or video.");
        const user_id = ((_b = req.session.auth) === null || _b === void 0 ? void 0 : _b.userID) || null;
        // Record the successfully file uploads in RDS and delete local files and start the transcription job
        await Promise.all([
            ...objectsToUploadToS3.map((obj) => {
                deleteLocalFile(obj.pathToFile);
            }),
            (0, aws_implementation_1.startTranscribeAudioJob)(key, extension, name),
            uploadAudioToDatabase(url, other_urls, originalFileMetadata, { ip_id, user_id })
        ]);
        if (req.session.uploadedAudio)
            req.session.uploadedAudio += 1;
        else
            req.session.uploadedAudio = 1;
        return res.status(200).send('Everything went OK');
    }
    catch (error) {
        console.error(error);
        try {
            const localObjectsToDelete = [];
            const { name, extension } = extractExtensionAndNameFromFileName(key);
            localObjectsToDelete.push(path_1.default.resolve(PATH_TO_TEMP_AUDIO, key));
            AUDIO_EXTENSIONS.forEach((obj) => localObjectsToDelete.push(path_1.default.resolve(PATH_TO_TEMP_AUDIO, `${name}.${obj.audioCodec}.${obj.extension}`)));
            await Promise.all([
                (0, aws_implementation_1.deleteAudioObject)(key),
                ...localObjectsToDelete.map((path_to_file) => deleteLocalFileNoError(path_to_file))
            ]);
        }
        catch (error) {
            console.error(error);
        }
        return res.status(500).send('Something went wrong transcoding the audio file.');
    }
}
exports.afterMultipartUploadCompleteAudio = afterMultipartUploadCompleteAudio;
/*------------------------------------------------- Render Audio And Video HTML ------------------ */
/**
 * Render audio HTML given the original key, title, and device type
 * @param key
 */
function renderAudioHTML(key, title, desktop) {
    const { name, extension } = extractExtensionAndNameFromFileName(key);
    const sources = [key].concat(AUDIO_EXTENSIONS.map((obj) => `${name}.${obj.audioCodec}.${obj.extension}`)).map((file, i) => /*html*/ `<source src="https://audio.storething.org/frankmbrown/${file}" type="video/${i === 0 ? extension : AUDIO_EXTENSIONS[i - 1].extension}">`);
    const captionsSrc = `/vtt/audio/${name}`;
    const randomId1 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId2 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId3 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId4 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId5 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId6 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId7 = 'audio_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const useTooltips = desktop;
    return /*html*/ `
  <div class="audio mt-3" data-audio-wrapper style="margin: 10px 0px;">
  <audio controls="" hidden="" data-resume="false" data-play-through="true" data-src="https://audio.storething.org/frankmbrown/${key}" preload="metadata" data-should-play="false">
    <track default="" kind="captions" src="${captionsSrc}" srclang="en">
    ${sources.join('')}
  </audio>
  <div class="audio-header align-center gap-2" style="margin-bottom: 4px;">
    <p class="body1 bold">${(0, escape_html_1.default)(title)}</p>
    <div class="audio-time-left">
      <span data-ellapsed="">0:00</span>
      /
      <span data-remaining="">0:00</span>
    </div>
  </div>
    <p data-error-text class="caption w-100 t-error" hidden>There was an error loading this audio file. Try reloading the page.</p>
    <p data-warn-text class="caption w-100 t-warning" hidden>There was an error loading the rest of the audio file. Try reloading the page.</p>
    <div class="flex-row justify-start align-center">
      <div class="flex-row align-center justify-center grow-0" data-main-controls>
        <button data-play data-type="audio" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
          <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
        </button>
        <button data-pause data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
        </button>
        <button data-replay data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>                  
        </button>
        <div data-load data-type="audio" hidden class="t-tsecondary">
          <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
        </div>
        <svg data-error hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report">
          <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z">
          </path>
        </svg>
      </div>
      <input data-time data-type="audio" id="${randomId1}" name="${randomId1}" type="range" value="0" min="0" max="29" data-time-set="true" step="1" style="background-size: 0% 100%;">
      <output hidden for="${randomId1}">0</output>
    </div>
    <div class="flex-row align-center justify-start gap-2" style="max-width: 100%;">
      <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId2}" aria-describedby="${randomId2}"` : ``}>
        <button data-mute-button data-type="audio" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
          <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
          <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
          <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
        </button>
      </div>
      ${desktop ? /*html*/ `
      <input data-sound data-type="audio" type="range" value="100" min="0" max="100" class="small primary" id="${randomId4}" name="${randomId4}" style="background-size: 100% 100%;">
      <output hidden for="${randomId4}">100</output>
      ` : /*html*/ `<div class="grow-1"></div>`}

      <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse` : ``}>
        <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
      </button>
      <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId3}" aria-describedby="${randomId3}"` : ``}>
        <div class="select" aria-label="Sound Playback Speed Select">
          <button  ${Boolean(desktop) ? '' : 'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId5}" aria-controls="${randomId5}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
          </button>
          <div ${Boolean(desktop) ? '' : 'data-click-capture'} tabindex="0" id="${randomId5}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="bottom">
            <input data-playback data-type="audio" type="text" hidden value="1" name="${randomId6}" id="${randomId6}">
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
              0.25
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
              0.5
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
              0.75
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
              1
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
              1.25
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
              1.5
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
              1.75
            </button>
            <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
              2
            </button>
          </div>
  
        </div>
      </div>
      ${useTooltips ? /*html*/ `
      <div data-placement="left-start" class="tooltip caption" id="${randomId3}" role="tooltip"> 
        Playback Speed
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
        Mute / Unmute Audio
      </div>
      <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
        Closed Captioning
      </div>
      ` : ``}
    </div>
  </div>`;
}
exports.renderAudioHTML = renderAudioHTML;
/**
 * Render video HTML given the original key, title, description, and device type
 * @param key
 */
function renderVideoHTML(key, title, description, desktop, height = 400) {
    const { name, extension } = extractExtensionAndNameFromFileName(key);
    const sources = [key].concat(VIDEO_EXTENSIONS.map((obj) => `${name}.${obj.videoCodec}.${obj.extension}`)).map((file, i) => /*html*/ `<source src="https://video.storething.org/frankmbrown/${file}" type="video/${i === 0 ? extension : VIDEO_EXTENSIONS[i - 1].extension}">`);
    const captionsSrc = `/vtt/video/${name}`;
    const thumbnail = `https://image.storething.org/frankmbrown/${name}.png`;
    const randomId1 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId2 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId3 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId4 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId5 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId6 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const randomId7 = 'video_rand_id_'.concat(node_crypto_1.default.randomUUID());
    const useTooltips = desktop;
    return /*html*/ `<div class="video-wrapper" data-video-wrapper style="margin: 10px 0px;">
  <div class="video" data-fullscreen="false" data-focus="false" data-hover="false">
  <video height="${height}" data-height="${height}" data-play-through="false" playsinline="" webkit-playsinline="" data-src="https://video.storething.org/frankmbrown/${key}" preload="metadata" poster="${thumbnail}" data-should-play="true" data-resume="true">
    <track default kind="captions" src="${captionsSrc}" srclang="en">
    ${sources.join('')}
  </video>

    <div class="video-controls">
      <div class="block">
        <input data-time data-type="video" type="range" id="${randomId1}" name="${randomId1}" class="video small primary" min="0" value="0" max="422" data-time-set="true" step="1" style="background-size: 0% 100%;">
      </div>
      <div class="flex-row justify-begin align-center gap-2 p-sm" style="padding-top:0px;" data-row-2>
        <div class="flex-row align-center justify-center grow-0" data-main-controls>
          <button data-play data-type="video" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
            <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
          </button>
          <button data-pause data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>                  
          </button>
          <button data-replay data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>                  
          </button>
          <div data-load data-type="video" hidden class="t-tsecondary">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </div>
          <svg data-error data-type="video" hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
        </div>
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId2}" aria-describedby="${randomId2}"` : ``}>
          <button data-mute-button data-type="video" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
            <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
            <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
            <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
          </button>
        </div>
        ${useTooltips ? /*html*/ `
        <input class="small secondary" data-sound data-type="video" id="${randomId3}" name="${randomId3}" type="range" value="100" min="0" max="100" step="1" style="background-size: 100% 100%;">
        <output for="${randomId3}" hidden>100</output>
        ` : `<div class="grow-1"></div>`}
        <div class="video-time-left">
          <span data-ellapsed>0:00</span>
          /
          <span data-remaining>0:00</span>
        </div>
        <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" ${useTooltips ? `data-popover data-pelem="#${randomId7}" data-mouse` : ``}>
          <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
          <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        </button>
        <div ${useTooltips ? `data-popover data-mouse data-pelem="#${randomId6}" aria-describedby="${randomId6}"` : ``}>
          <div class="select" aria-label="Sound Playback Speed Select">
            <button ${Boolean(desktop) ? '' : 'data-force-close'} class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#${randomId4}" aria-controls="${randomId4}" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
            </button>
            <div ${Boolean(desktop) ? '' : 'data-click-capture'} tabindex="0" id="${randomId4}" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="top">
              <input data-playback data-type="video" type="text" hidden value="1" name="${randomId5}" id="${randomId5}">
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
                0.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
                0.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
                0.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
                1
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
                1.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
                1.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
                1.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
                2
              </button>
            </div>
            ${useTooltips ? /*html*/ `
            <div data-placement="top" class="tooltip caption" id="${randomId2}" role="tooltip">
              Mute / Unmute Audio
            </div>
            <div data-placement="left-start" class="tooltip caption" id="${randomId6}" role="tooltip">
              Playback Speed
            </div>
            <div data-placement="top" class="tooltip caption" id="${randomId7}" role="tooltip">
              Closed Captions
            </div>
            ` : ``}
          </div>
        </div>
        <button class="icon medium" data-fullscreen type="button">
          <svg data-type="fullscreen" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenSharp"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
          <svg data-type="no-fullscreen" hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenExit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
        </button>
      </div>
    </div>
  </div>
  <div class="video-info">
    <p class="fw-regular body1">
      ${(0, escape_html_1.default)(title)}
    </p>
    <p class="caption">
      ${(0, escape_html_1.default)(description)}
    </p>
  </div>
</div>`;
}
exports.renderVideoHTML = renderVideoHTML;
function getTestAudioHTML(req) {
    var _a;
    const desktop = typeof req === "boolean" ? req : Boolean((_a = req === null || req === void 0 ? void 0 : req.session.device) === null || _a === void 0 ? void 0 : _a.desktop);
    const arr = [
        "audio_rand_id_840c715b-379f-4a56-bb31-efe80edc2471",
        "audio_rand_id_69f62c26-bc34-4ebf-9a7e-c629c8868df7",
        "audio_rand_id_64d2b78c-5cc4-4d20-8fbc-670b5f96eaff",
        "audio_rand_id_b56aa4b1-a839-419c-b2dd-c838975622ed",
        "audio_rand_id_a7a2a48b-1949-4b31-a39b-b05bc966d595",
        "audio_rand_id_931bdea0-2d31-4aaa-82c8-610e098b69d8",
        "audio_rand_id_cc19d313-50c4-4e4c-863c-2628f2e534ec"
    ];
    const html = `<div class="audio mt-3" data-audio-wrapper style="margin: 10px 0px;">
  <audio controls="" hidden="" data-resume="false" data-play-through="true" data-src="https://audio.storething.org/frankmbrown/frankmbrown/bff808c4-1c1b-4956-918e-701979f3ffe4.m4a" preload="metadata" data-should-play="false">
    <track default="" kind="captions" src="/vtt/audio/bff808c4-1c1b-4956-918e-701979f3ffe4" srclang="en">
    <source src="https://audio.storething.org/frankmbrown/frankmbrown/bff808c4-1c1b-4956-918e-701979f3ffe4.m4a" type="video/m4a"><source src="https://audio.storething.org/frankmbrown/bff808c4-1c1b-4956-918e-701979f3ffe4.aac.mp4" type="video/mp4"><source src="https://audio.storething.org/frankmbrown/bff808c4-1c1b-4956-918e-701979f3ffe4.flac.flac" type="video/flac"><source src="https://audio.storething.org/frankmbrown/bff808c4-1c1b-4956-918e-701979f3ffe4.mp3.mp4" type="video/mp3">
  </audio>
  <div class="audio-header align-center gap-2" style="margin-bottom: 4px;">
    <p class="body1 bold">Test Audio</p>
    <div class="audio-time-left">
      <span data-ellapsed="">0:00</span>
      /
      <span data-remaining="">0:00</span>
    </div>
  </div>
  <p data-error-text class="caption w-100 t-error" hidden>There was an error loading this audio file. Try reloading the page.</p>
  <p data-warn-text class="caption w-100 t-warning" hidden>There was an error loading the rest of the audio file. Try reloading the page.</p>
  <div class="flex-row justify-start align-center">
    <div class="flex-row align-center justify-center grow-0" data-main-controls>
      <button data-play data-type="audio" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
        <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
      </button>
      <button data-pause data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
      </button>
      <button data-replay data-type="audio" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>
      </button>
      <div data-load data-type="audio" hidden class="t-tsecondary">
        <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      </div>
      <svg data-error hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report">
        <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z">        
        </path>
      </svg>
    </div>
    <input data-time data-type="audio" id="audio_rand_id_840c715b-379f-4a56-bb31-efe80edc2471" name="audio_rand_id_840c715b-379f-4a56-bb31-efe80edc2471" type="range" value="0" min="0" max="29" data-time-set="true" step="1" style="background-size: 0% 100%;">
    <output hidden for="audio_rand_id_840c715b-379f-4a56-bb31-efe80edc2471">0</output>
  </div>
  <div class="flex-row align-center justify-start gap-2" style="max-width: 100%;">
    <div <%-locals.desktop?'data-popover data-mouse data-pelem="#audio_rand_id_69f62c26-bc34-4ebf-9a7e-c629c8868df7" aria-describedby="audio_rand_id_69f62c26-bc34-4ebf-9a7e-c629c8868df7"':''%>>
      <button data-mute-button data-type="audio" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
        <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
        <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
        <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
      </button>
    </div>
    <%if(locals.desktop){%>
      <input data-sound data-type="audio" type="range" value="100" min="0" max="100" class="small primary" id="audio_rand_id_64d2b78c-5cc4-4d20-8fbc-670b5f96eaff" name="audio_rand_id_64d2b78c-5cc4-4d20-8fbc-670b5f96eaff" style="background-size: 100% 100%;">
      <output hidden for="audio_rand_id_64d2b78c-5cc4-4d20-8fbc-670b5f96eaff">100</output>
    <%}else{%>
      <div class="grow-1"></div>
    <%}%>


    <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" <%-locals.desktop?' data-popover data-pelem="#audio_rand_id_cc19d313-50c4-4e4c-863c-2628f2e534ec" data-mouse':''%>>
      <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
      <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
    </button>
    <div <%-locals.desktop?'data-popover data-mouse data-pelem="#audio_rand_id_b56aa4b1-a839-419c-b2dd-c838975622ed" aria-describedby="audio_rand_id_b56aa4b1-a839-419c-b2dd-c838975622ed"':''%>>
      <div class="select" aria-label="Sound Playback Speed Select">
        <button <%-locals.desktop?'':'data-force-close'%>  class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#audio_rand_id_a7a2a48b-1949-4b31-a39b-b05bc966d595" aria-controls="audio_rand_id_a7a2a48b-1949-4b31-a39b-b05bc966d595" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
        </button>
        <div <%-locals.desktop?'':'data-click-capture'%> tabindex="0" id="audio_rand_id_a7a2a48b-1949-4b31-a39b-b05bc966d595" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="bottom">
          <input data-playback data-type="audio" type="text" hidden value="1" name="audio_rand_id_931bdea0-2d31-4aaa-82c8-610e098b69d8" id="audio_rand_id_931bdea0-2d31-4aaa-82c8-610e098b69d8">       
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
            0.25
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
            0.5
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
            0.75
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
            1
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
            1.25
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
            1.5
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
            1.75
          </button>
          <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
            2
          </button>
        </div>

      </div>
    </div>
    <%if(locals.desktop){%>
      <div data-placement="left-start" class="tooltip caption" id="audio_rand_id_b56aa4b1-a839-419c-b2dd-c838975622ed" role="tooltip">
        Playback Speed
      </div>
      <div data-placement="top" class="tooltip caption" id="audio_rand_id_69f62c26-bc34-4ebf-9a7e-c629c8868df7" role="tooltip">
        Mute / Unmute Audio
      </div>
      <div data-placement="top" class="tooltip caption" id="audio_rand_id_cc19d313-50c4-4e4c-863c-2628f2e534ec" role="tooltip">
        Closed Captioning
      </div>        
    <%}%>
  </div>
</div>`;
    var new_html = ejs_1.default.render(html, { desktop });
    for (let i = 0; i < arr.length; i++) {
        const regex = new RegExp(arr[i], 'g');
        new_html = new_html.replace(regex, `audio_rand_id_${node_crypto_1.default.randomUUID()}`);
    }
    return new_html;
}
exports.getTestAudioHTML = getTestAudioHTML;
function getTestVideoHTML(req) {
    var _a;
    const desktop = typeof req === "boolean" ? req : Boolean((_a = req === null || req === void 0 ? void 0 : req.session.device) === null || _a === void 0 ? void 0 : _a.desktop);
    const arr = [
        "video_rand_id_ed61a36c-8255-4acc-a66e-dab3c1cef46b",
        "video_rand_id_3cb636f3-b319-4b76-9312-37df5a0397a4",
        "video_rand_id_f48b5251-cae4-4d37-a8d8-98c29e5246ba",
        "video_rand_id_d6391111-3c66-4181-b5b7-fe7e0ab9d978",
        "video_rand_id_462706f4-4327-4aaf-9c6f-86032049458c",
        "video_rand_id_4b5a133d-3022-45ce-a665-5e65b640b50f",
        "video_rand_id_9bc3a86b-0e46-4aac-bb8a-7bbb449fbbb2",
    ];
    const html = `<div class="video-wrapper" data-video-wrapper style="margin: 10px 0px;">
  <div class="video" data-fullscreen="false" data-focus="false" data-hover="false">
  <video height="400" data-height="400" data-play-through="false" playsinline="" webkit-playsinline="" data-src="https://video.storething.org/frankmbrown/frankmbrown/645de1c8-64e1-41ba-85f7-0a751e701e16.mp4" preload="metadata" poster="https://image.storething.org/frankmbrown/645de1c8-64e1-41ba-85f7-0a751e701e16.png" data-should-play="true" data-resume="true">
    <track default kind="captions" src="/vtt/video/645de1c8-64e1-41ba-85f7-0a751e701e16" srclang="en">
    <source src="https://video.storething.org/frankmbrown/frankmbrown/645de1c8-64e1-41ba-85f7-0a751e701e16.mp4" type="video/mp4"><source src="https://video.storething.org/frankmbrown/645de1c8-64e1-41ba-85f7-0a751e701e16.libvpx.webm" type="video/webm"><source src="https://video.storething.org/frankmbrown/645de1c8-64e1-41ba-85f7-0a751e701e16.libx264.mp4" type="video/mp4">
  </video>

    <div class="video-controls">
      <div class="block">
        <input data-time data-type="video" type="range" id="video_rand_id_ed61a36c-8255-4acc-a66e-dab3c1cef46b" name="video_rand_id_ed61a36c-8255-4acc-a66e-dab3c1cef46b" class="video small primary" min="0" value="0" max="422" data-time-set="true" step="1" style="background-size: 0% 100%;">
      </div>
      <div class="flex-row justify-begin align-center gap-2 p-sm" style="padding-top:0px;" data-row-2>
        <div class="flex-row align-center justify-center grow-0" data-main-controls>
          <button data-play data-type="video" aria-hidden="true" class="icon large" type="button" aria-label="Play Audio">
            <svg focusable="false" inert viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg>
          </button>
          <button data-pause data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Pause Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          </button>
          <button data-replay data-type="video" hidden aria-hidden="true" class="icon large" type="button" aria-label="Replay Audio">
            <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Replay"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>
          </button>
          <div data-load data-type="video" hidden class="t-tsecondary">
            <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
          </div>
          <svg data-error data-type="video" hidden class="h6 t-error p-md" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Report"><path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"></path></svg>
        </div>
        <div <%-locals.desktop?'data-popover data-mouse data-pelem="#video_rand_id_3cb636f3-b319-4b76-9312-37df5a0397a4" aria-describedby="video_rand_id_3cb636f3-b319-4b76-9312-37df5a0397a4"':''%>>
          <button data-mute-button data-type="video" class="icon medium" aria-label="Mute / Unmute Audio" title="Mute / Unmute Audio" type="button">
            <svg data-type="sound-up" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeUp"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
            <svg hidden data-type="sound-down" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeDown"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"></path></svg>
            <svg hidden data-type="muted" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="VolumeOff"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"></path></svg>
          </button>
        </div>
        <%if(locals.desktop){%>
          <input class="small secondary" data-sound data-type="video" id="video_rand_id_f48b5251-cae4-4d37-a8d8-98c29e5246ba" name="video_rand_id_f48b5251-cae4-4d37-a8d8-98c29e5246ba" type="range" value="100" min="0" max="100" step="1" style="background-size: 100% 100%;">
          <output for="video_rand_id_f48b5251-cae4-4d37-a8d8-98c29e5246ba" hidden>100</output>
        <%}else{%>
          <div class="grow-1"></div>
        <%}%>

        <div class="video-time-left">
          <span data-ellapsed>0:00</span>
          /
          <span data-remaining>0:00</span>
        </div>
        <button data-closed-captions type="button" class="icon medium" aria-label="Closed Captioning" <%-locals.desktop?'data-popover data-pelem="#video_rand_id_9bc3a86b-0e46-4aac-bb8a-7bbb449fbbb2" data-mouse':''%>>
          <svg data-on hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaption"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
          <svg data-off focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ClosedCaptionOff"><path d="M19.5 5.5v13h-15v-13h15zM19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"></path></svg>
        </button>
        <div <%-locals.desktop?'data-popover data-mouse data-pelem="#video_rand_id_d6391111-3c66-4181-b5b7-fe7e0ab9d978" aria-describedby="video_rand_id_d6391111-3c66-4181-b5b7-fe7e0ab9d978"':''%>>
          <div class="select" aria-label="Sound Playback Speed Select">
            <button <%-locals.desktop?'':'data-force-close'%> class="icon medium select auto-w" aria-label="Playback Speed" title="Playback Speed" data-popover data-click data-pelem="#video_rand_id_462706f4-4327-4aaf-9c6f-86032049458c" aria-controls="video_rand_id_462706f4-4327-4aaf-9c6f-86032049458c" aria-haspopup="listbox" aria-expanded="false" role="combobox" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Speed"><path d="m20.38 8.57-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"></path></svg>
            </button>
            <div <%-locals.desktop?'':'data-click-capture'%> tabindex="0" id="video_rand_id_462706f4-4327-4aaf-9c6f-86032049458c" role="listbox" class="select-menu o-sm" style="width: 50px;" data-placement="top">
              <input data-playback data-type="video" type="text" hidden value="1" name="video_rand_id_4b5a133d-3022-45ce-a665-5e65b640b50f" id="video_rand_id_4b5a133d-3022-45ce-a665-5e65b640b50f">     
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.25" type="button">
                0.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.5" type="button">
                0.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="0.75" type="button">
                0.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="true" data-val="1" type="button">
                1
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.25" type="button">
                1.25
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.5" type="button">
                1.5
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="1.75" type="button">
                1.75
              </button>
              <button tabindex="-1" class="select-option body2" role="option" aria-selected="false" data-val="2" type="button">
                2
              </button>
            </div>
            <%if(locals.desktop){%>
              <div data-placement="top" class="tooltip caption" id="video_rand_id_3cb636f3-b319-4b76-9312-37df5a0397a4" role="tooltip">
                Mute / Unmute Audio
              </div>
              <div data-placement="left-start" class="tooltip caption" id="video_rand_id_d6391111-3c66-4181-b5b7-fe7e0ab9d978" role="tooltip">
                Playback Speed
              </div>
              <div data-placement="top" class="tooltip caption" id="video_rand_id_9bc3a86b-0e46-4aac-bb8a-7bbb449fbbb2" role="tooltip">
                Closed Captions
              </div>
            <%}%>
          </div>
        </div>
        <button class="icon medium" data-fullscreen type="button">
          <svg data-type="fullscreen" focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenSharp"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>
          <svg data-type="no-fullscreen" hidden focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FullscreenExit"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>
        </button>
      </div>
    </div>
  </div>
  <div class="video-info">
    <p class="bold h4">
      Test Video
    </p>
    <p class="body1">
      Test your speakers and headphones for common problems. KEEP VOLUME LOW. Audio signals (whether test signals or music) can cause hearing loss or speaker/amplifier damage even if you cannot hear them!  NEVER troubleshoot while wearing headphones.
    </p>
  </div>
</div>`;
    var new_html = ejs_1.default.render(html, { desktop });
    for (let i = 0; i < arr.length; i++) {
        const regex = new RegExp(arr[i], 'g');
        new_html = new_html.replace(regex, `"video_rand_id_${node_crypto_1.default.randomUUID()}`);
    }
    return new_html;
}
exports.getTestVideoHTML = getTestVideoHTML;
/* -------------------------------------- Get Data About ffmpeg ------------------ */
async function getFfmpegInfo() {
    const pathToOutDir = path_1.default.resolve(__dirname, 'ffmpeg-info');
    await new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.availableCodecs(async (error, info) => {
            const pathToOutFile = path_1.default.resolve(pathToOutDir, 'available-codecs.json');
            await node_fs_1.default.promises.writeFile(pathToOutFile, JSON.stringify(info, null, ' '));
            resolve(true);
        });
    });
    await new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.availableEncoders(async (error, info) => {
            const pathToOutFile = path_1.default.resolve(pathToOutDir, 'available-encoders.json');
            await node_fs_1.default.promises.writeFile(pathToOutFile, JSON.stringify(info, null, ' '));
            resolve(true);
        });
    });
    await new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.availableFilters(async (error, info) => {
            const pathToOutFile = path_1.default.resolve(pathToOutDir, 'available-filters.json');
            await node_fs_1.default.promises.writeFile(pathToOutFile, JSON.stringify(info, null, ' '));
            resolve(true);
        });
    });
    await new Promise((resolve, reject) => {
        fluent_ffmpeg_1.default.availableFormats(async (error, info) => {
            const pathToOutFile = path_1.default.resolve(pathToOutDir, 'available-formats.json');
            await node_fs_1.default.promises.writeFile(pathToOutFile, JSON.stringify(info, null, ' '));
            resolve(true);
        });
    });
}
exports.getFfmpegInfo = getFfmpegInfo;
/**
 * This function should be called after ImageUploadComplete (or whatever) by AWS lambda function
 * @param req
 * @param res
 */
async function afterImageHasBeenUploadedLambda(req, res) {
    try {
        const authorization = req.headers['authorization'];
        // Check if the header is present
        if (!authorization) {
            return res.status(401).send("Unable to find API key in request.");
        }
        // Extract the Bearer token
        const token = authorization.split(' ')[1];
        // Check if token is present
        if (!token) {
            return res.status(401).send("Invalid API key.");
        }
        if (token !== env_1.default.LAMBDA_API_KEY) {
            return res.status(401).send("Invalid API key.");
        }
        const img_url = req.body['img_url'];
        if (typeof img_url !== 'string' || !!!img_url.startsWith('https://image.storething.org')) {
            return res.status(400).send("`img_url` query parameter must be valid.");
        }
        const user_id = req.body['user_id'];
        if (typeof user_id !== 'number' && user_id !== null) {
            return res.status(400).send("`user_id` query parameter must be an integer or null.");
        }
        const ip_id = req.body['ip_id'];
        if (!!!Number.isInteger(parseInt(ip_id))) {
            return res.status(400).send("`ip_id` query parameter must be an integer.");
        }
        const user_caption = req.body['user_caption'];
        const caption = typeof user_caption === "string" ? user_caption : undefined;
        res.status(200).send("Successfully received request.");
        await addImageToDatabase(img_url, user_id, ip_id, caption);
        return;
    }
    catch (e) {
        console.error(e);
        if (res.headersSent)
            return;
        else
            return res.status(500).send("Something went wrong inserting image to the database.");
    }
}
exports.afterImageHasBeenUploadedLambda = afterImageHasBeenUploadedLambda;
/* -------------------------------------- Upload Audio To Database ------------------ */
async function uploadAudioToDatabase(url, other_urls, audioData, auth_obj) {
    const db_connection = await (0, database_1.default)().connect();
    const { user_id, ip_id } = auth_obj;
    try {
        await db_connection.query('BEGIN;');
        const resp = await db_connection.query(`INSERT INTO audio (user_id,ip_id,audio_url,other_audio_urls) VALUES ($1,$2,$3,$4) RETURNING id;`, [user_id, ip_id, url, other_urls]);
        const audio_id = resp.rows[0].id;
        if (!!!Number.isInteger(audio_id)) {
            throw new Error("Something went wrong inserting the audio into the `audio` table.");
        }
        const { audio_format, audio_format_long, size, duration, start_time, bit_rate, num_streams, probe_score, tags, streams } = audioData;
        db_connection.query(`INSERT INTO audio_data (audio_id,audio_format,audio_format_long,size,duration,start_time,bit_rate,num_streams,probe_score,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`, [audio_id, audio_format, audio_format_long, size, duration, start_time, bit_rate, num_streams, probe_score, tags]);
        for (let stream of streams) {
            const { codec_name, codec_name_long, codec_type, codec_time_base, sample_rate, channels, start_time, duration, bit_rate } = stream;
            db_connection.query(`INSERT INTO audio_streams (audio_id,codec_name,codec_name_long,codec_type,codec_time_base,sample_rate,channels,start_time,duration,bit_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`, [audio_id, codec_name, codec_name_long, codec_type, codec_time_base, sample_rate, channels, start_time, duration, bit_rate]);
        }
        await db_connection.query('COMMIT;');
        db_connection.release();
        return;
    }
    catch (e) {
        console.error(e);
        try {
            await db_connection.query('ROLLBACK;');
        }
        catch (e) { }
        db_connection.release();
        throw Error("Something went wrong uploading audio to database.");
    }
}
exports.uploadAudioToDatabase = uploadAudioToDatabase;
async function afterAudioTranscriptionComplete(req, res) {
    try {
        // check valid request
        const authorization = req.headers['authorization'];
        // Check if the header is present
        if (!authorization) {
            return res.status(401).send("Unable to find API key in request.");
        }
        // Extract the Bearer token
        const token = authorization.split(' ')[1];
        // Check if token is present
        if (!token) {
            return res.status(401).send("Invalid API key.");
        }
        if (token !== env_1.default.LAMBDA_API_KEY) {
            return res.status(401).send("Invalid API key.");
        }
        const { TranscriptFileUri, AudioKey } = req.body;
        if (typeof TranscriptFileUri !== 'string' || typeof AudioKey !== 'string') {
            return res.status(400).send("Unable to find required body parameters.");
        }
        res.status(200).send("Successfully received request.");
        // async
        const url = `https://audio.storething.org/${AudioKey}`;
        const audio_id_req = await (0, database_1.default)().query(`SELECT id FROM audio WHERE audio_url=$1;`, [url]);
        const audio_id = audio_id_req.rows[0].id;
        if (!!!Number.isInteger(audio_id)) {
            throw new Error("Unable to get audio id from databased for url: ".concat(url));
        }
        const transcriptFileKey = TranscriptFileUri.replace('https://s3.us-east-1.amazonaws.com/ingress-audio/', '').replace('.json', '.vtt');
        const resp = await (0, aws_implementation_1.getVttObject)(transcriptFileKey, 'audio');
        const body = resp.Body;
        if (!!!body)
            throw new Error("Unable to get body from VTT object.");
        const vtt = await body.transformToString('utf-8');
        const vttFileSplit = [];
        var curr = 0;
        while (curr < vtt.length) {
            vttFileSplit.push(vtt.slice(curr, curr + 4000));
        }
        const embeddingPromiseArr = [];
        for (let s of vttFileSplit) {
            embeddingPromiseArr.push((0, ai_1.createEmbedding)(s, 'text-embedding-ada-002'));
        }
        const promiseArr = [];
        for (let s of vttFileSplit) {
            promiseArr.push((0, ai_1.moderateOpenAI)(s));
        }
        const [promiseArr2, embedding_resp] = await Promise.all([Promise.all(promiseArr), Promise.all(embeddingPromiseArr)]);
        const moderationParsed = [];
        for (let moderation of promiseArr2) {
            moderationParsed.push((0, ai_1.parseOpenAIModerationResponse)(moderation));
        }
        const query = (0, handleArticleData_1.GET_INSERT_INTO_MODERATION_TABLE)('audio_transcription_moderation', 'audio_id');
        const promiseArrFinal = [];
        const db = (0, database_1.default)();
        promiseArrFinal.push(db.query(`INSERT INTO audio_transcription (video_id,transcription_text,transcription_vtt) VALUES ($1,$2,$3);`, [audio_id, vtt, vtt]));
        for (let parsedResp of moderationParsed) {
            promiseArrFinal.push(db.query(query, [audio_id].concat(parsedResp)));
        }
        for (let embedding of embedding_resp) {
            promiseArrFinal.push(db.query(`INSERT INTO audio_transcription_embeddings (audio_id,embedding) VALUES ($1,$2);`, [audio_id, pgvector_1.default.toSql(embedding)]));
        }
        await Promise.all(promiseArrFinal);
        return;
    }
    catch (e) {
        console.error(e);
        console.error("SOMETHING WENT WRONG WITH LAMBDA AFTER AUDIO FILE.");
        return;
    }
}
exports.afterAudioTranscriptionComplete = afterAudioTranscriptionComplete;
/* -------------------------------------- Upload Video To Database ------------------ */
async function uploadVideoToDatabase(url, other_urls, videoData, auth_obj) {
    const db_connection = await (0, database_1.default)().connect();
    try {
        await db_connection.query('BEGIN;');
        const { user_id, ip_id } = auth_obj;
        const resp = await db_connection.query(`INSERT INTO video (user_id,ip_id,video_url,other_video_urls) VALUES ($1,$2,$3,$4) RETURNING id;`, [user_id, ip_id, url, other_urls]);
        const video_id = resp.rows[0].id;
        if (!!!Number.isInteger(video_id)) {
            throw new Error("Something went wrong inserting the video into the `video` table.");
        }
        const { video_format, video_format_long, size, duration, start_time, bit_rate, num_streams, probe_score, tags, width, height, audio_codec, video_codec, streams } = videoData;
        db_connection.query(`INSERT INTO video_data (video_id,video_format,video_format_long,size,duration,start_time,bit_rate,num_streams,probe_score,tags,width,height,audio_codec,video_codec) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);`, [video_id, video_format, video_format_long, size, duration, start_time, bit_rate, num_streams, probe_score, tags, width, height, audio_codec, video_codec]);
        for (let stream of streams) {
            const { codec_name, codec_name_long, profile, codec_type, codec_time_base, width, height, coded_width, coded_height, display_aspect_ratio, display_aspect_ratio_height, display_aspect_ratio_width, r_frame_rate, avg_frame_rate, time_base, frames, start_time, duration, bit_rate } = stream;
            db_connection.query(`INSERT INTO video_streams (video_id,codec_name,codec_name_long,profile,codec_type,codec_time_base,width,height,coded_width,coded_height,display_aspect_ratio,display_aspect_ratio_height,display_aspect_ratio_width,r_frame_rate,avg_frame_rate,time_base,frames,start_time,duration,bit_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20);`, [video_id, codec_name, codec_name_long, profile, codec_type, codec_time_base, width, height, coded_width, coded_height, display_aspect_ratio, display_aspect_ratio_height, display_aspect_ratio_width, r_frame_rate, avg_frame_rate, time_base, frames, start_time, duration, bit_rate]);
        }
        await db_connection.query('COMMIT;');
        db_connection.release();
    }
    catch (e) {
        console.error(e);
        try {
            await db_connection.query('ROLLBACK;');
        }
        catch (e) { }
        db_connection.release();
        throw Error("Something went wrong uploading video to database.");
    }
}
exports.uploadVideoToDatabase = uploadVideoToDatabase;
async function afterVideoTranscriptionComplete(req, res) {
    try {
        // check valid request
        const authorization = req.headers['authorization'];
        // Check if the header is present
        if (!authorization) {
            return res.status(401).send("Unable to find API key in request.");
        }
        // Extract the Bearer token
        const token = authorization.split(' ')[1];
        // Check if token is present
        if (!token) {
            return res.status(401).send("Invalid API key.");
        }
        if (token !== env_1.default.LAMBDA_API_KEY) {
            return res.status(401).send("Invalid API key.");
        }
        const { TranscriptFileUri, VideoKey } = req.body;
        if (typeof TranscriptFileUri !== 'string' || typeof VideoKey !== 'string') {
            return res.status(400).send("Unable to find required body parameters.");
        }
        res.status(200).send("Successfully received request.");
        // async
        const url = `https://video.storething.org/${VideoKey}`;
        const video_id_req = await (0, database_1.default)().query(`SELECT id FROM video WHERE video_url=$1;`, [url]);
        const video_id = video_id_req.rows[0].id;
        if (!!!Number.isInteger(video_id)) {
            throw new Error("Unable to get video id from databased for url: ".concat(url));
        }
        const transcriptFileKey = TranscriptFileUri.replace('https://s3.us-east-1.amazonaws.com/ingress-video/', '').replace('.json', '.vtt');
        const resp = await (0, aws_implementation_1.getVttObject)(transcriptFileKey, 'video');
        const body = resp.Body;
        if (!!!body)
            throw new Error("Unable to get body from VTT object.");
        const vtt = await body.transformToString('utf-8');
        const vttFileSplit = [];
        var curr = 0;
        while (curr < vtt.length) {
            vttFileSplit.push(vtt.slice(curr, curr + 4000));
        }
        const embeddingPromiseArr = [];
        for (let s of vttFileSplit) {
            embeddingPromiseArr.push((0, ai_1.createEmbedding)(s, 'text-embedding-ada-002'));
        }
        const promiseArr = [];
        for (let s of vttFileSplit) {
            promiseArr.push((0, ai_1.moderateOpenAI)(s));
        }
        const [promiseArr2, embedding_resp] = await Promise.all([Promise.all(promiseArr), Promise.all(embeddingPromiseArr)]);
        const moderationParsed = [];
        for (let moderation of promiseArr2) {
            moderationParsed.push((0, ai_1.parseOpenAIModerationResponse)(moderation));
        }
        const query = (0, handleArticleData_1.GET_INSERT_INTO_MODERATION_TABLE)('video_transcription_moderation', 'video_id');
        const promiseArrFinal = [];
        const db = (0, database_1.default)();
        promiseArrFinal.push(db.query(`INSERT INTO video_transcription (video_id,transcription_text,transcription_vtt) VALUES ($1,$2,$3);`, [video_id, vtt, vtt]));
        for (let parsedResp of moderationParsed) {
            promiseArrFinal.push(db.query(query, [video_id].concat(parsedResp)));
        }
        for (let embedding of embedding_resp) {
            promiseArrFinal.push(db.query(`INSERT INTO video_transcription_embeddings (video_id,embedding) VALUES ($1,$2);`, [video_id, pgvector_1.default.toSql(embedding)]));
        }
        await Promise.all(promiseArrFinal);
        // handle individual video frames
        return;
    }
    catch (e) {
        console.error(e);
        console.error("SOMETHING WENT WRONG WITH LAMBDA AFTER VIDEO FILE.");
        return;
    }
}
exports.afterVideoTranscriptionComplete = afterVideoTranscriptionComplete;
/* -------------------------------------- Upload Image To Database ------------------ */
async function addImageToDatabase(img_url, user_id, ip_id, user_caption) {
    if (!!!img_url.startsWith('https://image.storething.org'))
        throw new Error("Image URL of buffer must be provided to add image to database.");
    const buffer = await (0, image_1.getImageFromUrl)(img_url);
    const base_64_string = buffer.toString('base64');
    const parsedImageDataArr = await getImageMetadata(buffer);
    const uploadImgArr = [];
    if (parsedImageDataArr.length > 1) {
        for (let i = 0; i < parsedImageDataArr.length; i++) {
            const img = parsedImageDataArr[i].image;
            if (img) {
                const base_64 = img.toString('base64');
                const resp = await (0, projects_1.postToPythonBackend)('/python/user-uploaded-image', { image: base_64, safe_search: true, caption: true, embedding: true }, 10000);
                const embedding = resp.embedding;
                const ai_caption = resp.caption;
                const nsfw = Math.round(Number(resp.safe_search.filter((obj) => obj.label === "nsfw")[0].score.toFixed(2)) * 100);
                const normal = Math.round(Number(resp.safe_search.filter((obj) => obj.label === "normal")[0].score.toFixed(2)) * 100);
                uploadImgArr.push({ embedding, ai_caption, nsfw, normal, parsedData: parsedImageDataArr[i] });
            }
        }
    }
    else {
        const resp = await (0, projects_1.postToPythonBackend)('/python/user-uploaded-image', { image: base_64_string, safe_search: true, caption: true, embedding: true }, 10000);
        const embedding = resp.embedding;
        const ai_caption = resp.caption;
        const nsfw = Math.round(Number(resp.safe_search.filter((obj) => obj.label === "nsfw")[0].score.toFixed(2)) * 100);
        const normal = Math.round(Number(resp.safe_search.filter((obj) => obj.label === "normal")[0].score.toFixed(2)) * 100);
        uploadImgArr.push({ embedding, ai_caption, nsfw, normal, parsedData: parsedImageDataArr[0] });
    }
    const db_connection = await (0, database_1.default)().connect();
    try {
        await db_connection.query('BEGIN;');
        const resp = await db_connection.query(`INSERT INTO images (user_id, image_url,ip_id) VALUES ($1,$2,$3) RETURNING id;`, [user_id, img_url, ip_id]);
        const id = resp.rows[0].id;
        if (!!!Number.isInteger(id))
            throw new Error("Unable to get image id from inserting user image.");
        for (let i = 0; i < uploadImgArr.length; i++) {
            const { normal, nsfw, embedding, ai_caption, parsedData } = uploadImgArr[i];
            db_connection.query(`INSERT INTO image_nsfw (image_id,normal,nsfw) VALUES ($1,$2,$3);`, [id, normal, nsfw]);
            db_connection.query(`INSERT INTO image_embeddings (image_id,embedding) VALUES ($1,$2);`, [id, pgvector_1.default.toSql(embedding)]);
            db_connection.query(`INSERT INTO image_captions (image_id,user_caption,ai_caption) VALUES ($1,$2,$3);`, [id, user_caption, ai_caption]);
            const { format, mimetype, width, height, color_space, type, depth, channels, alpha, gamma, matte_color, background_color, border_color, transparent_color, compression, oritentation, date_created, date_modified, tainted, size, number_pixels, ellapsed_milliseconds, color } = parsedData;
            db_connection.query(exports.INSERT_INTO_IMAGE_DATA, [id, format, mimetype, width, height, color_space, type, depth, channels, alpha, gamma, matte_color, background_color, border_color, transparent_color, compression, oritentation, date_created, date_modified, tainted, size, number_pixels, ellapsed_milliseconds, color, i]);
        }
        await db_connection.query('COMMIT;');
        db_connection.release();
        return Math.max(...uploadImgArr.map((obj) => obj.nsfw));
    }
    catch (e) {
        console.error(e);
        try {
            await db_connection.query('ROLLBACK;');
        }
        catch (e) { }
        db_connection.release();
        throw new Error("Something went wrong inserting image into database.");
    }
}
exports.addImageToDatabase = addImageToDatabase;
/**
 * Handle when user uploads image. Returns the percentage out of 100 that the image is nsfw. You should reject if the chance is greater than 50.
 * @param imageobj image_url should be the URL of the image, caption should be alt + [data-text] attribute
 */
async function handleUserUploadedImage(userID, ip_id, imageobj) {
    try {
        const query = `WITH nsfw AS (
	SELECT max(image_nsfw.nsfw) max_nsfw, images.id image_id 
	FROM images 
	JOIN image_nsfw ON 
	images.id=image_nsfw.image_id
	WHERE images.image_url=$1 
	GROUP BY images.id -- "ensure aggregation works properly" - ChatGPT
) UPDATE image_captions SET user_caption=$2 
FROM nsfw
WHERE image_captions.image_id=nsfw.image_id
RETURNING nsfw.max_nsfw nsfw, nsfw.image_id id;`;
        const resp = await (0, database_1.default)().query(query, [imageobj.url, imageobj.caption]);
        if (resp.rows.length) {
            const nsfw = resp.rows[0].nsfw;
            if (!!!Number.isInteger(resp.rows[0].id)) {
                return -1;
            }
            return nsfw;
        }
        else {
            return -1;
        }
    }
    catch (e) {
        console.error(e);
        throw new Error("Something went wrong handling the user uploaded image.");
    }
}
exports.handleUserUploadedImage = handleUserUploadedImage;
/**
 * @returns Same amount of elements as input
 */
async function getImagesInformationLexical(imageUrls) {
    const query = `WITH updated_caption AS (
    UPDATE image_captions SET user_caption=$2
    FROM images 
    WHERE images.id=image_captions.image_id AND images.image_url=$1
  ) SELECT images.id id, images.image_url url, image_data.width width, image_data.height height, image_nsfw.normal normal, image_nsfw.nsfw nsfw, image_captions.ai_caption ai_caption FROM images LEFT JOIN image_data ON images.id=image_data.image_id LEFT JOIN image_nsfw ON images.id=image_nsfw.image_id  LEFT JOIN image_captions ON images.id=image_captions.image_id WHERE images.image_url=$1 ORDER BY image_nsfw DESC NULLS LAST;`;
    const promiseArr1 = [];
    const db = (0, database_1.default)();
    for (let obj of imageUrls) {
        promiseArr1.push(db.query(query, [obj.url, obj.caption || null]));
    }
    const resp = (await Promise.all(promiseArr1)).map((obj) => (obj === null || obj === void 0 ? void 0 : obj.rows[0]) || null);
    return resp;
}
exports.getImagesInformationLexical = getImagesInformationLexical;
/**
 * @returns Same amount of elements as input
 */
async function getAudioInformationLexical(audioURLs) {
    const query = `SELECT audio.audio_url url, audio_transcription.transcription_text text, audio_transcription_moderation.flagged flagged FROM audio LEFT JOIN audio_transcription ON audio_transcription.audio_id=audio.id LEFT JOIN audio_transcription_moderation ON audio_transcription_moderation.audio_id=audio.id WHERE audio.audio_url=$1 ORDER BY audio_transcription_moderation.flagged DESC NULLS LAST;`;
    const db = (0, database_1.default)();
    const promiseArr1 = [];
    for (let audio_url of audioURLs) {
        promiseArr1.push(db.query(query, [audio_url]));
    }
    const resp = (await Promise.all(promiseArr1)).map((obj) => (obj === null || obj === void 0 ? void 0 : obj.rows[0]) || null);
    return resp;
}
exports.getAudioInformationLexical = getAudioInformationLexical;
/**
 *
 */
async function getVideoInformationLexical(videoURLs) {
    const query = `SELECT video.video_url url, video_transcription.transcription_text text, video_data.height height, video_data.width width, video_transcription_moderation.flagged flagged FROM video LEFT JOIN video_data ON video.id=video_data.video_id LEFT JOIN video_transcription ON video_transcription.video_id=video.id LEFT JOIN video_transcription_moderation ON video_transcription_moderation.video_id=video.id WHERE video.video_url=$1 ORDER BY video_transcription_moderation.flagged DESC NULLS LAST;`;
    const db = (0, database_1.default)();
    const promiseArr1 = [];
    for (let video_url of videoURLs) {
        promiseArr1.push(db.query(query, [video_url]));
    }
    const resp = (await Promise.all(promiseArr1)).map((obj) => (obj === null || obj === void 0 ? void 0 : obj.rows[0]) || null);
    return resp;
}
exports.getVideoInformationLexical = getVideoInformationLexical;
