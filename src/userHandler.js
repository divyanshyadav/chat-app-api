const MessageStore = require("./utils/message-store");
const { log } = require("./utils/logger");
const UserStore = require("./utils/user-store");

const messageStore = new MessageStore();
const userStore = new UserStore();

module.exports = function registerUserHandlers(io, socket) {
	log(socket, "connected");
	userStore.add(socket.user);
	userStore.setOnline(socket.user.id);
	// Emit info
	socket.emit("users", userStore.getUsers());
	socket.emit("conversations", messageStore.getConversations(socket.user.id));
	socket.broadcast.emit("user connected", userStore.getUser(socket.user.id));

	// Listen for events
	socket.on("private message", onMessage);
	socket.on("disconnect", onDisconnect);

	function onDisconnect() {
		log(socket, "disconnected");
		userStore.setOffline(socket.user.id);
		socket.broadcast.emit("user disconnected", userStore.getUser(socket.user.id));
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
