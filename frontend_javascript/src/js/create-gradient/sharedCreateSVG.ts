
import { updateForm } from '.';
export const VALID_HEX_REGEX = /^#[0-9A-F]{6}$/i;
export function isValidNumber(n:any) {
  return Boolean(typeof n==='number'&&!!!isNaN(n)&&isFinite(n));
}
export function getRandomColor(){return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})};

export function createElement({ type, className, style, attributes, innerText, innerHTML }: {type: keyof HTMLElementTagNameMap, className?: string, style?: string,innerText?: string, innerHTML?: string, attributes?: {[a: string]: string, }}) {
  const el = document.createElement(type);
  if(className)el.className = className;
  if(style)el.style.cssText = style;
  if(attributes) {
    const atts = Object.keys(attributes);
    for (let key of atts) {
      el.setAttribute(key,attributes[key as any]);
    }
  }
  if (innerText) {
    el.innerText=innerText;
  }
  if(innerHTML) {
    el.insertAdjacentHTML("afterbegin",innerHTML);
  }
  return el;
}

export function getIncreaseNumberInput(disabled:boolean=false) {
  const button = createElement({type: 'button', attributes: {type:'button', 'aria-label':'Increase Input', 'data-increase': ''}, className:'icon large'});
  button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg>')
  if(disabled) button.setAttribute('disabled','');
  return button;
}

export function getDecreaseNumberInput(disabled:boolean=false) {
  const button = createElement({type: 'button', attributes: {type:'button', 'aria-label':'Decrease Input', 'data-decrease': ''}, className:'icon large'});
  button.insertAdjacentHTML('afterbegin','<svg focusable="false" inert viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg>');
  if(disabled) button.setAttribute('disabled','');
  return button;
}

export function getNumberInput({id,  min, max, step=1, defaultValue, label, placeholder, disabled=false, required=false }:{id: string, placeholder?:string, min?:number, max?:number, label: string, defaultValue?: string, disabled?: boolean, required?:boolean, step?:number}) {
  const wrapperDiv = createElement({type:'div',className:"input-group block grow-1"});
  const labelEl = createElement({type:'label',attributes:{for:id},innerText: label});
  if (disabled) labelEl.classList.add('disabled');
  const innerDiv = createElement({type:'div', className:"mt-1 number-input medium"});
  const input = createElement({ type:'input', attributes: {type:'number',name:id,id:id,autocomplete: "off", spellcheck: "false", autocapitalize: "off"}})
  if (required) input.setAttribute('required','');
  const increaseButton = getIncreaseNumberInput();
  const decreaseButton = getDecreaseNumberInput();
  if (disabled) {
    increaseButton.setAttribute('disabled','');
    decreaseButton.setAttribute('disabled','');
    input.setAttribute('disabled','');
  }
  if (!!!isNaN(step)) input.setAttribute('step',String(step));
  if (!!!isNaN(min as any)) input.setAttribute('min',String(min));
  if (!!!isNaN(max as any)) input.setAttribute('max',String(max));
  if (defaultValue) input.setAttribute('value',defaultValue);
  if (placeholder) input.setAttribute('placeholder',placeholder);
  innerDiv.append(input,increaseButton,decreaseButton);
  wrapperDiv.append(labelEl,innerDiv);
  return wrapperDiv as HTMLDivElement;
}

export function getColorInput(defaultColor: string, id: string, label: string) {
  const wrapper = createElement({ type: 'div', className: 'block'});
  const labelEl = createElement({ type: 'label', innerText: label, attributes: {for: id}, className: 'body2'})
  const innerDiv = createElement({type:'div', className: 'flex-row align-center justify-begin gap-2', });
  const colorInput = createElement({type:'input',attributes:{type:'color',value:defaultColor, name:id,id:id},style:'margin-top:2px;'})
  const colorSpan = createElement({type:'span',className:'body2'});
  colorSpan.innerText=defaultColor;
  innerDiv.append(colorInput,colorSpan);
  wrapper.append(labelEl,innerDiv);
  return wrapper as HTMLInputElement;
}

/* --------------------------------------- Handle Stop Stuff ----------------------- */
export function insertIntoGradientElement(gradientEl:SVGLinearGradientElement|SVGRadialGradientElement,stopEl:SVGStopElement) {
  const stopElOffset = stopEl.getAttribute('offset');
  if(stopElOffset) {
    const numStopElOffset = parseFloat(stopElOffset.slice(0,stopElOffset.length-1));
    const gradientElChildren = Array.from(gradientEl.children);
    if (gradientElChildren.length&&!!!isNaN(numStopElOffset)&&isFinite(numStopElOffset)) {
      for (let i=0;i<gradientElChildren.length;i++) {
        const offset = gradientElChildren[i].getAttribute('offset');
        if (offset){
          const numOffset = parseFloat(offset.slice(0,offset.length-1));
          if (isFinite(numOffset)&&!!!isNaN(numOffset)) {
            if (numStopElOffset < numOffset) {
              gradientElChildren[i].insertAdjacentElement("beforebegin",stopEl);
              return;
            }
          }
        }
      }
      gradientEl.append(stopEl);
    } else {
      gradientEl.append(stopEl);
    } 
  }
}
export function onStopColorChange(this:HTMLInputElement,e:Event) {
  const id = this.id;
  const value = this.value;
  if (id&&VALID_HEX_REGEX.test(value)) {
    const stopID = id.replace('stop_color_','');
    const stopElement = document.getElementById(stopID) as SVGStopElement|null;
    if(stopElement) {
      stopElement.setAttribute('stop-color',value);
    }
  }
}
export function onStopOpacityChange(this:HTMLInputElement,e:Event) {
  const id = this.id;
  const value = this.value;
  const valNum = parseFloat(value);
  if (id&&!!!isNaN(valNum)&&isFinite(valNum)&&valNum>=0&&valNum<=1) {
    const stopID = id.replace('stop_opacity_','');
    const stopElement = document.getElementById(stopID) as SVGStopElement|null;
    if(stopElement) {
      stopElement.setAttribute('stop-opacity',value);
    }
  }
}
export function onStopOffsetChange(this:HTMLInputElement,e:Event){
  const id = this.id;
  const value = this.value;
  const valNum = parseFloat(value);
  if (id&&!!!isNaN(valNum)&&isFinite(valNum)&&valNum>=0&&valNum<=100) {
    const stopID = id.replace('stop_off_id_','');
    const stopElement = document.getElementById(stopID) as SVGStopElement|null;
    if(stopElement) {
      const gradientEl = stopElement.parentElement as SVGLinearGradientElement|SVGRadialGradientElement|null;
      if (gradientEl) {
        stopElement.setAttribute('offset',value.concat('%'));
        const stopElNew = stopElement.cloneNode(false) as SVGStopElement;
        stopElement.remove();
        insertIntoGradientElement(gradientEl,stopElNew);
      }
    }
  }
}
export function handleDeleteStop(this:HTMLButtonElement,e:Event) {
  const form = this.closest<HTMLFormElement>('form');
  const stopID = this.getAttribute('data-delete-stop');
  const editStopContainer = this.closest<HTMLDivElement>('div[data-stop]');
  if(form&&stopID&&editStopContainer) {
    const stopEl = document.getElementById(stopID) as SVGRadialGradientElement|SVGLinearGradientElement|null;
    if (stopEl) {
      editStopContainer.remove();
      stopEl.remove();
      updateForm(form);
    }
  }
}

export function getDeleteStopButton(s:string) {
  const button = createElement({type:'button', attributes: {type: 'button', 'data-delete-stop': s}, className:'icon medium'});
  const svg = '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
  button.insertAdjacentHTML("afterbegin",svg);
  return button;
}

export function getStopInput(stopID: string,defaultColor:string,defaultOffset:number,defaultOpacity:number) {
  const stopOffsetId = 'stop_off_id_'.concat(stopID);
  const colorInputId = 'stop_color_'.concat(stopID);
  const stopOpacityId = 'stop_opacity_'.concat(stopID);
  const wrapper = createElement({ type:'div', className:'flex-column w-100 gap-2 mt-1 p-md', attributes: {'data-stop': ''}, style:'border: 2px solid var(--divider); border-radius: 6px;' });
  const innerDiv1 = createElement({type:'div', className:'flex-row align-center justify-start gap-2 w-100'});
  const innerDiv2 = createElement({type:'div', className:'flex-row align-center justify-start gap-2 w-100 mt-1'});
  const div1 = getNumberInput({ id: stopOffsetId,min: 0, max: 100, label: 'Stop Offset:', defaultValue: String(defaultOffset) });
  const div2 = getColorInput(defaultColor,colorInputId,'Stop Color:');
  innerDiv1.append(div1,div2);
  const div3 = getNumberInput({ id: stopOpacityId, min: 0, max: 1, step: 0.01, label: 'Stop Opacity:', defaultValue: String(defaultOpacity) });
  const button = getDeleteStopButton(stopID);
  innerDiv2.append(div3,button);
  wrapper.append(innerDiv1,innerDiv2);
  return wrapper as HTMLDivElement;
}

export function addStopInput(this:HTMLButtonElement,e:Event) {
  const html = document.querySelector('html');
  const form = this.closest<HTMLFormElement>('form');
  const stopContainer = this.closest<HTMLDivElement>('div[data-stop-container]');
  if(stopContainer&&html&&form){
    const id = form.id;
    const stopList = stopContainer.querySelector('div[data-stop-list]');
    if(stopList&&id){
      if (id==='create-gradient-linear'||id==='create-gradient-radial') {
        var el: undefined|SVGRadialGradientElement|SVGLinearGradientElement|null = undefined;
        if (id==="create-gradient-linear") {
          el = document.getElementById('example-linear-gradient') as SVGLinearGradientElement|null;
        } else if (id==="create-gradient-radial") { 
          el = document.getElementById('example-radial-gradient') as SVGRadialGradientElement|null;
        }
        if (el) {
          const stopElement = document.createElementNS('http://www.w3.org/2000/svg','stop');
          const defaultOffset = Math.floor(Math.random()*100);
          const defaultOpacity = Number(Math.random().toFixed(2));
          const stopID = 'stop_'.concat(window.crypto.randomUUID());
          const defaultColor = getRandomColor();
          stopElement.setAttribute('offset',String(defaultOffset).concat('%'));
          stopElement.setAttribute('stop-opacity',String(defaultOpacity));
          stopElement.setAttribute('stop-color',defaultColor);
          stopElement.setAttribute('id',stopID);
          stopList.append(getStopInput(stopID,defaultColor,defaultOffset,defaultOpacity));        
          insertIntoGradientElement(el,stopElement);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        }
      }
    }
  }
}

/**
 * Get all the stop inputs inside a HTML form
 * @param form 
 */
export function getStopsFromForm(form:HTMLFormElement) {
  const stopWrapper = form.querySelector('div[data-stop-container]');
  if(stopWrapper){
    const stops = Array.from(stopWrapper.querySelectorAll<HTMLDivElement>('div[data-stop]'));
    return stops; 
  }
  return null;
}

export function addStopListeners(form: HTMLFormElement) {
  const stopWrapper = form.querySelector('div[data-stop-container]');
  if (stopWrapper) {
    const addStopButton = stopWrapper.querySelector<HTMLButtonElement>('button[data-add-stop]');
    if (addStopButton) addStopButton.addEventListener('click',addStopInput);
    const stops = getStopsFromForm(form);
    if (stops&&stops.length) {
      stops.forEach((stop)=>{
        const deleteStopButton = stop.querySelector<HTMLButtonElement>('button[data-delete-stop]'); 
        const stopColorInput = stop.querySelector<HTMLInputElement>('input[type="color"]');
        const stopOffsetInput = stop.querySelector<HTMLInputElement>('input[type="number"][id^="stop_off_id_"]');
        const stopOpacityInput = stop.querySelector<HTMLInputElement>('input[type="number"][id^="stop_opacity_"]');
        if (deleteStopButton) deleteStopButton.addEventListener('click',handleDeleteStop); 
        if (stopColorInput) stopColorInput.addEventListener('change',onStopColorChange); 
        if (stopOffsetInput)stopOffsetInput.addEventListener('change',onStopOffsetChange); 
        if (stopOpacityInput)stopOpacityInput.addEventListener('change',onStopOpacityChange); 
      })
    }
  }
}

/* --------------------------------------- Handle Set Stuff ----------------------- */



/* ---------------------------------------- Handle Transform Stuff ---------------- */
const LINEAR_TRANSFORMS_CONTAINER_ID = 'linear-transforms-container';
const RADIAL_TRANSFORM_CONTAINER_ID = 'radial-transforms-container';
function getMatrixTransformInput() {
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'matrix'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'Matrix Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const ids = ['a_','b_','c_','d_','e_','f_'].map((s)=>s.concat(window.crypto.randomUUID()));  
  const a = getNumberInput({id:ids[0],label: 'a:', defaultValue:'1', step: 0.01})
  a.setAttribute('data-letter','a');
  const b = getNumberInput({id:ids[1], label: 'b:', defaultValue:'0', step: 0.01});
  b.setAttribute('data-letter','b');
  row2.append(a,b);
  const row3 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const c = getNumberInput({id:ids[2], label:'c:', defaultValue:'0', step: 0.01});
  c.setAttribute('data-letter','b');
  const d = getNumberInput({id:ids[3], label: 'd:', defaultValue:'1', step: 0.01});
  d.setAttribute('data-letter','b');
  row3.append(c,d);
  const row4 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const e = getNumberInput({id:ids[4], label: 'e:', defaultValue:'0', step: 0.01});
  e.setAttribute('data-letter','e');
  const f = getNumberInput({id:ids[5], label: 'f:', defaultValue:'0', step: 0.01});
  f.setAttribute('data-letter','f');
  row4.append(e,f);
  wrapper.append(row1,row2,row3,row4);
  return wrapper as HTMLDivElement;
}
function getTranslateTransformInput(){
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'translate'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'Translate Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const xID = 'x_'.concat(window.crypto.randomUUID());
  const yID = 'y_'.concat(window.crypto.randomUUID());
  const x = getNumberInput({id:xID,label:'Translate X:',defaultValue:'0', step: 0.01});
  const y = getNumberInput({id:yID,label:'Translate Y:',defaultValue:'0', step: 0.01});
  row2.append(x,y);
  wrapper.append(row1,row2);
  return wrapper as HTMLDivElement;
}
function getScaleTransformInput(){
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'scale'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'Scale Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const xID = 'x_'.concat(window.crypto.randomUUID());
  const yID = 'y_'.concat(window.crypto.randomUUID());
  const scaleX = getNumberInput({id:xID,label:'Scale X:', defaultValue:'1', step: 0.01});
  const scaleY = getNumberInput({id:yID,label:'Scale Y:', defaultValue:'1', step: 0.01});
  row2.append(scaleX,scaleY);
  wrapper.append(row1,row2);
  return wrapper as HTMLDivElement;
}
function getRotateTransformInput(){
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'rotate'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'Rotate Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const aID = 'a_'.concat(window.crypto.randomUUID());
  const checkboxID = 'orig_'.concat(window.crypto.randomUUID());
  const rotateDeg = getNumberInput({id:aID, label:'Rotate Degrees:', min:-360, max:360, defaultValue:'0'});
  const checkbox = createElement({ type: 'label', className: 'checkbox', style: 'margin: 0px 6px;' });
  checkbox.append(createElement({
    type: 'input',
    "className": "secondary",
    "attributes": {
      "type": "checkbox",
      "name":checkboxID,
      "id":checkboxID,
      "checked": ""
    }
  }),document.createTextNode("Use Center Origin"));
  row2.append(rotateDeg,checkbox);
  const row3 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const xID = 'x_'.concat(window.crypto.randomUUID());
  const yID = 'y_'.concat(window.crypto.randomUUID());
  const xOrigin = getNumberInput({id:xID,label:'X Rotate Origin:',defaultValue:'0', disabled: true});
  const yOrigin = getNumberInput({id:yID,label:'Y Rotate Origin:',defaultValue:'0', disabled: true});
  row3.append(xOrigin,yOrigin);
  wrapper.append(row1,row2,row3);
  return wrapper as HTMLDivElement;
}
function getSkewXTransformInput(){
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'skewX'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'SkewX Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const aID = 'a_'.concat(window.crypto.randomUUID());
  const degInput = getNumberInput({id:aID,min:-360,max:360,label:'Skew X Degrees:', defaultValue: '0'});
  row2.append(degInput);
  wrapper.append(row1,row2);
  return wrapper as HTMLDivElement;
}
function getSkewYTransformInput(){
  const wrapper = createElement({type:'div', className: 'block mt-1 p-md', style:'border: 2px solid var(--divider); border-radius: 6px;', attributes: {'data-transform':'','data-type':'skewY'} });
  const row1 = createElement({type:'div', className: 'flex-row align-center justify-between'});
  const p = createElement({type:'p', className:'body1 fw-regular bold', innerText: 'SkewY Transform'});
  /**
   * `<button data-delete-transform`
   */
  const deleteTransformButton = createElement({type:'button',attributes:{type:'button', 'data-delete-transform': ''}, className: 'icon medium', innerHTML: '<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>'});
  row1.append(p,deleteTransformButton);
  const row2 = createElement({type:'div', className: 'flex-row align-center w-100'});
  const aID = 'a_'.concat(window.crypto.randomUUID());
  const degInput = getNumberInput({id:aID,min:-360,max:360,label:'Skew Y Degrees:', defaultValue: '0'});
  row2.append(degInput);
  wrapper.append(row1,row2);
  return wrapper as HTMLDivElement;
}
export function getTransformString(form:HTMLFormElement) {
  const id = form.id;
  var transformContainer: undefined|null|HTMLDivElement;
  if (id==='create-gradient-radial') {
     transformContainer = document.getElementById(RADIAL_TRANSFORM_CONTAINER_ID) as HTMLDivElement|null;
  } else if (id==='create-gradient-linear') {
    transformContainer = document.getElementById(LINEAR_TRANSFORMS_CONTAINER_ID) as HTMLDivElement|null;
  }

  if(transformContainer){
    const transformContainers = Array.from(transformContainer.querySelectorAll<HTMLDivElement>('div[data-transform]'));
    var transformString = '';
    transformContainers.forEach((container) => {
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
            transformString+=` matrix(${aVal} ${bVal} ${cVal} ${dVal} ${eVal} ${fVal})`;  
          }
        }
      } else if (type==="translate"){
        const x = container.querySelector<HTMLInputElement>('input[type="number"][id^="x_"]');
        const y = container.querySelector<HTMLInputElement>('input[type="number"][id^="y_"]');
        if (x&&y) {
          const xVal = parseFloat(x.value);
          const yVal = parseFloat(y.value);
          if (!!!isNaN(xVal)&&isFinite(xVal)&&!!!isNaN(yVal)&&isFinite(yVal)){
            transformString+=` translate(${xVal} ${yVal})`;
          }
        }
      } else if (type==="scale"){
        const x = container.querySelector<HTMLInputElement>('input[type="number"][id^="x_"]');
        const y = container.querySelector<HTMLInputElement>('input[type="number"][id^="y_"]');
        if (x&&y) {
          const xVal = parseFloat(x.value);
          const yVal = parseFloat(y.value);
          if (!!!isNaN(xVal)&&isFinite(xVal)&&!!!isNaN(yVal)&&isFinite(yVal)){
            transformString+=` scale(${xVal}, ${yVal})`;
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
            transformString+=` rotate(${aVal})`;
          } else if (!!!checked&&!!!isNaN(aVal)&&isFinite(aVal)
          &&aVal>=-360&&aVal<=360&&
          !!!isNaN(xVal)&&isFinite(xVal)&&
          !!!isNaN(yVal)&&isFinite(yVal)
          ) {
            transformString+=` rotate(${aVal}, ${xVal}, ${yVal})`;
          }
        }
      } else if (type==="skewX"){
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        if(a){
          const aVal = parseFloat(a.value);
          if(!!!isNaN(aVal)&&isFinite(aVal)&&aVal>=-360&&aVal<=360){
            transformString+=` skewX(${aVal})`;
          }
        }
      } else if (type==="skewY"){
        const a = container.querySelector<HTMLInputElement>('input[type="number"][id^="a_"]');
        if(a){
          const aVal = parseFloat(a.value);
          if(!!!isNaN(aVal)&&isFinite(aVal)&&aVal>=-360&&aVal<=360){
            transformString+=` skewY(${aVal})`;
          }
        }
      }
    })
    if (transformString.length) return transformString.slice(1);
    else return null;
  }
  return null;
}
export function setTransformString(form:HTMLFormElement) {
  const s = getTransformString(form);
  if (s&&s.length) {
    if (form.id==='create-gradient-linear') {
      const el = document.getElementById('example-linear-gradient') as SVGLinearGradientElement|null;
      if (el) el.setAttribute('gradientTransform',s);
    } else if (form.id==='create-gradient-radial') {
      const el = document.getElementById('example-radial-gradient') as SVGRadialGradientElement|null;
      if (el) el.setAttribute('gradientTransform',s);
    }
  } else {
    if (form.id==='create-gradient-linear') {
      const el = document.getElementById('example-linear-gradient') as SVGLinearGradientElement|null;
      if (el) el.removeAttribute('gradientTransform');
    } else if (form.id==='create-gradient-radial') {
      const el = document.getElementById('example-radial-gradient') as SVGRadialGradientElement|null;
      if (el) el.removeAttribute('gradientTransform');
    }
  }
}
export function deleteTransform(this:HTMLButtonElement,e:Event) {
  const transformContainer = this.closest<HTMLDivElement>('div[data-transform]');
  const form = this.closest<HTMLFormElement>('form');
  if(transformContainer&&form) {
    transformContainer.remove();
    updateForm(form);
    setTransformString(form);
  }
}
export function updateTransformValues(this:HTMLDivElement,e:Event){
  const form = this.closest<HTMLFormElement>('form');
  if (form) setTransformString(form);
}
export function addTransformOnClick(this:HTMLButtonElement,e:Event) {
  const html = document.querySelector('html');
  const form = this.closest<HTMLFormElement>('form');
  const fieldset = this.closest<HTMLFieldSetElement>('fieldset');
  var container: undefined|null|HTMLDivElement = undefined;
  if (form) {
    const id = form.id;
    if (id==="create-gradient-radial"){
      container = document.getElementById(RADIAL_TRANSFORM_CONTAINER_ID) as HTMLDivElement|null;
    }else if (id==="create-gradient-linear"){
      container = document.getElementById(LINEAR_TRANSFORMS_CONTAINER_ID) as HTMLDivElement|null;
    }
    if (fieldset&&container&&form&&html) {
      const checkedRadio = fieldset.querySelector<HTMLInputElement>('input[type="radio"]:checked');
      if (checkedRadio){
        const value = checkedRadio.value;
        if (value==="matrix") { // 6 inputs a, b, c, d, e, f
          const matrixInput = getMatrixTransformInput();
          container.append(matrixInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        } else if (value==="translate") { // x, y
          const translateInput = getTranslateTransformInput();
          container.append(translateInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        } else if (value==="scale") { // c, y
          const scaleInput = getScaleTransformInput();
          container.append(scaleInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        } else if (value==="rotate") { // a, x, y
          const rotateInput = getRotateTransformInput();
          container.append(rotateInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        } else if (value==="skewX") { // a 
          const skewXInput = getSkewXTransformInput();
          container.append(skewXInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        } else if (value==="skewY") { // a
          const skewYInput = getSkewYTransformInput();
          container.append(skewYInput);
          document.dispatchEvent(new CustomEvent('NEW_CONTENT_LOADED'));
        }
      }
    }
  }
}
export function addTransformListeners(form:HTMLFormElement) {
  const id = form.id;
  var transformContainer: undefined|null|HTMLDivElement;
  if (id==='create-gradient-radial') {
     transformContainer = document.getElementById(RADIAL_TRANSFORM_CONTAINER_ID) as HTMLDivElement|null;
  } else if (id==='create-gradient-linear') {
    transformContainer = document.getElementById(LINEAR_TRANSFORMS_CONTAINER_ID) as HTMLDivElement|null;
  }
  if (transformContainer){
    const transformContainers = Array.from(transformContainer.querySelectorAll<HTMLDivElement>('div[data-transform]'));
    transformContainers.forEach((container) => {
      const inputs = Array.from(container.querySelectorAll('input'));
      if (inputs&&inputs.length) inputs.forEach((input) => input.addEventListener('change',updateTransformValues));
      const deleteTransformButton = container.querySelector<HTMLButtonElement>('button[data-delete-transform]');
      if (deleteTransformButton) deleteTransformButton.addEventListener('click',deleteTransform);
    });
  }
}
