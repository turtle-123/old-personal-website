const fs = require('fs');
const path = require('path');
var CleanCSS = require('clean-css');

const OUTPUT_FOLDER = "C:\\Users\\fmb20\\Desktop\\civgauge-html\\functionality_development\\cleanCssOutput";

const INPUT_FOLDER = "C:\\Users\\fmb20\\Desktop\\civgauge-html\\functionality_development\\src\\css";

async function cleanCss() {
    const files = await fs.promises.readdir(INPUT_FOLDER);
    for(let file of files){
        const str = await fs.promises.readFile(path.resolve(INPUT_FOLDER,file),{encoding:'utf-8'});
        
    }
}

cleanCss();