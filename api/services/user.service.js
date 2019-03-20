const BaseCrudService = require('./BaseCrudService');

class UserService extends BaseCrudService {
  constructor() {
    super(
      'User',
      [
        'firstName',
        'lastName',
        'phone',
        'country',
        'state',
        'city',
        'address1',
        'address2',
        'zipcode'
      ],
      ['role']
    );

    this.changePassword = this.changePassword.bind(this);
  }

  changePassword(user, data) {
    return user.changePassword(data.oldPassword, data.newPassword).then(() => {
      user.lastPasswordChange = new Date();
      return user.save();
    });
  }
}

module.exports = new UserService();
