/**
 * @file  file for generating sitemaps
 * @author Frank Brown <frankmbrown.net>
 * [REFERENCE](https://www.sitemaps.org/protocol.html)
 */

import BASE_URL from "../CONSTANTS/BASE_URL";
import { extractNumbersFromString } from "../utils/helper";
import { Request, Response } from 'express';
import getDatabase from "../database";
import * as TIME from '../utils/time';
import pathsPre from './paths';
import { redirect } from "../ROUTER/helper_functions/redirect-override";

const SUPPORTED_LANGUAGES:{code:string,name:string}[] = [];
type ChangeFreq = "always"|"hourly"|"daily"|"weekly"|"monthly"|"yearly"|"never";
const changeFreqSet = new Set(["always","hourly","daily","weekly","monthly","yearly","never"]);
export type Path = {path:string, lastmod: string, changefreq: ChangeFreq, priority: number};
const validPath = (p:Path) => Boolean(!!!p.path?.length || (p.path[0]==='/'&&p.path[p.path.length-1]!=='/'));
const validLastMod = (p: Path) => {
    const e = `Please enter a valid lastmod date for ${p.path} path. Date should be of format YYYY-MM-DD.`;
    const arr = p.lastmod.split('-');
    if (arr.length!==3)throw new Error(e)
    const numbers = extractNumbersFromString(p.lastmod);
    if (numbers.length!==3)throw new Error(e.concat(' (Format is invalid.)'));
    if (numbers[1]<1||numbers[1]>12) throw new Error(e.concat(' (Month is invalid.)'));
    if (numbers[2]<1||numbers[2]>31) throw new Error(e.concat(' (Day is invalid.)'));
}
const validPriority = (p: Path)=>{
    if (p.priority < 0) throw Error(`Priority must be greater than 0 for ${p.path} path.`);
    else if (p.priority>1) throw Error(`Priority must be less than 1 for ${p.path} path.`);
}
const validChangeFreq = (p:Path) => {
    if(!!!changeFreqSet.has(p.changefreq)) throw new Error(`Please enter a valid changefreq for path ${p.path}.`);
}

export default async function generateSitemap(req: Request, res: Response){
try {
  const paths:Path[] = pathsPre.map((s) => ({
    path: s.path,
    lastmod: s.lastmod,
    changefreq: 'monthly',
    priority: 0.5
  }))
  /**
   * Validate Paths
   */
  paths.forEach((path) => {
      validPath(path);
      validLastMod(path);
      validPriority(path);
      validChangeFreq(path);
  })
var str = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
  const db = getDatabase();
  const blogsQuery = /*sql*/`SELECT id, title, last_edited FROM blog WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
  const notesQuery = /*sql*/`SELECT id, title, last_edited FROM note WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
  const ideasQuery = /*sql*/`SELECT id, title, last_edited FROM idea WHERE active_v IS NOT NULL ORDER BY last_edited DESC;`;
  const markdownNotesQuery = /*sql*/`SELECT id, title, last_edited FROM markdown_notes WHERE published=true;`;
  const getJupyterNotebooksQuery = /*sql*/`SELECT id, title, date_created FROM jupyter_notebooks;`;
  const dailyReadingQuery = /*sql*/`SELECT id, topic_name, date_submitted FROM wikipedia WHERE submitted=true;`;
  const texNoteQuery = /*sql*/`SELECT id, date_completed, note_title FROM tex_notes WHERE published=true;`
  const goodReadsQuery = /*sql*/`SELECT id, last_edited, title FROM goodreads;`
  const letterboxdQuery = /*sql*/`SELECT id, last_edited, title FROM letterboxd;`
  const surveysQuery = /*sql*/`SELECT id, date_created AS last_edited, title FROM surveys;`
  const gamesQuery = /*sql*/`SELECT id, date_created AS last_edited, title FROM games;`
  const designsQuery = /*sql*/`SELECT id, date_created AS last_edited, title FROM designs_3d;`
  const usersQuery = /*sql*/`SELECT id, user_username AS username, user_date_created AS last_edited FROM users;`;
  const electronicsQuery = /*sql*/`SELECT id, title, last_edited FROM electronics_projects;`;

  const [blogs,notes,ideas,markdownNotes,notebooks,dailyReading,texNotes,goodreads,letterboxd,surveys,games,designs,users,electronics] = await Promise.all([
      db.query(blogsQuery),
      db.query(notesQuery),
      db.query(ideasQuery),
      db.query(markdownNotesQuery),
      db.query(getJupyterNotebooksQuery),
      db.query(dailyReadingQuery),
      db.query(texNoteQuery),
      db.query(goodReadsQuery),
      db.query(letterboxdQuery),
      db.query(surveysQuery),
      db.query(gamesQuery),
      db.query(designsQuery),
      db.query(usersQuery),
      db.query(electronicsQuery)
  ]);
  type DB_RESPONSE = { id: number, title: string, last_edited: string }[]
  if (blogs && blogs.rows.length) {
    (blogs.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/blog/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  } 
  if (notes && notes.rows.length) {
    (notes.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/note/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  } 
  if (ideas && ideas.rows.length) {
    (ideas.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/idea/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (markdownNotes&&markdownNotes.rows.length){
    (markdownNotes.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const pathStr = `/markdown-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
      const path = {
        path:pathStr,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      };
      const usePath = path.path as string;
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (notebooks&&notebooks.rows.length) {
    (notebooks.rows as {id: string, title: string, date_created: string}[]).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.date_created));
      const pathStr = `/jupyter-notebooks/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.title)}`;
      const path = {
        path:pathStr,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      };
      const usePath = path.path as string;
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (dailyReading&&dailyReading.rows.length) {
    (dailyReading.rows as {id: number, topic_name: string, date_submitted: string }[]).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.date_submitted));
      const pathStr = `/daily-reading/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.topic_name)}`;
      const path = {
        path:pathStr,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      };
      const usePath = path.path as string;
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (texNotes&&texNotes.rows.length) {
    (texNotes.rows as {id: number, note_title: string, date_completed: string}[]).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.date_completed));
      const pathStr = `/tex-notes/${encodeURIComponent(obj.id)}/${encodeURIComponent(obj.note_title)}`;
      const path = {
        path:pathStr,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      };
      const usePath = path.path as string;
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (goodreads&&goodreads.rows.length) {
    (goodreads.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/goodreads/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (letterboxd&&letterboxd.rows.length) {
    (letterboxd.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/letterboxd/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (surveys&&surveys.rows.length) {
    (surveys.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/surveys/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (games&&games.rows.length) {
    (games.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/games/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (designs&&designs.rows.length) {
    (designs.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/3d-designs/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (users && users.rows.length) {
    (users.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/users/${obj.id}/${encodeURIComponent((obj as any).username)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  if (electronics && electronics.rows.length) {
    (electronics.rows as DB_RESPONSE).forEach((obj) => {
      const lastmod = TIME.formatDateFromUnixTime('YYYY-MM-DD','America/Chicago',Number(obj.last_edited));
      const path = {
        path: `/electronics-robotics/${obj.id}/${encodeURIComponent(obj.title)}`,
        changefreq: 'monthly',
        priority: 0.5,
        lastmod
      }
      var usePath = path.path as string;
      if (path.path.endsWith('/')) {
          usePath = path.path.slice(path.path.length-1);
      }
      str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
      .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
      .concat('\r\t</url>\r');
    })
  }
  paths.forEach((path)=>{
    var usePath = path.path as string;
    if (path.path.endsWith('/')) {
        usePath = path.path.slice(path.path.length-1);
    }
    str+=`\r\t<url>\r\t\t<loc>${BASE_URL.concat(SUPPORTED_LANGUAGES.length>1?'/en':'').concat(usePath)}</loc>\r\t\t<lastmod>${path.lastmod}</lastmod>\r\t\t<changefreq>${path.changefreq}</changefreq>\r\t\t<priority>${path.priority}</priority>`
    .concat(SUPPORTED_LANGUAGES.length>1?SUPPORTED_LANGUAGES.filter((lang)=>lang.code!=='en').map((obj)=>`<xhtml:link rel="alternate" hreflang="${obj.code}" href="${BASE_URL.concat('/').concat(obj.code).concat(path.path)}" />`).join('\r\t\t'):'')
    .concat('\r\t</url>\r');
  });
  str+='</urlset>';
  res.setHeader('Content-Type','application/xml')
  return res.status(200).send(str);
} catch (error) {
    console.error(error);
    return redirect(req,res,'/404',404,{ severity: 'error', message: 'Something went wrong getting the requested page. '});
}
}
