"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codingLanguages = exports.code = exports.HLJS_CODING_LANGUAGES_AVAILABLE = void 0;
const highlight_js_1 = __importDefault(require("highlight.js"));
const string_similarity_js_1 = require("string-similarity-js");
const helper_1 = require("../../utils/helper");
const node_crypto_1 = __importDefault(require("node:crypto"));
const dompurify_1 = require("dompurify");
exports.HLJS_CODING_LANGUAGES_AVAILABLE = new Set(["auto", "1c", "abnf", "accesslog", "actionscript", "ada", "angelscript", "apache", "applescript", "arcade", "arduino", "armasm", "xml", "asciidoc", "aspectj", "autohotkey", "autoit", "avrasm", "awk", "axapta", "bash", "basic", "bnf", "brainfuck", "c", "cal", "capnproto", "ceylon", "clean", "clojure", "clojure-repl", "cmake", "coffeescript", "coq", "cos", "cpp", "crmsh", "crystal", "csharp", "csp", "css", "d", "markdown", "dart", "delphi", "diff", "django", "dns", "dockerfile", "dos", "dsconfig", "dts", "dust", "ebnf", "elixir", "elm", "ruby", "erb", "erlang-repl", "erlang", "excel", "fix", "flix", "fortran", "fsharp", "gams", "gauss", "gcode", "gherkin", "glsl", "gml", "go", "golo", "gradle", "graphql", "groovy", "haml", "handlebars", "haskell", "haxe", "hsp", "http", "hy", "inform7", "ini", "irpf90", "isbl", "java", "javascript", "jboss-cli", "json", "julia", "julia-repl", "kotlin", "lasso", "latex", "ldif", "leaf", "less", "lisp", "livecodeserver", "livescript", "llvm", "lsl", "lua", "makefile", "mathematica", "matlab", "maxima", "mel", "mercury", "mipsasm", "mizar", "perl", "mojolicious", "monkey", "moonscript", "n1ql", "nestedtext", "nginx", "nim", "nix", "node-repl", "nsis", "objectivec", "ocaml", "openscad", "oxygene", "parser3", "pf", "pgsql", "php", "php-template", "plaintext", "pony", "powershell", "processing", "profile", "prolog", "properties", "protobuf", "puppet", "purebasic", "python", "python-repl", "q", "qml", "r", "reasonml", "rib", "roboconf", "routeros", "rsl", "ruleslanguage", "rust", "sas", "scala", "scheme", "scilab", "scss", "shell", "smali", "smalltalk", "sml", "sqf", "sql", "stan", "stata", "step21", "stylus", "subunit", "swift", "taggerscript", "yaml", "tap", "tcl", "thrift", "tp", "twig", "typescript", "vala", "vbnet", "vbscript", "vbscript-html", "verilog", "vhdl", "vim", "wasm", "wren", "x86asm", "xl", "xquery", "zephir"]);
const CODING_LANGUAGES = Array.from(exports.HLJS_CODING_LANGUAGES_AVAILABLE);
function code(req, res) {
    var _a;
    const renderObject = {
        layout: false,
        error: false,
        errorMessage: '',
        emptyInput: false,
        htmlString: '',
        relevance: 0,
        language: '',
        block: true,
        snackbarID: ''
    };
    const view = 'partials/code';
    try {
        const text = req.body['code-markup-dialog-input'] || req.body['code-markup-dialog-input-2'];
        const displayStyle = req.body['code-display-style'];
        var codingLanguage = req.body['coding-language'] || req.body['coding-language-2'];
        renderObject.language = codingLanguage;
        if (codingLanguage === 'html')
            codingLanguage = 'vbscript-html';
        if (typeof text !== 'string')
            throw new Error('custom: Input must be a string.');
        if (!!!text.length) {
            renderObject.emptyInput = true;
            return res.status(200).render(view, renderObject);
        }
        if (displayStyle !== 'block-code-dialog' && displayStyle !== 'inline-code-dialog')
            throw new Error('custom: Please enter a valid Display Style.');
        renderObject.block = Boolean(displayStyle === 'block-code-dialog');
        if (typeof codingLanguage !== 'string' || !!!exports.HLJS_CODING_LANGUAGES_AVAILABLE.has(codingLanguage))
            throw new Error('custom: Please enter a valid coding language.');
        const highlightResult = highlight_js_1.default.highlight(text, { language: codingLanguage });
        renderObject.htmlString = (0, dompurify_1.sanitize)(highlightResult.value);
        renderObject.relevance = highlightResult.relevance;
        renderObject.snackbarID = 'copy_html_code_snackbar'.concat('_').concat(node_crypto_1.default.randomUUID());
        return res.status(200).render(view, renderObject);
    }
    catch (error) {
        console.error(error);
        renderObject.error = true;
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.startsWith('custom: ')) {
            renderObject.errorMessage = error.message.slice(8);
        }
        return res.status(200).render(view, renderObject);
    }
}
exports.code = code;
function codingLanguages(req, res) {
    const view = 'partials/coding-languages';
    const renderObject = {
        layout: false,
        error: false,
        emptyInput: false,
        noLanguagesFound: false,
        inputID: '',
        arr: []
    };
    try {
        const target = req.get('hx-target');
        var text = '';
        if (target === 'coding-language-select-options') {
            text = req.body['coding-language'];
            renderObject.inputID = 'coding-language';
            if (typeof text !== 'string')
                throw new Error('Coding Language Input Must be a String.');
        }
        else if (target === 'coding-language-example-select-options') {
            text = req.body['coding-language-example'];
            renderObject.inputID = 'coding-language-example';
            if (typeof text !== 'string')
                throw new Error('Coding Language Input Must be a String.');
        }
        else {
            text = req.body['coding-language-2'];
            renderObject.inputID = 'coding-language-2';
            if (typeof text !== 'string')
                throw new Error('Coding Language Input Must be a String.');
        }
        if (!!!text.length) {
            renderObject.emptyInput = true;
            return res.status(200).render(view, renderObject);
        }
        else {
            renderObject.emptyInput = false;
            if (text === 'html')
                text = 'vbscript-html';
            var arr = [];
            for (let i = 0; i < CODING_LANGUAGES.length; i++) {
                const similarity = (0, string_similarity_js_1.stringSimilarity)(text, CODING_LANGUAGES[i], 1, false);
                if (similarity < 0.5)
                    continue;
                else {
                    arr = (0, helper_1.somethingSort)({ language: CODING_LANGUAGES[i], similarity }, arr, (obj) => obj.similarity, false);
                }
            }
            renderObject.noLanguagesFound = Boolean(arr.length === 0);
            renderObject.arr = arr.slice(0, 25);
            return res.status(200).render(view, renderObject);
        }
    }
    catch (error) {
        console.error(error);
        renderObject.error = true;
        return res.status(200).render(view, renderObject);
    }
}
exports.codingLanguages = codingLanguages;
