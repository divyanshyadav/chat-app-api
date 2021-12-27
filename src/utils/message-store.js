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

				resolve(result);
			});
		});
	}

	updateMessage(message) {
		return new Promise((resolve, reject) => {
			delete message._id;
			this.messages.updateOne(
				{ id: message.id },
				{ $set: message },
				(err, result) => {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}

					resolve(result);
				}
			);
		});
	}

	updateMessages(condition, update) {
		return new Promise((resolve, reject) => {
			this.messages.updateMany(condition, update, (err, result) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}

				resolve(result);
			});
		});
	}

	getMessages(condition) {
		return new Promise((resolve, reject) => {
			this.messages.find(condition).toArray((err, docs) => {
				if (err) {
					console.error(err);
					reject(err);
					return;
				}

				resolve(docs);
			});
		});
	}

	setReachedToUser(userId, reached = true) {
		return this.updateMessages(
			{ to: userId, reachedToUser: false },
			{ $set: { reachedToUser: reached } }
		);
	}

	getUnReachedMessages(userId) {
		return this.getMessages({ to: userId, reachedToUser: false });
	}

	async getConversations(userId) {
		const messages = await this.getMessages({
			$or: [{ from: userId }, { to: userId }],
		});
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

module.exports = new MessageStore();
