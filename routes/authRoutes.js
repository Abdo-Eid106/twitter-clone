const express = require('express');
const router = express.Router();

const authControllers = require(`${__dirname}/../controllers/authControllers.js`);

router.route('/login')
  .get(authControllers.getLogin)
  .post(authControllers.postLogin);

router.route('/register')
  .get(authControllers.getRegister)
  .post(authControllers.postRegister);

router.get('/logout', authControllers.logOut);
module.exports = router;