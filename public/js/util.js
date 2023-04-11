import { clockTick } from "./clock.js";
import { errorMessage } from "./errormessage.js";
/**
 * @file Contains some useful functions to be used elsewhere
 * @author Smittel (https://github.com/callmedarkfried)
 * @name Utilities
 * @namespace Utilities
 */

let noteslist = []
// it needs to grab the notes from the server via socket request.
// TO DO: log in



const dateFormat = new Intl.DateTimeFormat([], { hour: 'numeric', hour12: true }).resolvedOptions().hour12;
if (dateFormat) {
  console.log("The system is set to 12 hour format");
} else {
  console.log("The system is set to 24 hour format");
}

/**
 * @var 
 */
function closeSearchBox(event) {
	searchbar.classList.add("hiddensearch")
	searchbar.value = "";
	setTimeout(()=>{textareafocus = false;}, 200)
}

/**
 * Shorthand for generating a button with the necessary properties, returns that button
 * @function makeButton
 * @param {string} text - The button text
 * @param {boolean} filled - whether the button is highlighted or not
 * @memberof Utilities
 */
function makeButton(text, filled) {
	const benjamin = document.createElement("button");
	benjamin.dataset.filled = filled;
	benjamin.textContent = text;
	benjamin.style = "margin-inline: 3px";
	return benjamin;
}

/**
 * Generates a menu element that is supposed to go into the small desktop folders
 * @function makeSubMenuElement
 * @param {object} data - Object containing basic style and behaviour
 * @return {object}
 */
function makeSubMenuElement (data) {
	const subE = document.createElement("a");
	subE.classList.add("desktop-folder-element");
	subE.innerHTML = "<center>T</center>"; // Actual implementation wont have any innerHTML, 
										   // instead creating a picture div and a text div
										   // like the actual desktop icons (maybe just pic)
	subE.request = data.event;
	if (data.type == "internal") {
		subE.addEventListener("click", (event) => {
			event.stopPropagation();
			getElement("startmenu").classList.add("hiddenstart");
			socket.emit("request_page", {id: subE.request});
		});
	} else {
		subE.href = data.event;
	}
	return subE
}

function makeContextMenuTaskbar(data, id) {
	const menu = document.createElement("div");
	menu.dataset.hidden = true;
	menu.dataset.id = id;
	menu.id = `ctx-menu-tb${id}`
	menu.classList.add("contextmenu");
	menu.addEventListener("mouseup", (e) => e.stopPropagation());
	menu.addEventListener("click", (e) => e.stopPropagation());
	for (let d of data) {
		if (d.type == "divider") {
			const e = document.createElement("hr");
			menu.appendChild(e)
			continue;
		}
		const e = document.createElement("div");
		e.textContent = d.text;
		e.classList.add("ctx-element")
		e.dataset.id = id;
		e.addEventListener("mouseup", d.handler);
		menu.appendChild(e);
	}
	return menu;
}

/**
 * Clamps a value between a lower and an upper bound.
 * @param {number} lower - The lower bound
 * @param {number} value - The value to be clamped
 * @param {number} upper - The upper bound
 * @return {number}
 */
function clamp(lower, value, upper) {
	return Math.max(lower, Math.min(value, upper))
}

/**
 * calculateGrid calculates the most square grid for a given number n. Width and height are never off by more than 1 where only the width of the grid can ever be the bigger number.
 @param {int} n - The number of elements in a grid
 @return {Array} - The X and Y dimensions of the grid.
 */
function calculateGrid(n) {
	const x = Math.ceil(n / (Math.floor(Math.sqrt(n)) + 1));
	const y = Math.floor(Math.sqrt(n-1)) + 1;
	return [x,y]
}


function startmenuBottom() {
	
	const startmenu = getElement("startmenu");
	const smBottom = getElement("startmenu-bottom");
	smBottom.classList.add("startmenu-bottom");
	smBottom.id = "startmenu-bottom";
	const center = document.createElement("center");
	
	const bottomButtons = [
		{
			id: "sm-btm-gh",
			image: "github-full.png",
			link: "https://github.com/callmedarkfried",
			event: null
		},{
			id: "sm-btm-yt",
			image: "youtube_full.png",
			link: "https://youtube.com/smittel",
			event: null
		},
	]

	for (let c of bottomButtons) {
		let e = document.createElement("a");
		e.href = c.link;
		e.classList.add("startmenu-bottom-button");
		e.style = `background-image: url('${c.image}');`;
		e.id = c.id
		if (c.link != null) {
			e.target = "_blank"
		}
		if (c.event != null) {
			e.addEventListener("mouseup", e.event);
		}
		center.appendChild(e);
	}
	smBottom.appendChild(center);
	startmenu.appendChild(smBottom);
}




/**
 * Removes trailing null elements from array
 * Example: [0, null, 3, 6, null, null] => [0, null, 3, 6]
 * @param {Array} e - Original array
 * @return {Array} - Trimmed array
 */
function cleanup(e) {
	for (let i = e.length-1; i >= 0; i--) {
		if (e[i] == null) {
			let w = e.pop(); // Maybe theres a better way
		} else {
			return e
		}
	}
	return e;
}

/** @namespace Shorthands */

/**
 * Shorthand, saves space, saves time, shouldnt be too hard of a performance hit either, but who the fuck knows, its JS
 * @function getElement
 * @param {string} id - The id of the element to get
 * @return {object}
 * @memberof Shorthands
 */
function getElement(id) {
	return document.getElementById(id);
}
let heartbeatCounter = 0;

function resetHeartbeat() {
	heartbeatCounter = 0;
}

let connLost;

function connLostReset() {
	connLost = undefined;
}

function tick() {
	heartbeatCounter++;
	if (heartbeatCounter > 3) {
		if (connLost == undefined) {
			connLost = errorMessage(document.getElementsByTagName("body")[0], 0b1001101, "No connection", "Could not connect to server.", [(event)=>{socket.connect(); connLost = undefined;}, (event)=>{return}]);
			connLost.dataset.id = "connectionLost";
		}
	}
	clockTick();
}

function closeStartMenu (event) {
	document.querySelectorAll('*[id^="ctx-menu-tb"]').forEach((e)=>e.dataset.hidden = "true")
	document.getElementById("startmenu").classList.add("hiddenstart")
}

export { connLostReset, tick, resetHeartbeat, getElement, cleanup, startmenuBottom, calculateGrid,
clamp, makeContextMenuTaskbar, makeSubMenuElement, makeButton, closeStartMenu, closeSearchBox }