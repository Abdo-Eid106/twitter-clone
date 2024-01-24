const User = require("../models/userModel");
const Post = require(`${__dirname}/../models/postModel.js`);
const Notification = require(`${__dirname}/../models/notificationModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/AppError.js`);


exports.addPost = catchAsync(async (req, res, next) => {
	const content = req.body.content;
	if (!content) {
    return next(new AppError("the content can't be empty", 400));
	}
	req.body.postedBy = req.user._id;

	let post = await Post.create(req.body);
	post = await Post.findById(post._id);

	if (post.replyTo && post.replyTo.postedBy._id.toString() != req.user._id.toString()) {
		const userFrom = req.user._id;
		const userTo = post.replyTo.postedBy._id;
		const entityId = post._id;
		await Notification.addNotification(userTo, userFrom, 'reply', entityId, true);
	} 

	res.status(201).json({
		status: 'status',
		data: {
			post
		}
	})
})

exports.getPosts = catchAsync(async (req, res, next) => {
	let query = Post.find();

	const search = req.query.search;
	if (search) {
		query = query.find({
			content: {
				$regex: search,
				$options: 'i'
			}
		});
	}

	const followingOnly = req.query.followingOnly;
	if (followingOnly) {
		const following = req.user.following;
		following.push(req.user._id);
		query = query.find({
			postedBy: {
				$in: following
			}
		});
	}

	query = query.sort('-createdAt');

	const posts = await query;
	res.status(200).json({
		status: 'success',
		data: {
			posts
		}
	})
})

exports.postLike = catchAsync(async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.user._id;
	let post = await Post.findById(postId);

	if (!post) {
    return next(new AppError('there is no post with this ID', 404));
	}

	const hasLike = post.likes.includes(userId);
	const op = hasLike ? '$pull' : '$push';

	const user = await User.findByIdAndUpdate(userId, {
		[op]: {
			likes: postId
		}
	}, {
		new: true
	});

	post = await Post.findByIdAndUpdate(postId, {
		[op]: {
			likes: userId
		}
	}, {
		new: true
	});

	const userFrom = req.user._id;
	const userTo = post.postedBy._id;
	const entityId = post._id;

  if (userFrom.toString() != userTo.toString()) {
    if (!hasLike) 
      await Notification.addNotification(userTo, userFrom, 'postLike', entityId);
    else 
      await Notification.deleteNotification(userTo, userFrom, 'postLike', entityId);
  }

	res.status(200).json({
		status: 'success',
		data: {
			post,
			like: !hasLike
		}
	})
})

exports.postRetweet = catchAsync(async (req, res, next) => {
	const userId = req.user._id;
	const postId = req.params.id;

	let post = await Post.findById(postId);
	if (!post) {
    return next(new AppError('this id is not belonging to any post', 404));
	}

	let retweetPost = await Post.findOneAndDelete({
		postedBy: userId,
		retweetData: postId
	});

	const op = (retweetPost) ? '$pull' : '$push';
	if (!retweetPost) {
		retweetPost = await Post.create({
			postedBy: userId,
			retweetData: postId
		});
	}
	const retweetId = retweetPost._id;

	await User.findByIdAndUpdate(userId, {
		[op]: { retweets: retweetId }
	}, { new: true });

	post = await Post.findByIdAndUpdate(postId, {
		[op]: {
			retweetUsers: userId
		}
	}, {
		new: true
	});

	const userFrom = req.user._id;
	const userTo = post.postedBy._id;
	const entityId = post._id;
  
  if (userFrom.toString() != userTo.toString()) {
    if (op == '$push') 
      await Notification.addNotification(userTo, userFrom, 'retweet', entityId);
    else 
      await Notification.deleteNotification(userTo, userFrom, 'retweet', entityId);
  }

	res.status(200).json({
		status: 'success',
		data: {
			post,
			retweet: (op == '$push')
		}
	})
})

exports.getPost = catchAsync(async (req, res, next) => {
	const postId = req.params.id;
	const post = await Post.findById(postId);

	if (!post) {
    return next(new AppError('there is no posts with this ID', 404));
	}
	const replies = await Post.find({
		replyTo: postId
	});

	res.status(200).json({
		status: 'success',
		data: {
			post,
			replies
		}
	})
})

exports.deletePost = catchAsync(async (req, res, next) => {
	const post = await Post.findByIdAndDelete(req.params.id);

	if (!post) {
    return next(new AppError('there is no Post with this ID', 404));
	}

  if (post.replyTo && post.replyTo.postedBy._id.toString() != req.user._id.toString()) {
		const userFrom = req.user._id;
		const userTo = post.replyTo.postedBy._id;
		const entityId = post._id;
		await Notification.deleteNotification(userTo, userFrom, 'reply', entityId, true);
	} 

	res.status(203).json({
		status: 'success',
		data: {
			post
		}
	})
})

exports.pinPost = catchAsync(async (req, res, next) => {
	await Post.updateMany({}, {
		pinned: false
	});
	const post = await Post.findByIdAndUpdate(req.params.id, {
		pinned: true
	}, {
		new: true
	});

	res.status(200).json({
		status: 'success',
		data: {
			post
		}
	})
})

exports.unPinPost = catchAsync(async (req, res, next) => {
	const post = await Post.findByIdAndUpdate(req.params.id, {
		pinned: false
	}, {
		new: true
	});

	res.status(200).json({
		status: 'success',
		data: {
			post
		}
	})
})