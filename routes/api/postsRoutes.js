const express = require('express');
const router = express.Router();

const postsControllers = require(`${__dirname}/../../controllers/postsControllers.js`);
const authControllers = require(`${__dirname}/../../controllers/authControllers.js`);

router.use(authControllers.protect);
router.route('/')
  .post(postsControllers.addPost)
  .get(postsControllers.getPosts);

router.route('/:id')
  .get(postsControllers.getPost)
  .delete(postsControllers.deletePost);

router.put('/:id/like', postsControllers.postLike);
router.post('/:id/retweet', postsControllers.postRetweet);

router.patch('/:id/pin', postsControllers.pinPost);
router.patch('/:id/unpin', postsControllers.unPinPost);

module.exports = router;