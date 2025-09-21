/**
 * @file ## Google Maps JS File for Frank's Design System
 * - When there's a map on the page, the map and the geographies / makers that 
 * should be loaded on that map should all be 
 * contained in a common `<section>` tag
 * - In that tag, only the geographies that are in that tag and that 
 * have the data-show-geography="true" should be shown
 * - You should listen for tab changes on pages with geographies to add and remove geographies appropriately
 * - Only geographies that 
 * 
 * - For circle inputs, there should be 3 hidden "number" inputs
 * 1. One for the lat of the center
 * 2. One for the lng of the center
 * 3. One for the radius of the circle
 * 
 * Assumptions:
 * - Only one map is contained per `<section>` tag
 * - 
 * 
 * - For geojson inputs, you will have to figure a way to configure those
 * 
 * @author Frank Brown
 */

/* --------------------------------------- TYPES ------------------------------- */
/**
 * Bounds Object
 * @typedef {{north: number, south: number, east: number, west: number}} Bounds
 */
/**
 * Center Object
 * @typedef {{lat: number, lng: number}} Center
 */
/**
 * @typedef {{el: HTMLElement, map: google.Map, type: "polygon", polygons: {[key: string]: any}, max: number|undefined, drawingManager: any, inputDiv: HTMLElement, snackbarEl: HTMLElement|undefined}} DrawMapObject
 * @typedef {{el: HTMLElement, map: google.Map, type: "circle", polygons: {[key: string]: any }, max: number|undefined, drawingManager: any, inputDiv: HTMLElement, snackbarEl: HTMLElement|undefined}} CircleMapObject
 * @typedef {{el: HTMLElement, map: google.Map, bounds: Bounds, markers: any[], type: "show"}} ShowMapObject
 */

/**
 * Keep only one info window open at a time
 */
var INFO_WINDOW;

/* -------------------------------------- CONSTANTS ------------------------------ */
/**
 * Google Map Styles
 * @constant {any}
 */
export const MAP_STYLES = {
  dark: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#242f3e"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#263c3f"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#6b9a76"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#38414e"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#212a37"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9ca5b3"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#746855"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#1f2835"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#f3d19c"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#2f3948"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#d59563"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#515c6d"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#17263c"
        }
      ]
    }
  ],
  light: [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ebe3cd"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#523735"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#f5f1e6"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#c9b2a6"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#dcd2be"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#ae9e90"
        }
      ]
    },
    {
      "featureType": "landscape.natural",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dfd2ae"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dfd2ae"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#93817c"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#a5b076"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#447530"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f5f1e6"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#fdfcf8"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#f8c967"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#e9bc62"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e98d58"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "color": "#db8555"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#806b63"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dfd2ae"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8f7d77"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#ebe3cd"
        }
      ]
    },
    {
      "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#dfd2ae"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#b9d3c2"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#92998d"
        }
      ]
    }
  ]
};
/**
 * All maps should have an id that is a valid javascript object name
 * The MAPS object keeps track of objects added to maps so that these objects are not re-drawn when new content is loaded
 * @type {{[key: string]: ShowMapObject|DrawMapObject|CircleMapObject}}
 */
const MAPS = {};
/**
 * Default Center, Zoom, and Bounds for initializing a map
 * @type {{bounds: Bounds, center: Center, zoom: number}}
 */
const DEFAULT_MAPS_OBJECT = {
  center: {lat: 39.123256, lng: -98.929769},
  bounds: {north: 51.900902, south: 24.623051, east: -65.157233, west: -127.917870},
  zoom: 0
};


/* -------------------------------------------------- Utilities ---------------------------- */
/**
 * Function that tells you whether a number is a valid latitude value
 * @param {string|number} strOrNum 
 * @returns {boolean}
 */
const validLat = (strOrNum) => Boolean(Number(strOrNum)>=-90&&Number(strOrNum)<=90);
/**
 * Function that tells you whether a number is a valid longitudinal value
 * @param {string|number} strOrNum 
 * @returns {boolean}
 */
const validLng = (strOrNum) => Boolean(Number(strOrNum)>=-180&&Number(strOrNum)<=180);
/**
 * 
 * @param {any} s 
 * @returns Whether or not the input is **like** a number 
 * **(whether the typeof parseFloat(input) ==="number" && !!!isNaN(parseFloat(s)) returns true)** 
 */
const isNumLike = (s) => Boolean(typeof parseFloat(s)==="number" && !!!isNaN(parseFloat(s)))
/**
 * Function that tells you whether bounds are valid. Input should either be a stringified
 * bounds object or a bounds object
 * @param {string|Bounds} strOrObject 
 * @returns 
 */
const validBounds = (strOrObject) => {
  try{
    /**
     * @type {undefined|Bounds}
     */
    var bounds;
    if (typeof strOrObject === 'string') bounds = JSON.parse(strOrObject);
    else bounds = strOrObject;
    if (isNumLike(bounds.north)&&isNumLike(bounds.west)&&isNumLike(bounds.east)&&isNumLike(bounds.south)) {
      return Boolean(validLat(bounds.north)&&validLat(bounds.south)&&validLng(bounds.east)&&validLng(bounds.west));
    } else throw new Error('INVALID BOUNDS');
  }catch(error){
    return false;
  }
}
/**
 * Function that tells you whether center is valid. Input should either be a stringified
 * center object or a center object
 * @param {string|Bounds} strOrObject 
 * @returns 
 */
const validCenter = (strOrObject) => {
  try{
    /**
     * @type {Center|undefined}
     */
    var center;
    if (typeof strOrObject === 'string') center = JSON.parse(strOrObject);
    else center = strOrObject;
    if (isNumLike(center.lat)&&isNumLike(center.lng)) {
      return Boolean(validLat(center.lat)&&validLng(center.lng));
    } else throw new Error('INVALID CENTER');
  }catch(error){
    return false;
  }
}
/**
 * 1. Get the closest `<section>` that contains the map
 * 2. Find all geographies and markers to show in that section span[data-show-geography="true"]
 * -  `span[data-show-geography="true"][data-type="geojson"]` = geography
 * - `span[data-show-geography="true"][data-type="marker"]` = marker
 * 3. compute bounds, based on the data-bounds attributes of the geographies,
 *  and center, based on the data-center attributes of the markers and 
 * geographies, given the bounds in that section
 * Fallback to DEFAULT_BOUNDS
 * - center === the average of all centers of all the geographies
 * @param {HTMLElement} map The map that is being rendered
 * @returns {{bounds: Bounds, center: Center}}
 */
function getBoundsAndCenter(map){
  const DEFAULT_BOUNDS = {...DEFAULT_MAPS_OBJECT.bounds};
  const DEFAULT_CENTER = {...DEFAULT_MAPS_OBJECT.center};
  const section = map.closest('section');
  if (!!!section) {
    return { bounds: DEFAULT_BOUNDS, center: DEFAULT_CENTER};
  }
  const geographies = Array.from(section.querySelectorAll('span[data-show-geography="true"]'));
  if(geographies.length){
    /**
     * @type {Bounds|undefined}
     */
    var bounds = undefined;
    /**
     * @type {{lat:number,lng:number}|undefined} The center to use when initializing a google map or when changing the map
     */
    var center = undefined;
    var centerLength = 0;
    for(let i=0;i<geographies.length;i++){
      const type = geographies[i].getAttribute('data-type');
      if(type==="geojson"){
        const geogCenter = geographies[i].getAttribute('data-center');
        const geogBounds = geographies[i].getAttribute('data-bounds');
        if(validBounds(geogBounds)){
          const parsedBounds = JSON.parse(geogBounds);
          if (!!!bounds) {
            bounds = {north:Number(parsedBounds.north),south:Number(parsedBounds.south),east:Number(parsedBounds.east),west:Number(parsedBounds.west)};
          }else{
            bounds = {
              north: Math.max(bounds.north,Number(parsedBounds.north)),
              south: Math.min(bounds.south,Number(parsedBounds.south)),
              east: Math.max(bounds.east,Number(parsedBounds.east)),
              west: Math.min(bounds.west,Number(parsedBounds.west))
            }
          }
        }
        if(validCenter(geogCenter)){
          const parsedCenter = JSON.parse(geogCenter);
          if (!!!center) {
            center = {lat:Number(parsedCenter.lat),lng:Number(parsedCenter.lng)};
          }else{
            center = {lat:center.lat+Number(parsedCenter.lat),lng:center.lng+Number(parsedCenter.lng)};
          }
          centerLength+=1;
        }
      }else if (type==="marker"){
        const geogCenter = geographies[i].getAttribute('data-center');
        if(validCenter(geogCenter)){
          const parsedCenter = JSON.parse(geogCenter);
          if (!!!center) {
            center = {lat:Number(parsedCenter.lat),lng:Number(parsedCenter.lng)};
          }else{
            center = {lat:center.lat+Number(parsedCenter.lat),lng:center.lng+Number(parsedCenter.lng)};
          }
          centerLength+=1;
        }
      } 
    }
    center = { lng: center.lng/centerLength, lat: center.lat/centerLength };
    if (validBounds(bounds) && validCenter(center)) return { bounds, center };
    else return { bounds: DEFAULT_BOUNDS, center: DEFAULT_CENTER };
  } else {
    return { bounds: DEFAULT_BOUNDS, center: DEFAULT_CENTER };
  }
}
/**
 * Function to get the light mode / dark mode state of the application
 * @returns {'light'|'dark'} 
 */
const getLightModeDarkMode = () => {
  const mode = document.querySelector('html')?.getAttribute('data-mode') || 'dark';
  if (mode!=='light'&&mode!=='dark') return 'dark';
  else return mode;
}

const VALID_HEX_REGEX = /^#[0-9A-F]{6}$/i;
/**
 * Get the fill color for the map
 * Can either be set by a #FILL_COLOR_MAP text input element on the page or
 * it will fall back to this default
 * @returns {string} Valid Hex Color String
 */
const getFillColor = ()=>{
  const el = document.getElementById('FILL_COLOR_MAP');
  if (el && VALID_HEX_REGEX.test(el.value)) return el.value;
  else return '#f3e5f5'
}
/**
 * Get the stroke color for the map
 * Can either be set by a #STROKE_COLOR_MAP text input element on the page or
 * it will fall back to this default
 * @returns {string} Valid Hex Color String
 */
const getStrokeColor = () => {
  const el = document.getElementById('STROKE_COLOR_MAP');
  if (el && VALID_HEX_REGEX.test(el.value)) return el.value;
  else return '#ab47bc';
}
/**
 * @param {any} overlay Circle | Polygon | any Overlay 
 */
const getMapElementFromOverlay = (overlay) => {
  /**
   * @type {HTMLElement|undefined}
   */
  var el;
  const map = overlay?.getMap();
  if(map){
    const mapDiv = map?.getDiv();
    if (mapDiv) {
      el = mapDiv;
    }
  }
  return el;
} 

/* --------------------------------------------------------- End Utilities ---------------------- */

function handleDrawingDblClick(e){
  const position = e.latLng;
  const id = this.uid;
  if(!!!id)return;
  const mapElement = getMapElementFromOverlay(this);
  if(!!!mapElement) return;
  const content = `<div class="delete-geometry-popup">
  <p class="body2 fw-regular block text-align-center" style="max-width: 250px;">
    Are you sure you want to delete this geometry input?
  </p>
  <div class="flex-row align-center justify-between mt-2" style="max-width: 250px;">
    <button data-close-map-window aria-label="Close Popup" type="button" class="warning outlined small">
      CLOSE WINDOW
    </button>
    <button data-delete-geometry aria-label="Delete Geometry" type="button" class="success outlined small">
      CONFIRM
    </button>
  </div>
</div>`;
  const deleteFunction = function () {
    const mapElement = getMapElementFromOverlay(this);
    if (!!!mapElement) return;
    const mapId = mapElement.getAttribute('id');
    if (!!!mapId) return;
    const mapObject = MAPS[mapId];
    this.setMap(null);
    const input = document.getElementById(this.uid);
    if (input) input.remove();
    delete mapObject.polygons[this.uid];
  }.bind(this);
  if (INFO_WINDOW) {
    INFO_WINDOW?.close();
  }
  INFO_WINDOW = new google.maps.InfoWindow({
    content,
    position,
    maxWidth: 400
  })
  INFO_WINDOW.setMap(this?.getMap());
  setTimeout(() => {
    const closeWindow = document.querySelector('button[data-close-map-window]');
    const deleteGeometry = document.querySelector('button[data-delete-geometry]');
    if (closeWindow) {
      closeWindow.addEventListener('click',(e)=>{
        INFO_WINDOW?.close();
        closeWindow.remove();
        const deleteGeometry = document.querySelector('button[data-delete-geometry]');
        if (deleteGeometry) deleteGeometry.remove();
      })
    }
    if (deleteGeometry) {
      deleteGeometry.addEventListener('click',(e)=>{
        INFO_WINDOW.close();
        deleteGeometry.remove();
        const closeWindow = document.querySelector('button[data-close-map-window]');
        if (closeWindow) closeWindow.remove();
        deleteFunction();
      })
    }
  },200);
  
}
/**
 * Call this event listener whenever the circle radius or center changes
 * @this {google.maps.Circle}
 * @param {undefined} e 
 * @returns 
 */
function updateCircle(){
  const id = this.uid;
  if(!!!id)return;
  const circleInput=document.getElementById(id);
  if(!!!circleInput) return;
  const radius = Number(this.radius);
  const center = {lat:this?.center?.lat(),lng:this?.center?.lng()};
  circleInput.value = JSON.stringify({r:radius,c:center});
  circleInput.setAttribute('value',circleInput.value);
  circleInput.dispatchEvent(new Event('change'));
}
/**
 * Call this event listener whenever the circle radius or center changes
 * @this {google.maps.Polygon}
 * @param {undefined} e 
 * @returns 
 */
function updatePolygon(){
  const id = this.uid;
  if(!!!id)return;
  const polygonInput=document.getElementById(id);
  if(!!!polygonInput) return;
  const arr = [];
  this.forEach((latLng)=>arr.push([latLng.lng(),latLng.lat()]));
  arr.push(arr[0]);
  polygonInput.value = JSON.stringify(arr);
  polygonInput.setAttribute('value',polygonInput.value);
}
/**
 * [Reference](https://developers.google.com/maps/documentation/javascript/drawinglayer#drawing_events)
 * 
 * [Reference for Circle And Polygon Classes](https://developers.google.com/maps/documentation/javascript/reference/polygon#Circle)
 * @param {Event} e 
 */
function handleOverlayComplete(e){
  if (e.type==="circle"){
    const circle=e.overlay;
    if(!!!circle)return;
    const map = getMapElementFromOverlay(circle);
    if (!!!map) {circle.setMap(null); return};
    const key = map.getAttribute('id');
    if(!!!key||!!!MAPS[key]||MAPS[key]?.type!=="circle") {circle.setMap(null); return};
    const max = MAPS[key].max;
    const inputDiv = MAPS[key].inputDiv;
    if(!!!inputDiv) {circle.setMap(null); return};
    if (max) {
      const circleInputs = Array.from(inputDiv.children);
      if (circleInputs.length>=max) {
        const snackbarEl = MAPS[key].snackbarEl;
        if (snackbarEl) snackbarEl?.setAttribute('aria-hidden','false');
        circle.setMap(null);
        return;
      }
    }
    const center = { lat: circle?.center?.lat(), lng: circle?.center?.lng() };
    const radius = Number(circle.radius);
    if (!!!validCenter(center)||!!!radius) {circle.setMap(null); return;}
    const randomID = 'circle_'.concat(Math.random().toString().slice(3))
    const overlay = circle;
    overlay.uid =randomID;
    MAPS[key].polygons[randomID] = circle;
    const circleInput = document.createElement('input');
    circleInput.setAttribute('hidden','');
    circleInput.setAttribute('id',randomID);
    circleInput.setAttribute('name',randomID);
    circleInput.value = JSON.stringify({r:radius,c:center});
    circleInput.setAttribute('value',circleInput.value);
    MAPS[key].inputDiv?.appendChild(circleInput);
    circleInput.dispatchEvent(new Event('change'));
    google.maps.event.addListener(circle,'center_changed',updateCircle);
    google.maps.event.addListener(circle,'radius_changed',updateCircle);
    google.maps.event.addListener(circle,'dblclick',handleDrawingDblClick);
  }else if (e.type==="polygon"){
    const polygon = e.overlay;
    const map = getMapElementFromOverlay(polygon);
    if (!!!map) {polygon.setMap(null); return;}
    const key = map.getAttribute('id');
    if(!!!key||!!!MAPS[key]||MAPS[key]?.type!=="polygon") {polygon.setMap(null); return;}
    const max = MAPS[key].max;
    const inputDiv = MAPS[key].inputDiv;
    if(!!!inputDiv) {polygon.setMap(null); return;}
    if (max) {
      const polygonInputs = Array.from(inputDiv.children);
      if (polygonInputs.length>=max) {
        const snackbarEl = MAPS[key].snackbarEl;
        if (snackbarEl) snackbarEl?.setAttribute('aria-hidden','false');
        polygon.setMap(null);
        return;
      }
    }
    const path = polygon.getPath();
    if(!!!path) {polygon.setMap(null); return;}
    const arr = [];
    path.forEach((latLng)=>arr.push([latLng.lng(),latLng.lat()]));
    arr.push(arr[0]);
    if(!!!Array.isArray(arr)){polygon.setMap(null); return;}
    const randomID = 'polygon_'.concat(Math.random().toString().slice(3));
    path.uid = randomID;
    const overlay = polygon;
    overlay.uid =randomID;
    MAPS[key].polygons[randomID] = polygon;
    const polygonInput = document.createElement('input');
    polygonInput.setAttribute('hidden','');
    polygonInput.setAttribute('id',randomID);
    polygonInput.setAttribute('name',randomID);
    polygonInput.value = JSON.stringify(arr);
    polygonInput.setAttribute('value',polygonInput.value);
    MAPS[key].inputDiv?.appendChild(polygonInput);
    polygonInput.dispatchEvent(new Event('change'));
    google.maps.event.addListener(path,'insert_at',updatePolygon);
    google.maps.event.addListener(path,'set_at',updatePolygon);
    google.maps.event.addListener(polygon,'dblclick',handleDrawingDblClick);
  }
}

/**
 * Set the maps styles:
 * 1. On initial load and 
 * 2. Whenever the light mode / dark mode state of the application changes (Listen for click on LightMode/DarkMode Button)
 * @param {'light'|'dark'} mode
 */
function setMapsStyles(mode) {
  Object.values(MAPS)
  .forEach((obj) =>{
    obj.map.setOptions({styles: (mode==="light") ? MAP_STYLES.light : MAP_STYLES.dark });
    obj.map.data.setStyle({
      fillColor: getFillColor(),
      fillOpacity: 0.3,
      strokeColor: getStrokeColor(),
      strokeOpacity: 1,
      strokeWeight: 3
    });
    if (obj.drawingManager&&obj.type==="circle"||obj.type==="polygon") {
      obj.drawingManager.setOptions(getDrawingManagerOptions(obj.type))
    }
    if (obj.polygons) {
      Object.values(obj.polygons).forEach((overlay) => {
        overlay.setOptions({
          fillColor: getFillColor(),
          fillOpacity: 0.3,
          strokeColor: getStrokeColor(),
          strokeOpacity: 1,
          strokeWeight: 3
        });
      })
    }
  })
}
/**
 * @param {Event} e Click Event
 */
function handleLightModeChangeMaps(e) {
  const mode = getLightModeDarkMode();
  setMapsStyles(mode);
}
/**
 * Function to add the geographies and markers that have data-show-geography="true"
 * and that are in the same `<sections>` as the map to the map object
 * @param {ShowMapObject} mapObject 
 */
function addGeographies(mapObject) {
  const section = mapObject?.el?.closest('section');
  if (section) {
    const elementsToAdd = Array.from(section.querySelectorAll('span[data-show-geography="true"]'));
    if(Array.isArray(elementsToAdd)) {
      elementsToAdd.forEach((el)=>{
        const type = el.getAttribute('data-type');
        if (type==="geojson"){
          const geojson = el.getAttribute('data-geojson');
          if (geojson&&typeof geojson==="string") {
            mapObject.map.data.loadGeoJson(geojson);
          }
        } else if (type==="marker"){
          const strCenter = el.getAttribute('data-center');
          const label = el.getAttribute('data-label');
          if(validCenter(strCenter)){
            const center = JSON.parse(strCenter);
            const marker = new window.google.maps.Marker({
              position: center,
              label: label || ''
            });
            marker.setMap(mapObject.map);
            mapObject.markers.push(marker);
          }
        }
      })
    }
  }
}
/**
 * Function to remove all geographies (geojson and markers) from map
 * @param {HTMLElement} map
 */
function removeGeographies(map) {
  const key = map.getAttribute('id');
  if (MAPS[key]&&MAPS[key].map){
    MAPS[key].map?.data?.forEach((feature)=>MAPS[key].map.data.remove(feature));
    if (MAPS[key]?.markers?.length){
      MAPS[key].markers.forEach((marker) => marker.setMap(null));
      MAPS[key].markers = [];
    }
  }
}
/**
 * - If there are tabs associated with a map, then the map and tabs should be 
 * in the same `<section>`.
 * - When the tab changes, get all geographies that were in the tab panel that was just navigated from 
 * and set their data-show-geography="false" and remove them from the map, then:
 * - Get all geographies with data-show-geography="false" in the new section and set their 
 * data-show-geography to true 
 * - Get bounds and center for new geographies and pan to that
 * - Add new geographies to map
 */
function handleTabChangeMaps(e) {
  /**
   * @type {{from: number, to: number, wrapper: HTMLElement}}
   */
  const { from, to, wrapper } = e.detail;
  const tabPanels = wrapper?.nextElementSibling;
  if (tabPanels&& tabPanels.children) {
    const section = tabPanels.closest('section');
    const children = Array.from(tabPanels.children);
    if(children[from]&&children[to]&&section){
      const showMap = section.querySelector('div[id^="google_map"]');
      const drawMap = section.querySelector('div[id^="draw_google_map"]');
      const circleMap =section.querySelector('div[id^="circle_google_map"]');
      const map = showMap || drawMap || circleMap; 
      const geographiesToRemove = Array.from(children[from]?.querySelectorAll('span[data-show-geography="true"]'));
      const geographiesToAdd = Array.from(children[to]?.querySelectorAll('span[data-show-geography="false"]'));
      if(Array.isArray(geographiesToRemove)&&map){
        geographiesToRemove.forEach((geog)=>geog.setAttribute('data-show-geography','false'));
        removeGeographies(map);
      }
      if(Array.isArray(geographiesToAdd)&&map){
        geographiesToAdd.forEach((span)=>span.setAttribute('data-show-geography','true'));
        const { bounds, center } = getBoundsAndCenter(map);
        const key = map.getAttribute('id');
        if (MAPS[key]&&MAPS[key].map){
          MAPS[key]?.map?.fitBounds(bounds); // [,padding]
          MAPS[key]?.map?.setCenter(center);
          addGeographies(MAPS[key]);
        }
      }
    }
  }
}

/**
 * Function included so that I only write once
 * @param {any} drawing result of  await google.maps.importLibrary('drawing')
 * @param {"circle"|"polygon"} type
 * @returns An object of drawing manager options
 */
function getDrawingManagerOptions(type) {
  const options = {
    drawingMode: (type==="circle") ? google.maps.drawing.OverlayType.CIRCLE : google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        (type==="circle") ? google.maps.drawing.OverlayType.CIRCLE : google.maps.drawing.OverlayType.POLYGON,
      ],
    },
    polygonOptions: Boolean(type==="polygon") ? {
      fillColor: getFillColor(),
      fillOpacity: 0.5,
      strokeColor: getStrokeColor(),
      strokeOpacity: 1,
      strokeWeight: 3,
      editable: true, 
      clickable: true,
      zIndex: 2
    } : {},
    circleOptions: Boolean(type==="circle") ? {
      fillColor: getFillColor(),
      fillOpacity: 0.5,
      strokeColor: getStrokeColor(),
      strokeOpacity: 1,
      strokeWeight: 3,
      editable: true, 
      clickable: true,
      zIndex: 2
    }:{},
  };
  return options;
}
/**
 * @param {Bounds|undefined} bounds This will set a restriction on the map, not merely change its view
 * @param {Center|undefined} center 
 * @returns Object of map options
 */
const getMapOptions = (center,bounds) => {
  const initial = {
    zoom: 4,
    center: center ? center : DEFAULT_MAPS_OBJECT.center,
    fullscreenControl: true,
    streetViewControl: false,
    maxZoom: 18,
    minZoom: 3,
    zoomControl: true,
    mapTypeControl: false,
    mapTypeControlOptions: {
        mapTypeIds: ['ROADMAP'],
    },
    disableDoubleClickZoom: true
  }
  if (bounds){
    initial.restriction = {
      latLngBounds: bounds
    };
  }
  return initial;
};

/**
 * If returned bounds and center are not undefined, then they are valid json objects
 * @param {HTMLElement} el
 */
const getDrawingMapProperties = (el) => {
  /**
   * @type {number|undefined}
   */
  var max;
  const maxGeographies = el.getAttribute('data-max-input');
  if (isNumLike(maxGeographies)) max = Number(maxGeographies);
  /**
   * @type {undefined|Bounds}
   */
  var bounds;
  const boundsStr  = el.getAttribute('data-bounds');
  if (validBounds(boundsStr)) bounds=JSON.parse(boundsStr);
  /**
   * @type {undefined|Center}
   */
  var center;
  const centerStr = el.getAttribute('data-center');
  if (validCenter(centerStr)) center=JSON.parse(centerStr);
  /**
   * @type {HTMLElement|undefined}
   */
  var inputDiv;
  const inputDivStr = el.getAttribute('data-inputs');
  if(inputDivStr){
    const inputDivEl = document.querySelector(inputDivStr);
    if(inputDivEl) inputDiv = inputDivEl;
  }
  /**
   * @type {HTMLElement|undefined}
   */
  var snackbar;
  const snackbarElStr = el.getAttribute('data-snackbar-el');
  if(snackbarElStr) {
    const snackbarEl = document.querySelector(snackbarElStr);
    if (snackbarEl) snackbar = snackbarEl;
  }
  return { center, bounds, max, inputDiv, snackbarEl: snackbar };
}

/**
 * - The first time this function is called is the first time a map is encountered in the application
 * - It is then called on new content loaded every time a map is on the page
 * - When new content is loaded, get all maps on the page that are like this:
 * - div[id^="google_map"] = maps that are  supposed to show geographies
 *  - 
 * - div[id^="draw_google_map"] = maps where users are supposed to be able to draw polygons
 * - div[id^="circle_google_map"] = maps where users are supposed to be able to draw circles
 * 
 * - All maps are kept in a MAPS object
 */
export async function setGoogleMaps() {
  const showMaps = Array.from(document.querySelectorAll('div[id^="google_map"]'));
  const drawMaps = Array.from(document.querySelectorAll('div[id^="draw_google_map"]'));
  const drawCircleMaps = Array.from(document.querySelectorAll('div[id^="circle_google_map"]'));
  if (showMaps.length || drawMaps.length || drawCircleMaps.length){
    const { Map } = await google.maps.importLibrary('maps');
    var drawing;
    if (drawMaps.length||drawCircleMaps.length) {
      drawing = await google.maps.importLibrary('drawing'); // drawing = { DrawingManager, OverlayType }
    }
    if (showMaps.length){
      for(let i = 0; i < showMaps.length; i++){
        const key = showMaps[i].getAttribute('id');
        if (MAPS[key]===undefined) {
          const { bounds, center } = getBoundsAndCenter(showMaps[i]);
          /**
           * @type {ShowMapObject}
           */
          const showMapObject ={map: undefined, el: showMaps[i], bounds: bounds, markers: [], type: "show"};
          MAPS[key] = showMapObject;
          const newMap = new Map(showMaps[i],getMapOptions(center));
          newMap.fitBounds(bounds);
          newMap.setCenter(center);
          MAPS[key].map = newMap;
          addGeographies(MAPS[key]);
        }
      }
    }
    if (drawMaps.length && drawing){
      for (let i = 0; i <drawMaps.length;i++){
        const key = drawMaps[i].getAttribute('id');
        if (!!!MAPS[key]) {
          const { center, max, bounds, inputDiv, snackbarEl } = getDrawingMapProperties(drawMaps[i]);
          if(!!!inputDiv) return;
          const newMap = new Map(drawMaps[i],getMapOptions(center,bounds));
          const drawingManager = new drawing.DrawingManager(getDrawingManagerOptions("polygon"));
          if (bounds) newMap.fitBounds(bounds);
          else newMap.fitBounds(DEFAULT_MAPS_OBJECT.bounds);
          if (center) newMap.setCenter(center)
          else newMap.setCenter(DEFAULT_MAPS_OBJECT.center);
          drawingManager.setMap(newMap);
          google.maps.event.addListener(drawingManager,'overlaycomplete',handleOverlayComplete);
          /**
           * @type {DrawMapObject}
           */
          const obj = {el: drawMaps[i], map: newMap, type: "polygon", polygons: {}, max, drawingManager, inputDiv, snackbarEl };
          MAPS[key] = obj;
        }
      }
    }
    if (drawCircleMaps.length && drawing){
      for (let i = 0; i < drawCircleMaps.length;i++){
        const key = drawCircleMaps[i].getAttribute('id');
        if (!!!MAPS[key]){
          const { center, max, bounds, inputDiv, snackbarEl } = getDrawingMapProperties(drawCircleMaps[i]);
          if(!!!inputDiv) return;
          const newMap = new Map(drawCircleMaps[i],getMapOptions(center,bounds));
          const drawingManager = new drawing.DrawingManager(getDrawingManagerOptions("circle"));
          if (bounds) newMap.fitBounds(bounds);
          else newMap.fitBounds(DEFAULT_MAPS_OBJECT.bounds);
          if (center) newMap.setCenter(center)
          else newMap.setCenter(DEFAULT_MAPS_OBJECT.center);
          drawingManager.setMap(newMap);
          google.maps.event.addListener(drawingManager,'overlaycomplete',handleOverlayComplete);
          /**
           * @type {CircleMapObject}
           */
          const obj = {el: drawCircleMaps[i], map: newMap, type: "circle", polygons: {}, max, drawingManager, inputDiv, snackbarEl };
          MAPS[key] = obj;
        }
      }
    }
    setMapsStyles(getLightModeDarkMode());
    const main = document.querySelector('main#PAGE');
    if(main)main.addEventListener('tabChange',handleTabChangeMaps);
  }
  const lightModeDarkModeID = "light-mode-dark-mode";
  const lightModeDarkModeButton = document.getElementById(lightModeDarkModeID);
  if (lightModeDarkModeButton) lightModeDarkModeButton.addEventListener("click",handleLightModeChangeMaps);
}

/**
 * Function to call when a page that has maps is unloaded. The map overlays should be re-added to the maps
 * when the page is returned to
 */
export function removeGoogleMaps(){
  Object.keys(MAPS).forEach((key) => delete MAPS[key]);
}

/**
 * Function to call 
 */
export function editGeographyStyles(){
  setMapsStyles(getLightModeDarkMode());
}

