import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'path';
import axios from 'axios';
import BASE_URL from '../../CONSTANTS/BASE_URL';
import { XMLParser } from 'fast-xml-parser';
import * as TIME from '../../utils/time'

const PATH_TO_KEYFILE = path.resolve(__dirname,'..','..','..','..','..','certificates','personal-website-403817-40e4d06a19fe.json');
const certificateFile = fs.readFileSync(PATH_TO_KEYFILE,{encoding:'utf-8'});
const key = JSON.parse(certificateFile);

async function getCurrentSitemap() {
  try {
    const sitemapPage = await axios.get('https://frankmbrown.net/sitemap.xml',{ timeout: 4000 });
    const sitemap = sitemapPage.data;
    const parser = new XMLParser();
    const jObj = parser.parse(sitemap);
    if (!!!Array.isArray(jObj?.urlset?.url)) throw new Error("Inavlid xml data.");
    // lastmod is in the form of YYY-MM-DD
    const objs = jObj.urlset.url.filter((obj:{loc: string, lastmod: string}) => /https:\/\/frankmbrown\.net.*/.test(obj.loc)&&/\d\d\d\d-\d\d-\d\d/.test(obj.lastmod)).map((obj:{loc: string, lastmod: string}) => ({ path: obj.loc.replace('https://frankmbrown.net',''), lastmod: TIME.getUnixFromDateString(obj.lastmod) }));
    return objs as { path: string, lastmod: number}[];
  } catch (error) {
    console.error(error);
    throw new Error("Unable to get current sitemap.");
  }
  }

const endpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";

const jwtClient = new google.auth.JWT(
  key.client_email,
  PATH_TO_KEYFILE,
  key.private_key,
  ["https://www.googleapis.com/auth/indexing"],
  undefined,
  key.private_key_id
);

export async function indexPages() {
  return new Promise((resolve,reject)=> {
    try {
      jwtClient.authorize(async function(err,tokens){
        if (err||!!!tokens) {
          console.error(err);
          return;
        }
        const sitemap = await getCurrentSitemap();
        const promiseArray:Promise<any>[] = [];
        for (let obj of sitemap) {
          var pathToUse = obj.path;
          if (obj.path.endsWith('/')) {
            pathToUse = obj.path.slice(0,obj.path.length-1);
          }
          const body = {
            "url": `${BASE_URL}${pathToUse}`,
            "type": "URL_UPDATED"
          } as const;
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.access_token}`
          };
          promiseArray.push(axios.post(endpoint,JSON.stringify(body),{ headers }));
        }
        Promise.all(promiseArray)
        .then(async (res)=>{
          await fs.promises.writeFile(path.resolve(__dirname,'./output.json'),JSON.stringify(res.map((obj) => obj.data),null,' '))
          resolve(true);
        })
        .catch(async (error)=>{
          console.error(error);
          await fs.promises.writeFile(path.resolve(__dirname,'./output.json'),JSON.stringify(error))
          resolve(true);
        })
      })
    } catch (error) {
      console.error(error);
      reject(error);
    }
  })
}

