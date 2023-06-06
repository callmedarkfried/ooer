/**
 * @file main.js
 * @author Smittel
 * @name Server
 * @description I really dont feel like documenting this rn, any questions hmu
 */

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require("fs");
const Terminal = require("./terminal.js")
app.use(express.static('public'));
let notes = JSON.parse(fs.readFileSync("./data/notes.json").toString())

//PASSWORDS ARE TEMPORARY AND TO BE REPLACED WITH AN ENCRYPTED VERSION
// WHOLE THING NEEDS REWORKING
// A DATABASE SHOULD DO THE TRICK

/*
Need:
object holding the sessions of logged in users
*/
let activeUsers = {
	__id: {socket: "socket", lastActivity: "datetime"}
}


let friends = {
	
}
const letters = (() => {
	const caps = [...Array(26)].map((val, i) => String.fromCharCode(i + 65));
	return caps.concat(caps.map(letter => letter.toLowerCase())).concat([0,1,2,3,4,5,6,7,8,9]);
})();

let tokens = [];

function tokenGenerator(username) {
	let currTime = Date.now();
	let expiretime = currTime - (30 * 60 * 1000); // Cookies expire after 30 minutes.
	// console.log(new Date(expiretime).toUTCString())
	const characters = letters;
	let token = "";
	for (let  i = 0; i < 128; i++) { // 128 is maybe a bit excessive
		token += characters[Math.floor(Math.random() * characters.length)]
	}
	
	return {
		token: token,
		expires: expiretime
	}
}

const desktopSymbols = JSON.parse(fs.readFileSync("./data/desktop_symbols.json").toString())


let settingsOBJ = JSON.parse(fs.readFileSync("./data/available_settings.json").toString())

let users = JSON.parse(fs.readFileSync("./data/users.json").toString()).users


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get("/content/images", (req, res) => {
	res.sendFile(__dirname + "/content/images/" + req.query.i)
}) 

io.on('connection', (socket) => {
	setTimeout(() => {
		socket.emit("desktop_symbols", desktopSymbols);
	}, 100);
	
	
  
  // Setinterval 1s heartbeat, serves as driver for client clock
  // used to detect lost connection clientside
  
  
	function heartbeat () {
		socket.emit("heartbeat", "");
	}
	let hb = setInterval(heartbeat, 1000);
	socket.on("disconnect", ()=>{clearInterval(hb)});

	socket.on("auth", (msg) => {
	let cookie = msg.cookie.split("; ").map((a)=>a.split("="));
	let cookieOBJ = {}
	for (let c of cookie) {
		cookieOBJ[c[0]] = c[1]
	}

	if (tokens.filter((a)=>a.token == cookieOBJ.token).length >= 1) {
		tokens = tokens.filter((a)=>a.username != cookieOBJ.username); // Prevent duplicate cookies
		let t = users.filter((u) => u.username == cookieOBJ.username); // Get user info
		const generated = tokenGenerator(cookieOBJ.username)
		socket.emit("init", {
			username: t[0].username,
			handle: t[0].handle,
			nickname: t[0].nickname,
			notes: grabNotes(t[0].id),
			friends: friends[t[0].id],
			id: t[0].id,
			profilePicture: "/content/images?i=default.jpg",
			token: generated.token,
			expires: generated.expires
		})
		tokens.push({username: t[0].username, token: generated.token, expires: generated.expires})
		
	}


	})

	// socket.emit("add_dynscript", {js: "alert('test')"})
	socket.on('login', (msg) => {
		let t = users.filter((u) => u.username == msg.username)
		
		if (t.length == 0) {
			socket.emit("wrong_pw", "");
			return;
		}
		if (msg.password == t[0].password) {
		let generated = tokenGenerator(msg.username);
		tokens.push({username: msg.username, token: generated.token, expires: generated.expires})
		
		socket.emit("init", {
			username: t[0].username,
			handle: t[0].handle,
			nickname: t[0].nickname,
			notes: grabNotes(t[0].id),
			friends: friends[t[0].id],
			id: t[0].id,
			profilePicture: "/content/images?i=default.jpg",
			token: generated.token,
			expires: generated.expires
		})
			setTimeout(function () {
				
			socket.emit("notification", {
				title: "Login successful",
				image: "/content/images?i=default.jpg",
				description: "You successfully logged in. Congratulations on being capable of doing basic tasks, proud of ya, bozo",
				clickEvent: {}
			})
			}, 200);
		} else {
			socket.emit("wrong_pw", "");
		}
	});

	socket.on('delete_note', (msg) => {
		deleteNote(msg.user, msg.index); //user is token
	})
	socket.on("add_note", (msg) => {
		// ALL USER RELATED STUFF NEEDS TO USE THE ACCORDING SESSION TOKEN!!!
		addNote(msg.user, msg.note);
	})
	socket.on("request_page", (msg) => {
	serveSubpage(msg, socket);
	});
	socket.on("request_settings", (msg) => {
	serveSettings(msg, socket);
	});
	socket.on("terminal_req", (msg) => {
	let response = terminal(msg, socket);
	socket.emit("terminal_res", response)
	});
	socket.on("logout", (msg) => {
	let cookie = msg.cookie.split("; ").map((a)=>a.split("="));
	let cookieOBJ = {}
	for (let c of cookie) {
		cookieOBJ[c[0]] = c[1]
	}
	tokens = tokens.filter((a) => a.token != cookieOBJ.token)
		socket.emit("logout_confirm","")
		socket.emit("notification", {
				title: "Logout successful",
				image: "/content/images?i=default.jpg",
				description: "Well fuck off then, i dont care.",
				clickEvent: {}
			})
	})
	socket.on("req_subsettings", (msg) => {
		reqSettingsSub(socket, msg); 
	});
	socket.on("request_subsettings", (msg) => {
		socket.emit("return_subsettings", {data: grabsettings(msg), id: msg.id, category: msg.req})
	});
	socket.on("update_settings", (msg) => {
		/*
		{
			token: token,
			settings: {
				changesSettingName: newvalue
			}
		}
		*/
	})
	socket.on("outgoing_friendrequest", (data) => {
		const exampledata = {
			sendingUser: {things: "such as token, username etc"},
			recipient: "username"
		}
	})
});

function terminal({cmd, fp, id}, socket) {
	
	let commandTokens = cmd.split(" ");
	switch (commandTokens[0]) {
		case "cd":
		case "chdir":
			return Terminal.cd(commandTokens, fp, id);
		case "say":
		case "echo":
		case "print":
			return Terminal.echo(commandTokens, fp, id);
		case "clear":
		case "cls":
			return Terminal.clear(commandTokens, fp, id);
		case "cmd":
			serveSubpage({requested: "terminal"}, socket) ;
			return {res: "",fp: fp, id: id}
		case "ls":
			return Terminal.ls(commandTokens, fp, id);
		case "":
			return {res:"", fp:fp, id: id}
		default:
			return Terminal.help(null, fp, id);
	}
}

function reqSettingsSub(socket, msg) {
	const html = fs.readFileSync(`./html/settings/${msg.query.split("_")[1]}.html`).toString();
	socket.emit("sub_settings", {html: html, id: msg.id});
}

function serveSettings(msg, socket) {
	const sub = msg.page!=undefined?msg.page:"appearance"
	const js = undefined;// `alert("ooo");`
	socket.emit("add_window", {
		title: "Settings",
		"html":fs.readFileSync("./settings.html").toString(),
		icon: "/content/images?i=settings.png",
		windowClass: "settingswindow",
		selected: sub,
		js: js,
		command: `RequestSetting:${sub};`
	});
	let reqS = msg.requested || "appearance";
	
}

function deleteNote(user, index) {
	if (!notes[user] || notes[user].length == 0) return;
	let newNoteList = [];
	for (let i = 0; i < notes[user].length; i++) {
		if (i != index) {
			newNoteList.push(notes[user][i]);
		}
	}
	
	notes[user] = newNoteList;
	
}

function addNote(user, note) {
	
	notes[user] = notes[user] || [];
	
	
	notes[user].push(note);
}

function grabUsername(token) {
return users[token].username
}

function grabNotes(username) {
	return notes[username]
}


function serveSubpage({requested}, socket) {
	switch(requested) {
		case "terminal":
			let js = fs.readFileSync("./terminal/terminal.js").toString()
			socket.emit("add_window", {title: "Terminal", "html":fs.readFileSync("./terminal/terminal.html").toString(), icon: "/content/images?i=utilities-terminal-icon.png", js: js, width: "800px", height: "480px"});
			break;
	}
}

function grabsettings(data) {
	if (data.type == "category") {
		return settingsOBJ[data.req]
	} else if (data.type == "search") {
		// Filter the object to find the settings.
		// still needs a search field in the settings menu...
	}
}

function serveTerminal(msg, socket) {
	
}

server.listen(8080, () => {
  console.log('listening on *:8080');
});