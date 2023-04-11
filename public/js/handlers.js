
let dynScripts = [];
let dynScriptsGlobal = [];

function widgetToggleSave(target) {
	let oldHeight = target.oldHeight;
	target.oldHeight = target.style.height;
	target.style.height = oldHeight;
	let oldWidth = target.oldWidth;
	target.oldWidth = target.style.width;
	target.style.width = oldWidth;
}








function toggleFriends(event) {
	console.log(event.target);
	let target = document.getElementById("friendswidget");
	widgetToggleSave(target);
	
	document.getElementById("friendsbody").classList.toggle("hidden");
	event.target.innerHTML = `<center>${target.classList.contains("smallwidget")?"▾":"▴"}</center>`;
}









function addNoteKeyDown (event) {
	if (event.keyCode == 13 && !event.shiftKey) {
		console.log(login)
		let noteOBJ = {"d": Date.now(), "t": document.getElementById("addnote-textfield").value.replaceAll("<", "&lt;").replaceAll(">","&gt;").trim().replaceAll(/\n/g, "<br>")}
		noteslist.push(noteOBJ);
		// This will also get some sort of session token and whatnot
		socket.emit("add_note", { user: login.id, note: noteOBJ});
		noteBodyInner();
	}
}

function addNote(event) {
	let target = document.getElementById("addnote-textfield")
	getElement("startmenu").classList.add("hiddenstart")
	target.classList.remove("hidden");
	target.focus()
}


// Handles opening and closing of the searchbox
// prevents rapid reopening thereof


/* Part of the textbox reopen fix.
   When clicking on the search button while the search bar is open, 
   both the focusout and the search button click events fire. without
   this delay, the searchbox would immediately reopen.
*/ 


function openStartMenu(event) {
	if (startmenu.classList.contains("hiddenstart")) {
		startmenu.classList.remove("hiddenstart")
	} else {
		startmenu.classList.add("hiddenstart")
	}
}


function deleteNoteHandler(event) {
	let target = event.target;
	while (!target.id.match(/^notes\d$/g)) {
		target = target.parentNode;
	}
	let t_parent = target.parentNode;
	let delIndex = Array.from(t_parent.childNodes).filter(el => el.id === "notes1").indexOf(target);
	
	let newNoteList = [];
	for (let i = 0; i < noteslist.length; i++) {
		if (i != delIndex) {
			newNoteList.push(noteslist[i])
		}
	}
	noteslist = newNoteList;
	socket.emit("delete_note", {user: login.id, index: delIndex});
	target.remove();
	refreshZeroNotes();
	// maybe a dialog box should be added before its deleted
}

function editNoteHandler(event) {
	alert("temporary")
}


function minimiseWindow(event) {
	let target = event.target;
	while (!target.id.match(/^window\d$/g)) {
		target = target.parentNode;
	}
	target.dataset.minimised = "true"
}

function maximiseWindow(event) {
	maximiseWindowT(event.target);
}

function desktopSymbolClicked(event) {
	const id = event.target.id.match(/\d+/g)[0]
	const parent = getElement(`desktop-symbol${id}`)
	console.log(parent.dataset)
	getElement("startmenu").classList.add("hiddenstart");
	
	if (parent.symboltype == "folder" && parent.dataset.open == "false") {
		parent.dataset.open = true;
		const darken = document.createElement("div")
		darken.classList.add("folder-bg");
		getElement("bodydiv").appendChild(darken);
		getElement(`desktop-symbol-submenu${id}`).classList.add("desktop-folder-open");
		getElement(`desktop-symbol${id}`).style["z-index"] = 10;
		darken.id = `darken${id}`
		darken.addEventListener("click", (event) => {
			closeDesktopFolder(event, getElement(`desktop-symbol${id}`));
		})
	}
}

function closeDesktopFolder(event, symbol) {
	getElement("startmenu").classList.add("hiddenstart");
	const id = event.target.id.match(/\d+/g)[0];
	getElement(`desktop-symbol-submenu${id}`).classList.remove("desktop-folder-open");
	getElement(`desktop-symbol${id}`).style["z-index"] = null;
	getElement(`desktop-symbol${id}`).dataset.open = false;
	getElement(`darken${id}`).remove()
}

function maximiseWindowT(t) {
	
	let target = t;
	let header = t;
	while (!target.id.match(/^window\d+$/g)) {
		target = target.parentNode;
		if (target.id.match(/^window\d+header$/g)) header = target;
		
	}
	let id = target.dataset.id;
	header = document.getElementById(`window${id}header`);
	let oldTop = target.dataset.oldTop;
	target.dataset.oldTop = target.style.top;
	target.style.top = oldTop;
	let oldLeft = target.dataset.oldLeft;
	target.dataset.oldLeft = target.style.left;
	target.style.left = oldLeft;
	
	let oldHeight = target.dataset.oldHeight;
	target.dataset.oldHeight = target.style.height;
	target.style.height = oldHeight;
	let oldWidth = target.dataset.oldWidth;
	target.dataset.oldWidth = target.style.width;
	target.style.width = oldWidth;
	
	// [target.oldHeight, target.style.height] = [target.style.height, target.oldHeight]
	// [target.oldWidth, target.style.width] = [target.style.width, target.oldWidth]
	
	
	target.dataset.maximised = target.dataset.maximised=="false"?"true":"false"
	target.style.transition = "all 0.05s"
		setTimeout(() => {target.style.transition = null}, 50)
	target.classList.toggle("maximised-window")
	header.classList.toggle("maximised-window")
	
	document.getElementById("snapping-prev").classList.add("snapping-preview-full-hidden")
}





function changeNicknameTextbox(event) {
	setTimeout(
	() => {
		const id = event.target.id.replaceAll("nickname-edit", "");
		const warn = document.getElementById(`nickname-warning${id}`)
		const invalid = new RegExp("[^A-Z -/:-@\[-`\{-´0-9À-ÖØ-Þßÿ]€","gi")
		let t = getElement(`nickname-edit${id}`)
		if (event.target.value.length < 2 || event.target.value.length > 32) {
			warn.classList.remove("hidden");
			warn.textContent = "Nicknames must be between 2 and 32 characters long"
			event.target.classList.add("settings-nick-red");
			return;
		} else {
			warn.classList.add("hidden");
			warn.textContent = ""
			event.target.classList.remove("settings-nick-red");
		}
		if (event.keyCode == 13) {
			
			
			
			let invalidChars = new Set(event.target.value.match(invalid));
			let arr =  Array.from(invalidChars);
			
			if (arr.length > 0) {
				arr = arr.slice(0, 4);
				warn.classList.remove("hidden");
				warn.textContent = `Invalid character: ${arr}`
				event.target.classList.add("settings-nick-red");
				return;
			}
			
			warn.classList.add("hidden");
			warn.textContent = ""
			event.target.classList.remove("settings-nick-red");
			
		}
	}, 1);
	
}

function editPfp (event) {
	alert("Imagine this being a file explorer")
}






socket.on("logout_confirm", (msg) => {
	for (w of windows) {
		closeWindowT(w);
	}
	console.log("test")
	getElement("widget-body-notes").innerHTML = `
			<div class="no-friends unselectable">
			<i><center>Please log in for notes</center></i>
			</div>`
	getElement("add-notes").remove();
	getElement("widget-body-friends").innerHTML = `<div class="no-friends unselectable"><i></i><center><i> Please login for friends</i><center><i></i></center></center></div>`
	getElement("startmenu-top").textContent = ""
	getElement("startmenu-main").textContent = ""
	getElement("startmenu-favorites").textContent = ""
	getElement("startmenu-favorites").className = "";
	addLoginButton();
})


function setupDesktopSymbols(list) {
	const symbols = list.symbols;
	
	for (let i = 0; i < symbols.length; i++) {
		const s = document.createElement("a");
		s.id = `desktop-symbol${i}`;
		s.classList.add("desktop-symbol");
		s.style.top = symbols[i].pos[0]
		s.style.left = symbols[i].pos[1];
		s.addEventListener("click", desktopSymbolClicked);
		s.symboltype = symbols[i].type;
		s.dataset.open = false;
		const icon = document.createElement("div");
		icon.id = `desktop-symbol-icon${i}`
		icon.classList.add("desktop-symbol-image");
		icon.style = `background-image: url('${symbols[i].image}')`;
		
		const name = document.createElement("div");
		name.id = `desktop-symbol-name${i}`;
		name.classList.add("desktop-symbol-text", "unselectable");
		name.textContent = symbols[i].name;
		
		s.append(icon, name);
		
		if (symbols[i].type == "link") {
			s.href = symbols[i].href;
			s.target = "_blank";
		} else if (symbols[i].type == "folder") {
			const sub = document.createElement("div");
			sub.classList.add("desktop-folder");
			sub.style = `grid-template-columns: repeat(${calculateGrid(symbols[i].sub.length)[1]},92px); grid-template-rows: repeat(${calculateGrid(symbols[i].sub.length)[0]},92px); `
			sub.id = `desktop-symbol-submenu${i}`
			for (let j = 0; j < symbols[i].sub.length; j++) {
				
				sub.appendChild(makeSubMenuElement(symbols[i].sub[j]));
			}
			
			s.appendChild(sub);
		}
		getElement("bodydiv").appendChild(s);
	}
}

socket.on("sub_settings", (msg) => {
	getElement(`settings-main${msg.id}`).innerHTML = msg.html
});

function settingsButton(e) {
	let child = Array.from(e.parentNode.childNodes).filter(el => el.nodeName != "#text")
	
	
	for (c of child) {
		c.dataset.selected = "false";
	}
	
	e.dataset.selected = "true"
	let t = e;
	while (!t.id.match(/^window\d+$/g)) {
		t = t.parentNode;
	}
	socket.emit("req_subsettings", {id: t.dataset.id, query: e.dataset.request});
}



function toggleSwitch(e) {
	e.dataset.enabled = (e.dataset.enabled == "false");
}

function toggleDropdown(e) {
	e.dataset.open = (e.dataset.open == "false");
	let child = Array.from(e.childNodes).filter((e)=>(e.nodeName == "DD-C"))[0]
	child.dataset.open = (child.dataset.open == "false");
}

function dropdownSelect(e) {
	let parent = e.parentNode;
	let grandparent = parent.parentNode;
	let siblings = Array.from(parent.childNodes).filter((e)=>(e.nodeName != "#text" && e.nodeName != "DD-H"));
	let head = Array.from(grandparent.childNodes).filter((e)=>(e.nodeName == "DD-H"))[0]
	grandparent.scrollTop = 0;
	head.textContent = e.textContent;
	siblings.forEach((e)=>{e.dataset.selected = "false"})
	e.dataset.selected = "true";
}

function toggleWidget(e) {
	getElement("startmenu").classList.add("hiddenstart")
	let target = e.parentNode;
	e.dataset.small = (e.dataset.small == "false");
	widgetToggleSave(target);
	target.dataset.small = (target.dataset.small == "false");
}


	// This basically just saves the size information of the widget so when you expand it again
	// it retains its size
	// This general approach is useful for windows too
function toggleNotes(event) {
	let target = document.getElementById("widget-notes")
	widgetToggleSave(target);
	document.getElementById("notes-body").classList.toggle("hidden");
	let addNoteButton = document.getElementById("add-notes")
	if (addNoteButton != null) {
		addNoteButton.classList.toggle("hidden")
	}
	event.target.innerHTML = `<center>${target.classList.contains("smallwidget")?"▾":"▴"}</center>`;
}

