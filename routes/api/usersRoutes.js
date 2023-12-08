const express = require('express');
const router = express.Router();

const userControllers = require(`${__dirname}/../../controllers/usersControllers.js`);
const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);
const { upload, resizeProfilePhoto, resizeCoverPhoto } = require(`${__dirname}/../../utils/upload.js`);


router.use(authControllers.protect);
router.route('/')
  .get(userControllers.getUsers);

router.put('/:id/follow', 
  userControllers.changeFollow);


router.post('/profilePicture',
  upload.single('profilePic'),
  resizeProfilePhoto, 
  userControllers.uploadProfilePicture);


router.post('/coverPhoto',
  upload.single('coverPhoto'),
  resizeCoverPhoto, 
  userControllers.uploadCoverPhoto);

module.exports = router;