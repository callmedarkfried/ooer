import { getElement } from "./util.js";


function toggleSidebarLeft (event) {
    getElement("sidebar-left").dataset.open = (getElement("sidebar-left").dataset.open == "false")
}

function toggleSidebarRight (event) {
    getElement("sidebar-right").dataset.open = (getElement("sidebar-right").dataset.open == "false")
}


export {toggleSidebarLeft, toggleSidebarRight}