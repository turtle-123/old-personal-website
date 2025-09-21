import { 
  COMMAND_PRIORITY_EDITOR, 
  LexicalEditor, 
  createCommand,
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $getNodeByKey,
  $nodesOfType,
  $getPreviousSelection
} from "lexical";
import { CodeHighlightNode, CodeNode, registerCodeHighlighting } from ".";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { 
  $createCodeNode,
  $isCodeNode
} from ".";
import { closeDialog, isTouchDevice, OPEN_DIALOG_FINAL_CED, OPEN_LEXICAL_DIALOG_FINAL_CED, REGISTER_TOOLBAR_LISTENERS, UPDATE_ON_SET_HTML } from "@lexical/shared";

export const INSERT_CODE_COMMAND = createCommand<undefined|{language: string}>('INSERT_CODE_COMMAND');
var LAST_SELECTED_CODE_KEY: string|undefined = undefined;
var LAST_SELECTED_LANG: string|undefined = undefined;

/**
 * When the coding language select input changes, 
 * @param this 
 * @param e 
 */
function getCodeLanguageChange(editor:LexicalEditor) {
  const handleCodeLanguageChange = function (this:HTMLFormElement,e:SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();
    const dialog = this.closest('div.dialog-wrapper') as HTMLDivElement|null;
    if (dialog) {
      const selectedInput = this.querySelector<HTMLInputElement>('input:checked');
      if (selectedInput) {
        const value = selectedInput.value;
        if (LAST_SELECTED_CODE_KEY!==undefined) {
          editor.update(() => {
            const codeNode = $getNodeByKey(String(LAST_SELECTED_CODE_KEY));
            if ($isCodeNode(codeNode)) {
              codeNode.setLanguage(value);
              closeDialog(dialog);
            }
          })
        } else if (LAST_SELECTED_CODE_KEY===undefined) {
          editor.dispatchCommand(INSERT_CODE_COMMAND,{language: value});
          closeDialog(dialog)
        }
      }
    }
  }
  return handleCodeLanguageChange;
}

function setCodeLanguageFieldsetValue(this:HTMLButtonElement,e:Event) {
  const lang = LAST_SELECTED_LANG ? LAST_SELECTED_LANG : 'javascript';
  const dialog = document.getElementById('coding-lang-lexical');
  if (dialog) {
    const form = dialog.querySelector('form');
    if (form) {
      const inp = form.querySelector<HTMLInputElement>('input:checked');
      const inp2 = form.querySelector<HTMLInputElement>(`input[value="${String(lang)}"]`);
      if (inp) {
        inp.checked = false;
      }
      if (inp2) {
        inp2.checked = true;
      }
    }
  }
}
function registerCodeListeners(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
  if (wrapper) {
    const btn = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-insert-code]');
    if (btn) {
      if (!!!isTouchDevice()) btn.addEventListener('mousedown',setCodeLanguageFieldsetValue)
      else btn.addEventListener('touchstart',setCodeLanguageFieldsetValue);
    }
  }
}

function onOpenCodeLangDialog(editor:LexicalEditor) {
  const func = function (e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    const el = e.detail.el;
    if (el.id==="coding-lang-lexical") {
      const dialog = document.getElementById('coding-lang-lexical') as HTMLDivElement|null;
      if (dialog) {
        const form = dialog.querySelector('form');
        if (form) {
          form.addEventListener('submit',getCodeLanguageChange(editor))
        }
        document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog }}));
      }
    }
  }
  return func;
}

export function registerCodeEditable(editor:LexicalEditor) {
  if (editor.hasNode(CodeNode)&&editor.hasNode(CodeHighlightNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',onOpenCodeLangDialog(editor));
    registerCodeListeners(editor);
    return mergeRegister(
      editor.registerCommand(
        INSERT_CODE_COMMAND,
        (obj) => {
          const selection = $getSelection() || $getPreviousSelection();
          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()){
              $setBlocksType(selection,()=>$createCodeNode(obj));
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode(obj);
              selection.insertNodes([codeNode]);
              const selectionNew = $getSelection();
              if ($isRangeSelection(selectionNew)) selectionNew.insertRawText(textContent);
            }
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const nodes = selection.getNodes();
            for (let node of nodes) {
              const codeNode = $findMatchingParent(node,n=>$isCodeNode(n));
              if (codeNode) {
                LAST_SELECTED_CODE_KEY = codeNode.getKey();
                LAST_SELECTED_LANG = codeNode.getLanguage();
                break;
              }
            }
          }
          LAST_SELECTED_CODE_KEY = undefined;
          LAST_SELECTED_LANG = undefined;
          return false;          
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      registerCodeNotEditable(editor),
      editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,() => {
        registerCodeListeners(editor);
        return false;
      },COMMAND_PRIORITY_EDITOR)
    )
  } else {
    console.error('Editor does not have CodeNode or CodeHighlightNode registered.');
  }
  return () => {return};
}

export function registerCodeNotEditable(editor:LexicalEditor) {
  return mergeRegister(
    editor.registerEditableListener((editable) => {
      if (editable) {
        editor.update(() => {
          const codeNodes = $nodesOfType(CodeNode);
          for (let node of codeNodes) {
            if (!!!node.getEditable()) {
              node.setEditable(true);
            }
          }
        })
      } else {
        editor.update(() => {
          const codeNodes = $nodesOfType(CodeNode);
          for (let node of codeNodes) {
            if (node.getEditable()) {
              node.setEditable(false);
            }
          }
        },{ discrete: true })
      }
    }),
    editor.registerCommand(
      UPDATE_ON_SET_HTML,
      () => {
        const codeNodes = $nodesOfType(CodeNode);
        for (let node of codeNodes) {
          if (node.getEditable()) {
            node.setEditable(false);
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR
    ),
    registerCodeHighlighting(editor)
  )
}