import { clearCache } from "../../database/cache";
async function clearCacheRun() {
  await clearCache();
}
clearCacheRun()
.then(() => {
  console.log("Cache Cleared");
  process.exit(0);
})