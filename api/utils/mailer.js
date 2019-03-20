const sgMail = require('@sendgrid/mail');
const config = require('../../config');

sgMail.setApiKey(config.sendgridApiKey);

function sendTransactionMail({ to, subject, template, vars }) {
  return sgMail.send({
    to,
    templateId: template,
    from: {
      email: config.fromMailAddress,
      name: config.fromName
    },
    subject,
    dynamic_template_data: vars
  });
}

module.exports = {
  sendTransactionMail
};
