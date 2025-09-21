export function isValidInteger(n:any):n is number {
  return Boolean(typeof n==='number' && n % 1 === 0 && isFinite(n) && !!!isNaN(n))
}
export function isValidFloat(n:any):n is number {
  return Boolean(typeof n==='number' && isFinite(n) && !!!isNaN(n))
}
export function formatNumberAttribute(n:string|number) {
  var num  = n;
  if (typeof num==="string") num = Number(n);
  if (num > 1_000_000) return (num/1_000_000).toFixed(1).concat('M');
  else if (num > 1_000) return (num/1_000).toFixed(1).concat('k')
  else return num.toLocaleString('en-US');
}