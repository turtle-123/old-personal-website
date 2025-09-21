import env from "../utils/env";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import pgvector from "pgvector/pg";

const AWS_RDS_HOST = env.AWS_RDS_HOST;
const AWS_RDS_PASSWORD = env.AWS_RDS_PASSWORD;
const AWS_RDS_PORT = env.AWS_RDS_PORT;
const AWS_RDS_USER = env.AWS_RDS_USER;
const AWS_RDS_DB_NAME = env.AWS_RDS_DB_NAME;
const AWS_RDS_CIVGAUGE_DB_NAME = env.AWS_RDS_CIVGAUGE_DB_NAME;

const key = fs.readFileSync(
  path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    '..',
    "certificates",
    "us-east-1-bundle.pem"
  )
);

if (!!!AWS_RDS_HOST) throw new Error("Unable to get AWS_RDS_HOST from env.");
if (!!!AWS_RDS_PASSWORD)
  throw new Error("Unable to get AWS_RDS_PASSWORD from env.");
if (!!!AWS_RDS_PORT) throw new Error("Unable to get AWS_RDS_PORT from env.");
if (!!!AWS_RDS_USER) throw new Error("Unable to get AWS_RDS_USER from env.");
if (!!!AWS_RDS_DB_NAME)
  throw new Error("Unable to get AWS_RDS_DB_NAME from env.");
if (!!!AWS_RDS_CIVGAUGE_DB_NAME)
  throw new Error("Unable to get AWS_RDS_CIVGAUGE_DB_NAME from env.");

const config = {
  user: AWS_RDS_USER,
  password: AWS_RDS_PASSWORD,
  host: AWS_RDS_HOST,
  port: parseInt(AWS_RDS_PORT as string),
  ssl: {
    ca: key,
    rejectUnauthorized: true,
  },
} as const;
var pool: undefined | Pool;
var civgaugePool: undefined | Pool;

/**
 * Function to get a connection to a postgres database
 * @param database Type of Database You want to get a geconnection to
 * @returns connection to Amazon RDS Postgres Database
 */
function getDatabase(): Pool {
  if (pool) return pool;
  else {
    pool = new Pool({ ...config, database: AWS_RDS_DB_NAME });
    pool.on("connect", async (client) => {
      await pgvector.registerType(client); 
    });
    pool.on('error',(err) => {
      console.error(err);
      process.exit(1);
    })
    return pool;
  }
}
/**
 * Connect to the civgauge database
 */ 
export function getCivgaugeDatabase(): Pool {
  if (civgaugePool) return civgaugePool;
  else {
    civgaugePool = new Pool({ ...config, database: AWS_RDS_CIVGAUGE_DB_NAME });
    civgaugePool.on("connect", async (client) => {
      await pgvector.registerType(client);
    });
    return civgaugePool;
  }
}


export default getDatabase;
