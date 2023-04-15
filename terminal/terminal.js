
function terminalMain() {
    let terminalinput = document.getElementById("terminal-input");
    let terminallabel = document.getElementById("terminal-label");
    let terminalcontent = document.getElementById("terminal-past");
    let pathelement = document.getElementById("path");
    let recentTerminalCommands = [];
    let recentIndex = -1;
    terminallabel.dataset.path = "C>user/documents"; //This is the filepath
    terminalinput.dataset.rand = Math.round(Math.random() * 100000000);
    terminalinput.id = terminalinput.id + terminalinput.dataset.rand;
    terminallabel.id = terminallabel.id + terminalinput.dataset.rand;
    pathelement.id = pathelement.id + terminalinput.dataset.rand;
    pathelement.textContent = terminallabel.dataset.path
    terminalcontent.id = terminalcontent.id + terminalinput.dataset.rand;

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
                    entry.style = "line-height: 14px; margin: 0;";
                    entry.textContent = res;
                    terminalcontent.appendChild(entry);
            }
        }
        pathelement.textContent = terminallabel.dataset.path;
    })
    
    terminalinput.addEventListener("keydown", (event) => {

        if (event.key == "ArrowUp" && recentTerminalCommands.length > 0) {
            recentIndex = Math.min(recentIndex + 1, recentTerminalCommands.length-1)
            terminalinput.textContent = recentTerminalCommands[recentIndex] || ""
        }
        if (event.key == "ArrowDown" && recentTerminalCommands.length > 0) {
            recentIndex = Math.max(recentIndex - 1, -1)
            terminalinput.textContent = recentTerminalCommands[recentIndex] || ""
        }
        if (event.key == "Enter") {
            recentIndex = -1;
            recentTerminalCommands.unshift(terminalinput.textContent)
            event.preventDefault();
            socket.emit("terminal_req", {cmd: terminalinput.textContent, fp: terminallabel.dataset.path, id: terminalinput.dataset.rand})
            let entry = document.createElement("p");
            entry.style = "line-height: 14px; margin: 0;"
            entry.textContent = terminallabel.textContent + " " + terminalinput.textContent;
            terminalinput.textContent = "";
            terminalcontent.appendChild(entry)
        }
    })

    let terminalWindowBody = terminalinput.parentNode.parentNode;
    terminalWindowBody.addEventListener("click", (event) => {
        terminalinput.focus();
    })
}
terminalMain();