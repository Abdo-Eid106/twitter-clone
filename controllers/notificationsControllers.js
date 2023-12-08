const Notification = require(`${__dirname}/../models/notificationModel.js`);

exports.getNotifications = async (req, res, next) => {
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
}

exports.markOne = async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id,
    { opened: true },
    { new: true });
  
  if (!notification) {
    res.status(404).json({
      status: 'failed',
      message: 'there is no notification with thisId'
    });
  }

  if (notification.userTo._id.toString() != req.user._id.toString()) {
    res.status(401).json({
      status: 'failed',
      message: 'this notification is belongs to another user'
    });
  }
  
  return res.status(204).json({
    status: 'success'
  });
}

exports.markAll = async (req, res, next) => {
  await Notification.updateMany({ userTo: req.user._id }, { opened: true });

  res.status(204).json({
    status: 'success'
  });
}

exports.getLatestNotification = async (req, res, next) => {
  const notifications = await Notification.find({ userTo: req.user._id })
    .sort('-createdAt')
    .limit(1);

  if (notifications.length == 0) {
    return res.status(404).json({
      status: 'not Found',
      message: 'there are no notifications'
    })
  };

  res.status(200).json({
    status: 'success',
    data: {
      notification: notifications[0]
    }
  });
  
}