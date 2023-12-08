const User = require(`${__dirname}/../models/userModel.js`);
const Notification = require(`${__dirname}/../models/notificationModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/AppError.js`);


exports.changeFollow = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  let user = await User.findById(userId);
  if (!user) {
    return next(new AppError('there is no User with this ID', 404));
  }

  const isFollow = user.followers.includes(req.user._id.toString());
  const op = (isFollow) ? '$pull' : '$push';

  user = await User.findByIdAndUpdate(userId, {
    [op]: {
      followers: req.user._id
    }
  }, {
    new: true
  });

  await User.findByIdAndUpdate(req.user._id, {
    [op]: {
      following: userId
    }
  }, {
    new: true
  });

  const userFrom = req.user._id;
  const userTo = req.params.id;

  if (!isFollow) 
    await Notification.addNotification(userTo, userFrom, 'follow', userFrom);
  else 
    await Notification.deleteNotification(userTo, userFrom, 'follow', userFrom);

  res.status(200).json({
    status: 'success',
    data: {
      user,
      follow: !isFollow
    }
  })
})

exports.uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('there is no file is uploaded', 400));
  }
  req.body.profilePic = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, req.body);
  return res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
})

exports.uploadCoverPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('there is no file is uploaded', 400));
  }
  req.body.coverPhoto = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user._id, req.body);
  return res.status(200).json({
    status: 'success',
    data: {
      user
    }
  })
})

exports.getUsers = catchAsync(async (req, res, next) => {
  let query = User.find();

  const search = req.query.search;
  if (search) {
    query = query.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' }},
        { lastName: { $regex: search, $options: 'i' }},
        { username: { $regex: search, $options: 'i' }}
      ]
    })
  }

  const users = await query;
  res.status(200).json({
    status: 'success',
    data: {
      users
    }
  })
})