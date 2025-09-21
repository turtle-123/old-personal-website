/** @module @lexical/markdown */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  ElementTransformer,
  TextFormatTransformer,
  TextMatchTransformer,
  Transformer,
} from './MarkdownTransformers';
import type {ElementNode, LexicalEditor} from 'lexical';

import {createMarkdownExport} from './MarkdownExport';
import {createMarkdownImport} from './MarkdownImport';
import {registerMarkdownShortcutsEditable} from './MarkdownShortcuts';
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  CHECK_LIST,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  TABLE,
  EQUATION,
  IMAGE,
  INLINE_QUOTE,
  SUPERSCRIPT_COMMAND,
  SUBSCRIPT_COMMAND,
  KBD_COMMAND,
  EQUATION_BLOCK,
  ABBREVIATION,
  SECTION_HEADING,
  HORIZONTAL_RULE,
  NEWS_NODE,
  YOUTUBE_NODE,
  TWITTER_NODE,
  TIKTOK_NODE,
  INSTAGRAM_NODE,
  CAROUSEL_IMAGE_NODE,
  AUDIO_NODE,
  VIDEO_NODE,
  HTML_NODE
} from './MarkdownTransformers';

const ELEMENT_TRANSFORMERS: Array<ElementTransformer> = [
  HEADING,
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  EQUATION_BLOCK,
  HORIZONTAL_RULE,
  NEWS_NODE,
  YOUTUBE_NODE,
  TWITTER_NODE,
  TIKTOK_NODE,
  INSTAGRAM_NODE,
  CAROUSEL_IMAGE_NODE,
  AUDIO_NODE,
  VIDEO_NODE,
  HTML_NODE
];

// Order of text format transformers matters:
//
// - code should go first as it prevents any transformations inside
// - then longer tags match (e.g. ** or __ should go before * or _)
const TEXT_FORMAT_TRANSFORMERS: Array<TextFormatTransformer> = [
  INLINE_CODE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_QUOTE,
  SUPERSCRIPT_COMMAND,
  SUBSCRIPT_COMMAND,
  KBD_COMMAND,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
];

const TEXT_MATCH_TRANSFORMERS: Array<TextMatchTransformer> = [
  LINK,
  ABBREVIATION,
  SECTION_HEADING
];

const TRANSFORMERS: Array<Transformer> = [
  ...ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

const FULL_EDITOR_TRANSFORMERS = [
  ...TRANSFORMERS,
  EQUATION,
  IMAGE,
  TABLE
];
const COMMENT_EDITOR_TRANSFORMERS = [
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  ...TEXT_FORMAT_TRANSFORMERS,
  LINK,
  EQUATION
];
const TEXT_ONLY_EDITOR_TRANSFORMERS = [
  ...TEXT_FORMAT_TRANSFORMERS
];
const TEXT_WITH_LINKS_EDITOR_TRANSFORMERS = [
  ...TEXT_FORMAT_TRANSFORMERS,
  LINK
];
const TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS = [
  QUOTE,
  CODE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  ...TEXT_FORMAT_TRANSFORMERS,
  LINK,
  EQUATION
];


function $convertFromMarkdownString(markdown: string,transformers: Array<Transformer> = TRANSFORMERS,node?: ElementNode): void {
  const importMarkdown = createMarkdownImport(transformers);
  return importMarkdown(markdown, node);
}

function $convertToMarkdownString(transformers: Array<Transformer> = TRANSFORMERS,node?: ElementNode): string {
  const exportMarkdown = createMarkdownExport(transformers);
  return exportMarkdown(node);
}


export {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  CHECK_LIST,
  CODE,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  registerMarkdownShortcutsEditable,
  STRIKETHROUGH,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TextFormatTransformer,
  TextMatchTransformer,
  Transformer,
  TRANSFORMERS,
  UNORDERED_LIST,
  FULL_EDITOR_TRANSFORMERS,
  COMMENT_EDITOR_TRANSFORMERS,
  TEXT_ONLY_EDITOR_TRANSFORMERS,
  TEXT_WITH_LINKS_EDITOR_TRANSFORMERS,
  TEXT_WITH_BLOCK_EDITOR_TRANSFORMERS
};
