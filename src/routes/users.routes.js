const express = require("express");
const { isGoogleTokenValid } = require("../utils/oauth");
const router = express.Router();
const userStore = require("../utils/user-store");

router.get("/", async (req, res) => {
	const isValid = await isGoogleTokenValid(
		req.headers.authorization.split(" ")[1]
	);

	if (!isValid) {
		next(new Error("Invalid token"));
	}

	const { search } = req.query;

	if (!search) {
		res.send([]);
		return;
	}

	const users = await userStore.findUsers(search);
	res.send(users);
});

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

module.exports = router;
