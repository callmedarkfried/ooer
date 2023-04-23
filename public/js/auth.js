import { closeAllWindows } from "./windows.js";
/**
 * Everything here is temporary!
 * @todo Implement proper authentification
 * @module Auth
 */
// TEMPORARY MEASURE
let login = {};
/**
 * Just a temporary measure and nothing to worry about for testing and playing around. think of it as a session token that isnt stored on reload
 * @param {object} l 
 */
function setLogin(l) {
	document.cookie = `username=${l.username}; expires:${l.expires}; secure`
	document.cookie = `token=${l.token}; expires:${l.expires}; secure` 
	login = l;
}

/**
 * Will be changed once theres actual authentification and sessions
 * @param {event} event 
 */
function userLogOut(event) {
	// THIS MUST BE REPLACED WITH COOKIE
	socket.emit("logout", {cookie: document.cookie})
	const cookies = document.cookie.split(";");

	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i];
		const eqPos = cookie.indexOf("=");
		const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
		document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
	}
	
	setLogin({})
    closeAllWindows();
	
}
export {setLogin, userLogOut, login}