const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const ROLES = require('../constants/roles');
const GROUP_PERMISSIONS = require('../constants/group-permission');

const { Schema } = mongoose;

const permissionSchema = new Schema(
  {
    group: { type: Schema.ObjectId, ref: 'Group' },
    permission: {
      type: String,
      required: true,
      enum: Object.values(GROUP_PERMISSIONS),
      default: GROUP_PERMISSIONS.APPLIED
    }
  },
  {
    _id: false
  }
);

// @TODO oauth with facebook, twitter, github, google
// @TODO stripe payment methods
// @TODO google authenticator 2fa
// @TODO sms
// @TODO phone validator
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      default: '',
      trim: true
    },
    lastName: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },

    // address
    phone: { type: String, trim: true },
    country: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    address1: { type: String, trim: true },
    address2: { type: String, trim: true },
    zipcode: { type: String, trim: true },

    // feedback
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    lastFeedback: { type: Date },

    // permissions
    groups: {
      type: [permissionSchema]
    },

    // security
    googleAuthenticator: { type: String, select: false },
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
    lastPasswordChange: { type: Date },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

userSchema.plugin(passportLocalMongoose);

userSchema.post('save', function postSave(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    if (error.errmsg.includes('nickname')) {
      next(new Error('Oops! This username is already in use. Try another?'));
    }
  } else {
    next();
  }
});

userSchema.post('update', function postSave(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    if (error.errmsg.includes('nickname')) {
      next(new Error('Oops! This username is already in use. Try another?'));
    }
  } else {
    next();
  }
});

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const json = this.toJSON();

  delete json.salt;
  delete json.hash;
  delete json.googleAuthenticator;
  delete json.verificationToken;
  delete json.resetToken;

  return json;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
