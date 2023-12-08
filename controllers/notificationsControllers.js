const Notification = require(`${__dirname}/../models/notificationModel.js`);
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/AppError.js`);

exports.getNotifications = catchAsync(async (req, res, next) => {
  const searchObj = { 
    userTo: req.user._id,
    notificationType: { $ne: 'newMessage' }
  };
  if (req.query.unreadOnly == 'true') {
    searchObj.opened = false;
  }
  const notifications = await Notification.find(searchObj)
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: { 
      notifications
    }
  });
})

exports.markOne = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id,
    { opened: true },
    { new: true });
  
  if (!notification) {
    return next(new AppError('there is no notification with thisId', 404));
  }

  if (notification.userTo._id.toString() != req.user._id.toString()) {
    return next(new AppError('this notification is belongs to another user', 401));
  }
  
  return res.status(204).json({
    status: 'success'
  });
})

exports.markAll = catchAsync(async (req, res, next) => {
  await Notification.updateMany({ userTo: req.user._id }, { opened: true });

  res.status(204).json({
    status: 'success'
  });
})

exports.getLatestNotification = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ userTo: req.user._id })
    .sort('-createdAt')
    .limit(1);

  if (notifications.length == 0) {
    return next(new AppError('there are no notifications', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification: notifications[0]
    }
  });
  
})