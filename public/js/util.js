
import { errorMessage } from "./errormessage.js";
import { clockTick } from "./clock.js";
/**
 * @file util.js
 * @author Smittel (https://github.com/callmedarkfried)
 * @name Utilities
 */

/**
 * Contains some useful functions to be used elsewhere
 * @module Utilities
 */

/**
 * Similar shorthand as in python, different syntax. Why i chose to do this, i dont know. But i kinda like it 
 * @name Number․prototype․range
 * @function
 * @global
 * @param {number} x The range of the final Array
 * @returns {number[]} An array of the next n numbers starting from the first number
 * @example (5).range(5) -> [5, 6, 7, 8, 9]
 * (5).range(-3) -> [5, 4, 3]
 */
Number.prototype.range = function (x) {
	let p = [];
	if (x > 0) {
		for (let  i = 0; i < x; i++) {
			p.push(i + Number(this))
		}
	} else {
		for (let  i = 0; i < Math.abs(x); i++) {
			p.push(Number(this) - i)
		}
	}
	return p;
}

/**
 * Returns an Array containing the numbers from the first to the second number.
 * @function
 * @global
 * @name Number․prototype․to
 * @param {number} x 
 * @returns {number[]} - Array containing the numbers from a to b
 * @example (5).to(10) -> [5, 6, 7, 8, 9, 10]
 */
Number.prototype.to = function (x) {
	if(typeof(x) !== 'number') throw new TypeError("Argument must be a number!");
	let p = [];
	if (this > x) {
		for (let i = this; i >= x; i--) {
			p.push(i)
		} 
	} else {
		for (let i = this; i<=x; i++) {
			p.push(i)
		}
	}
	return p;
}


const dateFormat = new Intl.DateTimeFormat([], { hour: 'numeric', hour12: true }).resolvedOptions().hour12;
if (dateFormat) {
  console.log("The system is set to 12 hour format");
} else {
  console.log("The system is set to 24 hour format");
}

/**
 * Not to be called manually. Closes the search bar when it loses focus.
 * Timeout prevents weird behaviour when closing the search bar by clicking the search button.
 * @param {FocusEvent} event 
 * @memberof module:Utilities
 */
function closeSearchBox(event) {
	const searchbar = getElement("searchbar");
	searchbar.classList.add("hiddensearch")
	searchbar.value = "";
	setTimeout(()=>{textareafocus = false;}, 200)
}

/**
 * Shorthand for generating a button with the necessary properties, returns that button
 * @function makeButton
 * @param {string} text - The button text
 * @param {boolean} filled - whether the button is highlighted or not
 * @return {HTMLButtonElement} A button
 * @memberof module:Utilities
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
 * @param {Object} data - Object containing basic style and behaviour
 * @param {string} data.image URL to image of sub menu icon
 * @param {string} data.text Name of the sub menu element
 * @param {("internal" | "external")} data.type Internal links are opened in windows, external links are opened in new tabs
 * @param {function | string} data.data If internal, its a function, if external, its a link
 * @return {HTMLAnchorElement}
 * @memberof module:Utilities
 */
function makeSubMenuElement ({type, image, text, data}) {
	const subE = document.createElement("a");
	subE.classList.add("desktop-folder-element");
	subE.innerHTML = "<center>T</center>"; // Actual implementation wont have any innerHTML, 
										   // instead creating a picture div and a text div
										   // like the actual desktop icons (maybe just pic)
	
	if (type == "internal") {
		subE.addEventListener("click", (event) => {
			event.stopPropagation();
			getElement("startmenu").classList.add("hiddenstart");
			socket.emit("request_page", {id: subE.data});
		});
	} else {
		subE.href = data;
	}
	return subE
}

/**
 * Creates a context menu for the task bar icons. Will probably be replaced by a more general function soon
 * @function
 * @param {Object[]} data 
 * @param {string} data[].text
 * @param {("divider"|"button")} data[].type 
 * @param {function} data[].handler
 * @param {number} id 
 * @returns {HTMLDivElement} The finished context menu
 * @memberof module:Utilities
 */
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
 * @memberof module:Utilities
 * @param {number} lower - The lower bound
 * @param {number} value - The value to be clamped
 * @param {number} upper - The upper bound
 * @return {number} Clamped value
 */
function clamp(lower, value, upper) {
	return Math.max(lower, Math.min(value, upper))
}

/**
 * calculateGrid calculates the most square grid for a given number n. Width and height are never off by more than 1 where only the width of the grid can ever be the bigger number.
 @param {number} n - The number of elements in a grid
 @return {number[]} - The X and Y dimensions of the grid.
 * @memberof module:Utilities
 */
function calculateGrid(n) {
	const x = Math.ceil(n / (Math.floor(Math.sqrt(n)) + 1));
	const y = Math.floor(Math.sqrt(n-1)) + 1;
	return [x,y]
}


/**
 * Removes trailing null elements from array
 * @example: cleanup([0, null, 3, 6, null, null]) -> [0, null, 3, 6]
 * @param {Window[]} e Original array
 * @return {Window[]} Trimmed array
 * @memberof module:Utilities
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
 * @return {HTMLElement}
 *
 * @memberof module:Utilities~Shorthands
 */
function getElement(id) {
	return document.getElementById(id);
}

/**
 * Gets reset regularly by server heartbeat signals.
 * @member
 * @memberof module:Utilities
 */
let heartbeatCounter = 0;

/**
 * Resets the heartbeatCounter
 * @method
 * @memberof module:Utilities
 */
function resetHeartbeat() {
	heartbeatCounter = 0;
}

/**
 * When the connection to the server is lost, this will be set to the error message to prevent multiple error messages popping up when the connection is lost.
 * @member
 * @memberof module:Utilities
 */
let connLost;

/**
 * When the user closes the lost connection textbox, <code>connLost</code> gets reset, meaning if the connection isnt reestablished, the error can pop up again. if it is reestablished, nothing will happen and operations can resume as usual (i think)
 *
 * @memberof module:Utilities
 */
function connLostReset() {
	connLost = undefined;
}

/**
 * Gets called every seconds. Increments heartbeatCounter and throws the error dialog box when the connection is lost for more than 3 seconds. It also calls the clockTick to update the time once per second.
 * @memberof module:Utilities
 */
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

/**
 * Closes the start menu when different elements are clicked. Needs to be added to most things unless theres an event that fires when somehting other than a div is clicked. "focusout" does not do the trick sadly.
 * @memberof module:Utilities
 * @listens click
 * @param {MouseEvent} event 
 */
function closeStartMenu (event) {
	document.querySelectorAll('*[id^="ctx-menu-tb"]').forEach((e)=>e.dataset.hidden = "true")
	document.getElementById("startmenu").classList.add("hiddenstart")
}

export { connLostReset, tick, resetHeartbeat, getElement, cleanup, calculateGrid,
clamp, makeContextMenuTaskbar, makeSubMenuElement, makeButton, closeStartMenu, closeSearchBox }