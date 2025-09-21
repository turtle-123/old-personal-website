/**
 * @file
 * @author Frank Brown
 */
import env from '../server/typescript/utils/env';
import https from 'node:https';
import type { IncomingMessage } from 'node:http';

const BING_WEB_SEARCH_ENDPOINT=env.BING_WEB_SEARCH_ENDPOINT;
const BING_WEB_SEARCH_IMAGE_PATH=env.BING_WEB_SEARCH_IMAGE_PATH;
const BING_WEB_SEARCH_KEY=env.BING_WEB_SEARCH_KEY;
if (!!!BING_WEB_SEARCH_ENDPOINT) throw Error('Unable to get BING_WEB_SEARCH_ENDPOINT from env.');
if (!!!BING_WEB_SEARCH_IMAGE_PATH) throw Error('Unable to get BING_WEB_SEARCH_IMAGE_PATH from env.');
if (!!!BING_WEB_SEARCH_KEY) throw Error('Unable to get BING_WEB_SEARCH_KEY from env.');

/**
 * Gets the community profile pictures for census communities
 * @param {string} str Search Query Parameter 
 * @returns {string[]} An array of contenturls
 */
async function getBingImages(str: string):Promise<{contentURL: string, hostPageUrl: string, alt: string}[]> {
    return new Promise((resolve,reject) => {
        const request_params = {
            method : 'GET',
            hostname : BING_WEB_SEARCH_ENDPOINT,
            path : BING_WEB_SEARCH_IMAGE_PATH + '?q=' + encodeURIComponent(str),
            headers : {
            'Ocp-Apim-Subscription-Key' : BING_WEB_SEARCH_KEY,
            }
        };
        const response_handler = function (response: IncomingMessage) {
            let body = '';
            response.on('data',(d) => body+=d);
            response.on('end',async()=>{
                try {
                    const b = JSON.parse(body);
                    resolve(b.value.map((obj: any) => ({contentURL: obj.contentUrl, hostPageUrl: obj.hostPageUrl, alt: obj.name})).filter((obj: {contentURL: string, hostPageUrl: string, alt: string}) => obj.contentURL?.length));
                } catch (error) {
                    reject('There was an error')
                }
            })
        };
        const req = https.request(request_params, response_handler);
        req.end();
    })
}


export default getBingImages;