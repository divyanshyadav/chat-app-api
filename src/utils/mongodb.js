const { MongoClient } = require("mongodb");

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

module.exports = {
	client,
	db: client.db(process.env.DB_NAME),
};
