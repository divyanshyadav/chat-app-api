require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const usersRouter = require("./routes/users.routes");
const registerUserHandlers = require("./handlers/userHandler");
const registerMessageHandlers = require("./handlers/messageHandler");
const { client } = require("./utils/mongodb");
const { isGoogleTokenValid } = require("./utils/oauth");

const PORT = process.env.PORT || 3000;

// Setup express
const app = express();
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// Setup socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.use(async (socket, next) => {
	const user = socket.handshake.auth;
	const isValid = await isGoogleTokenValid(user.token);

	if (!isValid) {
		next(new Error("Invalid token"));
	}

	socket.user = user;
	next();
});

io.on("connection", (socket) => {
	registerUserHandlers(io, socket);
	registerMessageHandlers(io, socket);
});

app.get("/", (req, res) => {
	res.send("Chat server is running for dummies..");
});

app.use("/users", usersRouter);

client.connect((err) => {
	if (err) {
		console.error(err);
		return;
	}

	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
});
