"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
const updateJupyterNotebooks_1 = require("./updateJupyterNotebooks");
(0, updateJupyterNotebooks_1.updateJupyterNotebooks)()
    .then(() => {
    console.log("Successfully updated Jupyter Notebooks!");
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
