const MessageStore = require("../utils/message-store");
const { getUserSockets } = require("../utils/socketUtils");

const messageStore = new MessageStore();

module.exports = async function registerMessageHandlers(io, socket) {
	const unReachedMessages = await messageStore.getUnReachedMessages(
		socket.user.id
	);

	await messageStore.setReachedToUser(socket.user.id);

	socket.emit(
		"conversations",
		await messageStore.getConversations(socket.user.id)
	);

	unReachedMessages.forEach((m) => {
		const sockets = getUserSockets(io, m.from);
		sockets.forEach((s) =>
			s.emit("private message reached to user", { ...m, reachedToUser: true })
		);
	});

	socket.on("private message reached to user", (message) => {
		messageStore.updateMessage(message);
		const fromSockets = getUserSockets(io, message.from);
		fromSockets.forEach((socket) => {
			socket.emit("private message reached to user", message);
		});
	});

	socket.on("private message", async function (message, callback) {
		const { to, from } = message;
		const toSockets = getUserSockets(io, to);
		const fromSockets = getUserSockets(io, from, socket);

		message.reachedToServer = true;
		await messageStore.addMessage(message);
		toSockets.forEach((s) => s.emit("private message", message));
		fromSockets.forEach((s) => s.emit("same private message", message));
		callback(message);
	});
};
