import getDatabase from "../../database";
import { parseMarkdown } from "../../ROUTER/functions/markdown";

export async function updateMarkdown() {
  const idsResp = await getDatabase().query(`SELECT id FROM markdown_notes WHERE published=true ORDER BY int_id ASC;`);
  const ids = idsResp.rows.map((obj) => obj.id);
  console.log('MIN ID:',ids[0],'MAX ID:',ids.at(-1));
  for (let i=0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const markdownNoteRow = (await getDatabase().query(`SELECT markdown, design_system, breaks, gfm, pedantic FROM markdown_notes WHERE id=$1;`,[id])).rows[0];
      const { markdown, design_system, breaks, gfm, pedantic } = markdownNoteRow;
      const  html = await parseMarkdown(markdown,{ design_system, breaks, gfm, pedantic });
      await getDatabase().query(`UPDATE markdown_notes SET html=$1 WHERE id=$2;`,[html,id]);
      console.log('CURR:',id);
    } catch (err) {
      console.log('ERROR:',id);
      console.error(err);
    }

  }
}