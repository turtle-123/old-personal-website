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

import { updateComments } from "./updateComments";

updateComments()
.then(() => {
  console.log("Successfully updated comments!");
  process.exit(0);
})
.catch((e) => {
  console.error(e);
  process.exit(1);
})