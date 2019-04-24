const guestService = require('../services/guest.service');

function contactUs(req, res, next) {
  return guestService
    .contactUs(req.body)
    .then(() => res.json({ success: true }))
    .catch(next);
}

module.exports = {
  contactUs
};
