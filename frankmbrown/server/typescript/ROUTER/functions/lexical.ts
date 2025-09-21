import { Request, Response } from 'express';
import crypto from 'node:crypto';
import ejs from 'ejs';
import fs from 'node:fs';
import path from 'node:path';
import DEFAULT_SETTINGS from '../../CONSTANTS/DEFAULT_SETTINGS';
import IS_DEVELOPMENT from '../../CONSTANTS/IS_DEVELOPMENT';
import { getNavbarColor } from './settingsHandler';

import { fullPageRequest, pageRequest, subPageRequest } from '../helper_functions/frontendHelper';
import { ParsedEditorStateReturn, parseFullLexicalEditor } from '../../lexical';
import { getErrorSnackbar } from '../html';
import { escape } from 'html-escaper';
const ArticleBuilder1 = fs.readFileSync(path.resolve(__dirname,'..','..','..','..','views','lexical','rich-text-editor-article-builder.ejs'),{encoding:'utf-8'});
const ArticleBuilder2 = fs.readFileSync(path.resolve(__dirname,'..','..','..','..','views','lexical','rich-text-editor-article-builder-2.ejs'),{encoding:'utf-8'});

export function renderLexicalArticleBuilder1(req:Request) {
  const rand = crypto.randomUUID()
  const renderObj = {
    layout: false,
    "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
    "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
    "font_family_lexical": 'font_family_lexical_'.concat(rand),
    "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
    "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
    "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
    "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
    "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
    "highlight-lexical": 'highlight-lexical_'.concat(rand),
    "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
    "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
    "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
    "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
    "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
    "font_size_lexical": 'font_size_lexical_'.concat(rand),
    "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
    "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
    "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
    "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
    "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
    "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
    "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
    "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
    "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
    "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
    "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
    "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
    "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
    "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
    "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
    "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
    "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
    "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
    "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
    "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
    "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
    "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
    'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
    'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
    'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
    ...getRequiredVariablesPartial(req)
  }; 
  const str = ejs.render(ArticleBuilder1,renderObj);
  return str;
}

export function renderLexicalArticleBuilder2(req:Request) {
  const rand = crypto.randomUUID()
  const renderObj = {
    layout: false,
    'random-id': 'random-id_'.concat(rand),
    'random-heading': 'random_heading_'.concat(rand),
    "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
    "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
    "font_family_lexical": 'font_family_lexical_'.concat(rand),
    "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
    "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
    "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
    "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
    "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
    "highlight-lexical": 'highlight-lexical_'.concat(rand),
    "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
    "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
    "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
    "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
    "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
    "font_size_lexical": 'font_size_lexical_'.concat(rand),
    "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
    "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
    "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
    "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
    "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
    "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
    "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
    "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
    "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
    "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
    "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
    "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
    "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
    "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
    "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
    "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
    "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
    "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
    "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
    "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
    "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
    "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
    'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
    'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
    'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
    ...getRequiredVariablesPartial(req)
  };
  const str = ejs.render(ArticleBuilder2,renderObj);
  return str;
}

export function getFullLexicalRenderObj() {
  const rand = crypto.randomUUID()
  return {
    "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
    "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
    "font_family_lexical": 'font_family_lexical_'.concat(rand),
    "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
    "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
    "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
    "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
    "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
    "highlight-lexical": 'highlight-lexical_'.concat(rand),
    "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
    "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
    "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
    "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
    "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
    "font_size_lexical": 'font_size_lexical_'.concat(rand),
    "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
    "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
    "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
    "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
    "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
    "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
    "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
    "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
    "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
    "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
    "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
    "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
    "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
    "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
    "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
    "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
    "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
    "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
    "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
    "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
    "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
    "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
    'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
    'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
    'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
    'lexical-wrapper': 'lexical_wrapper_'.concat(rand)
  };
}

export function getArticleBuilder3RenderObj({ hxPost, loading, target, id }:{ hxPost?:string, loading?:string, target?:string, id?: string }) {
  const rand = crypto.randomUUID()
  return {
    'random-id': 'random-id_'.concat(rand),
    'random-heading': 'random_heading_'.concat(rand),
    "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
    "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
    "font_family_lexical": 'font_family_lexical_'.concat(rand),
    "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
    "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
    "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
    "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
    "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
    "highlight-lexical": 'highlight-lexical_'.concat(rand),
    "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
    "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
    "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
    "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
    "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
    "font_size_lexical": 'font_size_lexical_'.concat(rand),
    "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
    "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
    "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
    "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
    "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
    "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
    "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
    "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
    "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
    "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
    "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
    "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
    "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
    "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
    "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
    "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
    "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
    "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
    "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
    "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
    "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
    "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
    'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
    'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
    'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
    "form-id": "form_".concat(rand),
    "article-title": "article_title_".concat(rand),
    "mobile-preview-button": "mpb_".concat(rand),
    "tablet-preview-button": "tpb_".concat(rand),
    "desktop-preview-button": "dpb_".concat(rand),
    'lexical-wrapper': id ? id : 'lexical_wrapper_'.concat(rand),
    hxPost: hxPost ? 'hx-post="'.concat(hxPost).concat('"') : undefined,
    loading: loading ? 'data-loading="'.concat(loading).concat('"'):undefined,
    target: target ? 'hx-target="'.concat(target).concat('"'):undefined,
  }; 
}

export default function getLexical(req:Request,res:Response) {
  const { type, other } = req.params;
  const rand = crypto.randomUUID()
  if (type==="classic"||type==="poll-description"){
    var view:string = '';
    if (type==="classic") view = 'lexical/rich-text-editor-full'
    else if (type==="poll-description") view = 'lexical/rich-text-editor-poll-description';
    const renderObj = {
      layout: false,
      "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
      "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
      "font_family_lexical": 'font_family_lexical_'.concat(rand),
      "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
      "highlight-lexical": 'highlight-lexical_'.concat(rand),
      "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
      "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
      "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
      "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
      "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
      "font_size_lexical": 'font_size_lexical_'.concat(rand),
      "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
      "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
      "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
      "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
      "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
      "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
      "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
      "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
      "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
      "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
      "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
      "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
      "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
      "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
      "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
      "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
      "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
      "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
      "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
      "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
      "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
      "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
      'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      'lexical-wrapper': 'lexical_wrapper_'.concat(Math.random().toString().slice(2)),
      ...getRequiredVariablesPartial(req)
    }; 
    return res.render(view,renderObj);
  } else if (type==="article-builder"){
    const renderObj = {
      layout: false,
      "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
      "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
      "font_family_lexical": 'font_family_lexical_'.concat(rand),
      "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
      "highlight-lexical": 'highlight-lexical_'.concat(rand),
      "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
      "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
      "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
      "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
      "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
      "font_size_lexical": 'font_size_lexical_'.concat(rand),
      "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
      "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
      "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
      "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
      "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
      "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
      "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
      "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
      "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
      "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
      "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
      "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
      "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
      "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
      "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
      "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
      "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
      "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
      "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
      "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
      "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
      "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
      'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      ...getRequiredVariablesPartial(req)
    }; 
    return res.render('lexical/rich-text-editor-article-builder',renderObj);
  } else if (type==="article-builder-2"){
    const renderObj = {
      layout: false,
      'random-id': 'random-id_'.concat(rand),
      'random-heading': 'random_heading_'.concat(rand),
      "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
      "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
      "font_family_lexical": 'font_family_lexical_'.concat(rand),
      "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
      "highlight-lexical": 'highlight-lexical_'.concat(rand),
      "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
      "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
      "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
      "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
      "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
      "font_size_lexical": 'font_size_lexical_'.concat(rand),
      "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
      "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
      "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
      "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
      "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
      "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
      "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
      "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
      "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
      "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
      "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
      "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
      "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
      "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
      "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
      "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
      "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
      "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
      "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
      "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
      "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
      "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
      'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      ...getRequiredVariablesPartial(req)
    }; 
    return res.render('lexical/rich-text-editor-article-builder-2',renderObj);
  } else if (type==="poll-question"){
    const renderObj = {
      layout:false,
      'random-id': 'question_'.concat(rand),
      'wrapper-id': 'lexical-wrapper_'.concat(rand),
      'question-type-dropdown': 'question-type-dropdown_'.concat(rand),
      'question-type-input': 'question-type-input_'.concat(rand), 
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-background-color-transparent-2': 'lex-background-color-transparent-2_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      'lex-text-color-transparent-2': 'lex-text-color-transparent-2_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
      "new-question-indicator":"new-question-indicator_".concat(rand), 
      'poll-required-checkbox':'poll-required-checkbox_'.concat(rand),
      'example-response-id':'example-response-id_'.concat(rand),
      'example-option-id': 'example-option-id_'.concat(rand),
      'example-input-name': 'example-input-name_'.concat(rand),
      ...getRequiredVariablesPartial(req),
    };
    return res.render('lexical/rich-text-editor-poll-wrapper',renderObj);
  } else if (type==="poll-option"){
    const renderObj:{[s:string]:string} = {
      /* @ts-ignore */
      layout: false,
      'example-option-id': 'example-option-id_'.concat(rand),
      'example-input-name': 'example-input-name_'.concat(rand),
      'example-response-id':'example-response-id_'.concat(rand),
      'poll-required-checkbox':'poll-required-checkbox_'.concat(rand),
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-background-color-transparent-2': 'lex-background-color-transparent-2_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      'lex-text-color-transparent-2': 'lex-text-color-transparent-2_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
    };
    if (other==="multiple-choice"){
      renderObj.optionType="multiple-choice";
      return res.status(200).render('lexical/rich-text-editor-poll-option',renderObj);
    }else if (other==="checkbox"){
      renderObj.optionType="checkbox";
      return res.status(200).send('');
    } else {
      return res.status(200).send('');
    }
  } else if (type==="article-builder-3") {
    const renderObj = {
      layout: false,
      'random-id': 'random-id_'.concat(rand),
      'random-heading': 'random_heading_'.concat(rand),
      "hidden-label-lexical-font-1": 'hidden-label-lexical-font-1_'.concat(rand),
      "lexical-font-family-dropdown": 'lexical-font-family-dropdown_'.concat(rand),
      "font_family_lexical": 'font_family_lexical_'.concat(rand),
      "heading-node-lexical-menu": 'heading-node-lexical-menu_'.concat(rand),
      "lexical-background-color-menu": 'lexical-background-color-menu_'.concat(rand),
      "lexical-background-color-1": 'lexical-background-color-1_'.concat(rand),
      "lexical-text-color-menu": 'lexical-text-color-menu_'.concat(rand),
      "lexical-text-color-1": 'lexical-text-color-1_'.concat(rand),
      "highlight-lexical": 'highlight-lexical_'.concat(rand),
      "hidden-label-lexical-weight-1": 'hidden-label-lexical-weight-1_'.concat(rand),
      "lexical-font-weight-dropdown": 'lexical-font-weight-dropdown_'.concat(rand),
      "font_weight_lexical": 'font_weight_lexical_'.concat(rand),
      "hidden-label-lexical-size-1": 'hidden-label-lexical-size-1_'.concat(rand),
      "lexical-font-size-dropdown": 'lexical-font-size-dropdown_'.concat(rand),
      "font_size_lexical": 'font_size_lexical_'.concat(rand),
      "lexical-insert-link-main": 'lexical-insert-link-main_'.concat(rand),
      "lex-insert-link-main-url": 'lex-insert-link-main-url_'.concat(rand),
      "embed-media-content-popup": 'embed-media-content-popup_'.concat(rand),
      "lex-insert-lists-popover": 'lex-insert-lists-popover_'.concat(rand),
      "lex-insert-quotes-popover": 'lex-insert-quotes-popover_'.concat(rand),
      "lex-insert-aside-menu": 'lex-insert-aside-menu_'.concat(rand),
      "lexical-code-lang-dropdown-input": 'lexical-code-lang-dropdown-input_'.concat(rand),
      "lexical-code-lang-dropdown": 'lexical-code-lang-dropdown_'.concat(rand),
      "lexical-upload-single-image-input": 'lexical-upload-single-image-input_'.concat(rand),
      "lexical-upload-single-image": 'lexical-upload-single-image_'.concat(rand),
      "lexical-upload-multiple-images-input": 'lexical-upload-multiple-images-input_'.concat(rand),
      "lexical-upload-multiple-images": 'lexical-upload-multiple-images_'.concat(rand),
      "lexical-upload-carousel-images-input": 'lexical-upload-carousel-images-input_'.concat(rand),
      "lexical-upload-image-carousel": 'lexical-upload-image-carousel_'.concat(rand),
      "insert-audio-file-tab-lexical": 'insert-audio-file-tab-lexical_'.concat(rand),
      "lexical-upload-single-audio-input": 'lexical-upload-single-audio-input_'.concat(rand),
      "insert-audio-files-tab-lexical": 'insert-audio-files-tab-lexical_'.concat(rand),
      "lexical-upload-multiple-audio-input": 'lexical-upload-multiple-audio-input_'.concat(rand),
      "insert-video-file-tab-lexical": 'insert-video-file-tab-lexical_'.concat(rand),
      "insert-video-files-tab-lexical": 'insert-video-files-tab-lexical_'.concat(rand),
      "lexical-upload-single-video-input": 'lexical-upload-single-video-input_'.concat(rand),
      "lexical-upload-multiple-video-input": 'lexical-upload-multiple-video-input_'.concat(rand),
      'lex-insert-code-menu': 'lex-insert-code-menu_'.concat(rand),
      'lex-background-color-transparent': 'lex-background-color-transparent_'.concat(rand),
      'lex-text-color-transparent': 'lex-text-color-transparent_'.concat(rand),
      'lexical-wrapper': 'lexical_wrapper_'.concat(rand),
      ...getRequiredVariablesPartial(req)
    }; 
    return res.render('lexical/rich-text-editor-article-builder-3',renderObj);
  }
} 



/**
 * Get Required variables that are usually used for rendering full pages 
 * for rendering partials 
 * @param req 
 * @returns 
 */
function getRequiredVariablesPartial(req:Request):any {
  var snackbarMessage = undefined;
  if(req.session.snackbarMessage?.showMessage===true) {
    snackbarMessage = req.session.snackbarMessage.message;
    req.session.snackbarMessage.showMessage = false;
  }
  return {
    phone: req.session?.device?.phone || false,
    tablet: req.session?.device?.tablet || false,
    desktop: req.session?.device?.desktop || false,
    fullPageRequest: fullPageRequest(req),
    pageRequest: pageRequest(req),
    subPageRequest: subPageRequest(req),
    development: IS_DEVELOPMENT,
    settings: req.session.settings || structuredClone(DEFAULT_SETTINGS),
    navbarColor: getNavbarColor(req.session?.settings),
    jsNonce: String(req.session.jsNonce),
    snackbarMessage,
    showedBanner: Boolean(req?.session?.cookiePreferences?.showedBanner===true),
    cookieStatistics: Boolean(req.session.cookiePreferences?.statistics===true),
    spellcheck: Boolean(req.session.settings?.spellcheck===true),
    settingsMode: Boolean(req.session?.settings?.mode==="light")?"lightMode":"darkMode",
    auth: Number(req.session.auth?.level),
    csrf_token: String(req.session.csrf_token)
  };
}

export async function renderExampleLexical(req:Request,res:Response) {
  try {
    const getHTML = (obj: ParsedEditorStateReturn) => {
      if (req.session.device?.desktop) {
        return obj.desktop_html;
      } else if (req.session.device?.tablet) {
        return obj.tablet_html;
      } else {
        return obj.mobile_html;
      }
    }
    const randomUUID = crypto.randomUUID();
    const lexicalState = JSON.parse(req.body['lexical_example_editor']);
    const resp = await parseFullLexicalEditor(lexicalState);
    const html = getHTML(resp);
    const desktop_html = resp.desktop_html;
    const tablet_html = resp.tablet_html;
    const mobile_html= resp.mobile_html;
    const s = JSON.stringify(lexicalState,null,' ');
    return res.status(200).send(`<div class="lexical-wrapper example-render hz-scroll" data-display-only style="padding: 0px;" data-rich-text-editor data-type="full" data-editable="false" id="${randomUUID}">${html}</div>
<details aria-label="JSON Lexical State" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">JSON Lexical State</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code >
<pre  style="font-family: monospace;">
${s}
</pre>
</code> 
</div>
</details>

<details aria-label="Desktop HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Desktop HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${escape(desktop_html)}
</pre>
</code> 
</div>
</details>

<details aria-label="Tablet HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Tablet HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${escape(tablet_html)} 
</pre>
</code> 
</div>
</details>

<details aria-label="Mobile HTML" class="mt-2 flat">
<summary>
  <span class="h6 fw-regular">Mobile HTML</span>
  <svg class="details" focusable="false" inert viewBox="0 0 24 24">
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z">
    </path>
  </svg>
</summary>
<div class="accordion-content hz-scroll" aria-hidden="true" style="max-width: 100%; overflow: auto; max-height: 400px; background-color: var(--background);">
<code>
<pre  style="font-family: monospace;">
${escape(mobile_html)}
</pre>
</code> 
</div>
</details>
    `);
  } catch (error) {
    console.error(error); 
    return res.status(200).send(getErrorSnackbar('Something went wrong getting the lexical state!'));
  }
}