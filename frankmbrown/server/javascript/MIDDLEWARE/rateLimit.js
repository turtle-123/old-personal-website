"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGE_WITH_DB_LIMITER = exports.STATIC_PAGE_LIMITER = exports.STATIC_LIMITER = exports.getAdminRateLimit = exports.getRateLimit = void 0;
const express_rate_limit_1 = require("express-rate-limit");
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
const frontendHelper_1 = require("../ROUTER/helper_functions/frontendHelper");
const redirect_override_1 = require("../ROUTER/helper_functions/redirect-override");
const html_1 = require("../ROUTER/html");
const getLimiterOptions = (window, limit, messageStr, svg) => {
    return {
        windowMs: window,
        limit: limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        validate: { trustProxy: false },
        handler: function (req, res) {
            const message = messageStr ? messageStr : "Too many requests have been made to this endpoint!";
            const isHxRequest = req.get('hx-request');
            if ((0, frontendHelper_1.fullPageRequest)(req)) {
                return (0, redirect_override_1.redirect)(req, res, '/', 429, { severity: 'error', message: message });
            }
            else if ((0, frontendHelper_1.pageRequest)(req)) {
                return (0, redirect_override_1.redirect)(req, res, '/', 429, { severity: 'error', message: message });
            }
            else if (isHxRequest) {
                return res.status(200).send((0, html_1.getErrorAlert)(message, svg));
            }
            else {
                return res.status(429).send(message);
            }
        }
    };
};
/**
 * https://github.com/express-rate-limit/express-rate-limit/wiki/Error-Codes#err_erl_permissive_trust_proxy
 *
 * @param window The number of ms until
 * @param limit
 * @returns
 */
function getRateLimit(window, limit, message, svg) {
    if (IS_DEVELOPMENT_1.default) {
        return function (req, res, next) {
            next();
        };
    }
    else {
        const limiter = (0, express_rate_limit_1.rateLimit)(getLimiterOptions(window, limit, message, svg));
        return limiter;
    }
}
exports.getRateLimit = getRateLimit;
/**
 *
 * @param window number of ms
 * @param array [loggedOutLimit,loggedInLimit,adminLimit]
 * @param message The message to send
 * @param svg The svg to send with the snackbar
 */
function getAdminRateLimit(window, array, message, svg) {
    const middleware = (req, res, next) => {
        var _a;
        if (IS_DEVELOPMENT_1.default) {
            return function (req, res, next) {
                next();
            };
        }
        else {
            var limit;
            if ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.level) {
                if (req.session.auth.level === 3)
                    limit = array[1];
                else
                    limit = array[0];
            }
            else {
                limit = array[0];
            }
            const limiter = (0, express_rate_limit_1.rateLimit)(getLimiterOptions(window, limit, message, svg));
            return limiter;
        }
    };
    return middleware;
}
exports.getAdminRateLimit = getAdminRateLimit;
exports.STATIC_LIMITER = getRateLimit(60000, 10000, "500 requests per minute is allowed for static resources!");
exports.STATIC_PAGE_LIMITER = getRateLimit(60000, 100, "100 requests per minute is allowed for static pages!");
exports.PAGE_WITH_DB_LIMITER = getRateLimit(60000, 30, "30 requests per minute is allowed for pages that touch the database!");
