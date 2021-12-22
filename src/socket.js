module.exports = function (io) {
	io.use((socket, next) => {
		const user = socket.handshake.auth;
		if (!user) {
			return next(new Error("Invalid user"));
		}

		socket.user = user;
		next();
	});

	io.on("connection", (socket) => {
		console.log(`${socket.user.id} ${socket.user.username} connected`);
		socket.emit("users", getAllConnectedUsers(io));
		socket.broadcast.emit("user connected", socket.user);

		socket.on("private message", (message) => {
			const { to } = message;
			const toSockets = getUserSocket(io, to);
			toSockets.forEach((s) => s.emit("private message", message));
		});
	});
};

// Utils functions
function getAllConnectedUsers(io) {
	const users = [];

	for (let [_, socket] of io.of("/").sockets) {
		users.push(socket.user);
	}

	return users;
}

function getUserSocket(io, id) {
	const sockets = [];
	for (let [_, socket] of io.of("/").sockets) {
		if (socket.user.id === id) {
			sockets.push(socket);
		}
	}

	return sockets;
}
