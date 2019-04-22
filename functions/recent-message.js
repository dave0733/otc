const admin = require('firebase-admin');

function recentMessage(chatID, messageID, message) {
  const db = admin.firestore();
  const chatRef = db.collection('chats').doc(chatID);
  const senderId = message.sender_id;

  if (!senderId) {
    return Promise.resolve();
  }

  return chatRef.get().then(doc => {
    const chat = doc.data();
    const otherUserId = (chat.user_ids || []).filter(u => u !== senderId)[0];
    const recentMsgRef = db
      .collection('users')
      .doc(otherUserId)
      .collection('recent_messages')
      .doc();

    return recentMsgRef.set({
      ...message,
      chat_id: chatID
    });
  });
}

module.exports = recentMessage;
