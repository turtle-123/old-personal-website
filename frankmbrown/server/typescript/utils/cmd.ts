import child_process, { spawn } from 'node:child_process';
import path from 'path';
import fs from 'node:fs';
import os from 'os';

type CommandInputs = {
  cwd: string|URL,
  env?: typeof process.env,
  encoding?: string,
  maxBuffer?: number
}

/**
 * Command that executes command line command
 * - Returns stdout if success
 * - Throws error with stderr has the message if fails
 * @param command {string} The command to execute
 * @param input_obj
 * @property {string} cwd The directory from which to execute command
 * @returns 
 */
export async function execute(command:string,input_obj:CommandInputs) {
  const cwd = input_obj.cwd;
  const env = input_obj.env ? input_obj.env : undefined;
  const encoding = input_obj.encoding ? input_obj.encoding : undefined;
  const maxBuffer = input_obj.maxBuffer ? input_obj.maxBuffer : undefined;
  const options = { cwd, env, encoding, maxBuffer }
  return new Promise<string>((resolve,reject) => {
    child_process.exec(command,options,(err,stdout,stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    })
  })
}
/**
 * Returns the name of the directory a file is operating in
 * @param __dirname 
 * @returns 
 */
export function getCurrentDirectory(__dirname:string) {
  return __dirname;
}
/**
 * Get the name of a file that is executing the function
 * @param _dirname 
 * @param filename 
 * ```javascript
 * import { fileURLToPath } from 'url';
 * const path_to_file = getCurrentFilename(__dirname,url.fileURLToPath(import.meta.url))
 * ```
 */
export function getCurrentFilename(_dirname:string,filename:string) {
  return path.join(_dirname,filename);
}
/**
 * Try to remove a file, and return if failing 
 * @param path 
 */
export async function tryRemoveFile(path:string) {
  try {
    await fs.promises.unlink(path);
    return;
  } catch (e) {
    console.error(e);
    return;
  }
}
/**
 * Spawn a process and execute with inline argument
 * @param command command to execute, e.g. `magick`
 * @param args Arguments to the command, e.g. ['identify', '-verbose', '-']
 * @param data stdin to the command 
 * @returns The output Buffer
 */
export async function executeWithArgument(command:string,args:string[],data:Buffer) {
  try {
    // Newer versions of imagemagick
    if (getOS()!=="windows"&&command==="magick"&&(args[0]==="convert"||args[0]==="identify")) {
      command = args[0];
      args = args.slice(1);
    }
    const spawned_process = spawn(command, args);
    let stderr = '';
    let dataBuffer:any[] = [];
    const ret_data = await new Promise<Buffer>((resolve,reject) => {
      // Handle the output of the magick process
      spawned_process.stdout.on('data', (data) => {
        dataBuffer.push(data);
      });
      // Handle any error output
      spawned_process.stderr.on('data', (data) => {
          stderr += data.toString('utf-8');
      });
      spawned_process.on('error',(err) => {
        reject(err);
      })
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
      spawned_process.stdin.write(data,(error) => {
        if (error) reject(error);
      });
      spawned_process.stdin.end();
    });
    return ret_data;
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong with the spawned process.");
  }
}
/**
 * Get operating system, should return 'windows' or 'linux'
 * @returns 
 */
export function getOS() {
  if (os.platform()==="linux") return 'linux';
  else if (os.platform()==="win32") return 'windows';
  else return os.platform();
}