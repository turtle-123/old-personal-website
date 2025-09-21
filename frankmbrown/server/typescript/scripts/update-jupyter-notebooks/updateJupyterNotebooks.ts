import getDatabase from "../../database";
import { jupyterNotebookToHTML } from "../../ROUTER/pages_helper/jupyterNotebooks";

export async function updateJupyterNotebooks() {
  const idsResp = await getDatabase().query(`SELECT id FROM jupyter_notebooks ORDER BY int_id ASC;`);
  const ids = idsResp.rows.map((obj) => obj.id);
  console.log('MIN ID:',ids[0],'MAX ID:',ids.at(-1));
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const row = (await getDatabase().query(`SELECT notebook FROM jupyter_notebooks WHERE id=$1;`,[id])).rows[0];
      const { notebook } = row;
      const { html } = await jupyterNotebookToHTML(notebook);
      await getDatabase().query(`UPDATE jupyter_notebooks SET html=$1 WHERE id=$2;`,[html,id]);
      console.log('CURR:',id);
    } catch (err) {
      console.log('ERROR:',id);
      console.error(err);
    }
  }
}