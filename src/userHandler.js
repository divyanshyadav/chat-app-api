const MessageStore = require("./utils/message-store");
const { log } = require("./utils/logger");
const UserStore = require("./utils/user-store");

const messageStore = new MessageStore();
const userStore = new UserStore();

module.exports = async function registerUserHandlers(io, socket) {
	log(socket, "connected");
	await userStore.add(socket.user);
	await userStore.setOnline(socket.user.id);
	// Emit info
	socket.emit("users", await userStore.getUsers());
	const unReachedMessages = await messageStore.getUnReachedMessages(
		socket.user.id
	);
	await messageStore.setReachedToUser(socket.user.id);
	socket.emit(
		"conversations",
		await messageStore.getConversations(socket.user.id)
	);

	unReachedMessages.forEach((m) => {
		const sockets = getUserSockets(m.from);
		sockets.forEach((s) =>
			s.emit("private message reached to user", { ...m, reachedToUser: true })
		);
	});

	socket.broadcast.emit(
		"user connected",
		await userStore.getUser(socket.user.id)
	);

	// Listen for events
	socket.on("private message", onMessage);
	socket.on("disconnect", onDisconnect);
	socket.on("private message reached to user", (message) => {
		messageStore.updateMessage(message);
		const fromSockets = getUserSockets(message.from);
		fromSockets.forEach((socket) => {
			socket.emit("private message reached to user", message);
		});
	});

	async function onDisconnect() {
		log(socket, "disconnected");
		await userStore.setOffline(socket.user.id);
		socket.broadcast.emit(
			"user disconnected",
			await userStore.getUser(socket.user.id)
		);
	}

	async function onMessage(message, callback) {
		const { to, from } = message;
		const toSockets = getUserSockets(to);
		const fromSockets = getUserSockets(from, socket);

		message.reachedToServer = true;
		await messageStore.addMessage(message);
		toSockets.forEach((s) => s.emit("private message", message));
		fromSockets.forEach((s) => s.emit("same private message", message));
		callback(message);
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
