/**
 * @file login.js
 * @author Smittel
 */
import { getElement, create } from "./util.js";
import * as Widgets from "./widgets.js";
import * as Auth from "./auth.js";
import { closeStartMenu } from "./util.js";
import { closeAllWindows } from "./windows.js";

/**
 * Contains functionality relating to login and signup
 * @todo Implement proper signup including communication with back end.
 * @module Login
 */



/**
 * The login/signup background, blurs and darkens everything except the form
 * @member
 * @memberof module:Login
 * @type {HTMLDivElement}
 */
const darkener = document.createElement("div");

/**
 * The div containing the login/signup form
 * @member
 * @memberof module:Login
 * @type {HTMLDivElement}
 */

const loginbox = create("div", {
	textContent: "",
	classList: ["loginbox"]
})

/**
 * A small error message. Not a dialog box, just a small error
 * @member
 * @memberof module:Login
 * @type {HTMLDivElement}
 */
const wrongpw = create("div", {
	classList: ["wrong-password"]
});

/**
 * Sends a server request for the user settings
 * @param {MouseEvent} event 
 */
function openUserSettings(event) {
	closeStartMenu()
	socket.emit("request_settings", {})
}

/**
 * Sends a request to the server to open the Settings with a specific category
 * @param {string} sub The settings category to open by default
 * @memberof module:Login
 */
function openUserSettingsS(sub) {
	closeStartMenu()
	socket.emit("request_settings", {"page": sub})
}

/**
 * Technically not supposed to be called other than through the specific socket message
 * @param {Object} msg
 * @param {string} msg.username The username
 * @param {string} msg.handle A 4 digit number. Basically like discord does it
 * @param {string} msg.nickname The nickname of the user
 * @param {Object[]} msg.notes List of all notes by the user
 * @param {Object[]} msg.friends List of friends
 * @param {number} msg.id Unique identifier
 * @param {string} msg.profilePicture The url of the users profile picture
 * @param {string} msg.token not yet implemented, contains the authentification token
 * @memberof module:Login
 * 
 */
function initialise (msg) {
	darkener.remove();

	const usernameField = create("div", {
		id: "username-field",
		classList: ["username-field"],
		eventListener: {"mouseup": (e)=>{openUserSettingsS("settings_profile")}}
	})
	const  parent = getElement("startmenu");
	
	
	const usernameFieldElements = [
	{id: "username-main", classList: ["username-main"], innerHTML: msg.nickname, type: "font"},
	{id: "username-small", classList: ["username-small"], innerHTML: msg.username + "#" + msg.handle, type: "font"},
	{id: "user-pfp", classList: ["user-profile-picture"], innerHTML: "", type: "div"}
	]
	
	let elmnts = []
	
	for (let u of usernameFieldElements) {
		const c = create(u.type, {
			id: u.id,
			classList: u.classList,
			innerHTML: u.innerHTML
		})
		elmnts.push(c)
	}
	
	
	// Makes adding new elements easier
	let buttons = []
	const smTopBtns = [
		{
			id: "usersettings", 
			classList: ["startmenu-top-button", "startmenu-top-button-settings"], 
			display: '<i class="fa-solid fa-gear fa-lg"></i>',
			handler: openUserSettings
		},
		{
			id: "logout", 
			classList: ["startmenu-top-button", "startmenu-top-button-logout"], 
			display: '<i class="fa-solid fa-right-from-bracket"></i>',
			handler: Auth.userLogOut
		}
	]
	for (let c of smTopBtns) {
		const e = create("a", {
			id: c.id,
			classList: c.classList,
			innerHTML: `<center>${c.display}</center>`,
			eventListener: {"mouseup": c.handler}
		})
		buttons.push(e)
	}
	
	
	
	
	usernameField.append(...elmnts);
	
	
	const startmenuLayout = [
		{id: "startmenu-top", classList: ["startmenu-top"], child: [usernameField, ...buttons]},
		{id: "startmenu-favorites", classList: ["startmenu-favorites"], child: []}
	]
	
	for (let c of startmenuLayout) {
		const e = getElement(c.id);
		e.classList.add(...c.classList);
		e.textContent = "";
		e.append(...c.child)
	}
	
	
	const smf = getElement("startmenu-favorites");
	
	smf.addEventListener("wheel", (evt) => {
		evt.preventDefault();
		smf.scrollLeft += evt.deltaY;
	});
	
	let favl = []
	for (let i = 0; i < 12; i++) {
		const e = document.createElement("a");
		e.classList.add("sm-favorites-element");
		getElement("startmenu-favorites").appendChild(e);
	}
	
	const addNoteButton = document.createElement("widget-button");
	addNoteButton.id = "add-notes";
	addNoteButton.dataset.small = getElement("widget-notes").dataset.small
	addNoteButton.classList.add("add-button")
	
	
	
	getElement("widget-notesheader").appendChild(addNoteButton);
	Widgets.setNotes(msg.notes);
	Widgets.noteBodyInner();
	Widgets.friendslist(msg.friends)
	
	Auth.setLogin(msg);
}

/**
 * Creates the "login" and "sign up" buttons in the start menu, if the user is not "authentificated"
 * @memberof module:Login
 */
function addLoginButton () {
	const sm = getElement("startmenu");

	const lb = create("div", {
		id: "loginbutton",
		classList: ["startmenu-button-lg-su", "login-button", "unselectable"],
		eventListener: {"mouseup": loginScreen},
		innerHTML: "Log in"
	})

	const sb = create("div", {
		id: "signupbutton",
		classList: ["startmenu-button-lg-su", "signup-button", "unselectable"],
		eventListener: {"mouseup": signupScreen},
		innerHTML: "Sign up"
	})
	
	
	const topDiv = getElement("startmenu-top")
	
	topDiv.append(lb, sb);
	sm.append(topDiv);
}

/**
 * Creates the login form
 * @memberof module:Login
 */
function loginScreen() {
	darkener.textContent = "";
	loginbox.textContent = "";
	darkener.classList.add("darken");
	
	function submitLogin(event) {
		if (event.key == "Enter" || event.type == "mouseup") {
			socket.emit("login", {
				username: loginTBUser.value, 
				password: loginTBPass.value
			}) 
			loginTBUser.value = "";
			loginTBPass.value = "";
		}
	}

	
	const pfp = create("div", {
		classList: ["loginbox-pfp"]
	})

	const loginTBUser = create("input", {
		type: "text",
		style: "top: 230px;",
		placeholder: "Username",
		classList: ["login-tb"],
		id: "tb-username",
		eventListener: {"keydown": submitLogin}
	})
	
	const loginTBPass = create("input", {
		type: "password",
		style: "top: 294px;",
		placeholder: "Password",
		classList: ["login-tb", "login-tb-pw"],
		id: "tb-password",
		eventListener: {"keydown": submitLogin}
	})

	const loginbutton = create("a", {
		classList: ["login-button", "login-button-submit","unselectable"],
		innerHTML: '<center><i class="fa-solid fa-arrow-right"></i></center>',
		eventListener: {"mouseup": submitLogin}
	})
	
	const abortbutton = create("a", {
		classList: ["login-button", "login-button-abort", "unselectable"],
		innerHTML: "<center>✖</center>",
	})

	
	
	loginbox.append(pfp, loginTBUser, loginTBPass, abortbutton, loginbutton);
	darkener.appendChild(loginbox);
	
	getElement("bodydiv").appendChild(darkener);
	
	
	
	abortbutton.addEventListener("mouseup", closeLogin)
	
	loginTBUser.focus();
}

/**
 * Closes the login form when user clicks the (x) button
 * @listens mouseup
 * @memberof module:Login
 * @param {MouseEvent=} event 
 */
function closeLogin(event) {
	wrongpw.remove();
	darkener.remove();
}

/**
 * Calculates the strength of a password only based on the types of characters a password contains, not the length
 * @returns {number} "Strength" of password
 */
function passwordConditions () {
	const tb1 = getElement("tb-su-pw")
	
	const conditionIndicators = [
		{name:"condition-upper",   reg: new RegExp("[A-Z]", "g")},
		{name:"condition-lower",   reg: new RegExp("[a-z]", "g")},
		{name:"condition-number",  reg: new RegExp("[0-9]", "g")},
		{name:"condition-special", reg: new RegExp("[ -/:-@\[-`\{-´]","g")},
		{name:"condition-length",  reg: new RegExp(".{8,}","g")}
	]
	
	let conditions = 0;
	
	for (let c of conditionIndicators) {
		const e = getElement(c.name)
		if (tb1.value.match(c.reg)) {
			conditions++;
			e.classList.add("condition-met")
		} else {
			e.classList.remove("condition-met")
		}
	}
	
	return conditions;
}

/**
 * Checks which conditions are met and updates UI accordingly
 * @listens input
 * @memberof module:Login
 * @param {Event=} event 
 * @returns {number}
 */
function passwordCheck (event) {
	const tb1 = document.getElementById("tb-su-pw")
	const tb2 = document.getElementById("tb-su-pwc")
	
	// CHECK IF THERES AN INVALID CHARACTER IN THE PASSWORD 
	// ONLY ALPHANUMERIC AND ASCII SPECIAL CHARACTERS + ASCII ACCENTED
	// except multiplication cross and division symbol
	const invalid = new RegExp("[^A-Z -/:-@\[-`\{-´0-9À-ÖØ-Þßÿ]","gi")
	if (tb1.value.match(invalid)) {
		tb1.classList.add("login-tb-red")
		wrongpw.innerHTML = "<center>Invalid character in password</center>";
		loginbox.appendChild(wrongpw)
		return
	} else {
		tb1.classList.remove("login-tb-red")
		wrongpw.innerHTML = "";
		wrongpw.remove()
	}
	
	const baseConditions = passwordConditions(); // Update infobox
	
	// OPTIONAL EXTRA STUFF: password strength estimator;
	
	let strength = 0;
	const extra = new RegExp("[À-ÖØ-Þß]","gi")
}

/**
 * Sets up sign up screen
 * @memberof module:Login
 */
function signupScreen() {
	darkener.textContent = "";
	loginbox.textContent = ""; // Resetting to prevent problems
	
	var pfp = document.createElement("div");
	
	function signupEvent(){
		passwordCheckFinal()
		socket.emit("signup", {username: form[0].value, password: form[2].value})
	}

	const infoButton = create("a", {
		classList: ["info-button", "unselectable"],
		innerHTML: '<center><i class="fa-solid fa-info fa-sm"></i></center>',
		eventListener: {mousedown: ()=>{getElement("pw-info").classList.toggle("hidden")}}
	})

	const signupbutton = create("a", {
		classList: ["login-button", "login-button-submit","unselectable"],
		style: "top: 263px;",
		innerHTML: '<center><i class="fa-solid fa-arrow-right"></i></center>',
		eventListener: {mouseup: signupEvent}
	})
	
	const abortbutton = create("a", {
		classList: ["login-button", "login-button-abort", "unselectable"],
		innerHTML: "<center>✖</center>",
		eventListener: {mouseup: closeLogin}
	})

	const conditionIndicators = [
		{id: "upper", display: "Uppercase Letters"},
		{id: "lower", display: "Lowercase Letters"},
		{id: "number", display: "Digits"},
		{id: "special", display: "Special Characters"},
		{id: "length", display: "more than 8 characters long"}
	]
	let pwinfoelmnts = [];
	for (let o of conditionIndicators) {
		if (o.id == "length") {
			const t = create("span", {
				textContent: "And be"
			});
			pwinfoelmnts.push(t)
		}
		const s = create("div", {
			id: `condition-${o.id}`,
			textContent: o.display,
			classList: ["condition-not-met", "condition"]
		});
		pwinfoelmnts.push(s)
	}

	const passwordInfo = create("div", {
		classList: ["password-info", "unselectable", "hidden"],
		id: "pw-info",
		textContent: "Passwords must contain 3 of the following:",
		childElements: pwinfoelmnts
	})

	const title = create("span", {
		style: "font-size: 36px; line-height: 48px; left: 10%; position: absolute;",
		innerHTML: "Sign up"
	})

	darkener.classList.add("darken");
	loginbox.classList.add("loginbox");
	

	const textboxes = [
		{type: "text", style: "top: 80px", placeholder: "Username", id: "tb-su-username"},
		{type: "text", style: "top: 144px", placeholder: "E-Mail", id: "tb-su-email"},
		{type: "password", style: "top: 220px", placeholder: "Password", id: "tb-su-pw"},
		{type: "password", style: "top: 263px", placeholder: "Confirm Password", id: "tb-su-pwc"}
	]
	var form = [];
	for (let t of textboxes) {
		const s = create("input", {
			type: t.type,
			style: t.style,
			value: "",
			classList: ["login-tb"],
			placeholder: t.placeholder,
			id: t.id
		});
		form.push(s)
	}
	
	loginbox.append(title,pfp,abortbutton,signupbutton,passwordInfo,infoButton);
	loginbox.append(...form);
	
	
	darkener.appendChild(loginbox);
	getElement("bodydiv").appendChild(darkener);
	
	form[2].addEventListener("input", passwordCheck);
	
	form[0].focus()
}

/**
 * Adds the small error telling the user that the password was wrong.
 * @param {Object=} msg typically empty
 */
function wrongPW(msg) {
	wrongpw.remove()
	wrongpw.innerHTML = "<center>Incorrect username or password. Please try again!</center>"
	loginbox.appendChild(wrongpw);
}

/**
 * Does some clientside checks for password match and conditions met.
	* Could be circumvented fairly easily, thats why the server has to check too and send a response accordingly, but maybe this can be used to reduce server CPU time slightly, the reasoning being that the average joe will use the form instead of reading the docs and sending a custom message to the server just to have an easier to crack password.
 * @listens mouseup
 * @memberof module:Login
 * @param {MouseEvent} event 
 */
function passwordCheckFinal (event) {
	const signupTBPass = document.getElementById("tb-su-pw")
	const signupTBPassConfirm = document.getElementById("tb-su-pwc")
	
	if (signupTBPass.value != signupTBPassConfirm.value) {
		wrongpw.innerHTML = "<center>Passwords do not match!</center>";
		signupTBPass.classList.add("login-tb-red")
		signupTBPassConfirm.classList.add("login-tb-red")
		loginbox.appendChild(wrongpw)
	} else {
		wrongpw.textContent = "";
		wrongpw.remove;
		signupTBPass.classList.remove("login-tb-red");
		signupTBPassConfirm.classList.remove("login-tb-red")
		wrongpw.remove();
	}
	
	
	let conditions = passwordConditions();
	
	if (conditions < 3) {
		document.getElementById("pw-info").classList.remove("hidden")
	} else {
		document.getElementById("pw-info").classList.add("hidden")
	}
	
	
	const condLength = document.getElementById("condition-length")
}

/**
 * On user logout: close windows, reset widgets, reset start menu, add back login/signup buttons
 * @memberof module:Login
 * @param {Object=} msg 
 */
function logoutHandle(msg) {
	closeAllWindows();
	getElement("widget-body-notes").innerHTML = `
			<div class="no-friends unselectable">
			<i><center>Please log in for notes</center></i>
			</div>`
	getElement("add-notes").remove();
	getElement("widget-body-friends").innerHTML = `<div class="no-friends unselectable"><i></i><center><i> Please login for friends</i><center><i></i></center></center></div>`
	getElement("startmenu-top").textContent = ""
	getElement("startmenu-main").textContent = ""
	getElement("startmenu-favorites").textContent = ""
	getElement("startmenu-favorites").className = "";
	addLoginButton();
}

export {initialise, signupScreen, wrongPW, loginScreen, addLoginButton, logoutHandle}


