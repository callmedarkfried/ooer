const fs = require("fs");
module.exports = {
    currentpath: ["C","Users","julian","Documents"],
    _syntax: function syntax(input) {
        console.log(input)
        let tokens = input.split(" ");
        let validCommands = ["cd", "chdir", "say", "echo", "print", "clear", "cls", "cmd", "ls"]
        let command = tokens.shift();
        if (validCommands.includes(command)) {
            command = `<span class="valid-command">${command}</span>`
        } else {
            command = `<span class="invalid-command">${command}</span>`
        }
        if (tokens.length > 0) {
            return `${command} ${tokens.join(" ")||""}` 
        }
        
        return `${command}` 
        
    },
    help: function(cmd, fp, id) {
        if(!cmd) return {
            res: "Nope..",
            fp: fp,
            id: id
        }
    },
    ch: function (cmd, fp, id) {
        if(cmd.length==1) {
            return {
                res: fp,
                id: id,
                fp: fp
            }
        }
        let nope = cmd.shift();
        let path = cmd.join(" ").split("/").filter(n => n)
        let currPath = fp.split(">")[1].split("/")
        let drive = fp.split(">")[0];
        let newpath = currPath;
        if (path[0].match(/^\w>/g)) {
            let drive = path.shift().split(">");
            this.currentpath = [...drive, ...path]
            return {
                res: "",
                fp: `${drive[0]}>${[drive[1], ...path].join("/")}`,
                id: id
            }
        }
        while (path.length > 0) {
            if (path[0].match(/^\.{2,}$/g)) {
                for (let i = 0; i < path[0].length-1; i++) {
                    newpath.pop();
                }
            } else {
                newpath.push(path[0]);
            }
            path.shift();
        }
        return {
            res: "",
            fp: `${drive}>${newpath.join("/")}`,
            id: id
        }
    },
    echo: function(cmd, fp, id) {
        let nope = cmd.shift()
        return {
            res: cmd.join(" "),
            fp: fp,
            id: id
        }
    },
    clear: function (cmd, fp, id) {
        return {
            res: "\e",
            fp: fp,
            id: id
        }
    },
    ls: function(cmd, fp, id) {
        console.log(this.currentpath)
        let path = [...this.currentpath];
        let drive = path.shift();
        path = `${drive}:/${path.join("/")}`
        let files = fs.readdirSync(path);
        let fr = [];
        let res = "";
        for (let f of files) {
            res += `${f}<br>`
            fr.push(fs.lstatSync(path + "/" + f));
            fr[fr.length-1].isFile = fs.statSync(path + "/" + f).isFile();
            fr[fr.length-1].name = f;
        }
        let folders = fr.filter((a) => !a.isFile)
        console.log("fp", fp)
        return {
            res: res,
            fp: fp,
            id: id
        }
    }
}