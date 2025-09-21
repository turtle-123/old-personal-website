import admin from 'firebase-admin';
import { initializeApp } from "firebase-admin/app";
import { getMessaging, MulticastMessage, WebpushConfig, WebpushNotification, type Message } from "firebase-admin/messaging";
import getDatabase from "../database";
import { RawData, WebSocketServer } from "ws";
import { Request } from 'express';
import { getUnixTime } from "../utils/time";
import ejs from 'ejs';
import BASE_PATH from '../CONSTANTS/BASE_PATH';
import path from 'node:path';
import { SessionSocket } from '..';

type NotificationType = 'create_annotation'| 'create_note'| 'update_note'| 'create_blog'| 'update_blog'| 'create_idea'| 'update_idea'| 'create_comment'| 'create_jupyter_notebook'| 'create_markdown_note'| 'create_stream_consciousness'| 'create_daily_reading'| 'create_tex_note'| 'create_link'| 'create_quote'| 'create_project'| 'project_update';

interface NotificationPreferencesResponse {
  id: number,
  create_annotation: boolean,
  create_note: boolean,
  update_note: boolean,
  create_blog: boolean,
  update_blog: boolean,
  create_idea: boolean,
  update_idea: boolean,
  create_comment: boolean,
  create_jupyter_notebook: boolean,
  create_markdown_note: boolean,
  create_stream_consciousness: boolean,
  create_daily_reading: boolean,
  create_tex_note: boolean,
  create_link: boolean,
  create_quote: boolean,
  create_project: boolean, 
  project_update: boolean,
  create_survey: boolean, 
  create_goodreads: boolean, 
  create_letterboxd: boolean, 
  create_game: boolean, 
  create_3d_design: boolean,
  create_electronics: boolean
}
interface NotificationPreferencesResponseIp extends NotificationPreferencesResponse  {
  ip_id: number
}
interface NotificationPreferencesResponseUser extends NotificationPreferencesResponse  {
  user_id: number
}
interface NotificationRow {
  id: number,
  topic: NotificationType,
  badge: string,
  title: string,
  body: string,
  icon: string,
  image: string|null,
  renotify: boolean,
  require_interaction: boolean,
  silent: boolean,
  tag: string,
  link: string,
  date_created: string, // bigint
  sent_notification: boolean
}
interface TokenWithNotifcationPreferences extends NotificationPreferencesResponse {
  ip_id: number,
  user_id: number|undefined,
  token: string, 
};
interface NotificationOptions {
  actions?: [],
  badge?: string,
  body?: string,
  data?: object,
  icon?: string,
  image?: string,
  renotify: false,
  requireInteraction: false,
  silent: false,
  tag?: string
}
const firebaseConfig = {
  apiKey: "AIzaSyCPmzS434BPMQHnFnEPqQ5IP1qWV7tmj4w",
  authDomain: "personal-website-6ec90.firebaseapp.com",
  projectId: "personal-website-6ec90",
  storageBucket: "personal-website-6ec90.firebasestorage.app",
  messagingSenderId: "299346210453",
  appId: "1:299346210453:web:3aa9d4c63769e41488f59c"
};

/**
TESTING RESET:

UPDATE notifications SET sent_notification=false;
DELETE FROM shown_notifications;
 */

// https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
const firebaseApp = initializeApp({...firebaseConfig, credential: admin.credential.cert(path.resolve(BASE_PATH,'..','certificates','firebase-cloud-messaging-service-account.json'))});
const messaging = getMessaging(firebaseApp);
const GET_FIREBASE_TOKENS_WITH_PREFERENCES = (min_id?:number) => `SELECT 
ft.id,
ft.ip_id,
ft.user_id,
ft.token, 
COALESCE(np_u.create_annotation,np_ip.create_annotation) create_annotation,
COALESCE(np_u.create_note,np_ip.create_note) create_note,
COALESCE(np_u.update_note,np_ip.update_note) update_note,
COALESCE(np_u.create_blog,np_ip.create_blog) create_blog,
COALESCE(np_u.update_blog,np_ip.update_blog) update_blog,
COALESCE(np_u.create_idea,np_ip.create_idea) create_idea,
COALESCE(np_u.update_idea,np_ip.update_idea) update_idea,
COALESCE(np_u.create_comment,np_ip.create_comment) create_comment,
COALESCE(np_u.create_jupyter_notebook,np_ip.create_jupyter_notebook) create_jupyter_notebook,
COALESCE(np_u.create_markdown_note,np_ip.create_markdown_note) create_markdown_note,
COALESCE(np_u.create_stream_consciousness,np_ip.create_stream_consciousness) create_stream_consciousness,
COALESCE(np_u.create_daily_reading,np_ip.create_daily_reading) create_daily_reading,
COALESCE(np_u.create_tex_note,np_ip.create_tex_note) create_tex_note,
COALESCE(np_u.create_link,np_ip.create_link) create_link,
COALESCE(np_u.create_quote,np_ip.create_quote) create_quote,
COALESCE(np_u.create_project,np_ip.create_project) create_project,
COALESCE(np_u.project_update,np_ip.project_update) project_update,
COALESCE(np_u.create_survey,np_ip.create_survey) create_survey,
COALESCE(np_u.create_goodreads,np_ip.create_goodreads) create_goodreads,
COALESCE(np_u.create_letterboxd,np_ip.create_letterboxd) create_letterboxd,
COALESCE(np_u.create_game,np_ip.create_game) create_game,
COALESCE(np_u.create_3d_design,np_ip.create_3d_design) create_3d_design,
COALESCE(np_u.create_electronics,np_ip.create_electronics) create_electronics
FROM firebase_tokens ft 
JOIN notification_preferences_ip np_ip ON
ft.ip_id=np_ip.ip_id
LEFT JOIN notification_preferences_user np_u ON
ft.user_id=np_u.user_id
${min_id?'WHERE ft.id>=$1':''}
ORDER BY ft.id ASC LIMIT 500;`;
const GET_NOTIFICATION_FOR_CLIENT = (user:boolean) => (`WITH notifications_to_get AS (
	SELECT id 
	FROM 
	notifications
	EXCEPT
	SELECT notifications.id id
	FROM 
	notifications 
	JOIN
	shown_notifications 
  ON notifications.id=shown_notifications.notification_id
	JOIN 
	firebase_tokens
	ON firebase_tokens.id=shown_notifications.token_id
	JOIN 
  ${user ? `notification_preferences_user 
ON notification_preferences_user.user_id=firebase_tokens.user_id
WHERE notification_preferences_user.user_id=$1 AND notifications.date_created>$2` : `notification_preferences_ip 
ON notification_preferences_ip.ip_id=firebase_tokens.ip_id
WHERE notification_preferences_ip.ip_id=$1 AND notifications.date_created>$2`}
) SELECT * FROM notifications 
LEFT JOIN notifications_to_get
ON notifications.id=notifications_to_get.id
WHERE notifications_to_get.id IS NOT NULL AND notifications.date_created>$2
ORDER BY notifications.date_created ASC LIMIT 100;`);
const GET_NEW_NOTIFICATIONS = `WITH update_query AS (
  UPDATE notifications SET sent_notification=true WHERE sent_notification=false RETURNING * 
) SELECT * FROM update_query ORDER BY update_query.date_created ASC;`;
const GET_NOTIFICATION_PREFERENCES = (user:boolean) => {
  if (user) return `SELECT * FROM notification_preferences_user WHERE user_id=$1;`; 
  else return `SELECT * FROM notification_preferences_ip WHERE ip_id=$1;`; 
}
const ACKNOWLEDGE_NOTIFICATION_QUERY = (user:boolean) =>  {
  if (user) return `INSERT INTO shown_notifications (notification_id,token_id,date_shown) SELECT $1, id, $3 FROM firebase_tokens WHERE user_id=$2;`;
  else return `INSERT INTO shown_notifications (notification_id,token_id,date_shown) SELECT $1, id, $3 FROM firebase_tokens WHERE ip_id=$2;`;
}

export async function getNewNotifications(ip_id:number,user_id:number|undefined) {
  const one_day_ago = getUnixTime()-86400*3;
  const id = (typeof user_id==="number")?user_id:ip_id;
  const db = getDatabase();
  const useUser = typeof user_id==="number";
  const [pushQueryResp,showQueryResp,notificationPreferences] = await Promise.all([
    db.query(GET_NEW_NOTIFICATIONS),
    db.query(GET_NOTIFICATION_FOR_CLIENT(useUser),[id,one_day_ago]),
    db.query(GET_NOTIFICATION_PREFERENCES(useUser),[id])
  ]);
  if (!!!notificationPreferences.rows.length) {
    throw new Error("Unable to get notification preferences for user ID or ip address.".concat(` ip_id=${ip_id},user_id=${user_id}`));
  }
  return {
    push_notifications: pushQueryResp.rows as NotificationRow[],
    show_notifications: showQueryResp.rows as NotificationRow[],
    notification_preferences: notificationPreferences.rows[0] as (NotificationPreferencesResponseIp|NotificationPreferencesResponseUser)
  }
}

const NOTIFICATION_HTML = `<div data-notification class="notification" data-notification-id="<%=locals.id%>">
  <div class="flex-row justify-start gap-2 align-center">
    <img src="<%=locals.icon%>" alt="<%=locals.title%>" style="width:38px;height:38px;margin:0px; object-fit:cover;" width="38" height="38" data-text="<%=locals.body%>" />
    <span class="h6 bold"><%=locals.title%></span>
  </div>
  <div class="body1"><%=locals.body%></div>
  <div class="flex-row justify-end gap-2">
    <%if(locals.link_internal){%>
      <a type="button" hx-get="<%=locals.link%>" href="<%=locals.link%>" hx-push-url="true" hx-target="#PAGE" hx-indicator="#page-transition-progress" class="button outlined small text info">
        Link
      </a>
    <%}else{%>
      <a type="button" href="<%=locals.link%>" class="button outlined small text info">
      Link
      </a>
    <%}%>
    <button data-notif-acknowledge type="button" class="outlined small text success" aria-label="Acknowledge">
      Acknowledge
    </button>
  </div>
</div>`;


function filterShowNotifications(show_notifications:NotificationRow[],preferences:NotificationPreferencesResponseUser|NotificationPreferencesResponseIp) {
  const arr:{ html: string, id: number, title: string, notificationOptions: NotificationOptions }[] = [];
  for (let row of show_notifications) {
    if (preferences[row.topic]) {
      if (row.image) {
        row.image = encodeURI(row.image);
      }
      var link_internal = false;
      if (row.link.startsWith('https://frankmbrown.net')) {
        link_internal = true;
        row.link = row.link.replace('https://frankmbrown.net','');
      }
      row.link = encodeURI(row.link);
      const html = ejs.render(NOTIFICATION_HTML,{ id: row.id, icon: row.icon, title: row.title, link: row.link, link_internal, body: row.body.length>150 ? row.body.slice(0,150).concat('...') : row.body })
      const id = row.id;
      const title = row.title;
      const notificationOptions:NotificationOptions = {
        renotify: false,
        requireInteraction: false,
        badge: row.badge,
        body: row.body,
        icon: row.icon,
        silent: false
      }
      if (row.image) notificationOptions.image = row.image;
      arr.push({ html, id, title, notificationOptions });
    }
  }

  return arr;
}


/**
 * RESET Notifications: 
UPDATE notifications SET sent_notification=false;
DELETE FROM shown_notifications;
 */



/**
 * Actually push notifications
 */
export async function pushNotifications(notifications:NotificationRow[]) {
  try {
    const max_id = (await getDatabase().query(`SELECT max(id) max FROM firebase_tokens;`)).rows[0].max;
    if (!!!Number.isInteger(max_id)) {
      console.error("Unable to find max_id from firebase tokens.",max_id);
      return;
    }
    var tokens_preferences = (await getDatabase().query(GET_FIREBASE_TOKENS_WITH_PREFERENCES())).rows as TokenWithNotifcationPreferences[];
    var current_max_id = tokens_preferences[tokens_preferences.length-1].id;
    while (Number.isInteger(current_max_id) && current_max_id <= max_id && tokens_preferences.length) {
      const obj = {
        create_annotation: [] as string[],
        create_note: [] as string[],
        update_note: [] as string[],
        create_blog: [] as string[],
        update_blog: [] as string[],
        create_idea: [] as string[],
        update_idea: [] as string[],
        create_comment: [] as string[],
        create_jupyter_notebook: [] as string[],
        create_markdown_note: [] as string[],
        create_stream_consciousness: [] as string[],
        create_daily_reading: [] as string[],
        create_tex_note: [] as string[],
        create_link: [] as string[],
        create_quote: [] as string[],
        create_project: [] as string[], 
        project_update: [] as string[],
        create_survey: [] as string[],
        create_goodreads: [] as string[],
        create_letterboxd: [] as string[],
        create_game: [] as string[],
        create_3d_design: [] as string[], 
        create_electronics: [] as string[]
      };
      for (let pref of tokens_preferences) {
        if (pref.create_annotation) obj["create_annotation"].push(pref.token);
        if (pref.create_note) obj["create_note"].push(pref.token);
        if (pref.update_note) obj["update_note"].push(pref.token);
        if (pref.create_blog) obj["create_blog"].push(pref.token);
        if (pref.update_blog) obj["update_blog"].push(pref.token);
        if (pref.create_idea) obj["create_idea"].push(pref.token);
        if (pref.update_idea) obj["update_idea"].push(pref.token);
        if (pref.create_comment) obj["create_comment"].push(pref.token);
        if (pref.create_jupyter_notebook) obj["create_jupyter_notebook"].push(pref.token);
        if (pref.create_markdown_note) obj["create_markdown_note"].push(pref.token);
        if (pref.create_stream_consciousness) obj["create_stream_consciousness"].push(pref.token);
        if (pref.create_daily_reading) obj["create_daily_reading"].push(pref.token);
        if (pref.create_tex_note) obj["create_tex_note"].push(pref.token);
        if (pref.create_link) obj["create_link"].push(pref.token);
        if (pref.create_quote) obj["create_quote"].push(pref.token);
        if (pref.create_project) obj["create_project"].push(pref.token);
        if (pref.project_update) obj["project_update"].push(pref.token);
        if (pref.create_survey) obj["create_survey"].push(pref.token);
        if (pref.create_goodreads) obj["create_goodreads"].push(pref.token);
        if (pref.create_letterboxd) obj["create_letterboxd"].push(pref.token);
        if (pref.create_game) obj["create_game"].push(pref.token);
        if (pref.create_3d_design) obj["create_3d_design"].push(pref.token);
        if (pref.create_electronics) obj["create_electronics"].push(pref.token);
      }
      for (let notif of notifications) {
        const registrationTokens = obj[`${notif.topic}`];
        notif.badge = encodeURI(notif.badge);
        notif.icon = encodeURI(notif.icon);
        if(notif.image)notif.image = encodeURI(notif.image);
        notif.link = encodeURI(notif.link);
        const message:MulticastMessage = {
          tokens: registrationTokens,
          webpush: {
            data: {},
            notification: {
              badge: notif.badge,
              body: notif.body,
              data: {},
              dir: 'ltr',
              icon: notif.icon,
              renotify: notif.renotify,
              requireInteraction: notif.require_interaction,
              silent: notif.silent,
              timestamp: Number(notif.date_created),
              title: notif.title,
              tag: notif.tag
            },
            fcmOptions: {
              link: notif.link
            }
          }
        };
        if (notif.image) {
          ((message.webpush as WebpushConfig).notification as WebpushNotification).image = notif.image;
        } 
        const resp = await messaging.sendEachForMulticast(message);
        console.log(resp.successCount,resp.failureCount);
      }
      if (current_max_id===max_id) break;
      tokens_preferences = (await getDatabase().query(GET_FIREBASE_TOKENS_WITH_PREFERENCES(current_max_id),[current_max_id])).rows as TokenWithNotifcationPreferences[];
      current_max_id = tokens_preferences[tokens_preferences.length-1].id;
      console.log(obj);
    }
    return;
  } catch (e) {
    console.error(e);
    return;
  }
}

export function sendPushMessage(data:Message) {
  messaging.send(data)
} 

/* --------------------------------------------- Socket.io Handlers ----------------------------------- */ 

export function getAcknowledgeNotification(socket:SessionSocket) {
  const func = async function (notif_id:number,callback:() => void) {
    try {
      if (typeof notif_id!=='number') throw new Error("Notification ID must be a number.");
      const req = socket.request;
      const user = Boolean(typeof req.session.auth?.userID==="number");
      const id = user?(req.session.auth as any).userID : Number(req.session.ip_id);
      await getDatabase().query(ACKNOWLEDGE_NOTIFICATION_QUERY(user),[notif_id,id,getUnixTime()]);
      callback();
      return;
    } catch (e) {
      console.error("Something went wrong acknowldging noticiation.");
      console.error(e);
      return;
    }
  }
  return func;
}

export function getGetNotifications(socket:SessionSocket) {
  const func = async function (data:any,callback:(notifications:ReturnType<typeof filterShowNotifications>) => void) {
    console.log("Getting Notifications");
    try {
      const req = socket.request;
      const { push_notifications, show_notifications, notification_preferences } = await getNewNotifications(Number(req.session.ip_id),req.session.auth?.userID);
      // push notifications
      if (push_notifications.length) {
        await pushNotifications(push_notifications);
      }
      // filter and show notifications to user - update show_notifications table
      const notifications = filterShowNotifications(show_notifications,notification_preferences);
      callback(notifications);
      return;
    } catch (e) {
      console.error("Something went wrong getting the notifications.");
      console.error(e);
      return callback([]);
    }
  }
  return func;
}