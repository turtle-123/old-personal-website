"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCspViolation = void 0;
const database_1 = __importDefault(require("../../database"));
const TIME = __importStar(require("../../utils/time"));
const stringOrNull = (val) => {
    if (typeof val === 'string')
        return val;
    else
        return null;
};
async function handleCspViolation(req, res) {
    var _a;
    try {
        const query = `INSERT INTO csp_violations (
      ip_id,
      unix_time,
      blocked_uri,
      disposition,
      document_uri,
      effective_directive,
      original_policy,
      referrer,
      script_sample,
      status_code,
      violated_directive
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11
    );`;
        const ip_id = Number((_a = req === null || req === void 0 ? void 0 : req.session) === null || _a === void 0 ? void 0 : _a.ip_id) || null;
        const unix_time = TIME.getUnixTime();
        const cspReport = req.body["csp-report"];
        const blockedURI = stringOrNull(cspReport['blocked-uri']);
        const disposition = stringOrNull(cspReport['disposition']);
        const documentUri = stringOrNull(cspReport['document-uri']);
        const effectiveDirective = stringOrNull(cspReport['effective-directive']);
        const originalPolicy = stringOrNull(cspReport['original-policy']);
        const referrer = stringOrNull(cspReport['referrer']);
        const scriptSample = stringOrNull(cspReport['script-sample']);
        const statusCode = stringOrNull(cspReport['status-code']);
        const violatedDirective = stringOrNull(cspReport['violated-directive']);
        const arr = [
            ip_id,
            unix_time,
            blockedURI,
            disposition,
            documentUri,
            effectiveDirective,
            originalPolicy,
            referrer,
            scriptSample,
            statusCode,
            violatedDirective
        ];
        await (0, database_1.default)().query(query, arr);
    }
    catch (error) {
        console.error(error);
    }
    return res.sendStatus(200);
}
exports.handleCspViolation = handleCspViolation;
