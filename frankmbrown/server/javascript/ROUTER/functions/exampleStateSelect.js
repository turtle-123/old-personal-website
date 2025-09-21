"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const string_similarity_js_1 = __importDefault(require("string-similarity-js"));
const helper_1 = require("../../utils/helper");
const STATES = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
function exampleStateSelect(req, res) {
    const STATE_INPUT = req.body['example-state-input'];
    try {
        var arr = [];
        for (let i = 0; i < STATES.length; i++) {
            const similarity = (0, string_similarity_js_1.default)(STATE_INPUT, STATES[i], 1, false);
            if (similarity < 0.5)
                continue;
            else {
                arr = (0, helper_1.somethingSort)({ state: STATES[i], similarity }, arr, (obj) => obj.similarity, false);
            }
        }
        var str = '';
        for (let obj of arr) {
            str += `<button tabindex="-1" data-combobox-option role="option" aria-selected="false" class="select-option body1" data-val="${obj.state}">${obj.state}</button>`;
        }
        return res.status(200).send(str);
    }
    catch (error) {
        return res.status(200).send('<p class="h6 t-error">Something went wrong</p>');
    }
}
exports.default = exampleStateSelect;
