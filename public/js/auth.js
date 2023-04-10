import { closeAllWindows } from "./windows.js";
// TEMPORARY MEASURE
let login = {};
function setLogin(l) {
    login = l;
}

function userLogOut(event) {
	// THIS MUST BE REPLACED WITH COOKIE
	setLogin({})
    closeAllWindows();
	socket.emit("logout", {})
}
export {setLogin, userLogOut, login}