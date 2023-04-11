let textareafocus = false;
function searchAreaHandler(event) {
	if (!textareafocus) {
		if (searchbar.classList.contains("hiddensearch")) {
			searchbar.classList.remove("hiddensearch")
			searchbar.focus();
			textareafocus = true;
		} else {
			searchbar.classList.add("hiddensearch")
			textareafocus = false;
		}
	}
}

export {searchAreaHandler}