import { getElement } from "./util.js";

let textareafocus = false;
/**
 * @file startmenu.js
 * @author Smittel
 */

/**
 * 
 * @description Contains functionality related to the start menu
 * @module Startmenu
 * @exports searchAreaHandler
 */
/**
 * Toggles visibility for the search bar
 * @function
 * @listens click
 * @param {event} event 
 * @memberof module:Startmenu
 */
function searchAreaHandler(event) {
	if (!textareafocus) {
		if (searchbar.classList.contains("hiddensearch")) {
			searchbar.classList.remove("hiddensearch")
			searchbar.focus();
			textareafocus = true;
		} else {
			searchbar.classList.add("hiddensearch")
			textareafocus = false;
		}
	}
}

/**
 * creates the bottom row of the start menu containing either frequently or recently used apps, havent decided yet
 * @function
 * @memberof module:Startmenu
 * @todo Have the function actually populate the bottom row instead of creating dummy elements
 */
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

export {searchAreaHandler, startmenuBottom}