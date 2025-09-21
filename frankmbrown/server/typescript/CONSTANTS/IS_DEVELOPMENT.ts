import env from "../utils/env";

console.log(`env.DEVELOPMENT = ${env.DEVELOPMENT} with type ${typeof env.DEVELOPMENT}`);
/**
 * @type {boolean} Whether or not the server is in DEVELOPMENT or not
 */
const IS_DEVELOPMENT = Boolean(env.DEVELOPMENT === 'true');
export default IS_DEVELOPMENT;