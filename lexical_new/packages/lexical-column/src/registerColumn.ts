import type {ElementNode, LexicalCommand, LexicalEditor, LexicalNode, NodeKey} from 'lexical';
import {
  $findMatchingParent,
  $insertNodeToNearestRoot,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
} from 'lexical';
import {
  $createLayoutContainerNode,
  $isLayoutContainerNode,
  LayoutContainerNode,
} from './LayoutContainerNode';
import {
  $createLayoutItemNode,
  $isLayoutItemNode,
  LayoutItemNode,
} from './LayoutItemNode';
import { closeDialog, getCurrentEditor, OPEN_DIALOG_FINAL_CED, OPEN_LEXICAL_DIALOG_FINAL_CED } from '@lexical/shared';

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand<string>();
export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{template: string;nodeKey: NodeKey;}> = createCommand<{template: string; nodeKey: NodeKey}>();

function getItemsCountFromTemplate(template: string): number {
  return template.trim().split(/\s+/).length;
}
const ValidColumnValues = new Set([
  "2-1",
  "2-2",
  "3-1",
  "3-2",
  "4"
])
const LAYOUTS = {
  "2-1": {label: '2 columns (equal width)', value: '1fr 1fr'},
  "2-2": {label: '2 columns (25% - 75%)', value: '1fr 3fr'},
  "3-1": {label: '3 columns (equal width)', value: '1fr 1fr 1fr'},
  "3-2": {label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr'},
  "4": {label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr'},
};

function handleSubmitColumnLayout(this:HTMLFormElement,e:SubmitEvent) {
  e.preventDefault();
  e.stopPropagation();
  const dialog = this.closest<HTMLDivElement>('div.dialog-wrapper');
  const colInput = document.getElementById('ins-col-lex-input') as HTMLInputElement|null;
  if (dialog&&colInput) {
    const val = colInput.value;
    if (ValidColumnValues.has(val)) {
      const layout = LAYOUTS[val as keyof typeof LAYOUTS];
      if (layout) {
        const editor = getCurrentEditor();
        if (editor) editor.dispatchCommand(INSERT_LAYOUT_COMMAND,layout.value);
      }
    }
    closeDialog(dialog);
  }
}
function getOnOpenColumnDialog(e:CustomEvent<OPEN_LEXICAL_DIALOG_FINAL_CED>) {
  const columnDialog = document.getElementById('column-layout-lexical');
  if (columnDialog) {
    const form = columnDialog.querySelector('form');
    if (form) {
      form.addEventListener('submit',handleSubmitColumnLayout)
    }
    document.dispatchEvent(new CustomEvent<OPEN_DIALOG_FINAL_CED>('OPEN_DIALOG_FINAL',{ detail: { dialog: columnDialog as HTMLDivElement }}));
  }
}
export function registerLayoutEditable(editor:LexicalEditor) {
  if (editor.hasNodes([LayoutContainerNode,LayoutItemNode])) {
    const $onEscape = (before: boolean) => {
      const selection = $getSelection();
      if (
        $isRangeSelection(selection) &&
        selection.isCollapsed() &&
        selection.anchor.offset === 0
      ) {
        const container = $findMatchingParent(
          selection.anchor.getNode(),
          $isLayoutContainerNode,
        );

        if ($isLayoutContainerNode(container)) {
          const parent = container.getParent<ElementNode>();
          const child =
            parent &&
            (before
              ? parent.getFirstChild<LexicalNode>()
              : parent?.getLastChild<LexicalNode>());
          const descendant = before
            ? container.getFirstDescendant<LexicalNode>()?.getKey()
            : container.getLastDescendant<LexicalNode>()?.getKey();

          if (
            parent !== null &&
            child === container &&
            selection.anchor.key === descendant
          ) {
            if (before) {
              container.insertBefore($createParagraphNode());
            } else {
              container.insertAfter($createParagraphNode());
            }
          }
        }
      }

      return false;
    };
    document.addEventListener<any>('OPEN_LEXICAL_DIALOG_FINAL',getOnOpenColumnDialog)
    
    return mergeRegister(
      // When layout is the last child pressing down/right arrow will insert paragraph
      // below it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if trailing paragraph is accidentally deleted
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => $onEscape(false),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        () => $onEscape(false),
        COMMAND_PRIORITY_LOW,
      ),
      // When layout is the first child pressing up/left arrow will insert paragraph
      // above it to allow adding more content. It's similar what $insertBlockNode
      // (mainly for decorators), except it'll always be possible to continue adding
      // new content even if leading paragraph is accidentally deleted
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => $onEscape(true),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        () => $onEscape(true),
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_LAYOUT_COMMAND,
        (template) => {
          editor.update(() => {
            const container = $createLayoutContainerNode(template);
            const itemsCount = getItemsCountFromTemplate(template);

            for (let i = 0; i < itemsCount; i++) {
              container.append(
                $createLayoutItemNode().append($createParagraphNode()),
              );
            }

            $insertNodeToNearestRoot(container);
            container.selectStart();
          });

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        UPDATE_LAYOUT_COMMAND,
        ({template, nodeKey}) => {
          editor.update(() => {
            const container = $getNodeByKey<LexicalNode>(nodeKey);

            if (!$isLayoutContainerNode(container)) {
              return;
            }

            const itemsCount = getItemsCountFromTemplate(template);
            const prevItemsCount = getItemsCountFromTemplate(
              container.getTemplateColumns(),
            );

            // Add or remove extra columns if new template does not match existing one
            if (itemsCount > prevItemsCount) {
              for (let i = prevItemsCount; i < itemsCount; i++) {
                container.append(
                  $createLayoutItemNode().append($createParagraphNode()),
                );
              }
            } else if (itemsCount < prevItemsCount) {
              for (let i = prevItemsCount - 1; i >= itemsCount; i--) {
                const layoutItem = container.getChildAtIndex<LexicalNode>(i);

                if ($isLayoutItemNode(layoutItem)) {
                  layoutItem.remove();
                }
              }
            }

            container.setTemplateColumns(template);
          });

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      // Structure enforcing transformers for each node type. In case nesting structure is not
      // "Container > Item" it'll unwrap nodes and convert it back
      // to regular content.
      editor.registerNodeTransform(LayoutItemNode, (node) => {
        const parent = node.getParent<ElementNode>();
        if (!$isLayoutContainerNode(parent)) {
          const children = node.getChildren<LexicalNode>();
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      }),
      editor.registerNodeTransform(LayoutContainerNode, (node) => {
        const children = node.getChildren<LexicalNode>();
        if (!children.every($isLayoutItemNode)) {
          for (const child of children) {
            node.insertBefore(child);
          }
          node.remove();
        }
      })
    );

  } else {
    console.error("Editor doesn;t have LayoutContainerNode or LayoutItemNode registered.")
  }
  return () => {}
}