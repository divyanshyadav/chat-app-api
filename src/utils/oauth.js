const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.OAUTH_GOOGLE_CLIENT_ID);

async function isGoogleTokenValid(token) {
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: token,
			audience: process.env.OAUTH_GOOGLE_CLIENT_ID,
		});
	} catch (err) {
		return false;
	}

	return true;
}

module.exports = {
	isGoogleTokenValid,
};
