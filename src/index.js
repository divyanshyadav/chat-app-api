const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const registerUserHandlers = require("./userHandler");

const PORT = process.env.PORT || 3000;

// Setup express
const app = express();
app.use(cors({ origin: "*" }));

// Setup socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.use((socket, next) => {
	const user = socket.handshake.auth;
	if (!user) {
		return next(new Error("Invalid user"));
	}

	socket.user = user;
	next();
});

io.on("connection", (socket) => {
	registerUserHandlers(io, socket);
});

app.get("/", (req, res) => {
	res.send("Chat server is running for dummies..");
});

server.listen(PORT, () => {
	console.log(`Chat App is live on port ${PORT}`);
});
