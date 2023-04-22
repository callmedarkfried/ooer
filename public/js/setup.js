import { getElement, create } from "./util.js";
import * as Handler from "./handlermodule.js"

function setupSidebarLeft() {
    const container = create("div", {
        id: "sidebar-left",
        dataset: {
            open: "false"
        },
        classList: ["sidebar", "left"]
    });

    const title = create("span", {
        innerHTML: "Welcome!",
        classList: ["sidebar-title", "unselectable"]
    })

    const close = create("a", {
        id: "close-sidebar-left",
        innerHTML: "✖",
        classList: ["abort-button", "unselectable"],
        eventListener: {"mouseup": Handler.toggleSidebarLeft}
    })

    const sidebarMainbody = create("div", {
        id: "sidebar-container-left",
        classList: ["sidebar-container"]
    })

    const notifications = create("div", {
        id: "sidebar-notifications",
        classList: ["sidebar-notification-container"],
        innerHTML: "Notifications"
    })

    const widgetContainer = create("div", {
        classList: ["sidebar-widget-container"]
    }) 

    let widgets = [];
    for (let i = 1; i <= 8; i++) {
        widgets.push(create("div", {
            classList: ["sidebar-widget", `div${i}`]
        }))
    }
    widgets[5].id = "calculator";
    widgets[5].classList.add("calculator");
    //Temporary measure, widgets will soon be implemented properly
    widgets[5].innerHTML = `<div class="calculator-screen"><div class="calculator-recent">5409 - 1957</div><div class="calculator-result">3452</div></div>`

    const opener = create("a", {
        id: "sidebar-left-opener",
        classList: ["sidebar-opener", "left"],
        textContent: ">",
        eventListener: {"click": Handler.toggleSidebarLeft}
    })
    widgetContainer.append(...widgets)
    sidebarMainbody.append(notifications, widgetContainer);
    container.append(title, close, sidebarMainbody);
    getElement("bodydiv").append(container, opener)
}

export {setupSidebarLeft}