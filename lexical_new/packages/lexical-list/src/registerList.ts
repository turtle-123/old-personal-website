import { 
  LexicalCommand, 
  LexicalEditor, 
  INSERT_PARAGRAPH_COMMAND,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_CRITICAL,
  INDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  KEY_TAB_COMMAND,
  $getRoot,
  $createParagraphNode,
  $createTabNode,
  $isTextNode,
  $isParagraphNode,
  INSERT_TAB_COMMAND,
  $setSelection,
  KEY_SPACE_COMMAND,
  LexicalNode,
  ElementNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $isElementNode,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ARROW_DOWN_COMMAND,
  COMMAND_PRIORITY_EDITOR
} from "lexical";
import { 
  mergeRegister,
  getElementNodesInSelection,
  isHTMLElement,
  $findMatchingParent,
  
} from "@lexical/utils";
import { 
  INSERT_UNORDERED_LIST_COMMAND, 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  insertList,
  $handleListInsertParagraph,
  removeList,
  REMOVE_LIST_COMMAND,
  $isListNode,
  $isListItemNode,
  $getListDepth,
  $createListNode,
  ListNode,
  ListItemNode
} from ".";
import { isTouchDevice, calculateZoomLevel, REGISTER_TOOLBAR_LISTENERS } from "@lexical/shared";

function getDispatchLexicalCommand(editor:LexicalEditor,command:LexicalCommand<any>) {
  const deploy = function() {
    editor.dispatchCommand(command,undefined);
  }
  return deploy;
}
/**
 * 
 * @param {number} maxDepth 
 * @returns {boolean} Whether or not the indent is permitted
 */
function isIndentPermitted(maxDepth: number) {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;
  const elementNodesInSelection=getElementNodesInSelection(selection);
  let totalDepth = 0;
  for (const elementNode of elementNodesInSelection) {
    if ($isListNode(elementNode)) {
      totalDepth = Math.max($getListDepth(elementNode) + 1, totalDepth);
    } else if ($isListItemNode(elementNode)) {
      const parent = elementNode.getParent();
      if (!$isListNode(parent)) {
        console.error('ListMaxIndentLevelPlugin: A ListItemNode must have a ListNode for a parent.');
        return false;
      }
      totalDepth = Math.max($getListDepth(parent) + 1, totalDepth);
    }
  }
  return totalDepth <= maxDepth;
}
/* From Lexical Check ListPlugin */ 

function handleCheckItemEvent(event: PointerEvent, callback: () => void) {
  const target = event.target;

  if (target === null || !isHTMLElement(target)) {
    return;
  }

  // Ignore clicks on LI that have nested lists
  const firstChild = target.firstChild;

  if (
    firstChild != null &&
    isHTMLElement(firstChild) &&
    (firstChild.tagName === 'UL' || firstChild.tagName === 'OL')
  ) {
    return;
  }

  const parentNode = target.parentNode;

  // @ts-ignore internal field
  if (!parentNode || parentNode.__lexicalListType !== 'check') {
    return;
  }

  const rect = target.getBoundingClientRect();
  

  const pageX = event.pageX / calculateZoomLevel(target);
  if (
    target.dir === 'rtl'
      ? pageX < rect.right && pageX > rect.right - 20
      : pageX < rect.left && pageX > rect.left - 20
  ) {
    callback();
  }
}

function handleClick(event: Event) {
  handleCheckItemEvent(event as PointerEvent, () => {
    const domNode = event.target as HTMLElement;
    const editor = findEditor(domNode);

    if (editor != null && editor.isEditable()) {
      editor.update(() => {
        if (event.target) {
          const node = $getNearestNodeFromDOMNode(domNode);

          if ($isListItemNode(node)) {
            domNode.focus();
            node.toggleChecked();
          }
        }
      });
    }
  });
}

function handlePointerDown(event: PointerEvent) {
  handleCheckItemEvent(event, () => {
    // Prevents caret moving when clicking on check mark
    event.preventDefault();
  });
}

function findEditor(target: Node) {
  let node: ParentNode | Node | null = target;

  while (node) {
    // @ts-ignore internal field
    if (node.__lexicalEditor) {
      // @ts-ignore internal field
      return node.__lexicalEditor;
    }

    node = node.parentNode;
  }

  return null;
}

function getActiveCheckListItem(): HTMLElement | null {
  const activeElement = document.activeElement as HTMLElement;

  return activeElement != null &&
    activeElement.tagName === 'LI' &&
    activeElement.parentNode != null &&
    // @ts-ignore internal field
    activeElement.parentNode.__lexicalListType === 'check'
    ? activeElement
    : null;
}

function findCheckListItemSibling(
  node: ListItemNode,
  backward: boolean,
): ListItemNode | null {
  let sibling = backward ? node.getPreviousSibling() : node.getNextSibling();
  let parent: ListItemNode | null = node;

  // Going up in a tree to get non-null sibling
  while (sibling == null && $isListItemNode(parent)) {
    // Get li -> parent ul/ol -> parent li
    parent = parent.getParentOrThrow().getParent();

    if (parent != null) {
      sibling = backward
        ? parent.getPreviousSibling()
        : parent.getNextSibling();
    }
  }

  // Going down in a tree to get first non-nested list item
  while ($isListItemNode(sibling)) {
    const firstChild = backward
      ? sibling.getLastChild()
      : sibling.getFirstChild();

    if (!$isListNode(firstChild)) {
      return sibling;
    }

    sibling = backward ? firstChild.getLastChild() : firstChild.getFirstChild();
  }

  return null;
}

function handleArrownUpOrDown(
  event: KeyboardEvent,
  editor: LexicalEditor,
  backward: boolean,
) {
  const activeItem = getActiveCheckListItem();

  if (activeItem != null) {
    editor.update(() => {
      const listItem = $getNearestNodeFromDOMNode(activeItem);

      if (!$isListItemNode(listItem)) {
        return;
      }

      const nextListItem = findCheckListItemSibling(listItem, backward);

      if (nextListItem != null) {
        nextListItem.selectStart();
        const dom = editor.getElementByKey(nextListItem.__key);

        if (dom != null) {
          event.preventDefault();
          setTimeout(() => {
            dom.focus();
          }, 0);
        }
      }
    });
  }

  return false;
}
function registerListListeners(editor:LexicalEditor) {
  const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if (wrapper) {
      const insertUnorderedListButton = wrapper.querySelector('button[data-dispatch="INSERT_UNORDERED_LIST_COMMAND"]');
      const insertOrderListButton = wrapper.querySelector('button[data-dispatch="INSERT_ORDERED_LIST_COMMAND"]');
      const insertCheckListButton = wrapper.querySelector('button[data-dispatch="INSERT_CHECK_LIST_COMMAND"]');
      if (insertOrderListButton){
        const dataMouseDown = insertOrderListButton.getAttribute('data-mouse-down');
        if (dataMouseDown!==null) {
          if(!!!isTouchDevice())insertOrderListButton.addEventListener('mousedown',getDispatchLexicalCommand(editor,INSERT_ORDERED_LIST_COMMAND));
          else insertOrderListButton.addEventListener('touchstart',getDispatchLexicalCommand(editor,INSERT_ORDERED_LIST_COMMAND));
        } else {
          insertOrderListButton.addEventListener('click',getDispatchLexicalCommand(editor,INSERT_ORDERED_LIST_COMMAND));
        }
      }
      if (insertUnorderedListButton){
        const dataMouseDown = insertUnorderedListButton.getAttribute('data-mouse-down');
        if (dataMouseDown!==null) {
          insertUnorderedListButton.addEventListener('mousedown',getDispatchLexicalCommand(editor,INSERT_UNORDERED_LIST_COMMAND));
          insertUnorderedListButton.addEventListener('touchstart',getDispatchLexicalCommand(editor,INSERT_UNORDERED_LIST_COMMAND));
        } else {
          insertUnorderedListButton.addEventListener('click',getDispatchLexicalCommand(editor,INSERT_UNORDERED_LIST_COMMAND));
        }
      }
      if (insertCheckListButton){
        const dataMouseDown = insertCheckListButton.getAttribute('data-mouse-down');
        if (dataMouseDown!==null) {
          if(!!!isTouchDevice())insertCheckListButton.addEventListener('mousedown',getDispatchLexicalCommand(editor,INSERT_CHECK_LIST_COMMAND));
          else insertCheckListButton.addEventListener('touchstart',getDispatchLexicalCommand(editor,INSERT_CHECK_LIST_COMMAND));
        } else {
          insertCheckListButton.addEventListener('click',getDispatchLexicalCommand(editor,INSERT_CHECK_LIST_COMMAND));
        }
      }
    }
}
export function registerListEditable(editor:LexicalEditor,maxIndent=5) {
  if (editor.hasNodes([ListNode,ListItemNode])) {
    registerListListeners(editor);
    return mergeRegister(
      editor.registerCommand(
        INSERT_ORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'number');
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_UNORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'bullet');
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_CHECK_LIST_COMMAND,
        () => {
          insertList(editor,'check');
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        REMOVE_LIST_COMMAND,
        () => {
          removeList(editor);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const hasHandledInsertParagraph = $handleListInsertParagraph();
          if (hasHandledInsertParagraph) return true;
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        INDENT_CONTENT_COMMAND,
        () => !!!isIndentPermitted(maxIndent),
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (e) => {
          const selection = $getSelection();
          const DISABLE_DEFAULT_TAB_INPUT = document.getElementById('disabled-default-tab') as HTMLInputElement;
          if (DISABLE_DEFAULT_TAB_INPUT) {
            if (DISABLE_DEFAULT_TAB_INPUT.checked) {
              e.preventDefault(); 
              e.stopPropagation();
              const root = $getRoot();
              /**
               * If press tab and editor is empty, insert an indented (with tab),
               * paragraph
               */
              if (root&&root.isEmpty()) {
                root.append($createParagraphNode().append($createTabNode()));
                $setSelection(root.selectEnd());
                return true;
              } else if($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                const IS_COLLAPSED = selection.isCollapsed();
                if(IS_COLLAPSED){
                  const node = nodes[0];
                  if (!!!node) return false;
                  if ($isTextNode(node)){
                    const parent = node.getParentOrThrow();
                    if ($isListItemNode(parent)){
                      editor.dispatchCommand(INDENT_CONTENT_COMMAND,undefined);
                      return true;
                    } else if ($isParagraphNode(parent)) {
                      editor.dispatchCommand(INSERT_TAB_COMMAND,undefined);
                      return true;
                    }
                  } else if ($isListItemNode(node)) {
                    editor.dispatchCommand(INDENT_CONTENT_COMMAND,undefined);
                    return true;
                  } else if ($isParagraphNode(node)) {
                    const children = node.getChildren();
                    if (children.length===0) {
                      node.append($createTabNode());
                      return true;
                    }
                  }
                } 
              }
            } 
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          return handleArrownUpOrDown(event, editor, false);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          return handleArrownUpOrDown(event, editor, true);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        (event) => {
          const activeItem = getActiveCheckListItem();

          if (activeItem != null) {
            const rootElement = editor.getRootElement();

            if (rootElement != null) {
              rootElement.focus();
            }

            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_SPACE_COMMAND,
        (event) => {
          const activeItem = getActiveCheckListItem();

          if (activeItem != null && editor.isEditable()) {
            editor.update(() => {
              const listItemNode = $getNearestNodeFromDOMNode(activeItem);

              if ($isListItemNode(listItemNode)) {
                event.preventDefault();
                listItemNode.toggleChecked();
              }
            });
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_LEFT_COMMAND,
        (event) => {
          return editor.getEditorState().read(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection) && selection.isCollapsed()) {
              const {anchor} = selection;
              const isElement = anchor.type === 'element';

              if (isElement || anchor.offset === 0) {
                const anchorNode = anchor.getNode();
                const elementNode = $findMatchingParent(
                  anchorNode,
                  (node) => $isElementNode(node) && !node.isInline(),
                );
                if ($isListItemNode(elementNode)) {
                  const parent = elementNode.getParent();
                  if (
                    $isListNode(parent) &&
                    parent.getListType() === 'check' &&
                    (isElement ||
                      elementNode.getFirstDescendant() === anchorNode)
                  ) {
                    const domNode = editor.getElementByKey(elementNode.__key);

                    if (domNode != null && document.activeElement !== domNode) {
                      domNode.focus();
                      event.preventDefault();
                      return true;
                    }
                  }
                }
              }
            }

            return false;
          });
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerRootListener((rootElement, prevElement) => {
        if (rootElement !== null) {
          rootElement.addEventListener('click', handleClick,true);
          rootElement.addEventListener('pointerdown', handlePointerDown);
        }

        if (prevElement !== null) {
          prevElement.removeEventListener('click', handleClick);
          prevElement.removeEventListener('pointerdown', handlePointerDown);
        }
      }),
      editor.registerCommand(REGISTER_TOOLBAR_LISTENERS,() => {
        registerListListeners(editor);
        return false;
      },COMMAND_PRIORITY_EDITOR)
    );
  } else {
    console.error("ListNode or ListItemNode is not registered on the editor.");
  }
  return () => {return};  
}