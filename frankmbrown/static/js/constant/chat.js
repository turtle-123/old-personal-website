/**
 * @type {WebSocket|undefined}
 */
var ws;
const WEBSOCKET_HEARTBEAT = (20 * 1000) + (5*1000); // 25 Seconds
const WEBSOCKET_HEARTBEAT_VALUE = 1;
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
         "text": "Cannot include audio or video yet (I haven't decided how to make sure that content is safe yet).",
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
         "text": "Less than 4,000 characters.",
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
         "text": "Images must be safe.",
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
    },
    {
     "children": [],
     "direction": "ltr",
     "format": "left",
     "indent": 0,
     "type": "paragraph",
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
     }
    },
    {
     "children": [],
     "direction": "ltr",
     "format": "left",
     "indent": 0,
     "type": "paragraph",
     "version": 1,
     "blockStyle": {
      "textAlign": "left",
      "backgroundColor": "transparent",
      "textColor": "inherit",
      "margin": [
       "12px",
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
     }
    }
   ],
   "direction": "ltr",
   "format": "",
   "indent": 0,
   "type": "root",
   "version": 1
  }
}

const connectionOpen = document.getElementById('connection-open');
const connectionClosed = document.getElementById('connection-down');
const chat_log = document.getElementById('chat-messages'); 
const loadingDialog = document.getElementById("loading-dialog");

function isLoadingDialogOpen() {
  return loadingDialog.hasAttribute('open');
}
function openLoadingDialog(text) {
  document.dispatchEvent(new CustomEvent("OPEN_DIALOG",{ detail: { dialog: loadingDialog, text, loading: true }}));
}
function closeLoadingDialog() {
  document.dispatchEvent(new CustomEvent("CLOSE_DIALOG",{ detail: { dialog: loadingDialog }}));
}

function submitChatMessage() {
  if (window.getEditorState&&ws) {
    const lexical_editor = window.getEditorState("lexical_example_editor");
    if (lexical_editor&&ws) {
      ws.send(JSON.stringify({"message": lexical_editor, "type": "chat_message" }));
      console.log(loadingDialog);
      openLoadingDialog("Submitting Chat message...");
    }
  }
}

submitButton.addEventListener('click',submitChatMessage);

function checkIpIdExists() {
  const ip_id = document.getElementById('ip_id');
  return Boolean(ip_id&&Number.isInteger(parseInt(ip_id.value)));
}

const delay = async (num) => {
  return new Promise((resolve,_)=> {
    setTimeout(() => {
      resolve(true);
    },num);
  })
}

function onWebSocketClose(ev) {
  if (window.location.origin==="http://localhost:8080") {
    console.error("Web Socket Close",ev);
  }
  if (isLoadingDialogOpen()) closeLoadingDialog();
  connectionOpen.setAttribute('hidden','');
  connectionClosed.removeAttribute('hidden');
  submitButton.setAttribute('disabled','');
  if (ws.pingTimeout) {
    clearTimeout(ws.pingTimeout);
  }
  // Avoid DDOSing yourself
  setTimeout(() => {
    setWebSocket();
  },2000);
}
function onWebSocketOpen() {
  connectionClosed.setAttribute('hidden','');
  connectionOpen.removeAttribute('hidden');
  submitButton.removeAttribute('disabled');
} 
function isBinary(obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Blob]';
}
function websocketNotificationHeartbeat() {
  if (ws.pingTimeout) {
    clearTimeout(ws.pingTimeout);
  }
  if (ws) {
    ws.pingTimeout = setTimeout(() => {
      ws.close();
      // Restablish Connection (Business Logic for decising whether or not to reconnect)
    },WEBSOCKET_HEARTBEAT);
    const data = new Uint8Array(WEBSOCKET_HEARTBEAT_VALUE);
    data[0] = WEBSOCKET_HEARTBEAT_VALUE;
    ws.send(data);
  }
}
function onWebSocketMessage(ev) {
  if (isBinary(ev.data)) {
    websocketNotificationHeartbeat(); 
  } else if (typeof ev.data === "string") {
    try {
      const json = JSON.parse(ev.data);
      if (json["type"]==="chat") {
        const html = json["message"];
        if (chat_log) chat_log.insertAdjacentHTML("beforeend",html);
        document.dispatchEvent(new CustomEvent("NEW_CONTENT_LOADED"));
      } else if (json["type"]==="error") {
        if (isLoadingDialogOpen()) closeLoadingDialog();
        const svg = json["svg"];
        const error = json["error"];
        if (typeof svg==="string") document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: error, svg }}));
        else document.dispatchEvent(new CustomEvent("DISPATCH_SNACKBAR",{ detail: { severity: "error", message: error }}));
      }
    } catch (e) {
      console.error(e);

    }
  }
}
function onWebSocketError(ev) {
  if (isLoadingDialogOpen()) closeLoadingDialog();
  console.error("Web Socket Notification Error:",ev);
}


function setWebSocket() {
  if (window.location.origin==="http://localhost:8080") {
    ws = new WebSocket('ws://localhost:8080/chat');
  } else {
    ws = new WebSocket('wss://frankmbrown.net/chat');
  }
  if (ws) {
    ws.addEventListener('close',onWebSocketClose);
    ws.addEventListener('open',onWebSocketOpen);
    ws.addEventListener('message',onWebSocketMessage);
    ws.addEventListener('error',onWebSocketError);
  }
}


async function onLoad() {
  var ip_id_exists = checkIpIdExists();
  while (!!!ip_id_exists) {
    await delay(500);
    ip_id_exists = checkIpIdExists();
  }
  setWebSocket();
   
}
try {
  onLoad();
} catch (e) {
  console.error(e);
}



