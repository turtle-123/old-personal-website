"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOS = exports.executeWithArgument = exports.tryRemoveFile = exports.getCurrentFilename = exports.getCurrentDirectory = exports.execute = void 0;
const node_child_process_1 = __importStar(require("node:child_process"));
const path_1 = __importDefault(require("path"));
const node_fs_1 = __importDefault(require("node:fs"));
const os_1 = __importDefault(require("os"));
/**
 * Command that executes command line command
 * - Returns stdout if success
 * - Throws error with stderr has the message if fails
 * @param command {string} The command to execute
 * @param input_obj
 * @property {string} cwd The directory from which to execute command
 * @returns
 */
async function execute(command, input_obj) {
    const cwd = input_obj.cwd;
    const env = input_obj.env ? input_obj.env : undefined;
    const encoding = input_obj.encoding ? input_obj.encoding : undefined;
    const maxBuffer = input_obj.maxBuffer ? input_obj.maxBuffer : undefined;
    const options = { cwd, env, encoding, maxBuffer };
    return new Promise((resolve, reject) => {
        node_child_process_1.default.exec(command, options, (err, stdout, stderr) => {
            if (err)
                reject(err);
            else
                resolve(stdout);
        });
    });
}
exports.execute = execute;
/**
 * Returns the name of the directory a file is operating in
 * @param __dirname
 * @returns
 */
function getCurrentDirectory(__dirname) {
    return __dirname;
}
exports.getCurrentDirectory = getCurrentDirectory;
/**
 * Get the name of a file that is executing the function
 * @param _dirname
 * @param filename
 * ```javascript
 * import { fileURLToPath } from 'url';
 * const path_to_file = getCurrentFilename(__dirname,url.fileURLToPath(import.meta.url))
 * ```
 */
function getCurrentFilename(_dirname, filename) {
    return path_1.default.join(_dirname, filename);
}
exports.getCurrentFilename = getCurrentFilename;
/**
 * Try to remove a file, and return if failing
 * @param path
 */
async function tryRemoveFile(path) {
    try {
        await node_fs_1.default.promises.unlink(path);
        return;
    }
    catch (e) {
        console.error(e);
        return;
    }
}
exports.tryRemoveFile = tryRemoveFile;
/**
 * Spawn a process and execute with inline argument
 * @param command command to execute, e.g. `magick`
 * @param args Arguments to the command, e.g. ['identify', '-verbose', '-']
 * @param data stdin to the command
 * @returns The output Buffer
 */
async function executeWithArgument(command, args, data) {
    try {
        // Newer versions of imagemagick
        if (getOS() !== "windows" && command === "magick" && (args[0] === "convert" || args[0] === "identify")) {
            command = args[0];
            args = args.slice(1);
        }
        const spawned_process = (0, node_child_process_1.spawn)(command, args);
        let stderr = '';
        let dataBuffer = [];
        const ret_data = await new Promise((resolve, reject) => {
            // Handle the output of the magick process
            spawned_process.stdout.on('data', (data) => {
                dataBuffer.push(data);
            });
            // Handle any error output
            spawned_process.stderr.on('data', (data) => {
                stderr += data.toString('utf-8');
            });
            spawned_process.on('error', (err) => {
                reject(err);
            });
            // Handle process exit
            spawned_process.on('close', (code) => {
                if (code !== 0) {
                    reject(`${stderr}`);
                }
                // Combine all chunks to single buffer
                const imageBuffer = Buffer.concat(dataBuffer);
                resolve(imageBuffer);
            });
            // Write the image buffer to the process stdin
            spawned_process.stdin.write(data, (error) => {
                if (error)
                    reject(error);
            });
            spawned_process.stdin.end();
        });
        return ret_data;
    }
    catch (error) {
        console.error(error);
        throw new Error("Something went wrong with the spawned process.");
    }
}
exports.executeWithArgument = executeWithArgument;
/**
 * Get operating system, should return 'windows' or 'linux'
 * @returns
 */
function getOS() {
    if (os_1.default.platform() === "linux")
        return 'linux';
    else if (os_1.default.platform() === "win32")
        return 'windows';
    else
        return os_1.default.platform();
}
exports.getOS = getOS;
