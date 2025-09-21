/* ----------------------- Imports ----------------------- */ 
import env from '../../utils/env';
import { CreateInvalidationCommand, CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'node:path';
import fs from 'fs';

/* ----------------------- Constants ----------------------- */ 
const AWS_ACCESS_KEY = env.AWS_ACCESS_KEY as string;
if (!!!AWS_ACCESS_KEY) throw new Error("Unable to get AWS_ACCESS_KEY from env.");
const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY as string;
if (!!!AWS_SECRET_ACCESS_KEY) throw new Error("Unable to get AWS_SECRET_ACCESS_KEY from env.");
const AWS_CDN_BUCKET = env.AWS_CDN_BUCKET;
if (!!!AWS_CDN_BUCKET) throw new Error("Unable to get AWS_CDN_BUCKET from env.");
const AWS_CLOUDFRONT_LOAD_BALANCER_ID = env.AWS_CLOUDFRONT_LOAD_BALANCER_ID;
if (!!!AWS_CLOUDFRONT_LOAD_BALANCER_ID) throw new Error("Unable to get AWS_CLOUDFRONT_LOAD_BALANCER_ID from env.")
const AWS_CLOUDFRONT_CDN_ID = env.AWS_CLOUDFRONT_CDN_ID;
if (!!!AWS_CLOUDFRONT_CDN_ID) throw new Error("Unable to get AWS_CLOUDFRONT_CDN_ID from env.")
const AWS_CLOUDFRONT_IMAGE_ID = env.AWS_CLOUDFRONT_IMAGE_ID;
if (!!!AWS_CLOUDFRONT_IMAGE_ID) throw new Error("Unable to get AWS_CLOUDFRONT_IMAGE_ID from env.")
const AWS_CLOUDFRONT_GEOGRAPHY_ID = env.AWS_CLOUDFRONT_GEOGRAPHY_ID;
if (!!!AWS_CLOUDFRONT_GEOGRAPHY_ID) throw new Error("Unable to get AWS_CLOUDFRONT_GEOGRAPHY_ID from env.")
const AWS_CLOUDFRONT_AUDIO_ID = env.AWS_CLOUDFRONT_AUDIO_ID;
if (!!!AWS_CLOUDFRONT_AUDIO_ID) throw new Error("Unable to get AWS_CLOUDFRONT_AUDIO_ID from env.")
const AWS_CLOUDFRONT_VIDEO_ID = env.AWS_CLOUDFRONT_VIDEO_ID;
if (!!!AWS_CLOUDFRONT_VIDEO_ID) throw new Error("Unable to get AWS_CLOUDFRONT_VIDEO_ID from env.")
const AWS_CLOUDFRONT_TEXT_ID = env.AWS_CLOUDFRONT_TEXT_ID;
if (!!!AWS_CLOUDFRONT_TEXT_ID) throw new Error("Unable to get AWS_CLOUDFRONT_TEXT_ID from env.")

const cloudfrontClient = new CloudFrontClient({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});
const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: 'us-east-1'
})

const desktop_bundle_path_server = "frankmbrown/css/desktop-bundle.css";
const desktop_bundle_path_client = path.resolve(__dirname,'..','..','..','..','static','css','desktop-bundle.css');
const mobile_bundle_path_server = "frankmbrown/css/mobile-bundle.css";
const mobile_bundle_path_client = path.resolve(__dirname,'..','..','..','..','static','css','mobile-bundle.css');
const path_to_js = path.resolve(__dirname,'..','..','..','..','static','js');

const desktopCSS = fs.readFileSync(desktop_bundle_path_client,{encoding:'utf-8'});
const mobileCSS = fs.readFileSync(mobile_bundle_path_client,{encoding:'utf-8'});

const uploadMobileCss = new PutObjectCommand({
  Bucket: AWS_CDN_BUCKET,
  Body: mobileCSS,
  Key: mobile_bundle_path_server,
  ContentType: 'text/css'
})
const uploadDesktopCss = new PutObjectCommand({
  Bucket: AWS_CDN_BUCKET,
  Body: desktopCSS,
  Key: desktop_bundle_path_server,
  ContentType: 'text/css'
});

const invalidateCSS = new CreateInvalidationCommand({
  DistributionId: AWS_CLOUDFRONT_CDN_ID, // required
  InvalidationBatch: {
    Paths: {
      Quantity: 2, // required
      Items: [
        '/'.concat(desktop_bundle_path_server), // CloudFront Invalidation paths must begin with slash
        '/'.concat(mobile_bundle_path_server)
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
  const array:{key:string,file:string}[]=[];
  const topDir = await fs.promises.readdir(path_to_js);
  for (let i = 0; i < topDir.length; i++) {
    const file_path = path.resolve(path_to_js,topDir[i]);
    const stat = await fs.promises.stat(file_path);
    var key = 'frankmbrown/js/';
    // there should be only one directory
    if (stat.isDirectory()) {
      key += topDir[i] + "/";
      const path_to_directory = path.resolve(path_to_js,topDir[i]);
      const secondDir = await fs.promises.readdir(path_to_directory);
      for (let j = 0; j < secondDir.length; j++) {
        const file_path_new = path.resolve(path_to_js,topDir[i],secondDir[j]);
        key+=secondDir[j];
        const file = fs.readFileSync(file_path_new,{encoding:'utf-8'});
        array.push({ key, file });
      }
    } else {
      key+=topDir[i];
      const file = fs.readFileSync(file_path,{encoding:'utf-8'});
      array.push({ key, file });
    }
  }
  return array;
}
/**
 * Upload files to s3 bucket and invalidate old JS files
 */
async function uploadJSFiles(arr:{key:string,file:string}[]) {
  const cloudfrontInvalidationKeys:string[] = []; 
  const uploadObjects:PutObjectCommand[] = [];
  for (let i = 0; i < arr.length; i++) {
    const { key, file } = arr[i];
    if (!!!/frankmbrown\/js\/\d+\.chunk\.bundle\.js/.test(key)) {
      cloudfrontInvalidationKeys.push(key);
    }
    uploadObjects.push(new PutObjectCommand({ 
      Bucket: AWS_CDN_BUCKET,
      Body: file,
      Key: key,
      ContentType: 'text/javascript'
    }));
  }
  await Promise.all([
    ...uploadObjects.map((obj) => s3Client.send(obj)),
    cloudfrontClient.send(new CreateInvalidationCommand({
      DistributionId: AWS_CLOUDFRONT_CDN_ID, // required
      InvalidationBatch: {
        Paths: {
          Quantity: cloudfrontInvalidationKeys.length, // required
          Items: cloudfrontInvalidationKeys,
        },
        CallerReference:String((new Date()).getTime()), // required
      },
    }))
  ])
}

/* ----------------------- Functions ----------------------- */ 
Promise.all([s3Client.send(uploadDesktopCss),s3Client.send(uploadMobileCss)])
.then(() => {
  return cloudfrontClient.send(invalidateCSS);
})
.then(() => {
  console.log("Updated CSS FIles in CloudFront");
  return getKeysAndJSFiles();
})
.then((res) => {
  // return uploadJSFiles(res);
})
.then(() => {
  console.log("Updated JS files in CloudFront.")
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
})


