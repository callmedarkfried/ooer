import { getElement } from "./util.js";
const monthnames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
/**
* Returns the time of day in local format with leading zeroes
* @function hourMinutes
* @param {Date} date
* @returns {String} - "HH:MM"
*/
function hourMinutes(date) {
	return date.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
};
/**
 * Adjusts the angles of the analog clock accordingly. 
 * Will soon be reworked. Not really meant to be used by "third party" apps
 *
 * @param {Date} date
 */
function analog(date) {
	const chh = getElement("chh");
	const chm = getElement("chm");
	const chs = getElement("chs");
	chh.style = `--rotation: ${date.getHours() * 30 + date.getMinutes() / 2}deg`
	chm.style = `--rotation: ${date.getMinutes() * 6}deg`
	chs.style = `--rotation: ${date.getSeconds() * 6}deg`
};

/**
 * Returns the ordinal suffix for a given number. 
 * @function getSuffix
 * @param {int} n
 * @returns {string} - Number plus suffix
 * @memberof clock
 */
function getSuffix(n) {
	n = n % 100;
	if (n >= 11 && n <= 13) return n + "th";
	let suffixes = ["th", "st", "nd", "rd", "th"]
	let index = Math.min(n % 10, 4)
	return n + suffixes[index]
};

function dayMonthYear(date) {
	let year = date.getFullYear();
	let month = monthnames[date.getMonth()];
	let dayOfMonth = getSuffix(date.getDate());
	let dayOfWeek = weekdays[date.getDay()];
	return `${dayOfWeek}, ${month} ${dayOfMonth} ${year}`
};

function dayMonthYearNoName(date) {
	let year = date.getFullYear();
	let month = monthnames[date.getMonth()];
	let dayOfMonth = getSuffix(date.getDate());
	return `${month} ${dayOfMonth} ${year}`
	
};

function clockTick() {
	let currDate = new Date(Date.now());
	analog(currDate)
	let clockTime = getElement("desktop-clock-time");
	let clockDate = getElement("desktop-clock-date");
	clockTime.innerHTML = `<center>${hourMinutes(currDate)}</center>`;
	clockDate.innerHTML = `<center>${dayMonthYear(currDate)}</center>`;
}

clockTick();

export { clockTick ,hourMinutes, dayMonthYear, dayMonthYearNoName, getSuffix};
