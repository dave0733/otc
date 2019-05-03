const _ = require(`lodash`);
const firebase = require('../utils/firebase');
const config = require('../../config');
const APIError = require('../utils/api-error');
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
        'zipcode',
        'avatar',
        'bio'
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

  update2FA(user, base32) {
    user.googleAuthenticator = base32;
    user.is2faEnabled = !!base32;
    return user.save();
  }

  get2FA(user) {
    return this.model
      .findById(user._id)
      .select('googleAuthenticator')
      .lean();
  }

  uploadAvatar(user, file) {
    const bucket = firebase.getBucket();
    const filename = `users/${user._id.toString()}`;

    const prom = new Promise((resolve, reject) => {
      if (!file) {
        reject(new APIError('No file', 400));
      }
      const fileUpload = bucket.file(filename);
      const metadata = {
        contentType: file.mimetype
      };

      const blobStream = fileUpload.createWriteStream({
        gzip: true,
        metadata
      });

      blobStream.on('error', error => {
        reject(error);
      });

      blobStream.on('finish', () => {
        resolve({
          avatar: `https://firebasestorage.googleapis.com/v0/b/${
            config.firebaseBucket
          }/o/${encodeURIComponent(filename)}?alt=media`
        });
      });

      blobStream.end(file.buffer);
    });

    return prom.then(result => {
      user.avatar = result.avatar;
      return user.save();
    });
  }
}

module.exports = new UserService();
