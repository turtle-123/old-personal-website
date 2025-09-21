/**
 * 
 * @param {*} newElement the new element to add to the array
 * @param {any[]} arr Array should not contain some element that are objects and some that are not 
 * @param {*} valueFunction how to get the value to be compared given the element at arr[i]
 * @param {*} asc Whether to sort asc or desc, asc=true => ascending
 * @returns {any[]}
 */
function somethingSort(newElement,arr,valueFunction=(el)=>el,asc=true) {
    arr.push(newElement);
    var curr = arr.length-1;
    while (curr > 0){
        if(asc){
            if (valueFunction(arr[curr])<valueFunction(arr[curr-1])) {
                let swap = structuredClone(arr[curr-1]);
                arr[curr-1] = structuredClone(arr[curr]);
                arr[curr] = swap;
            } else break;
        } else {
            if (valueFunction(arr[curr])>valueFunction(arr[curr-1])) {
                let swap = structuredClone(arr[curr-1]);
                arr[curr-1] = structuredClone(arr[curr]);
                arr[curr] = swap;
            } else break;
        }
        curr-=1;
    }
    return arr;
}

module.exports = {
    somethingSort
};