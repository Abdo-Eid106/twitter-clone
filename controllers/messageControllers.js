const Message = require(`${__dirname}/../models/messageModel.js`);
const Chat = require(`${__dirname}/../models/chatModel.js`);
const Notification = require(`${__dirname}/../models/notificationModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);

exports.addMessage = catchAsync(async (req, res, next) => {
  req.body.sender = req.user._id;
  let message = await Message.create(req.body);
  
  const chatId = req.body.chat;
  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id
  });

  message = Message.findById(message._id)
    .populate('sender')
    .populate('chat');
  message = await message.populate('chat.users')
  message = await message.populate('chat.latestMessage');
  message = await message.populate('chat.latestMessage.sender');

  for (let user of message.chat.users) {
    if (user._id.toString() == req.user._id.toString()) continue;
    Notification.addNotification(user._id, req.user._id, 'newMessage', message._id);
  }
  
  return res.status(200).json({
    status: 'success',
    data: {
      message
    }
  });
})