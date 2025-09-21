"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCSRF = exports.isDevelopment = exports.isAdmin = exports.isLoggedOut = exports.isLoggedIn = void 0;
const redirect_override_1 = require("../ROUTER/helper_functions/redirect-override");
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
const RELOAD_SIDEBAR = /*html*/ `<div hx-trigger="load" hx-get="/components/navigation-sidebar" hx-target="#navigation-sidebar-wrapper" hx-swap="outerHTML"></div>`;
function isLoggedIn(req, res, next) {
    if (req.session.auth && req.session.auth.level >= 1) {
        next();
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/login', 401, { severity: 'warning', message: 'You must be logged in to access this resource.' }, RELOAD_SIDEBAR);
    }
}
exports.isLoggedIn = isLoggedIn;
function isLoggedOut(req, res, next) {
    if (req.session.auth && req.session.auth.level === 0) {
        next();
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/', 401, { severity: 'warning', message: 'You must be logged out to access this resource.' }, RELOAD_SIDEBAR);
    }
}
exports.isLoggedOut = isLoggedOut;
function isAdmin(req, res, next) {
    if (req.session.auth && req.session.auth.level >= 3) {
        next();
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/', 401, { severity: 'warning', message: 'You must be an admin to access this resource.' }, RELOAD_SIDEBAR);
    }
}
exports.isAdmin = isAdmin;
function isDevelopment(req, res, next) {
    if (IS_DEVELOPMENT_1.default) {
        next();
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/', 401, { severity: 'warning', message: 'This page is only available during development.' });
    }
}
exports.isDevelopment = isDevelopment;
function validateCSRF(req, res, next) {
    if (req.method !== 'GET' && req.method !== 'OPTIONS') {
        const csrf_token_cookie = req.session.csrf_token;
        if (req.url.startsWith('/analytics') && csrf_token_cookie) {
            next();
        }
        else {
            const csrf_token_request = req.get("X-CSRF-Token");
            const csrf_token_body = req.body['X-CSRF-Token'];
            if (csrf_token_cookie !== csrf_token_request && csrf_token_body !== csrf_token_cookie) {
                console.log("Invalid CSRF:", 'URL:', req.url, 'Method:', req.method, "Cookie: ", csrf_token_cookie, "Header: ", csrf_token_request, "Body:", csrf_token_body);
                if (req.headers['content-type'] === "application/json") {
                    return res.status(400).json({ error: "Invalid CSRF token." });
                }
                else {
                    return (0, redirect_override_1.redirect)(req, res, '/', 200, { severity: 'error', message: 'Incorrect CSRF Token' });
                }
            }
            else {
                next();
            }
        }
    }
    else {
        next();
    }
}
exports.validateCSRF = validateCSRF;
