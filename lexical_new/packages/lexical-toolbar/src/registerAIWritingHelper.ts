import { $isAtNodeEnd } from "@lexical/selection";
import { DISPATCH_SNACKBAR_CED, getCurrentEditor, getEditorInstances } from "@lexical/shared";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $getPreviousSelection, $getSelection, $isElementNode, $isRangeSelection, BLUR_COMMAND, COMMAND_PRIORITY_CRITICAL, createEditor, ElementNode, LexicalEditor, LexicalNode, NodeKey, SELECTION_CHANGE_COMMAND, SerializedLexicalNode } from "lexical";
import { closeAIWriterMenu, openAIWriterMenu } from ".";
import { $createLoadingNode, $isLoadingNode, LoadingNode } from "@lexical/decorators";
import { $generateNodesFromDOM } from "@lexical/html";
import { $convertToMarkdownString, FULL_EDITOR_TRANSFORMERS } from "@lexical/markdown";

const AI_WRITER_HELPER_STATE:{
  current_editor_id: string|null,
  timeout: NodeJS.Timeout|null
} = {
  current_editor_id: null,
  timeout: null
}

function getEnableAIWriter() {
  const input = document.getElementById('enable-ai-writer') as HTMLInputElement|null;
  if (input) {
    return input.checked;
  }
}

function openAIWriterHelper() {
  const editor = getCurrentEditor();
  const rewriteWithAI = document.getElementById('rewrite-with-ai-button') as HTMLButtonElement|null;
  const writeWithAI = document.getElementById('write-with-ai-button') as HTMLButtonElement|null;
  if (editor&&editor.isEditable()&&rewriteWithAI&&writeWithAI) {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      const domSelection = document.getSelection();
      const root = editor.getRootElement();
      if ($isRangeSelection(selection)&&selection.isCollapsed()&&domSelection&&root) {
        const anchor = selection.anchor;
        if ($isAtNodeEnd(anchor)) {
          rewriteWithAI.setAttribute('hidden','');
          writeWithAI.removeAttribute('hidden');
        } else {
          writeWithAI.setAttribute('hidden','');
          rewriteWithAI.removeAttribute('hidden');
        } 
        openAIWriterMenu();
      }
    }) 
  }
}

/* ----------------------------------------- WRITE / REWRITE WITH AI ---------------------------------- */ 
type AI_WRITING_STATE_TYPE = {
  type: 'write',
  editorID: string,
  nodes: NodeKey[], // node keys
  markdown: string
};
type AI_REWRITE_SELECTION_STATE_TYPE = {
  type: 'rewrite-selection',
  editorID: string,
  selectionNodes: NodeKey[], // Node Keys
  markdown: string
};
type AI_REWRITE_BLOCK_STATE_TYPE = {
  type: 'rewrite',
  editorID: string,
  nodesToReplace: NodeKey[], // Node Keys
  markdown: string 
}

const AI_WRITING_STATE:{[message_id: string]: AI_WRITING_STATE_TYPE|AI_REWRITE_BLOCK_STATE_TYPE|AI_REWRITE_SELECTION_STATE_TYPE } = {};
const EMPTY_PARA = {
  "children": [],
  "direction": null,
  "format": "left",
  "indent": 0,
  "type": "paragraph",
  "version": 1,
  "first_element": false,
  "blockStyle": {
   "textAlign": "left",
   "backgroundColor": "transparent",
   "textColor": "inherit",
   "margin": [
    "6px",
    "0px"
   ],
   "padding": "0px",
   "borderRadius": "0px",
   "borderColor": "transparent",
   "borderWidth": "0px",
   "borderType": "none",
   "boxShadowOffsetX": "0px",
   "boxShadowOffsetY": "0px",
   "boxShadowBlurRadius": "0px",
   "boxShadowSpreadRadius": "0px",
   "boxShadowInset": false,
   "boxShadowColor": "transparent"
  }
};
async function convertNodesToMarkdownString(nodeStates:SerializedLexicalNode[]) {
  const editorState = {
    "root": {
     "children": [] as any[],
     "direction": "ltr",
     "format": "",
     "indent": 0,
     "type": "root",
     "version": 1
    }
   }
  for (let nodeState of nodeStates) {
    editorState.root.children.push(nodeState);
  }
  if (!!!editorState.root.children.length) {
    editorState.root.children.push(EMPTY_PARA);
  }
  const str = await window.convertNodesToMarkdownString(editorState); 
  return str;
}
function exportJSONHelper(node:LexicalNode) {
  const json = node.exportJSON();
  if (!!!(json as any).children) {
    (json as any).children = [];
  }
  if (node.getChildren) {
    for (let child_node of node.getChildren()) {
      const child = exportJSONHelper(child_node);
      (json as any).children.push(child);
    } 
  }
  return json;
}
function $exportJSONWithChildren(node:LexicalNode):SerializedLexicalNode {
  const json = node.exportJSON();
  if (!!!(json as any).children) {
    (json as any).children = [];
  }
  if (node.getChildren) {
    for (let child_node of node.getChildren()) {
      const child = exportJSONHelper(child_node);
      (json as any).children.push(child);
    }
  }
  return json;
}


async function handleWriteWithAi(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const namespace = editor._config.namespace;
    try {
      const [markdownContextNodes,loadingNodeKey] = await new Promise<[SerializedLexicalNode[],NodeKey[]]>((resolve,reject) => {
        editor.update(() => {
          const selection = $getSelection() || $getPreviousSelection();
          if ($isRangeSelection(selection)) {
            const nodes = selection.getNodes();
            const node = nodes[nodes.length-1];
            var elementNode = $findMatchingParent(node,(n) => $isElementNode(n));
            if (elementNode) {              
              var markdown_context_nodes:LexicalNode[] = [];
              var curr_node = elementNode;
              while ($isElementNode(curr_node)) {
                markdown_context_nodes = ([curr_node] as LexicalNode[]).concat(markdown_context_nodes);
                curr_node = curr_node.getPreviousSibling() as LexicalNode;
              }
              const loadingNode = $createLoadingNode({ size: "small", inline: true });
              node.insertAfter(loadingNode);
              resolve([markdown_context_nodes.slice(-10).map($exportJSONWithChildren),[loadingNode.getKey()]])
            }
          }
        })
      });
      const markdownContext = await convertNodesToMarkdownString(markdownContextNodes);
      if (window.socket) {
        window.socket.on('ai-write',handleAIWriteResponse);
        window.socket.emit('ai-write',{ markdown_context: markdownContext, type: 'write' },({ error, message, message_id }:{ error: boolean, message: string, message_id: string }) => {
          if (error) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong writing with Artificial Intelligence." }}));
          } else {
            AI_WRITING_STATE[message_id] = {
              type: 'write',
              editorID: namespace,
              nodes: loadingNodeKey,
              markdown: '' 
            }
          }
        })
      }
    } catch (e) {
      console.error(e);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong writing with Artificial Intelligence." }}));
    }
  }
}

async function handleRewriteBlockkWithAI(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const namespace = editor._config.namespace;
    try {
      const [markdown_to_rewrite_nodeStates,markdown_context_nodeStates,loading_node] = await new Promise<[SerializedLexicalNode[],SerializedLexicalNode[],string]>((resolve,reject) => {
        editor.update(() => {
          const selection = $getSelection() || $getPreviousSelection();
          if ($isRangeSelection(selection)) {
            const node = $findMatchingParent(selection.getNodes()[0],(n) => $isElementNode(n));
            if (node) {
              var markdown_context_nodes:LexicalNode[] = [];
              var curr_node = node;
              while ($isElementNode(curr_node)) {
                markdown_context_nodes = ([curr_node] as LexicalNode[]).concat(markdown_context_nodes);
                curr_node = curr_node.getPreviousSibling() as LexicalNode;
              }
              const loadingNode = $createLoadingNode({ size: "medium", inline: false });
              node.insertAfter(loadingNode);
              node.remove();
              resolve([[$exportJSONWithChildren(node)],markdown_context_nodes.slice(-10).map($exportJSONWithChildren),loadingNode.getKey()]);
            }
          }
        })
      });
      const markdown_to_rewrite = await convertNodesToMarkdownString(markdown_to_rewrite_nodeStates);
      const markdown_context = await convertNodesToMarkdownString(markdown_context_nodeStates);
      if (window.socket) {
        window.socket.on('ai-write',handleAIWriteResponse);
        window.socket.emit('ai-write',{ type: 'rewrite', rewrite_markdown: markdown_to_rewrite, markdown_context },({ message_id, error, message }:{message_id: string, error: boolean, message: string }) => {
          if (error) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBBAR',{ detail: { severity: "error", message: message }}))
          } else {
            AI_WRITING_STATE[message_id] = {
              editorID: namespace,
              type: 'rewrite',
              nodesToReplace: [loading_node],
              markdown: ''
            }
          }
        })
      }
    } catch (e) {
      console.error(e);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong rewriting block using Artificial Intelligence." }}));
    }
  }  
}

export async function onRewriteSelectionWidthAIClick(this:HTMLButtonElement,e:Event) {
  const editor = getCurrentEditor();
  if (editor) {
    const namespace = editor._config.namespace;
    try {
      const [selectionNodes,selection_text_content,markdown_to_rewrite_nodes,markdown_context_before_nodes,markdown_context_after_nodes] = await new Promise<[NodeKey[],string,SerializedLexicalNode[],SerializedLexicalNode[],SerializedLexicalNode[]]>((resolve,reject) => {
        editor.update(() => {
          const selection = $getSelection() || $getPreviousSelection();
          if ($isRangeSelection(selection)) {
            const selection_text_content = selection.getTextContent();
            var markdown_context_before_nodes:LexicalNode[] = [];
            var markdown_context_after_nodes:LexicalNode[] = [];
            const nodeStart = $findMatchingParent(selection.getNodes()[0],(n)=>$isElementNode(n));
            if ($isElementNode(nodeStart)) {

              var curr_node_before = nodeStart.getPreviousSibling();
              while ($isElementNode(curr_node_before)) {
                markdown_context_before_nodes = [curr_node_before].concat(markdown_context_before_nodes as any);
                curr_node_before = curr_node_before.getPreviousSibling();
              }
              var curr_node_after = nodeStart.getNextSibling();
              while ($isElementNode(curr_node_after)) {
                markdown_context_after_nodes.push(curr_node_after);
                curr_node_after = curr_node_after.getNextSibling();
              }
              const selectionNodes = selection.getNodes().map((o) => o.getKey());
              resolve([
                selectionNodes,
                selection_text_content,
                [$exportJSONWithChildren(nodeStart)],
                markdown_context_before_nodes.slice(-10).map($exportJSONWithChildren),
                markdown_context_after_nodes.slice(-10).map($exportJSONWithChildren)
              ]);
              return;
            }
            reject("Something went wrong with rewriting markdown selection.");
          }
        })
      });
      const markdown_to_rewrite = await convertNodesToMarkdownString(markdown_to_rewrite_nodes);
      const markdown_context_before = await convertNodesToMarkdownString(markdown_context_before_nodes);
      const markdown_context_after = await convertNodesToMarkdownString(markdown_context_after_nodes);
      if (window.socket) {
        window.socket.on('ai-write',handleAIWriteResponse);
        window.socket.emit('ai-write',{ type: 'rewrite-selection', selection_text_content, markdown_to_rewrite, markdown_context_before, markdown_context_after },({ message_id, error, message }:{ message_id: string, error: boolean, message: string}) => {
          if (error) {
            document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBBAR',{ detail: { severity: "error", message: message }}))
          } else {
            AI_WRITING_STATE[message_id] = {
              editorID: namespace,
              type: 'rewrite-selection',
              selectionNodes,
              markdown: ''
            }
          }
        })
      }
    } catch (e) {
      console.error(e);
      document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong rewriting selection using Artificial Intelligence." }}));
    }
    
  }
}

async function handleAIWriteResponse(obj:{ message_id: string, markdown: string, end: boolean, error: boolean }) {
  const WRITER_OBJ = AI_WRITING_STATE[obj.message_id];
  if (WRITER_OBJ) {
    WRITER_OBJ.markdown = obj.markdown;
    const editor = getEditorInstances()[WRITER_OBJ.editorID];
    var error = false;
    var html = '';
    if (editor) {
      try {
        html = await (window as any).markdownToHTMLAi(WRITER_OBJ.markdown);
      } catch (e) {
        error = true;
      }
      editor.update(() => {
        if (!!!error) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(html, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          switch (WRITER_OBJ.type) {
            case 'write': {
              const lastNode = WRITER_OBJ.nodes[WRITER_OBJ.nodes.length-1];
              const lastNodeEditor = $getNodeByKey(lastNode);
              if (lastNodeEditor) {
                var insertAfter = lastNodeEditor;
                var curr = 0;
                const new_nodes_replace:LexicalNode[] = [];
                while (curr<nodes.length||WRITER_OBJ.nodes.length-1-curr>-1) {
                  if (curr < nodes.length) {
                    insertAfter.insertAfter(nodes[curr]);
                    insertAfter.selectNext();
                    insertAfter = nodes[curr];
                    new_nodes_replace.push(nodes[curr]);
                  }
                  if (WRITER_OBJ.nodes.length-1-curr>-1) {
                    const nodeKey = WRITER_OBJ.nodes[WRITER_OBJ.nodes.length-1-curr];
                    const nodeCurrent = $getNodeByKey(nodeKey);
                    if (nodeCurrent) nodeCurrent.remove();
                  }
                  curr+=1;
                }
                if (!!!obj.end) {
                  const loading = $createLoadingNode({ size: 'small', inline: true });
                  insertAfter.insertAfter(loading);
                  insertAfter.selectNext();
                  new_nodes_replace.push(loading);
                }
                WRITER_OBJ.nodes = new_nodes_replace.map((o)=>o.getKey());
              }
              break;
            }
            case 'rewrite': {
              for (let i = WRITER_OBJ.nodesToReplace.length-1;i>-1;i--) {
                if (i===0) {
                  const insertAfterKey = WRITER_OBJ.nodesToReplace[i];
                  const node = $getNodeByKey(insertAfterKey);
                  if (node) {
                    var insertAfter = node;
                    var curr = 0;
                    const new_nodes = [];
                    while (curr < nodes.length) {
                      insertAfter.insertAfter(nodes[curr]);
                      insertAfter.selectNext();
                      new_nodes.push(nodes[curr]);
                      if (curr===0) insertAfter.remove();
                      insertAfter = nodes[curr];
                      curr+=1;
                    }
                    if (!!!obj.end) {
                      const loading = $createLoadingNode({ size: "medium", inline: false })
                      insertAfter.insertAfter(loading);
                      insertAfter.selectNext();
                      new_nodes.push(loading);
                    }
                    WRITER_OBJ.nodesToReplace = new_nodes.map((o)=>o.getKey());
                  }
                } else {
                  const nodeKey = WRITER_OBJ.nodesToReplace[i];
                  const node = $getNodeByKey(nodeKey);
                  if (node) node.remove();
                }
              }
              break;
            }
            case 'rewrite-selection': {
              for (let i=WRITER_OBJ.selectionNodes.length-1; i >-1;i--) {
                if (i===0) {
                  const insertAfterKey = WRITER_OBJ.selectionNodes[i];
                  const node = $getNodeByKey(insertAfterKey);
                  if (node) {
                    var insertAfter = node;
                    var curr = 0;
                    const new_nodes = [];
                    while (curr < nodes.length) {
                      insertAfter.insertAfter(nodes[curr]);
                      insertAfter.selectNext();
                      new_nodes.push(nodes[curr]);
                      if (curr===0) insertAfter.remove();
                      insertAfter = nodes[curr];
                      curr+=1;
                    }
                    if (!!!obj.end) {
                      const loading = $createLoadingNode({ size: "small", inline: true })
                      insertAfter.insertAfter(loading);
                      insertAfter.selectNext();
                      new_nodes.push(loading);
                    }
                    WRITER_OBJ.selectionNodes = new_nodes.map((o)=>o.getKey());
                  }
                } else {
                  const nodeKey = WRITER_OBJ.selectionNodes[i];
                  const node = $getNodeByKey(nodeKey);
                  if (node) node.remove();
                }
              }
              break;
            }
          }
        } else {
          switch (WRITER_OBJ.type) {
            case 'rewrite': {
              const nodes = WRITER_OBJ.nodesToReplace.map((o) => $getNodeByKey(o));
              nodes.forEach((n) => {
                if ($isLoadingNode(n)) n.remove();
              })
              break;
            }
            case 'rewrite-selection': {
              const nodes = WRITER_OBJ.selectionNodes.map((o) => $getNodeByKey(o));
              nodes.forEach((n) => {
                if ($isLoadingNode(n)) n.remove();
              })
              break;
            }
            case 'write': {
              const nodes = WRITER_OBJ.nodes.map((o) => $getNodeByKey(o));
              nodes.forEach((n) => {
                if ($isLoadingNode(n)) n.remove();
              })
              break;
            }
          }
          document.dispatchEvent(new CustomEvent<DISPATCH_SNACKBAR_CED>('DISPATCH_SNACKBAR',{ detail: { severity: "error", message: "Something went wrong with the AI writing!" }}));
          if (!!!obj.end&&window.socket) {
            window.socket.emit('ai-write-end',{ message_id: obj.message_id });
            delete AI_WRITING_STATE[obj.message_id];
          }
        }
      })
    }
  }
}

export function registerAIWritingHelperEditable(editor:LexicalEditor) {
  const writeWithAI = document.getElementById('write-with-ai-button');
  const rewriteWithAI = document.getElementById('rewrite-with-ai-button');
  if (writeWithAI) writeWithAI.addEventListener('click',handleWriteWithAi);
  if (rewriteWithAI) rewriteWithAI.addEventListener('click',handleRewriteBlockkWithAI);
  return mergeRegister(
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        if (AI_WRITER_HELPER_STATE.timeout) {
          clearTimeout(AI_WRITER_HELPER_STATE.timeout);
          AI_WRITER_HELPER_STATE.timeout = null;
        }
        closeAIWriterMenu();
        AI_WRITER_HELPER_STATE.current_editor_id = editor._config.namespace;
        const selection = $getSelection();
        if (getEnableAIWriter()&&$isRangeSelection(selection)&&selection.isCollapsed()) {
          AI_WRITER_HELPER_STATE.timeout = setTimeout(() => {
            openAIWriterHelper();
          },2000);
        } else {
          closeAIWriterMenu();
        }
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    ),
    editor.registerCommand(BLUR_COMMAND,() => {
      setTimeout(() => {
        if (AI_WRITER_HELPER_STATE.timeout) {
          clearTimeout(AI_WRITER_HELPER_STATE.timeout);
          AI_WRITER_HELPER_STATE.timeout = null;
        }
        closeAIWriterMenu();
      },100)
      return false;
    },COMMAND_PRIORITY_CRITICAL),
    () => {
      if (AI_WRITER_HELPER_STATE.timeout) {
        clearTimeout(AI_WRITER_HELPER_STATE.timeout);
        AI_WRITER_HELPER_STATE.timeout = null;
      }
      Object.entries(AI_WRITING_STATE)
      .forEach(([str,obj]) => {
        if (obj.editorID===editor._config.namespace) {
          if (window.socket) {
            window.socket.emit('ai-write-end',{ message_id: str });
          }
          delete AI_WRITING_STATE[str];
        }
      })
      closeAIWriterMenu();
    }
  )
}