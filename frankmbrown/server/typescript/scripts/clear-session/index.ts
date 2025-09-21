import getDatabase from "../../database";

async function clearSession() {
  await getDatabase().query(`DELETE FROM session;`);
}
clearSession()
.then(() => {
  console.log("Session Cleared");
  process.exit(0);
})