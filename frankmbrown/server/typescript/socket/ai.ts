/**
DROP TABLE autocomplete;
CREATE UNLOGGED TABLE autocomplete (
	id serial PRIMARY KEY,
	word TEXT NOT NULL,
	frequency bigint NOT NULL
);
CREATE INDEX autocomplete_idx ON autocomplete USING GIN (word gin_trgm_ops);

CREATE TABLE ai_writer (
	id serial PRIMARY KEY,
	ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
	user_id integer REFERENCES users(id) ON DELETE CASCADE,
	model TEXT NOT NULL,
	context TEXT NOT NULL,
	response TEXT NOT NULL
);
CREATE TABLE ai_coder (
	id serial PRIMARY KEY,
	ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
	user_id integer REFERENCES users(id) ON DELETE CASCADE,
	model TEXT NOT NULL,
	context TEXT NOT NULL,
	code TEXT NOT NULL
);	

DROP TABLE ai_chat;
CREATE TABLE ai_chat (
  id serial PRIMARY KEY,
  ip_id int NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  date_created bigint NOT NULL,
  model TEXT NOT NULL,
  user_message boolean NOT NULL,
  markdown TEXT NOT NULL,
  html TEXT NOT NULL,
  stopped boolean NOT NULL,
  is_error boolean NOT NULL DEFAULT false,
  input_tokens smallint,
  output_tokens smallint, 
  cost real NOT NULL,
  chat_name TEXT
);
CREATE INDEX ON ai_chat USING BTREE(ip_id);
CREATE INDEX ON ai_chat USING BTREE(user_id);
CREATE INDEX ON ai_chat USING GIN(chat_id gin_trgm_ops);

DROP TABLE ai_write;
CREATE TABLE ai_write (
  id serial PRIMARY KEY,
  ip_id int NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  write_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  markdown TEXT NOT NULL,
  stopped boolean NOT NULL,
  is_error boolean NOT NULL DEFAULT false,
  input_tokens smallint,
  output_tokens smallint, 
  cost real NOT NULL,
  date_created bigint NOT NULL,
  model TEXT NOT NULL
);
CREATE INDEX ON ai_write USING BTREE(ip_id);
CREATE INDEX ON ai_write USING BTREE(user_id);
*/

// https://openrouter.ai/docs/api-reference/streaming

import { env } from "process";
import { SessionSocket } from "..";
import getDatabase from "../database";
import { VALID_AI_CODERS_SET, VALID_AI_WRITERS_SET } from "../ROUTER/functions/settingsHandler";
import { isMemberOf } from "../utils/set";
import { getUnixTime } from "../utils/time";
import { markdownToHTMLAi } from "../ROUTER/functions/markdown";
import crypto from 'node:crypto';
import { Request } from "express";

const OPEN_ROUTER_KEY = env.OPEN_ROUTER_KEY;
if (!!!OPEN_ROUTER_KEY) throw new Error("Unable to get OPEN_ROUTER_KEY from env.");
const AI_CHATS:{[chat_id:string]: {
  markdown: string, // in markdown
  message_id: string,
  controller: AbortController,
  render_length: number,
  gen_id: string,
  user_message_id: number,
  model: string,
  prompt_tokens: number, 
  completion_tokens: number
}} = {};
const CHAT_COMPLETION_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_CHAT_SYSTEM = [{ role: "system", content: "You are a chatbot for frankmbrown.net, the personal website of Frank McKee Brown. Frank is a 25 year-old engineer who studied Mechanical Engineering at Auburn University who likes to learn more about technology, philosophy and literature. Your job is to respond to user queries as best as possible using **github-flavored markdown**." },{ role: "system", content: `If the user ever asks about who Frank Mckee Brown is, or who I am, here is some information to help you out:

- I was born in Birmingham, Alabama on October 8, 1998.
- I was educated in the Mountain Brook School system and graduated High School in May 2017. 
  - I graduated in the top-5 of my high school graduating class. 
  - During my time in Mountain Brook, I played many sports. I played baseball through the 9th grade, wrestled through my senior year, and played football through my senior year. I did well in wrestling and scored 5 touchdowns as a running back for the football team. 
  - I enjoyed my time in Mountain Brook, a suburb of Birmingham. 
-  After high school, I enrolled in Auburn University and decided to major in Mechanical Engineering with a minor in Business Engineering Technology, an Entrepreneurial minor. 
  - During my time at Auburn, I was a teaching assistant for the Physics of Electricity and Magnetism and System Dynamics and Controls. 
  - I was awarded a full scholarship and some additional scholarships.
  - I was awarded the O'Neal Austin Best Student Award for the Kinematics and Dynamics of Machines and System Dynamics and Controls. 
  - I developed an interest in 3D printing and electronics during college. 
  - I graduated near the top of my class with a 3.93 GPA. 
  - I worked construction for a couple summers, and I did a study abroad program in Bavaria, Germany. 
  - I was supposed to do an Engineering Internship in Houston, Texas, but it was cancelled due to COVID-19.
- After college, I have worked as a mechanical design engineer for a small engineering design firm, a quality engineer for a Medical Device Company, and as a startup founder.
- My hobbies include reading about literature, reading about science/technology/engineering, watching sports, coding, 3D printing, designing 3D objects, and learning more about general topics.
- My favorite sports teams are Auburn football/Auburn Basketball/New England Patriots, Miami Heat, and New York Yankees.`}];
const AI_WRITE_SYSTEM = { role: "system", content: `You are an advanced AI writing assistant trained to seamlessly continue a given passage of text while maintaining coherence, logical flow, and stylistic consistency. Given an input selection, generate the next segment that naturally extends the thought, action, or description. Your response should be engaging, contextually appropriate, and creative when necessary.

Example Input:
"The quick brown fox"

Example Output:
"jumped over the lazy moon, its sleek body silhouetted against the silver glow of the night sky."

Ensure that your continuation aligns with the genre, tone, and style of the given input. Avoid repetition, contradictions, or abrupt changes in subject matter unless specifically requested. Make sure to respond with **GitHub-flavored markdown**, but **DO NOT** wrap the response in a fenced markdown block (e.g., \`\`\`markdown).` };
const AI_REWRITE_SYSTEM = { role: "system", content: `You are an advanced AI writing assistant designed to rewrite a given passage while maintaining coherence with the preceding text. Your goal is to improve clarity, fluency, and engagement while preserving the original meaning and ensuring a smooth transition.

The input will be formatted as follows:

<CONTEXT>{Preceding Text}</CONTEXT>

<TEXT-TO-REWRITE>{Target Text}</TEXT-TO-REWRITE>

Your task is to rewrite **TEXT-TO-REWRITE** so that it seamlessly follows Context, improving flow, readability, and stylistic consistency.

EXAMPLE INPUT:

<CONTEXT>The forest was alive with the sounds of crickets and rustling leaves.</CONTEXT>

<TEXT-TO-REWRITE>The wind moved through the trees, making them sway gently.</TEXT-TO-REWRITE>

EXAMPLE OUTPUT:

"The evening breeze wove through the towering trees, setting their branches into a slow and graceful dance." 

Ensure your rewritten text maintains the meaning while enhancing coherence, readability, and engagement. Avoid repetition, unnatural transitions, or drastic shifts in tone unless necessary.` };
const AI_REWRITE_SELECTION_SYSTEM = { role: "system", content: `You are an advanced AI writing assistant designed to rewrite a given selection of text while preserving its meaning, improving clarity, fluency, and engagement, and ensuring it fits naturally within its Markdown context.

The input will be provided in the following format:

<BEFORE-MARKDOWN>{Markdown before the text to rewrite}</BEFORE-MARKDOWN>

<MARKDOWN-AROUND-TEXT>{Markdown formatting that surrounds the text to rewrite}</MARKDOWN-AROUND-TEXT>

<TEXT-TO-REWRITE>{Target text}</TEXT-TO-REWRITE>

<AFTER-MARKDOWN>{Markdown after the text to rewrite}</AFTER-MARKDOWN>

Your task is to generate a **rewritten version** of the "TEXT-TO-REWRITE" that seamlessly integrates within its provided Markdown context. Ensure:

- The rewritten text retains its intended meaning while improving clarity and readability.
- The response does not alter the Markdown structure—only replace the text within the given MARKDOWN-AROUND-TEXT section.
- The rewritten text flows naturally with both the BEFORE-MARKDOWN and following AFTER-MARKDOWN content.` };

const AI_CODING_SYSTEM = { role: "system", content: "You are a writing assistant whose job it is to add more content to an article, blog post, or notes given some CONTEXT. You should write using github-flavored-markdown." };
const GET_QUERY_GENERATION_STATS_URL = (gen_id:string) => `https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(gen_id)}`;
const QUERY_GENERATION_BODY = {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${OPEN_ROUTER_KEY}`,
    'Content-Type': 'application/json',
  }
}
const GET_CHAT_COMPLETION_BODY = (model:string,max_tokens:number,temperature:number,messages:any[],controller:AbortController) => {
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPEN_ROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages, 
      max_tokens,
      temperature,
      stream: true 
    }),
    signal: controller.signal
  }
};

/* -------------------------------------------- Autocomplete ------------------------------------------------- */
type AutoCompleteMessageType = [string,string]; // [match,context]
type AutocompleteCallback = (s:[string|null,string]) => void;
export function getOnAIAutocomplete(socket:SessionSocket) {
  const func = async function (arr:AutoCompleteMessageType,callback:AutocompleteCallback) {
    const lower_case = arr[0].toLowerCase();
    const resp = await getDatabase().query(`SELECT word, frequency FROM autocomplete WHERE word LIKE $1 || '%' AND word <> $1 ORDER BY frequency DESC LIMIT 1;`,[lower_case]);
    const rows = resp.rows;
    if (rows.length&&rows[0].word) {
      const resp = rows[0].word.replace(lower_case,'');
      if (resp.trim().length) callback([resp,arr[1]]);
      else callback([null,arr[1]]);
    } else {
      callback([null,arr[1]]);
    }
  }
  return func;
}


/* -------------------------------------------- AI Chat ------------------------------------------------- */
type AIChatMessageType = {
  markdown: string,
  html: string,
  message_id?: string
}
type ChatMessageCallback = {
  error: boolean,
  message: string,
  id: string,
  chat_name?: string,
  chat_id?: string 
}
export function getOnAIChat(socket:SessionSocket) {
  const func = async function (json:AIChatMessageType,callback:(m:ChatMessageCallback) => void) {
    try {
      const markdown = json.markdown;
      const html = json.html;
      const session = socket.request.session;
      const temperature = 0.7;
      const model = session.settings.ai_writer_model;
      const ip_id = session.ip_id;
      const user_id = session.auth.userID || null;
      if (!!!isMemberOf(model,VALID_AI_WRITERS_SET)) {
        callback({ error: true, message: "Invalid ai writing model.", id: '' });
        return;
      }
      const chat_id = session.settings.ai_chat_id;
      const messages =  [
        ...AI_CHAT_SYSTEM
      ];
      const date_created = getUnixTime();
      const [prior_messages_resp,curr_cost] = await Promise.all([
        getDatabase().query(`SELECT user_message, markdown, chat_name FROM ai_chat WHERE chat_id=$1 ORDER BY id DESC LIMIT 100;`,[chat_id]),
        getDatabase().query(`SELECT SUM(cost) AS today_cost FROM ai_chat WHERE ${Number.isInteger(user_id)?`user_id`:`ip_id`}=$1 AND date_created-$2 < 86400;`,[Number.isInteger(user_id)?user_id:ip_id,date_created])
      ]);
      const cost = curr_cost?.rows?.[0].today_cost;
      if (cost>1) {
        callback({ error: true, message: "The maximum amount of queries each user can commit per day is $1. You have exceeded this limit.", id: ''});
        return;
      }
      var response:any;
      var userMessageResponse:any;
      var chat_name:string|undefined = undefined;
      var chat_name_response:any;
      const prior_messages_context = prior_messages_resp.rows.map((obj) => {
        if (!!!chat_name) chat_name = obj.chat_name;
        if (obj.user_message) {
          return { role: "user", content: obj.markdown }
        } else {
          return { role: "assistant", content: obj.markdown};
        }
      }).reverse();
      messages.push(...prior_messages_context);
      messages.push({
        role: 'user',
        content: `${markdown}`
      });
      const controller = new AbortController();
      if (chat_name===undefined) {
        [response,userMessageResponse,chat_name_response] = await Promise.all([
          fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,2000,temperature,messages,controller)),
          getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,cost,chat_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`,[ip_id,user_id,chat_id,date_created,model,true,markdown,html,false,0,chat_name]),
          fetch(CHAT_COMPLETION_URL,{method: 'POST',headers: {Authorization:`Bearer ${OPEN_ROUTER_KEY}`,'Content-Type':'application/json'},body: JSON.stringify({model: 'google/gemini-flash-1.5-8b',messages: [{ role: "system", content: `Summarize the purpose or main topic of this MESSAGE in 5 words or fewer, suitable as a clear and descriptive title for a chat sidebar. MESSAGE: """${markdown}"""`}], max_tokens: 20,temperature: 0.3,stream: false})})
        ]); 
      } else {
        [response,userMessageResponse] = await Promise.all([
          fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,2000,temperature,messages,controller)),
          getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,cost,chat_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`,[ip_id,user_id,chat_id,date_created,model,true,markdown,html,false,0,chat_name])
        ]); 
      }
      if (chat_name_response) {
        const a = await chat_name_response.json();
        chat_name = a.choices[0].message.content.trim()
        await getDatabase().query(`UPDATE ai_chat SET chat_name=$1 WHERE chat_id=$2;`,[chat_name,chat_id]);
      }
      const userMessageResponseId = userMessageResponse.rows?.[0]?.id;
      if (!!!Number.isInteger(userMessageResponseId)) {
        throw new Error("Something went wrong inserting the user message into ai_chat.");
      }
      const reader = response.body?.getReader();
      if (!!!reader) {
        await getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,cost,chat_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,10,$11,$12);`,[ip_id,user_id,chat_id,date_created,model,false,'Response body is not readable',`<p class="t-error bold">Response body is not readable.</p>`,false,true,0,chat_name]);
        callback({ error: true, message: "Response body is not readable.", id: ''});
        return;
      }
      const id_uuid = 'id_'.concat(crypto.randomUUID());
      if (chat_name_response) callback({ error: false, message: "Sucessfully submiited AI chat message.", id: id_uuid, chat_name, chat_id });
      else callback({ error: false, message: "Sucessfully submiited AI chat message.", id: id_uuid });
      const decoder = new TextDecoder();
      let buffer = '';
      AI_CHATS[chat_id] = {
        markdown: '',
        message_id: id_uuid,
        controller,
        render_length: 0,
        gen_id: '',
        user_message_id: userMessageResponseId,
        model,
        prompt_tokens: 0,
        completion_tokens: 0
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Append new chunk to buffer
          buffer += decoder.decode(value, { stream: true });
          // Process complete lines from buffer
          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const gen_id_new = parsed.id;
                const usage = parsed.usage;
                const content = parsed.choices[0].delta.content;
                if (usage) {
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].prompt_tokens = usage.prompt_tokens;
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].completion_tokens = usage.completion_tokens;
                }
                if (gen_id_new&&AI_CHATS[chat_id]) AI_CHATS[chat_id].gen_id = gen_id_new;
                if (content) {
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].markdown += content;
                  if (AI_CHATS[chat_id] && AI_CHATS[chat_id].markdown.length - AI_CHATS[chat_id].render_length > 20) {
                    if (AI_CHATS[chat_id]) AI_CHATS[chat_id].render_length = AI_CHATS[chat_id].markdown.length;
                    if (AI_CHATS[chat_id]) {
                      socket.emit("ai-chat",{ message_id: id_uuid, markdown: AI_CHATS[chat_id].markdown, end: false });
                    }
                  }
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      } finally {
        reader.cancel();
        if (AI_CHATS[chat_id]) {
          const html = await markdownToHTMLAi(AI_CHATS[chat_id].markdown);
          socket.emit("ai-chat",{ message_id: id_uuid, markdown: AI_CHATS[chat_id].markdown, end: true });
          const { markdown, gen_id, user_message_id, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt } = AI_CHATS[chat_id];
          delete AI_CHATS[chat_id];
          const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
          await getDatabase().query(`WITH update_input AS (
    UPDATE ai_chat SET input_tokens=$1 WHERE id=$2
  ) INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,input_tokens,output_tokens,cost,chat_name) VALUES ($3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);`,[tokens_prompt,user_message_id,ip_id,user_id,chat_id,getUnixTime(),model,false,markdown,html,false,false,0,tokens_completion,total_cost,chat_name]);
          return;
        }
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }
  return func;
}

/* -------------------------------------------- COPY AI Chat URL ------------------------------------------------- */
type CopyUrlMessageType = undefined;
type CopyUrlCallback = {
  error: boolean,
  chat_url: string
}
export function getOnCopyAiURL(socket:SessionSocket) {
  const func = async function (json:CopyUrlMessageType,callback:(m:CopyUrlCallback) => void) {
    try {
      const session = socket.request.session;
      const chat_id = session.settings.ai_chat_id;
      const url = `https://frankmbrown/ai-tools/ai-chat/${encodeURIComponent(chat_id)}`;
      callback({ chat_url: url, error: false });
      return;
    } catch(e) {
      console.error(e);
      callback({ chat_url: '', error: true });
      return;
    }
  }
  return func;
}

/* -------------------------------------------- Change AI Chat ------------------------------------------------- */
type ChangeAiChatMessageType = { new_chat_id: string };
type ChangeAiChatCallback = {
  error: boolean, 
  new_chat_html: string
}
export function getOnChangeAIChat(socket:SessionSocket) {
  const func = async function (json:ChangeAiChatMessageType,callback:(m:ChangeAiChatCallback) => void) {
    try {
      const new_chat_id = json.new_chat_id;
      if (!!!new_chat_id) {
        callback({ error: true, new_chat_html: '' });
        return;
      }
      const db = getDatabase();
      const resp = await db.query(`SELECT id, user_message, html, model, is_error AS error FROM ai_chat WHERE chat_id=$1 ORDER BY id DESC LIMIT 100;`,[new_chat_id])
      if (!!!resp.rows.length) {
        callback({ error: true, new_chat_html: '' });
        return;
      }
      var str = '';
      if (resp.rows.length) {
        for (let message of resp.rows.reverse()) {
          const { user_message, html, model, id, error }:{model:string,error:boolean, user_message:boolean,html:string,id:number} = message;
          if (user_message) {
            str+=`<fieldset role="none" class="response-ai-chat user">
            <legend role="none" class="flex-row align-center gap-1"><span>User</span> <svg class="ai-chat" viewBox="0 0 448 512" title="user" focusable="false" inert tabindex="-1"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"></path></svg></legend>
            <div class="lexical-wrapper" data-editable="false" data-type="full" data-rich-text-editor="true" id="ai-chat-response-${id}">${html}</div>
            </fieldset>`;
          } else if (error) {
            str+=`<div style="margin-top:6px;" class="text-align-center">${html}</div>`
          } else {
            var svg = '';
            var className = '';
            var modelProviderName = '';
            if (model.includes('meta-llama')) {
              modelProviderName = 'Meta';
              svg = `<svg class="ai-chat" viewBox="0 0 640 512" title="meta" focusable="false" inert="" tabindex="-1"><path d="M640 317.9C640 409.2 600.6 466.4 529.7 466.4C467.1 466.4 433.9 431.8 372.8 329.8L341.4 277.2C333.1 264.7 326.9 253 320.2 242.2C300.1 276 273.1 325.2 273.1 325.2C206.1 441.8 168.5 466.4 116.2 466.4C43.42 466.4 0 409.1 0 320.5C0 177.5 79.78 42.4 183.9 42.4C234.1 42.4 277.7 67.08 328.7 131.9C365.8 81.8 406.8 42.4 459.3 42.4C558.4 42.4 640 168.1 640 317.9H640zM287.4 192.2C244.5 130.1 216.5 111.7 183 111.7C121.1 111.7 69.22 217.8 69.22 321.7C69.22 370.2 87.7 397.4 118.8 397.4C149 397.4 167.8 378.4 222 293.6C222 293.6 246.7 254.5 287.4 192.2V192.2zM531.2 397.4C563.4 397.4 578.1 369.9 578.1 322.5C578.1 198.3 523.8 97.08 454.9 97.08C421.7 97.08 393.8 123 360 175.1C369.4 188.9 379.1 204.1 389.3 220.5L426.8 282.9C485.5 377 500.3 397.4 531.2 397.4L531.2 397.4z"></path></svg>`;
              className = "meta";
            } else if (model.includes('qwen')) {
              svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z"></path></svg>`;
              className = 'qwen';
              modelProviderName = 'Qwen';
            } else if (model.includes('google')) {
              svg = `<svg class="ai-chat" viewBox="0 0 488 512" title="google" focusable="false" inert="" tabindex="-1"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>`;
              className = 'google';
              modelProviderName = 'Google';
            } else if (model.includes('mistralai')) {
              svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em"><path d="M3.428 3.4h3.429v3.428H3.428V3.4zm13.714 0h3.43v3.428h-3.43V3.4z"></path><path d="M3.428 6.828h6.857v3.429H3.429V6.828zm10.286 0h6.857v3.429h-6.857V6.828z"></path><path d="M3.428 10.258h17.144v3.428H3.428v-3.428z"></path><path d="M3.428 13.686h3.429v3.428H3.428v-3.428zm6.858 0h3.429v3.428h-3.429v-3.428zm6.856 0h3.43v3.428h-3.43v-3.428z"></path><path d="M0 17.114h10.286v3.429H0v-3.429zm13.714 0H24v3.429H13.714v-3.429z"></path></svg>`;
              className = 'mistral';
              modelProviderName = 'Mistral';
            } else if (model.includes('amazon')) {
              svg = `<svg class="ai-chat" viewBox="0 0 448 512" title="amazon" focusable="false" inert="" tabindex="-1"><path d="M257.2 162.7c-48.7 1.8-169.5 15.5-169.5 117.5 0 109.5 138.3 114 183.5 43.2 6.5 10.2 35.4 37.5 45.3 46.8l56.8-56S341 288.9 341 261.4V114.3C341 89 316.5 32 228.7 32 140.7 32 94 87 94 136.3l73.5 6.8c16.3-49.5 54.2-49.5 54.2-49.5 40.7-.1 35.5 29.8 35.5 69.1zm0 86.8c0 80-84.2 68-84.2 17.2 0-47.2 50.5-56.7 84.2-57.8v40.6zm136 163.5c-7.7 10-70 67-174.5 67S34.2 408.5 9.7 379c-6.8-7.7 1-11.3 5.5-8.3C88.5 415.2 203 488.5 387.7 401c7.5-3.7 13.3 2 5.5 12zm39.8 2.2c-6.5 15.8-16 26.8-21.2 31-5.5 4.5-9.5 2.7-6.5-3.8s19.3-46.5 12.7-55c-6.5-8.3-37-4.3-48-3.2-10.8 1-13 2-14-.3-2.3-5.7 21.7-15.5 37.5-17.5 15.7-1.8 41-.8 46 5.7 3.7 5.1 0 27.1-6.5 43.1z"></path></svg>`;
              className = 'amazon';
              modelProviderName = 'Amazon';
            } else if (model.includes('anthropic')) {
              svg = '<svg class="ai-chat" xmlns:x="ns_extend;" xmlns:i="ns_ai;" xmlns:graph="ns_graphs;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 92.2 65" xml:space="preserve"> <path d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z   M24.3,39.3l8.8-22.8l8.8,22.8H24.3z"></path></svg>';
              className = "anthropic";
              modelProviderName = "Anthropic";
            } else if (model.includes('openai')) {
              svg = `<svg class="ai-chat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" focusable="false" inert=""><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"></path></svg>`;
              className = 'openai';
              modelProviderName = 'OpenAI';
            }
            str+=`<fieldset role="none" class="response-ai-chat ai ${className}">
            <legend role="none" class="flex-row align-center gap-1"><span>${modelProviderName} (${model})</span> ${svg}</legend>
            <div class="lexical-wrapper" data-rich-text-editor="true" data-editable="false" data-type="full" id="ai-chat-response-${id}">${html}</div>
            </fieldset>`;
          } 
        }
      } else {
        str+=`<div style="margin-top:6px;" class="text-align-center"><p class="body1 bold text-align-center" style="max-width: 600px; margin: auto;">Welcome to Frank's AI Chat. Edit the Model you want to use in the settings dialog.Chat with the model using the textbox below. <br> <mark class="bold">NOTE:</mark> Users are limited to $1 per day in chat-related costs, though this is actually a lot of messages.</p></div>`
      }
      
      socket.request.session.settings.ai_chat_id = new_chat_id;
      (socket.request as Request).session.save((err) => {
        if (err) console.error(err);
      });

      callback({ error: false, new_chat_html: str });
      return;
    } catch(e) {
      console.error(e);
      callback({ error: true, new_chat_html: '' });
      return;
    }
  }
  return func;
}

/* -------------------------------------------- End/PAUSE AI Chat ------------------------------------------------- */
type EndAIChatMessageType = {
  markdown: string,
  html: string,
  message_id?: string
}
type EndChatMessageCallback = {
  error:boolean,
  message_id: string
}
export function getOnEndAIChat(socket:SessionSocket) {
  const func = async function (obj:{message_id:string, chat_id?: string },callback:(input:EndChatMessageCallback) => void) {
    try {
      if (!!!obj.message_id) {
        throw new Error("Invalid message id.")
      }
      const chat_id = obj.chat_id || socket.request.session.settings.ai_chat_id;
      if (!!!AI_CHATS[chat_id]) {
        throw new Error(`Chat ID ${chat_id} does not exist in saved AI_CHATS.`);
      }
      const chat_obj = AI_CHATS[chat_id];
      if (chat_obj.message_id!==obj.message_id) {
        throw new Error("The message id provided in the end ai chat request does not match the id of the ")
      }
      chat_obj.controller.abort();
      const { markdown, gen_id, user_message_id, model, message_id, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt } = AI_CHATS[chat_id];
      callback({ error: false, message_id });
      delete AI_CHATS[chat_id];
      const html = await markdownToHTMLAi(markdown);
      const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
      const ip_id = socket.request.session.ip_id;
      const user_id = socket.request.session.auth.userID || null;
      await getDatabase().query(`WITH update_input AS (
  UPDATE ai_chat SET input_tokens=$1 WHERE id=$2
) INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,input_tokens,output_tokens,cost) SELECT $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,chat_name FROM ai_chat WHERE chat_id=$5 LIMIT 1;`,[tokens_prompt,user_message_id,ip_id,user_id,chat_id,getUnixTime(),model,false,markdown,html,true,false,0,tokens_completion,total_cost]);
      return;
    } catch (e) {
      console.error(e);
      callback({ error: true, message_id: obj.message_id || '' });
      return;
    }
  }
  return func;
}

/* -------------------------------------------- New AI Chat ------------------------------------------------- */
export function getOnNewAIChat(socket:SessionSocket) {
  const func = function (obj:undefined,callback:(input:{error:boolean})=> void) {
    const curr_chat_id = socket.request.session.settings.ai_chat_id;
    if (AI_CHATS[curr_chat_id]) {
      callback({error: true});
      return;
    }
    socket.request.session.settings.ai_chat_id = 'chat_'.concat(crypto.randomUUID());
    (socket.request as Request).session.save((err) => {
      if (err) console.error(err);
    });

    callback({ error: false });
  }
  return func;
}

/* -------------------------------------------- AI Writing ------------------------------------------------- */
const AI_WRITING:{[message_id:string]: {
  markdown: string, // in markdown
  controller: AbortController,
  render_length: number,
  gen_id: string,
  model: string,
  prompt_tokens: number, 
  completion_tokens: number,
  prompt: string,
  type: string
}} = {};

type AIWritingMessageType = {
  type: 'write',
  markdown_context: string
}|{
  type: 'rewrite',
  rewrite_markdown: string, 
  markdown_context: string 
}|{
  type: 'rewrite-selection',
  selection_text_content: string, 
  markdown_to_rewrite: string,
  markdown_context_before: string, 
  markdown_context_after: string,
};

type AIWritingCallback = {
  message_id: string, 
  error: boolean, 
  message: string 
};

export function getOnAIWrite(socket:SessionSocket) {
  const func = async function (json:AIWritingMessageType,callback:(obj:AIWritingCallback)=> void) {
    const session = socket.request.session;
    const message_id = 'id_'.concat(crypto.randomUUID());
    const model = session.settings.ai_writer_model;
    const ip_id = session.ip_id;
    const user_id = session.auth.userID;
    const date_created = getUnixTime();
    try {
      const messages:any[] = [];
      var temperature = session.settings.ai_writer_temperature;
      var max_tokens = session.settings.ai_writer_max_tokens;
      var prompt = '';
      switch (json.type) {
        case 'write': {
          messages.push(AI_WRITE_SYSTEM);
          prompt = `"${json.markdown_context}"`;
          messages.push({ role: "user", content: prompt });
          temperature = 0.9;
          break;
        }
        case 'rewrite': {
          messages.push(AI_REWRITE_SYSTEM);
          prompt = `<CONTEXT>${json.markdown_context}</CONTEXT>

<TEXT-TO-REWRITE>${json.rewrite_markdown}</TEXT-TO-REWRITE>`;
          messages.push({ role: "user", content: prompt });
          max_tokens = 1000;
          break;
        }
        case 'rewrite-selection': {
          messages.push(AI_REWRITE_SELECTION_SYSTEM);
          prompt = `<BEFORE-MARKDOWN>${json.markdown_context_before}</BEFORE-MARKDOWN>

<MARKDOWN-AROUND-TEXT>${json.markdown_to_rewrite}</MARKDOWN-AROUND-TEXT>

<TEXT-TO-REWRITE>${json.selection_text_content}</TEXT-TO-REWRITE>

<AFTER-MARKDOWN>${json.markdown_context_after}</AFTER-MARKDOWN>`;
          messages.push({ role: "user", content: prompt });
          max_tokens = 1000;
          break;
        }
        default: {
          throw new Error("Inavlid json for AI Writing.");
        }
      }
      const curr_cost = await getDatabase().query(`SELECT SUM(cost) AS today_cost FROM ai_write WHERE ${Number.isInteger(user_id)?`user_id`:`ip_id`}=$1 AND date_created-$2 < 86400;`,[Number.isInteger(user_id)?user_id:ip_id,date_created]);
      const cost = curr_cost?.rows?.[0].today_cost;
      if (cost>1) {
        callback({ error: true, message: "The maximum amount of queries each user can commit per day is $1. You have exceeded this limit.", message_id });
        return;
      }
      const controller = new AbortController();
      const response = await fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,2000,temperature,messages,controller));
      const reader = response.body?.getReader();
      if (!!!reader) {
        callback({ error: true, message: "Response body is not readable.", message_id });
        return;
      }
      callback({ error: false, message: "Sucessfully submiited AI chat message.", message_id });
      const decoder = new TextDecoder();
      let buffer = '';
      AI_WRITING[message_id] = {
        markdown: '',
        controller,
        render_length: 0,
        gen_id: '',
        model,
        prompt_tokens: 0,
        completion_tokens: 0,
        prompt,
        type: json.type
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Append new chunk to buffer
          buffer += decoder.decode(value, { stream: true });
          // Process complete lines from buffer
          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const gen_id_new = parsed.id;
                const usage = parsed.usage;
                const content = parsed.choices[0].delta.content;
                if (usage) {
                  if (AI_WRITING[message_id]) AI_WRITING[message_id].prompt_tokens = usage.prompt_tokens;
                  if (AI_WRITING[message_id]) AI_WRITING[message_id].completion_tokens = usage.completion_tokens;
                }
                if (gen_id_new&&AI_WRITING[message_id]) AI_WRITING[message_id].gen_id = gen_id_new;
                if (content) {
                  if (AI_WRITING[message_id]) AI_WRITING[message_id].markdown += content;
                  if (AI_WRITING[message_id] && AI_WRITING[message_id].markdown.length - AI_WRITING[message_id].render_length > 20) {
                    if (AI_WRITING[message_id]) AI_WRITING[message_id].render_length = AI_WRITING[message_id].markdown.length;
                    if (AI_WRITING[message_id]) {
                      socket.emit("ai-write",{ message_id, markdown: AI_WRITING[message_id].markdown, end: false });
                    }
                  }
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      } finally {
        reader.cancel();
        if (AI_WRITING[message_id]) {
          socket.emit("ai-write",{ message_id, markdown: AI_WRITING[message_id].markdown, end: true });
          const { markdown, gen_id, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt } = AI_WRITING[message_id];
          delete AI_WRITING[message_id];
          const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
          await getDatabase().query(`INSERT INTO ai_write (ip_id,user_id,message_id,write_type,prompt,markdown,stopped,is_error,input_tokens,output_tokens,cost,date_created,model) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);`,[ip_id,user_id,message_id,json.type,prompt,markdown,false,false,tokens_prompt,tokens_completion,total_cost,getUnixTime(),model]);
          return;
        }
      }
    } catch (e) {
      console.error(e);
      
    }
  }
  return func;
}

/* -------------------------------------------- AI Writing End ------------------------------------------------- */
type EndAiWritingType = {
  message_id: string
};

// End AI Write Early, e.g. when lexical node is removed
export function getOnAIWriteEnd(socket:SessionSocket) {
  const func = async function (obj:EndAiWritingType) {
    try {
      if (!!!obj.message_id) throw new Error("Could not find message_id when ending AI writing");
      if (!!!AI_WRITING[obj.message_id]) {
        throw new Error(`Message ID ${obj.message_id} does not exist in saved AI_WRITNG.`);
      }
      const { markdown, gen_id, model, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt, controller, prompt, type:json_type } = AI_WRITING[obj.message_id];
      controller.abort();
      delete AI_WRITING[obj.message_id];
      const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
      const ip_id = socket.request.session.ip_id;
      const user_id = socket.request.session.auth.userID || null;
      await getDatabase().query(`INSERT INTO ai_write (ip_id,user_id,message_id,write_type,prompt,markdown,stopped,is_error,input_tokens,output_tokens,cost,date_created,model) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13);`,[ip_id,user_id,obj.message_id,json_type,prompt,markdown,true,false,tokens_prompt,tokens_completion,total_cost,getUnixTime(),model]);
      return;
    } catch (e) {
      console.error(e);
      return;
    }
  }
  return func;
}


/* -------------------------------------------- AI Coding ------------------------------------------------- */
type AICodingMessageType = {
  message: string,
  message_id: string,
  type: 'dialog'|'chat'
}
export function getOnAICode(socket:SessionSocket) {
  const func = async function (json:AICodingMessageType) {
    const message = json.message;
    const messages =  [
      AI_CODING_SYSTEM,
      {
        role: 'user',
        content: `<CONTEXT>${message}</CONTEXT>`
      }
    ]
    const session = socket.request.session;
    const max_tokens = session.settings.ai_coder_max_tokens;
    const temperature = session.settings.ai_coder_temperature;
    const model = session.settings.ai_coder_model;
    if (!!!isMemberOf(model,VALID_AI_CODERS_SET)) {
      socket.emit('ai-code-response',{
        valid: false,
        error: "Invalid AI Coding model.",
      });
      return;
    }
    // const [response,] = await Promise.all([
    //   fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,max_tokens,temperature,messages)),
      
    // ]); 
    // const reader = response.body?.getReader();
    // if (!!!reader) {
    //   socket.emit('ai-chat-response',{
    //     valid: false,
    //     error: "Response body is not readable.",
    //   });
    //   return;
    // }
  }
  return func;
}

/* -------------------------------------------- AI Chat Page ------------------------------------------------- */
type AIChatPageMessageType = {
  markdown: string,
  html: string,
  message_id?: string,
  chat_id_send: string|undefined
}
type ChatMessagePageCallback = {
  error: boolean,
  message: string,
  id: string,
  chat_name?: string,
  chat_id?: string 
}
export function getOnAIChatPage(socket:SessionSocket) {
  const func = async function (json:AIChatPageMessageType,callback:(m:ChatMessagePageCallback) => void) {
    try {
      const markdown = json.markdown;
      const html = json.html;
      const session = socket.request.session;
      const temperature = 0.7;
      const model = session.settings.ai_writer_model;
      const ip_id = session.ip_id;
      const user_id = session.auth.userID || null;
      if (!!!isMemberOf(model,VALID_AI_WRITERS_SET)) {
        callback({ error: true, message: "Invalid ai writing model.", id: '' });
        return;
      }
      var chat_id:string;
      var send_chat_id:boolean = false;
      if (json.chat_id_send) {
        chat_id = json.chat_id_send;
      } else {
        chat_id = `chat_`.concat(crypto.randomUUID());
        send_chat_id = true;
      }
      
      const messages =  [
        ...AI_CHAT_SYSTEM
      ];
      const date_created = getUnixTime();
      const [prior_messages_resp,curr_cost] = await Promise.all([
        getDatabase().query(`SELECT user_message, markdown, chat_name FROM ai_chat WHERE chat_id=$1 ORDER BY id DESC LIMIT 100;`,[chat_id]),
        getDatabase().query(`SELECT SUM(cost) AS today_cost FROM ai_chat WHERE ${Number.isInteger(user_id)?`user_id`:`ip_id`}=$1 AND date_created-$2 < 86400;`,[Number.isInteger(user_id)?user_id:ip_id,date_created])
      ]);
      const cost = curr_cost?.rows?.[0].today_cost;
      if (cost>1) {
        callback({ error: true, message: "The maximum amount of queries each user can commit per day is $1. You have exceeded this limit.", id: ''});
        return;
      }
      var response:any;
      var userMessageResponse:any;
      var chat_name:string|undefined = undefined;
      var chat_name_response:any;
      const prior_messages_context = prior_messages_resp.rows.map((obj) => {
        if (!!!chat_name) chat_name = obj.chat_name;
        if (obj.user_message) {
          return { role: "user", content: obj.markdown }
        } else {
          return { role: "assistant", content: obj.markdown};
        }
      }).reverse();
      messages.push(...prior_messages_context);
      messages.push({
        role: 'user',
        content: `${markdown}`
      });
      const controller = new AbortController();
      if (chat_name===undefined) {
        [response,userMessageResponse,chat_name_response] = await Promise.all([
          fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,2000,temperature,messages,controller)),
          getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,cost) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id;`,[ip_id,user_id,chat_id,date_created,model,true,markdown,html,false,0]),
          fetch(CHAT_COMPLETION_URL,{method: 'POST',headers: {Authorization:`Bearer ${OPEN_ROUTER_KEY}`,'Content-Type':'application/json'},body: JSON.stringify({model: 'google/gemini-flash-1.5-8b',messages: [{ role: "system", content: `Summarize the purpose or main topic of this MESSAGE in 5 words or fewer, suitable as a clear and descriptive title for a chat sidebar. MESSAGE: """${markdown}"""`}], max_tokens: 20,temperature: 0.3,stream: false})})
        ]); 
      } else {
        [response,userMessageResponse] = await Promise.all([
          fetch(CHAT_COMPLETION_URL,GET_CHAT_COMPLETION_BODY(model,2000,temperature,messages,controller)),
          getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,cost,chat_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`,[ip_id,user_id,chat_id,date_created,model,true,markdown,html,false,0,chat_name])
        ]); 
      }
      if (chat_name_response) {
        const a = await chat_name_response.json();
        chat_name = a.choices[0].message.content.trim()
        await getDatabase().query(`UPDATE ai_chat SET chat_name=$1 WHERE chat_id=$2;`,[chat_name,chat_id]);
      }
      const userMessageResponseId = userMessageResponse.rows?.[0]?.id;
      if (!!!Number.isInteger(userMessageResponseId)) {
        throw new Error("Something went wrong inserting the user message into ai_chat.");
      }
      const reader = response.body?.getReader();
      if (!!!reader) {
        await getDatabase().query(`INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,cost,chat_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,10,$11);`,[ip_id,user_id,chat_id,date_created,model,false,'Response body is not readable',`<p class="t-error bold">Response body is not readable.</p>`,false,true,0,chat_name]);
        callback({ error: true, message: "Response body is not readable.", id: ''});
        return;
      }
      const id_uuid = 'id_'.concat(crypto.randomUUID());
      if (send_chat_id) callback({ error: false, message: "Sucessfully submiited AI chat message.", id: id_uuid, chat_name, chat_id });
      else callback({ error: false, message: "Sucessfully submiited AI chat message.", id: id_uuid });
      const decoder = new TextDecoder();
      let buffer = '';
      AI_CHATS[chat_id] = {
        markdown: '',
        message_id: id_uuid,
        controller,
        render_length: 0,
        gen_id: '',
        user_message_id: userMessageResponseId,
        model,
        prompt_tokens: 0,
        completion_tokens: 0
      }
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          // Append new chunk to buffer
          buffer += decoder.decode(value, { stream: true });
          // Process complete lines from buffer
          while (true) {
            const lineEnd = buffer.indexOf('\n');
            if (lineEnd === -1) break;
            const line = buffer.slice(0, lineEnd).trim();
            buffer = buffer.slice(lineEnd + 1);
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const gen_id_new = parsed.id;
                const usage = parsed.usage;
                const content = parsed.choices[0].delta.content;
                if (usage) {
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].prompt_tokens = usage.prompt_tokens;
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].completion_tokens = usage.completion_tokens;
                }
                if (gen_id_new&&AI_CHATS[chat_id]) AI_CHATS[chat_id].gen_id = gen_id_new;
                if (content) {
                  if (AI_CHATS[chat_id]) AI_CHATS[chat_id].markdown += content;
                  if (AI_CHATS[chat_id] && AI_CHATS[chat_id].markdown.length - AI_CHATS[chat_id].render_length > 20) {
                    if (AI_CHATS[chat_id]) AI_CHATS[chat_id].render_length = AI_CHATS[chat_id].markdown.length;
                    if (AI_CHATS[chat_id]) {
                      socket.emit("ai-chat-page",{ message_id: id_uuid, markdown: AI_CHATS[chat_id].markdown, end: false });
                    }
                  }
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      } finally {
        reader.cancel();
        if (AI_CHATS[chat_id]) {
          const html = await markdownToHTMLAi(AI_CHATS[chat_id].markdown);
          socket.emit("ai-chat-page",{ message_id: id_uuid, markdown: AI_CHATS[chat_id].markdown, end: true });
          const { markdown, gen_id, user_message_id, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt } = AI_CHATS[chat_id];
          delete AI_CHATS[chat_id];
          const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
          await getDatabase().query(`WITH update_input AS (
    UPDATE ai_chat SET input_tokens=$1 WHERE id=$2
  ) INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,input_tokens,output_tokens,cost) VALUES ($3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16);`,[tokens_prompt,user_message_id,ip_id,user_id,chat_id,getUnixTime(),model,false,markdown,html,false,false,0,tokens_completion,total_cost,chat_name]);
          return;
        }
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }
  return func;
}

/* -------------------------------------------- End/PAUSE AI Chat Page  ------------------------------------------------- */
type EndAIChatPageMessageType = {
  markdown: string,
  html: string,
  message_id?: string
}
type EndChatPageMessageCallback = {
  error:boolean,
  message_id: string
}
export function getOnEndAIChatPage(socket:SessionSocket) {
  const func = async function (obj:{message_id:string, chat_id: string|undefined },callback:(input:EndChatPageMessageCallback) => void) {
    try {
      if (!!!obj.message_id) {
        throw new Error("Invalid message id.")
      }
      const chat_id = obj.chat_id;
      if (!!!chat_id||!!!AI_CHATS[chat_id]) {
        throw new Error(`Chat ID ${chat_id} does not exist in saved AI_CHATS.`);
      }
      const chat_obj = AI_CHATS[chat_id];
      if (chat_obj.message_id!==obj.message_id) {
        throw new Error("The message id provided in the end ai chat request does not match the id of the ")
      }
      chat_obj.controller.abort();
      const { markdown, gen_id, user_message_id, model, message_id, completion_tokens:tokens_completion, prompt_tokens:tokens_prompt } = AI_CHATS[chat_id];
      callback({ error: false, message_id });
      delete AI_CHATS[chat_id];
      const html = await markdownToHTMLAi(markdown);
      const total_cost = (tokens_prompt/1_000_000)*0.02 + (tokens_completion/1_000_000)*0.05;
      const ip_id = socket.request.session.ip_id;
      const user_id = socket.request.session.auth.userID || null;
      await getDatabase().query(`WITH update_input AS (
  UPDATE ai_chat SET input_tokens=$1 WHERE id=$2
) INSERT INTO ai_chat (ip_id,user_id,chat_id,date_created,model,user_message,markdown,html,stopped,is_error,input_tokens,output_tokens,cost) SELECT $3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,chat_name FROM ai_chat WHERE chat_id=$5 LIMIT 1;`,[tokens_prompt,user_message_id,ip_id,user_id,chat_id,getUnixTime(),model,false,markdown,html,true,false,0,tokens_completion,total_cost]);
      return;
    } catch (e) {
      console.error(e);
      callback({ error: true, message_id: obj.message_id || '' });
      return;
    }
  }
  return func;
}