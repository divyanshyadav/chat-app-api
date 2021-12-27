const messageStore = require("../utils/message-store");
const { getUserSockets } = require("../utils/socketUtils");

module.exports = async function registerMessageHandlers(io, socket) {
	const unReachedMessages = await messageStore.getUnReachedMessages(
		socket.user.id
	);

	await messageStore.setReachedToUser(socket.user.id);

	unReachedMessages.forEach((m) => {
		const fromSockets = getUserSockets(io, m.from);
		const toSockets = getUserSockets(io, m.to);

		fromSockets.forEach((s) =>
			s.emit("private message reached to user", { ...m, reachedToUser: true })
		);

		toSockets.forEach((s) =>
			s.emit("update private message reached to user", {
				...m,
				reachedToUser: true,
			})
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
		fromSockets.forEach((s) => s.emit("update private message", message));
		callback(message);
	});

	socket.on("message seen by user", (m) => {
		const fromSockets = getUserSockets(io, m.from);
		const toSockets = getUserSockets(io, m.to);

		const updatedMessage = {
			...m,
			seenByUser: true,
		};

		messageStore.updateMessage(updatedMessage);

		toSockets.forEach((s) =>
			s.emit("update message seen by user", updatedMessage)
		);

		fromSockets.forEach((s) => s.emit("message seen by user", updatedMessage));
	});
};
