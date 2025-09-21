/**
 * @file File to get cache connection, clear cache, and do other stuff with cache
 * 
 * **NOTE**: If you want to add more cache (like one for session and one for general), you 
 * can. It would probably be best to do something like getDatabase in this regard
 * 
 * @author Frank Brown
 * @todo Put up a firewall in azure or something to make sure the connection is coming from the egress? connection on the server
 */
import { getUnixTime } from "../utils/time";
import getDatabase from ".";

const GET_QUERY = `SELECT value FROM cache WHERE key=$1;`
const DELETE_QUERY = `DELETE FROM cache WHERE key=$1`;
const SET_QUERY = `INSERT INTO cache (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2;`
const FLUSH_DB = `DELETE FROM cache WHERE true;`;
const FLUSH_SESSION = `DELETE FROM session WHERE true;`;

class CacheConnection {
    created: number = 0;
    constructor() {
        this.created = getUnixTime();        
    }
    async get(key:string) {
        const db = getDatabase();
        const resp = await db.query(GET_QUERY,[key]);
        if (resp.rows.length) {
            return resp.rows[0].value as string;
        } else {
            return null;
        }
    }
    async set(key:string,value:string) {
        const db = getDatabase();
        await db.query(SET_QUERY,[key,value]);
        return true;
    }
    async del(key:string) {
        const db = getDatabase();
        await db.query(DELETE_QUERY,[key]);
        return true;
    }
    async flushDb() {
        const db = getDatabase();
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


async function clearCache(){
    const cache = getCacheConnection();
    var response = await cache.flushDb();
    if (response==='OK') console.log('Cache cleared.');
}

export {
    getCacheConnection,
    clearCache,
};