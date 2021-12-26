const MessageStore = require("../utils/message-store");
const { log } = require("../utils/logger");
const UserStore = require("../utils/user-store");

const userStore = new UserStore();

module.exports = async function registerUserHandlers(io, socket) {
	log(socket, "connected");

	await userStore.add(socket.user);
	await userStore.setOnline(socket.user.id);

	socket.emit("users", await userStore.getUsers());
	socket.broadcast.emit(
		"user connected",
		await userStore.getUser(socket.user.id)
	);

	socket.on("private message", onMessage);
	socket.on("disconnect", async function () {
		log(socket, "disconnected");
		await userStore.setOffline(socket.user.id);
		socket.broadcast.emit(
			"user disconnected",
			await userStore.getUser(socket.user.id)
		);
	});
};
