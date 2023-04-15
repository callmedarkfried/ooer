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
    login = l;
}

/**
 * Will be changed once theres actual authentification and sessions
 * @param {event} event 
 */
function userLogOut(event) {
	// THIS MUST BE REPLACED WITH COOKIE
	setLogin({})
    closeAllWindows();
	socket.emit("logout", {})
}
export {setLogin, userLogOut, login}