const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { parentPort, workerData } = require('worker_threads');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const { pathToFile } = workerData;

ffmpeg(pathToFile)
.ffprobe((err,data)=> {
  if (err) throw new Error(err);
  else {
    parentPort?.postMessage({ ffmpegData: JSON.stringify(data) });
  }
})