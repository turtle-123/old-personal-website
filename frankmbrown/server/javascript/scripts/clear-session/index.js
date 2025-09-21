"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../database"));
async function clearSession() {
    await (0, database_1.default)().query(`DELETE FROM session;`);
}
clearSession()
    .then(() => {
    console.log("Session Cleared");
    process.exit(0);
});
