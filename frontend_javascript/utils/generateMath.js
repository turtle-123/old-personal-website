const katex = require('katex');
const cheerio = require('cheerio');

function replaceBackslashes(inputString) {
  return inputString.replace(/\\/g, '\\\\');
}
/**
 * [Reference](https://katex.org/docs/options)
 * @param {string} str input string 
 * @param {boolean} displayMode **true** - the math is rendered in display mode, **false** - the math is rendered in inline mode 
 * @param {boolean} leqno  If true, display math has \tags rendered on the left instead of the right, like \usepackage[leqno]{amsmath} in LaTeX.
 * @param {boolean} fleqn If true, display math renders flush left with a 2em left margin, like \documentclass[fleqn] in LaTeX with the amsmath package.
 */
function generateMath(str,displayMode,leqno,fleqn){
    try {
        const htmlStr = katex.renderToString(str,{throwOnError: true, displayMode, leqno, fleqn });
        return {html: htmlStr, input: str};
    } catch (error){
        console.log(error);
        if (error.rawMessage) throw Error(error.rawMessage);
        else throw Error('Sorry, something went wrong rendering LaTeX expression.');
    }
}
module.exports = {generateMath};
