const Chat = require(`${__dirname}/../models/chatModel.js`);
const User = require(`${__dirname}/../models/userModel.js`);
const Message = require(`${__dirname}/../models/messageModel.js`);

exports.addChat = async (req, res, next) => {
  if (!req.body.users) {
    req.body.users = [];
  }

  req.body.users.push(req.user._id);
  const uniqueUsers = new Set(req.body.users);
  const users = [...uniqueUsers];

  if (users.length < 2) {
    return res.status(400).json({
      status: 'failed',
      message: 'the number of the users of the chat should be greater than 1'
    })
  }

  req.body.users = users;
  req.body.isGroupChat = true;
  
  const chat = await Chat.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      chat
    }
  })
}

exports.getChats = async (req, res, next) => {
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

  res.status(200).json({
    status: 'success',
    data: {
      chats
    }
  });
}

exports.getChat = async (req, res, next) => {
  const userId = req.user._id;
  const chatId = req.params.chatId;

  let chat = await Chat.findById(chatId);
  if (!chat && userId.toString() != chatId) {
    const user = await User.findById(chatId);
    if (user) {
      chat = await Chat.findOneAndUpdate({
        isGroupChat: false,
        users: { $size: 2,
        $elemMatch: { $eq: userId },
        $elemMatch: { $eq: chatId } }
      }, {
        $setOnInsert: { users: [userId, chatId] }
      }, {
        new: true,
        upsert: true
      });
    }
  }

  if (!chat) {
    return res.status(404).json({
      status: 'failed',
      message: 'Not found'
    })
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
}

exports.updateChat = async (req, res, next) => {
  const chat = await Chat.findByIdAndUpdate(req.params.chatId, req.body, {
    new: true
  });
  
  res.status(200).json({
    status: 'success',
    data: {
      chat
    }
  });
}

exports.getChatMessages = async (req, res, next) => {
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
}

exports.markChatAsRead = async (req, res, next) => {
  await Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.user._id } });
  res.status(200).end();
}
