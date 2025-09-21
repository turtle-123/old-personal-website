/**
 * @document Handling AI Stuff in JavaScript
 * 
 * Documentation:
 * 
 * - [OpenAi](https://platform.openai.com/docs/api-reference/chat)
 * - [Google](https://ai.google.dev/gemini-api/docs/text-generation?lang=python)
 * - [Anthropic](https://docs.anthropic.com/en/api/getting-started)
 * - [LlamaAI](https://docs.llama-api.com/quickstart)
 */
import getDatabase from "../database";
import env from "../utils/env";
import OpenAI from "openai";
import pgvector from 'pgvector';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from '@anthropic-ai/sdk';



type EmbeddingModel = 'text-embedding-3-large'|'text-embedding-3-small'|'text-embedding-ada-002'|"models/text-embedding-004"|"models/embedding-001";
type OpenAIModerationInput = ({ "type": "text", "text": string }|{"type": "image_url", "image_url": { "url": string }})[]|string|string[]


// Note the openai api key was created with fmb201704 account
const OPEN_AI_API_KEY = env.OPEN_AI_API_KEY;
if (!!!OPEN_AI_API_KEY) throw new Error('Unable to get Open AI Key from env.');
const OPEN_AI_ORGANIZATION_ID = env.OPEN_AI_ORGANIZATION_ID;
if (!!!OPEN_AI_ORGANIZATION_ID) throw new Error('Unable to get OPEN_AI_ORGANIZATION_ID from env.');
const ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
if (!!!ANTHROPIC_API_KEY) throw new Error("Unable to find Anthropic API key from env.");
const GEMINI_API_KEY = env.GEMINI_API_KEY;
if (!!!GEMINI_API_KEY) throw new Error("Unable to find Gemini API key from env.");
const LLAMA_API_KEY = env.LLAMA_API_KEY;
if (!!!LLAMA_API_KEY) throw new Error("Unable to find LLama API key from env.");
const OPEN_ROUTER_KEY = env.OPEN_ROUTER_KEY;
if (!!!OPEN_ROUTER_KEY) throw new Error("Unable to find OPEN_ROUTER_KEY key from env.");

const openai = new OpenAI({
  apiKey: OPEN_AI_API_KEY
});
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
});
const gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPEN_ROUTER_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'https://frankmbrown.net', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': 'frankmbrown.net', // Optional. Site title for rankings on openrouter.ai.
  },
})

const OPEN_AI_CHAT_MODELS = new Set([
  'gpt-4o', // Most expensive to least expensive
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo'
]);
// https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference
const GOOGLE_CHAT_MODELS = new Set([
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.0-pro"
]);
// https://platform.openai.com/docs/guides/embeddings#embedding-models
const OPEN_AI_EMBEDDING_MODELS = new Set([
  'text-embedding-3-large',
  'text-embedding-3-small',
  'text-embedding-ada-002'
]);
// https://ai.google.dev/gemini-api/docs/models/gemini#text-embedding
const GOOGLE_EMBEDDING_MODELS = new Set([
  "models/text-embedding-004", // prefer this
  "models/embedding-001"
]);

/**
 * Get the current OpenAI models
 * @returns 
 */
export async function getCurrentOpenAiModels() {
  return new Promise((resolve,reject) => {
    openai.models.list()
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      reject(err)
    });
  })
}

export type ParsedModerationResp = [boolean,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number,boolean,number][];
/**
 * Parse the OpenAI moderation response - but the response in a form such that it can be inserted into database
 * @param resp 
 */
export function parseOpenAIModerationResponse(resp:OpenAI.Moderations.Moderation[]):ParsedModerationResp {
  const retArr:any[][]= [];
  for (let obj of resp) {
    const arr:any[] = [];
    const { 
      flagged,
      categories,
      category_scores
    } = obj;
    arr.push(flagged);
    const category_harassment = categories.harassment;
    const category_score_harassment = Math.round(Number(category_scores.harassment.toFixed(2))*100);
    const category_harassment_threatening = categories["harassment/threatening"];
    const category_score_harassment_threatening = Math.round(Number(category_scores["harassment/threatening"].toFixed(2))*100);
    const category_sexual = categories.sexual;
    const category_score_sexual = Math.round(Number(category_scores.sexual.toFixed(2))*100);
    const category_hate = categories.hate;
    const category_score_hate = Math.round(Number(category_scores.hate.toFixed(2))*100);
    const category_hate_threatening = categories["hate/threatening"];
    const category_score_hate_threatening = Math.round(Number(category_scores["hate/threatening"].toFixed(2))*100);
    const category_illicit = categories.illicit;
    const category_score_illicit = Math.round(Number(category_scores.illicit.toFixed(2))*100);
    const category_illicit_violent = categories["illicit/violent"];
    const category_score_illicit_violent = Math.round(Number(category_scores["illicit/violent"].toFixed(2))*100);
    const category_self_harm_intent = categories["self-harm/intent"];
    const category_score_self_harm_intent = Math.round(Number(category_scores["self-harm/intent"].toFixed(2))*100);
    const category_self_harm_instructions = categories["self-harm/instructions"];
    const category_score_self_harm_instructions = Math.round(Number(category_scores["self-harm/instructions"].toFixed(2))*100);
    const category_self_harm = categories["self-harm"];
    const category_score_self_harm = Math.round(Number(category_scores["self-harm"].toFixed(2))*100);
    const category_sexual_minors = categories["sexual/minors"];
    const category_score_sexual_minors = Math.round(Number(category_scores["sexual/minors"].toFixed(2))*100);
    const category_violence = categories.violence;
    const category_score_violence = Math.round(Number(category_scores.violence.toFixed(2))*100);
    const category_violence_graphic = categories["violence/graphic"];
    const category_score_violence_graphic = Math.round(Number(category_scores["violence/graphic"].toFixed(2))*100);
    arr.push(
      category_harassment,
      category_score_harassment,
      category_harassment_threatening,
      category_score_harassment_threatening,
      category_sexual,
      category_score_sexual,
      category_hate,
      category_score_hate,
      category_hate_threatening,
      category_score_hate_threatening,
      category_illicit,
      category_score_illicit,
      category_illicit_violent,
      category_score_illicit_violent,
      category_self_harm_intent,
      category_score_self_harm_intent,
      category_self_harm_instructions,
      category_score_self_harm_instructions,
      category_self_harm,
      category_score_self_harm,
      category_sexual_minors,
      category_score_sexual_minors,
      category_violence,
      category_score_violence,
      category_violence_graphic,
      category_score_violence_graphic
    ); 
    retArr.push(arr);
  }
  return retArr as ParsedModerationResp;
}

/**
 * See https://platform.openai.com/docs/guides/moderation?lang=node.js#quickstart
 * Moderation with open AI.
 * ```
 * @param input 
 */
export async function moderateOpenAI(input:OpenAIModerationInput) {
  if (typeof input==="string") {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: input
    });
    const results = moderation.results;
    return results;
  } else if (Array.isArray(input)&&typeof input[0] ==="string") {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: input as string[]
    });
    const results = moderation.results;
    return results;
  } else {
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: input
    });
    const results = moderation.results;
    return results;
  }
}

export function getAnnotationQuery(text:string) {
  return `The emotion(s) conveyed by: "${text}"`;
}

/**
 * Create embedding for a single string
 * @param str 
 * @returns 
 */
export async function createEmbedding(str:string,embeddingModel:EmbeddingModel="text-embedding-ada-002") {
  try {
    if (OPEN_AI_EMBEDDING_MODELS.has(embeddingModel)) {
      const response = await openai.embeddings.create({
        model: embeddingModel,
        input: str 
      });
      return response.data[0].embedding;
    } else if (GOOGLE_EMBEDDING_MODELS.has(embeddingModel)) {
      const model = gemini.getGenerativeModel({ model: embeddingModel });
      const result = await model.embedContent(str);
      return result.embedding.values;
    } else {
      throw new Error("Unrecognized embedidng model.")
    }
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong creating the embedding for the given str.');
  }
}

/**
 * Create embeddings for an array of strings
 * @param strArr 
 */
export async function batchEmbed(strArr:string[],embeddingModel:EmbeddingModel="text-embedding-ada-002") {
  try {
    if (OPEN_AI_EMBEDDING_MODELS.has(embeddingModel)) {
      const response = await openai.embeddings.create({
        model: embeddingModel,
        input: strArr
      });
      return response.data.map((obj) => obj.embedding);
    } else if (GOOGLE_EMBEDDING_MODELS.has(embeddingModel)) {
      const model = gemini.getGenerativeModel({ model: embeddingModel })
      const embedContentRequests = strArr.map((s) => ({ content: { parts: [{ text: s }], role: "user" } }));
      const response = await model.batchEmbedContents({ requests: embedContentRequests });
      return response.embeddings.map((contentEmbedding) => contentEmbedding.values);
    } else {
      throw new Error("Invalid embeddingModel when reating batch embeddings.");
    }
    
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong')
  }
}

/**
 * Add a row to the `embedding_record` table of the postgres database where 
 * we keep track of strings that we have already recorded
 */
export async function populateEmbeddingRecord(embedding:number[],str:string,model:string='text-embedding-ada-002') {
  try {
    const query = /*sql*/`INSERT INTO embedding_record (string,embedding,model) VALUES ($1,$2,$3);`;
    const db = getDatabase();
    await db.query(query,[str,pgvector.toSql(embedding),model]);
    return;
  } catch (error) {
    return;
  }
}
