import { getElement } from "./util.js";
import * as Widgets from "./widgets.js";
import * as Auth from "./auth.js";
import { closeStartMenu } from "./util.js";

const darkener = document.createElement("div");
const loginbox = document.createElement("div");
const wrongpw = document.createElement("div")
wrongpw.classList.add("wrong-password")

function openUserSettings(event) {
	closeStartMenu()
	socket.emit("request_settings", {})
}

function openUserSettingsS(sub) {
	closeStartMenu()
	socket.emit("request_settings", {"page": sub})
}


function initialise (msg) {
	darkener.remove();
	const usernameField = document.createElement("div");
	usernameField.id = "username-field";
	usernameField.classList.add("username-field");
	
	const  parent = getElement("startmenu");
	
	
	const usernameFieldElements = [
	{id: "username-main", classList: ["username-main"], innerHTML: msg.nickname, type: "font"},
	{id: "username-small", classList: ["username-small"], innerHTML: msg.username + "#" + msg.handle, type: "font"},
	{id: "user-pfp", classList: ["user-profile-picture"], innerHTML: "", type: "div"}
	]
	
	let elmnts = []
	
	for (let u of usernameFieldElements) {
		const c = document.createElement(u.type);
		c.id = u.id;
		c.classList.add(...u.classList);
		c.innerHTML = u.innerHTML;
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
		const e = document.createElement("a");
		e.id = c.id;
		e.classList.add(...c.classList);
		e.innerHTML = `<center>${c.display}</center>`;
		e.addEventListener("mouseup", c.handler);
		buttons.push(e)
	}
	
	
	
	
	usernameField.append(...elmnts);
	usernameField.addEventListener("mouseup", (event) => {
		openUserSettingsS("settings_profile")
	})
	
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

function addLoginButton () {
	var sm = getElement("startmenu");
	var lb = document.createElement("div");
	var sb = document.createElement("div");
	
	lb.id = "loginbutton";
	lb.classList.add("startmenu-button-lg-su", "login-button", "unselectable")
	lb.addEventListener("mouseup", (event) => {
		loginScreen();
	});
	lb.innerHTML = "Log in";
	
	sb.id = "signupbutton";
	sb.classList.add("startmenu-button-lg-su", "signup-button", "unselectable")
	sb.addEventListener("mouseup", (event) => {
		signupScreen();
	});
	sb.innerHTML = "Sign up";
	
	var topDiv = getElement("startmenu-top")
	
	topDiv.append(lb, sb);
	sm.append(topDiv);
}


function loginScreen() {
	darkener.textContent = "";
	loginbox.textContent = ""
	darkener.classList.add("darken");
	
	var pfp = document.createElement("div");
	var loginTBUser = document.createElement("input")
	var loginTBPass = document.createElement("input")
	var loginbutton = document.createElement("a")
	var abortbutton = document.createElement("a")
	
	pfp.classList.add("loginbox-pfp")
	
	
	loginbox.classList.add("loginbox");
	
	
	
	loginTBUser.type = "text";
	loginTBUser.style = "top: 230px;";
	loginTBUser.placeholder = "Username"
	loginTBUser.classList.add("login-tb");
	loginTBUser.id = "tb-username";
	
	
	loginTBPass.type = "password";
	loginTBPass.style = "top: 294px;"
	loginTBPass.placeholder = "Password"
	loginTBPass.classList.add("login-tb", "login-tb-pw");
	loginTBPass.id = "tb-password";
	
	loginTBPass.addEventListener("keydown", (event) => {
		if (event.keyCode == 13) {
			socket.emit("login", {
				username: loginTBUser.value, 
				password: loginTBPass.value
			}) 
			loginTBUser.value = "";
			loginTBPass.value = "";
		}
	});

	loginTBUser.addEventListener("keydown", (event) => {
		if (event.keyCode == 13) {
			socket.emit("login", {
				username: loginTBUser.value, 
				password: loginTBPass.value
			}) 
			loginTBUser.value = "";
			loginTBPass.value = "";
			
		}
	});
	

	
	loginbutton.classList.add("login-button", "login-button-submit","unselectable")
	abortbutton.classList.add("login-button", "login-button-abort", "unselectable")
	
	
	// loginbutton.innerHTML = "<center>&nbsp;➤</center>"
	loginbutton.innerHTML = '<center><i class="fa-solid fa-arrow-right"></i></center>'
	abortbutton.innerHTML = "<center>✖</center>"
	
	loginbox.append(pfp, loginTBUser, loginTBPass, abortbutton, loginbutton);
	darkener.appendChild(loginbox);
	
	getElement("bodydiv").appendChild(darkener);
	
	loginbutton.addEventListener("mouseup", (event) => {
		socket.emit("login", {
			username: loginTBUser.value, 
			password: loginTBPass.value
		}) 
		loginTBUser.value = "";
		loginTBPass.value = "";
	})
	
	abortbutton.addEventListener("mouseup", closeLogin)
	
	loginTBUser.focus();
}

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
	
	for (c of conditionIndicators) {
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

function signupScreen() {
	darkener.textContent = "";
	loginbox.textContent = ""; // Resetting to prevent problems
	
	var pfp = document.createElement("div");
	
	var infoButton = document.createElement("a");
	infoButton.classList.add("info-button", "unselectable")
	infoButton.innerHTML = '<center><i class="fa-solid fa-info fa-sm"></i></center>';
	
	var signupbutton = document.createElement("a")
	var abortbutton = document.createElement("a")
	
	var passwordInfo = document.createElement("div");
	passwordInfo.classList.add("password-info", "unselectable", "hidden");
	passwordInfo.id = "pw-info";
	passwordInfo.textContent = "Passwords must contain 3 of the following:";
	
	
	const conditionIndicators = [
		{id: "upper", display: "Uppercase Letters"},
		{id: "lower", display: "Lowercase Letters"},
		{id: "number", display: "Digits"},
		{id: "special", display: "Special Characters"},
		{id: "length", display: "more than 8 characters long"}
	]
	for (o of conditionIndicators) {
		if (o.id == "length") {
			const t = document.createElement("span");
			t.textContent = "And be"
			passwordInfo.appendChild(t)
		}
		const s = document.createElement("div");
		s.id = `condition-${o.id}`;
		s.textContent = o.display;
		s.classList.add("condition-not-met", "condition");
		passwordInfo.appendChild(s)
	}
	
	
	var title = document.createElement("font")
	title.style = "font-size: 36px; line-height: 48px; left: 10%; position: absolute;"
	title.innerHTML = "Sign up"
	darkener.classList.add("darken");
	
	loginbox.classList.add("loginbox");
	
	const textboxes = [
	{type: "text", style: "top: 80px", placeholder: "Username", id: "tb-su-username"},
	{type: "text", style: "top: 144px", placeholder: "E-Mail", id: "tb-su-email"},
	{type: "password", style: "top: 220px", placeholder: "Password", id: "tb-su-pw"},
	{type: "password", style: "top: 263px", placeholder: "Confirm Password", id: "tb-su-pwc"}
	]
	var form = [];
	for (t of textboxes) {
		const s = document.createElement("input");
		s.type = t.type;
		s.style = t.style;
		s.value = "";
		s.classList.add("login-tb");
		s.placeholder = t.placeholder;
		s.id = t.id;
		form.push(s)
	}
	
	
	signupbutton.classList.add("login-button", "login-button-submit","unselectable")
	abortbutton.classList.add("login-button", "login-button-abort", "unselectable")
	
	signupbutton.style = "top: 263px";
	signupbutton.innerHTML = '<center><i class="fa-solid fa-arrow-right"></i></center>'
	abortbutton.innerHTML = "<center>✖</center>"
	
	
	
	loginbox.append(title,pfp,abortbutton,signupbutton,passwordInfo,infoButton);
	loginbox.append(...form);
	
	
	darkener.appendChild(loginbox);
	getElement("bodydiv").appendChild(darkener);
	
	signupbutton.addEventListener("mouseup", (event) => {
		passwordCheckFinal()
		socket.emit("signup", {username: form[0].value, password: form[2].value})
	})
	
	abortbutton.addEventListener("mouseup", closeLogin);
	
	infoButton.addEventListener("mousedown", (event) => {
		console.log("est")
		getElement("pw-info").classList.toggle("hidden")
	})
	
	form[2].addEventListener("input", passwordCheck);
	
	form[0].focus()
}

function wrongPW(msg) {
	wrongpw.remove()
	wrongpw.innerHTML = "<center>Incorrect username or password. Please try again!</center>"
	loginbox.appendChild(wrongpw);
}

export {initialise, signupScreen, wrongPW, loginScreen, addLoginButton}


