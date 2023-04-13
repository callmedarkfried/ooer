
import { errorMessage } from "./errormessage.js";
import { clockTick } from "./clock.js";
/**
 * @file Contains some useful functions to be used elsewhere
 * @author Smittel (https://github.com/callmedarkfried)
 * @name Utilities
 * @module Utilities
 */



/**
 * Similar to python, different syntax
 * @name range
 * @function
 * @param {number} x The range of the final Array
 * @returns {Array} An array of the next n numbers starting from the first number
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
 * @name to 
 * @function
 * @param {int} x 
 * @returns {Array} - Array containing the numbers from a to b
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
 * @param {event} event 
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

/**
 * Data Object: {text: string, type: "divider"|"button", handler: function}
 * @function
 * @param {Array<Object>} data Array of DOM Elements 
 * @param {number} id 
 * @returns {DOMElement} The finished context menu
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


/**
 * Removes trailing null elements from array
 * @example: cleanup([0, null, 3, 6, null, null]) -> [0, null, 3, 6]
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

export { connLostReset, tick, resetHeartbeat, getElement, cleanup, calculateGrid,
clamp, makeContextMenuTaskbar, makeSubMenuElement, makeButton, closeStartMenu, closeSearchBox }