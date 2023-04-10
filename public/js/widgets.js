import * as Util from "./util.js";
let noteslist = [];

function setNotes(n) {
	noteslist = n;
}

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
		for (n of noteslist) {
			// The note itself
			let note = document.createElement("div");
			note.classList.add("notes-element");
			note.id = "notes1"
			note.innerHTML = `<font class="notedate">${dayMonthYearNoName(new Date(n.d))} ${hourMinutes(new Date(n.d))}</font><br>${(n.t)}`
			
			
			const buttons = [
			{classList: ["note-controls", "delete-note"], display: "✖", handle: deleteNoteHandler},
			{classList: ["note-controls", "edit-note"], display: "✎", handle: editNoteHandler}
			]
			
			for (b of buttons) {
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

function refreshZeroNotes() {
	if (noteslist.length == 0) {
		var noNotes = document.createElement("div")
		var noNotesMessage = document.createElement("div");
		noNotesMessage.classList.add("no-friends", "unselectable");
		noNotesMessage.innerHTML = "<i><center> Click here to add notes <center></i>"
		Util.getElement("add-note-body").appendChild(noNotesMessage)
	}
}


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

export {setNotes, noteBodyInner, friendslist}