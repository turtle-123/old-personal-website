/**
 * CREATE TABLE page_view (
	id bigserial PRIMARY KEY,
	path TEXT NOT NULL,
	ip_id integer NOT NULL references ip_info(id),
	user_id integer REFERENCES users(id),
	date_viewed bigint NOT NULL
);
 */
import { Router, Request, Response } from "express";
import { getRateLimit } from "../MIDDLEWARE/rateLimit";
import bodyParser from "body-parser";
import { handleCspViolation } from "./functions/analytics";
import getDatabase from "../database";
import { getUnixTime } from "../utils/time";
import multer from "multer";
import IS_DEVELOPMENT from "../CONSTANTS/IS_DEVELOPMENT";

const ANALYTICS_ROUTER = Router();

async function viewComments(req:Request,res:Response) {
  try {
    const comment_ids = JSON.parse(req.body['comment-ids']);
    const promise_arr:Promise<any>[] = [];
    const db = getDatabase();
    for (let id of comment_ids) {
      const user_id = req.session.auth?.userID||null;
      const ip_id = req.session.ip_id;
      if (Number.isInteger(id)&&Number.isInteger(ip_id)) {
        promise_arr.push(db.query(`INSERT INTO comment_views (comment_id,user_id,ip_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT comment_views_comment_id_user_id_ip_id_key DO NOTHING;`,[id,user_id,ip_id]));
      }
    }
    await Promise.all(promise_arr);
    return res.status(200).send(''); 
  } catch (error) {
    return res.status(200).send('');
  }
}

async function viewAnnotations(req:Request,res:Response) {
  try {
    const annotation_ids = JSON.parse(req.body['annotation-ids']);
    const promise_arr:Promise<any>[] = [];
    const db = getDatabase();
    for (let id of annotation_ids) {
      const user_id = req.session.auth?.userID||null;
      const ip_id = req.session.ip_id;
      if (Number.isInteger(id)&&Number.isInteger(ip_id)) {
        promise_arr.push(db.query(`INSERT INTO annotation_views (annotation_id,user_id,ip_id) VALUES ($1,$2,$3) ON CONFLICT ON CONSTRAINT annotation_views_annotation_id_user_id_ip_id_key DO NOTHING;`,[id,user_id,ip_id]));
      }
    }
    await Promise.all(promise_arr);
    return res.status(200).send(''); 
  } catch (error) {
    return res.status(200).send('');
  }
}

async function pageView(req:Request,res:Response) {
  try {
    if (IS_DEVELOPMENT) {
      return res.status(200).send('');
    }
    const path = req.body['path'];
    const ip_id = req.session.ip_id;
    const user_id = req.session.auth?.userID||null;
    const date_viewed = getUnixTime();
    await getDatabase().query('INSERT INTO page_view (path,ip_id,user_id,date_viewed) VALUES ($1,$2,$3,$4);',[path,ip_id,user_id,date_viewed]);
    return res.status(200).send('');
  } catch (e) {
    console.error(e);
    return res.status(400).send('');
  }
}
const formDataMiddleWare = multer().any();

/**
 * [Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)
 * 
 */
ANALYTICS_ROUTER.post('/csp-violation/?',getRateLimit(60000,500),bodyParser.json(),handleCspViolation);
ANALYTICS_ROUTER.post('/view-comments',getRateLimit(60000,500),formDataMiddleWare,viewComments)
ANALYTICS_ROUTER.post('/view-annotations',getRateLimit(60000,500),formDataMiddleWare,viewAnnotations);
ANALYTICS_ROUTER.post('/page-view',getRateLimit(60000,500),formDataMiddleWare,pageView);

export default ANALYTICS_ROUTER;