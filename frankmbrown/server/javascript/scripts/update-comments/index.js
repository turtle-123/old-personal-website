"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateComments_1 = require("./updateComments");
(0, updateComments_1.updateComments)()
    .then(() => {
    console.log("Successfully updated comments!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
