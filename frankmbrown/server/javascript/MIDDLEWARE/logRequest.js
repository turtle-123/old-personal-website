"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
/**
 * Log the request URL if you are in development
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
function logRequest(req, res, next) {
    if (IS_DEVELOPMENT_1.default) {
        if (!!!req.url.startsWith('/static')) {
            console.log(`METHOD: ${req.method} || PATH: ${req.url} || TIME: ${(new Date()).toLocaleTimeString()}`);
        }
    }
    req.isHxRequest = Boolean(req.get('hx-request') === 'true');
    next();
}
exports.default = logRequest;
