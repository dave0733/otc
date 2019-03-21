const _ = require(`lodash`);
const BaseCrudService = require('./BaseCrudService');

class UserService extends BaseCrudService {
  constructor() {
    super(
      'User',
      [
        'firstName',
        'lastName',
        'email',
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

  create(data) {
    const Model = this.model;
    const createData = {};
    const { password } = data;

    const user = new Model(
      Object.assign(createData, _.pick(data, this.fields))
    );

    user.username = data.email;

    return new Promise((resolve, reject) => {
      Model.register(user, password, (err, account) => {
        if (err) {
          reject(err);
        } else {
          resolve(account);
        }
      });
    });
  }

  changePassword(user, data) {
    return user.changePassword(data.oldPassword, data.newPassword).then(() => {
      user.lastPasswordChange = new Date();
      return user.save();
    });
  }
}

module.exports = new UserService();
