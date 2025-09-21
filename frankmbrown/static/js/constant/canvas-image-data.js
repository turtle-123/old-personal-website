
/**
 * @type {NodeJS.Timeout|null}
 */
var FILTER_COLOR_DEBOUNCE = null;
/**
 * @type {NodeJS.Timeout|null}
 */
var OPACITY_CHANGE_DEBOUNCE = null;
/**
 * @type {{[index: string]: null|DOMRect}}
 */
const RECT = {
  rect: null
}
function isMobileDevice() {
  if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
     return true ;
  } else {
     return false ;
  }
}
/**
 * 
 * @returns {HTMLCanvasElement|null}
 */
const getCanvas = () => document.getElementById('image-data-canvas');
/**
 * 
 * @param {HTMLCanvasElement|undefined} canvas 
 * @returns 
 */
const getCanvasContext = (canvas=undefined) => {
  if (canvas) return canvas.getContext('2d');
  else {
    const canvas = getCanvas();
    if (canvas) return canvas.getContext('2d');
    else return null;
  }
}


/**
 * Custom Event
 * @param {*} e 
 */
function onMediaUploadCompleteImage(e) {
  /**
   * @type {HTMLInputElement|null}
   */
  const target = e.target;
}
function onfilterColorChange(e) {
  /**
   * @type {HTMLInputElement|null}
   */
  const target = e.target;
}
function onNoFilterChange(e) {
  /**
   * @type {HTMLInputElement|null}
   */
  const target = e.target;
}
/**
 * 
 * @param {Event} e 
 */
function onOpacityChange(e) {
  /**
   * @type {HTMLInputElement|null}
   */
  const target = e.target;
  if (target) {
    if (target.value) {
      const num = parseFloat(target.value);
      if (!!!isNaN(num)&&isFinite(num)&&num>=0&&num<=1){
        // handle change of opacity
      }
    }
  }
}

function main() {
/**
 * @type {HTMLCanvasElement|null} the canvas element
 */
const canvas = getCanvas();
/**
 * @type {HTMLInputElement|null} image to upload to the canvas
 */
const imageUploadInput = document.getElementById('upload-image-data-canvas-example');
/**
 * @type {HTMLInputElement|null} color of the filter to apply to the image
 */
const filterColorInput = document.getElementById('filter-color');
/**
 * @type {HTMLInputElement|null} checkbox input - if checked, no filter for image data
 */
const noFilterInput = document.getElementById('transparent-filter');
/**
 * @type {HTMLInputElement|null} Range input for opacity. min=0, max=1
 */
const opacityInput = document.getElementById('filter-opacity');
/**
 * @type {HTMLImageElement|null}
 */
const dogImage = document.getElementById('dog-image');
if(canvas&&imageUploadInput&&filterColorInput&&noFilterInput&&opacityInput&&dogImage){
if (isMobileDevice()) {
  RECT.rect = canvas.getBoundingClientRect();
  document.addEventListener('scroll',function() {
    RECT.rect = canvas.getBoundingClientRect();
  })
}
imageUploadInput.addEventListener('media-upload-complete',onMediaUploadCompleteImage);
filterColorInput.addEventListener('change',onfilterColorChange);
noFilterInput.addEventListener('change',onfilterColorChange);
opacityInput.addEventListener('change',onOpacityChange);
const ctx = getCanvasContext(canvas);
if(ctx){
// main code
class Cell {
  constructor(effect,x,y,index) {
    this.effect = effect;
    this.x = x;
    this.y = y;
    this.positionX = this.effect.width/2;
    this.positionY = this.effect.height;
    this.speedX;
    this.speedY;
    this.width = this.effect.cellWidth;
    this.height = this.effect.cellHeight;
    this.image = dogImage;
    this.slideX = 0;
    this.slideY = 0;
    this.vx = 0;
    this.vy = 0;
    this.ease = 0.022;
    this.friction = 0.8;
    this.randomize = Math.random()*10 + 2;
    this.index = index;
    setTimeout(() => {
      this.start();
    },this.index)
  }
  /**
   * 
   * @param {CanvasRenderingContext2D} context 
   */
  draw(context) {
    context.drawImage(this.image,this.x+this.slideX,this.y+this.slideY,this.width,this.height,this.x,this.y,this.width,this.height);
  }
  start() {
    this.speedX = (this.x - this.positionX)/this.randomize;
      this.speedY = (this.y - this.positionY)/this.randomize;
  }
  update() {
    if (this.effect.mouse.x!==null && this.effect.mouse.y!==null) {
      const dx = this.effect.mouse.x - this.x;
      const dy = this.effect.mouse.y - this.y;
      const distacnce = Math.hypot(dx,dy);
      if (distacnce < this.effect.mouse.radius) {
        const angle = Math.atan2(dy,dx);
        const force = distacnce / this.effect.mouse.radius;
        this.vx = force * Math.cos(angle);
        this.vy = force * Math.sin(angle);
      }
      this.slideX += (this.vx*=this.friction)- this.slideX*this.ease;
      this.slideY += (this.vy*=this.friction) - this.slideY*this.ease;
    }
  }
  update2() {
    // cell position
    if (Math.abs(this.speedX)>0.1||Math.abs(this.speedY)>0.1) {
      this.speedX = (this.x - this.positionX)/this.randomize;
      this.speedY = (this.y - this.positionY)/this.randomize;
      this.positionX += this.speedX;
      this.positionY += this.speedY;
    }

    // crop
    if (this.effect.mouse.x!==null && this.effect.mouse.y!==null) {
      const dx = this.effect.mouse.x - this.x;
      const dy = this.effect.mouse.y - this.y;
      const distacnce = Math.hypot(dx,dy);
      if (distacnce < this.effect.mouse.radius) {
        const angle = Math.atan2(dy,dx);
        const force = distacnce / this.effect.mouse.radius;
        this.vx = force * Math.cos(angle);
        this.vy = force * Math.sin(angle);
      }
      this.slideX += (this.vx*=this.friction)- this.slideX*this.ease;
      this.slideY += (this.vy*=this.friction) - this.slideY*this.ease;
    }
  }
  /**
   * 
   * @param {CanvasRenderingContext2D} context 
   */
  draw2(context) {
    context.drawImage(this.image,this.x+this.slideX,this.y+this.slideY,this.width,this.height,this.positionX,this.positionY,this.width,this.height);
  }
}
class Effect {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.cellWidth = this.width / 55;
    this.cellHeight = this.height / 55;
    /**
     * @type {Cell[]}
     */
    this.imageGrid = [];
    this.createGrid();
    this.mouse = {
      x: null,
      y: null,
      radius: 50
    }
    if(!!!isMobileDevice()) {
      this.canvas.addEventListener('mousemove',(e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
      })
    } else {
      /**
       * @param {TouchEvent} e
       */
      function onTouchMove(e) {
        if (RECT) {
          this.mouse.x = e.touches[0].pageX - RECT.rect.left;
          this.mouse.y = e.touches[0].pageY - RECT.rect.top;
        }
      }
      this.canvas.addEventListener('touchmove',onTouchMove)  
    }
  }
  createGrid() {
    var index = 0;
    for (let y = 0; y < this.height; y+=this.cellHeight) {
      for (let x = 0; x < this.width; x+=this.cellWidth) {
        index++;
        const cell = new Cell(this,x,y,index);
        this.imageGrid.push(cell);
      }
    }
  }
  /**
   * 
   * @param {CanvasRenderingContext2D} context 
   */
  render(context) {  
    this.imageGrid.forEach((cell,i) => {
      // // Original:
      // cell.update();
      // cell.draw(context);

      cell.update2();
      cell.draw2(context);
    })
  }
}

const effect = new Effect(canvas);

var STOP_ANIMATION_FRAME = undefined;

function animate() {
  effect.render(ctx);
  STOP_ANIMATION_FRAME = requestAnimationFrame(animate);
}
animate();
document.addEventListener('htmx:afterRequest',function (e) {
  if (e && e.detail && e.detail.target && (e.detail.target.id==='PAGE'||e.detail.target.id==='#PAGE') && STOP_ANIMATION_FRAME!==undefined){
    cancelAnimationFrame(STOP_ANIMATION_FRAME);
    STOP_ANIMATION_FRAME = undefined;
  }
})
}
}
}

document.addEventListener('run-canvas-image-data',main);
document.dispatchEvent(new CustomEvent('run-canvas-image-data'))
