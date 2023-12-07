const express = require('express');
const router = express.Router();

const userControllers = require(`${__dirname}/../../controllers/usersControllers.js`);
const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);
const { upload, resizeProfilePhoto, resizeCoverPhoto } = require(`${__dirname}/../../utils/upload.js`);


router.route('/')
  .get(authControllers.isLoggedIn, userControllers.getUsers);

router.put('/:id/follow', 
  authControllers.isLoggedIn, 
  userControllers.changeFollow);


router.post('/profilePicture',
  authControllers.isLoggedIn,
  upload.single('profilePic'),
  resizeProfilePhoto, 
  userControllers.uploadProfilePicture);


router.post('/coverPhoto',
  authControllers.isLoggedIn,
  upload.single('coverPhoto'),
  resizeCoverPhoto, 
  userControllers.uploadCoverPhoto);

module.exports = router;