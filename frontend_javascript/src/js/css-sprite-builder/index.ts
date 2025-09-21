import { onNewContentLoaded } from "../shared";
import { getClientImageData } from "../media-upload";
import { scaleSVGPath } from "./scaleAndParsePath";

type AddedSVG = {
  widthAndHeight: number,
  fill: string
};
var CURRENT_PATHS: {path: string, opacity: number}[]|undefined = undefined;
const VALID_HEX_REGEX = /^#[0-9A-F]{6}$/i;



/**
 * Attributes that exist on multiple canvas elements
 */
type SharedAttributes = {
  fillColor: string,
  fillOpacity: number,
  strokeColor: string,
  strokeOpacity: number,
  lineWidth: number,
  lineCap: 'butt'|'round'|'square',
  lineJoin: 'round'|'bevel'|'miter',
  miterLimit: number,
  shadowBlur: number,
  shadowColor: string,
  shadowOffsetX: number,
  shadowOffsetY: number
};


type ADDED_PATH = {
  paths: {path:string, opacity: number}[],
  widthAndHeight: number,
  
}
type WidthAndHeight = { width: number, height: number };
/**
 * Elements added to css sprite
 */
const ADDED_ELEMENTS:(
  (ReturnType<typeof getSvgFormState> & {elementType: 'svg'} & {renderStats: WidthAndHeight})|
  (ReturnType<typeof getImageFormState> & {elementType: 'image'} & {renderStats: WidthAndHeight})|
  (ReturnType<typeof getTextFormState> & {elementType: 'text'} & {renderStats: WidthAndHeight})|
  (ReturnType<typeof getRectangleFormState> & {elementType: 'rectangle'} & {renderStats: WidthAndHeight})|
  (ReturnType<typeof getPathFormState> & {elementType: 'path'} & {renderStats: WidthAndHeight})|
  (ReturnType<typeof getEllipseFormState> & {elementType: 'ellipse'} & {renderStats: WidthAndHeight})
  )[] = [];

/* -------------------------------------------- Helper Functions ----------------------------------------------------------- */
const getRandID = () => Math.random().toString().slice(2);
const getBackgroundForm = () => document.getElementById('css-sprite-background-form') as HTMLFormElement|null;
const getSvgForm = () => document.getElementById('add-svg-to-sprite') as HTMLFormElement|null;
const getImageForm = () => document.getElementById('add-image-css-sprite-form') as HTMLFormElement|null;
const getTextForm = () => document.getElementById('canvas-add-text-form') as HTMLFormElement|null;
const getRectangleForm = () => document.getElementById('css-sprite-add-rectangle-form') as HTMLFormElement|null;
const getPathForm = () => document.getElementById('css-sprite-add-path-form') as HTMLFormElement|null;
const getEllipseForm = () => document.getElementById('css-sprite-add-ellipse-form') as HTMLFormElement|null;
const isValidNumber = (a:any) => Boolean(typeof a==='number' && isFinite(a) && !!!isNaN(a));
const getMode = () => (() => {
  const html = document.querySelector('html')
  if (html){
    const mode = html.getAttribute('data-mode');
    if (mode==='light'||mode==='dark') return mode;
    else return 'dark';
  }
  return 'dark';
})();
function getDefaultPrimaryColor() {
  const mode = getMode();
  const id = `primary-${mode}-settings-color`
  const input = document.getElementById(id) as HTMLInputElement|null;
  if (input && VALID_HEX_REGEX.test(input.value)) return input.value;
  else return '#90caf9';
}
function getDefaultSecondaryColor() {
  const mode = getMode();
  const id = `secondary-${mode}-settings-color`
  const input = document.getElementById(id) as HTMLInputElement|null;
  if (input && VALID_HEX_REGEX.test(input.value)) return input.value;
  else return '#ab47bc';
}

function getNumberInput(wrapper:HTMLElement,inputName:string|{querySelector: string},defaultVal:number,other:{min?:number,max?:number,step?:number}) {
  const input = typeof inputName==='string' ? wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`) : wrapper.querySelector<HTMLInputElement>(inputName.querySelector);
  if (!!!input) return defaultVal;
  var ret = parseFloat(input.value);
  const stepDecimals = other.step!==undefined ? (other.step.toString().split('.')?.[1]?.length || 0) : 0;
  if (other.step!==undefined) ret = Number(ret.toFixed(stepDecimals)); 
  if (other.min!==undefined) ret = Math.max(other.min,ret);
  if (other.max!==undefined) ret = Math.min(other.max,ret);
  return isValidNumber(ret) ? ret : defaultVal;
}
function getRangeInput(wrapper:HTMLElement,inputName:string,defaultVal:number,other:{min?:number,max?:number,step?:number}={}) {
  const input = wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
  if (!!!input) return defaultVal;
  var ret = parseFloat(input.value);
  const stepDecimals = other.step!==undefined ? (other.step.toString().split('.')?.[1]?.length || 0) : 0;
  if (other.step!==undefined) ret = Number(ret.toFixed(stepDecimals)); 
  if (other.min!==undefined) ret = Math.max(other.min,ret);
  if (other.max!==undefined) ret = Math.min(other.max,ret);
  return isValidNumber(ret) ? ret : defaultVal;
}
function getColorInput(wrapper:HTMLElement,inputName:string,defaultVal:string) {
  const input = wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
  if (!!!input) return defaultVal;
  var ret = input.value;
  if (VALID_HEX_REGEX.test(ret)) return ret;
  else return defaultVal;
}
function getFieldSetInput(wrapper:HTMLElement,inputName:string,allowedValues:string[],defaultVal:string) {
  const input = wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
  if (!!!input) return defaultVal;
  var ret = input.value;
  if ((new Set(allowedValues)).has(ret)) return ret;
  else return defaultVal;
}
function getSelectInput(wrapper:HTMLElement,inputName:string,allowedValues:string[],defaultVal:string) {
  const input = wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`);
  if (!!!input) return defaultVal;
  var ret = input.value;
  if ((new Set(allowedValues)).has(ret)) return ret;
  else return defaultVal;
}
function getCheckboxInput(wrapper:HTMLElement,inputName:string|{querySelector:string},defaultVal:boolean) {
  const input = typeof inputName==='string' ? wrapper.querySelector<HTMLInputElement>(`input[name="${inputName}"]`) :  wrapper.querySelector<HTMLInputElement>(inputName.querySelector);
  if (!!!input) return defaultVal;
  return input.checked;
}

function getSharedInputValues(wrapper:HTMLElement) {
  var lineWidth:number, lineCap:'butt'|'round'|'square', lineJoin:'round'|'bevel'|'miter', miterLimit:number,shadowBlur:number,shadowColor:string,shadowOffsetX:number,shadowOffsetY:number, lineDashOffset:number, lineDashSegments:number[]|undefined, transparentShadow: boolean;
  const VALID_LINE_CAP = new Set(['butt','round','square']);
  const VALID_LINE_JOIN = new Set(['round','bevel','miter']);
  const lineWidthInput = wrapper.querySelector<HTMLInputElement>('input[id^="line_width"]');
  if (lineWidthInput&&isValidNumber(parseFloat(lineWidthInput.value))) lineWidth = parseFloat(lineWidthInput.value);
  else lineWidth = 1;
  const lineCapInput = wrapper.querySelector<HTMLInputElement>('input[name^="line-cap-style_"]:checked');
  if (lineCapInput&&VALID_LINE_CAP.has(lineCapInput.value)) lineCap = lineCapInput.value as 'butt'|'round'|'square';
  else lineCap = 'butt';
  const lineJoinInput = wrapper.querySelector<HTMLInputElement>('input[name^="line-join-style_"]:checked');
  if (lineJoinInput&&VALID_LINE_JOIN.has(lineJoinInput.value)) lineJoin = lineJoinInput.value as 'round'|'bevel'|'miter';  
  else lineJoin = 'miter';
  const miterLimitInput = wrapper.querySelector<HTMLInputElement>('input[id^="miter-limit"]');
  if (miterLimitInput&&isValidNumber(parseFloat(miterLimitInput.value))) miterLimit=parseFloat(miterLimitInput.value);  
  else miterLimit = 10;
  const shadowBlurInput = wrapper.querySelector<HTMLInputElement>('input[id^="shadowBlur"]');
  if (shadowBlurInput&&isValidNumber(parseFloat(shadowBlurInput.value))) shadowBlur=parseFloat(shadowBlurInput.value);  
  else shadowBlur = 0;
  const shadowColorInput = wrapper.querySelector<HTMLInputElement>('input[id^="shadowColor"]');
  if (shadowColorInput&&VALID_HEX_REGEX.test(shadowColorInput.value)) shadowColor = shadowColorInput.value;   
  else shadowColor = getDefaultPrimaryColor();
  const shadowOffsetXInput = wrapper.querySelector<HTMLInputElement>('input[id^="shadowOffsetX"]');
  if (shadowOffsetXInput&&isValidNumber(parseFloat(shadowOffsetXInput.value))) shadowOffsetX = parseFloat(shadowOffsetXInput.value);
  else shadowOffsetX = 0;
  const shadowOffsetYInput = wrapper.querySelector<HTMLInputElement>('input[id^="shadowOffsetY"]');
  if (shadowOffsetYInput&&isValidNumber(parseFloat(shadowOffsetYInput.value))) shadowOffsetY = parseFloat(shadowOffsetYInput.value);
  else shadowOffsetY = 0;
  const lineDashOffsetInput = wrapper.querySelector<HTMLInputElement>('input[name^="line_dash_"]');
  if (lineDashOffsetInput&&isValidNumber(parseFloat(lineDashOffsetInput.value))) lineDashOffset = parseFloat(lineDashOffsetInput.value);
  else lineDashOffset = 0;
  const lineDashSegmentInputs =  Array.from(wrapper.querySelectorAll<HTMLInputElement>('input[name^="line_dash_segment_"]'));
  lineDashSegmentInputs.forEach((obj) => {
    if (isValidNumber(parseInt(obj.value))) {
      if (!!!lineDashSegments) lineDashSegments = [parseInt(obj.value)];
      else lineDashSegments.push(parseInt(obj.value));
    }
  });
  const transparentShadowInput = wrapper.querySelector<HTMLInputElement>('input[name^="transparent_shadow_"]');
  if (transparentShadowInput) transparentShadow = transparentShadowInput.checked;
  else transparentShadow = false;
  return {
    lineWidth,
    lineCap,
    lineJoin,
    miterLimit,
    shadowBlur,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
    lineDashOffset,
    lineDashSegments,
    transparentShadow
  };
}
 
function clearCanvas(canvas:HTMLCanvasElement) {
  if (canvas.height!==100) canvas.height = 100;
  if (canvas.width!==300) canvas.width = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0,0,canvas.width,canvas.height);
}
const percentToHex = (p:number) => {
  const percent = Math.max(0, Math.min(100, p)); // bound percent from 0 to 100
  const intValue = Math.round(p / 100 * 255); // map percent to nearest integer (0 - 255)
  const hexValue = intValue.toString(16); // get hexadecimal representation
  return hexValue.padStart(2, '0').toUpperCase(); // format with leading 0 and upper case characters
}
function getHexAlpha(hexColor:string,opacity:number) {
  const alpha = percentToHex(opacity*100);
  return hexColor.concat(alpha);
}
function setCanvasRenderingProperties(ctx:CanvasRenderingContext2D,obj:ReturnType<typeof getSharedInputValues> & {[index: string]: any}) {
  ctx.lineCap = obj.lineCap;
  ctx.lineJoin = obj.lineJoin;
  ctx.lineWidth = obj.lineWidth;
  ctx.miterLimit = obj.miterLimit;
  if (!!!obj.transparentShadow) {
    ctx.shadowBlur = obj.shadowBlur;
    ctx.shadowColor = obj.shadowColor;
    ctx.shadowOffsetX = obj.shadowOffsetX;
    ctx.shadowOffsetY = obj.shadowOffsetY;
  }
  ctx.lineDashOffset = obj.lineDashOffset;
  if (obj.lineDashSegments&&obj.lineDashSegments.length) {
    ctx.setLineDash(obj.lineDashSegments);
  }
}
function setCanvasWidthAndHeight(canvas:HTMLCanvasElement,obj?:{width?: number, height?:number}) {
  if (obj) {
    if (obj.width) canvas.width = Math.max(300,obj.width);
    if (obj.height) canvas.height = Math.max(100,obj.height);
  }
}





function scaleUpPath(path:string,widthAndHeight:number) {
  const INITIAL_WIDTH_HEIGHT = 24;
  const SCALE = widthAndHeight/INITIAL_WIDTH_HEIGHT;
  const scaledPath = scaleSVGPath(path,SCALE) as string;
  return scaledPath;
}

function degreeToRadians(deg:number) {
  return Math.PI*deg/180;
}

const ADD_LINE_DASH_BUTTON = document.createElement('button');
ADD_LINE_DASH_BUTTON.setAttribute('type','button');
ADD_LINE_DASH_BUTTON.setAttribute('data-add-line-dash','');
ADD_LINE_DASH_BUTTON.className = "icon-text medium info filled";
ADD_LINE_DASH_BUTTON.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="LineWeight"><path d="M3 17h18v-2H3v2zm0 3h18v-1H3v1zm0-7h18v-3H3v3zm0-9v4h18V4H3z"></path></svg>');
ADD_LINE_DASH_BUTTON.append(document.createTextNode('ADD LINE DASH'));

const REMOVE_LINE_DASH_BUTTON = document.createElement('button');
REMOVE_LINE_DASH_BUTTON.setAttribute('type','button');
REMOVE_LINE_DASH_BUTTON.setAttribute('data-remove-line-dash','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
REMOVE_LINE_DASH_BUTTON.className = "icon-text medium error filled";
REMOVE_LINE_DASH_BUTTON.insertAdjacentHTML('afterbegin','');
REMOVE_LINE_DASH_BUTTON.append(document.createTextNode('REMOVE LINE DASH'));

function addLineDash(this:HTMLButtonElement,e:Event) {
  const parentElement = this.parentElement;
  if (parentElement) {
    const rand = getRandID();
    const htmlToAppend = /*html*/`<div data-line-dash-container class="mt-2">
    <div class="input-group block" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
      <label for="line_dash_${rand}">Line Dash Offset:</label>
      <div class="mt-1 number-input medium">
          <input 
          type="number" 
          value="0.0"
          step="0.1" 
          name="line_dash_${rand}" 
          id="line_dash_${rand}" 
          placeholder="Enter the line dash offset..." 
          autocomplete="off" 
          spellcheck="false" 
          autocapitalize="off"
          >
          <button class="icon large" data-increase aria-label="Increase Input" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
                  </path>
              </svg>
          </button>
          <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
              <svg focusable="false" inert viewBox="0 0 24 24">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
                  </path>
              </svg>
          </button>
      </div>
    </div>
    <div class="mt-2" data-line-dash>
      <div class="flex-row justify-end">
        <button data-add-line-dash-segment type="button" class="primary filled icon-text small" aria-label="Add Line Dash">
          <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
          ADD LINE DASH SEGMENT
        </button>
      </div>
      ${getLineDashSegmentHTML()}
    </div>
  
  </div>`;
    parentElement.insertAdjacentHTML('afterend',htmlToAppend);
    const nextElementSibling = parentElement.nextElementSibling;
    if (nextElementSibling) {
      const addLineDashSegmentBtn = nextElementSibling.querySelector<HTMLButtonElement>('button[data-add-line-dash-segment]');
      const removeLineDashSegmentBtn = nextElementSibling.querySelector<HTMLButtonElement>('button[data-remove-line-dash-segment]');
      if (addLineDashSegmentBtn) addLineDashSegmentBtn.addEventListener('click',addLineDashSegment);
      if (removeLineDashSegmentBtn) removeLineDashSegmentBtn.addEventListener('click',removeLineDashSegment);
    }
    const clonedNode = REMOVE_LINE_DASH_BUTTON.cloneNode(true);
    clonedNode.addEventListener('click',removeLineDash);
    this.remove();
    parentElement.append(clonedNode);
    onNewContentLoaded(parentElement);
  }
}

function removeLineDash(this:HTMLButtonElement,e:Event) {
  const parentElement = this.parentElement;
  if (parentElement) {
    const nextElementSibling = parentElement.nextElementSibling;
    if (nextElementSibling) nextElementSibling.remove();
    const clonedNode = ADD_LINE_DASH_BUTTON.cloneNode(true);
    clonedNode.addEventListener('click',addLineDash);
    this.remove();
    parentElement.append(clonedNode);
    onCssSpriteBuilderLoad();
  }
}

function getLineDashSegmentHTML() {
  const rand = getRandID();
  return /*html*/`<div class="input-group mt-1 block" data-line-dash-segment data-hover="false" data-focus="false" data-error="false" data-blurred="false">
  <label for="line_dash_segment_${rand}">Line Dash Segment:</label>
  <div class="mt-1 flex-row gap-3 medium">
      <input 
      type="number" 
      value="0" 
      name="line_dash_segment_${rand}" 
      id="line_dash_segment_${rand}" 
      placeholder="Enter the value for the line dash segment..." 
      autocomplete="off" 
      spellcheck="false" 
      autocapitalize="off"
      >
      <button class="icon large" data-increase aria-label="Increase Input" type="button">
          <svg focusable="false" inert viewBox="0 0 24 24">
              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
              </path>
          </svg>
      </button>
      <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
          <svg focusable="false" inert viewBox="0 0 24 24">
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
              </path>
          </svg>
      </button>
      <button data-remove-line-dash-segment type="button" class="error filled icon medium" aria-label="Add Line Dash">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
      </button>
  </div>
</div>`;
}

function addLineDashSegment(this:HTMLButtonElement,e:Event) {
  const grandParent = this.parentElement?.parentElement;
  if (grandParent) {
    grandParent.insertAdjacentHTML('beforeend',getLineDashSegmentHTML());
    const removeLineDashSegments = Array.from(grandParent.querySelectorAll<HTMLButtonElement>('button[data-remove-line-dash-segment]'));
    removeLineDashSegments.forEach((b) => b.addEventListener('click',removeLineDashSegment));
    onNewContentLoaded(grandParent);
  }
}

function removeLineDashSegment(this:HTMLButtonElement,e:Event) {
  const inputGroup = this.closest<HTMLDivElement>('div[data-line-dash-segment]');
  if(inputGroup) {
    inputGroup.remove();
    onCssSpriteBuilderLoad();
  }
}


/* ---------------------- Edit Background ---------------------------------------------------- */
function getBackgroundFormState(form:HTMLFormElement) {
  const transparentInput = form.querySelector(`input[name="css-background-transparent"]`);
  
  return null;
}
function updateBackgroundCanvas(form:HTMLFormElement) {
  const formState = getBackgroundFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;

}
function onBackgroundFormChange(this:HTMLFormElement,_e:Event) {
  updateBackgroundCanvas(this);
}
function onBackgroundFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();


  this.reset();
  updateTopLevelSprite();
}

/* ---------------------- Edit SVG ---------------------------------------------------- */

function onCopySvgButtonClick(this:HTMLButtonElement,e:Event) {
  const svg = this.querySelector<SVGElement>('svg');
  if (svg) {
    const paths = svg.querySelectorAll<SVGPathElement>('path');
    CURRENT_PATHS = [];
    paths.forEach((path) => {
      const d = path.getAttribute('d');
      const opacityStr = path.getAttribute('opacity');
      const opacity = opacityStr ? (!!!isNaN(parseFloat(opacityStr)) && isFinite(parseFloat(opacityStr)) ? parseFloat(opacityStr) : 1) : 1;
      if (CURRENT_PATHS&&d) CURRENT_PATHS.push({ path: d, opacity });
      const svgForm = getSvgForm();
      if (svgForm) updateSvgCanvas(svgForm);
    })
  }
}
function afterSearchIconsRequest(e:CustomEvent) {
  if (e && e.detail && e.detail.target && e.detail.target.id==='icon-results'){
    const buttons = (e.detail.target as HTMLElement).querySelectorAll<HTMLButtonElement>('button[data-scroll]');
    buttons.forEach((b) => {
      b.addEventListener('click',onCopySvgButtonClick);
    })
  }
}

function getSvgFormState(form:HTMLFormElement) {
  const paths = CURRENT_PATHS;
  const widthAndHeight = getNumberInput(form,'svg-width-height',30,{min:0,step:1});
  const fillColor = getColorInput(form,'svg-fill',getDefaultPrimaryColor());
  const strokeColor = getColorInput(form,'svg-stroke',getDefaultSecondaryColor());
  const strokeOpacity =getRangeInput(form,'stroke-color-canvas-svg-opacity',1,{min:0,max:1,step:0.01});
  const fillOpacity =- getRangeInput(form,'fill-color-canvas-svg-opacity',1,{min:0,max:1,step:0.01});
  const transparentStroke = getCheckboxInput(form,{querySelector: 'input[name^="stroke_transparent"]'},false);
  const transparentFill = getCheckboxInput(form,{querySelector: 'input[name^="fill_transparent"]'},false);
  const other = getSharedInputValues(form);
  return {
    paths,
    widthAndHeight,
    fillColor,
    strokeColor,
    strokeOpacity,
    fillOpacity,
    transparentStroke,
    transparentFill,
    ...other
  };
}
function updateSvgCanvas(form:HTMLFormElement) {
  const formState = getSvgFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  if(canvas) {
    if (formState.paths && !!!(formState.transparentFill===true&&formState.transparentStroke===true)) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        clearCanvas(canvas);
        setCanvasRenderingProperties(ctx,formState);
        setCanvasWidthAndHeight(canvas,{ width: formState.widthAndHeight + formState.lineWidth*2, height: formState.widthAndHeight + formState.lineWidth*2 });
        for (let pathObj of formState.paths) {
          console.log(pathObj.path);
          
          const path = new Path2D(scaleUpPath(pathObj.path,formState.widthAndHeight));
          ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
          ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
          if (!!!formState.transparentStroke) ctx.stroke(path); 
          if (!!!formState.transparentFill) ctx.fill(path);
        }
      }
    } else {
      clearCanvas(canvas);
    }
  }
}
function onSvgFormChange(this:HTMLFormElement,_e:Event) {
  updateSvgCanvas(this);
}
function onSvgFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getSvgFormState(this);
  if (formState.paths) {
    ADDED_ELEMENTS.push({ ...formState, elementType: 'svg', renderStats: {width: formState.widthAndHeight, height: formState.widthAndHeight }});
    this.reset();
    updateTopLevelSprite();
  }
}

/* ---------------------- Edit Image ---------------------------------------------------- */
function getImageFormState(form:HTMLFormElement) {
  const imageState = getClientImageData('upload-image-css-sprite',false);
  if (imageState) {
    const url = imageState.currentUrl;
    if (imageState.imageEditor) {
      const height = imageState.imageEditor?.imageSize?.width;
      const width = imageState.imageEditor?.imageSize?.height;
      if (!!!width||!!!height) {
        return {
          url,
          width: 100,
          height: 100
        }
      } else {
        return {
          url, 
          width,
          height
        }
      }
    }
  }
  return null;
}
function updateImageCanvas(form:HTMLFormElement) {
  const formState = getImageFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  if (canvas) {
    if (formState) {
      const image = new Image();
      image.src = formState.url;
      setCanvasWidthAndHeight(canvas,{ width: formState.width, height: formState.height });
      image.width = formState.width;
      image.height = formState.height;
      image.onload = () => {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(image,0,0);
      }
      image.onerror = (e) => {
        console.error(e);
      }
    } else {
      clearCanvas(canvas);
    } 
  }
}
function onImageFormChange(this:HTMLFormElement,e:Event) {
  console.log(e);
  const func = function (this:HTMLFormElement) {
    updateImageCanvas(this);
  }.bind(this);
  setTimeout(func,1000);
}
function onImageFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getImageFormState(this);
  if (formState) {
    if (formState.url) {
      ADDED_ELEMENTS.push({ ...formState, elementType: 'image', renderStats: {width: formState.width, height: formState.height }});
      this.reset();
      updateTopLevelSprite();
    }
  }
}

/* ---------------------- Edit Text ---------------------------------------------------- */
function getTextFormState(form:HTMLFormElement) {
  const ALLOWED_FONTS = [
    "arial",
    "verdana",
    "tahoma",
    "trebuchet ms",
    "times new roman",
    "georgia",
    "garamond",
    "courier new",
    "brush script mt"
];
const ALLOWED_TEXT_RENDERING = [
  'auto',
  'optimizeSpeed',
  'optimizeLegibility',
  'geometricPrecision'
];
  const textInput = form.querySelector<HTMLInputElement>(`input[name="canvas-text-input"]`);
  const textSize = getNumberInput(form,'canvas-text-input-size',16,{ min: 1, step: 1});
  const fontFamily = getSelectInput(form,'font-family-canvas-text',ALLOWED_FONTS,'arial');
  const fillColor = getColorInput(form,'fill-color-canvas-text',getDefaultPrimaryColor());
  const strokeColor = getColorInput(form,'fill-color-canvas-stroke',getDefaultSecondaryColor());
  const strokeOpacity = getRangeInput(form,'stroke-color-canvas-text-opacity',1,{min:0,max:1,step:0.01});
  const fillOpacity = getRangeInput(form,'fill-color-canvas-text-opacity',1,{min:0,max:1,step:0.01});
  const textRendering = getFieldSetInput(form,'canvas-text-rendering',ALLOWED_TEXT_RENDERING,'auto');
  const wordSpacing = getNumberInput(form,'',0,{min:0,step:1});
  const transparentStroke = getCheckboxInput(form,{querySelector: 'input[name^="stroke_transparent"]'},false);
  const transparentFill = getCheckboxInput(form,{querySelector: 'input[name^="fill_transparent"]'},false);
  const other = getSharedInputValues(form);
  return {
    text: textInput ? textInput.value : 'Hello World',
    textSize,
    fontFamily,
    fillColor,
    strokeColor,
    strokeOpacity,
    fillOpacity,
    textRendering,
    wordSpacing,
    transparentStroke,
    transparentFill,
    ...other
  };
}
function updateTextCanvas(form:HTMLFormElement) {
  const formState = getTextFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  if(canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (formState.text.length&&!!!(formState.transparentFill===true&&formState.transparentStroke===true)) {
        clearCanvas(canvas);
        setCanvasRenderingProperties(ctx,formState);
        ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
        ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
        if (ctx.hasOwnProperty('textRendering')) (ctx as any).textRendering = formState.textRendering;
        if (ctx.hasOwnProperty('wordSpacing')) (ctx as any).wordSpacing = formState.wordSpacing;
        ctx.font = `${formState.textSize}px ${formState.fontFamily}`;
        const measuredText = ctx.measureText(formState.text);
        const textHeight = (measuredText.fontBoundingBoxAscent - measuredText.fontBoundingBoxDescent) ;
        setCanvasWidthAndHeight(canvas,{ width: measuredText.width+ formState.wordSpacing*formState.text.split(' ').length, height: textHeight });
        setCanvasRenderingProperties(ctx,formState);
        ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
        ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
        if (ctx.hasOwnProperty('textRendering')) (ctx as any).textRendering = formState.textRendering;
        if (ctx.hasOwnProperty('wordSpacing')) (ctx as any).wordSpacing = formState.wordSpacing;
        ctx.font = `${formState.textSize}px ${formState.fontFamily}`;
        if (!!!formState.transparentFill) ctx.fillText(formState.text,0,textHeight);
        if (!!!formState.transparentStroke) ctx.strokeText(formState.text,0,textHeight);
        ctx.save();
      } else {
        clearCanvas(canvas);
      }
    }
  }
}
function onTextFormChange(this:HTMLFormElement,_e:Event) {
  updateTextCanvas(this);
}
function onTextFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getTextFormState(this);
  const canvas = document.querySelector(`output[form="${this.id}"] canvas`) as HTMLCanvasElement|null;
  if(canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (formState.text.length) {
        if (ctx.hasOwnProperty('textRendering')) (ctx as any).textRendering = formState.textRendering;
        if (ctx.hasOwnProperty('wordSpacing')) (ctx as any).wordSpacing = formState.wordSpacing;
        ctx.font = `${formState.textSize}px ${formState.fontFamily}`;
        const measuredText = ctx.measureText(formState.text);
        ADDED_ELEMENTS.push({ ...formState, elementType: 'text', renderStats: {width: measuredText.width + formState.wordSpacing*formState.text.split(' ').length, height: (measuredText.fontBoundingBoxAscent - measuredText.fontBoundingBoxDescent) }});
        this.reset();
        updateTopLevelSprite();
      }
    }
  }
}
/* ---------------------- Edit Rectangle ---------------------------------------------------- */
function getRectangleFormState(form:HTMLFormElement) {
  const rounded = getCheckboxInput(form,'draw-rect-rounded-checkbox',false);
  const width = getNumberInput(form,'draw-rect-width',100,{min: 1, step: 1});
  const height = getNumberInput(form,'draw-rect-height',100,{ min: 0, step: 1})
  const topLeftBorderRadius = getNumberInput(form,'draw-rect-top-left-border-radius',0,{min:0,step:1})
  const topRightBorderRadius = getNumberInput(form,'draw-rect-top-right-border-radius',0,{min:0,step:1})
  const bottomLeftBorderRadius = getNumberInput(form,'draw-rect-bottom-left-border-radius',0,{min:0,step:1})
  const bottomRightBorderRadius = getNumberInput(form,'draw-rect-bottom-right-border-radius',0,{min:0,step:1})
  const rotation = getNumberInput(form,'draw-rect-rotate',0,{min:0,step:1,max:360})
  const fillColor = getColorInput(form,'draw-rect-fill-color',getDefaultPrimaryColor());
  const strokeColor = getColorInput(form,'draw-rect-stroke-color',getDefaultSecondaryColor());
  const fillOpacity = getRangeInput(form,'draw-rect-fill-opacity',1,{min:0,max:1,step:0.01})
  const strokeOpacity = getRangeInput(form,'draw-rect-stroke-opacity',1,{min:0,max:1,step:0.01});
  const transparentStroke = getCheckboxInput(form,{querySelector: 'input[name^="stroke_transparent"]'},false);
  const transparentFill = getCheckboxInput(form,{querySelector: 'input[name^="fill_transparent"]'},false);
  const other = getSharedInputValues(form);
  return {
    rounded,
    width,
    height,
    topLeftBorderRadius,
    topRightBorderRadius,
    bottomLeftBorderRadius,
    bottomRightBorderRadius,
    rotation,
    fillColor,
    strokeColor,
    fillOpacity,
    strokeOpacity,
    transparentStroke,
    transparentFill,
    ...other
  };
}
function updateRectangleCanvas(form:HTMLFormElement) {
  const formState = getRectangleFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  if(canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (!!!(formState.transparentFill===true&&formState.transparentStroke===true)) {
        clearCanvas(canvas);
        setCanvasWidthAndHeight(canvas,{ width: formState.width + formState.lineWidth*2, height: formState.height + formState.lineWidth*2 });
        ctx.beginPath(); 
        setCanvasRenderingProperties(ctx,formState);
        ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
        ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
        if (formState.rounded) {
          ctx.rotate(degreeToRadians(formState.rotation));
          ctx.roundRect(formState.lineWidth,formState.lineWidth,formState.width,formState.height,[formState.topLeftBorderRadius,formState.topRightBorderRadius,formState.bottomRightBorderRadius,formState.bottomLeftBorderRadius]); 
        } else {
          ctx.rotate(degreeToRadians(formState.rotation));
          ctx.rect(formState.lineWidth,formState.lineWidth,formState.width,formState.height);
        }
        if (!!!formState.transparentStroke) ctx.stroke();
        if (!!!formState.transparentFill) ctx.fill();
        ctx.save();
      } else {
        clearCanvas(canvas);
      }
    }
  }
}
function onRectangleFormChange(this:HTMLFormElement,_e:Event) {
  updateRectangleCanvas(this);
  const rounded = getCheckboxInput(this,'draw-rect-rounded-checkbox',false);
  const borderRadiusInputs = Array.from(this.querySelectorAll<HTMLInputElement>('input[name$="border-radius"]'));
  borderRadiusInputs.forEach((input) => {
    const parent = input.parentElement;
    if (parent) {
      const removeDisabled = Array.from(parent.querySelectorAll('button'));
      if (rounded) {
        input.removeAttribute('disabled');
        removeDisabled.forEach((b) => b.removeAttribute('disabled'));
      } else {
        input.setAttribute('disabled','');
        removeDisabled.forEach((b) => b.setAttribute('disabled',''));
      }
    }
  })
}
function onRectangleFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getRectangleFormState(this);
  ADDED_ELEMENTS.push({ ...formState, elementType: 'rectangle', renderStats: {width: formState.width, height: formState.height }});
  this.reset();
  updateTopLevelSprite();
}
/* ---------------------- Edit Path ---------------------------------------------------- */
type PathOperationType = 'moveTo'|'lineTo'|'bezierCurveTo'|'quadraticCurveTo'|'arc'|'arcTo';
const VALID_PATH_OPERATION = new Set(['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','arc','arcTo'])

/**
 * 
 * @param name 
 * @param label Label without the colon (:)
 * @param placeholder 
 * @param min 
 * @param max 
 * @param step 
 * @returns 
 */
function getNumberInputHTML(name:string,label:string,placeholder:string,other:{min?:number,max?:number,step?:number, defaultVal?:number}) {
  return /*html*/`<div class="input-group grow-1" data-hover="false" data-focus="false" data-error="false" data-blurred="false">
  <label for="${name}">${label}:</label>
  <div class="mt-1 number-input medium">
      <input 
      type="number" 
      ${other.min!==undefined ? `min="${other.min}"` : ``} 
      ${other.max!==undefined ? `max="${other.max}"` : ``} 
      ${other.defaultVal!==undefined ? `value="${other.defaultVal}"` : ''}
      name="${name}" 
      id="${name}" 
      placeholder="${placeholder}" 
      autocomplete="off" 
      spellcheck="false" 
      autocapitalize="off"
      >
      <button class="icon large" data-increase aria-label="Increase Input" type="button">
          <svg focusable="false" inert viewBox="0 0 24 24">
              <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z">
              </path>
          </svg>
      </button>
      <button class="icon large" data-decrease aria-label="Decrease Input" type="button">
          <svg focusable="false" inert viewBox="0 0 24 24">
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
              </path>
          </svg>
      </button>
  </div>
</div>`;
}
function getMoveToInnerHTML() {
  const rand = getRandID();
  const moveToX = { name : `moveTo_x_${rand}`, label: `moveTo X`, placeholder: 'Enter the x value ...', other: { step: 1, defaultVal: 0} };
  const moveToY = { name : `moveTo_y_${rand}`, label: `moveTo Y`, placeholder: 'Enter the y value ...', other: { step: 1, defaultVal: 0} };
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(moveToX.name,moveToX.label,moveToX.placeholder,moveToX.other)}
    ${getNumberInputHTML(moveToY.name,moveToY.label,moveToY.placeholder,moveToY.other)}
  </div>`;  
  return row1;
}
function getMoveToFormState(wrapper:HTMLElement) {
  const x = getNumberInput(wrapper,{ querySelector: 'input[name^="moveTo_x"]'},0,{ step: 1});
  const y = getNumberInput(wrapper,{ querySelector: 'input[name^="moveTo_y"]'},0,{ step: 1});
  return { x, y, type: 'moveTo' } as const;
}
function getLineToInnerHTML() {
  const rand = getRandID();
  const lineToX = { name : `lineTo_x_${rand}`, label: `lineTo X`, placeholder: 'Enter the x value ...', other: { step: 1, defaultVal: 0} };
  const lineToY = { name : `lineTo_y_${rand}`, label: `lineTo Y`, placeholder: 'Enter the y value ...', other: { step: 1, defaultVal: 0} };
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(lineToX.name,lineToX.label,lineToX.placeholder,lineToX.other)}
    ${getNumberInputHTML(lineToY.name,lineToY.label,lineToY.placeholder,lineToY.other)}
  </div>`;  
  return row1;
}
function getLineToFormState(wrapper:HTMLElement) {
  const x = getNumberInput(wrapper,{ querySelector: 'input[name^="lineTo_x"]'},0,{ step: 1});
  const y = getNumberInput(wrapper,{ querySelector: 'input[name^="lineTo_y"]'},0,{ step: 1});
  return { x, y, type: 'lineTo' } as const;
}
function getBezierCurveToInnerHTML() {
  const rand = getRandID();
  const bezierCurveTo_cp1x = { name : `bezierCurveTo_cp1x_${rand}`, label: `bezierCurveTo cp1x`, placeholder: 'Enter the cp1x value ...', other: { step: 1, defaultVal: 0}};
  const bezierCurveTo_cp1y = { name : `bezierCurveTo_cp1y_${rand}`, label: `bezierCurveTo cp1y`, placeholder: 'Enter the cp1y value ...', other: { step: 1, defaultVal: 0}};
  const bezierCurveTo_cp2x = { name : `bezierCurveTo_cp2x_${rand}`, label: `bezierCurveTo cp2x`, placeholder: 'Enter the cp2x value ...', other: { step: 1, defaultVal: 0}};
  const bezierCurveTo_cp2y = { name : `bezierCurveTo_cp2y_${rand}`, label: `bezierCurveTo cp2y`, placeholder: 'Enter the cp2y value ...', other: { step: 1, defaultVal: 0}};
  const bezierCurveTo_x = { name : `bezierCurveTo_x_${rand}`, label: `bezierCurveTo x`, placeholder: 'Enter the x value ...', other: { step: 1, defaultVal: 0}};
  const bezierCurveTo_y = { name : `bezierCurveTo_y_${rand}`, label: `bezierCurveTo y`, placeholder: 'Enter the y value ...', other: { step: 1, defaultVal: 0}};
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(bezierCurveTo_cp1x.name,bezierCurveTo_cp1x.label,bezierCurveTo_cp1x.placeholder,bezierCurveTo_cp1x.other)}
    ${getNumberInputHTML(bezierCurveTo_cp1y.name,bezierCurveTo_cp1y.label,bezierCurveTo_cp1y.placeholder,bezierCurveTo_cp1y.other)}
  </div>`;  
  const row2 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
  ${getNumberInputHTML(bezierCurveTo_cp2x.name,bezierCurveTo_cp2x.label,bezierCurveTo_cp2x.placeholder,bezierCurveTo_cp2x.other)}
  ${getNumberInputHTML(bezierCurveTo_cp2y.name,bezierCurveTo_cp2y.label,bezierCurveTo_cp2y.placeholder,bezierCurveTo_cp2y.other)}
</div>`;  
const row3 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
${getNumberInputHTML(bezierCurveTo_x.name,bezierCurveTo_x.label,bezierCurveTo_x.placeholder,bezierCurveTo_x.other)}
${getNumberInputHTML(bezierCurveTo_y.name,bezierCurveTo_y.label,bezierCurveTo_y.placeholder,bezierCurveTo_y.other)}
</div>`;  
return row1.concat(row2).concat(row3);
}
function getBezierCurveFormState(wrapper:HTMLElement) {
  const cp1x = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_cp1x"]'},0,{ step: 1});
  const cp1y = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_cp1y"]'},0,{ step: 1});
  const cp2x = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_cp2x"]'},0,{ step: 1});
  const cp2y = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_cp2y"]'},0,{ step: 1});
  const x = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_x"]'},0,{ step: 1});
  const y = getNumberInput(wrapper,{ querySelector: 'input[name^="bezierCurveTo_y"]'},0,{ step: 1});
  return { cp1x, cp1y, cp2x, cp2y, x, y, type: 'bezierCurveTo' } as const;
}
function getQuadraticCurveToInnerHTML() {
  const rand = getRandID();
  const quadraticCurveTo_cpx = { name : `quadraticCurveTo_cpx_${rand}`, label: `quadraticCurveTo cpX`, placeholder: 'Enter the cpx value ...', other: { step: 1, defaultVal: 0}};
  const quadraticCurveTo_cpy = { name : `quadraticCurveTo_cpy_${rand}`, label: `quadraticCurveTo cpY`, placeholder: 'Enter the cpy value ...', other: { step: 1, defaultVal: 0}};
  const quadraticCurveTo_x = { name : `quadraticCurveTo_x_${rand}`, label: `quadraticCurveTo X`, placeholder: 'Enter the x value ...', other: { step: 1, defaultVal: 0}};
  const quadraticCurveTo_y = { name : `quadraticCurveTo_y_${rand}`, label: `quadraticCurveTo Y`, placeholder: 'Enter the y value ...', other: { step: 1, defaultVal: 0}};
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(quadraticCurveTo_cpx.name,quadraticCurveTo_cpx.label,quadraticCurveTo_cpx.placeholder,quadraticCurveTo_cpx.other)}
    ${getNumberInputHTML(quadraticCurveTo_cpy.name,quadraticCurveTo_cpy.label,quadraticCurveTo_cpy.placeholder,quadraticCurveTo_cpy.other)}
  </div>`;  
  const row2 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
  ${getNumberInputHTML(quadraticCurveTo_x.name,quadraticCurveTo_x.label,quadraticCurveTo_x.placeholder,quadraticCurveTo_x.other)}
  ${getNumberInputHTML(quadraticCurveTo_y.name,quadraticCurveTo_y.label,quadraticCurveTo_y.placeholder,quadraticCurveTo_y.other)}
</div>`;
  return row1.concat(row2);
}
function getQuadraticCurveFormState(wrapper:HTMLElement) {
  const cpx = getNumberInput(wrapper,{ querySelector: 'input[name^="quadraticCurveTo_cpx"]'},0,{ step: 1});
  const cpy = getNumberInput(wrapper,{ querySelector: 'input[name^="quadraticCurveTo_cpy"]'},0,{ step: 1});
  const x = getNumberInput(wrapper,{ querySelector: 'input[name^="quadraticCurveTo_x"]'},0,{ step: 1});
  const y = getNumberInput(wrapper,{ querySelector: 'input[name^="quadraticCurveTo_y"]'},0,{ step: 1});
  return { cpx, cpy, x, y, type: 'quadraticCurveTo' } as const;
}
function getArcInnerHTML() {
  const rand = getRandID();
  const arc_x = { name : `arc_x_${rand}`, label: `arc X`, placeholder: 'Enter the x value...', other: { step: 1}};
  const arc_y = { name : `arc_y_${rand}`, label: `arc Y`, placeholder: 'Enter the y value...', other: { step: 1}};
  const arc_radius = { name : `arc_radius_${rand}`, label: `arc Radius`, placeholder: 'Enter the radius value ...', other: {min: 0, step: 1, defaultVal: 50}};
  const arc_startAngle = { name : `arc_startAngle_${rand}`, label: `arc Start Angle`, placeholder: 'Enter the start angle value ...', other: {min: 0, max: 360, step: 1, defaultVal: 0}};
  const arc_endAngle = { name : `arc_endAngle_${rand}`, label: `arc End Angle`, placeholder: 'Enter the end angle value ...', other: {min: 0, max: 360, step: 1, defaultVal: 360}};
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(arc_x.name,arc_x.label,arc_x.placeholder,arc_x.other)}
    ${getNumberInputHTML(arc_y.name,arc_y.label,arc_y.placeholder,arc_y.other)}
  </div>`;  
  const row2 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
  ${getNumberInputHTML(arc_startAngle.name,arc_startAngle.label,arc_startAngle.placeholder,arc_startAngle.other)}
  ${getNumberInputHTML(arc_endAngle.name,arc_endAngle.label,arc_endAngle.placeholder,arc_endAngle.other)}
</div>`;
const row3 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
${getNumberInputHTML(arc_radius.name,arc_radius.label,arc_radius.placeholder,arc_radius.other)}
<div class="grow-1">
  <label class="checkbox">
    <input type="checkbox" class="info" name="arc_counterClockWise_${rand}" id="arc_counterClockWise_${rand}">
    CounterClockwise
    </label>
</div>
</div>`; 
  return row1.concat(row2).concat(row3);
}
function getArcFormState(wrapper:HTMLElement) {
  const x = getNumberInput(wrapper,{ querySelector: 'input[name^="arc_x"]'},0,{ step: 1});
  const y = getNumberInput(wrapper,{ querySelector: 'input[name^="arc_y"]'},0,{ step: 1});
  const radius = getNumberInput(wrapper,{ querySelector: 'input[name^="arc_radius"]'},50,{ step: 1, min: 0});
  const startAngle = getNumberInput(wrapper,{ querySelector: 'input[name^="arc_startAngle"]'},0,{ step: 1, min: 0, max: 360});
  const endAngle = getNumberInput(wrapper,{ querySelector: 'input[name^="arc_endAngle"]'},360,{ step: 1, min: 0, max: 360});
  const counterClockwise = getCheckboxInput(wrapper,{ querySelector: 'input[name^="arc_counterClockWise"]'},false);
  return { x, y, radius, startAngle, endAngle, counterClockwise, type: 'arc' } as const;
}
function getArcToInnerHTML() {
  const rand = getRandID();
  const arcTo_x1 = { name : `arcTo_x1_${rand}`, label: `arcTo x1`, placeholder: 'Enter the x1 value...', other: { defaultVal: 1}};
  const arcTo_y1 = { name : `arcTo_y1_${rand}`, label: `arcTo y1`, placeholder: 'Enter the y1 value...', other: { defaultVal: 1}};
  const arcTo_x2 = { name : `arcTo_x2_${rand}`, label: `arcTo x2`, placeholder: 'Enter the x2 value...', other: { defaultVal: 1 }};
  const arcTo_y2 = { name : `arcTo_y2_${rand}`, label: `arcTo y2`, placeholder: 'Enter the y2 value...', other: { defaultVal: 1 }};
  const arcTo_radius = { name : `arcTo_radius_${rand}`, label: `arcTo Radius`, placeholder: 'Enter the radius value...', other: {min: 0, step: 1, defaultVal: 50 }};
  const row1 = /*html*/`<div class="flex-row gap-3 align-center">
    ${getNumberInputHTML(arcTo_x1.name,arcTo_x1.label,arcTo_x1.placeholder,arcTo_x1.other)}
    ${getNumberInputHTML(arcTo_y1.name,arcTo_y1.label,arcTo_y1.placeholder,arcTo_y1.other)}
  </div>`;  
  const row2 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
  ${getNumberInputHTML(arcTo_x2.name,arcTo_x2.label,arcTo_x2.placeholder,arcTo_x2.other)}
  ${getNumberInputHTML(arcTo_y2.name,arcTo_y2.label,arcTo_y2.placeholder,arcTo_y2.other)}
  </div>`;
  const row3 = /*html*/`<div class="flex-row gap-3 align-center mt-1">
  ${getNumberInputHTML(arcTo_radius.name,arcTo_radius.label,arcTo_radius.placeholder,arcTo_radius.other)}
  </div>`; 
return row1.concat(row2).concat(row3);
}
function getArcToFormState(wrapper:HTMLElement) {
  const x1 = getNumberInput(wrapper,{ querySelector: 'input[name^="arcTo_x1"]'},1,{ step: 1});
  const y1 = getNumberInput(wrapper,{ querySelector: 'input[name^="arcTo_y1"]'},1,{ step: 1});
  const x2 = getNumberInput(wrapper,{ querySelector: 'input[name^="arcTo_x2"]'},1,{ step: 1 });
  const y2 = getNumberInput(wrapper,{ querySelector: 'input[name^="arcTo_y2"]'},1,{ step: 1 });
  const radius = getNumberInput(wrapper,{ querySelector: 'input[name^="arcTo_radius"]'},50,{ step: 1, min: 0 });
  return { x1, y1, x2, y2, radius, type: 'arcTo' } as const;
}
function getPathOperationHTML(type:PathOperationType,innerHTML:string) {
  const randID = getRandID();
return /*html*/`<div data-path-operation class="p-md mt-2" style="border: 2px solid var(--text-primary); border-radius: 0.5rem;" data-drag-el="" data-drag-container="path-operations-container"
id="${type}_${randID}"
data-type="${type}"
>
  <div class="flex-row justify-between align-center" style="padding-bottom: 2px;">
    <div tabindex="0" class="drag-container" data-drag="#${type}_${randID}">
      <svg class="custom-survey t-normal drag" style="transform: rotate(90deg);" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"/></svg>
    </div>
    <div class="flex-row gap-3" style="flex-shrink: 0">
      <button data-delete-operation type="button" class="small icon-text filled error">
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
        DELETE
      </button>
      <button type="button" class="small icon-text text warning" data-hide-show data-el="#${type}_input_container_${randID}">
        <svg data-arrow focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
        <span data-hide>HIDE</span>
        <span data-show hidden>SHOW</span>
      </button>
    </div>
  </div>
  <div class="mt-1" id="${type}_input_container_${randID}">
      ${innerHTML}
  </div>
</div>`;
}
function deletePathOperation(this:HTMLElement,e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div[data-path-operation]');
  const form = this.closest<HTMLFormElement>('form');
  if (wrapper&&form){
    wrapper.remove();
    updatePathCanvas(form);
  }
}
function getPathFormState(form:HTMLFormElement) {
  const arr:(ReturnType<typeof getMoveToFormState>|ReturnType<typeof getLineToFormState>|ReturnType<typeof getBezierCurveFormState>|ReturnType<typeof getQuadraticCurveFormState>|ReturnType<typeof getArcFormState>|ReturnType<typeof getArcToFormState>)[] = [];
  const wrapper = form.querySelector<HTMLDivElement>('#path-operations-container');
  const fillColor = getColorInput(form,'draw-path-fill-color',getDefaultPrimaryColor());
  const strokeColor = getColorInput(form,'draw-path-stroke-color',getDefaultSecondaryColor());
  const fillOpacity = getRangeInput(form,'draw-path-fill-opacity',1,{min:0,max:1,step:0.01})
  const strokeOpacity = getRangeInput(form,'draw-path-stroke-opacity',1,{min:0,max:1,step:0.01});
  const transparentStroke = getCheckboxInput(form,{querySelector: 'input[name^="stroke_transparent"]'},false);
  const transparentFill = getCheckboxInput(form,{querySelector: 'input[name^="fill_transparent"]'},false);
  if (wrapper) {  
    const pathOperationsWrappers = Array.from(wrapper.querySelectorAll<HTMLDivElement>('div[data-path-operation]'));
    pathOperationsWrappers.forEach((div) => {
      const type = div.getAttribute('data-type');
      switch (type) {
        case 'moveTo': {
          arr.push(getMoveToFormState(div));
          break;
        } 
        case 'lineTo': {
          arr.push(getLineToFormState(div));
          break;
        } 
        case 'getBezierCurveTo': {
          arr.push(getBezierCurveFormState(div));
          break;
        } 
        case 'quadraticCurveTo': {
          arr.push(getQuadraticCurveFormState(div));
          break;
        } 
        case 'arc': {
          arr.push(getArcFormState(div));
          break;
        } 
        case 'arcTo': {
          arr.push(getArcToFormState(div));
          break;
        } 
        default: {
          break;
        }
      }
    })
  }
  const other = getSharedInputValues(form);
  return { 
    fillColor,
    strokeColor,
    fillOpacity,
    strokeOpacity,
    arr,
    transparentStroke,
    transparentFill,
    ...other
  };
}
function updatePathCanvas(form:HTMLFormElement) {
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  const formState = getPathFormState(form);
  if(canvas) {
    if (formState.arr.length&&!!!(formState.transparentFill===true&&formState.transparentStroke===true)) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        var currentX = 0;
        var currentY = 0;
        var maxX = 0;
        var maxY = 0;
        clearCanvas(canvas);
        for (let obj of formState.arr) {
          switch (obj.type) {
            case 'moveTo': {
              const useObj = obj as ReturnType<typeof getMoveToFormState>;
              currentX = useObj.x;
              currentY = useObj.y;
              break;
            }
            case 'lineTo': {
              const useObj = obj as ReturnType<typeof getLineToFormState>;
              currentX = useObj.x;
              currentY = useObj.y;
              break;
            }
            case 'bezierCurveTo': {
              const useObj = obj as ReturnType<typeof getBezierCurveFormState>;
              currentX = useObj.x;
              currentY = useObj.y;
              break;
            }
            case 'quadraticCurveTo': {
              const useObj = obj as ReturnType<typeof getQuadraticCurveFormState>;
              currentX = useObj.x;
              currentY = useObj.y;
              break;
            }
            case 'arc': {
              const useObj = obj as ReturnType<typeof getArcFormState>;
              // Not Correct
              currentX = useObj.x;
              currentY = useObj.y;
              break;
            }
            case 'arcTo': {
              const useObj = obj as ReturnType<typeof getArcToFormState>;
              // Not Correct
              currentX = useObj.x2;
              currentY = useObj.y2;
              break;
            }
            default: {
              break;
            }
          }
          maxX = Math.max(currentX,maxX);
          maxY = Math.max(currentY,maxY);
        }
        setCanvasWidthAndHeight(canvas,{ width: maxX, height: maxY });
        ctx.beginPath();
        setCanvasRenderingProperties(ctx,formState);
        ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
        ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
        for (let obj of formState.arr) {
          switch (obj.type) {
            case 'moveTo': {
              const useObj = obj as ReturnType<typeof getMoveToFormState>;
              ctx.moveTo(useObj.x,useObj.y);
              break;
            }
            case 'lineTo': {
              const useObj = obj as ReturnType<typeof getLineToFormState>;
              ctx.lineTo(useObj.x,useObj.y);
              break;
            }
            case 'bezierCurveTo': {
              const useObj = obj as ReturnType<typeof getBezierCurveFormState>;
              ctx.bezierCurveTo(useObj.cp1x,useObj.cp1y,useObj.cp2x,useObj.cp2y,useObj.x,useObj.y);
              break;
            }
            case 'quadraticCurveTo': {
              const useObj = obj as ReturnType<typeof getQuadraticCurveFormState>;
              ctx.quadraticCurveTo(useObj.cpx,useObj.cpy,useObj.x,useObj.y);
              break;
            }
            case 'arc': {
              const useObj = obj as ReturnType<typeof getArcFormState>;
              ctx.arc(useObj.x,useObj.y,useObj.radius,useObj.startAngle,useObj.endAngle,useObj.counterClockwise);
              break;
            }
            case 'arcTo': {
              const useObj = obj as ReturnType<typeof getArcToFormState>;
              ctx.arcTo(useObj.x1,useObj.y1,useObj.x2,useObj.y2,useObj.radius);
              break;
            }
            default: {
              break;
            }
          }
        }
        if (!!!formState.transparentFill) ctx.fill();
        if (!!!formState.transparentStroke) ctx.stroke();
        ctx.save();
      } 
    } else {
      clearCanvas(canvas);
    }
  }
}
function onPathFormChange(this:HTMLFormElement,_e:Event) {
  updatePathCanvas(this);
}
function handleAddPathOperationButtonClick(this:HTMLButtonElement,e:Event) {
  const wrapper = document.getElementById('path-operations-container');
  const fieldset = this.closest<HTMLFieldSetElement>('fieldset');
  if (fieldset&&wrapper) {
    const typeRadio = fieldset.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    if (typeRadio) {
      const type = typeRadio.value;
      if (VALID_PATH_OPERATION.has(type)) {
        var innerHTML:string='';
        switch (type as PathOperationType) {
          case 'moveTo': {
            innerHTML = getMoveToInnerHTML();
            break;
          }
          case 'lineTo': {
            innerHTML = getLineToInnerHTML();
            break;
          }
          case 'bezierCurveTo': {
            innerHTML = getBezierCurveToInnerHTML();
            break;
          }
          case 'quadraticCurveTo': {
            innerHTML = getQuadraticCurveToInnerHTML();
            break;
          }
          case 'arc': {
            innerHTML = getArcInnerHTML();
            break;
          }
          case 'arcTo': {
            innerHTML = getArcToInnerHTML();
            break;
          }
          default: {
            break;
          }
        }
        if (innerHTML.length) {
          const pathOperationHTML = getPathOperationHTML(type as PathOperationType,innerHTML);
          wrapper.insertAdjacentHTML('beforeend',pathOperationHTML);
          onNewContentLoaded(wrapper);
        }
      }
    }
  } 
}
function handlePathFormReset(this:HTMLFormElement,_e:Event) {
  const wrapper = document.getElementById('path-operations-container');
  if (wrapper) wrapper.innerHTML = '';
  updatePathCanvas(this);
}

function onPathFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getPathFormState(this);
  if (formState.arr.length) {
    ADDED_ELEMENTS.push({ ...formState, elementType: 'path', renderStats: {width: 100, height: 100 }});
    this.reset();
    updateTopLevelSprite();
  }
}


/* ---------------------- Edit Ellipse ---------------------------------------------------- */
function getEllipseFormState(form:HTMLFormElement) {
  const radiusX = getNumberInput(form,'draw-ellipse-radius-x',50,{min: 0, step: 1});
  const radiusY = getNumberInput(form,'draw-ellipse-radius-y',50,{min: 0, step: 1});
  const rotation = getNumberInput(form,'draw-ellipse-rotation',0,{min: 0, step: 1, max: 360 });
  const startAngle = getNumberInput(form,'draw-ellipse-start-angle',0,{min: 0, step: 1, max: 360});;
  const endAngle = getNumberInput(form,'draw-ellipse-end-angle',0,{min: 0, step: 1, max: 360});
  const fillColor = getColorInput(form,'draw-ellipse-fill-color',getDefaultPrimaryColor());
  const strokeColor = getColorInput(form,'draw-ellipse-stroke-color',getDefaultSecondaryColor());
  const fillOpacity = getRangeInput(form,'draw-ellipse-fill-opacity',1,{min:0,step:0.01,max:1});
  const strokeOpacity = getRangeInput(form,'draw-ellipse-stroke-opacity',1,{min:0,step:0.01,max:1});
  const transparentStroke = getCheckboxInput(form,{querySelector: 'input[name^="stroke_transparent"]'},false);
  const transparentFill = getCheckboxInput(form,{querySelector: 'input[name^="fill_transparent"]'},false);
  const other = getSharedInputValues(form);
  return {
    radiusX,
    radiusY,
    rotation,
    startAngle,
    endAngle,
    fillColor,
    strokeColor,
    fillOpacity,
    strokeOpacity,
    transparentFill,
    transparentStroke,
    ...other
  };
}
function updateEllipseCanvas(form:HTMLFormElement) {
  const formState = getEllipseFormState(form);
  const canvas = document.querySelector(`output[form="${form.id}"] canvas`) as HTMLCanvasElement|null;
  if(canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (!!!(formState.transparentFill===true&&formState.transparentStroke===true)) {
        clearCanvas(canvas);
        setCanvasWidthAndHeight(canvas,{ width: formState.radiusX*2, height: formState.radiusY*2 });
        ctx.beginPath();
        ctx.fillStyle = getHexAlpha(formState.fillColor,formState.fillOpacity);
        ctx.strokeStyle = getHexAlpha(formState.strokeColor,formState.strokeOpacity);
        setCanvasRenderingProperties(ctx,formState);
        ctx.ellipse(canvas.width/2,canvas.height/2,formState.radiusX,formState.radiusY,degreeToRadians(formState.rotation),degreeToRadians(formState.startAngle),degreeToRadians(formState.endAngle));
        ctx.stroke();
        if (!!!formState.transparentFill) ctx.fill();
        if (!!!formState.transparentStroke) ctx.save();
      } else {
        clearCanvas(canvas);
      }
    }
  }
}
function onEllipseFormChange(this:HTMLFormElement,_e:Event) {
  updateEllipseCanvas(this);
  
}
function onEllipseFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  const formState = getEllipseFormState(this);
  ADDED_ELEMENTS.push({ ...formState, elementType: 'ellipse', renderStats: {width: formState.radiusX*2, height: formState.radiusY*2 }});
  this.reset();
  updateTopLevelSprite();
}


/* ----------------------------------------- General onLoad / onUnload / Download / Change Top Level Sprite -------------------------------------- */
function onFormResetUpdateSelect(this:HTMLFormElement) {
  const selectInput = this.querySelector('div.select-menu > input[type="text"][hidden]');
  if (selectInput) selectInput.dispatchEvent(new Event('change'));
}

function deleteAddedSpriteElement(this:HTMLButtonElement,e:Event) {
  const container = this.closest<HTMLDivElement>('div[data-added-element]');
  if (container) {
    const index = container.getAttribute('data-index');
    if (index && isValidNumber(parseInt(index))) {
      const ind = parseInt(index);
      if (ind===0) {
        ADDED_ELEMENTS.shift();
      } else if (ind===ADDED_ELEMENTS.length-1) {
        ADDED_ELEMENTS.pop();
      } else {
        for (let i = ind; i < ADDED_ELEMENTS.length-1; i++) {
          ADDED_ELEMENTS[i] = ADDED_ELEMENTS[i+1];
        }
        ADDED_ELEMENTS.pop();
      } 
      updateTopLevelSprite();
    }
  }
}

function updateTopLevelSprite() {
  const addedElements = document.getElementById('added-css-sprite-elements') as HTMLElement|null;
  const mainCanvas = document.getElementById('canvas-container>canvas') as HTMLCanvasElement|null;
  if (addedElements&&mainCanvas) {
    clearCanvas(mainCanvas);
    addedElements.innerHTML = '';
    for (let i = 0; i < ADDED_ELEMENTS.length; i++) {
      if (i===0) {
        const title = document.createElement('p');
        title.className='h6 bold bb-main mt-2';
        title.innerText = 'Added Sprite Elements';
        addedElements.append(title);
      }
      const container = document.createElement('div');
      container.className="mt-2 p-md";
      container.style.cssText="border: 2px solid var(--text-primary); border-radius: 0.5rem; position:relative;";
      container.setAttribute('data-index',String(i));
      container.setAttribute('data-added-element','');
      const button = document.createElement('button');
      button.className="error filled icon small";
      button.style.cssText="position:absolute;top:3px;left:3px;";
      button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>');
      button.addEventListener('click',deleteAddedSpriteElement);
      container.append(button);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const obj = ADDED_ELEMENTS[i];
        switch (obj.elementType) {
          case 'svg': {
            const useObj: ReturnType<typeof getSvgFormState> & {elementType: 'svg'} & {renderStats: WidthAndHeight} = obj;
            setCanvasRenderingProperties(ctx,useObj);
            ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
            ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
            setCanvasWidthAndHeight(canvas,{ width: useObj.widthAndHeight, height: useObj.widthAndHeight });
            if (useObj.paths) {
              for (let pathObj of useObj.paths) {
                const path = new Path2D(pathObj.path);
                ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
                ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
                ctx.stroke(path); 
                ctx.fill(path);
              }
            }
            break;
          }
          case 'image': {
            const useObj: ReturnType<typeof getImageFormState> & {elementType: 'image'} & {renderStats: WidthAndHeight} = obj;
            if (useObj.url) {
              const image = new Image();
              image.src = useObj.url;
              setCanvasWidthAndHeight(canvas,{ width: useObj.width, height: useObj.height });
              image.width = useObj.width;
              image.height = useObj.height;
              image.onload = () => {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.drawImage(image,0,0);
              }
              image.onerror = (e) => {
                console.error(e);
              }
            }
            break;
          }
          case 'text': {
            const useObj: ReturnType<typeof getTextFormState> & {elementType: 'text'} & {renderStats: WidthAndHeight} = obj;
            setCanvasRenderingProperties(ctx,useObj);
            ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
            ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
            if (useObj.text.length) {
              clearCanvas(canvas);
              ctx.beginPath();
              setCanvasRenderingProperties(ctx,useObj);
              ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
              ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
              if (ctx.hasOwnProperty('textRendering')) (ctx as any).textRendering = useObj.textRendering;
              if (ctx.hasOwnProperty('wordSpacing')) (ctx as any).wordSpacing = useObj.wordSpacing;
              ctx.font = `${useObj.textSize}px ${useObj.fontFamily}`;
              const measuredText = ctx.measureText(useObj.text);
              setCanvasWidthAndHeight(canvas,{ width: measuredText.width + useObj.wordSpacing*useObj.text.split(' ').length, height: (measuredText.fontBoundingBoxAscent - measuredText.fontBoundingBoxDescent) });
              ctx.fillText(useObj.text,0,0,undefined);
              ctx.strokeText(useObj.text,0,0,undefined);
              ctx.save();
            }
            break;
          }
          case 'rectangle':{
            const useObj: ReturnType<typeof getRectangleFormState> & {elementType: 'rectangle'} & {renderStats: WidthAndHeight} = obj;
            setCanvasRenderingProperties(ctx,useObj);
            ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
            ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
            setCanvasWidthAndHeight(canvas,{ width: useObj.width, height: useObj.height });
            ctx.beginPath(); 
            if (useObj.rounded) {
              ctx.roundRect(0,0,useObj.width,useObj.height,[useObj.topLeftBorderRadius,useObj.topRightBorderRadius,useObj.bottomRightBorderRadius,useObj.bottomLeftBorderRadius]); 
            } else {
              ctx.rect(useObj.lineWidth,0,useObj.width,useObj.height);
            }
            ctx.stroke();
            ctx.fill();
            break;
          }
          case 'path': {
            const useObj: ReturnType<typeof getPathFormState> & {elementType: 'path'} & {renderStats: WidthAndHeight} = obj;
            setCanvasRenderingProperties(ctx,useObj);
            ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
            ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
            ctx.beginPath();
            for (let obj of useObj.arr) {
              switch (obj.type) {
                case 'moveTo': {
                  const useObj = obj as ReturnType<typeof getMoveToFormState>;
                  ctx.moveTo(useObj.x,useObj.y);
                  break;
                }
                case 'lineTo': {
                  const useObj = obj as ReturnType<typeof getLineToFormState>;
                  ctx.lineTo(useObj.x,useObj.y);
                  break;
                }
                case 'bezierCurveTo': {
                  const useObj = obj as ReturnType<typeof getBezierCurveFormState>;
                  ctx.bezierCurveTo(useObj.cp1x,useObj.cp1y,useObj.cp2x,useObj.cp2y,useObj.x,useObj.y);
                }
                case 'quadraticCurveTo': {
                  const useObj = obj as ReturnType<typeof getQuadraticCurveFormState>;
                  ctx.quadraticCurveTo(useObj.cpx,useObj.cpy,useObj.x,useObj.y);
                  break;
                }
                case 'arc': {
                  const useObj = obj as ReturnType<typeof getArcFormState>;
                  ctx.arc(useObj.x,useObj.y,useObj.radius,useObj.startAngle,useObj.endAngle,useObj.counterClockwise);
                  break;
                }
                case 'arcTo': {
                  const useObj = obj as ReturnType<typeof getArcToFormState>;
                  ctx.arcTo(useObj.x1,useObj.y1,useObj.x2,useObj.y2,useObj.radius);
                  break;
                }
                default: {
                  break;
                }
              }
            }
            ctx.fill();
            ctx.stroke();
            break;
          }
          case 'ellipse': {
            const useObj: ReturnType<typeof getEllipseFormState> & {elementType: 'ellipse'} & {renderStats: WidthAndHeight} = obj;
            setCanvasRenderingProperties(ctx,useObj);
            ctx.fillStyle = getHexAlpha(useObj.fillColor,useObj.fillOpacity);
            ctx.strokeStyle = getHexAlpha(useObj.strokeColor,useObj.strokeOpacity);
            setCanvasWidthAndHeight(canvas,{ width: useObj.radiusX*2, height: useObj.radiusY*2 });
            ctx.beginPath();
            ctx.ellipse(canvas.width/2,canvas.height/2,useObj.radiusX,useObj.radiusY,degreeToRadians(useObj.rotation),degreeToRadians(useObj.startAngle),degreeToRadians(useObj.endAngle));
            ctx.stroke();
            ctx.fill();
            break;
          }
          default: {
            break;
          }
        }
        container.append(canvas);
        addedElements.append(canvas);
      }

    }
  }
}

function downloadCssSprite() {

}

export function onCssSpriteBuilderLoad() {
  document.addEventListener('htmx:afterRequest',afterSearchIconsRequest,true);
  const backgroundForm = getBackgroundForm();
  const svgForm = getSvgForm();
  const imageForm = getImageForm();
  const textForm = getTextForm();
  const rectangleForm = getRectangleForm();
  const pathForm = getPathForm();
  const ellipseForm = getEllipseForm();
  if(backgroundForm) {
    backgroundForm.addEventListener('submit',onBackgroundFormSubmit,true);
    backgroundForm.addEventListener('change',onBackgroundFormChange);
    backgroundForm.addEventListener('input',onBackgroundFormChange);
    backgroundForm.addEventListener('reset',onFormResetUpdateSelect);
    updateBackgroundCanvas(backgroundForm);
  }
  if (svgForm) {
    svgForm.addEventListener('submit',onSvgFormSubmit,true);
    svgForm.addEventListener('change',onSvgFormChange);
    svgForm.addEventListener('input',onSvgFormChange);
    svgForm.addEventListener('reset',onFormResetUpdateSelect);
    updateSvgCanvas(svgForm);
  }
  if (imageForm) {
    imageForm.addEventListener('submit',onImageFormSubmit,true);
    imageForm.addEventListener('media-upload-complete',onImageFormChange);
    imageForm.addEventListener('reset',onFormResetUpdateSelect);
    updateImageCanvas(imageForm);
  }
  if (textForm) {
    textForm.addEventListener('submit',onTextFormSubmit,true);
    textForm.addEventListener('change',onTextFormChange);
    textForm.addEventListener('input',onTextFormChange);
    textForm.addEventListener('reset',onFormResetUpdateSelect);
    updateTextCanvas(textForm);
  }
  if (rectangleForm) {
    rectangleForm.addEventListener('submit',onRectangleFormSubmit,true);
    rectangleForm.addEventListener('change',onRectangleFormChange);
    rectangleForm.addEventListener('input',onRectangleFormChange);
    rectangleForm.addEventListener('reset',onFormResetUpdateSelect);
    updateRectangleCanvas(rectangleForm);
  }
  if (pathForm) {
    pathForm.addEventListener('submit',onPathFormSubmit,true);
    pathForm.addEventListener('change',onPathFormChange);
    pathForm.addEventListener('input',onPathFormChange);
    pathForm.addEventListener('reset',handlePathFormReset);
    pathForm.addEventListener('reset',onFormResetUpdateSelect);
    // Add Drag and button listeners
    const addOperationButton = pathForm.querySelector<HTMLButtonElement>('button#add-path-operation-button');
    if (addOperationButton) addOperationButton.addEventListener('click',handleAddPathOperationButtonClick);
    const pathOperationsContainer = document.getElementById('path-operations-container') as HTMLDivElement|null;
    if(pathOperationsContainer) {
      const deleteButtons = Array.from(pathOperationsContainer.querySelectorAll('button[data-delete-operation]'));
      deleteButtons.forEach((b) => b.addEventListener('click',deletePathOperation))
    }
    updatePathCanvas(pathForm);
  }
  if (ellipseForm) {
    ellipseForm.addEventListener('submit',onEllipseFormSubmit,true);
    ellipseForm.addEventListener('change',onEllipseFormChange);
    ellipseForm.addEventListener('input',onEllipseFormChange);
    ellipseForm.addEventListener('reset',onFormResetUpdateSelect);
    updateEllipseCanvas(ellipseForm);
  }
  const lineDashDetails = document.querySelectorAll<HTMLDetailsElement>('details[data-line-dash-details]');
  lineDashDetails.forEach((el) => {
    const addLineDashButton = el.querySelector<HTMLButtonElement>('button[data-add-line-dash]');
    const removeLineDashButton = el.querySelector<HTMLButtonElement>('button[data-remove-line-dash]');
    const addLineDashSegmentButton = el.querySelector<HTMLButtonElement>('button[data-add-line-dash-segment]'); // data-add-line-dash-segment
    const removeLineDashSegmentButtons = Array.from(el.querySelectorAll<HTMLButtonElement>('button[data-remove-line-dash-segment]')); // data-add-line-dash-segment
    if (addLineDashButton) addLineDashButton.addEventListener('click',addLineDash);
    if (removeLineDashButton) removeLineDashButton.addEventListener('click',removeLineDash);
    if (addLineDashSegmentButton) addLineDashSegmentButton.addEventListener('click',addLineDashSegment);
    removeLineDashSegmentButtons.forEach((b) => {
      b.addEventListener('click',removeLineDashSegment);
    });
  })
  const finalSubmitButton = document.getElementById('download-css-sprite');
  if (finalSubmitButton) finalSubmitButton.addEventListener('click',downloadCssSprite);
}

export function onCssSpriteBuilderUnload() {
  while (ADDED_ELEMENTS.length) {
    ADDED_ELEMENTS.pop();
  }
  CURRENT_PATHS = undefined;
}
