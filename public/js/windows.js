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
 * @param {object} args 
 * @param {string} args.title Title of the window
 * @param {string} args.html full html including styling information. No head, no body tag, just the innerHTML of the "div"
 * @param {string=} args.js Javascript code that is associated with the window. Optional. Will be removed when window is closed. Avoid intervals.
 * @param {string} args.icon The icon that will be shown in the taskbar
 * @param {string=} args.width Optional default width of window
 * @param {string=} args.height Optional default height of window
 * @param {string=} args.windowClass windowClass: Identify the type of window. Dont use.
 * @param {string=} args.sub  Specific property of windowClass settingswindow, can potentially be used for other purposes. Used to identify the subscreen of the window, in the case of the settings it identifies the selected category
 * @param {string=} args.subhtml when using subscreens, this is where the html goes. More information: see "Window"
 */
function addWindow(args) {
	const w = new Window(windows.length, args);
	windows.push(w);
}

/**
 * @class
 * @memberof module:Windows
 */
class Window {
	/**
	 * Holds the script tag associated with the window
	 * @member
	 * @memberof module:Windows.Window
	 * @access private
	 */
	#javascript;
	windowObject;
	id = -1;
	windowbody;
	taskbarIcon;
	/**
	 * @constructor
	 * @param {int} id The id of the Window. Please use the addWindow() function.
	 * @param {object} args Same thing, please use addWindow() and refer to its documentation.
     * @description You can look at the "settings.html" in the root folder of the project to get a rough idea of how its done. In general, its best to start with the style information. Write it as if you would write an actual website, only do not use &lt;head&gt;, &lt;body&gt; etc. You can and should include &lt;style&gt; Information. When using subpages, its recommended that you dynamically change the window body or the relevant parts with JS, the windowClass settingswindow does have subpages, but it can lead to problems.
	 * @memberof module:Windows.Window
	 */
	constructor (id, args) {

		// Generate Window header, contains window title, does NOT contain the control buttons, the eventListeners interfered
		const windowHeader = makeWindowHeader(id, args.title);
				
		// the outer div for the minimise, maximise, close button
		const windowControls = makeWindowControls(id);
		windowControls.childNodes[0].append(...windowControlButtons(windows))
		
		this.windowbody = Util.create("div",{
			classList: ["absolute", "windowbody"],
			innerHTML: args.html
		});

		// this.windowObject.appendChild(windowControls);
		// this.windowObject.appendChild(windowHeader);

		this.windowObject = Util.create("div", {
			classList: ["fixed", args.windowClass, "window"],
			id: `window${id}`,
			dataset: {
				minimised: "false",
				id: id,
				active: "true",
				oldTop: "0px",
				oldLeft: "0px",
				oldWidth: "100%",
				oldHeight: "100%",
				maximised: "false"
			},
			childElements: [windowHeader, windowControls, this.windowbody],
			eventListener: {mousedown: activeWindowChange},
			style: {
				width: args.width || (window.innerWidth * 0.7) + "px",
				height: args.height || (window.innerHeight * 0.7) + "px"
			}
		});
		
		const main = Util.getElement("bodydiv");
		this.id = id;
		
		
		
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
		
		
		
		
		
		
		
		if (args.type == "website") {
			let iframe = document.createElement("iframe");
			iframe.classList.add("absolute", "iframe");
			iframe.src = args.url;
			this.windowbody.appendChild(iframe);
		}
		
		
		main.appendChild(this.windowObject);
		
		activewindow = this.windowObject;
		dragElement(this.windowObject);
		refreshWindows(this.windowObject);
		
		
		if (args.windowClass=="settingswindow") {
			settingswindow(args)
		}
		
		if (args.js && args.js != "") {
			this.javascript = addScript(args.js);
		}
		
	// 	errorMessage(this.windowbody, 0b0_00_1_000, "test1","oman", []);
	// 	errorMessage(this.windowbody, 0b0_01_1_000, "test2","oman", []);
	// 	errorMessage(this.windowbody, 0b0_10_1_000, "test3","oman", []);
	// 	errorMessage(this.windowbody, 0b0_11_1_000, "test4","oman", []);
	 }
	
	/**
	 * Deletes itself and removes all its associated properties. <b>It is important that you do not just call it but instead replace the variable with the return value or set it to null manually, else it lives on in memory.</b>
	 * @method
	 * @memberof module:Windows.Window
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
	
	/**
	 * Applies the given set of CSS classes referred to by their name to a window.
	 * @method 
	 * @memberof module:Windows.Window
	 * @param {string[]} classList 
	 */
	setClass(classList) {
		window.classList.add(...classList);
	}
	
	/**
	 * Sets the innerHTML of the window body to the provided HTML
	 * @param {string} html The HTML plus style of the window body
	 * @method
	 * @memberof module:Windows.Window
	 */
	windowHTML(html) {
		this.windowbody.innerHTML = html;
	}
}

/**
 * Creates and returns the buttons for minimising, maximising and closing
 * @param {Window[]} windows Required for setting the correct id
 * @returns {DOMElement:div} div element containing the buttons
 * @memberof module:Windows
 */
function windowControlButtons(windows) {
	let b = [];
	const actions = ["close", "minimise", "maximise"];
	const handlers = [closeWindow, minimiseWindow,  maximiseWindow]
	for (let i = 0; i < 3; i++) {
		b[i] = Util.create("window-button", {
			dataset: {
				action: actions[i],
				id: windows.length
			},
			eventListener: {click: handlers[i]}
		});
	}
	return b;
}

/**
 * Creates a script object that gets loaded and executed. Cannot be executed from outside this module. Not that it matters for security or anything, but it means that scripts need to come with a corresponding window and cant just be added in the background. There is ways around it, no doubt. I'll have to look into it, but this thing isnt nearly far enough into development to even get a version number so what gives.
 * @param {string} js String containing the javascript to be added
 * @memberof module:Windows
 * @returns {DOMElement:script}
 */
function addScript(js) {
	const script = document.createElement("script");
	script.innerHTML = js;
	script.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(script);
	return script;
}

/**
 * Just for readability.
 * @param {number} id 
 * @memberof module:Windows
 * @returns {DOMElement:div}
 */
function makeWindowControls(id) {
	
	const windowControls = Util.create("div", {
		id: `window${id}controls`,
		classList: ["absolute", "windowControls"]
	});
	const windowControlsOuter = Util.create("div", {
		classList: ["absolute", "windowControlsOuter"],
		childElements: [windowControls]
	})
	return windowControlsOuter;
}

/**
 * Just for readability.
 * @param {number} id 
 * @param {string} title 
 * @memberof module:Windows
 * @returns {DOMElement:div}
 */
function makeWindowHeader(id, title) {
	const windowHeader = Util.create("div", {
		id: `window${id}header`,
		classList: ["absolute", "window-header", "unselectable", "font-18"],
		innerHTML: `<font class="absolute window-header">${title}</font>`
	});
	return windowHeader;
}

/**
 * Listens for click events on taskbar icons, does one of a few things:<br>
 * If window is minimised, it un-minimises it.<br>
 * If a window is in the foreground, it minimises the window<br>
 * If the window is not in the foreground (aka the active window), it puts that window over all other windows.
 * @listens "click"
 * @memberof module:Windows
 * @param {event} event 
 */
function taskbarIconClicked(event) {
	event.stopPropagation()
	Util.closeStartMenu(event);
	const id = event.target.dataset.id;
	const window = Util.getElement(`window${id}`)
	if (activewindow == window) {
		if (window.dataset.maximised == "true") {
			window.dataset.maximised = "strue";
		} else if (window.dataset.maximised == "strue") {
			window.dataset.maximised = "true";
		}
		window.dataset.minimised = (window.dataset.minimised == "false")
	} else {
		activewindow = window;
		refreshWindows(window);
	}
	
}

/**
 * Creates a task bar icon with all necessary properties and returns it
 * @param {number} id 
 * @param {string} icon URL to icon
 * @memberof module:Windows
 * @returns {DOMElement:div}
 */
function makeTaskBarIcon(id, icon) {
	const taskbarIcon = Util.create("div", {
		classList: ["relative", "inline-block", "taskbar-button", "button-other"],
		style: `background-image: url('${icon}');`,
		id: `taskbar-icon${id}`,
		dataset: {id: id},
		eventListener: {click: taskbarIconClicked}
	});
	return taskbarIcon;
}

/**
 * Dont touch, dont use, dont be near it. Theres no reason. This just sets up the settings window. If you can use it for something else, great, but i doubt it to be quite honest.
 * @param {Object} args 
 * @memberof module:Windows
 * @method
 */
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

/**
 * Takes an instance of Window as an argument and pulls the corresponding window on screen to the foreground
 * @method
 * @memberof module:Windows
 * @param {Window} active 
 */
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

/**
 * Anonymous interval preventing windows from being moved off screen. Optional, similar to the widgets one.
 * @name SizeInterval
 * @method
 * @memberof module:Windows
 */
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


/**
 * Closes the window via the context menu
 * @memberof module:Windows
 * @param {event} event 
 * @memberof module:Windows
 * @listens click
 */
function closeCtxTb (event) {
	closeWindowT(Util.getElement(`window${event.target.dataset.id}`))
}

/**
 * Minimises the window via the context menu
 * @memberof module:Windows
 * @param {event} event 
 * @listens click
 */
function minimiseCtxTb (event) {
	event.stopPropagation()
	setTimeout(()=>{
	const window = Util.getElement(`window${event.target.dataset.id}`);
	window.dataset.minimised = (window.dataset.minimised == "false")
	event.target.textContent = window.dataset.minimised=="true"?"Show":"Minimise";}, 1)
}

/**
 * Maximises the window via the context menu
 * @param {event} event 
 * @listens click
 * @memberof module:Windows
 */
function maximiseCtxTb (event) {
	event.stopPropagation();
	setTimeout(()=>{
	const window = Util.getElement(`window${event.target.dataset.id}`);
	maximiseWindowT(window);
	event.target.textContent = window.classList.contains("maximised-window")?"Windowed mode":"Maximise";},1);
}

/**
 * Listens for clicks on windows to change the window that should be in focus
 * @memberof module:Windows
 * @listens click
 * @param {event} event 
 */
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

/**
 * Minimises all windows. Could be either keydown or mouse click, depending on how its going to be actually implemented
 * @todo Implement
 * @memberof module:Windows
 * @param {event} event
 * @listens keydown 
 */
function minimiseAll(event) {
	for (w of windows) {
		w.dataset.minimised = "true";
	}
}

/**
 * Grabs the corresponding highest relevant parent of the close button of a window and passes it to the function that actually closes it.
 * @memberof module:Windows
 * @param {event} event 
 * @listens click
 */
function closeWindow(event) {
	let target = event.target;
	// console.log(target)
	while (!target.id.match(/^window\d+$/g)) {
		target = target.parentNode;
	}
	closeWindowT(target)
}

/**
 * Closes the window and removes the object from the array
 * @memberof module:Windows
 * @param {DOMElement:div} target 
 */
function closeWindowT(target) {
	let id = target.dataset.id;
	let toBeClosed = windows.filter((a) => {if (a==null) {return false}; return target.id == a.windowObject.id})[0];
	windows[windows.indexOf(toBeClosed)] = toBeClosed.deleteWindow();
	windows = Util.cleanup(windows);
}

/**
 * Closes all windows, removes all associated script tags, resets the windows array. Called after logout. 
 */
function closeAllWindows() {
	for (let w of windows) {
		w = w.deleteWindow();
	}
	windows = [];
}

// 
//

/** 
 * Receives JS data and links it to window 
 * Kinda scuffed, is basically relying on the arrays for windows and dynamic scripts to be synced at all times. 
 * @param {object} msg 
 * @param {number} id 
 * @memberof module:Windows
 * @returns {DOMElement:script}
 * @deprecated
 */
function addJS (msg, id) {
	const tag = document.createElement("script");
	tag.type = "text/javascript";
	tag.innerHTML = msg.js;
	document.getElementsByTagName("head")[0].appendChild(tag);
	dynScripts[id] = tag;
	return tag;
}


/**
 * Receives a js script as a string and loads it into the DOM as a script tag without linking it to a window. 
 * @memberof module:Windows
 * @param {object} msg 
 * @deprecated
 */
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