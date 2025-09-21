"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirect = void 0;
const html_1 = require("../html");
/**
 * Function created to handle redirects properly in express
 * @param req
 * @param res
 */
function redirect(req, res, path, status, snackbarMessage, extraHTML) {
    const isApplicationJSON = req.is('application/json');
    if (snackbarMessage) {
        var message = '';
        if (snackbarMessage.severity === "success") {
            message = (0, html_1.getSuccessSnackbar)(snackbarMessage.message);
        }
        else if (snackbarMessage.severity === "warning") {
            message = (0, html_1.getWarningSnackbar)(snackbarMessage.message);
        }
        else if (snackbarMessage.severity === "error") {
            message = (0, html_1.getErrorSnackbar)(snackbarMessage.message);
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
        if (path === "/login")
            hxResponse += /*html*/ `<div hx-trigger="load" hx-get="/components/navigation-sidebar" hx-target="#navigation-sidebar-wrapper" hx-swap="outerHTML"></div>`;
        hxResponse += /*html*/ `<div
    hx-get="${path}"
    hx-push-url="true"
    hx-target="#PAGE"
    hx-indicator="#page-transition-progress"
    hx-trigger="load"
    ></div>`;
        return res.status(200).send(hxResponse);
    }
    else if (isApplicationJSON) {
        return res.status(200).send((0, html_1.getErrorSnackbar)('This api route does not exist!'));
    }
    else {
        return res.status(status ? status : 200).redirect(path);
    }
}
exports.redirect = redirect;
