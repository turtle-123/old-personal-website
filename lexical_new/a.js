const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = 8080;

app.post("/post",async (req,res) => {
        const files = fs.promises.readdir(path.resolve(__dirname,"todo"));
        console.log(req.body);
});

app.get('*',async (req,res) => {
        var c = '';
        var sum = '';
        const [html,files] = await Promise.all([
                fs.promises.readFile(path.resolve(__dirname,"home.html"),{encoding:"utf-8"}),
                fs.promises.readdir(path.resolve(__dirname,"todo")),
        ]);
        c += html;
        for (let file of files) {
                const fileContent = fs.promises.readFile(path.resolve(__dirname,"todo",""))
        }
res.status(200).send(c);
});
app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
})