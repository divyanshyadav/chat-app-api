function log(socket, message) {
	console.log(
		`${socket.id} ${socket.user.id} ${socket.user.username} ${message}`
	);
}

module.exports = {
	log,
};
