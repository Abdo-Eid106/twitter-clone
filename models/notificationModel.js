const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notificationType: String,
  opened: {
    type: Boolean,
    default: false
  },
  entityId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});


notificationSchema.statics.addNotification = async(userTo, userFrom, notificationType, entityId) => {
  const data = { userFrom, userTo, notificationType, entityId };
  await Notification.deleteOne(data);
  return Notification.create(data);
}

notificationSchema.statics.deleteNotification = async(userTo, userFrom, notificationType, entityId) => {
  const data = { userFrom, userTo, notificationType, entityId };
  await Notification.deleteOne(data);
}

notificationSchema.pre(/^find/, function (next) {
  this.populate('userTo');
  this.populate('userFrom');
  next();
})

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;