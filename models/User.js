const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  walletID: {
    type: String,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required:true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    trim: true
  },
  verify: {
    type: Boolean,
    default: false
  },
  avatar: {
    type:String,
    default:'Qmdtg2avcq2z2WZ1RrSJAXJZbMkG8u9MVcedSNCAwsK4u5'
  },
  country: String
});

const User = mongoose.model('User', UserSchema);

module.exports = User;