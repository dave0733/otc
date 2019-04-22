const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.sendgridApiKey);

function sendTransactionMail({ to, template, vars }) {
  return sgMail.send({
    to,
    templateId: config.mailTemplates[template],
    from: {
      email: config.fromMailAddress,
      name: config.fromName
    },
    dynamic_template_data: vars
  });
}

module.exports = {
  sendTransactionMail
};
