const MessageStore = require("./utils/message-store");
const { log } = require("./utils/logger");

const messageStore = new MessageStore();

module.exports = function registerUserHandlers(io, socket) {
	log(socket, "connected");

	// Emit info
	socket.emit("users", getAllConnectedUsers());
	socket.emit("conversations", messageStore.getConversations(socket.user.id));
	socket.broadcast.emit("user connected", socket.user);

	// Listen for events
	socket.on("private message", onMessage);
	socket.on("disconnect", onDisconnect);

	function onDisconnect() {
		log(socket, "disconnected");
		socket.broadcast.emit("user disconnected", socket.user);
	}

	function onMessage(message, callback) {
		const { to, from } = message;
		const toSockets = getUserSockets(to);
		const fromSockets = getUserSockets(from, socket);

		toSockets.forEach((s) => s.emit("private message", message));
		fromSockets.forEach((s) => s.emit("same private message", message));
		messageStore.addMessage(message);
		callback();
	}

	// Utils functions
	function getAllConnectedUsers() {
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

	function getUserSockets(id, excludeSocket) {
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
};
