/* eslint-disable unicorn/prefer-module */
const express = require('express');
const path = require('node:path');
const bodyParser = require('body-parser');
const fs = require('fs');
const stringSimilarity = require('string-similarity-js');
const {highlightCode, searchCodingLangauges} = require('./utils/highlightCode');
const randomIdGenerator = require('./utils/randomIdGenerator');
const escape = require('escape-html');
const { generateMath } = require('./utils/generateMath');
const { somethingSort } = require('./utils/customSort');

const PORT = 3000;
fs.promises.readFile(path.resolve(__dirname,'icons','icons.json'),{encoding:'utf-8'})
.then((str) => {
const iconArray = JSON.parse(str);
const app = express();

app.set('view engine','ejs');

app.use((req,res,next) => {
  console.log(req.url);
  next();
});

app.use('/api/js',express.static(path.resolve(__dirname,'src','js')));
app.use('/api/css',express.static(path.resolve(__dirname,'src','css')));
app.use('/api/fonts',express.static(path.resolve(__dirname,'src','fonts')));

app.use('/background_transparent',express.static(path.resolve(__dirname,'src','assets','background_transparent')));
app.use('/assets',express.static(path.resolve(__dirname,'src','assets','assets')));


/**
 * 
 * @param {string} message 
 * @param {string} size 'small'|'medium'|'large' 
 * @returns 
 */
const getError = (message,size="medium") => String(`<div id="coding-dialog-results" style="padding: 0.5rem;"><div class="alert filled ${size} error icon"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ErrorSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg><p class="alert text-align-left fw-regular">${message}</p><button aria-label="Close Alert" class="icon small close-alert"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></button></div></div>`);

const copyCodeSuccessButton = '<button data-snackbar data-selem="#copy-code-success-dialog" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;"><svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ContentCopy"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg></button>';

app.post('/api/code',bodyParser.urlencoded({extended: true}),(req,res)=>{
  try {
    const code = req.body['coding-dialog-code-input'];
    const returnStyling = req.body['return-styling'];
    const language = req.body['combobox-coding-language-dialog'] || undefined;
    if (typeof code!=='string' || code.length < 1){
      return res.status(200).send(getError('Code input must be at least 1 character long.','medium'));
    } else if (returnStyling!=='block' && returnStyling !== 'inline') {
      return res.status(200).send(getError('Please enter a valid input for "Return Styling".','medium'));
    } else {
      const str = highlightCode(code,Boolean(returnStyling==="inline"),language);
      const snackbarID = randomIdGenerator('code_copy_snackbar_');
      const retStr1 = `<div id="coding-dialog-results" class="block pt-lg pb-lg"><div class="flex-row align-center justify-start p-sm">
      <!-- Copy HTML Button -->
      <button title="Copy HTML Code Element" class="toggle-button large" id="COPY_CODE_BUTTON" data-snackbar data-selem="#${snackbarID}">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="HtmlSharp"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm15 0H12v6h1.5v-4.5h1V14H16v-3.51h1V15h1.5V9zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
      </button>
      <!-- Alert -->
      <div id="${snackbarID}" class="snackbar success" aria-hidden="true" data-snacktime="4000">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
        <p class="p-sm">HTML Elements with highlighted code copied to clipboard!</p>
        <button class="icon medium" type="button" data-close-snackbar="">
          <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
        </button>
      </div>
    </div><!--Split--><${Boolean(returnStyling==="inline")?'span':'div style="position: relative;"'}>`
      return res.status(200).send(
        retStr1
        .concat(str.html)
        .concat(Boolean(returnStyling==='block')?copyCodeSuccessButton:'')
        .concat(`</${Boolean(returnStyling==="inline")?'span':'div'}><!--Split-->`)
      .concat(`
      <div class="block">
        <p class="flex-row justify-begin align-center body2 w-100">
          <span class="bold" style="margin-right: 4px;">Language:</span> ${str.langauge}
        </p>
        <p class="flex-row justify-begin align-center body2 w-100">
          <span class="bold" style="margin-right: 4px;">Relevance:</span> ${str.relevance}
        </p>
      </div>
      `));
    }
  } catch (error){
    console.log(error);
    return res.status(200).send(getError(error.message));
  }
});

app.post('/api/search-coding-languages',bodyParser.urlencoded({extended:true}),(req,res)=>{
  const search = req.body['coding-language-example'];
  if (search){
    try {
      const retStr = searchCodingLangauges(search);
      return res.status(200).send(retStr);
    } catch (error) { 
      return res.status(200).send(getError('Sorry, something went wrong on our side.','small')); 
    }
  } else {
    return res.status(200).send('<div class="w-100"></div>');
  }
})
app.post('/api/math',bodyParser.urlencoded({ extended: true }),(req,res)=>{
  const mathString = req.body["math-dialog-input"]; // TextArea Input
  const returnStyling = req.body['return-styling']; // Radio Inputs
  const retBlock = returnStyling==="block";
  const { leqno, fleqn } = req.body; // Checkboxes
  try {
    const retStr = generateMath(mathString,Boolean(retBlock),Boolean(leqno!==undefined),Boolean(fleqn!==undefined));
    const snackbarID = randomIdGenerator('math_copy_snackbar_');
    const classs = retBlock?'katex-block':'inline-katex';
    const style = retBlock ? "margin: 0.5rem; position: relative;": ' ';
    const copyInputID = randomIdGenerator('random_math_equation_');
    const randomElementID = randomIdGenerator('random_id_math_ret_');
    const style2 = retBlock?'style="position:relative;"':'';
    const el = retBlock?'div':'span';

    const beginStr = `
  <div id="math-dialog-results">
<div class="flex-row align-center justify-start p-sm">
  <button title="Copy HTML Math Element" class="toggle-button large" data-copy-el data-el="#${randomElementID}" data-snackbar data-selem="#${snackbarID}">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="HtmlSharp"><path d="M3.5 9H5v6H3.5v-2.5h-2V15H0V9h1.5v2h2V9zm15 0H12v6h1.5v-4.5h1V14H16v-3.51h1V15h1.5V9zM11 9H6v1.5h1.75V15h1.5v-4.5H11V9zm13 6v-1.5h-2.5V9H20v6h4z"></path></svg>
  </button>
  <div id="${snackbarID}" class="snackbar success" aria-hidden="true" data-snacktime="4000">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
        <p class="p-sm">HTML Elements with <span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mspace linebreak="newline"></mspace><mi>T</mi><mi>e</mi><mi>X</mi><mspace linebreak="newline"></mspace></mrow><annotation encoding="application/x-tex">\\TeX\\</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="mspace"></span><span class="base"><span class="strut" style="height:0.6833em;"></span><span class="mord mathnormal" style="margin-right:0.13889em;">T</span><span class="mord mathnormal">e</span><span class="mord mathnormal" style="margin-right:0.07847em;">X</span></span><span class="mspace"></span></span></span> code copied to clipboard!</p>
        <button class="icon medium" type="button" data-close-snackbar="">
          <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
        </button>
  </div>
</div>`
    return res.status(200).send(beginStr.concat(`
    <div style="${style}" class="${classs} block">
      <${el} id="${randomElementID}" class="${classs}" ${style2}>
    `).concat(retStr.html).concat(retBlock?`
      <button data-snackbar data-selem="#copy-math-success-dialog" data-copy-input data-input="${copyInputID}" class="toggle-button dark small" style="position: absolute; top: 3px; right: 3px; z-index: 2;">
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
          </path>
        </svg>
        <input hidden type="text" name="${copyInputID}" id="${copyInputID}" value="${escape(retStr.input)}" />
      </button>
      </${el}>`:`</${el}>`).concat('</div></div>'));
  } catch (error) {
    return res.status(200).send('<div id="math-dialog-results">'.concat(getError(error.message,'medium')).concat('</div>'));
  }
})

const PATH_TO_HTML = path.resolve(__dirname,'src','html');
const components = new Set([
  "accordions",
  "alerts",
  "boolean-inputs",
  "breadcrumbs",
  "buttons",
  "code",
  "fixed-content",
  "indicators",
  "inputs",
  "links",
  "lists",
  "math",
  "media",
  "other-inputs",
  "popovers",
  "select-inputs",
  "snackbars",
  "surfaces",
  "svgs",
  "tables",
  "tabs",
  "text",
  "text-inputs",
  "time",
  "utilities",
  "general"
]);

app.get('/api/html/table-of-contents/:component',(req,res)=>{
  const { component } = req.params;
  try {
    return res.status(200).sendFile(path.resolve(__dirname,'src','html','table-of-contents',`${component}.html`));
  } catch (error) {
    return res.status(200).send(`<p class="h6 t-error text-align-center">Something went wrong</p>`)
  }
})
app.get('/api/html/breadcrumbs/:component',(req,res)=>{
  const { component } = req.params;
  try {
    return res.status(200).sendFile(path.resolve(__dirname,'src','html','breadcrumbs',`${component}.html`));
  } catch (error) {
    return res.status(200).send(`<p class="h6 t-error text-align-center">Something went wrong</p>`)
  }
})
app.get('/api/html/:component',(req,res)=>{
  const { component } = req.params;
  try {
    return res.status(200).sendFile(path.resolve(__dirname,'src','html',`${component}.html`));
  } catch (error) {
    return res.status(200).send(`<p class="h6 t-error text-align-center">Something went wrong</p>`)
  }
})

app.post('/api/search-icons',bodyParser.urlencoded({extended: true}),(req,res)=> {
  const search = req.body['search-icons-input'];
  console.log(req.body);
  const { Outlined:OutlinedTest, Rounded:RoundedTest, Sharp:SharpTest, TwoTone:TwoToneTest } = req.body;
  const typesIncluded = {
    Outlined: Boolean(OutlinedTest!==undefined),
    Rounded: Boolean(RoundedTest!==undefined),
    Sharp: Boolean(SharpTest!==undefined),
    TwoTone: Boolean(TwoToneTest!==undefined),
  }
  var arr = [];
  for (let i = 0; i < iconArray.length; i++){
    const similarity = stringSimilarity.stringSimilarity(iconArray[i].title,search,1,false);
    if (similarity>0.7){
      arr = somethingSort({...iconArray[i], similarity: similarity + (typesIncluded[iconArray[i].type] ? 0.1 : 0)},arr,(obj)=>obj.similarity,false)
    }
    if (arr.length>=25 && arr[24].similarity>0.1) break;
  }
  const retStr = `
<div id="icon-results">
<div class="snackbar success" aria-hidden="true" data-snacktime="4000" id="copy-icon-snack">
  <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
  <p class="p-sm">
    SVG has been copied to clipboard!
  </p>
  <button class="icon medium" type="button" data-close-snackbar>
    <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
  </button>
</div>
<p class="h6 text-align-left regular block w-100">
  Search Results:
</p>
<div class="flex-row align-center justify-begin wrap gap-1 w-100">`
.concat(arr.length ? arr.map((obj) => String(`
  <button data-snackbar data-selem="#copy-icon-snack" type="button" data-copy-input data-input="${obj.title}-input" aria-label="${obj.title}" class="icon-text medium transparent b-all">
    ${obj.str}
    <span>${obj.title}</span>
  </button>
  <input hidden class="hidden" type="text" readonly value='${obj.str}' name="${obj.title}-input" />
`))
.join('') : `<p class="t-error h6 text-align-center w-100 fw-regular">No results found.</p>`)
.concat(`
</div>
</div>
`);
  return res.status(200).send(retStr);
});

app.get('/api/text-indicator',(req,res) => {
  setTimeout(() => {
    return res.status(200).send('<p class="t-success h6 bold text-align-center">Success Message</p>');
  },4000);
})

// app.get('/',(_,res)=>{
//   return res.sendFile(path.resolve(__dirname,'src','index.html'));
// });

app.listen(PORT, () => {
  console.log(`Server is running at: http://127.0.0.1:${PORT}`);
});

})