import { calculateGrid, makeSubMenuElement, getElement, create, closeStartMenu } from "./util.js";
/**
 * @file desktopSymbols.js
 * @author Smittel
 */

/**
 * Methods relating to the Desktop symbols
 * Currently debating if creation of desktop symbols should be exposed and be able to be done purely clientside or if it should go through the server first
 * @todo Place symbols in grid
 * @todo movable symbols
 * @todo Context menus
 * @todo hiding symbols
 * @todo choosing which ones are shown (to a degree)
 * @module DesktopSymbol
 */
/**
 * Sets up desktop symbols.
 * @listens socket.on("desktop_symbols")
 * @memberof module:DesktopSymbol
 * @todo Find another solution
 * @param {Object[]} symbols List of Desktop symbols received by the server
 * @param {string[]} symbols[].pos Position of the symbol
 * @param {string} symbols[].image Icon URL
 * @param {("folder"|"link"|"page")} symbols[].type Type of desktop symbol, defines the action on click
 * @param {Object[]} [symbols[].sub] Semi-optional: when <code>symbols.type == "folder"</code> used to define the elements of the sub menu
 * @param {string} symbols[].sub[].image URL for sub menu element icon
 * @param {string} symbols[].sub[].name Name of the sub menu element
 * @param {("internal" | "external")} symbols[].sub[].type
 */
function setupDesktopSymbols({symbols}) {
	for (let i = 0; i < symbols.length; i++) {
		const s = makeSymbol(symbols[i]);
		const icon = makeIcon(symbols[i]);
		const name = makeTextField(symbols[i]);
		s.append(icon, name);
		switch (symbols[i].type) {
			case "link":
				setupLinkSymbol(s, symbols[i]);
				break;
			case "folder":
				setupFolderSymbol(s, symbols[i]);
				break;
			case "page":
				setupPageSymbol(s, symbols[i]);
				break;
			default:
		}
		getElement("bodydiv").appendChild(s);
	}
}

/**
 * Sets up a desktop symbol <code>s</code> such that it requests a page from the server to be displayed in a window.
 * @param {HTMLElement} s 
 * @param {string} {data} "<code>data</code>" attribute from the <code>symbols</code> Object 
 * @memberof module:DesktopSymbol
 */
function setupPageSymbol(s, {data}) {
	s.addEventListener("mouseup", (event) => {socket.emit("request_page", {requested: data})})
}

/**
 * Sets up a desktop symbol <code>s</code> so that it opens a new tab with an external link.
 * @param {HTMLElement} s 
 * @param {string} {data} "<code>data</code>" attribute from the <code>symbols</code> Object 
 * @memberof module:DesktopSymbol
 */
function setupLinkSymbol(s, {data}) {
	s.href = data;
	s.target = "_blank";
	s.addEventListener("mouseup", (event) => {window.open(data, '_blank').focus()})
}

/**
 * Sets up a desktop symbol <code>s</code> as a folder.
 * @param {HTMLElement} s 
 * @param {Object[]} {sub} "<code>sub</code>" attribute from the <code>symbols</code> Object 
 * @param {string} {sub}[].image URL for sub menu element icon
 * @param {string} {sub}[].name Name of the sub menu element
 * @param {("internal" | "external")} {sub}[].type 
 * @memberof module:DesktopSymbol
 */
function setupFolderSymbol(s, {sub}) {
	let submenu = [];
	for (let j = 0; j < sub.length; j++) {
		submenu.push(makeSubMenuElement(sub[j]));
	}
	
	const elmnt = create("div", {
		classList: ["desktop-folder"],
		style: `grid-template-columns: repeat(${calculateGrid(sub.length)[1]},92px); grid-template-rows: repeat(${calculateGrid(sub.length)[0]},92px); `,
		name: "desktop-symbol-submenu",
		childElements: submenu
	});
	s.appendChild(elmnt);
}

/**
 * Creates the text field for a desktop symbol
 * @param {string} {name} "<code>name</code>" attribute from the <code>symbols</code> Object 
 * @returns {HTMLDivElement}
 */
function makeTextField({name}) {
	const textfield = create("div", {
		classList: ["desktop-symbol-text", "unselectable"],
		textContent: name
	});
	return textfield;
}

/**
 * Creates the icon for a desktop symbol. The table is slightly scuffed but oh well
 * @param {string[]} {pos "<code>pos</code>" attributes from the <code>symbols</code> Object
 * @param {("folder" | "page" | "link")} type} "<code>type</code>" attributes from the <code>symbols</code> Object 
 * @returns {HTMLElement}
 */
function makeSymbol ({pos, type}) {
	const s = create("desktop-symbol",{
		classList: "desktop-symbol",
		style: {
			top: pos[0],
			left: pos[1]
		},
		eventListener: {click: desktopSymbolClicked},
		dataset: {
			symboltype: type,
			open: false
		}
	});
	return s;
}
/**
 * 
 * @param {string} {image} Image URL for desktop symbol icon ("<code>image</code>" attribute from the <code>symbols</code> Object)
 * @returns {HTMLDivElement}
 */
function makeIcon ({image}) {
	const icon = create("div", {
		classList: ["desktop-symbol-image"],
		style: `background-image: url('${image}')`
	});
	return icon;
}

/**
 * Closes the small sub menus for desktop folders.
 * @function
 * @listens click
 * @memberof module:DesktopSymbol
 * @param {MouseEvent} event 
 * @param {HTMLElement} symbol Main "container" of a desktop symbol
 * @param {HTMLDivElement} submenu Submenu of a desktop symbol
 * @param {HTMLDivElement} darken Background of a desktop symbol
 */
function closeDesktopFolder(event, submenu, symbol, darken) {
	closeStartMenu();
	submenu.classList.remove("desktop-folder-open");
	symbol.style["z-index"] = null;
	symbol.dataset.open = false;
	darken.remove()
}

/**
 * Listens for clicks on desktop symbols and either opens the submenu or the window.
 * @listens click
 * @param {event} event 
 * @memberof module:DesktopSymbol
 */
function desktopSymbolClicked(event) {
	let parent = event.target;
	while (parent.tagName != "DESKTOP-SYMBOL") {
		parent = parent.parentNode
	}
	closeStartMenu();
	if (parent.dataset.symboltype == "folder" && parent.dataset.open == "false") {
		let submenu;
		for (let x of Array.from(parent.childNodes)) {
			if (x.name == "desktop-symbol-submenu") submenu = x;
		}
		parent.dataset.open = true;
		const darken = create("div", {
			classList: ["folder-bg"],
			id: "submenu-darken",
			eventListener: {click: (e)=>{closeDesktopFolder(e, submenu, parent, darken)}}
		})
		getElement("bodydiv").appendChild(darken);
		submenu.classList.add("desktop-folder-open");
		parent.style["z-index"] = 10;
	}
}

export {setupDesktopSymbols}