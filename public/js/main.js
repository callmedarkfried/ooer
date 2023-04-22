import * as Clock from "./clock.js";
import { dragElement } from "./dragging.js";
import * as WindowManagement from "./windows.js";
import * as Util from "./util.js"
import { notification } from "./notification.js";
import { errorMessage } from "./errormessage.js";
import * as Login from "./login.js"
import * as StartMenu from "./startmenu.js"
import * as DesktopSymbol from "./desktopSymbols.js"
import * as Widget from "./widgets.js"
import * as Handler from "./handlermodule.js"
import * as Setup from "./setup.js"
/**
 * @file main.js
 * @author Smittel
 * @name Main
 * @namespace Main
 */


Setup.setupSidebarLeft()

const clientTick = setInterval(Util.tick, 1000); // Timing might not be entirely accurate in my tests, doesnt have to be tho.
// Make the DIV element draggable:
dragElement(Util.getElement("widget-notes"));
dragElement(Util.getElement("widget-friends"));
dragElement(Util.getElement("calendar-widget"));


// Temporarily disabled
// Will be uncommented once the custom context menus are a thing
// document.addEventListener('contextmenu', event => event.preventDefault());


Util.getElement("toggle-notes").addEventListener("click", Widget.toggleWidget);
Util.getElement("toggle-friends").addEventListener("click", Widget.toggleWidget);

Util.getElement("snapping-prev").addEventListener("click", Util.closeStartMenu)
Util.getElement("desktop-clock-container").addEventListener("mousedown", Util.closeStartMenu)
Util.getElement("widget-body-notes").addEventListener("mousedown", Util.closeStartMenu)
Util.getElement("widget-body-friends").addEventListener("mousedown", Util.closeStartMenu)
Clock.initCalendar();

Util.getElement("taskbar-search").addEventListener("mouseup", StartMenu.searchAreaHandler);
Util.getElement("searchbar").addEventListener("focusout", Util.closeSearchBox);
Util.getElement("taskbar-home").addEventListener("mouseup", openStartMenu);

// Util.getElement("sidebar-left-opener").addEventListener("click", Handler.toggleSidebarLeft)
// Util.getElement("close-sidebar-left").addEventListener("click", Handler.toggleSidebarLeft)
Util.getElement("sidebar-right-opener").addEventListener("click", Handler.toggleSidebarRight)
Util.getElement("close-sidebar-right").addEventListener("click", Handler.toggleSidebarRight)
/**
 * A fairly fast interval. Prevents widgets from being moved off-screen.
 * In theory you could still get them back by zooming out but thats a usability nightmare 
 * So I just prevent that from happening. You can remove it if you want.<br>
 * (anonymous)
 * @name Widget_Interval
 * @memberof Main
 */
setInterval(() => {
	// More flexible than before, also not as big
	// Am not sure if this is the best way to do it. But its the least complicated one
	// the alternative involved like a dozen event listeners, maybe later
	
	const widgets = document.getElementsByTagName("desktop-widget");
	const wh = window.innerHeight;
	const ww = window.innerWidth;
	
	for (let w of widgets) {
		let height = parseInt(w.style.height);
		let width  = parseInt(w.style.width);
		let top    = parseInt(w.style.top);
		let left   = parseInt(w.style.left);
		
		let minheight = 360;
		
		if (w.dataset.small == "true") {
			minheight = 36;
			height = 36;
		}
		
		w.style.top  = Util.clamp(0, top,  wh - height) + "px";
		w.style.left = Util.clamp(0, left, ww - width) + "px"
		w.style.height = Util.clamp(minheight, height, wh * 0.9) + "px";
		w.style.width  = Util.clamp(240, width, ww * 0.5) + "px";
	}
	
	
}, 100);

socket.on("connection", (msg) => {console.log("reconnect")})
Login.addLoginButton();
StartMenu.startmenuBottom();
// SOCKET LISTENERS
socket.on("logout_confirm", Login.logoutHandle);
socket.on("wrong_pw", Login.wrongPW)
socket.on("heartbeat", Util.resetHeartbeat);
socket.on("init", Login.initialise);
/**
 * Listens for push notifications
 * @listens notification Server push notifications
 * @ignore
 * @memberof Main
 */
socket.on("notification", notification);
/**
 * This will probably be removed again, since it doesnt really add anything
 * @memberof Main
 * @ignore
 * @listens desktop_symbols Server provides the desktop symbols and their placement
 */
socket.on("desktop_symbols", DesktopSymbol.setupDesktopSymbols); // Why did i do this?
/**
 * Server response when user requests a window
 * @memberof Main
 * @ignore
 * @listens add_window The window data including scripts, html, styling etc.
 */
socket.on("add_window", WindowManagement.addWindow);
/**
 * The specific settings categories are served separately, will probably be changed at some point.
 * @memberof Main
 * @ignore
 * @listens sub_settings The HTML, styling, scripts for a settings category
 */
socket.on("sub_settings", (msg) => {
	Util.getElement(`settings-main${msg.id}`).innerHTML = msg.html
});
// I dont think those will be added back anytime soon
// socket.on("add_dynscript", addJS); // Dynamic scripts
// socket.on("add_dynscript_g", addJSG); // same but global
/**
 * Triggered by keydown event in terminal textbox
 * @param {HTMLDivElement} elmnt 
 */
function terminalKeyDownEvent(elmnt) {
	console.log()
}