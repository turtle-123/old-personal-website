"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
;
const aws_implementation_1 = require("../../aws/aws-implementation");
const database_1 = __importDefault(require("../../database"));
const cmd_1 = require("../../utils/cmd");
const image_1 = require("../../utils/image");
async function addPageImageAndTwitterImageToPage(imageURL) {
    try {
        console.log("Adding Image ".concat(imageURL));
        var image = new Buffer('');
        try {
            image = await (0, image_1.getImageFromUrl)(imageURL);
        }
        catch (e) {
            if (imageURL.startsWith('https://image.storething.org/frankmbrown/og-image/')) {
                image = await (0, image_1.getImageFromUrl)(imageURL.replace('https://image.storething.org/frankmbrown/og-image/', 'https://image.storething.org/frankmbrown/'));
            }
        }
        if (!!!image)
            throw new Error("Image dow not exist.");
        const isOpaque = await (0, image_1.isImageOpaque)(image);
        var newImage;
        if (!!!isOpaque) {
            const background = await (0, image_1.getTransparentImageBackgroundColor)(image);
            newImage = await (0, cmd_1.executeWithArgument)("magick", ['convert', '-', '-background', background, '-flatten', 'jpeg:-'], image);
        }
        else {
            newImage = image;
        }
        var name = imageURL.replace('https://image.storething.org/frankmbrown/', '');
        if (name.startsWith('og-image/'))
            name = name.replace('og-image/', '');
        const { twitter, linkedin } = await (0, image_1.createTwitterAndLinkedInImages)(image);
        const key = 'frankmbrown/'.concat(name);
        const twitterKey = 'frankmbrown/twitter/'.concat(name);
        const linkedinKey = 'frankmbrown/og-image/'.concat(name);
        await Promise.all([
            (0, aws_implementation_1.uploadImageObject)(key, newImage, 'jpg', {}, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(twitterKey, twitter, 'jpg', {}, 3, 25),
            (0, aws_implementation_1.uploadImageObject)(linkedinKey, linkedin, 'jpg', {}, 3, 25)
        ]);
    }
    catch (e) {
        console.error(e);
    }
}
async function updateImages() {
    const images_query = await (0, database_1.default)().query('SELECT DISTINCT image FROM search;');
    const images_rows = images_query.rows.map((obj) => obj.image);
    const promise_arr_1 = [];
    console.log("Image Rows: ", images_rows.length);
    for (let i = 0; i < images_rows.length; i++) {
        const image = images_rows[i];
        if (image.startsWith('https://image.storething.org/frankmbrown/') || image.startsWith('https://image.storething.org/frankmbrown%2F')) {
            var key = image.replace('https://image.storething.org/frankmbrown/', '') || image.replace('https://image.storething.org/frankmbrown%2F', '');
            if (key.startsWith('og-image/'))
                key = key.replace('og-image/', '');
            key = 'frankmbrown/' + key;
            promise_arr_1.push(new Promise((resolve, reject) => {
                (0, image_1.getImageFromUrl)('https://image.storething.org/' + key)
                    .then(() => {
                    resolve({ error: false, image: images_rows[i], key });
                })
                    .catch(() => {
                    resolve({ error: true, image: images_rows[i], key });
                });
            }));
        }
        else {
            console.log(image);
        }
    }
    const resp = await Promise.all(promise_arr_1);
    const promise_arr_2 = [];
    for (let i = 0; i < resp.length; i++) {
        if (resp[i].error) {
            console.error("Image With Key ", resp[i].key, " does not exist");
        }
        else {
            promise_arr_2.push(new Promise((resolve, reject) => {
                const twitter_key = resp[i].key.replace('frankmbrown/', 'frankmbrown/twitter/');
                const linkedin_key = resp[i].key.replace('frankmbrown/', 'frankmbrown/og-image/');
                const { key, image } = resp[i];
                Promise.all([(0, image_1.getImageFromUrl)('https://image.storething.org/' + twitter_key), (0, image_1.getImageFromUrl)('https://image.storething.org/' + linkedin_key)])
                    .then(() => {
                    resolve({ error: false, image, key });
                })
                    .catch(() => {
                    resolve({ error: true, image, key });
                });
            }));
        }
    }
    console.log(promise_arr_2.length);
    const resp_2 = await Promise.all(promise_arr_2);
    const promise_arr_3 = [];
    for (let i = 0; i < resp_2.length; i++) {
        const { error, image } = resp_2[i];
        if (error) {
            promise_arr_3.push(addPageImageAndTwitterImageToPage(image));
        }
    }
    console.log(promise_arr_3.length);
    await Promise.all(promise_arr_3);
}
process.on('beforeExit', (code) => {
    console.log('Process beforeExit event with code: ', code);
});
process.on('exit', (code) => {
    console.log('Process exit event with code: ', code);
});
updateImages()
    .then((s) => {
    console.log("Done");
    console.log(s);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
