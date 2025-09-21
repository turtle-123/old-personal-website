const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { parentPort, workerData } = require('worker_threads');
const path = require('node:path');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const { pathToInputFile, arr, name } = workerData;

const command = ffmpeg(pathToInputFile)
.on('error', function(err, stdout, stderr) {
  console.error(`Cannot process audio ${name}. Error: ` + err.message);
  throw new Error('Something went wrong transcoding the audio file.');
})
.on('end',async () => {
  parentPort?.postMessage(true);
});
for (let obj of arr) {
  command
  .output(path.resolve(__dirname,'..','..','temp-audio',`${name}.${obj.audioCodec}.${obj.extension}`))
  .audioCodec(obj.audioCodec)
}
command.run();