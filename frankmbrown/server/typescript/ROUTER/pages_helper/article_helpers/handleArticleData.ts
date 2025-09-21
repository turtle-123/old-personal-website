/**
 * ```sql
 * 
CREATE TABLE article_likes (
	like_id serial PRIMARY KEY, 
	user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	note_id integer REFERENCES note(id) ON DELETE CASCADE, 
	blog_id integer REFERENCES blog(id) ON DELETE CASCADE,
	idea_id integer REFERENCES idea(id) ON DELETE CASCADE,
	wikipedia_id integer REFERENCES wikipedia(id) ON DELETE CASCADE,
	tex_notes_id integer REFERENCES tex_notes(id) ON DELETE CASCADE,
	jupyter_notebooks_id uuid REFERENCES jupyter_notebooks(id) ON DELETE CASCADE,
	markdown_notes_id uuid REFERENCES markdown_notes(id) ON DELETE CASCADE,
	date_liked bigint NOT NULL,
  CHECK (note_id IS NOT NULL OR blog_id IS NOT NULL OR idea_id IS NOT NULL OR wikipedia_id IS NOT NULL OR tex_notes_id IS NOT NULL OR jupyter_notebooks_id IS NOT NULL OR markdown_notes_id IS NOT NULL),
  UNIQUE(user_id,note_id),
  UNIQUE(user_id,blog_id),
  UNIQUE(user_id,idea_id),
  UNIQUE(user_id,wikipedia_id),
  UNIQUE(user_id,tex_notes_id),
  UNIQUE(user_id,jupyter_notebooks_id),
  UNIQUE(user_id,markdown_notes_id)
);
CREATE INDEX ON article_likes USING BTREE(user_id);
CREATE INDEX ON article_likes USING BTREE(note_id);
CREATE INDEX ON article_likes USING BTREE(blog_id);
CREATE INDEX ON article_likes USING BTREE(idea_id);
CREATE INDEX ON article_likes USING BTREE(wikipedia_id);
CREATE INDEX ON article_likes USING BTREE(tex_notes_id);
CREATE INDEX ON article_likes USING BTREE(jupyter_notebooks_id);
CREATE INDEX ON article_likes USING BTREE(markdown_notes_id);

CREATE TABLE article_views (
	like_id serial PRIMARY KEY, 
	ip_info_id integer REFERENCES ip_info(id) ON DELETE CASCADE,
	user_id integer REFERENCES users(id) ON DELETE CASCADE,
	note_id integer REFERENCES note(id) ON DELETE CASCADE,
	blog_id integer REFERENCES blog(id) ON DELETE CASCADE,
	idea_id integer REFERENCES idea(id) ON DELETE CASCADE,
	wikipedia_id integer REFERENCES wikipedia(id) ON DELETE CASCADE,
	tex_notes_id integer REFERENCES tex_notes(id) ON DELETE CASCADE,
	jupyter_notebooks_id uuid REFERENCES jupyter_notebooks(id) ON DELETE CASCADE,
	markdown_notes_id uuid REFERENCES markdown_notes(id) ON DELETE CASCADE,
	date_viewed bigint NOT NULL,
  UNIQUE(ip_info_id,note_id),
  UNIQUE(ip_info_id,blog_id),
  UNIQUE(ip_info_id,idea_id),
  UNIQUE(ip_info_id,wikipedia_id),
  UNIQUE(ip_info_id,tex_notes_id),
  UNIQUE(ip_info_id,jupyter_notebooks_id),
  UNIQUE(ip_info_id,markdown_notes_id),
  UNIQUE(user_id,note_id),
  UNIQUE(user_id,blog_id),
  UNIQUE(user_id,idea_id),
  UNIQUE(user_id,wikipedia_id),
  UNIQUE(user_id,tex_notes_id),
  UNIQUE(user_id,jupyter_notebooks_id),
  UNIQUE(user_id,markdown_notes_id),
  CHECK (note_id IS NOT NULL OR blog_id IS NOT NULL OR idea_id IS NOT NULL OR wikipedia_id IS NOT NULL OR tex_notes_id IS NOT NULL OR jupyter_notebooks_id IS NOT NULL OR markdown_notes_id IS NOT NULL)
);
CREATE INDEX ON article_views USING BTREE(user_id);
CREATE INDEX ON article_views USING BTREE(note_id);
CREATE INDEX ON article_views USING BTREE(blog_id);
CREATE INDEX ON article_views USING BTREE(idea_id);
CREATE INDEX ON article_views USING BTREE(wikipedia_id);
CREATE INDEX ON article_views USING BTREE(tex_notes_id);
CREATE INDEX ON article_views USING BTREE(jupyter_notebooks_id);
CREATE INDEX ON article_views USING BTREE(markdown_notes_id);

CREATE TABLE comments (
	id serial PRIMARY KEY,
	parent_comment_id integer,
	user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	note_id integer REFERENCES note(id) ON DELETE CASCADE,
	blog_id integer REFERENCES blog(id) ON DELETE CASCADE,
	idea_id integer REFERENCES idea(id) ON DELETE CASCADE,
	wikipedia_id integer REFERENCES wikipedia(id) ON DELETE CASCADE,
	tex_notes_id integer REFERENCES tex_notes(id) ON DELETE CASCADE,
	jupyter_notebooks_id uuid REFERENCES jupyter_notebooks(id) ON DELETE CASCADE,
	markdown_notes_id uuid REFERENCES markdown_notes(id) ON DELETE CASCADE,
	lexical_state jsonb NOT NULL,
	mobile_html TEXT NOT NULL, 
	tablet_html TEXT NOT NULL,
	desktop_html TEXT NOT NULL,
	date_created bigint NOT NULL,
  comment_uuid uuid default gen_random_uuid(),
  validated BOOLEAN NOT NULL DEFAULT true,
	CHECK (note_id IS NOT NULL OR blog_id IS NOT NULL OR idea_id IS NOT NULL OR wikipedia_id IS NOT NULL OR tex_notes_id IS NOT NULL OR jupyter_notebooks_id IS NOT NULL OR markdown_notes_id IS NOT NULL)
);
CREATE INDEX ON comments USING BTREE(user_id);
CREATE INDEX ON comments USING BTREE(note_id);
CREATE INDEX ON comments USING BTREE(blog_id);
CREATE INDEX ON comments USING BTREE(idea_id);
CREATE INDEX ON comments USING BTREE(wikipedia_id);
CREATE INDEX ON comments USING BTREE(tex_notes_id);
CREATE INDEX ON comments USING BTREE(jupyter_notebooks_id);
CREATE INDEX ON comments USING BTREE(markdown_notes_id);



-- CREATE TYPE connotation_type AS ENUM ('success','primary','secondary','info','warning','error');
CREATE TABLE annotations (
	id serial PRIMARY KEY,
	user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	note_id integer REFERENCES note(id) ON DELETE CASCADE,
	blog_id integer REFERENCES blog(id) ON DELETE CASCADE,
	idea_id integer REFERENCES idea(id) ON DELETE CASCADE,
	wikipedia_id integer REFERENCES wikipedia(id) ON DELETE CASCADE,
  survey_id integer REFERENCES surveys(id) ON DELETE CASCADE,
	lexical_state jsonb NOT NULL,
	html TEXT NOT NULL,
	date_created bigint NOT NULL,
	start_index smallint NOT NULL,
	end_index smallint NOT NULL,
	content TEXT NOT NULL,
	reference_id TEXT NOT NULL,
  connotation connotation_type NOT NULL
);
ALTER TABLE annotations ADD CONSTRAINT annotation_check CHECK (
  note_id IS NOT NULL OR blog_id IS NOT NULL OR idea_id IS NOT NULL OR wikipedia_id IS NOT NULL OR survey_id IS NOT NULL
);
CREATE INDEX ON annotations USING BTREE(user_id);
CREATE INDEX ON annotations USING BTREE(note_id);
CREATE INDEX ON annotations USING BTREE(blog_id);
CREATE INDEX ON annotations USING BTREE(idea_id);
CREATE INDEX ON annotations USING BTREE(wikipedia_id);

CREATE TABLE comment_likes (
	id serial PRIMARY KEY,
	comment_id integer NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
	user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (comment_id,user_id)
);
CREATE INDEX ON comment_likes USING BTREE(user_id);
CREATE INDEX ON comment_likes USING BTREE(comment_id);

CREATE TABLE annotation_votes (
	id serial PRIMARY KEY,
	annotation_id integer NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
	user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	upvote boolean,
	downvote boolean,
	CHECK ((upvote AND NOT downvote) OR (downvote AND NOT upvote) OR (NOT upvote and NOT downvote)),
  UNIQUE (annotation_id,user_id)
);
CREATE INDEX ON annotation_votes USING BTREE(user_id);
CREATE INDEX ON annotation_votes USING BTREE(annotation_id);

CREATE TABLE comment_embedding (
	id serial PRIMARY KEY,
	comment_id integer UNIQUE NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
	embedding vector(1536) NOT NULL
);
CREATE INDEX ON comment_embedding USING BTREE(comment_id);

CREATE TABLE annotation_embedding (
	id serial PRIMARY KEY,
	annotation_id integer UNIQUE NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
	embedding vector(1536) NOT NULL
);
CREATE INDEX ON annotation_embedding USING BTREE(annotation_id);

CREATE TABLE comment_search (
	id serial PRIMARY KEY,
	comment_id integer NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
	document TEXT NOT NULL,
	search tsvector GENERATED ALWAYS AS (
		to_tsvector('english',document) || ' '
	) STORED NOT NULL
);
CREATE INDEX ON comment_search USING GIN(search);

CREATE TABLE annotation_search (
	id serial PRIMARY KEY,
	annotation_id integer NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
	document TEXT NOT NULL,
	search tsvector GENERATED ALWAYS AS (
		to_tsvector('english',document) || ' '
	) STORED NOT NULL
);
CREATE INDEX ON annotation_search USING GIN(search);

CREATE TABLE comment_moderation_responses (
	id serial PRIMARY KEY,
	comment_id integer NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
	flagged boolean,
	category_harassment boolean,
  category_score_harassment smallint,
  category_harassment_threatening boolean,
  category_score_harassment_threatening smallint,
  category_sexual boolean,
  category_score_sexual smallint,
  category_hate boolean,
  category_score_hate smallint,
  category_hate_threatening boolean,
  category_score_hate_threatening smallint,
  category_illicit boolean,
  category_score_illicit smallint,
  category_illicit_violent boolean,
  category_score_illicit_violent smallint,
  category_self_harm_intent boolean,
  category_score_self_harm_intent smallint,
  category_self_harm_instructions boolean,
  category_score_self_harm_instructions smallint,
  category_self_harm boolean,
  category_score_self_harm smallint,
  category_sexual_minors boolean,
  category_score_sexual_minors smallint,
  category_violence boolean,
  category_score_violence smallint,
  category_violence_graphic boolean,
  category_score_violence_graphic smallint
);
CREATE INDEX ON comment_moderation_responses USING BTREE(comment_id);
CREATE TABLE annotation_moderation_responses (
	id serial PRIMARY KEY,
	annotation_id integer NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
	flagged boolean,
	category_harassment boolean,
  category_score_harassment smallint,
  category_harassment_threatening boolean,
  category_score_harassment_threatening smallint,
  category_sexual boolean,
  category_score_sexual smallint,
  category_hate boolean,
  category_score_hate smallint,
  category_hate_threatening boolean,
  category_score_hate_threatening smallint,
  category_illicit boolean,
  category_score_illicit smallint,
  category_illicit_violent boolean,
  category_score_illicit_violent smallint,
  category_self_harm_intent boolean,
  category_score_self_harm_intent smallint,
  category_self_harm_instructions boolean,
  category_score_self_harm_instructions smallint,
  category_self_harm boolean,
  category_score_self_harm smallint,
  category_sexual_minors boolean,
  category_score_sexual_minors smallint,
  category_violence boolean,
  category_score_violence smallint,
  category_violence_graphic boolean,
  category_score_violence_graphic smallint
);
CREATE INDEX ON annotation_moderation_responses USING BTREE(annotation_id);

CREATE TABLE comment_views (
	id bigserial PRIMARY KEY,
	comment_id integer NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
	user_id integer REFERENCES users(id) ON DELETE CASCADE,
	ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
	UNIQUE (comment_id, user_id, ip_id)
);
CREATE INDEX ON comment_views USING BTREE (comment_id);
ALTER TABLE comment_views 
ADD CONSTRAINT unique_user_comment UNIQUE(comment_id,user_id);
ALTER TABLE comment_views 
ADD CONSTRAINT unique_ip_comment UNIQUE(comment_id,ip_id);

CREATE TABLE annotation_views (
	id bigserial PRIMARY KEY,
	annotation_id integer NOT NULL REFERENCES annotations(id) ON DELETE CASCADE,
	user_id integer REFERENCES users(id) ON DELETE CASCADE,
	ip_id integer NOT NULL REFERENCES ip_info(id) ON DELETE CASCADE,
	UNIQUE (annotation_id, user_id, ip_id)
);
CREATE INDEX ON annotation_views USING BTREE (annotation_id);

ALTER TABLE comments ADD COLUMN annotation_id int 
REFERENCES annotations(id) ON DELETE CASCADE;

DROP TABLE article_likes;
DROP TABLE article_views;
DROP TABLE comment_likes;
DROP TABLE annotation_votes;
DROP TABLE comment_embedding;
DROP TABLE annotation_embedding;
DROP TABLE comment_search;
DROP TABLE annotation_search;
DROP TABLE comment_moderation_responses;
DROP TABLE annotation_moderation_responses;
DROP TABLE comments;
DROP TABLE annotations;


UPDATE annotations ADD column lexical_state_reference jsonb NOT NULL,
mobile_html TEXT NOT NULL,
tablet_html TEXT NOT NULL,
desktop_html TEXT NOT NULL;

CREATE TABLE unvalidated_media (
  id serial PRIMARY KEY,
  comment_id integer REFERENCES comments(id) ON DELETE CASCADE,
  chat_id integer REFERENCES chat(id) ON DELETE CASCADE,
  image_id int REFERENCES images(id) ON DELETE CASCADE, 
  audio_id int REFERENCES audio(id) ON DELETE CASCADE,
  video_id int REFERENCES video(id) ON DELETE CASCADE,
  nsfw boolean
);

CREATE TABLE annotation_comments (
  id serial PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  annotation_id int REFERENCES annotations(id) ON DELETE CASCADE,
  comment TEXT NOT NULL, 
  date_created bigint NOT NULL
);
CREATE INDEX ON annotation_comments USING BTREE(user_id);
CREATE INDEX ON annotation_comments USING BTREE(annotation_id);

CREATE TABLE annotation_comment_upvote_downvote (
  id serial PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  annotation_id int REFERENCES annotations(id) ON DELETE CASCADE,
  annotation_comment_id int REFERENCES annotation_comments(id) ON DELETE CASCADE,
  upvote boolean NOT NULL,
  downvote boolean NOT NULL,
  date_voted bigint NOT NULL,
  CHECK ((upvote=true AND downvote=false) OR (upvote=false AND downvote=true))
);
CREATE INDEX ON annotation_comment_upvote_downvote USING BTREE(user_id);
CREATE INDEX ON annotation_comment_upvote_downvote USING BTREE(annotation_comment_id);

*/ 
const table_data = () => {}
import { Request, Response } from "express";
import getDatabase from "../../../database";
import { Breadcrumbs, SEO, Spread, TableOfContentsItem } from "../../../types";
import { getTimeAgoString, getUnixTime } from "../../../utils/time";
import { getErrorAlert, getErrorSnackbar, getInfoAlert, getSuccessAlert, getSuccessSnackbar, getWarningAlert } from "../../html";
import SVGS from '../../../CONSTANTS/COMMON_SVG';
import ejs from 'ejs';
import pgvector from "pgvector";
import { parsePostedAnnotation, parseCommentLexicalEditor } from "../../../lexical";
import COMMON_SVG from '../../../CONSTANTS/COMMON_SVG';
import { createEmbedding, moderateOpenAI, parseOpenAIModerationResponse } from "../../../ai";
import fs from 'fs';
import BASE_PATH from "../../../CONSTANTS/BASE_PATH";
import path from 'path';
import { getCommentImplementation } from "../lexicalImplementations";
import crypto from 'node:crypto';
import { getDeepCommentsHelper, getGetCommentsQueryAndArray, getSearchCommentQueryAndArray } from "./getCommentHelper";
import { isMemberOf } from "../../../utils/set";
import { getGetAnnotationsQueryAndArray, searchAnnotationsQueryAndArray } from "./getAnnotationHelper";
import { redirect } from "../../helper_functions/redirect-override";
import { getRequiredVariables } from "../../helper_functions/frontendHelper";

const INDIVIDUAL_COMMENT_EJS = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','individual-comment.ejs'),{encoding:'utf-8'});
const INDIVIDUAL_ANNOTATION_EJS = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','individual-annotation.ejs'),{encoding:'utf-8'});
const SEARCH_COMMENT_RESULT = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','search-comments-result.ejs'),{encoding:'utf-8'});
const SHOW_ANNOTATIONS = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','show-annotations.ejs'),{encoding:'utf-8'});
const ANNOTATION_COMMENT = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','annotation-comment.ejs'),{encoding:'utf-8'});
const INDIVIDUAL_ANNOTATION_DIALOG_EJS = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','individual-annotation-dialog.ejs'),{encoding:'utf-8'});

type ArticleType = 'blog'|'idea'|'note';
type ArticleDbResponse = {
  html: string,
  id: number, 
  date_created: string, 
  last_edited: string, 
  title: string, 
  description: string, 
  image: string, 
  active_v: number, 
  highest_v: number, 
  versions: number[], 
  table_of_contents: TableOfContentsItem[], 
  views: number,
  likes: number,
  has_liked: boolean,
  lexical_id: string
}
type WikipediaResponse = {
  html: string,
  id: number, 
  title: string, 
  date_unix: string, 
  description: string, 
  image: string, 
  table_of_contents: TableOfContentsItem[], 
  views: number,
  likes: number,
  has_liked: number,
  lexical_id: string
};
type GoodReadLetterboxdResponse = {
  html: string,
  id: number, 
  title: string,  
  description: string, 
  image: string, 
  table_of_contents: TableOfContentsItem[], 
  date_created: string,
  last_edited: string,
  rating: number,
  views: number,
  likes: number,
  has_liked: boolean,
  lexical_id: string
};
type GamesDesignResponse = {
  html: string,
  id: number, 
  title: string,  
  description: string, 
  image: string, 
  table_of_contents: TableOfContentsItem[], 
  date_created: string,
  last_edited: string,
  rating: number,
  views: number,
  likes: number,
  has_liked: boolean,
  lexical_id: string,
  game_javascript: string,
  asset_url: string|undefined
};

type TexNoteResponse = {
  html: string,
  date_added: string,
  date_completed: string,
  note_title: string,
  note_resource_link_title: string, 
  note_resource_link: string,
  note_description: string,
  note_image: string,
  views: number,
  likes: number,
  has_liked: boolean
};
type JupyterNotebookResponse = {
  id: string,
  html: string,
  title: string,
  description: string,
  keywords: string[],
  table_of_contents: TableOfContentsItem[],
  date_created: string,
  image_url: string,
  views: number,
  likes: number,
  has_liked: boolean
};
type MarkdownNoteResponse = {
  id: string,
  markdown: string,
  html: string,
  title: string,
  description: string,
  date_created: string,
  last_edited: string,
  published: boolean,
  table_of_contents: TableOfContentsItem[],
  design_system: string,
  breaks: boolean,
  gfm: boolean,
  pedantic: boolean,
  image_url: string,
  views: number,
  likes: number,
  has_liked: boolean
};
export type CommentResponseRow = {
  id: number,
  html: string,
  date_created: string,
  comment_id: string,
  like_count: number,
  username: string,
  user_id: number,
  user_liked: boolean,
  pp: string,
  view_count: number,
  comment_count: number,
  level: number,
  path: string|null,
  rating: number
};
type AnnotationRespRow = {
  id: number,
  html: string,
  date_created: string,
  upvote_count: number,
  downvote_count: number,
  user_upvote: number,
  user_downvote: number,
  user_id: number,
  username: string,
  profile_picture: string,
  view_count: number,
  rating: number,
  comment_count: string
};
export class CommentNode {
  obj: Spread<Omit<CommentResponseRow,"path">,{ path: number[] }>;
  children: CommentNode|undefined;
  parent: CommentNode|undefined;
  next: CommentNode|undefined;
  constructor(o:CommentResponseRow) {
    if (o.path===null) {
      this.obj = {...o, path: []};
    } else {
      this.obj = { ...o, path: o.path.split('.').map((i) => parseInt(i))}
    }
  } 
  render(req:Request,max_level?:number) {
    var children_length = 0;
    var has_additional_comments = false;
    var child_html = '';
    var exclude_param = '';
    const parent_id = this.obj.id;
    if (this.children) {
      var curr:CommentNode|undefined = this.children;
      while (curr) {
        child_html += curr.render(req);
        exclude_param+='&exclude='.concat(curr.obj.id.toString());
        children_length+=1;
        curr = curr.next;
      }
      if (this.obj.comment_count>children_length) {
        has_additional_comments = true;
      }
    } else {
      if (this.obj.comment_count>children_length) {
        has_additional_comments = true;
      }
    }
    var additional_comments_info = '';
    var addition_comments_ind='ind_'.concat(crypto.randomUUID());
    if (has_additional_comments&&parent_id!==0) {
      if (max_level&&this.obj.level>=max_level) {
        additional_comments_info=`hx-get="${`/comments/${encodeURIComponent(this.obj.id)}?max-level=${encodeURIComponent(max_level+6)}" hx-target="#PAGE" hx-indicator="#page-transition-progress" hx-push-url="true"`}`;

      } else {
        additional_comments_info =`hx-get="${'/comment/more'.concat('?parent_id=').concat(parent_id.toString()).concat(exclude_param)}" hx-target="closest div" hx-swap="outerHTML" hx-indicator="${addition_comments_ind}"`;
        
      }
    }
    const time_ago = getTimeAgoString(Number(this.obj.date_created));
    const logged_in = Number(req.session.auth?.level)>=1;
    return ejs.render(INDIVIDUAL_COMMENT_EJS,{ ...this.obj, has_additional_comments, child_html,logged_in, addition_comments_ind, additional_comments_info, time_ago, rating: this.obj.rating.toFixed(2), desktop: req.session.device?.desktop });
  }
} 
export class CommentGraph {
  head: CommentNode;
  top_level_comments: number;
  exclude:number[]|undefined;
  seen_nodes: Set<number>;
  max_level: number;
  constructor(node: CommentNode,top_lev_comm:number,exclude?:number[],max_level?:number) {
    this.head = node;
    this.top_level_comments = top_lev_comm;
    if (exclude) this.exclude = exclude;
    this.seen_nodes = new Set([node.obj.id]);
    if (max_level) this.max_level = max_level;
    else this.max_level = 6;
  }
  insert(node: CommentNode) {
    if (this.seen_nodes.has(node.obj.id)) {
      return this;
    }
    this.seen_nodes.add(node.obj.id);
    var curr_level = this.head.obj.level;
    var curr:CommentNode|undefined = this.head;
    while (curr) {
      if (node.obj.level>curr_level) {
        if (curr.obj.id===node.obj.path[curr_level]) {
          if (curr.children) {
            curr = curr.children;
            curr_level+=1;
            continue;
          } else {
            if (node.obj.level===curr_level+1) {
              node.parent = curr;
              curr.children = node;
              return this;
            } else {
              throw new Error("Something went wrong insreting comment node.");
            }
          }
        } else{
          curr = curr.next;
        }
      } else {
        if (node.obj.rating>curr.obj.rating) {
          if (curr.parent) {
            node.parent = curr.parent;
            curr.parent = undefined;
          }
          node.next = curr;
          return this;
        } else if (!!!curr.next) {
          curr.next = node;
          return this;
        } else {
          curr = curr.next;
        }
      }
    }
  }
  render(req:Request) {
    var tot_str = '';
    var top_lev_comm_num = 0;
    const parent_id = this.head.obj.path.length ? this.head.obj.path[this.head.obj.path.length-1] : null;
    var exclude_param = '?exclude=';
    if (this.exclude) {
      for (let i = 0; i < this.exclude.length; i++) {
        if (exclude_param==='?exclude=') exclude_param+=this.exclude[i].toString();
        else exclude_param+='&exclude='.concat(this.exclude[i].toString());
      }
    }
    var curr:CommentNode|undefined = this.head;
    while (curr) {
      tot_str += curr.render(req,this.max_level);
      top_lev_comm_num+=1;
      if (exclude_param==='?exclude=') exclude_param+=curr.obj.id.toString();
      else exclude_param+='&exclude='.concat(curr.obj.id.toString());
      curr = curr.next;
    }
    if (this.top_level_comments>top_lev_comm_num&&!!!parent_id) {
      const ind = 'ind_'.concat(crypto.randomUUID());
      const api = '/comment/more'.concat(exclude_param);
      tot_str += `<div class="flex-row justify-center t-info htmx-indicator" id="${ind}" role="progressbar" aria-busy="false" aria-label="Getting more comments">
  <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
</div>
<div hx-trigger="intersect once" hx-target="this" hx-swap="outerHTML" hx-indicator="#${ind}" hx-get="${api}"></div>`
    }
    return tot_str;
  }
}

const VALID_ANNOTATION_COMMENT_SEARCH_TYPE = new Set(['default','semantic'] as const);
const VALID_ANNOTATION_COMMENT_SORT_BY = new Set(['best','new','recommended-1','recommended-2'] as const);
const SORT_BY_TO_TEXT = {
  "best": "Best",
  "new": "New",
  "recommended-1": "Recommended 2",
  "recommended-2": "Recommended 1",
} as const;


export async function insertIntoUnvalidatedMedia(type_id:'comment_id'|'chat_id',id:number,unvalidated_media:{ images:string[], audio: string[], video: string[] }) {
  const promiseArr:Promise<any>[] = [];
  const image_query = `WITH image_info AS (
    SELECT images.id id, image_nsfw.nsfw nsfw FROM images LEFT JOIN image_nsfw ON images.id=image_nsfw.image_id WHERE image_url=$1 LIMIT 1
  ) INSERT INTO unvalidated_media (${type_id},image_id,nsfw) SELECT $2, id, nsfw>90 FROM image_info;`
  const audio_query = `WITH audio_info AS (
    SELECT audio.id id, audio_transcription_embeddings.flagged flagged FROM audio LEFT JOIN audio_nsfw ON audio.id = audio_transcription_embeddings.audio_id ORDER BY audio_transcription_embeddings.flagged DESC NULLS LAST LIMIT 1
  ) INSERT INTO unvalidated_media (${type_id},audio_id,nsfw)  SELECT $2, id, nsfw FROM audio_info;`
  const video_query = `WITH video_info AS (
    SELECT video.id id, video_transcription_embeddings.flagged flagged FROM video LEFT JOIN video_nsfw ON video.id = video_transcription_embeddings.video_id ORDER BY video_transcription_embeddings.flagged DESC NULLS LAST LIMIT 1
  ) INSERT INTO unvalidated_media (${type_id},video_id,nsfw)  SELECT $2, id, nsfw FROM video_info;`
  const db = getDatabase();
  for (let img_src of unvalidated_media.images) {
    promiseArr.push(db.query(image_query,[img_src,id]));
  }
  for (let audio_src of unvalidated_media.audio) {
    promiseArr.push(db.query(audio_query,[audio_src,id]));
  }
  for (let video_src of unvalidated_media.video) {
    promiseArr.push(db.query(video_query,[video_src,id]));
  }
  await Promise.all(promiseArr);
  /**
   * Since we are only doing trigger functions on UPDATES to tables, we need to check if everyting is currently safe for work or not safe for work and then update accordingly
   */
  const resp = await db.query(`SELECT * FROM check_unvalidated_media_after_insert($1,$2);`,[type_id,id]);
  const obj= resp.rows?.[0];
  if (!!!obj) return;
  else if (obj.sfw===true) {
    switch (type_id) {
      case 'chat_id': {
        await db.query(`UPDATE chat SET validated=true WHERE id=$1;`,[id]);
      }
      case 'comment_id': {
        await db.query(`UPDATE comments SET validated=true WHERE id=$1;`,[id]);
      }
      default: {
        break;
      }
    }
  } else if (obj.nsfw===true) {
    switch (type_id) {
      case 'chat_id': {
        await db.query(`DELETE FROM chat WHERE id=$1;`,[id]);
      }
      case 'comment_id': {
        await db.query(`DELETE FROM comments WHERE id=$1;`,[id]);
      }
      default: {
        break;
      }
    }
  }
}

/**
 * Get query to insert into moderation table - currently used for text 
 * @param table_name 
 * @param foreign_key_name 
 * @returns 
 */
export const GET_INSERT_INTO_MODERATION_TABLE = (table_name:'comment_moderation_responses'|'annotation_moderation_responses'|'chat_moderation_responses'|'audio_transcription_moderation'|'video_transcription_moderation'|'survey_description_moderation'|'survey_question_moderation',foreign_key_name:'comment_id'|'annotation_id'|'chat_id'|'audio_id'|'video_id'|'survey_id'|'survey_question_id') => {
  return `INSERT INTO ${table_name} (${foreign_key_name},flagged,category_harassment,category_score_harassment,category_harassment_threatening,category_score_harassment_threatening,category_sexual,category_score_sexual,category_hate,category_score_hate,category_hate_threatening,category_score_hate_threatening,category_illicit,category_score_illicit,category_illicit_violent,category_score_illicit_violent,category_self_harm_intent,category_score_self_harm_intent,category_self_harm_instructions,category_score_self_harm_instructions,category_self_harm,category_score_self_harm,category_sexual_minors,category_score_sexual_minors,category_violence,category_score_violence,category_violence_graphic,category_score_violence_graphic) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28);`
}
const GET_INSERT_INTO_ANOTATION_COMMENT_EMBEDDING = (table_name:'comment_embedding'|'annotation_embedding',foreign_key_name:'comment_id'|'annotation_id') => {
  return `INSERT INTO ${table_name} (${foreign_key_name},embedding) VALUES ($1,$2);` 
}
const GET_INSERT_INTO_ANNOTATION_COMMENT_SEARCH = (table_name:'comment_search'|'annotation_search',foreign_key_name:'comment_id'|'annotation_id') => {
  return `INSERT INTO ${table_name} (${foreign_key_name},document) VALUES ($1,$2);` 
} 

const getDevice = (req:Request) => {
  if (req.session.device?.desktop) return 'desktop';
  else if (req.session.device?.tablet) return 'tablet';
  else return 'mobile';
}
/**
 * Gets the ID that you should use for likes, views, comments, annotations
 * @param path 
 * @returns 
 */
function getTypeIdFromPath(path:string,index:number=2) {
  const type = path.split('/')[index];
  var type_id = 'note_id';
  switch (type) {
    case 'note': {
      type_id = 'note_id';
      break;
    }
    case 'blog': {
      type_id = 'blog_id';
      break;
    }
    case 'idea': {
      type_id = 'idea_id';
      break;
    }
    case 'daily-reading': {
      type_id = 'wikipedia_id';
      break;
    }
    case 'markdown-notes': {
      type_id = 'markdown_notes_id';
      break;
    }
    case 'jupyter-notebooks': {
      type_id = 'jupyter_notebooks_id';
      break;
    }
    case 'tex-notes': {
      type_id = 'tex_notes_id';
      break;
    }
    case 'goodreads': {
      type_id = 'goodreads_id';
      break;
    }
    case 'letterboxd': {
      type_id = 'letterboxd_id';
      break;
    }
    case 'games': {
      type_id = 'game_id';
      break;
    }
    case '3d-designs': {
      type_id = 'design_id';
      break;
    }
    case 'electronics-robotics': {
      type_id = 'electronics_id';
      break;
    }
    default: {
      throw new Error("Invalid type for liking/commenting article.");
    }
  }
  return type_id;
} 
/**
 * 
 * @param path 
 * @returns 
 */
function getTypeIdFromPathAnnotations(path:string) {
  const type = path.split('/')[2];
  var type_id = 'note_id';
  switch (type) {
    case 'note': {
      type_id = 'note_id';
      break;
    }
    case 'blog': {
      type_id = 'blog_id';
      break;
    }
    case 'idea': {
      type_id = 'idea_id';
      break;
    }
    case 'daily-reading': {
      type_id = 'wikipedia_id';
      break;
    }
    case 'surveys': {
      type_id = 'survey_id';
      break;
    }
    case 'goodreads': {
      type_id = 'goodreads_id';
      break;
    }
    case 'letterboxd': {
      type_id = 'letterboxd_id';
      break;
    }
    case 'games': {
      type_id = 'game_id';
      break;
    }
    case '3d-designs': {
      type_id = 'design_id';
      break;
    }
    case 'electronics-robotics': {
      type_id = 'electronics_id';
      break;
    }
    default: {
      throw new Error("Invalid type for annotating article.");
    }
  } 
  return type_id;
} 

/**
 * PATH: /(note|blog|idea)/:id/:title
 * HANDLER: getArticle
 * 
 * @param req 
 * @param type 
 * @param id 
 */
export async function getArticleAndLikesAndViews(req:Request,type:ArticleType,id:number) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const device = getDevice(req);
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH article_info AS (
      SELECT id, date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents, lexical_id FROM ${type} WHERE id=$1
    ), like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND ${type}_id=$1) has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    article.${device}_html html,
    article_info.id id, 
    article_info.date_created date_created, 
    article_info.last_edited last_edited, 
    article_info.title title, 
    article_info.description description, 
    article_info.image image, 
    article_info.active_v active_v, 
    article_info.highest_v highest_v, 
    article_info.versions versions, 
    article_info.table_of_contents table_of_contents, 
    article_info.lexical_id lexical_id,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM article 
    JOIN article_info ON article_info.id=article.${type}_id 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    article.${type}_id=$1 AND article.v=article_info.active_v AND deprecated_time IS NULL;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as ArticleDbResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH article_info AS (
      SELECT id, date_created, last_edited, title, description, image, active_v, highest_v, versions, table_of_contents, lexical_id FROM ${type} WHERE id=$1
    ), like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    article.${device}_html html,
    article_info.id id, 
    article_info.date_created date_created, 
    article_info.last_edited last_edited, 
    article_info.title title, 
    article_info.description description, 
    article_info.image image, 
    article_info.active_v active_v, 
    article_info.highest_v highest_v, 
    article_info.versions versions, 
    article_info.lexical_id lexical_id,
    article_info.table_of_contents table_of_contents, 
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM article 
    JOIN article_info ON article_info.id=article.${type}_id 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    article.${type}_id=$1 AND article.v=article_info.active_v AND deprecated_time IS NULL;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as ArticleDbResponse;
  }
}
/**
 * PATH: /daily-reading/:id/:title
 * HANDLER: getDailyReadingOfTheDay
 * 
 * @param req 
 * @param id 
 */
export async function getDailyReadingAndLikesAndViews(req:Request,id:number) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const device = getDevice(req);
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND wikipedia_id=$1) has_liked 
      FROM article_likes WHERE wikipedia_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,wikipedia_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE wikipedia_id=$1
    ) SELECT 
    wikipedia.${device}_html html,
    wikipedia.id id, 
    wikipedia.topic_name title, 
    wikipedia.date_submitted date_unix, 
    wikipedia.what_interested_you description, 
    wikipedia.topic_image image, 
    wikipedia.table_of_contents table_of_contents, 
    wikipedia.lexical_id lexical_id,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM wikipedia 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    wikipedia.id=$1 AND submitted=true;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as WikipediaResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE wikipedia_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,wikipedia_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE wikipedia_id=$1
    ) SELECT 
    wikipedia.${device}_html html,
    wikipedia.id id, 
    wikipedia.topic_name title, 
    wikipedia.date_submitted date_unix, 
    wikipedia.what_interested_you description, 
    wikipedia.topic_image image, 
    wikipedia.table_of_contents table_of_contents, 
    wikipedia.lexical_id lexical_id,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM wikipedia 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    wikipedia.id=$1 AND submitted=true;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as WikipediaResponse;
  }
}
/** 
 * PATH: /tex-notes/:id/:title
 * HANDLER: getTexNote
 * GET: html, 
 * 
 * @param req 
 * @param id 
 */
export async function getTexNotesAndLikesAndViews(req:Request,id:number) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const date_viewed = getUnixTime(); 
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND tex_notes_id=$1) has_liked 
      FROM article_likes WHERE tex_notes_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,tex_notes_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE tex_notes_id=$1
    ) SELECT 
    tex_notes.html html,
    tex_notes.date_added date_added,
    tex_notes.date_completed date_completed,
    tex_notes.note_title note_title,
    tex_notes.note_resource_link_title note_resource_link_title,
    tex_notes.note_resource_link note_resource_link,
    tex_notes.note_description note_description,
    tex_notes.note_image note_image,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM tex_notes 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    tex_notes.id=$1 AND tex_notes.date_completed IS NOT NULL;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as TexNoteResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE tex_notes_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,tex_notes_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE tex_notes_id=$1
    ) SELECT 
    tex_notes.html html,
    tex_notes.date_added date_added,
    tex_notes.date_completed date_completed,
    tex_notes.note_title note_title,
    tex_notes.note_resource_link_title note_resource_link_title,
    tex_notes.note_resource_link note_resource_link,
    tex_notes.note_description note_description,
    tex_notes.note_image note_image,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM tex_notes 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    tex_notes.id=$1 AND tex_notes.date_completed IS NOT NULL;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as TexNoteResponse;
  }
}
/**
 * PATH: /jupyter-notebooks/:id/:title
 * HANDLER: getJupyterNotebook
 * GET: SELECT id, title, description, date_created, image_url FROM jupyter_notebooks
 * 
 * @param req 
 * @param id 
 */
export async function getJupyterNotebookAndLikesAndViews(req:Request,id:string) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const date_viewed = getUnixTime();
  
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND jupyter_notebooks_id=$1) has_liked 
      FROM article_likes WHERE jupyter_notebooks_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,jupyter_notebooks_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE jupyter_notebooks_id=$1
    ) SELECT 
    jupyter_notebooks.id id,
    jupyter_notebooks.html html,
    jupyter_notebooks.title title,
    jupyter_notebooks.description description,
    jupyter_notebooks.keywords keywords,
    jupyter_notebooks.table_of_contents table_of_contents,
    jupyter_notebooks.date_created date_created,
    jupyter_notebooks.image_url image_url,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM jupyter_notebooks 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    jupyter_notebooks.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as JupyterNotebookResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE jupyter_notebooks_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,jupyter_notebooks_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE jupyter_notebooks_id=$1
    ) SELECT 
    jupyter_notebooks.id id,
    jupyter_notebooks.html html,
    jupyter_notebooks.title title,
    jupyter_notebooks.description description,
    jupyter_notebooks.keywords keywords,
    jupyter_notebooks.table_of_contents table_of_contents,
    jupyter_notebooks.date_created date_created,
    jupyter_notebooks.image_url image_url,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM jupyter_notebooks 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    jupyter_notebooks.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as JupyterNotebookResponse;
  }
}
/**
 * PATH: /markdown-notes/:id/:title
 * HANDLER: getMarkdownNotePage
 * GET: id, markdown, html, title, description, date_created, last_edited, published, table_of_contents, design_system, breaks, gfm, pedantic, image_url FROM markdown_notes
 * @param req 
 * @param id 
 */
export async function getMarkdownNoteAndLikesAndViews(req:Request,id:string) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND markdown_notes_id=$1) has_liked 
      FROM article_likes WHERE markdown_notes_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,markdown_notes_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE markdown_notes_id=$1
    ) SELECT 
    markdown_notes.id id,
    markdown_notes.markdown markdown,
    markdown_notes.html html,
    markdown_notes.title title,
    markdown_notes.description description,
    markdown_notes.date_created date_created,
    markdown_notes.last_edited last_edited,
    markdown_notes.published published,
    markdown_notes.table_of_contents table_of_contents,
    markdown_notes.design_system design_system,
    markdown_notes.breaks breaks,
    markdown_notes.gfm gfm,
    markdown_notes.pedantic pedantic,
    markdown_notes.image_url image_url,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM markdown_notes 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    markdown_notes.id=$1 AND markdown_notes.published=true;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as MarkdownNoteResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE markdown_notes_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,markdown_notes_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE markdown_notes_id=$1
    ) SELECT 
    markdown_notes.id id,
    markdown_notes.markdown markdown,
    markdown_notes.html html,
    markdown_notes.title title,
    markdown_notes.description description,
    markdown_notes.date_created date_created,
    markdown_notes.last_edited last_edited,
    markdown_notes.published published,
    markdown_notes.table_of_contents table_of_contents,
    markdown_notes.design_system design_system,
    markdown_notes.breaks breaks,
    markdown_notes.gfm gfm,
    markdown_notes.pedantic pedantic,
    markdown_notes.image_url image_url,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM markdown_notes 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    markdown_notes.id=$1 AND markdown_notes.published=true;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as MarkdownNoteResponse;
  }
}
export async function getGoodreadsLetterboxdLikesAndViews(req:Request,id:number,type:'goodreads'|'letterboxd') {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const device = getDevice(req);
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND ${type}_id=$1) has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    ${type}.${device}_html html,
    ${type}.id id, 
    ${type}.title title, 
    ${type}.date_created date_created,
    ${type}.last_edited last_edited, 
    ${type}.description description, 
    ${type}.image image, 
    ${type}.table_of_contents table_of_contents, 
    ${type}.lexical_uuid lexical_id,
    ${type}.rating AS rating,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM ${type} 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    ${type}.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GoodReadLetterboxdResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    ${type}.${device}_html html,
    ${type}.id id, 
    ${type}.title title, 
    ${type}.date_created date_created,
    ${type}.last_edited last_edited, 
    ${type}.description description, 
    ${type}.image image, 
    ${type}.table_of_contents table_of_contents, 
    ${type}.lexical_uuid lexical_id,
    ${type}.rating AS rating,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM ${type} 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    ${type}.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GoodReadLetterboxdResponse;
  }
}
export async function getGameAndDesignLikesAndViews(req:Request,id:number,type:'design'|'game') {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const device = getDevice(req);
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND ${type}_id=$1) has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    ${type==="game"?`games`:`designs_3d`}.${device}_html html,
    ${type==="game"?`games`:`designs_3d`}.id id, 
    ${type==="game"?`games`:`designs_3d`}.title title, 
    ${type==="game"?`games`:`designs_3d`}.date_created date_created,
    ${type==="game"?`games`:`designs_3d`}.last_edited last_edited, 
    ${type==="game"?`games`:`designs_3d`}.description description, 
    ${type==="game"?`games`:`designs_3d`}.image image, 
    ${type==="game"?`games`:`designs_3d`}.table_of_contents table_of_contents, 
    ${type==="game"?`games`:`designs_3d`}.lexical_uuid lexical_id,
    ${type==="game"?`games`:`designs_3d`}.game_javascript AS game_javascript,
    ${type==="design"?`designs_3d.asset_url AS asset_url,`:``}
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM ${type==="game"?`games`:`designs_3d`} 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    ${type==="game"?`games`:`designs_3d`}.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GamesDesignResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE ${type}_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,${type}_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE ${type}_id=$1
    ) SELECT 
    ${type==="game"?`games`:`designs_3d`}.${device}_html html,
    ${type==="game"?`games`:`designs_3d`}.id id, 
    ${type==="game"?`games`:`designs_3d`}.title title, 
    ${type==="game"?`games`:`designs_3d`}.date_created date_created,
    ${type==="game"?`games`:`designs_3d`}.last_edited last_edited, 
    ${type==="game"?`games`:`designs_3d`}.description description, 
    ${type==="game"?`games`:`designs_3d`}.image image, 
    ${type==="game"?`games`:`designs_3d`}.table_of_contents table_of_contents, 
    ${type==="game"?`games`:`designs_3d`}.lexical_uuid lexical_id,
    ${type==="game"?`games`:`designs_3d`}.game_javascript AS game_javascript,
    ${type==="design"?`designs_3d.asset_url AS asset_url,`:``}
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM ${type==="game"?`games`:`designs_3d`} 
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    ${type==="game"?`games`:`designs_3d`}.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GamesDesignResponse;
  }
}
export async function getElectronicsLikesAndViews(req:Request,id:number) {
  const ip_id = req.session.ip_id;
  const user_id = req.session.auth?.userID || null;
  const device = getDevice(req);
  const date_viewed = getUnixTime();
  if (user_id) {
    /**
     * $1 = article ID
     * $2 = userID
     * $3 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      EXISTS(SELECT like_id FROM article_likes WHERE user_id=$2 AND electronics_id=$1) has_liked 
      FROM article_likes WHERE electronics_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (user_id,ip_info_id,electronics_id,date_viewed) 
      VALUES 
      ($2,$3,$1,$4) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE electronics_id=$1
    ) SELECT 
    electronics_projects.${device}_html html,
    electronics_projects.id id, 
    electronics_projects.title title, 
    electronics_projects.date_created date_created,
    electronics_projects.last_edited last_edited, 
    electronics_projects.description description, 
    electronics_projects.image image, 
    electronics_projects.table_of_contents table_of_contents, 
    electronics_projects.lexical_uuid lexical_id,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM electronics_projects
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE 
    electronics_projects.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,user_id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GamesDesignResponse;
  } else {
    /**
     * $1 = article ID
     * $2 = ip_id
     */
    const dbQuery = `WITH like_info AS (
      SELECT 
      COUNT(user_id) like_count,
      false has_liked 
      FROM article_likes WHERE electronics_id=$1
    ), insert_view_info AS (
      INSERT INTO article_views 
      (ip_info_id,electronics_id,date_viewed) 
      VALUES 
      ($2,$1,$3) 
      ON CONFLICT DO NOTHING
    ), view_info AS (
      SELECT count(*) view_count 
      FROM article_views 
      WHERE electronics_id=$1
    ) SELECT 
    electronics_projects.${device}_html html,
    electronics_projects.id id, 
    electronics_projects.title title, 
    electronics_projects.date_created date_created,
    electronics_projects.last_edited last_edited, 
    electronics_projects.description description, 
    electronics_projects.image image, 
    electronics_projects.table_of_contents table_of_contents, 
    electronics_projects.lexical_uuid lexical_id,
    CASE WHEN view_info.view_count=0 THEN 1 ELSE view_info.view_count end views,
    like_info.like_count likes,
    like_info.has_liked has_liked
    FROM electronics_projects
    FULL OUTER JOIN like_info ON TRUE 
    FULL OUTER JOIN view_info ON TRUE 
    WHERE electronics_projects.id=$1;`;
    const queryRes = await getDatabase().query(dbQuery,[id,ip_id,date_viewed]);
    const row = queryRes.rows?.[0];
    if (!!!row) throw new Error("Unable to find article information.");
    return row as GamesDesignResponse;
  }
}

export const EJS_LIKED_TEMPLATE = `<span class="flex-row align-center gap-1">
<button type="button" class="icon text small primary" aria-label="Like Article" hx-get="<%=locals.like_url%>" hx-target="closest span" hx-swap="outerHTML">
  ${SVGS.HEART_FILLED}
</button>
<span style="align-content: center;">
  <%=locals.like_count%>
</span>
</span>`;
export const EJS_NOT_LIKED_TEMPLATE = `<span class="flex-row align-center gap-1">
<button type="button" class="icon text small primary" aria-label="Like Article" hx-get="<%=locals.like_url%>" hx-target="closest span" hx-swap="outerHTML">
  ${SVGS.HEART_OUTLINED}
</button>
<span style="align-content: center;">
  <%=locals.like_count%>
</span>
</span>`
/**
 * Handles request when user likes article
 * @param req 
 * @param res 
 */
export const LIKED_ERROR_SPAN = `<span class="flex-row align-center gap-1">
  <button disabled type="button" class="icon text small primary" aria-label="Like Article">
    ${SVGS.HEART_OUTLINED}
  </button>
  <span style="align-content: center;">
    N/A
  </span>
</span>`;
export async function handleLikeRequest(req:Request,res:Response) {
  const { id } = req.params;
  const type = req.url.split('/')[2];
  const VALID_TYPES = new Set(["note","blog","idea","daily-reading","tex-notes","markdown-notes","jupyter-notebooks",'goodreads','letterboxd','surveys','games','3d-designs','electronics-robotics']);
  if (!!!VALID_TYPES.has(type)) {
    return res.status(200).send(LIKED_ERROR_SPAN.concat(getErrorSnackbar("Something went wrong with the like request!")));
  }
  const like_url = req.url;
  var type_id = 'note_id';
  try {
    switch (type) {
      case 'note': {
        type_id = 'note_id';
        break;
      }
      case 'blog': {
        type_id = 'blog_id';
        break;
      }
      case 'idea': {
        type_id = 'idea_id';
        break;
      }
      case 'daily-reading': {
        type_id = 'wikipedia_id';
        break;
      }
      case 'markdown-notes': {
        type_id = 'markdown_notes_id';
        break;
      }
      case 'jupyter-notebooks': {
        type_id = 'jupyter_notebooks_id';
        break;
      }
      case 'tex-notes': {
        type_id = 'tex_notes_id';
        break;
      }
      case 'letterboxd': {
        type_id = 'letterboxd_id';
        break;
      }
      case 'goodreads': {
        type_id = 'goodreads_id';
        break;
      }
      case 'surveys': {
        type_id = 'survey_id';
        break;
      }
      case 'games': {
        type_id = 'game_id';
        break;
      }
      case '3d-designs': {
        type_id = 'design_id';
        break;
      }
      case 'electronics-robotics': {
        type_id = 'electronics_id';
        break;
      }
      default: {
        throw new Error("Invalid like type for liking article.");
      }
    }
    const db_connection = await getDatabase().connect();
    try {
      await db_connection.query('BEGIN;');
      const res1 = await db_connection.query(`SELECT article_likes.like_id like_id FROM article_likes WHERE ${type_id}=$1 AND user_id=$2;`,[id,Number(req.session.auth?.userID)]);
      if (res1.rows.length) {
        const res2 = await db_connection.query(`WITH delete_query AS (
          DELETE FROM article_likes WHERE ${type_id}=$1 AND user_id=$2 RETURNING like_id
        ) SELECT count(user_id) likes FROM article_likes WHERE ${type_id}=$1;`,[id,Number(req.session.auth?.userID)]);
        const like_count_pre = Number(res2.rows?.[0]?.likes)-1;
        const like_count = Number.isInteger(like_count_pre)?like_count_pre:'NaN'
        await db_connection.query('COMMIT;');
        db_connection.release();
        const response = ejs.render(EJS_NOT_LIKED_TEMPLATE,{ like_url, like_count });
        return res.status(200).send(response);
      } else {
        const date_liked = getUnixTime();
        const res2 = await db_connection.query(`WITH insert_query AS ( 
          INSERT INTO article_likes (${type_id},user_id,date_liked) VALUES ($1,$2,$3) RETURNING like_id
        ) SELECT count(user_id) likes FROM article_likes WHERE ${type_id}=$1;`,[id,Number(req.session.auth?.userID),date_liked]);
       const like_count_pre = Number(res2.rows?.[0]?.likes)+1;
        const like_count = Number.isInteger(like_count_pre)?like_count_pre:'NaN'
        await db_connection.query('COMMIT;');
        db_connection.release();
        const response = ejs.render(EJS_LIKED_TEMPLATE,{ like_url, like_count });
        return res.status(200).send(response);
      }
    } catch (e) {
      console.error(e);
      try {
        await db_connection.query('ROLLBACK;');
        db_connection.release();
      } catch (e) {
        process.exit(1);
      }
      return res.status(200).send(LIKED_ERROR_SPAN.concat(getErrorSnackbar("Something went wrong with the like request!")));
    }   
  } catch (e) {
    console.error(e);
    return res.status(200).send(LIKED_ERROR_SPAN.concat(getErrorSnackbar("Something went wrong with the like request!")));
  }
}

/**
 * Handles request when user comments on 
 */
export async function postArticleComment(req:Request,res:Response) {
  try {
    const { id:idStr } = req.params;
    var id:number|string;
    if (/\d+/.test(idStr)) {
      id = parseInt(idStr);
    } else {
      id = idStr;
    }
    const user_id = Math.round(Number(req.session.auth?.userID));
    const ip_id = Math.round(Number(req.session.ip_id));
    const type_id = getTypeIdFromPath(req.url);
    const lexicalState = req.body['comment-editor'];
    if (!!!lexicalState) {
      return res.status(200).send(getErrorAlert("Unable to find comment in POST body."));
    }
    const { desktop_html, mobile_html, tablet_html, innerText, editorState, unvalidated_audio_urls, unvalidated_image_urls, unvalidated_video_urls, contains_nsfw, able_to_validate } = await parseCommentLexicalEditor(lexicalState);
    if (contains_nsfw) {
      return res.status(200).send(getErrorAlert("The posted comment was flagged as inappropriate."));
    }
    const [moderationResp,embedding] = await Promise.all([moderateOpenAI(innerText),createEmbedding(innerText)]);
    const parsedModerationResp = parseOpenAIModerationResponse(moderationResp);
    // check if the content was flagged in any way
    const IS_INAPPROPRIATE = parsedModerationResp.filter((obj) => obj[0]===true).length>=1
    if (IS_INAPPROPRIATE) {
      return res.status(200).send(getErrorAlert("The posted comment was flagged as inappropriate."));
    }
    const date_created = getUnixTime();
    const comment_id_resp = await getDatabase().query(`INSERT INTO comments (parent_comment_id, user_id, ${type_id}, lexical_state, mobile_html, tablet_html, desktop_html, date_created,validated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id;`,[null,user_id,id,editorState,mobile_html,tablet_html,desktop_html,date_created,able_to_validate]);
    const comment_id = comment_id_resp.rows?.[0].id;
    if (!!!comment_id) throw new Error("Unable to post comment to database.");

    const moderationPromiseArr:Promise<any>[] = [];
    const db = getDatabase();
    const query = GET_INSERT_INTO_MODERATION_TABLE('comment_moderation_responses','comment_id');
    for (let i = 0; i < parsedModerationResp.length; i++) {
      const arr = [comment_id].concat(parsedModerationResp[i]);
      moderationPromiseArr.push(db.query(query,arr));
    }
    moderationPromiseArr.push(
      db.query(GET_INSERT_INTO_ANNOTATION_COMMENT_SEARCH('comment_search','comment_id'),[comment_id,innerText]),
      db.query(GET_INSERT_INTO_ANOTATION_COMMENT_EMBEDDING('comment_embedding','comment_id'),[comment_id,pgvector.toSql(embedding)])
    );
    moderationPromiseArr.push(insertIntoUnvalidatedMedia('comment_id',comment_id,{ images: unvalidated_image_urls, audio: unvalidated_audio_urls, video: unvalidated_video_urls }))
    await Promise.all(moderationPromiseArr);
    const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`
    return res.status(200).send(getSuccessSnackbar("Successfully inserted comment into database!").concat(reloadPageScript));
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong posting the article comment. Try reloading the page!"));
  }
} 


function renderComments(rows:CommentResponseRow[],top_level_comments_num:number,req:Request,exclude?:number[]) {
  if (!!!rows.length) {
    if (exclude && exclude.length) return '';
    else return getInfoAlert('There are currently no comments for this article.',COMMON_SVG.COMMENT,false);
  } else {
    var str = '';
    const graph = new CommentGraph(new CommentNode(rows[0]),top_level_comments_num,exclude);
    for (let i=1;i<rows.length;i++) {
      graph.insert(new CommentNode(rows[i]))
    }
    str = graph.render(req);
  }
  return str;
}
function renderCommentSearch(rows:CommentResponseRow[],req:Request,exclude?:number[]) {
  if (!!!rows.length) {
    if (exclude && exclude.length) return '';
    else {
      const jsNonce = req.session.jsNonce;
    return ejs.render(SEARCH_COMMENT_RESULT,{ comments_str: getInfoAlert('There are currently no comments to show for this search request.',COMMON_SVG.COMMENT,false), jsNonce });
    }
  } else {
    const logged_in = Boolean(Number(req.session.auth?.level)>=1)
    var comments_str = rows.map((obj) => {
      var addition_comments_ind='ind_'.concat(crypto.randomUUID());
      const time_ago = getTimeAgoString(Number(obj.date_created));
      return ejs.render(INDIVIDUAL_COMMENT_EJS,{ ...obj, has_additional_comments:false, child_html:'',logged_in, addition_comments_ind, additional_comments_url:'', time_ago, rating: obj.rating.toFixed(2), desktop: req.session.device?.desktop });
    }).join('');
    const jsNonce = req.session.jsNonce;
    return ejs.render(SEARCH_COMMENT_RESULT,{ comments_str, jsNonce });
  }
}

export async function getArticleComments(req:Request,res:Response,comment_required_variables:ReturnType<typeof getCommentsRequiredVariables>) {
  try {
    var id:string|number = req.url.split('/')[2];
    const path_indicator = req.url.split('/')[1];
    var type_id='note_id';
    switch (path_indicator) {
      case 'note': {
        type_id='note_id';
        id=parseInt(id.toString());
        break;
      }
      case 'blog': {
        type_id='blog_id';
        id=parseInt(id.toString());
        break;
      }
      case 'idea': {
        type_id='idea_id';
        id=parseInt(id.toString());
        break;
      }
      case 'markdown-notes': {
        type_id='markdown_notes_id';
        break;
      }
      case 'jupyter-notebooks': {
        type_id='jupyter_notebooks_id';
        break;
      }
      case 'tex-notes': {
        type_id='tex_notes_id';
        id=parseInt(id.toString());
        break;
      }
      case 'daily-reading': {
        type_id='wikipedia_id';
        id=parseInt(id.toString());
        break;
      }
      case 'goodreads': {
        type_id='goodreads_id';
        id=parseInt(id.toString());
        break;
      }
      case 'letterboxd': {
        type_id='letterboxd_id';
        id=parseInt(id.toString());
        break;
      }
      case 'games': {
        type_id='game_id';
        id=parseInt(id.toString());
        break;
      }
      case '3d-designs': {
        type_id='design_id';
        id=parseInt(id.toString());
        break;
      }
      case 'electronics-robotics': {
        type_id='electronics_id';
        id=parseInt(id.toString());
        break;
      }
      default: {
        throw new Error("Invalid type id for getting article comments.");
      }
    }
    const user_id = req.session.auth?.userID;
    
    var rows:CommentResponseRow[];
    var top_level_comments_num:number = 0;
    const type_html = getDevice(req).concat('_html');
    const db = getDatabase();
    const total_comments_query = `SELECT count(id) count_num FROM comments WHERE parent_comment_id IS NULL AND ${type_id}=$1;`;
    const sort_by = comment_required_variables.comment_sort_by;
    const search_term = comment_required_variables.search_comments_value;
    const search_type = comment_required_variables.search_comments_type;
    const max_level = comment_required_variables.max_level;
    if (!!!search_term.length||!!!search_type) {
      const [query,arr] = getGetCommentsQueryAndArray({ user_id, id, sort_by },type_id,type_html,Boolean(user_id!==undefined),5,undefined,undefined,max_level);
      const [dbResp,top_level_comments_resp] = await Promise.all([
        db.query(query,arr),
        db.query(total_comments_query,[id])
      ]);
      rows = dbResp.rows as CommentResponseRow[];
      top_level_comments_num = top_level_comments_resp.rows[0].count_num;
      if (gettingCommentsRequest(req)) {
        return res.status(200).send(renderComments(rows,top_level_comments_num,req));
      } else {
        return renderComments(rows,top_level_comments_num,req);
      }
    } else {
      const [query,arr] = await getSearchCommentQueryAndArray({ user_id, id, sort_by },search_term,search_type,type_id,type_html,Boolean(user_id!==undefined),50,undefined);
      const [dbResp,top_level_comments_resp] = await Promise.all([
        db.query(query,arr),
        db.query(total_comments_query,[id])
      ]);
      rows = dbResp.rows as CommentResponseRow[];
      top_level_comments_num = top_level_comments_resp.rows[0].count_num;
      if (gettingCommentsRequest(req)) {
        return res.status(200).send(renderCommentSearch(rows,req));
      } else {
        return renderCommentSearch(rows,req);
      }
    }
  } catch (e) {
    console.error(e);
    if (gettingCommentsRequest(req)) {
      return res.status(200).send(getErrorAlert("Something went wrong getting the comments for the article.",COMMON_SVG.COMMENT,false));
    } else {
      return getErrorAlert("Something went wrong getting the comments for the article.",COMMON_SVG.COMMENT,false);
    }
  }  
}

export function getCommentsRequiredVariables(req:Request) {
  const search_comments_query_value = Array.isArray(req.query['search-comments']) ? req.query['search-comments'].at(-1) : req.query['search-comments'];
  const search_comments_value = typeof search_comments_query_value==="string" ? search_comments_query_value : '';
  const search_comments_type_query_value = Array.isArray(req.query['comment-search-type']) ? req.query['comment-search-type'].at(-1) : req.query['comment-search-type'];
  const search_comments_type = isMemberOf(search_comments_type_query_value,VALID_ANNOTATION_COMMENT_SEARCH_TYPE) ? search_comments_type_query_value : 'default';
  const comment_sort_by_query_value = Array.isArray(req.query['comment-sort-by']) ? req.query['comment-sort-by'].at(-1) : req.query['comment-sort-by'];
  const comment_sort_by = isMemberOf(comment_sort_by_query_value,VALID_ANNOTATION_COMMENT_SORT_BY) ? comment_sort_by_query_value : 'best';
  const comment_sort_by_text = SORT_BY_TO_TEXT[comment_sort_by];
  const max_level_str = Array.isArray(req.query['comment-level']) ? req.query['comment-level'].at(-1) : req.query['comment-level'];
  const max_level = Number.isInteger(parseInt(String(max_level_str))) ?  parseInt(String(max_level_str)) : 6;
  return {
    search_comments_value,
    search_comments_type,
    comment_sort_by,
    comment_sort_by_text,
    max_level
  }
}

export function getAnnotationsRequiredVariables(req:Request) {
  const show_annotations_query = Array.isArray(req.query['show-annotations']) ? req.query['show-annotations'].at(-1) : req.query['show-annotations'];
  const show_annotations_checked = Boolean(show_annotations_query);
  const search_annotations_query_value = Array.isArray(req.query['search-annotations']) ? req.query['search-annotations'].at(-1) as string : req.query['search-annotations'];
  const search_annotations_value = typeof search_annotations_query_value === "string" ? search_annotations_query_value : '';
  const search_annotations_typequery_value = Array.isArray(req.query['annotation-search-type']) ? req.query['annotation-search-type'].at(-1) : req.query['annotation-search-type'];
  const search_annotations_type = isMemberOf(search_annotations_typequery_value,VALID_ANNOTATION_COMMENT_SEARCH_TYPE) ? search_annotations_typequery_value : 'default';
  const annotation_sort_by_query_value = Array.isArray(req.query['annotate-sort-input']) ? req.query['annotate-sort-input'].at(-1) : req.query['annotate-sort-input'];
  const annotation_sort_by = isMemberOf(annotation_sort_by_query_value,VALID_ANNOTATION_COMMENT_SORT_BY) ? annotation_sort_by_query_value : 'best';
  const annotation_sort_by_text = SORT_BY_TO_TEXT[annotation_sort_by];
  return {
    annotation_sort_by,
    search_annotations_type,
    search_annotations_value,
    show_annotations_checked,
    annotation_sort_by_text
  }
}
function renderAnnotations(rows:AnnotationRespRow[],req:Request) {
  const is_logged_in = Number(req.session?.auth?.userID)>=1;
  return rows.map((obj) => {
    var upvote_annotation_str = '';
    var downvote_annotation_str = '';
    if (is_logged_in) {
      upvote_annotation_str = `hx-get="/annotation/upvote/${encodeURIComponent(obj.id)}" hx-target="closest span" hx-trigger="click" hx-swap="outerHTML"`
      downvote_annotation_str = `hx-get="/annotation/downvote/${encodeURIComponent(obj.id)}" hx-target="closest span" hx-trigger="click" hx-swap="outerHTML"`
    } else {
      upvote_annotation_str = `data-dialog="login-dialog" data-text="You must be logged in to upvote this article annotation!"`;
      downvote_annotation_str = `data-dialog="login-dialog" data-text="You must be logged in to downvote this article annotation!"`;
    } 
    const { username,id,user_upvote,user_downvote,upvote_count,downvote_count,html, profile_picture, view_count, rating,comment_count, user_id } = obj;
    const vote_count = upvote_count - downvote_count;
    const time_ago = getTimeAgoString(Number(obj.date_created)) 
    return ejs.render(INDIVIDUAL_ANNOTATION_EJS,{username,id,upvote_annotation_str,downvote_annotation_str,user_upvote,user_downvote,vote_count,html,profile_picture,view_count, desktop: Boolean(req.session?.device?.desktop), time_ago, rating, comment_count, user_id });
  }).join('');  
}
export async function getArticleAnnotations(req:Request,res:Response,annotation_required_variables:ReturnType<typeof getAnnotationsRequiredVariables>) {
  const { show_annotations_checked, annotation_sort_by, annotation_sort_by_text, search_annotations_type, search_annotations_value } = annotation_required_variables;
   /**
   * First element in the array should be getting annotations, second should be searching annotations if they exist
   */
  const { id:strID } = req.params;
  const id = parseInt(strID);
  const type_id = getTypeIdFromPath(req.url,1);  
  const user_id = req.session.auth?.userID;

  if (gettingAnnotationsRequest(req)) {
    if (showingAnnotationRequest(req)||changeSortAnnotationRequest(req)) {
      if (!!!show_annotations_checked) {
        return res.status(200).send('');
      } else {
        const [query,arr] = getGetAnnotationsQueryAndArray({ type_id, id, user_id },annotation_sort_by,100,undefined);
        const rows = (await getDatabase().query(query,arr)).rows;
        var inner_html = '';
        if (rows.length) {
          inner_html = renderAnnotations(rows,req);
        } else {
          inner_html = `<div class="alert icon info filled medium mt-1" role="alert"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="Info"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg><p class="alert">There are no annotations to show for this article!</p></div>`
        } 
        if (changeSortAnnotationRequest(req)) {
          return res.status(200).send(inner_html);
        } else {
          const html = ejs.render(SHOW_ANNOTATIONS,{ annotation_sort_by, annotations_html: inner_html, annotation_sort_by_text, desktop: req.session.device?.desktop })
          return res.status(200).send(html);
        }
      }
    } else if (searchingAnnotationRequest(req)) {
      if (!!!search_annotations_value.length) {
        return res.status(200).send(`<p class="body2 bg-warning fw-regular mt-1 p-sm" style="border-radius: 6px;">Search value must be at least 1 character long...</p>`);
      }
      const [query,arr] = await searchAnnotationsQueryAndArray({ type_id, id, user_id },annotation_sort_by,search_annotations_value,search_annotations_type,100,undefined);
      const rows = (await getDatabase().query(query,arr)).rows;
      if (rows.length) {
        return res.status(200).send(renderAnnotations(rows,req));
      } else {
        return res.status(200).send(`<p class="body2 bg-warning fw-regular mt-1 p-sm" style="border-radius: 6px;">There were no search results found...</p>`);
      }
    }
  } else {
    const ret_arr = ['',`<p class="body2 bg-info fw-regular mt-1 p-sm" style="border-radius: 6px;">Output of annotation search goes here...</p>`];
    var main_annotations = false;
    var search_annotations = false;
    const promiseArr:Promise<any>[] = [];
    if (show_annotations_checked) {
      main_annotations = true;
      const [query,arr] = getGetAnnotationsQueryAndArray({ type_id, id, user_id },annotation_sort_by,100,undefined);
      promiseArr.push(getDatabase().query(query,arr))
    } 
    if (search_annotations_value&&search_annotations_value.length) {
      search_annotations = true;
      const [query,arr] = await searchAnnotationsQueryAndArray({ type_id, id, user_id },annotation_sort_by,search_annotations_value,search_annotations_type,100,undefined);
      promiseArr.push(getDatabase().query(query,arr));
    }
    const resp = await Promise.all(promiseArr);
    if (main_annotations) {
      const rows = resp[0].rows;
      var inner_html = '';
      if (rows.length) {
        inner_html = renderAnnotations(rows,req);
      } else {
        inner_html = `<div class="alert icon info filled medium mt-1" role="alert"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="Info"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg><p class="alert">There are no annotations to show for this article!</p></div>`
      } 
      ret_arr[0] = ejs.render(SHOW_ANNOTATIONS,{ annotation_sort_by, annotations_html: inner_html, annotation_sort_by_text, desktop: req.session.device?.desktop });
    }
    if (search_annotations) {
      const rows = resp[1].rows;
      if (rows.length) {
        ret_arr[1] = renderAnnotations(rows,req);
      } else {
        ret_arr[1] = `<p class="body2 bg-warning fw-regular mt-1 p-sm" style="border-radius: 6px;">There were no search results found...</p>`;
      }
      
    }
    return ret_arr;
  }
}

/**
 * Handles request when user annotates an article
 */
export async function postAnnotation(req:Request,res:Response) {
  try {
    const {id:idStr} = req.params;
    const id = parseInt(idStr);
    if (!!!Number.isInteger(id)) {
      return res.status(200).send(getErrorSnackbar("Unable to identify id in annotation request."));
    }
    const type_id = getTypeIdFromPathAnnotations(req.url);
    const user_id = Math.round(Number(req.session.auth?.userID));
    const lexicalEditorStr = req.body['annotate-editor'];
    if (!!!lexicalEditorStr) {
      return res.status(200).send(getErrorSnackbar("Unable to find annotation comment in POST body."));
    }
    const lexicalEditor = JSON.parse(lexicalEditorStr);
    const annotateStartStr = req.body['annotation-start'];
    if (!!!Number.isInteger(parseInt(annotateStartStr))) {
      return res.status(200).send(getErrorSnackbar("Unable to find where the annotation reference starts in annotation request."));
    }
    const start = parseInt(annotateStartStr);
    const annotateEndStr = req.body['annotation-end'];
    if (!!!Number.isInteger(parseInt(annotateEndStr))) {
      return res.status(200).send(getErrorSnackbar("Unable to find where the annotation reference ends in annotation request."));
    }
    const end = parseInt(annotateEndStr);
    const annotationContentStr = req.body['annotation-content'];
    if (!!!annotationContentStr) {
      return res.status(200).send(getErrorSnackbar("Unable to find the annotation content in annotation request."));
    }
    const content = annotationContentStr;
    const annotationReferenceIdStr = req.body['annotation-reference-id'];
    if (!!!annotationReferenceIdStr) {
      return res.status(200).send(getErrorSnackbar("Unable to find what the annotation is referencing in annotation request."));
    }
    const reference_id = annotationReferenceIdStr;
    const { editorState,html,innerText,text_color,background_color,embedding} = await parsePostedAnnotation(lexicalEditor,{ start, end, content, reference_id });
    const moderationResp = await moderateOpenAI(innerText);
    const parsedModerationResp = parseOpenAIModerationResponse(moderationResp);
    // check if the content was flagged in any way
    const IS_INAPPROPRIATE = parsedModerationResp.filter((obj) => obj[0]===true).length>=1
    if (IS_INAPPROPRIATE) {
      return res.status(200).send(getErrorAlert("The posted annotation was flagged as inappropriate."));
    }
    const date_created = getUnixTime();
    const resp = await getDatabase().query(`INSERT INTO annotations (user_id,${type_id},lexical_state,html,date_created,start_index,end_index,content,reference_id,text_color,background_color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id;`, [user_id,id,editorState,html,date_created,start,end,content,reference_id,text_color,background_color]);
    const annotation_id = resp.rows[0].id;
    if (!!!annotation_id) throw new Error("Unable to post annotation to database.");
    const moderationPromiseArr:Promise<any>[] = [];
    const db = getDatabase();
    const query = GET_INSERT_INTO_MODERATION_TABLE('annotation_moderation_responses','annotation_id');
    for (let i = 0; i < parsedModerationResp.length; i++) {
      const arr = [annotation_id].concat(parsedModerationResp[i]);
      moderationPromiseArr.push(db.query(query,arr));
    }
    moderationPromiseArr.push(
      db.query(GET_INSERT_INTO_ANNOTATION_COMMENT_SEARCH('annotation_search','annotation_id'),[annotation_id,innerText]),
      db.query(GET_INSERT_INTO_ANOTATION_COMMENT_EMBEDDING('annotation_embedding','annotation_id'),[annotation_id,pgvector.toSql(embedding)])
    );
    await Promise.all(moderationPromiseArr);
    const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      document.dispatchEvent(new CustomEvent("REFRESH_ANNOTATION_EDITOR"));
    })()</script>`
    return res.status(200).send(getSuccessSnackbar("Successfully inserted annotation into database!").concat(reloadPageScript));
  } catch (e) {
    console.error(e);
    return res.status(200).send(`<div class="alert small error filled" role="alert"><p class="alert">Something went wrong posting the annotation.</p></div>`);
  }
}

/**
 * Get HTML for when a user wants to respond to a comment 
 * @param req 
 * @param res 
 */
export async function getCommentHTML(req:Request,res:Response) {
  try {
    const type = req.url.split('/')[1];
    const VALID_TYPES = new Set(['note','idea','blog','daily-reading']);
    if (!!!VALID_TYPES.has(type)) {
      return res.status(200).send(getErrorAlert("Invalid annotation request GET endpoint."));
    }

  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the comment HTML."));
  }
}

export async function likeComment(req:Request,res:Response) {
  const like_url = req.url.slice(0,req.url.indexOf('?'));
  try {
    const { id:comment_id } = req.params;
    const userID = req.session.auth?.userID;
    if (typeof userID!=='number') {
      throw new Error("You must be logged in to like a comment.");
    }
    const resp = await getDatabase().query(`SELECT id FROM comment_likes WHERE user_id=$1 AND comment_id=$2;`,[userID,comment_id]);
    if (!!!resp.rows.length) {
      const resp = await getDatabase().query(`WITH initial_statement AS (
        INSERT INTO comment_likes (comment_id,user_id) VALUES ($1,$2) 
      ) SELECT count(user_id)+1 like_count FROM comment_likes WHERE comment_id=$1;`,[comment_id,userID]);
      const like_count = resp.rows[0].like_count;
      const response = ejs.render(EJS_LIKED_TEMPLATE,{ like_url, like_count });
      return res.status(200).send(response);
    } else {
      const resp = await getDatabase().query(`WITH initial_statement AS (
        DELETE FROM comment_likes WHERE comment_id=$1 AND user_id=$2 
      ) SELECT count(user_id)-1 like_count FROM comment_likes WHERE comment_id=$1;`,[comment_id,userID]);
      const like_count = resp.rows[0].like_count;
      const response = ejs.render(EJS_NOT_LIKED_TEMPLATE,{ like_url, like_count });
      return res.status(200).send(response);
    }
  } catch (e) {
    console.error(e);
    return res.status(200).send(LIKED_ERROR_SPAN.concat(getErrorSnackbar("Something went wrong with the like request!")));
  }
}
 
export async function upvoteDownvoteAnnotation(req:Request,res:Response) {
  const renderObj = {
    id: 0,
    user_upvote: false,
    user_downvote: false,
    error: false,
    layout: false,
    vote_count: 0
  };
  const view = 'partials/individual-annotation-votes';
  try {
    const { id:annotation_id } = req.params;
    renderObj.id = parseInt(annotation_id);
    const vote_type = req.url.split('/')[2];
    if (vote_type!=='upvote'&&vote_type!=='downvote') throw new Error("Unrecognized upvote/downvote request.");
    const db_connection = await getDatabase().connect();
    const user_id = Number(req.session.auth?.userID);
    var upvote_count:number, downvote_count:number;
    try {
      await db_connection.query('BEGIN;');
      const resp1 = await db_connection.query('SELECT upvote, downvote FROM annotation_votes WHERE user_id=$1 and annotation_id=$2;',[user_id,annotation_id]);
      if (resp1.rows.length) {
        if ((vote_type==="upvote"&&resp1.rows[0].upvote)||(vote_type==="downvote"&&resp1.rows[0].downvote)) {
          await db_connection.query('DELETE FROM annotation_votes WHERE annotation_id=$1 AND user_id=$2;',[annotation_id,user_id]);
        } else {
          const upvote = vote_type==="upvote";
          const downvote = vote_type==="downvote";
          await db_connection.query(`UPDATE annotation_votes SET upvote=$1, downvote=$2 WHERE user_id=$3 and annotation_id=$4;`,[upvote,downvote,user_id,annotation_id]);
          renderObj.user_downvote = downvote;
          renderObj.user_upvote = upvote;
        }
      } else {
        const upvote = vote_type==="upvote";
        const downvote = vote_type==="downvote";
        await db_connection.query(`INSERT INTO annotation_votes (annotation_id,user_id,${vote_type}) VALUES ($1,$2,true);`,[annotation_id,user_id]);
        renderObj.user_downvote = downvote;
        renderObj.user_upvote = upvote;
      }
      const resp = await db_connection.query(` SELECT count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count, count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count FROM annotation_votes WHERE annotation_id=$1;`,[annotation_id]);
      upvote_count = resp.rows[0].upvote_count;
      downvote_count = resp.rows[0].downvote_count;
      renderObj.vote_count = upvote_count - downvote_count;
      await db_connection.query('COMMIT;');
      db_connection.release();
      return res.status(200).render(view,renderObj);
    } catch (e) {
      renderObj.error = true;
      console.error(e);
      try { db_connection.query('ROLLBACK;'); } catch (e) { console.error(e); }
      db_connection.release();
      return res.status(200).render(view,renderObj);
    }
  } catch (e) {
    renderObj.error=true;
    console.error(e);
    return res.status(200).send();
  }
}
export async function getCommentForm(req:Request,res:Response) {
  try {
    const { id } = req.params;
    const idStr = `add-comment-wrapper-${id}`;
    const commentLexical = getCommentImplementation(req,idStr,false,undefined,{ wrapperStyle: "block lexical-wrapper mt-1", type: 'comment', rteStyle: 'max-height: 400px; min-height: 150px; overflow-y:auto; resize: vertical!important;' })
    return res.status(200).render("partials/comment-form",{ layout: false, comment_id: id, commentLexical });
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert("Something went wrong getting the comment form.",'<svg viewBox="0 0 640 512" title="comments" focusable="false" inert tabindex="-1"><path d="M88.2 309.1c9.8-18.3 6.8-40.8-7.5-55.8C59.4 230.9 48 204 48 176c0-63.5 63.8-128 160-128s160 64.5 160 128s-63.8 128-160 128c-13.1 0-25.8-1.3-37.8-3.6c-10.4-2-21.2-.6-30.7 4.2c-4.1 2.1-8.3 4.1-12.6 6c-16 7.2-32.9 13.5-49.9 18c2.8-4.6 5.4-9.1 7.9-13.6c1.1-1.9 2.2-3.9 3.2-5.9zM0 176c0 41.8 17.2 80.1 45.9 110.3c-.9 1.7-1.9 3.5-2.8 5.1c-10.3 18.4-22.3 36.5-36.6 52.1c-6.6 7-8.3 17.2-4.6 25.9C5.8 378.3 14.4 384 24 384c43 0 86.5-13.3 122.7-29.7c4.8-2.2 9.6-4.5 14.2-6.8c15.1 3 30.9 4.5 47.1 4.5c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176zM432 480c16.2 0 31.9-1.6 47.1-4.5c4.6 2.3 9.4 4.6 14.2 6.8C529.5 498.7 573 512 616 512c9.6 0 18.2-5.7 22-14.5c3.8-8.8 2-19-4.6-25.9c-14.2-15.6-26.2-33.7-36.6-52.1c-.9-1.7-1.9-3.4-2.8-5.1C622.8 384.1 640 345.8 640 304c0-94.4-87.9-171.5-198.2-175.8c4.1 15.2 6.2 31.2 6.2 47.8l0 .6c87.2 6.7 144 67.5 144 127.4c0 28-11.4 54.9-32.7 77.2c-14.3 15-17.3 37.6-7.5 55.8c1.1 2 2.2 4 3.2 5.9c2.5 4.5 5.2 9 7.9 13.6c-17-4.5-33.9-10.7-49.9-18c-4.3-1.9-8.5-3.9-12.6-6c-9.5-4.8-20.3-6.2-30.7-4.2c-12.1 2.4-24.7 3.6-37.8 3.6c-61.7 0-110-26.5-136.8-62.3c-16 5.4-32.8 9.4-50 11.8C279 439.8 350 480 432 480z"></path></svg>',false));
  }
}
export async function postSubComment(req:Request,res:Response) {
  try {
    const { id:comment_uuid } = req.params;
    const user_id = Math.round(Number(req.session.auth?.userID));
    const ip_id = Math.round(Number(req.session.ip_id));

    var lexicalState:undefined|any = undefined;
    Object.keys(req.body).forEach((key) => {
      if (key.startsWith('add-comment-wrapper')) {
        lexicalState = req.body[key];
      }
    })
    if (!!!lexicalState) {
      return res.status(200).send(getErrorAlert("Unable to find posted comment!",COMMON_SVG.COMMENT));
    }
    const { desktop_html, mobile_html, tablet_html, innerText, editorState, unvalidated_audio_urls, unvalidated_image_urls, unvalidated_video_urls, contains_nsfw, able_to_validate } = await parseCommentLexicalEditor(lexicalState);
    if (contains_nsfw) {
      return res.status(200).send(getErrorAlert("The posted comment was flagged as inappropriate."));
    }
    const [moderationResp,embedding] = await Promise.all([moderateOpenAI(innerText),createEmbedding(innerText)]);
    const parsedModerationResp = parseOpenAIModerationResponse(moderationResp);
    // check if the content was flagged in any way
    const IS_INAPPROPRIATE = parsedModerationResp.filter((obj) => obj[0]===true).length>=1
    if (IS_INAPPROPRIATE) {
      return res.status(200).send(getErrorAlert("The posted comment was flagged as inappropriate."));
    }
    const date_created = getUnixTime();
    const comment_id_resp = await getDatabase().query(`WITH parent_info AS (
      SELECT id, note_id, blog_id, idea_id, wikipedia_id, tex_notes_id, jupyter_notebooks_id, markdown_notes_id, annotation_id, path FROM comments WHERE comment_uuid=$1
    ) INSERT INTO comments (parent_comment_id, user_id, note_id, blog_id, idea_id, wikipedia_id, tex_notes_id, jupyter_notebooks_id, markdown_notes_id, annotation_id, lexical_state, mobile_html, tablet_html, desktop_html, date_created, path, validated) SELECT 
  id, $2, note_id, blog_id, idea_id, wikipedia_id, tex_notes_id, jupyter_notebooks_id, markdown_notes_id, annotation_id, $3, $4, $5, $6, $7, COALESCE(path,''::ltree) || id::text, $8 
FROM parent_info RETURNING id;`,[comment_uuid,user_id,editorState,mobile_html,tablet_html,desktop_html,date_created,able_to_validate]);
  const comment_id = comment_id_resp.rows?.[0].id;
    if (!!!comment_id) throw new Error("Unable to post comment to database.");
    const moderationPromiseArr:Promise<any>[] = [];
    const db = getDatabase();
    const query = GET_INSERT_INTO_MODERATION_TABLE('comment_moderation_responses','comment_id');
    for (let i = 0; i < parsedModerationResp.length; i++) {
      const arr = [comment_id].concat(parsedModerationResp[i]);
      moderationPromiseArr.push(db.query(query,arr));
    }
    moderationPromiseArr.push(
      db.query(GET_INSERT_INTO_ANNOTATION_COMMENT_SEARCH('comment_search','comment_id'),[comment_id,innerText]),
      db.query(GET_INSERT_INTO_ANOTATION_COMMENT_EMBEDDING('comment_embedding','comment_id'),[comment_id,pgvector.toSql(embedding)]) 
    ); 
    moderationPromiseArr.push(insertIntoUnvalidatedMedia('comment_id',comment_id,{ images: unvalidated_image_urls, audio: unvalidated_audio_urls, video: unvalidated_video_urls }));
    await Promise.all(moderationPromiseArr);
    const reloadPageScript = `<script nonce="${String(req.session.jsNonce)}">(() => {
      setTimeout(() => {
        window.location.reload();
      },500);
    })()</script>`
    return res.status(200).send(getSuccessSnackbar("Successfully inserted comment into database!").concat(reloadPageScript));

  } catch (e) { 
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong posting your comment!",COMMON_SVG.COMMENT));
  }
} 

export async function getMoreComments(req:Request,res:Response) {
  try {
    var exclude = req.query['exclude'];
    if (typeof exclude==="string") {
      exclude = [exclude];
    }
    const parent_id = req.query['parent_id'];
    const path = req.headers.referer;
    if ((Array.isArray(exclude)&&path)||(parent_id&&path)) {
      const url = new URL(path);
      const pathname = url.pathname;
      const type_id = getTypeIdFromPath(pathname,1);
      const type_html = getDevice(req).concat('_html');
      const user_id = req.session?.auth?.userID;
      const sort_by_str = url.searchParams.get('comment-sort-by');
      const sort_by = isMemberOf(sort_by_str,VALID_ANNOTATION_COMMENT_SORT_BY) ? sort_by_str : 'best';
      var id:string|number = pathname.split('/')[2];
      const exclude_final = Array.isArray(exclude) ? exclude.filter((s) => typeof s==="string").map((s) => parseInt(String(s))).filter((s) => Number.isInteger(s)) : undefined;
      const db = getDatabase();
      const parent_id_final = Number.isInteger(parseInt(String(parent_id))) ? parseInt(String(parent_id)) : undefined;
      const [query,arr] = getGetCommentsQueryAndArray({ user_id, id, sort_by },type_id,type_html,Boolean(user_id!==undefined),5,exclude_final,parent_id_final);
      var total_comments_query = '';
      const total_comments_array:any[] = [id];
      if (parent_id_final) {
        total_comments_query = `SELECT count(id) count_num FROM comments WHERE ${type_id}=$1 AND comments.parent_comment_id =$2;`;
        total_comments_array.push(parent_id_final);
      } else {
        total_comments_query = `SELECT count(id) count_num FROM comments WHERE parent_comment_id IS NULL AND ${type_id}=$1;`;
      }
      const [dbResp,top_level_comments_resp] = await Promise.all([
        db.query(query,arr),
        db.query(total_comments_query,total_comments_array)
      ]);
      const rows = dbResp.rows as CommentResponseRow[];
      const top_level_comments_num = top_level_comments_resp.rows[0].count_num;
      const str = renderComments(rows,top_level_comments_num,req,exclude_final);
      return res.status(200).send(str);
    } else {
      throw new Error("Something went wrong.");
    }
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting more comments. Try reloading the page.",COMMON_SVG.COMMENT,false));
  }
}

export function gettingCommentsRequest(req:Request) {
  return Boolean(req.get('hx-target')==="user-comments-list");
}
export function gettingAnnotationsRequest(req:Request) {
  return Boolean(showingAnnotationRequest(req)||changeSortAnnotationRequest(req)||searchingAnnotationRequest(req));
}
export function showingAnnotationRequest(req:Request) {
  return Boolean(req.get('hx-target')==="show-annotation-form-output");
}
export function changeSortAnnotationRequest(req:Request) {
  return Boolean(req.get('hx-target')==="annotation-inners");
}
export function searchingAnnotationRequest(req:Request) {
  return Boolean(req.get('hx-target')==="annotation-search-output");
}

export async function postAnnotationComment(req:Request,res:Response) {
  try {
    const { id:idStr } = req.params;
    const annotation_id = parseInt(idStr);
    if (!!!Number.isInteger(annotation_id)) {
      return res.status(200).send(getErrorAlert("Invalid annotation id.",undefined,false));
    }
    const user_id = req.session.auth?.userID;
    if (!!!Number.isInteger(user_id)) {
      return res.status(200).send(getErrorAlert("Something went wrong posting the annotation comment.",undefined,false));
    }
    const annotation_comment = req.body['annotation-comment'];
    if (typeof annotation_comment!=='string'||annotation_comment.length<1||annotation_comment.length>2000) {
      return res.status(200).send(getErrorAlert("Something went wrong posting the annotation comment.",undefined,false));
    }
    const moderateOpenAIResp = await moderateOpenAI(annotation_comment);
    const IS_FLAGGED = moderateOpenAIResp.filter((obj) => obj.flagged===true).length>=1;
    if (IS_FLAGGED) {
      return res.status(200).send(getErrorAlert("The comment goes against the content moderation rules for this site.",undefined,false));
    }
    await getDatabase().query(`INSERT INTO annotation_comments (user_id, annotation_id, comment, date_created) VALUES ($1,$2,$3,$4);`,[user_id,annotation_id,annotation_comment,getUnixTime()]);
    return res.status(200).send(getSuccessAlert("Successfully created annotation comment. Close the dialog and re-open it to see it.",undefined,false));
  } catch (e) {
    console.error(e);
    return res.status(200).send("Something went wrong posting the annotation article.");
  }
}
export async function getAnnotationsDialog(req:Request,res:Response) {
  try {
    const { id } = req.params;
    if (!!!Number.isInteger(parseInt(id))) {
      return res.status(200).send(getErrorSnackbar("Something went wrong getting the annotation comments!"));
    }
    const is_logged_in = Number(req.session.auth?.level)>=1;
    var upvote_annotation_str = '';
    var downvote_annotation_str = '';
    if (is_logged_in) {
      upvote_annotation_str = `hx-get="/annotation/upvote/${encodeURIComponent(id)}" hx-target="closest span" hx-trigger="click" hx-swap="outerHTML"`
      downvote_annotation_str = `hx-get="/annotation/downvote/${encodeURIComponent(id)}" hx-target="closest span" hx-trigger="click" hx-swap="outerHTML"`
    } else {
      upvote_annotation_str = `data-dialog="login-dialog" data-text="You must be logged in to upvote this article annotation!"`;
      downvote_annotation_str = `data-dialog="login-dialog" data-text="You must be logged in to downvote this article annotation!"`;
    } 
    const path = 'dialogs/annotations-dialog';
    const obj:any = { layout: false };
    const annotation_comments_query = `WITH annotation_downvotes_count AS (
  SELECT count(id) AS downvote_count, 
  annotation_comment_upvote_downvote.annotation_id 
  FROM annotation_comment_upvote_downvote
  WHERE annotation_comment_upvote_downvote.annotation_id=$1 AND downvote=true 
  GROUP BY annotation_comment_upvote_downvote.annotation_id
), annotation_upvotes_count AS (
  SELECT count(id) AS upvote_count, 
  annotation_comment_upvote_downvote.annotation_id 
  FROM annotation_comment_upvote_downvote 
  WHERE annotation_comment_upvote_downvote.annotation_id=$1 AND upvote=true 
  GROUP BY annotation_comment_upvote_downvote.annotation_id
) SELECT 
 users.user_username AS username, 
 users.id AS user_id, 
 users.profile_picture AS pp, 
 annotation_comments.comment AS comment, 
 annotation_comments.date_created AS date_created, 
 COALESCE(annotation_upvotes_count.upvote_count,0) - COALESCE(annotation_downvotes_count.downvote_count,0) AS vote_count 
 FROM annotation_comments 
 LEFT JOIN users ON annotation_comments.user_id=users.id 
 LEFT JOIN annotation_upvotes_count ON 
 annotation_upvotes_count.annotation_id=annotation_comments.annotation_id 
 LEFT JOIN annotation_downvotes_count 
 ON annotation_downvotes_count.annotation_id=annotation_comments.annotation_id 
 WHERE annotation_comments.annotation_id=$1 
 ORDER BY vote_count DESC;`;
    const annotation_query = `WITH annotation_comments_count AS (
  SELECT count(id) AS comment_count, 
  annotation_comments.annotation_id 
  FROM annotation_comments 
  WHERE annotation_comments.annotation_id=$1 
  GROUP BY annotation_comments.annotation_id
), annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  WHERE annotations.id=$1
	GROUP BY annotation_views.annotation_id
), annotation_upvotes AS (
  SELECT 
  count(id) AS upvote_count, 
  annotation_votes.annotation_id 
  FROM annotation_votes 
  WHERE annotation_votes.annotation_id=$1 AND upvote=true 
  GROUP BY (annotation_votes.annotation_id) 
), annotation_downvotes AS (
  SELECT 
  count(id) AS downvote_count, 
  annotation_votes.annotation_id 
  FROM annotation_votes 
  WHERE annotation_votes.annotation_id=$1 AND downvote=true 
  GROUP BY (annotation_votes.annotation_id) 
), user_votes_cte AS (
    ${is_logged_in?`SELECT 
	annotation_votes.upvote AS upvote,
	annotation_votes.downvote AS downvote,
	annotations.id AS annotation_id 
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.id=$1 AND annotation_votes.user_id=$2`:`SELECT false AS upvote, false AS downvote, $1 AS annotation_id`}
) SELECT 
 annotations.html AS html, 
 annotations.id AS id, 
 annotations.rating as rating,
 annotations.date_created AS date_created, 
 users.user_username AS username, 
 users.id AS user_id, 
 users.profile_picture AS pp, 
 COALESCE(annotation_view_counts.view_count,0) AS view_count, 
 COALESCE(annotation_comments_count.comment_count,0) AS comment_count, 
 COALESCE(annotation_upvotes.upvote_count,0) - COALESCE(annotation_downvotes.downvote_count,0) AS vote_count,
 COALESCE(user_votes_cte.upvote,false) user_upvote,
 COALESCE(user_votes_cte.downvote,false) user_downvote 
 FROM annotations 
 LEFT JOIN users ON annotations.user_id=users.id 
 LEFT JOIN annotation_view_counts ON annotations.id=annotation_view_counts.id 
 LEFT JOIN annotation_upvotes ON annotations.id=annotation_upvotes.annotation_id
 LEFT JOIN annotation_downvotes ON annotations.id=annotation_downvotes.annotation_id
 LEFT JOIN annotation_comments_count ON annotation_comments_count.annotation_id=annotations.id 
 LEFT JOIN user_votes_cte ON user_votes_cte.annotation_id=annotations.id
 WHERE annotations.id=$1 
 LIMIT 1;`;
    const db = getDatabase();
    const annotation_arr = [parseInt(id)];
    if (is_logged_in) annotation_arr.push(Number(req.session.auth?.userID));
    const [annotation_comments,annotation_info] = await Promise.all([
      db.query(annotation_comments_query,[parseInt(id)]),
      db.query(annotation_query,annotation_arr)
    ]);
    if (!!!annotation_info.rows.length) {
      return res.status(200).send(getErrorSnackbar("Something went wrong getting the annotation comments!"));
    }
    const now = getUnixTime();
    const { html, id:annotation_id, username, user_id, comment_count, vote_count, date_created, pp:profile_picture, view_count, rating, user_upvote, user_downvote } = annotation_info.rows[0];
    const time_ago = getTimeAgoString(Number(Number(date_created)));
    const annotation = ejs.render(INDIVIDUAL_ANNOTATION_DIALOG_EJS,{id:annotation_id,profile_picture,username,time_ago, comment_count, html, vote_count, user_id, view_count, rating, upvote_annotation_str, downvote_annotation_str, user_upvote, user_downvote })
    var comments_html = getWarningAlert("There are currently no comments to show for this annotation.",undefined,false);
    if (annotation_comments.rows.length) {
      comments_html = annotation_comments.rows.map((row) => {
        const { username, pp, user_id, comment, date_created, vote_count } = row;
        const time_ago = getTimeAgoString(Number(Number(date_created)));
        return ejs.render(ANNOTATION_COMMENT,{time_ago,username,comment,pp,user_id,vote_count})
      }).join('');
    }
    obj.comments_html = comments_html;
    obj.id = annotation_id;
    obj.annotation = annotation;
    obj.jsNonce = req.session.jsNonce;
    obj.logged_in = is_logged_in;
    return res.status(200).render(path,obj);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorSnackbar("Something went wrong getting the annotation comments!"));
  }
}

export async function getDeepComments(req:Request,res:Response) {
  try {
    const { id } = req.params;
    if (!!!Number.isInteger(parseInt(id))) {
      throw new Error("Invalid comment id - it should be an integer.");
    }
    const user_id = req.session.auth?.userID;
    const type_id='id';
    const type_html = getDevice(req).concat('_html');
    const req_var = getCommentsRequiredVariables(req);
    const max_level = req_var.max_level;
    const [base_comment_str,exclude_arr] = await getDeepCommentsHelper(req,{ user_id, id: parseInt(id)},type_html); 
    const [query,arr] = getGetCommentsQueryAndArray({ user_id, id:parseInt(id), sort_by:'best' },type_id,type_html,Boolean(user_id!==undefined),5,undefined,parseInt(id),max_level);
    const total_comments_query = `SELECT count(id) count_num FROM comments WHERE comments.id=$1;`;
    const total_comments_arr = [parseInt(id)];
    const db = getDatabase();
    const [dbResp,top_level_comments_resp] = await Promise.all([
      db.query(query,arr),
      db.query(total_comments_query,total_comments_arr)
    ]);
    const rows = dbResp.rows as CommentResponseRow[];
    const top_level_comments_num = top_level_comments_resp.rows[0].count_num;
    const str = renderComments(rows,top_level_comments_num,req,exclude_arr);
    console.log(str);
    const comment_chain = base_comment_str.concat(str);

    const view = 'pages/comments';
    const title = 'Nested Comments';
    const image = 'https://image.storething.org/frankmbrown%2F80c36a48-c809-4b0a-8d8a-52f68b8e41f2.jpg';
    const description="Page to show nested comments.";
    const path = `/comments/${encodeURIComponent(id)}`;
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = [];
    const tableOfContents:TableOfContentsItem[] = [];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      comment_chain
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/404',404,{ severity: "error", message: "Something went wrong getting the requested comment."});
  }
}