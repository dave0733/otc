const BaseCrudController = require('./BaseCrudController');
const userService = require('../services/user.service');

class UserController extends BaseCrudController {
  constructor() {
    super(userService, 'queryUser');
  }
}

module.exports = new UserController();
