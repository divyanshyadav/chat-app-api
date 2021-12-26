function getUserSockets(io, id, excludeSocket) {
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

module.exports = {
	getUserSockets,
};
