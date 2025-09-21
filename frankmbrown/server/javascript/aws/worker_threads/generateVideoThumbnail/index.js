"use strict";
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { parentPort, workerData } = require('worker_threads');
const path = require('node:path');
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const { pathToInputFile, name, height } = workerData;
ffmpeg(pathToInputFile)
    .on('end', () => {
    parentPort === null || parentPort === void 0 ? void 0 : parentPort.postMessage(true);
})
    .on('error', (err) => {
    console.error(err);
    throw new Error('Something went wrong generating the video thumbnail.');
})
    .screenshots({
    count: 1,
    folder: path.resolve(__dirname, '..', '..', 'temp-image'),
    filename: `${name}-thumbnail.png`,
    size: `?x${height}`,
    timemarks: ['00:00'],
    timestamps: ['00:01']
});
