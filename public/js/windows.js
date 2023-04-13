import * as Util from "./util.js";
import { errorMessage } from "./errormessage.js";
import { dragElement } from "./dragging.js";
import { login } from "./auth.js";

/**
 * @file windows.js
 * @author Smittel
 * @name Windows
 * @module Windows
 */

let activewindow = undefined;
let windows = [];

// dragElement(Util.getElement("window0"));
const taskbarContextMenuElements = [
	{type: "button", text: "Minimise", handler: minimiseCtxTb},
	{type: "button", text: "Maximise", handler: maximiseCtxTb},
	{type: "divider"},
	{type: "button", text: "Close", handler: closeCtxTb}
]

/**
 * Creates a window with the given properties. Can be called on the clientside (not recommended) or via a server request.
 * Pushes the window to the array. It is important, that it receives the length of said array to correctly assign the IDs, which is why the Window class itself is not exported. 
 * @function addWindow
 * @see Window
 * @name addWindow
 * @param {object} args <code>{<br>
 * &emsp;title: Title of the window,<br>
 * &emsp;html: full html including styling information. No head, no body tag, just the innerHTML of the "div",<br>
 * &emsp;js: Javascript code that is associated with the window. Optional. Will be removed when window is closed. Avoid intervals.,<br>
 * &emsp;icon: The icon that will be shown in the taskbar,<br>
 * &emsp;windowClass: Identify the type of window.<br>
 * &emsp;((sub: Specific property of windowClass settingswindow, can potentially be used for other purposes. Used to identify the subscreen of the window, in the case of the settings it identifies the selected category)),<br>
 * &emsp;((subhtml: when using subscreens, this is where the html goes. More information: see "Window")),<br>
 * }</code>
 */
function addWindow(args) {
	const w = new Window(windows.length, args);
	windows.push(w);
}

/**
 * @class module:Windows.Window
 * @memberof Windows
 * @name Window
 * @param {int} id The id of the Window. Please use the addWindow() function.
 * @param {object} args Same thing, please use addWindow() and refer to its documentation.
 * @description You can look at the "settings.html" in the root folder of the project to get a rough idea of how its done. In general, its best to start with the style information. Write it as if you would write an actual website, only do not use &lt;head&gt;, &lt;body&gt; etc. You can and should include &lt;style&gt; Information. When using subpages, its recommended that you dynamically change the window body or the relevant parts with JS, the windowClass settingswindow does have subpages, but it can lead to problems.
 */
class Window {
	/**
	 * Holds the script tag associated with the window
	 * @member {DOMElement} javascript
	 * @inner
	 * @name javascript
	 * @access private
	 */
	#javascript;
	windowObject;
	id = -1;
	windowbody;
	taskbarIcon;
	
	constructor (id, args) {
		this.windowObject = document.createElement("div");
		this.windowbody = document.createElement("div");
		// console.log(this.windowObject);
		const main = Util.getElement("bodydiv");
		this.id = id;
		this.windowObject.classList.add(args.windowClass, "window")
		
		this.windowObject.id = `window${id}`;
		this.windowObject.dataset.minimised = "false";
		this.windowObject.dataset.id = id;
		this.windowObject.dataset.active = "true";
		
		// For maximising windows and restoring their old size and position;
		this.windowObject.dataset.oldTop = "0px";
		this.windowObject.dataset.oldLeft = "0px";
		this.windowObject.dataset.oldWidth = "100%";
		this.windowObject.dataset.oldHeight = "100%";
		this.windowObject.dataset.maximised = "false";
		
		// Generate Window header, contains window title, does NOT contain the control buttons, the eventListeners interfered
		const windowHeader = makeWindowHeader(id, args.title);
		
		// the outer div for the minimise, maximise, close button
		const windowControls = makeWindowControls(id);
		
		
		this.taskbarIcon = makeTaskBarIcon(id, args.icon);
		
		Util.getElement("taskbar").appendChild(this.taskbarIcon);
		
		const contextmenu = Util.makeContextMenuTaskbar(taskbarContextMenuElements, id);
			
		this.taskbarIcon.appendChild(contextmenu);
		
		this.taskbarIcon.addEventListener("contextmenu", (event) => {
			event.preventDefault(); 
			const ctx = Util.getElement(`ctx-menu-tb${event.target.dataset.id}`);
			ctx.dataset.hidden = (ctx.dataset.hidden == "false");
			return false;
		});
		
		
		windowControls.append(...windowControlButtons(windows))
		this.windowObject.appendChild(windowControls);
		this.windowObject.appendChild(windowHeader);
		
		this.windowbody.classList.add("windowbody");
		this.windowbody.innerHTML = args.html;
		
		if (args.type == "website") {
			let iframe = document.createElement("iframe");
			iframe.classList.add("iframe");
			iframe.src = args.url;
			this.windowbody.appendChild(iframe);
		}
		
		this.windowObject.appendChild(this.windowbody);
		main.appendChild(this.windowObject);
		this.windowObject.addEventListener("mousedown", activeWindowChange);
		this.windowObject.style = `width: ${args.width || (window.innerWidth * 0.7)}px; height:${args.height || (window.innerHeight * 0.7)}px;`;
		activewindow = this.windowObject;
		dragElement(this.windowObject);
		refreshWindows(this.windowObject);
		
		
		if (args.windowClass=="settingswindow") {
			settingswindow(args)
		}
		
		if (args.js && args.js != "") {
			this.javascript = addScript(args.js);
		}
		
		errorMessage(this.windowbody, 0b0_00_1_000, "test1","oman", []);
		errorMessage(this.windowbody, 0b0_01_1_000, "test2","oman", []);
		errorMessage(this.windowbody, 0b0_10_1_000, "test3","oman", []);
		errorMessage(this.windowbody, 0b0_11_1_000, "test4","oman", []);
	}
	
	/**
	 * Deletes itself and removes all its associated properties. It is important that you do not just call it but instead replace the variable with the return value or set it to null manually, else it lives on in memory.
	 * @method module:Windows.Window#deleteWindow
	 * @inner
	 * @returns null
	 */
	deleteWindow() {
		if (this.#javascript != undefined) {
			this.#javascript.remove();
		}
		this.windowObject.remove();
		this.taskbarIcon.remove();
		return null;
	}
	
	setClass(classList) {
		window.classList.add(...classList);
	}
	
	windowHTML(html) {
		this.windowbody.innerHTML = html;
	}
}

function windowControlButtons(windows) {
	let b = [];
	const actions = ["minimise", "maximise", "close"];
	const handlers = [minimiseWindow, maximiseWindow, closeWindow]
	for (let i = 0; i < 3; i++) {
		b[i] = document.createElement("window-button");
		b[i].dataset.action = actions[i];
		b[i].dataset.id = windows.length;
		b[i].addEventListener("click", handlers[i]);
	}
	return b;
}

function addScript(js) {
	const script = document.createElement("script");
	script.innerHTML = js;
	script.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(script);
	return script;
}

function makeWindowControls(id) {
	const windowControls = document.createElement("div");
	windowControls.id = `window${id}controls`;
	windowControls.classList.add("windowControls");
	return windowControls;
}

function makeWindowHeader(id, title) {
	const windowHeader = document.createElement("div");
	windowHeader.id = `window${id}header`;
	windowHeader.classList.add("window-header", "unselectable");
	windowHeader.innerHTML = `<font class="window-header">${title}</font>`;
	return windowHeader;
}

function taskbarIconClicked(event) {
	event.stopPropagation()
	Util.closeStartMenu(event);
	const id = event.target.dataset.id;
	const window = Util.getElement(`window${id}`)
	if (activewindow == window) {
		window.dataset.minimised = (window.dataset.minimised == "false")
	} else {
		activewindow = window;
		refreshWindows(window);
	}
	
}

function makeTaskBarIcon(id, icon) {
	const taskbarIcon = document.createElement("div");
	taskbarIcon.classList.add("taskbar-button", "button-other");
	taskbarIcon.style = `background-image: url('/images/${icon}');`;
	taskbarIcon.id = `taskbar-icon${id}`;
	taskbarIcon.dataset.id = id;
	taskbarIcon.addEventListener("click", taskbarIconClicked);
	return taskbarIcon;
}

function settingswindow(args) {
	Util.getElement(args.selected || "settings_appearance").dataset.selected = "true";
	const pfp = Util.getElement("sidebar-pfp-top")
	pfp.style = `background-image: url(${login.profilePicture})`
	pfp.id = `sidebar-pfp-top${windows.length}`
	const user = Util.getElement("settings-username");
	user.textContent = `${login.username}#${login.handle}`
	user.id = `settings-username${windows.length}`
	const edit = Util.getElement("nickname-edit");
	edit.id = `nickname-edit${windows.length}`
	edit.value = login.nickname;
	edit.addEventListener("keydown", changeNicknameTextbox)
	// edit.addEventListener("focusout", changeNicknameTextbox)
	const warn = Util.getElement("nickname-warning");
	warn.id = `nickname-warning${windows.length}`
	const epfp = Util.getElement("sidebar-pfp-edit")
	epfp.id = `sidebar-pfp-edit${windows.length}`
	epfp.addEventListener("mouseup", editPfp)
	
	document.querySelectorAll('*[id^="settings_"]').forEach((e)=>e.id = `${e.id}${windows.length}`)
	
	const main = Util.getElement("settings-main")
	main.id = `settings-main${windows.length}`
	main.dataset.id = windows.length;
	main.innerHTML = args.subhtml;
}

function refreshWindows(active) {
	for (let i = 0; i < windows.length; i++) {
		if (windows[i] == null) continue;
		if (windows[i].windowObject == activewindow) {
			windows[i].windowObject.dataset.active = "true";
		} else if (windows[i].windowObject != null) {
			windows[i].windowObject.dataset.active = "false";
			
		}
	}
}

setInterval(() => {for (let w of windows) {
	if (w == null || 
		w.windowObject.dataset.minimised == "true" || 
		w.windowObject.classList.contains("maximised-window")) continue;
	const wh = window.innerHeight;
	const ww = window.innerWidth;
	let wmw = w.windowObject.classList.contains("settingswindow")?900:240;
	let wmh = w.windowObject.classList.contains("settingswindow")?450:40;
	
	let wdt = parseInt(w.windowObject.style.width);
	let hgt = parseInt(w.windowObject.style.height);
	
	let boundedWidth = Util.clamp(wmw, wdt, ww)
	let boundedHeight = Util.clamp(wmh, wh, hgt)
	
	w.windowObject.style.height = boundedHeight + "px"
	w.windowObject.style.width = boundedWidth + "px"
}}, 10)

function closeCtxTb (event) {
	closeWindowT(Util.getElement(`window${event.target.dataset.id}`))
}

function minimiseCtxTb (event) {
	event.stopPropagation()
	setTimeout(()=>{
	const window = Util.getElement(`window${event.target.dataset.id}`);
	window.dataset.minimised = (window.dataset.minimised == "false")
	event.target.textContent = window.dataset.minimised=="true"?"Show":"Minimise";}, 1)
}

function maximiseCtxTb (event) {
	event.stopPropagation();
	setTimeout(()=>{
	const window = Util.getElement(`window${event.target.dataset.id}`);
	maximiseWindowT(window);
	event.target.textContent = window.classList.contains("maximised-window")?"Windowed mode":"Maximise";},1);
}


function activeWindowChange(event) {
	event.stopPropagation();
	let target = event.target;
	while (!target.id.match(/^window\d$/g)) {
		target = target.parentNode;
	}
	activewindow = target;
	refreshWindows(activewindow);
	Util.closeStartMenu();	
}

function minimiseAll(event) {
	for (w of windows) {
		w.dataset.minimised = "true";
	}
}

function closeWindow(event) {
	let target = event.target;
	// console.log(target)
	while (!target.id.match(/^window\d+$/g)) {
		target = target.parentNode;
	}
	closeWindowT(target)
}

function closeWindowT(target) {
	let id = target.dataset.id;
	let toBeClosed = windows.filter((a) => {if (a==null) {return false}; return target.id == a.windowObject.id})[0];
	windows[windows.indexOf(toBeClosed)] = toBeClosed.deleteWindow();
	windows = Util.cleanup(windows);
}


function closeAllWindows() {
	for (let w of windows) {
		w = w.deleteWindow();
	}
	windows = [];
}

// Receives JS data and links it to window
// Kinda scuffed, is basically relying on the arrays for windows and dynamic scripts to be synced at all times. 
function addJS (msg, id) {
	const tag = document.createElement("script");
	tag.type = "text/javascript";
	tag.innerHTML = msg.js;
	document.getElementsByTagName("head")[0].appendChild(tag);
	dynScripts[id] = tag;
	return tag;
}

// Removing global dynamic scripts is both easier and harder than the window linked scripts
function addJSG (msg) {
	const tag = document.createElement("script");
	tag.type = "text/javascript";
	tag.innerHTML = msg.js;
	document.getElementsByTagName("head")[0].appendChild(tag);
	dynScriptsGlobal.push(tag);
}

export {activewindow, taskbarContextMenuElements, addWindow, refreshWindows, closeAllWindows}


// addWindow({"title": "ooer.ooo", "type": "website", "url": "https://ooer.ooo"})
// addWindow({"title": "test2"})
// addWindow({"title": "test3"})