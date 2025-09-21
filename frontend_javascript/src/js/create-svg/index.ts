
import * as PIXI from 'pixi.js';
import { isTouchDevice, onNewContentLoaded } from '../shared';

import firCurve from 'fit-curve';

type VALID_CURRENT_MODES = 'manipulate'|'circle'|'rectangle'|'ellipse'|'line'|'polyline'|'polygon'|'path'|'text';
const currentModeSet = new Set(['manipulate','circle','rectangle','ellipse','line','polyline','polygon','path','text'] as const);
const isValidCurrentMode = (s: any): s is VALID_CURRENT_MODES => {
  return currentModeSet.has(s);
}

// switch (CURRENT_MODE) {
  // case 'manipulate':{
  //   break;
  // } 
  // case 'circle':{
  //   break;
  // }
  // case 'rectangle':{
  //   break;
  // } 
  // case 'ellipse':{
  //   break;
  // } 
  // case 'line':{
  //   break;
  // } 
  // case 'polyline':{
  //   break;
  // } 
  // case 'polygon':{
  //   break;
  // } 
  // case 'path':{
  //   break;
  // } 
  // case 'text':{
  //   break;
  // }
  // default: {
  //   break
//   }
// }

export type Coordinate={x:number,y:number};
var CURRENT_MODE: VALID_CURRENT_MODES = 'manipulate';
var PIXI_CONTAINER: HTMLDivElement|undefined = undefined;
var PIXI_APPLICATION: undefined|PIXI.Application<PIXI.ICanvas> = undefined;
var ANIMATION_FRAME: number = 0;
var CURRENT_SELECTION: PIXI.DisplayObject|PIXI.DisplayObject[]|undefined = undefined;
var SELECTED_ELEMENTS: {type: VALID_CURRENT_MODES, name: string}[] = [];

type DRAWING_STATE_TYPE = {
  isDrawing: Boolean,
  type: VALID_CURRENT_MODES,
  manipulate: (undefined|ManipulateDrawingState),
  circle: (undefined|CircleDrawingState),
  rectangle: (undefined|RectangleDrawingState),
  ellipse: (undefined|EllipseDrawingState),
  line: (undefined|LineDrawingState),
  polyline: (undefined|PolylineDrawingState),
  polygon: (undefined|PolygonDrawingState),
  path: (undefined|PathDrawingState),
  text: (undefined|TextDrawingState),
}
type ManipulateDrawingState = {
  startPoint: PIXI.Graphics,
  rect: PIXI.Graphics,
  width: number, 
  height: number
}

const DRAWING_STATE:DRAWING_STATE_TYPE = {
  isDrawing: false,
  type: 'manipulate',
  manipulate: undefined,
  circle: undefined,
  rectangle: undefined,
  ellipse: undefined,
  line: undefined,
  polyline: undefined,
  polygon: undefined,
  path: undefined,
  text: undefined,
};
/**
 * Sets isDrawing to truand sets the type of the DRAWING_STATE to a value
 * @param s 
 */
function setDrawingState(s:VALID_CURRENT_MODES) {
  Object.keys(DRAWING_STATE).forEach((key) => {
    if (key==='isDrawing') return;
    else if (key==='type') DRAWING_STATE['type'] = s;
    else DRAWING_STATE[key as VALID_CURRENT_MODES] = undefined;
  })
  DRAWING_STATE.isDrawing = true;
}

type ObjectTracker = {
  'circle': {[index:string]: Circle},
  'rectangle': {[index:string]: Rectangle},
  'ellipse': {[index:string]: Ellipse},
  'line': {[index:string]: Line},
  'polyline': {[index:string]: Polyline},
  'polygon': {[index:string]: Polygon},
  'path': {[index:string]: Path},
  'text': {[index:string]: Text},
}
/**
 * Keep track of attributes of objects
 * The name of the object should be the key to reference the object, and you should keep the attribute that you cannot easily get in the value for the key
 */
const graphicReferences:ObjectTracker = {
  'circle': {},
  'rectangle': {},
  'ellipse': {},
  'line': {},
  'polyline': {},
  'polygon': {},
  'path': {},
  'text': {},
};

/* -------------------------------------------------------- Custom Events ------------------------------------------------------- */
const getElementAddedEvent = (type:VALID_CURRENT_MODES,shape: PIXI.Graphics|PIXI.Text) => {
  return new CustomEvent('new_element_added',{ detail: { type, shape }});
}


/* ----------------------------------------------------- Helper Functions -------------------------------------------------------- */
/**
 * Get angle between lines in radians (default) or degrees
 * @param obj 
 * @returns 
 */
export function getAngleBetweenPoints(obj:{line1: {start:Coordinate,end:Coordinate}, line2: {start:Coordinate,end:Coordinate}, deg?:boolean }) {
  var dAx = obj.line1.end.x -  obj.line1.start.x;
  var dAy =  obj.line1.end.y -  obj.line1.start.y;
  var dBx = obj.line2.end.x -  obj.line2.start.x;
  var dBy =  obj.line2.end.y -  obj.line2.start.y;
  var angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
  if(angle < 0) {angle = angle * -1;}
  if (obj.deg) {
    const degree_angle = angle * (180 / Math.PI);
    return degree_angle;
  } else {
    return angle;
  }
}
const editPointLineStyle = { width: 2, color: '#000000', alpha: 1, alignment: 1 };
const editPointFill = [0xffffff,1];
export function getEditPoint(obj:{callback?: (event: PIXI.FederatedPointerEvent) => void, cursor?:string, position: Coordinate }) {
  const circle = new PIXI.Graphics();
  circle.lineStyle(editPointLineStyle);
  circle.beginFill(...editPointFill);
  if (obj&&obj.cursor) { 
    circle.cursor = obj.cursor;
  } else {
    circle.cursor = 'grab';
  }
  if (obj&&obj.callback) {
    circle.on('click',obj.callback);
  }
  circle.position.x = obj.position.x;
  circle.position.y = obj.position.y;
  circle.drawCircle(0,0,EDIT_POINT_RADIUS);
  circle.endFill();
  return circle;
}
export const EDIT_POINT_RADIUS = 5;
/**
 * Get all relevant buttons to svg editor
 * @returns 
 */
export function getRelevantElements() {
  const manipulateElements = document.getElementById('manipulate-mode') as HTMLButtonElement|null;
  const addCircle = document.getElementById('add-circle') as HTMLButtonElement|null;
  const addRectangle = document.getElementById('add-rectangle') as HTMLButtonElement|null;
  const addEllipse = document.getElementById('add-ellipse') as HTMLButtonElement|null;
  const addLine = document.getElementById('add-line') as HTMLButtonElement|null;
  const addPolyline = document.getElementById('add-polyline') as HTMLButtonElement|null;
  const addPolygon = document.getElementById('add-polygon') as HTMLButtonElement|null;
  const addPath = document.getElementById('add-path') as HTMLButtonElement|null;
  const addText = document.getElementById('add-text') as HTMLButtonElement|null;
  const addAnimation = document.getElementById('add-animation') as HTMLButtonElement|null;
  const clearEditorButton = document.getElementById('clear-editor') as HTMLButtonElement|null;
  const deleteShapeButton = document.getElementById('delete-shape') as HTMLButtonElement|null;
  const undoButton = document.getElementById('undo-last-change') as HTMLButtonElement|null;
  const redoButton = document.getElementById('redo-last-change') as HTMLButtonElement|null;
  const editCircleContainer = document.getElementById('edit-circle-container') as HTMLDivElement|null;
  const editRectangleContainer = document.getElementById('edit-rectangle-container') as HTMLDivElement|null;
  const editEllipseContainer = document.getElementById('edit-ellipse-container') as HTMLDivElement|null;
  const editLineContainer = document.getElementById('edit-line-container') as HTMLDivElement|null;
  const editPolylineContainer = document.getElementById('edit-polyline-container') as HTMLDivElement|null;
  const editPolygonContainer = document.getElementById('edit-polygon-container') as HTMLDivElement|null;
  const editPathContainer = document.getElementById('edit-path-container') as HTMLDivElement|null;
  const editTextContainer = document.getElementById('edit-text-container') as HTMLDivElement|null;
  const framesContainer = document.getElementById('change-animation-frame') as HTMLDivElement|null;
  return {
    manipulateButton: manipulateElements,
    addCircleButton: addCircle, 
    addRectangleButton: addRectangle,
    addEllipseButton: addEllipse,
    addLineButton: addLine,
    addPolylineButton: addPolyline,
    addPolygonButton: addPolygon,
    addPathButton: addPath,
    addTextButton: addText,
    addAnimationButton: addAnimation,
    clearEditorButton,
    deleteShapeButton,
    undoButton,
    redoButton,
    editCircleContainer: editCircleContainer,
    editRectangleContainer: editRectangleContainer,
    editEllipseContainer: editEllipseContainer,
    editLineContainer: editLineContainer,
    editPolylineContainer: editPolylineContainer,
    editPolygonContainer: editPolygonContainer,
    editPathContainer: editPathContainer,
    editTextContainer: editTextContainer,
    framesContainer
  }
} 
export function getOnMouseDown() {
  if (isTouchDevice()) return 'touchstart';
  else return 'mousedown';
}
export function getOnMouseMove() {
  if (isTouchDevice()) return 'touchmove';
  else return 'mousemove';
}
export function getOnMouseUp() {
  if (isTouchDevice()) return 'touchcancel'; // maybe use touchend
  else return 'mouseup';
}
export function getPointPositionInsideContainer(p:Coordinate,container:HTMLDivElement) {
  const boundingClintRect = container.getBoundingClientRect();
  return {
    x: p.x - boundingClintRect.left,
    y: p.y - boundingClintRect.top 
  };
}
export function getEventPositionInsideContainer(e:PIXI.FederatedPointerEvent,container:HTMLDivElement) {
  const boundingClintRect = container.getBoundingClientRect();
  return {
    x: e.clientX - boundingClintRect.left,
    y: e.clientY - boundingClintRect.top 
  };
}
export function getPixiApplication() {
  return PIXI_APPLICATION;
}
export function getPixiContainer() {
  return PIXI_CONTAINER;
}
export function getAnimationFrame() {
  return ANIMATION_FRAME;
}
export function getRandomColor(){return "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})};
function selectButton(b:HTMLButtonElement) {
  if (!!!b.classList.contains('selected')) b.classList.add('selected');
}
function deselectButton(b:HTMLButtonElement) {
  if (b.classList.contains('selected')) b.classList.remove('selected');
}
function selectAndDeselectModeButtons(s:VALID_CURRENT_MODES) {
  const {
    manipulateButton,
    addCircleButton,
    addRectangleButton,
    addEllipseButton,
    addLineButton,
    addPolylineButton,
    addPolygonButton,
    addPathButton,
    addTextButton,
    addAnimationButton,
  } = getRelevantElements();
  if (manipulateButton&&s==='manipulate') selectButton(manipulateButton);
  else if (manipulateButton) deselectButton(manipulateButton);
  if (addCircleButton&&s==='circle') selectButton(addCircleButton);
  else if (addCircleButton) deselectButton(addCircleButton);
  if (addRectangleButton&&s==='rectangle') selectButton(addRectangleButton);
  else if (addRectangleButton) deselectButton(addRectangleButton);
  if (addEllipseButton&&s==='ellipse') selectButton(addEllipseButton);
  else if (addEllipseButton) deselectButton(addEllipseButton);
  if (addLineButton&&s==='line') selectButton(addLineButton);
  else if (addLineButton) deselectButton(addLineButton);
  if (addPolylineButton&&s==='polyline') selectButton(addPolylineButton);
  else if (addPolylineButton) deselectButton(addPolylineButton);
  if (addPolygonButton&&s==='polygon') selectButton(addPolygonButton);
  else if (addPolygonButton) deselectButton(addPolygonButton);
  if (addPathButton&&s==='path') selectButton(addPathButton);
  else if (addPathButton) deselectButton(addPathButton);
  if (addTextButton&&s==='text') selectButton(addTextButton);
  else if (addTextButton) deselectButton(addTextButton);
}
export function setPixiMode(s:VALID_CURRENT_MODES) {
  const app = getPixiApplication();
  if (app) {
    switch (CURRENT_MODE) {
      case 'manipulate':{
        break;
      } 
      case 'circle':{
        break;
      }
      case 'rectangle':{
        break;
      } 
      case 'ellipse':{
        break;
      } 
      case 'line':{
        break;
      } 
      case 'polyline':{
        break;
      } 
      case 'polygon':{
        break;
      } 
      case 'path':{
        break;
      } 
      case 'text':{
        break;
      }
      default: {
        break
      }
    }
    CURRENT_MODE = s;
    selectAndDeselectModeButtons(s);
    switch (CURRENT_MODE) {
      case 'manipulate':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'circle':{
        app.stage.cursor = 'crosshair';
        break;
      }
      case 'rectangle':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'ellipse':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'line':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'polyline':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'polygon':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'path':{
        app.stage.cursor = 'crosshair';
        break;
      } 
      case 'text':{
        app.stage.cursor = 'crosshair';
        break;
      }
      case 'circle': {
        app.stage.cursor = 'crosshair';
        break;
      }
      default: {
        break
      }
    }
  }
}
export function getSetPixiMode(s:VALID_CURRENT_MODES) {
  const func = function () {
    setPixiMode(s);
  }
  return func;
}
export function setActiveElement(e:PIXI.FederatedPointerEvent) {
  /* @ts-ignore */
  const graphics = this as PIXI.Graphics;
  if (graphics instanceof PIXI.Graphics) {

  }
}

export function getWidthBetweenPoints(from:Coordinate,to:Coordinate,abs:boolean=false) {
  const width = to.x - from.x;
  if (abs) return Math.abs(width);
  else return width;
}
export function getHeightBetweenPoints(from:Coordinate,to:Coordinate,abs:boolean=false) {
  const height = to.y - from.y;
  if (abs) return Math.abs(height);
  else return height;
}
export function getDistanceBetweenPoints(from:Coordinate,to:Coordinate) {
  return Math.sqrt(Math.pow(getWidthBetweenPoints(from,to,false),2)+Math.pow(getHeightBetweenPoints(from,to,false),2));
}
export function getTempShapeLineStyle() {
  return { width: 2, color: 'red', alpha: 1, alignment: 0.5} as const;
}
export function getTempShapeFill() {
  return ['blue',0.3] as const;
}

/* ------------------------------------------------- Application Event Listeners ---------------------------------------------- */
/**
 * This event should only be called when the user presses down on a space that is not occupied by a shape
 * 
 * **Events on shapes should have their default prevented**
 * @param e 
 */
export function onApplicationMouseDown(e:PIXI.FederatedPointerEvent) {
  switch (CURRENT_MODE) {
    case 'manipulate':{
      onApplicationMouseDownManipulate(e);
      break;
    } 
    case 'circle':{
      onApplicationMouseDownCircle(e);
      break;
    }
    case 'rectangle':{
      onApplicationMouseDownRectangle(e);
      break;
    } 
    case 'ellipse':{
      onApplicationMouseDownEllipse(e);
      break;
    } 
    case 'line':{
      onApplicationMouseDownLine(e);
      break;
    } 
    case 'polyline':{
      onApplicationMouseDownPolyline(e);
      break;
    } 
    case 'polygon':{
      onApplicationMouseDownPolygon(e);
      break;
    } 
    case 'path':{
      onApplicationMouseDownPath(e);
      break;
    } 
    case 'text':{
      onApplicationMouseDownText(e);
      break;
    }
    default: {
      break
    }
  }
}
export function onApplicationMouseMove(e:PIXI.FederatedPointerEvent) {
  switch (CURRENT_MODE) {
    case 'manipulate':{
      onApplicationMouseMoveManipulate(e);
      break;
    } 
    case 'circle':{
      onApplicationMouseMoveCircle(e);
      break;
    }
    case 'rectangle':{
      onApplicationMouseMoveRectangle(e);
      break;
    } 
    case 'ellipse':{
      onApplicationMouseMoveEllipse(e);
      break;
    } 
    case 'line':{
      onApplicationMouseMoveLine(e);
      break;
    } 
    case 'polyline':{
      onApplicationMouseMovePolyline(e);
      break;
    } 
    case 'polygon':{
      onApplicationMouseMovePolygon(e);
      break;
    } 
    case 'path':{
      onApplicationMouseMovePath(e);
      break;
    } 
    case 'text':{
      onApplicationMouseMoveText(e);
      break;
    }
    default: {
      break
    }
  }
}
export function onApplicationMouseUp(e:PIXI.FederatedPointerEvent) {
  switch (CURRENT_MODE) {
    case 'manipulate':{
      onApplicationMouseUpManipulate(e);
      break;
    } 
    case 'circle':{
      onApplicationMouseUpCircle(e);
      break;
    }
    case 'rectangle':{
      onApplicationMouseUpRectangle(e);
      break;
    } 
    case 'ellipse':{
      onApplicationMouseUpEllipse(e);
      break;
    } 
    case 'line':{
      onApplicationMouseUpLine(e);
      break;
    } 
    case 'polyline':{
      onApplicationMouseUpPolyline(e);
      break;
    } 
    case 'polygon':{
      onApplicationMouseUpPolygon(e);
      break;
    } 
    case 'path':{
      onApplicationMouseUpPath(e);
      break;
    } 
    case 'text':{
      onApplicationMouseUpText(e);
      break;
    }
    default: {
      break
    }
  }
}
function onApplicationMouseOut(e:PIXI.FederatedPointerEvent) {
  if (DRAWING_STATE.isDrawing) {
    const type = DRAWING_STATE.type;
    switch (type) {
      case 'path':{
        handleDrawPath();
        break;
      } 
      default: {
        break
      }
    }
  }
}
function onApplicationNewElementAdded(e:CustomEvent) {
  const detail = e.detail;
  const type = detail.type;
  const graphic = detail;
  if (isValidCurrentMode(type)&&graphic) {
    getCurrentAppImage()
    .then((res) => {
      if (res) {
        const container = getRelevantElements().framesContainer;
        if (container) {
          setAppImageAttributes(res,0);
          container.innerHTML='';
          container.append(res);
        }
      }
    })
    .catch(error => console.error(error));
  } 
}
function onApplicationElementRemoved(e:Event) {

}
function handleKeyDown(e:KeyboardEvent) {
  if (e.key==='Escape') {
    if (DRAWING_STATE.isDrawing) {
      switch (DRAWING_STATE.type) {
        case 'manipulate':{
          if(DRAWING_STATE['manipulate']) {
            DRAWING_STATE['manipulate'].rect.destroy();
            DRAWING_STATE['manipulate'].startPoint.destroy();
            DRAWING_STATE['manipulate']=undefined;
            DRAWING_STATE.isDrawing=false;
          }
          break;
        } 
        case 'circle':{
          if (DRAWING_STATE['circle']) {
            DRAWING_STATE['circle'].circle.destroy();
            DRAWING_STATE['circle'].startPoint.destroy();
            DRAWING_STATE['circle']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        }
        case 'rectangle':{
          if (DRAWING_STATE['rectangle']) {
            DRAWING_STATE['rectangle'].rect.destroy();
            DRAWING_STATE['rectangle'].startPoint.destroy();
            DRAWING_STATE['rectangle']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'ellipse':{
          if (DRAWING_STATE['ellipse']) {
            DRAWING_STATE['ellipse'].ellipse.destroy();
            DRAWING_STATE['ellipse'].rect.destroy();
            DRAWING_STATE['ellipse'].startPoint.destroy();
            DRAWING_STATE['ellipse']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'line':{
          if (DRAWING_STATE['line']) {
            DRAWING_STATE['line'].line.destroy();
            DRAWING_STATE['line'].startPoint.destroy();
            DRAWING_STATE['line']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'polyline':{
          if (DRAWING_STATE['polyline']) {
            DRAWING_STATE['polyline'].line.destroy();
            DRAWING_STATE['polyline'].previousPoint.destroy();
            DRAWING_STATE['polyline']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'polygon':{
          if (DRAWING_STATE['polygon']) {
            DRAWING_STATE['polygon'].line.destroy();
            DRAWING_STATE['polygon'].startPoint.destroy();
            DRAWING_STATE['polygon']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'path':{
          if (DRAWING_STATE['path']) {
            DRAWING_STATE['path'].line.destroy();
            DRAWING_STATE['path']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        } 
        case 'text':{
          if (DRAWING_STATE['text']) {
            DRAWING_STATE['text']=undefined;
            DRAWING_STATE.isDrawing = false;
          }
          break;
        }
        default: {
          break;
        }
      }
    }
  }
}
function clearEditor(this:HTMLButtonElement,e:Event) {
  const app = getPixiApplication();
  if (app) {
    for (var i = app.stage.children.length - 1; i >= 0; i--) {	
      app.stage.removeChild(app.stage.children[i]);
    };
    Object.keys(graphicReferences).forEach((key) => {
      /* @ts-ignore */
      graphicReferences[key] = {};
    })
  }
}
function addFrame(this:HTMLButtonElement,e:Event) {

}
/**
 * [Reference] (https://pixijs.download/release/docs/PIXI.CanvasExtract.html#image)
 * @returns 
 */
export async function getCurrentAppImage() {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if(app&&container) {
    const rect = new PIXI.Rectangle(0,0,container.offsetWidth,container.offsetHeight);
    const image = await app.renderer.extract.image(app.stage as any,"image/webp",0.92,rect);
    return image; 
  } else {
    return undefined;
  }
}

function setAnimationFrameOnClick(this:HTMLImageElement,e:Event) {
  const frame = this.getAttribute('data-frame');
  const container = getPixiContainer();
  if (frame&&container) {
    const frameNum = parseInt(frame);
    if (!!!isNaN(frameNum)&&isFinite(frameNum)) {
      ANIMATION_FRAME = frameNum;
    }
  }
}

function setAppImageAttributes(image:HTMLImageElement,animationFrameNumber:number) {
  image.classList.add('no-click');
  image.setAttribute('height','75px');
  image.setAttribute('width','100px');
  image.style.cssText = 'height:75px!important; width: 100px!important;margin:0px!important;display: inline;border:2px solid var(--text-primary);cursor:pointer;background:var(--background);';
  image.setAttribute('data-frame',animationFrameNumber.toFixed(0));
  image.addEventListener('click',setAnimationFrameOnClick);
}

/* ----------------------------------------------------------- MODE: Manipulate ------------------------------------------------ */
function onApplicationMouseDownManipulate(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const circle = getEditPoint({position: {x:p.x,y:p.y}});
      const rect = new PIXI.Graphics();
      rect.lineStyle(getTempShapeLineStyle());
      rect.beginFill(...getTempShapeFill());
      rect.drawRoundedRect(p.x,p.y,0,0,0);
      rect.endFill();
      app.stage.addChild(...[rect,circle] as any[]);
      setDrawingState('manipulate');
      DRAWING_STATE['manipulate'] = {
        startPoint: circle,
        rect: rect,
        width: 0,
        height: 0
      }
      
    }
  }
}
function onApplicationMouseMoveManipulate(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const app = getPixiApplication();
    const container = getPixiContainer();
    
    if (app&&container) {
      const obj = DRAWING_STATE['manipulate'];
      if(obj) {
        const p = getEventPositionInsideContainer(e,container);
        obj.rect.clear();
        const {x:startPointX,y:startPointY} = obj.startPoint.position;
        const width = getWidthBetweenPoints({x:startPointX,y:startPointY},{x:p.x,y:p.y},true);
        const height = getHeightBetweenPoints({x:startPointX,y:startPointY},{x:p.x,y:p.y},true);
        obj.height = height;
        obj.width = width;
        const startDrawX = Math.min(startPointX,p.x);
        const startDrawY = Math.min(startPointY,p.y);
        obj.rect.lineStyle(getTempShapeLineStyle());
        obj.rect.beginFill(...getTempShapeFill());
        obj.rect.drawRoundedRect(startDrawX,startDrawY,width,height,0);
        obj.rect.endFill();
      }
    }
  }
}
function onApplicationMouseUpManipulate(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const app = getPixiApplication();
    const container = getPixiContainer();
    
    if (app&&container) {
      const obj = DRAWING_STATE['manipulate'];
      if(obj) {
        DRAWING_STATE.isDrawing = false;
        obj.startPoint.destroy();
        obj.rect.destroy();
        DRAWING_STATE['manipulate'] = undefined;
      }
    }
  }
}
/* ----------------------------------------------------------- MODE: Circle ------------------------------------------------ */
type Circle = {
  type: 'circle',
  radius: number,
  center: Coordinate
};
type CircleDrawingState = {
  startPoint: PIXI.Graphics,
  circle: PIXI.Graphics,
  radius: number
};
function onApplicationMouseDownCircle(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const centerCircle = getEditPoint({position: {x:p.x,y:p.y}});
      const circle = new PIXI.Graphics();
      circle.lineStyle(getTempShapeLineStyle());
      circle.beginFill(...getTempShapeFill());
      circle.drawCircle(p.x,p.y,0);
      circle.endFill();
      app.stage.addChild(...[circle,centerCircle] as any[]);
      setDrawingState('circle');
      DRAWING_STATE['circle'] = {
        startPoint: centerCircle,
        circle: circle, 
        radius: 0
      };
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['circle'];
      if (obj) {
        DRAWING_STATE.isDrawing = false;
        const center = {x:obj.startPoint.position.x,y:obj.startPoint.position.y};
        const radius = obj.radius;
        const circle = new PIXI.Graphics();
        circle.lineStyle(getTempShapeLineStyle());
        circle.beginFill(...getTempShapeFill());
        circle.fill.alpha = 1;
        circle.drawCircle(center.x,center.y,radius);
        circle.endFill();
        circle.name='circle_'.concat(window.crypto.randomUUID());
        circle.eventMode='static';
        circle.cursor='pointer';
        circle.on(getOnMouseDown(),handleDrawnCircleClick);
        app.stage.addChild(...[circle] as any[]);
        container.dispatchEvent(getElementAddedEvent('circle',circle));
        obj.circle.destroy();
        obj.startPoint.destroy();
        DRAWING_STATE['circle']=undefined;
      }
    }
  }
}
function onApplicationMouseMoveCircle(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const app = getPixiApplication();
    const container = getPixiContainer();
    if (app&&container) {
      const obj = DRAWING_STATE['circle'];
      if(obj) {
        const p = getEventPositionInsideContainer(e,container);
        const radius = getDistanceBetweenPoints({x:obj.startPoint.position.x,y:obj.startPoint.position.y},p);
        const circle = obj.circle;
        circle.clear();
        circle.lineStyle(getTempShapeLineStyle());
        circle.beginFill(...getTempShapeFill());
        circle.drawCircle(obj.startPoint.position.x,obj.startPoint.position.y,radius);
        circle.endFill();
        obj.radius = radius;
      }
    }
  }
}
function onApplicationMouseUpCircle(e:PIXI.FederatedPointerEvent) {
  
}
function handleDrawnCircleClick(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {
  const name = this.name;
  const container = getPixiContainer();
  if (!!!DRAWING_STATE.isDrawing&&container) {
    e.stopPropagation();
   

  }
}
/* ----------------------------------------------------------- MODE: Rectangle ------------------------------------------------ */
type Rectangle = {
  type: 'rect',
  center: Coordinate,
  width: number,
  height: number
}
type RectangleDrawingState = {
  startPoint: PIXI.Graphics,
  rect: PIXI.Graphics,
  width: number, 
  height: number
}
function onApplicationMouseDownRectangle(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const startCircle = getEditPoint({position: {x:p.x,y:p.y}});
      const rect = new PIXI.Graphics();
      rect.lineStyle(getTempShapeLineStyle());
      rect.beginFill(...getTempShapeFill());
      rect.drawRoundedRect(p.x,p.y,0,0,0);
      rect.endFill();
      app.stage.addChild(...[rect,startCircle] as any[]);
      setDrawingState('rectangle');
      DRAWING_STATE['rectangle'] = {
        startPoint: startCircle,
        rect: rect, 
        width: 0,
        height: 0
      };
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['rectangle'];
      if (obj) {
        const p = getEventPositionInsideContainer(e,container);
        const startPoint = {x: obj.startPoint.position.x,y:obj.startPoint.position.y};
        const rect = new PIXI.Graphics();
        const startDrawX = Math.min(p.x,startPoint.x);
        const startDrawY = Math.min(p.y,startPoint.y);
        rect.lineStyle(getTempShapeLineStyle());
        rect.beginFill(...getTempShapeFill());
        rect.fill.alpha = 1;
        rect.drawRoundedRect(startDrawX,startDrawY,obj.width,obj.height,0);
        rect.endFill();
        rect.name = 'rect_'.concat(window.crypto.randomUUID());
        rect.eventMode = 'static';
        rect.cursor='pointer';
        rect.on(getOnMouseDown(),onDrawnRectangleClick);
        obj.rect.destroy();
        obj.startPoint.destroy();
        DRAWING_STATE['rectangle'] = undefined;
        DRAWING_STATE.isDrawing = false;
        app.stage.addChild(rect as any);
        container.dispatchEvent(getElementAddedEvent('rectangle',rect));
      }
    }  
  }
}
function onApplicationMouseMoveRectangle(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['rectangle'];
    if(container&&obj){
      const p = getEventPositionInsideContainer(e,container);
      const startPoint = {x: obj.startPoint.position.x,y:obj.startPoint.position.y};
      const width = getWidthBetweenPoints(startPoint,p,true);
      const height = getHeightBetweenPoints(startPoint,p,true);
      const startDrawX = Math.min(startPoint.x,p.x);
      const startDrawY = Math.min(startPoint.y,p.y);
      obj.rect.clear();
      obj.rect.lineStyle(getTempShapeLineStyle());
      obj.rect.beginFill(...getTempShapeFill());
      obj.rect.drawRoundedRect(startDrawX,startDrawY,width,height,0);
      obj.rect.endFill();
      obj.width = width;
      obj.height = height;
    }
  }
}
function onApplicationMouseUpRectangle(e:PIXI.FederatedPointerEvent) {
  
}
function onDrawnRectangleClick(this:PIXI.Graphics,e:PIXI.FederatedMouseEvent) {
  e.stopPropagation();
  console.log(this.name);
}
/* ----------------------------------------------------------- MODE: Ellipse ------------------------------------------------ */
type EllipseDrawingState = {
  startCoord: Coordinate,
  startPoint: PIXI.Graphics,
  rect: PIXI.Graphics,
  ellipse: PIXI.Graphics
};
type Ellipse = {
  type: 'ellipse',
  focal1: Coordinate,
  focal2: Coordinate,
  radius: number
};
function onApplicationMouseDownEllipse(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);

      const startPoint = getEditPoint({position: {x:p.x,y:p.y}});
      const rect = new PIXI.Graphics();
      rect.lineStyle(getTempShapeLineStyle());
      rect.fill.alpha = 0;
      rect.drawRect(p.x,p.y,0,0);
      const ellipse = new PIXI.Graphics();
      ellipse.beginFill(...getTempShapeFill());
      ellipse.drawEllipse(p.x,p.y,0,0);
      setDrawingState('ellipse');
      DRAWING_STATE['ellipse'] = {
        startPoint: startPoint,
        rect,
        ellipse,
        startCoord: p
      };
      app.stage.addChild(...[startPoint,rect,ellipse] as any);
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['ellipse'];
      if(obj) {
        DRAWING_STATE.isDrawing=false;
        const p = getEventPositionInsideContainer(e,container);
        const centerX = (p.x+obj.startCoord.x)/2;
        const centerY = (p.y+obj.startCoord.y)/2;
        const width = getWidthBetweenPoints(obj.startCoord,p,true)/2;
        const height = getHeightBetweenPoints(obj.startCoord,p,true)/2;
        obj.startPoint.destroy();
        obj.rect.destroy();
        obj.ellipse.destroy();
        const ellipse = new PIXI.Graphics();
        ellipse.name = 'ellipse_'.concat(window.crypto.randomUUID());
        ellipse.beginFill(getTempShapeFill()[0],1);
        ellipse.lineStyle(getTempShapeLineStyle());
        ellipse.fill.alpha = 1;
        ellipse.drawEllipse(centerX,centerY,width,height);
        ellipse.endFill();
        ellipse.on(getOnMouseDown(),onDrawnEllipseClick);
        ellipse.eventMode = 'static';
        ellipse.cursor='pointer';
        app.stage.addChild(ellipse as any);
        DRAWING_STATE['ellipse'] = undefined;
        container.dispatchEvent(getElementAddedEvent('ellipse',ellipse));
      }
    }
  }
}
function onApplicationMouseMoveEllipse(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['ellipse'];
    if(container&&obj) {
      const p = getEventPositionInsideContainer(e,container);
      const startPointX = Math.min(p.x,obj.startCoord.x);
      const startPointY = Math.min(p.y,obj.startCoord.y);
      const centerX = (p.x+obj.startCoord.x)/2;
      const centerY = (p.y+obj.startCoord.y)/2;
      const width = getWidthBetweenPoints(obj.startCoord,p,true);
      const height = getHeightBetweenPoints(obj.startCoord,p,true);
      obj.ellipse.clear();
      obj.rect.clear();
      obj.rect.lineStyle(getTempShapeLineStyle());
      obj.rect.fill.alpha = 0;
      obj.rect.drawRect(startPointX,startPointY,width,height);
      obj.ellipse.beginFill(...getTempShapeFill());
      obj.ellipse.drawEllipse(centerX,centerY,width/2,height/2);
    } 
  }
}
function onApplicationMouseUpEllipse(e:PIXI.FederatedPointerEvent) {
  
}
function onDrawnEllipseClick(e:PIXI.FederatedPointerEvent) {
  e.preventDefault();

}
/* ----------------------------------------------------------- MODE: Line ------------------------------------------------ */
type LineDrawingState = {
  startPoint: PIXI.Graphics,
  line: PIXI.Graphics
}
type Line = {
  type: 'line',
  startPoint: Coordinate,
  endPoint: Coordinate
};
function onApplicationMouseDownLine(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const startPoint = getEditPoint({position: p})
      const line = new PIXI.Graphics();
      line.lineStyle(getTempShapeLineStyle());
      line.moveTo(p.x,p.y).lineTo(p.x,p.y);
      setDrawingState('line');
      DRAWING_STATE['line'] = {
        startPoint,
        line
      }
      app.stage.addChild(...[startPoint,line] as any);
      
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['line'];
      if (obj) {
        const p = getEventPositionInsideContainer(e,container);
        const line = new PIXI.Graphics();
        line.lineStyle(getTempShapeLineStyle());
        line.moveTo(obj.startPoint.x,obj.startPoint.y).lineTo(p.x,p.y);
        line.eventMode='static';
        line.cursor='pointer';
        line.name='line_'.concat(window.crypto.randomUUID());
        line.on(getOnMouseDown(),handleDrawnLineMouseDown);
        obj.startPoint.destroy();
        obj.line.destroy();
        DRAWING_STATE['line'] = undefined;
        DRAWING_STATE.isDrawing = false;
        app.stage.addChild(line as any);
        container.dispatchEvent(getElementAddedEvent('line',line));
      }
    }
  }
}
function onApplicationMouseMoveLine(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['line'];
    if(container&&obj){
      const p = getEventPositionInsideContainer(e,container);
      obj.line.clear();
      obj.line.lineStyle(getTempShapeLineStyle());
      obj.line.moveTo(obj.startPoint.position.x,obj.startPoint.position.y).lineTo(p.x,p.y);
    }
  }
}
function onApplicationMouseUpLine(e:PIXI.FederatedPointerEvent) {
  
}
function handleDrawnLineMouseDown(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {

}
/* ----------------------------------------------------------- MODE: Polyline ------------------------------------------------ */
type PolylineDrawingState = {
  previousPoint: PIXI.Graphics,
  line: PIXI.Graphics,
  points: Coordinate[]
}
type Polyline = {
  type: 'polyline',
};
function onApplicationMouseDownPolyline(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const previousPoint = getEditPoint({position:p});
      previousPoint.eventMode='static';
      previousPoint.cursor='pointer';
      previousPoint.on(getOnMouseDown(),onMouseDownEndPolylineCircle);
      previousPoint.on('mouseover',onMouseOverEditButtonAction);
      previousPoint.on('mouseout',onMouseOutEditButtonAction);
      const line = new PIXI.Graphics();
      line.lineStyle(getTempShapeLineStyle());
      line.moveTo(p.x,p.y).lineTo(p.x,p.y);
      app.stage.addChild(...[line,previousPoint] as any);
      setDrawingState('polyline');
      DRAWING_STATE['polyline'] = {
        previousPoint,
        line: line,
        points: [p]
      };
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['polyline'];
      if(obj){
        const p = getEventPositionInsideContainer(e,container);
        obj.line.clear();
        obj.previousPoint.position.x = p.x;
        obj.previousPoint.position.y = p.y;
        obj.points.push(p);
        obj.line.lineStyle(getTempShapeLineStyle());
        obj.line.moveTo(obj.points[0].x,obj.points[0].y);
        for (let i = 1; i < obj.points.length; i++) {
          obj.line.lineTo(obj.points[i].x,obj.points[i].y);
        }
      }
    }
  }
}
function onApplicationMouseMovePolyline(e:PIXI.FederatedPointerEvent) {
  e.stopPropagation();
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['polyline'];
    if(container&&obj) {
      const p = getEventPositionInsideContainer(e,container);
      obj.line.clear();
      obj.line.lineStyle(getTempShapeLineStyle());
      obj.line.moveTo(obj.points[0].x,obj.points[0].y);
      for (let i = 0; i < obj.points.length; i++) {
        obj.line.lineTo(obj.points[i].x,obj.points[i].y);
      }
      obj.line.lineStyle(getTempShapeLineStyle());
      obj.line.line.alpha = 0.3;
      obj.line.lineTo(p.x,p.y);
    }
  }
}
function onApplicationMouseUpPolyline(e:PIXI.FederatedPointerEvent) {
  e.stopPropagation();

}
function onMouseDownEndPolylineCircle(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {
  e.stopPropagation();
  const obj = DRAWING_STATE['polyline'];
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (obj&&app&&container) {
    const coordinates = structuredClone(obj.points);
    obj.previousPoint.destroy();
    obj.line.destroy();
    const line = new PIXI.Graphics();
    line.lineStyle(getTempShapeLineStyle());
    line.moveTo(coordinates[0].x,coordinates[0].y);
    for (let i=1;i<coordinates.length;i++){
      line.lineTo(coordinates[i].x,coordinates[i].y);
    }
    line.name = 'polyline_'.concat(window.crypto.randomUUID());
    app.stage.addChild(line as any);
    DRAWING_STATE.isDrawing = false;
    DRAWING_STATE['polyline'] = undefined;
    container.dispatchEvent(getElementAddedEvent('polyline',line));
    
  }
}
/**
 * Enlarge the sign of the edit button to indicate an action
 * @param this 
 * @param e 
 */
function onMouseOverEditButtonAction(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {
  this.clear();
  const container = getPixiContainer();
  if(container) {
    this.lineStyle(editPointLineStyle);
    this.beginFill(...editPointFill);
    this.drawCircle(0,0,EDIT_POINT_RADIUS*2);
  }
}
/**
 * Return the size of the edit button to normal size
 * @param this 
 * @param e 
 */
function onMouseOutEditButtonAction(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {
  this.clear();
  const container = getPixiContainer();
  if(container) {
    this.lineStyle(editPointLineStyle);
    this.beginFill(...editPointFill);
    this.drawCircle(0,0,EDIT_POINT_RADIUS);
  }
}

/* ----------------------------------------------------------- MODE: Polygon ------------------------------------------------ */
type PolygonDrawingState = {
  startPoint: PIXI.Graphics,
  line: PIXI.Graphics,
  points: Coordinate[]
}
type Polygon = {
  type: 'polygon',
};

function onApplicationMouseDownPolygon(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    if (!!!DRAWING_STATE.isDrawing) {
      const p = getEventPositionInsideContainer(e,container);
      const startPoint = getEditPoint({position:p});
      startPoint.eventMode='static';
      startPoint.cursor='pointer';
      startPoint.on(getOnMouseDown(),onMouseDownEndPolygonCircle);
      startPoint.on('mouseover',onMouseOverEditButtonAction);
      startPoint.on('mouseout',onMouseOutEditButtonAction);
      const line = new PIXI.Graphics();
      line.lineStyle(getTempShapeLineStyle());
      line.moveTo(p.x,p.y).lineTo(p.x,p.y);
      setDrawingState('polygon');
      app.stage.addChild(...[line,startPoint] as any);
      DRAWING_STATE['polygon'] = {
        startPoint,
        line,
        points: [p]
      }
    } else if (!!DRAWING_STATE.isDrawing) {
      const obj = DRAWING_STATE['polygon'];
      if(obj) {
        const p = getEventPositionInsideContainer(e,container);
        obj.points.push(p);
        obj.line.clear();
        obj.line.lineStyle(getTempShapeLineStyle());
        obj.line.moveTo(obj.points[0].x,obj.points[0].y);
        for (let i=1;i<obj.points.length;i++){
          obj.line.lineTo(obj.points[i].x,obj.points[i].y);
        }
      }
    } 
  }
}
function onApplicationMouseMovePolygon(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['polygon'];
    if(container&&obj) {
      const p = getEventPositionInsideContainer(e,container);
      obj.line.clear();
      obj.line.lineStyle(getTempShapeLineStyle());
      obj.line.moveTo(obj.points[0].x,obj.points[0].y);
      for (let i=1;i<obj.points.length;i++){
        obj.line.lineTo(obj.points[i].x,obj.points[i].y);
      }
      obj.line.line.alpha=0.8;
      obj.line.lineTo(p.x,p.y);
    }
  }
}
function onApplicationMouseUpPolygon(e:PIXI.FederatedPointerEvent) {
  
}
function onMouseDownEndPolygonCircle(this:PIXI.Graphics,e:PIXI.FederatedPointerEvent) {
  e.stopPropagation();
  const obj = DRAWING_STATE['polygon'];
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (obj&&app&&container) {
    const coordinates = structuredClone(obj.points);
    obj.startPoint.destroy();
    obj.line.destroy();
    const polygon = new PIXI.Graphics();
    polygon.beginFill(...getTempShapeFill());
    polygon.fill.alpha = 1;
    polygon.lineStyle(getTempShapeLineStyle());
    polygon.drawPolygon(obj.points);
    polygon.eventMode='static';
    polygon.cursor='pointer';
    polygon.name='polygon_'.concat(window.crypto.randomUUID());
    app.stage.addChild(polygon as any);
    container.dispatchEvent(getElementAddedEvent('polygon',polygon));
    DRAWING_STATE.isDrawing = false;
    DRAWING_STATE['polygon'] = undefined;
  }
}
/* ----------------------------------------------------------- MODE: Path ------------------------------------------------ */
type Path = {
  type: 'path',
};
type PathDrawingState = {
  points: Coordinate[],
  line: PIXI.Graphics
}
function onApplicationMouseDownPath(e:PIXI.FederatedPointerEvent) {
  if (!!!DRAWING_STATE.isDrawing) {
    const app = getPixiApplication();
    const container = getPixiContainer();
    if (app&&container) {
      const p = getEventPositionInsideContainer(e,container);
      const line = new PIXI.Graphics();
      line.lineStyle(getTempShapeLineStyle());
      line.moveTo(p.x,p.y).lineTo(p.x,p.y);
      app.stage.addChild(line as any);
      setDrawingState('path');
      DRAWING_STATE['path'] = {
        points: [p],
        line
      }
    }
  }
}
function onApplicationMouseMovePath(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    const container = getPixiContainer();
    const obj = DRAWING_STATE['path'];
    if(container&&obj) {
      const p = getEventPositionInsideContainer(e,container);
      obj.line.moveTo(obj.points[obj.points.length-1].x,obj.points[obj.points.length-1].y).lineTo(p.x,p.y);
      obj.points.push(p);
    }
  }
}
function handleDrawPath() {
  const app = getPixiApplication();
  const obj = DRAWING_STATE['path'];
  const container = getPixiContainer();
  if (obj&&app&&container) {
    DRAWING_STATE.isDrawing = false;
    obj.line.destroy();
    const points = structuredClone(obj.points);
    // where each element is [x, y] and elements are [first-point, control-point-1, control-point-2, second-point]
    const bezierCurves = firCurve(points.map((obj) => ([obj.x,obj.y])),50);
    const line = new PIXI.Graphics();
    line.lineStyle(getTempShapeLineStyle());
    line.moveTo(points[0].x,points[0].y);
    for (let i = 0; i < bezierCurves.length; i++){
      line.bezierCurveTo(bezierCurves[i][1][0],bezierCurves[i][1][1],bezierCurves[i][2][0],bezierCurves[i][2][1],bezierCurves[i][3][0],bezierCurves[i][3][1]);
      // line.lineTo(points[i].x,points[i].y);
    }
    app.stage.addChild(line as any);
    container.dispatchEvent(getElementAddedEvent('path',line));
    DRAWING_STATE['path'] = undefined;
  }
}
function onApplicationMouseUpPath(e:PIXI.FederatedPointerEvent) {
  if (!!DRAWING_STATE.isDrawing) {
    handleDrawPath();
  }
}
/* ----------------------------------------------------------- MODE: Text ------------------------------------------------ */
type TextDrawingState = {
  position: Coordinate,
  content: string,
  text: PIXI.Text,
  cursor: PIXI.Graphics
}
type Text = {
  type: 'text',
}
function onApplicationMouseDownText(e:PIXI.FederatedPointerEvent) {
  const app = getPixiApplication();
  const container = getPixiContainer();
  if (app&&container) {
    const p = getEventPositionInsideContainer(e,container);
    const text = new PIXI.Text('Click me to edit text.', {
      fontFamily: 'Anuphan, sans-serif',
      fontSize: 24,
      fill: 0xffffff,
      align: 'center',
    });
    text.position.x = p.x;
    text.position.y = p.y;
    app.stage.addChild(text as any);
    container.dispatchEvent(getElementAddedEvent('text',text));
  }
}
function onApplicationMouseMoveText(e:PIXI.FederatedPointerEvent) {
  
}
function onApplicationMouseUpText(e:PIXI.FederatedPointerEvent) {
  
}



/* ----------------------------------------------------- onPixiLoad ----------------------------------------------------------------- */
function hideShowAboutContent(this:HTMLButtonElement,e:Event) {
  const sectionIdToHide = this.getAttribute('data-hide-show-section');
  const span = this.querySelector('span');
  const svg = this.querySelector('svg');
  if(sectionIdToHide&&span&&svg) {
    const divToHide = document.getElementById(sectionIdToHide); 
    if(divToHide) {
      if (divToHide.hasAttribute('hidden')) {
        this.classList.remove('success');
        this.classList.add('warning');
        span.innerText='HIDE';
        svg.style.cssText="";
        divToHide.removeAttribute('hidden');
      } else {
        this.classList.remove('warning');
        this.classList.add('success');
        span.innerText='SHOW';
        svg.style.cssText="transform:rotate(180deg);";
        divToHide.setAttribute('hidden','');
      }
    }
  }
}
export function onPixiLoad() {
  document.addEventListener('keydown',handleKeyDown);
  const container = document.querySelector<HTMLDivElement>('div[data-pixi-container]');
  const pixiContextRef = document.getElementById('pixi-context-ref') as HTMLDivElement|null;
  if(container&&!!!PIXI_APPLICATION) {
    PIXI_CONTAINER = container;
    PIXI_APPLICATION = new PIXI.Application({ antialias: true, resizeTo: PIXI_CONTAINER, backgroundAlpha: 0 });
    PIXI_APPLICATION.stage.eventMode='static';
    PIXI_APPLICATION.stage.cursor = 'pointer';
    PIXI_CONTAINER.appendChild(PIXI_APPLICATION.view as any);

    const {
      manipulateButton,
      addCircleButton,
      addRectangleButton,
      addEllipseButton,
      addLineButton,
      addPolylineButton,
      addPolygonButton,
      addPathButton,
      addAnimationButton,
      addTextButton,
      clearEditorButton,
      deleteShapeButton,
      undoButton,
      redoButton,
      framesContainer
    } = getRelevantElements();

    if(manipulateButton) manipulateButton.addEventListener('click',getSetPixiMode('manipulate'));
    if(addCircleButton) addCircleButton.addEventListener('click',getSetPixiMode('circle'));
    if(addRectangleButton) addRectangleButton.addEventListener('click',getSetPixiMode('rectangle'));
    if(addEllipseButton) addEllipseButton.addEventListener('click',getSetPixiMode('ellipse'));
    if(addLineButton) addLineButton.addEventListener('click',getSetPixiMode('line'));
    if(addPolylineButton) addPolylineButton.addEventListener('click',getSetPixiMode('polyline'));
    if(addPolygonButton) addPolygonButton.addEventListener('click',getSetPixiMode('polygon'));
    if(addPathButton) addPathButton.addEventListener('click',getSetPixiMode('path'));
    if (addTextButton) addTextButton.addEventListener('click',getSetPixiMode('text'));
    if (clearEditorButton) clearEditorButton.addEventListener('click',clearEditor);
    if (addAnimationButton) addAnimationButton.addEventListener('click',addFrame);
    
    setPixiMode('manipulate');
    // if(addAnimationButton) addAnimationButton.addEventListener('click',onAddAnimationClick);
    // if(addAnimationButton) addAnimationButton.setAttribute('disabled','');
    // if(clearEditorButton) clearEditorButton.addEventListener('click',clearEditor);
    // if (deleteShapeButton) deleteShapeButton.addEventListener('click',deleteShape);

    // setCurrentMode('manipulate');
    // PIXI_APPLICATION.stage.sortableChildren = true;
    // PIXI_APPLICATION.stage.eventMode = 'static';
    // PIXI_APPLICATION.stage.hitArea = PIXI_APPLICATION.screen;
    // PIXI_APPLICATION.stage.on('mousedown',handleMouseDown);
    // PIXI_APPLICATION.stage.on('mousemove',handleMouseMove);
    // PIXI_APPLICATION.stage.on('mouseup',handleMouseUp);
    // PIXI_APPLICATION.stage.on('rightclick',handleRightClick);
    // PIXI_CONTAINER.addEventListener('contextmenu',preventContextMenu);
    // document.addEventListener('keydown',handleKeydown);
    
    PIXI_APPLICATION.ticker.add(() => {

    });
    PIXI_APPLICATION.stage.sortableChildren = true;
    PIXI_APPLICATION.stage.eventMode = 'static';
    PIXI_APPLICATION.stage.hitArea = PIXI_APPLICATION.screen;

    PIXI_APPLICATION.stage.on(getOnMouseDown(),onApplicationMouseDown);
    PIXI_APPLICATION.stage.on(getOnMouseMove(),onApplicationMouseMove);
    PIXI_APPLICATION.stage.on(getOnMouseUp(),onApplicationMouseUp); 
    PIXI_APPLICATION.stage.on('mouseleave',onApplicationMouseOut);
    container.addEventListener<any>('new_element_added',onApplicationNewElementAdded);
    container.addEventListener('element_removed',onApplicationElementRemoved);
    if (framesContainer&&framesContainer.children.length===0) {
      getCurrentAppImage()
      .then((res) => {
        if(res) {
          setAppImageAttributes(res,getAnimationFrame());
          framesContainer.append(res);
        }
      })
      .catch((error) => {

      })
    }
  }
  const hideShowButtons = document.querySelectorAll<HTMLButtonElement>('button[data-hide-show-section]')
  hideShowButtons.forEach(b => b.addEventListener('click',hideShowAboutContent));

}
/* ------------------------------------------------------ OnPixiUnload -------------------------------------------------------------- */
export function onPixiUnload() {
  CURRENT_MODE = 'manipulate';
  PIXI_CONTAINER = undefined;
  PIXI_APPLICATION = undefined;
}
