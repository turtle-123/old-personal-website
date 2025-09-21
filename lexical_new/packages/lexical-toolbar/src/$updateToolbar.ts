import { 
  type LexicalEditor, 
  $getSelection,
  $isRangeSelection,
  type RangeSelection,
  MAX_INDENT_PARAGRAPH_LEVEL,
  $isParagraphNode,
  LexicalNode,
  type TextFormatType,
  getElementOuterTag,
  $getRoot,
} from 'lexical';
import {
  $getSelectionStyleValueForProperty
} from '@lexical/selection';
import { 
  segmentNodesForToolbarUpdate
} from "@lexical/utils";
import {
  getDefaultFontFamily,
  getDefaultBackground,
  getDefaultTextColor,
  disableAndSelect,
  setColorInput,
  setSelectInput,
  setHeadingNodeButtons,
  setMarkRadioGroupChecked,
  setSelectButtonText,
  setSelectOptionsStyle,
  getEditorButtons,
  disableButton,
  getNoColor
} from '@lexical/shared';
import type { CodeNode } from '@lexical/code';
import type { ListNode } from '@lexical/list';
import { AsideNode } from '@lexical/aside';
import { ALLOWED_FONT_WEIGHTS, ALLOWED_FONT_SIZES, FONT_SIZE_TO_CSS } from '.';
/* ---------------------------------- Copied Functions From Design System Implementation ------------------------------ */


const ALLOWED_FONTS = new Set([
  "Anuphan, sans-serif;",
  "Arial, sans-serif;",
  "Verdana, sans-serif;",
  "Tahoma, sans-serif;",
  "Trebuchet MS, sans-serif;",
  "Times New Roman, serif;",
  "Georgia, serif;",
  "Garamond, serif;",
  "Courier New, monospace;",
  "Brush Script MT, cursive;"
] as const);
/**
 * Regex Expression to test hex colors - includes the hashtag
 */
const VALID_HEX_REGEX = /^#[0-9a-fA-F]{6}$/i;
/**
 * Test whether two objects are equal. Objects should have a depth of 1
 * @param {Object} obj1 
 * @param {Object} obj2 
 */
const objectsEqual = (obj1: any,obj2: any) => {
  try {
    const keys = Object.keys(obj1);
    for (let key of keys) {
      if (typeof obj1[key]==='object'||typeof obj2[key]==='object') throw new Error('Object values should not be objects.');
      else if (obj1[key]!==obj2[key]) return false;
      else continue;
    }
    return Boolean(keys.length===Object.keys(obj2).length);
  } catch (error) {
    console.error(error);
    return false;
  }
}


const isListItemNode = (node: LexicalNode) => Boolean(node.getType()==="listitem");
const isHeadingNode = (node:LexicalNode) => Boolean(node.getType()==="heading");
const isCodeNode =  (node:LexicalNode) => Boolean(node.getType()==="code");
const isMarkNode = (node:LexicalNode) => Boolean(node.getType()==="mark");


type TextFormatObject = {
  'bold': undefined|boolean,
  'italic': undefined|boolean,
  'strikethrough': undefined|boolean,
  'underline': undefined|boolean,
  'superscript': undefined|boolean,
  'subscript': undefined|boolean,
  'code': undefined|boolean,
  'kbd': undefined|boolean,
  'quote': undefined|boolean
}

/*------------------------------------------------------------ Update Toolbar -------------------------------------------------------- */

function disableAndSelect2(button:HTMLButtonElement,disable:boolean,select:boolean){
  if (disable) button.setAttribute('disabled','');
  else button.removeAttribute('disabled');
  if (select) button.setAttribute('aria-selected','true');
  else button.setAttribute('aria-selected','false');
}

/**
 * 
 * @param {LexicalEditor} editor 
 * @returns 
 */
export function $updateToolbar(editor: LexicalEditor) {
  /**
   * @type {any} Could be null | RangeSelection | NodeSelection | GridSelection;
   * See class EditorState and [The Docs](https://lexical.dev/docs/concepts/selection)
   */
  const selection = $getSelection();
  const RANGE_SELECTION = $isRangeSelection(selection);
  if(RANGE_SELECTION){
    const IS_COLLAPSED = (selection as RangeSelection).isCollapsed();
    const SEGMENTED_NODES = segmentNodesForToolbarUpdate(selection);

    /**
     * @type {undefined|null|'left'|'center'|'right'|'justify'}
     * undefined = align has not been set
     * null = all element nodes in the selection do not have the same alignment
     * string = all element nodes in the selection have the same alignment
     */
    var align = undefined;
    var CODING_LANGUAGE:string|undefined = undefined;
    
    /**
     * @typedef {true|false|null} PossibleTextFormatType
     * true = all text nodes in the selection have the format for this key -> un-disable & select
     * false = all text nodes in the selection do not have this format -> un-disable & unselect
     * null = You can not set the format here -> disable
     * 
     * @typedef {'bold'|'italic'|'strikethrough'|'underline'|'superscript'|'subscript'|'code'} TextFormatObjectKey
     * 
     * @type {{[key: TextFormatObjectKey]: PossibleTextFormatType}} TextFormat
     */
    const textFormat:TextFormatObject = {
      'bold': undefined,
      'italic': undefined,
      'strikethrough': undefined,
      'underline': undefined,
      'superscript': undefined,
      'subscript': undefined,
      'code': undefined,
      'kbd': undefined,
      'quote': undefined
    };
    const HAS_PARAGRAPH = SEGMENTED_NODES.types.has('paragraph');
    const HAS_MARK_NODE = SEGMENTED_NODES.types.has('mark');
    const HAS_HEADING_NODE = SEGMENTED_NODES.types.has('heading');
    const HAS_LIST_ITEM_NODE = SEGMENTED_NODES.types.has('listitem');
    const HAS_LIST_NODE = SEGMENTED_NODES.types.has('list');

    const HAS_TEXT_NODE = SEGMENTED_NODES.types.has('text');
    const HAS_LINK_NODE = SEGMENTED_NODES.types.has('link');
    const HAS_MATH = SEGMENTED_NODES.types.has('math');
    const HAS_YOUTUBE_NODE = SEGMENTED_NODES.types.has('youtube');
    const HAS_NEWS_NODE = SEGMENTED_NODES.types.has('news');

    const HAS_QUOTE_NODE = SEGMENTED_NODES.types.has('quote');
    const HAS_CELL_PARAGRAPH =  SEGMENTED_NODES.types.has('cell-paragraph');
    const HAS_CELL = SEGMENTED_NODES.types.has('tablecell');
    const HAS_TABLE_ROW =SEGMENTED_NODES.types.has('tablerow');
    const HAS_TABLE = SEGMENTED_NODES.types.has('table');
    const HAS_TAB_NODE = SEGMENTED_NODES.types.has('tab');
    const HAS_CODE_BLOCK = SEGMENTED_NODES.types.has('code');
    const HAS_CODE_HIGHLIGHT = SEGMENTED_NODES.types.has('code-highlight');
    const HAS_LINEBREAK = SEGMENTED_NODES.types.has('linebreak');
    const HAS_IMAGE = SEGMENTED_NODES.types.has('image');
    const HAS_AUDIO = SEGMENTED_NODES.types.has('audio-node');
    const HAS_VIDEO = SEGMENTED_NODES.types.has('video-node');
    const HAS_HORIZONTAL_RULE = SEGMENTED_NODES.types.has("horizontal-rule");
    const HAS_DETAILS = Boolean(SEGMENTED_NODES.root && SEGMENTED_NODES.root.getType()==='accordion-content');
    const HAS_ASIDE = Boolean(SEGMENTED_NODES.root && SEGMENTED_NODES.root.getType()==='aside');
    const HAS_SECTION_HEADING = Boolean(SEGMENTED_NODES.types.has('section-heading'));
    const HAS_ABBR_NODE = Boolean(SEGMENTED_NODES.types.has('abbreviation'));
    const INSIDE_COLUMN_NODE = Boolean(SEGMENTED_NODES.root&&(SEGMENTED_NODES.root.getType()==="layout-container"||SEGMENTED_NODES.root.getType()==="layout-item"));
    const LINE_BREAK_CODE = Boolean(
      SEGMENTED_NODES.types.size===1 && 
      SEGMENTED_NODES.types.has('linebreak') &&
      SEGMENTED_NODES.blockNodes.size === 1 &&
      Array.from(SEGMENTED_NODES.blockNodes)[0].getType()==="code"
    );
    const HAS_CODE_NODE = Boolean(LINE_BREAK_CODE||HAS_CODE_BLOCK||HAS_CODE_HIGHLIGHT);
    const INSIDE_CODE_NODE = Boolean((
      SEGMENTED_NODES.types.size===2 && HAS_CODE_NODE && SEGMENTED_NODES.blockNodes.size===1
    ) || LINE_BREAK_CODE || (
      SEGMENTED_NODES.types.size===1 && IS_COLLAPSED && HAS_CODE_NODE && SEGMENTED_NODES.blockNodes.size===1
    ) || (
      SEGMENTED_NODES.types.size===3 && HAS_CODE_NODE && HAS_CODE_HIGHLIGHT && HAS_LINEBREAK && SEGMENTED_NODES.blockNodes.size===1
    ) || (
      SEGMENTED_NODES.types.size===4 && HAS_CODE_NODE && HAS_CODE_HIGHLIGHT && HAS_LINEBREAK && HAS_TAB_NODE && SEGMENTED_NODES.blockNodes.size===1
    ));



    const defaultFontFamily = getDefaultFontFamily();
    const defaultBackgroundColor = getDefaultBackground();
    const defaultTextColor = getDefaultTextColor();
    /**
     * 
     * @type {string|''|'undefined'} 
     */
    const fontFamily = $getSelectionStyleValueForProperty(selection,'font-family','undefined');
    var fontWeight = $getSelectionStyleValueForProperty(selection,'font-weight','undefined');
    var fontSize = $getSelectionStyleValueForProperty(selection,'font-size','undefined');
    const lineHeight = $getSelectionStyleValueForProperty(selection,'line-height','undefined');
    const letterSpacing = $getSelectionStyleValueForProperty(selection,'letter-spacing','undefined');
    const backgroundColorTemp = $getSelectionStyleValueForProperty(selection,'background-color','undefined');
    const textColorTemp = $getSelectionStyleValueForProperty(selection,'color','undefined');
    const UNEQUAL_FONT_SIZE = Boolean(fontSize===undefined);
    if (fontSize===undefined) fontSize = '1rem';

    /**
     * @type {string}
     */
    var backgroundColor;
    /**
     * @type {string}
     */
    var textColor;
    if (!!!VALID_HEX_REGEX.test(backgroundColorTemp)) backgroundColor=defaultBackgroundColor;
    else backgroundColor = backgroundColorTemp;
    if (!!!VALID_HEX_REGEX.test(textColorTemp)) textColor=defaultTextColor;
    else textColor = textColorTemp;

    /**
     * Undefined = maxIndent/minIndent has not been set
     * True = all Paragraph Nodes have max or min Indent
     * False = some paragraph nodes do not have max or min indent
     * @type {undefined|true|false}
     * @type {undefined|true|false} 
     */
    var maxIndent = undefined;
    var minIndent = undefined;
    for (let node of SEGMENTED_NODES.elementNodes) {
      if (isListItemNode(node)) {
        if (node.getIndent()===0) {
          minIndent = true;
          maxIndent = false;
        } else if (node.getIndent()===4) {
          minIndent = false;
          maxIndent = true;
        }
      }
      if (minIndent===false&&maxIndent===false) break;
    }
    for (let node of SEGMENTED_NODES.blockNodes) {
      if(align!==null) {
        /**
         * Really shouldn't ever be end and start though
         * @type {'center'|'end'|'justify'|'left'|'right'|'start'|undefined}
         */
        const alignment = node.getFormatType();
        if(align===undefined&&alignment&&alignment!=='start'&&alignment!=='end') align=alignment;
        else if (align===undefined) align=null;
        else if (align!==undefined&&alignment!==align) align=null;
      }
      if(($isParagraphNode(node)||isHeadingNode(node))&&(minIndent!==false||maxIndent!==false)){
        if(node.getIndent()===MAX_INDENT_PARAGRAPH_LEVEL&&maxIndent!==false){
          maxIndent = true;
          minIndent=false;
        }else if (node.getIndent()===0&&minIndent!==false){
          minIndent=true;
          maxIndent=false;
        } else if (node.getIndent()!==0&&node.getIndent()!==MAX_INDENT_PARAGRAPH_LEVEL){
          minIndent=false;
          maxIndent=false;
        }
      }
      if (minIndent===false&&maxIndent===false) break;
    }
    for (let node of SEGMENTED_NODES.textNodes) {
      Object.keys(textFormat).forEach((key)=>{
        const hasFormat = node.hasFormat(key as TextFormatType);
        /* @ts-ignore */
        textFormat[key] = Boolean((textFormat[key]===true||textFormat[key]===undefined) &&hasFormat);
      })
      if (node.hasFormat('superscript')&&node.hasFormat('subscript')) {
        const tag = getElementOuterTag(node,node.getFormat());
        if (tag==='sup') {
          node.toggleFormat('subscript');
          textFormat['subscript']=false;
        } else if (tag==='sub') {
          node.toggleFormat('superscript');
          textFormat['superscript']=false;
        }
      }
    }
    
    const contentEditable = editor.getRootElement();
    if(!!!contentEditable) return;
    const wrapper = contentEditable.closest<HTMLDivElement>('div.lexical-wrapper');

    if(wrapper) {
      /**
       * @type {HTMLButtonElement|null}
       */
      const {
        fontButton,
        headingButton,
        backgroundColorButton,
        backgroundColorInput,
        backgroundColorTransparent,
        textColorButton,
        textColorInput,
        textColorTransparent,
        markButton,
        fontWeightButton,
        blockStyleButton,
        fontSizeButton,
        clearContentButton,
        indentContentButton,
        outdentContentButton,
        leftAlignButton,
        centerAlignButton,
        rightAlignButton,
        justifyAlignButton,
        boldButton,
        italicButton,
        strikethroughButton,
        underlineButton,
        kbdButton,
        inlineQuoteButtonToolbar,
        clearFormattingButton,
        subscriptButton,
        superscriptButton,
        imageButton,
        audioButton,
        videoButton,
        linkButton,
        removeLinkButton,
        embedMediaButton,
        quoteButton,
        listButton,
        orderedListButton,
        unorderedListButton,
        checkListButton,
        asideButton,
        leftAside,
        rightAside,
        detailsButton,
        codeButton,
        codeBlockButton,
        inlineCodeButton,
        mathButton,
        tableButton,
        chartButton,
        horizontalRuleButton,
        downloadLexicalStateButton,
        uploadLexicalStateButton,
        sectionHeadingButton,

        paragraphButton,
        htmlButton,
        gifButton,
        speechToTextButton,
        undoButton,
        redoButton,
        embedNews,
        embedYoutube,
        embedX,
        embedTikTok,
        embedInstagram,
        embedReddit,
        blockQuoteButton,
        inlineQuoteButton,
        viewButton,

        copyContentButton,
        abbreviationButton,
        removeAbbreviationButton,
        columnLayoutButton
      } = getEditorButtons(wrapper);
      /* Hide / Unhide Coding Language Select */
      const code_language_wrapper = wrapper.querySelector<HTMLDivElement>('div[data-lex-code-language-wrapper]');
      
      if (INSIDE_CODE_NODE&&code_language_wrapper) {
        code_language_wrapper.removeAttribute('hidden');
        const input = code_language_wrapper.querySelector<HTMLInputElement>('input[type="text"]');
        const codeNode = Array.from(SEGMENTED_NODES.blockNodes).filter((node)=>isCodeNode(node))[0] as CodeNode|null;
        if (codeNode && input) {
          CODING_LANGUAGE = codeNode.getLanguage() || 'Auto';
          setSelectInput(input,CODING_LANGUAGE,CODING_LANGUAGE);
        }
      } else if (code_language_wrapper) code_language_wrapper.setAttribute('hidden','');

      
      const DISABLE_SECTION_HEADING = !!!Boolean(
        SEGMENTED_NODES.blockNodes.size===1
        &&SEGMENTED_NODES.types.has('heading')
      );
      const DISABLE_FORMATTING = INSIDE_CODE_NODE;
      const editorIsEmpty = $getRoot().isEmpty();
      if(clearContentButton)disableAndSelect(clearContentButton,Boolean(editorIsEmpty),false);
      if(indentContentButton)disableAndSelect(indentContentButton,Boolean(maxIndent===true || INSIDE_CODE_NODE),false);
      if(outdentContentButton)disableAndSelect(outdentContentButton,Boolean(minIndent===true || INSIDE_CODE_NODE),false);
      if(leftAlignButton)disableAndSelect(leftAlignButton,false,Boolean(align==="left"));
      if(centerAlignButton)disableAndSelect(centerAlignButton,false,Boolean(align==="center"));
      if(rightAlignButton)disableAndSelect(rightAlignButton,false,Boolean(align==="right"));
      if(justifyAlignButton)disableAndSelect(justifyAlignButton,false,Boolean(align==="justify"));
      if(boldButton)disableAndSelect(boldButton,DISABLE_FORMATTING,Boolean(textFormat.bold===true));
      if(italicButton)disableAndSelect(italicButton,DISABLE_FORMATTING,Boolean(textFormat.italic===true));
      if(strikethroughButton)disableAndSelect(strikethroughButton,DISABLE_FORMATTING,Boolean(textFormat.strikethrough===true));
      if(underlineButton)disableAndSelect(underlineButton,DISABLE_FORMATTING,Boolean(textFormat.underline===true));
      if (kbdButton)disableAndSelect(kbdButton,DISABLE_FORMATTING,Boolean(textFormat.kbd)===true);
      if (inlineQuoteButtonToolbar)disableAndSelect(inlineQuoteButtonToolbar,DISABLE_FORMATTING,Boolean(textFormat.quote)===true);

      if (clearFormattingButton)disableAndSelect(clearFormattingButton,DISABLE_FORMATTING,false);
      if(subscriptButton)disableAndSelect(subscriptButton,DISABLE_FORMATTING,Boolean(textFormat.subscript===true));
      if(superscriptButton)disableAndSelect(superscriptButton,DISABLE_FORMATTING,Boolean(textFormat.superscript===true));
      
      if (sectionHeadingButton) disableAndSelect(sectionHeadingButton,DISABLE_SECTION_HEADING,HAS_SECTION_HEADING);
      if(imageButton) disableAndSelect(imageButton,INSIDE_CODE_NODE,HAS_IMAGE);
      if(audioButton)disableAndSelect(audioButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,HAS_AUDIO);
      if(videoButton)disableAndSelect(videoButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,HAS_VIDEO);
      if(linkButton)disableAndSelect(linkButton,Boolean(IS_COLLAPSED || HAS_MARK_NODE || INSIDE_CODE_NODE),Boolean(HAS_LINK_NODE));
      if (HAS_LINK_NODE && removeLinkButton) removeLinkButton.removeAttribute('hidden');
      else if (removeLinkButton) removeLinkButton.setAttribute('hidden','');
      if (embedMediaButton) disableAndSelect(embedMediaButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,Boolean(HAS_YOUTUBE_NODE||HAS_NEWS_NODE)); 
      if (HAS_ABBR_NODE && removeAbbreviationButton) removeAbbreviationButton.removeAttribute('hidden');
      else if (removeAbbreviationButton) removeAbbreviationButton.setAttribute('hidden','');
      if(abbreviationButton)disableAndSelect(abbreviationButton,Boolean(IS_COLLAPSED || HAS_MARK_NODE || INSIDE_CODE_NODE),Boolean(HAS_ABBR_NODE));

      if (quoteButton) disableAndSelect(quoteButton,INSIDE_CODE_NODE,HAS_QUOTE_NODE);
      if (listButton) disableAndSelect(listButton,INSIDE_CODE_NODE,HAS_LIST_NODE||HAS_LIST_ITEM_NODE);
      
      if (HAS_LIST_NODE) {
        const listTypes = new Set(Array.from(SEGMENTED_NODES.blockNodes).filter((node) => node.getType()==="list").map((node) => (node as ListNode).__listType));
        if (orderedListButton) disableAndSelect(orderedListButton,false,listTypes.has('number'));
        if (unorderedListButton) disableAndSelect(unorderedListButton,false,listTypes.has('bullet'));
        if (checkListButton) disableAndSelect(checkListButton,false,listTypes.has('check'))
      } else {
        if (orderedListButton) disableAndSelect(orderedListButton,false,false);
        if (unorderedListButton) disableAndSelect(unorderedListButton,false,false);
        if (checkListButton) disableAndSelect(checkListButton,false,false);
      }
      if (asideButton) disableAndSelect(asideButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,HAS_ASIDE);
      if(HAS_ASIDE) {
        const asideTypes = new Set(Array.from(SEGMENTED_NODES.blockNodes).filter((node) => node.getType()==="aside").map((node) => (node as AsideNode).__side));
        if (leftAside)disableAndSelect(leftAside,asideTypes.has('left'),false);
        if (rightAside) disableAndSelect(rightAside,asideTypes.has('right'),false); 
      } else {
        if (leftAside)disableAndSelect(leftAside,false,false);
        if (rightAside) disableAndSelect(rightAside,false,false); 
      }
      if (detailsButton) disableAndSelect(detailsButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,HAS_DETAILS);
      if (codeButton) disableAndSelect(codeButton,false,HAS_CODE_NODE);
      if (inlineCodeButton) disableAndSelect2(inlineCodeButton,HAS_CODE_NODE,Boolean(textFormat.code));
      if (codeBlockButton) disableAndSelect2(codeBlockButton,false,false);
      if (mathButton) disableAndSelect(mathButton,INSIDE_CODE_NODE,HAS_MATH);
      if (tableButton) disableAndSelect(tableButton,INSIDE_CODE_NODE||INSIDE_COLUMN_NODE,Boolean(SEGMENTED_NODES.activeCell));
      if (chartButton) disableAndSelect(chartButton,true,false);
      if (horizontalRuleButton) disableAndSelect(horizontalRuleButton,INSIDE_CODE_NODE,Boolean(HAS_HORIZONTAL_RULE));
      if (uploadLexicalStateButton) disableAndSelect(uploadLexicalStateButton,false,false);
      if (downloadLexicalStateButton) disableAndSelect(downloadLexicalStateButton,false,false);
      if (fontButton) {
        disableAndSelect(fontButton,INSIDE_CODE_NODE,false);
        /**
         * You don't want to use `ALLOWED_FONTS` here because the fontFamily is returned from 
         * `$getSelectionStyleValueForProperty` without quotation marks
         */
        const VALID_FONT_FAMILY = Boolean(fontFamily!==''&&fontFamily!=='undefined');
        setSelectButtonText(fontButton,VALID_FONT_FAMILY?fontFamily:'Font');
        setSelectOptionsStyle(fontButton,VALID_FONT_FAMILY?fontFamily.concat(';'):'Inherit');
      }
      if (fontSizeButton){
        disableAndSelect(fontSizeButton,Boolean(INSIDE_CODE_NODE || HAS_MARK_NODE),false);
        var fontSizeCurrent = undefined;
        for (let key of Array.from(ALLOWED_FONT_SIZES)) {
          /* @ts-ignore */
          const VALID_FONT_SIZE = objectsEqual(FONT_SIZE_TO_CSS[key],{'font-size':fontSize,'letter-spacing': letterSpacing,'line-height': lineHeight});
          if (VALID_FONT_SIZE) {
            fontSizeCurrent = key;
            break;
          }
        }
        const text = fontSizeCurrent!==undefined ? fontSizeCurrent : 'Size';
        setSelectButtonText(fontSizeButton,text);
        setSelectOptionsStyle(fontSizeButton,text!=="Size"?text:"Inherit");
      }
      if(fontWeightButton){
        const VALID_FONT_WEIGHT = ALLOWED_FONT_WEIGHTS.has(fontWeight as any);
        disableAndSelect(fontWeightButton,Boolean(textFormat.bold===true||INSIDE_CODE_NODE),false);
        setSelectButtonText(fontWeightButton,VALID_FONT_WEIGHT?fontWeight:'Weight');
        setSelectOptionsStyle(fontWeightButton,VALID_FONT_WEIGHT?fontWeight:'Inherit');
      }
      if (textColorInput) setColorInput(textColorInput,textColor);
      if (textColorTransparent){
        if (textColorTemp==="undefined")textColorTransparent.checked = true;
        else textColorTransparent.checked = false;
      }
      if (backgroundColorInput) setColorInput(backgroundColorInput,backgroundColor);
      if (backgroundColorTransparent){
        if (backgroundColorTemp==="undefined")backgroundColorTransparent.checked = true;
        else backgroundColorTransparent.checked = false;
      }
      var CHECK_MARK_NODES = true;
      var MARK_NODE_TYPE = undefined;
      var CHECK_HEADING_NODES = true;
      var HEADING_NODE_TYPE = undefined;
      const fieldset = wrapper.querySelector<HTMLFieldSetElement>('fieldset[data-lexical-highlight]');
      const headingButtons = Array.from(wrapper.querySelectorAll<HTMLButtonElement>('button[data-dispatch="CREATE_HEADING_COMMAND"]'));

      if (HAS_MARK_NODE||HAS_HEADING_NODE||HAS_PARAGRAPH) {
        for (let node of SEGMENTED_NODES.elementNodes) {
          if (CHECK_MARK_NODES) {
            if (!!!isMarkNode(node)) {
              MARK_NODE_TYPE = 'none';
              CHECK_MARK_NODES = false;
            } else {
              const NEW_MARK_NODE_TYPE = node.getMarkClass();
              if (MARK_NODE_TYPE!==undefined && NEW_MARK_NODE_TYPE!==MARK_NODE_TYPE) {
                MARK_NODE_TYPE = 'none';
                CHECK_MARK_NODES = false;
              } else if (MARK_NODE_TYPE===undefined) {
                MARK_NODE_TYPE = NEW_MARK_NODE_TYPE;
              }
            }
          }
          if (CHECK_HEADING_NODES) {
            if (!!!isHeadingNode(node)&&!!!$isParagraphNode(node)) {
              HEADING_NODE_TYPE = undefined;
              CHECK_HEADING_NODES = false;
            } else {
              const NEW_HEADING_TYPE = isHeadingNode(node) ? node.getTag() : 'p';
              if (HEADING_NODE_TYPE!==undefined && NEW_HEADING_TYPE!==HEADING_NODE_TYPE){
                HEADING_NODE_TYPE = undefined;
                CHECK_HEADING_NODES = false;
              } else if (HEADING_NODE_TYPE===undefined){
                HEADING_NODE_TYPE = NEW_HEADING_TYPE;
              }
            }
          }
          if (!!!CHECK_MARK_NODES&&!!!CHECK_HEADING_NODES) break;
        }
        if(fieldset)setMarkRadioGroupChecked(fieldset,MARK_NODE_TYPE);
        setHeadingNodeButtons(headingButtons,HEADING_NODE_TYPE);
      } else {
        if(fieldset)setMarkRadioGroupChecked(fieldset,'none');
        setHeadingNodeButtons(headingButtons,undefined);
      }
      /**
       * Don't disable mark if the selection is not collapsed or if the selection is collapsed and the cursor 
       * is inside a mark node
       */
      const DO_NOT_DISABLE_MARK = Boolean(
        (!!!IS_COLLAPSED && !!!INSIDE_CODE_NODE && !!!UNEQUAL_FONT_SIZE) || 
        (IS_COLLAPSED&&HAS_MARK_NODE&&HAS_TEXT_NODE&&SEGMENTED_NODES.types.size===2)
      );
      if (headingButton) disableAndSelect(headingButton,Boolean(HAS_LIST_ITEM_NODE || INSIDE_CODE_NODE),false);
      if (markButton) disableAndSelect(markButton,Boolean(!!!DO_NOT_DISABLE_MARK),false);
      if (textColorButton) disableAndSelect(textColorButton,Boolean(INSIDE_CODE_NODE),false);
      if (backgroundColorButton) disableAndSelect(backgroundColorButton,Boolean(INSIDE_CODE_NODE),false);
      if (blockStyleButton) disableAndSelect(blockStyleButton,!!!Boolean(HAS_PARAGRAPH||HAS_LIST_NODE||HAS_LIST_ITEM_NODE||HAS_HEADING_NODE),false);
      if (paragraphButton) disableAndSelect(paragraphButton,false,false);
      if (htmlButton) disableAndSelect(htmlButton,Boolean(INSIDE_CODE_NODE),false);
      if (gifButton) disableAndSelect(gifButton,Boolean(INSIDE_CODE_NODE),false);
      if (speechToTextButton) disableAndSelect(speechToTextButton,Boolean(INSIDE_CODE_NODE),false);
      if (undoButton) disableAndSelect(undoButton,false,false)
      if (redoButton) disableAndSelect(redoButton,false,false);
      if (embedNews) disableAndSelect(embedNews,Boolean(INSIDE_CODE_NODE),false);
      if (embedYoutube) disableAndSelect(embedYoutube,Boolean(INSIDE_CODE_NODE),false);
      if (embedX) disableAndSelect(embedX,Boolean(INSIDE_CODE_NODE),false);
      if (embedTikTok) disableAndSelect(embedTikTok,Boolean(INSIDE_CODE_NODE),false);
      if (embedInstagram) disableAndSelect(embedInstagram,Boolean(INSIDE_CODE_NODE),false);
      if (embedReddit) disableAndSelect(embedReddit,Boolean(INSIDE_CODE_NODE),false);
      if (blockQuoteButton) disableAndSelect(blockQuoteButton,Boolean(INSIDE_CODE_NODE),false)
      if (inlineQuoteButton) disableAndSelect(inlineQuoteButton,Boolean(INSIDE_CODE_NODE),false)
      if (viewButton) disableAndSelect(viewButton,Boolean(INSIDE_CODE_NODE),false)
      if (columnLayoutButton) disableAndSelect(columnLayoutButton,Boolean(INSIDE_CODE_NODE||HAS_TABLE),false);    
    }
    return {
      text: textFormat, 
      code: { 
        language: CODING_LANGUAGE, 
        insideCode: INSIDE_CODE_NODE  
      }, 
      link: {
        link: HAS_LINK_NODE
      },
      style: {
        background: {
          disable: Boolean(INSIDE_CODE_NODE),
          transparent: backgroundColorTemp==="undefined",
          color: backgroundColor
        },
        text: {
          disable: Boolean(INSIDE_CODE_NODE),
          transparent: textColorTemp==="undefined",
          color: textColor
        } 
      },
      abbr: {
        abbr: HAS_ABBR_NODE
      }
    };
  }
  return undefined;
}

export function $updateFloatingMenu(obj:ReturnType<typeof $updateToolbar>,editor:LexicalEditor){
  if (obj){
    const menu = document.getElementById('text-selection-menu-toolbar-rte');
    if (menu) {
      const bold = menu.querySelector<HTMLButtonElement>('button[data-payload="bold"]');
      const italic = menu.querySelector<HTMLButtonElement>('button[data-payload="italic"]');
      const strikethrough = menu.querySelector<HTMLButtonElement>('button[data-payload="strikethrough"]');
      const underline = menu.querySelector<HTMLButtonElement>('button[data-payload="underline"]');
      const subscript =  menu.querySelector<HTMLButtonElement>('button[data-payload="subscript"]');
      const superscript =  menu.querySelector<HTMLButtonElement>('button[data-payload="superscript"]');
      const link = menu.querySelector<HTMLButtonElement>('button[data-menu-insert-link]');
      const code = menu.querySelector<HTMLButtonElement>('button[data-payload="code"]');
      const kbd = menu.querySelector<HTMLButtonElement>('button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="kbd"]');
      const quote = menu.querySelector<HTMLButtonElement>('button[data-dispatch="FORMAT_TEXT_COMMAND"][data-payload="quote"]');
      const clearFormatting = menu.querySelector<HTMLButtonElement>('button[data-dispatch="CLEAR_TEXT_FORMATTING"]');
      const hasNoFormatting = Boolean(Object.values(obj.text).filter((bool) => Boolean(bool)).length===0);
      const backgroundColorButtton = menu.querySelector<HTMLButtonElement>('#floating-bg-color-button');
      const backgroundColorInput = menu.querySelector<HTMLInputElement>('#floating-bg-color-bg-color');
      const backgroundColorTransparent = menu.querySelector<HTMLInputElement>('#floating-bg-color-transparent');
      const textColorButtton = menu.querySelector<HTMLButtonElement>('#floating-text-color-button');
      const textColorInput = menu.querySelector<HTMLInputElement>('#floating-text-color-color');
      const textColorTransparent = menu.querySelector<HTMLInputElement>('#floating-text-color-transparent');
      const abbr = menu.querySelector<HTMLButtonElement>('button[data-menu-abbr-button]');

      if (bold) disableAndSelect(bold,false,Boolean(obj.text.bold));
      if (italic) disableAndSelect(italic,false,Boolean(obj.text.italic));
      if (strikethrough) disableAndSelect(strikethrough,false,Boolean(obj.text.strikethrough));
      if (underline) disableAndSelect(underline,false,Boolean(obj.text.underline));
      if (link) disableAndSelect(link,false,Boolean(obj.link.link));
      if (subscript) disableAndSelect(subscript,false,Boolean(obj.text.subscript));
      if (superscript) disableAndSelect(superscript,false,Boolean(obj.text.superscript));
      if (code) disableAndSelect(code,false,Boolean(obj.text.code));
      if (kbd) disableAndSelect(kbd,false,Boolean(obj.text.kbd));
      if (quote) disableAndSelect(quote,false,Boolean(obj.text.quote));
      if (clearFormatting) disableAndSelect(clearFormatting,hasNoFormatting,false);
      if (abbr) disableAndSelect(abbr,false,Boolean(obj.abbr.abbr));
      if (backgroundColorButtton) {
        if (!!!getNoColor(editor)) disableAndSelect(backgroundColorButtton,obj.style.background.disable,false)
        else disableAndSelect(backgroundColorButtton,true,false)
      }
      if (backgroundColorInput) {
        if (!!!getNoColor(editor))setColorInput(backgroundColorInput,obj.style.background.color)
        else setColorInput(backgroundColorInput,getDefaultBackground())
      }
      if(backgroundColorTransparent) {
        if (obj.style.background.transparent||getNoColor(editor)) backgroundColorTransparent.checked = true;
        else  backgroundColorTransparent.checked = false;
      }
      if(textColorButtton) {
        if (!!!getNoColor(editor))disableAndSelect(textColorButtton,obj.style.text.disable,false);
        else disableAndSelect(textColorButtton,true,false)
      }
      if(textColorInput) {
        if (!!!getNoColor(editor))setColorInput(textColorInput,obj.style.text.color)
        else setColorInput(textColorInput,getDefaultTextColor()) 
      }
      if(textColorTransparent){
        if (obj.style.text.transparent||getNoColor(editor)) textColorTransparent.checked = true;
        else  textColorTransparent.checked = false;
      } 
    }
  }
}