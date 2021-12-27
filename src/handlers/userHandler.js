const { log } = require("../utils/logger");
const userStore = require("../utils/user-store");

module.exports = async function registerUserHandlers(io, socket) {
	log(socket, "connected");

	await userStore.setOnline(socket.user.id);

	socket.broadcast.emit(
		"user connected",
		await userStore.getUser(socket.user.id)
	);

	socket.on("disconnect", async function () {
		log(socket, "disconnected");
		await userStore.setOffline(socket.user.id);
		socket.broadcast.emit(
			"user disconnected",
			await userStore.getUser(socket.user.id)
		);
	});
};
