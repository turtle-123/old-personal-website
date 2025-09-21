/* ----------------------- Imports -------------------------- */
import express from 'express';
import path from 'path';
import compression from "compression";
import { Router, Request, Response } from "express";
import { getRateLimit } from '../MIDDLEWARE/rateLimit';
import { redirect } from './helper_functions/redirect-override';

/* ----------------------- Constants ----------------------- */ 
const STATIC_ROUTER = Router({mergeParams:true});
STATIC_ROUTER.use(compression());

/* --------------------- Helper Functions ------------------ */ 
function downloadFile(req:Request,res:Response) {
  const DOWNLOADS = new Set([
    'google-map.js',
    'html.json',
    'desktop.css',
    'shared.css',
    'phone.css',
    'desktop.ts',
    'shared.ts',
    'mobile.ts',
    'all-client-files.zip'
  ]);
  const  { file } = req.params;
  if (!!!DOWNLOADS.has(String(file))) return redirect(req,res,'/404',404,{severity:'error',message:'File not found.'});
  else {
    return res.status(200).sendFile(path.resolve(__dirname,'..','..','..','static','download',file));
  }
}

/* ---------------------- Functions ------------------------- */

STATIC_ROUTER.use('/asset',express.static(path.resolve(__dirname,'..','..','..','static','asset')));
STATIC_ROUTER.use('/js',express.static(path.resolve(__dirname,'..','..','..','static','js')));
STATIC_ROUTER.use('/css',express.static(path.resolve(__dirname,'..','..','..','static','css')));
STATIC_ROUTER.use('/fonts',express.static(path.resolve(__dirname,'..','..','..','static','fonts')));
STATIC_ROUTER.use('/excalidraw-assets',express.static(path.resolve(__dirname,'..','..','..','static','excalidraw-assets')));
STATIC_ROUTER.use('/download/:file',getRateLimit(60000,10),downloadFile);
STATIC_ROUTER.use('/stl',express.static(path.resolve(__dirname,'..','..','..','static','stl')));
STATIC_ROUTER.use('/three',express.static(path.resolve(__dirname,'..','..','..','static','three')));
STATIC_ROUTER.use('/dat-gui-main',express.static(path.resolve(__dirname,'..','..','..','static','dat-gui-main')));
STATIC_ROUTER.use('/rand-assets',express.static(path.resolve(__dirname,'..','..','..','static','rand-assets')));
STATIC_ROUTER.use('/d3',express.static(path.resolve(__dirname,'..','..','..','static','d3')));

export default STATIC_ROUTER;