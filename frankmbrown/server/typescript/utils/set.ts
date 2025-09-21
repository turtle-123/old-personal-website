/**
 * Membership test for typescript
 * @param item 
 * @param set 
 * @returns 
 */
export function isMemberOf<Type>(item:any,set:Set<Type>): item is Type {
  return set.has(item);
}
export function addItemsToSet<T>(arr:T[],set:Set<T>) {
  for (let el of arr) {
    set.add(el);
  }
}