"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateDailyReading_1 = require("./updateDailyReading");
(0, updateDailyReading_1.updateDailyReading)()
    .then(() => {
    console.log("Successfully updated daily reading articles!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
