const mongoose = require('mongoose');
const Post = require(`${__dirname}/../models/postModel.js`);
const User = require(`${__dirname}/../models/userModel.js`);
const Chat = require(`${__dirname}/../models/chatModel.js`);

exports.getHome = async (req, res, next) => {
  const following = req.user.following;
  following.push(req.user._id);
  const posts = await Post.find({ postedBy: { $in: following }}).sort('-createdAt');
  res.status(200).render('home', {
    pageTitle: 'home',
    posts,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  })
}

exports.getPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const replies = await Post.find({ replyTo: req.params.id });
  if (!post) return res.redirect('/');

  res.status(200).render('postPage', {
    pageTitle: 'View Post',
    post,
    replies,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  })
}

exports.getMyProfile = async (req, res, next) => {
  const pinnedPost = await Post.find({ postedBy: req.user._id,
    replyTo: { $exists: false },
    pinned: true });
  
  const posts = await Post.find({ postedBy: req.user._id,
    replyTo: { $exists: false },
    pinned: false });
  
  res.render('profilePage', {
    pageTitle: req.user.username,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    profileUser: req.user,
    pinnedPost,
    posts
  })
}

exports.getUserProfile = async (req, res, next) => {
  const username = req.params.username;
  let user = await User.findOne({ username: username });

  if (!user && mongoose.Types.ObjectId.isValid(username)) {
    user = await User.findById(username);
  }

  if (!user) {
    return res.render('profilePage', {
      pageTitle: 'User not Found',
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      profileUser: user
    })
  }

  const pinnedPost = await Post.find({ postedBy: user._id,
    replyTo: { $exists: false },
    pinned: true });

  const posts = await Post.find({ postedBy: user._id,
    replyTo: { $exists: false },
    pinned: false })
    .sort('-createdAt');

  res.render('profilePage', {
    pageTitle: user.username,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    profileUser: user,
    pinnedPost,
    posts
  })
}

exports.getUserReplies = async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    return res.render('profilePage', {
      pageTitle: 'User not Found',
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user),
      profileUser: user
    })
  }

  const posts = await Post.find({ postedBy: user._id, replyTo: { $exists: true }}).sort('-createdAt');
  res.render('profilePage', {
    pageTitle: user.username,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    profileUser: user,
    posts,
    selectedTab: 'replies',
    pinnedPost: []
  })
}

exports.getUserFollowings = async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username })
    .populate('following');

  if (!user) {
    return res.render('followersAndFollowing', {
      pageTitle: user.username,
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user)
    })
  }
  
  res.render('followersAndFollowing', {
    pageTitle: user.username,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    profileUser: user,
    selectedTab: 'following',
    path: '/following'
  })
}

exports.getUserFollowers = async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username })
    .populate('followers');

  if (!user) {
    return res.render('followersAndFollowing', {
      pageTitle: user.username,
      userLoggedIn: req.user,
      userLoggedInJs: JSON.stringify(req.user)
    })
  }
  
  res.render('followersAndFollowing', {
    pageTitle: user.username,
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    profileUser: user,
    selectedTab: 'followers',
    path: '/followers'
  })
}

exports.getSearch = async (req, res, next) => {
  return res.render('searchPage', {
    pageTitle: 'search',
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    selectedTab: 'posts'
  });
}

exports.getSearchTab = async (req, res, next) => {
  return res.render('searchPage', {
    pageTitle: 'search',
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    selectedTab: req.params.selectedTab
  });
}

exports.getAddChat = async (req, res, next) => {
  return res.render('newMessage', {
    pageTitle: 'New Message',
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  });
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
  
  return res.render('inboxPage', {
    pageTitle: 'Inbox',
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user),
    chats
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

  const payload = {
    pageTitle: "Chat",
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  };

  if (chat == null) {
    payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
  } else {
    payload.chat = chat;
  }

  res.render('chatPage', payload);
}

exports.getNotifications = async(req, res, next) => {
  res.render('notificationsPage', {
    pageTitle: "Notifications",
    userLoggedIn: req.user,
    userLoggedInJs: JSON.stringify(req.user)
  });
}