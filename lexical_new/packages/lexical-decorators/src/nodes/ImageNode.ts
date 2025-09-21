import {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  LexicalCommand
} from 'lexical';
import {
  $createRangeSelection,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  DecoratorNode,
  VALID_HEX_REGEX,
  createCommand
} from 'lexical';
import type { ImageType } from './CarouselImageNode';
import { gcd, getCurrentEditor, getDeviceType, IS_REAL_BROWSER, isHTMLElementCustom, isMobileDevice, isTouchDevice } from '@lexical/shared';
import { getOpenImageBackgroundColorDialog } from '../registerDecorators';

export type SerializedImageNode = Spread<
  {
    src: string,
    short: string,
    long: string,
    width: number,
    height: number,
    originalDevice: ReturnType<typeof getDeviceType>,
    backgroundColor?: string,
    first_element: boolean
  },  
  SerializedLexicalNode
>;

const MAX_WIDTH_MOBILE_COMMENT = 150;
const MAX_HEIGHT_MOBILE_COMMENT = 80;
const MAX_WIDTH_MOBILE = 380;
const MAX_HEIGHT_MOBILE = 400;
const MAX_WIDTH_DESKTOP_COMMENT = 270;
const MAX_HEIGHT_DESKTOP_COMMENT = 150;
const MAX_WIDTH_DESKTOP = 680;
const MAX_HEIGHT_DESKTOP = 700;

export const MIN_IMAGE_DIMENSION = 50;

const getUseragent = () => window?.navigator?.userAgent || (global as any).userAgent;
export const GET_MAX_IMAGE_WIDTH = (editorType:string) =>  {
  if (editorType==="comment"||editorType==="survey-question"||editorType==="survey-short-blog"||editorType==="survey-option"||editorType==="range-description") {
    return isMobileDevice(getUseragent()) ? MAX_WIDTH_MOBILE_COMMENT : MAX_WIDTH_DESKTOP_COMMENT;
  } else {
    return isMobileDevice(getUseragent()) ? MAX_WIDTH_MOBILE : MAX_WIDTH_DESKTOP;
  }
}
export const GET_MAX_IMAGE_HEIGHT= (editorType:string) =>  {
  if (editorType==="comment"||editorType==="survey-question"||editorType==="survey-short-blog"||editorType==="survey-option"||editorType==="range-description") {
    return isMobileDevice(getUseragent()) ? MAX_HEIGHT_MOBILE_COMMENT : MAX_HEIGHT_DESKTOP_COMMENT;
  } else {
    return isMobileDevice(getUseragent()) ? MAX_HEIGHT_MOBILE : MAX_HEIGHT_DESKTOP
  }
};


const CURRENT_VERSION = 1;

function onImageClick(this:HTMLImageElement,e:Event) {
  e.stopPropagation();
  document.dispatchEvent(new CustomEvent("IMAGE_CLICK",{ detail: { image: this }}));
}

/**
 * Return sizes string and aspect ratio string
 * @param widthProperty 
 * @param heightProperty 
 * @returns 
 */
function getSizesAndAspectRatio(widthProperty:number,heightProperty:number) {
  var newWidthProperty = widthProperty;
  var newHeightProperty = heightProperty;
  const aspectRatio = widthProperty/heightProperty;
  if (widthProperty>=heightProperty) {
    if (widthProperty>MAX_WIDTH_MOBILE) {
      newWidthProperty = MAX_WIDTH_MOBILE;
      newHeightProperty = newWidthProperty/aspectRatio;
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
  } else {
    if (heightProperty>MAX_HEIGHT_MOBILE) {
      newHeightProperty = MAX_HEIGHT_MOBILE;
      newWidthProperty = aspectRatio*newHeightProperty;
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
  }
  newWidthProperty = Math.round(newWidthProperty);
  newHeightProperty = Math.round(newHeightProperty);
  const sizes = `(max-width: 500px) ${newWidthProperty}px, (min-width:500px) ${widthProperty}px`;
  newWidthProperty = newWidthProperty % 2 === 0 ? newWidthProperty : newWidthProperty + 1;
  newHeightProperty = newHeightProperty % 2 === 0 ? newHeightProperty : newHeightProperty + 1;
  const greatestCommonDenom = gcd(newWidthProperty,newHeightProperty);
  const gcdWidth = newWidthProperty / greatestCommonDenom;
  const gcdHeight = newHeightProperty / greatestCommonDenom;

  return { sizes, aspectRatio: `${gcdWidth} / ${gcdHeight}` }
}

export class ImageNode extends DecoratorNode<HTMLElement> {
  __src: string;
  __short: string;
  __long: string;
  __width:number;
  __height:number;
  __originalDevice:ReturnType<typeof getDeviceType> = 'mobile';
  __version: number = CURRENT_VERSION;
  __dialogOnClick: boolean = false;
  __backgroundColor?:string;

  constructor(obj:Spread<ImageType,{width:number,height:number,originalDevice:ReturnType<typeof getDeviceType>|undefined,backgroundColor?:string}>, key?: NodeKey) {
    super(key);
    this.__src = obj.src;
    this.__short = obj.short;
    this.__long = obj.long;
    this.__width = obj.width;
    this.__height = obj.height;
    this.__dialogOnClick = false;
    if (obj.originalDevice) this.__originalDevice = obj.originalDevice;
    else this.__originalDevice = getDeviceType();
    if (obj.backgroundColor) this.__backgroundColor = obj.backgroundColor;   
  }
  static getType(): string {
    return 'image';
  }
  static clone(node: ImageNode) {
    return new ImageNode({src:node.getSrc(),short: node.getShort(),long:node.getLong(), width:node.getWidth(),height:node.getHeight(), originalDevice: node.getOriginalDevice(), backgroundColor: node.getBackgroundColor() })
  }
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode({ 
      src: serializedNode.src, 
      short: serializedNode.short, 
      long: serializedNode.long, 
      width: serializedNode.width, 
      height: serializedNode.height,
      originalDevice: serializedNode.originalDevice || 'mobile',
      backgroundColor: serializedNode.backgroundColor 
    });
    node.setFirstElement(serializedNode?.first_element);
    return node;
  }
  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: CURRENT_VERSION,
      src: this.getSrc(),
      short: this.getShort(),
      long: this.getLong(),
      width: this.getWidth(),
      height: this.getHeight(),
      originalDevice: this.getOriginalDevice(),
      backgroundColor: this.getBackgroundColor(),
      first_element: this.getFirstElement()
    }
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('loading','lazy');
    element.setAttribute('data-v',String(CURRENT_VERSION));
    element.setAttribute('src', this.getSrc());
    element.setAttribute('alt', this.getShort());
    element.setAttribute('data-text',this.getLong());
    element.setAttribute('data-original-device',this.getOriginalDevice());
    const bgColor = this.getBackgroundColor();
    if (bgColor) {
      element.setAttribute('data-bg-color',bgColor);
      element.style.setProperty('background-color',bgColor);
    }
    const widthProperty = this.getWidth();
    const heightProperty = this.getHeight();
    const aspectRatio = widthProperty/heightProperty;
    const deviceType = getDeviceType();
    var newWidthProperty:number, newHeightProperty: number, deviceRatio: number;
    const MAX_WIDTH_MOBILE_USE = editor._editorType==="comment"?MAX_WIDTH_MOBILE_COMMENT:MAX_WIDTH_MOBILE;
    const MAX_WIDTH_DESKTOP_USE = editor._editorType==="comment"? MAX_WIDTH_DESKTOP_COMMENT:MAX_WIDTH_DESKTOP;
    const MAX_HEIGHT_MOBILE_USE = editor._editorType==="comment"? MAX_WIDTH_MOBILE_COMMENT:MAX_WIDTH_MOBILE;
    const MAX_HEIGHT_DESKTOP_USE = editor._editorType==="comment"?MAX_WIDTH_DESKTOP_COMMENT:MAX_WIDTH_DESKTOP;

    if (deviceType==="mobile"&&'mobile'!==this.getOriginalDevice()) {
      if (widthProperty>=heightProperty) {
        if (widthProperty>MAX_WIDTH_MOBILE_USE) {
          newWidthProperty = Math.max(MIN_IMAGE_DIMENSION,widthProperty*MAX_WIDTH_MOBILE_USE/MAX_WIDTH_DESKTOP_USE);
          newHeightProperty = newWidthProperty/aspectRatio;
        } else {
          newWidthProperty = widthProperty;
          newHeightProperty = heightProperty;
        }
      } else {
        if (heightProperty>MAX_HEIGHT_MOBILE_USE) {
          newHeightProperty = Math.max(MIN_IMAGE_DIMENSION,heightProperty*MAX_HEIGHT_MOBILE_USE/MAX_HEIGHT_DESKTOP_USE);
          newWidthProperty = aspectRatio*newHeightProperty;
        } else {
          newWidthProperty = widthProperty;
          newHeightProperty = heightProperty;
        }
      }
    } else if (deviceType!=='mobile'&&'mobile'===this.getOriginalDevice()) {
      if (aspectRatio>1.05) {
        deviceRatio = widthProperty/MAX_WIDTH_MOBILE_USE;
        newWidthProperty = MAX_WIDTH_DESKTOP_USE*deviceRatio;
        newHeightProperty = newWidthProperty/aspectRatio;
      } else {
        deviceRatio = heightProperty/MAX_HEIGHT_MOBILE_USE;
        newHeightProperty = MAX_HEIGHT_DESKTOP_USE*deviceRatio;
        newWidthProperty = newHeightProperty*aspectRatio;
      }
    } else {
      newWidthProperty = widthProperty;
      newHeightProperty = heightProperty;
    }
    if (heightProperty > widthProperty && newHeightProperty<MIN_IMAGE_DIMENSION) {
      newWidthProperty = MIN_IMAGE_DIMENSION;
      newHeightProperty = newWidthProperty*(heightProperty/widthProperty);
    } else if (widthProperty > heightProperty && newWidthProperty < MIN_IMAGE_DIMENSION) {
      newHeightProperty = MIN_IMAGE_DIMENSION;
    }
    newWidthProperty = Math.round(newWidthProperty);
    newHeightProperty = Math.round(newHeightProperty);
    element.setAttribute('width',String(newWidthProperty));
    const {sizes, aspectRatio:aspectRatioStr} = getSizesAndAspectRatio(this.getWidth(),this.getHeight());
    element.setAttribute('sizes',sizes);
    element.style.setProperty('aspect-ratio',aspectRatioStr,'important'); 
    element.style.setProperty("width",String(newWidthProperty).concat('px'));
    element.style.setProperty('max-width','100%','important');
    element.setAttribute('data-width',String(newWidthProperty));
    element.setAttribute('data-height',String(newHeightProperty));
    element.classList.add('img-node');
    if (this.getFirstElement()&&!!!IS_REAL_BROWSER) element.classList.add('first-rte-element');
    if (this.getLastElement()&&!!!IS_REAL_BROWSER) element.classList.add('last-rte-element');
    return {element};
  }
  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: HTMLElement) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }
  getSrc() {
    const self = this.getLatest();
    return self.__src;
  }
  getShort() {
    const self = this.getLatest();
    return self.__short;
  }
  getLong() {
    const self = this.getLatest();
    return self.__long;
  }
  setShort(s:string) {
    const self = this.getWritable();
    self.__short = s;
    return self;
  }
  setLong(s:string) {
    const self = this.getWritable();
    self.__long = s;
    return self;
  }
  setDialogOnClick(b:boolean) {
    const self = this.getWritable();
    self.__dialogOnClick = b;
    return self;
  }
  getDialogOnClick() {
    const self = this.getLatest();
    return self.__dialogOnClick;
  }
  updateDOM(_prevNode: ImageNode,_dom: HTMLElement): boolean {
    return Boolean(
     ( _prevNode.__dialogOnClick !== Boolean(_dom.getAttribute('data-dialog-click')==="true") ) || 
      (_prevNode.__backgroundColor !== _dom.getAttribute('data-bg-color')) ||
      (_prevNode.__short !== _dom.getAttribute('alt')) ||
      (_prevNode.__long !== _dom.getAttribute('data-text'))
    );
  }
  getHeight() {
    return this.getLatest().__height;
  }
  setHeight(n:number) {
    const self = this.getWritable();
    self.__height = n;
    return self;
  }
  getWidth() {
    return this.getLatest().__width;
  }
  setWidth(n:number) {
    const self = this.getWritable();
    self.__width = n;
    return self;
  }
  getOriginalDevice() {
    const latest = this.getLatest();
    return latest.__originalDevice;
  }
  setOriginalDevice(type: ReturnType<typeof getDeviceType>) {
    const self = this.getWritable();
    self.__originalDevice = type;
    return self;
  }
  setSrc(s:string) {
    const self = this.getWritable();
    if (s.startsWith('https://image.storething.org/')) {
      self.__src = s;
    }   
  }
  getTextContent(): string {
    const self = this.getLatest();
    const alt = self.getShort();
    const long = self.getLong();
    const src = self.getSrc();
    return `[${alt || 'Image'}](${src})\nDescription: ${long || 'N/A'}`
  }
  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.className = 'rte-image';
    if (this.getDialogOnClick()) span.setAttribute('data-dialog-click','true');
    if (this.getBackgroundColor()) span.setAttribute('data-bg-color',String(this.getBackgroundColor()));
    if (this.getFirstElement()) span.classList.add('first-rte-element');
    if (this.getLastElement()) span.classList.add('last-rte-element');
    return span;
  }
  getBackgroundColor() {
    const self = this.getLatest();
    return self.__backgroundColor;
  }
  setBackgroundColor(s:string|undefined) {
    const self = this.getWritable();
    self.__backgroundColor = s;
    return self;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0){
        const div = document.createElement('div');
        div.setAttribute('draggable','false');
        div.setAttribute('data-image-wrapper','true');
        if (this.getFirstElement()) div.classList.add('first-rte-element');
        if (this.getLastElement()) div.classList.add('last-rte-element');
        const img = document.createElement('img');
        if (this.getFirstElement()) img.classList.add('first-rte-element');
        if (this.getLastElement()) img.classList.add('last-rte-element');
        const bgColor = this.getBackgroundColor();
        if (bgColor) {
          img.style.setProperty("background-color",bgColor);
          img.setAttribute('data-bg-color',bgColor);
        }
        if (!!!this.getDialogOnClick()) {
          if (isTouchDevice()) img.addEventListener('dblclick',getOpenImageBackgroundColorDialog(this.__key,editor._config.namespace,this.getBackgroundColor(),this.getShort(),this.getLong()),true);
          else img.addEventListener('dblclick',getOpenImageBackgroundColorDialog(this.__key,editor._config.namespace,this.getBackgroundColor(),this.getShort(),this.getLong()),true);
        }
        img.setAttribute('src',this.getSrc());
        img.setAttribute('alt',this.getShort());
        img.setAttribute('data-text',this.getLong());
        img.setAttribute('loading','lazy');
        const widthProperty = this.getWidth();
        const heightProperty = this.getHeight();
        if (!!!isNaN(widthProperty)) img.setAttribute('width',String(widthProperty.toFixed(0)));
        if (!!!isNaN(widthProperty)) img.style.setProperty('width',String(widthProperty.toFixed(0)).concat('px'));
        img.style.setProperty('max-width','100%','important');
        
        if (getDeviceType()==="desktop"&&!!!isNaN(widthProperty)&&!!!isNaN(heightProperty)) {
          const {sizes, aspectRatio} = getSizesAndAspectRatio(this.getWidth(),this.getHeight());
          img.setAttribute('sizes',sizes);
          img.style.setProperty('aspect-ratio',aspectRatio,'important'); 
        } else {
          img.setAttribute('height',String(heightProperty.toFixed(0)));
          img.style.setProperty('height',String(heightProperty.toFixed(0)).concat('px'));
        }
        if (!!!this.getDialogOnClick()) {
          img.classList.add('no-click');
        } else {
          img.addEventListener('click',onImageClick,true);
        }
        img.classList.add('img-node');
        div.append(img);
        element.append(div);
        return div;
      }
    }
    return document.createElement('div');
  }
  isKeyboardSelectable() {
    return true;
  }
}
function convertImageElement(node:HTMLElement) {
  const backgroundColorString = node.getAttribute('data-bg-color');
  var backgroundColor:string|undefined;
  if (typeof backgroundColorString==="string"&&VALID_HEX_REGEX.test(backgroundColorString)) {
    backgroundColor = backgroundColorString;
  }
  const src = String(node.getAttribute('src'));
  const short = String(node.getAttribute('alt'));
  const long = String(node.getAttribute('data-text'));
  const widthStr = String(node.getAttribute('data-width'));
  const heightStr = String(node.getAttribute('data-height'));
  const widthNum = parseInt(widthStr);
  const heightNum = parseInt(heightStr);
  var deviceType: ReturnType<typeof getDeviceType> = 'mobile';
  const deviceTypePre = node.getAttribute('data-original-device');
  if (deviceTypePre==='mobile'||deviceTypePre==='tablet'||deviceTypePre==='desktop') deviceType = deviceTypePre;
  var width: number;
  var height: number;
  if (!!!isNaN(widthNum)) width = widthNum;
  else width = Number.NaN;
  if (!!!isNaN(heightNum)) height = heightNum;
  else height = Number.NaN;
  const newNode = new ImageNode({ src, short, long, width, height, originalDevice: deviceType, backgroundColor })
  const first_element = node.classList.contains('first-rte-element');
  newNode.setFirstElement(first_element);
  const last_element = node.classList.contains('last-rte-element');
  newNode.setLastElement(last_element);
  return { node: newNode };
}
export function $createImageNode(obj: Spread<ImageType,{width:number,height:number, originalDevice: ReturnType<typeof getDeviceType>, backgroundColor: string|undefined }>) {
  if (typeof obj.backgroundColor==="string"&&!!!VALID_HEX_REGEX.test(obj.backgroundColor)) {
    obj.backgroundColor = undefined;
  }
  const editor = getCurrentEditor();
  const editorType = editor ? editor._editorType : '';
  if (obj.height>GET_MAX_IMAGE_HEIGHT(editorType)&&obj.width>GET_MAX_IMAGE_WIDTH(editorType)) {
    const aspectRatio = obj.width/obj.height;
    if (aspectRatio>1.05) {
      const newWidth = GET_MAX_IMAGE_WIDTH(editorType);
      const newHeight = GET_MAX_IMAGE_WIDTH(editorType)/aspectRatio;
      return new ImageNode({...obj, width: newWidth, height: newHeight });
    } else {
      const newHeight = GET_MAX_IMAGE_HEIGHT(editorType);
      const newWidth = GET_MAX_IMAGE_HEIGHT(editorType)*aspectRatio;
      return new ImageNode({...obj, width: newWidth, height: newHeight });
    }
  } else if (obj.height>GET_MAX_IMAGE_HEIGHT(editorType)) {
    const aspectRatio = obj.width/obj.height;
    const newHeight = GET_MAX_IMAGE_HEIGHT(editorType);
    const newWidth = GET_MAX_IMAGE_HEIGHT(editorType)*aspectRatio;
    return new ImageNode({...obj, width: newWidth, height: newHeight });
  } else if (obj.width>GET_MAX_IMAGE_WIDTH(editorType)) {
    const aspectRatio = obj.width/obj.height;
    const newWidth = GET_MAX_IMAGE_WIDTH(editorType);
    const newHeight = GET_MAX_IMAGE_WIDTH(editorType)/aspectRatio;
    return new ImageNode({...obj, width: newWidth, height: newHeight });
  } else return new ImageNode(obj);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}


export const INSERT_IMAGE_COMMAND: LexicalCommand<ImageType> = createCommand('INSERT_IMAGE_COMMAND')
export const INSERT_IMAGES_COMMAND: LexicalCommand<ImageType[]> = createCommand('INSERT_IMAGES_COMMAND')




const getImg = () => {
  const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const img = document.createElement('img');
  img.src = TRANSPARENT_IMAGE;
  return img;
}


const getDOMSelection = (targetWindow: Window | null): Selection | null => (targetWindow || window)?.getSelection();

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}
function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    isHTMLElementCustom(target) &&
    !target.closest('code') &&
    target.parentElement &&
    target.parentElement.closest('div[data-rich-text-editor]')
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}

export interface ImagePayload {
  short: string;
  long: string;
  height: number|"auto";
  key: string;
  src: string;
  width: number|"auto";
  version: number;
}

export type InsertImagePayload = Readonly<ImagePayload>;

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
  if (!dragData) {
    return null;
  }
  const {type, data} = JSON.parse(dragData);
  if (type !== 'image') {
    return null;
  }
  return data;
}
function $getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}


export function $onDragStartImage(event: DragEvent):boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData('text/plain', '_');
  dataTransfer.setDragImage(getImg(), 0, 0);
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        short: node.getShort(),
        long: node.getLong(),
        height: node.getHeight(),
        key: node.getKey(),
        src: node.getSrc(),
        width: node.getWidth(),
        version: node.__version
      } as ImagePayload,
      type: 'image',
    }),
  );

  return true;
}

export function $onDragOverImage(event: DragEvent):boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

export function $onDropImage(event: DragEvent, editor: LexicalEditor):boolean {
  const node = $getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}