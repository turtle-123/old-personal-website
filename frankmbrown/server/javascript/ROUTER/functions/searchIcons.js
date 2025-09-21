"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const html_1 = require("../html");
const database_1 = __importDefault(require("../../database"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const EJS_STRING = `
  <%if(locals.isDialog!==true || locals.noCopy){%>
    <div class="snackbar success" aria-hidden="true" data-snacktime="4000" id="copy-icon-snack">
      <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CheckCircleSharp"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
      <p class="p-md">
        SVG has been copied to clipboard!
      </p>
      <button class="icon medium" type="button" aria-label="Close Snackbar" data-close-snackbar>
        <svg focusable="false" inert viewBox="0 0 24 24" tabindex="-1" title="CloseSharp"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>
      </button>
    </div>
  <%}%>
  
  <p class="h5 bb-main text-align-left bold block w-100">
    Search Results:
  </p>
  <div style="background-color: var(--background);" class="p-md">
  <%for (let j=0;j<arr.length;j++){%>
    <%if(locals.arr[j].arr.length>=1){%>
      <div class="mt-2">
      <p class="h6 bb text-align-left fw-regular block w-100">
        <%=arr[j].title%>:
      </p>
      <div class="flex-row align-center justify-begin wrap gap-2 w-100 mt-1">
        <%for (let i = 0; i < locals.arr[j].arr.length; i++){%>
          <%if(!!!locals.noCopy){%>
            <button 
            data-snackbar 
            data-selem="<%=Boolean(locals.isDialog===true)?'#copy-svg-success-dialog':'#copy-icon-snack'%>" 
            type="button" 
            data-copy-input 
            data-input="<%=locals.arr[j].arr[i].id%>-input" 
            aria-label="<%=locals.arr[j].arr[i].title%>" 
            class="icon-text medium transparent"
            aria-haspopup="true"
            >
            <%-locals.arr[j].arr[i].svg%>
              <span><%=locals.arr[j].arr[i].title%></span>
            </button>
            <input hidden class="hidden" type="text" readonly value='<%=locals.arr[j].arr[i].svg%>' name="<%=locals.arr[j].arr[i].id%>-input" />
          <%}else{%>
            <button 
            type="button" 
            aria-label="<%=locals.arr[j].arr[i].title%>" 
            class="icon-text medium transparent"
            data-scroll
            data-to="#add-svg-spite"
            >
            <%-locals.arr[j].arr[i].svg%>
              <span><%=locals.arr[j].arr[i].title%></span>
            </button>
          <%}%>
          
        <%}%>
      </div>
    </div>
    <%}%>
  <%}%>
  </div>
`;
async function searchIcons(req, res) {
    try {
        const target = req.get('hx-target');
        var search;
        var Filled, Outlined, Rounded, Sharp, TwoTone;
        var noCopy = false;
        if (target === 'search-icons-dialog-results' || target === '#search-icons-dialog-results') {
            search = String(req.body['search-icons-input-dialog']);
            Filled = req.body['Filled-Dialog'];
            Outlined = req.body['Outlined-Dialog'];
            Rounded = req.body['Rounded-Dialog'];
            Sharp = req.body['Sharp-Dialog'];
            TwoTone = req.body['TwoTone-Dialog'];
        }
        else if (target === 'icon-results' || target === '#icon-results') {
            search = String(req.body['search-icons-input']);
            Filled = req.body['Filled'];
            Outlined = req.body['Outlined'];
            Rounded = req.body['Rounded'];
            Sharp = req.body['Sharp'];
            TwoTone = req.body['TwoTone'];
            noCopy = Boolean(req.body['no-copy'] === 'true');
        }
        if (typeof search !== 'string')
            throw new Error('Unable to get the search input.');
        if (search.length === 0)
            return res.status(200).send((0, html_1.getInfoAlert)('Please enter a search input.'));
        const INCLUDE_OBJECT = {
            Filled: Boolean(Filled),
            Outlined: Boolean(Outlined),
            Rounded: Boolean(Rounded),
            Sharp: Boolean(Sharp),
            TwoTone: Boolean(TwoTone)
        };
        if (Object.values(INCLUDE_OBJECT).filter(b => b).length === 0)
            return res.status(200).send((0, html_1.getWarningAlert)('At least one icon style must be included to complete this search.'));
        const db = (0, database_1.default)();
        var arr = [];
        search = search.slice(0, 50);
        search = search.split(' ').filter((s) => s.length >= 1).map((str) => str[0].toUpperCase().concat(str.slice(1))).join(' ');
        var QUERY = /*sql*/ `SELECT title, svg, svg_type FROM search_mui_icons WHERE 1=1`;
        if (!!!INCLUDE_OBJECT.Filled)
            QUERY += ` AND svg_type<>'Filled'`;
        if (!!!INCLUDE_OBJECT.Outlined)
            QUERY += ` AND svg_type<>'Outlined'`;
        if (!!!INCLUDE_OBJECT.Rounded)
            QUERY += ` AND svg_type<>'Rounded'`;
        if (!!!INCLUDE_OBJECT.Sharp)
            QUERY += ` AND svg_type<>'Sharp'`;
        if (!!!INCLUDE_OBJECT.TwoTone)
            QUERY += ` AND svg_type<>'TwoTone'`;
        QUERY += /*sql*/ ` ORDER BY similarity(title,$1)::real DESC LIMIT 100;`;
        const dbRes = await db.query(QUERY, [search]);
        arr = dbRes.rows;
        if (!!!arr.length)
            return res.status(200).send((0, html_1.getWarningAlert)('There were no results that matched your query.'));
        const filledArr = [];
        const outlinedArr = [];
        const roundedArr = [];
        const sharpArr = [];
        const twoToneArr = [];
        arr.forEach((obj) => {
            switch (obj.svg_type) {
                case 'Filled': {
                    filledArr.push({ ...obj, id: "id_".concat(node_crypto_1.default.randomUUID()) });
                    break;
                }
                case 'Outlined': {
                    outlinedArr.push({ ...obj, id: "id_".concat(node_crypto_1.default.randomUUID()) });
                    break;
                }
                case 'Rounded': {
                    roundedArr.push({ ...obj, id: "id_".concat(node_crypto_1.default.randomUUID()) });
                    break;
                }
                case 'Sharp': {
                    sharpArr.push({ ...obj, id: "id_".concat(node_crypto_1.default.randomUUID()) });
                    break;
                }
                case 'TwoTone': {
                    twoToneArr.push({ ...obj, id: "id_".concat(node_crypto_1.default.randomUUID()) });
                    break;
                }
                default: {
                    break;
                }
            }
        });
        const topArr = [];
        if (INCLUDE_OBJECT.Filled)
            topArr.push({ arr: filledArr, title: 'Filled' });
        if (INCLUDE_OBJECT.Outlined)
            topArr.push({ arr: outlinedArr, title: 'Outlined' });
        if (INCLUDE_OBJECT.Rounded)
            topArr.push({ arr: roundedArr, title: 'Rounded' });
        if (INCLUDE_OBJECT.Sharp)
            topArr.push({ arr: sharpArr, title: 'Sharp' });
        if (INCLUDE_OBJECT.TwoTone)
            topArr.push({ arr: twoToneArr, title: 'Two Tone' });
        const renderObj = {
            arr: topArr,
            isDialog: Boolean(target === 'search-icons-dialog-results' || target === '#search-icons-dialog-results'),
            noCopy
        };
        const sendStr = ejs_1.default.render(EJS_STRING, renderObj);
        return res.status(200).send(sendStr);
    }
    catch (error) {
        console.error(error);
        return res.status(200).send((0, html_1.getErrorAlert)('Something went wrong getting the icons for this search query. Try reloading the page.'));
    }
}
exports.default = searchIcons;
