const dotenv = require('dotenv');

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  try {
    dotenv.config();
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  host: process.env.HOST || 'https://www.otctrade.com',
  port: parseInt(process.env.PORT, 10) || 4000,
  isDev,
  mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/otctrade',
  uploadLimit: process.env.UPLOAD_LIMIT || '10mb',
  jwtSecret: process.env.JWT_SECRET || 'emilisawesome',
  jwtExpiresIn: process.env.JWT_EXPIRES || '30d',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  fromMailAddress: process.env.FROM_MAIL_ADDRESS || 'no-reply@otctrade.com',
  fromName: process.env.FROM_NAME || 'No Reply',
  mailTemplates: {
    resetPassword:
      process.env.MAIL_RESET_PASSWORD || 'd-bead0ea9a0054ca3b9632e5001d5a7ab',
    welcome: process.env.MAIL_WELCOME || 'd-15f118b86a6041cd8cb7c68decb17142',
    verification:
      process.env.MAIL_VERIFICATION || 'd-b46d79300dfc4ca3ab172f26514ecb3a'
  },
  firebaseUrl: process.env.FIREBASE_URL || '',
  firebaseProject: process.env.FIREBASE_PROJECT || '',
  firebaseBucket: process.env.FIREBASE_BUCKET || '',
  firebaseUploadLimit: process.env.FIREBASE_UPLOAD_LIMIT || 5 * 1024 * 1024,
  firebaseToken: process.env.FIREBASE_TOKEN || '',
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || ''
};
