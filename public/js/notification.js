function notification (msg) {
	const card = document.createElement("div")
	const cardTitle = document.createElement("div");
	const cardPicture = document.createElement("div");
	const cardDesc = document.createElement("div");
	const cardText = document.createElement("div");
	let exampleNotification = {
		"title": "NOTIFICATION TITLE",
		"image": "imageurl",
		"description": "description", 
		"clickEvent": {}
	}
	
	card.classList.add("notification-popup","notification-popup-hidden","unselectable", "no-border", "block", "fixed");
	card.id = "notification";
	
	cardTitle.classList.add("notification-popup-title", "relative", "block", "font-24");
	cardTitle.innerHTML = msg.title;
	
	cardPicture.classList.add("notification-image", "absolute");
	cardPicture.style= "background-image: url('" + msg.image + "');";
	
	cardDesc.classList.add("notification-desc", "relative");
	cardDesc.innerHTML = msg.description;
	
	cardText.classList.add("notification-text", "relative", "inline-block");
	
	
	cardText.append(cardTitle, cardDesc)
	card.append(cardPicture, cardText)
	
	
	
	bodydiv.appendChild(card)
	
	card.classList.remove("notification-popup-hidden");
	setTimeout(function () {
		card.classList.add("notification-popup-hidden");
		setTimeout(function () {
			card.remove();
		}, 200);
	}, 4200)
}

export {notification}