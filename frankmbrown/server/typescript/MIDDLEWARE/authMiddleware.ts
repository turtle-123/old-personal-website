import { Request, Response, NextFunction } from 'express';
import { redirect } from '../ROUTER/helper_functions/redirect-override';
import IS_DEVELOPMENT from '../CONSTANTS/IS_DEVELOPMENT';


const RELOAD_SIDEBAR = /*html*/`<div hx-trigger="load" hx-get="/components/navigation-sidebar" hx-target="#navigation-sidebar-wrapper" hx-swap="outerHTML"></div>`

export function isLoggedIn(req:Request,res:Response,next:NextFunction) {
  if (req.session.auth && req.session.auth.level>=1){ 
    next();
  } else {
    return redirect(req,res,'/login',401,{severity:'warning',message:'You must be logged in to access this resource.'},RELOAD_SIDEBAR);
  }
}
export function isLoggedOut(req:Request,res:Response,next:NextFunction) {
  if (req.session.auth && req.session.auth.level===0){ 
    next();
  } else {
    return redirect(req,res,'/',401,{severity:'warning',message:'You must be logged out to access this resource.'},RELOAD_SIDEBAR);
  }
}
export function isAdmin(req:Request,res:Response,next:NextFunction) {
  if (req.session.auth && req.session.auth.level>=3){ 
    next();
  } else {
    return redirect(req,res,'/',401,{severity:'warning',message:'You must be an admin to access this resource.'},RELOAD_SIDEBAR);
  }
}
export function isDevelopment(req:Request,res:Response,next:NextFunction) {
  if (IS_DEVELOPMENT) {
    next();
  } else {
    return redirect(req,res,'/',401,{severity:'warning',message: 'This page is only available during development.'});
  }
}
export function validateCSRF(req:Request,res:Response,next:NextFunction) {
  if (req.method!=='GET'&&req.method!=='OPTIONS') {
    const csrf_token_cookie = req.session.csrf_token;
    if (req.url.startsWith('/analytics')&&csrf_token_cookie) {
      next();
    } else {
      const csrf_token_request = req.get("X-CSRF-Token");
      const csrf_token_body = req.body['X-CSRF-Token'];
      if (csrf_token_cookie!==csrf_token_request&&csrf_token_body!==csrf_token_cookie) {
        console.log("Invalid CSRF:",'URL:',req.url,'Method:',req.method,"Cookie: ",csrf_token_cookie,"Header: ",csrf_token_request,"Body:",csrf_token_body);
        if (req.headers['content-type']==="application/json") {
          return res.status(400).json({ error: "Invalid CSRF token." });
        } else {
          return redirect(req,res,'/',200,{severity:'error', message: 'Incorrect CSRF Token' });  
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
}