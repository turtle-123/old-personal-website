import axios from 'axios';
import { execute, tryRemoveFile, getOS, executeWithArgument } from "./cmd";
import {spawn} from 'node:child_process';
import getDatabase from '../database';
import { uploadImageObject } from '../aws/aws-implementation';

// https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback

/**
 * @returns gm or magick - command to access imagemagick
 */
export const getMagick = () => (getOS()==="windows") ? 'magick' : 'magick';

/**
 * These options should come after defining -extent
 */
export const RESIZE_OPTIONS_BEFORE = ['-filter','Triangle','-define','filter:support=2','-unsharp','0.25x0.08+8.3+0.045','-dither','None','-posterize','136','-quality','82','-define','jpeg:fancy-upsampling=off','-define','png:compression-filter=5','-define','png:compression-level=9','-define','png:compression-strategy=1','-define','png:exclude-chunk=all','-interlace','none','-colorspace','sRGB'] as const;

/**
 * - Given the url to a profile picture, create the profile picture
 * - The URL should be in the format below.
 * - Returns a 200x200 circular image with transparent background that is a jpg
 * @param url url of the image https://image.storething.org/frankmbrown/${image_name}
 */
export async function createProfilePicture(url:string|Buffer) {
  var base64: Buffer;
  if (typeof url==="string") {
    base64 = await getImageFromUrl(url);
  } else {
    base64 = url;
  }
  // First ImageMagick command: crop and resize image
  const firstMagick = await executeWithArgument('magick', [
    'convert', '-',
    '-gravity', 'center',
    '-crop', '200x200+0+0',
    '+repage',
    'jpeg:-'
  ],base64);
  const secondMagick = await executeWithArgument('magick', [
      'convert', '-',
      '-alpha', 'set',
      '-background', 'none',
      '-fill', 'white',
      `(`,
      '+clone',
      '-channel', 'A',
      '-evaluate', 'set', '0',
      '+channel',
      '-draw', 'circle 100,100 100,0',
      `)`,
      '-compose', 'dstin',
      '-composite',
      'jpeg:-'
  ],firstMagick);
  return secondMagick;
}

/**
 * Function to generate a random pastel color
 */
function getRandomColor() {
  const colors = [
    "Red",
    "Green",
    "Blue",
    "Magenta",
    "Gray",
    "Orange",
    "Brown",
    "Purple",
    "Pink",
    "DarkGray"
  ];
  return colors[Math.floor(Math.random()*colors.length)];
}

/**
 * Create background image when user did not supply one for profile or community
 * @param username 
 */
export async function createDefaultProfilePicture(username:string) {
  var pathToOutput = '';
  try {
    const size = 200;
    const letter = username[0].toUpperCase();
    const color = getRandomColor(); 
    const font = 'Verdana';
    const command = `magick -size ${size}x${size} xc:none -fill "${color}" -draw "rectangle 0,0 ${size},${size}" -fill white -gravity center -pointsize ${size/2} -font "${font}" -draw "text 0,0 '${letter}'" -define jpeg:extent=4.9MB jpeg:-`
    const stdout = await execute(command,{ cwd: __dirname });
    return { buffer: Buffer.from(stdout), background: color };
  } catch (e:any) {
    console.error(e);
    await tryRemoveFile(pathToOutput);
    throw new Error("Unable to create background image.")
  }
}

/**
 * Returns URL to page image (should be used as #META_OG_IMAGE[content])
 * @param url URL that's like https://image.storething.org/frankmbrown/[KEY]
 */
export function getPageImageUrlFromProfilePicture(url:string) {
  const key = url.replace('https://image.storething.org/frankmbrown/','');
  const name = key.split('.')[0];
  return 'https://image.storething.org/frankmbrown/og-image/'.concat(name).concat('.jpg');
}

/**
 * Returns URL to page image (should be used as #META_OG_IMAGE[content])
 * @param url URL that's like https://image.storething.org/frankmbrown/[KEY]
 */
export function getTwitterImageUrlFromProfilePicture(url:string) {
  const key = url.replace('https://image.storething.org/frankmbrown/','');
  const name = key.split('.')[0];
  return 'https://image.storething.org/frankmbrown/twitter/'.concat(name).concat('.jpg');
}
/**
 * - Create Twitter and LinkedIn images from image
 * - Note: **Make sure to name the image appropriately**
 * @param image 
 * @param extension 
 */
export async function createTwitterAndLinkedInImages(image:Buffer,background?:string) {
  var background_new:string;
  if (!!!background) {
    background_new = await getImageBackgroundColor(image);
  } else {
    background_new = background;
  }
  const [twitter,linkedin] = await Promise.all([
    executeWithArgument(`magick`,['convert','-','-thumbnail', '800x418',...RESIZE_OPTIONS_BEFORE, '-background', background_new, '-gravity', 'center', '-extent', '800x418', 'jpeg:-'],image),
    executeWithArgument(`magick`,['convert','-','-thumbnail','1200x627',...RESIZE_OPTIONS_BEFORE, '-background', background_new, '-gravity', 'center', '-extent', '1200x627', 'jpeg:-'],image)
  ]);
  return { twitter, linkedin }
}
/**
 * Parse output of magick identify
 * @param output 
 * @returns 
 */
function parseIdentifyOutput(output:string) {
  const lines = output.split('\n');
  const imageInfo:any = {};
  for (let i=0;i<lines.length;i++) {
    let line = lines[i].trim();
    if (line==="Image:") continue;
    else if (line==="Channel depth:") {
      i+=1;
      line = lines[i].trim();
      imageInfo["Pixels"] = line.split(':')[1];
      var red = i+2;
      var green = red+9;
      var blue = green+9;
      for (let j = 0; j < 8; j++) {
        const red_line = lines[red].trim().split(':').map((s) => s.trim())
        const green_line = lines[green].trim().split(':').map((s) => s.trim())
        const blue_line = lines[blue].trim().split(':').map((s) => s.trim())
        imageInfo["red".concat(red_line[0])] = red_line[1];
        imageInfo["greem".concat(green_line[0])] = green_line[1];
        imageInfo["blue".concat(blue_line[0])] = blue_line[1];
        red+=1;
        green+=1;
        blue+=1;
      }
    } else if (line==="Channel depth:") {
      i+=1;
      line = lines[i].trim();
      while (/^((Red|Green|Blue)\:)/.test(line)) {
        const line_arr = line.split(':').map((s) => s.trim());
        imageInfo['channel_statistics'.concat(line_arr[0])] = line_arr[1]
        i+=1;
        line = lines[i].trim();
      }
    } else if (line==="Histogram:") {
      imageInfo["Histogram"] = [];
      i+=1;
      line = lines[i].trim();
      while (/^\d+\:\s\(\d+,\d+,\d+\)\s/.test(line) && i < 1000) {
        const a = line.match(/^(?<count>\d+)\:\s\((?<r>\d+),(?<g>\d+),(?<b>\d+)\)\s/);
        if (a&&a.groups) {
          const count = a.groups.count;
          const r = a.groups.r;
          const g = a.groups.g;
          const b = a.groups.b;
          imageInfo["Histogram"].push({ count, r, g, b });
        }
        i+=1;
        line = lines[i].trim();
      }
    } else if (line==="Properties:") {
      i+=1;
      line = lines[i].trim();
      while (true&&i<1000) {
        if (line.startsWith('date:create')) {
          imageInfo["Date Created"] = line.replace('date:create: ','');
          i+=1;
          line = lines[i].trim();
        } else if (line.startsWith('date:modify')) {
          imageInfo["Date Modified"] = line.replace('date:modify: ','');
          i+=1;
          line = lines[i].trim();
        } else if (line.startsWith('date:timestamp')) {
          imageInfo["Date Timestamp"] = line.replace('date:timestamp: ','');
          i+=1;
          line = lines[i].trim();
        } else if (line.startsWith('jpeg:colorspace')) {
          imageInfo["JPEG ColorSpace"] = line.replace('jpeg:colorspace: ','');
          i+=1;
          line = lines[i].trim();
        } else if (line.startsWith('jpeg:sampling-factor')) {
          imageInfo["JPEG Sampling Factor"] = line.replace('jpeg:sampling-factor: ','');
          i+=1;
          line = lines[i].trim();
        } else if (line.startsWith('signature')) {
          imageInfo["Signature"] = line.replace('signature: ','');
          i+=1;
          line = lines[i].trim();
        } else {
          break;
        }
      }
    } else if (line.startsWith('Artifacts:')||line.startsWith('verbose:')) continue; 
    else if (line.startsWith('Version:')) {
      imageInfo["Version"] = line.replace("Version: ",'');
    } else if (line.startsWith("Elapsed time:")) {
      imageInfo["Elapsed time"] = line.replace("Elapsed time: ",'');
    } else if (line==="Chromaticity:") {
      i+=1;
      line = lines[i].trim();
      while (/^((red|green|blue|white)\sprimary\:)/.test(line)) {
        var color = 'red';
        if (line.startsWith('green')) color = 'green';
        else if (line.startsWith('blue')) color = 'blue';
        else if (line.startsWith('white')) color = 'white';
        imageInfo[`chromacity_${color}_primary`] = line.split(':')[1];
        i+=1;
        line = lines[i].trim();
      }
    } else if (line.startsWith('Image statistics:')) {
      i+=2;
      line = lines[i].trim();
      for (let j = 0; j < 7 && !!!line.startsWith('Colors'); j++) {
        const line_arr = line.split(':').map((s) => s.trim());
        imageInfo[line_arr[0]] = line_arr[1]
        i+=1;
        line = lines[i].trim();
      }
    }
    else {
      const line_arr = line.split(':').map((s) => s.trim());
      if (line_arr.length!==2) continue;
      imageInfo[line_arr[0]] = line_arr[1]

    }
  }
  if (Array.isArray(imageInfo["Histogram"])) {
    imageInfo["Histogram"] = JSON.stringify(imageInfo["Histogram"]);
  }
  return imageInfo;
}
/**
 * Get information about image using magick|gm identify and return as flattened object
 * @param image 
 * @returns 
 */
export async function getImageInformation(image:Buffer) {
  const magickProcess = spawn('magick', ['identify', '-verbose', '-']);
  let stdout = '';
  let stderr = '';
 const imageInfo:string = await new Promise((resolve,reject) => {
    // Handle the output of the magick process
    magickProcess.stdout.on('data', (data) => {
      stdout += data.toString('utf-8');
    });
    // Handle any error output
    magickProcess.stderr.on('data', (data) => {
        stderr += data.toString('utf-8');
    });
    magickProcess.on('error',(err) => {
      reject(err);
    })
    // Handle process exit
    magickProcess.on('close', (code) => {
        if (code !== 0) {
            reject(`${stderr}`);
            return;
        }
        // Parse the stdout to JSON
        const imageInfo = parseIdentifyOutput(stdout);
        resolve(JSON.stringify(imageInfo, null, 4));
    });

    // Write the image buffer to the process stdin
    magickProcess.stdin.write(image);
    magickProcess.stdin.end();
 });
 const information = JSON.parse(imageInfo);
 if (/\d+x\d+.*/.test(information["Geometry"])) {
  const matches = information["Geometry"].match(/(?<width>\d+)x(?<height>\d+).*/);
  if (matches&&matches.groups) {
    information["width"] = parseInt(matches.groups.width);
    information["height"] = parseInt(matches.groups.height);
  }
 }
 if (information['Number pixels']) {
  information['Number pixels'] = parseInt(information['Number pixels']);
 }
 if (information['Filesize']) {
  information['Filesize'] = parseInt(information['Filesize']);
 }
 if (information['Tainted']) {
  information['Tainted'] = Boolean(information['Tainted']==="True");
 }
 if (information['Quality']) {
  information['Quality'] = parseInt(information['Quality']);
 }
 if (information['Pixels']) {
  information['Pixels'] = parseInt(information['Pixels']);
 }
 return information as ImageInformationType;
}

/**
 * Get an image from a URL
 * @param url 
 */
export async function getImageFromUrl(url:string) {
  const res = await axios.get(url,{ responseType: "text", responseEncoding: "base64", timeout: 5000 });
  const base64 = Buffer.from(res.data, "base64");
  return base64;
}

type ImageInformationType = {
  width: number|null,
  height: number|null,
  'Base filename': string|null,
  Permissions: string|null,
  Format: string|null,
  'Mime type': string|null,
  Class: string|null,
  Geometry: string|null,
  Resolution: string|null,
  'Print size': string|null,
  Units: string|null,
  Colorspace: string|null,
  Type: string|null,
  'Base type': string|null,
  Endianness: string|null,
  Depth: string|null,
  Channels: string|null,
  Pixels: number|null,
  redBlue: string|null,
  greemkurtosis: string|null,
  bluekurtosis: string|null,
  'redChannel statistics': string|null,
  greemskewness: string|null,
  blueskewness: string|null,
  redPixels: string|null,
  greementropy: string|null,
  blueentropy: string|null,
  redRed: string|null,
  greemGreen: string|null,
  blueBlue: string|null,
  redmin: string|null,
  greemmin: string|null,
  bluemin: string|null,
  redmax: string|null,
  greemmax: string|null,
  bluemax: string|null,
  redmean: string|null,
  greemmean: string|null,
  bluemean: string|null,
  redmedian: string|null,
  greemmedian: string|null,
  bluemedian: string|null,
  Green: string|null,
  Blue: string|null,
  'Channel statistics': string|null,
  Red: string|null,
  min: string|null,
  max: string|null,
  mean: string|null,
  median: string|null,
  'standard deviation': string|null,
  kurtosis: string|null,
  skewness: string|null,
  entropy: string|null,
  'Rendering intent': string|null,
  Gamma: string|null,
  chromacity_red_primary: string|null,
  chromacity_green_primary: string|null,
  chromacity_blue_primary: string|null,
  'Matte color': string|null,
  'Background color': string|null,
  'Border color': string|null,
  'Transparent color': string|null,
  Interlace: string|null,
  Intensity: string|null,
  Compose: string|null,
  'Page geometry': string|null,
  Dispose: string|null,
  Iterations: string|null,
  Compression: string|null,
  Quality: number|null,
  Orientation: string|null,
  'Date Created': string|null,
  'Date Modified': string|null,
  'Date Timestamp': string|null,
  'JPEG ColorSpace': string|null,
  'JPEG Sampling Factor': string|null,
  Signature: string|null,
  Tainted: boolean|null,
  Filesize: number|null,
  'Number pixels': number|null,
  'Pixel cache type': string|null,
  'Pixels per second': string|null,
  'User time': string|null,
  'Elapsed time': string|null,
  Version: string
}

export function getInsertImageIntoImagesTable(url:string,db:ReturnType<typeof getDatabase>,user_id:number,imageInfo:ImageInformationType) {
  const arr = [
    url,
    user_id,
    imageInfo["Base filename"] || null,
    imageInfo["Permissions"] || null,
    imageInfo["Format"] || null,
    imageInfo["Mime type"] || null,
    imageInfo["Class"] || null,
    imageInfo["Geometry"] || null,
    imageInfo["Resolution"] || null,
    imageInfo["Print size"] || null,
    imageInfo["Units"] || null,
    imageInfo["Colorspace"] || null,
    imageInfo["Type"] || null,
    imageInfo["Base type"] || null,
    imageInfo["Endianness"] || null,
    imageInfo["Depth"] || null,
    imageInfo["Channels"] || null,
    imageInfo["Pixels"] || null,
    imageInfo["redBlue"] || null,
    imageInfo["greemkurtosis"] || null,
    imageInfo["bluekurtosis"] || null,
    imageInfo["redChannel statistics"] || null,
    imageInfo["greemskewness"] || null,
    imageInfo["blueskewness"] || null,
    imageInfo["redPixels"] || null,
    imageInfo["greementropy"] || null,
    imageInfo["blueentropy"] || null,
    imageInfo["redRed"] || null,
    imageInfo["greemGreen"] || null,
    imageInfo["blueBlue"] || null,
    imageInfo["redmin"] || null,
    imageInfo["greemmin"] || null,
    imageInfo["bluemin"] || null,
    imageInfo["redmax"] || null,
    imageInfo["greemmax"] || null,
    imageInfo["bluemax"] || null,
    imageInfo["redmean"] || null,
    imageInfo["greemmean"] || null,
    imageInfo["bluemean"] || null,
    imageInfo["redmedian"] || null,
    imageInfo["greemmedian"] || null,
    imageInfo["bluemedian"] || null,
    imageInfo["Green"] || null,
    imageInfo["Blue"] || null,
    imageInfo["Channel statistics"] || null,
    imageInfo["Red"] || null,
    imageInfo["min"] || null,
    imageInfo["max"] || null,
    imageInfo["mean"] || null,
    imageInfo["median"] || null,
    imageInfo["standard deviation"] || null,
    imageInfo["kurtosis"] || null,
    imageInfo["skewness"] || null,
    imageInfo["entropy"] || null,
    imageInfo["Rendering intent"] || null,
    imageInfo["Gamma"] || null,
    imageInfo["chromacity_red_primary"] || null,
    imageInfo["chromacity_green_primary"] || null,
    imageInfo["chromacity_blue_primary"] || null,
    imageInfo["Matte color"] || null,
    imageInfo["Background color"] || null,
    imageInfo["Border color"] || null,
    imageInfo["Transparent color"] || null,
    imageInfo["Interlace"] || null,
    imageInfo["Intensity"] || null,
    imageInfo["Compose"] || null,
    imageInfo["Page geometry"] || null,
    imageInfo["Dispose"] || null,
    imageInfo["Iterations"] || null,
    imageInfo["Compression"] || null,
    imageInfo["Quality"] || null,
    imageInfo["Orientation"] || null,
    imageInfo["Date Created"] || null,
    imageInfo["Date Modified"] || null,
    imageInfo["Date Timestamp"] || null,
    imageInfo["JPEG ColorSpace"] || null,
    imageInfo["JPEG Sampling Factor"] || null,
    imageInfo["Signature"] || null,
    imageInfo["Tainted"] || null,
    imageInfo["Filesize"] || null,
    imageInfo["Number pixels"] || null,
    imageInfo["Pixel cache type"] || null,
    imageInfo["Pixels per second"] || null,
    imageInfo["User time"] || null,
    imageInfo["Elapsed time"] || null,
    imageInfo["Version"] || null,
    imageInfo["width"] || null,
    imageInfo["height"] || null
  ];
  const query = `INSERT INTO images (
  url,
  user_id,
  base_filename,
  permissions,
  format,
  mime_type,
  class,
  geometry,
  resolution,
  print_size,
  units,
  colorspace,
  type,
  base_type,
  endianness,
  depth,
  channels,
  pixels,
  redblue,
  greemkurtosis,
  bluekurtosis,
  redchannel_statistics,
  greemskewness,
  blueskewness,
  redpixels,
  greementropy,
  blueentropy,
  redred,
  greemgreen,
  blueblue,
  redmin,
  greemmin,
  bluemin,
  redmax,
  greemmax,
  bluemax,
  redmean,
  greemmean,
  bluemean,
  redmedian,
  greemmedian,
  bluemedian,
  green,
  blue,
  channel_statistics,
  red,
  min,
  max,
  mean,
  median,
  standard_deviation,
  kurtosis,
  skewness,
  entropy,
  rendering_intent,
  gamma,
  chromacity_red_primary,
  chromacity_green_primary,
  chromacity_blue_primary,
  matte_color,
  background_color,
  border_color,
  transparent_color,
  interlace,
  intensity,
  compose,
  page_geometry,
  dispose,
  iterations,
  compression,
  quality,
  orientation,
  date_created,
  date_modified,
  date_timestamp,
  jpeg_colorspace,
  jpeg_sampling_factor,
  signature,
  tainted,
  filesize,
  number_pixels,
  pixel_cache_type,
  pixels_per_second,
  user_time,
  elapsed_time,
  version,
  width,
  height
) VALUES (
  $1,
  $2::integer,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11,
  $12,
  $13,
  $14,
  $15,
  $16,
  $17,
  $18,
  $19,
  $20,
  $21,
  $22,
  $23,
  $24,
  $25,
  $26,
  $27,
  $28,
  $29,
  $30,
  $31,
  $32,
  $33,
  $34,
  $35,
  $36,
  $37,
  $38,
  $39,
  $40,
  $41,
  $42,
  $43,
  $44,
  $45,
  $46,
  $47,
  $48,
  $49,
  $50,
  $51,
  $52,
  $53,
  $54,
  $55,
  $56,
  $57,
  $58,
  $59,
  $60,
  $61,
  $62,
  $63,
  $64,
  $65,
  $66,
  $67,
  $68,
  $69,
  $70,
  $71,
  $72,
  $73,
  $74,
  $75,
  $76,
  $77,
  $78,
  $79,
  $80,
  $81,
  $82,
  $83,
  $84,
  $85,
  $86,
  $87,
  $88
);`
  return db.query(query,arr);
}

export async function checkPageAndTwitterImagesExist(imageURL:string,image:Buffer,background?:string) {
  const name = imageURL.replace('https://image.storething.org/frankmbrown/','');
  const twitterURL = imageURL.replace('https://image.storething.org/frankmbrown/','https://image.storething.org/frankmbrown/twitter/');
  const linkedinURL = imageURL.replace('https://image.storething.org/frankmbrown/','https://image.storething.org/frankmbrown/og-image/');
  const [twitterResp,linkedinResp] = await Promise.all([
    getImageFromUrl(twitterURL).then((buff) => buff).catch((err) => undefined),
    getImageFromUrl(linkedinURL).then((buff) => buff).catch((err) => undefined)
  ]);
  if (!!!twitterResp||!!!linkedinResp) {
    var twitter:Buffer, linkedin: Buffer;
    if (background) {
      const o = await createTwitterAndLinkedInImages(image,background);
      twitter = o.twitter;
      linkedin = o.linkedin;
    } else {
      const o = await createTwitterAndLinkedInImages(image);
      twitter = o.twitter;
      linkedin = o.linkedin;
    }
    
    const extension = String(name.split('.').at(-1));
    const twitterKey = 'frankmbrown/twitter/'.concat(name);
    const linkedinKey = 'frankmbrown/og-image/'.concat(name);
    await Promise.all([
      uploadImageObject(twitterKey,twitter,extension,{},3,25),
      uploadImageObject(linkedinKey,linkedin,extension,{},3,25)
    ]);
  }
  return;
} 

export async function getTransparentImageBackgroundColor(buffer:Buffer) {
  const res = await executeWithArgument("magick",['convert','-','-colorspace','Gray','-resize','1x1\!','-format','','-format','"%[pixel:p{0,0}]"','info:'],buffer);
  const str = res.toString('utf-8');
  var matches = str.match(/\"gray\((?<luminance>.*)\)\"/);
  if (!!!matches||!!!matches.groups) {
    matches = str.match(/\"graya\((?<luminance>.*)\)\"/);
  }
  if (!!!matches||!!!matches.groups) {
    matches = str.match(/\"graya\((?<luminance>.*),(?<alpha>.*)\)\"/);
  }
  if (matches&&matches.groups) {
    const luminance = parseFloat(matches.groups.luminance.slice(0,matches.groups.luminance.length-1));
    const alpha = parseFloat(matches.groups.alpha);
    if (luminance < 50) {
      return "white";
    } else {
      return "black";
    }
  }
  return 'black';
}
export async function getOpaqueImageBackgroundColor(buffer:Buffer) {
  const [pixels,output] = await Promise.all([
    executeWithArgument('magick',['identify','-format','%[hex:u.p{0,0}],%[hex:u.p{w-1,0}],%[hex:u.p{0,h-1}],%[hex:u.p{w-1,h-1}]','-'],buffer),
    executeWithArgument('magick',['identify','-verbose','-'],buffer)
  ]);
  const pixelsStr = pixels.toString('utf-8');
  const pixelsArr = pixelsStr.split(',').map((s) => s.trim());
  if (pixelsArr.length===4&&pixelsArr[0]===pixelsArr[1]&&pixelsArr[0]===pixelsArr[2]&&pixelsArr[0]===pixelsArr[3]) {
    var toRet = pixelsArr[0];
    if (toRet.startsWith('#')) {
      if (toRet.length===9) {
        return toRet.slice(0,7);
      } else if (toRet.length===7) {
        return toRet;
      } else {
        return toRet;
      }
    } else {
      if (toRet.length===8) {
        return '#'.concat(toRet.slice(0,6));
      } else if (String(toRet.at(-1)).toUpperCase()===String(toRet.at(-1))) {
        return '#'.concat(toRet.slice(0,6));
      } else {
        return toRet;
      }
    }
  }
  const outputStr = output.toString('utf-8');
  const lines = outputStr.split('\n');
  for (let i=0;i<lines.length;i++){
    if (lines[i].trim()==="Histogram:") {
      i+=1;
      var max = -Infinity;
      var maxColor = 'black';
      const regex = /(?<count>\d+):\s\(\d+,\d+,\d+\)\s(?<hex_color>#[A-Fa-f0-9]{6})\s.*/;
      var currLine = lines[i].trim().match(regex);
      while (currLine&&currLine.groups&&currLine.groups.hex_color&&currLine.groups.count) {
        const count = parseInt(currLine.groups.count);
        if (count>max) {
          maxColor = currLine.groups.hex_color;
          max = count;
        }
        i+=1;
        if (i===lines.length) break;
        currLine = lines[i].trim().match(regex);
      }
      return maxColor;
    }
  }
  const backgroundColor = outputStr.match(/Background\scolor:\s(?<color>.*)\n/);
  if (backgroundColor&&backgroundColor.groups&&backgroundColor.groups.color) {
    return backgroundColor.groups.color.trim();
  }
  return 'black';
}
export async function isImageOpaque(buffer:Buffer) {
  const isOpaqueResult = await executeWithArgument("magick",['identify','-format','%[opaque]','-'],buffer);
  const isOpaque = isOpaqueResult.toString('utf8').trim()==="True";
  return isOpaque;
}
/**
 * Determine the background color of an image
 * @param buffer 
 * @returns 
 */
export async function getImageBackgroundColor(buffer:Buffer) {
  const isOpaque = await isImageOpaque(buffer);
  if (isOpaque) {
    const bgColor = await getOpaqueImageBackgroundColor(buffer);
    return bgColor;
  } else {
    const bgColor = await getTransparentImageBackgroundColor(buffer);
    return bgColor;
  }
} 
export async function handleImageUpload100_100(imageURL:string) {
  const origImage = await getImageFromUrl(imageURL);
  const newKey =  'frankmbrown/' + crypto.randomUUID().concat('.jpg');
  const newURL = `https://image.storething.org/${newKey}`;
  const [widthHeightBUff,backgroundColor] = await Promise.all([
    executeWithArgument('magick',['identify','-format','%wx%h','-'],origImage),
    getImageBackgroundColor(origImage)
  ]);
  const widthHeight = widthHeightBUff.toString('utf-8');
  const widthHeightArr = widthHeight.split('x');
  if (widthHeightArr.length!==2) throw new Error("Something went wrong getting width and height of image.");
  const width = parseInt(widthHeightArr[0]);
  const height = parseInt(widthHeightArr[1]);
  var newImage;
  if (width!==100||height!==100) {
    newImage = await executeWithArgument('magick',['convert','-','-thumbnail','100x100',...RESIZE_OPTIONS_BEFORE,'-gravity','center','-background',backgroundColor,'-extent','100x100','jpeg:-'],origImage);
    const key = imageURL.replace('https://image.storething.org/','');
    const extension = String(key.split('.').at(-1));
    await uploadImageObject(newKey,newImage,extension,{ width: "100", height: "100" },3,25);
    await checkPageAndTwitterImagesExist(newURL,origImage,backgroundColor);
    return newURL;
  } else {
    await checkPageAndTwitterImagesExist(imageURL,origImage,backgroundColor);
    return imageURL;
  }
}
export async function handleImageUpload150_75(imageURL:string) {
  const origImage = await getImageFromUrl(imageURL);
  const newKey =  'frankmbrown/' + crypto.randomUUID().concat('.jpg');
  const newURL = `https://image.storething.org/${newKey}`;
  const [widthHeightBUff,backgroundColor] = await Promise.all([
    executeWithArgument('magick',['identify','-format','%wx%h','-'],origImage),
    getImageBackgroundColor(origImage)
  ]);
  const widthHeight = widthHeightBUff.toString('utf-8');
  const widthHeightArr = widthHeight.split('x');
  if (widthHeightArr.length!==2) throw new Error("Something went wrong getting width and height of image.");
  const width = parseInt(widthHeightArr[0]);
  const height = parseInt(widthHeightArr[1]);
  var newImage;
  if (width!==150||height!==75) {
    newImage = await executeWithArgument('magick',['convert','-','-gravity','center','-thumbnail','150x75',...RESIZE_OPTIONS_BEFORE,'-background',backgroundColor,'-extent','150x75','jpeg:-'],origImage);
    const key = imageURL.replace('https://image.storething.org/','');
    const extension = String(key.split('.').at(-1));
    await uploadImageObject(newKey,newImage,extension,{ width: "150", height: "75" },3,25);
    await checkPageAndTwitterImagesExist(newURL,origImage,backgroundColor);
    return newURL;
  } else {
    await checkPageAndTwitterImagesExist(imageURL,origImage,backgroundColor);
    return imageURL;
  }
}