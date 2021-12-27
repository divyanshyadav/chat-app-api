const { log } = require("../utils/logger");
const userStore = require("../utils/user-store");

module.exports = function registerUserHandlers(io, socket) {
	log(socket, "connected");

	socket.on("disconnect", async function () {
		log(socket, "disconnected");
		await userStore.setOffline(socket.user.id);
		socket.broadcast.emit(
			"user disconnected",
			await userStore.getUser(socket.user.id)
		);
	});

	userStore.setOnline(socket.user.id);

	setTimeout(async function () {
		socket.broadcast.emit(
			"user connected",
			await userStore.getUser(socket.user.id)
		);
	}, 0);
};
