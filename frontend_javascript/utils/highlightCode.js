const hljs = require('highlight.js');
const stringSimilarity = require('string-similarity-js');
const escape = require('escape-html');
const languagesAvaliable = new Set(["1c","abnf","accesslog","actionscript","ada","angelscript","apache","applescript","arcade","arduino","armasm","xml","asciidoc","aspectj","autohotkey","autoit","avrasm","awk","axapta","bash","basic","bnf","brainfuck","c","cal","capnproto","ceylon","clean","clojure","clojure-repl","cmake","coffeescript","coq","cos","cpp","crmsh","crystal","csharp","csp","css","d","markdown","dart","delphi","diff","django","dns","dockerfile","dos","dsconfig","dts","dust","ebnf","elixir","elm","ruby","erb","erlang-repl","erlang","excel","fix","flix","fortran","fsharp","gams","gauss","gcode","gherkin","glsl","gml","go","golo","gradle","graphql","groovy","haml","handlebars","haskell","haxe","hsp","http","hy","inform7","ini","irpf90","isbl","java","javascript","jboss-cli","json","julia","julia-repl","kotlin","lasso","latex","ldif","leaf","less","lisp","livecodeserver","livescript","llvm","lsl","lua","makefile","mathematica","matlab","maxima","mel","mercury","mipsasm","mizar","perl","mojolicious","monkey","moonscript","n1ql","nestedtext","nginx","nim","nix","node-repl","nsis","objectivec","ocaml","openscad","oxygene","parser3","pf","pgsql","php","php-template","plaintext","pony","powershell","processing","profile","prolog","properties","protobuf","puppet","purebasic","python","python-repl","q","qml","r","reasonml","rib","roboconf","routeros","rsl","ruleslanguage","rust","sas","scala","scheme","scilab","scss","shell","smali","smalltalk","sml","sqf","sql","stan","stata","step21","stylus","subunit","swift","taggerscript","yaml","tap","tcl","thrift","tp","twig","typescript","vala","vbnet","vbscript","vbscript-html","verilog","vhdl","vim","wasm","wren","x86asm","xl","xquery","zephir"]);
const languages = Array.from(languagesAvaliable);
const { somethingSort } = require('./customSort');

function highlightCode(codeStr,inline=true,language=undefined){
    if (language===undefined){
        try {
            const highlighted = hljs.highlightAuto(codeStr);
            if (inline){
                return {html: '<code class="hljs">'.concat(highlighted.value).concat('</code>'), langauge: highlighted.language, relevance: highlighted.relevance};
            } else{
                return {html: '<pre class="hz-scroll"><code class="hljs">'.concat(highlighted.value).concat('</code></pre>'), langauge: highlighted.language, relevance: highlighted.relevance};
            }
        } catch (error) {
            throw Error('Sorry, something wnet wrong on our side.');
        } 
    } else if (typeof language !== 'string') {
        throw Error('Language input must be a string.');
    } else if (!!!languagesAvaliable.has(language)){
        throw Error('Please enter a valid Coding Langauge input.')
    } else {
        try {
            const highlighted = hljs.highlight(codeStr,{language});
            console.log(highlighted);
            if (inline){
                return {html: '<code class="hljs">'.concat(highlighted.value).concat('</code>'), langauge: highlighted.language, relevance: highlighted.relevance};
            } else {
                return {html: '<pre class="hz-scroll"><code class="hljs">'.concat(highlighted.value).concat('</code></pre>'), langauge: highlighted.language, relevance: highlighted.relevance};
            }
        } catch(error){
            throw Error('Sorry, something wnet wrong on our side.');
        }
    }
}

/**
 * 1. You recieve input string searching for an available coding language, you want to return 25 options for the combox.
 * 2. Go through each string in the array, find similarity, then perform insertion sort on the arr with the new element, comparing  their similarity value. Sort most relevant -> least relevant
 * 3. 
 * @param {string} str 
 */
function searchCodingLangauges(str){
    var arr = [];
    for (let i = 0; i < languages.length; i++){
        const similarity = stringSimilarity.stringSimilarity(languages[i],str,1,false);
        if (similarity<0.05) continue;
        arr = somethingSort({ str: `<button data-combobox-option class="select-option body1" role="option" tabindex="-1" aria-selected="false" data-val="${escape(languages[i])}">${languages[i]}</button>`, similarity },arr,(el)=>el.similarity,false);
    }
    if (!!!arr.length) return '<p class="w-100 body1 bold t-warning p-lg block">No Coding Languages Found</p>'
    return arr.slice(0,25).map((obj)=>obj.str).join('');
}

module.exports = {
    languagesAvaliable,
    highlightCode,
    searchCodingLangauges
};