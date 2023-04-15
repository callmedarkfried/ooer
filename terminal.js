module.exports = {
    help: function(cmd, fp, id) {
        if(!cmd) return {
            res: "Theres only nav",
            fp: fp,
            id: id
        }
    },
    nav: function (cmd, fp, id) {
        console.log(cmd)
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
        let newpath = currPath;
        while (path.length > 0) {
            switch (path[0]) {
                case "<":
                    newpath.pop();
                    break;
                default:
                    newpath.push(path[0]);
            }
            path.shift();
        }
        return {
            res: "",
            fp: `C>${newpath.join("/")}`,
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
    }
}