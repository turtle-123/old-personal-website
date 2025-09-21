import { Request, Response } from 'express';
import * as TIME from '../../utils/time';
import getDatabase, { getCivgaugeDatabase } from '../../database';
import env from '../../utils/env';
import axios from 'axios';
import CensusToCommunityLocationType from '../../CONSTANTS/CensusToCommunityLocationType';
import { Spread } from '../../types';
import { getErrorAlert } from '../html';
import escapeHTML from 'escape-html';
import * as NUMBER from '../../utils/number';

const CENSUS_API_KEY = env.CENSUS;
if (!!!CENSUS_API_KEY) throw new Error('Unable to get CENSUS_API_KEY from env file.');

export type LocationTypes ="Alaska Native Regional Corporation"|
"American Indian Alska Native Native Hawaiian Areas"|
"American Indian Tribal Subdivision"|
"Block"|
"Block Group"|
"Census Tract"|
"Congressional District"|
"Consolidated City"|
"County"|
"County Subdivision"|
"Division"|
"Elementary School District"|
"Place"|
"Portion of County Within Congressional District"|
"Region"|
"School District Administrative Area"|
"Secondary School District"|
"State"|
"State Legislative Lower District"|
"State Legislative Upper District"|
"Subminor Civil Division US Virgin Islands"|
"Tribal Block Group"|
"Tribal Census Tract"|
"Unified School District"|
"Zip Code Tabulation Area"|
"Urban Area"|
"Estate"|
"Subarrio";

const CensusLocationTypesDescriptions = {
  "Alaska Native Regional Corporation": "An administrative region or corporation representing and managing the interests of Alaska Native peoples within specific geographic areas.",
  "American Indian Alaska Native Native Hawaiian Areas": "Designated areas for indigenous peoples of the United States, including American Indians, Alaska Natives, and Native Hawaiians, often with distinct governance or cultural significance.",
  "American Indian Tribal Subdivision": "Administrative subdivisions within American Indian tribal lands, with their own governance structures or functions.",
  "Block": "A small area used for statistical or administrative purposes, typically smaller than a census tract but larger than a block group.",
  "Block Group": "A cluster of census blocks within a census tract, used for analyzing population characteristics at a finer level than the tract level.",
  "Census Tract": "A small, relatively permanent statistical subdivision of a county or equivalent entity used for analyzing population characteristics.",
  "Congressional District": "A geographic region represented by a member of the United States House of Representatives.",
  "Consolidated City": "A city that has merged with one or more neighboring municipalities into a single political entity.",
  "County": "A primary administrative division of most U.S. states, typically consisting of multiple municipalities and/or unincorporated areas.",
  "County Subdivision": "Administrative subdivisions of counties, such as townships or boroughs, used for various governmental purposes.",
  "Division": "A term referring to various administrative divisions or geographic subdivisions.",
  "Elementary School District": "A school district responsible for providing primary education to students typically from kindergarten through grade 5 or 6.",
  "Place": "A general term for a geographic location, which could refer to various types of settlements ranging from towns to unincorporated communities.",
  "Portion of County Within Congressional District": "Specific areas of a county that fall within particular congressional districts for the purposes of representation.",
  "Region": "A general term for a geographical area defined by certain characteristics or boundaries.",
  "School District Administrative Area": "An administrative division responsible for operating public schools within a defined geographic area.",
  "Secondary School District": "A school district responsible for providing secondary education, typically covering grades 6 or 7 through 12.",
  "State": "A primary political division of the United States, typically possessing its own government and certain powers not delegated to the federal government.",
  "State Legislative Lower District": "Geographic area represented by a member of a state's lower legislative chamber (e.g., state assembly or house of delegates).",
  "State Legislative Upper District": "Geographic area represented by a member of a state's upper legislative chamber (e.g., state senate or senate).",
  "Subminor Civil Division US Virgin Islands": "Administrative subdivisions within the United States Virgin Islands, which may correspond to smaller political or geographic units.",
  "Tribal Block Group": "Similar to a regular block group but located within American Indian tribal lands.",
  "Tribal Census Tract": "Similar to a regular census tract but located within American Indian tribal lands.",
  "Unified School District": "A school district responsible for providing education across all grade levels within a defined geographic area.",
  "Zip Code Tabulation Area": "A geographic area defined by the United States Census Bureau for tabulating summary statistics from census data aggregated by zip code.",
  "Urban Area": "A densely populated area comprising residential, commercial, and other urban land uses.",
  "Estate": "A term that could refer to various types of landholdings or administrative divisions, depending on the context.",
  "Subarrio": "A term that may refer to a smaller subdivision within a larger urban area, particularly in a Spanish-speaking context."
};

const CREATE_CENSUS_COMMUNITY_TABLE = /*sql*/`CREATE TABLE census_cache_key_community_id (
	cache_key TEXT NOT NULL,
	id integer NOT NULL
);
CREATE index census_cache_key ON 
census_cache_key_community_id USING HASH (cache_key);`;

/*
Reference: 
    https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.pdf
    A geocoding API request must be of the form:
    https://geocoding.geo.census.gov/geocoder/returntype/searchtype?parameters
*/
const getCensusStr = ({lat,lng}:{lat: number, lng: number}) => `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=4&vintage=4&format=json&layers=all`;


const GET_COMMUNITY_QUERY = /*sql*/`SELECT community.id as id, 
community.display_name as community_name, 
community.community_picture as community_picture,
community_location_filter.area as area,
json_build_object('north',ST_YMax(bounds),'south',ST_YMin(bounds),'east',ST_XMax(bounds),'west',ST_XMin(bounds)) as bounds,
json_build_object('lat',center[1],'lng',center[0]) as center,
community_location_filter.geojson_url as geojson_url,
community_location_filter.properties as properties
FROM community JOIN community_location_filter ON community.id=community_location_filter.community_id WHERE community.id=$1::integer;`;
type CensusCommunityProperties = {
  "lsy": string,
  "area": number,
  "lsad": string,
  "name": string,
  "aland": string,
  "geoid": string,
  "mtfcc": string,
  "anrcfp": string,
  "anrcns": string,
  "awater": string,
  "bounds": {
    "east": number,
    "west": number,
    "north": number,
    "south": number,
  },
  "center": {
    "lat": number,
    "lng": number,
  },
  "sldlst": string,
  "sldust": string,
  "stusps": string,
  "cd118fp": string,
  "cdsessn": string,
  "elsdlea": string,
  "higrade": string,
  "lograde": string,
  "partflg": string,
  "placefp": string,
  "placens": string,
  "scsdlea": string,
  "statefp": string,
  "statens": string,
  "tractce": string,
  "trsubce": string,
  "trsubns": string,
  "unsdlea": string,
  "affgeoid": string,
  "aiannhce": string,
  "aiannhns": string,
  "blkgrpce": string,
  "conctyfp": string,
  "conctyns": string,
  "countyfp": string,
  "countyns": string,
  "cousubfp": string,
  "cousubns": string,
  "estatefp": string,
  "estatens": string,
  "namelsad": string,
  "regionce": string,
  "sdadmlea": string,
  "submcdfp": string,
  "submcdns": string,
  "tblkgpce": string,
  "ttractce": string,
  "divisionce": string,
  "namelsadco": string,
  "state_name": string,
  "location_type": string
}
type GetCommunityResponse = {
  id: number,
  community_name: string,
  community_picture: string,
  area: number,
  bounds: {
    north: number,
    south: number,
    east: number,
    west: number
  },
  center: { lat: number, lng: number },
  geojson_url: string,
  properties: CensusCommunityProperties
};
export type CacheCommunity = Spread<GetCommunityResponse,{pictureAlbum: string[]}>;

/**
 * Try to get information about the community from cache, then get it from the database and set it in the shared cache
 * @param req 
 * @param id 
 */
export async function getCommunity(req:Request,id:number):Promise<CacheCommunity|undefined> {
   try {
    const communityJSON = await req.cache.get(`census-community-${id}`);
    if (communityJSON) {
      const ret = JSON.parse(communityJSON);
      return ret as CacheCommunity;
    }
    const civgaugeDB = getCivgaugeDatabase();
    const [communityDBRes,pictureAlbumDbRes] = await Promise.all([
      civgaugeDB.query(GET_COMMUNITY_QUERY,[id]),
      civgaugeDB.query(`SELECT s3_key FROM community_picture_album WHERE community_id=$1::integer;`,[id])
    ]);
    const community = communityDBRes.rows[0] as GetCommunityResponse;
    const pictureAlbum = pictureAlbumDbRes.rows.map((obj) => obj.s3_key) as string[];
    const cacheCommunity:CacheCommunity = {...community, pictureAlbum };
    await req.cache.set(`census-community-${id}`,JSON.stringify(cacheCommunity));
    return cacheCommunity;
   } catch (error) {
    console.error(error);
    return undefined;
   }
}

/**
 * Post the geolocation position to the database
 * @param position 
 * @param req 
 */
export async function postGeolocationPositionHelper(position:GeolocationPosition,req:Request) {
  const withoutUserIDQuery = /*sql*/`INSERT INTO geolocation_position (
    ip_id,
    accuracy,
    altitude,
    altitude_accuracy,
    heading,
    latitude,
    longitude,
    speed,
    date_created
  ) VALUES (
    $1::integer,
    $2::real,
    $3,
    $4,
    $5,
    $6::real,
    $7::real,
    $8,
    $9::bigint
  );`;
  const withUserIDQuery = /*sql*/`INSERT INTO geolocation_position (
    ip_id,
    accuracy,
    altitude,
    altitude_accuracy,
    heading,
    latitude,
    longitude,
    speed,
    date_created,
    user_id
  ) VALUES (
    $1::integer,
    $2::real,
    $3,
    $4,
    $5,
    $6::real,
    $7::real,
    $8,
    $9::bigint,
    $10::integer
  );`;
  try {
    const date_created = TIME.getUnixTime();
    const { coords } = position;
    const user_id = req.session.auth?.userID;
    const ip_id = req.session.ip_id;
    const {
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      latitude,
      longitude,
      speed
    } = coords;
    const db = getDatabase();
    const arr = [
      ip_id,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      latitude,
      longitude,
      speed,
      date_created
    ];
    if (user_id) {
      arr.push(user_id);
      return db.query(withUserIDQuery,arr)
    }
    else return db.query(withoutUserIDQuery,arr);
  } catch (error) {
    console.error(error);
    throw new Error('Unable to post geolocation position to database.');
  }
}

/**
 * Function to get key for use in general redis store. We use a key of this type to check whether a community exists based on results from
 * the census geocoding API
 * @param location_type Location Type of Object from census_location table in geography database
 * @param geoid Geographic identifier
 * @returns string - key to use for object in general redis store
 */
const getCensusRedisKey = (location_type: LocationTypes,geoid: string) => `${location_type}:${geoid}`;


/**
 * Get which communities exist based on location_type and geoid
 * @param req Request Object
 * @param communities {location_type: LocationTypes, geoid: string}[]
 * @returns array of numbers that are community ids or throw Error
 */
async function getCensusCommunitiesFromCache(req: Request, communities: {location_type: LocationTypes, geoid: string}[]):Promise<number[]> {
  try {
      const keys = communities.map((obj) => getCensusRedisKey(obj.location_type,obj.geoid));
      var ret:number[] = [];
      if (keys.length) {
        const promiseArr:Promise<any>[] = [];
        const db = getDatabase();
        keys.forEach((key) => {
          promiseArr.push(db.query(`SELECT id FROM census_cache_key_community_id WHERE cache_key=$1::TEXT LIMIT 1;`,[key]));
        })
        const dbRes = await Promise.all(promiseArr);
        const rows = dbRes.map((obj) => obj.rows?.[0]) as ({id: (number|string)}|undefined)[];
        ret = rows.filter((obj) => obj!==undefined).map((obj) => parseInt((obj as any).id as any)).filter((obj) => typeof obj === "number") as number[];
        if (!!!ret.length) throw new Error(`Unable to get ids from cache or database. Communities: ${keys}`)
      }
      return ret;
    } catch (error) {
      console.error(error);
      throw new Error('Unable to see if census communities exist.');
  }
}


async function getCensusCommunitiesHelper(req:Request,{ lat, lng}:{lat:number,lng:number}) {
  try {
    if (!!!req.session.census_communities) {
      const censusStr = getCensusStr({  lat, lng });
      const res = await axios.get(censusStr,{ timeout: 10000 });
      const result = res?.data?.result?.geographies;
      if (!!!result) throw new Error('Axios request for getting census communities returned nothing.');
      var objectsToCheck:{geoid: string, location_type: LocationTypes}[] = [];
      Object.keys(result as {[index: string]: {GEOID: string, [index: string]: any}[]})
      .forEach((key) => {
        if (CensusToCommunityLocationType[key as keyof typeof CensusToCommunityLocationType]) {
          for (let obj of result[key]) {
            const location_type=CensusToCommunityLocationType[key as keyof typeof CensusToCommunityLocationType];
            objectsToCheck.push({geoid: obj.GEOID as string, location_type: location_type as any});
          }
        }
      })
      if (Object.keys(objectsToCheck).length===0) throw new Error('There are no objects to check census positions for. fn: getCensusCommunitiesHelper');
      const ids = await getCensusCommunitiesFromCache(req,objectsToCheck);
      req.session.census_communities = ids;
    }
    const censusCommunities = await Promise.all(req.session.census_communities.map((communityID) => getCommunity(req,communityID)));
    return censusCommunities.filter((comm) => comm!==undefined) as CacheCommunity[];
  } catch (error) {
    console.error(error);
    throw new Error('Unable to get Census Communities.');
  }
}

/**
 * Separate function to make code more readable
 * @param properties 
 */
function renderCommunityProperties(properties:CensusCommunityProperties,communityName:string) {
  var str = /*html*/`<div class="table-wrapper mt-3">
<table cellspacing="0"><caption>${escapeHTML(communityName)} Information</caption><thead><tr><th scope="col">Property:</th><th scope="col">Value:</th></tr></thead><tbody>`;
  if (properties["lsy"]&&String(properties["lsy"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Legislative Session Year:</th><td>${properties['lsy']}</td></tr>`;
  }
  if (properties["area"]&&String(properties["area"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Area (m<sup>2</sup>):</th><td>${properties["area"]}</td></tr>`;
  }
  if (properties["lsad"]&&String(properties["lsad"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Legal/Statistical Area Description Code:</th><td>${properties["lsad"]}</td></tr>`;
  }
  if (properties["name"]&&String(properties["name"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Name: </th><td>${properties['name']}</td></tr>`;
  }
  if (properties["aland"]&&String(properties["aland"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Area Land (m<sup>2</sup>): </th><td>${properties['aland']}</td></tr>`;
  }
  if (properties["geoid"]&&String(properties["geoid"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Geographic Identifier:</th><td>${properties['geoid']}</td></tr>`;
  }
  if (properties["mtfcc"]&&String(properties["mtfcc"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">MAF/TIGER Feature Class Code:</th><td>${properties['mtfcc']}</td></tr>`;
  }
  if (properties["anrcfp"]&&String(properties["anrcfp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current Alaska Native Regional Corporation FIPS Code: </th><td>${properties['anrcfp']}</td></tr>`;
  }
  if (properties["anrcns"]&&String(properties["anrcns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">ANSI feature code for Alaska Native Regional
    Corporation: </th><td>${properties["anrcns"]}</td></tr>`;
  }
  if (properties["awater"]&&String(properties["awater"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Area Water (m<sup>2</sup>): </th><td>${properties['awater']}</td></tr>`;
  }
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Bounds North (deg):</th><td>${properties["bounds"].north}</td></tr>`;
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Bounds South (deg):</th><td>${properties["bounds"].south}</td></tr>`;
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Bounds East (deg):</th><td>${properties["bounds"].east}</td></tr>`;
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Bounds West (deg):</th><td>${properties["bounds"].west}</td></tr>`;
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Center Latitude (deg):</th><td>${properties["center"].lat}</td></tr>`;
  str+=/*html*/`<tr><th scope="row" style="width: 50%;">Center Longitude (deg):</th><td>${properties["center"].lng}</td></tr>`;
  if (properties["sldlst"]&&String(properties["sldlst"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current state legislative district lower chamber code: </th><td>${properties["sldlst"]}</td></tr>`;
  }
  if (properties["sldust"]&&String(properties["sldust"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current state legislative district upper chamber code:    </th><td>${properties["sldust"]}</td></tr>`;
  }
  if (properties["stusps"]&&String(properties["stusps"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current United States Postal Service state abbreviation: </th><td>${properties["stusps"]}</td></tr>`;
  }
  if (properties["cd118fp"]&&String(properties["cd118fp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">118th congressional district FIPS code: </th><td>${properties["cd118fp"]}</td></tr>`;
  }
  if (properties["cdsessn"]&&String(properties["cdsessn"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Congressional session code:    </th><td>${properties["cdsessn"]}</td></tr>`;
  }
  if (properties["elsdlea"]&&String(properties["elsdlea"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current elementary school district local education agency code: </th><td>${properties["elsdlea"]}</td></tr>`;
  }
  if (properties["higrade"]&&String(properties["higrade"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current highest grade covered by school district: </th><td>${properties["higrade"]}</td></tr>`;
  }
  if (properties["lograde"]&&String(properties["lograde"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Part Flag identifying if all or part of the entity is within the file:</th><td>${properties["lograde"]}</td></tr>`;
  }
  if (properties["partflg"]&&String(properties["partflg"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;"> </th><td>${properties["partflg"]}</td></tr>`;
  }
  if (properties["placefp"]&&String(properties["placefp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current place FIPS code:</th><td>${properties["placefp"]}</td></tr>`;
  }
  if (properties["placens"]&&String(properties["placens"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current place GNIS code:</th><td>${properties["placens"]}</td></tr>`;
  }
  if (properties["scsdlea"]&&String(properties["scsdlea"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current secondary school district local education agency code:</th><td>${properties["scsdlea"]}</td></tr>`;
  }
  if (properties["statefp"]&&String(properties["statefp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current state FIPS code:</th><td>${properties["statefp"]}</td></tr>`;
  }
  if (properties["statens"]&&String(properties["statens"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current state GNIS code: </th><td>${properties["statens"]}</td></tr>`;
  }
  if (properties["tractce"]&&String(properties["tractce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current tribal census tract code:</th><td>${properties["tractce"]}</td></tr>`;
  }
  if (properties["trsubce"]&&String(properties["trsubce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;"> Current American Indian tribal subdivision census code:    </th><td>${properties["trsubce"]}</td></tr>`;
  }
  if (properties["trsubns"]&&String(properties["trsubns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current American Indian tribal subdivision GNIS code: </th><td>${properties["trsubns"]}</td></tr>`;
  }
  if (properties["unsdlea"]&&String(properties["unsdlea"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current unified school district local education agency code:     </th><td>${properties["unsdlea"]}</td></tr>`;
  }
  if (properties["affgeoid"]&&String(properties["affgeoid"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">AFFGEOID: </th><td>${properties["affgeoid"]}</td></tr>`;
  }
  if (properties["aiannhce"]&&String(properties["aiannhce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">American Indian/Alaska Native/Native Hawaiian area GNIS code:</th><td>${properties["aiannhce"]}</td></tr>`;
  }
  if (properties["aiannhns"]&&String(properties["aiannhns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current American Indian/Alaska Native/Native Hawaiian area GNIS code:</th><td>${properties["aiannhns"]}</td></tr>`;
  }
  if (properties["blkgrpce"]&&String(properties["blkgrpce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current block group number: </th><td>${properties["blkgrpce"]}</td></tr>`;
  }
  if (properties["conctyfp"]&&String(properties["conctyfp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Consolidated city FIPS code:    </th><td>${properties["conctyfp"]}</td></tr>`;
  }
  if (properties["conctyns"]&&String(properties["conctyns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Consolidated city GNIS code:    </th><td>${properties["conctyns"]}</td></tr>`;
  }
  if (properties["countyfp"]&&String(properties["countyfp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Census county FIPS code: </th><td>${properties["countyfp"]}</td></tr>`;
  }
  if (properties["countyns"]&&String(properties["countyns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current county GNIS code: </th><td>${properties["countyns"]}</td></tr>`;
  }
  if (properties["cousubfp"]&&String(properties["cousubfp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current county subdivision FIPS code: </th><td>${properties["cousubfp"]}</td></tr>`;
  }
  if (properties["cousubns"]&&String(properties["cousubns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current county subdivision GNIS code: </th><td>${properties["cousubns"]}</td></tr>`;
  }
  if (properties["estatefp"]&&String(properties["estatefp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current estate FIPS code: </th><td>${properties["estatefp"]}</td></tr>`;
  }
  if (properties["estatens"]&&String(properties["estatens"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">ANSI feature code for estate: </th><td>${properties["estatens"]}</td></tr>`;
  }
  if (properties["namelsad"]&&String(properties["namelsad"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Census name and the translated legal/statistical area description for urban area: </th><td>${properties["namelsad"]}</td></tr>`;
  }
  if (properties["regionce"]&&String(properties["regionce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Census Region: </th><td>${properties["regionce"]}</td></tr>`;
  }
  if (properties["sdadmlea"]&&String(properties["sdadmlea"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current administrative school district local education agency code: </th><td>${properties["sdadmlea"]}</td></tr>`;
  }
  if (properties["submcdfp"]&&String(properties["submcdfp"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current subminor civil division FIPS code: </th><td>${properties["submcdfp"]}</td></tr>`;
  }
  if (properties["submcdns"]&&String(properties["submcdns"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">ANSI feature code for the subminor civil division: </th><td>${properties["submcdns"]}</td></tr>`;
  }
  if (properties["tblkgpce"]&&String(properties["tblkgpce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Current tribal block group letter: </th><td>${properties["tblkgpce"]}</td></tr>`;
  }
  if (properties["ttractce"]&&String(properties["ttractce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">6-character census tract code: </th><td>${properties["ttractce"]}</td></tr>`;
  }
  if (properties["divisionce"]&&String(properties["divisionce"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Census Division: </th><td>${properties["divisionce"]}</td></tr>`;
  }
  if (properties["namelsadco"]&&String(properties["namelsadco"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">County name: </th><td>${properties["namelsadco"]}</td></tr>`;
  }
  if (properties["state_name"]&&String(properties["state_name"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">State Name:</th><td>${properties["state_name"]}</td></tr>`;
  }
  if (properties["location_type"]&&String(properties["location_type"]).length){
    str+=/*html*/`<tr><th scope="row" style="width: 50%;">Location Type:</th><td>${properties["location_type"]}</td></tr>`;
  }
  str+=/*html*/`</tbody>`;
  if (CensusLocationTypesDescriptions[properties['location_type'] as keyof typeof CensusLocationTypesDescriptions]) {
    str+=/*html*/`<tfoot>
    <td colspan="2">
    <span class="bold">AI Generated Description of ${properties['location_type']}:</span> ${CensusLocationTypesDescriptions[properties['location_type'] as keyof typeof CensusLocationTypesDescriptions]}
    </td>
  </tfoot>`;
  }
  
  str+=/*html*/`</table></div>`;
  return str;
}


/**
 * Render the HTML for a census community
 */
export async function renderCensusCommunityHTML(req:Request,censusCommunities?:CacheCommunity[]) {
  var censusCommunitiesToUse:CacheCommunity[] = censusCommunities ? censusCommunities : [];
  try {
    if (censusCommunities&&!!!censusCommunities.length) {
      return getErrorAlert('There are no census communities near you.','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Map"><path d="m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>');
    }
    if (!!!censusCommunities) {
     const ids = req.session.census_communities;
     if (!!!ids) return getErrorAlert('Something went wrong getting census communities near you.');
    if (!!!ids.length) return getErrorAlert('There are no census communities near you.','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Map"><path d="m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>');
      const censusCommunities = await Promise.all(ids.map((id) => getCommunity(req,id)));
      censusCommunitiesToUse = censusCommunities.filter((obj) => obj!==undefined) as CacheCommunity[];
    }
    censusCommunitiesToUse = censusCommunitiesToUse.sort((a,b) => (Number(a.properties.area) || 0)-(Number(b.properties.area) || 0));
    var str = /*html*/`
<section id="census-communities-near-you" class="mt-2">
  <h2 class="bold bb-thick h2">
    <a href="#scroll-to-specific-community" class="same-page fw-regular">Census Communities Near You</a>
  </h2>
  <div id="google_map_census_communities_near_you" style="height: 250px; width: 95%; margin: 0.5rem auto;"></div>
  <div class="mobile-stepper mt-3">
      <button disabled="" tabindex="-1" class="icon medium mr-1" aria-label="Previous Tab" data-step-back="" type="button">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowLeft"><path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"></path></svg>
      </button>
      <ul class="mobile-stepper" role="tablist">`;

      for (let i=0; i<censusCommunitiesToUse.length; i++) {
str+=/*html*/`<li role="presentation">
  <button 
  id="tab-${i}" 
  aria-label="${censusCommunitiesToUse[i].community_name}" 
  class="icon filled tiny ${Boolean(i===0)?'secondary':'t-secondary'}" 
  role="tab" 
  type="button" 
  aria-selected="${Boolean(i===0)?'true':'false'}" 
  data-tab="${i}">
  </button>
</li>`;
      }
      str+=/*html*/`</ul><button tabindex="-1" class="icon medium ml-1" aria-label="Next Tab" data-step-forward="" type="button">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowRightSharp"><path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"></path></svg>
      </button>
    </div>
    <div class="tab-panels">
    `;
    for (let i=0; i<censusCommunitiesToUse.length; i++) {
      const center = `{"lat":${Number(censusCommunitiesToUse[i].center.lat.toFixed(4))},"lng":${Number(censusCommunitiesToUse[i].center.lng.toFixed(4))}}`;
      const bounds = `{"north":${Number(censusCommunitiesToUse[i].bounds.north.toFixed(4))},"south":${Number(censusCommunitiesToUse[i].bounds.south.toFixed(4))},"east":${Number(censusCommunitiesToUse[i].bounds.east.toFixed(4))},"west":${Number(censusCommunitiesToUse[i].bounds.west.toFixed(4))}}`;

      str+=/*html*/`<div aria-labelledby="tab-${i}" role="tabpanel" ${Boolean(i!==0)?'hidden':''}>
  <div class="flex-row align-center gap-2 justify-start w-100 p-sm bb">
    <img 
    src="${censusCommunitiesToUse[i].community_picture}" 
    alt="${escapeHTML(censusCommunitiesToUse[i].community_name)}" 
    height="50"
    width="50"
    style="border-radius:50%; width: 50px; height: 50px; flex-shrink: 0;"
    />
    <p class="h5 bold flex-row grow-1">${escapeHTML(censusCommunitiesToUse[i].community_name)}</p>
  </div>
  <span
  data-bounds='${bounds}'    
  data-geojson="${censusCommunitiesToUse[i].geojson_url}"
  data-center='${center}'
  data-show-geography="${Boolean(i===0)?'true':'false'}"
  data-type="geojson"
  hidden
  ></span>
  <span
  data-center='${center}'
  data-show-geography="${Boolean(i===0)?'true':'false'}"
  data-label="Center of ${escapeHTML(censusCommunitiesToUse[i].community_name)}"
  data-type="marker"
  hidden
  ></span>
  ${renderCommunityProperties(censusCommunitiesToUse[i].properties,censusCommunitiesToUse[i].community_name)}
</div>`;
    } 
    str+=/*html*/`</div>
</section>`;
    return str;
  } catch (error) {
    console.error(error);
    return getErrorAlert('Something went wrong getting census communities.');
  }
}


export async function getCensusCommunities(req:Request,res:Response) {
  try {
    const { coords, timestamp } = req.body as GeolocationPosition;
    const { latitude, longitude } = coords;
    if (!!!latitude||!!!longitude) throw new Error('Unable to get Latitude and Longitude from geolocation position.');
    req.session.user_location = {coords,timestamp} as any;
    const [_,censusCommunities] = await Promise.all([
      postGeolocationPositionHelper({coords,timestamp} as any,req),
      getCensusCommunitiesHelper(req,{lat:latitude,lng:longitude})
    ]);
    const html = await renderCensusCommunityHTML(req,censusCommunities);
    return res.status(200).send(html);
  } catch (error) {
    console.error(error);
    return res.status(400).send('Something went wrong getting the census communities.');
  }
}

export async function searchCensusCommunity(req:Request,res:Response) {
  try {
    const searchQueryStr = /*sql*/`SELECT *, 
    ts_rank(search, websearch_to_tsquery('simple',$1)) rank,
    similarity(community_name,$1) text_similarity 
    FROM search_census_communities 
    WHERE search @@ websearch_to_tsquery('simple',$1) 
    ORDER BY 
    text_similarity DESC,
    rank DESC LIMIT 100;`;
    const search = req.body['search-census-communities-input'];
    if (search&&typeof search==='string'){
      const dbRes = await getDatabase().query(searchQueryStr,[search]);
      if (!!!dbRes.rows.length) return res.status(200).send(/*html*/`<p class="t-warning h5 bold text-align-center">There were no census communities that matched your search. Try reconfiguring request.</p>`);
      else {
        var str = /*html*/`<div>`;
        for (let result of dbRes.rows) {
          str+=/*html*/`
          <button 
          hx-target="#get-specific-community" 
          class="response-button mt-2" 
          hx-trigger="click" 
          hx-get="/projects/census-info-near-you/community/${result.community_id}" 
          hx-indicator="#get-specific-census-community-loader" 
          hx-swap="innerHTML"
          data-scroll          
          data-to="#get-specific-census-community-loader"
          style="width: 100%;"
          >
            <img src="${result.cache_community.community_picture}" alt="${escapeHTML(result.community_name)}" width="50" height="50" style="height:50px;width:50px;border-radius: 50%;flex-shrink:0;" />
            <div class="h5 fw-regular grow-1" style="color: var(--text-primary); ">
              ${escapeHTML(result.community_name)}
            </div>
        </button>
          `;
        }
        str+='</div>';
        res.status(200).send(str);
      }
    } else {
      return res.status(200).send(getErrorAlert('Please enter a search input.'));
    }
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Unable to search for census communities. Try reloading the page.'));
  }
}





export async function getSpecificCensusCommunity(req:Request,res:Response) {
  try {
    const { id:idStr } = req.params;
    const id = parseInt(idStr);
    if (!!!NUMBER.isValidInteger(id)) throw new Error('Census Community ID must be a whole nnumber.');
    const query = /*sql*/`SELECT * FROM search_census_communities WHERE community_id=$1;`;
    const db = getDatabase();
    const resp = await db.query(query,[id]);
    if (!!!resp.rows[0]) throw new Error('Could not find census community in database.');
    const cache_community:CacheCommunity = resp.rows[0].cache_community;

    const center = `{"lat":${Number(cache_community.center.lat.toFixed(4))},"lng":${Number(cache_community.center.lng.toFixed(4))}}`;
      const bounds = `{"north":${Number(cache_community.bounds.north.toFixed(4))},"south":${Number(cache_community.bounds.south.toFixed(4))},"east":${Number(cache_community.bounds.east.toFixed(4))},"west":${Number(cache_community.bounds.west.toFixed(4))}}`;

    var str = /*html*/`<section id="specific-community-${cache_community.id}" class="mt-4">
       <h2 class="bold bb-thick h2">
          <a href="#specific-community-${cache_community.id}" class="same-page fw-regular">${escapeHTML(cache_community.community_name)}</a>
        </h2>
      <div id="google_map_census_community_${cache_community.id}" style="height: 250px; width: 95%; margin: 0.5rem auto;"></div>
      <span
      data-bounds='${bounds}'    
      data-geojson="${cache_community.geojson_url}"
      data-center='${center}'
      data-show-geography="true"
      data-type="geojson"
      hidden
      ></span>
      <span
      data-center='${center}'
      data-show-geography="true"
      data-label="Center of ${escapeHTML(cache_community.community_name)}"
      data-type="marker"
      hidden
      ></span>
      <div class="mt-2">
        ${renderCommunityProperties(cache_community.properties,cache_community.community_name)}
      </div>
    </section>`;
    return res.status(200).send(str);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong getting the census community.'));
  }
}



/* ------------------------------------ ARCHIVE ---------------------------------- */

const GET_COMMUNITY_QUERY_2 = /*sql*/`SELECT community.id as id, 
community.display_name as community_name, 
community.community_picture as community_picture,
community_location_filter.area as area,
json_build_object('north',ST_YMax(bounds),'south',ST_YMin(bounds),'east',ST_XMax(bounds),'west',ST_XMin(bounds)) as bounds,
json_build_object('lat',center[1],'lng',center[0]) as center,
community_location_filter.geojson_url as geojson_url,
community_location_filter.properties as properties
FROM community JOIN community_location_filter ON community.id=community_location_filter.community_id WHERE community.id=$1::integer;`;
const GET_IMAGES_QUERY_2 = /*sql*/`SELECT s3_key, community_id FROM community_picture_album WHERE community_id=$1::integer;`;
const INSERT_INTO_CENSUS_COMMUNITY_SERCH = /*sql*/`INSERT INTO search_census_communities (community_name,community_id,cache_community) VALUES ($1,$2,$3);`;
const UPDATE_QUERY = /*sql*/`UPDATE search_census_communities SET 
cache_community= (cache_community - 'pictureAlbum') || $1::jsonb WHERE community_id=$2;`;

export async function createCensusCommunitySearch() {
  try {
    const minCommunityQuery = /*sql*/`SELECT MIN(id) as min FROM community WHERE census_community=true;`;
    const maxCommunityQuery = /*sql*/`SELECT MAX(id) as max FROM community WHERE census_community=true;`;
    const civgaugeDb = getCivgaugeDatabase();
    const minDBRes = await civgaugeDb.query(minCommunityQuery,[]);
    const maxDBRes = await civgaugeDb.query(maxCommunityQuery,[]);
    const min = minDBRes.rows[0].min;
    const max = maxDBRes.rows[0].max;
    var limit = 2000;
    var maxID = min;
    while (maxID < max) {
      var promiseArr:Promise<any>[] = [];
      const civgDB = getCivgaugeDatabase();
      for (let i = maxID; i < maxID+limit; i++) {
        // promiseArr.push(Promise.all([
        //   civgDB.query(GET_COMMUNITY_QUERY_2,[i]),
        //   civgDB.query(GET_IMAGES_QUERY_2,[i])
        // ]))
        promiseArr.push(civgDB.query(GET_IMAGES_QUERY_2,[i]));
      }
      const resArr = await Promise.all(promiseArr);
      var promiseArr2:Promise<any>[] = [];
      const db = getDatabase();
      for (let res of resArr) {  
        const community_id = res.rows?.[0]?.community_id;
        const pictureAlbum = res.rows.map((obj:any) => obj.s3_key);
        if (!!!pictureAlbum||!!!community_id) continue;
        promiseArr2.push(db.query(UPDATE_QUERY,[JSON.stringify({pictureAlbum}),community_id]));
      } 
      await Promise.all(promiseArr2);
      maxID+=limit;
    }
  } catch (error) {
    console.error(error);

  }
}


