import { rateLimit, type Options } from 'express-rate-limit';
import IS_DEVELOPMENT from '../CONSTANTS/IS_DEVELOPMENT';
import { NextFunction, Request, Response } from 'express';
import { fullPageRequest, pageRequest } from '../ROUTER/helper_functions/frontendHelper';
import { redirect } from '../ROUTER/helper_functions/redirect-override';
import { getErrorAlert } from '../ROUTER/html';


const getLimiterOptions = (window:number,limit:number,messageStr?:string,svg?:string):Partial<Options> => {
  return {
    windowMs: window,
    limit: limit, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: {trustProxy: false},
    handler: function(req,res) {
      const message = messageStr?messageStr:"Too many requests have been made to this endpoint!";
      const isHxRequest = req.get('hx-request');
      if (fullPageRequest(req)) {
        return redirect(req,res,'/',429,{ severity: 'error', message: message })
      } else if (pageRequest(req)) {
        return redirect(req,res,'/',429,{ severity: 'error', message: message })
      } else if (isHxRequest) {
        return res.status(200).send(getErrorAlert(message,svg));
      } else {
        return res.status(429).send(message);
      }
    }
  }
}


/**
 * https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_permissive_trust_proxy
 * 
 * @param window The number of ms until  
 * @param limit 
 * @returns 
 */
export function getRateLimit(window:number,limit:number,message?:string,svg?:string) {
  if (IS_DEVELOPMENT) {
    return function (req:Request,res:Response,next:NextFunction) {
      next();
    }
  } else {
    const limiter = rateLimit(getLimiterOptions(window,limit,message,svg));
    return limiter;
  }
} 


/**
 * 
 * @param window number of ms
 * @param array [loggedOutLimit,loggedInLimit,adminLimit]
 * @param message The message to send
 * @param svg The svg to send with the snackbar
 */
export function getAdminRateLimit(window:number,array:[number,number,number],message?:string,svg?:string) {
  const middleware = (req:Request,res:Response,next:NextFunction)=> {
    if (IS_DEVELOPMENT) {
      return function (req:Request,res:Response,next:NextFunction) {
        next();
      }
    } else {
      var limit:number;
      if (req.session.auth?.level) {
        if (req.session.auth.level===3) limit = array[1];
        else limit = array[0];
      } else {
        limit = array[0];
      }
      const limiter = rateLimit(getLimiterOptions(window,limit,message,svg));
      return limiter;
    }
  }
  return middleware;
}


export const STATIC_LIMITER = getRateLimit(60000,10000,"500 requests per minute is allowed for static resources!");
export const STATIC_PAGE_LIMITER = getRateLimit(60000,100,"100 requests per minute is allowed for static pages!");
export const PAGE_WITH_DB_LIMITER = getRateLimit(60000,30,"30 requests per minute is allowed for pages that touch the database!");
