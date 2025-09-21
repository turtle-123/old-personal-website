"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_crypto_1 = __importDefault(require("node:crypto"));
/**
 * Function for getting a nonce
 * @returns nonce
 */
function getNonce() {
    const nonce = node_crypto_1.default.randomBytes(16).toString('base64');
    return nonce;
}
exports.default = getNonce;
