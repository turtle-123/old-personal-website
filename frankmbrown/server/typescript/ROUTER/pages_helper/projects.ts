import { Request, Response } from "express";
import { getRequiredVariables } from '../helper_functions/frontendHelper';
import type { Breadcrumbs, SEO, TableOfContentsItem } from '../../types';
import { redirect } from "../helper_functions/redirect-override";
import getDatabase from "../../database";
import {  
  getArticleBuilder3RenderObj, 
  renderLexicalArticleBuilder1, 
  renderLexicalArticleBuilder2
} from "../functions/lexical";
import { getErrorAlert, getErrorSnackbar, getInfoAlert, getSuccessSnackbar, getWarningAlert } from "../html";
import * as TIME from '../../utils/time';
import { CacheCommunity, getCommunity, renderCensusCommunityHTML } from "../functions/census";
import { COMPONENTS_OBJECT } from '../../CONSTANTS/DESIGN_SYSTEM_COMPONENTS';
import { D3_COMPONENTS } from "../../CONSTANTS/LEARNING_D3_COMPONENTS";
import { getAndRenderEditMarkdownNotesPreview, getMarkdownNoteInDatabase } from "./markdownNotes";
import * as LEXICAL_IMPLEMENTATIONS from './lexicalImplementations';
import { ParsedEditorStateReturn, parseCommentLexicalEditor, parseFullLexicalEditor, parseTextOnlyLexicalEditor, parseTextWithBlockElementsLexicalEditor, parseTextWithLinksLexicalEditor } from "../../lexical";
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { getDownloadFileUrl, getUserIdAndIpIdForImageUpload, uploadFileGeneral, uploadImageObject } from "../../aws/aws-implementation";
import ejs from 'ejs';
import { execute, executeWithArgument, tryRemoveFile } from "../../utils/cmd";
import mime from 'mime-types';
import { getAudioMetadata, getImageMetadata, getTestAudioHTML, getTestVideoHTML, getVideoMetadata } from "../../aws/mediaHelpers";
import { postGetImageDataHelper, renderCodeWrapper } from "./static-pages";
import { createEmbedding, moderateOpenAI } from "../../ai";
import { highlight } from "../../personal-website-shared";
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getSizesFromWidthAndHeight } from "../functions/markdown";
import escapeHTML from "escape-html";
import { createTwitterAndLinkedInImages, getImageFromUrl } from "../../utils/image";
import jsdom from 'jsdom';
import pgvector from 'pgvector';
import COMMON_SVGS from '../../CONSTANTS/COMMON_SVG';
import { generateJsonFromCsvExcel, parseHTMLTable, parseTableJSON } from "../functions/table";
import csvtojsonV2 from "csvtojson";

const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

/*----------------------------------------------------- DESIGN_SYSTEM ------------------------------------------------*/
const COMPONENTS_SET = new Set(Object.keys(COMPONENTS_OBJECT));
export function getDesignSystemHome(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 }, 
    { name: 'My Design System', item: '/projects/design-system', position: 3 }];
  const title = "Frank's Design System";
  const keywords: string[] = [];
  const description = 'View FrankMBrown\s design system which tries to emulate Material Design using semantic html and a small amount of CSS and JavaScript.';
  const tableOfContents: TableOfContentsItem[] = [
    {id: 'assumptions', text: 'Assumptions'},
    {id: 'how-to-learn-more', text: 'Explore the Design System'},
    {id: 'navigate-components', text: 'Navigate Components'},
    {id: "html-philosophy",text: "About HTML"},
    {id: "css-philosophy",text: "About CSS"},
    {id: "javascript-philosophy",text: "About JavaScript"},
    {id: "things-to-note",text: "Things to Note"},
    {id: "coming-soon",text: "Coming Soon"},
    {id: 'icon-search', text: 'SVG Icon Search'},
    {id: 'resources', text: 'Resources'},
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/design-system'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/design-system',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
    
  })
}
export function getDesignSystemComponent(req:Request,res:Response){
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 },  { name: 'My Design System', item: '/projects/design-system', position: 3 }];
  const { component } = req.params;
  if (!!!COMPONENTS_SET.has(component)) return redirect(req,res,'/projects/design-system',404,{severity:'error',message: 'Component page not found.'});
  const {
    title,
    path,
    keywords,
    description,
    tableOfContents
  } = COMPONENTS_OBJECT[component as keyof typeof COMPONENTS_OBJECT];
  breadcrumbs.push({ position: 4, name: title, item: path });
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, noIndex: false };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(`pages/design-system/${component}`,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  })
}
export function getGoogleMaps(req:Request,res:Response){
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'My Design System', item: '/projects/design-system', position: 3 },
    { name: 'Google Maps Implementation', item: '/projects/design-system/google-maps', position: 4}
  ];
  const geographies = [
    {
      static: true,
      geojson: 'Block_Group-310019657001',
      display_name: 'Block Group 1 Of Census Tract 965700 Of Adams County, Nebraska',
      center: '{"lat":40.586701500000004,"lng":-98.389302}',
      bounds: '{"north":40.589782,"south":40.583621,"east":-98.383491,"west":-98.395113}',
      info: "",
      key: ''
    },
    {
      static: true,
      geojson: 'Block_Group-340390382012',
      display_name: 'Block Group 2 Of Census Tract 038201 Of Union County, New Jersey',
      center: '{"lat":40.678625499999995,"lng":-74.42214150000001}',
      bounds: '{"north":40.687047,"south":40.670204,"east":-74.412931,"west":-74.431352}',
      info: ""
    },
    {
      static: true,
      geojson: 'Block_Group-061010506014',
      display_name: 'Block Group 4 Of Census Tract 050601 Of Sutter County, California',
      center: '{"lat":39.145011999999994,"lng":-121.6602305}',
      bounds: '{"north":39.148692,"south":39.141332,"east":-121.64249,"west":-121.677971}',
      info: ""
    },
    {
      static: true,
      geojson: 'Place-4809656',
      display_name: 'Box Canyon, Texas',
      center: '{"lat":29.5333765,"lng":-101.1569585}',
      bounds: '{"north":29.542054,"south":29.524699,"east":-101.13435,"west":-101.179567}',
      info: ""
    },
    {
      static: true,
      geojson: 'Place-2210950',
      display_name: 'Bunkie, Louisiana',
      center: '{"lat":30.954904,"lng":-92.218377}',
      bounds: '{"north":30.970971,"south":30.938837,"east":-92.162744,"west":-92.27401}',
      info: ""
    },
    {
      static: true,
      geojson: 'Census_Tract-12069030110',
      display_name: 'Census Tract 301.10, Lake County, Florida',
      center: '{"lat":28.920773500000003,"lng":-81.6953425}',
      bounds: '{"north":28.96113,"south":28.880417,"east":-81.629031,"west":-81.761654}',
      info: ""
    },
    {
      static: true,
      geojson: 'County-48093',
      display_name: 'Comanche County, Texas',
      center: '{"lat":31.9727125,"lng":-98.54048449999999}',
      bounds: '{"north":32.261436,"south":31.683989,"east":-98.156568,"west":-98.924401}',
      info: ""
    },
    {
      static: true,
      geojson: 'Unified_School_District-1719970',
      display_name: 'Illinois Valley Central Unit School District 321 Of Illinois (PK-12)',
      center: '{"lat":40.888892,"lng":-89.5292555}',
      bounds: '{"north":40.980248,"south":40.797536,"east":-89.447693,"west":-89.610818}',
      info: ""
    },
    {
      static: true,
      geojson: 'County_Subdivision-4828992775',
      display_name: 'Normangee CCD, Leon County, Texas',
      center: '{"lat":31.1145085,"lng":-96.1260455}',
      bounds: '{"north":31.25528,"south":30.973737,"east":-95.985597,"west":-96.266494}',
      info: ""
    },
    {
      geojson: 'Zip_Code_Tabulation_Area-14069',
      display_name: 'Zip Code Tabulation Area 14069',
      center: '{"lat":42.5994125,"lng":-78.62418450000001}',
      bounds: '{"north":42.627508,"south":42.571317,"east":-78.587253,"west":-78.661116}',
      info: ""
    },
    {
      static: true,
      geojson: 'Block_Group-484930006001',
      display_name: 'Block Group 1 Of Census Tract 000600 Of Wilson County, Texas',
      center: '{"lat":28.971387999999997,"lng":-98.1564665}',
      bounds: '{"north":29.060443,"south":28.882333,"east":-98.036734,"west":-98.276199}',
      info: ""
    },
    {
      static: true,
      geojson: 'Block_Group-721130703001',
      display_name: 'Block Group 1 Of Census Tract 070300 Of Ponce Municipio, Puerto Rico',
      center: '{"lat":18.023775,"lng":-66.61158950000001}',
      bounds: '{"north":18.028147,"south":18.019403,"east":-66.609312,"west":-66.613867}',
      info: ""
    },
  ];
  geographies.forEach((obj) => obj.info = `<p class="h6 fw-regular block" style="max-width: 350px;">${obj.display_name}</p><p class="mt-2 body1" style="max-width: 350px;">${lorem}</style>` )
  /* @ts-ignore */
  geographies.forEach((obj)=> obj.infoMarker = `<p class="h6 t-warning fw-regular text-align-center">${obj.display_name} Marker Info Window Example</p>`)
  const title = "Google Maps Implementation - My Design System";
  const keywords: string[] = ["Frank McKee Brown", "Frank\'s Design System", "Google Maps", "Google Maps JavaScript API", "htmx", "Google Maps", "geojson", "drawing geojson", "markers", "POSTGIS", "postgresql database", "markers", "Amazon S3", "geography input", "JavaScript"];
  const description = 'I created a google maps javascript API implementation for use with Single Page Applications other than React. It is not fully fleshed out, but it contains functionality that I believe to be the most important.';
  const tableOfContents: TableOfContentsItem[] = [
    { id: 'introduction', text: 'Introduction'},
    { id: 'assumptions', text: 'Assumptions'},
    { id: 'javascript', text: 'JavaScript'},
    { id: 'example-show-geography', text: 'Example of Showing Geography'},
    { id: 'example-drawing-circles', text: 'Example of Drawing Circles'},
    { id: 'example-drawing-polygons', text: 'Example of Drawing Polygons'},
    { id: 'download-code', text: 'Download Code'},
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/design-system/google-maps'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/google-maps',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    geographies
  })
}
export function getLexicalPage(req:Request,res:Response){
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'My Design System', item: '/projects/design-system', position: 3 },
    { name: 'Lexical Implementation', item: '/projects/design-system/lexical-rich-text-editor', position: 4}
  ];
  const title = "Lexical Implementation - My Design System";
  const keywords: string[] = ["Frank McKee Brown", "Frank\'s Design System", "Lexical", "Lexical Rich Text Editor", "Lexical Facebook", "Rich Text Editor JavaScript", "JavaScript"];
  const description = 'I haven\'t yet implemented a Lexical Rich Text Editor. I plan to build an article builder that you can use to build blogs that utilize my design system and utilize semantic HTML.';
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "about-lexical-implementation",
        "text": "About the Lexical Implementation"
    },
    {
        "id": "editor-to-do",
        "text": "Editor To Do"
    },
    {
        "id": "example-lexical-implementation",
        "text": "Example Lexical Implementation"
    },
    {
        "id": "lexical-output",
        "text": "Example Lexical Implementation Output"
    }
];

  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/design-system/lexical-rich-text-editor'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/lexical-rich-text-editor',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    ALLOWED_FONTS: [
      "Anuphan, sans-serif;",
      "Arial, sans-serif;",
      "Verdana, sans-serif;",
      "Tahoma, sans-serif;",
      "Trebuchet MS, sans-serif;",
      "Times New Roman, serif;",
      "Georgia, serif;",
      "Garamond, serif;",
      "Courier New, monospace;",
      "Brush Script MT, cursive;"
    ]
  })
}
export function getArticleBuilder(req:Request,res:Response){
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Article Builder', item: '/projects/article-builder', position: 3 }
  ];
  const title = "Frank's Article Builder";
  const keywords: string[] = ["Article Builder", "Frank McKee Brown", "Build an Article", "Submit the Article", "Copy HTML", "Frank McKee Brown", "frankmbrown.net", "Frank Brown","Build an article using my lexical implementation"];
  const description = "Build an Article using my Lexical Implementation. Create an article and copy the resulting Lexical Editor state.";
  const tableOfContents: TableOfContentsItem[] = [{ id: 'projects', text: 'Projects'}];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/article-builder' };
  const requiredVariables = getRequiredVariables(req,SEO);
  const articleBuilder1 = renderLexicalArticleBuilder1(req);
  return res.status(200).render('pages/projects/article-builder',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    bodyClass: 'main-only',
    articleBuilder1
  })
}
export function getArticleBuilder2(req:Request,res:Response){
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 }, { name: 'Article Builder 2', item: '/projects/article-builder-2', position: 3 }];
  const title = "Frank's Article Builder Attempt 2";
  const keywords: string[] = ["Article Builder", "Frank McKee Brown", "Build an Article", "Submit the Article", "Copy HTML", "Frank McKee Brown", "frankmbrown.net", "Frank Brown",];
  const description = "Build an Article using my Lexical Implementation using a different kind of article builder. This version of the article builder involves multiple rich text editors.";
  const tableOfContents: TableOfContentsItem[] = [];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/article-builder-2' };
  const requiredVariables = getRequiredVariables(req,SEO);
  const articleBuilder2 = renderLexicalArticleBuilder2(req);
  return res.status(200).render('pages/projects/article-builder-2',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    articleBuilder2
  })
}
export function getArticleBuilder3(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 }, { name: 'Article Builder 3', item: '/projects/article-builder-3', position: 3 }];
  const title = "Frank's Article Builder Attempt 3";
  const keywords: string[] = ["Article Builder", "Frank McKee Brown", "Build an Article", "Submit the Article", "Copy HTML", "Frank McKee Brown", "frankmbrown.net", "Frank Brown",];
  const description = "Build an Article using my Lexical Implementation using a different kind of article builder. This version of the article builder involves multiple rich text editors. It also allows you to insert your own custom html, css, and javascript.";
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "why-build",
        "text": "Why Create"
    },
    {
        "id": "new-article-builder-requirements",
        "text": "New Article Builder Feature"
    },
    {
        "id": "things-to-keep-inmind",
        "text": "Keep In Mind"
    },
    {
        "id": "article-builder-implementation",
        "text": "Implementation"
    }
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/article-builder-3' };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/article-builder-3',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    ...getArticleBuilder3RenderObj({})
  });
}
export function getArticleBuilder4(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 }, { name: 'Article Builder 4', item: '/projects/article-builder-4', position: 3 }];
  const title = "Frank's Article Builder Attempt 4";
  const keywords: string[] = ["Article Builder", "Frank McKee Brown", "Build an Article", "Submit the Article", "Copy HTML", "Frank McKee Brown", "frankmbrown.net", "Frank Brown",];
  const description = "Build an Article using my Lexical Implementation using a different kind of article builder.";
  const tableOfContents: TableOfContentsItem[] = [
    { id: "about", text: "About" }
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/article-builder-4' };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/article-builder-4',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  });
}
export function getCreateASurvey(req:Request,res:Response) {
  const survey_uuid = 'survey_'.concat(crypto.randomUUID());
  const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 },{ name: 'Projects', item: '/projects', position: 2 }, { name: 'Create A Poll', item: '/projects/create-a-survey', position: 3 }];
  const title = "Create A Survey";
  const keywords: string[] = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown","Create A Poll","Create A Poll Using My Design system", "Create A Poll using Lexical Rich Text Editor"];
  const description = 'Create A Survey to gauge the reactions of a large group of people using artificial intelligence.';
  const tableOfContents: TableOfContentsItem[] = [
    {id: "about-creating-survey", text: "About Creating Surveys"}, 
    {id: "required-survey-attributes", text: "Required Survey Attributes"}, 
    {id: "survey-questions", text: "Survey Questions"}, 
    {id: "survey-form", text:"Submit / View / Reset Survey"}
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/create-a-survey'};
  const survey_description = LEXICAL_IMPLEMENTATIONS.getArticleBuilderImplementation(req,'survey-description',`<p class="lex-p" style="text-align: left; margin: 6px 0px 0px; padding: 0px 0px 0px 0px !important;" data-v="1" dir="ltr" data-e-indent="0"><span data-v="1" style="white-space: pre-wrap;">Enter the poll description here! The poll description can be written with the same components that articles use. If the poll description's height is greater than 400 pixels, then the poll will be abbreviated when being initially shown to the user,</span></p>
`,{ minHeight: 200, wrapperClass: 'block lexical-wrapper mt-1' });
  const requiredVariables = getRequiredVariables(req,SEO);
  const now = (new Date()).getTime()/1000;
  const deadline_default = TIME.getDateTimeStringFromUnix(now + 86400*14,true);
  const min_datetime = TIME.getDateTimeStringFromUnix(now + 60*30,true);
  const max_datetime = TIME.getDateTimeStringFromUnix(now + 60*60*24*365,true);

  return res.status(200).render('pages/projects/create-a-survey',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    survey_description,
    survey_uuid,
    deadline_default,
    min_datetime,
    max_datetime
  })
}

export function htmlToJavascriptPage(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'HTML To JavaScript', item: '/projects/html-to-javascript', position: 3 }
  ];
  const title = "HTML To JavaScript";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "HTML To Javascript",
    "Convert HTML String to Javascript sting that can be used to generate DOM nodes on the client", 
    "Convert HTML string to Javascript function that can produce HTML string"
  ];
  const description = 'Convert HTML String to Javascript sting that can be used to generate DOM nodes on the client.';
  const tableOfContents: TableOfContentsItem[] = [
    {id: "why", text: "Why Create This"}, 
    {id: "html-to-javascript-form", text: "Input HTML String"}, 
    {id: "copy-form-output", text: "Copy Form Output"}
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/html-to-javascript'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/html-to-javascript',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  })
}

export function htmlCssJavascriptPlayground(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'HTML, CSS, JavaScript Playground', item: '/projects/html-css-javascript-playground', position: 3 }
  ];
  const title = "HTML, CSS, JavaScript Playground";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "HTML, CSS, JavaScript Playground",
    "Convert HTML String to Javascript sting that can be used to generate DOM nodes on the client", 
    "Convert HTML string to Javascript function that can produce HTML string"
  ];
  const description = 'Code HTML, CSS, JavaScript and view the resulting output.';
  const tableOfContents: TableOfContentsItem[] = [
    {id: "why-create", text: "Why Create HTML, CSS, JavaScript Playground"}, 
    {id: "how-to-use", text: "How To Use Code"}, 
    {id: "how-to-use-playground", text: "How To Use This"},
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/html-css-javascript-playground'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/html-css-javascript-playground',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    pageObj: {
      theme: req.session.settings?.code_editor_theme || 'vscode'
    }
  })
}

export function recordMediaTestPage(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Record Media', item: '/projects/record-media', position: 3 }
  ];
  const title = "Adding Record Media Functionality";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "Take and Edit Image",
    "Record Audio",
    "Record Video",
    "Take and edit image, record audio, and record video using your device's functionality."
  ];
  const description = 'Take and edit image, record audio, and record video using your device\'s functionality.';
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "why",
        "text": "Why Create This"
    },
    {
        "id": "how-it-works",
        "text": "How It Works"
    },
    {
        "id": "image-upload-example-text",
        "text": "Image Upload Example"
    },
    {
        "id": "audio-upload-example-desc",
        "text": "Audio Upload Example"
    },
    {
        "id": "video-upload-example-desc",
        "text": "Video Upload Example"
    },
    {
        "id": "image-upload",
        "text": "Image Upload"
    },
    {
        "id": "audio-upload",
        "text": "Audio Upload"
    },
    {
        "id": "video-upload",
        "text": "Video Upload"
    },
    {
        "id": "upload-media-get-url",
        "text": "Upload Media Get URL"
    },
    {
      "id": "upload-image-get-data",
      "text": "Upload Image, Get Data"
  }
]
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/record-media'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/record-media',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  })
}

export async function uploadPageImageFromUrl(req:Request,url:string) {
  try {
    const name = url.replace('https://image.storething.org/frankmbrown/','').replace('https://image.storething.org/frankmbrown%2F','');
    const twitterKey = 'frankmbrown/twitter/'.concat(name);
    const linkedinKey = 'frankmbrown/og-image/'.concat(name);
    const {user_id,ip_id} = getUserIdAndIpIdForImageUpload(req);
    const buffer = await getImageFromUrl(url);
    const { twitter, linkedin } = await createTwitterAndLinkedInImages(buffer);
    const [twitterURL,linkedinURL] = await Promise.all([
      uploadImageObject(twitterKey,twitter,'jpg',{},user_id,ip_id),
      uploadImageObject(linkedinKey,linkedin,'jpg',{},user_id,ip_id)
    ]);
  } catch (e) {
    console.error(e);
    throw new Error("Something went wrong uploading the page image.");
  }
}

export async function recordMediaPageImage(req:Request,res:Response) {
  try {
    const image = req.file;
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!!!image) {
      return res.status(200).send(getErrorAlert("Unable to detect image in input."));
    }
    var imageBuffer = image.buffer;
    if (req.body["add-bg-color"]==="on"&&req.body['bg-color']&&hexColorRegex.test(req.body["bg-color"])) {
      imageBuffer = await executeWithArgument('magick',['convert','-','-background',req.body["bg-color"],'jpeg:-'],imageBuffer);
    } else {
      imageBuffer = await executeWithArgument('magick',['convert','-','jpeg:-'],imageBuffer);
    }
    const { twitter, linkedin } = await createTwitterAndLinkedInImages(imageBuffer);
    const name = crypto.randomUUID().concat('.jpg');
    const key1 = 'frankmbrown/'.concat(name);
    const twitterKey = 'frankmbrown/twitter/'.concat(name);
    const linkedinKey = 'frankmbrown/og-image/'.concat(name);
    const {user_id,ip_id} = getUserIdAndIpIdForImageUpload(req);
    const [url,twitterURL,linkedinURL] = await Promise.all([
      uploadImageObject(key1,imageBuffer,'jpg',{},user_id,ip_id),
      uploadImageObject(twitterKey,twitter,'jpg',{},user_id,ip_id),
      uploadImageObject(linkedinKey,linkedin,'jpg',{},user_id,ip_id)
    ]);
    return res.status(200).send(`<h3 class="bold h3 mt-2">
Image:
</h3>
<p class="mt-1">
<span class="bold">URL</span>: ${url}
</p>
<img src="${url}" alt="Page Image" />
<h3 class="bold h3 mt-2">
  Twitter Image:
</h3>
<p class="mt-1">
<span class="bold">URL</span>: ${twitterURL}
</p>
<img src="${twitterURL}" alt="Twitter Image" />
<h3 class="bold h3 mt-2">
  Page Image:
</h3>
<p class="mt-1">
<span class="bold">URL</span>: ${linkedinURL}
</p>
<img src="${linkedinURL}" alt="Page Image" />`)
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the page image URLs."));
  }
}

const D3_COMPONENTS_SET = new Set(Object.keys(D3_COMPONENTS));
export function learningD3JsComponent(req:Request,res:Response) {
  try {
    const { component } = req.params;
    if (D3_COMPONENTS_SET.has(component)) {
      const breadcrumbs: Breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Projects', item: '/projects', position: 2 },  { name: 'Learning D3.js', item: '/projects/learning-d3-js', position: 3 }];
      const {
        title,
        path,
        keywords,
        tableOfContents,
        description
      } = D3_COMPONENTS[component as keyof typeof D3_COMPONENTS];
      breadcrumbs.push({ position: 4, name: title, item: path });
      const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, noIndex: false };
      const requiredVariables = getRequiredVariables(req,SEO);
      return res.status(200).render(`pages/learning-d3/${component}`,{
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
      });
    } else {
      return redirect(req,res,'/projects/learning-d3-js',404,{ severity:'warning', message: 'This component does not exist.' });
    }
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects/learning-d3-js',404,{ severity:'warning', message: 'This component does not exist.' });
  }
}
export function learningD3Js(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Learning D3.js', item: '/projects/learning-d3-js', position: 3 }
  ];
  const title = "Learning D3.js";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "Learning D3.js",
    "Creating charts, data visualization, javascript"
  ];
  const description = 'Documenting the process of learning d3.js -The JavaScript library for bespoke data visualization. I plan to create a d3.js playground after this where users can dd their own data to the charts.';
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "on-this-page",
        "text": "On This Page"
    },
    {
        "id": "d3-visualization",
        "text": "D3 Visualization Links"
    },
    {
        "id": "d3-animation",
        "text": "D3 Animation Links"
    },
    {
        "id": "d3-interaction",
        "text": "D3 Interaction links"
    },
    {
        "id": "d3-data",
        "text": "D3 Data Links"
    },
    {
        "id": "poll-questions-data-show",
        "text": "Poll Question Data Visualizations"
    },
    {
        "id": "color-question",
        "text": "Color Data Visualization"
    },
    {
        "id": "short-answer-question",
        "text": "Short Answer Data Visualization"
    },
    {
        "id": "date-question",
        "text": "Date Data Visualization"
    },
    {
        "id": "paragraph-question",
        "text": "Paragraph Data Visualization"
    },
    {
        "id": "datetime-question",
        "text": "Dattime Data Visualization"
    },
    {
        "id": "short-blog-question",
        "text": "Short Blog Data Visualization"
    },
    {
        "id": "time-question",
        "text": "Time Data Visualization"
    },
    {
        "id": "multiple-choice-question",
        "text": "Multiple Choice Data Visualization"
    },
    {
        "id": "image-question",
        "text": "Image Data Visualization"
    },
    {
        "id": "checkbox-question",
        "text": "Checkbox Data Visualization"
    },
    {
        "id": "audio-question",
        "text": "Audio Data Visualization"
    },
    {
        "id": "range-question",
        "text": "Range Data Visualization"
    },
    {
        "id": "video-question",
        "text": "Video Data Visualization"
    },
    {
        "id": "rank-question",
        "text": "Rank Data Visualization"
    }
]
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/learning-d3-js'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/learning-d3Js',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  })
}
export function createSvgWithPixi(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Creating SVG with Pixi', item: '/projects/create-svg', position: 3 }
  ];
  const title = "Creating SVGs with PixiJs";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "Learning SVGs",
    "Cretaing SVGs with PixiJs"
  ];
  const description = 'Creating SVGs with PixiJS';
  const tableOfContents: TableOfContentsItem[] = [
    { id: "about-the-svg-editor", text: "About the Editor" },
    {id: "general-e-c", text: "General Info"},
    {id: "line-smoothing", text: "About Line Smoothing"},
    {id: "to-do", text: "To Do"},
    {id: "create-the-svg", text: "Create the SVG"}
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/create-svg'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/create-svg',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  })
}
export function createGradient(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Creating Gradients', item: '/projects/create-gradient', position: 3 }
  ];
  const title = "Create Gradient";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "linearGradient",
    "radialGradient",
    "Create linearGradient and radialGradient svg elements with a user interface"
  ];
  const description = 'Create linearGradient and radialGradient svg elements with a user interface.';
  const tableOfContents: TableOfContentsItem[] = [
    { id: "page-header", text: "Top" },
    
    { id: 'create-gradient', text: 'How To Use'}
  
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/create-gradient'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/create-gradient',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  });
}
/**
 * Save gradient in the database
 * @param req 
 * @param res 
 * @returns 
 */
export async function postCreateGradient(req:Request,res:Response) {
  try {
    var queryStr = '';
    const arr = [];
    if (req.session.auth?.userID!==undefined) {
      queryStr = /*sql*/`INSERT INTO svgs (user_id, ip_id, svg_obj, svg_text, svg_type, date_created) VALUES ($1::integer, $2::integer, $3::jsonb, $4::TEXT, $5 RETURNING, $6::bigint id);`;
      arr.push(req.session.auth.userID,req.session.ip_id);
    } else {
      queryStr = /*sql*/`INSERT INTO svgs (ip_id, svg_obj, svg_text, svg_type, date_created) VALUES ($1::integer, $2::jsonb, $3::TEXT, $4, $5::bigint) RETURNING id;`;
      arr.push(req.session.ip_id);
    }
    const { type, svg_obj, svg} = req.body;
    if (typeof type!=='string'||(type!=='linear'&&type!=='radial')) throw new Error('Incorrect svg type.');
    if (typeof svg_obj !== 'object') throw new Error('Incorrect svg_obj');
    if (typeof svg !=='string') throw new Error('Incorrect svg text.');
    const date_created = TIME.getUnixTime();
    arr.push(JSON.stringify(svg_obj),svg,type,date_created);
    const resp = await getDatabase().query(queryStr,arr);
    const id = resp?.rows?.[0].id;
    if (typeof id !=='string') throw new Error('Typeof returned id should be a string.');
    return res.status(200).json({ id });
  } catch (error) {
    console.error(error,JSON.stringify(req.body,null,' '));
    return res.status(400).send('Something went wrong creating the svg.');
  }
}
/**
 * Delete gradient when user wants to delete gradient
 * @param req 
 * @param res 
 * @returns 
 */
export async function deleteCreateGradient(req:Request,res:Response) {
  try {
    const { id } = req.params;
    const ip_id = req.session.ip_id;
    const user_id = req.session.auth?.userID;
    if (user_id) {
      const queryStr = /*sql*/`DELETE FROM svgs WHERE id=$1 AND ip_id=$2::integer AND user_id=$3::integer RETURNING id;`;
      const resp = await getDatabase().query(queryStr,[id,ip_id,user_id]);
      if (!!!resp || !!!resp.rows?.length || !!!resp.rows[0].id) throw new Error('Unable to delete svg from database.');
    } else {
      const queryStr = /*sql*/`DELETE FROM svgs WHERE id=$1 AND ip_id=$2::integer AND user_id IS NULL RETURNING id;`;
      const resp = await getDatabase().query(queryStr,[id,ip_id]);
      if (!!!resp || !!!resp.rows?.length || !!!resp.rows[0].id) throw new Error('Unable to delete svg from database.');
    }
    return res.status(200).send(getSuccessSnackbar('Deleted svg from database.'));
  } catch (error) {
    console.error(error);
    return res.status(400).send(getErrorSnackbar('Unable to delete svg from database.'));
  }
}
/**
 * Get all gradients for this user / for this user 
 * @param req 
 * @param res 
 */
export async function getAllUserGradients(req:Request,res:Response) {
  try {
    const format = String(req.query['format']); // implement when you need the svgs in different formats
    const typeStr = String(req.query['type']);
    const ip_id = req.session.ip_id;
    const user_id = req.session.auth?.userID;
    if (user_id) {
      var queryStr = '';
      if (typeStr==="linear") {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE user_id=$1 AND ip_id=$2 AND svg_type='linear' ORDER BY date_created DESC;`;
      } else if (typeStr==="radial") {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE user_id=$1 AND ip_id=$2 AND svg_type='radial' ORDER BY date_created DESC;`;
      } else {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE user_id=$1 AND ip_id=$2 ORDER BY date_created DESC;`;
      }
      const arr = [user_id,ip_id];
      const dbResp = await getDatabase().query(queryStr,arr);
      type DB_RESP = {
        id: string,
        svg_text: string
      }
      const rows = dbResp.rows as DB_RESP[];
      
      if (format==="something else") {
        // if you need to implement 
        return res.status(200).send('');
      } else {
        const str = rows.map((obj) => {
    return /*html*/`<div class="flex-column align-center gap-1" data-grad-container="" style="width: auto; padding: 4px; border: 2px solid var(--divider); border-radius: 6px;">
  ${obj.svg_text}
  <div class="flex-row align-center justify-between" style="max-width: 120px;">
    <button class="toggle-button small" data-snackbar="" data-selem="#copy-nack-svg-href" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CopyAll">
        <path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path>
      </svg>
    </button>
    <button class="toggle-button small" type="button" hx-delete="/create-gradient/${obj.id}" hx-trigger="click" hx-target="closest div[data-grad-container]" hx-swap="outerHTML">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
      </svg>
    </button>
  </div>
</div>`;
        }).join('');
        return res.status(200).send(str);
      }
    } else {
      var queryStr = '';
      if (typeStr==="linear") {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE ip_id=$1 AND svg_type='linear' ORDER BY date_created DESC;`;
      } else if (typeStr==="radial") {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE ip_id=$1 AND svg_type='radial' ORDER BY date_created DESC;`;
      } else {
        queryStr = /*sql*/`SELECT id, svg_text FROM svgs WHERE ip_id=$1 ORDER BY date_created DESC;`;
      }
      const arr = [ip_id];
      const dbResp = await getDatabase().query(queryStr,arr);
      const rows = dbResp.rows;
      if (format==="something else") {
        // if you need to implement 
        return res.status(200).send('');
      } else {
        const str = rows.map((obj) => {
    return /*html*/`<div class="flex-column align-center gap-1" data-grad-container="" style="width: auto; padding: 4px; border: 2px solid var(--divider); border-radius: 6px;">
  ${obj.svg_text}
  <div class="flex-row align-center justify-between" style="max-width: 120px;">
    <button class="toggle-button small" data-snackbar="" data-selem="#copy-nack-svg-href" type="button">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CopyAll">
        <path d="M18 2H9c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9V4h9v12zM3 15v-2h2v2H3zm0-5.5h2v2H3v-2zM10 20h2v2h-2v-2zm-7-1.5v-2h2v2H3zM5 22c-1.1 0-2-.9-2-2h2v2zm3.5 0h-2v-2h2v2zm5 0v-2h2c0 1.1-.9 2-2 2zM5 6v2H3c0-1.1.9-2 2-2z"></path>
      </svg>
    </button>
    <button class="toggle-button small" type="button" hx-delete="/create-gradient/${obj.id}" hx-trigger="click" hx-target="closest div[data-grad-container]" hx-swap="outerHTML">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Delete">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
      </svg>
    </button>
  </div>
</div>`;
        }).join('');
        return res.status(200).send(str);
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorSnackbar('Unable to get user gradients.'));
  }
}
export function createCssSpriteMaker(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Creating CSS Sprite Maker', item: '/projects/creating-css-sprite', position: 3 }
  ];
  const title = "Creating CSS Sprite Maker For Material Icons";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "authentication",
    "login",
    "create account"
  ];
  const description = 'While my design system can\'t really utilize svg sprites because of the ability to change application size and the customization of svg colors, I wanted to build a simplistic sprite builder with material icons in case I ever create a site in the future that is more static and where speed is really important or just to see the best way to create a CSS Sprite. To learn about the advantage of using CSS Sprites, read this CSS Sprites article. ';
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "why-create-this",
        "text": "Why Create This"
    },
    {
        "id": "how-to-use",
        "text": "How To Use"
    },
    {
        "id": "current-sprite",
        "text": "Current Sprite"
    },
    {
        "id": "search-icons",
        "text": "Search Icons"
    },
    {
        "id": "css-sprite-background",
        "text": "Edit Sprite Background"
    },
    {
        "id": "add-svg-sprite",
        "text": "Add SVG To Sprite"
    },
    {
        "id": "add-image-css-sprite",
        "text": "Add Image To Sprite"
    },
    {
        "id": "add-text-css-sprite",
        "text": "Add Text To Sprite"
    },
    {
        "id": "add-shape-css-sprite",
        "text": "Add Shape to Sprite"
    }, {
      id: 'download-css-sprite',
      text: 'Download Sprite'
    }
]
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/implementing-auth'};
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/creating-css-sprite-builder',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  });
}

export function excalidrawImplementation(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Excalidraw Implementation', item: '/projects/excalidraw-implementation', position: 3 }
  ];
  const title = "Implementing Authentication For This Website";
  const keywords: string[] = [
    "Frank McKee Brown", 
    "frankmbrown.net", 
    "Frank Brown",
    "authentication",
    "login",
    "create account"
  ];
  const description = 'Read about the process of implementing excalidraw on the client.';
  const tableOfContents: TableOfContentsItem[] = [
    
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/excalidraw-implementation' };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render('pages/projects/excalidraw-implementation',{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
    bodyClass: 'main-only',
  });
}


export function createThreeJSTexture(req:Request,res:Response) {
  const view = 'pages/projects/create-three-js-texture';
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Create ThreeJS Texture', item: '/projects/create-three-js-texture', position: 3 }
  ];
  const title = "Create ThreeJS Texture";
  const description = 'Create and save a three js texture.';
  const tableOfContents: TableOfContentsItem[] = [
    
  ];
  const keywords: string[] = [
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/create-three-js-texture' };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  });
}

export function threeJSPlayground(req:Request,res:Response) {
  const view = 'pages/projects/three-js-playground';
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'ThreeJS Playground', item: '/projects/three-js-playground', position: 3 }
  ];
  const title = "ThreeJS Playground";
  const description = 'ThreeJS Playground to test stuff out.';
  const tableOfContents: TableOfContentsItem[] = [
    
  ];
  const keywords: string[] = [
  ];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/three-js-playground' };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables
  });
}


export async function informationNearYou(req:Request,res:Response) {
  const view = 'pages/projects/info-near-you';
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'Information Near You', item: '/projects/info-near-you', position: 3 }
  ];
  const title = "Census Information Near You";
  const description = ' I just wanted to remind myself of what the structure of census data that I had previously gathered looked like. Use this page to see census communities near you and to search for census communities in the United States. In the future, I plan to generate d3.js graphs based on census data going back to approx 1984 for all census communities.';
  const tableOfContents: TableOfContentsItem[] = [
    {id: 'why-add-this', text: 'Why Add This'},
    {id: 'communities-near-you', text: 'Communities Near You'},
    {id: 'search-census-communities', text: 'Search Census Communities'}
  ];
  const keywords: string[] = [];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/info-near-you', image: 'https://image.storething.org/frankmbrown/cfc7a28a-6c01-4725-a2d6-b3ae1df97692.png' };
  const requiredVariables = getRequiredVariables(req,SEO);
  var html = '';
  try {
    if (req.session.census_communities) {
      const cacheCommunities = await Promise.all(req.session.census_communities.map(id => getCommunity(req,id)));
      html = await renderCensusCommunityHTML(req,cacheCommunities.filter(obj=>obj!==undefined) as CacheCommunity[]);
    }
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      communitiesHTML: html.length ? html : undefined
    });
  } catch (error) {
    console.error(error);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    });
  }
  
} 
const DEFAULT_MARKDOWN = `An h1 header
============

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and \`monospace\`. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., &quot;it's all
in chapters 12--14&quot;). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

  1. first item
  2. second item
  3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
    print &quot;Welcome to flavor country!&quot;;
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~



### An h3 header ###

Now a nested list:

  1. First, get these ingredients:

      * carrots
      * celery
      * lentils

  2. Boil some water.

  3. Dump everything in the pot and follow
    this algorithm:

        find wooden spoon
        uncover pot
        stir
        cover pot
        balance wooden spoon precariously on pot handle
        wait 10 minutes
        goto first step (or shut off burner when done)

    Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local
doc](local-doc.html), and to a [section heading in the current
doc](#an-h2-header). Here's a footnote [^1].

[^1]: Footnote text goes here.

Tables can look like this:

|size | material    |  color |
| ---- | ------------ | ------------ |
| 9   |  leather     |  brown |
| 10  |  hemp canvas  | natural |
| 11  |  glass       |  transparent |

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

| -------- |  -----------------------| 
| keyword  |  text| 
| -------- |  -----------------------| 
| red      |  Sunsets, apples, and| 
|          |  other red or reddish| 
|          |  things.| 
|           | | 
| green    |  Leaves, grass, frogs| 
|          |  and other things it's| 
|          |  not easy being.| 
| -------- |  -----------------------| 

A horizontal rule follows.

***

Here's a definition list:

apples
  : Good for making applesauce.
oranges
  : Citrus!
tomatoes
  : There's no &quot;e&quot; in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a &quot;line block&quot;:

| Line one
|   Line too
| Line tree

and images can be specified like so:

![example image](example-image.jpg &quot;An exemplary image&quot;)

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \int \rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.`;

export async function markdownToHTML(req:Request,res:Response) {
    const view = 'pages/projects/markdown-to-html';
    const DEFAULT_PAGE_OBJ = {
      markdown: DEFAULT_MARKDOWN,
      title: '',
      description: '',
      design_system: 'default',
      breaks: true, 
      gfm: true,
      pedantic: false,
      publish: false,
      noteID: '',
      hxParameters: '',
      notesList: '',      
    };
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Markdown TO HTML', item: '/projects/markdown-to-html', position: 3 }
    ];
    
    const title = "Markdown to HTML";
    const description = 'I wanted to create this page because I\'m getting tired of writing large markdown files in VS code only to not know what the resulting HTML will look like in my design system.';
    var pageObj = DEFAULT_PAGE_OBJ;
    try {
      if (req.session.auth?.level && req.session.auth.level >=3) {
        const noteID = req.query['note'];
        if (noteID) {
          const [notes,note] = await Promise.all([getAndRenderEditMarkdownNotesPreview(req),getMarkdownNoteInDatabase(req,String(noteID))]);
          pageObj.notesList = notes;
          pageObj.hxParameters = `hx-put="/markdown-notes/${encodeURIComponent(note.id)}/${encodeURIComponent(note.title)}" data-loading="Updating Markdown File In Database..." hx-target="closest form" hx-swap="afterend"`;
          pageObj.noteID = String(note.id);
          pageObj.markdown = note.markdown;
          pageObj.title = note.title;
          pageObj.description = note.description;
          pageObj.design_system = note.design_system;
          pageObj.breaks = note.breaks;
          pageObj.gfm = note.gfm;
          pageObj.pedantic = note.pedantic;
          pageObj.publish = note.published;
        } else {
          const notes = await getAndRenderEditMarkdownNotesPreview(req);
          pageObj.hxParameters = `hx-post="/markdown-notes" hx-indicator="#page-transition-progress" hx-target="#PAGE" hx-swap="innerHTML"`;
          pageObj.notesList = notes;
        }
      }
      const tableOfContents: TableOfContentsItem[] = [
        {id: 'why-create-this', text: 'Why Add This'},
        
      ];
      const keywords: string[] = [];
      const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/markdown-to-html' };
      const requiredVariables = getRequiredVariables(req,SEO);
      return res.status(200).render(view,{
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables,
        pageObj: {
          theme: req.session.settings?.code_editor_theme || 'vscode',
          ...pageObj
        },
        bodyClass: 'main-only',
      })
    } catch (error) {
      console.error(error);
      if (typeof req.query['note'] === 'string' && req.query['note'].length) {
        return redirect(req,res,'/projects/markdown-to-html',404,{severity:'error',message:'This markdown note does not exist.'})
      } else {
        return redirect(req,res,'/',500,{severity:'error',message:'Something went wrong getting this page.'})
      }
    }
}

export async function getLexicalImplementations(req:Request,res:Response) {
  try {
    const view = 'pages/projects/lexical-implementations';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Lexical Implementations', item: '/projects/lexical-implementations', position: 3 }
    ];
    
    const title = "Lexical Implementations";
    const description = 'I\'m creating this page to test out various implementations of the Lexical Rich Text Editor. ';
    const tableOfContents: TableOfContentsItem[] = [
      {id: "why-create-this", text: 'What Is This Page'},
      {id:"how-to-use", text: "How To Use"},
      {id: "registering-editor", text: "Registering Editor" },
      { "id": "article-builder-lexical-implementation", "text": "Article Builder Implementation" },
      
      { "id": "comment-lexical-implementation", "text": "Comment Implementation"},
      
      { "id": "text-only-lexical-implementation", "text": "Text Only Implementation" },
      
      { "id": "text-links-lexical-implementation", "text": "Text With Links Implementation" },

      { "id": "text-lists-quotes-code-math-lexical-implementation", "text": "Text / Block Text Implementation" }
    ];
    
    const articleBuilderEditor = LEXICAL_IMPLEMENTATIONS.getArticleBuilderImplementation(req);
    const commentEditor = LEXICAL_IMPLEMENTATIONS.getCommentImplementation(req);
    const textOnlyEditor = LEXICAL_IMPLEMENTATIONS.getTextOnlyImplementation(req);
    const textOnlyEditorNoColor = LEXICAL_IMPLEMENTATIONS.getTextOnlyImplementation(req,'text-implementation-no-color',true);
    const textWithLinksEditor = LEXICAL_IMPLEMENTATIONS.getTextWithLinksImplementation(req);
    const textWithLinksEditorNoColor = LEXICAL_IMPLEMENTATIONS.getTextWithLinksImplementation(req,'text-links-implementation-no-color',true);
    const textWithBlockImplementation = LEXICAL_IMPLEMENTATIONS.getTextBlockTextImplementation(req);
    const textWithBlockImplementationNoColor = LEXICAL_IMPLEMENTATIONS.getTextBlockTextImplementation(req,'text-blocks-implementation-no-color',true);

    const keywords: string[] = ["Lexical","Artcile","Comment","rich text editor"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/lexical-implementations' };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      articleBuilderEditor,
      commentEditor,
      textOnlyEditor,
      textWithLinksEditor,
      textWithBlockImplementation,
      textOnlyEditorNoColor,
      textWithLinksEditorNoColor,
      textWithBlockImplementationNoColor
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the lexical implementations page. "});
  }
}

export async function onPostLexicalImplementation(req:Request,res:Response) {
  try {
    const getHTML = (obj: ParsedEditorStateReturn) => {
      if (req.session.device?.desktop) {
        return obj.desktop_html;
      } else if (req.session.device?.tablet) {
        return obj.tablet_html;
      } else {
        return obj.mobile_html;
      }
    }
    const rand = crypto.randomUUID();
    if (typeof req.body['article']==='string') {
      const body = JSON.parse(req.body['article']);
      const obj = await parseFullLexicalEditor(body);
      const html = getHTML(obj);
      return res.status(200).send(/*html*/`<div data-rich-text-editor data-display-only class="lexical-wrapper" data-type="full" data-editable="false" id="u_${rand}">${html}</div>`);
    } else if (typeof req.body['text-implementation']==='string'||typeof req.body['text-implementation-no-color']==='string') {
      const body = JSON.parse(req.body['text-implementation']||req.body['text-implementation-no-color']);
      const obj = await parseTextOnlyLexicalEditor(body,typeof req.body['text-implementation-no-color']==='string');
      const html = getHTML(obj);
      return res.status(200).send(/*html*/`<div data-rich-text-editor data-display-only data-type="text-only" data-editable="false"  class="lexical-wrapper" data-type="text-only" data-editable="false" id="u_${rand}">${html}</div>`);
    } else if (typeof req.body['comment']==='string') {
      const body = JSON.parse(req.body['comment']);
      const obj = await parseCommentLexicalEditor(body);
      const html = getHTML(obj);
      return res.status(200).send(/*html*/`<div class="lexical-wrapper" data-rich-text-editor data-type="comment" data-editable="false"  data-type="comment" data-editable="false" id="u_${rand}">${html}</div>`);
    } else if (typeof req.body['text-links-implementation']==='string'||typeof req.body['text-links-implementation-no-color']==='string') {
      const body = JSON.parse(req.body['text-links-implementation']||req.body['text-links-implementation-no-color']);
      const obj = await parseTextWithLinksLexicalEditor(body,typeof req.body['text-links-implementation-no-color']==='string');
      const html = getHTML(obj);
      return res.status(200).send(/*html*/`<div data-rich-text-editor data-display-only data-type="text-with-links" data-editable="false"  class="lexical-wrapper" data-type="text-with-links" data-editable="false" id="u_${rand}">${html}</div>`);
    } else if (typeof req.body['text-blocks-implementation']==='string'||typeof req.body['text-blocks-implementation-no-color']==='string') {
      const body = JSON.parse(req.body['text-blocks-implementation']||req.body['text-blocks-implementation-no-color']);
      const obj = await parseTextWithBlockElementsLexicalEditor(body,typeof req.body['text-blocks-implementation-no-color']==='string');
      const html = getHTML(obj);
      return res.status(200).send(/*html*/`<div data-rich-text-editor data-display-only data-type="text-block-elements" data-editable="false" class="lexical-wrapper" data-type="text-block-elements" data-editable="false" id="u_${rand}">${html}</div>`);
    } else {
      return res.status(200).send(getErrorSnackbar('Unable to find lexical editor body. Try reloading the page.'));
    }
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorSnackbar('Something went wrong parsing the lexical editor.'));
  }
}

export function getLookingIntoEmbedingSocialMediaPosts(req:Request,res:Response) {
  try {
    const view = 'pages/projects/embedding-social-media-posts';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Embedding Social Media Posts', item: '/projects/embed-social-media-posts', position: 3 }
    ];
    const title = "Embedding Social Media Posts";
    const description = 'Trying to figure out a way for users to input social media posts as user generated content in a safe manner - in a way that prevents XSS.';
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "what-is-this",
          "text": "What Is This"
      },
      {
          "id": "x-posts",
          "text": "X Posts"
      },
      {
          "id": "tiktok-posts",
          "text": "TikTok Videos"
      },
      {
          "id": "instagram-posts",
          "text": "Instagram Posts"
      },
      {
          "id": "reddit-posts",
          "text": "Reddit Comments"
      },
      {
        id: "conclusion",
        text: "Conclusion"
      },
      {
        id: "parsing-embed-codes",
        text: "Copy Parsing Embed Code Scripts"
      }
  ];
    const keywords: string[] = ["Social Media","TikTok","Instagram","Twitter","Reddit","rich text editor","Lexical"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/embed-social-media-posts' };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the embedding social media posts page."});
  }
}

const systemFonts = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong"
]);
type SystemFonts = "serif"|"sans-serif"|"monospace"|"cursive"|"fantasy"|"system-ui"|"ui-serif"|"ui-sans-serif"|"ui-monospace"|"ui-rounded"|"emoji"|"math"|"fangsong";
type FontObj = {
  font_name: string,
  category: string,
  subsets: string[],
  unicode_range: string,
  weight_100_url: string|null,
  weight_200_url: string|null,
  weight_300_url: string|null,
  weight_400_url: string|null,
  weight_500_url: string|null,
  weight_600_url: string|null,
  weight_700_url: string|null
};

function renderFontFamilyChange(req:Request,font1:SystemFonts,font2Obj:FontObj) {
  const nonce = req.session.jsNonce;
  return `<div class="table-wrapper">
    <table cellspacing="0">
        <caption class="h3 bold">Information About ${font2Obj.font_name}</caption>
        <thead>
          <tr>
            <th scope="col">Attribute</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Font Name:</th>
            <td>${font2Obj.font_name}</td>
          </tr>
          <tr>
            <th scope="row">Category:</th>
            <td>${font2Obj.category}</td>
          </tr>
          <tr>
            <th scope="row">Subsets:</th>
            <td>${font2Obj.subsets.join(', ')}</td>
          </tr>
          <tr>
            <th scope="row">Unicode Range:</th>
            <td>${font2Obj.unicode_range}</td>
          </tr>
          <tr>
            <th scope="row">100 Weight URL:</th>
            <td>${typeof font2Obj.weight_100_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_100_url}">
            ${font2Obj.weight_100_url}
            </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">200 Weight URL:</th>
            <td>${typeof font2Obj.weight_200_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_200_url}">
                ${font2Obj.weight_200_url}
                </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">300 Weight URL:</th>
            <td>${typeof font2Obj.weight_300_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_300_url}">
                ${font2Obj.weight_300_url}
                </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">400 Weight URL:</th>
            <td>${typeof font2Obj.weight_300_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_400_url}">
                ${font2Obj.weight_400_url}
                </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">500 Weight URL:</th>
            <td>${typeof font2Obj.weight_500_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_500_url}">
                ${font2Obj.weight_500_url}
                </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">600 Weight URL:</th>
            <td>${typeof font2Obj.weight_600_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_600_url}">
                ${font2Obj.weight_600_url}
                </a>` : 'None'}</td>
          </tr>
          <tr>
            <th scope="row">700 Weight URL:</th>
            <td>${typeof font2Obj.weight_700_url ==="string" ? `<a class="secondary link" target="_blank" href="${font2Obj.weight_700_url}">
                ${font2Obj.weight_700_url}
                </a>` : 'None'}</td>
          </tr>
        </tbody>
      </table>
</div>
<hr class="bold"style="margin: 1rem 0rem;" />
<section id="comparing-font-families">
    <h2 class="bold h2 bb-main">
        <a class="same-page bold" href="#">
            Comparing Font Families
        </a>
       
    </h2>
    <h3 class="bold h3 bb">${font1}</h3>
    <div class="flex-row wrap gap-1 mt-2">
        <div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">a</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">b</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">c</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">d</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">e</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">f</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">g</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">h</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">i</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">j</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">k</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">l</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">m</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">n</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">o</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">p</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">q</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">r</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">s</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">t</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">u</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">v</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">w</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">x</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">y</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">z</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">A</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">B</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">C</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">D</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">E</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">F</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">G</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">H</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">I</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">J</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">K</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">L</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">M</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">N</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">O</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">P</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">Q</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">R</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">S</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">T</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">U</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">V</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">W</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">X</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">Y</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font1}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">Z</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div>
    </div>
    <div class="block hz-scroll" style="overflow-x: auto;">
        <div data-font-stretch="${font1}" style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font1};">
            abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
        </div>
    </div>
    <h3 class="bold h3 bb mt-2">${font2Obj.font_name}</h3>
    <div class="flex-row wrap gap-1 mt-2">
        <div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">a</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">b</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">c</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">d</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">e</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">f</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">g</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">h</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">i</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">j</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">k</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">l</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">m</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">n</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">o</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">p</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">q</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">r</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">s</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">t</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">u</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">v</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">w</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">x</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">y</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">z</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">A</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">B</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">C</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">D</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">E</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">F</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">G</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">H</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">I</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">J</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">K</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">L</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">M</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">N</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">O</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">P</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">Q</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">R</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">S</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">T</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">U</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">V</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">W</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">X</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">Y</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div><div data-font="${font2Obj.font_name}" style="display: flex; flex-direction: column; border: 1px solid var(--divider); padding: 2px;">
            <div>
              <div data-letter style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">Z</div>
            </div>
            <div class="flex-column w-100">
                <div class="flex-row w-100">
                    <span class="bold">Width:</span><span data-width></span>
                </div>
                <div class="flex-row w-100">
                    <span class="bold">Height:</span><span data-height></span>
                </div>
            </div>
        </div>
        
    </div>
    <div class="block hz-scroll" style="overflow-x: auto;">
        <div data-font-stretch="${font2Obj.font_name}" style="width: auto!important; height: auto!important; font-size: 1.5rem; display: inline!important; font-family: ${font2Obj.font_name};">
            abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
        </div>
    </div>
    <script async nonce="${nonce}" async>
(function() {
    const url = "${font2Obj.weight_400_url}";
    WebFont.load({
        google: {
        families: ["${font2Obj.font_name}"]
        }
    });
    setTimeout(() => {
        const obj = {};
        const fonts = [];
        Array.from(document.querySelectorAll('#comparing-font-families div[data-font]')).forEach((fontDiv) => {
            const font = fontDiv.getAttribute('data-font');
            if (font) {
                if (!!!obj[font]) {
                    fonts.push(font);
                    obj[font] = {
                        heights: [],
                        widths: [],
                        averageWidth: 0,
                        averageHeight: 0,
                        wordWidth: 0,
                        wordHeight: 0
                    };
                }
                const letter = fontDiv.querySelector('div[data-letter]');
                const widthSpan = fontDiv.querySelector('span[data-width]');
                const heightSpan = fontDiv.querySelector('span[data-height]');
                if (letter&&widthSpan&&heightSpan) {
                    const width = letter.offsetWidth;
                    const height = letter.offsetHeight;
                    obj[font].widths.push(width);
                    obj[font].heights.push(height);
                    widthSpan.innerText = String(width);
                    heightSpan.innerText = String(height);
                }
            }
        })
        Array.from(document.querySelectorAll('#comparing-font-families div[data-font-stretch]'))
        .forEach((el) => {
            const font = el.getAttribute('data-font-stretch');
            if (font&&obj[font]) {
                obj[font].wordWidth = el.offsetWidth;
                obj[font].wordHeight = el.offsetHeight;
            }
        })
        const output = document.getElementById('font-form-output');
        if(output) {
            Object.keys(obj).forEach((key) => {
                var tempAvgWidth = 0;
                var tempAvgHeight = 0;
                for (let i = 0; i < obj[key].widths.length;i++){
                    tempAvgWidth+=obj[key].widths[i];
                    tempAvgHeight+=obj[key].heights[i];
                }
                tempAvgWidth /= obj[key].widths.length;
                tempAvgHeight /= obj[key].widths.length;
                obj[key].averageWidth = tempAvgWidth;
                obj[key].averageHeight = tempAvgHeight;
            });
            const sizeAdjust = ((obj[fonts[1]].averageHeight/obj[fonts[0]].averageHeight) + (obj[fonts[1]].averageWidth/obj[fonts[0]].averageWidth))*50;
            const htmlStr = \`<div class="table-wrapper mt-2">
    <table cellspacing="0">
        <caption class="h3 bold">\${fonts[0]} vs \${fonts[1]}</caption>
        <thead>
            <tr>
            <th scope="col" colspan="4">\${fonts[0]}</th>
            <th scope="col" colspan="4">\${fonts[1]}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
            <th scope="col">Average Width (Letter):</th>
            <th scope="col">Average Height (Letter):</th>
            <th scope="col">Width (Word):</th>
            <th scope="col">Height (Word):</th>
            <th scope="col">Average Width (Letter):</th>
            <th scope="col">Average Height (Letter):</th>
            <th scope="col">Width (Word):</th>
            <th scope="col">Height (Word):</th>
            </tr>
            <tr>
                <td>\${obj[fonts[0]].averageWidth}</td>
                <td>\${obj[fonts[0]].averageHeight}</td>
                <td>\${obj[fonts[0]].wordWidth}</td>
                <td>\${obj[fonts[0]].wordHeight}</td>
                <td>\${obj[fonts[1]].averageWidth}</td>
                <td>\${obj[fonts[1]].averageHeight}</td>
                <td>\${obj[fonts[1]].wordWidth}</td>
                <td>\${obj[fonts[1]].wordHeight}</td>
            </tr>
        </tbody>
    </table>
</div>
<h3 class="mt-2 h3 bold">Recommended CSS For Font:</h3>
<div style="position: relative;" class="mt-2"><pre class="hz-scroll"><code class="hljs"><span class="hljs-keyword">@font-face</span> {
  <span class="hljs-attribute">font-family</span>: \${fonts[1]};
  <span class="hljs-attribute">src</span>: <span class="hljs-built_in">url</span>(<span class="hljs-string">"\${url}"</span>) <span class="hljs-built_in">format</span>(<span class="hljs-string">&quot;ttf&quot;</span>);
  <span class="hljs-attribute">font-weight</span>: <span class="hljs-number">400</span>;
  <span class="hljs-attribute">font-display</span>: swap;
  size-adjust: \${sizeAdjust}%;
}</code></pre>
  <button aria-label="Copy Code Output" data-snackbar data-selem="#copy-code-success" data-copy-prev class="toggle-button small" style="position: absolute; top: 3px; right: 3px; z-index: 2;" aria-haspopup="true">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="ContentCopy">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z">
      </path>
    </svg>
  </button>
</div>
\`;
output.insertAdjacentHTML('beforeend',htmlStr);
        }
    },2000);
    
})();
    </script>
</section>

`;
}

export async function onFontSizeAdjustChange(req:Request,res:Response) {
  try {
    const systemFont = req.body['initial-font-family'];
    const googleFont = req.body['goog-font'];
    if (typeof systemFont !== 'string' || typeof googleFont !=='string' || !!!systemFonts.has(systemFont)) {
      console.error(`Invalid body: system font: ${systemFont}. Google Font: ${googleFont}`);
      return res.status(200).send(getErrorAlert("Invalid body inputs.",'<svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Input"><path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2zM11 16l4-4-4-4v3H1v2h10v3z"></path></svg>'));
    }
    const db = getDatabase();
    const queryRes = await db.query(`SELECT * FROM google_fonts WHERE font_name=$1;`,[googleFont]);
    if (!!!queryRes.rows.length) {
      return res.status(200).send(getErrorAlert("Invalid google font selection.",'<svg viewBox="0 0 488 512" title="google" focusable="false" inert tabindex="-1"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>'));
    }
    const row = queryRes.rows[0] as FontObj;
    const str = renderFontFamilyChange(req,systemFont as SystemFonts,row);
    return res.status(200).send(str);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert("Something went wrong. Try reloading the page."));
  }
}


export function getFontSizeAdjust(req:Request,res:Response) {
  // CREATE TABLE google_fonts (
  //   font_name TEXT PRIMARY KEY UNIQUE NOT NULL,
  //   category TEXT NOT NULL,
  //   subsets TEXT[] NOT NULL,
  //   unicode_range TEXT NOT NULL,
  //   weight_100_url TEXT,
  //   weight_200_url TEXT,
  //   weight_300_url TEXT,
  //   weight_400_url TEXT,
  //   weight_500_url TEXT,
  //   weight_600_url TEXT,
  //   weight_700_url TEXT	
  // );
  // CREATE INDEX hash_font_name ON google_fonts USING HASH(font_name);
  try {
    const view = 'pages/projects/font-size-adjust';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Font Size Adjust Property', item: '/projects/configure-size-adjust-property', position: 3 }
    ];
    const title = "Font Size Adjust Property";
    const description = 'Trying to create something that makes it easier to determine size-adjust property for @font-face declarations.';
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "what-is-this",
          "text": "What Is This"
      },
      {
          "id": "determining-size-adjust",
          "text": "Determining Font Size Adjust"
      },
      {
        id: "comparing-font-families",
        text: "Comparing Font Families"
      }
    ];
    const keywords: string[] = ["Fonts"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/configure-size-adjust-property' };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the font size adjust page."});
  }
}


export function getTestCssEnvVariables(req:Request,res:Response) {
  try {
    const view = 'pages/projects/testing-css-env-variables';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Testing CSS env() Variables', item: '/projects/testing-css-env-variables', position: 3 }
    ];
    const title = "Testing CSS env() Variables";
    const description = 'Tesing CSS env variables on different devices in a production environment.';
    const tableOfContents: TableOfContentsItem[] = [
      {
        id: "about-page",
        text: "About This Page"
      },
      {id: 'env-variables', text: 'Env Variables'},
      {id: 'vh-and-vw', text: 'Viewport Height and Viewport Width'}
    ];
    const keywords: string[] = ["CSS env Variables"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/testing-css-env-variables' };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the css env variables page."});
  }
}

export function getImageEditor(req:Request,res:Response) {
  try {
    const view = 'pages/projects/image-editor';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Image Editor', item: '/projects/image-editor', position: 3 }
    ];
    const title = "Image Editor";
    const description = ' I want to have a page that makes it easy to quickly edit images / get information about images.';
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create",
          "text": "Why Create This"
      },
      {
          "id": "pintura-image-editor",
          "text": "Pintura Image Editor"
      },
      {
          "id": "ued-img",
          "text": "Edit, Get Information About, and Download Image"
      },
      {
          "id": "resize-image-with-background",
          "text": "Resize Image and Add Background Color"
      }
  ]
    const keywords: string[] = ["Image Editor","Pintura"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/image-editor' };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the image editor page."});
  }
}

export async function resizeImage(buffer: Buffer, width: number, height: number, bgColor: string) {
  try {
    const newBuffer = await executeWithArgument('magick',['convert','-','-gravity','center','-thumbnail',`${parseInt(String(width))}x${parseInt(String(height))}`,'-background',bgColor,'-extent',`${parseInt(String(width))}x${parseInt(String(height))}`,'jpeg:-'],buffer);
    return newBuffer;
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong resizing the image.");
  } 
}

export async function postImageEditorResize(req:Request,res:Response) {
  try {
    const file = req.file;
    const widthStr = req.body["target-width"];
    const heightStr = req.body["target-height"];
    const colorStr = req.body['background-color-color'];
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find the posted file."))
    }
    if (!!!widthStr||!!!Number.isFinite(parseFloat(widthStr))) {
      return res.status(200).send(getErrorAlert("Unable to find the posted desired width."))
    }
    if (!!!heightStr||!!!Number.isFinite(parseFloat(heightStr))) {
      return res.status(200).send(getErrorAlert("Unable to find the posted desired height."))
    }
    if (!!!colorStr||!!!/^#([0-9a-fA-F]{2}){3}/.test(colorStr)) {
      return res.status(200).send(getErrorAlert("Unable to find the posted desired background color."))
    }
    const fileContents = file.buffer;
    const filename = crypto.randomUUID().concat(`.jpg`);
    const key = 'frankmbrown/'.concat(filename);
    const resizedImage = await resizeImage(fileContents,parseFloat(widthStr),parseFloat(heightStr),colorStr);
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    await uploadImageObject(key,resizedImage,'jpeg',{width: widthStr,height: heightStr},user_id,ip_id);
    const template = `<div class="mt-2 flex-row justify-center">
  <a type="button" href="<%=locals.url%>" data-download="frankmbrown-resized.<%=locals.extension%>"  class="button icon-text success outlined medium" id="download-bg-img-btn">
    <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="FileDownload"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>
    DOWNLOAD IMAGE
  </a>
</div>
<div class="mt-1">
<span class="bold">URL:</span> <%=locals.imageURL%> 
</div>
`;
    const url = getDownloadFileUrl('image',key);
    const str = ejs.render(template,{ url, extension: 'jpeg', imageURL: `https://image.storething.org/${key}` });
    return res.status(200).send(str);
  } catch (e) {
    console.error(e);
    return res.status(200).send("Unable to resize image and add background color.");
  }
}

export function getNeuralStyleTransfer(req:Request,res:Response) {
  try {
    const view = 'pages/projects/neural-style-transfer';
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Neural Style Transfer', item: '/projects/neural-style-transfer', position: 3 }
    ];
    const title = "Neural Style Transfer";
    const description = 'I am mainly creating this page to test out my Flask backend. I am using a Node.js backend for most of this site and I need to test whether I am handling requests that should be routed to a different systemd service correctly. This requires configuring ngnix and systemd correctly, so I am killing two birds with one stone here.';
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-this-page",
          "text": "Why Create This Page"
      },
      {
          "id": "text-flask-working",
          "text": "Test Flask"
      },
      {
          "id": "references",
          "text": "References"
      },
      {
          "id": "about-neural-style-transfer",
          "text": "About Neural Style Transfer"
      },
      {
          "id": "apply-style-transfer",
          "text": "Test Neural Style Transfer"
      }
    ]
    const keywords: string[] = ["Neural Style Transfer","Wikipedia","Flask"];
    const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/neural-style-transfer', image: "https://image.storething.org/frankmbrown/22e330a2-7344-4299-a7ad-76bf520a1657.jpg" };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the neural style transfer page."});
  }
}

export function getConvertFileType(req:Request,res:Response) {
  try {
    const view = 'pages/projects/convert-file-type';
    const title = "Convert File Type";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Convert File Type', item: '/projects/convert-file-type', position: 3 }
    ];
    const description = "I wanted to create this page to make it easier for me to convert between file types for image, video, audio, and text files. I also wanted to create this page to test out markdown to HTML and TeX to HTML using pandoc.";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "about-this-page",
          "text": "About This Page"
      },
      {
          "id": "convert-image-file",
          "text": "Convert Image File"
      },
      {
          "id": "support-image-file-format",
          "text": "Supported Image File Formats"
      },
      {
          "id": "convert-audio-file",
          "text": "Convert Audio File"
      },
      {
          "id": "what-is-ffmpeg",
          "text": "What is ffmpeg?"
      },
      {
          "id": "audio-video-formats-supported",
          "text": "Supported Audio and Video Formats"
      },
      {
          "id": "convert-video-file",
          "text": "Convert Video File"
      },
      {
          "id": "convert-text-file",
          "text": "Convert Text File"
      },
      {
          "id": "input-output-text-formats",
          "text": "Supported Text File Formats"
      }
    ]
    const keywords:string[] = [];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/convert-file-type', image: "https://image.storething.org/frankmbrown/909a3a8a-b998-439a-bda3-89bae28f7263.png" };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (error) {
    console.error(error);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the convert file type page."});
  }
} 

const ACCEPTED_IMAGE_TYPES = new Set([".aai", ".art", ".avs", ".bmp", ".cmyk", ".dcx", ".dib", ".dpx", ".epdf", ".epi", ".eps", ".eps2", ".eps3", ".epsf", ".epsi", ".ept", ".fax", ".fits", ".fpx", ".gif", ".gray", ".graya", ".html", ".hrz", ".jbig", ".jng", ".jp2", ".jpc", ".jpeg", ".jxl", ".mat", ".miff", ".mono", ".mng", ".mpeg", ".m2v", ".mpc", ".msl", ".mtv", ".mvg", ".otb", ".p7", ".palm", ".pam", ".pbm", ".pcd", ".pcds", ".pcl", ".pcx", ".pdb", ".pdf", ".pgm", ".picon", ".pict", ".png", ".pnm", ".ppm", ".ps", ".ps2", ".ps3", ".psd", ".ptif", ".rgb", ".rgba", ".sgi", ".shtml", ".sun", ".svg", ".tga", ".tiff", ".txt", ".uil", ".uyvy", ".vicar", ".viff", ".wbmp", ".webp", ".xbm", ".xpm", ".xwd", ".yuv"]);

const returnEJSFileConversion = `<div class="flex-row justify-center">
  <a class="button filled success medium icon-text" href="<%=locals.url%>" target="_blank">
    <svg viewBox="0 0 512 512" title="download" focusable="false" inert tabindex="-1"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"></path></svg>
    DOWNLOAD RESULT
  </a>
</div>
<p class="mt-1">
  Download the result of the operation by clicking the button above.
</p>
`

export async function postConvertImageType(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image file to convert."));
    }
    const buffer = file.buffer;
    const outputImageType = String(req.body['output-image-type']);
    if (!!!ACCEPTED_IMAGE_TYPES.has(outputImageType)) {
      return res.status(200).send(getErrorAlert("The requested output image type is not accepted."));
    }
    const output_type = outputImageType.slice(1);
    const convertedBuffer = await executeWithArgument('magick',['convert','-',`${output_type}:-`],buffer);
    const key = 'frankmbrown/' + crypto.randomUUID() + outputImageType;
    const keyNew = await uploadFileGeneral(key,convertedBuffer,'image','image/'.concat(output_type));
    const url = getDownloadFileUrl('image',keyNew);
    const resp = ejs.render(returnEJSFileConversion,{ url, filename: keyNew.replace('frankmbrown/','') });
    return res.status(200).send(resp);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting image file type!"));
  }
}

function checkIfFolderExistsElseMakeIt() {
  if (!fs.existsSync(path.resolve(__dirname,'temp'))) {
    fs.mkdirSync(path.resolve(__dirname,'temp'));
    return;
  }
  return;
}

const ACCEPTED_AUDIO_TYPES = new Set([".ass", ".srt", ".ac3", ".ac4", ".adx", ".aea", ".aiff", ".alaw", ".amr", ".aptx", ".aptx_hd", ".caf", ".codec2", ".daud", ".dfpwm", ".dts", ".eac3", ".flac", ".g722", ".g723_1", ".g726", ".g726le", ".gsm", ".lc3", ".mp3", ".mulaw", ".opus", ".pcm_s16be", ".pcm_s16le", ".pcm_s24be", ".pcm_s24le", ".pcm_s32be", ".pcm_s32le", ".pcm_s8", ".pcm_u16be", ".pcm_u16le", ".pcm_u24be", ".pcm_u24le", ".pcm_u32be", ".pcm_u32le", ".pcm_u8", ".rm", ".sbc", ".spdif", ".tta", ".vorbis"]);
export async function postConvertAudioType(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find audio file to convert."));
    }
    const fileBuffer = file.buffer;
    const outputAudioType = String(req.body['output-audio-type']);
    if (!!!ACCEPTED_AUDIO_TYPES.has(outputAudioType)) {
      return res.status(200).send(getErrorAlert("The requested output audio type is not accepted."));
    }
    checkIfFolderExistsElseMakeIt();
    const path_to_temp_folder = path.resolve(__dirname,'temp');
    const inputExtension = mime.extension(file.mimetype);
    const input_name = crypto.randomUUID() + "." + inputExtension||'';
    const path_to_input = path.resolve(path_to_temp_folder,input_name);
    const output_name = crypto.randomUUID() + outputAudioType;
    const path_to_output = path.resolve(path_to_temp_folder,output_name);
    // @ts-ignore
    await fs.promises.writeFile(path_to_input,fileBuffer);
    const command = `ffmpeg -i ${path_to_input} ${path_to_output}`;
    await execute(command,{ cwd : __dirname });
    const convertedFileBuffer = await fs.promises.readFile(path_to_output);
    const key = 'frankmbrown/' + crypto.randomUUID() + outputAudioType;
    const keyNew = await uploadFileGeneral(key,convertedFileBuffer,'audio','audio/'.concat(inputExtension||''));
    const url = getDownloadFileUrl('audio',keyNew);
    const resp = ejs.render(returnEJSFileConversion,{ url, filename: keyNew.replace('frankmbrown/','') });
    return res.status(200).send(resp);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting audio file type!"));
  }
}
const ACCEPTED_VIDEO_TYPES = new Set([".asf", ".avi", ".cavsvideo", ".roq", ".dnxhd", ".evc", ".h261", ".h263", ".h264", ".hevc", ".image2", ".image2pipe", ".mjpeg", ".mp4", ".mpeg", ".mpegts", ".nut", ".obu", ".rawvideo", ".swf", ".vc1", ".vc1test", ".vidc"]);
export async function postConvertVideoType(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find video file to convert."));
    }
    const fileBuffer = file.buffer;
    const outputVideoType = String(req.body['output-video-type']);
    if (!!!ACCEPTED_VIDEO_TYPES.has(outputVideoType)) {
      return res.status(200).send(getErrorAlert("The requested output video type is not accepted."));
    }
    checkIfFolderExistsElseMakeIt();
    const path_to_temp_folder = path.resolve(__dirname,'temp');
    const inputExtension = mime.extension(file.mimetype);
    const input_name = crypto.randomUUID() + "." + inputExtension||'';
    const path_to_input = path.resolve(path_to_temp_folder,input_name);
    const output_name = crypto.randomUUID() + outputVideoType;
    const path_to_output = path.resolve(path_to_temp_folder,output_name);
    // @ts-ignore
    await fs.promises.writeFile(path_to_input,fileBuffer);
    const command = `ffmpeg -i ${path_to_input} ${path_to_output}`;
    await execute(command,{ cwd : __dirname })
    const convertedFileBuffer = await fs.promises.readFile(path_to_output);
    const key = 'frankmbrown/' + crypto.randomUUID() + outputVideoType;
    const keyNew = await uploadFileGeneral(key,convertedFileBuffer,'video','video/'.concat(inputExtension||''));
    const url = getDownloadFileUrl('video',keyNew);
    const resp = ejs.render(returnEJSFileConversion,{ url, filename: keyNew.replace('frankmbrown/','') });
    return res.status(200).send(resp);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting video file type!"));
  }
}
/**
 * Removed '.pdf' for now
 */
const ACCEPTED_TEXT_TYPES = new Set(['.epub', '.rtf', '.xml', '.htm', '.markua', '.tei', '.wiki', '.djot', '.man', '.txt', '.opml', '.icml', '.bib', '.tex', '.ms', '.fb2',  '.docx', '.asciidoc', '.ipynb', '.jira', '.odt', '.md', '.rst', '.zim', '.texinfo', '.adoc', '.typ', '.html', '.markdown', '.mediawiki', '.muse', '.dbk', '.xwiki', '.org', '.texi', '.doku', '.pptx', '.mmd', '.json', '.textile']);
/**
 * Convert document to another type of document.
 * @param fileBuffer Buffer of File
 * @param output_text_type The extension of output without the beginning period 
 * @param input_text_type The extension of input without the beginning period 
 * @param myDesignSystem Whether or not to use my design system for some files
 */
export async function convertTextFileType(fileBuffer:Buffer,output_text_type:string, input_text_type:string,myDesignSystem:boolean=false) {
  var output_file = '';
  try {
    const name = crypto.randomUUID() + "." + output_text_type;
    const path_to_output = path.resolve(__dirname,'temp',name);
    output_file = path_to_output;

    const commandOutput = await executeWithArgument('pandoc',['-f',input_text_type,'-o',path_to_output],fileBuffer);
    var options:any = { encoding: 'utf-8' };
    switch ('.'.concat(output_text_type)) {
      case '.bib': {
        options = { encoding: 'latin1' }
        break;
      }
      case '.htm': {
        options = { encoding: 'latin1' }
        break;
      }
      case '.man': {
        options = { encoding: 'latin1' }
        break;
      }
      case '.ms': {
        options = { encoding: 'latin1' }
        break;
      }
      case '.rtf': {
        options = { encoding: 'utf-8' };
        break;
      }
      case '.txt': {
        options = { encoding: 'utf-8' };
        break;
      }
      case '.pdf': {
        options = { encoding: 'binary' };
        break;
      }
      default: {
        break;
      }
    }

    const convertedBuffer = await fs.promises.readFile(path_to_output,options); 
    await tryRemoveFile(path_to_output);
    return convertedBuffer as Buffer|string;
  } catch (e) {
    await tryRemoveFile(output_file);
    console.error(e);
    throw new Error("Unable to convert text file type.");
  }
}

export async function postConvertTextFileType(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find file to convert!"));
    }
    const input_text_type = mime.extension(file.mimetype);
    if (!!!input_text_type) {
      return res.status(200).send(getErrorAlert("Unable to detect input file type!"));
    }
    const fileBuffer = file.buffer;
    const outputTextType = String(req.body['output-text-type']);
    if (!!!ACCEPTED_TEXT_TYPES.has(outputTextType)) {
      return res.status(200).send(getErrorAlert("The requested output text type is not accepted!"));
    }
    const key = "frankmbrown/" + crypto.randomUUID() + outputTextType;
    const myDesignSystem = Boolean(req.body['my-design-system']==='on');
    const output_text_type = outputTextType.slice(1);
    const convertedBuffer = await convertTextFileType(fileBuffer,output_text_type,input_text_type,myDesignSystem);
    const keyNew = await uploadFileGeneral(key,convertedBuffer as any,'text',output_text_type)
    const url = getDownloadFileUrl('text',keyNew);
    const resp = ejs.render(returnEJSFileConversion,{ url, filename: keyNew.replace('frankmbrown/','') });
    return res.status(200).send(resp);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting text file type!"));
  }
} 
export function getFileInformation(req:Request,res:Response) {
  try {
    const view = 'pages/projects/get-file-information';
    const title = "Get File Information";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Get File Information', item: '/projects/get-file-information', position: 3 }
    ];
    const description = "I am creating this page to standardize the methods by which I obtain information about user uploaded files - mainly image, audio, and video (media) files. ";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create",
          "text": "Why Create This Page"
      },
      {
          "id": "concerns-uploading-media",
          "text": "Concerns Uploading Media and Documents"
      },
      {
          "id": "image-file-information",
          "text": "Image File Information"
      },
      {
          "id": "audio-file-information",
          "text": "Audio File Information"
      },
      {
          "id": "video-file-information",
          "text": "Video File Information"
      },
      {
          "id": "document-information",
          "text": "Document Information"
      }
    ]
    const keywords:string[] = [];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/get-file-information', image: "https://image.storething.org/frankmbrown/dba365f9-127c-40c5-a142-ced336cad571.png" };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Get File Information page."});
  }
}

export async function postGetFileInformationImage(req:Request,res:Response) {
  try {
    const view = 'partials/routes/get-file-information/image';
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to locate input image file."));
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const key = 'frankmbrown/'+crypto.randomUUID()+'.'+(extension||file.filename.split('.').at(-1));
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    const [imageInformation,pil_image_buffer,image_url] = await Promise.all([
      getImageMetadata(fileBuffer),
      convertImageToPillowCompatable(fileBuffer,extension),
      uploadImageObject(key,fileBuffer,(extension||file.filename.split('.').at(-1) as string),{},user_id,ip_id)
    ]);
    const base64String = pil_image_buffer.toString('base64');
    const body = { image: base64String }
    // ImageFeatureExtractionResponse;
    const [str,embedding,safeSearch] = await Promise.all([
      postGetImageDataHelper(fileBuffer,req,false),
      postToPythonBackend('/python/image-embed',body,5000),
      postToPythonBackend('/python/safe-search-image',body,5000)
    ]);
    const embeddingCodeObj = highlight.highlight(JSON.stringify(embedding),{ language: 'json' });
    const embeddingCodeHtmlString = embeddingCodeObj.value;
    const embeddingCode = renderCodeWrapper({ block: true, htmlString: embeddingCodeHtmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });

    const safeSearchCodeObj = highlight.highlight(JSON.stringify(safeSearch),{ language: 'json' });
    const safeSearchCodeHtmlString = safeSearchCodeObj.value;
    const safeSearchCode = renderCodeWrapper({ block: true, htmlString: safeSearchCodeHtmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });

    return res.status(200).render(view,{ layout: false, str, ...imageInformation[0], embeddingCode, safeSearchCode });
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the file information for the image!."));
  }
}

export async function postGetFileInformationAudio(req:Request,res:Response) {
  var path_to_file_global:string|undefined = undefined;
  try {
    const view = 'partials/routes/get-file-information/audio';
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to locate input audio file."));
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype)||'';
    if (!!!fs.existsSync(path.resolve(__dirname,'temp'))) fs.mkdirSync(path.resolve(__dirname,'temp'));
    const path_to_file = path.resolve(__dirname,'temp',crypto.randomUUID() + "." + extension); 
    path_to_file_global = path_to_file;
    const key = "frankmbrown/" + crypto.randomUUID() + "." + extension;
    // @ts-ignore
    await fs.promises.writeFile(path_to_file,fileBuffer);
    const [audioInformation,_] = await Promise.all([
      getAudioMetadata(path_to_file),
      uploadFileGeneral(key,fileBuffer,'audio',extension)
    ]);
    await fs.promises.unlink(path_to_file);
    return res.status(200).render(view,{ layout: false, ...audioInformation, url:`https://audio.storething.org/${key}` });
  } catch (e) {
    if (path_to_file_global) await tryRemoveFile(path_to_file_global);
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the file information for the audio!."));
  }
}

export async function postGetFileInformationVideo(req:Request,res:Response) {
  var path_to_file_global:string|undefined = undefined;
  try {
    const view = 'partials/routes/get-file-information/video';
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to locate input video file."));
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype)||'';
    if (!!!fs.existsSync(path.resolve(__dirname,'temp'))) fs.mkdirSync(path.resolve(__dirname,'temp'));
    const path_to_file = path.resolve(__dirname,'temp',crypto.randomUUID() + "." + extension); 
    path_to_file_global = path_to_file;
    const key = "frankmbrown/" + crypto.randomUUID() + "." + extension;
    // @ts-ignore
    await fs.promises.writeFile(path_to_file,fileBuffer);
    const [videoInformation,_] = await Promise.all([
      getVideoMetadata(path_to_file),
      uploadFileGeneral(key,fileBuffer,'video',extension)
    ]);
    await fs.promises.unlink(path_to_file);
    return res.status(200).render(view,{ layout: false, ...videoInformation, url:`https://video.storething.org/${key}` });
  } catch (e) {
    if (path_to_file_global) await tryRemoveFile(path_to_file_global);
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the file information for the video!."));
  }
}

export async function postGetFileInformationText(req:Request,res:Response) {
  try {
    const view = 'partials/routes/get-file-information/text';
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to locate input document file."));
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype)||'';
    const contentType = mime.contentType(file.originalname);
    const charset = mime.charset(file.mimetype);
    const size = file.size;
    const key = "frankmbrown/" + crypto.randomUUID() + "." + extension;
    const mimetype = mime.extension(file.mimetype);
    if (!!!mimetype) {
      return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
    }
    await uploadFileGeneral(key,fileBuffer,'text',extension)

    return res.status(200).render(view,{layout:false,size,extension,contentType,charset,url:`https://text.storething.org/${key}`})
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong getting the file information for the document!."));
  }
}


export function getVariousNlpTasks(req:Request,res:Response) {
  try {
    const view = 'pages/projects/various-nlp-tasks';
    const title = "Various Natural Language Processing Tasks";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Various Natural Language Processing Tasks', item: '/projects/various-nlp-tasks', position: 3 }
    ];
    const description = "I am creating this page to test out some nlp tasks that commonly need to be performed when analyzing text-based user generated content (or any other text content). These tasks include: Fill-Mask Tasks, Question Answering Tasks, Sentiment Analysis Tasks, Named Entity Recognition Tasks, Classification Tasks, Translation Tasks, Table Question Answering Tasks, Feature Extraction Tasks, Text Generation Tasks, Summarization Tasks, Keyword Extraction Tasks";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-page",
          "text": "Why Create This Page"
      },
      {
          "id": "fill-mask",
          "text": "Fill Mask"
      },
      {
          "id": "question-answering",
          "text": "Question Answering"
      },
      {
          "id": "sent-nala",
          "text": "Sentiment Anlaysis"
      },
      {
          "id": "ner-task",
          "text": "Named Entity Recognition"
      },
      {
          "id": "class-task",
          "text": "Classification"
      },
      {
          "id": "trans-task",
          "text": "Translation"
      },
      {
          "id": "tqa-task",
          "text": "Table Question Answering"
      },
      {
          "id": "fe-task",
          "text": "Feature Extraction"
      },
      {
          "id": "text-gen-tasks",
          "text": "Text Generation"
      },
      {
          "id": "summarization-tasks",
          "text": "Summarization"
      },
      {
          "id": "keyword-tasks",
          "text": "Keyword Extraction"
      },
      {
        id: "open-ai-moderation",
        text: "OpenAI Moderation API"
      }
    ]
    const keywords:string[] = ["Fill-Mask", " Question Answering", " Sentiment Analysis", " Named Entity Recognition", " Classification", " Translation", "Table Question Answering", "Feature Extraction", "Text Generation", "Summarization", "Keyword Extraction"];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/various-nlp-tasks', image: "https://image.storething.org/frankmbrown/e396894d-0156-4e4b-951b-225daa01a114.webp" };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Various NLP Tasks page."});
  }
}
const NLP_SVG = '<svg viewBox="0 0 640 512" title="robot" focusable="false" inert tabindex="-1"><path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z"></path></svg>';

/**
 * Make POSt request to python backend
 * @param path Should begin with /
 * @param body The json data
 * @returns 
 */
export async function postToPythonBackend(path:string,body:any,timeout?:number) {
  const options:AxiosRequestConfig<any> = { headers: { "Content-Type": "application/json" }};
  if (timeout) {
    options.timeout = timeout;
  }
  return axios.post("http://127.0.0.1:5000".concat(path),body,{ headers: { "Content-Type": "application/json" }})
  .then((res) => {
    return res.data;
  })
  .catch((err:AxiosError) => {
    console.error("Failed to post to Python backend.");
    const newErr = err?.message;
    throw new Error(newErr);
  })
}
type FillMaskResponse = {
  score: number,
  token: number,
  token_str: string,
  sequence: string
}[]
export async function postFillMask(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/fill-mask';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    var maskedInput = req.body['masked-input'];
    if (typeof maskedInput !== 'string') throw new Error("Unable to find input for maked input route.");
    if (!!!/\[MASK\]/.test(maskedInput)) maskedInput += ' [MASK]';
    const body = { text: maskedInput };
    const response = await postToPythonBackend('/python/fill-mask',body,5000) as FillMaskResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing fill-mask.',NLP_SVG));
  }
}
type AnswerQuestionResponse = {
  "answer": string,
  "score": number,
  "start": number,
  "end": number
}
export async function postAnswerQuestion(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/answer-question';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    const question = req.body['question-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for classification. Upload a document or insert text.",NLP_SVG));
    }
    if (typeof question !== 'string' || question.length===0) {
      return res.status(200).send(getErrorAlert("Unable to locate question for question-anwering.",NLP_SVG));
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const body = { context: text_to_use, question };
    const response = await postToPythonBackend('/python/question-answering',body,10000) as AnswerQuestionResponse;
    viewOptions.response = response;
    const referenceForAnswer = text_to_use.slice(response.start,response.end);
    viewOptions.response["reference"] = referenceForAnswer;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing question answering.',NLP_SVG));
  }
}
type SentimentAnalysisResponse = {
  label: string,
  score: number
}[]
export async function postSentimentAnalysis(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/sentiment-analysis';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for sentiment analysis. Upload a document or insert text.",NLP_SVG));
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const body = { sentences: text_to_use.split(/\.|\n|\r/) };
    const response = await postToPythonBackend('/python/sentiment-analysis',body,7000) as SentimentAnalysisResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing sentiment analysis.',NLP_SVG));
  }
}
type NamedEntityRecognitionResponse = {
  entity: 'O'|'B-MISC'|'I-MISC'|'B-PER'|'I-PER'|'B-ORG'|'I-ORG'|'B-LOC'|'I-LOC',
  score: number,
  index: number,
  word: string, 
  start: number,
  end: number
}[]
export async function postNamedEntityRecognition(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/named-entity-recognition';
  const viewOptions = {
    layout: false,
    response: {} as any,
    str: ''
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for named entity recognition. Upload a document or insert text into the textarea.",NLP_SVG));
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const body = { text: text_to_use };
    const response = await postToPythonBackend('/python/ner',body,8000) as NamedEntityRecognitionResponse;
    console.log(response);
    viewOptions.response = response;
    var beginStr = '<p class="mt-2">';
    const sortedNer = response.sort((a,b) => a.start - b.start);
    var current_sorted_ner_ind = 0;
    var curr_ind = 0;
    while (curr_ind < text_to_use.length) {
      if (sortedNer[current_sorted_ner_ind].start<curr_ind) {
        beginStr += escapeHTML(text_to_use.slice(curr_ind,sortedNer[current_sorted_ner_ind].start));
        curr_ind = sortedNer[current_sorted_ner_ind].start;
        current_sorted_ner_ind+=1;
      } else if (sortedNer[current_sorted_ner_ind].start===curr_ind) {
        const className = 'ner-' + sortedNer[current_sorted_ner_ind].entity.toLowerCase().trim();
        beginStr+=`<span class="${className}">` + escapeHTML(text_to_use.slice(sortedNer[current_sorted_ner_ind].start,sortedNer[current_sorted_ner_ind].end+1)) + '</span>';
        curr_ind = sortedNer[current_sorted_ner_ind].end+1;
        current_sorted_ner_ind+=1;
      }
      if (current_sorted_ner_ind===sortedNer.length) break;
    }
    if (curr_ind < text_to_use.length) {
      beginStr += escapeHTML(text_to_use.slice(curr_ind,text_to_use.length));
    }
    beginStr += '</p>';
    viewOptions.str = beginStr;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing named entity recognition.',NLP_SVG));
  }
}
type NlpClassificationResponse = {[label:string]: number}
export async function postNlpClassification(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/nlp-classification';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for classification. Upload a document or insert text.",NLP_SVG))
    }
    const classLabels = req.body['class-labels'];
    if (typeof classLabels!=="string"||classLabels.split(',').length===0) {
      return res.status(200).send(getErrorAlert('There should be at least one class label to use to classify text - make sure they are comma-separated.',NLP_SVG));
    }
    const candidate_labels = classLabels.split(',');
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const body = { text: text_to_use, candidate_labels };
    const response = await postToPythonBackend('/python/zero-shot-classification',body,7000) as NlpClassificationResponse;
    viewOptions.response = Object.entries(response);
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing text classification.',NLP_SVG));
  }
}
export async function postFeatureExtraction(req:Request,res:Response) {
  try {
    const textInput = req.body['text-input'];
    console.log(req.body,textInput);
    if ((typeof textInput !=='string' || textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for feature extraction.",NLP_SVG));
    }
    const input = textInput.slice(0,8000);
    const embedding = await createEmbedding(input,"text-embedding-ada-002");
    const highlightResult =  highlight.highlight(JSON.stringify(embedding),{ language: 'json' });
    const htmlString = highlightResult.value;
    var ret = renderCodeWrapper({ block: true, htmlString: htmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });
    return res.status(200).send(ret);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing feature extraction.',NLP_SVG));
  }
}
type SummarizationResponse = {summary:string}
export async function postSummarization(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/summarization';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    const maxLengthStr = req.body['max_length'];
    const minLengthStr = req.body['min_length'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for summarization. Upload a document or insert text.",NLP_SVG));
    }
    if(typeof maxLengthStr!=='string'||typeof minLengthStr!=='string') {
      return res.status(200).send(getErrorAlert("Could not recognie max length or min length.",NLP_SVG)); 
    }
    const max_length = parseInt(maxLengthStr);
    const min_length = parseInt(minLengthStr);
    if (!!!Number.isInteger(max_length)||!!!Number.isInteger(min_length)||max_length<min_length) {
      return res.status(200).send(getErrorAlert("Max length, min length, or both inputs are invalid.",NLP_SVG)); 
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const body = { text: text_to_use, max_length, min_length }
    const response = await postToPythonBackend('/python/summarization',body,15000) as SummarizationResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing summarization.',NLP_SVG));
  }
}  
type KeywordExtractionResponse = {keywords: string[]}
export async function postKeywordExtraction(req:Request,res:Response) {
  const view = 'partials/routes/various-nlp-tasks/keyword-extraction';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for keyword extraction. Upload a document or insert text.",NLP_SVG));
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    const inputs:string[] = [];
    var curr = 0;
    const MAX_LENGTH = 1500;
    while (curr < text_to_use.length) {
      var curr_len = MAX_LENGTH;
      var end_char = text_to_use[curr+curr_len]
      while (end_char!==' ' && curr_len>1000) {
        curr_len-=1;
        end_char = text_to_use[curr_len];
      }
      if (curr_len===1000) {
        inputs.push(text_to_use.slice(curr,curr+1000));
        curr+=1000;
      } else {
        inputs.push(text_to_use.slice(curr,curr+curr_len));
        curr+=curr_len;
      }
    }
    const body = { inputs }
    const response = await postToPythonBackend('/python/keyword-extraction',body,10000) as KeywordExtractionResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing keyword extraction.',NLP_SVG));
  }
}
export async function postOpenAITextModeration(req:Request,res:Response) {
  try {
    const textFile = req.file;
    const textInput = req.body['text-input'];
    if (!!!textFile && (typeof textInput !=='string' && textInput.length===0)) {
      return res.status(200).send(getErrorAlert("Unable to locate text input for keyword extraction. Upload a document or insert text.",NLP_SVG));
    }
    var text_to_use = '';
    if (textFile) {
      const mimetype = mime.extension(textFile.mimetype);
      if (!!!mimetype) {
        return res.status(200).send(getErrorAlert("Unable to locate input file type for uploaded file.",NLP_SVG));
      }
      const text_file = await convertTextFileType(textFile.buffer,'txt',mimetype,false);
      text_to_use = text_file as any as string;
    } else {
      text_to_use = textInput;
    }
    var curr = 0;
    const arr = [];
    while (curr < text_to_use.length&&curr < 16_000) {
      arr.push(text_to_use.slice(curr,curr+4000));
      curr+=4000;
    }
    const jsonResp = await moderateOpenAI(arr);
    const highlightResult =  highlight.highlight(JSON.stringify(jsonResp,null,' '),{ language: 'json' });
    const htmlString = highlightResult.value;
    var ret = renderCodeWrapper({ block: true, htmlString: htmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });
    return res.status(200).send('<div>'.concat(ret).concat('</div>'));
  } catch (err) {
    console.error(err);
    return res.status(200).send(getErrorAlert("Something went wrong getting the OpenAI moderation response for the posted text."))
  }
}
export function getVariousImageTasks(req:Request,res:Response) {
  try {
    const view = 'pages/projects/various-image-tasks';
    const title = "Various Image-Related AI Tasks";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Various Image-Related AI Tasks', item: '/projects/various-image-tasks', position: 3 }
    ];
    const description = "I want to create this page to test out various tasks that need to be accomplished with Machine learning models with respect to images. Some of these tasks include: Image Feature Extraction, Image Captioning, Image Safe Search, Text to Image Generation, Depth Estimation, Object Detection, Image Segmentation, Keypoint Detection";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-page",
          "text": "Why Create This Page"
      },
      {
          "id": "image-feature-extraction",
          "text": "Image Feature Extraction"
      },
      {
          "id": "image-captioning",
          "text": "Image Captioning"
      },
      {
          "id": "image-safe-search",
          "text": "Image Safe Search"
      },
      {
          "id": "tti-gen",
          "text": "Text to Image"
      },
      {
          "id": "depth-est",
          "text": "Depth Estimation"
      },
      {
          "id": "obj-detect",
          "text": "Object Detection"
      },
      {
          "id": "image-seg",
          "text": "Image Segmentation"
      },
      {
          "id": "key-detc",
          "text": "Keypoint Detection"
      },
      {
        "id": "ocr-task",
        "text": "Optical Character Recognition"
      },
      {
        id: "open-ai-moderation",
        text: "OpenAI Moderation API"
      }
    ]
    const keywords:string[] = ["Image Feature Extraction", "Image Captioning", "Image Safe Search", "Text to Image Generation", "Depth Estimation", "Object Detection", "Image Segmentation", "Keypoint Detection"];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/various-image-tasks', image: "https://image.storething.org/frankmbrown/7537ebac-c6eb-4b26-9d5a-4d1f347b0eda.jpg" };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Various Image Tasks page."});
  }
}
const ALLOWED_PIL_TYPES = new Set<string>([
  "blp",
  "bmp",
  "dds",
  "dib",
  "eps",
  "gif",
  "icns",
  "ico",
  "im",
  'jpg',
  "jpeg",
  "jpeg-2000",
  "msp",
  "pcx",
  "pfm",
  "png",
  "ppm",
  "sgi",
  "spider",
  "tga",
  "tiff",
  "webp",
  "xbm"
]);
/**
 * Convert image to Pillow compatible image
 * @param buffer 
 * @param extension 
 * @returns 
 */
export async function convertImageToPillowCompatable(buffer:Buffer,extension:string|false) {
  if (!!!extension||!!!ALLOWED_PIL_TYPES.has(extension.toLowerCase())) {
    const newBuffer = await executeWithArgument('magick',['convert','-','jpeg:-'],buffer);
    return newBuffer;
  }
  return buffer;
}
const IMAGE_ERROR_SVG = '<svg viewBox="0 0 576 512" title="images" focusable="false" inert tabindex="-1"><path d="M160 32c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160zM396 138.7l96 144c4.9 7.4 5.4 16.8 1.2 24.6S480.9 320 472 320H328 280 200c-9.2 0-17.6-5.3-21.6-13.6s-2.9-18.2 2.9-25.4l64-80c4.6-5.7 11.4-9 18.7-9s14.2 3.3 18.7 9l17.3 21.6 56-84C360.5 132 368 128 376 128s15.5 4 20 10.7zM192 128a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120V344c0 75.1 60.9 136 136 136H456c13.3 0 24-10.7 24-24s-10.7-24-24-24H136c-48.6 0-88-39.4-88-88V120z"></path></svg>';
type ImageFeatureExtractionResponse = { vector: number[] }
export async function postImageFeatureExtraction(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String }
    const response = await postToPythonBackend('/python/image-embed',body,5000) as ImageFeatureExtractionResponse;
    const embedding = response.vector;
    const highlightResult =  highlight.highlight(JSON.stringify(embedding),{ language: 'json' });
    const htmlString = highlightResult.value;
    var ret = renderCodeWrapper({ block: true, htmlString: htmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });
    return res.status(200).send(ret);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing feature extraction for image.',IMAGE_ERROR_SVG));
  }
}
type ImageSafeSearchResponse = { label: string, score: number }[]
export async function postImageSafeSearch(req:Request,res:Response) {
  const view = 'partials/routes/various-image-tasks/image-safe-search';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for safe search.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String }
    const response = await postToPythonBackend('/python/safe-search-image',body,7000) as ImageSafeSearchResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing safe search.',IMAGE_ERROR_SVG));
  }
}
type ImageCaptioningResponse = { caption: string }
export async function postImageCaptioning(req:Request,res:Response) {
  const view = 'partials/routes/various-image-tasks/caption';
  const viewOptions = {
    layout: false,
    response: {} as any
  }
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String }
    const response = await postToPythonBackend('/python/image-captioning',body,7000) as ImageCaptioningResponse;
    viewOptions.response = response;
    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing image captioning.',IMAGE_ERROR_SVG));
  }
}
type DepthEstimationResponse = { depth: [number,number][], image: string }
export async function postDepthEstimation(req:Request,res:Response) {
  const view = 'partials/routes/various-image-tasks/depth-estimation';
  const viewOptions = {
    layout: false,
    response: {} as any,
    imageHTML: ''
  }
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String }
    const response = await postToPythonBackend('/python/depth-estimation',body,10000) as DepthEstimationResponse;
    const highlightResp = highlight.highlight(JSON.stringify(response.depth),{ language: 'json' });
    viewOptions.response = highlightResp;

    const imageResponseBuffer = Buffer.from(response.image,'base64');
    const key = "frankmbrown/" + crypto.randomUUID() + ".png";
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    const [imageMetadata,imageURL] = await Promise.all([
      getImageMetadata(imageResponseBuffer),
      uploadImageObject(key,imageResponseBuffer,'png',{},user_id,ip_id)
    ]);
    const { width, height } = imageMetadata[0];
    const obj = getSizesFromWidthAndHeight(width,height);
    var widthToUse = 0;
    var heightToUse = 0;
    if (req.session.device?.desktop) {
      widthToUse = obj.widthDesktop;
      heightToUse = obj.heightDesktop;
    } else if (req.session.device?.tablet) {
      widthToUse = obj.widthTablet;
      heightToUse = obj.heightTablet;
    } else {
      widthToUse = obj.widthMobile;
      heightToUse = obj.heightMobile;
    }
    const imageHTML = `<img src="${imageURL}" width="${widthToUse}" height="${heightToUse}" style="width: ${widthToUse}px; height: ${heightToUse}px; aspect-ratio: auto ${obj.aspectRatioStr} !important; margin: 4px auto; max-width: 100%;" alt="Keypoint Detection Image" max-width: 100%; />`;
    viewOptions.imageHTML = imageHTML;

    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing depth estimation.',IMAGE_ERROR_SVG));
  }
}
type ObjectDetectionResponse = {
  results: {
    box: [number,number,number,number],
    label: string,
    score: number
  }[],
  image: string,
  label_to_color: {
    [label:string]: string
  }
}
export async function postObjectDetection(req:Request,res:Response) {
  const view = 'partials/routes/various-image-tasks/object-detection';
  const viewOptions = {
    layout: false,
    response: {} as any,
    imageHTML: '',
    label_to_color: [] as any[]
  }
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const threshold = req.body['threshold'];
    if (typeof threshold!=='string') {
      return res.status(200).send(getErrorAlert("Unable to find threshold.",IMAGE_ERROR_SVG))
    } else if (parseFloat(threshold)<0.1||parseFloat(threshold)>0.99) {
      return res.status(200).send(getErrorAlert("Inavlid Threshold!",IMAGE_ERROR_SVG));
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String, threshold: parseFloat(threshold) }
    const response = await postToPythonBackend('/python/object-detection',body,10000) as ObjectDetectionResponse;
    viewOptions.response = response.results;
    viewOptions.label_to_color = Object.entries(response.label_to_color);
    const imageResponseBuffer = Buffer.from(response.image,'base64');
    const key = "frankmbrown/" + crypto.randomUUID() + ".png";
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    const [imageMetadata,imageURL] = await Promise.all([
      getImageMetadata(imageResponseBuffer),
      uploadImageObject(key,imageResponseBuffer,'png',{},user_id,ip_id)
    ]);
    const { width, height } = imageMetadata[0];
    const obj = getSizesFromWidthAndHeight(width,height);
    var widthToUse = 0;
    var heightToUse = 0;
    if (req.session.device?.desktop) {
      widthToUse = obj.widthDesktop;
      heightToUse = obj.heightDesktop;
    } else if (req.session.device?.tablet) {
      widthToUse = obj.widthTablet;
      heightToUse = obj.heightTablet;
    } else {
      widthToUse = obj.widthMobile;
      heightToUse = obj.heightMobile;
    }
    const imageHTML = `<img src="${imageURL}" width="${widthToUse}" height="${heightToUse}" style="width: ${widthToUse}px; height: ${heightToUse}px; aspect-ratio: auto ${obj.aspectRatioStr} !important; margin: 4px auto; max-width: 100%;" alt="Keypoint Detection Image" max-width: 100%; />`;
    viewOptions.imageHTML = imageHTML;


    return res.status(200).render(view,viewOptions);
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing object detection.',IMAGE_ERROR_SVG));
  }
}
type ImageSegmentationResponse = {}[]
export async function postImageSegmentation(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    return res.status(200).send(getWarningAlert('I was not able to get this working yet. I am moving on.',IMAGE_ERROR_SVG));
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing image segmentation.',IMAGE_ERROR_SVG));
  }
}
type KeypointDetectionResponse = {
  image: string,
  valid_keypoints: [number,number][],
  valid_scores: number[]
}
export async function postKeypointDetection(req:Request,res:Response) {
  const view = 'partials/routes/various-image-tasks/keypoint-detection';
  const viewOptions = {
    layout: false,
    response: {} as any,
    imageHTML: ''
  }
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const base64String = newBuffer.toString('base64');
    const body = { image: base64String }
    const response = await postToPythonBackend('/python/keypoint-detection',body,10000) as KeypointDetectionResponse;
    viewOptions.response = response.valid_keypoints.map((obj,i) => {
      return { keypoint: `x: ${obj[0]}, y: ${obj[1]}`, score: response.valid_scores[i] }
    });
    const imageResponseBuffer = Buffer.from(response.image,'base64');
    const key = "frankmbrown/" + crypto.randomUUID() + ".png";
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    const [imageMetadata,imageURL] = await Promise.all([
      getImageMetadata(imageResponseBuffer),
      uploadImageObject(key,imageResponseBuffer,'png',{},user_id,ip_id)
    ]);
    const { width, height } = imageMetadata[0];
    const obj = getSizesFromWidthAndHeight(width,height);
    var widthToUse = 0;
    var heightToUse = 0;
    if (req.session.device?.desktop) {
      widthToUse = obj.widthDesktop;
      heightToUse = obj.heightDesktop;
    } else if (req.session.device?.tablet) {
      widthToUse = obj.widthTablet;
      heightToUse = obj.heightTablet;
    } else {
      widthToUse = obj.widthMobile;
      heightToUse = obj.heightMobile;
    }
    const imageHTML = `<img src="${imageURL}" width="${widthToUse}" height="${heightToUse}" style="width: ${widthToUse}px; height: ${heightToUse}px; aspect-ratio: auto ${obj.aspectRatioStr} !important; margin: 4px auto; max-width: 100%;" alt="Keypoint Detection Image" max-width: 100%; />`;
    viewOptions.imageHTML = imageHTML;

    return res.status(200).render(view,viewOptions);

  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert('Something went wrong performing keypoint detection.',IMAGE_ERROR_SVG));
  }
}
export async function postOpenAIImageModeration(req:Request,res:Response) {
  try {
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to find image for object detection.",IMAGE_ERROR_SVG))
    }
    const fileBuffer = file.buffer;
    const extension = mime.extension(file.mimetype);
    const newBuffer = await convertImageToPillowCompatable(fileBuffer,extension);
    const key = 'frankmbrown/'.concat(crypto.randomUUID()).concat(`.${extension}`);
    const {user_id,ip_id}=getUserIdAndIpIdForImageUpload(req);
    const url = await uploadImageObject(key,newBuffer,extension||'',{},user_id,ip_id)
    const jsonResp = await moderateOpenAI([{ type: "image_url", "image_url": { "url": url }}]);
    const highlightResult =  highlight.highlight(JSON.stringify(jsonResp,null,' '),{ language: 'json' });
    const htmlString = highlightResult.value;
    var ret = renderCodeWrapper({ block: true, htmlString: htmlString, language: 'json', relevance: 1, snackbarID:  `copy_html_code_snackbar_`.concat(crypto.randomUUID()) });
    return res.status(200).send('<div>'.concat(ret).concat('</div>'));
  } catch (error) {
    console.error(error);
    return res.status(200).send(getErrorAlert("Something went wrong with getting the OpenAI moderation response for the image!"));
  }
}
export async function getAiChatInformationOnModels(req:Request,res:Response) {
  const view = "pages/projects/information-on-models"
  const title = "Information on Chat Models"
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: 'AI Chat', item: '/projects/chat', position: 3 },
    { name: 'Information on Chat Models', item: '/projects/chat/information-on-models', position: 4 },
  ]
  const description = "I wanted to create this page to compare this pricing / capabilities of different AI models, research how much it would cost to host an open source model, and get a better sense of what Large Language Models are out there. "
  const tableOfContents:TableOfContentsItem[] = [
    {
        "id": "enterprise-models",
        "text": "Enterprise Models"
    },
    {
        "id": "openai-sect",
        "text": "OpenAI"
    },
    {
        "id": "goog-sect",
        "text": "Google"
    },
    {
        "id": "anthrop-sect",
        "text": "Anthropic"
    },
    {
        "id": "hosted-llama",
        "text": "Hosted Llama"
    },
    {
      "id": "how-apis-work",
      "text": "How These APIs Work"
    },
    {
        "id": "hosting-own-model",
        "text": "Hosting Own Model"
    }
  ];
  const image = "https://image.storething.org/frankmbrown/4d670e36-ffb7-4ff1-87a8-b7e514120916.png";
  const keywords:string[] = [];
  const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/chat/information-on-models', image }
  const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
}
export function getAiChat(req:Request,res:Response) {
  try {
    const view = 'pages/projects/chat';
    const title = "AI Chat";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'AI Chat', item: '/projects/chat', position: 3 }
    ];
    const description = "I want to create this page to test out a simple AI chat system. On this page, you can chat with an AI chatbots similar to other services on the internet. I want to get a good idea of how to handle chatbots in a database and what the prices would look like. Good text generation models are cheaper to urn through an external service API call, like OpenAI's chat completion API or Google's gemini model, than by running the model on a rented GPU. At least, this is true for sites that don't get much traffic.";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-page",
          "text": "Why Create This Page"
      }
    ];
    if (req.session.auth&&Number(req.session.auth.level)>=1) {
      tableOfContents.push({"id": "compare-chat-completion","text": "Information on Chat Completion Models"},{"id": "chat-wrapper","text": "AI Chat"});
    }
    const keywords:string[] = [];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/chat', image: "https://image.storething.org/frankmbrown/7537ebac-c6eb-4b26-9d5a-4d1f347b0eda.jpg" };
    const requiredVariables = getRequiredVariables(req,SEO);
    const chat_id = 'chat_'.concat(crypto.randomUUID());
    
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the AI Chat page."});
  }
} 
/**
 * 
 * );
 * @param req 
 * @param res 
 * @returns 
 */
export async function getSenseOfStyle(req:Request,res:Response) {
  try {
    const view = 'pages/projects/sense-of-style';
    const title = "Sense of Style";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: 'Sense of Style', item: '/projects/sense-of-style', position: 3 }
    ];
    const description = "I wanted to get a sense of how different sizes looked on different devices. While you could do this by using the developer console, I don't think the developer console beats actually using the device that you are targeting to see how certain styles look.";
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-page",
          "text": "Why Create This Page"
      },
      {
        id: "style-section",
        text: "Style Section"
      },
      {
        id: "notes-on-style",
        text: "Notes on Style"
      }
    ];
    const keywords:string[] = [];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/projects/sense-of-style', image: "https://image.storething.org/frankmbrown%2F78a3fe81-e9c3-4135-91e5-8376473909ae.jpg" };
    const requiredVariables = getRequiredVariables(req,SEO);
    const senseOfStyleRespnse = await getDatabase().query(`SELECT html, css, js FROM sense_of_style ORDER BY date_created DESC;`);
    const html = senseOfStyleRespnse.rows.length?senseOfStyleRespnse.rows.map((obj) => {
      return `<div class="mt-2">${obj.html}<style>${obj.css}</style><script nonce="${req.session.jsNonce}">(() => {${obj.js}})()</script></div>`
    }).join(''):getInfoAlert("There are currently no sense of style posts.",undefined,false);

    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      posts_html: html
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Sense of Style page."});
  }
} 
export async function postSenseOfStyle(req:Request,res:Response) {
  try {
    const html = req.body['html-editor-wrapper'];
    const css = req.body['css-editor-wrapper-2'];
    const js = req.body['js-editor-wrapper'];
    if (typeof html!=='string'||!!!html.length) {
      return res.status(200).send(getErrorAlert("Unable to locate HTML string in POST request."))
    }
    const dom = new jsdom.JSDOM(html);
    var innerText = dom.window.document.body.textContent;
    if (!!!innerText) {
      return res.status(200).send(getErrorAlert("Unable to locate innerText in POST request."))
    }
    innerText = innerText.replace(/\s+|\n/,' ');
    const embedding = await createEmbedding(innerText);
    await getDatabase().query(`INSERT INTO sense_of_style (html,css,js,embedding,document,date_created) VALUES ($1,$2,$3,$4,$5,$6);`,[html,css||null,js||null,pgvector.toSql(embedding),innerText,TIME.getUnixTime()]);
    const reloadPage = `<script nonce="${req.session.jsNonce}">(()=>{setTimeout(() => {window.location.reload()},500)})()</script>`
    return res.status(200).send(getSuccessSnackbar('Successfully added sense_of_style note!').concat(reloadPage));
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Unable to add sense of style."));
  }
}


const web_api_page_to_toc = {"a-b":[{"id":"id_564cf02f-591f-4809-aba8-c1ce3f7f0619","text":"Attribution Reporting API"},{"id":"id_61f29677-4282-4d98-b4bb-fecaf6fa3f6c","text":"Audio Output Devices API"},{"id":"id_ef5398b6-e7f2-4cf0-ac57-53dfbffd587a","text":"Background Fetch API"},{"id":"id_9c20226c-bbf6-4887-9d26-3162b5c8229a","text":"Background Sync"},{"id":"id_a94d2e41-e438-4118-a3f3-88477167e463","text":"Background Task"},{"id":"id_481eb64c-4b98-499c-a0a9-44cd121707e5","text":"Badging API"},{"id":"id_37ceea62-0d02-46e5-83f7-491ec2a52726","text":"Barcode Detection API"},{"id":"id_4258547d-b48e-49b3-b76b-e31ed396ac02","text":"Battery API"},{"id":"id_54d7e491-9fcc-4787-8762-9a52643bf525","text":"Beacon"},{"id":"id_59c59b86-6286-40ca-b190-6cdd2ebd4c61","text":"Bluetooth API"},{"id":"id_2fc87a08-de9c-4564-8871-0223ca3e56f0","text":"Broadcast Channel API"}],"c-c":[{"id":"id_dd2ca3d0-459c-45be-895c-1d851d974e36","text":"CSS Font Loading API"},{"id":"id_6b616a3a-4280-4d44-a2b7-ee665751d99f","text":"CSS Painting API"},{"id":"id_f929b3e9-df5e-453f-84d3-26e333c321ab","text":"CSS Properties and Values API"},{"id":"id_6a52f17c-cf69-4f79-b1c5-c7d3c8568059","text":"CSS Typed Object Model API"},{"id":"id_7536ed2f-dac1-4ef4-9c45-ada0b24b04c9","text":"CSSOM"},{"id":"id_32f310ea-c7ed-4c6c-a1e7-753912974c89","text":"Canvas API"},{"id":"id_a5dc2bb2-e750-4571-a9a2-d47856edbc3b","text":"Channel Messaging API"},{"id":"id_fc705152-4238-47e4-8838-ec9490d57f8e","text":"Clipboard API"},{"id":"id_018e5bb9-7fdb-4bd5-9433-c83d1ef754e5","text":"Compression Streams API"},{"id":"id_4cdcc900-355c-4edf-aafe-7ad9f768d635","text":"Compute Pressure API"},{"id":"id_b886c295-4d8e-49ad-a371-ae7f4b5ff0f5","text":"Console API"},{"id":"id_26036926-711c-40f1-b4ca-b36a09d20c48","text":"Contact Picker API"},{"id":"id_145c34e9-e63a-4930-b6c2-67426df168a3","text":"Content Index API"},{"id":"id_f89cd165-e5a9-4f77-bd2c-f7d4a1b8097e","text":"Cookie Store API"},{"id":"id_4cb38d98-4dce-442e-9716-1dbccc1b3a5d","text":"Credential Management API"}],"d-f":[{"id":"id_8f1a475d-65c3-4f01-b2f6-9da7ef52abd1","text":"Device Memory API"},{"id":"id_421475b2-9d5b-48c8-bf2d-02c4431dfcf6","text":"Device Orientation Event"},{"id":"id_2eafbea6-6dce-4347-b860-4472120ff822","text":"Document Picture-in-Picture API"},{"id":"id_2ed75961-c2e9-4f9b-907e-bf3ca736eb35","text":"EditContext API"},{"id":"id_3be219c5-1514-45d6-8c06-08f128aaaf61","text":"Encoding API"},{"id":"id_bf137742-2e05-4ef9-aff6-97101aa684e9","text":"Encrypted Media Extension"},{"id":"id_2c91e484-eb46-41fb-8e69-0983baffcc12","text":"EyeDropper API"},{"id":"id_5440c85f-4bf5-43b1-8f23-9393ad420681","text":"FedCM API"},{"id":"id_c71edbc9-9e29-49bf-a541-a56215231ee1","text":"Fenced Frame API"},{"id":"id_00dac3a3-11a5-4afa-88dd-4a3d29e45502","text":"Fetch API"},{"id":"id_dd8173fd-a70d-4d61-86ab-646403ba91ca","text":"File API"},{"id":"id_a688b1fb-6008-411d-80cd-49b816b80904","text":"File System API"},{"id":"id_27297af6-45d3-45ed-ba26-73969e154297","text":"File and Directory Entries API"},{"id":"id_b9d91fef-caac-4179-8336-6ee06f3c1277","text":"Force Touch Events"},{"id":"id_fd24b5e4-56ae-4d0b-be7f-0c158d67baee","text":"Fullscreen API"}],"g-i":[{"id":"id_4c5d3f1f-f42e-4db3-aa09-360c8b8fa225","text":"Geolocation API"},{"id":"id_80ae5d2d-7cc1-4218-8fac-78d10d73e2a9","text":"Geometry Interface"},{"id":"id_508db156-5fd1-4d0d-b82d-e29bfa9a4052","text":"HTML DOM"},{"id":"id_66b1c49a-c7cc-48b1-b241-385fadf1877c","text":"HTML Drag and Drop API"},{"id":"id_85a038f3-027b-4dc0-a4aa-acb804793209","text":"History API"},{"id":"id_004b3d4c-f348-4b4d-84bb-953f8823f30c","text":"Houdini API"},{"id":"id_f3fe843e-2f6d-4ada-991c-ee3d48f4221a","text":"Idle Detection API"},{"id":"id_a03d8d87-2e5f-4ef6-a654-dc60a0a58a1e","text":"Image Capture API"},{"id":"id_d25022aa-d515-471e-a252-cc43e9c81b15","text":"IndexedD"},{"id":"id_1172ecac-64ab-41f3-a5c6-6467516ba7b9","text":"Ink API"},{"id":"id_e14cefe5-0e82-4c10-aa39-f67c1bf21b8b","text":"Input Device Capabilities API"},{"id":"id_83a9e09f-c0f1-4e08-ba04-95f0e33d590f","text":"Insertable Streams for MediaStreamTrack API"},{"id":"id_2d2447eb-d6de-4b3c-a4aa-130a75d0a78f","text":"Intersection Observer API"},{"id":"id_6f6ed247-352b-42c0-a540-50762eab4e59","text":"Invoker Commands API"}],"k-p":[{"id":"id_b2177272-07f5-4dc5-b02e-0b5d716658aa","text":"Launch Handler API"},{"id":"id_89363f2b-1ea6-46ff-875b-37b83f14b2fb","text":"Local Font Access API"},{"id":"id_ffbf293e-5f7b-4163-ad83-90e0ddbccb3e","text":"Media Capabilities API"},{"id":"id_f71b3fbe-8a09-47f5-b13c-2412466814bb","text":"Media Capture and Stream"},{"id":"id_d8ca6f4f-7929-4fe8-8501-fee6f55ccc91","text":"Media Session API"},{"id":"id_42bfbc06-9918-4a6c-883b-5707f74c1308","text":"Media Source Extensions"},{"id":"id_20cb7f98-6d2c-4bbc-89a2-2b190b5656bb","text":"MediaStream Recording"},{"id":"id_a84145f6-aa5b-45d0-a401-ba5776008561","text":"Navigation API"},{"id":"id_3abaac34-5fcc-434d-b675-5a900df354da","text":"Network Information API"},{"id":"id_b8ac502c-002b-4d82-9c6b-90e7cae0c04c","text":"Page Visibility API"},{"id":"id_78380e72-abb7-4d5b-bbb0-916ba09c1842","text":"Payment Handler API"},{"id":"id_30b12b8c-516d-4b96-a8bf-3bc26168b41a","text":"Payment Request API"},{"id":"id_15dd0019-9013-48c4-8681-9a554bdf6a7f","text":"Performance API"},{"id":"id_bec41f11-075b-4781-b8e6-06d4025f0328","text":"Periodic Background Sync"},{"id":"id_ca43d1a3-9518-435b-88b6-715216e98bc9","text":"Permissions API"},{"id":"id_bd82e069-55b1-4646-97a3-0f2eb5429e99","text":"Picture-in-Picture API"},{"id":"id_c581155a-5ba7-452c-838a-8eb8e27e0999","text":"Pointer Event"},{"id":"id_b1e26148-453a-4c0c-adb1-a258d4039e62","text":"Pointer Lock API"},{"id":"id_9fd51ee4-4f94-435f-baed-41709c330423","text":"Popover API"},{"id":"id_3c04e2ed-d807-42de-8655-7befbce4a5f5","text":"Presentation API"},{"id":"id_2c653ac0-f501-4f2e-8a0e-2464c0e39c35","text":"Prioritized Task Scheduling API"},{"id":"id_5c44d8e6-0f3f-46b4-a82f-2a90530135e9","text":"Push API"}],"r-s":[{"id":"id_dc6a9d1f-bd49-4d65-8278-2978a90b0787","text":"Reporting API"},{"id":"id_5d792943-1464-4e8b-a3ae-b27afe5f3320","text":"Resize Observer API"},{"id":"id_e21593d5-2072-4c9a-aace-bea0c58460f2","text":"SVG"},{"id":"id_31ed5d09-32d8-4adf-ada2-f43bf7ff70a9","text":"Screen Capture API"},{"id":"id_e0f1a3b4-db96-4f6d-b77c-51bcc602d701","text":"Screen Orientation API"},{"id":"id_5928b96c-3266-4c0b-8fbd-901a18038462","text":"Screen Wake Lock API"},{"id":"id_bc07b273-8368-4289-8297-63fbb7d5f0f8","text":"Selection API"},{"id":"id_49d13086-5c0d-4ffe-a4c4-b2ad1d123bef","text":"Sensor API"},{"id":"id_3f21b529-ac12-4825-af6b-ec3a34fa65f2","text":"Server Sent Event"},{"id":"id_7e908d0d-9038-43c6-854e-73e4e5662d21","text":"Service Workers API"},{"id":"id_9d3676bf-18b2-4f50-a008-36f9350d34ea","text":"Shared Storage API"},{"id":"id_b6e05d3c-c81d-4b38-bcbd-b1bf5320977f","text":"Speculation Rules API"},{"id":"id_5ef4d87d-b8a5-4063-9955-a43b035d61b3","text":"Storage"},{"id":"id_0c01d99a-a5aa-42cd-9e9e-60c9f8e8302b","text":"Storage Access API"},{"id":"id_75426113-2d21-4181-b713-73be5b52463a","text":"Stream"}],"t-v":[{"id":"id_1363b4dd-afee-43e1-8677-b084d81ffb15","text":"Touch Event"},{"id":"id_f02144df-ebc6-4239-bd4d-0cd4395b44ae","text":"Trusted Types API"},{"id":"id_cb37e588-0939-48cd-bb8d-6a8d43ea8cde","text":"UI Event"},{"id":"id_2a5c7cf0-2e8b-4a94-9884-564eaa488e5d","text":"URL API"},{"id":"id_99de1b9b-ad06-428e-a099-095de6b55ebc","text":"URL Fragment Text Directive"},{"id":"id_7178ba3b-3559-4e77-855e-b801389c5728","text":"URL Pattern API"},{"id":"id_3d2081d4-aa4b-46e4-811f-ca5c4eecfc9d","text":"User-Agent Client Hints API"},{"id":"id_294db2d4-5876-4101-b173-52499f80dd47","text":"Vibration API"},{"id":"id_0708c778-47a8-4577-a037-8ad3ec606001","text":"View Transitions API"},{"id":"id_86af3660-9bb4-4b69-8fb2-e4b76d64db04","text":"VirtualKeyboard API"},{"id":"id_6abb3ecd-dbda-47d1-901f-117e58e8ad70","text":"Visual Viewport"}],"w-w":[{"id":"id_3ad89c25-ab91-4b3e-86df-4507e4405ef2","text":"Web Audio API"},{"id":"id_c55ef7ba-8cba-454a-916b-320a1fe6550f","text":"Web Authentication API"},{"id":"id_294a11b2-e797-4163-9b4c-a50cabca9927","text":"Web Component"},{"id":"id_0bec29ad-a1cc-424a-9bec-5084d3735b9d","text":"Web Crypto API"},{"id":"id_b68b41ab-d38d-4db6-b3fb-2d052815277b","text":"Web Locks API"},{"id":"id_92fa3688-cb56-4ebd-a728-d5e2c5941837","text":"Web MIDI API"},{"id":"id_b5b052c0-9559-4d46-9b91-7d30cf1d5b1a","text":"Web NFC API"},{"id":"id_c916d6f0-0836-4c10-9468-86590c7bb9b7","text":"Web Notification"},{"id":"id_cb3896d4-b29f-42fb-a7eb-b4825315924e","text":"Web Serial API"},{"id":"id_c13d1bb9-7b9a-40ab-98ad-8b1dc2b73eca","text":"Web Share API"},{"id":"id_dfc8473f-6ea3-4663-bb3b-4d16d445c8f2","text":"Web Speech API"},{"id":"id_9a5e3512-c9a6-44a1-adc5-cbdef2238276","text":"Web Storage API"},{"id":"id_6fed4f62-2721-4cfc-af8f-7d40b989a165","text":"Web Workers API"},{"id":"id_a18f531c-73bd-4581-bd53-eec96621fc8b","text":"WebCodecs API"},{"id":"id_936af3a5-f047-4c13-9bba-07b949d1b58d","text":"WebG"},{"id":"id_2d3de915-5d70-4589-b6f5-896c944e4f10","text":"WebGPU API"},{"id":"id_d1868dcb-fd5b-4b87-b56e-c891d83b34c5","text":"WebHID API"},{"id":"id_701e28fc-946d-4785-8cc0-ab893240dbc8","text":"WebOTP API"},{"id":"id_399661b4-8c6d-4645-9dd3-7740412a6b7a","text":"WebRT"},{"id":"id_23f6ef10-d859-4fdd-a305-8b00e8fa100a","text":"WebSockets API"},{"id":"id_c8603bdd-a02b-42f0-b202-3f576386b897","text":"WebTransport API"},{"id":"id_1fbe067d-773a-4d1c-8025-266424a9d762","text":"WebUSB API"},{"id":"id_ab97cd4d-6720-412f-ba22-07120ac765c2","text":"WebVR API"},{"id":"id_ecd9bde9-f559-4216-8e05-29658c602e7a","text":"WebVT"},{"id":"id_b703c103-1d22-4869-bf52-6a93e964ed94","text":"WebXR Device API"},{"id":"id_bae33bc8-5b82-4bbe-9334-afda9e3ae7d4","text":"Window Controls Overlay API"},{"id":"id_a9ab4c3d-aa78-49b1-8560-83c99b184982","text":"Window Management API"}]};
const web_api_images = {
  'a-b': 'https://image.storething.org/frankmbrown%2F66897e21-6872-48b5-a3ee-5e741225120e.jpg',
  'c-c': 'https://image.storething.org/frankmbrown%2F580af7bb-9e59-4811-b4a5-7550a95f9fa1.jpg',
  'd-f': 'https://image.storething.org/frankmbrown%2Fc7d7357b-6ce0-4f40-a237-9b79e2ab69ec.jpg',
  'g-i': 'https://image.storething.org/frankmbrown%2Fa3e197fd-aa36-49a0-96b0-c6323d9822ee.jpg',
  'k-p': 'https://image.storething.org/frankmbrown%2F753bba92-c729-4a93-bf67-51bbd4d6031d.jpg',
  'r-s': 'https://image.storething.org/frankmbrown%2F54467e6e-1166-4a23-a8cd-b391475ff361.jpg',
  't-v': 'https://image.storething.org/frankmbrown%2F96bb396a-99c9-4492-b04a-8d0c9e6d6bb7.jpg',
  'w-w': 'https://image.storething.org/frankmbrown%2F27d0131f-44a1-4256-854f-ffb0c46087f0.jpg'
} as const;
type WebApiPage = 'a-b'|'c-c'|'d-f'|'g-i'|'k-p'|'r-s'|'t-v'|'w-w';
const ALLOWED_API_PAGES = new Set<WebApiPage>(['a-b','c-c','d-f','g-i','k-p','r-s','t-v','w-w']);
const validAPIPage = (a: any):a is WebApiPage => {
  return ALLOWED_API_PAGES.has(a);
}


export async function getWebAPIs(req:Request,res:Response) {
  try {
    const view = "pages/projects/web-apis";
    const { page } = req.params;
    if (!!!validAPIPage(page)) {
      return redirect(req,res,'/projects',500,{ severity: "error", message: "The requested Web API page does not exist."});
    }
    const image = web_api_images[page];
    const webApiPage:WebApiPage = page as WebApiPage;
    const toc = web_api_page_to_toc[webApiPage];
    const description = "I created this page because when implementing Notifications and the Service Worker for this website, I came across the <mdn web docs page on Web APIs, and I noticed how many Web APIs I haven't tried out that looked interesting. I am going to use this page to learn more about the Web APIs and implement them to test their functionality. This page includes the ".concat(toc.slice(0,toc.length-1).map((o)=>o.text).join(', ').concat(', and ').concat(String(toc.at(-1)?.text)).concat(' APIs.'));
    const tableOfContents: TableOfContentsItem[] = [
      {
          "id": "why-create-page",
          "text": "Why Create This Page"
      },
      {
        "id": "explore-web-apis",
        "text": "Navigate Web APIs"
      },
      ...toc
    ];
    const formattedLetterRange = page.split('-').map((s) => s.toUpperCase()).join('-');
    const title = 'Web APIs '.concat(formattedLetterRange).concat(' Page');
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: `/projects/web-apis/${page}`, position: 3 }
    ];
    const keywords:string[] = ["Web APIs"].concat(toc.map((o)=>o.text));
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: `/projects/web-apis/${page}`, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    const audio_1 = getTestAudioHTML(req);
    const video_1 = getTestVideoHTML(req);
    return res.status(200).render(view,{ 
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      api_page: page,
      audio_1,
      video_1
    });
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Web APIs project page."});
  }
}
type TableConversionOutput = 'csv'|'json'|'markdown'|'html'|'rte';
const VALID_TABLE_CONVERSION_OUTPUT = new Set<TableConversionOutput>(['csv','json','markdown','html','rte']);
const TABLE_CONVERSION_OUTPUT_TO_EXTENSION = {
  'csv': "csv",
  'json': "json",
  'markdown': "md",
  'html': "html",
  'rte': "html"
}
const TABLE_CONVERSION_OUTPUT_TO_CONTENT_TYPE = {
  'csv': "test/csv",
  'json': "application/json",
  'markdown': "text/markdowm",
  'html': "text/html",
  'rte': "text/html"
}

async function convertStringArr(req:Request,stringArr:string[][],input_type:'html'|'markdown'|'other',output_type:TableConversionOutput,header_row:boolean=true) {
  switch (output_type) {
    case 'csv': {
      var str = '';
      for (let i = 0; i < stringArr.length; i++) {
        for (let j = 0; j < stringArr[i].length; j++) {
          str += '"' + stringArr[i][j].replace(/"/g,'""')
          if (j!==stringArr[i].length-1) str+=','
        }
        str += `
`;
      }
      return str;
    } 
    case 'html': {
      var str = '<div class="table-wrapper"><table celspacing="0">'
      var start = 0;
      if (header_row) {
        str+='<thead><tr>'
        for (let i=0; i < stringArr[0].length;i++) {
          str += '<th scope="col">' + escapeHTML(stringArr[0][i]).trim() + "</th>";
        }
        str+='</tr></thead>'
        start+=1;
      }
      str+='<tbody>'
      for (let i=start;i<stringArr.length;i++) {
        str+='<tr>';
        for (let j=0;j<stringArr[i].length;j++) {
          str+='<td>'  
          str+=stringArr[i][j].trim();
          str+='</td>'
        }
        str+='</tr>'
      }
      str+='</tbody>'
      str+='</table></div>'
      return str;
    }
    case 'json': {
      const obj:{[key: string]: string[]} = {};
      for (let i=0; i<stringArr.length;i++) {
        obj["i"] = stringArr[i];
      }
      return JSON.stringify(obj,null,' ');
    }
    case 'markdown': {
      var str = ''
      for (let i=0;i<stringArr.length;i++) {
        for (let j=0;j<stringArr[i].length;j++) {
          if (input_type==="html") {
            const md = (await executeWithArgument('pandoc',['-t','markdown'],Buffer.from(stringArr[i][j]))).toString('utf-8');
            if (j===0) str += '| ' + md.trim() + " |";
            else str += ' ' + md.trim() + ' |';
          } else {
            if (j===0) str += '| ' + stringArr[i][j].trim() + " |";
            else str += '  ' + stringArr[i][j].trim() + ' |'
          }
        }
        if (i===0&&header_row) {
          str+=`\n`; 
          for (let j=0;j<stringArr[0].length;j++) {
            if (j===0) str += '| ' + '---' + ' |';
            else str += ' ' + '---' + ' |';
          }
          str+=`\n`; 
        } else {
          str += `\n`;
        }
      }
      return str;
    }
    case 'rte': {
      var str = '<div class="table-wrapper"><table celspacing="0">'
      var start = 0;
      if (header_row) {
        str+='<thead><tr>'
        for (let i=0; i < stringArr[0].length;i++) {
          str += '<th scope="col">' + stringArr[0][i].trim() + "</th>";
        }
        str+='</tr></thead>'
        start+=1;
      }
      str+='<tbody>'
      for (let i=start;i<stringArr.length;i++) {
        str+='<tr>';
        for (let j=0;j<stringArr[i].length;j++) {
          str+='<td>'  
          str+=stringArr[i][j].trim();
          str+='</td>'
        }
        str+='</tr>'
      }
      str+='</tbody>'
      str+='</table></div>'
      return str;
    }
    default: {
      throw new Error("Unrecognized type.");
    }
  }
}

async function uploadtableConversion(str:string,format:TableConversionOutput) {
  const extension = TABLE_CONVERSION_OUTPUT_TO_EXTENSION[format];
  const contentType = TABLE_CONVERSION_OUTPUT_TO_CONTENT_TYPE[format];
  const key = "frankmbrown/" + crypto.randomUUID() + "." + extension;
  await uploadFileGeneral(key,Buffer.from(str),"text",contentType);
  const downnload_file = getDownloadFileUrl('text',key);
  return downnload_file;
}

async function returnTableConversion(req:Request,res:Response,retStr:string|string[],outputFormat:TableConversionOutput) {
  var strToUse:string;
  if (Array.isArray(retStr)) {
    strToUse = retStr.join('\n'); 
  } else {
    strToUse = retStr;
  }
  const download_url = await uploadtableConversion(strToUse,outputFormat);
  const resp = `<div class="flex-row justify-center align-center">
    <a class="button icon-text filled info medium" download href="${download_url}" >
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="Download"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path></svg>
      DOWNLOAD OUTPUT
    </a>
  </div>`;
  return res.status(200).send(resp);
}

export async function postTableConversionFile(req:Request,res:Response) {
  try {
    const outputFormat = String(req.body['output-format']);
    if (!!!VALID_TABLE_CONVERSION_OUTPUT.has(outputFormat as any)) {
      return res.status(200).send(getErrorAlert("Invalid output format selected for the table conversion.",COMMON_SVGS.TABLE,false));
    }
    const file = req.file;
    if (!!!file) {
      return res.status(200).send(getErrorAlert("Unable to locate input file for the table conversion.",COMMON_SVGS.TABLE,false));
    }
    const includeHeadingRow = Boolean(req.body['include-heading-row']==="on");
    const { json, fileType } = await generateJsonFromCsvExcel(file);
    const stringMatrix = parseTableJSON(json,fileType==="excel",true);
    const retStr = await convertStringArr(req,stringMatrix,'other',outputFormat as TableConversionOutput,includeHeadingRow);
    return returnTableConversion(req,res,retStr,outputFormat as any);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting the table provided in the file.",COMMON_SVGS.TABLE,false));
  }
}
const input_format_types = new Set(['html','markdown','csv']);
export async function postTableConversionText(req:Request,res:Response) {
  try {
    const outputFormat = String(req.body['output-format']);
    if (!!!VALID_TABLE_CONVERSION_OUTPUT.has(outputFormat as any)) {
      return res.status(200).send(getErrorAlert("Invalid output format selected for the table conversion.",COMMON_SVGS.TABLE,false));
    }
    const text = req.body['table-text'];
    const input_format = req.body['text-input-type'];
    console.log(input_format);
    if (!!!input_format_types.has(input_format)) {
      return res.status(200).send(getErrorAlert("Unable to recognize input format type.",COMMON_SVGS.TABLE,false));
    }
    if (!!!text.length) {
      return res.status(200).send(getErrorAlert("Input text must be at least one character long.",COMMON_SVGS.TABLE,false));
    }
    if (input_format==="csv") {
      const json = await new Promise<{[key: string]: string}[]>((resolve,reject) => {
        csvtojsonV2()
        .on('error',(err) => {
          console.error('error');
          return res.status(200).send(getErrorAlert("Something went wrong parsing the csv data.",COMMON_SVGS.TABLE,false));
        })
        .fromString(text)
        .then((csvJSON) => {
          resolve(csvJSON);
        })
      }); 
      const arr = parseTableJSON(json,false,true);
      const retStr = await convertStringArr(req,arr,'other',outputFormat as TableConversionOutput,true);
      return returnTableConversion(req,res,retStr,outputFormat as any);
    } else if (input_format==="html") {
      const dom = new jsdom.JSDOM(text);
      const tables = Array.from(dom.window.document.querySelectorAll('table')) as HTMLTableElement[];
      if (!!!tables.length) {
        return res.status(200).send(getErrorAlert("Unable to find any tables in the provided HTML.",COMMON_SVGS.TABLE,false));
      }
      const table = tables[0];
      const arr = parseHTMLTable(table); 
      const retStr = await convertStringArr(req,arr,'html',outputFormat as TableConversionOutput,true);
      return returnTableConversion(req,res,retStr,outputFormat as any);
    } else if (input_format==="markdown") {
      const html = await executeWithArgument('pandoc',['-t','html'],Buffer.from(text));
      const dom = new jsdom.JSDOM(html);
      const tables = Array.from(dom.window.document.querySelectorAll('table')) as HTMLTableElement[];
      if (!!!tables.length) {
        return res.status(200).send(getErrorAlert("Unable to find any tables in the provided markdown.",COMMON_SVGS.TABLE,false));
      }
      const table = tables[0];
      const arr = parseHTMLTable(table);
      const retStr = await convertStringArr(req,arr,'markdown',outputFormat as TableConversionOutput,true);
      return returnTableConversion(req,res,retStr,outputFormat as any);
    } else {
      return res.status(200).send(getErrorAlert("Unable to recognize input format type.",COMMON_SVGS.TABLE,false));
    }
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting the table provided in the text input.",COMMON_SVGS.TABLE,false));
  }  
}
export async function postTableConversionUrl(req:Request,res:Response) {
  try {
    const outputFormat = String(req.body['output-format']);
    if (!!!VALID_TABLE_CONVERSION_OUTPUT.has(outputFormat as any)) {
      return res.status(200).send(getErrorAlert("Invalid output format selected for the table conversion.",COMMON_SVGS.TABLE,false));
    }
    const url = req.body['url-of-table-page'];
    try {
      new URL(url);
    } catch (e) {
      return res.status(200).send(getErrorAlert("Invalid URL - unable to get tables from provided URL.",COMMON_SVGS.TABLE,false));
    }
    const html = await axios.get(url,{headers:{'Accept':'text/html'}, timeout: 5000 });
    const dom = new jsdom.JSDOM(html.data);
    const tables = Array.from(dom.window.document.querySelectorAll('table')) as HTMLTableElement[];
    if (!!!tables.length) {
      return res.status(200).send(getErrorAlert("Unable to find any tables in the provided URL",COMMON_SVGS.TABLE,false));
    }
    const tables_arrays:(string[][])[] = []
    for (let table of tables) {
      const arr = parseHTMLTable(table);
      tables_arrays.push(arr);
    }
    const retStrArr = [];
    for (let table of tables_arrays) {
      const retStr = await convertStringArr(req,table,'html',outputFormat as TableConversionOutput,true);
      retStrArr.push(retStr);
    }
    return returnTableConversion(req,res,retStrArr,outputFormat as any);
  } catch (e) {
    console.error(e);
    return res.status(200).send(getErrorAlert("Something went wrong converting the HTML tables for the given URL.",COMMON_SVGS.TABLE,false));
  }
}

export async function getTableConversionPage(req:Request,res:Response) {
  try {
    const view = 'pages/projects/table-conversion';
    const title = 'Table Conversion';
    const image = 'https://image.storething.org/frankmbrown%2F0a35f7b7-c5cc-4036-9a6a-5e1f17bf7829.jpg'
    const description = " It is sometimes frustrating to convert HTML tables between formats, which is why I am creating this page. Using the forms below, you can either upload a CSV / Excel file and convert it to another format, upload some text, specify what format the text is in, and convert the tabular representation into another format, or insert a URL, get the tables from the page, and convert it to a different format."
    const path = "/projects/table-conversion";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = ["Chart","Bokeh","Python","mpld3","file"];
    const tableOfContents:TableOfContentsItem[] = [
      { id: "why-create-this-page", text: "Why Create this Page" },
      { id: "file-to-table", text: "File to Table" },
      { id: "text-to-table", text: "Text to Table" },
      { id: "url-to-table", text: "URL to Table" },
    ];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })

  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the table conversion project page."});
  }
}
export async function getCreateChartPage(req:Request,res:Response) {
  try {
    const view = 'pages/projects/create-a-chart';
    const title = 'Create a Chart';
    const image = 'https://image.storething.org/frankmbrown%2Fcffc13e1-530d-4d02-b90a-769d43f489d6.jpg';
    const description = "I am creating this page to make it easier to make charts using Bokeh or mpld3. I want to be able to easily create charts with these two libraries and either: copy the chart or save the chart for use in matplotlib editor.";
    const path = "/projects/create-a-chart";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = ["Chart","Bokeh","Python","mpld3","file"];
    const tableOfContents:TableOfContentsItem[] = [
      { id: "why-create-this-page", text: "Why Create this Page" },
      { id: "upload-files", text: "Upload Files" },
      { id: "code-editor", text: "Python Code Editor" },
      { id: "output", text: "Output" },
    ]
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Create a Chart project page."});
  }
}

export function getTestingSelectImplementations(req:Request,res:Response) {
  try {
    const view = 'pages/projects/testing-select-implementations';
    const title = 'Testing Select Implementations';
    const image = 'https://image.storething.org/frankmbrown%2Fcffc13e1-530d-4d02-b90a-769d43f489d6.jpg';
    const description = "I created this page because I don't like my current select implementation and am looking at replacing it in the future. I am going to test out different vanilla JS select implementations here to see which one I think is the best.";
    const path = "/projects/testing-select-implementations";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = ["Chart","Bokeh","Python","mpld3","file"];
    const tableOfContents:TableOfContentsItem[] = [
      { id: "about-page", text: "About Page" },
      { id: "select-2", text: "Select2" },
      { id: "tom-select", text: "Tom Select" },
      { id: "nice-select-2", text: "Nice Select 2" },
      { id: "slim-select", text: "Slim Select" },
    ]
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Testing Select Implementations project page."});
  }
}
     
export function getSortingMechanisms(req:Request,res:Response) {
  try {
    const view = 'pages/projects/testing-sorting-mechanisms';
    const title = 'Testing Sorting Mechanisms';
    const image = 'https://image.storething.org/frankmbrown/b8312232-1055-4def-b7b6-695e7cbf5631.jpg';
    const description = "";
    const path = "/projects/testing-sorting-mechanisms";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = [];
    const tableOfContents:TableOfContentsItem[] = [

    ]
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    });
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Testing Select Implementations project page."});
  }
}

export function getGoogleColabClone(req:Request,res:Response) {
  try {
    const view = 'pages/projects/google-colab-clone';
    const title = 'Google Colab Clone';
    const image = 'https://image.storething.org/frankmbrown/6d552121-e17e-4fdc-a99a-1701cf6a298e.jpg';
    const description = "";
    const path = "/projects/google-colab-clone";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = [];
    const tableOfContents:TableOfContentsItem[] = [
      
    ]
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
      bodyClass: 'main-only'
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Testing Select Implementations project page."});
  }
}
export function getTestingRecommendationSystems(req:Request,res:Response) {
  try {
    const view = 'pages/projects/testing-recommendation-systems';
    const title = 'Testing Recommendation Systems';
    const image = 'https://image.storething.org/frankmbrown/fc069da5-2587-48a9-9906-1abdb1a434d5.jpg';
    const description = "";
    const path = "/projects/testing-recommendation-systems";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = [];
    const tableOfContents:TableOfContentsItem[] = [
      
    ]
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    })
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Testing Select Implementations project page."});
  }
}

export function getBokehFunctionalityPage(req:Request,res:Response) {
  try {
    const view = 'pages/projects/bokeh-functionality-survey';
    const title = 'Bokeh Survey Implementation';
    const image = 'https://image.storething.org/frankmbrown%2Fa9f8cbd2-d07b-4e39-8286-ce671077e946.jpg';
    const description = "I am creating this page to test out how I am going to show survey results using Bokeh.";
    const path = "/projects/bokeh-functionality-survey";
    const breadcrumbs: Breadcrumbs = [
      { name: 'Home', item: '/', position: 1 }, 
      { name: 'Projects', item: '/projects', position: 2 },
      { name: title, item: path, position: 3 }
    ];
    const keywords:string[] = [];
    const tableOfContents:TableOfContentsItem[] = [
      {
          "id": "about-page",
          "text": "About this Page"
      },
      {
          "id": "histogram-functionality",
          "text": "Histogram Functionality"
      },
      {
          "id": "dim-red-func",
          "text": "Dimensionality Functionality"
      },
      {
          "id": "color-question-functionality",
          "text": "Color Question Functionality"
      }
    ];
    const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
    const requiredVariables = getRequiredVariables(req,SEO);
    return res.status(200).render(view,{
      layout: requiredVariables.fullPageRequest ? 'layout' : false,
      ...requiredVariables,
    });
  } catch (e) {
    console.error(e);
    return redirect(req,res,'/projects',500,{ severity: "error", message: "Something went wrong getting the Bokeh Survey Implementation project page."});
  }
}

export function getWebGPUPage(req:Request,res:Response) {
  const view = 'pages/projects/webgpu';
  const title = 'WebGPU';
  const image = 'https://image.storething.org/frankmbrown%2Fa5bcad92-896b-4881-ae7f-c7545a2418b8.jpg';
  const description = "I decided that I wanted to know more about WebGPU, so I am creating this page to house some WebGPU projects as I go through a WebGPU tutorial.";
  const path = "/projects/bokeh-functionality-survey";
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: title, item: path, position: 3 }
  ];
  const keywords:string[] = [];
  const tableOfContents:TableOfContentsItem[] = [
    {id:"about-page", text: "About"},
    {id:"notes-page", text: "Notes"},
  ];
  const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
  });
}
export function getWebGLPage(req:Request,res:Response) {
  const view = 'pages/projects/webgl';
  const title = 'WebGL';
  const image = 'https://image.storething.org/frankmbrown%2Fbf0ea24d-4559-4553-9cef-db836b1b00ff.jpg';
  const description = "I decided that I wanted to know more about WebGL, so I am creating this page to house some WebGL projects as I go through a WebGL tutorial.";
  const path = "/projects/bokeh-functionality-survey";
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: title, item: path, position: 3 }
  ];
  const keywords:string[] = [];
  const tableOfContents:TableOfContentsItem[] = [
    {id:"about-page", text: "About"},
    {id:"notes-page", text: "Notes"},
    {id:"tutorial-1", text: "Tutorial 1"},
  ];
  const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
  });
}
export function getThreeJsPage(req:Request,res:Response) {
  const view = 'pages/projects/three-js';
  const title = 'Three.js';
  const image = 'https://image.storething.org/frankmbrown%2F45f7b175-74fb-4076-9358-d0b0552add1c.jpg';
  const description = "I decided that I wanted to know more about Three.js, so I am creating this page to house some three js projects as I go through a Three.js tutorial.";
  const path = "/projects/bokeh-functionality-survey";
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 },
    { name: title, item: path, position: 3 }
  ];
  const keywords:string[] = [];
  const tableOfContents:TableOfContentsItem[] = [
    {id:"about-page", text: "About"},
    {id:"notes-page", text: "Notes"},
    {id:"tutorial-1", text: "Tutorial 1"}
  ];
  const SEO:SEO = {breadcrumbs, keywords, title, description, tableOfContents, path, image };
  const requiredVariables = getRequiredVariables(req,SEO);
  return res.status(200).render(view,{
    layout: requiredVariables.fullPageRequest ? 'layout' : false,
    ...requiredVariables,
  });
}
