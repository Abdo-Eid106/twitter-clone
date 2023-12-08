const User = require("../models/userModel");
const Post = require(`${__dirname}/../models/postModel.js`);
const Notification = require(`${__dirname}/../models/notificationModel.js`);

const addNotification = async (userTo, userFrom, notificationType, entityId, add) => {
	if (userTo.toString() != userFrom.toString()) {
		if (add) {
			await Notification.addNotification(userTo , userFrom, notificationType, entityId);
		} else {
			await Notification.deleteNotification(userTo, userFrom, notificationType, entityId);
		}
	}
}
exports.addPost = async (req, res, next) => {
	const content = req.body.content;
	if (!content) {
		return res.status(400).json({
			status: 'failed',
			message: "the content can't be empty"
		})
	}
	req.body.postedBy = req.user._id;

	let post = await Post.create(req.body);
	post = await Post.findById(post._id);

	if (post.replyTo) {
		const userFrom = req.user._id;
		const userTo = post.replyTo.postedBy._id;
		const entityId = post._id;
		addNotification(userTo, userFrom, 'reply', entityId, true);
	}

	res.status(201).json({
		status: 'status',
		data: {
			post
		}
	})
}

exports.getPosts = async (req, res, next) => {
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
}
exports.postLike = async (req, res, next) => {
	const postId = req.params.id;
	const userId = req.user._id;
	let post = await Post.findById(postId);

	if (!post) {
		return res.status(404).json({
			status: 'failed',
			message: 'there is no post with this ID'
		})
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
	await addNotification(userTo, userFrom, 'postLike', entityId, !hasLike);

	res.status(200).json({
		status: 'success',
		data: {
			post,
			like: !hasLike
		}
	})
}

exports.postRetweet = async (req, res, next) => {
	const userId = req.user._id;
	const postId = req.params.id;

	let post = await Post.findById(postId);
	if (!post) {
		return res.status(404).json({
			status: 'failed',
			message: 'this id is not belonging to any post'
		})
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
	await addNotification(userTo, userFrom, 'retweet', entityId, (op == '$push'));

	res.status(200).json({
		status: 'success',
		data: {
			post,
			retweet: (op == '$push')
		}
	})
}

exports.getPost = async (req, res, next) => {
	const postId = req.params.id;
	const post = await Post.findById(postId);

	if (!post) {
		return res.status(404).json({
			status: 'failed',
			message: 'there is no posts with this ID'
		})
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
}

exports.deletePost = async (req, res, next) => {
	const deletedPost = await Post.findByIdAndDelete(req.params.id);

	if (!deletedPost) {
		return res.status(404).json({
			status: 'failed',
			message: 'there is no Post with this ID'
		})
	}

	res.status(203).json({
		status: 'success',
		data: {
			deletedPost
		}
	})
}

exports.pinPost = async (req, res, next) => {
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
}

exports.unPinPost = async (req, res, next) => {
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
}