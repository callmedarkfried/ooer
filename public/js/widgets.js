/**
 * @todo Make visible divs choosable
 * @file widgets.js
 */

/**
 * Stuff related to the widgets goes here
 * @module Widget
 */
import * as Util from "./util.js";
import { login } from "./auth.js";
import { dayMonthYearNoName, hourMinutes } from "./clock.js";
/**
 * Contains the notes made by the user. They are currently synced with the server, but the server does not save them yet. 
 * @member
 * @memberof module:Widget
 */
let noteslist = [];

/**
 * Receives an array of objects from the server after login that contains the nodes that belong to a given user and saves them in the variable
 * @param {Array<Object>} n 
 * @memberof module:Widget
 */
function setNotes(n) {
	noteslist = n;
}

/**
 * Sets up the widget to show the users notes
 * @memberof module:Widget
 */
function noteBodyInner() {
	var parent = Util.getElement("widget-body-notes");
	
	if (!noteslist) noteslist = [];
	
	parent.innerHTML = ""; //reset note body to prevent unwanted behavior
	var addNoteBody = document.createElement("div"); 	// create background div for click handler
	addNoteBody.id = "add-note-body"					// so you can click on empty space to add note
	addNoteBody.classList.add("notes-add", "no-scrollbar");
	parent.appendChild(addNoteBody);
	
	let textarea = document.createElement("textarea");	// the textarea to add notes
	textarea.id = "addnote-textfield";
	textarea.classList.add("addnote-textfield", "hidden") // starts out hidden
	
	textarea.addEventListener("focusout", (event) => {
		Util.closeStartMenu();
		Util.getElement("addnote-textfield").classList.add("hidden");
		Util.getElement("addnote-textfield").value = "";
	});
		
		
	textarea.value = "";
	textarea.addEventListener("keydown", addNoteKeyDown);
	Util.getElement("add-notes").addEventListener("mouseup", addNote)
	if (noteslist.length == 0) {
		refreshZeroNotes();
	} else {
		for (let n of noteslist) {
			// The note itself
			let note = document.createElement("div");
			note.classList.add("notes-element");
			note.id = "notes1"
			note.innerHTML = `<font class="notedate">${dayMonthYearNoName(new Date(n.d))} ${hourMinutes(new Date(n.d))}</font><br>${(n.t)}`
			
			
			const buttons = [
			{classList: ["note-controls", "delete-note"], display: "✖", handle: deleteNoteHandler},
			{classList: ["note-controls", "edit-note"], display: "✎", handle: editNoteHandler}
			]
			
			for (let b of buttons) {
				var e = document.createElement("a");
				e.classList.add(...b.classList, "unselectable");
				e.innerHTML = `<center>${b.display}<center>`;
				e.addEventListener("mouseup", b.handle);
				note.appendChild(e)
			}
			
			parent.appendChild(note);
		}
	}
	
	addNoteBody.addEventListener("click", addNote)
	parent.appendChild(textarea)	
}

/**
 * Displays a message that there are no notes if the user has no notes.
 * Shocking.
 * @memberof module:Widget
 */
function refreshZeroNotes() {
	if (noteslist.length == 0) {
		var noNotes = document.createElement("div")
		var noNotesMessage = document.createElement("div");
		noNotesMessage.classList.add("no-friends", "unselectable");
		noNotesMessage.innerHTML = "<i><center> Click here to add notes <center></i>"
		Util.getElement("add-note-body").appendChild(noNotesMessage)
	}
}



/**
 * If enter is pressed, the note is saved and sent to the server. If shift+enter is pressed, a new line is created.
 * @memberof module:Widget
 * @listens keydown
 * @param {event} event 
 */
function addNoteKeyDown (event) {
	if (event.keyCode == 13 && !event.shiftKey) {
		let noteOBJ = {"d": Date.now(), "t": document.getElementById("addnote-textfield").value.replaceAll("<", "&lt;").replaceAll(">","&gt;").trim().replaceAll(/\n/g, "<br>")}
		noteslist.push(noteOBJ);
		// This will also get some sort of session token and whatnot
		socket.emit("add_note", { user: login.id, note: noteOBJ});
		noteBodyInner();
	}
}

/**
 * Displays the text area to add notes.
 * @param {event} event 
 * @memberof module:Widget
 * @listens nothing
 */
function addNote(event) {
	let target = document.getElementById("addnote-textfield")
	Util.getElement("startmenu").classList.add("hiddenstart")
	target.classList.remove("hidden");
	target.focus()
}

/**
 * Sets up the friendslist. Wont do anything except add the "Add friends" text because friends are just not a thing yet and thats not happening anytime soon
 * @memberof module:Widget
 * @param {Array<Object>} friends 
 */
function friendslist (friends) {
	
	let friendsbody = Util.getElement("widget-body-friends");
	friendsbody.textContent = "";
	
	if (friends == undefined) {
		
		friendsbody.id = "widget-body-friends";
		friendsbody.classList.add("friendsbody", "no-scrollbar");
		
		let noFriends = document.createElement("div");
		noFriends.classList.add("no-friends", "unselectable");
		noFriends.innerHTML = "<i><center> Click here to add friends <center></i>"
		
		friendsbody.appendChild(noFriends);
	}
}


/**
 * Saves the position and size of a widget when you "minimise" it
 * @memberof module:Widget
 * @param {DOMElement} target 
 */
function widgetToggleSave(target) {
	let oldHeight = target.oldHeight;
	target.oldHeight = target.style.height;
	target.style.height = oldHeight;
	let oldWidth = target.oldWidth;
	target.oldWidth = target.style.width;
	target.style.width = oldWidth;
}

/**
 * Toggles the size of the widget from small (Only widget name is visible) to regular
 * @listens click
 * @memberof module:Widget
 * @param {event} e 
 */
function toggleWidget(e) {
	e = e.target;
	Util.getElement("startmenu").classList.add("hiddenstart")
	let target = e.parentNode;
	e.dataset.small = (e.dataset.small == "false");
	widgetToggleSave(target);
	const c = e.nextElementSibling;
	c.dataset.small = c.dataset.small == "false";
	target.dataset.small = (target.dataset.small == "false");
}

/**
 * Toggles visibility of the notes widget. 
 * @memberof module:Widget
 * @listens click
 * @param {event} event 
 * @deprecated Superseded by <code>toggleWidget(e)</code>
 * @see toggleWidget
 */
function toggleNotes(event) {
	let target = document.getElementById("widget-notes")
	widgetToggleSave(target);
	Util.getElement("notes-body").classList.toggle("hidden");
	let addNoteButton = Util.getElement("add-notes")
	if (addNoteButton != null) {
		addNoteButton.classList.toggle("hidden")
	}
	event.target.innerHTML = `<center>${target.classList.contains("smallwidget")?"▾":"▴"}</center>`;
}

/**
 * Not entirely sure why this isnt used, it was meant to be used to close and open the friends widget.
 * @listens click
 * @memberof module:Widget
 * @param {event} event 
 * @deprecated Superseded by <code>toggleWidget(e)</code>
 * @see toggleWidget
 */
function toggleFriends(event) {
	console.log(event.target);
	let target = document.getElementById("friendswidget");
	widgetToggleSave(target);
	
	document.getElementById("friendsbody").classList.toggle("hidden");
	event.target.innerHTML = `<center>${target.classList.contains("smallwidget")?"▾":"▴"}</center>`;
}


export {setNotes, noteBodyInner, friendslist, toggleWidget}