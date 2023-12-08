const mongoose = require('mongoose');
const Post = require(`${__dirname}/../models/postModel.js`);
const User = require(`${__dirname}/../models/userModel.js`);
const Chat = require(`${__dirname}/../models/chatModel.js`);

const getPayloud = (user, pageTitle) => {
  return {
    userLoggedIn: user,
    userLoggedInJs: JSON.stringify(user),
    pageTitle
  };
}

exports.getHome = async (req, res, next) => {
  const following = req.user.following;
  following.push(req.user._id);
  const posts = await Post.find({ postedBy: { $in: following }}).sort('-createdAt');
  
  const payloud = getPayloud(req.user, 'home');
  payloud.posts = posts;
  res.status(200).render('home', payloud);
}

exports.getPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const replies = await Post.find({ replyTo: req.params.id });
  if (!post) return res.redirect('/');

  const payloud = getPayloud(req.user, 'postPage');
  payloud.post = post;
  payloud.replies = replies;
  res.status(200).render('postPage', payloud);
}

exports.getMyProfile = async (req, res, next) => {
  const pinnedPost = await Post.find({ postedBy: req.user._id,
    replyTo: { $exists: false },
    pinned: true });
  
  const posts = await Post.find({ postedBy: req.user._id,
    replyTo: { $exists: false },
    pinned: false });
  
  const payloud = getPayloud(req.user, req.user.username);
  payloud.profileUser = req.user;
  payloud.pinnedPost = pinnedPost;
  payloud.posts = posts;
  res.render('profilePage', payloud);
}

exports.getUserProfile = async (req, res, next) => {
  const username = req.params.username;
  let user = await User.findOne({ username: username });

  if (!user && mongoose.Types.ObjectId.isValid(username)) {
    user = await User.findById(username);
  }

  if (!user) {
    const payloud = getPayloud(req.user, 'User not Found');
    payloud.profileUser = user;
    return res.render('profilePage', payloud);
  }

  const pinnedPost = await Post.find({ postedBy: user._id,
    replyTo: { $exists: false },
    pinned: true });

  const posts = await Post.find({ postedBy: user._id,
    replyTo: { $exists: false },
    pinned: false })
    .sort('-createdAt');

  const payloud = getPayloud(req.user, user.username);
  payloud.profileUser = user;
  payloud.pinnedPost = pinnedPost;
  payloud.posts = posts;
  res.render('profilePage', payloud);
}

exports.getUserReplies = async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    const payloud = getPayloud(req.user, 'User not Found');
    payloud.profileUser = profileUser;
    return res.render('profilePage', payloud);
  }

  const posts = await Post.find({ postedBy: user._id, replyTo: { $exists: true }}).sort('-createdAt');
  const payloud = getPayloud(req.user, user.username);
  payloud.profileUser = user;
  payloud.posts = posts;
  payloud.selectedTab = 'replies';
  payloud.pinnedPost = [];
  res.render('profilePage', payloud);
}

exports.getUserFollowings = async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username })
    .populate('following');

  if (!user) {
    const payloud = getPayloud(req.user, user.username);
    return res.render('followersAndFollowing', payloud);
  }

  const payloud = getPayloud(req.user, user.username);
  payloud.profileUser = user;
  payloud.selectedTab = 'following';
  payloud.path = '/following';
  res.render('followersAndFollowing', payloud);
}

exports.getUserFollowers = async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username })
    .populate('followers');

  if (!user) {
    const payloud = getPayloud(req.user, user.username);
    return res.render('followersAndFollowing', payloud);
  }

  const payloud = getPayloud(req.user, user.username);
  payloud.profileUser = user;
  payloud.selectedTab = 'followers';
  payloud.path = '/followers';
  res.render('followersAndFollowing', payloud);
}

exports.getSearch = async (req, res, next) => {
  const payloud = getPayloud(req.user, 'search');
  payloud.selectedTab = 'posts';
  return res.render('searchPage', payloud);
}

exports.getSearchTab = async (req, res, next) => {
  const payloud = getPayloud(req.user, 'search');
  payloud.selectedTab = req.params.selectedTab;
  return res.render('searchPage', payloud);
}

exports.getAddChat = async (req, res, next) => {
  const payloud = getPayloud(req.user, 'New Message');
  return res.render('newMessage', payloud);
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

  const payloud = getPayloud(req.user, 'Inbox');
  payloud.chats = chats;
  return res.render('inboxPage', payloud);
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

  const payload = getPayloud(req.user, 'Chat');
  if (chat == null) {
    payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
  } else {
    payload.chat = chat;
  }

  res.render('chatPage', payload);
}

exports.getNotifications = async(req, res, next) => {
  const payload = getPayloud(req.user, 'Notifications');
  res.render('notificationsPage', payload);
}