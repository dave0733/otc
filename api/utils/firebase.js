const admin = require('firebase-admin');
const config = require('../../config');

const str = Buffer.from(config.firebaseServiceAccount || ``, `base64`).toString(
  `utf8`
);
const serviceAccount = JSON.parse(str);

admin.initializeApp({
  databaseURL: config.firebaseUrl,
  credential: admin.credential.cert(serviceAccount)
});

function getFirestore() {
  return admin.firestore();
}

function getAuth() {
  return admin.auth();
}

function generateToken(user) {
  const auth = getAuth();

  return auth.createCustomToken(user._id.toString(), user);
}

module.exports = {
  getFirestore,
  getAuth,
  generateToken
};
