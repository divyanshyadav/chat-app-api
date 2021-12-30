const express = require("express");
const router = express.Router();
const userStore = require("../utils/user-store");
const messageStore = require("../utils/message-store");

// router.get("/", async (req, res) => {
// 	const users = await userStore.getUsers();
// 	res.send(users);
// });

router.post("/login", async (req, res) => {
	const user = req.body;
	user.profileObj.id = user.profileObj.googleId;
	user.profileObj.username = user.profileObj.name;
	await userStore.add(user.profileObj);
	res.send(user.profileObj);
});

// router.get("/conversations/:id", async (req, res) => {
// 	const { id } = req.params;
// 	const conversations = await messageStore.getConversations(id);
// 	res.send(conversations);
// });

module.exports = router;
