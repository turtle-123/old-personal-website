"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIOConnection = exports.onIoEngineConnectionError = exports.ioEngineGenerateId = void 0;
/**
 * Use with express-session: https://socket.io/how-to/use-with-express-session
 * - Extending Socket in TypeScript: https://github.com/socketio/socket.io/issues/3890
 *
 */
const node_crypto_1 = __importDefault(require("node:crypto"));
const FIREBASE = __importStar(require("./firebase"));
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
const CHAT = __importStar(require("./chat"));
const AI = __importStar(require("./ai"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
function ioEngineGenerateId() {
    return node_crypto_1.default.randomUUID();
}
exports.ioEngineGenerateId = ioEngineGenerateId;
function onIoEngineConnectionError(err) {
    console.error("IO Sever connection Abnorammly closed:");
    console.error(err.code); // the error code, for example 1
    console.error(err.message); // the error message, for example "Session ID unknown"
    console.error(err.context); // some additional error context
}
exports.onIoEngineConnectionError = onIoEngineConnectionError;
/**
 * Since it is not bound to a single HTTP request, the session must be manually reloaded and saved:
 * @param socket
 * @returns
 */
function getReloadSession(socket) {
    const func = function (_, next) {
        socket.request.session.reload((err) => {
            if (err || !!!socket.request.session.ip_id) {
                socket.disconnect();
            }
            else {
                next();
            }
        });
    };
    return func;
}
function getOnJoin(socket) {
    const func = function (str, callback) {
        if (typeof str === "string")
            socket.join(str);
        callback(true);
    };
    return func;
}
function getOnLeave(socket) {
    const func = function (str, callback) {
        if (typeof str === "string")
            socket.leave(str);
        callback(false);
    };
    return func;
}
/**
 * Try to keep the settings the same between all the
 * @param socket
 */
function getOnChangeSettings(socket) {
    const func = function (obj) {
        var swap = 'innerHTML';
        if (obj.swap === "outerHTML" || obj.swap === "innerHTML")
            swap = obj.swap;
        if (typeof obj.text === "string" && typeof obj.target === "string") {
            const new_obj = { text: obj.text, target: obj.target, swap: swap };
            socket.to(socket.request.session.session_id).emit('changed-settings', new_obj);
        }
        return;
    };
    return func;
}
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 5, // 5 points
    duration: 1, // per second
});
function handleIOConnection(socket) {
    const sessionID = socket.request.session.session_id;
    // the session ID is used as a room
    socket.join(sessionID);
    socket.use(getReloadSession(socket));
    if (IS_DEVELOPMENT_1.default) {
        socket.use((ev, next) => {
            next();
        });
    }
    socket.on('join', getOnJoin(socket));
    socket.on('leave', getOnLeave(socket));
    socket.on('change-settings', getOnChangeSettings(socket));
    socket.on('send-chat', CHAT.getHandleChatMessage(socket));
    socket.on("acknowledge-notification", FIREBASE.getAcknowledgeNotification(socket));
    socket.on("get-notifications", FIREBASE.getGetNotifications(socket));
    // AI 
    socket.on("ai-autocomplete", AI.getOnAIAutocomplete(socket));
    socket.on("ai-chat", AI.getOnAIChat(socket));
    socket.on('new-ai-chat', AI.getOnNewAIChat(socket));
    socket.on('ai-chat-end', AI.getOnEndAIChat(socket));
    socket.on('change-ai-chat', AI.getOnChangeAIChat(socket));
    socket.on("ai-write", AI.getOnAIWrite(socket));
    socket.on("ai-write-end", AI.getOnAIWriteEnd(socket));
    socket.on('copy-ai-chat', AI.getOnCopyAiURL(socket));
    socket.on('ai-chat-page', AI.getOnAIChatPage(socket));
    socket.on('ai-chat-end-page', AI.getOnEndAIChatPage(socket));
    socket.on("ai-code", AI.getOnAICode(socket));
}
exports.handleIOConnection = handleIOConnection;
