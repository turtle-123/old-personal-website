import { DISPATCH_SNACKBAR_CED } from "..";
import { getEditorInstances } from "../lexical-implementation";
import { closeLoadingDialog, getAndOpenLoadingDialog, getCsrfToken } from "../shared";

type ValidPollQuestionTypes = 'survey-short-answer'| 'survey-paragraph'| 'survey-short-blog'| 'survey-multiple-choice'| 'survey-checkbox'| 'survey-range'| 'survey-date'| 'survey-datetime'| 'survey-time'| 'survey-image'| 'survey-audio'| 'survey-video'| 'survey-month'| 'survey-color'| 'survey-ranking'| 'survey-selection'| 'survey-number'| 'survey-week';

type AudioSurveyResponse = {
  src: string, 
  title: string
}
type CheckboxSurveyResponse = {
  choices: number[]
}
type ColorSurveyResponse = {
  color: string 
}
type DateSurveyResponse = {
  date: string 
}
type DatetimeSurveyResponse = {
  datetime: string 
}
type ImageSurveyResponse = {
  src: string, 
  short_description: string,
  long_description: string
}
type MonthSurveyResponse = {
  month: string 
}
type MultipleChoiceSurveyResponse = {
  choice: number 
}
type NumberSurveyResponse = {
  number: number 
}
type ParagraphSurveyResponse = {
  response: string 
}
type RangeSurveyResponse = {
  input: number 
}
type RankingSurveyResponse = {
  ordered: number[]
}
type SelectionSurveyResponse = {
  choice?: number,
  other_checked: boolean,
  other_option: string|undefined
}
type ShortAnswerSurveyResponse = {
  response: string 
}
type ShortBlogResponse = {
  editorState: string
}
type TimeSurveyResponse = {
  time: string 
}
type VideoSurveyResponse = {
  src: string, 
  title: string,
  description: string, 
  height: number
}
type IndividualSurveyResponse = {
  question_id: number, 
  question_type: ValidPollQuestionTypes,
  required: boolean,
  confirmed_response: boolean,
  response: AudioSurveyResponse|CheckboxSurveyResponse|ColorSurveyResponse|DateSurveyResponse|DatetimeSurveyResponse|ImageSurveyResponse|MonthSurveyResponse|MultipleChoiceSurveyResponse|NumberSurveyResponse|ParagraphSurveyResponse|RangeSurveyResponse|RankingSurveyResponse|SelectionSurveyResponse|ShortAnswerSurveyResponse|ShortBlogResponse|TimeSurveyResponse|VideoSurveyResponse
};

const VALID_POLL_QUESTION_TYPES = new Set(['survey-short-answer', 'survey-paragraph', 'survey-short-blog', 'survey-multiple-choice', 'survey-checkbox', 'survey-range', 'survey-date', 'survey-datetime', 'survey-time', 'survey-image', 'survey-audio', 'survey-video', 'survey-month', 'survey-color', 'survey-ranking', 'survey-selection', 'survey-number', 'survey-week'] as const);
function isMemberOf<T>(a:any,s:Set<T>): a is T {
  return s.has(a);
}
const dispatchSnackbar = (severity:"error"|"success",message:string) => {
  document.dispatchEvent(new CustomEvent('DISPATCH_SNACKBAR',{ detail: { severity, message }}));
}
const invalidSurveyQuestion = (question:HTMLElement,message:string) => {
  question.classList.add('invalid-q');
  question.scrollIntoView();
  dispatchSnackbar('error',message);
}
function handleSurveySubmit() {
  const questions = Array.from(document.querySelectorAll<HTMLElement>('section.survey-question'));
  const resp:Partial<IndividualSurveyResponse>[] = [];
  for (let i=0; i<questions.length;i++) {
    var ret:Partial<IndividualSurveyResponse>={};
    const question = questions[i];
    const questionType = question.getAttribute('data-question-type');
    const questionID = question.getAttribute('data-question-id');
    if (questionID&&Number.isInteger(parseInt(questionID))&&isMemberOf(questionType,VALID_POLL_QUESTION_TYPES)) {
      ret.question_id = parseInt(questionID);
      ret.question_type = questionType;
      const has_confirm_response = question.querySelector<HTMLInputElement>(`input#confirm_response_question_${i+1}`);
      const question_body = question.querySelector<HTMLDivElement>('div[data-pq-answer]');
      if (question_body) {
        ret.required = !!!has_confirm_response;
        ret.confirmed_response = Boolean(has_confirm_response && has_confirm_response.checked);
        switch (questionType) {
          case 'survey-audio': {
            const audioEl = question_body.querySelector<HTMLAudioElement>('audio');
            const audioTitle = question_body.querySelector<HTMLInputElement>('input[type="text"][name^="audio-input-title"]');
            if(ret.required&&(!!!audioEl||!!!audioEl.getAttribute('data-src')||!!!audioTitle||!!!audioTitle.value||!!!audioTitle.checkValidity())) {
              invalidSurveyQuestion(question,'Invalid audio input. Unable to find audio input or audio title is not valid.');
              return;
            }
            if (audioEl&&audioEl.getAttribute('data-src')&&audioTitle&&audioTitle.checkValidity()) {
              ret.response = {
                src: String(audioEl.getAttribute('data-src')),
                title: audioTitle.value
              }
            }
            break;
          }
          case 'survey-checkbox': {
            const min_selection_span = question_body.querySelector<HTMLSpanElement>('span[id^="min_select_"]');
            const max_selection_span = question_body.querySelector<HTMLSpanElement>('span[id^="max_select_"]');
            const choices = Array.from(question_body.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'));
            const choices_values = choices.filter((inp) => Number.isInteger(parseInt(inp.value))).map((inp) => parseInt(inp.value));
            if (min_selection_span) {
              const inner_text_num = parseInt(min_selection_span.innerText.trim());
              if (Number.isInteger(inner_text_num)&&choices_values.length<inner_text_num) {
                invalidSurveyQuestion(question,'The number of selections for the checkbox question cannot be less than the required minimum number of selections.');
                return;
              }
            }
            if (max_selection_span) {
              const inner_text_num = parseInt(max_selection_span.innerText.trim());
              if (Number.isInteger(inner_text_num)&&choices_values.length>inner_text_num) {
                invalidSurveyQuestion(question,'The number of selections for the checkbox question cannot be greater than the allowed maximum number of selections.');
                return;
              }
            }
            ret.response = {
              choices: choices_values
            };
            break;
          }
          case 'survey-color': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="color"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find color input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid color input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                color: value
              };
            }
            break;
          }
          case 'survey-date': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="date"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find date input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid date input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                date: value
              };
            }
            break;
          }
          case 'survey-datetime': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="datetime-local"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find datetime input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid datetime input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                datetime: value
              };
            }
            break;
          }
          case 'survey-image': {
            const imageInputEl = question_body.querySelector('input[data-image-input]') as HTMLInputElement;
            const id = imageInputEl.id;
            const imageEl = question_body.querySelector<HTMLInputElement>(`input[name="${id}-text"]`); 
            const imageShortDescription = question_body.querySelector<HTMLInputElement>(`input[name="${id}-short-description"]`); 
            const imageLongDescription = question_body.querySelector<HTMLTextAreaElement>(`textarea[name="${id}-long-description"]`); 
            if(ret.required&&(!!!imageEl||!!!imageEl.value||!!!imageShortDescription||!!!imageShortDescription.checkValidity()||!!!imageLongDescription||!!!imageLongDescription.checkValidity())) {
              invalidSurveyQuestion(question,'Invalid image input. Unable to find image input, or image ');
              return;
            }
            if (imageEl&&imageEl.value&&imageShortDescription&&imageLongDescription) {
              ret.response = {
                src: imageEl.value,
                short_description: imageShortDescription.value,
                long_description: imageLongDescription.value,
              }
            }
            break;
          }
          case 'survey-month': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="month"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find month input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid month input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                month: value
              };
            }
            break;
          }
          case 'survey-multiple-choice': {
            const choice = question_body.querySelector<HTMLInputElement>('input[type="radio"]:checked');
            if (ret.required&&!!!choice) {
              invalidSurveyQuestion(question,'You must select a choice for this survey question.');
              return;
            }
            if (choice) {
              const value = choice.value;
              if (!!!Number.isInteger(parseInt(value))) {
                invalidSurveyQuestion(question,'Invalid choice for multiple choice question.');
                return;
              }
              ret.response = {
                choice: parseInt(value)
              };
            }
            break;
          }
          case 'survey-number': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="number"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find number input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid number input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                number: Number(value)
              };
            }
            break;
          }
          case 'survey-paragraph': {
            const input = question_body.querySelector<HTMLTextAreaElement>('textarea');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find paragraph input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid paragraph input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                response: value
              };
            }
            break;
          }
          case 'survey-range': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="range"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find range input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid range input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                input: Number(value)
              };
            }
            break;
          }
          case 'survey-ranking': {
            const options = Array.from(question_body.querySelectorAll<HTMLDivElement>('div[data-pr-option]')).filter((el) => Number.isInteger(parseInt(el.id.replace('option-','')))).map((el) => parseInt(el.id.replace('option-','')));
            if (ret.required&&!!!options.length) {
              invalidSurveyQuestion(question,'Invalid survey question response.');
              return;
            }
            if (options.length) {
              ret.response = {
                ordered: options
              };
            }
            break;
          }
          case 'survey-selection': {
            const selectInput = question_body.querySelector<HTMLInputElement>('input[id^="select_input_"]');
            const include_other_checkbox = question_body.querySelector<HTMLInputElement>('input[id^="checkbox_"]');
            const other_option = question_body.querySelector<HTMLInputElement>('input[id^="other_option_"]');
            if (ret.required&&!!!selectInput) {
              invalidSurveyQuestion(question,'Unable to find select input for required survey question.');
              return;
            }
            if (selectInput) {
              const selectInputValue = selectInput.value;
              const choice = Number.isInteger(parseInt(selectInputValue)) ? parseInt(selectInputValue) : undefined;
              if (include_other_checkbox&&include_other_checkbox.checked) {
                if (!!!other_option||!!!other_option.value.length) {
                  invalidSurveyQuestion(question,'If you want to submit an "other option" for a select input question, then the length of the response for the other value must be greater than 1.');
                  return;
                }
                ret.response = {
                  choice,
                  other_checked: true,
                  other_option: other_option.value 
                };
                break;
              }
              if (!!!choice&&ret.required) {
                invalidSurveyQuestion(question,'Unable to find input for required survey select question.');
                return;
              }
              ret.response = {
                choice,
                other_checked: false,
                other_option: undefined 
              };
            }
            break;
          }
          case 'survey-short-answer': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="text"][id^="ursa_"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find text input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid text input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                response: value
              };
            }
            break;
          }
          case 'survey-short-blog': {
            const lexicalEditorElement = question_body.querySelector<HTMLDivElement>('div.lexical-wrapper');
            if (!!!lexicalEditorElement&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find short blog input for required question.');
              return;
            }
            if (lexicalEditorElement) {
              const id = lexicalEditorElement.id;
              const editorInstance = getEditorInstances()[id];
              if (!!!editorInstance&&ret.required) {
                invalidSurveyQuestion(question,'Unable to find short blog input for required question.');
                return;
              }
              ret.response = {
                editorState: JSON.stringify(editorInstance.toJSON())
              }
            }
            break;
          }
          case 'survey-time': {
            const input = question_body.querySelector<HTMLInputElement>('input[type="time"]');
            if (!!!input&&ret.required) {
              invalidSurveyQuestion(question,'Unable to find time input for required question.');
              return;
            }
            if (input) {
              const valid = input.checkValidity();
              if (ret.required&&!!!valid) {
                invalidSurveyQuestion(question,'Invalid time input for required question.');
                return;
              }
              const value = input.value;
              ret.response = {
                time: value
              };
            }
            break;
          }
          case 'survey-video': {
            const videoEl = question_body.querySelector<HTMLVideoElement>('video');
            const videoTitle = question_body.querySelector<HTMLInputElement>('input[type="text"][name^="video-input-title"]');
            const videoDescription = question_body.querySelector<HTMLTextAreaElement>('textarea[name^="video-input-description"]');
            if(ret.required&&(!!!videoEl||!!!videoEl.getAttribute('data-src')||!!!videoTitle||!!!videoTitle.value.length||!!!videoDescription||!!!videoEl.videoHeight)) {
              invalidSurveyQuestion(question,'Invalid video survey question response.');
              return;
            }
            if (videoEl&&videoEl.getAttribute('data-src')&&videoTitle&&videoTitle.value.length&&videoDescription) {
              ret.response = {
                src: String(videoEl.getAttribute('data-src')),
                title: videoTitle.value,
                description: videoDescription.value,
                height: videoEl.videoHeight
              }
            }
            break;
          }
          case 'survey-week': {
            throw new Error("This question type has not been implemented yet.");
          }
          default: {
            invalidSurveyQuestion(question,'Invalid survey question type.');
            return;
          }
        }
      } else {
        invalidSurveyQuestion(question,'Invalid survey question type.');
        return;
      }
    } else {
      dispatchSnackbar("error","Something went wrong submitting the survey.");
      return;
    }
    resp.push(ret);
  }
  const path = window.location.pathname;
  getAndOpenLoadingDialog("Submitting Survey response...");
  fetch(path,{ method: 'POST', headers: {'Content-Type': 'application/json', 'X-CSRF-Token': getCsrfToken() }, body: JSON.stringify({responses: resp})})
  .then((res) => {
    if (res.status!==200) throw new Error("Something went wrong posting the survey response.");
    closeLoadingDialog();
    dispatchSnackbar("success","Successfully posted survey response!");
    setTimeout(() => {
      if (window.htmx) {
        const el = document.createElement('div');
        const main = document.getElementById('PAGE');
        if (main) main.append(el);
        el.setAttribute('hx-get','/surveys');
        el.setAttribute('hx-target','#PAGE');
        el.setAttribute('hx-push-url','true');
        el.setAttribute('hx-indicator','#page-transition-progress');
        el.setAttribute('hx-trigger','click');
        window.htmx.process(el);
        window.htmx.trigger(el,'click');
      }
    },1000);
  })
  .catch((e) => {
    console.error(e);
    closeLoadingDialog();
    dispatchSnackbar("error","Something went wrong posting the survey response");
  })
}

export function onSurveyLoad() {
  const submitFormButton = document.getElementById('submit-survey-response-button');
  if (submitFormButton) submitFormButton.addEventListener('click',handleSurveySubmit);
}