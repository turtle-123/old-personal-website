/**
 * Use with express-session: https://socket.io/how-to/use-with-express-session
 * - Extending Socket in TypeScript: https://github.com/socketio/socket.io/issues/3890
 * 
 */
import crypto from "node:crypto";
import { type Event } from "socket.io";
import { SessionSocket } from "..";
import { type Request } from 'express';
import * as FIREBASE from './firebase';
import IS_DEVELOPMENT from "../CONSTANTS/IS_DEVELOPMENT";
import * as CHAT from './chat';
import * as AI from './ai';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export function ioEngineGenerateId() {
  return crypto.randomUUID();
}
export function onIoEngineConnectionError(err:any) {
  console.error("IO Sever connection Abnorammly closed:")
  console.error(err.code);     // the error code, for example 1
  console.error(err.message);  // the error message, for example "Session ID unknown"
  console.error(err.context);  // some additional error context
}
/**
 * Since it is not bound to a single HTTP request, the session must be manually reloaded and saved:
 * @param socket 
 * @returns 
 */
function getReloadSession(socket:SessionSocket) {
  const func = function (_:Event,next:(err?: Error | undefined) => void) {
    (socket.request as Request).session.reload((err) => {
      if (err||!!!(socket.request as Request).session.ip_id) {
        socket.disconnect();
      } else {
        next();
      }
    })
  }
  return func;
}
// The boolean determines whether or not the user is in the room
type OnJoinLeaveCallback = (bool: boolean) => void
function getOnJoin(socket:SessionSocket) {
  const func = function (str:string,callback:OnJoinLeaveCallback) {
    if (typeof str === "string") socket.join(str);
    callback(true);
  }
  return func;
}
function getOnLeave(socket:SessionSocket) {
  const func = function (str:string,callback:OnJoinLeaveCallback) {
    if (typeof str === "string") socket.leave(str);
    callback(false);
  }
  return func;
}
/**
 * Try to keep the settings the same between all the 
 * @param socket 
 */
function getOnChangeSettings(socket:SessionSocket) {
  const func = function (obj:{text: string, swap: 'innerHTML'|'outerHTML'|undefined, target: string}) {
    var swap = 'innerHTML';
    if (obj.swap==="outerHTML"||obj.swap==="innerHTML") swap = obj.swap;
    if (typeof obj.text==="string"&& typeof obj.target==="string") {
      const new_obj = { text: obj.text, target: obj.target, swap: swap };
      socket.to(socket.request.session.session_id).emit('changed-settings',new_obj);
    }
    return;
  }
  return func;
}

const rateLimiter = new RateLimiterMemory(
  {
    points: 5, // 5 points
    duration: 1, // per second
});

export function handleIOConnection(socket:SessionSocket) {
  const sessionID = socket.request.session.session_id;
  // the session ID is used as a room
  socket.join(sessionID);
  socket.use(getReloadSession(socket));
  if (IS_DEVELOPMENT) {
    socket.use((ev,next) => {
      next();
    })
  }

  socket.on('join',getOnJoin(socket));
  socket.on('leave',getOnLeave(socket));
  socket.on('change-settings',getOnChangeSettings(socket));

  socket.on('send-chat',CHAT.getHandleChatMessage(socket));
  socket.on("acknowledge-notification",FIREBASE.getAcknowledgeNotification(socket));
  socket.on("get-notifications",FIREBASE.getGetNotifications(socket));

  // AI 
  socket.on("ai-autocomplete",AI.getOnAIAutocomplete(socket));
  socket.on("ai-chat",AI.getOnAIChat(socket));
  socket.on('new-ai-chat',AI.getOnNewAIChat(socket))
  socket.on('ai-chat-end',AI.getOnEndAIChat(socket));
  socket.on('change-ai-chat',AI.getOnChangeAIChat(socket));
  socket.on("ai-write",AI.getOnAIWrite(socket));
  socket.on("ai-write-end",AI.getOnAIWriteEnd(socket));
  socket.on('copy-ai-chat',AI.getOnCopyAiURL(socket));
  socket.on('ai-chat-page',AI.getOnAIChatPage(socket));
  socket.on('ai-chat-end-page',AI.getOnEndAIChatPage(socket));

  socket.on("ai-code",AI.getOnAICode(socket));

}