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
}

module.exports = MessageStore;
