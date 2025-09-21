import jsdom from 'jsdom';
import { 
  createHeadlessEditor 
} from "./lexical-headlessLexicalHeadless";
import { 
  EDITOR_THEME 
} from './EDITOR_THEME';
import { 
  ListNode, 
  ListItemNode 
} from './lexical-listLexicalList';
import { 
  HeadingNode, 
  QuoteNode 
} from './lexical-rich-textLexicalRichText';
import { 
  AbbreviationNode,
  LinkNode, 
  SectionHeadingNode
} from './lexical-linkLexicalLink';
import { 
  YouTubeNode, 
  HorizontalRuleNode, 
  NewsNode, 
  AudioNode, 
  VideoNode, 
  CarouselImageNode, 
  ImageNode,
  TwitterNode,
  InstagramNode,
  TikTokNode, 
  LoadingNode,
  AiChatNode
} from './lexical-decoratorsLexicalDecorators';
import { 
  MathNode 
} from './lexical-mathLexicalMath';
import { 
  CodeNode,
  CodeHighlightNode 
} from './lexical-codeLexicalCode';
import { 
  TableNode,
  TableRowNode,
  TableCellNode, 
  CellParagraphNode
} from './lexical-tableLexicalTable';
import { 
  AsideNode 
} from './lexical-asideLexicalAside';
import { 
  DetailsNode, 
  AccordionContentNode 
} from './lexical-detailsLexicalDetails';
import { 
  $generateHtmlFromNodes, 
  $generateNodesFromDOM
} from './lexical-htmlLexicalHtml';
import {
  $getRoot, 
  $insertNodes, 
  $nodesOfType,
  ElementNode,
  ParagraphNode,
  RootNode,
  TableWrapperNode, 
} from './lexicalLexical';
import { 
  TextNode, 
  ExtendedTextNode
} from './lexicalLexical';
import { HtmlNode } from './lexical-decoratorsLexicalDecorators';
import { getStyleObjectFromCSS } from './lexical-selectionLexicalSelection';
import { LayoutContainerNode, LayoutItemNode } from './lexical-columnLexicalColumn';
import { Spread, TableOfContentsItem } from '../types';
import { purifyUserInputHTMLForLexical, updateCustomHTMLLexical } from '../ROUTER/functions/markdown';
import { $createAnnotationNode, $isAnnotationNode, AnnotationNode, AutocompleteNode } from './lexical-toolbarLexicalToolbar';
import { createEmbedding, getAnnotationQuery } from '../ai';
import getDatabase from '../database';
import pgvector from 'pgvector';
import { OverflowNode } from './lexical-overflowLexicalOverflow';
import { DbAudioInformationLexical, DbImageInformationLexical, DbVideoInformationLexical, getAudioInformationLexical, getImagesInformationLexical, getVideoInformationLexical } from '../aws/mediaHelpers';
import { addItemsToSet } from '../utils/set';
import { validateInstagramEmbed, validateTikTokEmbed, validateTwitterEmbed } from '../utils/socialMedia';

const { JSDOM, ResourceLoader } = jsdom;
/*
Type: Full Nodes:
ListNode,
ListItemNode,
HeadingNode,
QuoteNode,
LinkNode,
YouTubeNode,
HorizontalRuleNode,
MathNode,
CodeNode,
CodeHighlightNode,
TableNode,
TableRowNode,
TableCellNode,
CellParagraphNode, 
AudioNode,
VideoNode,
CarouselImageNode,
ImageNode,
NewsNode,
AsideNode,
DetailsNode,
AccordionContentNode
*/
/*
Type Poll Question | Poll Option:
OverflowNode
*/

/**
 * Set UserAgent Here Reference:
 * https://github.com/jsdom/jsdom/issues/3325
 */

const NSFW_BARRIER = 90;
// This is on the frontend as well
const STRING_TO_NODE = {
  "ImageNode": ImageNode,
  "AudioNode": AudioNode,
  "VideoNode": VideoNode,
  "YouTubeNode": YouTubeNode,
  "NewsNode": NewsNode,
  "TwitterNode": TwitterNode,
  "TikTokNode": TikTokNode,
  "InstagramNode": InstagramNode,
  "HTMLNode": HtmlNode,
  "TableNode": TableNode,
  "MathNode": MathNode
} as const;
const STRING_TO_NODE_STRING = {
  "ImageNode": "Image",
  "AudioNode": "Audio Element",
  "VideoNode": "Video Element",
  "YouTubeNode": "YouTube Video",
  "NewsNode": "News Link",
  "TwitterNode": "Twitter Embed",
  "TikTokNode": "TikTok Embed",
  "InstagramNode": "Instagram Embed",
  "HTMLNode": "HTML node",
  "TableNode": "Table",
  "MathNode": "Block Math node"
} as const;
type NodeTypeString = "ImageNode"|"AudioNode"|"VideoNode"|"YouTubeNode"|"NewsNode"|"TwitterNode"|"TikTokNode"|"InstagramNode"|"HTMLNode"|"TableNode"|"MathNode";
type CommentNodeRestiction = {"count": number, "nodes": NodeTypeString[]}[]
const DEFAULT_NODE_RESTRICTION:CommentNodeRestiction = [
  {"count": 1, "nodes": ["ImageNode","AudioNode","VideoNode","YouTubeNode","NewsNode","TwitterNode","TikTokNode","InstagramNode"]},
  {"count": 1, "nodes": ["HTMLNode","TableNode","MathNode"]},
]
export type ParsedArticleReturn = {
  editorState: any, 
  mobile_html: string, 
  tablet_html: string, 
  desktop_html: string, 
  innerText: string, 
  tableOfContents: {id: string, text: string}[],
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[] 
}
export type ParsedEditorStateReturn = {
  editorState: any, 
  mobile_html: string, 
  tablet_html: string, 
  desktop_html: string, 
  innerText: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[] 
}

/**
 * 
 * Source for UserAgents: https://www.link-assistant.com/seo-wiki/user-agent/#:~:text=Types%20of%20User%20Agents,-There%20are%20many&text=Examples%20include%20Google%20Chrome%2C%20Mozilla,the%20responses%20to%20the%20user.
 * @param type 
 */
export function initializeDomInNode(type:'mobile'|'tablet'|'desktop'="desktop",html:string='') {
  global.HTMLElement = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>').window.HTMLElement
  var userAgent: string;
  if (type==="mobile") {
    userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
  } else if (type==="tablet") {
    userAgent = "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
  } else {
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
  }
  global.userAgent = userAgent;
  const loader = new ResourceLoader({
    userAgent
  });
  const dom = new JSDOM(html,{ resources: loader });
  // @ts-ignore
  global.window = dom.window
  global.document = dom.window.document
  global.DocumentFragment = dom.window.DocumentFragment;
  return dom;
}

export function removeDOMFromNode() {
  // @ts-ignore
  global.window = undefined;
  (global as any).HTMLElement = undefined;
}

export function getLexicalInnerText(rootNodeTextContent:string) {
  return rootNodeTextContent.replace(/(\s+|\n)/g,' ').replace(/-{3}/g,'')
}

export function $setFirstLexicalElement(rootNode:any) {
  const children = rootNode.getChildren();
  var set_first_element = false;
  for (let child of children) {
    if ($isAnnotationNode(child)) continue;
    else if (!!!set_first_element) {
      child.setFirstElement(true);
      set_first_element = true;
    } else {
      if (child.getFirstElement()) child.setFirstElement(false);
    }
  }
}
export function $setLastLexicalElement(rootNode:any) {
  const children = rootNode.getChildren();
  var set_last_element = false;
  for (let j=children.length-1; j>-1; j--) {
    const child = children[j];
    if ($isAnnotationNode(child)) continue;
    else if (!!!set_last_element) {
      child.setLastElement(true);
      set_last_element = true;
    } else {
      if (child.getFirstElement()) child.setLastElement(false);
    }
  }
}
export function $getTableOfContents() {
  const tableOfContents:{id:string,text:string}[] = [];
  const sectionHeadingNodes = $nodesOfType(SectionHeadingNode) as SectionHeadingNode[];
  if (sectionHeadingNodes) {
    sectionHeadingNodes.forEach((node)=> {
      const id = node.getId();
      const innerText = node.getTextContent().replace(/(\s+|\n)/g,' ').trim().slice(0,50);
      tableOfContents.push({ id, text: innerText });
    })
  }
  return tableOfContents;
}
export function $getImages() {
  const images = $nodesOfType(ImageNode).map((obj:ImageNode) => {
    const url = obj.getSrc();
    const short = obj.getShort();
    const long = obj.getLong();
    const width = obj.getWidth() as number;
    const height = obj.getHeight() as number;
    var caption = '';
    if (short) caption +=short;
    if (long) caption+=': '+long;
    return { url, caption, width, height };
  }); 
  const carouselImages = $nodesOfType(CarouselImageNode) as CarouselImageNode[];
  for (let obj of carouselImages) {
    const imageList = obj.getImageList();
    for (let img of imageList) {
      images.push({ url: img.src, caption: "Title: " + img.short + "\nDescription: " + img.long, width: img.width, height: img.height });
    }
  }
  return images;
}
export function $getVideos() {
  return $nodesOfType(VideoNode).map((obj:VideoNode) => {
    const url = obj.getSrc();
    const short = obj.getTitle();
    const long = obj.getDescription();
    const height = obj.getHeight();
    var caption = '';
    if (short) caption+= "Title: " + short;
    if (short&&long) caption+='\n';
    if (long) caption+='Description: ' + long;
    return { url, caption, height }
  }); 
}
export function $getAudio() {
  return $nodesOfType(AudioNode).map((obj:AudioNode) => {
    const url = obj.getSrc();
    const short = obj.getTitle();
    var caption = '';
    if (short) caption+= "Title: " + short;
    return { url, caption }
  }); 
} 
type CustomHTMLImageInfo = {
  url: string;
  caption: string;
  width: number | undefined;
  height: number | undefined;
}[];
type CustomHTMLAudioInfo = string[];
type CustomHTMLVideoInfo = {
  url: string;
  height: number | undefined;
}[];
/**
 * PurifyDOM and get DOM information
 * @returns 
 */
export function $getCustomHTMLMediaAndPurifyDOM() {
  const htmlNodes = $nodesOfType(HtmlNode) as HtmlNode[];
  var images:CustomHTMLImageInfo = [];
  var audio:CustomHTMLAudioInfo = [];
  var video:CustomHTMLVideoInfo = [];
  for (let htmlNode of htmlNodes) {
    const html = htmlNode.getHtml() as string;
    const { html:newHTML, images:newImages, audio:newAudio, video:newVideo } = purifyUserInputHTMLForLexical(html);
    htmlNode.setHtml(newHTML);
    images = images.concat(newImages);
    audio = audio.concat(newAudio);
    video = video.concat(newVideo);
  }
  return { images, audio, video };
}
type ImageList = {
  width: number;
  height: number;
  src: string;
  short: string;
  long: string;
}[];
type in_images_type = { url: string, caption: string, width: number|undefined, height: number|undefined }[];
type in_audio_type = string[];
type in_video_type = { url: string, height: number|undefined }[];
export type UpdateCustomHtmlLexical = { in_images: {[key:string]: DbImageInformationLexical}, in_audio: {[key:string]: DbAudioInformationLexical}, in_video: {[key:string]: DbVideoInformationLexical} };

async function getImageUrlToInfo(in_images:in_images_type) {
  const resp = await getImagesInformationLexical(in_images.map((obj) => ({ url: obj.url, caption: obj.caption})));
  const urlToInfo:{[key:string]: DbImageInformationLexical} = {};
  for (let obj of resp) {
    if (obj===null) continue;
    urlToInfo[obj.url] = { ...obj }
  }
  return urlToInfo;
}
async function getAudioUrlToInfo(in_audio:in_audio_type) {
  const resp = await getAudioInformationLexical(in_audio);
  const urlToInfo:{[key:string]: DbAudioInformationLexical} = {};
  for (let obj of resp) {
    if (obj===null) continue;
    urlToInfo[obj.url] = { ...obj }
  }
  return urlToInfo;
}
async function getVideoUrlToInfo(in_video:in_video_type) {
  const resp = await getVideoInformationLexical(in_video.map((obj) => obj.url));
  const urlToInfo:{[key:string]: DbVideoInformationLexical} = {};
  for (let obj of resp) {
    if (obj===null) continue;
    urlToInfo[obj.url] = { ...obj }
  }
  return urlToInfo;
}

/**
 * 
 * @param images Images in the editor
 * @param nsfw_handle How to handle nsfw content
 * @returns contains_nsfw: Whether or not the editor contains nsfw (should only happen when nsfw_handle ='notify') (note that if able_to_validate is false then the editor may still contain nwfw images), able_to_validate: whether or not the database had inofrmation on all the image nodes 
 */
function $updateImages(urlToInfo:{[key:string]: DbImageInformationLexical},nsfw_handle:'remove'|'notify'|'set_src') {
  var contains_nsfw = false;
  var able_to_validate = true;
  const unvalidated_urls:string[] = [];
  const imageNodes = $nodesOfType(ImageNode) as ImageNode[];
  imageNodes.forEach((obj) => {
    const url = obj.getSrc();
    const short = obj.getShort();
    const long = obj.getLong();
    if (urlToInfo[url]) {
      const imageInfoObj = urlToInfo[url];
      if (!!!short.length&&imageInfoObj.ai_caption) {
        obj.setShort("AI Caption: ".concat(imageInfoObj.ai_caption));
      } else if (!!!long.length&&imageInfoObj.ai_caption) {
        obj.setLong("AI Caption: ".concat(imageInfoObj.ai_caption));
      }
      if (Number.isInteger(imageInfoObj.nsfw)&&Number(imageInfoObj.nsfw)>90) {
        if (nsfw_handle==="remove") obj.remove(true);
        else if (nsfw_handle==="notify") contains_nsfw = true;
        else if (nsfw_handle==="set_src") obj.setSrc("https://cdn.storething.org/frankmbrown/asset/default-image.png");
      } else if (!!!Number.isInteger(imageInfoObj.nsfw)) {
        able_to_validate = false;
        unvalidated_urls.push(url);
      }
    } else {
      able_to_validate = false;
      unvalidated_urls.push(url);
    }
  });
  const carouselImageNodes = $nodesOfType(CarouselImageNode) as CarouselImageNode[];
  carouselImageNodes.forEach((node) => {
    const image_list = node.getImageList() as ImageList;
    const new_image_list:ImageList = [];
    for (let i = 0; i < image_list.length; i++) {
      const obj = image_list[i];
      const url = obj.src;
      const short = obj.short;
      const long = obj.long;
      if (urlToInfo[url]) {
        const imageInfoObj = urlToInfo[url];
        if (!!!short.length&&imageInfoObj.ai_caption) {
          obj.short = "AI Caption: ".concat(imageInfoObj.ai_caption);
        } else if (!!!long.length&&imageInfoObj.ai_caption) {
          obj.long = "AI Caption: ".concat(imageInfoObj.ai_caption);
        }
        if (Number.isInteger(imageInfoObj.nsfw)&&Number(imageInfoObj.nsfw)>90) {
          if (nsfw_handle==="remove") {
            continue;
          } else if (nsfw_handle==="notify") {
            contains_nsfw = true;
          } else if (nsfw_handle==="set_src") {
            obj.src = "https://cdn.storething.org/frankmbrown/asset/default-image.png";
          }
        } else if (!!!Number.isInteger(imageInfoObj.nsfw)) {
          able_to_validate = false;
          unvalidated_urls.push(url);
        }
        const { width, height } = imageInfoObj;
        if (!!!obj.width&&width) obj.width = width;
        if (!!!obj.height&&height) obj.height = height;
        new_image_list.push(structuredClone(obj));
      } else {
        able_to_validate = false;
        unvalidated_urls.push(url);
        new_image_list.push(structuredClone(obj));
      }
    }
    node.setImageList(new_image_list);
  })
  return { contains_nsfw, able_to_validate, unvalidated_urls }
}
function $updateVideo(urlToInfo:{[key:string]: DbVideoInformationLexical},nsfw_handle:'remove'|'notify'|'set_src') {
  var contains_nsfw = false;
  var able_to_validate = true;
  const videoNodes = $nodesOfType(VideoNode) as VideoNode[];
  const unvalidated_urls:string[] = [];
  videoNodes.forEach((node) => {
    const src = node.getSrc();
    if (urlToInfo[src]) {
      const { flagged, text, height, width } = urlToInfo[src];
      if (height&&!!!node.getHeight()) {
        node.setHeight(height);
      }
      if (flagged===null) {
        able_to_validate = false;
        unvalidated_urls.push(src);
      } else {
        if (flagged) {
          if (nsfw_handle==="remove") node.remove(true);
          else if (nsfw_handle==="set_src") node.setSrc("https://audio.storething.org/frankmbrown/default-video.mp4");
          else if (nsfw_handle==="notify") contains_nsfw = true;
        }
      }
      if (typeof text==="string") {
        node.setText(text);
      }
    } else {
      able_to_validate = false;
      unvalidated_urls.push(src);
    }
  })
  return { able_to_validate, contains_nsfw, unvalidated_urls }
}
function $updateAudio(urlToInfo:{[key:string]: DbAudioInformationLexical},nsfw_handle:'remove'|'notify'|'set_src') {
  var contains_nsfw = false;
  var able_to_validate = true;
  const unvalidated_urls:string[] = [];
  const audioNodes = $nodesOfType(AudioNode) as AudioNode[];
  audioNodes.forEach((node) => {
    const src = node.getSrc();
    if (urlToInfo[src]) {
      const { flagged, text } = urlToInfo[src];
      if (flagged===null) {
        able_to_validate = false;
        unvalidated_urls.push(src);
      } else {
        if (flagged) {
          if (nsfw_handle==="remove") node.remove(true);
          else if (nsfw_handle==="set_src") node.setSrc("https://video.storething.org/frankmbrown/default-video.mp4");
          else if (nsfw_handle==="notify") contains_nsfw = true;
        }
      }
      if (typeof text==="string") {
        node.setText(text);
      }
    } else {
      able_to_validate = false;
      unvalidated_urls.push(src);
    }
  })
  return { able_to_validate, contains_nsfw, unvalidated_urls };
}
export function $updateCustomHTML(media:UpdateCustomHtmlLexical,nsfw_handle:'remove'|'notify'|'set_src') {  
  const htmlNodes = $nodesOfType(HtmlNode) as HtmlNode[];
  var contains_nsfw = false;
  var able_to_validate = true;
  var unvalidated_image_urls:string[] = [];
  var unvalidated_audio_urls:string[] = [];
  var unvalidated_video_urls:string[] = [];
  for (let htmlNode of htmlNodes) {
    const html = htmlNode.getHtml() as string;
    const {html:newHTML, contains_nsfw:contains_nsfw_new, able_to_validate:able_to_validate_new, unvalidated_image_urls:new_unvalidated_image_urls, unvalidated_audio_urls:new_unvalidated_audio_urls, unvalidated_video_urls:new_unvalidated_video_urls } = updateCustomHTMLLexical(html,media,nsfw_handle);
    htmlNode.setHtml(newHTML);
    contains_nsfw = Boolean(contains_nsfw||contains_nsfw_new);
    able_to_validate = Boolean(able_to_validate&&able_to_validate_new);
    unvalidated_image_urls = unvalidated_image_urls.concat(new_unvalidated_image_urls);
    unvalidated_audio_urls = unvalidated_audio_urls.concat(new_unvalidated_audio_urls);
    unvalidated_video_urls = unvalidated_video_urls.concat(new_unvalidated_video_urls);
  }
  return { contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls };
}
function $containsNode(node:any) {
  try {
    const nodes = $nodesOfType(node);
    if (nodes.length>=1) return true;
    else return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}
function $removeOpeningAndTrailingEmptyNodes() {
  const root = $getRoot();
  if (root) {
    const topLevelChildren = root.getChildren();
    const isEmpty = (el:ElementNode) => Boolean(el.isEmpty()||el.getTextContent().trim().length===0);
    var children_length_curr = topLevelChildren.length;
    for (let i = 0; i < topLevelChildren.length; i++) {
      if (children_length_curr===1) break;
      if (topLevelChildren[i] instanceof ElementNode&&isEmpty(topLevelChildren[i])) {
        topLevelChildren[i].remove();
        children_length_curr -= 1;
      } else {
        break;
      }
    }
    for (let i = topLevelChildren.length-1; i>-1; i--) {
      if (children_length_curr===1) break;
      if (topLevelChildren[i] instanceof ElementNode&&isEmpty(topLevelChildren[i])) {
        topLevelChildren[i].remove();
        children_length_curr -= 1;
      } else {
        break;
      }
    }
  }
}
function $removeAutocompleteNodes() {
  const autocompleteNodes = $nodesOfType(AutocompleteNode);
  autocompleteNodes.forEach((node) => node.remove(false));
}
function $removeLoadingNodes() {
  const loadingNodes = $nodesOfType(LoadingNode);
  loadingNodes.forEach((n) => n.remove(false));
}
function $validateOrRemoveSocialMedia() {
  const twitterNodes = $nodesOfType(TwitterNode);
  twitterNodes.forEach((obj:TwitterNode) => {
    const html = obj.getHTML();
    try {
      validateTwitterEmbed(html);
    } catch (e) {
      console.error("Invalid Twitter Node");''
      console.error(e);
      obj.remove(true);
    }
  })
  const instagramNodes = $nodesOfType(InstagramNode);
  instagramNodes.forEach((obj:InstagramNode)=> {
    const html = obj.getHTML();
    try {
      validateInstagramEmbed(html);
    } catch (e) {
      console.error("Invalid Instagram Node");
      console.error(e);
      obj.remove(true);
    }
  })
  const tiktokNodes = $nodesOfType(TikTokNode);
  tiktokNodes.forEach((obj:TikTokNode)=> {
    const html = obj.getHTML();
    try {
      validateTikTokEmbed(html);
    } catch (e) {
      console.error("Invalid TikTok Node.");
      console.error(e);
      obj.remove(true);
    } 
  })
}
function $applyCommonEditorTransformations(lexicalState:any,getEditor:typeof getFullLexicalEditor) {
  initializeDomInNode('desktop');
  var current_editor_state = lexicalState;
  var current_editor = getEditor();
  var parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state),undefined);
  current_editor.setEditorState(parsedEditorState,undefined);
  current_editor.update(() => {
    $removeOpeningAndTrailingEmptyNodes();
    $removeAutocompleteNodes(); 
    $removeLoadingNodes();
    $validateOrRemoveSocialMedia();
  },{discrete:true});
  current_editor_state = current_editor.getEditorState().toJSON();
  removeDOMFromNode();
  return current_editor_state;
}

async function getSafeLexicalState(lexicalState:any,getEditor:typeof getFullLexicalEditor,restrictions?:CommentNodeRestiction) {
  initializeDomInNode('desktop');
  var current_editor_state = lexicalState;
  var current_editor = getEditor();
  var parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state),undefined);
  current_editor.setEditorState(parsedEditorState,undefined);
  var in_images:in_images_type=[], in_audio: in_audio_type=[], in_video: in_video_type=[];
  // Get Media Info and update DOM
  current_editor.update(() => {
    in_images = $getImages();
    in_audio = $getAudio().map((obj) => obj.url);
    in_video = $getVideos();
    const custom_html = $getCustomHTMLMediaAndPurifyDOM();
    in_images = in_images.concat(custom_html.images);
    in_audio = in_audio.concat(custom_html.audio);
    in_video = in_video.concat(custom_html.video);
    if (restrictions) {
      for (let i = 0; i < restrictions.length; i++) {
        const nodeArray = restrictions[i].nodes;
        const count = restrictions[i].count;
        const restrictedNodesArray:any[] = [];
        for (let j = 0; j < nodeArray.length; j++) {
          const nodeTypeString = nodeArray[j];
          const NodeClass = STRING_TO_NODE[nodeTypeString];
          if (nodeTypeString==="MathNode") {
            restrictedNodesArray.push(...$nodesOfType(NodeClass).filter((node) => !!!(node as MathNode).isInline()));
          } else {
            restrictedNodesArray.push(...$nodesOfType(NodeClass));
          }
        }
        if (restrictedNodesArray.length>count) {
          const sortedRestrictedNodeArray = restrictedNodesArray.sort((a,b) => parseInt(b.getKey())-parseInt(a.getKey()));
          for (let j=count;j<restrictedNodesArray.length;j++) {
            sortedRestrictedNodeArray[j].remove();
          }
        }
      }
    }
  },{ discrete: true });
  current_editor_state = current_editor.getEditorState().toJSON();
  const imageURLToInfo = await getImageUrlToInfo(in_images);
  const audioURLToInfo = await getAudioUrlToInfo(in_audio);
  const videoURLToInfo = await getVideoUrlToInfo(in_video);
  current_editor = getEditor();
  parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state),undefined);
  current_editor.setEditorState(parsedEditorState,undefined);
  var contains_nsfw = false, able_to_validate = true, unvalidated_image_urls = new Set<string>(), unvalidated_audio_urls = new Set<string>(),unvalidated_video_urls = new Set<string>();
  current_editor.update(() => {
    const { contains_nsfw:contains_nsfw_image, able_to_validate:able_to_validate_image, unvalidated_urls:unvalidated_image_urls_new } = $updateImages(imageURLToInfo,'remove');
    const  { contains_nsfw:contains_nsfw_audio, able_to_validate:able_to_validate_audio, unvalidated_urls:unvalidated_audio_urls_new } = $updateAudio(audioURLToInfo,'remove');
    const  { contains_nsfw:contains_nsfw_video, able_to_validate:able_to_validate_video, unvalidated_urls:unvalidated_video_urls_new } = $updateVideo(videoURLToInfo,'remove');
    const  { contains_nsfw:contains_nsfw_custom, able_to_validate:able_to_validate_custom, unvalidated_image_urls:unvalidated_image_urls_2, unvalidated_audio_urls:unvalidated_audio_urls_2, unvalidated_video_urls:unvalidated_video_urls_2  } = $updateCustomHTML({in_images:imageURLToInfo,in_audio:audioURLToInfo,in_video:videoURLToInfo},'remove');
    contains_nsfw = contains_nsfw||contains_nsfw_image||contains_nsfw_audio||contains_nsfw_video||contains_nsfw_custom;
    able_to_validate = able_to_validate&&able_to_validate_image&&able_to_validate_audio&&able_to_validate_video&&able_to_validate_custom;
    addItemsToSet(unvalidated_image_urls_new,unvalidated_image_urls);
    addItemsToSet(unvalidated_image_urls_2,unvalidated_image_urls);
    addItemsToSet(unvalidated_audio_urls_new,unvalidated_audio_urls);
    addItemsToSet(unvalidated_audio_urls_2,unvalidated_audio_urls);
    addItemsToSet(unvalidated_video_urls_new,unvalidated_video_urls);
    addItemsToSet(unvalidated_video_urls_2,unvalidated_video_urls);
    const root = $getRoot();
    if (root) {
      $setFirstLexicalElement(root);
      $setLastLexicalElement(root);
    }
  },{ discrete: true });
  current_editor_state = current_editor.getEditorState().toJSON();
  removeDOMFromNode();
  return { state: current_editor_state, able_to_validate, contains_nsfw, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls };
}
async function parseLexicalDifferentSizes(lexicalState:any,getEditor:typeof getFullLexicalEditor,restrictions?:CommentNodeRestiction) {
  const retObj: ParsedArticleReturn = {
    editorState: lexicalState,
    mobile_html: '',
    tablet_html: '',
    desktop_html: '',
    innerText: '',
    tableOfContents: [],
    contains_nsfw: false, 
    able_to_validate: true, 
    unvalidated_image_urls: [], 
    unvalidated_audio_urls: [], 
    unvalidated_video_urls: []
  };
  try {
    const { state, contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls } = await getSafeLexicalState(lexicalState,getFullLexicalEditor);
    const new_lexical_state = $applyCommonEditorTransformations(state,getEditor);
    retObj.able_to_validate = able_to_validate;
    retObj.contains_nsfw = contains_nsfw;
    retObj.unvalidated_audio_urls = Array.from(unvalidated_audio_urls);
    retObj.unvalidated_image_urls = Array.from(unvalidated_image_urls);
    retObj.unvalidated_video_urls = Array.from(unvalidated_video_urls);
    for (let device of ["mobile", "tablet" , "desktop"] as const) {
      initializeDomInNode(device);
      const headlessEditor = getEditor();
      const parsedEditorState = headlessEditor.parseEditorState(new_lexical_state,undefined);
      headlessEditor.setEditorState(parsedEditorState,undefined);
      headlessEditor.update(() => {
        const html = $generateHtmlFromNodes(headlessEditor,null);
        const rootNode = $getRoot();
        if(rootNode) {
          if (device==="mobile") {
            retObj.tableOfContents = $getTableOfContents();
            retObj.editorState = headlessEditor.getEditorState().toJSON();
            retObj.mobile_html = html; 
            retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g,' ').replace(/-{3}/g,'');
          } else if (device==="tablet") {
            retObj.tablet_html = html;
          } else if (device==="desktop") {
            retObj.desktop_html = html;
          }
        }
      },undefined);
      removeDOMFromNode();
    }
    if (!!!retObj.desktop_html.length) throw new Error("Something went wrong parsing the lexical state.")
    return retObj;
  } catch (e) {
    removeDOMFromNode();
    console.error(e);
    throw new Error('Something went wrong parsing the lexical editor.');
  }
}
async function parseLexicalOneSize(lexicalState:any,getEditor:typeof getFullLexicalEditor) {
  const retObj = {
    editorState: lexicalState,
    html: '',
    innerText: '',
    tableOfContents: [] as TableOfContentsItem[]
  };
  try {
    const {state} = await getSafeLexicalState(lexicalState,getFullLexicalEditor);
    const new_lexical_state = $applyCommonEditorTransformations(state,getEditor);
    initializeDomInNode('desktop');
    const headlessEditor = getEditor();
    const parsedEditorState = headlessEditor.parseEditorState(new_lexical_state,undefined);
    headlessEditor.setEditorState(parsedEditorState,undefined);
    headlessEditor.update(() => {
      const html = $generateHtmlFromNodes(headlessEditor,null);
      const rootNode = $getRoot();
      if(rootNode) {
        retObj.editorState = headlessEditor.getEditorState().toJSON();
        retObj.html = html; 
        retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g,' ').replace(/-{3}/g,'');
      }
    },undefined);
    removeDOMFromNode();
    if (!!!retObj.html.length) throw new Error("Something went wrong parsing the lexical state.")
    return retObj;
  } catch (e) {
    removeDOMFromNode();
    console.error(e);
    throw new Error('Something went wrong parsing the lexical editor.');
  }
}


/* --------------------------------- CREATE HEADLESS EDITORS ----------------------- */
export function getFullLexicalEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode, 
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      LinkNode,
      SectionHeadingNode,
      YouTubeNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      CarouselImageNode,
      ImageNode,
      NewsNode,
      AsideNode,
      DetailsNode,
      AccordionContentNode,
      HtmlNode,
      TwitterNode,
      InstagramNode,
      TikTokNode,
      LayoutContainerNode,
      LayoutItemNode,
      AbbreviationNode,
      AutocompleteNode,
      LoadingNode,
      AiChatNode
    ],
    editorType: 'full'
  });
  return headlessEditor;
}
export function getCommentLexicalEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      YouTubeNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      CarouselImageNode,
      ImageNode,
      NewsNode,
      HtmlNode,
      AbbreviationNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'comment'
  });
  return headlessEditor;
}
export function getTextOnlyLexicalEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'text-only'
  });
  return headlessEditor;
}
export function getTextWithLinksLexicalEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      LinkNode,
      AbbreviationNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'text-with-links'
  });
  return headlessEditor;
}
export function getTextWithBlockElementsLexicalEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AbbreviationNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'text-block-elements'
  });
  return headlessEditor;
}
export function getAnnotationEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      LinkNode,
      AbbreviationNode,
      AnnotationNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'annotation'
  });
  return headlessEditor;
}
export function getSurveyQuestionEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      YouTubeNode,
      TwitterNode,
      TikTokNode,
      InstagramNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      ImageNode,
      CarouselImageNode,
      NewsNode,
      HtmlNode,
      AbbreviationNode,
      OverflowNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'survey-question'
  });
  return headlessEditor;
}
export function getSurveyOptionEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      CarouselImageNode,
      ImageNode,
      HtmlNode,
      AbbreviationNode,
      OverflowNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'survey-option'
  });
  return headlessEditor;
}
export function getSurveyShortBlogEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      YouTubeNode,
      TwitterNode,
      TikTokNode,
      InstagramNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      ImageNode,
      CarouselImageNode,
      NewsNode,
      HtmlNode,
      AbbreviationNode,
      OverflowNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'short-blog'
  });
  return headlessEditor;
}
export function getSurveyRangeDescriptionEditor() {
  const headlessEditor = createHeadlessEditor({
    namespace: '',
    theme: structuredClone(EDITOR_THEME),
    onerror: console.error,
    nodes: [
      ExtendedTextNode,
      { replace: TextNode, with: (node: any) => new ExtendedTextNode(node.__text, node.__key) },
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      HorizontalRuleNode,
      MathNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableWrapperNode,
      TableRowNode,
      TableCellNode,
      CellParagraphNode,
      AudioNode,
      VideoNode,
      CarouselImageNode,
      ImageNode,
      AbbreviationNode,
      OverflowNode,
      AutocompleteNode,
      LoadingNode
    ],
    editorType: 'range-description'
  });
  return headlessEditor;
}


/**
 * Throws an error if a node has color
 * @param editor 
 * @returns 
 */
function testNoColorNodes(editor:ReturnType<typeof getFullLexicalEditor>) {
    editor.getEditorState().read(() => {
      if (editor.hasNode(ParagraphNode)) {
        const paragraphNodes = $nodesOfType(ParagraphNode) as ParagraphNode[];
        paragraphNodes.forEach((node) => {
          const style = node.getBlockStyle();
          if (style.backgroundColor!=='transparent'||style.textColor!=='inherit')  throw new Error("Paragraph node has color.");
        })
      }
      if (editor.hasNode(ExtendedTextNode)) {
        const textNodes = $nodesOfType(ExtendedTextNode) as ExtendedTextNode[];
        textNodes.forEach((node) => {
          if (typeof node.__style==='string') {
            const style = getStyleObjectFromCSS(node.__style);
            if (typeof style['color']==='string'&&style['color'].length&&style['color']!=='inherit') {
              throw new Error('Text node has color.');
            } else if (typeof style['background-color']==='string'&&style['background-color'].length>=1&&style['background-color']!=='transparent') {
              throw new Error('Text node has background color.');
            }
          }
        })
      }
      if (editor.hasNode(HeadingNode)) {
        const headingNodes = $nodesOfType(HeadingNode) as HeadingNode[];
        headingNodes.forEach((node) => {
          const style = node.getBlockStyle();
          if (style.backgroundColor!=='transparent'||style.textColor!=='inherit')  throw new Error("Heading node has color.");
        })
      }
      if (editor.hasNode(ListNode)) {
        const listNodes = $nodesOfType(ListNode) as ListNode[];
        listNodes.forEach((node) => {
          const style = node.getBlockStyle();
          if (style.backgroundColor!=='transparent'||style.textColor!=='inherit')  throw new Error("List node has color.");
        })
      }
    })
}



/* --------------------------------- PARSE LEXICAL EDITORS ----------------------- */

export async function parseArticleLexical(lexicalState: any) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getFullLexicalEditor,undefined);
  return ret;
} 
/**
 * 
 * @param lexicalState JSON.parse(JSON.stringify(editorState.toJSON()));
 */
export async function parseFullLexicalEditor(lexicalState: any) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getFullLexicalEditor,undefined);
  return ret;
}
export async function parseCommentLexicalEditor(lexicalState: any,restriction:CommentNodeRestiction=DEFAULT_NODE_RESTRICTION) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getCommentLexicalEditor,restriction);
  return ret;
}
export async function parseTextOnlyLexicalEditor(lexicalState: any,noColor:boolean=false) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getTextOnlyLexicalEditor,undefined);
  return ret;
}
export async function parseTextWithLinksLexicalEditor(lexicalState: any,noColor:boolean=false) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getTextWithLinksLexicalEditor,undefined);
  return ret;
}
export async function parseTextWithBlockElementsLexicalEditor(lexicalState: any,noColor:boolean=false) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getTextWithBlockElementsLexicalEditor,undefined);
  return ret;
} 
export async function parseSurveyQuestionEditor(lexicalState: any,restriction:CommentNodeRestiction=DEFAULT_NODE_RESTRICTION) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getSurveyQuestionEditor,restriction);
  return ret;
}
export async function parseSurveyOptionEditor(lexicalState: any,restriction:CommentNodeRestiction=DEFAULT_NODE_RESTRICTION) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getSurveyOptionEditor,restriction);
  return ret;
}
export async function parseSurveyShortBlogEditor(lexicalState: any,restriction:CommentNodeRestiction=DEFAULT_NODE_RESTRICTION) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getSurveyShortBlogEditor,restriction);
  return ret;
} 
export async function parseSurveyRangeDescriptionEditor(lexicalState: any,restriction:CommentNodeRestiction=DEFAULT_NODE_RESTRICTION) {
  const ret = await parseLexicalDifferentSizes(lexicalState,getSurveyRangeDescriptionEditor,restriction);
  return ret;
} 

/**
 * This doesn't work perfectly beacuase of instanceOf HTMLElement on the server
 * @param html 
 * @param device 
 * @returns 
 */
export async function getLexicalStateFromHTML(html:string,device:'desktop'|'mobile'|'tablet'='desktop') {
  return new Promise((resolve,reject) => {
    try {
      const dom = initializeDomInNode(device,html);
      const editor = getFullLexicalEditor();
      editor.update(() => {
        const nodes = $generateNodesFromDOM(editor,dom.window.document);
        const root = $getRoot(); 
        if (root) root.select(); 
        $insertNodes(nodes);
      },{discrete: true})
      editor.getEditorState().read(() => {
        const editorState = editor.getEditorState().toJSON();
        removeDOMFromNode();
        resolve(editorState);
      })
    } catch (error) {
      console.error(error);
      reject(error);
    } 
  })
}
 

/* ---------------------- ANNOTATIONS -------------------------- */
type ReturnParsedAnnotation = {
  editorState: object,
  html: string,
  innerText: string,
  text_color: string,
  background_color: string,
  embedding: number[]
}

function getTextColorForRGB(r:number,g:number,b:number) {
  // Calculate relative luminance using the formula:
  // (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Return white (#FFFFFF) for dark backgrounds and black (#000000) for light backgrounds
  return luminance > 0.5 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
}


/**
 * ```sql
 * CREATE TYPE annotation_embedding_classification as ENUM ('positive', 'somewhat positive', 'neutral', 'somewhat negative', 'negative');
  CREATE TABLE annotation_embedding_examples (
    annotation_embedding_example_id smallserial PRIMARY KEY,
    embedding vector (1536) NOT NULL,
    example_text TEXT NOT NULL,
    classification annotation_embedding_classification
  );
 * ```
 * **Need to set character counter for annotation input - max length = 3000 characters**
 * 
 * @param lexicalState 
 * @param param1 
 * @returns 
 */
export async function parsePostedAnnotation(lexicalState: any,{ start, end, content, reference_id }:{ start: number, end: number, content: string, reference_id: string }) {
  try {
    const retObj: ReturnParsedAnnotation = {
      editorState: lexicalState,
      html: '',
      innerText: '',
      background_color: '',
      text_color: '',
      embedding: []
    };
    
    initializeDomInNode('desktop');
    const headlessEditor = getAnnotationEditor();
    const parsedEditorState = headlessEditor.parseEditorState(lexicalState,undefined);
    headlessEditor.setEditorState(parsedEditorState,undefined);
    var tempInnerText:undefined|string = undefined;
    headlessEditor.update(() => {
      const rootNode = $getRoot() as RootNode;
      if (rootNode) tempInnerText = rootNode.getTextContent().replace(/(\n|\s+)/g,' ').replace(/-{3}/g,'');  
      const annotationNodes = $nodesOfType(AnnotationNode);
      annotationNodes.forEach((n) => n.remove());
    },undefined);
    if (!!!tempInnerText) throw new Error("Unable to gennerate intermediate innerText for annotation node");
    const embedding = await createEmbedding(getAnnotationQuery(String(tempInnerText).slice(0,4000)),'text-embedding-ada-002');
    retObj.embedding = embedding;
    const r:number=Math.floor(Math.random()*256);
    const g:number=Math.floor(Math.random()*256);
    const b:number=Math.floor(Math.random()*256);
    const background_color = `rgb(${r},${g},${b})`;
    const text_color =  getTextColorForRGB(r,g,b);
    retObj.background_color = background_color;
    retObj.text_color = text_color;
    const parsedEditorState2 = headlessEditor.parseEditorState(lexicalState,undefined);
    headlessEditor.setEditorState(parsedEditorState2,undefined);
    headlessEditor.update(() => {
      const annotationNode = $createAnnotationNode({ start, end, content, reference_id },{ text_color,background_color });
      const rootNode = $getRoot();
      if(rootNode) {
        rootNode.append(annotationNode);
        const html = $generateHtmlFromNodes(headlessEditor,null);
        retObj.editorState = headlessEditor.getEditorState().toJSON();
        retObj.html = html; 
        retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g,' ').replace(/-{3}/g,' ');
      } else {
        throw new Error("Unable to find root node.");
      }
    },undefined)
    removeDOMFromNode();
    return retObj;
  } catch (error) {
    removeDOMFromNode();
    console.error(error);
    throw new Error('Unable to parse annotation lexical editor.');
  }
}

