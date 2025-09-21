"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAnnotationsQueryAndArray = exports.getGetAnnotationsQueryAndArray = void 0;
const pg_1 = require("pgvector/pg");
const ai_1 = require("../../../ai");
function getGetAnnotationsQueryAndArray(obj, sort_by, limit = 100, exclude) {
    const { type_id, id } = obj;
    const arr = [id];
    var exclude_var = 2;
    if (Number.isInteger(obj.user_id)) {
        arr.push(obj.user_id);
        exclude_var += 1;
    }
    if (Boolean(exclude)) {
        arr.push(exclude);
    }
    var order_by = '';
    if (sort_by === "new") {
        order_by = "annotations.date_created DESC";
    }
    else {
        order_by = "annotations.rating DESC";
    }
    const query = `WITH annotation_vote_counts AS (
	SELECT 
	annotations.id annotation_id,
	count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count,
	count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.${type_id}=$1
	GROUP BY annotations.id
),${Number.isInteger(obj.user_id) ? ` user_annotation AS (
	SELECT 
	annotation_votes.upvote upvote,
	annotation_votes.downvote downvote,
	annotations.id annotation_id 
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.${type_id}=$1 AND annotation_votes.user_id=$2
),` : ``} annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  WHERE annotations.${type_id}=$1
	GROUP BY annotation_views.annotation_id
), annotation_comments_count AS (
  SELECT 
  count(annotation_comments.id) AS comment_count, 
  annotations.id annotation_id 
  FROM annotations 
  JOIN annotation_comments 
  ON annotations.id=annotation_comments.annotation_id
  WHERE annotations.${type_id}=$1
  GROUP BY annotations.id
) SELECT 
annotations.id id,
annotations.user_id user_id,
users.user_username username, 
users.profile_picture profile_picture, 
annotations.html html,
annotations.date_created date_created,
annotations.rating rating,
COALESCE(annotation_vote_counts.upvote_count,0) upvote_count,
COALESCE(annotation_vote_counts.downvote_count,0) downvote_count,
${Number.isInteger(obj.user_id) ? `COALESCE(user_annotation.upvote,false)` : `false`} user_upvote,
${Number.isInteger(obj.user_id) ? `COALESCE(user_annotation.downvote,false)` : `false`} user_downvote,
COALESCE(annotation_view_counts.view_count,0) view_count,
COALESCE(annotation_comments_count.comment_count,0) comment_count
FROM annotations
JOIN users
ON annotations.user_id=users.id
LEFT JOIN annotation_vote_counts
ON annotations.id=annotation_vote_counts.annotation_id
${Number.isInteger(obj.user_id) ? `LEFT JOIN user_annotation
ON annotations.id=user_annotation.annotation_id` : ``}
LEFT JOIN annotation_view_counts
ON annotations.id=annotation_view_counts.id
LEFT JOIN annotation_comments_count 
ON annotations.id=annotation_comments_count.annotation_id
WHERE annotations.${type_id}=$1
${Boolean(exclude) ? `AND annotations.id NOT IN (SELECT unnest($${exclude_var}::int[]) id)` : ``}
ORDER BY 
${order_by}
LIMIT ${limit};`;
    return [query, arr];
}
exports.getGetAnnotationsQueryAndArray = getGetAnnotationsQueryAndArray;
async function searchAnnotationsQueryAndArray(obj, sort_by, search_term, search_type, limit = 100, exclude) {
    const { type_id, id } = obj;
    var query_var = 2;
    var exclude_var = 3;
    if (Number.isInteger(obj.user_id)) {
        query_var += 1;
        exclude_var += 1;
    }
    const arr = [obj.id];
    if (obj.user_id)
        arr.push(obj.user_id);
    if (search_type === "semantic") {
        const embedding = await (0, ai_1.createEmbedding)(search_term);
        arr.push((0, pg_1.toSql)(embedding));
    }
    else {
        arr.push(search_term);
    }
    if (exclude)
        arr.push(exclude);
    var order_by = '';
    if (search_type === "semantic") {
        order_by += `cosine_similarity DESC, `;
    }
    if (sort_by === "new") {
        order_by += 'annotations.date_created DESC';
    }
    else {
        order_by += 'annotations.rating DESC';
    }
    const query = `WITH annotation_vote_counts AS (
	SELECT 
	annotations.id annotation_id,
	count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count,
	count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.${type_id}=$1
	GROUP BY annotations.id
),${Number.isInteger(obj.user_id) ? ` user_annotation AS (
	SELECT 
	annotation_votes.upvote upvote,
	annotation_votes.downvote downvote,
	annotations.id annotation_id 
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.${type_id}=$1 AND annotation_votes.user_id=$2
),` : ``}${search_type === "default" ? ` query AS (
  SELECT websearch_to_tsquery('english',$${query_var}) term 
),` : ``} annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  WHERE annotations.${type_id}=$1
	GROUP BY annotation_views.annotation_id
), annotation_comments_count AS (
  SELECT 
  count(annotation_comments.id) AS comment_count, 
  annotations.id annotation_id 
  FROM annotations 
  JOIN annotation_comments 
  ON annotations.id=annotation_comments.annotation_id
  WHERE annotations.${type_id}=$1
  GROUP BY annotations.id
) SELECT 
annotations.id id,
annotations.user_id user_id,
users.user_username username, 
users.profile_picture profile_picture, 
annotations.html html,
annotations.date_created date_created,
annotations.rating rating,
COALESCE(annotation_vote_counts.upvote_count,0) upvote_count,
COALESCE(annotation_comments_count.comment_count,0) comment_count,
${search_type === "semantic" ? `annotation_embedding.embedding <-> $${query_var} cosine_similarity,` : ``}
COALESCE(annotation_vote_counts.downvote_count,0) downvote_count,
${Number.isInteger(obj.user_id) ? `COALESCE(user_annotation.upvote,false)` : `false`} user_upvote,
${Number.isInteger(obj.user_id) ? `COALESCE(user_annotation.downvote,false)` : `false`} user_downvote,
COALESCE(annotation_view_counts.view_count,0) view_count
FROM annotations
JOIN users
ON annotations.user_id=users.id
LEFT JOIN annotation_vote_counts
ON annotations.id=annotation_vote_counts.annotation_id
${Number.isInteger(obj.user_id) ? `LEFT JOIN user_annotation
ON annotations.id=user_annotation.annotation_id` : ``}
LEFT JOIN annotation_view_counts
ON annotations.id=annotation_view_counts.id
LEFT JOIN annotation_comments_count 
ON annotations.id=annotation_comments_count.annotation_id
${search_type === "default" ? `LEFT JOIN annotation_search 
ON annotations.id=annotation_search.annotation_id` : `LEFT JOIN annotation_embedding 
ON annotations.id=annotation_embedding.annotation_id`}
WHERE annotations.${type_id}=$1
${search_type === "default" ? `AND (SELECT term FROM query) @@ annotation_search.search` : ``}
${Boolean(exclude) ? `AND annotations.id NOT IN (SELECT unnest($${exclude_var}::int[]) id)` : ``}
ORDER BY 
${order_by}
LIMIT ${limit};`;
    return [query, arr];
}
exports.searchAnnotationsQueryAndArray = searchAnnotationsQueryAndArray;
