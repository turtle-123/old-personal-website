import { Router, Request, Response } from 'express';
import searchIcons from './functions/searchIcons';
import bodyParser from 'body-parser';
import { codingLanguages } from './functions/code';
import { getSettingsAndForm, settingsHandler, lightModeDarkMode, getSettingsForm,resetThemeColors ,createIPSettingsInDatabase,updateSettingsInDatabase,setSettingsAfterCookie} from './functions/settingsHandler';
import exampleStateSelect from './functions/exampleStateSelect';
import {handleCircleExample,handlePolygonExample,handleCookieBanner} from './functions/general';
import getIpLocationAndCheckDbSettings from '../MIDDLEWARE/getIpLocationAndCheckDbSettings';
import { getPostImageSignedUrl, getPostAudioSignedUrls, getPostVideoSignedUrls,completeMultipartUploadAudio,completeMultipartUploadVideo,handleGetFileFromS3,getUserIdAndIpIdForImageUpload } from '../aws/aws-implementation';
import {embedNews,type EmbedNews} from './functions/embed';
import getLexical, { renderExampleLexical } from './functions/lexical';
import multer from 'multer';
import { lexicalTable, getTableHTML, tableToCsvAndJsonApiRoute } from './functions/table';
import { getRateLimit } from '../MIDDLEWARE/rateLimit';
import { afterMultipartUploadCompleteAudio, afterMultipartUploadCompleteVideo } from '../aws/mediaHelpers';
import { getErrorAlert, getErrorSnackbar } from './html';
import ejs from 'ejs';
import { getCensusCommunities } from './functions/census';
import { markdownApi } from './functions/markdownAPI';
import getDatabase from '../database';
import * as AUTH from '../MIDDLEWARE/authMiddleware';
import * as SURVEYS from './pages_helper/surveys';

const API_ROUTER = Router();
const upload = multer();

function ugcCodeRoute(req:Request,res:Response) {
  try {
    const nonce = req.session.jsNonce;
    const codeTemplate =`
      <style>
      <%-locals.css%>
      </style>
      <%-locals.html%>
      <script nonce="<%=locals.nonce%>">
        (function(){
          <%-locals.js%>
        })();
      </script>
    `;
    const { html, css, js } = req.body;
    if (typeof html!=='string'||typeof css!=='string'||typeof js !=='string') {
      return res.status(200).send(getErrorAlert('HTML CSS and Javascript must be a string.'));
    }
    const ret = ejs.render(codeTemplate,{html,css,js,nonce});
    const finalRet = ejs.render(`<iframe style="width: 100%; min-height: 500px; margin-top: 0.5rem; display: block;" srcdoc="<%=ret%>"></iframe>`,{ ret });;
    return res.status(200).send(finalRet);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong rendering the output.'));
  }
}
async function embedPost(req:Request,res:Response) {
  try {
    const { 
      embed_type
    } = req.body;
    if (!!!VALID_EMBED_TYPES.has(embed_type as any)) throw new Error('Embedding type not recognized');
      if (embed_type==='news'){
        const { url }:EmbedNews = req.body;
        if (typeof url!== 'string'||!!!VALID_URL_REGEX.test(url)) throw new Error('URL should be a string and a valid URL for embedding news content.');
        const resp = await embedNews(req,{url});
        return res.status(200).json({...resp});
      } else {
        throw new Error('Embed Type not recognized.');
      }
  } catch (error) {
    console.error(error);
    // Errors are handles on the client
    return res.status(500).json({ error: 'Something went wrong.'});
  }
}
async function getImageSignedURL(req:Request,res:Response) {
  const sizeStr = String(req.query['size']);
  const widthStr = String(req.query['width']);
  const heightStr = String(req.query['height']);
  const { image_name } = req.params;
  try {
    const {user_id,ip_id} = getUserIdAndIpIdForImageUpload(req);
    if (!!!ip_id) throw new Error("Must have registered ip address to upload image to database.");
    const signedUrl = await getPostImageSignedUrl(image_name, { image_name, size: sizeStr, width: widthStr, height: heightStr, user_id: String(user_id), ip_id: String(ip_id)  });
    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
async function getAudioSignedURL(req:Request,res:Response) {
  const { audio_name, parts:partsStr } = req.params;
  const sizeInBytesStr = String(req.query['size'])|| '0';
  try {
    if (req.session.uploadedAudio&&req.session.uploadedAudio>=3) {
      return res.status(500).json({ error: 'You are only allowed to upload 3 videos per sesison.' });
    }
    const user_id = req.session.auth?.userID ||  null;
    const ip_id = req.session.ip_id;
    if (!!!ip_id) throw new Error("Must have ip_id before uploading audio.");
    const parts = parseInt(partsStr);
    if (isNaN(parts) || parts < 0 || parts > 90) throw new Error('Invalid parts parameter');
    const metadata = { 
      original: String(true), 
      size: sizeInBytesStr, 
      ip_id: String(ip_id), 
      user_id: String(user_id) 
    };
    const {signedUrls, UploadId, Key }  = await getPostAudioSignedUrls(audio_name,parts,metadata);
    return res.status(200).json({ urls: signedUrls, UploadId, Key });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
async function completeAudio(req:Request,res:Response) {
  try {
    const { Parts, UploadId, Key }:{Parts: {ETag: string, PartNumber: number}[], UploadId: string, Key: string} = req.body;
    await completeMultipartUploadAudio(Parts, UploadId, Key);
    return afterMultipartUploadCompleteAudio(req,res,Key);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong completing the multipart upload.')
  }
}
async function getVideoSignedURL(req:Request,res:Response) {
  const { video_name, parts:partsStr } = req.params;
  const heightStr = req.query['height'] || null;
  const sizeInBytesStr = req.query['size'] || '0';
  const height = heightStr ? parseFloat(String(heightStr)) : null;
  if (!!!height || height < 100) {
    return res.status(500).json({ error: 'Height of a video must be at least 100px.' });
  }
  const sizeInBytes = parseFloat(String(sizeInBytesStr));
  try {
    if (req.session.uploadedVideo&&req.session.uploadedVideo>=3) {
      return res.status(500).json({ error: 'You are only allowed to upload 3 videos per session.' });
    }
    const user_id = req.session.auth?.userID ||  null;
    const ip_id = req.session.ip_id;
    if (!!!ip_id) throw new Error("Must have ip_id before uploading audio.");
    const parts = parseInt(partsStr);
    if (isNaN(parts) || parts < 0 || parts > 91) throw new Error('Invalid parts parameter'); 
    const metadata = { 
      width: String(null), 
      height: String(height), 
      original: String(true), 
      size: String(sizeInBytes), 
      ip_id: String(ip_id), 
      user_id: String(user_id) 
    };
    const {signedUrls, UploadId, Key } = await getPostVideoSignedUrls(video_name,parts,metadata);
    return res.status(200).json({ urls: signedUrls, UploadId, Key });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
async function completeVideo(req:Request,res:Response) {
  try {
    const { Parts, UploadId, Key }:{Parts: {ETag: string, PartNumber: number}[], UploadId: string, Key: string} = req.body;
    await completeMultipartUploadVideo(Parts, UploadId, Key);
    return afterMultipartUploadCompleteVideo(req,res,Key);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong completing the multipart upload.')
  }
}

async function onPostFirebaseToken(req:Request,res:Response) {
  try {
    const  { token } = req.body;
    if (typeof token !== 'string') {
      throw new Error("Unable to retrieve token: " + token + " from API request.");
    }
    const ip_id = req.session.ip_id;
    const user_id = req.session.auth?req.session.auth.userID : null;
    if (typeof ip_id !== "number") {
      throw new Error("Must have ip_id to send push notification.");
    }
    const query = `INSERT INTO firebase_tokens (ip_id,user_id,token) VALUES ($1,$2,$3) ON CONFLICT (ip_id) DO UPDATE SET user_id=$2, token=$3;`;
    await getDatabase().query(query,[ip_id,user_id,token]);
    return res.status(200).json({ success: "Successfully stored direbase token in database." });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Something went wrong posting the firebase token." });
  }
}
async function getYesterdayDiary(req:Request,res:Response) {
  try {
    const query = `WITH diary_cte AS (
      SELECT id FROM diary ORDER BY diary.id DESC OFFSET 1 LIMIT 1
    ) SELECT article.lexical_state AS lexical_state FROM diary 
    JOIN article ON article.diary_id=diary.id
    JOIN diary_cte ON diary.id=diary_cte.id
    WHERE article.diary_id=diary_cte.id ORDER BY article.v DESC LIMIT 1;`;
      const dbResp = await getDatabase().query(query);
      if (!!!dbResp.rows.length) {
        throw new Error("Something went wrong getting the lexical state.");
      }
      const lexical_state = dbResp.rows[0].lexical_state;
      if (!!!lexical_state) throw new Error("Something went wrong getting the lexical state.");
      return res.status(200).json({ "lexical_state": lexical_state });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Something went wrong getting the lexical state.");
  }
}



async function getLexicalStateFromNotebookFile(req:Request,res:Response) {
  try {
    const file = req.file;

  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Something went wrong converting Notebook to Lexical State." });
  }
}

async function getLexicalStateFromTexFile(req:Request,res:Response) {
  try {
    const file = req.file;

  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: "Something went wrong converting TeX to HTML." });
  }
}

API_ROUTER.post('/ugc-code',getRateLimit(60000,200),bodyParser.json({}),ugcCodeRoute);
API_ROUTER.post('/example-lexical',bodyParser.urlencoded({}),renderExampleLexical);
/* --------------------------------- Design System and Other --------------------------- */
API_ROUTER.post('/search-icons/?',getRateLimit(60000,100),bodyParser.urlencoded({extended: true}),searchIcons);
API_ROUTER.post('/search-mui-icons/?',getRateLimit(60000,100),bodyParser.urlencoded({ extended: true}), searchIcons);
API_ROUTER.post('/search-coding-languages/?',getRateLimit(60000,10),bodyParser.urlencoded({extended: true}),codingLanguages);
API_ROUTER.post('/circle-example/?',getRateLimit(60000,20),bodyParser.urlencoded({extended: true}),handleCircleExample);
API_ROUTER.post('/polygon-example/?',getRateLimit(60000,20),bodyParser.urlencoded({extended:true}),handlePolygonExample);
API_ROUTER.post('/example-state-select/?',getRateLimit(60000,100),bodyParser.urlencoded({extended: true}),exampleStateSelect);
/**
* Get Census commui
*/
API_ROUTER.post('/device-position/?',getRateLimit(60000,100),bodyParser.json(),getCensusCommunities);
API_ROUTER.post('/table',getRateLimit(60000,100),upload.single('upload-data-to-table-2'),getTableHTML);
API_ROUTER.post('/markdown',getRateLimit(60000,100),bodyParser.urlencoded({ }),markdownApi);
API_ROUTER.post('/html-table-to-csv-json',getRateLimit(60000,100),bodyParser.urlencoded({ }),tableToCsvAndJsonApiRoute);

/**
 * In layout.ejs, there is a hidden div that polls this api route every second to 
 * figure out if create_ip_address_row (i.e. - 
 * figure out if this value is not undefined) has been 
 * set in cache. If it has not been set in cache, it returns the same element. Else, 
 * it returns the cookie banner.
 */
API_ROUTER.get('/cookie-banner/?',getRateLimit(60000,1000),handleCookieBanner);

/* ---------------------------------------------- Settings -------------------------------- */
/**
 * - Called in forms/settings-form.ejs 
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.post('/settings/?',getRateLimit(60000,500),bodyParser.urlencoded({extended: true}),settingsHandler);
/**
 * - Called in layout.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 * 
 * - Use this route to get the settings - if they exist - for a user's ip address and to make the 
 * asynchronous call using node-ip_info to get information about the user's ip address
 * - If the user's ip address does not exist in cache, then send the page back to the user with 
 * a hidden element that can be used to set the initial settings in cache
 */
API_ROUTER.get('/get-settings-and-form/?',getRateLimit(60000,500),getIpLocationAndCheckDbSettings,getSettingsAndForm); // Called in layout.ejs
/**
 * - Called in partials/settings.ejs
 * - Renders forms/settings-form.ejs
 */
API_ROUTER.get('/settings-form/?',getRateLimit(60000,100),getSettingsForm);
/**
 * - Called in partials/navbar.ejs
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.get('/light-mode-dark-mode/?',getRateLimit(60000,200),lightModeDarkMode);
/**
 * - Called in forms/settings-form.ejs 
 * - Renders partials/settings.ejs
 * - **Should remove hx-preserve before request**
 */
API_ROUTER.get('/settings-form-reset/?',getRateLimit(60000,200),resetThemeColors);
/**
 * Call this route when you need to create a row in the database to store the user's 
 * settings according to his or her ip address. This should only be called when
 * you haven't encountered a new ip address  and you want to store information for it in the 
 * database
 */
API_ROUTER.get('/create-ip-settings/?',getRateLimit(60000,200),createIPSettingsInDatabase);
/**
 * Call this route when you need to update the user's settings. This should be called anytime the settings 
 * change (e.g., settings form change, light mode / dark mode, settings reset) 
*/
API_ROUTER.get('/save-settings/?',getRateLimit(60000,200),updateSettingsInDatabase);
/** 
 * This API Route should be called in layout.ejs after the user has accepted 
 * the application's use of preferences cookies and if we know that the user already has their settings 
 * saved in the database
 */
API_ROUTER.get('/set-settings-after-cookie/?',getRateLimit(60000,100),setSettingsAfterCookie);


/* ---------------------------------------- File Inputs ------------------------------------------ */

API_ROUTER.get('/signed-url/image/:image_name/?',getRateLimit(60000,100),getImageSignedURL);

/**
 * 6 MB per part * 90 Parts -> 540MB max 
 */
API_ROUTER.get('/signed-url/audio/:audio_name/:parts/?',getAudioSignedURL);
/**
 * API Path To Call after completing uploading the parts of the audio / video file on 
 * the client. This api route should update the metadata of the uploaded file, 
 * transcode the file to different formats, generate closed captions, and for video files, 
 * generate and post a thumbnail video to the client
 */
API_ROUTER.post('/complete-audio/?',bodyParser.json(),completeAudio);
/**
 * For videos, we actually need to use the width and height metadata to generate the video 
 * using ffmpeg
 */
API_ROUTER.get('/signed-url/video/:video_name/:parts/?',getVideoSignedURL);
/**
 * API Path To Call after completing uploading the parts of the audio / video file on 
 * the client. This api route should update the metadata of the uploaded file, 
 * transcode the file to different formats, generate closed captions, and for video files, 
 * generate and post a thumbnail video to the client
 */
API_ROUTER.post('/complete-video/?',bodyParser.json(),completeVideo);


/* ---------------------------------------- Lexical ------------------------------------------ */
type VALID_EMBED_TYPES = 'news'|'facebook-page'|'facebook-post'|'facebook-video'|'tiktok'|'tweet'|'twitter-timeline'|'reddit'|'instagram';
const VALID_EMBED_TYPES = new Set([
  'news',
  'facebook-page',
  'facebook-post',
  'facebook-video',
  'tiktok',
  'tweet',
  'twitter-timeline',
  'reddit',
  'instagram'
] as const);
const VALID_URL_REGEX= /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
/**
 * Embed news articles as of right now
 */
API_ROUTER.post('/embed/?',getRateLimit(60000,100),bodyParser.json(),embedPost);
/**
 * Get lexical HTML. The reason why this route exists is because you may want to have multiple lexical editors on the page at once
 */
API_ROUTER.get('/lexical/:type/:other?',getRateLimit(60000,600),getLexical);
API_ROUTER.get('/lexical/:type/?',getRateLimit(60000,600),getLexical);
API_ROUTER.post('/lexical-table/?',getRateLimit(60000,200),upload.single('file'),lexicalTable);

/* -------------------------------- Analytics ----------------------------------- */

API_ROUTER.get('/get-file/:type/frankmbrown/:key',getRateLimit(60000,5),handleGetFileFromS3);
API_ROUTER.get('/get-file/:type/civgauge/:key',getRateLimit(60000,5),handleGetFileFromS3);

API_ROUTER.post('/firebase-token',getRateLimit(60000,5),bodyParser.json({}),onPostFirebaseToken);

API_ROUTER.get('/reload-yesterday-diary',getRateLimit(60000,10),AUTH.isAdmin,getYesterdayDiary);

API_ROUTER.get('/download-survey/:id',getRateLimit(60000,30),SURVEYS.downloadSurvey);
API_ROUTER.post('/save-survey',getRateLimit(60000,20),SURVEYS.postSaveSurvey);

API_ROUTER.use((req,res) => {
  if (req.headers['content-type']==="application/json") {
    return res.status(404).json({ error: "API route not found." });
  } else {
    return res.status(404).send(getErrorSnackbar("Path not found"));
  }
})

API_ROUTER.post('/lexical-file-upload/notebook',upload.single('upload-ipynb-file-input'),getLexicalStateFromNotebookFile);
API_ROUTER.post('/lexical-file-upload/tex',upload.single('upload-tex-file-input'),getLexicalStateFromTexFile);


export default API_ROUTER; 