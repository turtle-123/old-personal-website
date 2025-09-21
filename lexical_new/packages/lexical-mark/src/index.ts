/** @module @lexical/mark */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {MarkNodeClassType, SerializedMarkNode} from './MarkNode';
import {LexicalNode, RangeSelection, TextNode, LexicalEditor, $createTextNode, LexicalCommand} from 'lexical';

import {$getSelection, $isElementNode, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_EDITOR, createCommand} from 'lexical';

import {$createMarkNode, $isMarkNode, MarkNode} from './MarkNode';
import { $dfs, registerNestedElementResolver, mergeRegister, $findMatchingParent } from '@lexical/utils';

const getMarkId = () => 'mark_'.concat(Math.random().toString().slice(2));

/**
 * I think this function removes the mark node from the dom while keeping the inner content in tact
 * @param node {MarkNode}
 */
export function $unwrapMarkNode(node: MarkNode): void {
  const children = node.getChildren();
  let target = null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (target === null) {
      node.insertBefore(child);
    } else {
      target.insertAfter(child);
    }
    target = child;
  }
  node.remove();
}

export function $wrapSelectionInMarkNode(
  selection: RangeSelection,
  isBackward: boolean,
  id: string,
  markClass: MarkNodeClassType,
  createNode?: (ids: Array<string>,markClass: MarkNodeClassType) => MarkNode,
): void {
  const nodes = selection.getNodes();
  const anchorOffset = selection.anchor.offset;
  const focusOffset = selection.focus.offset;
  const nodesLength = nodes.length;
  const startOffset = isBackward ? focusOffset : anchorOffset;
  const endOffset = isBackward ? anchorOffset : focusOffset;
  let currentNodeParent;
  let lastCreatedMarkNode;

  // We only want wrap adjacent text nodes, line break nodes
  // and inline element nodes. For decorator nodes and block
  // element nodes, we step out of their boundary and start
  // again after, if there are more nodes.
  for (let i = 0; i < nodesLength; i++) {
    const node = nodes[i];
    if (
      $isElementNode(lastCreatedMarkNode) &&
      lastCreatedMarkNode.isParentOf(node)
    ) {
      // If the current node is a child of the last created mark node, there is nothing to do here
      continue;
    }
    const isFirstNode = i === 0;
    const isLastNode = i === nodesLength - 1;
    let targetNode: LexicalNode | null = null;

    if ($isTextNode(node)) {
      // Case 1: The node is a text node and we can split it
      const textContentSize = node.getTextContentSize();
      const startTextOffset = isFirstNode ? startOffset : 0;
      const endTextOffset = isLastNode ? endOffset : textContentSize;
      if (startTextOffset === 0 && endTextOffset === 0) {
        continue;
      }
      const splitNodes = node.splitText(startTextOffset, endTextOffset);
      targetNode =
        splitNodes.length > 1 &&
        (splitNodes.length === 3 ||
          (isFirstNode && !isLastNode) ||
          endTextOffset === textContentSize)
          ? splitNodes[1]
          : splitNodes[0];
    } else if ($isMarkNode(node)) {
      // Case 2: the node is a mark node and we can ignore it as a target,
      // moving on to its children. Note that when we make a mark inside
      // another mark, it may utlimately be unnested by a call to
      // `registerNestedElementResolver<MarkNode>` somewhere else in the
      // codebase.

      continue;
    } else if ($isElementNode(node) && node.isInline()) {
      // Case 3: inline element nodes can be added in their entirety to the new
      // mark
      targetNode = node;
    }

    if (targetNode !== null) {
      // Now that we have a target node for wrapping with a mark, we can run
      // through special cases.
      if (targetNode && targetNode.is(currentNodeParent)) {
        // The current node is a child of the target node to be wrapped, there
        // is nothing to do here.
        continue;
      }
      const parentNode = targetNode.getParent();
      if (parentNode == null || !parentNode.is(currentNodeParent)) {
        // If the parent node is not the current node's parent node, we can
        // clear the last created mark node.
        lastCreatedMarkNode = undefined;
      }

      currentNodeParent = parentNode;

      if (lastCreatedMarkNode === undefined) {
        // If we don't have a created mark node, we can make one
        const createMarkNode = createNode || $createMarkNode;
        lastCreatedMarkNode = createMarkNode([id],markClass);
        targetNode.insertBefore(lastCreatedMarkNode);
      }

      // Add the target node to be wrapped in the latest created mark node
      lastCreatedMarkNode.append(targetNode);
    } else {
      // If we don't have a target node to wrap we can clear our state and
      // continue on with the next node
      currentNodeParent = undefined;
      lastCreatedMarkNode = undefined;
    }
  }
  // Make selection collapsed at the end
  if ($isElementNode(lastCreatedMarkNode)) {
    // eslint-disable-next-line no-unused-expressions
    isBackward
      ? lastCreatedMarkNode.selectStart()
      : lastCreatedMarkNode.selectEnd();
  }
}

export function $getMarkIDs(
  node: TextNode,
  offset: number,
): null | Array<string> {
  let currentNode: LexicalNode | null = node;
  while (currentNode !== null) {
    if ($isMarkNode(currentNode)) {
      return currentNode.getIDs();
    } else if (
      $isTextNode(currentNode) &&
      offset === currentNode.getTextContentSize()
    ) {
      const nextSibling = currentNode.getNextSibling();
      if ($isMarkNode(nextSibling)) {
        return nextSibling.getIDs();
      }
    }
    currentNode = currentNode.getParent();
  }
  return null;
}

function cloneMarkNode(node: MarkNode): MarkNode {
  return new MarkNode(Array.from(node.__ids), node.__key,node.__markClass);
}


function $removeMarkNodesInSelection(selection: RangeSelection) {
  const nodes = selection.getNodes();
  for (let node of nodes) {
    var MARK_NODE:undefined|MarkNode;
    if ($isMarkNode(node)) {
      MARK_NODE = node;
    } else if ($isMarkNode(node.getParent())) {
      MARK_NODE = node.getParent() as MarkNode;
    }
    if (MARK_NODE) $unwrapMarkNode(MARK_NODE as MarkNode);
    const descendants = $dfs(node);
    for (let descendant of descendants) {
      if ($isMarkNode(descendant.node)) {
        $unwrapMarkNode(descendant.node.getWritable());
      }
    }
  }
}


/**
 * Function to call when the fieldset for selecting the mark node type / removing mark node changes
 * @param param0 
 * @returns 
 */
function $handleMarkNodes({ selection, type }:{type: MarkNodeClassType|'none', selection: RangeSelection}) {
  if($isRangeSelection(selection)){
    const IS_COLLAPSED = selection.isCollapsed();
    if (IS_COLLAPSED) {
      const nodes = selection.getNodes();
      if (nodes.length){
        const markNode = $findMatchingParent(nodes[0],(node) => $isMarkNode(node)) as MarkNode|null;
        if (markNode) {
          $unwrapMarkNode(markNode);
        }
      }
    } else {
      if (type==='none'){
        $removeMarkNodesInSelection(selection);
      } else {
        if ($isRangeSelection(selection)){
          $wrapSelectionInMarkNode(selection,selection.isBackward(),getMarkId(),type);
        }
      }
    }
  }
}

const ALLOWED_MARKS = new Set([
  'none',
  'normal',
  'primary',
  'secondary',
  'error',
  'info',
  'success',
  'warning'
] as const);

function getHandleInsertMarkNode(editor:LexicalEditor) {
  /**
   * 
   * @param {Event} e Change Event that is intercepted by the fieldset
   * @this {HTMLFieldsetElement}
   */
  const handleInsertMarkNode = function (this:HTMLFieldSetElement,e:Event){
    const val =( e?.target as HTMLInputElement)?.value;
    if (ALLOWED_MARKS.has(val as any)) {
      editor.update(() => {
        const selection = $getSelection();
        if($isRangeSelection(selection)) {
          $handleMarkNodes({selection, type: val as MarkNodeClassType});
        }
      })
    }
    
  }
  return handleInsertMarkNode;
}


/**
 * Registering nested element resolver for mark nodes so they are not nested within each other 
 * as see [here](https://github.com/facebook/lexical/blob/dcff8ae5afb7c0c2f4c157d209f3a1f2f108fe73/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx#L827C7-L837C18)
 * 
 * @param editor 
 */
function registerMarkNodes(editor:LexicalEditor) {
  
  if (editor.hasNode(MarkNode)) {
    const wrapper = document.getElementById(editor._config.namespace) || editor._rootElement?.closest('div.lexical-wrapper');
    if(wrapper){
      // Handle with registerMarkNodes
      const highlight_input = wrapper.querySelector('fieldset[data-lexical-highlight]');
      if (highlight_input) highlight_input.addEventListener('change',getHandleInsertMarkNode(editor));
      
    }
    return mergeRegister(
      registerNestedElementResolver<MarkNode>(
        editor,
        MarkNode,
        (from: MarkNode) => $createMarkNode(from.getIDs()),
        (from: MarkNode, to: MarkNode) => {
          const ids = from.getIDs();
          ids.forEach((id) => {
            to.addID(id);
          });
        }
      )
    );
  } else {
    console.error("Editor does not have MarkNode registered.");
  }
  return () => {return};  
}

export {$createMarkNode, $isMarkNode, MarkNode, SerializedMarkNode, $handleMarkNodes, MarkNodeClassType, registerMarkNodes };
