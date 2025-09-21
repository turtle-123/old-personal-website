"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateArticles_1 = require("./updateArticles");
(0, updateArticles_1.updateArticles)()
    .then(() => {
    console.log("Successfully updated articles!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
