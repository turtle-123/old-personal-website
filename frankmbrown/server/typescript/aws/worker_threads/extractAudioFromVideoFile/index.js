const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { parentPort, workerData } = require('worker_threads');
const path = require('node:path');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const { pathToInputFile, name } = workerData;

ffmpeg(pathToInputFile)
.on('end',() => {
  parentPort?.postMessage(true);
})
.on('error',(err) => {
  console.error(err);
  throw new Error("Something went wrong extracting the audio from the ");
})
.output(path.resolve('..','..','temp-audio',`${name}.mp3`))
.addOption('-vn')
.run();