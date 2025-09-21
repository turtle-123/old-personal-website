import getDatabase from "../../database";
import { parseArticleLexical } from "../../lexical";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

export async function updateArticles(updateLexicalState=false) {
  const STATE = prompt("You are about to update articles' HTML (AND possibly lexical_state) - make sure to make a replica of the database if you need to. Are you sure you want to proceed (y/n)?");
  if (String(STATE).toLowerCase()!=="y") {
    process.exit(1);
  }
  const articlesIDsResp = await getDatabase().query(`SELECT id FROM article ORDER BY id ASC;`);
  const articleIDs = articlesIDsResp.rows.map((obj) => obj.id);
  console.log('MIN ID: ',articleIDs[0],'MAX ID:',articleIDs.at(-1));
  for (let i = 0; i < articleIDs.length; i++) {
    const id = articleIDs[i];
    try {
      const lexical_state_resp = await getDatabase().query(`SELECT lexical_state FROM article WHERE id=$1;`,[id]);
      const lexical_state = lexical_state_resp.rows[0].lexical_state;
      const { desktop_html, tablet_html, mobile_html, editorState } = await parseArticleLexical(lexical_state);
      if (updateLexicalState) {
        await getDatabase().query(`UPDATE article SET desktop_html=$1, tablet_html=$2, mobile_html=$3, lexical_state=$4 WHERE id=$5;`,[desktop_html, tablet_html, mobile_html, editorState, id]);
      } else {
        await getDatabase().query(`UPDATE article SET desktop_html=$1, tablet_html=$2, mobile_html=$3 WHERE id=$4;`,[desktop_html, tablet_html, mobile_html, id]);
      }
      console.log('CURR ID:',id);
    } catch (err) {
      console.log("ERROR ID:",id);
      console.error(err);
    }
  }
}
