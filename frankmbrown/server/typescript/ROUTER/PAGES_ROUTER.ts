import { Router, Request, Response } from 'express';
import COOKIE_ROUTER from './pages_helper/cookies';
import bodyParser from 'body-parser';
import { 
  getCreateAccount, 
  getLogin, 
  postLogin,
  getLogout,
  postCreateAccount,
  getCreateAccountSendEmail,
  resendResetCredentialsEmail,
  postResetCredentials,
  getResetCredentials,
  postResetCredentials2fa,
  postCreateAccount2fa,
  finishCreateAccount,
  finishResetCredentials,
  getAccount,
  getEditUsername,
  getEditPassword,
  getEditDescription,
  postEditProfilePicture,
  postEditUsername,
  postEditPassword,
  postEditDescription,
  getUser
} from './pages_helper/account';
import * as PAGES from './pages_helper/static-pages';
import * as PROJECTS from './pages_helper/projects';
import * as PROJECTS_ARCHIVE from './pages_helper/projects-archive'

import { getRateLimit } from '../MIDDLEWARE/rateLimit';
import { 
  getSearch, 
  updateSearch, 
  updateSearchConfirm, 
  updateSearchImagesInitial, 
  updateSearchImagesConfirm,
  imageSearch
} from './pages_helper/search';
import * as ADMIN from './pages_helper/admin';
import * as AUTH from '../MIDDLEWARE/authMiddleware';
import * as VISUALIZATION from './pages_helper/projects-visulatization';
import * as MARKDOWN from './pages_helper/markdownNotes'
import * as JUPYTER from './pages_helper/jupyterNotebooks';
import * as SURVEYS from './pages_helper/surveys';

import multer from 'multer';
import { getSpecificCensusCommunity, searchCensusCommunity } from './functions/census';
import { redirect } from './helper_functions/redirect-override';
import { 
  handleLikeRequest, 
  likeComment, 
  postAnnotation, 
  postArticleComment, 
  upvoteDownvoteAnnotation, 
  getCommentForm, 
  postSubComment, 
  getMoreComments, 
  getAnnotationsDialog, 
  postAnnotationComment, 
  getDeepComments 
} from './pages_helper/article_helpers/handleArticleData';
import { getChat } from '../socket/chat';
import * as NEW_PAGES from './pages_helper/new-pages';

function notFound(req:Request,res:Response) {
  if (Boolean(req.get('hx-request'))) {
    if (req.get('hx-target')==='#PAGE'||req.get('hx-target')==='PAGE') {
      return redirect(req,res,'/',404,{ severity: 'error', message: 'Unrecognized request.'});
    } else {
      return res.status(404).send("Unrecognized request.");
    }
  } else {
    return redirect(req,res,'/',404,{ severity: 'error', message: 'The requested page does not exist. '});
  }
}

const upload = multer();
const jupyterNotebookFields = upload.fields([{ name: "upload-jupyter-notebook", maxCount: 1 }, { name: "jupyter-notebook-image", maxCount: 1}])
const PAGES_ROUTER = Router({mergeParams: true});   

PAGES_ROUTER.get('/surveys/:id/:title',getRateLimit(60000,30),SURVEYS.getSurvey);
PAGES_ROUTER.post('/surveys/:id/:title',getRateLimit(60000,2),bodyParser.json({}),SURVEYS.postSurveyResponse);
PAGES_ROUTER.post('/surveys/:id/:title',getRateLimit(60000,2),AUTH.isAdmin,SURVEYS.postSurvey);
PAGES_ROUTER.get('/surveys/search',getRateLimit(60000,40),SURVEYS.searchSurveysAndQuestions);
PAGES_ROUTER.get('/surveys',getRateLimit(60000,30),SURVEYS.getSurveys);



PAGES_ROUTER.get('/chat',getRateLimit(60000,60),getChat);
PAGES_ROUTER.get('/like/note/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/blog/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/idea/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/daily-reading/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/tex-notes/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/markdown-notes/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/jupyter-notebooks/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest); 
PAGES_ROUTER.get('/like/goodreads/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/letterboxd/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest); 
PAGES_ROUTER.get('/like/3d-designs/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest); 
PAGES_ROUTER.get('/like/games/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,handleLikeRequest); 
PAGES_ROUTER.get('/like/surveys/:id/:title',getRateLimit(60000,30),AUTH.isLoggedIn,handleLikeRequest);
PAGES_ROUTER.get('/like/electronics-robotics/:id/:title',getRateLimit(60000,30),AUTH.isLoggedIn,handleLikeRequest);

// PAGES_ROUTER.get('/comments/:id',getRateLimit(60000,60),getCommentsPage);
PAGES_ROUTER.get('/annotations/:id',getRateLimit(60000,60),getAnnotationsDialog);
PAGES_ROUTER.post('/annotations/:id',getRateLimit(60000,10),postAnnotationComment);

PAGES_ROUTER.post('/annotate/note/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/blog/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/idea/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/daily-reading/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/surveys/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/goodreads/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/letterboxd/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/games/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/3d-designs/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);
PAGES_ROUTER.post('/annotate/electronics-robotics/:id/:title',getRateLimit(60000,60),AUTH.isLoggedIn,postAnnotation);

PAGES_ROUTER.get('/comments/:id',getRateLimit(60000,60),getDeepComments);
PAGES_ROUTER.post('/comment/note/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/blog/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/idea/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/daily-reading/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/tex-notes/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/markdown-notes/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/jupyter-notebooks/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/goodreads/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/letterboxd/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/games/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/3d-designs/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)
PAGES_ROUTER.post('/comment/electronics-robotics/:id/:title',getRateLimit(60000,2),AUTH.isLoggedIn,postArticleComment)


PAGES_ROUTER.get('/comment/like/:id',getRateLimit(60000,2),AUTH.isLoggedIn,likeComment);
PAGES_ROUTER.get('/comment/add/:id',getRateLimit(60000,30),getCommentForm);
PAGES_ROUTER.post('/comment/add/:id',getRateLimit(60000,30),AUTH.isLoggedIn,postSubComment);
PAGES_ROUTER.get('/comment/more/?',getRateLimit(60000,30),getMoreComments);
PAGES_ROUTER.get('/annotation/upvote/:id',getRateLimit(60000,2),AUTH.isLoggedIn,upvoteDownvoteAnnotation);
PAGES_ROUTER.get('/annotation/downvote/:id',getRateLimit(60000,2),AUTH.isLoggedIn,upvoteDownvoteAnnotation);



/* Search */
PAGES_ROUTER.get('/search/?',getRateLimit(60000,200),getSearch);
PAGES_ROUTER.post('/search/image/?',getRateLimit(60000,10),upload.single('image-search-input'),imageSearch);

/* About */
PAGES_ROUTER.get('/about/?',getRateLimit(60000,500),PAGES.getAbout);
PAGES_ROUTER.get('/change-site-permissions/?',getRateLimit(60000,500),PAGES.getChangeSitePermissionsPage);
/* Privacy Policy */
PAGES_ROUTER.get('/privacy-policy/?',getRateLimit(60000,500),PAGES.getPrivacyPolicy);
/* Article */
PAGES_ROUTER.get('/note/:id/:title/?',getRateLimit(60000,60),ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/blog/:id/:title/?',getRateLimit(60000,60),ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/idea/:id/:title/?',getRateLimit(60000,60),ADMIN.getArticle); // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/note/search/?',getRateLimit(60000,1000),ADMIN.searchNotes);

PAGES_ROUTER.get('/note/?',getRateLimit(60000,500),ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/blog/?',getRateLimit(60000,500),ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/idea/?',getRateLimit(60000,500),ADMIN.getArticlePreviews); // ARTICLE PREVIEWS
/* Daily Reading */
PAGES_ROUTER.post('/daily-reading/update/?',AUTH.isAdmin,getRateLimit(60000,500),upload.single('upload-lexical-wiki'),PAGES.updateDailyReadingArticle);
PAGES_ROUTER.post('/daily-reading/upcoming/?',AUTH.isAdmin,getRateLimit(60000,500),bodyParser.urlencoded({}),PAGES.addUpcomingDailyReading);
PAGES_ROUTER.get('/daily-reading/old/?',getRateLimit(60000,500),AUTH.isAdmin,PAGES.getDailyReadingOld);
PAGES_ROUTER.post('/daily-reading/old/?',getRateLimit(60000,500),AUTH.isAdmin,bodyParser.urlencoded({}),PAGES.postDailyReadingOld);
PAGES_ROUTER.get('/daily-reading/search/?',getRateLimit(60000,500),PAGES.searchDailyReading);
PAGES_ROUTER.get('/daily-reading/:id/:title/?',getRateLimit(60000,60),PAGES.getDailyReadingOfTheDay);  // COMMENTS, ANNOTATIONS
PAGES_ROUTER.get('/daily-reading/?',getRateLimit(60000,500),PAGES.getDailyReading); // ARTICLE PREVIEWS
PAGES_ROUTER.post('/daily-reading/?',AUTH.isAdmin,getRateLimit(60000,500),bodyParser.urlencoded({}),PAGES.postDailyReading);
/* Tex Notes */
PAGES_ROUTER.post('/tex-notes/add-upcoming',AUTH.isAdmin,getRateLimit(60000,500),upload.single('tex-file'),PAGES.addTexNoteUpcoming);
PAGES_ROUTER.post('/tex-notes/complete',AUTH.isAdmin,getRateLimit(60000,500),upload.fields([ { name: 'tex-file', maxCount: 1 }, { name: 'html-file', maxCount: 1 } ]),PAGES.addTexNote);
PAGES_ROUTER.get('/tex-notes/download/:id/:title/?',getRateLimit(60000,10),PAGES.downloadTexNote);
PAGES_ROUTER.get('/tex-notes/:id/:title/?',getRateLimit(60000,500),PAGES.getTexNote);  // COMMENTS 
PAGES_ROUTER.get('/tex-notes/?',getRateLimit(60000,500),PAGES.getTexNotes); // ARTICLE PREVIEWS
/* Download SPA */
PAGES_ROUTER.get('/download-spa-mobile',getRateLimit(60000,500),PAGES.downloadSPAMobile)
/* Quotes */
PAGES_ROUTER.get('/quotes/?',getRateLimit(60000,500),PAGES.getQuotes);
PAGES_ROUTER.post('/quotes/?',AUTH.isAdmin,getRateLimit(60000,500),bodyParser.urlencoded({ }),PAGES.postQuotes);
PAGES_ROUTER.delete('/quotes/:id/?',AUTH.isAdmin,getRateLimit(60000,500),PAGES.deleteQuotes);
/* Admin Article */
PAGES_ROUTER.post('/admin/blog/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/note/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/idea/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.get('/admin/note/search/?',getRateLimit(60000,1000),ADMIN.searchNotes);
PAGES_ROUTER.get('/admin/blog/search/?',getRateLimit(60000,1000),ADMIN.searchNotes);
PAGES_ROUTER.get('/admin/idea/search/?',getRateLimit(60000,1000),ADMIN.searchNotes);
PAGES_ROUTER.post('/admin/blog/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/note/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.post('/admin/idea/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postEditOrCreateArticle);
PAGES_ROUTER.get('/admin/blog/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/note/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/idea/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticlePost);
PAGES_ROUTER.get('/admin/blog/add-version/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.addArticleVersion);
PAGES_ROUTER.get('/admin/note/add-version/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.addArticleVersion);
PAGES_ROUTER.get('/admin/idea/add-version/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.addArticleVersion);
PAGES_ROUTER.delete('/admin/blog/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.delete('/admin/note/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.delete('/admin/idea/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteArticleOrArticleVersion);
PAGES_ROUTER.get('/admin/blog/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticle);
PAGES_ROUTER.get('/admin/note/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticle);
PAGES_ROUTER.get('/admin/idea/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageArticle);
/* Admin Utilities */
PAGES_ROUTER.get('/admin/utilities/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminUtilities);
PAGES_ROUTER.get('/admin/utilities/clear-cache/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminUtilitiesClearCache);
PAGES_ROUTER.get('/admin/utilities/update-search/confirm/?',AUTH.isAdmin,getRateLimit(60000,500),updateSearchConfirm);
PAGES_ROUTER.get('/admin/utilities/update-search/?',AUTH.isAdmin,getRateLimit(60000,500),updateSearch);
PAGES_ROUTER.get('/admin/utilities/update-search-images/confirm/?',AUTH.isAdmin,getRateLimit(60000,500),updateSearchImagesConfirm);
PAGES_ROUTER.get('/admin/utilities/update-search-images/?',AUTH.isAdmin,getRateLimit(60000,500),updateSearchImagesInitial);
PAGES_ROUTER.get('/admin/utilities/index-pages/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminUtilitiesIndexPages);
PAGES_ROUTER.get('/admin/utilities/email/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.sendEmailRoute);
PAGES_ROUTER.get('/admin/view-images/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminViewImagePage);
PAGES_ROUTER.get('/admin/view-images/:nextToken/?:type?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-images/:key',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-audio/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminViewAudioPage);
PAGES_ROUTER.get('/admin/view-audio/:nextToken',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-audio/:key',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-video/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminViewVideoPage);
PAGES_ROUTER.get('/admin/view-video/:nextToken',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getMoreS3Media);
PAGES_ROUTER.delete('/admin/view-video/:key',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.deleteS3Media);
PAGES_ROUTER.get('/admin/view-video/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getAdminViewVideoPage);
PAGES_ROUTER.get('/admin/view-image/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getAdminViewImagePage);
PAGES_ROUTER.get('/admin/view-audio/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getAdminViewAudioPage);
PAGES_ROUTER.get('/admin/create-chart/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getCreateChartPage);
PAGES_ROUTER.get('/admin/to-dos/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getAdminToDosPage);
PAGES_ROUTER.post('/admin/to-dos/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.postToDo);
PAGES_ROUTER.get('/admin/to-dos/:id/complete/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.markToDoComplete);
PAGES_ROUTER.delete('/admin/to-dos/:id/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.deleteToDo);
PAGES_ROUTER.get('/admin/to-dos/:id/edit/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getEditToDo);
PAGES_ROUTER.put('/admin/to-dos/:id/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.postEditToDo);
PAGES_ROUTER.get('/admin/create-game-design',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getCreateGameDesign);

/* Admin Diary */
PAGES_ROUTER.get('/admin/diary/edit/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getEditDiary);
PAGES_ROUTER.get('/admin/diary/:id/:title/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getDiary);
PAGES_ROUTER.get('/admin/diary/?',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.getAdminPageDiary);
PAGES_ROUTER.post('/admin/diary/:id/?',AUTH.isAdmin,getRateLimit(60000,500),bodyParser.json({}),ADMIN.saveDiary);
PAGES_ROUTER.get('/admin/diary/search',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.searchAdminDiary)
PAGES_ROUTER.get('/admin/diary/update',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.updateSearchAdminDiary)

PAGES_ROUTER.post('/admin/notifications',AUTH.isAdmin,getRateLimit(60000,500),ADMIN.postNotifications);

/* Admin */
PAGES_ROUTER.get('/admin/?',AUTH.isAdmin,getRateLimit(60000,50),ADMIN.getAdminPage);

/* Account */
PAGES_ROUTER.get('/account/?',AUTH.isLoggedIn,getRateLimit(60000,500),getAccount);
PAGES_ROUTER.post('/account/profile-picture/?',AUTH.isLoggedIn,getRateLimit(60000,20),postEditProfilePicture);
PAGES_ROUTER.get('/account/username/?',AUTH.isLoggedIn,getRateLimit(60000,20),getEditUsername);
PAGES_ROUTER.post('/account/username/?',AUTH.isLoggedIn,getRateLimit(60000,20),postEditUsername);
PAGES_ROUTER.get('/account/password/?',AUTH.isLoggedIn,getRateLimit(60000,20),getEditPassword);
PAGES_ROUTER.post('/account/password/?',AUTH.isLoggedIn,getRateLimit(60000,20),postEditPassword);
PAGES_ROUTER.get('/account/description/?',AUTH.isLoggedIn,getRateLimit(60000,20),getEditDescription);
PAGES_ROUTER.post('/account/description/?',AUTH.isLoggedIn,getRateLimit(60000,20),postEditDescription);
PAGES_ROUTER.get('/users/:id/:username',getRateLimit(60000,500),getUser);

/* Login */
PAGES_ROUTER.get('/login/?',AUTH.isLoggedOut,getRateLimit(60000,500),getLogin);
PAGES_ROUTER.post('/login/?',AUTH.isLoggedOut,getRateLimit(60000,500),bodyParser.urlencoded({extended:true}),postLogin);
/* Logout */
PAGES_ROUTER.get('/logout/?',AUTH.isLoggedIn,getRateLimit(60000,500),getLogout);
/* Create Account */
PAGES_ROUTER.get('/create-account/finish/?',AUTH.isLoggedOut,getRateLimit(60000,2),finishCreateAccount);
PAGES_ROUTER.get('/create-account/?',AUTH.isLoggedOut,getRateLimit(60000,500),getCreateAccount);
PAGES_ROUTER.post('/create-account/?',AUTH.isLoggedOut,getRateLimit(60000,20),bodyParser.urlencoded({extended:true}),postCreateAccount);
PAGES_ROUTER.post('/create-account/2fa/?',AUTH.isLoggedOut,getRateLimit(60000,5),bodyParser.urlencoded({extended:true}),postCreateAccount2fa);
PAGES_ROUTER.get('/create-account/email/?',AUTH.isLoggedOut,getRateLimit(60000,5),getCreateAccountSendEmail);
/* Reset Credentials */
PAGES_ROUTER.get('/reset-credentials/finish/?',AUTH.isLoggedOut,getRateLimit(60000,2),finishResetCredentials);
PAGES_ROUTER.get('/reset-credentials/?',AUTH.isLoggedOut,getRateLimit(60000,500),getResetCredentials);
PAGES_ROUTER.post('/reset-credentials/?',AUTH.isLoggedOut,getRateLimit(60000,500),bodyParser.urlencoded({extended:true}),postResetCredentials);
PAGES_ROUTER.post('/reset-credentials/2fa/?',AUTH.isLoggedOut,getRateLimit(60000,500),bodyParser.urlencoded({extended:true}),postResetCredentials2fa);
PAGES_ROUTER.get('/reset-credentials/email/?',AUTH.isLoggedOut,getRateLimit(60000,5),resendResetCredentialsEmail);
/* Cookies */
PAGES_ROUTER.use('/cookies/?',getRateLimit(60000,500),COOKIE_ROUTER);
/* Projects */
PAGES_ROUTER.get('/projects/?',getRateLimit(60000,500),PAGES.getProjects);
/* Stream of Consciousness */
PAGES_ROUTER.get('/stream-of-consciousness/?',getRateLimit(60000,500),PAGES.getStreamOfConsciousness)
PAGES_ROUTER.post('/stream-of-consciousness/?',getRateLimit(60000,35),PAGES.postStreamOfConsciousness);
PAGES_ROUTER.post('/stream-of-consciousness/add/?',getRateLimit(60000,500),AUTH.isAdmin,PAGES.addToStreamOfConsciousness);
PAGES_ROUTER.put('/stream-of-consciousness/like/:id/?',getRateLimit(60000,500),AUTH.isLoggedIn,PAGES.likeStreamOfConsciousness);
PAGES_ROUTER.delete('/stream-of-consciousness/:id',getRateLimit(60000,500),AUTH.isAdmin,PAGES.deleteStreamOfConsciousNess);

/* Design System */
PAGES_ROUTER.get('/projects/design-system/?',getRateLimit(60000,500),PROJECTS.getDesignSystemHome);
PAGES_ROUTER.get('/projects/design-system/lexical-rich-text-editor/?',getRateLimit(60000,500),PROJECTS.getLexicalPage)
PAGES_ROUTER.get('/projects/design-system/google-maps/?',getRateLimit(60000,500),PROJECTS.getGoogleMaps)
PAGES_ROUTER.get('/projects/design-system/:component/?',getRateLimit(60000,500),PROJECTS.getDesignSystemComponent);
/* Article Builder */
PAGES_ROUTER.get('/projects/article-builder-1/?',getRateLimit(60000,500),PROJECTS.getArticleBuilder);
PAGES_ROUTER.get('/projects/article-builder-2/?',getRateLimit(60000,500),PROJECTS.getArticleBuilder2);
PAGES_ROUTER.get('/projects/article-builder-3/?',getRateLimit(60000,500),PROJECTS.getArticleBuilder3);
PAGES_ROUTER.get('/projects/article-builder-4/?',getRateLimit(60000,500),PROJECTS.getArticleBuilder4);
PAGES_ROUTER.get('/projects/create-a-survey/search/?',getRateLimit(60000,100),SURVEYS.searchSurveys);
PAGES_ROUTER.get('/projects/create-a-survey/?',getRateLimit(60000,500),PROJECTS.getCreateASurvey);
PAGES_ROUTER.post('/projects/create-a-survey',getRateLimit(60000,2),AUTH.isAdmin,bodyParser.json({}),SURVEYS.postSurvey)
PAGES_ROUTER.get('/projects/html-to-javascript/?',getRateLimit(60000,500),PROJECTS.htmlToJavascriptPage);
PAGES_ROUTER.get('/projects/html-css-javascript-playground/?',getRateLimit(60000,500),PROJECTS.htmlCssJavascriptPlayground);
/* Record Media */
PAGES_ROUTER.get('/projects/record-media/?',getRateLimit(60000,500),PROJECTS.recordMediaTestPage);
PAGES_ROUTER.post('/projects/record-media/page-image',getRateLimit(60000,500),upload.single('image-file'),PROJECTS.recordMediaPageImage);
PAGES_ROUTER.get('/projects/learning-d3-js/:component/?',getRateLimit(60000,500),PROJECTS.learningD3JsComponent);
PAGES_ROUTER.get('/projects/learning-d3-js/?',getRateLimit(60000,500),PROJECTS.learningD3Js);
PAGES_ROUTER.get('/projects/create-svg/?',getRateLimit(60000,500),PROJECTS.createSvgWithPixi);
PAGES_ROUTER.get('/projects/create-gradient/all/?',getRateLimit(60000,500),PROJECTS.getAllUserGradients);
PAGES_ROUTER.get('/projects/create-gradient/?',getRateLimit(60000,500),PROJECTS.createGradient);
PAGES_ROUTER.post('/projects/create-gradient/?',getRateLimit(60000,500),bodyParser.json({}),PROJECTS.postCreateGradient);
PAGES_ROUTER.delete('/projects/create-gradient/:id/?',getRateLimit(60000,500),PROJECTS.deleteCreateGradient);
PAGES_ROUTER.get('/projects/creating-css-sprite-builder/?',getRateLimit(60000,500),PROJECTS.createCssSpriteMaker);
PAGES_ROUTER.get('/projects/excalidraw-implementation/?',getRateLimit(60000,500),PROJECTS.excalidrawImplementation);
PAGES_ROUTER.get('/projects/create-three-js-texture/?',getRateLimit(60000,500),PROJECTS.createThreeJSTexture);
PAGES_ROUTER.get('/projects/three-js-playground/?',getRateLimit(60000,500),PROJECTS.threeJSPlayground);
/* Census Information */
PAGES_ROUTER.get('/projects/census-info-near-you/?',getRateLimit(60000,500),PROJECTS.informationNearYou);
PAGES_ROUTER.get('/projects/census-info-near-you/community/:id/?',getRateLimit(60000,500),getSpecificCensusCommunity);
PAGES_ROUTER.post('/projects/census-info-near-you/?',getRateLimit(60000,20),searchCensusCommunity);

PAGES_ROUTER.get('/projects/markdown-to-html',getRateLimit(60000,500),PROJECTS.markdownToHTML);
PAGES_ROUTER.get('/projects/lexical-implementations/?',getRateLimit(60000,500),PROJECTS.getLexicalImplementations);
PAGES_ROUTER.post('/projects/lexical-implementations/:type/?',getRateLimit(60000,500),PROJECTS.onPostLexicalImplementation);
PAGES_ROUTER.get('/projects/configure-size-adjust-property/?',getRateLimit(60000,500),PROJECTS.getFontSizeAdjust);
PAGES_ROUTER.post('/projects/configure-size-adjust-property/?',getRateLimit(60000,500),PROJECTS.onFontSizeAdjustChange);
PAGES_ROUTER.get('/projects/embed-social-media-posts/?',getRateLimit(60000,500),PROJECTS.getLookingIntoEmbedingSocialMediaPosts);
PAGES_ROUTER.get('/projects/testing-css-env-variables/?',getRateLimit(60000,500),PROJECTS.getTestCssEnvVariables)
PAGES_ROUTER.post('/projects/image-editor/resize/?',upload.single('upload-image-resize'),getRateLimit(60000,10),PROJECTS.postImageEditorResize);
PAGES_ROUTER.get('/projects/image-editor/?',getRateLimit(60000,500),PROJECTS.getImageEditor);
PAGES_ROUTER.get('/projects/neural-style-transfer/?',getRateLimit(60000,500),PROJECTS.getNeuralStyleTransfer);
PAGES_ROUTER.get('/projects/convert-file-type/?',getRateLimit(60000,500),PROJECTS.getConvertFileType);
PAGES_ROUTER.post('/projects/convert-file-type/image/?',getRateLimit(60000,20),upload.single('image-file'),PROJECTS.postConvertImageType);
PAGES_ROUTER.post('/projects/convert-file-type/audio/?',getRateLimit(60000,4),upload.single('audio-file'),PROJECTS.postConvertAudioType);
PAGES_ROUTER.post('/projects/convert-file-type/video/?',getRateLimit(60000,4),upload.single('video-file'),PROJECTS.postConvertVideoType);
PAGES_ROUTER.post('/projects/convert-file-type/text/?', getRateLimit(60000,10), upload.single('text-file'),PROJECTS.postConvertTextFileType);
PAGES_ROUTER.get('/projects/get-file-information/?',getRateLimit(60000,500),upload.single('image-file'),PROJECTS.getFileInformation);
PAGES_ROUTER.post('/projects/get-file-information/image/?',getRateLimit(60000,20),upload.single('image-file'),PROJECTS.postGetFileInformationImage);
PAGES_ROUTER.post('/projects/get-file-information/audio/?',getRateLimit(60000,4),upload.single('audio-file'),PROJECTS.postGetFileInformationAudio);
PAGES_ROUTER.post('/projects/get-file-information/video/?',getRateLimit(60000,4),upload.single('video-file'),PROJECTS.postGetFileInformationVideo);
PAGES_ROUTER.post('/projects/get-file-information/text/?',getRateLimit(60000,10),upload.single('text-file'),PROJECTS.postGetFileInformationText);
PAGES_ROUTER.get('/projects/various-nlp-tasks/?',getRateLimit(60000,500),PROJECTS.getVariousNlpTasks);
PAGES_ROUTER.post("/projects/various-nlp-tasks/fill-mask",getRateLimit(60000,7),PROJECTS.postFillMask);
PAGES_ROUTER.post("/projects/various-nlp-tasks/answer-question",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postAnswerQuestion);
PAGES_ROUTER.post("/projects/various-nlp-tasks/sentiment-analysis",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postSentimentAnalysis);
PAGES_ROUTER.post("/projects/various-nlp-tasks/ner",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postNamedEntityRecognition);
PAGES_ROUTER.post("/projects/various-nlp-tasks/classification",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postNlpClassification);
PAGES_ROUTER.post("/projects/various-nlp-tasks/feature-extraction",getRateLimit(60000,7),PROJECTS.postFeatureExtraction);
PAGES_ROUTER.post("/projects/various-nlp-tasks/summarization",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postSummarization);
PAGES_ROUTER.post("/projects/various-nlp-tasks/keyword-extraction",getRateLimit(60000,7),upload.single('text-file'),PROJECTS.postKeywordExtraction);
PAGES_ROUTER.post("/projects/various-nlp-tasks/openai",getRateLimit(60000,5),upload.single('text-file'),PROJECTS.postOpenAITextModeration);
PAGES_ROUTER.get('/projects/various-image-tasks/?',getRateLimit(60000,500),PROJECTS.getVariousImageTasks);
PAGES_ROUTER.post("/projects/various-image-tasks/feature-extraction",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postImageFeatureExtraction);
PAGES_ROUTER.post("/projects/various-image-tasks/image-safe-search",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postImageSafeSearch);
PAGES_ROUTER.post("/projects/various-image-tasks/image-captioning",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postImageCaptioning);
PAGES_ROUTER.post("/projects/various-image-tasks/depth-estimation",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postDepthEstimation);
PAGES_ROUTER.post("/projects/various-image-tasks/object-detection",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postObjectDetection);
PAGES_ROUTER.post("/projects/various-image-tasks/image-segmentation",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postImageSegmentation);
PAGES_ROUTER.post("/projects/various-image-tasks/keypoint-detection",getRateLimit(60000,7),upload.single('image-file'),PROJECTS.postKeypointDetection);
PAGES_ROUTER.post("/projects/various-image-tasks/openai",getRateLimit(60000,5),upload.single('image-file'),PROJECTS.postOpenAIImageModeration);
PAGES_ROUTER.get('/projects/chat/information-on-models/?',getRateLimit(60000,500),PROJECTS.getAiChatInformationOnModels);
PAGES_ROUTER.get('/projects/chat/?',getRateLimit(60000,500),PROJECTS.getAiChat);
PAGES_ROUTER.get('/projects/ncaa-basketball-tournament/?',VISUALIZATION.getNCAABasketballTournament)
PAGES_ROUTER.get('/projects/learning-html5-canvas/?',VISUALIZATION.learningHTML5Canvas)
PAGES_ROUTER.get('/projects/sense-of-style/?',PROJECTS.getSenseOfStyle)
PAGES_ROUTER.post('/projects/sense-of-style/?',AUTH.isAdmin,PROJECTS.postSenseOfStyle)
PAGES_ROUTER.get('/projects/web-apis/:page?',PROJECTS.getWebAPIs);
PAGES_ROUTER.post('/projects/table-conversion/file/?',getRateLimit(60000,5),upload.single('table-file'),PROJECTS.postTableConversionFile);
PAGES_ROUTER.post('/projects/table-conversion/text/?',getRateLimit(60000,10),PROJECTS.postTableConversionText);
PAGES_ROUTER.post('/projects/table-conversion/url/?',getRateLimit(60000,5),PROJECTS.postTableConversionUrl);
PAGES_ROUTER.get('/projects/table-conversion/?',getRateLimit(60000,500),PROJECTS.getTableConversionPage);
PAGES_ROUTER.get('/projects/create-a-chart/?',getRateLimit(60000,500),PROJECTS.getCreateChartPage);
PAGES_ROUTER.get('/projects/testing-select-implementations/?',getRateLimit(60000,500),PROJECTS.getTestingSelectImplementations);


PAGES_ROUTER.get('/projects/google-colab-clone/?',getRateLimit(60000,500),PROJECTS.getGoogleColabClone);
PAGES_ROUTER.get('/projects/testing-recommendation-systems/?',getRateLimit(60000,500),PROJECTS.getTestingRecommendationSystems);
PAGES_ROUTER.get('/projects/sorting-mechanisms/?',getRateLimit(60000,500),PROJECTS.getSortingMechanisms);
PAGES_ROUTER.get('/projects/bokeh-functionality-survey/?',getRateLimit(60000,500),PROJECTS.getBokehFunctionalityPage);

PAGES_ROUTER.get('/projects/three-js/?',getRateLimit(60000,500),PROJECTS.getThreeJsPage);
PAGES_ROUTER.get('/projects/webgl/?',getRateLimit(60000,500),PROJECTS.getWebGLPage);
PAGES_ROUTER.get('/projects/webgpu/?',getRateLimit(60000,500),PROJECTS.getWebGPUPage);


/* Markdown Notes */
PAGES_ROUTER.get('/markdown-notes/?',getRateLimit(60000,500),MARKDOWN.getMarkdownNotesPage); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/markdown-notes/download/:id/:title/?',getRateLimit(60000,10),MARKDOWN.downloadNote);
PAGES_ROUTER.get('/markdown-notes/:id/:title/?',getRateLimit(60000,500),MARKDOWN.getMarkdownNotePage); // COMMENTS
PAGES_ROUTER.post('/markdown-notes/?',getRateLimit(60000,500),AUTH.isAdmin,bodyParser.urlencoded({}),MARKDOWN.postMarkdownNote);
PAGES_ROUTER.put('/markdown-notes/:id/:title/?',getRateLimit(60000,500),AUTH.isAdmin,bodyParser.urlencoded({}),MARKDOWN.putMarkdownNote);
PAGES_ROUTER.delete('/markdown-notes/:id/:title/?',getRateLimit(60000,500),AUTH.isAdmin,MARKDOWN.deleteMarkdownNote);


/* Jupyter Notebooks */
PAGES_ROUTER.get('/jupyter-notebooks/search/?',getRateLimit(60000,1000),bodyParser.urlencoded({}),JUPYTER.searchJupyterNotebook);
PAGES_ROUTER.get('/jupyter-notebooks/?',getRateLimit(60000,500),JUPYTER.getJupyterNotebooksPage); // ARTICLE PREVIEWS
PAGES_ROUTER.get('/jupyter-notebook/download/:id/:title',getRateLimit(60000,10),JUPYTER.downloadJupyterNotebook); // COMMENTS
PAGES_ROUTER.get('/jupyter-notebooks/:id/:title/?',getRateLimit(60000,500),JUPYTER.getJupyterNotebook);
PAGES_ROUTER.post('/jupyter-notebooks/?',getRateLimit(60000,500),AUTH.isAdmin,jupyterNotebookFields,JUPYTER.postJupyterNotebook);
PAGES_ROUTER.delete('/jupyter-notebooks/:id/:title/?',getRateLimit(60000,500),AUTH.isAdmin,JUPYTER.deleteJupyterNotebook);
/* Projects Archive */
PAGES_ROUTER.get('/projects-archive/three-js-test/?',getRateLimit(60000,500),PROJECTS_ARCHIVE.threeJSTest);
PAGES_ROUTER.get('/projects-archive/creating-full-text-search/?',getRateLimit(60000,500),PROJECTS_ARCHIVE.creatingFullTextSearch)
PAGES_ROUTER.get('/projects-archive/implementing-auth/?',getRateLimit(60000,500),PROJECTS_ARCHIVE.implementingAuth);
PAGES_ROUTER.get('/projects-archive/svg-basics/?',getRateLimit(60000,500),PROJECTS_ARCHIVE.svgBasics);
PAGES_ROUTER.get('/projects-archive/handbook-data-visualization/?',getRateLimit(60000,500),PROJECTS_ARCHIVE.getHandbookOfDataVisualizationBook);

/* AI Tools */
PAGES_ROUTER.get('/ai-tools',getRateLimit(60000,500),NEW_PAGES.getAITools);
PAGES_ROUTER.get('/ai-tools/ai-chat/:uuid/?',getRateLimit(60000,500),NEW_PAGES.getAIChatPage);
PAGES_ROUTER.get('/ai-tools/ai-chat/?',getRateLimit(60000,500),NEW_PAGES.getAIChatPage);
PAGES_ROUTER.get('/ai-chat/search/:id/?',getRateLimit(60000,500),NEW_PAGES.searchAIChatResult);
PAGES_ROUTER.get('/ai-chat/search/?',getRateLimit(60000,500),NEW_PAGES.searchAIChat);


/* Letterboxd */
PAGES_ROUTER.get('/letterboxd/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.getLetterboxdPage);
PAGES_ROUTER.post('/letterboxd/?',getRateLimit(60000,20),AUTH.isAdmin,NEW_PAGES.postLetterboxd);
PAGES_ROUTER.get('/letterboxd/?',getRateLimit(60000,500),NEW_PAGES.getLetterboxd);


/* GoodReads */
PAGES_ROUTER.get('/goodreads/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.getGoodreadPage);
PAGES_ROUTER.post('/goodreads/?',getRateLimit(60000,20),AUTH.isAdmin,NEW_PAGES.postGoodRead);
PAGES_ROUTER.get('/goodreads/?',getRateLimit(60000,500),NEW_PAGES.getGoodreads);


/* 3D Designs */
PAGES_ROUTER.get('/3d-designs/?',getRateLimit(60000,500),NEW_PAGES.get3dDesigns);
PAGES_ROUTER.get('/3d-designs/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.get3dDesign);
PAGES_ROUTER.get('/download/3d-designs/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.download3dDesign);
PAGES_ROUTER.post('/3d-designs/new',AUTH.isAdmin,NEW_PAGES.post3dDesign);
PAGES_ROUTER.post('/3d-designs/upload-asset/?',getRateLimit(60000,500),AUTH.isAdmin,upload.single('asset-file-3d-design'),NEW_PAGES.post3dDesignAsset);
PAGES_ROUTER.post('/3d-designs/upload-script/?',getRateLimit(60000,500),AUTH.isAdmin,upload.single('js-file-3d-design'),NEW_PAGES.post3dDesignJavaScript);


/* Games */
PAGES_ROUTER.get('/games/?',getRateLimit(60000,500),NEW_PAGES.getGames);
PAGES_ROUTER.get('/games/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.getGame);
PAGES_ROUTER.post('/games/new/?',getRateLimit(60000,500),AUTH.isAdmin,NEW_PAGES.postGame);
PAGES_ROUTER.post('/games/upload-game-script',getRateLimit(60000,500),AUTH.isAdmin,upload.single('js-file-game'),NEW_PAGES.postGameJavaScript);


PAGES_ROUTER.get('/electronics-robotics/:id/:title/?',getRateLimit(60000,500),NEW_PAGES.getElectronicsAndRoboticsProject);
PAGES_ROUTER.get('/electronics-robotics/?',getRateLimit(60000,500),NEW_PAGES.getElectronicsAndRobotics);
PAGES_ROUTER.post('/electronics-robotics/?',AUTH.isAdmin,getRateLimit(60000,10),NEW_PAGES.postElectronicsAndRobotics);


/* Links */
PAGES_ROUTER.get('/links/?',PAGES.getFranksLinks);
PAGES_ROUTER.post('/links/search/?',bodyParser.urlencoded({}),PAGES.searchFranksLink);
PAGES_ROUTER.post('/links/create/?',bodyParser.urlencoded({}),AUTH.isAdmin,PAGES.addFranksLink);
/* Utilities */
PAGES_ROUTER.get('/utilities/?',getRateLimit(60000,500),PAGES.getUtilities);
PAGES_ROUTER.post('/utilities/get-image-data/?',getRateLimit(60000,500),upload.single('upload-image-for-data'),PAGES.postGetImageData);
/* Test */
PAGES_ROUTER.get('/test/?',getRateLimit(60000,500),AUTH.isDevelopment,PAGES.getTest);
PAGES_ROUTER.post('/test/?',getRateLimit(60000,500),AUTH.isDevelopment,bodyParser.urlencoded({}),PAGES.postTest);
PAGES_ROUTER.post('/test/run',getRateLimit(60000,500),AUTH.isDevelopment,bodyParser.urlencoded({}),PAGES.postTestRun)
/* Home */
PAGES_ROUTER.get('/?',getRateLimit(60000,500),PAGES.getHome);
/* Not Found */
PAGES_ROUTER.use('/:something',getRateLimit(60000,500),PAGES.get404);
PAGES_ROUTER.use('*',notFound);

export default PAGES_ROUTER