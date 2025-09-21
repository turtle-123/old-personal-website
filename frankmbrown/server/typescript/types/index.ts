import type { RedisClientType, RedisModules, RedisFunctions, RedisScripts } from "redis";
import { ALLOWED_TIME_ZONE } from "../utils/time";
import type { ALLOWED_APPLICATION_LANGUAGES } from "../ROUTER/functions/settingsHandler";

type Breadcrumbs = {name: string, item: string, position: number}[];
type RequestRedis = RedisClientType<any & RedisModules, RedisFunctions, RedisScripts>;
export type Spread<T1, T2> = Omit<T2, keyof T1> & T1;
/**
 * **id** should not have the initial hash
 */
type TableOfContentsItem = {id: string, text: string};
type SEO = {
    breadcrumbs: Breadcrumbs,
    keywords: string[],
    title: string,
    description: string,
    path: string,
    tableOfContents: TableOfContentsItem[],
    noIndex?:boolean,
    image?: string
};
type ThemeColorsObject = {
    primary: string,
    secondary: string,
    warning: string,
    success: string,
    info: string,
    error: string,
    buttonContrastText: string,
    background: string,
    secondaryBackground: string,
    navbarColor: string,
    shadowColor: string,
    textColor: string
};
type ValidFonts = "Anuphan, sans-serif;"|
    "Arial, sans-serif;"|
    "Verdana, sans-serif;"|
    "Tahoma, sans-serif;"|
    "Trebuchet MS, sans-serif;"|
    "Times New Roman, serif;"|
    "Georgia, serif;"|
    "Garamond, serif;"|
    "Courier New, monospace;"|
    "Brush Script MT, cursive;";
export type SUPPORTED_CODEMIRROR_THEMES = "abcdef"|"abyss"|"androidstudio"|"andromeda"|"atomone"|"aura"|"bbedit"|"basic light"|"basic dark"|"bespin"|"copilot"|"dracula"|"darcula"|"duotone light"|"duotone dark"|"eclipse"|"github light"|"github dark"|"gruvbox dark"|"gruvbox light"|"material light"|"material dark"|"monokai"|"monokai dimmed"|"kimbie"|"noctis-lilac"|"nord"|"okaidia"|"quietlight"|"red"|"solarized light"|"solarized dark"|"sublime"|"tokyo-night"|"tokyo-night-storm"|"tokyo-night-day"|"tomorrow-night-blue"|"white dark"|"white light"|"vscode"|"xcode light"|"xcode dark";
export type VALID_AI_WRITER_MODELS_TYPE = 'meta-llama/llama-3.2-1b-instruct'|'meta-llama/llama-3.2-3b-instruct'|'meta-llama/llama-3.1-8b-instruct'|'qwen/qwen-2.5-7b-instruct'|'mistralai/mistral-7b-instruct'|'google/gemma-2-9b-it'|'meta-llama/llama-3-8b-instruct'|'mistralai/ministral-3b'|'amazon/nova-micro-v1'|'google/gemini-flash-1.5-8b'|'mistralai/ministral-8b'|'google/gemini-2.0-flash-001'|'meta-llama/llama-3.3-70b-instruct'|'meta-llama/llama-3.1-70b-instruct'|'google/gemma-7b-it'|'openai/gpt-4o-mini-2024-07-18'|'meta-llama/llama-2-13b-chat'|'anthropic/claude-3-haiku'|'openai/gpt-3.5-turbo'|'anthropic/claude-3.5-haiku'|'openai/o3-mini'|'openai/gpt-4o';
export type VALID_AI_CODER_MODELS_TYPE = 'qwen/qwen-2.5-coder-32b-instruct'|'google/gemini-flash-1.5'|'google/gemini-2.0-flash-001'|'meta-llama/llama-3.3-70b-instruct'|'openai/gpt-4o-mini'|'mistralai/mistral-7b-instruct-v0.1'|'google/palm-2-chat-bison';


type Settings = {
  mode: 'dark'|'light',
  disableDefaultTab: boolean,
  spellcheck: boolean,
  tabSize: number,
  fontFamily: string,
  lightMode: ThemeColorsObject,
  darkMode: ThemeColorsObject,
  settingsString: string,
  code_editor_theme: SUPPORTED_CODEMIRROR_THEMES,
  code_editor_emmet: boolean,
  desktop_application_size: number,
  tablet_application_size: number,
  mobile_application_size: number,
  lang: ALLOWED_APPLICATION_LANGUAGES,
  timezone: ALLOWED_TIME_ZONE,
  create_annotation: boolean,
  create_note: boolean,
  update_note: boolean,
  create_blog: boolean,
  update_blog: boolean,
  create_idea: boolean,
  update_idea: boolean,
  create_comment: boolean,
  create_jupyter_notebook: boolean,
  create_markdown_note: boolean,
  create_stream_consciousness: boolean,
  create_daily_reading: boolean,
  create_tex_note: boolean,
  create_link: boolean,
  create_quote: boolean,
  create_project: boolean,
  project_update: boolean,
  create_survey: boolean, 
  create_goodreads: boolean, 
  create_letterboxd: boolean, 
  create_game: boolean, 
  create_3d_design: boolean,
  create_electronics: boolean,
  include_autocomplete_suggestions: boolean,
  enable_ai_writer: boolean,
  ai_writer_temperature: number,
  ai_writer_max_tokens: number,
  ai_writer_model: VALID_AI_WRITER_MODELS_TYPE,
  enable_ai_coder: boolean,
  ai_coder_temperature: number,
  ai_coder_max_tokens: number,
  ai_coder_model: VALID_AI_CODER_MODELS_TYPE,
  ai_chat_id: string
};
type CircleInput =  { c: {lat: number, lng: number}, r: number};
type PolygonInput = {
    type: "Feature",
    geometry: {
        type: "Polygon",
        coordinates: [number,number][][]
    },
    properties: {
        [key: string]: any
    }
}
export type {
    RequestRedis,
    Breadcrumbs,
    SEO,
    TableOfContentsItem,
    ThemeColorsObject,
    Settings,
    ValidFonts,
    CircleInput,
    PolygonInput
};