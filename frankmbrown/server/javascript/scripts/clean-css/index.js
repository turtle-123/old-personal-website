"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cleanCssHelper_1 = require("./cleanCssHelper");
(0, cleanCssHelper_1.cleanCss)()
    .then(() => {
    process.exit(0);
});
