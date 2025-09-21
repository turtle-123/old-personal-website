const EXAMPLE_RADIAL_GRADIENT_ID = 'example-radial-gradient';
const EXAMPLE_LINEAR_GRADIENT_ID = 'example-linear-gradient';
import { getCsrfToken } from "../shared";
import { 
  addStopListeners,
  addTransformOnClick,
  addTransformListeners,
  getStopInput,
  getRandomColor,
  insertIntoGradientElement, 
  VALID_HEX_REGEX,
  isValidNumber,
  createElement
} from "./sharedCreateSVG";


type VALID_SPREAD_METHOD = 'pad'|'reflect'|'repeat';
const isValidSpreadMethod = (s:string): s is VALID_SPREAD_METHOD => Boolean((new Set(['pad','reflect','repeat'])).has(s));
type STOP = { offset: number, stopColor: string, stopOpacity: number };

type MatrixTransform = {
  type: 'matrix',
  a: number, 
  b: number, 
  c: number, 
  d: number, 
  e: number, 
  f: number 
};
type TranslateTransform = {
  type: 'translate',
  x: number, 
  y: number
};
type ScaleTransform = {
  type: 'scale',
  x: number, 
  y: number
};
type RotateTransform = {
  type: 'rotate',
  a: number, 
  useDefaultOrigin: boolean,
  x?: number, 
  y?: number
};
type SkewXTransform = {
  type: 'skewX',
  a: number
};
type SkewYTransform = {
  type: 'skewY',
  a: number
};
type TransformArray = (MatrixTransform|TranslateTransform|ScaleTransform|RotateTransform|SkewXTransform|SkewYTransform)[];
type LinearGradientObj = {
  x1: number, 
  x2: number, 
  y1: number, 
  y2: number,  
  spreadMethod: 'pad'|'reflect'|'repeat', 
  transforms: TransformArray,
  stops: STOP[]
};
type RadialGradientObj = {
  cx: number,  
  cy: number,  
  fx: number, 
  fy: number,
  fr: number, 
  r: number,
  spreadMethod: 'pad'|'reflect'|'repeat', 
  transforms: TransformArray,
  stops: STOP[]
};


/* ------------------------------------- Main Form ----------------------------------------*/
function changeGradientType(this:HTMLFormElement,e:Event) {
  const els = getRelevantCreateGradientElements();
  const checkedRadio = this.querySelector<HTMLInputElement>('input[name="gradient-type"]:checked');
  if (checkedRadio) {
    const value = checkedRadio.value;
    if(value==="linear"){
      if (els.createRadialGradientForm) els.createRadialGradientForm.setAttribute('hidden','');
      if (els.createLinearGradientForm) els.createLinearGradientForm.removeAttribute('hidden');
      if (els.rectToChange) els.rectToChange.setAttribute('fill',`url(#${EXAMPLE_LINEAR_GRADIENT_ID})`);
    } else if (value==="radial"){
      if (els.createLinearGradientForm) els.createLinearGradientForm.setAttribute('hidden','');
      if (els.createRadialGradientForm) els.createRadialGradientForm.removeAttribute('hidden');
      if (els.rectToChange) els.rectToChange.setAttribute('fill',`url(#${EXAMPLE_RADIAL_GRADIENT_ID})`);
    }
  }
}

function getRelevantCreateGradientElements() {
  /**
   * Listen for changes and $(input[name="gradient-type"]) to get new radient type
   */
  const createGradientForm=document.getElementById('create-gradient-form') as HTMLFormElement|null;
  const createRadialGradientForm=document.getElementById('create-gradient-radial') as HTMLFormElement|null;
  const createLinearGradientForm=document.getElementById('create-gradient-linear') as HTMLFormElement|null;
  const rectToChange = document.getElementById('rect-to-change') as SVGRectElement|null;
  return {
    createGradientForm,
    createRadialGradientForm,
    createLinearGradientForm,
    rectToChange
  };
} 
function getSpreadStopsAndTransforms(fieldset:HTMLFieldSetElement,stopList:HTMLDivElement,transformsDiv:HTMLDivElement){
  const obj:{spreadMethod:VALID_SPREAD_METHOD,stops:STOP[], transforms: TransformArray} = { stops: [], transforms: [],spreadMethod:'pad'};
  if (fieldset){
    const checkedRadio = fieldset.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    if (checkedRadio) {
      const spreadMethodValue = checkedRadio.value;
      if (isValidSpreadMethod(spreadMethodValue)) obj.spreadMethod = spreadMethodValue; 
    }
  }
  if (stopList){
    const stops = Array.from(stopList.querySelectorAll<HTMLDivElement>('div[data-stop]'));
    stops.forEach((stop)=>{
      const offsetInput = stop.querySelector<HTMLInputElement>('input[type="number"][id^="stop_off"]');
      const opacityInput = stop.querySelector<HTMLInputElement>('input[type="number"][id^="stop_opacity"]');
      const colorInput = stop.querySelector<HTMLInputElement>('input[type="color"]');
      if(offsetInput&&opacityInput&&colorInput) {
        const offsetNum = parseFloat(offsetInput.value);
        const opacityNum = parseFloat(opacityInput.value);
        const colorVal = colorInput.value;
        if (offsetNum>=0&&offsetNum<=100&&opacityNum>=0&&opacityNum<=1&&VALID_HEX_REGEX.test(colorVal)) {
          if (obj.stops) obj.stops.push({ offset: offsetNum, stopOpacity: opacityNum, stopColor: colorVal });
        }
      }
    })
  }
  if (transformsDiv){
    const transforms = Array.from(transformsDiv.querySelectorAll<HTMLDivElement>('div[data-transform]'));
    transforms.forEach((container) => {
      const type = container.getAttribute('data-type');
      if (type==="matrix") {
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        const b = container.querySelector<HTMLInputElement>('input[type="number"][id^="b_"]');
        const c = container.querySelector<HTMLInputElement>('input[type="number"][id^="c_"]');
        const d = container.querySelector<HTMLInputElement>('input[type="number"][id^="d_"]');
        const e = container.querySelector<HTMLInputElement>('input[type="number"][id^="e_"]');
        const f = container.querySelector<HTMLInputElement>('input[type="number"][id^="f_"]');
        if(a&&b&&c&&d&&e&&f){
          const aVal = parseFloat(a.value);
          const bVal = parseFloat(b.value);
          const cVal = parseFloat(c.value);
          const dVal = parseFloat(d.value);
          const eVal = parseFloat(e.value);
          const fVal = parseFloat(f.value);
          if (
            !!!isNaN(aVal)&&isFinite(aVal)&&
            !!!isNaN(bVal)&&isFinite(bVal)&&
            !!!isNaN(cVal)&&isFinite(cVal)&&
            !!!isNaN(dVal)&&isFinite(dVal)&&
            !!!isNaN(eVal)&&isFinite(eVal)&&
            !!!isNaN(fVal)&&isFinite(fVal)
          ) {
            if (obj.transforms) obj.transforms.push({type:'matrix', a:aVal,b:bVal,c:cVal,d:dVal,e:eVal,f:fVal});
          }
        }
      } else if (type==="translate"){
        const x = container.querySelector<HTMLInputElement>('input[type="number"][id^="x_"]');
        const y = container.querySelector<HTMLInputElement>('input[type="number"][id^="y_"]');
        if (x&&y) {
          const xVal = parseFloat(x.value);
          const yVal = parseFloat(y.value);
          if (!!!isNaN(xVal)&&isFinite(xVal)&&!!!isNaN(yVal)&&isFinite(yVal)){
            if (obj.transforms) obj.transforms.push({type:'translate',x:xVal,y:yVal});
          }
        }
      } else if (type==="scale"){
        const x = container.querySelector<HTMLInputElement>('input[type="number"][id^="x_"]');
        const y = container.querySelector<HTMLInputElement>('input[type="number"][id^="y_"]');
        if (x&&y) {
          const xVal = parseFloat(x.value);
          const yVal = parseFloat(y.value);
          if (!!!isNaN(xVal)&&isFinite(xVal)&&!!!isNaN(yVal)&&isFinite(yVal)){
            if (obj.transforms) obj.transforms.push({type:'scale',x:xVal,y:yVal});
          }
        }
      } else if (type==="rotate"){
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
        const x = container.querySelector<HTMLInputElement>('input[type="number"][id^="x_"]');
        const y = container.querySelector<HTMLInputElement>('input[type="number"][id^="y_"]');
        if(a&&checkbox&&x&&y){
          const aVal = parseFloat(a.value);
          const checked = checkbox.checked;
          const xVal = parseFloat(x.value);
          const yVal = parseFloat(y.value);
          if (checked&&(!!!x.hasAttribute('disabled')||!!!y.hasAttribute('disabled'))) {
            x.setAttribute('disabled','');
            y.setAttribute('disabled','');
            const xParent = x.parentElement;
            const yParent = y.parentElement;
            if (xParent&&yParent) {
              const buttons = Array.from(xParent.querySelectorAll<HTMLButtonElement>('button')).concat(Array.from(yParent.querySelectorAll<HTMLButtonElement>('button')));
              buttons.forEach(b=>b.setAttribute('disabled',''));
            }
          } else if (!!!checked&&(x.hasAttribute('disabled')||y.hasAttribute('disabled'))) {
            x.removeAttribute('disabled');
            y.removeAttribute('disabled');
            const xParent = x.parentElement;
            const yParent = y.parentElement;
            if (xParent&&yParent) {
              const buttons = Array.from(xParent.querySelectorAll<HTMLButtonElement>('button')).concat(Array.from(yParent.querySelectorAll<HTMLButtonElement>('button')));
              buttons.forEach(b=>b.removeAttribute('disabled'));
            }
          }
          if (!!!isNaN(aVal)&&isFinite(aVal)&&checked&&aVal>=-360&&aVal<=360) {
            if (obj.transforms) obj.transforms.push({type:'rotate',a:aVal,useDefaultOrigin:true,x:undefined,y:undefined});
          } else if (!!!checked&&!!!isNaN(aVal)&&isFinite(aVal)
          &&aVal>=-360&&aVal<=360&&
          !!!isNaN(xVal)&&isFinite(xVal)&&
          !!!isNaN(yVal)&&isFinite(yVal)
          ) {
            if (obj.transforms) obj.transforms.push({type:'rotate',a:aVal,useDefaultOrigin:false,x:xVal,y:yVal});
          }
        }
      } else if (type==="skewX"){
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        if(a){
          const aVal = parseFloat(a.value);
          if(!!!isNaN(aVal)&&isFinite(aVal)&&aVal>=-360&&aVal<=360){
            if (obj.transforms) obj.transforms.push({type:'skewX',a:aVal});
          }
        }
      } else if (type==="skewY"){
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        if(a){
          const aVal = parseFloat(a.value);
          if(!!!isNaN(aVal)&&isFinite(aVal)&&aVal>=-360&&aVal<=360){
            if (obj.transforms) obj.transforms.push({type:'skewY',a:aVal});
          }
        }
      }
    })
  }
  return obj;
}


/* ------------------------------------- Radial Form ----------------------------------------*/
function getRadialGradientFormElements() {
  const cx = document.getElementById('radial-gradient-cx') as HTMLInputElement|null; 
  const cy = document.getElementById('radial-gradient-cy') as HTMLInputElement|null; 
  const fx = document.getElementById('radial-gradient-fx') as HTMLInputElement|null; 
  const fy = document.getElementById('radial-gradient-fy') as HTMLInputElement|null; 
  const fr = document.getElementById('radial-gradient-fr') as HTMLInputElement|null; 
  const r = document.getElementById('radial-gradient-r') as HTMLInputElement|null; 
  const radialSpreadRadiusFieldset = document.getElementById('radial-spread-rad-fs') as HTMLFieldSetElement|null;
  const radialAddTransformButton = document.getElementById('radial-add-transform') as HTMLButtonElement|null;
  const radialTransformsDiv = document.getElementById('radial-transforms-container') as HTMLDivElement|null;
  const radialGradientEl = document.getElementById(EXAMPLE_RADIAL_GRADIENT_ID) as SVGRadialGradientElement|null;
  const radialStopList = document.getElementById('radial-stop-list') as HTMLDivElement|null;
  return {
    cx,
    cy,
    fx,
    fy,
    fr,
    r,
    radialSpreadRadiusFieldset,
    radialAddTransformButton,
    radialTransformsDiv,
    radialGradientEl,
    radialStopList
  }; 
}
function getHandleRadialFormChange(attribute:'cx'|'cy'|'fx'|'fy'|'fr'|'r'|'fs') {
  const func = function (this: HTMLInputElement|HTMLFieldSetElement) {
    const radialEls = getRadialGradientFormElements();
    if (attribute!=='fs') {
      const newValInit = (this as HTMLInputElement).value;
      const numNewVal = Number(newValInit);
      var newVal = numNewVal;
      if (attribute==='r'||attribute==='fr') {
        newVal = Math.min(100,Math.max(0,numNewVal));
      } else {
        newVal =  Math.min(100,Math.max(-100,numNewVal));
      }
      if (radialEls.radialGradientEl) radialEls.radialGradientEl.setAttribute(attribute,String(newVal).concat('%'));
    } else if (attribute==='fs') {
      const checkedRadio = (this as HTMLFieldSetElement).querySelector<HTMLInputElement>('input[type="radio"]:checked');
      if (checkedRadio) {
        const newVal = checkedRadio.value;
        if (isValidSpreadMethod(newVal)) {
          if (radialEls.radialGradientEl) radialEls.radialGradientEl.setAttribute('spreadMethod',String(newVal));
        }
      }
    }
  }
  return func;
}
async function handleSubmitRadialGradientForm(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const radialGradientEls = getRadialGradientFormElements();
  const obj:Partial<RadialGradientObj> = {};
  if (radialGradientEls.cx)obj.cx = Math.min(Math.max(parseFloat(radialGradientEls.cx.value),-100),100);
  if (radialGradientEls.cy)obj.cy = Math.min(Math.max(parseFloat(radialGradientEls.cy.value),-100),100);
  if (radialGradientEls.fr)obj.fr = Math.min(Math.max(parseFloat(radialGradientEls.fr.value),0),100);
  if (radialGradientEls.r)obj.r = Math.min(Math.max(parseFloat(radialGradientEls.r.value),0),100);
  if (radialGradientEls.fx)obj.fx = Math.min(Math.max(parseFloat(radialGradientEls.fx.value),-100),100);
  if (radialGradientEls.fy)obj.fy = Math.min(Math.max(parseFloat(radialGradientEls.fy.value),-100),100);

  if (!!!isValidNumber(obj.cx)) return;
  if (!!!isValidNumber(obj.cy)) return;
  if (!!!isValidNumber(obj.fr)) return;
  if (!!!isValidNumber(obj.r)) return;
  if (!!!isValidNumber(obj.fx)) return;
  if (!!!isValidNumber(obj.fy)) return;

  if (radialGradientEls.radialSpreadRadiusFieldset&&radialGradientEls.radialStopList&&radialGradientEls.radialTransformsDiv) {
    const { spreadMethod, stops, transforms } = getSpreadStopsAndTransforms(radialGradientEls.radialSpreadRadiusFieldset,radialGradientEls.radialStopList,radialGradientEls.radialTransformsDiv);
    obj.spreadMethod = spreadMethod;
    obj.stops = stops;
    obj.transforms = transforms;
    await createSavedGradientFromState(obj as RadialGradientObj);
    resetRadialGradientForm();
  }
}
function resetRadialGradientForm() {
  const html = document.querySelector('html');
  const radialGradientEls = getRadialGradientFormElements();
  if (radialGradientEls.cx)radialGradientEls.cx.value = '50';
  if (radialGradientEls.cy)radialGradientEls.cy.value = '50';
  if (radialGradientEls.fx)radialGradientEls.fx.value = '50';
  if (radialGradientEls.fy)radialGradientEls.fy.value = '50';
  if (radialGradientEls.fr)radialGradientEls.fr.value = '0';
  if (radialGradientEls.r)radialGradientEls.r.value = '50';
  if (radialGradientEls.radialSpreadRadiusFieldset) {
    const radios = Array.from(radialGradientEls.radialSpreadRadiusFieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    radios.forEach((radio) => {
      if (radio.value==='pad') radio.checked = true;
      else radio.checked = false; 
    })
  }
  if (radialGradientEls.radialTransformsDiv) radialGradientEls.radialTransformsDiv.innerHTML='';
  if (radialGradientEls.radialGradientEl) {
    radialGradientEls.radialGradientEl.setAttribute('cx','50%');
    radialGradientEls.radialGradientEl.setAttribute('cy','50%');
    radialGradientEls.radialGradientEl.setAttribute('fx','50%');
    radialGradientEls.radialGradientEl.setAttribute('fy','50%');
    radialGradientEls.radialGradientEl.setAttribute('fr','0%');
    radialGradientEls.radialGradientEl.setAttribute('r','50%');
    radialGradientEls.radialGradientEl.setAttribute('spreadMethod','pad');
    radialGradientEls.radialGradientEl.removeAttribute('gradientTransform');
    radialGradientEls.radialGradientEl.innerHTML = '';
  }
  if (radialGradientEls.radialStopList) {
    radialGradientEls.radialStopList.innerHTML='';
    const defaultRadialStops = [
      { offset: 0, stopColor: '#FF0000', stopOpacity: 1},
      { offset: 100, stopColor: '#0000FF', stopOpacity: 1},
    ];
    defaultRadialStops.forEach((stop) => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg','stop');
      const defaultOffset = stop.offset;
      const defaultOpacity = stop.stopOpacity;
      const stopID = 'stop_'.concat(window.crypto.randomUUID());
      const defaultColor = stop.stopColor;
      stopElement.setAttribute('offset',String(defaultOffset).concat('%'));
      stopElement.setAttribute('stop-opacity',String(defaultOpacity));
      stopElement.setAttribute('stop-color',stop.stopColor);
      stopElement.setAttribute('id',stopID);
      (radialGradientEls.radialStopList as HTMLDivElement).append(getStopInput(stopID,defaultColor,defaultOffset,defaultOpacity));        
      if (radialGradientEls.radialGradientEl) insertIntoGradientElement(radialGradientEls.radialGradientEl,stopElement);
    })
  }
  document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
}
function handleResetRadialGradientForm(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  resetRadialGradientForm();
}

/* ------------------------------------- Linear Form ----------------------------------------*/
function getLinearGradientFormElements() {
  const x1 = document.getElementById('linear-gradient-x1') as HTMLInputElement|null;
  const x2 = document.getElementById('linear-gradient-x2') as HTMLInputElement|null;
  const y1 = document.getElementById('linear-gradient-y1') as HTMLInputElement|null;
  const y2 = document.getElementById('linear-gradient-y2') as HTMLInputElement|null;
  const linearSpreadRadiusFieldset = document.getElementById('linear-spread-rad-fs') as HTMLFieldSetElement|null;
  const linearAddTransformButton = document.getElementById('linear-add-transform') as HTMLButtonElement|null;
  const linearTransformsDiv = document.getElementById('linear-transforms-container') as HTMLDivElement|null;
  const linearGradientEl = document.getElementById(EXAMPLE_LINEAR_GRADIENT_ID) as SVGLinearGradientElement|null;
  const linearStopList = document.getElementById('linear-stop-list') as HTMLDivElement|null;
  return {
    x1,
    x2,
    y1,
    y2,
    linearSpreadRadiusFieldset,
    linearAddTransformButton,
    linearTransformsDiv,
    linearGradientEl,
    linearStopList
  };
}
async function handleSubmitLinearGradientForm(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const linearGradientEls = getLinearGradientFormElements();
  const obj:Partial<LinearGradientObj> = {};
  if (linearGradientEls.x1)obj.x1 = Math.min(Math.max(parseFloat(linearGradientEls.x1.value),-100),100);
  if (linearGradientEls.x2)obj.x2 = Math.min(Math.max(parseFloat(linearGradientEls.x2.value),-100),100);
  if (linearGradientEls.y1)obj.y1 = Math.min(Math.max(parseFloat(linearGradientEls.y1.value),-100),100);
  if (linearGradientEls.y2)obj.y2 = Math.min(Math.max(parseFloat(linearGradientEls.y2.value),-100),100);
  if (!!!isValidNumber(obj.x1)) return;
  if (!!!isValidNumber(obj.x2)) return;
  if (!!!isValidNumber(obj.y1)) return;
  if (!!!isValidNumber(obj.y2)) return;
  if (linearGradientEls.linearSpreadRadiusFieldset&&linearGradientEls.linearStopList&&linearGradientEls.linearTransformsDiv) {
    const { spreadMethod, stops, transforms } = getSpreadStopsAndTransforms(linearGradientEls.linearSpreadRadiusFieldset,linearGradientEls.linearStopList,linearGradientEls.linearTransformsDiv);
    obj.spreadMethod = spreadMethod;
    obj.stops = stops;
    obj.transforms = transforms;
    await createSavedGradientFromState(obj as LinearGradientObj);
    resetLinearGradientForm();
  }
}

function resetLinearGradientForm(){
  const html = document.querySelector('html');
  const linearGradientEls = getLinearGradientFormElements();
  if (linearGradientEls.x1) linearGradientEls.x1.value = '0';
  if (linearGradientEls.x2) linearGradientEls.x2.value = '100';
  if (linearGradientEls.y1) linearGradientEls.y1.value = '0';
  if (linearGradientEls.y2) linearGradientEls.y2.value = '0';
  if (linearGradientEls.linearSpreadRadiusFieldset) {
    const radios = Array.from(linearGradientEls.linearSpreadRadiusFieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    radios.forEach((radio) => {
      if (radio.value==='pad') radio.checked = true;
      else radio.checked = false; 
    });
  }
  if (linearGradientEls.linearTransformsDiv) linearGradientEls.linearTransformsDiv.innerHTML = '';
  if (linearGradientEls.linearGradientEl) {
    linearGradientEls.linearGradientEl.setAttribute('x1','0%');
    linearGradientEls.linearGradientEl.setAttribute('x2','100%');
    linearGradientEls.linearGradientEl.setAttribute('y1','0%');
    linearGradientEls.linearGradientEl.setAttribute('y2','0%');
    linearGradientEls.linearGradientEl.setAttribute('spreadMethod','pad');
    linearGradientEls.linearGradientEl.removeAttribute('gradientTransform');
    linearGradientEls.linearGradientEl.innerHTML = '';
  }
  if (linearGradientEls.linearStopList) {
    linearGradientEls.linearStopList.innerHTML='';
    const defaultLinearStops = [
      { offset: 0, stopColor: '#0000FF', stopOpacity: 1},
      { offset: 50, stopColor: '#FF0000', stopOpacity: 1},
      { offset: 100, stopColor: '#00FF00', stopOpacity: 1},
    ];
    defaultLinearStops.forEach((stop) => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg','stop');
      const defaultOffset = stop.offset;
      const defaultOpacity = stop.stopOpacity;
      const stopID = 'stop_'.concat(window.crypto.randomUUID());
      const defaultColor = stop.stopColor;
      stopElement.setAttribute('offset',String(defaultOffset).concat('%'));
      stopElement.setAttribute('stop-opacity',String(defaultOpacity));
      stopElement.setAttribute('stop-color',stop.stopColor);
      stopElement.setAttribute('id',stopID);
      (linearGradientEls.linearStopList as HTMLDivElement).append(getStopInput(stopID,defaultColor,defaultOffset,defaultOpacity));        
      if (linearGradientEls.linearGradientEl) insertIntoGradientElement(linearGradientEls.linearGradientEl,stopElement);
    })
  }
  document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
}

function handleResetLinearGradientForm(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  e.stopPropagation();
  resetLinearGradientForm();
}


function getHandleLinearFormChange(attribute:'x1'|'x2'|'y1'|'y2'|'fs') {
  const func = function (this: HTMLInputElement|HTMLFieldSetElement) {
    const linearEls = getLinearGradientFormElements();
    if (attribute!=='fs') {
      const newValInit = (this as HTMLInputElement).value;
      const numNewVal = Number(newValInit);
      const newVal = Math.min(100,Math.max(-100,numNewVal));
      if (linearEls.linearGradientEl) linearEls.linearGradientEl.setAttribute(attribute,String(newVal).concat('%'));
    } else if (attribute==='fs') {
      const checkedRadio = (this as HTMLFieldSetElement).querySelector<HTMLInputElement>('input[type="radio"]:checked');
      if (checkedRadio) {
        const newVal = checkedRadio.value;
        if (isValidSpreadMethod(newVal)) {
          if (linearEls.linearGradientEl) linearEls.linearGradientEl.setAttribute('spreadMethod',String(newVal));
        }
      }
    }
  }
  return func;
}

export function updateForm(form: HTMLFormElement) {
  const els = getRelevantCreateGradientElements();
  const id = form.id;
  if (id==='create-gradient-radial') {
    if(els.createRadialGradientForm) {
      addStopListeners(els.createRadialGradientForm);
      addTransformListeners(els.createRadialGradientForm);
    }
  } else if (id === 'create-gradient-linear') {
    if(els.createLinearGradientForm) {
      addStopListeners(els.createLinearGradientForm);
      addTransformListeners(els.createLinearGradientForm);
    }
  }
}

function handleSubmitCreateGradientForm(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
}



/* ---------------------------------------- Save Gradients ------------------------------- */
function createStop({offset,stopColor,stopOpacity}:STOP) {
  const stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
  stop.setAttribute('offset',offset.toString().concat('%'));
  stop.setAttribute('stop-color',stopColor);
  stop.setAttribute('stop-opacity',stopOpacity.toString());
  return stop;
}
function getTransformStringFromTransformArray(arr:TransformArray) {
  var s = '';
  arr.forEach((obj) => {
    if (obj.type==='matrix') {
      s+=` matrix(${obj.a} ${obj.b} ${obj.c} ${obj.d} ${obj.e} ${obj.f})`;
    } else if (obj.type==='translate') {
      s+=` translate(${obj.x} ${obj.y})`;
    } else if (obj.type==='scale') {
      s+=` scale(${obj.x}, ${obj.y})`;
    } else if (obj.type==='rotate') {
      if (obj.useDefaultOrigin) s+=` rotate(${obj.a})`;
      else s+=` rotate(${obj.a}, ${obj.x}, ${obj.y})`;
    } else if (obj.type==='skewX') {
      s+=` skewX(${obj.a})`;
    } else if (obj.type==='skewY') {
      s+=` skewY(${obj.a})`;
    }
  })
  return s.length ? s.slice(1) : s;
}
function createLinearGradient(obj:LinearGradientObj) {
  const linearGradient = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
  linearGradient.setAttribute('x1',obj.x1.toString().concat('%'));
  linearGradient.setAttribute('x2',obj.x2.toString().concat('%'));
  linearGradient.setAttribute('y1',obj.y1.toString().concat('%'));
  linearGradient.setAttribute('y2',obj.y2.toString().concat('%'));
  linearGradient.setAttribute('spreadMethod',obj.spreadMethod);
  const transformString = getTransformStringFromTransformArray(obj.transforms);
  if (transformString.length) linearGradient.setAttribute('gradientTransform',transformString);

  return linearGradient;
}
function createRadialGradient(obj:RadialGradientObj) {
  const radialGradient = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
  radialGradient.setAttribute('cx',obj.cx.toString().concat('%'));
  radialGradient.setAttribute('cy',obj.cy.toString().concat('%'));
  radialGradient.setAttribute('fx',obj.fx.toString().concat('%'));
  radialGradient.setAttribute('fy',obj.fy.toString().concat('%'));
  radialGradient.setAttribute('fr',obj.fr.toString().concat('%'));
  radialGradient.setAttribute('r',obj.r.toString().concat('%'));
  radialGradient.setAttribute('spreadMethod',obj.spreadMethod);
  const transformString = getTransformStringFromTransformArray(obj.transforms);
  if (transformString.length) radialGradient.setAttribute('gradientTransform',transformString);

  return radialGradient;
}
function getRect(name:string) {
  const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
  rect.setAttribute('width','100%');
  rect.setAttribute('height','100%');
  rect.setAttribute('x','0');
  rect.setAttribute('y','0');
  rect.setAttribute('rx','0');
  rect.setAttribute('ry','0');
  rect.setAttribute('fill',`url('#${name}')`);
  return rect;
}
function getCopyGradientClick(s:string) {
  const func = function () {
    navigator.clipboard.writeText(s)
    .then(()=>{})
    .catch((error)=>console.error(error));
  }
  return func;
}
function deleteGradient(this:HTMLButtonElement,e:Event) {
  const container = this.closest<HTMLDivElement>('div[data-grad-container]')
  if (container) container.remove();
}
function getCopyGradientButton(name:string) {
  const button = createElement({type:'button', className:'toggle-button small', attributes: {'data-snackbar': '', 'data-selem': '#copy-nack-svg-href'}, innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CopyAll"><path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path></svg>'});
  button.addEventListener('click',getCopyGradientClick(name));
  return button;
}
function getDeleteGradientButton(svg_id: string|undefined) {
  const obj:any = {type:'button', className:'toggle-button small', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'};
  if (svg_id) {
    obj.attributes = { 'hx-delete': `/projects/create-gradient/${svg_id}`, 'hx-trigger': 'click', 'hx-target': 'closest div[data-grad-container]', 'hx-swap': 'outerHTML' };
  }
  const button = createElement(obj);
  if (!!!svg_id) button.addEventListener('click',deleteGradient);
  return button;
}
async function createSavedGradientFromState(obj:LinearGradientObj|RadialGradientObj) {
  const wrapper = createElement({type:'div', className:'flex-column align-center gap-1', style:'width:auto; padding:4px; border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-grad-container': ''}});
  const savedRadialGradientsDiv = document.getElementById("saved-radial-gradients") as HTMLDivElement|null;
  const savedLinearGradientsDiv = document.getElementById("saved-linear-gradients") as HTMLDivElement|null;
  const name = 'gradient_'.concat(window.crypto.randomUUID());
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','110px');
  svg.setAttribute('height','110px');
  svg.style.cssText = "border: 3px ridge var(--text-primary);";
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  const type = Boolean((obj as any).cx!==undefined&&savedRadialGradientsDiv) ? 'radial' : Boolean((obj as any).x1!==undefined&&savedLinearGradientsDiv) ? 'linear' : undefined;
  if ((obj as any).cx!==undefined&&savedRadialGradientsDiv) {
    const radialObj = obj as RadialGradientObj; 
    const radialGradient = createRadialGradient(radialObj);
    radialGradient.setAttribute('id',name);
    radialObj.stops.sort((a,b)=> a.offset-b.offset).forEach((obj) =>{
      radialGradient.append(createStop(obj));
    });
    defs.append(radialGradient);
    svg.append(defs);
    const rect = getRect(name);
    svg.append(rect);
  } else if ((obj as any).x1!==undefined&&savedLinearGradientsDiv){
    const linearObj = obj as LinearGradientObj;
    const linearGradient = createLinearGradient(linearObj);
    linearGradient.setAttribute('id',name);
    linearObj.stops.sort((a,b)=> a.offset-b.offset).forEach((obj) =>{
      linearGradient.append(createStop(obj));
    });
    defs.append(linearGradient);
    svg.append(defs);
    const rect = getRect(name);
    svg.append(rect);
  }
  var svg_id:undefined|string = undefined;
  if (type) {
    try {
      fetch('/create-gradient',{ method:'POST', body: JSON.stringify({svg_obj:obj,type,svg:svg.outerHTML}),  headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() } })
      .then((res) => { // Should return { id } where id is the svg id in the database
        if (res.status!==200) throw new Error('Network request');
        return res.json();
      })
      .then((res) => {
        const { id }:{id: string} = res;
        svg_id = id;
      })
      .catch(e => console.error(e))
    } catch (error) {
      console.error(error);
    }
  }
  const actionsDiv = createElement({type:'div',className:'flex-row align-center justify-between', style:'max-width:120px;'});
  actionsDiv.append(getCopyGradientButton(name),getDeleteGradientButton(svg_id));
  wrapper.append(svg,actionsDiv);
  if ((obj as any).cx!==undefined&&savedRadialGradientsDiv) {
    savedRadialGradientsDiv.append(wrapper);
  } else if ((obj as any).x1!==undefined&&savedLinearGradientsDiv) {
    savedLinearGradientsDiv.append(wrapper);
  }

}



/* ---------------------------------------- on Load ---------------------------------------- */
export function onLoadCreateGradient() {
  /* Main Form Listeners */
  const els = getRelevantCreateGradientElements();
  if (els.createGradientForm) {
    els.createGradientForm.addEventListener('change',changeGradientType);
    els.createGradientForm.addEventListener('submit',handleSubmitCreateGradientForm);
  }
  if (els.createLinearGradientForm) {
    els.createLinearGradientForm.addEventListener('submit',handleSubmitLinearGradientForm);
    els.createLinearGradientForm.addEventListener('reset',handleResetLinearGradientForm);
    addStopListeners(els.createLinearGradientForm);
    addTransformListeners(els.createLinearGradientForm);
  }
  if (els.createRadialGradientForm) {
    els.createRadialGradientForm.addEventListener('submit',handleSubmitRadialGradientForm);
    els.createRadialGradientForm.addEventListener('reset',handleResetRadialGradientForm);
    addStopListeners(els.createRadialGradientForm);
    addTransformListeners(els.createRadialGradientForm);
  }
  /* Radial Form Listeners */ 
  const radialEls = getRadialGradientFormElements();
  if (radialEls.cx) radialEls.cx.addEventListener('change',getHandleRadialFormChange('cx'));
  if (radialEls.cy) radialEls.cy.addEventListener('change',getHandleRadialFormChange('cy'));
  if (radialEls.fx) radialEls.fx.addEventListener('change',getHandleRadialFormChange('fy'));
  if (radialEls.fy) radialEls.fy.addEventListener('change',getHandleRadialFormChange('fx'));
  if (radialEls.fr) radialEls.fr.addEventListener('change',getHandleRadialFormChange('fr'));
  if (radialEls.fr) radialEls.fr.addEventListener('change',getHandleRadialFormChange('fr'));
  if (radialEls.r) radialEls.r.addEventListener('change',getHandleRadialFormChange('r'));
  if (radialEls.radialSpreadRadiusFieldset) radialEls.radialSpreadRadiusFieldset.addEventListener('change',getHandleRadialFormChange('fs'));
  if (radialEls.radialAddTransformButton) radialEls.radialAddTransformButton.addEventListener('click',addTransformOnClick)

  /* Linear Form Listeners */ 
  const linearEls = getLinearGradientFormElements();
  if (linearEls.x1) linearEls.x1.addEventListener('change',getHandleLinearFormChange('x1'));
  if (linearEls.x2) linearEls.x2.addEventListener('change',getHandleLinearFormChange('x2'));
  if (linearEls.y1) linearEls.y1.addEventListener('change',getHandleLinearFormChange('y1'));
  if (linearEls.y2) linearEls.y2.addEventListener('change',getHandleLinearFormChange('y2'));
  if (linearEls.linearSpreadRadiusFieldset) linearEls.linearSpreadRadiusFieldset.addEventListener('change',getHandleLinearFormChange('fs'));
  if (linearEls.linearAddTransformButton) linearEls.linearAddTransformButton.addEventListener('click',addTransformOnClick);
  setHideShowButtonListeners();
}




function onHideShowButtonClick(this:HTMLButtonElement,e:Event) {
  const button = this;
  const span = button.querySelector<HTMLSpanElement>('span');
  const svg = button.querySelector<SVGElement>('svg');
  const id = button.id;
  var containerToHide:undefined|null|HTMLElement = undefined;
  if (id==="hide-radial-transform-btn") {
    containerToHide = document.getElementById('radial-transforms-container') as HTMLElement|null;
  } else if (id==="hide-linear-transform-btn") {
    containerToHide = document.getElementById('linear-transforms-container') as HTMLElement|null;
  } else if(id==="hide-radial-stops-btn"){
    containerToHide = document.getElementById('radial-stop-list') as HTMLElement|null;
  } else if(id==="hide-linear-stops-btn"){
    containerToHide = document.getElementById('linear-stop-list') as HTMLElement|null;
  }
  if (button.classList.contains('warning')&&span&&svg&&containerToHide) {
    containerToHide.setAttribute('hidden','');
    svg.style.cssText="transform:rotate(180deg);";
    span.innerText="SHOW";
    button.classList.remove('warning');
    button.classList.add('success');
  } else if (button.classList.contains('success')&&span&&svg&&containerToHide){
    containerToHide.removeAttribute('hidden');
    svg.style.cssText="";
    span.innerText="HIDE";
    button.classList.remove('success');
    button.classList.add('warning');
  } 
}
function setHideShowButtonListeners() {
  const hideRadialTransformButton = document.getElementById('hide-radial-transform-btn') as HTMLButtonElement|null;
  const hideLinearTransformButton = document.getElementById('hide-linear-transform-btn') as HTMLButtonElement|null;
  const hideRadialStopsButton = document.getElementById('hide-radial-stops-btn') as HTMLButtonElement|null;
  const hideLinearStopsButton = document.getElementById('hide-linear-stops-btn') as HTMLButtonElement|null;
  if(hideRadialTransformButton&&hideLinearTransformButton&&hideRadialStopsButton&&hideLinearStopsButton){
    hideRadialTransformButton.addEventListener('click',onHideShowButtonClick);
    hideLinearTransformButton.addEventListener('click',onHideShowButtonClick);
    hideRadialStopsButton.addEventListener('click',onHideShowButtonClick);
    hideLinearStopsButton.addEventListener('click',onHideShowButtonClick);
  }
}