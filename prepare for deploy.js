const fs = require("fs")
let files = fs.readdirSync(__dirname + "/public/js/")

for (let f of files) {
    console.log(f)
    let file = fs.readFileSync(__dirname + "/public/js/" + f).toString();
    let mlcomments = file.match(/\/\*[\s\S]+?\*\//g);
    let slcomments = file.match(/\/\/[\s\S]*?\n/g);
    if (mlcomments != null) {
        for (let m of mlcomments) {
            file = file.replace(m, "");
        }
    }
    if (slcomments != null) {
        for (let s of slcomments) {
            file = file.replace(s, "");
        }
    }
    
    fs.writeFileSync(__dirname + "/minified_js/" + f, file, ()=>{console.log("done!")})
}

console.log("Done! now replace the files in '/public/js' with the files in '/minified_js'")