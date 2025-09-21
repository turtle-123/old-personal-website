import { Request, Response, NextFunction } from 'express';
import DEFAULT_SETTINGS, { getAiChatID } from '../CONSTANTS/DEFAULT_SETTINGS';
import * as TIME from '../utils/time';

/**
 * Set the initial settings if they have not already been set.
 * You need to set the auth, paths, and settings to render the initial page, so set those
 * 
 * @param req Request
 */
function setInitialSettings(req: Request,res:Response,next:NextFunction) {
  if (req.session.settings===undefined) {
    req.session.settings = structuredClone(DEFAULT_SETTINGS);
    req.session.settings.ai_chat_id = getAiChatID();
  }
  if (req.session.snackbarMessage===undefined) {
    req.session.snackbarMessage = {
      showMessage: false,
      message: ''
    };
  }
  if (req.session.cookiePreferences===undefined) req.session.cookiePreferences = {
    necessary: true,
    preferences: false,
    statistics: false,
    showedBanner: false
  };
  if (req.session.ip_data_string===undefined) req.session.ip_data_string = '';
  if(req.session.creating_ip_address_row===undefined) req.session.creating_ip_address_row = false;
  if(req.session.auth===undefined) {
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
  if (req.session.startOfDay===undefined) {
    req.session.startOfDay = TIME.getStartOfDaySeconds(req.session.settings?.timezone || 'America/New_York');
  }
  if (req.session.uploadedAudio===undefined) {
    req.session.uploadedAudio = 0;
  }
  if (req.session.uploadedVideo===undefined) {
    req.session.uploadedVideo = 0;
  }
  next();
}
export default setInitialSettings;