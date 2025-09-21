"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInstagramEmbed = exports.validateTwitterEmbed = exports.validateRedditEmbed = exports.validateTikTokEmbed = void 0;
const dompurify_1 = __importDefault(require("dompurify"));
const jsdom_1 = __importDefault(require("jsdom"));
function validateTikTokEmbed(s) {
    const ALLOWED_TAGS = [
        "BLOCKQUOTE",
        "SECTION",
        "A"
    ];
    const ALLOWED_ATTR = [
        "class",
        "cite",
        "data-video-id",
        "style",
        "target",
        "title",
        "href"
    ];
    const hrefRegex = /https:\/\/(www\.|)tiktok\.com\//;
    // Check the HTML first manually
    const dom = new jsdom_1.default.JSDOM(s);
    const domDocument = dom.window.document;
    domDocument.querySelectorAll('script')
        .forEach((s) => s.remove());
    const bodyChildren = Array.from(domDocument.body.children);
    if (bodyChildren.length > 1) {
        throw new Error("TikTok embed should be wrapped in <blockquote> child.");
    }
    const blockquote = bodyChildren[0];
    if (blockquote.nodeName !== "BLOCKQUOTE" ||
        blockquote.className !== "tiktok-embed" ||
        !!!/https:\/\/(www\.|)tiktok.com\/.*\/video\/\d+/.test(String(blockquote.getAttribute('cite'))) ||
        !!!Number.isInteger(Number(blockquote.getAttribute('data-video-id')))) {
        throw new Error("TikTok embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"tiktok-embed\". It should have a cite attribute that matches /https:\/\/(www.|)tiktok.com\/.*\/video\/\d+/. It should have an integer data-video-id attribute.");
    }
    const blockquoteChildren = Array.from(blockquote.children);
    if (blockquoteChildren.length > 1) {
        throw new Error("TikTok embed HTML should be blockquote > 1 section > all other elements. ");
    }
    const section = blockquoteChildren[0];
    if (section.nodeName !== 'SECTION' || section.className !== '') {
        throw new Error("TikTok embed HTML should be blockquote > 1 section > all other elements. Section Element should not have a class name.");
    }
    const sectionDescendants = Array.from(section.querySelectorAll('*'));
    for (let child of sectionDescendants) {
        if (child.tagName !== 'A' && child.tagName !== 'P') {
            throw new Error("The descendants of the section element in a tiktok embed should either by and anchor tag or a paragraph.");
        }
        if (child.tagName === "A") {
            if (child.getAttribute('target') !== '_blank')
                throw new Error("The 'target' attribute of all anchor tags in the TikTok embed should be '_blank'.");
            if (!!!hrefRegex.test(String(child.getAttribute('href')))) {
                throw new Error("All links in the TikTok embed should have an href attribute that matches: /https:\/\/(www.|)tiktok.com\//.");
            }
        }
    }
    // Now Sanitive the HTML
    const newHTML = blockquote.outerHTML;
    const DOMPurify = (0, dompurify_1.default)(window);
    const finalHTML = DOMPurify.sanitize(newHTML, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: true
    });
    return finalHTML;
}
exports.validateTikTokEmbed = validateTikTokEmbed;
function validateRedditEmbed(s) {
    const ALLOWED_TAGS = [
        "BLOCKQUOTE",
        "A",
        "BR"
    ];
    const ALLOWED_ATTR = [
        "class",
        "data-embed-height",
        "href"
    ];
    const hrefRegex = /https:\/\/(www\.|)reddit\.com\/.*/;
    const dom = new jsdom_1.default.JSDOM(s);
    const domDocument = dom.window.document;
    domDocument.querySelectorAll('script')
        .forEach((s) => s.remove());
    const bodyChildren = domDocument.body.children;
    if (bodyChildren.length > 1) {
        throw new Error("Reddit embed should be wrapped in <blockquote> child.");
    }
    const blockquote = bodyChildren[0];
    if (blockquote.nodeName !== "BLOCKQUOTE" ||
        blockquote.className !== "reddit-embed-bq" ||
        !!!Number.isInteger(Number(blockquote.getAttribute('data-embed-height')))) {
        throw new Error("Reddit embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"reddit-embed-bq\". It should have a data-embed-height attribute that is an integer.");
    }
    // This should be the max depth
    const blockquoteChildren = Array.from(blockquote.children);
    for (let child of blockquoteChildren) {
        if ((child.tagName !== 'A' && child.tagName !== 'BR') || (Array.from(child.children).length > 0)) {
            throw new Error("The children of the blockquote in the Reddit embed should be either anchor tags or line breaks and they should not have any children themselves.");
        }
        if (child.tagName === "A") {
            if (!!!hrefRegex.test(String(child.getAttribute('href')))) {
                throw new Error("Invalid href attribute for anchor tag inside Reddit embed.");
            }
        }
    }
    const newHTML = blockquote.outerHTML;
    const minHeight = Number(String(blockquote.getAttribute('data-embed-height')));
    const DOMPurify = (0, dompurify_1.default)(window);
    const finalHTML = DOMPurify.sanitize(newHTML, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: true
    });
    return { html: finalHTML, minHeight };
}
exports.validateRedditEmbed = validateRedditEmbed;
function validateTwitterEmbed(s) {
    const ALLOWED_TAGS = [
        "BLOCKQUOTE",
        "P",
        "BR",
        "A"
    ];
    const ALLOWED_ATTR = [
        "class",
        "lang",
        "dir",
        "href"
    ];
    const dom = new jsdom_1.default.JSDOM(s);
    const domDocument = dom.window.document;
    domDocument.querySelectorAll('script')
        .forEach((s) => s.remove());
    const bodyChildren = domDocument.body.children;
    if (bodyChildren.length > 1) {
        throw new Error("Twitter embed should be wrapped in <blockquote> child.");
    }
    const blockquote = bodyChildren[0];
    if (blockquote.nodeName !== "BLOCKQUOTE" ||
        blockquote.className !== "twitter-tweet") {
        throw new Error("Twitter embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"twitter-tweet\".");
    }
    const blockquoteChildren = Array.from(blockquote.children);
    if (blockquoteChildren.length !== 2 ||
        blockquoteChildren[0].tagName !== 'P' ||
        blockquoteChildren[1].tagName !== 'A' ||
        Array.from(blockquoteChildren[1].children).length > 0 ||
        !!!/https:\/\/(www\.|)(twitter|x)\.com\/.*\/status\/\d+\?.*/.test(String(blockquoteChildren[1].getAttribute('href'))) ||
        (blockquoteChildren[0].getAttribute('dir') !== 'ltr' && blockquoteChildren[0].getAttribute('dir') !== 'rtl') ||
        !!!blockquoteChildren[0].getAttribute('lang')) {
        throw new Error("Twitter Embed bloclquote element should have two children. The first should be a paragraph and the second should be an anchor tag. The anchor tag should have no children and it should have an href attribute that matches /https:\/\/(www.|)(twitter|x).com\/.*\/status\/\d+\?.*/. The first paragraph should have appropriate lang and dir attributes.");
    }
    Array.from(blockquoteChildren[0].children)
        .forEach((child) => {
        if (child.tagName !== 'A' && child.tagName !== 'BR') {
            throw new Error("The children of blockquote > p for the twitter implementation should only be anchor tags and newlines.");
        }
        if (Array.from(child.children).length > 1) {
            throw new Error("The children of blockquote > p for the twitter implementation should not have children themselves.");
        }
        if (child.tagName === 'A') {
            if (!!!/https:\/\/t\.co\/.*/.test(String(child.getAttribute('href'))) &&
                !!!/https:\/\/(twitter|x)\.com\/.*/.test(String(child.getAttribute('href')))) {
                throw new Error("Twitter embed: Invalid twitter anchor tag href.");
            }
        }
    });
    const newHTML = blockquote.outerHTML;
    const DOMPurify = (0, dompurify_1.default)(window);
    const finalHTML = DOMPurify.sanitize(newHTML, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false
    });
    return finalHTML;
}
exports.validateTwitterEmbed = validateTwitterEmbed;
function validateInstagramEmbed(s) {
    const ALLOWED_TAGS = [
        "BLOCKQUOTE",
        "DIV",
        "svg",
        "g",
        "path",
        "A",
        "P"
    ];
    const ALLOWED_ATTR = [
        "class",
        "lang",
        "dir",
        "href"
    ];
    const gAttributesSet = new Set([
        "stroke",
        "stroke-width",
        "fill",
        "fill-rule",
        "transform"
    ]);
    const dom = new jsdom_1.default.JSDOM(s);
    const domDocument = dom.window.document;
    domDocument.querySelectorAll('script')
        .forEach((s) => s.remove());
    const bodyChildren = domDocument.body.children;
    if (bodyChildren.length > 1) {
        throw new Error("Instagram embed should be wrapped in <blockquote> child.");
    }
    const blockquote = bodyChildren[0];
    if (blockquote.nodeName !== "BLOCKQUOTE" ||
        blockquote.className !== "instagram-media" ||
        !!!blockquote.hasAttribute("data-instgrm-captioned") ||
        !!!/https:\/\/www.instagram.com\/.*/.test(String(blockquote.getAttribute("data-instgrm-permalink"))) ||
        !!!blockquote.hasAttribute("data-instgrm-version")) {
        throw new Error("Instagram embed should be wrapped in <blockquote> child. This blockquote child should have a classname equal to \"instagram-media\". Instagram embed should have the data-instgrm captioned and data-instgrm-version attributes, and the data-instagram-permalink attribute should match /https:\/\/www.instagram.com\/.*/.");
    }
    const blockquoteChildren = Array.from(blockquote.children);
    if (blockquoteChildren.length !== 1 || blockquoteChildren[0].nodeName !== 'DIV') {
        throw new Error("Instagram embed blcokquote wrapper should only have one <div> child with the style attribute.");
    }
    const divWrapper = blockquoteChildren[0];
    const divChildren = Array.from(divWrapper.children);
    if (divChildren[0].nodeName !== 'A' || divChildren[1].nodeName !== 'P') {
    }
    const anchorWrapper = divChildren[0];
    const anchorWrapperDescendents = Array.from(anchorWrapper.querySelectorAll('*'));
    anchorWrapperDescendents.forEach((child) => {
        switch (child.tagName) {
            case "DIV":
                // Children can be div | svg
                // can have style attribute
                const attribs = child.attributes;
                const attributeArray = [];
                for (let i = 0; i < attribs.length; i++) {
                    const tempAt = attribs.item(i);
                    if (tempAt)
                        attributeArray.push(tempAt.name);
                }
                if (attributeArray.length > 1 || (attributeArray.length === 1 && attributeArray[0] !== 'style')) {
                    throw new Error("DIV element in instagram embed can only have style attribute.");
                }
                break;
            case "svg":
                if (!!!child.hasAttribute("width") ||
                    !!!child.hasAttribute("height") ||
                    !!!child.hasAttribute("viewBox") ||
                    !!!child.hasAttribute("version") ||
                    !!!child.hasAttribute("xmlns") ||
                    !!!child.hasAttribute("xmlns:xlink") ||
                    Array.from(child.children).length !== 1 ||
                    Array.from(child.children)[0].tagName !== 'g') {
                    throw new Error("svg attribute in instagram embed does not have valid attributes or the correct number of children or its child is not a g element.");
                }
                break;
            case "g":
                const HasUnrecognizedDescendants = Boolean(Array.from(child.querySelectorAll('*')).filter((el) => el.tagName !== 'g' && el.tagName !== 'path').length > 1);
                const HasMoreThanOneChild = Array.from(child.children).length > 1;
                if (HasMoreThanOneChild || HasUnrecognizedDescendants) {
                    throw new Error("g tag in Instagram embed has more than one child or has a descendant with a tagName that does not match the pattren.");
                }
                const attrs = child.attributes;
                const attributes = [];
                for (let i = 0; i < attrs.length; i++) {
                    const tempAt = attrs.item(i);
                    if (tempAt)
                        attributes.push(tempAt.name);
                }
                for (let attr of attributes) {
                    if (!!!gAttributesSet.has(attr)) {
                        throw new Error("Unrecognized g attribute for instagram embed.");
                    }
                }
                break;
            case "path":
                if (Array.from(child.children).length > 0 || !!!child.hasAttribute('d')) {
                    throw new Error('path element for instagram embed should have no children and have a d attribute.');
                }
                break;
            default:
                throw new Error("Invalid Instagram embed structure. Unrecognized child tagName in anchor wrapper.");
        }
    });
    const endP = divChildren[1];
    const endPChildren = Array.from(endP.children);
    if (endPChildren.length !== 1 || endPChildren[0].nodeName !== 'A' ||
        !!!/https:\/\/www.instagram.com\/.*/.test(String(endPChildren[0].getAttribute('href'))) ||
        !!!endPChildren[0].hasAttribute('style') ||
        endPChildren[0].getAttribute('target') !== '_blank' ||
        Array.from(endPChildren[0].children).length > 0) {
        throw new Error("The ending paragraph of the div wrapper should have one anchor tag child that has appropraiet attributes.");
    }
    const newHTML = blockquote.outerHTML;
    const DOMPurify = (0, dompurify_1.default)(window);
    const finalHTML = DOMPurify.sanitize(newHTML, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: true
    });
    return finalHTML;
}
exports.validateInstagramEmbed = validateInstagramEmbed;
