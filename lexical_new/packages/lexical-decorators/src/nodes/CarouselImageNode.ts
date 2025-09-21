import { 
  DecoratorNode, 
  LexicalNode, 
  NodeKey, 
  SerializedLexicalNode, 
  Spread,
  LexicalEditor,
  EditorConfig,
  DOMExportOutput,
  DOMConversionMap,
  createCommand,
  LexicalCommand,
  COMMAND_PRIORITY_CRITICAL
} from "lexical";
import {  getEditorInstances } from "@lexical/shared";
import { CAROUSEL_CLICK } from "../registerDecorators";
import { GET_MAX_IMAGE_HEIGHT, GET_MAX_IMAGE_WIDTH } from "./ImageNode";
export type ImageType = {short: string, long: string, src: string};
export type SerializedCarouselNode = Spread<{
  imageList: InsertCarouselCommandPayload
},
SerializedLexicalNode
>;
export type InsertCarouselCommandPayload = {
  width: number;
  height: number;
  src: string;
  short: string;
  long: string;
}[];



const CURRENT_VERSION = 1;

export class CarouselImageNode extends DecoratorNode<Element> {
  __imageList: InsertCarouselCommandPayload;
  __version: number = CURRENT_VERSION;

  constructor(imageList: InsertCarouselCommandPayload, key?:NodeKey) {
    super(key);
    this.__imageList = imageList;
  }
  static clone(node: CarouselImageNode): CarouselImageNode {
    return new CarouselImageNode(node.__imageList)
  }

  static getType(): string {
    return 'image-carousel';
  }
  exportJSON(): SerializedCarouselNode {
    return {
      type: this.getType(),
      version: CURRENT_VERSION,
      imageList: this.getImageList()
    }
  }
  static importJSON(serializedNode: SerializedCarouselNode): CarouselImageNode {
    const node = $createCarouselImageNode(serializedNode.imageList);
    return node;
  }
  getImageList() {
    const self = this.getLatest();
    return self.__imageList;
  }
  setImageList(list:InsertCarouselCommandPayload) {
    const self = this.getWritable();
    self.__imageList = list;
    return self;
  }
  getMaxHeight() {
    const imageList = this.getImageList();
    const maxHeight = imageList.sort((a,b) => b.height-a.height)[0].height;
    return maxHeight;
  }
  createDOM(): HTMLElement {
    const el =  document.createElement('div');
    el.style.whiteSpace = "normal";
    el.setAttribute('data-image-carousel',"true");
    el.setAttribute("data-v",String(CURRENT_VERSION));
    if (this.getFirstElement()) el.classList.add('first-rte-element');
    if (this.getLastElement()) el.classList.add('last-rte-element');
    return el;
  }
  getTextContent(): string {
    const self = this.getLatest();
    const imageList =  self.getImageList();
    var s = '';
    imageList.forEach((img) => {
      s += `[${img.short || 'N/A'}](${img.src})\nDescription: ${img.long||'N/A'}\n\n`
    })
    return s;
  }
  updateDOM(): false {
    return false;
  }
  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const div = document.createElement('div');
    div.setAttribute('data-image-list',JSON.stringify(this.getImageList()));
    div.setAttribute('data-image-carousel',"true");
    const maxHeightTemp = this.getMaxHeight();
    const maxHeight = Math.min(maxHeightTemp,GET_MAX_IMAGE_HEIGHT(editor._editorType));
    div.style.setProperty("min-height",maxHeight.toFixed(0).concat('px'));
    div.style.setProperty("max-height",maxHeight.toFixed(0).concat('px'));
    div.style.setProperty("height",maxHeight.toFixed(0).concat('px'));
    div.classList.add('block');
    return {element: div};
  }
  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (domNode.getAttribute('data-image-carousel')!=="true") {
          return null;
        }
        return {
          conversion: convertCarouselImageElement,
          priority: COMMAND_PRIORITY_CRITICAL,
        };
      },
    };
  }

  isInline(): false {
    return false;
  }
  decorate(editor: LexicalEditor, config: EditorConfig) {
    const element = editor.getElementByKey(this.__key);
    if (element) {
      if (element.children.length===0){
        const carousel = createCarouselImageElement(editor,this.getImageList(),this.__key);
        element.append(carousel);
      }
    }
    return document.createElement('div');
  }
}

function convertCarouselImageElement(div: HTMLElement) {
  try {
    const imageListStr = div.getAttribute('data-image-list');
    var imageList = JSON.parse(imageListStr as string);
    imageList = imageList.filter((obj: any) => {
      return Boolean(
        obj 
        && typeof obj.src==='string'
        && typeof obj.short==='string' 
        && typeof obj.long==='string'
        && typeof obj.width==="number"
        && typeof obj.height==="number"
      );
    }) as InsertCarouselCommandPayload;
    if (!!!imageList.length) throw new Error('No Valid Images in ImageType array.');
    const node = $createCarouselImageNode(imageList);
    return { node };
  } catch (error) {
    return null;
  }
  
}


function getCarouselClick(key:string) {
  const onCarouselClick = function (this:HTMLDivElement){
    const lexical_wrapper = this.closest('div.lexical-wrapper');
    if (lexical_wrapper) {
      const id = lexical_wrapper.id;
      if (id) {
        const editor = getEditorInstances()[id];
        if(editor){
          editor.dispatchCommand(CAROUSEL_CLICK,key);
        }
      }
    }
  }
  return onCarouselClick;
}

function resizeImageObj(editor:LexicalEditor,obj:{width:number;height:number;}) {
  const aspectRatio = obj.width/obj.height;
  const maxWidth = GET_MAX_IMAGE_WIDTH(editor._editorType);
  const maxHeight = GET_MAX_IMAGE_HEIGHT(editor._editorType);
  if (aspectRatio>1.2) { // like saying if width is greater than height
    if (obj.width>maxWidth) {
      const newWidth = maxWidth;
      const newHeight = newWidth/aspectRatio;
      return { width: Number(newWidth.toFixed(1)), height: Number(newHeight.toFixed(1)) };
    } else {
      return { width: Number(obj.width.toFixed(1)), height: Number(obj.height.toFixed(1)) };
    }
  } else {
    if (obj.height>maxHeight) {
      const newHeight = maxHeight;
      const newWidth = newHeight*aspectRatio;
      return { width: Number(newWidth.toFixed(1)), height: Number(newHeight.toFixed(1)) };
    } else {
      return { width: Number(obj.width.toFixed(1)), height: Number(obj.height.toFixed(1)) };
    }
  }
}


function createCarouselImageElement(editor:LexicalEditor,imageList:InsertCarouselCommandPayload,key:NodeKey) {
  const track = document.createElement('div');
  track.addEventListener('click',getCarouselClick(key));
  track.className = "splide__track";
  track.style.setProperty("padding-bottom",'1rem','important');
  const list = document.createElement('ul');
  list.className="splide__list";
  const newImageList = imageList.map((obj) => {
    const { width, height } = resizeImageObj(editor,obj);
    return { ...obj, width, height };
  });
  const maxHeight = newImageList.sort((a,b) => b.height-a.height)[0].height;
  for (let imageObj of imageList) {
    const listitem = document.createElement('li');
    listitem.className="splide__slide";
    const image = document.createElement('img');
    image.className="carousel-image";
    image.setAttribute('src',imageObj.src);
    image.setAttribute('alt',imageObj.short);
    image.setAttribute('data-text',imageObj.long);
    image.setAttribute('width',String(imageObj.width));
    image.setAttribute('height',String(imageObj.height));
    image.style.setProperty('width',String(imageObj.width).concat('px'));
    image.style.setProperty('height',String(imageObj.height).concat('px'));
    image.style.setProperty('max-height',String(maxHeight).concat('px'),'important');
    image.style.setProperty("max-width","100%",'important');
    listitem.append(image);
    list.append(listitem);
  } 
  track.append(list);
  const wrapper = document.createElement('div');
  wrapper.className = "splide rich-text-editor";
  wrapper.setAttribute('role','group');
  wrapper.setAttribute('aria-label','Image List');
  wrapper.append(track);
  return wrapper;
}


export function $isCarouselImageNode(
  node: LexicalNode|null|undefined
):node is CarouselImageNode {
  return node instanceof CarouselImageNode;
}
export function $createCarouselImageNode(imageList: InsertCarouselCommandPayload) {
  return new CarouselImageNode(imageList);
}

export const INSERT_CAROUSEL_COMMAND: LexicalCommand<InsertCarouselCommandPayload> = createCommand('INSERT_CAROUSEL_COMMAND');

