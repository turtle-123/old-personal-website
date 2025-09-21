import type {BaseSelection, NodeKey, TextNode} from 'lexical';
import {$isAtNodeEnd} from '@lexical/selection';
import {mergeRegister} from '@lexical/utils';
import {
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
} from 'lexical';
import {
  $createAutocompleteNode,
  AutocompleteNode,
} from './AutocompleteNode';
const HISTORY_MERGE = {tag: 'history-merge'};
export const uuid_autocomplete = window.crypto.randomUUID();
