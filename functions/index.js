const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sendMail = require('./mailer');
const handleRecentMessage = require('./recent-message');

admin.initializeApp();

exports.mailer = functions.firestore
  .document(`mails/{mailID}`)
  .onCreate((snap, context) => {
    const data = snap.data();
    const ref = snap.ref;
    // const { taskID } = context.params;
    return sendMail(ref, data);
  });

exports.recentMessage = functions.firestore
  .document('chats/{chatID}/messages/{messageID}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const { chatID, messageID } = context.params;

    return handleRecentMessage(chatID, messageID, data);
  });
