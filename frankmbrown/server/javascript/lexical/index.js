"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePostedAnnotation = exports.getLexicalStateFromHTML = exports.parseSurveyRangeDescriptionEditor = exports.parseSurveyShortBlogEditor = exports.parseSurveyOptionEditor = exports.parseSurveyQuestionEditor = exports.parseTextWithBlockElementsLexicalEditor = exports.parseTextWithLinksLexicalEditor = exports.parseTextOnlyLexicalEditor = exports.parseCommentLexicalEditor = exports.parseFullLexicalEditor = exports.parseArticleLexical = exports.getSurveyRangeDescriptionEditor = exports.getSurveyShortBlogEditor = exports.getSurveyOptionEditor = exports.getSurveyQuestionEditor = exports.getAnnotationEditor = exports.getTextWithBlockElementsLexicalEditor = exports.getTextWithLinksLexicalEditor = exports.getTextOnlyLexicalEditor = exports.getCommentLexicalEditor = exports.getFullLexicalEditor = exports.$updateCustomHTML = exports.$getCustomHTMLMediaAndPurifyDOM = exports.$getAudio = exports.$getVideos = exports.$getImages = exports.$getTableOfContents = exports.$setLastLexicalElement = exports.$setFirstLexicalElement = exports.getLexicalInnerText = exports.removeDOMFromNode = exports.initializeDomInNode = void 0;
const jsdom_1 = __importDefault(require("jsdom"));
const lexical_headlessLexicalHeadless_1 = require("./lexical-headlessLexicalHeadless");
const EDITOR_THEME_1 = require("./EDITOR_THEME");
const lexical_listLexicalList_1 = require("./lexical-listLexicalList");
const lexical_rich_textLexicalRichText_1 = require("./lexical-rich-textLexicalRichText");
const lexical_linkLexicalLink_1 = require("./lexical-linkLexicalLink");
const lexical_decoratorsLexicalDecorators_1 = require("./lexical-decoratorsLexicalDecorators");
const lexical_mathLexicalMath_1 = require("./lexical-mathLexicalMath");
const lexical_codeLexicalCode_1 = require("./lexical-codeLexicalCode");
const lexical_tableLexicalTable_1 = require("./lexical-tableLexicalTable");
const lexical_asideLexicalAside_1 = require("./lexical-asideLexicalAside");
const lexical_detailsLexicalDetails_1 = require("./lexical-detailsLexicalDetails");
const lexical_htmlLexicalHtml_1 = require("./lexical-htmlLexicalHtml");
const lexicalLexical_1 = require("./lexicalLexical");
const lexicalLexical_2 = require("./lexicalLexical");
const lexical_decoratorsLexicalDecorators_2 = require("./lexical-decoratorsLexicalDecorators");
const lexical_selectionLexicalSelection_1 = require("./lexical-selectionLexicalSelection");
const lexical_columnLexicalColumn_1 = require("./lexical-columnLexicalColumn");
const markdown_1 = require("../ROUTER/functions/markdown");
const lexical_toolbarLexicalToolbar_1 = require("./lexical-toolbarLexicalToolbar");
const ai_1 = require("../ai");
const lexical_overflowLexicalOverflow_1 = require("./lexical-overflowLexicalOverflow");
const mediaHelpers_1 = require("../aws/mediaHelpers");
const set_1 = require("../utils/set");
const socialMedia_1 = require("../utils/socialMedia");
const { JSDOM, ResourceLoader } = jsdom_1.default;
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
    "ImageNode": lexical_decoratorsLexicalDecorators_1.ImageNode,
    "AudioNode": lexical_decoratorsLexicalDecorators_1.AudioNode,
    "VideoNode": lexical_decoratorsLexicalDecorators_1.VideoNode,
    "YouTubeNode": lexical_decoratorsLexicalDecorators_1.YouTubeNode,
    "NewsNode": lexical_decoratorsLexicalDecorators_1.NewsNode,
    "TwitterNode": lexical_decoratorsLexicalDecorators_1.TwitterNode,
    "TikTokNode": lexical_decoratorsLexicalDecorators_1.TikTokNode,
    "InstagramNode": lexical_decoratorsLexicalDecorators_1.InstagramNode,
    "HTMLNode": lexical_decoratorsLexicalDecorators_2.HtmlNode,
    "TableNode": lexical_tableLexicalTable_1.TableNode,
    "MathNode": lexical_mathLexicalMath_1.MathNode
};
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
};
const DEFAULT_NODE_RESTRICTION = [
    { "count": 1, "nodes": ["ImageNode", "AudioNode", "VideoNode", "YouTubeNode", "NewsNode", "TwitterNode", "TikTokNode", "InstagramNode"] },
    { "count": 1, "nodes": ["HTMLNode", "TableNode", "MathNode"] },
];
/**
 *
 * Source for UserAgents: https://www.link-assistant.com/seo-wiki/user-agent/#:~:text=Types%20of%20User%20Agents,-There%20are%20many&text=Examples%20include%20Google%20Chrome%2C%20Mozilla,the%20responses%20to%20the%20user.
 * @param type
 */
function initializeDomInNode(type = "desktop", html = '') {
    global.HTMLElement = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>').window.HTMLElement;
    var userAgent;
    if (type === "mobile") {
        userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    }
    else if (type === "tablet") {
        userAgent = "Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1";
    }
    else {
        userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    }
    global.userAgent = userAgent;
    const loader = new ResourceLoader({
        userAgent
    });
    const dom = new JSDOM(html, { resources: loader });
    // @ts-ignore
    global.window = dom.window;
    global.document = dom.window.document;
    global.DocumentFragment = dom.window.DocumentFragment;
    return dom;
}
exports.initializeDomInNode = initializeDomInNode;
function removeDOMFromNode() {
    // @ts-ignore
    global.window = undefined;
    global.HTMLElement = undefined;
}
exports.removeDOMFromNode = removeDOMFromNode;
function getLexicalInnerText(rootNodeTextContent) {
    return rootNodeTextContent.replace(/(\s+|\n)/g, ' ').replace(/-{3}/g, '');
}
exports.getLexicalInnerText = getLexicalInnerText;
function $setFirstLexicalElement(rootNode) {
    const children = rootNode.getChildren();
    var set_first_element = false;
    for (let child of children) {
        if ((0, lexical_toolbarLexicalToolbar_1.$isAnnotationNode)(child))
            continue;
        else if (!!!set_first_element) {
            child.setFirstElement(true);
            set_first_element = true;
        }
        else {
            if (child.getFirstElement())
                child.setFirstElement(false);
        }
    }
}
exports.$setFirstLexicalElement = $setFirstLexicalElement;
function $setLastLexicalElement(rootNode) {
    const children = rootNode.getChildren();
    var set_last_element = false;
    for (let j = children.length - 1; j > -1; j--) {
        const child = children[j];
        if ((0, lexical_toolbarLexicalToolbar_1.$isAnnotationNode)(child))
            continue;
        else if (!!!set_last_element) {
            child.setLastElement(true);
            set_last_element = true;
        }
        else {
            if (child.getFirstElement())
                child.setLastElement(false);
        }
    }
}
exports.$setLastLexicalElement = $setLastLexicalElement;
function $getTableOfContents() {
    const tableOfContents = [];
    const sectionHeadingNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_linkLexicalLink_1.SectionHeadingNode);
    if (sectionHeadingNodes) {
        sectionHeadingNodes.forEach((node) => {
            const id = node.getId();
            const innerText = node.getTextContent().replace(/(\s+|\n)/g, ' ').trim().slice(0, 50);
            tableOfContents.push({ id, text: innerText });
        });
    }
    return tableOfContents;
}
exports.$getTableOfContents = $getTableOfContents;
function $getImages() {
    const images = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.ImageNode).map((obj) => {
        const url = obj.getSrc();
        const short = obj.getShort();
        const long = obj.getLong();
        const width = obj.getWidth();
        const height = obj.getHeight();
        var caption = '';
        if (short)
            caption += short;
        if (long)
            caption += ': ' + long;
        return { url, caption, width, height };
    });
    const carouselImages = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.CarouselImageNode);
    for (let obj of carouselImages) {
        const imageList = obj.getImageList();
        for (let img of imageList) {
            images.push({ url: img.src, caption: "Title: " + img.short + "\nDescription: " + img.long, width: img.width, height: img.height });
        }
    }
    return images;
}
exports.$getImages = $getImages;
function $getVideos() {
    return (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.VideoNode).map((obj) => {
        const url = obj.getSrc();
        const short = obj.getTitle();
        const long = obj.getDescription();
        const height = obj.getHeight();
        var caption = '';
        if (short)
            caption += "Title: " + short;
        if (short && long)
            caption += '\n';
        if (long)
            caption += 'Description: ' + long;
        return { url, caption, height };
    });
}
exports.$getVideos = $getVideos;
function $getAudio() {
    return (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.AudioNode).map((obj) => {
        const url = obj.getSrc();
        const short = obj.getTitle();
        var caption = '';
        if (short)
            caption += "Title: " + short;
        return { url, caption };
    });
}
exports.$getAudio = $getAudio;
/**
 * PurifyDOM and get DOM information
 * @returns
 */
function $getCustomHTMLMediaAndPurifyDOM() {
    const htmlNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_2.HtmlNode);
    var images = [];
    var audio = [];
    var video = [];
    for (let htmlNode of htmlNodes) {
        const html = htmlNode.getHtml();
        const { html: newHTML, images: newImages, audio: newAudio, video: newVideo } = (0, markdown_1.purifyUserInputHTMLForLexical)(html);
        htmlNode.setHtml(newHTML);
        images = images.concat(newImages);
        audio = audio.concat(newAudio);
        video = video.concat(newVideo);
    }
    return { images, audio, video };
}
exports.$getCustomHTMLMediaAndPurifyDOM = $getCustomHTMLMediaAndPurifyDOM;
async function getImageUrlToInfo(in_images) {
    const resp = await (0, mediaHelpers_1.getImagesInformationLexical)(in_images.map((obj) => ({ url: obj.url, caption: obj.caption })));
    const urlToInfo = {};
    for (let obj of resp) {
        if (obj === null)
            continue;
        urlToInfo[obj.url] = { ...obj };
    }
    return urlToInfo;
}
async function getAudioUrlToInfo(in_audio) {
    const resp = await (0, mediaHelpers_1.getAudioInformationLexical)(in_audio);
    const urlToInfo = {};
    for (let obj of resp) {
        if (obj === null)
            continue;
        urlToInfo[obj.url] = { ...obj };
    }
    return urlToInfo;
}
async function getVideoUrlToInfo(in_video) {
    const resp = await (0, mediaHelpers_1.getVideoInformationLexical)(in_video.map((obj) => obj.url));
    const urlToInfo = {};
    for (let obj of resp) {
        if (obj === null)
            continue;
        urlToInfo[obj.url] = { ...obj };
    }
    return urlToInfo;
}
/**
 *
 * @param images Images in the editor
 * @param nsfw_handle How to handle nsfw content
 * @returns contains_nsfw: Whether or not the editor contains nsfw (should only happen when nsfw_handle ='notify') (note that if able_to_validate is false then the editor may still contain nwfw images), able_to_validate: whether or not the database had inofrmation on all the image nodes
 */
function $updateImages(urlToInfo, nsfw_handle) {
    var contains_nsfw = false;
    var able_to_validate = true;
    const unvalidated_urls = [];
    const imageNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.ImageNode);
    imageNodes.forEach((obj) => {
        const url = obj.getSrc();
        const short = obj.getShort();
        const long = obj.getLong();
        if (urlToInfo[url]) {
            const imageInfoObj = urlToInfo[url];
            if (!!!short.length && imageInfoObj.ai_caption) {
                obj.setShort("AI Caption: ".concat(imageInfoObj.ai_caption));
            }
            else if (!!!long.length && imageInfoObj.ai_caption) {
                obj.setLong("AI Caption: ".concat(imageInfoObj.ai_caption));
            }
            if (Number.isInteger(imageInfoObj.nsfw) && Number(imageInfoObj.nsfw) > 90) {
                if (nsfw_handle === "remove")
                    obj.remove(true);
                else if (nsfw_handle === "notify")
                    contains_nsfw = true;
                else if (nsfw_handle === "set_src")
                    obj.setSrc("https://cdn.storething.org/frankmbrown/asset/default-image.png");
            }
            else if (!!!Number.isInteger(imageInfoObj.nsfw)) {
                able_to_validate = false;
                unvalidated_urls.push(url);
            }
        }
        else {
            able_to_validate = false;
            unvalidated_urls.push(url);
        }
    });
    const carouselImageNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.CarouselImageNode);
    carouselImageNodes.forEach((node) => {
        const image_list = node.getImageList();
        const new_image_list = [];
        for (let i = 0; i < image_list.length; i++) {
            const obj = image_list[i];
            const url = obj.src;
            const short = obj.short;
            const long = obj.long;
            if (urlToInfo[url]) {
                const imageInfoObj = urlToInfo[url];
                if (!!!short.length && imageInfoObj.ai_caption) {
                    obj.short = "AI Caption: ".concat(imageInfoObj.ai_caption);
                }
                else if (!!!long.length && imageInfoObj.ai_caption) {
                    obj.long = "AI Caption: ".concat(imageInfoObj.ai_caption);
                }
                if (Number.isInteger(imageInfoObj.nsfw) && Number(imageInfoObj.nsfw) > 90) {
                    if (nsfw_handle === "remove") {
                        continue;
                    }
                    else if (nsfw_handle === "notify") {
                        contains_nsfw = true;
                    }
                    else if (nsfw_handle === "set_src") {
                        obj.src = "https://cdn.storething.org/frankmbrown/asset/default-image.png";
                    }
                }
                else if (!!!Number.isInteger(imageInfoObj.nsfw)) {
                    able_to_validate = false;
                    unvalidated_urls.push(url);
                }
                const { width, height } = imageInfoObj;
                if (!!!obj.width && width)
                    obj.width = width;
                if (!!!obj.height && height)
                    obj.height = height;
                new_image_list.push(structuredClone(obj));
            }
            else {
                able_to_validate = false;
                unvalidated_urls.push(url);
                new_image_list.push(structuredClone(obj));
            }
        }
        node.setImageList(new_image_list);
    });
    return { contains_nsfw, able_to_validate, unvalidated_urls };
}
function $updateVideo(urlToInfo, nsfw_handle) {
    var contains_nsfw = false;
    var able_to_validate = true;
    const videoNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.VideoNode);
    const unvalidated_urls = [];
    videoNodes.forEach((node) => {
        const src = node.getSrc();
        if (urlToInfo[src]) {
            const { flagged, text, height, width } = urlToInfo[src];
            if (height && !!!node.getHeight()) {
                node.setHeight(height);
            }
            if (flagged === null) {
                able_to_validate = false;
                unvalidated_urls.push(src);
            }
            else {
                if (flagged) {
                    if (nsfw_handle === "remove")
                        node.remove(true);
                    else if (nsfw_handle === "set_src")
                        node.setSrc("https://audio.storething.org/frankmbrown/default-video.mp4");
                    else if (nsfw_handle === "notify")
                        contains_nsfw = true;
                }
            }
            if (typeof text === "string") {
                node.setText(text);
            }
        }
        else {
            able_to_validate = false;
            unvalidated_urls.push(src);
        }
    });
    return { able_to_validate, contains_nsfw, unvalidated_urls };
}
function $updateAudio(urlToInfo, nsfw_handle) {
    var contains_nsfw = false;
    var able_to_validate = true;
    const unvalidated_urls = [];
    const audioNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.AudioNode);
    audioNodes.forEach((node) => {
        const src = node.getSrc();
        if (urlToInfo[src]) {
            const { flagged, text } = urlToInfo[src];
            if (flagged === null) {
                able_to_validate = false;
                unvalidated_urls.push(src);
            }
            else {
                if (flagged) {
                    if (nsfw_handle === "remove")
                        node.remove(true);
                    else if (nsfw_handle === "set_src")
                        node.setSrc("https://video.storething.org/frankmbrown/default-video.mp4");
                    else if (nsfw_handle === "notify")
                        contains_nsfw = true;
                }
            }
            if (typeof text === "string") {
                node.setText(text);
            }
        }
        else {
            able_to_validate = false;
            unvalidated_urls.push(src);
        }
    });
    return { able_to_validate, contains_nsfw, unvalidated_urls };
}
function $updateCustomHTML(media, nsfw_handle) {
    const htmlNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_2.HtmlNode);
    var contains_nsfw = false;
    var able_to_validate = true;
    var unvalidated_image_urls = [];
    var unvalidated_audio_urls = [];
    var unvalidated_video_urls = [];
    for (let htmlNode of htmlNodes) {
        const html = htmlNode.getHtml();
        const { html: newHTML, contains_nsfw: contains_nsfw_new, able_to_validate: able_to_validate_new, unvalidated_image_urls: new_unvalidated_image_urls, unvalidated_audio_urls: new_unvalidated_audio_urls, unvalidated_video_urls: new_unvalidated_video_urls } = (0, markdown_1.updateCustomHTMLLexical)(html, media, nsfw_handle);
        htmlNode.setHtml(newHTML);
        contains_nsfw = Boolean(contains_nsfw || contains_nsfw_new);
        able_to_validate = Boolean(able_to_validate && able_to_validate_new);
        unvalidated_image_urls = unvalidated_image_urls.concat(new_unvalidated_image_urls);
        unvalidated_audio_urls = unvalidated_audio_urls.concat(new_unvalidated_audio_urls);
        unvalidated_video_urls = unvalidated_video_urls.concat(new_unvalidated_video_urls);
    }
    return { contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls };
}
exports.$updateCustomHTML = $updateCustomHTML;
function $containsNode(node) {
    try {
        const nodes = (0, lexicalLexical_1.$nodesOfType)(node);
        if (nodes.length >= 1)
            return true;
        else
            return false;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
function $removeOpeningAndTrailingEmptyNodes() {
    const root = (0, lexicalLexical_1.$getRoot)();
    if (root) {
        const topLevelChildren = root.getChildren();
        const isEmpty = (el) => Boolean(el.isEmpty() || el.getTextContent().trim().length === 0);
        var children_length_curr = topLevelChildren.length;
        for (let i = 0; i < topLevelChildren.length; i++) {
            if (children_length_curr === 1)
                break;
            if (topLevelChildren[i] instanceof lexicalLexical_1.ElementNode && isEmpty(topLevelChildren[i])) {
                topLevelChildren[i].remove();
                children_length_curr -= 1;
            }
            else {
                break;
            }
        }
        for (let i = topLevelChildren.length - 1; i > -1; i--) {
            if (children_length_curr === 1)
                break;
            if (topLevelChildren[i] instanceof lexicalLexical_1.ElementNode && isEmpty(topLevelChildren[i])) {
                topLevelChildren[i].remove();
                children_length_curr -= 1;
            }
            else {
                break;
            }
        }
    }
}
function $removeAutocompleteNodes() {
    const autocompleteNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_toolbarLexicalToolbar_1.AutocompleteNode);
    autocompleteNodes.forEach((node) => node.remove(false));
}
function $removeLoadingNodes() {
    const loadingNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.LoadingNode);
    loadingNodes.forEach((n) => n.remove(false));
}
function $validateOrRemoveSocialMedia() {
    const twitterNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.TwitterNode);
    twitterNodes.forEach((obj) => {
        const html = obj.getHTML();
        try {
            (0, socialMedia_1.validateTwitterEmbed)(html);
        }
        catch (e) {
            console.error("Invalid Twitter Node");
            '';
            console.error(e);
            obj.remove(true);
        }
    });
    const instagramNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.InstagramNode);
    instagramNodes.forEach((obj) => {
        const html = obj.getHTML();
        try {
            (0, socialMedia_1.validateInstagramEmbed)(html);
        }
        catch (e) {
            console.error("Invalid Instagram Node");
            console.error(e);
            obj.remove(true);
        }
    });
    const tiktokNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_decoratorsLexicalDecorators_1.TikTokNode);
    tiktokNodes.forEach((obj) => {
        const html = obj.getHTML();
        try {
            (0, socialMedia_1.validateTikTokEmbed)(html);
        }
        catch (e) {
            console.error("Invalid TikTok Node.");
            console.error(e);
            obj.remove(true);
        }
    });
}
function $applyCommonEditorTransformations(lexicalState, getEditor) {
    initializeDomInNode('desktop');
    var current_editor_state = lexicalState;
    var current_editor = getEditor();
    var parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state), undefined);
    current_editor.setEditorState(parsedEditorState, undefined);
    current_editor.update(() => {
        $removeOpeningAndTrailingEmptyNodes();
        $removeAutocompleteNodes();
        $removeLoadingNodes();
        $validateOrRemoveSocialMedia();
    }, { discrete: true });
    current_editor_state = current_editor.getEditorState().toJSON();
    removeDOMFromNode();
    return current_editor_state;
}
async function getSafeLexicalState(lexicalState, getEditor, restrictions) {
    initializeDomInNode('desktop');
    var current_editor_state = lexicalState;
    var current_editor = getEditor();
    var parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state), undefined);
    current_editor.setEditorState(parsedEditorState, undefined);
    var in_images = [], in_audio = [], in_video = [];
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
                const restrictedNodesArray = [];
                for (let j = 0; j < nodeArray.length; j++) {
                    const nodeTypeString = nodeArray[j];
                    const NodeClass = STRING_TO_NODE[nodeTypeString];
                    if (nodeTypeString === "MathNode") {
                        restrictedNodesArray.push(...(0, lexicalLexical_1.$nodesOfType)(NodeClass).filter((node) => !!!node.isInline()));
                    }
                    else {
                        restrictedNodesArray.push(...(0, lexicalLexical_1.$nodesOfType)(NodeClass));
                    }
                }
                if (restrictedNodesArray.length > count) {
                    const sortedRestrictedNodeArray = restrictedNodesArray.sort((a, b) => parseInt(b.getKey()) - parseInt(a.getKey()));
                    for (let j = count; j < restrictedNodesArray.length; j++) {
                        sortedRestrictedNodeArray[j].remove();
                    }
                }
            }
        }
    }, { discrete: true });
    current_editor_state = current_editor.getEditorState().toJSON();
    const imageURLToInfo = await getImageUrlToInfo(in_images);
    const audioURLToInfo = await getAudioUrlToInfo(in_audio);
    const videoURLToInfo = await getVideoUrlToInfo(in_video);
    current_editor = getEditor();
    parsedEditorState = current_editor.parseEditorState(structuredClone(current_editor_state), undefined);
    current_editor.setEditorState(parsedEditorState, undefined);
    var contains_nsfw = false, able_to_validate = true, unvalidated_image_urls = new Set(), unvalidated_audio_urls = new Set(), unvalidated_video_urls = new Set();
    current_editor.update(() => {
        const { contains_nsfw: contains_nsfw_image, able_to_validate: able_to_validate_image, unvalidated_urls: unvalidated_image_urls_new } = $updateImages(imageURLToInfo, 'remove');
        const { contains_nsfw: contains_nsfw_audio, able_to_validate: able_to_validate_audio, unvalidated_urls: unvalidated_audio_urls_new } = $updateAudio(audioURLToInfo, 'remove');
        const { contains_nsfw: contains_nsfw_video, able_to_validate: able_to_validate_video, unvalidated_urls: unvalidated_video_urls_new } = $updateVideo(videoURLToInfo, 'remove');
        const { contains_nsfw: contains_nsfw_custom, able_to_validate: able_to_validate_custom, unvalidated_image_urls: unvalidated_image_urls_2, unvalidated_audio_urls: unvalidated_audio_urls_2, unvalidated_video_urls: unvalidated_video_urls_2 } = $updateCustomHTML({ in_images: imageURLToInfo, in_audio: audioURLToInfo, in_video: videoURLToInfo }, 'remove');
        contains_nsfw = contains_nsfw || contains_nsfw_image || contains_nsfw_audio || contains_nsfw_video || contains_nsfw_custom;
        able_to_validate = able_to_validate && able_to_validate_image && able_to_validate_audio && able_to_validate_video && able_to_validate_custom;
        (0, set_1.addItemsToSet)(unvalidated_image_urls_new, unvalidated_image_urls);
        (0, set_1.addItemsToSet)(unvalidated_image_urls_2, unvalidated_image_urls);
        (0, set_1.addItemsToSet)(unvalidated_audio_urls_new, unvalidated_audio_urls);
        (0, set_1.addItemsToSet)(unvalidated_audio_urls_2, unvalidated_audio_urls);
        (0, set_1.addItemsToSet)(unvalidated_video_urls_new, unvalidated_video_urls);
        (0, set_1.addItemsToSet)(unvalidated_video_urls_2, unvalidated_video_urls);
        const root = (0, lexicalLexical_1.$getRoot)();
        if (root) {
            $setFirstLexicalElement(root);
            $setLastLexicalElement(root);
        }
    }, { discrete: true });
    current_editor_state = current_editor.getEditorState().toJSON();
    removeDOMFromNode();
    return { state: current_editor_state, able_to_validate, contains_nsfw, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls };
}
async function parseLexicalDifferentSizes(lexicalState, getEditor, restrictions) {
    const retObj = {
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
        const { state, contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls } = await getSafeLexicalState(lexicalState, getFullLexicalEditor);
        const new_lexical_state = $applyCommonEditorTransformations(state, getEditor);
        retObj.able_to_validate = able_to_validate;
        retObj.contains_nsfw = contains_nsfw;
        retObj.unvalidated_audio_urls = Array.from(unvalidated_audio_urls);
        retObj.unvalidated_image_urls = Array.from(unvalidated_image_urls);
        retObj.unvalidated_video_urls = Array.from(unvalidated_video_urls);
        for (let device of ["mobile", "tablet", "desktop"]) {
            initializeDomInNode(device);
            const headlessEditor = getEditor();
            const parsedEditorState = headlessEditor.parseEditorState(new_lexical_state, undefined);
            headlessEditor.setEditorState(parsedEditorState, undefined);
            headlessEditor.update(() => {
                const html = (0, lexical_htmlLexicalHtml_1.$generateHtmlFromNodes)(headlessEditor, null);
                const rootNode = (0, lexicalLexical_1.$getRoot)();
                if (rootNode) {
                    if (device === "mobile") {
                        retObj.tableOfContents = $getTableOfContents();
                        retObj.editorState = headlessEditor.getEditorState().toJSON();
                        retObj.mobile_html = html;
                        retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g, ' ').replace(/-{3}/g, '');
                    }
                    else if (device === "tablet") {
                        retObj.tablet_html = html;
                    }
                    else if (device === "desktop") {
                        retObj.desktop_html = html;
                    }
                }
            }, undefined);
            removeDOMFromNode();
        }
        if (!!!retObj.desktop_html.length)
            throw new Error("Something went wrong parsing the lexical state.");
        return retObj;
    }
    catch (e) {
        removeDOMFromNode();
        console.error(e);
        throw new Error('Something went wrong parsing the lexical editor.');
    }
}
async function parseLexicalOneSize(lexicalState, getEditor) {
    const retObj = {
        editorState: lexicalState,
        html: '',
        innerText: '',
        tableOfContents: []
    };
    try {
        const { state } = await getSafeLexicalState(lexicalState, getFullLexicalEditor);
        const new_lexical_state = $applyCommonEditorTransformations(state, getEditor);
        initializeDomInNode('desktop');
        const headlessEditor = getEditor();
        const parsedEditorState = headlessEditor.parseEditorState(new_lexical_state, undefined);
        headlessEditor.setEditorState(parsedEditorState, undefined);
        headlessEditor.update(() => {
            const html = (0, lexical_htmlLexicalHtml_1.$generateHtmlFromNodes)(headlessEditor, null);
            const rootNode = (0, lexicalLexical_1.$getRoot)();
            if (rootNode) {
                retObj.editorState = headlessEditor.getEditorState().toJSON();
                retObj.html = html;
                retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g, ' ').replace(/-{3}/g, '');
            }
        }, undefined);
        removeDOMFromNode();
        if (!!!retObj.html.length)
            throw new Error("Something went wrong parsing the lexical state.");
        return retObj;
    }
    catch (e) {
        removeDOMFromNode();
        console.error(e);
        throw new Error('Something went wrong parsing the lexical editor.');
    }
}
/* --------------------------------- CREATE HEADLESS EDITORS ----------------------- */
function getFullLexicalEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.HeadingNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_linkLexicalLink_1.SectionHeadingNode,
            lexical_decoratorsLexicalDecorators_1.YouTubeNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_decoratorsLexicalDecorators_1.NewsNode,
            lexical_asideLexicalAside_1.AsideNode,
            lexical_detailsLexicalDetails_1.DetailsNode,
            lexical_detailsLexicalDetails_1.AccordionContentNode,
            lexical_decoratorsLexicalDecorators_2.HtmlNode,
            lexical_decoratorsLexicalDecorators_1.TwitterNode,
            lexical_decoratorsLexicalDecorators_1.InstagramNode,
            lexical_decoratorsLexicalDecorators_1.TikTokNode,
            lexical_columnLexicalColumn_1.LayoutContainerNode,
            lexical_columnLexicalColumn_1.LayoutItemNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode,
            lexical_decoratorsLexicalDecorators_1.AiChatNode
        ],
        editorType: 'full'
    });
    return headlessEditor;
}
exports.getFullLexicalEditor = getFullLexicalEditor;
function getCommentLexicalEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_decoratorsLexicalDecorators_1.YouTubeNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_decoratorsLexicalDecorators_1.NewsNode,
            lexical_decoratorsLexicalDecorators_2.HtmlNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'comment'
    });
    return headlessEditor;
}
exports.getCommentLexicalEditor = getCommentLexicalEditor;
function getTextOnlyLexicalEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'text-only'
    });
    return headlessEditor;
}
exports.getTextOnlyLexicalEditor = getTextOnlyLexicalEditor;
function getTextWithLinksLexicalEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_linkLexicalLink_1.LinkNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'text-with-links'
    });
    return headlessEditor;
}
exports.getTextWithLinksLexicalEditor = getTextWithLinksLexicalEditor;
function getTextWithBlockElementsLexicalEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'text-block-elements'
    });
    return headlessEditor;
}
exports.getTextWithBlockElementsLexicalEditor = getTextWithBlockElementsLexicalEditor;
function getAnnotationEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_linkLexicalLink_1.LinkNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_toolbarLexicalToolbar_1.AnnotationNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'annotation'
    });
    return headlessEditor;
}
exports.getAnnotationEditor = getAnnotationEditor;
function getSurveyQuestionEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_decoratorsLexicalDecorators_1.YouTubeNode,
            lexical_decoratorsLexicalDecorators_1.TwitterNode,
            lexical_decoratorsLexicalDecorators_1.TikTokNode,
            lexical_decoratorsLexicalDecorators_1.InstagramNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.NewsNode,
            lexical_decoratorsLexicalDecorators_2.HtmlNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_overflowLexicalOverflow_1.OverflowNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'survey-question'
    });
    return headlessEditor;
}
exports.getSurveyQuestionEditor = getSurveyQuestionEditor;
function getSurveyOptionEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_decoratorsLexicalDecorators_2.HtmlNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_overflowLexicalOverflow_1.OverflowNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'survey-option'
    });
    return headlessEditor;
}
exports.getSurveyOptionEditor = getSurveyOptionEditor;
function getSurveyShortBlogEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_decoratorsLexicalDecorators_1.YouTubeNode,
            lexical_decoratorsLexicalDecorators_1.TwitterNode,
            lexical_decoratorsLexicalDecorators_1.TikTokNode,
            lexical_decoratorsLexicalDecorators_1.InstagramNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.NewsNode,
            lexical_decoratorsLexicalDecorators_2.HtmlNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_overflowLexicalOverflow_1.OverflowNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'short-blog'
    });
    return headlessEditor;
}
exports.getSurveyShortBlogEditor = getSurveyShortBlogEditor;
function getSurveyRangeDescriptionEditor() {
    const headlessEditor = (0, lexical_headlessLexicalHeadless_1.createHeadlessEditor)({
        namespace: '',
        theme: structuredClone(EDITOR_THEME_1.EDITOR_THEME),
        onerror: console.error,
        nodes: [
            lexicalLexical_2.ExtendedTextNode,
            { replace: lexicalLexical_2.TextNode, with: (node) => new lexicalLexical_2.ExtendedTextNode(node.__text, node.__key) },
            lexical_listLexicalList_1.ListNode,
            lexical_listLexicalList_1.ListItemNode,
            lexical_rich_textLexicalRichText_1.QuoteNode,
            lexical_linkLexicalLink_1.LinkNode,
            lexical_decoratorsLexicalDecorators_1.HorizontalRuleNode,
            lexical_mathLexicalMath_1.MathNode,
            lexical_codeLexicalCode_1.CodeNode,
            lexical_codeLexicalCode_1.CodeHighlightNode,
            lexical_tableLexicalTable_1.TableNode,
            lexicalLexical_1.TableWrapperNode,
            lexical_tableLexicalTable_1.TableRowNode,
            lexical_tableLexicalTable_1.TableCellNode,
            lexical_tableLexicalTable_1.CellParagraphNode,
            lexical_decoratorsLexicalDecorators_1.AudioNode,
            lexical_decoratorsLexicalDecorators_1.VideoNode,
            lexical_decoratorsLexicalDecorators_1.CarouselImageNode,
            lexical_decoratorsLexicalDecorators_1.ImageNode,
            lexical_linkLexicalLink_1.AbbreviationNode,
            lexical_overflowLexicalOverflow_1.OverflowNode,
            lexical_toolbarLexicalToolbar_1.AutocompleteNode,
            lexical_decoratorsLexicalDecorators_1.LoadingNode
        ],
        editorType: 'range-description'
    });
    return headlessEditor;
}
exports.getSurveyRangeDescriptionEditor = getSurveyRangeDescriptionEditor;
/**
 * Throws an error if a node has color
 * @param editor
 * @returns
 */
function testNoColorNodes(editor) {
    editor.getEditorState().read(() => {
        if (editor.hasNode(lexicalLexical_1.ParagraphNode)) {
            const paragraphNodes = (0, lexicalLexical_1.$nodesOfType)(lexicalLexical_1.ParagraphNode);
            paragraphNodes.forEach((node) => {
                const style = node.getBlockStyle();
                if (style.backgroundColor !== 'transparent' || style.textColor !== 'inherit')
                    throw new Error("Paragraph node has color.");
            });
        }
        if (editor.hasNode(lexicalLexical_2.ExtendedTextNode)) {
            const textNodes = (0, lexicalLexical_1.$nodesOfType)(lexicalLexical_2.ExtendedTextNode);
            textNodes.forEach((node) => {
                if (typeof node.__style === 'string') {
                    const style = (0, lexical_selectionLexicalSelection_1.getStyleObjectFromCSS)(node.__style);
                    if (typeof style['color'] === 'string' && style['color'].length && style['color'] !== 'inherit') {
                        throw new Error('Text node has color.');
                    }
                    else if (typeof style['background-color'] === 'string' && style['background-color'].length >= 1 && style['background-color'] !== 'transparent') {
                        throw new Error('Text node has background color.');
                    }
                }
            });
        }
        if (editor.hasNode(lexical_rich_textLexicalRichText_1.HeadingNode)) {
            const headingNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_rich_textLexicalRichText_1.HeadingNode);
            headingNodes.forEach((node) => {
                const style = node.getBlockStyle();
                if (style.backgroundColor !== 'transparent' || style.textColor !== 'inherit')
                    throw new Error("Heading node has color.");
            });
        }
        if (editor.hasNode(lexical_listLexicalList_1.ListNode)) {
            const listNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_listLexicalList_1.ListNode);
            listNodes.forEach((node) => {
                const style = node.getBlockStyle();
                if (style.backgroundColor !== 'transparent' || style.textColor !== 'inherit')
                    throw new Error("List node has color.");
            });
        }
    });
}
/* --------------------------------- PARSE LEXICAL EDITORS ----------------------- */
async function parseArticleLexical(lexicalState) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getFullLexicalEditor, undefined);
    return ret;
}
exports.parseArticleLexical = parseArticleLexical;
/**
 *
 * @param lexicalState JSON.parse(JSON.stringify(editorState.toJSON()));
 */
async function parseFullLexicalEditor(lexicalState) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getFullLexicalEditor, undefined);
    return ret;
}
exports.parseFullLexicalEditor = parseFullLexicalEditor;
async function parseCommentLexicalEditor(lexicalState, restriction = DEFAULT_NODE_RESTRICTION) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getCommentLexicalEditor, restriction);
    return ret;
}
exports.parseCommentLexicalEditor = parseCommentLexicalEditor;
async function parseTextOnlyLexicalEditor(lexicalState, noColor = false) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getTextOnlyLexicalEditor, undefined);
    return ret;
}
exports.parseTextOnlyLexicalEditor = parseTextOnlyLexicalEditor;
async function parseTextWithLinksLexicalEditor(lexicalState, noColor = false) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getTextWithLinksLexicalEditor, undefined);
    return ret;
}
exports.parseTextWithLinksLexicalEditor = parseTextWithLinksLexicalEditor;
async function parseTextWithBlockElementsLexicalEditor(lexicalState, noColor = false) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getTextWithBlockElementsLexicalEditor, undefined);
    return ret;
}
exports.parseTextWithBlockElementsLexicalEditor = parseTextWithBlockElementsLexicalEditor;
async function parseSurveyQuestionEditor(lexicalState, restriction = DEFAULT_NODE_RESTRICTION) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getSurveyQuestionEditor, restriction);
    return ret;
}
exports.parseSurveyQuestionEditor = parseSurveyQuestionEditor;
async function parseSurveyOptionEditor(lexicalState, restriction = DEFAULT_NODE_RESTRICTION) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getSurveyOptionEditor, restriction);
    return ret;
}
exports.parseSurveyOptionEditor = parseSurveyOptionEditor;
async function parseSurveyShortBlogEditor(lexicalState, restriction = DEFAULT_NODE_RESTRICTION) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getSurveyShortBlogEditor, restriction);
    return ret;
}
exports.parseSurveyShortBlogEditor = parseSurveyShortBlogEditor;
async function parseSurveyRangeDescriptionEditor(lexicalState, restriction = DEFAULT_NODE_RESTRICTION) {
    const ret = await parseLexicalDifferentSizes(lexicalState, getSurveyRangeDescriptionEditor, restriction);
    return ret;
}
exports.parseSurveyRangeDescriptionEditor = parseSurveyRangeDescriptionEditor;
/**
 * This doesn't work perfectly beacuase of instanceOf HTMLElement on the server
 * @param html
 * @param device
 * @returns
 */
async function getLexicalStateFromHTML(html, device = 'desktop') {
    return new Promise((resolve, reject) => {
        try {
            const dom = initializeDomInNode(device, html);
            const editor = getFullLexicalEditor();
            editor.update(() => {
                const nodes = (0, lexical_htmlLexicalHtml_1.$generateNodesFromDOM)(editor, dom.window.document);
                const root = (0, lexicalLexical_1.$getRoot)();
                if (root)
                    root.select();
                (0, lexicalLexical_1.$insertNodes)(nodes);
            }, { discrete: true });
            editor.getEditorState().read(() => {
                const editorState = editor.getEditorState().toJSON();
                removeDOMFromNode();
                resolve(editorState);
            });
        }
        catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
exports.getLexicalStateFromHTML = getLexicalStateFromHTML;
function getTextColorForRGB(r, g, b) {
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
async function parsePostedAnnotation(lexicalState, { start, end, content, reference_id }) {
    try {
        const retObj = {
            editorState: lexicalState,
            html: '',
            innerText: '',
            background_color: '',
            text_color: '',
            embedding: []
        };
        initializeDomInNode('desktop');
        const headlessEditor = getAnnotationEditor();
        const parsedEditorState = headlessEditor.parseEditorState(lexicalState, undefined);
        headlessEditor.setEditorState(parsedEditorState, undefined);
        var tempInnerText = undefined;
        headlessEditor.update(() => {
            const rootNode = (0, lexicalLexical_1.$getRoot)();
            if (rootNode)
                tempInnerText = rootNode.getTextContent().replace(/(\n|\s+)/g, ' ').replace(/-{3}/g, '');
            const annotationNodes = (0, lexicalLexical_1.$nodesOfType)(lexical_toolbarLexicalToolbar_1.AnnotationNode);
            annotationNodes.forEach((n) => n.remove());
        }, undefined);
        if (!!!tempInnerText)
            throw new Error("Unable to gennerate intermediate innerText for annotation node");
        const embedding = await (0, ai_1.createEmbedding)((0, ai_1.getAnnotationQuery)(String(tempInnerText).slice(0, 4000)), 'text-embedding-ada-002');
        retObj.embedding = embedding;
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const background_color = `rgb(${r},${g},${b})`;
        const text_color = getTextColorForRGB(r, g, b);
        retObj.background_color = background_color;
        retObj.text_color = text_color;
        const parsedEditorState2 = headlessEditor.parseEditorState(lexicalState, undefined);
        headlessEditor.setEditorState(parsedEditorState2, undefined);
        headlessEditor.update(() => {
            const annotationNode = (0, lexical_toolbarLexicalToolbar_1.$createAnnotationNode)({ start, end, content, reference_id }, { text_color, background_color });
            const rootNode = (0, lexicalLexical_1.$getRoot)();
            if (rootNode) {
                rootNode.append(annotationNode);
                const html = (0, lexical_htmlLexicalHtml_1.$generateHtmlFromNodes)(headlessEditor, null);
                retObj.editorState = headlessEditor.getEditorState().toJSON();
                retObj.html = html;
                retObj.innerText = rootNode.getTextContent().replace(/(\n|\s+)/g, ' ').replace(/-{3}/g, ' ');
            }
            else {
                throw new Error("Unable to find root node.");
            }
        }, undefined);
        removeDOMFromNode();
        return retObj;
    }
    catch (error) {
        removeDOMFromNode();
        console.error(error);
        throw new Error('Unable to parse annotation lexical editor.');
    }
}
exports.parsePostedAnnotation = parsePostedAnnotation;
