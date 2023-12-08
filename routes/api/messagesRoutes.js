const express = require('express');
const router = express.Router();

const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);
const messageControllers = require(`${__dirname}/../../controllers/messageControllers.js`);

router.use(authControllers.protect);
router.route('/')
  .post(messageControllers.addMessage);

module.exports = router;