import { makeButton, connLostReset } from "./util.js";
function btnOk() {
	return [makeButton("OK", true)];
}

function btnCancelOk() {
	return [makeButton("Cancel", false), makeButton("OK", true)];
}

function btnAbortRetryIgnore() {
	return [
		makeButton("Abort", false),
		makeButton("Retry", true),
		makeButton("Ignore", false)
	]
}

function btnYesNoCancel() {
	return [
		makeButton("Yes", true),
		makeButton("No", false),
		makeButton("Cancel", false)
	]
}

function btnYesNo() {
	return [
		makeButton("Yes", true),
		makeButton("No", false)
	]
}

function btnRetryCancel() {
	return [
		makeButton("Retry", true),
		makeButton("Cancel", false)
	]
}

const errorBoxFunctions = [
	btnOk,
	btnCancelOk,
	btnAbortRetryIgnore,
	btnYesNoCancel,
	btnYesNo,
	btnRetryCancel
]

/**
 * Generates and renders an error message using a similar system to VB MsgBox. 
 * The type of error message can be defined via a seven-bit integer as such:
<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
.tg .tg-re1e{background-color:#656565;border-color:inherit;text-align:left;vertical-align:top}
.tg .tg-c6of{background-color:#ffffff;border-color:inherit;text-align:left;vertical-align:top}
.tg .tg-ne6m{background-color:#656565;border-color:inherit;color:#333333;text-align:left;vertical-align:top}
</style><table class="tg"><thead><tr><th class="tg-0pky" colspan="4">Values</th><th class="tg-0pky">Meaning</th></tr></thead><tbody><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">000</td><td class="tg-0pky">OK</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">001</td><td class="tg-0pky">CANCEL OK</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">010</td><td class="tg-0pky">ABORT RETRY IGNORE</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">011</td><td class="tg-0pky">YES NO CANCEL</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">100</td><td class="tg-0pky">YES NO</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-re1e">x</td><td class="tg-c6of">101</td><td class="tg-0pky">RETRY CANCEL</td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-c6of">0</td><td class="tg-re1e">xxx</td><td class="tg-0pky">Parent not blocked<br></td></tr><tr><td class="tg-re1e">x</td><td class="tg-re1e">xx</td><td class="tg-c6of">1</td><td class="tg-re1e">xxx</td><td class="tg-0pky">Parent blocked</td></tr><tr><td class="tg-re1e">x</td><td class="tg-c6of">00</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">CRITICAL</td></tr><tr><td class="tg-re1e">x</td><td class="tg-c6of">01</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">QUESTION</td></tr><tr><td class="tg-re1e">x</td><td class="tg-c6of">10</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">EXCLAMATION</td></tr><tr><td class="tg-re1e">x</td><td class="tg-c6of">11</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">INFORMATION</td></tr><tr><td class="tg-c6of">0</td><td class="tg-ne6m">xx</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">Visually parented to window</td></tr><tr><td class="tg-c6of">1</td><td class="tg-ne6m">xx</td><td class="tg-re1e">x</td><td class="tg-re1e">xxx</td><td class="tg-0pky">Visually not tied to window</td></tr></tbody></table>
 * @function errorMessage
 * @param {object} parent - DOM Object that the error message will be bound to.
 * @param {number} layout - Integer defining the type of error message, refer to function description
 * @param {string} title - Title of the error message
 * @param {string} text - The error message text
 * @param {object} functions - Array of functions that determine the behaviour of the buttons
 * @returns {object} - Optional. Returns the full error message object with all children.
 */
function errorMessage(parent, layout, title, text, functions) {
	// console.log(parent)
	//   F8421
	// xxxx000 OK
	// xxxx001 CANCEL OK
	// xxxx010 ABORT RETRY IGNORE
	// xxxx011 YES NO CANCEL
	// xxxx100 YES NO
	// xxxx101 RETRY CANCEL
	// xxx0xxx Application not blocked
	// xxx1xxx Application blocked
	// x00xxxx CRITICAL
	// x01xxxx QUESTION
	// x10xxxx EXCLAMATION
	// x11xxxx INFORMATION
	// 0xxxxxx Parented to window
	// 1xxxxxx Global
	// Functions: array, maps directly to order of buttons.
	// eg abort retry ignore in that order. undefined or null will be ignored.
	const buttons = layout % 8;
	const blocked = (layout >> 3) % 2;
	const symbol = (layout >> 4) % 4;
	const scope = (layout >> 6);
	
	// window-button[data-action="close"]
	const dbb = document.createElement("dialog-box");    // Main dialog box
	
	const dbh = document.createElement("dialog-header"); // Header
	dbh.innerHTML = `<font class="indent">${title}</font>`;
	
	const dbx = document.createElement("window-button"); // Close button
	dbx.style = "width: 45px !important";
	dbx.dataset.action = "close";
	dbx.addEventListener("mouseup", errorBoxCloseButton);
	
	const dbwc = document.createElement("div");			 // Close button container
	dbwc.classList.add("windowControls");
	dbwc.style = "width: 50px !important";
	dbwc.appendChild(dbx);
	
	dbb.append(dbh, dbwc);
	
	const symbols = [
	{s: `<i class="fa-regular fa-circle-xmark fa-4x"></i>`, c: "error-critical"},
	{s: `<i class="fa-solid fa-circle-question fa-4x"></i>`, c: "error-question"},
	{s: `<i class="fa-solid fa-triangle-exclamation fa-4x"></i>`, c: "error-exclamation"},
	{s: `<i class="fa-solid fa-circle-exclamation fa-4x"></i>`, c: "error-information"}
	]
	
	const dbc = document.createElement("div");	// Dialog box body
	dbc.classList.add("err-body");
	
	const errortext = document.createElement("div");
	errortext.classList.add("err-body-text");
	errortext.textContent = text;
	
	const errsym = document.createElement("div");
	errsym.classList.add("err-body-symbol");
	errsym.innerHTML = `<font style="color: var(--${symbols[symbol].c});">${symbols[symbol].s}</font>`
	
	const buttoncontainer = document.createElement("div");
	buttoncontainer.classList.add("err-btn-container");
	
	const darken = document.createElement("div");
	darken.id = `errorDarkener${Math.round(Math.random()* 100000000)}`
	darken.classList.add("error-darken");
	darken.appendChild(dbb);
	
	
	const buttonlist = errorBoxFunctions[buttons]();
	if (functions) {
		for (let i = 0; i < buttonlist.length; i++) {
			buttonlist[i].addEventListener("click", (event) => {
				if (functions[i] != undefined) {
					functions[i](event);
				}
				darken.remove();
			});
		}
	}
	buttoncontainer.append(...buttonlist);
	dbc.append(errsym, errortext);
	dbc.appendChild(buttoncontainer);
	// window.appendChild(dbb);
	dbb.append(dbc)
	
	parent.appendChild(darken);
	
	return darken
}

function errorBoxCloseButton(event) {
	let db = event.target.parentNode.parentNode;
	if (db.parentNode.id.match(/errorDarkener\d+/g)) db = db.parentNode;
	db.remove();
	if (db.dataset.id == "connectionLost") {
		connLostReset();
	}
}





export {errorMessage}