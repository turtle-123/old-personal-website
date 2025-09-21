"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addItemsToSet = exports.isMemberOf = void 0;
/**
 * Membership test for typescript
 * @param item
 * @param set
 * @returns
 */
function isMemberOf(item, set) {
    return set.has(item);
}
exports.isMemberOf = isMemberOf;
function addItemsToSet(arr, set) {
    for (let el of arr) {
        set.add(el);
    }
}
exports.addItemsToSet = addItemsToSet;
