"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cookies_1 = __importDefault(require("./pages_helper/cookies"));
const body_parser_1 = __importDefault(require("body-parser"));
const account_1 = require("./pages_helper/account");
const PAGES = __importStar(require("./pages_helper/static-pages"));
const PROJECTS = __importStar(require("./pages_helper/projects"));
const PROJECTS_ARCHIVE = __importStar(require("./pages_helper/projects-archive"));
const rateLimit_1 = require("../MIDDLEWARE/rateLimit");
const search_1 = require("./pages_helper/search");
const ADMIN = __importStar(require("./pages_helper/admin"));
const AUTH = __importStar(require("../MIDDLEWARE/authMiddleware"));
const VISUALIZATION = __importStar(require("./pages_helper/projects-visulatization"));
const MARKDOWN = __importStar(require("./pages_helper/markdownNotes"));
const JUPYTER = __importStar(require("./pages_helper/jupyterNotebooks"));
const SURVEYS = __importStar(require("./pages_helper/surveys"));
const multer_1 = __importDefault(require("multer"));
const census_1 = require("./functions/census");
const redirect_override_1 = require("./helper_functions/redirect-override");
const handleArticleData_1 = require("./pages_helper/article_helpers/handleArticleData");
const chat_1 = require("../socket/chat");
const NEW_PAGES = __importStar(require("./pages_helper/new-pages"));
function notFound(req, res) {
    if (Boolean(req.get('hx-request'))) {
        if (req.get('hx-target') === '#PAGE' || req.get('hx-target') === 'PAGE') {
            return (0, redirect_override_1.redirect)(req, res, '/', 404, { severity: 'error', message: 'Unrecognized request.' });
        }
        else {
            return res.status(404).send("Unrecognized request.");
        }
    }
    else {
        return (0, redirect_override_1.redirect)(req, res, '/', 404, { severity: 'error', message: 'The requested page does not exist. ' });
    }
}
const upload = (0, multer_1.default)();
const jupyterNotebookFields = upload.fields([{ name: "upload-jupyter-notebook", maxCount: 1 }, { name: "jupyter-notebook-image", maxCount: 1 }]);
const PAGES_ROUTER = (0, express_1.Router)({ mergeParams: true });
PAGES_ROUTER.get('/surveys/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 30), SURVEYS.getSurvey);
PAGES_ROUTER.post('/surveys/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), body_parser_1.default.json({}), SURVEYS.postSurveyResponse);
PAGES_ROUTER.post('/surveys/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isAdmin, SURVEYS.postSurvey);
PAGES_ROUTER.get('/surveys/search', (0, rateLimit_1.getRateLimit)(60000, 40), SURVEYS.searchSurveysAndQuestions);
PAGES_ROUTER.get('/surveys', (0, rateLimit_1.getRateLimit)(60000, 30), SURVEYS.getSurveys);
PAGES_ROUTER.get('/chat', (0, rateLimit_1.getRateLimit)(60000, 60), chat_1.getChat);
PAGES_ROUTER.get('/like/note/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/blog/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/idea/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/daily-reading/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/tex-notes/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/markdown-notes/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/jupyter-notebooks/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/goodreads/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/letterboxd/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/3d-designs/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/games/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/surveys/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 30), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
PAGES_ROUTER.get('/like/electronics-robotics/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 30), AUTH.isLoggedIn, handleArticleData_1.handleLikeRequest);
// PAGES_ROUTER.get('/comments/:id',getRateLimit(60000,60),getCommentsPage);
PAGES_ROUTER.get('/annotations/:id', (0, rateLimit_1.getRateLimit)(60000, 60), handleArticleData_1.getAnnotationsDialog);
PAGES_ROUTER.post('/annotations/:id', (0, rateLimit_1.getRateLimit)(60000, 10), handleArticleData_1.postAnnotationComment);
PAGES_ROUTER.post('/annotate/note/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/blog/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/idea/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/daily-reading/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/surveys/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/goodreads/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/letterboxd/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/games/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/3d-designs/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.post('/annotate/electronics-robotics/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 60), AUTH.isLoggedIn, handleArticleData_1.postAnnotation);
PAGES_ROUTER.get('/comments/:id', (0, rateLimit_1.getRateLimit)(60000, 60), handleArticleData_1.getDeepComments);
PAGES_ROUTER.post('/comment/note/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/blog/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/idea/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/daily-reading/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/tex-notes/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/markdown-notes/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/jupyter-notebooks/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/goodreads/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/letterboxd/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/games/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/3d-designs/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.post('/comment/electronics-robotics/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.postArticleComment);
PAGES_ROUTER.get('/comment/like/:id', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.likeComment);
PAGES_ROUTER.get('/comment/add/:id', (0, rateLimit_1.getRateLimit)(60000, 30), handleArticleData_1.getCommentForm);
PAGES_ROUTER.post('/comment/add/:id', (0, rateLimit_1.getRateLimit)(60000, 30), AUTH.isLoggedIn, handleArticleData_1.postSubComment);
PAGES_ROUTER.get('/comment/more/?', (0, rateLimit_1.getRateLimit)(60000, 30), handleArticleData_1.getMoreComments);
PAGES_ROUTER.get('/annotation/upvote/:id', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.upvoteDownvoteAnnotation);
PAGES_ROUTER.get('/annotation/downvote/:id', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isLoggedIn, handleArticleData_1.upvoteDownvoteAnnotation);
/* Search */
PAGES_ROUTER.get('/search/?', (0, rateLimit_1.getRateLimit)(60000, 200), search_1.getSearch);
PAGES_ROUTER.post('/search/image/?', (0, rateLimit_1.getRateLimit)(60000, 10), upload.single('image-search-input'), search_1.imageSearch);
/* About */
PAGES_ROUTER.get('/about/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getAbout);
PAGES_ROUTER.get('/change-site-permissions/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getChangeSitePermissionsPage);
/* Privacy Policy */
PAGES_ROUTER.get('/privacy-policy/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getPrivacyPolicy);
/* Article */
PAGES_ROUTER.get('/note/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 60), ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/blog/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 60), ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/idea/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 60), ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/note/search/?', (0, rateLimit_1.getRateLimit)(60000, 1000), ADMIN.searchNotes);
PAGES_ROUTER.get('/note/?', (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/blog/?', (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/idea/?', (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
/* Daily Reading */
PAGES_ROUTER.post('/daily-reading/update/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), upload.single('upload-lexical-wiki'), PAGES.updateDailyReadingArticle);
PAGES_ROUTER.post('/daily-reading/upcoming/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({}), PAGES.addUpcomingDailyReading);
PAGES_ROUTER.get('/daily-reading/old/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, PAGES.getDailyReadingOld);
PAGES_ROUTER.post('/daily-reading/old/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, body_parser_1.default.urlencoded({}), PAGES.postDailyReadingOld);
PAGES_ROUTER.get('/daily-reading/search/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.searchDailyReading);
PAGES_ROUTER.get('/daily-reading/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 60), PAGES.getDailyReadingOfTheDay); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/daily-reading/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getDailyReading); // ARTICLE PREVIEWS
PAGES_ROUTER.post('/daily-reading/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({}), PAGES.postDailyReading);
/* Tex Notes */
PAGES_ROUTER.post('/tex-notes/add-upcoming', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), upload.single('tex-file'), PAGES.addTexNoteUpcoming);
PAGES_ROUTER.post('/tex-notes/complete', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), upload.fields([{ name: 'tex-file', maxCount: 1 }, { name: 'html-file', maxCount: 1 }]), PAGES.addTexNote);
PAGES_ROUTER.get('/tex-notes/download/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 10), PAGES.downloadTexNote);
PAGES_ROUTER.get('/tex-notes/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getTexNote); // COMMENTS 
PAGES_ROUTER.get('/tex-notes/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getTexNotes); // ARTICLE PREVIEWS
/* Download SPA */
PAGES_ROUTER.get('/download-spa-mobile', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.downloadSPAMobile);
/* Quotes */
PAGES_ROUTER.get('/quotes/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getQuotes);
PAGES_ROUTER.post('/quotes/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({}), PAGES.postQuotes);
PAGES_ROUTER.delete('/quotes/:id/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.deleteQuotes);
/* Admin Article */
PAGES_ROUTER.post('/admin/blog/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/note/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/idea/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.get('/admin/note/search/?', (0, rateLimit_1.getRateLimit)(60000, 1000), ADMIN.searchNotes);
PAGES_ROUTER.get('/admin/blog/search/?', (0, rateLimit_1.getRateLimit)(60000, 1000), ADMIN.searchNotes);
PAGES_ROUTER.get('/admin/idea/search/?', (0, rateLimit_1.getRateLimit)(60000, 1000), ADMIN.searchNotes);
PAGES_ROUTER.post('/admin/blog/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/note/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/idea/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.get('/admin/blog/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/note/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/idea/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/blog/add-version/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.addArticleVersion);
PAGES_ROUTER.get('/admin/note/add-version/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.addArticleVersion);
PAGES_ROUTER.get('/admin/idea/add-version/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.addArticleVersion);
PAGES_ROUTER.delete('/admin/blog/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.delete('/admin/note/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.delete('/admin/idea/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.get('/admin/blog/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticle);
PAGES_ROUTER.get('/admin/note/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticle);
PAGES_ROUTER.get('/admin/idea/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageArticle);
/* Admin Utilities */
PAGES_ROUTER.get('/admin/utilities/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminUtilities);
PAGES_ROUTER.get('/admin/utilities/clear-cache/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminUtilitiesClearCache);
PAGES_ROUTER.get('/admin/utilities/update-search/confirm/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), search_1.updateSearchConfirm);
PAGES_ROUTER.get('/admin/utilities/update-search/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), search_1.updateSearch);
PAGES_ROUTER.get('/admin/utilities/update-search-images/confirm/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), search_1.updateSearchImagesConfirm);
PAGES_ROUTER.get('/admin/utilities/update-search-images/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), search_1.updateSearchImagesInitial);
PAGES_ROUTER.get('/admin/utilities/index-pages/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminUtilitiesIndexPages);
PAGES_ROUTER.get('/admin/utilities/email/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.sendEmailRoute);
PAGES_ROUTER.get('/admin/view-images/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminViewImagePage);
PAGES_ROUTER.get('/admin/view-images/:nextToken/?:type?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-images/:key', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-audio/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminViewAudioPage);
PAGES_ROUTER.get('/admin/view-audio/:nextToken', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-audio/:key', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-video/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminViewVideoPage);
PAGES_ROUTER.get('/admin/view-video/:nextToken', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-video/:key', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-video/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getAdminViewVideoPage);
PAGES_ROUTER.get('/admin/view-image/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getAdminViewImagePage);
PAGES_ROUTER.get('/admin/view-audio/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getAdminViewAudioPage);
PAGES_ROUTER.get('/admin/create-chart/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getCreateChartPage);
PAGES_ROUTER.get('/admin/to-dos/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getAdminToDosPage);
PAGES_ROUTER.post('/admin/to-dos/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.postToDo);
PAGES_ROUTER.get('/admin/to-dos/:id/complete/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.markToDoComplete);
PAGES_ROUTER.delete('/admin/to-dos/:id/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.deleteToDo);
PAGES_ROUTER.get('/admin/to-dos/:id/edit/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getEditToDo);
PAGES_ROUTER.put('/admin/to-dos/:id/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.postEditToDo);
PAGES_ROUTER.get('/admin/create-game-design', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getCreateGameDesign);
/* Admin Diary */
PAGES_ROUTER.get('/admin/diary/edit/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getEditDiary);
PAGES_ROUTER.get('/admin/diary/:id/:title/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getDiary);
PAGES_ROUTER.get('/admin/diary/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.getAdminPageDiary);
PAGES_ROUTER.post('/admin/diary/:id/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.json({}), ADMIN.saveDiary);
PAGES_ROUTER.get('/admin/diary/search', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.searchAdminDiary);
PAGES_ROUTER.get('/admin/diary/update', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.updateSearchAdminDiary);
PAGES_ROUTER.post('/admin/notifications', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 500), ADMIN.postNotifications);
/* Admin */
PAGES_ROUTER.get('/admin/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 50), ADMIN.getAdminPage);
/* Account */
PAGES_ROUTER.get('/account/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getAccount);
PAGES_ROUTER.post('/account/profile-picture/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.postEditProfilePicture);
PAGES_ROUTER.get('/account/username/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.getEditUsername);
PAGES_ROUTER.post('/account/username/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.postEditUsername);
PAGES_ROUTER.get('/account/password/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.getEditPassword);
PAGES_ROUTER.post('/account/password/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.postEditPassword);
PAGES_ROUTER.get('/account/description/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.getEditDescription);
PAGES_ROUTER.post('/account/description/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 20), account_1.postEditDescription);
PAGES_ROUTER.get('/users/:id/:username', (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getUser);
/* Login */
PAGES_ROUTER.get('/login/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getLogin);
PAGES_ROUTER.post('/login/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({ extended: true }), account_1.postLogin);
/* Logout */
PAGES_ROUTER.get('/logout/?', AUTH.isLoggedIn, (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getLogout);
/* Create Account */
PAGES_ROUTER.get('/create-account/finish/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 2), account_1.finishCreateAccount);
PAGES_ROUTER.get('/create-account/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getCreateAccount);
PAGES_ROUTER.post('/create-account/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 20), body_parser_1.default.urlencoded({ extended: true }), account_1.postCreateAccount);
PAGES_ROUTER.post('/create-account/2fa/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 5), body_parser_1.default.urlencoded({ extended: true }), account_1.postCreateAccount2fa);
PAGES_ROUTER.get('/create-account/email/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 5), account_1.getCreateAccountSendEmail);
/* Reset Credentials */
PAGES_ROUTER.get('/reset-credentials/finish/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 2), account_1.finishResetCredentials);
PAGES_ROUTER.get('/reset-credentials/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), account_1.getResetCredentials);
PAGES_ROUTER.post('/reset-credentials/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({ extended: true }), account_1.postResetCredentials);
PAGES_ROUTER.post('/reset-credentials/2fa/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.urlencoded({ extended: true }), account_1.postResetCredentials2fa);
PAGES_ROUTER.get('/reset-credentials/email/?', AUTH.isLoggedOut, (0, rateLimit_1.getRateLimit)(60000, 5), account_1.resendResetCredentialsEmail);
/* Cookies */
PAGES_ROUTER.use('/cookies/?', (0, rateLimit_1.getRateLimit)(60000, 500), cookies_1.default);
/* Projects */
PAGES_ROUTER.get('/projects/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getProjects);
/* Stream of Consciousness */
PAGES_ROUTER.get('/stream-of-consciousness/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getStreamOfConsciousness);
PAGES_ROUTER.post('/stream-of-consciousness/?', (0, rateLimit_1.getRateLimit)(60000, 35), PAGES.postStreamOfConsciousness);
PAGES_ROUTER.post('/stream-of-consciousness/add/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, PAGES.addToStreamOfConsciousness);
PAGES_ROUTER.put('/stream-of-consciousness/like/:id/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isLoggedIn, PAGES.likeStreamOfConsciousness);
PAGES_ROUTER.delete('/stream-of-consciousness/:id', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, PAGES.deleteStreamOfConsciousNess);
/* Design System */
PAGES_ROUTER.get('/projects/design-system/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getDesignSystemHome);
PAGES_ROUTER.get('/projects/design-system/lexical-rich-text-editor/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getLexicalPage);
PAGES_ROUTER.get('/projects/design-system/google-maps/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getGoogleMaps);
PAGES_ROUTER.get('/projects/design-system/:component/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getDesignSystemComponent);
/* Article Builder */
PAGES_ROUTER.get('/projects/article-builder-1/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getArticleBuilder);
PAGES_ROUTER.get('/projects/article-builder-2/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getArticleBuilder2);
PAGES_ROUTER.get('/projects/article-builder-3/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getArticleBuilder3);
PAGES_ROUTER.get('/projects/article-builder-4/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getArticleBuilder4);
PAGES_ROUTER.get('/projects/create-a-survey/search/?', (0, rateLimit_1.getRateLimit)(60000, 100), SURVEYS.searchSurveys);
PAGES_ROUTER.get('/projects/create-a-survey/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getCreateASurvey);
PAGES_ROUTER.post('/projects/create-a-survey', (0, rateLimit_1.getRateLimit)(60000, 2), AUTH.isAdmin, body_parser_1.default.json({}), SURVEYS.postSurvey);
PAGES_ROUTER.get('/projects/html-to-javascript/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.htmlToJavascriptPage);
PAGES_ROUTER.get('/projects/html-css-javascript-playground/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.htmlCssJavascriptPlayground);
/* Record Media */
PAGES_ROUTER.get('/projects/record-media/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.recordMediaTestPage);
PAGES_ROUTER.post('/projects/record-media/page-image', (0, rateLimit_1.getRateLimit)(60000, 500), upload.single('image-file'), PROJECTS.recordMediaPageImage);
PAGES_ROUTER.get('/projects/learning-d3-js/:component/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.learningD3JsComponent);
PAGES_ROUTER.get('/projects/learning-d3-js/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.learningD3Js);
PAGES_ROUTER.get('/projects/create-svg/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.createSvgWithPixi);
PAGES_ROUTER.get('/projects/create-gradient/all/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getAllUserGradients);
PAGES_ROUTER.get('/projects/create-gradient/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.createGradient);
PAGES_ROUTER.post('/projects/create-gradient/?', (0, rateLimit_1.getRateLimit)(60000, 500), body_parser_1.default.json({}), PROJECTS.postCreateGradient);
PAGES_ROUTER.delete('/projects/create-gradient/:id/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.deleteCreateGradient);
PAGES_ROUTER.get('/projects/creating-css-sprite-builder/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.createCssSpriteMaker);
PAGES_ROUTER.get('/projects/excalidraw-implementation/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.excalidrawImplementation);
PAGES_ROUTER.get('/projects/create-three-js-texture/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.createThreeJSTexture);
PAGES_ROUTER.get('/projects/three-js-playground/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.threeJSPlayground);
/* Census Information */
PAGES_ROUTER.get('/projects/census-info-near-you/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.informationNearYou);
PAGES_ROUTER.get('/projects/census-info-near-you/community/:id/?', (0, rateLimit_1.getRateLimit)(60000, 500), census_1.getSpecificCensusCommunity);
PAGES_ROUTER.post('/projects/census-info-near-you/?', (0, rateLimit_1.getRateLimit)(60000, 20), census_1.searchCensusCommunity);
PAGES_ROUTER.get('/projects/markdown-to-html', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.markdownToHTML);
PAGES_ROUTER.get('/projects/lexical-implementations/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getLexicalImplementations);
PAGES_ROUTER.post('/projects/lexical-implementations/:type/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.onPostLexicalImplementation);
PAGES_ROUTER.get('/projects/configure-size-adjust-property/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getFontSizeAdjust);
PAGES_ROUTER.post('/projects/configure-size-adjust-property/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.onFontSizeAdjustChange);
PAGES_ROUTER.get('/projects/embed-social-media-posts/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getLookingIntoEmbedingSocialMediaPosts);
PAGES_ROUTER.get('/projects/testing-css-env-variables/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getTestCssEnvVariables);
PAGES_ROUTER.post('/projects/image-editor/resize/?', upload.single('upload-image-resize'), (0, rateLimit_1.getRateLimit)(60000, 10), PROJECTS.postImageEditorResize);
PAGES_ROUTER.get('/projects/image-editor/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getImageEditor);
PAGES_ROUTER.get('/projects/neural-style-transfer/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getNeuralStyleTransfer);
PAGES_ROUTER.get('/projects/convert-file-type/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getConvertFileType);
PAGES_ROUTER.post('/projects/convert-file-type/image/?', (0, rateLimit_1.getRateLimit)(60000, 20), upload.single('image-file'), PROJECTS.postConvertImageType);
PAGES_ROUTER.post('/projects/convert-file-type/audio/?', (0, rateLimit_1.getRateLimit)(60000, 4), upload.single('audio-file'), PROJECTS.postConvertAudioType);
PAGES_ROUTER.post('/projects/convert-file-type/video/?', (0, rateLimit_1.getRateLimit)(60000, 4), upload.single('video-file'), PROJECTS.postConvertVideoType);
PAGES_ROUTER.post('/projects/convert-file-type/text/?', (0, rateLimit_1.getRateLimit)(60000, 10), upload.single('text-file'), PROJECTS.postConvertTextFileType);
PAGES_ROUTER.get('/projects/get-file-information/?', (0, rateLimit_1.getRateLimit)(60000, 500), upload.single('image-file'), PROJECTS.getFileInformation);
PAGES_ROUTER.post('/projects/get-file-information/image/?', (0, rateLimit_1.getRateLimit)(60000, 20), upload.single('image-file'), PROJECTS.postGetFileInformationImage);
PAGES_ROUTER.post('/projects/get-file-information/audio/?', (0, rateLimit_1.getRateLimit)(60000, 4), upload.single('audio-file'), PROJECTS.postGetFileInformationAudio);
PAGES_ROUTER.post('/projects/get-file-information/video/?', (0, rateLimit_1.getRateLimit)(60000, 4), upload.single('video-file'), PROJECTS.postGetFileInformationVideo);
PAGES_ROUTER.post('/projects/get-file-information/text/?', (0, rateLimit_1.getRateLimit)(60000, 10), upload.single('text-file'), PROJECTS.postGetFileInformationText);
PAGES_ROUTER.get('/projects/various-nlp-tasks/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getVariousNlpTasks);
PAGES_ROUTER.post("/projects/various-nlp-tasks/fill-mask", (0, rateLimit_1.getRateLimit)(60000, 7), PROJECTS.postFillMask);
PAGES_ROUTER.post("/projects/various-nlp-tasks/answer-question", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postAnswerQuestion);
PAGES_ROUTER.post("/projects/various-nlp-tasks/sentiment-analysis", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postSentimentAnalysis);
PAGES_ROUTER.post("/projects/various-nlp-tasks/ner", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postNamedEntityRecognition);
PAGES_ROUTER.post("/projects/various-nlp-tasks/classification", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postNlpClassification);
PAGES_ROUTER.post("/projects/various-nlp-tasks/feature-extraction", (0, rateLimit_1.getRateLimit)(60000, 7), PROJECTS.postFeatureExtraction);
PAGES_ROUTER.post("/projects/various-nlp-tasks/summarization", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postSummarization);
PAGES_ROUTER.post("/projects/various-nlp-tasks/keyword-extraction", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('text-file'), PROJECTS.postKeywordExtraction);
PAGES_ROUTER.post("/projects/various-nlp-tasks/openai", (0, rateLimit_1.getRateLimit)(60000, 5), upload.single('text-file'), PROJECTS.postOpenAITextModeration);
PAGES_ROUTER.get('/projects/various-image-tasks/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getVariousImageTasks);
PAGES_ROUTER.post("/projects/various-image-tasks/feature-extraction", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postImageFeatureExtraction);
PAGES_ROUTER.post("/projects/various-image-tasks/image-safe-search", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postImageSafeSearch);
PAGES_ROUTER.post("/projects/various-image-tasks/image-captioning", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postImageCaptioning);
PAGES_ROUTER.post("/projects/various-image-tasks/depth-estimation", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postDepthEstimation);
PAGES_ROUTER.post("/projects/various-image-tasks/object-detection", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postObjectDetection);
PAGES_ROUTER.post("/projects/various-image-tasks/image-segmentation", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postImageSegmentation);
PAGES_ROUTER.post("/projects/various-image-tasks/keypoint-detection", (0, rateLimit_1.getRateLimit)(60000, 7), upload.single('image-file'), PROJECTS.postKeypointDetection);
PAGES_ROUTER.post("/projects/various-image-tasks/openai", (0, rateLimit_1.getRateLimit)(60000, 5), upload.single('image-file'), PROJECTS.postOpenAIImageModeration);
PAGES_ROUTER.get('/projects/chat/information-on-models/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getAiChatInformationOnModels);
PAGES_ROUTER.get('/projects/chat/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getAiChat);
PAGES_ROUTER.get('/projects/ncaa-basketball-tournament/?', VISUALIZATION.getNCAABasketballTournament);
PAGES_ROUTER.get('/projects/learning-html5-canvas/?', VISUALIZATION.learningHTML5Canvas);
PAGES_ROUTER.get('/projects/sense-of-style/?', PROJECTS.getSenseOfStyle);
PAGES_ROUTER.post('/projects/sense-of-style/?', AUTH.isAdmin, PROJECTS.postSenseOfStyle);
PAGES_ROUTER.get('/projects/web-apis/:page?', PROJECTS.getWebAPIs);
PAGES_ROUTER.post('/projects/table-conversion/file/?', (0, rateLimit_1.getRateLimit)(60000, 5), upload.single('table-file'), PROJECTS.postTableConversionFile);
PAGES_ROUTER.post('/projects/table-conversion/text/?', (0, rateLimit_1.getRateLimit)(60000, 10), PROJECTS.postTableConversionText);
PAGES_ROUTER.post('/projects/table-conversion/url/?', (0, rateLimit_1.getRateLimit)(60000, 5), PROJECTS.postTableConversionUrl);
PAGES_ROUTER.get('/projects/table-conversion/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getTableConversionPage);
PAGES_ROUTER.get('/projects/create-a-chart/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getCreateChartPage);
PAGES_ROUTER.get('/projects/testing-select-implementations/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getTestingSelectImplementations);
PAGES_ROUTER.get('/projects/google-colab-clone/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getGoogleColabClone);
PAGES_ROUTER.get('/projects/testing-recommendation-systems/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getTestingRecommendationSystems);
PAGES_ROUTER.get('/projects/sorting-mechanisms/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getSortingMechanisms);
PAGES_ROUTER.get('/projects/bokeh-functionality-survey/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getBokehFunctionalityPage);
PAGES_ROUTER.get('/projects/three-js/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getThreeJsPage);
PAGES_ROUTER.get('/projects/webgl/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getWebGLPage);
PAGES_ROUTER.get('/projects/webgpu/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS.getWebGPUPage);
/* Markdown Notes */
PAGES_ROUTER.get('/markdown-notes/?', (0, rateLimit_1.getRateLimit)(60000, 500), MARKDOWN.getMarkdownNotesPage); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/markdown-notes/download/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 10), MARKDOWN.downloadNote);
PAGES_ROUTER.get('/markdown-notes/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), MARKDOWN.getMarkdownNotePage); // COMMENTS
PAGES_ROUTER.post('/markdown-notes/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, body_parser_1.default.urlencoded({}), MARKDOWN.postMarkdownNote);
PAGES_ROUTER.put('/markdown-notes/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, body_parser_1.default.urlencoded({}), MARKDOWN.putMarkdownNote);
PAGES_ROUTER.delete('/markdown-notes/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, MARKDOWN.deleteMarkdownNote);
/* Jupyter Notebooks */
PAGES_ROUTER.get('/jupyter-notebooks/search/?', (0, rateLimit_1.getRateLimit)(60000, 1000), body_parser_1.default.urlencoded({}), JUPYTER.searchJupyterNotebook);
PAGES_ROUTER.get('/jupyter-notebooks/?', (0, rateLimit_1.getRateLimit)(60000, 500), JUPYTER.getJupyterNotebooksPage); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/jupyter-notebook/download/:id/:title', (0, rateLimit_1.getRateLimit)(60000, 10), JUPYTER.downloadJupyterNotebook); // COMMENTS
PAGES_ROUTER.get('/jupyter-notebooks/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), JUPYTER.getJupyterNotebook);
PAGES_ROUTER.post('/jupyter-notebooks/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, jupyterNotebookFields, JUPYTER.postJupyterNotebook);
PAGES_ROUTER.delete('/jupyter-notebooks/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, JUPYTER.deleteJupyterNotebook);
/* Projects Archive */
PAGES_ROUTER.get('/projects-archive/three-js-test/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS_ARCHIVE.threeJSTest);
PAGES_ROUTER.get('/projects-archive/creating-full-text-search/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS_ARCHIVE.creatingFullTextSearch);
PAGES_ROUTER.get('/projects-archive/implementing-auth/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS_ARCHIVE.implementingAuth);
PAGES_ROUTER.get('/projects-archive/svg-basics/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS_ARCHIVE.svgBasics);
PAGES_ROUTER.get('/projects-archive/handbook-data-visualization/?', (0, rateLimit_1.getRateLimit)(60000, 500), PROJECTS_ARCHIVE.getHandbookOfDataVisualizationBook);
/* AI Tools */
PAGES_ROUTER.get('/ai-tools', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getAITools);
PAGES_ROUTER.get('/ai-tools/ai-chat/:uuid/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getAIChatPage);
PAGES_ROUTER.get('/ai-tools/ai-chat/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getAIChatPage);
PAGES_ROUTER.get('/ai-chat/search/:id/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.searchAIChatResult);
PAGES_ROUTER.get('/ai-chat/search/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.searchAIChat);
/* Letterboxd */
PAGES_ROUTER.get('/letterboxd/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getLetterboxdPage);
PAGES_ROUTER.post('/letterboxd/?', (0, rateLimit_1.getRateLimit)(60000, 20), AUTH.isAdmin, NEW_PAGES.postLetterboxd);
PAGES_ROUTER.get('/letterboxd/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getLetterboxd);
/* GoodReads */
PAGES_ROUTER.get('/goodreads/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getGoodreadPage);
PAGES_ROUTER.post('/goodreads/?', (0, rateLimit_1.getRateLimit)(60000, 20), AUTH.isAdmin, NEW_PAGES.postGoodRead);
PAGES_ROUTER.get('/goodreads/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getGoodreads);
/* 3D Designs */
PAGES_ROUTER.get('/3d-designs/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.get3dDesigns);
PAGES_ROUTER.get('/3d-designs/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.get3dDesign);
PAGES_ROUTER.get('/download/3d-designs/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.download3dDesign);
PAGES_ROUTER.post('/3d-designs/new', AUTH.isAdmin, NEW_PAGES.post3dDesign);
PAGES_ROUTER.post('/3d-designs/upload-asset/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, upload.single('asset-file-3d-design'), NEW_PAGES.post3dDesignAsset);
PAGES_ROUTER.post('/3d-designs/upload-script/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, upload.single('js-file-3d-design'), NEW_PAGES.post3dDesignJavaScript);
/* Games */
PAGES_ROUTER.get('/games/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getGames);
PAGES_ROUTER.get('/games/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getGame);
PAGES_ROUTER.post('/games/new/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, NEW_PAGES.postGame);
PAGES_ROUTER.post('/games/upload-game-script', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isAdmin, upload.single('js-file-game'), NEW_PAGES.postGameJavaScript);
PAGES_ROUTER.get('/electronics-robotics/:id/:title/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getElectronicsAndRoboticsProject);
PAGES_ROUTER.get('/electronics-robotics/?', (0, rateLimit_1.getRateLimit)(60000, 500), NEW_PAGES.getElectronicsAndRobotics);
PAGES_ROUTER.post('/electronics-robotics/?', AUTH.isAdmin, (0, rateLimit_1.getRateLimit)(60000, 10), NEW_PAGES.postElectronicsAndRobotics);
/* Links */
PAGES_ROUTER.get('/links/?', PAGES.getFranksLinks);
PAGES_ROUTER.post('/links/search/?', body_parser_1.default.urlencoded({}), PAGES.searchFranksLink);
PAGES_ROUTER.post('/links/create/?', body_parser_1.default.urlencoded({}), AUTH.isAdmin, PAGES.addFranksLink);
/* Utilities */
PAGES_ROUTER.get('/utilities/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getUtilities);
PAGES_ROUTER.post('/utilities/get-image-data/?', (0, rateLimit_1.getRateLimit)(60000, 500), upload.single('upload-image-for-data'), PAGES.postGetImageData);
/* Test */
PAGES_ROUTER.get('/test/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isDevelopment, PAGES.getTest);
PAGES_ROUTER.post('/test/?', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isDevelopment, body_parser_1.default.urlencoded({}), PAGES.postTest);
PAGES_ROUTER.post('/test/run', (0, rateLimit_1.getRateLimit)(60000, 500), AUTH.isDevelopment, body_parser_1.default.urlencoded({}), PAGES.postTestRun);
/* Home */
PAGES_ROUTER.get('/?', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.getHome);
/* Not Found */
PAGES_ROUTER.use('/:something', (0, rateLimit_1.getRateLimit)(60000, 500), PAGES.get404);
PAGES_ROUTER.use('*', notFound);
exports.default = PAGES_ROUTER;
