
/**
 * Function returns all numbers that are in a string
 * 
 * @example
 * extractNumbersFromString('12.12345.uewhfu5782uchihdufhgiew0382932njdnweik8') // [ 12.12345, 5782, 382932, 8 ]
 * 
 * @param str string
 * @returns Number[] the numbers that are contained in the string
 */
export function extractNumbersFromString(str: string){
    const regexNumber =/\d/;
    var currentNumber = '';
    var hasPeriod = false;
    const numbers:number[] = [];
    for (let char of str){
        if (regexNumber.test(char)) currentNumber+=char;
        else if (char==='.'&&!!!hasPeriod) {currentNumber+=char; hasPeriod=true;}
        else {
            if (currentNumber!=='') {
                if (currentNumber[currentNumber.length-1]==='.') currentNumber=currentNumber.slice(0,currentNumber.length-1);
                numbers.push(Number(currentNumber));
                currentNumber='';
                hasPeriod=false;
            }
        }
    }
    if (currentNumber!=='') {
        if (currentNumber[currentNumber.length-1]==='.') currentNumber=currentNumber.slice(0,currentNumber.length-1);
        numbers.push(Number(currentNumber));
        currentNumber='';
        hasPeriod=false;
    }
    return numbers;
}

/**
 * 
 * @param {*} newElement the new element to add to the array
 * @param {any[]} arr Array should not contain some element that are objects and some that are not 
 * @param {*} valueFunction how to get the value to be compared given the element at arr[i]
 * @param {*} asc Whether to sort asc or desc, asc=true => ascending
 * @returns {any[]}
 */
export function somethingSort(newElement: any,arr: any[],valueFunction=(el: any):any=>el,asc=true) {
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
