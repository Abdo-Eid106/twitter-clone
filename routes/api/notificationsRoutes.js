const express = require('express');
const router = express.Router();

const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);
const notificationsControllers = require(`${__dirname}/../../controllers/notificationsControllers.js`);

router.use(authControllers.isLoggedIn);

router.get('/latest', notificationsControllers.getLatestNotification);
router.get('/', notificationsControllers.getNotifications);

router.patch('/markAsOpened', notificationsControllers.markAll);
router.patch('/:id/markAsOpened', notificationsControllers.markOne);

module.exports = router;