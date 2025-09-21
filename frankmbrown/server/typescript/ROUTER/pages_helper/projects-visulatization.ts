import { Request, Response } from "express";
import { getRequiredVariables } from '../helper_functions/frontendHelper';
import type { Breadcrumbs, SEO, TableOfContentsItem } from '../../types';

export function getNCAABasketballTournament(req:Request,res:Response) {
  const yearQueryStr = req.query['tournament-year'];
  const yearQuery = typeof yearQueryStr==='string' ? parseInt(yearQueryStr) : undefined;
  const year = Boolean(typeof yearQuery==='number' && yearQuery>=1985 && yearQuery <=2019) ? yearQuery : 2019;

  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 }, 
    { name: 'NCAA Basketball Tournament ', item: '/projects/ncaa-basketball-tournament', position: 3 }
  ];
  const title = "Visualizing NCAA Basketball Tournament Results";
  const keywords: string[] = [
    "Visualizing NCAA Basketball Tournament Results"
  ];
  const description = 'Visulazing NCAA Basketball tournament results from 1985 to 2019.';
  const tableOfContents: TableOfContentsItem[] = [
    {
        "id": "edit-play",
        "text": "Edit Play"
    },
    {
        "id": "bracket",
        "text": "Bracket"
    },
    {
        "id": "ncaa-map",
        "text": "Map"
    }
]
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/about'};
  const requierdVariables = getRequiredVariables(req,SEO)
  return res.status(200).render('pages/projects/ncaa-basketball-tournament',{
    ...requierdVariables,
    layout: requierdVariables.fullPageRequest ? 'layout' : false,
    bodyClass: 'main-only',
    pageObj: {
      year 
    }
  })
}
export function learningHTML5Canvas(req:Request,res:Response) {
  const breadcrumbs: Breadcrumbs = [
    { name: 'Home', item: '/', position: 1 }, 
    { name: 'Projects', item: '/projects', position: 2 }, 
    { name: 'Learning HTML5 Canvas', item: '/projects/learning-html5-canvas', position: 3 }
  ];
  const title = "Learning HTML5 Canvas";
  const keywords: string[] = [
    "Learning HTML5 Canvas"
  ];
  const description = 'Eorking on learning more about HTML5 Canvas.';
  const tableOfContents: TableOfContentsItem[] =[
    {
        "id": "learning-canvas",
        "text": "Learning Canvas"
    },
    {
        "id": "image-data",
        "text": "Canvas Image Data"
    }
];
  const SEO: SEO = {breadcrumbs, keywords, title, description, tableOfContents, path: '/about'};
  const requierdVariables = getRequiredVariables(req,SEO)
  return res.status(200).render('pages/projects/learning-canvas',{
    ...requierdVariables,
    layout: requierdVariables.fullPageRequest ? 'layout' : false
  })
}