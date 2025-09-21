"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateAnnotations_1 = require("./updateAnnotations");
(0, updateAnnotations_1.updateAnnotations)(true)
    .then(() => {
    console.log("Successfully updated annotations!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
