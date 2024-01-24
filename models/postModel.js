const mongoose = require('mongoose');
const formatTime = require(`${__dirname}/../utils/formatTime.js`);

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
  await Post.deleteMany({ $or: [{ retweetData: postId }, { replyTo: postId }]});
  next();
})

const Post = mongoose.model('Post', postSchema);
module.exports = Post; 