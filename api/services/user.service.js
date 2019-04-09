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
    this.updateFeedback = this.updateFeedback.bind(this);
  }

  create(user, data) {
    const Model = this.model;
    const createData = {};
    const { password } = data;

    const newUser = new Model(
      Object.assign(createData, _.pick(data, this.fields))
    );

    newUser.username = data.email;

    return new Promise((resolve, reject) => {
      Model.register(newUser, password, (err, account) => {
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

  updateFeedback(user, feedback) {
    const ratingCount = user.ratingCount + 1;
    const avgRating =
      (user.avgRating * user.ratingCount +
        (feedback.timeline + feedback.communication) / 2) /
      ratingCount;
    user.ratingCount = ratingCount;
    user.avgRating = avgRating;
    user.lastFeedback = new Date();
    return user.save();
  }
}

module.exports = new UserService();
