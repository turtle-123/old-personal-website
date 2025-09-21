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
exports.getCivgaugeDatabase = void 0;
const env_1 = __importDefault(require("../utils/env"));
const pg_1 = require("pg");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pg_2 = __importDefault(require("pgvector/pg"));
const AWS_RDS_HOST = env_1.default.AWS_RDS_HOST;
const AWS_RDS_PASSWORD = env_1.default.AWS_RDS_PASSWORD;
const AWS_RDS_PORT = env_1.default.AWS_RDS_PORT;
const AWS_RDS_USER = env_1.default.AWS_RDS_USER;
const AWS_RDS_DB_NAME = env_1.default.AWS_RDS_DB_NAME;
const AWS_RDS_CIVGAUGE_DB_NAME = env_1.default.AWS_RDS_CIVGAUGE_DB_NAME;
const key = fs.readFileSync(path.resolve(__dirname, "..", "..", "..", '..', "certificates", "us-east-1-bundle.pem"));
if (!!!AWS_RDS_HOST)
    throw new Error("Unable to get AWS_RDS_HOST from env.");
if (!!!AWS_RDS_PASSWORD)
    throw new Error("Unable to get AWS_RDS_PASSWORD from env.");
if (!!!AWS_RDS_PORT)
    throw new Error("Unable to get AWS_RDS_PORT from env.");
if (!!!AWS_RDS_USER)
    throw new Error("Unable to get AWS_RDS_USER from env.");
if (!!!AWS_RDS_DB_NAME)
    throw new Error("Unable to get AWS_RDS_DB_NAME from env.");
if (!!!AWS_RDS_CIVGAUGE_DB_NAME)
    throw new Error("Unable to get AWS_RDS_CIVGAUGE_DB_NAME from env.");
const config = {
    user: AWS_RDS_USER,
    password: AWS_RDS_PASSWORD,
    host: AWS_RDS_HOST,
    port: parseInt(AWS_RDS_PORT),
    ssl: {
        ca: key,
        rejectUnauthorized: true,
    },
};
var pool;
var civgaugePool;
/**
 * Function to get a connection to a postgres database
 * @param database Type of Database You want to get a geconnection to
 * @returns connection to Amazon RDS Postgres Database
 */
function getDatabase() {
    if (pool)
        return pool;
    else {
        pool = new pg_1.Pool({ ...config, database: AWS_RDS_DB_NAME });
        pool.on("connect", async (client) => {
            await pg_2.default.registerType(client);
        });
        pool.on('error', (err) => {
            console.error(err);
            process.exit(1);
        });
        return pool;
    }
}
/**
 * Connect to the civgauge database
 */
function getCivgaugeDatabase() {
    if (civgaugePool)
        return civgaugePool;
    else {
        civgaugePool = new pg_1.Pool({ ...config, database: AWS_RDS_CIVGAUGE_DB_NAME });
        civgaugePool.on("connect", async (client) => {
            await pg_2.default.registerType(client);
        });
        return civgaugePool;
    }
}
exports.getCivgaugeDatabase = getCivgaugeDatabase;
exports.default = getDatabase;
