import getDatabase from "../../database";
import { parseCommentLexicalEditor } from "../../lexical";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

export async function updateComments(updateLexicalState=false) {
  const STATE = prompt("You are about to update comments' HTML (AND possibly lexical_state) - make sure to make a replica of the database if you need to. Are you sure you want to proceed (y/n)?");
  if (String(STATE).toLowerCase()!=="y") {
    process.exit(1);
  }
  const idsResp = await getDatabase().query(`SELECT id FROM comments ORDER BY id ASC;`);
  const ids = idsResp.rows.map((obj) => obj.id);
  console.log('MIN ID:',ids[0],'MAX ID:',ids.at(-1));
  for (let i=0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const row = (await getDatabase().query(`SELECT lexical_state FROM comments WHERE id=$1;`,[id])).rows[0];
      const lexical_state = row.lexical_state;
      const {desktop_html, tablet_html, mobile_html, editorState} = await parseCommentLexicalEditor(lexical_state);
      if (updateLexicalState) {
        await getDatabase().query(`UPDATE comments SET desktop_html=$1, tablet_html=$2, mobile_html=$3, lexical_state=$4 WHERE id=$5;`,[desktop_html, tablet_html, mobile_html, editorState, id]);
      } else {
        await getDatabase().query(`UPDATE comments SET desktop_html=$1, tablet_html=$2, mobile_html=$3 WHERE id=$4;`,[desktop_html, tablet_html, mobile_html, id]);
      }
    } catch (err) {
      console.log('ERROR:',id);
      console.error(err);
    }
  }
}
