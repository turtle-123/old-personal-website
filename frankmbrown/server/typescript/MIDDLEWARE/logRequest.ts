import { Request, Response, NextFunction } from 'express';
import IS_DEVELOPMENT from '../CONSTANTS/IS_DEVELOPMENT';
/**
 * Log the request URL if you are in development
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
function logRequest(req: Request,res: Response, next: NextFunction) {
  if (IS_DEVELOPMENT) {
    if (!!!req.url.startsWith('/static')) {
      console.log(`METHOD: ${req.method} || PATH: ${req.url} || TIME: ${(new Date()).toLocaleTimeString()}`);
    }
    
  }
  req.isHxRequest = Boolean(req.get('hx-request')==='true');
  next();
}

export default logRequest;