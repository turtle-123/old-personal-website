import { Spread, TableOfContentsItem } from "../../types"

export type SurveyParagraphOptionType = {
  type: 'survey-paragraph',
  defaultChecked: boolean,
  option: string
}
export type ParsedSurveyParagraphOptionType = {
  type: 'survey-paragraph',
  defaultChecked: boolean,
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[] 
}
export type AudioOptionType = {
  type: 'audio',
  defaultChecked: boolean,
  src: string,
  title: string
}
export type ParsedAudioOptionType = {
  type: 'audio',
  defaultChecked: boolean,
  src: string,
  title: string,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type VideoOptionType = {
  type: 'video',
  defaultChecked: boolean,
  src: string,
  title: string,
  description: string,
  height: number
}
export type ParsedVideoOptionType = {
  type: 'video',
  defaultChecked: boolean,
  src: string,
  title: string,
  description: string,
  height: number,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type ImageOptionType = {
  type: 'image',
  defaultChecked: boolean,
  src: string,
  shortDescription: string,
  longDescription: string
}
export type ParsedImageOptionType = {
  type: 'image',
  defaultChecked: boolean,
  src: string,
  shortDescription: string,
  longDescription: string,
  width: number, 
  height: number,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type GetSurveyAudioQuestionState = {
  type: 'survey-audio',
  question: string, 
  required: boolean,
  VERSION: number
};
export type ParsedSurveyAudioQuestionState = {
  type: 'survey-audio',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[], 
  required: boolean,
  VERSION: number
};
export type GetSurveyCheckboxQuestionState = {
  type: 'survey-checkbox',
  question: string, 
  required: boolean,
  options: (SurveyParagraphOptionType|AudioOptionType|VideoOptionType|ImageOptionType)[],
  min_selected_options?: number,
  max_selected_options?: number,
  VERSION: number
};
export type ParsedSurveyCheckboxQuestionState = {
  type: 'survey-checkbox',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[], 
  required: boolean,

  options: (ParsedSurveyParagraphOptionType|ParsedAudioOptionType|ParsedVideoOptionType|ParsedImageOptionType)[],
  min_selected_options: number|null,
  max_selected_options:number|null,
  VERSION: number
};

export type GetSurveyColorQuestionState = {
  type: 'survey-color',
  question: string, 
  required: boolean,
  defaultColor: string,
  VERSION: number
};
export type ParsedSurveyColorQuestionState = {
  type: 'survey-color',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  defaultColor: string,
  VERSION: number
};

export type GetSurveyDateQuestionState = {
  type: 'survey-date',
  question: string, 
  required: boolean,
  minDate: string | undefined,
  maxDate: string | undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyDateQuestionState = {
  type: 'survey-date',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  minDate: string | undefined,
  maxDate: string | undefined,
  step: number,
  VERSION: number
}

export type GetSurveyDatetimeQuestionState = {
  type: 'survey-datetime',
  question: string, 
  required: boolean,
  minDatetime: string|undefined,
  maxDatetime: string|undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyDatetimeQuestionState = {
  type: 'survey-datetime',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  minDatetime: string|undefined,
  maxDatetime: string|undefined,
  step: number,
  VERSION: number
};
export type GetSurveyImageQuestionState = {
  type: 'survey-image',
  question: string, 
  required: boolean,
  VERSION: number
};
export type ParsedSurveyImageQuestionState = {
  type: 'survey-image',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  VERSION: number
};
export type GetSurveyMonthQuestionState = {
  type: 'survey-month',
  question: string,
  required: boolean,
  minMonth: string|undefined,
  maxMonth: string|undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyMonthQuestionState = {
  type: 'survey-month',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  minMonth: string|undefined,
  maxMonth: string|undefined,
  step: number,
  VERSION: number
};

export type GetSurveyMultipleChoiceQuestionState = {
  type: 'survey-multiple-choice',
  question: string, 
  required: boolean,
  options: (SurveyParagraphOptionType|AudioOptionType|VideoOptionType|ImageOptionType)[],
  VERSION: number
};
export type ParsedSurveyMultipleChoiceQuestionState = {
  type: 'survey-multiple-choice',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,

  options: (ParsedSurveyParagraphOptionType|ParsedAudioOptionType|ParsedVideoOptionType|ParsedImageOptionType)[],

  VERSION: number
};
export type GetSurveyNumberQuestionState = {
  type: 'survey-number',
  question: string, 
  required: boolean,
  min: number|undefined,
  max: number|undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyNumberQuestionState = {
  type: 'survey-number',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  min: number|undefined,
  max: number|undefined,
  step: number,
  VERSION: number
};
export type GetSurveyParagraphQuestionState = {
  type: 'survey-paragraph',
  question: string, 
  required: boolean,
  minLength: number|undefined,
  maxLength: number|undefined,
  VERSION: number
};
export type ParsedSurveyParagraphQuestionState = {
  type: 'survey-paragraph',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,

  minLength: number|undefined,
  maxLength: number|undefined,
  VERSION: number
};
export type GetSurveyRangeQuestionState = {
  type: 'survey-range',
  question: string, 
  required: boolean,
  rangeMin: number,
  rangeMax: number,
  rangeStep: number, 
  rangePointDescriptions: {
    description: string,
    point: number
  }[],
  VERSION: number
};
export type ParsedSurveyRangeQuestionState = {
  type: 'survey-range',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  rangeMin: number,
  rangeMax: number,
  rangeStep: number, 
  rangePointDescriptions: {
    editorState: any,
    innerText: string,
    desktop_html: string,
    tablet_html: string,
    mobile_html: string,
    contains_nsfw: boolean, 
    able_to_validate: boolean, 
    unvalidated_image_urls: string[], 
    unvalidated_audio_urls: string[], 
    unvalidated_video_urls: string[],
    point: number
  }[],
  VERSION: number
};
export type SurveyParagraphRankingOptionType = {
  type: 'survey-paragraph',
  original_order: number,
  option: string
}
export type ParsedSurveyParagraphRankingOptionType = {
  type: 'survey-paragraph',
  original_order: number,
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
}
export type AudioRankingOptionType = {
  type: 'audio',
  original_order: number,
  src: string,
  title: string
}
export type ParsedAudioRankingOptionType = {
  type: 'audio',
  original_order: number,
  src: string,
  title: string,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type VideoRankingOptionType = {
  type: 'video',
  original_order: number,
  src: string,
  title: string,
  description: string,
  height: number,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type ParsedVideoRankingOptionType = {
  type: 'video',
  original_order: number,
  src: string,
  title: string,
  description: string,
  height: number,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type ImageRankingOptionType = {
  type: 'image',
  original_order: number,
  src: string,
  shortDescription: string,
  longDescription: string,
}
export type ParsedImageRankingOptionType = {
  type: 'image',
  original_order: number,
  src: string,
  shortDescription: string,
  longDescription: string,
  width: number, 
  height: number,
  safe: boolean|undefined,
  able_to_validate: boolean
}
export type GetSurveyRankingQuestionState = {
  type: 'survey-ranking',
  question: string,
  required: boolean,
  options: (SurveyParagraphRankingOptionType|AudioRankingOptionType|VideoRankingOptionType|ImageRankingOptionType)[],
  VERSION: number
};
export type ParsedSurveyRankingQuestionState = {
  type: 'survey-ranking',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  options: (ParsedSurveyParagraphRankingOptionType|ParsedAudioRankingOptionType|ParsedVideoRankingOptionType|ParsedImageRankingOptionType)[],
  VERSION: number
};

export type GetSurveySelectionQuestionState = {
  type: 'survey-selection',
  question: string, 
  required: boolean,
  options: {option: string, selected: boolean, index: number}[],
  include_other: boolean,
  VERSION: number
};
export type ParsedSurveySelectionQuestionState = {
  type: 'survey-selection',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  options: {option: string, selected: boolean, index: number}[],
  selectionText: string,
  include_other: boolean,
  VERSION: number
};
export type GetSurveyShortAnswerQuestionState = {
  type: 'survey-short-answer',
  question: string, 
  required: boolean,
  minLength: number|undefined,
  maxLength: number|undefined,
  VERSION: number
};
export type ParsedSurveyShortAnswerQuestionState = {
  type: 'survey-short-answer',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  
  minLength: number|undefined,
  maxLength: number|undefined,
  
  VERSION: number
};
export type GetSurveyShortBlogQuestionState = {
  type: 'survey-short-blog',
  question: string, 
  required: boolean,
  VERSION: number
};
export type ParsedSurveyShortBlogQuestionState = {
  type: 'survey-short-blog',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  VERSION: number
};
export type GetSurveyTimeQuestionState = {
  type: 'survey-time',
  question: string, 
  required: boolean,
  minTime: string|undefined,
  maxTime: string|undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyTimeQuestionState = {
  type: 'survey-time',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  minTime: string|undefined,
  maxTime: string|undefined,
  step: number,
  VERSION: number
};
export type GetSurveyVideoQuestionState = {
  type: 'survey-video',
  question: string, 
  required: boolean,
  VERSION: number
}
export type ParsedSurveyVideoQuestionState = {
  type: 'survey-video',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  VERSION: number
}
export type GetSurveyWeekQuestionState = {
  type: 'survey-week',
  question: string, 
  required: boolean,
  minWeek: string|undefined,
  maxWeek: string|undefined,
  step: number,
  VERSION: number
};
export type ParsedSurveyWeekQuestionState = {
  type: 'survey-week',
  editorState: any,
  innerText: string,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  contains_nsfw: boolean, 
  able_to_validate: boolean, 
  unvalidated_image_urls: string[], 
  unvalidated_audio_urls: string[], 
  unvalidated_video_urls: string[],
  required: boolean,
  minWeek: string|undefined,
  maxWeek: string|undefined,
  step: number,
  VERSION: number
};
export type QuestionStateAny = GetSurveyAudioQuestionState|GetSurveyCheckboxQuestionState|GetSurveyColorQuestionState|GetSurveyDateQuestionState|GetSurveyDatetimeQuestionState|GetSurveyImageQuestionState|GetSurveyMonthQuestionState|GetSurveyMultipleChoiceQuestionState|GetSurveyParagraphQuestionState|GetSurveyRangeQuestionState|GetSurveyShortAnswerQuestionState|GetSurveyShortBlogQuestionState|GetSurveyTimeQuestionState|GetSurveyVideoQuestionState|GetSurveyRankingQuestionState|GetSurveySelectionQuestionState|GetSurveyNumberQuestionState|GetSurveyWeekQuestionState;


export type ParsedQuestionStates = ParsedSurveyAudioQuestionState|ParsedSurveyCheckboxQuestionState|ParsedSurveyColorQuestionState|ParsedSurveyDateQuestionState|ParsedSurveyDatetimeQuestionState|ParsedSurveyImageQuestionState|ParsedSurveyMonthQuestionState|ParsedSurveyMultipleChoiceQuestionState|ParsedSurveyParagraphQuestionState|ParsedSurveyRangeQuestionState|ParsedSurveyShortAnswerQuestionState|ParsedSurveyShortBlogQuestionState|ParsedSurveyTimeQuestionState|ParsedSurveyVideoQuestionState|ParsedSurveyRankingQuestionState|ParsedSurveySelectionQuestionState|ParsedSurveyNumberQuestionState|ParsedSurveyWeekQuestionState;

export type SurveyResponseRow = {
  id: number, 
  survey_uuid: string,
  title: string,
  image: string,
  date_created: string, 
  html: string, 
  table_of_contents: TableOfContentsItem[],
  lexical_uuid: string,
  description_text: string,
  deadline: string
}
export type ValidSurveyQuestionTypes = 'survey-short-answer'| 'survey-paragraph'| 'survey-short-blog'| 'survey-multiple-choice'| 'survey-checkbox'| 'survey-range'| 'survey-date'| 'survey-datetime'| 'survey-time'| 'survey-image'| 'survey-audio'| 'survey-video'| 'survey-month'| 'survey-color'| 'survey-ranking'| 'survey-selection'| 'survey-number'| 'survey-week';
export type ValidOptionTypes = 'survey-paragraph'|'audio'|'video'|'image';

export type SurveyQuestionResponseRow = {
  id: number, 
  question_number: number, 
  required: boolean,
  question_type: ValidSurveyQuestionTypes,
  lexical_uuid: string,
  html: string
};
export type SurveyCheckboxResponse = Spread<DbAudioResponse|DbVideoResponse|DbImageResponse|DbSurveyParagraphOptionResponse,{ min_selected: number|null, max_selected: number|null}>;
export type SurveyColorDbResponse = {
  default_color: string
} 
export type SurveyDateDbResponse = {
  min_date: string|null,
  max_date: string|null,
  step: number  
} 
export type SurveyDatetimeDbResponse = {
  min_datetime: string|null,
  max_datetime: string|null,
  step: number
} 
export type SurveyMonthDbResponse = {
  min_month: string|null,
  max_month: string|null,
  step: number
}
type DbSurveyParagraphOptionResponse = {
  id: number,
  html: string, 
  option_type: 'survey-paragraph',
  option_number: number, 
  default_checked: boolean, 
  lexical_uuid: string
} 
type DbAudioResponse = {
  id: number,
  option_type: 'audio',
  option_number: number, 
  default_checked: boolean,
  audio_src: string, 
  audio_title: string
}
type DbVideoResponse = {
  id: number,
  option_type: 'video',
  option_number: number, 
  default_checked: boolean,
  video_src: string, 
  video_title: string, 
  video_height: number,
  video_description: string
}
type DbImageResponse = {
  id: number,
  option_type: 'image',
  option_number: number, 
  default_checked: boolean,
  image_src: string, 
  short_description: string,
  long_description: string, 
  width: number, 
  height: numebr 
}
type DbSurveyRankingParagraphOptionResponse = {
  id: number,
  html: string, 
  option_type: 'survey-paragraph',
  original_order: number,
  lexical_uuid: string
} 
type DbAudioRankingResponse = {
  id: number,
  option_type: 'audio',
  original_order: number,
  audio_src: string, 
  audio_title: string
}
type DbVideoRankingResponse = {
  id: number,
  option_type: 'video',
  original_order: number,
  video_src: string, 
  video_title: string, 
  video_height: number,
  video_description: string
}
type DbImageRankingResponse = {
  id: number,
  option_type: 'image',
  original_order: number,
  image_src: string, 
  short_description: string,
  long_description: string, 
  width: number, 
  height: numebr 
}

export type SurveyMultipleChoiceDbResponse = DbAudioResponse|DbVideoResponse|DbImageResponse|DbSurveyParagraphOptionResponse;

export type SurveyNumberDbResponse = {
  min_number: number|null,
  max_number: number|null,
  step: number 
} 
export type SurveyParagraphDbResponse = {
  min_length: number|null,
  max_length: number|null
} 
export type SurveyRangeDbResponse = {
  range_min: number,
  range_max: number,
  range_step: number,
  html: string|null,
  lexical_uuid: string|null,
  point:number|null 
} 
export type SurveyRankingDbResponse = DbSurveyRankingParagraphOptionResponse|DbAudioRankingResponse|DbVideoRankingResponse|DbImageRankingResponse;

export type SurveySelectionDbResponse = {
  include_other: boolean,
  option: string,
  selected: boolean,
  index: number 
}; 
export type SurveyShortAnswerDbResponse = {
  min_length: number|null,
  max_length: number|null
};
export type SurveyTimeDbResponse = {
  min_time: string|null,
  max_time: string|null,
  step: number
}; 
export type ParsedSurveyQuestion = {
  id: number, 
  question_number: number, 
  html: string,
  required: boolean,
  question_type: ValidSurveyQuestionTypes,
  lexical_uuid: string,
  questionState: null|SurveyTimeDbResponse[]|SurveyShortAnswerDbResponse[]|SurveySelectionDbResponse[]|SurveyRankingDbResponse[]|SurveyRangeDbResponse[]|SurveyParagraphDbResponse[]|SurveyMultipleChoiceDbResponse[]|SurveyMonthDbResponse[]|SurveyDateDbResponse[]|SurveyDatetimeDbResponse[]|SurveyCheckboxResponse[]
};


export type AudioSurveyResponse = {
  src: string, 
  title: string
}
export type CheckboxSurveyResponse = {
  choices: number[],
  min_selected: number|null,
  max_selected: number|null
}
export type ColorSurveyResponse = {
  color: string 
}
export type DateSurveyResponse = {
  date: string 
}
export type DatetimeSurveyResponse = {
  datetime: string 
}
export type ImageSurveyResponse = {
  src: string, 
  short_description: string,
  long_description: string
}
export type MonthSurveyResponse = {
  month: string 
}
export type MultipleChoiceSurveyResponse = {
  choice: number 
}
export type NumberSurveyResponse = {
  number: number 
}
export type ParagraphSurveyResponse = {
  response: string 
}
export type RangeSurveyResponse = {
  input: number 
}
export type RankingSurveyResponse = {
  ordered: number[]
}
export type SelectionSurveyResponse = {
  choice?: number,
  other_checked: boolean,
  other_option: string|undefined
}
export type ShortAnswerSurveyResponse = {
  response: string 
}
export type ShortBlogResponse = {
  editorState: string
}
export type TimeSurveyResponse = {
  time: string 
}
export type VideoSurveyResponse = {
  src: string, 
  title: string,
  description: string, 
  height: number
}
export type IndividualSurveyResponse = {
  question_id: number, 
  question_type: ValidSurveyQuestionTypes,
  required: boolean,
  confirmed_response: boolean,
  response: AudioSurveyResponse|CheckboxSurveyResponse|ColorSurveyResponse|DateSurveyResponse|DatetimeSurveyResponse|ImageSurveyResponse|MonthSurveyResponse|MultipleChoiceSurveyResponse|NumberSurveyResponse|ParagraphSurveyResponse|RangeSurveyResponse|RankingSurveyResponse|SelectionSurveyResponse|ShortAnswerSurveyResponse|ShortBlogResponse|TimeSurveyResponse|VideoSurveyResponse
};
export type SurveyResponse = IndividualSurveyResponse[];

export type ValidateCheckboxDbResponse = {
  valid_options: number[]
}
export type ValidateDateDbResponse = {
  min_date: string|null|undefined,
  max_date: string|null|undefined,
  step: number
}
export type ValidateDatetimeDbResponse = {
  min_datetime: string|null|undefined,
  max_datetime: string|null|undefined,
  step: number
}
export type ValidateMonthDbResponse = {
  min_month: string|null|undefined,
  max_month: string|null|undefined,
  step: number
}
export type ValidateMultipleChoiceDbResponse = {
  valid_options: number[]
}
export type ValidateNumberDbResponse = {
  min_number: number|null|undefined,
  max_number: number|null|undefined,
  step: number
}
export type ValidateParagraphDbResponse = {
  min_length: number|null|undefined,
  max_length: number|null|undefined 
}
export type ValidateRangeDbResponse = {
  range_min: number,
  range_max: number,
  range_step: number
}
export type ValidateRankingDbResponse = {
  required_ids: number[]
}
export type ValidateSelectionDbResponse = {
  include_other_allowed: boolean,
  valid_indices: number[]
}
export type ValidateShortAnswerDbResponse = {
  min_length: number|null|undefined,
  max_length: number|null|undefined
}
export type ValidateTimeDbResponse = {
  min_time: strimg|null|undefined,
  max_time: strimg|null|undefined,
  step: number
};
export type ValidateSurveyResponseDbResponse = null|ValidateCheckboxDbResponse|ValidateDateDbResponse|ValidateDatetimeDbResponse|ValidateMonthDbResponse|ValidateMultipleChoiceDbResponse|ValidateNumberDbResponse|ValidateParagraphDbResponse|ValidateRangeDbResponse|ValidateRankingDbResponse|ValidateSelectionDbResponse|ValidateShortAnswerDbResponse|ValidateTimeDbResponse;


export type ParsedAudioSurveyResponse = {
  src: string,
  title: string
};
export type ParsedCheckboxSurveyResponse =  {
  choices: number[]
};
export type ParsedColorSurveyResponse =  {
  color: string
};
export type ParsedDateSurveyResponse =  {
  date: string
};
export type ParsedDatetimeSurveyResponse =  {
  datetime: string
};
export type ParsedImageSurveyResponse =  {
  src: string,
  short_description: string,
  long_description: string
};
export type ParsedMonthSurveyResponse =  {
  month: string
};
export type ParsedMultipleChoiceSurveyResponse =  {
  choice: number
};
export type ParsedNumberSurveyResponse =  {
  number: number
};
export type ParsedParagraphSurveyResponse =  {
  response: string
};
export type ParsedRangeSurveyResponse =  {
  input: number
};
export type ParsedRankingSurveyResponse =  {
  ordered: number[]
};
export type ParsedSelectionSurveyResponse =  {
  choice: number|null,
  other_checked: boolen,
  other_option: string|null
};
export type ParsedShortAnswerSurveyResponse =  {
  response: string 
};
export type ParsedShortBlogSurveyResponse =  {
  editor_state: any,
  desktop_html: string,
  tablet_html: string,
  mobile_html: string,
  innerText: string 
};
export type ParsedTimeSurveyResponse =  {
  time: string
};
export type ParsedVideoSurveyResponse =  {
  src: string,
  title: string,
  description: string,
  height: number
};
export type ParsedSurveyResponse = {
  question_id: number, 
  question_type: ValidSurveyQuestionTypes,
  required: boolean,
  confirmed_response: boolean,
  response: ParsedAudioSurveyResponse|ParsedCheckboxSurveyResponse|ParsedColorSurveyResponse|ParsedDateSurveyResponse|ParsedDatetimeSurveyResponse|ParsedImageSurveyResponse|ParsedMonthSurveyResponse|ParsedMultipleChoiceSurveyResponse|ParsedNumberSurveyResponse|ParsedParagraphSurveyResponse|ParsedRangeSurveyResponse|ParsedRankingSurveyResponse|ParsedSelectionSurveyResponse|ParsedShortAnswerSurveyResponse|ParsedShortBlogSurveyResponse|ParsedTimeSurveyResponse|ParsedVideoSurveyResponse,
  date_responded: number
};

