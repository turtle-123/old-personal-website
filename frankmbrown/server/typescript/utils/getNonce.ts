import crypto from 'node:crypto';
/**
 * Function for getting a nonce
 * @returns nonce 
 */
function getNonce() {
  const nonce = crypto.randomBytes(16).toString('base64');
  return nonce;
}
export default getNonce;