"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanCss = void 0;
const autoprefixer_1 = __importDefault(require("autoprefixer"));
const postcss_1 = __importDefault(require("postcss"));
const postcss_nested_1 = __importDefault(require("postcss-nested"));
const cssnano_1 = __importDefault(require("cssnano"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const BASE_PATH_1 = __importDefault(require("../../CONSTANTS/BASE_PATH"));
const INPUT_FOLDER = node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'static', 'css');
const OUTPUT_FOLDER = node_path_1.default.resolve(__dirname, '..', '..', '..', '..', 'static', 'css');
const POST_CSS_PROCESSOR = (0, postcss_1.default)([(0, cssnano_1.default)({ preset: 'default' }), autoprefixer_1.default, postcss_nested_1.default]);
async function applyPostCss(str) {
    return new Promise((resolve, reject) => {
        POST_CSS_PROCESSOR.process(str).then((result) => resolve(result.css));
    });
}
async function cleanCssFile(path_or_str, is_path = true) {
    '';
    if (is_path) {
        path_or_str = await node_fs_1.default.promises.readFile(path_or_str, { encoding: 'utf-8' });
    }
    const cleanedCSS = applyPostCss(path_or_str);
    return cleanedCSS;
}
async function cleanCss() {
    return new Promise((resolve, reject) => {
        node_fs_1.default.promises.readdir(INPUT_FOLDER)
            .then(async (files) => {
            for (let file of files) {
                // If already minified, continue
                if (file.endsWith('.min.css')) {
                    if (/desktop\-bundle\-\d+\.min\.css/.test(file)) {
                        await node_fs_1.default.promises.unlink(node_path_1.default.resolve(INPUT_FOLDER, file));
                    }
                    if (/mobile\-bundle\-\d+\.min\.css/.test(file)) {
                        await node_fs_1.default.promises.unlink(node_path_1.default.resolve(INPUT_FOLDER, file));
                    }
                    continue;
                }
                // get filename of minified file
                const newFileName = (() => {
                    const arr = file.split('.');
                    return arr[0].concat('.min.css');
                })();
                const path_to_file = node_path_1.default.resolve(INPUT_FOLDER, file);
                const cleanedCSS = await cleanCssFile(path_to_file, true);
                await node_fs_1.default.promises.writeFile(node_path_1.default.resolve(OUTPUT_FOLDER, newFileName), cleanedCSS);
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
                const str = await node_fs_1.default.promises.readFile(node_path_1.default.resolve(OUTPUT_FOLDER, file), { encoding: 'utf-8' });
                desktopStr += str;
            }
            const cleanedDesktopCSS = await applyPostCss(desktopStr);
            const desktop_file_name = `desktop-bundle-${time_now}.min.css`;
            await node_fs_1.default.promises.writeFile(node_path_1.default.resolve(OUTPUT_FOLDER, desktop_file_name), cleanedDesktopCSS);
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
                const str = await node_fs_1.default.promises.readFile(node_path_1.default.resolve(OUTPUT_FOLDER, file), { encoding: 'utf-8' });
                mobileStr += str;
            }
            // TRYING THIS OUT - QUICK FIX FOR NOW (NOT OPTIMIZED)
            mobileStr = mobileStr.replace(/:hover/g, ':focus');
            const cleanedMobileCSS = await applyPostCss(mobileStr);
            const mobile_file_name = `mobile-bundle-${time_now}.min.css`;
            await node_fs_1.default.promises.writeFile(node_path_1.default.resolve(OUTPUT_FOLDER, mobile_file_name), cleanedMobileCSS);
            await node_fs_1.default.promises.writeFile(node_path_1.default.resolve(BASE_PATH_1.default, 'server', 'typescript', 'CONSTANTS', 'CSS_FILE_HASH.ts'), `export default '${time_now}';`);
            resolve(true);
        });
    });
}
exports.cleanCss = cleanCss;
