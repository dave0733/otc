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
  host: process.env.HOST || 'https://app.otctrade.com',
  homeURL: process.env.HOMEPAGE_URI || 'https://otctrade.com',
  port: parseInt(process.env.PORT, 10) || 4000,
  isDev,
  mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/otctrade',
  uploadLimit: process.env.UPLOAD_LIMIT || '10mb',
  jwtSecret: process.env.JWT_SECRET || 'emilisawesome',
  jwtExpiresIn: process.env.JWT_EXPIRES || '30d',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  expireCheckInterval: process.env.EXPIRE_CHECK_INTERVAL || 60 * 1000, // 1min
  firebaseUrl: process.env.FIREBASE_URL || '',
  firebaseProject: process.env.FIREBASE_PROJECT || '',
  firebaseBucket: process.env.FIREBASE_BUCKET || '',
  firebaseUploadLimit: process.env.FIREBASE_UPLOAD_LIMIT || 5 * 1024 * 1024,
  firebaseToken: process.env.FIREBASE_TOKEN || '',
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || ''
};
