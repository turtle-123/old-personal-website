import { 
  LexicalEditor,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  CAN_UNDO_COMMAND,
} from "lexical";
import {
  q,
  removeDisabledButton,
  disableButton
} from '@lexical/shared';
import { mergeRegister } from '@lexical/utils';
import { 
  registerHistory,
  createEmptyHistoryState, 
} from ".";
import { UPDATE_TOOLBAR_COMMAND } from "@lexical/toolbar";
/**
 * The number of ms to set the history state for [lexical/history](https://github.com/facebook/lexical/blob/main/packages/lexical-history/src/index.ts#L389)
 * Set to 1000 [because it was in the React plugin](https://github.com/facebook/lexical/blob/main/packages/lexical-react/src/shared/useHistory.ts#L18)
 */
const HISTORY_DELAY = 1000;

export function registerHistoryCustomEditable(editor:LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      CAN_REDO_COMMAND,
      (bool) => {
        const CONTENT_EDITABLE = editor.getRootElement();
        if(!!!CONTENT_EDITABLE) return false;
        const wrapper = CONTENT_EDITABLE.closest<HTMLDivElement>('div.lexical-wrapper');
        if (!!!wrapper) return false;
        const button = q(wrapper,'REDO_COMMAND',undefined) as HTMLButtonElement;
        if(button) {
          if (bool) removeDisabledButton(button);
          else disableButton(button);
        }
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand(
      CAN_UNDO_COMMAND,
      (bool) => {
        const CONTENT_EDITABLE = editor.getRootElement();
        if(!!!CONTENT_EDITABLE) return false;
        const wrapper = CONTENT_EDITABLE.closest<HTMLDivElement>('div.lexical-wrapper');
        if (!!!wrapper) return false;
        const button = q(wrapper,'UNDO_COMMAND',undefined) as HTMLButtonElement;
        if(button) {
          if (bool) removeDisabledButton(button);
          else disableButton(button);
        }
        editor.dispatchCommand(UPDATE_TOOLBAR_COMMAND,undefined);
        return false;
      },
      COMMAND_PRIORITY_LOW
    ),
    registerHistory(editor,createEmptyHistoryState(),HISTORY_DELAY)
  )
}