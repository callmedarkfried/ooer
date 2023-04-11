import * as Clock from "./clock.js";
import { dragElement } from "./dragging.js";
import * as WindowManagement from "./windows.js";
import * as Util from "./util.js"
import { notification } from "./notification.js";
import { errorMessage } from "./errormessage.js";
import * as Login from "./login.js"
import * as StartMenu from "./startmenu.js"
import * as DesktopSymbol from "./desktopSymbols.js"

const bodydiv = Util.getElement("bodydiv")

const noteWidget = Util.getElement("widget-notes");
const friendsWidget = Util.getElement("widget-friends");
const searchbar = Util.getElement("searchbar");
const searchbutton = Util.getElement("taskbar-search");

const startmenu = Util.getElement("startmenu");
const startbutton = Util.getElement("taskbar-home");

const clientTick = setInterval(Util.tick, 1000); // Timing might not be entirely accurate in my tests, doesnt have to be tho.
// Make the DIV element draggable:
dragElement(Util.getElement("widget-notes"));
dragElement(Util.getElement("widget-friends"));
dragElement(Util.getElement("calendar-widget"));


// Temporarily disabled
// Will be uncommented once the custom context menus are a thing
// document.addEventListener('contextmenu', event => event.preventDefault());



Util.getElement("snapping-prev").addEventListener("click", Util.closeStartMenu)
Util.getElement("desktop-clock-container").addEventListener("mousedown", Util.closeStartMenu)
Util.getElement("widget-body-notes").addEventListener("mousedown", Util.closeStartMenu)
Util.getElement("widget-body-friends").addEventListener("mousedown", Util.closeStartMenu)
Clock.initCalendar();
searchbutton.addEventListener("mouseup", StartMenu.searchAreaHandler);
searchbar.addEventListener("focusout", Util.closeSearchBox);
startbutton.addEventListener("mouseup", openStartMenu);

setInterval(() => {
	// More flexible than before, also not as big
	// console.log(document.getElementsByTagName("desktop-widget"))
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
	
	
}, 20);


Login.addLoginButton();
Util.startmenuBottom();
// SOCKET LISTENERS
socket.on("wrong_pw", Login.wrongPW)
socket.on("heartbeat", Util.resetHeartbeat);
socket.on("init", Login.initialise);
socket.on("notification", notification); // Push notification
socket.on("desktop_symbols", DesktopSymbol.setupDesktopSymbols); // Why did i do this?
socket.on("add_window", WindowManagement.addWindow);
socket.on("sub_settings", (msg) => {
	Util.getElement(`settings-main${msg.id}`).innerHTML = msg.html
});
// I dont think those will be added back anytime soon
// socket.on("add_dynscript", addJS); // Dynamic scripts
// socket.on("add_dynscript_g", addJSG); // same but global