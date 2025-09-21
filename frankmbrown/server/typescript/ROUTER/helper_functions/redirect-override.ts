import { Request, Response } from 'express';
import { getSuccessSnackbar, getWarningSnackbar, getErrorSnackbar } from '../html';

/**
 * Function created to handle redirects properly in express
 * @param req 
 * @param res 
 */
export function redirect(req:Request,res:Response,path:string,status?:number,snackbarMessage?:{ severity: 'success'|'warning'|'error', message: string },extraHTML?:string) {
  const isApplicationJSON = req.is('application/json');
  if (snackbarMessage) {
    var message='';
    if (snackbarMessage.severity==="success") {
      message = getSuccessSnackbar(snackbarMessage.message);
    } else if (snackbarMessage.severity==="warning") {
      message = getWarningSnackbar(snackbarMessage.message);
    } else if (snackbarMessage.severity==="error") {
      message = getErrorSnackbar(snackbarMessage.message);
    }
    req.session.snackbarMessage = {
      showMessage: true,
      message
    };
  }
  if (req.isHxRequest) {
    var hxResponse = '';
    if (extraHTML) {
      hxResponse += extraHTML;
    }
    if (path==="/login") hxResponse+=/*html*/`<div hx-trigger="load" hx-get="/components/navigation-sidebar" hx-target="#navigation-sidebar-wrapper" hx-swap="outerHTML"></div>`;
    hxResponse += /*html*/`<div
    hx-get="${path}"
    hx-push-url="true"
    hx-target="#PAGE"
    hx-indicator="#page-transition-progress"
    hx-trigger="load"
    ></div>`;
    return res.status(200).send(hxResponse);
  } else if (isApplicationJSON) {
    return res.status(200).send(getErrorSnackbar('This api route does not exist!'));
  } else {
    return res.status(status?status:200).redirect(path);
  }
}