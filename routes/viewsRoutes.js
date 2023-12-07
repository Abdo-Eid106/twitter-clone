const express = require('express');
const router = express.Router();

const authControllers = require(`${__dirname}/../controllers/authControllers.js`);
const viewsControllers = require(`${__dirname}/../controllers/viewsControllers.js`);

router.use(authControllers.isLoggedIn);

router.get('/', viewsControllers.getHome);
router.get('/posts/:id', viewsControllers.getPost);
router.get('/profile', viewsControllers.getMyProfile);
router.get('/profile/:username', viewsControllers.getUserProfile);
router.get('/profile/:username/replies', viewsControllers.getUserReplies);
router.get('/profile/:username/following', viewsControllers.getUserFollowings);
router.get('/profile/:username/followers', viewsControllers.getUserFollowers);
router.get('/search', viewsControllers.getSearch);
router.get('/search/:selectedTab', viewsControllers.getSearchTab);
router.get('/messages', viewsControllers.getChats);
router.get('/messages/new', viewsControllers.getAddChat);
router.get('/messages/:chatId', viewsControllers.getChat);
router.get('/notifications', viewsControllers.getNotifications);

module.exports = router;