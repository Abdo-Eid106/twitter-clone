const Chat = require(`${__dirname}/../models/chatModel.js`);
const User = require(`${__dirname}/../models/userModel.js`);
const Message = require(`${__dirname}/../models/messageModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/AppError.js`);

exports.addChat = catchAsync(async (req, res, next) => {
  if (!req.body.users) {
    req.body.users = [];
  }

  req.body.users.push(req.user._id);
  const uniqueUsers = new Set(req.body.users);
  const users = [...uniqueUsers];

  if (users.length < 2) 
    return next(new AppError('the number of the users of the chat should be greater than 1', 400));

  req.body.users = users;
  req.body.isGroupChat = true;
  
  const chat = await Chat.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      chat
    }
  })
})

exports.getChats = catchAsync(async (req, res, next) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id }}
  })
    .populate('latestMessage')
    .sort('-updatedAt');
  await Chat.populate(chats, 'latestMessage.sender');

  if (req.query.unreadOnly == 'true') {
    chats = chats.filter(chat => {
      if (!chat.latestMessage) return false;
      return (!chat.latestMessage.readBy.includes(req.user._id) && 
      chat.latestMessage.sender._id.toString() != req.user._id.toString());
    });
  }

  for (let chat of chats) {
    const latestMessage = chat.latestMessage;
    if (!latestMessage) {
      chat.active = false;
      continue;
    }
    const readBy = latestMessage.readBy;
    for (let user of readBy) {
      if (user.toString() == req.user._id.toString()) {
        chat.active = false;
        break;
      }
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      chats
    }
  });
})

exports.getChat = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  let chat = await Chat.findById(chatId);
  if (!chat && userId.toString() != chatId) {
    const user = await User.findById(chatId);
    if (user) {
      chat = await Chat.findOneAndUpdate({
        isGroupChat: false,
        $and: [
          { users: { $size: 2 } },
          { users: { $elemMatch: { $eq: userId } } },
          { users: { $elemMatch: { $eq: chatId } } }
        ]
      }, {
        $setOnInsert: { users: [userId, chatId] }
      }, {
        new: true,
        upsert: true
      });
    }
  }

  if (!chat) {
    return next(new AppError('Not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
})

exports.updateChat = catchAsync(async (req, res, next) => {
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, req.body, {
    new: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
})

exports.getChatMessages = catchAsync(async (req, res, next) => {
  const chatId = req.params.chatId;
  const messages = await Message.find({ chat: chatId })
    .populate('sender')
    .sort('createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      messages
    }
  });
})

exports.markChatAsRead = catchAsync(async (req, res, next) => {
  await Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.user._id } });
  res.status(200).end();
})
