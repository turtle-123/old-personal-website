"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../../database/cache");
async function clearCacheRun() {
    await (0, cache_1.clearCache)();
}
clearCacheRun()
    .then(() => {
    console.log("Cache Cleared");
    process.exit(0);
});
