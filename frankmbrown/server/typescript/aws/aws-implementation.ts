'use strict';
import env from '../utils/env';
import { 
    S3Client, 
    PutObjectCommand, 
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    UploadPartOutput,
    CompleteMultipartUploadCommand,
    UploadPartCommandOutput,
    CreateMultipartUploadCommandInput,
    HeadObjectCommand
} from "@aws-sdk/client-s3";
import {
    getSignedUrl
} from '@aws-sdk/s3-request-presigner';
import vision from '@google-cloud/vision';

import path from 'path';
import axios from 'axios';
import sizeOf from 'buffer-image-size';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { 
  TranscribeClient, 
  StartTranscriptionJobCommand, 
  StartTranscriptionJobCommandInput,
  ListTranscriptionJobsCommand,
  ListTranscriptionJobsCommandInput,
  DeleteTranscriptionJobCommand ,
  DeleteTranscriptionJobCommandInput, 
  ListLanguageModelsCommand
} from "@aws-sdk/client-transcribe";
import { Request, Response } from 'express';
import mime from 'mime';

const AWS_ACCESS_KEY = env.AWS_ACCESS_KEY as string;
const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY as string;
const AWS_INGRESS_IMAGE = env.AWS_INGRESS_IMAGE;
const AWS_INGRESS_AUDIO = env.AWS_INGRESS_AUDIO;
const AWS_INGRESS_VIDEO = env.AWS_INGRESS_VIDEO;
const AWS_INGRESS_TEXT = env.AWS_INGRESS_TEXT;
const AWS_CDN_BUCKET = env.AWS_CDN_BUCKET;

if (!!!AWS_ACCESS_KEY) throw Error('Unable to get AWS_ACCESS_KEY from env.');
if (!!!AWS_SECRET_ACCESS_KEY) throw Error('Unable to get AWS_SECRET_ACCESS_KEY from env.');
if(!!!AWS_INGRESS_IMAGE) throw new Error('Unable to get AWS_INGRESS_IMAGE from env.');
if (!!!AWS_INGRESS_AUDIO) throw new Error('Unable to get AWS_INGRESS_AUDIO from env.');
if (!!!AWS_INGRESS_VIDEO) throw new Error('Unable to get AWS_INGRESS_VIDEO from env.');
if (!!!AWS_INGRESS_TEXT) throw new Error("Unable to get AWS_INGRESS_TEXT from env.");
if (!!!AWS_CDN_BUCKET) throw new Error("Unable to get AWS_CDN_BUCKET from env.");

const CHUNK_SIZE = 6000000; // 6 MB - https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html- minimum size for uploading parts is 6MB

/* Amazon S3 Clients */
export const s3Client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: 'us-east-1'
})


/* Transcribe Client for starting Transcription Jobs */
export const transcribeClient = new TranscribeClient({
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
const SAFE_SEARCH_IMAGE = new vision.ImageAnnotatorClient({
    keyFilename: path.resolve(__dirname,'..','..','..','certificates','..','personal-website-403817-f95ee5280bf9.json')
});

const SAFE_SEARCH_ANNOTATION_LEVELS = {
  'VERY_UNLIKELY': 0,
  'UNLIKELY': 1,
  "POSSIBLE": 2,
  "LIKELY": 3,
  "VERY_LIKELY": 4,
  "UNKNOWN": undefined
} as const;

/**
 * Given the url of an s3 image, determine if the video is safe to use
 * I implement this in a Lambda function now, but I am keeping here for reference
 * @param imageURL 
 * @returns {boolean} Whether or not the image is safe to use, true = is safe, false = should delete
 */
export async function safeSearchImage(imageURL:string) {
  try {
    const [result] = await SAFE_SEARCH_IMAGE.safeSearchDetection(imageURL);
    const { safeSearchAnnotation } = result;
    if (!!!safeSearchAnnotation) return false;
    const keys = Object.keys(safeSearchAnnotation);
    if (keys.length!==5) return false;
    for (let i =0; i< keys.length; i++) {
      const value = safeSearchAnnotation[keys[i] as keyof typeof safeSearchAnnotation];
      const annotationLevel = SAFE_SEARCH_ANNOTATION_LEVELS[value as keyof typeof SAFE_SEARCH_ANNOTATION_LEVELS];
      if (!!!value || isNaN(annotationLevel as number) || Number(annotationLevel)>=3) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(error);
  }

}

/**
 * Function gets image object from s3 and returns it
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
 * Access the image data on the `Body` attribute of the response
 * @param key Image Object Key
 * @returns GetObjectCommandOutput or Throws Error
*/
async function getImageObject(key: string,bucket:string=AWS_INGRESS_IMAGE as string) {
  const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
  });
  try {
      const response = await s3Client.send(command);
      return response;
  } catch (error) {
      console.error(error);
      throw Error('Unable to get '.concat(key).concat(' image object from s3 Bucket.'));
  }
}

/**
 * Function gets image object from s3 and returns it, if object does not exist, return null
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
 * @param key Image Object Key
 * @returns GetObjectCommandOutput or returns null if image object with key does not exist
*/
async function getImageObjectReturnNull(key: string,bucket:string) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export function getUserIdAndIpIdForImageUpload(req:Request) {
  const user_id = req.session.auth?.userID || null;
  const ip_id = req.session.ip_id;
  if (!!!ip_id) throw new Error("ip_id must be defined to upload an image.");
  return {user_id,ip_id};
}

/**
 * Post image to the s3 image bucket. Returns the image url of the posted image
 * @param name name of the image
 * @param image Buffer of image 
 */
async function uploadImageObject(key: string, image: Buffer, extension: string, metadata: {[index: string]: string},user_id:number|null,ip_id:number) {
  if (!!!metadata.user_id) {
    metadata.user_id = String(user_id);
  }
  if (!!!metadata.ip_id) {
    metadata.ip_id = String(ip_id);
  }
  const command = new PutObjectCommand({
      Bucket: AWS_INGRESS_IMAGE,
      Body: image,
      Key: key,
      ContentType: 'image/'.concat(extension),
      Metadata: metadata
  });
  try {
      await s3Client.send(command);
      return 'https://image.storething.org/'.concat(encodeURIComponent(key));
  } catch (error) {
      throw new Error('Unable to post image object to s3 bucket.');
  }
}

export async function getImageObjectMetadata(key:string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: AWS_INGRESS_IMAGE,
      Key: key
    });
    const resp = await s3Client.send(command);
    const metadata = resp.Metadata;
    if (metadata) {
      return metadata;
    } else {
      throw new Error("Unable to get Image metadata.");
    }
  } catch (e) {
    console.error(e);
    throw new Error("Unable to get Image metadata.");
  }
}

/**
 * Function to fix the fact that I accidentally deleted some stuff from 
 * 
 * @param key 
 * @param image 
 * @returns 
 */
export async function postJSONTemp(key:string,image: any) {
  const command = new PutObjectCommand({
    Bucket: AWS_INGRESS_IMAGE,
    Body: image,
    Key: key,
    ContentType: 'json',
  });
  try {
    await s3Client.send(command);
    return 'https://image.storething.org/'.concat(encodeURIComponent(key));
  } catch (error) {
      throw new Error('Unable to post image object to s3 bucket.');
  }
}


/**
 * Delete Image object from s3 or throw Error if something goes wrong
 * @param key Image Object Key
 * @returns DeleteObjectCommandOutput or throw Error
 */
async function deleteImageObject(key: string,bucket:string) {
    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
    });
    try {
        const response = await s3Client.send(command);
        return response;
    } catch (error) {
        throw Error('Unable to delete '.concat(key).concat(' image object from s3 Bucket.'));
    }
}

/**
 * Get (Fetch) image and test to see if it returns a 200 response code
 * and if it does, then return the image string
 * @param {string} url The url of the image 
 * @returns {Promise<{width: number, height: number, type: string, buffer: Buffer}>} This is an object, { width: number, height: number, type: [image type (e.g., png)], buffer: binary image buffer 
 */
async function testForeignImage(url: string):Promise<{width: number, height: number, type: string, buffer: Buffer}|null> {
    try {
        const resp = await axios.get(url,{ responseType: 'arraybuffer', timeout: 4000 });
        if (resp.status !== 200) throw Error('Image response did not have a status code of 200.');
        const img = Buffer.from(resp.data,'binary');
        const imgData = sizeOf(img);
        return {...imgData, buffer: img};
    } catch (error) {
        return null;
    }
}


/**
 * List all keys in s3 image bucket
 * It is probably better to use the terminal commands in Amazon than to call this function
 * https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjects.html
 */
async function listAllImageObjects() {
  const command = new ListObjectsV2Command({
      Bucket: AWS_INGRESS_IMAGE
  });
  const images: string[] = [];
  try {
    let isTruncated = true;
    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
      if (Contents) {
        Contents.forEach((c) => images.push(`${c.Key}`));
        isTruncated = Boolean(IsTruncated);
        command.input.ContinuationToken = NextContinuationToken;
      }
    }
    return images;
  } catch (error) {
      console.error(error);
      throw Error('Unable to list all the image objects in the s3 bucket.');
  }
}

/**
 * List image objects 
 * @param nextToken 
 */
export async function listImageObjects(nextToken?:string,prefix?:string) {
  const images:{ url: string, key: string }[] = [];
  try {
    const command = new ListObjectsV2Command({
      Bucket: AWS_INGRESS_IMAGE,
      Prefix: prefix
    });
    if (nextToken) {
      command.input.ContinuationToken = nextToken;
    }
    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
    if (Contents) {
      Contents.forEach((c) => images.push({ url: `https://image.storething.org/${c.Key}`, key: String(c.Key) }));
      return { images, IsTruncated, NextContinuationToken };
    } else {
      throw new Error('Unable to list image objects.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Unable to list image objects.');
  }
}


/* ----------------------------------------------- Video and Audio --------------------------- */
function isVttFile(key:string) {
  return Boolean(key.endsWith('.temp')||key.endsWith('.json')||key.endsWith('.vtt'));
}

/**
 * List Video Objects in Video s3 Bucket
 * @returns 
 */
export async function listAllVideoObjects() {
    const command = new ListObjectsV2Command({
        Bucket: AWS_INGRESS_VIDEO
    });
    const videos: string[] = [];
    try {
        let isTruncated = true;
        while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
        if (Contents) {
            Contents.filter((c) => !!!isVttFile(String(c.Key)))
            .forEach((c) => videos.push(`${c.Key}`));
            isTruncated = Boolean(IsTruncated);
            command.input.ContinuationToken = NextContinuationToken;
        }
        }
        return videos;
    } catch (error) {
        console.error(error);
        throw Error('Unable to list all the video objects in the input video s3 bucket.');
    }
}
/**
 * List video objects 
 * @param nextToken The continuation token to use for the list objects request
 */
export async function listVideoObjects(nextToken?:string) {
  const videos:{ url: string, key: string }[] = [];
  try {
    const command = new ListObjectsV2Command({
      Bucket: AWS_INGRESS_VIDEO
    });
    if (nextToken) {
      command.input.ContinuationToken = nextToken;
    }
    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
    if (Contents) {
      Contents.filter((c) => !!!isVttFile(String(c.Key)))
      .forEach((c) => videos.push({ url: `https://video.storething.org/${c.Key}`, key: String(c.Key) }));
      return { videos, IsTruncated, NextContinuationToken };
    } else {
      throw new Error('Unable to list video objects.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Unable to list video objects.');
  }
}

/**
 * List Audio Objects in Audio s3 Bucket
 * @returns 
 */
export async function listAllAudioObjects() {
  const command = new ListObjectsV2Command({
    Bucket: AWS_INGRESS_AUDIO
  });
  const audios: string[] = [];
  try {
    let isTruncated = true;
    while (isTruncated) {
    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
    if (Contents) {
        Contents.filter((c) => !!!isVttFile(String(c.Key)))
        .forEach((c) => audios.push(`${c.Key}`));
        isTruncated = Boolean(IsTruncated);
        command.input.ContinuationToken = NextContinuationToken;
    }
    }
    return audios;
  } catch (error) {
    console.error(error);
    throw Error('Unable to list all the audio objects in the input audio s3 bucket.');
  }
}
/**
 * List audio objects 
 * @param nextToken The continuation token to use for the list objects request
 */
export async function listAudioObjects(nextToken?:string) {
  const audios:{ url: string, key: string }[] = [];
  try {
    const command = new ListObjectsV2Command({
      Bucket: AWS_INGRESS_AUDIO
    });
    if (nextToken) {
      command.input.ContinuationToken = nextToken;
    }
    const { Contents, IsTruncated, NextContinuationToken } = await s3Client.send(command);
    if (Contents) {
      Contents.filter((c) => !!!isVttFile(String(c.Key)))
      .forEach((c) => audios.push({ url: `https://audio.storething.org/${c.Key}`, key: String(c.Key) }));
      return { audios, IsTruncated, NextContinuationToken };
    } else {
      throw new Error('Unable to list audio objects.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Unable to list audio objects.');
  }
}


/**
 * Create, upload, and complete a multiPartUpload for an audio or video object
 * @param file 
 * @param fileType 
 * @param Key 
 * @param Bucket 
 * @param client 
 */
export async function multiPartUpload(file:Buffer,fileType:string,Key:string,Bucket:string,client:S3Client,metadata:{[key:string]: string}={},type:'audio'|'video') {
  try {
    // @ts-ignore
    const size = Math.ceil(Buffer.byteLength(file)/CHUNK_SIZE);
    const params = { 
      Bucket, 
      Key, 
      ContentType: `${type}/`.concat(fileType), 
      Metadata: metadata
    };
    const createMultipartCommand = new CreateMultipartUploadCommand(params);
    const { UploadId } = await client.send(createMultipartCommand);
    var promiseArray:Promise<UploadPartCommandOutput>[] = [];
    for (let i = 0; i < size; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket,
        Key,
        UploadId,
        PartNumber: i+1,
        Body: file.slice((i*CHUNK_SIZE),(i+1)*CHUNK_SIZE) 
      });
      promiseArray.push(client.send(uploadPartCommand));
    }
    const uploadPartsResp = await Promise.all(promiseArray);
    const Parts = uploadPartsResp.map((uploadPartResp,i) => ({ETag: String(uploadPartResp.ETag), PartNumber: i+1 }));
    const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
      Bucket,
      UploadId,
      Key,
      MultipartUpload: {
          Parts
      }
    });
    await client.send(completeMultipartUploadCommand);
  } catch (error) {
    console.error(error);
    throw new Error('There was an error completing the multipart upload command request.');
  }
}
/**
 * Get video object from s3 bucket
 * @param key 
 * @returns 
 */
export async function getVideoObject(key:string) {
  const command = new GetObjectCommand({
    Bucket: AWS_INGRESS_VIDEO,
    Key: key
  });
  try {
      const response = await s3Client.send(command);
      return response;
  } catch (error) {
      console.error(error);
      throw Error('Unable to get '.concat(key).concat(' video object from s3 Bucket.'));
  }
}
/**
 * Upload video object to s3 bucket using `multipartUpload`
 * @param pathToVideo 
 * @param Key 
 */
export async function uploadVideoOject(pathToVideo:string,Key:string,metadata:{[index:string]:string}={},extension: string) {
  try {
    const video = await fs.promises.readFile(pathToVideo);
    await multiPartUpload(video,extension,Key,String(AWS_INGRESS_VIDEO),s3Client,metadata,'video');
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong uploading the video file to the s3 Bucket.');
  }
}
/**
 * Function for deleting video object from s3 database given the s3 key
 * @param key 
 */
export async function deleteVideoObject(key:string) {
  const command = new DeleteObjectCommand({
    Bucket: AWS_INGRESS_VIDEO,
    Key: key
  });
  try {
    const res = await s3Client.send(command);
    return res;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to delete video object from database.');
  }
}
/**
 * Get audio object from s3 audio bucket
 * @param key 
 * @returns 
 */
export async function getAudioObject(key:string) {
  const command = new GetObjectCommand({
    Bucket: AWS_INGRESS_AUDIO,
    Key: key
  });
  try {
      const response = await s3Client.send(command);
      return response;
  } catch (error) {
      console.error(error);
      throw Error('Unable to get '.concat(key).concat(' audio object from s3 Bucket.'));
  }
}
/**
 * Upload audio object to s3 bucket using `multipartUpload`
 * @param pathToAudio 
 * @param Key 
 */
export async function uploadAudioObject(pathToAudio:string,Key:string,metadata:{[index:string]:string}={},extension:string) {
  try {
    const audio = await fs.promises.readFile(pathToAudio);
    await multiPartUpload(audio,extension,Key,String(AWS_INGRESS_AUDIO),s3Client,metadata,'audio');
  } catch (error) {
    console.error(error);
    throw new Error('There was an error uploading the audio file to the s3 bucket.');
  }
}
/**
 * Function for deleting video object from s3 database given the s3 key
 * @param key 
 */
export async function deleteAudioObject(key:string) {
  const command = new DeleteObjectCommand({
    Bucket: AWS_INGRESS_AUDIO,
    Key: key
  });
  try {
    const res = await s3Client.send(command);
    return res;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to delete audio object from database.');
  }
}
export async function startTranscribeAudioJob(key:string,extension:string,name:string) {
  try {
    const MediaFileUri = `https://${AWS_INGRESS_AUDIO}.s3-us-east-1.amazonaws.com/${key}`;
    const params:StartTranscriptionJobCommandInput = {
      TranscriptionJobName: name,
      LanguageCode: "en-US" as 'en-US', // For example, 'en-US'
      MediaFormat: extension as 'mp3'|'mp4', // For example, 'wav'
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
    const data = await transcribeClient.send(new StartTranscriptionJobCommand(params));
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to start transcribe audio job');
  }
}
export async function startTranscribeVideoJob(key:string,extension:string,name:string) {
  try {
    const MediaFileUri = `https://${AWS_INGRESS_VIDEO}.s3-us-east-1.amazonaws.com/${key}`
    const params:StartTranscriptionJobCommandInput = {
      TranscriptionJobName: name,
      LanguageCode: "en-US" as 'en-US', // For example, 'en-US'
      MediaFormat: extension as 'mp3'|'mp4', // For example, 'wav'
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
    const data = await transcribeClient.send(new StartTranscriptionJobCommand(params));
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to start transcribe video job');
  }
}
export async function listVideoTranscriptionJobs() {
  try {
    var nextToken = null;
    var transcriptionJobNames:string[] = [];
    const listVideoTranscriptionJobsCommand = new ListTranscriptionJobsCommand({});
    const firstResult = await transcribeClient.send(listVideoTranscriptionJobsCommand);
    const { NextToken } = firstResult;
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong listing the video transcription jobs.');
  }
}

/* ------------------------------------ Server and API Helpers ------------------------- */

// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html
const createPresignedUrlWithClient = ({ region, bucket, key }:{region:string,bucket:string,key:string},metadata:{[key: string]: string}={}) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, Metadata: metadata });
    return getSignedUrl(s3Client, command, { expiresIn: 1800 });
};

/**
 * Get the type of a file
 * @param str 
 * @returns 
 */
const getType = (str: string) => {
  const lastIndexOfPeriod = str.lastIndexOf('.');
  return str.slice(lastIndexOfPeriod+1);
}

/**
 * CREATING KEYS: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html
 * @param name the name of the image from the client ?
 * [Reference](https://www.npmjs.com/package/@aws-sdk/cloudfront-signer)
 */
async function getPostImageSignedUrl(name: string,metadata?:{[key: string]: string}) {
  const key = 'frankmbrown/' + crypto.randomUUID().concat('.').concat(getType(name));
  try {
    const url = await createPresignedUrlWithClient({
        region: 'us-east-1',
        bucket: AWS_INGRESS_IMAGE as string,
        key
    },metadata);
    return url;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to get presigned url for posting object to s3.');
  }
}


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
async function getPostAudioSignedUrls(name: string, length: number, metadata:{[index:string]:string}={}) {
  try {
    const type = getType(name);
    const Key = 'frankmbrown/' + crypto.randomUUID().concat(`.${type}`);
    if (!!!VALID_AUDIO_FILE_EXTENSIONS.has(type)) throw new Error('Audio Type not allowed.');
    const params: CreateMultipartUploadCommandInput = { 
      Bucket: AWS_INGRESS_AUDIO, 
      Key, 
      ContentType: 'audio/'.concat(type),
      Metadata: metadata
    }
    const command = new CreateMultipartUploadCommand(params);
    const { UploadId } = await s3Client.send(command);
    const promiseArray:Promise<string>[] = [];
    for (let i = 0 ; i < length; i++){
        const command = new UploadPartCommand({
            Bucket: AWS_INGRESS_AUDIO,
            Key,
            UploadId,
            PartNumber: i+1,
        });
        promiseArray.push(getSignedUrl(s3Client,command,{ expiresIn: 1800 }));
    }
    const signedUrls =  await Promise.all(promiseArray);
    return {
        signedUrls,
        UploadId,
        Key
    };
  } catch (error) {
      console.error(error);
      throw new Error('Unable to create audio signed urls.');
  }
}
/**
 * Get the signed urls for creating the multipart upload command and uploading the parts on the client
 * returns the signedurls, the UploadId, and the key of the audio / video file. A new name is generated for the 
 * audio / video file using the crypto module
 * @param name 
 * @param length 
 * @returns 
 */
async function getPostVideoSignedUrls(name: string, length: number, metadata:{[index:string]:string}={}) {
  try {
    const type = getType(name);
    const Key = 'frankmbrown/' + crypto.randomUUID().concat(`.${type}`);
    if (!!!VALID_VIDEO_FILE_EXTENSIONS.has(type)) throw new Error('Video Type not allowed.');
    const params: CreateMultipartUploadCommandInput = { 
      Bucket: AWS_INGRESS_VIDEO, 
      Key, 
      ContentType: 'video/'.concat(type),
      Metadata: metadata
    };
    const command = new CreateMultipartUploadCommand(params);
    const { UploadId } = await s3Client.send(command);
    const promiseArray:Promise<string>[] = [];
    for (let i = 0 ; i < length; i++){
        const command = new UploadPartCommand({
            Bucket: AWS_INGRESS_VIDEO,
            Key,
            UploadId,
            PartNumber: i+1,
        });
        promiseArray.push(getSignedUrl(s3Client,command,{ expiresIn: 1800 }));
    }
    const signedUrls =  await Promise.all(promiseArray);
    return {
        signedUrls,
        UploadId,
        Key
    };
  } catch (error) {
    console.error(error);
    throw new Error('Unable to create video signed urls.');
  }
}
/**
 * Complete the multipart upload command for uploading audio file
 * @param Parts 
 * @param UploadId 
 * @param Key 
 * @returns 
 */
async function completeMultipartUploadAudio(Parts: {ETag: string, PartNumber: number}[], UploadId: string, Key: string ) {
    try {
      const command = new CompleteMultipartUploadCommand({
          Bucket: AWS_INGRESS_AUDIO,
          UploadId,
          Key,
          MultipartUpload: {
              Parts
          }
      });
      const resp = await s3Client.send(command);
      return resp;
    } catch (error) {
      console.error(error);
      throw new Error('Something went wrong completing the multipart audio upload.');
    }
}
/**
 * Complete the multipart upload command uploading video file
 * @param Parts 
 * @param UploadId 
 * @param Key 
 * @returns 
 */
async function completeMultipartUploadVideo(Parts: {ETag: string, PartNumber: number}[], UploadId: string, Key: string) {
  try {
      const command = new CompleteMultipartUploadCommand({
          Bucket: AWS_INGRESS_VIDEO,
          UploadId,
          Key,
          MultipartUpload: {
              Parts
          }
      });
      const resp = await s3Client.send(command);
      return resp;
  } catch (error) {
      console.error(error);
      throw new Error('Something went wrong completing the multipart audio upload.');
  }
}



const path_to_temp_download_files = path.resolve(__dirname,'temp_files');
if (!!!fs.existsSync(path_to_temp_download_files)) {
  fs.mkdirSync(path_to_temp_download_files);
}


export async function handleGetFileFromS3(req:Request,res:Response) {
  try {
    const keyPrefix = req.path.includes('frankmbrown') ? 'frankmbrown/' : 'civgauge/';
    const VALID_TYPES = new Set(['text','image','audio','video']);
    const { key, type } = req.params;
    if (typeof key!=='string'||!!!VALID_TYPES.has(type)) {
      throw new Error("Key not recognized or type not valid.")
    }
    var bucket = '';
    switch (type) {
      case 'image':
        bucket = AWS_INGRESS_IMAGE as string;
        break;
      case 'audio':
        bucket = AWS_INGRESS_AUDIO as string;
        break;
      case 'video':
        bucket = AWS_INGRESS_VIDEO as string;
        break;
      case 'text':
        bucket = AWS_INGRESS_TEXT as string;
        break;
      default: {
        throw new Error("Something went wrong getting the object from s3.");
      }
    }
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: keyPrefix + key
    });
    const extension = key.slice(key.lastIndexOf('.'),key.length);
    const resp = await s3Client.send(command);
    if (resp.Body) {
      const buffer = await resp.Body.transformToByteArray();
      const path_to_temp_file = path.resolve(path_to_temp_download_files,crypto.randomUUID()+extension)
      await fs.promises.writeFile(path_to_temp_file,buffer);
      res.download(path_to_temp_file,async () => {
        await fs.promises.unlink(path_to_temp_file);
        return;
      });
    } else {
      throw new Error("Unable to download file.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong getting the file.");
  }
}
/**
 * Returns URL without beinning https://frankmbrown.net
 * @param type 
 * @param key 
 * @returns 
 */
export function getDownloadFileUrl(type:string,key:string) {
  return `/api/get-file/${type}/${key}`;
}

export async function uploadFileGeneral(key:string,buffer:Buffer,bucketType:'image'|'audio'|'video'|'text',contentType:string) {
  const TWENTY_FIVE_MB = 25 * 1024 * 1024;
  const TEN_MB = 10 * 1024 * 1024;
  var bucket = '';
  var url = ''
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
  if (sizeOfBuffer>TWENTY_FIVE_MB) {
    const params: CreateMultipartUploadCommandInput = { 
      Bucket: bucket, 
      Key: key, 
      ContentType: contentType,
      Metadata: {}
    };
    const createMultipartUpload = new CreateMultipartUploadCommand(params);
    const { UploadId } = await s3Client.send(createMultipartUpload);
    const promiseArray:Promise<UploadPartOutput>[] = [];
    let offset = 0;
    let  i = 0;
    while (offset < buffer.length) {
      const end = Math.min(offset + TEN_MB, buffer.length);
      const command = new UploadPartCommand({
        Body: buffer.subarray(offset, end),
        Bucket: bucket,
        Key: key,
        UploadId,
        PartNumber: i+1,
      });
      promiseArray.push(s3Client.send(command));
      offset = end;
      i+=1;
    }
    const uploadPartsResponse = await Promise.all(promiseArray);
    const parts = uploadPartsResponse.map((obj,i) => ({
      ETag: obj.ETag, 
      PartNumber: i+1
    }))
    const command = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      UploadId,
      Key: key,
      MultipartUpload: {
          Parts: parts
      }
    });
    await s3Client.send(command);
    return key;
  } else {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Body: buffer,
      Key: key,
      ContentType: contentType,
      Metadata: {}
    });
    await s3Client.send(command);
    return key;
  }
} 

export async function getTexNoteFromUrl(url:string) {
  const Key = url.replace('https://text.storething.org/',''); 
  const command = new GetObjectCommand({
    Bucket: AWS_INGRESS_TEXT as string,
    Key
  });
  const resp = await s3Client.send(command);
  if (resp.Body) {
    const buffer = await resp.Body.transformToByteArray();
    return buffer;
  } else {
    throw new Error("Unable to download file.");
  }
}

export async function getVttObject(Key:string,typ:'audio'|'video') {
  const Bucket = typ==="audio"?AWS_INGRESS_AUDIO:AWS_INGRESS_VIDEO;
  try {
    const resp = await s3Client.send(new GetObjectCommand({ 
      Key,
      Bucket
    }));
    return resp;
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong getting VTT object.");
  }
  

}

export async function putJavaScriptGamesDesigns(file:Express.Multer.File) {
  const Body = file.buffer;
  const key = 'frankmbrown/assets-designs-games/'.concat(crypto.randomUUID()).concat('.js');
  const command = new PutObjectCommand({
    Bucket: AWS_CDN_BUCKET,
    Body,
    Key: key,
    ContentType: file.mimetype
  });
  await s3Client.send(command);
  return `https://cdn.storething.org/`.concat(key);
}
export async function putGameAssetS3(file:Express.Multer.File) {
  const Body = file.buffer;
  const extension = file.originalname.slice(file.originalname.lastIndexOf('.')+1 || file.originalname.length-1);
  const key = 'frankmbrown/assets-designs-games/'.concat(crypto.randomUUID()).concat(`.${extension || 'any'}`);
  const command = new PutObjectCommand({
    Bucket: AWS_CDN_BUCKET,
    Body,
    Key: key,
    ContentType: file.mimetype
  });
  await s3Client.send(command);
  return `https://cdn.storething.org/`.concat(key);
}

export {
  getImageObject,
  deleteImageObject,
  listAllImageObjects,
  testForeignImage,
  getImageObjectReturnNull,
  getPostImageSignedUrl,
  getPostVideoSignedUrls,
  getPostAudioSignedUrls,
  completeMultipartUploadAudio,
  completeMultipartUploadVideo,
  uploadImageObject
};