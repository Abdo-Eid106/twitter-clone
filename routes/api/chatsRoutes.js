const express = require('express');
const router = express.Router();

const chatsControllers = require(`${__dirname}/../../controllers/chatsControllers.js`);
const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);

router.use(authControllers.protect);
router.route('/')
  .get(chatsControllers.getChats)
  .post(chatsControllers.addChat);

router.route('/:chatId')
  .get(chatsControllers.getChat)
  .patch(chatsControllers.updateChat);

router.get('/:chatId/messages', chatsControllers.getChatMessages);
router.patch('/:chatId/messages/markAsRead', chatsControllers.markChatAsRead);

module.exports = router;