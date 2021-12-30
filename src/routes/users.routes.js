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
	const userDetails = {
		...user.profileObj,
		id: user.profileObj.googleId,
		username: user.profileObj.name,
		token: user.tokenId,
	};

	await userStore.add(userDetails);
	res.send(userDetails);
});

// router.get("/conversations/:id", async (req, res) => {
// 	const { id } = req.params;
// 	const conversations = await messageStore.getConversations(id);
// 	res.send(conversations);
// });

module.exports = router;
