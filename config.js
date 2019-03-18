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
  host: process.env.HOST || 'https://otctrading.io',
  port: parseInt(process.env.PORT, 10) || 4000,
  mongoURL: process.env.MONGODB_URI || 'mongodb://localhost:27017/otctrade',
  uploadLimit: process.env.UPLOAD_LIMIT || '20mb',
  jwtSecret: process.env.JWT_SECRET || 'emilisawesome',
  jwtExpiresIn: process.env.JWT_EXPIRES || '30d',
  sendgridApiKey: process.env.SENDGRID_API_KEY
};
