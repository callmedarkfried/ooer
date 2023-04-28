/**
 * @file clock.js
 * @description Displays time, parses dates etc.
 * @exports clockTick,hourMinutes,dayMonthYear,dayMonthYearNoName,getSuffix,renderCalendar,initCalendar
 * @author Smittel
 * @module Clock
 */

import { getElement, create } from "./util.js";
const monthnames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const daysShort = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "So"]
let lockscreenTimer = 0;
let lockscreenTriggerTime = 120;
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
 * @example Clock.getSuffix(5); -> "5th"
 * Clock.getSuffix(3); -> "3rd"
 */
function getSuffix(n) {
	n = n % 100;
	if (n >= 11 && n <= 13) return n + "th";
	let suffixes = ["th", "st", "nd", "rd", "th"]
	let index = Math.min(n % 10, 4)
	return n + suffixes[index]
};
/**
 * Returns a formatted string with a "standard" way of writing dates.
 * "Standard" in this case meaning the way i would write them, though it should be easily understandable
 * @param {Date} date 
 * @returns {String} Weekday, Monthname DD YYYY
 */
function dayMonthYear(date) {
	let year = date.getFullYear();
	let month = monthnames[date.getMonth()];
	let dayOfMonth = getSuffix(date.getDate());
	let dayOfWeek = weekdays[date.getDay()];
	return `${dayOfWeek}, ${month} ${dayOfMonth} ${year}`
};

/**
 * Returns a formatted string in the format 'month name' 'day' 'year'
 * @function
 * @param {Date} date 
 * @returns {String}
 */
function dayMonthYearNoName(date) {
	let year = date.getFullYear();
	let month = monthnames[date.getMonth()];
	let dayOfMonth = getSuffix(date.getDate());
	return `${month} ${dayOfMonth} ${year}`
	
};

/**
 * Updates the clock display
 */
function clockTick() {
	let currDate = new Date(Date.now());
	analog(currDate)
	let clockTime = getElement("desktop-clock-time");
	let clockDate = getElement("desktop-clock-date");
	let lockClock = getElement("lockscreen-clock");
	let lockDate = getElement("lockscreen-date");
	clockTime.innerHTML = `<center>${hourMinutes(currDate)}</center>`;
	clockDate.innerHTML = `<center>${dayMonthYear(currDate)}</center>`;
	if (lockClock) lockClock.innerHTML = `<center>${hourMinutes(currDate)}</center>`;
	if (lockDate) lockDate.innerHTML = `<center>${dayMonthYear(currDate)}</center>`;
	lockscreenTimer++;
	if (lockscreenTimer == lockscreenTriggerTime) showLockscreen();
}

document.addEventListener("mousemove", (event) => {lockscreenTimer = 0})
getElement("welcome-screen").addEventListener("click", removeLockscreen)

function showLockscreen() {
	getElement("welcome-screen").classList.remove("hidden")
	getElement("welcome-screen").classList.remove("welcome-screen-transition")
}
function removeLockscreen(event) {
	getElement("welcome-screen").classList.add("welcome-screen-transition");
	lockscreenTimer = 0;
	setTimeout(()=>{getElement("welcome-screen").classList.add("hidden")}, 300)
}


// CALENDAR ///////////////////////////////////////////////////////////////////////////////


/**
 * Returns the number of days in a given month
 * @method
 * @name getDays
 * @param {number} year 
 * @param {number} month 
 * @returns {number} Number of days in month
 */
function getDays (year, month) {
    return new Date(year, month+1, 0).getDate();
};

/**
 * @member appointments
 * @description Temporary, will be replaced by server response
 */
var appointments = [
	{"date": new Date(2023, 2, 3), "name": "placeholder"},
	{"date": new Date(2023, 2, 1), "name": "appointments"},
	{"date": new Date(2023, 2, 31), "name": "wep"},
	{"date": new Date(2023, 2, 17), "name": "oman"},
	{"date": new Date(2023, 3, 1), "name": "ooo :joy:"},
	{"date": new Date(2023, 4, 16), "name": "lemon say weyo"}
];

var d = new Date(Date.now());


var selectedMonth = d.getMonth();
var selectedYear = d.getFullYear();
console.log(selectedMonth, selectedYear)
getElement("calendar-month").innerHTML = `<center>${monthnames[selectedMonth]} ${selectedYear}</center>`
//renderCalendar(selectedMonth, selectedYear);
const plus = getElement("month-plus")
const minus = getElement("month-minus")

plus.addEventListener("click", (event) => {
	selectedMonth++;
	if (selectedMonth > 11) {
		selectedMonth = 0;
		selectedYear++;
	}
	renderCalendar(selectedMonth, selectedYear);
	getElement("calendar-month").innerHTML = `<center>${monthnames[selectedMonth]} ${selectedYear}</center>`
});

minus.addEventListener("click", (event) => {
	selectedMonth--;
	if (selectedMonth < 0) {
		selectedMonth = 11;
		selectedYear--;
	}
	renderCalendar(selectedMonth, selectedYear);
	getElement("calendar-month").innerHTML = `<center>${monthnames[selectedMonth]} ${selectedYear}</center>`
});

function initCalendar() {
	renderCalendar(selectedMonth, selectedYear);
}

/**
 * Renders the calendar with a given month and year
 * @param {number} month 0 through 11
 * @param {number} year full year (4 digits)
 */
function renderCalendar(month, year) {
	var dateArray = [];
	var firstOfMonth = new Date(year, month, 0);
	var offset = firstOfMonth.getDay() -1;
	for (let i = offset; i <= offset + getDays(year, month); i++) {
		dateArray[i] = i - offset;
	}
	var checkAppMonth = new Date(year, month+1, 0);
	var monthAppointments = appointments.filter(c => checkAppMonth.getMonth() == c.date.getMonth()).sort((date1, date2) => date1.date - date2.date);
	
	
	var appList = "";

	
	for (let x of monthAppointments) {
		
		var suff = ["st", "nd", "rd", "th"]
		var dayOfMonth = datifyShort(x.date);
		
	
		appList += `<div class="appointmentlistelement"><font class="indent header"><b>${x.name}</b></font><br><font style="margin-left: 12px; font-size: 12px">${dayOfMonth}</font></div>`
	}
	
	getElement("appointmentlist").innerHTML = appList;
	
	let daytable = []
	for (let i = 0; i < 7; i++) {
		const t = create("div", {
			innerHTML: `<b>${daysShort[i]}</b>`,
			classList: ["calender-date-block", "unselectable"]
		});
		daytable.push(t);
	}
	for (let i = 0; i < offset; i++) {
		const t = create("div", {
			innerHTML: `&nbsp;`,
			classList: ["calender-date-block", "unselectable"]
		});
		daytable.push(t);
	}
	for (let i = 0; i < getDays(year, month); i++) {
		const t = create("div", {

		});
		t.classList.add("calendar-date-block", "unselectable");
		t.innerHTML = i + 1;
		const filter = (a) => {
			return a.date.getDate() == i+1 && a.date.getMonth() == month && a.date.getFullYear() == year
		}
		if(appointments.filter(filter).length != 0) {
			t.dataset.appointment = "true"
		}
		t.dataset.valid = "true"
		daytable.push(t);
	}
	getElement("cal").textContent = "";
	getElement("cal").append(...daytable);
	

}
function datifyDay(i) {
	var suff = ["st", "nd", "rd", "th"];
	var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
	var suffix = suff[(Math.min(4, i.getDate()%10) - 1) % 4];
	if (i.getDate() >= 11 && i.getDate() <= 13) {
		suffix = "th";
	}
	return `${days[i.getDay()]}, ${months[i.getMonth()]} ${i.getDate()}${suffix} ${i.getFullYear()}`;
}

/**
 * Returns a date string
 * @param {Date} i Date object
 * @returns Parsed Date in the format [Month] [Day] [Year] 
 */
function datifyShort(i) {
	return `${monthnames[i.getMonth()]} ${getSuffix(i.getDate())} ${i.getFullYear()}`;
}

function datifyShortTime(i) {
	var suff = ["st", "nd", "rd", "th"];
	
	var suffix = getSuffix(i.getDate());
	if (i.getDate() >= 11 && i.getDate() <= 13) {
		suffix = "th";
	}
	return `${monthnames[i.getMonth()]} ${getSuffix(i.getDate())} ${i.getFullYear()}, ${("00" + i.getHours()).slice(-2)}:${("00" + i.getMinutes()).slice(-2)}`;
}
// END CALENDAR ///////////////////////////////////////////////////////////////////////////////
clockTick();

export { clockTick ,hourMinutes, dayMonthYear, dayMonthYearNoName, getSuffix, renderCalendar, initCalendar};
