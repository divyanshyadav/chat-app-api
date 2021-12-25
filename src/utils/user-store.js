const { db } = require("../utils/mongodb");

class UserStore {
	constructor() {
		this.users = db.collection("users");
	}

	add(user) {
		return new Promise((resolve, reject) => {
			this.users.findOne({ id: user.id }, (err, docs) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}

				if (docs !== null) {
					resolve(docs);
					return;
				}

				this.users.insertOne(user, (err, result) => {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}

					console.log(result);
					resolve(result);
				});
			});
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

module.exports = UserStore;
