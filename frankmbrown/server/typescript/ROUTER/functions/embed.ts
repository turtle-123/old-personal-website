import { Request } from 'express';
import env from '../../utils/env';

import axios from 'axios';
import { load } from 'cheerio';
import { getUserIdAndIpIdForImageUpload, uploadImageObject } from '../../aws/aws-implementation';
import { getImageFromUrl } from '../../utils/image';
const FACEBOOK_APP_SECRET = env.FACEBOOK_APP_SECRET;
if (!!!FACEBOOK_APP_SECRET) throw new Error('Unable to get Facebook app secret from env.');
 
export type EmbedNews={url:string};
export async function embedNews(req:Request,{url}:EmbedNews){
  try {
    const resp = await axios.get(url,{ timeout: 10000 });
    if (resp.status!==200) throw new Error('Unable to get information from news article.');
    const $ = load(resp.data);
    const type = $('meta[property="og:type"]').prop('content');
    const title = $('meta[property="og:title"]').prop('content');
    const origImageUrl = $('meta[property="og:image"]').prop('content');
    const description = $('meta[property="og:description"]').prop('content');
    if (type!=='article') throw new Error('<meta property="og:type" /> must have a content attribute equal to article.');
    const image = await getImageFromUrl(origImageUrl);
    const {user_id,ip_id} = getUserIdAndIpIdForImageUpload(req);
    const imageURL = await uploadImageObject(`frankmbrown/${encodeURIComponent(title)}`,image,'jpeg',{},user_id,ip_id);
    const host = new URL(url).host;

    const ret = {
      url,
      title,
      description,
      imageURL,
      host
    };
    return ret;
  } catch (error) {
    console.error(error);
    throw new Error('Unable to get embedding for news content.');
  }
}
