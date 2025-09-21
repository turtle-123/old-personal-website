import { load } from "cheerio";

type ParsedElementCheerioObject = {
  name: string,
  type: "tag",
  attributes: {[s:string]:string},
  children: (ParsedElementCheerioObject|ParsedTextCheerioObject)[]
};
type ParsedTextCheerioObject = {
  type: "text",
  children: [],
  data: string
}
type ParsedScriptCheerioObject = {
  type: "script",
  children: (ParsedElementCheerioObject|ParsedTextCheerioObject)[],
  attributes: {[s:string]:string},
  name: string
};
type ParsedStyleCheerioObject = {
  name: string,
  type: "style",
  attributes: {[s:string]:string},
  children: (ParsedElementCheerioObject|ParsedTextCheerioObject)[],
}

type ParsedCheerioObject = ParsedElementCheerioObject|ParsedTextCheerioObject|ParsedScriptCheerioObject|ParsedStyleCheerioObject;
const VALID_CHEERIO_OBJECT_TYPE = new Set(['tag','text','script','style'] as const);
function getNextVarName(varName:string) {
  if (varName.endsWith('z')) {
    return varName.slice(0,varName.length-1).concat('A');
  } else if (varName.endsWith('Z')) {
    return varName.split('').map((s) => 'a').join('').concat('a');
  } else {
    var s = varName.split('');
    for (let i=0;i<s.length;i++) {
      if (s[i]!=='Z') {
        s[i] = s[i]==='z' ? 'A'  : String.fromCharCode(s[i].charCodeAt(0)+1);
        break;
      }
    }
    return s.join('');
  }
}
function createNodeStr(el:ParsedCheerioObject,str:string,curVarName:string) {
  var newStr = str;
  if (el.type==="tag"||el.type==="script"||el.type==="style"){
    newStr += `const ${curVarName} = document.createElement("`.concat(el.name).concat('");\n');
    Object.keys(el.attributes)
    .forEach((key)=>{
      newStr+= `${curVarName}.setAttribute("${key}",${JSON.stringify(el.attributes[key])});\n`;
    })
    const charsToAppend:string[] = [];
    var latestVarName = curVarName;
    for (let child of el.children) {
      const { str:newString, latestVarName:newLatestVarName } = createNodeStr(child,newStr,getNextVarName(latestVarName));
      latestVarName = newLatestVarName;
      charsToAppend.push(newLatestVarName);
      newStr = newString;
    }
    newStr+=`${curVarName}.append(`.concat(charsToAppend.map((s) => s).join(',')).concat(');\n');
    return { str: newStr, latestVarName };
  } else if (el.type==="text"){
    newStr += `const ${curVarName} = document.createTextNode(\``.concat(el.data.replace(/`/g, '\\`')).concat(`\`);\n`);
    return { str: newStr, latestVarName: curVarName };
  } else throw new Error('Unrecognized object type.');
}
function creatingHTMLFromJSON(arr:ParsedCheerioObject[]) {
  var curVarName = "a";
  var str = '';
  for (let obj of arr) {
    const { str:newString, latestVarName } = createNodeStr(obj,str,curVarName);
    curVarName = getNextVarName(latestVarName);
    str = newString;
  }
  return str;
}
function createNode(obj:ParsedCheerioObject) {
  if(obj.type==="tag"||obj.type==="script"||obj.type==="style") {
    const node = document.createElement(obj.name);
    Object.keys(obj.attributes)
    .forEach((key) => node.setAttribute(key,JSON.stringify(obj.attributes[key])));
    if(obj.children.length) {
      node.append(...obj.children.map((obj) => createNode(obj)));
    }
    return node;
  } else if (obj.type==="text") {
    const textNode = document.createTextNode(obj.data);
    return textNode;
  } else throw new Error('Unrecognized Type');
}
function createNodesFromJSON(arr:ParsedCheerioObject[]) {
  const retArr = [];
  for (let obj of arr) {
    retArr.push(createNode(obj));
  }
  return retArr;
}


function handleFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const s = this.querySelector<HTMLTextAreaElement>('textarea');
  if (s) {
    const htmlString = s.value;
    const $ = load(htmlString);
    const topLevelElements = $('body>*');
    const array:any[] = [];
    const handleCheerioElement = (el:any,obj:any[]) => {
      const {
        name,
        attribs:attributes,
        type,
        data
      } = el;
      if (type!=="tag"&&type!=="text") return;
      const elementObject = {
        name,
        type,
        attributes: structuredClone(attributes),
        children: [],
        data 
      };
      if (!!!VALID_CHEERIO_OBJECT_TYPE.has(elementObject.type)) return;
      obj.push(elementObject);
      $(el).contents().each((i,child)=>{
        handleCheerioElement(child,elementObject.children);
      });
    }
    topLevelElements.each((i,el)=>{
      handleCheerioElement(el,array);
    });
    const jsonStr = document.createTextNode(JSON.stringify(array,null,' '));
    const createWithJavascript = document.createTextNode(creatingHTMLFromJSON(array));
    const output = document.querySelector<HTMLOutputElement>('output[form="html-to-javascript-form"]');
    if (output) {
      const jsonOutput =  output.querySelector<HTMLPreElement>('pre#json-output');
      const javascriptOutput = output.querySelector<HTMLPreElement>('pre#javascript-output');
      const jsonOutputInput =  output.querySelector<HTMLInputElement>('input#json-output-input');
      const javascriptOutputInput = output.querySelector<HTMLInputElement>('input#javascript-output-input');
      if(jsonOutput&&jsonOutputInput) {
        jsonOutputInput.value = String(jsonStr.textContent);
        jsonOutput.innerHTML='';
        jsonOutput.append(jsonStr);
      }
      if (javascriptOutput&&javascriptOutputInput) {
        javascriptOutputInput.value = String(createWithJavascript.textContent);
        javascriptOutput.innerHTML='';
        javascriptOutput.append(createWithJavascript);
      }
    }
  }

}

export default function onLoad() {
  const form = document.getElementById('html-to-javascript-form');
  if(form) form.addEventListener('submit',handleFormSubmit);
}


