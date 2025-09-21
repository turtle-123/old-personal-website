const path = require('node:path');
const fs = require('node:fs');

const path_to_frankmbrown = path.resolve(__dirname,'..','..','frankmbrown');
const OUT_DIRECTORY_BUILD = path.resolve(path_to_frankmbrown,'static','js');
const LEXICAL_OUT_DIR = path.resolve(path_to_frankmbrown,'server','typescript','lexical');
const DESKTOP_DIR = path.resolve(__dirname,'..','dist','desktop');
const PHONE_DIR = path.resolve(__dirname,'..','dist','phone');
const SERVICE_WORKER_FILE = path.resolve(__dirname,'..','dist','firebase-messaging-sw','firebase-messaging-sw.js')
const FOR_REFERENCE = path.resolve(__dirname,'..','src','js');
const LEXICAL_FOLDER = path.resolve(FOR_REFERENCE,'lexical-folder');
const EDITOR_THEME_FILE = fs.readFileSync( path.resolve(FOR_REFERENCE,'lexical-implementation','EDITOR_THEME.ts'),{encoding:'utf-8'});

const PATH_TO_JS_FILE_MOBILE = String.raw`C:\Users\fmb20\Desktop\CODE\civgauge\frankmbrown\server\typescript\CONSTANTS\JS_FILE_HASH_MOBILE.ts`;
const PATH_TO_JS_FILE_DESKTOP = String.raw`C:\Users\fmb20\Desktop\CODE\civgauge\frankmbrown\server\typescript\CONSTANTS\JS_FILE_HASH_DESKTOP.ts`;


/**
 * Remove files 
 */
async function removeFiles() {
  console.log("Starting Removing Files");
  const files = await fs.promises.readdir(OUT_DIRECTORY_BUILD);
  const promiseArr = [];
  for (let file of files) {
    if (file==="constant") continue;
    promiseArr.push(fs.promises.unlink(path.resolve(OUT_DIRECTORY_BUILD,file)));
  }
  await Promise.all(promiseArr);
  console.log("Removed Files");
}

async function writeFilesIntoBackendDirectory() {
  const NO_REPEAT_FILES = new Set([
    'index.html',
    'head-support.min.js',
    'htmx-extensions.min.js',
    'htmx.min.js',
    'README.md'
  ]);
  // Copy files into for reference folders
  console.log('Copying Files Into Reference Folder');
  const desktopFiles = await fs.promises.readdir(DESKTOP_DIR);
  for (let file of desktopFiles) {
    if (!!!NO_REPEAT_FILES.has(file) && file.split('.').at(-1)==='js') {
      NO_REPEAT_FILES.add(file);
      const fileStr = await fs.promises.readFile(path.resolve(DESKTOP_DIR,file),{encoding:'utf-8'});
      await fs.promises.writeFile(path.resolve(OUT_DIRECTORY_BUILD,file),fileStr).catch((err) => console.error(err));
    }
  }
  const phoneFiles = await fs.promises.readdir(PHONE_DIR);
  for (let file of phoneFiles) {
    if (!!!NO_REPEAT_FILES.has(file)&&file.split('.').at(-1)==='js') {
      NO_REPEAT_FILES.add(file);
      const fileStr = await fs.promises.readFile(path.resolve(PHONE_DIR,file),{encoding:'utf-8'});
      await fs.promises.writeFile(path.resolve(OUT_DIRECTORY_BUILD,file),fileStr).catch((err) => console.error(err));
    }
  }
  const SERVICE_WORKER_FILE_CONTENTS = await fs.promises.readFile(SERVICE_WORKER_FILE,{encoding:'utf-8'});
  await fs.promises.writeFile(path.resolve(OUT_DIRECTORY_BUILD,'firebase-messaging-sw.js'),SERVICE_WORKER_FILE_CONTENTS)
}

async function writeLexicalFilesToBackend() {
// Write Lexical Files into the lexical folder and archive the lexical files
console.log('Writing Lexical Files into output folder');
const lexicalFiles = await fs.promises.readdir(LEXICAL_FOLDER);
for (let file of lexicalFiles) {
  const content = await fs.promises.readFile(path.resolve(LEXICAL_FOLDER,file),{encoding:'utf-8'});
  await fs.promises.writeFile(path.resolve(LEXICAL_OUT_DIR,file),content.replace(/'personal-website-shared'/g,"'../personal-website-shared'"));
}
await fs.promises.writeFile(path.resolve(LEXICAL_OUT_DIR,'EDITOR_THEME.ts'),EDITOR_THEME_FILE);
}

async function updateJS_FILE_HASH() {
  const files = await fs.promises.readdir(OUT_DIRECTORY_BUILD);
  for (let file of files) {
    if (/desktop\.(.*)\.min\.js/.test(file)) {
      const hash = file.replace('desktop.','').replace('.min.js','');
      console.log(hash)
      fs.writeFileSync(PATH_TO_JS_FILE_DESKTOP,`export default '${hash}';`);
    } else if (/mobile\.(.*)\.min\.js/.test(file)) {
      const hash = file.replace('mobile.','').replace('.min.js','');
      console.log(hash);
      fs.writeFileSync(PATH_TO_JS_FILE_MOBILE,`export default '${hash}';`);
    }
  }
}

async function afterBuild(){
  try {    
    await removeFiles();
    await writeFilesIntoBackendDirectory();
    await writeLexicalFilesToBackend();    
    await updateJS_FILE_HASH();
  } catch (e) {
    console.error(e);
  }
  
}

afterBuild();