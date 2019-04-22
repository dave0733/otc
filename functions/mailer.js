const sendgrid = require('./utils/sendgrid');

function sendMail(ref, data) {
  return sendgrid
    .sendTransactionMail(data)
    .then(() => {
      return ref.update({
        status: 'SENT'
      });
    })
    .catch(e => {
      return ref.update({
        status: 'FAILED',
        error: e.message
      });
    });
}

module.exports = sendMail;
