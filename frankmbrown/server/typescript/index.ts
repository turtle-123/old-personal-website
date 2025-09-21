/* ----------------------- Imports -------------------------- */
import express, { Express, NextFunction, Request, Response } from "express";
import cors from 'cors';
import requestIp from 'request-ip';
import * as path from 'node:path';
import logRequest from "./MIDDLEWARE/logRequest";
import setInitialSettings from "./MIDDLEWARE/setInitialSettings";
import setIpInfo from "./MIDDLEWARE/setIpInfo";
import setDeviceInformation from "./MIDDLEWARE/setDeviceInformation";
import session from "express-session";
import PostgresSessionStore from 'connect-pg-simple';
import { getCacheConnection } from "./database/cache";
import env from "./utils/env";
import IS_DEVELOPMENT from "./CONSTANTS/IS_DEVELOPMENT";
import expressLayouts from 'express-ejs-layouts';
import type { Settings } from "./types";
import getNonce from "./utils/getNonce";
import COMPONENTS_ROUTER from "./ROUTER/COMPONENTS_ROUTER";
import API_ROUTER from "./ROUTER/API_ROUTER";
import PAGES_ROUTER from "./ROUTER/PAGES_ROUTER";
import generateSitemap from "./sitemap/generateSitemap";
import STATIC_ROUTER from "./ROUTER/STATIC_ROUTER";
import bodyParser from "body-parser";
import { validateCSRF } from "./MIDDLEWARE/authMiddleware";
import getDatabase from "./database";
import { getErrorAlert } from "./ROUTER/html";
import axios from 'axios';
import { afterAudioTranscriptionComplete, afterImageHasBeenUploadedLambda, afterVideoTranscriptionComplete } from "./aws/mediaHelpers";
import { Server as IoServer } from 'socket.io';
import { createServer } from "node:http";
import * as SOCKET from './socket';
import type { IncomingMessage } from "node:http";
import type { SessionData } from 'express-session';
import type { Socket } from 'socket.io';
import ANALYTICS_ROUTER from "./ROUTER/ANALYTICS_ROUTER";

/* ----------------------- Types -------------------------- */
declare module 'express-session' {
  interface SessionData {
    session_id: string,
    paths: string[],
    settings: Settings,
    user_location: GeolocationPosition,
    census_communities: number[],
    device: {
      phone: boolean,
      tablet: boolean,
      desktop: boolean,
      browser: string|undefined,
      temp: string
    },
    ip_id: number,
    ip: {
      address: string|null,
      type: 0|4|6 // 0 for invalid, 4 for ipv4, 6 for ipv6
    },
    device_location: {lat: number, lng: number, time: number}|false|null,
    /**
     * ip_location: {
     *  false: something went wrong getting ip address,
     *  IpInfo: everything went as planned,
     *  undefined: haven't tried to get ip_location yet
     * }
     */
    ip_location: {lat:number, lng: number, temp: string},
    
    jsNonce: string,
    cssNonce: string,
    csrf_token: string,
    snackbarMessage: {
      showMessage: boolean,
      message: string
    },
    cookiePreferences: {
      necessary: boolean,
      preferences: boolean,
      statistics: boolean,
      showedBanner: boolean
    },
    create_ip_address_row: boolean,
    creating_ip_address_row: boolean,
    deleting_ip_address_row: boolean,
    ip_data_string: string,
    disableSettingsButtons: boolean,
    auth: {
       /**
     * 0=not logged in
     * 1=logged in
     * 2 = subscribed
     * 3 = owner
     */
      level: 0|1|2|3,
      loginAttempts: number,
      userID: undefined|number,
      createAccountAttempts: number,
      createAccountEmailsSent: number,
      resetCredentialsAttempts: number,
      resetCredentialsEmailsSent: number,
      email: string|undefined ,
      username: string|undefined,
      banned: boolean,
      date_created: number
    },
    tempCreateAccount: {
      email: string,
      username: string,
      password: string,
      tfa_code: string 
    },
    tempResetCredentials: {
      email: string,
      username: string,
      password: string,
      tfa_code: string 
    },
    diary: {
      todayID: number,
      todayState: any
    },
    startOfDay: number,
    cachedEmbedding: number[],
    cachedEmbeddingString: string,
    uploadedAudio: number,
    uploadedVideo: number,
    last_sent_chat_message: number
  } 
};

declare global {
  namespace Express {
    export interface Request {
      cache: Awaited<(ReturnType<typeof getCacheConnection>)>,
      isHxRequest: boolean
    }
  }
}
interface SessionIncomingMessage extends IncomingMessage {
    session: SessionData
};
declare global {
  var userAgent: string;
}
export interface SessionSocket extends Socket {
    request: SessionIncomingMessage
};

/* ----------------------- Constants -------------------------- */

const app: Express = express();
const CORS_OPTIONS = {
  origin: !!!IS_DEVELOPMENT ? ['https://frankmbrown.net'] : '*',
  preflightContinue: false,
  optionsSuccessStatus: 200,
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
};
app.disable('etag');
app.disable("x-powered-by");
app.set('views',path.resolve(__dirname,'..','..','views'));
app.set('view engine', 'ejs');
app.set('trust proxy',true);
const WEBSOCKET_HEARTBEAT = 20 * 1000; // 10 Seconds
const WEBSOCKET_HEARTBEAT_VALUE = 1;
const PORT = env.PORT || 8080;
const SESSION_SECRET = env.SESSION_SECRET;
if (!!!SESSION_SECRET) throw new Error('Unable to get SESSION_SECRET from env.');
const pgSession = PostgresSessionStore(session);
const MAX_AGE = 1000*60*60*4; // Session Length
const session_handler = session({
  cookie: {
    maxAge: MAX_AGE, // 4 hours
    sameSite: !!!IS_DEVELOPMENT ? 'strict' : false,
    secure: !!!IS_DEVELOPMENT,
    httpOnly: true
  },
  name: "sessionId", /* Use Generic session name according to express best practcies: https://expressjs.com/en/advanced/best-practice-security.html */
  resave: false, // required: force lightweight session keep alive (touch)
  rolling: true,
  saveUninitialized: false,
  secret: SESSION_SECRET,  // recommended: only save session when data exists
  store: new pgSession({
    pool: getDatabase(),

  }),
  unset: 'keep'
})
var jsNonce = getNonce();

export function resetNonce() {
  jsNonce = getNonce();
}
export function getJsNonce() {
  return jsNonce;
}

const CORS = cors(CORS_OPTIONS);

/* --------------------- Helper Functions ------------------ */ 
app.post('/api/on-image-upload',bodyParser.json(),afterImageHasBeenUploadedLambda);
app.post('/api/on-video-transcription-complete',bodyParser.json(),afterVideoTranscriptionComplete);
app.post('/api/on-audio-transcription-complete',bodyParser.json(),afterAudioTranscriptionComplete);

/* --------------------- Helper Functions ------------------ */ 

function awsHealthCheck(req:Request,res:Response,next:NextFunction) {
  if (req.header('http_user_agent')==="ELB-HealthChecker/2.0") {
    return res.status(200).send('');
  } else {
    next();
  }
}
function setCacheConnection(req:Request,res:Response,next:NextFunction) {
  req.cache = getCacheConnection();
  next();
}
function setNonce(req:Request,res:Response,next:NextFunction) {
  jsNonce=getNonce();
  next();
}
function handleSessionReset(req:Request,res:Response,next:NextFunction) {
  const hxRequest = Boolean(req.get('hx-request'));
  const nonceNotSet = Boolean((!!!req.session.jsNonce));
  if (hxRequest&&nonceNotSet) {
    req.session.snackbarMessage = {showMessage: true, message: /*html*/`
    <div class="snackbar success" aria-hidden="false" role="alert" data-snacktime="4000">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Check"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
      <p class="p-sm">Your session has been reset!</p>
      <button class="icon medium" type="button" data-close-snackbar aria-label="Close Snackbar">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
      </button>
    </div>
    `};
    if (!!!jsNonce) resetNonce();
    req.session.jsNonce=jsNonce;
    setContentSecurityPolicy(req,res);
    const reloadScript = `<script nonce="${jsNonce}">
  (() => {
    setTimeout(() => {
      window.location.reload();
    },500);
  })()
</script>`;
    return res.status(200).send(reloadScript);
  } else if (nonceNotSet){
    if (!!!jsNonce) resetNonce();
    req.session.jsNonce=jsNonce;
    setContentSecurityPolicy(req,res);
    next();
  } else {
    next();
  }
}

function setContentSecurityPolicy(req:Request,res:Response) {
  res.setHeader("Cross-Origin-Opener-Policy","same-origin");
  res.setHeader("Cross-Origin-Resource-Policy","same-origin");
  res.setHeader("Origin-Agent-Cluster","?1");
  res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security","max-age=15552000; includeSubDomains");
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Download-Options","noopen");
  res.setHeader("X-Frame-Options","SAMEORIGIN");
  res.setHeader("X-Permitted-Cross-Domain-Policies","none");
  const connectSrc="connect-src 'self' https://www.tiktok.com/oembed https://lf16-tiktok-web.tiktokcdn-us.com/obj/tiktok-web-tx/tiktok/falcon/embed/embed_lib_v1.0.13.css https://cdn.jsdelivr.net/npm/d3@7/+esm https://ingress-image.s3.us-east-1.amazonaws.com https://ingress-audio.s3.us-east-1.amazonaws.com https://ingress-video.s3.us-east-1.amazonaws.com https://*.googleapis.com *.google.com https://*.gstatic.com https://image.storething.org https://audio.storething.org https://video.storething.org https://geography.storething.org https://cdn.storething.org data: blob:;";
  const defaultSrc="default-src 'self';";
  const fontSrc="font-src 'self' https://cdn.storething.org https://fonts.gstatic.com;";
  const frameSrc="frame-src *.google.com platform.twitter.com https://www.youtube-nocookie.com/ https://www.tiktok.com/embed/ https://www.instagram.com/ https://embed.reddit.com/;";
  const imgSrc="img-src 'self' https://i.ytimg.com blob: https://image.storething.org https://cdn.storething.org  https://*.googleapis.com https://*.gstatic.com *.google.com *.googleusercontent.com data:;";
  const manifestSrc="manifest-src 'self';";
  const mediaSrc="media-src blob: 'self' https://image.storething.org https://audio.storething.org https://cdn.storething.org https://video.storething.org;";
  const objectSrc="object-src 'self';";
  if (!!!req.session.jsNonce) {
    req.session.jsNonce = jsNonce;
  }
  const scriptSrc=`script-src 'nonce-${req.session.jsNonce}' 'strict-dynamic' https: 'unsafe-eval' blob: https://platform.twitter.com/widgets.js https://www.tiktok.com/embed.js https://embed.reddit.com/widgets.js https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js https://cdn.storething.org https://cdn.bokeh.org;`;
  const styleSrc=`style-src 'unsafe-inline' 'self' https://fonts.googleapis.com https://lf16-tiktok-web.tiktokcdn-us.com/obj/tiktok-web-tx/tiktok/falcon/embed/embed_lib_v1.0.12.css https://cdn.storething.org;`; // CSP does not allow inline styles if nonce is present in style-src
  const workerSrc="worker-src 'self' https://cdn.storething.org blob:;";
  const fetchDirectives = [connectSrc,defaultSrc,fontSrc,frameSrc,imgSrc,manifestSrc,mediaSrc,objectSrc,scriptSrc,styleSrc,workerSrc].join(' ');
  const baseUri = `base-uri https://frankmbrown.net;`;
  const documentDirectives = [baseUri].concat(' ');
  const formAction = "form-action 'self';";
  const frameAncestors="frame-ancestors 'self';"; // https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html#content-security-policy-frame-ancestors-examples
  const navigationDirectives=[formAction,frameAncestors].join(' ');
  const reportTo="report-to /analytics/csp-violation;";
  const reportUri = "report-uri https://frankmbrown.net/analytics/csp-violation;";
  const reportingDirectives = [reportTo,reportUri].join(' '); 
  const upgradeInsecureRequests="upgrade-insecure-requests;";
  const otherDirectives = [upgradeInsecureRequests].join(' ');
  const CONTENT_SECURITY_POLICY = [fetchDirectives,documentDirectives,navigationDirectives,reportingDirectives,otherDirectives].join(' ');
  res.setHeader("Content-Security-Policy",CONTENT_SECURITY_POLICY);
  res.setHeader('Permissions-Policy','accelerometer=(self "https://www.tiktok.com"), speaker-selection=self');
  res.setHeader("service-worker-allowed",'/');
  return;
}

function setContentSecurityPolicyMiddleware(req:Request,res:Response,next:NextFunction) {
  if (!!!IS_DEVELOPMENT) {
    setContentSecurityPolicy(req,res);
    next();
  } else {
    res.setHeader("service-worker-allowed",'/');
    next();
  }
}
function setCsrfToken(req:Request,res:Response,next:NextFunction) {
  const csrfNotSet = Boolean(!!!req.session.csrf_token);
   if (csrfNotSet){
    req.session.csrf_token = getNonce();
   }
   next();
}
function redirectToNonWWW(req:Request,res:Response,next:NextFunction) {
  // Check if host starts without 'www.'
  if (req.subdomains.length>=1) {
      const redirectUrl = `https://${req.hostname}${req.originalUrl}`;
      return res.redirect(301, redirectUrl); // 301 for permanent redirect
  }
  next();
}
function onFlaskServerMiss(req:Request,res:Response,next:NextFunction) {
  return res.status(200).send(getErrorAlert("Python/Flask route not currently working!",'<svg viewBox="0 0 448 512" title="python" focusable="false" inert tabindex="-1"><path d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"></path></svg>'))
}
async function getVTTFile(req:Request,res:Response) {
  try {
    const { type, name } = req.params;
    if (!!!type) throw new Error("Unable to get `type` from VTT request params.");
    if (!!!name) throw new Error("Unable to get `name` from VTT request params.");
    if (type==="audio") {
      const file = await axios.get(`https://audio.storething.org/frankmbrown/${name}/${name}.vtt`,{ timeout: 2000 });
      if (file) {
        const body = file.data;
        return res.status(200).send(body);
      }
    } else if (type==="video") {
      const file = await axios.get(`https://video.storething.org/frankmbrown/${name}/${name}.vtt`,{ timeout: 2000 });
      if (file) {
        const body = file.data;
        return res.status(200).send(body);
      }
    }
  } catch (e) {
    console.error("Unable to get vtt file.");
    return res.status(200).send("Unable to get WebVTT file.");
  }
  return res.status(400).end();
}
function portCallback() {
  console.log('SERVER IS RUNNING ON PORT ',PORT);
}
function setSessionID(req:Request,res:Response,next:NextFunction) {
  req.session.session_id = req.sessionID;
  next();
}
/**
CREATE TABLE requests (
	id bigint,
  fresh boolean NOT NULL,
  hostname TEXT NOT NULL,
  method TEXT NOT NULL,
  original_url TEXT NOT NULL,
  path TEXT NOT NULL,
  protocol TEXT NOT NULL,
  secure BOOLEAN NOT NULL,
  ip TEXT,
	ip_id int REFERENCES ip_info(id) ON DELETE CASCADE
);
 */
async function logRequestInDatabase(req:Request,res:Response,next:NextFunction) {
  try {
    if (!!!IS_DEVELOPMENT) {
      const { fresh, hostname, method, originalUrl:original_url, path, protocol, secure, ip  } = req;
      const ip_id = req.session.ip_id || null;
      if (hostname!=='localhost') {
        await getDatabase().query(`INSERT INTO requests (fresh,hostname,method,original_url,path,protocol,secure,ip,ip_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9);`,[fresh, hostname, method,original_url,path,protocol,secure,ip,ip_id]);
      }
    }
    next();
  } catch (e) {
    console.error("Unable to log request.",e);
    next();
  }
}
/* ---------------------- Functions ------------------------- */

app.use(
  bodyParser({limit: '50mb'}),
  expressLayouts,
  awsHealthCheck,
  setCacheConnection,
  session_handler,
  setSessionID,
  logRequest,
  setInitialSettings,
  requestIp.mw(),
  setIpInfo,
  setDeviceInformation,
  setNonce,
  redirectToNonWWW,
  setCsrfToken,
  setContentSecurityPolicyMiddleware,
  logRequestInDatabase,
  CORS,
  handleSessionReset,
  validateCSRF
);
app.use('/firebase-messaging-sw.js',express.static(path.resolve(__dirname,'..','..','static','js','firebase-messaging-sw.js')))
app.use('/favicon.ico',express.static(path.resolve(__dirname,'..','..','static','favicon.ico')));
app.use('/manifest.json',express.static(path.resolve(__dirname,'..','..','static','manifest.json')));
app.use('/robots.txt',express.static(path.resolve(__dirname,'..','..','static','robots.txt')));
app.use('/browserconfig.xml',express.static(path.resolve(__dirname,'..','..','static','browserconfig.xml')));
app.get('/sitemap.xml/?',generateSitemap);
app.get('/vtt/:type/:name',getVTTFile);
app.use('/static',STATIC_ROUTER);
app.use('/analytics',ANALYTICS_ROUTER);
app.use('/api',API_ROUTER);
app.use('/components',COMPONENTS_ROUTER);
app.use('/python',onFlaskServerMiss);
app.use(PAGES_ROUTER);

const server = createServer(app); // app.listen(PORT,portCallback);

const io = new IoServer(server,{
  cors: CORS_OPTIONS 
});
io.engine.use(session_handler);
io.engine.generateId = SOCKET.ioEngineGenerateId;
/* @ts-ignore */
io.on("connection",SOCKET.handleIOConnection);
// https://socket.io/docs/v4/server-instance/
io.engine.on('connection_error',SOCKET.onIoEngineConnectionError)


/**
 * Get Number of connected clients 
 * @param namespace 
 * @returns 
 */
export function getWebSocketClients(namespace?:string) {
  if (namespace) return io.of(namespace).sockets.size;
  else return io.engine.clientsCount;
}
export function getWebSocketServer() {
  return io;
}
export async function getSockets(room?:string) {
  if (room) return io.in(room).fetchSockets();
  else return io.fetchSockets();
}

server.listen(PORT,undefined,portCallback);
server.on('error',(e) => {
  console.error(e);
  process.exit(1);
});
//Error handler
process.on('uncaughtException', function (exception) {
  // handle or ignore error
  console.log(exception);
  process.exit(1);
});
