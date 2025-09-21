import type { Settings } from "../../types";
import { getCacheConnection } from "../../database/cache";
declare module 'express-session' {
  interface SessionData {
    paths: string[],
    settings: Settings,
    user_location: GeolocationPosition,
    census_communities: number[],
    device: {
      phone: boolean,
      tablet: boolean,
      desktop: boolean,
      browser: string|undefined,
      temp: string
    },
    ip_id: number,
    ip: {
      address: string|null,
      type: 0|4|6 // 0 for invalid, 4 for ipv4, 6 for ipv6
    },
    device_location: {lat: number, lng: number, time: number}|false|null,
    /**
     * ip_location: {
     *  false: something went wrong getting ip address,
     *  IpInfo: everything went as planned,
     *  undefined: haven't tried to get ip_location yet
     * }
     */
    ip_location: {lat:number, lng: number, temp: string},
    
    jsNonce: string,
    cssNonce: string,
    csrf_token: string,
    snackbarMessage: {
      showMessage: boolean,
      message: string
    },
    cookiePreferences: {
      necessary: boolean,
      preferences: boolean,
      statistics: boolean,
      showedBanner: boolean
    },
    create_ip_address_row: boolean,
    creating_ip_address_row: boolean,
    deleting_ip_address_row: boolean,
    ip_data_string: string,
    disableSettingsButtons: boolean,
    auth: {
       /**
     * 0=not logged in
     * 1=logged in
     * 2 = subscribed
     * 3 = owner
     */
      level: 0|1|2|3,
      loginAttempts: number,
      userID: undefined|number,
      createAccountAttempts: number,
      createAccountEmailsSent: number,
      resetCredentialsAttempts: number,
      resetCredentialsEmailsSent: number,
      email: string|undefined ,
      username: string|undefined,
      banned: boolean,
      date_created: number
    },
    tempCreateAccount: {
      email: string,
      username: string,
      password: string,
      tfa_code: string 
    },
    tempResetCredentials: {
      email: string,
      username: string,
      password: string,
      tfa_code: string 
    },
    diary: {
      todayID: number,
      todayState: any
    },
    startOfDay: number,
    cachedEmbedding: number[],
    cachedEmbeddingString: string,
    uploadedAudio: number,
    uploadedVideo: number
  } 
};  
declare global {
  namespace Express {
    export interface Request {
      cache: Awaited<(ReturnType<typeof getCacheConnection>)>,
      isHxRequest: boolean
    }
  }
}
import { getImageObject, uploadImageObject } from "../../aws/aws-implementation";
import getDatabase from "../../database";
import { executeWithArgument } from "../../utils/cmd";
import { createTwitterAndLinkedInImages, getImageFromUrl, getTransparentImageBackgroundColor, isImageOpaque } from "../../utils/image";


async function addPageImageAndTwitterImageToPage(imageURL:string) {
  try {
    console.log("Adding Image ".concat(imageURL));
    var image:Buffer = new Buffer('');
    try {
      image = await getImageFromUrl(imageURL);
    } catch (e) {
      if (imageURL.startsWith('https://image.storething.org/frankmbrown/og-image/')) {
        image = await getImageFromUrl(imageURL.replace('https://image.storething.org/frankmbrown/og-image/','https://image.storething.org/frankmbrown/'));
      } 
    }
    if (!!!image) throw new Error("Image dow not exist.");
    const isOpaque = await isImageOpaque(image);
    var newImage:Buffer;
    if (!!!isOpaque) {
      const background = await getTransparentImageBackgroundColor(image);
      newImage = await executeWithArgument("magick",['convert','-','-background',background,'-flatten','jpeg:-'],image);
    } else {
      newImage = image;
    }
    var name = imageURL.replace('https://image.storething.org/frankmbrown/','');
    if (name.startsWith('og-image/')) name = name.replace('og-image/','');
    const { twitter, linkedin } = await createTwitterAndLinkedInImages(image);
    const key = 'frankmbrown/'.concat(name);
    const twitterKey = 'frankmbrown/twitter/'.concat(name);
    const linkedinKey = 'frankmbrown/og-image/'.concat(name);
    await Promise.all([
      uploadImageObject(key,newImage,'jpg',{},3,25),
      uploadImageObject(twitterKey,twitter,'jpg',{},3,25),
      uploadImageObject(linkedinKey,linkedin,'jpg',{},3,25)
    ])
  } catch (e) {
    console.error(e);
  }
}

async function updateImages() {
  const images_query = await getDatabase().query('SELECT DISTINCT image FROM search;');
  const images_rows = images_query.rows.map((obj) => obj.image);
  const promise_arr_1:Promise<any>[] = [];
  console.log("Image Rows: ",images_rows.length);
  for (let i=0;i<images_rows.length; i++) {
    const image = images_rows[i];
    if (image.startsWith('https://image.storething.org/frankmbrown/') || image.startsWith('https://image.storething.org/frankmbrown%2F')) {
      var key = image.replace('https://image.storething.org/frankmbrown/','') || image.replace('https://image.storething.org/frankmbrown%2F','');
      if (key.startsWith('og-image/')) key = key.replace('og-image/','');
      key = 'frankmbrown/' + key;
      promise_arr_1.push(new Promise<{error:boolean,image:string,key:string}>((resolve,reject) => {
        getImageFromUrl('https://image.storething.org/' + key)
        .then(() => {
          resolve({ error: false, image: images_rows[i], key })
        })
        .catch(() => {
          resolve({ error: true, image: images_rows[i], key })
        })
      }));
    } else {
      console.log(image);
    }
  } 
  const resp = await Promise.all(promise_arr_1);
  const promise_arr_2:Promise<any>[] = [];
  for (let i = 0; i < resp.length; i++) {
      if (resp[i].error) {
        console.error("Image With Key ",resp[i].key," does not exist");
      } else {
        promise_arr_2.push(new Promise<{error:boolean,image:string,key:string}>((resolve,reject) => {
          const twitter_key = resp[i].key.replace('frankmbrown/','frankmbrown/twitter/');
          const linkedin_key = resp[i].key.replace('frankmbrown/','frankmbrown/og-image/');
          const { key, image } = resp[i];
          Promise.all([getImageFromUrl('https://image.storething.org/' + twitter_key),getImageFromUrl('https://image.storething.org/' + linkedin_key)])
          .then(() => {
            resolve({ error: false, image, key })
          })
          .catch(() => {
            resolve({ error: true, image, key })
          })
        }));
      }
  }
  console.log(promise_arr_2.length);
  const resp_2 = await Promise.all(promise_arr_2);
  const promise_arr_3:Promise<any>[] = [];
  for (let i = 0; i < resp_2.length; i++) {
    const { error, image } = resp_2[i];
    if (error) {
      promise_arr_3.push(addPageImageAndTwitterImageToPage(image))
    }
  }
  console.log(promise_arr_3.length);
  await Promise.all(promise_arr_3);
}

process.on('beforeExit', (code) => {
  console.log('Process beforeExit event with code: ', code);
});
process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
});


updateImages()
.then((s) => {
  console.log("Done");
  console.log(s);
})
.catch((e) => {
  console.error(e);
  process.exit(1);
})

