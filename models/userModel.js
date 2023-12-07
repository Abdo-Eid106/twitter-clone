const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: '/images/profilePic.jpeg'
  },
  coverPhoto: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
})

userSchema.methods.correctPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema);
module.exports = User;