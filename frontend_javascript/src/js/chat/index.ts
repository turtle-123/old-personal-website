import { Socket } from "socket.io-client";
import { getEditorState, setEditorState } from "../lexical-implementation";
import { openLoadingDialog, closeDialog } from "../shared";

const DEFAULT_LEXICAL_STATE = {
  "root": {
   "children": [
    {
     "children": [
      {
       "detail": 0,
       "format": 1,
       "mode": "normal",
       "style": "",
       "text": "Rules for Chat Messages:",
       "type": "text",
       "version": 1
      }
     ],
     "direction": "ltr",
     "format": "",
     "indent": 0,
     "type": "heading",
     "version": 1,
     "blockStyle": {
      "textAlign": "left",
      "backgroundColor": "transparent",
      "textColor": "inherit",
      "margin": [
       "6px",
       "0px",
       "0px",
       "0px"
      ],
      "padding": "0px",
      "borderRadius": "0px",
      "borderColor": "transparent",
      "borderWidth": "0px",
      "borderType": "none",
      "boxShadowOffsetX": "0px",
      "boxShadowOffsetY": "0px",
      "boxShadowBlurRadius": "0px",
      "boxShadowSpreadRadius": "0px",
      "boxShadowInset": false,
      "boxShadowColor": "transparent"
     },
     "tag": "h5",
     "sectionHeader": false
    },
    {
     "children": [
      {
       "children": [
        {
         "detail": 0,
         "format": 0,
         "mode": "normal",
         "style": "",
         "text": "Must be less than 4,000 characters.",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "",
       "indent": 0,
       "type": "listitem",
       "version": 1,
       "value": 1
      },
      {
       "children": [
        {
         "detail": 0,
         "format": 0,
         "mode": "normal",
         "style": "",
         "text": "Must not include inappropriate content.",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "",
       "indent": 0,
       "type": "listitem",
       "version": 1,
       "value": 2
      },
      {
       "children": [
        {
         "detail": 0,
         "format": 0,
         "mode": "normal",
         "style": "",
         "text": "Only one of the following is allowed per comment: Image, Audio, Video, YouTube Embed, News Embed, Twitter Embed, TikTok Embed, Instagram embed.",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "",
       "indent": 0,
       "type": "listitem",
       "version": 1,
       "value": 3
      },
      {
       "children": [
        {
         "detail": 0,
         "format": 0,
         "mode": "normal",
         "style": "",
         "text": "Only one of the following is allowed per comment: custom HTML, Table, and block Math.",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "",
       "indent": 0,
       "type": "listitem",
       "version": 1,
       "value": 4
      },
      {
       "children": [
        {
         "detail": 0,
         "format": 1,
         "mode": "normal",
         "style": "color: #ff0000;",
         "text": "You cannot include Audio or Video nodes at this time.",
         "type": "text",
         "version": 1
        }
       ],
       "direction": "ltr",
       "format": "",
       "indent": 0,
       "type": "listitem",
       "version": 1,
       "value": 5
      }
     ],
     "direction": "ltr",
     "format": "",
     "indent": 0,
     "type": "list",
     "version": 1,
     "blockStyle": {
      "textAlign": "left",
      "backgroundColor": "transparent",
      "textColor": "inherit",
      "margin": [
       "6px",
       "0px",
       "0px",
       "0px"
      ],
      "padding": "0px",
      "borderRadius": "0px",
      "borderColor": "transparent",
      "borderWidth": "0px",
      "borderType": "none",
      "boxShadowOffsetX": "0px",
      "boxShadowOffsetY": "0px",
      "boxShadowBlurRadius": "0px",
      "boxShadowSpreadRadius": "0px",
      "boxShadowInset": false,
      "boxShadowColor": "transparent"
     },
     "listType": "number",
     "start": 1,
     "tag": "ol"
    }
   ],
   "direction": "ltr",
   "format": "",
   "indent": 0,
   "type": "root",
   "version": 1
  }
}
var IN_CHAT = false;

function onSocketConnectChat() {
  const connectionOpen = document.getElementById('connection-open');
  const connectionClosed = document.getElementById('connection-down');
  const submitButton = document.getElementById('submit-chat-message');
  if (connectionClosed&&connectionOpen&&submitButton) {
    connectionClosed.setAttribute('hidden','');
    connectionOpen.removeAttribute('hidden');
    submitButton.removeAttribute('disabled');
  }
}
function onSocketDisconnectChat() {
  const connectionOpen = document.getElementById('connection-open');
  const connectionClosed = document.getElementById('connection-down');
  const submitButton = document.getElementById('submit-chat-message');
  if (connectionClosed&&connectionOpen&&submitButton) {
    connectionOpen.setAttribute('hidden','');
    connectionClosed.removeAttribute('hidden');
    submitButton.setAttribute('disabled','');
  }
}

type SubmitChatMessageResponse = {
  error: boolean,
  error_message: string,
  svg?: string,
  chat_message: string
} 
function submitChatMessage() {
  if (window.socket) {
    const editorState = getEditorState('lexical_example_editor');
    const socket = window.socket;
    if (socket&&editorState) {
      const dialog = <HTMLDivElement>document.getElementById('loading-dialog');
      if (dialog) openLoadingDialog(dialog,"Submitting Chat Message");
      socket.emit("send-chat",{ lexical_state: editorState },onChatMessage);
    }
  }
}

function onChatMessage({ error, error_message, svg, chat_message }:SubmitChatMessageResponse) {
  const dialog = <HTMLDivElement>document.getElementById('loading-dialog');
  if (dialog) closeDialog(dialog);
  if (error) {
    if (svg) document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: error_message, svg }}));
    else document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: error_message }}));
  } else {
    const chat_log = document.getElementById('chat-messages'); 
    if (chat_log) {
      chat_log.insertAdjacentHTML("beforeend",chat_message);
      document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED"));
    }
  }
}

function getOnJoinChat(socket:Socket) {
  const func = function(bool:boolean) {
    if (typeof bool ==="boolean"&&bool===true&&!!!IN_CHAT) {
      IN_CHAT = bool;
      socket.on('connect',onSocketConnectChat);
      socket.on('disconnect',onSocketDisconnectChat);
      socket.on("chat-message",onChatMessage);
    }
  }
  return func;
}
function getOnLeaveChat(socket:Socket) {
  const func = function (bool:boolean) {
    if (typeof bool ==="boolean"&&bool===true&&!!IN_CHAT) {
      IN_CHAT = bool;
      socket.removeListener('connect',onSocketConnectChat);
      socket.removeListener('disconnect',onSocketDisconnectChat);
      socket.removeListener("chat-message",onChatMessage);
    }
  }
  return func;
}
export function onChatLoad() {
  const submitButton = document.getElementById('submit-chat-message');
  if (window.socket) {
    const socket = window.socket;
    if (socket.active) onSocketConnectChat();
    else onSocketDisconnectChat();
    if (!!!IN_CHAT) socket.emit('join','chat',getOnJoinChat(socket));
    if (submitButton) submitButton.addEventListener('click',submitChatMessage);
  }
}
export function onChatUnload() {
  if (window.socket) {
    const socket = window.socket;
    if (!!IN_CHAT) socket.emit('leave','chat',getOnLeaveChat(socket));
  }
}