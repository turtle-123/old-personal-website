/**
 * ```sql 
DROP TABLE chat_moderation_responses;
DROP TABLE search_chat;
DROP TABLE chat;
CREATE TABLE chat (
  id serial PRIMARY KEY,
  ip_id integer NOT NULL REFERENCES ip_info(id),
  lexical_state jsonb NOT NULL,
  desktop_html TEXT NOT NULL,
  tablet_html TEXT NOT NULL,
  mobile_html TEXT NOT NULL,
  date_created bigint NOT NULL
);
CREATE TABLE search_chat (
  id serial PRIMARY KEY,
  chat_id integer NOT NULL REFERENCES chat(id),
  document TEXT NOT NULL,
  search  tsvector GENERATED ALWAYS AS (
    to_tsvector('english',document) || ' '
  ) STORED NOT NULL,
  embedding vector (1536) NOT NULL
);
CREATE TABLE chat_moderation_responses (
	id serial PRIMARY KEY,
	chat_id integer NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
	flagged boolean,
	category_harassment boolean,
  category_score_harassment smallint,
  category_harassment_threatening boolean,
  category_score_harassment_threatening smallint,
  category_sexual boolean,
  category_score_sexual smallint,
  category_hate boolean,
  category_score_hate smallint,
  category_hate_threatening boolean,
  category_score_hate_threatening smallint,
  category_illicit boolean,
  category_score_illicit smallint,
  category_illicit_violent boolean,
  category_score_illicit_violent smallint,
  category_self_harm_intent boolean,
  category_score_self_harm_intent smallint,
  category_self_harm_instructions boolean,
  category_score_self_harm_instructions smallint,
  category_self_harm boolean,
  category_score_self_harm smallint,
  category_sexual_minors boolean,
  category_score_sexual_minors smallint,
  category_violence boolean,
  category_score_violence smallint,
  category_violence_graphic boolean,
  category_score_violence_graphic smallint
);
CREATE INDEX ON chat_moderation_responses USING BTREE(chat_id);
```
 */
import { Request, Response } from 'express';
import type { Breadcrumbs, TableOfContentsItem, SEO } from '../types';
import { getRequiredVariables } from '../ROUTER/helper_functions/frontendHelper';
import { parseCommentLexicalEditor } from '../lexical';
import COMMON_SVGS from '../CONSTANTS/COMMON_SVG';
import { handleUserUploadedImage } from '../aws/mediaHelpers';
import { createEmbedding, moderateOpenAI, parseOpenAIModerationResponse } from '../ai';
import { formatDateFromUnixTime, getDateTimeStringFromUnix, getUnixTime } from '../utils/time';
import getDatabase from '../database';
import { GET_INSERT_INTO_MODERATION_TABLE } from '../ROUTER/pages_helper/article_helpers/handleArticleData';
import { redirect } from '../ROUTER/helper_functions/redirect-override';
import ejs from 'ejs';
import pgvector from 'pgvector';
import { getSockets, SessionSocket } from '..';


type ChatMessageRow = { 
  html: string, 
  date_created: string, 
  random_name: string, 
  profile_picture: string, 
  ip_id: number 
};

const INSERT_INTO_CHAT = `WITH ip_id_table AS (
  INSERT INTO chat (ip_id,lexical_state,desktop_html,tablet_html,mobile_html,date_created) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
) SELECT ip_id_table.id chat_id, ip_random_names.ip_id ip_id, ip_random_names.random_name random_name, ip_random_names.profile_picture profile_picture FROM ip_random_names JOIN ip_id_table ON ip_random_names.ip_id=ip_id_table.ip_id WHERE ip_random_names.ip_id=$1;`;

const GET_CHAT_MESSAGES_QUERY = (device:'mobile'|'tablet'|'desktop',max_date?:number) => {
  var device_html:'mobile_html'|'tablet_html'|'desktop_html' = 'mobile_html';
  if (device==="desktop") device_html='desktop_html';
  else if (device==="tablet") device_html="tablet_html";
  
  return `SELECT ${device_html} html, date_created, random_name, profile_picture, chat.ip_id ip_id FROM chat JOIN ip_random_names ON chat.ip_id=ip_random_names.ip_id ${max_date ? `WHERE date_created < $1` : ``} ORDER BY date_created ASC LIMIT 100;`
}
const INSERT_INTO_MODERATION_SEARCH = `INSERT INTO search_chat (chat_id,document,embedding) VALUES ($1,$2,$3);`;

const getDevice = (req:Request|any) => {
  if (!!!req.session.device) return 'mobile';
  if (req.session.device.desktop) return 'desktop';
  else if (req.session.device.tablet) return 'tablet';
  else return 'mobile';
}
const CHAT_TEMPLATE = `<div class="<%-locals.chat_class%> mt-2" style="padding: 4px; border-radius: 4px; border: 2px solid;">
    <div class="flex-row align-center justify-start gap-2">
        <img src="<%=locals.profile_picture%>" alt="<%=locals.random_name%>" style="width:40px;height:40px;margin: 0px; border-radius: 50%;" width="40" height="40" data-text="Random name assigned to ip address: <%=locals.random_name%>" />
        <span class="h5 bold">
            <%=locals.random_name%>
        </span>
        <div class="grow-1 flex-row justify-end">
           <time data-date-format="MMM DD, YY h:mm A" datetime="<%=locals.datetime%>">
             <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
               <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
               </path>
             </svg>
             <span><%=locals.datetime_string%></span>
           </time>
        </div>
    </div>
    <div class="lexical-wrapper" data-rich-text-editor data-editable="false" id="<%=locals.id%>" data-lexical-editor="true" data-registered="false">
        <%-locals.html%>
    </div>
  </div>`



export async function getChat(req:Request,res:Response) {
  try {
    const path = "/chat"
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Chat', item: path, position: 2 }
    ];
    const title = "Frank's Chat";
    const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Web Sockets","Chat"];
    const description = '';
    const tableOfContents: TableOfContentsItem[] = [
      { id:'what-is-this', text: 'What Is This'},
      { id: 'projects', text: 'Projects'},
    ];
    const image = "https://image.storething.org/frankmbrown%2Fb5e66bce-7a26-4c42-a3bd-a61a5c7c00bd.jpg";
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, image, path };
    const requiredVariables = getRequiredVariables(req,SEO);
    const chatMessages = (await getDatabase().query(GET_CHAT_MESSAGES_QUERY(getDevice(req)))).rows as ChatMessageRow[];
    const parsedChatMessages = chatMessages.map((obj) => {
      var chat_class = "chat";
      if (obj.ip_id===req.session.ip_id) chat_class += " self";
      const datetime = getDateTimeStringFromUnix(Number(obj.date_created),true);
      const datetime_string = formatDateFromUnixTime("MMM D, YY h:m A",req.session.settings?.timezone||'America/New_York',Number(obj.date_created));
      const profile_picture = obj.profile_picture;
      const random_name = obj.random_name;
      const html = obj.html;
      return ejs.render(CHAT_TEMPLATE,{ html,datetime,datetime_string,chat_class,random_name,profile_picture});
    }).join('');

    return res.status(200).render('pages/chat',{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      chat_messages: parsedChatMessages
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/',400,{ severity: "error", message: "Something went wrong getting the chat page!"});
  }
}

type SubmitChatMessageType = {lexical_state: any }
type SubmitChatMessageResponse = {
  error: boolean,
  error_message: string,
  svg?: string,
  chat_message: string
} 
type SubmitChatMessageCallback = (msg: SubmitChatMessageResponse) => void
export function getHandleChatMessage(socket:SessionSocket) {
  const func = async function (json:SubmitChatMessageType,callback:SubmitChatMessageCallback) {
    try {
      const req = socket.request;
      const user_id = req.session.auth?.userID || null;
      const ip_id = Number(req.session.ip_id);
      if (
        Number.isInteger(req.session.last_sent_chat_message)||
        getUnixTime()-Number(req.session.last_sent_chat_message) < 60
      ) {
        callback({ error: true, error_message: "You can only send one chat message per minuute.", svg: COMMON_SVGS.TIME, chat_message:'' });
        return;
      }
      const lexical_state = json["lexical_state"];
      const { mobile_html, desktop_html, tablet_html, editorState, innerText, unvalidated_audio_urls, unvalidated_image_urls, unvalidated_video_urls, contains_nsfw, able_to_validate } = await parseCommentLexicalEditor(lexical_state);
      
      if (innerText.length>4000) {
        callback({ error:true,error_message:"The maximum amount of characters that you are allowed to send per chat message is 4000.", svg: COMMON_SVGS.COMMENT, chat_message: '' });
        return;
      }
      const [embedding,contentModerationResp] = await Promise.all([createEmbedding(innerText),moderateOpenAI(innerText)]);
      const parsedModerationResp = parseOpenAIModerationResponse(contentModerationResp);
      const IS_INAPPROPRIATE = parsedModerationResp.filter((obj) => obj[0]===true).length>=1;
      if (IS_INAPPROPRIATE) {
        callback({ error:true,error_message:"The posted chat message was flagged as inappropriate.", chat_message: '' });
        return;
      }
      const date_created = getUnixTime();
      const db = getDatabase();
      const chat_resp = (await db.query(INSERT_INTO_CHAT,[ip_id,editorState,desktop_html,tablet_html,mobile_html,date_created])).rows[0];
      const { chat_id, random_name, profile_picture }:{chat_id:number,random_name:string,profile_picture:string} = chat_resp;
      const moderationPromiseArr:Promise<any>[] = [];
      moderationPromiseArr.push(db.query(INSERT_INTO_MODERATION_SEARCH,[chat_id,innerText,pgvector.toSql(embedding)]));
      const query = GET_INSERT_INTO_MODERATION_TABLE('chat_moderation_responses','chat_id');
      for (let i = 0; i < parsedModerationResp.length; i++) {
        const arr = [chat_id as any].concat(parsedModerationResp[i]);
        moderationPromiseArr.push(db.query(query,arr));
      }
      await Promise.all(moderationPromiseArr);
      const chat_class = "chat self";
      const datetime = getDateTimeStringFromUnix(date_created,true);
      const datetime_string = formatDateFromUnixTime("MMM D, YY h:m A",req.session.settings?.timezone||'America/New_York',date_created); 
      const device = getDevice(req);
      var html='';
      if (device==="desktop") html = desktop_html;
      else if (device==="tablet") html = tablet_html;
      else html = mobile_html;
      const chat_message = ejs.render(CHAT_TEMPLATE,{ chat_class, datetime, datetime_string, random_name, profile_picture, html });
      const chat_message_other = ejs.render(CHAT_TEMPLATE,{ chat_class: "chat", datetime, datetime_string, random_name, profile_picture, html });
      // to all clients in room1 except the sender
      const sockets = await getSockets('chat');
      console.log(sockets.length);
      socket.to("chat").except(req.session.session_id).emit("chat-message",{ error: false, error_message: '', chat_message: chat_message_other});
      socket.to(req.session.session_id).emit("chat-message",{ error: false, error_message: '', chat_message })
      req.session.last_sent_chat_message = getUnixTime();
      callback({ error: false, error_message: '', chat_message });
      return;
    } catch (e) {
      console.error(e);
      console.error("Something went wrong handling chat message");
      callback({error:true,error_message: "Something went wrong posting the chat message.", svg: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Chat"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"></path></svg>',chat_message:'' });
      return;
    }
  }
  return func;
} 