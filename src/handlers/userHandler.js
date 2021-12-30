const { log } = require("../utils/logger");
const userStore = require("../utils/user-store");

module.exports = function registerUserHandlers(io, socket) {
	async function onUserDisconnect() {
		log(socket, "disconnected");
		await userStore.setOffline(socket.user.id);
		await userStore.setLastSeen(socket.user.id, new Date().getTime());
		socket.broadcast.emit(
			"user disconnect",
			await userStore.getUser(socket.user.id)
		);
	}

	async function onUserConnect() {
		log(socket, "connected");
		await userStore.setOnline(socket.user.id);
		socket.broadcast.emit(
			"user connect",
			await userStore.getUser(socket.user.id)
		);
	}

	socket.on("user connect", onUserConnect);
	socket.on("user disconnect", onUserDisconnect);
	socket.on("disconnect", onUserDisconnect);

	setTimeout(async () => {
		socket.emit("users", await userStore.getUsers());
	});
};
