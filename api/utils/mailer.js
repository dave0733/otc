const moment = require('moment');
const _ = require('lodash');
const firebase = require('./firebase');
const config = require('../../config');
const MAIL_TYPES = require('../constants/mail-type');

function _sendMail({ to, subject, template, vars }) {
  const fs = firebase.getFirestore();
  const newMail = fs.collection('mails').doc();
  let emails = to;
  if (!Array.isArray(to)) {
    emails = [to];
  }
  emails = emails.map(u => (u.email ? u.email : u));

  return newMail.set({
    to: emails,
    template,
    subject: subject || null,
    vars,
    status: 'PENDING'
  });
}

function send(to, type, payload = {}) {
  switch (type) {
    case MAIL_TYPES.OFFER_EXPIRED:
    case MAIL_TYPES.OFFER_CREATED:
    case MAIL_TYPES.OFFER_ENDED:
      return _sendMail({
        to,
        template: type,
        vars: {
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          groupName: payload.group.name,
          postedDate: moment().format('DD MMM, YYYY'),
          rating: payload.user.avgRating * 20,
          status: payload.offer.status,
          remainingTime:
            type === MAIL_TYPES.OFFER_CREATED
              ? moment
                  .duration(moment(payload.offer.expiresAt).diff())
                  .humanize()
              : '-',
          offerHave: payload.offer.have,
          offerWant: payload.offer.want,
          hvCount: _.get(payload.offer, 'acceptedVouches.length', 0),
          proposalCount: _.get(payload.offer, 'proposals.length', 0),
          note: payload.offer.note
        }
      });
    case MAIL_TYPES.GROUP_REQUEST:
      return _sendMail({
        to,
        template: MAIL_TYPES.GROUP_REQUEST,
        vars: {
          groupName: payload.group.name,
          groupUrl: `${config.host}/app/groups/${payload.group._id.toString()}`
        }
      });
    case MAIL_TYPES.APPLICATION_RECEIVED:
      return _sendMail({
        to,
        template: MAIL_TYPES.APPLICATION_RECEIVED,
        vars: {
          groupName: payload.group.name,
          groupUrl: `${
            config.host
          }/app/groups/${payload.group._id.toString()}/admin/members`
        }
      });
    case MAIL_TYPES.VOUCH_ACCEPTED:
    case MAIL_TYPES.VOUCH_DENIED:
      return _sendMail({
        to,
        template: type,
        vars: {
          groupName: payload.group.name,
          vouchUrl: `${
            config.host
          }/app/my-groups/${payload.group._id.toString()}/group/vouches-proposals/{${
            payload.vouch.proposalId ? 'active-proposals' : 'active-deals'
          }`
        }
      });
    case MAIL_TYPES.VOUCH_REQUEST_RECEIVED:
      return _sendMail({
        to,
        template: type,
        vars: {
          groupName: payload.group.name,
          vouchUrl: `${
            config.host
          }/app/my-groups/${payload.group._id.toString()}/group/vouches-proposals/people-request-vouch`
        }
      });
    case MAIL_TYPES.PROPOSAL_ACCEPTED:
    case MAIL_TYPES.PROPOSAL_REJECTED:
      return _sendMail({
        to,
        template: type,
        vars: {
          groupName: payload.group.name,
          proposalUrl: `${
            config.host
          }/app/my-groups/${payload.group._id.toString()}/group/vouches-proposals/active-proposals`
        }
      });
    case MAIL_TYPES.RESET_PASSWORD:
      return _sendMail({
        to,
        subject: 'Reset password',
        template: MAIL_TYPES.RESET_PASSWORD,
        vars: {
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          resetUrl: `${config.host}/auth/reset-password?token=${
            payload.user.resetToken
          }`
        }
      });
    case MAIL_TYPES.VERIFICATION:
      return _sendMail({
        to,
        subject: 'Verify your account',
        template: MAIL_TYPES.VERIFICATION,
        vars: {
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          activeAccountUrl: `${config.host}/auth/verify-email?token=${
            payload.user.verificationToken
          }`
        }
      });
    case MAIL_TYPES.WELCOME:
      return _sendMail({
        to,
        template: MAIL_TYPES.WELCOME,
        subject: 'Welcome to OTCTrade',
        vars: {
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          homepageURL: config.host
        }
      });
    default:
      return Promise.reject(new Error('Mail type not found'));
  }
}

module.exports = {
  send
};
