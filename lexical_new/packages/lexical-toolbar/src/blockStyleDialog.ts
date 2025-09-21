import { 
  getDefaultBackground,
  getDefaultTextColor,
  setColorInput,
  setSelectInput,
  closeDialog,
  getCurrentEditor,
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED
} from "@lexical/shared";
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import { 
  VALID_HEX_REGEX,
  $getSelection,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type RangeSelection,
  type NodeSelection,
  type GridSelection,
  $isRangeSelection,
  $isParagraphNode,
  LexicalNode,
  $getPreviousSelection,
  $isBlockElementNode
} from "lexical";
import type { ParagraphNode, BlockNodeStyleType } from "lexical";
import type { ListNode } from "@lexical/list";
import type { HeadingNode} from '@lexical/rich-text';
/**
 * The id of the example element 
 */
const BLOCK_STYLE_FORM_EXAMPLE_ID="block-style-form-example";
var SELECTION: {[editorNamespace:string]: RangeSelection|undefined}  = {};

const isListNode = (node: LexicalNode) => Boolean(node.getType()==="list");
const isListItemNode = (node: LexicalNode) => Boolean(node.getType()==="listitem");
const isHeadingNode = (node: LexicalNode) => Boolean(node.getType()==="heading");

const blockStyleInputs = [
  {
      "id": "lex-block-background-color",
      "key": "backgroundColor"
  } as const,
  {
      "id": "lex-block-background-color-transparent",
      "key": "backgroundColorTransparent"
  } as const,
  {
      "id": "lex-block-text-color",
      "key": "textColor"
  } as const,
  {
      "id": "lex-block-text-color-inherit",
      "key": "textColorInherit"
  } as const,
  {
      "id": "lex-block-margin",
      "key": "margin"
  } as const,
  {
      "id": "lex-block-padding",
      "key": "padding"
  } as const,
  {
      "id": "lex-block-margin-top",
      "key": "marginTop"
  } as const,
  {
      "id": "lex-block-padding-top",
      "key": "paddingTop"
  } as const,
  {
      "id": "lex-block-margin-right",
      "key": "marginRight"
  } as const,
  {
      "id": "lex-block-padding-right",
      "key": "paddingRight"
  } as const,
  {
      "id": "lex-block-margin-bottom",
      "key": "marginBottom"
  } as const,
  {
      "id": "lex-block-padding-bottom",
      "key": "paddingBottom"
  } as const,
  {
      "id": "lex-block-margin-left",
      "key": "marginLeft"
  } as const,
  {
      "id": "lex-block-padding-left",
      "key": "paddingLeft"
  } as const,
  {
      "id": "lex-block-border-color",
      "key": "borderColor"
  } as const,
  {
      "id": "lex-block-border-color-transparent",
      "key": "borderColorTransparent"
  } as const,
  {
      "id": "border-style-value",
      "key": "borderStyle"
  } as const,
  {
      "id": "lex-block-border-width",
      "key": "borderWidth"
  } as const,
  {
      "id": "lex-block-border-radius",
      "key": "borderRadius"
  } as const,
  {
      "id": "lex-block-border-top-color",
      "key": "borderTopColor"
  } as const,
  {
      "id": "lex-block-border-top-color-transparent",
      "key": "borderTopColorTransparent"
  } as const,
  {
      "id": "border-top-style-value",
      "key": "borderTopStyle"
  } as const,
  {
      "id": "lex-block-border-top-width",
      "key": "borderTopWidth"
  } as const,
  {
      "id": "lex-block-border-top-radius",
      "key": "borderTopRadius"
  } as const,
  {
      "id": "lex-block-border-right-color",
      "key": "borderRightColor"
  } as const,
  {
      "id": "lex-block-border-right-color-transparent",
      "key": "borderRightColorTransparent"
  } as const,
  {
      "id": "border-right-style-value",
      "key": "borderRightStyle"
  } as const,
  {
      "id": "lex-block-border-right-width",
      "key": "borderRightWidth"
  } as const,
  {
      "id": "lex-block-border-right-radius",
      "key": "borderRightRadius"
  } as const,
  {
      "id": "lex-block-border-bottom-color",
      "key": "borderBottomColor"
  } as const,
  {
      "id": "lex-block-border-bottom-color-transparent",
      "key": "borderBottomColorTransparent"
  } as const,
  {
      "id": "border-bottom-style-value",
      "key": "borderBottomStyle"
  } as const,
  {
      "id": "lex-block-border-bottom-width",
      "key": "borderBottomWidth"
  } as const,
  {
      "id": "lex-block-border-bottom-radius",
      "key": "borderBottomRadius"
  } as const,
  {
      "id": "lex-block-border-left-color",
      "key": "borderLeftColor"
  } as const,
  {
      "id": "lex-block-border-left-color-transparent",
      "key": "borderLeftColorTransparent"
  } as const,
  {
      "id": "border-left-style-value",
      "key": "borderLeftStyle"
  } as const,
  {
      "id": "lex-block-border-left-width",
      "key": "borderLeftWidth"
  } as const,
  {
      "id": "lex-block-border-left-radius",
      "key": "borderLeftRadius"
  } as const,
  {
      "id": "lex-block-box-shadow-color",
      "key": "boxShadowColor"
  } as const,
  {
      "id": "lex-block-box-shadow-color-transparent",
      "key": "boxShadowColorTransparent"
  } as const,
  {
      "id": "lex-block-box-shadow-inset",
      "key": "boxShadowInset"
  } as const,
  {
      "id": "lex-block-box-shadow-offset-x",
      "key": "boxShadowOffsetX"
  } as const,
  {
      "id": "lex-block-box-shadow-offset-y",
      "key": "boxShadowOffsetY"
  } as const,
  {
      "id": "lex-block-box-shadow-blur-radius",
      "key": "boxShadowBlurRadius"
  } as const,
  {
      "id": "lex-block-box-shadow-spread-radius",
      "key": "boxShadowSpreadRadius"
  } as const
];


function getDefaultBlockStyleObject(DEFAULT_TEXT_COLOR:string,DEFAULT_BACKGROUND:string) { 
  return {
  "backgroundColor": DEFAULT_BACKGROUND,
  "backgroundColorTransparent": true,
  "textColor": DEFAULT_TEXT_COLOR,
  "textColorInherit": true,
  "margin": 0,
  "padding": 0,
  "marginTop": 0,
  "paddingTop": 0,
  "marginRight": 0,
  "paddingRight": 0,
  "marginBottom": 6,
  "paddingBottom": 0,
  "marginLeft": 0,
  "paddingLeft": 0,
  "borderColor": DEFAULT_TEXT_COLOR,
  "borderColorTransparent":true,
  "borderStyle": "none",
  "borderWidth": 0,
  "borderRadius": 0,
  "borderTopColor":DEFAULT_TEXT_COLOR,
  "borderTopColorTransparent":true,
  "borderTopStyle": "none",
  "borderTopWidth": 0,
  "borderTopRadius": 0,
  "borderRightColor": DEFAULT_TEXT_COLOR,
  "borderRightColorTransparent":true,
  "borderRightStyle": "none",
  "borderRightWidth": 0,
  "borderRightRadius": 0,
  "borderBottomColor": DEFAULT_TEXT_COLOR,
  "borderBottomColorTransparent":true,
  "borderBottomStyle": "none",
  "borderBottomWidth": 0,
  "borderBottomRadius": 0,
  "borderLeftColor": DEFAULT_TEXT_COLOR,
  "borderLeftColorTransparent":true,
  "borderLeftStyle": "none",
  "borderLeftWidth": 0,
  "borderLeftRadius":0,
  "boxShadowColor": DEFAULT_TEXT_COLOR,
  "boxShadowColorTransparent":true,
  "boxShadowInset": false,
  "boxShadowOffsetX": 0,
  "boxShadowOffsetY": 0,
  "boxShadowBlurRadius": 0,
  "boxShadowSpreadRadius": 0
}
};


const pxStr = (num:any,def:string) => typeof num==="number" ? num.toString().concat('px') : def;
const ALLOWED_BORDER_STYLES = new Set([
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset",
  "none",
  "hidden"
]);
const checkBorderType = (s:string|any) => ALLOWED_BORDER_STYLES.has(s)?s:'none';

/**
 * You're going to need to getFormat and indent for a block node 
 * and set the textAlign and paddingInlineStart properties before 
 */
function getBlockStyleForm() {
  const DEFAULT_TEXT_COLOR = getDefaultTextColor();
  const DEFAULT_BACKGROUND = getDefaultBackground();
  const obj = getDefaultBlockStyleObject(DEFAULT_TEXT_COLOR,DEFAULT_BACKGROUND);
  blockStyleInputs
  .forEach((obj2) => {
    const a = document.getElementById(obj2.id);
    if (a) {
      const type = a.getAttribute('type');
      switch (type) {
        case 'number':
          /* @ts-ignore */
          if (obj[obj2.key]!==undefined) obj[obj2.key] = Number(parseInt(a.value));
          return;
        case 'checkbox':
          /* @ts-ignore */
          if (obj[obj2.key]!==undefined) obj[obj2.key] = Boolean(a.checked);
          return;
        default:
          /* @ts-ignore */
          if (obj[obj2.key]!==undefined) obj[obj2.key] = a.value;
          return;
      }
    }
  });
  var cssStr="";
  const backgroundColor = obj['backgroundColorTransparent'] ? 'transparent' : VALID_HEX_REGEX.test(obj['backgroundColor']) ? obj['backgroundColor'] : 'transparent';
  cssStr+='background-color:'.concat(backgroundColor).concat(';');
  const textColor = obj['textColorInherit'] ? 'inherit' : (VALID_HEX_REGEX.test(obj['textColor']) ? obj['textColor'] : 'inherit');
  cssStr+='color:'.concat(textColor).concat(';');
  const margin = [pxStr(obj['marginTop'],'0px'),pxStr(obj['marginRight'],'0px'),pxStr(obj['marginBottom'],'6px'),pxStr(obj['marginLeft'],'0px')];
  cssStr+='margin:'.concat(margin.join(' ')).concat(';');
  const padding = [pxStr(obj['paddingTop'],'0px'),pxStr(obj['paddingRight'],'0px'),pxStr(obj['paddingBottom'],'0px'),pxStr(obj['paddingLeft'],'0px')];
  cssStr+='padding:'.concat(padding.join(' ')).concat(';');
  const borderRadius = [pxStr(obj['borderTopRadius'],'0px'),pxStr(obj['borderRightRadius'],'0px'),pxStr(obj['borderBottomRadius'],'0px'),pxStr(obj['borderLeftRadius'],'0px')];
  cssStr+='border-radius:'.concat(borderRadius.join(' ')).concat(';');
  const borderTopColor = obj['borderTopColorTransparent'] ? 'transparent' : (VALID_HEX_REGEX.test(obj['borderTopColor']) ? obj['borderTopColor'] : 'transparent');
  const borderRightColor = obj['borderRightColorTransparent'] ? 'transparent' : (VALID_HEX_REGEX.test(obj['borderRightColor']) ? obj['borderRightColor'] : 'transparent');
  const borderBottomColor = obj['borderBottomColorTransparent'] ? 'transparent' : (VALID_HEX_REGEX.test(obj['borderBottomColor']) ? obj['borderBottomColor'] : 'transparent');
  const borderLeftColor = obj['borderLeftColorTransparent'] ? 'transparent' : (VALID_HEX_REGEX.test(obj['borderLeftColor']) ? obj['borderLeftColor'] : 'transparent');
  const borderColor = [borderTopColor,borderRightColor,borderBottomColor,borderLeftColor];
  cssStr+='border-color:'.concat(borderColor.join(' ')).concat(';');
  const borderWidth = [pxStr(obj['borderTopWidth'],'0px'),pxStr(obj['borderRightWidth'],'0px'),pxStr(obj['borderBottomWidth'],'0px'),pxStr(obj['borderLeftWidth'],'0px')];
  cssStr+='border-width: '.concat(borderWidth.join(' ')).concat(';');
  const borderType = [checkBorderType(obj['borderTopStyle']),checkBorderType(obj['borderRightStyle']),checkBorderType(obj['borderBottomStyle']),checkBorderType(obj['borderLeftStyle'])];
  cssStr+='border-style:'.concat(borderType.join(' ')).concat(';');
  const boxShadowOffsetX =pxStr(obj['boxShadowOffsetX'],'0px');
  const boxShadowOffsetY = pxStr(obj['boxShadowOffsetY'],'0px');
  const boxShadowBlurRadius = pxStr(obj['boxShadowBlurRadius'],'0px');
  const boxShadowSpreadRadius = pxStr(obj['boxShadowSpreadRadius'],'0px');
  const boxShadowInset = obj['boxShadowInset'];
  const boxShadowColor = obj['boxShadowColorTransparent'] ? 'transparent' : (VALID_HEX_REGEX.test(obj['boxShadowColor'])?obj['boxShadowColor']:'transparent');
  cssStr+= 'box-shadow:'.concat(boxShadowInset?'inset ':'').concat(boxShadowOffsetX).concat(' ').concat(boxShadowOffsetY).concat(' ').concat(boxShadowBlurRadius).concat(' ').concat(boxShadowSpreadRadius).concat(' ').concat(boxShadowColor).concat(';');
  
  return {
    cssStr,
    obj: {
      backgroundColor,
      textColor,
      margin,
      padding,
      borderRadius,
      borderColor,
      borderWidth,
      borderType,
      boxShadowOffsetX,
      boxShadowOffsetY,
      boxShadowBlurRadius,
      boxShadowSpreadRadius,
      boxShadowInset,
      boxShadowColor
    }
  };
}
/**
 * When an input changes on the block style form dialog, change the example element to show this change to the user
 * @param {Event} e Change Event
 */
function handleBlockStyleFormChange(_: Event) {
  const blockStyleForm = getBlockStyleForm();
  const example = document.getElementById(BLOCK_STYLE_FORM_EXAMPLE_ID);
  if (example) example.style.cssText=blockStyleForm.cssStr;
}
/**
 * Call whenever an input that affects other inputs on the block style form changes
 */
function handleBlockStyleGeneralInputChange(e: Event) {
  if (e.target) {
    const sides = ['top','right','bottom','left'];
    const id = (e.target as HTMLElement).id;
    if (id==='lex-block-border-color') {
      const value = (document.getElementById(id) as HTMLInputElement)?.value;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-border-'.concat(side).concat('-color'));
        if (el) setColorInput(el,value);
      })
    } else if (id==="lex-block-border-color-transparent") {
      const checked = (document.getElementById(id) as HTMLInputElement)?.checked as boolean;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-border-'.concat(side).concat('-color-transparent')) as HTMLInputElement;
        if (el) el.checked = checked;
      })
    } else if (id==="border-style-value") {
      const input = document.getElementById(id) as HTMLInputElement;
      const value = input?.value;
      /* @ts-ignore */
      const text = Array.from(input?.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="option"]')).filter((a)=>a.getAttribute('data-val')===value).map((el)=>el.innerText);
      sides.forEach((side) => {
        const el = document.getElementById('border-'.concat(side).concat('-style-value'));
        if (el) {
          setSelectInput(el,value,text.length?text[0]:value);
        }
      })
    } else if (id==="lex-block-border-width") {
        /* @ts-ignore */
      const value = document.getElementById(id).value;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-border-'.concat(side).concat('-width'));
          /* @ts-ignore */
        if (el) el.value = value;
      })
    } else if (id==="lex-block-border-radius") {
        /* @ts-ignore */
      const value = document.getElementById(id).value;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-border-'.concat(side).concat('-radius'));
          /* @ts-ignore */
        if (el) el.value = value;
      })
    } else if (id==="lex-block-margin") {
        /* @ts-ignore */
      const value = document.getElementById(id).value;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-margin-'.concat(side));
          /* @ts-ignore */
        if (el) el.value = value;
      })
    } else if (id==="lex-block-padding") {
        /* @ts-ignore */
      const value = document.getElementById(id).value;
      sides.forEach((side) => {
        const el = document.getElementById('lex-block-padding-'.concat(side));
          /* @ts-ignore */
        if (el) el.value = value;
      })
    }
  }
}
/**
 * @this {HTMLFormElement} HTML Form element
 * @param {e} Event Form Submit Event
 */
function handleBlockStyleFormSubmit(this:HTMLFormElement,e: Event) {
  e.preventDefault();
  const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
  const blockStyleForm = getBlockStyleForm();
  if (dialog) {
    closeDialog(dialog);
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const firstSelection = $getSelection() || $getPreviousSelection();
        var selection:RangeSelection|NodeSelection|GridSelection|undefined;
        if (!!!firstSelection) selection = SELECTION[editor._config.namespace];
        else selection = firstSelection;
        if($isRangeSelection(selection)){
          const nodes = selection.getNodes();
          const blockNodes:LexicalNode[] = [];
          for (let node of nodes) {
            const tempNode = $findMatchingParent(node,(n)=>Boolean($isParagraphNode(n)||isListNode(n)||isHeadingNode(n)));
            if (tempNode) blockNodes.push(tempNode);
          }
          blockNodes.forEach((node) => {
            if ($isParagraphNode(node)||isListNode(node)||isHeadingNode(node)) {
              if($isParagraphNode(node)||isHeadingNode(node)){
                node.setBlockStyle(blockStyleForm.obj);
              } else if (isListNode(node)) {
                var topLevelList = node;
                var isNested = true;
                while (isNested){
                  const startingElement = topLevelList.getParent();
                  if(!!!startingElement) {
                    isNested = false;
                    continue;
                  }
                  const tempListNode = $findMatchingParent(startingElement,(n)=>isListNode(n));
                  if (tempListNode) topLevelList = tempListNode;
                  else isNested = false;
                }
                topLevelList.setBlockStyle((blockStyleForm.obj as any));
              }
            }
          })
        }
      })
    }
  }
}

function setSelectButton(b:HTMLButtonElement,innerText:string,val:string) {
  const span = b.querySelector('span');
  if (span) span.innerText = innerText;
  const dropdown = b.nextElementSibling;
  if(dropdown&&dropdown.classList.contains('select-menu')) {
    const input = dropdown.querySelector<HTMLInputElement>('input[type="text"]');
    if (input) {
      input.value = val;
      input.dispatchEvent(new Event('change'));
    }
    const selectButtons = Array.from(dropdown.querySelectorAll<HTMLButtonElement>('button.select-option'));
    selectButtons.forEach((b)=>{
      if (b.getAttribute('data-val')===val) b.setAttribute('aria-selected','true');
      else b.setAttribute('aria-selected','false');
    })
  }
}

function handleResetBlockStyleForm(this: HTMLFormElement,e:Event) {
  const borderStyleButtons = ["border-style-select-button"].concat(['top','right','bottom','left'].map((s)=>`border-${s}-style-select-button`)).map((s)=> document.getElementById(s) as HTMLButtonElement|null).filter((b)=>b!==null) as HTMLButtonElement[];
  borderStyleButtons.forEach((b) => setSelectButton(b,"None","none"));
}

const isButton = (el: HTMLElement): el is HTMLButtonElement => Boolean(el.nodeName==="BUTTON");
const isInput = (el: HTMLElement): el is HTMLInputElement => Boolean(el.nodeName==="INPUT");

function randomBorderStyle() {
  const arr = [
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
    "none",
    "hidden"
  ] as const;
  const randVal = arr[Math.floor(Math.random()*arr.length)];
  return { val: randVal, str: randVal[0].toUpperCase().concat(randVal.slice(1)) };
}

function randomizeBlockStyleForm(this: HTMLElement) {
  Array.from(blockStyleInputs)
  .forEach((obj) => {
    const el = document.getElementById(obj.id) as HTMLButtonElement|HTMLInputElement;
    if (el && isInput(el)) {
      const type = el.getAttribute('type') as 'number'|'color'|'checkbox'|'text';
      if (type==='checkbox') {
        el.checked = false;
        el.dispatchEvent(new Event('change'));
      } else if (type==='number') {
        const minStr = el.getAttribute('min');
        const maxStr = el.getAttribute('max');
        if(minStr&&maxStr) {
          const min = parseInt(minStr);
          const max = parseInt(maxStr);
          const newVal = Math.floor(min + Math.random()*(max-min));
          el.value = String(newVal);
          el.dispatchEvent(new Event('change'));
        }
      } else if (type==='text') {
        if (el.hasAttribute('hidden')) {
          const dropdown = el.closest<HTMLDivElement>('div.select-menu');
          if(dropdown) {
            const button = dropdown.previousElementSibling;
            if (button&&isButton(button as HTMLElement)) {
              const border = randomBorderStyle();
              setSelectButton(button as HTMLButtonElement,border.str,border.val);
              el.dispatchEvent(new Event('change'));
            }
          }
        }
      } else if (type==='color') {
        const randomColor = '#'.concat(Math.floor(Math.random()*16777215).toString(16));
        el.value = randomColor;
        el.dispatchEvent(new Event('change'));
      }
    }
  })
}

function $isParagraphListHeadingNode(a:any):a is (ParagraphNode|ListNode|HeadingNode) {
  return Boolean(a?.__type==="paragraph"||a?.__type==="list"||a?.__type==="heading")
}

const DEFAULT_BLOCK_STYLES = {
  textAlign:'left' as "left",
  backgroundColor: 'transparent',
  textColor: 'inherit', //'inherit' or color
  margin: ['6px','0px','6px','0px'] as [string,string,string,string], 
  padding: '0px',
  borderRadius: '0px',
  borderColor: 'transparent',
  borderWidth: '0px',
  borderType: 'none',
  boxShadowOffsetX: '0px',
  boxShadowOffsetY: '0px',
  boxShadowBlurRadius: '0px',
  boxShadowSpreadRadius: '0px',
  boxShadowInset: false,
  boxShadowColor: 'transparent'
};

function resolveArray(arr1:string|[string,string]|[string,string,string,string],arr2:string|[string,string]|[string,string,string,string],defaultArr:string|[string,string]|[string,string,string,string],colorArr:boolean) {
  var arr1ToUse:[string,string,string,string] = ['','','',''];
  var arr2ToUse:[string,string,string,string] = ['','','',''];
  var defaultArrToUse:[string,string,string,string] = ['','','',''];
  const ret:[string,string,string,string]=['','','',''];
  if (typeof arr1==='string')arr1ToUse=[arr1,arr1,arr1,arr1];
  else if(arr1.length===2) arr1ToUse=[arr1[0],arr1[1],arr1[0],arr1[1]];
  else if (arr1.length===4) arr1ToUse=arr1;
  if (typeof arr2==='string')arr2ToUse=[arr2,arr2,arr2,arr2];
  else if (arr2.length===2) arr2ToUse=[arr2[0],arr2[1],arr2[0],arr2[1]];
  else if (arr2.length===4)arr2ToUse=arr2;
  if (typeof defaultArr==='string')defaultArrToUse=[defaultArr,defaultArr,defaultArr,defaultArr];
  else if (defaultArr.length===2) defaultArrToUse=[defaultArr[0],defaultArr[1],defaultArr[0],defaultArr[1]];
  else if (defaultArr.length===4) defaultArrToUse=defaultArr;
  
  if (arr1ToUse[0]!==arr2ToUse[0]) {
    if (colorArr) {
      return defaultArr;
    }
    ret[0] = defaultArrToUse[0];
  } else ret[0] = arr1ToUse[0];
  if (arr1ToUse[1]!==arr2ToUse[1]) {
    if (colorArr) {
      return defaultArr;
    }
    ret[1] = defaultArrToUse[1];
  } else ret[1] = arr1ToUse[1];
  if (arr1ToUse[2]!==arr2ToUse[2]){
    if (colorArr) {
      return defaultArr;
    }
    ret[2] = defaultArrToUse[2];
  } else ret[2] = arr1ToUse[2];
  if (arr1ToUse[3]!==arr2ToUse[3]){
    if (colorArr) {
      return defaultArr;
    }
    ret[3] = defaultArrToUse[3]; 
  } else ret[3] = arr1ToUse[3];
  return ret;
}

function resolveColor(color1:string,color2:string,defaultColor:string) {
  if (color1!==color2) return defaultColor;
  else return color1;
}

function resolveValue(v1:any,v2:any,def:any) {
  if (v1!==v2) return def;
  else return v1;
}

function allArrayElementsEqual(inp:any[]){
  var val = inp[0];
  for (let el of inp) {
    if (el!==val) return false;
  }
  return true;
}

/**
 * Set the values of the edit style of block nodes fialog form. 
 * 
 * @param editor 
 */
function getSetBlockStyleFormInputs(editor:LexicalEditor) {  
  editor.update(() => {
    const selection = $getSelection();
    if (selection&&$isRangeSelection(selection)) {
      const nodes = selection.getNodes();
      const keys = new Set<string>();
      const blockStylesToUse:BlockNodeStyleType[] = [];
      for (let node of nodes) {
        if (!!!keys.has(node.__key)) {
          keys.add(node.__key);
          if ($isBlockElementNode(node)) {
            if ($isParagraphListHeadingNode(node)){
              const blockStyles = node.getBlockStyle();
              blockStylesToUse.push(structuredClone(blockStyles));
            }
          } else {
            const blockNode = $findMatchingParent(node,(n)=>$isBlockElementNode(n));
            if (blockNode) {
              keys.add(blockNode.__key);
              if ($isParagraphListHeadingNode(blockNode)) {
                const blockStyles = blockNode.getBlockStyle();
                blockStylesToUse.push(structuredClone(blockStyles));
              }
            }
          }
        }
      }
      const currentStyles:BlockNodeStyleType = DEFAULT_BLOCK_STYLES;
      const blockStyleKeys = Object.keys(DEFAULT_BLOCK_STYLES) as (keyof typeof DEFAULT_BLOCK_STYLES)[];
      for (let j =0; j < blockStylesToUse.length;j++) {
        for (let i=0;i<blockStyleKeys.length;i++) {
          switch (blockStyleKeys[i]) {
            case 'backgroundColor': {
              if (j===0)currentStyles['backgroundColor'] = resolveColor(blockStylesToUse[j]['backgroundColor'],blockStylesToUse[j]['backgroundColor'],DEFAULT_BLOCK_STYLES.backgroundColor);
              else currentStyles['backgroundColor'] = resolveColor(blockStylesToUse[j]['backgroundColor'],currentStyles['backgroundColor'],DEFAULT_BLOCK_STYLES.backgroundColor);
              break;
            }
            case 'borderColor': {
              if (j===0)currentStyles['borderColor'] = resolveArray(blockStylesToUse[j]['borderColor'],blockStylesToUse[j]['borderColor'],DEFAULT_BLOCK_STYLES.borderColor,true);
              else currentStyles['borderColor'] = resolveArray(blockStylesToUse[j]['borderColor'],currentStyles['borderColor'],DEFAULT_BLOCK_STYLES.borderColor,true);
              break;
            }
            case 'borderRadius': {
              if (j===0)currentStyles['borderRadius'] = resolveArray(blockStylesToUse[j]['borderRadius'],blockStylesToUse[j]['borderRadius'],DEFAULT_BLOCK_STYLES.borderRadius,false);
              else currentStyles['borderRadius'] = resolveArray(blockStylesToUse[j]['borderRadius'],currentStyles['borderRadius'],DEFAULT_BLOCK_STYLES.borderRadius,false);
              break;
            }
            case 'borderType': {
              if (j===0)currentStyles['borderType'] = resolveArray(blockStylesToUse[j]['borderType'],blockStylesToUse[j]['borderType'],DEFAULT_BLOCK_STYLES.borderType,false);
              else currentStyles['borderType'] = resolveArray(blockStylesToUse[j]['borderType'],currentStyles['borderType'],DEFAULT_BLOCK_STYLES.borderType,false);
              break;
            }
            case 'borderWidth': {
              if (j===0)currentStyles['borderWidth'] = resolveArray(blockStylesToUse[j]['borderWidth'],blockStylesToUse[j]['borderWidth'],DEFAULT_BLOCK_STYLES.borderWidth,false);
              else currentStyles['borderWidth'] = resolveArray(blockStylesToUse[j]['borderWidth'],currentStyles['borderWidth'],DEFAULT_BLOCK_STYLES.borderWidth,false);
              break;
            }
            case 'boxShadowBlurRadius': {
              if (j===0)currentStyles['boxShadowBlurRadius'] = resolveValue(blockStylesToUse[j]['boxShadowBlurRadius'],blockStylesToUse[j]['boxShadowBlurRadius'],DEFAULT_BLOCK_STYLES.boxShadowBlurRadius);
              else currentStyles['boxShadowBlurRadius'] = resolveValue(blockStylesToUse[j]['boxShadowBlurRadius'],currentStyles['boxShadowBlurRadius'],DEFAULT_BLOCK_STYLES.boxShadowBlurRadius);
              break;
            }
            case 'boxShadowColor': {
              if (j===0)currentStyles['boxShadowColor'] = resolveColor(blockStylesToUse[j]['boxShadowColor'],blockStylesToUse[j]['boxShadowColor'],DEFAULT_BLOCK_STYLES.boxShadowColor);
              else currentStyles['boxShadowColor'] = resolveColor(blockStylesToUse[j]['boxShadowColor'],currentStyles['boxShadowColor'],DEFAULT_BLOCK_STYLES.boxShadowColor);
              break;
            }
            case 'boxShadowInset': {
              if (j===0)currentStyles['boxShadowInset'] = resolveValue(blockStylesToUse[j]['boxShadowInset'],blockStylesToUse[j]['boxShadowInset'],DEFAULT_BLOCK_STYLES.boxShadowInset);
              else currentStyles['boxShadowInset'] = resolveValue(blockStylesToUse[j]['boxShadowInset'],currentStyles['boxShadowInset'],DEFAULT_BLOCK_STYLES.boxShadowInset);
              break;
            }
            case 'boxShadowOffsetX': {
              if (j===0)currentStyles['boxShadowOffsetX'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetX'],blockStylesToUse[j]['boxShadowOffsetX'],DEFAULT_BLOCK_STYLES.boxShadowOffsetX);
              else currentStyles['boxShadowOffsetX'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetX'],currentStyles['boxShadowOffsetX'],DEFAULT_BLOCK_STYLES.boxShadowOffsetX);
              break;
            }
            case 'boxShadowOffsetY': {
              if (j===0)currentStyles['boxShadowOffsetY'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetY'],blockStylesToUse[j]['boxShadowOffsetY'],DEFAULT_BLOCK_STYLES.boxShadowOffsetY);
              else currentStyles['boxShadowOffsetY'] = resolveValue(blockStylesToUse[j]['boxShadowOffsetY'],currentStyles['boxShadowOffsetY'],DEFAULT_BLOCK_STYLES.boxShadowOffsetY);
              break;
            }
            case 'boxShadowSpreadRadius': {
              if (j===0)currentStyles['boxShadowSpreadRadius'] = resolveValue(blockStylesToUse[j]['boxShadowSpreadRadius'],blockStylesToUse[j]['boxShadowSpreadRadius'],DEFAULT_BLOCK_STYLES.boxShadowSpreadRadius);
              else currentStyles['boxShadowSpreadRadius'] = resolveValue(blockStylesToUse[j]['boxShadowSpreadRadius'],currentStyles['boxShadowSpreadRadius'],DEFAULT_BLOCK_STYLES.boxShadowSpreadRadius);
              break;
            }
            case 'margin': {
              if (j===0)currentStyles['margin'] = resolveArray(blockStylesToUse[j]['margin'],blockStylesToUse[j]['margin'],DEFAULT_BLOCK_STYLES.margin,false);
              else currentStyles['margin'] = resolveArray(blockStylesToUse[j]['margin'],currentStyles['margin'],DEFAULT_BLOCK_STYLES.margin,false);
              break;
            }
            case 'padding': {
              if (j===0) currentStyles['padding'] = resolveArray(blockStylesToUse[j]['padding'],blockStylesToUse[j]['padding'],DEFAULT_BLOCK_STYLES.padding,false);
              else currentStyles['padding'] = resolveArray(blockStylesToUse[j]['padding'],currentStyles['padding'],DEFAULT_BLOCK_STYLES.padding,false);
              break;
            }
            case 'textAlign': {
              if (j===0) currentStyles['textAlign'] = resolveValue(blockStylesToUse[j]['textAlign'],blockStylesToUse[j]['textAlign'],DEFAULT_BLOCK_STYLES.textAlign);
              else currentStyles['textAlign'] = resolveValue(currentStyles['textAlign'],blockStylesToUse[j]['textAlign'],DEFAULT_BLOCK_STYLES.textAlign);
              break;
            }
            case 'textColor': {
              if (j===0)currentStyles['textColor'] = resolveColor(blockStylesToUse[j]['textColor'],blockStylesToUse[j]['textColor'],DEFAULT_BLOCK_STYLES.textColor);
              else currentStyles['textColor'] = resolveColor(blockStylesToUse[j]['textColor'],currentStyles['textColor'],DEFAULT_BLOCK_STYLES.textColor);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
      blockStyleInputs.forEach((obj)=>{
        if (obj.id==='lex-block-background-color'){
          const el = document.getElementById('lex-block-background-color') as HTMLInputElement|null;
          if(el){
            el.value = currentStyles['backgroundColor']==="transparent" ? getDefaultBackground() : currentStyles['backgroundColor'];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-background-color-transparent'){
          const el = document.getElementById('lex-block-background-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = currentStyles['backgroundColor']==="transparent" 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-text-color'){
          const el = document.getElementById('lex-block-text-color') as HTMLInputElement|null;
          if(el){
            el.value = currentStyles['textColor']==="inherit" ? getDefaultTextColor() : currentStyles['textColor'];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-text-color-inherit'){
          const el = document.getElementById('lex-block-text-color-inherit') as HTMLInputElement|null;
          if(el){
            el.checked = currentStyles['textColor']==="inherit"
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-margin'){
          const el = document.getElementById('lex-block-margin') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['margin']==='string')  el.value = parseInt(currentStyles['margin']).toString();
            else if (allArrayElementsEqual(currentStyles['margin'])) el.value = parseInt(currentStyles['margin'][0]).toString();
            else el.value = parseInt('0').toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-padding'){
          const el = document.getElementById('lex-block-padding') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['padding']==='string')  el.value = parseInt(currentStyles['padding']).toString();
            else if (allArrayElementsEqual(currentStyles['padding'])) el.value = parseInt(currentStyles['padding'][0]).toString();
            else el.value = parseInt('0').toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-margin-top'){
          const el = document.getElementById('lex-block-margin-top') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['margin'][0]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-padding-top'){
          const el = document.getElementById('lex-block-padding-top') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['padding'][0]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-margin-right'){
          const el = document.getElementById('lex-block-margin-right') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['margin'][1]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-padding-right'){
          const el = document.getElementById('lex-block-padding-right') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['padding'][1]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-margin-bottom'){
          const el = document.getElementById('lex-block-margin-bottom') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['margin'][2] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-padding-bottom'){
          const el = document.getElementById('lex-block-padding-bottom') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['padding'][2] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-margin-left'){
          const el = document.getElementById('lex-block-margin-left') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['margin'][3] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-padding-left'){
          const el = document.getElementById('lex-block-padding-left') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['padding'][3] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-color'){
          const el = document.getElementById('lex-block-border-color') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['borderColor']==='string') el.value = currentStyles['borderColor'];
            else if (allArrayElementsEqual(currentStyles['borderColor'])) el.value = currentStyles['borderColor'][0];
            else el.value = getDefaultTextColor();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-color-transparent'){
          const el = document.getElementById('lex-block-border-color-transparent') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['borderColor'] === 'string') el.checked =  Boolean(currentStyles['borderColor']==='transparent');
            else if (currentStyles['borderColor'][0]==='transparent'&&allArrayElementsEqual(currentStyles['borderColor'])) el.checked = true;
            else el.checked = false;
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='border-style-value'){
          const el = document.getElementById('border-style-value') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['borderType']==='string')  setSelectInput(el,currentStyles['borderType'],currentStyles['borderType']);
            else if (allArrayElementsEqual(currentStyles['borderType'])) setSelectInput(el,currentStyles['borderType'][0],currentStyles['borderType'][0]);
            else setSelectInput(el,'none','None');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-width'){
          const el = document.getElementById('lex-block-border-width') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['borderWidth']==='string')  el.value = parseInt(currentStyles['borderWidth']).toString();
            else if (allArrayElementsEqual(currentStyles['borderWidth'])) el.value = parseInt(currentStyles['borderWidth'][0]).toString();
            else el.value = parseInt('0').toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-radius'){
          const el = document.getElementById('lex-block-border-radius') as HTMLInputElement|null;
          if(el){
            if (typeof currentStyles['borderRadius']==='string')  el.value = parseInt(currentStyles['borderRadius']).toString();
            else if (allArrayElementsEqual(currentStyles['borderRadius'])) el.value = parseInt(currentStyles['borderRadius'][0]).toString();
            else el.value = parseInt('0').toString();
            el.dispatchEvent(new Event('change'));
          }
        }
        // Border Top
        else if (obj.id==='lex-block-border-top-color'){
          const el = document.getElementById('lex-block-border-top-color') as HTMLInputElement|null;
          if(el){
            el.value = Boolean(currentStyles['borderColor'][0]==='transparent')?getDefaultTextColor():currentStyles['borderColor'][0];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-top-color-transparent'){
          const el = document.getElementById('lex-block-border-top-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = Boolean(currentStyles['borderColor'][0]==='transparent');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='border-top-style-value'){
          const el = document.getElementById('border-top-style-value') as HTMLInputElement|null;
          if(el){
            if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===4) {
              setSelectInput(el,currentStyles['borderType'][0],currentStyles['borderType'][0]);
            } else if (typeof currentStyles['borderType']==="string") {
              setSelectInput(el,currentStyles['borderType'],currentStyles['borderType']);
            } else {
              setSelectInput(el,'none','None');
            }
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-top-width'){
          const el = document.getElementById('lex-block-border-top-width') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderWidth'][0]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-top-radius'){
          const el = document.getElementById('lex-block-border-top-radius') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderRadius'][0]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }
        // Border Right
        else if (obj.id==='lex-block-border-right-color'){
          const el = document.getElementById('lex-block-border-right-color') as HTMLInputElement|null;
          if(el){
            el.value = Boolean(currentStyles['borderColor'][1]==='transparent')?getDefaultTextColor():currentStyles['borderColor'][1];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-right-color-transparent'){
          const el = document.getElementById('lex-block-border-right-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = Boolean(currentStyles['borderColor'][1]==='transparent');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='border-right-style-value'){
          const el = document.getElementById('border-right-style-value') as HTMLInputElement|null;
          if(el){
            if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===4) {
              setSelectInput(el,currentStyles['borderType'][1],currentStyles['borderType'][1]);
            } else if (typeof currentStyles['borderType']==="string") {
              setSelectInput(el,currentStyles['borderType'],currentStyles['borderType']);
            } else {
              setSelectInput(el,'none','None');
            }
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-right-width'){
          const el = document.getElementById('lex-block-border-right-width') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderWidth'][1]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-right-radius'){
          const el = document.getElementById('lex-block-border-right-radius') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderRadius'][1]).toString();
            el.dispatchEvent(new Event('change'));
          }
        }
        // Border Bottom
        else if (obj.id==='lex-block-border-bottom-color'){
          const el = document.getElementById('lex-block-border-bottom-color') as HTMLInputElement|null;
          if(el){
            el.value = Boolean(currentStyles['borderColor'][2]==='transparent')?getDefaultTextColor():currentStyles['borderColor'][2] as string; 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-bottom-color-transparent'){
          const el = document.getElementById('lex-block-border-bottom-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = Boolean(currentStyles['borderColor'][2]==='transparent');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='border-bottom-style-value'){
          const el = document.getElementById('border-bottom-style-value') as HTMLInputElement|null;
          if(el){
            if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===4) {
              setSelectInput(el,currentStyles['borderType'][2],currentStyles['borderType'][2]);
            } else if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===2) {
              setSelectInput(el,currentStyles['borderType'][0],currentStyles['borderType'][0]);
            } else if (typeof currentStyles['borderType']==="string") {
              setSelectInput(el,currentStyles['borderType'],currentStyles['borderType']);
            } else {
              setSelectInput(el,'none','None');
            }
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-bottom-width'){
          const el = document.getElementById('lex-block-border-bottom-width') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderWidth'][2] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-bottom-radius'){
          const el = document.getElementById('lex-block-border-bottom-radius') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderRadius'][2] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }
        // Border Left
        else if (obj.id==='lex-block-border-left-color'){
          const el = document.getElementById('lex-block-border-left-color') as HTMLInputElement|null;
          if(el){
            el.value = Boolean(currentStyles['borderColor'][3]==='transparent')?getDefaultTextColor():currentStyles['borderColor'][3] as string; 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-left-color-transparent'){
          const el = document.getElementById('lex-block-border-left-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = Boolean(currentStyles['borderColor'][3]==='transparent');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='border-left-style-value'){
          const el = document.getElementById('border-left-style-value') as HTMLInputElement|null;
          if(el){
            if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===4) {
              setSelectInput(el,currentStyles['borderType'][3],currentStyles['borderType'][3]);
            } else if (Array.isArray(currentStyles['borderType'])&&currentStyles['borderType'].length===2) {
              setSelectInput(el,currentStyles['borderType'][1],currentStyles['borderType'][1]);
            } else if (typeof currentStyles['borderType']==="string") {
              setSelectInput(el,currentStyles['borderType'],currentStyles['borderType']);
            } else {
              setSelectInput(el,'none','None');
            }
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-left-width'){
          const el = document.getElementById('lex-block-border-left-width') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderWidth'][3] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-border-left-radius'){
          const el = document.getElementById('lex-block-border-left-radius') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['borderRadius'][3] as string).toString();
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-color'){
          const el = document.getElementById('lex-block-box-shadow-color') as HTMLInputElement|null;
          if(el){
            el.value = currentStyles['boxShadowColor']==='transparent'?getDefaultBackground():currentStyles['boxShadowColor'];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-color-transparent'){
          const el = document.getElementById('lex-block-box-shadow-color-transparent') as HTMLInputElement|null;
          if(el){
            el.checked = Boolean(currentStyles['boxShadowColor']==='transparent');
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-inset'){
          const el = document.getElementById('lex-block-box-shadow-inset') as HTMLInputElement|null;
          if(el){
            el.checked = currentStyles['boxShadowInset'];
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-offset-x'){
          const el = document.getElementById('lex-block-box-shadow-offset-x') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['boxShadowOffsetX']).toString(); 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-offset-y'){
          const el = document.getElementById('lex-block-box-shadow-offset-y') as HTMLInputElement|null;
          if(el){
            el.value =  parseInt(currentStyles['boxShadowOffsetY']).toString(); 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-blur-radius'){
          const el = document.getElementById('lex-block-box-shadow-blur-radius') as HTMLInputElement|null;
          if(el){
            el.value =  parseInt(currentStyles['boxShadowBlurRadius']).toString(); 
            el.dispatchEvent(new Event('change'));
          }
        }else if (obj.id==='lex-block-box-shadow-spread-radius'){
          const el = document.getElementById('lex-block-box-shadow-spread-radius') as HTMLInputElement|null;
          if(el){
            el.value = parseInt(currentStyles['boxShadowSpreadRadius']).toString(); 
            el.dispatchEvent(new Event('change'));
          }
        }
      })
    }
  })
}

function getOnOpenBlockStyleDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="lexical-block-edit-dialog") {
    const editor = getCurrentEditor();
    const dialog = document.getElementById('lexical-block-edit-dialog');
    if (dialog&&editor) {
      // Dialog Forms
      const ids = [
        'lex-block-border-color',
        "lex-block-border-color-transparent",
        "border-style-value",
        "lex-block-border-width",
        "lex-block-border-radius",
        "lex-block-margin",
        "lex-block-padding"
      ];
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('input',handleBlockStyleGeneralInputChange);
          el.addEventListener('change',handleBlockStyleGeneralInputChange);
        }
      });
      const blockStyleForm = document.querySelector<HTMLFormElement>('form[id="lexical-block-style-form"]');
      if (blockStyleForm) {
        blockStyleForm.addEventListener('submit',handleBlockStyleFormSubmit);
        blockStyleForm.addEventListener('change',handleBlockStyleFormChange);
        blockStyleForm.addEventListener('input',handleBlockStyleFormChange);
        blockStyleForm.addEventListener('reset',handleResetBlockStyleForm);
      }
      const randomizeBlockStyleFormBtn = document.getElementById('randomize-block-style-btn') as HTMLButtonElement|null;
      if(randomizeBlockStyleFormBtn){
        randomizeBlockStyleFormBtn.addEventListener('click',randomizeBlockStyleForm)
      }
      getSetBlockStyleFormInputs(editor);
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
  }
}


export function registerBlockStyleCustomization(editor:LexicalEditor) {
  
  document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenBlockStyleDialog)
  return mergeRegister(
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) SELECTION[editor._config.namespace] = selection;
        else SELECTION[editor._config.namespace] = undefined;
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    ),
    function () {
      if (SELECTION[editor._config.namespace]) delete SELECTION[editor._config.namespace];
    }
  )
}