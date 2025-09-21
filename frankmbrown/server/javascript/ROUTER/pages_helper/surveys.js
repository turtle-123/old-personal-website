"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSurveysAndQuestions = exports.downloadSurvey = exports.postSaveSurvey = exports.searchSurveys = exports.postSurveyResponse = exports.postSurvey = exports.getSurvey = exports.getSurveys = exports.isValidTimeString = exports.isValidDateString = void 0;
const html_1 = require("../html");
const redirect_override_1 = require("../helper_functions/redirect-override");
const frontendHelper_1 = require("../helper_functions/frontendHelper");
const database_1 = __importDefault(require("../../database"));
const lexical_1 = require("../../lexical");
const escape_html_1 = __importDefault(require("escape-html"));
const time_1 = require("../../utils/time");
const escape_html_2 = __importDefault(require("escape-html"));
const mediaHelpers_1 = require("../../aws/mediaHelpers");
const image_1 = require("../../utils/image");
const ai_1 = require("../../ai");
const set_1 = require("../../utils/set");
const handleArticleData_1 = require("./article_helpers/handleArticleData");
const pg_1 = require("pgvector/pg");
const ejs_1 = __importDefault(require("ejs"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const BASE_PATH_1 = __importDefault(require("../../CONSTANTS/BASE_PATH"));
const lexicalImplementations_1 = require("./lexicalImplementations");
const IS_DEVELOPMENT_1 = __importDefault(require("../../CONSTANTS/IS_DEVELOPMENT"));
const lexicalLexical_1 = require("../../lexical/lexicalLexical");
const number_1 = require("../../utils/number");
const projects_1 = require("./projects");
const decimal_js_1 = require("decimal.js");
const DECIMAL_ZERO = new decimal_js_1.Decimal(0);
const SURVEY_PREVIEW = node_fs_1.default.readFileSync(node_path_1.default.resolve(BASE_PATH_1.default, 'views', 'partials', 'survey-preview.ejs'), { encoding: 'utf-8' });
function isValidDateString(s) {
    try {
        if (!!!s.length)
            return false;
        const d = new Date(s);
        return Boolean(d);
    }
    catch (error) {
        console.error(error);
        return false;
    }
}
exports.isValidDateString = isValidDateString;
function isValidTimeString(s) {
    try {
        if (!!!/\d\d:\d\d(:\d\d?)/.test(s))
            return false;
        const arr = s.split(':').map((n) => parseInt(n));
        if (arr[0] >= 24 || arr[0] < 0 || arr[1] < 0 || arr[1] >= 60)
            return false;
        if ((arr === null || arr === void 0 ? void 0 : arr[2]) && (arr[2] < 0 || arr[2] >= 60))
            return false;
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
exports.isValidTimeString = isValidTimeString;
async function handleQuestionStateOptionTypePost(option, i, ranking = false) {
    var _a;
    const ret = { valid: true, error: '', question: i, questionState: {} };
    if (!!!ranking) {
        if (typeof option.defaultChecked !== 'boolean') {
            ret.valid = false;
            ret.error = "Unable to detect whther quesion option should be checked by default.";
            return ret;
        }
    }
    switch (option.type) {
        case 'audio': {
            const { src, title } = option;
            if (title.length > 50 || title.length < 1) {
                ret.valid = false;
                ret.error = "Title for audio input must be between 1 and 50 characters.";
                return ret;
            }
            if (!!!src.startsWith('https://audio.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the audio input is not valid.";
                return ret;
            }
            const audioInformation = await (0, mediaHelpers_1.getAudioInformationLexical)([src]);
            const able_to_validate = audioInformation[0] === null;
            const safe = audioInformation[0] === null || audioInformation[0].flagged === null ? undefined : audioInformation[0].flagged === false;
            ret.questionState = {
                type: 'audio',
                src,
                title,
                able_to_validate,
                safe
            };
            if (!!!ranking) {
                ret.questionState.defaultChecked = option.defaultChecked;
            }
            if (able_to_validate && safe === false) {
                ret.valid = false;
                ret.error = "An audio option for one of the questions contains nsfw material.";
                return ret;
            }
            return ret;
        }
        case 'image': {
            const { src, shortDescription, longDescription } = option;
            if (!!!src.startsWith('https://image.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the image input is not valid.";
                return ret;
            }
            if (shortDescription.length > 50) {
                ret.valid = false;
                ret.error = "The short image description can not be longer than 50 characters.";
                return ret;
            }
            if (longDescription.length > 200) {
                ret.valid = false;
                ret.error = "The long image description can not be longer than 200 characters.";
                return ret;
            }
            var caption = '';
            if (shortDescription.length) {
                caption += shortDescription;
            }
            if (longDescription.length) {
                if (caption !== '')
                    caption += ': '.concat(longDescription);
                else
                    caption = longDescription;
            }
            const imageInformation = await (0, mediaHelpers_1.getImagesInformationLexical)([{ url: src, caption }]);
            const safe = imageInformation[0] === null || imageInformation[0].nsfw === null ? undefined : imageInformation[0].nsfw < 90;
            const able_to_validate = imageInformation[0] !== null && imageInformation[0].nsfw !== null;
            if (able_to_validate && safe === false) {
                ret.valid = false;
                ret.error = "An image option for one of the questions contains nsfw material.";
                return ret;
            }
            var width = 0;
            var height = 0;
            if (imageInformation[0] !== null && typeof imageInformation[0].width === 'number' && typeof imageInformation[0].height === 'number') {
                width = imageInformation[0].width;
                height = imageInformation[0].height;
            }
            if (width === 0 || height === 0) {
                const image = await (0, image_1.getImageFromUrl)(src);
                const ffmpegImageInfo = await (0, image_1.getImageInformation)(image);
                if (ffmpegImageInfo.width && ffmpegImageInfo.height) {
                    width = ffmpegImageInfo.width;
                    height = ffmpegImageInfo.height;
                }
            }
            if (width !== 0 && height !== 0) {
                ret.questionState = {
                    type: 'image',
                    src,
                    shortDescription,
                    longDescription,
                    able_to_validate,
                    safe,
                    width,
                    height
                };
                if (!!!ranking) {
                    ret.questionState.defaultChecked = option.defaultChecked;
                }
            }
            return ret;
        }
        case 'video': {
            const { src, title, description, height: heightClient } = option;
            if (!!!src.startsWith('https://video.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the video input is not valid.";
                return ret;
            }
            if (typeof title !== 'string' || title.length < 0 || title.length > 50) {
                ret.valid = false;
                ret.error = "Invalid video option title. The length of the title must be1 to 50 characters.";
                return ret;
            }
            if (typeof heightClient !== 'number') {
                ret.valid = false;
                ret.error = "Unable to find a height for the provided video.";
                return ret;
            }
            if (typeof description !== 'string' || description.length > 200) {
                ret.valid = false;
                ret.error = "Video description must be a string less than 200 characters.";
                return ret;
            }
            const videoInformation = await (0, mediaHelpers_1.getVideoInformationLexical)([src]);
            const able_to_validate = videoInformation[0] !== null && videoInformation[0].flagged !== null;
            const safe = videoInformation[0] === null || videoInformation[0].flagged === null ? undefined : videoInformation[0].flagged === false;
            if (able_to_validate && safe === false) {
                ret.valid = false;
                ret.error = "A video option for one of the questions contains nsfw material.";
                return ret;
            }
            var height = heightClient;
            if ((_a = videoInformation[0]) === null || _a === void 0 ? void 0 : _a.height) {
                height = videoInformation[0].height;
            }
            ret.questionState = {
                type: 'video',
                src,
                title,
                description,
                height,
                able_to_validate,
                safe
            };
            if (!!!ranking) {
                ret.questionState.defaultChecked = option.defaultChecked;
            }
            return ret;
        }
        case 'survey-paragraph': {
            const { option: editorStateStr } = option;
            try {
                const { editorState, innerText, desktop_html, tablet_html, mobile_html, able_to_validate, contains_nsfw, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls } = await (0, lexical_1.parseSurveyOptionEditor)(JSON.parse(editorStateStr));
                ret.questionState = {
                    type: 'survey-paragraph',
                    editorState,
                    innerText,
                    desktop_html,
                    tablet_html,
                    mobile_html,
                    able_to_validate,
                    contains_nsfw,
                    unvalidated_image_urls,
                    unvalidated_audio_urls,
                    unvalidated_video_urls
                };
                if (!!!ranking) {
                    ret.questionState.defaultChecked = option.defaultChecked;
                }
                return ret;
            }
            catch (e) {
                console.error(e);
                ret.valid = false;
                ret.error = "Video description must be a string less than 200 characters.";
                return ret;
            }
        }
        default: {
            ret.valid = false;
            ret.error = "Invalid question type.";
            return ret;
        }
    }
}
async function validateQuestionStatesPost(questions) {
    const ret_arr = [];
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const ret = { valid: true, error: '', question: i, questions: [] };
        const to_push = { editorState: {}, desktop_html: '', tablet_html: '', mobile_html: '', innerText: '' };
        const questionState = JSON.parse(question.question);
        try {
            const { editorState, innerText, desktop_html, tablet_html, mobile_html, contains_nsfw, able_to_validate, unvalidated_image_urls, unvalidated_audio_urls, unvalidated_video_urls } = await (0, lexical_1.parseSurveyQuestionEditor)(questionState);
            to_push.editorState = editorState;
            to_push.innerText = innerText;
            to_push.desktop_html = desktop_html;
            to_push.tablet_html = tablet_html;
            to_push.mobile_html = mobile_html;
            to_push.contains_nsfw = contains_nsfw;
            to_push.able_to_validate = able_to_validate;
            to_push.unvalidated_image_urls = unvalidated_image_urls;
            to_push.unvalidated_audio_urls = unvalidated_audio_urls;
            to_push.unvalidated_video_urls = unvalidated_video_urls;
            if (contains_nsfw) {
                ret.valid = false;
                ret.error = `Question ${i} contains nsfw content.`;
                return ret;
            }
        }
        catch (e) {
            console.error(e);
            ret.valid = false;
            ret.error = "Invalid question lexical state.";
            return ret;
        }
        const version = question.VERSION;
        if (version !== 1) {
            ret.valid = false;
            ret.error = "Invalid question state version.";
            return ret;
        }
        to_push.VERSION = version;
        const required = question.required;
        if (typeof required !== 'boolean') {
            ret.valid = false;
            ret.error = "Unable to tell whether question is required.";
            return ret;
        }
        to_push.required = required;
        switch (question.type) {
            case 'survey-audio': {
                to_push.type = 'survey-audio';
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-checkbox': {
                to_push.type = 'survey-checkbox';
                const { options } = question;
                const min_selected_options = question.min_selected_options;
                const max_selected_options = question.max_selected_options;
                if (Number.isInteger(min_selected_options) && Number(min_selected_options) < 0 || Number(min_selected_options) > 100) {
                    ret.error = "Invalid minimum number of selected options requirement for checkbox input.";
                    ret.valid = false;
                    return ret;
                }
                if (Number.isInteger(max_selected_options) && Number(max_selected_options) < 0 || Number(max_selected_options) > 100) {
                    ret.error = "Invalid maximum number of selected options requirement for checkbox input.";
                    ret.valid = false;
                    return ret;
                }
                if (Number.isInteger(min_selected_options) && Number.isInteger(max_selected_options)) {
                    if (Number(min_selected_options) > Number(max_selected_options)) {
                        ret.error = "The minimum number of selected options for the checkbox input can not be greater than the maximum number of selected options.";
                        ret.valid = false;
                        return ret;
                    }
                }
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypePost(option, i)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    ret.error = INVALID[0].error;
                    ret.valid = false;
                    return ret;
                }
                const optionStates = promiseArr.map((obj) => obj.questionState);
                to_push.min_selected_options = Number.isInteger(min_selected_options) ? Number(min_selected_options) : null;
                to_push.max_selected_options = Number.isInteger(max_selected_options) ? Number(max_selected_options) : null;
                to_push.options = optionStates;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-color': {
                to_push.type = 'survey-color';
                const { defaultColor } = question;
                if (!!!/^#([A-Fa-f0-9]{6})$/.test(defaultColor)) {
                    ret.error = "Invalid color for color survey question.";
                    ret.valid = false;
                    return ret;
                }
                to_push.defaultColor = defaultColor;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-date': {
                to_push.type = 'survey-date';
                const { minDate, maxDate, step } = question;
                if (minDate && !!!isValidDateString(minDate)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum date.";
                    return ret;
                }
                if (maxDate && !!!isValidDateString(maxDate)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum date.";
                    return ret;
                }
                if (minDate && maxDate && (new Date(maxDate)) < (new Date(minDate))) {
                    ret.valid = false;
                    ret.error = "The minimum date cannot be greater than the maximum date.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                to_push.minDate = minDate;
                to_push.maxDate = maxDate;
                to_push.step = step;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-datetime': {
                to_push.type = 'survey-datetime';
                const { minDatetime, maxDatetime, step } = question;
                if (minDatetime && !!!isValidDateString(minDatetime)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum datetime.";
                    return ret;
                }
                if (maxDatetime && !!!isValidDateString(maxDatetime)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum datetime.";
                    return ret;
                }
                if (minDatetime && maxDatetime && (new Date(maxDatetime)) < (new Date(minDatetime))) {
                    ret.valid = false;
                    ret.error = "The minimum datetime cannot be greater than the maximum datetime.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                to_push.minDatetime = minDatetime;
                to_push.maxDatetime = maxDatetime;
                to_push.step = step;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-image': {
                to_push.type = 'survey-image';
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-month': {
                to_push.type = 'survey-month';
                const { minMonth, maxMonth, step } = question;
                if (minMonth && !!!isValidDateString(minMonth)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum month value.";
                    return ret;
                }
                if (maxMonth && !!!isValidDateString(maxMonth)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum month value.";
                    return ret;
                }
                if (minMonth && maxMonth && (new Date(maxMonth)) < (new Date(minMonth))) {
                    ret.valid = false;
                    ret.error = "The minimum month can not be greater than the maximum month.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                to_push.minMonth = minMonth;
                to_push.maxMonth = maxMonth;
                to_push.step = step;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-multiple-choice': {
                to_push.type = 'survey-multiple-choice';
                const { options } = question;
                const moreThanOneChecked = options.filter((obj) => obj.defaultChecked).length > 1;
                if (moreThanOneChecked) {
                    ret.valid = false;
                    ret.error = "Only one value can be checked by default for multiple choice questions.";
                    return ret;
                }
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypePost(option, i)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    ret.error = INVALID[0].error;
                    ret.valid = false;
                    return ret;
                }
                const optionStates = promiseArr.map((obj) => obj.questionState);
                to_push.options = optionStates;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-number': {
                to_push.type = 'survey-number';
                const { min, max, step } = question;
                if (min && isNaN(min)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum value for number input.";
                    return ret;
                }
                if (max && isNaN(max)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum value for number input.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                to_push.min = min;
                to_push.max = max;
                to_push.step = step;
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-paragraph': {
                to_push.type = 'survey-paragraph';
                const { minLength, maxLength } = question;
                if (minLength && (isNaN(minLength) || minLength < 0)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum length. Minimum length must be at least 0.";
                    return ret;
                }
                if (maxLength && (isNaN(maxLength) || maxLength < 1)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum length. Max length must be at least 1.";
                    return ret;
                }
                if (minLength && maxLength && maxLength < minLength) {
                    ret.valid = false;
                    ret.error = "The minimum length required for the paragraph can not be greater than the maximum length required.";
                    return ret;
                }
                to_push.minLength = minLength;
                to_push.maxLength = maxLength;
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-range': {
                to_push.type = 'survey-range';
                const { rangeMin, rangeMax, rangeStep, rangePointDescriptions } = question;
                if (isNaN(rangeMin)) {
                    ret.valid = false;
                    ret.error = "Invalid range minimum.";
                    return ret;
                }
                if (isNaN(rangeMax)) {
                    ret.valid = false;
                    ret.error = "Invalid range maximum.";
                    return ret;
                }
                if (rangeMax < rangeMin) {
                    ret.valid = false;
                    ret.error = "Range minimum can not be grater than range maximum.";
                    return ret;
                }
                if (isNaN(rangeStep) || rangeStep < 0) {
                    ret.valid = false;
                    ret.error = "Invalid range step. Range step must be greater than 0.";
                    return ret;
                }
                to_push.rangeMin = rangeMin;
                to_push.rangeMax = rangeMax;
                to_push.rangeStep = rangeStep;
                if (rangePointDescriptions.length > 6) {
                    ret.valid = false;
                    ret.error = "A maximum of 6 range point descriptions are allowed.";
                    return ret;
                }
                try {
                    const promiseArr = await Promise.all(rangePointDescriptions.map((obj) => (0, lexical_1.parseSurveyRangeDescriptionEditor)(JSON.parse(obj.description))));
                    const arr = [];
                    for (let i = 0; i < promiseArr.length; i++) {
                        const { point: pointNumber } = rangePointDescriptions[i];
                        if (pointNumber < rangeMin || pointNumber > rangeMax || (!!!decimal_js_1.Decimal.mod(pointNumber - rangeMin, rangeStep).equals(DECIMAL_ZERO))) { // MOD
                            ret.valid = false;
                            ret.error = "Invalid range point value.";
                            return ret;
                        }
                        const obj = promiseArr[i];
                        delete obj.tableOfContents;
                        arr.push({ point: pointNumber, ...obj });
                        if (obj.contains_nsfw) {
                            ret.valid = false;
                            ret.error = "A range description contains nsfw content.";
                            return ret;
                        }
                    }
                    to_push.rangePointDescriptions = arr;
                }
                catch (e) {
                    console.error(e);
                    ret.valid = false;
                    ret.error = "Invalid range point descriptions.";
                    return ret;
                }
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-ranking': {
                to_push.type = 'survey-ranking';
                const { options } = question;
                var original_order_current = 1;
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypePost(option, i, true)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    ret.error = INVALID[0].error;
                    ret.valid = false;
                    return ret;
                }
                const arr = [];
                for (let i = 0; i < options.length; i++) {
                    const option = options[i];
                    if (option.original_order !== original_order_current) {
                        ret.valid = false;
                        ret.error = "Something went wrong with the ordering of the ranking options.";
                        return ret;
                    }
                    original_order_current += 1;
                    const obj = promiseArr[i];
                    arr.push({ ...obj.questionState, original_order: option.original_order });
                }
                to_push.options = arr;
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-selection': {
                to_push.type = 'survey-selection';
                if (typeof question.include_other !== 'boolean') {
                    ret.valid = false;
                    ret.error = "Unable to determine whether the selection input should include an 'Other' option.";
                    return ret;
                }
                const options = question.options;
                const moreThanOneSelected = options.filter((obj) => obj.selected).length > 1;
                if (moreThanOneSelected) {
                    ret.valid = false;
                    ret.error = "Only one option can be selected by default for the selection input.";
                    return ret;
                }
                var currIndex = 0;
                var selectionText = '';
                for (let option of options) {
                    const { option: textOption, selected, index } = option;
                    if (typeof selected !== 'boolean') {
                        ret.valid = false;
                        ret.error = "Unable to detect whether select option is selected by default.";
                        return ret;
                    }
                    if (index !== currIndex) {
                        ret.valid = false;
                        ret.error = "Something went wrong getting the indices for the select options..";
                        return ret;
                    }
                    currIndex += 1;
                    if (typeof textOption !== 'string' || textOption.length === 0 || textOption.length > 200) {
                        ret.valid = false;
                        ret.error = "Invalid select option. The length of each select option must be between 1 and 200 characters.";
                        return ret;
                    }
                    selectionText += textOption + ", ";
                }
                to_push.include_other = question.include_other;
                to_push.selectionText = selectionText;
                to_push.options = options;
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-short-answer': {
                to_push.type = 'survey-short-answer';
                const { minLength, maxLength } = question;
                if (minLength && (isNaN(minLength) || minLength < 0)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum length. Minimum length must be at least 0.";
                    return ret;
                }
                if (maxLength && (isNaN(maxLength) || maxLength < 1)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum length. Maximum length must be at least 1.";
                    return ret;
                }
                if (minLength && maxLength && maxLength < minLength) {
                    ret.valid = false;
                    ret.error = "Minimum length can not be greater than maximum length.";
                    return ret;
                }
                to_push.minLength = minLength;
                to_push.maxLength = maxLength;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-short-blog': {
                to_push.type = 'survey-short-blog';
                ret_arr.push(to_push);
                continue;
            }
            // Check
            case 'survey-time': {
                to_push.type = 'survey-time';
                const { minTime, maxTime, step } = question;
                if (minTime && !!!isValidTimeString(minTime)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum time string input.";
                    return ret;
                }
                if (maxTime && !!!isValidTimeString(maxTime)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum time string input.";
                    return ret;
                }
                if (minTime && maxTime) {
                    const minTimeNum = timeToNumber(minTime);
                    const maxTimeNum = timeToNumber(maxTime);
                    if (maxTimeNum < minTimeNum) {
                        ret.valid = false;
                        ret.error = "The minimum time can not be greater than the maximum time.";
                        return ret;
                    }
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                to_push.minTime = minTime;
                to_push.maxTime = maxTime;
                to_push.step = step;
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-video': {
                to_push.type = 'survey-video';
                ret_arr.push(to_push);
                continue;
            }
            case 'survey-week': {
                to_push.type = 'survey-week';
                ret.valid = false;
                ret.error = "Week survey question type not currently supported.";
                return ret;
            }
            default: {
                ret.valid = false;
                ret.error = "Unrecognized question type.";
                return ret;
            }
        }
    }
    return { valid: true, error: '', question: 0, questions: ret_arr };
}
async function handleQuestionStateOptionTypeSave(option, i, ranking = false) {
    const ret = { valid: true, error: '', question: i };
    if (!!!ranking) {
        if (typeof option.defaultChecked !== 'boolean') {
            ret.valid = false;
            ret.error = "Unable to detect whther quesion option should be checked by default.";
            return ret;
        }
    }
    switch (option.type) {
        case 'audio': {
            const { src, title } = option;
            if (title.length > 50 || title.length < 1) {
                ret.valid = false;
                ret.error = "Title for audio input must be between 1 and 50 characters.";
                return ret;
            }
            if (!!!src.startsWith('https://audio.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the audio input is not valid.";
                return ret;
            }
            break;
        }
        case 'image': {
            const { src, shortDescription, longDescription } = option;
            if (!!!src.startsWith('https://image.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the image input is not valid.";
                return ret;
            }
            if (shortDescription.length > 50) {
                ret.valid = false;
                ret.error = "The short image description can not be longer than 50 characters.";
                return ret;
            }
            if (longDescription.length > 200) {
                ret.valid = false;
                ret.error = "The long image description can not be longer than 200 characters.";
                return ret;
            }
            break;
        }
        case 'video': {
            const { src, title, description, height } = option;
            if (!!!src.startsWith('https://video.storething.org/frankmbrown')) {
                ret.valid = false;
                ret.error = "The source of the video input is not valid.";
                return ret;
            }
            if (typeof title !== 'string' || title.length < 0 || title.length > 50) {
                ret.valid = false;
                ret.error = "Invalid video option title. The length of the title must be1 to 50 characters.";
                return ret;
            }
            if (typeof height !== 'number') {
                ret.valid = false;
                ret.error = "Unable to find a height for the provided video.";
                return ret;
            }
            if (typeof description !== 'string' || description.length > 200) {
                ret.valid = false;
                ret.error = "Video description must be a string less than 200 characters.";
                return ret;
            }
            break;
        }
        case 'survey-paragraph': {
            const { option: editorStateStr } = option;
            try {
                const { editorState } = await (0, lexical_1.parseSurveyOptionEditor)(JSON.parse(editorStateStr));
            }
            catch (e) {
                console.error(e);
                ret.valid = false;
                ret.error = "Video description must be a string less than 200 characters.";
                return ret;
            }
            break;
        }
        default: {
            ret.valid = false;
            ret.error = "Invalid question type.";
            return ret;
        }
    }
    return ret;
}
/**
 * Go through all the questions in the submitted surveys and make sure that they are all have valid states. This function is to be called when creating survey.
 */
async function validateQuestionStatesSave(questions) {
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const ret = { valid: true, error: '', question: i };
        const questionState = JSON.parse(question.question);
        try {
            await (0, lexical_1.parseSurveyQuestionEditor)(questionState);
        }
        catch (e) {
            console.error(e);
            ret.valid = false;
            ret.error = "Invalid question lexical state.";
            return ret;
        }
        const version = question.VERSION;
        if (version !== 1) {
            ret.valid = false;
            ret.error = "Invalid question state version.";
            return ret;
        }
        const required = question.required;
        if (typeof required !== 'boolean') {
            ret.valid = false;
            ret.error = "Unable to tell whether question is required.";
            return ret;
        }
        switch (question.type) {
            case 'survey-audio': {
                break;
            }
            case 'survey-checkbox': {
                const { options } = question;
                const min_selected_options = question.min_selected_options;
                const max_selected_options = question.max_selected_options;
                if (Number.isInteger(min_selected_options) && Number(min_selected_options) < 0 || Number(min_selected_options) > 100) {
                    ret.error = "Invalid minimum number of selected options requirement for checkbox input.";
                    ret.valid = false;
                    return ret;
                }
                if (Number.isInteger(max_selected_options) && Number(max_selected_options) < 0 || Number(max_selected_options) > 100) {
                    ret.error = "Invalid maximum number of selected options requirement for checkbox input.";
                    ret.valid = false;
                    return ret;
                }
                if (Number.isInteger(min_selected_options) && Number.isInteger(max_selected_options)) {
                    if (Number(min_selected_options) > Number(max_selected_options)) {
                        ret.error = "The minimum number of selected options for the checkbox input can not be greater than the maximum number of selected options.";
                        ret.valid = false;
                        return ret;
                    }
                }
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypeSave(option, i)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    return INVALID[0];
                }
                break;
            }
            case 'survey-color': {
                const { defaultColor } = question;
                if (!!!/^#([A-Fa-f0-9]{6})$/.test(defaultColor)) {
                    ret.error = "Invalid color for color survey question.";
                    ret.valid = false;
                    return ret;
                }
                break;
            }
            case 'survey-date': {
                const { minDate, maxDate, step } = question;
                if (minDate && !!!isValidDateString(minDate)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum date.";
                    return ret;
                }
                if (maxDate && !!!isValidDateString(maxDate)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum date.";
                    return ret;
                }
                if (minDate && maxDate && (new Date(maxDate)) < (new Date(minDate))) {
                    ret.valid = false;
                    ret.error = "The minimum date cannot be greater than the maximum date.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                break;
            }
            case 'survey-datetime': {
                const { minDatetime, maxDatetime, step } = question;
                if (minDatetime && !!!isValidDateString(minDatetime)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum datetime.";
                    return ret;
                }
                if (maxDatetime && !!!isValidDateString(maxDatetime)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum datetime.";
                    return ret;
                }
                if (minDatetime && maxDatetime && (new Date(maxDatetime)) < (new Date(minDatetime))) {
                    ret.valid = false;
                    ret.error = "The minimum datetime cannot be greater than the maximum datetime.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                break;
            }
            case 'survey-image': {
                break;
            }
            case 'survey-month': {
                const { minMonth, maxMonth, step } = question;
                if (minMonth && !!!isValidDateString(minMonth)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum month value.";
                    return ret;
                }
                if (maxMonth && !!!isValidDateString(maxMonth)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum month value.";
                    return ret;
                }
                if (minMonth && maxMonth && (new Date(maxMonth)) < (new Date(minMonth))) {
                    ret.valid = false;
                    ret.error = "The minimum month can not be greater than the maximum month.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                break;
            }
            case 'survey-multiple-choice': {
                const { options } = question;
                const moreThanOneChecked = options.filter((obj) => obj.defaultChecked).length > 1;
                if (moreThanOneChecked) {
                    ret.valid = false;
                    ret.error = "Only one value can be checked by default for multiple choice questions.";
                    return ret;
                }
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypeSave(option, i)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    return INVALID[0];
                }
                break;
            }
            case 'survey-number': {
                const { min, max, step } = question;
                if (min && isNaN(min)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum value for number input.";
                    return ret;
                }
                if (max && isNaN(max)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum value for number input.";
                    return ret;
                }
                if (typeof step !== 'number' || step < 0 || isNaN(step)) {
                    ret.valid = false;
                    ret.error = "Invalid step value.";
                    return ret;
                }
                break;
            }
            case 'survey-paragraph': {
                const { minLength, maxLength } = question;
                if (minLength && (isNaN(minLength) || minLength < 0)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum length. Minimum length must be at least 0.";
                    return ret;
                }
                if (maxLength && (isNaN(maxLength) || maxLength < 1)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum length. Max length must be at least 1.";
                    return ret;
                }
                if (minLength && maxLength && maxLength < minLength) {
                    ret.valid = false;
                    ret.error = "The minimum length required for the paragraph can not be greater than the maximum length required.";
                    return ret;
                }
                break;
            }
            case 'survey-range': {
                const { rangeMin, rangeMax, rangeStep, rangePointDescriptions } = question;
                if (isNaN(rangeMin)) {
                    ret.valid = false;
                    ret.error = "Invalid range minimum.";
                    return ret;
                }
                if (isNaN(rangeMax)) {
                    ret.valid = false;
                    ret.error = "Invalid range maximum.";
                    return ret;
                }
                if (rangeMax < rangeMin) {
                    ret.valid = false;
                    ret.error = "Range minimum can not be grater than range maximum.";
                    return ret;
                }
                if (isNaN(rangeStep) || rangeStep < 0) {
                    ret.valid = false;
                    ret.error = "Invalid range step. Range step must be greater than 0.";
                    return ret;
                }
                if (rangePointDescriptions.length > 6) {
                    ret.valid = false;
                    ret.error = "A maximum of 6 range point descriptions are allowed.";
                    return ret;
                }
                try {
                    const promiseArr = await Promise.all(rangePointDescriptions.map((obj) => (0, lexical_1.parseSurveyRangeDescriptionEditor)(JSON.parse(obj.description))));
                }
                catch (e) {
                    console.error(e);
                    ret.valid = false;
                    ret.error = "Invalid range point descriptions.";
                    return ret;
                }
                for (let point of rangePointDescriptions) {
                    const { point: pointNumber } = point;
                    if (pointNumber < rangeMin || pointNumber > rangeMax || (!!!decimal_js_1.Decimal.mod((pointNumber - rangeMin), rangeStep).equals(DECIMAL_ZERO))) { // MOD
                        ret.valid = false;
                        ret.error = "Invalid range point value.";
                        return ret;
                    }
                }
                break;
            }
            case 'survey-ranking': {
                const { options } = question;
                var original_order_current = 1;
                const promiseArr = await Promise.all(options.map((option) => handleQuestionStateOptionTypeSave(option, i, true)));
                const INVALID = promiseArr.filter((obj) => !!!obj.valid);
                if (INVALID.length >= 1) {
                    return INVALID[0];
                }
                for (let option of options) {
                    if (option.original_order !== original_order_current) {
                        ret.valid = false;
                        ret.error = "Something went wrong with the ordering of the ranking options.";
                        return ret;
                    }
                    original_order_current += 1;
                }
                break;
            }
            case 'survey-selection': {
                if (typeof question.include_other !== 'boolean') {
                    ret.valid = false;
                    ret.error = "Unable to determine whether the selection input should include an 'Other' option.";
                    return ret;
                }
                const options = question.options;
                const moreThanOneSelected = options.filter((obj) => obj.selected).length > 1;
                if (moreThanOneSelected) {
                    ret.valid = false;
                    ret.error = "Only one option can be selected by default for the selection input.";
                    return ret;
                }
                var currIndex = 0;
                for (let option of options) {
                    const { option: textOption, selected, index } = option;
                    if (typeof selected !== 'boolean') {
                        ret.valid = false;
                        ret.error = "Unable to detect whether select option is selected by default.";
                        return ret;
                    }
                    if (index !== currIndex) {
                        ret.valid = false;
                        ret.error = "Something went wrong getting the indices for the select options..";
                        return ret;
                    }
                    currIndex += 1;
                    if (typeof textOption !== 'string' || textOption.length === 0 || textOption.length > 200) {
                        ret.valid = false;
                        ret.error = "Invalid select option. The length of each select option must be between 1 and 200 characters.";
                        return ret;
                    }
                }
                break;
            }
            case 'survey-short-answer': {
                const { minLength, maxLength } = question;
                if (minLength && (isNaN(minLength) || minLength < 0)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum length. Minimum length must be at least 0.";
                    return ret;
                }
                if (maxLength && (isNaN(maxLength) || maxLength < 1)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum length. Maximum length must be at least 1.";
                    return ret;
                }
                if (minLength && maxLength && maxLength < minLength) {
                    ret.valid = false;
                    ret.error = "Minimum length can not be greater than maximum length.";
                    return ret;
                }
                break;
            }
            case 'survey-short-blog': {
                break;
            }
            case 'survey-time': {
                const { minTime, maxTime, step } = question;
                if (minTime && !!!isValidTimeString(minTime)) {
                    ret.valid = false;
                    ret.error = "Invalid minimum time string input.";
                    return ret;
                }
                if (maxTime && !!!isValidTimeString(maxTime)) {
                    ret.valid = false;
                    ret.error = "Invalid maximum time string input.";
                    return ret;
                }
                if (minTime && maxTime) {
                    const [minHoursStr, minMinutesStr, minSecondsStr] = minTime.split(':');
                    const [maxHoursStr, maxMinutesStr, maxSecondsStr] = maxTime.split(':');
                    const [minHours, minMinutes, maxHours, maxMinutes, minSeconds, maxSeconds] = [
                        parseInt(minHoursStr),
                        parseInt(minMinutesStr),
                        parseInt(maxHoursStr),
                        parseInt(maxMinutesStr),
                        parseInt(minSecondsStr),
                        parseInt(maxSecondsStr)
                    ];
                    const minTimeNum = (minHours * 3600) + (minMinutes * 60) + minSeconds;
                    const maxTimeNum = (maxHours * 3600) + (maxMinutes * 60) + maxSeconds;
                    if (maxTimeNum < minTimeNum) {
                        ret.valid = false;
                        ret.error = "The minimum time can not be greater than the maximum time.";
                        return ret;
                    }
                }
                break;
            }
            case 'survey-video': {
                break;
            }
            case 'survey-week': {
                ret.valid = false;
                ret.error = "Week survey question type not currently supported.";
                return ret;
            }
            default: {
                ret.valid = false;
                ret.error = "Unrecognized question type.";
                return ret;
            }
        }
    }
    return { valid: true, error: '', question: 0 };
}
function renderSurveyPreviews(rows, req) {
    return rows.map((obj) => {
        var _a;
        const { id, title, image, like_count: like_count_str, view_count: view_cont_str, annotation_count: annotation_count_str, response_count: response_count_str } = obj;
        const like_count = (0, number_1.formatNumberAttribute)(String(like_count_str));
        const view_count = (0, number_1.formatNumberAttribute)(String(view_cont_str));
        const annotation_count = (0, number_1.formatNumberAttribute)(String(annotation_count_str));
        const response_count = (0, number_1.formatNumberAttribute)(String(response_count_str));
        const description_string = obj.description ? (obj.description.length > 150 ? obj.description.slice(0, 150) + '...' : obj.description) : 'DESCRIPTION NOT FOUND';
        const question_count = obj.question_count ? obj.question_count : 'N/A';
        const date_created_datetime = (0, time_1.getDateTimeStringFromUnix)(Number(obj.date_created));
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const date_created_string = (0, time_1.formatDateFromUnixTime)('MM/DD/YYYY', tz, Number(obj.date_created));
        const deadline_datetime = (0, time_1.getDateTimeStringFromUnix)(Number(obj.deadline));
        const deadline_string = (0, time_1.formatDateFromUnixTime)('MM/DD/YYYY, h:m:s A', tz, Number(obj.deadline));
        return ejs_1.default.render(SURVEY_PREVIEW, { id, title, image, description_string, question_count, date_created_datetime, date_created_string, deadline_string, deadline_datetime, results: false, like_count, view_count, annotation_count, response_count });
    }).join('');
}
async function getSurveys(req, res) {
    try {
        const view = 'pages/surveys';
        const title = "Surveys";
        const breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Surveys', item: '/surveys', position: 2 }];
        const keywords = ["Frank McKee Brown", "frankmbrown.net", "Frank Brown", "Surveys", "Surveys", "Login Functionality has not yet been implemented", "Blog", "Notes"];
        const description = '';
        const tableOfContents = [
            { id: "about-this-page", text: "About this Page" },
            { id: "closed-surveys", text: "Closed Surveys" },
            { id: "open-surveys", text: "Open Surveys" }
        ];
        const SEO = { breadcrumbs, keywords, title, description, tableOfContents, path: '/surveys' };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO);
        var open_surveys = (0, html_1.getWarningAlert)("There are no open suveys to show.", undefined, false);
        const survey_query = await (0, database_1.default)().query(`WITH surveys_question_count AS (
  SELECT survey_id, COUNT(id) AS question_count FROM survey_questions GROUP BY survey_questions.survey_id 
), survey_like_count AS (
  SELECT count(like_id) like_count, survey_id FROM article_likes WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_view_count AS (
  SELECT count(id) view_count, survey_id FROM survey_views GROUP BY survey_id
), survey_annotation_count AS (
  SELECT count(id) annotation_count, survey_id FROM annotations WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_responses_count AS (
  SELECT count(id) as response_count, survey_id FROM survey_responses GROUP BY survey_id
) SELECT surveys.id, surveys.title, surveys.image, surveys.date_created, surveys.description_text description, surveys_question_count.question_count, surveys.deadline deadline, COALESCE(survey_like_count.like_count,0) AS like_count, COALESCE(survey_view_count.view_count,0) AS view_count, COALESCE(survey_annotation_count.annotation_count,0) AS annotation_count, COALESCE(survey_responses_count.response_count,0) AS response_count FROM surveys_question_count LEFT JOIN surveys ON surveys_question_count.survey_id=surveys.id LEFT JOIN survey_like_count ON surveys.id=survey_like_count.survey_id LEFT JOIN survey_view_count ON surveys.id=survey_view_count.survey_id LEFT JOIN survey_annotation_count ON surveys.id=survey_annotation_count.survey_id LEFT JOIN survey_responses_count ON surveys.id=survey_responses_count.survey_id ORDER BY surveys.date_created DESC;`, []);
        const rows = survey_query.rows;
        if (rows.length) {
            open_surveys = renderSurveyPreviews(rows, req);
        }
        const closed_surveys = (0, html_1.getWarningAlert)("There are no closed suveys to show.", undefined, false);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            open_surveys,
            closed_surveys
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/', 400, { severity: 'error', message: 'Something went wrong getting the surveys!' });
    }
}
exports.getSurveys = getSurveys;
const getDeviceCacheKey = (req, id) => {
    var _a, _b;
    if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)
        return `frankmbrown-survey-${id}-desktop`;
    else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet)
        return `frankmbrown-survey-${id}-tablet`;
    else
        return `frankmbrown-survey-${id}-mobile`;
};
const getDeviceHTML = (req) => {
    var _a, _b;
    if ((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop)
        return `desktop_html`;
    else if ((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.tablet)
        return `tablet_html`;
    else
        return `mobile_html`;
};
const timeToNumber = (s) => {
    const [hourStr, minStr, secStr] = s.split(':');
    const [hour, min, sec,] = [
        parseInt(hourStr),
        parseInt(minStr),
        parseInt(secStr),
    ];
    return (hour * 3600) + (min * 60) + sec;
};
const getMultipleChoiceCheckboxRankingQuery = (type_html, typ) => {
    var table;
    var fkc; // foreign key column
    if (typ === "multiple-choice") {
        table = 'survey_multiple_choice_options';
        fkc = 'survey_multiple_choice_option_id';
    }
    else if (typ === "checkbox") {
        table = 'survey_checkbox_options';
        fkc = 'survey_checkbox_option_id';
    }
    else {
        table = 'survey_ranking_options';
        fkc = 'survey_ranking_option_id';
    }
    return `${typ === "checkbox" ? `WITH checkbox_cte AS (
    SELECT survey_question_id, min_selected, max_selected FROM survey_checkbox_info WHERE survey_question_id=$1
  ) ` : ``}SELECT ${table}.id id, ${type_html} html, option_type, ${typ !== 'ranking' ? `option_number, default_checked,` : `original_order,`}${typ === "checkbox" ? ` checkbox_cte.min_selected AS min_selected, checkbox_cte.max_selected max_selected,` : ``} lexical_uuid, audio_option_type.src AS audio_src, audio_option_type.title AS audio_title, video_option_type.src AS video_src, video_option_type.title AS video_title, video_option_type.description AS video_description, video_option_type.height AS video_height, image_option_type.src AS image_src, image_option_type.short_description AS short_description, image_option_type.long_description AS long_description, image_option_type.width AS width, image_option_type.height AS height FROM ${table} ${typ === "checkbox" ? `LEFT JOIN checkbox_cte ON checkbox_cte.survey_question_id=${table}.survey_question_id` : ``} LEFT JOIN survey_paragraph_option_type ON survey_paragraph_option_type.${fkc}=${table}.id LEFT JOIN audio_option_type ON audio_option_type.${fkc}=${table}.id LEFT JOIN video_option_type ON video_option_type.${fkc}=${table}.id LEFT JOIN image_option_type ON image_option_type.${fkc}=${table}.id WHERE ${table}.survey_question_id=$1 ORDER BY ${typ !== 'ranking' ? `option_number` : `original_order`} ASC;`;
};
const getRenderQuestionTopHTML = (question, results) => {
    const question_wrapper_id = 'qw_'.concat(crypto.randomUUID());
    return `<section class="mt-3 survey-question" id="question-${(0, escape_html_2.default)(question.question_number.toString())}" data-question-id="${(0, escape_html_2.default)(question.id.toString())}" data-question-type="${(0, escape_html_2.default)(question.question_type)}"> 
  <div class="flex-row justify-between align-center navbar-sticky-transition" style="background-color: var(--background); opacity: 1; position: sticky; top: var(--navbar-height); z-index: 3;"><h2 class="h3 bold"><a class="same-page bold" href="#question-${(0, escape_html_2.default)(question.question_number.toString())}">Question ${(0, escape_html_2.default)(question.question_number.toString())}</a></h2><button type="button" class="small icon-text text warning" data-hide-show="" data-el="#${question_wrapper_id}">
  <svg data-arrow="" focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="KeyboardArrowUp"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
  <span data-hide="">HIDE</span>
  <span data-show="" hidden="">SHOW</span>
</button></div>
<div id="${question_wrapper_id}">
  <div class="lexical-wrapper rpq p-md mt-1" id="id_${question.lexical_uuid}" ${!!!results ? `data-annotate-only` : ``} data-editable="false" data-lexical-editor="true" data-rich-text-editor data-type="survey-question">${question.html}</div>
  <div class="block p-md" data-pq-answer>`;
};
const getRenderQuestionBottomToHTML = (question) => {
    var str = `</div>`;
    if (!!!question.required) {
        str += `<div class="survey-question-footer"><label class="checkbox" style="margin: 0px 6px;"><input class="primary medium flex-row align-center" type="checkbox" name="confirm_response_question_${question.question_number.toString()}" id="confirm_response_question_${question.question_number.toString()}"><span style="font-size: 1.25rem !important;">Confirm Response</span></label></div>`;
    }
    str += `</div></section>`;
    return str;
};
function renderSurveyQuestions(req, questions, results) {
    var _a, _b, _c, _d, _e, _f;
    var survey_body = '';
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        survey_body += getRenderQuestionTopHTML(question, results);
        switch (question.question_type) {
            case 'survey-audio': {
                const uuid = crypto.randomUUID();
                survey_body += `<label for="audio_${uuid}" class="bold">Upload Audio File</label><input type="file" accept="audio/*" data-audio-input="" name="audio_${uuid}" id="audio_${uuid}" class="warning"><output for="audio_${uuid}" class="block"></output>`;
                break;
            }
            case 'survey-checkbox': {
                const arr = question.questionState;
                const min_selected = arr[0].min_selected;
                const max_selected = arr[0].max_selected;
                if (Number.isInteger(min_selected) || Number.isInteger(max_selected)) {
                    const min_max_uuid = crypto.randomUUID();
                    survey_body += `<div class="flex-row justify-between align-center">`;
                    if (Number.isInteger(min_selected)) {
                        survey_body += `<span><span class="bold">Min Selections</span> <span id="min_select_${min_max_uuid}">${String(min_selected)}</span></span>`;
                    }
                    if (Number.isInteger(max_selected)) {
                        survey_body += `<span><span class="bold">Max Selections</span> <span id="max_select_${min_max_uuid}">${String(max_selected)}</span></span>`;
                    }
                    survey_body += '</div>';
                }
                for (let obj of arr) {
                    const temp_uuid = crypto.randomUUID();
                    const option_id = `option-${obj.id}`;
                    survey_body += `<div class="flex-row align-center justify-start p-md w-100 gap-1" id="${option_id}" style="min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;" data-option="" data-pr-option="" data-type="${obj.option_type}"><label  class="radio grow-0 large"><input type="checkbox" value="${obj.id}" ${obj.default_checked ? `checked` : ``} name="checkbox_${temp_uuid}" id="checkbox_${temp_uuid}" class="secondary"><span hidden="">checkbox_${temp_uuid}</span></label><div class="grow-1">`;
                    switch (obj.option_type) {
                        case 'image': {
                            survey_body += `<img src="${obj.image_src}" alt="${(0, escape_html_2.default)(obj.short_description)}" data-text="${(0, escape_html_2.default)(obj.long_description)}" style="max-height: 200px; width: auto; height: auto; max-width: 100%; margin: 0px !important;"/>`;
                            break;
                        }
                        case 'survey-paragraph': {
                            survey_body += `<div class="lexical-wrapper rpo" id="id_${obj.lexical_uuid}" data-editable="false" data-max-height="300" data-lexical-editor="true" data-rich-text-editor data-type="survey-option">${obj.html}</div>`;
                            break;
                        }
                        case 'audio': {
                            survey_body += (0, mediaHelpers_1.renderAudioHTML)(obj.audio_src.replace('https://audio.storething.org/', ''), obj.audio_title, Boolean((_a = req.session.device) === null || _a === void 0 ? void 0 : _a.desktop));
                            break;
                        }
                        case 'video': {
                            survey_body += (0, mediaHelpers_1.renderVideoHTML)(obj.video_src.replace('https://video.storething.org/', ''), obj.video_title, obj.video_description, Boolean((_b = req.session.device) === null || _b === void 0 ? void 0 : _b.desktop), Math.min(250, obj.video_height));
                            break;
                        }
                        default: {
                            throw new Error("Something went wrong getting the options for rendering survey ranking.");
                        }
                    }
                    survey_body += `</div></div>`;
                }
                break;
            }
            case 'survey-color': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const { default_color } = questionState;
                survey_body += `<div class="block p-md" data-pq-answer=""><label class="body1 bold" for="color_${uuid}">Color Input:</label><div class="flex-row justify-begin align-center gap-2"><input id="color_${uuid}" name="color_${uuid}" value="${default_color}" type="color" style="margin-top: 2px;"><span class="body1">${default_color}</span></div></div>`;
                break;
            }
            case 'survey-date': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                survey_body += `<div class="input-group block p-md" data-hover="false"><label for="date_resp_${uuid}">Input Date:</label><div class="flex-row align-center gap-2 mt-1"><button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Date Input Menu"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="DateRange"><path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"></path></svg></button><input type="date" id="date_resp_${uuid}" name="date_resp_${uuid}" step="${questionState.step}" placeholder="yyyy-mm-dd" ${questionState.min_date ? `min="${(0, escape_html_2.default)(questionState.min_date)}"` : ``} ${questionState.max_date ? `max="${(0, escape_html_2.default)(questionState.max_date)}"` : ``}></div>${questionState.min_date ? `<p class="block body2 mt-1"><span class="bold">Min Date: </span>${(0, escape_html_2.default)(questionState.min_date)}</p>` : ``}${questionState.max_date ? `<p class="block body2 mt-1"><span class="bold">Max Date: </span>${(0, escape_html_2.default)(questionState.max_date)}</p>` : ``}</div>`;
                break;
            }
            case 'survey-datetime': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const { min_datetime, max_datetime, step } = questionState;
                const hasMin = min_datetime !== null;
                const hasMax = max_datetime !== null;
                survey_body += `<div class="input-group block" data-hover="false" data-focus="false" data-blurred="true"><label for="datetime_resp_${uuid}">Input Datetime:</label><div class="flex-row align-center gap-2 mt-1"><button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Datetime Input Menu"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="Today"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"></path></svg></button><input type="datetime-local" id="datetime_resp_${uuid}" step="${step}" name="datetime_resp_${uuid}" placeholder="yyyy-mm-ddThh:mm:ss" ${hasMin ? `min="${min_datetime}"` : ``} ${hasMax ? `max="${max_datetime}"` : ``}></div>${hasMin ? `<p class="block body2 mt-1"><span class="bold">Min Datetime: </span>${min_datetime}</p>` : ``}${hasMax ? `<p class="block body2 mt-1"><span class="bold">Max Datetime: </span>${max_datetime}</p>` : ``}</div>`;
                break;
            }
            case 'survey-image': {
                const uuid = crypto.randomUUID();
                survey_body += `<label for="image_${uuid}" class="bold">Upload Image File</label><input type="file" accept="image/*" data-image-input="" name="image_${uuid}" id="image_${uuid}" class="error"><output for="image_${uuid}" class="block"></output>`;
                break;
            }
            case 'survey-month': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const { min_month, max_month, step } = questionState;
                const hasMin = min_month !== null;
                const hasMax = max_month !== null;
                survey_body += `<div class="input-group block p-md" data-hover="false"><label for="month_resp_${uuid}">Input Month:</label><div class="flex-row align-center gap-2 mt-1"><button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Time Input Menu"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="CalendarMonth"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"></path></svg></button><input type="month" step="${step}" id="month_resp_${uuid}" name="month_resp_${uuid}" placeholder="yyyy-mm" ${hasMin ? `min="${min_month}"` : ``} ${hasMax ? `max="${max_month}"` : ``}></div>${hasMin ? `<p class="block body2 mt-1"><span class="bold">Min Month: </span>${min_month}</p>` : ``}${hasMax ? `<p class="block body2 mt-1"><span class="bold">Max Month: </span>${max_month}</p>` : ``}</div>`;
                break;
            }
            case 'survey-multiple-choice': {
                const arr = question.questionState;
                const radio_uuid = crypto.randomUUID();
                for (let obj of arr) {
                    const temp_uuid = crypto.randomUUID();
                    const option_id = `option-${obj.id}`;
                    survey_body += `<div class="flex-row align-center justify-start p-md w-100 gap-1" id="${option_id}" style="min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;" data-option="" data-pr-option=""  data-type="${obj.option_type}"><label class="radio grow-0 large"><input ${obj.default_checked ? `checked` : ``} type="radio" value="${obj.id}" name="radio_op_${radio_uuid}" class="secondary"><span hidden="">radio_${temp_uuid}</span></label><div class="grow-1">`;
                    switch (obj.option_type) {
                        case 'image': {
                            survey_body += `<img src="${obj.image_src}" alt="${(0, escape_html_2.default)(obj.short_description)}" data-text="${(0, escape_html_2.default)(obj.long_description)}" style="max-height: 200px; width: auto; height: auto; max-width: 100%; margin: 0px !important;"/>`;
                            break;
                        }
                        case 'survey-paragraph': {
                            survey_body += `<div class="lexical-wrapper rpo" id="id_${obj.lexical_uuid}" data-editable="false" data-max-height="300" data-lexical-editor="true" data-rich-text-editor data-type="survey-option">${obj.html}</div>`;
                            break;
                        }
                        case 'audio': {
                            survey_body += (0, mediaHelpers_1.renderAudioHTML)(obj.audio_src.replace('https://audio.storething.org/', ''), obj.audio_title, Boolean((_c = req.session.device) === null || _c === void 0 ? void 0 : _c.desktop));
                            break;
                        }
                        case 'video': {
                            survey_body += (0, mediaHelpers_1.renderVideoHTML)(obj.video_src.replace('https://video.storething.org/', ''), obj.video_title, obj.video_description, Boolean((_d = req.session.device) === null || _d === void 0 ? void 0 : _d.desktop), Math.min(250, obj.video_height));
                            break;
                        }
                        default: {
                            throw new Error("Something went wrong getting the options for rendering survey ranking.");
                        }
                    }
                    survey_body += `</div></div>`;
                }
                break;
            }
            case 'survey-number': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const { min_number, max_number, step } = questionState;
                const hasMin = min_number !== null;
                const hasMax = max_number !== null;
                survey_body += `<div class="input-group block" data-hover="false" data-focus="false" data-blurred="true"><label for="urnum_${uuid}">Response:</label><div class="mt-1 number-input medium"><input type="number" name="urnum_${uuid}" id="urnum_${uuid}" autocomplete="off" spellcheck="false" autocapitalize="off" step="${step}" ${hasMin ? `min="${min_number}"` : ``} ${hasMax ? `max="${max_number}"` : ``} placeholder="Enter your response here..."><button class="icon large" type="button" aria-label="Increase Input" data-increase=""><svg focusable="false" inert="" viewBox="0 0 24 24"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button><button class="icon large" type="button" aria-label="Decrease Input" data-decrease=""><svg focusable="false" inert="" viewBox="0 0 24 24"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path></svg></button></div></div>`;
                if (hasMin) {
                    survey_body += `<p class="block body2 mt-1"><span class="bold">Minimum: </span>${min_number}</p>`;
                }
                if (hasMax) {
                    survey_body += `<p class="block body2 mt-1"><span class="bold">Maximum: </span>${max_number}</p>`;
                }
                survey_body += `<p class="block body2 mt-1"><span class="bold">Step: </span>${step}</p>`;
                break;
            }
            case 'survey-paragraph': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const hasMinLength = questionState.min_length !== null;
                const hasMaxLength = questionState.max_length !== null;
                survey_body += `<div class="input-group block" data-hover="false" data-focus="false" data-blurred="true"><label for="urt_${uuid}">Response:</label><div class="mt-1 text-input block medium"><textarea name="urt_${uuid}" id="urt_${uuid}" rows="5" spellcheck="false" autocomplete="off" autocapitalize="off" style="resize:vertical!important; min-height: 100px;" ${hasMinLength ? `minlength="${questionState.min_length}"` : ``} ${hasMaxLength ? `maxlength="${questionState.max_length}"` : ``} placeholder="Enter your response here..."></textarea></div>${hasMinLength || hasMaxLength ? `<p class="char-counter t-disabled" data-input="urt_${uuid}">${hasMinLength ? `<span class="min-counter body2" data-val="${questionState.min_length}" aria-hidden="false">more characters required</span>` : ``}${hasMaxLength ? `<span class="max-counter body2" data-val="${questionState.max_length}" aria-hidden="true">Characters Remaining</span>` : ``}</p>` : ``}</div>`;
                break;
            }
            case 'survey-range': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const { range_min, range_max, range_step } = arr[0];
                const decs = Math.log10(range_max) + 1;
                const output_min_width = Math.min(100, decs * 9);
                var temp_points = '';
                var temp_float_menu = '';
                const one_third = (range_max - range_min) / 3 + range_min;
                const two_third = (range_max - range_min) * 2 / 3 + range_min;
                const start = (range_max + range_min) / 2;
                for (let obj of arr) {
                    if (Number.isInteger(obj.point) && obj.html && obj.lexical_uuid) {
                        const percentage = (100 * (Number(obj.point) - range_min) / (range_max - range_min)).toFixed(2);
                        var placement = 'top';
                        if (Number(obj.point) < one_third)
                            placement = 'top-start';
                        else if (Number(obj.point) > two_third)
                            placement = 'top-end';
                        const temp_uuid = crypto.randomUUID();
                        temp_points += `<div class="rpd-point" aria-describedby="rpdfm_${temp_uuid}" data-popover="" data-pelem="#rpdfm_${temp_uuid}" tabindex="1" data-force-close="" data-click="" style="left: ${percentage}%;"></div>`;
                        temp_float_menu += `<div class="floating-menu o-xs" data-placement="${placement}" id="rpdfm_${temp_uuid}" role="tooltip" style="padding: 4px; border-radius: 4px; background-color: var(--background); display: none;"><div class="lexical-wrapper" id="id_${obj.lexical_uuid}" data-click-capture="" data-editable="false" data-registered="true" data-lexical-editor="true" style="user-select: text; white-space: pre-wrap; word-break: break-word;" data-rich-text-editor data-type="range-description" data-editable="false">${obj.html}</div></div>`;
                    }
                }
                survey_body += `<div class="block p-md" data-pq-answer=""><label class="bold body1" for="rng_${uuid}"></label><div class="flex-row gap-3 align-center justify-start"><div class="grow-1" style="position: relative; padding: 7px 0px;"><input type="range" min="${range_min}" max="${range_max}" step="${range_step}" id="rng_${uuid}" name="rng_${uuid}" style="background-size: 50.0% 100%;">${temp_points}</div></div><div class="flex-row align-center gap-2 justify-end w-100"><span class="bold h6">Current Value: </span><output class="h6 fw-regular" style="min-width: ${output_min_width}px;" class="flex-row justify-center fw-regular" for="rng_${uuid}">${start}</output></div>${temp_float_menu}
        </div>`;
                break;
            }
            case 'survey-ranking': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                var wrapper_id = 'ranking_container_'.concat(uuid);
                survey_body += `<div class="block" data-pq-answer data-ranking-container data-drag-container id="${wrapper_id}">`;
                for (let obj of arr) {
                    const option_id = `option-${obj.id}`;
                    survey_body += `<div class="flex-row align-center justify-start p-md w-100 gap-1" id="${option_id}" style="min-width: 0px; border: 2px solid var(--divider); border-radius: 6px; padding: 0px 4px; margin: 2px 0px;" data-option="" data-pr-option="" data-drag-el="" data-type="${obj.option_type}" data-drag-container="${wrapper_id}" draggable="false"><div class="drag-container grow-0" data-drag="#${option_id}" tabindex="0"> <svg class="custom-survey t-normal drag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path stroke="currentColor" d="M8.5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0 7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7-10a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm-7-4a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm0-7a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z"></path></svg></div><div class="grow-1">`;
                    switch (obj.option_type) {
                        case 'image': {
                            survey_body += `<img src="${obj.image_src}" alt="${(0, escape_html_2.default)(obj.short_description)}" data-text="${(0, escape_html_2.default)(obj.long_description)}" style="max-height: 200px; width: auto; height: auto; max-width: 100%; margin: 0px !important;"/>`;
                            break;
                        }
                        case 'survey-paragraph': {
                            survey_body += `<div class="lexical-wrapper rpo" id="id_${obj.lexical_uuid}" data-editable="false" data-max-height="300" data-lexical-editor="true" data-rich-text-editor data-type="survey-option">${obj.html}</div>`;
                            break;
                        }
                        case 'audio': {
                            survey_body += (0, mediaHelpers_1.renderAudioHTML)(obj.audio_src.replace('https://audio.storething.org/', ''), obj.audio_title, Boolean((_e = req.session.device) === null || _e === void 0 ? void 0 : _e.desktop));
                            break;
                        }
                        case 'video': {
                            survey_body += (0, mediaHelpers_1.renderVideoHTML)(obj.video_src.replace('https://video.storething.org/', ''), obj.video_title, obj.video_description, Boolean((_f = req.session.device) === null || _f === void 0 ? void 0 : _f.desktop), Math.min(250, obj.video_height));
                            break;
                        }
                        default: {
                            throw new Error("Something went wrong getting the options for rendering survey ranking.");
                        }
                    }
                    survey_body += `</div></div>`;
                }
                break;
            }
            case 'survey-selection': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                var baseText = 'Select Option';
                const { include_other } = arr[0];
                const default_option = arr.filter((obj) => obj.selected);
                if (default_option.length) {
                    baseText = default_option[0].option;
                }
                survey_body += `<div class="block text-align-left" id="label_${uuid}"></div><div class="mt-1 flex-row justify-start"><div class="select"><button class="select" role="combobox" aria-haspopup="listbox" aria-controls="dropdown_${uuid}" aria-labelledby="label_${uuid}" data-popover="" data-pelem="#dropdown_${uuid}" data-click="" aria-expanded="true" style="min-width: 289px;" type="button"><span class="body1">${(0, escape_html_2.default)(baseText)}</span><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="ArrowDropDown"><path d="m7 10 5 5 5-5z"></path></svg></button><div class="select-menu o-xs" tabindex="0" id="dropdown_${uuid}" role="listbox" data-placement="bottom"><input type="text" hidden="" value="" name="select_input_${uuid}" id="select_input_${uuid}">${arr.map((obj) => `<button class="select-option" tabindex="-1" data-val="${obj.index}" aria-selected="${obj.selected}" role="option" style="width:100%;" type="button">${(0, escape_html_2.default)(obj.option)}</button>`).join("")}</div></div></div>`;
                if (include_other) {
                    survey_body += `<div class="flex-row align-center justify-start gap-1 mt-3" data-other-option=""><label aria-label="Choose Other Option" class="radio grow-0 large"><input aria-label="Choose Other Option" type="checkbox" name="checkbox_${uuid}" id="checkbox_${uuid}" class="secondary"><span hidden="">checkbox_${uuid}</span></label><div class="text-input block medium grow-1"><input class="medium" name="other_option_${uuid}" id="other_option_${uuid}" maxlength="100" minlength="1" spellcheck="true" placeholder="Enter other value..."></div></div>`;
                }
                break;
            }
            case 'survey-short-answer': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                survey_body += `<div class="input-group block" data-hover="false" data-focus="false" data-blurred="true"><label for="ursa_${uuid}">Response:</label><div class="mt-1 text-input block medium"><input type="text" name="ursa_${uuid}" id="ursa_${uuid}" spellcheck="false" autocomplete="off" autocapitalize="off" ${questionState.min_length !== null ? `minlength="${questionState.min_length}"` : ``} ${questionState.max_length !== null ? `maxlength="${questionState.max_length}"` : ``} placeholder="Enter your response here..."></div></div>`;
                if (questionState.min_length !== null) {
                    survey_body += `<p class="block body2 mt-1"><span class="bold">Minimum Length: </span>${questionState.min_length}</p>`;
                }
                if (questionState.max_length !== null) {
                    survey_body += `<p class="block body2 mt-1"><span class="bold">Maximum Length: </span>${questionState.max_length}</p>`;
                }
                break;
            }
            case 'survey-short-blog': {
                const uuid = crypto.randomUUID();
                survey_body += (0, lexicalImplementations_1.getCommentImplementation)(req, 'wrapper_'.concat(uuid), false, `<p class="lex-p ltr" data-v="1" dir="ltr" style="text-align: left; margin: 6px 0px; border-color: transparent; padding: 0px !important;"><span data-v="1" data-frank-text="true" style="font-size: 1rem;">Enter a short blog response here...</span></p>`, { wrapperStyle: 'block lexical-wrapper', type: 'survey-short-blog', rteStyle: 'min-height: 100px; overflow-y: auto; max-height: 400px; resize: vertical !important; user-select: text; white-space: pre-wrap; word-break: break-word;' });
                break;
            }
            case 'survey-time': {
                const uuid = crypto.randomUUID();
                const arr = question.questionState;
                const questionState = arr[0];
                const { min_time, max_time, step } = questionState;
                const hasMin = min_time !== null;
                const hasMax = max_time !== null;
                survey_body += `<div class="input-group block mt-2" data-hover="false"><label for="time_resp_${uuid}">Input Time:</label><div class="flex-row align-center gap-2 mt-1"><button data-launch-datetime="" type="button" class="icon medium" aria-label="Launch Time Input Menu"><svg focusable="false" inert="" viewBox="0 0 24 24" tabindex="-1" title="QueryBuilder"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg></button><input type="time" id="time_resp_${uuid}" name="time_resp_${uuid}" placeholder="hh:mm:ss" step="${step}" ${hasMin ? `min="${min_time}"` : ``} ${hasMax ? `max="${max_time}"` : ``}></div>${hasMin ? `<p class="block body2 mt-1"><span class="bold">Min Time: </span>${min_time}</p>` : ``}${hasMax ? `<p class="block body2 mt-1"><span class="bold">Max Time: </span>${max_time}</p>` : ``}</div>`;
                break;
            }
            case 'survey-video': {
                const uuid = crypto.randomUUID();
                survey_body += `<label for="video_${uuid}" class="bold">Upload Video File</label><input type="file" accept="video/*" data-video-input="" name="video_${uuid}" id="video_${uuid}" class="info"><output for="video_${uuid}" class="block"></output>`;
                break;
            }
            case 'survey-week': {
                throw new Error("Invalid survey question type while rendering questions.");
            }
            default: {
                throw new Error("Invalid survey question type while rendering questions.");
            }
        }
        survey_body += getRenderQuestionBottomToHTML(question);
    }
    return survey_body;
}
const getSurveyLikeViewQuery = (logged_in) => {
    return `WITH ${logged_in ? `user_liked_cte AS (
	SELECT survey_id, true user_liked FROM article_likes WHERE survey_id=$1 AND user_id=$2 
),` : ``} survey_likes_cte AS (
	SELECT survey_id, count(like_id) likes FROM article_likes WHERE survey_id=$1 GROUP BY survey_id
), ins_survey_views_cte AS (
 INSERT INTO survey_views (survey_id,user_id,ip_id,date_viewed)
	VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING
), survey_views_cte AS (
	SELECT survey_id, count(id) views FROM survey_views WHERE survey_id=$1 GROUP BY survey_id
) ${logged_in ? `SELECT COALESCE(survey_likes_cte.likes,0) AS likes, COALESCE(survey_views_cte.views,0) AS views, COALESCE(user_liked_cte.user_liked,false) AS user_liked 
FROM
survey_views_cte LEFT JOIN survey_likes_cte  
ON survey_likes_cte.survey_id=survey_views_cte.survey_id 
LEFT JOIN user_liked_cte ON survey_likes_cte.survey_id=user_liked_cte.survey_id;
` : `SELECT COALESCE(survey_likes_cte.likes,0) AS likes, COALESCE(survey_views_cte.views,0) AS views, false AS user_liked 
FROM
survey_views_cte LEFT JOIN survey_likes_cte  
ON survey_likes_cte.survey_id=survey_views_cte.survey_id;`}`;
};
async function getSurvey(req, res) {
    var _a, _b;
    try {
        const user_id = (_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID;
        const logged_in = Number.isInteger(user_id);
        const { id, title: paramTitle } = req.params;
        if (!!!Number.isInteger(parseInt(id))) {
            return (0, redirect_override_1.redirect)(req, res, '/surveys', 400, { severity: 'error', message: 'Something went wrong getting the survey!' });
        }
        const view = 'pages/survey';
        const survey_like_view_query = getSurveyLikeViewQuery(logged_in);
        var title = "";
        const keywords = [];
        var description = '';
        var description_html = '';
        var survey_uuid = '';
        var survey_body = '';
        var image = '';
        var description_id = '';
        var date_created = 0;
        var breadcrumbs = [{ name: 'Home', item: '/', position: 1 }, { name: 'Surveys', item: '/surveys', position: 2 }];
        const table_of_contents = [];
        var has_liked = false;
        var like_url = `/like/surveys/${id}/${encodeURIComponent(paramTitle)}`;
        var like_count = 0;
        var view_count = 0;
        var deadline = 0;
        var deadline_datetime = '';
        var deadline_string = '';
        const tz = ((_b = req.session.settings) === null || _b === void 0 ? void 0 : _b.timezone) || 'America/New_York';
        const device_cache_key = getDeviceCacheKey(req, parseInt(id));
        const type_html = getDeviceHTML(req);
        const survey_like_view = await (0, database_1.default)().query(survey_like_view_query, [parseInt(id), user_id, req.session.ip_id, (0, time_1.getUnixTime)()]);
        const survey_like_view_row = survey_like_view.rows[0];
        has_liked = (survey_like_view_row === null || survey_like_view_row === void 0 ? void 0 : survey_like_view_row.user_liked) || false;
        like_count = (survey_like_view_row === null || survey_like_view_row === void 0 ? void 0 : survey_like_view_row.likes) || 0;
        view_count = (survey_like_view_row === null || survey_like_view_row === void 0 ? void 0 : survey_like_view_row.views) || 0;
        const db_connection = await (0, database_1.default)().connect();
        try {
            await db_connection.query('BEGIN;');
            const surveyQuery = await db_connection.query(`SELECT surveys.id id, title, survey_uuid, image, date_created, ${type_html} AS html, table_of_contents, description_text, lexical_uuid, surveys.deadline FROM surveys JOIN survey_description ON surveys.id=survey_description.survey_id WHERE surveys.id=$1;`, [parseInt(id)]);
            const survey = surveyQuery.rows[0];
            const survey_id = survey.id;
            if (!!!Number.isInteger(survey_id)) {
                throw new Error("Unable to get survey id.");
            }
            title = survey.title;
            description = survey.description_text;
            description_html = survey.html;
            image = survey.image;
            deadline = parseInt(survey.deadline);
            deadline_datetime = (0, time_1.getDateTimeStringFromUnix)(deadline, true);
            deadline_string = (0, time_1.formatDateFromUnixTime)('MM/DD/YYYY, h:m:s A', tz, deadline);
            table_of_contents.push(...survey.table_of_contents);
            survey_uuid = survey.survey_uuid;
            description_id = 'id_'.concat(survey.lexical_uuid);
            date_created = Number(survey.date_created);
            const survey_questions = await db_connection.query(`SELECT id, question_number, required, question_type, ${type_html} AS html, lexical_uuid FROM survey_questions WHERE survey_id=$1 ORDER BY question_number ASC;`, [survey_id]);
            const promiseArr = [];
            const questions = survey_questions.rows;
            for (let i = 0; i < survey_questions.rows.length; i++) {
                const question = questions[i];
                const question_id = questions[i].id;
                switch (question.question_type) {
                    case 'survey-audio': {
                        promiseArr.push(new Promise((resolve, _) => resolve(null)));
                        break;
                    }
                    case 'survey-checkbox': {
                        promiseArr.push(db_connection.query(getMultipleChoiceCheckboxRankingQuery(type_html, 'checkbox'), [question_id]));
                        break;
                    }
                    case 'survey-color': {
                        promiseArr.push(db_connection.query(`SELECT default_color FROM survey_color_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-date': {
                        promiseArr.push(db_connection.query(`SELECT min_date, max_date, step FROM survey_date_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-datetime': {
                        promiseArr.push(db_connection.query(`SELECT min_datetime, max_datetime, step FROM survey_datetime_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-image': {
                        promiseArr.push(new Promise((resolve, _) => resolve(null)));
                        break;
                    }
                    case 'survey-month': {
                        promiseArr.push(db_connection.query(`SELECT min_month, max_month, step FROM survey_month_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-multiple-choice': {
                        promiseArr.push(db_connection.query(getMultipleChoiceCheckboxRankingQuery(type_html, 'multiple-choice'), [question_id]));
                        break;
                    }
                    case 'survey-number': {
                        promiseArr.push(db_connection.query(`SELECT min_number, max_number, step FROM survey_number_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-paragraph': {
                        promiseArr.push(db_connection.query(`SELECT min_length, max_length FROM survey_paragraph_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-range': {
                        promiseArr.push(db_connection.query(`SELECT range_min, range_max, range_step, ${type_html} AS html, point, lexical_uuid FROM survey_range_info LEFT JOIN survey_range_point_descriptions ON survey_range_info.survey_question_id=survey_range_point_descriptions.survey_question_id WHERE survey_range_info.survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-ranking': {
                        promiseArr.push(db_connection.query(getMultipleChoiceCheckboxRankingQuery(type_html, 'ranking'), [question_id]));
                        break;
                    }
                    case 'survey-selection': {
                        promiseArr.push(db_connection.query(`SELECT include_other, option, selected, index FROM survey_selection_info JOIN survey_selection_options ON survey_selection_info.survey_question_id=survey_selection_options.survey_question_id WHERE survey_selection_info.survey_question_id=$1 ORDER BY index ASC;`, [question_id]));
                        break;
                    }
                    case 'survey-short-answer': {
                        promiseArr.push(db_connection.query(`SELECT min_length, max_length FROM survey_short_answer_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-short-blog': {
                        promiseArr.push(new Promise((resolve, _) => resolve(null)));
                        break;
                    }
                    case 'survey-time': {
                        promiseArr.push(db_connection.query(`SELECT min_time, max_time, step FROM survey_time_info WHERE survey_question_id=$1;`, [question_id]));
                        break;
                    }
                    case 'survey-video': {
                        promiseArr.push(new Promise((resolve, _) => resolve(null)));
                        break;
                    }
                    case 'survey-week': {
                        throw new Error("This question type has not been implemented and will not be implemented.");
                    }
                    default: {
                        throw new Error(`Suvey type ${question.question_type} not recognized.`);
                    }
                }
            }
            const question_responses = await Promise.all(promiseArr);
            const rows = question_responses.map((obj) => obj === null ? null : obj.rows);
            const parsed_survey_questions = [];
            for (let i = 0; i < questions.length; i++) {
                const newQuestion = questions[i];
                newQuestion.questionState = rows[i];
                parsed_survey_questions.push(newQuestion);
            }
            await db_connection.query('COMMIT;');
            db_connection.release();
            survey_body = renderSurveyQuestions(req, parsed_survey_questions, false);
            table_of_contents.push(...parsed_survey_questions.map((obj) => ({ id: `question-${obj.question_number}`, text: `Question ${obj.question_number}` })), { id: "submit-form", text: "Submit Survey Response" });
            if (!!!IS_DEVELOPMENT_1.default)
                await req.cache.set(device_cache_key, JSON.stringify({ title, description: description_html, description_text: survey.description_text, image, survey_uuid, survey_body, table_of_contents, description_id }));
        }
        catch (e) {
            console.error(e);
            try {
                await db_connection.query('ROLLBACK;');
            }
            catch (e) { }
            db_connection.release();
            throw new Error("Something went wrong getting the survey.");
        }
        breadcrumbs.push({ name: title, item: `/surveys/${encodeURIComponent(id)}/${encodeURIComponent(title)}`, position: 3 });
        const SEO = {
            breadcrumbs,
            keywords,
            title,
            description,
            tableOfContents: table_of_contents,
            path: `/surveys/${id}/${encodeURIComponent(title)}`,
            image
        };
        const requiredVariables = (0, frontendHelper_1.getRequiredVariables)(req, SEO, { includeAnnotation: true, includeAnnotationFormOnly: true });
        const date_created_datetime = (0, time_1.getDateTimeStringFromUnix)(date_created, true);
        const date_created_string = (0, time_1.formatDateFromUnixTime)('MM/DD/YYYY', tz, date_created);
        return res.status(200).render(view, {
            layout: requiredVariables.fullPageRequest ? 'layout' : false,
            ...requiredVariables,
            description_html,
            survey_body,
            description_id,
            date_created_datetime,
            date_created_string,
            like_url,
            like_count,
            view_count,
            has_liked,
            deadline_datetime,
            deadline_string,
            results: false
        });
    }
    catch (e) {
        console.error(e);
        return (0, redirect_override_1.redirect)(req, res, '/surveys', 400, { severity: 'error', message: 'Something went wrong getting the survey!' });
    }
}
exports.getSurvey = getSurvey;
async function postSurvey(req, res) {
    var _a, _b;
    try {
        const { title, description: descriptionStringified, image, questions: original_questions, survey_uuid, deadline } = req.body;
        if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
            return res.status(400).json({ error: "Invalid survey title." });
        }
        if (!!!isValidDateString(deadline)) {
            return res.status(400).json({ error: "Invalid survey deadline." });
        }
        const unvalidated_audio_urls = new Set();
        const unvalidated_video_urls = new Set();
        const unvalidated_image_urls = new Set();
        var able_to_validate = true;
        var contains_nsfw = false;
        const descriptionLexicalState = JSON.parse(descriptionStringified);
        const { editorState: descriptionState, innerText: description_text, desktop_html, mobile_html, tablet_html, tableOfContents, unvalidated_audio_urls: unvalidated_desc_audio_urls, unvalidated_video_urls: unvalidated_desc_video_urls, unvalidated_image_urls: unvalidated_desc_image_urls, able_to_validate: able_to_validate_description, contains_nsfw: contains_nsfw_description } = await (0, lexical_1.parseFullLexicalEditor)(descriptionLexicalState);
        (0, set_1.addItemsToSet)(unvalidated_desc_audio_urls, unvalidated_audio_urls);
        (0, set_1.addItemsToSet)(unvalidated_desc_image_urls, unvalidated_image_urls);
        (0, set_1.addItemsToSet)(unvalidated_desc_video_urls, unvalidated_video_urls);
        contains_nsfw = contains_nsfw || contains_nsfw_description;
        able_to_validate = able_to_validate && able_to_validate_description;
        if (contains_nsfw) {
            return res.status(400).json({ error: "The description contains nsfw content." });
        }
        if (!!!image.startsWith('https://image.storething.org/frankmbrown/')) {
            return res.status(400).json({ error: "Invalid survey image." });
        }
        if (!!!Array.isArray(original_questions)) {
            return res.status(400).json({ error: "Submitted questions should be an array." });
        }
        const AT_LEAST_ONE_REQUIRED = original_questions.filter((ques) => ques.required).length >= 1;
        if (!!!AT_LEAST_ONE_REQUIRED) {
            return res.status(400).json({ error: "At least one survey question must be required." });
        }
        const [obj, image_new] = await Promise.all([validateQuestionStatesPost(original_questions), (0, image_1.handleImageUpload150_75)(image)]);
        await (0, projects_1.uploadPageImageFromUrl)(req, image_new);
        if (!!!obj.valid) {
            console.error(`Invalid Question ${obj.question}: ${obj.error}`);
            return res.status(400).json({ error: obj.error });
        }
        const questions = obj.questions;
        if (!!!questions.length) {
            return res.status(400).json({ error: "Something went wrong parsing the questions." });
        }
        const deadline_number = Math.round((new Date(deadline)).getTime() / 1000);
        const db_connection = await (0, database_1.default)().connect();
        try {
            await db_connection.query('BEGIN;');
            const date_created = (0, time_1.getUnixTime)();
            const description_inner_text = description_text.length > 150 ? description_text.slice(0, 150).concat('...') : description_text;
            const resp = await db_connection.query(`INSERT INTO surveys (title,survey_uuid,image,date_created,description_text,deadline) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id;`, [title, survey_uuid, image_new, date_created, description_inner_text, deadline_number]);
            const survey_id = resp.rows[0].id;
            if (!!!Number.isInteger(survey_id)) {
                throw new Error("Something went wrong posting the survey to the database.");
            }
            db_connection.query(`INSERT INTO survey_description (editor_state,desktop_html,tablet_html,mobile_html,table_of_contents,survey_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id;`, [descriptionState, desktop_html, mobile_html, tablet_html, tableOfContents, survey_id]);
            var descriptionChunks = [];
            var currChar = 0;
            while (currChar < description_text.length) {
                descriptionChunks.push(description_text.slice(currChar, currChar + 4000));
                currChar += 4000;
            }
            const [descriptionEmbeddings, descriptionModeration] = await Promise.all([
                Promise.all(descriptionChunks.map((s) => (0, ai_1.createEmbedding)(s, 'text-embedding-ada-002'))),
                Promise.all(descriptionChunks.map((s) => (0, ai_1.moderateOpenAI)(s)))
            ]);
            const moderationParsed = [];
            for (let moderation of descriptionModeration) {
                moderationParsed.push((0, ai_1.parseOpenAIModerationResponse)(moderation));
            }
            const IS_INAPPROPRIATE_DESC = moderationParsed.filter((subArr) => subArr.filter((s) => s[0] === true).length >= 1).length >= 1;
            if (IS_INAPPROPRIATE_DESC) {
                throw new Error("The survey description is inappropriate.");
            }
            const question_moderation_query = (0, handleArticleData_1.GET_INSERT_INTO_MODERATION_TABLE)('survey_description_moderation', 'survey_id');
            moderationParsed.forEach((subArr) => {
                for (let subArr2 of subArr) {
                    db_connection.query(question_moderation_query, [survey_id, ...subArr2]);
                }
            });
            for (let i = 0; i < descriptionChunks.length; i++) {
                const s = descriptionChunks[i];
                db_connection.query(`INSERT INTO survey_search (document,embedding,survey_id) VALUES ($1,$2,$3);`, [s, (0, pg_1.toSql)(descriptionEmbeddings[i]), survey_id]);
            }
            const embed_question_arr = [];
            const promiseArrQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i];
                var arr = [];
                var curr_index = 0;
                var query = `WITH question_cte AS (
  INSERT INTO survey_questions (survey_id,question_number,required,question_type,editor_state,desktop_html,tablet_html,mobile_html) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, question_type
)`;
                curr_index = 9;
                const { editorState: questionEditorState, innerText: questionInnerText, desktop_html: question_desktop_html, tablet_html: question_tablet_html, mobile_html: question_mobile_html, type: questionType, unvalidated_audio_urls: question_unvalidated_audio_urls, unvalidated_image_urls: question_unvalidated_image_urls, unvalidated_video_urls: question_unvalidated_video_urls, able_to_validate: question_able_to_validate, contains_nsfw: question_contains_nsfw, required } = question;
                (0, set_1.addItemsToSet)(question_unvalidated_audio_urls, unvalidated_audio_urls);
                (0, set_1.addItemsToSet)(question_unvalidated_image_urls, unvalidated_image_urls);
                (0, set_1.addItemsToSet)(question_unvalidated_video_urls, unvalidated_video_urls);
                contains_nsfw = contains_nsfw || question_contains_nsfw;
                able_to_validate = able_to_validate && question_able_to_validate;
                if (contains_nsfw) {
                    throw new Error(`Question ${i} contains nsfw content.`);
                }
                arr.push(survey_id, i + 1, required, questionType, questionEditorState, question_desktop_html, question_tablet_html, question_mobile_html);
                var curr_question_char = 0;
                var question_str_arr = [];
                while (curr_question_char < questionInnerText.length) {
                    question_str_arr.push(questionInnerText.slice(curr_question_char, curr_question_char + 4000));
                    curr_question_char += 4000;
                }
                switch (questionType) {
                    case 'survey-audio': {
                        query += `, second_query AS (
  SELECT true AS column_name
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-checkbox': {
                        const obj = question;
                        const { options, VERSION } = obj;
                        const min_selected_options = question.min_selected_options;
                        const max_selected_options = question.max_selected_options;
                        query += `, checkbox_info_cte AS (
  INSERT INTO survey_checkbox_info (survey_question_id,min_selected,max_selected) SELECT id, $${curr_index}, $${curr_index + 1} FROM question_cte  
)`;
                        arr.push(min_selected_options, max_selected_options);
                        curr_index += 2;
                        var options_str = '';
                        for (let j = 0; j < options.length; j++) {
                            const option = options[j];
                            const { type: optionType, defaultChecked } = option;
                            var query_str = `q_${Math.random().toString().slice(2)}`;
                            var query_str_2 = `q_${Math.random().toString().slice(2)}`;
                            var query_str_3 = `q_${Math.random().toString().slice(2)}`;
                            query += `, ${query_str_3} AS (
  INSERT INTO survey_checkbox_options (survey_question_id,option_type,option_number,default_checked,version) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM question_cte RETURNING id
), ${query_str} AS ( 
  SELECT id FROM ${query_str_3}
)`;
                            arr.push(optionType, j, defaultChecked, VERSION);
                            curr_index += 4;
                            switch (optionType) {
                                case 'audio': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO audio_option_type (survey_checkbox_option_id,src,title) SELECT id, $${curr_index}, $${curr_index + 1} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title);
                                    curr_index += 2;
                                    options_str += `Audio: ${option_obj.title}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_audio_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'image': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO image_option_type (survey_checkbox_option_id,src,short_description,long_description,width,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3}, $${curr_index + 4} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.shortDescription, option_obj.longDescription, Math.round(option_obj.width), Math.round(option_obj.height));
                                    curr_index += 5;
                                    options_str += `Image: ${option_obj.shortDescription}: ${option_obj.longDescription}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_image_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'survey-paragraph': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO survey_paragraph_option_type (survey_checkbox_option_id,editor_state,desktop_html,tablet_html,mobile_html) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.editorState, option_obj.desktop_html, option_obj.tablet_html, option_obj.mobile_html);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_audio_urls, unvalidated_audio_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_image_urls, unvalidated_image_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_video_urls, unvalidated_video_urls);
                                    curr_index += 4;
                                    options_str += `${option_obj.innerText}\n`;
                                    break;
                                }
                                case 'video': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO video_option_type (survey_checkbox_option_id,src,title,description,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title, option_obj.description, Math.round(option_obj.height));
                                    curr_index += 4;
                                    options_str += `Video: ${option_obj.title}: ${option_obj.description}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_video_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                default: {
                                    throw new Error(`Checkbox option type: ${optionType} does not exist.`);
                                }
                            }
                        }
                        var str_index = 0;
                        while (str_index < options_str.length) {
                            question_str_arr.push(options_str.slice(str_index, str_index + 4000));
                            str_index += 4000;
                        }
                        query += ` SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-color': {
                        const obj = question;
                        query += `, second_query AS ( 
  INSERT INTO survey_color_info (survey_question_id,default_color,version) SELECT id, $${curr_index},$${curr_index + 1} FROM question_cte 
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.defaultColor, obj.VERSION);
                        curr_index += 2;
                        break;
                    }
                    case 'survey-date': {
                        const obj = question;
                        query += `, second_query AS ( 
  INSERT INTO survey_date_info (survey_question_id,min_date,max_date,step,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2},$${curr_index + 3} FROM question_cte 
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minDate, obj.maxDate, obj.step, obj.VERSION);
                        curr_index += 4;
                        break;
                    }
                    case 'survey-datetime': {
                        const obj = question;
                        query += `, second_query AS ( 
  INSERT INTO survey_datetime_info (survey_question_id,min_datetime,max_datetime,step,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2},$${curr_index + 3} FROM question_cte 
)  SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minDatetime, obj.maxDatetime, obj.step, obj.VERSION);
                        curr_index += 4;
                        break;
                    }
                    case 'survey-image': {
                        query += `, second_query AS (
  SELECT true AS column_name
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-month': {
                        const obj = question;
                        query += `, second_query AS (
 INSERT INTO survey_month_info (survey_question_id,min_month,max_month,step,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2},$${curr_index + 3} FROM question_cte 
)  SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minMonth, obj.maxMonth, obj.step, obj.VERSION);
                        curr_index += 4;
                        break;
                    }
                    case 'survey-multiple-choice': {
                        const obj = question;
                        const { options, VERSION } = obj;
                        var options_str = '';
                        for (let j = 0; j < options.length; j++) {
                            const option = options[j];
                            const { type: optionType, defaultChecked } = option;
                            var query_str = `q_${Math.random().toString().slice(2)}`;
                            var query_str_2 = `q_${Math.random().toString().slice(2)}`;
                            var query_str_3 = `q_${Math.random().toString().slice(2)}`;
                            query += `, ${query_str_3} AS (
  INSERT INTO survey_multiple_choice_options (survey_question_id,option_type,option_number,default_checked,version) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM question_cte RETURNING id
), ${query_str} AS ( 
  SELECT id FROM ${query_str_3}
)`;
                            arr.push(optionType, j, defaultChecked, VERSION);
                            curr_index += 4;
                            switch (optionType) {
                                case 'audio': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO audio_option_type (survey_multiple_choice_option_id,src,title) SELECT id, $${curr_index}, $${curr_index + 1} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title);
                                    curr_index += 2;
                                    options_str += `Audio: ${option_obj.title}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_audio_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'image': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO image_option_type (survey_multiple_choice_option_id,src,short_description,long_description,width,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3}, $${curr_index + 4} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.shortDescription, option_obj.longDescription, Math.round(option_obj.width), Math.round(option_obj.height));
                                    curr_index += 5;
                                    options_str += `Image: ${option_obj.shortDescription}: ${option_obj.longDescription}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_image_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'survey-paragraph': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO survey_paragraph_option_type (survey_multiple_choice_option_id,editor_state,desktop_html,tablet_html,mobile_html) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.editorState, option_obj.desktop_html, option_obj.tablet_html, option_obj.mobile_html);
                                    curr_index += 4;
                                    options_str += `${option_obj.innerText}\n`;
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_audio_urls, unvalidated_audio_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_image_urls, unvalidated_image_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_video_urls, unvalidated_video_urls);
                                    break;
                                }
                                case 'video': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO video_option_type (survey_multiple_choice_option_id,src,title,description,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title, option_obj.description, Math.round(option_obj.height));
                                    curr_index += 4;
                                    options_str += `Video: ${option_obj.title}: ${option_obj.description}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_video_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                default: {
                                    throw new Error(`Multiple Choice option type: ${optionType} does not exist.`);
                                }
                            }
                        }
                        var str_index = 0;
                        while (str_index < options_str.length) {
                            question_str_arr.push(options_str.slice(str_index, str_index + 4000));
                            str_index += 4000;
                        }
                        query += ` SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-number': {
                        const obj = question;
                        query += `, second_query AS (
 INSERT INTO survey_number_info (survey_question_id,min_number,max_number,step,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2},$${curr_index + 3} FROM question_cte 
 )  SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.min, obj.max, obj.step, obj.VERSION);
                        curr_index += 4;
                        break;
                    }
                    case 'survey-paragraph': {
                        const obj = question;
                        query += `, second_query AS ( 
  INSERT INTO survey_paragraph_info (survey_question_id,min_length,max_length,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2} FROM question_cte
  )  SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minLength, obj.maxLength, obj.VERSION);
                        curr_index += 3;
                        break;
                    }
                    case 'survey-range': {
                        const obj = question;
                        const { rangePointDescriptions, rangeMax, rangeMin, rangeStep } = obj;
                        query += `, range_info AS (
  INSERT INTO survey_range_info (survey_question_id,range_min,range_max,range_step,version) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3}  FROM question_cte
)`;
                        arr.push(rangeMin, rangeMax, rangeStep, obj.VERSION);
                        curr_index += 4;
                        var options_str = '';
                        for (let j = 0; j < rangePointDescriptions.length; j++) {
                            var query_str = `q_${Math.random().toString().slice(2)}`;
                            const { point, ...rpdStuff } = rangePointDescriptions[j];
                            query += `, ${query_str} AS (
  INSERT INTO  survey_range_point_descriptions (survey_question_id,point,editor_state,desktop_html,tablet_html,mobile_html) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3}, $${curr_index + 4} FROM question_cte
)`;
                            options_str += rpdStuff.innerText + "\n";
                            arr.push(point, rpdStuff.editorState, rpdStuff.desktop_html, rpdStuff.tablet_html, rpdStuff.mobile_html);
                            curr_index += 5;
                        }
                        var str_index = 0;
                        while (str_index < options_str.length) {
                            question_str_arr.push(options_str.slice(str_index, str_index + 4000));
                            str_index += 4000;
                        }
                        query += ` SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-ranking': {
                        const obj = question;
                        const { options, VERSION } = obj;
                        var options_str = '';
                        for (let j = 0; j < options.length; j++) {
                            const option = options[j];
                            const { type: optionType, original_order } = option;
                            var query_str = `q_${Math.random().toString().slice(2)}`;
                            var query_str_2 = `q_${Math.random().toString().slice(2)}`;
                            var query_str_3 = `q_${Math.random().toString().slice(2)}`;
                            query += `, ${query_str_3} AS (
  INSERT INTO survey_ranking_options (survey_question_id,option_type,original_order,version) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2} FROM question_cte RETURNING id
), ${query_str} AS ( 
  SELECT id FROM ${query_str_3}
)`;
                            arr.push(optionType, original_order, VERSION);
                            curr_index += 3;
                            switch (optionType) {
                                case 'audio': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO audio_option_type (survey_ranking_option_id,src,title) SELECT id, $${curr_index}, $${curr_index + 1} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title);
                                    curr_index += 2;
                                    options_str += `Audio: ${option_obj.title}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_audio_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'image': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO image_option_type (survey_ranking_option_id,src,short_description,long_description,width,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3}, $${curr_index + 4} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.shortDescription, option_obj.longDescription, Math.round(option_obj.width), Math.round(option_obj.height));
                                    curr_index += 5;
                                    options_str += `Image: ${option_obj.shortDescription}: ${option_obj.longDescription}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_image_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                case 'survey-paragraph': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO survey_paragraph_option_type (survey_ranking_option_id,editor_state,desktop_html,tablet_html,mobile_html) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.editorState, option_obj.desktop_html, option_obj.tablet_html, option_obj.mobile_html);
                                    curr_index += 4;
                                    options_str += `${option_obj.innerText}\n`;
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_audio_urls, unvalidated_audio_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_image_urls, unvalidated_image_urls);
                                    (0, set_1.addItemsToSet)(option_obj.unvalidated_video_urls, unvalidated_video_urls);
                                    break;
                                }
                                case 'video': {
                                    const option_obj = option;
                                    query += `, ${query_str_2} AS (
  INSERT INTO video_option_type (survey_ranking_option_id,src,title,description,height) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2}, $${curr_index + 3} FROM ${query_str} 
)`;
                                    arr.push(option_obj.src, option_obj.title, option_obj.description, Math.round(option_obj.height));
                                    curr_index += 4;
                                    options_str += `Video: ${option_obj.title}: ${option_obj.description}\n`;
                                    if (!!!option_obj.able_to_validate) {
                                        unvalidated_video_urls.add(option_obj.src);
                                    }
                                    break;
                                }
                                default: {
                                    throw new Error(`Ranking option type: ${optionType} does not exist.`);
                                }
                            }
                        }
                        var str_index = 0;
                        while (str_index < options_str.length) {
                            question_str_arr.push(options_str.slice(str_index, str_index + 4000));
                            str_index += 4000;
                        }
                        query += ` SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-selection': {
                        const obj = question;
                        const { include_other, options } = obj;
                        query += `, range_info AS (
  INSERT INTO survey_selection_info (survey_question_id,include_other,version) SELECT id, $${curr_index}, $${curr_index + 1} FROM question_cte
)`;
                        arr.push(include_other, obj.VERSION);
                        curr_index += 2;
                        for (let option of options) {
                            var query_str = `q_${Math.random().toString().slice(2)}`;
                            query += `, ${query_str} AS (
  INSERT INTO survey_selection_options (survey_question_id,option,selected,index) SELECT id, $${curr_index}, $${curr_index + 1}, $${curr_index + 2} FROM question_cte
)`;
                            arr.push(option.option, option.selected, option.index);
                            curr_index += 3;
                        }
                        var str_index = 0;
                        while (str_index < obj.selectionText.length) {
                            question_str_arr.push(obj.selectionText.slice(str_index, str_index + 4000));
                            str_index += 4000;
                        }
                        query += ` SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-short-answer': {
                        const obj = question;
                        query += `, second_query AS ( 
  INSERT INTO survey_short_answer_info (survey_question_id,min_length,max_length,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2} FROM question_cte
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minLength, obj.maxLength, obj.VERSION);
                        curr_index += 3;
                        break;
                    }
                    case 'survey-short-blog': {
                        query += `, second_query AS (
  SELECT true AS column_name
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-time': {
                        const obj = question;
                        query += `, second_query AS (
  INSERT INTO survey_time_info (survey_question_id,min_time,max_time,step,version) SELECT id, $${curr_index},$${curr_index + 1},$${curr_index + 2},$${curr_index + 3} FROM question_cte 
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        arr.push(obj.minTime, obj.maxTime, obj.step, obj.VERSION);
                        curr_index += 4;
                        break;
                    }
                    case 'survey-video': {
                        query += `, second_query AS (
  SELECT true AS column_name
) SELECT question_cte.id id, question_cte.question_type question_type FROM question_cte;`;
                        break;
                    }
                    case 'survey-week': {
                        throw new Error("This question type has not been implemented yet.");
                    }
                    default: {
                        break;
                    }
                }
                promiseArrQuestions.push(db_connection.query(query, arr));
                embed_question_arr.push(question_str_arr);
            }
            const [question_ids_and_types, promiseEmbedQuestions, promiseModerateQuestions] = await Promise.all([
                Promise.all(promiseArrQuestions),
                Promise.all(embed_question_arr.map((arr) => Promise.all(arr.map((s) => (0, ai_1.createEmbedding)(s, 'text-embedding-ada-002'))))),
                Promise.all(embed_question_arr.map((arr) => Promise.all(arr.map((s) => (0, ai_1.moderateOpenAI)(s)))))
            ]);
            const moderation_query = (0, handleArticleData_1.GET_INSERT_INTO_MODERATION_TABLE)('survey_question_moderation', 'survey_question_id');
            for (let i = 0; i < question_ids_and_types.length; i++) {
                const question_id = (_b = (_a = question_ids_and_types[i]) === null || _a === void 0 ? void 0 : _a.rows) === null || _b === void 0 ? void 0 : _b[0].id;
                const toEmbedArray = promiseEmbedQuestions[i];
                const textChunks = embed_question_arr[i];
                const moderationArr = promiseModerateQuestions[i];
                if (!!!Number.isInteger(question_id)) {
                    throw new Error(`Something went wrong getting id for question ${i}`);
                }
                const moderationParsedQuestion = [];
                for (let moder of moderationArr) {
                    moderationParsedQuestion.push((0, ai_1.parseOpenAIModerationResponse)(moder));
                }
                for (let j = 0; j < toEmbedArray.length; j++) {
                    const document = textChunks[j];
                    db_connection.query(`INSERT INTO survey_question_search (survey_question_id,document,embedding) VALUES ($1,$2,$3);`, [question_id, document, (0, pg_1.toSql)(toEmbedArray[j])]);
                }
                for (let parsedModer of moderationParsedQuestion) {
                    for (let subModArr of parsedModer) {
                        db_connection.query(moderation_query, [question_id, ...subModArr]);
                    }
                }
            }
            db_connection.query(`DELETE FROM saved_surveys WHERE survey_uuid=$1;`, [survey_uuid]);
            await db_connection.query('COMMIT;');
            db_connection.release();
            return res.status(200).json({ error: (0, html_1.getWarningSnackbar)("I haven't implemented this yet.") });
        }
        catch (e) {
            console.error(e);
            try {
                await db_connection.query('ROLLBACK;');
            }
            catch (err) {
                console.error(err);
            }
            db_connection.release();
            return res.status(400).json({ error: (0, html_1.getWarningSnackbar)("I haven't implemented this yet.") });
        }
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: (0, html_1.getErrorSnackbar)("Something went wrong posting the survey!") });
    }
}
exports.postSurvey = postSurvey;
async function validateSurveyResponses(survey_id, responses) {
    const date_responded = (0, time_1.getUnixTime)();
    const dbqsQuery = await (0, database_1.default)().query(`SELECT id, required, question_type FROM survey_questions WHERE survey_questions.survey_id=$1 ORDER BY question_number ASC;`, [survey_id]);
    const db_questions = dbqsQuery.rows;
    if (db_questions.length !== responses.length) {
        throw new Error("The length of the questions in the database does not match the length of survey responses.");
    }
    for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const { id, required: dbRequired, question_type: dbQuestionType } = db_questions[i];
        const { question_id, question_type, required } = response;
        if (dbRequired !== required || question_type !== dbQuestionType) {
            throw new Error(`Question ${i + 1}: Response Required (${Boolean(required)}) <> Database Required (${Boolean(dbRequired)}), or Response Question Type (${String(question_type)}) <> (${String(dbQuestionType)}).`);
        }
        if (!!!response.response && required) {
            throw new Error(`Question ${i + 1} is required but there is no response.`);
        }
        if (id !== question_id) {
            throw new Error(`Question ${i + 1}: The response question id does not match the question id from the database.`);
        }
    }
    const db = (0, database_1.default)();
    const dbResponses = [];
    for (let i = 0; i < db_questions.length; i++) {
        const question = db_questions[i];
        const response = responses[i];
        const required = response.required;
        const confirm_response = response.confirmed_response;
        if (!!!required && !!!confirm_response) {
            continue;
        }
        switch (question.question_type) {
            case 'survey-audio': {
                dbResponses.push(new Promise((resolve, _) => resolve(null)));
                break;
            }
            case 'survey-checkbox': {
                dbResponses.push(db.query(`WITH checkbox_cte AS (
  SELECT array_agg(id) AS valid_options, survey_question_id FROM survey_checkbox_options WHERE survey_question_id=$1 GROUP BY (survey_question_id)
) SELECT checkbox_cte.valid_options, survey_checkbox_info.min_selected, survey_checkbox_info.max_selected FROM survey_checkbox_info JOIN checkbox_cte ON checkbox_cte.survey_question_id=survey_checkbox_info.survey_question_id  WHERE survey_checkbox_info.survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-color': {
                dbResponses.push(new Promise((resolve, _) => resolve(null)));
                break;
            }
            case 'survey-date': {
                dbResponses.push(db.query(`SELECT min_date, max_date, step FROM survey_date_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-datetime': {
                dbResponses.push(db.query(`SELECT min_datetime, max_datetime, step FROM survey_datetime_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-image': {
                dbResponses.push(new Promise((resolve, _) => resolve(null)));
                break;
            }
            case 'survey-month': {
                dbResponses.push(db.query(`SELECT min_month, max_month, step FROM survey_month_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-multiple-choice': {
                dbResponses.push(db.query(`SELECT array_agg(id) valid_options FROM survey_multiple_choice_options WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-number': {
                dbResponses.push(db.query(`SELECT min_number, max_number, step FROM survey_number_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-paragraph': {
                dbResponses.push(db.query(`SELECT min_length, max_length FROM survey_paragraph_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-range': {
                dbResponses.push(db.query(`SELECT range_min, range_max, range_step FROM survey_range_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-ranking': {
                dbResponses.push(db.query(`SELECT array_agg(id) AS required_ids FROM survey_ranking_options WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-selection': {
                dbResponses.push(db.query(`WITH options_info AS (
	SELECT array_agg(survey_selection_options.index) AS valid_indices, survey_question_id FROM survey_selection_options WHERE survey_question_id=$1 GROUP BY survey_question_id
) SELECT include_other AS include_other_allowed, options_info.valid_indices  
FROM survey_selection_info
JOIN options_info 
ON survey_selection_info.survey_question_id=options_info.survey_question_id
WHERE survey_selection_info.survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-short-answer': {
                dbResponses.push(db.query(`SELECT min_length, max_length FROM survey_short_answer_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-short-blog': {
                dbResponses.push(new Promise((resolve, _) => resolve(null)));
                break;
            }
            case 'survey-time': {
                dbResponses.push(db.query(`SELECT min_time, max_time, step FROM survey_time_info WHERE survey_question_id=$1;`, [question.id]));
                break;
            }
            case 'survey-video': {
                dbResponses.push(new Promise((resolve, _) => resolve(null)));
                break;
            }
            case 'survey-week': {
                throw new Error("This question type has not been implemented yet.");
            }
            default: {
                throw new Error("Unrecognized question type.");
            }
        }
    }
    const validateDBResponsesQueryRes = await Promise.all(dbResponses);
    const validateDbResponsesRows = validateDBResponsesQueryRes.map((obj) => obj === null ? null : obj.rows[0]);
    const parsed_survey_responses = [];
    for (let i = 0; i < responses.length; i++) {
        const parsed_survey_response = {};
        const response = responses[i];
        const required = response.required;
        const confirm_response = response.confirmed_response;
        if (required || (!!!required && confirm_response)) {
            continue;
        }
        parsed_survey_response.question_type = response.question_type;
        parsed_survey_response.question_id = response.question_id;
        parsed_survey_response.required = required;
        parsed_survey_response.confirmed_response = confirm_response;
        parsed_survey_response.date_responded = date_responded;
        switch (response.question_type) {
            case 'survey-audio': {
                const { src, title } = response.response;
                if (title.length > 50 || title.length < 1) {
                    throw new Error("Title for audio input must be between 1 and 50 characters.");
                }
                if (!!!src.startsWith('https://audio.storething.org/frankmbrown')) {
                    throw new Error("The source of the audio input is not valid.");
                }
                parsed_survey_response.response = {
                    src,
                    title
                };
                break;
            }
            case 'survey-checkbox': {
                const { choices, min_selected, max_selected } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const valid_options = new Set(validatedObject.valid_options);
                const choices_new = choices.filter((c) => valid_options.has(c));
                if (Number.isInteger(min_selected)) {
                    if (choices_new.length < Number(min_selected)) {
                        throw new Error("The number of selected choices is less than the minimum allowed number of selected choices. ");
                    }
                }
                if (Number.isInteger(max_selected)) {
                    if (choices_new.length > Number(max_selected)) {
                        throw new Error("The number of selected choices is greater than the maximum allowed number of selected choices. ");
                    }
                }
                parsed_survey_response.response = {
                    choices: choices_new
                };
                break;
            }
            case 'survey-color': {
                const { color } = response.response;
                if (!!!lexicalLexical_1.VALID_HEX_REGEX.test(color)) {
                    throw new Error("Invalid color for survey response.");
                }
                parsed_survey_response.response = {
                    color
                };
                break;
            }
            case 'survey-date': {
                const { date } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                if (!!!isValidDateString(date)) {
                    throw new Error("Invalid date string for survey response.");
                }
                const { min_date, max_date, step } = validatedObject;
                if (!!!Number.isInteger(step)) {
                    throw new Error("Invalid step value for date input.");
                }
                const d = new Date(date);
                var valid_step = false;
                if (min_date && isValidDateString(min_date)) {
                    const min_d = new Date(min_date);
                    if (min_d > d) {
                        throw new Error("Date input is less than min date.");
                    }
                    const min_d_time = min_d.getTime();
                    const d_time = d.getTime();
                    if (!!!decimal_js_1.Decimal.mod((d_time - min_d_time), step * 86400000).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Date does not comply with step input.");
                    }
                    else {
                        valid_step = true;
                    }
                }
                if (max_date && isValidDateString(max_date)) {
                    const max_d = new Date(max_date);
                    if (max_d < d) {
                        throw new Error("Date is greater than max date.");
                    }
                    if (!!!valid_step) {
                        if (!!!decimal_js_1.Decimal.mod((max_d.getTime() - d.getTime()), step * 86400000).equals(DECIMAL_ZERO)) { // MOD
                            throw new Error("Date does not comply with step input.");
                        }
                    }
                }
                parsed_survey_response.response = {
                    date
                };
                break;
            }
            case 'survey-datetime': {
                const { datetime } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { min_datetime, max_datetime, step } = validatedObject;
                if (!!!isValidDateString(datetime)) {
                    throw new Error("Invalid datetime string for survey response.");
                }
                if (!!!Number.isInteger(step)) {
                    throw new Error("Invalid step value for date input.");
                }
                const d = new Date(datetime);
                var valid_step = false;
                if (min_datetime && isValidDateString(min_datetime)) {
                    const min_d = new Date(min_datetime);
                    if (min_d > d) {
                        throw new Error("Datetime input is less than min datetime.");
                    }
                    const min_d_time = min_d.getTime();
                    const d_time = d.getTime();
                    if (!!!decimal_js_1.Decimal.mod((d_time - min_d_time), step * 60).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Datetime does not comply with step input.");
                    }
                    else {
                        valid_step = true;
                    }
                }
                if (max_datetime && isValidDateString(max_datetime)) {
                    const max_d = new Date(max_datetime);
                    if (max_d < d) {
                        throw new Error("Datetime is greater than max datetime.");
                    }
                    if (!!!valid_step) {
                        if (!!!decimal_js_1.Decimal.mod((max_d.getTime() - d.getTime()), step * 60).equals(DECIMAL_ZERO)) { // MOD
                            throw new Error("Datetime does not comply with step input.");
                        }
                    }
                }
                parsed_survey_response.response = {
                    datetime
                };
                break;
            }
            case 'survey-image': {
                const { src, short_description, long_description } = response.response;
                if (!!!src.startsWith('https://image.storething.org/frankmbrown')) {
                    throw new Error("The source of the image input is not valid.");
                }
                if (short_description.length > 50) {
                    throw new Error("The short image description can not be longer than 50 characters.");
                }
                if (long_description.length > 200) {
                    throw new Error("The long image description can not be longer than 200 characters.");
                }
                parsed_survey_response.response = {
                    src,
                    long_description,
                    short_description
                };
                break;
            }
            case 'survey-month': {
                const { month } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { min_month, max_month, step } = validatedObject;
                if (!!!Number.isInteger(step)) {
                    throw new Error("Step input is invalid.");
                }
                if (!!!isValidDateString(month)) {
                    throw new Error("Month input is invalid.");
                }
                const d = new Date(month);
                var valid_step = false;
                if (min_month && isValidDateString(min_month)) {
                    const min_d = new Date(min_month);
                    if (min_d > d) {
                        throw new Error("Month input is less than min month.");
                    }
                    const startDate = new Date(min_month + '-01');
                    const endDate = new Date(month + '-01');
                    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                        (endDate.getMonth() - startDate.getMonth());
                    if (!!!decimal_js_1.Decimal.mod(months, step).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Month does not comply with step value.");
                    }
                    else {
                        valid_step = true;
                    }
                }
                if (max_month && isValidDateString(max_month)) {
                    const max_d = new Date(max_month);
                    if (max_d < d) {
                        throw new Error("Month is greater than max month.");
                    }
                    if (!!!valid_step) {
                        const startDate = new Date(month + '-01');
                        const endDate = new Date(max_month + '-01');
                        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                            (endDate.getMonth() - startDate.getMonth());
                        if (!!!decimal_js_1.Decimal.mod(months, step).equals(DECIMAL_ZERO)) { // MOD
                            throw new Error("Month does not comply with step value.");
                        }
                        else {
                            valid_step = true;
                        }
                    }
                }
                parsed_survey_response.response = {
                    month
                };
                break;
            }
            case 'survey-multiple-choice': {
                const { choice } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const IS_VALID = (new Set(validatedObject.valid_options)).has(choice);
                if (!!!IS_VALID) {
                    throw new Error("Invalid multiple choice selection.");
                }
                parsed_survey_response.response = {
                    choice
                };
                break;
            }
            case 'survey-number': {
                const { number } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { step } = validatedObject;
                const max_number = validatedObject.max_number;
                const min_number = validatedObject.min_number;
                if (typeof min_number === "number" && number < min_number) {
                    throw new Error("Number input is less than the min number.");
                }
                if (typeof max_number === "number" && number > max_number) {
                    throw new Error("Number input is greater than the max number.");
                }
                if (typeof min_number === "number") {
                    if (!!!decimal_js_1.Decimal.mod((number - min_number), step).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Number input does not comply with step requirement.");
                    }
                }
                else if (typeof max_number === "number") {
                    if (!!!decimal_js_1.Decimal.mod((max_number - number), step).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Number input does not comply with step requirement.");
                    }
                }
                parsed_survey_response.response = {
                    number
                };
                break;
            }
            case 'survey-paragraph': {
                const { response: paragraphResponse } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { min_length, max_length } = validatedObject;
                if (Number.isInteger(min_length) && paragraphResponse.length < Number(min_length)) {
                    throw new Error("Survey short answer response length smaller than min length.");
                }
                if (Number.isInteger(max_length) && paragraphResponse.length > Number(max_length)) {
                    throw new Error("Survey short answer response length longer than max length.");
                }
                parsed_survey_response.response = {
                    response: paragraphResponse
                };
                break;
            }
            case 'survey-range': {
                const { input } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { range_min, range_max, range_step } = validatedObject;
                if (!!!decimal_js_1.Decimal.mod((input - range_min), range_step).equals(DECIMAL_ZERO)) { // MOD
                    throw new Error("Input does not comply with step requirement.");
                }
                if (input > range_max || input < range_min) {
                    throw new Error("Range Input is greater than range max or less than range min.");
                }
                parsed_survey_response.response = {
                    input
                };
                break;
            }
            case 'survey-ranking': {
                const { ordered } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { required_ids } = validatedObject;
                const require_id_set = new Set(required_ids);
                if (required_ids.length !== ordered.length) {
                    throw new Error("The number of items in database and response for ranking question do not match.");
                }
                for (let id of ordered) {
                    if (!!!require_id_set.has(id)) {
                        throw new Error("Response includes id for ranking question that is not included in surveys.");
                    }
                }
                parsed_survey_response.response = {
                    ordered
                };
                break;
            }
            case 'survey-selection': {
                const { other_checked } = response.response;
                const other_option = response.response.other_option;
                const choice = response.response.choice;
                const validatedObject = validateDbResponsesRows[i];
                const { include_other_allowed, valid_indices } = validatedObject;
                const valid_indices_set = new Set(valid_indices);
                if (!!!include_other_allowed && (other_checked || other_option !== undefined)) {
                    throw new Error("Selection option does not allow for include_other option.");
                }
                if (typeof choice === "number" && !!!valid_indices_set.has(choice)) {
                    throw new Error("Invalid choice.");
                }
                if (other_option !== 'undefined' && (typeof other_option !== 'string' || other_option.length > 100)) {
                    throw new Error("Other Option for survey selection length can not be greater than 100.");
                }
                parsed_survey_response.response = {
                    choice: !!!other_checked && Number.isInteger(choice) ? Number(choice) : null,
                    other_checked: other_checked,
                    other_option: typeof other_option === "string" ? other_option : null
                };
                break;
            }
            case 'survey-short-answer': {
                const { response: shortAnswerResponse } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { min_length, max_length } = validatedObject;
                if (Number.isInteger(min_length) && shortAnswerResponse.length < Number(min_length)) {
                    throw new Error("Survey short answer response length smaller than min length.");
                }
                if (Number.isInteger(max_length) && shortAnswerResponse.length > Number(max_length)) {
                    throw new Error("Survey short answer response length longer than max length.");
                }
                parsed_survey_response.response = {
                    response: shortAnswerResponse
                };
                break;
            }
            case 'survey-short-blog': {
                const { editorState } = response.response;
                const editorStateParsed = JSON.parse(editorState);
                const { desktop_html, mobile_html, tablet_html, editorState: editor_state, innerText } = await (0, lexical_1.parseSurveyShortBlogEditor)(editorStateParsed);
                parsed_survey_response.response = {
                    editor_state,
                    desktop_html,
                    mobile_html,
                    tablet_html,
                    innerText
                };
                break;
            }
            case 'survey-time': {
                const { time } = response.response;
                const validatedObject = validateDbResponsesRows[i];
                const { min_time, max_time, step } = validatedObject;
                if (!!!isValidTimeString(time)) {
                    throw new Error("Invalid time string for response.");
                }
                const time_num = timeToNumber(time);
                if (!!!Number.isInteger(step)) {
                    throw new Error("Step input is invalid.");
                }
                var valid_step = false;
                if (isValidTimeString(min_time)) {
                    const min_time_num = timeToNumber(min_time);
                    if (min_time_num > time_num) {
                        throw new Error("Time Input for response less than min time input.");
                    }
                    if (!!!decimal_js_1.Decimal.mod((time_num - min_time), step).equals(DECIMAL_ZERO)) { // MOD
                        throw new Error("Time does not comply with step value.");
                    }
                    else {
                        valid_step = true;
                    }
                }
                if (isValidTimeString(max_time)) {
                    const max_time_num = timeToNumber(max_time);
                    if (max_time_num < time_num) {
                        throw new Error("Time Input for response greater than max time input.");
                    }
                    if (!!!valid_step) {
                        if (!!!decimal_js_1.Decimal.mod((max_time - time_num), step).equals(DECIMAL_ZERO)) { // MOD
                            throw new Error("Time does not comply with step value.");
                        }
                    }
                }
                parsed_survey_response.response = {
                    time
                };
                break;
            }
            case 'survey-video': {
                const { src, title, description, height } = response.response;
                if (!!!src.startsWith('https://video.storething.org/frankmbrown')) {
                    throw new Error("The source of the video input is not valid.");
                }
                if (typeof title !== 'string' || title.length < 0 || title.length > 50) {
                    throw new Error("Invalid video option title. The length of the title must be1 to 50 characters.");
                }
                if (typeof height !== 'number') {
                    throw new Error("Unable to find a height for the provided video.");
                }
                if (typeof description !== 'string' || description.length > 200) {
                    throw new Error("Video description must be a string less than 200 characters.");
                }
                parsed_survey_response.response = {
                    src,
                    title,
                    height,
                    description
                };
                break;
            }
            case 'survey-week': {
                throw new Error("This survey question type has not been implemented yet.");
            }
            default: {
                throw new Error("Something went wrong parsing the survey responses.");
            }
        }
        parsed_survey_responses.push(parsed_survey_response);
    }
    return parsed_survey_responses;
}
async function postSurveyResponse(req, res) {
    try {
        const { responses } = req.body;
        const { id } = req.params;
        if (!!!Number.isInteger(parseInt(id))) {
            return res.status(400).json({ error: "Invalid survey id." });
        }
        if (!!!Array.isArray(responses)) {
            return res.status(400).json({ error: "Response is not an array." });
        }
        const parsedSurveyResponses = await validateSurveyResponses(parseInt(id), responses);
        const db_connection = await (0, database_1.default)().connect();
        try {
            await db_connection.query('BEGIN;');
            const ip_id = req.session.ip_id;
            const survey_response_query = await db_connection.query(`INSERT INTO survey_responses (ip_id, survey_id, date_responded) VALUES ($1,$2,$3) RETURNING id;`, [ip_id, parseInt(id), (0, time_1.getUnixTime)()]);
            const survey_response_id = survey_response_query.rows[0].id;
            if (!!!Number.isInteger(survey_response_id)) {
                throw new Error("Something went wrong getting the survey response id.");
            }
            const promiseArr = [];
            for (let i = 0; i < parsedSurveyResponses.length; i++) {
                const { question_id, response: qR } = parsedSurveyResponses[i];
                const arr = [survey_response_id, question_id];
                switch (parsedSurveyResponses[i].question_type) {
                    case 'survey-audio': {
                        const { src, title } = qR;
                        arr.push(src, title);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_audio_response (survey_response_id,survey_question_id,src,title) VALUES ($1,$2,$3,$4);`, arr));
                        break;
                    }
                    case 'survey-checkbox': {
                        const { choices } = qR;
                        for (let choice of choices) {
                            const arr2 = arr.concat([choice]);
                            promiseArr.push(db_connection.query(`INSERT INTO survey_checkbox_response (survey_response_id,survey_question_id,survey_checkbox_option_id) VALUES ($1,$2,$3);`, arr2));
                        }
                        break;
                    }
                    case 'survey-color': {
                        const { color } = qR;
                        arr.push(color);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_color_response (survey_response_id,survey_question_id,color) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-date': {
                        const { date } = qR;
                        arr.push(date);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_date_response (survey_response_id,survey_question_id,date) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-datetime': {
                        const { datetime } = qR;
                        arr.push(datetime);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_datetime_response (survey_response_id,survey_question_id,datetime) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-image': {
                        const { src, short_description, long_description } = qR;
                        arr.push(src, short_description, long_description);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_image_response (survey_response_id,survey_question_id,src,short_description,long_description) VALUES ($1,$2,$3,$4,$5);`, arr));
                        break;
                    }
                    case 'survey-month': {
                        const { month } = qR;
                        arr.push(month);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_month_response (survey_response_id,survey_question_id,month) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-multiple-choice': {
                        const { choice } = qR;
                        arr.push(choice);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_multiple_choice_responses (survey_response_id,survey_question_id,survey_multiple_choice_option_id) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-number': {
                        const { number } = qR;
                        arr.push(number);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_number_response (survey_response_id,survey_question_id,number) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-paragraph': {
                        const { response: paragraphResponse } = qR;
                        arr.push(paragraphResponse);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_paragraph_response (survey_response_id,survey_question_id,response) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-range': {
                        const { input } = qR;
                        arr.push(input);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_range_response (survey_response_id,survey_question_id,input) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-ranking': {
                        const { ordered } = qR;
                        for (let j = 0; j < ordered.length; j++) {
                            const arr2 = arr.concat([ordered[j], j + 1]);
                            promiseArr.push(db_connection.query(`INSERT INTO survey_ranking_responses (survey_response_id,survey_question_id,survey_ranking_option_id,ranking) VALUES ($1,$2,$3,$4);`, arr2));
                        }
                        break;
                    }
                    case 'survey-selection': {
                        const { choice, other_checked, other_option } = qR;
                        if (choice !== null) {
                            arr.push();
                            promiseArr.push(db_connection.query(`INSERT INTO survey_selection_response (survey_response_id,survey_question_id,choice,other_checked,other_option) 
                SELECT $1,$2,id,$3,$4 FROM survey_selection_options WHERE survey_selection_options.survey_question_id=$1 LIMIT 1;`, arr));
                        }
                        else {
                            arr.push(other_checked, other_option);
                            promiseArr.push(db_connection.query(`INSERT INTO survey_selection_response (survey_response_id,survey_question_id,other_checked,other_option) VALUES ($1,$2,$3,$4);`, arr));
                        }
                        break;
                    }
                    case 'survey-short-answer': {
                        const { response: shortAnswerResponse } = qR;
                        arr.push(shortAnswerResponse);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_short_answer_response (survey_response_id,survey_question_id,response) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-short-blog': {
                        const { editor_state, innerText, desktop_html, tablet_html, mobile_html } = qR;
                        arr.push(editor_state, desktop_html, tablet_html, mobile_html, innerText);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_short_blog_response (survey_response_id,survey_question_id,editor_state,desktop_html,tablet_html,mobile_html,innerText) VALUES ($1,$2,$3,$4,$5,$6,$7);`, arr));
                        break;
                    }
                    case 'survey-time': {
                        const { time } = qR;
                        arr.push(time);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_time_response (survey_response_id,survey_question_id,time) VALUES ($1,$2,$3);`, arr));
                        break;
                    }
                    case 'survey-video': {
                        const { src, title, description, height } = qR;
                        arr.push(src, title, description, height);
                        promiseArr.push(db_connection.query(`INSERT INTO survey_video_response (survey_response_id,survey_question_id,src,title,description,height) VALUES ($1,$2,$3,$4,$5,$6);`, arr));
                        break;
                    }
                    case 'survey-week': {
                        throw new Error("This question type has not been implemented yet.");
                    }
                    default: {
                        throw new Error("Unrecognized survey question type.");
                    }
                }
            }
            await Promise.all(promiseArr);
            await db_connection.query('COMMIT;');
            db_connection.release();
        }
        catch (e) {
            console.error(e);
            try {
                await db_connection.query('ROLLBACK;');
            }
            catch (e) { }
            db_connection.release();
            throw new Error("Something went wrong posting the surey response.");
        }
        return res.status(200).json({ success: "Successfully posted survey response." });
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: (0, html_1.getErrorSnackbar)("Unable to post survey response! Try reloading the page.") });
    }
}
exports.postSurveyResponse = postSurveyResponse;
async function searchSurveys(req, res) {
    var _a, _b;
    try {
        const surveySearch = req.query['search-surveys'];
        if (!!!surveySearch) {
            throw new Error("Unable to find survey search.");
        }
        if (typeof surveySearch !== 'string') {
            return res.status(200).send((0, html_1.getErrorAlert)("Search term must be a string.", undefined, false));
        }
        if (surveySearch.length === 0) {
            return res.status(200).send((0, html_1.getInfoAlert)("Enter the name or description of a survey to search for in the search box above to search for saved surveys.", undefined, false));
        }
        const tz = ((_a = req.session.settings) === null || _a === void 0 ? void 0 : _a.timezone) || 'America/New_York';
        const user_id = (_b = req.session.auth) === null || _b === void 0 ? void 0 : _b.userID;
        const rows = (await (0, database_1.default)().query(`WITH query AS ( SELECT websearch_to_tsquery('english',$1) term ) SELECT id, title, description_text, cardinality(questions) questions_length, date_created FROM saved_surveys WHERE (SELECT term FROM query) @@ search AND ${Number.isInteger(user_id) ? `user_id` : `ip_id`}=$2 ORDER BY ts_rank(search,(SELECT term FROM query)) DESC, date_created DESC LIMIT 20;`, [surveySearch, user_id ? user_id : req.session.ip_id])).rows;
        if (!!!rows.length) {
            return res.status(200).send((0, html_1.getWarningAlert)("No search results found.", undefined, false));
        }
        const html = rows.map((obj) => {
            var _a;
            const num_questions = obj.questions_length;
            const date_created_str = (0, time_1.formatDateFromUnixTime)('MMM D, YYYY', tz, Number(obj.date_created));
            const datetime_str = (0, time_1.getDateTimeStringFromUnix)(Number(obj.date_created), true);
            return `<div class="flex-row justify-start mt-1 align-center w-100 gap-1 p-sm" style="border: 3px solid var(--text-primary); border-radius: 4px; background-color: var(--background);">
<label class="radio grow-0 large"><input type="radio" name="download-survey-radio" class="secondary" value="${(0, escape_html_1.default)(obj.id)}"><span hidden=""></span></label>
<div class="grow-1">
  <p class="h6 bold block">${(0, escape_html_1.default)(obj.title)}</p>
  <p class="body1 mt-1">${(0, escape_html_1.default)((_a = obj === null || obj === void 0 ? void 0 : obj.description_text) === null || _a === void 0 ? void 0 : _a.slice(0, 150).concat('...'))}</p>
  <div class="flex-row align-center justify-between">
      <span class="flex-row align-center justify-start gap-1">
        <svg class="t-normal" style="width:1rem;height:1rem;" viewBox="0 0 320 512" title="question" focusable="false" inert tabindex="-1"><path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path></svg>
        <span>
        ${(0, escape_html_2.default)(num_questions)}
        </span>
      </span>
      <time data-date-format="MMM D, YYYY" datetime="${datetime_str}">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CalendarToday">
        <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z">
        </path>
      </svg>
      <span>${(0, escape_html_2.default)(date_created_str)}</span>
    </time>
  </div>
</div>
</div>`;
        }).join('');
        return res.status(200).send(html);
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong searching for surveys.", undefined, false));
    }
}
exports.searchSurveys = searchSurveys;
async function postSaveSurvey(req, res) {
    var _a;
    try {
        const { title, description: descriptionStringified, image, questions, survey_uuid, deadline } = req.body;
        if (typeof title !== 'string' || title.length < 1 || title.length > 100) {
            return res.status(400).send("Invalid survey title.");
        }
        const descriptionLexicalState = JSON.parse(descriptionStringified);
        const { editorState: description, innerText: description_text } = await (0, lexical_1.parseFullLexicalEditor)(descriptionLexicalState);
        if (!!!image.startsWith('https://image.storething.org/frankmbrown/')) {
            return res.status(400).json({ error: "Invalid survey image." });
        }
        if (!!!isValidDateString(deadline)) {
            return res.status(499).json({ error: "Invalid datetime value." });
        }
        const { valid, error, question } = await validateQuestionStatesSave(questions);
        if (!!!valid) {
            console.error(`Invalid Question ${question}: ${error}`);
            return res.status(400).send(error);
        }
        const ip_id = req.session.ip_id;
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
        await (0, database_1.default)().query(`INSERT INTO saved_surveys (ip_id,user_id,title,description,description_text,image,questions,survey_uuid,deadline) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (survey_uuid) DO UPDATE SET ip_id=$1,user_id=$2,title=$3,description=$4,description_text=$5,image=$6,questions=$7,deadline=$9;`, [ip_id, user_id, title, description, description_text, image, questions, survey_uuid, deadline]);
        return res.status(200).send("Successfully saved survey.");
    }
    catch (e) {
        console.error(e);
        return res.status(400).send("Something went wrong searching for surveys.");
    }
}
exports.postSaveSurvey = postSaveSurvey;
async function downloadSurvey(req, res) {
    var _a;
    try {
        const { id } = req.params;
        if (!!!Number.isInteger(parseInt(id))) {
            return res.status(400).json({ error: "Invalid id parameter." });
        }
        const user_id = ((_a = req.session.auth) === null || _a === void 0 ? void 0 : _a.userID) || null;
        const ip_id = req.session.ip_id;
        const surveyRows = (await (0, database_1.default)().query(`SELECT title, description, image, questions, survey_uuid, deadline FROM saved_surveys WHERE id=$1 AND ${user_id ? `user_id` : `ip_id`}=$2`, [parseInt(id), user_id ? user_id : ip_id])).rows;
        if (surveyRows.length === 1) {
            const { title, description, image, questions, survey_uuid, deadline } = surveyRows[0];
            return res.status(200).json({ title, description, image, questions, survey_uuid, deadline });
        }
        else {
            return res.status(200).json({ error: "Unable to find survey with the id specified for the given user." });
        }
    }
    catch (e) {
        console.error(e);
        return res.status(400).json({ error: "Something went wrong downloading the survey." });
    }
}
exports.downloadSurvey = downloadSurvey;
async function searchSurveysAndQuestions(req, res) {
    try {
        const search_input = req.query['search-surveys-input'];
        const survey_search_type = req.query['survey-search-type'];
        if (typeof search_input !== 'string' || !!!search_input.length) {
            return res.status(200).send((0, html_1.getErrorAlert)("Search Input must be at least 1 character long.", undefined, false));
        }
        if (survey_search_type !== 'default' && survey_search_type !== 'semantic' && survey_search_type !== 'by-title') {
            return res.status(200).send((0, html_1.getErrorAlert)("Search Survey Type must be either 'default' or 'semantic'.", undefined, false));
        }
        if (survey_search_type === "by-title") {
            const query = `WITH surveys_question_count AS (
  SELECT survey_id, COUNT(id) AS question_count FROM survey_questions GROUP BY survey_questions.survey_id 
), survey_like_count AS (
  SELECT count(like_id) like_count, survey_id FROM article_likes WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_view_count AS (
  SELECT count(id) view_count, survey_id FROM survey_views GROUP BY survey_id
), survey_annotation_count AS (
  SELECT count(id) annotation_count, survey_id FROM annotations WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_responses_count AS (
  SELECT count(id) as response_count, survey_id FROM survey_responses GROUP BY survey_id
) SELECT surveys.id, surveys.title, surveys.image, surveys.date_created, surveys.description_text description, surveys_question_count.question_count AS question_count, COALESCE(survey_responses_count.response_count,0) AS response_count, surveys.deadline deadline, COALESCE(survey_like_count.like_count,0) AS like_count, COALESCE(survey_view_count.view_count,0) AS view_count, COALESCE(survey_annotation_count.annotation_count,0) AS annotation_count FROM surveys_question_count LEFT JOIN surveys ON surveys_question_count.survey_id=surveys.id LEFT JOIN survey_like_count ON surveys.id=survey_like_count.survey_id LEFT JOIN survey_responses_count ON surveys.id=survey_responses_count.survey_id LEFT JOIN survey_view_count ON surveys.id=survey_view_count.survey_id LEFT JOIN survey_annotation_count ON surveys.id=survey_annotation_count.survey_id WHERE surveys.title LIKE '%' || $1 || '%' ORDER BY similarity($1,surveys.title) LIMIT 100;`;
            const dbResp = await (0, database_1.default)().query(query, [search_input]);
            const rows = dbResp.rows;
            if (!!!rows.length) {
                return res.status(200).send((0, html_1.getWarningAlert)("No survey titles match the search term.", undefined, false));
            }
            else {
                return res.status(200).send(renderSurveyPreviews(rows, req));
            }
        }
        else if (survey_search_type === "semantic") {
            const embedding = await (0, ai_1.createEmbedding)(search_input, 'text-embedding-ada-002');
            const query = `WITH surveys_question_count AS (
  SELECT survey_id, COUNT(id) AS question_count FROM survey_questions GROUP BY survey_questions.survey_id 
), survey_like_count AS (
  SELECT count(like_id) like_count, survey_id FROM article_likes WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_view_count AS (
  SELECT count(id) view_count, survey_id FROM survey_views GROUP BY survey_id
), survey_annotation_count AS (
  SELECT count(id) annotation_count, survey_id FROM annotations WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_responses_count AS (
  SELECT count(id) as response_count, survey_id FROM survey_responses GROUP BY survey_id
) SELECT surveys.id, surveys.title, surveys.image, surveys.date_created, surveys.description_text description, surveys_question_count.question_count AS question_count, COALESCE(survey_responses_count.response_count,0) AS response_count, surveys.deadline deadline, COALESCE(survey_like_count.like_count,0) AS like_count, COALESCE(survey_view_count.view_count,0) AS view_count, COALESCE(survey_annotation_count.annotation_count,0) AS annotation_count, survey_search.embedding <-> $1 AS relevancy FROM surveys_question_count LEFT JOIN surveys ON surveys_question_count.survey_id=surveys.id JOIN survey_search ON surveys.id=survey_search.survey_id LEFT JOIN survey_like_count ON surveys.id=survey_like_count.survey_id LEFT JOIN survey_responses_count ON surveys.id=survey_responses_count.survey_id LEFT JOIN survey_view_count ON surveys.id=survey_view_count.survey_id LEFT JOIN survey_annotation_count ON surveys.id=survey_annotation_count.survey_id ORDER BY relevancy LIMIT 100;`;
            const dbResp = await (0, database_1.default)().query(query, [(0, pg_1.toSql)(embedding)]);
            const rows = dbResp.rows;
            if (!!!rows.length) {
                return res.status(200).send((0, html_1.getWarningAlert)("No Results were found for the provided query.", undefined, false));
            }
            else {
                return res.status(200).send(renderSurveyPreviews(rows, req));
            }
        }
        else {
            const query = `WITH query AS (
  SELECT websearch_to_tsquery('english',$1) term
), surveys_question_count AS (
  SELECT survey_id, COUNT(id) AS question_count FROM survey_questions GROUP BY survey_questions.survey_id 
), survey_like_count AS (
  SELECT count(like_id) like_count, survey_id FROM article_likes WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_view_count AS (
  SELECT count(id) view_count, survey_id FROM survey_views GROUP BY survey_id
), survey_annotation_count AS (
  SELECT count(id) annotation_count, survey_id FROM annotations WHERE survey_id IS NOT NULL GROUP BY survey_id
), survey_responses_count AS (
  SELECT count(id) as response_count, survey_id FROM survey_responses GROUP BY survey_id
) SELECT surveys.id, surveys.title, surveys.image, surveys.date_created, surveys.description_text description, surveys_question_count.question_count AS question_count, COALESCE(survey_responses_count.response_count,0) AS response_count, surveys.deadline deadline, COALESCE(survey_like_count.like_count,0) AS like_count, COALESCE(survey_view_count.view_count,0) AS view_count, COALESCE(survey_annotation_count.annotation_count,0) AS annotation_count FROM surveys_question_count LEFT JOIN surveys ON surveys_question_count.survey_id=surveys.id JOIN survey_search ON surveys.id=survey_search.survey_id LEFT JOIN survey_like_count ON surveys.id=survey_like_count.survey_id LEFT JOIN survey_responses_count ON surveys.id=survey_responses_count.survey_id LEFT JOIN survey_view_count ON surveys.id=survey_view_count.survey_id LEFT JOIN survey_annotation_count ON surveys.id=survey_annotation_count.survey_id WHERE (SELECT term FROM query) @@ survey_search.search ORDER BY ts_rank(survey_search.search,(SELECT term FROM query)) LIMIT 100;`;
            const dbResp = await (0, database_1.default)().query(query, [search_input]);
            const rows = dbResp.rows;
            if (!!!rows.length) {
                return res.status(200).send((0, html_1.getWarningAlert)("No Results were found for the provided query.", undefined, false));
            }
            else {
                return res.status(200).send(renderSurveyPreviews(rows, req));
            }
        }
    }
    catch (e) {
        console.error(e);
        return res.status(200).send((0, html_1.getErrorAlert)("Something went wrong searching surveys and questions.", undefined, false));
    }
}
exports.searchSurveysAndQuestions = searchSurveysAndQuestions;
