"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateStreamOfConsciousness_1 = require("./updateStreamOfConsciousness");
(0, updateStreamOfConsciousness_1.updateStreamOfConsciousness)()
    .then(() => {
    console.log("Successfully updated stream of consciousness!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
