"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandbookOfDataVisualizationBook = exports.implementingAuth = exports.creatingFullTextSearch = exports.threeJSTest = exports.svgBasics = void 0;
const frontendHelper_1 = require("../helper_functions/frontendHelper");
function svgBasics(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'SVG Basics', item: '/projects-archive/svg-basics', position: 3 }
    ];
    const title = "SVG Basics";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "Learning SVGs",
        "Circles",
        "Circles",
        "Rectangles",
        "Ellipse",
        "Line",
        "Polyline",
        "Polygon",
        "Path",
        "Text",
    ];
    const description = 'Documenting the basics of SVGs. Circles, rectangles, ellipse, line, polyline, polygon, path, and text.';
    const tableOfContents = [
        { id: "page-header", text: "Header" },
        { id: "things-to-remember", text: "Things to Remember" },
        { id: "svg-basics", text: "SVG Basics" },
        { id: "basics-circles", text: "SVG Circles" },
        { id: "basics-rectangles", text: "SVG Rectangles" },
        { id: "basics-ellipse", text: "SVG Ellipse" },
        { id: "basics-line", text: "SVG Line" },
        { id: "basics-polyline", text: "SVG Polyline" },
        { id: "basics-polygon", text: "SVG Polygon" },
        { id: "basics-path", text: "SVG Path" },
        { id: "basics-text", text: "SVG Text" },
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects-archive/svg-basics' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/svg-basics', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.svgBasics = svgBasics;
function threeJSTest(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'Three JS Test', item: '/projects-archive/three-js-test', position: 3 }
    ];
    const title = "Testing Stuff Out With Three.js";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "Three.js",
        "test",
        "Learning About rendering 3d objects on the web"
    ];
    const description = 'Page for testing some stuff out with three js on the web.';
    const tableOfContents = [
        { id: "page-header", text: "Top" },
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects-archive/three-js-test' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/three-js-test', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.threeJSTest = threeJSTest;
function creatingFullTextSearch(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'Creating Full Text Search', item: '/projects-archive/creating-full-text-search', position: 2 }
    ];
    const title = "Creating Search For This Website";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "full text search",
        "word embeddings",
        "learning"
    ];
    const description = 'Read about the process of me creating full text search for this website.';
    const tableOfContents = [
        { id: "why", text: "Why Implement Search" },
        { id: "terms", text: "Important Terms" },
        { id: 'things-to-remember', text: 'Things To Remember' }
    ];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects-archive/creating-full-text-search' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/creating-full-text-search', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.creatingFullTextSearch = creatingFullTextSearch;
function implementingAuth(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'Implementing Auth', item: '/projects-archive/implementing-auth', position: 3 }
    ];
    const title = "Implementing Authentication For This Website";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "authentication",
        "login",
        "create account"
    ];
    const description = 'Read about the process of me implementing authentication for frankmbrown.net.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects-archive/implementing-auth' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/implementing-auth', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.implementingAuth = implementingAuth;
function getHandbookOfDataVisualizationBook(req, res) {
    const breadcrumbs = [
        { name: 'Home', item: '/', position: 1 },
        { name: 'Projects', item: '/projects', position: 2 },
        { name: 'Handbook of Data Visualization', item: '/projects-archive/handbook-data-visualization', position: 3 }
    ];
    const title = "Implementing Authentication For This Website";
    const keywords = [
        "Frank McKee Brown",
        "frankmbrown.net",
        "Frank Brown",
        "Handbook of Data Visualization"
    ];
    const description = 'Read about the process of me implementing authentication for frankmbrown.net.';
    const tableOfContents = [];
    const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/projects-archive/handbook-data-visualization' };
    const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
    return res.status(200).render('pages/projects/handbook-data-visualization', {
        layout: requiredVariables.fullPageRequest ? 'layout' : false,
        ...requiredVariables
    });
}
exports.getHandbookOfDataVisualizationBook = getHandbookOfDataVisualizationBook;
