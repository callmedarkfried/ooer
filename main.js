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
let notes = {
	"test": [{"d": 0, "t": "testoman"},{"d": 10000, "t":"another"}]
}

//PASSWORDS ARE TEMPORARY AND TO BE REPLACED WITH AN ENCRYPTED VERSION
// WHOLE THING NEEDS REWORKING
// A DATABASE SHOULD DO THE TRICK

let friends = {
	
}

const desktopSymbols = {
		symbols: [
		{
			pos: ["calc(50% - 10vmin)","calc(50% - 10vmin"],
			image: "/content/images?i=folder-blender.png",
			type: "folder",
			name: "Blender",
			data: null, // null for folders
			sub: [
				{
					image: "",
					name: "text",
					type: "internal",
					data: "request"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				}
			]
		},{
			pos: ["calc(50% - 15vmin)","calc(50% - 60vmin"],
			image: "/content/images?i=github-logo.png",
			type: "folder",
			name: "Test",
			data: null,
			sub: [
				{
					image: "",
					name: "text",
					type: "internal",
					data: "request"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				},{
					image: "",
					name: "text",
					type: "external",
					data: "link"
				}
			]
		},{
			pos: ["calc(50% - 15vmin)","calc(50% - 40vmin"],
			image: "/content/images?i=logo.png",
			type: "page",
			name: "Terminal",
			data: "terminal", //identifier of application or page to request from server
		},{
			pos: ["calc(50% - 15vmin)","calc(50% - 20vmin"],
			image: "/content/images?i=youtube.png",
			type: "link",
			name: "Blender",
			data: "url", //url for links (external)
		}
	]
	}


let users = [
	{
		id: "id",
		password: "password",
		username: "username",
		handle: "0000", //4 digit number like discord
		nickname: "nickname",
		settings: {
			some: "settings"
		},
		email: "email@example.com",
		verified: true,
		registered_since: 0,
	},
	{
		id: "test",
		password: "test",
		username: "test_user",
		handle: "0909",
		nickname: "for testing",
		settings: {
			
		},
		email: "test@example.com",
		verified: true,
		registered_since: 0,
	}
]


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
	
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  
  // Setinterval 1s heartbeat, serves as driver for client clock
  // used to detect lost connection clientside
  
  
  function heartbeat () {
	  socket.emit("heartbeat", "");
  }
  let hb = setInterval(heartbeat, 1000);
  socket.on("disconnect", ()=>{clearInterval(hb)});
  
  
  
  // socket.emit("add_dynscript", {js: "alert('test')"})
  socket.on('login', (msg) => {
	
	  let t = users.filter((u) => u.username == msg.username)
		  
	  if (t.length == 0) {
		  socket.emit("wrong_pw", "");
		  return;
	  }
	 if (msg.password == t[0].password) {
		 
		  socket.emit("init", {
			  username: t[0].username,
			  handle: t[0].handle,
			  nickname: t[0].nickname,
			  notes: grabNotes(t[0].id),
			  friends: friends[t[0].id],
			  id: t[0].id,
			  profilePicture: "/content/images?i=default.jpg"
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
	const sub = msg.page || "settings_appearance"
	const html = fs.readFileSync(`./html/settings/${sub.split("_")[1]}.html`).toString();
	const js = undefined;// `alert("ooo");`
	socket.emit("add_window", {title: "Settings", "html":fs.readFileSync("./settings.html").toString(), icon: "/content/images?i=settings.png", windowClass: "settingswindow", selected: sub, subhtml: html, js: js});
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
			socket.emit("add_window", {title: "Terminal", "html":fs.readFileSync("./terminal/terminal.html").toString(), icon: "/content/images?i=settings.png", js: js, width: "800px", height: "480px"});
			break;
	}
}

function serveTerminal(msg, socket) {
	
}

server.listen(8080, () => {
  console.log('listening on *:8080');
});