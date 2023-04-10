import { closeStartMenu } from "./util.js";
function dragElement(elmnt) {
	
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
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
	
	
    elmnt.style.top = Math.min(Math.max((elmnt.offsetTop - pos2), 0), window.innerHeight - parseInt(elmnt.style.height)) + "px";
    elmnt.style.left = Math.min(Math.max((elmnt.offsetLeft - pos1), 0), window.innerWidth - parseInt(elmnt.style.width)) + "px";
	
	// Window Snapping
	
	if (elmnt.dataset.maximised == "true" && elmnt.id.match(/^window\d+$/g)) {
		maximiseWindowT(elmnt);
	}
	// console.table(elmnt.dataset);
	// console.table(elmnt.style);
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