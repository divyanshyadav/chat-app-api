const MessageStore = require("./utils/message-store");
const { log } = require("./utils/logger");

const messageStore = new MessageStore();
module.exports = function (io) {
	io.use((socket, next) => {
		const user = socket.handshake.auth;
		if (!user) {
			return next(new Error("Invalid user"));
		}

		socket.user = user;
		next();
	});

	io.on("connection", (socket) => {
		log(socket, "connected");

		socket.emit("users", getAllConnectedUsers(io));
		socket.emit("conversations", messageStore.getConversations(socket.user.id));

		socket.broadcast.emit("user connected", socket.user);

		socket.on("private message", (message, fn) => {
			const { to, from } = message;
			const toSockets = getUserSockets(io, to);
			const fromSockets = getUserSockets(io, from, socket);

			toSockets.forEach((s) => s.emit("private message", message));
			fromSockets.forEach((s) => s.emit("same private message", message));
			messageStore.addMessage(message);
			fn();
		});

		socket.on("user disconnected", (user) => {
			log(socket, "disconnected");
			socket.broadcast.emit("user disconnected", user);
		});

		socket.on("disconnect", () => {
			log(socket, "disconnected");
			socket.broadcast.emit("user disconnected", socket.user);
		});
	});
};

// Utils functions
function getAllConnectedUsers(io) {
	const users = [];
	const set = new Set();

	for (let [_, socket] of io.of("/").sockets) {
		if (!set.has(socket.user.id)) {
			users.push(socket.user);
			set.add(socket.user.id);
		}
	}

	return users;
}

function getUserSockets(io, id, excludeSocket) {
	const sockets = [];
	for (let [_, socket] of io.of("/").sockets) {
		if (socket === excludeSocket) {
			continue;
		}

		if (socket.user.id === id) {
			sockets.push(socket);
		}
	}

	return sockets;
}
