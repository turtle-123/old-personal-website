"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.learningHTML5Canvas = exports.getNCAABasketballTournament = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
function getNCAABasketballTournament(req, res) {
    const yearQueryStr = req.query['tournament-year'];
    const yearQuery = typeof yearQueryStr === 'string' ? parseInt(yearQueryStr) : undefined;
    const year = Boolean(typeof yearQuery === 'number' && yearQuery >= 1985 && yearQuery <= 2019) ? yearQuery : 2019;
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'NCAA Basketball Tournament ', item: '/projects/ncaa-basketball-tournament', position: 3 }
    ];
    const title = "Visualizing NCAA Basketball Tournament Results";
    const keywords = [
        "Visualizing NCAA Basketball Tournament Results"
    ];
    const description = 'Visulazing NCAA Basketball tournament results from 1985 to 2019.';
    const tableOfContents = [
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
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/about' };
    const requierdVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/ncaa-basketball-tournament', {
        ...requierdVariables,
        layout: requierdVariables.fullPageRequest ? 'layout' : false,
        bodyClass: 'main-only',
        pageObj: {
            year
        }
    });
}
exports.getNCAABasketballTournament = getNCAABasketballTournament;
function learningHTML5Canvas(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'Learning HTML5 Canvas', item: '/projects/learning-html5-canvas', position: 3 }
    ];
    const title = "Learning HTML5 Canvas";
    const keywords = [
        "Learning HTML5 Canvas"
    ];
    const description = 'Eorking on learning more about HTML5 Canvas.';
    const tableOfContents = [
        {
            "id": "learning-canvas",
            "text": "Learning Canvas"
        },
        {
            "id": "image-data",
            "text": "Canvas Image Data"
        }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/about' };
    const requierdVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/learning-canvas', {
        ...requierdVariables,
        layout: requierdVariables.fullPageRequest ? 'layout' : false
    });
}
exports.learningHTML5Canvas = learningHTML5Canvas;
