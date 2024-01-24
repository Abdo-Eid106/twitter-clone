const mongoose = require('mongoose');
const formatTime = require(`${__dirname}/../utils/formatTime.js`);

const Notificiation = require(`${__dirname}/notificationModel.js`);

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweetData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

postSchema.virtual('timeFormated').get(function() {
  return formatTime(new Date(Date.now()), this.createdAt);
})

postSchema.pre(/^find/, function(next) {
  this
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .populate('replyTo.postedBy')
  next();
})

postSchema.post('findOneAndDelete', async (doc, next) => {
  if (!doc) return next();

  const postId = doc._id;
  const posts = await Post.find({ $or: [{ retweetData: postId }, { replyTo: postId }]});
  for (const post of posts)
      await Post.findOneAndDelete({ _id: post._id });

  await Notificiation.deleteMany({ entityId: postId });
  next();
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post; 