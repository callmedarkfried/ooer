

function terminalMain() {
    let terminalinput = document.getElementById("terminal-input");
    let terminallabel = document.getElementById("terminal-label");
    let terminalcontent = document.getElementById("terminal-past");
    let terminalshow = document.getElementById("terminal-show")
    let pathelement = document.getElementById("path");
    let recentTerminalCommands = [];
    let recentIndex = -1;
    terminallabel.dataset.path = "C>Users/Documents"; //This is the filepath
    terminalinput.dataset.rand = Math.round(Math.random() * 100000000);
    terminalinput.id = terminalinput.id + terminalinput.dataset.rand;
    terminallabel.id = terminallabel.id + terminalinput.dataset.rand;
    terminalshow.id = terminalshow.id + terminalinput.dataset.rand;
    pathelement.id = pathelement.id + terminalinput.dataset.rand;
    pathelement.textContent = terminallabel.dataset.path
    terminalcontent.id = terminalcontent.id + terminalinput.dataset.rand;

    const terminalCursorStyle = document.getElementById("terminal-cursor");
    terminalCursorStyle.id = terminalCursorStyle.id + terminalinput.dataset.rand;

    /**
     * Handles the live syntax highlighting
     * @param {string} input 
     * @returns {string} color formatted input
     */
    function syntax(input) {
        const validCommand = '#aeae34';
        const invalidCommand = '#ae3434';
        const argumentname = '#989898';
        const value = '#13a300';
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
    }

    socket.on("terminal_res", ({res, fp, id}) => {
        if (id != terminalinput.dataset.rand) return;
        terminallabel.dataset.path = fp;
        let entry = document.createElement("p");
        if (res && res != "") {
            switch (res) {
                case "\e":
                    terminalcontent.textContent = "";
                    break;
                default:
                    entry.style = "line-height: 16px; margin: 0;";
                    entry.innerHTML = res;
                    terminalcontent.appendChild(entry);
            }
        }
        pathelement.textContent = terminallabel.dataset.path.replaceAll("/", "​/");
    })
    terminalinput.addEventListener("input", (event) => {
        pathelement.textContent = terminallabel.dataset.path.replaceAll("/", "​/");
        setTimeout(()=>{terminalshow.innerHTML = syntax(event.target.value)}, 20)
    }) 
    
    function updateCursorPos() {
        let pos = terminalinput.selectionStart;
        return terminalinput.value.length - pos;
    }
    function setSelectionRange(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }
    
    function setCaretToPos (input, pos) {
           setSelectionRange(input, pos, pos);
    }
    terminalinput.addEventListener("keydown", (event) => {
        if (event.key == "ArrowUp" && recentTerminalCommands.length > 0) {
            recentIndex = Math.min(recentIndex + 1, recentTerminalCommands.length-1)
            terminalinput.value = recentTerminalCommands[recentIndex] || "";
            setTimeout(() => {
                setCaretToPos(terminalinput, -1);
                updateCursorPos();
            }, 20);
            terminalshow.innerHTML = syntax(recentTerminalCommands[recentIndex] || "");
        }
        if (event.key == "ArrowDown" && recentTerminalCommands.length > 0) {
            recentIndex = Math.max(recentIndex - 1, -1)
            terminalinput.value = recentTerminalCommands[recentIndex] || ""
            setTimeout(() => {
                setCaretToPos(terminalinput, -1);
                updateCursorPos();
            }, 20);
            terminalshow.innerHTML = syntax(recentTerminalCommands[recentIndex] || "");
        }

        if(event.key == "ArrowLeft" ||event.key == "ArrowRight") {
            setTimeout(() => {
                terminalCursorStyle.innerHTML = `
                .terminal-show::after {
                    content: "_";
                    position: relative;
                    right: ${updateCursorPos()}ch;
                }`
            },20)
        }

        if (event.key == "Enter") {
            event.preventDefault();
            recentIndex = -1;
            if (terminalinput.value != "") {
                recentTerminalCommands.unshift(terminalinput.value)
            }
            socket.emit("terminal_req", {cmd: terminalinput.value, fp: terminallabel.dataset.path, id: terminalinput.dataset.rand})
            let entry = document.createElement("p");
            entry.style = "line-height: 14px; margin: 0;"
            entry.innerHTML = terminallabel.textContent + " " + syntax(terminalinput.value);
            terminalinput.value = "";
            terminalshow.textContent = "";
            terminalcontent.appendChild(entry)
        }
    })

    let terminalWindowBody = terminalinput.parentNode.parentNode;
    terminalWindowBody.addEventListener("click", (event) => {
        terminalinput.focus();
    })
}
terminalMain();