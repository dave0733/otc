const BaseCrudController = require('./BaseCrudController');
const userService = require('../services/user.service');

module.exports = new BaseCrudController(userService, 'queryUser');
