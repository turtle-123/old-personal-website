import getDatabase from "../../database";
import { parsePostedAnnotation } from "../../lexical";
import PromptSync from "prompt-sync";
const prompt = PromptSync();

export async function updateAnnotations(updateEditorState:boolean=false) {
  // const STATE = prompt("You are about to update annotations' HTML (AND possibly lexical_state) - make sure to make a replica of the database if you need to. Are you sure you want to proceed (y/n)?");
  // if (String(STATE).toLowerCase()!=="y") {
  //   process.exit(1);
  // }
  // const idsResp = await getDatabase().query(`SELECT id FROM annotations ORDER BY id ASC;`);
  // const ids = idsResp.rows.map((obj) => obj.id);
  // console.log('MIN ID:',ids[0],'MAX ID:',ids.at(-1));
  // for (let i=0; i < ids.length; i++) {
  //   const id = ids[i];
  //   try {
  //     const row = (await getDatabase().query(`SELECT start_index start, end_index end, content, reference_id, text_color, background_color, lexical_state, information FROM annotations WHERE id=$1;`,[id])).rows[0];
  //     const { start, end, content, reference_id, lexical_state,  } = row;
  //     const { editorState:editor_state, html:newHTML, text_color, background_color } = await parsePostedAnnotation(lexical_state,{ start, end, content, reference_id });
  //     if (updateEditorState) {
  //       await getDatabase().query(`UPDATE annotations SET lexical_state=$1, html=$2, text_color=$4, background_color=$5, information=$6 WHERE id=$3;`,[editor_state,newHTML,id,text_color,background_color,information]);
  //     } else {
  //       await getDatabase().query(`UPDATE annotations SET html=$1, text_color=$3, background_color=$4, information=$5 WHERE id=$2;`,[newHTML,id,text_color,background_color,information]);
  //     }
  //     console.log("CURR:",id);   
  //   } catch (err) {
  //     console.log('ERROR:',id);
  //     console.error(err);
  //   }
  // }
}