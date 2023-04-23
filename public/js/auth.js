import { closeAllWindows } from "./windows.js";
/**
 * No longer temporary, though there might be some changes in the future.
 * @todo Implement proper authentification
 * @module Auth
 */
// TEMPORARY MEASURE
let login = {};
/**
 * Saves barebones cookies that last for 30 minutes
 * @param {object} l 
 */
function setLogin(l) {
	document.cookie = `username=${l.username}; expires:${l.expires}; secure`
	document.cookie = `token=${l.token}; expires:${l.expires}; secure` 
	login = l;
}

/**
 * Deletes cookies, closes windows, resets the login object
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