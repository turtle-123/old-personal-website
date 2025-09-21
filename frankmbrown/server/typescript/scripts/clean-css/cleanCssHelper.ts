import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';
import cssNano from 'cssnano';
import fs from 'node:fs';
import path from 'node:path';
import BASE_PATH from '../../CONSTANTS/BASE_PATH';


const INPUT_FOLDER = path.resolve(__dirname,'..','..','..','..','static','css');
const OUTPUT_FOLDER = path.resolve(__dirname,'..','..','..','..','static','css');
const POST_CSS_PROCESSOR = postcss([ cssNano({ preset: 'default' }),autoprefixer,postcssNested]);

async function applyPostCss(str:string) {
  return new Promise<string>((resolve,reject) => {
    POST_CSS_PROCESSOR.process(str).then((result) => resolve(result.css))
  })
}

async function cleanCssFile(path_or_str:string,is_path:boolean=true) {''
  if (is_path) {
    path_or_str = await fs.promises.readFile(path_or_str,{encoding:'utf-8'});
  }
  const cleanedCSS = applyPostCss(path_or_str);
  return cleanedCSS;
}

export async function cleanCss(){
  return new Promise((resolve,reject) => {
    fs.promises.readdir(INPUT_FOLDER)
    .then(async (files) => {
      for (let file of files) {
        // If already minified, continue
        if (file.endsWith('.min.css')) {
          if (/desktop\-bundle\-\d+\.min\.css/.test(file)) {
            await fs.promises.unlink(path.resolve(INPUT_FOLDER,file));
          }
          if (/mobile\-bundle\-\d+\.min\.css/.test(file)) {
            await fs.promises.unlink(path.resolve(INPUT_FOLDER,file));
          }
          continue;
        }

        // get filename of minified file
        const newFileName = (() => {
          const arr = file.split('.');
          return arr[0].concat('.min.css');
        })();

        const path_to_file = path.resolve(INPUT_FOLDER,file);
        const cleanedCSS = await cleanCssFile(path_to_file,true);
        await fs.promises.writeFile(path.resolve(OUTPUT_FOLDER,newFileName),cleanedCSS);
      }
      return true;
    })
    .catch((err) => resolve(false))
    .then(async () => {
      const time_now = (new Date()).getTime();

      const desktopFilesToConcat = [
        'shared.min.css',
        'desktop.min.css',
        'custom.min.css',
        'splide.min.css',
        'pintura.min.css',
        'katex.min.css'
      ];
      var desktopStr = '';
      for (let file of desktopFilesToConcat) {
        const str = await fs.promises.readFile(path.resolve(OUTPUT_FOLDER,file),{encoding:'utf-8'});
        desktopStr+=str;
      }
      const cleanedDesktopCSS = await applyPostCss(desktopStr);
      const desktop_file_name = `desktop-bundle-${time_now}.min.css`;
      await fs.promises.writeFile(path.resolve(OUTPUT_FOLDER,desktop_file_name),cleanedDesktopCSS);
      

      var mobileStr = '';
      const mobileFilesToConcat = [
        'shared.min.css',
        'phone.min.css',
        'custom.min.css',
        'splide.min.css',
        'pintura.min.css',
        'katex.min.css'
      ];
      for (let file of mobileFilesToConcat) {
        const str = await fs.promises.readFile(path.resolve(OUTPUT_FOLDER,file),{encoding:'utf-8'});
        mobileStr+=str;
      }
      // TRYING THIS OUT - QUICK FIX FOR NOW (NOT OPTIMIZED)
      mobileStr = mobileStr.replace(/:hover/g,':focus');
      const cleanedMobileCSS = await applyPostCss(mobileStr);
      const mobile_file_name = `mobile-bundle-${time_now}.min.css`;
      await fs.promises.writeFile(path.resolve(OUTPUT_FOLDER,mobile_file_name),cleanedMobileCSS);
      await fs.promises.writeFile(path.resolve(BASE_PATH,'server','typescript','CONSTANTS','CSS_FILE_HASH.ts'),`export default '${time_now}';`);
      resolve(true);
    })
  })
}
