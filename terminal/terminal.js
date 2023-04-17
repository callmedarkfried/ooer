

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
    function syntax(input) {
        
        let tokens = input.split(" ");
        let validCommands = ["cd", "chdir", "say", "echo", "print", "clear", "cls", "cmd", "ls"]
        let command = tokens.shift();
        if (validCommands.includes(command)) {
            command = `<span class="valid-command">${command}</span>`
        } else {
            command = `<span class="invalid-command">${command}</span>`
        }
        if (tokens.length > 0) {
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i].match(/^--/g)) {
                    tokens[i] = `<span class="argument">${tokens[i]}</span>`
                }
            }
            return `${command} ${tokens.join(" ")||""}` 
        }
        
        return `${command}` 
        
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