import escapeHTML from "escape-html";
import getDatabase from "../../../database";
import * as TIME from '../../../utils/time';
import BASE_PATH from "../../../CONSTANTS/BASE_PATH";
import type { Request } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import ejs from 'ejs';

const individualAnnotation = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','individual-annotation-user-activity.ejs'),{encoding:'utf-8'});
const individualComment = fs.readFileSync(path.resolve(BASE_PATH,'views','partials','individual-comment-user-activity.ejs'),{encoding:'utf-8'});

function getLinkFromRow(row:any) {
  if (row.note_id) {
    return { url: `/note/${encodeURIComponent(row.note_id)}/${encodeURIComponent(row.title)}`, type: "Note" };
  }
  if (row.blog_id) {
    return { url: `/blog/${encodeURIComponent(row.blog_id)}/${encodeURIComponent(row.title)}`, type: "Blog" };
  }
  if (row.idea_id) {
    return  { url: `/idea/${encodeURIComponent(row.idea_id)}/${encodeURIComponent(row.title)}`, type: "Idea" };
  }
  if (row.wikipedia_id) {
    return  { url: `/daily-reading/${encodeURIComponent(row.wikipedia_id)}/${encodeURIComponent(row.title)}`, type: "Daly Reading" };
  }
  if (row.tex_notes_id) {
    return  { url: `/tex-notes/${encodeURIComponent(row.tex_notes_id)}/${encodeURIComponent(row.title)}`, type: "Tex Note" };
  }
  if (row.jupyter_notebooks_id) {
    return  { url: `/jupyter-notebooks/${encodeURIComponent(row.jupyter_notebooks_id)}/${encodeURIComponent(row.title)}`, type: "Jupyter Notebook" };
  }
  if (row.markdown_notes_id) {
    return  { url: `/markdown-notes/${encodeURIComponent(row.markdown_notes_id)}/${encodeURIComponent(row.title)}`, type: "Markdown Note" };
  }
  if (row.goodreads_id) {
    return  { url: `/goodreads/${encodeURIComponent(row.goodreads_id)}/${encodeURIComponent(row.title)}`, type: "Goodreads" };
  }
  if (row.letterboxd_id) {
    return  { url: `/letterboxd/${encodeURIComponent(row.letterboxd_id)}/${encodeURIComponent(row.title)}`, type: "Letterboxd" };
  }
  if (row.survey_id) {
    return  { url: `/surveys/${encodeURIComponent(row.survey_id)}/${encodeURIComponent(row.title)}`, type: "Survey" };
  }
  if (row.game_id) {
    return  { url: `/games/${encodeURIComponent(row.game_id)}/${encodeURIComponent(row.title)}`, type: "Game" };
  }
  if (row.design_id) {
    return  { url: `/3d-designs/${encodeURIComponent(row.design_id)}/${encodeURIComponent(row.title)}`, type: "3D Design" };
  }
  if (row.electronics_id) {
    return {url: `/electronics-robotics/${encodeURIComponent(row.electronics_id)}/${encodeURIComponent(row.title)}`, type: "Electronics & Robotics" }
  }
  throw new Error("Something went wrong getting the href for the user action.");
}
function getRandomHexColor() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16);
  return `#${hex.padStart(6, '0')}`;
}

export async function getUserInformation(req:Request,user_id:number) {
  var comments = '<p class="h4 bold mt-2 text-align-center t-warning">The user has not commented on anything.<p>';
  var annotations = '<p class="h4 bold mt-2 text-align-center t-warning">The user has not annotated anything.<p>';
  var likes = '<p class="h4 bold mt-2 text-align-center t-warning">The user has not liked anything.<p>';
  var upvotes = '<p class="h4 bold mt-2 text-align-center t-warning">The user has not upvoted anything.<p>';
  var downvotes = '<p class="h4 bold mt-2 text-align-center t-warning">The user has not downvoted anything.<p>';
  var type_html = 'mobile_html';
  if (req.session.device?.desktop) type_html = 'desktop_html';
  else if (req.session.device?.tablet) type_html = 'tablet_html';

  try {
    const db = getDatabase();

    const comments_query = `WITH comment_likes_cte AS (
    SELECT 
    count(comment_likes.user_id) comment_like_count, 
    comment_likes.comment_id id
    FROM comments 
    JOIN comment_likes
    ON comments.id=comment_likes.comment_id
    WHERE comments.user_id=$1 AND comments.validated=true
    GROUP BY comment_likes.comment_id
  ), comment_viewed_info AS (
    SELECT 
    count(comment_views.id) comment_views_count,
    comment_views.comment_id id 
    FROM comments 
    JOIN comment_views 
    ON comments.id=comment_views.comment_id AND comments.validated=true
    WHERE comments.user_id=$1
    GROUP BY comment_views.comment_id
  ), comment_comments AS (
    SELECT 
    count(id) comment_count,
    parent_comment_id id 
    FROM comments 
    WHERE comments.user_id=$1 AND parent_comment_id IS NOT NULL AND comments.validated=true
    GROUP BY comments.parent_comment_id
  ) SELECT 
   comments.id id,
  comments.${type_html} html,
  comments.date_created date_created,
  comments.comment_uuid comment_id,
  comments.user_id AS user_id, 
  comments.date_created AS date_created, 
  comments.note_id, 
  comments.blog_id, 
  comments.idea_id, 
  comments.wikipedia_id, 
  comments.tex_notes_id, 
  comments.jupyter_notebooks_id, 
  comments.markdown_notes_id, 
  comments.goodreads_id, 
  comments.letterboxd_id, 
  comments.game_id, 
  comments.design_id,
  comments.electronics_id,
  COALESCE(note.title,blog.title,idea.title,wikipedia.topic_name,tex_notes.note_title,jupyter_notebooks.title,markdown_notes.title,goodreads.title,letterboxd.title,games.title,designs_3d.title,electronics_projects.title) AS title,
  COALESCE(note.description,blog.description,idea.description,wikipedia.what_interested_you,tex_notes.note_description,jupyter_notebooks.description,markdown_notes.description,goodreads.description,letterboxd.description,games.description,designs_3d.description,electronics_projects.description) AS description,
  COALESCE(note.image,blog.image,idea.image,wikipedia.topic_image,tex_notes.note_image,jupyter_notebooks.image_url,markdown_notes.image_url,goodreads.image,letterboxd.image,games.image,designs_3d.image,electronics_projects.image) AS image,
  COALESCE(comment_likes_cte.comment_like_count,0) like_count,
  COALESCE(comment_viewed_info.comment_views_count,0) view_count,
  COALESCE(comment_comments.comment_count,0) comment_count,
  users.user_username username,
  users.profile_picture pp,
  comments.rating rating
  FROM comments 
  JOIN users ON comments.user_id=users.id
  LEFT JOIN comment_likes_cte ON comments.id=comment_likes_cte.id
  LEFT JOIN comment_viewed_info ON comments.id=comment_viewed_info.id
  LEFT JOIN comment_comments ON comments.id=comment_comments.id
  LEFT JOIN note ON comments.note_id=note.id 
  LEFT JOIN blog ON comments.blog_id=blog.id 
  LEFT JOIN idea ON comments.idea_id=idea.id 
  LEFT JOIN wikipedia ON comments.wikipedia_id=wikipedia.id 
  LEFT JOIN tex_notes ON comments.tex_notes_id=tex_notes.id 
  LEFT JOIN jupyter_notebooks ON comments.jupyter_notebooks_id=jupyter_notebooks.id 
  LEFT JOIN markdown_notes ON comments.markdown_notes_id=markdown_notes.id 
  LEFT JOIN goodreads ON comments.goodreads_id=goodreads.id 
  LEFT JOIN letterboxd ON comments.letterboxd_id=letterboxd.id 
  LEFT JOIN games ON comments.game_id=games.id 
  LEFT JOIN designs_3d ON comments.design_id=designs_3d.id 
  LEFT JOIN electronics_projects ON comments.electronics_id=electronics_projects.id
  WHERE comments.user_id=$1 AND annotation_id IS NULL 
  ORDER BY comments.date_created DESC
  LIMIT 50;`
    const annotations_query = `WITH annotation_vote_counts AS (
	SELECT 
	annotations.id annotation_id,
	count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count,
	count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
	WHERE annotations.user_id=$1
	GROUP BY annotations.id
), annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  WHERE annotations.user_id=$1
	GROUP BY annotation_views.annotation_id
), annotation_comments_count AS (
  SELECT 
  count(annotation_comments.id) AS comment_count, 
  annotations.id annotation_id 
  FROM annotations 
  JOIN annotation_comments 
  ON annotations.id=annotation_comments.annotation_id
  WHERE annotations.user_id=$1
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
COALESCE(annotation_view_counts.view_count,0) view_count,
COALESCE(annotation_comments_count.comment_count,0) comment_count,
annotations.note_id, 
annotations.blog_id, 
annotations.idea_id, 
annotations.wikipedia_id, 
annotations.goodreads_id, 
annotations.letterboxd_id, 
annotations.survey_id, 
annotations.game_id, 
annotations.design_id,
annotations.electronics_id,
COALESCE(note.title,blog.title,idea.title,wikipedia.topic_name,goodreads.title,letterboxd.title,surveys.title,games.title,designs_3d.title,electronics_projects.title) AS title,
COALESCE(note.description,blog.description,idea.description,wikipedia.what_interested_you,goodreads.description,letterboxd.description,surveys.description_text,games.description,designs_3d.description,electronics_projects.description) AS description,
COALESCE(note.image,blog.image,idea.image,wikipedia.topic_image,goodreads.image,letterboxd.image,surveys.image,games.image,designs_3d.image,electronics_projects.image) AS image
FROM annotations
JOIN users
ON annotations.user_id=users.id
LEFT JOIN note ON annotations.note_id=note.id 
LEFT JOIN blog ON annotations.blog_id=blog.id 
LEFT JOIN idea ON annotations.idea_id=idea.id 
LEFT JOIN wikipedia ON annotations.wikipedia_id=wikipedia.id 
LEFT JOIN goodreads ON annotations.goodreads_id=goodreads.id 
LEFT JOIN letterboxd ON annotations.letterboxd_id=letterboxd.id 
LEFT JOIN surveys ON annotations.survey_id=surveys.id 
LEFT JOIN games ON annotations.game_id=games.id 
LEFT JOIN designs_3d ON annotations.design_id=designs_3d.id 
LEFT JOIN electronics_projects ON annotations.electronics_id=electronics_projects.id
LEFT JOIN annotation_vote_counts
ON annotations.id=annotation_vote_counts.annotation_id
LEFT JOIN annotation_view_counts
ON annotations.id=annotation_view_counts.id
LEFT JOIN annotation_comments_count 
ON annotations.id=annotation_comments_count.annotation_id
WHERE annotations.user_id=$1
ORDER BY 
annotations.date_created DESC
LIMIT 50;`;
    const likes_query = `SELECT 
  article_likes.note_id, 
  article_likes.blog_id, 
  article_likes.idea_id, 
  article_likes.wikipedia_id, 
  article_likes.tex_notes_id, 
  article_likes.jupyter_notebooks_id, 
  article_likes.markdown_notes_id, 
  article_likes.goodreads_id, 
  article_likes.letterboxd_id, 
  article_likes.survey_id, 
  article_likes.game_id, 
  article_likes.design_id,
  article_likes.electronics_id,
  article_likes.date_liked, 
  COALESCE(note.title,blog.title,idea.title,wikipedia.topic_name,tex_notes.note_title,jupyter_notebooks.title,markdown_notes.title,goodreads.title,letterboxd.title,surveys.title,games.title,designs_3d.title,electronics_projects.title) AS title,
  COALESCE(note.description,blog.description,idea.description,wikipedia.what_interested_you,tex_notes.note_description,jupyter_notebooks.description,markdown_notes.description,goodreads.description,letterboxd.description,surveys.description_text,games.description,designs_3d.description,electronics_projects.description) AS description,
  COALESCE(note.image,blog.image,idea.image,wikipedia.topic_image,tex_notes.note_image,jupyter_notebooks.image_url,markdown_notes.image_url,goodreads.image,letterboxd.image,surveys.image,games.image,designs_3d.image,electronics_projects.image) AS image
  FROM article_likes
  LEFT JOIN note ON article_likes.note_id=note.id 
  LEFT JOIN blog ON article_likes.blog_id=blog.id 
  LEFT JOIN idea ON article_likes.idea_id=idea.id 
  LEFT JOIN wikipedia ON article_likes.wikipedia_id=wikipedia.id 
  LEFT JOIN tex_notes ON article_likes.tex_notes_id=tex_notes.id 
  LEFT JOIN jupyter_notebooks ON article_likes.jupyter_notebooks_id=jupyter_notebooks.id 
  LEFT JOIN markdown_notes ON article_likes.markdown_notes_id=markdown_notes.id 
  LEFT JOIN goodreads ON article_likes.goodreads_id=goodreads.id 
  LEFT JOIN letterboxd ON article_likes.letterboxd_id=letterboxd.id 
  LEFT JOIN surveys ON article_likes.survey_id=surveys.id 
  LEFT JOIN games ON article_likes.game_id=games.id 
  LEFT JOIN designs_3d ON article_likes.design_id=designs_3d.id 
  LEFT JOIN electronics_projects ON article_likes.electronics_id=electronics_projects.id
  WHERE article_likes.user_id=$1
  ORDER BY article_likes.date_liked DESC
  LIMIT 50;`;
    const upvotes_query = `WITH user_voted AS (
  SELECT annotation_id AS id FROM annotation_votes WHERE annotation_votes.upvote=true AND annotation_votes.user_id=$1
), annotation_vote_counts AS (
	SELECT 
	annotations.id annotation_id,
	count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count,
	count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
  JOIN user_voted
  ON user_voted.id=annotations.id
	GROUP BY annotations.id
), annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  JOIN user_voted
  ON user_voted.id=annotations.id
	GROUP BY annotation_views.annotation_id
), annotation_comments_count AS (
  SELECT 
  count(annotation_comments.id) AS comment_count, 
  annotations.id annotation_id 
  FROM annotations 
  JOIN annotation_comments 
  ON annotations.id=annotation_comments.annotation_id
  JOIN user_voted
  ON user_voted.id=annotations.id
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
COALESCE(annotation_view_counts.view_count,0) view_count,
COALESCE(annotation_comments_count.comment_count,0) comment_count,
annotations.note_id, 
annotations.blog_id, 
annotations.idea_id, 
annotations.wikipedia_id, 
annotations.goodreads_id, 
annotations.letterboxd_id, 
annotations.survey_id, 
annotations.game_id, 
annotations.design_id,
annotations.electronics_id,
COALESCE(note.title,blog.title,idea.title,wikipedia.topic_name,goodreads.title,letterboxd.title,surveys.title,games.title,designs_3d.title,electronics_projects.title) AS title,
COALESCE(note.description,blog.description,idea.description,wikipedia.what_interested_you,goodreads.description,letterboxd.description,surveys.description_text,games.description,designs_3d.description,electronics_projects.description) AS description,
COALESCE(note.image,blog.image,idea.image,wikipedia.topic_image,goodreads.image,letterboxd.image,surveys.image,games.image,designs_3d.image,electronics_projects.image) AS image
FROM annotations
JOIN users
ON annotations.user_id=users.id
JOIN user_voted
ON user_voted.id=annotations.id
LEFT JOIN note ON annotations.note_id=note.id 
LEFT JOIN blog ON annotations.blog_id=blog.id 
LEFT JOIN idea ON annotations.idea_id=idea.id 
LEFT JOIN wikipedia ON annotations.wikipedia_id=wikipedia.id 
LEFT JOIN goodreads ON annotations.goodreads_id=goodreads.id 
LEFT JOIN letterboxd ON annotations.letterboxd_id=letterboxd.id 
LEFT JOIN surveys ON annotations.survey_id=surveys.id 
LEFT JOIN games ON annotations.game_id=games.id 
LEFT JOIN designs_3d ON annotations.design_id=designs_3d.id 
LEFT JOIN electronics_projects ON annotations.electronics_id=electronics_projects.id
LEFT JOIN annotation_vote_counts
ON annotations.id=annotation_vote_counts.annotation_id
LEFT JOIN annotation_view_counts
ON annotations.id=annotation_view_counts.id
LEFT JOIN annotation_comments_count 
ON annotations.id=annotation_comments_count.annotation_id
ORDER BY 
annotations.date_created DESC
LIMIT 50;`;
    const downvotes_query = `WITH user_voted AS (
  SELECT annotation_id AS id FROM annotation_votes WHERE annotation_votes.downvote=true AND annotation_votes.user_id=$1
), annotation_vote_counts AS (
	SELECT 
	annotations.id annotation_id,
	count(CASE WHEN upvote THEN 1 ELSE NULL END) upvote_count,
	count(CASE WHEN downvote THEN 1 ELSE NULL END) downvote_count
	FROM annotations 
	JOIN annotation_votes 
	ON annotation_votes.annotation_id=annotations.id 
  JOIN user_voted
  ON user_voted.id=annotations.id
	GROUP BY annotations.id
), annotation_view_counts AS (
  SELECT 
  COUNT(annotation_views.id) view_count,
  annotation_views.annotation_id id 
  FROM annotation_views 
  JOIN annotations 
  ON annotations.id=annotation_views.annotation_id 
  JOIN user_voted
  ON user_voted.id=annotations.id
	GROUP BY annotation_views.annotation_id
), annotation_comments_count AS (
  SELECT 
  count(annotation_comments.id) AS comment_count, 
  annotations.id annotation_id 
  FROM annotations 
  JOIN annotation_comments 
  ON annotations.id=annotation_comments.annotation_id
  JOIN user_voted
  ON user_voted.id=annotations.id
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
COALESCE(annotation_view_counts.view_count,0) view_count,
COALESCE(annotation_comments_count.comment_count,0) comment_count,
annotations.note_id, 
annotations.blog_id, 
annotations.idea_id, 
annotations.wikipedia_id, 
annotations.goodreads_id, 
annotations.letterboxd_id, 
annotations.survey_id, 
annotations.game_id, 
annotations.design_id,
annotations.electronics_id,
COALESCE(note.title,blog.title,idea.title,wikipedia.topic_name,goodreads.title,letterboxd.title,surveys.title,games.title,designs_3d.title,electronics_projects.title) AS title,
COALESCE(note.description,blog.description,idea.description,wikipedia.what_interested_you,goodreads.description,letterboxd.description,surveys.description_text,games.description,designs_3d.description,electronics_projects.description) AS description,
COALESCE(note.image,blog.image,idea.image,wikipedia.topic_image,goodreads.image,letterboxd.image,surveys.image,games.image,designs_3d.image,electronics_projects.image) AS image
FROM annotations
JOIN users
ON annotations.user_id=users.id
JOIN user_voted
ON user_voted.id=annotations.id
LEFT JOIN note ON annotations.note_id=note.id 
LEFT JOIN blog ON annotations.blog_id=blog.id 
LEFT JOIN idea ON annotations.idea_id=idea.id 
LEFT JOIN wikipedia ON annotations.wikipedia_id=wikipedia.id 
LEFT JOIN goodreads ON annotations.goodreads_id=goodreads.id 
LEFT JOIN letterboxd ON annotations.letterboxd_id=letterboxd.id 
LEFT JOIN surveys ON annotations.survey_id=surveys.id 
LEFT JOIN games ON annotations.game_id=games.id 
LEFT JOIN designs_3d ON annotations.design_id=designs_3d.id 
LEFT JOIN electronics_projects ON annotations.electronics_id=electronics_projects.id
LEFT JOIN annotation_vote_counts
ON annotations.id=annotation_vote_counts.annotation_id
LEFT JOIN annotation_view_counts
ON annotations.id=annotation_view_counts.id
LEFT JOIN annotation_comments_count 
ON annotations.id=annotation_comments_count.annotation_id 
ORDER BY 
annotations.date_created DESC
LIMIT 50;`;
    const [likesResp,commentsResp,annotationsResp,upvotesResp,downvotesResp] = await Promise.all([
      db.query(likes_query,[user_id]),
      db.query(comments_query,[user_id]),
      db.query(annotations_query,[user_id]),
      db.query(upvotes_query,[user_id]),
      db.query(downvotes_query,[user_id])
    ]);
    const [likesRows,commentsRows,annotationsRows,upvotesRows,downvotesRows] = [likesResp.rows,commentsResp.rows,annotationsResp.rows,upvotesResp.rows,downvotesResp.rows];
    const tz = req.session.settings?.timezone||'America/New_York';
    if (likesRows.length) {
      likes = likesRows.map((obj) => {
        const {url, type:articleType } = getLinkFromRow(obj);
        const { title, description, image, date_liked } = obj;
        const image_width = 150;
        const image_height = 75;
        const datimetime = TIME.getDateTimeStringFromUnix(Number(date_liked),true);
        const format = TIME.formatDateFromUnixTime('MM/DD/YYYY',tz,Number(date_liked));
        const date_created_str = `<time data-popover="" data-pelem="#date-created-tool" data-mouse="" data-date-format="MM/DD/YYYY" class="small" datetime="${datimetime}"> <svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="CalendarToday"> <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"> </path> </svg> <span>${format}</span></time>`
        

        return `<a hx-push-url="true" class="preview-article" href="${url}" hx-get="${url}" hx-target="#PAGE" hx-indicator="#page-transition-progress">
  <div style="background-color: black; flex-shrink: 0;" class="flex-row justify-center align-center">
    <img src="${String(image)}" alt="${escapeHTML(title)}" style="width:${image_width}px;height:${image_height}px; margin:0px; object-fit:contain; background-color:black;align-self: center;" width="${image_width}" height="${image_height}" />
  </div>
  <div class="p-md flex-column justify-start align-start grow-1" style="min-width: 0px;">
  <p class="h5 bold w-100">
  ${escapeHTML(title)}
  </p>
  <p class="body2 mt-1 w-100">
      ${description.length>150?escapeHTML(description).concat('...'):escapeHTML(description)}
  </p>
  <div class="flex-row justify-between align-center">
        <span class="flex-row gap-2 align-center">
          <span class="caption bold">Content:</span>
          <span class="caption">${escapeHTML(articleType)}</span>
          </span>
        <span class="flex-row gap-2 align-center" data-pelem="#liked-tool" data-mouse data-popover>
          ${date_created_str}
        </span>
  </div>
  </div>
</a>`}).join('');
    }
    if (commentsRows.length) {
      comments = commentsRows.map((obj) => {
        const {url, type:articleType } = getLinkFromRow(obj);
        const time_ago = TIME.getTimeAgoString(Number(obj.date_created)); 
        const randomColor = getRandomHexColor();
        const svg_style = `style="fill: ${randomColor}; color: ${randomColor};"`;
        return ejs.render(individualComment,{ ...obj, url: url.concat('#comments'), articleType, time_ago, svg_style });
      }).join('');
    }
    if (annotationsRows.length) {
      annotations = annotationsRows.map((obj) => {
        const {url, type:articleType } = getLinkFromRow(obj);
        const vote_count = Number(obj.upvote_count) - Number(obj.downvote_count);
        const time_ago = TIME.getTimeAgoString(Number(obj.date_created)); 
        const randomColor = getRandomHexColor();
        const svg_style = `style="fill: ${randomColor}; color: ${randomColor};"`;
        return ejs.render(individualAnnotation,{ ...obj, url: url.concat('?show-annotations=on&search-comments=&comment-search-type=default&comment-sort-by=best&search-annotations=&annotation-search-type=default'), articleType, time_ago, vote_count, svg_style });
      }).join('');
    }
    if (upvotesRows.length) {
      upvotes = upvotesRows.map((obj) => {
        const {url, type:articleType } = getLinkFromRow(obj);
        const vote_count = Number(obj.upvote_count) - Number(obj.downvote_count);
        const time_ago = TIME.getTimeAgoString(Number(obj.date_created)); 
        const randomColor = getRandomHexColor();
        const svg_style = `style="fill: ${randomColor}; color: ${randomColor};"`;
        return ejs.render(individualAnnotation,{ ...obj, url: url.concat('?show-annotations=on&search-comments=&comment-search-type=default&comment-sort-by=best&search-annotations=&annotation-search-type=default'), articleType, time_ago, vote_count, svg_style });
      }).join('');
    } 
    if (downvotesRows.length) {
      downvotes = downvotesRows.map((obj) => {
        const {url, type:articleType } = getLinkFromRow(obj);
        const vote_count = Number(obj.upvote_count) - Number(obj.downvote_count);
        const time_ago = TIME.getTimeAgoString(Number(obj.date_created)); 
        const randomColor = getRandomHexColor();
        const svg_style = `style="fill: ${randomColor}; color: ${randomColor};"`;
        return ejs.render(individualAnnotation,{ ...obj, url: url.concat('?show-annotations=on&search-comments=&comment-search-type=default&comment-sort-by=best&search-annotations=&annotation-search-type=default'), articleType, time_ago, vote_count, svg_style });
      }).join('');
    }
    return {
      comments,
      annotations,
      likes,
      upvotes,
      downvotes
    }
  } catch (e) {
    console.error(e);
    comments = '<p class="h4 bold mt-2 text-align-center t-error">Something went wrong getting the user\'s activity.<p>';
    annotations = '<p class="h4 bold mt-2 text-align-center t-error">Something went wrong getting the user\'s activity.<p>';
    likes = '<p class="h4 bold mt-2 text-align-center t-error">Something went wrong getting the user\'s activity.<p>';
    upvotes = '<p class="h4 bold mt-2 text-align-center t-error">Something went wrong getting the user\'s activity.<p>';
    downvotes = '<p class="h4 bold mt-2 text-align-center t-error">Something went wrong getting the user\'s activity.<p>';
    return {
      comments,
      annotations,
      likes,
      upvotes,
      downvotes
    }
  }
}

