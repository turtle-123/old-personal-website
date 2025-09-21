"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* ----------------------- Imports -------------------------- */
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const express_2 = require("express");
const rateLimit_1 = require("../MIDDLEWARE/rateLimit");
const redirect_override_1 = require("./helper_functions/redirect-override");
/* ----------------------- Constants ----------------------- */
const STATIC_ROUTER = (0, express_2.Router)({ mergeParams: true });
STATIC_ROUTER.use((0, compression_1.default)());
/* --------------------- Helper Functions ------------------ */
function downloadFile(req, res) {
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
    const { file } = req.params;
    if (!!!DOWNLOADS.has(String(file)))
        return (0, redirect_override_1.redirect)(req, res, '/404', 404, { severity: 'error', message: 'File not found.' });
    else {
        return res.status(200).sendFile(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'download', file));
    }
}
/* ---------------------- Functions ------------------------- */
STATIC_ROUTER.use('/asset', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'asset')));
STATIC_ROUTER.use('/js', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'js')));
STATIC_ROUTER.use('/css', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'css')));
STATIC_ROUTER.use('/fonts', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'fonts')));
STATIC_ROUTER.use('/excalidraw-assets', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'excalidraw-assets')));
STATIC_ROUTER.use('/download/:file', (0, rateLimit_1.getRateLimit)(60000, 10), downloadFile);
STATIC_ROUTER.use('/stl', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'stl')));
STATIC_ROUTER.use('/three', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'three')));
STATIC_ROUTER.use('/dat-gui-main', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'dat-gui-main')));
STATIC_ROUTER.use('/rand-assets', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'rand-assets')));
STATIC_ROUTER.use('/d3', express_1.default.static(path_1.default.resolve(__dirname, '..', '..', '..', 'static', 'd3')));
exports.default = STATIC_ROUTER;
