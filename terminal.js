const fs = require("fs");
const validCommand = '#aeae34';
const invalidCommand = '#ae3434';
const argumentname = '#989898';
const value = '#13a300';
const path = '#5aeee0';

module.exports = {
    currentpath: ["C","Users","Documents"],
    _syntax: function (input) {
        let tokens = input.split(" ");
        console.log(tokens)
        let validCommands = ["cd", "chdir", "say", "echo", "print", "clear", "cls", "cmd", "ls"]
        let command = tokens.shift();
        if (validCommands.includes(command)) {
            command = `<span style="color: ${validCommand} !important;">${command}</span>`
        } else {
            command = `<span style="color: ${invalidCommand} !important;">${command}</span>`
        }

        if (tokens.length > 0) {
            let full = tokens.join(" ");
            let argnames = full.match(/-{1,2}\w+/g);
            let argvals = full.match(/(?<==)"[\s\S]+?"/g) 
            let argvals2 = full.match(/(?<==)[^"]+?(?=\b)/g)
            
            console.log("an", argnames)
            console.log("av", argvals)
            console.log("av2", argvals2)
            if (argnames) {
                for (let a of argnames) {
                    full = full.replaceAll(a, "\0\3\1" + a + "\2")
                }
            }
            
            
            if (argvals) {
                if (argvals2) {
                    argvals = argvals.concat(argvals2)
                }
            } else {
                argvals = argvals2;
            }
            if (argvals) {
                for (a of argvals) {
                    full = full.replaceAll(a, "\0\4\1" + a + "\2")
                }
            }
            
            full = full
                .replaceAll("\0", '<span style="color: ')
                .replaceAll("\1", ' !important;">')
                .replaceAll("\2", '</span>')
                .replaceAll("\3", argumentname)
                .replaceAll("\4", value)

            return `${command} ${full}` 
        }
        return command
        
    },
    help: function(cmd, fp, id) {
        if(!cmd) return {
            res: "Nope..",
            fp: fp,
            id: id
        }
    },
    cd: function (cmd, fp, id) {
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
        let path = [...this.currentpath];
        
        console.log(path)
        let drive = path.shift();
        console.log(path)
        path = `${drive}:/${path.join("/")}`
        
        console.log(path)
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