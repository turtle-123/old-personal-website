import type {
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from 'lexical';
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_BACKSPACE_COMMAND,
  $isParagraphNode,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ENTER_COMMAND,
  $getPreviousSelection,
  $getRoot,
  $getNodeByKey
} from 'lexical';
import { 
  $createDetailsNode,
  $isDetailsNode ,
  DetailsNode
} from './DetailsNode';
import { 
  $createAccordionContentNode,
  AccordionContentNode,
  $isAccordionContentNode 
} from './AccordionContentNode';
import { 
  getCurrentEditor, 
  closeDialog, 
  OPEN_LEXICAL_DIALOG_FINAL_CED,
  OPEN_DIALOG_FINAL_CED
} from '@lexical/shared';

export const INSERT_DETAILS_COMMAND:LexicalCommand<{flat: boolean, summary: string}> = createCommand('INSERT_DETAILS_COMMAND');
var DETAILS_SELECTION_NODE_AFTER:null|NodeKey = null;


function getDetailsForm() {
  const detailsForm = document.getElementById('lexical-insert-details-form') as HTMLFormElement|null;
  const dialog = document.getElementById('details-content-lexical') as HTMLDivElement|null;
  if (detailsForm && dialog) {
    const summary = detailsForm.querySelector<HTMLInputElement>('input[id="lexical-details-summary-title"]');
    const flat = detailsForm.querySelector<HTMLInputElement>('input[id="lexical-insert-details-flat"]');
    const outputSpan = dialog.querySelector<HTMLSpanElement>('span[data-output]');
    const outputDetails = dialog.querySelector<HTMLDetailsElement>('details[data-output]');
    return {
      form: detailsForm,
      dialog,
      summary: summary ? summary.value : null,
      flat: Boolean(flat?.checked===true),
      outputSpan,
      outputDetails,
      summaryEl: summary
    }
  } else return null;
}
function handleDetailsFormChange(e:Event) {
  e.stopPropagation();
  const form = getDetailsForm();
  if (form) {
    if (form.summary && form.outputSpan) form.outputSpan.innerText=form.summary;
    if (form.outputDetails) {
      form.outputDetails.classList.add('rte');
      if (form.flat) form.outputDetails.classList.add('flat');
      else form.outputDetails.classList.remove('flat');
    }
  }
}

function handleDetailsFormSubmit(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const form = getDetailsForm();
  const editor = getCurrentEditor();
  if (form&&form.summary&&editor) {
    editor.dispatchCommand(INSERT_DETAILS_COMMAND,{ summary:form.summary, flat: form.flat });
    closeDialog(form.dialog);
  }
}
function setDetailsForm() {
  const detailsForm = getDetailsForm()
  if (detailsForm&&detailsForm) {
    detailsForm.form.addEventListener('change',handleDetailsFormChange);
    if(detailsForm.summaryEl)detailsForm.summaryEl.addEventListener('input',handleDetailsFormChange);
    detailsForm.form.addEventListener('submit',handleDetailsFormSubmit);
  }
}

function getOnOpenDetailsDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
    if (e.detail.el.id==="details-content-lexical") {
      const editor = getCurrentEditor();
      if (editor) {
        editor.getEditorState().read(() => {
          const node = $getSelection()?.getNodes()?.[0];
          if (node) {
            DETAILS_SELECTION_NODE_AFTER = node.getKey();
          }
        })
      }
      setDetailsForm();
      const dialog = document.getElementById('details-content-lexical');
      if (dialog) document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: dialog as HTMLDivElement }}));
    }
  }
  

export function registerDetailsElementEditable(editor:LexicalEditor) {
  if (editor.hasNodes([DetailsNode,AccordionContentNode])) {
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenDetailsDialog);
    return mergeRegister(
      editor.registerCommand(
        INSERT_DETAILS_COMMAND,
        (payload) => {
          if (DETAILS_SELECTION_NODE_AFTER) {
            const anchorNode = $getNodeByKey(DETAILS_SELECTION_NODE_AFTER);
            if (!!!anchorNode) {
              const root = $getRoot();
              root.append($createDetailsNode({ ...payload }).append($createAccordionContentNode().append($createParagraphNode())));
            } else {
              const nearestNodeBelowRoot = $findMatchingParent(anchorNode,(node)=>$isElementNode(node) && $isRootNode(node.getParent()));
              if (nearestNodeBelowRoot) {
                const detailsNode = $createDetailsNode({ ...payload }).append($createAccordionContentNode().append($createParagraphNode()));
                nearestNodeBelowRoot.insertAfter(detailsNode);
              }
            }
          } else {
            const root = $getRoot();
            root.append($createDetailsNode({ ...payload }).append($createAccordionContentNode().append($createParagraphNode())));
          }
          DETAILS_SELECTION_NODE_AFTER = null;
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&selection.isCollapsed()&&editor.isEditable()) {
            const anchor = selection.anchor.getNode();
            const paragraphNode = $findMatchingParent(anchor, node => $isParagraphNode(node) && $isAccordionContentNode(node.getParent()));
            if (paragraphNode) {
              const accordionContent = paragraphNode.getParent() as AccordionContentNode;
              const firstChild = accordionContent.getFirstChild();
              const details = accordionContent.getParent();
              if (
                firstChild &&
                firstChild.is(paragraphNode) &&
                selection.is(paragraphNode.selectStart()) && 
                $isDetailsNode(details) && 
                details.getPreviousSibling()===null
                ) {
                const p = $createParagraphNode();
                (details as DetailsNode).insertBefore(p);
                p.selectEnd();
                return true;
              }
            } 
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)&&selection.isCollapsed()&&editor.isEditable()) {
            const anchor = selection.anchor.getNode();
            const paragraphNode = $findMatchingParent(anchor, node => $isParagraphNode(node) && $isAccordionContentNode(node.getParent()));
            if (paragraphNode) {
              const accordionContent = paragraphNode.getParent() as AccordionContentNode;
              const details = accordionContent.getParent();
              const lastChild = accordionContent.getLastChild();
              const previousChild = lastChild?.getPreviousSibling();
              if (accordionContent.getChildrenSize() >=3 && 
              $isParagraphNode(lastChild) && 
              $isParagraphNode(previousChild) && 
              lastChild.isEmpty() && 
              previousChild.isEmpty() &&
              $isDetailsNode(details)
              ) {
                lastChild.remove();
                previousChild.remove();
                const p = $createParagraphNode();
                details.insertAfter(p);
                p.selectEnd();
                return true;
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (e) => {
          const selection=$getSelection();
          if($isRangeSelection(selection)&&selection.isCollapsed()){
            const nodes = selection.getNodes();
            if (nodes.length) {
              const node = nodes[0];
              if (node) {
                const para = node.getParent();
                if ($isParagraphNode(para)) {
                  const textContent = para.getTextContent();
                  if (/^\^.*\^([flat])?$/.test(textContent)) {
                    var title = textContent;
                    const flat = title.endsWith('[flat]');
                    if (flat) {
                      title = title.slice(1,title.length-7);
                    } else {
                      title = title.slice(1,title.length-1);
                    }
                    para.remove();
                    editor.dispatchCommand(INSERT_DETAILS_COMMAND,{ summary: title, flat });
                    return true;
                  }
                }
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      ),
      registerDetailsElementNotEdiable(editor)
    );
  } else {
    console.error("Editor does not have DetailsNode or AccordionContentNode registered.");
  }
  return () => {return};  
}

export function registerDetailsElementNotEdiable(editor:LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)&&selection.isCollapsed()&&editor.isEditable()) {
          const anchor = selection.anchor.getNode();
          const paragraphNode = $findMatchingParent(anchor, node => $isParagraphNode(node) && $isAccordionContentNode(node.getParent()));
          if (paragraphNode) {
            const accordionContent = paragraphNode.getParent() as AccordionContentNode;
            const lastChild = accordionContent.getLastChild();
            const details = accordionContent.getParent();
            
            if (
              lastChild &&
              lastChild.is(paragraphNode) &&
              selection.is(paragraphNode.selectEnd()) && 
              $isDetailsNode(details) && 
              details.getNextSibling()===null
              ) {
              const p = $createParagraphNode();
              (details as DetailsNode).insertAfter(p);
              p.selectEnd();
              return true;
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    ),
  );
}