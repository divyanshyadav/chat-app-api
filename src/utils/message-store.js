const { db } = require("../utils/mongodb");

class MessageStore {
	constructor() {
		this.messages = db.collection("messages");
	}

	addMessage(message) {
		return new Promise((resolve, reject) => {
			this.messages.insertOne(message, (err, result) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}

				console.log(result);
				resolve(result);
			});
		});
	}

	getMessages(userId) {
		return new Promise((resolve, reject) => {
			this.messages
				.find({ $or: [{ from: userId }, { to: userId }] })
				.toArray((err, docs) => {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}

					console.log(docs);
					resolve(docs);
				});
		});
	}

	async getConversations(userId) {
		const messages = await this.getMessages(userId);
		const conversations = {};

		messages.forEach((message) => {
			const { from, to } = message;
			const otherUserId = from === userId ? to : from;
			if (!conversations[otherUserId]) {
				conversations[otherUserId] = [];
			}

			conversations[otherUserId].push(message);
		});

		return conversations;
	}
}

module.exports = MessageStore;
