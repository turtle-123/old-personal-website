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
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_SETTINGS_1 = __importStar(require("../CONSTANTS/DEFAULT_SETTINGS"));
const TIME = __importStar(require("../utils/time"));
/**
 * Set the initial settings if they have not already been set.
 * You need to set the auth, paths, and settings to render the initial page, so set those
 *
 * @param req Request
 */
function setInitialSettings(req, res, next) {
    var _a;
    if (req.session.settings === undefined) {
        req.session.settings = structuredClone(DEFAULT_SETTINGS_1.default);
        req.session.settings.ai_chat_id = (0, DEFAULT_SETTINGS_1.getAiChatID)();
    }
    if (req.session.snackbarMessage === undefined) {
        req.session.snackbarMessage = {
            showMessage: false,
            message: ''
        };
    }
    if (req.session.cookiePreferences === undefined)
        req.session.cookiePreferences = {
            necessary: true,
            preferences: false,
            statistics: false,
            showedBanner: false
        };
    if (req.session.ip_data_string === undefined)
        req.session.ip_data_string = '';
    if (req.session.creating_ip_address_row === undefined)
        req.session.creating_ip_address_row = false;
    if (req.session.auth === undefined) {
        req.session.auth = {
            level: 0,
            loginAttempts: 0,
            userID: undefined,
            createAccountAttempts: 0,
            createAccountEmailsSent: 0,
            resetCredentialsAttempts: 0,
            resetCredentialsEmailsSent: 0,
            email: undefined,
            username: undefined,
            banned: false,
            date_created: 0
        };
    }
    if (req.session.startOfDay === undefined) {
        req.session.startOfDay = TIME.getStartOfDaySeconds(((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York');
    }
    if (req.session.uploadedAudio === undefined) {
        req.session.uploadedAudio = 0;
    }
    if (req.session.uploadedVideo === undefined) {
        req.session.uploadedVideo = 0;
    }
    next();
}
exports.default = setInitialSettings;
