// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
import { CacheFirst } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import type { RouteMatchCallback } from 'workbox-core'
import {CacheableResponsePlugin } from 'workbox-cacheable-response';
import { initializeApp } from "firebase/app";
import { getMessaging  } from "firebase/messaging/sw";
import { onBackgroundMessage } from "firebase/messaging/sw";

var SERVICE_WORKER_REGISTRATION: ServiceWorkerRegistration|undefined;

/* -------------------------- Static Resource Cache ----------------------------- */
const shouldCacheResourceCb:RouteMatchCallback = ({ url }) => {
  return Boolean(
    (url.origin==="https://cdn.storething.org"&&(url.pathname.startsWith('/frankmbrown/css')||url.pathname.startsWith('/frankmbrown/js')||url.pathname.startsWith('/frankmbrown/fonts')||(url.pathname.startsWith('/frankmbrown/asset')))) || 
    url.pathname==="/favicon.ico"
  )
}
const CacheStaticAssets = new CacheFirst({ cacheName: "static-cache" });
registerRoute(shouldCacheResourceCb,CacheStaticAssets);

/* -------------------------- Page Cache ----------------------------- */
const cachePageRoute:RouteMatchCallback = ({ url, request }) => {
  return url.origin==="https://frankmbrown.net" && request.headers.get('hx-target')==="PAGE"
}
const isCacheablePage = new CacheableResponsePlugin({
  statuses: [0,200],
  headers: {
    "X-Is-Cacheable": "true"
  }
});
const NetworkFirstCachePages = new CacheFirst({
  cacheName: "page-cache",
  plugins: [isCacheablePage] 
});
registerRoute(cachePageRoute,NetworkFirstCachePages);

/* -------------------------- Image Cache ----------------------------- */
const cacheImage:RouteMatchCallback = ({ url, request }) => {
  return url.origin==="https://image.storething.org" && request.headers.get('hx-target')==="PAGE"
}
const ImageCache = new CacheFirst({ cacheName: "image-cache" });
registerRoute(cacheImage,ImageCache);

/* -------------------------- Message Between Window and Service Worker ----------------------------- */

function onMessageFromWindow(e:MessageEvent) {
  switch (e.data.type) {
    case "SERVICE_WORKER_REGISTRATION": {
      const payload = e.data.payload as ServiceWorkerRegistration|void|undefined;
      if (payload) {
        SERVICE_WORKER_REGISTRATION = payload;
      }
      break;
    }
    default: {
      console.error("Unrecognized Service Worker Event: ",e.data.type);
      break;
    }
  }
}

if (self&&self.addEventListener) self.addEventListener("message",onMessageFromWindow);

/* ----------------------------- Service Worker and Push Notifications ------------------------------------ */ 
type Notification = {
  badge: string,
  body: string,
  data: {},
  dir: 'ltr',
  renotify: boolean,
  requireInteraction: boolean,
  silent: boolean,
  timestamp: number,
  title: string,
  tag: string
}
const firebaseConfig = {
  apiKey: "AIzaSyCPmzS434BPMQHnFnEPqQ5IP1qWV7tmj4w",
  authDomain: "personal-website-6ec90.firebaseapp.com",
  projectId: "personal-website-6ec90",
  storageBucket: "personal-website-6ec90.firebasestorage.app",
  messagingSenderId: "299346210453",
  appId: "1:299346210453:web:3aa9d4c63769e41488f59c"
};
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);
onBackgroundMessage(messaging,(payload) => {
  const notification = payload.notification as Notification;
  if (SERVICE_WORKER_REGISTRATION) {
    // @ts-ignore
    self.registration.showNotification(notification.title,notification);
  }
});