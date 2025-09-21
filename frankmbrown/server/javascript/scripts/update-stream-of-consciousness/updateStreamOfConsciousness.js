"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStreamOfConsciousness = void 0;
const database_1 = __importDefault(require("../../database"));
const lexical_1 = require("../../lexical");
async function updateStreamOfConsciousness(updateLexicalState = false) {
    const STATE = prompt("You are about to update Stream of Consciouness' HTML (AND possibly lexical_state) - make sure to make a replica of the database if you need to. Are you sure you want to proceed (y/n)?");
    if (String(STATE).toLowerCase() !== "y") {
        process.exit(1);
    }
    const idsResp = await (0, database_1.default)().query(`SELECT lexical_state FROM stream_of_consciousness WHERE lexical_state=true ORDER BY id ASC;`);
    const ids = idsResp.rows.map((obj) => obj.id);
    console.log('MIN ID:', ids[0], 'MAX ID:', ids.at(-1));
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
            const idsResp = (await (0, database_1.default)().query(`SELECT lexical_state FROM stream_of_consciousness WHERE id=$1;`, [id])).rows[0];
            const lexical_state = idsResp.lexical_state;
            const { desktop_html, tablet_html, mobile_html, editorState } = await (0, lexical_1.parseArticleLexical)(lexical_state);
            if (updateLexicalState) {
                await (0, database_1.default)().query(`UPDATE stream_of_consciousness SET desktop_html=$1, tablet_html=$2, mobile_html=$3, lexical_state=$4 WHERE id=$5;`, [desktop_html, tablet_html, mobile_html, editorState, id]);
            }
            else {
                await (0, database_1.default)().query(`UPDATE stream_of_consciousness SET desktop_html=$1, tablet_html=$2, mobile_html=$3 WHERE id=$4;`, [desktop_html, tablet_html, mobile_html, id]);
            }
            console.log('CURR:', id);
        }
        catch (err) {
            console.log('ERROR:', id);
            console.error(err);
        }
    }
}
exports.updateStreamOfConsciousness = updateStreamOfConsciousness;
