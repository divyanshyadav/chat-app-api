const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const setupSocket = require("./socket");

const PORT = 3000 || process.env.PORT;

// Setup express
const app = express();
app.use(cors({ origin: "*" }));

// Setup socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
setupSocket(io);

server.listen(PORT, () => {
	console.log(`Chat App is live on port ${PORT}`);
});
