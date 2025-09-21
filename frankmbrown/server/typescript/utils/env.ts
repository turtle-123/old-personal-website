import * as path from 'node:path';
import * as dotenv from 'dotenv';
import fs from 'node:fs';

/**
 * Environment variable object. Production: app.yaml, development: .env
 */
var env: NodeJS.Process["env"];
if (process?.env?.DEVELOPMENT==="false") {
    env=process.env;
} else {
    dotenv.config({
        path: path.resolve(__dirname,'..','..','..','.env'),
        debug:false,
        override: true
    });
    env=process.env;
}
export default env;
