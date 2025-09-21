import { toSql } from "pgvector/pg";
import { createEmbedding } from "../../../ai";
import getDatabase from "../../../database";
import { CommentNode, CommentResponseRow } from "./handleArticleData";
import { Request } from 'express';

/**
 * Returns function to get 
 * @param type_id markdown_notes_id, ...
 * @param type_html desktop_html, mobile_html, ...
 * @param is_logged_in boolean
 * @param limit DEFAULT 5 
 * @param exclude Array of ids of base comments to exclude
 * @param base_comment_parent parent whose subcomments you are getting
 * @returns 
 */
export function getGetCommentsQueryAndArray(obj:{ user_id?: number, id: number|string, sort_by: 'best'|'new'|'recommended-1'|'recommended-2' },type_id:string,type_html:string,is_logged_in:boolean,limit:number=15,exclude?:number[],base_comment_parent?:number,max_level=6) {
  var base_comment_var = 2;
  var exclude_var = 2;
  if (is_logged_in) {
    base_comment_var+=1;
  }
  if (is_logged_in&&base_comment_parent) {
    exclude_var+=2;
  } else if (is_logged_in||base_comment_parent) {
    exclude_var+=1;
  }
  const arr:any[] = [obj.id];
  if (obj.user_id) arr.push(obj.user_id);
  if (base_comment_parent) arr.push(base_comment_parent);
  if (exclude) arr.push(exclude);
  var order_by = '';
  if (obj.sort_by==="new") {
    order_by = 'comments.date_created DESC'
  } else {
    order_by = 'comments.rating DESC'
  }
  arr.push(max_level);
  const ret = [`WITH comment_likes_cte AS (
  SELECT 
  count(comment_likes.user_id) comment_like_count, 
  comment_likes.comment_id id
  FROM comments 
  JOIN comment_likes
  ON comments.id=comment_likes.comment_id
  WHERE comments.${type_id}=$1 AND comments.validated=true
  GROUP BY comment_likes.comment_id
), comment_viewed_info AS (
  SELECT 
  count(comment_views.id) comment_views_count,
  comment_views.comment_id id 
  FROM comments 
  JOIN comment_views 
  ON comments.id=comment_views.comment_id AND comments.validated=true
  WHERE comments.${type_id}=$1
  GROUP BY comment_views.comment_id
)${is_logged_in?`, user_liked_info AS (
  SELECT 
  comments.id id,
  true user_liked
  FROM comments 
  JOIN comment_likes
  ON comments.id=comment_likes.comment_id
  WHERE comments.${type_id}=$1 AND comment_likes.user_id=$2 AND comments.validated=true
)`:`, user_liked_info AS (
  SELECT 
  $1 id,
  false user_liked 
)`}, comment_comments AS (
  SELECT 
  count(id) comment_count,
  parent_comment_id id 
  FROM comments 
  WHERE comments.${type_id}=$1 AND parent_comment_id IS NOT NULL AND comments.validated=true
  GROUP BY comments.parent_comment_id
), base_comments AS (
  SELECT 
  comments.id id,
  comments.${type_html} html,
  comments.date_created date_created,
  comments.comment_uuid comment_id,
  COALESCE(comment_likes_cte.comment_like_count,0) like_count,
  COALESCE(comment_viewed_info.comment_views_count,0) view_count,
  COALESCE(comment_comments.comment_count,0) comment_count,
  comments.path path,
  users.user_username username,
  users.profile_picture pp,
  comments.user_id user_id,
  ${is_logged_in?`user_liked_info.user_liked user_liked`:`false user_liked`},
  CASE WHEN comments.path IS NULL THEN 0 ELSE nlevel(comments.path) END level,
  comments.rating rating
  FROM comments 
  JOIN users 
  ON users.id=comments.user_id
  LEFT JOIN comment_likes_cte
  ON comments.id=comment_likes_cte.id
  LEFT JOIN comment_viewed_info
  ON comments.id=comment_viewed_info.id
  LEFT JOIN comment_comments 
  ON comments.id=comment_comments.id
  ${is_logged_in?`LEFT JOIN user_liked_info
  ON comments.id=user_liked_info.id`:``}
  WHERE comments.${type_id}=$1 AND comments.validated=true
  ${Boolean(!!!base_comment_parent)?`AND comments.parent_comment_id IS NULL`:``}
  ${Boolean(base_comment_parent)?`AND comments.parent_comment_id=$${base_comment_var}`:``}
   ${Boolean(base_comment_parent)?`AND comments.id<>$${base_comment_var}`:``}
  ${Boolean(exclude)?`AND comments.id NOT IN (SELECT unnest($${exclude_var}::int[]) id)`:``}
  ORDER BY ${order_by}
  LIMIT ${limit}
) SELECT * FROM base_comments UNION ALL ( 
  SELECT 
  comments.id id,
  comments.${type_html} html,
  comments.date_created date_created,
  comments.comment_uuid comment_id,
  COALESCE(comment_likes_cte.comment_like_count,0) like_count,
  COALESCE(comment_viewed_info.comment_views_count,0) view_count,
  COALESCE(comment_comments.comment_count,0) comment_count,
  comments.path path,
  users.user_username username,
  users.profile_picture pp,
  comments.user_id user_id,
  ${is_logged_in?`user_liked_info.user_liked user_liked`:`false user_liked`},
  COALESCE(nlevel(comments.path),0) level,
  comments.rating rating
  FROM comments 
  JOIN users 
  ON users.id=comments.user_id
  LEFT JOIN comment_likes_cte
  ON comments.id=comment_likes_cte.id
  LEFT JOIN comment_viewed_info
  ON comments.id=comment_viewed_info.id
  LEFT JOIN comment_comments 
  ON comments.id=comment_comments.id
  ${is_logged_in?`LEFT JOIN user_liked_info
  ON comments.id=user_liked_info.id`:``}
  WHERE comments.${type_id}=$1 AND comments.validated=true
  AND comments.path <@ ANY ${Boolean(base_comment_parent)?`(SELECT path FROM base_comments)`:`(SELECT id::text::ltree FROM base_comments)`}
  AND COALESCE(nlevel(comments.path),0) < $${arr.length}
  ${Boolean(exclude)?`AND comments.id NOT IN (SELECT unnest($${exclude_var}::int[]) id)`:``}
  ${Boolean(base_comment_parent)?`AND comments.id<>$${base_comment_var}`:``}
  ORDER BY COALESCE(nlevel(comments.path),0) ASC, 
  ${order_by}
  LIMIT ${limit}
);`,arr] as [string,any[]];
  return ret;
}
export async function getSearchCommentQueryAndArray(obj:{ user_id?: number, id: number|string, sort_by: 'best'|'new'|'recommended-1'|'recommended-2' },search_term:string,search_type:'semantic'|'default',type_id:string,type_html:string,is_logged_in:boolean,limit:number=100,exclude?:number[]) {
  var query_var = 2;
  var exclude_var = 3;
  if (is_logged_in) {
    query_var+=1;
    exclude_var+=1;
  }
  const arr:any[] = [obj.id];
  if (obj.user_id) arr.push(obj.user_id);
  if (search_type==="semantic") {
    const embedding = await createEmbedding(search_term);
    arr.push(toSql(embedding));
  } else {
    arr.push(search_term);
  }
  if (exclude) arr.push(exclude);
  var order_by = '';
  if (search_type==="semantic") {
    order_by+= `cosine_similarity DESC, `
  }
  if (obj.sort_by==="new") {
    order_by += 'comments.date_created DESC'
  } else {
    order_by += 'comments.rating DESC'
  }
  return [`WITH comment_likes_cte AS (
    SELECT 
    count(comment_likes.user_id) comment_like_count, 
    comment_likes.comment_id id
    FROM comments 
    JOIN comment_likes
    ON comments.id=comment_likes.comment_id
    WHERE comments.${type_id}=$1 AND comments.validated=true
    GROUP BY comment_likes.comment_id
  ), comment_viewed_info AS (
    SELECT 
    count(comment_views.id) comment_views_count,
    comment_views.comment_id id 
    FROM comments 
    JOIN comment_views 
    ON comments.id=comment_views.comment_id AND comments.validated=true
    WHERE comments.${type_id}=$1
    GROUP BY comment_views.comment_id
  )${is_logged_in?`, user_liked_info AS (
    SELECT 
    comments.id id,
    true user_liked
    FROM comments 
    JOIN comment_likes
    ON comments.id=comment_likes.comment_id
    WHERE comments.${type_id}=$1 AND comment_likes.user_id=$2 AND comments.validated=true
  )`:``}, comment_comments AS (
    SELECT 
    count(id) comment_count,
    parent_comment_id id 
    FROM comments 
    WHERE comments.${type_id}=$1 AND parent_comment_id IS NOT NULL AND comments.validated=true
    GROUP BY comments.parent_comment_id
  )${search_type==="default"?`, query as (
    SELECT websearch_to_tsquery('english',$${query_var}) term 
  )`:``} SELECT 
    comments.id id,
    comments.${type_html} html,
    comments.date_created date_created,
    comments.comment_uuid comment_id,
    COALESCE(comment_likes_cte.comment_like_count,0) like_count,
    COALESCE(comment_viewed_info.comment_views_count,0) view_count,
    COALESCE(comment_comments.comment_count,0) comment_count,
    comments.path path,
    users.user_username username,
    users.profile_picture pp,
    comments.user_id user_id,
    ${search_type==="semantic"?`comment_embedding.embedding <-> $${query_var} cosine_similarity,`:``}
    ${is_logged_in?`user_liked_info.user_liked user_liked`:`false user_liked`},
    CASE WHEN comments.path IS NULL THEN 0 ELSE nlevel(comments.path) END level,
    comments.rating rating
    FROM comments 
    JOIN users 
    ON users.id=comments.user_id
    LEFT JOIN comment_likes_cte
    ON comments.id=comment_likes_cte.id
    LEFT JOIN comment_viewed_info
    ON comments.id=comment_viewed_info.id
    LEFT JOIN comment_comments 
    ON comments.id=comment_comments.id
    ${is_logged_in?`LEFT JOIN user_liked_info
    ON comments.id=user_liked_info.id`:``}
    ${search_type==="default"?`LEFT JOIN comment_search 
    ON comments.id=comment_search.comment_id`:`LEFT JOIN comment_embedding
    ON comments.id=comment_embedding.comment_id`}
    WHERE comments.${type_id}=$1 AND comments.validated=true
    ${Boolean(exclude)?`AND comments.id NOT IN (SELECT unnest($${exclude_var}::int[]) id)`:``}
    ${search_type==="default"?`AND (SELECT term FROM query) @@ comment_search.search`:``}
    ORDER BY ${order_by}
    LIMIT ${limit};`,arr] as [string,any[]];
}
export function getGetCommentQuery(obj:{ user_id?: number, id: number },type_html:string) {
  const is_logged_in = Boolean(Number.isInteger(obj.user_id));
    const query = `WITH comment_likes_cte AS (
  SELECT 
  count(comment_likes.user_id) comment_like_count, 
  comment_likes.comment_id id
  FROM comments 
  JOIN comment_likes
  ON comments.id=comment_likes.comment_id
  WHERE comments.id=$1 AND comments.validated=true
  GROUP BY comment_likes.comment_id
), comment_viewed_info AS (
  SELECT 
  count(comment_views.id) comment_views_count,
  comment_views.comment_id id 
  FROM comments 
  JOIN comment_views 
  ON comments.id=comment_views.comment_id AND comments.validated=true
  WHERE comments.id=$1
  GROUP BY comment_views.comment_id
)${is_logged_in?`, user_liked_info AS (
  SELECT 
  comments.id id,
  true user_liked
  FROM comments 
  JOIN comment_likes
  ON comments.id=comment_likes.comment_id
  WHERE comments.id=$1 AND comment_likes.user_id=$2 AND comments.validated=true
)`:`, user_liked_info AS (
  SELECT 
  $1 id,
  false user_liked 
)`}, comment_comments AS (
  SELECT 
  count(id) comment_count,
  parent_comment_id id 
  FROM comments 
  WHERE comments.id=$1 AND parent_comment_id IS NOT NULL AND comments.validated=true
  GROUP BY comments.parent_comment_id
) SELECT 
  comments.id id,
  comments.${type_html} html,
  comments.date_created date_created,
  comments.comment_uuid comment_id,
  COALESCE(comment_likes_cte.comment_like_count,0) like_count,
  COALESCE(comment_viewed_info.comment_views_count,0) view_count,
  COALESCE(comment_comments.comment_count,0) comment_count,
  comments.path path,
  users.user_username username,
  users.profile_picture pp,
  comments.user_id user_id,
  ${is_logged_in?`user_liked_info.user_liked user_liked`:`false user_liked`},
  COALESCE(nlevel(comments.path),0) level,
  comments.rating rating
  FROM comments 
  JOIN users 
  ON users.id=comments.user_id
  LEFT JOIN comment_likes_cte
  ON comments.id=comment_likes_cte.id
  LEFT JOIN comment_viewed_info
  ON comments.id=comment_viewed_info.id
  LEFT JOIN comment_comments 
  ON comments.id=comment_comments.id
  ${is_logged_in?`LEFT JOIN user_liked_info
  ON comments.id=user_liked_info.id`:``}
  WHERE comments.id=$1 AND comments.validated=true`;
    const arr:any[] = [obj.id];
    if (is_logged_in) arr.push(obj.user_id);
    return [query,arr] as [string,any[]];
}
export async function getDeepCommentsHelper(req:Request,obj:{ user_id?: number, id: number },type_html:string) {
  try {
    const exclude = [obj.id];
    const [query,arr] = getGetCommentQuery(obj,type_html);
    const original_comment_resp = await getDatabase().query(query,arr);
    if (!!!original_comment_resp.rows.length||original_comment_resp.rows.length!==1) {
      throw new Error("Something went wrong getting the original comment.");
    }
    const original_comment =  original_comment_resp.rows[0] as CommentResponseRow;
    if (!!!original_comment.path) {
      throw new Error("The original comment, when getting deep comments, should have a path.");
    }
    const path_arr = String(original_comment.path).split('.').map((i) => parseInt(i));
    const promiseArr:Promise<any>[] = [];
    const db = getDatabase();
    for (let id of path_arr) {
      const [quer,ar] = getGetCommentQuery({user_id: obj.user_id, id },type_html);
      promiseArr.push(db.query(quer,ar));
    }
    const comments = await Promise.all(promiseArr);
    var str_arr = '';
    for (let comment of comments) {
      if (comment.rows.length!==1) {
        throw new Error("Something went wrong getting one of the parents of the base comment.");
      }
      const comment_resp_row = comment.rows[0] as CommentResponseRow;
      exclude.push(comment_resp_row.id);
      const node = new CommentNode(comment_resp_row);
      str_arr += node.render(req)
    }
    const base_node = new CommentNode(original_comment);
    str_arr += base_node.render(req);
    return [str_arr,exclude] as [string,number[]];
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong getting deep comments.");
  }
}