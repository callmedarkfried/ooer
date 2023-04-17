import { getElement } from "./util.js";


function toggleSidebarLeft (event) {
    getElement("sidebar-left").dataset.open = (getElement("sidebar-left").dataset.open == "false")
}


export {toggleSidebarLeft}