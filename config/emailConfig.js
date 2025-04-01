// config/emailConfig.js
module.exports = {
    service: 'gmail',
    authType: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  };