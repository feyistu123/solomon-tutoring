const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['new_application', 'status_change', 'reply_sent'], required: true },
  message: { type: String, required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
