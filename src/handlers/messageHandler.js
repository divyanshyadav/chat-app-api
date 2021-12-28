const messageStore = require("../utils/message-store");
const { getUserSockets } = require("../utils/socketUtils");

module.exports = function registerMessageHandlers(io, socket) {
	socket.on("private message reached to user", (message) => {
		messageStore.updateMessage(message);
		const fromSockets = getUserSockets(io, message.from);
		fromSockets.forEach((socket) => {
			socket.emit("private message reached to user", message);
		});
	});

	socket.on("private message", async function (message, callback) {
		console.log(message);
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

	messageStore.getUnReachedMessages(socket.user.id).then((messages) => {
		messages.forEach(async (message) => {
			// const fromSockets = getUserSockets(io, m.from);
			// const toSockets = getUserSockets(io, m.to);

			// fromSockets.forEach((s) =>
			// 	s.emit("private message reached to user", { ...m, reachedToUser: true })
			// );

			// toSockets.forEach((s) =>
			// 	s.emit("update private message reached to user", {
			// 		...m,
			// 		reachedToUser: true,
			// 	})
			// );
			const { to, from } = message;
			const toSockets = getUserSockets(io, to);
			const fromSockets = getUserSockets(io, from, socket);

			message.reachedToServer = true;
			await messageStore.updateMessage(message);
			toSockets.forEach((s) => s.emit("private message", message));
			fromSockets.forEach((s) => s.emit("update private message again", message));
		});
	});

	messageStore.setReachedToUser(socket.user.id);
};
