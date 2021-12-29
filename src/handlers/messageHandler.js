const messageStore = require("../utils/message-store");
const { getUserSockets } = require("../utils/socketUtils");

module.exports = function registerMessageHandlers(io, socket) {
	socket.on("message ack", async (message) => {
		await messageStore.updateMessage(message);
		const fromSockets = getUserSockets(io, message.from);
		fromSockets.forEach((socket) => {
			socket.emit("message ack", message);
		});
	});

	socket.on("message", async function (message, callback) {
		const { to, from } = message;
		const toSockets = getUserSockets(io, to);
		const fromSockets = getUserSockets(io, from, socket);

		message.reachedToServer = true;
		await messageStore.addMessage(message);
		toSockets.forEach((s) => s.emit("message", message));
		fromSockets.forEach((s) => s.emit("add/update message", message));
		callback(message);
	});

	socket.on("message seen", async function (message) {
		message.seenByUser = true;
		await messageStore.updateMessage(message);
		getUserSockets(io, message.from).forEach((s) =>
			s.emit("message seen", message)
		);
	});

	messageStore.getUnReachedMessages(socket.user.id).then((messages) => {
		messages.forEach(async (message) => {
			message.seenByUser = true;
			await messageStore.updateMessage(message);
			getAllSockets(io, message).forEach((s) => s.emit("message seen", message));
		});
	});

	// messageStore.setReachedToUser(socket.user.id);
};

function getAllSockets(io, message) {
	const { to, from } = message;
	const toSockets = getUserSockets(io, to);
	const fromSockets = getUserSockets(io, from);

	return [...toSockets, ...fromSockets];
}
