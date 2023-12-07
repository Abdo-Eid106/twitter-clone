const mongoose = require('mongoose'); 

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  content: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;