import {
  EditorView, 
  keymap, 
  highlightSpecialChars, 
  drawSelection, 
  highlightActiveLine, 
  dropCursor,
  rectangularSelection, 
  crosshairCursor,
  lineNumbers, 
  highlightActiveLineGutter,
  KeyBinding,
  ViewUpdate, 
} from "@codemirror/view"
import { 
  Compartment, 
  EditorState,
  Extension
} from "@codemirror/state"
import { 
  syntaxHighlighting, 
  indentOnInput, 
  bracketMatching,
  foldGutter, 
  foldKeymap, 
  defaultHighlightStyle,
  LanguageSupport
} from "@codemirror/language"
import {
  defaultKeymap, 
  history, 
  historyKeymap,
  indentWithTab
} from "@codemirror/commands"
import {
  autocompletion, 
  completionKeymap, 
  closeBrackets, 
  closeBracketsKeymap
} from "@codemirror/autocomplete"
import {
  lintKeymap
} from "@codemirror/lint";
import { 
  expandAbbreviation,
  abbreviationTracker,
  emmetConfig,
  toggleComment,
  evaluateMath,
  goToNextEditPoint,
  goToPreviousEditPoint,
  goToTagPair,
  removeTag,
  splitJoinTag,
  selectNextItem,
  selectPreviousItem,
  incrementNumber01,
  incrementNumber1,
  incrementNumber10,
  decrementNumber01,
  decrementNumber1,
  decrementNumber10
} from '@emmetio/codemirror6-plugin'; // p[tabindex="1"] => <p tabindex="1"></p>
import { validateUgcCode } from '../personal-website-shared'
import { DocOrEl } from ".."


const VALID_LANGUAGES = new Set([
  "cpp", // lang-cpp
  "css", // lang-css
  "html", // lang-html
  "java", // lang-java
  "javascript", // lang-javascript
  "markdown", // lang-markdown
  "python",// lang-python
  "sql",// lang-sql
  "typescript",// lang-javascript
] as const);
const VALID_THEMES = new Set([
  'abcdef',
  'abyss',
  'androidstudio',
  'andromeda',
  'atomone',
  'aura',
  'bbedit',
  'basic light', // import light and basic dark from `basic`
  'basic dark', // import light and basic dark from `basic`
  'bespin',
  'copilot',
  'dracula',
  'darcula',
  'duotone light', // import duotone light and duotone dark from 'duotone'
  'duotone dark', // import duotone light and duotone dark from 'duotone'
  'eclipse',
  'github light', // import github light and github dark from 'github'
  'github dark', // import github light and github dark from 'github'
  'gruvbox dark', // import gruvbox dark and gruvbox light from gruvbox-dark
  'gruvbox light',
  'material light',
  'material dark', // material 
  'monokai',
  'monokai dimmed', //monoky-dimmed
  'kimbie',
  'noctis-lilac',
  'nord',
  'okaidia',
  'quietlight',
  'red',
  'solarized light', // solarized light && solarized dark from 'solarized'
  'solarized dark',
  'sublime',
  'tokyo-night',
  'tokyo-night-storm', //--
  'tokyo-night-day',
  'tomorrow-night-blue',
  'white dark', // both from 'white'
  'white light', // both from 'white'
  'vscode',
  'xcode light', // xcode
  'xcode dark' // xcode
] as const);
type SUPPORTED_THEMES = "abcdef"|"abyss"|"androidstudio"|"andromeda"|"atomone"|"aura"|"bbedit"|"basic light"|"basic dark"|"bespin"|"copilot"|"dracula"|"darcula"|"duotone light"|"duotone dark"|"eclipse"|"github light"|"github dark"|"gruvbox dark"|"gruvbox light"|"material light"|"material dark"|"monokai"|"monokai dimmed"|"kimbie"|"noctis-lilac"|"nord"|"okaidia"|"quietlight"|"red"|"solarized light"|"solarized dark"|"sublime"|"tokyo-night"|"tokyo-night-storm"|"tokyo-night-day"|"tomorrow-night-blue"|"white dark"|"white light"|"vscode"|"xcode light"|"xcode dark";
type SUPPORTED_LANGUAGES = 'cpp'|'css'|'html'|'java'|'javascript'|'markdown'|'python'|'sql'|'typescript';
const VALID_LANGUAGE_TO_MODULE:Map<SUPPORTED_LANGUAGES,() => LanguageSupport> = new Map();
const VALID_THEME_TO_MODULE: Map<SUPPORTED_THEMES,Extension> = new Map();
const EMMET_IO_LANGUAGES = new Set(['html'] as const);
const CODE_MIRROR_EDITORS: {[index: string]: {editor: EditorView, language: Compartment, theme: Compartment}} = {};

// Add .cm-scroller to .hz-scroll
const tinyTheme = EditorView.theme({
  '.cm-gutter, .cm-content': {
    minHeight: '150px'
  },
  '.cm-editor': {
    maxHeight: '150px',
    overflowY: 'auto'
  },
  '.cm-content': {
    whiteSpace: 'pre-wrap'
  }
});
const minTheme = EditorView.theme({
  '.cm-gutter, .cm-content': {
    minHeight: '200px',
  },
  '.cm-scroller': {
    overflow: 'auto'
  },
  '.cm-editor': {
    height: '100%'
  },
  '.cm-content': {
    whiteSpace: 'pre-wrap'
  }
});
const midTheme = EditorView.theme({
  '.cm-gutter, .cm-content': {
    minHeight: '300px',
    maxHeight: '300px'
  },
  '.cm-content': {
    whiteSpace: 'pre-wrap'
  }
});
const fullScreenTheme = EditorView.theme({
  '.cm-gutter, .cm-content': {
    minHeight: 'calc(100vh - 3*var(--navbar-height))'
  },
  '.cm-content': {
    whiteSpace: 'pre-wrap'
  }
});

const autoTheme = EditorView.theme({
  '.cm-gutter, .cm-content': {
    minHeight: '225px'
  },
  '.cm-editor': {
    maxHeight: 'auto'
  },
  '.cm-content': {
    whiteSpace: 'pre-wrap'
  }
});


/**
 * Returns the innerHTML inside the code mirror editor, else returns null
 * @param id 
 */
export function getCodeMirrorEditorText(id: string) {
  const editor = CODE_MIRROR_EDITORS[id];
  if (editor) {
    const ret = editor.editor.state.doc.toString();
    return ret;
  } else {
    return null;
  }
}
export type getCodeMirrorEditorTextType = typeof getCodeMirrorEditorText;

window.getCodeMirrorEditorText = getCodeMirrorEditorText;

async function handleCodeThemeChangeHelper(newVal:string,EDITOR_VIEW_OBJ:{editor: EditorView, language: Compartment, theme: Compartment}) {
  const modulesToGet: Promise<{theme: SUPPORTED_THEMES, extension: Extension|{light: Extension, dark: Extension}}>[] = [];
  const themeInitial = VALID_THEME_TO_MODULE.get(newVal as any);
  if (themeInitial&&EDITOR_VIEW_OBJ) {
    EDITOR_VIEW_OBJ.editor.dispatch({
      effects: EDITOR_VIEW_OBJ.theme.reconfigure(themeInitial)
    });
  } else if (EDITOR_VIEW_OBJ) {
    switch (newVal) {
      case "abcdef":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-abcdef" */'@uiw/codemirror-theme-abcdef').then((module) => ({theme: 'abcdef', extension: module.abcdef})));
      break;
    case "abyss":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-abyss" */'@uiw/codemirror-theme-abyss').then((module) => ({theme: 'abyss', extension: module.abyss})));
      break;
    case "androidstudio":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-androidstudio" */'@uiw/codemirror-theme-androidstudio').then((module) => ({theme: 'androidstudio', extension: module.androidstudio})));
      break;
    case "andromeda":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-andromeda" */'@uiw/codemirror-theme-andromeda').then((module) => ({theme: 'andromeda', extension: module.andromeda})));
      break;
    case "atomone":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-atomone" */'@uiw/codemirror-theme-atomone').then((module) => ({theme: 'atomone', extension: module.atomone})));
      break;
    case "aura":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-aura" */'@uiw/codemirror-theme-aura').then((module) => ({theme: 'aura', extension: module.aura})));
      break;
    case "bbedit":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-bbedit" */'@uiw/codemirror-theme-bbedit').then((module) => ({theme: 'bbedit', extension: module.bbedit})));
      break;
    case "basic light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-basic" */'@uiw/codemirror-theme-basic').then((module) => ({theme: 'basic light', extension: {light: module.basicLight, dark: module.basicDark}})));
      break;
    case "basic dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-basic" */'@uiw/codemirror-theme-basic').then((module) => ({theme: 'basic dark', extension: {light: module.basicLight, dark: module.basicDark}})));
      break;
    case "bespin":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-bespin" */'@uiw/codemirror-theme-bespin').then((module) => ({theme: 'bespin', extension: module.bespin})));
      break;
    case "copilot":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-copilot" */'@uiw/codemirror-theme-copilot').then((module) => ({theme: 'copilot', extension: module.copilot})));
      break;
    case "dracula":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-dracula" */'@uiw/codemirror-theme-dracula').then((module) => ({theme: 'dracula', extension: module.dracula})));
      break;
    case "darcula":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-darcula" */'@uiw/codemirror-theme-darcula').then((module) => ({theme: 'darcula', extension: module.darcula})));
      break;
    case "duotone light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-duotone" */'@uiw/codemirror-theme-duotone').then((module) => ({theme: 'duotone light', extension: {light: module.duotoneLight, dark: module.duotoneDark}})));
      break;
    case "duotone dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-duotone" */'@uiw/codemirror-theme-duotone').then((module) => ({theme: 'duotone dark', extension: {light: module.duotoneLight, dark: module.duotoneDark} })));
      break;
    case "eclipse":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-eclipse" */'@uiw/codemirror-theme-eclipse').then((module) => ({theme: 'eclipse', extension: module.eclipse})));
      break;
    case "github light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-github" */'@uiw/codemirror-theme-github').then((module) => ({theme: 'github light', extension: {light: module.githubLight, dark: module.githubDark}})));
      break;
    case "github dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-github" */'@uiw/codemirror-theme-github').then((module) => ({theme: 'github dark', extension: {light: module.githubLight, dark: module.githubDark}})));
      break;
    case "gruvbox dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-gruvbox" */'@uiw/codemirror-theme-gruvbox-dark').then((module) => ({theme: 'gruvbox dark', extension: {dark: module.gruvboxDark, light: module.gruvboxLight}})));
      break;
    case "gruvbox light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-gruvbox" */'@uiw/codemirror-theme-gruvbox-dark').then((module) => ({theme: 'gruvbox light', extension: {dark: module.gruvboxDark, light: module.gruvboxLight}})));
      break;
    case "material light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-material" */'@uiw/codemirror-theme-material').then((module) => ({theme: 'material light', extension: {light:module.materialLight,dark:module.materialDark}})));
      break;
    case "material dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-material" */'@uiw/codemirror-theme-material').then((module) => ({theme: 'material dark', extension: {light:module.materialLight,dark:module.materialDark}})));
      break;
    case "monokai":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-monokai" */'@uiw/codemirror-theme-monokai').then((module) => ({theme: 'monokai', extension: module.monokai})));
      break;
    case "monokai dimmed":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-monokai-dimmed" */'@uiw/codemirror-theme-monokai-dimmed').then((module) => ({theme: 'monokai dimmed', extension: module.monokaiDimmed})));
      break;
    case "kimbie":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-kimbie" */'@uiw/codemirror-theme-kimbie').then((module) => ({theme: 'kimbie', extension: module.kimbie})));
      break;
    case "noctis-lilac":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-noctis-lilac" */'@uiw/codemirror-theme-noctis-lilac').then((module) => ({theme: 'noctis-lilac', extension: module.noctisLilac})));
      break;
    case "nord":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-nord" */'@uiw/codemirror-theme-nord').then((module) => ({theme: 'nord', extension: module.nord})));
      break;
    case "okaidia":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-okaidia" */'@uiw/codemirror-theme-okaidia').then((module) => ({theme: 'okaidia', extension: module.okaidia})));
      break;
    case "quietlight":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-quietlight" */'@uiw/codemirror-theme-quietlight').then((module) => ({theme: 'quietlight', extension: module.quietlight})));
      break;
    case "red":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-red" */'@uiw/codemirror-theme-red').then((module) => ({theme: 'red', extension: module.red})));
      break;
    case "solarized light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-solarized" */'@uiw/codemirror-theme-solarized').then((module) => ({theme: 'solarized light', extension: {light:module.solarizedLight, dark:module.solarizedDark}})));
      break;
    case "solarized dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-solarized" */'@uiw/codemirror-theme-solarized').then((module) => ({theme: 'solarized dark', extension: {light:module.solarizedLight, dark:module.solarizedDark}})));
      break;
    case "sublime":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-sublime" */'@uiw/codemirror-theme-sublime').then((module) => ({theme: 'sublime', extension: module.sublime})));
      break;
    case "tokyo-night":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night" */'@uiw/codemirror-theme-tokyo-night').then((module) => ({theme: 'tokyo-night', extension: module.tokyoNight})));
      break;
    case "tokyo-night-storm":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night-storm" */'@uiw/codemirror-theme-tokyo-night-storm').then((module) => ({theme: 'tokyo-night-storm', extension: module.tokyoNightStorm})));
      break;
    case "tokyo-night-day":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night-day" */'@uiw/codemirror-theme-tokyo-night-day').then((module) => ({theme: 'tokyo-night-day', extension: module.tokyoNightDay})));
      break;
    case "tomorrow-night-blue":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tomorrow-night-blue" */'@uiw/codemirror-theme-tomorrow-night-blue').then((module) => ({theme: 'tomorrow-night-blue', extension: module.tomorrowNightBlue})));
      break;
    case "white dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-white" */'@uiw/codemirror-theme-white').then((module) => ({theme: 'white dark', extension: {dark: module.whiteDark, light: module.whiteLight}})));
      break;
    case "white light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-white" */'@uiw/codemirror-theme-white').then((module) => ({theme: 'white light', extension: {dark: module.whiteDark, light: module.whiteLight}})));
      break;
    case "vscode":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-vscode" */'@uiw/codemirror-theme-vscode').then((module) => ({theme: 'vscode', extension: module.vscodeDark})));
      break;
    case "xcode light":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-xcode" */'@uiw/codemirror-theme-xcode').then((module) => ({theme: 'xcode light', extension: {light: module.xcodeLight, dark: module.xcodeDark} })));
      break;
    case "xcode dark":
      modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-xcode" */'@uiw/codemirror-theme-xcode').then((module) => ({theme: 'xcode dark', extension: {light: module.xcodeLight, dark: module.xcodeDark} })));
      break;
    default:
      break;
    }
    if (modulesToGet.length) {
      try {
        const resp = await modulesToGet[0];
        if (resp.theme==="basic light"||resp.theme==="basic dark") {
          VALID_THEME_TO_MODULE.set("basic light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("basic dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="duotone light"||resp.theme==="duotone dark") {
          VALID_THEME_TO_MODULE.set("duotone light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("duotone dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="github light"||resp.theme==="github dark") {
          VALID_THEME_TO_MODULE.set("github light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("github dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="gruvbox light"||resp.theme==="gruvbox dark") {
          VALID_THEME_TO_MODULE.set("gruvbox light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("gruvbox dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="material light"||resp.theme==="material dark") {
          VALID_THEME_TO_MODULE.set("material light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("material dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="solarized light"||resp.theme==="solarized dark") {
          VALID_THEME_TO_MODULE.set("solarized light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("solarized dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="white light"||resp.theme==="white dark") {
          VALID_THEME_TO_MODULE.set("white light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("white dark",(resp as any).extension.dark as any);
        } else if (resp.theme==="xcode light"||resp.theme==="xcode dark") {
          VALID_THEME_TO_MODULE.set("xcode light",(resp as any).extension.light as any);
          VALID_THEME_TO_MODULE.set("xcode dark",(resp as any).extension.dark as any);
        } else {
          if (!!!(resp as any).extension.light && !!!(resp as any).extension.dark)VALID_THEME_TO_MODULE.set(resp.theme,(resp as any).extension);
        }
        const newTheme = VALID_THEME_TO_MODULE.get(resp.theme);
        if (newTheme) {
          EDITOR_VIEW_OBJ.editor.dispatch({
            effects: EDITOR_VIEW_OBJ.theme.reconfigure(newTheme)
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}

function registerCodeMirrorEditors(editors:{ type: SUPPORTED_LANGUAGES, wrapper: HTMLDivElement, style: string, theme: SUPPORTED_THEMES}[]) {
  for (let editorObj of editors) {
    const id = String(editorObj.wrapper.id);
    const editor = editorObj.wrapper.querySelector<HTMLDivElement>('div[data-codemirror]');
    const languageSupportFunction = VALID_LANGUAGE_TO_MODULE.get(editorObj.type);
    const themeExtension = VALID_THEME_TO_MODULE.get(editorObj.theme);
    if(editor&&languageSupportFunction&&themeExtension){
      if (!!!editor.hasAttribute('data-registered')) {
        editor.setAttribute('data-registered','');
        const languageCompartment = new Compartment();
        const themeCompartment = new Compartment();
        const extensions = [
          lineNumbers(), // https://codemirror.net/docs/ref/#view.lineNumbers
          highlightActiveLineGutter(), // https://codemirror.net/docs/ref/#view.lineNumbers
          highlightSpecialChars(), // https://codemirror.net/docs/ref/#view.highlightSpecialChars
          history(), // https://codemirror.net/docs/ref/#commands.history
          foldGutter(), // https://codemirror.net/docs/ref/#language.foldGutter
          drawSelection(), // https://codemirror.net/docs/ref/#language.foldGutter
          dropCursor(), // Draws a cursor at the current drop position when something is dragged over the editor.
          EditorState.allowMultipleSelections.of(true), // Allows multiple ranges to be selected
          indentOnInput(), // https://codemirror.net/docs/ref/#language.indentOnInput
          syntaxHighlighting(defaultHighlightStyle, {fallback: true}), // https://codemirror.net/docs/ref/#language.syntaxHighlighting
          bracketMatching(), // https://codemirror.net/docs/ref/#language.bracketMatching
          closeBrackets(), // https://codemirror.net/docs/ref/#autocomplete.CloseBracketConfig
          autocompletion({ activateOnTyping: true, activateOnTypingDelay: 250, }), // https://codemirror.net/docs/ref/#autocomplete.autocompletion
          rectangularSelection(), // when the user holds down the alkey and clicks, then the user can make a multiple selection
          crosshairCursor(), // when the user holds down the alkey and clicks, then the user can make a multiple selection
          highlightActiveLine(), // Mark lines that have a cursor on them with the "cm-activeLine" DOM class.
          EditorView.lineWrapping,
          EditorView.updateListener.of((v:ViewUpdate) => {
            if (v.docChanged) {
              v.view.contentDOM.dispatchEvent(new Event("change"));
            }
          })
        ];
        const keyMapArr:KeyBinding[] = [];
        if (editorObj.type==="html"||editorObj.type==="css"||editorObj.type==="markdown") {
          keyMapArr.push(indentWithTab)
        }
        if (EMMET_IO_LANGUAGES.has(editorObj.type as any)) {
          const emmetIoKeymap = [
              {
                key: 'Enter',
                run: expandAbbreviation
              },
              {
                key: 'Ctrl-/',
                run: toggleComment
              },
              {
                key: 'Shift-Ctrl-y',
                run: evaluateMath 
              },
              {
                key: 'Ctrl-Alt-ArrowRight',
                run: goToNextEditPoint 
              },
              {
                key: 'Ctrl-Alt-ArrowLeft',
                run: goToPreviousEditPoint 
              },
              {
                key: 'Ctrl-t',
                run: goToTagPair 
              },
              {
                key: 'Ctrl-k',
                run: removeTag 
              },
              {
                key: 'Shift-Ctrl-.',
                run: selectNextItem 
              },
              {
                key: 'Shift-Ctrl-,',
                run: selectPreviousItem 
              },
              {
                key: 'Ctrl-ArrowDown',
                run: decrementNumber01 
              },
              {
                key: 'Ctrl-Alt-ArrowDown',
                run: decrementNumber1 
              },
              {
                key: 'Shift-Ctrl-ArrowDown',
                run: decrementNumber10 
              },
              {
                key: 'Ctrl-ArrowUp',
                run: incrementNumber01 
              },
              {
                key: 'Ctrl-Alt-ArrowUp',
                run: incrementNumber1 
              },
              {
                key: 'Shift-Ctrl-ArrowUp',
                run: incrementNumber10 
              },
          ]
          keyMapArr.push(...emmetIoKeymap);
          extensions.push(emmetConfig.of({
            syntax: editorObj.type as 'html'|'css'
          }))
          extensions.push(abbreviationTracker({
            syntax: editorObj.type as 'html'|'css'
          }));
        }
        keyMapArr.push(
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap
        );
        extensions.push(keymap.of(keyMapArr));
        if (editorObj.type==='typescript'||editorObj.type==='javascript') {
          extensions.push(languageCompartment.of((languageSupportFunction as (typeof import('@codemirror/lang-javascript').javascript))({ typescript: Boolean(editorObj.type==="typescript"), jsx: false})))
        } else {
          extensions.push(languageCompartment.of(languageSupportFunction()));
        }
        if (editorObj.style==="full") {
          extensions.push(fullScreenTheme);
        } else if (editorObj.style==="mid"){
          editor.style.setProperty("max-height","300px","important");
          editor.style.setProperty("overflow","auto","important");
          extensions.push(midTheme);
        }else if(editorObj.style==="min") {
          editor.style.setProperty("max-height","200px","important");
          editor.style.setProperty("overflow","auto","important");
          extensions.push(minTheme);
        } else if (editorObj.style==="tiny") {
          editor.style.setProperty("max-height","150px","important");
          editor.style.setProperty("overflow","auto","important");
          extensions.push(tinyTheme);
        } else {
          editor.style.setProperty("max-height","auto","important");
          editor.style.setProperty("overflow","auto","important");
          extensions.push(autoTheme);
        }
        extensions.push(themeCompartment.of(themeExtension));
        if (!!!CODE_MIRROR_EDITORS[id]) {
          const startStr = editor.innerHTML.trim();
          editor.innerHTML="";
          editor.removeAttribute("hidden");
          const editorView = new EditorView({
            doc: Boolean(startStr && startStr.length) ? startStr : '',
            parent: editor, 
            extensions
          });
          CODE_MIRROR_EDITORS[id] = {editor: editorView, language: languageCompartment, theme: themeCompartment };
          if (editorObj.type==="markdown") {
            editorView.contentDOM.setAttribute("spellcheck","true");
          }
          const head = document.querySelector('head');
          if (head) {
            const firstStyle = head.querySelector('style');
            if (firstStyle) firstStyle.setAttribute('hx-preserve','true');
          }
        }
      }
    }
  }
}

function registerCodeMirrorEditorsPre(editors:{ type: SUPPORTED_LANGUAGES, wrapper: HTMLDivElement, style: string, theme: SUPPORTED_THEMES}[]) {
  const modulesToGet: Promise<{languageSupport: () => LanguageSupport, language: SUPPORTED_LANGUAGES}|{theme: SUPPORTED_THEMES, extension: Extension|{light: Extension, dark: Extension}}>[] = [];

  editors.forEach((obj) => {
    var toGet: SUPPORTED_LANGUAGES = Boolean(obj.type==="typescript")?"javascript":obj.type;
    const languageSupportFunction = VALID_LANGUAGE_TO_MODULE.get(toGet);
    const themeExtension = VALID_THEME_TO_MODULE.get(obj.theme as SUPPORTED_THEMES);
    if (!!!languageSupportFunction) {
      switch (obj.type) {
        case "cpp":
          modulesToGet.push(import(/* webpackChunkName: "cpp-codemirror" */'@codemirror/lang-cpp').then((module) => ({ languageSupport: module.cpp, language: 'cpp'})));
          break;
        case "css":
          modulesToGet.push(import(/* webpackChunkName: "css-codemirror" */'@codemirror/lang-css').then((module) => ({ languageSupport: module.css, language: 'css'})))
          break;
        case "html":
          modulesToGet.push(import(/* webpackChunkName: "html-codemirror" */'@codemirror/lang-html').then((module) => ({ languageSupport: module.html, language: 'html'})))
          break;
        case "java":
          modulesToGet.push(import(/* webpackChunkName: "java-codemirror" */'@codemirror/lang-java').then((module) => ({ languageSupport: module.java, language: 'java'})))
          break;
        case "javascript":
          modulesToGet.push(import(/* webpackChunkName: "js-codemirror" */'@codemirror/lang-javascript').then((module) => ({ languageSupport: module.javascript, language: 'javascript'})))
          break;
        case "markdown":
          modulesToGet.push(import(/* webpackChunkName: "markdown-codemirror" */'@codemirror/lang-markdown').then((module) => ({ languageSupport: module.markdown, language: 'markdown'})))
          break;
        case "python":
          modulesToGet.push(import(/* webpackChunkName: "python-codemirror" */'@codemirror/lang-python').then((module) => ({ languageSupport: module.python, language: 'python'})))
          break;
        case "sql":
          modulesToGet.push(import(/* webpackChunkName: "sql-codemirror" */'@codemirror/lang-sql').then((module) => ({ languageSupport: module.sql, language: 'sql'})))
          break;
        case "typescript":
          modulesToGet.push(import(/* webpackChunkName: "js-codemirror" */'@codemirror/lang-javascript').then((module) => ({ languageSupport: module.javascript, language: 'typescript'})))
          break;    
        default:
          break;    
      }
    }
    if (!!!themeExtension) {
      switch (obj.theme) {
        case "abcdef":
          modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-abcdef" */'@uiw/codemirror-theme-abcdef').then((module) => ({theme: 'abcdef', extension: module.abcdef})));
        break;
      case "abyss":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-abyss" */'@uiw/codemirror-theme-abyss').then((module) => ({theme: 'abyss', extension: module.abyss})));
        break;
      case "androidstudio":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-androidstudio" */'@uiw/codemirror-theme-androidstudio').then((module) => ({theme: 'androidstudio', extension: module.androidstudio})));
        break;
      case "andromeda":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-andromeda" */'@uiw/codemirror-theme-andromeda').then((module) => ({theme: 'andromeda', extension: module.andromeda})));
        break;
      case "atomone":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-atomone" */'@uiw/codemirror-theme-atomone').then((module) => ({theme: 'atomone', extension: module.atomone})));
        break;
      case "aura":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-aura" */'@uiw/codemirror-theme-aura').then((module) => ({theme: 'aura', extension: module.aura})));
        break;
      case "bbedit":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-bbedit" */'@uiw/codemirror-theme-bbedit').then((module) => ({theme: 'bbedit', extension: module.bbedit})));
        break;
      case "basic light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-basic" */'@uiw/codemirror-theme-basic').then((module) => ({theme: 'basic light', extension: {light: module.basicLight, dark: module.basicDark}})));
        break;
      case "basic dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-basic" */'@uiw/codemirror-theme-basic').then((module) => ({theme: 'basic dark', extension: {light: module.basicLight, dark: module.basicDark}})));
        break;
      case "bespin":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-bespin" */'@uiw/codemirror-theme-bespin').then((module) => ({theme: 'bespin', extension: module.bespin})));
        break;
      case "copilot":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-copilot" */'@uiw/codemirror-theme-copilot').then((module) => ({theme: 'copilot', extension: module.copilot})));
        break;
      case "dracula":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-dracula" */'@uiw/codemirror-theme-dracula').then((module) => ({theme: 'dracula', extension: module.dracula})));
        break;
      case "darcula":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-darcula" */'@uiw/codemirror-theme-darcula').then((module) => ({theme: 'darcula', extension: module.darcula})));
        break;
      case "duotone light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-duotone" */'@uiw/codemirror-theme-duotone').then((module) => ({theme: 'duotone light', extension: {light: module.duotoneLight, dark: module.duotoneDark}})));
        break;
      case "duotone dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-duotone" */'@uiw/codemirror-theme-duotone').then((module) => ({theme: 'duotone dark', extension: {light: module.duotoneLight, dark: module.duotoneDark} })));
        break;
      case "eclipse":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-eclipse" */'@uiw/codemirror-theme-eclipse').then((module) => ({theme: 'eclipse', extension: module.eclipse})));
        break;
      case "github light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-github" */'@uiw/codemirror-theme-github').then((module) => ({theme: 'github light', extension: {light: module.githubLight, dark: module.githubDark}})));
        break;
      case "github dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-github" */'@uiw/codemirror-theme-github').then((module) => ({theme: 'github dark', extension: {light: module.githubLight, dark: module.githubDark}})));
        break;
      case "gruvbox dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-gruvbox" */'@uiw/codemirror-theme-gruvbox-dark').then((module) => ({theme: 'gruvbox dark', extension: {dark: module.gruvboxDark, light: module.gruvboxLight}})));
        break;
      case "gruvbox light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-gruvbox" */'@uiw/codemirror-theme-gruvbox-dark').then((module) => ({theme: 'gruvbox light', extension: {dark: module.gruvboxDark, light: module.gruvboxLight}})));
        break;
      case "material light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-material" */'@uiw/codemirror-theme-material').then((module) => ({theme: 'material light', extension: {light:module.materialLight,dark:module.materialDark}})));
        break;
      case "material dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-material" */'@uiw/codemirror-theme-material').then((module) => ({theme: 'material dark', extension: {light:module.materialLight,dark:module.materialDark}})));
        break;
      case "monokai":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-monokai" */'@uiw/codemirror-theme-monokai').then((module) => ({theme: 'monokai', extension: module.monokai})));
        break;
      case "monokai dimmed":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-monokai-dimmed" */'@uiw/codemirror-theme-monokai-dimmed').then((module) => ({theme: 'monokai dimmed', extension: module.monokaiDimmed})));
        break;
      case "kimbie":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-kimbie" */'@uiw/codemirror-theme-kimbie').then((module) => ({theme: 'kimbie', extension: module.kimbie})));
        break;
      case "noctis-lilac":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-noctis-lilac" */'@uiw/codemirror-theme-noctis-lilac').then((module) => ({theme: 'noctis-lilac', extension: module.noctisLilac})));
        break;
      case "nord":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-nord" */'@uiw/codemirror-theme-nord').then((module) => ({theme: 'nord', extension: module.nord})));
        break;
      case "okaidia":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-okaidia" */'@uiw/codemirror-theme-okaidia').then((module) => ({theme: 'okaidia', extension: module.okaidia})));
        break;
      case "quietlight":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-quietlight" */'@uiw/codemirror-theme-quietlight').then((module) => ({theme: 'quietlight', extension: module.quietlight})));
        break;
      case "red":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-red" */'@uiw/codemirror-theme-red').then((module) => ({theme: 'red', extension: module.red})));
        break;
      case "solarized light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-solarized" */'@uiw/codemirror-theme-solarized').then((module) => ({theme: 'solarized light', extension: {light:module.solarizedLight, dark:module.solarizedDark}})));
        break;
      case "solarized dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-solarized" */'@uiw/codemirror-theme-solarized').then((module) => ({theme: 'solarized dark', extension: {light:module.solarizedLight, dark:module.solarizedDark}})));
        break;
      case "sublime":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-sublime" */'@uiw/codemirror-theme-sublime').then((module) => ({theme: 'sublime', extension: module.sublime})));
        break;
      case "tokyo-night":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night" */'@uiw/codemirror-theme-tokyo-night').then((module) => ({theme: 'tokyo-night', extension: module.tokyoNight})));
        break;
      case "tokyo-night-storm":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night-storm" */'@uiw/codemirror-theme-tokyo-night-storm').then((module) => ({theme: 'tokyo-night-storm', extension: module.tokyoNightStorm})));
        break;
      case "tokyo-night-day":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tokyo-night-day" */'@uiw/codemirror-theme-tokyo-night-day').then((module) => ({theme: 'tokyo-night-day', extension: module.tokyoNightDay})));
        break;
      case "tomorrow-night-blue":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-tomorrow-night-blue" */'@uiw/codemirror-theme-tomorrow-night-blue').then((module) => ({theme: 'tomorrow-night-blue', extension: module.tomorrowNightBlue})));
        break;
      case "white dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-white" */'@uiw/codemirror-theme-white').then((module) => ({theme: 'white dark', extension: {dark: module.whiteDark, light: module.whiteLight}})));
        break;
      case "white light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-white" */'@uiw/codemirror-theme-white').then((module) => ({theme: 'white light', extension: {dark: module.whiteDark, light: module.whiteLight}})));
        break;
      case "vscode":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-vscode" */'@uiw/codemirror-theme-vscode').then((module) => ({theme: 'vscode', extension: module.vscodeDark})));
        break;
      case "xcode light":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-xcode" */'@uiw/codemirror-theme-xcode').then((module) => ({theme: 'xcode light', extension: {light: module.xcodeLight, dark: module.xcodeDark} })));
        break;
      case "xcode dark":
        modulesToGet.push(import(/* webpackChunkName: "codemirror-theme-xcode" */'@uiw/codemirror-theme-xcode').then((module) => ({theme: 'xcode dark', extension: {light: module.xcodeLight, dark: module.xcodeDark} })));
        break;
      default:
        break;
      }
    }
  });
  if(modulesToGet.length>=1) {
    Promise.all(modulesToGet)
    .then((arr) =>{
      for (let obj of arr) {
        /* @ts-ignore */
        if (obj.language!==undefined && obj.languageSupport!==undefined) {
          /* @ts-ignore */
          VALID_LANGUAGE_TO_MODULE.set(obj.language,obj.languageSupport);
          /* @ts-ignore */
        } else if (obj.extension!==undefined && obj.theme!==undefined) {
          const supportedTheme: SUPPORTED_THEMES = (obj as any).theme as SUPPORTED_THEMES;
          if (supportedTheme==="basic light"||supportedTheme==="basic dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("basic light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("basic dark",obj.extension.dark);
          } else if (supportedTheme==="duotone light"||supportedTheme==="duotone dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("duotone light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("duotone dark",obj.extension.dark);
          } else if (supportedTheme==="github light"||supportedTheme==="github dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("github light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("github dark",obj.extension.dark);
          } else if (supportedTheme==="gruvbox light"||supportedTheme==="gruvbox dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("gruvbox light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("gruvbox dark",obj.extension.dark);
          } else if (supportedTheme==="material light"||supportedTheme==="material dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("material light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("material dark",obj.extension.dark);
          } else if (supportedTheme==="solarized light"||supportedTheme==="solarized dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("solarized light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("solarized dark",obj.extension.dark);
          } else if (supportedTheme==="white light"||supportedTheme==="white dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("white light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("white dark",obj.extension.dark);
          } else if (supportedTheme==="xcode light"||supportedTheme==="xcode dark") {
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("xcode light",obj.extension.light);
            /* @ts-ignore */
            VALID_THEME_TO_MODULE.set("xcode dark",obj.extension.dark);
          } else {
            /* @ts-ignore */
            if (!!!obj.light && !!!obj.dark)VALID_THEME_TO_MODULE.set(obj.theme,obj.extension);
          }
        }
      }
      registerCodeMirrorEditors(editors);
    })
    .catch((error)=>{
      console.error(error);
    })
  } else {
    registerCodeMirrorEditors(editors);
  } 
} 
/**
 * When the theme changes for the code mirror editor, change the themes on the editors
 */
export function codeEditorsThemeChange() {
  const input = document.getElementById('code-editor-theme-main') as HTMLInputElement|null;
  if (input){
    const value = input.value;
    if (VALID_THEMES.has(value as any)) {
      Object.values(CODE_MIRROR_EDITORS)
      .forEach((obj) => {
        handleCodeThemeChangeHelper(value,obj);
      })
    }
  }
}
window.codeEditorsThemeChange = codeEditorsThemeChange;

function onConfigRequest(e:CustomEvent) {
  const elementDispatchedRequest = e.detail.elt as HTMLElement|null;
  if(elementDispatchedRequest) {
    const parameters = e.detail.parameters;
    const headers = e.detail.headers;
    const editorWrappers = Array.from(elementDispatchedRequest.querySelectorAll('div[data-editor-wrapper]'));
    editorWrappers.forEach((div) => {
      const id = div.id;
      if (id&&!!!parameters[id]) {
        const input = getCodeMirrorEditorText(id);
        if (input) {
          parameters[id] = input;
        } 
      }
    })
  }
}
function createHtmlNode(obj:{html: string }) {
  const div = document.createElement('div');
  div.setAttribute('data-custom-code','');
  const div2 = document.createElement('div');
  div2.setAttribute('data-html','');
  div2.insertAdjacentHTML("beforeend",obj.html);
  div.append(div2);
  
  return div;
}

function onOutputTabButtonClick(this:HTMLButtonElement,e:Event) {
  const html = getCodeMirrorEditorText('html_wrapper');
  const output = document.getElementById('output_tab_wrapper');
  if (html&&output) {
    output.innerHTML='';
    const newHTML = validateUgcCode(html);
    const node = createHtmlNode({ html: String(newHTML) });
    output.append(node);
  }
}

function insertLexicalCodeEditors(this:HTMLElement,e:CustomEvent) {
  registerCodeEditorsInsideElement(this);
}

function removeLexicalCodeEditors(this:HTMLElement,e:CustomEvent) {
  const editor = this.querySelector<HTMLDivElement>('div[id^="html_wrapper_"]');
  if (editor) {
    const id = editor.id;
    removeCodeMirrorEditor(id);
  }
}

function getLexicalCodeEditorsCode(this:HTMLElement,e:CustomEvent) {
  const editor = this.querySelector<HTMLDivElement>('div[id^="html_wrapper"]');
  if (editor) {
    const code = getCodeMirrorEditorText(editor.id);
    this.dispatchEvent(new CustomEvent("GOT_LEXICAL_EDITORS_CODE",{ detail: { html: code }}));
  }
}

function handleRegisterLexicalCodeEditor(e:CustomEvent) {
  if (e && e.detail && e.detail instanceof HTMLElement) {
    e.detail.addEventListener('INSERT_LEXICAL_CODE_EDITORS',insertLexicalCodeEditors);
    e.detail.addEventListener('REMOVE_LEXICAL_CODE_EDITORS',removeLexicalCodeEditors);
    e.detail.addEventListener('GET_LEXICAL_EDITORS_CODE',getLexicalCodeEditorsCode);
  }
}

function registerCodeEditorsInsideElement(el:HTMLElement) {
  const editors = Array.from(el.querySelectorAll('div[data-codemirror]'))
  .filter((el) => {
    const attr = el.getAttribute('data-codemirror');
    return attr && VALID_LANGUAGES.has(attr as any)
  })
  .map((el) => {
    const type = el.getAttribute('data-codemirror');
    const wrapper = el.closest<HTMLDivElement>('div[data-editor-wrapper]');
    const style = el.getAttribute('data-type');
    const theme = el.getAttribute('data-theme');
    return {
      type,
      wrapper,
      style,
      theme
    }
  })
  .filter((obj) => Boolean(obj.type && obj.wrapper && obj.style && VALID_THEMES.has(obj.theme as any)));
  if(editors.length) {
    registerCodeMirrorEditorsPre(editors as { type: SUPPORTED_LANGUAGES, wrapper: HTMLDivElement, style: string, theme: SUPPORTED_THEMES}[]);
  }
}

function handleGetCodeMirrorText(e:CustomEvent) {
  const id = e?.detail?.id;
  if (typeof id==="string") {
    const element = document.getElementById(id);
    if (element) {
      const text = getCodeMirrorEditorText(id);
      element.dispatchEvent(new CustomEvent('GOT_CODEMIRROR_TEXT',{ detail: { code: text }}))
    }
  }
}

function handleChangeCodeMirrorLangauge(e:CustomEvent) {
  const id = e?.detail?.id;
  const language = e.detail.language;
  const modulesToGet: Promise<{languageSupport: () => LanguageSupport, language: SUPPORTED_LANGUAGES}|{theme: SUPPORTED_THEMES, extension: Extension|{light: Extension, dark: Extension}}>[] = [];
  if (id&&language) {
    const editor = CODE_MIRROR_EDITORS[id];
    if (editor) {
      const languageSupportFunction = VALID_LANGUAGE_TO_MODULE.get(language);
      if (languageSupportFunction) {
        editor.language.reconfigure(languageSupportFunction());
      } else {
        switch (language) {
          case "cpp":
            modulesToGet.push(import(/* webpackChunkName: "cpp-codemirror" */'@codemirror/lang-cpp').then((module) => ({ languageSupport: module.cpp, language: 'cpp'})));
            break;
          case "css":
            modulesToGet.push(import(/* webpackChunkName: "css-codemirror" */'@codemirror/lang-css').then((module) => ({ languageSupport: module.css, language: 'css'})))
            break;
          case "html":
            modulesToGet.push(import(/* webpackChunkName: "html-codemirror" */'@codemirror/lang-html').then((module) => ({ languageSupport: module.html, language: 'html'})))
            break;
          case "java":
            modulesToGet.push(import(/* webpackChunkName: "java-codemirror" */'@codemirror/lang-java').then((module) => ({ languageSupport: module.java, language: 'java'})))
            break;
          case "javascript":
            modulesToGet.push(import(/* webpackChunkName: "js-codemirror" */'@codemirror/lang-javascript').then((module) => ({ languageSupport: module.javascript, language: 'javascript'})))
            break;
          case "markdown":
            modulesToGet.push(import(/* webpackChunkName: "markdown-codemirror" */'@codemirror/lang-markdown').then((module) => ({ languageSupport: module.markdown, language: 'markdown'})))
            break;
          case "python":
            modulesToGet.push(import(/* webpackChunkName: "python-codemirror" */'@codemirror/lang-python').then((module) => ({ languageSupport: module.python, language: 'python'})))
            break;
          case "sql":
            modulesToGet.push(import(/* webpackChunkName: "sql-codemirror" */'@codemirror/lang-sql').then((module) => ({ languageSupport: module.sql, language: 'sql'})))
            break;
          case "typescript":
            modulesToGet.push(import(/* webpackChunkName: "js-codemirror" */'@codemirror/lang-javascript').then((module) => ({ languageSupport: module.javascript, language: 'typescript'})))
            break;    
          default:
            throw new Error("Unrecognized codemirror language.");   
        }
      }
      Promise.all(modulesToGet)
      .then((res) => {
        for (let obj of res) {
          /* @ts-ignore */
          VALID_LANGUAGE_TO_MODULE.set(obj.language,obj.languageSupport);
          /* @ts-ignore */
          editor.language.reconfigure(obj.languageSupport());
        }
      })
      .catch((e) => {
        console.error(e);
      })
    }
  }
}

export function setAllCodeMirrorEditors() {
  document.addEventListener('htmx:configRequest',onConfigRequest);
  document.addEventListener('REGISTER_LEXICAL_CODE_EDITOR',handleRegisterLexicalCodeEditor);
  document.addEventListener('GET_CODEMIRROR_TEXT',handleGetCodeMirrorText);
  document.addEventListener('CHANGE_CODEMIRROR_LANGUAGE',handleChangeCodeMirrorLangauge);
  const form = document.getElementById('custom-html-form');
  if (form) form.addEventListener('GET_LEXICAL_EDITORS_CODE',getLexicalCodeEditorsCode);
  const outputTabButton = document.getElementById("output_tab_button");
  if (outputTabButton) outputTabButton.addEventListener('click',onOutputTabButtonClick);
  registerCodeEditorsInsideElement(document.body);

}

export function removeCodeMirrorEditor(id:string) {
  if (CODE_MIRROR_EDITORS[id]) {
    if (CODE_MIRROR_EDITORS[id].editor.dom&&!!!CODE_MIRROR_EDITORS[id].editor.dom.isConnected)
    CODE_MIRROR_EDITORS[id].editor.destroy();
    delete CODE_MIRROR_EDITORS[id];
  };
}
window.removeCodeMirrorEditor = removeCodeMirrorEditor;

export function onUnloadCodeMirrorEditors() {
  Object.keys(CODE_MIRROR_EDITORS).forEach((key) => {
    if (!!!CODE_MIRROR_EDITORS[key].editor.dom.isConnected) {
      CODE_MIRROR_EDITORS[key].editor.destroy();
      delete CODE_MIRROR_EDITORS[key]
    }
  });
}
export function unloadCodeEditorsBeforeSwap(docOrEl:DocOrEl) {
  const codeEditors = docOrEl.querySelectorAll('div[data-codemirror]');
  codeEditors.forEach((editor) => {
    removeCodeMirrorEditor(editor.id);
  })
}
window.unloadCodeEditorsBeforeSwap = unloadCodeEditorsBeforeSwap;