/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ListType} from '@lexical/list';
import type {HeadingTagType} from '@lexical/rich-text';

import {$createCodeNode, $isCodeNode, CodeHighlightNode, CodeNode} from '@lexical/code';
import {$createAbbreviationNode, $createLinkNode, $createSectionHeadingNode, $isAbbreviationNode, $isLinkNode, $isSectionHeadingNode, AbbreviationNode, LinkNode, SectionHeadingNode} from '@lexical/link';
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingNode,
  QuoteNode,
} from '@lexical/rich-text';
import {
  $createLineBreakNode,
  $createTextNode,
  $isTextNode,
  ElementNode,
  Klass,
  LexicalNode,
  TextFormatType,
  TextNode,
  $isParagraphNode,
  TableWrapperNode,
  VALID_HEX_REGEX,
  $isTableWrapperNode,
} from 'lexical';
import { ImageNode, $isImageNode, $createImageNode, HorizontalRuleNode, $isHorizontalRuleNode, $createHorizontalRuleNode, NewsNode, $isNewsNode, YouTubeNode, $isYouTubeNode, TikTokNode, $isTikTokNode, InstagramNode, $isInstagramNode, $isCarouselImageNode, CarouselImageNode, $isAudioNode, AudioNode, $isVideoNode, VideoNode, HtmlNode, TwitterNode, $isTwitterNode, DecoratorBlockNode, $isDecoratorBlockNode  } from '@lexical/decorators';
import { $createMathNode, $isMathNode, MathNode } from '@lexical/math';
import { 
  TableNode, 
  TableRowNode, 
  TableCellNode, 
  $isTableNode, 
  $isTableRowNode, 
  $isTableCellNode, 
  $createTableNode, 
  TableCellHeaderStates,
  $createTableCellNode,
  $createTableRowNode
 } from '@lexical/table';
import { $convertToMarkdownString, $convertFromMarkdownString, FULL_EDITOR_TRANSFORMERS } from '.';
import { getDeviceType } from '@lexical/shared';
import { $isAccordionContentNode, $isDetailsNode, AccordionContentNode, DetailsNode } from '@lexical/details';
import { $isAsideNode, AsideNode } from '@lexical/aside';
import { $isLayoutContainerNode, $isLayoutItemNode, LayoutContainerNode, LayoutItemNode } from '@lexical/column';
import { $isHtmlNode } from '@lexical/decorators';

export type Transformer =
  | ElementTransformer
  | TextFormatTransformer
  | TextMatchTransformer;

export type ElementTransformer = {
  dependencies: Array<Klass<LexicalNode>>;
  export: (
    node: LexicalNode,
    // eslint-disable-next-line no-shadow
    traverseChildren: (node: ElementNode) => string,
  ) => string | null;
  regExp: RegExp;
  replace: (
    parentNode: ElementNode,
    children: Array<LexicalNode>,
    match: Array<string>,
    isImport: boolean,
  ) => void;
  type: 'element';
};

export type TextFormatTransformer = Readonly<{
  format: ReadonlyArray<TextFormatType>;
  tag: string;
  intraword?: boolean;
  type: 'text-format';
}>;

export type TextMatchTransformer = Readonly<{
  dependencies: Array<Klass<LexicalNode>>;
  export: (
    node: LexicalNode,
    // eslint-disable-next-line no-shadow
    exportChildren: (node: ElementNode) => string,
    // eslint-disable-next-line no-shadow
    exportFormat: (node: TextNode, textContent: string) => string,
  ) => string | null;
  importRegExp: RegExp;
  regExp: RegExp;
  replace: (node: TextNode, match: RegExpMatchArray) => void;
  trigger: string;
  type: 'text-match';
}>;

const createBlockNode = (
  createNode: (match: Array<string>) => ElementNode,
): ElementTransformer['replace'] => {
  return (parentNode, children, match) => {
    const node = createNode(match);
    node.append(...children);
    parentNode.replace(node);
    node.select(0, 0);
  };
};

// Amount of spaces that define indentation level
// TODO: should be an option
const LIST_INDENT_SIZE = 4;

const listReplace = (listType: ListType): ElementTransformer['replace'] => {
  return (parentNode, children, match) => {
    const previousNode = parentNode.getPreviousSibling();
    const nextNode = parentNode.getNextSibling();
    const listItem = $createListItemNode(
      listType === 'check' ? match[3] === 'x' : undefined,
    );
    if ($isListNode(nextNode) && nextNode.getListType() === listType) {
      const firstChild = nextNode.getFirstChild();
      if (firstChild !== null) {
        firstChild.insertBefore(listItem);
      } else {
        // should never happen, but let's handle gracefully, just in case.
        nextNode.append(listItem);
      }
      parentNode.remove();
    } else if (
      $isListNode(previousNode) &&
      previousNode.getListType() === listType
    ) {
      previousNode.append(listItem);
      parentNode.remove();
    } else {
      const list = $createListNode(
        listType,
        listType === 'number' ? Number(match[2]) : undefined,
      );
      list.append(listItem);
      parentNode.replace(list);
    }
    listItem.append(...children);
    listItem.select(0, 0);
    const indent = Math.floor(match[1].length / LIST_INDENT_SIZE);
    if (indent) {
      listItem.setIndent(indent);
    }
  };
};

const listExport = (
  listNode: ListNode,
  exportChildren: (node: ElementNode) => string,
  depth: number,
): string => {
  const output = [];
  const children = listNode.getChildren();
  let index = 0;
  for (const listItemNode of children) {
    if ($isListItemNode(listItemNode)) {
      if (listItemNode.getChildrenSize() === 1) {
        const firstChild = listItemNode.getFirstChild();
        if ($isListNode(firstChild)) {
          output.push(listExport(firstChild, exportChildren, depth + 1));
          continue;
        }
      }
      const indent = ' '.repeat(depth * LIST_INDENT_SIZE);
      const listType = listNode.getListType();
      const prefix =
        listType === 'number'
          ? `${listNode.getStart() + index}. `
          : listType === 'check'
          ? `- [${listItemNode.getChecked() ? 'x' : ' '}] `
          : '- ';
      output.push(indent + prefix + exportChildren(listItemNode));
      index++;
    }
  }

  return output.join('\n');
};

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const alt = node.getShort().replace(/\)/g,'\\)');
    const long = node.getLong().replace(/\)/g,'\\)');
    const width = node.getWidth();
    const height = node.getHeight();
    const originalDevice = node.getOriginalDevice();
    const backgroundColor = node.getBackgroundColor();
    const src = node.getSrc();
    var str =  `![${alt}](${src})(${long})(${width})(${height})(${originalDevice})`;
    if (backgroundColor) str += `(${backgroundColor})`;
    console.log(str);
    return str;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      short: altText,
      long: '',
      src: src,
      width: 300,
      height: 300,
      originalDevice:getDeviceType(),
      backgroundColor: undefined
    });
    textNode.replace(imageNode);
  },
  trigger: ')',
  type: 'text-match',
};
export const EQUATION: TextMatchTransformer = {
  dependencies: [MathNode],
  export: (node) => {
    if (!$isMathNode(node)) {
      return null;
    }
    return `$${node.getEquation()}$`;
  },
  importRegExp: /\$([^$]+?)\$/,
  regExp: /\$([^$]+?)\$$/,
  replace: (textNode, match) => {
    const [, equation] = match;
    const equationNode = $createMathNode(equation, true);
    textNode.replace(equationNode);
  },
  trigger: '$',
  type: 'text-match',
};
export const HEADING: ElementTransformer = {
  dependencies: [HeadingNode],
  export: (node, exportChildren) => {
    if (!$isHeadingNode(node)) {
      return null;
    }
    const level = Math.max(2,Number(node.getTag().slice(1)));
    return '#'.repeat(level) + ' ' + exportChildren(node);
  },
  regExp: /^(#{2,6})\s/,
  replace: createBlockNode((match) => {
    const tag = ('h' + match[1].length) as HeadingTagType;
    return $createHeadingNode(tag);
  }),
  type: 'element',
};
export const QUOTE: ElementTransformer = {
  dependencies: [QuoteNode],
  export: (node, exportChildren) => {
    if (!$isQuoteNode(node)) {
      return null;
    }
    const lines = exportChildren(node).split('\n');
    const output = [];
    for (const line of lines) {
      output.push('> ' + line);
    }
    return output.join('\n');
  },
  regExp: /^>\s/,
  replace: (parentNode, children, _match, isImport) => {
    if (isImport) {
      const previousNode = parentNode.getPreviousSibling();
      if ($isQuoteNode(previousNode)) {
        previousNode.splice(previousNode.getChildrenSize(), 0, [
          $createLineBreakNode(),
          ...children,
        ]);
        previousNode.select(0, 0);
        parentNode.remove();
        return;
      }
    }
    const node = $createQuoteNode();
    node.append(...children);
    parentNode.replace(node);
    node.select(0, 0);
  },
  type: 'element',
};
export const CODE: ElementTransformer = {
  dependencies: [CodeNode,CodeHighlightNode],
  export: (node: LexicalNode) => {
    if (!$isCodeNode(node)) {
      return null;
    }
    const textContent = node.getTextContent();
    return (
      '```' +
      (node.getLanguage() || '') +
      (textContent ? '\n' + textContent : '') +
      '\n' +
      '```'
    );
  },
  regExp: /^```(\w{1,14})?\s/,
  replace: createBlockNode((match) => {
    return $createCodeNode({ language: match ? match[1] : undefined, onlyCodeEditor: false });
  }),
  type: 'element',
};
export const UNORDERED_LIST: ElementTransformer = {
  dependencies: [ListNode, ListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null;
  },
  regExp: /^(\s*)[-*+]\s/,
  replace: listReplace('bullet'),
  type: 'element',
};
export const CHECK_LIST: ElementTransformer = {
  dependencies: [ListNode, ListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null;
  },
  regExp: /^(\s*)(?:-\s)?\s?(\[(\s|x)?\])\s/i,
  replace: listReplace('check'),
  type: 'element',
};
export const ORDERED_LIST: ElementTransformer = {
  dependencies: [ListNode, ListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null;
  },
  regExp: /^(\s*)(\d{1,})\.\s/,
  replace: listReplace('number'),
  type: 'element',
};
export const INLINE_CODE: TextFormatTransformer = {
  format: ['code'],
  tag: '`',
  type: 'text-format',
};
export const INLINE_QUOTE: TextFormatTransformer = {
  format: ['quote'],
  tag: '"',
  type: 'text-format'
};
export const SUPERSCRIPT_COMMAND: TextFormatTransformer = {
  format: ['superscript'],
  tag: '^',
  type: 'text-format'
}
export const SUBSCRIPT_COMMAND: TextFormatTransformer = {
  format: ['subscript'],
  tag: '~',
  type: 'text-format'
}
export const KBD_COMMAND: TextFormatTransformer = {
  format: ['kbd'],
  tag: '|',
  type: 'text-format'
}
// export const HIGHLIGHT: TextFormatTransformer = {
//   format: ['highlight'],
//   tag: '==',
//   type: 'text-format',
// };

export const BOLD_ITALIC_STAR: TextFormatTransformer = {
  format: ['bold', 'italic'],
  tag: '***',
  type: 'text-format',
};
export const BOLD_ITALIC_UNDERSCORE: TextFormatTransformer = {
  format: ['bold', 'italic'],
  intraword: false,
  tag: '___',
  type: 'text-format',
};
export const BOLD_STAR: TextFormatTransformer = {
  format: ['bold'],
  tag: '**',
  type: 'text-format',
};
export const BOLD_UNDERSCORE: TextFormatTransformer = {
  format: ['bold'],
  intraword: false,
  tag: '__',
  type: 'text-format',
};
export const STRIKETHROUGH: TextFormatTransformer = {
  format: ['strikethrough'],
  tag: '~~',
  type: 'text-format',
};
export const ITALIC_STAR: TextFormatTransformer = {
  format: ['italic'],
  tag: '*',
  type: 'text-format',
};
export const ITALIC_UNDERSCORE: TextFormatTransformer = {
  format: ['italic'],
  intraword: false,
  tag: '\\_',
  type: 'text-format',
};

// Order of text transformers matters:
//
// - code should go first as it prevents any transformations inside
// - then longer tags match (e.g. ** or __ should go before * or _)
export const LINK: TextMatchTransformer = {
  dependencies: [LinkNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isLinkNode(node)) {
      return null;
    }
    const title = node.getTitle();
    const linkContent = title
      ? `[${node.getTextContent()}](${node.getURL()} "${title}")`
      : `[${node.getTextContent()}](${node.getURL()})`;
    const firstChild = node.getFirstChild();
    // Add text styles only if link has single text node inside. If it's more
    // then one we ignore it as markdown does not support nested styles for links
    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, linkContent);
    } else {
      return linkContent;
    }
  },
  importRegExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
  regExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
  replace: (textNode, match) => {
    const [, linkText, linkUrl, linkTitle] = match;
    const linkNode = $createLinkNode(linkUrl, {title: linkTitle});
    const linkTextNode = $createTextNode(linkText);
    linkTextNode.setFormat(textNode.getFormat());
    linkNode.append(linkTextNode);
    textNode.replace(linkNode);
  },
  trigger: ')',
  type: 'text-match',
};
export const SECTION_HEADING:TextMatchTransformer = {
  dependencies: [SectionHeadingNode],
  export: (node,exportChildren,exportFormat) => {
    if (!$isSectionHeadingNode(node)) {
      return null;
    }
    const id = node.getId();
    const content = `[Section Heading Node](#${id})`;
    const firstChild = node.getFirstChild();
    if (node.getChildrenSize() === 1 && $isTextNode(firstChild)) {
      return exportFormat(firstChild, content);
    } else {
      return content;
    }
  },
  importRegExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
  regExp:
    /(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
  replace: (textNode, match) => {
    const [, linkText, linkUrl, linkTitle] = match;
    if (linkUrl.startsWith('#i')) {
      const sectionHeadingNode = $createSectionHeadingNode(linkUrl.slice(1));
      const textNode = $createTextNode(linkText);
      textNode.setFormat(textNode.getFormat());
      sectionHeadingNode.append(textNode);
      textNode.replace(sectionHeadingNode);
    } else {
      const linkNode = $createLinkNode(linkUrl, {title: linkTitle});
      const linkTextNode = $createTextNode(linkText);
      linkTextNode.setFormat(textNode.getFormat());
      linkNode.append(linkTextNode);
      textNode.replace(linkNode);
    }
  },
  trigger: ')',
  type: 'text-match'
};
export const ABBREVIATION: TextMatchTransformer = {
  dependencies: [AbbreviationNode],
  export: (node,exportChildren,exportFormat) => {
    if (!$isAbbreviationNode(node)) {
      return null;
    }
    const title = node.getTitle();
    const innerText = node.getChildren().map((el) => el.getTextContent()).join('');
    return `[>(${title}) ${innerText}]`;
  },
  importRegExp: /\[>\((\w+)\)\s(\w+)\]/,
  regExp: /\[>\((\w+)\)\s(\w+)\]/,
  replace: (textNode,match) => {
    const [,linkText,linkTitle] = match; 
    const abbreviationNode = $createAbbreviationNode(linkTitle);
    const abbrTextNode = $createTextNode(linkText);
    abbreviationNode.append(abbrTextNode);
    textNode.replace(abbreviationNode);
  },
  trigger: ']',
  type: 'text-match'
}


// Very primitive table setup
const TABLE_ROW_REG_EXP = /^(?:\|)(.+)(?:\|)\s?$/;
const TABLE_ROW_DIVIDER_REG_EXP = /^(\| ?:?-*:? ?)+\|\s?$/;
const SKIP_IMPORT_REGEX =  /$.^/;

export const TABLE: ElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode,TableWrapperNode],
  export: (node: LexicalNode) => {
    if (!$isTableWrapperNode(node)) {
      return null;
    }
    const table = node.getChildren()?.[0];
    if (!!!$isTableNode(table)) {
      return null;
    }
    const output: string[] = [];
    for (const row of table.getChildren()) {
      const rowOutput = [];
      if (!$isTableRowNode(row)) {
        continue;
      }

      let isHeaderRow = false;
      for (const cell of row.getChildren()) {
        // It's TableCellNode so it's just to make flow happy
        if ($isTableCellNode(cell)) {
          rowOutput.push(
            $convertToMarkdownString(FULL_EDITOR_TRANSFORMERS, cell).replace(
              /\n/g,
              '\\n',
            ),
          );
          if (cell.__headerState === TableCellHeaderStates.ROW) {
            isHeaderRow = true;
          }
        }
      }

      output.push(`| ${rowOutput.join(' | ')} |`);
      if (isHeaderRow) {
        output.push(`| ${rowOutput.map((_) => '---').join(' | ')} |`);
      }
    }

    return output.join('\n');
  },
  regExp: TABLE_ROW_REG_EXP,
  replace: (parentNode, _1, match) => {
    // Header row
    if (TABLE_ROW_DIVIDER_REG_EXP.test(match[0])) {
      const table = parentNode.getPreviousSibling();
      if (!table || !$isTableNode(table)) {
        return;
      }

      const rows = table.getChildren();
      const lastRow = rows[rows.length - 1];
      if (!lastRow || !$isTableRowNode(lastRow)) {
        return;
      }

      // Add header state to row cells
      lastRow.getChildren().forEach((cell) => {
        if (!$isTableCellNode(cell)) {
          return;
        }
        cell.toggleHeaderStyle(TableCellHeaderStates.ROW);
      });

      // Remove line
      parentNode.remove();
      return;
    }

    const matchCells = mapToTableCells(match[0]);

    if (matchCells == null) {
      return;
    }

    const rows = [matchCells];
    let sibling = parentNode.getPreviousSibling();
    let maxCells = matchCells.length;

    while (sibling) {
      if (!$isParagraphNode(sibling)) {
        break;
      }

      if (sibling.getChildrenSize() !== 1) {
        break;
      }

      const firstChild = sibling.getFirstChild();

      if (!$isTextNode(firstChild)) {
        break;
      }

      const cells = mapToTableCells(firstChild.getTextContent());

      if (cells == null) {
        break;
      }

      maxCells = Math.max(maxCells, cells.length);
      rows.unshift(cells);
      const previousSibling = sibling.getPreviousSibling();
      sibling.remove();
      sibling = previousSibling;
    }

    const table = $createTableNode();

    for (const cells of rows) {
      const tableRow = $createTableRowNode();
      table.append(tableRow);

      for (let i = 0; i < maxCells; i++) {
        tableRow.append(i < cells.length ? cells[i] : $createTableCell(''));
      }
    }

    const previousSibling = parentNode.getPreviousSibling();
    if (
      $isTableNode(previousSibling) &&
      getTableColumnsSize(previousSibling) === maxCells
    ) {
      previousSibling.append(...table.getChildren());
      parentNode.remove();
    } else {
      parentNode.replace(table);
    }

    table.selectEnd();
  },
  type: 'element',
};
export const EQUATION_BLOCK:ElementTransformer = {
  dependencies: [MathNode],
  export: (node:LexicalNode) => {
    if (!!!$isMathNode(node)) {
      return null;
    }
    return `$$\n${node.getEquation()}\n$$`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
/* Added 3/6/2025 */
export const HORIZONTAL_RULE:ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node:LexicalNode) => {
    if (!!!$isHorizontalRuleNode(node)) {
      return null;
    }
    var str = '-----';
    const color = node.getColor();
    if (color!=='var(--divider)') {
      str += `[${color}]`;
    }
    const size = node.getWidth();
    if (size>=1&&size<=10) {
      str += `[${size}]`;
    }
    return str;
  },
  regExp: /^-----(\[#[0-9A-F]{6}\])?(\[[1-10]\])?/,
  replace: (parentNode,_1,match)=> {
    var color = 'var(--divider)';
    var size = 2;
    if (Array.isArray(match)&&match.length) {
      const a = match[0];
      if (match.length===2) {
        const b = match[1];
        if (VALID_HEX_REGEX.test(a.slice(1,a.length-1))) {
          color = a.slice(1,a.length-1);
        }
        if (parseInt(b)>=1&&parseInt(b)<=10) {
          size = parseInt(b);
        }
      } else if (a) {
        if (VALID_HEX_REGEX.test(a.slice(1,a.length-1))) {
          color = a.slice(1,a.length-1);
        } else if (parseInt(a)>=1&&parseInt(a)<=10) {
          size = parseInt(a);
        }
      }
    }
    const node = $createHorizontalRuleNode({ color, width: size });
    parentNode.replace(node);
    node.select(0, 0);
  },
  type: 'element'
}

export const NEWS_NODE:ElementTransformer = {
  dependencies: [NewsNode],
  export: (node:LexicalNode) => {
    if (!!!$isNewsNode(node)) {
      return null;
    }
    const url = node.getURL().replace(/\)/g,'\\)');
    const title = node.getTitle().replace(/\)/g,'\\)')
    const description = node.getDescription().replace(/\)/g,'\\)');
    const imageURL = node.getImageURL().replace(/\)/g,'\\)');
    const host = node.getHost().replace(/\)/g,'\\)');
    return `!![News Node](${url})(${title})(${description})(${imageURL})(${host})`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const YOUTUBE_NODE:ElementTransformer = {
  dependencies: [YouTubeNode],
  export: (node:LexicalNode) => {
    if (!!!$isYouTubeNode(node)) {
      return null;
    }
    return `!![YouTube Node](${node.getId().replace(/\)/g,'\\)')})`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const TWITTER_NODE:ElementTransformer = {
  dependencies: [TwitterNode],
  export: (node:LexicalNode) => {
    if (!!!$isTwitterNode(node)) {
      return null;
    }
    return (node.exportDOM().element as HTMLDivElement).outerHTML;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const TIKTOK_NODE:ElementTransformer = {
  dependencies: [TikTokNode],
  export: (node:LexicalNode) => {
    if (!!!$isTikTokNode(node)) {
      return null;
    }
    
    return (node.exportDOM().element as HTMLDivElement).outerHTML;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const INSTAGRAM_NODE:ElementTransformer = {
  dependencies: [InstagramNode],
  export: (node:LexicalNode) => {
    if (!!!$isInstagramNode(node)) {
      return null;
    }
    return (node.exportDOM().element as HTMLDivElement).outerHTML;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const CAROUSEL_IMAGE_NODE:ElementTransformer = {
  dependencies: [CarouselImageNode],
  export: (node:LexicalNode) => {
    if (!!!$isCarouselImageNode(node)) {
      return null;
    }
    
    return `!![CarouselImage Node](${JSON.stringify(node.getImageList(),null,'')})`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const AUDIO_NODE:ElementTransformer = {
  dependencies: [AudioNode],
  export: (node:LexicalNode) => {
    if (!!!$isAudioNode(node)) {
      return null;
    }
    
    return `!![Audio Node](${node.getSrc().replace(/\)/g,'\\)')})(${node.getTitle().replace(/\)/g,'\\)')})`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const VIDEO_NODE:ElementTransformer = {
  dependencies: [VideoNode],
  export: (node:LexicalNode) => {
    if (!!!$isVideoNode(node)) {
      return null;
    }
    
    return `!![Video Node](${node.getSrc().replace(/\)/g,'\\)')})(${node.getTitle().replace(/\)/g,'\\)')})(${node.getDescription().replace(/\)/g,'\\)')})(${node.getHeight()})`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}
export const HTML_NODE:ElementTransformer = {
  dependencies: [HtmlNode],
  export: (node:LexicalNode) => {
    if (!!!$isHtmlNode(node)) {
      return null;
    }
    return `<div data-custom-code data-editing="false"><div data-html> ${node.getHtml()}</div></div>`;
  },
  regExp: SKIP_IMPORT_REGEX,
  replace: (parentNode,_1,match)=> {
    parentNode.selectEnd();
  },
  type: 'element'
}

function getTableColumnsSize(table: TableNode) {
  const row = table.getFirstChild();
  return $isTableRowNode(row) ? row.getChildrenSize() : 0;
}

const $createTableCell = (textContent: string): TableCellNode => {
  textContent = textContent.replace(/\\n/g, '\n');
  const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
  $convertFromMarkdownString(textContent, FULL_EDITOR_TRANSFORMERS, cell);
  return cell;
};

const mapToTableCells = (textContent: string): Array<TableCellNode> | null => {
  const match = textContent.match(TABLE_ROW_REG_EXP);
  if (!match || !match[1]) {
    return null;
  }
  return match[1].split('|').map((text) => $createTableCell(text));
};

