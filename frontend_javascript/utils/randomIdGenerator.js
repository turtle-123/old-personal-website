/**
 * 
 * @param {string} prefix What should be the prefix for the random string, * **NOTE**: can't start with a number
 * @example  
 * const a = randomIdGenerator(code);
 * console.log(a); // code_83ygy3u2ruewhfui
 * 
 * 
 * @returns string Random ID
 */
function randomIdGenerator(prefix) {
    return prefix.concat(Math.random().toString(36).slice(2));
}
module.exports = randomIdGenerator;