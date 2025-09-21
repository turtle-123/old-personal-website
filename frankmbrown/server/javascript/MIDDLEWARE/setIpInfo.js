"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_net_1 = __importDefault(require("node:net"));
const IS_DEVELOPMENT_1 = __importDefault(require("../CONSTANTS/IS_DEVELOPMENT"));
function generateRandomIP() {
    let ip = "";
    for (let i = 0; i < 4; i++) {
        ip += Math.floor(Math.random() * 256) + ".";
    }
    return ip.slice(0, -1); // Remove the trailing dot
}
/**
 * If unable to get ip address, set address as null in Session Cache,
 * Then Send appropriate page back to user
 * Else, set IP address in Session Cache and continue
 *
 * [Reference](https://www.npmjs.com/package/request-ip) for .clientIp
 *
 * @param req Request
 */
function setIpInfo(req, res, next) {
    if (IS_DEVELOPMENT_1.default && !!!req.session.ip) {
        const ip = generateRandomIP(); // See 
        const type = node_net_1.default.isIP(String(ip));
        if (ip === undefined)
            req.session.ip = { address: null, type: 0 };
        else
            req.session.ip = { address: String(ip), type };
    }
    else if (!!!req.session.ip) {
        const ip = req.clientIp; // See 
        const type = node_net_1.default.isIP(String(ip));
        if (ip === undefined)
            req.session.ip = { address: null, type: 0 };
        else
            req.session.ip = { address: String(ip), type };
    }
    next();
}
exports.default = setIpInfo;
