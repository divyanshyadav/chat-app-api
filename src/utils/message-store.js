class MessageStore {
	constructor() {
		this.messages = [];
	}

	addMessage(message) {
		this.messages.push(message);
	}

	getMessages(userId) {
		return this.messages.filter(
			(message) => message.to === userId || message.from === userId
		);
	}

	getConversations(userId) {
		const messages = this.getMessages(userId);
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
