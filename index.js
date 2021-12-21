const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = 3000 || process.env.PORT;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: { origin: "*" },
});

io.use((socket, next) => {
	const user = socket.handshake.auth;
	if (!user) {
		return next(new Error("Invalid user"));
	}

	socket.user = user;
	next();
});

io.on("connection", (socket) => {
	console.log(`${socket.user.username} connected`);
	socket.emit("users", getAllConnectedUsers());
	socket.broadcast.emit("user connected", socket.user);
});

app.use(
	cors({
		origin: "*",
	})
);

server.listen(PORT, () => {
	console.log(`Chat App is live on port ${PORT}`);
});

// Utils functions
function getAllConnectedUsers() {
	const users = [];

	for (let [_, socket] of io.of("/").sockets) {
		users.push(socket.user);
	}

	return users;
}
