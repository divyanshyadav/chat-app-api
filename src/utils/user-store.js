class UserStore {
	constructor() {
		this.users = [];
	}

	add(user) {
		if (this.users.find((u) => u.id === user.id)) {
			return;
		}

		this.users.push({ ...user });
	}

	setOnline(userId) {
		const user = this.getUser(userId);
		if (!user) {
			return;
		}

		user.status = "online";
	}

	setOffline(userId) {
		const user = this.getUser(userId);
		if (!user) {
			return;
		}

		user.status = "offline";
	}

	getUser(userId) {
		return this.users.find((u) => u.id === userId);
	}

	getUsers() {
		return this.users;
	}
}

module.exports = UserStore;
