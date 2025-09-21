/**
 * @file Use this file to handle random api route controllers
 */
import { Request, Response} from 'express';
import type { CircleInput, PolygonInput } from '../../types';
import hljs from 'highlight.js';

/**
 * Function to test whether latitude and longitude are valid
 * @param lat latitude
 * @param lng longitude
 */
const validLatLng = (lat: number, lng: number) => {
  return Boolean(lat < 90 && lat > -90 && lng > -180 && lng < 180);
} 

/**
 * 
 * @param body req.body after bodyParser middleware
 * @returns {[key: string]: CircleInput} where the **key** is the **name** of the input
 */
const getCircleInputs = (body: any):{[key: string]: CircleInput} => {
  const ret: any = {};
  try {
    Object.keys(body).forEach((key: string) => {
      if (key.startsWith('circle_')){
        try {
          const temp = JSON.parse(body[key]);
          if (typeof temp.r !== 'number') return;
          if (typeof temp?.c?.lat !== 'number') return;
          if (typeof temp?.c?.lng !== 'number') return;
          if (temp.r > 40000*1000) return;
          if (!!!validLatLng(temp.c.lat,temp.c.lng)) return;
          ret[key] = {r:temp.r, c: {lat:temp.c.lat,lng:temp.c.lng}};
        } catch (error) {
          return;
        }
      } 
    })
    return ret;
  } catch (error){  
    return {};
  }
}
/**
 * 
 * @param body req.body after bodyParser middleware
 * @returns {[key: string]: string}
 */
const getPolygonInputs = (body: any):{[key:string]: PolygonInput}=>{
  const ret: any = {};
  try {
    Object.keys(body).forEach((key: string) => {
      if (key.startsWith('polygon_')){
        try {
          const curr:[number,number][] = [];
          const temp = JSON.parse(body[key]);
          if (!!!Array.isArray(temp)) return;
          for (let [lng,lat] of temp) {
            if (!!!validLatLng(lat,lng)) return;
            else curr.push([lng,lat]);
          }
          ret[key] = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [curr]
            },
            properties: {}
          }
        } catch (error) {
          return;
        }        
      } 
    })
    return ret;
  } catch (error){  
    return {};
  }
}
type RenderCircleInputExampleObject = {
  layout: false,
  circleInputs: (CircleInput & {name: string} & {centerStr: string} & {formString: string})[],
  error: boolean
}
/**
 * Should be used on the **design-system/google-maps** page
 * This API route is used to show the user an example of what the form output looks like for circle
 * inputs
 */
function handleCircleExample(req: Request,res: Response) {
  const view = 'partials/circleInputExampleResponse';
  const renderObj: RenderCircleInputExampleObject = {
    layout: false, 
    circleInputs: [],
    error: false
  };
  try {
    const circleInputs = getCircleInputs(req.body);
    Object.keys(circleInputs)
    .forEach((key) => {
      const name = String(key);
      const inputString = JSON.stringify(circleInputs[key]);
      const obj = circleInputs[key];
      var centerStr = '';
      if (obj.c.lat < 0) centerStr+=`${Math.abs(obj.c.lat)}°S`; 
      else centerStr+=`${Math.abs(obj.c.lat)}°N`; 
      if (obj.c.lng < 0) centerStr+=`, ${Math.abs(obj.c.lng)}°W`; 
      else  centerStr+=`, ${Math.abs(obj.c.lng)}°E`; 
      renderObj.circleInputs.push({name, formString: inputString, centerStr, ...obj});
    })
    return res.status(200).render(view,renderObj);
  } catch (error) {
    renderObj.error = true;
    return res.status(200).render(view,renderObj);
  } 
}
type RenderPolygonExampleObject = {
  layout: false,
  inputNames: string[],
  inputStrings: string[],
  polygonInputs: PolygonInput[],
  jsonStrings: string[],
  error: boolean
}
/**
 * Should be used on the **design-system/google-maps** page
 * This API route is used to show the user an example of what the form output looks like for polygon
 * inputs
 */
function handlePolygonExample(req: Request, res: Response) {
  const view =  'partials/polygonInputExampleResponse';
  const renderObj: RenderPolygonExampleObject = {
    layout: false,
    inputNames: [],
    inputStrings: [],
    polygonInputs: [],
    jsonStrings: [] ,
    error: false
  }
  try {
    const polygonInputs = getPolygonInputs(req.body);
    Object.keys(polygonInputs).forEach((name) => {
      renderObj.inputNames.push(name);
      renderObj.inputStrings.push(JSON.stringify(req.body[name]))
      renderObj.polygonInputs.push(polygonInputs[name]);
      const highlight = hljs.highlight(JSON.stringify(polygonInputs[name],null,' '),{language: 'json'});
      renderObj.jsonStrings.push(highlight.value);
    })
    return res.status(200).render(view,renderObj);
  } catch (error) {
    console.error(error);
    renderObj.error = true;
    return res.status(200).render(view,renderObj);
  } 
} 

function validateGeojson() {

}

function createGeojson() {

}
/**
 * This route should be called about every 250 milliseconds. We want to display the cookie banner
 * only after we know whether we have information on the user from their ip address. If we know whether or not we have 
 * information on the user - i.e. whether req.session.create_ip_address_row equals true or false, 
 * then we can respond withe cookie banner and swap the outer HTML. Else, we should respond with the same element 
 * that will call this route again in 250 ms.
 */
function handleCookieBanner(req:Request,res:Response) {
  const cookieBannerView = 'partials/cookieBanner';
  const showCookieBanner = Boolean(req?.session?.create_ip_address_row!==undefined);
  const renderObject = {
    layout: false,
    showCookieBanner,
    showedBanner: Boolean(req?.session?.cookiePreferences?.showedBanner===true)
  }
  return res.status(200).render(cookieBannerView,renderObject);
}

export {
  handleCircleExample,
  handlePolygonExample,
  getCircleInputs,
  getPolygonInputs,
  validLatLng,
  handleCookieBanner
};