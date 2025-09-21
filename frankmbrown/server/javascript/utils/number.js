"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumberAttribute = exports.isValidFloat = exports.isValidInteger = void 0;
function isValidInteger(n) {
    return Boolean(typeof n === 'number' && n % 1 === 0 && isFinite(n) && !!!isNaN(n));
}
exports.isValidInteger = isValidInteger;
function isValidFloat(n) {
    return Boolean(typeof n === 'number' && isFinite(n) && !!!isNaN(n));
}
exports.isValidFloat = isValidFloat;
function formatNumberAttribute(n) {
    var num = n;
    if (typeof num === "string")
        num = Number(n);
    if (num > 1000000)
        return (num / 1000000).toFixed(1).concat('M');
    else if (num > 1000)
        return (num / 1000).toFixed(1).concat('k');
    else
        return num.toLocaleString('en-US');
}
exports.formatNumberAttribute = formatNumberAttribute;
