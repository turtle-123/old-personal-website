"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateMarkdown_1 = require("./updateMarkdown");
(0, updateMarkdown_1.updateMarkdown)()
    .then(() => {
    console.log("Successfully updated markdown!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
