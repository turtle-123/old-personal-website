const fs=require('fs');
fs.promises.readdir((`C:\\Users\\fmb20\\Desktop\\CODE\\personal-website-project\\functionality\\src\\js\\lexical-folder`))
.then((files) => {
  files.forEach((file)=>console.log(`'./${file}'`));
})