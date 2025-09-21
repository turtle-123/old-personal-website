const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const { parentPort, workerData } = require('worker_threads');
const path = require('node:path');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);
const { pathToInputFile, arr, name, height, singleFilePath } = workerData;


const command = ffmpeg(pathToInputFile)
.on('error', function(err, stdout, stderr) {
  console.error(`Cannot process video ${name}. Error: ` + err.message);
  throw new Error('Something went wrong transcoding the video file.');
})
.on('end',async () => {
  parentPort?.postMessage("success")
});
if (arr.length) {
  for (let obj of arr) {
    command
    .output(path.resolve(__dirname,'..','..','temp-video',`${name}.${obj.videoCodec}.${obj.extension}`))
    command
    .videoCodec(obj.videoCodec)
    if (obj.audioCodec) {
      command.audioCodec(obj.audioCodec);
    }
    if (height) {
      command.size(`?x${height}`).autopad();
    }
  }
} else if (singleFilePath) {
  command
  .output(singleFilePath)
  if (height) {
    command.size(`?x${height}`).autopad();
  }
}
command.run();