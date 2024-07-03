const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const OAuth2_client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  );

  OAuth2_client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  try {
    const accessTokenResponse = await OAuth2_client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    await transporter.verify();
    console.log('Server is ready to take our messages');
    console.log('Mail sent at ' + new Date().toLocaleString());
    return transporter;
  } catch (error) {
    console.error("Failed to create transporter", error);
  }
}

module.exports = createTransporter;
