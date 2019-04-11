const firebase = require('./firebase');

class Notify {
  constructor() {
    this.send = this.send.bind(this);
  }

  send(user, type, payload) {
    const fs = firebase.getFirestore();
    const userID = user._id ? user._id.toString() : user.toString();
    const notification = fs
      .collection('users')
      .doc(userID)
      .collection('notifications')
      .doc();
    const data = {
      type,
      payload,
      timestamp: new Date().valueOf()
    };

    return notification.set(data).then(() => ({
      ...data,
      id: notification.id
    }));
  }
}

module.exports = new Notify();
