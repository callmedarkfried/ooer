/**
 * 
 * @file dragging.js
 *
 * @author W3Schools, minor changes by Smittel
 */
/**
 * @module Dragging
 * 
 * @description Disclaimer: Yes i know its not technically allowed. But its just the best thing i found that did it.
 * I imagine theres not many ways to do it vastly differently and i had to alter it slightly to make it
 * work for my purposes beyond just switching around some names. {@link https://www.w3schools.com/howto/howto_js_draggable.asp}
 */
import { closeStartMenu, getElement, clamp } from "./util.js";

/**
 * Adds the necessary event handlers to a div to allow it to be dragged around.
 * If the container div does not have a child div with the id of the parent with "header" appended to it, it can be dragged from everywhere inside the div, if the header is present, only the header will trigger the event
 * @memberof module:Dragging
 * @param {DOMElement:div} elmnt The element to add the dragging function to
 */
function dragElement(elmnt) {
	
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (getElement(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    getElement(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
	  closeStartMenu();
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
	  let target = e.target;
	  
	  
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
	// let viewportHeight = window.innerHeight;
// let viewportWidth = window.innerWidth;
	
  // Prevent from being moved off screen
  elmnt.style.top  = clamp(0, (elmnt.offsetTop - pos2),  window.innerHeight - parseInt(elmnt.style.height)) + "px";
  elmnt.style.left = clamp(0, (elmnt.offsetLeft - pos1), window.innerWidth  - parseInt(elmnt.style.width)) + "px";
	
	// Window Snapping
	if (elmnt.dataset.maximised == "true" && elmnt.id.match(/^window\d+$/g)) {
		maximiseWindowT(elmnt);
	}

	if (parseInt(elmnt.style.top) < 1 && elmnt.dataset.maximised != "true" && elmnt.id.match(/^window\d+$/g)) {
	  document.getElementById("snapping-prev").classList.remove("snapping-preview-full-hidden") 
	} else  {
		document.getElementById("snapping-prev").classList.add("snapping-preview-full-hidden")
	}
	
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
	if (parseInt(elmnt.style.top) < 1 && !elmnt.maximised  && elmnt.id.match(/^window\d+$/g)) {
		
		maximiseWindowT(elmnt);
	}
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export {dragElement}