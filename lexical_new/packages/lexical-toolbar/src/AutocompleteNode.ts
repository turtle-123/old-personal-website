// https://github.com/facebook/lexical/blob/65bf70d0325bf49a86fee25661aeb23380e88dc6/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx
import {
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
  $addUpdateTag,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_TAB_COMMAND,
  BaseSelection,
  COMMAND_PRIORITY_NORMAL,
  BLUR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $nodesOfType,
} from 'lexical';
import {$isAtNodeEnd} from '@lexical/selection';
import {mergeRegister} from '@lexical/utils';
import { getCurrentEditor, getCurrentEditorID, getEditorInstances, isTouchDevice } from '@lexical/shared';
import { addSwipeRightListener } from '@lexical/shared';

const HISTORY_MERGE = {tag: 'history-merge'};
export const uuid_autocomplete = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);


export type SerializedAutocompleteNode = Spread<
  {
    uuid: string;
  },
  SerializedTextNode
>;

export class AutocompleteNode extends TextNode {
  /**
   * A unique uuid is generated for each session and assigned to the instance.
   * This helps to:
   * - Ensures max one Autocomplete node per session.
   * - Ensure that when collaboration is enabled, this node is not shown in
   *   other sessions.
   * See https://github.com/facebook/lexical/blob/master/packages/lexical-playground/src/plugins/AutocompletePlugin/index.tsx#L39
   */
  __uuid: string;

  static clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__text, node.__uuid, node.__key);
  }

  static getType(): 'autocomplete' {
    return 'autocomplete';
  }

  static importJSON(serializedNode: SerializedAutocompleteNode): TextNode {
    return $createTextNode('');
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      uuid: uuid_autocomplete,
      type: 'autocomplete'
    };
  }

  constructor(text: string, uuid: string, key?: NodeKey) {
    super(text, key);
    this.__uuid = uuid;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return false;
  }

  exportDOM(_: LexicalEditor): DOMExportOutput {
    return {element: null};
  }
  importDOM() {
    return null;
  }
  excludeFromCopy() {
    return true;
  }
  
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.classList.add('autocomplete');
    if (this.__uuid !== uuid_autocomplete) {
      dom.style.display = 'none';
    }
    return dom;
  }
}

export function $createAutocompleteNode(
  text: string,
  uuid: string,
): AutocompleteNode {
  return new AutocompleteNode(text, uuid).setMode('token');
}

function getIncludeAutocomplete() {
  const includeAutoComplete = document.getElementById('include-autocomplete-suggestions') as HTMLInputElement|null;
  return includeAutoComplete?.checked;
}

let autocompleteNodeKey: null | NodeKey = null;
let lastMatch: null | string = null;
let lastSuggestion: null | string = null;
let prevNodeFormat: number = 0;
let prevNodeStyle: string = '';
var searchPromiseUUID: string|null = null;

// TODO lookup should be custom
function $search(selection: null | BaseSelection): [boolean, string] {
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return [false, ''];
  }
  const node = selection.getNodes()[0];
  const anchor = selection.anchor;
  // Check siblings?
  if (!$isTextNode(node) || !node.isSimpleText() || !$isAtNodeEnd(anchor) || (node.getNextSibling()!==null&&node.getNextSibling()?.getType()!=="autocomplete")) {
    return [false, ''];
  }
  const word = [];
  const text = node.getTextContent();
  let i = node.getTextContentSize();
  let c;
  while (i-- && i >= 0 && (c = text[i]) !== ' ') {
    word.push(c);
  }
  if (word.length === 0) {
    return [false, ''];
  }
  return [true, word.reverse().join('')];
}

function formatSuggestionText(suggestion: string): string {
  const isMobile = isTouchDevice();
  return `${suggestion} ${isMobile ? '(SWIPE \u2B95)' : '(TAB)'}`;
}

/**
 * Remove autocomplete node from editor
 */
function $clearSuggestion() {
  const autocompleteNode = autocompleteNodeKey !== null ? $getNodeByKey(autocompleteNodeKey) : null;
  if (autocompleteNode !== null && autocompleteNode.isAttached()) {
    autocompleteNode.remove();
    autocompleteNodeKey = null;
  }
  if (searchPromiseUUID!==null) {
    searchPromiseUUID = null;
  }
  lastMatch = null;
  lastSuggestion = null;
  prevNodeFormat = 0;
  prevNodeStyle = '';
}

function updateAsyncSuggestion(searchPromiseUUIDCalbback:string,editor:LexicalEditor,newSuggestion: null | string,) {
  var ret = false;
  if (searchPromiseUUID!==searchPromiseUUIDCalbback || newSuggestion === null) {
    editor.update(() => {
      // Outdated or no suggestion
      $clearSuggestion();
      ret = true;
      return;
    })
  }
  if (ret) return;
  if (getCurrentEditorID()===editor._config.namespace) {
    editor.update(() => {
      const selection = $getSelection();
      const [hasMatch, match] = $search(selection);
      if (!hasMatch || match !== lastMatch || !$isRangeSelection(selection)) {
        // Outdated
        $clearSuggestion();
        return;
      }
      const selectionCopy = selection.clone();
      const prevNode = selection.getNodes()[0] as TextNode;
      prevNodeFormat = prevNode.getFormat();
      prevNodeStyle = prevNode.getStyle();
      const node = $createAutocompleteNode(formatSuggestionText(String(newSuggestion)),uuid_autocomplete).setFormat(prevNodeFormat).setStyle(prevNodeStyle.concat('opacity: 0.4;'));
      autocompleteNodeKey = node.getKey();
      selection.insertNodes([node]);
      $setSelection(selectionCopy);
      lastSuggestion = newSuggestion;
    }, HISTORY_MERGE);
  }
}
function $handleAutocompleteNodeTransform(node: AutocompleteNode) {
  const key = node.getKey();
  if (node.__uuid === uuid_autocomplete && key !== autocompleteNodeKey) {
    // Max one Autocomplete node per session
    $clearSuggestion();
  }

}

function getOnResponse(editor_id:string) {
  const func = function(newSuggestionObj:[string|null,string]) {
    const current_editor = getCurrentEditor();
    if (current_editor&&current_editor._config.namespace===editor_id) {
      updateAsyncSuggestion(newSuggestionObj[1],current_editor,newSuggestionObj[0])
    } else {
      const editor = getEditorInstances()[editor_id];
      if (editor) {
        editor.update(() => {
          $clearSuggestion();
        })
      }
    }
  }
  return func;
}

function getHandleUpdate(editor:LexicalEditor) {
  const func = function () {
    editor.update(() => {
      const selection = $getSelection();
      const [hasMatch, match] = $search(selection);
      if (!hasMatch) {
        $clearSuggestion();
        return;
      }
      // If match is the same return
      if (match === lastMatch) {
        return;
      }
      // Clear Suggestion
      $clearSuggestion();
      if (window.socket&&getIncludeAutocomplete()) {
        var newPromiseUUID = window.crypto.randomUUID();
        const emitArgs = [match,newPromiseUUID];
        lastMatch = match;
        searchPromiseUUID = newPromiseUUID;
        if (window.socket) window.socket.emit('ai-autocomplete',emitArgs,getOnResponse(editor._config.namespace));
      }
    }, HISTORY_MERGE);
  }
  return func;
}

function $handleAutocompleteIntent() {
  if (lastSuggestion === null || autocompleteNodeKey === null) {
    return false;
  }
  const autocompleteNode = $getNodeByKey(autocompleteNodeKey);
  if (autocompleteNode === null) {
    return false;
  }
  const textNode = $createTextNode(lastSuggestion).setFormat(prevNodeFormat).setStyle(prevNodeStyle);
  autocompleteNode.replace(textNode);
  textNode.selectNext();
  $clearSuggestion();
  return true;
}

function $handleKeypressCommand(e:Event) {
  if ($handleAutocompleteIntent()) {
    e.preventDefault();
    return true;
  }
  return false;
}

function getHandleSwipeRightListener(editor:LexicalEditor) {
  const func = function (_force: number, e: TouchEvent) {
    editor.update(() => {
      if ($handleAutocompleteIntent()) {
        e.preventDefault();
      } else {
        $addUpdateTag(HISTORY_MERGE.tag);
      }
    });
  }
  return func;
}

function getUnmountSuggestion(editor:LexicalEditor) {
  const func = function () {
    editor.update(() => {
      $clearSuggestion();
    }, HISTORY_MERGE);
  }
  return func;
}


export function registerAutocompleteEditable(editor:LexicalEditor) {
  const rootElem = editor.getRootElement();
  editor.update(() => {
    const nodes = $nodesOfType(AutocompleteNode);
    nodes.forEach((n) => n.remove(false));
  })
  return mergeRegister(
    editor.registerNodeTransform(AutocompleteNode,$handleAutocompleteNodeTransform),
    editor.registerUpdateListener(getHandleUpdate(editor)),
    editor.registerCommand(
      KEY_TAB_COMMAND,
      $handleKeypressCommand,
      COMMAND_PRIORITY_NORMAL,
    ),
    editor.registerCommand(
      KEY_ARROW_RIGHT_COMMAND,
      $handleKeypressCommand,
      COMMAND_PRIORITY_LOW,
    ),
    ...(rootElem !== null
      ? [addSwipeRightListener(rootElem, getHandleSwipeRightListener(editor))]
      : []),
    getUnmountSuggestion(editor)
  );
}