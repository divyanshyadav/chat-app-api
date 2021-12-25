const { MongoClient } = require("mongodb");

const uri = process.env.CHAT_APP_DB_URI;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = client;
