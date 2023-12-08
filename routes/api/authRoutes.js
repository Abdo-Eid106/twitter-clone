const express = require('express');
const router = express.Router();

const authControllers = require(`${__dirname}/../../controllers/authControllers`);

router.post('/register', authControllers.postRegister);
router.post('/login', authControllers.postLogin);

module.exports = router;