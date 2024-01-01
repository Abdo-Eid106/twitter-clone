const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true
  },
  isGroupChat: {
    type: Boolean,
    default: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

chatSchema.pre(/^find/, function (next) {
  this.populate('users');
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;