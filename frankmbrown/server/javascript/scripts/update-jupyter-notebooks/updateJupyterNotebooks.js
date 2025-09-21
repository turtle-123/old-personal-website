"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJupyterNotebooks = void 0;
const database_1 = __importDefault(require("../../database"));
const jupyterNotebooks_1 = require("../../ROUTER/pages_helper/jupyterNotebooks");
async function updateJupyterNotebooks() {
    const idsResp = await (0, database_1.default)().query(`SELECT id FROM jupyter_notebooks ORDER BY int_id ASC;`);
    const ids = idsResp.rows.map((obj) => obj.id);
    console.log('MIN ID:', ids[0], 'MAX ID:', ids.at(-1));
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
            const row = (await (0, database_1.default)().query(`SELECT notebook FROM jupyter_notebooks WHERE id=$1;`, [id])).rows[0];
            const { notebook } = row;
            const { html } = await (0, jupyterNotebooks_1.jupyterNotebookToHTML)(notebook);
            await (0, database_1.default)().query(`UPDATE jupyter_notebooks SET html=$1 WHERE id=$2;`, [html, id]);
            console.log('CURR:', id);
        }
        catch (err) {
            console.log('ERROR:', id);
            console.error(err);
        }
    }
}
exports.updateJupyterNotebooks = updateJupyterNotebooks;
