"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTest = void 0;
const env_1 = __importDefault(require("../../utils/env"));
async function runTest(req) {
    const main_colors = [
        "black",
        "silver",
        "gray",
        "white",
        "maroon",
        "red",
        "purple",
        "fuchsia",
        "green",
        "lime",
        "olive",
        "yellow",
        "navy",
        "blue",
        "teal",
        "aqua"
    ];
    const extended_colors = [
        "aliceblue",
        "antiquewhite",
        "aqua",
        "aquamarine",
        "azure",
        "beige",
        "bisque",
        "black",
        "blanchedalmond",
        "blue",
        "blueviolet",
        "brown",
        "burlywood",
        "cadetblue",
        "chartreuse",
        "chocolate",
        "coral",
        "cornflowerblue",
        "cornsilk",
        "crimson",
        "cyan",
        "darkblue",
        "darkcyan",
        "darkgoldenrod",
        "darkgray",
        "darkgreen",
        "darkgrey",
        "darkkhaki",
        "darkmagenta",
        "darkolivegreen",
        "darkorange",
        "darkorchid",
        "darkred",
        "darksalmon",
        "darkseagreen",
        "darkslateblue",
        "darkslategray",
        "darkslategrey",
        "darkturquoise",
        "darkviolet",
        "deeppink",
        "deepskyblue",
        "dimgray",
        "dimgrey",
        "dodgerblue",
        "firebrick",
        "floralwhite",
        "forestgreen",
        "fuchsia",
        "gainsboro",
        "ghostwhite",
        "gold",
        "goldenrod",
        "gray",
        "green",
        "greenyellow",
        "grey",
        "honeydew",
        "hotpink",
        "indianred",
        "indigo",
        "ivory",
        "khaki",
        "lavender",
        "lavenderblush",
        "lawngreen",
        "lemonchiffon",
        "lightblue",
        "lightcoral",
        "lightcyan",
        "lightgoldenrodyellow",
        "lightgray",
        "lightgreen",
        "lightgrey",
        "lightpink",
        "lightsalmon",
        "lightseagreen",
        "lightskyblue",
        "lightslategray",
        "lightslategrey",
        "lightsteelblue",
        "lightyellow",
        "lime",
        "limegreen",
        "linen",
        "magenta",
        "maroon",
        "mediumaquamarine",
        "mediumblue",
        "mediumorchid",
        "mediumpurple",
        "mediumseagreen",
        "mediumslateblue",
        "mediumspringgreen",
        "mediumturquoise",
        "mediumvioletred",
        "midnightblue",
        "mintcream",
        "mistyrose",
        "moccasin",
        "navajowhite",
        "navy",
        "oldlace",
        "olive",
        "olivedrab",
        "orange",
        "orangered",
        "orchid",
        "palegoldenrod",
        "palegreen",
        "paleturquoise",
        "palevioletred",
        "papayawhip",
        "peachpuff",
        "peru",
        "pink",
        "plum",
        "powderblue",
        "purple",
        "red",
        "rosybrown",
        "royalblue",
        "saddlebrown",
        "salmon",
        "sandybrown",
        "seagreen",
        "seashell",
        "sienna",
        "silver",
        "skyblue",
        "slateblue",
        "slategray",
        "slategrey",
        "snow",
        "springgreen",
        "steelblue",
        "tan",
        "teal",
        "thistle",
        "tomato",
        "turquoise",
        "violet",
        "wheat",
        "white",
        "whitesmoke",
        "yellow",
        "yellowgreen"
    ];
    const colors = main_colors.concat(extended_colors);
    const styles = [
        "none",
        "hidden",
        "dotted",
        "dashed",
        "solid",
        "double",
        "groove",
        "ridge",
        "inset",
        "outset"
    ];
    var s = '';
    const borderRadius = [];
    for (let i = 0; i < 4; i++) {
        const randomWidth = Math.max(Math.ceil(Math.random() * 5), 2);
        const borderRadiusOne = Math.max(Math.ceil(Math.random() * 5), 2);
        borderRadius.push(borderRadiusOne);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        if (i === 0) {
            s += `border-top: ${randomWidth}px ${randomStyle} ${randomColor}; `;
        }
        else if (i === 1) {
            s += `border-right: ${randomWidth}px ${randomStyle} ${randomColor}; `;
        }
        else if (i === 2) {
            s += `border-bottom: ${randomWidth}px ${randomStyle} ${randomColor}; `;
        }
        else if (i === 3) {
            s += `border-left: ${randomWidth}px ${randomStyle} ${randomColor}; `;
            s += `border-radius: ${borderRadius.map((s) => `${s}px`).join(' ')};`;
        }
    }
    const str = `&lt;div class="mt-2" style="padding: 3px; ${s}"&gt;
  <br>
  &lt;/div&gt;`;
    return str;
}
exports.runTest = runTest;
const OPEN_ROUTER_KEY = env_1.default.OPEN_ROUTER_KEY;
if (!!!OPEN_ROUTER_KEY)
    throw new Error("Unable to get OPEN_ROUTER_KEY from env.");
const CHAT_COMPLETION_URL = "https://openrouter.ai/api/v1/chat/completions";
const GET_CHAT_COMPLETION_BODY = (model, max_tokens, temperature, messages, controller) => {
    return {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPEN_ROUTER_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens,
            temperature,
            stream: true
        }),
        signal: controller.signal
    };
};
const AI_WRITER_SYSTEM = { role: "system", content: "You are a writing assistant whose job it is to add more content to an article, blog post, or notes given some CONTEXT. You should write using github-flavored-markdown." };
const AI_CODING_SYSTEM = { role: "system", content: "You are a writing assistant whose job it is to add more content to an article, blog post, or notes given some CONTEXT. You should write using github-flavored-markdown." };
