"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("../utils/env"));
console.log(`env.DEVELOPMENT = ${env_1.default.DEVELOPMENT} with type ${typeof env_1.default.DEVELOPMENT}`);
/**
 * @type {boolean} Whether or not the server is in DEVELOPMENT or not
 */
const IS_DEVELOPMENT = Boolean(env_1.default.DEVELOPMENT === 'true');
exports.default = IS_DEVELOPMENT;
