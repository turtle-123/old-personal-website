import type { Spread } from "../types";

export const TableCellHeaderStates = {
  BOTH: 3,
  COLUMN: 2,
  NO_STATUS: 0,
  ROW: 1,
};

export type LinkAttributes = {
  rel?: null | string;
  target?: null | string;
  title?: null | string;
};

export type MarkNodeClassType = 'normal'|'primary'|'secondary'|'error'|'warning'|'info'|'success';


export type TableCellHeaderState = typeof TableCellHeaderStates[keyof typeof TableCellHeaderStates];
export type ListType = 'number' | 'bullet' | 'check';

export type ListNodeTagType = 'ul' | 'ol';

export type ElementFormatType =
  | 'left'
  | 'start'
  | 'center'
  | 'right'
  | 'end'
  | 'justify'
  | '';

export type SerializedLexicalNode = {
  type: string;
  version: number;
};
export type TextModeType = 'normal' | 'token' | 'segmented';

export type SerializedElementNode<
  T extends SerializedLexicalNode = SerializedLexicalNode,
> = Spread<
  {
    children: Array<T>;
    direction: 'ltr' | 'rtl' | null;
    format: ElementFormatType;
    indent: number;
  },
  SerializedLexicalNode
>;
export type SerializedElementNodeWithBlockStyle<
  T extends SerializedLexicalNode = SerializedLexicalNode,
> = Spread<
  {
    children: Array<T>;
    direction: 'ltr' | 'rtl' | null;
    format: ElementFormatType;
    indent: number;
    blockStyle: BlockNodeStyleType
  },
  SerializedLexicalNode
>;

export type BlockNodeStyleType = {
  textAlign:'start'|'left'|'center'|'right'|'end',

  backgroundColor: string,
  textColor: string,
  margin: string|[string,string,string,string]|[string,string],
  padding: string|[string,string,string,string]|[string,string],
  borderRadius: string|[string,string,string,string]|[string,string], 
  borderColor: string|[string,string,string,string]|[string,string],
  borderWidth: string|[string,string,string,string]|[string,string],
  borderType: string|[string,string,string,string]|[string,string],
  boxShadowOffsetX: string,
  boxShadowOffsetY: string,
  boxShadowBlurRadius: string,
  boxShadowSpreadRadius: string,
  boxShadowInset: boolean,
  boxShadowColor: string,
  outlineColor: string,
  outlineOffset: string,
  outlineStyle: string,
  outlineWidth: string 
}

export type SerializedCustomParagraphNode = SerializedElementNodeWithBlockStyle;
export type SerializedGridCellNode = Spread<
  {
    colSpan?: number;
    rowSpan?: number;
  },
  SerializedElementNode
>;

export type SerializedLineBreakNode = SerializedLexicalNode;

export type SerializedParagraphNode = SerializedElementNodeWithBlockStyle;

export type SerializedTabNode = SerializedTextNode;

export type SerializedTextNode = Spread<
  {
    detail: number;
    format: number;
    mode: TextModeType;
    style: string;
    text: string;
  },
  SerializedLexicalNode
>;


export type SerializedAsideNode = Spread<
  SerializedElementNode,
  {
    side: 'left'|'right'
  }
>;

type SerializedCodeHighlightNode = Spread<
  {
    highlightType: string | null | undefined;
  },
  SerializedTextNode
>;


export type SerializedCodeNode = Spread<
  {
    language: string | null | undefined;
    onlyCodeEditor: boolean
  },
  SerializedElementNode
>;


export type SerializedAudioNode = Spread<
{
  src: string,
  title: string
},
SerializedDecoratorBlockNode
>;

export type ImageType = {short: string, long: string, src: string};

export type SerializedCarouselNode = Spread<{
  imageList: ImageType[],
  height: number
},
SerializedLexicalNode
>;

export type SerializedDecoratorBlockNode = Spread<
  {
    format: ElementFormatType;
  },
  SerializedLexicalNode
>;

export type SerializedHorizontalRuleNode = Spread<
  {
    color: string;
    width: number;
  },
  SerializedDecoratorBlockNode
>;

export type SerializedImageNode = Spread<
  {
    src: string,
    short: string,
    long: string,
    width: number|'auto',
    height: number|'auto'
  },  
  SerializedLexicalNode
>;

export type PositionType = 'left'|'right'|'fullwidth';

export type SerializedInlineImageNode = Spread<
  {
    src: string,
    short: string,
    long: string,
    position:PositionType 
  },  
  SerializedLexicalNode
>;
export type NewsNodeObject = {
  url: string;
  title: string;
  description: string;
  imageURL: string;
  host: string;
};
export type SerializedNewsNode = Spread<
  NewsNodeObject,
  SerializedDecoratorBlockNode
>;
type RedditCommentNodeObject = {
  html: string;
  url: string;
  includeParent: boolean;
};
export type SerializedRedditCommentNode = Spread<
  RedditCommentNodeObject,
  SerializedDecoratorBlockNode
>;
type TikTokNodeObject = {
  html: string;
  url: string;
};
export type SerializedTikTokNode = Spread<
  TikTokNodeObject,
  SerializedDecoratorBlockNode
>;

type TweetNodeObject = {
  html: string;
  url: string;
  hideCards: boolean;
  hideConversation: boolean;
  useDarkMode: boolean;
  align: "left"|"center"|"right";
};

export type SerializedTweetNode = Spread<
  TweetNodeObject,
  SerializedDecoratorBlockNode
>;

type TwitterTimelineNodeObject = {
  html: string;
  url: string;
  limit: number;
  darkMode: boolean;
  componentBorders: string;
  noHeader: boolean;
  noFooter: boolean;
  noBorders: boolean;
  noScrollbar: boolean;
  transparent: boolean;
};

export type SerializedTwitterTimelineNode = Spread<
  TwitterTimelineNodeObject,
  SerializedDecoratorBlockNode
>;


export type SerializedVideoNode = Spread<
{
  src: string,
  title: string,
  description: string,
  height: number|undefined
},
SerializedDecoratorBlockNode
>;

export type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedDecoratorBlockNode
>;

export type SerializedAccordionContentNode = SerializedElementNode;

export type SerializedDetailsNode = Spread<
  SerializedElementNode,
  {
    summary: string,
    flat: boolean
  }
>;

export type SerializedLinkNode = Spread<
  {
    url: string;
  },
  Spread<LinkAttributes, SerializedElementNode>
>;

export type SerializedListItemNode = Spread<
  {
    checked: boolean | undefined;
    value: number;
  },
  SerializedElementNode
>;

export type SerializedListNode = Spread<
  {
    listType: ListType;
    start: number;
    tag: ListNodeTagType;
  },
  SerializedElementNodeWithBlockStyle
>;

export type SerializedMarkNode = Spread<
  {
    ids: Array<string>,
    markClass: MarkNodeClassType
  },
  SerializedElementNode
>;

export type SerializedMathNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;
export type SerializedOverflowNode = SerializedElementNode;

export type SerializedHeadingNode = Spread<
  {
    tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  },
  SerializedElementNodeWithBlockStyle
>;


export type SerializedQuoteNode = SerializedElementNode;


export type SerializedCellParagraphNode = SerializedElementNode;

export type SerializedTableCellNode = Spread<
  {
    headerState: TableCellHeaderState;
    width?: number;
    backgroundColor?: null | string;
  },
  SerializedGridCellNode
>;


export type SerializedTableNode = Spread<
  SerializedElementNode,
{
  caption: string|undefined,
  bandedRows: boolean,
  bandedCols: boolean,
  align: 'center'|'left'|'right';
}>;


export type SerializedTableRowNode = Spread<
  {
    height: number;
  },
  SerializedElementNode
>;
