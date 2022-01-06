const express = require("express");
const { isGoogleTokenValid } = require("../utils/oauth");
const router = express.Router();
const userStore = require("../utils/user-store");

router.get("/", async (req, res, next) => {
	const token =
		req.headers.authorization && req.headers.authorization.split(" ")[1];
	const isValid = await isGoogleTokenValid(token);

	if (!isValid) {
		next(new Error("Invalid token"));
	}

	const { search } = req.query;

	if (!search) {
		res.send([]);
		return;
	}

	try {
		let users = await userStore.findUsers(search, 5);
		res.send(users);
	} catch (e) {
		next(e);
	}
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
