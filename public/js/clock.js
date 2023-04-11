
import { getElement } from "./util.js";
const monthnames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const daysShort = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "So"]
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

// CALENDAR ///////////////////////////////////////////////////////////////////////////////
const getDays = (year, month) => {
    return new Date(year, month+1, 0).getDate();
};


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
	console.log("selectedMonth, selectedYear")
	renderCalendar(selectedMonth, selectedYear);
}

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
		const t = document.createElement("div");
		t.innerHTML = `<b>${daysShort[i]}</b>`;
		t.classList.add("calendar-date-block");
		daytable.push(t);
	}
	for (let i = 0; i < offset; i++) {
		const t = document.createElement("div");
		t.classList.add("calendar-date-block");
		t.innerHTML = "&nbsp;";
		daytable.push(t);
	}
	for (let i = 0; i < getDays(year, month); i++) {
		const t = document.createElement("div");
		t.classList.add("calendar-date-block");
		t.innerHTML = i + 1
		daytable.push(t);
	}

	// var table = "";
	
	// 	table += "<tr>"
	// 	for (let j = 0; j < 7; j++) {
	// 		var check = new Date(year, month, i*7 + j - offset);
	// 		table += `<td class="tableElementCal ${appointments.find(search => search.date.getTime() === check.getTime()) !== undefined?"appointment":""}">${dateArray[i*7 + j] || ""}</td>`
	// 	}
	// 	table += "</tr>"
	// }
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

function datifyShort(i) {
	var suff = ["st", "nd", "rd", "th"];
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	
	var suffix = suff[(Math.min(4, i.getDate()%10) - 1) % 4];
	if (i.getDate() >= 11 && i.getDate() <= 13) {
		suffix = "th";
	}
	return `${months[i.getMonth()]} ${i.getDate()}${suffix} ${i.getFullYear()}`;
}

function datifyShortTime(i) {
	var suff = ["st", "nd", "rd", "th"];
	
	var suffix = getSuffix(i.getDate());
	if (i.getDate() >= 11 && i.getDate() <= 13) {
		suffix = "th";
	}
	return `${monthnames[i.getMonth()]} ${i.getDate()}${suffix} ${i.getFullYear()}, ${("00" + i.getHours()).slice(-2)}:${("00" + i.getMinutes()).slice(-2)}`;
}
// END CALENDAR ///////////////////////////////////////////////////////////////////////////////
clockTick();

export { clockTick ,hourMinutes, dayMonthYear, dayMonthYearNoName, getSuffix, renderCalendar, initCalendar};
