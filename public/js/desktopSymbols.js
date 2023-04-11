import { calculateGrid, makeSubMenuElement, getElement } from "./util.js";
function setupDesktopSymbols(list) {
	const symbols = list.symbols;
	
	for (let i = 0; i < symbols.length; i++) {
		const s = document.createElement("a");
		s.id = `desktop-symbol${i}`;
		s.classList.add("desktop-symbol");
		s.style.top = symbols[i].pos[0]
		s.style.left = symbols[i].pos[1];
		s.addEventListener("click", desktopSymbolClicked);
		s.symboltype = symbols[i].type;
		s.dataset.open = false;
		const icon = document.createElement("div");
		icon.id = `desktop-symbol-icon${i}`
		icon.classList.add("desktop-symbol-image");
		icon.style = `background-image: url('${symbols[i].image}')`;
		
		const name = document.createElement("div");
		name.id = `desktop-symbol-name${i}`;
		name.classList.add("desktop-symbol-text", "unselectable");
		name.textContent = symbols[i].name;
		
		s.append(icon, name);
		
		if (symbols[i].type == "link") {
			s.href = symbols[i].href;
			s.target = "_blank";
		} else if (symbols[i].type == "folder") {
			const sub = document.createElement("div");
			sub.classList.add("desktop-folder");
			sub.style = `grid-template-columns: repeat(${calculateGrid(symbols[i].sub.length)[1]},92px); grid-template-rows: repeat(${calculateGrid(symbols[i].sub.length)[0]},92px); `
			sub.id = `desktop-symbol-submenu${i}`
			for (let j = 0; j < symbols[i].sub.length; j++) {
				
				sub.appendChild(makeSubMenuElement(symbols[i].sub[j]));
			}
			
			s.appendChild(sub);
		}
		getElement("bodydiv").appendChild(s);
	}
}

function closeDesktopFolder(event, symbol) {
	getElement("startmenu").classList.add("hiddenstart");
	const id = event.target.id.match(/\d+/g)[0];
	getElement(`desktop-symbol-submenu${id}`).classList.remove("desktop-folder-open");
	getElement(`desktop-symbol${id}`).style["z-index"] = null;
	getElement(`desktop-symbol${id}`).dataset.open = false;
	getElement(`darken${id}`).remove()
}

function desktopSymbolClicked(event) {
	const id = event.target.id.match(/\d+/g)[0]
	const parent = getElement(`desktop-symbol${id}`)
	console.log(parent.dataset)
	getElement("startmenu").classList.add("hiddenstart");
	
	if (parent.symboltype == "folder" && parent.dataset.open == "false") {
		parent.dataset.open = true;
		const darken = document.createElement("div")
		darken.classList.add("folder-bg");
		getElement("bodydiv").appendChild(darken);
		getElement(`desktop-symbol-submenu${id}`).classList.add("desktop-folder-open");
		getElement(`desktop-symbol${id}`).style["z-index"] = 10;
		darken.id = `darken${id}`
		darken.addEventListener("click", (event) => {
			closeDesktopFolder(event, getElement(`desktop-symbol${id}`));
		})
	}
}

export {setupDesktopSymbols}