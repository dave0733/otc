const BaseCrudController = require('./BaseCrudController');
const userService = require('../services/user.service');

class UserController extends BaseCrudController {
  constructor() {
    super(userService, 'queryUser');
  }

  update2FA(req, res, next) {
    userService
      .update2FA(req.queryUser, req.body.token)
      .then(() => res.json({ success: true }))
      .catch(next);
  }
}

module.exports = new UserController();
