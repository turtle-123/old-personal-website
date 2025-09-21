
/**
 * @todo Will need to change audio and video validation
 */
import {  
  COMMAND_PRIORITY_EDITOR,
  $insertNodes,
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getNodeByKey, 
  COMMAND_PRIORITY_HIGH,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  LexicalCommand,
  createCommand,
  KEY_ENTER_COMMAND,
  $getSelection,
  $isRangeSelection,
  $isParagraphNode,
  $isTextNode,
  $isExtendedTextNode,
  $createTextNode,
  LexicalNode,
  $nodesOfType
} from "lexical";
import { 
  mergeRegister,
  $wrapNodeInElement,
  $findMatchingParent,
  $insertNodeToNearestRoot,
} from "@lexical/utils";
import { 
  $isMathNode, 
  $createMathNode, 
  clearInnerHTML, 
  renderMathBlock, 
  renderMathInline ,
  MathNode
} from "./nodes/MathNode";
import { 
  getCurrentEditor,
  closeDialog,
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED,
  UPDATE_ON_SET_HTML
} from "@lexical/shared";

export const INSERT_MATH_COMMAND: LexicalCommand<{equation: string;inline: boolean;}> = createCommand('INSERT_MATH_COMMAND');

/* ------------------------------------- Math Stuff --------------------------------------- */
/**
 * Math Stuff
 * @returns 
 */
function getMathDialog() {
  const dialog = document.getElementById('math-markup-lexical') as HTMLDivElement|null;
  if(dialog) {
    const text = dialog.querySelector<HTMLTextAreaElement>('textarea');
    const equation = text ? text.value : '';
    const radios = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    const checkedRadio = radios.filter((el) => el.checked);
    const radio = checkedRadio.length ? checkedRadio[0].value : 'block';
    const displayStyle = ((radio ==="block" || radio==="inline")) ? Boolean(radio==="block") : true;
    const example = dialog.querySelector<HTMLDivElement>('output[data-preview]');
    const form = dialog.querySelector<HTMLFormElement>('form');
    return {
      dialog,
      equation,
      displayStyle,
      example,
      form
    }
  } else return null;
}
type GetMathDialogReturn = {
  dialog: HTMLDivElement;
  equation: string;
  displayStyle: boolean;
  example: HTMLDivElement | null;
  form: HTMLFormElement | null;
};
var MATH_DEBOUNCER:NodeJS.Timeout|undefined = undefined;
function handleMathDialogChange(this: HTMLFormElement,e:Event) {
  const mathDialog = getMathDialog();
  if (MATH_DEBOUNCER) clearTimeout(MATH_DEBOUNCER);
  if (mathDialog && mathDialog.example) {
    const updateMathPreview = function (this:GetMathDialogReturn) {
      /* displayStyle===true -> block */
      if (this.displayStyle) {
        clearInnerHTML(this.example as HTMLDivElement);
        if (this.equation.length){
          (this.example as HTMLDivElement).className = "katex-block mt-3";
          (this.example as HTMLDivElement).style.cssText = "position:relative;";
          renderMathBlock(this.example as HTMLDivElement,this.equation);
        }
      } else {
        if (this.equation.length){
          clearInnerHTML(this.example as HTMLDivElement);
          (this.example as HTMLDivElement).className = "inline-katex mt-3";
          (this.example as HTMLDivElement).style.cssText = "";
          renderMathInline(this.example as HTMLDivElement,this.equation);
        }
      }
    }.bind(mathDialog);
    MATH_DEBOUNCER = setTimeout(updateMathPreview,250);
  }
}

function handleMathDialogSubmit(this:HTMLFormElement,e:Event) {
  e.preventDefault();
  const mathDialog = getMathDialog();
  const editor = getCurrentEditor();
  if(mathDialog && editor && mathDialog.dialog) {
    editor.dispatchCommand(INSERT_MATH_COMMAND,{ equation: mathDialog.equation, inline: !!!mathDialog.displayStyle });
    closeDialog(mathDialog.dialog);
    if(mathDialog.example){
      clearInnerHTML(mathDialog.example);
      mathDialog.example.className="";
      mathDialog.example.style.cssText = "";
    }
    this.reset();
  } 
}

function getOnOpenMathDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  if (e.detail.el.id==="math-markup-lexical") {
    const dialog = document.getElementById('math-markup-lexical');
    if (dialog) {
      const mathDialog = getMathDialog();
      if (mathDialog && mathDialog.form) {
        mathDialog.form.addEventListener('submit',handleMathDialogSubmit);
        mathDialog.form.addEventListener('change',handleMathDialogChange);
        mathDialog.form.addEventListener('input',handleMathDialogChange);
      }
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
  }
}

export function registerMathEditable(editor:LexicalEditor) {
  if (editor.hasNode(MathNode)) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenMathDialog);
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (payload) => {
          const decorators = editor.getDecorators();
          for (let key of Object.keys(decorators)){
            const node = $getNodeByKey(key)
            if ($isMathNode(node) && node.getEditable()) node.setEditable(false);
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ), 
      editor.registerCommand(
        INSERT_MATH_COMMAND,
        (payload) => {
          const { equation, inline } = payload;
          const mathNode = $createMathNode(equation,inline);
          const paragraphNode = $createParagraphNode();
          $insertNodes([mathNode,paragraphNode]);
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (e) => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&selection.isCollapsed()) {
            const nodes = selection.getNodes();
            if (nodes.length) {
              const node = nodes[0];
              if (node) {
                const para =$findMatchingParent(node,(n) => $isParagraphNode(n));
                if ($isParagraphNode(para)) {
                  const textContent = para.getTextContent();
                  if (textContent.trim()==="$$") {
                    var currNode = para.getPreviousSibling();
                    const nodesToReplace = [para];
                    var continueLookingUp = true;
                    var katexExpression = '';
                    var insertMathBlock = false;
                    while (continueLookingUp) {
                      if (!!!$isParagraphNode(currNode)) break;
                      else {
                        const text = currNode.getTextContent();
                        if (/\$\$/.test(text.trim())) {
                          insertMathBlock = true;
                          nodesToReplace.push(currNode);
                          continueLookingUp = false;
                          break;
                        } else {
                          katexExpression = currNode.getTextContent() + ' ' + katexExpression;
                          nodesToReplace.push(currNode);
                          currNode = currNode.getPreviousSibling();
                          continue;
                        }
                      }
                    }
                    if (insertMathBlock) {
                      nodesToReplace.forEach((node) => node.remove(false));
                      const mathNode = $createMathNode(katexExpression,false);
                      $insertNodeToNearestRoot(mathNode);
                      return true;
                    }
                  }
                }
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      registerMathNotEditable(editor)
    );
  } else {
    console.error("Editor does not have MathNode registered.");
  }
  return () => {return};
}

export function registerMathNotEditable(editor:LexicalEditor) {
  if (editor.hasNode(MathNode)) {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        editor.update(() => {
          const mathNodes = $nodesOfType(MathNode);
          if (!!!editable) {
            mathNodes.forEach((node) => {
              node.setEditable(false);
            })
          }
        })
      }),
      editor.registerCommand(
        UPDATE_ON_SET_HTML,
        () => {
          const mathNodes = $nodesOfType(MathNode);
          mathNodes.forEach((node) => {
            if (node.getEditable()) node.setEditable(false);
          })
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),      
    ) 
  } else {
    console.error("Editor does not have MathNode registered.");
  }
  return () => {return};
}