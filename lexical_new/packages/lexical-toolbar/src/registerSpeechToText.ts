import type {LexicalCommand, LexicalEditor, RangeSelection} from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { getEditorInstances, isMobileDevice } from '@lexical/shared';


const EditorsToSpeechRecognition:{[index: string]: SpeechRecognition} = {};
var REPORT_CONTAINER_TIMEOUT:NodeJS.Timeout|undefined=undefined;

const getReportContainer = () => document.getElementById('report-container') as HTMLDivElement|null;

const setReportContainerText = (t:string) => {
  const reportContainer = getReportContainer();
  if (reportContainer) reportContainer.innerText = t;
  if (reportContainer) reportContainer.removeAttribute('hidden');
  REPORT_CONTAINER_TIMEOUT = setTimeout(() => {
    const reportContainer = getReportContainer();
    if (reportContainer) reportContainer.setAttribute('hidden','');
    REPORT_CONTAINER_TIMEOUT=undefined;
  },1000);
}


const VOICE_COMMANDS: Readonly<Record<string,(arg0: {editor: LexicalEditor; selection: RangeSelection}) => void>> = {
  '\n': ({selection}) => {
    selection.insertParagraph();
  },
  redo: ({editor}) => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  },
  undo: ({editor}) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  },
};


function handleStartStopSpeechRecognition(this:HTMLButtonElement,_e:Event) {
  const wrapper = this.closest<HTMLDivElement>('div.lexical-wrapper');
  const playing = this.classList.contains('playing');
  if (wrapper&&wrapper.id&&EditorsToSpeechRecognition[wrapper.id]) {
    const speechRecognition = EditorsToSpeechRecognition[wrapper.id];
    if (playing) {
      this.classList.remove('playing');
      speechRecognition.stop();
    } else {
      this.classList.add('playing');
      speechRecognition.start();
    }
  }
}

function getOnSpeechRecognitionResult(wrapper_id:string) {
  const func = function(event:SpeechRecognitionEvent) {
    const resultItem = event.results.item(event.resultIndex);
    const {transcript} = resultItem.item(0);
    setReportContainerText(transcript);
    if (!resultItem.isFinal) {
      return;
    }
    const editors = getEditorInstances();
    const editor = editors[wrapper_id];
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const command = VOICE_COMMANDS[transcript.toLowerCase().trim()];
          if (command) {
            command({ editor, selection });
          } else if (transcript.match(/\s*\n\s*/)) {
            selection.insertParagraph();
          } else {
            selection.insertText(transcript);
          }
        }
      });
    }
  }
  return func;
}


export function registerSpeechToText(editor:LexicalEditor) {
  const SUPPORT_SPEECH_RECOGNITION: boolean = Boolean((typeof globalThis?.window !==undefined) && (
    'SpeechRecognition' in globalThis?.window || 'webkitSpeechRecognition' in globalThis?.window)&&!!!isMobileDevice(window.navigator.userAgent));
  if (SUPPORT_SPEECH_RECOGNITION) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const wrapper_id = editor._config.namespace;
    const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
    if (wrapper) {
      const speechToTextButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-speech-to-text]');
      if (!!!SpeechRecognition&&speechToTextButton) speechToTextButton.setAttribute('disabled','');
      else if (speechToTextButton) speechToTextButton.addEventListener('click',handleStartStopSpeechRecognition);
    }
    if (SpeechRecognition) {
      EditorsToSpeechRecognition[wrapper_id] = new SpeechRecognition();
      EditorsToSpeechRecognition[wrapper_id].continuous = true;
      EditorsToSpeechRecognition[wrapper_id].interimResults = true;
      EditorsToSpeechRecognition[wrapper_id].addEventListener('result',getOnSpeechRecognitionResult(wrapper_id));  
    }
    return () => {
      if (EditorsToSpeechRecognition[wrapper_id]) {
        EditorsToSpeechRecognition[wrapper_id].stop();
        delete EditorsToSpeechRecognition[wrapper_id];
      }
    }
  } else {
    const wrapper_id = editor._config.namespace;
    const wrapper = document.getElementById(wrapper_id) || editor._rootElement?.closest('div.lexical-wrapper') as HTMLDivElement|null;
    if (wrapper) {
      const speechToTextButton = wrapper.querySelector<HTMLButtonElement>('button[data-lexical-speech-to-text]');
      if(speechToTextButton) speechToTextButton.setAttribute('hidden','');
    }
    return () => {}
  }
}