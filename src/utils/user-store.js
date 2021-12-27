const { db } = require("../utils/mongodb");

class UserStore {
	constructor() {
		this.users = db.collection("users");
	}

	add(user) {
		return new Promise((resolve, reject) => {
			this.users.updateOne(
				{ id: user.id },
				{ $set: user },
				{ upsert: true },
				(err, docs) => {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}

					resolve(docs);
				}
			);
		});
	}

	setOnline(userId) {
		return new Promise((resolve, reject) => {
			this.users.updateOne(
				{ id: userId },
				{ $set: { status: "online" } },
				(err, result) => {
					if (err) {
						reject(err);
						console.error(err);
						return;
					}

					console.log(result);
					resolve(result);
				}
			);
		});
	}

	setOffline(userId) {
		return new Promise((resolve, reject) => {
			this.users.updateOne(
				{ id: userId },
				{ $set: { status: "offline" } },
				(err, result) => {
					if (err) {
						reject(err);
						console.error(err);
						return;
					}

					console.log(result);
					resolve(result);
				}
			);
		});
	}

	getUser(userId) {
		return new Promise((resolve, reject) => {
			this.users.findOne({ id: userId }, (err, result) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(result);
			});
		});
	}

	getUsers() {
		return new Promise((resolve, reject) => {
			this.users.find({}).toArray((err, result) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(result);
			});
		});
	}
}

module.exports = new UserStore();
