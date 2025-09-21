"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * CREATE TABLE page_view (
    id bigserial PRIMARY KEY,
    path TEXT NOT NULL,
    ip_id integer NOT NULL references ip_info(id),
    user_id integer REFERENCES users(id),
    date_viewed bigint NOT NULL
);
 */
const express_1 = require("express");
const rateLimit_1 = require("../MIDDLEWARE/rateLimit");
const body_parser_1 = __importDefault(require("body-parser"));
const analytics_1 = require("./functions/analytics");
const database_1 = __importDefault(require("../database"));
const time_1 = require("../utils/time");
const multer_1 = __importDefault(require("multer"));
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
const ANALYTICS_ROUTER = (0, express_1.Router)();
async function viewComments(req, res) {
    var _a;
    try {
        const comment_ids = JSON.parse(req.body['comment-ids']);
        const promise_arr = [];
        const db = (0, database_1.default)();
        for (let id of comment_ids) {
            const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
            const ip_id = req.session.ip_id;
            if (Number.isInteger(id) && Number.isInteger(ip_id)) {
                promise_arr.push(db.query(`INSERT INTO comment_views (comment_id,user_id,ip_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT comment_views_comment_id_user_id_ip_id_key DO NOTHING;`, [id, user_id, ip_id]));
            }
        }
        await Promise.all(promise_arr);
        return res.status(200).send('');
    }
    catch (error) {
        return res.status(200).send('');
    }
}
async function viewAnnotations(req, res) {
    var _a;
    try {
        const annotation_ids = JSON.parse(req.body['annotation-ids']);
        const promise_arr = [];
        const db = (0, database_1.default)();
        for (let id of annotation_ids) {
            const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
            const ip_id = req.session.ip_id;
            if (Number.isInteger(id) && Number.isInteger(ip_id)) {
                promise_arr.push(db.query(`INSERT INTO annotation_views (annotation_id,user_id,ip_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT annotation_views_annotation_id_user_id_ip_id_key DO NOTHING;`, [id, user_id, ip_id]));
            }
        }
        await Promise.all(promise_arr);
        return res.status(200).send('');
    }
    catch (error) {
        return res.status(200).send('');
    }
}
async function pageView(req, res) {
    var _a;
    try {
        if (IS_DEVELOPMENT_1.default) {
            return res.status(200).send('');
        }
        const path = req.body['path'];
        const ip_id = req.session.ip_id;
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
        const date_viewed = (0, time_1.getUnixTime)();
        await (0, database_1.default)().query('INSERT INTO page_view (path,ip_id,user_id,date_viewed) VALUES ($1,$2,$3,$4);', [path, ip_id, user_id, date_viewed]);
        return res.status(200).send('');
    }
    catch (e) {
        console.error(e);
        return res.status(400).send('');
    }
}
const formDataMiddleWare = (0, multer_1.default)().any();
/**
 * [Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)
 *
 */
ANALYTICS_ROUTER.post('/csp-violation/?', (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.json(), analytics_1.handleCspViolation);
ANALYTICS_ROUTER.post('/view-comments', (0, rateLimit_1.getRateLimit)(60000, 500), formDataMiddleWare, viewComments);
ANALYTICS_ROUTER.post('/view-annotations', (0, rateLimit_1.getRateLimit)(60000, 500), formDataMiddleWare, viewAnnotations);
ANALYTICS_ROUTER.post('/page-view', (0, rateLimit_1.getRateLimit)(60000, 500), formDataMiddleWare, pageView);
exports.default = ANALYTICS_ROUTER;
