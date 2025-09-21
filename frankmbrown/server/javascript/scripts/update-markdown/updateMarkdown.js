"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarkdown = void 0;
const database_1 = __importDefault(require("../../database"));
const markdown_1 = require("../../ROUTER/functions/markdown");
async function updateMarkdown() {
    const idsResp = await (0, database_1.default)().query(`SELECT id FROM markdown_notes WHERE published=true ORDER BY int_id ASC;`);
    const ids = idsResp.rows.map((obj) => obj.id);
    console.log('MIN ID:', ids[0], 'MAX ID:', ids.at(-1));
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
            const markdownNoteRow = (await (0, database_1.default)().query(`SELECT markdown, design_system, breaks, gfm, pedantic FROM markdown_notes WHERE id=$1;`, [id])).rows[0];
            const { markdown, design_system, breaks, gfm, pedantic } = markdownNoteRow;
            const html = await (0, markdown_1.parseMarkdown)(markdown, { design_system, breaks, gfm, pedantic });
            await (0, database_1.default)().query(`UPDATE markdown_notes SET html=$1 WHERE id=$2;`, [html, id]);
            console.log('CURR:', id);
        }
        catch (err) {
            console.log('ERROR:', id);
            console.error(err);
        }
    }
}
exports.updateMarkdown = updateMarkdown;
