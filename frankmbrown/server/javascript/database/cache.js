"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.getCacheConnection = void 0;
/**
 * @file File to get cache connection, clear cache, and do other stuff with cache
 *
 * **NOTE**: If you want to add more cache (like one for session and one for general), you
 * can. It would probably be best to do something like getDatabase in this regard
 *
 * @author Frank Brown
 * @todo Put up a firewall in azure or something to make sure the connection is coming from the egress? connection on the server
 */
const time_1 = require("../utils/time");
const _1 = __importDefault(require("."));
const GET_QUERY = `SELECT value FROM cache WHERE key=$1;`;
const DELETE_QUERY = `DELETE FROM cache WHERE key=$1`;
const SET_QUERY = `INSERT INTO cache (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2;`;
const FLUSH_DB = `DELETE FROM cache WHERE true;`;
const FLUSH_SESSION = `DELETE FROM session WHERE true;`;
class CacheConnection {
    constructor() {
        this.created = 0;
        this.created = (0, time_1.getUnixTime)();
    }
    async get(key) {
        const db = (0, _1.default)();
        const resp = await db.query(GET_QUERY, [key]);
        if (resp.rows.length) {
            return resp.rows[0].value;
        }
        else {
            return null;
        }
    }
    async set(key, value) {
        const db = (0, _1.default)();
        await db.query(SET_QUERY, [key, value]);
        return true;
    }
    async del(key) {
        const db = (0, _1.default)();
        await db.query(DELETE_QUERY, [key]);
        return true;
    }
    async flushDb() {
        const db = (0, _1.default)();
        await db.query(FLUSH_DB);
        await db.query(FLUSH_SESSION);
        return "OK";
    }
}
/**
 *
 * @returns A Connection to the Cache
 */
function getCacheConnection() {
    const cacheConnection = new CacheConnection();
    return cacheConnection;
}
exports.getCacheConnection = getCacheConnection;
async function clearCache() {
    const cache = getCacheConnection();
    var response = await cache.flushDb();
    if (response === 'OK')
        console.log('Cache cleared.');
}
exports.clearCache = clearCache;
